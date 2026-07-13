# SGTI — Registro de Decisões Arquiteturais (ADRs)

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Vigente
> **Última Atualização:** 2026-07-06
> **Responsável:** Arquitetura Corporativa de TI

---

## Sobre este Documento

Este documento registra decisões arquiteturais significativas do SGTI, incluindo o contexto, as alternativas consideradas e as consequências de cada decisão. Este arquivo era referenciado por `Docs/80_IMPLEMENTATION_ORDER.md` e `Docs/01_CLAUDE.md` mas ainda não existia — criado agora para formalizar retroativamente uma decisão que já está em vigor no código.

---

## ADR-001 — Substituição de NestJS + Prisma + Turborepo por Next.js API Routes/Supabase Edge Functions

**Status:** Aceito (retroativo)
**Data da decisão original:** Indeterminada — identificada entre os commits `f2c6342 (docs: supabase architecture)` e `a0c7c51 (feat: sprint 0 foundation)`, formalizada em 2026-07-06.

### Contexto

A stack originalmente definida em `Docs/01_CLAUDE.md` v1.0.0 (2026-06-09) e detalhada em `Docs/80_IMPLEMENTATION_ORDER.md` Fase 01/02 especificava:
- Monorepo Turborepo com `apps/web` (Next.js) e `apps/api` (NestJS)
- Prisma ORM como único mecanismo de acesso a dados e migrations
- Clean Architecture com camadas `domain/application/infrastructure/presentation` dentro do NestJS

O `CLAUDE.md` atual na raiz do repositório (lido automaticamente pelo Claude Code) e o código efetivamente commitado em `feat: sprint 0 foundation` (a0c7c51) **não seguem essa especificação**. Em vez disso, implementam:
- Next.js 15 (App Router) puro, sem `apps/api` separado
- Supabase Edge Functions (Deno) para lógica de backend
- SQL migrations diretas via `supabase/migrations/`, sem Prisma

Essa divergência não foi documentada como decisão formal — foi identificada em auditoria de retomada de desenvolvimento (2026-07-06).

### Decisão

Adota-se oficialmente a stack serverless, conforme já implementado:

| Camada | Decisão Anterior (obsoleta) | Decisão Vigente |
|--------|------------------------------|------------------|
| Backend | NestJS 10+ | Supabase Edge Functions (Deno) |
| ORM/Migrations | Prisma ORM 5+ | SQL migrations manuais em `supabase/migrations/` |
| Estrutura de projeto | Monorepo Turborepo (`apps/web`, `apps/api`, `packages/database`) | Projeto único Next.js na raiz (`app/`, `components/`, `lib/`) |
| Camadas de domínio | NestJS Modules com `domain/application/infrastructure/presentation` | **Em aberto — ver "Questões Pendentes" abaixo** |

### Justificativa (inferida — confirmar com o responsável)

- Redução de custo operacional: elimina a necessidade de hospedagem de container/serverless function separada para o backend, mantendo tudo dentro do plano gratuito Vercel + Supabase (alinhado à seção 12 do `01_CLAUDE.md` — Política de Uso de Soluções Gratuitas).
- Redução de complexidade operacional para equipe pequena/solo.
- Elimina uma camada de infraestrutura (o backend NestJS) sem eliminar a separação lógica de responsabilidades.

### Consequências

**Documentos que precisam ser atualizados para refletir esta decisão:**
1. `Docs/01_CLAUDE.md` — Seções 3.2 (Backend), 3.3 (Banco de Dados), 4.2 (Estrutura de Pastas), 6.3 (Camada de Infraestrutura), 9.3 (Testes de Integração), 10.1 (Pipeline CI), 11.3/11.4 (Deploy Backend/Banco).
2. `Docs/80_IMPLEMENTATION_ORDER.md` — Fase 01 (Estrutura Base) e Fase 02 (Banco de Dados) precisam de reescrita completa dos critérios de conclusão.
3. `Docs/00_README.md` — Seções 2.1 e 5.4 ainda citam NestJS como exemplo de stack.

### Questões Pendentes (requerem decisão do Arquiteto Responsável — não assumidas aqui)

- [ ] **DDD/Clean Architecture continuam sendo mandatórios?** O `01_CLAUDE.md` seção 5-6 define bounded contexts, agregados, value objects e camadas de dependência invioláveis como parte da arquitetura NestJS. Isso precisa ser re-especificado para uma estrutura de Edge Functions (ex: pastas `supabase/functions/[modulo]/domain/`, `application/`, etc.) ou foi simplificado deliberadamente?
- [ ] **Qual ferramenta de teste de integração substitui Supertest + Testcontainers** (que dependiam do NestJS rodando em processo)?
- [ ] **RLS do Supabase assume todo o papel de autorização** que antes seria feito em Guards do NestJS?
- [ ] Runbook de rollback (seção 11.5) precisa de nova estratégia para Edge Functions, já que não há mais "backend" com deploy próprio via Vercel.

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição da Alteração |
|--------|------|-------|------------------------|
| 1.0.0 | 2026-07-06 | Auditoria de retomada (Claude) | Criação do documento e registro retroativo do ADR-001 |
