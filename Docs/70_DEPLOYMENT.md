# SGTI — Sistema de Gestão de Tecnologia da Informação
## Estratégia de Deploy, Versionamento e Ambientes — Documentação Técnica e Arquitetural

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [50_INTEGRATIONS.md](./50_INTEGRATIONS.md) · [22_AUTHENTICATION.md](./22_AUTHENTICATION.md) · [20_DATABASE.md](./20_DATABASE.md)

---

## Sobre este Documento

Este documento define a **estratégia oficial de deploy, versionamento, ambientes e publicação do SGTI**, cobrindo toda a cadeia desde o desenvolvimento local até o ambiente de produção.

**Premissa obrigatória:** Utilizar exclusivamente soluções gratuitas ou free tier sempre que possível, priorizando a stack definida: Next.js · Supabase (Auth + PostgreSQL + Storage) · GitHub · GitHub Actions · Vercel · Cloudflare.

**Escopo:** documentação técnica e arquitetural. Nenhum código, script ou YAML é gerado neste documento.

---

## Stack Oficial

| Componente | Tecnologia | Plano |
|:----------:|:----------:|:-----:|
| **Frontend** | Next.js 14 (App Router) | Free (Vercel Hobby / Pro) |
| **Backend / API** | Next.js API Routes + Supabase | Free tier |
| **Banco de Dados** | PostgreSQL (Supabase) | Free tier (500 MB) |
| **Autenticação** | Supabase Auth | Incluído no Supabase |
| **Storage** | Supabase Storage | Free tier (1 GB) |
| **Versionamento** | GitHub (repositório privado) | Free |
| **CI/CD** | GitHub Actions | Free tier (2.000 min/mês) |
| **Deploy Frontend** | Vercel | Hobby (Free) |
| **DNS e Segurança** | Cloudflare | Free tier |

---

## Sumário

