import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles, FileText } from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { GenerateButton } from "@/components/ai/generate-button";
import { requireActiveWorkspace } from "@/lib/auth/guard";
import { getArticleDetail } from "@/lib/data/article-detail";
import { getAiSettingsPublic } from "@/lib/data/ai-settings";
import { STATUS_LABEL, type ArticleStatus } from "@/lib/data/article-constants";

const ORIGIN_CLS: Record<string, string> = {
  medido: "text-success",
  observado: "text-info",
  estimado: "text-warning",
  verificar: "text-danger",
};

export default async function ArticleViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { ws } = await requireActiveWorkspace();
  const { id } = await params;
  const data = await getArticleDetail(ws.id, id);
  if (!data) notFound();

  const { article, content, sources, run } = data;
  const aiConfigured = await getAiSettingsPublic(ws.id);
  const blocks = content?.blocks ?? [];

  return (
    <>
      <Topbar workspace={ws.name} breadcrumb="Artigos" />
      <div className="flex-1 overflow-y-auto p-6">
        <Link href="/app/pipeline" className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-text-primary">
          <ArrowLeft className="h-4 w-4" /> Pipeline
        </Link>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">{content?.title ?? article.title}</h1>
          <span className="rounded-full bg-subtle px-2.5 py-0.5 text-[12px] text-text-secondary">
            {STATUS_LABEL[article.status as ArticleStatus]}
          </span>
        </div>

        {!aiConfigured && (
          <div className="mb-4 rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-[13px] text-warning">
            Nenhum provedor de IA configurado.{" "}
            <Link href="/app/config/ia" className="font-medium underline">Configurar IA</Link> para gerar conteúdo.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-subtle text-accent">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-[15px] font-semibold">Sem conteúdo ainda</h3>
                <p className="mb-4 mt-1 max-w-md text-sm text-text-secondary">
                  Gere o rascunho com a IA configurada. O conteúdo é embasado na pauta,
                  na SERP e na base de conhecimento — nunca publicado automaticamente.
                </p>
                {aiConfigured && <GenerateButton articleId={article.id} label="Gerar conteúdo" />}
              </div>
            ) : (
              <>
                <article className="rounded-lg border border-border bg-surface p-6">
                  <div className="prose-redator space-y-3">
                    {blocks.map((b, i) => {
                      if (b.type === "h2") return <h2 key={i} className="pt-2 text-lg font-semibold">{b.text}</h2>;
                      if (b.type === "h3") return <h3 key={i} className="pt-1 text-[15px] font-semibold">{b.text}</h3>;
                      if (b.type === "faq") return (
                        <p key={i} className="rounded-md border border-border bg-app p-3 text-sm text-text-secondary"><strong className="text-text-primary">FAQ:</strong> {b.text}</p>
                      );
                      return <p key={i} className="text-sm leading-relaxed text-text-secondary">{b.text}</p>;
                    })}
                  </div>
                </article>
                <GenerateButton articleId={article.id} label="Regenerar" />
              </>
            )}
          </div>

          {/* Painel lateral: fontes + SEO + IA */}
          <aside className="space-y-4">
            {content && (
              <section className="rounded-lg border border-border bg-surface p-4">
                <h2 className="mb-2 text-[13px] font-medium">SEO</h2>
                <dl className="space-y-2 text-[12px]">
                  <div><dt className="text-text-muted">Meta title</dt><dd className="text-text-secondary">{content.metaTitle ?? "—"}</dd></div>
                  <div><dt className="text-text-muted">Meta description</dt><dd className="text-text-secondary">{content.metaDescription ?? "—"}</dd></div>
                  <div><dt className="text-text-muted">Slug</dt><dd className="font-mono text-text-secondary">{content.slug ?? "—"}</dd></div>
                </dl>
              </section>
            )}

            {sources.length > 0 && (
              <section className="rounded-lg border border-border bg-surface p-4">
                <h2 className="mb-2 flex items-center gap-1.5 text-[13px] font-medium"><FileText className="h-3.5 w-3.5" /> Fontes</h2>
                <ul className="space-y-2 text-[12px]">
                  {sources.map((s, i) => (
                    <li key={i} className="border-l-2 border-border pl-2">
                      <span className={`font-medium uppercase ${ORIGIN_CLS[s.origin] ?? "text-text-muted"}`}>{s.origin}</span>
                      <span className="text-text-secondary"> · {s.ref}</span>
                      {s.excerpt && <p className="mt-0.5 line-clamp-2 text-text-muted">{s.excerpt}</p>}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {run && (
              <section className="rounded-lg border border-border bg-surface p-4">
                <h2 className="mb-2 text-[13px] font-medium">Execução de IA</h2>
                <dl className="space-y-1.5 text-[12px]">
                  <div className="flex justify-between"><dt className="text-text-muted">Modelo</dt><dd className="text-text-secondary">{run.model}</dd></div>
                  <div className="flex justify-between"><dt className="text-text-muted">Tokens</dt><dd className="text-text-secondary">{(run.inputTokens ?? 0) + (run.outputTokens ?? 0)}</dd></div>
                  <div className="flex justify-between"><dt className="text-text-muted">Custo (estimado)</dt><dd className="text-text-secondary">US$ {(run.cost ?? 0).toFixed(4)}</dd></div>
                  <div className="flex justify-between"><dt className="text-text-muted">Latência</dt><dd className="text-text-secondary">{run.latencyMs} ms</dd></div>
                </dl>
              </section>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
