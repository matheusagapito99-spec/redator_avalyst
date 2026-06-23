# 20 — Recomendações Futuras

Evolução do Redator depois do MVP, em ordem de valor/risco. Cada item já é
suportado pela arquitetura proposta (sem reescrita).

## 20.1 Inteligência de SEO real (`MEDIDO`)
- Conectores nativos: **Google Search Console** (dados do próprio site),
  **Ahrefs/Semrush** (volume, dificuldade, backlinks).
- Desbloqueia priorização de pauta por dado real e o passo de “potencial de
  tráfego” deixa de ser `ESTIMADO`.
- A arquitetura já carrega o conceito de **origem do dado** — basta preencher
  `MEDIDO`.

## 20.2 Analytics de performance pós-publicação
- Fechar o loop produção → tráfego → leads → receita.
- Integração com GA4/Search Console + CRM dos clientes para **atribuição**.
- Dashboards de ROI por cluster de conteúdo (o argumento comercial mais forte).

## 20.3 Mais canais e CMSs
- Webflow, Framer, HubSpot CMS, headless (Contentful/Sanity).
- LinkedIn/newsletter para repurposing de conteúdo (1 artigo → N formatos).

## 20.4 IA mais autônoma (sob governança)
- **Sugestão proativa de pautas** com base em lacunas da SERP e sazonalidade.
- **Atualização de conteúdo** (content refresh) detectando artigos defasados.
- **A/B de títulos/meta** com aprendizado de CTR.
- **Agente de pesquisa** que enriquece a base automaticamente (com curadoria
  humana). Sempre mantendo: nunca inventar, nunca publicar sozinho.

## 20.5 Conector nativo de Google Drive
- Substituir a drop zone por sincronização nativa (quando houver conector MCP/
  API estável), com ingestão incremental e detecção de mudanças.

## 20.6 Colaboração e workflow
- Comentários em tempo real, atribuição de tarefas, aprovações em múltiplas
  etapas (ex.: aprovação do cliente antes do envio ao CMS).
- Papéis de cliente com visão somente-leitura e aprovação de temas sensíveis.

## 20.7 Caminho para produto comercial (se desejado)
- **Billing & planos** (Stripe), self-service de onboarding de clientes,
  limites por plano, marketplace de templates por nicho.
- A base multi-tenant já existe; faltaria a camada de monetização e self-service.
- Modelo possível: SaaS para imobiliárias/agências do nicho de garantia
  locatícia, vendendo o que já provou valor internamente.

## 20.8 Plataforma e escala técnica
- Extrair o **worker de IA** em serviço próprio quando o volume justificar.
- Particionamento e tiered storage para `ai_run`/`audit_log`.
- Multi-região para latência e DR mais forte.
- **Abstração de modelos** de IA (trocar/combinar provedores; usar modelo local
  para tarefas baratas).

## 20.9 Governança e confiança
- Relatórios de conformidade exportáveis (trilha de fontes por artigo).
- Certificações (ISO 27001/SOC 2) se virar produto vendido.
- Centro de transparência: para cada artigo, “como foi feito” (fontes, modelo,
  auditoria) — diferencial de confiança no mercado regulado.

## 20.10 Princípio que não muda
Independente da evolução, os cinco princípios inegociáveis permanecem o núcleo:
**nunca inventar dados, nunca publicar sozinho, só afirmar o que está embasado,
conformidade primeiro, honestidade editorial.** É isso que torna o Redator um
produto de confiança — e não mais um gerador de texto.
