"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { suggestBriefsAction, type SuggestState } from "@/lib/briefs/actions";

export function SuggestButton() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<SuggestState, FormData>(suggestBriefsAction, null);

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  return (
    <div className="flex flex-col items-end gap-1">
      <form action={formAction}>
        <Button type="submit" variant="secondary" size="sm" disabled={pending}>
          <Sparkles className="h-4 w-4" />
          {pending ? "Sugerindo…" : "Sugerir com IA"}
        </Button>
      </form>
      {state?.error && (
        <p className="flex items-center gap-1 text-[12px] text-danger">
          <AlertCircle className="h-3.5 w-3.5" /> {state.error}
        </p>
      )}
    </div>
  );
}
