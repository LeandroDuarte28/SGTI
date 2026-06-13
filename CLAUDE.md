# SGTI — Regras do Claude Code

> Este arquivo é lido automaticamente pelo Claude Code em toda sessão.
> É derivado de `Docs/01_CLAUDE.md` — a fonte de verdade permanece nos Docs.

## Stack Obrigatória (Sprint 0+)

- **Frontend:** Next.js 15 (App Router) · TypeScript 5 · Tailwind CSS 4 · shadcn/ui
- **Backend:** Supabase Edge Functions (Deno)
- **Banco:** Supabase PostgreSQL (SQL migrations — sem Prisma neste projeto)
- **Auth:** Supabase Auth + Google OAuth 2.0
- **Hospedagem:** Vercel · Cloudflare · GitHub Actions

## Restrições Absolutas

1. **Sem NestJS** — backend é 100% Supabase Edge Functions
2. **Sem backend próprio / VPS** — arquitetura serverless exclusivamente
3. **Sem `any` no TypeScript** — tipagem explícita e rigorosa
4. **Sem Pages Router** — apenas App Router
5. **Sem `style={{}}` inline** — somente classes Tailwind
6. **Sem credenciais em código** — usar variáveis de ambiente
7. **Sem `SELECT *`** — sempre especificar campos
8. **Sem RLS desabilitado** em tabelas com dados sensíveis
9. **Sem DELETE em `shared.AuditLog`** — imutabilidade obrigatória
10. **Sem commit direto em `main` ou `staging`**

## Padrões de Código

- Inglês para código; português apenas em strings de UI
- camelCase para variáveis/funções; PascalCase para componentes/tipos
- Arquivos: kebab-case (ex: `incident-card.tsx`)
- Booleanos: prefixo `is`, `has`, `can`, `should`
- Funções: verbos `get`, `create`, `update`, `fetch`, `validate`

## Antes de Implementar

1. Verificar se existe documento aprovado em `Docs/` para o módulo
2. Ler o documento completo antes de escrever qualquer código
3. Nunca assumir decisões de negócio não documentadas

## Estrutura de Schemas PostgreSQL

Cada módulo tem seu próprio schema. Nunca importar dados de outros schemas diretamente.
Ver: `Docs/71_SUPABASE.md` e `supabase/migrations/`.

## Referências

- `Docs/01_CLAUDE.md` — Regras completas
- `Docs/81_CODING_STANDARDS.md` — Padrões de desenvolvimento
- `Docs/80_IMPLEMENTATION_ORDER.md` — Ordem das fases
- `Docs/71_SUPABASE.md` — Arquitetura Supabase
