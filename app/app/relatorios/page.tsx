import Link from "next/link";
import { TrendingUp, TrendingDown, CheckCircle2, Clock, Coins } from "lucide-react";
import { Topbar } from "@/components/shell/topbar";
import { requireActiveWorkspace } from "@/lib/auth/guard";
import { getReportData } from "@/lib/data/reports";
import { STATUS_LABEL, STATUS_TONE, type ArticleStatus } from "@/lib/data/article-constants";

const FUNNEL_LABEL: Record<string, string> = { topo: "Topo", meio: "Meio", fundo: "Fundo" };

export default async function RelatoriosPage() {
  const { ws } = await requireActiveWorkspace();
  const r = await getReportData(ws.id);

  const trend = r.northStarThisWeek - r.northStarLastWeek;
  const maxWeekly = Math.max(1, ...r.weekly.map((w) => w.n));

  return (
    <>
      <Topbar workspace={ws.name} breadcrumb="Relatórios" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-5">
          <h1 className="text-lg font-semibold tracking-tight">Relatórios</h1>
          <p className="mt-0.5 text-[13px] text-text-secondary">
            North Star: artigos aprovados em auditoria por semana — qualidade que pode ir ao ar.
          </p>
        </div>

        {/* Métricas */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <CheckCircle2 className="h-[18px] w-[18px] text-text-muted" />
              {trend !== 0 && (
                <span className={`flex items-center gap-0.5 text-[12px] ${trend > 0 ? "text-success" : "text-danger"}`}>
                  {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {trend > 0 ? "+" : ""}{trend}
                </span>
              )}
            </div>
            <div className="text-2xl font-semibold tracking-tight">{r.northStarThisWeek}</div>
            <div className="mt-0.5 text-[13px] text-text-secondary">Aprovados / semana ★</div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <CheckCircle2 className="h-[18px] w-[18px] text-text-muted" />
              <span className={`text-[12px] ${r.approvalRate >= 70 ? "text-success" : "text-warning"}`}>meta 70%</span>
            </div>
            <div className="text-2xl font-semibold tracking-tight">{r.approvalRate}%</div>
            <div className="mt-0.5 text-[13px] text-text-secondary">Taxa de aprovação ({r.auditsTotal} auditorias)</div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <Clock className="h-[18px] w-[18px] text-text-muted" />
              <span className={`text-[12px] ${r.leadTimeDays !== null && r.leadTimeDays <= 1 ? "text-success" : "text-text-muted"}`}>meta &lt;1d</span>
            </div>
            <div className="text-2xl font-semibold tracking-tight">
              {r.leadTimeDays === null ? "—" : `${r.leadTimeDays.toFixed(1)}d`}
            </div>
            <div className="mt-0.5 text-[13px] text-text-secondary">Lead time pauta → aprovado</div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <Coins className="h-[18px] w-[18px] text-text-muted" />
              <span className="text-[12px] text-text-muted">{r.aiRuns} execuções</span>
            </div>
            <div className="text-2xl font-semibold tracking-tight">US$ {r.aiCost.toFixed(2)}</div>
            <div className="mt-0.5 text-[13px] text-text-secondary">Custo de IA (mês) · {r.aiTokens} tokens</div>
          </div>
        </div>

        {/* Série semanal */}
        <div className="mb-6 rounded-lg border border-border bg-surface p-5">
          <h3 className="mb-4 text-sm font-medium">Aprovados em auditoria — últimas semanas</h3>
          {r.weekly.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-text-muted">Sem dados de auditoria ainda.</p>
          ) : (
            <div className="flex items-end gap-3" style={{ height: 140 }}>
              {r.weekly.map((w) => (
                <div key={w.label} className="flex flex-1 flex-col items-center justify-end gap-1.5">
                  <span className="text-[11px] text-text-secondary">{w.n}</span>
                  <div className="w-full rounded-t bg-accent" style={{ height: `${(w.n / maxWeekly) * 100}%`, minHeight: w.n > 0 ? 6 : 0 }} />
                  <span className="text-[10px] text-text-muted">{w.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabela por artigo (relatório de saída) */}
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-subtle text-left text-[12px] text-text-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium">Artigo</th>
                <th className="px-4 py-2.5 font-medium">Funil</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Auditoria</th>
                <th className="px-4 py-2.5 font-medium">Fontes</th>
                <th className="px-4 py-2.5 font-medium">Custo IA</th>
              </tr>
            </thead>
            <tbody>
              {r.perArticle.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-[13px] text-text-muted">Nenhum artigo ainda.</td></tr>
              ) : (
                r.perArticle.map((a) => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <Link href={`/app/artigos/${a.id}`} className="font-medium hover:text-accent">{a.title}</Link>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{a.funnelStage ? FUNNEL_LABEL[a.funnelStage] : "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: STATUS_TONE[a.status as ArticleStatus] }}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" /> {STATUS_LABEL[a.status as ArticleStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {a.auditPassed === null ? <span className="text-text-muted">—</span> : a.auditPassed ? <span className="text-success">✓ passou</span> : <span className="text-danger">✗ bloqueado</span>}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{a.sources}</td>
                    <td className="px-4 py-3 text-text-secondary">US$ {a.cost.toFixed(4)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
