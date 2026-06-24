import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { aiSettings } from "@/lib/db/schema";
import { encryptSecret, decryptSecret, keyHint } from "@/lib/crypto";

export type AiSettingsPublic = {
  provider: string;
  model: string;
  keyHint: string | null;
  configured: boolean;
};

/** Config pública (sem a chave). */
export async function getAiSettingsPublic(workspaceId: string): Promise<AiSettingsPublic | null> {
  const rows = await db
    .select({ provider: aiSettings.provider, model: aiSettings.model, keyHint: aiSettings.keyHint })
    .from(aiSettings)
    .where(eq(aiSettings.workspaceId, workspaceId))
    .limit(1);
  const s = rows[0];
  if (!s) return null;
  return { ...s, configured: true };
}

/** Config com a chave decriptada — uso interno no servidor (geração/teste). */
export async function getAiSettingsWithKey(workspaceId: string): Promise<{
  provider: string;
  model: string;
  apiKey: string;
} | null> {
  const rows = await db
    .select({ provider: aiSettings.provider, model: aiSettings.model, keyCipher: aiSettings.keyCipher })
    .from(aiSettings)
    .where(eq(aiSettings.workspaceId, workspaceId))
    .limit(1);
  const s = rows[0];
  if (!s) return null;
  return { provider: s.provider, model: s.model, apiKey: decryptSecret(s.keyCipher) };
}

/** Salva (upsert) a configuração de IA do workspace, criptografando a chave. */
export async function saveAiSettings(
  workspaceId: string,
  provider: string,
  model: string,
  apiKey: string,
) {
  const values = {
    workspaceId,
    provider,
    model,
    keyCipher: encryptSecret(apiKey),
    keyHint: keyHint(apiKey),
    updatedAt: new Date(),
  };
  await db
    .insert(aiSettings)
    .values(values)
    .onConflictDoUpdate({ target: aiSettings.workspaceId, set: values });
}
