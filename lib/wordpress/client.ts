import "server-only";

export type WpConfig = { siteUrl: string; username: string; appPassword: string };

function authHeader(cfg: WpConfig): string {
  // Application Passwords vêm com espaços; remove para o Basic auth.
  const pass = cfg.appPassword.replace(/\s+/g, "");
  return "Basic " + Buffer.from(`${cfg.username}:${pass}`).toString("base64");
}

function base(cfg: WpConfig): string {
  return cfg.siteUrl.replace(/\/+$/, "");
}

function wpError(status: number, body: string): string {
  if (status === 401 || status === 403) return "WordPress: credenciais inválidas (verifique usuário e Application Password).";
  if (status === 404) return "WordPress: endpoint REST não encontrado (a URL do site está correta?).";
  const m = body.match(/"message":"([^"]+)"/);
  return `WordPress retornou erro ${status}${m ? `: ${m[1]}` : ""}.`;
}

/** Testa a conexão consultando o usuário autenticado. */
export async function wpTestConnection(cfg: WpConfig): Promise<void> {
  const res = await fetch(`${base(cfg)}/wp-json/wp/v2/users/me?context=edit`, {
    headers: { Authorization: authHeader(cfg) },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(wpError(res.status, await res.text()));
}

/** Cria um post como RASCUNHO. Nunca publica ao ar. */
export async function wpCreateDraft(
  cfg: WpConfig,
  post: { title: string; html: string; slug?: string; excerpt?: string },
): Promise<{ id: number; link: string; editLink: string }> {
  const res = await fetch(`${base(cfg)}/wp-json/wp/v2/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authHeader(cfg) },
    body: JSON.stringify({
      title: post.title,
      content: post.html,
      slug: post.slug,
      excerpt: post.excerpt,
      status: "draft",
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(wpError(res.status, await res.text()));
  const data = await res.json();
  const link = data?.link ?? "";
  const editLink = `${base(cfg)}/wp-admin/post.php?post=${data?.id}&action=edit`;
  return { id: data?.id, link, editLink };
}
