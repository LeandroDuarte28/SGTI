# SGTI — Sistema de Gestão de Tecnologia da Informação
## Stack Tecnológica

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documento Relacionado:** [01_CLAUDE.md](../01_CLAUDE.md) · [00_PROJECT_CONTEXT.md](../00_PROJECT_CONTEXT.md)

---

## Sumário

1. [Visão Geral da Stack](#1-visão-geral-da-stack)
2. [Princípios de Seleção Tecnológica](#2-princípios-de-seleção-tecnológica)
3. [Frontend](#3-frontend)
4. [Backend](#4-backend)
5. [Banco de Dados](#5-banco-de-dados)
6. [Storage](#6-storage)
7. [Autenticação e Autorização](#7-autenticação-e-autorização)
8. [Infraestrutura e Hospedagem](#8-infraestrutura-e-hospedagem)
9. [Versionamento](#9-versionamento)
10. [CI/CD](#10-cicd)
11. [Documentação de API](#11-documentação-de-api)
12. [Monitoramento e Observabilidade](#12-monitoramento-e-observabilidade)
13. [Limites dos Planos Gratuitos](#13-limites-dos-planos-gratuitos)
14. [Matriz de Decisão](#14-matriz-de-decisão)
15. [Riscos Tecnológicos e Mitigações](#15-riscos-tecnológicos-e-mitigações)

---

## 1. Visão Geral da Stack

### 1.1 Diagrama da Stack

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USUÁRIO FINAL                               │
│                    Browser / Portal Web                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS (Cloudflare Proxy)
┌────────────────────────────▼────────────────────────────────────────┐
│                         FRONTEND                                    │
│              Next.js 14+ · TypeScript · Tailwind CSS                │
│                         shadcn/ui                                   │
│                    Hospedado na Vercel                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS / REST / Server Actions
┌────────────────────────────▼────────────────────────────────────────┐
│                          BACKEND                                    │
│                   NestJS · TypeScript · Prisma                      │
│             Vercel Serverless Functions / Container                 │
└──────────┬─────────────────┬──────────────────┬─────────────────────┘
           │                 │                  │
     ┌─────▼──────┐  ┌───────▼───────┐  ┌──────▼──────┐
     │  Supabase  │  │    Google     │  │  Integrações│
     │ PostgreSQL │  │  Workspace    │  │  GLPI/GitHub│
     │  Storage   │  │  OAuth + API  │  │  Vercel API │
     └────────────┘  └───────────────┘  └─────────────┘
```

### 1.2 Resumo Executivo da Stack

| Camada | Tecnologia Principal | Plano | Custo Inicial |
|--------|---------------------|-------|---------------|
| Frontend | Next.js + TypeScript + Tailwind + shadcn/ui | — | Gratuito |
| Backend | NestJS + TypeScript + Prisma | — | Gratuito |
| Banco de Dados | Supabase PostgreSQL | Free | Gratuito |
| Storage | Supabase Storage | Free | Gratuito |
| Autenticação | Google OAuth + JWT | Google Free Tier | Gratuito |
| Hospedagem Frontend | Vercel | Hobby | Gratuito |
| DNS / CDN / Proxy | Cloudflare | Free | Gratuito |
| Versionamento | GitHub | Free | Gratuito |
| CI/CD | GitHub Actions | Free (2.000 min/mês) | Gratuito |
| Documentação de API | Swagger / OpenAPI | — | Gratuito |
| Monitoramento | Vercel Analytics + Supabase Logs | Free | Gratuito |
| **Total MVP** | | | **R$ 0,00/mês** |

---

## 2. Princípios de Seleção Tecnológica

Cada tecnologia da stack do SGTI foi escolhida segundo os seguintes princípios, aplicados nesta ordem de prioridade:

### 2.1 Gratuidade Sustentável

A stack deve operar com custo zero durante o MVP e a operação inicial, sem depender de recursos pagos para funcionalidades essenciais. O plano gratuito de cada serviço deve ser suficiente para o volume esperado, com caminho claro de *upgrade* quando o crescimento exigir.

### 2.2 Maturidade e Ecossistema

Tecnologias com comunidade ativa, documentação robusta, atualizações frequentes e histórico de estabilidade em produção em escala corporativa. Nenhuma tecnologia experimental ou sem adoção de mercado comprovada é admitida na stack principal.

### 2.3 Alinhamento Arquitetural

Toda tecnologia deve viabilizar — nunca comprometer — os princípios de Clean Architecture e DDD definidos em `Docs/01_CLAUDE.md`. Frameworks que impõem acoplamento entre camadas são descartados.

### 2.4 TypeScript Nativo

A stack é homogênea em TypeScript de ponta a ponta: frontend, backend e tipos compartilhados. Isso elimina conversões de contexto, permite compartilhar tipos entre camadas e maximiza a segurança do sistema de tipos.

### 2.5 Integração com Google Workspace

Por ser o provedor de identidade central da organização, toda tecnologia de autenticação deve se integrar nativamente ao Google OAuth 2.0 sem adapters complexos.

### 2.6 Sem Lock-in Desnecessário

Preferência por tecnologias abertas ou com alternativas viáveis de migração. Dependências de um único fornecedor são aceitáveis apenas quando o benefício supera claramente o risco de lock-in (ex: Supabase sobre PostgreSQL puro).

---

## 3. Frontend

### 3.1 Next.js 14+ (App Router)

**Categoria:** Framework React fullstack
**Licença:** MIT (open source)
**Custo:** Gratuito

#### Justificativa

O Next.js é o framework React mais adotado em ambientes corporativos, com suporte nativo a SSR (*Server-Side Rendering*), SSG (*Static Site Generation*), ISR (*Incremental Static Regeneration*) e Server Components — recursos críticos para um sistema com múltiplos perfis de acesso, dashboards de alta frequência de atualização e páginas de autoatendimento públicas.

O **App Router**, introduzido no Next.js 13 e estabilizado no 14, representa a arquitetura recomendada pelo time do Next.js e oferece:

- **React Server Components por padrão:** componentes renderizados no servidor, sem JavaScript enviado ao cliente, ideais para páginas de listagem, relatórios e dashboards onde não há interatividade complexa.
- **Server Actions:** mutações de dados diretamente de componentes de servidor, eliminando a necessidade de endpoints de API dedicados para operações simples.
- **Layouts aninhados:** estrutura de navegação reutilizável por módulo sem re-renderização desnecessária, essencial para o SGTI com 14 módulos distintos.
- **Route Groups:** isolamento de grupos de rotas por contexto (autenticado, público, admin) sem impacto na URL.
- **Streaming e Suspense nativos:** carregamento progressivo de dados em dashboards com múltiplas fontes, melhorando a percepção de performance.

#### Por que não alternativas

| Alternativa | Motivo da Rejeição |
|-------------|-------------------|
| **Vite + React SPA** | Sem SSR nativo, SEO limitado, ausência de Server Actions — exigiria backend adicional para BFF |
| **Remix** | Ecossistema menor, menor adoção corporativa, curva de aprendizado adicional sem benefício claro |
| **Nuxt (Vue)** | Equipe familiarizada com React; mudança de paradigma sem justificativa técnica |
| **Angular** | Overhead de configuração elevado, verbosidade excessiva para o escopo do projeto |

---

### 3.2 TypeScript 5+

**Categoria:** Superset tipado de JavaScript
**Licença:** Apache 2.0 (open source)
**Custo:** Gratuito

#### Justificativa

TypeScript é **obrigatório** em toda a codebase do SGTI, sem exceções. A tipagem estática não é uma preferência estética — é um requisito arquitetural para um sistema corporativo com 14 módulos, múltiplos bounded contexts e integrações externas.

Benefícios diretos no contexto do SGTI:

- **Contrato entre camadas:** tipos compartilhados em `packages/shared-types/` garantem que um DTO de entrada no backend corresponda exatamente ao tipo esperado pelo frontend, sem runtime surprises.
- **Segurança em refatorações:** o compilador identifica quebras de contrato ao modificar entidades de domínio ou interfaces de repositório, protegendo as fronteiras da Clean Architecture.
- **Documentação viva:** tipos bem definidos eliminam a necessidade de documentar o formato de dados em comentários — o código é a documentação.
- **IntelliSense e autocompletion:** produtividade no desenvolvimento acelerada, especialmente relevante para módulos com modelos de domínio complexos (Compliance, Financeiro, IAM).
- **Strict mode obrigatório:** `"strict": true` no `tsconfig.json` ativa todas as verificações mais rigorosas, eliminando categorias inteiras de bugs antes do runtime.

---

### 3.3 Tailwind CSS 3+

**Categoria:** Framework CSS utilitário
**Licença:** MIT (open source)
**Custo:** Gratuito

#### Justificativa

Tailwind CSS é o framework de estilização que melhor se integra ao modelo mental de componentes React e à produtividade exigida por um projeto com 14 módulos e múltiplos tipos de interface (dashboards, formulários, tabelas, painéis de controle).

Benefícios no contexto do SGTI:

- **Sem CSS global:** cada componente carrega apenas os estilos que utiliza, eliminando conflitos de CSS em um projeto com dezenas de componentes distintos.
- **Design system consistente:** o sistema de tokens do Tailwind (espaçamento, tipografia, cores, breakpoints) garante consistência visual sem um design system manual.
- **Responsividade mobile-first nativa:** prefixos `sm:`, `md:`, `lg:`, `xl:` aplicados diretamente nas classes, sem media queries separadas.
- **PurgeCSS integrado:** em build de produção, apenas as classes utilizadas são incluídas no bundle — CSS final tipicamente menor que 10KB.
- **Integração perfeita com shadcn/ui:** os componentes do shadcn/ui são construídos sobre Tailwind, garantindo interoperabilidade sem fricção.

#### Por que não alternativas

| Alternativa | Motivo da Rejeição |
|-------------|-------------------|
| **CSS Modules** | Verbosidade elevada, ausência de design tokens automáticos, sem mobile-first nativo |
| **Styled Components / Emotion** | CSS-in-JS aumenta o bundle size, conflita com Server Components do Next.js (que não suportam context em SSR) |
| **Bootstrap** | Classes semânticas menos flexíveis, dificuldade de customização sem override constante, bundle mais pesado |
| **Material UI** | Lock-in de design system, conflito com identidade visual corporativa, dependência de Emotion |

---

### 3.4 shadcn/ui

**Categoria:** Biblioteca de componentes React
**Licença:** MIT (open source)
**Custo:** Gratuito

#### Justificativa

shadcn/ui não é uma biblioteca de componentes tradicional — é uma coleção de componentes copiados diretamente para o projeto, construídos sobre **Radix UI** (acessibilidade) e **Tailwind CSS** (estilização). Essa abordagem tem implicações arquiteturais importantes para o SGTI:

- **Propriedade total do código:** os componentes residem no repositório do projeto (`components/ui/`), sem dependência de versão de pacote externo. Modificações para adequação ao design corporativo são feitas diretamente no código.
- **Acessibilidade por padrão:** Radix UI implementa os padrões ARIA e WAI-ARIA em todos os componentes interativos (modais, dropdowns, tooltips, dialogs), crítico para um sistema corporativo com requisitos de acessibilidade.
- **Componentes complexos disponíveis:** `DataTable`, `Dialog`, `Sheet`, `Command` (paleta de busca), `Calendar`, `Charts` — todos necessários no SGTI e disponíveis sem desenvolvimento do zero.
- **Tema customizável via CSS variables:** permite manter identidade visual corporativa sem reescrever componentes.
- **Zero dependência em runtime além do Radix:** sem providers de contexto global, sem configuração de tema em runtime.

**Componentes do shadcn/ui utilizados no SGTI:**

| Componente | Módulos Principais |
|------------|--------------------|
| `DataTable` | Todos — listagens de chamados, ativos, usuários, contratos |
| `Dialog` / `Sheet` | Formulários de criação e edição em todos os módulos |
| `Command` | Busca global do sistema |
| `Calendar` / `DatePicker` | SLA, Projetos, Compliance, Contratos |
| `Charts` (Recharts) | Dashboards Executivos e Operacionais |
| `Badge` | Status de chamados, SLA, conformidade |
| `Progress` | Maturidade de compliance, progresso de projetos |
| `Tabs` | Navegação interna em módulos complexos |
| `Sidebar` | Navegação principal do sistema |
| `Form` + `Input` + `Select` | Todos os formulários do sistema |

---

## 4. Backend

### 4.1 NestJS 10+

**Categoria:** Framework Node.js para aplicações server-side
**Licença:** MIT (open source)
**Custo:** Gratuito

#### Justificativa

NestJS é o framework Node.js que melhor suporta os princípios arquiteturais do SGTI — Clean Architecture, DDD e SOLID — de forma nativa, sem configuração adicional. Sua estrutura modular e seu sistema de injeção de dependência são requisitos não-negociáveis para um sistema com 14 bounded contexts.

Benefícios específicos no contexto do SGTI:

- **Módulos como bounded contexts:** a estrutura de módulos do NestJS mapeia diretamente para os bounded contexts do DDD. Cada módulo (`IncidentModule`, `AssetModule`, `IdentityModule`) é autocontido, com seus próprios controllers, services, repositórios e providers.
- **Injeção de dependência nativa:** o container de DI do NestJS implementa o princípio D do SOLID (Dependency Inversion) de forma transparente. Use Cases dependem de interfaces; repositórios concretos são injetados pelo container.
- **Decorators para validação e documentação:** `@Body()`, `@Param()`, `@UseGuards()`, `@ApiOperation()` integram validação, autenticação e documentação Swagger diretamente nos controllers sem boilerplate.
- **Guards para RBAC:** o sistema de `AuthGuard` e `RolesGuard` do NestJS implementa o controle de acesso por papel de forma declarativa e reutilizável em todos os módulos.
- **Interceptors para auditoria:** `AuditInterceptor` global captura todas as operações de escrita e gera registros de auditoria imutáveis sem modificar a lógica de negócio.
- **Pipes para validação:** `ValidationPipe` global com `class-validator` valida automaticamente todos os DTOs de entrada antes de chegarem aos Use Cases.
- **Event system:** `EventEmitter2` nativo para publicação e consumo de eventos de domínio entre módulos sem acoplamento direto.

#### Por que não alternativas

| Alternativa | Motivo da Rejeição |
|-------------|-------------------|
| **Express puro** | Sem estrutura nativa para DI, módulos ou validação — exigiria arquitetura manual com alto custo de manutenção |
| **Fastify puro** | Mesmas limitações do Express para DI e modularidade |
| **AdonisJS** | Ecossistema menor, menos alinhado com Clean Architecture, menor adoção corporativa |
| **Hono** | Minimalista por design — inadequado para a complexidade do SGTI |

---

### 4.2 Prisma ORM 5+

**Categoria:** ORM (*Object-Relational Mapper*) para Node.js/TypeScript
**Licença:** Apache 2.0 (open source)
**Custo:** Gratuito (Prisma Accelerate é pago, mas não necessário no MVP)

#### Justificativa

Prisma é o único ORM adotado no SGTI. A escolha é motivada pela combinação de segurança de tipos, clareza de schema e integração com PostgreSQL/Supabase.

Benefícios no contexto do SGTI:

- **Schema como fonte de verdade:** `schema.prisma` define toda a estrutura do banco de dados. Mudanças no schema geram migrations automáticas via `prisma migrate dev`, mantendo o banco versionado junto com o código.
- **TypeScript totalmente tipado:** o Prisma Client gerado a partir do schema oferece autocompletion e verificação de tipos em todas as queries. Impossível fazer `prisma.incident.findUnique()` passando um campo que não existe — erro em tempo de compilação, não em runtime.
- **Migrations versionadas:** cada alteração no schema gera um arquivo de migration SQL versionado e commitable. O histórico completo de evoluções do banco está no repositório.
- **Compatibilidade nativa com Supabase PostgreSQL:** Prisma suporta todas as funcionalidades do PostgreSQL, incluindo tipos avançados, JSON, arrays e índices compostos necessários para as queries de dashboard.
- **Prisma Studio:** interface visual para inspeção do banco durante o desenvolvimento — sem necessidade de cliente SQL adicional.
- **Sem N+1 por acidente:** o sistema de `include` e `select` do Prisma torna explícito o carregamento de relações, evitando o problema N+1 de forma estrutural.

#### Papel na Clean Architecture

O Prisma Client é utilizado **exclusivamente** na camada de infraestrutura, dentro das implementações de repositório (`PrismaIncidentRepository`, `PrismaAssetRepository`, etc.). Nunca é importado diretamente em camadas de domínio ou aplicação. Essa fronteira é verificada pelo linter do projeto.

---

## 5. Banco de Dados

### 5.1 Supabase PostgreSQL

**Categoria:** Banco de dados relacional gerenciado
**Licença:** PostgreSQL (open source) + Supabase (Apache 2.0)
**Plano:** Free
**Limites do plano gratuito:** 500MB de banco de dados, 2GB de transferência/mês, pause após 1 semana de inatividade

#### Justificativa

Supabase é uma plataforma *Backend-as-a-Service* construída sobre PostgreSQL — o banco de dados relacional open source mais robusto e extensível disponível. A escolha do Supabase sobre PostgreSQL puro (self-hosted) é motivada pela redução de overhead operacional no MVP.

**Por que PostgreSQL:**

- **Modelo relacional para o domínio do SGTI:** os dados do SGTI são inerentemente relacionais — chamados têm SLAs, ativos têm contratos, usuários têm perfis de acesso. O modelo relacional é o mais natural e eficiente para esse domínio.
- **JSONB para dados semiestruturados:** campos de metadados variáveis (atributos customizados de ativos, campos de formulários dinâmicos do catálogo) são armazenados como JSONB com indexação eficiente.
- **Row Level Security (RLS):** mecanismo nativo do PostgreSQL para isolamento de dados por usuário/perfil, implementado via Supabase. Garante que políticas de acesso sejam aplicadas no nível do banco, não apenas na aplicação.
- **Full-text search nativo:** busca em Base de Conhecimento, chamados e ativos implementada via `tsvector`/`tsquery` do PostgreSQL, sem dependência de serviço externo de busca.
- **Triggers e functions:** lógica de auditoria e atualização de timestamps implementada via triggers PostgreSQL, garantindo consistência independentemente da camada de aplicação.

**Por que Supabase sobre PostgreSQL self-hosted:**

- **Operação zero no MVP:** sem necessidade de gerenciar servidor, backups, patches ou alta disponibilidade na fase inicial.
- **Supabase Studio:** interface visual completa para gestão do banco, execução de queries e visualização de dados — elimina necessidade de ferramentas externas como DBeaver ou pgAdmin.
- **Supabase Auth integrado:** camada de autenticação pronta para uso com suporte a OAuth providers, JWT e gerenciamento de sessões.
- **Supabase Realtime:** subscriptions em tempo real via WebSocket para atualizações de dashboards operacionais sem polling.
- **Caminho de migração claro:** se necessário migrar para PostgreSQL self-hosted, o schema Prisma é portável sem alterações — sem lock-in de dados.

#### Configuração de Segurança Obrigatória

- RLS habilitado em todas as tabelas com dados pessoais (PII) ou sensíveis.
- Acesso ao banco exclusivamente via Prisma Client autenticado — sem acesso direto ao PostgreSQL pela aplicação frontend.
- Connection pooling via `DATABASE_URL` com `?pgbouncer=true` para otimizar conexões em ambiente serverless.
- Variáveis de ambiente: `DATABASE_URL` (com pool), `DIRECT_URL` (sem pool, para migrations).

---

## 6. Storage

### 6.1 Supabase Storage

**Categoria:** Armazenamento de objetos (*object storage*)
**Licença:** Apache 2.0
**Plano:** Free
**Limites do plano gratuito:** 1GB de armazenamento, 2GB de transferência/mês

#### Justificativa

O Supabase Storage oferece armazenamento de objetos com políticas de acesso integradas ao mesmo sistema de autenticação e RLS do banco de dados, eliminando a necessidade de serviço de storage separado no MVP.

**Casos de uso no SGTI:**

| Bucket | Conteúdo | Política de Acesso |
|--------|----------|-------------------|
| `incidents/` | Anexos de chamados (prints, logs, documentos) | Leitura: solicitante + técnico atribuído + admin |
| `assets/` | Fotos de ativos, notas fiscais, certificados | Leitura: equipe de TI + admin |
| `compliance/` | Evidências de controles, relatórios de auditoria | Leitura: equipe de compliance + auditores + admin |
| `knowledge/` | Imagens e anexos de artigos da Base de Conhecimento | Leitura: todos os usuários autenticados |
| `projects/` | Documentos de projeto, cronogramas, contratos | Leitura: membros do projeto + gestores + admin |
| `procurement/` | Notas fiscais, contratos de fornecedores | Leitura: equipe de compras + financeiro + admin |

**Benefícios técnicos:**

- **RLS nos buckets:** as mesmas políticas de Row Level Security do banco podem ser aplicadas ao storage, garantindo que um técnico não acesse evidências de compliance de outro setor.
- **URLs assinadas temporárias:** arquivos sensíveis são acessados via URLs com validade configurável (ex: 1 hora), sem exposição de URLs permanentes.
- **CDN integrado:** arquivos servidos via CDN global do Supabase, reduzindo latência no acesso a documentos frequentes como artigos da Base de Conhecimento.
- **Integração com Prisma:** referências de arquivo armazenadas como `storage_path` no banco (não como URL direta), permitindo controle centralizado de acesso e possibilidade de migração futura.

---

## 7. Autenticação e Autorização

### 7.1 Google OAuth 2.0

**Categoria:** Protocolo de autenticação federada
**Licença:** Padrão aberto (RFC 6749)
**Custo:** Gratuito (Google Cloud Console — até limites generosos)
**Limites do plano gratuito:** 10.000 requisições/dia na API de diretório (Admin SDK)

#### Justificativa

O Google Workspace é o provedor de identidade corporativa da organização. Toda autenticação no SGTI é delegada ao Google — nenhuma senha local é armazenada ou gerenciada pelo sistema.

**Fluxo de autenticação:**

```
Usuário                SGTI Frontend         SGTI Backend         Google OAuth
   │                        │                      │                    │
   │── Clicar "Entrar" ────►│                      │                    │
   │                        │── Redirecionar ──────────────────────────►│
   │                        │                      │                    │
   │◄─────────────────────────────────── Tela de login Google ──────────│
   │── Autenticar ──────────────────────────────────────────────────────►│
   │                        │                      │                    │
   │◄── Callback com code ──│                      │                    │
   │                        │── Trocar code ──────►│                    │
   │                        │                      │── Validar code ───►│
   │                        │                      │◄── id_token ───────│
   │                        │                      │                    │
   │                        │◄── JWT (SGTI) ───────│                    │
   │◄── Cookie seguro ──────│                      │                    │
```

**Benefícios:**

- **Zero gestão de credenciais:** sem senhas para armazenar, vazar ou redefinir. A segurança das credenciais é responsabilidade do Google.
- **MFA do Google Workspace:** se a organização exige MFA no Google Workspace, o SGTI herda essa proteção automaticamente.
- **Sincronização de identidade:** ao desativar um usuário no Google Workspace, o acesso ao SGTI é revogado imediatamente (token inválido).
- **Dados de perfil automáticos:** nome, e-mail, foto e unidade organizacional do usuário são obtidos do token sem necessidade de formulário de cadastro.
- **Scopes controlados:** apenas os scopes necessários são solicitados — `email`, `profile`, e `openid` para autenticação básica; `admin.directory.users` para operações de provisionamento (somente no backend de IAM).

---

### 7.2 JWT (JSON Web Tokens)

**Categoria:** Padrão de token de autenticação stateless
**Licença:** Padrão aberto (RFC 7519)
**Custo:** Gratuito

#### Justificativa

Após a autenticação via Google OAuth, o backend do SGTI emite um **JWT próprio** assinado com chave privada. Esse JWT é o token de sessão utilizado em todas as requisições subsequentes ao backend — não o token do Google.

**Por que emitir um JWT próprio e não usar o token do Google diretamente:**

- **Claims customizados:** o JWT do SGTI inclui `userId`, `email`, `role` (papel RBAC), `modules` (módulos permitidos) e `orgUnit` — informações do domínio do SGTI que o token do Google não possui.
- **Controle de expiração independente:** a sessão do SGTI pode ter política de expiração diferente da sessão do Google Workspace.
- **Revogação granular:** é possível invalidar sessões específicas do SGTI sem afetar a conta Google do usuário.
- **Performance:** validação de JWT é local (verificação de assinatura) — sem chamada ao Google a cada requisição.
- **Portabilidade:** o sistema de autenticação pode ser adaptado para outros providers no futuro sem alterar a lógica de autorização.

**Estrutura do JWT do SGTI:**

```
Header:  { "alg": "RS256", "typ": "JWT" }

Payload: {
  "sub": "user-uuid",
  "email": "colaborador@empresa.com",
  "name": "Nome Completo",
  "role": "IT_TECHNICIAN",
  "modules": ["INCIDENTS", "ASSETS", "KNOWLEDGE"],
  "orgUnit": "/TI/Suporte",
  "iat": 1234567890,
  "exp": 1234654290  ← 24 horas
}

Signature: RS256(base64(header) + "." + base64(payload), privateKey)
```

**Configuração de segurança:**

- Algoritmo: **RS256** (assimétrico) — chave privada no backend, chave pública verificável.
- Expiração do Access Token: **1 hora**.
- Refresh Token: **7 dias**, armazenado em cookie `HttpOnly` e `Secure`.
- Armazenamento no frontend: cookie `HttpOnly` — nunca `localStorage`.

---

### 7.3 RBAC — Role-Based Access Control

**Categoria:** Modelo de autorização
**Implementação:** NestJS Guards + JWT Claims + Supabase RLS
**Custo:** Gratuito

#### Papéis Definidos

| Role | Nome | Escopo de Acesso |
|------|------|-----------------|
| `SUPER_ADMIN` | Super Administrador | Acesso total ao sistema e configurações |
| `IT_MANAGER` | Gestor de TI | Todos os módulos operacionais e financeiros |
| `IT_SPECIALIST` | Especialista de TI | Módulos técnicos — sem acesso a financeiro e compras |
| `IT_TECHNICIAN` | Técnico de TI | Service Desk, Ativos, Base de Conhecimento |
| `COMPLIANCE_OFFICER` | Analista de Compliance | Compliance, Auditoria, Relatórios |
| `FINANCIAL_ANALYST` | Analista Financeiro | Financeiro, Compras, Contratos |
| `PROJECT_MANAGER` | Gerente de Projetos | Projetos, Compras, Relatórios |
| `AUDITOR` | Auditor | Leitura em todos os módulos, sem escrita |
| `EXECUTIVE` | Executivo | Dashboards e relatórios apenas |
| `END_USER` | Usuário Final | Portal de autoatendimento |

---

## 8. Infraestrutura e Hospedagem

### 8.1 Vercel

**Categoria:** Plataforma de hospedagem e entrega de aplicações web
**Plano:** Hobby (gratuito)
**Limites do plano gratuito:** 100GB de bandwidth/mês, 6.000 minutos de build/mês, 12 deployments simultâneos, domínios customizados ilimitados

#### Justificativa

A Vercel é a plataforma de hospedagem nativamente otimizada para Next.js — desenvolvida pela mesma empresa. Essa integração não é apenas de conveniência: a Vercel implementa otimizações específicas do Next.js que não estão disponíveis em outras plataformas.

**Benefícios técnicos:**

- **Edge Network global:** frontend servido a partir do ponto de presença mais próximo do usuário, com latência minimizada independentemente da localização.
- **Serverless Functions automáticas:** os Route Handlers e Server Actions do Next.js são automaticamente deployados como Serverless Functions sem configuração.
- **Preview Deployments:** cada Pull Request recebe uma URL de preview única e funcional, permitindo revisão de código com ambiente real antes do merge.
- **Rollback com 1 clique:** qualquer deployment anterior pode ser reativado imediatamente via dashboard, sem necessidade de reverter código.
- **Variáveis de ambiente por ambiente:** configuração separada para Development, Preview e Production diretamente no painel da Vercel.
- **Analytics nativo:** Web Analytics gratuito com Core Web Vitals, sem código de rastreamento adicional.

#### Por que não alternativas gratuitas

| Alternativa | Limitação para o SGTI |
|-------------|----------------------|
| **Netlify** | Otimizações específicas do Next.js ausentes; Serverless Functions com cold start mais elevado |
| **GitHub Pages** | Apenas sites estáticos — incompatível com SSR e Server Actions do Next.js |
| **Railway** | Plano gratuito com créditos limitados e sleep após inatividade; adequado para backend, não frontend |
| **Render** | Cold start elevado em plano gratuito; sem Edge Network global |

---

### 8.2 Cloudflare

**Categoria:** DNS, CDN, proxy reverso e proteção de segurança
**Plano:** Free
**Limites do plano gratuito:** DNS ilimitado, CDN sem limite de bandwidth, DDoS protection ilimitada, SSL/TLS automático

#### Justificativa

O Cloudflare é posicionado como a **camada de entrada** de toda a infraestrutura do SGTI — tanto frontend quanto backend. Todo tráfego externo passa pelo Cloudflare antes de chegar à Vercel ou ao servidor de backend.

**Benefícios no contexto do SGTI:**

- **DNS gerenciado centralizado:** todos os domínios e subdomínios do SGTI (`sgti.empresa.com`, `api.sgti.empresa.com`, `staging.sgti.empresa.com`) gerenciados em um único painel com propagação em < 5 minutos.
- **SSL/TLS automático e gratuito:** certificados SSL gerenciados e renovados automaticamente para todos os domínios — sem configuração manual de Let's Encrypt.
- **Proteção DDoS:** mitigação automática de ataques de negação de serviço sem custo adicional, crítica para um sistema corporativo com dados sensíveis.
- **Proxy reverso:** ao proxiar o tráfego via Cloudflare (ícone laranja), os IPs reais dos servidores ficam ocultos, reduzindo a superfície de ataque.
- **Caching de assets estáticos:** recursos estáticos do Next.js (JS, CSS, imagens) cacheados no edge do Cloudflare, reduzindo o bandwidth consumido na Vercel.
- **Rules gratuitas:** redirecionamentos, reescrita de URLs e headers de segurança (CSP, HSTS, X-Frame-Options) configuráveis sem código.

**Configuração de Segurança via Cloudflare:**

| Recurso | Configuração | Benefício |
|---------|-------------|-----------|
| SSL/TLS Mode | Full (Strict) | Criptografia ponta a ponta, sem certificado autoassinado |
| HSTS | Habilitado, max-age=31536000 | Força HTTPS por 1 ano |
| Min TLS Version | TLS 1.2 | Bloqueia protocolos obsoletos |
| Bot Fight Mode | Habilitado | Mitiga bots automatizados |
| Security Level | Medium | Bloqueia requisições claramente maliciosas |

---

## 9. Versionamento

### 9.1 GitHub

**Categoria:** Plataforma de hospedagem de repositórios Git
**Plano:** Free
**Limites do plano gratuito:** Repositórios privados ilimitados, 500MB de armazenamento de pacotes, 2.000 minutos de GitHub Actions/mês

#### Justificativa

O GitHub é a plataforma de versionamento padrão de mercado, com integração nativa a todas as outras ferramentas da stack: Vercel (deploy automático), GitHub Actions (CI/CD) e SGTI (rastreabilidade de mudanças via API).

**Estrutura de repositório do SGTI:**

```
sgti/                           ← Repositório monorepo
├── apps/
│   ├── web/                    ← Next.js frontend
│   └── api/                    ← NestJS backend
├── packages/
│   ├── database/               ← Prisma schema e migrations
│   └── shared-types/           ← Tipos TypeScript compartilhados
├── Docs/                       ← Toda a documentação do projeto
├── .github/
│   └── workflows/              ← Pipelines GitHub Actions
├── turbo.json                  ← Configuração do Turborepo (monorepo)
└── package.json
```

**Monorepo com Turborepo:**

O projeto utiliza **Turborepo** para gerenciar o monorepo. O Turborepo é gratuito e oferece:
- Cache de builds local e remoto (Vercel Remote Cache — gratuito para projetos na Vercel).
- Execução paralela de tasks entre os packages.
- Dependência ordenada de builds (database → shared-types → api → web).
- `turbo run build --filter=web...` para builds seletivos no CI.

**Estratégia de branches:**

```
main        ← Produção. Protegida. Merge via PR com revisão obrigatória.
  └── staging     ← Homologação. Deploy automático na Vercel.
        └── develop     ← Integração contínua.
              ├── feature/[modulo]-[descricao]
              ├── fix/[modulo]-[descricao]
              └── chore/[descricao]
```

---

## 10. CI/CD

### 10.1 GitHub Actions

**Categoria:** Plataforma de automação de CI/CD
**Plano:** Free
**Limites do plano gratuito:** 2.000 minutos/mês em repositórios privados (runners Linux)

#### Justificativa

GitHub Actions é nativamente integrado ao repositório GitHub, eliminando a necessidade de configuração de integração com ferramenta externa de CI/CD. Toda automação do ciclo de desenvolvimento do SGTI é gerenciada via Actions.

**Pipeline CI — `ci.yml` (Pull Requests)**

```
Trigger: push em qualquer branch com PR aberto

Jobs (paralelos):
├── lint
│   └── ESLint + Prettier check em todo o monorepo
├── type-check
│   └── tsc --noEmit em apps/web e apps/api
├── test:unit
│   ├── Jest (apps/api) com cobertura mínima
│   └── Vitest (apps/web) com cobertura mínima
├── test:integration
│   └── Supertest com banco PostgreSQL via Docker
└── build
    ├── next build (apps/web)
    └── nest build (apps/api)

Tempo estimado: 4–7 minutos
Custo em minutos: ~6 min/run
```

**Pipeline CD — `cd.yml` (merge em main)**

```
Trigger: merge na branch main

Jobs (sequenciais):
1. ci              ← Re-executa pipeline CI completo
2. test:e2e        ← Playwright contra ambiente staging
3. deploy:staging  ← Vercel CLI para ambiente staging
4. smoke:test      ← Checagem de health endpoints críticos
5. deploy:prod     ← Vercel CLI para produção (aprovação manual)
6. notify          ← E-mail de resultado via implantacao@pinpag.com.br

Tempo estimado: 12–18 minutos
Custo em minutos: ~15 min/run
```

**Otimização de minutos GitHub Actions:**

| Estratégia | Economia Estimada |
|------------|------------------|
| Cache de dependências `node_modules` via `actions/cache` | 40–60% de redução no tempo de instalação |
| Turborepo Remote Cache (gratuito via Vercel) | Build incremental — apenas o que mudou |
| Skip CI para commits `docs:` e `chore:` | ~20% dos commits evitam o pipeline |
| Testes E2E apenas em merge para `main` | Economia de ~8 min por PR |
| Matrix de testes paralelos | Redução de tempo total (mais rápido, mesmo custo) |

**Estimativa mensal de minutos:**

```
CI por PR:        ~6 min × 20 PRs/mês  = 120 min
CD por merge:    ~15 min × 8 merges/mês = 120 min
Total estimado:                          240 min
Limite gratuito:                       2.000 min
Margem disponível:                     1.760 min (88% livre)
```

---

## 11. Documentação de API

### 11.1 Swagger / OpenAPI 3.0

**Categoria:** Especificação e interface interativa de API REST
**Implementação:** `@nestjs/swagger` (módulo oficial)
**Licença:** Apache 2.0
**Custo:** Gratuito

#### Justificativa

A documentação da API do SGTI é gerada automaticamente a partir dos decorators NestJS, garantindo que a documentação esteja sempre sincronizada com o código — sem processo manual de atualização.

**Configuração no NestJS:**

O módulo `@nestjs/swagger` lê os decorators dos controllers, DTOs e entidades para gerar automaticamente a especificação OpenAPI 3.0. A interface Swagger UI é disponibilizada em `/api/docs` nos ambientes de desenvolvimento e staging.

**Decorators utilizados:**

| Decorator | Uso |
|-----------|-----|
| `@ApiTags('incidents')` | Agrupa endpoints por módulo |
| `@ApiOperation({ summary: '...' })` | Descreve a operação |
| `@ApiResponse({ status: 200, type: IncidentSummaryOutput })` | Documenta respostas |
| `@ApiBody({ type: OpenIncidentInput })` | Documenta o corpo da requisição |
| `@ApiBearerAuth()` | Marca endpoints que exigem JWT |
| `@ApiProperty({ description: '...' })` | Documenta propriedades dos DTOs |

**Ambientes de disponibilidade:**

| Ambiente | URL | Acesso |
|----------|-----|--------|
| Development | `http://localhost:3001/api/docs` | Aberto localmente |
| Staging | `https://api.staging.sgti.empresa.com/api/docs` | Restrito à rede interna |
| Production | Desabilitado | Segurança — sem exposição em produção |

**Exportação do schema:**

O schema OpenAPI 3.0 em JSON é gerado automaticamente no pipeline CI e versionado em `Docs/api-schema.json`, permitindo:
- Geração de clients TypeScript via `openapi-typescript`.
- Importação no Insomnia ou Postman para testes manuais.
- Detecção automática de breaking changes na API via diff do schema.

---

## 12. Monitoramento e Observabilidade

### 12.1 Vercel Analytics

**Categoria:** Analytics de performance e Web Vitals
**Plano:** Free (com limites)
**Limites do plano gratuito:** 2.500 eventos/mês no Speed Insights

#### Uso no SGTI

- **Core Web Vitals automáticos:** LCP, FID, CLS monitorados por rota sem código adicional.
- **Real User Monitoring (RUM):** métricas de performance coletadas de usuários reais, não sintéticas.
- **Identificação de rotas lentas:** páginas com CLS ou LCP degradados são sinalizadas no dashboard da Vercel.

---

### 12.2 Vercel Logs

**Categoria:** Logs de runtime das Serverless Functions
**Plano:** Free
**Retenção:** 1 hora (plano gratuito) — **limitação importante**

#### Uso no SGTI

- Logs de erro de Serverless Functions e Route Handlers disponíveis em tempo real no dashboard da Vercel.
- Alertas de erro configuráveis via Vercel Notifications para o e-mail `implantacao@pinpag.com.br`.

**Mitigação da retenção de 1 hora:**

Para superar a limitação de retenção do plano gratuito, logs críticos são persistidos no Supabase:

```
Fluxo de log crítico:
NestJS → LoggerService → Supabase (tabela system_logs)

Nível de log persistido: ERROR e CRITICAL
Retenção no Supabase: 30 dias (dentro do limite de 500MB)
```

---

### 12.3 Supabase Dashboard e Logs

**Categoria:** Monitoramento de banco de dados e queries
**Plano:** Free

#### Uso no SGTI

- **Query Performance:** identificação de queries lentas via `pg_stat_statements` no dashboard do Supabase.
- **Database Logs:** logs de conexão, erros e queries disponíveis no painel do Supabase com retenção de 7 dias.
- **Métricas de uso:** consumo de armazenamento, bandwidth e conexões ativas monitorados em tempo real.
- **Alerts de capacidade:** notificações automáticas quando o uso se aproxima dos limites do plano gratuito.

---

### 12.4 Sentry (Camada Futura — Gratuito com Limites)

**Plano Free:** 5.000 erros/mês, 10.000 eventos de performance/mês

Sentry não está ativo no MVP, mas é o próximo passo recomendado para rastreamento de erros em produção. O plano gratuito é suficiente para o volume inicial do SGTI e oferece:
- Stack traces completos com contexto de usuário e request.
- Agrupamento inteligente de erros semelhantes.
- Integração com GitHub para vínculo de erros a commits.
- Alertas por e-mail para novos erros em produção.

**Ativação:** quando o volume de chamados em produção superar 100/dia, a adição do Sentry deve ser avaliada.

---

## 13. Limites dos Planos Gratuitos

### 13.1 Tabela Consolidada de Limites

| Serviço | Recurso Crítico | Limite Gratuito | Volume Esperado MVP | Margem |
|---------|----------------|-----------------|---------------------|--------|
| **Supabase** | Banco de dados | 500 MB | ~50 MB (1.000 usuários, 6 meses) | 90% livre |
| **Supabase** | Storage | 1 GB | ~200 MB | 80% livre |
| **Supabase** | Bandwidth | 2 GB/mês | ~300 MB/mês | 85% livre |
| **Vercel** | Bandwidth | 100 GB/mês | ~5 GB/mês | 95% livre |
| **Vercel** | Build minutes | 6.000 min/mês | ~500 min/mês | 92% livre |
| **GitHub Actions** | CI minutes | 2.000 min/mês | ~240 min/mês | 88% livre |
| **Cloudflare** | DNS / CDN | Ilimitado | — | — |
| **Google OAuth** | Autenticações | 10.000 req/dia | ~200 req/dia | 98% livre |

### 13.2 Gatilhos de Upgrade

Os critérios abaixo definem quando o upgrade de plano deve ser avaliado:

| Serviço | Gatilho de Upgrade | Plano Pago | Custo Estimado |
|---------|-------------------|------------|----------------|
| **Supabase** | Banco > 400MB ou inatividade afetando produção | Pro | USD 25/mês |
| **Vercel** | Bandwidth > 80GB/mês ou equipe > 1 membro | Pro | USD 20/mês |
| **GitHub** | Actions > 1.800 min/mês ou equipe > 3 membros | Team | USD 4/usuário/mês |
| **Cloudflare** | Workers necessários para lógica de edge | Workers Paid | USD 5/mês |

### 13.3 Risco do Pause Automático do Supabase

O plano gratuito do Supabase **pausa o banco após 1 semana de inatividade**. Para o SGTI em produção, isso é inaceitável.

**Mitigações:**

1. **Curto prazo (MVP):** job automático no GitHub Actions que faz uma query leve no banco a cada 5 dias, mantendo-o ativo.
2. **Médio prazo (crescimento):** upgrade para o plano Pro do Supabase quando o sistema entrar em operação com usuários reais.

---

## 14. Matriz de Decisão

### 14.1 Avaliação das Tecnologias Selecionadas

Cada tecnologia foi avaliada nos critérios abaixo com pontuação de 1 (insuficiente) a 5 (excelente):

| Tecnologia | Maturidade | Gratuidade | TypeScript | DDD/Clean | Comunidade | Média |
|------------|-----------|------------|------------|-----------|------------|-------|
| Next.js | 5 | 5 | 5 | 4 | 5 | **4,8** |
| TypeScript | 5 | 5 | — | 5 | 5 | **5,0** |
| Tailwind CSS | 5 | 5 | 5 | 4 | 5 | **4,8** |
| shadcn/ui | 4 | 5 | 5 | 4 | 5 | **4,6** |
| NestJS | 5 | 5 | 5 | 5 | 5 | **5,0** |
| Prisma | 5 | 5 | 5 | 4 | 5 | **4,8** |
| Supabase PostgreSQL | 4 | 4 | 5 | 5 | 4 | **4,4** |
| Supabase Storage | 4 | 4 | 4 | 4 | 4 | **4,0** |
| Google OAuth | 5 | 5 | 5 | 4 | 5 | **4,8** |
| Vercel | 5 | 4 | 5 | 4 | 5 | **4,6** |
| Cloudflare | 5 | 5 | 4 | 4 | 5 | **4,6** |
| GitHub | 5 | 4 | 5 | 4 | 5 | **4,6** |
| GitHub Actions | 5 | 4 | 5 | 4 | 5 | **4,6** |
| Swagger/OpenAPI | 5 | 5 | 5 | 4 | 5 | **4,8** |

---

## 15. Riscos Tecnológicos e Mitigações

| # | Risco | Probabilidade | Impacto | Mitigação |
|---|-------|--------------|---------|-----------|
| R01 | Supabase pausa banco por inatividade em produção | Média | Alto | Job automático de keep-alive + upgrade planejado para Pro |
| R02 | Limite de bandwidth da Vercel atingido com crescimento | Baixa | Médio | Cache agressivo via Cloudflare + upgrade para Pro quando necessário |
| R03 | Minutos de GitHub Actions excedidos em meses de alta atividade | Baixa | Baixo | Otimizações de cache e skip CI documentadas no `01_CLAUDE.md` |
| R04 | Google OAuth fora do ar afeta toda autenticação | Muito Baixa | Crítico | SLA do Google de 99,9%; monitorar status.google.com; sem mitigação técnica viável a custo zero |
| R05 | Breaking change em versão major do Next.js ou NestJS | Baixa | Médio | Lock de versões no `package.json`; atualizações via PR revisado |
| R06 | Prisma incompatível com nova versão do PostgreSQL do Supabase | Muito Baixa | Médio | Supabase controla versão do PostgreSQL; atualizar Prisma após release notes |
| R07 | shadcn/ui componente descontinuado | Muito Baixa | Baixo | Componentes são copiados para o repositório — independentes de versão futura |
| R08 | Lock-in do Supabase dificulta migração | Baixa | Médio | Schema Prisma é agnóstico de provedor; migração para PostgreSQL self-hosted é viável |

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição da Alteração |
|--------|------|-------|------------------------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa | Criação do documento |

---

> **Próximos documentos recomendados:**
> [`Arquitetura/01_ARCHITECTURE_OVERVIEW.md`](./Arquitetura/01_ARCHITECTURE_OVERVIEW.md) — Visão geral da arquitetura técnica e estrutura de camadas
> [`01_CLAUDE.md`](../01_CLAUDE.md) — Regras permanentes de implementação para o Claude Code
