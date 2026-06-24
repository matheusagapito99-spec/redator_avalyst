import "server-only";
import { and, eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditResults } from "@/lib/db/schema";
import type { AuditOutcome } from "@/lib/audit/run";

export async function getLatestAudit(workspaceId: string, articleId: string): Promise<AuditOutcome | null> {
  const rows = await db
    .select({ mandatory: auditResults.mandatory, dimensions: auditResults.dimensions, passed: auditResults.passed })
    .from(auditResults)
    .where(and(eq(auditResults.articleId, articleId), eq(auditResults.workspaceId, workspaceId)))
    .orderBy(desc(auditResults.createdAt))
    .limit(1);
  const r = rows[0];
  if (!r) return null;
  return {
    mandatory: (r.mandatory as unknown as AuditOutcome["mandatory"]) ?? [],
    dimensions: (r.dimensions as unknown as AuditOutcome["dimensions"]) ?? [],
    passed: r.passed,
  };
}

export async function saveAudit(workspaceId: string, articleId: string, outcome: AuditOutcome) {
  await db.insert(auditResults).values({
    workspaceId,
    articleId,
    mandatory: outcome.mandatory as unknown[],
    dimensions: outcome.dimensions as unknown as Record<string, unknown>,
    passed: outcome.passed,
  });
}
