import "server-only";
import { and, eq, isNull, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { workspaces, memberships } from "@/lib/db/schema";
import type { Role } from "@/lib/auth/rbac";

function slugify(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "workspace"
  );
}

export type WorkspaceSummary = {
  id: string;
  slug: string;
  name: string;
  role: Role;
};

/** Lista os workspaces a que o usuário pertence (com seu papel em cada). */
export async function listWorkspacesForUser(userId: string): Promise<WorkspaceSummary[]> {
  const rows = await db
    .select({
      id: workspaces.id,
      slug: workspaces.slug,
      name: workspaces.name,
      role: memberships.role,
    })
    .from(memberships)
    .innerJoin(workspaces, eq(memberships.workspaceId, workspaces.id))
    .where(and(eq(memberships.userId, userId), isNull(workspaces.deletedAt)))
    .orderBy(desc(workspaces.createdAt));
  return rows as WorkspaceSummary[];
}

/** Resolve o workspace ativo: o preferido (se o usuário for membro) ou o mais recente. */
export async function getActiveWorkspace(userId: string, preferredSlug?: string) {
  const list = await listWorkspacesForUser(userId);
  if (list.length === 0) return { list, active: null as WorkspaceSummary | null };
  const active =
    (preferredSlug && list.find((w) => w.slug === preferredSlug)) || list[0];
  return { list, active };
}

/** Busca um workspace pelo slug garantindo que o usuário é membro. */
export async function getWorkspaceForUser(userId: string, slug: string) {
  const rows = await db
    .select({
      id: workspaces.id,
      slug: workspaces.slug,
      name: workspaces.name,
      brand: workspaces.brand,
      role: memberships.role,
    })
    .from(memberships)
    .innerJoin(workspaces, eq(memberships.workspaceId, workspaces.id))
    .where(
      and(
        eq(memberships.userId, userId),
        eq(workspaces.slug, slug),
        isNull(workspaces.deletedAt),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

/** Cria um workspace e adiciona o usuário como owner. Retorna o slug. */
export async function createWorkspace(
  accountId: string,
  userId: string,
  name: string,
): Promise<string> {
  const base = slugify(name);
  let slug = base;
  for (let i = 0; i < 5; i++) {
    const existing = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.slug, slug))
      .limit(1);
    if (existing.length === 0) break;
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const [ws] = await db
    .insert(workspaces)
    .values({ accountId, name, slug })
    .returning({ id: workspaces.id, slug: workspaces.slug });

  await db.insert(memberships).values({
    workspaceId: ws.id,
    userId,
    role: "owner",
  });

  return ws.slug;
}
