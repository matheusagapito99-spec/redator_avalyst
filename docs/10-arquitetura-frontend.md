# 10 — Arquitetura Frontend

## 10.1 Stack e justificativa

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | **Next.js 15 (App Router, RSC)** | SSR/streaming, RSC reduzem JS no cliente, ótimo DX, deploy Vercel |
| Linguagem | **TypeScript (strict)** | Segurança de tipos ponta a ponta (tipos compartilhados com o backend) |
| Estilo | **Tailwind CSS + tokens** | Velocidade, consistência via design tokens, tree-shaking |
| Componentes | **shadcn/ui + Radix UI** | Acessibilidade pronta (Radix), componentes copiáveis e customizáveis |
| Estado servidor | **TanStack Query** | Cache, revalidação, optimistic updates para dados de API |
| Estado cliente | **Zustand** | Estado leve de UI (sidebar, workspace ativo, preferências) |
| Formulários | **React Hook Form + Zod** | Performance + validação compartilhada com o backend |
| Editor rico | **TipTap (ProseMirror)** | Editor por blocos extensível, base do estilo Notion |
| Motion | **Framer Motion** | Microinterações e transições com `prefers-reduced-motion` |
| Tabelas | **TanStack Table** | Headless, ordenação/seleção/virtualização |
| Drag & drop | **dnd-kit** | Kanban acessível e performático |
| Gráficos | **Recharts / visx** | Dashboards de produção |
| i18n | **next-intl** | pt-BR base, pronto para multi-idioma por workspace |
| Testes | **Vitest + Testing Library + Playwright** | Unidade, componente e E2E |
| Stories | **Storybook** | Documentação viva do design system |

> **Decisão central:** RSC + Server Actions para leitura/escrita reduzem
> boilerplate de API no caminho feliz, enquanto a API REST/tRPC do backend serve
> integrações e jobs. O editor e o kanban são **client components** (interação
> intensa); listas e dashboards aproveitam **server components** + streaming.

## 10.2 Estrutura de pastas

```
apps/web/
├── app/
│   ├── (auth)/login, onboarding
│   ├── (app)/
│   │   ├── account/…                  # nível conta
│   │   └── w/[workspaceSlug]/
│   │       ├── layout.tsx             # shell (sidebar + topbar + provider WS)
│   │       ├── page.tsx               # dashboard
│   │       ├── pipeline/, pautas/, artigos/[id]/
│   │       ├── conhecimento/, serp/, integracoes/
│   │       ├── relatorios/, pessoas/, config/
│   ├── api/                            # route handlers (webhooks, uploads)
│   └── layout.tsx                      # root: tema, fontes, providers
├── components/
│   ├── ui/                             # design system (shadcn) — botões, inputs…
│   ├── editor/                         # TipTap + toolbar IA + citações
│   ├── kanban/                         # board, cards, dnd
│   ├── knowledge/, integrations/, audit/
│   └── shared/                         # layout, command-palette, empty/loading
├── lib/
│   ├── api/                            # cliente tRPC/fetch + tipos
│   ├── auth/, rbac/                    # guardas de permissão no cliente
│   ├── hooks/                          # useWorkspace, useArticle, useAudit…
│   └── utils/
├── stores/                             # zustand (ui, workspace ativo, prefs)
├── styles/                             # tokens.css, globals.css, tailwind
├── tests/ e2e/                         # playwright
└── .storybook/
```

## 10.3 Gerenciamento de estado (estratégia)
- **Server state** (artigos, pautas, base, métricas): TanStack Query, com chaves
  por `workspaceId` para isolamento de cache. Invalidação por mutation.
- **UI state** (workspace ativo, sidebar, tema, command palette): Zustand,
  persistido em `localStorage` quando faz sentido.
- **Form state:** React Hook Form + Zod (schemas reaproveitados do pacote
  `@redator/contracts`).
- **Realtime** (progresso de geração, status de job): WebSocket/SSE → atualiza
  cache do Query (sem polling). Ver doc 11.

## 10.4 Design System na prática
- Tokens em `styles/tokens.css` (CSS variables) → `tailwind.config` consome.
- Componentes `ui/` documentados no Storybook com todos os estados.
- Tema claro/escuro via `data-theme` + `next-themes`. Acento por workspace
  sobrescreve `--accent` em runtime (CSS var no provider do workspace).

## 10.5 Performance no frontend
- **RSC + streaming**: HTML rápido, hidratação seletiva.
- **Code splitting** por rota; editor e gráficos em `dynamic(import)` (lazy).
- **Virtualização** de listas longas (TanStack Virtual) em base/artigos.
- **Optimistic UI** em ações frequentes (mover card, salvar bloco).
- **Imagens** via `next/image`; ícones tree-shaken (lucide).
- **Skeletons** com a forma do conteúdo; sem layout shift (reserva de espaço).
- Orçamento de performance: LCP < 2.0s, INP < 200ms, CLS < 0.1 (ver doc 15).

## 10.6 Acessibilidade e qualidade
- Radix garante semântica/teclado; lint `eslint-plugin-jsx-a11y`.
- Testes E2E cobrem fluxos críticos (gerar → revisar → aprovar → publicar).
- Storybook + Chromatic (regressão visual) opcional.

## 10.7 Padrões de organização de código
- **Feature-first** dentro de `components/` e `lib/hooks`.
- **Server Actions** para mutations simples; **tRPC** para fluxos tipados ricos.
- **Guards de RBAC** no cliente são UX (escondem ações); a autorização real é
  sempre no backend (ver doc 14).
