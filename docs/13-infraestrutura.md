# 13 — Infraestrutura

## 13.1 Visão geral e cloud recomendada

- **Frontend (Next.js):** **Vercel** — build/deploy/preview nativos, edge,
  alinhado ao stack (e já é o ambiente dos outros projetos do time).
- **Backend (NestJS + workers):** **AWS** (ou Render/Railway para começar mais
  simples). Componentes: API container, workers container, Postgres gerenciado,
  Redis gerenciado, S3, KMS.

> **Justificativa:** front na Vercel (DX e performance imbatíveis para Next.js);
> back em cloud com serviços gerenciados (RDS/ElastiCache/S3/KMS) para reduzir
> operação. Começa simples (um provedor PaaS) e migra para AWS quando a escala
> e a necessidade de KMS/observabilidade pedirem.

## 13.2 Topologia

```
                      ┌────────────┐
   Usuário ──HTTPS──▶ │  Vercel    │  Next.js (RSC, edge cache, SSR)
                      └─────┬──────┘
                            │ tRPC/REST (HTTPS)
                      ┌─────▼──────┐      ┌───────────────┐
                      │  API (Nest)│◀────▶│ Redis (cache, │
                      │  (container)│      │  filas BullMQ)│
                      └─────┬──────┘      └──────┬────────┘
              ┌────────────┼──────────────┐     │
        ┌─────▼─────┐ ┌────▼─────┐ ┌──────▼───┐ │
        │ Postgres  │ │   S3     │ │ Workers  │◀┘  (ingestão, geração IA,
        │ (+pgvector│ │ (docs)   │ │(container)│    auditoria, publishing)
        │  +RLS)    │ └──────────┘ └────┬─────┘
        └───────────┘                   │ HTTPS
                          ┌─────────────┼───────────────┐
                    ┌─────▼────┐  ┌─────▼─────┐  ┌───────▼──────┐
                    │ Anthropic│  │  SERP API │  │ WordPress/CMS│
                    │ (Claude) │  │           │  │  dos clientes│
                    └──────────┘  └───────────┘  └──────────────┘
```

## 13.3 Ambientes
- **dev** (local: docker-compose com Postgres+Redis+MinIO), **preview** (por PR,
  Vercel + back efêmero), **staging**, **production**.
- Paridade de configuração via variáveis de ambiente e secrets manager.

## 13.4 CI/CD
- **GitHub Actions**:
  - PR: lint, typecheck, testes (unit/component), build, testes E2E (Playwright)
    em preview, checagem de migrations, SAST/secret scan.
  - Merge em `main`: deploy front (Vercel) + back (build de imagem → registry →
    deploy) com **migrations expand/contract** e **health checks**.
  - Estratégia de deploy: rolling/blue-green no back; rollback automático em
    falha de health check.
- **Versionamento**: trunk-based + feature flags para releases progressivos.

## 13.5 Observabilidade
- **Logs:** estruturados (JSON) centralizados (CloudWatch/Datadog/Grafana Loki),
  com `requestId`, `workspaceId`, `userId`. Sem PII sensível em log.
- **Métricas:** OpenTelemetry → Prometheus/Grafana. Painéis: latência de
  geração de IA, custo de tokens por workspace, throughput de jobs, taxa de
  erro, North Star de produção.
- **Tracing:** OpenTelemetry ponta a ponta (request → fila → worker → Anthropic).
- **Errors:** Sentry (front e back) com source maps.
- **Alertas:** fila travada/dead-letter, custo de IA acima do teto, taxa de erro,
  uptime, expiração de credencial de integração.

## 13.6 Segurança de infraestrutura
- TLS em tudo; segredos em **AWS Secrets Manager/KMS** (nunca em `.env` de prod).
- Rede privada para Postgres/Redis (sem exposição pública); API atrás de WAF.
- Princípio do menor privilégio em IAM. Imagens escaneadas (Trivy).

## 13.7 Backup e recuperação de desastre (DR)
- **Postgres:** backups automáticos diários + **PITR** (point-in-time recovery).
  Retenção 30 dias. Teste de restore trimestral.
- **S3:** versionamento + replicação entre regiões para documentos da base.
- **Redis:** efêmero (cache/filas); jobs idempotentes e persistidos no Postgres
  quando críticos, então perda de Redis não perde trabalho aprovado.
- **RTO/RPO alvo:** RPO ≤ 24h (PITR reduz para minutos), RTO ≤ 4h.
- **Runbooks** de incidente versionados no repo (`/ops`).

## 13.8 Custos e escalabilidade
- Escala horizontal independente de API e workers (workers escalam com a fila).
- Autoscaling por profundidade de fila (geração de IA) e CPU (API).
- Controle de custo de IA por teto de workspace + dashboards de custo.
- Read replicas e cache para conter carga de leitura de relatórios.
