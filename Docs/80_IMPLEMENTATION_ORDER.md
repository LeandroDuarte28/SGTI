# Patch Proposto — Docs/80_IMPLEMENTATION_ORDER.md (Fases 01 e 02)

> Aplicar substituindo integralmente as seções "Fase 01" e "Fase 02" do documento original.
> **Fases 03–22 ainda não foram revisadas** — todas elas referenciam Controllers NestJS, Guards, EventBus e `@nestjs/schedule` de forma pervasiva. Recomenda-se resolver as "Questões Pendentes" do ADR-001 antes de reescrevê-las, para não repetir suposições erradas 20 vezes. Ver seção final deste patch.

---

## Fase 01 — Estrutura Base (revisada)

### Objetivo

Criar o esqueleto do projeto Next.js standalone, configuração do Supabase CLI local, tooling de qualidade de código e pipeline CI/CD básico. Esta fase não entrega funcionalidade de negócio.

### O que é implementado

**Projeto Next.js:**
- Projeto Next.js 15 com App Router na raiz do repositório (sem monorepo).
- Layout raiz `app/layout.tsx` com providers de tema.
- Route Groups: `(auth)` e `(public)`.
- Componentes base do shadcn/ui instalados: `Button`, `Input`, `Label`, `Card`, `Badge`, `Sidebar`, `Avatar`.
- Tema corporativo configurado em `tailwind.config.ts`.

**Supabase:**
- Supabase CLI instalado e projeto vinculado (`supabase link`).
- `supabase/config.toml` configurado para ambiente local.
- Estrutura `supabase/functions/_shared/` e `supabase/migrations/` criada (vazias por ora).
- Cliente Supabase configurado em `lib/supabase/client.ts` (browser) e `lib/supabase/server.ts` (server components/route handlers), com tipos gerados via `supabase gen types typescript`.

**Tooling:**
- ESLint com `no-restricted-imports` por módulo (adaptado para pastas `lib/[modulo]/` em vez de bounded contexts do NestJS).
- Prettier configurado.
- `tsconfig.json` com `strict: true` e path aliases.
- Husky + lint-staged para pre-commit hooks.

**CI/CD (já commitado em `.github/workflows/`):**
- `ci.yml` com lint, type-check, test e build.
- `cd.yml` para deploy.
- `keepalive.yml` (mantém Supabase free tier ativo).
- Branch protection em `main` e `staging`.

**Documentação:**
- `CLAUDE.md` na raiz (já existe).
- `.env.example` com variáveis necessárias (já existe).
- `README.md` do repositório (já existe).

### Dependências

Nenhuma. Fase inaugural.

**Pré-requisitos externos:**
- Repositório GitHub criado.
- Projeto Vercel criado e vinculado.
- Projeto Supabase criado.
- Supabase CLI instalado localmente.
- Node.js 20 LTS.

### Critérios de Conclusão

- [ ] `npm install` executa sem erros.
- [ ] `npm run build` conclui com sucesso.
- [ ] `npm run lint` retorna zero erros e zero warnings.
- [ ] `npm run type-check` (ou `tsc --noEmit`) retorna zero erros.
- [ ] `npm test` executa a suite de testes (vazia por ora) sem falhas.
- [ ] Pipeline CI no GitHub Actions passa para um PR de teste.
- [ ] `next dev` inicia sem erros e renderiza a página inicial.
- [ ] `GET /api/health` retorna `200` (já implementado em `app/api/health/route.ts`).
- [ ] `supabase start` inicia o ambiente local sem erros.
- [ ] `.env.example` documenta todas as variáveis com descrição.

**Status real observado (commit `a0c7c51`):** grande parte desta fase já está implementada — `app/api/health/route.ts`, `app/api/health/db/route.ts`, `app/api/version/route.ts`, `.env.example`, CI/CD workflows e componentes base já existem. **Ação imediata:** rodar os critérios acima localmente para confirmar quais já passam.

