import Link from "next/link";
import { Trash2, Lightbulb, ArrowRight, Check, Sparkles } from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { NewBriefDialog } from "@/components/briefs/new-brief-dialog";
import { SuggestButton } from "@/components/briefs/suggest-button";
import { requireActiveWorkspace } from "@/lib/auth/guard";
import { listBriefs, FUNNEL_LABEL, type BriefRow } from "@/lib/data/briefs";
import { deleteBriefAction, approveBriefAction } from "@/lib/briefs/actions";

const FUNNEL_TONE: Record<string, string> = {
  topo: "var(--info)",
  meio: "var(--warning)",
  fundo: "var(--success)",
};

function ScoreChip({ score }: { score: number | null }) {
  const s = score ?? 0;
  const tone = s >= 7 ? "var(--success)" : s >= 4 ? "var(--warning)" : "var(--text-muted)";
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium"
      style={{ color: tone, background: "color-mix(in srgb, " + tone + " 12%, transparent)" }}>
      {s.toFixed(1)}
    </span>
  );
}

function FunnelTag({ stage }: { stage: string | null }) {
  if (!stage) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: FUNNEL_TONE[stage] }}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {FUNNEL_LABEL[stage]}
    </span>
  );
}

export default async function PautasPage({
  searchParams,
}: {
  searchParams: Promise<{ funnel?: string }>;
}) {
  const { ws } = await requireActiveWorkspace();
  const sp = await searchParams;
  const funnel = ["topo", "meio", "fundo"].includes(sp.funnel ?? "") ? sp.funnel : undefined;

  const all = await listBriefs(ws.id);
  const suggested = all.filter((b) => b.status === "suggested");
  let regular = all.filter((b) => b.status !== "suggested");
  if (funnel) regular = regular.filter((b) => b.funnelStage === funnel);

  return (
    <>
      <Topbar workspace={ws.name} breadcrumb="Pautas" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Pautas</h1>
            <p className="mt-0.5 text-[13px] text-text-secondary">
              Deixe a IA sugerir pautas embasadas na sua base — você só aprova.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SuggestButton />
            <NewBriefDialog />
          </div>
        </div>

        {/* Sugeridas pela IA */}
        {suggested.length > 0 && (
          <div className="mb-6 rounded-lg border border-accent/30 bg-accent/5 p-4">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-accent" /> Sugeridas pela IA · aguardando sua aprovação
            </h2>
            <div className="space-y-2">
              {suggested.map((b) => (
                <div key={b.id} className="flex items-center gap-3 rounded-md border border-border bg-surface p-3">
                  <ScoreChip score={b.score} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{b.title}</span>
                      <FunnelTag stage={b.funnelStage} />
                    </div>
                    <div className="mt-0.5 truncate text-[12px] text-text-muted">{b.targetKeyword} · {b.persona}</div>
                  </div>
                  <form action={approveBriefAction}>
                    <input type="hidden" name="id" value={b.id} />
                    <button type="submit" className="inline-flex items-center gap-1 rounded-md bg-accent px-2.5 py-1.5 text-[12px] font-medium text-accent-fg hover:opacity-90">
                      <Check className="h-3.5 w-3.5" /> Aprovar
                    </button>
                  </form>
                  <form action={deleteBriefAction}>
                    <input type="hidden" name="id" value={b.id} />
                    <button type="submit" title="Descartar" className="flex h-7 w-7 items-center justify-center rounded text-text-muted hover:bg-subtle hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs de funil */}
        <div className="mb-3 flex gap-1 border-b border-border">
          <Link href="/app/pautas" className={`px-3 py-2 text-[13px] ${!funnel ? "border-b-2 border-accent font-medium text-text-primary" : "text-text-secondary hover:text-text-primary"}`}>Todas</Link>
          {(["topo", "meio", "fundo"] as const).map((f) => (
            <Link key={f} href={`/app/pautas?funnel=${f}`} className={`px-3 py-2 text-[13px] ${funnel === f ? "border-b-2 border-accent font-medium text-text-primary" : "text-text-secondary hover:text-text-primary"}`}>{FUNNEL_LABEL[f]}</Link>
          ))}
        </div>

        {regular.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-subtle text-accent">
              <Lightbulb className="h-5 w-5" />
            </div>
            <h3 className="text-[15px] font-semibold">Nenhuma pauta aprovada ainda</h3>
            <p className="mt-1 max-w-md text-sm text-text-secondary">
              Use <strong>Sugerir com IA</strong> para receber pautas embasadas na base e aprovar as que quiser.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {regular.map((b: BriefRow) => (
              <div key={b.id} className="group flex items-center gap-4 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong">
                <ScoreChip score={b.score} />
                <Link href={`/app/pautas/${b.id}`} className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{b.title}</span>
                    <FunnelTag stage={b.funnelStage} />
                  </div>
                  <div className="mt-0.5 truncate text-[12px] text-text-muted">{b.targetKeyword} · {b.persona}</div>
                </Link>
                <Link href={`/app/pautas/${b.id}`} className="opacity-0 transition-opacity group-hover:opacity-100">
                  <ArrowRight className="h-4 w-4 text-text-muted" />
                </Link>
                <form action={deleteBriefAction}>
                  <input type="hidden" name="id" value={b.id} />
                  <button type="submit" title="Remover" className="flex h-7 w-7 items-center justify-center rounded text-text-muted hover:bg-subtle hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
