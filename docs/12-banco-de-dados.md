# 12 — Banco de Dados

## 12.1 Decisões

- **PostgreSQL** como banco principal (relacional, transacional, maduro).
- **Multi-tenancy por linha** (`workspace_id`) + **Row-Level Security (RLS)** —
  isolamento forte sem a complexidade de schema/DB por tenant.
- **pgvector** para embeddings (RAG) no mesmo banco — menos peças móveis.
- **Soft delete** (`deleted_at`) em entidades de domínio; auditoria imutável.

> **Por que RLS por linha e não DB por tenant:** o número de workspaces é da
> ordem de dezenas/centenas (não milhares de clientes self-service). RLS dá
> isolamento de segurança no nível do banco, com operação simples e custo baixo.
> Se evoluir para milhares de tenants, a arquitetura permite migrar tenants
> grandes para schema dedicado.

## 12.2 Modelo de dados (entidades principais)

```
account (1) ──< (N) workspace ──< (N) membership >── (N) user
                     │
   ┌─────────────────┼───────────────────────────────────────────┐
   │                 │                                             │
knowledge_doc     integration        brief ──< article ──< article_version
   │                                   │         │
knowledge_chunk(+embedding)        serp_analysis  ├─ article_source
                                                  ├─ audit_result
                                                  └─ publication
ai_run (registro de cada execução de IA)
audit_log (trilha do sistema)
notification
```

### Tabelas (resumo dos campos-chave)

**account** — `id, name, created_at`.

**user** — `id, name, email (unique), password_hash, totp_secret, created_at`.

**workspace** — `id, account_id, slug (unique), name, locale, timezone,
brand (jsonb: logo, accent, voz), icp (jsonb), status, created_at, deleted_at`.

**membership** — `id, workspace_id, user_id, role (owner|admin|editor|
contributor|viewer), created_at`. (RBAC efetivo por workspace.)

**knowledge_doc** — `id, workspace_id, category (produto|comercial|casos|
juridico|dados), filename, mime, storage_key, doc_date, status (processing|
indexed|outdated|error), version, created_at, deleted_at`.

**knowledge_chunk** — `id, workspace_id, doc_id, chunk_index, content,
embedding vector(1536), tokens, created_at`.

**integration** — `id, workspace_id, provider (wordpress|search_console|ahrefs|
semrush|gdrive|crm), status, account_ref, secret_ref (KMS), config (jsonb),
last_sync_at, created_at`. *(segredos não ficam em claro — ver doc 14)*

**brief (pauta)** — `id, workspace_id, cluster_id, mode (lote|unica|
planejamento), title, target_keyword, intent, funnel_stage (topo|meio|fundo),
persona, angle, filters (jsonb: trafego/negocio/conversao + origem), score,
status, created_by, created_at`.

**serp_analysis** — `id, workspace_id, brief_id, keyword, competitors (jsonb),
gaps (jsonb), source (medido|observado|estimado), analyzed_count, created_at`.

**article** — `id, workspace_id, brief_id, title, slug, funnel_stage, status
(backlog|producing|review|approved|published), assignee_id, seo (jsonb: meta,
schema, keywords), created_at, deleted_at`.

**article_version** — `id, article_id, workspace_id, content (jsonb: blocos),
author (human|ai), created_by, created_at`. (Histórico/diff.)

**article_source** — `id, article_id, workspace_id, kind (doc|serp|verify),
ref (doc_id ou url), excerpt, origin (medido|observado|estimado|verificar),
block_anchor`. (Trilha de fontes por afirmação.)

**audit_result** — `id, article_id, workspace_id, mandatory (jsonb: itens
pass/fail + justificativa), dimensions (jsonb: nota 0-10 + justificativa),
passed (bool), created_at`.

**publication** — `id, article_id, workspace_id, target (wordpress|export),
external_id, external_url, status (draft|pending|error), payload (jsonb),
created_at`. *(status nunca “published/live” automaticamente)*

**ai_run** — `id, workspace_id, article_id, stage (research|retrieve|draft|
audit), model, prompt_hash, input_tokens, output_tokens, cost, sources (jsonb),
status, latency_ms, created_at`. (Custo e auditoria de IA.)

**audit_log** — `id, workspace_id, actor_id, action, entity, entity_id,
metadata (jsonb), ip, created_at`. (Imutável; append-only.)

**notification** — `id, workspace_id, user_id, type, payload, read_at,
created_at`.

## 12.3 Relacionamentos e integridade
- FKs com `ON DELETE` controlado; entidades de domínio usam **soft delete**.
- `membership` é a junção N:N user↔workspace com papel.
- `article` 1:N `article_version`, 1:N `article_source`, 1:1 (atual)
  `audit_result`, 1:N `publication`.
- `knowledge_doc` 1:N `knowledge_chunk`.

## 12.4 Índices (performance)
- **Tenant:** índice composto começando por `workspace_id` em **todas** as
  tabelas de domínio (ex.: `(workspace_id, status)`, `(workspace_id, created_at)`).
- **article:** `(workspace_id, status)`, `(workspace_id, brief_id)`,
  `unique (workspace_id, slug)`.
- **knowledge_chunk:** índice **HNSW**/IVFFlat em `embedding` (pgvector) +
  `(workspace_id, doc_id)`.
- **brief:** `(workspace_id, funnel_stage)`, `(workspace_id, score desc)`.
- **audit_log:** `(workspace_id, created_at desc)`, `(actor_id)`.
- **integration:** `unique (workspace_id, provider)`.
- Texto: `pg_trgm` para busca por nome de documento/artigo.

## 12.5 RLS (Row-Level Security)
- Política por tabela: `USING (workspace_id = current_setting('app.workspace_id'))`.
- A aplicação seta `app.workspace_id` por transação (a partir do contexto de
  request autenticado). Workers setam o contexto do job.
- Papel de banco da aplicação **não** é superusuário (RLS aplicada de fato).
- Migrations e tarefas administrativas usam papel separado, auditado.

## 12.6 Escalabilidade de dados
- **Read replicas** para dashboards/relatórios (consultas pesadas fora do
  primário).
- **Particionamento** futuro de `audit_log` e `ai_run` por mês (tabelas que mais
  crescem).
- **Connection pooling** (PgBouncer) para serverless/concorrência.
- **Arquivamento**: dados de workspaces arquivados movidos para storage frio.
- **Embeddings**: reindexação assíncrona ao reprocessar documentos; versão de
  modelo de embedding registrada para migração controlada.

## 12.7 Migrations e seeds
- **Prisma Migrate** versionado em CI; migrações revisadas em PR.
- Seeds: papéis, categorias de conhecimento, templates de pauta/auditoria,
  workspace de demonstração.
- Política de **backward-compatible migrations** (expand/contract) para deploy
  sem downtime.
