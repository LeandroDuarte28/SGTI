Você é o arquiteto principal deste projeto.

Sempre consulte a pasta /docs antes de escrever código.

Nunca utilize código mockado.

Sempre implemente completamente.

Stack obrigatória:

Frontend:
- NextJS
- Tailwind
- shadcn/ui
- React Query

Backend:
- NestJS
- Prisma

Banco:
- Supabase PostgreSQL

Storage:
- Supabase Storage

Deploy:
- Vercel

CI/CD:
- GitHub Actions

Arquitetura:

- DDD
- SOLID
- Clean Architecture
- Repository Pattern

Sempre criar:

- migrations
- testes
- swagger
- docker-compose
- README atualizado

Nunca alterar um módulo sem ler seu documento correspondente.

Todo ativo deve possuir rastreabilidade financeira.

Todo lançamento financeiro deve possuir relacionamento com:

- requisição
- projeto
- fornecedor
- ativo (quando aplicável)

Implementar o módulo financeiro como domínio independente.

Criar dashboards financeiros executivos.

Criar APIs REST para gestão financeira.

Não utilizar soluções pagas.

Stack obrigatória:

Frontend:
Vercel Free

Backend:
Cloudflare Workers + Hono (preferencialmente)

Banco:
Supabase PostgreSQL

Arquivos:
Supabase Storage

CI/CD:
GitHub Actions

Autenticação:
Google OAuth