# SGTI — Sistema de Gestão de Tecnologia da Informação
## Modelo de Dados Corporativo

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [12_ARCHITECTURE.md](./12_ARCHITECTURE.md) · [14_SECURITY_REQUIREMENTS.md](./14_SECURITY_REQUIREMENTS.md) · [01_CLAUDE.md](./01_CLAUDE.md)

---

## Sobre este Documento

Este documento define o **modelo de dados corporativo completo do SGTI** — a especificação funcional de todas as entidades, seus campos, relacionamentos, índices e estratégias transversais de dados. É a referência de autoridade para o design do banco de dados PostgreSQL hospedado no Supabase.

**Escopo:** documentação funcional do modelo de dados. Nenhum SQL, Prisma Schema ou código é gerado neste documento.

### Convenções

| Convenção | Descrição |
|-----------|-----------|
| **PK** | Chave primária — UUID v4 gerado pela aplicação |
| **FK** | Chave estrangeira com a entidade referenciada |
| **NOT NULL** | Campo obrigatório |
| **NULLABLE** | Campo opcional |
| **UNIQUE** | Valor único dentro do escopo (global ou por tenant) |
| **INDEX** | Campo com índice recomendado |
| **SOFT DELETE** | Registro marcado como excluído, nunca removido fisicamente |
| **AUDITED** | Toda alteração gera registro em `shared.audit_log` |

### Schemas PostgreSQL por Módulo

Cada módulo do SGTI reside em seu próprio schema PostgreSQL, garantindo isolamento de fronteiras de domínio:

| Schema | Módulo | Entidades |
|--------|--------|-----------|
| `auth` | Autenticação e Segurança | User, Role, Permission, UserRole, Session, ApiKey |
| `org` | Organização | Department, BusinessUnit, CostCenter |
| `catalog` | Catálogo e SLA | ServiceCatalog, ServiceCategory, SLA, SLAHistory |
| `ticket` | Chamados (base comum) | Ticket, TicketComment, TicketAttachment, TicketStatus, TicketPriority, TransferHistory |
| `incident` | Incidentes | Incident, IncidentImpact, IncidentCause |
| `request` | Requisições | Request, RequestType, Approval, ApprovalHistory |
| `problem` | Problemas | Problem, RootCause, Workaround |
| `asset` | Ativos | Asset, AssetCategory, AssetAssignment, AssetMovement, AssetMaintenance, GlpiAssetReference |
| `identity` | Identidades | Identity, IdentityGroup, IdentityPermission, GoogleUserReference |
| `compliance` | Compliance | AuditCompany, Audit, Norm, NormItem, ComplianceFinding, ComplianceEvidence, ComplianceActionPlan |
| `finance` | Financeiro | Budget, BudgetItem, CostAllocation, OpexExpense, CapexInvestment, Supplier, Contract |
| `project` | Projetos | Project, ProjectTask, ProjectCost |
| `procurement` | Compras | PurchaseRequest, PurchaseOrder, PurchaseItem |
| `knowledge` | Base de Conhecimento | KnowledgeArticle, KnowledgeCategory, KnowledgeTag, KnowledgeAttachment, KnowledgeFeedback |
| `notification` | Notificações | Notification, NotificationTemplate, NotificationHistory |
| `email_log` | E-mail | EmailThread, EmailMessage |
| `dashboard` | Dashboards | KPI, KPIHistory |
| `shared` | Compartilhado | AuditLog, FileReference |

---

## Sumário

