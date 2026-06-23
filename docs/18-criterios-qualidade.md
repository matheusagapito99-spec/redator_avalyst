# 18 — Critérios de Qualidade

Qualidade aqui é de **dois tipos**: a do **software** (engenharia) e a do
**conteúdo** (editorial). Ambas têm gates explícitos.

## 18.1 Definition of Ready (DoR) — história pronta para sprint
- Valor e persona claros; critérios de aceite escritos.
- Dependências e contratos de API definidos; design/UX referenciado.
- Impacto em segurança/LGPD e multi-tenant avaliado.
- Estimada e cabe no sprint.

## 18.2 Definition of Done (DoD) — software
- Código revisado (PR aprovado), padrões de lint/format/typecheck ok.
- Testes: unitários + de componente; E2E para fluxos críticos. Cobertura
  significativa (meta ≥ 80% nos módulos de domínio).
- Acessibilidade AA nos componentes tocados; estados empty/loading/error.
- Telemetria/observabilidade adicionada (logs/métricas relevantes).
- Migrations backward-compatible; RLS verificada para novas tabelas.
- Documentação atualizada (Storybook/README/contratos).
- Sem regressão de performance (orçamento do doc 15).
- Feature flag quando aplicável; deploy verificado em staging.

## 18.3 Critérios de aceite editorial (gate de conteúdo)
Herdado e formalizado a partir da auditoria do agente. **Itens obrigatórios —
reprovar 1 bloqueia o envio ao CMS:**
1. Toda afirmação factual tem fonte ou está `[A VERIFICAR]`.
2. Nenhuma métrica de SEO inventada; origem declarada (`MEDIDO`/`OBSERVADO`/
   `ESTIMADO`).
3. Afirmações sobre o cliente ancoradas nas notas de produto ou na base.
4. Fundo de funil: documentos de embasamento listados no relatório.
5. Conformidade jurídica e LGPD revisadas.
6. Intenção de busca atendida.
7. Cobre lacuna real frente à SERP.
8. Etapa do funil clara e CTA coerente.
9. Voz e estilo conforme o design editorial do workspace.
10. Título cumpre o que o corpo entrega.

**Dimensões (0–10, mínimo 8):** profundidade/cobertura semântica, clareza/
escaneabilidade, diferenciação frente à SERP, força do caminho de conversão,
sinais de EEAT.

> O gate editorial é **executado pela plataforma** (auditoria automática) e
> **confirmado por humano**. Nenhum conteúdo vai ao CMS sem ambos.

## 18.4 Estratégia de testes (software)
- **Unit** (Vitest): regras de negócio (RNs do doc 04), scoring de pauta, gates
  de auditoria.
- **Component** (Testing Library): estados de componentes do design system.
- **Integração**: módulos backend com Postgres de teste + RLS.
- **E2E** (Playwright): gerar → revisar → auditar → aprovar → publicar; isolamento
  entre workspaces; RBAC.
- **Carga** (k6): geração concorrente, ingestão em lote.
- **Segurança**: SAST, SCA, secret scanning, testes de autorização (tentar
  acessar outro workspace deve falhar).
- **IA/qualidade**: conjunto de avaliação (golden set) para regressão de prompts
  (uma mudança de prompt não pode derrubar a taxa de aprovação).

## 18.5 Qualidade de código e processo
- TypeScript strict, ESLint + Prettier, convenção de commits.
- PRs pequenos, revisão obrigatória, CI verde para merge.
- ADRs (Architecture Decision Records) para decisões relevantes.
- Orçamentos de performance e custo de IA monitorados em painel.

## 18.6 Métricas de qualidade acompanhadas
- Taxa de aprovação na 1ª auditoria, defeitos escapados, MTTR.
- Cobertura de testes, flutuação de cobertura por PR.
- Web Vitals reais (RUM), erro de jobs, custo de IA por artigo.
