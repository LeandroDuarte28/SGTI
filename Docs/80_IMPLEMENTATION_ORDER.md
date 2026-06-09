# SGTI — Sistema de Gestão de Tecnologia da Informação
## Ordem Oficial de Implementação

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [12_ARCHITECTURE.md](./12_ARCHITECTURE.md) · [11_TECH_STACK.md](./11_TECH_STACK.md) · [01_CLAUDE.md](./01_CLAUDE.md) · [82_ARCHITECT_DECISIONS.md](./82_ARCHITECT_DECISIONS.md)

---

## Sobre este Documento

Este documento define a **ordem oficial e obrigatória de implementação** do SGTI. A sequência não é arbitrária — é determinada por dependências técnicas entre módulos, pelo risco de cada entrega e pelo princípio de que nenhuma camada superior pode ser construída sem que a inferior esteja estável.

Cada fase tem **objetivo claro**, **dependências explícitas** e **critérios de conclusão verificáveis**. Uma fase só pode ser considerada concluída quando todos os seus critérios forem atendidos. O início da fase seguinte depende da conclusão da anterior.

### Princípios desta Ordem

- **Fundação antes de funcionalidade:** infraestrutura, banco e autenticação precedem qualquer módulo de negócio.
- **Domínio central antes de domínio de suporte:** Service Desk (Incidentes, Requisições, Problemas) precede módulos de suporte (Compliance, Financeiro).
- **Integração após estabilidade:** integrações externas (GLPI, Google Workspace) são implementadas após os módulos internos correspondentes estarem funcionando de forma autônoma.
- **Observabilidade antes de produto final:** testes, dashboards e relatórios são construídos progressivamente — não apenas no final.
- **Deploy contínuo desde o início:** a estratégia de CI/CD é configurada na fase 1 e utilizada em todas as fases subsequentes.

### Visão do Roadmap

```
FUNDAÇÃO          CORE DOMAIN          SUPORTE          PRODUTO COMPLETO
─────────         ────────────         ───────          ────────────────
Fase 01           Fase 04              Fase 10          Fase 17
Estrutura Base    Catálogo             Ativos           Base Conhecimento

Fase 02           Fase 05              Fase 11          Fase 18
Banco de Dados    SLA                  Integração GLPI  Dashboards

Fase 03           Fase 06              Fase 12          Fase 19
Autenticação      Incidentes           Identidades      APIs Públicas

                  Fase 07              Fase 13          Fase 20
                  Requisições          Google Workspace Relatórios

                  Fase 08              Fase 14          Fase 21
                  Problemas            Compliance       Testes

                                       Fase 15          Fase 22
                                       Financeiro       Deploy

                                       Fase 16
                                       Compras + Projetos
```

---

## Sumário de Fases

