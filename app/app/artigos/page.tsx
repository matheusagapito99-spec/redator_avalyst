import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { requireActiveWorkspace } from "@/lib/auth/guard";
import { listArticlesForPipeline, STATUS_LABEL, STATUS_TONE, type ArticleStatus } from "@/lib/data/articles";

export default async function ArtigosPage() {
  const { ws } = await requireActiveWorkspace();
  const articles = await listArticlesForPipeline(ws.id);

  return (
    <>
      <Topbar workspace={ws.name} breadcrumb="Artigos" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-5">
          <h1 className="text-lg font-semibold tracking-tight">Artigos</h1>
          <p className="mt-0.5 text-[13px] text-text-secondary">
            Conteúdo gerado pela IA, sob revisão humana. Nada é publicado automaticamente.
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-subtle text-accent">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-[15px] font-semibold">Nenhum artigo ainda</h3>
            <p className="mt-1 max-w-md text-sm text-text-secondary">
              Promova uma pauta a artigo em{" "}
              <Link href="/app/pautas" className="text-accent hover:underline">Pautas</Link> e gere o conteúdo.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {articles.map((a) => (
              <Link key={a.id} href={`/app/artigos/${a.id}`} className="group flex items-center gap-4 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong">
                <span className="flex items-center gap-1.5 text-[12px]" style={{ color: STATUS_TONE[a.status as ArticleStatus] }}>
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {STATUS_LABEL[a.status as ArticleStatus]}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{a.title}</span>
                {a.funnelStage && <span className="text-[12px] text-text-muted">{a.funnelStage}</span>}
                <ArrowRight className="h-4 w-4 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
