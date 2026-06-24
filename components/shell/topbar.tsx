"use client";

import { Search, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Topbar({
  workspace,
  breadcrumb,
}: {
  workspace: string;
  breadcrumb: string;
}) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-6">
      <div className="text-sm text-text-secondary">
        <span className="text-text-muted">{workspace}</span>
        <span className="mx-1.5 text-text-muted">/</span>
        <span className="font-medium text-text-primary">{breadcrumb}</span>
      </div>

      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-[13px] text-text-muted transition-colors hover:bg-subtle">
          <Search className="h-3.5 w-3.5" />
          Buscar
          <kbd className="ml-2 rounded border border-border bg-app px-1.5 py-0.5 text-[11px]">
            ⌘K
          </kbd>
        </button>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-subtle">
          <Bell className="h-[18px] w-[18px]" />
        </button>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Nova execução
        </Button>
      </div>
    </header>
  );
}
