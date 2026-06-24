/** Conversão do conteúdo (blocos) para Markdown e HTML. Sem dependência de DB. */
export type Block = { type: string; text: string };
export type Content = {
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  blocks?: Block[];
};

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function toMarkdown(content: Content): string {
  const lines: string[] = [];
  if (content.title) lines.push(`# ${content.title}`, "");
  for (const b of content.blocks ?? []) {
    if (b.type === "h2") lines.push(`## ${b.text}`, "");
    else if (b.type === "h3") lines.push(`### ${b.text}`, "");
    else if (b.type === "faq") lines.push(`**FAQ —** ${b.text}`, "");
    else lines.push(b.text, "");
  }
  return lines.join("\n").trim() + "\n";
}

/** HTML do corpo (sem H1 — o título vai no campo title do WordPress). */
export function toHtml(content: Content, includeTitle = false): string {
  const parts: string[] = [];
  if (includeTitle && content.title) parts.push(`<h1>${esc(content.title)}</h1>`);
  for (const b of content.blocks ?? []) {
    if (b.type === "h2") parts.push(`<h2>${esc(b.text)}</h2>`);
    else if (b.type === "h3") parts.push(`<h3>${esc(b.text)}</h3>`);
    else if (b.type === "faq") parts.push(`<p><strong>FAQ —</strong> ${esc(b.text)}</p>`);
    else parts.push(`<p>${esc(b.text)}</p>`);
  }
  return parts.join("\n");
}