---

## Fase 02 — Banco de Dados (revisada)

### Objetivo

Configurar o schema completo do banco de dados PostgreSQL via SQL migrations puras (sem ORM), incluindo todos os schemas isolados por módulo, tabelas base, enums, índices e políticas RLS iniciais.

O schema é definido **inteiro** nesta fase — não incrementalmente por módulo — mantendo o mesmo princípio do documento original.

### O que é implementado

**Configuração:**
- `supabase/migrations/` com arquivos numerados por timestamp (`YYYYMMDDHHMMSS_descricao.sql`), aplicados via `supabase migration up` / `supabase db push`.
- Tipos TypeScript gerados a partir do schema real via `supabase gen types typescript --local > lib/database.types.ts` (substitui o Prisma Client como fonte de tipos).

**Schemas PostgreSQL (um por módulo) — mantém-se igual ao original:**
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

**Tabelas compartilhadas, RLS e índices:** mantêm-se idênticos ao documento original — essa parte não dependia de Prisma, é DDL puro.

**Seed de dados:**
- Script `supabase/seed.sql` (executado automaticamente por `supabase db reset`) com dados mínimos: 1 Super Admin, categorias padrão do Catálogo, SLA definitions padrão.

### Dependências

- **Fase 01** concluída (Supabase CLI configurado, estrutura de pastas criada).
- Projeto Supabase com PostgreSQL disponível.

### Critérios de Conclusão

- [ ] `supabase migration up` executa sem erros com todas as migrations aplicadas localmente.
- [ ] `supabase db push` executa sem erros em ambiente de staging.
- [ ] Supabase Studio (local ou remoto) exibe todas as tabelas criadas.
- [ ] `supabase db reset` executa `seed.sql` sem erros.
- [ ] Tentativa de `DELETE` na tabela `shared.audit_log` é rejeitada pela política RLS.
- [ ] Tentativa de acesso a dados de outro usuário é rejeitada pelo RLS.
- [ ] Todos os schemas estão isolados — nenhuma foreign key cruzando schemas sem justificativa registrada.
- [ ] `supabase gen types typescript` gera tipos sem erros e o projeto compila contra eles.
- [ ] Migration de rollback documentada em `Docs/Operação/21_DEPLOYMENT_GUIDE.md`.

---

## Fases 03–22 — Ainda não revisadas (flag, não reescritas)

Todas essas fases descrevem, de forma consistente e repetida: Controllers NestJS, Guards, `@CurrentUser()` decorator, EventBus com `EventEmitter2`, `@nestjs/schedule` para jobs, Use Cases como classes NestJS injetáveis. Nenhuma dessas construções existe fora do NestJS.

Antes de reescrevê-las, as "Questões Pendentes" do ADR-001 precisam de resposta, porque a resposta muda como cada fase deveria ser redigida:

1. Se DDD/Clean Architecture continuam mandatórios → cada Edge Function vai precisar importar de uma pasta `_shared/[modulo]/domain` etc., e os "Use Cases" viram funções puras chamadas pela function handler.
2. Jobs agendados (ex: `SlaMonitoringJob` na Fase 05, rodando a cada 5 minutos) não têm equivalente direto em Edge Functions — precisa decidir entre Supabase Cron (`pg_cron`) ou GitHub Actions agendado chamando uma function.
3. O EventBus interno (`EventEmitter2`) pressupõe um processo Node.js persistente — em serverless, a alternativa comum é Supabase Database Webhooks ou uma tabela de outbox — isso muda a Fase 06 (Incidentes) e todas que dependem de eventos entre módulos.

**Recomendação:** resolver essas 3 questões primeiro (idealmente registrando cada uma como um novo ADR), e só então pedir a reescrita das Fases 03 em diante — provavelmente uma de cada vez, à medida que forem sendo implementadas, para não gerar 20 fases reescritas especulativamente.
