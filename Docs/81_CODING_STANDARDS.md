# SGTI — Sistema de Gestão de Tecnologia da Informação
## Padrões Oficiais de Desenvolvimento — Coding Standards

> **Classificação:** Interno — Desenvolvimento
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [70_DEPLOYMENT.md](./70_DEPLOYMENT.md) · [71_SUPABASE.md](./71_SUPABASE.md) · [72_GITHUB_ACTIONS.md](./72_GITHUB_ACTIONS.md)

---

## Sobre este Documento

Este documento define os **padrões oficiais de desenvolvimento do SGTI**, estabelecendo convenções, estruturas e práticas que toda a equipe deve seguir para garantir consistência, qualidade, segurança e manutenibilidade da base de código.

**Princípio fundamental:** Código é lido muito mais vezes do que escrito. Toda decisão de padronização prioriza legibilidade, previsibilidade e segurança.

---

## Stack Oficial

| Camada | Tecnologia | Versão |
|:------:|:----------:|:------:|
| **Frontend — Framework** | Next.js (App Router) | 15.x |
| **Frontend — Linguagem** | TypeScript | 5.x |
| **Frontend — Estilos** | Tailwind CSS | 4.x |
| **Frontend — Componentes** | shadcn/ui (Radix UI) | Latest |
| **Backend — BaaS** | Supabase | Latest |
| **Backend — Functions** | Supabase Edge Functions (Deno) | Latest |
| **Banco de Dados** | PostgreSQL (via Supabase) | 15+ |
| **Package Manager** | npm | Latest LTS |
| **Node.js** | Node.js | 20 LTS |

---

## Sumário

