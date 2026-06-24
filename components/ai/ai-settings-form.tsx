"use client";

import { useState, useActionState, useTransition } from "react";
import { ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROVIDERS } from "@/lib/ai/provider-meta";
import { saveAiSettingsAction, testAiConnectionAction, type AiState } from "@/lib/ai/actions";

export function AiSettingsForm({
  current,
}: {
  current: { provider: string; model: string; keyHint: string | null } | null;
}) {
  const [providerId, setProviderId] = useState(current?.provider ?? "gemini");
  const provider = PROVIDERS.find((p) => p.id === providerId) ?? PROVIDERS[0];
  const [model, setModel] = useState(
    current?.model && provider.models.some((m) => m.id === current.model)
      ? current.model
      : provider.models[0].id,
  );

  const [state, formAction, saving] = useActionState<AiState, FormData>(saveAiSettingsAction, null);
  const [testState, setTestState] = useState<AiState>(null);
  const [testing, startTest] = useTransition();

  function onProviderChange(id: string) {
    setProviderId(id);
    const p = PROVIDERS.find((x) => x.id === id)!;
    setModel(p.models[0].id);
  }

  return (
    <div className="max-w-xl space-y-5">
      <form action={formAction} className="space-y-4 rounded-lg border border-border bg-surface p-5">
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">Provedor de IA</label>
          <select
            name="provider"
            value={providerId}
            onChange={(e) => onProviderChange(e.target.value)}
            className="h-10 w-full rounded-md border border-border bg-app px-3 text-sm outline-none focus:border-accent"
          >
            {PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          {provider.note && <p className="mt-1.5 text-[12px] text-text-muted">{provider.note}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">Modelo</label>
          <select
            name="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="h-10 w-full rounded-md border border-border bg-app px-3 text-sm outline-none focus:border-accent"
          >
            {provider.models.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
            API key
            <a href={provider.keyUrl} target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center gap-1 text-[12px] text-accent hover:underline">
              obter chave <ExternalLink className="h-3 w-3" />
            </a>
          </label>
          <input
            name="apiKey"
            type="password"
            autoComplete="off"
            placeholder={current?.keyHint ? `Configurada (${current.keyHint}) — cole para trocar` : `Cole a chave (${provider.keyPrefix})`}
            className="h-10 w-full rounded-md border border-border bg-app px-3 font-mono text-sm outline-none placeholder:text-text-muted placeholder:font-sans focus:border-accent"
          />
          <p className="mt-1.5 text-[12px] text-text-muted">
            A chave é criptografada no banco e nunca volta inteira para a tela.
          </p>
        </div>

        {state?.error && (
          <p className="flex items-center gap-2 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[13px] text-danger">
            <AlertCircle className="h-4 w-4" /> {state.error}
          </p>
        )}
        {state?.ok && (
          <p className="flex items-center gap-2 rounded-md border border-success/40 bg-success/10 px-3 py-2 text-[13px] text-success">
            <CheckCircle2 className="h-4 w-4" /> Configuração salva.
          </p>
        )}

        <div className="flex items-center gap-2">
          <Button type="submit" size="md" disabled={saving}>{saving ? "Salvando…" : "Salvar"}</Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            disabled={testing || !current}
            onClick={() => startTest(async () => setTestState(await testAiConnectionAction()))}
          >
            {testing ? "Testando…" : "Testar conexão"}
          </Button>
          {testState?.ok && <span className="flex items-center gap-1 text-[13px] text-success"><CheckCircle2 className="h-4 w-4" /> Conectado</span>}
          {testState?.error && <span className="flex items-center gap-1 text-[13px] text-danger"><AlertCircle className="h-4 w-4" /> {testState.error}</span>}
        </div>
      </form>
    </div>
  );
}
