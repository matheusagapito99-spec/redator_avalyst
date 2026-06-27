"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold, Italic, Heading2, Heading3, Quote, List,
  Sparkles, Save, AlertCircle, CheckCircle2, ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { saveArticleContentAction, aiEditAction } from "@/lib/articles/edit-actions";
import type { ArticleContent } from "@/lib/data/article-detail";

type Block = { type: string; text: string };

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function blocksToHtml(blocks: Block[]): string {
  return (blocks ?? [])
    .map((b) =>
      b.type === "h2" ? `<h2>${esc(b.text)}</h2>`
      : b.type === "h3" ? `<h3>${esc(b.text)}</h3>`
      : b.type === "faq" ? `<blockquote><p>${esc(b.text)}</p></blockquote>`
      : `<p>${esc(b.text)}</p>`,
    )
    .join("");
}
type PmNode = { type?: string; text?: string; attrs?: { level?: number }; content?: PmNode[] };
function nodeText(n: PmNode): string {
  if (!n) return "";
  if (n.type === "text") return n.text ?? "";
  return (n.content ?? []).map(nodeText).join("");
}
function docToBlocks(doc: PmNode): Block[] {
  const blocks: Block[] = [];
  for (const node of doc.content ?? []) {
    const text = nodeText(node).trim();
    if (node.type === "heading") blocks.push({ type: node.attrs?.level === 3 ? "h3" : "h2", text });
    else if (node.type === "blockquote") { if (text) blocks.push({ type: "faq", text }); }
    else if (node.type === "bulletList" || node.type === "orderedList") {
      for (const li of node.content ?? []) {
        const t = nodeText(li).trim();
        if (t) blocks.push({ type: "p", text: "• " + t });
      }
    } else if (text) blocks.push({ type: "p", text });
  }
  return blocks;
}

function TbBtn({ active, onClick, title, children }: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded transition-colors ${active ? "bg-accent text-accent-fg" : "text-text-secondary hover:bg-subtle hover:text-text-primary"}`}
    >
      {children}
    </button>
  );
}

export function ArticleEditor({
  articleId,
  initial,
}: {
  articleId: string;
  initial: ArticleContent;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title ?? "");
  const [msg, setMsg] = useState<{ ok?: string; error?: string } | null>(null);
  const [saving, startSave] = useTransition();
  const [aiPending, startAi] = useTransition();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } })],
    content: blocksToHtml(initial.blocks ?? []),
    editorProps: {
      attributes: {
        class: "prose-redator min-h-[420px] outline-none [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-4 [&_h3]:font-semibold [&_h3]:mt-3 [&_p]:my-2 [&_p]:text-sm [&_p]:leading-relaxed [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-3 [&_blockquote]:text-text-secondary [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-sm",
      },
    },
  });

  function applyAi(mode: "rewrite" | "shorten" | "expand" | "tone") {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, " ");
    if (!text.trim()) { setMsg({ error: "Selecione um trecho para usar a IA." }); return; }
    setMsg(null);
    startAi(async () => {
      const r = await aiEditAction(text, mode);
      if (r.error) { setMsg({ error: r.error }); return; }
      editor.chain().focus().insertContentAt({ from, to }, r.text!).run();
    });
  }

  function save() {
    if (!editor) return;
    setMsg(null);
    const blocks = docToBlocks(editor.getJSON() as PmNode);
    startSave(async () => {
      const r = await saveArticleContentAction(articleId, { ...initial, title, blocks });
      if (r?.error) setMsg({ error: r.error });
      else { setMsg({ ok: "Salvo." }); router.refresh(); }
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/app/artigos/${articleId}`} className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-text-primary">
        <ArrowLeft className="h-4 w-4" /> Voltar ao artigo
      </Link>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título do artigo"
        className="mb-3 w-full bg-transparent text-2xl font-semibold tracking-tight outline-none placeholder:text-text-muted"
      />

      {/* Toolbar */}
      <div className="sticky top-0 z-10 mb-3 flex flex-wrap items-center gap-1 rounded-lg border border-border bg-surface p-1.5">
        <TbBtn title="Negrito" active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></TbBtn>
        <TbBtn title="Itálico" active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></TbBtn>
        <span className="mx-1 h-5 w-px bg-border" />
        <TbBtn title="Título H2" active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></TbBtn>
        <TbBtn title="Título H3" active={editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></TbBtn>
        <TbBtn title="FAQ / citação" active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()}><Quote className="h-4 w-4" /></TbBtn>
        <TbBtn title="Lista" active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></TbBtn>
        <span className="mx-1 h-5 w-px bg-border" />
        {/* IA na seleção */}
        <div className="flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          {([["rewrite", "Reescrever"], ["shorten", "Encurtar"], ["expand", "Expandir"], ["tone", "Tom"]] as const).map(([m, l]) => (
            <button key={m} type="button" disabled={aiPending} onClick={() => applyAi(m)} className="rounded px-2 py-1 text-[12px] text-text-secondary transition-colors hover:bg-subtle hover:text-text-primary disabled:opacity-50">
              {aiPending ? "…" : l}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <Button size="sm" onClick={save} disabled={saving}><Save className="h-4 w-4" /> {saving ? "Salvando…" : "Salvar"}</Button>
        </div>
      </div>

      {msg?.error && (
        <p className="mb-3 flex items-center gap-2 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[13px] text-danger"><AlertCircle className="h-4 w-4" /> {msg.error}</p>
      )}
      {msg?.ok && (
        <p className="mb-3 flex items-center gap-2 rounded-md border border-success/40 bg-success/10 px-3 py-2 text-[13px] text-success"><CheckCircle2 className="h-4 w-4" /> {msg.ok}</p>
      )}

      <div className="rounded-lg border border-border bg-surface p-5">
        <EditorContent editor={editor} />
      </div>
      <p className="mt-2 text-[12px] text-text-muted">
        Selecione um trecho e use os botões de IA para reescrever, encurtar, expandir ou ajustar o tom.
      </p>
    </div>
  );
}
