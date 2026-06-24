import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { knowledgeDocs, knowledgeChunks } from "@/lib/db/schema";
import { extractText } from "./extract";
import { chunkText } from "./chunk";

type IngestInput = {
  workspaceId: string;
  category: "produto" | "comercial" | "casos" | "juridico" | "dados";
  filename: string;
  mime: string | null;
  buffer: Buffer;
};

/** Cria o doc, extrai texto, gera chunks e indexa. Define status indexed/error. */
export async function ingestDocument(input: IngestInput): Promise<{ docId: string; chunks: number }> {
  const [doc] = await db
    .insert(knowledgeDocs)
    .values({
      workspaceId: input.workspaceId,
      category: input.category,
      filename: input.filename,
      mime: input.mime,
      status: "processing",
    })
    .returning({ id: knowledgeDocs.id });

  try {
    const text = await extractText(input.filename, input.mime, input.buffer);
    const chunks = chunkText(text);

    if (chunks.length > 0) {
      await db.insert(knowledgeChunks).values(
        chunks.map((content, i) => ({
          workspaceId: input.workspaceId,
          docId: doc.id,
          chunkIndex: i,
          content,
          tokens: Math.ceil(content.length / 4),
        })),
      );
    }

    await db
      .update(knowledgeDocs)
      .set({ status: chunks.length > 0 ? "indexed" : "error" })
      .where(eq(knowledgeDocs.id, doc.id));

    return { docId: doc.id, chunks: chunks.length };
  } catch (err) {
    await db.update(knowledgeDocs).set({ status: "error" }).where(eq(knowledgeDocs.id, doc.id));
    throw err;
  }
}
