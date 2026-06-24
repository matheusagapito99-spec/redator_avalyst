import Link from "next/link";
import { KanbanSquare } from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { Board } from "@/components/pipeline/board";
import { requireActiveWorkspace } from "@/lib/auth/guard";
import { listArticlesForPipeline, STATUS_LABEL, STATUS_TONE, type ArticleStatus } from "@/lib/data/articles";

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { ws } = await requireActiveWorkspace();
  const view = (await searchParams).view === "calendar" ? "calendar" : "board";
  const cards = await listArticlesForPipeline(ws.id);

  // Agrupa por data (createdAt) para a visão de calendário.
  const byDate = new Map<string, typeof cards>();
  for (const c of cards) {
    const d = new Date(c.createdAt).toLocaleDateString("pt-BR");
    if (!byDate.has(d)) byDate.set(d, []);
    byDate.get(d)!.push(c);
  }

  return (
    <>
      <Topbar workspace={ws.name} breadcrumb="Pipeline" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Pipeline editorial</h1>
            <p className="mt-0.5 text-[13px] text-text-secondary">
              Arraste os cards entre as colunas — ou use o seletor de status.
            </p>
          </div>
          <div className="flex rounded-md border border-border p-0.5 text-[13px]">
            <Link href="/app/pipeline" className={`rounded px-3 py-1 ${view === "board" ? "bg-subtle font-medium text-text-primary" : "text-text-secondary"}`}>
              Quadro
            </Link>
            <Link href="/app/pipeline?view=calendar" className={`rounded px-3 py-1 ${view === "calendar" ? "bg-subtle font-medium text-text-primary" : "text-text-secondary"}`}>
              Calendário
            </Link>
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-subtle text-accent">
              <KanbanSquare className="h-5 w-5" />
            </div>
            <h3 className="text-[15px] font-semibold">Pipeline vazio</h3>
            <p className="mt-1 max-w-md text-sm text-text-secondary">
              Promova uma pauta a artigo (em{" "}
              <Link href="/app/pautas" className="text-accent hover:underline">Pautas</Link>
              ) para começar a mover conteúdo pelo fluxo.
            </p>
          </div>
        ) : view === "board" ? (
          <Board initial={cards} />
        ) : (
          <div className="space-y-5">
            {[...byDate.entries()].map(([date, items]) => (
              <div key={date}>
                <h3 className="mb-2 text-[13px] font-medium text-text-secondary">{date}</h3>
                <div className="space-y-2">
                  {items.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
                      <span className="h-2 w-2 rounded-full" style={{ background: STATUS_TONE[c.status as ArticleStatus] }} />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{c.title}</span>
                      <span className="text-[12px] text-text-muted">{STATUS_LABEL[c.status as ArticleStatus]}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
