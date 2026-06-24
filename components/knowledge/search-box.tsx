"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function SearchBox({ initial = "" }: { initial?: string }) {
  const [q, setQ] = useState(initial);
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const params = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
        router.push(`/app/conhecimento${params}`);
      }}
      className="relative w-full max-w-xs"
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar na base…"
        className="h-9 w-full rounded-md border border-border bg-app pl-9 pr-3 text-sm outline-none placeholder:text-text-muted focus:border-accent"
      />
    </form>
  );
}
