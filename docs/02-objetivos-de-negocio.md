# 02 — Objetivos de Negócio

## 2.1 Visão

Ser o **sistema operacional editorial** de operações de growth que atendem
múltiplos clientes — começando como ferramenta interna e podendo evoluir para
produto comercial. O Redator deve permitir que um time pequeno entregue
conteúdo de qualidade de especialista, em escala, para várias empresas em
paralelo, sem perder governança nem qualidade.

## 2.2 Objetivos estratégicos

1. **Escalar produção sem escalar headcount linearmente.** Meta operacional de
   referência: sustentar 3 artigos/dia por workspace ativo, com qualidade
   auditada.
2. **Eliminar risco de conteúdo.** Zero publicação sem revisão humana; zero
   afirmação sem fonte rastreável.
3. **Provar valor comercial.** Conectar produção → tráfego → leads → receita
   (à medida que os conectores de analytics entram).
4. **Operar N clientes em paralelo** com isolamento total de dados e marca.
5. **Construir um ativo reutilizável**: o que funciona para a Avalyst replica
   para o próximo cliente com setup, não com reconstrução.

## 2.3 North Star Metric

**Artigos aprovados em auditoria por semana, por workspace** — uma métrica que
só sobe quando produção *e* qualidade sobem juntas (artigo reprovado não conta).

> **Justificativa:** evita o vício de “volume puro”. Um número que cresce só com
> qualidade aprovada alinha o produto ao objetivo real: conteúdo que pode ir ao
> ar e gerar resultado.

## 2.4 KPIs por camada

**Produção**
- Artigos aprovados / semana / workspace (North Star).
- Lead time de pauta → rascunho aprovado (meta inicial: < 1 dia útil).
- Taxa de aprovação na 1ª auditoria (meta: ≥ 70%).

**Qualidade**
- % de afirmações com fonte rastreável (meta: 100% ou marcadas `[A VERIFICAR]`).
- Itens obrigatórios de auditoria reprovados (meta: 0 no conteúdo publicado).
- Nota média das dimensões de qualidade (meta: ≥ 8/10).

**Negócio (à medida que entram conectores)**
- Tráfego orgânico por cluster de conteúdo.
- Posição média na SERP para palavras-chave-alvo.
- Leads/conversões atribuídos a conteúdo.

**Operação da plataforma**
- Custo de IA por artigo (tokens × preço).
- Uptime, latência de geração, taxa de erro de jobs.
- Tempo de onboarding de um novo workspace (meta: < 1 dia).

## 2.5 Modelo de valor / custos

- **Custo variável dominante:** chamadas de IA (geração + auditoria + embeddings).
  Mitigado por cache semântico, prompt caching e seleção de modelo por tarefa
  (modelo forte para redação/auditoria; modelo barato para classificação).
- **Custo de infra:** previsível (Postgres, Redis, storage, compute serverless).
- **Alavanca de margem:** reuso entre workspaces (templates, prompts, design
  system) e automação do pipeline.

## 2.6 Critérios de sucesso do MVP

O MVP é considerado bem-sucedido quando:
1. Avalyst opera 100% da produção dentro do Redator (sem prompts soltos).
2. Um 2º workspace é criado e produz conteúdo sem mudança de código.
3. Lead time pauta → rascunho aprovado < 1 dia útil.
4. 100% dos rascunhos têm trilha de fontes e passam pela auditoria por checklist.
5. Nenhum incidente de vazamento entre workspaces.

## 2.7 Restrições e premissas de negócio

- Ferramenta **interna** primeiro; arquitetura **multi-tenant-ready** para
  evoluir a produto sem reescrita.
- Conformidade (LGPD, CDC, Lei do Inquilinato) é requisito, não opcional.
- Publicação sempre sob revisão humana — decisão de produto inegociável.
