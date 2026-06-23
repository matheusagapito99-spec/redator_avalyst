# 14 — Segurança

Segurança é requisito de primeira classe — a plataforma guarda credenciais de
CMS/SEO dos clientes e processa dados em mercado regulado (LGPD).

## 14.1 Autenticação (AuthN)
- E-mail+senha (Argon2id), **magic link** e **SSO Google** (OAuth/OIDC).
- **2FA (TOTP)** opcional para usuários, **obrigatório para `Owner`/`Admin`**.
- Sessões via **cookies httpOnly, Secure, SameSite=Lax** + tokens rotativos
  (refresh com rotação e detecção de reuso). Sem JWT em localStorage.
- Rate limiting e lockout progressivo em login; proteção contra credential
  stuffing.

## 14.2 Autorização (AuthZ) e RBAC
- **RBAC por workspace** (owner/admin/editor/contributor/viewer — ver doc 03).
- Autorização **sempre no backend** (guards por endpoint + checagem de
  `membership`). O front apenas oculta ações (UX), nunca é a fonte da verdade.
- **Isolamento de tenant** reforçado por **RLS no Postgres** (doc 12): mesmo um
  bug de aplicação não vaza dados de outro workspace.
- Ações sensíveis (gerir integrações/segredos, publicar, gerir membros) exigem
  papel mínimo e são auditadas.

## 14.3 Gestão de segredos e credenciais de integração
- Credenciais de CMS/SEO/Drive dos clientes guardadas com **envelope
  encryption**: chave de dados criptografa o segredo; chave mestra em **KMS**.
- Segredos **nunca** retornam ao frontend após salvos (só status e identificador
  mascarado).
- Rotação de chaves suportada; acesso a segredos auditado.

## 14.4 Criptografia
- **Em trânsito:** TLS 1.2+ em todas as conexões (cliente, API, integrações,
  banco).
- **Em repouso:** banco e storage criptografados; segredos com camada adicional
  (envelope). Hash de senha com Argon2id.

## 14.5 LGPD e privacidade
- **Base legal e minimização:** coletar só o necessário; conteúdo da base é do
  cliente, sob contrato de tratamento.
- **Titularidade e isolamento:** dados por workspace; exportação e exclusão por
  workspace (atende direitos do titular e encerramento de cliente).
- **Direitos do titular:** rotina de exportação/eliminação de dados pessoais
  eventualmente presentes (ex.: dados em documentos da base).
- **Retenção:** políticas por tipo (audit_log imutável por X meses; documentos
  conforme contrato; logs sem PII).
- **DPA e subprocessadores:** Anthropic, cloud, SERP provider documentados como
  subprocessadores. Dados não usados para treinar modelos de terceiros
  (verificar termos do provedor de IA — requisito contratual).
- **Conteúdo editorial e conformidade:** verificações automáticas impedem
  promessa de “aprovação garantida”, orientação para burlar análise de crédito,
  e uso irresponsável de dados de inquilinos no texto (alinhado a CDC e Lei do
  Inquilinato).

## 14.6 Trilha de auditoria
- `audit_log` **append-only** registra ator, ação, entidade, metadata, IP e
  timestamp por workspace.
- `ai_run` registra cada execução de IA (modelo, fontes, tokens, custo) —
  rastreabilidade total de como cada conteúdo foi gerado.
- Logs de acesso a segredos e mudanças de papel.

## 14.7 Gestão de sessões
- Expiração por inatividade + expiração absoluta. Lista de sessões ativas com
  revogação (logout remoto). Revogação imediata ao trocar senha/role.

## 14.8 Proteção contra ataques
- **OWASP Top 10** como baseline.
- **Injeção:** ORM parametrizado (Prisma) + validação Zod em toda entrada.
- **XSS:** escaping no React; sanitização de HTML do editor (allowlist);
  CSP estrita.
- **CSRF:** SameSite + tokens para rotas mutáveis fora de tRPC.
- **SSRF:** allowlist de domínios para fetch de SERP/integrações; sem fetch de
  IP interno.
- **Prompt injection (específico de IA):** conteúdo de SERP/documentos é tratado
  como **dado não confiável** — instruções do sistema têm precedência; o motor
  não executa comandos vindos de fontes; saídas passam por validação e auditoria
  antes de qualquer ação (e nunca publicam sozinhas).
- **Rate limiting** por usuário/workspace/IP; **WAF**; bot protection no login.
- **Uploads:** verificação de tipo/tamanho, varredura antimalware, processamento
  isolado; storage sem execução.
- **Dependências:** SCA (Dependabot/Snyk), SAST e secret scanning no CI.

## 14.9 Resposta a incidentes
- Runbooks de incidente, severidades definidas, plano de comunicação e
  notificação LGPD (ANPD/titulares) quando aplicável. Pós-mortems sem culpa.