1. [Objetivos](#1-objetivos)
2. [Arquitetura de Deploy](#2-arquitetura-de-deploy)
3. [Ambientes](#3-ambientes)
4. [Estratégia Git](#4-estratégia-git)
5. [Branches](#5-branches)
6. [Pull Requests](#6-pull-requests)
7. [Code Review](#7-code-review)
8. [Releases](#8-releases)
9. [Versionamento](#9-versionamento)
10. [Deploy Frontend](#10-deploy-frontend)
11. [Deploy Backend](#11-deploy-backend)
12. [Deploy Banco de Dados](#12-deploy-banco-de-dados)
13. [Deploy Storage](#13-deploy-storage)
14. [Gestão de Segredos](#14-gestão-de-segredos)
15. [Gestão de Variáveis de Ambiente](#15-gestão-de-variáveis-de-ambiente)
16. [Rollback](#16-rollback)
17. [Monitoramento](#17-monitoramento)
18. [Observabilidade](#18-observabilidade)
19. [Auditoria de Deploy](#19-auditoria-de-deploy)
20. [Segurança no Deploy](#20-segurança-no-deploy)
21. [Regras de Negócio](#21-regras-de-negócio)
22. [Critérios de Aceitação](#22-critérios-de-aceitação)

---

## 1. Objetivos

### 1.1 Objetivo Primário

Garantir que o processo de deploy do SGTI seja seguro, reproduzível, auditável e eficiente — permitindo entregas contínuas de valor com mínimo de risco para o ambiente de produção.

### 1.2 Objetivos Específicos

| # | Objetivo |
|---|----------|
| 1 | Deploy de produção 100% automatizado via CI/CD (zero intervenção manual) |
| 2 | Rollback disponível em menos de 5 minutos para qualquer deploy |
| 3 | Rastreabilidade completa: todo deploy vinculado a PR, autor, testes e aprovações |
| 4 | Separação absoluta de dados entre ambientes (local/dev/homologação/produção) |
| 5 | Nenhum segredo commitado no repositório GitHub |
| 6 | Downtime zero em deploys de produção (zero-downtime deployment) |
| 7 | Custo operacional de infraestrutura: máximo possível em free tier |

---

## 2. Arquitetura de Deploy

### 2.1 Visão Geral do Pipeline

```
PIPELINE DE DEPLOY — VISÃO GERAL

DESENVOLVEDOR
    │ git push / PR aberto
    ▼
GITHUB (Repositório)
    │
    ├── GitHub Actions: Pipeline CI
    │   ├── Lint (ESLint / Prettier)
    │   ├── Testes Unitários (Jest)
    │   ├── Testes de Integração
    │   ├── Build (next build)
    │   ├── Security Scan (npm audit + CodeQL)
    │   └── Coverage Report
    │
    ├── Vercel: Deploy Automático
    │   ├── PR → Deploy Preview (URL única por PR)
    │   ├── main → Deploy Produção
    │   └── staging → Deploy Homologação
    │
    └── Supabase: Migrations
        ├── supabase db push (via CLI no CI)
        └── Rollback via migration reversa
                │
                ▼
         CLOUDFLARE (DNS + WAF + CDN)
                │
                ▼
    USUÁRIO FINAL (Browser)
```

### 2.2 Componentes e Responsabilidades

| Componente | Responsabilidade |
|:----------:|:----------------:|
| **GitHub** | Repositório de código, controle de versão, Pull Requests, proteções de branch |
| **GitHub Actions** | CI (lint, test, build, security scan) e orquestração de deploys |
| **Vercel** | Build e hosting do Next.js; deploy automático por branch; preview deployments |
| **Supabase** | PostgreSQL, Auth, Storage, Edge Functions; migrations de banco |
| **Cloudflare** | DNS autoritativo, CDN, WAF, DDoS protection, HTTPS, rate limiting |

### 2.3 Diagrama de Fluxo por Branch

```
Feature Branch → PR aberto → CI roda → Preview Deploy (Vercel)
       │
       ▼
   Aprovação (code review) → Merge para develop
       │
       ▼
   develop → Deploy automático em Desenvolvimento (Vercel)
       │
       ▼
   PR develop → staging → Aprovação + CI → Merge
       │
       ▼
   staging → Deploy automático em Homologação (Vercel)
       │
       ▼
   PR staging → main → Aprovação + CI → Merge
       │
       ▼
   main → Deploy automático em Produção (Vercel) + Migrations Supabase
```

---

## 3. Ambientes

### 3.1 Tabela Comparativa de Ambientes

| Característica | Local | Desenvolvimento | Homologação | Produção |
|:--------------:|:-----:|:---------------:|:-----------:|:--------:|
| **Branch** | Feature branches | `develop` | `staging` | `main` |
| **URL** | localhost:3000 | dev.sgti.empresa.com.br | homolog.sgti.empresa.com.br | sgti.empresa.com.br |
| **Banco** | Local Docker ou Supabase free project | Supabase project DEV | Supabase project HML | Supabase project PROD |
| **Dados** | Dados de desenvolvimento (fictícios) | Dados de testes | Cópia anonimizada de prod | Dados reais |
| **Cloudflare** | Não | Não | Sim (proxy) | Sim (proxy + WAF) |
| **Deploys** | Manual (npm run dev) | Automático por push | Automático por push em staging | Automático por push em main |
| **Migrações** | Manual (supabase db push) | Automático no CI | Automático no CI | Automático no CI (com aprovação) |
| **Segredos** | .env.local (git-ignored) | Vercel Environment Variables | Vercel Environment Variables | Vercel Environment Variables |

---

### 3.2 Ambiente Local

**Objetivo:** Desenvolvimento individual de funcionalidades com ciclo de feedback rápido.

**Configuração:**
- Next.js em modo `development` (`npm run dev`) com hot-reload.
- Supabase: opção A — Supabase CLI com Docker local (`supabase start`); opção B — projeto Supabase free tier dedicado ao desenvolvedor.
- Banco: instância PostgreSQL local (Docker) ou Supabase project pessoal.
- Variáveis: arquivo `.env.local` (nunca commitado; protegido por `.gitignore`).

**Regras:**
- Nenhum developer acessa dados do ambiente de produção pela máquina local.
- Seeds de dados de teste disponíveis para popular o banco local.
- Migrations devem ser testadas localmente antes do push.

---

### 3.3 Ambiente de Desenvolvimento

**Objetivo:** Integração contínua do trabalho de múltiplos desenvolvedores. Testes de integração automatizados.

**Configuração:**
- Branch: `develop`.
- Deploy automático na Vercel ao fazer merge para `develop`.
- URL: `dev.sgti.empresa.com.br` (subdomínio configurado na Cloudflare).
- Banco: projeto Supabase dedicado ao ambiente DEV (separado do prod).
- Dados: dados fictícios / seeds controlados.

**Acesso:**
- Restrito a membros da equipe de desenvolvimento.
- Autenticação: Google OAuth com domínio corporativo (mesmo mecanismo do prod).

---

### 3.4 Ambiente de Homologação (Staging)

**Objetivo:** Validação funcional por QA e stakeholders antes do deploy em produção. Ambiente o mais próximo possível de produção.

**Configuração:**
- Branch: `staging`.
- Deploy automático na Vercel ao fazer merge para `staging`.
- URL: `homolog.sgti.empresa.com.br`.
- Banco: projeto Supabase dedicado ao HML.
- Dados: cópia anonimizada de dados de produção (executada manualmente pelo IT_MANAGER com script de anonimização). Dados pessoais substituídos por dados fictícios (conformidade LGPD).
- Cloudflare: DNS configurado; WAF em modo OBSERVE (não bloqueia, apenas registra).

**Processo de aprovação para homologação:**
- QA valida o ambiente.
- IT_MANAGER assina o aceite formal.
- Aceite registrado como comentário no PR `staging → main`.

---

### 3.5 Ambiente de Produção

**Objetivo:** Ambiente de operação real com usuários finais.

**Configuração:**
- Branch: `main` (protegida).
- Deploy automático na Vercel ao fazer merge para `main` após pipeline CI completo.
- URL: `sgti.empresa.com.br`.
- Banco: projeto Supabase PROD (dados reais; backups automáticos configurados).
- Cloudflare: DNS + CDN + WAF ativo em modo BLOCK + HTTPS obrigatório + HSTS.
- Monitoramento: health checks a cada 30 segundos.

**Regras adicionais:**
- Deploys diretos para `main` (sem PR) são bloqueados pelo GitHub.
- Migrações de banco em produção requerem aprovação explícita do IT_MANAGER.
- Rollback disponível em menos de 5 minutos via Vercel instant rollback.

---

## 4. Estratégia Git

### 4.1 Modelo de Branching

O SGTI adota o modelo **GitHub Flow adaptado**, com camadas de validação antes da produção:

```
main (produção)
  │
  ├── staging (homologação)
  │     │
  │     └── develop (integração)
  │           │
  │           ├── feature/nome-da-funcionalidade
  │           ├── fix/nome-do-bug
  │           ├── hotfix/correccao-urgente
  │           └── chore/nome-da-tarefa
```

### 4.2 Princípios da Estratégia Git

| Princípio | Descrição |
|:---------:|-----------|
| **Trunk-based com camadas** | Desenvolvimento orientado para integração frequente em `develop` |
| **Branches de vida curta** | Feature branches devem existir por no máximo 5 dias úteis |
| **Squash merge** | Todos os merges para `develop`, `staging` e `main` usam squash para manter histórico limpo |
| **Commits semânticos** | Todos os commits seguem Conventional Commits (`feat:`, `fix:`, `chore:`, etc.) |
| **Tags para releases** | Toda versão em produção tem tag Git correspondente (`v1.2.3`) |

---

## 5. Branches

### 5.1 Branches Permanentes

| Branch | Propósito | Proteção |
|:------:|-----------|:--------:|
| `main` | Código de produção; reflete o que está no ar | PR obrigatório; 2 aprovações; CI verde; no force push; no direct push |
| `staging` | Pré-produção para validação por QA e stakeholders | PR obrigatório; 1 aprovação; CI verde |
| `develop` | Integração contínua de features em desenvolvimento | PR obrigatório; 1 aprovação; CI verde |

### 5.2 Branches Temporárias

| Prefixo | Uso | Origem | Destino |
|:-------:|-----|:------:|:-------:|
| `feature/` | Nova funcionalidade | `develop` | `develop` |
| `fix/` | Correção de bug identificado | `develop` | `develop` |
| `hotfix/` | Correção urgente em produção | `main` | `main` + `develop` |
| `chore/` | Tarefas de manutenção (deps, config) | `develop` | `develop` |
| `docs/` | Documentação apenas | `develop` | `develop` |
| `refactor/` | Refatoração sem mudança de comportamento | `develop` | `develop` |

### 5.3 Convenção de Nomenclatura

```
Formato: {prefixo}/{número-issue}-{descricao-kebab-case}

Exemplos:
  feature/42-incident-creation-email-notification
  fix/87-sla-calculation-pause-not-applied
  hotfix/production-login-500-error
  chore/update-supabase-js-to-v2
  docs/add-deployment-guide
```

### 5.4 Proteções de Branch

**Regras aplicadas na branch `main`:**
- Require a pull request before merging.
- Require approvals: 2 (mínimo).
- Dismiss stale pull request approvals when new commits are pushed.
- Require status checks to pass: `ci/lint`, `ci/test`, `ci/build`, `ci/security`.
- Require branches to be up to date before merging.
- Restrict who can push: apenas CODEOWNERS designados.
- Do not allow force pushes.
- Do not allow deletions.

---

## 6. Pull Requests

### 6.1 Template de PR

Todo PR deve preencher o template obrigatório:

```
## Descrição
Breve descrição do que foi implementado ou corrigido.

## Tipo de Mudança
- [ ] Nova funcionalidade (feature)
- [ ] Correção de bug (fix)
- [ ] Hotfix de produção
- [ ] Refatoração (sem mudança de comportamento)
- [ ] Documentação
- [ ] Manutenção (deps, config)

## Issue Relacionada
Closes #NÚMERO_DA_ISSUE

## Checklist
- [ ] Código segue os padrões do projeto (lint passa)
- [ ] Testes foram adicionados ou atualizados
- [ ] Migrations de banco foram testadas localmente
- [ ] Documentação atualizada (se necessário)
- [ ] Variáveis de ambiente novas adicionadas ao .env.example
- [ ] Sem segredos ou credenciais no código

## Screenshots (se aplicável)
Cole aqui screenshots das mudanças visuais.

## Como Testar
Descreva os passos para testar manualmente a mudança.

## Impacto em Produção
Descreva qualquer impacto esperado: migrações, zero-downtime, etc.
```

### 6.2 Labels de PR

| Label | Uso |
|:-----:|-----|
| `feature` | Nova funcionalidade |
| `bug` | Correção de bug |
| `hotfix` | Correção urgente |
| `breaking-change` | Mudança que quebra compatibilidade |
| `migration` | Inclui migration de banco |
| `security` | Relacionado a segurança |
| `dependencies` | Atualização de dependências |
| `do-not-merge` | PR em draft ou com bloqueio explícito |
| `needs-review` | Aguardando revisão |
| `approved` | Aprovado e pronto para merge |

### 6.3 Tamanho de PR

| Tamanho | Linhas Alteradas | Expectativa |
|:-------:|:----------------:|:-----------:|
| **XS** | ≤ 50 | Revisão em 30 min |
| **S** | 51–200 | Revisão em 1h |
| **M** | 201–500 | Revisão em 2h |
| **L** | 501–1000 | Revisão no mesmo dia |
| **XL** | > 1000 | Considerar dividir em PRs menores |

PRs com > 1000 linhas devem ser justificados. O autor é orientado a dividir em PRs menores quando possível.

---

## 7. Code Review

### 7.1 Responsabilidades do Reviewer

| Responsabilidade | Descrição |
|:----------------:|-----------|
| **Correção** | O código faz o que diz que faz? Existem bugs óbvios? |
| **Segurança** | Existem vulnerabilidades? Dados sensíveis expostos? |
| **Migrations** | Migrations são reversíveis? Impacto em dados existentes? |
| **Performance** | Existem queries N+1? Loops desnecessários? |
| **Padrões** | Segue os padrões definidos no projeto? |
| **Testes** | Os testes cobrem os casos críticos? |
| **Documentação** | Funções complexas têm comentários? Docs atualizadas? |

### 7.2 Regras de Code Review

- Reviewer não pode aprovar PR de sua própria autoria.
- Feedback deve ser construtivo e específico (não apenas "ruim").
- Aprovação implica co-responsabilidade pelo código em produção.
- Comments bloqueantes (`BLOCKER`) devem ser resolvidos antes do merge.
- Comments sugestivos (`SUGGESTION`) podem ser resolvidos após o merge.
- Prazo para primeira revisão: 24 horas após PR aberto.

### 7.3 CODEOWNERS

O arquivo `CODEOWNERS` no repositório define revisores obrigatórios por área:

| Caminho | Reviewer Obrigatório |
|:-------:|:--------------------:|
| `*` | IT_MANAGER (conta GitHub) |
| `supabase/migrations/` | IT_MANAGER + SUPER_ADMIN |
| `.github/workflows/` | IT_MANAGER |
| `src/app/api/` | Desenvolvedor Senior |
| `src/lib/auth/` | IT_MANAGER |

---

## 8. Releases

### 8.1 Ciclo de Release

```
CICLO DE RELEASE

1. Sprint Planning: funcionalidades para a versão definidas
2. Desenvolvimento: features em branches → develop
3. Feature Freeze: branch staging criada/atualizada de develop
4. QA em Homologação: testes manuais e automatizados
5. Aceite do IT_MANAGER: aprovação formal documentada no PR
6. Release Tag: tag `v{major}.{minor}.{patch}` criada em staging
7. Merge para main: PR aprovado com 2 revisores
8. Deploy de produção: automático pelo Vercel pós-merge
9. Smoke Tests: verificação pós-deploy em produção
10. Comunicado: changelog enviado para os usuários
```

### 8.2 Changelog

Todo release inclui um changelog gerado automaticamente baseado nos commits semânticos, organizado por:

| Seção | Prefixo de Commit |
|:-----:|:-----------------:|
| 🚀 Novas Funcionalidades | `feat:` |
| 🐛 Correções de Bug | `fix:` |
| ⚡ Performance | `perf:` |
| 🔒 Segurança | `security:` |
| 🗃️ Banco de Dados | commits com `migration` label |
| 🔧 Manutenção | `chore:`, `refactor:` |
| 📚 Documentação | `docs:` |

### 8.3 Comunicado de Release

Ao publicar nova versão em produção:
- **Canal:** E-mail para todos os usuários ACTIVE do tenant + notificação in-app.
- **Conteúdo:** Versão, data, resumo das principais mudanças, link para changelog completo.
- **Responsável:** IT_MANAGER.

---

## 9. Versionamento

### 9.1 Semantic Versioning (SemVer)

O SGTI adota **Semantic Versioning 2.0.0**: `MAJOR.MINOR.PATCH`

| Tipo | Quando Incrementar | Exemplo |
|:----:|:------------------:|:-------:|
| **MAJOR** | Mudança que quebra compatibilidade; reestruturação do banco; mudança de API externa | `1.0.0 → 2.0.0` |
| **MINOR** | Nova funcionalidade retrocompatível; novo módulo; novos endpoints | `1.0.0 → 1.1.0` |
| **PATCH** | Correção de bug; ajuste de texto; melhoria de performance sem nova feature | `1.0.0 → 1.0.1` |

### 9.2 Versão de Pré-Release

| Sufixo | Uso |
|:------:|-----|
| `v1.2.0-alpha.1` | Funcionalidade em desenvolvimento; não estável |
| `v1.2.0-beta.1` | Funcionalidade completa; em testes |
| `v1.2.0-rc.1` | Release Candidate; aguardando validação final |
| `v1.2.0` | Versão estável publicada em produção |

### 9.3 Git Tags

Toda versão de produção recebe tag Git:

```
Formato: v{MAJOR}.{MINOR}.{PATCH}
Exemplos: v1.0.0, v1.2.3, v2.0.0

Tag anotada com:
  - Data do release
  - Autor do release
  - Resumo das mudanças
  - SHA do commit
```

Tags são imutáveis após criação. Para corrigir uma tag, cria-se nova versão PATCH.

### 9.4 Versão Exibida no Sistema

A versão atual do SGTI é exibida no rodapé de todos os dashboards e relatórios, conforme configurado em variável de ambiente `NEXT_PUBLIC_APP_VERSION`.

---

## 10. Deploy Frontend

### 10.1 Plataforma: Vercel

O frontend Next.js é deployado exclusivamente pela Vercel, que detecta automaticamente projetos Next.js e configura o build.

### 10.2 Projetos Vercel por Ambiente

| Ambiente | Projeto Vercel | Branch | URL |
|:--------:|:--------------:|:------:|:---:|
| Desenvolvimento | `sgti-dev` | `develop` | `dev.sgti.empresa.com.br` |
| Homologação | `sgti-staging` | `staging` | `homolog.sgti.empresa.com.br` |
| Produção | `sgti-prod` | `main` | `sgti.empresa.com.br` |
| Preview | `sgti-prod` (preview) | Qualquer PR | `sgti-{hash}-{org}.vercel.app` |

### 10.3 Pipeline de Build no Vercel

```
PIPELINE DE BUILD VERCEL

1. Detecção de push/PR no GitHub (webhook Vercel ↔ GitHub)
2. Clone do repositório na versão do commit
3. Instalação de dependências: npm ci (usando package-lock.json)
4. Build: next build
   → Gera bundle estático + Server Components
   → Otimização de imagens
   → Geração de sitemap (se configurado)
5. Deploy das funções serverless (API Routes)
6. Atribuição de URL (produção ou preview)
7. Invalidação de cache CDN da Vercel
8. Notificação ao GitHub (deployment status)
9. Comentário automático no PR com URL do preview
```

### 10.4 Preview Deployments

Todo Pull Request recebe automaticamente um ambiente de preview:
- URL única: `sgti-{branch-hash}.vercel.app`
- Banco: aponta para o projeto Supabase de desenvolvimento (mesmo do ambiente dev).
- Expiração: 7 dias após o PR ser fechado/mergeado.
- Uso: revisão visual por QA e stakeholders antes de aprovar o PR.

### 10.5 Configuração de Domínio

- Domínios personalizados configurados no painel Vercel.
- DNS gerenciado pelo Cloudflare com registros CNAME apontando para Vercel.
- HTTPS automático via Vercel (Let's Encrypt) + Cloudflare (proxy ativo).
- HSTS configurado no Cloudflare: `max-age=31536000; includeSubDomains`.

### 10.6 Headers de Segurança (Vercel)

Configurados via `next.config.js` e complementados pelo Cloudflare:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; ...
```

---

## 11. Deploy Backend

### 11.1 Arquitetura Backend no SGTI

O SGTI usa **Next.js API Routes** como camada de API, deployada junto com o frontend na Vercel como **Serverless Functions**. Não existe servidor backend separado.

```
ARQUITETURA BACKEND

Browser → Cloudflare → Vercel Edge → Next.js API Routes (Serverless)
                                              │
                                              ▼
                                        Supabase Client
                                   (PostgreSQL + Auth + Storage)
```

### 11.2 Serverless Functions na Vercel

| Característica | Vercel Hobby (Free) | Vercel Pro |
|:--------------:|:-------------------:|:----------:|
| Máx. execução | 10 segundos | 60 segundos |
| Memória | 1024 MB | 3008 MB |
| Regiões | 1 (selecionada) | Edge Network |
| Funções simultâneas | Ilimitado (com limites de rate) | Ilimitado |

**Região recomendada:** `gru1` (São Paulo) para menor latência aos usuários brasileiros.

### 11.3 Edge Functions do Supabase

Funcionalidades que requerem processamento próximo ao banco (jobs periódicos, webhooks internos) são implementadas como **Supabase Edge Functions** (Deno):

| Função | Gatilho | Descrição |
|:------:|:-------:|-----------|
| `sla-monitor` | Cron (5 min) | Verifica SLAs e publica eventos |
| `send-notification` | Webhook | Envia notificações por e-mail |
| `gmail-webhook` | HTTP POST | Processa e-mails recebidos |

### 11.4 Deploy de Edge Functions

Edge Functions do Supabase são deployadas via Supabase CLI no pipeline de CI/CD:

```
DEPLOY DE EDGE FUNCTIONS (via GitHub Actions)

1. Detecta mudanças em supabase/functions/
2. Autentica na Supabase CLI com SUPABASE_ACCESS_TOKEN
3. supabase functions deploy {nome-da-função} --project-ref {ref}
4. Verifica status do deploy
5. Registra no audit_log de deploys
```

---

## 12. Deploy Banco de Dados

### 12.1 Migrations com Supabase CLI

Todas as mudanças de esquema do banco são gerenciadas via **migrations versionadas** com a Supabase CLI:

```
CONVENÇÃO DE MIGRATIONS

Formato do arquivo: {timestamp}_{descricao_snake_case}.sql
Exemplo: 20260609142300_add_sla_breach_reason_to_tickets.sql

Localização: /supabase/migrations/

Regras:
- Uma migration por mudança lógica
- Migrations são cumulativas e ordenadas por timestamp
- Nunca editar migration já aplicada em qualquer ambiente
- Todo ALTER TABLE deve considerar dados existentes
- DROP de coluna: sempre em migration separada, após confirmar que nenhum código a usa
```

### 12.2 Processo de Migration por Ambiente

| Ambiente | Quando é Aplicada | Aprovação |
|:--------:|:-----------------:|:---------:|
| Local | Manual: `supabase db push` | Desenvolvedor |
| Desenvolvimento | Automático no CI ao fazer merge em `develop` | CI aprovado |
| Homologação | Automático no CI ao fazer merge em `staging` | CI aprovado |
| Produção | Automático no CI ao fazer merge em `main` | CI aprovado + aprovação manual do IT_MANAGER |

### 12.3 Backups do Banco de Dados

| Backup | Frequência | Retenção | Responsável |
|:------:|:----------:|:--------:|:-----------:|
| **Automático Supabase** | Diário | 7 dias (free tier) | Supabase |
| **Backup antes de migration grande** | Antes de cada major migration | 30 dias | CI/CD + IT_MANAGER |
| **Export manual mensal** | Primeiro dia útil do mês | 12 meses | IT_MANAGER |

### 12.4 Migrations de Alto Risco

Migrations que alteram tabelas críticas (audit_log, auth.User, ticket.Ticket) ou executam operações destrutivas (DROP, truncate, remover colunas usadas) requerem:

1. IT_MANAGER aprova a migration explicitamente no PR.
2. Backup manual realizado antes da aplicação em produção.
3. Janela de manutenção comunicada com 24h de antecedência.
4. Script de rollback testado e documentado no PR.

### 12.5 Seed de Dados por Ambiente

| Ambiente | Seed | Conteúdo |
|:--------:|:----:|---------|
| Local | Obrigatório | Dados fictícios: usuários, chamados, ativos, etc. |
| Desenvolvimento | Automático no CI | Dados mínimos para testes de integração |
| Homologação | Manual (sob demanda) | Cópia anonimizada de dados de produção |
| Produção | Apenas dados iniciais do sistema | Categorias, normas padrão, catálogo base |

---

## 13. Deploy Storage

### 13.1 Supabase Storage por Ambiente

Cada ambiente possui seu próprio projeto Supabase com Storage isolado:

| Ambiente | Projeto Supabase | Bucket | Dados |
|:--------:|:----------------:|:------:|:-----:|
| Local | Personal project | Idênticos ao dev | Arquivos de teste |
| Desenvolvimento | supabase-sgti-dev | evidences, attachments, invoices, articles | Arquivos de teste |
| Homologação | supabase-sgti-hml | evidences, attachments, invoices, articles | Cópia anonimizada |
| Produção | supabase-sgti-prod | evidences, attachments, invoices, articles | Dados reais |

### 13.2 Buckets e Políticas por Ambiente

As políticas de Storage (RLS) são migradas junto com as migrations de banco. Não há configuração manual de buckets — tudo é gerenciado via migrations:

```
Migration cria bucket:
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('evidences', 'evidences', false, 52428800, ...);

Migration define política RLS:
  CREATE POLICY "evidence_access" ON storage.objects
  FOR SELECT USING (bucket_id = 'evidences' AND auth.uid()::text IN (...));
```

### 13.3 Migração de Arquivos entre Ambientes

Arquivos de Storage **não são migrados automaticamente** entre ambientes. Para homologação com dados reais:
1. Export seletivo de arquivos não-sensíveis de produção.
2. Substituição de arquivos com dados pessoais por placeholders.
3. Import manual para o bucket do ambiente de homologação.

---

## 14. Gestão de Segredos

### 14.1 Princípio Fundamental

> **Nenhum segredo, credencial, chave de API ou senha é commitado no repositório GitHub, em nenhuma branch, em nenhum momento.**

### 14.2 Onde Cada Segredo É Armazenado

| Segredo | Ambiente Local | Desenvolvimento | Homologação | Produção |
|:-------:|:--------------:|:---------------:|:-----------:|:--------:|
| `SUPABASE_URL` | `.env.local` | Vercel Env | Vercel Env | Vercel Env |
| `SUPABASE_ANON_KEY` | `.env.local` | Vercel Env | Vercel Env | Vercel Env |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` (cuidado) | Vercel Secret | Vercel Secret | Vercel Secret |
| `GOOGLE_CLIENT_ID` | `.env.local` | Vercel Env | Vercel Env | Vercel Env |
| `GOOGLE_CLIENT_SECRET` | `.env.local` | Vercel Secret | Vercel Secret | Vercel Secret |
| `GOOGLE_SA_KEY_JSON` | `.env.local` | Vercel Secret | Vercel Secret | Vercel Secret |
| `JWT_PRIVATE_KEY_RS256` | `.env.local` | Vercel Secret | Vercel Secret | Vercel Secret |
| `JWT_PUBLIC_KEY_RS256` | `.env.local` | Vercel Env | Vercel Env | Vercel Env |
| `GLPI_APP_TOKEN` | `.env.local` | Vercel Secret | Vercel Secret | Vercel Secret |
| `GLPI_API_URL` | `.env.local` | Vercel Env | Vercel Env | Vercel Env |
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` | Vercel Env (public) | Vercel Env (public) | Vercel Env (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` | Vercel Env (public) | Vercel Env (public) | Vercel Env (public) |

### 14.3 Distinção entre Env e Secret no Vercel

| Tipo Vercel | Visibilidade | Uso |
|:-----------:|:------------:|-----|
| **Environment Variable** | Visível no painel Vercel (mascarada) | Valores não-sensíveis: URLs, IDs de cliente |
| **Secret (Encrypted)** | Nunca visível após salvar | Chaves privadas, tokens, senhas |

### 14.4 Detecção de Segredos no Repositório

O pipeline de CI inclui scan automático de segredos:
- **gitleaks** (ou equivalente): varre commits em busca de padrões de credenciais.
- Bloqueio do pipeline se segredo for detectado.
- Scan executado em todo push e PR.
- Configuração de regras customizadas para padrões específicos do SGTI.

### 14.5 Rotação de Segredos

| Segredo | Frequência de Rotação |
|:-------:|:---------------------:|
| JWT Private/Public Key | Semestral |
| Google Client Secret | Anual |
| Google Service Account Key | Semestral |
| Supabase Service Role Key | Anual |
| GLPI App Token | Anual |

---

## 15. Gestão de Variáveis de Ambiente

### 15.1 Categorias de Variáveis

| Prefixo | Categoria | Visibilidade | Exemplo |
|:-------:|:---------:|:------------:|---------|
| `NEXT_PUBLIC_` | Exposta ao browser (bundle client-side) | Pública | `NEXT_PUBLIC_SUPABASE_URL` |
| Sem prefixo | Server-side apenas (API Routes, Edge Functions) | Servidor | `SUPABASE_SERVICE_ROLE_KEY` |

### 15.2 Arquivo .env.example

O repositório mantém um `.env.example` com todas as variáveis necessárias, **sem valores reais**, documentando o propósito de cada uma:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (anon key do projeto)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (NÃO expor ao browser)

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...

# JWT
JWT_PRIVATE_KEY_RS256=-----BEGIN RSA PRIVATE KEY-----...
JWT_PUBLIC_KEY_RS256=-----BEGIN PUBLIC KEY-----...

# GLPI
GLPI_API_URL=https://glpi.empresa.com.br/apirest.php
GLPI_APP_TOKEN=...

# App
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_ENV=development
```

### 15.3 Sincronização de Variáveis entre Ambientes

Ao adicionar nova variável:
1. Adicionar ao `.env.example` com comentário explicativo.
2. Adicionar ao `.env.local` de cada desenvolvedor (comunicado via README ou Slack).
3. Adicionar no painel Vercel para cada ambiente (dev, staging, prod) via interface ou Vercel CLI.
4. Documentar se a variável é obrigatória ou opcional.

### 15.4 Variáveis Específicas por Ambiente

Algumas variáveis têm valores diferentes por ambiente e são configuradas no Vercel com escopo de ambiente:

| Variável | Desenvolvimento | Homologação | Produção |
|:--------:|:---------------:|:-----------:|:--------:|
| `NEXT_PUBLIC_APP_ENV` | `development` | `staging` | `production` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto dev | URL do projeto hml | URL do projeto prod |
| `NEXT_PUBLIC_APP_VERSION` | `{versão}-dev` | `{versão}-rc` | `{versão}` |

---

## 16. Rollback

### 16.1 Estratégias de Rollback por Componente

| Componente | Estratégia | Tempo Estimado |
|:----------:|:----------:|:--------------:|
| **Frontend (Vercel)** | Instant Rollback via painel Vercel ou CLI | < 1 minuto |
| **API Routes (Vercel)** | Incluso no Instant Rollback do frontend | < 1 minuto |
| **Edge Functions (Supabase)** | Re-deploy da versão anterior via CLI | 2–3 minutos |
| **Migrations de banco** | Migration de rollback (script reverso) | 5–30 minutos |
| **Configurações de Storage** | Rollback das políticas via migration reversa | 5–10 minutos |

### 16.2 Rollback de Frontend (Vercel Instant Rollback)

A Vercel mantém histórico de todos os deploys. O rollback é instantâneo:

```
PROCESSO DE ROLLBACK FRONTEND

1. IT_MANAGER detecta problema em produção
2. Acessa painel Vercel → Deployments
3. Seleciona o deploy estável anterior
4. Clica em "Promote to Production"
   OU
   Executa: vercel rollback {deployment-url}
5. Tráfego redirecionado em segundos
6. Registra incidente: quem executou, quando, motivo
```

### 16.3 Rollback de Migration de Banco

Migrations de banco são o rollback mais complexo. Todo PR que inclui migration deve ter o rollback documentado:

```
PROCESSO DE ROLLBACK DE MIGRATION

PRÉ-CONDIÇÃO: Script de rollback testado e aprovado no PR

1. Criar nova migration com as operações inversas:
   - ADD COLUMN → DROP COLUMN
   - CREATE TABLE → DROP TABLE
   - ALTER COLUMN → ALTER COLUMN (reverso)
   
2. Testar o rollback em homologação

3. Aplicar em produção via:
   supabase db push --db-url {PROD_DB_URL}

4. Fazer rollback do frontend simultaneamente (se necessário)

NOTA: Rollback de DROP TABLE/COLUMN não é possível sem backup.
      Por isso, estas operações requerem backup obrigatório antes.
```

### 16.4 Runbook de Rollback de Emergência

Para situações críticas em produção:

```
RUNBOOK DE EMERGÊNCIA

T+0: Problema identificado em produção
T+1 min: IT_MANAGER notificado; avaliação inicial
T+2 min: Decisão: rollback ou hotfix?
T+3 min (rollback): Vercel Instant Rollback executado
T+5 min: Verificação de que o problema foi resolvido
T+10 min: Incidente aberto no SGTI com timeline
T+24h: Post-mortem documentado com causa raiz e ações preventivas
```

---

## 17. Monitoramento

### 17.1 Camadas de Monitoramento

| Camada | Ferramenta | Métricas |
|:------:|:----------:|:--------:|
| **Infraestrutura (Vercel)** | Vercel Analytics | Tempo de resposta, Error rate, Edge latency |
| **Infraestrutura (Supabase)** | Supabase Dashboard | DB queries, Storage usage, Auth events |
| **DNS / Availability (Cloudflare)** | Cloudflare Analytics | Requests, Bandwidth, Threats blocked |
| **Uptime externo** | UptimeRobot (Free) ou Cloudflare Health Checks | Disponibilidade do endpoint `/health` |
| **Erros de aplicação** | Vercel Runtime Logs | 5xx errors, timeouts |

### 17.2 Health Check Endpoints

O SGTI expõe endpoints de saúde para monitoramento externo:

| Endpoint | Frequência de Check | O que Verifica |
|:--------:|:-------------------:|:--------------:|
| `GET /api/health` | A cada 30 segundos | Status geral: ok/degraded/down |
| `GET /api/health/db` | A cada 1 minuto | Conectividade Supabase |
| `GET /api/health/auth` | A cada 5 minutos | Supabase Auth disponível |
| `GET /api/health/storage` | A cada 5 minutos | Supabase Storage disponível |

**Formato de resposta padrão:**
```json
{
  "status": "ok",
  "timestamp": "2026-06-09T14:00:00Z",
  "version": "1.2.3",
  "services": {
    "database": { "status": "ok", "latency_ms": 12 },
    "auth": { "status": "ok" },
    "storage": { "status": "ok" }
  }
}
```

### 17.3 Alertas de Monitoramento

| Condição | Alerta | Destinatário |
|:--------:|:------:|:------------:|
| Endpoint `/health` fora do ar por > 1 min | E-mail urgente + SMS (se configurado) | IT_MANAGER |
| Error rate > 1% em 5 min | E-mail | IT_MANAGER |
| Latência p95 > 2 segundos por 5 min | E-mail | IT_MANAGER |
| Banco de dados fora do ar | E-mail urgente | IT_MANAGER |
| Deploy falhou em produção | E-mail | IT_MANAGER + Desenvolvedor |
| Quota Supabase > 80% | E-mail | IT_MANAGER + FINANCIAL_ANALYST |

---

## 18. Observabilidade

### 18.1 Os Três Pilares

| Pilar | Implementação | Armazenamento |
|:-----:|:-------------:|:-------------:|
| **Logs** | `console.log` estruturado em JSON; Vercel Runtime Logs | Vercel (30 dias) |
| **Métricas** | Vercel Analytics + Supabase Dashboard | Vercel / Supabase |
| **Traces** | Correlation IDs propagados em cada request | Logs estruturados |

### 18.2 Logs Estruturados

Todos os logs de aplicação seguem formato JSON:

```json
{
  "timestamp": "2026-06-09T14:00:00.123Z",
  "level": "info",
  "service": "sgti",
  "version": "1.2.3",
  "env": "production",
  "correlation_id": "uuid",
  "user_id": "uuid",
  "tenant_id": "uuid",
  "module": "IncidentModule",
  "action": "incident.created",
  "duration_ms": 45,
  "message": "Incident INC-2026-000042 created"
}
```

### 18.3 Correlation ID

Cada request ao SGTI recebe um `correlation_id` UUID, propagado:
- Como header `X-Correlation-ID` em todas as respostas.
- Em todos os logs do servidor.
- No `audit_log` do banco.
- Em notificações de erro enviadas ao IT_MANAGER.

### 18.4 Alertas de Observabilidade (Vercel)

O Vercel oferece alertas nativos para:
- Build failures.
- Runtime errors (uncaught exceptions).
- Function timeouts.
- Deployment status changes.

---

## 19. Auditoria de Deploy

### 19.1 O que é Auditado em Cada Deploy

| Evento | Registrado em | Dados Capturados |
|:------:|:-------------:|:----------------:|
| Deploy iniciado | Vercel Deployment Log | Autor, branch, commit SHA, timestamp |
| CI passou | GitHub Actions Log | Testes, lint, build status |
| PR aprovado | GitHub PR | Reviewers, aprovadores, timestamp |
| Migration executada | `shared.audit_log` SGTI | Migration name, applied_at, applied_by (CI) |
| Rollback executado | `shared.audit_log` SGTI | Versão anterior, versão nova, executado_por, motivo |
| Deploy de Edge Function | Supabase Dashboard | Function name, version, deployed_at |

### 19.2 Rastreabilidade Completa de Deploy

Para qualquer versão em produção, é possível rastrear:

```
Versão v1.2.3 em produção:
  ← Tag Git v1.2.3 (SHA: abc123)
  ← PR #89: "feat: Adicionar notificação de SLA próximo"
     ← Aprovado por: dev1@empresa.com.br, dev2@empresa.com.br
     ← CI passou: lint ✅ test ✅ build ✅ security ✅
     ← Commits incluídos: feat: ..., fix: ..., chore: ...
     ← Migration: 20260609_add_sla_near_breach_field.sql
  ← Deployed at: 2026-06-09T15:30:00Z
  ← Deployment ID: dpl_xyz789 (Vercel)
```

---

## 20. Segurança no Deploy

### 20.1 Segurança do Pipeline CI/CD

| Controle | Implementação |
|:--------:|:-------------:|
| **Sem secrets em logs** | GitHub Actions mascara valores de secrets automaticamente |
| **Fork PRs sem secrets** | PRs de forks não recebem acesso aos secrets de produção |
| **OIDC para Vercel** | Vercel usa OIDC com GitHub para autenticação sem tokens de longa duração |
| **Dependency scan** | `npm audit` e Dependabot alertam vulnerabilidades |
| **SAST** | CodeQL analisa o código em busca de vulnerabilidades |
| **Secret scanning** | gitleaks varre commits em busca de credenciais |

### 20.2 Proteção da Branch Main

- Force push bloqueado.
- Require linear history.
- Require signed commits (opcional; recomendado para IT_MANAGER).
- 2 aprovações obrigatórias.
- CI obrigatório passar.
- Branch atualizada com main antes do merge.

### 20.3 Segurança do Ambiente de Produção

| Camada | Controle |
|:------:|:--------:|
| **DNS** | Cloudflare como proxy (oculta IP de origem da Vercel) |
| **WAF** | Cloudflare WAF com OWASP CRS em modo BLOCK |
| **Rate Limiting** | Cloudflare: 100 req/min por IP em endpoints de auth |
| **TLS** | TLS 1.3 mínimo; HSTS com max-age=31536000 |
| **Headers** | CSP, X-Frame-Options, X-Content-Type-Options via next.config.js |
| **CORS** | Configurado para aceitar apenas origens dos domínios SGTI |
| **RLS** | Row Level Security no Supabase garante isolamento por tenant |

### 20.4 Auditoria de Acesso ao Painel Vercel

- Acesso ao painel Vercel restrito a membros da equipe (SSO com GitHub).
- Toda operação de deploy/rollback no painel é registrada no audit log da Vercel.
- Notificação por e-mail ao IT_MANAGER a cada deploy de produção.

---

## 21. Regras de Negócio

---

**DEP-001** — Nenhum código é deployado em produção sem passar pelo pipeline CI completo
O merge para a branch `main` é bloqueado pelo GitHub se qualquer step do pipeline CI (lint, test, build, security) não tiver passado. Esta proteção é inviolável.

---

**DEP-002** — Nenhum deploy direto para main sem Pull Request
A branch `main` possui proteção de "Require a pull request before merging". Push direto para `main` por qualquer usuário é bloqueado, incluindo o SUPER_ADMIN.

---

**DEP-003** — Nenhum segredo commitado no repositório
O pipeline CI executa scan de segredos (gitleaks) em todo push e PR. A detecção de segredo bloqueia o pipeline e notifica o IT_MANAGER.

---

**DEP-004** — Dois aprovadores obrigatórios para merge em main
PRs para `main` requerem aprovação de 2 reviewers distintos. O autor do PR não pode ser um dos aprovadores. Esta regra é configurada no GitHub e não pode ser contornada.

---

**DEP-005** — Rollback de frontend disponível em menos de 1 minuto via Vercel
A estratégia de deploy garante que o rollback para a versão anterior seja possível em menos de 1 minuto via Vercel Instant Rollback. O histórico de deploys é preservado por 30 dias.

---

**DEP-006** — Migrations de banco em produção requerem aprovação explícita do IT_MANAGER
PRs que contêm arquivos em `supabase/migrations/` para a branch `main` têm o IT_MANAGER como CODEOWNER obrigatório. A migration não é aplicada sem sua aprovação.

---

**DEP-007** — Backup manual antes de migrations destrutivas em produção
Migrations que incluem DROP TABLE, DROP COLUMN ou operações irreversíveis requerem backup manual documentado no PR antes de serem aplicadas em produção.

---

**DEP-008** — Cada ambiente possui seu próprio projeto Supabase isolado
Os ambientes de desenvolvimento, homologação e produção apontam para projetos Supabase completamente separados. Nenhum ambiente compartilha banco, Auth ou Storage com outro.

---

**DEP-009** — Dados de produção não são copiados para desenvolvimento sem anonimização
A cópia de dados de produção para homologação (somente) é permitida apenas com anonimização prévia dos dados pessoais. É proibido copiar dados de produção para desenvolvimento.

---

**DEP-010** — Versão exibida no sistema deve refletir a versão em produção
A variável `NEXT_PUBLIC_APP_VERSION` é configurada no Vercel a cada release e exibida no rodapé da aplicação. A versão exibida deve corresponder à tag Git do deploy atual.

---

**DEP-011** — Feature branches têm vida máxima de 5 dias úteis
Branches com mais de 5 dias sem merge para `develop` são sinalizadas automaticamente. O autor recebe notificação para atualizar ou fechar a branch.

---

**DEP-012** — Commits seguem Conventional Commits obrigatoriamente
O CI valida o formato dos commits nos PRs. Commits que não seguem o padrão (`feat:`, `fix:`, `chore:`, etc.) bloqueiam o CI com erro descritivo.

---

**DEP-013** — Tags de versão criadas apenas em commits da branch main
Tags de versão (`v1.2.3`) são criadas exclusivamente sobre commits presentes na branch `main`. Tags em outras branches são inválidas para fins de release.

---

**DEP-014** — Preview deployments apontam para banco de desenvolvimento, nunca para produção
Todo preview deployment gerado por PR aponta para o projeto Supabase de desenvolvimento. É proibido configurar preview deployments com credenciais de produção.

---

**DEP-015** — .env.local nunca commitado
O arquivo `.env.local` está listado no `.gitignore` de forma imutável. Nenhuma exceção é permitida. Um `.env.example` sem valores reais substitui a documentação de variáveis.

---

**DEP-016** — Dependências auditadas semanalmente pelo Dependabot
O Dependabot está configurado para verificar vulnerabilidades semanalmente. Vulnerabilidades CRITICAL abertas por mais de 7 dias bloqueam merges para `main`.

---

**DEP-017** — CodeQL scan executado em todos os PRs para main
A análise estática de segurança com CodeQL é executada em todo PR para `main`. Findings de nível HIGH ou CRITICAL bloqueam o merge.

---

**DEP-018** — Histórico de migrations preservado de forma imutável
Arquivos em `supabase/migrations/` nunca são editados ou excluídos após serem aplicados em qualquer ambiente. Para corrigir uma migration, cria-se uma nova migration de correção.

---

**DEP-019** — Deploy de produção notifica IT_MANAGER por e-mail automaticamente
O pipeline CI envia notificação por e-mail ao IT_MANAGER a cada deploy bem-sucedido em produção, com: versão, timestamp, PR de origem e link para o deploy.

---

**DEP-020** — Smoke tests executados automaticamente após deploy de produção
O pipeline de CI inclui etapa de smoke tests pós-deploy que verifica os endpoints críticos (`/health`, `/api/health/db`, login). Falha nos smoke tests dispara rollback automático.

---

**DEP-021** — Rollback automático se smoke tests falharem após deploy
Se os smoke tests falharem após deploy em produção, o pipeline executa `vercel rollback` automaticamente para o deploy anterior estável. IT_MANAGER notificado imediatamente.

---

**DEP-022** — Squash merge obrigatório em main e staging
Merges para `main` e `staging` usam sempre squash merge para manter o histórico linear e limpo. Fast-forward merge e merge commit são desabilitados nessas branches.

---

**DEP-023** — Região de deploy padronizada como São Paulo (gru1)
Todas as Serverless Functions da Vercel são deployadas na região `gru1` (São Paulo) por padrão para minimizar latência aos usuários brasileiros.

---

**DEP-024** — Supabase Service Role Key nunca exposta no browser
A variável `SUPABASE_SERVICE_ROLE_KEY` não tem prefixo `NEXT_PUBLIC_` e nunca é incluída no bundle client-side. O CI valida que nenhuma variável sem prefixo `NEXT_PUBLIC_` é acessada no código de cliente.

---

**DEP-025** — WAF do Cloudflare em modo BLOCK em produção
O WAF do Cloudflare opera em modo BLOCK (não apenas LOG) em produção. Em desenvolvimento e homologação, pode operar em modo OBSERVE para evitar falsos positivos durante testes.

---

**DEP-026** — Migrations versionadas com timestamp UTC no nome do arquivo
O timestamp nos nomes de migration usa formato UTC (YYYYMMDDHHMMSS) para garantir ordenação correta entre desenvolvedores em fusos diferentes.

---

**DEP-027** — Nenhum dado de teste hardcoded em migrations
Migrations contêm apenas DDL (estrutura) e DML de dados de sistema obrigatórios (ex.: categorias padrão). Dados de teste são exclusivos de seeds, nunca de migrations.

---

**DEP-028** — Versão da API incluída em todas as respostas via header
O header `X-SGTI-Version` é incluído em todas as respostas da API com a versão atual do sistema, permitindo diagnóstico de qual versão está respondendo.

---

**DEP-029** — Variáveis de ambiente documentadas no .env.example e no README
Qualquer nova variável de ambiente adicionada deve ser documentada em `.env.example` (com comentário) e mencionada no `README.md` na seção de configuração.

---

**DEP-030** — Edge Functions têm timeout máximo configurado explicitamente
Toda Supabase Edge Function tem timeout explícito definido (máximo 60 segundos para free tier). Funções sem timeout configurado são bloqueadas no CI.

---

**DEP-031** — Changelog gerado automaticamente baseado em commits semânticos
O processo de release usa ferramenta automatizada (semantic-release ou equivalente) para gerar o CHANGELOG.md baseado nos commits desde a última tag.

---

**DEP-032** — Audit log de deploy armazenado no banco SGTI
Cada deploy de produção bem-sucedido gera registro em `shared.audit_log` com `action = PRODUCTION_DEPLOYED`, incluindo versão, SHA do commit, autor e timestamp.

---

**DEP-033** — Pull Requests de forks externos não recebem secrets do repositório
O GitHub Actions está configurado para não expor secrets em PRs originados de forks (`pull_request_target` com cuidado). Contribuições externas rodam CI sem acesso a credenciais.

---

**DEP-034** — Secrets do Vercel são configurados por ambiente (não globais)
Cada secret no Vercel está configurado especificamente para o ambiente adequado (dev, staging, prod). Não existem secrets globais que se aplicam a todos os ambientes simultaneamente.

---

**DEP-035** — Pipelines de CI são imutáveis para membros sem permissão de admin
Arquivos em `.github/workflows/` têm IT_MANAGER como CODEOWNER. Alterações nos pipelines requerem aprovação explícita do IT_MANAGER.

---

**DEP-036** — Backups do Supabase verificados mensalmente
No primeiro dia útil de cada mês, o IT_MANAGER verifica que os backups automáticos do Supabase estão sendo realizados e que um restore de teste foi executado no mês anterior.

---

**DEP-037** — Deploys em horário comercial exceto hotfixes
Deploys planejados em produção são executados durante o horário comercial (08h–18h, seg–sex) para garantir que a equipe está disponível para responder a incidentes. Hotfixes podem ser deployados a qualquer hora.

---

**DEP-038** — Comunicado de release enviado antes do deploy
O IT_MANAGER envia comunicado de release aos usuários antes do deploy planejado, com pelo menos 24h de antecedência para versões com mudanças significativas de interface.

---

**DEP-039** — Janela de manutenção comunicada para migrações de alto risco
Migrações classificadas como alto risco têm janela de manutenção comunicada com 24h de antecedência. Usuários são notificados via e-mail e banner in-app.

---

**DEP-040** — Supabase free tier monitorado para evitar quota excedida
A cota de uso do Supabase free tier (500 MB banco, 1 GB storage, 50k auth usuários) é monitorada. Ao atingir 80% de qualquer cota, IT_MANAGER e FINANCIAL_ANALYST são alertados para decidir sobre upgrade.

---

**DEP-041** — Logs de CI preservados por 30 dias no GitHub Actions
Os logs de cada execução do GitHub Actions são preservados por 30 dias (padrão GitHub). Para deploys de produção, o IT_MANAGER exporta e arquiva os logs antes da expiração.

---

**DEP-042** — Vercel Hobby (free) tem limitações que devem ser monitoradas
No plano Vercel Hobby: 100 GB bandwidth/mês, serverless functions timeout 10s, sem proteção de senha para preview. O IT_MANAGER monitora o uso e avalia upgrade para Pro quando necessário.

---

**DEP-043** — Preview deployments protegidos por autenticação Vercel
Preview deployments requerem login na Vercel para serem acessados por usuários externos à equipe. Isso previne acesso não autorizado a funcionalidades em desenvolvimento.

---

**DEP-044** — CODEOWNERS atualizado a cada nova área crítica de código
O arquivo `CODEOWNERS` é atualizado ao adicionar novos módulos críticos (segurança, banco, CI/CD). Este arquivo é revisado trimestralmente pelo IT_MANAGER.

---

**DEP-045** — Supabase CLI versão fixada no repositório
A versão da Supabase CLI usada no CI é fixada no arquivo de configuração do workflow para garantir reprodutibilidade entre execuções.

---

**DEP-046** — Testes de integração executados contra banco de desenvolvimento, não mock
Os testes de integração no CI apontam para o banco Supabase de desenvolvimento (não banco em memória ou mock) para garantir que as migrations e políticas RLS sejam validadas de forma realista.

---

**DEP-047** — Health check endpoint não requer autenticação
O endpoint `/api/health` retorna dados de status sem requerer autenticação, pois é usado por ferramentas de monitoramento externo. O conteúdo retornado não expõe dados sensíveis.

---

**DEP-048** — Correlation ID gerado no middleware do Next.js
O middleware Next.js gera um `correlation_id` UUID para cada request antes de chegar às API Routes, garantindo rastreabilidade completa da requisição.

---

**DEP-049** — Artefatos de build não são commitados no repositório
A pasta `.next/` e outros artefatos de build estão no `.gitignore`. O build é sempre recriado durante o deploy. Nenhum artefato compilado é versionado.

---

**DEP-050** — Node.js versão fixada no .nvmrc e no package.json engines
A versão do Node.js é declarada no `.nvmrc` (para desenvolvimento local) e em `package.json > engines` para garantir que o CI e o Vercel usem a mesma versão que o desenvolvimento local.

---

**DEP-051** — npm ci usado no CI, nunca npm install
O pipeline de CI usa `npm ci` (install deterministico baseado em `package-lock.json`) ao invés de `npm install` para garantir reprodutibilidade exata das dependências.

---

**DEP-052** — package-lock.json commitado no repositório
O arquivo `package-lock.json` é commitado e versionado. `npm install` em ambiente de desenvolvimento atualiza este arquivo, que deve ser incluído no PR.

---

**DEP-053** — Dependências de desenvolvimento não instaladas em produção
O `npm ci --production` (ou `npm ci` com `NODE_ENV=production`) exclui `devDependencies` do bundle de produção, reduzindo o tamanho e a superfície de ataque.

---

**DEP-054** — Deploy de produção exige que staging esteja no ar e funcional
Antes de mergar para `main`, o IT_MANAGER verifica que o ambiente de homologação está funcional e que os testes foram executados contra ele com sucesso.

---

**DEP-055** — Versão MAJOR requer plano de migração documentado
Ao incrementar a versão MAJOR (mudança incompatível), um documento de plano de migração deve ser criado e aprovado pelo IT_MANAGER antes do release.

---

**DEP-056** — Hotfix aplica-se diretamente a main e é retroportado para develop
Hotfixes são criados a partir de `main`, deployados diretamente para produção e então retroportados (cherry-pick ou merge) para `develop` para garantir que a correção esteja em todas as branches.

---

**DEP-057** — Limites de rate do Cloudflare configurados para endpoints sensíveis
O Cloudflare possui regras de rate limiting configuradas para: `/api/auth/**` (100 req/min), `/api/integrations/**` (1000 req/min), endpoints de exportação (10 req/min por IP).

---

**DEP-058** — Logs de erro em produção não expõem stack traces para o usuário
Respostas de erro da API em produção retornam apenas `error.code` e `error.message` genérico. Stack traces são registrados apenas nos logs do servidor (Vercel Runtime Logs), nunca no response body.

---

**DEP-059** — Release notes publicadas no GitHub Releases
Cada tag de versão é acompanhada de um GitHub Release com as release notes geradas automaticamente. GitHub Releases serve como histórico oficial de versões do SGTI.

---

**DEP-060** — Deploy zero-downtime garantido pela arquitetura serverless
A arquitetura serverless do Vercel garante zero-downtime por design: novas instâncias recebem tráfego apenas quando prontas; instâncias antigas continuam respondendo até completar requests em andamento.

---

## 22. Critérios de Aceitação

### 22.1 Pipeline CI/CD

- [ ] **CA-01:** Merge para `main` bloqueado sem CI verde (lint + test + build + security).
- [ ] **CA-02:** Merge para `main` bloqueado sem 2 aprovações de reviewers distintos.
- [ ] **CA-03:** Push direto para `main` bloqueado para qualquer usuário.
- [ ] **CA-04:** Secret scanning (gitleaks) executado em todo PR e push.
- [ ] **CA-05:** Smoke tests executados automaticamente após deploy de produção.
- [ ] **CA-06:** Rollback automático disparado se smoke tests falharem.
- [ ] **CA-07:** Notificação por e-mail ao IT_MANAGER a cada deploy de produção.

### 22.2 Ambientes

- [ ] **CA-08:** Cada ambiente (dev/staging/prod) usa projeto Supabase isolado.
- [ ] **CA-09:** Preview deployments apontam para banco de desenvolvimento, nunca produção.
- [ ] **CA-10:** URL de cada ambiente acessível via subdomínio configurado no Cloudflare.
- [ ] **CA-11:** Ambiente local funciona com `npm run dev` + `supabase start` sem configuração manual extra.

### 22.3 Segredos e Variáveis

- [ ] **CA-12:** `.env.local` está no `.gitignore` e nunca aparece no repositório.
- [ ] **CA-13:** `.env.example` documenta todas as variáveis sem valores reais.
- [ ] **CA-14:** `SUPABASE_SERVICE_ROLE_KEY` nunca aparece em respostas de API ou logs expostos.
- [ ] **CA-15:** Secrets do Vercel configurados por ambiente (não globais).

### 22.4 Banco de Dados

- [ ] **CA-16:** Migrations aplicadas automaticamente no CI para dev e staging.
- [ ] **CA-17:** Migrations para produção requerem aprovação do IT_MANAGER (CODEOWNERS).
- [ ] **CA-18:** Migrations não são editadas após aplicadas em qualquer ambiente.
- [ ] **CA-19:** Backup manual realizado antes de migrations destrutivas em produção.

### 22.5 Rollback e Monitoramento

- [ ] **CA-20:** Rollback de frontend executável em menos de 1 minuto via Vercel.
- [ ] **CA-21:** Endpoint `/api/health` retorna status correto sem autenticação.
- [ ] **CA-22:** Alerta configurado para disponibilidade < 99,5% no período de 1 hora.
- [ ] **CA-23:** Correlation ID presente em todos os logs de API e no audit_log.

### 22.6 Versionamento

- [ ] **CA-24:** Commits seguem Conventional Commits (validado pelo CI).
- [ ] **CA-25:** Tags de versão (`vX.Y.Z`) criadas apenas em commits da branch `main`.
- [ ] **CA-26:** Versão atual exibida no rodapé da aplicação corresponde à tag do deploy.
- [ ] **CA-27:** GitHub Release criado automaticamente a cada nova tag de versão.

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação com 22 seções, 60 regras DEP e 27 critérios de aceitação |

---

> **Documentos relacionados:**
> [`50_INTEGRATIONS.md`](./50_INTEGRATIONS.md) — Integrações externas (Google, GLPI, E-mail)
> [`22_AUTHENTICATION.md`](./22_AUTHENTICATION.md) — Autenticação e autorização
> [`20_DATABASE.md`](./20_DATABASE.md) — Modelo de dados e schemas
