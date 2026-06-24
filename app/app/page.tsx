import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { FileCheck2, Clock, FileText, Coins, Sparkles } from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveWorkspace } from "@/lib/data/workspaces";
import { getWorkspaceStats } from "@/lib/data/stats";

const columns = [
  { name: "Backlog", key: "backlog", tone: "var(--text-muted)" },
  { name: "Produção", key: "producing", tone: "var(--info)" },
  { name: "Revisão", key: "review", tone: "var(--warning)" },
  { name: "Aprovado", key: "approved", tone: "var(--success)" },
  { name: "Publicado", key: "published", tone: "var(--accent)" },
];

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const store = await cookies();
  const { active } = await getActiveWorkspace(user!.id, store.get("active_ws")?.value);
  if (!active) redirect("/onboarding");

  const stats = await getWorkspaceStats(active.id);

  const readiness = [
    { label: "Marca & voz", done: true },
    { label: `Base (${stats.docs} docs)`, done: stats.docs > 0 },
    { label: "Integrações", done: stats.integrations > 0 },
    { label: "Primeira execução", done: stats.totalArticles > 0 },
  ];
  const pct = Math.round((readiness.filter((r) => r.done).length / readiness.length) * 100);

  const metrics = [
    { label: "Aprovados / semana", value: String(stats.approvedThisWeek), icon: FileCheck2 },
    { label: "Em revisão", value: String(stats.inReview), icon: Clock },
    { label: "Artigos no total", value: String(stats.totalArticles), icon: FileText },
    { label: "Custo IA (mês)", value: "R$ —", icon: Coins, badge: "estimado" },
  ];

  return (
    <>
      <Topbar workspace={active.name} breadcrumb="Visão geral" />
      <div className="flex-1 overflow-y-auto p-6">
        {/* Prontidão */}
        <div className="animate-fade-up mb-6 rounded-lg border border-border bg-surface p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Prontidão do workspace</span>
            <span className="text-sm text-text-secondary">{pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-subtle">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[13px]">
            {readiness.map((r) => (
              <span key={r.label} className={r.done ? "text-text-secondary" : "text-text-muted"}>
                {r.done ? "✓" : "◌"} {r.label}
              </span>
            ))}
          </div>
        </div>

        {/* Métricas */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.label} className="animate-fade-up rounded-lg border border-border bg-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <m.icon className="h-[18px] w-[18px] text-text-muted" />
                {m.badge && <span className="text-[12px] text-text-muted">{m.badge}</span>}
              </div>
              <div className="text-2xl font-semibold tracking-tight">{m.value}</div>
              <div className="mt-0.5 text-[13px] text-text-secondary">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Mini-kanban */}
        <div className="animate-fade-up mb-6 rounded-lg border border-border bg-surface p-5">
          <h3 className="mb-4 text-sm font-medium">Pipeline</h3>
          <div className="grid grid-cols-5 gap-3">
            {columns.map((c) => (
              <div key={c.key} className="rounded-md border border-border bg-app p-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: c.tone }} />
                  <span className="text-[12px] text-text-secondary">{c.name}</span>
                </div>
                <div className="mt-2 text-xl font-semibold">{stats.byStatus[c.key] ?? 0}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {stats.totalArticles === 0 && (
          <div className="animate-fade-up flex flex-col items-center rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-subtle text-accent">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-[15px] font-semibold">Seu workspace está pronto</h3>
            <p className="mt-1 max-w-md text-sm text-text-secondary">
              Comece alimentando a base de conhecimento e criando sua primeira execução.
              O motor de IA entra na próxima sprint.
            </p>
            <div className="mt-4">
              <Button size="md">
                <Sparkles className="h-4 w-4" />
                Nova execução
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
