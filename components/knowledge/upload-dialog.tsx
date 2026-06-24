"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadDocumentsAction, type UploadState } from "@/lib/knowledge/actions";

const CATS: Array<[string, string]> = [
  ["produto", "Produto"],
  ["comercial", "Comercial"],
  ["casos", "Casos"],
  ["juridico", "Jurídico"],
  ["dados", "Dados"],
];

export function UploadDialog({ defaultCategory = "produto" }: { defaultCategory?: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [state, formAction, pending] = useActionState<UploadState, FormData>(
    async (prev, formData) => {
      const result = await uploadDocumentsAction(prev, formData);
      if (result?.ok) {
        setOpen(false);
        router.refresh();
      }
      return result;
    },
    null,
  );

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4" />
        Adicionar documentos
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-elevated p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">Adicionar documentos</h2>
              <button
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded text-text-muted hover:bg-subtle"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={formAction} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-text-secondary">
                  Categoria
                </span>
                <select
                  name="category"
                  defaultValue={defaultCategory}
                  className="h-10 w-full rounded-md border border-border bg-app px-3 text-sm outline-none focus:border-accent"
                >
                  {CATS.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-app px-4 py-8 text-center transition-colors hover:border-border-strong">
                <FileUp className="h-6 w-6 text-text-muted" />
                <span className="text-[13px] text-text-secondary">
                  Clique para selecionar arquivos
                </span>
                <span className="text-[11px] text-text-muted">
                  PDF, DOCX, MD, TXT, CSV · até 4 MB cada
                </span>
                <input
                  type="file"
                  name="files"
                  multiple
                  accept=".pdf,.docx,.md,.txt,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const label = e.currentTarget.nextElementSibling;
                    if (label) label.textContent = `${e.currentTarget.files?.length ?? 0} arquivo(s) selecionado(s)`;
                  }}
                />
                <span className="text-[11px] text-accent" />
              </label>

              {state?.error && (
                <p className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[13px] text-danger">
                  {state.error}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" size="md" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="md" disabled={pending}>
                  {pending ? "Enviando…" : "Enviar e indexar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
