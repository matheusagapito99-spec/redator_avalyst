"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runAuditAction, approveArticleAction, returnArticleAction } from "@/lib/audit/actions";
import type { AuditOutcome } from "@/lib/audit/run";

export function AuditPanel({
  articleId,
  audit,
  status,
}: {
  articleId: string;
  audit: AuditOutcome | null;
  status: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function run(action: (p: null, fd: FormData) => Promise<{ ok?: boolean; error?: string } | null>) {
    setMsg(null);
    const fd = new FormData();
    fd.set("articleId", articleId);
    start(async () => {
      const r = await action(null, fd);
      if (r?.error) setMsg(r.error);
      else router.refresh();
    });
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-[13px] font-medium">
          <ShieldCheck className="h-4 w-4" /> Auditoria
        </h2>
        {audit && (
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${audit.passed ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
            {audit.passed ? "Aprovável" : "Bloqueado"}
          </span>
        )}
      </div>

      {!audit ? (
        <p className="mb-3 text-[12px] text-text-muted">
          Rode a auditoria por regras (itens obrigatórios + dimensões 0–10).
        </p>
      ) : (
        <>
          <ul className="mb-3 space-y-1.5">
            {audit.mandatory.map((m) => (
              <li key={m.key} className="flex items-start gap-2 text-[12px]">
                {m.pass ? (
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                ) : (
                  <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger" />
                )}
                <span className={m.pass ? "text-text-secondary" : "text-danger"} title={m.note}>
                  {m.label}
                </span>
              </li>
            ))}
          </ul>
          <div className="mb-3 space-y-1.5 border-t border-border pt-3">
            {audit.dimensions.map((d) => (
              <div key={d.key} className="text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">{d.label}</span>
                  <span className={d.score >= 8 ? "text-success" : "text-warning"}>{d.score.toFixed(1)}</span>
                </div>
                <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-subtle">
                  <div className="h-full rounded-full" style={{ width: `${d.score * 10}%`, background: d.score >= 8 ? "var(--success)" : "var(--warning)" }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {msg && (
        <p className="mb-3 flex items-start gap-2 rounded-md border border-danger/40 bg-danger/10 px-2.5 py-2 text-[12px] text-danger">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {msg}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" disabled={pending} onClick={() => run(runAuditAction)}>
          {pending ? "…" : audit ? "Reauditar" : "Rodar auditoria"}
        </Button>
        {status !== "approved" && (
          <Button size="sm" disabled={pending || !audit?.passed} onClick={() => run(approveArticleAction)}>
            Aprovar
          </Button>
        )}
        {audit && status !== "producing" && (
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(returnArticleAction)}>
            Devolver
          </Button>
        )}
      </div>
    </section>
  );
}
