import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Search, ExternalLink, TrendingUp } from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { Button } from "@/components/ui/button";
import { requireActiveWorkspace } from "@/lib/auth/guard";
import { getBrief, FUNNEL_LABEL, type BriefFilters } from "@/lib/data/briefs";
import { runSerpAnalysisAction } from "@/lib/briefs/actions";

const INTENT_LABEL: Record<string, string> = {
  informacional: "Informacional",
  comparacao: "Comparação",
  transacional: "Transacional",
};
const LEVEL_LABEL: Record<string, string> = { baixo: "Baixo", medio: "Médio", alto: "Alto" };

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[12px] text-text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm text-text-primary">{value || "—"}</dd>
    </div>
  );
}

type SerpResult = { position: number; title: string; url: string; domain: string; snippet: string };

export default async function BriefDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { ws } = await requireActiveWorkspace();
  const { id } = await params;
  const data = await getBrief(ws.id, id);
  if (!data) notFound();

  const { brief, serp } = data;
  const filters = brief.filters as BriefFilters | null;
  const competitors = (serp?.competitors as SerpResult[] | null) ?? [];
  const gaps = (serp?.gaps as string[] | null) ?? [];

  return (
    <>
      <Topbar workspace={ws.name} breadcrumb="Pautas" />
      <div className="flex-1 overflow-y-auto p-6">
        <Link href="/app/pautas" className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-text-primary">
          <ArrowLeft className="h-4 w-4" /> Pautas
        </Link>

        <div className="mb-2 flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">{brief.title}</h1>
          <span className="rounded-full bg-subtle px-2.5 py-0.5 text-[12px] text-text-secondary">
            {brief.status}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Ficha de pauta */}
          <div className="lg:col-span-2 space-y-4">
            <section className="rounded-lg border border-border bg-surface p-5">
              <h2 className="mb-4 text-sm font-medium">Ficha de pauta</h2>
              <dl className="grid grid-cols-2 gap-4">
                <Field label="Palavra-chave-alvo" value={brief.targetKeyword} />
                <Field label="Intenção de busca" value={brief.intent ? INTENT_LABEL[brief.intent] : "—"} />
                <Field label="Etapa do funil" value={brief.funnelStage ? FUNNEL_LABEL[brief.funnelStage] : "—"} />
                <Field label="Persona" value={brief.persona} />
                <div className="col-span-2">
                  <Field label="Ângulo de diferenciação" value={brief.angle} />
                </div>
              </dl>
            </section>

            {/* SERP */}
            <section className="rounded-lg border border-border bg-surface p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-medium">
                  <Search className="h-4 w-4" /> Inteligência de SERP
                </h2>
                <form action={runSerpAnalysisAction}>
                  <input type="hidden" name="briefId" value={brief.id} />
                  <Button size="sm" variant="secondary" type="submit">
                    {serp ? "Reanalisar" : "Analisar SERP"}
                  </Button>
                </form>
              </div>

              {!serp ? (
                <p className="text-[13px] text-text-muted">
                  Rode a análise para mapear os concorrentes que rankeiam para
                  “{brief.targetKeyword}”. Dados serão rotulados como OBSERVADO.
                </p>
              ) : (
                <>
                  <div className="mb-3 flex items-center gap-2 text-[12px]">
                    <span className="rounded bg-info/15 px-2 py-0.5 text-info">OBSERVADO</span>
                    <span className="text-text-muted">
                      {serp.analyzedCount} concorrente(s) · {new Date(serp.createdAt).toLocaleString("pt-BR")}
                    </span>
                  </div>

                  {competitors.length > 0 ? (
                    <ol className="space-y-2">
                      {competitors.map((c) => (
                        <li key={c.position} className="rounded-md border border-border bg-app p-3">
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 text-[12px] font-medium text-text-muted">#{c.position}</span>
                            <div className="min-w-0 flex-1">
                              <a href={c.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm font-medium text-text-primary hover:text-accent">
                                <span className="truncate">{c.title}</span>
                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                              <div className="text-[11px] text-success">{c.domain}</div>
                              {c.snippet && <p className="mt-1 line-clamp-2 text-[12px] text-text-secondary">{c.snippet}</p>}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-[13px] text-warning">
                      Análise de SERP indisponível — marcada como pendente de verificação humana.
                    </div>
                  )}

                  {gaps.length > 0 && (
                    <div className="mt-4">
                      <h3 className="mb-1.5 text-[12px] font-medium text-text-muted">Lacunas e observações</h3>
                      <ul className="space-y-1 text-[13px] text-text-secondary">
                        {gaps.map((g, i) => <li key={i}>• {g}</li>)}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>

          {/* Score / filtros */}
          <aside className="space-y-4">
            <section className="rounded-lg border border-border bg-surface p-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4" /> Prioridade
              </h2>
              <div className="mb-4 text-3xl font-semibold tracking-tight">
                {(brief.score ?? 0).toFixed(1)}
                <span className="text-base text-text-muted"> / 10</span>
              </div>
              <dl className="space-y-2">
                {filters &&
                  ([
                    ["Tráfego", filters.trafego],
                    ["Negócio", filters.negocio],
                    ["Conversão", filters.conversao],
                  ] as const).map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between text-[13px]">
                      <span className="text-text-secondary">{label}</span>
                      <span className="font-medium">{LEVEL_LABEL[val]}</span>
                    </div>
                  ))}
              </dl>
            </section>
          </aside>
        </div>
      </div>
    </>
  );
}
