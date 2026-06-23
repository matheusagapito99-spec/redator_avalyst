# 05 — Arquitetura da Informação

## 5.1 Modelo mental

Três níveis hierárquicos, sempre visíveis na navegação:

```
Conta (org do operador)
└── Workspace (cliente: Avalyst, Cliente B, Cliente C…)
    ├── Pipeline (pautas → artigos → publicação)
    ├── Base de conhecimento
    ├── Integrações
    ├── Pessoas & papéis
    └── Configurações (marca, voz, personas, IA)
```

> **Decisão de IA (information architecture):** o **workspace** é o objeto-raiz
> da navegação, não o artigo. Isso reforça o isolamento mental e técnico por
> cliente e evita o erro clássico de misturar contextos. O switcher de workspace
> é o controle mais importante da interface (sempre acessível, com `⌘K`).

## 5.2 Mapa de telas (sitemap)

```
/login
/onboarding                      (criação da conta + 1º workspace)

/w/:workspaceSlug                (raiz do workspace)
├── /                            Dashboard (visão geral do workspace)
├── /pipeline                    Kanban editorial
│   ├── /pipeline/board          (default)
│   └── /pipeline/calendar       Calendário editorial
├── /pautas                      Lista/planejamento de pautas
│   ├── /pautas/new              Wizard de nova pauta / planejamento
│   └── /pautas/:id              Detalhe da pauta (ficha + SERP)
├── /artigos                     Lista de artigos
│   └── /artigos/:id             Editor de artigo (3 painéis)
│       ├── ?tab=editor
│       ├── ?tab=fontes
│       ├── ?tab=auditoria
│       └── ?tab=seo
├── /conhecimento                Base de conhecimento
│   ├── /conhecimento/:categoria
│   └── /conhecimento/doc/:id    Visualizador de documento
├── /serp                        Inteligência de SERP/concorrentes
├── /integracoes                 Integrações do workspace
│   └── /integracoes/:provider   Detalhe/setup do conector
├── /relatorios                  Relatórios e métricas
├── /pessoas                     Membros & papéis
└── /config                      Configurações do workspace
    ├── /config/marca            Marca, voz, personas, ICP
    ├── /config/ia               Modelos, custo, temperatura
    └── /config/auditoria        Trilha de auditoria

/account                         (nível conta)
├── /account/workspaces          Todos os workspaces
├── /account/membros             Membros da conta
├── /account/seguranca           2FA, sessões, chaves
└── /account/billing             (roadmap)
```

## 5.3 Navegação

**Estrutura primária (sidebar esquerda, fixa):**
- Topo: **Workspace switcher** (logo + nome do cliente, dropdown com busca).
- Navegação principal: Dashboard · Pipeline · Pautas · Artigos · Conhecimento ·
  SERP · Integrações · Relatórios.
- Rodapé: Pessoas · Configurações · perfil do usuário.

**Estrutura secundária:**
- **Command palette (`⌘K`):** ação universal — trocar workspace, criar pauta,
  buscar artigo, ir para qualquer tela, disparar geração. (Padrão Linear.)
- **Breadcrumbs** no topo do conteúdo: `Avalyst / Artigos / “Como alugar sem fiador”`.
- **Tabs** dentro de telas densas (editor de artigo, configurações).

> **Justificativa:** a combinação sidebar fixa + command palette serve tanto o
> usuário novo (descoberta visual) quanto o power-user (velocidade por teclado).
> É o padrão das ferramentas premium de referência.

## 5.4 Taxonomia e nomenclatura

- **Workspace** = cliente/empresa. (Evitar “projeto” na UI para não confundir
  com pauta/artigo.)
- **Pauta** = ideia de conteúdo qualificada (ficha + intenção + funil).
- **Artigo** = entregável editorial (rascunho → revisão → aprovado → publicado).
- **Conhecimento** = base documental do workspace.
- **Execução** = um ciclo de produção (lote diário / pauta única / planejamento).

## 5.5 Estados globais de conteúdo (status do artigo)

```
Backlog → Em produção (IA) → Em revisão → Aprovado → Publicado (rascunho no CMS)
                                   �‖ (devolvido)
                              Em ajuste
```

Cada transição é registrada na trilha de auditoria com autor, timestamp e motivo.

## 5.6 Densidade e responsividade da IA

- **Desktop-first** (ferramenta de trabalho profissional): layout de 3 painéis
  no editor, sidebar fixa.
- **Tablet:** sidebar colapsável; painéis viram tabs.
- **Mobile:** foco em acompanhamento e aprovação (read + approve), não em edição
  pesada. Kanban e revisão funcionam; edição rica é desencorajada.
