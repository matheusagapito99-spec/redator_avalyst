/**
 * Modelo de dados do Redator (doc 12).
 * Multi-tenant por linha: `workspaceId` em toda tabela de domínio.
 * Embeddings via pgvector para RAG.
 */
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  boolean,
  real,
  vector,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/* ----------------------------- Enums ----------------------------- */
export const roleEnum = pgEnum("role", [
  "owner",
  "admin",
  "editor",
  "contributor",
  "viewer",
]);
export const workspaceStatusEnum = pgEnum("workspace_status", [
  "active",
  "archived",
]);
export const knowledgeCategoryEnum = pgEnum("knowledge_category", [
  "produto",
  "comercial",
  "casos",
  "juridico",
  "dados",
]);
export const docStatusEnum = pgEnum("doc_status", [
  "processing",
  "indexed",
  "outdated",
  "error",
]);
export const integrationProviderEnum = pgEnum("integration_provider", [
  "wordpress",
  "search_console",
  "ahrefs",
  "semrush",
  "gdrive",
  "crm",
]);
export const briefModeEnum = pgEnum("brief_mode", [
  "lote",
  "unica",
  "planejamento",
]);
export const funnelStageEnum = pgEnum("funnel_stage", ["topo", "meio", "fundo"]);
export const articleStatusEnum = pgEnum("article_status", [
  "backlog",
  "producing",
  "review",
  "approved",
  "published",
]);
export const originEnum = pgEnum("origin", [
  "medido",
  "observado",
  "estimado",
  "verificar",
]);
export const aiStageEnum = pgEnum("ai_stage", [
  "research",
  "retrieve",
  "draft",
  "audit",
]);
export const publicationStatusEnum = pgEnum("publication_status", [
  "draft",
  "pending",
  "error",
]);

/* ----------------------------- Conta & Usuários ----------------------------- */
export const accounts = pgTable("account", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id").references(() => accounts.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  totpSecret: text("totp_secret"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable(
  "session",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("session_user_idx").on(t.userId)],
);

/* ----------------------------- Workspaces & Membros ----------------------------- */
export const workspaces = pgTable(
  "workspace",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    locale: text("locale").default("pt-BR").notNull(),
    timezone: text("timezone").default("America/Sao_Paulo").notNull(),
    brand: jsonb("brand").$type<{
      logo?: string;
      accent?: string;
      voice?: string;
    }>(),
    icp: jsonb("icp").$type<Record<string, unknown>>(),
    status: workspaceStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("workspace_account_idx").on(t.accountId)],
);

export const memberships = pgTable(
  "membership",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: roleEnum("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("membership_ws_user_idx").on(t.workspaceId, t.userId),
    index("membership_user_idx").on(t.userId),
  ],
);

/* ----------------------------- Base de conhecimento ----------------------------- */
export const knowledgeDocs = pgTable(
  "knowledge_doc",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    category: knowledgeCategoryEnum("category").notNull(),
    filename: text("filename").notNull(),
    mime: text("mime"),
    storageKey: text("storage_key"),
    docDate: timestamp("doc_date", { withTimezone: true }),
    status: docStatusEnum("status").default("processing").notNull(),
    version: integer("version").default(1).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("doc_ws_idx").on(t.workspaceId, t.category)],
);

export const knowledgeChunks = pgTable(
  "knowledge_chunk",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    docId: uuid("doc_id")
      .notNull()
      .references(() => knowledgeDocs.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
    tokens: integer("tokens"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("chunk_ws_doc_idx").on(t.workspaceId, t.docId)],
);

/* ----------------------------- Integrações ----------------------------- */
export const integrations = pgTable(
  "integration",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    provider: integrationProviderEnum("provider").notNull(),
    status: text("status").default("disconnected").notNull(),
    accountRef: text("account_ref"),
    secretRef: text("secret_ref"),
    config: jsonb("config").$type<Record<string, unknown>>(),
    lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("integration_ws_provider_idx").on(t.workspaceId, t.provider)],
);

