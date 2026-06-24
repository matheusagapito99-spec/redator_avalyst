import "server-only";
import { and, eq, isNull, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles, briefs } from "@/lib/db/schema";
import type { ArticleCard, ArticleStatus } from "@/lib/data/article-constants";

export * from "@/lib/data/article-constants";

/** Lista artigos do workspace para o pipeline (com score/persona da pauta). */
export async function listArticlesForPipeline(workspaceId: string): Promise<ArticleCard[]> {
  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      funnelStage: articles.funnelStage,
      status: articles.status,
      createdAt: articles.createdAt,
      score: briefs.score,
      persona: briefs.persona,
    })
    .from(articles)
    .leftJoin(briefs, eq(articles.briefId, briefs.id))
    .where(and(eq(articles.workspaceId, workspaceId), isNull(articles.deletedAt)))
    .orderBy(desc(articles.createdAt));

  return rows.map((r) => ({
    ...r,
    status: r.status as ArticleStatus,
    createdAt: r.createdAt.toISOString(),
  }));
}
