# 04 — Funcionalidades Principais

Organizadas por **épicos**. Cada épico lista features, comportamento e **regras
de negócio** (RN). As RNs são a fonte da verdade para implementação e QA.

## Épico A — Workspaces & Multi-tenancy
**Features**
- Criar/editar/arquivar workspace (= cliente).
- Switcher de workspace (atalho `⌘K` → "Trocar workspace").
- Configurações por workspace: marca, voz, personas, ICP, idioma, fuso.
- Branding por workspace (logo, cor de acento) no console.

**Regras de negócio**
- **RN-A1:** todo dado (base, pautas, artigos, integrações, logs) é escopado a
  um `workspace_id`. Nenhuma query cruza workspaces.
- **RN-A2:** arquivar workspace torna-o somente-leitura; não apaga dados.
- **RN-A3:** o usuário só vê workspaces aos quais foi explicitamente adicionado.

## Épico B — Base de Conhecimento (Knowledge)
**Features**
- Upload de documentos (PDF, DOCX, MD, TXT, CSV) por categoria (produto,
  comercial, casos, jurídico, dados).
- Ingestão automática: extração de texto → chunking → embeddings (pgvector).
- Notas de produto estruturadas (equivalente ao `PRODUTO.md`).
- Índice navegável com status (vigente, desatualizado, em conflito).
- Busca semântica na base.
- Sincronização via pasta/Drive (drop zone) — ingestão por watcher/upload.

**Regras de negócio**
- **RN-B1:** afirmações comerciais/diferenciais/números no conteúdo de meio e
  fundo de funil **devem** citar um documento da base ou as notas de produto.
- **RN-B2:** documento sem data ou marcado “desatualizado” não é usado como
  fonte; gera `[A VERIFICAR]`.
- **RN-B3:** em conflito entre dois documentos, usar o mais recente e sinalizar.
- **RN-B4:** a IA nunca copia trechos longos; reescreve com a voz da marca
  (verificação anti-plágio interno no pipeline).

## Épico C — Integrações por Workspace
**Features**
- Conectar/desconectar integrações (cada uma com credencial própria, criptografada):
  - **CMS:** WordPress (REST API + Application Password).
  - **SEO:** Google Search Console, Ahrefs, Semrush (roadmap).
  - **Drive:** Google Drive (drop zone / conector quando disponível).
  - **CRM:** (roadmap) para atribuição de leads.
  - **Pesquisa web:** busca de SERP (nativa).
- Tela de status com teste de conexão e última sincronização.

**Regras de negócio**
- **RN-C1:** credenciais são criptografadas em repouso (envelope encryption) e
  nunca expostas no frontend após salvas.
- **RN-C2:** toda métrica de SEO carrega rótulo de **origem**: `MEDIDO`
  (conector), `OBSERVADO` (SERP/web), `ESTIMADO` (julgamento). Sem conector,
  número não é apresentado como confiável.
- **RN-C3:** publicação no CMS sempre como **rascunho**; nunca status "publish".

## Épico D — Pesquisa & Inteligência de SERP
**Features**
- Análise da SERP para a palavra-chave-alvo (top resultados).
- Mapa de concorrentes: estrutura, profundidade, FAQ, lacunas.
- Identificação de oportunidades/lacunas de conteúdo.
- (Roadmap) métricas `MEDIDO` quando conector de SEO conectado.

**Regras de negócio**
- **RN-D1:** nº de concorrentes analisados é registrado; se a ferramenta limitar,
  o relatório declara quantos foram.
- **RN-D2:** sem ferramenta de busca, a análise competitiva é marcada como
  pendente de verificação humana — nunca inventa concorrentes/métricas.

## Épico E — Pautas & Planejamento Editorial
**Features**
- Criação de pauta com os 3 filtros (tráfego, negócio, conversão).
- Clusters/jornadas (topo → meio → fundo) conectando pautas.
- Calendário editorial e quadro Kanban (Backlog → Em produção → Em revisão →
  Aprovado → Publicado).
- Modos de execução: **lote diário**, **pauta única**, **planejamento**.

**Regras de negócio**
- **RN-E1:** pauta exige palavra-chave-alvo, intenção, etapa de funil, persona,
  ângulo e origem dos dados.
- **RN-E2:** prioridade é tráfego com conexão comercial; volume sem conexão fica
  para depois (campo de score reflete isso).

## Épico F — Geração de Conteúdo (Motor de IA)
**Features**
- Briefing automático a partir da pauta + SERP + base de conhecimento (RAG).
- Geração de artigo por etapa de funil, na voz do workspace.
- Trilha de fontes: cada bloco/afirmação carrega a citação de origem.
- Sugestões inline no editor (reescrever, encurtar, ajustar tom, expandir FAQ).
- Geração de meta title, meta description, slug, schema, tags.

**Regras de negócio**
- **RN-F1:** geração de meio/fundo só roda após carregar o contexto da base; se
  a base não cobre o ângulo, o trecho sai `[CONFIRMAR COM TIME]`.
- **RN-F2:** toda geração registra modelo, prompt, fontes e custo de tokens
  (trilha de auditoria de IA).
- **RN-F3:** o conteúdo nunca promete aprovação garantida nem orienta a burlar
  análise de crédito (verificação de conformidade automática).

## Épico G — Auditoria & Conformidade
**Features**
- Checklist automático (itens obrigatórios + dimensões 0–10).
- Verificações de conformidade (LGPD, CDC, Lei do Inquilinato) e de fontes.
- Bloqueio de envio ao CMS enquanto houver item obrigatório reprovado ou
  dimensão < 8.
- Revisão humana com aprovação/devolução e comentários.

**Regras de negócio**
- **RN-G1:** reprovar 1 item obrigatório bloqueia o envio.
- **RN-G2:** dimensão < 8 devolve para revisão.
- **RN-G3:** aprovação final é sempre de um humano com papel `Editor+`.

## Épico H — Editor de Conteúdo
**Features**
- Editor rico (estilo Notion): blocos, headings, tabelas, FAQ, callouts.
- Painel lateral de fontes e de auditoria.
- Histórico de versões e diffs.
- Comentários e menções.

## Épico I — Publicação & Entrega
**Features**
- Enviar ao WordPress como rascunho, com categorias, tags, SEO e schema.
- Exportar Markdown/HTML para importação manual (fallback sem conector).
- Status do envio e link para o rascunho no CMS.

## Épico J — Dashboards & Relatórios
**Features**
- Dashboard de pipeline (Kanban + funil de produção).
- Métricas de produção e qualidade (North Star, lead time, aprovação).
- Relatório de saída por execução (artigos, fichas, SERP, embasamento,
  auditoria, lacunas, status do CMS).
- (Roadmap) performance pós-publicação.

## Épico K — Administração & Auditoria do Sistema
**Features**
- Gestão de membros e papéis (RBAC).
- Trilha de auditoria (quem fez o quê, quando) por workspace.
- Configurações de IA (modelos, limites de custo, temperatura por tarefa).
- Gestão de chaves/segredos.

## Épico L — Notificações
**Features**
- In-app + e-mail: job concluído, artigo aguardando revisão, auditoria reprovada,
  integração com erro.
