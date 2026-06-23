# 08 — Design System

Design system completo, com tokens prontos para implementação (CSS variables /
Tailwind theme / shadcn). Filosofia: **calmo, denso e preciso** — estética de
Linear/Vercel com a clareza de Stripe. Menos é mais; o conteúdo é o herói.

## 8.1 Princípios visuais
1. **Hierarquia por espaço e peso**, não por enfeite. Cor é semântica, não
   decorativa.
2. **Densidade elegante:** muita informação, zero poluição. Respiro consistente.
3. **Movimento com propósito:** microinterações que confirmam ações, nunca
   distraem.
4. **Acessível por padrão:** contraste AA+, foco visível, teclado primeiro.
5. **Consistência total:** mesmos tokens em todos os componentes e estados.

## 8.2 Cores (tokens semânticos)

Cores definidas como **tokens semânticos** mapeados para escalas. Suporta
**Light** e **Dark** (dark é o padrão para ferramenta de trabalho).

### Escala de marca (acento)
```
--brand-50  #EEF2FF   --brand-400 #818CF8
--brand-100 #E0E7FF   --brand-500 #6366F1   ← cor primária
--brand-200 #C7D2FE   --brand-600 #4F46E5
--brand-300 #A5B4FC   --brand-700 #4338CA
```
> Acento índigo: transmite tecnologia/confiança sem ser “mais um azul SaaS”.
> A cor de acento é **sobreponível por workspace** (cada cliente pode ter a sua).

### Neutros (base da UI — “slate”)
```
--neutral-0  #FFFFFF   --neutral-500 #64748B
--neutral-50 #F8FAFC   --neutral-600 #475569
--neutral-100#F1F5F9   --neutral-700 #334155
--neutral-200#E2E8F0   --neutral-800 #1E293B
--neutral-300#CBD5E1   --neutral-900 #0F172A
--neutral-400#94A3B8   --neutral-950 #020617
```

### Tokens semânticos (light → dark)
```
--bg-app          neutral-50  → neutral-950
--bg-surface      #FFFFFF     → neutral-900
--bg-elevated     #FFFFFF     → neutral-800
--bg-subtle       neutral-100 → neutral-800/60
--border          neutral-200 → neutral-800
--border-strong   neutral-300 → neutral-700
--text-primary    neutral-900 → neutral-50
--text-secondary  neutral-600 → neutral-300
--text-muted      neutral-400 → neutral-500
--accent          brand-500   → brand-400
--accent-fg       #FFFFFF     → neutral-950
```

### Cores de feedback (semânticas)
```
--success  #10B981 (emerald-500)   bg: #ECFDF5 / dark #052E2B
--warning  #F59E0B (amber-500)     bg: #FFFBEB / dark #2E2206
--danger   #EF4444 (red-500)       bg: #FEF2F2 / dark #2E0A0A
--info     #3B82F6 (blue-500)      bg: #EFF6FF / dark #0A1A2E
```

### Cores de domínio (origem do dado — reforça os princípios do agente)
```
--source-medido    emerald-500   "MEDIDO"    (dado confiável de conector)
--source-observado blue-500      "OBSERVADO" (lido da SERP/web)
--source-estimado  amber-500     "ESTIMADO"  (julgamento)
--source-verificar red-500       "[A VERIFICAR]" / "[CONFIRMAR COM TIME]"
```
> **Decisão de design única do produto:** a “origem do dado” tem cor própria e
> aparece como badge ao lado de toda métrica/afirmação. É a tradução visual do
> princípio “nunca inventar dados”.

## 8.3 Tipografia

- **Família UI:** `Inter` (variável). Fallback: system-ui.
- **Família mono:** `JetBrains Mono` (código, slugs, tokens, IDs).
- **Família leitura (editor):** `Inter` para UI; opção `Source Serif` para
  preview do artigo (leitura longa).

### Escala (type scale 1.250 — major third)
```
Display   40 / 48   peso 700  tracking -0.02em
H1        32 / 40   peso 700  -0.02em
H2        24 / 32   peso 600  -0.01em
H3        20 / 28   peso 600
H4        16 / 24   peso 600
Body-lg   16 / 26   peso 400
Body      14 / 22   peso 400   ← base da UI
Body-sm   13 / 20   peso 400
Caption   12 / 16   peso 500   (labels, badges)
Mono      13 / 20   peso 400
```
> Base de 14px: densidade profissional (Linear/Notion usam ~14). 16px para
> leitura de artigo no preview.

## 8.4 Grid, espaçamento e raio

- **Espaçamento (escala 4px):** `0,2,4,8,12,16,20,24,32,40,48,64,80`.
- **Grid:** 12 colunas, gutter 24px, container máx. 1280px (telas de trabalho),
  1440px para dashboards amplos.
- **Sidebar:** 260px (colapsada 64px).
- **Raio:** `--radius-sm 6px`, `--radius-md 8px` (padrão), `--radius-lg 12px`
  (cards/modais), `--radius-full` (pills/avatars).
- **Sombras (sutis, em camadas):**
```
--shadow-xs  0 1px 2px rgba(0,0,0,.04)
--shadow-sm  0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)
--shadow-md  0 4px 12px rgba(0,0,0,.08)
--shadow-lg  0 12px 32px rgba(0,0,0,.12)   (modais, popovers)
```
Dark mode usa sombras + borda luminosa (`border` mais clara) para separar planos.

