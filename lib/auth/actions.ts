"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { accounts, users } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession, getCurrentUser } from "@/lib/auth/session";
import { createWorkspace, listWorkspacesForUser } from "@/lib/data/workspaces";

export type ActionState = { error?: string } | null;

const registerSchema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  email: z.string().email("E-mail inválido."),
  password: z.string().min(8, "A senha precisa de ao menos 8 caracteres."),
});

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { name, email, password } = parsed.data;

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  if (existing.length > 0) {
    return { error: "Já existe uma conta com esse e-mail." };
  }

  const [account] = await db
    .insert(accounts)
    .values({ name: `${name} — conta` })
    .returning({ id: accounts.id });

  const [user] = await db
    .insert(users)
    .values({
      name,
      email: email.toLowerCase(),
      passwordHash: await hashPassword(password),
      accountId: account.id,
    })
    .returning({ id: users.id });

  await createSession(user.id);
  redirect("/onboarding");
}

const loginSchema = z.object({
  email: z.string().email("E-mail inválido."),
  password: z.string().min(1, "Informe a senha."),
});

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { email, password } = parsed.data;

  const rows = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  const user = rows[0];
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "E-mail ou senha incorretos." };
  }

  await createSession(user.id);

  const ws = await listWorkspacesForUser(user.id);
  redirect(ws.length > 0 ? "/app" : "/onboarding");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function setActiveWorkspaceAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // Valida que o usuário é membro antes de ativar.
  const list = await listWorkspacesForUser(user!.id);
  if (list.some((w) => w.slug === slug)) {
    const store = await cookies();
    store.set("active_ws", slug, { httpOnly: true, sameSite: "lax", path: "/" });
  }
  redirect("/app");
}

const workspaceSchema = z.object({
  name: z.string().min(2, "Informe o nome do cliente/empresa."),
});

export async function createWorkspaceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = workspaceSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  if (!user!.accountId) return { error: "Conta não encontrada." };

  await createWorkspace(user!.accountId, user!.id, parsed.data.name);
  redirect("/app");
}
