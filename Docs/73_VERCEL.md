# SGTI — Sistema de Gestão de Tecnologia da Informação
## Arquitetura Vercel — Hospedagem e Publicação do Frontend — Documentação Técnica

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [70_DEPLOYMENT.md](./70_DEPLOYMENT.md) · [71_SUPABASE.md](./71_SUPABASE.md) · [72_GITHUB_ACTIONS.md](./72_GITHUB_ACTIONS.md) · [50_INTEGRATIONS.md](./50_INTEGRATIONS.md)

---

## Sobre este Documento

Este documento define a **arquitetura oficial de hospedagem e publicação do frontend do SGTI na Vercel**, cobrindo ambientes, deploys, performance, segurança, observabilidade, custos e estratégia de crescimento.

**Premissa obrigatória:** Utilizar preferencialmente recursos gratuitos do Vercel (plano Hobby), migrando para planos pagos apenas quando os limites forem atingidos ou quando funcionalidades específicas forem necessárias para produção.

---

## Stack de Frontend

| Tecnologia | Versão | Papel |
|:----------:|:------:|:------|
| **Next.js** | 14+ (App Router) | Framework React com SSR, SSG e API Routes |
| **Vercel** | Hobby (Free) | Plataforma de hospedagem, CI/CD e serverless |
| **Supabase** | Free tier | Backend-as-a-service (banco, auth, storage, realtime) |
| **Cloudflare** | Free tier | DNS, CDN, WAF e segurança |
| **GitHub Actions** | Free tier | Pipelines de CI/CD antes do deploy Vercel |

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura](#2-arquitetura)
3. [Ambientes](#3-ambientes)
4. [Deploy Automático](#4-deploy-automático)
5. [Deploy Manual](#5-deploy-manual)
6. [Preview Deployments](#6-preview-deployments)
7. [Variáveis de Ambiente](#7-variáveis-de-ambiente)
8. [Integração com Supabase](#8-integração-com-supabase)
9. [Integração com Cloudflare](#9-integração-com-cloudflare)
10. [Performance](#10-performance)
11. [Segurança](#11-segurança)
12. [Observabilidade](#12-observabilidade)
13. [Logs](#13-logs)
14. [Monitoramento](#14-monitoramento)
15. [Custos](#15-custos)
16. [Limitações do Plano Gratuito](#16-limitações-do-plano-gratuito)
17. [Estratégia de Crescimento](#17-estratégia-de-crescimento)
18. [Plano de Contingência](#18-plano-de-contingência)
19. [Critérios de Aceitação](#19-critérios-de-aceitação)

---

## 1. Visão Geral

### 1.1 Por que Vercel para o SGTI

| Critério | Justificativa |
|:--------:|:-------------:|
| **Next.js nativo** | A Vercel criou o Next.js; integração perfeita sem configuração extra |
| **Zero-config deploy** | Push em `main` → produção automaticamente |
| **Serverless Functions** | API Routes do Next.js viram funções serverless na Vercel sem servidor para gerenciar |
| **Preview Deployments** | Cada PR recebe URL única de preview para revisão |
| **Edge Network global** | CDN distribuída globalmente para baixa latência |
| **Free tier generoso** | Hobby plan gratuito suficiente para o SGTI em estágio inicial |
| **Integração GitHub** | Deploy automático integrado nativamente ao GitHub |

### 1.2 Responsabilidades da Vercel no SGTI

| Responsabilidade | Vercel | Alternativa |
|:----------------:|:------:|:-----------:|
| Build do Next.js | ✅ Principal | — |
| Hosting de arquivos estáticos | ✅ Principal | — |
| Execução de API Routes (serverless) | ✅ Principal | — |
| Certificado TLS/HTTPS | ✅ Automático (Let's Encrypt) | Cloudflare (complementar) |
| CDN para assets estáticos | ✅ Vercel Edge Network | Cloudflare (complementar) |
| CI/CD | Parcial (build + deploy) | GitHub Actions (CI) |
| DNS | ❌ Não usa | Cloudflare |
| WAF e segurança de borda | ❌ Não usa | Cloudflare |

---

## 2. Arquitetura

### 2.1 Diagrama de Fluxo Completo

```
ARQUITETURA VERCEL NO SGTI

DESENVOLVIMENTO
───────────────
Desenvolvedor → git push → GitHub

    │
    ▼

GITHUB
──────
    ├── Triggers GitHub Actions (CI: lint + test + build + security)
    └── Triggers Vercel (via webhook do GitHub App)

    │ (Após CI verde)
    ▼

GITHUB ACTIONS (CI Pipeline)
─────────────────────────────
    ├── Lint + TypeScript check
    ├── Testes unitários e de integração
    ├── Security scan (npm audit + gitleaks + CodeQL)
    └── Aprova deploy para Vercel

    │
    ▼

VERCEL (Build + Deploy)
───────────────────────
    ├── Clone do repositório
    ├── npm ci (usando package-lock.json)
    ├── next build
    │   ├── Compila Server Components
    │   ├── Gera bundle otimizado (tree-shaking, code splitting)
    │   ├── Otimiza imagens (next/image)
    │   └── Gera arquivos estáticos (SSG para páginas públicas)
    ├── Deploy para Edge Network Vercel
    │   ├── Serverless Functions (API Routes) → Região gru1 (São Paulo)
    │   └── Assets estáticos → CDN global
    └── Healthcheck pós-deploy

    │
    ▼

CLOUDFLARE (Borda de segurança e DNS)
──────────────────────────────────────
    ├── DNS autoritativo (registros CNAME apontam para Vercel)
    ├── Proxy ativo (IP de origem da Vercel oculto)
    ├── CDN Cloudflare (cache de assets estáticos)
    ├── WAF (OWASP CRS, rate limiting, bot protection)
    └── HTTPS + HSTS obrigatório

    │
    ▼

USUÁRIO FINAL (Browser)
────────────────────────
    ├── Recebe HTML inicial (Server-Side Rendering via Vercel)
    ├── Hidratação React (bundle JS do CDN)
    ├── Chamadas à API do SGTI (Vercel Serverless Functions)
    └── WebSocket Supabase Realtime (direto, bypass Cloudflare proxy)
```

### 2.2 Roteamento de Requests

```
ROTEAMENTO DE REQUESTS NA VERCEL

Request do browser: https://sgti.empresa.com.br/dashboard

1. Cloudflare DNS resolve para Vercel (CNAME)
2. Cloudflare proxia a request para Vercel
3. Vercel recebe a request
4. Vercel Router determina o tipo de conteúdo:

   /dashboard → Server Component (renderizado no servidor)
     → Vercel executa Server Component
     → Busca dados no Supabase
     → Retorna HTML com dados já incluídos

   /api/incidents → API Route (serverless function)
     → Vercel executa a função
     → Responde com JSON

   /_next/static/* → Asset estático
     → Servido pelo CDN (sem executar servidor)

   /images/* → Imagem otimizada
     → next/image processa e serve via CDN
```

---

## 3. Ambientes

### 3.1 Projetos Vercel e Mapeamento de Ambientes

O SGTI usa **um único projeto Vercel** com múltiplos ambientes (não projetos separados), simplificando a gestão:

| Ambiente | Branch | URL | Tipo Vercel |
|:--------:|:------:|:---:|:-----------:|
| **Produção** | `main` | `sgti.empresa.com.br` | Production Deployment |
| **Homologação** | `staging` | `homolog.sgti.empresa.com.br` | Preview Deployment (promovido) |
| **Desenvolvimento** | `develop` | `dev.sgti.empresa.com.br` | Preview Deployment (promovido) |
| **Preview PRs** | Qualquer PR | `sgti-{branch}-{org}.vercel.app` | Preview Deployment (automático) |

### 3.2 Ambiente Local

**Objetivo:** Desenvolvimento com hot-reload e feedback imediato.

**Configuração:**
- `npm run dev` inicia Next.js em modo desenvolvimento (`localhost:3000`).
- `.env.local` com variáveis apontando para projeto Supabase pessoal.
- Fast Refresh para alterações em React Components sem perder estado.
- Turbopack (se Next.js 15) para builds de dev mais rápidos.

**Diferenças do ambiente local vs. produção:**
- Sem CDN (assets servidos localmente).
- Server Components com hot reload (em produção não há reload).
- Erros mais detalhados no browser (em produção, erros são genéricos).
- Sem HTTPS (localhost usa HTTP).

### 3.3 Ambiente de Desenvolvimento (Branch `develop`)

**Objetivo:** Integração contínua da equipe; validação técnica antes da homologação.

**Configuração Vercel:**
- Tipo: Preview Deployment.
- Branch configurada: `develop`.
- URL personalizada: `dev.sgti.empresa.com.br` (alias configurado na Vercel).
- Variáveis de ambiente: scope `Preview` (branch `develop`).
- Supabase: projeto DEV.

**Proteção de acesso:**
- No Vercel Hobby, previews não têm proteção por senha nativa.
- Mitigação: o próprio SGTI exige autenticação Google (domínio corporativo) para acessar qualquer página.

### 3.4 Ambiente de Homologação (Branch `staging`)

**Objetivo:** Validação funcional por QA e stakeholders antes da produção.

**Configuração Vercel:**
- Tipo: Preview Deployment.
- Branch configurada: `staging`.
- URL personalizada: `homolog.sgti.empresa.com.br` (alias).
- Variáveis de ambiente: scope `Preview` (branch `staging`).
- Supabase: projeto HML.

**Nota:** No plano Hobby, não há preview protection (senha). O acesso é controlado pelo próprio SGTI via autenticação.

### 3.5 Ambiente de Produção (Branch `main`)

**Objetivo:** Ambiente real com usuários finais.

**Configuração Vercel:**
- Tipo: Production Deployment.
- Branch: `main` (única branch que gera production deployment).
- URL: `sgti.empresa.com.br`.
- Variáveis de ambiente: scope `Production`.
- Supabase: projeto PROD.
- Cloudflare: proxy ativo com WAF em modo BLOCK.
- Deploy automático ao merge em `main` via GitHub App integration.

---

## 4. Deploy Automático

### 4.1 Integração Vercel ↔ GitHub

A Vercel instala um **GitHub App** no repositório que:
- Detecta push e pull requests automaticamente.
- Dispara builds sem necessidade de configuração manual.
- Reporta status do deploy de volta ao GitHub (status checks).
- Comenta no PR com a URL do preview deployment.

### 4.2 Fluxo de Deploy Automático por Evento

| Evento GitHub | Ação Vercel | Resultado |
|:-------------:|:-----------:|:---------:|
| PR aberto (qualquer branch) | Build + Preview Deployment | URL única por PR |
| Push em `develop` | Build + Update Preview (alias `dev.`) | Dev atualizado |
| Push em `staging` | Build + Update Preview (alias `homolog.`) | HML atualizado |
| Push em `main` | Build + Production Deployment | Produção atualizada |
| PR fechado/mergeado | Preview deployment expirado | URL removida em 24h |

### 4.3 Processo de Build na Vercel

```
BUILD PROCESS VERCEL

1. Checkout do repositório (SHA específico do push/merge)
2. Detecção automática do framework: Next.js
3. Leitura do vercel.json (configurações do projeto)
4. Injeção de variáveis de ambiente por scope
5. npm ci (install deterministico com lockfile)
6. Execução do build command: next build
   ├── Compilação de TypeScript
   ├── Geração de páginas estáticas (SSG)
   ├── Compilação de Server Components
   ├── Bundle de Client Components com code splitting
   └── Geração do diretório .next/
7. Análise do output (.next/):
   ├── Identifica páginas estáticas vs. dinâmicas
   ├── Identifica API Routes como serverless functions
   └── Separa assets para CDN
8. Upload de assets para CDN global
9. Deploy de serverless functions para região(ões) configuradas
10. Atribuição da URL do deployment
11. Update do alias (para branches configuradas)
12. Notificação ao GitHub (deployment status)
```

### 4.4 Build Command e Output Directory

| Configuração | Valor |
|:------------:|-------|
| **Build Command** | `next build` |
| **Output Directory** | `.next` (automático para Next.js) |
| **Install Command** | `npm ci` (não `npm install`) |
| **Development Command** | `next dev` |
| **Node.js Version** | 20.x (LTS, configurado no projeto Vercel) |

---

## 5. Deploy Manual

### 5.1 Quando Usar Deploy Manual

O deploy manual é usado em situações excepcionais:

| Situação | Método |
|:--------:|:------:|
| Hotfix urgente sem esperar o pipeline completo | Vercel CLI |
| Re-deploy de versão anterior (rollback) | Vercel Dashboard |
| Deploy de branch experimental não coberta pelo automático | Vercel CLI |
| Teste de build local antes de fazer push | Vercel CLI (dry-run) |

### 5.2 Deploy via Vercel CLI

```
DEPLOY MANUAL VIA CLI

Instalação:
  npm install -g vercel

Autenticação:
  vercel login (abre browser para autenticação)

Deploy de preview:
  vercel deploy
  → Resultado: URL de preview única

Deploy de produção (apenas IT_MANAGER):
  vercel deploy --prod
  → Requer confirmação explícita
  → Registrar no audit_log manualmente após

Verificar deploys:
  vercel ls
  → Lista todos os deployments recentes

Rollback via CLI:
  vercel rollback {deployment-url}
  → Promove deployment anterior para produção
```

### 5.3 Regras para Deploy Manual

- Deploy manual em produção **exige** aprovação do IT_MANAGER.
- Deve ser registrado no `shared.audit_log` com `action = MANUAL_PRODUCTION_DEPLOY`.
- Deploy manual **não dispensa** o CI; o código deve ter passado pelo pipeline antes.
- Em caso de emergência (hotfix), o CI pode ser simplificado mas não pulado.

---

## 6. Preview Deployments

### 6.1 O que são Preview Deployments

Preview Deployments são ambientes efêmeros criados automaticamente para cada Pull Request. Permitem:

- Revisão visual da mudança sem merge.
- Testes manuais de funcionalidade.
- Compartilhamento de link com stakeholders para aprovação.
- Verificação de responsividade em dispositivos reais.

### 6.2 Ciclo de Vida de um Preview Deployment

```
CICLO DE VIDA DO PREVIEW DEPLOYMENT

1. PR aberto ou commit adicionado ao PR:
   → Vercel detecta via GitHub App webhook
   → Build iniciado automaticamente (1–3 min)
   → URL gerada: sgti-{branch-hash}-{org}.vercel.app

2. Build concluído:
   → Vercel comenta no PR:
     "✅ Preview deployado: https://sgti-feat-42.vercel.app
      Branch: feature/42-email-notification
      Commit: a1b2c3d"

3. Revisores acessam a URL para review visual:
   → Mesmo banco que o ambiente de desenvolvimento
   → Variáveis de ambiente de development scope

4. PR mergeado ou fechado:
   → Preview URL permanece ativa por mais 24 horas
   → Após 24 horas: deployment expirado e removido

5. Branch excluída:
   → Preview também removido automaticamente
```

### 6.3 Limitações de Preview no Plano Hobby

| Característica | Hobby (Free) | Pro |
|:--------------:|:------------:|:---:|
| Número de previews simultâneos | Ilimitado | Ilimitado |
| Password protection | ❌ Não disponível | ✅ Disponível |
| Preview Comments no Figma/Storybook | ❌ Não disponível | ✅ Disponível |
| Domínio customizado para preview | ❌ Não disponível | ✅ Disponível |
| Duração do preview após PR fechado | 24 horas | 24 horas |

**Mitigação para falta de password protection:** O próprio SGTI exige autenticação Google com domínio corporativo, protegendo naturalmente os previews de acesso não autorizado.

---

## 7. Variáveis de Ambiente

### 7.1 Escopos de Variável na Vercel

| Escopo | Quando é Injetado | Uso |
|:------:|:-----------------:|:----|
| **Production** | Apenas em production deployments (branch `main`) | Dados reais de produção |
| **Preview** | Em todos os preview deployments (inclui dev, staging, PRs) | Dados de desenvolvimento/homologação |
| **Development** | Apenas em `vercel dev` (local com Vercel CLI) | Dados locais |

### 7.2 Variáveis por Escopo

**Escopo Production (branch `main` apenas):**

| Variável | Tipo | Descrição |
|:--------:|:----:|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Env | URL do projeto Supabase PROD |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Env | Anon key do Supabase PROD |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | Service role key PROD |
| `GOOGLE_CLIENT_ID` | Env | Client ID OAuth para produção |
| `GOOGLE_CLIENT_SECRET` | **Secret** | Client secret OAuth para produção |
| `GOOGLE_SA_KEY_JSON` | **Secret** | Service Account key para Admin SDK |
| `JWT_PRIVATE_KEY_RS256` | **Secret** | Chave privada JWT RS256 |
| `JWT_PUBLIC_KEY_RS256` | Env | Chave pública JWT RS256 |
| `GLPI_API_URL` | Env | URL da API REST do GLPI |
| `GLPI_APP_TOKEN` | **Secret** | App-Token do GLPI |
| `NEXT_PUBLIC_APP_VERSION` | Env | Versão atual (ex.: 1.2.3) |
| `NEXT_PUBLIC_APP_ENV` | Env | `production` |

**Escopo Preview (dev, staging, PRs):**

As mesmas variáveis, mas com valores apontando para os projetos Supabase de DEV ou HML e com `NEXT_PUBLIC_APP_ENV = development` ou `staging`.

### 7.3 Separação Secret vs. Environment Variable

| Tipo Vercel | Visibilidade | Quando Usar |
|:-----------:|:------------:|:------------|
| **Environment Variable** | Visível no painel (mascarada) | Valores não-sensíveis: URLs, client IDs |
| **Secret (Encrypted)** | Nunca visível após salvar | Chaves privadas, tokens de API, service role keys |

### 7.4 Variáveis NEXT_PUBLIC_ vs. Server-Side

| Prefixo | Onde é Injetado | Visível no Browser? |
|:-------:|:---------------:|:-------------------:|
| `NEXT_PUBLIC_` | Bundle client-side e servidor | ✅ Sim (público) |
| Sem prefixo | Apenas servidor (API Routes, Server Components) | ❌ Não (privado) |

**Regra crítica:** `SUPABASE_SERVICE_ROLE_KEY`, `JWT_PRIVATE_KEY_RS256` e qualquer chave privada **nunca** devem ter o prefixo `NEXT_PUBLIC_`. Se adicionados com esse prefixo, ficam expostos no bundle JavaScript do browser.

### 7.5 Sincronização com .env.example

O arquivo `.env.example` no repositório documenta todas as variáveis necessárias (sem valores reais). Toda nova variável adicionada ao Vercel deve ser documentada neste arquivo com comentário explicativo.

---

## 8. Integração com Supabase

### 8.1 Cliente Supabase por Contexto

A integração com Supabase no Next.js usa o pacote `@supabase/ssr`, que oferece clientes otimizados para cada contexto:

| Contexto | Cliente | Chave | Acesso |
|:--------:|:-------:|:-----:|:------:|
| **Server Components** | `createServerClient` (cookies) | Anon Key + JWT do usuário | Sujeito ao RLS |
| **API Routes** | `createServerClient` (cookies) OU `createClient` com Service Role | Service Role | Contorna RLS |
| **Client Components** | `createBrowserClient` | Anon Key | Sujeito ao RLS |
| **Middleware Next.js** | `createServerClient` | Anon Key | Verificação de sessão |

### 8.2 Gerenciamento de Sessão com @supabase/ssr

O `@supabase/ssr` gerencia automaticamente a sessão via cookies HttpOnly:

```
FLUXO DE SESSÃO

Browser faz request para /dashboard:
  1. Next.js Middleware lê cookie da sessão
  2. Middleware chama supabase.auth.getUser() para validar
  3. Se sessão válida: renderiza /dashboard
  4. Se sessão expirada: refresh automático via cookie
  5. Se sem sessão: redirect para /login

Server Component /dashboard:
  1. Usa o cliente Supabase com o cookie da sessão
  2. Queries são executadas como o usuário autenticado
  3. RLS se aplica com base no auth.uid() do usuário
```

### 8.3 Middleware Next.js para Proteção de Rotas

O middleware em `middleware.ts` intercepta todas as requests antes do roteamento:

```
MIDDLEWARE DE AUTENTICAÇÃO

Rotas públicas (sem autenticação):
  /login
  /auth/callback (callback do OAuth Google)
  /api/health (health check)
  /api/health/db

Rotas protegidas (requerem autenticação):
  /dashboard/* → qualquer usuário autenticado
  /incidents/* → IT_TECHNICIAN+
  /compliance/* → COMPLIANCE_OFFICER, IT_MANAGER
  /finance/* → FINANCIAL_ANALYST, IT_MANAGER
  /admin/* → SUPER_ADMIN apenas

Comportamento:
  → Request chega ao middleware
  → Verifica session cookie com Supabase Auth
  → Se autenticado: verifica papel para a rota
  → Se sem papel: redirect para /unauthorized
  → Se sem sessão: redirect para /login
```

### 8.4 Realtime via Vercel

O Supabase Realtime usa WebSocket direto, sem passar pelas API Routes da Vercel:

```
REALTIME — CONEXÃO DIRETA

Browser → WebSocket → Supabase Realtime Server
(NÃO passa pela Vercel)

URL: wss://[ref].supabase.co/realtime/v1/websocket

Isso é importante porque:
  - Vercel Serverless Functions não suportam WebSocket
  - A conexão Realtime é persistente (Vercel functions são stateless)
  - O browser conecta diretamente ao Supabase
```

---

## 9. Integração com Cloudflare

### 9.1 Relação Vercel ↔ Cloudflare

O Cloudflare fica na frente da Vercel, atuando como proxy reverso:

```
CAMADAS DE PROXY

Usuário → Cloudflare (proxy) → Vercel (origem)

DNS: Registros CNAME no Cloudflare apontam para:
  sgti.empresa.com.br → {alias}.vercel.app

Cloudflare proxia (nuvem laranja ativa):
  ✅ Oculta o IP real da Vercel
  ✅ Aplica WAF
  ✅ Cache de assets estáticos
  ✅ Compressão Brotli
  ✅ HTTPS e HSTS

Vercel recebe requests já filtradas pelo Cloudflare:
  → Header CF-Connecting-IP: IP real do usuário
  → Header CF-IPCountry: país do usuário
  → Header CF-Ray: ID único da request no Cloudflare
```

### 9.2 Configuração de DNS no Cloudflare

| Registro | Tipo | Nome | Valor | Proxy |
|:--------:|:----:|:----:|:-----:|:-----:|
| Produção | CNAME | `sgti` | `cname.vercel-dns.com` | ✅ Laranja |
| Homologação | CNAME | `homolog.sgti` | `cname.vercel-dns.com` | ✅ Laranja |
| Desenvolvimento | CNAME | `dev.sgti` | `cname.vercel-dns.com` | 🔘 Cinza (sem proxy) |

**Nota sobre dev:** O ambiente de desenvolvimento usa proxy desabilitado (cinza) para evitar caching de assets durante desenvolvimento ativo.

### 9.3 Headers Cloudflare → Vercel

A Vercel confia em headers do Cloudflare para obter informações reais do cliente:

| Header | Uso |
|:------:|:----|
| `CF-Connecting-IP` | IP real do usuário (para logs de auditoria, rate limiting) |
| `CF-IPCountry` | País do usuário (para alertas de acesso geográfico incomum) |
| `CF-Ray` | ID único da request (para correlação de logs entre Cloudflare e Vercel) |
| `X-Forwarded-For` | Cadeia de IPs (Vercel não usa este; prefere CF-Connecting-IP) |

### 9.4 Cache Strategy Cloudflare vs. Vercel

| Tipo de Asset | Cached pelo Cloudflare? | Cache-Control |
|:-------------:|:-----------------------:|:-------------:|
| `/_next/static/*` (JS, CSS) | ✅ Sim | `public, max-age=31536000, immutable` |
| Imagens otimizadas (`/_next/image`) | ✅ Sim | `public, max-age=86400` |
| Páginas HTML (Server Components) | ❌ Não | `no-cache, no-store` |
| API Routes (`/api/*`) | ❌ Não | `no-cache` |
| Assets públicos (`/public/*`) | ✅ Sim | Configurável |

---

## 10. Performance

### 10.1 Estratégias de Cache

O Next.js tem um sistema hierárquico de cache otimizado para a Vercel:

```
HIERARQUIA DE CACHE NEXT.JS NA VERCEL

L1: Request Memoization (in-memory, por request)
  → Deduplicação de fetch() idênticos no mesmo render
  → Escopo: uma request ao servidor
  → Automático para fetch() no App Router

L2: Data Cache (disk, entre requests)
  → Dados de Server Components cacheados no filesystem da Vercel
  → Configurado via: fetch(url, { next: { revalidate: 60 } })
  → 60 = revalidar a cada 60 segundos (ISR — Incremental Static Regeneration)
  → revalidate: false = nunca revalidar (dados estáticos)
  → revalidate: 0 = sem cache (dados dinâmicos)

L3: Full Route Cache (disk, entre requests)
  → Páginas inteiras cacheadas na Vercel
  → Apenas para páginas estáticas (sem dados dinâmicos por usuário)
  → O SGTI tem poucas páginas estáticas (maioria é protegida por auth)

L4: CDN Cloudflare (edge, global)
  → Assets imutáveis: JS, CSS, fontes
  → Cache-Control: immutable para bundles com hash no nome
```

### 10.2 Estratégia por Tipo de Página

| Página | Estratégia de Renderização | Cache |
|:------:|:--------------------------|:-----:|
| Login (`/login`) | SSG (estático) | Full Route Cache |
| Dashboard (`/dashboard/*`) | SSR por request | Sem cache (dados ao vivo) |
| Chamados (`/incidents/*`) | SSR por request | Sem cache |
| Relatórios gerados | SSR com dados | Cache de 5 minutos (revalidate: 300) |
| Catálogo de serviços | SSR com ISR | Cache de 1 hora (revalidate: 3600) |
| Artigos KB publicados | ISR | Cache de 10 minutos (revalidate: 600) |
| Assets (JS, CSS, fonts) | Estático | Imutável (max-age: 1 ano) |

### 10.3 CDN e Edge Network da Vercel

O Vercel Edge Network distribui assets automaticamente:

- **Assets estáticos** (`/_next/static/`): distribuídos em todas as regiões do edge automaticamente.
- **Serverless Functions**: executadas apenas na região configurada (`gru1` — São Paulo).
- **Edge Functions** (Middleware): executadas no edge, próximo ao usuário.

### 10.4 Otimização de Imagens (next/image)

O componente `<Image>` do Next.js:

| Otimização | Descrição |
|:----------:|-----------|
| **Formato automático** | Converte para WebP ou AVIF conforme suporte do browser |
| **Lazy loading** | Imagens fora da viewport carregam apenas quando necessário |
| **Responsividade** | Gera múltiplos tamanhos via `srcset` |
| **Dimensões obrigatórias** | Previne Cumulative Layout Shift (CLS) |
| **CDN** | Imagens otimizadas servidas via CDN Vercel |

**Configuração no next.config.js:**
- Domínios externos autorizados para imagens (ex.: Google avatar URLs, Supabase Storage CDN).
- Dispositivos configurados para geração de `srcset` adequado ao SGTI.

### 10.5 Compressão

| Tipo | Compressão | Configurado por |
|:----:|:----------:|:---------------:|
| Respostas HTML/JSON | Gzip (Vercel automático) | Vercel |
| Assets estáticos (JS, CSS) | Brotli (Cloudflare automático) | Cloudflare |
| Imagens | WebP/AVIF (next/image) | Next.js |

### 10.6 Core Web Vitals — Metas

| Métrica | Meta | Descrição |
|:-------:|:----:|-----------|
| **LCP** (Largest Contentful Paint) | ≤ 2,5s | Maior elemento visível |
| **FID** / **INP** (Interaction to Next Paint) | ≤ 200ms | Responsividade a interações |
| **CLS** (Cumulative Layout Shift) | ≤ 0,1 | Estabilidade visual |
| **TTFB** (Time to First Byte) | ≤ 600ms | Velocidade do servidor |
| **FCP** (First Contentful Paint) | ≤ 1,8s | Primeiro conteúdo visível |

---

## 11. Segurança

### 11.1 HTTPS Obrigatório

| Camada | HTTPS | Configuração |
|:------:|:-----:|:------------:|
| Vercel | ✅ Automático | Let's Encrypt via Vercel |
| Cloudflare | ✅ Obrigatório | SSL/TLS mode: Full (strict) |
| Cloudflare → Vercel | ✅ Obrigatório | Certificado Vercel validado pelo Cloudflare |
| HSTS | ✅ Ativo | `max-age=31536000; includeSubDomains; preload` |

**Configuração Cloudflare SSL/TLS:** Modo "Full (strict)" — Cloudflare valida o certificado da Vercel antes de proxiar. Previne ataques MITM entre Cloudflare e Vercel.

### 11.2 Security Headers

Headers configurados via `next.config.js` (aplicados em todas as responses):

```
SECURITY HEADERS — next.config.js

X-DNS-Prefetch-Control: on
  → Permite prefetch de DNS para melhorar performance

Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  → HSTS: força HTTPS por 2 anos

X-Frame-Options: SAMEORIGIN
  → Previne Clickjacking; permite iframes apenas do mesmo origin

X-Content-Type-Options: nosniff
  → Previne MIME sniffing

Referrer-Policy: strict-origin-when-cross-origin
  → Limita informações de referrer enviadas

Permissions-Policy: camera=(), microphone=(), geolocation=()
  → Desabilita acesso a câmera, microfone e geolocalização

X-XSS-Protection: 1; mode=block
  → Legacy header para browsers antigos (Chrome/Firefox já ignoram)
```

### 11.3 Content Security Policy (CSP)

O CSP é configurado para restringir as origens de conteúdo:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval'
    https://cdn.vercel-insights.com;
  style-src 'self' 'unsafe-inline'
    https://fonts.googleapis.com;
  font-src 'self'
    https://fonts.gstatic.com;
  img-src 'self' data: blob:
    https://*.supabase.co
    https://lh3.googleusercontent.com
    https://cdn.vercel-insights.com;
  connect-src 'self'
    https://*.supabase.co
    wss://*.supabase.co
    https://accounts.google.com;
  frame-ancestors 'none';
  form-action 'self';
  base-uri 'self';
  upgrade-insecure-requests;

NOTA: 'unsafe-inline' é necessário para o Next.js App Router
      (estilos inline gerados pelo servidor).
      'unsafe-eval' pode ser necessário para algumas dependências.
      Revisar e restringir conforme o projeto amadurece.
```

### 11.4 Proteção contra Ataques Comuns

| Ataque | Proteção | Camada |
|:------:|:--------:|:------:|
| **XSS** | CSP + React (escaping automático) | Next.js + Vercel |
| **CSRF** | SameSite=Lax nos cookies + Origin check | Next.js |
| **Clickjacking** | X-Frame-Options + frame-ancestors | Vercel Headers |
| **SQL Injection** | Prisma ORM (queries parametrizadas) + RLS | Supabase |
| **DDoS** | Rate limiting + DDoS protection | Cloudflare |
| **Path Traversal** | Next.js previne via roteamento | Next.js |
| **Open Redirect** | Validação de URLs de redirect | Middleware |
| **Session Hijacking** | HttpOnly + Secure + SameSite cookies | @supabase/ssr |
| **Brute Force** | Rate limiting em /api/auth/* | Cloudflare + Supabase |
| **Bot Attack** | Bot Fight Mode | Cloudflare |

### 11.5 Proteção das API Routes

As API Routes (`/api/*`) têm camadas de proteção:

1. **Autenticação obrigatória:** Toda route verifica sessão via `supabase.auth.getUser()`.
2. **Autorização por papel:** Middleware de RBAC verifica papel antes de processar.
3. **Validação de input:** Dados de entrada validados com Zod antes de qualquer processamento.
4. **Rate limiting no Cloudflare:** 100 req/min para `/api/auth/*`, 1000 req/min para outras.
5. **CORS restrito:** Headers CORS configurados para aceitar apenas os domínios do SGTI.

---

## 12. Observabilidade

### 12.1 Vercel Analytics

O Vercel Analytics (free tier) provê:

| Métrica | O que Mede |
|:-------:|:----------:|
| **Web Vitals** | LCP, FID/INP, CLS, TTFB por página |
| **Real User Monitoring** | Performance real medida no browser dos usuários |
| **Page Views** | Visualizações por rota com breakdown geográfico |
| **Unique Visitors** | Visitantes únicos (sem cookies — privacy-first) |

**Configuração:** Adicionar `<Analytics />` do pacote `@vercel/analytics` no layout raiz do Next.js.

### 12.2 Vercel Speed Insights

O Speed Insights monitora Core Web Vitals em produção:

- Dados de performance de usuários reais (não sintéticos).
- Visualização por página, dispositivo e país.
- Alertas quando métricas degradam abaixo dos thresholds.

### 12.3 Logs da Vercel

| Tipo de Log | Disponível | Retenção | Onde Ver |
|:-----------:|:----------:|:--------:|:--------:|
| **Build Logs** | ✅ Todas as builds | 30 dias | Vercel Dashboard → Deployments |
| **Runtime Logs** | ✅ Funções serverless | 1 hora (Hobby) / 1 dia (Pro) | Vercel Dashboard → Logs |
| **Edge Middleware Logs** | ✅ Middleware | 1 hora (Hobby) | Vercel Dashboard → Logs |

**Limitação crítica do Hobby:** Runtime logs disponíveis apenas por 1 hora. Para análise posterior, logs críticos devem ser gravados no banco de dados do SGTI.

---

## 13. Logs

### 13.1 Estratégia de Logging no SGTI

Dado que os runtime logs do Vercel têm apenas 1 hora de retenção no plano Hobby, o SGTI usa uma estratégia de duplo logging:

```
ESTRATÉGIA DE LOGGING

Logs de desenvolvimento / debug:
  console.log() → Vercel Runtime Logs (1h de retenção)
  Usado para: diagnóstico imediato durante desenvolvimento

Logs de negócio / auditoria:
  INSERT em shared.audit_log → Supabase PostgreSQL (retenção indefinida)
  Usado para: auditoria de operações, rastreabilidade, compliance

Logs de erros críticos:
  console.error() → Vercel Runtime Logs (1h) +
  INSERT em shared.error_log → Supabase (30 dias de retenção)
  Usado para: debug de erros de produção
```

### 13.2 Estrutura de Log no SGTI

Todo log de aplicação usa formato JSON estruturado:

```json
{
  "timestamp": "2026-06-09T14:00:00.123Z",
  "level": "info",
  "service": "sgti-frontend",
  "version": "1.2.3",
  "env": "production",
  "correlation_id": "uuid-da-request",
  "user_id": "uuid-do-usuario",
  "tenant_id": "uuid-do-tenant",
  "route": "/api/incidents",
  "method": "POST",
  "status_code": 201,
  "duration_ms": 245,
  "message": "Incident created successfully"
}
```

### 13.3 Logs de Erro para Diagnóstico

Erros em API Routes são estruturados para facilitar diagnóstico:

```json
{
  "level": "error",
  "message": "Failed to create incident",
  "correlation_id": "uuid",
  "error_code": "SUPABASE_ERROR",
  "error_message": "duplicate key value violates unique constraint",
  "route": "/api/incidents",
  "duration_ms": 134
}
```

**Regra:** Stack traces completos são logados no servidor (Vercel Logs) mas **nunca** enviados ao browser. A resposta ao cliente contém apenas `error_code` e mensagem genérica.

---

## 14. Monitoramento

### 14.1 Monitoramento de Disponibilidade

| Ferramenta | Frequência | O que Monitora | Alerta |
|:----------:|:----------:|:--------------:|:------:|
| **UptimeRobot** (free) | A cada 5 min | `GET /api/health` → 200 OK | E-mail ao IT_MANAGER |
| **Cloudflare Health Checks** | A cada 1 min | IP de origem Vercel | Automático |
| **Vercel Status** | Contínuo | Status da plataforma Vercel | status.vercel.com |

### 14.2 Alertas de Performance

| Condição | Alerta | Canal |
|:--------:|:------:|:-----:|
| Disponibilidade < 99,5% em 1h | Urgente | E-mail IT_MANAGER |
| LCP > 2,5s em produção | Atenção | Vercel Analytics dashboard |
| CLS > 0,1 em produção | Atenção | Vercel Analytics dashboard |
| Build falhou | Imediato | E-mail autor + IT_MANAGER |
| Deploy de produção falhou | Urgente | E-mail IT_MANAGER |
| Runtime error 5xx > 1% | Atenção | E-mail IT_MANAGER |

### 14.3 Dashboard de Monitoramento

O IT_MANAGER acompanha estas métricas semanalmente:

| Métrica | Fonte | Frequência de Revisão |
|:-------:|:-----:|:---------------------:|
| Uptime (% disponibilidade) | UptimeRobot | Semanal |
| Core Web Vitals | Vercel Analytics | Semanal |
| Build success rate | Vercel Dashboard | Semanal |
| Bandwidth consumido | Vercel Dashboard | Mensal |
| Serverless function invocations | Vercel Dashboard | Mensal |

---

## 15. Custos

### 15.1 Custos Atuais (Plano Hobby — Free)

| Recurso | Limite Hobby | Custo |
|:-------:|:------------:|:-----:|
| Deployments | Ilimitado | R$ 0,00 |
| Bandwidth | 100 GB/mês | R$ 0,00 |
| Serverless Function executions | 100 GB-hours/mês | R$ 0,00 |
| Builds | 6.000 minutos/mês | R$ 0,00 |
| Edge Middleware | 500.000 invocações/mês | R$ 0,00 |
| Analytics | Disponível | R$ 0,00 |
| Domínios customizados | Até 50 | R$ 0,00 |
| **Total** | | **R$ 0,00/mês** |

### 15.2 Custos Projetados (Plano Pro — ao escalar)

| Recurso | Plano Pro | Custo Estimado |
|:-------:|:---------:|:--------------:|
| Plano base | Pro | USD 20/mês (~R$ 100) |
| Bandwidth adicional | USD 0,40/GB acima de 1 TB | Variável |
| Build minutes adicionais | Incluídos (24.000 min) | Incluído |
| Serverless Functions | Incluídas (1.000 GB-hours) | Incluído |
| **Total estimado Pro** | | ~R$ 100–200/mês |

---

## 16. Limitações do Plano Gratuito

### 16.1 Limitações Técnicas e Impacto

| Limitação | Impacto no SGTI | Mitigação |
|:----------:|:---------------:|:---------:|
| **Serverless timeout: 10s** | API Routes que consultam muitos dados podem atingir o limite | Paginação obrigatória; queries otimizadas com índices |
| **Runtime logs: 1 hora** | Logs de produção expiram rapidamente | Logs críticos escritos no Supabase (audit_log) |
| **Bandwidth: 100 GB/mês** | Suficiente para equipes pequenas; pode limitar com muitos arquivos | Limitar uploads grandes ao Storage do Supabase (não via Vercel) |
| **Preview sem password** | Previews acessíveis publicamente (pela URL) | Autenticação Google do SGTI protege naturalmente |
| **Analytics básico** | Dados limitados vs. Google Analytics | Suficiente para monitoramento inicial |
| **Sem Team features** | Sem roles e permissões de equipe no painel Vercel | Apenas 1 conta de admin por projeto |
| **Builds: 6.000 min/mês** | ~200 builds por mês (30 min médio cada) | Suficiente para time pequeno; monitorar uso |
| **Sem SLA de uptime** | Sem garantia contratual de disponibilidade | Cloudflare + UptimeRobot para monitoramento externo |
| **Shared infrastructure** | Recursos compartilhados com outros usuários | Aceitável para estágio inicial |

### 16.2 Limitação Crítica: Serverless Timeout de 10 Segundos

O timeout de 10 segundos no plano Hobby impacta especialmente:

- **Geração de relatórios grandes:** Relatórios com > 10.000 registros.
- **Migrations de banco via API:** Não usar API Routes para migrations.
- **Exports de Excel pesados:** Processar assincronamente via job.

**Mitigações implementadas:**
1. Relatórios pesados executados assincronamente (response imediato + notificação quando pronto).
2. Paginação obrigatória em todas as listagens.
3. Migrations via Supabase CLI (não via API Routes).
4. Queries otimizadas com índices específicos por tipo de consulta frequente.

---

## 17. Estratégia de Crescimento

### 17.1 Critérios para Upgrade para Vercel Pro

| Critério | Threshold | Ação |
|:--------:|:---------:|:----:|
| Timeout 10s causando falhas em > 5% das requests | Recorrente | Upgrade para Pro (60s timeout) |
| Bandwidth > 80 GB/mês (80% do limite) | 80 GB | Avaliar upgrade para Pro |
| Build minutes > 4.800/mês (80% do limite) | 4.800 min | Avaliar otimização de builds ou upgrade |
| Necessidade de password protection para previews | Qualquer | Upgrade para Pro |
| Necessidade de SLA contratual | Compliance | Upgrade para Enterprise |
| Equipe > 5 desenvolvedores precisando de acesso ao painel | 5+ devs | Upgrade para Pro (team features) |

### 17.2 Opções de Upgrade

| Necessidade | Solução |
|:-----------:|:-------:|
| Maior timeout | Vercel Pro (USD 20/mês) |
| Team features + SLA | Vercel Pro |
| Compliance enterprise | Vercel Enterprise (preço sob consulta) |
| Multi-region functions | Vercel Pro |
| Logs persistentes | Vercel Pro (1 dia) + Vercel Log Drains para S3/Datadog |

### 17.3 Alternativas se Vercel se Tornar Caro

Se o custo da Vercel se tornar inviável, as alternativas são:

| Alternativa | Prós | Contras |
|:-----------:|:----:|:-------:|
| **Cloudflare Pages** | Free tier generoso; integrado ao Cloudflare | Suporte a Next.js não tão maduro |
| **Netlify** | Bom suporte ao Next.js | Plano free mais restrito |
| **Self-hosted (VPS)** | Controle total; custo previsível | Gerenciamento de servidor |
| **Docker + Railway** | Fácil de configurar | Custo fixo mensal |

---

## 18. Plano de Contingência

### 18.1 Cenário: Vercel Indisponível

```
PLANO DE CONTINGÊNCIA — VERCEL DOWN

Duração esperada: Geralmente < 30 minutos (Vercel tem alta disponibilidade)

Ações imediatas (T+0 a T+5 min):
  1. Verificar https://www.vercel-status.com
  2. Verificar se é problema global ou apenas do projeto
  3. Comunicar usuários via e-mail: "Sistema em manutenção"

Ações de contingência (T+5 min):
  Opção A: Aguardar resolução da Vercel (recomendado se < 30 min)
  Opção B: Ativar plano de fallback com Cloudflare Pages

Procedimento Cloudflare Pages (emergência):
  1. Ativar projeto sgti-fallback no Cloudflare Pages
  2. Deployment manual do último build estável
  3. Atualizar DNS para apontar para Cloudflare Pages
  4. Comunicar usuários do URL de contingência
```

### 18.2 Manutenção do Projeto de Contingência

O projeto Cloudflare Pages é mantido como standby:
- Atualizado mensalmente com o último build de produção.
- Testado trimestralmente para garantir funcionalidade.
- DNS de failover configurado no Cloudflare.

### 18.3 Cenário: Deploy de Produção Falhou

Coberto no documento `72_GITHUB_ACTIONS.md` (Seção 9 — Rollback) e `70_DEPLOYMENT.md` (Seção 16 — Rollback).

**Resumo:**
1. Smoke tests detectam falha automaticamente.
2. `vercel rollback` executado pelo pipeline.
3. IT_MANAGER notificado via e-mail urgente.
4. Versão anterior restaurada em < 1 minuto.

### 18.4 Cenário: Limite de Bandwidth Atingido

```
CONTINGÊNCIA — BANDWIDTH ESGOTADO

Sintoma: Usuários recebem 403 da Vercel (quota exceeded)

Ação imediata (T+0):
  1. IT_MANAGER verifica uso no painel Vercel
  2. Identificar origem do consumo excessivo (logs de acesso)

Ações de redução de consumo:
  3. Ativar cache mais agressivo no Cloudflare para assets
  4. Bloquear IPs suspeitos de consumo abusivo no Cloudflare WAF
  5. Verificar se há scraping ou DDoS em andamento

Ação de recuperação:
  6a. Upgrade para Vercel Pro (USD 20/mês) — solução definitiva
  6b. Aguardar virada do mês (quota reseta no dia 1)
```

---

## 19. Critérios de Aceitação

### 19.1 Deploy e Disponibilidade

- [ ] **CA-01:** Push em `main` dispara deploy automático na Vercel sem ação manual.
- [ ] **CA-02:** Deploy de produção concluído em ≤ 8 minutos após merge em `main`.
- [ ] **CA-03:** URL de produção acessível em ≤ 30 segundos após deploy concluído.
- [ ] **CA-04:** Rollback de produção executável em ≤ 1 minuto via Vercel Dashboard.
- [ ] **CA-05:** Preview deployment gerado automaticamente para cada PR em ≤ 3 minutos.

### 19.2 Ambientes

- [ ] **CA-06:** Cada ambiente usa variáveis de ambiente isoladas (prod não contamina dev).
- [ ] **CA-07:** `dev.sgti.empresa.com.br` aponta para branch `develop` corretamente.
- [ ] **CA-08:** `homolog.sgti.empresa.com.br` aponta para branch `staging` corretamente.
- [ ] **CA-09:** Preview deployments usam variáveis do escopo Preview (não produção).

### 19.3 Segurança

- [ ] **CA-10:** HTTPS ativo em todos os ambientes; HTTP redireciona para HTTPS.
- [ ] **CA-11:** HSTS configurado com `max-age=63072000; includeSubDomains`.
- [ ] **CA-12:** `X-Frame-Options: SAMEORIGIN` presente em todas as responses.
- [ ] **CA-13:** `X-Content-Type-Options: nosniff` presente em todas as responses.
- [ ] **CA-14:** CSP configurado e bloqueando recursos de origens não autorizadas.
- [ ] **CA-15:** `SUPABASE_SERVICE_ROLE_KEY` não aparece no bundle JavaScript do browser.

### 19.4 Performance

- [ ] **CA-16:** LCP ≤ 2,5 segundos nas principais páginas em produção.
- [ ] **CA-17:** CLS ≤ 0,1 em todas as páginas.
- [ ] **CA-18:** Assets estáticos com `Cache-Control: immutable` e hash no filename.
- [ ] **CA-19:** Imagens servidas em formato WebP quando suportado pelo browser.
- [ ] **CA-20:** Serverless functions respondendo em ≤ 2 segundos (p95).

### 19.5 Observabilidade e Monitoramento

- [ ] **CA-21:** Vercel Analytics ativo e coletando Core Web Vitals em produção.
- [ ] **CA-22:** UptimeRobot monitorando `/api/health` a cada 5 minutos.
- [ ] **CA-23:** IT_MANAGER recebe alerta se disponibilidade cair abaixo de 99,5%.
- [ ] **CA-24:** Build failures notificam o autor e o IT_MANAGER automaticamente.

### 19.6 Integração

- [ ] **CA-25:** DNS Cloudflare resolvendo corretamente para os domínios da Vercel.
- [ ] **CA-26:** Headers `CF-Connecting-IP` e `CF-Ray` propagados para o backend.
- [ ] **CA-27:** Supabase Realtime conectando diretamente (sem passar pela Vercel).

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação com 19 seções e 27 critérios de aceitação |

---

> **Documentos relacionados:**
> [`70_DEPLOYMENT.md`](./70_DEPLOYMENT.md) — Estratégia geral de deploy e ambientes
> [`71_SUPABASE.md`](./71_SUPABASE.md) — Arquitetura Supabase
> [`72_GITHUB_ACTIONS.md`](./72_GITHUB_ACTIONS.md) — Pipelines CI/CD
> [`50_INTEGRATIONS.md`](./50_INTEGRATIONS.md) — Integrações externas (Google, GLPI, E-mail)
