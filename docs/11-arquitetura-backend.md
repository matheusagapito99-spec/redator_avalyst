# 11 — Arquitetura Backend

## 11.1 Estilo arquitetural: monólito modular

**Decisão:** **monólito modular** em Node.js/TypeScript (NestJS), com fronteiras
de módulo bem definidas e workers assíncronos separados. **Não** microsserviços
no início.

> **Justificativa:** o time é pequeno e o domínio ainda evolui. Microsserviços
> agora adicionam custo de operação (rede, deploy, observabilidade distribuída)
> sem ganho. O monólito modular dá isolamento lógico e permite extrair um módulo
> em serviço próprio depois, se a escala exigir (ex.: o worker de IA).

## 11.2 Stack

| Item | Escolha | Por quê |
|---|---|---|
| Runtime | Node.js LTS + TypeScript | Tipos compartilhados com o front; ecossistema |
| Framework | **NestJS** | Modularidade, DI, estrutura enterprise, validação |
| API | **tRPC** (interno) + **REST** (webhooks/integrações) | Tipagem ponta a ponta + interoperabilidade |
| ORM | **Prisma** | Migrations, tipos, produtividade |
| Banco | **PostgreSQL** (+ RLS) | Relacional robusto, multi-tenant por RLS |
| Vetores | **pgvector** | RAG sem novo serviço; embeddings no mesmo Postgres |
| Cache/locks | **Redis** | Cache, rate limit, locks de job |
| Filas | **BullMQ** (Redis) | Jobs assíncronos de IA/ingestão, retries, prioridade |
| Storage | **S3** (ou R2) | Documentos da base, exports |
| IA | **Claude (Anthropic)** | Redação/auditoria; modelo por tarefa |
| Realtime | **WebSocket/SSE** | Progresso de jobs, status |
| Busca web | provider de SERP | Análise `OBSERVADO` |

## 11.3 Módulos de domínio

```
src/
├── modules/
│   ├── auth/            # login, sessão, 2FA, SSO
│   ├── accounts/        # conta (org do operador)
│   ├── workspaces/      # CRUD, membros, RBAC, settings, branding
│   ├── knowledge/       # upload, ingestão, chunking, embeddings, busca
│   ├── integrations/    # conectores (WordPress, SEO, Drive, CRM) + segredos
│   ├── serp/            # análise de SERP/concorrentes
│   ├── briefs/          # pautas, clusters, filtros, modos de execução
│   ├── content/         # artigos, versões, blocos, citações
│   ├── ai/              # orquestração de geração e auditoria (RAG)
│   ├── audit-quality/   # checklist, conformidade, gates
│   ├── publishing/      # envio ao CMS (rascunho), export
│   ├── reports/         # métricas, relatório de saída
│   ├── notifications/   # in-app + e-mail
│   └── system-audit/    # trilha de auditoria (quem fez o quê)
├── workers/             # processadores BullMQ (ingestão, geração, auditoria)
├── common/              # guards, interceptors, RLS context, errors, logging
└── infra/               # prisma, redis, s3, anthropic, mailer
```

## 11.4 Orquestração de IA (o coração)

Pipeline de geração como **máquina de estados** rodando em workers:

```
brief → research(SERP) → retrieve(RAG) → outline → draft → self-check →
audit → ready_for_review
```

1. **research:** consulta SERP (`OBSERVADO`), mapeia concorrentes e lacunas.
2. **retrieve (RAG):** busca semântica na base do workspace (pgvector) →
   contexto com citações. Meio/fundo exigem contexto; sem cobertura → marca
   `[CONFIRMAR COM TIME]`.
3. **draft:** geração com **Claude**, na voz do workspace, com instruções de
   conformidade e os princípios inegociáveis injetados no system prompt.
4. **self-check:** verificação de fontes, anti-cópia (não copiar trechos longos),
   detecção de afirmações sem fonte → vira `[A VERIFICAR]`.
5. **audit:** roda o checklist (itens obrigatórios + dimensões 0–10) e as
   verificações de conformidade (LGPD/CDC/Lei do Inquilinato).
6. Resultado vai para revisão humana. **Nunca publica.**

**Governança de IA:**
- **Prompt caching** do contexto estável (princípios, voz, base) → reduz custo.
- **Seleção de modelo por tarefa:** modelo forte (Opus/Sonnet) p/ redação e
  auditoria; modelo barato (Haiku) p/ classificação/scoring de pauta.
- **Registro completo** por geração: modelo, prompt hash, fontes, tokens, custo
  (tabela `ai_runs`) — trilha de auditoria e controle de custo.
- **Teto de custo** por execução/workspace (circuit breaker).
- **Idempotência** de jobs (chave por brief+versão) e retries com backoff.

## 11.5 APIs (contratos)
- **tRPC** para o app (tipado, por módulo): `workspaces.*`, `content.*`,
  `briefs.*`, `knowledge.*`, `audit.*`…
- **REST** para webhooks e integrações externas (ex.: callback de CMS),
  versionado (`/api/v1`), documentado em OpenAPI.
- **Validação** com Zod/class-validator; contratos no pacote `@redator/contracts`
  compartilhado com o front.
- **Erros** padronizados (código, mensagem humana, detalhes), nunca vazam stack.

## 11.6 Filas, cache e jobs
- **BullMQ**: filas `ingestion`, `generation`, `audit`, `publishing`,
  `notifications`. Prioridade, concorrência por fila, dead-letter + alerta.
- **Redis cache:** resultados de SERP (TTL), embeddings quentes, sessões, rate
  limit por usuário/workspace.
- **Locks** para evitar geração duplicada do mesmo artigo.

## 11.7 Logs e observabilidade (resumo; detalhe no doc 13)
- Logs estruturados (JSON) com `requestId`, `workspaceId`, `userId`.
- Tracing distribuído (OpenTelemetry) cobrindo o pipeline de IA.
- Métricas de negócio (artigos/semana) e técnicas (latência de geração, custo).

## 11.8 Isolamento multi-tenant (resumo; detalhe no doc 12 e 14)
- `workspace_id` em toda tabela de domínio + **RLS no Postgres**.
- Contexto de tenant injetado por request (guard) e propagado aos workers.
- Segredos de integração criptografados por workspace (envelope encryption).
