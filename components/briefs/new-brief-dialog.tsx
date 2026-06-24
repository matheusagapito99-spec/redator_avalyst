"use client";

import { useState, useActionState } from "react";
import { Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBriefAction, type BriefState } from "@/lib/briefs/actions";

const INTENTS: Array<[string, string]> = [
  ["informacional", "Informacional"],
  ["comparacao", "Comparação"],
  ["transacional", "Transacional"],
];
const FUNNEL: Array<[string, string]> = [
  ["topo", "Topo — atrai"],
  ["meio", "Meio — qualifica"],
  ["fundo", "Fundo — converte"],
];
const PERSONAS = [
  "Diretor de locação escalável",
  "Dono de imobiliária regional",
  "Gestora de operações modernas",
  "Inquilino / proprietário (PF)",
];
const LEVELS: Array<[string, string]> = [
  ["baixo", "Baixo"],
  ["medio", "Médio"],
  ["alto", "Alto"],
];

function Select({ name, label, options, defaultValue }: { name: string; label: string; options: Array<[string, string]>; defaultValue?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-text-secondary">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="h-10 w-full rounded-md border border-border bg-app px-3 text-sm outline-none focus:border-accent"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </label>
  );
}

export function NewBriefDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<BriefState, FormData>(createBriefAction, null);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Lightbulb className="h-4 w-4" />
        Nova pauta
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-elevated p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">Nova pauta</h2>
              <button onClick={() => setOpen(false)} className="flex h-7 w-7 items-center justify-center rounded text-text-muted hover:bg-subtle">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={formAction} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-text-secondary">Título</span>
                <input name="title" required placeholder="Ex.: Seguro fiança vs. título de capitalização" className="h-10 w-full rounded-md border border-border bg-app px-3 text-sm outline-none placeholder:text-text-muted focus:border-accent" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-text-secondary">Palavra-chave-alvo</span>
                <input name="targetKeyword" required placeholder="Ex.: seguro fiança imobiliária" className="h-10 w-full rounded-md border border-border bg-app px-3 text-sm outline-none placeholder:text-text-muted focus:border-accent" />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <Select name="intent" label="Intenção" options={INTENTS} defaultValue="informacional" />
                <Select name="funnelStage" label="Etapa do funil" options={FUNNEL} defaultValue="topo" />
              </div>

              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-text-secondary">Persona</span>
                <select name="persona" defaultValue={PERSONAS[0]} className="h-10 w-full rounded-md border border-border bg-app px-3 text-sm outline-none focus:border-accent">
                  {PERSONAS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-text-secondary">Ângulo de diferenciação <span className="text-text-muted">(opcional)</span></span>
                <textarea name="angle" rows={2} placeholder="A lacuna que cobrimos frente à SERP" className="w-full resize-none rounded-md border border-border bg-app px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:border-accent" />
              </label>

              <div>
                <span className="mb-1.5 block text-[13px] font-medium text-text-secondary">Filtros de prioridade</span>
                <div className="grid grid-cols-3 gap-3">
                  <Select name="trafego" label="Tráfego" options={LEVELS} defaultValue="medio" />
                  <Select name="negocio" label="Negócio" options={LEVELS} defaultValue="medio" />
                  <Select name="conversao" label="Conversão" options={LEVELS} defaultValue="medio" />
                </div>
              </div>

              {state?.error && (
                <p className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[13px] text-danger">{state.error}</p>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" size="md" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" size="md" disabled={pending}>{pending ? "Criando…" : "Criar pauta"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
