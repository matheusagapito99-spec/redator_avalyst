# 09 — Protótipo Textual das Telas

Detalhamento de comportamento de cada tela-chave: componentes, interações,
estados e microcopy. Complementa os wireframes (doc 07).

## 9.1 Login / Autenticação
- **Componentes:** logo, campo e-mail, botão “Continuar”, SSO (Google), link
  “entrar com magic link”.
- **Comportamento:** e-mail → senha **ou** magic link; 2FA (TOTP) se ativo.
  Erros inline (“E-mail ou senha incorretos”). Rate limit após 5 tentativas.
- **Microcopy:** “Bem-vindo de volta. Entre para continuar suas operações.”

## 9.2 Onboarding (criação de conta + 1º workspace)
- Stepper de 4 passos (Identidade · Marca & voz · Conhecimento · Integrações).
- Cada passo pode ser pulado (“Configurar depois”). Botão final: “Ir para o
  workspace”.
- **Estado:** progresso salvo a cada passo (retomável). Validação por passo.
- **Microcopy passo 1:** “Vamos criar o primeiro cliente. Como ele se chama?”

## 9.3 Dashboard do workspace
- **Bloco Prontidão:** barra + checklist clicável (cada item leva à tela de
  setup correspondente).
- **Cartões de métrica:** Aprovados/semana, Em revisão, Lead time, Custo IA
  (com badge `ESTIMADO` enquanto não houver dado real).
- **Mini-kanban:** contadores por coluna, clique abre o Pipeline filtrado.
- **Atividade recente** (timeline) + **Próximas ações** (alertas acionáveis).
- **Empty state (workspace novo):** “Seu workspace está pronto. Comece criando
  uma execução ou alimentando a base.” + 2 CTAs.

## 9.4 Pipeline (Kanban)
- **Colunas:** Backlog, Produção, Revisão, Aprovado, Publicado.
- **Card:** título, badges (funil, persona), indicador de origem do dado,
  avatar do responsável, nota de auditoria (na coluna Revisão), progresso (na
  coluna Produção).
- **Interações:** drag-and-drop entre colunas (com regras: não move p/ Aprovado
  sem auditoria ok); clique abre o artigo; menu “⋯” (duplicar, arquivar).
- **Filtros:** funil, persona, responsável, busca. **Calendário:** mesma data,
  visão temporal por data de publicação planejada.

## 9.5 Wizard de Nova Execução
- **Passo Modo:** 3 cards (Lote diário / Pauta única / Planejamento).
- **Passo Tema:** input de palavra-chave/cluster + opção “sugira você”.
- **Passo Contexto:** seleção de persona, etapa de funil (auto no lote), e
  pré-visualização do que a base cobre sobre o tema (cards de docs relevantes).
- **Passo Revisão:** resumo + botão “Gerar”. Dispara job(s) assíncrono(s).
- **Feedback:** ao confirmar, toast “Execução iniciada — acompanhe no Pipeline”
  e cards aparecem em “Produção” com progresso.

## 9.6 Editor de Artigo
- **Header:** breadcrumb, status, tabs (Editor/Fontes/Auditoria/SEO), botão
  primário contextual (Aprovar / Publicar conforme status).
- **Editor (centro):** blocos editáveis; selecionar texto → toolbar flutuante
  (Negrito, Link, H2/H3, e ações IA: Reescrever, Encurtar, Expandir, Ajustar
  tom, Transformar em FAQ). Comando “/” insere blocos.
- **Citações:** marcações ⟦fonte⟧ ancoram afirmações; hover mostra trecho-fonte.
- **Painel Fontes:** lista de documentos usados + itens `[A VERIFICAR]` em
  vermelho com CTA “resolver”.
- **Painel Auditoria:** itens obrigatórios (✓/✗) + dimensões (barras 0–10).
  Botão “Re-rodar auditoria”. **Aprovar** desabilitado com tooltip de bloqueio.
- **Tab SEO:** meta title (contador), meta description (contador), slug
  (editável), focus keyword, secundárias, schema, preview de SERP (snippet).
- **Versões:** histórico com diff e “restaurar”.
- **Microcopy bloqueio:** “Resolva 1 item obrigatório e a dimensão Conversão
  (7/10) para aprovar.”

## 9.7 Base de Conhecimento
- **Toolbar:** tabs por categoria, busca semântica, botão “Adicionar
  documentos”, indicador de cobertura.
- **Lista/tabela:** nome, tipo, data, status (Indexado/Processando/
  Desatualizado/Erro), ações (visualizar, recategorizar, remover).
- **Upload:** dropzone modal com progresso por arquivo + escolha de categoria.
- **Visualizador de doc:** preview + chunks indexados + “usado em N artigos”.
- **Empty state:** “Alimente a base para gerar conteúdo de meio e fundo de funil
  com embasamento real.”

## 9.8 SERP / Inteligência
- **Entrada:** palavra-chave-alvo → “Analisar”.
- **Resultado:** lista dos top resultados (título, domínio, tipo de conteúdo,
  presença de FAQ), badge `OBSERVADO`; quadro de lacunas/oportunidades.
- **Sem ferramenta:** banner “Análise de SERP indisponível nesta sessão —
  marcada como pendente de verificação”. Nunca inventa.

## 9.9 Integrações
- **Lista por categoria** (CMS/SEO/Arquivos/Pesquisa/CRM). Cada item: status,
  conta, ações (Conectar/Testar/Reconectar/Remover).
- **Modal de conexão (WordPress):** URL do site, usuário, Application Password
  (campo secreto), botão “Testar conexão” antes de salvar.
- **Estado de erro:** vermelho + causa (“Credencial inválida — gere nova
  Application Password”).

## 9.10 Relatórios
- **Produção:** North Star (aprovados/semana), lead time, taxa de aprovação,
  custo IA. Filtro por período e workspace.
- **Relatório de saída por execução:** artigos, fichas de pauta, resumo de SERP
  (com origem), embasamento por artigo de fundo, auditoria item a item, lacunas
  `[A VERIFICAR]`/`[CONFIRMAR COM TIME]`, status do CMS. Exportável (PDF/MD).

## 9.11 Pessoas & Papéis
- Tabela de membros (avatar, nome, e-mail, papel, último acesso), convite por
  e-mail, troca de papel (RBAC), remoção. Escopo por workspace.

## 9.12 Configurações do Workspace
- **Marca:** logo, cor de acento, voz/tom, idioma, fuso.
- **Editorial:** ICP, personas (CRUD), regras de conformidade ativas.
- **IA:** modelo por tarefa (redação/auditoria/classificação), temperatura,
  teto de custo por execução/mês, alertas.
- **Auditoria do sistema:** trilha de eventos (filtros por ator/ação/data).

## 9.13 Conta (nível operador)
- Workspaces (grid com prontidão e produção de cada), membros da conta,
  segurança (2FA, sessões ativas, chaves de API), billing (roadmap).
