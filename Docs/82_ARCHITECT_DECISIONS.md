# SGTI — Sistema de Gestão de Tecnologia da Informação
## Architecture Decision Records (ADRs)

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Vigente
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [12_ARCHITECTURE.md](./12_ARCHITECTURE.md) · [11_TECH_STACK.md](./11_TECH_STACK.md) · [01_CLAUDE.md](./01_CLAUDE.md)

---

## Sobre este Documento

Este documento registra as decisões arquiteturais do projeto SGTI no formato **ADR (Architecture Decision Record)**. Cada ADR documenta uma decisão significativa tomada durante a concepção da arquitetura, incluindo o contexto que a motivou, as alternativas consideradas, os trade-offs avaliados, os benefícios esperados, os riscos identificados e as estratégias de mitigação adotadas.

### Formato Adotado

Cada ADR segue a estrutura:

```
Número e Título
Status
Data
Contexto
Decisão
Alternativas Consideradas
Trade-offs
Benefícios
Riscos
Estratégias de Mitigação
Critério de Revisão
```

### Status Possíveis

| Status | Descrição |
|--------|-----------|
| **Proposto** | Em discussão, aguardando aprovação |
| **Aceito** | Aprovado e em vigor |
| **Depreciado** | Substituído por decisão mais recente |
| **Supersedido** | Explicitamente substituído por outro ADR |

---

## Índice de ADRs

