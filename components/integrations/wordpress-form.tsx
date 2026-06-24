"use client";

import { useActionState, useState, useTransition } from "react";
import { ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveWordpressAction, testWordpressAction, type IntegrationState } from "@/lib/integrations/actions";

export function WordpressForm({
  current,
}: {
  current: { siteUrl: string; username: string; connected: boolean } | null;
}) {
  const [state, formAction, saving] = useActionState<IntegrationState, FormData>(saveWordpressAction, null);
  const [testState, setTestState] = useState<IntegrationState>(null);
  const [testing, startTest] = useTransition();

  return (
    <div className="max-w-xl rounded-lg border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold">WordPress</h2>
          <p className="text-[12px] text-text-muted">Envia artigos aprovados como rascunho via REST API.</p>
        </div>
        {current && (
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${current.connected ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
            {current.connected ? "Conectado" : "Erro"}
          </span>
        )}
      </div>

      <form action={formAction} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-text-secondary">URL do site</span>
          <input name="siteUrl" type="url" defaultValue={current?.siteUrl} placeholder="https://seusite.com.br" className="h-10 w-full rounded-md border border-border bg-app px-3 text-sm outline-none placeholder:text-text-muted focus:border-accent" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-text-secondary">Usuário</span>
          <input name="username" defaultValue={current?.username} placeholder="usuário admin" className="h-10 w-full rounded-md border border-border bg-app px-3 text-sm outline-none placeholder:text-text-muted focus:border-accent" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-text-secondary">
            Application Password
            <a href="https://wordpress.org/documentation/article/application-passwords/" target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center gap-1 text-[12px] text-accent hover:underline">
              como gerar <ExternalLink className="h-3 w-3" />
            </a>
          </span>
          <input name="appPassword" type="password" autoComplete="off" placeholder={current?.connected ? "Configurada — cole para trocar" : "xxxx xxxx xxxx xxxx xxxx xxxx"} className="h-10 w-full rounded-md border border-border bg-app px-3 font-mono text-sm outline-none placeholder:font-sans placeholder:text-text-muted focus:border-accent" />
          <p className="mt-1.5 text-[12px] text-text-muted">Gerada em Usuários → Perfil → Application Passwords. Criptografada no banco.</p>
        </label>

        {state?.error && (
          <p className="flex items-center gap-2 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[13px] text-danger"><AlertCircle className="h-4 w-4" /> {state.error}</p>
        )}
        {state?.ok && (
          <p className="flex items-center gap-2 rounded-md border border-success/40 bg-success/10 px-3 py-2 text-[13px] text-success"><CheckCircle2 className="h-4 w-4" /> Conectado e salvo.</p>
        )}

        <div className="flex items-center gap-2">
          <Button type="submit" size="md" disabled={saving}>{saving ? "Conectando…" : "Salvar e conectar"}</Button>
          <Button type="button" variant="secondary" size="md" disabled={testing || !current} onClick={() => startTest(async () => setTestState(await testWordpressAction()))}>
            {testing ? "Testando…" : "Testar"}
          </Button>
          {testState?.ok && <span className="flex items-center gap-1 text-[13px] text-success"><CheckCircle2 className="h-4 w-4" /> OK</span>}
          {testState?.error && <span className="flex items-center gap-1 text-[13px] text-danger"><AlertCircle className="h-4 w-4" /> {testState.error}</span>}
        </div>
      </form>
    </div>
  );
}
