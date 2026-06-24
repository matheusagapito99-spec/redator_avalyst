import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { integrations } from "@/lib/db/schema";
import { encryptSecret, decryptSecret } from "@/lib/crypto";

export type WordpressPublic = {
  siteUrl: string;
  username: string;
  connected: boolean;
  lastSyncAt: Date | null;
};

export async function getWordpressPublic(workspaceId: string): Promise<WordpressPublic | null> {
  const rows = await db
    .select({ config: integrations.config, accountRef: integrations.accountRef, status: integrations.status, lastSyncAt: integrations.lastSyncAt })
    .from(integrations)
    .where(and(eq(integrations.workspaceId, workspaceId), eq(integrations.provider, "wordpress")))
    .limit(1);
  const r = rows[0];
  if (!r) return null;
  const cfg = (r.config as { siteUrl?: string } | null) ?? {};
  return {
    siteUrl: cfg.siteUrl ?? "",
    username: r.accountRef ?? "",
    connected: r.status === "connected",
    lastSyncAt: r.lastSyncAt,
  };
}

export async function getWordpressConfig(workspaceId: string): Promise<{
  siteUrl: string;
  username: string;
  appPassword: string;
} | null> {
  const rows = await db
    .select({ config: integrations.config, accountRef: integrations.accountRef, secretRef: integrations.secretRef })
    .from(integrations)
    .where(and(eq(integrations.workspaceId, workspaceId), eq(integrations.provider, "wordpress")))
    .limit(1);
  const r = rows[0];
  if (!r || !r.secretRef) return null;
  const cfg = (r.config as { siteUrl?: string } | null) ?? {};
  return {
    siteUrl: cfg.siteUrl ?? "",
    username: r.accountRef ?? "",
    appPassword: decryptSecret(r.secretRef),
  };
}

export async function saveWordpress(
  workspaceId: string,
  siteUrl: string,
  username: string,
  appPassword: string,
  connected: boolean,
) {
  const values = {
    workspaceId,
    provider: "wordpress" as const,
    status: connected ? "connected" : "error",
    accountRef: username,
    secretRef: encryptSecret(appPassword),
    config: { siteUrl } as Record<string, unknown>,
    lastSyncAt: connected ? new Date() : null,
  };
  await db
    .insert(integrations)
    .values(values)
    .onConflictDoUpdate({
      target: [integrations.workspaceId, integrations.provider],
      set: values,
    });
}

export async function setWordpressStatus(workspaceId: string, connected: boolean) {
  await db
    .update(integrations)
    .set({ status: connected ? "connected" : "error", lastSyncAt: connected ? new Date() : null })
    .where(and(eq(integrations.workspaceId, workspaceId), eq(integrations.provider, "wordpress")));
}
