"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  KanbanSquare,
  Lightbulb,
  FileText,
  BookOpen,
  Search,
  Plug,
  BarChart3,
  Users,
  Settings,
  ChevronDown,
} from "lucide-react";

const nav = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Pipeline", icon: KanbanSquare },
  { label: "Pautas", icon: Lightbulb },
  { label: "Artigos", icon: FileText },
  { label: "Conhecimento", icon: BookOpen },
  { label: "SERP", icon: Search },
  { label: "Integrações", icon: Plug },
  { label: "Relatórios", icon: BarChart3 },
];

const footerNav = [
  { label: "Pessoas", icon: Users },
  { label: "Configurações", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="flex h-screen w-[260px] flex-col border-r border-border bg-surface">
      {/* Workspace switcher */}
      <div className="p-3">
        <button className="flex w-full items-center gap-2.5 rounded-md border border-border p-2 text-left transition-colors hover:bg-subtle">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-accent text-[13px] font-bold text-accent-fg">
            A
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">Avalyst</div>
            <div className="truncate text-[11px] text-text-muted">
              garantia locatícia
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-text-muted" />
        </button>
      </div>

      {/* Nav principal */}
      <nav className="flex-1 space-y-0.5 px-2">
        {nav.map((item) => (
          <Link
            key={item.label}
            href="/app"
            className={`relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
              item.active
                ? "bg-subtle font-medium text-text-primary"
                : "text-text-secondary hover:bg-subtle hover:text-text-primary"
            }`}
          >
            {item.active && (
              <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-accent" />
            )}
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Rodapé */}
      <div className="space-y-0.5 border-t border-border p-2">
        {footerNav.map((item) => (
          <Link
            key={item.label}
            href="/app"
            className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-text-secondary transition-colors hover:bg-subtle hover:text-text-primary"
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        ))}
        <div className="flex items-center gap-2.5 px-2.5 py-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-accent to-info" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium">Matheus</div>
            <div className="truncate text-[11px] text-text-muted">Owner</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
