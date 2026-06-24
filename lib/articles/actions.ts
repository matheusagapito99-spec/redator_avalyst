"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles, briefs } from "@/lib/db/schema";
import { requireActiveWorkspace, ensureRole } from "@/lib/auth/guard";
import { ARTICLE_STATUSES, type ArticleStatus } from "@/lib/data/article-constants";

/** Promove uma pauta a artigo (status backlog). O conteúdo virá do motor de IA (S7). */
export async function createArticleFromBriefAction(formData: FormData) {
  const { ws } = await requireActiveWorkspace();
  ensureRole(ws.role, "contributor");
  const briefId = String(formData.get("briefId") ?? "");

  const rows = await db
    .select({ id: briefs.id, title: briefs.title, funnelStage: briefs.funnelStage })
    .from(briefs)
    .where(and(eq(briefs.id, briefId), eq(briefs.workspaceId, ws.id)))
    .limit(1);
  const brief = rows[0];
  if (!brief) return;

  await db.insert(articles).values({
    workspaceId: ws.id,
    briefId: brief.id,
    title: brief.title,
    funnelStage: brief.funnelStage,
    status: "backlog",
  });

  await db.update(briefs).set({ status: "em_producao" }).where(eq(briefs.id, brief.id));

  revalidatePath("/app/pipeline");
  redirect("/app/pipeline");
}

/** Move um artigo entre colunas do pipeline. */
export async function updateArticleStatusAction(formData: FormData) {
  const { ws } = await requireActiveWorkspace();
  ensureRole(ws.role, "contributor");
  const articleId = String(formData.get("articleId") ?? "");
  const status = String(formData.get("status") ?? "") as ArticleStatus;
  if (!ARTICLE_STATUSES.includes(status)) return;

  await db
    .update(articles)
    .set({ status })
    .where(and(eq(articles.id, articleId), eq(articles.workspaceId, ws.id)));

  revalidatePath("/app/pipeline");
}

export async function deleteArticleAction(formData: FormData) {
  const { ws } = await requireActiveWorkspace();
  ensureRole(ws.role, "editor");
  const articleId = String(formData.get("articleId") ?? "");
  if (!articleId) return;
  await db
    .update(articles)
    .set({ deletedAt: new Date() })
    .where(and(eq(articles.id, articleId), eq(articles.workspaceId, ws.id)));
  revalidatePath("/app/pipeline");
}
