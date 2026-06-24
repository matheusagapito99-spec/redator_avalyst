"use server";

import { revalidatePath } from "next/cache";
import { and, eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles, articleVersions, publications } from "@/lib/db/schema";
import { requireActiveWorkspace, ensureRole } from "@/lib/auth/guard";
import { getWordpressConfig } from "@/lib/data/integrations";
import { wpCreateDraft } from "@/lib/wordpress/client";
import { toHtml, toMarkdown, type Content } from "@/lib/publishing/format";

export type PublishState = { ok?: boolean; error?: string; url?: string } | null;

async function loadContent(workspaceId: string, articleId: string) {
  const aRows = await db
    .select({ id: articles.id, status: articles.status, slug: articles.slug, title: articles.title, seo: articles.seo })
    .from(articles)
    .where(and(eq(articles.id, articleId), eq(articles.workspaceId, workspaceId)))
    .limit(1);
  const article = aRows[0];
  if (!article) return null;
  const vRows = await db
    .select({ content: articleVersions.content })
    .from(articleVersions)
    .where(eq(articleVersions.articleId, articleId))
    .orderBy(desc(articleVersions.createdAt))
    .limit(1);
  return { article, content: (vRows[0]?.content as Content | undefined) ?? null };
}

/** Envia o artigo aprovado ao WordPress como RASCUNHO. Nunca publica ao ar. */
export async function publishToWordpressAction(_prev: PublishState, formData: FormData): Promise<PublishState> {
  const { ws } = await requireActiveWorkspace();
  try {
    ensureRole(ws.role, "admin");
  } catch {
    return { error: "Apenas Admin/Owner podem publicar." };
  }
  const articleId = String(formData.get("articleId") ?? "");

  const data = await loadContent(ws.id, articleId);
  if (!data) return { error: "Artigo não encontrado." };
  if (data.article.status !== "approved" && data.article.status !== "published") {
    return { error: "Só artigos aprovados podem ser enviados ao CMS." };
  }
  if (!data.content) return { error: "Gere o conteúdo antes de publicar." };

  const cfg = await getWordpressConfig(ws.id);
  if (!cfg) return { error: "Conecte o WordPress em Integrações antes de publicar." };

  const seo = (data.article.seo as { metaTitle?: string; metaDescription?: string } | null) ?? {};
  const html = toHtml(data.content);
  try {
    const draft = await wpCreateDraft(cfg, {
      title: data.content.title ?? data.article.title,
      html,
      slug: data.article.slug ?? data.content.slug ?? undefined,
      excerpt: seo.metaDescription,
    });
    await db.insert(publications).values({
      articleId,
      workspaceId: ws.id,
      target: "wordpress",
      externalId: String(draft.id),
      externalUrl: draft.editLink || draft.link,
      status: "draft",
      payload: { link: draft.link } as Record<string, unknown>,
    });
    await db.update(articles).set({ status: "published" }).where(eq(articles.id, articleId));
    revalidatePath(`/app/artigos/${articleId}`);
    return { ok: true, url: draft.editLink || draft.link };
  } catch (e) {
    await db.insert(publications).values({
      articleId,
      workspaceId: ws.id,
      target: "wordpress",
      status: "error",
      payload: { error: e instanceof Error ? e.message : "erro" } as Record<string, unknown>,
    });
    revalidatePath(`/app/artigos/${articleId}`);
    return { error: e instanceof Error ? e.message : "Falha ao publicar." };
  }
}

/** Exporta o artigo como Markdown ou HTML (fallback sem CMS). */
export async function exportArticleAction(
  articleId: string,
  format: "md" | "html",
): Promise<{ filename: string; data: string } | { error: string }> {
  const { ws } = await requireActiveWorkspace();
  const data = await loadContent(ws.id, articleId);
  if (!data) return { error: "Artigo não encontrado." };
  if (!data.content) return { error: "Sem conteúdo para exportar." };
  const slug = data.article.slug ?? data.content.slug ?? "artigo";
  if (format === "md") return { filename: `${slug}.md`, data: toMarkdown(data.content) };
  return { filename: `${slug}.html`, data: toHtml(data.content, true) };
}
