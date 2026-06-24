import Link from "next/link";
import { Trash2, FileText, AlertTriangle } from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { UploadDialog } from "@/components/knowledge/upload-dialog";
import { SearchBox } from "@/components/knowledge/search-box";
import { requireActiveWorkspace } from "@/lib/auth/guard";
import {
  listDocs,
  getCoverage,
  searchKnowledge,
  CATEGORIES,
  CATEGORY_LABEL,
  type Category,
} from "@/lib/data/knowledge";
import { deleteDocumentAction } from "@/lib/knowledge/actions";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    indexed: { label: "Indexado", cls: "text-success" },
    processing: { label: "Processando", cls: "text-info" },
    outdated: { label: "Desatualizado", cls: "text-warning" },
    error: { label: "Erro", cls: "text-danger" },
  };
  const s = map[status] ?? { label: status, cls: "text-text-muted" };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12px] ${s.cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}

export default async function ConhecimentoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const { ws } = await requireActiveWorkspace();
  const sp = await searchParams;
  const q = sp.q?.trim();
  const activeCat = (sp.cat && CATEGORIES.includes(sp.cat as Category) ? sp.cat : undefined) as
    | Category
    | undefined;

  const coverage = await getCoverage(ws.id);
  const hits = q ? await searchKnowledge(ws.id, q) : [];
  const docs = q ? [] : await listDocs(ws.id, activeCat);

  return (
    <>
      <Topbar workspace={ws.name} breadcrumb="Conhecimento" />
      <div className="flex-1 overflow-y-auto p-6">
        {/* Cabeçalho */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Base de conhecimento</h1>
            <p className="mt-0.5 text-[13px] text-text-secondary">
              Fonte autoritativa para conteúdo de meio e fundo de funil.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SearchBox initial={q ?? ""} />
            <UploadDialog defaultCategory={activeCat ?? "produto"} />
          </div>
        </div>

        {/* Cobertura */}
        <div className="mb-5 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <span
              key={c}
              className={`rounded-full border px-3 py-1 text-[12px] ${
                coverage[c] > 0
                  ? "border-border bg-surface text-text-secondary"
                  : "border-dashed border-border text-text-muted"
              }`}
            >
              {coverage[c] > 0 ? "✓" : "◌"} {CATEGORY_LABEL[c]} ({coverage[c]})
            </span>
          ))}
        </div>

        {/* Resultados de busca */}
        {q ? (
          <div>
            <p className="mb-3 text-[13px] text-text-secondary">
              {hits.length} resultado(s) para <span className="text-text-primary">“{q}”</span>{" "}
              · busca full-text (português)
              <Link href="/app/conhecimento" className="ml-2 text-accent hover:underline">
                limpar
              </Link>
            </p>
            <div className="space-y-2">
              {hits.map((h, i) => (
                <div key={i} className="rounded-lg border border-border bg-surface p-4">
                  <div className="mb-1 flex items-center gap-2 text-[12px] text-text-muted">
                    <FileText className="h-3.5 w-3.5" />
                    {h.filename}
                    <span className="rounded bg-subtle px-1.5 py-0.5">
                      {CATEGORY_LABEL[h.category as Category] ?? h.category}
                    </span>
                  </div>
                  <p
                    className="text-sm leading-relaxed text-text-secondary [&_b]:text-accent [&_b]:font-semibold"
                    dangerouslySetInnerHTML={{ __html: h.snippet }}
                  />
                </div>
              ))}
              {hits.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-text-muted">
                  Nada encontrado na base para esse termo.
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Tabs de categoria */}
            <div className="mb-3 flex gap-1 border-b border-border">
              <Link
                href="/app/conhecimento"
                className={`px-3 py-2 text-[13px] ${!activeCat ? "border-b-2 border-accent font-medium text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
              >
                Todos
              </Link>
              {CATEGORIES.map((c) => (
                <Link
                  key={c}
                  href={`/app/conhecimento?cat=${c}`}
                  className={`px-3 py-2 text-[13px] ${activeCat === c ? "border-b-2 border-accent font-medium text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
                >
                  {CATEGORY_LABEL[c]}
                </Link>
              ))}
            </div>

            {/* Lista */}
            {docs.length === 0 ? (
              <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-subtle text-accent">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-[15px] font-semibold">Base vazia</h3>
                <p className="mt-1 max-w-md text-sm text-text-secondary">
                  Alimente a base para gerar conteúdo de meio e fundo de funil com
                  embasamento real. Aceita PDF, DOCX, MD, TXT e CSV.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-subtle text-left text-[12px] text-text-muted">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Documento</th>
                      <th className="px-4 py-2.5 font-medium">Categoria</th>
                      <th className="px-4 py-2.5 font-medium">Chunks</th>
                      <th className="px-4 py-2.5 font-medium">Status</th>
                      <th className="px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {docs.map((d) => (
                      <tr key={d.id} className="border-t border-border">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-text-muted" />
                            <span className="font-medium">{d.filename}</span>
                            {d.status === "error" && (
                              <AlertTriangle className="h-3.5 w-3.5 text-danger" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {CATEGORY_LABEL[d.category]}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">{d.chunks}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={d.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <form action={deleteDocumentAction}>
                            <input type="hidden" name="docId" value={d.id} />
                            <button
                              type="submit"
                              title="Remover"
                              className="inline-flex h-7 w-7 items-center justify-center rounded text-text-muted hover:bg-subtle hover:text-danger"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
