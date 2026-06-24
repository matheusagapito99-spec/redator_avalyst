"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireActiveWorkspace, ensureRole } from "@/lib/auth/guard";
import { saveAiSettings, getAiSettingsWithKey } from "@/lib/data/ai-settings";
import { callProvider } from "@/lib/ai/call-provider";
import { getProvider } from "@/lib/ai/provider-meta";
import { generateArticle } from "@/lib/ai/generate";

export type AiState = { ok?: boolean; error?: string } | null;

const schema = z.object({
  provider: z.enum(["gemini", "anthropic", "openai"]),
  model: z.string().min(2),
  apiKey: z.string().min(10, "Cole uma API key válida."),
});

export async function saveAiSettingsAction(_prev: AiState, formData: FormData): Promise<AiState> {
  const { ws } = await requireActiveWorkspace();
  try {
    ensureRole(ws.role, "admin");
  } catch {
    return { error: "Apenas Admin/Owner podem configurar a IA." };
  }

  const parsed = schema.safeParse({
    provider: formData.get("provider"),
    model: formData.get("model"),
    apiKey: formData.get("apiKey"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const meta = getProvider(parsed.data.provider);
  if (!meta || !meta.models.some((m) => m.id === parsed.data.model)) {
    return { error: "Modelo inválido para o provedor." };
  }

  await saveAiSettings(ws.id, parsed.data.provider, parsed.data.model, parsed.data.apiKey.trim());
  revalidatePath("/app/config/ia");
  return { ok: true };
}

export async function testAiConnectionAction(): Promise<AiState> {
  const { ws } = await requireActiveWorkspace();
  const settings = await getAiSettingsWithKey(ws.id);
  if (!settings) return { error: "Configure a IA primeiro." };
  try {
    const r = await callProvider(
      settings.provider,
      settings.model,
      settings.apiKey,
      "Responda apenas com JSON.",
      'Retorne {"ok": true}.',
      { maxTokens: 32, temperature: 0 },
    );
    return r.text.toLowerCase().includes("ok") || r.outputTokens > 0
      ? { ok: true }
      : { error: "Resposta vazia do provedor." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Falha ao conectar." };
  }
}

export async function generateArticleAction(_prev: AiState, formData: FormData): Promise<AiState> {
  const { ws } = await requireActiveWorkspace();
  try {
    ensureRole(ws.role, "contributor");
  } catch {
    return { error: "Você não tem permissão para gerar conteúdo." };
  }
  const articleId = String(formData.get("articleId") ?? "");
  try {
    await generateArticle(ws.id, articleId);
    revalidatePath(`/app/artigos/${articleId}`);
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Falha na geração." };
  }
}
