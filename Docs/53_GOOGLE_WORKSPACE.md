# SGTI — Sistema de Gestão de Tecnologia da Informação
## Integração com Google Workspace — Documentação Funcional e Técnica

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [22_AUTHENTICATION.md](./22_AUTHENTICATION.md) · [44_IDENTITY_MANAGEMENT.md](./44_IDENTITY_MANAGEMENT.md) · [50_INTEGRATIONS.md](./50_INTEGRATIONS.md) · [24_BUSINESS_RULES.md](./24_BUSINESS_RULES.md) · [20_DATABASE.md](./20_DATABASE.md)

---

## Sobre este Documento

Este documento define a **especificação funcional e técnica da integração entre o SGTI e o Google Workspace**, cobrindo sincronização de usuários, grupos, departamentos e gestores; provisionamento e desprovisionamento; API corporativa de identidades; segurança; auditoria; e regras de negócio.

**Princípio Arquitetural Fundamental:** O Google Workspace é a **fonte oficial (source of truth) das identidades corporativas**. O SGTI consome, complementa e gerencia os aspectos de negócio (papéis RBAC, centros de custo, permissões de serviço), mas nunca substitui o Google Admin Console como console de administração de identidades.

**Escopo:** documentação funcional e técnica. Nenhum código ou SQL é gerado neste documento.

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura da Integração](#2-arquitetura-da-integração)
3. [Objetivos da Integração](#3-objetivos-da-integração)
4. [Sincronização de Usuários](#4-sincronização-de-usuários)
5. [Sincronização de Grupos](#5-sincronização-de-grupos)
6. [Sincronização de Departamentos](#6-sincronização-de-departamentos)
7. [Hierarquia de Gestores](#7-hierarquia-de-gestores)
8. [Provisionamento](#8-provisionamento)
9. [Desprovisionamento](#9-desprovisionamento)
10. [Frequência de Sincronização](#10-frequência-de-sincronização)
11. [API Corporativa de Usuários](#11-api-corporativa-de-usuários)
12. [Segurança](#12-segurança)
13. [Auditoria e Rastreabilidade](#13-auditoria-e-rastreabilidade)
14. [Logs](#14-logs)
15. [Tratamento de Falhas](#15-tratamento-de-falhas)
16. [Dashboards e Indicadores](#16-dashboards-e-indicadores)
17. [Relatórios](#17-relatórios)
18. [Compliance e Conformidade](#18-compliance-e-conformidade)
19. [Regras de Negócio](#19-regras-de-negócio)
20. [Critérios de Aceitação](#20-critérios-de-aceitação)

---

## 1. Visão Geral

### 1.1 O Papel do Google Workspace no SGTI

| Aspecto | Google Workspace | SGTI |
|:-------:|:----------------:|:----:|
| **Identity Provider (IdP)** | ✅ Fonte primária | Consome via OAuth 2.0 |
| **Diretório de Usuários** | ✅ Source of Truth | Espelho + dados de negócio |
| **MFA e Políticas de Acesso** | ✅ Gerenciado no Google | Informativo (`mfa_enabled`) |
| **Autenticação** | OAuth 2.0 / PKCE | JWT RS256 emitido pós-OAuth |
| **Autorização (RBAC)** | — | ✅ Gerenciado exclusivamente no SGTI |
| **Centros de Custo** | — | ✅ Exclusivo SGTI |
| **Papéis e Permissões** | — | ✅ Exclusivo SGTI |
| **Gestão de Ativos** | — | ✅ Exclusivo SGTI |
| **Sessões** | Refresh Token Google | JWT RS256 SGTI (1h) |

### 1.2 Serviços Google Workspace Utilizados

| Serviço | API | Uso |
|:-------:|:---:|-----|
| **Gmail** | Gmail API + Pub/Sub | Recebimento de e-mails (módulo 51) |
| **Google Directory** | Admin SDK Directory API | Usuários, grupos, OUs, gestores |
| **Google OAuth 2.0** | OAuth 2.0 + OpenID Connect | Autenticação de usuários |
| **Google Cloud Pub/Sub** | Pub/Sub API | Notificações Gmail em tempo real |

### 1.3 Domínio Corporativo

O SGTI aceita autenticação exclusivamente de contas do domínio corporativo configurado. O domínio é verificado via claim `hd` (hosted domain) no id_token do Google OAuth.

---

## 2. Arquitetura da Integração

### 2.1 Diagrama de Fluxo

```
GOOGLE WORKSPACE (Fonte de Autoridade)
          │
          │  Admin SDK Directory API (Domain-Wide Delegation)
          │  OAuth 2.0 + PKCE (Usuários)
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│            GOOGLE WORKSPACE INTEGRATION LAYER                    │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │ GoogleDirectory  │  │ GoogleOAuth      │  │ GoogleGroup    │ │
│  │ Adapter          │  │ Adapter          │  │ Adapter        │ │
│  │ (Admin SDK)      │  │ (OAuth 2.0+PKCE) │  │ (Admin SDK)    │ │
│  └────────┬─────────┘  └────────┬─────────┘  └───────┬────────┘ │
└───────────┼────────────────────┼────────────────────┼───────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SGTI BACKEND (NestJS)                         │
│                                                                   │
│  Identity Module    Auth Module         IAM Module               │
│  ─────────────────  ─────────────────   ─────────────────────── │
│  User Sync Jobs     JWT Generation      Role Assignment           │
│  Group Sync Jobs    Session Mgmt        Access Control            │
│  Dept Sync          Token Validation    RBAC Policies             │
│                                                                   │
│  Repositories: auth.User, identity.*, shared.audit_log           │
└────────────────────────────┬────────────────────────────────────┘
                             │
          ┌──────────────────┴──────────────────┐
          │                                     │
          ▼                                     ▼
┌─────────────────────┐             ┌──────────────────────────┐
│   SUPABASE AUTH     │             │    SUPABASE POSTGRESQL   │
│   Session Storage   │             │    auth.User             │
│   Refresh Tokens    │             │    identity.Identity     │
│   JWT Validation    │             │    identity.IdentityGroup│
└─────────────────────┘             │    identity.GoogleUserRef│
                                    │    shared.audit_log      │
                                    └──────────────────────────┘
```

### 2.2 Fluxo de Autenticação

```
AUTENTICAÇÃO — FLUXO COMPLETO

1. Usuário acessa o SGTI (portal web)
2. Frontend gera:
   code_verifier = random(32 bytes)
   code_challenge = BASE64URL(SHA-256(code_verifier))
3. Redireciona para Google OAuth:
   https://accounts.google.com/o/oauth2/v2/auth
   ?response_type=code
   &client_id={GOOGLE_CLIENT_ID}
   &redirect_uri=https://sgti.empresa.com.br/auth/callback
   &scope=openid email profile
   &code_challenge={code_challenge}
   &code_challenge_method=S256
   &hd={domínio_corporativo}     ← Restringe ao domínio
   &state={csrf_token}
4. Usuário autentica no Google (senha + MFA se configurado)
5. Google redireciona para callback com authorization_code
6. Backend troca:
   code + code_verifier → id_token + access_token + refresh_token
7. Validações do id_token:
   ✓ Assinatura RSA válida (Google Public Keys)
   ✓ aud = {GOOGLE_CLIENT_ID}
   ✓ hd = {domínio_corporativo}
   ✓ email_verified = true
   ✓ exp > NOW()
8. Identificação do usuário via sub (google_user_id)
9. Busca auth.User WHERE google_user_id = sub
10. Se encontrado e ACTIVE: emite JWT RS256 do SGTI
11. Se encontrado e SUSPENDED: retorna 403 "Conta suspensa"
12. Se não encontrado: auto-provisioning flow (seção 8.4)
```

### 2.3 Responsabilidades por Camada

| Camada | Responsabilidade |
|:------:|:----------------:|
| **Google Workspace** | Autenticação, diretório de usuários, MFA, políticas de senha |
| **GoogleDirectoryAdapter** | Encapsula chamadas ao Admin SDK; traduz erros Google para exceções de domínio |
| **IdentityModule (SGTI)** | Sincronização, provisionamento, desprovisionamento, RBAC |
| **Supabase Auth** | Gerenciamento de sessões, refresh tokens, validação de JWT |
| **auth.User** | Dados de usuário com campos SGTI-exclusivos (roles, locale, CC) |

---

## 3. Objetivos da Integração

### 3.1 Objetivos Estratégicos

| Objetivo | Descrição |
|:--------:|-----------|
| **Única fonte de verdade** | Identidades gerenciadas no Google; SGTI reflete e complementa |
| **Ciclo de vida gerenciado** | Criação, alteração e encerramento orquestrados end-to-end |
| **Segurança reforçada** | Acesso ao SGTI automaticamente revogado ao desligar conta Google |
| **Conformidade** | Rastreabilidade total de acessos para ISO 27001, LGPD e BACEN |

### 3.2 Objetivos Operacionais

| # | Objetivo | Indicador | Meta |
|---|----------|-----------|:----:|
| 1 | Sync de usuários sempre atualizada | Defasagem máxima | ≤ 24 horas |
| 2 | Provisionamento automático | % contas provisionadas automaticamente | ≥ 95% |
| 3 | Desprovisionamento tempestivo | Tempo entre solicitação e suspensão Google | ≤ 2 horas |
| 4 | Divergências zero | % usuários com `sync_status = CONFLICT` | < 1% |
| 5 | MFA obrigatório para papéis críticos | IT_MANAGER+ com MFA habilitado | 100% |
| 6 | Rastreabilidade completa | % operações registradas em audit_log | 100% |

---

## 4. Sincronização de Usuários

### 4.1 Campos Sincronizados do Google para o SGTI

| Campo Google (Admin SDK) | Campo SGTI | Schema | Prioridade | Notas |
|:------------------------:|:----------:|:------:|:----------:|-------|
| `name.givenName` | `first_name` | auth.User | Google | Primeiro nome |
| `name.familyName` | `last_name` | auth.User | Google | Sobrenome |
| `name.fullName` | `display_name` | auth.User | Google | Nome completo exibido |
| `primaryEmail` | `email` | auth.User | **Imutável após criação** | E-mail principal |
| `organizations[0].title` | `job_title` | auth.User | Google | Cargo/função |
| `organizations[0].department` | `department_name` | identity.Identity | Google | Nome do departamento |
| `organizations[0].costCenter` | — | — | Ignorado (SGTI usa `cost_center_id`) | — |
| `orgUnitPath` | `google_org_unit` | auth.User | Google | Unidade organizacional do Google |
| `manager` (via Custom Attr.) | `manager_email` → `manager_id` | identity.Identity | Google | E-mail do gestor direto |
| `id` (sub) | `google_user_id` | auth.User | Google | ID único Google. Imutável. |
| `thumbnailPhotoUrl` | `avatar_url` | auth.User | Google | URL da foto de perfil |
| `isEnrolledIn2Sv` | `mfa_enabled` | auth.User | Google | MFA habilitado (informativo) |
| `suspended` | — (determina status) | auth.User | Google | Se true → SGTI status = SUSPENDED |
| `creationTime` | `google_created_at` | identity.GoogleUserReference | Google | Data de criação no Google |
| `lastLoginTime` | `google_last_login` | identity.GoogleUserReference | Google | Último login no Google |

### 4.2 Campos Exclusivos do SGTI (Nunca Sobrescritos pela Sync)

| Campo | Schema | Descrição |
|:-----:|:------:|-----------|
| `roles` / `UserRole` | auth.UserRole | Papéis RBAC do SGTI |
| `locale` | auth.User | Idioma preferido da interface |
| `timezone` | auth.User | Fuso horário do usuário |
| `notification_email` | auth.User | Preferência de notificação por e-mail |
| `notification_inapp` | auth.User | Preferência de notificação in-app |
| `theme` | auth.User | Tema da interface (light/dark/system) |
| `cost_center_id` | auth.User | Centro de custo (gestão de TI) |
| `manager_id` | identity.Identity | FK para auth.User (gerenciado pelo SGTI) |
| `department_id` | identity.Identity | FK para tabela de departamentos SGTI |
| `employee_id` | auth.User | Matrícula corporativa |
| `hire_date` | auth.User | Data de admissão |
| `termination_date` | auth.User | Data de desligamento |
| `next_access_review_due` | auth.User | Data da próxima revisão de acesso |

### 4.3 Lógica de Merge durante a Sincronização

```
MERGE LOGIC — SINCRONIZAÇÃO GOOGLE → SGTI

Para cada usuário retornado pelo Google:

1. Buscar auth.User WHERE google_user_id = google.id
   ├── NÃO ENCONTRADO:
   │   a. Verificar se email já existe (usuário criado antes de sincronizar)
   │      → Encontrado por email: vincular google_user_id, atualizar campos
   │      → Não encontrado: criar novo auth.User com status = ACTIVE
   │         identity.GoogleUserReference criado
   │
   └── ENCONTRADO:
       Para cada campo na lista de campos sincronizados:
         SE valor Google ≠ valor SGTI:
           Atualizar SGTI com valor Google
           Registrar em audit_log (action=SYNC_FIELD_UPDATED, old, new)
         SENÃO:
           Nenhuma ação

2. Verificar status:
   SE google.suspended = true E sgti.status = ACTIVE:
     → auth.User.status = SUSPENDED
     → Revogar todas as sessões ativas
     → Registrar em audit_log

   SE google.suspended = false E sgti.status = SUSPENDED E motivo = GOOGLE_SYNC:
     → auth.User.status = ACTIVE (reativação)
     → Registrar em audit_log

3. Atualizar identity.GoogleUserReference:
   → google_data_snapshot = payload JSON do Google (preservado para diagnóstico)
   → last_synced_at = NOW()
   → sync_status = SYNCED (ou CONFLICT se houver discrepância irresolvível)
```

### 4.4 Campos de Controle de Sincronização (GoogleUserReference)

| Campo | Tipo | Descrição |
|:-----:|:----:|-----------|
| `user_id` | UUID (FK) | auth.User vinculado |
| `google_user_id` | String | ID único Google (`sub`) |
| `google_primary_email` | String | E-mail no Google |
| `google_account_suspended` | Boolean | Se conta está suspensa no Google |
| `google_org_unit` | String | OrgUnit do Google |
| `google_last_login` | DateTime | Último login detectado pelo Google |
| `google_created_at` | DateTime | Data de criação no Google |
| `google_data_snapshot` | JSONB | Payload completo do último sync |
| `last_synced_at` | DateTime | Último timestamp de sincronização bem-sucedida |
| `sync_status` | Enum | `SYNCED`, `CONFLICT`, `PENDING`, `ERROR` |
| `sync_error_message` | Text | Detalhes do erro se `sync_status = ERROR` |

---

## 5. Sincronização de Grupos

### 5.1 Visão Geral de Grupos

Grupos do Google Workspace representam equipes, departamentos ou grupos funcionais. No SGTI, grupos sincronizados são usados para:
- Roteamento de chamados de suporte para o grupo responsável.
- Comunicação em massa por e-mail de grupo.
- Agrupamento de usuários para revisões de acesso.

### 5.2 Critério de Sincronização

Apenas grupos com a label `sgti:managed=true` são sincronizados. Isso evita importar todos os grupos corporativos (que podem ser centenas) e permite que o administrador do Google selecione explicitamente quais grupos o SGTI deve gerenciar.

```
ADICIONAR LABEL AO GRUPO NO GOOGLE ADMIN CONSOLE
  1. Admin Console → Diretório → Grupos
  2. Selecionar o grupo de suporte
  3. Informações → Labels: adicionar "sgti:managed" com valor "true"
```

### 5.3 Campos Sincronizados de Grupos

| Campo Google | Campo SGTI (IdentityGroup) | Prioridade |
|:------------:|:--------------------------:|:----------:|
| `email` | `email` | Google |
| `name` | `name` | Google (editável no SGTI) |
| `description` | `description` | Google (editável no SGTI) |
| `id` | `google_group_id` | Google (imutável) |
| `members` | `members` (Array FK User) | Google |
| `directMembersCount` | — (calculado no SGTI) | — |

### 5.4 Tipos de Grupo no SGTI

Ao sincronizar, o SGTI determina o tipo do grupo com base no nome ou label adicional:

| Label Google | Tipo no SGTI | Uso |
|:------------:|:------------:|-----|
| `sgti:type=support` | `SUPPORT` | Grupo de suporte técnico para roteamento de chamados |
| `sgti:type=approval` | `APPROVAL` | Grupo de aprovadores em fluxos de requisição |
| `sgti:type=project` | `PROJECT` | Equipe de projeto |
| (apenas managed=true) | `ORGANIZATIONAL` | Grupo organizacional genérico |

### 5.5 Membros do Grupo

A sincronização de membros inclui:
- Apenas membros com tipo `USER` (exclui grupos aninhados e contas de serviço).
- Membros com conta suspensa no Google são incluídos na lista mas marcados como `suspended`.
- A sincronização é destrutiva: membros removidos do grupo Google são removidos do IdentityGroup no SGTI.

---

## 6. Sincronização de Departamentos

### 6.1 Origem dos Departamentos

Departamentos no SGTI são derivados das **Unidades Organizacionais (OrgUnits)** do Google Workspace e do campo `organizations[0].department` dos usuários.

### 6.2 Mapeamento de OrgUnits para Departamentos

```
ESTRUTURA DE ORGUNIT NO GOOGLE WORKSPACE (EXEMPLO)

/
├── /TI
│   ├── /TI/Infraestrutura
│   ├── /TI/Sistemas
│   └── /TI/Segurança
├── /Financeiro
├── /RH
└── /Comercial

MAPEAMENTO PARA SGTI

OrgUnit Path → Department.google_org_unit_path
OrgUnit Name → Department.name
Users com aquele OrgUnit → Department.member_count (calculado)
```

### 6.3 Campos Sincronizados de Departamentos

| Campo Google | Campo SGTI (Department) | Prioridade |
|:------------:|:------------------------:|:----------:|
| OrgUnit `name` | `name` | Google |
| OrgUnit `orgUnitPath` | `google_org_unit_path` | Google (imutável) |
| OrgUnit `orgUnitId` | `google_org_unit_id` | Google (imutável) |
| OrgUnit `parentOrgUnitPath` | `parent_department_id` → FK | Google |
| Users no OrgUnit | `member_count` (calculado) | — |

### 6.4 Departamento vs. OrgUnit vs. Centro de Custo

| Conceito | Origem | Uso no SGTI |
|:--------:|:------:|:----------:|
| **Department** | Google OrgUnit | Estrutura organizacional visual; vínculo de usuários |
| **OrgUnit** | Google Admin | Controle de políticas no Google (GPO-equivalente) |
| **Centro de Custo** | SGTI (exclusivo) | Controle financeiro de gastos de TI |

Um departamento pode ter um ou vários centros de custo. Esta associação é feita exclusivamente no SGTI, não no Google.

---

## 7. Hierarquia de Gestores

### 7.1 Fonte do Gestor Direto

O gestor direto de um usuário pode ser definido de duas formas no Google Workspace:

| Método | Campo Google | Como Sincronizar |
|:------:|:------------:|:----------------:|
| **Custom Schema** (recomendado) | `customSchemas.SGTI.manager_email` | Campo específico para integração |
| **Campo padrão** | `relations[{type:"manager"}].value` | Campo nativo de relação do usuário |

O SGTI tenta primeiro o Custom Schema e usa o campo padrão como fallback.

### 7.2 Resolução da Hierarquia

```
RESOLUÇÃO DO GESTOR NO SGTI

Para cada usuário com manager_email preenchido:
  1. Buscar auth.User WHERE email = manager_email
  2. Encontrado:
     → identity.Identity.manager_id = manager_user.id
     → Registrar em audit_log se mudou
  3. Não encontrado (gestor não cadastrado no SGTI ainda):
     → identity.Identity.manager_email = manager_email (campo temporário)
     → Job agendado para resolver após sync completa
     → Após sync: tentar novamente resolver para manager_id

A hierarquia permite:
  Usuário → Gestor → Gestor do Gestor → ... (árvore)
  Máximo de 10 níveis de profundidade (circular detection aplicada)
```

### 7.3 Uso da Hierarquia no SGTI

| Funcionalidade | Uso da Hierarquia |
|:--------------:|:----------------:|
| Aprovações em requisições | `manager_id` é o aprovador padrão da etapa 1 |
| Revisões de acesso | Gestor recebe formulário de revisão dos seus liderados |
| Notificações de chamados | Gestor notificado em situações de CRÍTICO e SLA |
| Relatórios por área | Agrupamento por gestor/departamento |
| Desprovisionamento | Gestor dos liderados do usuário desligado é notificado |

### 7.4 Gestores Externos (sem conta SGTI)

Se o gestor direto de um colaborador não possui conta no SGTI (ex.: diretor sem acesso ao sistema):
- `identity.Identity.manager_id` permanece nulo.
- `identity.Identity.manager_email` armazena o e-mail.
- O IT_MANAGER assume o papel de aprovador padrão para este usuário.

---

## 8. Provisionamento

### 8.1 Origens de Provisionamento

| Origem | Fluxo | Automação |
|:------:|-------|:---------:|
| **Requisição Formal** (REQ-TYPE-001) | Gestor abre requisição → aprovação → provisionamento automático | Total |
| **Importação em Lote** | IT_MANAGER importa planilha de novos colaboradores | Semi-automático |
| **API Corporativa** | Sistema de RH chama `/v1/identities/provision` | Total |
| **Auto-Provisioning** | Conta Google existente tenta autenticar no SGTI | Parcial (confirmar papéis) |
| **Manual** (emergência) | SUPER_ADMIN cria diretamente | Manual |

### 8.2 Dados Necessários para Provisionamento

| Campo | Origem | Obrigatório |
|:-----:|:------:|:-----------:|
| E-mail corporativo | Fornecido pelo solicitante | Sim |
| Nome completo | Google (sincronizado após criação) | Não (preenchido depois) |
| Departamento / OrgUnit | Fornecido na requisição | Sim |
| Gestor direto | Fornecido na requisição | Sim |
| Papéis iniciais | Fornecido na requisição | Sim (mínimo: END_USER) |
| Data de admissão | Fornecido na requisição | Sim |
| Centro de Custo | Fornecido na requisição | Sim |

### 8.3 Fluxo de Provisionamento Completo

```
PROVISIONAMENTO — FLUXO DETALHADO

ETAPA 1 — VALIDAÇÕES PRÉ-PROVISIONAMENTO
  ✓ E-mail do domínio corporativo configurado
  ✓ E-mail único (não existe em auth.User ativos)
  ✓ Papéis solicitados não violam regras SoD
  ✓ Gestor informado é usuário ACTIVE com papel IT_MANAGER+
  ✓ Data de admissão válida (presente ou futura)
  ✓ Centro de custo existe e está ativo

ETAPA 2 — CRIAÇÃO NO SGTI
  auth.User criado:
    status = INVITED (ou PENDING_PROVISIONING se provisionamento Google pendente)
    iam_status = PROVISIONING
    email = e-mail corporativo
    created_by = IT_MANAGER aprovador
    next_access_review_due = data_admissão + 90 dias

ETAPA 3 — PROVISIONAMENTO NO GOOGLE WORKSPACE
  GoogleDirectoryAdapter.createAccount({
    primaryEmail: email,
    name: { givenName, familyName },
    orgUnitPath: "/" + departamento,
    password: senha_temporária_gerada (16 chars, aleatória)
    changePasswordAtNextLogin: true
  })

  SUCESSO:
    auth.User.google_user_id = google_response.id
    identity.GoogleUserReference criado
    auth.User.status = ACTIVE
    auth.User.iam_status = ACTIVE
    → ETAPA 4

  FALHA:
    auth.User.status = PENDING_PROVISIONING
    Retry: a cada 30 minutos por até 3 horas
    Após 3h sem sucesso: IT_MANAGER notificado + SUPER_ADMIN para ação manual

ETAPA 4 — ADICIONAR AO GRUPO GOOGLE (se grupo vinculado ao papel)
  Para cada papel com grupo Google associado:
    GoogleGroupAdapter.addMember(group_email, user_google_id)

ETAPA 5 — ATRIBUIÇÃO DE PAPÉIS NO SGTI
  Para cada papel solicitado na requisição:
    auth.UserRole criado:
      role_id, user_id, assigned_by, assignment_reason, valid_from, is_active=true
    Verificação SoD para cada papel
    audit_log: action=ROLE_ASSIGNED

ETAPA 6 — COMUNICAÇÃO
  E-mail de boas-vindas ao novo usuário:
    → Magic link de primeiro acesso (válido 72 horas)
    → Instruções de configuração da conta Google
    → Guia rápido do SGTI para o papel atribuído
  Notificação ao IT_MANAGER: "Provisionamento concluído: {email}"

ETAPA 7 — ENCERRAMENTO DA REQUISIÇÃO
  REQ-TYPE-001.status = FULFILLED
  Evidência gerada automaticamente no módulo Compliance:
    → Aprovadores, papéis concedidos, base legal, data de efetivação
```

### 8.4 Auto-Provisionamento (Just-In-Time)

Quando usuário com conta Google corporativa tenta autenticar no SGTI sem estar cadastrado:

```
JUST-IN-TIME PROVISIONING

Conta Google válida (domínio correto) + NÃO encontrada no SGTI:
  1. SGTI consulta Google Directory API para buscar dados do usuário
  2. Cria auth.User com:
     status = PENDING_PROVISIONING
     google_user_id preenchido
     dados do Google sincronizados
  3. Papéis: NENHUM atribuído automaticamente (apenas END_USER padrão)
  4. Notificação ao IT_MANAGER:
     "Acesso solicitado por {email} — não configurado no SGTI.
      Por favor, atribua papéis antes de liberar o acesso."
  5. Usuário vê: "Seu acesso está sendo configurado. Aguarde o e-mail de confirmação."
```

---

## 9. Desprovisionamento

### 9.1 Tipos de Desprovisionamento

| Tipo | Gatilho | Urgência | Reversível |
|:----:|---------|:--------:|:----------:|
| **Offboarding (desligamento)** | REQ-TYPE-003 aprovado; aviso de RH | ≤ 2h | Não |
| **Suspensão de Segurança** | Suspeita de comprometimento de conta | Imediato | Sim |
| **Suspensão por Sincronia** | Conta Google suspensa pelo admin | ≤ 24h | Sim |
| **Afastamento Temporário** | Licença, férias prolongadas | Manual | Sim |

### 9.2 Ordem Obrigatória do Offboarding

```
ORDEM OBRIGATÓRIA DE DESPROVISIONAMENTO (BR-GWS-004)

T + 0min: SOLICITAÇÃO APROVADA (REQ-TYPE-003)

T + 0min: PASSO 1 — REVOGAR SESSÕES SGTI (IMEDIATO)
  → Todas as sessões JWT ativas invalidadas
  → user_id adicionado à blacklist Redis por 1 hora
  → auth.User.iam_status = PENDING_DEPROVISIONING

T + 0–30min: PASSO 2 — SUSPENDER CONTA GOOGLE
  → GoogleDirectoryAdapter.suspendAccount(google_user_id)
  → Admin SDK: users.update({ suspended: true })
  → identity.GoogleUserReference.google_account_suspended = true
  → Gmail, Drive, Meet: acessos suspensos

T + 0–2h: PASSO 3 — TRANSFERIR RESPONSABILIDADES
  Ativos alocados:
    → AssetAssignment encerrado
    → Ativos movidos para estoque (IN_STOCK)
    → IT_MANAGER notificado com lista de ativos
  Chamados atribuídos:
    → Transferidos para o grupo de suporte
    → Técnico notificado dos chamados transferidos
  Aprovações pendentes:
    → Delegadas automaticamente ao IT_MANAGER
  Projetos como gerente/membro:
    → PROJECT_MANAGER notificado para redesignar
  Grupos de e-mail:
    → Removido de todos os grupos Google

T + 0–2h: PASSO 4 — REVOGAR PAPÉIS NO SGTI
  → Todos os auth.UserRole.is_active = false
  → revoked_at = NOW(), revocation_reason = OFFBOARDING
  → Cada revogação registrada em audit_log

T + 2h (PRAZO MÁXIMO): PASSO 5 — INATIVAR CONTA
  → auth.User.status = INACTIVE
  → auth.User.iam_status = DEPROVISIONED
  → auth.User.termination_date = data efetiva

PASSO 6 — RELATÓRIO DE OFFBOARDING (automático)
  → Gera relatório: ativos desalocados, chamados transferidos,
    papéis revogados, conta Google suspensa, data/hora de cada etapa
  → Arquivado como evidência no módulo Compliance
  → REQ-TYPE-003.status = FULFILLED
```

### 9.3 Suspensão de Segurança (Emergencial)

Para casos de comprometimento de conta ou incidente de segurança:

```
SUSPENSÃO EMERGENCIAL — FLUXO

Acionada por: IT_MANAGER ou SUPER_ADMIN via interface
Motivo: campo obrigatório (mín. 30 chars)

1. auth.User.status = SUSPENDED (imediato)
2. Todas as sessões JWT revogadas (blacklist Redis)
3. Google suspensão: users.update({suspended: true})
4. Notificação ao usuário: "Conta temporariamente suspensa. Entre em contato com TI."
5. audit_log: action=USER_EMERGENCY_SUSPENDED + motivo + IP do IT_MANAGER

Reativação:
  IT_MANAGER desfaz suspensão manualmente
  → auth.User.status = ACTIVE
  → Google: users.update({suspended: false})
  → Sessões não são criadas automaticamente (usuário precisa fazer login)
```

### 9.4 Dados Retidos após Desligamento

| Tipo de Dado | Retenção | Base Legal |
|:------------:|:--------:|:----------:|
| audit_log (todas as ações do usuário) | Indefinida | Conformidade legal |
| Histórico de papéis (UserRole) | Indefinida | ISO 27001 A.9 |
| Chamados criados/atribuídos | Indefinida | Rastreabilidade ITSM |
| Dados de perfil (nome, e-mail) | 5 anos | LGPD + ISO 27001 |
| Dados pessoais sensíveis | Excluídos após 6 meses | LGPD (minimização) |

---

## 10. Frequência de Sincronização

### 10.1 Jobs Agendados

| Job | Cron | Direção | Escopo | Descrição |
|:---:|:----:|:-------:|:------:|-----------|
| **GoogleUserSyncJob** | Diária 02h00 | Google → SGTI | Todos os usuários do domínio | Sync incremental de usuários alterados nas últimas 24h; sync completa aos domingos |
| **GoogleGroupSyncJob** | Semanal dom 03h00 | Google → SGTI | Grupos com `sgti:managed=true` | Sync completa de grupos e membros |
| **GoogleStatusSyncJob** | A cada 30 min | Google → SGTI | Usuários com alteração recente | Detecta suspensões e reativações em tempo quasi-real |
| **GoogleOrgUnitSyncJob** | Semanal dom 04h00 | Google → SGTI | Todas as OrgUnits | Atualiza estrutura de departamentos |
| **TokenValidationJob** | A cada 5 min | SGTI ↔ Google | Sessões ativas | Valida que sessões JWT ativas correspondem a contas Google ativas |
| **GmailWatchRenewalJob** | Diária 23h00 | SGTI → Google | Pub/Sub watch | Renova o watch antes de expirar (7 dias) |

### 10.2 Sync Completa vs. Incremental

| Tipo | Frequência | Estratégia | Duração Estimada |
|:----:|:----------:|:----------:|:----------------:|
| **Incremental** | Diária (02h00) | Busca usuários alterados via `updatedMin` | 2–5 min |
| **Completa** | Semanal (dom 02h00) | Busca todos os usuários; compara com SGTI | 15–30 min |

A sync incremental usa o parâmetro `updatedMin` da Admin SDK para buscar apenas usuários alterados desde a última execução. A sync completa valida a integridade do inventário inteiro.

### 10.3 Sincronização Sob Demanda

IT_MANAGER+ pode disparar sincronização manual via interface:

| Tipo | Escopo | Quando Usar |
|:----:|:------:|:------------|
| **Sync Completa** | Todos os usuários | Após migração de domínio, mudanças estruturais |
| **Sync por Usuário** | Usuário específico (por e-mail) | Discrepância detectada; pós-provisionamento manual |
| **Sync de Grupos** | Todos os grupos `sgti:managed=true` | Após criar/alterar grupos no Google |
| **Sync de Departamentos** | Todas as OrgUnits | Após reestruturação organizacional |

A sync sob demanda é registrada em audit_log com: quem disparou, quando, escopo e resultado.

---

## 11. API Corporativa de Usuários

### 11.1 Propósito

A API Corporativa de Usuários expõe dados de identidade do SGTI para sistemas internos da organização (ERP, CRM, folha de pagamento, sistemas de RH), funcionando como o ponto central de consulta de informações de identidade corporativa.

### 11.2 Autenticação da API

| Mecanismo | Header | Escopos Disponíveis |
|:----------:|:------:|:-------------------:|
| API Key | `Authorization: ApiKey sgti_live_{...}` | `identity:read`, `identity:write`, `identity:deprovisioning`, `identity:webhooks` |

### 11.3 Recursos Disponíveis

#### Usuários

| Endpoint | Método | Descrição | Escopo |
|:--------:|:------:|-----------|:------:|
| `/v1/identities` | GET | Lista usuários com filtros | `identity:read` |
| `/v1/identities/{email}` | GET | Dados completos de um usuário | `identity:read` |
| `/v1/identities/{email}/roles` | GET | Papéis RBAC atribuídos | `identity:read` |
| `/v1/identities/{email}/groups` | GET | Grupos aos quais pertence | `identity:read` |
| `/v1/identities/provision` | POST | Dispara provisionamento | `identity:write` |
| `/v1/identities/{email}/update` | PATCH | Atualiza dados de negócio | `identity:write` |
| `/v1/identities/{email}/suspend` | POST | Suspende conta | `identity:write` |
| `/v1/identities/{email}/deprovision` | POST | Desprovisionamento completo | `identity:deprovisioning` |

**Exemplo de resposta de usuário:**
```json
{
  "data": {
    "id": "uuid-do-usuario",
    "email": "joao.silva@empresa.com.br",
    "display_name": "João Silva",
    "first_name": "João",
    "last_name": "Silva",
    "job_title": "Analista de TI",
    "department": "TI / Infraestrutura",
    "google_org_unit": "/TI/Infraestrutura",
    "manager_email": "carlos.souza@empresa.com.br",
    "status": "ACTIVE",
    "mfa_enabled": true,
    "roles": ["IT_TECHNICIAN"],
    "last_sign_in": "2026-06-09T08:00:00Z",
    "hire_date": "2025-01-15",
    "google_user_id": "123456789012345678901"
  }
}
```

#### Grupos

| Endpoint | Método | Descrição | Escopo |
|:--------:|:------:|-----------|:------:|
| `/v1/groups` | GET | Lista grupos sincronizados | `identity:read` |
| `/v1/groups/{id}` | GET | Dados de um grupo | `identity:read` |
| `/v1/groups/{id}/members` | GET | Membros do grupo | `identity:read` |

#### Departamentos

| Endpoint | Método | Descrição | Escopo |
|:--------:|:------:|-----------|:------:|
| `/v1/departments` | GET | Lista departamentos | `identity:read` |
| `/v1/departments/{id}/users` | GET | Usuários do departamento | `identity:read` |

#### Hierarquia de Gestores

| Endpoint | Método | Descrição | Escopo |
|:--------:|:------:|-----------|:------:|
| `/v1/identities/{email}/direct-reports` | GET | Liderados diretos | `identity:read` |
| `/v1/identities/{email}/manager-chain` | GET | Cadeia de gestores | `identity:read` |

### 11.4 Webhooks de Identidade

| Evento | Payload Principal |
|:------:|:----------------:|
| `user.provisioned` | `{user_id, email, roles, provisioned_at}` |
| `user.role_assigned` | `{user_id, email, role, assigned_by, assigned_at}` |
| `user.role_revoked` | `{user_id, email, role, revoked_by, revoked_at}` |
| `user.suspended` | `{user_id, email, suspended_by, suspended_at, reason}` |
| `user.deprovisioned` | `{user_id, email, deprovisioned_by, deprovisioned_at}` |
| `user.reactivated` | `{user_id, email, reactivated_by, reactivated_at}` |

### 11.5 Filtros e Paginação

```
GET /v1/identities
  ?status=ACTIVE
  &department_id={uuid}
  &role=IT_TECHNICIAN
  &manager_email=carlos.souza@empresa.com.br
  &page=1
  &limit=25
  &sort=display_name
  &order=asc
```

---

## 12. Segurança

### 12.1 OAuth 2.0 com PKCE

Detalhado na seção 2.2 (fluxo de autenticação). O PKCE previne o Authorization Code Interception Attack, essencial em SPAs e aplicações móveis.

| Parâmetro | Valor | Objetivo |
|:----------:|:-----:|:--------:|
| `hd` | Domínio corporativo | Restringe autenticação ao domínio |
| `code_challenge_method` | `S256` | SHA-256 do code_verifier |
| `scope` | `openid email profile` | Mínimo necessário para identificação |
| `state` | CSRF token (32 bytes) | Proteção contra CSRF |

### 12.2 Service Account com Domain-Wide Delegation

A Service Account é usada pelo backend para operações administrativas no Google Workspace sem interação humana:

```
CONFIGURAÇÃO DA SERVICE ACCOUNT

1. Google Cloud Console → IAM → Service Accounts
   → Criar SA: sgti-admin@{projeto}.iam.gserviceaccount.com

2. Gerar chave JSON (armazenar como Vercel Secret)
   → GOOGLE_SERVICE_ACCOUNT_KEY = {JSON completo}

3. Google Admin Console → Segurança → Controles de API →
   Acesso a aplicativos de terceiros → Delegação em todo domínio:
   → Client ID da SA
   → Escopos:
     https://www.googleapis.com/auth/admin.directory.user
     https://www.googleapis.com/auth/admin.directory.group
     https://www.googleapis.com/auth/admin.directory.orgunit

4. No código: SA assina JWT e troca por access_token do Google
   via token exchange, representando um admin do domínio
   (sub: admin@empresa.com.br — usuário administrador)
```

**Princípio do menor privilégio:** A SA tem apenas os 3 escopos acima, suficientes para as operações de sincronização e provisionamento.

### 12.3 JWT RS256 do SGTI

Após validar o id_token do Google, o SGTI emite seu próprio JWT:

```
JWT CLAIMS (SGTI)
{
  "sub": "uuid-do-usuario-sgti",
  "tenant_id": "uuid-do-tenant",
  "email": "joao.silva@empresa.com.br",
  "google_user_id": "123456789012345678901",
  "roles": ["IT_TECHNICIAN"],
  "iat": {timestamp_emissão},
  "exp": {timestamp_emissão + 3600},  ← 1 hora
  "iss": "sgti-backend",
  "aud": "sgti-frontend",
  "jti": "uuid-único-deste-token"     ← JWT ID para blacklist
}
```

O `jti` (JWT ID) permite invalidar tokens individuais na blacklist Redis sem aguardar a expiração.

### 12.4 Rotação de Credenciais

| Credencial | Armazenamento | Rotação |
|:----------:|:-------------:|:-------:|
| Google Client ID | Vercel Env | Raramente (apenas se comprometido) |
| Google Client Secret | Vercel Secret | Anual |
| Service Account Key (JSON) | Vercel Secret | Semestral |
| JWT Private Key RS256 | Vercel Secret | Semestral |
| JWT Public Key RS256 | Vercel Env | Sincronizado com a privada |

### 12.5 Proteção contra Contas Comprometidas

| Gatilho | Ação Automática |
|:-------:|:---------------:|
| 5 falhas de login consecutivas | Conta suspensa no SGTI por 30 min; IT_MANAGER alertado |
| Login de IP geograficamente incomum | Alerta ao IT_MANAGER + notificação ao usuário |
| Conta suspensa no Google detectada | Sessões SGTI revogadas em até 30 min (via GoogleStatusSyncJob) |
| MFA desabilitado para papel crítico | Alerta imediato ao IT_MANAGER |

---

## 13. Auditoria e Rastreabilidade

### 13.1 Eventos Auditados Obrigatoriamente

| Evento | `action` | Dados Capturados |
|--------|:--------:|:----------------:|
| Conta Google criada | `GOOGLE_ACCOUNT_CREATED` | `google_user_id`, `email`, `org_unit` |
| Conta Google suspensa | `GOOGLE_ACCOUNT_SUSPENDED` | `google_user_id`, motivo, executado por |
| Conta Google reativada | `GOOGLE_ACCOUNT_REACTIVATED` | `google_user_id`, reativado por |
| Conta Google deletada | `GOOGLE_ACCOUNT_DELETED` | `google_user_id`, executado por |
| Usuário adicionado a grupo Google | `GOOGLE_GROUP_MEMBER_ADDED` | `group_email`, `user_email` |
| Usuário removido de grupo Google | `GOOGLE_GROUP_MEMBER_REMOVED` | `group_email`, `user_email` |
| Sincronização executada | `SYNC_EXECUTED` | job_name, duração, usuários processados, erros |
| Campo sincronizado atualizado | `SYNC_FIELD_UPDATED` | campo, old_value, new_value, user_id |
| Conflito de sincronização detectado | `SYNC_CONFLICT_DETECTED` | campo, valor_google, valor_sgti |
| Provisionamento iniciado | `PROVISIONING_STARTED` | user_email, iniciado por |
| Provisionamento concluído | `PROVISIONING_COMPLETED` | user_email, google_user_id |
| Provisionamento falhou | `PROVISIONING_FAILED` | user_email, erro, tentativa n |
| Desprovisionamento iniciado | `DEPROVISIONING_STARTED` | user_email, iniciado por, motivo |
| Passo de desprovisionamento executado | `DEPROVISIONING_STEP` | passo, timestamp, resultado |
| Desprovisionamento concluído | `DEPROVISIONING_COMPLETED` | user_email, duração total |
| API Key utilizada (amostragem 10%) | `API_KEY_USED` | key_id, endpoint, IP |
| API Key emitida | `API_KEY_ISSUED` | escopo, válida_até, emitida_por |
| Webhook disparado | `WEBHOOK_DISPATCHED` | evento, destinatário, status |

### 13.2 Trilha de Auditoria de Sync

Para cada execução de sync, uma trilha estruturada é preservada:

```
SyncExecution (audit_log)
  job_name: "GoogleUserSyncJob"
  started_at: "2026-06-09T02:00:01Z"
  completed_at: "2026-06-09T02:04:37Z"
  duration_seconds: 276
  users_processed: 142
  users_updated: 3
  users_created: 1
  users_suspended: 0
  conflicts_detected: 0
  errors: 0
  status: "COMPLETED_SUCCESS"
```

---

## 14. Logs

### 14.1 Logs Estruturados da Integração Google

Todo evento da integração Google gera log JSON estruturado:

```json
{
  "timestamp": "2026-06-09T02:01:15.234Z",
  "level": "info",
  "service": "sgti-backend",
  "module": "GoogleIntegrationModule",
  "job": "GoogleUserSyncJob",
  "action": "sync.user.updated",
  "google_user_id": "123456789012345678901",
  "email": "joao.silva@empresa.com.br",
  "fields_updated": ["job_title", "google_org_unit"],
  "duration_ms": 45,
  "correlation_id": "uuid-da-execução-do-job"
}
```

### 14.2 Níveis de Log por Evento

| Nível | Situações |
|:-----:|-----------|
| `INFO` | Sync bem-sucedida, usuário provisionado/desprovisionado, campo atualizado |
| `WARN` | Usuário externo sem conta SGTI tentou login; campo conflitante ignorado |
| `ERROR` | Falha de API Google (timeout, 5xx); falha de provisionamento; divergência crítica |
| `DEBUG` | Payload JSON do Google (apenas non-prod); headers de requisição |

### 14.3 Retenção de Logs

| Tipo | Retenção |
|:----:|:--------:|
| Logs de aplicação (Vercel) | 30 dias |
| audit_log (shared.audit_log) | Indefinida |
| `google_data_snapshot` (GoogleUserReference) | 90 dias (substituído a cada sync) |
| Registros de SyncExecution | 1 ano |

---

## 15. Tratamento de Falhas

### 15.1 Falhas de Autenticação (OAuth)

| Falha | Causa | Resposta ao Usuário |
|:-----:|:-----:|:-------------------:|
| `invalid_grant` | Token expirado ou revogado | Redirecionar para login Google |
| `access_denied` | Usuário cancelou o consentimento | "Login cancelado. Tente novamente." |
| `hd_mismatch` | Conta de domínio errado | "Use sua conta corporativa @empresa.com.br" |
| `account_suspended` | Conta Google suspensa | "Conta suspensa. Contate o suporte de TI." |
| Timeout Google | Indisponibilidade Google | "Serviço temporariamente indisponível. Tente em instantes." |

### 15.2 Falhas de Sincronização

| Tipo de Falha | Ação | Alerta |
|:-------------:|:----:|:------:|
| Timeout Admin SDK (5s) | Retry após 30s; até 5 tentativas | Após 3 falhas consecutivas |
| Rate limit (429) | Backoff exponencial; respeita `Retry-After` | Após 1h de rate limiting |
| Token de SA expirado | Renovação automática; nova requisição | Nenhum (transparente) |
| SA chave inválida | Falha permanente; sem retry | IT_MANAGER urgente |
| Domínio não autorizado | Falha permanente | SUPER_ADMIN alertado |

### 15.3 Circuit Breaker para Google Admin SDK

```
CIRCUIT BREAKER — GOOGLE ADMIN SDK

CLOSED (normal): chamadas executam normalmente
  threshold: 5 falhas consecutivas → OPEN

OPEN (degradado — 15 minutos):
  → Chamadas bloqueadas (fail-fast)
  → Jobs de sync suspensos
  → Autenticação de usuários NÃO afetada (usa Supabase Auth)
  → IT_MANAGER notificado imediatamente

HALF-OPEN (após 15 min):
  → 1 chamada de teste
  → Sucesso → CLOSED (sync retomada)
  → Falha → OPEN por mais 15 min
```

**Impacto no usuário final:** O circuit breaker do Admin SDK **não afeta a autenticação de usuários** (que usa OAuth diretamente). Apenas operações de provisionamento e sync são afetadas.

### 15.4 Usuário em PENDING_PROVISIONING

```
MONITORAMENTO DE PENDING_PROVISIONING

Job PendingProvisioningRetryJob (a cada 30 min):
  Busca auth.User WHERE status = PENDING_PROVISIONING
    AND created_at > NOW() - INTERVAL '3 hours'
  Para cada usuário:
    Tenta GoogleDirectoryAdapter.createAccount()
    Sucesso → status = ACTIVE
    Falha → incrementa tentativa_count

  Se tentativa_count >= 6 (3 horas de tentativas):
    → IT_MANAGER notificado: "Provisionamento falhou para {email}"
    → status permanece PENDING_PROVISIONING
    → SUPER_ADMIN pode provisionar manualmente
```

---

## 16. Dashboards e Indicadores

### 16.1 Painel de Identidades

**Destino:** IT_MANAGER, SUPER_ADMIN. Atualizado via Supabase Realtime.

| Componente | Dados Exibidos |
|------------|---------------|
| **Usuários Ativos** | COUNT(status = ACTIVE) por domínio e departamento |
| **Usuários Bloqueados** | COUNT(status = SUSPENDED) com motivo e data |
| **Usuários por Departamento** | Distribuição por OrgUnit/Department |
| **Usuários por Gestor** | Top 10 gestores com mais liderados |
| **Provisionamentos Pendentes** | COUNT(status = PENDING_PROVISIONING) |
| **Sem Revisão de Acesso** | COUNT(next_access_review_due < TODAY) |
| **MFA Desabilitado** | COUNT(mfa_enabled = false) por papel crítico |
| **Última Sincronização** | Timestamp + duração + status de cada job |
| **Falhas de Sync** | COUNT(sync_status = ERROR) nos últimos 7 dias |
| **Circuit Breaker** | Estado atual (CLOSED/OPEN/HALF-OPEN) |

### 16.2 Indicadores Operacionais

| KPI | Fórmula | Meta |
|-----|---------|:----:|
| **Usuários Ativos** | COUNT(status = ACTIVE) | — |
| **Taxa de MFA** | COUNT(mfa_enabled=true) / COUNT(ACTIVE) × 100 | 100% (papéis críticos) |
| **Provisioning Success Rate** | COUNT(ACTIVE) / COUNT(ACTIVE+PENDING_PROVISIONING) × 100 | ≥ 99% |
| **Sync Success Rate** | Syncs OK / Total syncs × 100 | ≥ 99,5% |
| **Conflitos de Sync** | COUNT(sync_status = CONFLICT) | ≤ 5 |
| **Tempo Médio de Provisionamento** | AVG(created_at → status=ACTIVE) | ≤ 10 min |
| **Tempo Médio de Desprovisionamento** | AVG(iniciado → DEPROVISIONED) | ≤ 2 horas |

---

## 17. Relatórios

### 17.1 Relatórios Operacionais Automáticos

| Relatório | Geração | Destinatário | Conteúdo |
|-----------|:-------:|:------------:|---------|
| **Status Diário de Identidades** | Diária (07h) | IT_MANAGER | Novos usuários, suspensos, reativados, falhas de sync |
| **Provisionamentos Pendentes** | Diária (07h) | IT_MANAGER | Usuários em PENDING_PROVISIONING com tempo de espera |
| **Revisões de Acesso Vencidas** | Semanal (seg) | IT_MANAGER | Usuários com `next_access_review_due` < TODAY |
| **Usuários sem Gestor** | Semanal | IT_MANAGER | Usuários ativos sem `manager_id` |

### 17.2 Relatórios Gerenciais

| Relatório | Frequência | Destinatário | Conteúdo |
|-----------|:----------:|:------------:|---------|
| **Inventário de Identidades** | Mensal | IT_MANAGER + Compliance | Todos os usuários com status, papéis e gestor |
| **Ciclo de Provisionamento** | Mensal | IT_MANAGER | Onboardings e offboardings do período |
| **Análise de MFA** | Mensal | IT_MANAGER + Compliance | Cobertura de MFA por departamento e papel |

### 17.3 Relatórios de Compliance

| Relatório | Frequência | Destinatário | Conteúdo |
|-----------|:----------:|:------------:|---------|
| **Revisão de Acessos** | Trimestral | Compliance + IT_MANAGER | Papéis atribuídos e resultado das revisões |
| **Auditoria de Identidades** | Semestral | Compliance | Provisionamentos, revogações, anomalias |
| **Conformidade de MFA** | Trimestral | Compliance | Usuários com papéis críticos sem MFA |

---

## 18. Compliance e Conformidade

### 18.1 Requisitos de Conformidade Atendidos

| Norma | Controle | Atendimento |
|-------|----------|:-----------:|
| **ISO/IEC 27001** | A.9.2.1 — Registro e Cancelamento de Usuário | Provisionamento/desprovisionamento com trilha |
| **ISO/IEC 27001** | A.9.2.2 — Provisionamento de Acesso | Processo formal via requisição com aprovação |
| **ISO/IEC 27001** | A.9.2.6 — Remoção de Direitos de Acesso | Offboarding automatizado com evidência |
| **ISO/IEC 27001** | A.9.4.2 — Procedimentos de Login Seguro | OAuth 2.0 + PKCE + MFA via Google |
| **LGPD** | Art. 46 — Medidas de Segurança | Autenticação forte (OAuth + MFA) |
| **LGPD** | Art. 47 — Responsabilidade dos Agentes | Audit log completo de acessos |
| **BACEN 4.893** | Gestão de Identidades em IFs | Provisionamento formal + revisão trimestral |
| **NIST SP 800-53** | AC-2 — Account Management | Ciclo completo: criação → revisão → encerramento |

### 18.2 Evidências Geradas Automaticamente para Auditoria

| Evidência | Gerada Quando | Destinatário |
|:--------:|:-------------:|:------------:|
| Formulário de provisionamento com aprovadores | Ao concluir provisionamento | Compliance + IT_MANAGER |
| Relatório de offboarding com passos executados | Ao concluir desprovisionamento | Compliance + IT_MANAGER |
| Resultado da revisão trimestral de acessos | Ao concluir cada ciclo | Compliance + IT_MANAGER |
| Relatório de usuários sem MFA em papéis críticos | Mensal | Compliance + IT_MANAGER |

---

## 19. Regras de Negócio

As regras a seguir complementam as regras BR-GWS-001 a BR-GWS-006 definidas em `Docs/24_BUSINESS_RULES.md`.

---

**GWS-001** — Google Workspace é a fonte oficial das identidades
Dados de identificação de usuários (nome, e-mail, departamento, cargo, gestor) têm o Google Workspace como fonte de autoridade. Em caso de conflito, o valor do Google prevalece para campos sincronizados.
**Referência:** BR-GWS-001

---

**GWS-002** — Usuários desativados no Google são bloqueados no SGTI em até 24h
Conta suspensa no Google (`suspended=true`) é detectada pelo `GoogleStatusSyncJob` (30 min) ou `GoogleUserSyncJob` (24h) e resulta em suspensão no SGTI com revogação de sessões.
**Referência:** BR-GWS-002

---

**GWS-003** — Toda sincronização deve ser auditada
Cada execução de job de sincronização gera registro em `shared.audit_log` com escopo, duração, quantidade de registros processados e erros.

---

**GWS-004** — Todo usuário deve possuir e-mail corporativo
O e-mail de todo usuário do SGTI deve pertencer ao domínio corporativo configurado. Contas `@gmail.com` ou de outros domínios são rejeitadas na autenticação (`hd` claim validado).
**Referência:** BR-GWS-001

---

**GWS-005** — Todo usuário deve possuir gestor associado
Usuários ativos sem `manager_id` preenchido geram alerta semanal ao IT_MANAGER. O gestor é necessário para aprovações em requisições e revisões de acesso.

---

**GWS-006** — Toda alteração de campo sincronizado deve possuir rastreabilidade
Cada campo atualizado pela sincronização Google registra em `audit_log`: `old_value`, `new_value`, campo alterado, timestamp e job que executou.
**Referência:** BR-GWS-006

---

**GWS-007** — Campos SGTI-exclusivos nunca sobrescritos pela sincronização
Campos como `roles`, `locale`, `timezone`, `cost_center_id`, `manager_id`, `department_id`, preferências de notificação são gerenciados exclusivamente pelo SGTI e jamais alterados pelos jobs de sync.
**Referência:** BR-GWS-006

---

**GWS-008** — E-mail do usuário é imutável após criação
O campo `email` de `auth.User` não pode ser alterado após criação. Mudança de e-mail corporativo (ex.: casamento) requer desprovisionamento do usuário antigo e criação de novo usuário.

---

**GWS-009** — google_user_id é imutável após ser preenchido
Uma vez preenchido, o campo `google_user_id` não pode ser alterado por nenhuma operação — nem por sync, nem por IT_MANAGER. Imutabilidade garantida por RLS.

---

**GWS-010** — Desprovisionamento Google antes de inativar no SGTI
A suspensão da conta Google ocorre obrigatoriamente antes de marcar o usuário como INACTIVE no SGTI. Alterar a ordem é violação de segurança.
**Referência:** BR-GWS-004

---

**GWS-011** — Provisionamento Google automático ao criar usuário no SGTI
Ao criar usuário via `ProvisionUserUseCase` (REQ-TYPE-001 aprovado), o provisionamento Google é disparado automaticamente sem necessidade de ação manual.
**Referência:** BR-GWS-003

---

**GWS-012** — Conta Google recém-suspensa: revogação de sessões SGTI imediata
Ao detectar `google.suspended = true` via `GoogleStatusSyncJob`, as sessões SGTI são revogadas imediatamente (blacklist Redis), sem aguardar o próximo ciclo de sync.

---

**GWS-013** — Grupos sincronizados somente com label sgti:managed=true
O `GoogleGroupSyncJob` importa exclusivamente grupos com a label `sgti:managed=true` no Google Workspace, evitando importar centenas de grupos corporativos desnecessários.
**Referência:** BR-GWS-005

---

**GWS-014** — Membros de grupo sincronizados de forma destrutiva
A sync de membros de grupo é destrutiva: membros presentes no SGTI mas ausentes no Google são removidos do IdentityGroup automaticamente.

---

**GWS-015** — Contas de serviço não sincronizadas como usuários
Contas do tipo `SERVICE_ACCOUNT` ou com flag `isAdmin=true` sem e-mail de usuário real são filtradas e não criadas como `auth.User` no SGTI.

---

**GWS-016** — MFA obrigatório para papéis IT_MANAGER e superiores
Usuários com papel `IT_MANAGER`, `SUPER_ADMIN` ou `AUDITOR` devem ter `mfa_enabled = true`. Se detectado `false` na sync, alerta imediato ao IT_MANAGER.

---

**GWS-017** — Auto-provisionamento sem atribuição automática de papéis
Usuário que autentica via OAuth sem estar cadastrado no SGTI recebe apenas papel `END_USER`. Papéis adicionais requerem atribuição manual pelo IT_MANAGER.

---

**GWS-018** — Sync completa semanal obrigatória
O `GoogleUserSyncJob` realiza sync incremental diária E sync completa semanal (domingos). A sync completa garante integridade do inventário.

---

**GWS-019** — Renovação do Gmail Pub/Sub watch automática
O `GmailWatchRenewalJob` renova o Gmail watch com 24h de antecedência. Falha na renovação ativa modo IMAP exclusivo e alerta ao IT_MANAGER.

---

**GWS-020** — Service Account key rotacionada semestralmente
A chave JSON da Service Account é rotacionada semestralmente. SUPER_ADMIN coordena a troca com 7 dias de antecedência para evitar interrupções.

---

**GWS-021** — Conflito de sync registrado sem sobrescrever
Quando um campo tem `sync_status = CONFLICT` (Google e SGTI divergem em campos que não deveriam divergir), o SGTI registra o conflito sem sobrescrever automaticamente. IT_MANAGER decide a resolução.

---

**GWS-022** — Sync sob demanda requer IT_MANAGER+ e é auditada
Sincronização manual disparada via interface gera registro em audit_log com: usuário que disparou, escopo, horário de início e resultado.

---

**GWS-023** — Usuário provisionado recebe senha temporária com troca obrigatória
A conta Google criada pelo `GoogleDirectoryAdapter` recebe senha temporária com `changePasswordAtNextLogin = true`. O SGTI não armazena nem processa esta senha.

---

**GWS-024** — E-mail de boas-vindas com magic link em até 5 minutos após provisionamento
Após confirmação de provisionamento Google bem-sucedido, e-mail de boas-vindas enviado ao novo usuário em até 5 minutos.

---

**GWS-025** — Usuário em PENDING_PROVISIONING tem retry a cada 30 minutos
O `PendingProvisioningRetryJob` tenta reprovisionar automaticamente a cada 30 minutos por até 3 horas. Após 6 tentativas falhadas, IT_MANAGER notificado para ação manual.

---

**GWS-026** — Desprovisionamento por etapas com timestamps obrigatórios
Cada etapa do offboarding (seção 9.2) é registrada com timestamp exato em `audit_log`. O relatório de offboarding inclui a duração de cada etapa.

---

**GWS-027** — Hierarquia de gestores validada contra loops circulares
O `GestorResolutionJob` detecta loops na cadeia de gestores (A → B → A) e alerta ao IT_MANAGER para correção. Loops são quebrados automaticamente nulificando o gestor do usuário que fecha o loop.

---

**GWS-028** — Usuário externo (fora do domínio) pode existir como contato
Contatos externos sem conta SGTI podem ser registrados como stakeholders em projetos ou como destinatários externos em comunicações, sem acesso ao sistema.

---

**GWS-029** — Taxa de uso da API corporativa monitorada
O uso da API Corporativa de Identidades é monitorado por API Key. Rate limit padrão: 100 req/min. Exceder o limite retorna 429 e é registrado em audit_log.

---

**GWS-030** — API Key corporativa com escopo mínimo necessário
SUPER_ADMIN não pode emitir API Key com escopo superior ao necessário para a integração. API Key para sistema de RH que só precisa ler usuários não deve ter escopo `identity:write`.

---

**GWS-031** — Webhook corporativo com assinatura HMAC-SHA256
Todos os webhooks de identidade enviados para sistemas externos incluem o header `X-SGTI-Signature: sha256={hash}`. Sistemas que não validam a assinatura têm webhook desativado após 3 falhas de validação.

---

**GWS-032** — Desprovisionamento emergencial não requer aprovação formal
Em situação de segurança crítica, IT_MANAGER pode suspender conta imediatamente sem fluxo de aprovação formal. A requisição REQ-TYPE-003 pode ser criada retroativamente em até 24h.

---

**GWS-033** — Revisor de acesso não pode ser o próprio usuário
Na revisão trimestral de acessos, o usuário não pode revisar seus próprios acessos. O formulário é enviado ao gestor direto ou, na ausência dele, ao IT_MANAGER.

---

**GWS-034** — Revisão de acesso trimestral: prazo de 15 dias úteis
Gestor tem 15 dias úteis para completar a revisão. Após este prazo: extensão de 5 dias + alerta ao IT_MANAGER. Após extensão: IT_MANAGER toma decisões pelos papéis não revistos.

---

**GWS-035** — Logs de sincronização retidos por 1 ano
Registros de `SyncExecution` (audit_log com action=SYNC_EXECUTED) são retidos por 1 ano para análise de tendências e auditoria de integridade do inventário.

---

**GWS-036** — Credenciais OAuth2 (Client ID/Secret) nunca commitadas no código
O `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` são armazenados exclusivamente como Vercel Secrets ou variáveis de ambiente. Detecção de secret em repositório bloqueia o PR automaticamente.

---

**GWS-037** — Estado de suspensão Google refletido em banner no SGTI
Se um usuário ativo no SGTI tem `google_account_suspended = true` na referência Google (conflito detectado antes da sync), banner de aviso é exibido no seu perfil para o IT_MANAGER.

---

**GWS-038** — Provisionamento de múltiplos usuários em lote: sem bloqueio de falha individual
Na importação em lote, a falha de provisionamento de um usuário individual não bloqueia o processamento dos demais. Relatório final detalha sucesso e falhas por usuário.

---

**GWS-039** — google_data_snapshot retido por 90 dias
O campo `identity.GoogleUserReference.google_data_snapshot` armazena o último payload completo recebido do Google. Substituído a cada sync; versão anterior preservada por 90 dias para diagnóstico.

---

**GWS-040** — Mudança de OrgUnit no Google: departamento atualizado no SGTI
Quando o `orgUnitPath` de um usuário muda no Google (transferência de departamento), o campo `department_name` e `google_org_unit` no SGTI são atualizados automaticamente na próxima sync.

---

**GWS-041** — Usuário removido do Google (deleted): tratado como INACTIVE no SGTI
Usuário com `deleted = true` no Google (deletado definitivamente, não suspenso) tem status alterado para INACTIVE no SGTI com a nota "Conta Google deletada".

---

**GWS-042** — Painel de identidades exibe contagem por departamento em tempo real
O dashboard de identidades usa Supabase Realtime para exibir distribuição de usuários por departamento atualizada em tempo real (< 5 segundos de latência).

---

**GWS-043** — E-mail de notificação de revisão de acesso enviado apenas para e-mails corporativos
O e-mail de formulário de revisão de acesso é enviado exclusivamente para endereços do domínio corporativo. Contatos externos não recebem formulários de revisão.

---

**GWS-044** — Conflito de sync: SGTI notifica e aguarda decisão do IT_MANAGER
Conflitos de sincronização não são resolvidos automaticamente. IT_MANAGER recebe notificação com a divergência e decide qual valor é correto.

---

**GWS-045** — Grupos Google sem membros SGTI ativos: alerta de inconsistência
Grupo Google sincronizado onde todos os membros do Google não existem no SGTI gera alerta ao IT_MANAGER (possível problema de sincronização de usuários).

---

**GWS-046** — Token JWT invalido ao detectar conta Google suspensa
O `TokenValidationJob` (a cada 5 min) verifica sessões ativas contra contas Google. Sessão com conta Google suspensa é invalidada imediatamente via blacklist Redis.

---

**GWS-047** — Novo grupo Google com sgti:managed=true notifica IT_MANAGER
Quando um grupo novo com `sgti:managed=true` é detectado na sync, o IT_MANAGER recebe notificação para configurar o tipo do grupo (SUPPORT, APPROVAL, etc.) no SGTI.

---

**GWS-048** — Relatório de conformidade de identidades exportável para auditorias externas
O Compliance Officer pode exportar pacote de evidências de identidades (inventário, provisionamentos, revisões de acesso) em PDF com hash SHA-256 para auditorias externas.

---

**GWS-049** — Usuário com data de desligamento futura: alertas automáticos de preparação
Usuário com `termination_date` definida recebe alertas automáticos ao IT_MANAGER: 5 dias antes (preparação), 1 dia antes (offboarding), no dia (execução).

---

**GWS-050** — Health check do Google Admin SDK monitorado externamente
O endpoint `/health/google` é monitorado a cada 5 minutos. Se retornar `down`, IT_MANAGER notificado imediatamente e modo degradado ativado (novas operações de sync suspensas).

---

**GWS-051** — OrgUnit path como origem para estrutura de departamentos
A estrutura hierárquica de departamentos no SGTI reflete o `orgUnitPath` do Google. Departamentos sem OrgUnit correspondente no Google são marcados como `orphaned` e precisam de tratativa manual.

---

**GWS-052** — Usuário ativo sem login por 90 dias: alerta de conta ociosa
Conta ACTIVE sem `last_sign_in` nos últimos 90 dias gera alerta semanal ao IT_MANAGER para verificar se o acesso ainda é necessário.

---

**GWS-053** — Sync incremental usa timestamp da última execução bem-sucedida
O `GoogleUserSyncJob` incremental usa `updatedMin = last_successful_sync_at` para buscar apenas usuários alterados. Se `last_successful_sync_at` for nulo, executa sync completa.

---

**GWS-054** — API Corporativa com paginação obrigatória para listas grandes
Endpoints da API Corporativa que retornam coleções implementam paginação obrigatória (padrão: 25 por página, máximo: 100). Sem paginação, o sistema não retorna mais de 100 registros.

---

**GWS-055** — Remoção de grupo Google (sgti:managed=true removida): IdentityGroup inativado
Se a label `sgti:managed=true` for removida de um grupo Google, o `IdentityGroup` correspondente no SGTI é marcado como `is_active = false` na próxima sync semanal.

---

**GWS-056** — Usuário com papel crítico sem revisão de acesso há 90 dias: bloqueio automático
Usuários com papel `IT_MANAGER` ou superior sem revisão de acesso há mais de 90 dias têm o acesso suspenso temporariamente até que o IT_MANAGER realize a revisão.

---

**GWS-057** — Múltiplas instâncias do job de sync: mutex obrigatório
Jobs de sincronização usam mutex distribuído (Redis) para garantir que apenas uma instância execute por vez. Segunda instância detectada: aguarda ou aborta com log.

---

**GWS-058** — Todos os endpoints da API Corporativa exigem HTTPS
A API Corporativa de Identidades só aceita conexões HTTPS. Requisições HTTP são redirecionadas ou rejeitadas pelo Cloudflare.

---

**GWS-059** — Dados de usuário na API Corporativa: pseudonimização parcial
A API Corporativa retorna `user_id` (UUID) como identificador principal. Campos como `employee_id` e dados sensíveis de RH requerem escopo adicional `identity:sensitive`.

---

**GWS-060** — Auditoria de acesso à API Corporativa: amostragem de 10%
Por volume, o acesso à API Corporativa é auditado em amostragem de 10% das requisições (todas as operações de escrita são sempre auditadas). Operações de `deprovision` são sempre auditadas 100%.

---

## 20. Critérios de Aceitação

### 20.1 Autenticação e OAuth

- [ ] **CA-01:** Login com conta `@gmail.com` (domínio pessoal) rejeitado com mensagem orientativa.
- [ ] **CA-02:** Login com conta corporativa válida autentica corretamente e emite JWT RS256.
- [ ] **CA-03:** JWT expira em 1 hora; refresh token funciona dentro de 30 dias.
- [ ] **CA-04:** Conta Google suspensa rejeita login no SGTI com código 403.
- [ ] **CA-05:** CSRF protegido via `state` parameter no fluxo OAuth.

### 20.2 Sincronização de Usuários

- [ ] **CA-06:** `GoogleUserSyncJob` executa diariamente às 02h00 sem intervenção manual.
- [ ] **CA-07:** Campos SGTI-exclusivos não são sobrescritos pela sincronização.
- [ ] **CA-08:** Conta Google suspensa detectada e refletida no SGTI em até 30 minutos.
- [ ] **CA-09:** Novo usuário Google (sem conta SGTI) criado automaticamente com status ACTIVE.
- [ ] **CA-10:** Campo `google_user_id` imutável após ser preenchido.
- [ ] **CA-11:** Sync completa semanal executa nos domingos e gera relatório de integridade.

### 20.3 Sincronização de Grupos e Departamentos

- [ ] **CA-12:** Apenas grupos com `sgti:managed=true` são sincronizados.
- [ ] **CA-13:** Membros removidos do grupo Google são removidos do IdentityGroup no SGTI.
- [ ] **CA-14:** Novo grupo com `sgti:managed=true` notifica IT_MANAGER para configuração de tipo.
- [ ] **CA-15:** Departamentos refletem a hierarquia de OrgUnits do Google.

### 20.4 Provisionamento

- [ ] **CA-16:** Aprovação de REQ-TYPE-001 dispara provisionamento automático no Google em até 5 minutos.
- [ ] **CA-17:** E-mail de boas-vindas enviado em até 5 minutos após provisionamento concluído.
- [ ] **CA-18:** `PendingProvisioningRetryJob` realiza retry a cada 30 minutos; IT_MANAGER notificado após 6 falhas.
- [ ] **CA-19:** Provisionamento em lote: falha individual não bloqueia outros usuários.

### 20.5 Desprovisionamento

- [ ] **CA-20:** Sessões SGTI revogadas imediatamente ao iniciar offboarding.
- [ ] **CA-21:** Conta Google suspensa em até 2 horas após aprovação de REQ-TYPE-003.
- [ ] **CA-22:** Relatório de offboarding gerado automaticamente com timestamps de cada etapa.
- [ ] **CA-23:** Ordem de desprovisionamento respeitada: sessões → Google → responsabilidades → papéis → inativar.

### 20.6 API Corporativa

- [ ] **CA-24:** API Key inválida retorna 401; tentativa registrada em audit_log.
- [ ] **CA-25:** `GET /v1/identities/{email}` retorna dados completos para email válido.
- [ ] **CA-26:** Rate limit de 100 req/min por API Key funciona corretamente; 429 retornado ao exceder.
- [ ] **CA-27:** Webhook de `user.deprovisioned` entregue corretamente ao sistema registrado.
- [ ] **CA-28:** Paginação obrigatória funciona em todas as listas (`/v1/identities`, `/v1/groups`).

### 20.7 Segurança e Auditoria

- [ ] **CA-29:** Service Account Key armazenada exclusivamente como Vercel Secret (não no código).
- [ ] **CA-30:** Circuit breaker abre após 5 falhas Admin SDK; IT_MANAGER notificado.
- [ ] **CA-31:** `audit_log` registra todos os eventos de sync e provisionamento com campos obrigatórios.
- [ ] **CA-32:** MFA desabilitado para papel IT_MANAGER gera alerta imediato.

### 20.8 Dashboards e Relatórios

- [ ] **CA-33:** Dashboard exibe usuários por status em tempo real (latência < 5s).
- [ ] **CA-34:** Relatório diário de identidades gerado automaticamente às 07h00.
- [ ] **CA-35:** Pacote de evidências para auditoria externa exportável pelo Compliance Officer.

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação com 20 seções, 60 regras GWS e 35 critérios de aceitação |

---

> **Próximos documentos recomendados:**
> [`22_AUTHENTICATION.md`](./22_AUTHENTICATION.md) — Fluxos de autenticação detalhados
> [`44_IDENTITY_MANAGEMENT.md`](./44_IDENTITY_MANAGEMENT.md) — Módulo IAM (ciclo de vida de identidades)
> [`50_INTEGRATIONS.md`](./50_INTEGRATIONS.md) — Arquitetura geral de integrações
