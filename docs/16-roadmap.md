# 16 — Roadmap de Desenvolvimento

Roadmap por **fases de valor**, não por features soltas. Cada fase entrega algo
utilizável. Estimativas em semanas são indicativas (time pequeno) e devem ser
recalibradas após o discovery técnico.

## Fase 0 — Fundação (≈ 2 semanas)
**Objetivo:** esqueleto pronto para construir com segurança.
- Monorepo (web + api + contracts), CI/CD, ambientes (dev/preview/staging).
- Auth (login, sessão, 2FA), modelo de Conta/Workspace/Membership + **RLS**.
- Design system base (tokens, shell, sidebar, command palette, dark mode).
- Observabilidade mínima (logs, Sentry, health checks).
**Marco:** criar conta, criar workspace, navegar no shell.

## Fase 1 — Base de Conhecimento + RAG (≈ 3 semanas)
**Objetivo:** o diferencial (grounding) de pé.
- Upload + ingestão (extração, chunking, embeddings pgvector).
- Tela de conhecimento (categorias, status, cobertura, busca semântica).
- Notas de produto estruturadas. Drop zone do Drive.
**Marco:** alimentar a base e buscar semanticamente.

## Fase 2 — Pautas, SERP e Pipeline (≈ 3 semanas)
**Objetivo:** planejar e organizar a produção.
- Pautas (3 filtros), clusters, modos de execução.
- Análise de SERP (`OBSERVADO`) + lacunas.
- Pipeline Kanban + calendário.
**Marco:** planejar um cluster e enfileirar produção.

## Fase 3 — Motor de IA + Editor + Auditoria (≈ 4 semanas) ★ núcleo
**Objetivo:** gerar, revisar e aprovar com governança.
- Orquestração de geração (research→retrieve→draft→self-check→audit).
- Editor rico (TipTap) com sugestões de IA e trilha de fontes.
- Auditoria por checklist + dimensões + gates + conformidade.
- Revisão humana (aprovar/devolver).
**Marco:** ciclo pauta → rascunho aprovado ponta a ponta.

## Fase 4 — Publicação + Relatórios (≈ 2 semanas)
**Objetivo:** entregar e medir.
- Conector WordPress (rascunho via REST API) + export Markdown/HTML.
- Relatório de saída por execução; dashboards de produção/qualidade.
- Notificações (in-app + e-mail).
**Marco:** MVP completo — Avalyst operando 100% na plataforma.

## Fase 5 — Multi-cliente em escala (≈ 2 semanas)
**Objetivo:** operar N workspaces com folga.
- Dashboard de Conta agregado; onboarding fluido de novo workspace.
- Controles de custo de IA por workspace; quotas/rate limit.
- Hardening de segurança e DR (testes de restore).
**Marco:** 2º cliente produzindo sem mudança de código.

## Fase 6+ — Evolução (roadmap aberto)
- Conectores de SEO `MEDIDO` (Search Console/Ahrefs/Semrush).
- Analytics de performance pós-publicação (tráfego/ranking/conversão).
- Conector MCP de Drive; mais CMSs; CRM para atribuição de leads.
- Agendamento automático; sugestões proativas de pauta; A/B de títulos.
- (Se virar produto) billing, planos, self-service de clientes.

## Linha do tempo macro
```
Fase:  0    1      2      3 ★        4     5     6+
Sem:   2    3      3      4          2     2     contínuo
       └─ MVP utilizável a partir da Fase 4 (~16 semanas) ─┘
```
