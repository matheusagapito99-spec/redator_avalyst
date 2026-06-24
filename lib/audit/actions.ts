"use server";

import { revalidatePath } from "next/cache";
import { and, eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles, articleVersions, articleSources } from "@/lib/db/schema";
import { requireActiveWorkspace, ensureRole } from "@/lib/auth/guard";
import { computeAudit } from "@/lib/audit/run";
import { saveAudit, getLatestAudit } from "@/lib/data/audit";
import type { ArticleContent } from "@/lib/data/article-detail";

export type AuditState = { ok?: boolean; error?: string } | null;

/** Roda a auditoria por regras sobre a última versão do artigo. */
export async function runAuditAction(_prev: AuditState, formData: FormData): Promise<AuditState> {
  const { ws } = await requireActiveWorkspace();
  ensureRole(ws.role, "editor");
  const articleId = String(formData.get("articleId") ?? "");

  const aRows = await db
    .select({ funnelStage: articles.funnelStage, briefId: articles.briefId })
    .from(articles)
    .where(and(eq(articles.id, articleId), eq(articles.workspaceId, ws.id)))
    .limit(1);
  const article = aRows[0];
  if (!article) return { error: "Artigo não encontrado." };

  const vRows = await db
    .select({ content: articleVersions.content })
    .from(articleVersions)
    .where(eq(articleVersions.articleId, articleId))
    .orderBy(desc(articleVersions.createdAt))
    .limit(1);
  const content = (vRows[0]?.content as ArticleContent | undefined) ?? null;
  if (!content) return { error: "Gere o conteúdo antes de auditar." };

  const sources = await db
    .select({ kind: articleSources.kind, origin: articleSources.origin })
    .from(articleSources)
    .where(eq(articleSources.articleId, articleId));

  let keyword: string | null = null;
  if (article.briefId) {
    const { briefs } = await import("@/lib/db/schema");
    const bRows = await db
      .select({ kw: briefs.targetKeyword })
      .from(briefs)
      .where(eq(briefs.id, article.briefId))
      .limit(1);
    keyword = bRows[0]?.kw ?? null;
  }

  const outcome = computeAudit(content, sources, article.funnelStage, keyword);
  await saveAudit(ws.id, articleId, outcome);
  revalidatePath(`/app/artigos/${articleId}`);
  return { ok: true };
}

/** Aprova o artigo — só passa se a auditoria mais recente foi aprovada (gate). */
export async function approveArticleAction(_prev: AuditState, formData: FormData): Promise<AuditState> {
  const { ws } = await requireActiveWorkspace();
  ensureRole(ws.role, "editor");
  const articleId = String(formData.get("articleId") ?? "");

  const audit = await getLatestAudit(ws.id, articleId);
  if (!audit) return { error: "Rode a auditoria antes de aprovar." };
  if (!audit.passed) {
    return { error: "Auditoria reprovada: resolva os itens obrigatórios e dimensões abaixo de 8." };
  }

  await db
    .update(articles)
    .set({ status: "approved" })
    .where(and(eq(articles.id, articleId), eq(articles.workspaceId, ws.id)));
  revalidatePath(`/app/artigos/${articleId}`);
  return { ok: true };
}

/** Devolve o artigo para ajuste (volta para produção). */
export async function returnArticleAction(_prev: AuditState, formData: FormData): Promise<AuditState> {
  const { ws } = await requireActiveWorkspace();
  ensureRole(ws.role, "editor");
  const articleId = String(formData.get("articleId") ?? "");
  await db
    .update(articles)
    .set({ status: "producing" })
    .where(and(eq(articles.id, articleId), eq(articles.workspaceId, ws.id)));
  revalidatePath(`/app/artigos/${articleId}`);
  return { ok: true };
}
