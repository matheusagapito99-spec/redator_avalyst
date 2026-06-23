# 19 — Riscos Técnicos

Matriz de riscos com probabilidade (P), impacto (I) e mitigação. Escala B/M/A.

## 19.1 Risco de IA / conteúdo

| Risco | P | I | Mitigação |
|---|---|---|---|
| **Alucinação** (dado/número/jurídico inventado) | A | A | RAG obrigatório, self-check de fontes, gate de auditoria, badge de origem, marcação `[A VERIFICAR]`, revisão humana. **Nunca publica sozinho.** |
| **Prompt injection** via documentos/SERP | M | A | Fontes tratadas como dado não confiável; precedência do system prompt; sem execução de comandos de fontes; saída validada antes de qualquer ação |
| **Conteúdo não conforme** (promessa de aprovação, burlar crédito) | M | A | Verificações de conformidade automáticas (CDC/Lei do Inquilinato/LGPD) + revisão humana |
| **Custo de IA descontrolado** | M | M | Teto por workspace, prompt caching, seleção de modelo por tarefa, cache semântico, alertas de custo |
| **Regressão de qualidade ao mudar prompt** | M | M | Golden set de avaliação no CI; versionamento de prompts; rollback |
| **Plágio/cópia de fonte** | B | A | Anti-cópia (não copiar trechos longos), reescrita na voz da marca, verificação de similaridade |

## 19.2 Risco de multi-tenancy / segurança

| Risco | P | I | Mitigação |
|---|---|---|---|
| **Vazamento entre workspaces** | B | A | RLS no Postgres + `workspace_id` em tudo + testes de autorização que tentam cruzar tenant |
| **Vazamento de credenciais de clientes** | B | A | Envelope encryption + KMS, segredos nunca no front, auditoria de acesso, rotação |
| **Escalonamento de privilégio** | B | A | AuthZ no backend, RBAC testado, 2FA para admin |
| **Exposição de PII (LGPD)** | M | A | Minimização, isolamento, exportação/eliminação por workspace, DPA com subprocessadores |

## 19.3 Risco técnico / arquitetura

| Risco | P | I | Mitigação |
|---|---|---|---|
| **Acoplamento do monólito** com o tempo | M | M | Fronteiras de módulo, ADRs, extração planejada do worker de IA se preciso |
| **Gargalo no Postgres** (vetores + relacional) | M | M | Índices HNSW, read replicas, particionamento, opção de mover vetores p/ serviço dedicado |
| **Fila travada / jobs perdidos** | M | M | Idempotência, dead-letter + alerta, jobs críticos persistidos no Postgres |
| **Dependência de provedor de IA** (lock-in/uptime) | M | M | Camada de abstração de modelo; possibilidade de fallback; registro de custo/latência |
| **Dependência de SERP/integrações externas** | M | M | Caminho degradado (marca como pendente), cache, retries, circuit breaker |

## 19.4 Risco de produto / operação

| Risco | P | I | Mitigação |
|---|---|---|---|
| **Base de conhecimento vazia/pobre** → fundo de funil fraco | A | M | Indicador de cobertura, onboarding que pede material, marcação `[CONFIRMAR COM TIME]` |
| **Adoção baixa** (operador volta aos prompts soltos) | M | A | UX premium, velocidade, paralelismo real, ganho claro de tempo |
| **Escopo inflado** (virar “produto pra vender” cedo demais) | M | M | Recorte de MVP firme; multi-tenant-ready sem construir billing agora |
| **Conhecimento desatualizado gerando dado errado** | M | M | Status “desatualizado”, sinalização de conflito, não usar dado duvidoso |

## 19.5 Top 5 a vigiar continuamente
1. Alucinação/conformidade de conteúdo (impacto reputacional/legal).
2. Isolamento entre workspaces e segredos de clientes.
3. Custo de IA por workspace.
4. Qualidade do RAG (cobertura/relevância da base).
5. Performance/escala do Postgres com vetores.
