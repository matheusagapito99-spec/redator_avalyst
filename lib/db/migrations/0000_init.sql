CREATE TYPE "public"."ai_stage" AS ENUM('research', 'retrieve', 'draft', 'audit');--> statement-breakpoint
CREATE TYPE "public"."article_status" AS ENUM('backlog', 'producing', 'review', 'approved', 'published');--> statement-breakpoint
CREATE TYPE "public"."brief_mode" AS ENUM('lote', 'unica', 'planejamento');--> statement-breakpoint
CREATE TYPE "public"."doc_status" AS ENUM('processing', 'indexed', 'outdated', 'error');--> statement-breakpoint
CREATE TYPE "public"."funnel_stage" AS ENUM('topo', 'meio', 'fundo');--> statement-breakpoint
CREATE TYPE "public"."integration_provider" AS ENUM('wordpress', 'search_console', 'ahrefs', 'semrush', 'gdrive', 'crm');--> statement-breakpoint
CREATE TYPE "public"."knowledge_category" AS ENUM('produto', 'comercial', 'casos', 'juridico', 'dados');--> statement-breakpoint
CREATE TYPE "public"."origin" AS ENUM('medido', 'observado', 'estimado', 'verificar');--> statement-breakpoint
CREATE TYPE "public"."publication_status" AS ENUM('draft', 'pending', 'error');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('owner', 'admin', 'editor', 'contributor', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."workspace_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_run" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"article_id" uuid,
	"stage" "ai_stage" NOT NULL,
	"model" text,
	"prompt_hash" text,
	"input_tokens" integer,
	"output_tokens" integer,
	"cost" real,
	"sources" jsonb,
	"status" text DEFAULT 'ok' NOT NULL,
	"latency_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article_source" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"ref" text,
	"excerpt" text,
	"origin" "origin" DEFAULT 'observado' NOT NULL,
	"block_anchor" text
);
--> statement-breakpoint
CREATE TABLE "article_version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"content" jsonb,
	"author" text DEFAULT 'ai' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"brief_id" uuid,
	"title" text NOT NULL,
	"slug" text,
	"funnel_stage" "funnel_stage",
	"status" "article_status" DEFAULT 'backlog' NOT NULL,
	"assignee_id" uuid,
	"seo" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid,
	"actor_id" uuid,
	"action" text NOT NULL,
	"entity" text,
	"entity_id" text,
	"metadata" jsonb,
	"ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_result" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"mandatory" jsonb,
	"dimensions" jsonb,
	"passed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brief" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"cluster_id" uuid,
	"mode" "brief_mode" NOT NULL,
	"title" text NOT NULL,
	"target_keyword" text,
	"intent" text,
	"funnel_stage" "funnel_stage",
	"persona" text,
	"angle" text,
	"filters" jsonb,
	"score" real,
	"status" text DEFAULT 'backlog' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"provider" "integration_provider" NOT NULL,
	"status" text DEFAULT 'disconnected' NOT NULL,
	"account_ref" text,
	"secret_ref" text,
	"config" jsonb,
	"last_sync_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_chunk" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"doc_id" uuid NOT NULL,
	"chunk_index" integer NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1536),
	"tokens" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_doc" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"category" "knowledge_category" NOT NULL,
	"filename" text NOT NULL,
	"mime" text,
	"storage_key" text,
	"doc_date" timestamp with time zone,
	"status" "doc_status" DEFAULT 'processing' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "membership" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "publication" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"target" text NOT NULL,
	"external_id" text,
	"external_url" text,
	"status" "publication_status" DEFAULT 'draft' NOT NULL,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "serp_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"brief_id" uuid,
	"keyword" text NOT NULL,
	"competitors" jsonb,
	"gaps" jsonb,
	"origin" "origin" DEFAULT 'observado' NOT NULL,
	"analyzed_count" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"totp_secret" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "workspace" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"locale" text DEFAULT 'pt-BR' NOT NULL,
	"timezone" text DEFAULT 'America/Sao_Paulo' NOT NULL,
	"brand" jsonb,
	"icp" jsonb,
	"status" "workspace_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "workspace_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "ai_run" ADD CONSTRAINT "ai_run_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_run" ADD CONSTRAINT "ai_run_article_id_article_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."article"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_source" ADD CONSTRAINT "article_source_article_id_article_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."article"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_source" ADD CONSTRAINT "article_source_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_version" ADD CONSTRAINT "article_version_article_id_article_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."article"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_version" ADD CONSTRAINT "article_version_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_version" ADD CONSTRAINT "article_version_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article" ADD CONSTRAINT "article_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article" ADD CONSTRAINT "article_brief_id_brief_id_fk" FOREIGN KEY ("brief_id") REFERENCES "public"."brief"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article" ADD CONSTRAINT "article_assignee_id_user_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_result" ADD CONSTRAINT "audit_result_article_id_article_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."article"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_result" ADD CONSTRAINT "audit_result_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brief" ADD CONSTRAINT "brief_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brief" ADD CONSTRAINT "brief_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration" ADD CONSTRAINT "integration_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_chunk" ADD CONSTRAINT "knowledge_chunk_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_chunk" ADD CONSTRAINT "knowledge_chunk_doc_id_knowledge_doc_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."knowledge_doc"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_doc" ADD CONSTRAINT "knowledge_doc_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership" ADD CONSTRAINT "membership_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership" ADD CONSTRAINT "membership_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publication" ADD CONSTRAINT "publication_article_id_article_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."article"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publication" ADD CONSTRAINT "publication_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "serp_analysis" ADD CONSTRAINT "serp_analysis_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "serp_analysis" ADD CONSTRAINT "serp_analysis_brief_id_brief_id_fk" FOREIGN KEY ("brief_id") REFERENCES "public"."brief"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "airun_ws_idx" ON "ai_run" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "source_article_idx" ON "article_source" USING btree ("article_id");--> statement-breakpoint
CREATE INDEX "version_article_idx" ON "article_version" USING btree ("article_id");--> statement-breakpoint
CREATE INDEX "article_ws_status_idx" ON "article" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "article_ws_slug_idx" ON "article" USING btree ("workspace_id","slug");--> statement-breakpoint
CREATE INDEX "auditlog_ws_idx" ON "audit_log" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_article_idx" ON "audit_result" USING btree ("article_id");--> statement-breakpoint
CREATE INDEX "brief_ws_idx" ON "brief" USING btree ("workspace_id","funnel_stage");--> statement-breakpoint
CREATE INDEX "brief_ws_score_idx" ON "brief" USING btree ("workspace_id","score");--> statement-breakpoint
CREATE UNIQUE INDEX "integration_ws_provider_idx" ON "integration" USING btree ("workspace_id","provider");--> statement-breakpoint
CREATE INDEX "chunk_ws_doc_idx" ON "knowledge_chunk" USING btree ("workspace_id","doc_id");--> statement-breakpoint
CREATE INDEX "doc_ws_idx" ON "knowledge_doc" USING btree ("workspace_id","category");--> statement-breakpoint
CREATE UNIQUE INDEX "membership_ws_user_idx" ON "membership" USING btree ("workspace_id","user_id");--> statement-breakpoint
CREATE INDEX "membership_user_idx" ON "membership" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_user_idx" ON "notification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "publication_article_idx" ON "publication" USING btree ("article_id");--> statement-breakpoint
CREATE INDEX "serp_ws_idx" ON "serp_analysis" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "workspace_account_idx" ON "workspace" USING btree ("account_id");