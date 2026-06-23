# 15 — Performance

## 15.1 Orçamento de performance (metas)
- **Web Vitals:** LCP < 2.0s, INP < 200ms, CLS < 0.1 (p75).
- **API:** p95 < 300ms em leituras quentes; p99 < 800ms.
- **Geração de IA:** primeiro token < 3s; artigo completo conforme tamanho
  (assíncrono, com progresso — não bloqueia a UI).
- **Ingestão de documento:** feedback imediato; indexação assíncrona.

## 15.2 Estratégias de cache
- **CDN/Edge (Vercel):** assets estáticos e páginas RSC cacheáveis.
- **TanStack Query** no cliente: cache por `workspaceId`, revalidação em foco,
  optimistic updates.
- **Redis** no servidor: resultados de SERP (TTL), embeddings/contexto quente de
  RAG, sessões, rate limit.
- **Prompt caching (Anthropic):** contexto estável (princípios, voz, base) é
  cacheado entre gerações → reduz latência e custo.
- **Cache semântico de IA:** respostas para tarefas determinísticas (ex.: scoring
  de pauta) reaproveitadas por hash de entrada.
- **HTTP caching** com ETag/Cache-Control em endpoints de leitura.

## 15.3 Lazy loading e divisão de código
- Code splitting por rota (Next.js). Editor (TipTap), gráficos e kanban via
  `dynamic(import)`.
- Imagens com `next/image` (lazy + formatos modernos). Ícones tree-shaken.
- Virtualização de listas longas (base de conhecimento, artigos, logs).
- Prefetch de rotas prováveis (hover/intersection).

## 15.4 Otimização de banco e consultas
- Índices compostos iniciados por `workspace_id` (doc 12); cobertura para
  filtros frequentes.
- **N+1 evitado** com Prisma `include`/dataloader; paginação por cursor.
- **Read replicas** para dashboards/relatórios; consultas analíticas fora do
  primário.
- pgvector com índice HNSW para busca semântica sub-100ms em bases típicas.
- `EXPLAIN ANALYZE` no CI para queries críticas; limites de tempo de query.

## 15.5 Renderização
- **RSC + streaming**: shell instantâneo, conteúdo em stream; hidratação
  seletiva (menos JS no cliente).
- Skeletons reservando espaço (zero CLS). Suspense boundaries por seção.
- Componentes pesados só no cliente quando há interação real.

## 15.6 Escalabilidade horizontal
- API e workers **stateless** → escalam horizontalmente atrás de load balancer.
- Workers escalam por **profundidade de fila** (autoscaling): picos de geração
  não degradam a API.
- Postgres: read replicas + pooling (PgBouncer); particionamento das tabelas de
  maior crescimento (`ai_run`, `audit_log`).
- Isolamento de carga por workspace (rate limit/quotas) evita que um cliente
  afete os demais (noisy neighbor).

## 15.7 Performance da IA (custo é performance)
- **Seleção de modelo por tarefa** (forte p/ redação/auditoria; barato p/
  classificação) reduz custo e latência.
- **Streaming** de tokens para feedback imediato no editor.
- **Paralelização** controlada do lote diário (3 artigos em jobs concorrentes).
- **Batching** de embeddings na ingestão.
- Teto de custo e circuit breaker por workspace.

## 15.8 Monitoramento contínuo
- RUM (Web Vitals reais) + sintético; alertas de regressão.
- Painéis de latência de geração, custo por artigo, throughput de fila.
- Testes de carga (k6) antes de marcos de escala.
