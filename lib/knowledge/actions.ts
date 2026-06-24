"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { knowledgeDocs, knowledgeChunks } from "@/lib/db/schema";
import { requireActiveWorkspace, ensureRole } from "@/lib/auth/guard";
import { ingestDocument } from "@/lib/knowledge/ingest";
import { CATEGORIES, type Category } from "@/lib/data/knowledge";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB (limite prático do upload via server action)
const ALLOWED = ["pdf", "docx", "md", "txt", "csv"];

export type UploadState = { ok?: number; error?: string } | null;

export async function uploadDocumentsAction(
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const { ws } = await requireActiveWorkspace();
  try {
    ensureRole(ws.role, "contributor");
  } catch {
    return { error: "Você não tem permissão para adicionar documentos." };
  }

  const category = String(formData.get("category") ?? "produto") as Category;
  if (!CATEGORIES.includes(category)) return { error: "Categoria inválida." };

  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { error: "Selecione ao menos um arquivo." };

  let ok = 0;
  for (const file of files) {
    const ext = file.name.toLowerCase().split(".").pop() ?? "";
    if (!ALLOWED.includes(ext)) {
      return { error: `Formato não suportado: ${file.name}. Use PDF, DOCX, MD, TXT ou CSV.` };
    }
    if (file.size > MAX_BYTES) {
      return { error: `Arquivo muito grande: ${file.name} (máx. 4 MB).` };
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    await ingestDocument({ workspaceId: ws.id, category, filename: file.name, mime: file.type || null, buffer });
    ok++;
  }

  revalidatePath("/app/conhecimento");
  return { ok };
}

export async function deleteDocumentAction(formData: FormData) {
  const { ws } = await requireActiveWorkspace();
  ensureRole(ws.role, "editor");
  const docId = String(formData.get("docId") ?? "");
  if (!docId) return;

  // Escopo de tenant garantido pelo workspaceId na cláusula.
  await db
    .delete(knowledgeChunks)
    .where(and(eq(knowledgeChunks.docId, docId), eq(knowledgeChunks.workspaceId, ws.id)));
  await db
    .delete(knowledgeDocs)
    .where(and(eq(knowledgeDocs.id, docId), eq(knowledgeDocs.workspaceId, ws.id)));

  revalidatePath("/app/conhecimento");
}
