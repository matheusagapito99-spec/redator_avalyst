"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateArticleAction, type AiState } from "@/lib/ai/actions";

export function GenerateButton({ articleId, label }: { articleId: string; label: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<AiState, FormData>(
    async (prev, fd) => {
      const r = await generateArticleAction(prev, fd);
      if (r?.ok) router.refresh();
      return r;
    },
    null,
  );

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="articleId" value={articleId} />
        <Button type="submit" size="md" disabled={pending}>
          <Sparkles className="h-4 w-4" />
          {pending ? "Gerando…" : label}
        </Button>
      </form>
      {state?.error && (
        <p className="mt-2 flex items-center gap-2 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[13px] text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" /> {state.error}
        </p>
      )}
    </div>
  );
}
