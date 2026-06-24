"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KanbanSquare,
  Lightbulb,
  FileText,
  BookOpen,
  Search,
  Plug,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

type Item = { label: string; href: string; icon: LucideIcon; enabled: boolean };

const items: Item[] = [
  { label: "Dashboard", href: "/app", icon: LayoutDashboard, enabled: true },
  { label: "Pipeline", href: "/app/pipeline", icon: KanbanSquare, enabled: true },
  { label: "Pautas", href: "/app/pautas", icon: Lightbulb, enabled: true },
  { label: "Artigos", href: "/app/artigos", icon: FileText, enabled: false },
  { label: "Conhecimento", href: "/app/conhecimento", icon: BookOpen, enabled: true },
  { label: "SERP", href: "/app/serp", icon: Search, enabled: false },
  { label: "Integrações", href: "/app/integracoes", icon: Plug, enabled: false },
  { label: "Relatórios", href: "/app/relatorios", icon: BarChart3, enabled: false },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-0.5 px-2">
      {items.map((item) => {
        const active =
          item.href === "/app"
            ? pathname === "/app"
            : pathname.startsWith(item.href);

        if (!item.enabled) {
          return (
            <div
              key={item.label}
              title="Em breve"
              className="flex cursor-default items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-text-muted/60"
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
              <span className="ml-auto text-[10px] uppercase tracking-wide text-text-muted/50">
                em breve
              </span>
            </div>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
              active
                ? "bg-subtle font-medium text-text-primary"
                : "text-text-secondary hover:bg-subtle hover:text-text-primary"
            }`}
          >
            {active && (
              <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-accent" />
            )}
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
