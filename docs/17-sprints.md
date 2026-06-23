# 17 — Estrutura de Sprints

Sprints de **2 semanas**. Cada sprint tem objetivo único, entregáveis e um
incremento demonstrável. Histórias seguem o formato “Como [persona], quero
[ação], para [valor]”. Pontos são relativos (Fibonacci).

## Sprint 1 — Fundação & Auth
**Objetivo:** chassi seguro.
- Monorepo, CI/CD, ambientes, lint/typecheck/test. (5)
- Auth: login/logout, sessão httpOnly, 2FA TOTP. (8)
- Modelo Conta/Workspace/Membership + RLS + seeds. (8)
- Shell: sidebar, topbar, dark mode, command palette base. (5)
**Demo:** criar conta → criar workspace → navegar.

## Sprint 2 — Design System & RBAC
- Componentes ui/ (botões, inputs, modais, tabelas, toasts) + Storybook. (8)
- RBAC end-to-end (guards backend + ocultação no front). (5)
- Pessoas & convites; troca de papel. (5)
- Configurações de workspace (marca, voz, personas). (5)
**Demo:** convidar membro, definir papel, configurar marca.

## Sprint 3 — Base de Conhecimento I
- Upload + storage (S3/MinIO) + dropzone. (5)
- Pipeline de ingestão (extração PDF/DOCX/MD/TXT/CSV → chunk). (8)
- Embeddings + pgvector + status de indexação. (8)
**Demo:** subir documento e vê-lo indexado.

## Sprint 4 — Base de Conhecimento II + Busca
- Tela de conhecimento (categorias, cobertura, status). (5)
- Busca semântica + visualizador de documento. (5)
- Notas de produto estruturadas; sinalização desatualizado/conflito. (5)
**Demo:** buscar na base e abrir trecho-fonte.

## Sprint 5 — Pautas & SERP
- CRUD de pautas com 3 filtros + score; clusters. (8)
- Análise de SERP (`OBSERVADO`) + lacunas; caminho degradado. (8)
- Wizard de nova execução (modos). (5)
**Demo:** planejar cluster a partir de SERP + base.

## Sprint 6 — Pipeline & Calendário
- Kanban (dnd-kit) com regras de transição. (8)
- Calendário editorial; filtros. (5)
- Notificações base (in-app). (5)
**Demo:** mover cards e ver o fluxo editorial.

## Sprint 7 — Motor de IA I (geração)
- Orquestração research→retrieve→draft (workers BullMQ). (13)
- Prompt system com princípios/voz/conformidade; seleção de modelo. (8)
- `ai_run` (registro de modelo/fontes/tokens/custo). (5)
**Demo:** gerar rascunho com trilha de fontes.

## Sprint 8 — Motor de IA II (editor + fontes)
- Editor TipTap por blocos + toolbar de IA. (13)
- Painel de Fontes + citações ancoradas; itens `[A VERIFICAR]`. (8)
- Versões e diff. (5)
**Demo:** editar com sugestões de IA e inspecionar fontes.

## Sprint 9 — Auditoria & Conformidade
- Checklist (obrigatórios + dimensões) + gates de aprovação. (8)
- Verificações de conformidade (LGPD/CDC/Lei do Inquilinato) e anti-cópia. (8)
- Revisão humana (aprovar/devolver + comentários). (5)
**Demo:** auditoria bloqueando e liberando aprovação.

## Sprint 10 — Publicação & Relatórios
- Conector WordPress (rascunho REST API) + export MD/HTML. (8)
- Relatório de saída por execução; dashboards de produção/qualidade. (8)
- Notificações por e-mail. (5)
**Demo:** aprovar → enviar rascunho ao WordPress → ver relatório.

## Sprint 11 — Multi-cliente & Hardening
- Dashboard de Conta agregado; onboarding de novo workspace. (8)
- Controles de custo de IA por workspace; quotas/rate limit. (5)
- Segurança (pentest interno, CSP, secret rotation) + DR/restore test. (8)
**Demo:** 2º cliente produzindo; relatório de custo por workspace.

## Sprint 12 — Polimento & Beta
- Microinterações/motion, empty/loading/error states finos. (5)
- Acessibilidade (auditoria AA), performance (Web Vitals). (5)
- E2E críticos (Playwright), bugfix, documentação. (8)
**Demo:** beta interno estável.

> **Cerimônias:** planning, daily, review, retro. **Backlog** priorizado por
> valor × risco. **Feature flags** para liberar incrementos com segurança.