1. [Estratégias Transversais de Dados](#1-estratégias-transversais-de-dados)
2. [Diagrama Lógico de Alto Nível](#2-diagrama-lógico-de-alto-nível)
3. [Autenticação e Segurança](#3-autenticação-e-segurança)
4. [Organização](#4-organização)
5. [Catálogo de Serviços e SLA](#5-catálogo-de-serviços-e-sla)
6. [Chamados (Base Comum)](#6-chamados-base-comum)
7. [Incidentes](#7-incidentes)
8. [Requisições](#8-requisições)
9. [Problemas](#9-problemas)
10. [Ativos](#10-ativos)
11. [Identidades](#11-identidades)
12. [Compliance](#12-compliance)
13. [Financeiro](#13-financeiro)
14. [Projetos](#14-projetos)
15. [Compras](#15-compras)
16. [Base de Conhecimento](#16-base-de-conhecimento)
17. [Notificações](#17-notificações)
18. [E-mail](#18-e-mail)
19. [Dashboards](#19-dashboards)
20. [Auditoria e Storage](#20-auditoria-e-storage)
21. [Relacionamentos Principais e Cardinalidades](#21-relacionamentos-principais-e-cardinalidades)

---

## 1. Estratégias Transversais de Dados

### 1.1 Estratégia Multiempresa (Multi-Tenant)

O SGTI é projetado inicialmente para uma única organização, mas o modelo de dados é preparado para expansão multiempresa sem reescrita estrutural.

**Abordagem:** Schema compartilhado com coluna `tenant_id` em todas as entidades de negócio.

```
Toda tabela de negócio contém:
  tenant_id  → FK para org.tenant (NOT NULL, INDEX)

Estratégia de isolamento:
  Row Level Security (RLS) garante que cada tenant
  acessa apenas seus próprios registros.

Expansão futura:
  Fase 1 (atual): tenant_id fixo para a organização
  Fase 2: múltiplos tenants com subdomínio dedicado
  Fase 3: schema por tenant para grandes clientes (enterprise)
```

**Entidade `org.Tenant` (preparação futura):**
Mesmo que não utilizada na fase inicial, a coluna `tenant_id` é incluída desde o início para evitar migração futura destrutiva. O valor padrão é o UUID do tenant único da organização.

---

### 1.2 Estratégia de Soft Delete

**Nenhum registro de negócio é fisicamente excluído** do banco de dados do SGTI. A exclusão lógica é implementada via coluna `deleted_at`:

```
Campos padrão de soft delete:
  deleted_at    TIMESTAMPTZ  NULLABLE  → null = ativo; preenchido = excluído
  deleted_by    UUID         NULLABLE  → FK para auth.User (quem excluiu)

Comportamento:
  DELETE via API → preenche deleted_at e deleted_by
  SELECT padrão  → WHERE deleted_at IS NULL (aplicado via RLS)
  Restauração    → SET deleted_at = NULL (role IT_MANAGER+)
  Hard delete    → proibido via RLS; exclusão apenas por SUPER_ADMIN com justificativa
```

**Exceções ao soft delete:**
- `shared.audit_log`: sem exclusão de qualquer tipo (INSERT-only por RLS).
- `auth.session`: expiradas são fisicamente removidas por job de limpeza semanal.
- `ai_assistant.usage_log`: arquivamento após 1 ano em vez de exclusão.

---

### 1.3 Estratégia de Auditoria

Toda operação de escrita (CREATE, UPDATE, DELETE lógico) em entidades de negócio gera registro imutável em `shared.audit_log`.

**Campos padrão de auditoria em todas as entidades:**

```
Campos de criação:
  created_at    TIMESTAMPTZ  NOT NULL  DEFAULT NOW()
  created_by    UUID         NOT NULL  FK para auth.User

Campos de atualização:
  updated_at    TIMESTAMPTZ  NOT NULL  DEFAULT NOW() (atualizado por trigger)
  updated_by    UUID         NULLABLE  FK para auth.User

Campos de exclusão lógica:
  deleted_at    TIMESTAMPTZ  NULLABLE
  deleted_by    UUID         NULLABLE  FK para auth.User
```

**Tabela `shared.audit_log`:** registro imutável de todas as alterações. Política RLS INSERT-only impede UPDATE e DELETE. Ver seção 20 para detalhes completos.

---

### 1.4 Estratégia de Versionamento de Registros

Entidades que requerem histórico completo de versões implementam o padrão **Append-Only Versioning**:

```
Entidades versionadas:
  - catalog.ServiceCatalog   (versão do catálogo)
  - catalog.SLA              (versão do SLA)
  - compliance.Norm          (versão da norma)
  - knowledge.KnowledgeArticle (versão do artigo)

Padrão de versionamento:
  version_number   INTEGER   NOT NULL  DEFAULT 1
  is_current       BOOLEAN   NOT NULL  DEFAULT true
  superseded_by    UUID      NULLABLE  FK para registro mais recente
  effective_from   DATE      NOT NULL
  effective_until  DATE      NULLABLE  (null = vigente)

Operação de nova versão:
  1. Criar novo registro com version_number = current + 1
  2. Setar is_current = true no novo; is_current = false no anterior
  3. Setar effective_until no anterior = hoje
  4. Setar superseded_by no anterior = ID do novo
```

---

### 1.5 Estratégia de Retenção de Dados

| Tipo de Dado | Retenção | Ação Pós-Retenção |
|-------------|---------|------------------|
| Registros de negócio ativos | Indefinido (enquanto vigente) | Soft delete quando encerrado |
| Registros encerrados (tickets fechados, contratos vencidos) | 5 anos após encerramento | Anonimização de PII |
| Logs de auditoria | 5 anos | Anonimização de user_id |
| Logs de sistema | 1 ano | Exclusão física |
| Sessões expiradas | 7 dias | Exclusão física por job |
| Histórico de notificações | 90 dias | Exclusão física |
| KPIHistory | 3 anos | Agregação em períodos maiores |
| Conversas do Assistente IA | 1 ano | Exclusão física |
| Emails registrados | 1 ano | Exclusão física |
| Evidências de compliance | 5 anos | Exportação antes de exclusão |

**Job de retenção:** executado na primeira segunda-feira de cada mês, às 03h00, verificando registros que atingiram o prazo de retenção.

---

### 1.6 Estratégia LGPD

**Dados Pessoais Identificáveis (PII)** estão concentrados exclusivamente no schema `identity`. Todos os demais schemas referenciam `user_id` (UUID pseudônimo) — nunca replicam nome, e-mail ou outros atributos pessoais.

```
Campos PII (exclusivos do schema identity):
  full_name     → anonimizado para "[Usuário Removido]" após retenção
  email         → anonimizado para "anonimizado-{hash}@removido.local"
  display_name  → anonimizado para "[Removido]"
  phone         → anonimizado para null
  avatar_url    → removido e arquivo deletado do Storage

Pseudonimização operacional:
  Todos os outros schemas usam: user_id (UUID) → sem PII direta
  Relatórios exibem nome apenas via JOIN autorizado (IT_MANAGER+)
  Logs de auditoria: user_id + user_role (sem nome)

Direito ao esquecimento (Art. 18 LGPD):
  1. Setar deleted_at na Identity
  2. Anonimizar campos PII na Identity
  3. Revogar todas as sessões ativas
  4. Manter registros de negócio (tickets, ativos) com user_id pseudônimo
  5. Registrar solicitação em compliance.ComplianceFinding como evidência
```

---

### 1.7 Campos Base Universais

Toda tabela de negócio do SGTI herda os seguintes campos base:

```
id            UUID         PK   NOT NULL   UUID v4 gerado pela aplicação
tenant_id     UUID         FK   NOT NULL   → org.Tenant (futuro multi-tenant)
created_at    TIMESTAMPTZ       NOT NULL   DEFAULT NOW()
created_by    UUID         FK   NOT NULL   → auth.User
updated_at    TIMESTAMPTZ       NOT NULL   DEFAULT NOW() (trigger)
updated_by    UUID         FK   NULLABLE   → auth.User
deleted_at    TIMESTAMPTZ       NULLABLE
deleted_by    UUID         FK   NULLABLE   → auth.User
```

---

## 2. Diagrama Lógico de Alto Nível

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                       SGTI — DIAGRAMA LÓGICO DE MÓDULOS                     ║
╚══════════════════════════════════════════════════════════════════════════════╝

                    ┌─────────────────────────────────────────┐
                    │        AUTENTICAÇÃO E ORGANIZAÇÃO        │
                    │                                         │
                    │  User ──── UserRole ──── Role           │
                    │   │           │            │            │
                    │  Session   Permission   Department       │
                    │   │                     BusinessUnit     │
                    │  ApiKey                 CostCenter       │
                    └──────────────────────────┬──────────────┘
                                               │ user_id referenciado por todos os módulos
                    ┌──────────────────────────▼──────────────┐
                    │          CATÁLOGO E SLA                  │
                    │                                         │
                    │  ServiceCategory ─── ServiceCatalog     │
                    │                          │              │
                    │                         SLA             │
                    │                          │              │
                    │                       SLAHistory        │
                    └──────────────────────────┬──────────────┘
                                               │ sla_id e catalog_id referenciados por Ticket
                    ┌──────────────────────────▼──────────────┐
                    │          CHAMADOS (BASE COMUM)           │
                    │                                         │
                    │  TicketStatus ─── Ticket ─── TicketPriority
                    │                    │    │                │
                    │              Comment  Attachment        │
                    │                    │                    │
                    │               TransferHistory           │
                    └────┬───────────────────┬───────────────┘
                         │                   │
            ┌────────────▼──────┐   ┌────────▼───────────┐
            │    INCIDENTES     │   │    REQUISIÇÕES      │
            │                   │   │                     │
            │ Incident          │   │ RequestType         │
            │  ├─ IncidentImpact│   │ Request             │
            │  └─ IncidentCause │   │  ├─ Approval        │
            │                   │   │  └─ ApprovalHistory │
            └────────┬──────────┘   └────────┬────────────┘
                     │                        │
                     └──────────┬─────────────┘
                                │
                    ┌───────────▼─────────────────────────────┐
                    │               PROBLEMAS                  │
                    │                                         │
                    │  Problem ─── RootCause                  │
                    │      │                                  │
                    │  Workaround                             │
                    └──────────────────────────┬──────────────┘
                                               │
                    ┌──────────────────────────▼──────────────┐
                    │       BASE DE CONHECIMENTO               │
                    │                                         │
                    │  KnowledgeCategory ── KnowledgeArticle  │
                    │                           │    │        │
                    │  KnowledgeTag ────────────┘  Attachment │
                    │                               Feedback  │
                    └─────────────────────────────────────────┘

                    ┌─────────────────────────────────────────┐
                    │              ATIVOS (ITAM)               │
                    │                                         │
                    │  AssetCategory ─── Asset                │
                    │                    │  │  │              │
                    │              Assignment Movement        │
                    │                         Maintenance     │
                    │                    │                    │
                    │              GlpiAssetReference         │
                    └─────────────────────────────────────────┘

                    ┌─────────────────────────────────────────┐
                    │           IDENTIDADES (IAM)              │
                    │                                         │
                    │  IdentityGroup ─── Identity             │
                    │                    │    │               │
                    │           IdentityPermission            │
                    │                    │                    │
                    │           GoogleUserReference           │
                    └─────────────────────────────────────────┘

                    ┌────────────────────┐  ┌─────────────────┐
                    │     COMPLIANCE     │  │   FINANCEIRO    │
                    │                    │  │                 │
                    │  AuditCompany      │  │  Budget         │
                    │   └─ Audit         │  │   └─ BudgetItem │
                    │       ├─ Norm      │  │  CostAllocation │
                    │       │  └─NormItem│  │  OpexExpense    │
                    │       ├─ Finding   │  │  CapexInvestment│
                    │       │  └─Evidence│  │  Supplier       │
                    │       └─ ActionPlan│  │   └─ Contract   │
                    └────────────────────┘  └─────────────────┘

                    ┌────────────────────┐  ┌─────────────────┐
                    │      PROJETOS      │  │     COMPRAS     │
                    │                    │  │                 │
                    │  Project           │  │ PurchaseRequest │
                    │   ├─ ProjectTask   │  │  └─PurchaseOrder│
                    │   └─ ProjectCost   │  │      └─PurchItem│
                    └────────────────────┘  └─────────────────┘

                    ┌─────────────────────────────────────────┐
                    │         SERVIÇOS TRANSVERSAIS            │
                    │                                         │
                    │  Notification ─── NotificationTemplate  │
                    │      └─ NotificationHistory             │
                    │                                         │
                    │  EmailThread ─── EmailMessage           │
                    │                                         │
                    │  KPI ─── KPIHistory                    │
                    │                                         │
                    │  AuditLog (imutável — INSERT ONLY)      │
                    │  FileReference (Supabase Storage)       │
                    └─────────────────────────────────────────┘
```

---

## 3. Autenticação e Segurança

### 3.1 User

**Schema:** `auth`
**Objetivo:** Representa a identidade autenticada de um usuário no SGTI. É a entidade central referenciada por todos os módulos. Vincula-se à conta Google Workspace via OAuth.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único do usuário |
| `tenant_id` | UUID | FK NOT NULL | Tenant ao qual pertence |
| `email` | VARCHAR(255) | NOT NULL UNIQUE | E-mail corporativo (Google Workspace) |
| `display_name` | VARCHAR(200) | NOT NULL | Nome de exibição |
| `full_name` | VARCHAR(300) | NOT NULL | Nome completo (PII — somente schema auth/identity) |
| `avatar_url` | TEXT | NULLABLE | URL do avatar Google |
| `google_sub` | VARCHAR(255) | NOT NULL UNIQUE | Subject ID do Google OAuth (identificador imutável) |
| `google_hd` | VARCHAR(255) | NOT NULL | Hosted domain do Google Workspace |
| `status` | ENUM | NOT NULL | `ACTIVE`, `INACTIVE`, `SUSPENDED`, `PENDING` |
| `last_login_at` | TIMESTAMPTZ | NULLABLE | Último login registrado |
| `login_count` | INTEGER | NOT NULL DEFAULT 0 | Contador de logins |
| `mfa_enabled` | BOOLEAN | NOT NULL DEFAULT false | MFA habilitado no Google (informativo) |
| `locale` | VARCHAR(10) | NOT NULL DEFAULT 'pt-BR' | Locale preferido |
| `timezone` | VARCHAR(50) | NOT NULL DEFAULT 'America/Sao_Paulo' | Fuso horário |
| `metadata` | JSONB | NULLABLE | Metadados adicionais do Google (unidade org., cargo) |
| _campos base_ | — | — | created_at, updated_at, deleted_at, created_by, updated_by, deleted_by |

**Relacionamentos:**
- 1:N → `auth.Session` (um usuário tem muitas sessões)
- 1:N → `auth.UserRole` (um usuário tem muitos papéis)
- 1:1 → `identity.Identity` (espelho de identidade no módulo IAM)
- 1:1 → `identity.GoogleUserReference` (referência à conta Google)
- N:N → `org.Department` via tabela de vínculo
- Referenciado como `created_by`, `updated_by`, `deleted_by` em todas as entidades

**Índices recomendados:**
- `UNIQUE` em `email`
- `UNIQUE` em `google_sub`
- `INDEX` em `tenant_id`
- `INDEX` em `status`
- `INDEX` em `last_login_at`

---

### 3.2 Role

**Schema:** `auth`
**Objetivo:** Define os papéis de acesso do sistema com seus escopos de permissão. Papéis são predefinidos e não devem ser criados livremente — seguem a hierarquia de RBAC documentada.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `name` | ENUM | NOT NULL UNIQUE/tenant | `SUPER_ADMIN`, `IT_MANAGER`, `IT_SPECIALIST`, `IT_TECHNICIAN`, `COMPLIANCE_OFFICER`, `FINANCIAL_ANALYST`, `PROJECT_MANAGER`, `AUDITOR`, `EXECUTIVE`, `END_USER` |
| `display_name` | VARCHAR(100) | NOT NULL | Nome de exibição |
| `description` | TEXT | NULLABLE | Descrição do papel e suas responsabilidades |
| `is_system` | BOOLEAN | NOT NULL DEFAULT false | true = papel do sistema (não editável) |
| `priority` | INTEGER | NOT NULL | Hierarquia numérica (menor = mais privilegiado) |
| _campos base_ | — | — | created_at, updated_at, deleted_at, created_by |

**Relacionamentos:**
- N:N → `auth.User` via `auth.UserRole`
- 1:N → `auth.Permission` (um papel tem muitas permissões)

**Índices recomendados:**
- `UNIQUE` em `(tenant_id, name)`
- `INDEX` em `priority`

---

### 3.3 Permission

**Schema:** `auth`
**Objetivo:** Define permissões granulares por módulo e operação. Cada permissão representa uma capacidade específica do sistema.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `role_id` | UUID | FK NOT NULL | → `auth.Role` |
| `module` | VARCHAR(50) | NOT NULL | Módulo do sistema (ex: `incident`, `asset`) |
| `resource` | VARCHAR(100) | NOT NULL | Recurso específico (ex: `Incident`, `Asset`) |
| `action` | ENUM | NOT NULL | `CREATE`, `READ`, `UPDATE`, `DELETE`, `APPROVE`, `EXPORT`, `CONFIGURE` |
| `conditions` | JSONB | NULLABLE | Condições adicionais (ex: `{"own_only": true}`) |
| _campos base_ | — | — | created_at, created_by |

**Relacionamentos:**
- N:1 → `auth.Role`

**Índices recomendados:**
- `INDEX` em `role_id`
- `INDEX` em `(module, resource, action)`

---

### 3.4 UserRole

**Schema:** `auth`
**Objetivo:** Tabela de associação entre usuários e papéis. Registra quem atribuiu o papel, quando e por qual justificativa.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `user_id` | UUID | FK NOT NULL | → `auth.User` |
| `role_id` | UUID | FK NOT NULL | → `auth.Role` |
| `assigned_by` | UUID | FK NOT NULL | → `auth.User` (quem atribuiu) |
| `assigned_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Data de atribuição |
| `expires_at` | TIMESTAMPTZ | NULLABLE | Expiração (null = sem expiração) |
| `reason` | TEXT | NOT NULL | Justificativa da atribuição (obrigatória) |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true | Papel ativo ou suspenso temporariamente |
| _campos base_ | — | — | created_at, updated_at, deleted_at, created_by |

**Relacionamentos:**
- N:1 → `auth.User`
- N:1 → `auth.Role`

**Índices recomendados:**
- `UNIQUE` em `(user_id, role_id)` WHERE `deleted_at IS NULL`
- `INDEX` em `user_id`
- `INDEX` em `role_id`
- `INDEX` em `expires_at` (para job de expiração)

---

### 3.5 Session

**Schema:** `auth`
**Objetivo:** Registra sessões ativas de usuários. Armazena o refresh token e metadados de dispositivo para detecção de sessões suspeitas.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único da sessão |
| `user_id` | UUID | FK NOT NULL | → `auth.User` |
| `refresh_token_hash` | VARCHAR(64) | NOT NULL UNIQUE | SHA-256 do refresh token |
| `status` | ENUM | NOT NULL | `ACTIVE`, `REVOKED`, `EXPIRED` |
| `device_info` | JSONB | NULLABLE | User-agent, browser, OS |
| `ip_address` | INET | NOT NULL | IP real do cliente (via Cloudflare) |
| `country_code` | CHAR(2) | NULLABLE | País do IP (via Cloudflare CF-IPCountry) |
| `last_used_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Último uso do refresh token |
| `expires_at` | TIMESTAMPTZ | NOT NULL | Expiração do refresh token (7 dias) |
| `revoked_at` | TIMESTAMPTZ | NULLABLE | Data de revogação |
| `revoked_by` | UUID | FK NULLABLE | → `auth.User` (quem revogou — null = auto-expirado) |
| `revoked_reason` | TEXT | NULLABLE | Motivo da revogação |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Criação da sessão (login) |

**Relacionamentos:**
- N:1 → `auth.User`

**Índices recomendados:**
- `UNIQUE` em `refresh_token_hash`
- `INDEX` em `user_id`
- `INDEX` em `status`
- `INDEX` em `expires_at` (job de limpeza)

---

### 3.6 ApiKey

**Schema:** `auth`
**Objetivo:** Gerencia chaves de API para integrações máquina a máquina (GLPI, automações internas). Não utilizado para autenticação de usuários humanos.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `name` | VARCHAR(100) | NOT NULL | Nome descritivo da chave |
| `key_hash` | VARCHAR(64) | NOT NULL UNIQUE | SHA-256 da chave (chave não armazenada em texto plano) |
| `key_prefix` | CHAR(8) | NOT NULL | Primeiros 8 caracteres (para identificação sem expor a chave) |
| `scopes` | TEXT[] | NOT NULL | Escopos permitidos (ex: `['incident:read', 'asset:read']`) |
| `status` | ENUM | NOT NULL | `ACTIVE`, `REVOKED`, `EXPIRED` |
| `last_used_at` | TIMESTAMPTZ | NULLABLE | Último uso registrado |
| `expires_at` | TIMESTAMPTZ | NULLABLE | null = sem expiração |
| `integration_name` | VARCHAR(100) | NOT NULL | Nome da integração (ex: `GLPI`, `AUTOMATION`) |
| _campos base_ | — | — | created_at, updated_at, deleted_at, created_by |

**Índices recomendados:**
- `UNIQUE` em `key_hash`
- `INDEX` em `(tenant_id, status)`

---

## 4. Organização

### 4.1 Department

**Schema:** `org`
**Objetivo:** Representa as unidades departamentais da organização. Usado para segmentação de chamados, ativos, custos e controle de acesso.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `name` | VARCHAR(200) | NOT NULL | Nome do departamento |
| `code` | VARCHAR(20) | NOT NULL UNIQUE/tenant | Código interno (ex: `TI-SUP`) |
| `parent_id` | UUID | FK NULLABLE | → `org.Department` (hierarquia) |
| `manager_id` | UUID | FK NULLABLE | → `auth.User` (gestor do depto) |
| `business_unit_id` | UUID | FK NULLABLE | → `org.BusinessUnit` |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true | Departamento ativo |
| _campos base_ | — | — | campos base universais |

**Relacionamentos:**
- 1:N → `org.Department` (auto-relacionamento hierárquico)
- N:1 → `org.BusinessUnit`
- N:N → `auth.User`

**Índices recomendados:**
- `UNIQUE` em `(tenant_id, code)`
- `INDEX` em `parent_id`
- `INDEX` em `business_unit_id`

---

### 4.2 BusinessUnit

**Schema:** `org`
**Objetivo:** Agrupa departamentos em unidades de negócio para rateio financeiro e relatórios gerenciais.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `name` | VARCHAR(200) | NOT NULL | Nome da unidade de negócio |
| `code` | VARCHAR(20) | NOT NULL UNIQUE/tenant | Código interno |
| `director_id` | UUID | FK NULLABLE | → `auth.User` (diretor da BU) |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true | BU ativa |
| _campos base_ | — | — | campos base universais |

**Relacionamentos:**
- 1:N → `org.Department`
- 1:N → `finance.CostAllocation`

---

### 4.3 CostCenter

**Schema:** `org`
**Objetivo:** Centro de custo contábil para rateio de despesas de TI. Vincula gastos de TI a unidades de negócio específicas.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `code` | VARCHAR(30) | NOT NULL UNIQUE/tenant | Código contábil |
| `name` | VARCHAR(200) | NOT NULL | Nome do centro de custo |
| `department_id` | UUID | FK NULLABLE | → `org.Department` |
| `business_unit_id` | UUID | FK NULLABLE | → `org.BusinessUnit` |
| `manager_id` | UUID | FK NULLABLE | → `auth.User` (responsável) |
| `budget_limit_monthly` | DECIMAL(15,2) | NULLABLE | Limite mensal de despesas |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true | Centro ativo |
| _campos base_ | — | — | campos base universais |

**Relacionamentos:**
- N:1 → `org.Department`
- N:1 → `org.BusinessUnit`
- 1:N → `finance.OpexExpense`
- 1:N → `finance.BudgetItem`

---

## 5. Catálogo de Serviços e SLA

### 5.1 ServiceCategory

**Schema:** `catalog`
**Objetivo:** Categoriza os serviços do catálogo em grupos temáticos para filtragem e roteamento de chamados.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `name` | VARCHAR(100) | NOT NULL UNIQUE/tenant | Nome da categoria |
| `description` | TEXT | NULLABLE | Descrição da categoria |
| `icon` | VARCHAR(50) | NULLABLE | Ícone (ex: nome do ícone Lucide) |
| `parent_id` | UUID | FK NULLABLE | → `catalog.ServiceCategory` (hierarquia) |
| `order` | INTEGER | NOT NULL DEFAULT 0 | Ordem de exibição |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true | Categoria ativa |
| _campos base_ | — | — | campos base universais |

**Índices recomendados:**
- `INDEX` em `(tenant_id, parent_id)`
- `INDEX` em `is_active`

---

### 5.2 ServiceCatalog

**Schema:** `catalog`
**Objetivo:** Repositório formal de todos os serviços de TI oferecidos. Cada item do catálogo define o serviço, canais, SLA e responsáveis.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `category_id` | UUID | FK NOT NULL | → `catalog.ServiceCategory` |
| `name` | VARCHAR(200) | NOT NULL | Nome do serviço |
| `slug` | VARCHAR(200) | NOT NULL UNIQUE/tenant | URL-friendly identifier |
| `description_user` | TEXT | NOT NULL | Descrição para o usuário final |
| `description_tech` | TEXT | NULLABLE | Descrição técnica interna |
| `status` | ENUM | NOT NULL | `DRAFT`, `PUBLISHED`, `DEPRECATED` |
| `audience` | ENUM | NOT NULL | `END_USER`, `TECHNICAL`, `BOTH` |
| `default_ticket_type` | ENUM | NOT NULL | `INCIDENT`, `REQUEST` |
| `owner_id` | UUID | FK NOT NULL | → `auth.User` (responsável pelo serviço) |
| `version_number` | INTEGER | NOT NULL DEFAULT 1 | Versão atual |
| `is_current` | BOOLEAN | NOT NULL DEFAULT true | Se é a versão vigente |
| `superseded_by` | UUID | FK NULLABLE | → `catalog.ServiceCatalog` (próxima versão) |
| `effective_from` | DATE | NOT NULL | Início da vigência |
| `effective_until` | DATE | NULLABLE | Fim da vigência (null = atual) |
| `approval_required` | BOOLEAN | NOT NULL DEFAULT false | Requer aprovação para abrir chamado |
| `approval_flow` | JSONB | NULLABLE | Configuração do fluxo de aprovação |
| `metadata` | JSONB | NULLABLE | Campos customizados do formulário |
| _campos base_ | — | — | campos base universais |

**Relacionamentos:**
- N:1 → `catalog.ServiceCategory`
- 1:N → `catalog.SLA`
- 1:N → `ticket.Ticket`
- 1:N → `request.RequestType`

**Índices recomendados:**
- `UNIQUE` em `(tenant_id, slug)` WHERE `deleted_at IS NULL`
- `INDEX` em `(tenant_id, status, is_current)`
- `INDEX` em `category_id`

---

### 5.3 SLA

**Schema:** `catalog`
**Objetivo:** Define os acordos de nível de serviço associados a itens do catálogo e/ou prioridades. Controla os prazos de resposta e resolução.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `catalog_id` | UUID | FK NULLABLE | → `catalog.ServiceCatalog` (null = SLA padrão por prioridade) |
| `priority` | ENUM | NOT NULL | `CRITICAL`, `HIGH`, `MEDIUM`, `LOW` |
| `name` | VARCHAR(100) | NOT NULL | Nome do SLA |
| `response_minutes` | INTEGER | NOT NULL | Minutos para primeiro atendimento |
| `resolution_minutes` | INTEGER | NOT NULL | Minutos para resolução |
| `working_hours_only` | BOOLEAN | NOT NULL DEFAULT true | Conta apenas horário comercial |
| `pause_on_weekends` | BOOLEAN | NOT NULL DEFAULT true | Pausa nos fins de semana |
| `business_hours_start` | TIME | NOT NULL DEFAULT '08:00' | Início do horário comercial |
| `business_hours_end` | TIME | NOT NULL DEFAULT '18:00' | Fim do horário comercial |
| `escalation_rules` | JSONB | NULLABLE | Regras de escalonamento automático |
| `version_number` | INTEGER | NOT NULL DEFAULT 1 | Versão |
| `is_current` | BOOLEAN | NOT NULL DEFAULT true | Se é a versão vigente |
| `effective_from` | DATE | NOT NULL | Início da vigência |
| `effective_until` | DATE | NULLABLE | Fim da vigência |
| _campos base_ | — | — | campos base universais |

**Relacionamentos:**
- N:1 → `catalog.ServiceCatalog`
- 1:N → `catalog.SLAHistory`
- 1:N → `ticket.Ticket`

**Índices recomendados:**
- `INDEX` em `(tenant_id, priority, is_current)`
- `INDEX` em `catalog_id`

---

### 5.4 SLAHistory

**Schema:** `catalog`
**Objetivo:** Registra o histórico de pausas, retomadas e violações de SLA para cada ticket. Permite cálculo preciso do tempo efetivo de atendimento.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `ticket_id` | UUID | FK NOT NULL | → `ticket.Ticket` |
| `sla_id` | UUID | FK NOT NULL | → `catalog.SLA` |
| `event` | ENUM | NOT NULL | `STARTED`, `PAUSED`, `RESUMED`, `BREACHED`, `RESOLVED_ON_TIME`, `RESOLVED_LATE` |
| `event_at` | TIMESTAMPTZ | NOT NULL | Momento do evento |
| `reason` | TEXT | NULLABLE | Motivo da pausa ou violação |
| `response_deadline` | TIMESTAMPTZ | NOT NULL | Prazo de resposta calculado |
| `resolution_deadline` | TIMESTAMPTZ | NOT NULL | Prazo de resolução calculado |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | — |
| `created_by` | UUID | FK NOT NULL | → `auth.User` |

**Índices recomendados:**
- `INDEX` em `ticket_id`
- `INDEX` em `event_at`

---

## 6. Chamados (Base Comum)

### 6.1 TicketPriority

**Schema:** `ticket`
**Objetivo:** Tabela de domínio para prioridades de chamados. Gerada pelo cruzamento de Impacto × Urgência conforme matriz ITIL.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `name` | ENUM | NOT NULL | `CRITICAL`, `HIGH`, `MEDIUM`, `LOW` |
| `display_name` | VARCHAR(50) | NOT NULL | Nome de exibição localizado |
| `color` | VARCHAR(7) | NOT NULL | Cor hex (ex: `#FF0000`) |
| `order` | INTEGER | NOT NULL | Ordem de exibição (1 = mais urgente) |

---

### 6.2 TicketStatus

**Schema:** `ticket`
**Objetivo:** Estados possíveis do ciclo de vida de um chamado.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `name` | ENUM | NOT NULL | `OPEN`, `IN_PROGRESS`, `PENDING_USER`, `PENDING_THIRD_PARTY`, `ESCALATED`, `RESOLVED`, `CLOSED`, `CANCELLED` |
| `display_name` | VARCHAR(100) | NOT NULL | Nome de exibição |
| `color` | VARCHAR(7) | NOT NULL | Cor hex |
| `is_open` | BOOLEAN | NOT NULL | true = chamado "em aberto" para efeito de SLA |
| `is_terminal` | BOOLEAN | NOT NULL | true = estado final (CLOSED, CANCELLED) |
| `pauses_sla` | BOOLEAN | NOT NULL DEFAULT false | Se o status pausa o contador de SLA |

---

### 6.3 Ticket

**Schema:** `ticket`
**Objetivo:** Entidade base para todos os chamados do SGTI. Incidentes, Requisições e Problemas herdam desta entidade via `ticket_id`. Centraliza os campos comuns de rastreamento.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `number` | BIGSERIAL | UNIQUE NOT NULL | Número sequencial legível (ex: TKT-2026-001234) |
| `type` | ENUM | NOT NULL | `INCIDENT`, `REQUEST`, `PROBLEM` |
| `title` | VARCHAR(500) | NOT NULL | Título do chamado |
| `description` | TEXT | NOT NULL | Descrição detalhada |
| `status_id` | UUID | FK NOT NULL | → `ticket.TicketStatus` |
| `priority_id` | UUID | FK NOT NULL | → `ticket.TicketPriority` |
| `catalog_id` | UUID | FK NULLABLE | → `catalog.ServiceCatalog` |
| `sla_id` | UUID | FK NULLABLE | → `catalog.SLA` |
| `requester_id` | UUID | FK NOT NULL | → `auth.User` (solicitante) |
| `assignee_id` | UUID | FK NULLABLE | → `auth.User` (técnico atribuído) |
| `group_id` | UUID | FK NULLABLE | → `identity.IdentityGroup` (grupo atribuído) |
| `department_id` | UUID | FK NULLABLE | → `org.Department` |
| `impact` | ENUM | NOT NULL | `WIDESPREAD`, `SIGNIFICANT`, `MODERATE`, `MINOR` |
| `urgency` | ENUM | NOT NULL | `CRITICAL`, `HIGH`, `MEDIUM`, `LOW` |
| `source` | ENUM | NOT NULL | `PORTAL`, `EMAIL`, `PHONE`, `API`, `SYSTEM`, `GLPI` |
| `sla_response_deadline` | TIMESTAMPTZ | NULLABLE | Prazo de primeiro atendimento |
| `sla_resolution_deadline` | TIMESTAMPTZ | NULLABLE | Prazo de resolução |
| `sla_paused_at` | TIMESTAMPTZ | NULLABLE | Momento de pausa do SLA |
| `sla_paused_total_minutes` | INTEGER | NOT NULL DEFAULT 0 | Total de minutos pausados |
| `responded_at` | TIMESTAMPTZ | NULLABLE | Quando houve o primeiro atendimento |
| `resolved_at` | TIMESTAMPTZ | NULLABLE | Quando foi resolvido |
| `closed_at` | TIMESTAMPTZ | NULLABLE | Quando foi fechado |
| `resolution_notes` | TEXT | NULLABLE | Notas de resolução |
| `kb_article_id` | UUID | FK NULLABLE | → `knowledge.KnowledgeArticle` (artigo vinculado) |
| `glpi_ticket_id` | VARCHAR(50) | NULLABLE | ID do ticket correspondente no GLPI |
| `glpi_synced_at` | TIMESTAMPTZ | NULLABLE | Última sincronização com GLPI |
| `csat_score` | SMALLINT | NULLABLE | Nota de satisfação pós-atendimento (1–5) |
| `csat_comment` | TEXT | NULLABLE | Comentário da avaliação |
| `metadata` | JSONB | NULLABLE | Campos customizados do formulário do catálogo |
| _campos base_ | — | — | campos base universais |

**Relacionamentos:**
- N:1 → `ticket.TicketStatus`
- N:1 → `ticket.TicketPriority`
- N:1 → `catalog.ServiceCatalog`
- N:1 → `catalog.SLA`
- N:1 → `auth.User` (requester, assignee)
- 1:N → `ticket.TicketComment`
- 1:N → `ticket.TicketAttachment`
- 1:N → `ticket.TransferHistory`
- 1:N → `catalog.SLAHistory`
- 1:1 → `incident.Incident` (quando type=INCIDENT)
- 1:1 → `request.Request` (quando type=REQUEST)
- 1:1 → `problem.Problem` (quando type=PROBLEM)

**Índices recomendados:**
- `UNIQUE` em `(tenant_id, number)`
- `INDEX` em `(tenant_id, type, status_id)`
- `INDEX` em `requester_id`
- `INDEX` em `assignee_id`
- `INDEX` em `sla_resolution_deadline` (job de monitoramento)
- `INDEX` em `glpi_ticket_id`
- `GIN` em `metadata`

---

### 6.4 TicketComment

**Schema:** `ticket`
**Objetivo:** Comentários e atualizações de andamento de um chamado. Inclui notas internas (visíveis apenas para técnicos) e atualizações públicas (visíveis ao solicitante).

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `ticket_id` | UUID | FK NOT NULL | → `ticket.Ticket` |
| `author_id` | UUID | FK NOT NULL | → `auth.User` |
| `content` | TEXT | NOT NULL | Conteúdo do comentário |
| `type` | ENUM | NOT NULL | `PUBLIC`, `INTERNAL`, `SYSTEM` |
| `source` | ENUM | NOT NULL | `USER`, `SYSTEM`, `GLPI_SYNC`, `AI_ASSISTANT` |
| `is_resolution` | BOOLEAN | NOT NULL DEFAULT false | true = este comentário é a resolução formal |
| _campos base_ | — | — | created_at, created_by (sem soft delete — comentários são imutáveis) |

**Índices recomendados:**
- `INDEX` em `ticket_id`
- `INDEX` em `(ticket_id, type)`

---

### 6.5 TicketAttachment

**Schema:** `ticket`
**Objetivo:** Referências a arquivos anexados a tickets, armazenados no Supabase Storage.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `ticket_id` | UUID | FK NOT NULL | → `ticket.Ticket` |
| `file_reference_id` | UUID | FK NOT NULL | → `shared.FileReference` |
| `uploader_id` | UUID | FK NOT NULL | → `auth.User` |
| `description` | VARCHAR(300) | NULLABLE | Descrição do arquivo |
| _campos base_ | — | — | created_at, created_by, deleted_at, deleted_by |

---

### 6.6 TransferHistory

**Schema:** `ticket`
**Objetivo:** Registra cada transferência de responsabilidade (técnico, grupo, departamento) de um chamado.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `ticket_id` | UUID | FK NOT NULL | → `ticket.Ticket` |
| `from_assignee_id` | UUID | FK NULLABLE | → `auth.User` (de quem saiu) |
| `to_assignee_id` | UUID | FK NULLABLE | → `auth.User` (para quem foi) |
| `from_group_id` | UUID | FK NULLABLE | → `identity.IdentityGroup` |
| `to_group_id` | UUID | FK NULLABLE | → `identity.IdentityGroup` |
| `reason` | TEXT | NOT NULL | Motivo da transferência |
| `type` | ENUM | NOT NULL | `MANUAL`, `ESCALATION`, `AUTO_RULE`, `GLPI_SYNC` |
| `transferred_by` | UUID | FK NOT NULL | → `auth.User` |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | — |

**Índices recomendados:**
- `INDEX` em `ticket_id`
- `INDEX` em `created_at`

---

## 7. Incidentes

### 7.1 Incident

**Schema:** `incident`
**Objetivo:** Extensão específica para incidentes. Complementa o `ticket.Ticket` (type=INCIDENT) com campos próprios da gestão de incidentes ITIL.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Mesmo ID do ticket base |
| `ticket_id` | UUID | FK UNIQUE NOT NULL | → `ticket.Ticket` (1:1) |
| `incident_number` | VARCHAR(20) | NOT NULL UNIQUE/tenant | Número legível (INC-2026-001234) |
| `classification` | ENUM | NOT NULL | `HARDWARE`, `SOFTWARE`, `NETWORK`, `ACCESS`, `PERFORMANCE`, `OTHER` |
| `affected_asset_id` | UUID | FK NULLABLE | → `asset.Asset` |
| `affected_service_count` | INTEGER | NOT NULL DEFAULT 1 | Quantidade de usuários/serviços afetados |
| `business_impact` | TEXT | NULLABLE | Impacto no negócio documentado |
| `workaround_applied` | BOOLEAN | NOT NULL DEFAULT false | Workaround aplicado |
| `workaround_description` | TEXT | NULLABLE | Descrição do workaround |
| `problem_id` | UUID | FK NULLABLE | → `problem.Problem` (incidente vinculado a problema) |
| _campos base_ | — | — | campos base universais |

**Relacionamentos:**
- 1:1 → `ticket.Ticket`
- N:1 → `asset.Asset`
- N:1 → `problem.Problem`
- 1:N → `incident.IncidentImpact`
- 1:N → `incident.IncidentCause`

**Índices recomendados:**
- `UNIQUE` em `ticket_id`
- `INDEX` em `affected_asset_id`
- `INDEX` em `problem_id`

---

### 7.2 IncidentImpact

**Schema:** `incident`
**Objetivo:** Registra os ativos, serviços e usuários impactados por um incidente.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `incident_id` | UUID | FK NOT NULL | → `incident.Incident` |
| `impact_type` | ENUM | NOT NULL | `ASSET`, `SERVICE`, `USER_GROUP`, `DEPARTMENT` |
| `reference_id` | UUID | NOT NULL | ID da entidade impactada (polymorphic) |
| `reference_type` | VARCHAR(50) | NOT NULL | Tipo da entidade impactada |
| `description` | TEXT | NULLABLE | Descrição do impacto |
| _campos base_ | — | — | created_at, created_by |

---

### 7.3 IncidentCause

**Schema:** `incident`
**Objetivo:** Registra as causas identificadas durante a investigação do incidente.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `incident_id` | UUID | FK NOT NULL | → `incident.Incident` |
| `category` | ENUM | NOT NULL | `HARDWARE_FAILURE`, `SOFTWARE_BUG`, `CONFIGURATION`, `HUMAN_ERROR`, `EXTERNAL`, `UNKNOWN` |
| `description` | TEXT | NOT NULL | Descrição da causa |
| `identified_by` | UUID | FK NOT NULL | → `auth.User` |
| `identified_at` | TIMESTAMPTZ | NOT NULL | Quando foi identificada |
| `is_root_cause` | BOOLEAN | NOT NULL DEFAULT false | Se é a causa raiz confirmada |
| _campos base_ | — | — | created_at, created_by |

---

## 8. Requisições

### 8.1 RequestType

**Schema:** `request`
**Objetivo:** Define tipos de requisição vinculados ao Catálogo de Serviços, com formulários dinâmicos e fluxos de aprovação configuráveis.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `catalog_id` | UUID | FK NOT NULL | → `catalog.ServiceCatalog` |
| `name` | VARCHAR(200) | NOT NULL | Nome do tipo de requisição |
| `form_schema` | JSONB | NOT NULL | Schema JSON dos campos do formulário |
| `approval_flow` | JSONB | NOT NULL | Fluxo de aprovação configurado |
| `sla_override_id` | UUID | FK NULLABLE | → `catalog.SLA` (SLA específico deste tipo) |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true | Tipo ativo |
| _campos base_ | — | — | campos base universais |

---

### 8.2 Request

**Schema:** `request`
**Objetivo:** Extensão específica para requisições de serviço. Complementa o `ticket.Ticket` (type=REQUEST).

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Mesmo ID do ticket base |
| `ticket_id` | UUID | FK UNIQUE NOT NULL | → `ticket.Ticket` (1:1) |
| `request_number` | VARCHAR(20) | NOT NULL UNIQUE/tenant | Número legível (REQ-2026-001234) |
| `request_type_id` | UUID | FK NOT NULL | → `request.RequestType` |
| `form_data` | JSONB | NOT NULL | Dados preenchidos no formulário |
| `fulfillment_notes` | TEXT | NULLABLE | Notas de execução |
| `current_approval_step` | INTEGER | NOT NULL DEFAULT 1 | Etapa de aprovação atual |
| `total_approval_steps` | INTEGER | NOT NULL DEFAULT 1 | Total de etapas configuradas |
| _campos base_ | — | — | campos base universais |

**Relacionamentos:**
- 1:1 → `ticket.Ticket`
- 1:N → `request.Approval`

---

### 8.3 Approval

**Schema:** `request`
**Objetivo:** Representa uma etapa de aprovação em uma requisição.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `request_id` | UUID | FK NOT NULL | → `request.Request` |
| `step_number` | INTEGER | NOT NULL | Número da etapa |
| `approver_id` | UUID | FK NULLABLE | → `auth.User` (aprovador específico) |
| `approver_role` | ENUM | NULLABLE | Papel mínimo para aprovar (quando não há aprovador fixo) |
| `decision` | ENUM | NULLABLE | `APPROVED`, `REJECTED`, `DELEGATED`, `PENDING` |
| `decided_by` | UUID | FK NULLABLE | → `auth.User` (quem decidiu) |
| `decided_at` | TIMESTAMPTZ | NULLABLE | Quando foi decidido |
| `delegated_to` | UUID | FK NULLABLE | → `auth.User` (para quem foi delegado) |
| `deadline` | TIMESTAMPTZ | NULLABLE | Prazo para decisão |
| `notes` | TEXT | NULLABLE | Notas da decisão |
| _campos base_ | — | — | created_at, created_by |

**Índices recomendados:**
- `INDEX` em `request_id`
- `INDEX` em `(approver_id, decision)` WHERE decision IS NULL

---

### 8.4 ApprovalHistory

**Schema:** `request`
**Objetivo:** Histórico completo de todas as ações tomadas em um fluxo de aprovação.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `approval_id` | UUID | FK NOT NULL | → `request.Approval` |
| `action` | ENUM | NOT NULL | `SUBMITTED`, `APPROVED`, `REJECTED`, `DELEGATED`, `REMINDER_SENT`, `AUTO_EXPIRED` |
| `actor_id` | UUID | FK NULLABLE | → `auth.User` |
| `comment` | TEXT | NULLABLE | Comentário da ação |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | — |

---

## 9. Problemas

### 9.1 Problem

**Schema:** `problem`
**Objetivo:** Gestão de problemas — investigação de causa raiz de incidentes recorrentes ou de alto impacto.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Mesmo ID do ticket base |
| `ticket_id` | UUID | FK UNIQUE NOT NULL | → `ticket.Ticket` (1:1) |
| `problem_number` | VARCHAR(20) | NOT NULL UNIQUE/tenant | Número legível (PRB-2026-000123) |
| `status` | ENUM | NOT NULL | `UNDER_INVESTIGATION`, `ROOT_CAUSE_IDENTIFIED`, `KNOWN_ERROR`, `RESOLVED` |
| `root_cause_method` | ENUM | NULLABLE | `FIVE_WHYS`, `FISHBONE`, `FAULT_TREE`, `TIMELINE` |
| `is_known_error` | BOOLEAN | NOT NULL DEFAULT false | Registrado como erro conhecido |
| `known_error_title` | VARCHAR(300) | NULLABLE | Título do Known Error para exibição |
| _campos base_ | — | — | campos base universais |

**Relacionamentos:**
- 1:1 → `ticket.Ticket`
- 1:N → `problem.RootCause`
- 1:N → `problem.Workaround`
- 1:N → `incident.Incident` (incidentes vinculados a este problema)

---

### 9.2 RootCause

**Schema:** `problem`
**Objetivo:** Registra a análise de causa raiz de um problema.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `problem_id` | UUID | FK NOT NULL | → `problem.Problem` |
| `description` | TEXT | NOT NULL | Descrição da causa raiz identificada |
| `analysis` | TEXT | NOT NULL | Análise detalhada (método e evidências) |
| `confirmed` | BOOLEAN | NOT NULL DEFAULT false | Causa raiz confirmada |
| `confirmed_by` | UUID | FK NULLABLE | → `auth.User` |
| `confirmed_at` | TIMESTAMPTZ | NULLABLE | Quando foi confirmada |
| `solution_description` | TEXT | NULLABLE | Solução definitiva para esta causa raiz |
| `solution_implemented` | BOOLEAN | NOT NULL DEFAULT false | Solução implementada |
| _campos base_ | — | — | campos base universais |

---

### 9.3 Workaround

**Schema:** `problem`
**Objetivo:** Solução temporária para um problema enquanto a solução definitiva não está disponível.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `problem_id` | UUID | FK NOT NULL | → `problem.Problem` |
| `title` | VARCHAR(300) | NOT NULL | Título do workaround |
| `description` | TEXT | NOT NULL | Passos detalhados do workaround |
| `limitations` | TEXT | NULLABLE | Limitações e casos onde não funciona |
| `status` | ENUM | NOT NULL | `DRAFT`, `PUBLISHED`, `DEPRECATED` |
| `published_at` | TIMESTAMPTZ | NULLABLE | Quando foi publicado |
| `published_by` | UUID | FK NULLABLE | → `auth.User` |
| `kb_article_id` | UUID | FK NULLABLE | → `knowledge.KnowledgeArticle` (artigo gerado) |
| _campos base_ | — | — | campos base universais |

---

## 10. Ativos

### 10.1 AssetCategory

**Schema:** `asset`
**Objetivo:** Hierarquia de categorias de ativos para organização do inventário.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `name` | VARCHAR(100) | NOT NULL | Nome da categoria |
| `code` | VARCHAR(20) | NOT NULL UNIQUE/tenant | Código interno |
| `parent_id` | UUID | FK NULLABLE | → `asset.AssetCategory` (hierarquia) |
| `depreciation_years` | SMALLINT | NULLABLE | Anos de vida útil padrão para depreciação |
| `depreciation_method` | ENUM | NULLABLE | `STRAIGHT_LINE`, `DECLINING_BALANCE` |
| `fields_schema` | JSONB | NULLABLE | Campos customizados por categoria |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true | Categoria ativa |
| _campos base_ | — | — | campos base universais |

---

### 10.2 Asset

**Schema:** `asset`
**Objetivo:** Entidade central do módulo ITAM — representa cada ativo físico ou lógico de TI.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `category_id` | UUID | FK NOT NULL | → `asset.AssetCategory` |
| `asset_tag` | VARCHAR(50) | NOT NULL UNIQUE/tenant | Etiqueta patrimonial |
| `name` | VARCHAR(300) | NOT NULL | Nome/descrição do ativo |
| `serial_number` | VARCHAR(100) | NULLABLE UNIQUE/tenant | Número de série |
| `model` | VARCHAR(200) | NULLABLE | Modelo do ativo |
| `manufacturer` | VARCHAR(200) | NULLABLE | Fabricante |
| `status` | ENUM | NOT NULL | `ORDERED`, `RECEIVED`, `IN_STOCK`, `ALLOCATED`, `IN_USE`, `UNDER_MAINTENANCE`, `DECOMMISSIONED`, `DISPOSED` |
| `location` | VARCHAR(300) | NULLABLE | Localização física atual |
| `department_id` | UUID | FK NULLABLE | → `org.Department` |
| `cost_center_id` | UUID | FK NULLABLE | → `org.CostCenter` |
| `purchase_date` | DATE | NULLABLE | Data de aquisição |
| `purchase_value` | DECIMAL(15,2) | NULLABLE | Valor de aquisição |
| `current_value` | DECIMAL(15,2) | NULLABLE | Valor atual (após depreciação) |
| `warranty_start` | DATE | NULLABLE | Início da garantia |
| `warranty_end` | DATE | NULLABLE | Fim da garantia |
| `warranty_provider` | VARCHAR(200) | NULLABLE | Fornecedor da garantia |
| `contract_id` | UUID | FK NULLABLE | → `finance.Contract` |
| `supplier_id` | UUID | FK NULLABLE | → `finance.Supplier` |
| `notes` | TEXT | NULLABLE | Observações |
| `custom_fields` | JSONB | NULLABLE | Campos customizados da categoria |
| `glpi_computer_id` | INTEGER | NULLABLE | ID no GLPI |
| `glpi_synced_at` | TIMESTAMPTZ | NULLABLE | Última sync com GLPI |
| _campos base_ | — | — | campos base universais |

**Relacionamentos:**
- N:1 → `asset.AssetCategory`
- N:1 → `org.Department`
- N:1 → `finance.Contract`
- N:1 → `finance.Supplier`
- 1:N → `asset.AssetAssignment`
- 1:N → `asset.AssetMovement`
- 1:N → `asset.AssetMaintenance`
- 1:1 → `asset.GlpiAssetReference`

**Índices recomendados:**
- `UNIQUE` em `(tenant_id, asset_tag)`
- `INDEX` em `status`
- `INDEX` em `warranty_end` (job de alertas)
- `INDEX` em `department_id`

---

### 10.3 AssetAssignment

**Schema:** `asset`
**Objetivo:** Registra a atribuição de um ativo a um usuário ou local.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `asset_id` | UUID | FK NOT NULL | → `asset.Asset` |
| `user_id` | UUID | FK NULLABLE | → `auth.User` (responsável) |
| `location` | VARCHAR(300) | NULLABLE | Localização (quando não atribuído a usuário) |
| `assigned_at` | TIMESTAMPTZ | NOT NULL | Data de atribuição |
| `returned_at` | TIMESTAMPTZ | NULLABLE | Data de devolução (null = em uso) |
| `condition_on_assign` | ENUM | NOT NULL | `NEW`, `GOOD`, `REGULAR`, `DAMAGED` |
| `condition_on_return` | ENUM | NULLABLE | Condição na devolução |
| `notes` | TEXT | NULLABLE | Observações |
| `assigned_by` | UUID | FK NOT NULL | → `auth.User` |
| `returned_by` | UUID | FK NULLABLE | → `auth.User` |
| _campos base_ | — | — | created_at, created_by, deleted_at, deleted_by |

**Índices recomendados:**
- `INDEX` em `asset_id`
- `INDEX` em `user_id`
- `INDEX` em `returned_at` WHERE `returned_at IS NULL` (atribuições ativas)

---

### 10.4 AssetMovement

**Schema:** `asset`
**Objetivo:** Registra movimentações físicas de ativos entre localizações.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `asset_id` | UUID | FK NOT NULL | → `asset.Asset` |
| `from_location` | VARCHAR(300) | NOT NULL | Localização de origem |
| `to_location` | VARCHAR(300) | NOT NULL | Localização de destino |
| `moved_at` | TIMESTAMPTZ | NOT NULL | Quando ocorreu a movimentação |
| `reason` | TEXT | NOT NULL | Motivo da movimentação |
| `moved_by` | UUID | FK NOT NULL | → `auth.User` |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | — |

---

### 10.5 AssetMaintenance

**Schema:** `asset`
**Objetivo:** Registra manutenções preventivas e corretivas de ativos.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `asset_id` | UUID | FK NOT NULL | → `asset.Asset` |
| `type` | ENUM | NOT NULL | `PREVENTIVE`, `CORRECTIVE`, `UPGRADE`, `INSPECTION` |
| `status` | ENUM | NOT NULL | `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| `scheduled_for` | DATE | NOT NULL | Data programada |
| `started_at` | TIMESTAMPTZ | NULLABLE | Início real |
| `completed_at` | TIMESTAMPTZ | NULLABLE | Conclusão real |
| `provider` | VARCHAR(200) | NULLABLE | Empresa/técnico responsável |
| `cost` | DECIMAL(10,2) | NULLABLE | Custo da manutenção |
| `description` | TEXT | NOT NULL | Descrição do serviço |
| `result` | TEXT | NULLABLE | Resultado/observações pós-manutenção |
| `ticket_id` | UUID | FK NULLABLE | → `ticket.Ticket` (chamado vinculado) |
| _campos base_ | — | — | campos base universais |

---

### 10.6 GlpiAssetReference

**Schema:** `asset`
**Objetivo:** Mantém a referência bidirecional entre um ativo do SGTI e o registro correspondente no GLPI.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `asset_id` | UUID | FK UNIQUE NOT NULL | → `asset.Asset` (1:1) |
| `glpi_item_type` | VARCHAR(50) | NOT NULL | Tipo no GLPI (Computer, Monitor, Printer...) |
| `glpi_item_id` | INTEGER | NOT NULL | ID no GLPI |
| `last_sync_at` | TIMESTAMPTZ | NOT NULL | Última sincronização |
| `sync_status` | ENUM | NOT NULL | `SYNCED`, `PENDING`, `ERROR`, `CONFLICT` |
| `sync_error` | TEXT | NULLABLE | Mensagem de erro da última sync |
| `glpi_data_snapshot` | JSONB | NULLABLE | Snapshot dos dados GLPI no último sync |
| _campos base_ | — | — | created_at, updated_at, created_by |

---

## 11. Identidades

### 11.1 Identity

**Schema:** `identity`
**Objetivo:** Espelho da identidade digital do colaborador no módulo IAM. Complementa o `auth.User` com dados de gestão de acesso.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Mesmo ID do auth.User |
| `user_id` | UUID | FK UNIQUE NOT NULL | → `auth.User` (1:1) |
| `employee_id` | VARCHAR(50) | NULLABLE UNIQUE/tenant | Matrícula do colaborador |
| `job_title` | VARCHAR(200) | NULLABLE | Cargo |
| `department_id` | UUID | FK NULLABLE | → `org.Department` |
| `manager_id` | UUID | FK NULLABLE | → `identity.Identity` (gestor direto) |
| `hire_date` | DATE | NULLABLE | Data de admissão |
| `termination_date` | DATE | NULLABLE | Data de desligamento |
| `iam_status` | ENUM | NOT NULL | `ACTIVE`, `INACTIVE`, `SUSPENDED`, `PENDING_PROVISIONING`, `PENDING_DEPROVISIONING` |
| `last_access_review_at` | TIMESTAMPTZ | NULLABLE | Última revisão de acesso concluída |
| `next_access_review_due` | DATE | NULLABLE | Próxima revisão de acesso programada |
| `provisioning_completed_at` | TIMESTAMPTZ | NULLABLE | Quando o provisionamento foi concluído |
| `deprovisioning_completed_at` | TIMESTAMPTZ | NULLABLE | Quando o desprovisionamento foi concluído |
| `notes` | TEXT | NULLABLE | Observações de RH ou TI |
| _campos base_ | — | — | campos base universais |

**Relacionamentos:**
- 1:1 → `auth.User`
- N:1 → `org.Department`
- N:N → `identity.IdentityGroup`
- 1:N → `identity.IdentityPermission`
- 1:1 → `identity.GoogleUserReference`

---

### 11.2 IdentityGroup

**Schema:** `identity`
**Objetivo:** Grupos de usuários para atribuição coletiva de permissões e roteamento de chamados.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `name` | VARCHAR(200) | NOT NULL UNIQUE/tenant | Nome do grupo |
| `description` | TEXT | NULLABLE | Descrição e finalidade do grupo |
| `type` | ENUM | NOT NULL | `SUPPORT_GROUP`, `APPROVAL_GROUP`, `DISTRIBUTION_LIST`, `GOOGLE_WORKSPACE_GROUP` |
| `google_group_email` | VARCHAR(255) | NULLABLE | E-mail do grupo Google Workspace (quando sincronizado) |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true | Grupo ativo |
| _campos base_ | — | — | campos base universais |

**Relacionamentos:**
- N:N → `identity.Identity` via tabela de vínculo

---

### 11.3 IdentityPermission

**Schema:** `identity`
**Objetivo:** Permissões de acesso concedidas a usuários específicos (além das herdadas pelo papel).

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `identity_id` | UUID | FK NOT NULL | → `identity.Identity` |
| `module` | VARCHAR(50) | NOT NULL | Módulo do sistema |
| `resource` | VARCHAR(100) | NOT NULL | Recurso específico |
| `action` | ENUM | NOT NULL | `CREATE`, `READ`, `UPDATE`, `DELETE`, `APPROVE`, `EXPORT` |
| `granted_by` | UUID | FK NOT NULL | → `auth.User` |
| `granted_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Data da concessão |
| `expires_at` | TIMESTAMPTZ | NULLABLE | Expiração (null = permanente) |
| `reason` | TEXT | NOT NULL | Justificativa da concessão |
| `revoked_by` | UUID | FK NULLABLE | → `auth.User` |
| `revoked_at` | TIMESTAMPTZ | NULLABLE | Data de revogação |
| _campos base_ | — | — | created_at, created_by |

---

### 11.4 GoogleUserReference

**Schema:** `identity`
**Objetivo:** Referência bidirecional entre a identidade do SGTI e a conta Google Workspace correspondente.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `identity_id` | UUID | FK UNIQUE NOT NULL | → `identity.Identity` (1:1) |
| `google_user_id` | VARCHAR(255) | NOT NULL UNIQUE | ID único do usuário no Google |
| `google_email` | VARCHAR(255) | NOT NULL | E-mail Google (pode ser alias) |
| `google_org_unit` | VARCHAR(500) | NULLABLE | Unidade organizacional no Google |
| `google_admin_role` | VARCHAR(100) | NULLABLE | Papel admin no Google (se houver) |
| `last_sync_at` | TIMESTAMPTZ | NOT NULL | Última sincronização |
| `sync_status` | ENUM | NOT NULL | `SYNCED`, `PENDING`, `ERROR` |
| `google_account_suspended` | BOOLEAN | NOT NULL DEFAULT false | Se a conta Google está suspensa |
| `google_data_snapshot` | JSONB | NULLABLE | Snapshot dos dados Google no último sync |
| _campos base_ | — | — | created_at, updated_at, created_by |

---

## 12. Compliance

### 12.1 AuditCompany

**Schema:** `compliance`
**Objetivo:** Empresas auditoras ou consultoras externas envolvidas em processos de auditoria.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `name` | VARCHAR(300) | NOT NULL | Nome da empresa auditora |
| `cnpj` | CHAR(18) | NULLABLE | CNPJ da empresa |
| `contact_name` | VARCHAR(200) | NULLABLE | Nome do contato principal |
| `contact_email` | VARCHAR(255) | NULLABLE | E-mail do contato |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true | Empresa ativa |
| _campos base_ | — | — | campos base universais |

---

### 12.2 Norm

**Schema:** `compliance`
**Objetivo:** Norma, lei ou framework de compliance referenciado nos processos de auditoria.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `name` | VARCHAR(200) | NOT NULL | Nome da norma (ex: ISO/IEC 27001:2022) |
| `short_name` | VARCHAR(50) | NOT NULL | Abreviação (ex: ISO27001) |
| `type` | ENUM | NOT NULL | `ISO`, `LEGAL`, `REGULATORY`, `INTERNAL`, `FRAMEWORK` |
| `description` | TEXT | NULLABLE | Descrição da norma |
| `version` | VARCHAR(50) | NOT NULL | Versão da norma |
| `effective_date` | DATE | NOT NULL | Data de vigência |
| `version_number` | INTEGER | NOT NULL DEFAULT 1 | Versão no SGTI |
| `is_current` | BOOLEAN | NOT NULL DEFAULT true | Versão vigente |
| _campos base_ | — | — | campos base universais |

**Relacionamentos:**
- 1:N → `compliance.NormItem`
- N:N → `compliance.Audit`

---

### 12.3 NormItem

**Schema:** `compliance`
**Objetivo:** Item específico de uma norma (controle, artigo, cláusula).

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `norm_id` | UUID | FK NOT NULL | → `compliance.Norm` |
| `code` | VARCHAR(50) | NOT NULL | Código do item (ex: A.8.1, Art.46) |
| `title` | VARCHAR(300) | NOT NULL | Título do controle/artigo |
| `description` | TEXT | NOT NULL | Descrição detalhada do requisito |
| `parent_id` | UUID | FK NULLABLE | → `compliance.NormItem` (hierarquia) |
| `domain` | VARCHAR(100) | NULLABLE | Domínio temático (ex: Segurança de Ativos) |
| `is_applicable` | BOOLEAN | NOT NULL DEFAULT true | Aplicável à organização |
| `not_applicable_reason` | TEXT | NULLABLE | Justificativa de não-aplicabilidade |
| _campos base_ | — | — | campos base universais |

---

### 12.4 Audit

**Schema:** `compliance`
**Objetivo:** Registro de um ciclo de auditoria completo.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `title` | VARCHAR(300) | NOT NULL | Título da auditoria |
| `type` | ENUM | NOT NULL | `INTERNAL`, `EXTERNAL`, `REGULATORY`, `SELF_ASSESSMENT` |
| `status` | ENUM | NOT NULL | `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| `audit_company_id` | UUID | FK NULLABLE | → `compliance.AuditCompany` (auditoria externa) |
| `lead_auditor_id` | UUID | FK NULLABLE | → `auth.User` |
| `responsible_id` | UUID | FK NOT NULL | → `auth.User` (responsável interno) |
| `scope` | TEXT | NOT NULL | Escopo da auditoria |
| `planned_start` | DATE | NOT NULL | Início planejado |
| `planned_end` | DATE | NOT NULL | Fim planejado |
| `actual_start` | DATE | NULLABLE | Início real |
| `actual_end` | DATE | NULLABLE | Fim real |
| `maturity_score` | DECIMAL(5,2) | NULLABLE | Score de maturidade resultante (0–100) |
| `executive_summary` | TEXT | NULLABLE | Resumo executivo gerado ao final |
| `previous_audit_id` | UUID | FK NULLABLE | → `compliance.Audit` (auditoria anterior para comparativo) |
| _campos base_ | — | — | campos base universais |

**Relacionamentos:**
- N:N → `compliance.Norm`
- 1:N → `compliance.ComplianceFinding`

---

### 12.5 ComplianceFinding

**Schema:** `compliance`
**Objetivo:** Achado de auditoria — não-conformidade, oportunidade de melhoria ou conformidade identificada.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `audit_id` | UUID | FK NOT NULL | → `compliance.Audit` |
| `norm_item_id` | UUID | FK NULLABLE | → `compliance.NormItem` |
| `title` | VARCHAR(300) | NOT NULL | Título do achado |
| `description` | TEXT | NOT NULL | Descrição detalhada |
| `type` | ENUM | NOT NULL | `NON_CONFORMANCE`, `OBSERVATION`, `OPPORTUNITY`, `POSITIVE_FINDING` |
| `severity` | ENUM | NULLABLE | `CRITICAL`, `MAJOR`, `MINOR`, `OBSERVATION` (apenas para NC) |
| `status` | ENUM | NOT NULL | `OPEN`, `IN_TREATMENT`, `RESOLVED`, `ACCEPTED_RISK` |
| `responsible_id` | UUID | FK NULLABLE | → `auth.User` |
| `due_date` | DATE | NULLABLE | Prazo para tratamento |
| `resolved_at` | TIMESTAMPTZ | NULLABLE | Data de resolução |
| `resolution_description` | TEXT | NULLABLE | Descrição da solução implementada |
| _campos base_ | — | — | campos base universais |

**Relacionamentos:**
- N:1 → `compliance.Audit`
- 1:N → `compliance.ComplianceEvidence`
- 1:1 → `compliance.ComplianceActionPlan`

---

### 12.6 ComplianceEvidence

**Schema:** `compliance`
**Objetivo:** Evidências coletadas para demonstrar conformidade ou embasar um achado.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `finding_id` | UUID | FK NOT NULL | → `compliance.ComplianceFinding` |
| `file_reference_id` | UUID | FK NULLABLE | → `shared.FileReference` |
| `description` | TEXT | NOT NULL | Descrição da evidência |
| `evidence_type` | ENUM | NOT NULL | `DOCUMENT`, `SCREENSHOT`, `LOG`, `REPORT`, `INTERVIEW`, `OBSERVATION` |
| `collected_at` | TIMESTAMPTZ | NOT NULL | Quando foi coletada |
| `file_hash` | VARCHAR(64) | NULLABLE | SHA-256 do arquivo para integridade |
| `review_status` | ENUM | NOT NULL | `PENDING`, `APPROVED`, `REJECTED` |
| `reviewed_by` | UUID | FK NULLABLE | → `auth.User` |
| `reviewed_at` | TIMESTAMPTZ | NULLABLE | Quando foi revisada |
| _campos base_ | — | — | campos base universais |

---

### 12.7 ComplianceActionPlan

**Schema:** `compliance`
**Objetivo:** Plano de ação para tratamento de não-conformidade.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `finding_id` | UUID | FK UNIQUE NOT NULL | → `compliance.ComplianceFinding` (1:1) |
| `responsible_id` | UUID | FK NOT NULL | → `auth.User` |
| `actions` | JSONB | NOT NULL | Lista de ações planejadas `[{description, due_date, completed_at}]` |
| `root_cause_analysis` | TEXT | NULLABLE | Análise de causa raiz do achado |
| `status` | ENUM | NOT NULL | `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `OVERDUE` |
| `target_date` | DATE | NOT NULL | Data alvo para conclusão |
| `completed_at` | TIMESTAMPTZ | NULLABLE | Data de conclusão real |
| `effectiveness_check` | TEXT | NULLABLE | Verificação de eficácia após implementação |
| _campos base_ | — | — | campos base universais |

---

## 13. Financeiro

### 13.1 Supplier

**Schema:** `finance`
**Objetivo:** Cadastro de fornecedores de TI com histórico de compras e avaliações.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `name` | VARCHAR(300) | NOT NULL | Razão social |
| `trade_name` | VARCHAR(300) | NULLABLE | Nome fantasia |
| `cnpj` | CHAR(18) | NULLABLE UNIQUE/tenant | CNPJ |
| `category` | ENUM | NOT NULL | `HARDWARE`, `SOFTWARE`, `SERVICE`, `CLOUD`, `TELECOM`, `OTHER` |
| `contact_name` | VARCHAR(200) | NULLABLE | Nome do contato principal |
| `contact_email` | VARCHAR(255) | NULLABLE | E-mail do contato |
| `contact_phone` | VARCHAR(20) | NULLABLE | Telefone do contato |
| `address` | JSONB | NULLABLE | Endereço completo |
| `rating` | SMALLINT | NULLABLE | Avaliação geral (1–5) |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true | Fornecedor ativo |
| `notes` | TEXT | NULLABLE | Observações |
| _campos base_ | — | — | campos base universais |

---

### 13.2 Contract

**Schema:** `finance`
**Objetivo:** Contratos com fornecedores de TI com controle de vigência e alertas de vencimento.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `supplier_id` | UUID | FK NOT NULL | → `finance.Supplier` |
| `number` | VARCHAR(100) | NOT NULL | Número do contrato |
| `title` | VARCHAR(300) | NOT NULL | Título/objeto do contrato |
| `type` | ENUM | NOT NULL | `LICENSE`, `MAINTENANCE`, `SERVICE`, `LEASING`, `SUPPORT`, `OTHER` |
| `status` | ENUM | NOT NULL | `DRAFT`, `ACTIVE`, `EXPIRING_SOON`, `EXPIRED`, `CANCELLED`, `RENEWED` |
| `start_date` | DATE | NOT NULL | Data de início |
| `end_date` | DATE | NOT NULL | Data de término |
| `renewal_date` | DATE | NULLABLE | Data de renovação automática |
| `value` | DECIMAL(15,2) | NOT NULL | Valor total do contrato |
| `payment_frequency` | ENUM | NOT NULL | `MONTHLY`, `QUARTERLY`, `ANNUAL`, `ONE_TIME` |
| `auto_renew` | BOOLEAN | NOT NULL DEFAULT false | Renovação automática |
| `alert_days_before` | SMALLINT | NOT NULL DEFAULT 90 | Dias antes do vencimento para alerta |
| `cost_center_id` | UUID | FK NULLABLE | → `org.CostCenter` |
| `responsible_id` | UUID | FK NOT NULL | → `auth.User` |
| `file_reference_id` | UUID | FK NULLABLE | → `shared.FileReference` (documento digitalizado) |
| `notes` | TEXT | NULLABLE | Observações |
| `renewed_by` | UUID | FK NULLABLE | → `finance.Contract` (contrato renovado) |
| _campos base_ | — | — | campos base universais |

**Índices recomendados:**
- `INDEX` em `end_date` (job de alertas)
- `INDEX` em `supplier_id`
- `INDEX` em `status`

---

### 13.3 Budget

**Schema:** `finance`
**Objetivo:** Orçamento anual de TI por tipo (CAPEX/OPEX) e centro de custo.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `fiscal_year` | SMALLINT | NOT NULL | Ano fiscal |
| `type` | ENUM | NOT NULL | `CAPEX`, `OPEX` |
| `cost_center_id` | UUID | FK NOT NULL | → `org.CostCenter` |
| `total_amount` | DECIMAL(15,2) | NOT NULL | Valor total orçado |
| `approved_by` | UUID | FK NULLABLE | → `auth.User` |
| `approved_at` | TIMESTAMPTZ | NULLABLE | Data de aprovação |
| `status` | ENUM | NOT NULL | `DRAFT`, `APPROVED`, `ACTIVE`, `CLOSED` |
| `notes` | TEXT | NULLABLE | Observações |
| _campos base_ | — | — | campos base universais |

**Relacionamentos:**
- 1:N → `finance.BudgetItem`
- 1:N → `finance.OpexExpense`
- 1:N → `finance.CapexInvestment`

---

### 13.4 BudgetItem

**Schema:** `finance`
**Objetivo:** Itens detalhados de um orçamento (quebra por categoria de despesa).

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `budget_id` | UUID | FK NOT NULL | → `finance.Budget` |
| `category` | VARCHAR(200) | NOT NULL | Categoria da despesa (ex: Licenças, Hardware) |
| `description` | TEXT | NOT NULL | Descrição do item |
| `planned_amount` | DECIMAL(15,2) | NOT NULL | Valor planejado |
| `month` | SMALLINT | NULLABLE | Mês (1–12) para sazonalidade (null = distribuído igualmente) |
| `notes` | TEXT | NULLABLE | Observações |
| _campos base_ | — | — | created_at, created_by |

---

### 13.5 CostAllocation

**Schema:** `finance`
**Objetivo:** Rateio de custos de TI por unidade de negócio.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `period` | DATE | NOT NULL | Período de referência (primeiro dia do mês) |
| `business_unit_id` | UUID | FK NOT NULL | → `org.BusinessUnit` |
| `total_allocated` | DECIMAL(15,2) | NOT NULL | Valor total alocado no período |
| `allocation_basis` | ENUM | NOT NULL | `USER_COUNT`, `ASSET_COUNT`, `TICKET_VOLUME`, `MANUAL` |
| `allocation_percentage` | DECIMAL(5,2) | NULLABLE | % do total de TI alocado a esta BU |
| `notes` | TEXT | NULLABLE | Observações |
| _campos base_ | — | — | created_at, created_by |

---

### 13.6 OpexExpense

**Schema:** `finance`
**Objetivo:** Registro de despesas operacionais recorrentes de TI.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `budget_id` | UUID | FK NULLABLE | → `finance.Budget` |
| `cost_center_id` | UUID | FK NOT NULL | → `org.CostCenter` |
| `supplier_id` | UUID | FK NULLABLE | → `finance.Supplier` |
| `contract_id` | UUID | FK NULLABLE | → `finance.Contract` |
| `category` | VARCHAR(200) | NOT NULL | Categoria da despesa |
| `description` | TEXT | NOT NULL | Descrição da despesa |
| `amount` | DECIMAL(15,2) | NOT NULL | Valor da despesa |
| `expense_date` | DATE | NOT NULL | Data de competência |
| `invoice_number` | VARCHAR(100) | NULLABLE | Número da nota fiscal/fatura |
| `payment_date` | DATE | NULLABLE | Data de pagamento |
| `status` | ENUM | NOT NULL | `PENDING`, `APPROVED`, `PAID`, `CANCELLED` |
| `approved_by` | UUID | FK NULLABLE | → `auth.User` |
| `file_reference_id` | UUID | FK NULLABLE | → `shared.FileReference` (NF digitalizada) |
| _campos base_ | — | — | campos base universais |

---

### 13.7 CapexInvestment

**Schema:** `finance`
**Objetivo:** Registro de investimentos de capital (aquisição de ativos, projetos).

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `budget_id` | UUID | FK NULLABLE | → `finance.Budget` |
| `cost_center_id` | UUID | FK NOT NULL | → `org.CostCenter` |
| `asset_id` | UUID | FK NULLABLE | → `asset.Asset` (quando vinculado a ativo) |
| `project_id` | UUID | FK NULLABLE | → `project.Project` (quando vinculado a projeto) |
| `description` | TEXT | NOT NULL | Descrição do investimento |
| `amount` | DECIMAL(15,2) | NOT NULL | Valor do investimento |
| `investment_date` | DATE | NOT NULL | Data do investimento |
| `depreciation_years` | SMALLINT | NULLABLE | Anos de vida útil para depreciação |
| `depreciation_start` | DATE | NULLABLE | Início da depreciação |
| `status` | ENUM | NOT NULL | `PLANNED`, `APPROVED`, `REALIZED`, `CANCELLED` |
| `approved_by` | UUID | FK NULLABLE | → `auth.User` |
| _campos base_ | — | — | campos base universais |

---

## 14. Projetos

### 14.1 Project

**Schema:** `project`
**Objetivo:** Gestão de projetos de TI com controle de escopo, prazo, orçamento e riscos.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `name` | VARCHAR(300) | NOT NULL | Nome do projeto |
| `code` | VARCHAR(30) | NOT NULL UNIQUE/tenant | Código do projeto |
| `description` | TEXT | NOT NULL | Descrição e objetivos |
| `status` | ENUM | NOT NULL | `IDEATION`, `APPROVED`, `IN_PROGRESS`, `ON_HOLD`, `COMPLETED`, `CANCELLED` |
| `phase` | ENUM | NOT NULL | `INITIATION`, `PLANNING`, `EXECUTION`, `MONITORING`, `CLOSURE` |
| `sponsor_id` | UUID | FK NOT NULL | → `auth.User` (patrocinador) |
| `manager_id` | UUID | FK NOT NULL | → `auth.User` (gerente de projeto) |
| `planned_start` | DATE | NOT NULL | Início planejado |
| `planned_end` | DATE | NOT NULL | Fim planejado |
| `actual_start` | DATE | NULLABLE | Início real |
| `actual_end` | DATE | NULLABLE | Fim real |
| `budget_amount` | DECIMAL(15,2) | NULLABLE | Orçamento aprovado |
| `spent_amount` | DECIMAL(15,2) | NOT NULL DEFAULT 0 | Valor gasto até o momento |
| `health` | ENUM | NOT NULL DEFAULT 'GREEN' | `GREEN`, `YELLOW`, `RED` |
| `health_justification` | TEXT | NULLABLE | Justificativa do status de saúde |
| `github_repos` | TEXT[] | NULLABLE | Repositórios GitHub vinculados |
| _campos base_ | — | — | campos base universais |

**Relacionamentos:**
- 1:N → `project.ProjectTask`
- 1:N → `project.ProjectCost`
- 1:N → `finance.CapexInvestment`

---

### 14.2 ProjectTask

**Schema:** `project`
**Objetivo:** Tarefas e marcos de um projeto.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `project_id` | UUID | FK NOT NULL | → `project.Project` |
| `parent_id` | UUID | FK NULLABLE | → `project.ProjectTask` (hierarquia) |
| `title` | VARCHAR(300) | NOT NULL | Título da tarefa |
| `description` | TEXT | NULLABLE | Descrição detalhada |
| `type` | ENUM | NOT NULL | `MILESTONE`, `TASK`, `DELIVERABLE` |
| `status` | ENUM | NOT NULL | `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `DELAYED`, `CANCELLED` |
| `assignee_id` | UUID | FK NULLABLE | → `auth.User` |
| `planned_start` | DATE | NULLABLE | Início planejado |
| `planned_end` | DATE | NOT NULL | Conclusão planejada |
| `actual_end` | DATE | NULLABLE | Conclusão real |
| `completion_percentage` | SMALLINT | NOT NULL DEFAULT 0 | % de conclusão (0–100) |
| `order` | INTEGER | NOT NULL DEFAULT 0 | Ordem de exibição |
| _campos base_ | — | — | campos base universais |

---

### 14.3 ProjectCost

**Schema:** `project`
**Objetivo:** Custos incorridos em um projeto.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `project_id` | UUID | FK NOT NULL | → `project.Project` |
| `type` | ENUM | NOT NULL | `LABOR`, `LICENSE`, `HARDWARE`, `SERVICE`, `OTHER` |
| `description` | TEXT | NOT NULL | Descrição do custo |
| `amount` | DECIMAL(15,2) | NOT NULL | Valor |
| `incurred_date` | DATE | NOT NULL | Data de incorrência |
| `expense_id` | UUID | FK NULLABLE | → `finance.OpexExpense` |
| `investment_id` | UUID | FK NULLABLE | → `finance.CapexInvestment` |
| _campos base_ | — | — | created_at, created_by |

---

## 15. Compras

### 15.1 PurchaseRequest

**Schema:** `procurement`
**Objetivo:** Requisição de compra de produto ou serviço de TI.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `number` | VARCHAR(20) | NOT NULL UNIQUE/tenant | Número legível (PRC-2026-000123) |
| `requester_id` | UUID | FK NOT NULL | → `auth.User` (solicitante) |
| `category` | ENUM | NOT NULL | `HARDWARE`, `SOFTWARE`, `SERVICE`, `CLOUD`, `TELECOM`, `OTHER` |
| `title` | VARCHAR(300) | NOT NULL | Título da requisição |
| `justification` | TEXT | NOT NULL | Justificativa da compra |
| `estimated_value` | DECIMAL(15,2) | NOT NULL | Valor estimado |
| `budget_id` | UUID | FK NULLABLE | → `finance.Budget` |
| `cost_center_id` | UUID | FK NOT NULL | → `org.CostCenter` |
| `project_id` | UUID | FK NULLABLE | → `project.Project` (quando vinculada a projeto) |
| `status` | ENUM | NOT NULL | `DRAFT`, `SUBMITTED`, `PENDING_APPROVAL`, `APPROVED`, `ORDERED`, `RECEIVED`, `CANCELLED` |
| `needed_by` | DATE | NULLABLE | Data necessária |
| `priority` | ENUM | NOT NULL DEFAULT 'MEDIUM' | `LOW`, `MEDIUM`, `HIGH`, `URGENT` |
| _campos base_ | — | — | campos base universais |

**Relacionamentos:**
- 1:N → `request.Approval` (fluxo de aprovação reutilizado)
- 1:1 → `procurement.PurchaseOrder`

---

### 15.2 PurchaseOrder

**Schema:** `procurement`
**Objetivo:** Pedido de compra emitido após aprovação da requisição.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `purchase_request_id` | UUID | FK UNIQUE NOT NULL | → `procurement.PurchaseRequest` (1:1) |
| `supplier_id` | UUID | FK NOT NULL | → `finance.Supplier` |
| `order_number` | VARCHAR(100) | NOT NULL UNIQUE/tenant | Número do pedido |
| `status` | ENUM | NOT NULL | `DRAFT`, `SENT`, `CONFIRMED`, `PARTIALLY_RECEIVED`, `RECEIVED`, `CANCELLED` |
| `total_value` | DECIMAL(15,2) | NOT NULL | Valor total do pedido |
| `expected_delivery` | DATE | NULLABLE | Data de entrega prevista |
| `delivery_address` | TEXT | NOT NULL | Endereço de entrega |
| `purchase_date` | DATE | NULLABLE | Data da emissão do pedido |
| `notes` | TEXT | NULLABLE | Observações |
| `contract_id` | UUID | FK NULLABLE | → `finance.Contract` (quando vinculado a contrato) |
| _campos base_ | — | — | campos base universais |

**Relacionamentos:**
- 1:N → `procurement.PurchaseItem`

---

### 15.3 PurchaseItem

**Schema:** `procurement`
**Objetivo:** Itens de um pedido de compra com controle de recebimento.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `purchase_order_id` | UUID | FK NOT NULL | → `procurement.PurchaseOrder` |
| `description` | VARCHAR(500) | NOT NULL | Descrição do item |
| `quantity` | INTEGER | NOT NULL | Quantidade pedida |
| `unit` | VARCHAR(50) | NOT NULL | Unidade (unidade, licença, mês, etc.) |
| `unit_price` | DECIMAL(15,2) | NOT NULL | Preço unitário |
| `total_price` | DECIMAL(15,2) | NOT NULL | Preço total |
| `received_quantity` | INTEGER | NOT NULL DEFAULT 0 | Quantidade recebida |
| `received_at` | TIMESTAMPTZ | NULLABLE | Data de recebimento completo |
| `asset_id` | UUID | FK NULLABLE | → `asset.Asset` (ativo criado após recebimento) |
| _campos base_ | — | — | created_at, updated_at, created_by, updated_by |

---

## 16. Base de Conhecimento

### 16.1 KnowledgeCategory

**Schema:** `knowledge`
**Objetivo:** Hierarquia de categorias da Base de Conhecimento.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `name` | VARCHAR(100) | NOT NULL | Nome da categoria |
| `slug` | VARCHAR(100) | NOT NULL UNIQUE/tenant | URL slug |
| `parent_id` | UUID | FK NULLABLE | → `knowledge.KnowledgeCategory` (hierarquia) |
| `order` | INTEGER | NOT NULL DEFAULT 0 | Ordem de exibição |
| `icon` | VARCHAR(50) | NULLABLE | Ícone da categoria |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true | Categoria ativa |
| _campos base_ | — | — | campos base universais |

---

### 16.2 KnowledgeArticle

**Schema:** `knowledge`
**Objetivo:** Artigo da Base de Conhecimento com versionamento e controle editorial.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `category_id` | UUID | FK NOT NULL | → `knowledge.KnowledgeCategory` |
| `title` | VARCHAR(500) | NOT NULL | Título do artigo |
| `slug` | VARCHAR(500) | NOT NULL UNIQUE/tenant | URL slug |
| `content` | TEXT | NOT NULL | Conteúdo do artigo (Markdown) |
| `excerpt` | TEXT | NOT NULL | Trecho/resumo (máximo 300 caracteres) |
| `status` | ENUM | NOT NULL | `DRAFT`, `DRAFT_AI`, `UNDER_REVIEW`, `PUBLISHED`, `DEPRECATED` |
| `audience` | ENUM | NOT NULL | `END_USER`, `TECHNICAL`, `MANAGEMENT` |
| `author_id` | UUID | FK NOT NULL | → `auth.User` |
| `reviewer_id` | UUID | FK NULLABLE | → `auth.User` |
| `reviewed_at` | TIMESTAMPTZ | NULLABLE | Data de revisão |
| `published_at` | TIMESTAMPTZ | NULLABLE | Data de publicação |
| `version_number` | INTEGER | NOT NULL DEFAULT 1 | Versão atual |
| `is_current` | BOOLEAN | NOT NULL DEFAULT true | Se é a versão vigente |
| `superseded_by` | UUID | FK NULLABLE | → `knowledge.KnowledgeArticle` |
| `view_count` | INTEGER | NOT NULL DEFAULT 0 | Total de visualizações |
| `view_count_30d` | INTEGER | NOT NULL DEFAULT 0 | Visualizações nos últimos 30 dias |
| `helpful_count` | INTEGER | NOT NULL DEFAULT 0 | Avaliações positivas |
| `not_helpful_count` | INTEGER | NOT NULL DEFAULT 0 | Avaliações negativas |
| `linked_ticket_id` | UUID | FK NULLABLE | → `ticket.Ticket` (origem do artigo) |
| `linked_problem_id` | UUID | FK NULLABLE | → `problem.Problem` (problema que originou) |
| `ai_generated` | BOOLEAN | NOT NULL DEFAULT false | true = gerado pelo Assistente IA |
| `search_vector` | TSVECTOR | NOT NULL | Vetor de busca full-text (atualizado por trigger) |
| _campos base_ | — | — | campos base universais |

**Índices recomendados:**
- `INDEX` em `(tenant_id, status, is_current)`
- `GIN` em `search_vector`
- `INDEX` em `category_id`
- `INDEX` em `view_count_30d`

---

### 16.3 KnowledgeTag

**Schema:** `knowledge`
**Objetivo:** Tags para busca e filtragem de artigos.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `name` | VARCHAR(50) | NOT NULL UNIQUE/tenant | Nome da tag |
| `slug` | VARCHAR(50) | NOT NULL UNIQUE/tenant | URL slug |
| `usage_count` | INTEGER | NOT NULL DEFAULT 0 | Quantidade de artigos com esta tag |
| _campos base_ | — | — | created_at, created_by |

---

### 16.4 KnowledgeAttachment

**Schema:** `knowledge`
**Objetivo:** Arquivos anexados a artigos da KB.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `article_id` | UUID | FK NOT NULL | → `knowledge.KnowledgeArticle` |
| `file_reference_id` | UUID | FK NOT NULL | → `shared.FileReference` |
| `caption` | VARCHAR(300) | NULLABLE | Legenda do arquivo |
| _campos base_ | — | — | created_at, created_by, deleted_at, deleted_by |

---

### 16.5 KnowledgeFeedback

**Schema:** `knowledge`
**Objetivo:** Avaliações de utilidade de artigos da KB pelos leitores.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `article_id` | UUID | FK NOT NULL | → `knowledge.KnowledgeArticle` |
| `user_id` | UUID | FK NOT NULL | → `auth.User` |
| `rating` | ENUM | NOT NULL | `HELPFUL`, `NOT_HELPFUL` |
| `comment` | TEXT | NULLABLE | Comentário opcional |
| `ticket_id` | UUID | FK NULLABLE | → `ticket.Ticket` (contexto de uso) |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | — |

**Índices recomendados:**
- `UNIQUE` em `(article_id, user_id)` (uma avaliação por usuário por artigo)

---

## 17. Notificações

### 17.1 NotificationTemplate

**Schema:** `notification`
**Objetivo:** Templates de notificação por tipo de evento do sistema.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `event_type` | VARCHAR(100) | NOT NULL UNIQUE/tenant | Tipo de evento (ex: `INCIDENT_OPENED`) |
| `channel` | ENUM | NOT NULL | `IN_APP`, `EMAIL`, `PUSH` |
| `title_template` | VARCHAR(300) | NOT NULL | Template do título (com variáveis `{{var}}`) |
| `body_template` | TEXT | NOT NULL | Template do corpo |
| `email_subject_template` | VARCHAR(300) | NULLABLE | Template do assunto do e-mail |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true | Template ativo |
| `variables` | JSONB | NOT NULL | Lista de variáveis disponíveis com descrição |
| _campos base_ | — | — | campos base universais |

---

### 17.2 Notification

**Schema:** `notification`
**Objetivo:** Notificação gerada e destinada a um usuário específico.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `recipient_id` | UUID | FK NOT NULL | → `auth.User` (destinatário) |
| `template_id` | UUID | FK NULLABLE | → `notification.NotificationTemplate` |
| `channel` | ENUM | NOT NULL | `IN_APP`, `EMAIL`, `PUSH` |
| `title` | VARCHAR(300) | NOT NULL | Título da notificação |
| `body` | TEXT | NOT NULL | Corpo da notificação |
| `entity_type` | VARCHAR(50) | NULLABLE | Tipo da entidade relacionada |
| `entity_id` | UUID | NULLABLE | ID da entidade relacionada |
| `action_url` | TEXT | NULLABLE | URL de ação (deep link) |
| `priority` | ENUM | NOT NULL DEFAULT 'NORMAL' | `LOW`, `NORMAL`, `HIGH`, `URGENT` |
| `status` | ENUM | NOT NULL DEFAULT 'PENDING' | `PENDING`, `SENT`, `DELIVERED`, `READ`, `FAILED` |
| `read_at` | TIMESTAMPTZ | NULLABLE | Quando foi lida |
| `sent_at` | TIMESTAMPTZ | NULLABLE | Quando foi enviada |
| `failed_reason` | TEXT | NULLABLE | Motivo da falha |
| `expires_at` | TIMESTAMPTZ | NULLABLE | Expiração (após expirar, não exibe mais) |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | — |

**Índices recomendados:**
- `INDEX` em `(recipient_id, status, read_at)`
- `INDEX` em `created_at`

---

### 17.3 NotificationHistory

**Schema:** `notification`
**Objetivo:** Histórico de entregas e tentativas de envio de notificações.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `notification_id` | UUID | FK NOT NULL | → `notification.Notification` |
| `attempt_number` | SMALLINT | NOT NULL | Número da tentativa |
| `status` | ENUM | NOT NULL | `SENT`, `FAILED`, `BOUNCED` |
| `provider_response` | JSONB | NULLABLE | Resposta do provedor de entrega |
| `attempted_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Momento da tentativa |

---

## 18. E-mail

### 18.1 EmailThread

**Schema:** `email_log`
**Objetivo:** Registro de threads de e-mail recebidos e enviados pelo sistema, vinculados a tickets.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `ticket_id` | UUID | FK NULLABLE | → `ticket.Ticket` (ticket vinculado) |
| `subject` | VARCHAR(500) | NOT NULL | Assunto da thread |
| `external_thread_id` | VARCHAR(500) | NULLABLE | Message-ID original do e-mail |
| `participant_emails` | TEXT[] | NOT NULL | Lista de e-mails participantes |
| `status` | ENUM | NOT NULL | `OPEN`, `CLOSED` |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | — |

---

### 18.2 EmailMessage

**Schema:** `email_log`
**Objetivo:** Mensagens individuais de e-mail enviadas ou recebidas pelo sistema.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `thread_id` | UUID | FK NOT NULL | → `email_log.EmailThread` |
| `direction` | ENUM | NOT NULL | `INBOUND`, `OUTBOUND` |
| `from_email` | VARCHAR(255) | NOT NULL | Remetente |
| `to_emails` | TEXT[] | NOT NULL | Destinatários |
| `cc_emails` | TEXT[] | NULLABLE | CC |
| `subject` | VARCHAR(500) | NOT NULL | Assunto |
| `body_text` | TEXT | NULLABLE | Corpo em texto plano |
| `body_html` | TEXT | NULLABLE | Corpo em HTML |
| `external_message_id` | VARCHAR(500) | NULLABLE | Message-ID do servidor de e-mail |
| `status` | ENUM | NOT NULL | `QUEUED`, `SENDING`, `SENT`, `DELIVERED`, `BOUNCED`, `FAILED` |
| `provider_data` | JSONB | NULLABLE | Dados do provedor (SMTP response) |
| `sent_at` | TIMESTAMPTZ | NULLABLE | Quando foi enviado |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | — |

---

## 19. Dashboards

### 19.1 KPI

**Schema:** `dashboard`
**Objetivo:** Definição de KPIs do sistema com configuração de cálculo e exibição.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | FK NOT NULL | Tenant |
| `code` | VARCHAR(50) | NOT NULL UNIQUE/tenant | Código único do KPI (ex: `SLA_GLOBAL_PCT`) |
| `name` | VARCHAR(200) | NOT NULL | Nome do KPI |
| `description` | TEXT | NULLABLE | Descrição e metodologia de cálculo |
| `category` | ENUM | NOT NULL | `SERVICE_DESK`, `ASSETS`, `COMPLIANCE`, `FINANCIAL`, `IDENTITY`, `PROJECTS` |
| `unit` | VARCHAR(50) | NOT NULL | Unidade (%, horas, R$, quantidade) |
| `target_value` | DECIMAL(15,2) | NULLABLE | Meta |
| `target_direction` | ENUM | NOT NULL | `HIGHER_BETTER`, `LOWER_BETTER`, `ON_TARGET` |
| `alert_threshold` | DECIMAL(15,2) | NULLABLE | Valor que aciona alerta |
| `current_value` | DECIMAL(15,2) | NULLABLE | Valor atual calculado |
| `previous_value` | DECIMAL(15,2) | NULLABLE | Valor do período anterior |
| `calculated_at` | TIMESTAMPTZ | NULLABLE | Último cálculo |
| `calculation_source` | VARCHAR(100) | NOT NULL | Origem do cálculo (projeção ou query) |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true | KPI ativo |
| _campos base_ | — | — | campos base universais |

---

### 19.2 KPIHistory

**Schema:** `dashboard`
**Objetivo:** Histórico de valores de KPIs para análise de tendências.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `kpi_id` | UUID | FK NOT NULL | → `dashboard.KPI` |
| `period` | DATE | NOT NULL | Período de referência (primeiro dia) |
| `granularity` | ENUM | NOT NULL | `DAILY`, `WEEKLY`, `MONTHLY` |
| `value` | DECIMAL(15,2) | NOT NULL | Valor do KPI no período |
| `target_value` | DECIMAL(15,2) | NULLABLE | Meta vigente no período |
| `calculated_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Quando foi calculado |

**Índices recomendados:**
- `UNIQUE` em `(kpi_id, period, granularity)`
- `INDEX` em `(kpi_id, period)`

---

## 20. Auditoria e Storage

### 20.1 AuditLog

**Schema:** `shared`
**Objetivo:** Registro imutável de todas as operações de escrita do sistema. Política RLS INSERT-only — sem UPDATE e sem DELETE. Utilizado para auditoria, conformidade e investigação de incidentes de segurança.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID v7 | PK NOT NULL | UUID monotônico (ordenável por tempo de inserção) |
| `tenant_id` | UUID | NOT NULL | Tenant |
| `user_id` | UUID | NOT NULL | Usuário que executou a ação |
| `user_role` | VARCHAR(50) | NOT NULL | Papel do usuário no momento da ação |
| `session_id` | UUID | NOT NULL | Sessão ativa no momento |
| `action` | ENUM | NOT NULL | `CREATE`, `UPDATE`, `DELETE`, `ACCESS`, `LOGIN`, `LOGOUT`, `FAILED_LOGIN`, `EXPORT`, `APPROVE`, `REJECT`, `REVOKE` |
| `module` | VARCHAR(50) | NOT NULL | Módulo do sistema |
| `entity_type` | VARCHAR(100) | NOT NULL | Nome da entidade (ex: `Incident`, `Asset`) |
| `entity_id` | UUID | NULLABLE | ID da entidade afetada |
| `old_values` | JSONB | NULLABLE | Estado anterior (UPDATE e DELETE) |
| `new_values` | JSONB | NULLABLE | Novo estado (CREATE e UPDATE) |
| `ip_address` | INET | NOT NULL | IP real do cliente |
| `user_agent` | VARCHAR(500) | NULLABLE | User-Agent da requisição |
| `request_id` | UUID | NOT NULL | Identificador de correlação da requisição |
| `occurred_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Preenchido pelo banco — não pela aplicação |
| `metadata` | JSONB | NULLABLE | Dados adicionais de contexto |

**Índices recomendados:**
- `INDEX` em `(tenant_id, entity_type, entity_id)`
- `INDEX` em `(user_id, occurred_at)`
- `INDEX` em `occurred_at`
- `INDEX` em `action`
- `INDEX` em `request_id`

---

### 20.2 FileReference

**Schema:** `shared`
**Objetivo:** Referência centralizada a arquivos armazenados no Supabase Storage. Todas as entidades que referenciam arquivos o fazem por esta entidade.

**Campos:**

| Campo | Tipo | Restrição | Descrição |
|-------|------|-----------|-----------|
| `id` | UUID | PK NOT NULL | Identificador único |
| `tenant_id` | UUID | NOT NULL | Tenant |
| `bucket` | VARCHAR(100) | NOT NULL | Bucket do Supabase Storage |
| `storage_path` | TEXT | NOT NULL | Caminho no bucket (ex: `incidents/uuid/file.pdf`) |
| `original_filename` | VARCHAR(500) | NOT NULL | Nome original do arquivo |
| `mime_type` | VARCHAR(100) | NOT NULL | MIME type verificado no upload |
| `size_bytes` | BIGINT | NOT NULL | Tamanho em bytes |
| `file_hash` | VARCHAR(64) | NOT NULL | SHA-256 do arquivo |
| `module` | VARCHAR(50) | NOT NULL | Módulo de origem |
| `entity_type` | VARCHAR(100) | NOT NULL | Tipo da entidade proprietária |
| `entity_id` | UUID | NOT NULL | ID da entidade proprietária |
| `uploader_id` | UUID | NOT NULL | → `auth.User` |
| `is_public` | BOOLEAN | NOT NULL DEFAULT false | Arquivo com acesso público |
| `expires_at` | TIMESTAMPTZ | NULLABLE | Expiração (para URLs assinadas temporárias) |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | — |
| `deleted_at` | TIMESTAMPTZ | NULLABLE | Exclusão lógica |
| `deleted_by` | UUID | NULLABLE | → `auth.User` |

**Índices recomendados:**
- `UNIQUE` em `storage_path` WHERE `deleted_at IS NULL`
- `INDEX` em `(module, entity_type, entity_id)`
- `INDEX` em `file_hash`

---

## 21. Relacionamentos Principais e Cardinalidades

### 21.1 Cardinalidades Críticas

| Entidade A | Cardinalidade | Entidade B | Tipo de Vínculo |
|------------|:---:|------------|----------------|
| `auth.User` | 1:N | `auth.Session` | Usuário tem muitas sessões |
| `auth.User` | N:N | `auth.Role` | via `auth.UserRole` |
| `auth.User` | 1:1 | `identity.Identity` | Espelho de identidade |
| `org.Department` | 1:N | `org.Department` | Auto-referência hierárquica |
| `catalog.ServiceCatalog` | 1:N | `catalog.SLA` | Catálogo tem muitos SLAs |
| `ticket.Ticket` | 1:1 | `incident.Incident` | Quando type=INCIDENT |
| `ticket.Ticket` | 1:1 | `request.Request` | Quando type=REQUEST |
| `ticket.Ticket` | 1:1 | `problem.Problem` | Quando type=PROBLEM |
| `ticket.Ticket` | 1:N | `ticket.TicketComment` | Ticket tem muitos comentários |
| `incident.Incident` | N:1 | `problem.Problem` | Muitos incidentes → 1 problema |
| `asset.Asset` | 1:N | `asset.AssetAssignment` | Histórico de atribuições |
| `asset.Asset` | 1:1 | `asset.GlpiAssetReference` | Referência no GLPI |
| `identity.Identity` | 1:1 | `identity.GoogleUserReference` | Referência no Google |
| `compliance.Audit` | 1:N | `compliance.ComplianceFinding` | Auditoria tem achados |
| `compliance.ComplianceFinding` | 1:N | `compliance.ComplianceEvidence` | Achado tem evidências |
| `compliance.ComplianceFinding` | 1:1 | `compliance.ComplianceActionPlan` | Achado tem plano de ação |
| `finance.Supplier` | 1:N | `finance.Contract` | Fornecedor tem contratos |
| `finance.Budget` | 1:N | `finance.BudgetItem` | Orçamento tem itens |
| `project.Project` | 1:N | `project.ProjectTask` | Projeto tem tarefas |
| `procurement.PurchaseRequest` | 1:1 | `procurement.PurchaseOrder` | Requisição origina pedido |
| `procurement.PurchaseOrder` | 1:N | `procurement.PurchaseItem` | Pedido tem itens |
| `knowledge.KnowledgeArticle` | 1:N | `knowledge.KnowledgeFeedback` | Artigo tem avaliações |
| `knowledge.KnowledgeArticle` | 1:1 | `knowledge.KnowledgeArticle` | Auto-referência (versionamento) |
| `shared.FileReference` | N:1 | qualquer entidade | Polimórfico por entity_type/entity_id |

### 21.2 Entidades Polimórficas

Entidades que referenciam múltiplos tipos de entidade via `entity_type` + `entity_id`:

| Entidade | Uso Polimórfico | Entidades Referenciadas |
|----------|----------------|------------------------|
| `shared.FileReference` | Arquivos de qualquer módulo | Ticket, Asset, Compliance, Knowledge... |
| `shared.AuditLog` | Log de qualquer operação | Todas as entidades de negócio |
| `incident.IncidentImpact` | Impacto em qualquer tipo | Asset, Service, Department, User |
| `notification.Notification` | Notificação de qualquer evento | Ticket, Project, Contract... |

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição da Alteração |
|--------|------|-------|------------------------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação do documento com 62 entidades em 17 schemas |

---

> **Próximos documentos recomendados:**
> [`12_ARCHITECTURE.md`](./12_ARCHITECTURE.md) — Arquitetura técnica e mapeamento de bounded contexts
> [`01_CLAUDE.md`](./01_CLAUDE.md) — Regras de implementação (schema Prisma segue este modelo)
> [`14_SECURITY_REQUIREMENTS.md`](./14_SECURITY_REQUIREMENTS.md) — RLS e políticas de segurança por tabela
