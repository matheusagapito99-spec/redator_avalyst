import "server-only";
import { and, eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles, articleVersions, articleSources, aiRuns, publications } from "@/lib/db/schema";

export async function getLatestPublication(workspaceId: string, articleId: string) {
  const rows = await db
    .select({ status: publications.status, externalUrl: publications.externalUrl })
    .from(publications)
    .where(and(eq(publications.articleId, articleId), eq(publications.workspaceId, workspaceId)))
    .orderBy(desc(publications.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

export type ArticleBlock = { type: string; text: string };
export type ArticleContent = {
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  blocks?: ArticleBlock[];
};

export async function getArticleDetail(workspaceId: string, id: string) {
  const aRows = await db
    .select()
    .from(articles)
    .where(and(eq(articles.id, id), eq(articles.workspaceId, workspaceId)))
    .limit(1);
  const article = aRows[0];
  if (!article) return null;

  const vRows = await db
    .select({ content: articleVersions.content, createdAt: articleVersions.createdAt })
    .from(articleVersions)
    .where(eq(articleVersions.articleId, id))
    .orderBy(desc(articleVersions.createdAt))
    .limit(1);

  const sources = await db
    .select({ kind: articleSources.kind, ref: articleSources.ref, excerpt: articleSources.excerpt, origin: articleSources.origin })
    .from(articleSources)
    .where(eq(articleSources.articleId, id));

  const runRows = await db
    .select({ model: aiRuns.model, inputTokens: aiRuns.inputTokens, outputTokens: aiRuns.outputTokens, cost: aiRuns.cost, latencyMs: aiRuns.latencyMs, createdAt: aiRuns.createdAt })
    .from(aiRuns)
    .where(eq(aiRuns.articleId, id))
    .orderBy(desc(aiRuns.createdAt))
    .limit(1);

  return {
    article,
    content: (vRows[0]?.content as ArticleContent | undefined) ?? null,
    sources,
    run: runRows[0] ?? null,
  };
}
