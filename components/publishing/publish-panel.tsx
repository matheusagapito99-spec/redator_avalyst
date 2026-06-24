"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Download, ExternalLink, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { publishToWordpressAction, exportArticleAction } from "@/lib/publishing/actions";

export function PublishPanel({
  articleId,
  status,
  wpConnected,
  publication,
}: {
  articleId: string;
  status: string;
  wpConnected: boolean;
  publication: { status: string; externalUrl: string | null } | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok?: string; error?: string } | null>(null);

  function publish() {
    setMsg(null);
    const fd = new FormData();
    fd.set("articleId", articleId);
    start(async () => {
      const r = await publishToWordpressAction(null, fd);
      if (r?.error) setMsg({ error: r.error });
      else {
        setMsg({ ok: "Rascunho criado no WordPress." });
        router.refresh();
      }
    });
  }

  function exportAs(format: "md" | "html") {
    start(async () => {
      const r = await exportArticleAction(articleId, format);
      if ("error" in r) {
        setMsg({ error: r.error });
        return;
      }
      const blob = new Blob([r.data], { type: format === "md" ? "text/markdown" : "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = r.filename;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  const canPublish = status === "approved" || status === "published";

  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <h2 className="mb-2 flex items-center gap-1.5 text-[13px] font-medium"><UploadCloud className="h-4 w-4" /> Publicação</h2>

      {!canPublish && (
        <p className="mb-3 text-[12px] text-text-muted">Aprove o artigo na auditoria para habilitar a publicação.</p>
      )}

      {publication?.status === "draft" && publication.externalUrl && (
        <a href={publication.externalUrl} target="_blank" rel="noreferrer" className="mb-3 flex items-center gap-1.5 rounded-md border border-success/30 bg-success/10 px-2.5 py-2 text-[12px] text-success">
          <CheckCircle2 className="h-3.5 w-3.5" /> Rascunho no WordPress <ExternalLink className="h-3 w-3" />
        </a>
      )}

      {msg?.error && (
        <p className="mb-3 flex items-start gap-2 rounded-md border border-danger/40 bg-danger/10 px-2.5 py-2 text-[12px] text-danger"><AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {msg.error}</p>
      )}
      {msg?.ok && (
        <p className="mb-3 flex items-center gap-2 rounded-md border border-success/40 bg-success/10 px-2.5 py-2 text-[12px] text-success"><CheckCircle2 className="h-3.5 w-3.5" /> {msg.ok}</p>
      )}

      <div className="flex flex-col gap-2">
        <Button size="sm" disabled={pending || !canPublish || !wpConnected} onClick={publish} title={!wpConnected ? "Conecte o WordPress em Integrações" : undefined}>
          <UploadCloud className="h-4 w-4" /> {publication?.status === "draft" ? "Reenviar rascunho" : "Publicar como rascunho"}
        </Button>
        {!wpConnected && <p className="text-[11px] text-text-muted">WordPress não conectado — use o export ou conecte em Integrações.</p>}
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" disabled={pending} onClick={() => exportAs("md")}><Download className="h-3.5 w-3.5" /> Markdown</Button>
          <Button size="sm" variant="secondary" disabled={pending} onClick={() => exportAs("html")}><Download className="h-3.5 w-3.5" /> HTML</Button>
        </div>
      </div>
    </section>
  );
}
