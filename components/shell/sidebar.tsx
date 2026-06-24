import Link from "next/link";
import { Users, Settings, ChevronsUpDown, Plus, LogOut } from "lucide-react";
import { ROLE_LABEL, type Role } from "@/lib/auth/rbac";
import { logoutAction, setActiveWorkspaceAction } from "@/lib/auth/actions";
import type { WorkspaceSummary } from "@/lib/data/workspaces";
import { NavLinks } from "@/components/shell/nav-links";

const footerNav = [
  { label: "Pessoas", icon: Users },
  { label: "Configurações", icon: Settings },
];

export function Sidebar({
  active,
  workspaces,
  userName,
}: {
  active: WorkspaceSummary;
  workspaces: WorkspaceSummary[];
  userName: string;
}) {
  const initial = active.name.charAt(0).toUpperCase();

  return (
    <aside className="flex h-screen w-[260px] flex-col border-r border-border bg-surface">
      {/* Workspace switcher */}
      <div className="p-3">
        <details className="group relative">
          <summary className="flex w-full cursor-pointer list-none items-center gap-2.5 rounded-md border border-border p-2 text-left transition-colors hover:bg-subtle">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-accent text-[13px] font-bold text-accent-fg">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{active.name}</div>
              <div className="truncate text-[11px] text-text-muted">
                {ROLE_LABEL[active.role as Role]}
              </div>
            </div>
            <ChevronsUpDown className="h-4 w-4 text-text-muted" />
          </summary>

          <div className="absolute left-0 right-0 z-20 mt-1 rounded-md border border-border bg-elevated p-1 shadow-lg">
            {workspaces.map((w) => (
              <form key={w.id} action={setActiveWorkspaceAction}>
                <input type="hidden" name="slug" value={w.slug} />
                <button
                  type="submit"
                  className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-subtle ${
                    w.slug === active.slug ? "text-text-primary" : "text-text-secondary"
                  }`}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-subtle text-[11px] font-medium">
                    {w.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="truncate">{w.name}</span>
                </button>
              </form>
            ))}
            <Link
              href="/onboarding"
              className="mt-1 flex items-center gap-2 rounded px-2 py-1.5 text-sm text-accent transition-colors hover:bg-subtle"
            >
              <Plus className="h-4 w-4" />
              Novo workspace
            </Link>
          </div>
        </details>
      </div>

      {/* Nav principal */}
      <NavLinks />

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
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-accent to-info text-[11px] font-semibold text-accent-fg">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium">{userName}</div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              title="Sair"
              className="flex h-7 w-7 items-center justify-center rounded text-text-muted transition-colors hover:bg-subtle hover:text-text-primary"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
