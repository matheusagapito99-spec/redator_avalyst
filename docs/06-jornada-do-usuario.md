# 06 — Jornada do Usuário

Fluxos ponta a ponta, com o **motivo** de cada decisão de UX. Notação: `[Tela]`,
`{Ação do sistema}`, `→` transição.

## 6.1 Jornada macro (operador)

```
Onboarding → Criar workspace → Conectar ferramentas → Alimentar base →
Planejar pautas → Gerar conteúdo → Auditar/Revisar → Publicar rascunho → Medir
```

A interface deve sempre comunicar **em que etapa o workspace está** (um indicador
de “prontidão do workspace”: base alimentada? integrações conectadas? primeira
pauta?). **Por quê:** reduz a ansiedade do “tela em branco” e guia o setup.

## 6.2 Fluxo 1 — Onboarding e criação do 1º workspace

1. `[Login]` → primeiro acesso → `[Onboarding]`.
2. {Sistema cria a Conta} → pede nome do 1º workspace (cliente).
3. `[Setup do workspace]` — wizard de 4 passos:
   - **Passo 1 — Identidade:** nome, logo, cor de acento, idioma, fuso.
   - **Passo 2 — Marca & voz:** tom, ICP, personas (templates pré-preenchidos
     editáveis).
   - **Passo 3 — Conhecimento:** upload inicial de documentos (opcional, com
     “pular por agora”).
   - **Passo 4 — Integrações:** conectar WordPress/SEO/Drive (opcional).
4. {Sistema calcula “prontidão”} → `[Dashboard]` com checklist do que falta.

> **Decisão de UX:** wizard com passos puláveis + checklist persistente no
> dashboard. Permite começar rápido sem bloquear, mas mantém o caminho de
> maturação visível. (Padrão Stripe/Linear de onboarding progressivo.)

## 6.3 Fluxo 2 — Alimentar a base de conhecimento

1. `[Conhecimento]` → botão “Adicionar documentos”.
2. Drag-and-drop ou seleção → escolhe categoria → upload.
3. {Sistema ingere}: extrai texto → chunk → embeddings → indexa.
4. Estado de cada doc: `Processando → Indexado` (ou `Erro` com retry).
5. {Sistema sugere} preencher lacunas das notas de produto se vazias.
6. Drive: instrução de drop zone / sync; itens novos aparecem para ingestão.

**Feedback visual:** barra de progresso por documento, badge de status, e um
indicador de “cobertura da base” (quais categorias têm material).

## 6.4 Fluxo 3 — Planejamento de pautas (modo planejamento)

1. `[Pautas] → Nova` → escolhe **modo: planejamento**.
2. Informa tema/cluster ou palavra-chave-semente (ou “sugira você”).
3. {Sistema} consulta SERP (`OBSERVADO`) + base → propõe clusters com lógica de
   funil (topo/meio/fundo) e os 3 filtros pontuados.
4. `[Revisão de pautas]` — operador aprova/edita/descarta cada pauta.
5. {Sistema} salva pautas aprovadas no Backlog do pipeline.

## 6.5 Fluxo 4 — Lote diário (3 artigos conectados)

1. `[Pautas] → Nova` → modo **lote diário** → escolhe cluster/tema.
2. {Sistema} monta 3 briefings (topo/meio/fundo) conectados por jornada.
3. Para **meio/fundo**: {Sistema} carrega contexto da base (RAG). Se faltar
   embasamento, marca trechos `[CONFIRMAR COM TIME]` e avisa.
4. {Sistema gera} os 3 artigos em jobs paralelos (fila). Card mostra progresso.
5. {Sistema roda auditoria automática} em cada um.
6. `[Pipeline]` → 3 cards em “Em revisão”, cada um com nota da auditoria.

> **Decisão de UX:** geração assíncrona com cards de progresso (não modal
> bloqueante). O operador pode disparar e continuar trabalhando em outro
> workspace — o paralelismo é o coração do produto.

## 6.6 Fluxo 5 — Revisão, edição e auditoria

1. `[Artigo] → tab Editor`. Painel direito: **Fontes** e **Auditoria**.
2. Operador lê; clica numa afirmação → vê a **fonte** (doc da base, SERP ou
   `[A VERIFICAR]`).
3. Usa sugestões da IA (reescrever/encurtar/ajustar tom).
4. tab **Auditoria**: checklist com itens obrigatórios + dimensões 0–10.
   - Item obrigatório reprovado **ou** dimensão < 8 → botão “Aprovar” bloqueado.
5. Operador corrige (ou pede correção à IA) → re-roda auditoria.
6. Tudo verde → **Aprovar** → status “Aprovado”.

## 6.7 Fluxo 6 — Publicação como rascunho

1. `[Artigo aprovado] → Publicar`.
2. {Sistema} valida integração de CMS conectada.
3. {Sistema} cria **rascunho** no WordPress (título SEO, meta, categorias, tags,
   schema). **Nunca** publica ao ar.
4. Sem conector: exporta Markdown/HTML e marca “WordPress pendente”.
5. Card vai para “Publicado (rascunho)”, com link para o CMS.

## 6.8 Fluxo 7 — Operar múltiplos clientes em paralelo

1. Switcher (`⌘K` → “Trocar workspace”) entre Avalyst, Cliente B, Cliente C.
2. Cada workspace mantém seu estado, fila e integrações isolados.
3. Dashboard de Conta agrega: produção por workspace, jobs em andamento, alertas.

> **Decisão de UX:** o estado é **preservado por workspace** ao trocar. Nada de
> “recomeçar do zero”. Isso torna o trabalho paralelo fluido e seguro.

## 6.9 Momentos de erro e recuperação (resumo)
- Job de IA falha → card em “Erro” com causa + retry (sem perder o briefing).
- Integração com credencial inválida → banner no workspace + CTA reconectar.
- Documento não processa → status “Erro” com motivo (formato, OCR) + reupload.
- Conflito de fontes → aviso de conflito com link para os dois documentos.
