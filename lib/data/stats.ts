import "server-only";
import { and, eq, isNull, count, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles, knowledgeDocs, integrations } from "@/lib/db/schema";

export type WorkspaceStats = {
  docs: number;
  integrations: number;
  totalArticles: number;
  byStatus: Record<string, number>;
  approvedThisWeek: number;
  inReview: number;
};

export async function getWorkspaceStats(workspaceId: string): Promise<WorkspaceStats> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [docsRow] = await db
    .select({ c: count() })
    .from(knowledgeDocs)
    .where(and(eq(knowledgeDocs.workspaceId, workspaceId), isNull(knowledgeDocs.deletedAt)));

  const [intRow] = await db
    .select({ c: count() })
    .from(integrations)
    .where(and(eq(integrations.workspaceId, workspaceId), eq(integrations.status, "connected")));

  const statusRows = await db
    .select({ status: articles.status, c: count() })
    .from(articles)
    .where(and(eq(articles.workspaceId, workspaceId), isNull(articles.deletedAt)))
    .groupBy(articles.status);

  const byStatus: Record<string, number> = {
    backlog: 0,
    producing: 0,
    review: 0,
    approved: 0,
    published: 0,
  };
  let total = 0;
  for (const r of statusRows) {
    byStatus[r.status] = Number(r.c);
    total += Number(r.c);
  }

  const [approvedRow] = await db
    .select({ c: count() })
    .from(articles)
    .where(
      and(
        eq(articles.workspaceId, workspaceId),
        eq(articles.status, "approved"),
        gte(articles.createdAt, weekAgo),
      ),
    );

  return {
    docs: Number(docsRow?.c ?? 0),
    integrations: Number(intRow?.c ?? 0),
    totalArticles: total,
    byStatus,
    approvedThisWeek: Number(approvedRow?.c ?? 0),
    inReview: byStatus.review,
  };
}
