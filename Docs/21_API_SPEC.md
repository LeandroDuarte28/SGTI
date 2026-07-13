# SGTI — Sistema de Gestão de Tecnologia da Informação
## Especificação Funcional das APIs REST

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [12_ARCHITECTURE.md](./12_ARCHITECTURE.md) · [20_DATABASE.md](./20_DATABASE.md) · [14_SECURITY_REQUIREMENTS.md](./14_SECURITY_REQUIREMENTS.md)

---

## Sobre este Documento

Este documento especifica funcionalmente todas as APIs REST do SGTI. Cada endpoint é descrito com objetivo, método HTTP, rota, permissões, parâmetros, payloads e erros possíveis.

**Escopo:** documentação funcional. Nenhum código, Swagger JSON ou OpenAPI YAML é gerado.

---

## Sumário

**Padrões Globais**
1. [Versionamento e Base URL](#1-versionamento-e-base-url)
2. [Autenticação e Segurança](#2-autenticação-e-segurança)
3. [Padrão de Respostas](#3-padrão-de-respostas)
4. [Paginação, Filtros e Ordenação](#4-paginação-filtros-e-ordenação)
5. [Tratamento de Erros](#5-tratamento-de-erros)
6. [Rate Limiting](#6-rate-limiting)
7. [Auditoria de API](#7-auditoria-de-api)

**Módulos**
8. [Authentication](#8-authentication)
9. [Users](#9-users)
10. [Roles e Permissions](#10-roles-e-permissions)
11. [Service Catalog](#11-service-catalog)
12. [SLA](#12-sla)
13. [Tickets](#13-tickets)
14. [Incidents](#14-incidents)
15. [Requests](#15-requests)
16. [Problems](#16-problems)
17. [Assets](#17-assets)
18. [GLPI Integration](#18-glpi-integration)
19. [Identity Management](#19-identity-management)
20. [Google Workspace](#20-google-workspace)
21. [Compliance](#21-compliance)
22. [Financial](#22-financial)
23. [Procurement](#23-procurement)
24. [Projects](#24-projects)
25. [Knowledge Base](#25-knowledge-base)
26. [Notifications](#26-notifications)
27. [Email Integration](#27-email-integration)
28. [Dashboard](#28-dashboard)
29. [Reports](#29-reports)
30. [Audit](#30-audit)

---

## 1. Versionamento e Base URL

### 1.1 Base URL

| Ambiente | Base URL |
|----------|----------|
| Produção | `https://api.sgti.[dominio]/api/v1` |
| Staging | `https://api.staging.sgti.[dominio]/api/v1` |
| Desenvolvimento | `http://localhost:3001/api/v1` |

### 1.2 Versionamento

O SGTI usa versionamento por prefixo de URL. A versão atual é `v1`.

- Novos endpoints são adicionados na versão corrente sem breaking change.
- Breaking changes criam nova versão (`v2`) enquanto `v1` permanece ativa por 90 dias com header `Deprecation`.
- O header `Deprecation` sinaliza endpoints obsoletos: `Deprecation: true; sunset="2026-09-09"`.

### 1.3 Endpoints Públicos (sem autenticação)

```
GET  /api/v1/health
GET  /api/v1/health/ready
GET  /api/v1/health/live
GET  /api/v1/auth/google
GET  /api/v1/auth/callback
GET  /api/v1/catalog                  (catálogo público)
GET  /api/v1/catalog/:slug
GET  /api/v1/knowledge                (KB pública)
GET  /api/v1/knowledge/:slug
GET  /api/v1/knowledge/search
```

Todos os demais endpoints exigem autenticação.

---

## 2. Autenticação e Segurança

### 2.1 Bearer Token via Cookie

Autenticação via cookie `HttpOnly` — o token não é enviado no header `Authorization`.

O backend lê o JWT diretamente do cookie `access_token` em todas as requisições protegidas. Clientes que não suportam cookies (ex: integrações máquina a máquina) usam API Keys.

### 2.2 API Key para Integrações M2M

```
Header: X-Api-Key: sgti_live_xxxxxxxxxxxxxxxxxxxxxxxx
```

API Keys são gerenciadas via `GET/POST /api/v1/admin/api-keys` por `SUPER_ADMIN`.

### 2.3 Headers Obrigatórios em Todas as Requisições

| Header | Valor | Obrigatório |
|--------|-------|:-----------:|
| `Content-Type` | `application/json` | Sim (exceto uploads) |
| `Accept` | `application/json` | Recomendado |
| `X-Request-ID` | UUID v4 (gerado pelo cliente) | Recomendado |

O `X-Request-ID` é incluído na resposta e em todos os logs para rastreabilidade.

---

## 3. Padrão de Respostas

### 3.1 Resposta de Sucesso — Recurso Único

```json
{
  "data": {
    "id": "uuid",
    "field": "value"
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-06-09T14:00:00.000Z"
  }
}
```

### 3.2 Resposta de Sucesso — Lista Paginada

```json
{
  "data": [
    { "id": "uuid", "field": "value" }
  ],
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-06-09T14:00:00.000Z",
    "pagination": {
      "page": 1,
      "perPage": 20,
      "total": 248,
      "totalPages": 13,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

### 3.3 Resposta de Criação — HTTP 201

```json
{
  "data": { "id": "uuid", "number": "INC-2026-000001" },
  "meta": { "requestId": "uuid", "timestamp": "..." }
}
```

### 3.4 Resposta de Ação sem Conteúdo — HTTP 204

Usado para `DELETE` lógico e ações que não retornam payload (ex: marcar notificação como lida).

```
HTTP 204 No Content
(sem body)
```

### 3.5 Resposta de Erro

```json
{
  "error": {
    "code": "INCIDENT_NOT_FOUND",
    "message": "O incidente solicitado não foi encontrado.",
    "requestId": "uuid",
    "timestamp": "2026-06-09T14:00:00.000Z",
    "details": [
      {
        "field": "id",
        "issue": "Recurso com ID 'abc-123' não existe ou foi excluído."
      }
    ]
  }
}
```

---

## 4. Paginação, Filtros e Ordenação

### 4.1 Parâmetros de Paginação

| Parâmetro | Tipo | Default | Máximo | Descrição |
|-----------|------|:-------:|:------:|-----------|
| `page` | integer | `1` | — | Página desejada |
| `perPage` | integer | `20` | `100` | Itens por página |

### 4.2 Parâmetros de Ordenação

| Parâmetro | Formato | Exemplo |
|-----------|---------|---------|
| `sort` | `campo:asc` ou `campo:desc` | `sort=created_at:desc` |
| `sort` | Múltiplos separados por vírgula | `sort=priority:asc,created_at:desc` |

### 4.3 Parâmetros de Filtro

Filtros são passados como query parameters com prefixos que indicam o operador:

| Operador | Formato | Exemplo |
|----------|---------|---------|
| Igual | `campo=valor` | `status=OPEN` |
| Diferente | `campo[ne]=valor` | `status[ne]=CLOSED` |
| Contém (LIKE) | `campo[contains]=valor` | `title[contains]=vpn` |
| Maior que | `campo[gt]=valor` | `created_at[gt]=2026-01-01` |
| Maior ou igual | `campo[gte]=valor` | `priority[gte]=2` |
| Menor que | `campo[lt]=valor` | `sla_deadline[lt]=2026-06-10` |
| Em lista | `campo[in]=v1,v2,v3` | `status[in]=OPEN,IN_PROGRESS` |
| Nulo | `campo[null]=true` | `assignee_id[null]=true` |

### 4.4 Busca Textual

```
GET /api/v1/tickets?q=vpn+não+conecta
```

O parâmetro `q` aciona a busca full-text PostgreSQL em campos relevantes do recurso.

---

## 5. Tratamento de Erros

### 5.1 Códigos HTTP Utilizados

| HTTP | Código de Erro | Situação |
|------|---------------|---------|
| `400` | `VALIDATION_ERROR` | Dados de entrada inválidos (campo obrigatório ausente, tipo incorreto) |
| `401` | `UNAUTHORIZED` | Token ausente, expirado ou inválido |
| `403` | `FORBIDDEN` | Usuário autenticado sem permissão para a operação |
| `404` | `NOT_FOUND` | Recurso não existe ou foi excluído (soft delete) |
| `409` | `CONFLICT` | Conflito de estado (ex: fechar incidente já fechado) |
| `422` | `BUSINESS_RULE_VIOLATION` | Violação de regra de negócio (ex: SLA já violado, ticket com status incompatível) |
| `429` | `RATE_LIMIT_EXCEEDED` | Limite de requisições atingido |
| `500` | `INTERNAL_SERVER_ERROR` | Erro interno não tratado |
| `502` | `INTEGRATION_ERROR` | Falha de integração externa (GLPI, Google) |
| `503` | `SERVICE_UNAVAILABLE` | Sistema em manutenção ou sobrecarga |

### 5.2 Catálogo de Códigos de Erro de Negócio

| Código | Descrição |
|--------|-----------|
| `TICKET_ALREADY_CLOSED` | Operação inválida em ticket fechado |
| `SLA_CANNOT_PAUSE` | SLA não pode ser pausado neste status |
| `APPROVAL_ALREADY_DECIDED` | Etapa de aprovação já foi decidida |
| `ASSET_ALREADY_ALLOCATED` | Ativo já está alocado a outro usuário |
| `IDENTITY_PENDING_PROVISIONING` | Identidade aguarda provisionamento no Google |
| `INSUFFICIENT_BUDGET` | Orçamento insuficiente para a operação |
| `DUPLICATE_ASSET_TAG` | Etiqueta patrimonial já existe |
| `ARTICLE_NOT_PUBLISHED` | Artigo não está publicado para esta operação |
| `GOOGLE_SYNC_FAILED` | Falha na sincronização com Google Workspace |
| `GLPI_SYNC_FAILED` | Falha na sincronização com GLPI |
| `FILE_TYPE_NOT_ALLOWED` | Tipo de arquivo não permitido |
| `FILE_SIZE_EXCEEDED` | Tamanho do arquivo excede o limite |

---

## 6. Rate Limiting

Limites aplicados por usuário autenticado (ou por IP para rotas públicas):

| Categoria | Limite | Janela |
|-----------|--------|--------|
| Rotas de autenticação | 10 req/IP | 1 minuto |
| Rotas de escrita (POST, PATCH, PUT, DELETE) | 60 req/usuário | 1 minuto |
| Rotas de leitura (GET) | 300 req/usuário | 1 minuto |
| Rotas de busca | 30 req/usuário | 1 minuto |
| Geração de relatórios | 5 req/usuário | 1 hora |
| Exportação de auditoria | 3 req/usuário | 1 hora |

**Headers de resposta:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 43
X-RateLimit-Reset: 1749506400
Retry-After: 60   (apenas quando 429)
```

---

## 7. Auditoria de API

Toda operação de escrita gera registro automático em `shared.audit_log` via `AuditInterceptor` global. O registro inclui: `user_id`, `user_role`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `request_id`, `occurred_at`.

Operações de leitura a dados sensíveis (compliance, identidades, financeiro acima de threshold) também geram registro com `action=ACCESS`.

---

## 8. Authentication

**Base:** `/api/v1/auth`

---

### POST /auth/google/init — Iniciar login OAuth

**Objetivo:** Redirecionar o usuário para o Google OAuth 2.0.
**Autenticação:** Pública
**Permissões:** Nenhuma

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|:-----------:|-----------|
| `redirect_uri` | string | Não | URL de retorno pós-login (deve ser pré-registrada) |

**Resposta (302):** Redirecionamento para `accounts.google.com/o/oauth2/auth` com `code_challenge` (PKCE), `state` e `hd` (domínio corporativo).

---

### GET /auth/callback — Callback OAuth Google

**Objetivo:** Receber o `authorization_code` do Google, trocar por token, emitir JWT SGTI.
**Autenticação:** Pública (protegida por `state` token)
**Permissões:** Nenhuma

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|:-----------:|-----------|
| `code` | string | Sim | Authorization code do Google |
| `state` | string | Sim | State token anti-CSRF |

**Resposta (302):** Redireciona para o dashboard. Cookies definidos: `access_token` (1h) e `refresh_token` (7d), ambos `HttpOnly; Secure; SameSite=Strict`.

**Erros:**
| HTTP | Código | Situação |
|------|--------|---------|
| 400 | `INVALID_STATE` | State token ausente, expirado ou não correspondente |
| 400 | `INVALID_DOMAIN` | E-mail não pertence ao domínio corporativo |
| 502 | `GOOGLE_AUTH_FAILED` | Falha ao trocar code por token com o Google |

---

### POST /auth/refresh — Renovar sessão

**Objetivo:** Trocar o refresh token por novo access token (rotação automática).
**Autenticação:** Cookie `refresh_token`

**Resposta (200):**
```json
{
  "data": {
    "expiresAt": "2026-06-09T15:00:00.000Z"
  }
}
```
Novos cookies são definidos. Refresh token anterior é imediatamente invalidado.

**Erros:**
| HTTP | Código | Situação |
|------|--------|---------|
| 401 | `REFRESH_TOKEN_INVALID` | Token inválido, expirado ou já rotacionado |
| 401 | `REFRESH_TOKEN_REVOKED` | Token foi revogado (logout ou suspensão) |
| 409 | `TOKEN_REUSE_DETECTED` | Token usado após rotação — todas as sessões revogadas |

---

### POST /auth/logout — Encerrar sessão

**Objetivo:** Revogar o refresh token e limpar cookies.
**Autenticação:** Obrigatória

**Resposta (204):** Sem body. Cookies limpos. Refresh token revogado no banco.

---

### GET /auth/me — Usuário atual

**Objetivo:** Retornar dados do usuário autenticado com papéis e permissões.
**Autenticação:** Obrigatória

**Resposta (200):**
```json
{
  "data": {
    "id": "uuid",
    "email": "usuario@empresa.com",
    "displayName": "Nome Usuário",
    "avatarUrl": "https://...",
    "roles": ["IT_TECHNICIAN"],
    "modules": ["INCIDENTS", "ASSETS", "KNOWLEDGE"],
    "orgUnit": "/TI/Suporte",
    "lastLoginAt": "2026-06-09T13:00:00.000Z"
  }
}
```

---

### GET /auth/sessions — Listar sessões ativas

**Objetivo:** Listar todas as sessões ativas do usuário autenticado.
**Autenticação:** Obrigatória

**Resposta (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "deviceInfo": { "browser": "Chrome", "os": "macOS" },
      "ipAddress": "189.x.x.x",
      "lastUsedAt": "2026-06-09T13:00:00.000Z",
      "isCurrent": true
    }
  ]
}
```

---

### DELETE /auth/sessions/:id — Revogar sessão específica

**Objetivo:** Revogar uma sessão ativa (deslogar de dispositivo específico).
**Autenticação:** Obrigatória

**Parâmetros de Path:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | UUID | ID da sessão |

**Resposta (204):** Sem body.

**Erros:**
| HTTP | Código | Situação |
|------|--------|---------|
| 403 | `FORBIDDEN` | Sessão não pertence ao usuário autenticado |

---

## 9. Users

**Base:** `/api/v1/users`
**Papéis mínimos para gestão:** `IT_MANAGER`, `SUPER_ADMIN`

---

### GET /users — Listar usuários

**Objetivo:** Listar usuários do tenant com paginação e filtros.
**Permissões:** `IT_MANAGER`, `SUPER_ADMIN`

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `q` | string | Busca por nome ou e-mail |
| `status` | enum | `ACTIVE`, `INACTIVE`, `SUSPENDED` |
| `role` | enum | Filtrar por papel |
| `departmentId` | UUID | Filtrar por departamento |
| `businessUnitId` | UUID | Filtrar por unidade de negócio |
| `managerId` | UUID | Filtrar por gestor direto |
| `page`, `perPage`, `sort` | — | Paginação padrão |

**Resposta (200):** Lista paginada com `id`, `email`, `displayName`, `status`, `roles`, `department`, `lastLoginAt`.

---

### GET /users/:id — Buscar usuário

**Objetivo:** Retornar dados completos de um usuário.
**Permissões:** Próprio usuário ou `IT_MANAGER+`

**Resposta (200):**
```json
{
  "data": {
    "id": "uuid",
    "email": "usuario@empresa.com",
    "displayName": "Nome",
    "fullName": "Nome Completo",
    "status": "ACTIVE",
    "roles": ["IT_TECHNICIAN"],
    "department": { "id": "uuid", "name": "TI - Suporte" },
    "manager": { "id": "uuid", "displayName": "Gestor TI" },
    "lastLoginAt": "...",
    "loginCount": 47,
    "createdAt": "..."
  }
}
```

**Erros:** 404 `NOT_FOUND`.

---

### POST /users — Criar usuário

**Objetivo:** Provisionar manualmente um usuário (quando não via sincronização Google).
**Permissões:** `IT_MANAGER`, `SUPER_ADMIN`

**Payload:**
```json
{
  "email": "novo@empresa.com",
  "displayName": "Nome",
  "roles": ["IT_TECHNICIAN"],
  "departmentId": "uuid",
  "managerId": "uuid"
}
```

**Resposta (201):** Dados do usuário criado.

**Erros:**
| HTTP | Código | Situação |
|------|--------|---------|
| 409 | `CONFLICT` | E-mail já cadastrado |
| 400 | `VALIDATION_ERROR` | Campos obrigatórios ausentes |

---

### PATCH /users/:id — Atualizar usuário

**Objetivo:** Atualizar dados de um usuário (nome, departamento, gestor).
**Permissões:** Próprio usuário (campos limitados) ou `IT_MANAGER+`

**Payload (campos atualizáveis por IT_MANAGER):**
```json
{
  "displayName": "Novo Nome",
  "departmentId": "uuid",
  "managerId": "uuid",
  "status": "SUSPENDED",
  "locale": "pt-BR"
}
```

**Resposta (200):** Dados atualizados.

---

### DELETE /users/:id — Desativar usuário

**Objetivo:** Soft delete — desativa o usuário sem remover seus dados.
**Permissões:** `SUPER_ADMIN`

**Resposta (204):** Usuário marcado como `INACTIVE`. Todas as sessões revogadas.

---

### GET /users/:id/personal-data — Exportar dados pessoais (LGPD)

**Objetivo:** Exportar todos os dados pessoais de um usuário (direito de acesso LGPD Art. 18).
**Permissões:** Próprio usuário ou `SUPER_ADMIN`

**Resposta (200):** JSON com todos os dados pessoais do usuário em todos os módulos.

---

### POST /users/:id/anonymize — Anonimizar usuário (LGPD)

**Objetivo:** Anonimizar dados pessoais de usuário desligado.
**Permissões:** `SUPER_ADMIN`

**Payload:**
```json
{
  "reason": "Solicitação de eliminação - Art. 18 LGPD"
}
```

**Resposta (204):** Dados pessoais anonimizados. Registros de negócio preservados com `user_id` pseudônimo.

---

### POST /users/:id/revoke-all-sessions — Revogar todas as sessões

**Objetivo:** Revogar todas as sessões ativas de um usuário (emergência de segurança).
**Permissões:** `IT_MANAGER`, `SUPER_ADMIN`

**Resposta (204):** Todas as sessões do usuário revogadas.

---

## 10. Roles e Permissions

**Base:** `/api/v1/roles` e `/api/v1/permissions`

---

### GET /roles — Listar papéis

**Permissões:** `IT_MANAGER+`

**Resposta (200):** Lista de papéis com `id`, `name`, `displayName`, `priority`, `isSystem`.

---

### GET /roles/:id — Buscar papel

**Permissões:** `IT_MANAGER+`

**Resposta (200):** Dados completos do papel com permissões associadas.

---

### POST /roles/:id/users — Atribuir papel a usuário

**Objetivo:** Vincular um papel a um usuário com justificativa.
**Permissões:** `IT_MANAGER` (papéis até IT_SPECIALIST); `SUPER_ADMIN` (todos)

**Payload:**
```json
{
  "userId": "uuid",
  "reason": "Promoção a especialista de infra",
  "expiresAt": null
}
```

**Resposta (201):** Registro de `UserRole` criado.

**Erros:**
| HTTP | Código | Situação |
|------|--------|---------|
| 409 | `CONFLICT` | Usuário já possui este papel |
| 403 | `FORBIDDEN` | Papel requer SUPER_ADMIN e solicitante é IT_MANAGER |

---

### DELETE /roles/:id/users/:userId — Revogar papel de usuário

**Permissões:** `IT_MANAGER+`

**Payload:**
```json
{
  "reason": "Desligamento do colaborador"
}
```

**Resposta (204).**

---

### GET /permissions — Listar permissões

**Objetivo:** Consultar todas as permissões definidas no sistema por módulo.
**Permissões:** `IT_MANAGER+`

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `module` | string | Filtrar por módulo |
| `roleId` | UUID | Filtrar por papel |

**Resposta (200):** Lista de permissões com `id`, `module`, `resource`, `action`, `role`.

---

## 11. Service Catalog

**Base:** `/api/v1/catalog`

---

### GET /catalog — Listar itens do catálogo

**Objetivo:** Retornar itens publicados do catálogo. Itens DRAFT visíveis apenas para IT_MANAGER+.
**Permissões:** Pública para itens PUBLISHED; `IT_MANAGER+` para DRAFT

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `q` | string | Busca por nome ou descrição |
| `categoryId` | UUID | Filtrar por categoria |
| `status` | enum | `PUBLISHED`, `DRAFT`, `DEPRECATED` |
| `audience` | enum | `END_USER`, `TECHNICAL`, `BOTH` |

**Resposta (200):** Lista paginada com `id`, `slug`, `name`, `category`, `status`, `audience`, `defaultTicketType`.

---

### GET /catalog/:slug — Buscar item do catálogo

**Permissões:** Pública para itens PUBLISHED

**Resposta (200):**
```json
{
  "data": {
    "id": "uuid",
    "slug": "solicitar-acesso-vpn",
    "name": "Solicitar Acesso VPN",
    "descriptionUser": "...",
    "descriptionTech": "...",
    "status": "PUBLISHED",
    "category": { "id": "uuid", "name": "Acesso e Segurança" },
    "sla": { "priority": "MEDIUM", "responseMinutes": 240, "resolutionMinutes": 1440 },
    "approvalRequired": true,
    "formFields": [{ "name": "justification", "type": "textarea", "required": true }]
  }
}
```

---

### POST /catalog — Criar item do catálogo

**Permissões:** `IT_MANAGER`, `SUPER_ADMIN`

**Payload:**
```json
{
  "categoryId": "uuid",
  "name": "Solicitar Notebook",
  "descriptionUser": "...",
  "descriptionTech": "...",
  "audience": "END_USER",
  "defaultTicketType": "REQUEST",
  "approvalRequired": true,
  "approvalFlow": [{ "step": 1, "approverRole": "IT_MANAGER" }],
  "formSchema": [{ "name": "justification", "type": "textarea", "required": true }]
}
```

**Resposta (201):** Item criado com status `DRAFT`.

---

### PATCH /catalog/:id — Atualizar item

**Permissões:** `IT_MANAGER+`

**Resposta (200):** Item atualizado.

---

### POST /catalog/:id/publish — Publicar item

**Objetivo:** Mover item de DRAFT para PUBLISHED.
**Permissões:** `IT_MANAGER+`

**Resposta (200):** Item com `status: PUBLISHED`.

---

### POST /catalog/:id/deprecate — Deprecar item

**Objetivo:** Marcar item como DEPRECATED (não aceita novos chamados).
**Permissões:** `IT_MANAGER+`

**Payload:**
```json
{ "reason": "Substituído por novo processo de VPN" }
```

**Resposta (200).**

---

### GET /catalog/categories — Listar categorias

**Permissões:** Pública

**Resposta (200):** Hierarquia de categorias com `id`, `name`, `slug`, `parentId`, `icon`, `children`.

---

## 12. SLA

**Base:** `/api/v1/sla`

---

### GET /sla — Listar definições de SLA

**Permissões:** `IT_TECHNICIAN+`

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `priority` | enum | `CRITICAL`, `HIGH`, `MEDIUM`, `LOW` |
| `catalogId` | UUID | SLAs de item específico do catálogo |

**Resposta (200):** Lista de SLAs com `id`, `name`, `priority`, `responseMinutes`, `resolutionMinutes`, `workingHoursOnly`.

---

### GET /sla/:id — Buscar SLA

**Permissões:** `IT_TECHNICIAN+`

**Resposta (200):** Dados completos do SLA incluindo regras de escalonamento.

---

### POST /sla — Criar SLA

**Permissões:** `IT_MANAGER+`

**Payload:**
```json
{
  "catalogId": null,
  "priority": "CRITICAL",
  "name": "SLA Crítico - 24x7",
  "responseMinutes": 15,
  "resolutionMinutes": 60,
  "workingHoursOnly": false,
  "pauseOnWeekends": false,
  "businessHoursStart": "00:00",
  "businessHoursEnd": "23:59",
  "escalationRules": [
    { "atPercentage": 80, "action": "NOTIFY_MANAGER" },
    { "atPercentage": 100, "action": "ESCALATE_TO_SPECIALIST" }
  ]
}
```

**Resposta (201).**

---

### PATCH /sla/:id — Atualizar SLA

**Permissões:** `IT_MANAGER+`

**Resposta (200):** Nova versão criada (versionamento automático). Versão anterior marcada como `is_current=false`.

---

### GET /sla/history/:ticketId — Histórico de SLA de um ticket

**Objetivo:** Retornar todos os eventos de SLA de um ticket (início, pausas, retomadas, violações).
**Permissões:** `IT_TECHNICIAN+`

**Resposta (200):**
```json
{
  "data": {
    "ticketId": "uuid",
    "ticketNumber": "TKT-2026-000123",
    "currentStatus": "AT_RISK",
    "responseDeadline": "2026-06-09T15:00:00Z",
    "resolutionDeadline": "2026-06-09T18:00:00Z",
    "pausedTotalMinutes": 45,
    "events": [
      { "event": "STARTED", "eventAt": "2026-06-09T13:00:00Z" },
      { "event": "PAUSED", "eventAt": "2026-06-09T13:30:00Z", "reason": "Aguardando usuário" },
      { "event": "RESUMED", "eventAt": "2026-06-09T14:15:00Z" }
    ]
  }
}
```

---

## 13. Tickets

**Base:** `/api/v1/tickets`

---

### GET /tickets — Listar tickets

**Permissões:** `END_USER` (apenas próprios); `IT_TECHNICIAN+` (todos do seu grupo); `IT_MANAGER+` (todos)

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `q` | string | Busca full-text em título e descrição |
| `type` | enum | `INCIDENT`, `REQUEST`, `PROBLEM` |
| `status` | enum/lista | `OPEN,IN_PROGRESS` |
| `priority` | enum/lista | `CRITICAL,HIGH` |
| `assigneeId` | UUID | Atribuído a |
| `requesterId` | UUID | Solicitado por |
| `departmentId` | UUID | Departamento |
| `catalogId` | UUID | Item do catálogo |
| `slaAtRisk` | boolean | `true` = apenas com SLA em risco |
| `createdAt[gte]` | date | Filtro de período |
| `createdAt[lte]` | date | Filtro de período |
| `page`, `perPage`, `sort` | — | Paginação e ordenação |

**Resposta (200):** Lista paginada. Campos: `id`, `number`, `title`, `type`, `status`, `priority`, `requester`, `assignee`, `slaStatus`, `createdAt`.

---

### GET /tickets/:id — Buscar ticket

**Permissões:** Solicitante do ticket, técnico atribuído, ou `IT_TECHNICIAN+`

**Resposta (200):**
```json
{
  "data": {
    "id": "uuid",
    "number": "TKT-2026-000123",
    "type": "INCIDENT",
    "title": "VPN não conecta",
    "description": "...",
    "status": { "id": "uuid", "name": "IN_PROGRESS" },
    "priority": { "id": "uuid", "name": "HIGH" },
    "requester": { "id": "uuid", "displayName": "João Silva" },
    "assignee": { "id": "uuid", "displayName": "Técnico TI" },
    "catalog": { "id": "uuid", "name": "Incidente de Acesso" },
    "sla": {
      "status": "AT_RISK",
      "responseDeadline": "...",
      "resolutionDeadline": "...",
      "minutesRemaining": 45
    },
    "glpiTicketId": "1234",
    "csatScore": null,
    "comments": [],
    "attachments": [],
    "createdAt": "..."
  }
}
```

---

### POST /tickets — Criar ticket

**Permissões:** Qualquer usuário autenticado

**Payload:**
```json
{
  "type": "INCIDENT",
  "title": "VPN não conecta após atualização do Windows",
  "description": "Desde ontem a VPN corporativa para de conectar...",
  "catalogId": "uuid",
  "impact": "MODERATE",
  "urgency": "HIGH",
  "affectedAssetId": null,
  "departmentId": "uuid",
  "metadata": { "vpnClient": "Cisco AnyConnect", "osVersion": "11" }
}
```

**Resposta (201):**
```json
{
  "data": {
    "id": "uuid",
    "number": "TKT-2026-000124",
    "priority": "HIGH",
    "slaResponseDeadline": "2026-06-09T16:00:00Z",
    "slaResolutionDeadline": "2026-06-09T21:00:00Z"
  }
}
```

---

### PATCH /tickets/:id — Atualizar ticket

**Permissões:** Técnico atribuído ou `IT_MANAGER+`

**Payload (campos atualizáveis):**
```json
{
  "title": "Título atualizado",
  "description": "Descrição atualizada",
  "priority": "CRITICAL",
  "status": "IN_PROGRESS",
  "assigneeId": "uuid",
  "impact": "SIGNIFICANT",
  "urgency": "CRITICAL"
}
```

**Resposta (200):** Ticket atualizado.

---

### DELETE /tickets/:id — Cancelar ticket

**Objetivo:** Soft delete — cancela o ticket.
**Permissões:** Solicitante (se OPEN) ou `IT_MANAGER+`

**Payload:**
```json
{ "reason": "Aberto por engano" }
```

**Resposta (204).**

---

### POST /tickets/:id/comments — Adicionar comentário

**Permissões:** Qualquer usuário com acesso ao ticket

**Payload:**
```json
{
  "content": "Verificado no servidor de autenticação — certificado expirado.",
  "type": "INTERNAL"
}
```

`type`: `PUBLIC` (visível ao solicitante) ou `INTERNAL` (apenas técnicos).

**Resposta (201):** Comentário criado.

---

### GET /tickets/:id/comments — Listar comentários

**Permissões:** Solicitante vê apenas `PUBLIC`; `IT_TECHNICIAN+` vê todos

**Resposta (200):** Lista de comentários com `id`, `author`, `content`, `type`, `source`, `createdAt`.

---

### POST /tickets/:id/attachments — Adicionar anexo

**Permissões:** Qualquer usuário com acesso ao ticket
**Content-Type:** `multipart/form-data`

**Form Fields:**
| Campo | Tipo | Obrigatório | Limite |
|-------|------|:-----------:|--------|
| `file` | file | Sim | 50MB máx. |
| `description` | string | Não | 300 chars |

**Resposta (201):**
```json
{
  "data": {
    "id": "uuid",
    "filename": "screenshot-erro.png",
    "mimeType": "image/png",
    "sizeBytes": 245678,
    "downloadUrl": "https://... (URL assinada, expira em 1h)"
  }
}
```

**Erros:**
| HTTP | Código | Situação |
|------|--------|---------|
| 400 | `FILE_TYPE_NOT_ALLOWED` | MIME type não permitido |
| 400 | `FILE_SIZE_EXCEEDED` | Arquivo maior que 50MB |

---

### GET /tickets/:id/attachments — Listar anexos

**Resposta (200):** Lista de anexos com URL assinada para download (expira em 1h).

---

### POST /tickets/:id/transfer — Transferir ticket

**Objetivo:** Transferir atribuição para outro técnico ou grupo.
**Permissões:** Técnico atribuído, `IT_MANAGER+`

**Payload:**
```json
{
  "toAssigneeId": "uuid",
  "toGroupId": null,
  "reason": "Fora da minha especialidade — escalando para infraestrutura"
}
```

**Resposta (200):** Ticket com nova atribuição.

---

### POST /tickets/:id/sla/pause — Pausar SLA

**Permissões:** Técnico atribuído, `IT_MANAGER+`

**Payload:**
```json
{ "reason": "Aguardando retorno do fornecedor externo" }
```

**Resposta (200):** SLA pausado.

---

### POST /tickets/:id/sla/resume — Retomar SLA

**Permissões:** Técnico atribuído, `IT_MANAGER+`

**Resposta (200):** SLA retomado.

---

### POST /tickets/:id/resolve — Resolver ticket

**Permissões:** Técnico atribuído, `IT_TECHNICIAN+`

**Payload:**
```json
{
  "resolutionNotes": "Renovado certificado SSL do servidor de autenticação VPN.",
  "kbArticleId": "uuid"
}
```

**Resposta (200):** Ticket com status `RESOLVED`.

---

### POST /tickets/:id/close — Fechar ticket

**Permissões:** Solicitante do ticket (confirmação de resolução) ou `IT_MANAGER+` (24h após resolução, automático)

**Payload:**
```json
{
  "csatScore": 5,
  "csatComment": "Resolvido rapidamente!"
}
```

**Resposta (200):** Ticket com status `CLOSED`.

---

### POST /tickets/:id/reopen — Reabrir ticket

**Permissões:** Solicitante (até 7 dias após fechamento) ou `IT_MANAGER+`

**Payload:**
```json
{ "justification": "O problema voltou após reinicialização do sistema." }
```

**Resposta (200):** Ticket reaberto com status `OPEN`.

---

## 14. Incidents

**Base:** `/api/v1/incidents`

---

### GET /incidents — Listar incidentes

**Permissões:** `IT_TECHNICIAN+`

**Query Parameters adicionais (além dos de ticket):**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `classification` | enum | `HARDWARE`, `SOFTWARE`, `NETWORK`, `ACCESS`, `PERFORMANCE` |
| `affectedAssetId` | UUID | Incidentes do ativo |
| `problemId` | UUID | Incidentes vinculados a um problema |
| `isKnownError` | boolean | Tem workaround publicado |

**Resposta (200):** Lista paginada com campos de ticket + `incidentNumber`, `classification`, `affectedAsset`, `workaroundApplied`.

---

### GET /incidents/:id — Buscar incidente

**Resposta (200):** Dados do ticket base + dados específicos do incidente (classification, affectedAsset, incidentImpacts, incidentCauses, linkedProblem).

---

### PATCH /incidents/:id — Atualizar incidente

**Permissões:** Técnico atribuído, `IT_TECHNICIAN+`

**Payload (campos específicos de incidente):**
```json
{
  "classification": "SOFTWARE",
  "affectedAssetId": "uuid",
  "affectedServiceCount": 45,
  "businessImpact": "Todos os usuários do RJ sem acesso à VPN corporativa",
  "workaroundApplied": true,
  "workaroundDescription": "Reiniciar cliente VPN resolve temporariamente"
}
```

---

### POST /incidents/:id/impacts — Adicionar impacto

**Objetivo:** Registrar ativo, serviço ou grupo impactado pelo incidente.
**Permissões:** Técnico atribuído, `IT_TECHNICIAN+`

**Payload:**
```json
{
  "impactType": "ASSET",
  "referenceId": "uuid",
  "referenceType": "Asset",
  "description": "Impressora do setor financeiro offline"
}
```

**Resposta (201).**

---

### POST /incidents/:id/causes — Registrar causa

**Permissões:** `IT_SPECIALIST+`

**Payload:**
```json
{
  "category": "SOFTWARE_BUG",
  "description": "Certificado SSL do servidor de autenticação expirou",
  "isRootCause": true
}
```

**Resposta (201).**

---

### POST /incidents/:id/link-problem — Vincular a problema

**Objetivo:** Associar o incidente a um problema existente.
**Permissões:** `IT_SPECIALIST+`

**Payload:**
```json
{ "problemId": "uuid" }
```

**Resposta (200).**

---

## 15. Requests

**Base:** `/api/v1/requests`

---

### GET /requests — Listar requisições

**Permissões:** `END_USER` (próprias); `IT_TECHNICIAN+` (todas)

**Query Parameters adicionais:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `requestTypeId` | UUID | Tipo de requisição |
| `pendingApproval` | boolean | Aguardando minha aprovação |
| `approvalStep` | integer | Etapa de aprovação atual |

**Resposta (200):** Lista com `requestNumber`, `requestType`, `status`, `currentApprovalStep`, `requester`.

---

### GET /requests/:id — Buscar requisição

**Resposta (200):** Dados do ticket base + `requestType`, `formData`, `approvalSteps` (com status de cada etapa), `fulfillmentNotes`.

---

### POST /requests/:id/approve — Aprovar etapa

**Objetivo:** Aprovar a etapa de aprovação do qual o usuário é responsável.
**Permissões:** Aprovador da etapa atual

**Payload:**
```json
{ "notes": "Aprovado — usuário tem necessidade justificada." }
```

**Resposta (200):** Requisição com próxima etapa ou status `APPROVED` (se última etapa).

**Erros:**
| HTTP | Código | Situação |
|------|--------|---------|
| 403 | `NOT_CURRENT_APPROVER` | Usuário não é o aprovador da etapa atual |
| 409 | `ALREADY_DECIDED` | Etapa já foi decidida |
| 422 | `REQUESTER_CANNOT_APPROVE_OWN` | Solicitante não pode aprovar a própria requisição |

---

### POST /requests/:id/reject — Rejeitar etapa

**Permissões:** Aprovador da etapa atual

**Payload:**
```json
{ "reason": "Justificativa insuficiente para aquisição de notebook adicional." }
```

**Resposta (200):** Requisição com status `REJECTED`.

---

### POST /requests/:id/delegate — Delegar aprovação

**Permissões:** Aprovador da etapa atual

**Payload:**
```json
{
  "delegateToId": "uuid",
  "reason": "Em férias — delegando para meu substituto"
}
```

**Resposta (200).**

---

### POST /requests/:id/fulfill — Registrar entrega

**Objetivo:** Marcar a requisição como entregue/executada.
**Permissões:** Técnico atribuído, `IT_TECHNICIAN+`

**Payload:**
```json
{ "fulfillmentNotes": "Acesso VPN configurado e testado com o usuário." }
```

**Resposta (200):** Requisição com status `FULFILLED`.

---

### GET /requests/pending-approvals — Aprovações pendentes

**Objetivo:** Listar requisições aguardando aprovação do usuário autenticado.
**Permissões:** Qualquer usuário (filtra por aprovações do próprio usuário)

**Resposta (200):** Lista de requisições com `id`, `number`, `title`, `requester`, `estimatedValue`, `stepNumber`, `deadline`.

---

## 16. Problems

**Base:** `/api/v1/problems`

---

### GET /problems — Listar problemas

**Permissões:** `IT_SPECIALIST+`

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `status` | enum | `UNDER_INVESTIGATION`, `ROOT_CAUSE_IDENTIFIED`, `KNOWN_ERROR`, `RESOLVED` |
| `isKnownError` | boolean | Apenas erros conhecidos |

**Resposta (200):** Lista com `problemNumber`, `title`, `status`, `isKnownError`, `linkedIncidentsCount`.

---

### GET /problems/:id — Buscar problema

**Resposta (200):** Dados do ticket base + `status`, `isKnownError`, `rootCauses`, `workarounds`, `linkedIncidents`.

---

### POST /problems — Criar problema

**Permissões:** `IT_SPECIALIST+`

**Payload:**
```json
{
  "title": "VPN com falha recorrente em certificado SSL",
  "description": "Incidentes recorrentes de VPN causados por expiração de certificado...",
  "catalogId": "uuid",
  "impact": "SIGNIFICANT",
  "urgency": "HIGH",
  "linkedIncidentIds": ["uuid", "uuid"]
}
```

**Resposta (201).**

---

### POST /problems/:id/root-causes — Registrar causa raiz

**Permissões:** `IT_SPECIALIST+`

**Payload:**
```json
{
  "description": "Processo de renovação de certificado SSL não automatizado",
  "analysis": "Análise via 5 Porquês: ...",
  "isRootCause": true,
  "solutionDescription": "Implementar renovação automática via Let's Encrypt"
}
```

**Resposta (201).**

---

### POST /problems/:id/workarounds — Publicar workaround

**Permissões:** `IT_SPECIALIST+`

**Payload:**
```json
{
  "title": "Reiniciar cliente VPN resolve temporariamente",
  "description": "1. Encerre o Cisco AnyConnect\n2. Aguarde 30 segundos\n3. Reconecte...",
  "limitations": "Funciona apenas se o certificado tiver menos de 48h expirado"
}
```

**Resposta (201):** Workaround com status `DRAFT`.

---

### POST /problems/:id/workarounds/:wId/publish — Publicar workaround

**Permissões:** `IT_MANAGER+`

**Resposta (200):** Workaround com status `PUBLISHED`. Rascunho de artigo KB gerado automaticamente.

---

### GET /problems/known-errors — Listar erros conhecidos

**Objetivo:** Listar problemas com workarounds publicados (KEDB).
**Permissões:** `IT_TECHNICIAN+`

**Resposta (200):** Lista de erros conhecidos com `title`, `workaround`, `catalog`.

---

## 17. Assets

**Base:** `/api/v1/assets`

---

### GET /assets — Listar ativos

**Permissões:** `IT_TECHNICIAN+`

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `q` | string | Busca por tag, nome, serial |
| `status` | enum/lista | Status do ativo |
| `categoryId` | UUID | Categoria |
| `departmentId` | UUID | Departamento |
| `assignedToId` | UUID | Atribuído ao usuário |
| `warrantyEnding` | integer | Garantia vencendo em X dias |
| `glpiSynced` | boolean | Apenas sincronizados com GLPI |

**Resposta (200):** Lista com `assetTag`, `name`, `category`, `status`, `assignedTo`, `warrantyEnd`, `currentValue`.

---

### GET /assets/:id — Buscar ativo

**Resposta (200):**
```json
{
  "data": {
    "id": "uuid",
    "assetTag": "NB-2024-0042",
    "name": "Notebook Dell XPS 15",
    "serialNumber": "DXPS15-2024-001",
    "category": { "id": "uuid", "name": "Workstation" },
    "status": "IN_USE",
    "location": "Escritório SP - Andar 3",
    "assignedTo": { "id": "uuid", "displayName": "João Silva" },
    "department": { "id": "uuid", "name": "TI - Desenvolvimento" },
    "purchaseDate": "2024-01-15",
    "purchaseValue": 8500.00,
    "currentValue": 6375.00,
    "warrantyStart": "2024-01-15",
    "warrantyEnd": "2027-01-15",
    "supplier": { "id": "uuid", "name": "Dell Technologies" },
    "contract": { "id": "uuid", "number": "CTR-2024-001" },
    "glpiReference": { "glpiItemId": 1234, "lastSyncAt": "..." },
    "customFields": { "processor": "Intel Core i9", "ram": "32GB" }
  }
}
```

---

### POST /assets — Registrar ativo

**Permissões:** `IT_TECHNICIAN+`

**Payload:**
```json
{
  "categoryId": "uuid",
  "assetTag": "NB-2026-0101",
  "name": "Notebook Dell Latitude 5540",
  "serialNumber": "DL5540-001",
  "model": "Latitude 5540",
  "manufacturer": "Dell Technologies",
  "location": "Almoxarifado TI",
  "purchaseDate": "2026-06-01",
  "purchaseValue": 7200.00,
  "warrantyStart": "2026-06-01",
  "warrantyEnd": "2029-06-01",
  "warrantyProvider": "Dell",
  "supplierId": "uuid",
  "contractId": "uuid",
  "customFields": { "processor": "Intel Core i5", "ram": "16GB", "storage": "512GB SSD" }
}
```

**Resposta (201):** Ativo com status `RECEIVED`.

---

### PATCH /assets/:id — Atualizar ativo

**Permissões:** `IT_TECHNICIAN+`

**Resposta (200):** Ativo atualizado.

---

### POST /assets/:id/allocate — Alocar ativo a usuário

**Permissões:** `IT_TECHNICIAN+`

**Payload:**
```json
{
  "userId": "uuid",
  "conditionOnAssign": "GOOD",
  "notes": "Notebook configurado com acesso ao domínio"
}
```

**Resposta (200):** Ativo com status `ALLOCATED`.

**Erros:**
| HTTP | Código | Situação |
|------|--------|---------|
| 409 | `ASSET_ALREADY_ALLOCATED` | Ativo já está alocado |

---

### POST /assets/:id/deallocate — Desalocar ativo

**Permissões:** `IT_TECHNICIAN+`

**Payload:**
```json
{
  "conditionOnReturn": "GOOD",
  "notes": "Devolvido após desligamento do colaborador"
}
```

**Resposta (200):** Ativo com status `IN_STOCK`.

---

### POST /assets/:id/maintenance — Agendar manutenção

**Permissões:** `IT_TECHNICIAN+`

**Payload:**
```json
{
  "type": "PREVENTIVE",
  "scheduledFor": "2026-07-15",
  "provider": "Dell Suporte Técnico",
  "description": "Manutenção preventiva anual",
  "ticketId": null
}
```

**Resposta (201):** Registro de manutenção com status `SCHEDULED`.

---

### POST /assets/:id/decommission — Descomissionar ativo

**Permissões:** `IT_SPECIALIST+` (requer aprovação `IT_MANAGER`)

**Payload:**
```json
{
  "reason": "Fim da vida útil — 5 anos de uso",
  "disposalMethod": "DONATION"
}
```

**Resposta (200):** Ativo com status `DECOMMISSIONED`.

---

### GET /assets/:id/history — Histórico do ativo

**Objetivo:** Retornar histórico completo: atribuições, movimentações, manutenções, chamados relacionados.
**Permissões:** `IT_TECHNICIAN+`

**Resposta (200):**
```json
{
  "data": {
    "assignments": [...],
    "movements": [...],
    "maintenances": [...],
    "relatedTickets": [...]
  }
}
```

---

### POST /assets/:id/move — Registrar movimentação

**Permissões:** `IT_TECHNICIAN+`

**Payload:**
```json
{
  "fromLocation": "Escritório SP - Andar 3",
  "toLocation": "Escritório SP - Andar 5",
  "reason": "Realocação de setor"
}
```

**Resposta (201).**

---

## 18. GLPI Integration

**Base:** `/api/v1/integrations/glpi`

---

### GET /integrations/glpi/health — Status da integração

**Permissões:** `IT_MANAGER+`

**Resposta (200):**
```json
{
  "data": {
    "status": "healthy",
    "latencyMs": 245,
    "lastSuccessfulSync": "2026-06-09T13:00:00Z",
    "pendingEvents": 3,
    "circuitBreakerStatus": "CLOSED"
  }
}
```

---

### POST /integrations/glpi/sync/tickets — Sincronizar tickets

**Objetivo:** Forçar sincronização de status de tickets com GLPI.
**Permissões:** `IT_MANAGER+`

**Payload:**
```json
{
  "ticketIds": ["uuid", "uuid"],
  "direction": "FROM_GLPI"
}
```

`direction`: `FROM_GLPI` (GLPI → SGTI) ou `TO_GLPI` (SGTI → GLPI)

**Resposta (202):** Job de sincronização iniciado.
```json
{
  "data": { "jobId": "uuid", "status": "QUEUED", "estimatedDuration": "30s" }
}
```

---

### POST /integrations/glpi/sync/assets — Sincronizar inventário de ativos

**Objetivo:** Importar inventário do GLPI para o SGTI.
**Permissões:** `IT_MANAGER+`

**Resposta (202):** Job iniciado.

---

### GET /integrations/glpi/sync/status/:jobId — Consultar status do job

**Permissões:** `IT_MANAGER+`

**Resposta (200):**
```json
{
  "data": {
    "jobId": "uuid",
    "status": "COMPLETED",
    "processed": 145,
    "created": 12,
    "updated": 130,
    "errors": 3,
    "errorDetails": [...]
  }
}
```

---

### GET /integrations/glpi/failures — Listar falhas de sincronização

**Permissões:** `IT_MANAGER+`

**Resposta (200):** Lista de `SyncFailureRecord` com `integration`, `operation`, `error`, `attempts`, `nextRetryAt`.

---

## 19. Identity Management

**Base:** `/api/v1/identity`

---

### GET /identity/users — Listar identidades

**Permissões:** `IT_MANAGER+`

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `iamStatus` | enum | `ACTIVE`, `PENDING_PROVISIONING`, `PENDING_DEPROVISIONING` |
| `reviewOverdue` | boolean | Revisão de acesso atrasada |
| `departmentId` | UUID | Por departamento |

**Resposta (200):** Lista com `id`, `displayName`, `iamStatus`, `lastAccessReviewAt`, `nextAccessReviewDue`, `provisioningStatus`.

---

### GET /identity/users/:id — Buscar identidade

**Permissões:** `IT_MANAGER+`

**Resposta (200):** Dados completos da identidade incluindo grupos, permissões individuais e referência Google.

---

### POST /identity/users/:id/provision — Provisionar usuário

**Objetivo:** Iniciar processo de provisionamento de acesso (criação de conta Google e permissões).
**Permissões:** `IT_MANAGER+`

**Payload:**
```json
{
  "roles": ["IT_TECHNICIAN"],
  "groups": ["uuid"],
  "reason": "Admissão em 10/06/2026"
}
```

**Resposta (202):** Provisionamento iniciado.

---

### POST /identity/users/:id/deprovision — Desprovisionar usuário

**Objetivo:** Revogar todos os acessos e desativar conta Google.
**Permissões:** `IT_MANAGER+`

**Payload:**
```json
{ "reason": "Desligamento em 10/06/2026 — processo #DEL-2026-042" }
```

**Resposta (202):** Desprovisionamento iniciado. Todas as sessões revogadas imediatamente.

---

### POST /identity/users/:id/suspend — Suspender usuário

**Permissões:** `IT_MANAGER+`

**Payload:**
```json
{ "reason": "Suspeita de comprometimento de credenciais" }
```

**Resposta (204):** Usuário suspenso. Sessões revogadas.

---

### POST /identity/access-reviews — Iniciar revisão de acessos

**Objetivo:** Criar ciclo de revisão periódica de acessos.
**Permissões:** `IT_MANAGER+`

**Payload:**
```json
{
  "title": "Revisão Trimestral Q2 2026",
  "userIds": ["uuid"],
  "reviewerIds": ["uuid"],
  "dueDate": "2026-07-09"
}
```

**Resposta (201):** Ciclo de revisão criado com status `PENDING`.

---

### GET /identity/access-reviews/pending — Pendências de revisão

**Objetivo:** Listar identidades com revisão de acesso vencida ou próxima do vencimento.
**Permissões:** `IT_MANAGER+`

**Resposta (200):** Lista de identidades com `displayName`, `lastAccessReviewAt`, `nextAccessReviewDue`, `daysSinceReview`.

---

### GET /identity/groups — Listar grupos

**Permissões:** `IT_MANAGER+`

**Resposta (200):** Lista de grupos com `id`, `name`, `type`, `memberCount`, `googleGroupEmail`.

---

### POST /identity/groups/:id/members — Adicionar membro ao grupo

**Permissões:** `IT_MANAGER+`

**Payload:**
```json
{ "userId": "uuid" }
```

**Resposta (201).**

---

### DELETE /identity/groups/:id/members/:userId — Remover membro do grupo

**Permissões:** `IT_MANAGER+`

**Resposta (204).**

---

## 20. Google Workspace

**Base:** `/api/v1/integrations/google`

---

### GET /integrations/google/health — Status da integração

**Permissões:** `IT_MANAGER+`

**Resposta (200):**
```json
{
  "data": {
    "status": "healthy",
    "domain": "empresa.com",
    "lastSyncAt": "2026-06-09T02:00:00Z",
    "pendingProvisionings": 2
  }
}
```

---

### POST /integrations/google/sync — Sincronizar usuários do Google

**Objetivo:** Importar/atualizar usuários do Google Workspace no SGTI.
**Permissões:** `IT_MANAGER+`

**Payload:**
```json
{
  "syncType": "INCREMENTAL",
  "orgUnit": "/TI"
}
```

`syncType`: `FULL` (todos) ou `INCREMENTAL` (apenas mudanças desde última sync)

**Resposta (202):** Job de sincronização iniciado.

---

### GET /integrations/google/users — Listar usuários Google

**Objetivo:** Consultar usuários diretamente no Google Workspace (sem passar pelo cache SGTI).
**Permissões:** `IT_MANAGER+`

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `q` | string | Busca por nome ou e-mail |
| `orgUnit` | string | Filtrar por unidade organizacional |
| `suspended` | boolean | Contas suspensas |

**Resposta (200):** Lista de usuários Google com `googleUserId`, `email`, `displayName`, `orgUnit`, `suspended`.

---

## 21. Compliance

**Base:** `/api/v1/compliance`

---

### GET /compliance/audits — Listar auditorias

**Permissões:** `COMPLIANCE_OFFICER`, `AUDITOR`, `IT_MANAGER+`

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `status` | enum | `PLANNED`, `IN_PROGRESS`, `COMPLETED` |
| `type` | enum | `INTERNAL`, `EXTERNAL`, `REGULATORY` |

**Resposta (200):** Lista com `id`, `title`, `type`, `status`, `responsible`, `plannedStart`, `plannedEnd`, `maturityScore`.

---

### GET /compliance/audits/:id — Buscar auditoria

**Resposta (200):** Dados completos incluindo normas, achados, planos de ação e métricas de maturidade.

---

### POST /compliance/audits — Criar auditoria

**Permissões:** `COMPLIANCE_OFFICER+`

**Payload:**
```json
{
  "title": "Auditoria ISO 27001 - Q2 2026",
  "type": "INTERNAL",
  "responsibleId": "uuid",
  "scope": "Controles de segurança da informação — Domínio A.8 a A.14",
  "plannedStart": "2026-07-01",
  "plannedEnd": "2026-07-31",
  "normIds": ["uuid"],
  "previousAuditId": "uuid"
}
```

**Resposta (201).**

---

### GET /compliance/audits/:id/findings — Listar apontamentos

**Permissões:** `COMPLIANCE_OFFICER`, `AUDITOR`, `IT_MANAGER+`

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `type` | enum | `NON_CONFORMANCE`, `OBSERVATION`, `OPPORTUNITY` |
| `severity` | enum | `CRITICAL`, `MAJOR`, `MINOR` |
| `status` | enum | `OPEN`, `IN_TREATMENT`, `RESOLVED` |

---

### POST /compliance/audits/:id/findings — Criar apontamento

**Permissões:** `COMPLIANCE_OFFICER+`

**Payload:**
```json
{
  "normItemId": "uuid",
  "title": "Política de backup sem revisão há 18 meses",
  "description": "...",
  "type": "NON_CONFORMANCE",
  "severity": "MAJOR",
  "responsibleId": "uuid",
  "dueDate": "2026-08-31"
}
```

**Resposta (201).**

---

### POST /compliance/findings/:id/evidences — Adicionar evidência

**Permissões:** `COMPLIANCE_OFFICER+`
**Content-Type:** `multipart/form-data`

**Form Fields:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| `file` | file | Condicional | Arquivo de evidência (max. 50MB) |
| `description` | string | Sim | Descrição da evidência |
| `evidenceType` | enum | Sim | `DOCUMENT`, `SCREENSHOT`, `LOG`, `REPORT` |

**Resposta (201):** Evidência com `id`, `fileHash`, `reviewStatus: PENDING`.

---

### POST /compliance/evidences/:id/approve — Aprovar evidência

**Permissões:** `COMPLIANCE_OFFICER+` (diferente de quem carregou)

**Resposta (200):** Evidência com `reviewStatus: APPROVED`.

---

### POST /compliance/findings/:id/action-plan — Criar plano de ação

**Permissões:** `COMPLIANCE_OFFICER+`

**Payload:**
```json
{
  "responsibleId": "uuid",
  "rootCauseAnalysis": "Processo de revisão de políticas não formalizado...",
  "actions": [
    { "description": "Revisar política de backup", "dueDate": "2026-07-31" },
    { "description": "Aprovar nova versão da política", "dueDate": "2026-08-15" }
  ],
  "targetDate": "2026-08-31"
}
```

**Resposta (201).**

---

### GET /compliance/norms — Listar normas

**Permissões:** `COMPLIANCE_OFFICER`, `AUDITOR`, `IT_MANAGER+`

**Resposta (200):** Lista de normas com `id`, `name`, `shortName`, `type`, `version`, `isCurrent`.

---

### GET /compliance/norms/:id/items — Listar itens de norma

**Resposta (200):** Hierarquia de controles/artigos da norma.

---

## 22. Financial

**Base:** `/api/v1/finance`

---

### GET /finance/budgets — Listar orçamentos

**Permissões:** `FINANCIAL_ANALYST`, `IT_MANAGER+`

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `fiscalYear` | integer | Ano fiscal |
| `type` | enum | `CAPEX`, `OPEX` |
| `costCenterId` | UUID | Centro de custo |
| `status` | enum | `DRAFT`, `APPROVED`, `ACTIVE`, `CLOSED` |

**Resposta (200):** Lista com `id`, `fiscalYear`, `type`, `costCenter`, `totalAmount`, `spentAmount`, `utilizationPercentage`, `status`.

---

### GET /finance/budgets/:id — Buscar orçamento

**Resposta (200):** Dados completos incluindo `budgetItems`, despesas do período, variância vs. orçado.

---

### POST /finance/budgets — Criar orçamento

**Permissões:** `FINANCIAL_ANALYST`, `IT_MANAGER+`

**Payload:**
```json
{
  "fiscalYear": 2026,
  "type": "OPEX",
  "costCenterId": "uuid",
  "totalAmount": 150000.00,
  "items": [
    { "category": "Licenças de Software", "description": "Microsoft 365", "plannedAmount": 45000.00 },
    { "category": "Serviços Cloud", "description": "AWS", "plannedAmount": 36000.00 }
  ]
}
```

**Resposta (201).**

---

### POST /finance/budgets/:id/approve — Aprovar orçamento

**Permissões:** `IT_MANAGER+`

**Resposta (200):** Orçamento com status `APPROVED`.

---

### GET /finance/opex — Listar despesas OPEX

**Permissões:** `FINANCIAL_ANALYST`, `IT_MANAGER+`

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `period` | string | `YYYY-MM` (ex: `2026-06`) |
| `costCenterId` | UUID | Centro de custo |
| `supplierId` | UUID | Fornecedor |
| `status` | enum | `PENDING`, `APPROVED`, `PAID` |
| `category` | string | Categoria da despesa |

**Resposta (200):** Lista paginada com `id`, `description`, `amount`, `expenseDate`, `costCenter`, `supplier`, `status`.

---

### POST /finance/opex — Registrar despesa OPEX

**Permissões:** `FINANCIAL_ANALYST`, `IT_MANAGER+`

**Payload:**
```json
{
  "costCenterId": "uuid",
  "supplierId": "uuid",
  "contractId": "uuid",
  "category": "Licenças de Software",
  "description": "Renovação Microsoft 365 - Junho 2026",
  "amount": 3750.00,
  "expenseDate": "2026-06-01",
  "invoiceNumber": "NF-2026-12345"
}
```

**Resposta (201).**

---

### GET /finance/capex — Listar investimentos CAPEX

**Permissões:** `FINANCIAL_ANALYST`, `IT_MANAGER+`

**Resposta (200):** Lista com `id`, `description`, `amount`, `investmentDate`, `costCenter`, `asset`, `project`, `status`.

---

### POST /finance/capex — Registrar investimento CAPEX

**Permissões:** `FINANCIAL_ANALYST`, `IT_MANAGER+`

**Payload:**
```json
{
  "costCenterId": "uuid",
  "assetId": "uuid",
  "projectId": null,
  "description": "Aquisição Notebook Dell XPS 15",
  "amount": 8500.00,
  "investmentDate": "2026-06-09",
  "depreciationYears": 3,
  "depreciationStart": "2026-07-01"
}
```

**Resposta (201).**

---

### GET /finance/suppliers — Listar fornecedores

**Permissões:** `FINANCIAL_ANALYST`, `IT_MANAGER+`, `PROCUREMENT_MANAGER`

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `q` | string | Busca por nome ou CNPJ |
| `category` | enum | Categoria do fornecedor |
| `isActive` | boolean | Apenas ativos |

---

### POST /finance/suppliers — Cadastrar fornecedor

**Permissões:** `FINANCIAL_ANALYST`, `IT_MANAGER+`

**Payload:**
```json
{
  "name": "Dell Technologies Brasil Ltda",
  "tradeName": "Dell",
  "cnpj": "72.381.189/0001-10",
  "category": "HARDWARE",
  "contactName": "Gerente de Contas",
  "contactEmail": "contas@dell.com",
  "contactPhone": "11 9xxxx-xxxx"
}
```

**Resposta (201).**

---

### GET /finance/contracts — Listar contratos

**Permissões:** `FINANCIAL_ANALYST`, `IT_MANAGER+`

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `supplierId` | UUID | Por fornecedor |
| `status` | enum | `ACTIVE`, `EXPIRING_SOON`, `EXPIRED` |
| `expiringInDays` | integer | Contratos vencendo em X dias |

**Resposta (200):** Lista com `id`, `number`, `title`, `supplier`, `value`, `endDate`, `status`, `daysUntilExpiry`.

---

### POST /finance/contracts — Cadastrar contrato

**Permissões:** `FINANCIAL_ANALYST`, `IT_MANAGER+`

**Payload:**
```json
{
  "supplierId": "uuid",
  "number": "CTR-2026-001",
  "title": "Suporte Dell - Notebooks TI",
  "type": "MAINTENANCE",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "value": 18000.00,
  "paymentFrequency": "MONTHLY",
  "autoRenew": false,
  "alertDaysBefore": 90,
  "costCenterId": "uuid",
  "responsibleId": "uuid"
}
```

**Resposta (201).**

---

### GET /finance/cost-allocation — Rateio de custos

**Objetivo:** Relatório de rateio de custos de TI por unidade de negócio.
**Permissões:** `FINANCIAL_ANALYST`, `IT_MANAGER+`

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `period` | string | `YYYY-MM` |
| `businessUnitId` | UUID | Por unidade de negócio |

**Resposta (200):** Rateio por BU com `totalAllocated`, `allocationPercentage`, `allocationBasis`.

---

## 23. Procurement

**Base:** `/api/v1/procurement`

---

### GET /procurement/requests — Listar solicitações de compra

**Permissões:** `IT_TECHNICIAN+` (próprias); `IT_MANAGER+` (todas)

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `status` | enum | Status da solicitação |
| `category` | enum | Categoria da compra |
| `priority` | enum | Prioridade |
| `requesterId` | UUID | Solicitante |

**Resposta (200):** Lista com `number`, `title`, `category`, `estimatedValue`, `status`, `requester`, `neededBy`.

---

### POST /procurement/requests — Criar solicitação de compra

**Permissões:** `IT_TECHNICIAN+`

**Payload:**
```json
{
  "category": "HARDWARE",
  "title": "Notebook para novo colaborador",
  "justification": "Admissão em 15/06/2026 — colaborador João Silva (matrícula 1234)",
  "estimatedValue": 7500.00,
  "costCenterId": "uuid",
  "budgetId": "uuid",
  "projectId": null,
  "neededBy": "2026-06-14",
  "priority": "HIGH"
}
```

**Resposta (201).**

---

### POST /procurement/requests/:id/approve — Aprovar solicitação

**Permissões:** `IT_MANAGER+` (conforme threshold de valor)

**Payload:**
```json
{ "notes": "Aprovado dentro do orçamento Q2" }
```

**Resposta (200).**

---

### GET /procurement/orders — Listar pedidos de compra

**Permissões:** `IT_MANAGER+`, `FINANCIAL_ANALYST`

**Resposta (200):** Lista com `orderNumber`, `supplier`, `totalValue`, `status`, `expectedDelivery`.

---

### POST /procurement/orders — Criar pedido de compra

**Permissões:** `IT_MANAGER+`

**Payload:**
```json
{
  "purchaseRequestId": "uuid",
  "supplierId": "uuid",
  "orderNumber": "PO-2026-001",
  "totalValue": 7500.00,
  "expectedDelivery": "2026-06-13",
  "deliveryAddress": "Rua das Flores, 123 - São Paulo/SP",
  "items": [
    {
      "description": "Notebook Dell Latitude 5540",
      "quantity": 1,
      "unit": "unidade",
      "unitPrice": 7500.00
    }
  ]
}
```

**Resposta (201).**

---

### POST /procurement/orders/:id/receive — Registrar recebimento

**Permissões:** `IT_TECHNICIAN+`

**Payload:**
```json
{
  "items": [
    {
      "purchaseItemId": "uuid",
      "receivedQuantity": 1,
      "createAsset": true,
      "assetData": {
        "assetTag": "NB-2026-0050",
        "serialNumber": "DL5540-2026-050",
        "location": "Almoxarifado TI"
      }
    }
  ]
}
```

**Resposta (200):** Pedido atualizado. Se `createAsset=true`, ativo criado automaticamente.

---

## 24. Projects

**Base:** `/api/v1/projects`

---

### GET /projects — Listar projetos

**Permissões:** `IT_TECHNICIAN+` (participantes); `IT_MANAGER+` (todos)

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `status` | enum | Status do projeto |
| `health` | enum | `GREEN`, `YELLOW`, `RED` |
| `managerId` | UUID | Gerente do projeto |
| `sponsorId` | UUID | Patrocinador |

**Resposta (200):** Lista com `code`, `name`, `status`, `health`, `manager`, `plannedEnd`, `actualEnd`, `budgetAmount`, `spentAmount`.

---

### GET /projects/:id — Buscar projeto

**Resposta (200):** Dados completos incluindo `tasks`, `risks`, `costs`, `githubRepos`, `healthHistory`.

---

### POST /projects — Criar projeto

**Permissões:** `IT_MANAGER+`

**Payload:**
```json
{
  "name": "Migração ERP para Cloud",
  "code": "PRJ-2026-001",
  "description": "...",
  "sponsorId": "uuid",
  "managerId": "uuid",
  "plannedStart": "2026-07-01",
  "plannedEnd": "2026-12-31",
  "budgetAmount": 250000.00,
  "githubRepos": ["empresa/erp-cloud-migration"]
}
```

**Resposta (201):** Projeto com status `IDEATION`.

---

### POST /projects/:id/approve — Aprovar projeto

**Permissões:** `IT_MANAGER+`

**Resposta (200):** Projeto com status `APPROVED`.

---

### GET /projects/:id/tasks — Listar tarefas

**Resposta (200):** Hierarquia de tarefas e marcos do projeto.

---

### POST /projects/:id/tasks — Criar tarefa

**Permissões:** Gerente do projeto, `IT_MANAGER+`

**Payload:**
```json
{
  "title": "Análise de infraestrutura atual",
  "type": "TASK",
  "assigneeId": "uuid",
  "plannedStart": "2026-07-01",
  "plannedEnd": "2026-07-15",
  "parentId": null
}
```

**Resposta (201).**

---

### PATCH /projects/:id/tasks/:taskId — Atualizar tarefa

**Payload:**
```json
{
  "status": "IN_PROGRESS",
  "completionPercentage": 40,
  "actualEnd": null
}
```

**Resposta (200).**

---

### POST /projects/:id/costs — Registrar custo de projeto

**Permissões:** Gerente do projeto, `FINANCIAL_ANALYST`, `IT_MANAGER+`

**Payload:**
```json
{
  "type": "SERVICE",
  "description": "Consultoria de arquitetura cloud",
  "amount": 15000.00,
  "incurredDate": "2026-07-20",
  "expenseId": "uuid"
}
```

**Resposta (201).**

---

## 25. Knowledge Base

**Base:** `/api/v1/knowledge`

---

### GET /knowledge — Listar artigos

**Permissões:** Pública (apenas PUBLISHED); `IT_TECHNICIAN+` (inclui DRAFT e DRAFT_AI)

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `q` | string | Busca full-text |
| `categoryId` | UUID | Por categoria |
| `tag` | string | Por tag (slug) |
| `audience` | enum | `END_USER`, `TECHNICAL`, `MANAGEMENT` |
| `status` | enum | `PUBLISHED`, `DRAFT`, `UNDER_REVIEW` |
| `aiGenerated` | boolean | Gerado pela IA |

**Resposta (200):** Lista com `id`, `slug`, `title`, `excerpt`, `category`, `audience`, `viewCount`, `rating`, `publishedAt`.

---

### GET /knowledge/:slug — Buscar artigo

**Permissões:** Pública para PUBLISHED

**Resposta (200):**
```json
{
  "data": {
    "id": "uuid",
    "title": "Como resolver falha de conexão VPN",
    "content": "# Como resolver...",
    "category": { "name": "Acesso e Segurança" },
    "tags": ["vpn", "conectividade", "acesso-remoto"],
    "audience": "TECHNICAL",
    "status": "PUBLISHED",
    "author": { "displayName": "Técnico TI" },
    "publishedAt": "2026-05-15T10:00:00Z",
    "viewCount": 247,
    "helpfulCount": 38,
    "notHelpfulCount": 5,
    "linkedTicket": { "id": "uuid", "number": "TKT-2026-000089" },
    "attachments": [],
    "versionNumber": 2
  }
}
```

---

### GET /knowledge/search — Busca inteligente

**Objetivo:** Busca semântica com full-text, ordenação por relevância e destaque do trecho.
**Permissões:** Pública

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `q` | string | Consulta de busca (obrigatório) |
| `audience` | enum | Filtrar por público |
| `categoryId` | UUID | Filtrar por categoria |

**Resposta (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Como resolver falha de conexão VPN",
      "excerpt": "...",
      "relevanceScore": 0.92,
      "highlight": "...reiniciar o **cliente VPN** e verificar o **certificado**...",
      "category": "Acesso e Segurança",
      "audience": "TECHNICAL"
    }
  ]
}
```

---

### POST /knowledge — Criar artigo

**Permissões:** `IT_TECHNICIAN+`

**Payload:**
```json
{
  "categoryId": "uuid",
  "title": "Como configurar MFA no Google Workspace",
  "content": "# Como configurar MFA...",
  "audience": "END_USER",
  "tags": ["mfa", "segurança", "google"]
}
```

**Resposta (201):** Artigo com status `DRAFT`.

---

### PATCH /knowledge/:id — Atualizar artigo

**Permissões:** Autor ou `IT_MANAGER+`

**Resposta (200):** Nova versão criada; versão anterior marcada como `is_current=false`.

---

### POST /knowledge/:id/submit-review — Submeter para revisão

**Permissões:** Autor do artigo

**Resposta (200):** Artigo com status `UNDER_REVIEW`.

---

### POST /knowledge/:id/publish — Publicar artigo

**Permissões:** `IT_MANAGER+`

**Resposta (200):** Artigo com status `PUBLISHED`.

---

### POST /knowledge/:id/deprecate — Deprecar artigo

**Permissões:** `IT_MANAGER+`

**Payload:**
```json
{ "reason": "Processo substituído por novo fluxo de VPN" }
```

**Resposta (200):** Artigo com status `DEPRECATED`.

---

### POST /knowledge/:id/feedback — Avaliar artigo

**Permissões:** Qualquer usuário autenticado

**Payload:**
```json
{
  "rating": "HELPFUL",
  "comment": "Resolveu o problema sem precisar chamar o suporte!",
  "ticketId": "uuid"
}
```

**Resposta (201).**

---

### GET /knowledge/categories — Listar categorias

**Resposta (200):** Hierarquia de categorias.

---

### GET /knowledge/tags — Listar tags

**Resposta (200):** Lista de tags com `id`, `name`, `slug`, `usageCount` ordenadas por uso.

---

## 26. Notifications

**Base:** `/api/v1/notifications`

---

### GET /notifications — Listar notificações

**Objetivo:** Retornar notificações do usuário autenticado.
**Permissões:** Qualquer usuário autenticado

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `status` | enum | `PENDING`, `READ`, `UNREAD` |
| `priority` | enum | `URGENT`, `HIGH`, `NORMAL`, `LOW` |
| `channel` | enum | `IN_APP`, `EMAIL` |

**Resposta (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Incidente atribuído a você",
      "body": "O incidente TKT-2026-000124 foi atribuído...",
      "priority": "HIGH",
      "status": "PENDING",
      "entityType": "Ticket",
      "entityId": "uuid",
      "actionUrl": "/incidents/uuid",
      "createdAt": "..."
    }
  ],
  "meta": {
    "unreadCount": 7,
    "pagination": { ... }
  }
}
```

---

### GET /notifications/unread-count — Contador de não lidas

**Objetivo:** Retornar apenas o número de notificações não lidas (para o badge da interface).
**Permissões:** Qualquer usuário autenticado

**Resposta (200):**
```json
{ "data": { "unreadCount": 7 } }
```

---

### PATCH /notifications/:id/read — Marcar como lida

**Permissões:** Destinatário da notificação

**Resposta (204).**

---

### POST /notifications/read-all — Marcar todas como lidas

**Permissões:** Qualquer usuário autenticado

**Resposta (204):** Todas as notificações `PENDING` do usuário marcadas como `READ`.

---

### DELETE /notifications/:id — Descartar notificação

**Permissões:** Destinatário da notificação

**Resposta (204).**

---

### GET /notifications/templates — Listar templates

**Permissões:** `IT_MANAGER+`

**Resposta (200):** Lista de templates com `eventType`, `channel`, `isActive`.

---

### PATCH /notifications/templates/:id — Atualizar template

**Permissões:** `IT_MANAGER+`

**Payload:**
```json
{
  "titleTemplate": "{{entityType}} {{action}}: {{entityNumber}}",
  "bodyTemplate": "O {{entityType}} {{entityNumber}} foi {{action}} por {{actor}}.",
  "isActive": true
}
```

---

## 27. Email Integration

**Base:** `/api/v1/email`

---

### GET /email/threads — Listar threads de e-mail

**Permissões:** `IT_TECHNICIAN+`

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `ticketId` | UUID | Threads vinculadas a um ticket |
| `status` | enum | `OPEN`, `CLOSED` |

**Resposta (200):** Lista de threads com `id`, `subject`, `participantEmails`, `messageCount`, `ticket`, `status`.

---

### GET /email/threads/:id/messages — Listar mensagens de uma thread

**Permissões:** `IT_TECHNICIAN+`

**Resposta (200):** Lista de mensagens com `id`, `direction`, `fromEmail`, `toEmails`, `subject`, `bodyText`, `status`, `sentAt`.

---

### GET /email/threads/:id — Buscar thread

**Resposta (200):** Dados da thread com `messages`.

---

## 28. Dashboard

**Base:** `/api/v1/dashboard`

---

### GET /dashboard/executive — Dashboard Executivo

**Objetivo:** KPIs estratégicos consolidados para alta direção.
**Permissões:** `EXECUTIVE`, `IT_MANAGER+`

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `period` | string | `current_month`, `last_month`, `current_quarter` |

**Resposta (200):**
```json
{
  "data": {
    "period": "2026-06",
    "slaGlobal": {
      "percentage": 96.8,
      "trend": "UP",
      "previousPeriod": 94.2,
      "totalTickets": 1247,
      "slaBreaches": 40
    },
    "serviceAvailability": {
      "percentage": 99.7,
      "criticalServicesCount": 8,
      "incidentsThisMonth": 23
    },
    "csat": {
      "average": 4.3,
      "responsesCount": 892,
      "trend": "STABLE"
    },
    "financialSummary": {
      "opexUtilizationPercent": 72.4,
      "capexUtilizationPercent": 45.1,
      "contractsExpiringSoon": 3
    },
    "complianceMaturity": {
      "overallPercentage": 83.5,
      "byFramework": [
        { "framework": "ISO_27001", "percentage": 86.2 },
        { "framework": "LGPD", "percentage": 91.0 }
      ],
      "openNonConformances": 7
    },
    "activeProjects": {
      "total": 12,
      "onTrack": 9,
      "delayed": 2,
      "completed": 1
    },
    "generatedAt": "2026-06-09T14:00:00Z"
  }
}
```

---

### GET /dashboard/operational — Dashboard Operacional

**Objetivo:** Visibilidade operacional para técnicos e gestores de TI.
**Permissões:** `IT_TECHNICIAN+`

**Resposta (200):**
```json
{
  "data": {
    "openTickets": {
      "total": 87,
      "byPriority": { "critical": 3, "high": 12, "medium": 45, "low": 27 },
      "slaAtRisk": 8,
      "unassigned": 5
    },
    "myQueue": {
      "total": 7,
      "slaAtRisk": 2
    },
    "recentActivity": [...],
    "assetsUnderMaintenance": 4,
    "warrantyExpiringSoon": 12,
    "accessReviewsPending": 3,
    "pendingApprovals": 6,
    "generatedAt": "..."
  }
}
```

---

### GET /dashboard/compliance — Dashboard de Compliance

**Permissões:** `COMPLIANCE_OFFICER`, `AUDITOR`, `IT_MANAGER+`

**Resposta (200):** Maturidade por framework, NCs abertas, próximas auditorias, progresso de planos de ação.

---

### GET /dashboard/financial — Dashboard Financeiro

**Permissões:** `FINANCIAL_ANALYST`, `IT_MANAGER+`

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `fiscalYear` | integer | Ano fiscal |

**Resposta (200):** OPEX e CAPEX realizados vs. orçado por mês, contratos a vencer, top despesas, variância por centro de custo.

---

### GET /dashboard/kpis — Listar KPIs

**Permissões:** `IT_MANAGER+`

**Resposta (200):** Lista de KPIs configurados com `code`, `name`, `currentValue`, `targetValue`, `trend`, `unit`.

---

### GET /dashboard/kpis/:code/history — Histórico de KPI

**Objetivo:** Histórico de valores de um KPI para análise de tendência.
**Permissões:** `IT_MANAGER+`

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `granularity` | enum | `DAILY`, `WEEKLY`, `MONTHLY` |
| `from` | date | Data inicial |
| `to` | date | Data final |

**Resposta (200):**
```json
{
  "data": {
    "kpi": { "code": "SLA_GLOBAL_PCT", "name": "SLA Global", "unit": "%" },
    "history": [
      { "period": "2026-05-01", "value": 94.2, "target": 95.0 },
      { "period": "2026-06-01", "value": 96.8, "target": 95.0 }
    ]
  }
}
```

---

## 29. Reports

**Base:** `/api/v1/reports`

---

### POST /reports/generate — Solicitar geração de relatório

**Objetivo:** Iniciar a geração assíncrona de um relatório exportável.
**Permissões:** Varia por tipo de relatório (ver tabela)

**Payload:**
```json
{
  "type": "SLA_PERFORMANCE",
  "format": "PDF",
  "filters": {
    "period": { "start": "2026-06-01", "end": "2026-06-30" },
    "categoryId": null,
    "priority": null
  }
}
```

**Tipos disponíveis:**

| Tipo | Permissão Mínima | Descrição |
|------|:----------------:|-----------|
| `SLA_PERFORMANCE` | `IT_MANAGER` | Desempenho de SLA por período |
| `INCIDENT_SUMMARY` | `IT_MANAGER` | Resumo de incidentes por período |
| `ASSET_INVENTORY` | `IT_TECHNICIAN` | Inventário completo de ativos |
| `LICENSE_COMPLIANCE` | `IT_TECHNICIAN` | Conformidade de licenças |
| `COMPLIANCE_MATURITY` | `COMPLIANCE_OFFICER` | Maturidade por framework |
| `FINANCIAL_SUMMARY` | `FINANCIAL_ANALYST` | Resumo financeiro OPEX/CAPEX |
| `ACCESS_REVIEW_HISTORY` | `IT_MANAGER` | Histórico de revisões de acesso |
| `PROJECT_PORTFOLIO` | `IT_MANAGER` | Portfólio de projetos |

**Resposta (202):**
```json
{
  "data": {
    "jobId": "uuid",
    "status": "QUEUED",
    "estimatedDuration": "45s"
  }
}
```

---

### GET /reports/jobs/:jobId — Consultar status do relatório

**Objetivo:** Verificar o progresso de geração de um relatório.
**Permissões:** Solicitante do relatório ou `IT_MANAGER+`

**Resposta (200):**
```json
{
  "data": {
    "jobId": "uuid",
    "status": "COMPLETED",
    "type": "SLA_PERFORMANCE",
    "format": "PDF",
    "downloadUrl": "https://... (URL assinada, expira em 1h)",
    "fileSizeBytes": 245678,
    "generatedAt": "2026-06-09T14:05:30Z",
    "expiresAt": "2026-06-09T15:05:30Z"
  }
}
```

`status`: `QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED`

---

### GET /reports/history — Histórico de relatórios gerados

**Permissões:** Usuário autenticado (apenas próprios) ou `IT_MANAGER+` (todos)

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `type` | enum | Tipo de relatório |
| `status` | enum | Status do job |
| `page`, `perPage` | — | Paginação |

**Resposta (200):** Lista com `jobId`, `type`, `format`, `status`, `generatedAt`, `downloadAvailable`.

---

## 30. Audit

**Base:** `/api/v1/audit`

---

### GET /audit/logs — Consultar logs de auditoria

**Objetivo:** Consultar a trilha de auditoria do sistema com filtros avançados.
**Permissões:** `AUDITOR`, `SUPER_ADMIN`

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `userId` | UUID | Filtrar por usuário |
| `action` | enum | `CREATE`, `UPDATE`, `DELETE`, `ACCESS`, `LOGIN`, `EXPORT` |
| `module` | string | Módulo do sistema |
| `entityType` | string | Tipo da entidade |
| `entityId` | UUID | ID específico de entidade |
| `occurredAt[gte]` | datetime | Período — início |
| `occurredAt[lte]` | datetime | Período — fim |
| `ipAddress` | string | Filtrar por IP |
| `page`, `perPage`, `sort` | — | Paginação |

**Resposta (200):**
```json
{
  "data": [
    {
      "id": "uuid-v7",
      "userId": "uuid",
      "userRole": "IT_MANAGER",
      "action": "UPDATE",
      "module": "incident",
      "entityType": "Incident",
      "entityId": "uuid",
      "oldValues": { "status": "OPEN" },
      "newValues": { "status": "IN_PROGRESS" },
      "ipAddress": "189.x.x.x",
      "requestId": "uuid",
      "occurredAt": "2026-06-09T14:00:00Z"
    }
  ]
}
```

---

### GET /audit/logs/:id — Buscar log específico

**Permissões:** `AUDITOR`, `SUPER_ADMIN`

**Resposta (200):** Log completo com `oldValues`, `newValues`, `metadata`.

---

### POST /audit/logs/export — Exportar logs de auditoria

**Objetivo:** Exportar trilha de auditoria filtrada para PDF, CSV ou JSON.
**Permissões:** `AUDITOR`, `SUPER_ADMIN`

**Payload:**
```json
{
  "format": "CSV",
  "filters": {
    "module": "identity",
    "action": ["CREATE", "UPDATE", "DELETE"],
    "occurredAt": {
      "gte": "2026-06-01T00:00:00Z",
      "lte": "2026-06-30T23:59:59Z"
    }
  }
}
```

**Resposta (202):** Job de exportação criado. Mesmo padrão de `/reports/generate`.

**Nota de segurança:** Esta operação gera registro de auditoria com `action=EXPORT` para o próprio solicitante.

---

### GET /audit/security-events — Eventos de segurança

**Objetivo:** Consultar eventos de segurança específicos (logins, falhas de auth, acessos negados).
**Permissões:** `SUPER_ADMIN`

**Query Parameters:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `action` | enum | `LOGIN`, `FAILED_LOGIN`, `LOGOUT`, `REVOKE` |
| `userId` | UUID | Filtrar por usuário |
| `ipAddress` | string | Filtrar por IP |
| `occurredAt[gte]` | datetime | Período |

**Resposta (200):** Lista de eventos de segurança com metadados de dispositivo e localização.

---

### GET /audit/entity-history/:entityType/:entityId — Histórico de entidade

**Objetivo:** Retornar toda a trilha de auditoria de uma entidade específica.
**Permissões:** `IT_MANAGER+` (com acesso ao módulo da entidade)

**Resposta (200):** Todos os logs da entidade em ordem cronológica, com `diff` calculado entre versões.

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição da Alteração |
|--------|------|-------|------------------------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação do documento com 24 módulos de API |

---

> **Próximos documentos recomendados:**
> [`20_DATABASE.md`](./20_DATABASE.md) — Modelo de dados que fundamenta esta especificação
> [`12_ARCHITECTURE.md`](./12_ARCHITECTURE.md) — Arquitetura técnica dos módulos
> [`14_SECURITY_REQUIREMENTS.md`](./14_SECURITY_REQUIREMENTS.md) — Requisitos de segurança aplicados a cada endpoint
