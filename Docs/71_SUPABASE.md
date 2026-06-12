# SGTI — Sistema de Gestão de Tecnologia da Informação
## Arquitetura Supabase — Documentação Técnica e Arquitetural

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [70_DEPLOYMENT.md](./70_DEPLOYMENT.md) · [22_AUTHENTICATION.md](./22_AUTHENTICATION.md) · [20_DATABASE.md](./20_DATABASE.md) · [50_INTEGRATIONS.md](./50_INTEGRATIONS.md)

---

## Sobre este Documento

Este documento define a **arquitetura oficial do Supabase no SGTI**, cobrindo todos os serviços utilizados: Auth, PostgreSQL, Storage, Realtime e Edge Functions — incluindo estratégias de segurança, custos, limitações do plano gratuito e estratégia de crescimento.

**Premissa obrigatória:** Utilizar exclusivamente recursos nativos do Supabase sempre que possível, minimizando dependências externas e maximizando o uso do free tier.

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura](#2-arquitetura)
3. [Auth — Autenticação e Autorização](#3-auth--autenticação-e-autorização)
4. [Database — PostgreSQL](#4-database--postgresql)
5. [Storage — Armazenamento de Arquivos](#5-storage--armazenamento-de-arquivos)
6. [Realtime — Atualizações em Tempo Real](#6-realtime--atualizações-em-tempo-real)
7. [Edge Functions](#7-edge-functions)
8. [Segurança](#8-segurança)
9. [Auditoria](#9-auditoria)
10. [Monitoramento](#10-monitoramento)
11. [Custos](#11-custos)
12. [Limitações do Plano Gratuito](#12-limitações-do-plano-gratuito)
13. [Estratégia de Crescimento](#13-estratégia-de-crescimento)
14. [Critérios de Aceitação](#14-critérios-de-aceitação)

---

## 1. Visão Geral

### 1.1 O Papel do Supabase no SGTI

O Supabase é o **backend-as-a-service central** do SGTI, provendo banco de dados relacional, autenticação, armazenamento de arquivos, comunicação em tempo real e funções serverless. Ele funciona como a camada de persistência e infraestrutura que sustenta toda a plataforma.

| Serviço Supabase | Papel no SGTI |
|:----------------:|:-------------|
| **Auth** | Gerenciamento de sessões e tokens (OAuth 2.0 com Google) |
| **PostgreSQL** | Banco de dados principal com todos os schemas do sistema |
| **Row Level Security (RLS)** | Isolamento de tenants e controle de acesso por dado |
| **Storage** | Armazenamento de evidências, anexos, documentos e arquivos KB |
| **Realtime** | Atualizações ao vivo em dashboards operacionais e notificações |
| **Edge Functions** | Jobs periódicos, webhooks e integrações externas |

### 1.2 Projetos Supabase por Ambiente

| Ambiente | Nome do Projeto | Banco | Dados |
|:--------:|:---------------:|:-----:|:-----:|
| **Desenvolvimento** | `sgti-dev` | PostgreSQL isolado | Dados fictícios |
| **Homologação** | `sgti-staging` | PostgreSQL isolado | Cópia anonimizada |
| **Produção** | `sgti-prod` | PostgreSQL isolado | Dados reais |

Cada projeto Supabase é completamente isolado dos demais: banco, autenticação, storage, edge functions e configurações são independentes.

---

## 2. Arquitetura

### 2.1 Diagrama de Arquitetura Geral

```
ARQUITETURA SUPABASE NO SGTI

┌─────────────────────────────────────────────────────────────────────┐
│                     BROWSER / CLIENTE                                │
│  Next.js 14 (App Router + Client Components + Server Components)     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE                                    │
│              DNS · CDN · WAF · DDoS · TLS · HSTS                    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
         ┌─────────────────────┼──────────────────────┐
         │                     │                      │
         ▼                     ▼                      ▼
┌─────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
│  VERCEL EDGE    │  │  SUPABASE AUTH   │  │  SUPABASE STORAGE    │
│  Next.js App    │  │  Google OAuth    │  │  Buckets (RLS)       │
│  API Routes     │◄─┤  Sessions/JWT    │  │  Presigned URLs      │
│  (Serverless)   │  │  Refresh Tokens  │  │  AES-256             │
└────────┬────────┘  └────────┬─────────┘  └──────────────────────┘
         │                    │
         │                    ▼
         │          ┌──────────────────────────────────────────┐
         └─────────►│         SUPABASE POSTGRESQL              │
                    │   12 Schemas · RLS por tenant            │
                    │   Row Level Security · Full-text Search  │
                    │   Triggers · Functions · Extensions      │
                    └──────────────────┬───────────────────────┘
                                       │
                    ┌──────────────────┼──────────────────────┐
                    │                  │                      │
                    ▼                  ▼                      ▼
          ┌──────────────────┐ ┌────────────────┐ ┌──────────────────┐
          │ SUPABASE REALTIME│ │  SUPABASE EDGE │ │  SUPABASE STUDIO │
          │  Subscriptions   │ │   FUNCTIONS    │ │  Dashboard Admin │
          │  Broadcast       │ │  Deno Runtime  │ │  (Interno)       │
          │  Presence        │ │  Cron Jobs     │ └──────────────────┘
          └──────────────────┘ │  Webhooks      │
                               └────────────────┘
```

### 2.2 Fluxo de uma Requisição Típica

```
FLUXO COMPLETO: CARREGAR DASHBOARD DE INCIDENTES

1. Usuário navega para /dashboard/incidents
2. Next.js Server Component executa no servidor Vercel
3. Verifica JWT do usuário (cookie HttpOnly)
4. Cria cliente Supabase com Service Role Key (server-side)
5. Executa query com filtro tenant_id (RLS complementar)
6. Supabase PostgreSQL retorna dados
7. Server Component renderiza HTML com dados
8. HTML enviado ao browser (Server-Side Rendering)
9. React Hydration ativa componentes interativos
10. Supabase Realtime estabelece WebSocket para atualizações ao vivo
11. Mudanças no banco propagadas ao browser em ≤ 5 segundos
```

---

## 3. Auth — Autenticação e Autorização

### 3.1 Supabase Auth como Gerenciador de Sessões

O Supabase Auth é responsável por:
- **Gerenciar sessões** dos usuários após autenticação OAuth com Google.
- **Emitir e renovar tokens JWT** para as requisições ao banco.
- **Armazenar refresh tokens** de forma segura.
- **Expor a tabela `auth.users`** com os dados básicos de identidade.

O Supabase Auth **não** gerencia o RBAC do SGTI (papéis e permissões são gerenciados pela tabela `auth.UserRole` no schema do SGTI, não pelo Supabase Auth diretamente).

### 3.2 Google OAuth via Supabase Auth

```
FLUXO OAUTH GOOGLE COM SUPABASE AUTH

1. Usuário clica "Entrar com Google" no Next.js
2. Frontend chama supabase.auth.signInWithOAuth({ provider: 'google' })
3. Supabase redireciona para Google OAuth
   - Parâmetro hd={dominio_corporativo} para restringir ao domínio
4. Google autentica o usuário
5. Google redireciona para: {SUPABASE_URL}/auth/v1/callback
6. Supabase troca authorization_code por tokens Google
7. Supabase cria/atualiza entrada em auth.users
8. Supabase emite: access_token (JWT, 1h) + refresh_token (30 dias)
9. Tokens armazenados em cookie HttpOnly no browser
10. Next.js Server Component valida access_token nas requisições

CONFIGURAÇÃO NO SUPABASE DASHBOARD:
  Authentication → Providers → Google
    Client ID: {GOOGLE_CLIENT_ID}
    Client Secret: {GOOGLE_CLIENT_SECRET}
    Redirect URL: https://[ref].supabase.co/auth/v1/callback
```

### 3.3 Configuração de Domínio Restrito

Para restringir o login exclusivamente ao domínio corporativo, o SGTI usa:

1. **Supabase Auth Hook (Hook de Login):** Edge Function `auth-hook-restrict-domain` é registrada como hook de autenticação. Ao receber login, verifica se `email` termina com `@{dominio_corporativo}`. Se não, rejeita o login com erro customizado.

2. **hd parameter:** Passado via `queryParams` no `signInWithOAuth` para indicar ao Google que deve restringir contas do domínio.

3. **Validação no Server Component:** O middleware Next.js valida o claim `email` do JWT e verifica o domínio antes de renderizar qualquer página protegida.

### 3.4 JWT do Supabase

O Supabase emite JWTs assinados com a chave `JWT_SECRET` do projeto:

```
JWT PAYLOAD (Supabase Auth)
{
  "sub": "uuid-do-usuário",           ← ID único do auth.users
  "email": "user@empresa.com.br",
  "role": "authenticated",            ← Role padrão do Supabase
  "aud": "authenticated",
  "iat": 1749474000,
  "exp": 1749477600,                  ← 1 hora
  "iss": "https://[ref].supabase.co/auth/v1"
}
```

**Importante:** O JWT do Supabase Auth é diferente do JWT RS256 do SGTI (descrito em `22_AUTHENTICATION.md`). O JWT do Supabase é usado internamente para comunicação com o banco via RLS. O JWT RS256 do SGTI é emitido após o login e carrega os claims de negócio (tenant_id, roles).

### 3.5 Sessões e Refresh Tokens

| Atributo | Valor |
|:--------:|-------|
| **Access Token (JWT)** | Validade: 1 hora |
| **Refresh Token** | Validade: 30 dias (rotaciona a cada uso) |
| **Armazenamento** | Cookie HttpOnly, Secure, SameSite=Lax |
| **Renovação** | Automática pelo `@supabase/ssr` ao detectar expiração |
| **Revogação** | `supabase.auth.signOut()` invalida todos os tokens da sessão |
| **Sessões simultâneas** | Múltiplas sessões por usuário permitidas (configurável) |

### 3.6 RBAC no Supabase

O controle de acesso baseado em papéis (RBAC) no SGTI **não usa as roles nativas do Supabase** (que são apenas `anon` e `authenticated`). O RBAC do SGTI é implementado via:

1. **Tabela `auth.UserRole`** no banco do SGTI: armazena os papéis atribuídos a cada usuário.
2. **RLS Policies** que verificam o `auth.uid()` e consultam `auth.UserRole` para autorizar operações.
3. **Middleware Next.js** que valida os papéis nos Server Components antes de renderizar.

```
EXEMPLO DE RLS COM RBAC SGTI

Policy: "Técnicos veem apenas seus próprios chamados"
USING (
  assignee_id = auth.uid()::uuid
  OR
  EXISTS (
    SELECT 1 FROM auth.UserRole ur
    WHERE ur.user_id = auth.uid()::uuid
    AND ur.role_code IN ('IT_SPECIALIST', 'IT_MANAGER', 'SUPER_ADMIN')
    AND ur.is_active = true
  )
)
```

### 3.7 Configurações de Auth no Supabase

| Configuração | Valor |
|:------------:|-------|
| Email provider | Desabilitado (apenas Google OAuth) |
| Magic Links | Desabilitados (somente onboarding inicial) |
| Phone provider | Desabilitado |
| Session expiry | 1 hora (access token) |
| Refresh token rotation | Habilitado |
| Leaked password check | N/A (sem senha local) |
| Rate limiting (sign-in) | 5 tentativas por minuto por IP |
| Allowed redirect URLs | Domínios cadastrados por ambiente |
| Custom SMTP | Habilitado (implantacao@pinpag.com.br) |

---

## 4. Database — PostgreSQL

### 4.1 Visão Geral do Banco

O Supabase usa **PostgreSQL 15+** com extensões como `pgcrypto`, `uuid-ossp`, `pg_trgm` (full-text search) e `postgis` (se necessário no futuro). O banco é o coração do SGTI e contém todos os dados operacionais.

### 4.2 Schemas do SGTI

O banco está organizado em 12 schemas para separação lógica de domínios:

| Schema | Conteúdo |
|:------:|---------|
| `auth` | Usuários, papéis, sessões (extende `auth.users` do Supabase) |
| `identity` | Identidades corporativas, grupos Google, referências de sync |
| `shared` | `audit_log`, notificações, file_references, email_log |
| `catalog` | Catálogo de serviços, políticas de SLA, categorias |
| `ticket` | Incidentes, requisições, comentários, histórico de SLA |
| `asset` | Ativos, movimentações, licenças, referências GLPI |
| `compliance` | Auditorias, apontamentos, evidências, planos de ação |
| `finance` | OPEX, CAPEX, orçamentos, contratos, fornecedores |
| `purchase` | Solicitações de compra, pedidos, cotações |
| `project` | Projetos, tarefas, riscos, lições aprendidas |
| `knowledge` | Artigos KB, versões, threads de e-mail |
| `analytics` | KPIs pré-calculados, aggregations, dashboards data |

### 4.3 Estratégia de Acesso ao Banco

| Contexto | Cliente Supabase | Nível de Acesso |
|:--------:|:----------------:|:---------------:|
| Server Components (Next.js) | Service Role Key | Acesso total (contorna RLS) — usar com cuidado |
| API Routes autenticadas | Service Role Key + filtro manual tenant_id | Acesso total com validação manual |
| Client Components | Anon Key + JWT do usuário | Apenas acesso autorizado via RLS |
| Edge Functions | Service Role Key | Acesso total |

**Regra:** Server Components e API Routes que usam Service Role Key são responsáveis por incluir explicitamente o filtro `tenant_id` nas queries, pois a Service Role Key contorna o RLS.

### 4.4 Row Level Security (RLS)

Toda tabela crítica do SGTI tem RLS habilitado. As políticas garantem:

| Política | Aplicação |
|:--------:|-----------|
| **Isolamento de Tenant** | `tenant_id = auth.uid()` via função helper |
| **Visibilidade por Papel** | Verifica `auth.UserRole` antes de permitir SELECT |
| **Audit Log INSERT-ONLY** | Bloqueia UPDATE e DELETE na tabela `shared.audit_log` |
| **Storage por Owner** | Arquivos acessíveis apenas pelo uploader ou IT_MANAGER+ |

```
POLÍTICA DE TENANT ISOLATION (padrão para todas as tabelas)

CREATE POLICY "tenant_isolation" ON {schema}.{table}
  USING (tenant_id = get_current_tenant_id());

FUNÇÃO HELPER:
CREATE FUNCTION get_current_tenant_id()
RETURNS uuid AS $$
  SELECT (auth.jwt() ->> 'tenant_id')::uuid;
$$ LANGUAGE sql STABLE;
```

### 4.5 Prisma como Query Builder

O SGTI usa **Prisma ORM** para interagir com o banco a partir dos Server Components e API Routes:

| Função | Ferramenta |
|:------:|:----------:|
| **Schema definition** | `prisma/schema.prisma` (fonte de verdade dos tipos TypeScript) |
| **Query building** | Prisma Client (type-safe queries) |
| **Migrations** | **Supabase CLI** (não Prisma Migrate — ver nota abaixo) |
| **Type generation** | `prisma generate` gera tipos TypeScript a partir do schema |

**Nota importante:** O SGTI usa o **Supabase CLI para migrations** (não `prisma migrate`), pois as migrations do Supabase suportam políticas RLS, triggers, funções e extensões que o Prisma Migrate não gerencia nativamente. O Prisma é usado apenas como query builder e para geração de tipos.

```
FLUXO DE DESENVOLVIMENTO COM PRISMA + SUPABASE

Mudança no banco:
1. Escrever migration SQL manualmente em supabase/migrations/
2. Aplicar localmente: supabase db push
3. Atualizar prisma/schema.prisma para refletir a mudança
4. Executar: prisma generate (atualiza tipos TypeScript)
5. Usar Prisma Client nas queries com os novos tipos
```

### 4.6 Migrations

Toda mudança de esquema é gerenciada via arquivos SQL versionados:

```
ESTRUTURA DE MIGRATIONS

supabase/
  migrations/
    20260101000000_initial_schema.sql
    20260201000000_add_sla_policies.sql
    20260609142300_add_glpi_divergence_table.sql
  seed.sql        ← Dados iniciais do sistema (categorias, normas, etc.)
  config.toml     ← Configuração do projeto Supabase local
```

**Regras de migration (complementares ao 70_DEPLOYMENT.md):**
- Uma mudança lógica por arquivo.
- Nunca editar migration já aplicada.
- Migrations devem ser reversíveis quando possível.
- DDL destrutivo (DROP) em migration separada, após confirmar que não há referências.

### 4.7 Backup e Recuperação

| Tipo | Frequência | Retenção | Como Restaurar |
|:----:|:----------:|:--------:|:--------------:|
| **Backup automático Supabase** | Diário | 7 dias (free tier) / 30 dias (Pro) | Supabase Dashboard → Backups → Restore |
| **Point-in-Time Recovery (PITR)** | Contínuo | Disponível no plano Pro+ | Supabase Dashboard → PITR |
| **Export manual (pg_dump)** | Mensal (1º dia útil) | 12 meses | `pg_restore` no banco de destino |
| **Backup pré-migration** | Antes de cada major migration | 30 dias | Manual |

**Free tier:** Apenas backup diário com retenção de 7 dias. Para maior segurança, o IT_MANAGER realiza export manual mensal via `pg_dump` e armazena em local seguro.

### 4.8 Extensions PostgreSQL Utilizadas

| Extension | Propósito |
|:---------:|:----------:|
| `uuid-ossp` | Geração de UUIDs v4 (`uuid_generate_v4()`) |
| `pgcrypto` | Criptografia (`crypt()`, `gen_salt()`, hashing) |
| `pg_trgm` | Full-text search fuzzy para busca na KB e chamados |
| `btree_gist` | Índices GiST para range queries e overlap checks |
| `moddatetime` | Atualização automática de `updated_at` via trigger |

---

## 5. Storage — Armazenamento de Arquivos

### 5.1 Buckets por Domínio de Negócio

O Supabase Storage é organizado em buckets separados por domínio, cada um com suas próprias políticas de acesso:

| Bucket | Conteúdo | Público? | Tamanho Máximo | Tipos Aceitos |
|:------:|---------|:--------:|:--------------:|:-------------:|
| `evidences` | Evidências de compliance | ❌ Privado | 50 MB/arquivo | PDF, DOCX, XLSX, PNG, JPG |
| `attachments` | Anexos de chamados | ❌ Privado | 50 MB/arquivo | PDF, DOCX, XLSX, PNG, JPG, ZIP |
| `invoices` | Notas fiscais | ❌ Privado | 50 MB/arquivo | PDF |
| `articles` | Imagens e anexos de artigos KB | ✅ Público (leitura) | 20 MB/arquivo | PNG, JPG, WEBP, GIF |
| `project-docs` | Documentos de projetos | ❌ Privado | 100 MB/arquivo | PDF, DOCX, XLSX, ZIP |
| `exports` | Relatórios exportados | ❌ Privado | 100 MB/arquivo | PDF, XLSX, CSV |

### 5.2 Políticas RLS por Bucket

**Bucket `evidences` (compliance):**
```
SELECT: compliance_officer.tenant = evidence.tenant AND user_id = uploader
        OR role IN (IT_MANAGER, AUDITOR, SUPER_ADMIN)
INSERT: role IN (IT_SPECIALIST, COMPLIANCE_OFFICER, IT_MANAGER+)
UPDATE: Somente quem fez upload E status = PENDING
DELETE: IT_MANAGER+ apenas
```

**Bucket `attachments` (chamados):**
```
SELECT: ticket.requester_id = user_id
        OR ticket.assignee_id = user_id
        OR role IN (IT_TECHNICIAN, IT_SPECIALIST, IT_MANAGER+)
INSERT: qualquer usuário autenticado (ao abrir chamado)
DELETE: IT_MANAGER+ apenas
```

**Bucket `articles` (KB):**
```
SELECT (imagens): Público — sem autenticação necessária
        (outros arquivos): role IN (IT_TECHNICIAN+)
INSERT: role IN (IT_TECHNICIAN, IT_SPECIALIST, IT_MANAGER+)
DELETE: IT_MANAGER+
```

### 5.3 Armazenamento de Evidências de Compliance

```
EVIDÊNCIA DE COMPLIANCE — CICLO DE VIDA NO STORAGE

1. Analista faz upload de evidência (PDF, screenshot, etc.)
2. Storage Path: evidences/{tenant_id}/{audit_id}/{finding_id}/{uuid}_{filename}
3. Supabase Storage armazena com criptografia AES-256
4. SGTI registra FileReference no banco:
   { storage_path, filename, size, mime_type, sha256_hash, uploaded_by, uploaded_at }
5. Hash SHA-256 calculado do arquivo e armazenado para verificação de integridade
6. URL de acesso: presigned URL com validade de 15 minutos (gerada sob demanda)
7. Ao exportar pacote de auditoria: hash SHA-256 incluído no relatório CMP-RPT-011
```

### 5.4 Anexos de Chamados

```
ANEXO DE CHAMADO — CICLO DE VIDA

1. Usuário anexa arquivo ao abrir ou comentar em chamado
2. Validação: tipo de arquivo aceito + tamanho máximo
3. Storage Path: attachments/{tenant_id}/{ticket_id}/{uuid}_{filename}
4. FileReference criada no banco com metadados
5. Acesso: Presigned URL de 1 hora (gerada pelo API Route)
6. Expiração do arquivo: 2 anos após fechamento do chamado
   (controlado por job mensal de cleanup)
```

### 5.5 Documentos de Projetos

```
DOCUMENTOS DE PROJETO — ESTRUTURA

Storage Path: project-docs/{tenant_id}/{project_id}/{categoria}/{uuid}_{filename}

Categorias:
  - charter/        ← Termo de abertura, business case
  - scope/          ← Declarações de escopo, WBS
  - planning/       ← Cronograma, plano de riscos
  - deliverables/   ← Entregas do projeto
  - closure/        ← Relatório de encerramento, lições
```

### 5.6 Arquivos da Base de Conhecimento

```
ARQUIVOS DA KB — ESTRUTURA

Imagens de artigos:
  articles/{tenant_id}/{article_id}/images/{uuid}_{filename}

Anexos técnicos:
  articles/{tenant_id}/{article_id}/attachments/{uuid}_{filename}

Acesso a imagens: Público (URL direta do Supabase CDN)
Acesso a anexos: Presigned URL de 1 hora para autenticados
```

### 5.7 Presigned URLs

O SGTI não expõe URLs diretas de Storage ao cliente. Todo acesso a arquivos privados usa Presigned URLs geradas pelo servidor:

| Bucket | Validade da Presigned URL | Gerada por |
|:------:|:-------------------------:|:----------:|
| `evidences` | 15 minutos | API Route autenticado + verificação de papel |
| `attachments` | 1 hora | API Route autenticado + verificação de dono |
| `invoices` | 15 minutos | API Route + papel FINANCIAL_ANALYST |
| `project-docs` | 1 hora | API Route + membro do projeto |
| `exports` | 1 hora | API Route + quem gerou o relatório |

---

## 6. Realtime — Atualizações em Tempo Real

### 6.1 Como Funciona o Supabase Realtime

O Supabase Realtime usa **WebSockets** para propagar mudanças de dados do PostgreSQL para os clientes conectados. Funciona via **Publication** do PostgreSQL (logical replication) + servidor Realtime que distribui eventos.

```
FLUXO REALTIME

1. Usuário abre dashboard no browser
2. Cliente Supabase estabelece WebSocket: wss://[ref].supabase.co/realtime/v1
3. Cliente assina channel específico: supabase.channel('incidents')
4. Analista atualiza status de incidente (outro navegador ou servidor)
5. PostgreSQL registra a mudança
6. Supabase Realtime detecta via WAL (Write-Ahead Log)
7. Evento publicado para todos os subscribers do channel
8. Browser atualiza o estado React sem F5
```

### 6.2 Notificações em Tempo Real

**Implementação:** Supabase Realtime + tabela `shared.notification` com RLS por usuário.

```
FLUXO DE NOTIFICAÇÃO IN-APP

1. Evento de negócio ocorre (ex.: incidente atribuído ao técnico)
2. Trigger ou Edge Function insere em shared.notification:
   { user_id, type, title, body, link, read=false, created_at }
3. Supabase Realtime detecta INSERT na tabela
4. Publica evento para channel: notification:{user_id}
5. Browser do técnico recebe o evento via WebSocket
6. Badge de notificação atualizado (contador + 1)
7. Toast notification exibida se o usuário está na aplicação
```

**Channel de notificação por usuário:**
```javascript
// Assina canal de notificações do usuário logado
supabase.channel(`notification:${userId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'shared',
    table: 'notification',
    filter: `user_id=eq.${userId}`
  }, (payload) => handleNewNotification(payload))
  .subscribe()
```

### 6.3 Atualização de Dashboards

**Implementação:** Supabase Realtime assina mudanças em tabelas operacionais críticas.

| Dashboard | Tabela Monitorada | Evento | Latência |
|:---------:|:-----------------:|:------:|:--------:|
| Operacional (Incidentes) | `ticket.Ticket` | INSERT, UPDATE | ≤ 5s |
| Operacional (Fila) | `ticket.Ticket` | status changes | ≤ 5s |
| SLA (countdowns) | `ticket.SLAHistory` | UPDATE | ≤ 5s |
| Integrações | `shared.integration_status` | UPDATE | ≤ 30s |
| Projetos | `project.ProjectTask` | UPDATE | ≤ 5s |

**Fallback:** Se o WebSocket cair, o cliente faz polling a cada 30 segundos automaticamente via `useEffect` com `setInterval`.

### 6.4 Atualização de Chamados

Ao abrir um chamado específico, o técnico recebe atualizações em tempo real:
- Novos comentários adicionados por outros.
- Mudanças de status.
- Atribuição alterada.
- Atualização do SLA (countdown ao vivo).

```javascript
// Channel por chamado individual
supabase.channel(`ticket:${ticketId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'ticket',
    table: 'TicketComment',
    filter: `ticket_id=eq.${ticketId}`
  }, handleNewComment)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'ticket',
    table: 'Ticket',
    filter: `id=eq.${ticketId}`
  }, handleTicketUpdate)
  .subscribe()
```

### 6.5 Limitações do Realtime no Free Tier

| Limitação | Free Tier | Pro |
|:----------:|:---------:|:---:|
| Conexões simultâneas | 200 | 500+ |
| Mensagens/segundo | 100 msg/s | 1000 msg/s |
| Canais simultâneos | Sem limite documentado | Sem limite |
| Broadcast payload | 256 KB | 256 KB |

**Estratégia para economizar conexões:**
- Técnicos que não estão no dashboard não mantêm WebSocket ativo.
- Conexão WebSocket iniciada apenas quando o usuário está na página.
- Cleanup automático ao navegar para outra página (`useEffect` cleanup).

---

## 7. Edge Functions

### 7.1 Runtime e Configuração

Supabase Edge Functions rodam em **Deno** (não Node.js) em múltiplas regiões da edge. São funções serverless ideais para processamento próximo ao banco.

| Característica | Valor |
|:--------------:|:-----:|
| **Runtime** | Deno (TypeScript nativo) |
| **Timeout** | 2 segundos (free tier) / 60 segundos (Pro) |
| **Memória** | 150 MB por invocação |
| **Deploy** | Via `supabase functions deploy` ou CI/CD |
| **Variáveis** | Via `supabase secrets set` (armazenadas criptografadas) |

**Limitação crítica no free tier:** Timeout de apenas 2 segundos para funções invocadas via HTTP. Para jobs longos, usar Cron com lógica de chunking.

### 7.2 Catálogo de Edge Functions do SGTI

| Função | Gatilho | Timeout Necessário | Propósito |
|:------:|:-------:|:-----------------:|:---------:|
| `gmail-webhook` | HTTP POST (Gmail Pub/Sub) | < 2s (apenas enfileirar) | Recebe notificação de e-mail e enfileira para processamento |
| `send-notification` | HTTP POST (interno) | < 2s | Envia e-mail via SMTP |
| `sla-monitor` | Cron (cada 5 min) | < 60s | Verifica SLAs violados e próximos do vencimento |
| `google-user-sync` | Cron (diário 02h00) | < 60s | Sincroniza usuários do Google Workspace |
| `glpi-inventory-sync` | Cron (diário 02h00) | < 60s | Importa inventário do GLPI |
| `glpi-status-sync` | Cron (cada 5 min) | < 30s | Verifica status de tickets no GLPI |
| `google-watch-renew` | Cron (diário 23h00) | < 10s | Renova watch do Gmail API |
| `kb-draft-generator` | Database Webhook (IncidentResolved) | < 5s | Cria rascunho KB a partir da resolução |
| `auth-hook-domain` | Supabase Auth Hook | < 2s | Restringe login ao domínio corporativo |
| `depreciation-job` | Cron (1º dia do mês) | < 60s | Calcula depreciação mensal dos ativos |
| `nightly-kpis` | Cron (diário 01h00) | < 60s | Pré-calcula KPIs para dashboards executivos |

### 7.3 Padrão de Edge Function — Webhook Externo

Para webhooks que chegam de sistemas externos (Gmail, GLPI):

```
PADRÃO: RECEBER E ENFILEIRAR

Edge Function recebe request HTTP externo:
1. Valida assinatura HMAC do payload (< 100ms)
2. Verifica autenticidade do remetente
3. Insere evento na tabela shared.event_queue:
   { type, payload, status='PENDING', received_at }
4. Retorna HTTP 200 imediatamente (< 200ms total)
5. Job separado (cron ou trigger) processa a fila

POR QUÊ: Garantir que o webhook responde em < 2s (limite free tier)
         sem bloquear processamento longo
```

### 7.4 Padrão de Edge Function — Job Periódico

Para jobs longos que precisam de mais de 2 segundos:

```
PADRÃO: CHUNKING COM ESTADO PERSISTIDO

Exemplo: google-user-sync (muitos usuários para processar)

1. Cron aciona a função a cada 5 minutos
2. Lê de shared.sync_job_state: { last_processed_user_id, status }
3. Busca próximo chunk de 50 usuários a partir de last_processed_user_id
4. Processa os 50 usuários (sync/update)
5. Persiste estado: last_processed_user_id = último processado
6. Se ainda há usuários: retorna, aguarda próximo cron (5 min)
7. Ao terminar todos: status = COMPLETED, last_processed_user_id = null
```

### 7.5 Autenticação em Edge Functions

Edge Functions podem ser chamadas de três formas:

| Forma | Autenticação | Uso |
|:-----:|:------------:|:----|
| **Anon Key** | Apenas autorização básica | Webhooks externos com validação de assinatura |
| **Service Role Key** | Acesso total ao banco (contorna RLS) | Jobs internos, integrações |
| **JWT do usuário** | Respeitando RLS do usuário | APIs chamadas do browser |

---

## 8. Segurança

### 8.1 Modelo de Segurança em Camadas

```
CAMADAS DE SEGURANÇA SUPABASE

Camada 1 — REDE:
  Cloudflare: WAF, DDoS, Rate Limiting, TLS 1.3, HSTS

Camada 2 — APLICAÇÃO:
  Next.js Middleware: validação JWT, RBAC, tenant isolation
  API Routes: validação de input, sanitização

Camada 3 — API SUPABASE:
  API Key validation (anon ou service role)
  Auth token validation (JWT do Supabase)
  Row Level Security (RLS)

Camada 4 — BANCO DE DADOS:
  Row Level Security policies por tabela
  Column-level security para dados sensíveis
  audit_log INSERT-ONLY (trigger + policy)
  Criptografia em repouso (Supabase gerencia)

Camada 5 — STORAGE:
  Políticas RLS por bucket
  Presigned URLs com expiração
  Criptografia AES-256 em repouso
```

### 8.2 Anon Key vs. Service Role Key

| Chave | Acesso | Onde Usar | Onde NUNCA Usar |
|:-----:|:------:|:---------:|:---------------:|
| **Anon Key** | Sujeito ao RLS; apenas operações permitidas pelas policies | Client Components, browser | Nunca como "master key" |
| **Service Role Key** | Contorna RLS; acesso total | Server Components, API Routes, Edge Functions | Código client-side, browser, logs |

A `SUPABASE_SERVICE_ROLE_KEY` é armazenada como Vercel Secret e nunca tem prefixo `NEXT_PUBLIC_`.

### 8.3 Configurações de Segurança no Supabase

| Configuração | Valor |
|:------------:|-------|
| SSL/TLS obrigatório para conexões ao banco | ✅ Habilitado |
| Criptografia em repouso | ✅ Gerenciado pelo Supabase |
| Criptografia em Storage | ✅ AES-256 |
| IP Allowlist para Service Role | Configurado com IPs do Vercel (quando possível) |
| Auth rate limiting | ✅ 5 tentativas/min por IP |
| RLS habilitado em todas as tabelas críticas | ✅ Obrigatório |
| Leaked secrets check (auth) | N/A (sem senhas locais) |
| Custom JWT secret | ✅ Configurado com secret forte (≥ 64 chars) |

### 8.4 Políticas RLS Críticas

| Tabela | Política | Descrição |
|:------:|:--------:|-----------|
| `shared.audit_log` | INSERT-ONLY | `USING (false)` para UPDATE e DELETE — trilha imutável |
| `auth.UserRole` | Leitura restrita | Apenas o próprio usuário e IT_MANAGER+ veem os papéis |
| `ticket.Ticket` | Isolamento por tenant + papel | Técnicos veem apenas seus chamados |
| `finance.*` | Papel financeiro | Apenas FINANCIAL_ANALYST e IT_MANAGER+ |
| `compliance.*` | Papel compliance | Apenas COMPLIANCE_OFFICER e IT_MANAGER+ |

---

## 9. Auditoria

### 9.1 Auditoria Nativa vs. Auditoria SGTI

O Supabase não oferece auditoria nativa de queries no free tier. O SGTI implementa auditoria própria:

| Tipo | Implementação | Imutabilidade |
|:----:|:-------------:|:-------------:|
| **Auditoria de negócio** | Tabela `shared.audit_log` (INSERT-ONLY via RLS) | ✅ Garantida por RLS |
| **Auditoria de auth** | `auth.audit_log_entries` do Supabase | Gerenciada pelo Supabase |
| **Auditoria de Storage** | `storage.objects` com metadados | Parcial (não rastreia acesso) |
| **Auditoria de Edge Functions** | Logs da Supabase Dashboard | 7 dias (free tier) |

### 9.2 Triggers de Auditoria

Tabelas críticas têm triggers que automaticamente inserem em `shared.audit_log` a cada mutação:

```
TRIGGER PATTERN (exemplo):

CREATE TRIGGER audit_ticket_changes
  AFTER INSERT OR UPDATE OR DELETE ON ticket.Ticket
  FOR EACH ROW EXECUTE FUNCTION shared.record_audit_log();

A função shared.record_audit_log() insere:
{
  tenant_id: NEW.tenant_id,
  user_id: auth.uid(),
  action: TG_OP (INSERT/UPDATE/DELETE),
  resource_type: 'Ticket',
  resource_id: NEW.id,
  old_values: to_jsonb(OLD),
  new_values: to_jsonb(NEW),
  created_at: NOW()
}
```

### 9.3 Retenção de Logs do Supabase

| Log | Retenção (Free) | Retenção (Pro) |
|:---:|:---------------:|:--------------:|
| Auth logs (`auth.audit_log_entries`) | 7 dias | 30 dias |
| Edge Function logs | 7 dias | 30 dias |
| Database logs | Não disponível | Disponível via observabilidade |
| Storage access logs | Não disponível | Não disponível |

**Estratégia free tier:** Os logs críticos de negócio são sempre escritos na tabela `shared.audit_log` (PostgreSQL) com retenção indefinida, não dependendo dos logs da Supabase.

---

## 10. Monitoramento

### 10.1 Métricas Disponíveis no Supabase Dashboard

| Métrica | Onde Ver |
|:-------:|:--------:|
| Database connections | Supabase Dashboard → Database → Connections |
| Query performance | Supabase Dashboard → Database → Query Performance |
| Storage usage | Supabase Dashboard → Storage |
| Auth activity | Supabase Dashboard → Authentication → Logs |
| Edge Function invocations | Supabase Dashboard → Edge Functions |
| Realtime connections | Supabase Dashboard → Realtime |
| API requests | Supabase Dashboard → API |

### 10.2 Health Check do Supabase via SGTI

O endpoint `/api/health/db` do SGTI realiza uma query simples ao banco para verificar a conectividade:

```
GET /api/health/db
→ Server Action executa: SELECT 1 FROM shared.audit_log LIMIT 1
→ Sucesso: { status: "ok", latency_ms: X }
→ Falha: { status: "down", error: "message" }
```

### 10.3 Alertas de Uso do Free Tier

O SGTI implementa alertas automáticos quando a cota do free tier está próxima de ser atingida:

| Recurso | Limite Free | Alerta em | Canal de Alerta |
|:-------:|:-----------:|:---------:|:---------------:|
| Banco de dados | 500 MB | 80% (400 MB) | E-mail IT_MANAGER |
| Storage | 1 GB | 80% (800 MB) | E-mail IT_MANAGER |
| Auth usuários | 50.000 | 80% (40.000) | E-mail IT_MANAGER |
| Edge Function invocations | 500.000/mês | 80% | E-mail IT_MANAGER |
| Bandwidth | 5 GB/mês | 80% | E-mail IT_MANAGER |

Job `quota-monitor` (Edge Function, cron diário às 07h00) verifica o uso atual via Supabase Management API e envia alertas quando os thresholds são atingidos.

---

## 11. Custos

### 11.1 Custos Atuais (Free Tier)

| Serviço | Plano | Custo Mensal |
|:-------:|:-----:|:------------:|
| Supabase (dev + staging + prod) | Free (3 projetos) | R$ 0,00 |
| Vercel (frontend) | Hobby | R$ 0,00 |
| GitHub (repositório) | Free | R$ 0,00 |
| GitHub Actions | Free (2.000 min/mês) | R$ 0,00 |
| Cloudflare (DNS + WAF + CDN) | Free | R$ 0,00 |
| **Total atual** | | **R$ 0,00/mês** |

### 11.2 Custos ao Escalar

| Gatilho de Upgrade | Plano Recomendado | Custo Estimado |
|:-----------------:|:-----------------:|:--------------:|
| Banco > 500 MB | Supabase Pro | USD 25/mês (~R$ 125) |
| PITR necessário | Supabase Pro | USD 25/mês |
| Storage > 1 GB | Supabase Pro (8 GB inclusos) | Incluído no Pro |
| Mais de 50k usuários | Supabase Pro | Incluído no Pro |
| Edge Function timeout > 2s | Supabase Pro | Incluído no Pro |
| Vercel team features | Vercel Pro | USD 20/mês (~R$ 100) |
| **Total estimado (escalonado)** | | ~R$ 225–500/mês |

---

## 12. Limitações do Plano Gratuito

### 12.1 Limitações Críticas e Mitigações

| Limitação | Impacto | Mitigação |
|:----------:|:-------:|:---------:|
| **Banco: 500 MB** | Crescimento limitado de dados históricos | Archiving periódico de dados antigos; audit_log comprimido |
| **Storage: 1 GB** | Poucos anexos e evidências | Upload apenas de arquivos essenciais; cleanup após X anos |
| **Backup: 7 dias** | Janela curta de recuperação | Export manual mensal pelo IT_MANAGER |
| **Sem PITR** | Impossível restaurar para ponto exato no tempo | Backup pré-migration; testes rigorosos em homologação |
| **Edge Function timeout: 2s** | Jobs longos não completam em uma invocação | Padrão de chunking com estado persistido |
| **2 projetos ativos por conta** (free) | Não há 3 projetos (dev+staging+prod) | Usar 1 conta por projeto OU upgrade para Pro |
| **Realtime: 200 conexões** | Limite para equipes grandes | Desconectar usuários inativos; reconectar sob demanda |
| **Sem suporte prioritário** | Incidentes resolvidos mais lentamente | Documentação self-service + comunidade Supabase |
| **Pausar projeto inativo (7 dias)** | Projeto pausado automaticamente se sem acesso | Health check diário mantém projeto ativo |

**Nota sobre 2 projetos gratuitos:** O Supabase permite 2 projetos ativos por conta gratuita. Para 3 ambientes (dev, staging, prod), há duas opções: (a) usar 3 contas gratuitas diferentes, (b) compartilhar dev + staging em um projeto com schemas separados (não recomendado), ou (c) fazer upgrade para o plano Pro (recomendado em produção real).

### 12.2 Estratégia para Manter o Projeto Ativo no Free Tier

O Supabase pausa projetos gratuitos após 7 dias sem atividade de API:

- O health check do SGTI (`GET /api/health/db`) é chamado diariamente pelo UptimeRobot ou Cloudflare Health Checks.
- Isso garante que o banco receba pelo menos 1 query por dia, evitando a pausa automática.

---

## 13. Estratégia de Crescimento

### 13.1 Critérios para Upgrade de Plano

| Critério | Threshold | Ação |
|:--------:|:---------:|:----:|
| Banco atingiu 400 MB | 80% do limite | Avaliar upgrade para Supabase Pro |
| Storage atingiu 800 MB | 80% do limite | Avaliar upgrade para Supabase Pro |
| Usuários ativos > 500 | Performance | Avaliar Supabase Pro para melhor capacidade |
| PITR necessário | Necessidade de compliance | Upgrade para Supabase Pro obrigatório |
| Jobs precisam de > 2s | Edge Functions longas | Upgrade para Supabase Pro |
| Vercel Hobby limitando | Bandwidth ou functions | Avaliar Vercel Pro |

### 13.2 Estratégia de Archiving de Dados

Para estender a vida útil do free tier:

| Dado | Política de Archiving |
|:----:|:---------------------:|
| `shared.audit_log` com > 2 anos | Exportar para CSV comprimido + DELETE em produção |
| Tickets CLOSED há > 3 anos | Mover para tabela `ticket.Ticket_Archive` (schema separado) |
| Notificações lidas há > 30 dias | DELETE automático por job mensal |
| Emails processados há > 90 dias | DELETE automático por job mensal |
| Exports de relatórios | DELETE após 30 dias (Supabase Storage cleanup job) |

### 13.3 Evolução Arquitetural Planejada

| Fase | Quando | Mudança |
|:----:|:------:|:-------:|
| **v1.0 (atual)** | Implantação inicial | Free tier completo |
| **v1.x** | Ao atingir 80% das cotas | Upgrade Supabase Pro + Vercel Pro |
| **v2.0** | Crescimento significativo | Avaliar separação de serviços (backend dedicado) |
| **v3.0** | Enterprise scale | Multi-region, dedicated instance |

---

## 14. Critérios de Aceitação

### 14.1 Auth

- [ ] **CA-01:** Login com conta Google de domínio não-corporativo é rejeitado pelo auth hook.
- [ ] **CA-02:** Access token expira em 1 hora; refresh token renova transparentemente.
- [ ] **CA-03:** Tokens armazenados em cookie HttpOnly (não localStorage).
- [ ] **CA-04:** `supabase.auth.signOut()` invalida sessão e cookies corretamente.
- [ ] **CA-05:** RLS verifica `auth.uid()` em todas as queries autenticadas.

### 14.2 Database e Migrations

- [ ] **CA-06:** Migrations aplicadas automaticamente no CI para dev/staging; aprovação IT_MANAGER para prod.
- [ ] **CA-07:** RLS habilitado em todas as tabelas críticas (verificado via teste automatizado).
- [ ] **CA-08:** `shared.audit_log` bloqueia UPDATE e DELETE via RLS.
- [ ] **CA-09:** Service Role Key nunca exposta no bundle client-side.
- [ ] **CA-10:** Backup manual mensal documentado e armazenado.
- [ ] **CA-11:** Extensões `pg_trgm` e `uuid-ossp` ativas no projeto de produção.

### 14.3 Storage

- [ ] **CA-12:** Arquivos do bucket `evidences` não acessíveis sem presigned URL.
- [ ] **CA-13:** Presigned URL do bucket `evidences` expira em 15 minutos.
- [ ] **CA-14:** Upload de `.exe`, `.bat` bloqueado em todos os buckets.
- [ ] **CA-15:** Hash SHA-256 calculado e armazenado no FileReference a cada upload.
- [ ] **CA-16:** Bucket `articles` permite leitura pública apenas para imagens.

### 14.4 Realtime

- [ ] **CA-17:** Notificação in-app exibida em ≤ 5 segundos após INSERT em `shared.notification`.
- [ ] **CA-18:** Dashboard Operacional atualiza contador de chamados em ≤ 5 segundos.
- [ ] **CA-19:** WebSocket desconectado ao sair da página (cleanup no useEffect).
- [ ] **CA-20:** Fallback para polling de 30 segundos quando Realtime indisponível.

### 14.5 Edge Functions

- [ ] **CA-21:** `gmail-webhook` responde em ≤ 500ms (apenas enfileira, não processa).
- [ ] **CA-22:** `auth-hook-domain` rejeita login de domínio não-corporativo com erro claro.
- [ ] **CA-23:** `sla-monitor` executa a cada 5 minutos sem falha por timeout.
- [ ] **CA-24:** Edge Functions com erro notificam IT_MANAGER após 3 falhas consecutivas.

### 14.6 Segurança e Monitoramento

- [ ] **CA-25:** Uso de banco monitorado; alerta ao IT_MANAGER quando > 400 MB.
- [ ] **CA-26:** Health check diário previne pausa automática do projeto free tier.
- [ ] **CA-27:** Projeto dev pausado não afeta staging ou produção (projetos isolados).

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação com 14 seções e 27 critérios de aceitação |

---

> **Documentos relacionados:**
> [`70_DEPLOYMENT.md`](./70_DEPLOYMENT.md) — Estratégia de deploy e CI/CD
> [`22_AUTHENTICATION.md`](./22_AUTHENTICATION.md) — Autenticação JWT RS256 do SGTI
> [`20_DATABASE.md`](./20_DATABASE.md) — Modelo de dados completo e schemas
> [`50_INTEGRATIONS.md`](./50_INTEGRATIONS.md) — Integrações com sistemas externos
