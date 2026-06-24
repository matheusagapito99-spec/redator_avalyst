import "server-only";
import { and, eq, isNull, sql, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { knowledgeDocs, knowledgeChunks } from "@/lib/db/schema";

export const CATEGORIES = ["produto", "comercial", "casos", "juridico", "dados"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABEL: Record<Category, string> = {
  produto: "Produto",
  comercial: "Comercial",
  casos: "Casos",
  juridico: "Jurídico",
  dados: "Dados",
};

export type DocRow = {
  id: string;
  filename: string;
  category: Category;
  mime: string | null;
  status: string;
  chunks: number;
  createdAt: Date;
};

/** Lista documentos do workspace (com contagem de chunks), opcionalmente por categoria. */
export async function listDocs(workspaceId: string, category?: Category): Promise<DocRow[]> {
  const rows = await db
    .select({
      id: knowledgeDocs.id,
      filename: knowledgeDocs.filename,
      category: knowledgeDocs.category,
      mime: knowledgeDocs.mime,
      status: knowledgeDocs.status,
      createdAt: knowledgeDocs.createdAt,
      chunks: sql<number>`count(${knowledgeChunks.id})`,
    })
    .from(knowledgeDocs)
    .leftJoin(knowledgeChunks, eq(knowledgeChunks.docId, knowledgeDocs.id))
    .where(
      and(
        eq(knowledgeDocs.workspaceId, workspaceId),
        isNull(knowledgeDocs.deletedAt),
        category ? eq(knowledgeDocs.category, category) : undefined,
      ),
    )
    .groupBy(knowledgeDocs.id)
    .orderBy(desc(knowledgeDocs.createdAt));

  return rows.map((r) => ({ ...r, chunks: Number(r.chunks) })) as DocRow[];
}

/** Cobertura: quantos documentos por categoria. */
export async function getCoverage(workspaceId: string): Promise<Record<Category, number>> {
  const rows = await db
    .select({ category: knowledgeDocs.category, c: sql<number>`count(*)` })
    .from(knowledgeDocs)
    .where(and(eq(knowledgeDocs.workspaceId, workspaceId), isNull(knowledgeDocs.deletedAt)))
    .groupBy(knowledgeDocs.category);

  const coverage = { produto: 0, comercial: 0, casos: 0, juridico: 0, dados: 0 } as Record<Category, number>;
  for (const r of rows) coverage[r.category as Category] = Number(r.c);
  return coverage;
}

export type SearchHit = {
  docId: string;
  filename: string;
  category: string;
  snippet: string;
  rank: number;
};

/** Busca full-text (português) nos chunks. RAG vetorial entra no Sprint 7. */
export async function searchKnowledge(workspaceId: string, query: string): Promise<SearchHit[]> {
  const q = query.trim();
  if (!q) return [];

  const result = await db.execute(sql`
    SELECT
      c.doc_id AS "docId",
      d.filename AS filename,
      d.category AS category,
      ts_headline('portuguese', c.content, plainto_tsquery('portuguese', ${q}),
        'MaxFragments=1, MaxWords=32, MinWords=12') AS snippet,
      ts_rank(to_tsvector('portuguese', c.content), plainto_tsquery('portuguese', ${q})) AS rank
    FROM knowledge_chunk c
    JOIN knowledge_doc d ON d.id = c.doc_id
    WHERE c.workspace_id = ${workspaceId}
      AND d.deleted_at IS NULL
      AND to_tsvector('portuguese', c.content) @@ plainto_tsquery('portuguese', ${q})
    ORDER BY rank DESC
    LIMIT 20
  `);

  const rows = (result as unknown as { rows?: unknown[] }).rows ?? [];
  return rows as SearchHit[];
}
