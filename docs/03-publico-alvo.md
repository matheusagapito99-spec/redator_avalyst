# 03 — Público-Alvo

O Redator tem **dois níveis de público**: os **operadores** da plataforma (quem
usa o produto) e os **leitores finais** do conteúdo (quem o conteúdo serve, por
workspace). A arquitetura de produto serve o primeiro; a arquitetura editorial
serve o segundo.

## 3.1 Usuários da plataforma (operadores)

### Persona 1 — Operador de Growth / Dono da operação ("Matheus")
- **Contexto:** gerencia múltiplos clientes, conecta ferramentas, alimenta
  bases, dispara e revisa produção.
- **Objetivos:** escalar entrega, manter qualidade, provar resultado, atender
  vários clientes em paralelo.
- **Dores:** trocar de contexto entre clientes, credenciais misturadas, falta
  de visão consolidada, retrabalho.
- **JTBD:** *“Quando assumo um novo cliente, quero configurar workspace,
  conectar as ferramentas dele e começar a produzir no mesmo dia, sem risco de
  misturar dados.”*
- **Permissão:** `Owner` (acesso total, gestão de workspaces e billing futuro).

### Persona 2 — Editor / Revisor de conteúdo ("Ana")
- **Contexto:** revisa rascunhos gerados pela IA, roda a auditoria, aprova ou
  devolve.
- **Objetivos:** garantir qualidade, conformidade e voz de marca.
- **Dores:** revisar texto sem saber a origem dos dados; checklist manual.
- **JTBD:** *“Quando recebo um rascunho, quero ver de onde veio cada afirmação e
  o resultado da auditoria, para aprovar com segurança em minutos.”*
- **Permissão:** `Editor` (produz, edita, audita; não gerencia integrações nem
  membros).

### Persona 3 — Redator / Estrategista de pauta ("Bruno")
- **Contexto:** define clusters, intenções de busca, ângulos; dispara gerações.
- **Objetivos:** pautas que geram tráfego com conexão comercial.
- **Dores:** pesquisar SERP manualmente; organizar clusters em planilhas.
- **JTBD:** *“Quero montar um cluster de pautas com base na SERP e na base do
  cliente, e enfileirar a produção.”*
- **Permissão:** `Editor` ou `Contributor`.

### Persona 4 — Cliente / Stakeholder (acesso de leitura) ("Diretoria Avalyst")
- **Contexto:** acompanha o que está sendo produzido e aprova temas sensíveis.
- **Objetivos:** transparência e controle de marca.
- **Dores:** não ter visibilidade do pipeline.
- **JTBD:** *“Quero ver o que está em produção e aprovado, sem mexer no fluxo.”*
- **Permissão:** `Viewer` (somente leitura, escopado ao workspace dele).

### Matriz de papéis (RBAC) — resumo
| Papel | Workspaces | Integrações/Credenciais | Membros | Produção | Auditoria | Publicar* |
|---|---|---|---|---|---|---|
| Owner | CRUD todos | Sim | Sim | Sim | Sim | Sim* |
| Admin | CRUD do escopo | Sim | Sim | Sim | Sim | Sim* |
| Editor | Acessa | Não | Não | Sim | Sim | Não |
| Contributor | Acessa | Não | Não | Sim (gera/edita) | Não | Não |
| Viewer | Lê | Não | Não | Não | Não | Não |

\* “Publicar” = enviar rascunho ao CMS. **Nunca** é publicação automática ao ar;
mesmo o Owner publica como rascunho/agenda sob revisão.

## 3.2 Leitores finais do conteúdo (por workspace — exemplo Avalyst)

Herdado do agente. O conteúdo serve o **ICP do cliente**.

**ICP primário da Avalyst:** imobiliárias de locação residencial estruturadas
(300–5.000 contratos ativos), operação profissionalizada, uso de CRM/ERP.

**Personas editoriais:**
- **Diretor de locação escalável** — quer crescer carteira com eficiência e menos risco.
- **Dono de imobiliária regional** — quer segurança, confiança, estabilidade.
- **Gestora de operações modernas** — quer automação, digitalização, velocidade.

**Audiências secundárias:** inquilinos e proprietários (topo de funil),
sempre conectando à imobiliária/garantia locatícia e apontando ao ICP primário.

> **Decisão de arquitetura:** as personas editoriais são **dados do workspace**
> (configuráveis), não hard-coded. Cada novo cliente cadastra seu ICP e personas,
> e o motor de IA usa isso como contexto. É o que permite escalar para outros
> mercados sem reescrever o produto.

## 3.3 Anti-personas (para quem NÃO construímos no MVP)
- Usuário self-service que quer publicar sem revisão. (Conflita com o princípio
  de governança.)
- Blogueiro avulso sem base de conhecimento. (O valor está no grounding.)
