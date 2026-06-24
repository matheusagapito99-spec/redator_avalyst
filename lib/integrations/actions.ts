"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireActiveWorkspace, ensureRole } from "@/lib/auth/guard";
import { saveWordpress, getWordpressConfig, setWordpressStatus } from "@/lib/data/integrations";
import { wpTestConnection } from "@/lib/wordpress/client";

export type IntegrationState = { ok?: boolean; error?: string } | null;

const schema = z.object({
  siteUrl: z.string().url("Informe a URL do site (https://…)."),
  username: z.string().min(2, "Informe o usuário do WordPress."),
  appPassword: z.string().min(8, "Cole a Application Password."),
});

export async function saveWordpressAction(_prev: IntegrationState, formData: FormData): Promise<IntegrationState> {
  const { ws } = await requireActiveWorkspace();
  try {
    ensureRole(ws.role, "admin");
  } catch {
    return { error: "Apenas Admin/Owner podem configurar integrações." };
  }

  const parsed = schema.safeParse({
    siteUrl: formData.get("siteUrl"),
    username: formData.get("username"),
    appPassword: formData.get("appPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const { siteUrl, username, appPassword } = parsed.data;
  // Testa antes de marcar como conectado.
  let connected = true;
  try {
    await wpTestConnection({ siteUrl, username, appPassword });
  } catch (e) {
    connected = false;
    await saveWordpress(ws.id, siteUrl, username, appPassword, false);
    revalidatePath("/app/integracoes");
    return { error: e instanceof Error ? e.message : "Falha ao conectar." };
  }

  await saveWordpress(ws.id, siteUrl, username, appPassword, connected);
  revalidatePath("/app/integracoes");
  return { ok: true };
}

export async function testWordpressAction(): Promise<IntegrationState> {
  const { ws } = await requireActiveWorkspace();
  const cfg = await getWordpressConfig(ws.id);
  if (!cfg) return { error: "Configure o WordPress primeiro." };
  try {
    await wpTestConnection(cfg);
    await setWordpressStatus(ws.id, true);
    revalidatePath("/app/integracoes");
    return { ok: true };
  } catch (e) {
    await setWordpressStatus(ws.id, false);
    return { error: e instanceof Error ? e.message : "Falha ao conectar." };
  }
}
