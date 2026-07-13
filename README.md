# SGTI — Sistema de Gestão de Tecnologia da Informação

> Plataforma corporativa de Gestão de TI baseada em **ITIL v4**.
> Gerenciamento unificado de incidentes, requisições, problemas, ativos, identidades, compliance, projetos e financeiro.

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | Next.js 15 (App Router) · TypeScript 5 · Tailwind CSS 4 · shadcn/ui |
| **Backend** | Supabase Edge Functions (Deno) |
| **Banco de Dados** | Supabase PostgreSQL 15 |
| **Autenticação** | Supabase Auth + Google OAuth 2.0 (Workspace SSO) |
| **Storage** | Supabase Storage |
| **Realtime** | Supabase Realtime (WebSocket) |
| **Hospedagem** | Vercel (Hobby → Pro) |
| **CDN / DNS** | Cloudflare (Free) |
| **CI/CD** | GitHub Actions |
| **Package Manager** | npm |
| **Node.js** | 20 LTS |

---

## Pré-requisitos

- **Node.js** 20 LTS ([download](https://nodejs.org))
- **npm** 10+
- **Supabase CLI** ([instalação](https://supabase.com/docs/guides/cli))
- **Git**
- Conta **Google Workspace** para autenticação OAuth
- Projeto **Supabase** criado (free tier)
- Projeto **Vercel** criado e vinculado ao repositório

---

## Setup Local

### 1. Clonar o repositório

```bash
git clone https://github.com/<org>/sgti.git
cd sgti
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` e preencha todas as variáveis. Consulte `.env.example` para a descrição de cada uma.

### 4. Inicializar Supabase local

```bash
supabase start
```

Aguarde o Supabase iniciar localmente. O Studio estará disponível em `http://localhost:54323`.

### 5. Aplicar migrations do banco

```bash
supabase db reset
```

Isso aplica todas as migrations de `supabase/migrations/` e executa o `supabase/seed.sql`.

### 6. Gerar tipos do Supabase

```bash
npm run supabase:gen-types
```

Regenera `lib/supabase/database.types.ts` a partir do schema local.

### 7. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

O SGTI estará disponível em `http://localhost:3000`.

---

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia Next.js em modo desenvolvimento

# Qualidade de código
npm run lint             # Executa ESLint
npm run lint:fix         # ESLint com correção automática
npm run format           # Prettier (formata todos os arquivos)
npm run format:check     # Prettier (verifica sem modificar)
npm run type-check       # TypeScript sem emitir arquivos

# Testes
npm run test             # Jest (modo interativo)
npm run test:watch       # Jest em modo watch
npm run test:coverage    # Jest com relatório de cobertura

# Build
npm run build            # Build de produção
npm run start            # Inicia servidor de produção

# Supabase
npm run supabase:start   # Inicia Supabase local
npm run supabase:stop    # Para Supabase local
npm run supabase:reset   # Reseta banco + aplica migrations + seed
npm run supabase:push    # Aplica migrations no projeto remoto
npm run supabase:gen-types  # Gera tipos TypeScript do schema
```

---

## Estrutura de Diretórios

```
sgti/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # CI: lint, type-check, test, build
│   │   ├── cd.yml              # CD: deploy para staging e produção
│   │   └── keepalive.yml       # Mantém Supabase free tier ativo
│   └── pull_request_template.md
│
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Rotas públicas (login, callback)
│   ├── (dashboard)/            # Rotas protegidas (módulos SGTI)
│   ├── api/                    # Route Handlers
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Estilos globais + variáveis CSS
│
├── components/
│   ├── ui/                     # Componentes shadcn/ui (não editar)
│   ├── shared/                 # Componentes compartilhados
│   └── layout/                 # Sidebar, header, navegação
│
├── lib/
│   ├── supabase/               # Clientes Supabase (browser, server, middleware)
│   ├── auth/                   # Helpers de autenticação e RBAC
│   ├── validations/            # Schemas Zod
│   ├── utils/                  # Utilitários (cn, format-date, etc.)
│   └── constants/              # Rotas, roles, SLA policies
│
├── hooks/                      # React hooks customizados
├── types/                      # Tipos TypeScript globais
├── services/                   # Camada de acesso a dados por módulo
├── actions/                    # Server Actions Next.js
│
├── supabase/
│   ├── migrations/             # Migrations SQL versionadas
│   ├── functions/              # Edge Functions (Deno)
│   ├── seed.sql                # Dados de desenvolvimento
│   └── config.toml             # Config do Supabase CLI
│
├── __tests__/                  # Testes unitários e de integração
│
├── middleware.ts               # Auth guard + session refresh
├── next.config.ts              # Configuração Next.js
├── tailwind.config.ts          # Tema corporativo SGTI
├── tsconfig.json               # TypeScript strict mode
├── eslint.config.js            # ESLint flat config
├── prettier.config.js          # Formatação de código
├── jest.config.ts              # Configuração de testes
├── vercel.json                 # Configuração de deploy Vercel
├── components.json             # Configuração shadcn/ui
└── .env.example                # Referência de variáveis de ambiente
```

---

## Autenticação

O SGTI utiliza exclusivamente **Google Workspace SSO** — nenhuma senha local é armazenada.

**Fluxo OAuth:**
1. Usuário clica "Entrar com Google"
2. Supabase Auth redireciona para o Google OAuth
3. Google autentica e redireciona para `/auth/callback`
4. Supabase troca o código por tokens (JWT + refresh)
5. Tokens armazenados em cookies HttpOnly
6. Middleware valida o JWT em cada requisição

**Restrição de domínio:** Apenas contas do domínio corporativo são aceitas (configurado via Supabase Auth hook).

---

## Banco de Dados

O banco é organizado em **schemas isolados por módulo** (bounded context):

| Schema | Módulo |
|--------|--------|
| `shared` | Usuários, roles, audit log, notificações |
| `ticket` | Incidentes, Requisições, Problemas |
| `catalog` | Catálogo de Serviços, SLA |
| `asset` | ITAM |
| `identity` | IAM |
| `compliance` | Compliance |
| `financial` | OPEX / CAPEX |
| `procurement` | Compras |
| `project` | Projetos |
| `knowledge` | Base de Conhecimento |

**RLS (Row Level Security)** está habilitado em todas as tabelas com dados sensíveis.

---

## Deploy

### Staging
Push para a branch `staging` → GitHub Actions executa CI → deploy automático para Vercel.

### Produção
Push para a branch `main` → GitHub Actions executa CI → aguarda aprovação manual → deploy para Vercel.

**Rollback:** No dashboard da Vercel → Deployments → selecionar deployment anterior → "Promote to Production". Tempo estimado: < 2 minutos.

---

## Branches

| Branch | Propósito |
|--------|-----------|
| `main` | Produção — protegida, só aceita PR |
| `staging` | Homologação — protegida, só aceita PR |
| `develop` | Integração contínua de features |
| `feature/*` | Desenvolvimento de features |
| `fix/*` | Correção de bugs |
| `hotfix/*` | Correção urgente em produção |

Commits seguem [Conventional Commits](https://www.conventionalcommits.org/):
`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`, `ci:`

---

## Secrets Necessários (GitHub Actions)

Configure em: **GitHub → Settings → Secrets and Variables → Actions**

| Secret | Descrição |
|--------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL_DEV` | URL do projeto Supabase (dev) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY_DEV` | Anon key do Supabase (dev) |
| `NEXT_PUBLIC_SUPABASE_URL_STAGING` | URL do projeto Supabase (staging) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING` | Anon key do Supabase (staging) |
| `NEXT_PUBLIC_SUPABASE_URL_PROD` | URL do projeto Supabase (produção) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD` | Anon key do Supabase (produção) |
| `VERCEL_TOKEN` | Personal access token da Vercel |
| `VERCEL_ORG_ID` | ID da organização na Vercel |
| `VERCEL_PROJECT_ID` | ID do projeto na Vercel |

---

## Referências

- [Documentação do Projeto](./Docs/) — Toda a documentação técnica e funcional do SGTI
- [Ordem de Implementação](./Docs/80_IMPLEMENTATION_ORDER.md) — Roadmap de 22 fases
- [Padrões de Código](./Docs/81_CODING_STANDARDS.md) — Convenções obrigatórias
- [Arquitetura Supabase](./Docs/71_SUPABASE.md) — Detalhes da infraestrutura Supabase
- [Regras para Claude Code](./CLAUDE.md) — Diretrizes para desenvolvimento com IA

---

> **SGTI v0.1.0 — Sprint 0**
> Classificação: Interno — Restrito
> Responsável: Arquitetura Corporativa de TI
