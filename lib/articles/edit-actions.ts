"use server";

import { revalidatePath } from "next/cache";
import { and, eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles, articleVersions } from "@/lib/db/schema";
import { requireActiveWorkspace, ensureRole } from "@/lib/auth/guard";
import { getAiSettingsWithKey } from "@/lib/data/ai-settings";
import { callProvider } from "@/lib/ai/call-provider";
import type { ArticleContent } from "@/lib/data/article-detail";

export type EditState = { ok?: boolean; error?: string } | null;

/** Salva o conteúdo editado como nova versão (autor humano). */
export async function saveArticleContentAction(
  articleId: string,
  content: ArticleContent,
): Promise<EditState> {
  const { user, ws } = await requireActiveWorkspace();
  try {
    ensureRole(ws.role, "editor");
  } catch {
    return { error: "Você não tem permissão para editar." };
  }

  const aRows = await db
    .select({ id: articles.id })
    .from(articles)
    .where(and(eq(articles.id, articleId), eq(articles.workspaceId, ws.id)))
    .limit(1);
  if (!aRows[0]) return { error: "Artigo não encontrado." };

  // Preserva metaTitle/metaDescription da última versão se não vierem.
  const last = await db
    .select({ content: articleVersions.content })
    .from(articleVersions)
    .where(eq(articleVersions.articleId, articleId))
    .orderBy(desc(articleVersions.createdAt))
    .limit(1);
  const prev = (last[0]?.content as ArticleContent | undefined) ?? {};

  const merged: ArticleContent = {
    title: content.title || prev.title,
    metaTitle: content.metaTitle ?? prev.metaTitle,
    metaDescription: content.metaDescription ?? prev.metaDescription,
    slug: content.slug ?? prev.slug,
    blocks: content.blocks ?? [],
  };

  await db.insert(articleVersions).values({
    articleId,
    workspaceId: ws.id,
    content: merged as Record<string, unknown>,
    author: "human",
    createdBy: user.id,
  });

  if (merged.title) {
    await db.update(articles).set({ title: merged.title }).where(eq(articles.id, articleId));
  }

  revalidatePath(`/app/artigos/${articleId}`);
  return { ok: true };
}

const INSTRUCTIONS: Record<string, string> = {
  rewrite: "Reescreva o trecho com mais clareza, mantendo o sentido e a voz da marca (frases curtas, voz ativa, sem jargão).",
  shorten: "Encurte o trecho, mantendo a informação essencial e a clareza.",
  expand: "Expanda o trecho com mais detalhe útil e exemplos concretos, sem inventar dados nem números sem fonte.",
  tone: "Ajuste o tom para profissional, direto e confiável, falando com o leitor por 'você'.",
};

/** Sugestão de IA sobre um trecho selecionado. Usa o provedor configurado no workspace. */
export async function aiEditAction(
  text: string,
  mode: keyof typeof INSTRUCTIONS,
): Promise<{ text?: string; error?: string }> {
  const { ws } = await requireActiveWorkspace();
  const settings = await getAiSettingsWithKey(ws.id);
  if (!settings) return { error: "Configure a IA em Configurações → IA." };
  if (!text.trim()) return { error: "Selecione um trecho primeiro." };

  const instruction = INSTRUCTIONS[mode] ?? INSTRUCTIONS.rewrite;
  try {
    const r = await callProvider(
      settings.provider,
      settings.model,
      settings.apiKey,
      "Você é um editor de conteúdo. Responda APENAS com o texto reescrito, sem aspas, sem comentários, sem markdown.",
      `${instruction}\n\nTrecho:\n${text}`,
      { maxTokens: 1024, temperature: 0.6 },
    );
    const out = r.text.trim();
    return out ? { text: out } : { error: "Resposta vazia do provedor." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Falha na sugestão de IA." };
  }
}
