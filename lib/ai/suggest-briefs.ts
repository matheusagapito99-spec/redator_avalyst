import "server-only";
import { getAiSettingsWithKey } from "@/lib/data/ai-settings";
import { getKnowledgeSample } from "@/lib/data/knowledge";
import { callProvider } from "@/lib/ai/call-provider";
import type { BriefFilters, FilterLevel } from "@/lib/data/briefs";

export type SuggestedBrief = {
  title: string;
  targetKeyword: string;
  intent: "informacional" | "comparacao" | "transacional";
  funnelStage: "topo" | "meio" | "fundo";
  persona: string;
  angle: string;
  filters: BriefFilters;
};

const SYSTEM = `Você é estrategista de conteúdo e SEO do mercado brasileiro de locação residencial e garantia locatícia.
Sugira pautas de artigos que gerem tráfego QUALIFICADO e conexão comercial — priorize tráfego que vira receita.
Regras:
- Embase as pautas no CONTEXTO DA BASE de conhecimento fornecido. Não invente fatos.
- Distribua entre as etapas do funil (topo atrai, meio qualifica, fundo converte).
- Para cada pauta, estime os 3 filtros (trafego, negocio, conversao) como "baixo", "medio" ou "alto".
- Personas possíveis: "Diretor de locação escalável", "Dono de imobiliária regional", "Gestora de operações modernas", "Inquilino / proprietário (PF)".
Responda APENAS com um array JSON (sem markdown), no formato:
[{ "title": "...", "targetKeyword": "...", "intent": "informacional|comparacao|transacional", "funnelStage": "topo|meio|fundo", "persona": "...", "angle": "...", "filters": { "trafego": "baixo|medio|alto", "negocio": "...", "conversao": "..." } }]`;

const LEVELS: FilterLevel[] = ["baixo", "medio", "alto"];

function normLevel(v: unknown): FilterLevel {
  return LEVELS.includes(v as FilterLevel) ? (v as FilterLevel) : "medio";
}

function parseArray(text: string): unknown[] {
  let t = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const start = t.indexOf("[");
  const end = t.lastIndexOf("]");
  if (start >= 0 && end > start) t = t.slice(start, end + 1);
  const parsed = JSON.parse(t);
  return Array.isArray(parsed) ? parsed : [];
}

export async function suggestBriefs(workspaceId: string, count = 5): Promise<SuggestedBrief[]> {
  const settings = await getAiSettingsWithKey(workspaceId);
  if (!settings) throw new Error("Configure um provedor de IA em Configurações → IA antes de sugerir pautas.");

  const sample = await getKnowledgeSample(workspaceId, 18);
  const context = sample.length
    ? sample.map((s) => `[${s.category}/${s.filename}] ${s.content.slice(0, 400)}`).join("\n\n")
    : "A base de conhecimento está vazia. Sugira pautas gerais do mercado de garantia locatícia e marque-as para validação humana.";

  const user = `CONTEXTO DA BASE DE CONHECIMENTO:\n${context}\n\nSugira ${count} pautas seguindo o formato JSON.`;

  const r = await callProvider(settings.provider, settings.model, settings.apiKey, SYSTEM, user, {
    maxTokens: 2048,
    temperature: 0.7,
  });

  const raw = parseArray(r.text);
  const out: SuggestedBrief[] = [];
  for (const item of raw) {
    const o = item as Record<string, unknown>;
    if (!o.title || !o.targetKeyword) continue;
    const f = (o.filters ?? {}) as Record<string, unknown>;
    out.push({
      title: String(o.title),
      targetKeyword: String(o.targetKeyword),
      intent: (["informacional", "comparacao", "transacional"].includes(o.intent as string) ? o.intent : "informacional") as SuggestedBrief["intent"],
      funnelStage: (["topo", "meio", "fundo"].includes(o.funnelStage as string) ? o.funnelStage : "topo") as SuggestedBrief["funnelStage"],
      persona: String(o.persona ?? "Inquilino / proprietário (PF)"),
      angle: String(o.angle ?? ""),
      filters: { trafego: normLevel(f.trafego), negocio: normLevel(f.negocio), conversao: normLevel(f.conversao) },
    });
  }
  return out;
}
