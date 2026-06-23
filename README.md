# Redator — Content Operations Platform

> Plataforma interna **AI-native** de operações de conteúdo, SEO e growth.
> Modelo **multi-workspace** (console de agência): cada empresa-cliente é um
> workspace isolado, com sua própria base de conhecimento, integrações e
> pipeline editorial. Operada por um time central, executando vários clientes
> em paralelo. Primeiro cliente: **Avalyst** (garantia locatícia).

**Nome de produto:** "Redator" (working name). **Status:** documentação de
arquitetura e design — pronta para iniciar implementação.

---

## Por que esta plataforma existe

O agente de conteúdo da Avalyst (ver `../avalyst-conteudo/`) provou o fluxo:
pesquisa de SERP → seleção de pauta → redação → auditoria → rascunho. O Redator
**produtiza** esse fluxo num SaaS interno onde:

- Cada **cliente** (Avalyst, e os próximos) vira um **workspace** isolado.
- Você **alimenta** a base de conhecimento e **conecta** as ferramentas de cada
  cliente (WordPress, Search Console, Ahrefs/Semrush, Google Drive, CRM).
- O **motor de IA** executa pautas, redige, audita e entrega rascunhos —
  sempre com **revisão humana** antes de publicar.
- Tudo roda **em paralelo**, com isolamento de dados por workspace.

## Princípios inegociáveis (herdados do agente)

1. Nunca inventar dados. Métrica sem fonte → `[A VERIFICAR]`.
2. Nunca publicar sozinho. Todo conteúdo sai como rascunho.
3. Só afirmar o que está embasado na base de conhecimento do workspace.
4. Conformidade primeiro: Lei do Inquilinato, CDC, LGPD.
5. Honestidade editorial: o título cumpre o que o corpo entrega.

---

## Índice dos entregáveis

| # | Documento | Conteúdo |
|---|---|---|
| 01 | [Visão geral do produto](docs/01-visao-geral-produto.md) | O que é, problema, proposta de valor |
| 02 | [Objetivos de negócio](docs/02-objetivos-de-negocio.md) | Metas, North Star, métricas |
| 03 | [Público-alvo](docs/03-publico-alvo.md) | Operadores, personas, JTBD |
| 04 | [Funcionalidades principais](docs/04-funcionalidades.md) | Épicos, features, regras de negócio |
| 05 | [Arquitetura da informação](docs/05-arquitetura-informacao.md) | Mapa de telas, navegação, taxonomia |
| 06 | [Jornada do usuário](docs/06-jornada-do-usuario.md) | Fluxos ponta a ponta |
| 07 | [Wireframes descritivos](docs/07-wireframes.md) | Layout tela a tela |
| 08 | [Design System](docs/08-design-system.md) | Cores, tipografia, grid, componentes |
| 09 | [Protótipo das telas](docs/09-prototipo-telas.md) | Telas em ASCII + comportamento |
| 10 | [Arquitetura Frontend](docs/10-arquitetura-frontend.md) | Next.js, estado, estrutura |
| 11 | [Arquitetura Backend](docs/11-arquitetura-backend.md) | Serviços, APIs, filas, IA |
| 12 | [Banco de dados](docs/12-banco-de-dados.md) | Modelagem, índices, multi-tenancy |
| 13 | [Infraestrutura](docs/13-infraestrutura.md) | Cloud, CI/CD, observabilidade |
| 14 | [Segurança](docs/14-seguranca.md) | AuthN/Z, RBAC, LGPD, criptografia |
| 15 | [Performance](docs/15-performance.md) | Cache, lazy loading, escala |
| 16 | [Roadmap](docs/16-roadmap.md) | Fases, marcos |
| 17 | [Sprints](docs/17-sprints.md) | Backlog por sprint |
| 18 | [Critérios de qualidade](docs/18-criterios-qualidade.md) | DoR, DoD, QA |
| 19 | [Riscos técnicos](docs/19-riscos-tecnicos.md) | Riscos e mitigação |
| 20 | [Recomendações futuras](docs/20-recomendacoes-futuras.md) | Evolução |

## Stack resumida

- **Frontend:** Next.js 15 (App Router, RSC) · TypeScript · Tailwind + shadcn/ui ·
  Radix · TanStack Query · Zustand · Framer Motion.
- **Backend:** Node.js (NestJS) modular · PostgreSQL (RLS multi-tenant) ·
  Redis · BullMQ · pgvector · Object Storage (S3).
- **IA:** Claude (Anthropic) como motor de redação/auditoria · RAG sobre a base
  de conhecimento do workspace.
- **Infra:** Vercel (front) + AWS (back) · GitHub Actions CI/CD ·
  OpenTelemetry + Grafana/Sentry.

Detalhes e justificativas em cada documento.
