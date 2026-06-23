# 01 — Visão Geral do Produto

## 1.1 Resumo executivo

**Redator** é uma plataforma interna AI-native de **operações de conteúdo, SEO e
growth**, organizada como um **console multi-workspace**. Cada empresa atendida
(começando pela **Avalyst**) é um workspace isolado, com sua própria base de
conhecimento, integrações conectadas (CMS, ferramentas de SEO, Drive, CRM),
personas e pipeline editorial. Um time central de operadores gerencia todos os
workspaces a partir de uma interface única e executa os ciclos de produção em
paralelo.

O produto transforma um fluxo hoje manual e dependente de prompts soltos
(pesquisa de SERP → seleção de pauta → redação → auditoria → rascunho) num
**sistema operacional editorial**: governado, auditável, com isolamento de
dados por cliente e com a IA fazendo o trabalho pesado sob supervisão humana.

> **Decisão de produto (justificativa):** o Redator **não** é um gerador de texto
> genérico. O diferencial está no **contexto por workspace** (base de conhecimento
> + integrações reais do cliente) e na **governança** (nunca inventa dado, nunca
> publica sozinho, conformidade jurídica embutida). É isso que separa um produto
> premium de um wrapper de LLM.

## 1.2 O problema

Operações de conteúdo para o mercado de locação/garantia locatícia sofrem com:

1. **Escala manual.** Produzir 3 artigos/dia com qualidade real exige pesquisa,
   redação e revisão — não escala no esforço humano linear.
2. **Risco de alucinação.** LLMs soltos inventam estatística, preço e dado
   jurídico. Em um mercado regulado (Lei do Inquilinato, CDC, LGPD), isso é
   passivo legal e de reputação.
3. **Contexto perdido.** O conhecimento do cliente (diferenciais, condições,
   cases) vive espalhado em PDFs, Drives e cabeças. A IA não acessa isso.
4. **Falta de governança.** Sem trilha de auditoria, não dá para saber por que
   um conteúdo foi aprovado, de onde veio cada dado e quem revisou.
5. **Multi-cliente caótico.** Atender várias empresas significa misturar
   credenciais, bases e tom de marca. Sem isolamento, vira bagunça e vazamento.

## 1.3 A proposta de valor

| Para quem | Dor | Como o Redator resolve |
|---|---|---|
| Operador de growth (você) | Produzir muito, com qualidade, para vários clientes | Console multi-workspace + motor de IA que executa pautas em paralelo |
| Editor/revisor | Garantir qualidade e conformidade | Auditoria automática por checklist + revisão humana obrigatória |
| Cliente (Avalyst) | Tráfego que vira receita, sem risco | Conteúdo embasado na base do cliente, com fontes rastreáveis |
| Gestor | Previsibilidade e prova de valor | Dashboards de pipeline, produção e (futuramente) performance de SEO |

**Promessa central:** *“Conteúdo de especialista, na velocidade da IA, com a
segurança de um processo auditável — para cada cliente, em paralelo.”*

## 1.4 Pilares do produto

1. **Workspace-first.** Tudo é escopado a um workspace (cliente). Isolamento de
   dados, integrações e identidade de marca.
2. **AI-native, human-governed.** A IA produz; o humano aprova. Nunca publica
   sozinha. Toda decisão é rastreável.
3. **Grounded by knowledge.** RAG sobre a base de conhecimento do workspace.
   Sem fonte, sem afirmação.
4. **Compliance embutido.** Regras de Lei do Inquilinato, CDC e LGPD viram
   verificações automáticas no pipeline.
5. **Premium por padrão.** UX no nível de Linear/Notion/Stripe: rápida, limpa,
   com microinterações e zero fricção.

## 1.5 Escopo da v1 (MVP) vs. futuro

**Dentro do MVP:**
- Multi-workspace com RBAC.
- Base de conhecimento por workspace (upload + ingestão + RAG).
- Integração de pesquisa web (SERP) e ingestão de Drive (via upload/sync).
- Pipeline editorial: pauta → briefing → redação (IA) → auditoria → rascunho.
- Editor de artigo com sugestões da IA e trilha de fontes.
- Conector WordPress (criação de rascunho via REST API).
- Auditoria por checklist + revisão humana.
- Observabilidade e trilha de auditoria.

**Fora do MVP (roadmap):**
- Conectores nativos de SEO (Search Console/Ahrefs/Semrush) com métricas `MEDIDO`.
- Conector MCP de Google Drive (quando disponível).
- Billing/planos (caso vire produto comercial).
- Agendamento automático e calendário editorial avançado.
- Analytics de performance pós-publicação (tráfego, ranking, conversão).

> **Justificativa do recorte:** o MVP entrega o ciclo completo de produção com
> governança — o coração do valor. SEO `MEDIDO` e analytics dependem de contas/
> credenciais externas e podem entrar incrementalmente sem retrabalho, porque a
> arquitetura já prevê o conceito de “origem do dado” (`MEDIDO`/`OBSERVADO`/
> `ESTIMADO`).

## 1.6 Benchmark de experiência

A régua de qualidade visual e de interação é a de Linear (velocidade, atalhos,
densidade elegante), Notion (edição rica e flexível), Stripe (clareza e
confiança), Vercel/Framer (estética premium e motion). O Redator deve causar a
mesma sensação imediata de produto sofisticado e confiável.
