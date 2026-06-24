/** Constantes e tipos de artigo compartilhados entre client e server (sem DB). */
export const ARTICLE_STATUSES = [
  "backlog",
  "producing",
  "review",
  "approved",
  "published",
] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export const STATUS_LABEL: Record<ArticleStatus, string> = {
  backlog: "Backlog",
  producing: "Produção",
  review: "Revisão",
  approved: "Aprovado",
  published: "Publicado",
};

export const STATUS_TONE: Record<ArticleStatus, string> = {
  backlog: "var(--text-muted)",
  producing: "var(--info)",
  review: "var(--warning)",
  approved: "var(--success)",
  published: "var(--accent)",
};

export type ArticleCard = {
  id: string;
  title: string;
  funnelStage: string | null;
  status: ArticleStatus;
  score: number | null;
  persona: string | null;
  createdAt: string;
};
