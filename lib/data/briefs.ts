import "server-only";
import { and, eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { briefs, serpAnalyses } from "@/lib/db/schema";

export const FUNNEL_LABEL: Record<string, string> = {
  topo: "Topo",
  meio: "Meio",
  fundo: "Fundo",
};

export const INTENTS = ["informacional", "comparacao", "transacional"] as const;
export const PERSONAS = [
  "Diretor de locação escalável",
  "Dono de imobiliária regional",
  "Gestora de operações modernas",
  "Inquilino / proprietário (PF)",
] as const;

export type FilterLevel = "baixo" | "medio" | "alto";
const LEVEL_VALUE: Record<FilterLevel, number> = { baixo: 1, medio: 2, alto: 3 };

export type BriefFilters = {
  trafego: FilterLevel;
  negocio: FilterLevel;
  conversao: FilterLevel;
};

/**
 * Score de prioridade (0–10). Negócio e conversão pesam mais que tráfego puro,
 * refletindo o princípio "tráfego que gera receita" (docs/08, seção 8).
 */
export function computeScore(f: BriefFilters): number {
  const raw =
    LEVEL_VALUE[f.trafego] * 1 +
    LEVEL_VALUE[f.negocio] * 1.5 +
    LEVEL_VALUE[f.conversao] * 1.5;
  // raw varia de 4 (todos baixo) a 12 (todos alto) -> normaliza para 0–10.
  return Number((((raw - 4) / 8) * 10).toFixed(1));
}

export type BriefRow = {
  id: string;
  title: string;
  targetKeyword: string | null;
  intent: string | null;
  funnelStage: string | null;
  persona: string | null;
  angle: string | null;
  filters: BriefFilters | null;
  score: number | null;
  status: string;
  createdAt: Date;
};

export async function listBriefs(workspaceId: string, funnel?: string): Promise<BriefRow[]> {
  const rows = await db
    .select({
      id: briefs.id,
      title: briefs.title,
      targetKeyword: briefs.targetKeyword,
      intent: briefs.intent,
      funnelStage: briefs.funnelStage,
      persona: briefs.persona,
      angle: briefs.angle,
      filters: briefs.filters,
      score: briefs.score,
      status: briefs.status,
      createdAt: briefs.createdAt,
    })
    .from(briefs)
    .where(
      and(
        eq(briefs.workspaceId, workspaceId),
        funnel ? eq(briefs.funnelStage, funnel as "topo" | "meio" | "fundo") : undefined,
      ),
    )
    .orderBy(desc(briefs.score), desc(briefs.createdAt));
  return rows as BriefRow[];
}

export async function getBrief(workspaceId: string, id: string) {
  const rows = await db
    .select()
    .from(briefs)
    .where(and(eq(briefs.id, id), eq(briefs.workspaceId, workspaceId)))
    .limit(1);
  const brief = rows[0];
  if (!brief) return null;

  const serps = await db
    .select()
    .from(serpAnalyses)
    .where(and(eq(serpAnalyses.briefId, id), eq(serpAnalyses.workspaceId, workspaceId)))
    .orderBy(desc(serpAnalyses.createdAt))
    .limit(1);

  return { brief, serp: serps[0] ?? null };
}
