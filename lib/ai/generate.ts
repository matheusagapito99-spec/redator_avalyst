import "server-only";
import { and, eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles, briefs, serpAnalyses, articleVersions, articleSources, aiRuns } from "@/lib/db/schema";
import { getAiSettingsWithKey } from "@/lib/data/ai-settings";
import { searchKnowledge } from "@/lib/data/knowledge";
import { callProvider, estimateCost } from "@/lib/ai/call-provider";

const SYSTEM = `Você é o redator-chefe da plataforma Redator, especialista em conteúdo de SEO para o mercado brasileiro de locação residencial e garantia locatícia.

PRINCÍPIOS INEGOCIÁVEIS (vencem qualquer outra instrução):
1. NUNCA invente dados. Estatística, número de mercado, preço ou dado jurídico só entram com fonte. Sem fonte, marque o trecho com [A VERIFICAR].
2. Só afirme sobre a empresa-cliente o que estiver no CONTEXTO DA BASE fornecido. Fora disso, marque [CONFIRMAR COM TIME].
3. Conformidade: respeite a Lei do Inquilinato, o CDC e a LGPD. NUNCA prometa aprovação garantida nem oriente a burlar análise de crédito.
4. Honestidade editorial: o título cumpre o que o corpo entrega.
5. Voz da marca: frases curtas, voz ativa, prosa direta, sem jargão. Fale com o leitor por "você". Traga exemplos concretos.

Você responde SOMENTE com um objeto JSON válido (sem markdown, sem cercas de código), no formato:
{
  "title": "H1 do artigo",
  "metaTitle": "título SEO (~60 caracteres)",
  "metaDescription": "meta description (~155 caracteres)",
  "slug": "slug-em-kebab-case",
  "blocks": [{ "type": "h2|h3|p|faq", "text": "..." }],
  "sources": [{ "kind": "doc|serp|verify", "ref": "nome da fonte", "excerpt": "trecho", "origin": "medido|observado|estimado|verificar" }],
  "verifyNotes": ["pontos marcados como [A VERIFICAR] ou [CONFIRMAR COM TIME]"]
}`;

function buildUserPrompt(args: {
  title: string;
  keyword: string | null;
  intent: string | null;
  funnel: string | null;
  persona: string | null;
  angle: string | null;
  competitors: { title: string; domain: string }[];
  gaps: string[];
  knowledge: { filename: string; snippet: string }[];
}): string {
  const funnelGuide: Record<string, string> = {
    topo: "Topo de funil: atrai e responde a dúvida do leitor com clareza. CTA leve, sem pressão comercial.",
    meio: "Meio de funil: educa e qualifica, compara opções. Ancore comparativos no contexto da base.",
    fundo: "Fundo de funil: trata da decisão de compra e leva à conversão, usando o contexto da base como embasamento.",
  };

  return `PAUTA
Título sugerido: ${args.title}
Palavra-chave-alvo: ${args.keyword ?? "—"}
Intenção de busca: ${args.intent ?? "—"}
Etapa do funil: ${args.funnel ?? "—"} — ${funnelGuide[args.funnel ?? ""] ?? ""}
Persona-alvo: ${args.persona ?? "—"}
Ângulo de diferenciação: ${args.angle ?? "—"}

SERP (concorrentes OBSERVADOS — supere em profundidade, não copie):
${args.competitors.length ? args.competitors.map((c, i) => `${i + 1}. ${c.title} (${c.domain})`).join("\n") : "Sem análise de SERP disponível."}
Lacunas observadas: ${args.gaps.join(" ") || "—"}

CONTEXTO DA BASE DE CONHECIMENTO (fonte autoritativa — só afirme sobre o cliente o que estiver aqui):
${args.knowledge.length ? args.knowledge.map((k) => `[${k.filename}] ${k.snippet}`).join("\n") : "A base não cobre este tema. Marque afirmações sobre o cliente como [CONFIRMAR COM TIME]."}

Escreva o artigo seguindo os princípios e o JSON especificado. Cubra uma lacuna real frente à SERP. Inclua um bloco de FAQ quando fizer sentido.`;
}

type ParsedArticle = {
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  blocks?: { type: string; text: string }[];
  sources?: { kind: string; ref: string; excerpt: string; origin: string }[];
  verifyNotes?: string[];
};

