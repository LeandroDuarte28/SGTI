# SGTI — Sistema de Gestão de Tecnologia da Informação
## Arquitetura Corporativa

> **Classificação:** Interno — Restrito
> **Versão:** 2.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [01_CLAUDE.md](../01_CLAUDE.md) · [11_TECH_STACK.md](../11_TECH_STACK.md) · [00_PROJECT_CONTEXT.md](../00_PROJECT_CONTEXT.md)

---

## Sumário

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Estilo Arquitetural — Modular Monolith](#2-estilo-arquitetural--modular-monolith)
3. [Clean Architecture — Camadas da Aplicação](#3-clean-architecture--camadas-da-aplicação)
4. [Domain-Driven Design](#4-domain-driven-design)
5. [Princípios SOLID Aplicados](#5-princípios-solid-aplicados)
6. [Módulos do Sistema](#6-módulos-do-sistema)
7. [Shared Kernel](#7-shared-kernel)
8. [Fluxos Internos](#8-fluxos-internos)
9. [Integrações Externas](#9-integrações-externas)
10. [Segurança Arquitetural](#10-segurança-arquitetural)
11. [Escalabilidade](#11-escalabilidade)
12. [Evolução para Microserviços](#12-evolução-para-microserviços)
13. [Decisões Arquiteturais (ADRs)](#13-decisões-arquiteturais-adrs)

---

## 1. Visão Geral da Arquitetura

### 1.1 Diagrama de Contexto (C4 — Nível 1)

```
╔══════════════════════════════════════════════════════════════════════╗
║                          ORGANIZAÇÃO                                 ║
║                                                                      ║
║  [Colaborador]  [Técnico TI]  [Gestor TI]  [Diretor]  [Auditor]    ║
║       │              │             │           │           │         ║
╚═══════╪══════════════╪═════════════╪═══════════╪═══════════╪═════════╝
        └──────────────┴─────────────┴───────────┴───────────┘
                                     │ HTTPS / TLS 1.2+
                                     │ Cloudflare (Proxy + CDN)
                           ┌─────────▼──────────┐
                           │       SGTI          │
                           │                     │
                           │  Portal  (Next.js)  │
                           │  API     (NestJS)   │
                           │  Dados   (Supabase) │
                           └──────────┬──────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
 ┌────────▼────────┐       ┌──────────▼──────┐       ┌───────────▼─────┐
 │ Google Workspace│       │      GLPI        │       │ GitHub / Vercel │
 │ OAuth · IAM     │       │ Tickets · ITAM   │       │ CI/CD · Deploy  │
 └─────────────────┘       └─────────────────┘       └─────────────────┘
```

### 1.2 Diagrama de Containers (C4 — Nível 2)

```
┌────────────────────────────────────────────────────────────────────────┐
│                               SGTI                                     │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │               FRONTEND  ·  Next.js 14  ·  Vercel                │  │
│  │                                                                  │  │
│  │   App Router  ·  Server Components  ·  Server Actions           │  │
│  │   TypeScript  ·  Tailwind CSS  ·  shadcn/ui                     │  │
│  └────────────────────────┬─────────────────────────────────────────┘  │
│                           │  HTTP REST + Server Actions                 │
│  ┌────────────────────────▼─────────────────────────────────────────┐  │
│  │               BACKEND   ·  NestJS 10   ·  TypeScript             │  │
│  │                                                                  │  │
│  │   REST API · Guards · Interceptors · EventBus · Swagger         │  │
│  │                                                                  │  │
│  │  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │  │
│  │  │Incident │ │ Request │ │ Problem  │ │  Asset   │ │Identity│  │  │
│  │  └─────────┘ └─────────┘ └──────────┘ └──────────┘ └────────┘  │  │
│  │  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │  │
│  │  │Complian.│ │ Finance │ │Procurem. │ │ Project  │ │Knowled.│  │  │
│  │  └─────────┘ └─────────┘ └──────────┘ └──────────┘ └────────┘  │  │
│  │  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐             │  │
│  │  │Dashboard│ │Notific. │ │  Email   │ │  Auth    │             │  │
│  │  └─────────┘ └─────────┘ └──────────┘ └──────────┘             │  │
│  │                                                                  │  │
│  │              ┌──────────────────────────────┐                   │  │
│  │              │        Shared Kernel          │                   │  │
│  │              │  EventBus · Audit · Logger    │                   │  │
│  │              └──────────────────────────────┘                   │  │
│  └────────────────────────┬─────────────────────────────────────────┘  │
│                           │  Prisma Client                              │
│  ┌────────────────────────▼─────────────────────────────────────────┐  │
│  │               DADOS  ·  Supabase                                 │  │
│  │                                                                  │  │
│  │   PostgreSQL (banco)  ·  Storage (arquivos)                     │  │
│  │   Realtime (dashboards)  ·  RLS (segurança)                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Princípios Arquiteturais

| Princípio | Aplicação no SGTI |
|-----------|-------------------|
| **Separação de responsabilidades** | Cada camada tem uma única preocupação; verificação por linting |
| **Inversão de dependência** | Domínio define interfaces; infraestrutura implementa |
| **Isolamento de contextos** | Módulos comunicam-se apenas via eventos de domínio |
| **Auditabilidade** | Toda operação de escrita gera log imutável |
| **Segurança por padrão** | RLS em todas as tabelas sensíveis; JWT RS256; cookies HttpOnly |
| **Resiliência** | Falhas em integrações externas não afetam o núcleo |
| **Evolução planejada** | Fronteiras do DDD habilitam extração futura para microserviços |

---

## 2. Estilo Arquitetural — Modular Monolith

### 2.1 Definição e Justificativa

O SGTI é implementado como **Modular Monolith**: uma única unidade de deploy internamente organizada em módulos com fronteiras de domínio tão rigorosas quanto as de microserviços.

**Por que não microserviços no MVP:**

| Fator | Impacto |
|-------|---------|
| Equipe inicial pequena | Overhead operacional de microserviços (service discovery, sagas, tracing distribuído) sem retorno proporcional |
| Domínio em evolução | Congelar fronteiras em serviços físicos antes de validá-las em produção gera acoplamento invertido |
| Transações ACID necessárias | Operações que cruzam módulos precisam de atomicidade — sagas adicionariam complexidade não justificada |
| Custo zero | Um processo único roda na Vercel gratuitamente; múltiplos serviços exigem infraestrutura paga |

**Como o Modular Monolith preserva a evolução:**

- Fronteiras do DDD são reais e verificadas por regras de linting desde o início.
- Comunicação entre módulos via EventBus desde o primeiro dia — mesmo padrão de message broker futuro.
- Schemas de banco isolados por módulo — sem JOINs cruzando contextos.
- Extração futura é operação de infraestrutura; o código de domínio não muda.

### 2.2 Estrutura do Processo

```
╔═══════════════════════════════════════════════════════╗
║                 Processo NestJS                       ║
║                                                       ║
║  AppModule                                            ║
║  │                                                    ║
║  ├── IncidentModule     (schema: incident)            ║
║  ├── RequestModule      (schema: request)             ║
║  ├── ProblemModule      (schema: problem)             ║
║  ├── AssetModule        (schema: asset)               ║
║  ├── IdentityModule     (schema: identity)            ║
║  ├── ComplianceModule   (schema: compliance)          ║
║  ├── FinanceModule      (schema: finance)             ║
║  ├── ProcurementModule  (schema: procurement)         ║
║  ├── ProjectModule      (schema: project)             ║
║  ├── KnowledgeModule    (schema: knowledge)           ║
║  ├── DashboardModule    (schema: dashboard)           ║
║  ├── NotificationModule (schema: notification)        ║
║  ├── EmailModule        (schema: email_log)           ║
║  ├── AuthModule         (schema: auth)                ║
║  └── SharedKernelModule (sem schema próprio)          ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
         │
         │ Prisma Client (único processo de conexão)
         ▼
  ┌─────────────────────┐
  │  PostgreSQL/Supabase │
  │  (schemas isolados)  │
  └─────────────────────┘
```

### 2.3 Regras de Isolamento Entre Módulos

| Regra | Mecanismo de Verificação |
|-------|-------------------------|
| Nenhum módulo importa código de outro módulo | ESLint rule: `no-restricted-imports` por pasta |
| Comunicação assíncrona apenas via EventBus | Code review + arquitetura documentada |
| Sem JOINs SQL entre schemas distintos | Prisma por schema + lint de queries |
| Dados de outros contextos obtidos via Read Repository | Interface dedicada de leitura |

---

## 3. Clean Architecture — Camadas da Aplicação

### 3.1 Regra de Dependência

```
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   ┌─────────────────────────────────────────────────┐   ║
║   │   INTERFACE  (Controllers · Pages · Components) │   ║
║   └───────────────────────┬─────────────────────────┘   ║
║                           │ depende de                   ║
║   ┌───────────────────────▼─────────────────────────┐   ║
║   │   APPLICATION  (Use Cases · DTOs · Ports)       │   ║
║   └───────────────────────┬─────────────────────────┘   ║
║                           │ depende de                   ║
║   ┌───────────────────────▼─────────────────────────┐   ║
║   │   DOMAIN  (Entities · VOs · Events · Interfaces)│   ║
║   └─────────────────────────────────────────────────┘   ║
║                           ▲                              ║
║                           │ implementa                   ║
║   ┌───────────────────────┴─────────────────────────┐   ║
║   │   INFRASTRUCTURE  (Prisma · HTTP · SMTP · Adapters)│ ║
║   └─────────────────────────────────────────────────┘   ║
║                                                          ║
║   → Dependências apontam SEMPRE para dentro              ║
║   → Domínio não importa NADA das camadas externas        ║
╚══════════════════════════════════════════════════════════╝
```

### 3.2 Estrutura de Pastas por Módulo

```
src/modules/[modulo]/
├── domain/
│   ├── entities/
│   │   └── [entidade].entity.ts
│   ├── value-objects/
│   │   └── [vo].vo.ts
│   ├── events/
│   │   └── [evento].event.ts
│   ├── exceptions/
│   │   └── [excecao].exception.ts
│   ├── repositories/
│   │   └── [entidade].repository.interface.ts
│   └── services/
│       └── [servico].domain-service.ts
│
├── application/
│   ├── use-cases/
│   │   └── [acao]-[entidade].use-case.ts
│   ├── dtos/
│   │   ├── [acao]-[entidade].input.ts
│   │   └── [entidade]-[visao].output.ts
│   └── ports/
│       └── [integracao].port.ts
│
├── infrastructure/
│   ├── repositories/
│   │   ├── prisma-[entidade].repository.ts
│   │   └── [entidade].mapper.ts
│   └── adapters/
│       └── [servico-externo].adapter.ts
│
├── presentation/
│   ├── [modulo].controller.ts
│   ├── guards/
│   └── pipes/
│
└── [modulo].module.ts
```

### 3.3 Camada de Domínio

**Responsabilidade:** Conter e proteger as regras de negócio. Completamente independente de frameworks.

**Regras obrigatórias:**
- Zero imports de `@nestjs/*`, `prisma`, `supabase` ou qualquer biblioteca externa.
- Entidades expõem apenas métodos de comportamento — sem setters públicos.
- Value Objects validam no construtor; objetos inválidos nunca são instanciados.
- Exceções são classes tipadas do domínio: `IncidentAlreadyResolvedException`, `SlaBreachedException`.
- Testável de forma completamente isolada, sem nenhum mock de infraestrutura.

**Blocos táticos utilizados:**

| Bloco | Descrição | Exemplos no SGTI |
|-------|-----------|-----------------|
| Entity | Identidade única, estado mutável | `Incident`, `Asset`, `Project` |
| Value Object | Sem identidade, imutável | `Priority`, `SlaTarget`, `MoneyAmount` |
| Aggregate Root | Controla invariantes do agregado | `Incident`, `Asset`, `UserIdentity` |
| Domain Event | Fato ocorrido no domínio (passado) | `IncidentOpened`, `AccessRevoked` |
| Repository Interface | Contrato de persistência | `IIncidentRepository` |
| Domain Service | Lógica sem entidade natural | `PriorityMatrixService`, `SlaCalculationService` |
| Exception | Violação de regra de negócio | `InsufficientAccessLevelException` |

### 3.4 Camada de Aplicação

**Responsabilidade:** Orquestrar casos de uso. Coordena domínio, repositórios e ports — sem regras de negócio próprias.

**Regras obrigatórias:**
- Um Use Case por arquivo, responsabilidade única no nome: `OpenIncidentUseCase`.
- Input DTO → Use Case → Output DTO. Nunca expor entidade de domínio para a camada de interface.
- Ports (interfaces para serviços externos) definidos aqui; implementações na infraestrutura.
- Sem lógica de formatação, serialização ou apresentação.

**Anatomia de um Use Case:**

```
OpenIncidentUseCase
  ┌─ Entrada:  OpenIncidentInput
  │              title, description, category
  │              reporterId, affectedAssetId?
  │
  ├─ Fluxo:
  │    1. Validar reporterId (IUserReadRepository)
  │    2. Carregar SLA da categoria (IServiceCatalogPort)
  │    3. Calcular Priority (PriorityMatrixDomainService)
  │    4. Criar Incident no domínio
  │    5. Persistir (IIncidentRepository)
  │    6. Publicar IncidentOpened (IEventBus)
  │
  └─ Saída:   IncidentOpenedOutput
               incidentId, priority, slaDeadline, assignedTo
```

### 3.5 Camada de Infraestrutura

**Responsabilidade:** Implementar as interfaces do domínio e da aplicação usando tecnologias concretas.

**Regras obrigatórias:**
- Toda chamada ao Prisma Client ocorre aqui e apenas aqui.
- Erros de infraestrutura traduzidos para exceções de domínio antes de propagar.
- Mappers explícitos entre modelo Prisma (flat/snake_case) e entidade de domínio (rich model).

```
Erro de infraestrutura → Exceção de domínio:

PrismaClientKnownRequestError (P2025)
    → IncidentNotFoundException

PrismaClientKnownRequestError (P2002)
    → DuplicateAssetTagException

HttpException (GLPI 404)
    → GlpiTicketNotFoundException
```

### 3.6 Camada de Interface (Apresentação)

**Backend — NestJS:**
- Controllers com máximo de 10 linhas por método — sem lógica além de chamar Use Case.
- `ValidationPipe` global com `class-validator` em todos os DTOs de entrada.
- `GlobalExceptionFilter` mapeia exceções de domínio para códigos HTTP corretos.
- `AuditInterceptor` global captura toda operação de escrita sem modificar lógica de negócio.

**Frontend — Next.js:**
- Server Components como padrão; `'use client'` apenas quando estritamente necessário.
- Server Actions para mutações de dados — sem fetch direto ao backend quando evitável.
- Componentes React sem acesso direto ao banco — sempre via Server Actions ou Route Handlers.

---

## 4. Domain-Driven Design

### 4.1 Mapa de Contextos (Context Map)

```
                         ┌─────────────────────┐
                         │   Identity           │ ← UPSTREAM de todos
                         │   (Published Language)│   define contrato
                         └──────────┬──────────┘   de usuário
                                    │ UserProvisioned
                                    │ UserDeprovisioned
        ┌───────────────────────────┼──────────────────────────┐
        │                           │                          │
┌───────▼──────┐          ┌─────────▼──────┐        ┌─────────▼──────┐
│  Incident    │◄─────────│   Request       │        │   Problem       │
│  Management  │ origem   │   Management    │        │   Management    │
└──────┬───────┘          └─────────┬──────┘        └─────────┬──────┘
       │                            │                          │
       └────────────────────────────┼──────────────────────────┘
                                    │ eventos publicados
                        ┌───────────▼───────────┐
                        │      EventBus          │  ← canal assíncrono
                        │  (Shared Kernel)       │    central
                        └───────────┬───────────┘
                                    │
    ┌────────────────────────────────┼─────────────────────────────┐
    │            │            │             │           │           │
┌───▼───┐  ┌────▼───┐  ┌─────▼──┐  ┌──────▼──┐  ┌────▼───┐  ┌───▼──────┐
│ Asset │  │Finance │  │Complian│  │Procurem.│  │Project │  │Knowledge │
└───────┘  └────────┘  └────────┘  └─────────┘  └────────┘  └──────────┘
    │            │            │             │           │
    └────────────┴────────────┴─────────────┴───────────┘
                                    │
                        ┌───────────▼───────────┐
                        │  Notification           │ ← DOWNSTREAM de todos
                        │  + Email + Dashboard    │   reage a eventos
                        │  (Consumers only)       │   sem publicar
                        └───────────────────────┘
```

### 4.2 Tipos de Relacionamento Entre Contextos

| Tipo | Contextos | Descrição |
|------|-----------|-----------|
| **Published Language** | Identity → todos | Identity publica contrato de usuário; demais conformam-se |
| **Customer-Supplier** | Incident → Notification | Incident produz eventos; Notification reage sem conhecer Incident |
| **Conformist** | Request → Catalog | Request adota o contrato publicado pelo Catálogo de Serviços |
| **Anti-Corruption Layer** | SGTI → GLPI | Adapter traduz modelo de domínio SGTI ↔ modelo de tickets GLPI |
| **Anti-Corruption Layer** | SGTI → Google Workspace | Adapter traduz User SGTI ↔ Account Google Directory |
| **Shared Kernel** | Todos → Shared | EventBus, AuditLog, Auth e Logger compartilhados por todos |
| **Read Model** | Todos → Dashboard | Dashboard consome eventos e mantém projeções próprias (CQRS) |

### 4.3 Linguagem Ubíqua por Contexto

Cada bounded context possui vocabulário próprio. Termos com o mesmo nome em contextos distintos têm significados diferentes e isso é intencional.

| Termo | Incident | Identity | Finance |
|-------|----------|----------|---------|
| **Usuário** | Solicitante do chamado | Identidade digital gerenciada | Centro de custo |
| **Status** | Estado do ciclo de atendimento | Estado do ciclo de acesso | Estado do orçamento |
| **Prioridade** | Calculada por impacto × urgência | N/A | Nível de aprovação necessário |
| **Resolução** | Solução técnica documentada | Revogação de acesso | Fechamento de despesa |

---

## 5. Princípios SOLID Aplicados

### 5.1 Single Responsibility Principle (SRP)

Cada classe tem uma única razão para mudar.

**No domínio:**
```
Incident.resolve()       → única responsabilidade: transição de estado para RESOLVED
PriorityMatrixService   → única responsabilidade: calcular prioridade por impacto/urgência
SlaCalculationService   → única responsabilidade: calcular deadline a partir do SLA
```

**Na aplicação:**
```
OpenIncidentUseCase     → única responsabilidade: orquestrar abertura de incidente
ResolveIncidentUseCase  → única responsabilidade: orquestrar resolução
EscalateIncidentUseCase → única responsabilidade: orquestrar escalonamento
```

**Na infraestrutura:**
```
PrismaIncidentRepository → única responsabilidade: persistir e recuperar Incident
IncidentMapper           → única responsabilidade: converter Prisma model ↔ domain entity
GlpiTicketAdapter        → única responsabilidade: comunicar com GLPI API
```

**Violação a ser evitada:**
```
❌ IncidentService com 500 linhas fazendo open + resolve + escalate + notify + sync GLPI
✅ Um Use Case por operação, cada um com 30-50 linhas
```

---

### 5.2 Open/Closed Principle (OCP)

Aberto para extensão, fechado para modificação.

**Canais de notificação:**
```
INotificationChannel (interface)
  ├── EmailNotificationChannel   (implementação)
  ├── InAppNotificationChannel   (implementação)
  └── [FuturoSmsChannel]         (extensão sem modificar as existentes)
```
Adicionar SMS não altera `NotificationService` — apenas adiciona nova implementação.

**Estratégias de SLA:**
```
ISlaStrategy (interface)
  ├── StandardSlaStrategy        (horário comercial)
  ├── ExtendedSlaStrategy        (24×7)
  └── [FuturoVipSlaStrategy]     (SLA premium)
```
Novo tipo de SLA não modifica `SlaCalculationService`.

**Tipos de ativo:**
```
IAssetDepreciationStrategy
  ├── StraightLineDepreciation   (método linear)
  └── DecliningBalanceDepreciation (método saldo decrescente)
```

---

### 5.3 Liskov Substitution Principle (LSP)

Qualquer implementação concreta substitui sua interface sem quebrar o comportamento.

**Repositórios:**
```
IIncidentRepository (interface)
  └── PrismaIncidentRepository (implementação)

OpenIncidentUseCase depende de IIncidentRepository.
Trocar PrismaIncidentRepository por InMemoryIncidentRepository (testes)
→ Use Case funciona identicamente. Zero modificação necessária.
```

**Ports externos:**
```
IEmailPort (interface)
  └── NodemailerSmtpAdapter (produção)
  └── MockEmailAdapter      (testes)

NotificationService depende de IEmailPort.
Substituição em testes: comportamento preservado.
```

---

### 5.4 Interface Segregation Principle (ISP)

Interfaces específicas são preferíveis a interfaces genéricas.

```
❌ IIncidentRepository com 15 métodos genéricos usados parcialmente por cada Use Case

✅ Interfaces segregadas por responsabilidade:

  IIncidentWriteRepository
    save(incident: Incident): Promise<void>
    update(incident: Incident): Promise<void>

  IIncidentReadRepository
    findById(id: IncidentId): Promise<Incident | null>
    findOpenByAssignee(userId: UserId): Promise<Incident[]>
    findOverdueBySla(): Promise<Incident[]>

  IIncidentSearchRepository
    search(query: IncidentSearchQuery): Promise<PaginatedResult<Incident>>
```

**Ports externos também segregados:**
```
IGoogleWorkspaceUserPort   → criar/desativar contas de usuário
IGoogleWorkspaceGroupPort  → gerenciar grupos e membros
IGmailPort                 → enviar e-mails via SMTP
```
Módulo IAM usa apenas `IGoogleWorkspaceUserPort`. Módulo Email usa apenas `IGmailPort`. Nenhum depende de interface que não usa.

---

### 5.5 Dependency Inversion Principle (DIP)

Depender de abstrações, não de implementações concretas.

```
┌────────────────────────────────────────────────────────┐
│  CAMADAS INTERNAS (domínio + aplicação)                │
│                                                        │
│  OpenIncidentUseCase                                   │
│    constructor(                                        │
│      private readonly repo: IIncidentRepository,       │  ← abstração
│      private readonly catalog: IServiceCatalogPort,    │  ← abstração
│      private readonly eventBus: IEventBus              │  ← abstração
│    ) {}                                                │
└────────────────────────────────────────────────────────┘
                        ▲ implementam
┌────────────────────────────────────────────────────────┐
│  INFRAESTRUTURA (camada externa)                       │
│                                                        │
│  PrismaIncidentRepository implements IIncidentRepository│
│  GlpiCatalogAdapter implements IServiceCatalogPort     │
│  NestjsEventBusAdapter implements IEventBus            │
└────────────────────────────────────────────────────────┘

O container de DI do NestJS injeta as implementações concretas.
O Use Case nunca sabe qual implementação está recebendo.
```

---

## 6. Módulos do Sistema

### 6.1 Incident — Gestão de Incidentes

**Schema:** `incident` | **Posição:** Core domain

**Agregado Raiz:** `Incident`

```
Incident
 ├── id: IncidentId
 ├── title: NonEmptyString
 ├── description: NonEmptyString
 ├── status: IncidentStatus
 ├── priority: Priority          ← calculado, não informado pelo usuário
 ├── impact: ImpactLevel
 ├── urgency: UrgencyLevel
 ├── sla: SlaTarget
 ├── reporterId: UserId
 ├── assigneeId: UserId | null
 ├── serviceCategory: ServiceCategory
 ├── affectedAssetId: AssetId | null
 ├── glpiTicketId: string | null  ← referência externa
 ├── comments: IncidentComment[]
 └── escalations: EscalationRecord[]
```

**Value Objects:**
- `IncidentStatus`: `OPEN` · `IN_PROGRESS` · `ESCALATED` · `PENDING_USER` · `RESOLVED` · `CLOSED`
- `Priority`: `CRITICAL` · `HIGH` · `MEDIUM` · `LOW` — resultado da matriz 4×4 impacto × urgência
- `ImpactLevel`: `WIDESPREAD` · `SIGNIFICANT` · `MODERATE` · `MINOR`
- `UrgencyLevel`: `CRITICAL` · `HIGH` · `MEDIUM` · `LOW`
- `SlaTarget`: `responseDeadline`, `resolutionDeadline`, `isPaused`, `pausedAt`
- `ResolutionDetails`: `solution` (texto), `knowledgeArticleId?`, `resolvedBy`, `resolvedAt`

**Eventos publicados:**

| Evento | Consumidores |
|--------|-------------|
| `IncidentOpened` | Notification, SlaManagement, Dashboard, GlpiSync |
| `IncidentAssigned` | Notification, Dashboard |
| `IncidentEscalated` | Notification, Dashboard |
| `IncidentResolved` | Notification, SlaManagement, KnowledgeBase, Dashboard |
| `IncidentClosed` | Dashboard |
| `IncidentReopened` | Notification, Dashboard |

**Use Cases:** `OpenIncidentUseCase` · `AssignIncidentUseCase` · `EscalateIncidentUseCase` · `ResolveIncidentUseCase` · `CloseIncidentUseCase` · `ReopenIncidentUseCase` · `AddCommentUseCase` · `PauseSlaUseCase` · `LinkKnowledgeArticleUseCase`

**Ports:** `IGlpiTicketSyncPort` · `IServiceCatalogPort`

---

### 6.2 Request — Gestão de Requisições

**Schema:** `request` | **Posição:** Core domain

**Agregado Raiz:** `ServiceRequest`

```
ServiceRequest
 ├── id: ServiceRequestId
 ├── status: RequestStatus
 ├── requesterId: UserId
 ├── serviceCatalogItemId: CatalogItemId
 ├── sla: SlaTarget
 ├── approvalFlow: ApprovalStep[]
 └── fulfillmentRecord: FulfillmentRecord | null
```

**Value Objects:**
- `RequestStatus`: `DRAFT` · `SUBMITTED` · `PENDING_APPROVAL` · `APPROVED` · `IN_FULFILLMENT` · `FULFILLED` · `CANCELLED` · `REJECTED`
- `ApprovalDecision`: `APPROVED` · `REJECTED` · `DELEGATED`

**Eventos publicados:**

| Evento | Consumidores |
|--------|-------------|
| `ServiceRequestSubmitted` | Notification, SlaManagement, Dashboard |
| `ServiceRequestApproved` | Notification, Dashboard |
| `ServiceRequestRejected` | Notification, Dashboard |
| `ServiceRequestFulfilled` | Notification, SlaManagement, Dashboard |
| `AccessRequestFulfilled` | Identity (dispara provisionamento) |
| `AssetRequestFulfilled` | Asset (alocação), Procurement |

**Use Cases:** `SubmitServiceRequestUseCase` · `ApproveRequestUseCase` · `RejectRequestUseCase` · `FulfillRequestUseCase` · `CancelRequestUseCase` · `DelegateApprovalUseCase`

---

### 6.3 Problem — Gestão de Problemas

**Schema:** `problem` | **Posição:** Core domain

**Agregados Raiz:** `Problem`, `KnownError`

**Value Objects:**
- `ProblemStatus`: `UNDER_INVESTIGATION` · `ROOT_CAUSE_IDENTIFIED` · `KNOWN_ERROR` · `RESOLVED`
- `RootCauseMethod`: `FIVE_WHYS` · `FISHBONE` · `FAULT_TREE` · `TIMELINE`
- `Workaround`: instrução técnica temporária + limitações conhecidas

**Eventos publicados:**

| Evento | Consumidores |
|--------|-------------|
| `ProblemIdentified` | Notification, Dashboard |
| `WorkaroundPublished` | KnowledgeBase, Notification |
| `KnownErrorRegistered` | KnowledgeBase, Dashboard |
| `ProblemSolved` | Notification, KnowledgeBase, Dashboard |

**Use Cases:** `IdentifyProblemFromIncidentUseCase` · `InvestigateProblemUseCase` · `PublishWorkaroundUseCase` · `RegisterKnownErrorUseCase` · `CloseProblemUseCase`

---

### 6.4 Asset — Gestão de Ativos (ITAM)

**Schema:** `asset` | **Posição:** Supporting domain

**Agregados Raiz:** `Asset`, `SoftwareLicense`

```
Asset
 ├── id: AssetId
 ├── tag: AssetTag          ← etiqueta patrimonial única
 ├── status: AssetStatus
 ├── category: AssetCategory
 ├── serialNumber: string
 ├── assignedTo: UserId | null
 ├── location: string
 ├── warranty: WarrantyPeriod
 ├── depreciation: DepreciationValue
 ├── contractId: ContractId | null
 └── maintenanceHistory: AssetMaintenanceRecord[]
```

**Value Objects:**
- `AssetStatus`: `ORDERED` · `RECEIVED` · `IN_STOCK` · `ALLOCATED` · `IN_USE` · `UNDER_MAINTENANCE` · `DECOMMISSIONED`
- `AssetCategory`: `WORKSTATION` · `SERVER` · `NETWORK` · `PERIPHERAL` · `SOFTWARE` · `LICENSE` · `OTHER`
- `WarrantyPeriod`: `startDate`, `endDate`, `coverage`
- `DepreciationValue`: `originalValue`, `currentValue`, `method`, `usefulLifeYears`

**Eventos publicados:**

| Evento | Consumidores |
|--------|-------------|
| `AssetAllocated` | Notification, Dashboard |
| `AssetDecommissioned` | Finance (baixa patrimonial), Dashboard |
| `AssetUnderMaintenance` | Notification, Dashboard |
| `WarrantyExpiringSoon` | Notification, Dashboard |
| `LicenseUtilizationLow` | Notification, Finance, Dashboard |

**Ports:** `IGlpiAssetSyncPort`

---

### 6.5 Identity — Gestão de Identidades (IAM)

**Schema:** `identity` | **Posição:** UPSTREAM — define contrato de usuário para todo o sistema

**Agregados Raiz:** `UserIdentity`, `AccessProfile`, `AccessReview`

```
UserIdentity
 ├── id: UserId
 ├── email: EmailAddress
 ├── name: FullName
 ├── status: IdentityStatus
 ├── role: Role
 ├── orgUnit: OrgUnit        ← espelho do Google Workspace
 ├── googleAccountId: string ← referência externa imutável
 └── accessProfile: AccessProfile
```

**Value Objects:**
- `IdentityStatus`: `ACTIVE` · `INACTIVE` · `SUSPENDED` · `PENDING_PROVISIONING` · `PENDING_DEPROVISIONING`
- `Role`: `SUPER_ADMIN` · `IT_MANAGER` · `IT_SPECIALIST` · `IT_TECHNICIAN` · `COMPLIANCE_OFFICER` · `FINANCIAL_ANALYST` · `PROJECT_MANAGER` · `AUDITOR` · `EXECUTIVE` · `END_USER`
- `AccessScope`: conjunto de módulos e operações permitidas para um papel

**Eventos publicados:**

| Evento | Consumidores |
|--------|-------------|
| `UserProvisioned` | Notification + todos os módulos |
| `UserDeprovisioned` | Notification + todos os módulos |
| `AccessGranted` | Notification, Compliance, Dashboard |
| `AccessRevoked` | Notification, Compliance, Dashboard |
| `AccessReviewRequired` | Notification, Compliance |

**Use Cases:** `ProvisionUserUseCase` · `DeprovisionUserUseCase` · `GrantAccessUseCase` · `RevokeAccessUseCase` · `SuspendUserUseCase` · `ReactivateUserUseCase` · `StartAccessReviewUseCase` · `CompleteAccessReviewUseCase` · `SyncFromGoogleWorkspaceUseCase`

**Ports:** `IGoogleWorkspaceUserPort` · `IGoogleWorkspaceGroupPort`

---

### 6.6 Compliance — Gestão de Compliance

**Schema:** `compliance` | **Posição:** Supporting domain

**Agregados Raiz:** `ComplianceControl`, `Policy`, `AuditCycle`

**Value Objects:**
- `ControlStatus`: `NOT_IMPLEMENTED` · `PARTIALLY_IMPLEMENTED` · `IMPLEMENTED` · `NOT_APPLICABLE`
- `Framework`: `LGPD` · `ISO_27001` · `ITIL_V4` · `INTERNAL`
- `NonConformanceSeverity`: `CRITICAL` · `MAJOR` · `MINOR` · `OBSERVATION`
- `PolicyVersion`: número + data de aprovação + responsável

**Eventos publicados:**

| Evento | Consumidores |
|--------|-------------|
| `PolicyPublished` | Notification, Dashboard |
| `NonConformanceFound` | Notification, Dashboard |
| `AuditCompleted` | Dashboard |
| `ControlImplemented` | Dashboard |

**Use Cases:** `PublishPolicyUseCase` · `MapControlToFrameworkUseCase` · `CollectEvidenceUseCase` · `RegisterNonConformanceUseCase` · `ScheduleAuditUseCase` · `CompleteAuditUseCase` · `GenerateMaturityReportUseCase`

---

### 6.7 Finance — Gestão Financeira (OPEX/CAPEX)

**Schema:** `finance` | **Posição:** Supporting domain

**Agregados Raiz:** `Budget`, `Contract`, `Expense`

**Value Objects:**
- `BudgetType`: `CAPEX` · `OPEX`
- `MoneyAmount`: valor + moeda + precisão decimal
- `CostCenter`: código + nome + responsável
- `ContractStatus`: `DRAFT` · `ACTIVE` · `EXPIRING_SOON` · `EXPIRED` · `CANCELLED`

**Eventos publicados:**

| Evento | Consumidores |
|--------|-------------|
| `BudgetExceeded` | Notification, Dashboard |
| `ContractExpiringSoon` | Notification, Dashboard |
| `ExpenseRegistered` | Dashboard |
| `CapexItemReceived` | Asset (vínculo ao ativo adquirido) |

**Use Cases:** `CreateBudgetUseCase` · `RegisterExpenseUseCase` · `AllocateBudgetUseCase` · `RegisterContractUseCase` · `RenewContractUseCase` · `RateCostByCostCenterUseCase` · `GenerateFinancialReportUseCase`

---

### 6.8 Procurement — Gestão de Compras

**Schema:** `procurement` | **Posição:** Supporting domain

**Agregados Raiz:** `PurchaseOrder`, `Supplier`

**Value Objects:**
- `PurchaseOrderStatus`: `DRAFT` · `SUBMITTED` · `APPROVED` · `ORDERED` · `PARTIALLY_RECEIVED` · `RECEIVED` · `CANCELLED`
- `ApprovalThreshold`: valor que define o nível de aprovação necessário
- `SupplierCategory`: `HARDWARE` · `SOFTWARE` · `SERVICE` · `CLOUD` · `TELECOM` · `OTHER`

**Eventos publicados:**

| Evento | Consumidores |
|--------|-------------|
| `PurchaseOrderApproved` | Notification, Finance (reserva orçamentária) |
| `ItemReceived` | Asset (criar ativo), Finance (baixa de CAPEX) |
| `SupplierEvaluated` | Dashboard |

---

### 6.9 Project — Gestão de Projetos de TI

**Schema:** `project` | **Posição:** Supporting domain

**Agregado Raiz:** `Project`

```
Project
 ├── id: ProjectId
 ├── status: ProjectStatus
 ├── phase: ProjectPhase
 ├── budget: MoneyAmount
 ├── sponsor: UserId
 ├── milestones: Milestone[]
 ├── risks: Risk[]
 └── githubRepoIds: string[]  ← referência externa
```

**Value Objects:**
- `ProjectStatus`: `IDEATION` · `APPROVED` · `IN_PROGRESS` · `ON_HOLD` · `COMPLETED` · `CANCELLED`
- `ProjectPhase`: `INITIATION` · `PLANNING` · `EXECUTION` · `MONITORING` · `CLOSURE`
- `RiskLevel`: `CRITICAL` · `HIGH` · `MEDIUM` · `LOW`
- `DeliveryStatus`: `NOT_STARTED` · `IN_PROGRESS` · `COMPLETED` · `DELAYED`

**Eventos publicados:**

| Evento | Consumidores |
|--------|-------------|
| `ProjectApproved` | Finance (reserva CAPEX), Notification |
| `MilestoneCompleted` | Dashboard, Notification |
| `ProjectDelayed` | Notification, Dashboard |
| `ProjectCompleted` | Finance (fechamento orçamentário), Dashboard |

**Ports:** `IGithubProjectPort`

---

### 6.10 Knowledge Base — Base de Conhecimento

**Schema:** `knowledge` | **Posição:** Supporting domain

**Agregado Raiz:** `KnowledgeArticle`

**Value Objects:**
- `ArticleStatus`: `DRAFT` · `UNDER_REVIEW` · `PUBLISHED` · `DEPRECATED`
- `ArticleAudience`: `TECHNICAL` · `END_USER` · `MANAGEMENT`
- `SearchRelevance`: pontuação calculada por uso + avaliação dos leitores

**Eventos consumidos (reativo):**

| Evento Consumido | Ação no Knowledge Base |
|-----------------|------------------------|
| `IncidentResolved` | Sugere criação de artigo com base na solução |
| `ProblemSolved` | Vincula solução definitiva a artigo existente ou cria novo |
| `WorkaroundPublished` | Publica artigo de workaround automaticamente |

**Use Cases:** `CreateArticleUseCase` · `SubmitForReviewUseCase` · `PublishArticleUseCase` · `SearchArticlesUseCase` · `LinkArticleToIncidentUseCase` · `DeprecateArticleUseCase`

---

### 6.11 Dashboard — Dashboards Executivos e Operacionais

**Schema:** `dashboard` (read models / projeções) | **Posição:** DOWNSTREAM — apenas leitura

**Padrão:** CQRS Read Side — projections atualizadas por eventos de domínio.

O Dashboard não acessa schemas de outros módulos via SQL. Mantém projeções desnormalizadas próprias:

| Projeção | Atualizada por | Consulta |
|----------|---------------|---------|
| `incident_metrics` | IncidentOpened, IncidentResolved, IncidentClosed | MTTR, MTTA, SLA%, volume |
| `sla_compliance_summary` | IncidentOpened, IncidentResolved, SlaAtRisk | SLA global por período |
| `asset_inventory_summary` | AssetAllocated, AssetDecommissioned | Totais por status e categoria |
| `identity_access_summary` | UserProvisioned, AccessGranted, AccessRevoked | Usuários ativos, pendências |
| `compliance_maturity` | ControlImplemented, NonConformanceFound | % por framework |
| `financial_summary` | ExpenseRegistered, BudgetExceeded | OPEX/CAPEX vs. orçado |
| `project_portfolio` | ProjectApproved, MilestoneCompleted, ProjectDelayed | Status e saúde dos projetos |

```
Evento publicado por qualquer módulo
         │
         ▼
DashboardProjectionHandler (event listener)
         │
         ├── Atualiza projeção correspondente (UPSERT atômico)
         │
         └── Supabase Realtime notifica frontend
                    │
                    ▼
         Dashboard atualiza sem refresh manual
```

---

### 6.12 Notification — Notificações

**Schema:** `notification` | **Posição:** DOWNSTREAM

**Agregados Raiz:** `Notification`, `NotificationPreference`

**Value Objects:**
- `NotificationChannel`: `EMAIL` · `IN_APP` · `PUSH`
- `NotificationStatus`: `PENDING` · `SENT` · `DELIVERED` · `READ` · `FAILED`
- `NotificationPriority`: `URGENT` · `HIGH` · `NORMAL` · `LOW`

**Fluxo interno:**

```
Evento de domínio (qualquer módulo)
         │
         ▼
NotificationEventHandler
  1. Resolve destinatários por tipo de evento e papel
  2. Carrega preferências de canal do usuário
  3. Aplica política de horário de silêncio
  4. Cria Notification entity (status: PENDING)
  5. Persiste no banco
         │
         ├── Canal EMAIL → delega ao módulo Email
         └── Canal IN_APP → persiste; Supabase Realtime entrega ao frontend
```

---

### 6.13 Email — Envio de E-mail

**Schema:** `email_log` (apenas log de envios) | **Posição:** Generic subdomain

**Remetente padrão:** `implantacao@pinpag.com.br` (SMTP via Google Workspace)

**Value Objects:**
- `EmailStatus`: `QUEUED` · `SENDING` · `SENT` · `DELIVERED` · `BOUNCED` · `FAILED`
- `RetryPolicy`: maxAttempts=3, intervalSeconds=[30, 120, 300] (backoff exponencial)

**Templates disponíveis:**

| Template | Evento Disparador |
|----------|------------------|
| `incident-opened` | IncidentOpened |
| `incident-resolved` | IncidentResolved |
| `sla-at-risk` | SlaAtRisk |
| `access-granted` | AccessGranted |
| `access-revoked` | AccessRevoked |
| `approval-required` | RequestSubmitted, PurchaseOrderSubmitted |
| `contract-expiring` | ContractExpiringSoon |
| `budget-exceeded` | BudgetExceeded |
| `compliance-nc-found` | NonConformanceFound |
| `project-delayed` | ProjectDelayed |
| `warranty-expiring` | WarrantyExpiringSoon |

**Port:** `ISmtpEmailPort` → `NodemailerSmtpAdapter` (SMTP Google Workspace)

---

### 6.14 Authentication — Autenticação

**Schema:** `auth` (sessões e tokens) | **Posição:** UPSTREAM — toda requisição passa por aqui

**Fluxo completo:**

```
1. LOGIN
   Browser → GET /api/auth/google
   Backend → Redireciona para Google OAuth 2.0

2. CALLBACK
   Google → GET /api/auth/callback?code=XXX
   Backend:
     → Troca code por id_token no Google
     → Valida id_token
     → Busca/cria UserIdentity (via IdentityModule)
     → Emite JWT SGTI (RS256, exp: 1h)
     → Emite Refresh Token (opaco, 7d, armazenado no banco)
     → Seta cookies: access_token (HttpOnly, Secure, SameSite=Strict)
                     refresh_token (HttpOnly, Secure, SameSite=Strict)

3. REQUISIÇÃO AUTENTICADA
   Browser → qualquer rota protegida (cookie automático)
   JwtAuthGuard:
     → Extrai JWT do cookie
     → Valida assinatura RS256 com chave pública
     → Verifica expiração
     → Verifica blacklist (usuários suspensos/deslogados)
     → Popula Request.user com { userId, email, role, modules, orgUnit }

4. RENOVAÇÃO
   Browser → POST /api/auth/refresh
   Backend:
     → Valida refresh token no banco
     → Emite novo JWT (1h)
     → Rotaciona refresh token (revoga antigo, emite novo)

5. LOGOUT
   Browser → POST /api/auth/logout
   Backend:
     → Revoga refresh token no banco
     → Limpa cookies
```

**JWT Payload:**
```json
{
  "sub": "user-uuid",
  "email": "colaborador@empresa.com",
  "name": "Nome Completo",
  "role": "IT_TECHNICIAN",
  "modules": ["INCIDENTS", "ASSETS", "KNOWLEDGE"],
  "orgUnit": "/TI/Suporte",
  "iat": 1234567890,
  "exp": 1234571490
}
```

---

## 7. Shared Kernel

Artefatos transversais utilizados por todos os módulos. Não é módulo de negócio — é biblioteca interna que pode ser importada por todos, mas não importa nenhum módulo.

```
src/shared/
├── domain/
│   ├── base-entity.ts           ← id, createdAt, updatedAt
│   ├── base-aggregate.ts        ← domainEvents[], pullDomainEvents()
│   ├── domain-event.ts          ← interface base: eventId, occurredOn, aggregateId
│   ├── value-object.ts          ← equals() por valor
│   └── entity-id.ts             ← UUID tipado
│
├── application/
│   ├── event-bus.port.ts        ← IEventBus: publish(), subscribe()
│   ├── use-case.interface.ts    ← IUseCase<Input, Output>
│   └── pagination.dto.ts        ← PaginatedInput, PaginatedOutput<T>
│
├── infrastructure/
│   ├── event-bus/
│   │   └── nestjs-event-bus.ts  ← EventEmitter2 adapter
│   ├── audit/
│   │   └── audit.interceptor.ts ← log imutável de toda escrita
│   └── logging/
│       └── logger.service.ts    ← Winston estruturado
│
└── presentation/
    ├── filters/
    │   └── global-exception.filter.ts
    ├── guards/
    │   ├── jwt-auth.guard.ts
    │   └── roles.guard.ts
    └── decorators/
        ├── current-user.decorator.ts
        └── roles.decorator.ts
```

**EventBus — contrato de evento:**
```
Todo evento de domínio deve ter:
  eventId:       UUID único do evento
  occurredOn:    timestamp de ocorrência
  aggregateId:   ID da entidade que originou o evento
  aggregateType: nome do agregado ('Incident', 'Asset', etc.)

Eventos são versionados: IncidentOpened_v1, IncidentOpened_v2
Versões antigas mantidas durante período de depreciação.
```

---

## 8. Fluxos Internos

### 8.1 Abertura de Incidente

```
Usuário          Frontend          Backend API         Domain              EventBus
   │                │                   │                 │                   │
   ├─ Preenche ────►│                   │                 │                   │
   │   formulário   │                   │                 │                   │
   │                ├─ POST /incidents ─►│                 │                   │
   │                │                   ├─ ValidationPipe │                   │
   │                │                   ├─ JwtAuthGuard   │                   │
   │                │                   ├─ OpenIncident ──►                   │
   │                │                   │  UseCase        ├─ Load SLA         │
   │                │                   │                 ├─ Calc Priority    │
   │                │                   │                 ├─ Create Incident  │
   │                │                   │                 ├─ Publish event ───►
   │                │                   │                 │                   │
   │                │                   │  IIncidentRepo  │                   ├─► NotificationHandler
   │                │                   ├─────────────────►                   │     └─ email ao técnico
   │                │                   │  Prisma.save()  │                   │
   │                │                   │                 │                   ├─► SlaHandler
   │                │                   │                 │                   │     └─ agenda alerta
   │                │                   │                 │                   │
   │                │                   │                 │                   ├─► DashboardHandler
   │                │                   │                 │                   │     └─ atualiza projeção
   │                │                   │                 │                   │
   │                │                   │                 │                   ├─► GlpiSyncHandler
   │                │                   │                 │                   │     └─ POST /Ticket (async)
   │                │◄─ 201 Created ─────│                 │                   │
   │◄── Feedback ───│   { incidentId,    │                 │                   │
   │                │     priority,      │                 │                   │
   │                │     slaDeadline }  │                 │                   │
```

### 8.2 Provisionamento de Acesso (Onboarding)

```
RH (trigger)       Identity UseCase      Google Workspace       EventBus
     │                    │                     │                   │
     ├─ Admissão ─────────►                     │                   │
     │   (webhook)         │                    │                   │
     │                    ├─ SyncFromGoogle ─────►                  │
     │                    │                     ├─ Cria conta G.    │
     │                    │◄─ googleAccountId ───│                   │
     │                    │                     │                   │
     │                    ├─ Cria UserIdentity   │                   │
     │                    ├─ Atribui Role        │                   │
     │                    ├─ Define AccessScope  │                   │
     │                    ├─ Publish ────────────────────────────────►
     │                    │  UserProvisioned     │                   │
     │                    │                     │                   ├─► NotificationHandler
     │                    │                     │                   │     └─ e-mail boas-vindas
     │                    │                     │                   │
     │                    │                     │                   ├─► Todos os módulos
     │                    │                     │                   │     └─ registram usuário
```

### 8.3 Fluxo de SLA em Risco

```
ScheduledJob (a cada 5 min)
     │
     ├─ IIncidentRepository.findOverdueBySla()
     │
     ├─ Para cada incidente com SLA em risco:
     │    └─ Publish SlaAtRisk event
     │              │
     │              ├─► NotificationHandler
     │              │     ├─ E-mail para técnico atribuído
     │              │     ├─ E-mail para gestor de TI
     │              │     └─ Notificação in-app
     │              │
     │              └─► DashboardHandler
     │                    └─ Atualiza sla_compliance_summary
     │
     └─ Incidentes sem atribuição em N minutos → EscalateIncidentUseCase
```

### 8.4 Sincronização Bidirecional com GLPI

```
CRIAÇÃO (síncrona — SGTI → GLPI):
  IncidentOpened event
       │
       └─► GlpiSyncHandler
             ├─ GlpiTicketAdapter.createTicket(incidentData)
             │        └─ POST /Ticket (timeout: 5s)
             ├─ Recebe glpiTicketId
             └─ IIncidentRepository.updateGlpiRef(incidentId, glpiTicketId)

ATUALIZAÇÃO DE STATUS (assíncrona — GLPI → SGTI):
  ScheduledJob (a cada 5 min):
       │
       └─► Para cada incidente com glpiTicketId:
             ├─ GlpiTicketAdapter.getTicket(glpiTicketId)
             ├─ Se status diverge: SyncIncidentStatusUseCase
             └─ Registra SyncLog

FALHA DE SINCRONIZAÇÃO:
  Timeout / 5xx GLPI
       │
       └─► Registra SyncFailureRecord
             └─ Retry com backoff: 30s → 2min → 10min → 30min → dead letter
```

### 8.5 Fluxo de Compliance — Registro de Evidência

```
Analista de Compliance      Compliance UseCase          Storage + DB
        │                          │                         │
        ├─ Seleciona controle ─────►                         │
        │                          │                         │
        ├─ Anexa arquivo de ────────►                        │
        │   evidência               ├─ Supabase Storage.upload()
        │                          │          └─ compliance/{controlId}/{file}
        │                          │◄─ storagePath            │
        │                          │                         │
        │                          ├─ Cria Evidence entity   │
        │                          ├─ Atualiza ControlStatus │
        │                          ├─ IComplianceRepository.save()
        │                          ├─ Publish ControlImplemented
        │◄─ Confirmação ────────────│                         │
```

---

## 9. Integrações Externas

### 9.1 Padrão Anti-Corruption Layer

Toda integração externa é isolada por Anti-Corruption Layer na infraestrutura. O domínio nunca conhece detalhes do sistema externo.

```
Domínio SGTI           Interface (Port)          ACL (Adapter)          Sistema Externo
     │                        │                       │                       │
  Incident                    │  IGlpiTicketPort       │  GlpiTicketAdapter    │  GLPI REST API
  (domain model)              │  (interface pura)      │  (tradução)           │  (modelo GLPI)
     │                        │                       │                       │
  UserIdentity                │  IGoogleUserPort       │  GoogleDirAdapter     │  Admin SDK
  (domain model)              │  (interface pura)      │  (tradução)           │  (Google model)
```

### 9.2 Google Workspace

| Operação | Port | Adapter | Endpoint |
|----------|------|---------|----------|
| SSO / autenticação | `IGoogleOAuthPort` | `GoogleOAuthAdapter` | OAuth 2.0 |
| Criar conta | `IGoogleUserPort` | `GoogleDirectoryAdapter` | Admin SDK: users.insert |
| Desativar conta | `IGoogleUserPort` | `GoogleDirectoryAdapter` | Admin SDK: users.update |
| Listar grupos | `IGoogleGroupPort` | `GoogleDirectoryAdapter` | Admin SDK: groups.list |
| Enviar e-mail (SMTP) | `IGmailPort` | `GmailSmtpAdapter` | SMTP TLS 587 |

**Tratamento de falha:** provisionamento falha de forma graceful — usuário criado no SGTI com status `PENDING_PROVISIONING`; job de retry a cada 10 minutos até 3 tentativas.

### 9.3 GLPI

| Operação | Port | Sincronismo |
|----------|------|-------------|
| Criar ticket | `IGlpiTicketPort` | Síncrono (timeout 5s) |
| Atualizar status | `IGlpiTicketPort` | Assíncrono (job 5min) |
| Sincronizar inventário | `IGlpiAssetPort` | Assíncrono (job diário 02h) |

**Autenticação GLPI:** session token renovado a cada 12 horas via `IGlpiAuthPort`.

### 9.4 GitHub

| Operação | Port | Uso |
|----------|------|-----|
| Listar commits | `IGithubRepoPort` | Rastreabilidade de entregas em projetos |
| Status de pipelines CI | `IGithubActionsPort` | Dashboard operacional |
| Webhook push/merge | Handler direto | Registro automático de mudanças |

### 9.5 Vercel

| Operação | Port | Uso |
|----------|------|-----|
| Status de deployments | `IVercelDeployPort` | Dashboard operacional |
| Webhook deployment | Handler direto | Registro de mudanças em produção |

### 9.6 Política de Resiliência de Integrações

```
Regra geral: falha em integração externa NÃO interrompe o fluxo principal do SGTI.

Estratégias por tipo de operação:

SÍNCRONA (ex: criar ticket no GLPI ao abrir incidente):
  Timeout: 5 segundos
  Fallback: registra SyncPending, continua o fluxo, retenta em background

ASSÍNCRONA (ex: sincronizar status do GLPI):
  Retry com backoff exponencial: 30s → 2min → 10min → 30min
  Dead letter após 5 tentativas: alerta para administrador
  Circuit breaker: após 10 falhas consecutivas, pausa por 15 minutos

WEBHOOK (ex: GitHub push):
  Idempotência por evento ID: processa uma única vez, descarta duplicatas
  Ack imediato (HTTP 200) + processamento assíncrono
```

---

## 10. Segurança Arquitetural

### 10.1 Modelo de Segurança em Camadas

```
╔══════════════════════════════════════════════════════════╗
║  CAMADA 1 — Rede / Perímetro                             ║
║  Cloudflare: DDoS · SSL/TLS 1.2+ · Bot Protection       ║
╠══════════════════════════════════════════════════════════╣
║  CAMADA 2 — Autenticação                                 ║
║  Google OAuth 2.0 → JWT RS256 → Cookie HttpOnly/Secure  ║
╠══════════════════════════════════════════════════════════╣
║  CAMADA 3 — Autorização na Aplicação                     ║
║  JwtAuthGuard → RolesGuard → ModuleAccessGuard          ║
╠══════════════════════════════════════════════════════════╣
║  CAMADA 4 — Autorização no Banco                         ║
║  PostgreSQL RLS: políticas por role e user_id            ║
╠══════════════════════════════════════════════════════════╣
║  CAMADA 5 — Auditoria Imutável                           ║
║  AuditInterceptor: INSERT-only em audit_log              ║
╚══════════════════════════════════════════════════════════╝
```

### 10.2 Configuração JWT

| Parâmetro | Valor |
|-----------|-------|
| Algoritmo | RS256 (assimétrico) |
| Access Token TTL | 1 hora |
| Refresh Token TTL | 7 dias |
| Armazenamento | Cookie `HttpOnly`, `Secure`, `SameSite=Strict` |
| Rotação de Refresh | A cada uso — token antigo revogado |
| Blacklist | Verificada no JwtAuthGuard para logout e suspensões |

### 10.3 Row Level Security (Supabase)

```sql
-- Política base: usuário acessa apenas seus próprios dados
CREATE POLICY "own_data" ON incident.incidents
  FOR ALL USING (reporter_id = auth.uid());

-- Política de papel: técnicos acessam incidentes atribuídos a eles
CREATE POLICY "technician_assigned" ON incident.incidents
  FOR SELECT USING (
    assignee_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM identity.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('IT_MANAGER', 'IT_SPECIALIST', 'SUPER_ADMIN')
    )
  );

-- Auditoria: apenas INSERT permitido
CREATE POLICY "audit_insert_only" ON shared.audit_log
  FOR INSERT WITH CHECK (true);
-- RLS bloqueia UPDATE e DELETE automaticamente (sem policy = sem acesso)
```

### 10.4 Headers de Segurança

| Header | Valor |
|--------|-------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'nonce-{nonce}'` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

### 10.5 Conformidade LGPD

| Requisito | Implementação |
|-----------|--------------|
| PII centralizado | Dados pessoais apenas no schema `identity` — outros módulos referenciam `user_id` |
| Logs sem PII | `AuditLog` registra apenas `user_id` e operação, nunca dados pessoais |
| Direito ao esquecimento | Anonimização após período de retenção (5 anos) via job programado |
| Consentimento de acesso | Aprovação registrada em `AccessReview` antes de acesso privilegiado |
| Retenção de dados | Configurável por tipo de dado; padrão 5 anos para dados de auditoria |

---

## 11. Escalabilidade

### 11.1 Estratégia Atual (Modular Monolith)

O sistema escala horizontalmente como uma única unidade — múltiplas instâncias do processo NestJS atrás do load balancer da Vercel.

**Pontos de escalabilidade e estratégias:**

| Componente | Estratégia | Gatilho |
|------------|-----------|---------|
| Backend NestJS | Escala horizontal (Vercel serverless) | Requests concorrentes |
| PostgreSQL | Connection pooling via PgBouncer (Supabase) | Conexões > 80% do limite |
| Dashboard | Projeções desnormalizadas + Supabase Realtime | Queries complexas > 500ms |
| E-mail | Queue assíncrona com retry | Volume > 100/minuto |
| Sync GLPI | Workers assíncronos por tipo de operação | Backlog > 1.000 eventos |

### 11.2 Estratégia de Cache

**Cache de aplicação (in-memory, NestJS):**
- Catálogo de Serviços: TTL 5 minutos (muda raramente, consultado em todo chamado)
- Configurações de SLA: TTL 10 minutos
- Usuário autenticado: TTL 1 minuto (evita consulta ao banco por requisição)

**Cache de banco (PostgreSQL):**
- Índices compostos: `(status, assignee_id)`, `(created_at, category)`, `(module, event_type)`
- Read models desnormalizados no schema `dashboard` (zero JOINs em queries de KPI)
- Materialized Views para relatórios de compliance e financeiro (refresh programado)

**Cache de CDN (Cloudflare):**
- Assets estáticos Next.js: 1 ano (imutáveis com hash)
- Base de Conhecimento (artigos públicos): 5 minutos
- Rotas autenticadas: sem cache (dados sensíveis e personalizados)

### 11.3 Limites de Volume Estimados

| Capacidade | Limite Estimado | Estratégia de Upgrade |
|------------|----------------|----------------------|
| Usuários simultâneos | 500 | Vercel escala serverless automaticamente |
| Incidentes/mês | 10.000 | Particionamento de tabela por mês |
| Armazenamento de evidências | 1 GB (free) → escala | Upgrade Supabase Storage |
| E-mails/mês | 1.000 | Limite SMTP Google Workspace |

---

## 12. Evolução para Microserviços

### 12.1 Critérios de Extração

Extração de um módulo para microserviço autônomo somente quando **dois ou mais** critérios forem atendidos:

| Critério | Descrição |
|----------|-----------|
| **Escala independente** | Módulo com carga desproporcionalmente maior que os demais |
| **Deploy independente** | Ciclo de release diferente e frequente |
| **Tecnologia distinta** | Benefício claro de stack diferente (ex: Python para ML, Go para performance) |
| **Fronteira de segurança** | Requisitos de isolamento mais rigorosos que o restante |
| **Equipe dedicada** | Time suficientemente grande para operar serviço autônomo |

### 12.2 Candidatos à Extração por Prioridade

| Módulo | Justificativa | Protocolo Futuro |
|--------|--------------|-----------------|
| `Notification` + `Email` | Alta frequência, escala independente, fila dedicada | RabbitMQ / SQS |
| `Dashboard` | Read model com requisitos de cache distintos | Redis + Kafka |
| `Identity` | Requisitos de segurança mais rígidos | gRPC + eventos |
| `Asset` | Crescimento para inventário físico completo | Kafka |
| `Finance` | Integração futura com ERP | REST + eventos |

### 12.3 Roteiro de Extração — Strangler Fig Pattern

```
FASE 1 — VERIFICAÇÃO (sem custo de código)
  ├── Confirmar: módulo sem imports diretos de outros módulos ✓
  ├── Confirmar: comunicação apenas via EventBus ✓
  ├── Confirmar: schema de banco isolado sem JOINs externos ✓
  └── Criar testes de contrato para interfaces públicas do módulo

FASE 2 — EXTRAÇÃO FÍSICA
  ├── Novo repositório para o microserviço
  ├── Copiar: domain/ + application/ + infrastructure/
  ├── Substituir: EventEmitter2 → cliente RabbitMQ/SQS
  ├── Expor: API REST ou gRPC para operações síncronas
  └── Deploy em ambiente staging do novo serviço

FASE 3 — MIGRAÇÃO GRADUAL
  ├── Feature flag para rotear % do tráfego
  ├── Monitorar paridade de comportamento
  └── Aumentar gradualmente: 10% → 25% → 50% → 100%

FASE 4 — LIMPEZA
  ├── Remover módulo do monolito
  ├── Atualizar Context Map
  └── Documentar o novo serviço em Docs/
```

### 12.4 Infraestrutura Futura

```
HOJE (Monolito Modular)          FUTURO (Híbrido)
                                 
NestJS Monolith                  ┌─── NestJS Core
├── Incident                     │    Incident + Request + Problem
├── Request                      │    Asset + Compliance + Finance
├── Problem                      │
├── Asset                        ├─── Notification Service
├── Identity                     │    RabbitMQ consumer
├── Compliance                   │
├── Finance          ───────────►├─── Dashboard Service
├── Procurement                  │    Redis + Event Streaming
├── Project                      │
├── Knowledge                    ├─── Identity Service
├── Dashboard                    │    gRPC + Alta disponibilidade
├── Notification                 │
├── Email                        └─── Finance Service
└── Authentication                    REST API + Eventos
```

### 12.5 O Que Permanece no Monolito

| Módulo | Motivo para Permanecer |
|--------|----------------------|
| `Incident`, `Request`, `Problem` | Alta interdependência transacional; operações atômicas cross-context necessárias |
| `Compliance` | Baixo volume; alta dependência de leitura de dados de outros módulos |
| `Authentication` | Crítico para disponibilidade; extração exige garantia de 99,99% independente |
| `Procurement` | Acoplado a Finance e Asset; separação prematura gera sagas desnecessárias |

---

## 13. Decisões Arquiteturais (ADRs)

### ADR-001 — Modular Monolith em vez de Microserviços
**Status:** Aceito · **Data:** 2026-06-09

**Contexto:** 14 módulos, equipe inicial pequena, custo zero obrigatório.

**Decisão:** Modular Monolith com fronteiras DDD rigorosas desde o início.

**Consequências positivas:** Deploy simples, transações ACID, zero overhead operacional.
**Consequências negativas:** Escala como unidade única; limite de 500 usuários simultâneos estimado.
**Critério de revisão:** quando dois dos critérios da seção 12.1 forem atendidos.

---

### ADR-002 — Comunicação Assíncrona via EventBus
**Status:** Aceito · **Data:** 2026-06-09

**Contexto:** Módulos não podem importar código uns dos outros (fronteiras DDD).

**Decisão:** Toda comunicação assíncrona via `EventEmitter2` (NestJS). Comunicação síncrona necessária via interfaces de Port na camada de aplicação.

**Consequências positivas:** Acoplamento mínimo, preparação para message broker futuro.
**Consequências negativas:** Rastreamento de fluxo mais complexo; requer boa instrumentação de logs.

---

### ADR-003 — CQRS Parcial no Dashboard
**Status:** Aceito · **Data:** 2026-06-09

**Contexto:** Queries de KPI com JOINs sobre múltiplos módulos seriam lentas e violam fronteiras DDD.

**Decisão:** Dashboard mantém read models próprios (projeções) atualizadas por event handlers. CQRS apenas no Dashboard — demais módulos usam o modelo tradicional.

**Consequências positivas:** Queries O(1), desacoplamento total dos módulos de escrita.
**Consequências negativas:** Eventual consistency (defasagem de segundos); complexidade em event handlers de projeção.

---

### ADR-004 — JWT RS256 Assimétrico
**Status:** Aceito · **Data:** 2026-06-09

**Contexto:** Múltiplos módulos e futuro potencial de microserviços precisam verificar tokens.

**Decisão:** JWT RS256 com par de chaves. Módulo Auth assina com chave privada; todos os módulos verificam com chave pública.

**Consequências positivas:** Chave privada isolada; verificação descentralizada; segurança superior ao HS256.
**Consequências negativas:** Par de chaves precisa de rotação periódica e armazenamento seguro.

---

### ADR-005 — Prisma como Único ORM
**Status:** Aceito · **Data:** 2026-06-09

**Contexto:** Stack TypeScript ponta a ponta exige ORM com tipagem nativa e migrations versionadas.

**Decisão:** Prisma é o único ORM. SQL raw via `prisma.$queryRaw<T>` tipado apenas para otimizações documentadas.

**Consequências positivas:** Tipagem total em queries, migrations no repositório, Prisma Studio para desenvolvimento.
**Consequências negativas:** Alguns recursos avançados do PostgreSQL exigem `$queryRaw`; overhead de geração do client.

---

### ADR-006 — Schemas de Banco Isolados por Módulo
**Status:** Aceito · **Data:** 2026-06-09

**Contexto:** Preservar fronteiras de bounded context no nível de banco de dados.

**Decisão:** Cada módulo possui seu próprio PostgreSQL schema (`incident`, `asset`, `identity`, etc.). JOINs entre schemas são proibidos.

**Consequências positivas:** Fronteiras físicas preservadas; extração futura para microserviços simplificada.
**Consequências negativas:** Dados de outros contextos obtidos via repositórios de leitura (mais verboso que JOIN direto).

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição da Alteração |
|--------|------|-------|------------------------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa | Criação do documento |
| 2.0.0 | 2026-06-09 | Arquitetura Corporativa | Revisão completa: expansão de SOLID, fluxos detalhados por diagrama, ADR-006 adicionado, políticas de resiliência e RLS com exemplos SQL |

---

> **Próximos documentos recomendados:**
> [`Módulos/05_SERVICE_DESK.md`](../Módulos/05_SERVICE_DESK.md) — Especificação funcional detalhada dos módulos Incident e Request
> [`11_TECH_STACK.md`](../11_TECH_STACK.md) — Stack tecnológica com limites e justificativas
> [`01_CLAUDE.md`](../01_CLAUDE.md) — Regras permanentes de implementação para o Claude Code
