# Patch Proposto — Docs/01_CLAUDE.md

> Aplicar estas substituições diretamente no arquivo `Docs/01_CLAUDE.md`.
> Após aplicar, incrementar a versão do documento para `1.1.0` e adicionar linha no Controle de Versões: `1.1.0 | 2026-07-06 | Arquitetura Corporativa | Alinhamento com ADR-001 (stack serverless)`.

---

## Substituir Seção 3.2 (Backend)

**Remover:**
```
| **NestJS** | 10+ | Framework Node.js estruturado para o backend |
| **TypeScript** | 5+ | Tipagem estática obrigatória em todo o backend |
| **Prisma ORM** | 5+ | Acesso ao banco de dados — único ORM permitido |
```

**Por:**
```
| **Supabase Edge Functions** | Deno runtime | Lógica de backend serverless |
| **TypeScript** | 5+ | Tipagem estática obrigatória em todas as functions |
```

**Regras do Backend (substituir texto atual):**
- Cada função de domínio é uma Edge Function isolada em `supabase/functions/[modulo]-[acao]/`.
- Funções devem ser finas: validação de entrada + orquestração — regra de negócio complexa deve viver em módulos TypeScript importáveis dentro de `supabase/functions/_shared/[modulo]/`.
- Toda validação de entrada deve usar uma lib de schema validation (ex: Zod) com tipos explícitos.
- Respostas de API devem seguir o padrão definido em `Docs/Arquitetura/01_ARCHITECTURE_OVERVIEW.md` (revisar esse documento também — provavelmente ainda cita NestJS).

## Substituir Seção 3.3 (Banco de Dados)

**Remover:** referências a "Prisma Migrations" e "schema.prisma".

**Por:**
```
| **Supabase PostgreSQL** | Banco de dados principal — todos os módulos |
| **SQL Migrations** | Controle de versão do schema via `supabase/migrations/*.sql` — sem ORM |
| **Supabase RLS** | Row Level Security habilitado para todos os recursos com dados sensíveis |
```

**Regras do Banco de Dados (substituir texto atual):**
- O schema é definido exclusivamente via arquivos SQL versionados em `supabase/migrations/`.
- Toda migration deve ter nome descritivo no formato: `YYYYMMDDHHMMSS_descricao_da_mudanca.sql` (padrão Supabase CLI).
- Migrations destrutivas exigem aprovação do Arquiteto e backup manual antes de execução em produção.
- RLS obrigatório em todas as tabelas com PII ou dados de auditoria.
- Nomes de secret no Supabase não podem usar o prefixo `SUPABASE_` (bloqueado pela plataforma) — usar nomes como `SERVICE_ROLE_KEY`.

## Substituir Seção 4.2 (Estrutura de Pastas)

**Por:**
```
sgti/
├── app/                               # Next.js App Router
│   ├── (auth)/                        # Grupo de rotas autenticadas
│   ├── (public)/                      # Grupo de rotas públicas
│   └── api/                           # Route Handlers leves (BFF, proxy para Edge Functions)
├── components/
│   ├── ui/                            # Componentes shadcn/ui instalados
│   └── [modulo]/                      # Componentes específicos por módulo
├── lib/                                # Utilitários, hooks, tipos compartilhados, clientes Supabase
├── supabase/
│   ├── functions/
│   │   ├── _shared/[modulo]/          # Lógica de domínio reutilizável por módulo
│   │   └── [modulo]-[acao]/           # Uma Edge Function por caso de uso
│   └── migrations/                    # SQL versionado, um arquivo por mudança
└── Docs/                              # Toda a documentação do projeto
```

**Nota:** a divisão em `domain/application/infrastructure/presentation` dentro de cada `_shared/[modulo]/` ainda não foi decidida — ver ADR-001, "Questões Pendentes". Recomenda-se decidir isso ANTES de escrever a primeira Edge Function de módulo de negócio, para não repetir o mesmo problema de deriva entre código e documento.

## Sinalizar para revisão manual (não reescrito automaticamente — depende de decisão do Arquiteto)

Estas seções citam NestJS/Prisma e precisam de nova redação, mas envolvem escolhas de processo que não devem ser assumidas unilateralmente:

- **Seção 6.3** (Camada de Infraestrutura) — trocar "Prisma Client" por "Supabase Client (service role)" e redefinir onde mappers/tradução de erro acontecem em Edge Functions.
- **Seção 9.3** (Testes de Integração) — Supertest/Testcontainers pressupõem um processo NestJS rodando. Alternativa comum: Deno test runner nativo + Supabase local (CLI `supabase start`) para banco de teste.
- **Seção 10.1** (Pipeline CI) — remover etapa de build do NestJS; adicionar `supabase functions deploy` e `supabase db push`/lint de migrations.
- **Seção 11.3/11.4** (Deploy Backend/Banco) — não há mais "deploy do backend" via Vercel/Docker; Edge Functions são deployadas via Supabase CLI. Reescrever ordem de deploy: (1) migrate, (2) deploy functions, (3) deploy frontend.