/* ----------------------------- Pautas & SERP ----------------------------- */
export const briefs = pgTable(
  "brief",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    clusterId: uuid("cluster_id"),
    mode: briefModeEnum("mode").notNull(),
    title: text("title").notNull(),
    targetKeyword: text("target_keyword"),
    intent: text("intent"),
    funnelStage: funnelStageEnum("funnel_stage"),
    persona: text("persona"),
    angle: text("angle"),
    filters: jsonb("filters").$type<Record<string, unknown>>(),
    score: real("score"),
    status: text("status").default("backlog").notNull(),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("brief_ws_idx").on(t.workspaceId, t.funnelStage),
    index("brief_ws_score_idx").on(t.workspaceId, t.score),
  ],
);

export const serpAnalyses = pgTable(
  "serp_analysis",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    briefId: uuid("brief_id").references(() => briefs.id, { onDelete: "cascade" }),
    keyword: text("keyword").notNull(),
    competitors: jsonb("competitors").$type<unknown[]>(),
    gaps: jsonb("gaps").$type<unknown[]>(),
    origin: originEnum("origin").default("observado").notNull(),
    analyzedCount: integer("analyzed_count"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("serp_ws_idx").on(t.workspaceId)],
);

/* ----------------------------- Artigos ----------------------------- */
export const articles = pgTable(
  "article",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    briefId: uuid("brief_id").references(() => briefs.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    slug: text("slug"),
    funnelStage: funnelStageEnum("funnel_stage"),
    status: articleStatusEnum("status").default("backlog").notNull(),
    assigneeId: uuid("assignee_id").references(() => users.id),
    seo: jsonb("seo").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("article_ws_status_idx").on(t.workspaceId, t.status),
    uniqueIndex("article_ws_slug_idx").on(t.workspaceId, t.slug),
  ],
);

export const articleVersions = pgTable(
  "article_version",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    content: jsonb("content").$type<Record<string, unknown>>(),
    author: text("author").default("ai").notNull(),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("version_article_idx").on(t.articleId)],
);

export const articleSources = pgTable(
  "article_source",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    ref: text("ref"),
    excerpt: text("excerpt"),
    origin: originEnum("origin").default("observado").notNull(),
    blockAnchor: text("block_anchor"),
  },
  (t) => [index("source_article_idx").on(t.articleId)],
);

export const auditResults = pgTable(
  "audit_result",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    mandatory: jsonb("mandatory").$type<unknown[]>(),
    dimensions: jsonb("dimensions").$type<Record<string, unknown>>(),
    passed: boolean("passed").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("audit_article_idx").on(t.articleId)],
);

export const publications = pgTable(
  "publication",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    target: text("target").notNull(),
    externalId: text("external_id"),
    externalUrl: text("external_url"),
    status: publicationStatusEnum("status").default("draft").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("publication_article_idx").on(t.articleId)],
);

/* ----------------------------- IA & Auditoria do sistema ----------------------------- */
export const aiRuns = pgTable(
  "ai_run",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    articleId: uuid("article_id").references(() => articles.id, { onDelete: "set null" }),
    stage: aiStageEnum("stage").notNull(),
    model: text("model"),
    promptHash: text("prompt_hash"),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    cost: real("cost"),
    sources: jsonb("sources").$type<unknown[]>(),
    status: text("status").default("ok").notNull(),
    latencyMs: integer("latency_ms"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("airun_ws_idx").on(t.workspaceId, t.createdAt)],
);

export const auditLogs = pgTable(
  "audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").references(() => workspaces.id, {
      onDelete: "cascade",
    }),
    actorId: uuid("actor_id").references(() => users.id),
    action: text("action").notNull(),
    entity: text("entity"),
    entityId: text("entity_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ip: text("ip"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("auditlog_ws_idx").on(t.workspaceId, t.createdAt)],
);

export const notifications = pgTable(
  "notification",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").references(() => workspaces.id, {
      onDelete: "cascade",
    }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("notification_user_idx").on(t.userId)],
);
