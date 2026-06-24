/** Hierarquia de papéis (RBAC por workspace) — ver docs/03 e docs/14. */
export type Role = "owner" | "admin" | "editor" | "contributor" | "viewer";

const RANK: Record<Role, number> = {
  viewer: 0,
  contributor: 1,
  editor: 2,
  admin: 3,
  owner: 4,
};

/** Verifica se `role` atende ao papel mínimo exigido. */
export function atLeast(role: Role, min: Role): boolean {
  return RANK[role] >= RANK[min];
}

export const ROLE_LABEL: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  contributor: "Contributor",
  viewer: "Viewer",
};