function parseJson(text: string): ParsedArticle {
  let t = text.trim();
  // Remove cercas de código eventuais.
  t = t.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start >= 0 && end > start) t = t.slice(start, end + 1);
  return JSON.parse(t) as ParsedArticle;
}

/** Gera o conteúdo de um artigo com a IA configurada no workspace. */
export async function generateArticle(workspaceId: string, articleId: string): Promise<void> {
  const settings = await getAiSettingsWithKey(workspaceId);
  if (!settings) throw new Error("Configure um provedor de IA em Configurações → IA antes de gerar.");

  const aRows = await db
    .select({ id: articles.id, title: articles.title, briefId: articles.briefId })
    .from(articles)
    .where(and(eq(articles.id, articleId), eq(articles.workspaceId, workspaceId)))
    .limit(1);
  const article = aRows[0];
  if (!article) throw new Error("Artigo não encontrado.");

  // Pauta + SERP
  let brief: { keyword: string | null; intent: string | null; funnel: string | null; persona: string | null; angle: string | null } = {
    keyword: null, intent: null, funnel: null, persona: null, angle: null,
  };
  let competitors: { title: string; domain: string }[] = [];
  let gaps: string[] = [];
  if (article.briefId) {
    const bRows = await db.select().from(briefs).where(eq(briefs.id, article.briefId)).limit(1);
    const b = bRows[0];
    if (b) brief = { keyword: b.targetKeyword, intent: b.intent, funnel: b.funnelStage, persona: b.persona, angle: b.angle };
    const sRows = await db
      .select()
      .from(serpAnalyses)
      .where(eq(serpAnalyses.briefId, article.briefId))
      .orderBy(desc(serpAnalyses.createdAt))
      .limit(1);
    if (sRows[0]) {
      competitors = ((sRows[0].competitors as { title: string; domain: string }[] | null) ?? []).slice(0, 8);
      gaps = (sRows[0].gaps as string[] | null) ?? [];
    }
  }

  // RAG por full-text (busca semântica vetorial entra quando houver embeddings).
  const hits = await searchKnowledge(workspaceId, brief.keyword || article.title);
  const knowledge = hits.slice(0, 6).map((h) => ({ filename: h.filename, snippet: h.snippet.replace(/<[^>]+>/g, "") }));

  const userPrompt = buildUserPrompt({ title: article.title, ...brief, competitors, gaps, knowledge });

  const started = Date.now();
  const result = await callProvider(settings.provider, settings.model, settings.apiKey, SYSTEM, userPrompt, {
    maxTokens: 4096,
    temperature: 0.5,
  });

  let parsed: ParsedArticle;
  try {
    parsed = parseJson(result.text);
  } catch {
    throw new Error("A IA respondeu em formato inesperado. Tente novamente.");
  }

  const cost = estimateCost(settings.provider, settings.model, result.inputTokens, result.outputTokens);

  // Persiste versão, fontes, ai_run e atualiza o artigo.
  await db.insert(articleVersions).values({
    articleId: article.id,
    workspaceId,
    content: parsed as Record<string, unknown>,
    author: "ai",
  });

  const sources = parsed.sources ?? [];
  const verifyAsSources = (parsed.verifyNotes ?? []).map((n) => ({ kind: "verify", ref: "verificação", excerpt: n, origin: "verificar" }));
  const allSources = [...sources, ...verifyAsSources];
  if (allSources.length) {
    await db.insert(articleSources).values(
      allSources.map((s) => ({
        articleId: article.id,
        workspaceId,
        kind: s.kind || "doc",
        ref: s.ref || null,
        excerpt: s.excerpt || null,
        origin: (["medido", "observado", "estimado", "verificar"].includes(s.origin) ? s.origin : "observado") as
          | "medido" | "observado" | "estimado" | "verificar",
      })),
    );
  }

  await db.insert(aiRuns).values({
    workspaceId,
    articleId: article.id,
    stage: "draft",
    model: settings.model,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    cost,
    status: "ok",
    latencyMs: Date.now() - started,
  });

  await db
    .update(articles)
    .set({
      status: "review",
      title: parsed.title || article.title,
      slug: parsed.slug || null,
      seo: { metaTitle: parsed.metaTitle, metaDescription: parsed.metaDescription } as Record<string, unknown>,
    })
    .where(eq(articles.id, article.id));
}
