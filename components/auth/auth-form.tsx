"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/auth/actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Aguarde…" : label}
    </Button>
  );
}

type Props = {
  mode: "login" | "register";
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
};

export function AuthForm({ mode, action }: Props) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, null);
  const isRegister = mode === "register";

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent font-bold text-accent-fg">
          R
        </div>
        <span className="text-lg font-semibold tracking-tight">Redator</span>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight">
        {isRegister ? "Criar sua conta" : "Bem-vindo de volta"}
      </h1>
      <p className="mt-1.5 text-sm text-text-secondary">
        {isRegister
          ? "Comece a operar conteúdo para seus clientes."
          : "Entre para continuar suas operações."}
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        {isRegister && (
          <Field label="Nome" name="name" type="text" placeholder="Seu nome" autoComplete="name" />
        )}
        <Field
          label="E-mail"
          name="email"
          type="email"
          placeholder="voce@empresa.com"
          autoComplete="email"
        />
        <Field
          label="Senha"
          name="password"
          type="password"
          placeholder={isRegister ? "Mínimo 8 caracteres" : "Sua senha"}
          autoComplete={isRegister ? "new-password" : "current-password"}
        />

        {state?.error && (
          <p className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[13px] text-danger">
            {state.error}
          </p>
        )}

        <SubmitButton label={isRegister ? "Criar conta" : "Entrar"} />
      </form>

      <p className="mt-6 text-center text-[13px] text-text-secondary">
        {isRegister ? (
          <>
            Já tem conta?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Entrar
            </Link>
          </>
        ) : (
          <>
            Não tem conta?{" "}
            <Link href="/register" className="text-accent hover:underline">
              Criar conta
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function Field({
  label,
  name,
  type,
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-text-secondary">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="h-10 w-full rounded-md border border-border bg-app px-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/30"
      />
    </label>
  );
}
