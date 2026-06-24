"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { GripVertical } from "lucide-react";
import {
  ARTICLE_STATUSES,
  STATUS_LABEL,
  STATUS_TONE,
  type ArticleCard,
  type ArticleStatus,
} from "@/lib/data/article-constants";
import { updateArticleStatusAction } from "@/lib/articles/actions";

const FUNNEL_TONE: Record<string, string> = {
  topo: "var(--info)",
  meio: "var(--warning)",
  fundo: "var(--success)",
};

export function Board({ initial }: { initial: ArticleCard[] }) {
  const [cards, setCards] = useState<ArticleCard[]>(initial);
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<ArticleStatus | null>(null);
  const [, startTransition] = useTransition();

  function move(id: string, status: ArticleStatus) {
    setCards((cs) => {
      const card = cs.find((c) => c.id === id);
      if (!card || card.status === status) return cs;
      return cs.map((c) => (c.id === id ? { ...c, status } : c));
    });
    startTransition(async () => {
      const fd = new FormData();
      fd.set("articleId", id);
      fd.set("status", status);
      await updateArticleStatusAction(fd);
    });
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      {ARTICLE_STATUSES.map((status) => {
        const items = cards.filter((c) => c.status === status);
        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(status);
            }}
            onDragLeave={() => setOver((s) => (s === status ? null : s))}
            onDrop={(e) => {
              e.preventDefault();
              if (dragId) move(dragId, status);
              setDragId(null);
              setOver(null);
            }}
            className={`flex min-h-[200px] flex-col rounded-lg border bg-app/40 p-2 transition-colors ${
              over === status ? "border-accent bg-subtle" : "border-border"
            }`}
          >
            <div className="mb-2 flex items-center justify-between px-1 py-1">
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-text-secondary">
                <span className="h-2 w-2 rounded-full" style={{ background: STATUS_TONE[status] }} />
                {STATUS_LABEL[status]}
              </span>
              <span className="text-[12px] text-text-muted">{items.length}</span>
            </div>

            <div className="flex flex-1 flex-col gap-2">
              {items.map((c) => (
                <article
                  key={c.id}
                  draggable
                  onDragStart={() => setDragId(c.id)}
                  onDragEnd={() => setDragId(null)}
                  className="group cursor-grab rounded-md border border-border bg-surface p-2.5 shadow-xs active:cursor-grabbing"
                >
                  <div className="flex items-start gap-1.5">
                    <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted/50" />
                    <Link
                      href={`/app/artigos/${c.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="min-w-0 flex-1 text-[13px] font-medium leading-snug hover:text-accent"
                    >
                      {c.title}
                    </Link>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 pl-5">
                    {c.funnelStage && (
                      <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: FUNNEL_TONE[c.funnelStage] }}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {c.funnelStage}
                      </span>
                    )}
                    {c.score != null && (
                      <span className="text-[11px] text-text-muted">★ {c.score.toFixed(1)}</span>
                    )}
                  </div>
                  {/* Mover via teclado/sem arrastar (acessibilidade) */}
                  <select
                    aria-label={`Mover "${c.title}" para outra coluna`}
                    value={c.status}
                    onChange={(e) => move(c.id, e.target.value as ArticleStatus)}
                    className="mt-2 w-full rounded border border-border bg-app px-1.5 py-1 text-[11px] text-text-secondary outline-none focus:border-accent"
                  >
                    {ARTICLE_STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                </article>
              ))}
              {items.length === 0 && (
                <div className="flex flex-1 items-center justify-center rounded-md border border-dashed border-border/60 py-6 text-[11px] text-text-muted">
                  vazio
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
