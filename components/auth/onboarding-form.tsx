"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { createWorkspaceAction, type ActionState } from "@/lib/auth/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Criando…" : "Criar workspace"}
    </Button>
  );
}

export function OnboardingForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(
    createWorkspaceAction,
    null,
  );

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent font-bold text-accent-fg">
          R
        </div>
        <span className="text-lg font-semibold tracking-tight">Redator</span>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight">Criar o primeiro cliente</h1>
      <p className="mt-1.5 text-sm text-text-secondary">
        Cada cliente é um <strong>workspace</strong> isolado: base de conhecimento,
        integrações e pipeline próprios. Como ele se chama?
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-text-secondary">
            Nome do cliente / empresa
          </span>
          <input
            name="name"
            type="text"
            required
            autoFocus
            placeholder="Ex.: Avalyst"
            className="h-10 w-full rounded-md border border-border bg-app px-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </label>

        {state?.error && (
          <p className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[13px] text-danger">
            {state.error}
          </p>
        )}

        <SubmitButton />
      </form>
    </div>
  );
}
