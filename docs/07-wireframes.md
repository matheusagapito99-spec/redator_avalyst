# 07 — Wireframes Descritivos

Layouts tela a tela em ASCII + comportamento. Cada wireframe explica **o que**,
**onde** e **por quê**. Grid base de 12 colunas, sidebar fixa de 260px.

## 7.1 Shell da aplicação (layout global)

```
┌──────────────┬──────────────────────────────────────────────────────────┐
│  SIDEBAR      │  TOPBAR: breadcrumbs            [busca ⌘K]  [🔔] [avatar]  │
│  (260px)      ├──────────────────────────────────────────────────────────┤
│ ┌──────────┐ │                                                            │
│ │ Avalyst ▾│ │   ÁREA DE CONTEÚDO                                         │
│ └──────────┘ │   (12 colunas, max-width 1280px, padding 32px)            │
│  workspace   │                                                            │
│  switcher    │                                                            │
│              │                                                            │
│ ▸ Dashboard  │                                                            │
│ ▸ Pipeline   │                                                            │
│ ▸ Pautas     │                                                            │
│ ▸ Artigos    │                                                            │
│ ▸ Conhecim.  │                                                            │
│ ▸ SERP       │                                                            │
│ ▸ Integraç.  │                                                            │
│ ▸ Relatórios │                                                            │
│ ─────────────│                                                            │
│ ▸ Pessoas    │                                                            │
│ ▸ Config     │                                                            │
│ [👤 perfil]  │                                                            │
└──────────────┴──────────────────────────────────────────────────────────┘
```
- **Sidebar**: fixa em desktop, colapsável (ícones) em < 1024px. Item ativo com
  barra de acento à esquerda + fundo sutil.
- **Topbar**: breadcrumbs à esquerda; busca/command palette central-direita;
  notificações e avatar à direita.
- **Por quê:** estrutura estável reduz carga cognitiva; o conteúdo muda, o
  chassi não.

## 7.2 Dashboard do workspace

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Avalyst — Visão geral                              [+ Nova execução]      │
├──────────────────────────────────────────────────────────────────────────┤
│  PRONTIDÃO DO WORKSPACE  ▓▓▓▓▓▓▓░░░ 70%                                     │
│  ✓ Marca & voz   ✓ Base (12 docs)   ✓ WordPress   ◌ SEO   ◌ Drive sync     │
├───────────────┬───────────────┬───────────────┬────────────────────────────┤
│ Aprovados/sem │ Em revisão    │ Lead time méd │ Custo IA (mês)             │
│   8 ▲         │   3           │  0.7 dia      │  R$ —  (est.)              │
├───────────────┴───────────────┴───────────────┴────────────────────────────┤
│  PIPELINE (mini-kanban)                                                     │
│  Backlog(5) │ Produção(2) │ Revisão(3) │ Aprovado(1) │ Publicado(8)         │
├──────────────────────────────────────────────────────────────────────────┤
│  ATIVIDADE RECENTE                          │  PRÓXIMAS AÇÕES               │
│  • IA gerou “Seguro fiança vs…”  há 5min    │  ⚠ 3 artigos aguardam revisão │
│  • Ana aprovou “Como alugar…”    há 1h      │  ⚠ SEO não conectado          │
└──────────────────────────────────────────────────────────────────────────┘
```
- Cartões de métrica com tendência (▲/▼). Empty states quando não há dados.
- “Prontidão” converte setup em progresso visível.

## 7.3 Pipeline (Kanban editorial)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Pipeline           [Board][Calendário]      filtros: [funil▾][persona▾][⌘] │
├──────────┬──────────┬──────────┬──────────┬──────────────────────────────┤
│ BACKLOG  │ PRODUÇÃO │ REVISÃO  │ APROVADO │ PUBLICADO                     │
│ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │ ┌──────┐                      │
│ │pauta │ │ │ ◐ 60%│ │ │Aud 9.1│ │ │ ✓    │ │ │↗ CMS │                      │
│ │topo  │ │ │gerand│ │ │topo  │ │ │meio  │ │ │fundo │                      │
│ │KW:…  │ │ │o…    │ │ │👤Ana │ │ │      │ │ │      │                      │
│ └──────┘ │ └──────┘ │ └──────┘ │ └──────┘ │ └──────┘                      │
│ + add    │          │          │          │                              │
└──────────┴──────────┴──────────┴──────────┴──────────────────────────────┘
```
- Cards arrastáveis; card de produção mostra progresso da IA; card de revisão
  mostra nota da auditoria e revisor.
- Drag bloqueado de “Revisão”→“Aprovado” se auditoria não passou (feedback de
  por quê no hover).