| ADR | Título | Status | Data |
|-----|--------|--------|------|
| [ADR-001](#adr-001--nestjs-como-framework-de-backend) | NestJS como framework de backend | Aceito | 2026-06-09 |
| [ADR-002](#adr-002--nextjs-como-framework-de-frontend) | Next.js como framework de frontend | Aceito | 2026-06-09 |
| [ADR-003](#adr-003--supabase-como-plataforma-de-dados) | Supabase como plataforma de dados | Aceito | 2026-06-09 |
| [ADR-004](#adr-004--prisma-como-orm) | Prisma como ORM | Aceito | 2026-06-09 |
| [ADR-005](#adr-005--vercel-como-plataforma-de-hospedagem) | Vercel como plataforma de hospedagem | Aceito | 2026-06-09 |
| [ADR-006](#adr-006--cloudflare-como-camada-de-rede-e-segurança) | Cloudflare como camada de rede e segurança | Aceito | 2026-06-09 |
| [ADR-007](#adr-007--modular-monolith-como-estilo-arquitetural) | Modular Monolith como estilo arquitetural | Aceito | 2026-06-09 |
| [ADR-008](#adr-008--typescript-ponta-a-ponta) | TypeScript ponta a ponta | Aceito | 2026-06-09 |
| [ADR-009](#adr-009--jwt-rs256-para-autenticação-stateless) | JWT RS256 para autenticação stateless | Aceito | 2026-06-09 |
| [ADR-010](#adr-010--google-oauth-20-como-único-provedor-de-identidade) | Google OAuth 2.0 como único provedor de identidade | Aceito | 2026-06-09 |
| [ADR-011](#adr-011--eventbus-interno-para-comunicação-entre-módulos) | EventBus interno para comunicação entre módulos | Aceito | 2026-06-09 |
| [ADR-012](#adr-012--cqrs-parcial-para-dashboards) | CQRS parcial para dashboards | Aceito | 2026-06-09 |

---

## ADR-001 — NestJS como Framework de Backend

**Status:** Aceito
**Data:** 2026-06-09
**Autores:** Arquitetura Corporativa de TI

---

### Contexto

O SGTI requer um framework de backend capaz de suportar uma arquitetura corporativa com 14 módulos, Clean Architecture, DDD, SOLID e injeção de dependência nativa. A equipe tem familiaridade com TypeScript e a stack precisa ser sustentável por uma equipe pequena sem abrir mão de estrutura e escalabilidade arquitetural.

O sistema precisa de:
- Injeção de dependência nativa para aplicar o princípio D do SOLID.
- Modularidade para mapear 1:1 com bounded contexts do DDD.
- Suporte a Guards, Interceptors e Pipes para RBAC, auditoria e validação transversais.
- Integração nativa com Swagger/OpenAPI para documentação automática.
- Suporte a eventos internos para comunicação assíncrona entre módulos.
- TypeScript como linguagem principal sem adaptações.

---

### Decisão

Adotar **NestJS 10+** como framework exclusivo de backend do SGTI.

---

### Alternativas Consideradas

| Alternativa | Avaliação |
|-------------|-----------|
| **Express.js** | Minimalista por design. Sem DI nativa, sem modularidade estruturada, sem Pipes/Guards. Exigiria construir toda a infraestrutura arquitetural manualmente, aumentando risco e tempo de desenvolvimento. |
| **Fastify** | Performance superior ao Express, mas compartilha as mesmas lacunas arquiteturais para DDD e Clean Architecture. Adequado para APIs simples, não para sistemas corporativos complexos. |
| **AdonisJS** | Ecossistema menor, menor adoção corporativa, documentação menos madura para padrões arquiteturais avançados. Sem vantagem clara sobre NestJS para o perfil do SGTI. |
| **Hono** | Framework minimalista de edge. Excelente performance, mas projetado para simplicidade — inadequado para a complexidade de 14 módulos com DDD. |
| **tRPC + Express** | Eliminaria necessidade de DTOs manuais, mas acoplaria backend e frontend em contrato de tipos compartilhados, comprometendo a separação arquitetural da Clean Architecture. |

---

### Trade-offs

| Aspecto | Positivo | Negativo |
|---------|----------|----------|
| **Estrutura** | Impõe boas práticas por design — difícil fazer errado | Curva de aprendizado maior para desenvolvedores acostumados com Express |
| **DI Container** | Injeção de dependência nativa, elegante e testável | Overhead de configuração de providers para projetos pequenos |
| **Decorators** | Reduzem boilerplate em controllers e DTOs | Dependência de metadados TypeScript em runtime (`reflect-metadata`) |
| **Modularidade** | Módulos encapsulados, importação explícita de dependências | Configuração inicial de cada módulo requer boilerplate (module file) |
| **Opinionado** | Convenções claras aceleram o desenvolvimento | Menos flexibilidade para padrões não convencionais do NestJS |

---

### Benefícios

**1. Alinhamento Natural com Clean Architecture e DDD**
A estrutura de módulos do NestJS (`@Module`, `@Injectable`, `@Controller`) mapeia diretamente para os bounded contexts do DDD. Cada contexto tem seu próprio módulo com domínio, aplicação, infraestrutura e apresentação encapsulados — sem configuração adicional para impor essa separação.

**2. Injeção de Dependência que Aplica SOLID**
O container de DI do NestJS injeta implementações concretas em interfaces sem que os Use Cases precisem conhecer as implementações. `OpenIncidentUseCase` recebe `IIncidentRepository` — o container resolve para `PrismaIncidentRepository` em produção e `InMemoryIncidentRepository` em testes.

**3. Guards e Interceptors como Cross-Cutting Concerns**
`JwtAuthGuard`, `RolesGuard`, `AuditInterceptor` e `LoggingInterceptor` são aplicados globalmente ou por controller com um decorator — sem duplicação de código de segurança e auditoria em cada Use Case.

**4. Swagger Automático sem Esforço Manual**
`@nestjs/swagger` gera a especificação OpenAPI 3.0 a partir dos decorators já presentes no código. A documentação da API nunca fica desatualizada porque é derivada do código real.

**5. EventEmitter2 para Comunicação Assíncrona**
O módulo `@nestjs/event-emitter` com `EventEmitter2` provê o EventBus interno que desacopla os módulos do SGTI. O mesmo padrão `@OnEvent('IncidentOpened')` funciona hoje com EventEmitter2 e funcionaria amanhã com RabbitMQ ou Kafka — o código de domínio não muda.

**6. Ecossistema Maduro e Suporte Corporativo**
NestJS tem mais de 60.000 estrelas no GitHub, documentação em português, grande base de contribuidores e suporte ativo. Encontrar desenvolvedores experientes com NestJS é significativamente mais fácil do que com alternativas menos adotadas.

---

### Riscos

| ID | Risco | Probabilidade | Impacto |
|----|-------|--------------|---------|
| R1 | Breaking change em major version do NestJS quebrando APIs internas | Baixa | Médio |
| R2 | Uso incorreto do DI Container gerando memory leaks (providers não escopados) | Média | Alto |
| R3 | Over-engineering: criar abstrações NestJS desnecessárias para módulos simples | Média | Baixo |
| R4 | Dependência de `reflect-metadata` dificulta execução em ambientes sem suporte a decorators | Muito Baixa | Médio |

---

### Estratégias de Mitigação

| Risco | Mitigação |
|-------|-----------|
| R1 | Lock de versão no `package.json` (`"@nestjs/core": "10.x"`). Atualizações apenas via PR revisado com análise de changelog. |
| R2 | Code review com checklist de escopo de providers. Testes de integração que executam múltiplas requisições detectam leaks. |
| R3 | Diretriz documentada no `01_CLAUDE.md`: Use Cases simples não precisam de Service separado — controller pode chamar Use Case diretamente. |
| R4 | Manter Node.js LTS como runtime target. Monitorar roadmap de decorators nativos do ECMAScript. |

---

### Critério de Revisão

Esta decisão deve ser revisada se:
- NestJS for descontinuado ou perder suporte ativo.
- A equipe crescer a ponto de equipes distintas precisarem de linguagens diferentes por domínio.
- Requisitos de performance exigirem algo que NestJS não suporte adequadamente.

---

## ADR-002 — Next.js como Framework de Frontend

**Status:** Aceito
**Data:** 2026-06-09
**Autores:** Arquitetura Corporativa de TI

---

### Contexto

O SGTI requer um frontend que atenda a requisitos distintos e simultâneos:
- Portal de autoatendimento com páginas de conteúdo estático (Base de Conhecimento, Catálogo de Serviços).
- Dashboards com dados em tempo real que precisam de atualização sem refresh.
- Formulários interativos complexos (abertura de chamados, aprovações, registros de ativos).
- Controle de acesso por rota com base no papel do usuário.
- Integração com Server Actions para mutações de dados sem boilerplate de API endpoints.
- TypeScript nativo e integração com shadcn/ui como biblioteca de componentes.

---

### Decisão

Adotar **Next.js 14+** com **App Router** como framework exclusivo de frontend do SGTI.

---

### Alternativas Consideradas

| Alternativa | Avaliação |
|-------------|-----------|
| **Vite + React SPA** | Sem SSR nativo. Exige endpoint de API separado para cada operação de servidor. SEO limitado. Sem suporte nativo a Server Components. Adequado para SPAs simples, não para sistema com conteúdo público e autenticado. |
| **Remix** | Filosofia de web fundamentals interessante, mas ecossistema menor, menor adoção em ambientes corporativos e curva de aprendizado adicional sem vantagem clara sobre Next.js para o perfil do SGTI. |
| **Nuxt.js (Vue)** | Equivalente ao Next.js para o ecossistema Vue. A equipe tem familiaridade com React — mudança de paradigma sem justificativa técnica objetiva. |
| **Angular** | Framework opinionado com DI robusta, mas verbosidade elevada, bundle size maior e ciclos de desenvolvimento mais lentos para o perfil de equipe pequena do SGTI. |
| **SvelteKit** | Performance excelente, sintaxe concisa. Ecossistema menor, menos componentes corporativos disponíveis, curva de aprendizado para equipe React. |

---

### Trade-offs

| Aspecto | Positivo | Negativo |
|---------|----------|----------|
| **App Router** | Server Components por padrão reduzem JS no cliente | Modelo mental mais complexo (client vs. server boundary) |
| **Server Actions** | Mutações sem boilerplate de API endpoint | Debugging mais complexo do que endpoints REST explícitos |
| **SSR/SSG/ISR** | Flexibilidade de estratégia de renderização por rota | Configuração incorreta pode causar problemas de cache difíceis de diagnosticar |
| **Vercel-optimized** | Otimizações específicas disponíveis nativamente | Melhor performance na Vercel; outras plataformas podem ter diferenças |
| **React Server Components** | Zero JS enviado ao cliente para componentes de servidor | Limitações: sem hooks de estado, sem event listeners, sem browser APIs |

---

### Benefícios

**1. App Router com Server Components por Padrão**
Componentes de servidor renderizados no servidor enviam apenas HTML ao cliente — sem JavaScript para o componente de listagem de incidentes, o relatório de compliance ou o artigo da Base de Conhecimento. O bundle JavaScript do cliente fica restrito ao que é genuinamente interativo.

**2. Server Actions para Mutações Sem API Endpoints Manuais**
Operações como "abrir incidente", "aprovar requisição" ou "registrar ativo" são implementadas como Server Actions — funções TypeScript executadas no servidor, chamadas diretamente de componentes React. Elimina a necessidade de Route Handlers dedicados para a maioria das mutações.

**3. Layouts Aninhados por Módulo**
A estrutura de `layout.tsx` por pasta permite definir navegação, sidebar e header uma única vez por módulo — `/app/(auth)/incidents/layout.tsx` aplica automaticamente o layout de autenticação e a sidebar de incidentes a todas as rotas dentro de `/incidents/`. Nenhuma re-renderização desnecessária ao navegar entre rotas do mesmo módulo.

**4. Route Groups para Isolamento de Contextos**
`(auth)` e `(public)` como Route Groups isolam rotas autenticadas de rotas públicas sem impactar a URL. O middleware de autenticação aplica-se ao grupo `(auth)` inteiro com uma única configuração.

**5. Streaming e Suspense para Dashboards**
Dashboards do SGTI carregam múltiplas fontes de dados independentes. Com Streaming, cada seção do dashboard começa a renderizar assim que seus dados ficam disponíveis — sem esperar que todos os dados carreguem para mostrar qualquer coisa.

**6. Integração Nativa com Vercel**
Next.js é desenvolvido pela mesma empresa da Vercel. Preview Deployments, Edge Functions, Analytics de Core Web Vitals e cache de ISR funcionam sem configuração adicional na plataforma de hospedagem escolhida.

---

### Riscos

| ID | Risco | Probabilidade | Impacto |
|----|-------|--------------|---------|
| R1 | Confusão entre componentes de cliente e servidor causando erros em produção | Média | Médio |
| R2 | Server Actions com lógica de negócio vazando para a camada de interface | Média | Alto |
| R3 | Breaking changes no App Router entre versões minor do Next.js | Baixa | Médio |
| R4 | Cache do Next.js (ISR/fetch) servindo dados desatualizados para usuários | Média | Alto |

---

### Estratégias de Mitigação

| Risco | Mitigação |
|-------|-----------|
| R1 | Diretriz clara no `01_CLAUDE.md`: `'use client'` apenas para componentes com hooks de estado, event listeners ou browser APIs. ESLint rule para detectar uso incorreto de hooks em Server Components. |
| R2 | Server Actions chamam Use Cases do backend via HTTP — nunca contêm lógica de negócio. Regra documentada: Server Action = chamada ao backend + revalidação de cache. |
| R3 | Lock de versão. Monitorar changelog do Next.js em cada release. Testes E2E com Playwright detectam regressões. |
| R4 | Estratégia explícita de revalidação por rota: dashboards com `revalidate=0` (sempre fresco), artigos da KB com `revalidate=300`. Cache de fetch desativado em rotas autenticadas. |

---

### Critério de Revisão

Esta decisão deve ser revisada se:
- React deprecar o modelo de Server Components em favor de alternativa incompatível.
- A Vercel encerrar o suporte gratuito para projetos Next.js.
- Requisitos de aplicativo móvel nativo tornarem React Native a escolha mais eficiente que manter dois frontends.

---

## ADR-003 — Supabase como Plataforma de Dados

**Status:** Aceito
**Data:** 2026-06-09
**Autores:** Arquitetura Corporativa de TI

---

### Contexto

O SGTI precisa de:
- Banco de dados relacional robusto (PostgreSQL) para dados fortemente tipados e relacionais.
- Armazenamento de arquivos para evidências de compliance, anexos de chamados e documentos de projeto.
- Atualizações em tempo real para dashboards operacionais sem polling.
- Row Level Security para isolamento de dados por usuário e papel.
- Gerenciamento de sessões de autenticação auxiliar.
- Custo zero durante o MVP.
- Caminho claro de migração para produção sem reescrita de código.

---

### Decisão

Adotar **Supabase** como plataforma de dados do SGTI, utilizando PostgreSQL gerenciado, Supabase Storage, Supabase Realtime e Row Level Security.

---

### Alternativas Consideradas

| Alternativa | Avaliação |
|-------------|-----------|
| **PostgreSQL self-hosted (Railway/Render)** | Controle total, sem lock-in de plataforma. Porém, exige gestão de backups, patches, alta disponibilidade e SSL — overhead operacional não justificado no MVP com equipe pequena. |
| **PlanetScale (MySQL)** | Branching de banco interessante para CI/CD. MySQL não tem os recursos avançados do PostgreSQL (RLS nativo, JSONB, full-text search). Migração exigiria reescrita do schema Prisma. |
| **Firebase Firestore** | NoSQL document store. Modelo de dados inadequado para o domínio relacional do SGTI (incidentes com SLAs, ativos com contratos, usuários com papéis). Queries relacionais complexas seriam ineficientes. |
| **MongoDB Atlas** | Free tier disponível. NoSQL document store com os mesmos problemas do Firebase para dados relacionais. Sem RLS nativo, sem transações ACID no mesmo nível do PostgreSQL. |
| **Neon (PostgreSQL serverless)** | PostgreSQL serverless com branching. Alternativa viável, mas ecossistema menos maduro que Supabase, sem Storage integrado e sem Realtime nativo. |
| **Turso (libSQL)** | Edge-first SQLite. Excelente para leituras na edge, mas sem RLS nativo, sem Storage, sem Realtime — exigiria múltiplos serviços para cobrir o que Supabase provê integrado. |

---

### Trade-offs

| Aspecto | Positivo | Negativo |
|---------|----------|----------|
| **PostgreSQL gerenciado** | Zero overhead operacional; backups automáticos | Menos controle sobre configuração do servidor (shared infrastructure) |
| **RLS nativo** | Segurança no nível do banco, não apenas na aplicação | Políticas RLS complexas são difíceis de debugar e testar |
| **Supabase Storage** | Armazenamento com RLS integrado, sem serviço adicional | 1GB no plano gratuito — limitado para sistemas com muitos anexos |
| **Realtime** | WebSocket nativo para dashboards sem polling | Limite de conexões simultâneas no plano gratuito |
| **Pause automático** | Plano gratuito pausa após 1 semana de inatividade | **Risco crítico** para ambiente de desenvolvimento/staging sem uso constante |
| **Lock-in** | Supabase adiciona valor além do PostgreSQL puro | Migração futura requer desacoplar recursos Supabase-específicos (RLS policies, Storage) |

---

### Benefícios

**1. PostgreSQL como Banco Principal — Sem Compromissos**
Supabase não é uma abstração sobre PostgreSQL — é PostgreSQL com uma camada de ferramentas. O schema Prisma, as migrations, as queries e os índices são PostgreSQL puro. Migrar para PostgreSQL self-hosted no futuro é uma operação de infraestrutura, não de código.

**2. Row Level Security no Nível do Banco**
Políticas RLS garantem que, mesmo que um bug de aplicação vaze dados entre módulos ou usuários, o banco rejeita a query. É uma segunda linha de defesa arquitetural independente do código da aplicação — crítico para um sistema com dados sensíveis de compliance e identidade.

**3. Storage com Políticas de Acesso Integradas**
Supabase Storage usa o mesmo sistema de autenticação e RLS do banco. Não é necessário gerenciar permissões de Storage separadamente — as mesmas políticas de papel definidas para o banco se aplicam ao acesso de arquivos.

**4. Realtime para Dashboards Sem Polling**
O módulo de Dashboard do SGTI mantém projeções atualizadas por eventos de domínio. Com Supabase Realtime, o frontend recebe notificações via WebSocket quando uma projeção é atualizada — o dashboard atualiza automaticamente sem que o usuário precise dar refresh ou o frontend precise fazer polling a cada N segundos.

**5. Supabase Studio como Ferramenta de Desenvolvimento**
Interface visual para inspeção do banco, execução de queries, visualização de políticas RLS e gerenciamento de Storage durante o desenvolvimento. Elimina necessidade de DBeaver, pgAdmin ou clientes SQL adicionais.

**6. Custo Zero com Caminho de Upgrade Claro**
O plano gratuito (500MB banco, 1GB storage) é suficiente para o MVP. O upgrade para Pro ($25/mês) aumenta os limites sem nenhuma alteração de código — mesma API, mesmo cliente, mesmas políticas.

---

### Riscos

| ID | Risco | Probabilidade | Impacto |
|----|-------|--------------|---------|
| R1 | Pause automático do banco após 1 semana de inatividade interrompe staging/dev | Alta (no plano free) | Alto |
| R2 | Limite de 500MB de banco atingido antes do upgrade | Baixa (MVP) | Alto |
| R3 | Limite de conexões simultâneas no plano gratuito sob carga | Média | Médio |
| R4 | Supabase altera preços ou descontinua plano gratuito | Muito Baixa | Alto |
| R5 | Políticas RLS mal configuradas bloqueiam acesso legítimo | Média | Alto |
| R6 | Migração para outro provedor é mais complexa do que PostgreSQL puro | Baixa | Médio |

---

### Estratégias de Mitigação

| Risco | Mitigação |
|-------|-----------|
| R1 | Job automático no GitHub Actions que executa query leve a cada 4 dias em ambientes não-produção. Upgrade para Pro ao entrar em produção real. |
| R2 | Monitorar uso no dashboard Supabase. Alerta configurado a 400MB (80% do limite). Política de retenção de dados implementada desde o início. |
| R3 | Connection pooling via PgBouncer habilitado na string de conexão (`?pgbouncer=true`). Máximo de 10 conexões por instância serverless. |
| R4 | Schema Prisma é agnóstico de plataforma. Migração para PostgreSQL self-hosted (Railway, Neon ou bare metal) é documentada em `Docs/Operação/21_DEPLOYMENT_GUIDE.md`. |
| R5 | Testes de integração que verificam políticas RLS para cada papel. Suite de testes de segurança que tenta acessar dados de outro usuário e valida rejeição. |
| R6 | Dependências Supabase-específicas isoladas em adapters na camada de infraestrutura. Supabase Storage referenciado por `storage_path` no banco, não por URL direta. |

---

### Critério de Revisão

Esta decisão deve ser revisada se:
- O banco de dados atingir 80% do limite do plano Pro e o custo de upgrade for proibitivo.
- Requisitos de compliance exigirem dados em território nacional com garantias contratuais específicas.
- A Supabase encerrar o plano gratuito ou o plano Pro antes do SGTI gerar receita suficiente.

---

## ADR-004 — Prisma como ORM

**Status:** Aceito
**Data:** 2026-06-09
**Autores:** Arquitetura Corporativa de TI

---

### Contexto

O SGTI precisa de uma camada de acesso a dados que:
- Seja totalmente tipada em TypeScript — sem queries que retornam `any`.
- Gerencie o schema do banco como código versionado junto com o repositório.
- Seja suficientemente expressiva para as queries complexas dos módulos de Dashboard e Compliance.
- Respeite as fronteiras da Clean Architecture — sem vazar detalhes do banco para o domínio.
- Suporte múltiplos schemas PostgreSQL isolados por módulo.
- Tenha boa experiência de desenvolvimento (autocomplete, visualização do schema, Studio).

---

### Decisão

Adotar **Prisma ORM 5+** como único mecanismo de acesso ao banco de dados no SGTI. SQL raw via `prisma.$queryRaw<T>` permitido apenas para otimizações documentadas e aprovadas.

---

### Alternativas Consideradas

| Alternativa | Avaliação |
|-------------|-----------|
| **TypeORM** | ORM maduro para TypeScript/NestJS. Porém, geração de tipos menos robusta, Active Record pattern tende a vazar lógica de banco no domínio, migrations menos confiáveis (geração automática problemática em casos complexos). |
| **Drizzle ORM** | ORM mais recente com tipagem excelente e SQL-like API. Ecossistema menos maduro, menos integrações, sem Studio visual. Alternativa séria para projetos futuros. |
| **MikroORM** | Suporte a DDD (Unit of Work pattern). Mais complexo de configurar, ecossistema menor, curva de aprendizado elevada sem vantagem clara para o perfil do SGTI. |
| **Sequelize** | ORM maduro para Node.js, mas tipagem TypeScript deficiente (tipos gerados, não inferidos), experiência de desenvolvimento inferior ao Prisma. |
| **Knex.js (query builder)** | Controle SQL total, boa performance. Sem ORM — requer mappers manuais entre resultado de query e entidades de domínio em todos os repositórios. Verbosidade elevada. |
| **SQL puro** | Controle máximo e zero overhead. Requer mappers completos em todos os repositórios, sem geração de types automática, gestão manual de migrations. Adequado para equipes especializadas em PostgreSQL. |

---

### Trade-offs

| Aspecto | Positivo | Negativo |
|---------|----------|----------|
| **Schema como código** | Uma fonte de verdade; migrations versionadas no repositório | Schema Prisma é uma DSL própria — não é SQL padrão |
| **Tipagem automática** | `prisma.incident.findMany()` retorna tipo correto sem declaração manual | Tipo gerado pelo Prisma pode não corresponder exatamente à entidade de domínio — necessita mapper |
| **Prisma Studio** | Visualização e edição do banco durante desenvolvimento | Disponível apenas localmente — não substituível por interface web em produção |
| **Migrations** | Geração automática de SQL a partir do diff do schema | Migrations complexas (rename de coluna, transformação de dados) precisam de ajuste manual |
| **Abstração** | Queries tipadas e expressivas sem SQL | Recursos avançados do PostgreSQL (window functions, CTEs complexas) exigem `$queryRaw` |

---

### Benefícios

**1. Tipagem Total sem Declaração Manual**
O Prisma Client gerado a partir do `schema.prisma` oferece tipos exatos para cada modelo e cada operação. `prisma.incident.findUnique({ where: { id } })` retorna `Incident | null` com todos os campos tipados. Impossível passar campo inexistente sem erro de compilação.

**2. Schema como Fonte de Verdade**
O arquivo `schema.prisma` define o banco de dados inteiro. Toda alteração de schema passa pelo arquivo, gera migration SQL auditável e é commitada junto com o código que a motivou. O histórico do banco de dados é o histórico do repositório.

**3. Migrations Versionadas e Determínísticas**
`prisma migrate dev` gera SQL determinístico a partir do diff entre o schema atual e o schema desejado. `prisma migrate deploy` aplica migrations pendentes em ordem — idempotente, auditável e reversível.

**4. Separação Natural entre Modelo Prisma e Entidade de Domínio**
O modelo Prisma (flat, snake_case, sem comportamento) é diferente da entidade de domínio (rich model, camelCase, com métodos). O mapper explícito entre os dois formaliza essa separação arquitetural e impede que o Prisma "vaze" para o domínio.

**5. Prisma Studio para Desenvolvimento**
Interface visual para navegar nos dados, executar queries e inspecionar relações durante o desenvolvimento — sem precisar de cliente SQL externo. Acessível via `npx prisma studio`.

---

### Riscos

| ID | Risco | Probabilidade | Impacto |
|----|-------|--------------|---------|
| R1 | N+1 queries acidental por uso incorreto de `include` aninhado | Média | Alto |
| R2 | Migration gerada incorretamente em rename de coluna (Prisma interpreta como drop + add) | Média | Crítico |
| R3 | Prisma Client regenerado automaticamente em CI quebrando tipos em uso | Baixa | Médio |
| R4 | Performance inferior ao SQL nativo em queries muito complexas de dashboard | Média | Médio |
| R5 | Breaking change no Prisma Client entre versões minor afeta queries existentes | Muito Baixa | Médio |

---

### Estratégias de Mitigação

| Risco | Mitigação |
|-------|-----------|
| R1 | Diretriz no `01_CLAUDE.md`: `include` explícito apenas nas relações necessárias para a query. Code review com checklist de performance. Logging de queries lentas habilitado em desenvolvimento. |
| R2 | Pipeline CI que valida migrations antes do deploy. Migrations destrutivas exigem aprovação do arquiteto e revisão manual do SQL gerado antes de merge. |
| R3 | `prisma generate` como etapa explícita no pipeline — não automático. Versão do Prisma lockada no `package.json`. |
| R4 | `prisma.$queryRaw<T>` permitido para queries de dashboard com justificativa documentada em comentário no código. Read models pré-computados no schema `dashboard` para evitar queries em tempo real. |
| R5 | Lock de versão. Atualização de Prisma apenas via PR dedicado com validação de todas as queries existentes. |

---

### Critério de Revisão

Esta decisão deve ser revisada se:
- Drizzle ORM atingir maturidade equivalente ao Prisma com vantagens claras de performance ou DX.
- Requisitos de queries emergem que o Prisma não suporta sem `$queryRaw` extensivo (>20% das queries).
- O modelo de licensing do Prisma mudar de forma que impacte o custo do projeto.

---

## ADR-005 — Vercel como Plataforma de Hospedagem

**Status:** Aceito
**Data:** 2026-06-09
**Autores:** Arquitetura Corporativa de TI

---

### Contexto

O frontend Next.js do SGTI precisa de uma plataforma de hospedagem que:
- Suporte SSR, SSG, ISR e Server Actions nativamente.
- Ofereça Preview Deployments para revisão de Pull Requests.
- Integre com GitHub para deploy automático.
- Permita rollback rápido em caso de incidente em produção.
- Ofereça plano gratuito suficiente para o MVP.
- Não exija configuração de servidor, load balancer ou certificado SSL manual.

---

### Decisão

Adotar **Vercel** como plataforma exclusiva de hospedagem do frontend Next.js do SGTI.

---

### Alternativas Consideradas

| Alternativa | Avaliação |
|-------------|-----------|
| **Netlify** | Plataforma madura com CI/CD integrado. Suporte a Next.js via adapter, mas sem as otimizações nativas da Vercel. Preview Deployments disponíveis. Alternativa viável, mas menor otimização para Next.js. |
| **GitHub Pages** | Apenas sites estáticos. Incompatível com SSR, Server Actions e Route Handlers do Next.js. |
| **Railway** | Adequado para backends containerizados. Plano gratuito com sleep após inatividade — inadequado para frontend em produção. |
| **Render** | Container-based, sem Edge Network global. Cold start elevado no plano gratuito. Adequado para backends, menos otimizado para Next.js. |
| **AWS Amplify** | Suporte a Next.js via adapter. Configuração mais complexa, custos menos previsíveis, overhead de gerenciamento AWS. |
| **Self-hosted (Docker + VPS)** | Controle total, custo mais baixo em volume. Requer configuração de servidor, SSL, load balancer, CI/CD — overhead operacional incompatível com equipe pequena. |
| **Cloudflare Pages** | Edge-first, excelente performance global. Suporte a Next.js via adapter com algumas limitações (sem suporte completo a todas as features do App Router). |

---

### Trade-offs

| Aspecto | Positivo | Negativo |
|---------|----------|----------|
| **Integração Next.js** | Otimizações exclusivas, zero configuração | Lock-in: algumas otimizações não estão disponíveis fora da Vercel |
| **Preview Deployments** | Ambiente real por PR, sem configuração | Consome minutos de build e bandwidth do plano gratuito |
| **Serverless Functions** | Escala automática, zero gerenciamento | Cold start (50-300ms) para funções não utilizadas recentemente |
| **Rollback** | 1 clique no dashboard, sem reverter código | Não reverte mudanças de banco de dados — requer coordenação |
| **Plano gratuito** | 100GB bandwidth/mês, 6.000 min build | Bandwidth esgota rapidamente se assets não forem cacheados no Cloudflare |

---

### Benefícios

**1. Plataforma Nativa do Next.js**
A Vercel é desenvolvida pela mesma equipe do Next.js. Features como ISR, Edge Middleware e Server Actions são implementadas e otimizadas na Vercel antes de qualquer outra plataforma. Zero configuração para funcionalidades que exigiriam adapters em outras plataformas.

**2. Preview Deployments por Pull Request**
Cada PR recebe uma URL única e funcional com o ambiente completo. Revisores podem testar o comportamento real — não apenas revisar código estático. Especialmente valioso para mudanças visuais em dashboards e formulários complexos do SGTI.

**3. Edge Network Global**
O frontend do SGTI é servido do ponto de presença mais próximo do usuário. Para uma organização com escritórios em múltiplas cidades, isso reduz latência de forma transparente sem configuração de CDN adicional.

**4. Rollback com Um Clique**
Em caso de incidente após deploy, qualquer deployment anterior pode ser reativado imediatamente no dashboard da Vercel — sem necessidade de reverter código, recriar build ou acionar processo de release emergencial.

**5. Variáveis de Ambiente por Ambiente**
`NEXT_PUBLIC_API_URL`, `SUPABASE_URL`, `GOOGLE_CLIENT_ID` são configurados separadamente para Development, Preview e Production no painel da Vercel. Sem arquivos `.env` no repositório, sem risco de vazar credenciais de produção.

---

### Riscos

| ID | Risco | Probabilidade | Impacto |
|----|-------|--------------|---------|
| R1 | Plano gratuito (100GB bandwidth) esgotado antes do upgrade | Baixa | Médio |
| R2 | Cold start de Serverless Functions degradando UX em horários de baixo uso | Média | Baixo |
| R3 | Lock-in: migração futura para outra plataforma exige refatoração | Baixa | Médio |
| R4 | Limite de 12 membros no plano gratuito inadequado para equipes maiores | Baixa | Baixo |
| R5 | Outage na Vercel afeta disponibilidade do frontend | Muito Baixa | Alto |

---

### Estratégias de Mitigação

| Risco | Mitigação |
|-------|-----------|
| R1 | Cloudflare como CDN na frente da Vercel cacheia assets estáticos — reduz bandwidth da Vercel em 70-80%. Monitorar uso mensal com alerta a 80GB. |
| R2 | `export const dynamic = 'force-static'` nas rotas que não precisam de SSR. Edge Runtime para middlewares de autenticação — sem cold start. |
| R3 | Server Actions e Route Handlers usam apenas padrões Next.js documentados — nenhuma API Vercel-específica no código. Migração para Netlify ou self-hosted é viável com adapter. |
| R4 | Plano Pro ($20/mês) quando equipe superar 3 membros — custo marginal justificado pela plataforma. |
| R5 | SLA da Vercel é 99,99%. Cloudflare pode servir página de manutenção estática se a Vercel ficar indisponível. Status monitorado em status.vercel.com. |

---

### Critério de Revisão

Esta decisão deve ser revisada se:
- Bandwidth do plano Pro for consistentemente superior a 80% por 3 meses seguidos.
- Cloudflare Pages adicionar suporte completo ao App Router do Next.js com vantagem de custo.
- A organização adotar infraestrutura on-premise que inviabilize o uso de plataformas cloud externas.

---

## ADR-006 — Cloudflare como Camada de Rede e Segurança

**Status:** Aceito
**Data:** 2026-06-09
**Autores:** Arquitetura Corporativa de TI

---

### Contexto

O SGTI é um sistema corporativo com dados sensíveis (identidades, compliance, financeiro) exposto à internet. A infraestrutura precisa de:
- DNS gerenciado com propagação rápida e alta disponibilidade.
- SSL/TLS automático e renovação sem intervenção manual.
- Proteção contra DDoS sem custo adicional.
- CDN global para reduzir latência e bandwidth da Vercel.
- Proxy reverso que oculte os IPs reais dos servidores.
- Regras de segurança configuráveis sem código (headers, redirecionamentos).
- Custo zero para as funcionalidades necessárias no MVP.

---

### Decisão

Adotar **Cloudflare** (plano gratuito) como camada de DNS, CDN, proxy reverso e segurança para toda a infraestrutura do SGTI.

---

### Alternativas Consideradas

| Alternativa | Avaliação |
|-------------|-----------|
| **AWS Route 53 + CloudFront** | DNS e CDN maduros e confiáveis. Custos por query DNS e por transferência de dados — complexidade de billing incompatível com política de custo zero do MVP. |
| **Google Cloud DNS + Cloud CDN** | Similar ao AWS em complexidade e modelo de cobrança. Sem vantagem clara sobre Cloudflare gratuito para o perfil do SGTI. |
| **DNS do registrador de domínio** | DNS básico sem CDN, sem proxy, sem proteção DDoS, sem regras de segurança. Inadequado para sistema corporativo. |
| **Vercel DNS** | Gerenciamento de DNS disponível no plano Pro da Vercel. Sem CDN para o backend, sem proteção DDoS independente, custo adicional. |
| **Fastly** | CDN premium com edge computing avançado. Sem plano gratuito relevante — inadequado para MVP com custo zero. |

---

### Trade-offs

| Aspecto | Positivo | Negativo |
|---------|----------|----------|
| **Proxy reverso** | IPs dos servidores ocultos; proteção automática | Cloudflare vê todo o tráfego — implicações de privacidade/compliance para dados sensíveis |
| **SSL automático** | Certificados renovados sem intervenção | Cloudflare SSL não é end-to-end por padrão — requer configuração "Full Strict" |
| **CDN** | Cache de assets reduz bandwidth da Vercel | Cache mal configurado pode servir dados desatualizados |
| **Rules gratuitas** | Redirecionamentos e headers sem código | Limite de 5 regras no plano gratuito |
| **DDoS protection** | Proteção L3/L4/L7 automática e ilimitada | Proteção avançada (Bot Management, WAF rules) apenas em planos pagos |

---

### Benefícios

**1. DNS com Propagação em Menos de 5 Minutos**
O DNS gerenciado pelo Cloudflare tem TTL configurável e propagação global acelerada. Mudanças de infraestrutura (novo backend, migração de servidor) refletem em minutos — não em horas como com registradores tradicionais.

**2. SSL/TLS Automático e Full Strict**
Certificados SSL emitidos e renovados automaticamente para todos os domínios e subdomínios do SGTI. Com modo "Full Strict", a comunicação é criptografada de ponta a ponta: cliente → Cloudflare (HTTPS) e Cloudflare → servidor (HTTPS com certificado válido). Sem SSL mixed content.

**3. Proteção DDoS Ilimitada e Automática**
O Cloudflare absorve ataques DDoS L3/L4/L7 na edge antes que cheguem aos servidores. Para um sistema corporativo com dados sensíveis, essa proteção é inestimável — especialmente considerando que é gratuita.

**4. CDN que Reduz Bandwidth da Vercel em 70-80%**
Assets estáticos do Next.js (JS, CSS, imagens) são cacheados no edge global do Cloudflare. O tráfego que chega à Vercel é apenas para SSR, Server Actions e dados dinâmicos — multiplicando a eficiência do plano gratuito da Vercel.

**5. Headers de Segurança sem Código**
`Strict-Transport-Security`, `X-Frame-Options`, `Content-Security-Policy` e `Referrer-Policy` configurados via Cloudflare Transform Rules — aplicados a todas as respostas sem modificar o código da aplicação ou a configuração da Vercel.

**6. Bot Fight Mode Gratuito**
Bloqueio automático de bots maliciosos conhecidos sem custo adicional — reduz carga no backend e protege formulários de login e autoatendimento contra ataques automatizados.

---

### Riscos

| ID | Risco | Probabilidade | Impacto |
|----|-------|--------------|---------|
| R1 | Cache do Cloudflare servindo conteúdo desatualizado para usuários | Média | Médio |
| R2 | Cloudflare como Man-in-the-Middle vê dados trafegados (implicações LGPD) | Baixa | Alto |
| R3 | Outage do Cloudflare afeta DNS e torna o sistema inacessível | Muito Baixa | Crítico |
| R4 | Limite de 5 Rules no plano gratuito insuficiente para todas as regras necessárias | Baixa | Baixo |
| R5 | Configuração incorreta do modo SSL (Flexible em vez de Full Strict) expõe tráfego | Média | Alto |

---

### Estratégias de Mitigação

| Risco | Mitigação |
|-------|-----------|
| R1 | Cache-Control headers explícitos nas respostas: `no-store` para rotas autenticadas, `public, max-age=300` para KB pública. Page Rules de Cloudflare para bypass de cache em `/api/*`. |
| R2 | Cloudflare é empresa americana com certificações SOC 2 Type II e ISO 27001. DPA (Data Processing Agreement) disponível e deve ser assinado. Dados em trânsito criptografados (Cloudflare não vê conteúdo de payloads HTTPS no modo proxy padrão). Avaliar Cloudflare Zero Trust se requisitos de compliance se tornarem mais rigorosos. |
| R3 | SLA do Cloudflare é 99,99% historicamente. Monitorar em cloudflarestatus.com. TTL mínimo de DNS configurado para propagação rápida se necessário switch de DNS. |
| R4 | Priorizar as 5 regras mais críticas (HTTPS redirect, HSTS, CSP, cache bypass API, bot protection). Upgrade para Pro ($20/mês) se mais de 5 regras forem necessárias. |
| R5 | Configuração documentada em `Docs/Operação/21_DEPLOYMENT_GUIDE.md`. Checklist de verificação pós-deploy inclui validação do modo SSL via SSL Labs. Alerta configurado para downgrade de certificado. |

---

### Critério de Revisão

Esta decisão deve ser revisada se:
- Requisitos de compliance exigirem que nenhum tráfego passe por terceiros (exigiria self-hosted edge proxy).
- O limite de 5 Rules gratuitas se tornar consistentemente insuficiente.
- Cloudflare alterar seus termos de serviço de forma incompatível com os dados do SGTI.

---

## ADR-007 — Modular Monolith como Estilo Arquitetural

**Status:** Aceito
**Data:** 2026-06-09
**Autores:** Arquitetura Corporativa de TI

---

### Contexto

O SGTI tem 14 módulos com fronteiras de domínio bem definidas pelo DDD. A decisão de estilo arquitetural determina como esses módulos são implantados: como um único processo (monolito) ou como processos independentes (microserviços).

---

### Decisão

Implementar o SGTI como **Modular Monolith** — único processo de deploy com módulos internamente isolados por fronteiras de DDD.

**Trade-offs resumidos:**

| Critério | Modular Monolith | Microserviços |
|----------|-----------------|---------------|
| Complexidade operacional | Baixa (1 processo) | Alta (N serviços + orquestração) |
| Transações ACID | Disponível nativamente | Requer sagas ou 2PC |
| Escala independente por módulo | Não (escala como unidade) | Sim |
| Deploy independente por módulo | Não | Sim |
| Custo de infraestrutura | Mínimo (1 instância) | Elevado (N instâncias) |
| Debugging e rastreamento | Simples (logs locais) | Complexo (distributed tracing) |
| Overhead de rede entre módulos | Zero (chamada local) | Latência de rede + serialização |

**Benefícios chave:** deploy simples, transações ACID, custo zero, debugging direto, adequado para equipe pequena e domínio em evolução.

**Riscos chave:** escala como unidade única; build e deploy acoplados para todos os módulos; risco de degradação das fronteiras ao longo do tempo ("Big Ball of Mud").

**Mitigação principal:** regras de linting que impedem imports entre módulos, comunicação exclusiva via EventBus, schemas de banco isolados, revisão arquitetural trimestral.

*Para especificação completa, ver [ADR-001 em 12_ARCHITECTURE.md](./12_ARCHITECTURE.md#adr-001--modular-monolith-em-vez-de-microserviços).*

---

## ADR-008 — TypeScript Ponta a Ponta

**Status:** Aceito
**Data:** 2026-06-09
**Autores:** Arquitetura Corporativa de TI

---

### Contexto

O SGTI tem frontend (Next.js), backend (NestJS) e tipos de domínio compartilhados entre eles. A escolha de linguagem determina se os contratos entre camadas são verificados em tempo de compilação ou apenas em runtime.

---

### Decisão

TypeScript com `"strict": true` é a **única linguagem** permitida em toda a codebase do SGTI — frontend, backend e packages compartilhados.

**Trade-offs:**

| Aspecto | Positivo | Negativo |
|---------|----------|----------|
| **Strict mode** | Elimina categorias inteiras de bugs em compile time | Curva de aprendizado maior; mais verbosidade em alguns casos |
| **Tipos compartilhados** | Frontend e backend compartilham DTOs via `packages/shared-types/` | Acoplamento de tipos entre camadas exige gestão cuidadosa de versões |
| **Homogeneidade** | Um desenvolvedor transita entre frontend e backend sem mudança de contexto | Casos de uso que se beneficiariam de linguagens específicas (Python para ML) ficam fora do projeto |

**Benefícios chave:** contrato entre camadas verificado pelo compilador, refatoração segura, documentação viva via tipos, produtividade com IntelliSense.

**Riscos chave:** uso de `any` pode anular os benefícios da tipagem; geração automática de tipos (Prisma, OpenAPI) pode introduzir tipos incorretos se não revisados.

**Mitigação principal:** `"noImplicitAny": true` no tsconfig, ESLint rule `@typescript-eslint/no-explicit-any` com `error` (não `warn`), `@ts-ignore` proibido.

---

## ADR-009 — JWT RS256 para Autenticação Stateless

**Status:** Aceito
**Data:** 2026-06-09
**Autores:** Arquitetura Corporativa de TI

---

### Contexto

O SGTI precisa de um mecanismo de autenticação que funcione em ambiente serverless (Vercel), sem estado compartilhado entre instâncias, suporte múltiplos módulos validando tokens de forma independente e permita evolução para microserviços no futuro.

---

### Decisão

Emitir **JWT RS256** (chave assimétrica) como token de sessão do SGTI após autenticação via Google OAuth 2.0.

**Trade-offs:**

| Algoritmo | Vantagem | Desvantagem |
|-----------|----------|-------------|
| **RS256** (assimétrico) | Chave privada isolada no Auth module; verificação descentralizada com chave pública | Par de chaves requer rotação periódica e armazenamento seguro |
| **HS256** (simétrico) | Mais simples de implementar | Chave secreta compartilhada entre todos os verificadores — risco de vazamento |
| **Session cookies** | Revogação imediata garantida | Requer armazenamento de sessão compartilhado — inviável em serverless sem Redis |

**Benefícios chave:** stateless (funciona em serverless), verificação descentralizada (cada módulo valida sem chamar o Auth module), preparado para microserviços (chave pública distribuída).

**Riscos chave:** JWT roubado é válido até expirar; tokens com claims desatualizados (usuário rebaixado de papel durante sessão ativa).

**Mitigação principal:** Access Token de 1 hora (limite de exposição), Refresh Token com rotação (detecta roubo), blacklist de tokens revogados verificada no JwtAuthGuard para suspensões imediatas.

---

## ADR-010 — Google OAuth 2.0 como Único Provedor de Identidade

**Status:** Aceito
**Data:** 2026-06-09
**Autores:** Arquitetura Corporativa de TI

---

### Contexto

O SGTI é um sistema corporativo onde todos os usuários já possuem conta Google Workspace. Gerenciar credenciais locais (senha + hash + reset) duplica responsabilidade de segurança sem adicionar valor.

---

### Decisão

Autenticação exclusivamente via **Google OAuth 2.0** — sem senha local, sem outros providers.

**Trade-offs:**

| Aspecto | Positivo | Negativo |
|---------|----------|----------|
| **Sem senhas locais** | Zero superfície de ataque de credenciais; zero gestão de reset | Dependência total do Google Workspace para autenticação |
| **SSO automático** | Usuários já autenticados no Google entram sem fricção | Se Google Workspace tiver outage, SGTI fica inacessível |
| **MFA herdado** | MFA configurado no Google Workspace aplica-se ao SGTI automaticamente | Controle de MFA delegado ao administrador do Google Workspace |

**Benefícios chave:** zero gestão de credenciais, MFA gratuito via Google, desativação no Google Workspace revoga acesso imediatamente, sem banco de senhas para proteger.

**Riscos chave:** disponibilidade do SGTI depende da disponibilidade do Google (SLA 99,9%); conta Google comprometida compromete acesso ao SGTI.

**Mitigação principal:** o Google tem SLA de 99,9% — mais confiável do que autenticação própria. MFA obrigatório via política do Google Workspace. Sessões de 1 hora limitam exposição de contas comprometidas.

---

## ADR-011 — EventBus Interno para Comunicação Entre Módulos

**Status:** Aceito
**Data:** 2026-06-09
**Autores:** Arquitetura Corporativa de TI

---

### Contexto

Os 14 módulos do SGTI precisam se comunicar (ex: quando um incidente é resolvido, o módulo de Notificação envia e-mail, o módulo de Dashboard atualiza projeções e o módulo de Base de Conhecimento sugere criação de artigo). Comunicação direta entre módulos violaria as fronteiras do DDD.

---

### Decisão

Toda comunicação assíncrona entre módulos via **EventBus interno** implementado com `EventEmitter2` do NestJS.

**Trade-offs:**

| Abordagem | Vantagem | Desvantagem |
|-----------|----------|-------------|
| **EventBus interno (EventEmitter2)** | Zero infra, zero latência, transacional com o evento de domínio | Sem persistência; se o processo cair durante processamento de evento, evento é perdido |
| **RabbitMQ/SQS externo** | Eventos persistidos, entrega garantida, escala independente | Requer infraestrutura adicional; custo; complexidade operacional |
| **Chamada direta entre módulos** | Simples, síncrono | Viola fronteiras DDD; acoplamento forte; dificulta extração futura para microserviços |

**Benefícios chave:** acoplamento mínimo entre módulos, mesmo padrão que será usado com message broker externo no futuro, zero custo de infraestrutura.

**Riscos chave:** perda de eventos em caso de crash do processo durante processamento (janela de risco mínima em serverless).

**Mitigação principal:** operações críticas usam Outbox Pattern (evento persiste no banco como parte da transação; worker separado entrega ao EventBus). Dashboard usa projeções idempotentes — reprocessamento seguro.

---

## ADR-012 — CQRS Parcial para Dashboards

**Status:** Aceito
**Data:** 2026-06-09
**Autores:** Arquitetura Corporativa de TI

---

### Contexto

Os dashboards do SGTI precisam apresentar KPIs agregados de múltiplos módulos (MTTR de Incidentes, custo de Finance, maturidade de Compliance) em tempo real. JOINs SQL entre schemas distintos violam fronteiras do DDD e seriam lentos.

---

### Decisão

Implementar **CQRS parcial** apenas no módulo Dashboard: read models (projeções desnormalizadas) mantidos no schema `dashboard`, atualizados por event handlers que consomem eventos de domínio de todos os módulos.

**Trade-offs:**

| Aspecto | Positivo | Negativo |
|---------|----------|----------|
| **Read models próprios** | Queries O(1) sem JOINs; sem violação de fronteiras DDD | Eventual consistency (defasagem de segundos entre evento e projeção) |
| **CQRS apenas no Dashboard** | Complexidade limitada; demais módulos usam modelo simples | Inconsistência arquitetural (alguns módulos com CQRS, outros sem) |
| **Projeções idempotentes** | Reprocessamento de eventos é seguro | Event handlers de projeção precisam ser escritos com cuidado |

**Benefícios chave:** queries de KPI em tempo constante, desacoplamento total do lado de escrita, atualizações em tempo real via Supabase Realtime.

**Riscos chave:** eventual consistency pode mostrar dados com alguns segundos de defasagem; complexidade adicional nos event handlers.

**Mitigação principal:** defasagem de segundos é aceitável para KPIs operacionais e executivos. Supabase Realtime reduz defasagem percebida. Projeções com `updated_at` explícito informam ao usuário quando os dados foram atualizados pela última vez.

---

## Resumo das Decisões

| ADR | Decisão | Alternativa Principal Rejeitada | Motivo Principal da Rejeição |
|-----|---------|--------------------------------|------------------------------|
| 001 | NestJS | Express.js | Sem DI nativa, sem modularidade estruturada |
| 002 | Next.js App Router | Vite + React SPA | Sem SSR, sem Server Actions, sem integração Vercel |
| 003 | Supabase | PostgreSQL self-hosted | Overhead operacional incompatível com equipe pequena |
| 004 | Prisma | TypeORM | Tipagem menos robusta, Active Record vaza banco no domínio |
| 005 | Vercel | Netlify | Otimizações nativas Next.js, Preview Deployments |
| 006 | Cloudflare | AWS Route 53 + CloudFront | Custo por query e transferência incompatível com custo zero |
| 007 | Modular Monolith | Microserviços | Overhead operacional, transações distribuídas, custo |
| 008 | TypeScript strict | JavaScript | Sem verificação de tipos entre camadas |
| 009 | JWT RS256 | Session cookies | Incompatível com serverless sem estado compartilhado |
| 010 | Google OAuth 2.0 | Credenciais locais | Duplica superfície de ataque sem adicionar valor |
| 011 | EventBus interno | Chamada direta entre módulos | Viola fronteiras DDD, acopla módulos |
| 012 | CQRS parcial (Dashboard) | JOINs SQL entre schemas | Viola fronteiras DDD, performance inadequada |

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição da Alteração |
|--------|------|-------|------------------------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa | Criação do documento com 12 ADRs |

---

> **Documentos relacionados:**
> [`12_ARCHITECTURE.md`](./12_ARCHITECTURE.md) — Arquitetura corporativa completa do SGTI
> [`11_TECH_STACK.md`](./11_TECH_STACK.md) — Stack tecnológica com limites e justificativas
> [`01_CLAUDE.md`](./01_CLAUDE.md) — Regras permanentes de implementação para o Claude Code
ENDDOC