## 8.5 Iconografia
- **Lucide** (linha, 1.5px, 20px padrão / 16px denso). Consistente, open-source,
  combina com Inter.
- Ícones sempre acompanhados de label, exceto em ações universais conhecidas.

## 8.6 Motion design
- **Durações:** `fast 120ms`, `base 200ms`, `slow 320ms`.
- **Easing:** `standard cubic-bezier(.2,0,0,1)`, `enter (.0,0,.2,1)`,
  `exit (.4,0,1,1)`.
- **Padrões:** fade+scale 0.98→1 em popovers; slide 8px em dropdowns; skeleton
  shimmer; cards do kanban com spring leve no drag (Framer Motion).
- **Respeita `prefers-reduced-motion`:** desliga animações não essenciais.

## 8.7 Componentes (especificação)

### Botões
- **Variantes:** `primary` (acento sólido), `secondary` (superfície + borda),
  `ghost` (sem fundo), `danger`, `link`.
- **Tamanhos:** sm (28px), md (36px, padrão), lg (44px).
- **Estados:** default, hover (escurece 1 nível), active (scale .98), focus
  (anel 2px `--accent` + offset 2px), disabled (50% + cursor not-allowed),
  loading (spinner + label “…”).
- Ícone à esquerda/direita opcional; `icon-only` quadrado com tooltip.

### Inputs / Formulários
- Campo: altura 36px, borda `--border`, foco anel acento, raio md.
- Label acima, helper text abaixo, erro em `--danger` com ícone.
- Estados: default, focus, error, disabled, readonly.
- Tipos: text, textarea (auto-resize), select (Radix), combobox com busca,
  toggle/switch, checkbox, radio, slider, date picker, file dropzone.

### Cards
- `--bg-surface`, borda 1px, raio lg, padding 16–24px, sombra xs (hover sm).
- Composição: header (título + ação), corpo, footer opcional.

### Tabelas
- Cabeçalho sticky, zebra opcional, linha hover, densidade ajustável.
- Ordenação por coluna, seleção múltipla, paginação ou scroll infinito.
- Célula com badge de status / origem do dado quando aplicável.

### Dashboards (cartões de métrica)
- Valor grande (H1/Display), label (caption), tendência (▲/▼ com cor), sparkline
  opcional, estado de loading (skeleton) e empty.

### Modais & Dialogs (Radix Dialog)
- Overlay com blur leve, painel `--bg-elevated`, sombra lg, raio lg.
- Foco preso (focus trap), `Esc` fecha, foco retorna ao gatilho.
- Tamanhos: sm (420), md (560), lg (720), full (fluxos/wizards).

### Dropdowns & Menus (Radix)
- Item com ícone + label + atalho; separadores; submenus; checkbox/radio items.
- Animação enter fade+slide; teclado completo.

### Sidebar & Navegação
- Item: ícone + label, estado ativo (barra de acento + fundo subtle), colapsável.
- Workspace switcher no topo (combobox com busca + criar).

### Command Palette (`⌘K`)
- Busca fuzzy de ações, telas, artigos, workspaces. Grupos por categoria.
  Navegação por teclado, execução com Enter. (Componente-assinatura do produto.)

### Wizards / Steppers
- Passos numerados com estado (atual/feito/pendente), validação por passo,
  barra de progresso, ações Voltar/Continuar.

### Tooltips & Popovers
- Tooltip: texto curto, delay 300ms, seta. Popover: conteúdo rico, foco
  gerenciado.

### Badges & Tags
- Pill, caption, cor semântica. Variante “origem do dado” (medido/observado/
  estimado/verificar). Tag de funil (topo/meio/fundo) com cor própria.

### Feedback do sistema
- **Toasts** (canto inferior direito): success/info/warning/error, auto-dismiss
  + ação opcional, fila empilhável.
- **Inline alerts**: banner por contexto (ex.: “SEO não conectado”).
- **Progress**: barra determinada (upload, geração) e indeterminada (skeleton).

### Estados de conteúdo (obrigatórios em toda lista/tela)
- **Empty state:** ilustração + frase + CTA.
- **Loading state:** skeleton com a forma real.
- **Error state:** humano + causa + recuperação.
- **Partial/Degraded:** ex. “Análise de SERP indisponível — marcada como
  pendente” (coerente com o caminho degradado do agente).

## 8.8 Dark mode & Light mode
- **Dark é o padrão** (ferramenta de trabalho, sessões longas, menos fadiga).
- Alternância em `config` e via `⌘K`. Persistida por usuário; respeita
  `prefers-color-scheme` no 1º acesso.
- Todos os tokens têm par light/dark; nenhum hex hard-coded em componente.

## 8.9 Acessibilidade (AA+)
- Contraste mínimo 4.5:1 (texto), 3:1 (UI/estado).
- Foco sempre visível (anel 2px). Navegação 100% por teclado.
- `aria-*` em componentes interativos (Radix entrega a base).
- Alvos de toque ≥ 40px no mobile. Mensagens de erro associadas a campos.
- Não comunicar status só por cor — sempre cor + ícone/label.

## 8.10 Entrega dos tokens
- Fonte única: `tokens.css` (CSS variables) + `tailwind.config` derivado +
  tema shadcn. Documentados no Storybook (ver doc 10).