## 7.4 Wizard de Nova Execução / Pauta

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Nova execução                                                   [✕]       │
│  ● Modo ── ○ Tema ── ○ Contexto ── ○ Revisão                               │
├──────────────────────────────────────────────────────────────────────────┤
│  Como quer trabalhar?                                                      │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                        │
│   │ Lote diário │  │ Pauta única │  │ Planejamento│                        │
│   │ 3 artigos   │  │ 1 artigo    │  │ só pautas   │                        │
│   │ topo→fundo  │  │ ponta a ponta│ │ sem redigir │                        │
│   └─────────────┘  └─────────────┘  └─────────────┘                        │
│                                              [Voltar]   [Continuar →]      │
└──────────────────────────────────────────────────────────────────────────┘
```
- Stepper claro; cada passo valida antes de avançar. Seleção como cards
  grandes e clicáveis (alvo de toque generoso).

## 7.5 Editor de Artigo (3 painéis)

```
┌───────────────────────────────────────────────────────────────────────────┐
│ Avalyst / Artigos / “Seguro fiança vs. título de capitalização”   [Aprovar]│
│ [Editor] [Fontes] [Auditoria] [SEO]                          status: Revisão│
├───────────────────────────────────────────┬───────────────────────────────┤
│  EDITOR (blocos, estilo Notion)           │  PAINEL CONTEXTUAL            │
│                                           │  ┌── Auditoria ─────────────┐ │
│  # Seguro fiança vs. título…              │  │ Obrigatórios   9/10 ✓    │ │
│  Parágrafo de introdução…    [⟲ IA ▾]     │  │ ⚠ Fonte de preço [A VER] │ │
│                                           │  │ Profundidade   9 ███████ │ │
│  ## Como funciona o seguro fiança         │  │ Clareza        8 ██████  │ │
│  Texto… ⟦fonte: comparativo.pdf⟧          │  │ Conversão      7 █████ ⚠ │ │
│                                           │  └──────────────────────────┘ │
│  [+ bloco]                                │  ┌── Fontes ────────────────┐ │
│                                           │  │ • comparativo.pdf p.3    │ │
│                                           │  │ • SERP: imobX (OBSERV.)  │ │
│                                           │  │ • [A VERIFICAR]: preço   │ │
│                                           │  └──────────────────────────┘ │
└───────────────────────────────────────────┴───────────────────────────────┘
```
- Selecionar texto abre toolbar flutuante com ações de IA.
- Clicar numa citação ⟦fonte⟧ destaca o documento no painel Fontes.
- Botão **Aprovar** desabilitado enquanto houver item obrigatório reprovado ou
  dimensão < 8; tooltip explica o bloqueio.

## 7.6 Base de Conhecimento

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Conhecimento — Avalyst                         [⤓ Adicionar documentos]    │
│ Cobertura: Produto ✓  Comercial ✓  Casos ◌  Jurídico ✓  Dados ◌           │
├──────────────────────────────────────────────────────────────────────────┤
│  [Produto] [Comercial] [Casos] [Jurídico] [Dados]      busca semântica 🔍  │
├──────────────────────────────────────────────────────────────────────────┤
│  Nome                          Tipo   Data        Status                   │
│  comparativo-seguro-fianca.pdf  PDF   2026-05    ● Indexado                │
│  condicoes-garantia.docx        DOCX  2026-04    ● Indexado                │
│  pesquisa-mercado-2024.pdf      PDF   2024-01    ⚠ Desatualizado           │
│  one-pager.pdf                  PDF   —          ◐ Processando             │
└──────────────────────────────────────────────────────────────────────────┘
```
- Drag-and-drop em qualquer lugar da tela. Status com cor semântica.
- “Cobertura” mostra lacunas da base (guia o operador a alimentar).

## 7.7 Integrações

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Integrações — Avalyst                                                      │
├──────────────────────────────────────────────────────────────────────────┤
│  CMS                                                                       │
│   WordPress      ● Conectado   avalyst.com.br   [Testar] [Reconectar]      │
│  SEO                                                                       │
│   Search Console ○ Não conectado                 [Conectar]                │
│   Ahrefs         ○ Não conectado                 [Conectar]                │
│  Arquivos                                                                  │
│   Google Drive   ◐ Drop zone    /conhecimento    [Como configurar]        │
│  Pesquisa                                                                  │
│   Web/SERP       ● Ativo (nativo)                                          │
└──────────────────────────────────────────────────────────────────────────┘
```
- Cada conector: status, identificador da conta, ações. Erros em vermelho com
  causa. Credenciais nunca exibidas após salvas.

## 7.8 Estados especiais (em toda tela)
- **Empty state:** ilustração leve + 1 frase + CTA primário (“Sua base está
  vazia. Adicione o primeiro documento.”).
- **Loading:** skeletons com a forma do conteúdo (não spinners genéricos).
- **Error:** mensagem humana + causa provável + ação de recuperação.
