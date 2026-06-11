# SGTI — Sistema de Gestão de Tecnologia da Informação
## Arquitetura e Padrões de Integração — Documentação Funcional e Técnica

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [22_AUTHENTICATION.md](./22_AUTHENTICATION.md) · [20_DATABASE.md](./20_DATABASE.md) · [44_IDENTITY_MANAGEMENT.md](./44_IDENTITY_MANAGEMENT.md) · [40_INCIDENT_MANAGEMENT.md](./40_INCIDENT_MANAGEMENT.md)

---

## Sobre este Documento

Este documento define a **arquitetura e os padrões de integração do SGTI** com sistemas internos e externos. Cobre padrões de API, webhooks, eventos, segurança, tratamento de falhas e observabilidade.

**Escopo:** documentação funcional e técnica de integração. Nenhum código ou SQL é gerado aqui.

---

## Sumário

1. [Google Workspace](#1-google-workspace)
2. [GLPI](#2-glpi)
3. [Supabase](#3-supabase)
4. [E-mail Corporativo](#4-e-mail-corporativo)
5. [API Corporativa de Identidades](#5-api-corporativa-de-identidades)
6. [Cloudflare](#6-cloudflare)
7. [Vercel](#7-vercel)
8. [GitHub](#8-github)
9. [Arquitetura de Integração](#9-arquitetura-de-integração)
10. [REST APIs — Padrões](#10-rest-apis--padrões)
11. [Webhooks — Padrões](#11-webhooks--padrões)
12. [Arquitetura Orientada a Eventos](#12-arquitetura-orientada-a-eventos)
13. [Segurança nas Integrações](#13-segurança-nas-integrações)
14. [Logs e Rastreabilidade](#14-logs-e-rastreabilidade)
15. [Auditoria — Trilhas Obrigatórias](#15-auditoria--trilhas-obrigatórias)
16. [Tratamento de Falhas](#16-tratamento-de-falhas)
17. [Observabilidade](#17-observabilidade)
18. [Dashboards de Integração](#18-dashboards-de-integração)
19. [Relatórios](#19-relatórios)
20. [Regras de Negócio](#20-regras-de-negócio)
21. [Critérios de Aceitação](#21-critérios-de-aceitação)

---

## 1. Google Workspace

### 1.1 Visão Geral

O Google Workspace é o **provedor de identidade primário** do SGTI. Toda autenticação de usuários humanos é federada ao Google via OAuth 2.0. O SGTI consome e complementa as identidades do Google, sem substituir o Google Admin Console como console de administração.

| Papel | Google Workspace | SGTI |
|:-----:|:---------------:|:----:|
| Identity Provider (IdP) | ✅ Fonte primária | Consome via OAuth 2.0 |
| Diretório de Usuários | ✅ Fonte de autoridade | Espelho + campos extras de negócio |
| MFA | ✅ Gerenciado no Google | Informativo (campo `mfa_enabled`) |
| Autorização / RBAC | — | ✅ Gerenciado exclusivamente pelo SGTI |
| Sessões | Complementar (Refresh Token) | ✅ JWT RS256 do SGTI |

### 1.2 Autenticação — OAuth 2.0 com PKCE

```
FLUXO DE AUTENTICAÇÃO (detalhamento em 22_AUTHENTICATION.md)

1. Usuário clica "Entrar com Google"
2. Frontend gera code_verifier (aleatório) e code_challenge = SHA-256(code_verifier)
3. Redireciona para: accounts.google.com/o/oauth2/v2/auth
   Parâmetros: response_type=code, client_id, redirect_uri, scope,
               code_challenge, code_challenge_method=S256
               hd={domínio_corporativo} ← Restringe a contas do domínio
4. Google autentica + MFA (se configurado)
5. Google redireciona para callback com authorization_code
6. Backend troca code + code_verifier por id_token + access_token
7. Valida id_token: assinatura RS256, exp, aud, hd = domínio corporativo
8. Identifica usuário por sub (google_user_id)
9. Emite JWT RS256 do SGTI com claims de negócio (roles, tenant_id)
```

### 1.3 Provisionamento via Admin SDK

O SGTI usa **Google Admin SDK** com Service Account configurada com Domain-Wide Delegation:

| Escopo OAuth | Operações |
|:------------:|-----------|
| `admin.directory.user` | Criar, ler, atualizar e suspender usuários |
| `admin.directory.group` | Ler e gerenciar membros de grupos |
| `admin.directory.orgunit` | Ler unidades organizacionais |

**Adapter:** `GoogleDirectoryAdapter` implementa a porta de saída para o Admin SDK.

### 1.4 Jobs de Sincronização

| Job | Frequência | Direção | Escopo |
|:---:|:----------:|:-------:|--------|
| `GoogleUserSyncJob` | Diária (02h00) | Google → SGTI | Todos os usuários do domínio |
| `GoogleGroupSyncJob` | Semanal (dom 03h00) | Google → SGTI | Grupos com label `sgti:managed=true` |
| `GoogleStatusSyncJob` | A cada 30 min | Google → SGTI | Contas suspensas/reativadas recentemente |
| `TokenValidationJob` | A cada 5 min | SGTI → Google | Valida sessões ativas vs. status Google |

### 1.5 Campos Sincronizados

| Campos atualizados pelo Google (Google → SGTI) | Campos gerenciados pelo SGTI (nunca sobrescritos) |
|:----------------------------------------------:|:-------------------------------------------------:|
| `display_name`, `avatar_url`, `job_title`, `google_org_unit`, `mfa_enabled` | `roles`, `locale`, `timezone`, `notifications_*`, `cost_center_id`, `manager_id`, `department_id` |

### 1.6 Resiliência

- **Circuit breaker:** 5 falhas consecutivas → breaker aberto por 15 min → IT_MANAGER notificado.
- **Retry:** backoff exponencial (30s, 2min, 10min, 30min) para operações falhadas.
- **Fallback:** operações do SGTI não bloqueadas por falha do Google Admin SDK.
- **Idempotência:** todas as operações de provisionamento são idempotentes.

---

## 2. GLPI

### 2.1 Visão Geral

O GLPI é o **sistema de registro patrimonial e de chamados legado**. O SGTI consome e complementa os dados do GLPI, sem substituí-lo como fonte oficial do inventário.

| Aspecto | GLPI | SGTI |
|---------|:----:|:----:|
| Inventário patrimonial oficial | ✅ Fonte primária | Espelho + complemento financeiro/operacional |
| Gestão de chamados (tickets) | Legado | ✅ Sistema principal |
| Dados financeiros dos ativos | — | ✅ CAPEX/OPEX, depreciação |
| Responsável / Responsabilidade | — | ✅ Fonte primária |

### 2.2 Sincronização GLPI ↔ SGTI

| Tipo | Frequência | Direção | Escopo |
|:----:|:----------:|:-------:|--------|
| Incremental | Diária (02h00) | GLPI → SGTI | Ativos criados/alterados nas últimas 24h |
| Completa | Semanal (dom 03h00) | GLPI → SGTI | Todo o inventário GLPI vs. SGTI |
| Manual | Sob demanda (IT_MANAGER+) | GLPI → SGTI | Escopo configurável |
| Push de ticket | Imediato (ao abrir incidente) | SGTI → GLPI | Tickets espelho |

### 2.3 Mapeamento de Campos

| Campo GLPI | Campo SGTI | Prioridade |
|:----------:|:----------:|:----------:|
| `itemtype` | `category` | GLPI |
| `name` | `name` | GLPI |
| `serial` | `serial_number` | GLPI |
| `otherserial` | `asset_tag` | GLPI |
| `entities_id` | `department_id` | GLPI (mapeamento configurável) |
| `locations_id` | `location` | GLPI |
| `manufacturers_id` | `manufacturer` | GLPI |

**Campos exclusivos SGTI** (nunca sobrescritos): `assignee_id`, `cost_center_id`, `purchase_value`, `current_value`, `classification`, `project_id`, `AssetAssignment`, `AssetMovement`.

### 2.4 Inconsistências

| Cenário | Tratamento |
|---------|-----------|
| Ativo no GLPI, ausente no SGTI | Criado automaticamente no SGTI |
| Ativo no SGTI, ausente no GLPI | `sync_status = CONFLICT`; Gestor notificado |
| Campos divergentes | GLPI prevalece para campos de identificação; SGTI prevalece para campos de negócio |
| E-mail do ticket diverge | Alerta ao IT_MANAGER; resolução manual |

### 2.5 Adapter GLPI

`GlpiTicketAdapter` encapsula chamadas à API REST do GLPI:
- `createTicket(incident)` → `glpi_ticket_id`
- `updateTicketStatus(glpi_id, status)`
- `addComment(glpi_id, comment)`
- `getAssets(query)` → `asset[]`
- Autenticação: `App-Token` + `Session-Token` (sessão iniciada por job)

---

## 3. Supabase

### 3.1 Visão Geral

O Supabase é a plataforma backend-as-a-service que provê banco de dados, autenticação, storage e edge functions para o SGTI.

| Serviço Supabase | Uso no SGTI |
|:----------------:|:------------|
| **PostgreSQL** | Banco de dados principal com todos os schemas do SGTI |
| **Row Level Security (RLS)** | Isolamento de tenants e controle de acesso por dado |
| **Auth** | Gerenciamento de sessões e refresh tokens (complementar ao JWT do SGTI) |
| **Storage** | Armazenamento de evidências, NFs, anexos e artigos KB |
| **Realtime** | Atualizações em tempo real para dashboards operacionais |
| **Edge Functions** | Processamento próximo ao usuário (validações rápidas, webhooks) |

### 3.2 Banco de Dados — Schemas

```
SCHEMAS DO SGTI
──────────────────────────────────────────────────────────────────
shared          → audit_log, notification, email_log, file_reference
auth            → User, UserRole, Role, Session, ApiKey
identity        → Identity, GoogleUserReference, IdentityGroup
ticket          → Ticket (incident/request), TicketComment, SLAHistory
asset           → Asset, AssetCategory, AssetAssignment, AssetMovement
catalog         → ServiceCatalog, SLAPolicy, SLAHistory
compliance      → Audit, ComplianceFinding, ComplianceEvidence, ComplianceActionPlan
finance         → OpexExpense, CapexInvestment, Budget, Contract, Supplier
purchase        → PurchaseRequest, PurchaseOrder, Quotation
project         → Project, ProjectTask, ProjectRisk, ChangeRequest
knowledge       → KnowledgeArticle, KnowledgeVersion
email_log       → EmailThread, EmailMessage
```

### 3.3 Row Level Security (RLS)

Todas as tabelas críticas têm RLS ativo. As políticas garantem:

| Política | Aplicação |
|:--------:|-----------|
| **Isolamento de Tenant** | Usuário X não visualiza dados do Tenant Y — `tenant_id = auth.uid()::text::uuid` |
| **Visibilidade por Papel** | END_USER vê apenas seus próprios chamados — validado pela claim `role` do JWT |
| **Audit Log INSERT-ONLY** | RLS bloqueia UPDATE e DELETE em `shared.audit_log` — garante imutabilidade |
| **Storage por Owner** | Arquivos acessíveis apenas pelo uploader ou por IT_MANAGER+ |

### 3.4 Supabase Realtime

Usado para atualizações em tempo real nos dashboards operacionais:
- Mudanças de status em incidentes e projetos.
- Atualizações de SLA em tempo real (badges de cor).
- Notificações in-app sem polling.
- Latência máxima: < 5 segundos para refletir mudanças.

### 3.5 Storage

| Bucket | Conteúdo | Acesso | Criptografia |
|:------:|---------|:------:|:------------:|
| `evidences` | Evidências de compliance | IT_TECHNICIAN+ (owner), URL presigned 15min | AES-256 |
| `attachments` | Anexos de chamados e requisições | Solicitante (próprios), IT_TECHNICIAN+ | AES-256 |
| `invoices` | Notas fiscais | FINANCIAL_ANALYST+, URL presigned 15min | AES-256 |
| `articles` | Imagens e anexos de artigos KB | PUBLISHED: todos autenticados; DRAFT: autor + revisor | AES-256 |

---

## 4. E-mail Corporativo

### 4.1 Visão Geral

O SGTI envia e recebe e-mails via conta corporativa `implantacao@pinpag.com.br` hospedada no Google Workspace. A integração permite abertura automática de chamados e atualização por resposta de e-mail.

### 4.2 Envio de Notificações (SGTI → E-mail)

**Infraestrutura:** SMTP do Google Workspace via biblioteca de envio do NestJS.

| Configuração | Valor |
|:------------:|-------|
| Remetente | `implantacao@pinpag.com.br` |
| Reply-To | `implantacao@pinpag.com.br` |
| Formato | HTML + texto plain (multipart) |
| Assunto padrão (incidentes) | `[INC-YYYY-NNNNNN] {título_do_chamado}` |
| Assunto padrão (requisições) | `[REQ-YYYY-NNNNNN] {título_da_requisição}` |

**Retry de envio:** 3 tentativas com backoff de 30s, 2min e 10min. Falha registrada em `email_log.EmailMessage` com status `FAILED`.

### 4.3 Recebimento e Processamento (E-mail → SGTI)

O processamento de e-mails recebidos é feito via webhook do Google Workspace (Gmail API push notifications):

```
FLUXO DE PROCESSAMENTO DE E-MAIL RECEBIDO

1. Gmail notifica SGTI via Pub/Sub webhook ao receber e-mail
2. EmailProcessingJob verifica:
   a. E-mail é resposta a thread existente? (In-Reply-To / References headers)
      → SIM: identifica chamado pelo padrão [INC-YYYY-NNNNNN] no assunto
             → Adiciona como TicketComment (source=EMAIL)
      → NÃO: e-mail é nova solicitação?
             → Verifica regras de criação automática de chamado
             → Se aplicável: cria Ticket novo com origem EMAIL
3. EmailMessage registrada em email_log com status PROCESSED ou IGNORED
```

### 4.4 Padrão de Thread de E-mail

Todos os e-mails de notificação de chamado incluem:
- **Message-ID:** `<{ticket_number}@sgti.empresa.com.br>`
- **In-Reply-To / References:** preservados em respostas para manter thread.
- **Subject:** `[INC-YYYY-NNNNNN] Título` — permite identificar chamado por assunto.

Respostas do usuário ao e-mail de notificação são automaticamente adicionadas como comentário no chamado.

---

## 5. API Corporativa de Identidades

### 5.1 Visão Geral

A API Corporativa de Identidades expõe operações de identidade do SGTI para sistemas internos da organização. Permite que sistemas de RH, ERP ou outros sistemas corporativos consultem e gerenciem identidades.

### 5.2 Autenticação da API Corporativa

| Mecanismo | Detalhes |
|:----------:|---------|
| **API Key** | Header: `Authorization: ApiKey {key}` |
| **Escopos** | `identity:read`, `identity:write`, `identity:deprovisioning`, `identity:webhooks` |
| **Emissão** | Apenas SUPER_ADMIN pode emitir API Keys |
| **Validade** | Máx. 1 ano; rotação anual automática |
| **IP Allowlist** | Opcional por API Key; recomendado para integrações críticas |
| **Rate Limiting** | 100 req/min por API Key (configurável) |

### 5.3 Principais Operações

| Endpoint | Método | Descrição | Escopo |
|:--------:|:------:|-----------|:------:|
| `/v1/identities/{email}` | GET | Status e papéis do usuário | `identity:read` |
| `/v1/identities/{email}/roles` | GET | Papéis atribuídos | `identity:read` |
| `/v1/identities/provision` | POST | Dispara provisionamento | `identity:write` |
| `/v1/identities/{email}/suspend` | POST | Suspende conta | `identity:write` |
| `/v1/identities/{email}/deprovision` | POST | Desprovisionamento completo | `identity:deprovisioning` |
| `/v1/webhooks` | POST | Registra webhook | `identity:webhooks` |

### 5.4 Webhooks de Identidade

Eventos disponíveis via webhook para sistemas integrados:

| Evento | Payload |
|:------:|---------|
| `user.provisioned` | `{user_id, email, display_name, roles, provisioned_at}` |
| `user.role_assigned` | `{user_id, email, role, assigned_by, assigned_at}` |
| `user.role_revoked` | `{user_id, email, role, revoked_by, revoked_at}` |
| `user.suspended` | `{user_id, email, suspended_by, suspended_at}` |
| `user.deprovisioned` | `{user_id, email, deprovisioned_by, deprovisioned_at}` |

---

## 6. Cloudflare

### 6.1 Papel do Cloudflare no SGTI

O Cloudflare atua como a primeira camada de segurança e desempenho na frente de toda a infraestrutura do SGTI.

```
Internet → [Cloudflare] → Vercel (Frontend Next.js)
                        → Vercel (Backend NestJS API)
```

### 6.2 DNS

- Todos os domínios e subdomínios do SGTI são gerenciados pelo Cloudflare.
- Registros DNS com proxy ativo (nuvem laranja) para ocultar IPs de origem.
- TTL configurado pelo Cloudflare automaticamente em modo proxy.
- Registro `TXT` para validação de domínio no Google Workspace e serviços externos.

### 6.3 CDN

- Assets estáticos do frontend (JS, CSS, imagens) servidos pela CDN do Cloudflare.
- Cache configurado por tipo de recurso: assets imutáveis (1 ano), HTML (no-cache), API (no-cache).
- Compressão Brotli/gzip automática.
- HTTP/2 e HTTP/3 habilitados.

### 6.4 WAF — Web Application Firewall

| Regra | Proteção |
|:-----:|---------|
| OWASP Core Rule Set | SQL Injection, XSS, Path Traversal |
| Rate Limiting | 100 req/min por IP em endpoints de autenticação; 1000 req/min em APIs gerais |
| Bot Fight Mode | Bloqueio de bots maliciosos automaticamente |
| IP Allowlist | Exclusões para IPs corporativos conhecidos |
| Custom Rules | Bloqueio de origens geográficas suspeitas (configurável) |

### 6.5 Segurança Adicional

- **HTTPS obrigatório:** redirect automático HTTP → HTTPS.
- **HSTS:** `Strict-Transport-Security: max-age=31536000; includeSubDomains`.
- **Headers de segurança:** `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` aplicados pelo Cloudflare.
- **CF-Connecting-IP:** IP real do cliente propagado para o backend via header.
- **CF-IPCountry:** País de origem propagado para logs de auditoria.

---

## 7. Vercel

### 7.1 Papel do Vercel no SGTI

O Vercel é a plataforma de deploy do frontend (Next.js) e do backend (NestJS via Vercel Serverless ou container).

### 7.2 Ambientes

| Ambiente | Branch | URL | Gatilho de Deploy |
|:--------:|:------:|-----|:------------------:|
| **Production** | `main` | `sgti.empresa.com.br` | Push para `main` (após PR aprovado) |
| **Preview** | Feature branches | `sgti-{branch}.vercel.app` | Abertura de Pull Request |
| **Staging** | `staging` | `sgti-staging.empresa.com.br` | Push para `staging` |

### 7.3 Variáveis de Ambiente e Segredos

| Categoria | Onde Armazenar | Exemplo |
|:----------:|:-------------:|---------|
| Chaves JWT (privada) | Vercel Secrets | `SGTI_JWT_PRIVATE_KEY` |
| Chaves JWT (pública) | Vercel Env | `SGTI_JWT_PUBLIC_KEY` |
| Supabase URL e Anon Key | Vercel Env | `SUPABASE_URL`, `SUPABASE_ANON_KEY` |
| Supabase Service Role Key | Vercel Secrets | `SUPABASE_SERVICE_ROLE_KEY` |
| Google OAuth credentials | Vercel Secrets | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| API Keys externas (GLPI) | Vercel Secrets | `GLPI_APP_TOKEN`, `GLPI_API_URL` |

**Regra:** Nenhum segredo é commitado no repositório GitHub. Todo segredo é injetado via variáveis de ambiente do Vercel.

---

## 8. GitHub

### 8.1 Estratégia de Branches

| Branch | Propósito | Proteções |
|:------:|-----------|:----------:|
| `main` | Produção | PR obrigatório; 2 aprovações; CI/CD passou; no force push |
| `staging` | Pré-produção para validação | PR obrigatório; 1 aprovação |
| `develop` | Integração de features | PR obrigatório; 1 aprovação |
| `feature/*` | Desenvolvimento de funcionalidade | Sem proteção; merge para develop |
| `hotfix/*` | Correções urgentes em produção | PR direto para `main` + backport |

### 8.2 GitHub Actions — Pipelines CI/CD

| Pipeline | Gatilho | Etapas |
|:--------:|:-------:|--------|
| **CI — Lint + Test** | Push em qualquer branch | Lint (ESLint/Prettier) → Testes unitários → Testes de integração → Coverage |
| **CD — Preview** | PR aberto para `develop` | Build → Deploy Vercel Preview → Comentário no PR com URL |
| **CD — Staging** | Merge para `staging` | Build → Deploy Staging → Smoke Tests |
| **CD — Production** | Merge para `main` | Build → Deploy Production → Smoke Tests → Rollback automático se falhar |
| **Security Scan** | Semanal (domingo) | Dependabot → npm audit → SAST (CodeQL) |

### 8.3 Pull Request Standards

- Template de PR obrigatório: descrição, tipo (feat/fix/chore), checklist, screenshots.
- Labels automaticamente aplicados por tipo de mudança.
- Comentários automáticos de coverage e Lighthouse score.
- Squash merge obrigatório para manter histórico limpo.

---

## 9. Arquitetura de Integração

### 9.1 Visão Geral da Arquitetura

```
ARQUITETURA DE INTEGRAÇÃO DO SGTI

  USUÁRIOS / SISTEMAS EXTERNOS
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE (Camada 0)                             │
│  DNS · CDN · WAF · DDoS Protection · Rate Limiting · TLS            │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
         ┌─────────────────────┴──────────────────────┐
         │                                            │
         ▼                                            ▼
┌──────────────────────┐               ┌──────────────────────────┐
│  VERCEL FRONTEND     │               │   VERCEL BACKEND          │
│  Next.js 14          │               │   NestJS (Node.js)        │
│  React Server Comps  │               │                           │
│  Next.js Middleware  │◄─────API──────┤  Guards (JWT + RBAC)     │
│  (Route Protection)  │               │  Controllers + Services   │
└──────────────────────┘               │  Domain (Use Cases)       │
                                       │  Repositories (Prisma)    │
                                       └────────────┬─────────────┘
                                                    │
        ┌──────────────────────────────────────────┴─────────────────────────┐
        │                                                                     │
        ▼                                                                     ▼
┌────────────────────┐                                           ┌──────────────────────┐
│   SUPABASE         │                                           │  INTEGRAÇÕES EXTERNAS │
│   PostgreSQL + RLS │                                           │                       │
│   Auth (Sessions)  │                                           │  Google Workspace     │
│   Storage (Files)  │                                           │  GLPI (REST API)      │
│   Realtime         │                                           │  Email SMTP/IMAP      │
└────────────────────┘                                           │  GitHub API           │
                                                                 └──────────────────────┘
```

### 9.2 Camadas da Arquitetura

```
CLEAN ARCHITECTURE — CAMADAS

┌─────────────────────────────────────────────────┐
│            INTERFACE (NestJS Controllers)        │
│  REST endpoints · WebSocket · Scheduled Jobs     │
├─────────────────────────────────────────────────┤
│        APPLICATION (Use Cases / Services)        │
│  Orchestração de negócio · Validação de alçada   │
│  Publicação de eventos · Coordenação de adapters │
├─────────────────────────────────────────────────┤
│            DOMAIN (Entities + Ports)             │
│  Regras de negócio · Invariantes · Value Objects │
│  Definição de interfaces (Ports) para adapters   │
├─────────────────────────────────────────────────┤
│     INFRASTRUCTURE (Adapters + Repositories)     │
│  Prisma (DB) · GoogleDirectory · GlpiTicket      │
│  SupabaseStorage · EmailSender · EventBus        │
└─────────────────────────────────────────────────┘
```

### 9.3 Comunicação entre Módulos

Módulos internos do SGTI se comunicam exclusivamente via **EventBus** (EventEmitter2 interno):

```
PADRÃO DE COMUNICAÇÃO ENTRE BOUNDED CONTEXTS

├── IncidentModule publica: IncidentResolved
│       └── KnowledgeModule consome: cria DRAFT_AI
│       └── SLAModule consome: registra SLAHistory

├── ProblemModule publica: WorkaroundPublished
│       └── KnowledgeModule consome: cria DRAFT_AI
│       └── IncidentModule consome: exibe banner KEDB

├── AssetModule publica: AssetDecommissioned
│       └── FinancialModule consome: baixa patrimonial

├── ProjectModule publica: ProjectCancelled
│       └── FinancialModule consome: libera reserva orçamentária
```

---

## 10. REST APIs — Padrões

### 10.1 Padrões de URL

| Padrão | Exemplo | Uso |
|:------:|---------|-----|
| Plural para recursos | `/v1/incidents` | Lista de incidentes |
| ID na URL | `/v1/incidents/{id}` | Recurso específico |
| Sub-recursos aninhados | `/v1/incidents/{id}/comments` | Relacionamentos |
| Ações com verbo | `/v1/incidents/{id}/resolve` | Operações de estado |
| Versioning na URL | `/v1/`, `/v2/` | Versionamento |

### 10.2 HTTP Methods e Semântica

| Método | Uso | Idempotente | Body |
|:------:|-----|:-----------:|:----:|
| GET | Leitura | ✅ | Não |
| POST | Criação | ❌ | Sim |
| PUT | Substituição completa | ✅ | Sim |
| PATCH | Atualização parcial | ❌ | Sim |
| DELETE | Remoção (soft-delete) | ✅ | Não |

### 10.3 Padrões de Resposta

**Sucesso:**
```
GET /v1/incidents/123
HTTP 200 OK
{
  "data": { "id": "...", "number": "INC-2026-000042", ... },
  "meta": { "version": "1.0", "timestamp": "2026-06-09T10:00:00Z" }
}

POST /v1/incidents
HTTP 201 Created
Location: /v1/incidents/uuid-gerado
{ "data": { ... } }
```

**Erro:**
```
HTTP 422 Unprocessable Entity
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Classifique o custo como OPEX ou CAPEX.",
    "details": [{ "field": "classification", "message": "required" }]
  }
}
```

### 10.4 Códigos HTTP Utilizados

| Código | Semântica | Uso no SGTI |
|:------:|-----------|-------------|
| 200 | OK | GET, PATCH, DELETE bem-sucedidos |
| 201 | Created | POST que criou recurso |
| 204 | No Content | DELETE sem body de retorno |
| 400 | Bad Request | Dados inválidos (JSON malformado, campos faltando) |
| 401 | Unauthorized | Token ausente, expirado ou inválido |
| 403 | Forbidden | Autenticado mas sem permissão para o recurso |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Conflito: CNPJ duplicado, asset_tag já existente |
| 422 | Unprocessable Entity | Dados válidos mas regra de negócio violada |
| 429 | Too Many Requests | Rate limit atingido |
| 500 | Internal Server Error | Erro inesperado do servidor |
| 503 | Service Unavailable | Circuit breaker aberto para sistema externo |

### 10.5 Paginação

```
GET /v1/incidents?page=2&limit=25&sort=created_at&order=desc

Resposta:
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 25,
    "total": 342,
    "total_pages": 14,
    "has_next": true,
    "has_prev": true
  }
}
```

### 10.6 Filtros e Busca

```
GET /v1/incidents?status=OPEN&priority=CRITICAL&created_after=2026-06-01
GET /v1/knowledge?q=vpn+certificado&category=INCIDENT&audience=TECHNICAL
```

---

## 11. Webhooks — Padrões

### 11.1 Webhook de Saída (SGTI → Sistema Externo)

O SGTI envia webhooks para sistemas externos cadastrados na API de Identidades.

**Estrutura do payload:**
```json
{
  "event": "user.deprovisioned",
  "timestamp": "2026-06-09T14:30:00Z",
  "sgti_version": "1.0",
  "delivery_id": "uuid-desta-entrega",
  "data": {
    "user_id": "uuid-do-usuário",
    "email": "joao.silva@empresa.com.br",
    "deprovisioned_by": "uuid-do-gestor",
    "deprovisioned_at": "2026-06-09T14:30:00Z"
  }
}
```

**Assinatura HMAC:** Todo webhook inclui o header `X-SGTI-Signature: sha256={hash}`. O destinatário deve validar a assinatura usando a chave secreta compartilhada.

**Retry com backoff exponencial:**
```
Tentativa 1: imediata
Tentativa 2: +30 segundos
Tentativa 3: +5 minutos
Tentativa 4: +30 minutos
Tentativa 5: +4 horas
Tentativa 6: +24 horas
→ Após 6 falhas: webhook desativado + notificação ao SUPER_ADMIN
```

### 11.2 Webhook de Entrada (Sistema Externo → SGTI)

O SGTI aceita webhooks de sistemas externos cadastrados:

| Sistema | Webhook | Processamento |
|:-------:|---------|:-------------:|
| Gmail (Pub/Sub) | Novos e-mails recebidos | `EmailProcessingJob` |
| GitHub | Pull Requests e pushes | Log de auditoria de deploys |
| GLPI (futuro) | Atualizações de ativos | `GlpiEventProcessor` |

**Validação:** Todo webhook de entrada tem endpoint com validação de assinatura. Payloads sem assinatura válida retornam 401 e são registrados em auditoria.

---

## 12. Arquitetura Orientada a Eventos

### 12.1 EventBus Interno (EventEmitter2)

O SGTI utiliza um EventBus interno baseado em EventEmitter2 para comunicação entre bounded contexts sem acoplamento direto.

```
PADRÃO DE EVENTO DE DOMÍNIO

Nome: PascalCase + sufixo descritivo
  IncidentResolved
  WorkaroundPublished
  AssetDecommissioned
  ProjectCancelled
  UserDeprovisioned
  SlaBreached
  BudgetExceeded

Payload: objeto tipado com os dados necessários para os consumidores
Publisher: módulo que origina o evento (não conhece os consumidores)
Consumers: qualquer número de handlers registrados no módulo consumidor
```

### 12.2 Catálogo de Eventos de Domínio

| Evento | Publisher | Consumers | Descrição |
|:------:|:---------:|:---------:|-----------|
| `IncidentResolved` | IncidentModule | KnowledgeModule, SLAModule | Incidente resolvido |
| `IncidentReopened` | IncidentModule | SLAModule | Incidente reaberto |
| `SlaBreached` | SLAModule | NotificationModule, DashboardModule | SLA violado |
| `SlaAtRisk` | SLAModule | NotificationModule | SLA > 80% consumido |
| `WorkaroundPublished` | ProblemModule | KnowledgeModule, IncidentModule | Workaround publicado |
| `ProblemResolved` | ProblemModule | IncidentModule, KnowledgeModule | Problema resolvido |
| `UserProvisioned` | IdentityModule | NotificationModule, AuditModule | Usuário criado |
| `UserDeprovisioned` | IdentityModule | AssetModule, TicketModule, NotificationModule | Usuário desligado |
| `AssetDecommissioned` | AssetModule | FinancialModule | Ativo descomissionado |
| `ProjectCancelled` | ProjectModule | FinancialModule, NotificationModule | Projeto cancelado |
| `ProjectClosed` | ProjectModule | KnowledgeModule, FinancialModule | Projeto encerrado |
| `BudgetExceeded` | FinancialModule | NotificationModule | Orçamento excedido |
| `ContractExpiring` | FinancialModule | NotificationModule | Contrato vencendo |
| `ItemReceived` | PurchaseModule | FinancialModule, AssetModule | Compra recebida |
| `LicenseUtilizationLow` | AssetModule | FinancialModule, PurchaseModule | Licença subutilizada |

### 12.3 Garantias de Entrega

No EventBus interno (EventEmitter2):
- **Fire-and-forget:** publisher não aguarda resposta dos consumers.
- **Sem garantia de entrega:** se o processo cair durante o processamento, o evento é perdido.
- **Compensação:** operações críticas têm retry via jobs periódicos (ex.: `SlaMonitoringJob` recalcula periodicamente).

Para integrações externas assíncronas (webhooks, GLPI), a entrega é garantida via fila persistente com retry exponencial.

---

## 13. Segurança nas Integrações

### 13.1 OAuth 2.0 com PKCE

Usado para autenticação de usuários humanos via Google Workspace:

```
PKCE FLOW SUMMARY
1. code_verifier = random(32 bytes)
2. code_challenge = BASE64URL(SHA-256(code_verifier))
3. Enviar code_challenge ao Authorization Server (Google)
4. Receber authorization_code
5. Trocar code + code_verifier por tokens
6. Validar id_token: assinatura + hd + exp + aud
```

**Proteção contra:** Authorization Code Interception Attack.

### 13.2 JWT RS256

Tokens emitidos pelo SGTI para comunicação stateless:

```
JWT PAYLOAD (Claims)
{
  "sub": "uuid-do-usuário",
  "tenant_id": "uuid-do-tenant",
  "email": "user@empresa.com.br",
  "roles": ["IT_TECHNICIAN"],
  "iat": 1749474000,
  "exp": 1749477600,   ← 1 hora
  "iss": "sgti-backend",
  "aud": "sgti-frontend"
}

ASSINATURA: RS256 com chave privada de 4096 bits
ARMAZENAMENTO: SGTI_JWT_PRIVATE_KEY → Vercel Secret
ROTAÇÃO: semestral + imediata em caso de comprometimento
```

### 13.3 API Keys

Para integrações máquina-a-máquina (sem usuário humano):

```
API KEY STRUCTURE
Prefixo identificador + separador + secret aleatório
  sgti_live_{48 chars aleatórios}
  sgti_test_{48 chars aleatórios}

Header: Authorization: ApiKey sgti_live_{...}

Armazenamento no banco: apenas SHA-256(api_key) — nunca em texto plano
Exibição: apenas no momento da criação; não recuperável depois
```

### 13.4 Service Accounts (Google)

A Service Account do Google Admin SDK:
- Não tem sessão humana — autenticação via JWT assinado com chave privada da SA.
- Permissões limitadas aos escopos necessários (princípio do menor privilégio).
- Chave da SA armazenada como Vercel Secret.
- Rotação semestral da chave.

### 13.5 Segredos e Rotação

| Segredo | Armazenamento | Rotação |
|:-------:|:-------------:|:-------:|
| JWT Private Key (RS256) | Vercel Secret | Semestral |
| Supabase Service Role Key | Vercel Secret | Anual |
| Google Client Secret (OAuth) | Vercel Secret | Anual |
| Google Service Account Key | Vercel Secret | Semestral |
| GLPI App-Token | Vercel Secret | Anual |
| API Keys emitidas | Hash SHA-256 no banco | 1 ano (expiração automática) |

### 13.6 Headers de Segurança

Aplicados pelo Cloudflare e pelo Next.js Middleware:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; ...
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## 14. Logs e Rastreabilidade

### 14.1 Correlação de Requisições

Toda requisição recebe um identificador único de correlação:

```
Request-ID: uuid gerado no Cloudflare (header CF-Ray) ou pelo Next.js Middleware
X-Correlation-ID: propagado do frontend para o backend

Presente em:
  → Logs estruturados do NestJS
  → Registros de audit_log
  → Notificações por e-mail (header X-SGTI-Correlation-ID)
  → Respostas de erro da API (campo "correlation_id" no body)
```

### 14.2 Estrutura do Log Estruturado

Todo log do backend segue formato JSON estruturado:

```json
{
  "timestamp": "2026-06-09T14:30:00.123Z",
  "level": "info",
  "service": "sgti-backend",
  "module": "IncidentModule",
  "action": "incident.resolved",
  "correlation_id": "uuid-da-requisicao",
  "user_id": "uuid-do-usuario",
  "tenant_id": "uuid-do-tenant",
  "duration_ms": 142,
  "message": "Incident INC-2026-000042 resolved",
  "metadata": {
    "incident_id": "uuid",
    "resolution_notes_length": 87
  }
}
```

### 14.3 Níveis de Log

| Nível | Uso |
|:-----:|-----|
| `ERROR` | Erros não esperados; exceções não tratadas; falhas de integração |
| `WARN` | Situações anômalas mas recuperáveis; degradação de serviço |
| `INFO` | Operações bem-sucedidas; mudanças de estado; eventos de negócio |
| `DEBUG` | Informações detalhadas de diagnóstico (somente ambiente não-prod) |

### 14.4 Retenção de Logs

| Tipo de Log | Retenção | Armazenamento |
|:-----------:|:--------:|:-------------:|
| Logs de aplicação | 30 dias | Vercel Log Draining → serviço externo |
| Audit Log (shared.audit_log) | Indefinida | Supabase PostgreSQL |
| Email Log | 90 dias | Supabase PostgreSQL |
| Logs de acesso (sessões) | 2 anos | Supabase PostgreSQL |
| Logs de erro | 90 dias | Vercel + serviço externo |

---

## 15. Auditoria — Trilhas Obrigatórias

### 15.1 Tabela shared.audit_log

```
ESTRUTURA DO AUDIT LOG

id              UUID        Identificador único
tenant_id       UUID        Tenant da operação
user_id         UUID        Usuário que executou (null = sistema)
action          VARCHAR     Ação realizada: CREATE, UPDATE, DELETE, LOGIN, EXPORT
resource_type   VARCHAR     Entidade: "Ticket", "Asset", "User", "KnowledgeArticle"
resource_id     UUID        ID do recurso
old_values      JSONB       Estado anterior (null para CREATE)
new_values      JSONB       Novo estado (null para DELETE)
ip_address      INET        IP do cliente (via CF-Connecting-IP)
country_code    CHAR(2)     País (via CF-IPCountry)
user_agent      TEXT        Browser/client
correlation_id  UUID        Correlação com log de aplicação
extra_metadata  JSONB       Dados contextuais adicionais
created_at      TIMESTAMPTZ Timestamp UTC (DEFAULT NOW())
```

**RLS: INSERT-ONLY.** Nenhum UPDATE ou DELETE possível.

### 15.2 Eventos que Exigem Registro Obrigatório

| Categoria | Eventos |
|:---------:|---------|
| **Autenticação** | Login, logout, falha de login, bloqueio de conta, revogação de sessão |
| **Identidades** | Criação, atualização, suspensão, desprovisionamento, atribuição/revogação de papel |
| **Chamados** | Criação, mudança de status, escalonamento, resolução, reabertura |
| **Ativos** | Criação, movimentação, entrega (com aceite), devolução, descomissionamento |
| **Financeiro** | Criação de lançamento, aprovação, rejeição, estorno |
| **Compliance** | Criação de apontamento, aprovação de evidência, exportação de pacote |
| **API Keys** | Emissão, uso (amostragem), revogação |
| **Exportações** | Toda exportação de dados sensíveis |
| **Configurações** | Alterações de configuração de sistema por SUPER_ADMIN |

---

## 16. Tratamento de Falhas

### 16.1 Retry com Backoff Exponencial

Padrão aplicado a todas as chamadas para sistemas externos:

```
CONFIGURAÇÃO PADRÃO DE RETRY

max_attempts: 5
initial_delay: 30s
multiplier: 4
max_delay: 30min
jitter: ±10% (evita thundering herd)

Tentativas:
  1ª: imediata
  2ª: 30s
  3ª: 2min
  4ª: 8min
  5ª: 30min
  → Após 5 falhas: dead letter + alerta ao IT_MANAGER
```

**Erros retryáveis:** 429 (rate limit), 500, 502, 503, 504, timeout de rede.
**Erros não-retryáveis:** 400, 401, 403, 404, 422 (erros da lógica de negócio).

### 16.2 Timeout por Integração

| Sistema | Timeout por Operação | Timeout Total (com retries) |
|:-------:|:-------------------:|:---------------------------:|
| Google Admin SDK | 5 segundos | 30 segundos |
| GLPI REST API | 10 segundos | 60 segundos |
| Supabase DB | 30 segundos | — |
| Email SMTP | 15 segundos | 60 segundos |
| Webhooks saída | 10 segundos | — |

### 16.3 Circuit Breaker

Aplicado para sistemas externos críticos (Google Workspace, GLPI):

```
ESTADOS DO CIRCUIT BREAKER

CLOSED (normal):
  → Chamadas executam normalmente
  → Contador de falhas monitorado

OPEN (degradado):
  → Falhas consecutivas > threshold (padrão: 5)
  → Chamadas bloqueadas imediatamente (fail-fast)
  → Duração: 15 minutos
  → IT_MANAGER notificado
  → SGTI continua operando (operações de integração enfileiradas)

HALF-OPEN (testando recuperação):
  → Após 15 minutos, 1 chamada de teste permitida
  → Sucesso → CLOSED
  → Falha → OPEN por mais 15 minutos
```

### 16.4 Dead Letter Queue (Fila de Mensagens Mortas)

Operações que esgotaram todas as tentativas de retry são movidas para a Dead Letter Queue:

- Armazenadas em tabela `shared.dead_letter_queue` com payload completo.
- IT_MANAGER notificado imediatamente.
- Podem ser reprocessadas manualmente pelo SUPER_ADMIN após resolução do problema.
- Retidas por 7 dias antes de expiração.

### 16.5 Degradação Graciosa

O SGTI foi projetado para continuar funcionando mesmo quando sistemas externos falham:

| Sistema Externo Falhando | Impacto no SGTI | Mitigação |
|:------------------------:|:---------------:|:---------:|
| Google Admin SDK | Provisionamento em fila de retry | Usuário fica em PENDING_PROVISIONING |
| GLPI | Sync em fila; chamados continuam abertos | Dados de ativo temporariamente sem sync |
| Email SMTP | Notificações em fila de retry | Notificações in-app continuam funcionando |
| Supabase Realtime | Dashboard sem atualização ao vivo | Fallback para polling a cada 30 segundos |

---

## 17. Observabilidade

### 17.1 Os Três Pilares da Observabilidade

| Pilar | Ferramenta | Uso |
|:-----:|:----------:|-----|
| **Logs** | Vercel Logs + Supabase (audit_log) | Diagnóstico de problemas; rastreabilidade |
| **Métricas** | Vercel Analytics + Cloudflare Analytics | Performance, disponibilidade, uso |
| **Traces** | Correlation IDs (implementação manual) | Rastreamento de requisição fim-a-fim |

### 17.2 Métricas de Aplicação Monitoradas

| Métrica | Alerta | Threshold |
|:-------:|:------:|:---------:|
| **Latência de API** (p95) | IT_MANAGER | > 2 segundos |
| **Taxa de erros 5xx** | IT_MANAGER | > 1% das requisições |
| **Disponibilidade** | IT_MANAGER | < 99,5% em qualquer janela de 1 hora |
| **Circuit Breaker aberto** | IT_MANAGER | Imediato ao abrir |
| **Jobs falhando** | IT_MANAGER | > 3 falhas consecutivas |
| **Dead Letter Queue** | IT_MANAGER | Qualquer entrada nova |
| **Sync GLPI desatualizada** | IT_MANAGER | Última sync > 26 horas |
| **Sync Google desatualizada** | IT_MANAGER | Última sync > 26 horas |

### 17.3 Health Check Endpoints

O backend expõe endpoints de health check para monitoramento externo:

| Endpoint | Verificação | Frequência Recomendada |
|:--------:|-------------|:----------------------:|
| `GET /health` | Status geral do serviço | A cada 30 segundos |
| `GET /health/db` | Conectividade Supabase | A cada 1 minuto |
| `GET /health/google` | Conectividade Google Admin SDK | A cada 5 minutos |
| `GET /health/glpi` | Conectividade GLPI | A cada 5 minutos |
| `GET /health/email` | Conectividade SMTP | A cada 5 minutos |

**Formato da resposta:**
```json
{
  "status": "healthy",
  "timestamp": "2026-06-09T14:30:00Z",
  "services": {
    "database": { "status": "up", "latency_ms": 12 },
    "google_workspace": { "status": "up", "circuit_breaker": "closed" },
    "glpi": { "status": "degraded", "circuit_breaker": "half-open", "message": "Recovering" },
    "email": { "status": "up" }
  }
}
```

### 17.4 Alertas Operacionais

Alertas enviados ao IT_MANAGER via notificação in-app e e-mail:

| Evento | Urgência |
|:------:|:--------:|
| Disponibilidade < 99,5% | 🔴 Crítico |
| Circuit breaker aberto | 🔴 Crítico |
| Dead Letter Queue com entradas | 🟠 Alto |
| Taxa de erros 5xx > 1% | 🟠 Alto |
| Sync GLPI > 26h desatualizada | 🟡 Médio |
| Job falhando (3+ vezes) | 🟡 Médio |
| Latência API p95 > 2s | 🟡 Médio |

---

## 18. Dashboards de Integração

### 18.1 Painel Operacional de Integrações

**Destino:** IT_MANAGER, SUPER_ADMIN.

| Componente | Dados Exibidos |
|------------|---------------|
| **Status dos Sistemas Externos** | Google, GLPI, Email — status atual e última sync |
| **Circuit Breakers** | Estado atual (CLOSED/OPEN/HALF-OPEN) por sistema |
| **Jobs Agendados** | Último status de execução de cada job com data/hora |
| **Dead Letter Queue** | Contagem de mensagens mortas por sistema |
| **Taxa de Erros de API** | Erros 4xx e 5xx por endpoint nas últimas 24h |
| **Latência de API** | p50, p95 e p99 por endpoint |
| **Webhooks Saída** | Taxa de entrega bem-sucedida vs. falhada |
| **Sincronizações Pendentes** | Itens aguardando sync no GLPI e Google |

### 18.2 Indicadores de Integração

| KPI | Fórmula | Meta |
|-----|---------|:----:|
| **Disponibilidade da API** | Uptime / Total × 100 | ≥ 99,5% |
| **Taxa de Sync Bem-Sucedida** | Syncs OK / Total syncs × 100 | ≥ 99% |
| **Taxa de Webhook Entregue** | Entregas OK / Total webhooks × 100 | ≥ 98% |
| **DLQ acumulada** | COUNT(dead_letter_queue) | 0 |
| **Latência média de API** | AVG(response_time) em ms | ≤ 500ms |
| **Circuit Breakers abertos** | COUNT(state = OPEN) | 0 |

---

## 19. Relatórios

### 19.1 Relatórios Operacionais Automáticos

| Relatório | Geração | Destinatário | Conteúdo |
|-----------|:-------:|:------------:|---------|
| **Status Diário de Integrações** | Diária (07h) | IT_MANAGER | Syncs das últimas 24h, falhas, DLQ |
| **Jobs com Falha** | Imediato (ao falhar 3x) | IT_MANAGER | Job, erro, tentativas, payload |
| **Webhooks Falhando** | Diária | SUPER_ADMIN | Webhooks com alta taxa de falha |

### 19.2 Relatórios Gerenciais

| Relatório | Frequência | Destinatário | Conteúdo |
|-----------|:----------:|:------------:|---------|
| **Performance de Integrações** | Mensal | IT_MANAGER | Latência, disponibilidade, erros por sistema |
| **Auditoria de API Keys** | Trimestral | IT_MANAGER + Compliance | Keys ativas, última utilização, escopo |

---

## 20. Regras de Negócio

---

**INT-001** — Toda autenticação de usuário humano via Google OAuth 2.0
Nenhuma senha local é armazenada. Autenticação exclusivamente via Google OAuth 2.0 com PKCE. Contas de domínio não-corporativo são rejeitadas.

---

**INT-002** — JWT RS256 com expiração de 1 hora
Tokens JWT emitidos pelo SGTI têm expiração de 1 hora (3600s). Refresh token válido por 30 dias. Papéis verificados no refresh.

---

**INT-003** — Nenhum segredo commitado no repositório GitHub
Toda credencial, API Key e chave privada é armazenada exclusivamente como Vercel Secret ou variável de ambiente. Commits com segredos detectados por scanner automático bloqueiam o PR.

---

**INT-004** — GLPI é fonte de autoridade para campos de identificação de ativos
Para campos sincronizados (nome, serial, modelo, categoria), o GLPI prevalece em caso de conflito com SGTI. Campos de negócio (responsável, financeiro, CC) são exclusivos do SGTI.

---

**INT-005** — Falha em sistema externo não bloqueia operações do SGTI
O SGTI opera em modo degradado quando sistemas externos estão indisponíveis. Operações de integração são enfileiradas para retry assíncrono.

---

**INT-006** — Circuit breaker ativado após 5 falhas consecutivas
Qualquer sistema externo com 5 falhas consecutivas tem circuit breaker ativado por 15 minutos. IT_MANAGER notificado imediatamente.

---

**INT-007** — Retry com backoff exponencial para falhas transientes
Erros 429, 5xx e timeouts de rede são retentados com backoff exponencial (30s, 2min, 8min, 30min). Erros 4xx não são retentados.

---

**INT-008** — Dead Letter Queue notificada imediatamente ao IT_MANAGER
Qualquer operação que esgotar todas as tentativas de retry é movida para a DLQ e IT_MANAGER notificado imediatamente via e-mail urgente.

---

**INT-009** — Webhook de saída assinado com HMAC SHA-256
Todo webhook enviado pelo SGTI inclui header `X-SGTI-Signature: sha256={hash}`. Destinos devem validar a assinatura.

---

**INT-010** — Webhook com 6 falhas consecutivas: desativado automaticamente
Webhook de saída que falha em 6 tentativas consecutivas é desativado automaticamente. SUPER_ADMIN notificado para investigação.

---

**INT-011** — API Keys armazenadas apenas como hash SHA-256
O valor original da API Key é exibido apenas no momento da criação. Após isso, apenas o hash SHA-256 é armazenado. Chaves perdidas devem ser revogadas e recriadas.

---

**INT-012** — API Keys com expiração máxima de 1 ano
Toda API Key tem validade máxima de 12 meses. SUPER_ADMIN notificado 30 dias antes da expiração para renovação ou revogação.

---

**INT-013** — Rate limiting por API Key: 100 req/min (padrão)
O Cloudflare aplica rate limiting de 100 requisições por minuto por API Key em endpoints de integração. Limite configurável por key.

---

**INT-014** — Correlação de requisições obrigatória via Correlation-ID
Toda requisição ao backend gera e propaga um `correlation_id` UUID. Presente em logs, auditoria e respostas de erro.

---

**INT-015** — Logs estruturados em JSON obrigatórios
Toda emissão de log do backend segue formato JSON estruturado com campos obrigatórios: `timestamp`, `level`, `service`, `module`, `correlation_id`, `user_id`, `tenant_id`.

---

**INT-016** — Audit log INSERT-ONLY via RLS
A tabela `shared.audit_log` tem RLS configurada para bloquear UPDATE e DELETE. Imutabilidade garantida no nível do banco de dados.

---

**INT-017** — E-mail de notificação enviado de implantacao@pinpag.com.br
Todos os e-mails de notificação do SGTI são enviados a partir do endereço `implantacao@pinpag.com.br`. Não é possível configurar outro remetente sem alteração de infraestrutura.

---

**INT-018** — Resposta de e-mail vinculada ao chamado pelo assunto
Respostas a e-mails de notificação do SGTI são identificadas pelo padrão `[INC-YYYY-NNNNNN]` no assunto e adicionadas como comentário no chamado correspondente.

---

**INT-019** — Campos de segurança do cabeçalho HTTP obrigatórios em produção
Os headers `HSTS`, `X-Frame-Options`, `X-Content-Type-Options` e `CSP` são obrigatórios em produção. Violação detectada em pipeline de CI bloqueia o deploy.

---

**INT-020** — Deploy em produção via PR com 2 aprovações
Nenhum código é deployado diretamente em produção. Todo merge para `main` exige PR com 2 aprovações, CI verde e aprovação do Vercel preview.

---

**INT-021** — Sincronização Google incremental diariamente às 02h00
O `GoogleUserSyncJob` executa diariamente às 02h00. Falha gera alerta ao IT_MANAGER. Dados do SGTI não ficam com sync acima de 26 horas sem alerta.

---

**INT-022** — Sincronização GLPI incremental diariamente às 02h00
O `GlpiAssetSyncJob` executa diariamente às 02h00. Regras de resiliência idênticas à sync do Google.

---

**INT-023** — Service Account do Google: rotação semestral de chave
A chave privada da Service Account do Google Admin SDK é rotacionada semestralmente. Rotação de emergência deve ser realizada em até 4 horas ao detectar comprometimento.

---

**INT-024** — Provisionamento Google com retry automático após falha
Se a criação de conta Google falhar, o usuário fica em `PENDING_PROVISIONING` e o job tenta novamente a cada 30 minutos por até 3 horas. Após isso, IT_MANAGER notificado.

---

**INT-025** — Webhooks de entrada validam assinatura antes de processar
Todo webhook recebido por endpoint do SGTI (Gmail Pub/Sub, GitHub) tem a assinatura validada antes de qualquer processamento. Payloads sem assinatura válida retornam 401 e são logados.

---

**INT-026** — HTTPS obrigatório em todos os endpoints
O Cloudflare redireciona todo tráfego HTTP para HTTPS. Nenhum endpoint do SGTI aceita conexões não criptografadas.

---

**INT-027** — Timeout de 5 segundos para Google Admin SDK
Chamadas ao Google Admin SDK têm timeout de 5 segundos por operação. Ultrapassado: erro registrado + retry iniciado.

---

**INT-028** — Timeout de 10 segundos para GLPI REST API
Chamadas à API REST do GLPI têm timeout de 10 segundos. Comportamento de retry idêntico ao padrão.

---

**INT-029** — GLPI App-Token rotacionado anualmente
O `GLPI_APP_TOKEN` é rotacionado anualmente. SUPER_ADMIN notificado 30 dias antes para coordenar com a equipe do GLPI.

---

**INT-030** — Health check endpoints sem autenticação
Os endpoints `/health`, `/health/db`, `/health/google`, `/health/glpi` são acessíveis sem autenticação para permitir monitoramento externo. Retornam apenas status sem dados sensíveis.

---

**INT-031** — Deploy com falha em smoke tests: rollback automático
Se os smoke tests pós-deploy falharem, o Vercel reverte automaticamente para a versão anterior. IT_MANAGER notificado.

---

**INT-032** — Variáveis de ambiente por ambiente (prod/staging/preview)
Cada ambiente Vercel tem seu conjunto isolado de variáveis de ambiente. Banco de dados de produção não é acessível a partir de ambientes de staging ou preview.

---

**INT-033** — Branch `main` protegida: no force push
A branch `main` tem proteção de force push habilitada no GitHub. Nenhum histórico de produção pode ser reescrito.

---

**INT-034** — Dependências auditadas semanalmente
O Dependabot e `npm audit` executam semanalmente. Vulnerabilidades críticas bloqueiam o pipeline de CI automaticamente até resolução.

---

**INT-035** — IP do usuário capturado via Cloudflare CF-Connecting-IP
O IP real do cliente é capturado via header `CF-Connecting-IP` do Cloudflare (nunca confiando no IP direto da requisição, que seria o Cloudflare). Armazenado em logs de sessão e audit_log.

---

**INT-036** — País de origem capturado via CF-IPCountry
O país de origem de cada acesso é capturado via header `CF-IPCountry` e registrado nos logs de sessão para análise de anomalias geográficas.

---

**INT-037** — Supabase Realtime com latência máxima de 5 segundos
Atualizações de status em incidentes, projetos e ativos devem refletir no dashboard em no máximo 5 segundos via Supabase Realtime. Fallback automático para polling em caso de falha.

---

**INT-038** — Escopo mínimo para API Keys corporativas
API Keys emitidas para integrações corporativas devem ter o escopo mínimo necessário. SUPER_ADMIN não pode emitir key com escopo `identity:deprovisioning` para integrações que só precisam de leitura.

---

**INT-039** — Email thread identificado por Message-ID e References headers
A correspondência entre e-mails recebidos e chamados SGTI é feita via headers MIME `Message-ID`, `In-Reply-To` e `References`. Fallback: extração do número do chamado no assunto.

---

**INT-040** — GitHub Actions: secrets não expostos em logs
O pipeline de CI/CD tem validação automática para evitar que secrets sejam impressos em logs. Pull Requests de repositórios fork não têm acesso a secrets de produção.

---

**INT-041** — Paginação obrigatória para listas com potencial de crescimento ilimitado
Endpoints que retornam coleções de dados (incidentes, ativos, usuários) implementam paginação obrigatória. `limit` padrão: 25. Máximo: 100.

---

**INT-042** — Respostas de erro com correlation_id para diagnóstico
Toda resposta de erro 4xx e 5xx inclui o `correlation_id` da requisição, permitindo rastrear o erro no log de aplicação.

---

**INT-043** — Idempotência em operações de provisionamento
As operações de criação de usuário no Google (`users.insert`) são idempotentes: se o usuário já existe com o mesmo e-mail, a operação retorna sucesso sem duplicar.

---

**INT-044** — Dados pessoais em logs: pseudonimização obrigatória
Logs de aplicação nunca contêm nome completo, e-mail ou CPF em texto claro. Apenas `user_id` (UUID pseudônimo) é registrado. Conformidade LGPD.

---

**INT-045** — Versioning de API: `/v1/` obrigatório em todos os endpoints
Todos os endpoints da API do SGTI incluem o prefixo de versão `/v1/`. Breaking changes exigem nova versão `/v2/` com período de deprecação de 6 meses.

---

**INT-046** — WAF do Cloudflare: OWASP Core Rule Set habilitado
As regras OWASP Core Rule Set estão habilitadas no WAF do Cloudflare em modo BLOCK (não apenas LOG) para proteção contra SQL Injection, XSS e Path Traversal.

---

**INT-047** — Monitoramento de disponibilidade externo ao SGTI
O endpoint `/health` é monitorado por serviço externo independente (Cloudflare Health Checks ou equivalente). Alertas enviados ao IT_MANAGER em caso de indisponibilidade detectada de fora.

---

**INT-048** — Jobs críticos com alertas de falha no primeiro erro
Jobs como `GoogleUserSyncJob`, `GlpiAssetSyncJob` e `SlaMonitoringJob` notificam o IT_MANAGER na primeira falha, sem aguardar 3 tentativas consecutivas.

---

**INT-049** — Token JWT não armazenado no localStorage
O token JWT do SGTI é armazenado em memória do React (ou em cookie HttpOnly, Secure, SameSite=Lax). Nunca armazenado em localStorage para evitar XSS.

---

**INT-050** — Documentação de integração atualizada a cada mudança de contrato
Toda alteração em contratos de API (novos endpoints, campos, comportamentos) deve ser refletida nos documentos de integração antes do merge para `main`.

---

## 21. Critérios de Aceitação

### 21.1 Google Workspace

- [ ] **CA-01:** Login com conta pessoal @gmail.com rejeitado (hd claim validado).
- [ ] **CA-02:** Provisionamento automático disparado ao aprovar REQ-TYPE-001.
- [ ] **CA-03:** Suspensão Google executada em até 2 horas após aprovação de REQ-TYPE-003.
- [ ] **CA-04:** `GoogleUserSyncJob` executa diariamente às 02h00 sem intervenção manual.
- [ ] **CA-05:** Campos SGTI-exclusivos não sobrescritos pela sync do Google.
- [ ] **CA-06:** Circuit breaker ativado após 5 falhas; IT_MANAGER notificado.

### 21.2 GLPI

- [ ] **CA-07:** Incidente aberto no SGTI aparece no GLPI em até 10 segundos.
- [ ] **CA-08:** Falha no GLPI não bloqueia abertura de incidente no SGTI.
- [ ] **CA-09:** `GlpiAssetSyncJob` executa diariamente com relatório de divergências.
- [ ] **CA-10:** Campos de negócio do SGTI nunca sobrescritos pela sync GLPI.

### 21.3 Supabase e Banco de Dados

- [ ] **CA-11:** RLS de tenant garante que dados de Tenant A não são visíveis para Tenant B.
- [ ] **CA-12:** INSERT em `audit_log` funciona; UPDATE e DELETE bloqueados por RLS.
- [ ] **CA-13:** Supabase Realtime atualiza dashboard em menos de 5 segundos.
- [ ] **CA-14:** Downloads de arquivos do Storage geram URL presigned com validade de 15 minutos.

### 21.4 E-mail

- [ ] **CA-15:** E-mail de notificação enviado de `implantacao@pinpag.com.br`.
- [ ] **CA-16:** Resposta ao e-mail de notificação adicionada como comentário no chamado correto.
- [ ] **CA-17:** E-mail enviado com retry automático em caso de falha SMTP.

### 21.5 Segurança

- [ ] **CA-18:** JWT com expiração correta de 1 hora; rejeitado após expirado.
- [ ] **CA-19:** API Key inválida retorna 401; tentativa registrada em audit_log.
- [ ] **CA-20:** Headers de segurança obrigatórios presentes em todas as respostas HTTP.
- [ ] **CA-21:** Nenhum segredo visível em logs de aplicação.
- [ ] **CA-22:** Webhook de saída com header HMAC-SHA256 correto.

### 21.6 Tratamento de Falhas

- [ ] **CA-23:** Circuit breaker abre após 5 falhas e fecha após recuperação.
- [ ] **CA-24:** Retry com backoff correto: 30s, 2min, 8min, 30min.
- [ ] **CA-25:** DLQ notifica IT_MANAGER imediatamente ao receber entrada.
- [ ] **CA-26:** Rollback automático de deploy se smoke tests falharem.

### 21.7 Observabilidade

- [ ] **CA-27:** Health check `/health` retorna status correto de todos os sistemas.
- [ ] **CA-28:** `correlation_id` presente em todos os logs estruturados.
- [ ] **CA-29:** Logs em formato JSON com campos obrigatórios.
- [ ] **CA-30:** Alerta ao IT_MANAGER quando latência p95 > 2 segundos.

### 21.8 CI/CD e GitHub

- [ ] **CA-31:** PR para `main` sem 2 aprovações é bloqueado pelo GitHub.
- [ ] **CA-32:** Force push em `main` bloqueado pelo GitHub.
- [ ] **CA-33:** Build com vulnerabilidade crítica em dependência bloqueia CI.
- [ ] **CA-34:** Secrets do Vercel não aparecem em logs do GitHub Actions.

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação com 21 seções, 50 regras INT e 34 critérios de aceitação |

---

> **Próximos documentos recomendados:**
> [`22_AUTHENTICATION.md`](./22_AUTHENTICATION.md) — Autenticação e autorização detalhadas (JWT, OAuth, RBAC)
> [`20_DATABASE.md`](./20_DATABASE.md) — Modelo de dados completo e schemas
> [`44_IDENTITY_MANAGEMENT.md`](./44_IDENTITY_MANAGEMENT.md) — IAM (provisionamento Google)
