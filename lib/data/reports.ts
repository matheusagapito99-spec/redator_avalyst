import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

function rowsOf<T>(result: unknown): T[] {
  return ((result as { rows?: T[] }).rows ?? []) as T[];
}

export type ReportData = {
  northStarThisWeek: number;
  northStarLastWeek: number;
  approvalRate: number; // 0–100
  auditsTotal: number;
  leadTimeDays: number | null;
  aiCost: number;
  aiTokens: number;
  aiRuns: number;
  weekly: { label: string; n: number }[];
  perArticle: {
    id: string;
    title: string;
    funnelStage: string | null;
    status: string;
    auditPassed: boolean | null;
    sources: number;
    cost: number;
  }[];
};

export async function getReportData(workspaceId: string): Promise<ReportData> {
  const now = new Date();
  const thisWeek = new Date(now.getTime() - 7 * 864e5);
  const lastWeek = new Date(now.getTime() - 14 * 864e5);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const eightWeeks = new Date(now.getTime() - 56 * 864e5);

  const ns = rowsOf<{ this_week: number; last_week: number }>(
    await db.execute(sql`
      SELECT
        count(DISTINCT article_id) FILTER (WHERE created_at >= ${thisWeek.toISOString()}) AS this_week,
        count(DISTINCT article_id) FILTER (WHERE created_at >= ${lastWeek.toISOString()} AND created_at < ${thisWeek.toISOString()}) AS last_week
      FROM audit_result
      WHERE workspace_id = ${workspaceId} AND passed = true
    `),
  )[0] ?? { this_week: 0, last_week: 0 };

  const ar = rowsOf<{ passed: number; total: number }>(
    await db.execute(sql`
      SELECT count(*) FILTER (WHERE passed) AS passed, count(*) AS total
      FROM audit_result WHERE workspace_id = ${workspaceId}
    `),
  )[0] ?? { passed: 0, total: 0 };

  const lt = rowsOf<{ days: number | null }>(
    await db.execute(sql`
      SELECT avg(extract(epoch FROM (fp.min_created - a.created_at)) / 86400) AS days
      FROM article a
      JOIN (
        SELECT article_id, min(created_at) AS min_created
        FROM audit_result WHERE workspace_id = ${workspaceId} AND passed GROUP BY article_id
      ) fp ON fp.article_id = a.id
      WHERE a.workspace_id = ${workspaceId}
    `),
  )[0] ?? { days: null };

  const cost = rowsOf<{ cost: number; tokens: number; runs: number }>(
    await db.execute(sql`
      SELECT coalesce(sum(cost), 0) AS cost,
             coalesce(sum(coalesce(input_tokens,0) + coalesce(output_tokens,0)), 0) AS tokens,
             count(*) AS runs
      FROM ai_run WHERE workspace_id = ${workspaceId} AND created_at >= ${monthStart.toISOString()}
    `),
  )[0] ?? { cost: 0, tokens: 0, runs: 0 };

  const weeklyRows = rowsOf<{ wk: string; n: number }>(
    await db.execute(sql`
      SELECT to_char(date_trunc('week', created_at), 'DD/MM') AS wk, count(DISTINCT article_id) AS n
      FROM audit_result
      WHERE workspace_id = ${workspaceId} AND passed AND created_at >= ${eightWeeks.toISOString()}
      GROUP BY date_trunc('week', created_at) ORDER BY date_trunc('week', created_at)
    `),
  );

  const perArticle = rowsOf<{
    id: string; title: string; funnel_stage: string | null; status: string;
    audit_passed: boolean | null; sources: number; cost: number;
  }>(
    await db.execute(sql`
      SELECT a.id, a.title, a.funnel_stage, a.status,
        (SELECT passed FROM audit_result ar WHERE ar.article_id = a.id ORDER BY created_at DESC LIMIT 1) AS audit_passed,
        (SELECT count(*) FROM article_source s WHERE s.article_id = a.id)::int AS sources,
        (SELECT coalesce(sum(cost),0) FROM ai_run r WHERE r.article_id = a.id) AS cost
      FROM article a
      WHERE a.workspace_id = ${workspaceId} AND a.deleted_at IS NULL
      ORDER BY a.created_at DESC LIMIT 50
    `),
  );

  return {
    northStarThisWeek: Number(ns.this_week),
    northStarLastWeek: Number(ns.last_week),
    approvalRate: Number(ar.total) > 0 ? Math.round((Number(ar.passed) / Number(ar.total)) * 100) : 0,
    auditsTotal: Number(ar.total),
    leadTimeDays: lt.days === null ? null : Number(lt.days),
    aiCost: Number(cost.cost),
    aiTokens: Number(cost.tokens),
    aiRuns: Number(cost.runs),
    weekly: weeklyRows.map((w) => ({ label: w.wk, n: Number(w.n) })),
    perArticle: perArticle.map((p) => ({
      id: p.id,
      title: p.title,
      funnelStage: p.funnel_stage,
      status: p.status,
      auditPassed: p.audit_passed,
      sources: Number(p.sources),
      cost: Number(p.cost),
    })),
  };
}
