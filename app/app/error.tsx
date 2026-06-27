"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex h-screen flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-danger/10 text-danger">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-semibold">Algo deu errado</h2>
      <p className="max-w-md text-sm text-text-secondary">
        Ocorreu um erro ao carregar esta tela. Você pode tentar novamente.
      </p>
      {error?.message && (
        <p className="max-w-md rounded-md border border-border bg-surface px-3 py-2 text-[12px] text-text-muted">
          {error.message}
        </p>
      )}
      <div className="mt-2">
        <Button size="md" onClick={reset}>Tentar novamente</Button>
      </div>
    </div>
  );
}
