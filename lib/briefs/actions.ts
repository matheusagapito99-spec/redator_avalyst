"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { briefs, serpAnalyses } from "@/lib/db/schema";
import { requireActiveWorkspace, ensureRole } from "@/lib/auth/guard";
import { computeScore, type BriefFilters } from "@/lib/data/briefs";
import { fetchSerp } from "@/lib/serp/fetch";
import { suggestBriefs } from "@/lib/ai/suggest-briefs";

export type BriefState = { error?: string } | null;
export type SuggestState = { ok?: number; error?: string } | null;

const level = z.enum(["baixo", "medio", "alto"]);
const briefSchema = z.object({
  title: z.string().min(3, "Dê um título à pauta."),
  targetKeyword: z.string().min(2, "Informe a palavra-chave-alvo."),
  intent: z.enum(["informacional", "comparacao", "transacional"]),
  funnelStage: z.enum(["topo", "meio", "fundo"]),
  persona: z.string().min(2, "Selecione a persona."),
  angle: z.string().optional(),
  trafego: level,
  negocio: level,
  conversao: level,
});

export async function createBriefAction(_prev: BriefState, formData: FormData): Promise<BriefState> {
  const { user, ws } = await requireActiveWorkspace();
  try {
    ensureRole(ws.role, "contributor");
  } catch {
    return { error: "Você não tem permissão para criar pautas." };
  }

  const parsed = briefSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;
  const filters: BriefFilters = { trafego: d.trafego, negocio: d.negocio, conversao: d.conversao };

  const [brief] = await db
    .insert(briefs)
    .values({
      workspaceId: ws.id,
      mode: "unica",
      title: d.title,
      targetKeyword: d.targetKeyword,
      intent: d.intent,
      funnelStage: d.funnelStage,
      persona: d.persona,
      angle: d.angle || null,
      filters,
      score: computeScore(filters),
      status: "backlog",
      createdBy: user.id,
    })
    .returning({ id: briefs.id });

  redirect(`/app/pautas/${brief.id}`);
}

/** Gera pautas com IA embasadas na base e salva como "sugerida" para aprovação. */
export async function suggestBriefsAction(_prev: SuggestState, _formData: FormData): Promise<SuggestState> {
  const { user, ws } = await requireActiveWorkspace();
  try {
    ensureRole(ws.role, "contributor");
  } catch {
    return { error: "Você não tem permissão para gerar pautas." };
  }

  try {
    const suggestions = await suggestBriefs(ws.id, 5);
    if (suggestions.length === 0) return { error: "A IA não retornou pautas. Tente novamente." };

    await db.insert(briefs).values(
      suggestions.map((s) => ({
        workspaceId: ws.id,
        mode: "planejamento" as const,
        title: s.title,
        targetKeyword: s.targetKeyword,
        intent: s.intent,
        funnelStage: s.funnelStage,
        persona: s.persona,
        angle: s.angle || null,
        filters: s.filters,
        score: computeScore(s.filters),
        status: "suggested",
        createdBy: user.id,
      })),
    );
    revalidatePath("/app/pautas");
    return { ok: suggestions.length };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Falha ao sugerir pautas." };
  }
}

/** Aprova uma pauta sugerida (suggested -> backlog). */
export async function approveBriefAction(formData: FormData) {
  const { ws } = await requireActiveWorkspace();
  ensureRole(ws.role, "contributor");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db
    .update(briefs)
    .set({ status: "backlog" })
    .where(and(eq(briefs.id, id), eq(briefs.workspaceId, ws.id)));
  revalidatePath("/app/pautas");
}

export async function deleteBriefAction(formData: FormData) {
  const { ws } = await requireActiveWorkspace();
  ensureRole(ws.role, "editor");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.delete(briefs).where(and(eq(briefs.id, id), eq(briefs.workspaceId, ws.id)));
  revalidatePath("/app/pautas");
}

export async function runSerpAnalysisAction(formData: FormData) {
  const { ws } = await requireActiveWorkspace();
  ensureRole(ws.role, "contributor");
  const briefId = String(formData.get("briefId") ?? "");

  const rows = await db
    .select({ id: briefs.id, keyword: briefs.targetKeyword })
    .from(briefs)
    .where(and(eq(briefs.id, briefId), eq(briefs.workspaceId, ws.id)))
    .limit(1);
  const brief = rows[0];
  if (!brief?.keyword) return;

  const { results, ok } = await fetchSerp(brief.keyword, 10);

  const domains = [...new Set(results.map((r) => r.domain).filter(Boolean))];
  const gaps = ok
    ? [
        `${results.length} concorrentes observados em ${domains.length} domínios distintos.`,
        "Lacunas de profundidade/FAQ por página exigem leitura detalhada (revisão humana).",
      ]
    : ["Análise de SERP indisponível nesta execução — marcada como pendente de verificação humana."];

  await db.insert(serpAnalyses).values({
    workspaceId: ws.id,
    briefId,
    keyword: brief.keyword,
    competitors: results,
    gaps,
    origin: "observado",
    analyzedCount: results.length,
  });

  revalidatePath(`/app/pautas/${briefId}`);
}
