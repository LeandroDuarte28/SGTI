# SGTI — Sistema de Gestão de Tecnologia da Informação
## Estratégia de Autenticação e Autorização

> **Classificação:** Interno — Confidencial
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI · Segurança da Informação
> **Documentos Relacionados:** [14_SECURITY_REQUIREMENTS.md](./14_SECURITY_REQUIREMENTS.md) · [12_ARCHITECTURE.md](./12_ARCHITECTURE.md) · [21_API_SPEC.md](./21_API_SPEC.md) · [20_DATABASE.md](./20_DATABASE.md)

---

## Sobre este Documento

Este documento define a **estratégia completa de autenticação e autorização do SGTI** — cobrindo fluxos de login, gestão de sessões, tokens JWT, controle de acesso baseado em papéis (RBAC), autenticação multifator, integração com Google Workspace, auditoria de acessos e controles de segurança. É a referência normativa que guia a implementação dos módulos `AuthModule` e `IdentityModule`.

**Premissa fundamental:** o SGTI não armazena senhas. Toda autenticação de usuários humanos é federada ao **Google Workspace via OAuth 2.0**. O **Supabase Auth** gerencia sessões e tokens de forma complementar à lógica de autenticação customizada do NestJS.

---

## Sumário

1. [Arquitetura de Autenticação](#1-arquitetura-de-autenticação)
2. [Fluxos de Autenticação](#2-fluxos-de-autenticação)
3. [Gestão de Sessões](#3-gestão-de-sessões)
4. [JWT — Tokens de Acesso](#4-jwt--tokens-de-acesso)
5. [RBAC — Controle de Acesso por Papel](#5-rbac--controle-de-acesso-por-papel)
6. [MFA — Autenticação Multifator](#6-mfa--autenticação-multifator)
7. [Integração Google Workspace](#7-integração-google-workspace)
8. [Auditoria de Acessos](#8-auditoria-de-acessos)
9. [Segurança — OWASP, LGPD e Proteção de APIs](#9-segurança--owasp-lgpd-e-proteção-de-apis)
10. [Matriz de Decisão de Autenticação](#10-matriz-de-decisão-de-autenticação)

---

## 1. Arquitetura de Autenticação

### 1.1 Visão Geral da Camada de Autenticação

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CAMADA DE AUTENTICAÇÃO                      │
│                                                                     │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐    │
│  │  Next.js     │   │  NestJS      │   │  Google Workspace    │    │
│  │  Frontend    │   │  Backend     │   │  OAuth 2.0 + MFA     │    │
│  │              │   │              │   │  Admin SDK           │    │
│  │  Auth Pages  │   │  AuthModule  │   │                      │    │
│  │  Middleware  │◄──►  JwtGuard   │◄──►  id_token validation │    │
│  │  Cookies     │   │  RolesGuard  │   │  User provisioning   │    │
│  └──────┬───────┘   └──────┬───────┘   └──────────────────────┘    │
│         │                  │                                         │
│         └──────────────────▼─────────────────────────────────────┐  │
│                     ┌──────────────────────────────────────────┐ │  │
│                     │           Supabase                        │ │  │
│                     │                                          │ │  │
│                     │  PostgreSQL (auth schema)                │ │  │
│                     │  Sessions · RefreshTokens · AuditLog     │ │  │
│                     │  RLS Policies                            │ │  │
│                     └──────────────────────────────────────────┘ │  │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Componentes da Autenticação

| Componente | Tecnologia | Responsabilidade |
|------------|-----------|-----------------|
| **Identity Provider** | Google Workspace | Autenticação primária, MFA, diretório de usuários |
| **OAuth Client** | NestJS + Passport.js | Gerenciar o fluxo OAuth 2.0 com PKCE |
| **Token Issuer** | NestJS (JWT RS256) | Emitir e validar tokens SGTI com claims de negócio |
| **Session Store** | Supabase PostgreSQL | Persistir refresh tokens e metadados de sessão |
| **API Gateway** | NestJS Guards | Validar tokens e enforçar RBAC em cada endpoint |
| **RLS Layer** | Supabase PostgreSQL | Segunda camada de autorização no nível do banco |
| **Frontend Guard** | Next.js Middleware | Proteger rotas do frontend; redirecionar para login |
| **Audit Trail** | Supabase PostgreSQL | Registrar todos os eventos de autenticação |

### 1.3 Princípios de Design

| Princípio | Implementação |
|-----------|--------------|
| **Zero senha local** | Nenhuma senha armazenada no SGTI — autenticação 100% via Google |
| **Defense in depth** | Autenticação em 3 camadas: OAuth → JWT Guard → RLS |
| **Stateless API** | JWT stateless — sem estado de sessão na memória da aplicação |
| **Token binding** | Refresh token vinculado ao device fingerprint e IP para detecção de anomalias |
| **Principle of least privilege** | Cada papel tem apenas as permissões mínimas necessárias |
| **Fail secure** | Na ausência de permissão explícita, acesso é negado |

---

## 2. Fluxos de Autenticação

### 2.1 Login via Google OAuth 2.0 com PKCE

O fluxo padrão de autenticação do SGTI. Utiliza **PKCE (Proof Key for Code Exchange)** para prevenir ataques de interceptação de authorization code, especialmente em aplicações SPA e mobile.

#### 2.1.1 Fluxo Completo

```
ETAPA 1 — INÍCIO (Frontend → Backend)
──────────────────────────────────────
Usuário clica em "Entrar com Google"
  │
  ▼
Frontend gera:
  code_verifier = random(64 bytes), base64url-encoded
  code_challenge = SHA256(code_verifier), base64url-encoded
  state = random UUID v4 (anti-CSRF)

Frontend armazena temporariamente:
  code_verifier → sessionStorage (apenas durante o fluxo, descartado após callback)
  state → cookie SameSite=Strict, HttpOnly, TTL 10 minutos

Frontend redireciona para Backend:
  GET /api/v1/auth/google/init?redirect_uri=/dashboard

Backend gera URL de autorização Google:
  https://accounts.google.com/o/oauth2/auth
    ?client_id={GOOGLE_CLIENT_ID}
    &redirect_uri={CALLBACK_URL}
    &response_type=code
    &scope=openid email profile
    &hd={CORPORATE_DOMAIN}             ← restringe ao domínio corporativo
    &code_challenge={code_challenge}
    &code_challenge_method=S256
    &state={state}
    &access_type=offline
    &prompt=select_account             ← força seleção de conta

Backend redireciona usuário para Google

──────────────────────────────────────
ETAPA 2 — AUTENTICAÇÃO NO GOOGLE
──────────────────────────────────────
Usuário autentica na tela do Google
  ├── Google verifica credenciais
  ├── Google aplica política de MFA (se configurada no Workspace)
  └── Google redireciona para callback

──────────────────────────────────────
ETAPA 3 — CALLBACK (Google → Backend)
──────────────────────────────────────
GET /api/v1/auth/callback?code=AUTH_CODE&state=STATE

Backend valida:
  ✓ state == state armazenado para o IP/sessão
  ✓ state não expirou (< 10 minutos)
  ✓ code está presente

Backend troca code por tokens Google:
  POST https://oauth2.googleapis.com/token
    code=AUTH_CODE
    code_verifier=CODE_VERIFIER         ← validação PKCE
    redirect_uri=CALLBACK_URL
    client_id=GOOGLE_CLIENT_ID
    client_secret=GOOGLE_CLIENT_SECRET
    grant_type=authorization_code

Backend valida id_token retornado:
  ✓ Assinatura RS256 com chave pública Google (JWK URI dinâmico)
  ✓ iss = "accounts.google.com"
  ✓ aud = GOOGLE_CLIENT_ID
  ✓ exp > now() (com tolerância de 5 min para clock skew)
  ✓ hd = CORPORATE_DOMAIN (rejeitar contas @gmail.com pessoais)

──────────────────────────────────────
ETAPA 4 — CRIAÇÃO/ATUALIZAÇÃO DE USUÁRIO
──────────────────────────────────────
Backend busca usuário pelo google_sub (ID imutável do Google):

  Se usuário NÃO existe:
    → Criar auth.User com status ACTIVE
    → Criar identity.Identity vinculada
    → Criar identity.GoogleUserReference
    → Atribuir papel padrão END_USER
    → Registrar AuditLog: action=LOGIN, first_login=true

  Se usuário EXISTE e status=ACTIVE:
    → Atualizar last_login_at, login_count
    → Sincronizar display_name, avatar_url, google_org_unit

  Se usuário EXISTE e status=SUSPENDED:
    → Rejeitar login com erro ACCOUNT_SUSPENDED
    → Registrar AuditLog: action=FAILED_LOGIN, reason=SUSPENDED

  Se usuário EXISTE e status=INACTIVE:
    → Rejeitar login com erro ACCOUNT_INACTIVE
    → Notificar IT_MANAGER

──────────────────────────────────────
ETAPA 5 — EMISSÃO DE TOKENS SGTI
──────────────────────────────────────
Backend emite:
  Access Token  → JWT RS256, TTL 1 hora
  Refresh Token → UUID opaco, TTL 7 dias

Backend persiste em auth.Session:
  refresh_token_hash = SHA256(refresh_token)
  user_id, ip_address, user_agent, expires_at

Backend define cookies na resposta:
  Set-Cookie: access_token=JWT; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=3600
  Set-Cookie: refresh_token=TOKEN; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth/refresh; Max-Age=604800

Backend redireciona para /dashboard (ou redirect_uri se fornecido)
```

#### 2.1.2 Diagrama de Sequência

```
Browser          Frontend          Backend           Google OAuth
   │                 │                 │                   │
   ├─ Clica Login ───►                 │                   │
   │                 ├─ Gera PKCE ─────►                   │
   │                 │   + state        │                   │
   │                 │◄─ Redirect URL ──│                   │
   │◄─ Redirect ─────│                 │                   │
   │                 │                 │                   │
   ├──────────── Autenticação Google (com MFA) ────────────►│
   │◄─────────── Callback com code + state ────────────────│
   │                 │                 │                   │
   ├─ GET /callback? ─────────────────►│                   │
   │   code + state  │                 ├─ Valida state      │
   │                 │                 ├─ POST /token ─────►│
   │                 │                 │◄─ id_token ────────│
   │                 │                 ├─ Valida id_token   │
   │                 │                 ├─ Cria/atualiza User│
   │                 │                 ├─ Emite JWT + RT    │
   │◄─ Set-Cookie ───────────────────── │                   │
   │   (access + refresh)              │                   │
   ├─ Redirect /dashboard ─────────────►                   │
```

---

### 2.2 Login por E-mail (Supabase Auth como fallback)

**Quando usar:** Contas de serviço, usuários de ambiente de desenvolvimento, situações de emergência onde o Google Workspace esteja indisponível.

**Importante:** O login por e-mail/senha **não é habilitado por padrão em produção**. Requer habilitação explícita pelo `SUPER_ADMIN` para cada usuário específico.

#### 2.2.1 Fluxo com Magic Link (preferido sobre senha)

```
FLUXO MAGIC LINK (sem senha)
─────────────────────────────
1. Usuário acessa /login e informa e-mail corporativo
2. Backend verifica que e-mail existe e está ativo
3. Backend solicita ao Supabase Auth envio de magic link
4. Supabase Auth envia e-mail com link de uso único (TTL 15 minutos)
5. Usuário clica no link
6. Backend valida token do magic link via Supabase Auth API
7. Backend emite JWT SGTI (mesmo fluxo do OAuth)
8. Cookies definidos e usuário redirecionado

RESTRIÇÕES DO MAGIC LINK:
  - Apenas para domínio corporativo (@empresa.com)
  - TTL do link: 15 minutos
  - Uso único: link invalidado após primeiro clique
  - Máximo de 3 solicitações por hora por e-mail (anti-abuse)
  - Auditoria: registrado com tipo LOGIN_MAGIC_LINK
```

#### 2.2.2 Fluxo com Senha (somente para contas de serviço)

```
FLUXO SENHA (restrito)
───────────────────────
HABILITADO APENAS PARA:
  - Contas de serviço (type=SERVICE_ACCOUNT)
  - Usuários de desenvolvimento local
  - Usuários explicitamente marcados com allow_password_login=true

FLUXO:
1. POST /api/v1/auth/login com { email, password }
2. Backend verifica que usuario.allow_password_login = true
3. Backend delega validação ao Supabase Auth
4. Supabase Auth valida hash da senha (bcrypt/argon2 — gerenciado pelo Supabase)
5. Se válido: Backend emite JWT SGTI
6. Registrar AuditLog: action=LOGIN, method=PASSWORD

PROIBIÇÕES:
  - Senha local para usuários do Google Workspace (allow_password_login=false por padrão)
  - O SGTI NUNCA armazena ou gerencia o hash de senha diretamente
  - Toda gestão de senha é delegada 100% ao Supabase Auth
```

---

### 2.3 Recuperação de Senha

**Aplicável apenas para:** usuários com login por e-mail habilitado (contas de serviço).
**Não aplicável para:** usuários Google Workspace (redefinição de senha é feita no Google Admin Console).

```
FLUXO DE RECUPERAÇÃO
──────────────────────
1. Usuário acessa /forgot-password e informa e-mail
2. Backend verifica existência do usuário (resposta genérica — sem revelar se e-mail existe)
3. Se usuário existe e allow_password_login=true:
   a. Backend solicita ao Supabase Auth envio de e-mail de recuperação
   b. Supabase Auth envia link com token único (TTL 30 minutos)
   c. Token é de uso único e vinculado ao IP solicitante
4. Usuário acessa link e define nova senha
5. Supabase Auth atualiza hash da senha
6. Todas as sessões ativas do usuário são revogadas
7. Notificação de alteração de senha enviada por e-mail
8. AuditLog: action=PASSWORD_RESET

RESPOSTA GENÉRICA OBRIGATÓRIA:
  Sempre responder: "Se o e-mail existir em nosso sistema, você receberá
  as instruções em breve." — nunca confirmar ou negar existência do e-mail.

RATE LIMITING:
  Máximo 3 solicitações de recuperação por e-mail a cada 1 hora.
  Máximo 10 solicitações por IP a cada 1 hora.
```

---

### 2.4 Alteração de Senha

**Aplicável apenas para:** usuários com login por e-mail habilitado.

```
FLUXO DE ALTERAÇÃO
───────────────────
Pré-requisito: Usuário autenticado

1. POST /api/v1/auth/change-password com { currentPassword, newPassword, confirmPassword }
2. Backend valida sessão ativa (JWT válido)
3. Backend re-autentica com senha atual (Supabase Auth)
4. Backend aplica regras de complexidade à nova senha:
   ├── Mínimo 12 caracteres
   ├── Ao menos 1 maiúscula, 1 minúscula, 1 número, 1 especial
   ├── Não pode ser igual às últimas 5 senhas
   └── Não pode conter o nome ou e-mail do usuário
5. Supabase Auth atualiza hash da senha
6. Sessões em outros dispositivos são revogadas (sessão atual mantida)
7. E-mail de confirmação de alteração enviado
8. AuditLog: action=PASSWORD_CHANGED

REGRAS DE COMPLEXIDADE:
  Implementadas na camada de aplicação NestJS,
  não exclusivamente delegadas ao Supabase Auth.
```

---

### 2.5 Convite de Usuários

O fluxo de convite permite que administradores adicionem usuários ao SGTI antes de seu primeiro login.

```
FLUXO DE CONVITE
─────────────────
ATOR: IT_MANAGER ou SUPER_ADMIN

1. POST /api/v1/users/invite com { email, roles, departmentId }
2. Backend valida que e-mail pertence ao domínio corporativo
3. Backend cria auth.User com status=PENDING
4. Backend gera token de convite (UUID v4, TTL 72 horas)
5. E-mail de convite enviado: "Você foi convidado para o SGTI. Clique para acessar."
6. Link do convite: /accept-invite?token=TOKEN
7. AuditLog: action=USER_INVITED, invited_by=userId

ACEITAÇÃO DO CONVITE:
1. Usuário acessa o link de convite
2. Backend valida token (existência, TTL, não utilizado)
3. Backend redireciona para fluxo Google OAuth (2.1)
4. Após autenticação Google bem-sucedida:
   a. Vincula conta Google à Identity pré-criada
   b. Atualiza status de PENDING para ACTIVE
   c. Invalida token de convite
   d. AuditLog: action=INVITE_ACCEPTED

REENVIO DE CONVITE:
  - Permitido se o token expirou ou não foi usado
  - IT_MANAGER pode reenviar via POST /api/v1/users/:id/resend-invite
  - Novo token gerado; token anterior invalidado

EXPIRAÇÃO DE CONVITE:
  - Tokens expirados são limpos por job semanal
  - Usuário com status PENDING há mais de 7 dias: notificação para IT_MANAGER
```

---

### 2.6 Primeiro Acesso

```
FLUXO DE PRIMEIRO ACESSO
──────────────────────────
Disparado quando: is_first_login = true no callback OAuth

1. Autenticação Google bem-sucedida (fluxo 2.1)
2. Backend detecta first_login=true no auth.User
3. Frontend exibe wizard de configuração inicial:

   PASSO 1 — Boas-vindas e aceite dos termos
     └── Usuário lê e aceita a Política de Uso do SGTI
         AuditLog: action=TERMS_ACCEPTED

   PASSO 2 — Configuração de preferências
     └── Fuso horário, locale, tema (claro/escuro)

   PASSO 3 — Tour guiado opcional
     └── Apresentação dos módulos disponíveis para o papel atribuído

   PASSO 4 — Revisão dos acessos atribuídos
     └── Exibe os módulos e funcionalidades que o usuário pode acessar
     └── Botão "Iniciar" que marca first_login=false

4. Backend atualiza auth.User:
   is_first_login = false
   first_login_completed_at = NOW()

5. AuditLog: action=FIRST_LOGIN_COMPLETED

CONFIGURAÇÃO DE NOTIFICAÇÕES (passo opcional):
  Usuário configura preferências de notificação:
  - Canais preferidos (in-app, e-mail)
  - Horário de silêncio
  - Frequência de resumos (diário, semanal)
```

---

## 3. Gestão de Sessões

### 3.1 Modelo de Sessão

O SGTI implementa **sessões stateless com refresh token stateful**. O Access Token JWT é stateless (validado localmente). O Refresh Token é stateful (persistido no banco para controle de revogação).

```
ESTRUTURA DE SESSÃO (auth.Session)
────────────────────────────────────
id               UUID    PK
user_id          UUID    FK → auth.User
refresh_token_hash  VARCHAR(64)  SHA-256 do token bruto (token nunca armazenado em texto plano)
status           ENUM    ACTIVE | REVOKED | EXPIRED
device_info      JSONB   { browser, os, device_type }
ip_address       INET    IP real (via Cloudflare CF-Connecting-IP)
country_code     CHAR(2) País de origem (via Cloudflare)
last_used_at     TIMESTAMPTZ  Último uso do refresh token
expires_at       TIMESTAMPTZ  Expiração do refresh (7 dias)
revoked_at       TIMESTAMPTZ  Quando foi revogado
revoked_by       UUID    Quem revogou (null = auto-expirado ou logout)
revoked_reason   TEXT    Motivo da revogação
created_at       TIMESTAMPTZ  Criação (login)
```

### 3.2 Políticas de Sessão por Papel

| Papel | Sessões Simultâneas | Timeout de Inatividade | TTL do Refresh Token |
|-------|:-------------------:|:----------------------:|:-------------------:|
| `END_USER` | 5 | 8 horas | 7 dias |
| `IT_TECHNICIAN` | 3 | 8 horas | 7 dias |
| `IT_SPECIALIST` | 3 | 8 horas | 7 dias |
| `ANALISTA` / `COORDENADOR` | 3 | 8 horas | 7 dias |
| `COMPLIANCE_OFFICER` | 2 | 4 horas | 3 dias |
| `FINANCIAL_ANALYST` | 2 | 4 horas | 3 dias |
| `IT_MANAGER` / `GESTOR` | 2 | 4 horas | 3 dias |
| `AUDITOR` | 2 | 2 horas | 1 dia |
| `EXECUTIVE` | 3 | 8 horas | 7 dias |
| `SUPER_ADMIN` | **1** | **30 minutos** | **1 dia** |

### 3.3 Ciclo de Vida da Sessão

```
[LOGIN]
   │
   ▼
ACTIVE ─── uso normal ──────────────────────────────────►
   │                                                     │
   │                                                     ▼
   │                                               EXPIRED (TTL atingido)
   │                                                     │
   │◄─── refresh bem-sucedido ──── AT expirado ──────────│
   │     (novo RT emitido,         (< 7d de RT)          │
   │      RT anterior revogado)                          │
   │                                                     │
   ├── logout explícito ─────────────────────────►       │
   │                                                     │
   ├── suspensão do usuário ────────────────────►        │
   │                                                     │
   ├── timeout de inatividade ──────────────────►        │
   │                                                     │
   └── reuse attack detectado ──────────────────►        │
                                                         │
                                                    REVOKED
```

### 3.4 Renovação de Sessão (Token Rotation)

```
FLUXO DE RENOVAÇÃO
───────────────────
Trigger: Access Token expirado (Frontend detecta 401 na resposta)

1. Frontend envia POST /api/v1/auth/refresh
   (cookie refresh_token incluído automaticamente)

2. Backend extrai refresh_token do cookie

3. Backend calcula SHA-256(refresh_token)
   e busca em auth.Session WHERE refresh_token_hash = hash

4. Validações:
   ✓ Sessão existe
   ✓ status = ACTIVE
   ✓ expires_at > now()
   ✓ user.status = ACTIVE

5. DETECÇÃO DE REUSE ATTACK:
   Se a sessão já foi rotacionada (status = REVOKED por rotação anterior):
     → Revogar TODAS as sessões do usuário
     → AuditLog: action=TOKEN_REUSE_DETECTED, severity=CRITICAL
     → Notificar IT_MANAGER por e-mail
     → Retornar 401 REFRESH_TOKEN_REVOKED

6. Rotação do Refresh Token:
   a. Marcar sessão atual como REVOKED (revoked_reason=ROTATED)
   b. Criar nova auth.Session com novo refresh_token
   c. Manter device_info e IP da sessão anterior

7. Emitir novo Access Token JWT (1 hora)

8. Definir novos cookies:
   Set-Cookie: access_token=NEW_JWT; HttpOnly; Secure; SameSite=Strict; Max-Age=3600
   Set-Cookie: refresh_token=NEW_RT; HttpOnly; Secure; SameSite=Strict; Max-Age=604800

9. AuditLog: action=SESSION_RENEWED

TIMEOUT DE INATIVIDADE:
  Se last_used_at < now() - inactivity_timeout (por papel):
    → Refresh token rejeitado com REFRESH_TOKEN_EXPIRED
    → Sessão marcada como EXPIRED
    → Usuário deve fazer novo login
```

### 3.5 Logout

```
LOGOUT VOLUNTÁRIO (usuário clica "Sair")
─────────────────────────────────────────
1. POST /api/v1/auth/logout
2. Backend extrai refresh_token do cookie
3. Backend localiza sessão e marca como REVOKED (reason=USER_LOGOUT)
4. Backend limpa cookies:
   Set-Cookie: access_token=; Max-Age=0; HttpOnly; Secure
   Set-Cookie: refresh_token=; Max-Age=0; HttpOnly; Secure
5. AuditLog: action=LOGOUT
6. Frontend redireciona para /login

LOGOUT DE TODAS AS SESSÕES (usuário)
──────────────────────────────────────
POST /api/v1/auth/logout-all
  → Revoga TODAS as sessões ativas do usuário
  → Mantém sessão atual ativa
  → AuditLog: action=LOGOUT_ALL_SESSIONS

LOGOUT FORÇADO (adminstrativo)
────────────────────────────────
POST /api/v1/admin/users/:id/revoke-all-sessions (IT_MANAGER+)
  → Revoga TODAS as sessões do usuário
  → Blacklist o user_id com TTL igual ao maior TTL de Access Token ativo (≤ 1h)
  → AuditLog: action=FORCED_LOGOUT, performed_by=adminUserId
  → E-mail de notificação ao usuário

A blacklist de user_id é verificada no JwtAuthGuard para invalidação imediata
do Access Token mesmo antes de sua expiração natural.
```

---

## 4. JWT — Tokens de Acesso

### 4.1 Configuração do Token

| Parâmetro | Valor |
|-----------|-------|
| Algoritmo | **RS256** (RSA + SHA-256, assimétrico) |
| Tamanho da chave RSA | 4096 bits |
| Access Token TTL | **1 hora** |
| Issuer (`iss`) | `https://sgti.[dominio]` |
| Audience (`aud`) | `sgti-api` |
| Armazenamento no cliente | Cookie `HttpOnly; Secure; SameSite=Strict` |

**Por que RS256 em vez de HS256:**
- Chave privada isolada exclusivamente no AuthModule do backend.
- Chave pública disponível em `GET /.well-known/jwks.json` para verificação distribuída.
- Preparado para microserviços futuros: cada serviço valida independentemente sem compartilhar segredo simétrico.
- Auditabilidade: comprometimento de um serviço não compromete a capacidade de emissão de novos tokens.

### 4.2 Claims do JWT SGTI

#### 4.2.1 Claims Padrão (Registered Claims — RFC 7519)

| Claim | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `iss` | string | Emissor | `"https://sgti.empresa.com"` |
| `aud` | string | Audiência | `"sgti-api"` |
| `sub` | UUID | Subject — user_id do SGTI | `"550e8400-e29b..."` |
| `iat` | unix | Emitido em | `1749506400` |
| `exp` | unix | Expira em | `1749510000` (iat + 3600) |
| `jti` | UUID | JWT ID único (rastreabilidade) | `"f47ac10b-..."` |

#### 4.2.2 Claims Customizados (SGTI Claims)

| Claim | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `email` | string | E-mail corporativo | `"joao@empresa.com"` |
| `name` | string | Nome de exibição | `"João Silva"` |
| `roles` | string[] | Papéis atribuídos ao usuário | `["IT_TECHNICIAN"]` |
| `modules` | string[] | Módulos acessíveis | `["INCIDENTS","ASSETS","KNOWLEDGE"]` |
| `orgUnit` | string | Unidade organizacional Google | `"/TI/Suporte"` |
| `tenantId` | UUID | Identificador do tenant | `"org-uuid"` |
| `sessionId` | UUID | ID da sessão ativa | `"session-uuid"` |
| `locale` | string | Locale do usuário | `"pt-BR"` |
| `avatarUrl` | string | URL do avatar (para UI) | `"https://..."` |
| `mfaVerified` | boolean | MFA verificado na sessão | `true` |
| `loginMethod` | string | Método de autenticação usado | `"google_oauth"` |

#### 4.2.3 Exemplo de Payload JWT

```json
{
  "iss": "https://sgti.empresa.com",
  "aud": "sgti-api",
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "iat": 1749506400,
  "exp": 1749510000,
  "jti": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "email": "joao.silva@empresa.com",
  "name": "João Silva",
  "roles": ["IT_TECHNICIAN"],
  "modules": ["INCIDENTS", "REQUESTS", "ASSETS", "KNOWLEDGE"],
  "orgUnit": "/TI/Suporte",
  "tenantId": "tenant-uuid",
  "sessionId": "session-uuid",
  "locale": "pt-BR",
  "avatarUrl": "https://lh3.googleusercontent.com/...",
  "mfaVerified": true,
  "loginMethod": "google_oauth"
}
```

### 4.3 Validação do JWT

O `JwtAuthGuard` do NestJS executa as seguintes validações em cada requisição:

```
SEQUÊNCIA DE VALIDAÇÃO (falha em qualquer etapa retorna 401)
──────────────────────────────────────────────────────────────

1. EXTRAÇÃO DO TOKEN
   ├── Extrair JWT do cookie access_token
   └── Se ausente: retornar 401 UNAUTHORIZED

2. VERIFICAÇÃO DE ASSINATURA
   ├── Carregar chave pública RSA (cache em memória, TTL 1h)
   └── Verificar assinatura RS256
       Se inválida: 401 INVALID_TOKEN

3. VERIFICAÇÃO DE CLAIMS PADRÃO
   ├── iss = "https://sgti.empresa.com"
   ├── aud = "sgti-api"
   ├── exp > now() (sem tolerância de clock skew em produção)
   └── iat <= now()
       Se qualquer falha: 401 TOKEN_EXPIRED ou 401 INVALID_CLAIMS

4. VERIFICAÇÃO DE BLACKLIST
   ├── Verificar se jti está na blacklist (tokens explicitamente revogados)
   ├── Verificar se sub (userId) está na blacklist (usuário forçado a logout)
   └── Se presente na blacklist: 401 TOKEN_REVOKED

5. VERIFICAÇÃO DO USUÁRIO
   ├── Buscar auth.User pelo sub (com cache de 1 minuto)
   ├── Verificar status = ACTIVE
   └── Se SUSPENDED ou INACTIVE: 401 ACCOUNT_SUSPENDED

6. POPULAÇÃO DO REQUEST CONTEXT
   └── Setar Request.user com os claims do JWT para uso pelos Controllers
```

### 4.4 Rotação e Revogação de Chaves

```
PAR DE CHAVES RS256
─────────────────────
Armazenamento:
  PRIVATE_KEY → Variável de ambiente SGTI_JWT_PRIVATE_KEY (Vercel Secret)
  PUBLIC_KEY  → Variável de ambiente SGTI_JWT_PUBLIC_KEY (Vercel Env)
              → Também exposto em GET /.well-known/jwks.json

Rotação Programada (anual):
  1. Gerar novo par de chaves (4096 bits)
  2. Configurar nova chave na Vercel (ambas chaves presentes temporariamente)
  3. Backend aceita tokens assinados com chave antiga E nova por 2 horas (grace period)
  4. Após 2 horas: remover chave antiga; invalidar todas as sessões ativas
  5. Registrar rotação em shared.audit_log

Rotação de Emergência (comprometimento):
  1. IMEDIATAMENTE: revogar chave privada antiga
  2. Configurar nova chave
  3. Invalidar TODAS as sessões ativas de todos os usuários
  4. Usuários precisam fazer novo login
  5. Notificar todos os usuários por e-mail
  6. Registrar incidente de segurança no Compliance
```

---

## 5. RBAC — Controle de Acesso por Papel

### 5.1 Mapeamento de Papéis do Sistema

O SGTI usa nomenclatura técnica interna (`role_code`) mapeada para nomenclatura de negócio exibida na interface:

| Role Code (Sistema) | Nome de Negócio | Hierarquia |
|--------------------|----------------|:---------:|
| `SUPER_ADMIN` | Super Administrador | 1 (mais alto) |
| `IT_MANAGER` | Gestor de TI | 2 |
| `IT_SPECIALIST` | Coordenador / Especialista de TI | 3 |
| `COMPLIANCE_OFFICER` | Analista de Compliance | 3 |
| `FINANCIAL_ANALYST` | Analista Financeiro | 3 |
| `PROJECT_MANAGER` | Gestor de Projetos | 3 |
| `IT_TECHNICIAN` | Analista de TI / Técnico | 4 |
| `AUDITOR` | Auditor | 4 (transversal — leitura ampla) |
| `EXECUTIVE` | Executivo / Diretor | 4 (transversal — dashboards) |
| `END_USER` | Usuário | 5 (mais restrito) |

**Herança:** Papéis de hierarquia mais alta NÃO herdam automaticamente os papéis inferiores — permissões são explícitas por papel. Um `IT_MANAGER` tem permissões definidas para o papel `IT_MANAGER`, não a soma de todos os papéis abaixo dele.

### 5.2 Perfis Detalhados

#### Perfil: Usuário (END_USER)

**Contexto:** Colaborador que consome serviços de TI sem responsabilidade técnica.

**Pode:**
- Abrir chamados de incidente e requisição para si mesmo.
- Consultar o status de seus próprios chamados.
- Adicionar comentários públicos em seus chamados.
- Acessar a Base de Conhecimento (artigos publicados).
- Receber e ler notificações.
- Avaliar artigos e atendimentos (CSAT).
- Consultar e atualizar seu próprio perfil.

**Não pode:**
- Ver chamados de outros usuários.
- Acessar módulos de gestão (Assets, Compliance, Finance, etc.).
- Atribuir chamados a técnicos.
- Publicar artigos na Base de Conhecimento.
- Acessar qualquer dashboard ou relatório.

---

#### Perfil: Analista de TI / Técnico (IT_TECHNICIAN)

**Contexto:** Profissional responsável pelo atendimento de chamados, gestão de ativos e suporte operacional.

**Pode:**
- Tudo que END_USER pode, mais:
- Ver e gerenciar todos os chamados atribuídos ao seu grupo.
- Criar e resolver incidentes e requisições.
- Transferir chamados para outros técnicos ou grupos.
- Registrar e alocar ativos (cadastro, atribuição, movimentação).
- Criar e editar artigos na Base de Conhecimento (status DRAFT).
- Consultar identidades e grupos (somente leitura).
- Acessar Dashboard Operacional.

**Não pode:**
- Publicar artigos na KB (requer IT_MANAGER).
- Acessar módulos de Compliance, Financeiro ou Projetos.
- Criar ou modificar definições de SLA.
- Descomissionar ativos (requer aprovação de IT_SPECIALIST).

---

#### Perfil: Coordenador / Especialista de TI (IT_SPECIALIST)

**Contexto:** Profissional sênior com conhecimento especializado em domínios específicos (Infraestrutura, Segurança, Sistemas).

**Pode:**
- Tudo que IT_TECHNICIAN pode, mais:
- Criar e gerenciar Problemas (investigação de causa raiz).
- Publicar Workarounds.
- Descomissionar ativos (após aprovação IT_MANAGER).
- Criar e gerenciar grupos de identidade.
- Acessar relatórios operacionais.
- Aprovar requisições dentro de seu escopo.

**Não pode:**
- Aprovar pedidos de compra acima do threshold.
- Acessar dados financeiros detalhados.
- Modificar configurações de RBAC.
- Criar auditorias de compliance.

---

#### Perfil: Analista de Compliance (COMPLIANCE_OFFICER)

**Contexto:** Profissional responsável por conformidade regulatória, auditorias e gestão de evidências.

**Pode:**
- Tudo que IT_TECHNICIAN pode (módulos básicos), mais:
- Acesso completo ao módulo de Compliance (auditorias, achados, evidências, planos de ação).
- Criar e gerenciar ciclos de auditoria.
- Coletar e aprovar evidências.
- Registrar e tratar não-conformidades.
- Acessar histórico de revisões de acesso (IAM — somente leitura).
- Exportar relatórios de compliance.
- Acessar Dashboard de Compliance.

**Não pode:**
- Criar ou aprovar achados criados por si mesmo (segregação de funções).
- Acessar dados financeiros detalhados.
- Provisionar ou desprovisionar usuários.

---

#### Perfil: Analista Financeiro (FINANCIAL_ANALYST)

**Contexto:** Profissional responsável pelo controle financeiro de TI, orçamento e contratos.

**Pode:**
- Tudo que IT_TECHNICIAN pode (módulos básicos), mais:
- Acesso completo ao módulo Financeiro (OPEX, CAPEX, Budget, Contratos).
- Cadastrar e gerenciar fornecedores.
- Registrar e aprovar despesas e investimentos.
- Gerar relatórios financeiros.
- Acessar módulo de Compras (somente leitura).
- Acessar Dashboard Financeiro.

**Não pode:**
- Aprovar seus próprios lançamentos financeiros (segregação de funções).
- Acessar dados de compliance.
- Provisionar usuários.

---

#### Perfil: Gestor de TI (IT_MANAGER)

**Contexto:** Responsável pela gestão operacional e estratégica da equipe de TI.

**Pode:**
- Acesso a todos os módulos operacionais (Incidentes, Requisições, Problemas, Ativos, SLA).
- Aprovar requisições e pedidos de compra dentro de seu threshold.
- Provisionar e desprovisionar usuários (com validação de identidade).
- Publicar artigos na Base de Conhecimento.
- Configurar catálogo de serviços e definições de SLA.
- Acessar todos os dashboards (exceto acesso bruto a audit_log).
- Gerar todos os relatórios operacionais.
- Forçar logout de usuários.
- Atribuir papéis até IT_SPECIALIST.

**Não pode:**
- Criar ou atribuir papel SUPER_ADMIN.
- Acessar diretamente a tabela audit_log (apenas via endpoints filtrados).
- Aprovar pedidos de compra acima de R$10.000 (requer SUPER_ADMIN ou EXECUTIVE).
- Anonimizar dados pessoais de usuários (requer SUPER_ADMIN).

---

#### Perfil: Super Administrador (SUPER_ADMIN)

**Contexto:** Acesso irrestrito ao sistema. Máximo de 2 titulares. Uso reservado para operações críticas.

**Pode:**
- Tudo no sistema, incluindo:
- Criar e atribuir qualquer papel.
- Anonimizar dados pessoais (LGPD).
- Exportar base completa de usuários.
- Acessar audit_log completo.
- Revogar qualquer sessão.
- Habilitar login por e-mail para usuários específicos.
- Gerenciar API Keys.
- Configurar integrações (Google Workspace, GLPI).

**Restrições especiais:**
- Máximo de 1 sessão simultânea.
- Timeout de inatividade de 30 minutos.
- Todo acesso gera notificação por e-mail para equipe de segurança.
- Acesso fora do horário comercial gera alerta de alta prioridade.

---

### 5.3 Matriz de Permissões por Módulo

| Módulo | END_USER | IT_TECH | IT_SPEC | COMP_OFF | FIN_ANA | IT_MGR | AUDITOR | EXEC | SUPER |
|--------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Incidentes** | C/R¹ | CRUD | CRUD | R | — | CRUD+ | R | R | CRUD |
| **Requisições** | C/R¹ | CRUD | CRUD | R | — | CRUD+ | R | R | CRUD |
| **Problemas** | R (KB) | R | CRUD | R | — | CRUD | R | R | CRUD |
| **Ativos** | R¹ | CRUD | CRUD | R | R | CRUD+ | R | R | CRUD |
| **Identidades** | R¹ | R | R+ | R | — | CRUD | R | — | CRUD |
| **Compliance** | — | — | — | CRUD | — | R+ | R | R | CRUD |
| **Financeiro** | — | — | — | — | CRUD | R+ | R | R | CRUD |
| **Compras** | — | C | R | — | R | CRUD+ | R | R | CRUD |
| **Projetos** | — | R | R+ | R | R | CRUD | R | R | CRUD |
| **Base KB** | R | CRUD | CRUD+ | R | R | CRUD+P | R | R | CRUD |
| **SLA** | — | R | R | R | — | CRUD | R | R | CRUD |
| **Catálogo** | R | R | R | R | R | CRUD | R | R | CRUD |
| **Notificações** | R/W¹ | R/W | R/W | R/W | R/W | R/W | R/W | R/W | CRUD |
| **Dashboard** | — | Oper. | Oper. | Comp. | Fin. | Todos | Todos | Exec. | Todos |
| **Relatórios** | — | Op. | Op. | Comp. | Fin. | Todos | Todos | Exec. | Todos |
| **Audit Log** | — | — | — | — | — | Limitado | FULL | — | FULL |

**Legenda:**
- CRUD: Create, Read, Update, Delete (lógico)
- C/R¹: Apenas próprios registros
- R: Somente leitura
- +: Inclui operações adicionais (publicar, aprovar, etc.)
- P: Pode publicar

---

### 5.4 Implementação Técnica do RBAC

```
FLUXO DE VERIFICAÇÃO DE AUTORIZAÇÃO (por requisição)
──────────────────────────────────────────────────────

Nível 1 — JwtAuthGuard (aplicado globalmente):
  ✓ Token válido e não expirado
  ✓ Usuário ativo
  → Se falhar: 401 Unauthorized

Nível 2 — RolesGuard (aplicado por endpoint via @Roles()):
  ✓ roles do JWT contêm ao menos um dos papéis permitidos
  → Se falhar: 403 Forbidden

Nível 3 — ModuleAccessGuard (aplicado por módulo):
  ✓ modules do JWT contêm o módulo requisitado
  → Se falhar: 403 INSUFFICIENT_MODULE_ACCESS

Nível 4 — Object-Level Authorization (em repositories):
  ✓ Recurso pertence ao escopo do usuário
  (ex: ticket.requesterId == userId OU usuário tem papel IT_TECHNICIAN+)
  → Se falhar: 404 NOT_FOUND (sem revelar existência do recurso)

Nível 5 — Supabase RLS (no banco de dados):
  ✓ Política RLS verifica user_id e role da sessão de banco
  → Barreira final independente da aplicação
```

---

## 6. MFA — Autenticação Multifator

### 6.1 Estratégia de MFA

O SGTI **não implementa MFA próprio**. O MFA é aplicado pelo Google Workspace e o SGTI herda essa proteção automaticamente via OAuth 2.0. Quando um usuário autentica via Google com MFA habilitado, o `id_token` retornado carrega evidência da verificação MFA.

**Vantagem desta abordagem:**
- Zero gestão de códigos TOTP, tokens hardware ou SMS pelo SGTI.
- MFA corporativo gerenciado centralmente no Google Admin Console.
- Novos métodos de MFA (passkeys, FIDO2) disponíveis automaticamente.
- Política de MFA enforçada independentemente do SGTI.

### 6.2 Regras de MFA por Papel

| Papel | MFA Obrigatório | Método Recomendado | Método Mínimo |
|-------|:--------------:|-------------------|:-------------:|
| `SUPER_ADMIN` | **Sim** | Chave de segurança FIDO2 (YubiKey) | FIDO2 |
| `IT_MANAGER` | **Sim** | Google Authenticator ou FIDO2 | TOTP |
| `IT_SPECIALIST` | **Sim** | Google Authenticator | TOTP |
| `COMPLIANCE_OFFICER` | **Sim** | Google Authenticator | TOTP |
| `FINANCIAL_ANALYST` | **Sim** | Google Authenticator | TOTP |
| `PROJECT_MANAGER` | **Sim** | Google Authenticator | TOTP |
| `AUDITOR` | **Sim** | Google Authenticator | TOTP |
| `IT_TECHNICIAN` | **Sim** | Google Authenticator | TOTP |
| `END_USER` | Recomendado | Google Authenticator | — |
| `EXECUTIVE` | **Sim** | Google Authenticator ou FIDO2 | TOTP |

### 6.3 Verificação de MFA no Callback

```
NO CALLBACK OAUTH, O BACKEND VERIFICA:

1. Se o usuário tem papel privilegiado (IT_TECHNICIAN ou acima):
   a. Verificar claim amr (Authentication Methods References) no id_token
      amr contém "mfa" se o Google aplicou MFA
   b. Se amr NÃO contém "mfa" E usuário tem papel IT_TECHNICIAN+:
      → Verificar se MFA está habilitado no Google para este usuário
        via Admin SDK: users.get() → isEnforcedIn2Sv
      → Se MFA não configurado: bloquear login e exibir mensagem
        "Acesso bloqueado. Configure a verificação em duas etapas no
         Google Workspace para acessar o SGTI."
      → Notificar IT_MANAGER: "Usuário {email} sem MFA tentou acessar o SGTI"

2. Registrar no JWT claim mfaVerified = true/false
   (para step-up auth em operações críticas)

VERIFICAÇÃO DO ADMIN SDK (assíncrona):
  Realizada periodicamente via GoogleSyncJob para atualizar
  o campo mfa_enabled em auth.User.
  Não bloqueia o fluxo de autenticação diretamente.
```

### 6.4 Step-Up Authentication (MFA para Operações Críticas)

```
OPERAÇÕES QUE REQUEREM REAUTENTICAÇÃO
──────────────────────────────────────
Mesmo com sessão ativa, as seguintes operações exigem
confirmação adicional de identidade:

  - Desprovisionamento de usuário
  - Export completo de dados pessoais (LGPD)
  - Revogação de acesso em massa
  - Visualização de relatório de auditoria sensitivo
  - Alteração de papéis privilegiados (SUPER_ADMIN+)

FLUXO DE STEP-UP:
1. Usuário tenta executar operação crítica
2. Backend verifica se step_up_verified no JWT
   (ou se último step-up foi há > 5 minutos)
3. Se não verificado: Backend retorna 403 com:
   { "error": { "code": "STEP_UP_REQUIRED",
                "reAuthUrl": "/api/v1/auth/step-up" } }
4. Frontend redireciona para /auth/step-up
5. Backend inicia novo fluxo OAuth com parâmetros:
   ?prompt=login&max_age=0
   (força nova autenticação Google com MFA — ignora sessão Google ativa)
6. Após autenticação bem-sucedida:
   JWT atualizado com step_up_verified=true, step_up_at=now()
7. Operação crítica permitida por até 5 minutos
8. AuditLog: action=STEP_UP_AUTHENTICATED, operation=DEPROVISION_USER
```

---

## 7. Integração Google Workspace

### 7.1 Arquitetura da Integração

```
SGTI Backend (NestJS)
      │
      ├── OAuth 2.0 (autenticação de usuários)
      │   └── Google Authorization Server
      │
      ├── Admin SDK (provisionamento e sincronização)
      │   └── Google Admin Console
      │   └── Service Account com Domain-Wide Delegation
      │
      └── Gmail API (envio de notificações via e-mail)
          └── SMTP / API via service account
```

**Credenciais de serviço:**
- **Service Account** com Domain-Wide Delegation configurada no Google Admin Console.
- Scopes necessários:
  - `https://www.googleapis.com/auth/admin.directory.user` (gerenciar usuários)
  - `https://www.googleapis.com/auth/admin.directory.group` (gerenciar grupos)
  - `https://www.googleapis.com/auth/gmail.send` (envio de e-mails)
- Scopes solicitados **não incluem** acesso a e-mails, Drive, Calendar ou outros dados pessoais dos usuários.

### 7.2 Sincronização de Usuários

```
SINCRONIZAÇÃO INCREMENTAL (job diário — 02h00)
───────────────────────────────────────────────
1. Buscar usuários modificados após last_sync_at no Google:
   Admin SDK: users.list(customer=my_customer, orderBy=email, 
                         showDeleted=false, query="updatedMin:{last_sync}")

2. Para cada usuário Google:

   a. Se usuário NÃO existe no SGTI:
      → Criar auth.User com status=ACTIVE
      → Criar identity.Identity
      → Criar identity.GoogleUserReference
      → Atribuir papel END_USER (padrão)
      → AuditLog: action=USER_SYNCED_FROM_GOOGLE, new=true

   b. Se usuário EXISTE no SGTI:
      → Atualizar: display_name, avatar_url, google_org_unit, mfa_enabled
      → Se google_account.suspended = true E sgti.status = ACTIVE:
         → Atualizar sgti.status = SUSPENDED
         → Revogar todas as sessões ativas
         → AuditLog: action=USER_SUSPENDED_BY_GOOGLE_SYNC
      → Se google_account.suspended = false E sgti.status = SUSPENDED (por Google):
         → Atualizar sgti.status = ACTIVE
         → AuditLog: action=USER_REACTIVATED_BY_GOOGLE_SYNC

3. Verificar usuários excluídos no Google:
   Admin SDK: users.list(showDeleted=true, query="deletedMin:{last_sync}")
   → Se usuário deletado no Google e ativo no SGTI:
      → Iniciar fluxo de desprovisionamento automático
      → AuditLog: action=USER_DELETED_IN_GOOGLE

4. Atualizar identity.GoogleUserReference com google_data_snapshot
5. Registrar last_sync_at em integrations_config

SINCRONIZAÇÃO MANUAL (sob demanda)
────────────────────────────────────
POST /api/v1/integrations/google/sync (IT_MANAGER+)
  syncType: FULL ou INCREMENTAL
```

### 7.3 Provisionamento de Conta Google (Onboarding)

```
TRIGGER: ProvisionUserUseCase executado pelo IT_MANAGER

FLUXO DE PROVISIONAMENTO
──────────────────────────
1. IT_MANAGER cria usuário no SGTI via POST /api/v1/users/invite
   ou POST /api/v1/identity/users/:id/provision

2. ProvisionUserUseCase:

   a. Criar auth.User com status=PENDING_PROVISIONING no SGTI
   b. Chamar GoogleDirectoryAdapter.createAccount():
      Admin SDK: users.insert({
        primaryEmail: "usuario@empresa.com",
        name: { fullName, givenName, familyName },
        orgUnitPath: "/TI/Suporte",
        password: [temporária gerada aleatoriamente — usuário deve redefinir]
        changePasswordAtNextLogin: true
      })
   c. Se Google responde com sucesso:
      → Salvar google_user_id em identity.GoogleUserReference
      → Atualizar auth.User.status = ACTIVE
      → AuditLog: action=USER_PROVISIONED
      → Enviar e-mail de boas-vindas (com Magic Link para primeiro acesso)
   d. Se Google falha (timeout, erro 5xx):
      → auth.User permanece com status=PENDING_PROVISIONING
      → Registrar em sync_failures com retry agendado
      → AuditLog: action=PROVISIONING_FAILED
      → Notificar IT_MANAGER

VALIDAÇÕES PRÉ-PROVISIONAMENTO:
  ✓ E-mail não existe no Google Workspace
  ✓ E-mail pertence ao domínio corporativo
  ✓ Departamento e gestor existem e estão ativos
  ✓ Orçamento não atingiu limite de licenças (verificação opcional)
```

### 7.4 Desprovisionamento de Conta Google (Offboarding)

```
TRIGGER: DeprovisionUserUseCase executado pelo IT_MANAGER
         OU sincronização automática (usuário deletado no Google)

FLUXO DE DESPROVISIONAMENTO
─────────────────────────────
SLA: Concluir em até 4 horas após solicitação
Meta: Concluir em até 2 horas

1. IMEDIATO (< 5 minutos):
   a. Revogar TODAS as sessões ativas no SGTI
   b. Adicionar user_id à blacklist de JWT
   c. Atualizar auth.User.status = PENDING_DEPROVISIONING
   d. AuditLog: action=DEPROVISIONING_STARTED

2. SUSPENSÃO NO GOOGLE (< 30 minutos):
   a. GoogleDirectoryAdapter.suspendAccount(google_user_id)
      Admin SDK: users.update({ suspended: true })
   b. Atualizar identity.GoogleUserReference.google_account_suspended = true
   c. AuditLog: action=GOOGLE_ACCOUNT_SUSPENDED

3. TRANSFERÊNCIA DE DADOS (< 2 horas):
   a. Tickets em aberto atribuídos ao usuário: transferir para grupo ou gestor
   b. Ativos alocados ao usuário: desalocar (status IN_STOCK)
   c. Projetos onde era responsável: atualizar responsável
   d. Contratos onde era responsável: atualizar responsável

4. CONCLUSÃO:
   a. Atualizar auth.User.status = INACTIVE
   b. Atualizar identity.Identity.iam_status = INACTIVE
   c. Atualizar identity.Identity.termination_date
   d. AuditLog: action=DEPROVISIONING_COMPLETED
   e. Notificar IT_MANAGER e RH da conclusão

EXCLUSÃO DA CONTA GOOGLE (opcional, pós 30 dias):
   Admin SDK: users.delete(google_user_id)
   OU transferência para conta de arquivo: users.update({ orgUnitPath: "/Desligados" })
   
DADOS NO SGTI PÓS-DESLIGAMENTO:
   Dados de negócio (tickets, ativos) preservados com user_id pseudônimo.
   Dados pessoais (PII): preservados pelo período de retenção (5 anos).
   Após retenção: anonimização conforme fluxo LGPD (seção 9.3).
```

### 7.5 Sincronização de Grupos

```
GRUPOS GOOGLE ↔ GRUPOS SGTI
────────────────────────────
Grupos do Google Workspace podem ser mapeados para
IdentityGroups no SGTI para roteamento de chamados.

SINCRONIZAÇÃO DE GRUPOS (job semanal):
1. Listar grupos do Google no domínio corporativo
2. Para cada grupo com tag sgti:managed=true:
   a. Criar ou atualizar identity.IdentityGroup
      (type=GOOGLE_WORKSPACE_GROUP, google_group_email=...)
   b. Sincronizar membros do grupo

CRIAÇÃO DE GRUPO SGTI NO GOOGLE (opcional):
  IT_MANAGER pode criar grupos diretamente no Google via SGTI:
  POST /api/v1/identity/groups (com propagateToGoogle=true)
  → GoogleGroupAdapter.createGroup() via Admin SDK
```

---

## 8. Auditoria de Acessos

### 8.1 Eventos Auditados Obrigatoriamente

Todos os eventos abaixo são registrados em `shared.audit_log` com imutabilidade garantida por RLS INSERT-only:

#### 8.1.1 Eventos de Autenticação

| Evento | action | Dados Adicionais |
|--------|--------|-----------------|
| Login bem-sucedido | `LOGIN` | `method`, `mfa_verified`, `is_first_login` |
| Login falho | `FAILED_LOGIN` | `reason` (ACCOUNT_SUSPENDED, INVALID_DOMAIN, GOOGLE_AUTH_FAILED) |
| Logout voluntário | `LOGOUT` | — |
| Logout forçado (admin) | `FORCED_LOGOUT` | `performed_by` |
| Logout de todas as sessões | `LOGOUT_ALL_SESSIONS` | — |
| Token renovado | `SESSION_RENEWED` | — |
| Token reutilizado (ataque) | `TOKEN_REUSE_DETECTED` | `severity=CRITICAL`, `all_sessions_revoked=true` |
| Acesso negado (403) | `ACCESS_DENIED` | `endpoint`, `required_role` |
| Step-up autenticado | `STEP_UP_AUTHENTICATED` | `operation` |
| Aceite dos termos | `TERMS_ACCEPTED` | `terms_version` |
| Primeiro login concluído | `FIRST_LOGIN_COMPLETED` | — |

#### 8.1.2 Eventos Administrativos de Acesso

| Evento | action | Dados Adicionais |
|--------|--------|-----------------|
| Usuário provisionado | `USER_PROVISIONED` | `provisioned_by`, `roles_assigned` |
| Usuário desprovisionado | `USER_DEPROVISIONED` | `deprovisioned_by`, `reason` |
| Usuário suspenso | `USER_SUSPENDED` | `suspended_by`, `reason` |
| Usuário reativado | `USER_REACTIVATED` | `reactivated_by` |
| Papel atribuído | `ROLE_ASSIGNED` | `role`, `assigned_by`, `reason` |
| Papel revogado | `ROLE_REVOKED` | `role`, `revoked_by`, `reason` |
| Permissão individual concedida | `PERMISSION_GRANTED` | `module`, `resource`, `action` |
| Permissão individual revogada | `PERMISSION_REVOKED` | `module`, `resource`, `action` |
| Revisão de acesso iniciada | `ACCESS_REVIEW_STARTED` | `scope` |
| Revisão de acesso concluída | `ACCESS_REVIEW_COMPLETED` | `outcome` |
| Usuário convidado | `USER_INVITED` | `invited_by`, `roles` |
| Convite aceito | `INVITE_ACCEPTED` | — |
| Exportação de dados pessoais | `PERSONAL_DATA_EXPORTED` | `exported_by`, `user_subject` |
| Anonimização de dados | `PERSONAL_DATA_ANONYMIZED` | `anonymized_by`, `reason` |

#### 8.1.3 Eventos de Sincronização Google

| Evento | action | Dados Adicionais |
|--------|--------|-----------------|
| Usuário sincronizado do Google | `USER_SYNCED_FROM_GOOGLE` | `changes` |
| Usuário suspenso pela sync | `USER_SUSPENDED_BY_GOOGLE_SYNC` | — |
| Conta Google provisionada | `GOOGLE_ACCOUNT_PROVISIONED` | `google_user_id` |
| Conta Google suspensa | `GOOGLE_ACCOUNT_SUSPENDED` | `google_user_id` |
| Falha de provisionamento | `PROVISIONING_FAILED` | `error`, `retry_at` |

### 8.2 Estrutura do Registro de Auditoria de Acesso

```json
{
  "id": "01904f7c-...",
  "tenantId": "tenant-uuid",
  "userId": "user-uuid",
  "userRole": "IT_TECHNICIAN",
  "sessionId": "session-uuid",
  "action": "LOGIN",
  "module": "auth",
  "entityType": "Session",
  "entityId": "session-uuid",
  "newValues": {
    "method": "google_oauth",
    "mfaVerified": true,
    "isFirstLogin": false,
    "ipAddress": "189.x.x.x",
    "deviceType": "desktop",
    "browser": "Chrome 124"
  },
  "ipAddress": "189.x.x.x",
  "userAgent": "Mozilla/5.0...",
  "requestId": "req-uuid",
  "occurredAt": "2026-06-09T14:00:00.000Z",
  "metadata": {
    "googleSub": "115...",
    "hostedDomain": "empresa.com"
  }
}
```

### 8.3 Acesso aos Logs de Auditoria

| Papel | Acesso | Escopo |
|-------|--------|--------|
| `AUDITOR` | Leitura completa | Todos os logs |
| `SUPER_ADMIN` | Leitura completa + exportação | Todos os logs |
| `IT_MANAGER` | Leitura filtrada | Apenas ações de LOGIN, FAILED_LOGIN, ROLE_ASSIGNED/REVOKED |
| `COMPLIANCE_OFFICER` | Leitura filtrada | Ações de compliance, acesso a dados sensíveis |
| Demais papéis | Sem acesso | — |

### 8.4 Alertas de Segurança Automáticos

Os seguintes eventos disparam alertas automáticos para o IT_MANAGER e/ou SUPER_ADMIN:

| Evento | Destinatário | Canal | Urgência |
|--------|-------------|-------|---------|
| `TOKEN_REUSE_DETECTED` | SUPER_ADMIN + IT_MANAGER | E-mail imediato | Crítico |
| `FAILED_LOGIN` > 5 em 5 minutos (mesmo IP) | IT_MANAGER | E-mail | Alto |
| `FAILED_LOGIN` de conta `SUPER_ADMIN` | SUPER_ADMIN | E-mail imediato | Crítico |
| Login de `SUPER_ADMIN` fora do horário comercial | SUPER_ADMIN | E-mail imediato | Alto |
| `PROVISIONING_FAILED` após 3 tentativas | IT_MANAGER | E-mail | Médio |
| `USER_SUSPENDED_BY_GOOGLE_SYNC` | IT_MANAGER | E-mail | Alto |
| Usuário com papel privilegiado sem MFA | IT_MANAGER | E-mail diário | Médio |
| Revisão de acesso atrasada > 30 dias | IT_MANAGER | E-mail semanal | Médio |

---

## 9. Segurança — OWASP, LGPD e Proteção de APIs

### 9.1 Controles OWASP ASVS Aplicados à Autenticação

Referência: OWASP ASVS v4.0 Capítulo V2 (Authentication) e V3 (Session Management)

| Controle ASVS | Requisito | Implementação |
|---------------|-----------|--------------|
| V2.1.1 | Sem senhas em texto claro | Delegado ao Supabase Auth (bcrypt/argon2) |
| V2.1.7 | Verificar senhas contra lista de senhas comprometidas | Supabase Auth verifica HaveIBeenPwned |
| V2.1.9 | Sem regras de composição arbitrárias (exceto complexidade mínima) | Regras claramente documentadas |
| V2.2.1 | MFA para contas privilegiadas | Google Workspace MFA obrigatório |
| V2.5.6 | Tokens de recuperação são únicos e de uso único | Magic Link de uso único, TTL 15min |
| V2.6.1 | Credenciais de look-up não devem ser geradas por PRNG fraco | UUID v4 criptograficamente seguro |
| V3.2.1 | Novo token de sessão após login bem-sucedido | Gerado no callback; nunca reutilizado |
| V3.3.1 | Logout invalida o token de sessão no servidor | refresh_token marcado REVOKED |
| V3.3.2 | Timeout de inatividade configurado | Por papel: 30min (SUPER_ADMIN) a 8h (END_USER) |
| V3.4.1 | Cookies com atributos Secure, HttpOnly, SameSite | Todos os cookies de sessão |
| V3.5.2 | OAuth state parameter para CSRF | Implementado em todos os flows OAuth |
| V3.6.1 | Reautenticação para operações sensíveis | Step-up auth implementado |
| V3.7.1 | Sessões completas revogadas ao deslogar | Refresh token revogado no banco |

### 9.2 Proteção contra Ataques Específicos de Autenticação

#### 9.2.1 Credential Stuffing e Brute Force

```
PROTEÇÃO MULTICAMADA:
  Camada 1 — Sem senhas locais:
    OAuth exclusivo elimina superfície de ataque de credenciais.
    Credential stuffing simplesmente não funciona.

  Camada 2 — Rate Limiting:
    /auth/google/init: 10 req/IP/minuto
    /auth/callback: 5 req/IP/minuto (janela crítica)
    /auth/refresh: 20 req/usuário/minuto

  Camada 3 — Cloudflare Bot Fight Mode:
    Bloqueia automaticamente bots conhecidos antes que cheguem ao backend.

  Camada 4 — Lockout Progressivo:
    5+ falhas de refresh do mesmo IP → alerta e rate limit aumentado
    10+ falhas → IP temporariamente bloqueado por 15 minutos
```

#### 9.2.2 Session Hijacking

```
PROTEÇÃO:
  ✓ Cookies HttpOnly: inacessíveis ao JavaScript (previne XSS → token theft)
  ✓ Cookies Secure: transmissão apenas via HTTPS
  ✓ SameSite=Strict: bloqueia envio cross-site (CSRF)
  ✓ TLS 1.2+: criptografia em trânsito obrigatória
  ✓ Token binding: IP e device_info armazenados na sessão
  ✓ Detecção de anomalia: mudança de IP ou device gera log de alerta
    (não bloqueia automaticamente — evita falsos positivos com VPN)
```

#### 9.2.3 OAuth Attacks

```
PROTEÇÃO CONTRA ATAQUES OAUTH:
  Authorization Code Interception:
    → PKCE obrigatório com code_challenge S256

  CSRF em OAuth:
    → state parameter validado (UUID v4, TTL 10 min, vinculado ao IP)

  Open Redirect:
    → redirect_uri validada contra lista pré-registrada no Google Console
    → POST-login redirect_uri validada contra lista de URIs internas

  Token Leakage via Referrer:
    → authorization_code não persiste em URL history (POST-based redirect)
    → Referrer-Policy: strict-origin-when-cross-origin

  Account Takeover via IDP:
    → hd (hosted domain) validado: apenas @empresa.com aceito
    → google_sub (imutável) usado como identifier primário, não e-mail
```

### 9.3 Conformidade com LGPD

#### 9.3.1 Dados Pessoais Processados na Autenticação

| Dado | Finalidade | Base Legal | Retenção |
|------|-----------|------------|---------|
| E-mail corporativo | Identificação e autenticação | Legítimo interesse (Art. 7º, IX) | Vigência do contrato + 5 anos |
| Nome completo | Exibição e identificação | Legítimo interesse | Vigência + 5 anos |
| IP de acesso | Segurança da informação | Legítimo interesse | 1 ano |
| User-Agent | Segurança (detecção de anomalias) | Legítimo interesse | 1 ano |
| google_sub | Vínculo de identidade (pseudônimo) | Legítimo interesse | Vigência + 5 anos |
| Logs de login | Auditoria de segurança | Obrigação legal (ISO 27001, Art. 37 LGPD) | 5 anos |
| MFA status | Garantia de segurança | Legítimo interesse | Vigência |

#### 9.3.2 Direitos dos Titulares no Contexto de Autenticação

| Direito (Art. 18) | Implementação |
|-------------------|--------------|
| **Acesso** | `GET /api/v1/users/me/auth-history` retorna histórico de logins e sessões ativas |
| **Correção** | Nome e e-mail corrigidos via Google Admin Console (fonte autoritativa) |
| **Portabilidade** | Incluído no export geral de dados pessoais `GET /api/v1/users/:id/personal-data` |
| **Eliminação** | Sessões revogadas + logs de login anonimizados após período de retenção |
| **Informação** | Política de privacidade disponível em `/privacy` descrevendo todos os dados coletados |

#### 9.3.3 Transferência Internacional

Dados de autenticação passam pelos seguintes servidores externos:

| Serviço | País | Dado Transferido | Base Legal LGPD |
|---------|------|-----------------|----------------|
| Google OAuth | EUA | E-mail, google_sub, nome | Art. 33, VII (consentimento via autenticação) |
| Cloudflare | EUA | IP, headers | Art. 33, II (cláusulas contratuais — DPA assinado) |
| Vercel | EUA | Requisições de autenticação | Art. 33, II (cláusulas contratuais — DPA assinado) |

### 9.4 Proteção de APIs de Autenticação

```
HEADERS DE SEGURANÇA ESPECÍFICOS PARA ENDPOINTS DE AUTH:

Cache-Control: no-store, no-cache, must-revalidate
  → Previne cache de respostas de autenticação em proxies e CDN

Pragma: no-cache
  → Compatibilidade HTTP/1.0

X-Content-Type-Options: nosniff
  → Previne MIME sniffing

Content-Security-Policy: default-src 'none'
  → Endpoints /auth/* não servem conteúdo ativo

CORS para endpoints de auth:
  Access-Control-Allow-Origin: [apenas domínios SGTI registrados]
  Access-Control-Allow-Credentials: true
  Access-Control-Allow-Methods: GET, POST, OPTIONS

RATE LIMITING ESPECÍFICO DE AUTH:
  /auth/google/init: 10/IP/minuto
  /auth/callback:    5/IP/minuto + validação de state único
  /auth/refresh:     20/usuário/minuto
  /auth/logout:      sem limite (operação de segurança)

VERIFICAÇÃO DE INTEGRIDADE DO FLUXO:
  Cada state token é de uso único — usado no callback e descartado
  Authorization code é de uso único no Google — reutilização gera erro no Google
  Refresh token é de uso único após rotação — reutilização dispara alerta
```

---

## 10. Matriz de Decisão de Autenticação

### 10.1 Qual fluxo usar em cada cenário

| Cenário | Fluxo Recomendado | Notas |
|---------|:-----------------:|-------|
| Acesso normal de colaborador | Google OAuth 2.0 com PKCE | Padrão |
| Colaborador novo (primeiro acesso) | Convite + Google OAuth | IT_MANAGER envia convite |
| Colaborador sem conta Google ainda | Convite → provisionar Google → OAuth | Provisionamento via SGTI |
| Conta de serviço / automação | API Key (M2M) | Sem MFA; escopo limitado |
| Integração GLPI (backend-to-backend) | API Key | Rotação semestral |
| Acesso emergencial (Google indisponível) | Magic Link + Supabase Auth | Apenas para contas explicitamente habilitadas |
| Desenvolvedor local | E-mail + senha (Supabase Auth) | Apenas em ambiente de desenvolvimento |

### 10.2 Decisão de Bloqueio de Acesso

```
ÁRVORE DE DECISÃO DE AUTENTICAÇÃO
────────────────────────────────────

Token presente no cookie?
  NÃO → Redirecionar para /login
  SIM → Validar JWT:

    JWT válido e não expirado?
      NÃO → Tentar refresh automático
        Refresh token válido e sessão ativa?
          NÃO → Redirecionar para /login
          SIM → Emitir novo JWT; continuar
      SIM → Continuar:

        Usuário ativo?
          NÃO (SUSPENDED) → 401 ACCOUNT_SUSPENDED
          NÃO (INACTIVE) → 401 ACCOUNT_INACTIVE
          SIM → Continuar:

            JWT na blacklist?
              SIM → 401 TOKEN_REVOKED
              NÃO → Continuar:

                Papel suficiente para o endpoint?
                  NÃO → 403 FORBIDDEN
                  SIM → Continuar:

                    Módulo no JWT claims?
                      NÃO → 403 INSUFFICIENT_MODULE_ACCESS
                      SIM → Continuar:

                        Operação crítica sem step-up?
                          SIM → 403 STEP_UP_REQUIRED
                          NÃO → ✓ ACESSO CONCEDIDO
```

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição da Alteração |
|--------|------|-------|------------------------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI · Segurança da Informação | Criação do documento |

---

> **Próximos documentos recomendados:**
> [`14_SECURITY_REQUIREMENTS.md`](./14_SECURITY_REQUIREMENTS.md) — Requisitos de segurança completos (OWASP ASVS, LGPD)
> [`21_API_SPEC.md`](./21_API_SPEC.md) — Especificação dos endpoints de autenticação
> [`20_DATABASE.md`](./20_DATABASE.md) — Modelo de dados para auth, identity e sessions