| Fase | Nome | Categoria | Semanas Estimadas |
|------|------|-----------|------------------|
| [01](#fase-01--estrutura-base) | Estrutura Base | Fundação | 1–2 |
| [02](#fase-02--banco-de-dados) | Banco de Dados | Fundação | 1–2 |
| [03](#fase-03--autenticação) | Autenticação | Fundação | 1 |
| [04](#fase-04--catálogo-de-serviços) | Catálogo de Serviços | Core Domain | 1 |
| [05](#fase-05--sla) | SLA | Core Domain | 1 |
| [06](#fase-06--incidentes) | Incidentes | Core Domain | 2–3 |
| [07](#fase-07--requisições) | Requisições | Core Domain | 1–2 |
| [08](#fase-08--problemas) | Problemas | Core Domain | 1 |
| [09](#fase-09--ativos) | Ativos | Supporting Domain | 2 |
| [10](#fase-10--integração-glpi) | Integração GLPI | Integração | 1–2 |
| [11](#fase-11--identidades) | Identidades | Supporting Domain | 2 |
| [12](#fase-12--google-workspace) | Google Workspace | Integração | 1 |
| [13](#fase-13--compliance) | Compliance | Supporting Domain | 2 |
| [14](#fase-14--financeiro) | Financeiro | Supporting Domain | 2 |
| [15](#fase-15--compras) | Compras | Supporting Domain | 1–2 |
| [16](#fase-16--projetos) | Projetos | Supporting Domain | 1–2 |
| [17](#fase-17--base-de-conhecimento) | Base de Conhecimento | Supporting Domain | 1–2 |
| [18](#fase-18--dashboards) | Dashboards | Produto | 2–3 |
| [19](#fase-19--apis-públicas) | APIs Públicas | Produto | 1–2 |
| [20](#fase-20--relatórios) | Relatórios | Produto | 1–2 |
| [21](#fase-21--testes) | Testes | Qualidade | 2 |
| [22](#fase-22--deploy) | Deploy | Produção | 1 |

**Total estimado:** 32–42 semanas de desenvolvimento.

---

## Fase 01 — Estrutura Base

### Objetivo

Criar o esqueleto completo do projeto — monorepo, configurações de TypeScript, lint, formatação, CI/CD básico e estrutura de pastas. Esta fase não entrega funcionalidade de negócio, mas estabelece todas as convenções e ferramentas que serão usadas pelo restante do projeto.

Nenhuma linha de código de negócio deve ser escrita sem que esta fase esteja concluída e todos os critérios atendidos.

### O que é implementado

**Monorepo (Turborepo):**
- Configuração do `turbo.json` com pipelines `build`, `test`, `lint` e `type-check`.
- Workspaces: `apps/web`, `apps/api`, `packages/database`, `packages/shared-types`.
- Scripts unificados no `package.json` raiz.

**Backend — NestJS:**
- Projeto NestJS com `AppModule` raiz configurado.
- `main.ts` com `ValidationPipe` global, `Helmet`, `CORS` e prefixo `/api`.
- `GlobalExceptionFilter` mapeando exceções de domínio para HTTP.
- Estrutura de pastas `src/modules/`, `src/shared/` criada.
- Shared Kernel: `BaseEntity`, `BaseAggregate`, `DomainEvent`, `ValueObject`, `IUseCase`, `IEventBus`.
- EventBus com `EventEmitter2`.
- Logger estruturado com Winston.
- `AuditInterceptor` global (stub — só loga por enquanto).

**Frontend — Next.js:**
- Projeto Next.js com App Router.
- Layout raiz `app/layout.tsx` com providers de tema.
- Route Groups: `(auth)` e `(public)`.
- Middleware de autenticação (stub — redireciona para `/login`).
- Componentes base do shadcn/ui instalados: `Button`, `Input`, `Label`, `Card`, `Badge`, `Sidebar`, `Avatar`.
- Tema corporativo configurado em `tailwind.config.ts`.

**Tooling:**
- ESLint com regras de `no-restricted-imports` por módulo.
- Prettier configurado com `prettier.config.js`.
- `tsconfig.json` com `strict: true` e path aliases (`@domain/`, `@application/`, `@shared/`).
- Husky + lint-staged para pre-commit hooks.

**CI/CD:**
- `.github/workflows/ci.yml` com lint, type-check, test e build.
- `.github/workflows/cd.yml` stub (deploy configurado na Fase 22).
- Branch protection rules em `main` e `staging`.

**Documentação:**
- `CLAUDE.md` na raiz do repositório (derivado de `Docs/01_CLAUDE.md`).
- `.env.example` com todas as variáveis necessárias (sem valores reais).
- `README.md` do repositório com instruções de setup local.

### Dependências

Nenhuma. Esta é a fase inaugural.

**Pré-requisitos externos:**
- Repositório GitHub criado com branch `main` e `develop`.
- Projeto Vercel criado e vinculado ao repositório.
- Projeto Supabase criado com PostgreSQL disponível.
- Node.js 20 LTS instalado no ambiente de desenvolvimento.

### Critérios de Conclusão

- [ ] `pnpm install` executa sem erros a partir da raiz do monorepo.
- [ ] `pnpm build` conclui com sucesso para `apps/web` e `apps/api`.
- [ ] `pnpm lint` retorna zero erros e zero warnings em todo o monorepo.
- [ ] `pnpm type-check` retorna zero erros em todo o monorepo.
- [ ] `pnpm test` executa a suite de testes (vazia por ora) sem falhas.
- [ ] Pipeline CI no GitHub Actions passa para um PR de teste.
- [ ] Tentativa de import de um módulo dentro de outro módulo falha no lint.
- [ ] `apps/api` inicia com `nest start` sem erros e responde `200` em `GET /api/health`.
- [ ] `apps/web` inicia com `next dev` sem erros e renderiza a página inicial.
- [ ] Shared Kernel compilado e importável por `apps/api`.
- [ ] `.env.example` documenta todas as variáveis com descrição de cada uma.

---

## Fase 02 — Banco de Dados

### Objetivo

Configurar o schema completo do banco de dados PostgreSQL via Prisma, incluindo todos os schemas isolados por módulo, tabelas base, enums, índices e políticas RLS iniciais. Esta fase estabelece a estrutura de dados que toda a aplicação utilizará.

O schema é definido **inteiro** nesta fase — não incrementalmente por módulo — para que as migrations sejam ordenadas, coerentes e reflitam as dependências entre tabelas desde o início.

### O que é implementado

**Configuração Prisma:**
- `packages/database/schema.prisma` com `datasource` apontando para Supabase PostgreSQL.
- Connection URL com PgBouncer (`?pgbouncer=true`) e Direct URL para migrations.
- Generator do Prisma Client configurado.

**Schemas PostgreSQL (um por módulo):**
```
auth          → sessions, refresh_tokens
identity      → user_identities, user_roles, access_reviews
catalog       → service_catalog_items, service_categories
sla           → sla_definitions, sla_breaches
incident      → incidents, incident_comments, escalation_records
request       → service_requests, approval_steps, fulfillment_records
problem       → problems, known_errors, root_cause_analyses
asset         → assets, software_licenses, asset_maintenance_records
compliance    → compliance_controls, policies, audit_cycles,
                non_conformances, evidences
finance       → budgets, contracts, expenses
procurement   → purchase_orders, suppliers, receiving_records
project       → projects, milestones, risks, github_refs
knowledge     → knowledge_articles, article_versions, article_feedback
notification  → notifications, notification_preferences
email_log     → email_messages
dashboard     → [todas as projeções — ver Fase 18]
shared        → audit_log, system_logs, sync_failures
```

**Tabelas compartilhadas (schema `shared`):**
- `audit_log`: `id`, `user_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `occurred_at`, `ip_address`.
- `system_logs`: `id`, `level`, `message`, `context`, `created_at`.
- `sync_failures`: `id`, `integration`, `operation`, `payload`, `error`, `attempts`, `next_retry_at`.

**Row Level Security:**
- RLS habilitado em todas as tabelas de todos os schemas.
- Políticas base criadas para `auth` e `identity`.
- Tabela `audit_log` com política INSERT-only (sem UPDATE, sem DELETE).

**Índices iniciais:**
- Índices em colunas de filtro frequente: `status`, `created_at`, `assignee_id`, `user_id`.
- Índices únicos em: `asset.tag`, `identity.email`, `auth.refresh_token`.

**Seed de dados:**
- Script `packages/database/seed.ts` com dados mínimos para desenvolvimento:
  - 1 usuário Super Admin.
  - Categorias padrão do Catálogo de Serviços (stubs).
  - SLA definitions padrão (Crítico, Alto, Médio, Baixo).

### Dependências

- **Fase 01** concluída (Prisma instalado no monorepo, estrutura de pastas criada).
- Projeto Supabase com PostgreSQL disponível e senha de serviço configurada.

### Critérios de Conclusão

- [ ] `prisma migrate dev` executa sem erros com todas as migrations aplicadas.
- [ ] `prisma migrate deploy` executa sem erros em ambiente de staging.
- [ ] `prisma studio` abre e exibe todas as tabelas criadas.
- [ ] `prisma db seed` executa sem erros e cria os dados iniciais.
- [ ] Tentativa de `DELETE` na tabela `audit_log` é rejeitada pelo RLS.
- [ ] Tentativa de acesso a dados de outro usuário é rejeitada pelo RLS.
- [ ] Todos os schemas estão isolados — nenhuma foreign key cruzando schemas.
- [ ] `pnpm type-check` passa com os tipos do Prisma Client gerados.
- [ ] Migration de rollback documentada em `Docs/Operação/21_DEPLOYMENT_GUIDE.md`.

---

## Fase 03 — Autenticação

### Objetivo

Implementar o fluxo completo de autenticação: Google OAuth 2.0, emissão de JWT RS256, refresh token com rotação, logout e proteção de rotas. Esta fase é o portão de entrada do sistema — nenhum módulo de negócio é acessível sem que a autenticação esteja funcionando.

### O que é implementado

**Backend — AuthModule:**
- `AuthController`: `GET /api/auth/google`, `GET /api/auth/callback`, `POST /api/auth/refresh`, `POST /api/auth/logout`.
- `GoogleOAuthAdapter` implementando `IGoogleOAuthPort`.
- Emissão de JWT RS256 com claims: `{ sub, email, name, role, modules, orgUnit, iat, exp }`.
- Access Token TTL: 1 hora.
- Refresh Token: opaco, armazenado em `auth.refresh_tokens`, TTL 7 dias, rotação a cada uso.
- Cookies: `access_token` e `refresh_token` com `HttpOnly`, `Secure`, `SameSite=Strict`.
- `JwtAuthGuard` lendo JWT do cookie e populando `Request.user`.
- `RolesGuard` verificando `role` nos claims.
- `@CurrentUser()` decorator para acessar usuário autenticado nos controllers.
- Blacklist de tokens revogados verificada no `JwtAuthGuard`.
- `GET /api/auth/me` retornando dados do usuário autenticado.
- `GET /api/health` público retornando status do sistema.

**Frontend — AuthModule:**
- Página `/login` com botão "Entrar com Google".
- Middleware Next.js redirecionando rotas `(auth)` para `/login` se sem cookie.
- Hook `useCurrentUser()` para acessar dados do usuário autenticado em Client Components.
- Server Action `getSession()` para Server Components.
- Página de callback OAuth (`/api/auth/callback`) como Route Handler.
- Redirecionamento pós-login para `/dashboard`.
- Layout `(auth)/layout.tsx` com Sidebar e Header com dados do usuário.

**Par de chaves RS256:**
- Geração documentada no `Docs/Operação/21_DEPLOYMENT_GUIDE.md`.
- Chave privada em variável de ambiente `JWT_PRIVATE_KEY`.
- Chave pública em variável de ambiente `JWT_PUBLIC_KEY`.

### Dependências

- **Fase 01** concluída (NestJS configurado, Guards no Shared Kernel).
- **Fase 02** concluída (tabelas `auth.sessions` e `auth.refresh_tokens` criadas).
- Google Cloud Console com OAuth 2.0 Client ID e Secret configurados.
- Variáveis de ambiente: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY`, `NEXTAUTH_URL`.

### Critérios de Conclusão

- [ ] Fluxo completo: clicar "Entrar com Google" → autenticar no Google → redirecionar para `/dashboard` autenticado.
- [ ] JWT decodificado contém todos os claims esperados com tipos corretos.
- [ ] Cookie `access_token` com flags `HttpOnly`, `Secure`, `SameSite=Strict` confirmados no browser.
- [ ] `GET /api/auth/me` retorna dados do usuário autenticado.
- [ ] Requisição sem cookie retorna `401 Unauthorized`.
- [ ] Requisição com token expirado retorna `401 Unauthorized`.
- [ ] `POST /api/auth/refresh` com refresh token válido emite novo access token e rotaciona o refresh token.
- [ ] Refresh token antigo rejeitado após rotação.
- [ ] `POST /api/auth/logout` invalida o refresh token no banco e limpa cookies.
- [ ] Rotas do grupo `(auth)` redirecionam para `/login` sem cookie.
- [ ] `GET /api/health` retorna `200` sem autenticação.
- [ ] Pipeline CI passa com testes unitários do `AuthModule`.

---

## Fase 04 — Catálogo de Serviços

### Objetivo

Implementar o Catálogo de Serviços — o repositório formal de todos os serviços de TI oferecidos, com categorias, descrições e parâmetros. O Catálogo é consultado pelos módulos de Incidentes, Requisições e SLA para determinar categorias válidas e parâmetros de atendimento.

### O que é implementado

**Backend — CatalogModule:**
- Entidade `ServiceCatalogItem` com campos: `id`, `name`, `description`, `category`, `audience`, `status`, `version`.
- Value Objects: `CatalogItemStatus` (`DRAFT`, `PUBLISHED`, `DEPRECATED`), `CatalogItemAudience` (`END_USER`, `TECHNICAL`).
- Use Cases: `PublishCatalogItemUseCase`, `DeprecateCatalogItemUseCase`, `ListCatalogItemsUseCase`, `GetCatalogItemUseCase`.
- `CatalogController`: `GET /api/catalog`, `GET /api/catalog/:id`, `POST /api/catalog`, `PATCH /api/catalog/:id`.
- Cache in-memory do catálogo com TTL de 5 minutos (consultado em todo chamado aberto).
- `IServiceCatalogPort` definido para uso pelo módulo de Incidentes.

**Frontend:**
- Página `/catalog` com listagem de serviços publicados.
- Página `/catalog/:id` com detalhes do serviço.
- Página `/admin/catalog` para gestão do catálogo (role `IT_MANAGER`+).
- Componente `CatalogItemCard` com shadcn/ui.

### Dependências

- **Fase 03** concluída (autenticação e RBAC funcionando).
- **Fase 02** concluída (tabela `catalog.service_catalog_items` criada).

### Critérios de Conclusão

- [ ] `GET /api/catalog` retorna lista de itens publicados sem autenticação.
- [ ] `POST /api/catalog` cria item com role `IT_MANAGER` e retorna `201`.
- [ ] `POST /api/catalog` retorna `403` para role `END_USER`.
- [ ] Cache de catálogo funciona: segundo request dentro de 5 minutos não bate no banco.
- [ ] `IServiceCatalogPort` implementado e testado com `InMemoryCatalogAdapter` nos testes de Incidentes.
- [ ] Seed inclui ao menos 10 itens de catálogo publicados para desenvolvimento.
- [ ] Página `/catalog` renderiza lista com filtro por categoria.

---

## Fase 05 — SLA

### Objetivo

Implementar o motor de SLA — definição de acordos por prioridade, cálculo de deadlines, monitoramento de violações e publicação de alertas. O SLA precede os módulos de Incidentes e Requisições porque é consultado no momento de abertura de qualquer chamado.

### O que é implementado

**Backend — SlaModule:**
- Entidade `SlaDefinition` com campos: `id`, `priority`, `catalogItemId?`, `responseMinutes`, `resolutionMinutes`, `workingHoursOnly`, `pauseOnWeekends`.
- Value Objects: `SlaTarget` (`responseDeadline`, `resolutionDeadline`, `isPaused`, `pausedAt`), `SlaStatus` (`ON_TRACK`, `AT_RISK`, `BREACHED`).
- Domain Service: `SlaCalculationService` — calcula deadline considerando horário comercial.
- Use Cases: `CreateSlaDefinitionUseCase`, `CalculateSlaTargetUseCase`, `PauseSlaUseCase`, `ResumeSlaUseCase`.
- `SlaController`: `GET /api/sla/definitions`, `POST /api/sla/definitions`, `GET /api/sla/:incidentId/status`.
- Scheduled Job (`@nestjs/schedule`) a cada 5 minutos: `SlaMonitoringJob` que identifica SLAs em risco e publica evento `SlaAtRisk`.
- Evento `SlaAtRisk` publicado no EventBus com `incidentId`, `type` (`RESPONSE` | `RESOLUTION`), `minutesRemaining`.
- Evento `SlaBreached` publicado quando deadline é ultrapassado.

**Frontend:**
- Componente `SlaStatusBadge` com cores por status (verde/amarelo/vermelho).
- Componente `SlaCountdown` mostrando tempo restante em tempo real.

### Dependências

- **Fase 03** concluída (autenticação).
- **Fase 04** concluída (`ServiceCatalogItem` existe para associação de SLA).
- **Fase 02** concluída (tabelas `sla.sla_definitions` e `sla.sla_breaches` criadas).

### Critérios de Conclusão

- [ ] `SlaCalculationService.calculate({ priority: 'CRITICAL', openedAt })` retorna deadline correto respeitando horário comercial.
- [ ] `SlaCalculationService` com `workingHoursOnly=true` ignora fins de semana no cálculo.
- [ ] Job de monitoramento executa a cada 5 minutos sem erros.
- [ ] Evento `SlaAtRisk` publicado quando `minutesRemaining < 30`.
- [ ] Evento `SlaBreached` publicado quando deadline é ultrapassado.
- [ ] Pausa de SLA não conta o tempo pausado no cálculo do deadline.
- [ ] Testes unitários cobrem `SlaCalculationService` com cenários de horário comercial, fim de semana e feriado.
- [ ] `ISlaDomainService` disponível para uso pelos módulos de Incidentes e Requisições.

---

## Fase 06 — Incidentes

### Objetivo

Implementar o ciclo completo de gestão de incidentes — o módulo central do SGTI. Esta é a entrega de maior valor para o usuário e a mais complexa em termos de fluxos, regras de negócio e integrações internas.

### O que é implementado

**Backend — IncidentModule:**
- Entidade `Incident` com agregado completo (ver `12_ARCHITECTURE.md` seção 6.1).
- Value Objects: `IncidentStatus`, `Priority`, `ImpactLevel`, `UrgencyLevel`, `SlaTarget`, `ResolutionDetails`.
- Domain Service: `PriorityMatrixDomainService` calculando prioridade por matriz 4×4.
- Use Cases completos: `OpenIncidentUseCase`, `AssignIncidentUseCase`, `EscalateIncidentUseCase`, `ResolveIncidentUseCase`, `CloseIncidentUseCase`, `ReopenIncidentUseCase`, `AddCommentUseCase`, `PauseSlaUseCase`, `LinkKnowledgeArticleUseCase`.
- `IncidentController` com endpoints: `POST /api/incidents`, `GET /api/incidents`, `GET /api/incidents/:id`, `PATCH /api/incidents/:id/assign`, `PATCH /api/incidents/:id/resolve`, `PATCH /api/incidents/:id/close`, `POST /api/incidents/:id/comments`.
- Eventos publicados: `IncidentOpened`, `IncidentAssigned`, `IncidentEscalated`, `IncidentResolved`, `IncidentClosed`, `IncidentReopened`.
- Event Handlers: `SlaEventHandler` (pausa/retoma SLA), `NotificationEventHandler` (stub — ativado na Fase 18).
- `IGlpiTicketSyncPort` definido (implementação stub — ativado na Fase 10).
- Pesquisa full-text em título e descrição via PostgreSQL `tsvector`.

**Frontend:**
- Página `/incidents` com DataTable paginado e filtros por status, prioridade e técnico.
- Página `/incidents/new` com formulário de abertura.
- Página `/incidents/:id` com detalhes, timeline de eventos e formulário de comentário.
- Sidebar com contador de incidentes abertos em tempo real.
- Componentes: `IncidentStatusBadge`, `PriorityBadge`, `SlaStatusBadge`, `IncidentTimeline`.
- Portal de autoatendimento: página `/my-incidents` para usuário final.

### Dependências

- **Fase 03** concluída (autenticação e RBAC).
- **Fase 04** concluída (`IServiceCatalogPort` disponível).
- **Fase 05** concluída (`SlaCalculationService` e `SlaMonitoringJob` disponíveis).
- **Fase 02** concluída (tabelas do schema `incident` criadas).

### Critérios de Conclusão

- [ ] Fluxo completo: abrir → atribuir → resolver → fechar sem erros.
- [ ] Prioridade calculada automaticamente pela matriz impacto × urgência.
- [ ] SLA deadline calculado e salvo no momento de abertura.
- [ ] Evento `IncidentOpened` publicado e consumido pelo `SlaEventHandler`.
- [ ] Evento `IncidentResolved` publicado e consumido (stub de Notification não causa erro).
- [ ] Escalonamento automático ao atingir 80% do tempo de resolução.
- [ ] `GET /api/incidents` retorna apenas incidentes visíveis para o papel do usuário (RLS + Guard).
- [ ] `POST /api/incidents` com role `END_USER` cria incidente com status `OPEN`.
- [ ] Pesquisa full-text retorna resultados relevantes.
- [ ] Reabertura de incidente já fechado registra justificativa obrigatória.
- [ ] Cobertura de testes unitários ≥ 90% na camada de domínio.
- [ ] Cobertura de testes de integração ≥ 85% nos Use Cases.

---

## Fase 07 — Requisições

### Objetivo

Implementar a gestão de requisições de serviço com fluxos de aprovação configuráveis por tipo de serviço. As requisições são o segundo canal mais utilizado do SGTI e dependem diretamente do Catálogo de Serviços para determinar o fluxo de aprovação e SLA aplicável.

### O que é implementado

**Backend — RequestModule:**
- Entidade `ServiceRequest` com agregado `ApprovalStep` e `FulfillmentRecord`.
- Value Objects: `RequestStatus`, `ApprovalDecision`.
- Use Cases: `SubmitServiceRequestUseCase`, `ApproveRequestUseCase`, `RejectRequestUseCase`, `FulfillRequestUseCase`, `CancelRequestUseCase`, `DelegateApprovalUseCase`.
- `RequestController`: `POST /api/requests`, `GET /api/requests`, `GET /api/requests/:id`, `PATCH /api/requests/:id/approve`, `PATCH /api/requests/:id/reject`, `PATCH /api/requests/:id/fulfill`.
- Fluxo de aprovação: carregado do Catálogo de Serviços por tipo de requisição.
- Eventos: `ServiceRequestSubmitted`, `ServiceRequestApproved`, `ServiceRequestRejected`, `ServiceRequestFulfilled`, `AccessRequestFulfilled` (consumido pela Fase 11), `AssetRequestFulfilled` (consumido pela Fase 09).

**Frontend:**
- Página `/requests/new` com seleção do serviço do catálogo e formulário dinâmico.
- Página `/requests` com listagem por solicitante e status.
- Página `/requests/:id` com timeline do fluxo de aprovação.
- Página `/approvals` para aprovadores com requisições pendentes de decisão.
- Notificação in-app para aprovadores (badge na sidebar).

### Dependências

- **Fase 04** concluída (Catálogo de Serviços com fluxos de aprovação configurados).
- **Fase 05** concluída (SLA para requisições).
- **Fase 06** concluída (padrão de módulo estabelecido — Request segue o mesmo padrão que Incident).

### Critérios de Conclusão

- [ ] Fluxo completo: submeter → aprovar → executar → concluir sem erros.
- [ ] Fluxo com rejeição: submeter → rejeitar → notificar solicitante.
- [ ] Delegação de aprovação transfere a etapa para outro aprovador.
- [ ] Cancelamento pelo solicitante antes da aprovação funciona.
- [ ] SLA de requisição calculado no momento de submissão.
- [ ] Evento `AccessRequestFulfilled` publicado para requisições do tipo acesso (stub para Fase 11).
- [ ] `GET /api/approvals/pending` retorna apenas aprovações pendentes para o usuário autenticado.
- [ ] Cobertura de testes unitários ≥ 85% na camada de domínio.

---

## Fase 08 — Problemas

### Objetivo

Implementar a gestão de problemas — investigação de causa raiz de incidentes recorrentes, registro de workarounds e KEDB (*Known Error Database*). Esta fase fecha o ciclo do Service Desk conectando incidentes repetidos a causas raiz documentadas.

### O que é implementado

**Backend — ProblemModule:**
- Entidades `Problem` e `KnownError` como agregados raiz distintos.
- Value Objects: `ProblemStatus`, `RootCauseMethod`, `Workaround`.
- Use Cases: `IdentifyProblemFromIncidentUseCase`, `InvestigateProblemUseCase`, `PublishWorkaroundUseCase`, `RegisterKnownErrorUseCase`, `CloseProblemUseCase`.
- `ProblemController`: `POST /api/problems`, `GET /api/problems`, `GET /api/problems/:id`, `PATCH /api/problems/:id/workaround`, `POST /api/problems/:id/known-error`, `PATCH /api/problems/:id/close`.
- Vínculo N:M entre `Problem` e `Incident` (um problema pode agrupar vários incidentes).
- KEDB: listagem de erros conhecidos com workaround publicado, acessível no portal de autoatendimento.
- Eventos: `ProblemIdentified`, `WorkaroundPublished`, `KnownErrorRegistered`, `ProblemSolved`.

**Frontend:**
- Página `/problems` com listagem e filtros.
- Página `/problems/:id` com análise de causa raiz e incidentes vinculados.
- Seção KEDB em `/knowledge/known-errors` acessível a técnicos.

### Dependências

- **Fase 06** concluída (Incidentes — `Problem` vincula a `Incident`).
- **Fase 02** concluída (tabelas do schema `problem` criadas).

### Critérios de Conclusão

- [ ] Problema criado a partir de um ou mais incidentes existentes.
- [ ] Workaround publicado e acessível via `GET /api/problems/workarounds`.
- [ ] Known Error registrado com causa raiz documentada.
- [ ] Evento `WorkaroundPublished` publicado (consumido pela Fase 17 — Base de Conhecimento).
- [ ] Listagem de incidentes vinculados a um problema retorna apenas incidentes do problema.
- [ ] Problema fechado ao registrar solução definitiva.
- [ ] Cobertura de testes unitários ≥ 85%.

---

## Fase 09 — Ativos

### Objetivo

Implementar a gestão completa do ciclo de vida de ativos de TI (ITAM) — hardware, software e licenças — com rastreabilidade de responsável, localização, garantia e depreciação.

### O que é implementado

**Backend — AssetModule:**
- Entidades `Asset` e `SoftwareLicense` como agregados raiz distintos.
- Value Objects: `AssetStatus`, `AssetCategory`, `AssetTag`, `WarrantyPeriod`, `DepreciationValue`.
- Use Cases: `RegisterAssetUseCase`, `AllocateAssetUseCase`, `DeallocateAssetUseCase`, `ScheduleMaintenanceUseCase`, `DecommissionAssetUseCase`, `TrackLicenseUsageUseCase`, `RecordDepreciationUseCase`.
- `AssetController`: CRUD completo + endpoints de ciclo de vida (`/allocate`, `/deallocate`, `/decommission`, `/maintenance`).
- `LicenseController`: `GET /api/licenses`, `GET /api/licenses/:id/usage`, `PATCH /api/licenses/:id/usage`.
- Alertas: job diário verificando garantias e licenças expirando em 30/60/90 dias.
- Eventos: `AssetAllocated`, `AssetDecommissioned`, `AssetUnderMaintenance`, `WarrantyExpiringSoon`, `LicenseUtilizationLow`.
- `IGlpiAssetSyncPort` definido (stub — ativado na Fase 10).
- Cálculo de depreciação: método linear e saldo decrescente.

**Frontend:**
- Página `/assets` com inventário completo e filtros por categoria, status, responsável.
- Página `/assets/:id` com histórico completo e alertas.
- Página `/licenses` com controle de uso por software.
- Componente `AssetStatusBadge`, `WarrantyAlert`.

### Dependências

- **Fase 03** concluída (autenticação e RBAC).
- **Fase 02** concluída (tabelas do schema `asset` criadas).
- **Fase 06** concluída (evento `AssetRequestFulfilled` a ser consumido).
- **Fase 07** concluída (evento `AssetRequestFulfilled` publicado por Request).

### Critérios de Conclusão

- [ ] Ciclo de vida completo: Registrar → Alocar → Manter → Desalocar → Descomissionar.
- [ ] Depreciação calculada corretamente pelos dois métodos.
- [ ] Alerta publicado para garantia expirando em ≤ 30 dias.
- [ ] Alerta publicado para licença com utilização < 20%.
- [ ] Evento `AssetRequestFulfilled` da Fase 07 cria alocação automática.
- [ ] `GET /api/assets` retorna apenas ativos visíveis para o papel do usuário.
- [ ] Exportação de inventário em CSV funcionando.
- [ ] Cobertura de testes unitários ≥ 85%.

---

## Fase 10 — Integração GLPI

### Objetivo

Implementar a integração bidirecional com o GLPI — sincronização de chamados (criação e atualização de status) e sincronização de inventário de ativos. O GLPI permanece como sistema de registro oficial; o SGTI atua como camada de governança.

### O que é implementado

**Backend — Infrastructure (adapters):**
- `GlpiTicketAdapter` implementando `IGlpiTicketSyncPort`:
  - `createTicket(incident)` → `POST /Ticket` no GLPI.
  - `updateTicket(glpiId, data)` → `PUT /Ticket/:id`.
  - `getTicket(glpiId)` → `GET /Ticket/:id`.
- `GlpiAssetAdapter` implementando `IGlpiAssetSyncPort`:
  - `syncInventory()` → `GET /Computer`, `GET /Monitor`, `GET /Peripheral`.
- `GlpiAuthAdapter`: session token renovado a cada 12 horas.
- `GlpiSyncEventHandler`: consome `IncidentOpened` → cria ticket no GLPI.
- `GlpiStatusSyncJob`: job a cada 5 minutos sincronizando status de tickets abertos.
- `GlpiInventorySyncJob`: job diário às 02h sincronizando inventário.
- `SyncFailureRecord`: persiste falhas com retry schedule (backoff exponencial).
- Circuit breaker: após 10 falhas consecutivas, pausa integração por 15 minutos.

**Configuração:**
- Variáveis: `GLPI_BASE_URL`, `GLPI_APP_TOKEN`, `GLPI_USER_TOKEN`.
- Endpoint de health da integração: `GET /api/integrations/glpi/health`.

### Dependências

- **Fase 06** concluída (IncidentModule com `IGlpiTicketSyncPort` definido).
- **Fase 09** concluída (AssetModule com `IGlpiAssetSyncPort` definido).
- GLPI versão 10.x instalado, API REST habilitada, usuário de integração criado.

### Critérios de Conclusão

- [ ] Incidente criado no SGTI aparece no GLPI em < 5 segundos.
- [ ] Atualização de status no GLPI reflete no SGTI em < 10 minutos (próximo ciclo do job).
- [ ] Falha de conexão com GLPI não impede abertura de incidente no SGTI.
- [ ] `SyncFailureRecord` criado em caso de falha; retry funciona após recuperação do GLPI.
- [ ] Circuit breaker ativado após 10 falhas; integração retomada após 15 minutos.
- [ ] `GET /api/integrations/glpi/health` retorna status da integração.
- [ ] Inventário importado do GLPI populado no schema `asset`.
- [ ] Testes de integração com servidor GLPI mockado (nock) cobrindo criação, atualização e falha.

---

## Fase 11 — Identidades

### Objetivo

Implementar a gestão completa do ciclo de vida de identidades digitais — provisionamento, revisão periódica e revogação de acessos — de forma autônoma (sem integração Google ainda). A integração Google é adicionada na Fase 12.

### O que é implementado

**Backend — IdentityModule:**
- Entidades `UserIdentity`, `AccessProfile`, `AccessReview` como agregados.
- Value Objects: `IdentityStatus`, `Role`, `OrgUnit`, `AccessScope`.
- Use Cases: `ProvisionUserUseCase`, `DeprovisionUserUseCase`, `GrantAccessUseCase`, `RevokeAccessUseCase`, `SuspendUserUseCase`, `ReactivateUserUseCase`, `StartAccessReviewUseCase`, `CompleteAccessReviewUseCase`.
- `IdentityController`: CRUD de usuários + endpoints de ciclo de vida.
- `AccessReviewController`: `POST /api/access-reviews`, `GET /api/access-reviews/pending`, `PATCH /api/access-reviews/:id/complete`.
- Eventos: `UserProvisioned`, `UserDeprovisioned`, `AccessGranted`, `AccessRevoked`, `AccessReviewRequired`.
- Job semanal: `AccessReviewReminderJob` verificando usuários sem revisão há mais de 90 dias.
- `IGoogleWorkspaceUserPort` definido (stub — ativado na Fase 12).
- Consomem eventos: `AccessRequestFulfilled` (da Fase 07) dispara `GrantAccessUseCase`.

**Frontend:**
- Página `/admin/users` com listagem e gestão de usuários.
- Página `/admin/users/:id` com perfil de acesso e histórico.
- Página `/access-reviews` para revisão periódica de acessos.
- Componente `RoleBadge`, `AccessScopeDisplay`.

### Dependências

- **Fase 03** concluída (Auth usa `UserIdentity` como fonte de usuário).
- **Fase 07** concluída (evento `AccessRequestFulfilled` a ser consumido).
- **Fase 02** concluída (tabelas do schema `identity` criadas).

### Critérios de Conclusão

- [ ] Provisionamento manual cria `UserIdentity` com `Role` e `AccessScope` corretos.
- [ ] Desprovisionamento revoga todos os acessos e marca usuário como `INACTIVE`.
- [ ] Usuário desativado tem JWT rejeitado pelo `JwtAuthGuard` (blacklist atualizada).
- [ ] Evento `AccessRequestFulfilled` da Fase 07 aciona `GrantAccessUseCase` automaticamente.
- [ ] Revisão de acesso cria registros em `AccessReview` para todos os usuários pendentes.
- [ ] Job semanal publica `AccessReviewRequired` para usuários com revisão atrasada.
- [ ] `GET /api/admin/users` retornando apenas para roles `IT_MANAGER`+.
- [ ] Cobertura de testes unitários ≥ 90% (módulo de segurança crítico).

---

## Fase 12 — Google Workspace

### Objetivo

Conectar o módulo de Identidades ao Google Workspace como provedor de identidade autoritativo — sincronização de usuários, provisionamento/desprovisionamento automático de contas Google e sincronização de grupos organizacionais.

### O que é implementado

**Backend — Infrastructure (adapters):**
- `GoogleDirectoryAdapter` implementando `IGoogleWorkspaceUserPort`:
  - `createAccount(user)` → Admin SDK: `users.insert`.
  - `suspendAccount(googleId)` → Admin SDK: `users.update`.
  - `listUserGroups(googleId)` → Admin SDK: `groups.list`.
- `GoogleGroupAdapter` implementando `IGoogleWorkspaceGroupPort`.
- `SyncFromGoogleWorkspaceUseCase`: importa usuários existentes do Google Workspace para o SGTI.
- `GoogleSyncJob`: job diário sincronizando novos usuários e desativações do Google.
- Fallback: falha no Google não impede provisionamento no SGTI — status `PENDING_PROVISIONING` + retry.
- Endpoint: `POST /api/integrations/google/sync` (manual trigger para admins).
- Endpoint: `GET /api/integrations/google/health`.

**Configuração:**
- Variáveis: `GOOGLE_SERVICE_ACCOUNT_KEY`, `GOOGLE_ADMIN_EMAIL`, `GOOGLE_DOMAIN`.
- Service Account com delegação de domínio configurada.

### Dependências

- **Fase 11** concluída (IdentityModule com `IGoogleWorkspaceUserPort` definido).
- Google Workspace com Service Account configurada com delegação de domínio.

### Critérios de Conclusão

- [ ] `SyncFromGoogleWorkspaceUseCase` importa todos os usuários ativos do Google Workspace.
- [ ] Novo provisionamento no SGTI cria conta no Google Workspace em < 30 segundos.
- [ ] Desprovisionamento no SGTI suspende conta no Google Workspace.
- [ ] Falha na API Google não impede operação no SGTI (status `PENDING_PROVISIONING`).
- [ ] Job diário sincroniza desativações do Google para o SGTI.
- [ ] `GET /api/integrations/google/health` retorna status da integração.
- [ ] Testes de integração com Admin SDK mockado.

---

## Fase 13 — Compliance

### Objetivo

Implementar a gestão de compliance — políticas, controles, evidências, não-conformidades e auditorias. Esta fase entrega a capacidade de rastrear a maturidade de conformidade da TI e sustentar auditorias com evidências centralizadas.

### O que é implementado

**Backend — ComplianceModule:**
- Entidades `ComplianceControl`, `Policy`, `AuditCycle`, `NonConformance`, `Evidence`.
- Value Objects: `ControlStatus`, `Framework`, `NonConformanceSeverity`, `PolicyVersion`.
- Use Cases completos (ver `12_ARCHITECTURE.md` seção 6.6).
- `ComplianceController` e `PolicyController` com CRUD e endpoints de ação.
- Upload de evidências integrado ao Supabase Storage (bucket `compliance/`).
- Geração de relatório de maturidade por framework.
- Eventos: `PolicyPublished`, `NonConformanceFound`, `AuditCompleted`, `ControlImplemented`.
- Consome eventos: `AccessRevoked`, `UserDeprovisioned` (evidências automáticas de controles IAM).

**Frontend:**
- Página `/compliance/controls` com mapa de controles por framework.
- Página `/compliance/policies` com catálogo de políticas vigentes.
- Página `/compliance/audits` com calendário e checklist de auditorias.
- Página `/compliance/nonconformances` com planos de ação.
- Upload de evidências com preview de arquivo.

### Dependências

- **Fase 11** concluída (eventos de Identity para evidências automáticas de controles IAM).
- **Fase 03** concluída (autenticação com role `COMPLIANCE_OFFICER`).
- **Fase 02** concluída (tabelas do schema `compliance` e bucket `compliance/` no Storage).

### Critérios de Conclusão

- [ ] Controle criado e associado a framework (LGPD, ISO 27001, ITIL v4).
- [ ] Evidência anexada ao controle via upload para Supabase Storage.
- [ ] Relatório de maturidade gerado com % de controles por status e framework.
- [ ] Não-conformidade registrada com severidade e plano de ação.
- [ ] Auditoria criada com checklist e itens marcados como concluídos.
- [ ] Evento `AccessRevoked` da Fase 11 cria evidência automática no controle de IAM.
- [ ] Exportação de relatório de conformidade em PDF.
- [ ] Cobertura de testes unitários ≥ 85%.

---

## Fase 14 — Financeiro

### Objetivo

Implementar o controle financeiro de TI — orçamentos (CAPEX/OPEX), contratos, despesas e rateio por centro de custo. Esta fase entrega visibilidade financeira completa sobre os custos de TI.

### O que é implementado

**Backend — FinanceModule:**
- Entidades `Budget`, `Contract`, `Expense` como agregados.
- Value Objects: `BudgetType`, `MoneyAmount`, `CostCenter`, `ContractStatus`.
- Use Cases completos (ver `12_ARCHITECTURE.md` seção 6.7).
- `FinanceController` e `ContractController` com CRUD e endpoints de ação.
- Job mensal: `BudgetReconciliationJob` — consolida despesas realizadas vs. orçado.
- Job: `ContractExpiryAlertJob` — alerta contratos vencendo em 30/60/90 dias.
- Eventos: `BudgetExceeded`, `ContractExpiringSoon`, `ExpenseRegistered`, `CapexItemReceived`.
- Consome: `AssetDecommissioned` (baixa patrimonial automática).
- Relatório de TCO por serviço (usando dados de Incidentes + Ativos + Contratos).

**Frontend:**
- Página `/finance/budget` com planejamento e acompanhamento orçamentário.
- Página `/finance/contracts` com gestão de contratos e alertas.
- Página `/finance/expenses` com lançamento e histórico de despesas.
- Gráficos de CAPEX vs. OPEX por período com Recharts.

### Dependências

- **Fase 09** concluída (evento `AssetDecommissioned` a ser consumido).
- **Fase 03** concluída (autenticação com role `FINANCIAL_ANALYST`).
- **Fase 02** concluída (tabelas do schema `finance` criadas).

### Critérios de Conclusão

- [ ] Orçamento CAPEX e OPEX criado por período e centro de custo.
- [ ] Despesa lançada e deduzida do orçamento correspondente automaticamente.
- [ ] Alerta `BudgetExceeded` publicado ao ultrapassar 100% do orçamento.
- [ ] Contrato criado com alertas configurados para 30/60/90 dias antes do vencimento.
- [ ] Rateio de custo por centro de custo funcional.
- [ ] Evento `AssetDecommissioned` gera baixa patrimonial automática.
- [ ] Relatório de TCO exportável em PDF e CSV.

---

## Fase 15 — Compras

### Objetivo

Implementar o processo de aquisição de TI — requisição de compra, fluxo de aprovação por valor, cadastro de fornecedores e recebimento de itens com vínculo ao módulo de Ativos.

### O que é implementado

**Backend — ProcurementModule:**
- Entidades `PurchaseOrder` e `Supplier` como agregados.
- Value Objects: `PurchaseOrderStatus`, `ApprovalThreshold`, `SupplierCategory`.
- Use Cases: abertura, aprovação, recebimento e cancelamento de pedidos.
- `ProcurementController` e `SupplierController`.
- Fluxo de aprovação por faixa de valor: < R$1.000 (automático), R$1.000–R$10.000 (gestor), > R$10.000 (diretor).
- Eventos: `PurchaseOrderApproved`, `ItemReceived`, `SupplierEvaluated`.
- Consome: `ItemReceived` → publica `CapexItemReceived` para Finance + cria Asset.
- Integração com Finance: reserva orçamentária ao aprovar pedido.

**Frontend:**
- Página `/procurement/orders` com listagem e filtros.
- Página `/procurement/orders/new` com formulário de requisição.
- Página `/procurement/suppliers` com cadastro e avaliação de fornecedores.

### Dependências

- **Fase 09** concluída (Asset — `ItemReceived` cria ativo automaticamente).
- **Fase 14** concluída (Finance — reserva orçamentária ao aprovar).
- **Fase 02** concluída (tabelas do schema `procurement` criadas).

### Critérios de Conclusão

- [ ] Pedido criado, aprovado conforme faixa de valor e recebido sem erros.
- [ ] Recebimento cria ativo automaticamente no módulo Asset.
- [ ] Recebimento baixa o valor no CAPEX do módulo Finance.
- [ ] Aprovação automática para pedidos abaixo do threshold funcional.
- [ ] Fornecedor cadastrado com histórico de fornecimentos.
- [ ] Cobertura de testes unitários ≥ 80%.

---

## Fase 16 — Projetos

### Objetivo

Implementar a gestão de projetos de TI com controle de escopo, cronograma, orçamento, riscos e rastreabilidade de entregas via GitHub.

### O que é implementado

**Backend — ProjectModule:**
- Entidade `Project` com agregados `Milestone` e `Risk`.
- Value Objects: `ProjectStatus`, `ProjectPhase`, `RiskLevel`, `DeliveryStatus`.
- Use Cases: criar, aprovar, atualizar, concluir e cancelar projetos; gerenciar marcos e riscos.
- `ProjectController` com CRUD e endpoints de ação.
- `GithubProjectAdapter` implementando `IGithubProjectPort`.
- Webhook handler: `POST /api/webhooks/github` — registra pushes e merges.
- Eventos: `ProjectApproved`, `MilestoneCompleted`, `ProjectDelayed`, `ProjectCompleted`.
- Integração Finance: reserva CAPEX ao aprovar projeto.

**Frontend:**
- Página `/projects` com portfólio de projetos e status visual.
- Página `/projects/:id` com cronograma, riscos e commits vinculados.
- Componente `ProjectHealthIndicator` (verde/amarelo/vermelho).

### Dependências

- **Fase 14** concluída (Finance — reserva CAPEX ao aprovar projeto).
- **Fase 15** concluída (Procurement — compras vinculadas a projetos).
- Repositório GitHub com webhook configurado para o endpoint do SGTI.

### Critérios de Conclusão

- [ ] Projeto criado, aprovado, com marcos definidos e risco registrado.
- [ ] Conclusão de marco atualiza progresso do projeto e publica evento.
- [ ] Webhook do GitHub registra commits vinculados ao projeto.
- [ ] Atraso detectado automaticamente ao ultrapassar data prevista de marco.
- [ ] Reserva de CAPEX feita ao aprovar projeto.
- [ ] Cobertura de testes unitários ≥ 80%.

---

## Fase 17 — Base de Conhecimento

### Objetivo

Implementar a Base de Conhecimento — repositório estruturado de artigos técnicos e de usuário final, com controle editorial, busca full-text e vínculo automático a incidentes e problemas resolvidos.

### O que é implementado

**Backend — KnowledgeModule:**
- Entidades `KnowledgeArticle` e `ArticleVersion`.
- Value Objects: `ArticleStatus`, `ArticleAudience`, `ArticleCategory`.
- Use Cases: criar, revisar, publicar, deprecar artigos; vincular a incidentes.
- `KnowledgeController` com CRUD e endpoints de ação.
- `SearchArticlesUseCase`: full-text search via PostgreSQL `tsvector`.
- Event Handlers reativos:
  - `IncidentResolvedHandler` → sugere criação de artigo com base na solução.
  - `ProblemSolvedHandler` → vincula solução definitiva a artigo.
  - `WorkaroundPublishedHandler` → publica artigo de workaround automaticamente.
- Upload de imagens para artigos via Supabase Storage (bucket `knowledge/`).

**Frontend:**
- Página `/knowledge` pública com busca e categorias.
- Página `/knowledge/:slug` com artigo formatado.
- Página `/knowledge/admin` para gestão editorial.
- Sugestão de artigos relacionados na página de incidente aberto.

### Dependências

- **Fase 06** concluída (evento `IncidentResolved` a ser consumido).
- **Fase 08** concluída (eventos `ProblemSolved` e `WorkaroundPublished` a serem consumidos).
- **Fase 02** concluída (tabelas do schema `knowledge` e bucket `knowledge/` criados).

### Critérios de Conclusão

- [ ] Artigo criado, submetido para revisão, publicado e acessível.
- [ ] Busca full-text retorna resultados relevantes por termo.
- [ ] `IncidentResolved` sugere criação de artigo com a solução pré-preenchida.
- [ ] `WorkaroundPublished` cria rascunho de artigo automaticamente.
- [ ] Artigo vinculado ao incidente exibido na página do incidente.
- [ ] Métricas de uso: artigos mais acessados, avaliações registradas.
- [ ] Cobertura de testes unitários ≥ 85%.

---

## Fase 18 — Dashboards

### Objetivo

Implementar os dashboards executivos e operacionais com projeções CQRS atualizadas em tempo real via Supabase Realtime. Esta fase consolida todos os dados produzidos pelas fases anteriores em visões estratégicas e operacionais.

### O que é implementado

**Backend — DashboardModule:**
- Schema `dashboard` com todas as projeções (tabelas de read model).
- `DashboardProjectionHandler`: event listener consumindo eventos de todos os módulos e atualizando projeções via UPSERT atômico.
- Projeções implementadas: `incident_metrics`, `sla_compliance_summary`, `asset_inventory_summary`, `identity_access_summary`, `compliance_maturity`, `financial_summary`, `project_portfolio`.
- `DashboardController`: endpoints de leitura das projeções (`GET /api/dashboard/executive`, `GET /api/dashboard/operational`, `GET /api/dashboard/compliance`, `GET /api/dashboard/financial`).
- Supabase Realtime habilitado nas tabelas de projeção.

**Módulo Notification — ativado:**
- `NotificationModule` com `Notification` entity e `NotificationPreference`.
- `NotificationEventHandler` consumindo eventos de todos os módulos.
- Notificações in-app persistidas e servidas via Supabase Realtime.
- Endpoint: `GET /api/notifications/unread`, `PATCH /api/notifications/:id/read`.

**Módulo Email — ativado:**
- `EmailModule` com `EmailMessage` entity e `NodemailerSmtpAdapter`.
- Templates HTML para todos os tipos de notificação (ver `12_ARCHITECTURE.md` seção 6.13).
- Queue assíncrona com retry e backoff exponencial.
- Remetente: `implantacao@pinpag.com.br`.

**Frontend — Dashboards:**
- Página `/dashboard` (executivo) com KPIs globais e gráficos Recharts.
- Página `/dashboard/operational` com filas em tempo real e alertas.
- Página `/dashboard/compliance` com maturidade por framework.
- Página `/dashboard/financial` com CAPEX/OPEX vs. orçado.
- Atualização em tempo real via Supabase Realtime sem refresh manual.
- Componentes: `KpiCard`, `SlaComplianceChart`, `IncidentVolumeChart`, `BudgetGaugeChart`.

**Frontend — Notificações:**
- `NotificationBell` na Header com badge de não lidas.
- Drawer de notificações com lista e marcação como lida.
- Toast para notificações de alta prioridade.

### Dependências

- **Todas as fases 04–17** concluídas (dashboards consolidam dados de todos os módulos).
- Supabase Realtime habilitado nas tabelas de projeção.
- SMTP configurado com `implantacao@pinpag.com.br`.

### Critérios de Conclusão

- [ ] Dashboard executivo exibe SLA global, CSAT, custo de TI e maturidade de compliance.
- [ ] Dashboard operacional exibe fila de incidentes em tempo real (atualização em < 3 segundos).
- [ ] Dashboard de compliance exibe % de controles por framework.
- [ ] Dashboard financeiro exibe CAPEX e OPEX realizados vs. orçado.
- [ ] Notificação in-app aparece em < 5 segundos após evento de domínio.
- [ ] E-mail disparado para incidente crítico aberto com dados corretos.
- [ ] E-mail disparado para SLA em risco com link direto para o incidente.
- [ ] `NotificationPreference` respeita horário de silêncio configurado pelo usuário.
- [ ] Projeções corretas após reprocessar sequência de eventos (idempotência verificada).

---

## Fase 19 — APIs Públicas

### Objetivo

Documentar, versionar e expor as APIs do SGTI de forma padronizada para consumo por ferramentas externas, integrações futuras e automações internas.

### O que é implementado

**Swagger/OpenAPI:**
- `@nestjs/swagger` configurado com informações do projeto, servidores e autenticação.
- Todos os controllers anotados com `@ApiTags`, `@ApiOperation`, `@ApiResponse`.
- Todos os DTOs anotados com `@ApiProperty`.
- Schema OpenAPI 3.0 gerado em `/api/docs` (desabilitado em produção).
- Export automático do schema em `packages/database/api-schema.json` no pipeline CI.

**Versionamento:**
- Prefixo `/api/v1/` em todas as rotas.
- `CHANGELOG.md` de API com breaking changes documentados.
- Header `Deprecation` em endpoints marcados para remoção futura.

**Webhooks:**
- `GET /api/webhooks/events` — documentação dos eventos disponíveis.
- `POST /api/webhooks/register` — registro de endpoint para receber eventos (futuro).

**Rate Limiting:**
- `@nestjs/throttler` configurado: 100 requests/minuto por IP.
- Headers `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

**Health e Métricas:**
- `GET /api/health` — status de todos os subsistemas (DB, GLPI, Google, Email).
- `GET /api/health/ready` — Kubernetes readiness probe.
- `GET /api/health/live` — Kubernetes liveness probe.

### Dependências

- **Fases 06–17** concluídas (todos os módulos com controllers implementados).

### Critérios de Conclusão

- [ ] `GET /api/docs` exibe Swagger UI com todos os endpoints documentados.
- [ ] Schema OpenAPI 3.0 exportado em `api-schema.json` no pipeline CI.
- [ ] Nenhum endpoint sem `@ApiOperation` ou `@ApiResponse`.
- [ ] Rate limiting rejeita `429` após 101ª requisição no mesmo minuto.
- [ ] `GET /api/health` retorna status correto de cada subsistema.
- [ ] Breaking change introduzido em feature branch detectado via diff do `api-schema.json` no CI.
- [ ] Documentação Swagger inacessível no ambiente de produção.

---

## Fase 20 — Relatórios

### Objetivo

Implementar relatórios gerenciais exportáveis para os módulos críticos — Service Desk, Compliance, Financeiro e Ativos — em formatos PDF e CSV.

### O que é implementado

**Backend — ReportModule:**
- `ReportController`: `POST /api/reports/generate` com payload de configuração do relatório.
- Relatórios implementados:

| Relatório | Módulo | Formatos |
|-----------|--------|----------|
| SLA Performance | Incidents + SLA | PDF, CSV |
| Incident Summary | Incidents | PDF, CSV |
| Asset Inventory | Assets | PDF, CSV |
| License Compliance | Assets | PDF, CSV |
| Compliance Maturity | Compliance | PDF |
| Financial Summary | Finance | PDF, CSV |
| Access Review History | Identity | PDF |
| Project Portfolio | Projects | PDF |

- Geração de PDF com `pdfkit` ou `puppeteer` (HTML → PDF).
- Geração de CSV com `csv-writer`.
- Relatórios assíncronos: `POST` cria job → `GET /api/reports/:jobId/status` → download via URL assinada do Supabase Storage.
- Retenção de relatórios gerados: 7 dias no Storage (purge automático).

**Frontend:**
- Página `/reports` com seleção de tipo, parâmetros de período e filtros.
- Histórico de relatórios gerados com download disponível.
- Status de geração em tempo real via Supabase Realtime.

### Dependências

- **Fases 06–18** concluídas (todos os dados disponíveis).
- Supabase Storage bucket `reports/` criado.

### Critérios de Conclusão

- [ ] Todos os 8 relatórios gerados sem erros com dados de desenvolvimento.
- [ ] PDF gerado contém logotipo, data de geração e filtros aplicados.
- [ ] CSV gerado com cabeçalhos corretos e encoding UTF-8.
- [ ] Relatório assíncrono: status `PENDING → PROCESSING → COMPLETED` correto.
- [ ] URL de download assinada expira em 1 hora.
- [ ] Relatório de 1.000 registros gerado em < 30 segundos.
- [ ] Relatórios não acessíveis por usuário sem permissão (RLS + Guard).

---

## Fase 21 — Testes

### Objetivo

Consolidar e elevar a cobertura de testes em toda a aplicação — completar suites de testes unitários, de integração e E2E, e garantir que os critérios de cobertura mínima estejam atendidos antes do deploy em produção.

### O que é implementado

**Testes Unitários (Jest + Vitest):**
- Revisão e complementação de testes em todos os módulos.
- Metas de cobertura mínima:
  - Camada de domínio: **90%** (entidades, VOs, domain services).
  - Camada de aplicação: **85%** (use cases com repositórios mockados).
  - Camada de infraestrutura (mappers): **70%**.
- Fixtures de dados centralizadas por módulo em `test/fixtures/`.
- Snapshot tests para componentes React críticos (DataTable, forms de incidente).

**Testes de Integração (Supertest + Testcontainers):**
- Suite completa de testes de API para todos os controllers.
- Banco de dados de teste isolado (PostgreSQL via Testcontainers).
- Mocks de servidor HTTP para GLPI e Google APIs (nock / msw).
- Cenários de falha de integração (timeout, 5xx, rede indisponível).
- Testes de RLS: verificar que usuário A não acessa dados de usuário B.
- Testes de RBAC: verificar que cada role tem acesso apenas ao que deve.

**Testes E2E (Playwright):**
- Fluxos críticos implementados:
  1. Autenticação completa (SSO Google → dashboard).
  2. Ciclo completo de incidente (abertura → atribuição → resolução).
  3. Ciclo de aprovação de requisição (submissão → aprovação → fulfillment).
  4. Provisionamento e desprovisionamento de usuário.
  5. Geração de relatório de SLA.
  6. Dashboard executivo com dados em tempo real.
- Page Objects para todas as páginas cobertas.
- Screenshots automáticos em falha.
- Execução em pipeline CI (ambiente staging).

**Testes de Performance:**
- `k6` ou `artillery` para smoke test de carga:
  - 100 usuários simultâneos por 5 minutos sem degradação.
  - Tempo de resposta p95 < 2 segundos em endpoints principais.

### Dependências

- **Todas as fases 01–20** concluídas.
- Ambiente de staging estável com dados de teste.

### Critérios de Conclusão

- [ ] `pnpm test:coverage` passa com todas as metas de cobertura atendidas.
- [ ] `pnpm test:integration` passa com 100% dos cenários (incluindo falhas).
- [ ] `pnpm test:e2e` passa com todos os 6 fluxos críticos no ambiente staging.
- [ ] Teste de RLS: nenhum vazamento de dados entre usuários detectado.
- [ ] Teste de RBAC: nenhuma operação além das permitidas por cada role.
- [ ] Smoke test de carga: p95 < 2s com 100 usuários simultâneos.
- [ ] Zero testes com `skip`, `only` ou `todo` sem issue aberta justificando.
- [ ] Relatório de cobertura publicado como artifact no GitHub Actions.

---

## Fase 22 — Deploy

### Objetivo

Configurar o ambiente de produção completo, executar o deploy final do SGTI e validar todos os sistemas em produção antes da liberação para usuários.

### O que é implementado

**Infraestrutura de Produção:**
- DNS configurado no Cloudflare: `sgti.[dominio]` e `api.sgti.[dominio]`.
- SSL/TLS em modo Full Strict no Cloudflare.
- Headers de segurança via Cloudflare Transform Rules.
- Variáveis de ambiente de produção configuradas na Vercel (separadas de staging).
- Upgrade do Supabase para plano Pro (elimina pause automático).
- Connection pooling configurado via string de conexão com PgBouncer.
- Supabase Realtime habilitado com rate limits de produção.

**Pipeline CD — `cd.yml` completo:**
```
1. ci             → Pipeline CI completo (lint, type-check, tests)
2. test:e2e       → Playwright em staging
3. deploy:staging → Vercel CLI para staging
4. smoke:test     → Health check de todos os subsistemas
5. deploy:prod    → Vercel CLI para produção (aprovação manual)
6. migration      → prisma migrate deploy em produção
7. smoke:prod     → Health check final em produção
8. notify         → E-mail de confirmação para equipe
```

**Runbook de Go-Live:**
- Checklist de pré-deploy documentado em `Docs/Operação/22_RUNBOOK.md`.
- Plano de rollback documentado com tempo estimado por componente.
- Contatos de emergência listados.

**Monitoramento Pós-Deploy:**
- Vercel Analytics habilitado para Core Web Vitals.
- Alertas de erro via e-mail `implantacao@pinpag.com.br`.
- `GET /api/health` monitorado via UptimeRobot (gratuito) com alerta a cada 5 minutos.

**Onboarding:**
- Documentação de uso para usuários finais em `/knowledge` (artigos publicados).
- Treinamento da equipe de TI agendado.
- Importação de dados históricos do GLPI concluída.

### Dependências

- **Fase 21** concluída (todos os testes passando).
- Domínio registrado e transferido para o Cloudflare.
- Supabase Pro ativo para o projeto.
- Aprovação formal do patrocinador executivo.

### Critérios de Conclusão

- [ ] `GET https://sgti.[dominio]/api/health` retorna `200` com todos os subsistemas `healthy`.
- [ ] Autenticação com conta Google corporativa funciona em produção.
- [ ] Incidente de teste criado e sincronizado com GLPI em < 5 segundos.
- [ ] E-mail de notificação enviado de `implantacao@pinpag.com.br` para endereço de teste.
- [ ] Dashboard executivo exibindo dados reais (importados do GLPI).
- [ ] SSL A+ no SSL Labs para `sgti.[dominio]`.
- [ ] Rollback testado em staging e tempo confirmado (< 5 minutos para frontend).
- [ ] Monitoramento UptimeRobot ativo com alerta configurado.
- [ ] Treinamento da equipe de TI concluído.
- [ ] Documento `Docs/Operação/22_RUNBOOK.md` revisado e aprovado.
- [ ] Registro de go-live criado como incidente no próprio SGTI (meta-teste).

---

## Resumo das Dependências Entre Fases

```
Fase 01 ──────────────────────────────────────────────────── BASE DE TUDO
   │
Fase 02 (Banco) ───────────────────────────────────────────── DADOS
   │
Fase 03 (Auth) ─────────────────────────────────────────────── SEGURANÇA
   │
   ├── Fase 04 (Catálogo)
   │       │
   │       └── Fase 05 (SLA)
   │               │
   │               └── Fase 06 (Incidentes) ─── CORE ──────── ENTREGA 1
   │                       │
   │                       └── Fase 07 (Requisições) ──────── ENTREGA 1
   │                               │
   │                               └── Fase 08 (Problemas) ─── ENTREGA 1
   │
   ├── Fase 09 (Ativos)
   │       │
   │       ├── Fase 10 (GLPI) ─────────────────────────────── ENTREGA 2
   │       │
   │       └── Fase 14 (Financeiro)
   │               │
   │               └── Fase 15 (Compras) ──────────────────── ENTREGA 2
   │
   ├── Fase 11 (Identidades)
   │       │
   │       └── Fase 12 (Google Workspace) ──────────────────── ENTREGA 2
   │
   ├── Fase 13 (Compliance) ───────────────────────────────── ENTREGA 3
   │
   ├── Fase 16 (Projetos) ─────────────────────────────────── ENTREGA 3
   │
   └── Fase 17 (Base de Conhecimento) ─────────────────────── ENTREGA 3
           │
           └── Fase 18 (Dashboards + Notificações + Email) ── ENTREGA 4
                   │
                   └── Fase 19 (APIs Públicas)
                           │
                           └── Fase 20 (Relatórios)
                                   │
                                   └── Fase 21 (Testes)
                                           │
                                           └── Fase 22 (Deploy) ─ GO-LIVE
```

---

## Marcos de Entrega

| Marco | Fases Incluídas | Entregável | Semanas Estimadas |
|-------|----------------|-----------|-----------------|
| **Entrega 1 — Service Desk MVP** | 01–08 | Incidentes, Requisições e Problemas funcionando com SLA e Catálogo | 8–11 |
| **Entrega 2 — Ativos e Identidades** | 09–12 | ITAM, IAM, integração GLPI e Google Workspace | 6–8 |
| **Entrega 3 — Governança** | 13–17 | Compliance, Financeiro, Compras, Projetos e KB | 8–10 |
| **Entrega 4 — Produto Completo** | 18–22 | Dashboards, Relatórios, Testes e Deploy em Produção | 8–12 |

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição da Alteração |
|--------|------|-------|------------------------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa | Criação do documento |

---

> **Documentos relacionados:**
> [`12_ARCHITECTURE.md`](./12_ARCHITECTURE.md) — Arquitetura corporativa completa
> [`01_CLAUDE.md`](./01_CLAUDE.md) — Regras permanentes de implementação
> [`82_ARCHITECT_DECISIONS.md`](./82_ARCHITECT_DECISIONS.md) — Decisões arquiteturais (ADRs)
> [`11_TECH_STACK.md`](./11_TECH_STACK.md) — Stack tecnológica detalhada