1. [Convenções de Nomenclatura](#1-convenções-de-nomenclatura)
2. [Estrutura de Diretórios](#2-estrutura-de-diretórios)
3. [TypeScript Standards](#3-typescript-standards)
4. [React Standards](#4-react-standards)
5. [Next.js Standards](#5-nextjs-standards)
6. [Supabase Standards](#6-supabase-standards)
7. [PostgreSQL Standards](#7-postgresql-standards)
8. [Segurança](#8-segurança)
9. [Tratamento de Erros](#9-tratamento-de-erros)
10. [Logs](#10-logs)
11. [Observabilidade](#11-observabilidade)
12. [Testes](#12-testes)
13. [Git Flow](#13-git-flow)
14. [Commits](#14-commits)
15. [Pull Requests](#15-pull-requests)
16. [Code Review](#16-code-review)
17. [Performance](#17-performance)
18. [Acessibilidade](#18-acessibilidade)
19. [Responsividade](#19-responsividade)
20. [Critérios de Qualidade](#20-critérios-de-qualidade)
21. [Checklist de Desenvolvimento](#21-checklist-de-desenvolvimento)
22. [Checklist de Deploy](#22-checklist-de-deploy)

---

## 1. Convenções de Nomenclatura

### 1.1 Regra Geral: Inglês Obrigatório

Todo código, variáveis, funções, componentes, tipos, interfaces, constantes, nomes de arquivo e comentários de código são escritos em **inglês**. Apenas strings de UI voltadas ao usuário final são em português.

### 1.2 Nomenclatura por Contexto

| Contexto | Convenção | Exemplo |
|:--------:|:---------:|---------|
| **Variáveis e funções** | camelCase | `getUserById`, `incidentCount` |
| **Componentes React** | PascalCase | `IncidentCard`, `SLABadge` |
| **Tipos e Interfaces TypeScript** | PascalCase | `Incident`, `UserRole`, `ApiResponse` |
| **Enums** | PascalCase (nome) + UPPER_SNAKE (membros) | `enum TicketStatus { NEW = 'NEW', IN_PROGRESS = 'IN_PROGRESS' }` |
| **Constantes** | UPPER_SNAKE_CASE | `MAX_FILE_SIZE_MB`, `SLA_BREACH_THRESHOLD` |
| **Arquivos de componente** | kebab-case | `incident-card.tsx`, `sla-badge.tsx` |
| **Arquivos de utilitário** | kebab-case | `format-date.ts`, `validate-cnpj.ts` |
| **Hooks customizados** | camelCase com prefixo `use` | `useIncidents`, `useSLATimer` |
| **Context e Provider** | PascalCase com sufixo `Context`/`Provider` | `AuthContext`, `ThemeProvider` |
| **Páginas (Next.js App Router)** | `page.tsx` em diretório kebab-case | `app/incidents/[id]/page.tsx` |
| **Layouts** | `layout.tsx` | `app/(dashboard)/layout.tsx` |
| **Server Actions** | camelCase com sufixo `Action` | `createIncidentAction`, `updateStatusAction` |
| **Migrations PostgreSQL** | `{timestamp}_{descricao_snake_case}.sql` | `20260609142300_add_sla_breach_reason.sql` |
| **Edge Functions** | kebab-case | `sla-monitor`, `gmail-webhook` |
| **Schemas PostgreSQL** | snake_case | `ticket`, `compliance`, `shared` |
| **Tabelas PostgreSQL** | PascalCase (convenção Supabase/Prisma) | `Ticket`, `ComplianceFinding` |
| **Colunas PostgreSQL** | snake_case | `created_at`, `assignee_id`, `due_date` |
| **CSS classes (Tailwind)** | Usar utilitários Tailwind diretamente | `className="flex items-center gap-2"` |

### 1.3 Regras de Nomenclatura

- **Sem abreviações obscuras:** `usr` → `user`; `inc` → `incident`; `tkt` → `ticket`. Exceções: `id`, `url`, `api`, `db`, siglas conhecidas (`SLA`, `MTTR`, `KPI`).
- **Nomes descritivos e intencionais:** `handleSubmit` é preferível a `onClick`; `isLoading` é preferível a `flag`.
- **Booleanos com prefixo:** `is`, `has`, `can`, `should`. Ex.: `isVisible`, `hasPermission`, `canEdit`.
- **Funções com verbos:** `get`, `create`, `update`, `delete`, `fetch`, `validate`, `calculate`, `format`, `handle`.
- **Sem números em nomes:** sem `button2`, `handler1`. Ser descritivo.

---

## 2. Estrutura de Diretórios

### 2.1 Estrutura Raiz do Projeto

```
sgti/
├── .github/
│   ├── workflows/          # Pipelines CI/CD (ver 72_GITHUB_ACTIONS.md)
│   ├── CODEOWNERS
│   └── pull_request_template.md
├── app/                    # Next.js App Router
├── components/             # Componentes React reutilizáveis
├── lib/                    # Utilitários, helpers, configurações
├── hooks/                  # Hooks customizados
├── types/                  # Tipos TypeScript globais
├── constants/              # Constantes da aplicação
├── services/               # Camada de serviços (acesso a dados)
├── actions/                # Server Actions Next.js
├── supabase/               # Configurações e migrations Supabase
├── public/                 # Assets estáticos públicos
├── styles/                 # Estilos globais (Tailwind entry)
├── __tests__/              # Testes (espelhando estrutura do src)
├── .env.example            # Variáveis de ambiente (sem valores reais)
├── .eslintrc.js            # Configuração ESLint
├── .prettierrc             # Configuração Prettier
├── tailwind.config.ts      # Configuração Tailwind
├── next.config.ts          # Configuração Next.js
├── tsconfig.json           # Configuração TypeScript
└── package.json
```

### 2.2 Estrutura do Diretório `app/` (Next.js App Router)

```
app/
├── (auth)/                 # Grupo: rotas públicas (sem layout do dashboard)
│   ├── login/
│   │   └── page.tsx
│   └── auth/
│       └── callback/
│           └── route.ts    # Route Handler do OAuth callback
│
├── (dashboard)/            # Grupo: rotas protegidas (com layout do dashboard)
│   ├── layout.tsx          # Layout com sidebar, header, auth guard
│   ├── page.tsx            # Dashboard raiz (redirect para /incidents)
│   │
│   ├── incidents/          # Módulo de Incidentes
│   │   ├── page.tsx        # Lista de incidentes
│   │   ├── [id]/
│   │   │   └── page.tsx    # Detalhe do incidente
│   │   └── new/
│   │       └── page.tsx    # Criação de incidente
│   │
│   ├── requests/           # Módulo de Requisições
│   ├── problems/           # Módulo de Problemas
│   ├── assets/             # Módulo de Ativos
│   ├── compliance/         # Módulo de Compliance
│   ├── finance/            # Módulo Financeiro
│   ├── projects/           # Módulo de Projetos
│   ├── knowledge/          # Base de Conhecimento
│   ├── identities/         # Gestão de Identidades
│   └── admin/              # Administração (SUPER_ADMIN)
│
├── api/                    # Route Handlers (API endpoints)
│   ├── health/
│   │   └── route.ts
│   ├── health/
│   │   └── db/
│   │       └── route.ts
│   └── version/
│       └── route.ts
│
├── error.tsx               # Error boundary global
├── not-found.tsx           # Página 404
├── loading.tsx             # Loading global
├── layout.tsx              # Root layout
└── globals.css             # Estilos globais
```

### 2.3 Estrutura do Diretório `components/`

```
components/
├── ui/                     # Componentes base do shadcn/ui (não editar diretamente)
│   ├── button.tsx
│   ├── input.tsx
│   ├── badge.tsx
│   └── ...
│
├── shared/                 # Componentes compartilhados entre módulos
│   ├── data-table/         # Tabela de dados reutilizável
│   │   ├── data-table.tsx
│   │   ├── data-table-columns.tsx
│   │   └── index.ts
│   ├── status-badge/
│   ├── user-avatar/
│   ├── confirmation-dialog/
│   ├── page-header/
│   ├── empty-state/
│   └── error-boundary/
│
├── incidents/              # Componentes específicos do módulo de Incidentes
│   ├── incident-card.tsx
│   ├── incident-form.tsx
│   ├── incident-status-badge.tsx
│   ├── sla-countdown.tsx
│   └── index.ts
│
├── compliance/             # Componentes do módulo de Compliance
│   ├── compliance-score-gauge.tsx
│   ├── finding-card.tsx
│   └── index.ts
│
└── layout/                 # Componentes de layout
    ├── sidebar.tsx
    ├── header.tsx
    ├── breadcrumb.tsx
    └── mobile-nav.tsx
```

### 2.4 Estrutura do Diretório `lib/`

```
lib/
├── supabase/
│   ├── client.ts           # createBrowserClient (Client Components)
│   ├── server.ts           # createServerClient (Server Components)
│   ├── middleware.ts        # Cliente para middleware.ts
│   └── types.ts            # Database types gerados pelo Supabase
│
├── auth/
│   ├── get-user.ts         # Helper: obter usuário autenticado
│   ├── get-permissions.ts  # Helper: verificar permissões RBAC
│   └── redirect-if-unauthenticated.ts
│
├── validations/            # Schemas Zod para validação de dados
│   ├── incident.ts
│   ├── compliance.ts
│   └── user.ts
│
├── utils/
│   ├── format-date.ts
│   ├── format-currency.ts
│   ├── calculate-sla.ts
│   ├── generate-code.ts    # INC-YYYY-NNNNNN, CMP-YYYY-NNNNNN
│   └── cn.ts               # Utilitário clsx + tailwind-merge
│
└── constants/
    ├── sla-policies.ts
    ├── roles.ts
    └── routes.ts
```

### 2.5 Estrutura do Diretório `supabase/`

```
supabase/
├── migrations/             # Migrations SQL versionadas
│   ├── 20260101000000_initial_schema.sql
│   └── 20260609142300_add_sla_breach_reason.sql
├── functions/              # Edge Functions (Deno)
│   ├── sla-monitor/
│   │   └── index.ts
│   ├── gmail-webhook/
│   │   └── index.ts
│   └── _shared/            # Código compartilhado entre functions
│       ├── cors.ts
│       └── supabase-client.ts
├── seed.sql                # Dados iniciais do sistema
└── config.toml             # Configuração local do Supabase
```

---

## 3. TypeScript Standards

### 3.1 Configuração Base (`tsconfig.json`)

```
OPCOES OBRIGATORIAS:
  "strict": true                    <- Habilita todas as checagens rígidas
  "noImplicitAny": true            <- Proíbe any implícito
  "strictNullChecks": true          <- null e undefined devem ser explícitos
  "noUnusedLocals": true            <- Erro em variáveis não usadas
  "noUnusedParameters": true        <- Erro em parâmetros não usados
  "exactOptionalPropertyTypes": true <- ? não implica undefined
  "noUncheckedIndexedAccess": true  <- Array access retorna T | undefined
  "target": "ES2022"
  "moduleResolution": "bundler"
  "paths": { "@/*": ["./src/*"] }  <- Path aliases
```

### 3.2 Tipos e Interfaces

```typescript
// CORRETO: Preferir interface para objetos que podem ser estendidos
interface Incident {
  id: string;
  title: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: Date;
  assigneeId: string | null;  // Explícito sobre nullable
}

// CORRETO: Type para unions, intersections e tipos complexos
type TicketPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type TicketStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type ApiResponse<T> = { data: T; error: null } | { data: null; error: AppError };

// ERRADO: any sem justificativa
const processData = (data: any) => { ... }; // PROIBIDO

// CORRETO: unknown com type guard
const processData = (data: unknown): ProcessedData => {
  if (!isValidData(data)) throw new Error('Invalid data');
  return transform(data);
};
```

### 3.3 Regras de Tipagem

- **`any` é proibido** exceto em casos documentados com comentário `// eslint-disable-next-line @typescript-eslint/no-explicit-any` e justificativa.
- **`unknown` em vez de `any`** para dados de origem desconhecida (API externa, JSON.parse).
- **Assertions de tipo (`as`) com moderação.** Preferir type guards e narrowing.
- **Enums TypeScript proibidos** — usar `const` com `as const` ou union types. Motivo: enums geram código JavaScript desnecessário.

```typescript
// ERRADO: TypeScript enum
enum Status { NEW = 'NEW', ACTIVE = 'ACTIVE' }

// CORRETO: Const object com as const
const Status = { NEW: 'NEW', ACTIVE: 'ACTIVE' } as const;
type Status = typeof Status[keyof typeof Status];
```

### 3.4 Generics

```typescript
// CORRETO: Generics com constraints
async function fetchById<T extends { id: string }>(
  table: string,
  id: string
): Promise<T | null> { ... }

// CORRETO: Utility types nativos
type PartialIncident = Partial<Incident>;
type RequiredFields = Required<Pick<Incident, 'title' | 'priority'>>;
type ReadOnlyIncident = Readonly<Incident>;
```

### 3.5 Tipagem de Props de Componentes

```typescript
// CORRETO: Props tipadas com interface, export separado
interface IncidentCardProps {
  incident: Incident;
  onStatusChange?: (status: TicketStatus) => void;
  className?: string;
  isCompact?: boolean;
}

export function IncidentCard({ incident, onStatusChange, className, isCompact = false }: IncidentCardProps) {
  ...
}

// Exportar tipo para reutilização em testes e Storybook
export type { IncidentCardProps };
```

---

## 4. React Standards

### 4.1 Componentes Funcionais Apenas

Nenhum Class Component é permitido. Somente Functional Components com hooks.

### 4.2 Estrutura de um Componente

```
ORDEM OBRIGATÓRIA DENTRO DE UM COMPONENTE:

1. Imports (externos → internos → relativos)
2. Tipos/interfaces locais (se não exportados)
3. Constantes locais (fora do componente)
4. Definição do componente (export function)
   a. Declaração de hooks (useState, useEffect, useContext, hooks custom)
   b. Funções e handlers (handleSubmit, handleClick)
   c. Derived state (variáveis calculadas de estado)
   d. Early returns (loading, error, empty states)
   e. JSX return principal
5. Sub-componentes locais (se pequenos e não reutilizáveis)
```

### 4.3 Client vs. Server Components

```typescript
// Server Component (padrão — sem diretiva)
// Busca dados diretamente, sem useState, sem useEffect
async function IncidentsPage() {
  const incidents = await getIncidents(); // Fetch no servidor
  return <IncidentList incidents={incidents} />;
}

// Client Component (somente quando necessário)
'use client';
// Necessário para: useState, useEffect, event handlers, hooks de browser
function SLACountdown({ deadline }: { deadline: Date }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(deadline));
  useEffect(() => { ... }, [deadline]);
  return <div>{timeLeft}</div>;
}
```

**Regra:** Maximizar Server Components. Usar `'use client'` apenas para:
- Estado local (`useState`, `useReducer`).
- Efeitos colaterais (`useEffect`).
- Event handlers (onClick, onChange, onSubmit).
- Acesso a APIs do browser (localStorage, window, navigator).
- Hooks que dependem de estado ou contexto do cliente.

### 4.4 Padrão de Componente com Loading e Error

```typescript
// Padrão obrigatório: Loading state, Error state, Empty state, Data state
function IncidentList({ incidentIds }: { incidentIds: string[] }) {
  const { data: incidents, isLoading, error } = useIncidents(incidentIds);

  // Early returns por prioridade
  if (isLoading) return <IncidentListSkeleton />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;
  if (!incidents.length) return <EmptyState entity="incidentes" />;

  return (
    <ul className="space-y-2">
      {incidents.map((incident) => (
        <IncidentCard key={incident.id} incident={incident} />
      ))}
    </ul>
  );
}
```

### 4.5 Memoização

```typescript
// Usar React.memo apenas com profiling que comprove necessidade
// Não memoizar por padrão — memoização tem custo de complexidade

// Usar useMemo para cálculos pesados
const sortedIncidents = useMemo(
  () => incidents.sort((a, b) => a.priority.localeCompare(b.priority)),
  [incidents]
);

// Usar useCallback para funções passadas como props (evitar re-renders)
const handleStatusChange = useCallback(
  (status: TicketStatus) => { updateStatus(incident.id, status); },
  [incident.id]
);
```

### 4.6 Forbidden Patterns

```typescript
// PROIBIDO: Lógica de negócio em JSX
// ERRADO:
return (
  <div>{incidents.filter(i => i.priority === 'CRITICAL' && i.status !== 'CLOSED').length}</div>
);
// CORRETO:
const criticalOpenCount = incidents.filter(isCriticalAndOpen).length;
return <div>{criticalOpenCount}</div>;

// PROIBIDO: Índice como key em listas mutáveis
// ERRADO:
{incidents.map((incident, index) => <Card key={index} />)}
// CORRETO:
{incidents.map((incident) => <Card key={incident.id} />)}

// PROIBIDO: Mutação direta de estado
// ERRADO:
incidents.push(newIncident); setIncidents(incidents);
// CORRETO:
setIncidents([...incidents, newIncident]);
```

---

## 5. Next.js Standards

### 5.1 App Router — Obrigatório

O projeto usa exclusivamente o **App Router** do Next.js 15. O Pages Router não é utilizado.

### 5.2 Data Fetching

```typescript
// CORRETO: Fetch em Server Component com cache
async function getIncidents(filters: IncidentFilters) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('Ticket')
    .select('*')
    .eq('type', 'INCIDENT')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

// CORRETO: Revalidação por tag (ISR seletivo)
const incidents = await fetch('/api/incidents', {
  next: { tags: ['incidents'], revalidate: 60 }
});

// CORRETO: Dados dinâmicos sem cache
const { data } = await supabase.from('Ticket').select('*');
// Server Components já não fazem cache por padrão no Next.js 15
```

### 5.3 Server Actions

```typescript
// CORRETO: Server Action com validação Zod e tratamento de erro
'use server';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';

const createIncidentSchema = z.object({
  title: z.string().min(5).max(400),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  serviceId: z.string().uuid(),
  description: z.string().min(10),
});

export async function createIncidentAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // 1. Verificar autenticação
  const user = await getAuthenticatedUser();
  if (!user) return { error: 'Não autenticado' };

  // 2. Verificar autorização
  if (!hasPermission(user, 'incidents:create')) {
    return { error: 'Sem permissão para criar incidentes' };
  }

  // 3. Validar dados
  const parsed = createIncidentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // 4. Executar ação
  const { data, error } = await supabaseAdmin
    .from('Ticket')
    .insert({ ...parsed.data, type: 'INCIDENT', tenant_id: user.tenantId });

  if (error) {
    logger.error('Failed to create incident', { error, userId: user.id });
    return { error: 'Erro ao criar incidente. Tente novamente.' };
  }

  // 5. Revalidar cache
  revalidateTag('incidents');

  return { success: true, data };
}
```

### 5.4 Route Handlers

```typescript
// CORRETO: Route Handler com autenticação e validação
// app/api/incidents/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Autenticação
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse de query params
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '25'), 100);

  // Busca com RLS
  const supabase = createServerClient();
  const { data, error, count } = await supabase
    .from('Ticket')
    .select('*', { count: 'exact' })
    .eq('type', 'INCIDENT')
    .eq('tenant_id', user.tenantId)
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ data, total: count, page, limit });
}
```

### 5.5 Middleware

```typescript
// middleware.ts — Proteção de rotas e gestão de sessão
import { createServerClient } from '@/lib/supabase/middleware';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas — sem autenticação necessária
  const publicPaths = ['/login', '/auth/callback', '/api/health'];
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Verificar sessão
  const supabase = createServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Adicionar correlation ID para rastreabilidade
  const correlationId = crypto.randomUUID();
  const response = NextResponse.next();
  response.headers.set('X-Correlation-ID', correlationId);

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 6. Supabase Standards

### 6.1 Criação de Clientes

```typescript
// lib/supabase/server.ts — Para Server Components e API Routes
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

export function createSupabaseServer() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
}

// lib/supabase/admin.ts — Para operações que contornam RLS (usar com cuidado)
export function createSupabaseAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!  // NUNCA no cliente
  );
}

// lib/supabase/client.ts — Para Client Components
'use client';
import { createBrowserClient } from '@supabase/ssr';
export function createSupabaseBrowser() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### 6.2 Padrões de Query

```typescript
// CORRETO: Select específico (nunca select('*') em produção sem necessidade)
const { data } = await supabase
  .from('Ticket')
  .select('id, title, status, priority, assignee_id, created_at')
  .eq('tenant_id', tenantId)
  .order('created_at', { ascending: false })
  .range(0, 24);

// CORRETO: Joins tipados
const { data } = await supabase
  .from('Ticket')
  .select(`
    id, title, status, priority,
    assignee:auth_User!assignee_id (id, display_name, avatar_url),
    category:catalog_Category (id, name)
  `);

// CORRETO: Upsert seguro
const { error } = await supabase
  .from('SLAHistory')
  .upsert({ ticket_id, status, updated_at: new Date() }, {
    onConflict: 'ticket_id',
    ignoreDuplicates: false
  });
```

### 6.3 RLS e Segurança em Queries

```typescript
// REGRA: Server Components e API Routes que usam admin client
// DEVEM incluir filtro manual de tenant_id
// (Service Role bypassa RLS — responsabilidade do desenvolvedor)

// ERRADO: Admin client sem filtro de tenant
const { data } = await supabaseAdmin.from('Ticket').select('*');

// CORRETO: Admin client com filtro explícito de tenant
const { data } = await supabaseAdmin
  .from('Ticket')
  .select('*')
  .eq('tenant_id', user.tenantId);  // OBRIGATÓRIO com admin client

// CORRETO: Anon client usa RLS automaticamente
const { data } = await supabase.from('Ticket').select('*');
// RLS garante isolamento por tenant via auth.uid()
```

### 6.4 Realtime

```typescript
// CORRETO: Subscription com cleanup obrigatório
'use client';
useEffect(() => {
  const channel = supabase
    .channel(`ticket:${ticketId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'ticket',
      table: 'Ticket',
      filter: `id=eq.${ticketId}`,
    }, (payload) => {
      setTicket(payload.new as Ticket);
    })
    .subscribe();

  // OBRIGATÓRIO: cleanup ao desmontar
  return () => { supabase.removeChannel(channel); };
}, [ticketId, supabase]);
```

### 6.5 Edge Functions

```typescript
// supabase/functions/sla-monitor/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // CORS para invocações via browser
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Lógica da função...
    const result = await processSlAMonitoring(supabase);

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('SLA Monitor error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## 7. PostgreSQL Standards

### 7.1 Convenções de Schema e Tabelas

- **12 schemas organizados por domínio** — ver `20_DATABASE.md`.
- **Nomes de tabelas em PascalCase** (convenção Prisma/Supabase).
- **Colunas em snake_case**.
- **FKs com sufixo `_id`**: `assignee_id`, `tenant_id`, `category_id`.
- **Booleanos com prefixo `is_` ou `has_`**: `is_active`, `has_warranty`.
- **Timestamps obrigatórios**: `created_at`, `updated_at` em toda tabela principal.
- **Soft delete**: `deleted_at TIMESTAMPTZ` — nunca exclusão física de registros de negócio.

### 7.2 Padrão de Campos Obrigatórios

```sql
-- Campos obrigatórios em TODA tabela principal
id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
tenant_id     UUID NOT NULL REFERENCES auth.Tenant(id),
created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
created_by    UUID NOT NULL REFERENCES auth.User(id),
updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_by    UUID NOT NULL REFERENCES auth.User(id),
deleted_at    TIMESTAMPTZ,      -- NULL = ativo; preenchido = deletado
deleted_by    UUID REFERENCES auth.User(id)

-- Trigger obrigatório para atualizar updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON {schema}.{Table}
  FOR EACH ROW EXECUTE FUNCTION moddatetime('updated_at');
```

### 7.3 Migrations

```sql
-- PADRÃO DE MIGRATION

-- Sempre com transação
BEGIN;

-- DDL da mudança
ALTER TABLE ticket.Ticket
  ADD COLUMN breach_reason TEXT;

-- Comentário descritivo
COMMENT ON COLUMN ticket.Ticket.breach_reason
  IS 'Motivo pelo qual o SLA foi violado, preenchido pelo sistema ao detectar breach';

-- Índice se necessário
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ticket_breach_reason
  ON ticket.Ticket(breach_reason)
  WHERE breach_reason IS NOT NULL;

COMMIT;

-- REGRAS:
-- 1. Nunca editar migration já aplicada
-- 2. Uma mudança logica por arquivo
-- 3. CONCURRENTLY em índices grandes para evitar lock
-- 4. IF NOT EXISTS em CREATE (idempotência)
-- 5. Comentar colunas novas com COMMENT ON
```

### 7.4 Row Level Security (RLS)

```sql
-- RLS obrigatório em toda tabela com dados sensíveis

-- Habilitar RLS
ALTER TABLE ticket.Ticket ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket.Ticket FORCE ROW LEVEL SECURITY;

-- Política de isolamento por tenant (obrigatória)
CREATE POLICY "tenant_isolation" ON ticket.Ticket
  USING (tenant_id = get_current_tenant_id());

-- Política por papel (exemplo)
CREATE POLICY "technician_own_tickets" ON ticket.Ticket
  FOR SELECT USING (
    tenant_id = get_current_tenant_id()
    AND (
      assignee_id = auth.uid()::uuid
      OR EXISTS (
        SELECT 1 FROM auth.UserRole ur
        WHERE ur.user_id = auth.uid()::uuid
        AND ur.role_code IN ('IT_SPECIALIST', 'IT_MANAGER', 'SUPER_ADMIN')
        AND ur.is_active = true
        AND ur.tenant_id = get_current_tenant_id()
      )
    )
  );
```

---

## 8. Segurança

### 8.1 Princípios de Segurança

| Principio | Aplicação no SGTI |
|:---------:|:-----------------:|
| **Least Privilege** | Service Role Key somente no servidor; RLS por padrão |
| **Defense in Depth** | Validação no cliente + servidor + banco |
| **Input Validation** | Zod em toda entrada de dados; nunca confiar no cliente |
| **Output Encoding** | React escapa HTML por padrão; cuidado com dangerouslySetInnerHTML |
| **Secrets Management** | Apenas Vercel Secrets; nunca .env commitado |
| **Audit Trail** | Toda operação sensível registrada em shared.audit_log |

### 8.2 Regras de Segurança de Código

```typescript
// PROIBIDO: Service Role Key no cliente
// ERRADO (em qualquer arquivo sem 'use server' ou route handler):
const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY);

// PROIBIDO: SQL injection via template strings
// ERRADO:
const { data } = await supabase.rpc(`SELECT * FROM users WHERE id = '${userId}'`);
// CORRETO: Usar cliente Supabase que parametriza automaticamente
const { data } = await supabase.from('User').select('*').eq('id', userId);

// PROIBIDO: Dados sensíveis em logs
// ERRADO:
logger.info('User login', { password: user.password, token: jwt });
// CORRETO:
logger.info('User login', { userId: user.id, email: maskEmail(user.email) });

// PROIBIDO: dangerouslySetInnerHTML com dados do usuário
// ERRADO:
<div dangerouslySetInnerHTML={{ __html: userContent }} />
// CORRETO: Sanitizar primeiro
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />

// OBRIGATÓRIO: Validar autorização RBAC em toda Server Action e Route Handler
export async function updateIncidentAction(id: string, data: unknown) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Unauthenticated');
  if (!canUpdateIncident(user, id)) throw new Error('Unauthorized');
  // ... continuar
}
```

### 8.3 Headers de Segurança

Configurados em `next.config.ts`:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

---

## 9. Tratamento de Erros

### 9.1 Tipos de Erro

```typescript
// lib/errors.ts — Hierarquia de erros do SGTI
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 422, context);
  }
}

export class AuthenticationError extends AppError {
  constructor() {
    super('Não autenticado', 'AUTHENTICATION_ERROR', 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(resource?: string) {
    super(`Sem permissão${resource ? ` para ${resource}` : ''}`, 'AUTHORIZATION_ERROR', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} não encontrado`, 'NOT_FOUND', 404);
  }
}

export class DatabaseError extends AppError {
  constructor(operation: string, cause?: Error) {
    super(`Erro de banco: ${operation}`, 'DATABASE_ERROR', 500);
    if (cause) this.cause = cause;
  }
}
```

### 9.2 Padrão de Tratamento em Server Actions

```typescript
// CORRETO: Resultado tipado (sem exceções não tratadas)
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createIncidentAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: 'Sessão expirada. Faça login novamente.' };

    const parsed = incidentSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return {
        success: false,
        error: 'Dados inválidos',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const incident = await createIncident(parsed.data, user);
    return { success: true, data: { id: incident.id } };

  } catch (error) {
    logger.error('Failed to create incident', { error });
    return { success: false, error: 'Erro interno. Tente novamente em instantes.' };
  }
}
```

### 9.3 Error Boundaries

```typescript
// CORRETO: Error Boundary para cada seção crítica
// app/(dashboard)/incidents/error.tsx
'use client';

export default function IncidentsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Incidents page error', { error: error.message });
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h2 className="text-lg font-semibold">Erro ao carregar incidentes</h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
```

### 9.4 Mensagens de Erro ao Usuário

- **Nunca expor:** stack traces, mensagens de banco (ex.: "duplicate key violates..."), nomes de tabelas, código interno.
- **Sempre mostrar:** mensagem genérica amigável + código de referência para suporte (correlation ID).
- **Erros de validação:** detalhe suficiente para o usuário corrigir o campo.

---

## 10. Logs

### 10.1 Estrutura de Log

```typescript
// lib/logger.ts
interface LogPayload {
  message: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  service: 'sgti-frontend';
  version: string;
  env: string;
  correlationId?: string;
  userId?: string;
  tenantId?: string;
  module?: string;
  action?: string;
  duration?: number;
  error?: { message: string; code?: string; stack?: string };
  [key: string]: unknown;
}

function log(level: LogPayload['level'], message: string, context?: Partial<LogPayload>) {
  const payload: LogPayload = {
    timestamp: new Date().toISOString(),
    level,
    service: 'sgti-frontend',
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? 'unknown',
    env: process.env.NEXT_PUBLIC_APP_ENV ?? 'development',
    message,
    ...context,
  };
  console[level](JSON.stringify(payload));
}

export const logger = {
  debug: (msg: string, ctx?: Partial<LogPayload>) => log('debug', msg, ctx),
  info:  (msg: string, ctx?: Partial<LogPayload>) => log('info', msg, ctx),
  warn:  (msg: string, ctx?: Partial<LogPayload>) => log('warn', msg, ctx),
  error: (msg: string, ctx?: Partial<LogPayload>) => log('error', msg, ctx),
};
```

### 10.2 Regras de Logging

| Nivel | Quando Usar | Exemplos |
|:-----:|:------------|---------|
| `debug` | Detalhes de desenvolvimento; desabilitado em produção | Query SQL, payloads de API |
| `info` | Operações normais de negócio | Incidente criado, usuário logado, sync executado |
| `warn` | Situações anômalas não críticas | Fallback para polling, token próximo de expirar |
| `error` | Falhas que precisam de atenção | Falha de banco, integração offline, exception não tratada |

**Proibido em logs:** senhas, tokens, chaves de API, CPF completo, dados bancários, conteúdo de evidências.

### 10.3 Logs Críticos no Supabase

Dado que Vercel Runtime Logs têm retenção de apenas 1 hora no plano Hobby, logs críticos de negócio são gravados diretamente no banco:

```typescript
// Logs críticos SEMPRE no banco (além do console)
async function logCriticalEvent(event: AuditEvent) {
  await supabaseAdmin.from('audit_log').insert({
    tenant_id: event.tenantId,
    user_id: event.userId,
    action: event.action,
    resource_type: event.resourceType,
    resource_id: event.resourceId,
    old_values: event.oldValues,
    new_values: event.newValues,
    ip_address: event.ipAddress,
    correlation_id: event.correlationId,
    created_at: new Date().toISOString(),
  });
}
```

---

## 11. Observabilidade

### 11.1 Correlation ID

Todo request ao SGTI deve ter um Correlation ID propagado por toda a cadeia:

```typescript
// middleware.ts — Geração do Correlation ID
const correlationId = request.headers.get('X-Correlation-ID') ?? crypto.randomUUID();
const response = NextResponse.next();
response.headers.set('X-Correlation-ID', correlationId);

// Propagação nos logs
logger.info('Request received', { correlationId, path: request.nextUrl.pathname });

// Propagação no audit_log
await logAuditEvent({ ...event, correlationId });
```

### 11.2 Métricas de Performance

```typescript
// Medir duração de operações críticas
async function withTiming<T>(
  operationName: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    logger.info(`${operationName} completed`, {
      duration: Math.round(performance.now() - start),
    });
    return result;
  } catch (error) {
    logger.error(`${operationName} failed`, {
      duration: Math.round(performance.now() - start),
      error: { message: error instanceof Error ? error.message : 'Unknown' },
    });
    throw error;
  }
}
```

### 11.3 Health Check

O endpoint `/api/health` e `/api/health/db` são mantidos sempre funcionais e monitorados externamente (UptimeRobot + Cloudflare).

---

## 12. Testes

### 12.1 Ferramentas

| Ferramenta | Uso |
|:----------:|:----|
| **Jest** | Test runner principal |
| **React Testing Library** | Testes de componentes React |
| **@testing-library/user-event** | Simulação de interação do usuário |
| **MSW (Mock Service Worker)** | Mock de chamadas à API/Supabase |
| **Zod** | Validação em testes de schemas |

### 12.2 Cobertura Mínima

| Categoria | Cobertura Mínima |
|:---------:|:----------------:|
| Lógica de negócio (utils, calculations) | 90% |
| Server Actions | 80% |
| Componentes críticos (forms, tables) | 70% |
| Hooks customizados | 80% |
| Route Handlers | 70% |
| **Total do projeto** | **70%** |

### 12.3 Convenções de Teste

```typescript
// ESTRUTURA: describe → context → it
describe('createIncidentAction', () => {
  describe('when user is not authenticated', () => {
    it('should return authentication error', async () => {
      mockGetUser.mockResolvedValue(null);
      const result = await createIncidentAction(new FormData());
      expect(result.success).toBe(false);
      expect(result.error).toContain('autenticado');
    });
  });

  describe('when data is invalid', () => {
    it('should return validation errors for missing title', async () => {
      const formData = new FormData();
      formData.set('priority', 'HIGH');
      const result = await createIncidentAction(formData);
      expect(result.success).toBe(false);
      expect(result.fieldErrors?.title).toBeDefined();
    });
  });

  describe('when data is valid', () => {
    it('should create incident and return id', async () => {
      // arrange
      const formData = buildValidIncidentFormData();
      // act
      const result = await createIncidentAction(formData);
      // assert
      expect(result.success).toBe(true);
      expect(result.data?.id).toMatch(uuidRegex);
    });
  });
});
```

### 12.4 Prioridades de Teste

1. Cálculos de SLA e KPIs (lógica crítica de negócio).
2. Validação de formulários (schemas Zod).
3. Server Actions (fluxos de criação e atualização).
4. Verificação de permissões RBAC.
5. Componentes com lógica de estado complexa.

---

## 13. Git Flow

### 13.1 Branches

```
main (produção)
  |
  staging (homologação)
    |
    develop (integração)
      |
      feature/{id}-{descricao-kebab}  # Nova funcionalidade
      fix/{id}-{descricao-kebab}      # Correção de bug
      hotfix/{descricao-kebab}        # Correção urgente de produção
      chore/{descricao-kebab}         # Manutenção, deps, config
      docs/{descricao-kebab}          # Apenas documentação
      refactor/{descricao-kebab}      # Refatoração sem mudança de comportamento
```

### 13.2 Regras de Branch

- Feature branches têm vida máxima de **5 dias úteis**.
- Nunca commitar diretamente em `main`, `staging` ou `develop`.
- Branch deve ser deletada após o merge.
- Nomenclatura: `feature/42-incident-email-notification`.

---

## 14. Commits

### 14.1 Conventional Commits (obrigatório)

```
Formato: <tipo>(<escopo>): <descrição>

<corpo opcional>

<rodapé opcional>

TIPOS:
  feat:     Nova funcionalidade
  fix:      Correção de bug
  docs:     Apenas documentação
  style:    Formatação (sem mudança de lógica)
  refactor: Refatoração (sem nova feature ou fix)
  perf:     Melhoria de performance
  test:     Adição ou correção de testes
  chore:    Manutenção, dependências, configuração
  ci:       Mudanças no pipeline CI/CD
  revert:   Reverter commit anterior

ESCOPO (opcional): incidents, compliance, assets, auth, db, ui, api

EXEMPLOS CORRETOS:
  feat(incidents): add SLA countdown timer to incident card
  fix(compliance): prevent duplicate finding creation on double submit
  chore(deps): update supabase-js to v2.45.0
  feat(auth): restrict login to corporate domain via hd parameter
  fix(db): add missing index on ticket.Ticket(assignee_id)
  docs: update deployment guide with Cloudflare configuration

BREAKING CHANGE:
  feat!: redesign ticket API response format

  BREAKING CHANGE: The ticket API now returns camelCase fields.
  Old: { created_at: '...' } New: { createdAt: '...' }
```

### 14.2 Regras de Commit

- Commits em inglês obrigatoriamente.
- Descrição no imperativo presente: "add", não "added" ou "adds".
- Máximo de 72 caracteres na primeira linha.
- Um commit = uma mudança lógica.
- Não commitar código comentado, console.log de debug, arquivos .env.

---

## 15. Pull Requests

### 15.1 Template Obrigatório

```markdown
## Descrição
Breve descrição do que foi implementado ou corrigido.

## Tipo de Mudança
- [ ] Nova funcionalidade (feat)
- [ ] Correção de bug (fix)
- [ ] Hotfix de produção
- [ ] Refatoração (sem mudança de comportamento)
- [ ] Atualização de dependência
- [ ] Migração de banco de dados

## Issue Relacionada
Closes #NUMERO_DA_ISSUE

## Checklist
- [ ] Código passa no lint (npm run lint)
- [ ] Código passa no typecheck (npm run typecheck)
- [ ] Testes adicionados ou atualizados
- [ ] Testes passando localmente (npm test)
- [ ] Migration testada localmente (se aplicável)
- [ ] Variáveis de ambiente novas documentadas no .env.example
- [ ] Sem secrets ou credenciais no código
- [ ] Sem console.log de debug

## Como Testar
1. Passo 1...
2. Passo 2...

## Screenshots (se mudança visual)
Antes / Depois

## Impacto em Produção
Migrações de banco? Zero-downtime? Rollback possível?
```

### 15.2 Regras de PR

- PR não pode ter mais de **500 linhas alteradas** sem justificativa aprovada.
- PR com migration de banco deve ter label `migration` e CODEOWNER obrigatório.
- PR deve ter pelo menos 1 aprovação para `develop` e `staging`, e 2 para `main`.
- Autor não pode aprovar o próprio PR.
- PR deve estar atualizado com a branch de destino antes do merge.
- Squash merge obrigatório para `main` e `staging`.

---

## 16. Code Review

### 16.1 Responsabilidades do Reviewer

| Area | O que Verificar |
|:----:|:---------------|
| **Corretude** | O código faz o que descreve? Existem bugs? Edge cases tratados? |
| **Segurança** | Dados sensíveis expostos? RBAC verificado? Input validado? |
| **Migrations** | São reversíveis? Impacto em dados existentes? Lock de tabela? |
| **Performance** | Queries N+1? Índices necessários? Bundle size aceitável? |
| **Testes** | Cobertura adequada? Casos de borda testados? |
| **Padrões** | Segue este documento? Nomenclatura correta? Estrutura adequada? |
| **Documentação** | Código complexo comentado? Tipos auto-documentáveis? |

### 16.2 Como Dar Feedback

```
Usar prefixos para clareza:
  BLOCKER:    Deve ser corrigido antes do merge
  SUGGESTION: Sugestão, autor decide
  QUESTION:   Dúvida genuína (não bloqueia)
  NITPICK:    Detalhe menor (prefixo NIT:)
  PRAISE:     Reconhecer bom trabalho

EXEMPLOS:
  BLOCKER: Este handler não verifica a autorização RBAC. O usuário pode
           modificar tickets de outros tenants.

  SUGGESTION: Considerar extrair esta lógica para um hook useIncidentStatus
              para facilitar o reuso.

  QUESTION: Por que usamos useMemo aqui? Há evidência de que
            o recálculo é custoso?

  NIT: "usr" → "user" (evitar abreviações)
```

### 16.3 Regras de Code Review

- Primeira revisão em até **24 horas** após PR aberto.
- Feedback construtivo e específico (nunca "ruim" sem explicação).
- Aprovação implica co-responsabilidade pelo código em produção.
- Reviewer não pode aprovar PR próprio.
- Comments `BLOCKER` devem ser resolvidos antes do merge.
- Self-review obrigatório antes de solicitar revisão.

---

## 17. Performance

### 17.1 Web Vitals — Metas

| Metrica | Meta | Critico |
|:-------:|:----:|:-------:|
| LCP (Largest Contentful Paint) | ≤ 2,5s | > 4,0s |
| INP (Interaction to Next Paint) | ≤ 200ms | > 500ms |
| CLS (Cumulative Layout Shift) | ≤ 0,1 | > 0,25 |
| TTFB (Time to First Byte) | ≤ 600ms | > 1.800ms |
| FCP (First Contentful Paint) | ≤ 1,8s | > 3,0s |

### 17.2 Regras de Performance

```typescript
// REGRA: Lazy loading de componentes pesados
const ComplianceScoreChart = dynamic(
  () => import('@/components/compliance/compliance-score-chart'),
  { loading: () => <ChartSkeleton />, ssr: false }
);

// REGRA: Images com next/image sempre
// ERRADO: <img src="/logo.png" />
// CORRETO:
<Image src="/logo.png" alt="SGTI Logo" width={120} height={40} priority />

// REGRA: Fonts com next/font
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], display: 'swap' });

// REGRA: Paginação obrigatória em todas as listagens
const PAGE_SIZE = 25;
const { data } = await supabase
  .from('Ticket')
  .select('*')
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

// REGRA: Select específico — proibido select('*') desnecessário
// ERRADO:
const { data } = await supabase.from('Ticket').select('*');
// CORRETO:
const { data } = await supabase.from('Ticket').select('id, title, status, priority');
```

### 17.3 Bundle Size

- Analisar bundle com `npm run build` e verificar output.
- Nenhuma dependência nova sem avaliação de impacto no bundle.
- Preferir tree-shaking: importar `{ format }` de `date-fns` ao invés de `import * as dateFns`.
- Lodash proibido — usar funções nativas JS modernas ou importações específicas.

---

## 18. Acessibilidade

### 18.1 Padrão WCAG 2.1 Nível AA

O SGTI segue o padrão **WCAG 2.1 nível AA** para acessibilidade.

### 18.2 Regras de Acessibilidade

```tsx
// REGRA: Imagens com alt descritivo
<Image src={avatarUrl} alt={`Avatar de ${user.displayName}`} />
<Image src="/logo.png" alt="" role="presentation" />  // Decorativa: alt vazio

// REGRA: Botões e links com texto acessível
// ERRADO:
<Button onClick={handleDelete}>
  <TrashIcon />
</Button>
// CORRETO:
<Button onClick={handleDelete} aria-label="Excluir incidente">
  <TrashIcon aria-hidden="true" />
</Button>

// REGRA: Form labels associadas
<Label htmlFor="title">Título do Incidente</Label>
<Input id="title" name="title" aria-describedby="title-error" />
{errors.title && <p id="title-error" role="alert">{errors.title}</p>}

// REGRA: Indicar estado de loading
<Button disabled={isLoading} aria-busy={isLoading}>
  {isLoading ? 'Salvando...' : 'Salvar'}
</Button>

// REGRA: Foco visível em todos os elementos interativos
// Tailwind: outline-none PROIBIDO sem alternativa; usar focus-visible:ring-2

// REGRA: Contraste de cores mínimo 4.5:1 para texto normal, 3:1 para texto grande
// Verificar com ferramentas: WebAIM Contrast Checker
```

### 18.3 Componentes shadcn/ui e Acessibilidade

Os componentes do `shadcn/ui` são baseados em Radix UI, que tem suporte nativo a acessibilidade. Usar sem modificar comportamentos de ARIA sem necessidade comprovada.

---

## 19. Responsividade

### 19.1 Breakpoints Tailwind (padrão do projeto)

| Prefixo | Breakpoint | Dispositivo |
|:-------:|:----------:|:----------:|
| (nenhum) | < 640px | Mobile (320px–639px) |
| `sm:` | 640px | Mobile grande / Tablet pequeno |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Desktop pequeno / Laptop |
| `xl:` | 1280px | Desktop (target principal do SGTI) |
| `2xl:` | 1536px | Desktop grande |

### 19.2 Abordagem Mobile-First

O SGTI é otimizado para **desktop (≥ 1280px)**, mas deve ser funcional em tablet (≥ 768px). Em mobile (< 768px), exibe versão simplificada.

```tsx
// CORRETO: Mobile-first com escalada para desktop
<div className="
  flex flex-col         // Mobile: vertical
  md:flex-row           // Tablet+: horizontal
  gap-4
">

// CORRETO: Grid responsivo
<div className="
  grid grid-cols-1      // Mobile: 1 coluna
  sm:grid-cols-2        // Tablet: 2 colunas
  xl:grid-cols-4        // Desktop: 4 colunas
  gap-4
">

// Sidebar oculta em mobile, visível em desktop
<aside className="hidden lg:flex lg:flex-col lg:w-64" />
<nav className="flex lg:hidden" />  // Mobile nav
```

### 19.3 Regras de Responsividade

- Nenhum valor fixo de largura em pixels para containers — usar classes Tailwind responsivas.
- Tabelas em mobile: usar card layout ao invés de tabela horizontal.
- Formulários longos em mobile: uma coluna por padrão.
- Touch targets mínimos: 44×44px para elementos clicáveis em mobile.

---

## 20. Critérios de Qualidade

### 20.1 Critérios de Aceite de Código (Definition of Done)

Todo item de desenvolvimento é considerado **pronto** apenas quando:

| Critério | Verificação |
|:--------:|:------------|
| **Funcional** | Feature funciona conforme especificação e casos de borda tratados |
| **Lint** | `npm run lint` sem erros ou warnings |
| **TypeCheck** | `npm run typecheck` sem erros |
| **Testes** | `npm test` passando; cobertura mínima atingida |
| **Build** | `npm run build` sem erros |
| **Revisão** | PR aprovado pelos reviewers obrigatórios |
| **Acessibilidade** | Navegação por teclado funcional; labels corretas |
| **Responsivo** | Funcional em desktop (1280px+) e tablet (768px+) |
| **Segurança** | RBAC verificado; input validado; nenhum secret no código |
| **Performance** | Nenhuma query N+1 introduzida; bundle não aumentou desproporcionalmente |
| **Auditável** | Operações sensíveis registradas em shared.audit_log |

### 20.2 Métricas de Qualidade Contínua

| Metrica | Meta | Fonte |
|:-------:|:----:|:-----:|
| Cobertura de testes | ≥ 70% geral; ≥ 90% lógica de negócio | Jest Coverage |
| TypeScript errors | 0 | `tsc --noEmit` |
| ESLint errors | 0 | ESLint |
| ESLint warnings | ≤ 5 | ESLint |
| LCP produção | ≤ 2,5s | Vercel Analytics |
| Build time | ≤ 3 minutos | GitHub Actions |
| Bundle size (JS inicial) | ≤ 500 KB (gzipped) | `next build` output |

---

## 21. Checklist de Desenvolvimento

### 21.1 Antes de Começar a Codar

- [ ] Issue existe e está detalhada com critérios de aceite?
- [ ] Branch criada a partir de `develop` com nomenclatura correta?
- [ ] `.env.local` atualizado com variáveis necessárias?
- [ ] Dependências instaladas (`npm install`)?
- [ ] Banco local sincronizado (`supabase db push`)?

### 21.2 Durante o Desenvolvimento

- [ ] Seguindo as convenções de nomenclatura (seção 1)?
- [ ] Componentes na estrutura de diretório correta (seção 2)?
- [ ] Tipos declarados — sem `any` sem justificativa?
- [ ] Server Components por padrão; `'use client'` apenas quando necessário?
- [ ] Server Actions com validação Zod e verificação de RBAC?
- [ ] Queries Supabase com filtro de `tenant_id` em admin client?
- [ ] Tratamento de erro em todas as operações assíncronas?
- [ ] Logs com nível adequado — sem dados sensíveis?
- [ ] Subscription Realtime com cleanup no `useEffect`?
- [ ] Imagens usando `next/image`?
- [ ] Formulários com `<Label>` associada, `aria-describedby` para erros?

### 21.3 Antes de Abrir o PR

- [ ] `npm run lint` — zero erros?
- [ ] `npm run typecheck` — zero erros?
- [ ] `npm test` — todos os testes passando?
- [ ] `npm run build` — build sem erros?
- [ ] Cobertura de testes adequada para o código novo?
- [ ] Migration testada localmente (se houver)?
- [ ] `.env.example` atualizado com variáveis novas?
- [ ] Self-review do diff completo realizado?
- [ ] Nenhum `console.log`, código comentado ou TODO sem issue?
- [ ] PR template preenchido completamente?
- [ ] Labels adequadas no PR (migration, feature, fix, etc.)?

---

## 22. Checklist de Deploy

### 22.1 Antes do Deploy em Staging

- [ ] Todos os testes passando na branch?
- [ ] PR aprovado pelo reviewer obrigatório?
- [ ] Migration testada em homologação?
- [ ] Variáveis de ambiente de staging atualizadas no Vercel?
- [ ] Feature flags de staging configuradas (se aplicável)?

### 22.2 Antes do Deploy em Produção

- [ ] Deploy em staging funcionou sem erros?
- [ ] QA realizou testes funcionais em staging?
- [ ] IT_MANAGER aprovou (especialmente se há migration)?
- [ ] Rollback planejado (Vercel Instant Rollback disponível)?
- [ ] Comunicado de release preparado (se mudança significativa)?
- [ ] Backup manual realizado antes de migration destrutiva?
- [ ] Horário de deploy dentro do horário comercial (exceto hotfix)?

### 22.3 Após o Deploy em Produção

- [ ] Smoke tests passando (verificar `/api/health` e `/api/health/db`)?
- [ ] Versão exibida no rodapé da aplicação corresponde ao deploy?
- [ ] Logs de produção sem erros críticos (primeiros 5 minutos)?
- [ ] Métricas Vercel Analytics normais?
- [ ] Notificação de deploy enviada ao IT_MANAGER?
- [ ] GitHub Release criado com changelog?

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descricao |
|--------|------|-------|-----------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação com 22 seções cobrindo todos os padrões de desenvolvimento do SGTI |

---

> **Documentos relacionados:**
> [`70_DEPLOYMENT.md`](./70_DEPLOYMENT.md) — Estratégia de deploy e ambientes
> [`71_SUPABASE.md`](./71_SUPABASE.md) — Arquitetura Supabase
> [`72_GITHUB_ACTIONS.md`](./72_GITHUB_ACTIONS.md) — Pipelines CI/CD
> [`73_VERCEL.md`](./73_VERCEL.md) — Hospedagem Vercel
