import "server-only";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCurrentUser, type CurrentUser } from "@/lib/auth/session";
import { getActiveWorkspace, type WorkspaceSummary } from "@/lib/data/workspaces";
import { atLeast, type Role } from "@/lib/auth/rbac";

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Exige usuário autenticado + um workspace ativo. Usado por todas as telas de /app. */
export async function requireActiveWorkspace(): Promise<{
  user: CurrentUser;
  ws: WorkspaceSummary;
}> {
  const user = await requireUser();
  const store = await cookies();
  const { active } = await getActiveWorkspace(user.id, store.get("active_ws")?.value);
  if (!active) redirect("/onboarding");
  return { user, ws: active };
}

/** Garante papel mínimo no workspace ativo (autorização no servidor). */
export function ensureRole(role: Role, min: Role) {
  if (!atLeast(role, min)) {
    throw new Error("Permissão insuficiente para esta ação.");
  }
}
