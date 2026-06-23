import { Topbar } from "@/components/shell/topbar";
import { TrendingUp, Clock, FileCheck2, Coins } from "lucide-react";

const metrics = [
  { label: "Aprovados / semana", value: "8", trend: "+2", icon: FileCheck2, good: true },
  { label: "Em revisão", value: "3", trend: "", icon: Clock },
  { label: "Lead time médio", value: "0,7 dia", trend: "-0,2", icon: TrendingUp, good: true },
  { label: "Custo IA (mês)", value: "R$ —", trend: "estimado", icon: Coins },
];

const columns = [
  { name: "Backlog", count: 5, tone: "var(--text-muted)" },
  { name: "Produção", count: 2, tone: "var(--info)" },
  { name: "Revisão", count: 3, tone: "var(--warning)" },
  { name: "Aprovado", count: 1, tone: "var(--success)" },
  { name: "Publicado", count: 8, tone: "var(--accent)" },
];

const activity = [
  { who: "IA", what: "gerou “Seguro fiança vs. título de capitalização”", when: "há 5min" },
  { who: "Ana", what: "aprovou “Como alugar sem fiador”", when: "há 1h" },
  { who: "IA", what: "auditou 3 artigos do cluster de inadimplência", when: "há 2h" },
];

export default function Dashboard() {
  return (
    <>
      <Topbar breadcrumb="Visão geral" />
      <div className="flex-1 overflow-y-auto p-6">
        {/* Prontidão */}
        <div className="animate-fade-up mb-6 rounded-lg border border-border bg-surface p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Prontidão do workspace</span>
            <span className="text-sm text-text-secondary">70%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-subtle">
            <div className="h-full rounded-full bg-accent" style={{ width: "70%" }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-text-secondary">
            <span>✓ Marca &amp; voz</span>
            <span>✓ Base (12 docs)</span>
            <span>✓ WordPress</span>
            <span className="text-text-muted">◌ SEO</span>
            <span className="text-text-muted">◌ Drive sync</span>
          </div>
        </div>

        {/* Métricas */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="animate-fade-up rounded-lg border border-border bg-surface p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <m.icon className="h-[18px] w-[18px] text-text-muted" />
                {m.trend && (
                  <span
                    className={`text-[12px] ${m.good ? "text-success" : "text-text-muted"}`}
                  >
                    {m.trend}
                  </span>
                )}
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
              <div key={c.name} className="rounded-md border border-border bg-app p-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: c.tone }}
                  />
                  <span className="text-[12px] text-text-secondary">{c.name}</span>
                </div>
                <div className="mt-2 text-xl font-semibold">{c.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Atividade + ações */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="animate-fade-up rounded-lg border border-border bg-surface p-5">
            <h3 className="mb-3 text-sm font-medium">Atividade recente</h3>
            <ul className="space-y-3">
              {activity.map((a, i) => (
                <li key={i} className="flex items-start gap-3 text-[13px]">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-subtle text-[11px] font-medium">
                    {a.who === "IA" ? "✦" : a.who[0]}
                  </span>
                  <span className="text-text-secondary">
                    <span className="text-text-primary">{a.who}</span> {a.what}
                    <span className="ml-1 text-text-muted">· {a.when}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="animate-fade-up rounded-lg border border-border bg-surface p-5">
            <h3 className="mb-3 text-sm font-medium">Próximas ações</h3>
            <ul className="space-y-2.5 text-[13px]">
              <li className="flex items-center gap-2 rounded-md border border-border bg-app p-2.5">
                <span className="text-warning">⚠</span>
                <span className="text-text-secondary">3 artigos aguardam revisão</span>
              </li>
              <li className="flex items-center gap-2 rounded-md border border-border bg-app p-2.5">
                <span className="text-warning">⚠</span>
                <span className="text-text-secondary">SEO não conectado — métricas como ESTIMADO</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
