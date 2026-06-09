# SGTI — Regras Permanentes do Projeto para Claude Code

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Vigente
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Escopo:** Este documento é lido automaticamente pelo Claude Code em toda sessão. Suas diretrizes têm caráter obrigatório e se sobrepõem a qualquer instrução ad hoc que contrarie os princípios aqui definidos.

---

## Sumário

1. [Objetivo do Projeto](#1-objetivo-do-projeto)
2. [Princípio Fundamental](#2-princípio-fundamental)
3. [Stack Tecnológica Obrigatória](#3-stack-tecnológica-obrigatória)
4. [Diretrizes de Arquitetura](#4-diretrizes-de-arquitetura)
5. [Domain-Driven Design (DDD)](#5-domain-driven-design-ddd)
6. [Clean Architecture](#6-clean-architecture)
7. [Princípios SOLID](#7-princípios-solid)
8. [Padrões de Código](#8-padrões-de-código)
9. [Estratégia de Testes](#9-estratégia-de-testes)
10. [Estratégia de CI/CD](#10-estratégia-de-cicd)
11. [Estratégia de Deploy](#11-estratégia-de-deploy)
12. [Política de Uso de Soluções Gratuitas](#12-política-de-uso-de-soluções-gratuitas)
13. [Restrições Obrigatórias](#13-restrições-obrigatórias)
14. [Referências da Documentação](#14-referências-da-documentação)

---

## 1. Objetivo do Projeto

O **SGTI (Sistema de Gestão de Tecnologia da Informação)** é uma plataforma corporativa unificada que centraliza, automatiza e governa os processos de TI da organização, fundamentada no framework **ITIL v4**.

**Módulos do sistema:**

| Módulo | Responsabilidade |
|--------|-----------------|
| Gestão de Incidentes | Ciclo completo de interrupções não planejadas de serviço |
| Gestão de Requisições | Atendimento de solicitações previstas no Catálogo de Serviços |
| Gestão de Problemas | Investigação de causa raiz, KEDB e workarounds |
| Gestão de Ativos (ITAM) | Ciclo de vida de hardware, software e licenças |
| Gestão de Identidades (IAM) | Provisionamento, revisão e revogação de acessos |
| Compliance | Políticas, controles, auditorias e não-conformidades |
| OPEX e CAPEX | Orçamento, contratos e controle financeiro de TI |
| Projetos de TI | Escopo, cronograma, custo e rastreabilidade de entregas |
| Compras de TI | Requisições, fornecedores, aprovações e contratos |
| Base de Conhecimento | Artigos, FAQs e soluções vinculadas a chamados |
| Catálogo de Serviços | Serviços publicados com SLAs e canais de solicitação |
| SLA | Definição, monitoramento e reporte de níveis de serviço |
| Dashboards Executivos | KPIs estratégicos para alta direção |
| Dashboards Operacionais | Filas, alertas e performance para técnicos e gestores |

**Integrações obrigatórias:** Google Workspace, GLPI, e-mail (`implantacao@pinpag.com.br`), Supabase, GitHub e Vercel.

**Documentação de referência:** `Docs/00_PROJECT_CONTEXT.md`

---

## 2. Princípio Fundamental

> **A documentação precede o código.**

Nenhum artefato de código deve ser criado sem que o documento correspondente esteja com status `Aprovado para Desenvolvimento`. O Claude Code implementa o que está documentado — não define o que será implementado.

**Antes de qualquer implementação, o Claude Code deve:**

1. Verificar se existe documento aprovado para o módulo ou funcionalidade solicitada em `Docs/`.
2. Ler o documento correspondente na íntegra antes de escrever qualquer linha de código.
3. Sinalizar explicitamente se a tarefa solicitada contradiz ou extrapola a documentação aprovada.
4. Nunca assumir decisões de negócio ou arquitetura não documentadas — solicitar esclarecimento ao desenvolvedor responsável.

---

## 3. Stack Tecnológica Obrigatória

A stack abaixo é **definitiva e imutável** para este projeto. O Claude Code não deve sugerir, adotar ou introduzir tecnologias alternativas sem aprovação explícita do Arquiteto Responsável registrada em `Docs/`.

### 3.1 Frontend

| Tecnologia | Versão | Finalidade |
|------------|--------|------------|
| **Next.js** | 14+ (App Router) | Framework React com SSR/SSG/ISR e roteamento por pastas |
| **TypeScript** | 5+ | Tipagem estática obrigatória em todo o frontend |
| **Tailwind CSS** | 3+ | Estilização utilitária — sem CSS-in-JS, sem CSS Modules |
| **shadcn/ui** | Latest | Biblioteca de componentes — preferir sempre antes de criar componentes customizados |

**Regras do Frontend:**
- Usar **App Router** do Next.js — o Pages Router não deve ser utilizado em código novo.
- Componentes de servidor (`Server Components`) são o padrão — `'use client'` apenas quando estritamente necessário (interatividade, hooks de estado, eventos de browser).
- Nunca usar `any` no TypeScript. Tipagem explícita e rigorosa em todo o código.
- Estilização exclusivamente via classes Tailwind — proibido `style={{}}` inline, exceto para valores dinâmicos impossíveis de expressar em Tailwind.
- Componentes do shadcn/ui devem ser instalados via CLI (`npx shadcn-ui@latest add [componente]`), nunca copiados manualmente.
- Toda interface de usuário deve ser responsiva por padrão (mobile-first com Tailwind).

### 3.2 Backend

| Tecnologia | Versão | Finalidade |
|------------|--------|------------|
| **NestJS** | 10+ | Framework Node.js estruturado para o backend |
| **TypeScript** | 5+ | Tipagem estática obrigatória em todo o backend |
| **Prisma ORM** | 5+ | Acesso ao banco de dados — único ORM permitido |

**Regras do Backend:**
- Módulos NestJS devem mapear 1:1 com os bounded contexts do DDD definidos em `Docs/Arquitetura/02_DOMAIN_MODEL.md`.
- Nunca usar Prisma Client diretamente em camadas de domínio ou aplicação — apenas na camada de infraestrutura via repositórios.
- Controllers NestJS devem ser finos: sem lógica de negócio, apenas orquestração de entrada/saída.
- Toda validação de entrada deve usar `class-validator` com DTOs tipados.
- Respostas de API devem seguir o padrão definido em `Docs/Arquitetura/01_ARCHITECTURE_OVERVIEW.md`.

### 3.3 Banco de Dados

| Tecnologia | Finalidade |
|------------|------------|
| **Supabase PostgreSQL** | Banco de dados principal — todos os módulos |
| **Prisma Migrations** | Controle de versão do schema — único mecanismo permitido |
| **Supabase RLS** | Row Level Security habilitado para todos os recursos com dados sensíveis |

**Regras do Banco de Dados:**
- O schema do banco é definido exclusivamente via `schema.prisma` — proibido DDL manual no Supabase Studio em ambiente de produção.
- Toda migration deve ter nome descritivo no formato: `YYYYMMDD_descricao_da_mudanca`.
- Migrations destrutivas (DROP, TRUNCATE, remoção de colunas) exigem aprovação do Arquiteto e registro de mudança no SGTI antes de execução em produção.
- RLS deve ser habilitado para todas as tabelas que contenham dados pessoais (PII) ou dados de auditoria.
- Índices devem ser criados via Prisma schema — nunca diretamente no banco sem registro no schema.

### 3.4 Storage

| Tecnologia | Finalidade |
|------------|------------|
| **Supabase Storage** | Armazenamento de anexos, evidências de compliance e documentos |

**Regras de Storage:**
- Buckets organizados por módulo: `incidents/`, `compliance/`, `assets/`, `knowledge/`, `projects/`.
- Políticas de acesso (RLS) devem ser configuradas por bucket — sem buckets públicos para dados sensíveis.
- Tamanho máximo de arquivo por upload: 50MB (configurável por bucket conforme necessidade do módulo).
- Nomes de arquivo devem seguir o padrão: `{modulo}/{entidade_id}/{timestamp}_{nome_original_sanitizado}`.

### 3.5 Infraestrutura

| Tecnologia | Finalidade |
|------------|------------|
| **Vercel** | Hospedagem e entrega contínua do frontend Next.js |
| **Cloudflare** | DNS, CDN, proteção DDoS e proxy reverso |

**Regras de Infraestrutura:**
- O frontend Next.js é hospedado **exclusivamente** na Vercel — sem containerização do frontend.
- O backend NestJS pode ser hospedado via Vercel Serverless Functions ou container dedicado, conforme definido em `Docs/Operação/21_DEPLOYMENT_GUIDE.md`.
- Todo domínio e subdomínio deve ter DNS gerenciado pelo Cloudflare.
- Variáveis de ambiente de produção são gerenciadas exclusivamente via Vercel Environment Variables e Supabase Vault — nunca em arquivos `.env` commitados.
- Arquivos `.env.local` e `.env.production` devem estar no `.gitignore` — sem exceções.

---

## 4. Diretrizes de Arquitetura

### 4.1 Visão Geral

O SGTI adota uma arquitetura em camadas baseada em **Clean Architecture** com organização de domínio por **DDD**. A separação de responsabilidades é a diretriz central: cada camada conhece apenas a camada imediatamente interior a ela.

```
┌─────────────────────────────────────────────────────────┐
│                   Interface (UI / API)                  │  ← Next.js / NestJS Controllers
├─────────────────────────────────────────────────────────┤
│                 Application (Use Cases)                 │  ← NestJS Services / Use Cases
├─────────────────────────────────────────────────────────┤
│                Domain (Entities / Rules)                │  ← Entidades, Value Objects, Domain Services
├─────────────────────────────────────────────────────────┤
│              Infrastructure (DB / APIs / IO)            │  ← Prisma, HTTP Clients, Supabase
└─────────────────────────────────────────────────────────┘
         Dependências apontam sempre para dentro →
```

### 4.2 Estrutura de Pastas do Projeto

```
sgti/
├── apps/
│   ├── web/                          # Next.js frontend
│   │   ├── app/                      # App Router
│   │   │   ├── (auth)/               # Grupo de rotas autenticadas
│   │   │   ├── (public)/             # Grupo de rotas públicas
│   │   │   └── api/                  # Route Handlers (BFF)
│   │   ├── components/
│   │   │   ├── ui/                   # Componentes shadcn/ui instalados
│   │   │   └── [modulo]/             # Componentes específicos por módulo
│   │   └── lib/                      # Utilitários, hooks, tipos compartilhados
│   │
│   └── api/                          # NestJS backend
│       └── src/
│           ├── modules/              # Um módulo NestJS por bounded context
│           │   └── [modulo]/
│           │       ├── domain/       # Entidades, VOs, interfaces de repositório
│           │       ├── application/  # Use cases, DTOs, ports
│           │       ├── infrastructure/  # Repositórios Prisma, HTTP clients
│           │       └── presentation/    # Controllers, Guards, Pipes
│           ├── shared/               # Kernel compartilhado (cross-cutting concerns)
│           └── main.ts
│
├── packages/
│   ├── database/                     # Prisma schema, migrations, seed
│   └── shared-types/                 # Tipos TypeScript compartilhados entre apps
│
└── Docs/                             # Toda a documentação do projeto
```

### 4.3 Regras de Dependência

As regras de dependência são **invioláveis**:

- **Domínio** não importa nada de Application, Infrastructure ou Interface.
- **Application** importa apenas Domain — nunca Infrastructure ou Interface diretamente.
- **Infrastructure** implementa interfaces definidas no Domain — nunca define regras de negócio.
- **Interface (Controllers/Pages)** importa Application — nunca Domain diretamente, exceto tipos.
- **Shared** (kernel) pode ser importado por qualquer camada, mas não importa nenhuma delas.

---

## 5. Domain-Driven Design (DDD)

### 5.1 Bounded Contexts

Cada módulo do SGTI é um bounded context independente com linguagem ubíqua própria. Os contextos se comunicam via eventos de domínio ou contratos de interface explícitos — nunca por acesso direto aos repositórios de outro contexto.

| Bounded Context | Módulo SGTI | Namespace |
|-----------------|-------------|-----------|
| `IncidentManagement` | Gestão de Incidentes | `incident` |
| `RequestManagement` | Gestão de Requisições | `request` |
| `ProblemManagement` | Gestão de Problemas | `problem` |
| `AssetManagement` | Gestão de Ativos | `asset` |
| `IdentityManagement` | Gestão de Identidades | `identity` |
| `ComplianceManagement` | Compliance | `compliance` |
| `FinancialManagement` | OPEX e CAPEX | `financial` |
| `ProjectManagement` | Projetos de TI | `project` |
| `ProcurementManagement` | Compras de TI | `procurement` |
| `KnowledgeManagement` | Base de Conhecimento | `knowledge` |
| `ServiceCatalog` | Catálogo de Serviços | `catalog` |
| `SlaManagement` | SLA | `sla` |
| `Notification` | Notificações (shared) | `notification` |
| `AuditLog` | Log de Auditoria (shared) | `audit` |

### 5.2 Blocos Táticos Obrigatórios

**Entidades**
- Possuem identidade única e imutável (ID).
- Estado mutável ao longo do ciclo de vida.
- Nomeadas com substantivos do domínio: `Incident`, `Asset`, `ServiceRequest`, `KnownError`.
- Nunca expõem seus campos diretamente — apenas via métodos de comportamento.

```
// Padrão correto: comportamento no domínio
incident.escalate(reason: string): void
incident.resolve(solution: string, knowledgeArticleId?: string): void
incident.reopen(justification: string): void

// Proibido: setters diretos expondo estado interno
incident.setStatus('resolved')  ← NUNCA
```

**Value Objects**
- Sem identidade própria — definidos pelos seus atributos.
- Imutáveis por definição.
- Exemplos: `Priority`, `SlaDefinition`, `EmailAddress`, `AssetTag`, `IpAddress`, `MoneyAmount`.
- Validação ocorre no construtor — objetos inválidos nunca são instanciados.

**Agregados**
- Cada agregado tem uma raiz (*Aggregate Root*) que controla o acesso aos seus membros.
- Transações de banco de dados nunca cruzam fronteiras de agregado.
- Repositórios existem apenas para raízes de agregado — nunca para entidades internas.
- Exemplos de raízes: `Incident`, `Asset`, `ServiceRequest`, `ComplianceControl`, `Project`.

**Repositórios**
- Interfaces definidas na camada de domínio.
- Implementações na camada de infraestrutura (Prisma).
- Nomenclatura: `I[Entidade]Repository` (interface) e `Prisma[Entidade]Repository` (implementação).
- Métodos com nomes do domínio: `findOpenByAssignee()`, `findOverdueBySla()` — nunca `findAll({ where: { status: 'open' } })` exposto diretamente.

**Eventos de Domínio**
- Nomeados no passado: `IncidentOpened`, `AssetDecommissioned`, `AccessRevoked`, `SlaBreached`.
- Publicados pela raiz do agregado após mudança de estado.
- Consumidos por outros bounded contexts via event bus interno.
- Toda ação com efeitos colaterais em outros módulos deve usar eventos — nunca chamadas diretas entre módulos.

**Domain Services**
- Usados apenas para lógica de negócio que não pertence naturalmente a nenhuma entidade.
- Exemplos: `SlaCalculationService`, `PriorityMatrixService`, `AccessProvisioningService`.
- Stateless — não mantêm estado entre chamadas.

### 5.3 Linguagem Ubíqua

O código deve refletir exatamente a linguagem do domínio definida na documentação. Proibido:
- Nomear entidades com termos técnicos: `UserTicket`, `DbAsset`, `ApiRequest`.
- Usar abreviações que obscurecem o significado: `Inc`, `Req`, `Usr`.
- Traduzir termos do domínio para inglês de forma inconsistente com o glossário do módulo.

A linguagem ubíqua de cada módulo é definida em seu documento correspondente em `Docs/Módulos/`.

---

## 6. Clean Architecture

### 6.1 Camada de Domínio

**Contém:** Entidades, Value Objects, Agregados, Interfaces de Repositório, Eventos de Domínio, Domain Services, Exceções de Domínio.

**Regras:**
- Zero dependências de frameworks, bibliotecas de infraestrutura ou outros módulos.
- Sem imports de NestJS, Prisma, Supabase ou qualquer biblioteca externa.
- Testável de forma completamente isolada, sem mocks de infraestrutura.
- Exceções de domínio são classes próprias — nunca `Error` genérico: `IncidentAlreadyResolvedException`, `SlaBreachedException`.

### 6.2 Camada de Aplicação

**Contém:** Use Cases, DTOs de entrada/saída, Interfaces de Ports (para serviços externos), Orquestração de eventos.

**Regras:**
- Um Use Case por arquivo, com responsabilidade única e nome que descreve a ação: `OpenIncidentUseCase`, `ProvisionUserAccessUseCase`.
- Use Cases recebem DTOs de entrada e retornam DTOs de saída — nunca entidades de domínio diretamente para a camada de interface.
- Ports (interfaces para serviços externos como e-mail, Google Workspace) são definidos aqui — implementados na infraestrutura.
- Sem lógica de apresentação (formatação, serialização) nesta camada.

### 6.3 Camada de Infraestrutura

**Contém:** Implementações de repositório (Prisma), implementações de ports (Google Workspace Client, GLPI Client, SMTP), configuração de banco de dados.

**Regras:**
- Toda chamada ao Prisma Client ocorre aqui — proibido em qualquer outra camada.
- Clientes HTTP para APIs externas (GLPI, Google Workspace) são implementados aqui via interfaces de port.
- Falhas de infraestrutura são traduzidas para exceções de domínio antes de propagar para cima: `PrismaClientKnownRequestError` → `IncidentNotFoundException`.
- Mapeamento entre entidades de domínio e modelos Prisma ocorre exclusivamente nesta camada via mappers.

### 6.4 Camada de Interface (Apresentação)

**Contém:** NestJS Controllers, Guards, Pipes, Interceptors / Next.js Pages, Components, Server Actions, Route Handlers.

**Regras:**
- Controllers NestJS devem ter no máximo 10 linhas por método — sem lógica além de chamar o Use Case.
- Toda validação de entrada usa DTOs com `class-validator` no backend.
- Server Actions do Next.js são a forma preferida de mutação de dados no frontend — evitar fetch direto ao backend quando possível.
- Componentes React não fazem chamadas diretas ao banco — sempre via Server Actions ou Route Handlers.

---

## 7. Princípios SOLID

Todos os artefatos de código devem respeitar os princípios SOLID. O Claude Code deve verificar ativamente a conformidade antes de finalizar qualquer implementação.

### S — Single Responsibility Principle
Cada classe, módulo ou função tem uma única razão para mudar.
- Use Cases têm uma única responsabilidade de negócio.
- Repositórios lidam apenas com persistência — sem transformações de negócio.
- Componentes React renderizam uma única preocupação de UI.

### O — Open/Closed Principle
Aberto para extensão, fechado para modificação.
- Novas categorias de ativo não devem exigir alteração da entidade `Asset` — usar strategy ou composição.
- Novos canais de notificação não alteram o `NotificationService` — implementam a interface `INotificationChannel`.
- Novos tipos de SLA não modificam o `SlaCalculationService` — estendem via novas estratégias.

### L — Liskov Substitution Principle
Implementações concretas devem ser substituíveis por suas interfaces sem quebrar o comportamento.
- `PrismaIncidentRepository` substitui `IIncidentRepository` sem que o Use Case perceba a diferença.
- `GlpiTicketAdapter` substitui `ITicketSyncPort` sem alterar a lógica de sincronização.

### I — Interface Segregation Principle
Interfaces específicas são melhores que interfaces genéricas.
- `IIncidentRepository` não expõe métodos de `IAssetRepository`.
- `IGoogleWorkspaceUserPort` é separado de `IGoogleWorkspaceGroupPort`.
- Componentes React recebem apenas as props que utilizam — sem prop drilling de objetos completos.

### D — Dependency Inversion Principle
Depender de abstrações, não de implementações.
- Use Cases dependem de `IIncidentRepository`, nunca de `PrismaIncidentRepository`.
- O módulo de notificação depende de `IEmailPort`, nunca de `NodemailerAdapter` diretamente.
- Injeção de dependência via NestJS DI Container — sem instanciação manual de dependências.

---

## 8. Padrões de Código

### 8.1 Convenções de Nomenclatura

| Artefato | Padrão | Exemplo |
|----------|--------|---------|
| Entidade de Domínio | `PascalCase` | `Incident`, `ServiceAsset` |
| Value Object | `PascalCase` | `Priority`, `SlaDefinition` |
| Use Case | `PascalCase` + sufixo `UseCase` | `OpenIncidentUseCase` |
| Interface de Repositório | `I` + `PascalCase` + `Repository` | `IIncidentRepository` |
| Implementação de Repositório | `Prisma` + `PascalCase` + `Repository` | `PrismaIncidentRepository` |
| Interface de Port | `I` + `PascalCase` + `Port` | `IEmailNotificationPort` |
| Evento de Domínio | `PascalCase` + verbo no passado | `IncidentOpened`, `SlaBreached` |
| DTO de entrada | `PascalCase` + `Input` | `OpenIncidentInput` |
| DTO de saída | `PascalCase` + `Output` | `IncidentSummaryOutput` |
| NestJS Controller | `PascalCase` + `Controller` | `IncidentController` |
| NestJS Service | `PascalCase` + `Service` | `IncidentService` |
| NestJS Module | `PascalCase` + `Module` | `IncidentModule` |
| Componente React | `PascalCase` | `IncidentCard`, `SlaStatusBadge` |
| Hook React | `use` + `PascalCase` | `useIncidentList`, `useSlaTimer` |
| Arquivo TypeScript | `kebab-case` | `open-incident.use-case.ts` |
| Arquivo de Componente | `PascalCase` | `IncidentCard.tsx` |

### 8.2 Estrutura de Arquivos por Módulo (Backend)

```
src/modules/incident/
├── domain/
│   ├── entities/
│   │   └── incident.entity.ts
│   ├── value-objects/
│   │   ├── priority.vo.ts
│   │   └── incident-status.vo.ts
│   ├── events/
│   │   ├── incident-opened.event.ts
│   │   └── incident-resolved.event.ts
│   ├── exceptions/
│   │   ├── incident-not-found.exception.ts
│   │   └── incident-already-resolved.exception.ts
│   ├── repositories/
│   │   └── incident.repository.interface.ts
│   └── services/
│       └── priority-matrix.domain-service.ts
├── application/
│   ├── use-cases/
│   │   ├── open-incident.use-case.ts
│   │   ├── resolve-incident.use-case.ts
│   │   └── escalate-incident.use-case.ts
│   ├── dtos/
│   │   ├── open-incident.input.ts
│   │   └── incident-summary.output.ts
│   └── ports/
│       └── incident-notification.port.ts
├── infrastructure/
│   ├── repositories/
│   │   ├── prisma-incident.repository.ts
│   │   └── incident.mapper.ts
│   └── adapters/
│       └── glpi-incident-sync.adapter.ts
├── presentation/
│   ├── incident.controller.ts
│   ├── guards/
│   └── pipes/
└── incident.module.ts
```

### 8.3 Regras Gerais de Código

**TypeScript**
- `strict: true` habilitado no `tsconfig.json` — sem exceções.
- Proibido `any`. Usar `unknown` quando o tipo não pode ser inferido e fazer narrowing explícito.
- Proibido `@ts-ignore` e `@ts-nocheck`. Se necessário, usar `@ts-expect-error` com comentário explicativo.
- Enums de domínio usam `const enum` ou union types — nunca enums numéricos implícitos.
- Funções com mais de 3 parâmetros devem receber um objeto tipado.

**Funções e Métodos**
- Máximo de 20 linhas por função — funções maiores devem ser extraídas.
- Máximo de 3 níveis de aninhamento (if/for/while) — usar early return e extração de função.
- Sem efeitos colaterais em funções que retornam valores (funções puras no domínio).
- Async/await obrigatório — proibido `.then().catch()` encadeado sem justificativa.

**Comentários**
- Código deve ser autoexplicativo pelo nome de variáveis, funções e tipos.
- Comentários explicam o **porquê**, nunca o **o quê**.
- JSDoc obrigatório para interfaces públicas de repositórios, ports e use cases.
- Proibido código comentado no repositório — usar controle de versão (git) para histórico.

**Imports**
- Imports organizados em 3 grupos separados por linha em branco: (1) bibliotecas externas, (2) módulos internos do projeto, (3) imports relativos do mesmo módulo.
- Proibido import circular entre módulos — usar eventos de domínio para comunicação entre bounded contexts.
- Path aliases configurados no `tsconfig.json`: `@domain/`, `@application/`, `@infrastructure/`, `@shared/`.

### 8.4 Padrões de API REST (Backend)

| Método | Uso | Exemplo |
|--------|-----|---------|
| `GET` | Leitura sem efeito colateral | `GET /incidents` |
| `POST` | Criação de novo recurso | `POST /incidents` |
| `PATCH` | Atualização parcial | `PATCH /incidents/:id` |
| `PUT` | Substituição completa | `PUT /incidents/:id/assignment` |
| `DELETE` | Remoção lógica (soft delete) | `DELETE /assets/:id` |

**Estrutura de resposta padrão:**
```
// Sucesso
{ "data": { ... }, "meta": { "timestamp": "...", "requestId": "..." } }

// Lista paginada
{ "data": [...], "meta": { "total": 100, "page": 1, "perPage": 20 } }

// Erro
{ "error": { "code": "INCIDENT_NOT_FOUND", "message": "...", "details": [...] } }
```

**Versionamento de API:** prefixo `/api/v1/` em todas as rotas. Versões novas adicionam prefixo — nunca quebram a versão anterior sem período de depreciação documentado.

---

## 9. Estratégia de Testes

### 9.1 Pirâmide de Testes

```
         ▲
        /E2E\        ← Playwright — Fluxos críticos de negócio
       /──────\
      / Integr.\     ← Supertest (NestJS) — Contratos de API
     /──────────\
    /   Unitários \  ← Jest/Vitest — Domínio e Use Cases
   /______________\
```

### 9.2 Testes Unitários

**Obrigatórios para:**
- Todas as entidades de domínio e seus métodos de comportamento.
- Todos os Value Objects (incluindo validações de construtor).
- Todos os Use Cases (com repositórios e ports mockados).
- Domain Services.
- Funções utilitárias em `packages/shared-types/`.

**Ferramentas:** Jest (backend NestJS) + Vitest (frontend Next.js).

**Cobertura mínima obrigatória:**
- Camada de domínio: **90%**
- Camada de aplicação (Use Cases): **85%**
- Camada de infraestrutura (mappers): **70%**

**Padrão de nomenclatura de testes:**
```
describe('[Entidade/UseCase]', () => {
  describe('[método/comportamento]', () => {
    it('deve [resultado esperado] quando [condição]', () => { ... })
    it('deve lançar [exceção] quando [condição inválida]', () => { ... })
  })
})
```

### 9.3 Testes de Integração

**Obrigatórios para:**
- Todos os endpoints REST (Controllers NestJS) via Supertest.
- Repositórios Prisma contra banco de dados de teste (Supabase local via Docker).
- Adaptadores de integração (GLPI, Google Workspace) contra mocks de servidor HTTP.

**Ferramentas:** Supertest + Jest + Testcontainers (banco de teste isolado).

**Regras:**
- Banco de teste isolado por suite — sem compartilhamento de estado entre testes.
- Fixtures de dados em arquivos separados por módulo: `test/fixtures/incident.fixture.ts`.
- Nenhum teste de integração deve fazer chamadas reais a APIs externas — usar `nock` ou MSW.

### 9.4 Testes E2E

**Obrigatórios para os fluxos críticos:**
- Abertura e resolução de incidente com SLA monitorado.
- Provisionamento e revogação de acesso via IAM.
- Ciclo completo de aquisição de ativo (Compras → ITAM).
- Autenticação via Google Workspace (SSO).
- Geração de relatório de compliance.

**Ferramenta:** Playwright.

**Regras:**
- Executados apenas no pipeline de CI em ambiente de staging — nunca localmente contra produção.
- Page Objects obrigatórios — sem seletores hard-coded nos testes.
- Screenshots automáticas em falhas para diagnóstico.

### 9.5 Execução Local

```bash
# Testes unitários
pnpm test

# Testes unitários com cobertura
pnpm test:coverage

# Testes de integração
pnpm test:integration

# Testes E2E (requer ambiente staging)
pnpm test:e2e
```

---

## 10. Estratégia de CI/CD

### 10.1 Pipelines GitHub Actions

**Pipeline: `ci.yml` — Executado em todo Pull Request**

```
Etapas (em paralelo quando possível):
1. lint          → ESLint + Prettier check
2. type-check    → tsc --noEmit
3. test:unit     → Jest/Vitest com cobertura mínima
4. test:integration → Supertest com banco de teste
5. build         → Build de produção (Next.js + NestJS)
6. security-scan → Auditoria de dependências (npm audit)
```

**Regra:** Pull Request só pode ser mergeado se **todas** as etapas passarem. Sem exceções.

**Pipeline: `cd.yml` — Executado no merge para `main`**

```
Etapas (sequenciais):
1. ci             → Executa pipeline CI completo
2. test:e2e       → Testes E2E em staging
3. deploy:staging → Deploy automático em staging (Vercel Preview)
4. smoke-test     → Checagem de saúde dos endpoints críticos
5. deploy:prod    → Deploy em produção (aprovação manual obrigatória)
6. notify         → Notificação do resultado via e-mail
```

### 10.2 Branches e Fluxo de Trabalho

```
main          ← Produção. Protegida. Merge apenas via PR aprovado.
  └── staging ← Ambiente de homologação. Deploy automático.
        └── develop ← Integração. Base para feature branches.
              └── feature/[modulo]-[descricao]  ← Desenvolvimento
              └── fix/[modulo]-[descricao]      ← Correções
              └── chore/[descricao]             ← Manutenção técnica
```

**Regras de branch:**
- Nenhum commit direto em `main` ou `staging` — sempre via Pull Request.
- Pull Requests exigem ao menos 1 aprovação de outro membro da equipe.
- Branch deve ser deletada após merge.
- Squash merge obrigatório para feature branches — histórico limpo em `main`.

### 10.3 Commit Messages

Padrão **Conventional Commits** obrigatório:

```
<tipo>(<escopo>): <descrição em imperativo>

[corpo opcional]

[rodapé opcional: BREAKING CHANGE, Closes #issue]
```

**Tipos permitidos:**

| Tipo | Uso |
|------|-----|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Alteração de documentação |
| `refactor` | Refatoração sem mudança de comportamento |
| `test` | Adição ou correção de testes |
| `chore` | Manutenção técnica (deps, config, build) |
| `perf` | Melhoria de performance |
| `ci` | Alteração em pipelines CI/CD |

**Exemplos:**
```
feat(incident): add automatic escalation on sla breach
fix(iam): prevent duplicate access provisioning on concurrent requests
docs(sla): update SLA policy for critical incidents
refactor(asset): extract depreciation calculation to domain service
```

---

## 11. Estratégia de Deploy

### 11.1 Ambientes

| Ambiente | Branch | URL | Propósito |
|----------|--------|-----|-----------|
| **Development** | `feature/*` | `*.vercel.app` (preview) | Validação individual de funcionalidade |
| **Staging** | `staging` | `staging.sgti.[dominio]` | Homologação e testes E2E |
| **Production** | `main` | `sgti.[dominio]` | Produção |

### 11.2 Frontend (Next.js + Vercel)

- Deploy automático em cada push — Vercel detecta mudanças via integração GitHub.
- Preview deployments para cada Pull Request — URL única gerada automaticamente.
- Deploy em produção requer aprovação manual no pipeline `cd.yml`.
- Variáveis de ambiente segregadas por ambiente no painel Vercel.
- Rollback via Vercel Dashboard em caso de incidente — sem necessidade de reverter código.

### 11.3 Backend (NestJS)

- Build via Docker ou Serverless Functions conforme definido em `Docs/Operação/21_DEPLOYMENT_GUIDE.md`.
- Health check endpoint obrigatório: `GET /api/health` — retorna status dos subsistemas (DB, integrações).
- Deploy com zero-downtime — sem janela de manutenção para deploys de rotina.
- Migrations Prisma executadas como etapa separada e anterior ao deploy do código.
- Ordem obrigatória: (1) migrate, (2) deploy backend, (3) deploy frontend.

### 11.4 Banco de Dados (Supabase PostgreSQL)

- Migrations executadas via `prisma migrate deploy` no pipeline CI/CD — nunca manualmente em produção.
- Backup automático diário via Supabase (retenção de 7 dias no plano gratuito, 30 dias no plano pago).
- Migrations de alto risco (remoção de coluna, rename de tabela) exigem:
  1. Registro de mudança aprovado no SGTI.
  2. Janela de manutenção comunicada aos usuários.
  3. Backup manual antes da execução.

### 11.5 Rollback

| Componente | Estratégia | Tempo Estimado |
|------------|------------|----------------|
| Frontend | Rollback via Vercel Dashboard (1 clique) | < 2 minutos |
| Backend | Revert de commit + push para `main` | < 10 minutos |
| Banco de dados | Restore de backup Supabase | 15–30 minutos |
| Migrations | Migration de reversão criada manualmente | Variável |

---

## 12. Política de Uso de Soluções Gratuitas

O SGTI prioriza o uso de planos gratuitos e open source sempre que tecnicamente viável, sem comprometer segurança, performance ou escalabilidade.

### 12.1 Critérios de Decisão

Antes de adotar qualquer serviço pago, o Claude Code deve verificar:

1. **Existe alternativa gratuita** na stack obrigatória que atenda ao requisito?
2. **O limite do plano gratuito** é suficiente para o volume esperado do projeto?
3. **O custo futuro** de upgrade está previsto no CAPEX do projeto?
4. **Existe lock-in** que dificulte migração futura?

### 12.2 Serviços Aprovados e Limites dos Planos Gratuitos

| Serviço | Plano | Limite Relevante | Ação ao Atingir Limite |
|---------|-------|-----------------|------------------------|
| **Vercel** | Hobby (gratuito) | 100GB bandwidth/mês, 6.000 min build/mês | Migrar para Pro (~$20/mês) |
| **Supabase** | Free | 500MB DB, 1GB storage, 2GB bandwidth | Migrar para Pro ($25/mês) |
| **GitHub** | Free | Repositórios públicos/privados ilimitados, 2.000 min CI/mês | Migrar para Team ($4/user/mês) |
| **Cloudflare** | Free | CDN, DNS, DDoS ilimitados (uso básico) | Workers Paid ($5/mês) se necessário |
| **Google Workspace** | Business Starter | Conforme contrato corporativo existente | — |

### 12.3 Estratégias de Otimização para Limites Gratuitos

**Vercel (bandwidth e build minutes):**
- Otimizar imagens com `next/image` para reduzir bandwidth.
- Implementar cache agressivo via `Cache-Control` headers.
- Usar `turbo` no monorepo para cache de builds e reduzir minutos de CI.
- Separar deploys de frontend e backend — não deployar ambos desnecessariamente.

**Supabase (storage e bandwidth):**
- Compressão obrigatória de arquivos antes do upload para Supabase Storage.
- Tamanho máximo de arquivo: 10MB por upload em condições normais (redutível por módulo).
- Purge periódico de anexos de chamados encerrados há mais de 1 ano (conforme política de retenção).
- Usar Supabase CDN para assets estáticos — reduz contagem de bandwidth da Storage API.

**GitHub Actions (minutos de CI):**
- Cache de dependências obrigatório em todos os pipelines (`actions/cache`).
- Paralelizar etapas independentes para reduzir tempo total.
- Executar testes E2E apenas em merge para `staging` — não em todo PR.
- Skip automático de CI para commits de documentação (`[skip ci]` no commit message).

### 12.4 O Que Não Economizar

As seguintes práticas de economia são **proibidas** por comprometerem segurança ou qualidade:

- Desativar HTTPS para reduzir processamento.
- Remover etapas de lint ou type-check do CI para economizar minutos.
- Usar plano gratuito de serviços de e-mail transacional com limite de envio que comprometa notificações críticas de SLA.
- Armazenar credenciais em variáveis não criptografadas para simplificar configuração.
- Desabilitar RLS no Supabase para simplificar queries.

---

## 13. Restrições Obrigatórias

As restrições abaixo são **absolutas**. O Claude Code não deve propor, aceitar nem implementar soluções que as violem, independentemente do contexto ou da justificativa apresentada.

### 13.1 Segurança

| Restrição | Justificativa |
|-----------|---------------|
| Proibido armazenar senhas locais — autenticação exclusivamente via Google Workspace SSO | Elimina superfície de ataque de credenciais locais |
| Proibido expor tokens, API keys ou credenciais em código, logs ou respostas de API | Prevenção de vazamento de credenciais |
| Proibido `SELECT *` em queries Prisma — sempre especificar campos (`select: {}`) | Prevenção de exposição acidental de dados sensíveis |
| Proibido desabilitar RLS em tabelas com dados pessoais ou de auditoria | Conformidade com LGPD e segurança por padrão |
| Proibido operações de DELETE em tabelas de log de auditoria | Imutabilidade de registros de auditoria |
| Proibido comunicação HTTP (sem TLS) entre serviços em qualquer ambiente | Criptografia em trânsito obrigatória |

### 13.2 Arquitetura

| Restrição | Justificativa |
|-----------|---------------|
| Proibido importar Prisma Client fora da camada de infraestrutura | Preserva independência do domínio |
| Proibido import direto entre módulos de bounded contexts distintos | Preserva fronteiras do DDD |
| Proibido lógica de negócio em Controllers ou Components | Clean Architecture |
| Proibido uso de `any` no TypeScript | Integridade do sistema de tipos |
| Proibido criar componentes customizados que já existam no shadcn/ui | Consistência visual e reuso |
| Proibido Pages Router do Next.js em código novo | Padronização com App Router |

### 13.3 Dados e Compliance

| Restrição | Justificativa |
|-----------|---------------|
| Proibido logar dados pessoais (PII) de colaboradores | Conformidade com LGPD |
| Proibido migrations destrutivas em produção sem aprovação e backup | Proteção contra perda de dados |
| Proibido acessar dados de módulos distintos diretamente via SQL cross-schema | Fronteiras de bounded context |
| Proibido retornar dados de outros tenants em queries | Isolamento multi-tenant |

### 13.4 Operacional

| Restrição | Justificativa |
|-----------|---------------|
| Proibido commit direto nas branches `main` e `staging` | Controle de qualidade via PR |
| Proibido deploy manual em produção fora do pipeline CI/CD | Rastreabilidade e consistência |
| Proibido criar arquivos `.env` com valores reais no repositório | Segurança de credenciais |
| Proibido desativar etapas de lint, type-check ou testes no CI | Qualidade de código garantida |

---

## 14. Referências da Documentação

O Claude Code deve consultar os documentos abaixo antes de implementar funcionalidades nos respectivos módulos:

| Documento | Conteúdo | Quando Consultar |
|-----------|----------|-----------------|
| `Docs/00_PROJECT_CONTEXT.md` | Visão geral, módulos, integrações e KPIs | Sempre — contexto base do projeto |
| `Docs/00_README.md` | Estrutura da documentação e convenções | Para navegar na documentação |
| `Docs/Arquitetura/01_ARCHITECTURE_OVERVIEW.md` | Visão macro da arquitetura técnica | Decisões de estrutura e integração |
| `Docs/Arquitetura/02_DOMAIN_MODEL.md` | Bounded contexts, entidades e linguagem ubíqua | Antes de criar qualquer entidade |
| `Docs/Arquitetura/03_CLEAN_ARCHITECTURE.md` | Estrutura de camadas detalhada | Antes de criar módulo ou use case |
| `Docs/Arquitetura/04_TECHNOLOGY_STACK.md` | Decisões técnicas justificadas | Antes de introduzir nova dependência |
| `Docs/Módulos/05_SERVICE_DESK.md` | Incidentes e Requisições | Ao implementar esses módulos |
| `Docs/Módulos/07_ASSET_MANAGEMENT.md` | ITAM e ciclo de vida de ativos | Ao implementar Ativos |
| `Docs/Módulos/08_IDENTITY_MANAGEMENT.md` | IAM, RBAC e provisioning | Ao implementar Identidades |
| `Docs/Módulos/09_COMPLIANCE.md` | Políticas e controles | Ao implementar Compliance |
| `Docs/Módulos/11_FINANCIAL_MANAGEMENT.md` | OPEX/CAPEX e contratos | Ao implementar Financeiro |
| `Docs/Integrações/12_INTEGRATION_GOOGLE.md` | Google Workspace API | Ao implementar SSO ou IAM |
| `Docs/Integrações/13_INTEGRATION_GLPI.md` | GLPI REST API | Ao implementar sincronização |
| `Docs/Governança/18_SLA_POLICY.md` | Definições e regras de SLA | Ao implementar SLA ou alertas |
| `Docs/Governança/19_SECURITY_POLICY.md` | Requisitos de segurança | Ao implementar autenticação ou acesso |
| `Docs/Operação/21_DEPLOYMENT_GUIDE.md` | Configuração de ambientes | Ao configurar CI/CD ou ambientes |

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição da Alteração |
|--------|------|-------|------------------------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa | Criação do documento |

---

> **Este documento é lido pelo Claude Code no início de cada sessão.**
> Qualquer alteração neste arquivo deve ser revisada pelo Arquiteto Responsável e registrada no controle de versões acima antes de ser commitada.
> Documento seguinte recomendado: [`Docs/Arquitetura/01_ARCHITECTURE_OVERVIEW.md`](./Arquitetura/01_ARCHITECTURE_OVERVIEW.md)
