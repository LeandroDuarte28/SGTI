# SGTI — Sistema de Gestão de Tecnologia da Informação
## GitHub Actions — Estratégia de CI/CD — Documentação Técnica

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [70_DEPLOYMENT.md](./70_DEPLOYMENT.md) · [71_SUPABASE.md](./71_SUPABASE.md) · [50_INTEGRATIONS.md](./50_INTEGRATIONS.md)

---

## Sobre este Documento

Este documento define a **estratégia completa de CI/CD utilizando GitHub Actions para o SGTI**, cobrindo pipelines de validação, deploy automatizado, gestão de segredos, versionamento, rollback e segurança.

**Premissa:** Todo deploy de produção é automatizado, auditado e reversível. Nenhuma intervenção manual é necessária para deploys de rotina.

---

## Sumário

1. [Objetivos](#1-objetivos)
2. [Arquitetura CI/CD](#2-arquitetura-cicd)
3. [Branches e Estratégia Git](#3-branches-e-estratégia-git)
4. [Fluxo de Pull Request](#4-fluxo-de-pull-request)
5. [Validações Automáticas](#5-validações-automáticas)
6. [Deploy Automático](#6-deploy-automático)
7. [Gestão de Segredos](#7-gestão-de-segredos)
8. [Versionamento Automático](#8-versionamento-automático)
9. [Rollback](#9-rollback)
10. [Auditoria do Pipeline](#10-auditoria-do-pipeline)
11. [Monitoramento do CI/CD](#11-monitoramento-do-cicd)
12. [Segurança no CI/CD](#12-segurança-no-cicd)
13. [Critérios de Aceitação](#13-critérios-de-aceitação)

---

## 1. Objetivos

### 1.1 Objetivo Primário

Garantir que todo código que chega à produção passou por validação automatizada completa, é rastreável até o PR de origem e pode ser revertido em menos de 5 minutos em caso de incidente.

### 1.2 Objetivos Específicos

| # | Objetivo |
|---|----------|
| 1 | Nenhum deploy de produção sem CI verde (lint + build + testes + security) |
| 2 | Deploy automático zero-touch: merge em `main` → produção sem ação manual |
| 3 | Rastreabilidade completa: deploy → PR → commits → aprovadores → testes |
| 4 | Rollback disponível em ≤ 5 minutos para qualquer deploy de produção |
| 5 | Nenhum segredo exposto em logs ou no repositório |
| 6 | Feedback rápido ao desenvolvedor: CI completo em ≤ 5 minutos |
| 7 | Custo zero: GitHub Actions free tier (2.000 min/mês público; 2.000 min privado) |

---

## 2. Arquitetura CI/CD

### 2.1 Visão Geral do Pipeline

```
ARQUITETURA CI/CD — VISÃO GERAL

DESENVOLVEDOR
    │
    ├── git push origin feature/minha-feature
    │
    ▼
GITHUB
    │
    ├── [Trigger: push em feature/*]
    │   └── Pipeline CI-LINT-TEST (rápido, feedback imediato)
    │
    ├── [Trigger: PR aberto para develop]
    │   ├── Pipeline CI-FULL (lint + test + build + security)
    │   └── Deploy Preview → Vercel Preview URL
    │
    ├── [Trigger: merge em develop]
    │   └── Deploy Development → Vercel (dev.sgti.empresa.com.br)
    │
    ├── [Trigger: merge em staging]
    │   ├── Pipeline CI-FULL
    │   ├── Migrations Supabase HML
    │   └── Deploy Homologação → Vercel (homolog.sgti.empresa.com.br)
    │
    └── [Trigger: merge em main]
        ├── Pipeline CI-FULL
        ├── Migrations Supabase PROD (com aprovação IT_MANAGER)
        ├── Deploy Produção → Vercel (sgti.empresa.com.br)
        ├── Smoke Tests pós-deploy
        ├── Tag de versão automática
        └── Notificação ao IT_MANAGER
```

### 2.2 Pipelines Definidos

| Pipeline | Arquivo | Gatilho | Duração Estimada |
|:--------:|:-------:|:-------:|:----------------:|
| `ci-quick` | `ci-quick.yml` | Push em qualquer branch | ≤ 2 min |
| `ci-full` | `ci-full.yml` | PR aberto/atualizado | ≤ 5 min |
| `deploy-preview` | `deploy-preview.yml` | PR aberto para qualquer branch | ≤ 3 min |
| `deploy-dev` | `deploy-dev.yml` | Merge em `develop` | ≤ 4 min |
| `deploy-staging` | `deploy-staging.yml` | Merge em `staging` | ≤ 6 min |
| `deploy-production` | `deploy-production.yml` | Merge em `main` | ≤ 8 min |
| `security-scan` | `security-scan.yml` | Semanal (domingo 02h00) | ≤ 10 min |
| `release` | `release.yml` | Push de tag `v*.*.*` | ≤ 3 min |

### 2.3 Estrutura de Arquivos

```
.github/
  workflows/
    ci-quick.yml           ← Lint rápido em feature branches
    ci-full.yml            ← Lint + Test + Build + Security
    deploy-preview.yml     ← Preview deployment para PRs
    deploy-dev.yml         ← Deploy para ambiente de desenvolvimento
    deploy-staging.yml     ← Deploy para homologação
    deploy-production.yml  ← Deploy para produção
    security-scan.yml      ← Scan semanal de segurança
    release.yml            ← Criação de GitHub Release
  CODEOWNERS               ← Revisores obrigatórios por caminho
  pull_request_template.md ← Template de PR
  ISSUE_TEMPLATE/
    bug_report.md
    feature_request.md
```

---

## 3. Branches e Estratégia Git

### 3.1 Branches e seus Pipelines

| Branch | Proteção | Pipeline Ativo | Deploy |
|:------:|:--------:|:--------------:|:------:|
| `main` | Máxima (2 aprovações + CI obrigatório) | `ci-full` + `deploy-production` | Produção |
| `staging` | Alta (1 aprovação + CI obrigatório) | `ci-full` + `deploy-staging` | Homologação |
| `develop` | Média (1 aprovação + CI obrigatório) | `ci-quick` + `deploy-dev` | Desenvolvimento |
| `feature/*` | Nenhuma | `ci-quick` | Preview (ao abrir PR) |
| `fix/*` | Nenhuma | `ci-quick` | Preview (ao abrir PR) |
| `hotfix/*` | Nenhuma | `ci-full` (urgência) | Produção direto |

### 3.2 Configuração de Proteção de Branch via GitHub

**Branch `main` — Proteções obrigatórias:**

```
GitHub → Settings → Branches → Branch protection rules → main

✅ Require a pull request before merging
   ✅ Required number of approvals: 2
   ✅ Dismiss stale pull request approvals when new commits are pushed
   ✅ Require review from Code Owners

✅ Require status checks to pass before merging
   Status checks obrigatórios:
   - ci-full / lint
   - ci-full / test
   - ci-full / build
   - ci-full / security-scan

✅ Require branches to be up to date before merging
✅ Do not allow bypassing the above settings
✅ Restrict who can push to matching branches
   (apenas CODEOWNERS e bots do Vercel)
✅ Do not allow force pushes
✅ Do not allow deletions
```

---

## 4. Fluxo de Pull Request

### 4.1 Ciclo de Vida de um PR

```
FLUXO COMPLETO DE PULL REQUEST

ABERTURA DO PR
──────────────
Desenvolvedor abre PR: feature/42-email-notification → develop
    │
    ▼ Automático (GitHub Actions dispara)
    ├── ci-quick.yml: Lint + Testes unitários (≤ 2 min)
    ├── deploy-preview.yml: Preview deployment na Vercel (≤ 3 min)
    │   └── Comentário automático no PR:
    │       "✅ Preview: https://sgti-pr42-{hash}.vercel.app"
    └── ci-full.yml: Lint + Test + Build + Security (≤ 5 min)
            │
            ▼ Resultado exibido no PR como Status Checks

REVISÃO
───────
    ├── Reviewer 1: analisa código + testa preview URL
    ├── Reviewer 2: analisa código (obrigatório para main)
    ├── Comentários e ajustes
    └── Aprovações concedidas

    │ Se CI falhar: merge bloqueado automaticamente
    │ Se aprovações insuficientes: merge bloqueado

MERGE
─────
    ├── Squash merge (padrão obrigatório)
    ├── Mensagem do squash: "{tipo}: {descrição} (#PR-número)"
    │   Exemplo: "feat: Adicionar notificação de SLA (#42)"
    ├── Branch de origem excluída automaticamente após merge
    └── Deploy automático disparado para o ambiente correspondente

PÓS-MERGE
──────────
    ├── Notificação ao autor: "Sua PR foi mergeada e deployada"
    ├── Issue vinculada fechada automaticamente (se "Closes #X" no PR)
    └── Preview deployment expirado em 24 horas
```

### 4.2 Status Checks Obrigatórios

O GitHub exibe o resultado de cada check diretamente no PR:

| Check | Nome no GitHub | Obrigatório para Main | O que Valida |
|:-----:|:--------------:|:---------------------:|:------------:|
| Lint | `ci-full / lint` | ✅ | ESLint + Prettier |
| Testes | `ci-full / test` | ✅ | Jest + Testing Library |
| Build | `ci-full / build` | ✅ | `next build` sem erros |
| Security | `ci-full / security` | ✅ | npm audit + CodeQL + gitleaks |
| Vercel Preview | `vercel / deploy-preview` | ❌ (informativo) | Preview URL disponível |

### 4.3 Comentários Automáticos no PR

O pipeline adiciona comentários automáticos no PR para facilitar o review:

| Evento | Comentário Automático |
|:------:|:--------------------:|
| Preview pronto | "✅ Preview deployado: {URL}" |
| Cobertura de testes | "📊 Coverage: XX% (linhas), YY% (branches)" |
| Security findings | "⚠️ X vulnerabilidade(s) encontrada(s) — ver detalhes" |
| Build size diff | "📦 Bundle size: +/- XkB vs. main" |
| Migration detectada | "🗃️ Migration detectada: `{nome}` — verificar impacto em dados" |

---

## 5. Validações Automáticas

### 5.1 Pipeline CI-QUICK (feedback imediato)

**Gatilho:** Push em qualquer branch que não seja `main`, `staging` ou `develop`.

**Objetivo:** Feedback em ≤ 2 minutos para o desenvolvedor.

**Etapas:**

```
JOB: lint-quick
────────────────
1. Checkout do código (usando cache de actions/checkout@v4)
2. Setup Node.js (versão do .nvmrc, com cache npm)
3. npm ci (usando cache de node_modules)
4. ESLint: npx eslint . --max-warnings 0
5. Prettier: npx prettier --check .
6. TypeScript: npx tsc --noEmit

Tempo estimado: 60–90 segundos
```

### 5.2 Pipeline CI-FULL (validação completa)

**Gatilho:** PR aberto ou atualizado para qualquer branch protegida.

**Objetivo:** Validação completa em ≤ 5 minutos.

**Etapas detalhadas:**

```
JOB 1: lint
────────────
1. Checkout + Setup Node.js (ubuntu-latest, node 20)
2. npm ci (com cache)
3. ESLint: npx eslint . --max-warnings 0
4. Prettier: npx prettier --check .
5. TypeScript: npx tsc --noEmit

JOB 2: test (paralelo com lint)
────────────────────────────────
1. Checkout + Setup Node.js
2. npm ci (com cache)
3. Configurar .env.test com variáveis de teste
4. jest --coverage --ci --forceExit
5. Upload coverage report como artefato
6. Comentar coverage no PR via action de coverage

JOB 3: build (depende de lint + test)
───────────────────────────────────────
1. Checkout + Setup Node.js
2. npm ci (com cache)
3. Configurar variáveis de ambiente de build
4. next build
5. Verificar tamanho do bundle (comparar com main)
6. Upload .next/standalone como artefato (para deploy)

JOB 4: security (paralelo com build)
───────────────────────────────────────
1. Checkout + Setup Node.js
2. npm audit --audit-level=high
   → Falha se vulnerabilidade HIGH ou CRITICAL
3. gitleaks detect --source . --no-git
   → Falha se segredo detectado no código
4. CodeQL analyze (JavaScript/TypeScript)
   → Falha se finding de nível HIGH ou CRITICAL
5. Verificar se não há dependências sem versão fixada
```

### 5.3 Lint — Detalhes de Configuração

**ESLint:** Regras configuradas no `.eslintrc.js` com plugins:
- `@typescript-eslint` — regras TypeScript
- `eslint-plugin-react` e `eslint-plugin-react-hooks` — regras React/Next.js
- `eslint-plugin-import` — ordenação de imports
- `@next/eslint-plugin-next` — regras Next.js
- `no-console` em warning (permitido apenas em Edge Functions)
- `no-unused-vars` em error
- `@typescript-eslint/no-explicit-any` em error

**Prettier:** Configurado no `.prettierrc` com:
- `semi: true`
- `singleQuote: true`
- `trailingComma: 'es5'`
- `printWidth: 100`
- `tabWidth: 2`

### 5.4 Testes — Estratégia

| Tipo de Teste | Ferramenta | O que Testa | Cobertura Mínima |
|:-------------:|:----------:|:------------|:----------------:|
| **Unitários** | Jest | Funções utilitárias, hooks, cálculos de KPI | 70% de linhas |
| **Componentes** | Testing Library + Jest | Renderização e interação de componentes React | Casos críticos |
| **Integração** | Jest + Supabase (dev) | API Routes contra banco real | Fluxos principais |
| **E2E** | Playwright (futuro v2) | Fluxos completos no browser | Não obrigatório v1 |

**Prioridade de testes v1:**
1. Cálculos de SLA e KPIs (lógica crítica de negócio).
2. Fluxos de autenticação e autorização (RBAC).
3. Criação e atualização de chamados.
4. Cálculos financeiros (OPEX/CAPEX/depreciação).

### 5.5 Build — Validações

O `next build` deve passar sem erros:
- Sem TypeScript errors.
- Sem erros de importação/exportação.
- Sem páginas com erros de renderização.
- Tamanho do bundle comparado com baseline (alerta se aumentar > 10%).

---

## 6. Deploy Automático

### 6.1 Deploy para Desenvolvimento

**Gatilho:** Merge bem-sucedido em `develop`.

```
PIPELINE: deploy-dev.yml

Condições:
  branch: develop
  ci-quick passou (verificado via required status check)

Etapas:
1. Checkout código (SHA do merge commit)
2. Setup Vercel CLI: npm i -g vercel
3. Autenticar Vercel: vercel login --token $VERCEL_TOKEN
4. Pull variáveis de ambiente dev: vercel env pull .env.dev
5. Build: next build (com env dev)
6. Deploy para Vercel (dev environment):
   vercel deploy --prod=false --env=development
7. Aplicar migrations Supabase DEV:
   supabase db push --db-url $SUPABASE_DEV_DB_URL
8. Notificação no Slack/chat: "✅ Deploy dev concluído: {URL}"
```

### 6.2 Deploy para Homologação

**Gatilho:** Merge bem-sucedido em `staging`.

```
PIPELINE: deploy-staging.yml

Condições:
  branch: staging
  ci-full passou

Etapas:
1. Checkout código
2. Verificar se há migrations novas (diff vs. última migration aplicada)
3. Se há migrations:
   a. Notificar IT_MANAGER: "Migration detectada para staging"
   b. Aplicar migrations: supabase db push --db-url $SUPABASE_HML_DB_URL
   c. Verificar migrations aplicadas com sucesso
4. Build Next.js (com env staging)
5. Deploy Vercel (staging environment):
   vercel deploy --prod=false --env=staging
6. Smoke tests básicos pós-deploy:
   GET https://homolog.sgti.empresa.com.br/api/health → 200 OK
   GET https://homolog.sgti.empresa.com.br/api/health/db → status ok
7. Se smoke tests passaram:
   → Notificação: "✅ Deploy homologação concluído: {URL}"
8. Se smoke tests falharam:
   → Alerta: "⚠️ Smoke tests falharam em homologação — verificar"
   → NÃO reverter (homologação pode ter dados diferentes)
```

### 6.3 Deploy para Produção

**Gatilho:** Merge bem-sucedido em `main`.

Este é o pipeline mais crítico e tem a maior cobertura de verificações:

```
PIPELINE: deploy-production.yml

FASE 1 — PRÉ-DEPLOY
─────────────────────
1. Checkout código (SHA exato do merge commit)
2. Verificar que ci-full passou (requerido pelo GitHub branch protection)
3. Verificar se há migrations novas:
   Se SIM:
     a. Verificar que PR tem label "migration"
     b. Verificar que IT_MANAGER aparece como aprovador (via CODEOWNERS)
     c. Notificar IT_MANAGER: "Aplicando migrations em produção em 60s"
     d. Aguardar confirmação manual (environment protection — ver abaixo)

FASE 2 — MIGRATIONS (se houver)
──────────────────────────────────
4. Conectar ao Supabase PROD via $SUPABASE_PROD_DB_URL
5. Listar migrations pendentes (compare migration files vs. supabase_migrations table)
6. Aplicar migrations uma a uma:
   supabase db push --db-url $SUPABASE_PROD_DB_URL
7. Verificar sucesso: query SELECT * FROM supabase_migrations ORDER BY name DESC LIMIT 5
8. Registrar em audit_log: action=MIGRATION_APPLIED, migration_name, applied_at

FASE 3 — BUILD E DEPLOY
─────────────────────────
9. npm ci --production=false (para build)
10. next build (com env de produção)
11. vercel deploy --prod --env=production
    → Aguarda confirmação do deploy (polling do status)
12. Registrar deployment ID do Vercel

FASE 4 — SMOKE TESTS PÓS-DEPLOY
──────────────────────────────────
13. Aguardar 30 segundos (warm-up das serverless functions)
14. Smoke test 1: GET /api/health → { status: "ok" }
15. Smoke test 2: GET /api/health/db → { status: "ok" }
16. Smoke test 3: GET / → HTTP 200 (home page carrega)
17. Smoke test 4: GET /api/version → { version: "x.y.z" } (versão correta)

FASE 5 — PÓS-DEPLOY
─────────────────────
SE smoke tests PASSARAM:
    18. Criar tag Git: v{versão} no commit atual
    19. Criar GitHub Release com changelog automático
    20. Notificar IT_MANAGER por e-mail: "✅ Produção deployada — v{versão}"
    21. Registrar em audit_log: action=PRODUCTION_DEPLOYED, version, sha, deployer=CI

SE smoke tests FALHARAM:
    18. Disparar rollback automático:
        vercel rollback {deployment-id-anterior}
    19. Alerta urgente ao IT_MANAGER: "🚨 SMOKE TESTS FALHARAM — Rollback executado"
    20. Registrar em audit_log: action=PRODUCTION_DEPLOY_FAILED, rollback_executed=true
    21. Bloquear próximos deploys até investigação manual
```

### 6.4 Environment Protection para Produção

O GitHub Actions suporta **Environments** com aprovação manual para etapas críticas:

```
GitHub → Settings → Environments → production

Configuração:
  ✅ Required reviewers: [IT_MANAGER_GITHUB_HANDLE]
  ✅ Wait timer: 0 minutos (aprovação manual, não timer)
  ✅ Deployment branches: main only
  Variáveis secretas do ambiente: (separadas por ambiente)
```

Quando o pipeline chega à fase de migrations em produção, pausa e aguarda aprovação explícita do IT_MANAGER via interface do GitHub ou e-mail de notificação.

### 6.5 Deploy Preview

**Gatilho:** PR aberto ou atualizado (qualquer branch).

```
PIPELINE: deploy-preview.yml

1. Checkout código
2. Deploy na Vercel como preview (sem --prod):
   vercel deploy --token $VERCEL_TOKEN
   → URL gerada: sgti-{branch}-{hash}.vercel.app
3. Comentar no PR:
   "🔍 Preview deployado: https://sgti-{hash}.vercel.app
    Ambiente: desenvolvimento
    Branch: {branch}
    Commit: {sha-curto}"
4. Atualizar status check "vercel/deploy-preview" no PR
```

---

## 7. Gestão de Segredos

### 7.1 Hierarquia de Segredos no GitHub

```
HIERARQUIA DE SEGREDOS GITHUB

Organization Secrets (herdados por todos os repos da org):
  Não utilizados (evitar dependência excessiva)

Repository Secrets (do repositório sgti):
  Usados para todos os ambientes + CI geral

Environment Secrets (por ambiente):
  production → apenas para o job de deploy de produção
  staging    → apenas para o job de deploy de homologação
  development → apenas para o job de deploy de dev
```

### 7.2 Segredos por Contexto

**Repository Secrets (disponíveis para todos os jobs):**

| Secret | Uso | Quem Configura |
|:------:|:----|:--------------:|
| `VERCEL_TOKEN` | Autenticação no Vercel CLI | IT_MANAGER |
| `VERCEL_ORG_ID` | ID da organização Vercel | IT_MANAGER |
| `VERCEL_PROJECT_ID` | ID do projeto Vercel | IT_MANAGER |
| `GITHUB_TOKEN` | Token automático do GitHub Actions (built-in) | Automático |
| `SLACK_WEBHOOK_URL` | Notificações de deploy (se Slack configurado) | IT_MANAGER |

**Environment Secrets — `production`:**

| Secret | Uso |
|:------:|:----|
| `SUPABASE_PROD_DB_URL` | URL de conexão direta ao banco de produção (migrations) |
| `SUPABASE_PROD_PROJECT_REF` | Referência do projeto Supabase prod (Edge Functions) |
| `SUPABASE_ACCESS_TOKEN` | Token de acesso à Supabase CLI (deploy Edge Functions) |
| `VERCEL_PROD_ENV_URL` | URL de produção para smoke tests |

**Environment Secrets — `staging`:**

| Secret | Uso |
|:------:|:----|
| `SUPABASE_HML_DB_URL` | URL de conexão ao banco de homologação |
| `SUPABASE_HML_PROJECT_REF` | Referência do projeto Supabase HML |

**Environment Secrets — `development`:**

| Secret | Uso |
|:------:|:----|
| `SUPABASE_DEV_DB_URL` | URL de conexão ao banco de desenvolvimento |
| `SUPABASE_DEV_PROJECT_REF` | Referência do projeto Supabase DEV |

### 7.3 Regras de Segredos

- **Nunca** usar `echo $SECRET` em steps de debug.
- **Nunca** passar segredos como argumentos de linha de comando (visíveis em logs).
- **Sempre** usar variáveis de ambiente para injeção de segredos em comandos.
- Logs que contêm `***` (mascaramento automático do GitHub) são normais e esperados.
- Segredos configurados no GitHub nunca aparecem no output de `git log`, `git diff` ou em artefatos.

### 7.4 Rotação de Segredos do Pipeline

| Secret | Frequência de Rotação | Responsável |
|:------:|:---------------------:|:-----------:|
| `VERCEL_TOKEN` | Anual | IT_MANAGER |
| `SUPABASE_ACCESS_TOKEN` | Semestral | IT_MANAGER |
| `SUPABASE_*_DB_URL` | Ao rotar senha do banco | IT_MANAGER |
| `SLACK_WEBHOOK_URL` | Ao renovar integração | IT_MANAGER |

---

## 8. Versionamento Automático

### 8.1 Semantic Release

O SGTI usa **semantic-release** para automatizar a geração de versões baseada em commits:

```
FLUXO DE VERSIONAMENTO AUTOMÁTICO

1. Commits seguem Conventional Commits:
   feat: nova funcionalidade → incrementa MINOR (1.0.0 → 1.1.0)
   fix: correção de bug → incrementa PATCH (1.0.0 → 1.0.1)
   feat!: breaking change → incrementa MAJOR (1.0.0 → 2.0.0)
   chore/docs/style: sem incremento de versão

2. Ao fazer merge em main:
   semantic-release analisa commits desde a última tag
   Determina próxima versão (SemVer)
   Cria tag Git: v{MAJOR}.{MINOR}.{PATCH}
   Cria GitHub Release com changelog gerado

3. Changelog organizado automaticamente:
   🚀 Features (feat:)
   🐛 Bug Fixes (fix:)
   ⚡ Performance (perf:)
   🔒 Security (security:)
   🗃️ Database Migrations (commits com label migration)
```

### 8.2 Pipeline de Release

**Arquivo:** `release.yml`  
**Gatilho:** Push em `main` após deploy bem-sucedido.

```
PIPELINE: release.yml

1. Checkout completo com histórico: fetch-depth: 0
2. Setup Node.js
3. npm ci
4. Executar semantic-release:
   → Analisa commits desde última tag
   → Calcula próxima versão
   → Atualiza package.json com nova versão
   → Gera CHANGELOG.md
   → Cria tag Git v{versão}
   → Cria GitHub Release com notas automáticas
   → Publica as notas como comentário no PR mergeado

5. Notificar IT_MANAGER:
   "🏷️ Release v{versão} publicado — {link para GitHub Release}"
```

### 8.3 GitHub Releases

Cada versão de produção gera um GitHub Release contendo:
- **Tag:** `v{MAJOR}.{MINOR}.{PATCH}`
- **Título:** `Release v{MAJOR}.{MINOR}.{PATCH} — {data}`
- **Corpo:** Changelog automático por categoria
- **Assets:** Nenhum (deploy é feito pela Vercel, não por artefatos)
- **Pre-release:** Marcado como pre-release para versões `-alpha`, `-beta`, `-rc`

---

## 9. Rollback

### 9.1 Rollback Automático (Smoke Tests)

O rollback automático é disparado quando os smoke tests pós-deploy falham:

```
ROLLBACK AUTOMÁTICO

Condição: smoke tests falharam após deploy de produção

1. Recuperar deployment ID anterior estável:
   vercel ls --scope=production --limit=5
   → Identificar o deployment antes do atual

2. Executar rollback:
   vercel rollback {deployment-id-anterior} --token $VERCEL_TOKEN

3. Verificar que rollback foi aplicado:
   GET https://sgti.empresa.com.br/api/version
   → Versão deve ser a anterior

4. Notificar IT_MANAGER com urgência:
   "🚨 DEPLOY AUTOMÁTICO FALHOU — ROLLBACK EXECUTADO
    Versão atual: {versão-anterior}
    Deploy com falha: {sha}
    Smoke tests que falharam: {lista}
    Ação necessária: investigar o problema antes do próximo deploy"

5. Registrar em shared.audit_log:
   action = PRODUCTION_ROLLBACK_EXECUTED
   deployer = GitHub-Actions-Bot
   reason = SMOKE_TEST_FAILURE
   reverted_to = {deployment-id-anterior}
```

### 9.2 Rollback Manual pelo IT_MANAGER

Para situações onde o rollback automático não é suficiente ou não foi disparado:

```
ROLLBACK MANUAL — PROCEDIMENTO

Opção A: Via Vercel Dashboard (mais rápido — < 1 min)
  1. Acessar vercel.com → sgti-prod → Deployments
  2. Localizar o deploy estável anterior
  3. Clicar em "..." → "Promote to Production"
  4. Confirmar a promoção

Opção B: Via Vercel CLI (< 2 min)
  1. vercel ls --scope=production --limit=10
  2. Identificar o deployment URL estável anterior
  3. vercel rollback {deployment-url} --token $VERCEL_TOKEN

Opção C: Via GitHub (re-deploy de tag anterior — < 5 min)
  1. Ir para Actions → Workflow "deploy-production"
  2. "Run workflow" → selecionar branch/tag da versão anterior
  3. Confirmar execução manual

APÓS QUALQUER ROLLBACK:
  → Registrar incidente no SGTI com causa e timeline
  → Documentar em post-mortem o motivo da falha
  → Corrigir o problema antes de tentar o próximo deploy
```

### 9.3 Rollback de Migration de Banco

Para reverter uma migration de banco aplicada em produção:

```
ROLLBACK DE MIGRATION — PROCEDIMENTO MANUAL

PRÉ-REQUISITO: Script de rollback deve estar documentado no PR

1. Criar nova migration de rollback (operações inversas):
   Arquivo: supabase/migrations/{timestamp}_rollback_{migration-original}.sql

2. Testar o rollback em homologação:
   supabase db push --db-url $SUPABASE_HML_DB_URL

3. Executar em produção (via pipeline ou manual com aprovação IT_MANAGER):
   supabase db push --db-url $SUPABASE_PROD_DB_URL

4. Registrar em audit_log:
   action = MIGRATION_ROLLBACK_EXECUTED

IMPORTANTE: Rollback de DROP TABLE ou DROP COLUMN requer backup.
            Sem backup = impossível reverter.
```

---

## 10. Auditoria do Pipeline

### 10.1 O que é Registrado Automaticamente

| Evento | Onde é Registrado | Dados Capturados |
|:------:|:-----------------:|:----------------:|
| Deploy iniciado | GitHub Actions Log | Workflow, branch, SHA, ator |
| CI passou/falhou | GitHub Actions Log + PR Status | Jobs, duração, resultado |
| Deploy concluído | GitHub Actions Log + Vercel | Deployment ID, URL, timestamp |
| Migration aplicada | `shared.audit_log` SGTI | Migration name, applied_at, executor=CI |
| Rollback executado | `shared.audit_log` SGTI | Motivo, versão anterior, executor |
| Release criada | GitHub Releases | Versão, changelog, SHA |
| Smoke tests | GitHub Actions Log | Endpoints testados, resultado |

### 10.2 Rastreabilidade Completa de Deploy

Para qualquer versão em produção é possível responder:

| Pergunta | Onde Encontrar |
|:--------:|:--------------:|
| Qual SHA está em produção? | `GET /api/version` ou Vercel Dashboard |
| Quem aprovou o deploy? | GitHub PR → Reviewers |
| Quais commits estão nesse deploy? | GitHub Release → commits |
| Quais migrations foram aplicadas? | `shared.audit_log` + GitHub PR labels |
| Os testes passaram? | GitHub Actions Log do workflow |
| Houve rollback? | `shared.audit_log` action=PRODUCTION_ROLLBACK |

### 10.3 Retenção de Logs do CI

| Tipo de Log | Retenção GitHub | Ação Adicional |
|:-----------:|:---------------:|:--------------:|
| Workflow logs | 90 dias (padrão) | IT_MANAGER arquiva logs de deploys de produção |
| Artefatos de build | 30 dias | Limpeza automática |
| Coverage reports | 30 dias | Tendência salva no PR comment |
| Security scan results | 90 dias | Findings críticos arquivados |

---

## 11. Monitoramento do CI/CD

### 11.1 Métricas do Pipeline

O IT_MANAGER acompanha estas métricas mensalmente:

| Métrica | Meta | Onde Medir |
|:-------:|:----:|:----------:|
| Duração média do CI-FULL | ≤ 5 minutos | GitHub Actions → Insights |
| Taxa de sucesso dos deploys | ≥ 99% | GitHub Actions → Insights |
| Número de rollbacks no mês | 0 | `shared.audit_log` + Actions |
| Taxa de falha por etapa (lint/test/build) | ≤ 5% por etapa | GitHub Actions → Insights |
| Uso de minutos do GitHub Actions | ≤ 1.800/2.000 free | GitHub → Settings → Billing |

### 11.2 Alertas de Falha do Pipeline

Falhas no pipeline são comunicadas via:

| Evento | Canal | Destinatário |
|:------:|:-----:|:------------:|
| CI-FULL falhou em PR | Comentário no PR + e-mail | Autor do PR |
| Deploy dev falhou | Comentário no commit + e-mail | Autor do merge |
| Deploy staging falhou | E-mail | Autor + IT_MANAGER |
| Deploy produção falhou | E-mail urgente + in-app | IT_MANAGER |
| Smoke tests falharam | E-mail urgente + in-app | IT_MANAGER |
| Security scan encontrou HIGH/CRITICAL | E-mail | IT_MANAGER + Autor |

### 11.3 Status Badge no README

O repositório exibe o status atual do pipeline no README:

```markdown
# SGTI

![CI Status](https://github.com/org/sgti/actions/workflows/ci-full.yml/badge.svg?branch=main)
![Deploy Status](https://github.com/org/sgti/actions/workflows/deploy-production.yml/badge.svg)
```

---

## 12. Segurança no CI/CD

### 12.1 Prevenção de Execução Maliciosa

| Ameaça | Mitigação |
|:------:|:---------:|
| **Script injection em PR** | `github.event.pull_request.title` sanitizado com aspas duplas; preferir `${{ inputs.value }}` a `${{ github.event.xxx }}` em run steps |
| **Secrets em forks** | PRs de forks usam `pull_request` trigger (sem acesso a secrets); `pull_request_target` usado apenas quando necessário e com verificações |
| **Dependências maliciosas (supply chain)** | `npm audit` no CI; `package-lock.json` commitado; Dependabot ativo |
| **Comprometimento de Action de terceiro** | Versões de Actions fixadas com SHA completo (não `@v4`, mas `@{sha}`) |
| **Token GITHUB_TOKEN com excesso de permissão** | Permissões mínimas declaradas explicitamente em cada workflow |

### 12.2 Permissões Mínimas nos Workflows

Todo workflow declara explicitamente as permissões necessárias:

```
PERMISSÕES POR WORKFLOW

ci-full.yml:
  permissions:
    contents: read         ← Checkout do código
    pull-requests: write   ← Comentar no PR
    security-events: write ← Upload de resultados CodeQL
    checks: write          ← Atualizar status checks

deploy-production.yml:
  permissions:
    contents: write        ← Criar tags e releases
    deployments: write     ← Registrar deployment no GitHub
    id-token: write        ← OIDC para autenticação Vercel

security-scan.yml:
  permissions:
    contents: read
    security-events: write ← Upload de SARIF para CodeQL
```

### 12.3 OIDC para Autenticação Vercel

Em vez de usar token de longa duração, o pipeline usa **OIDC (OpenID Connect)** para autenticar com a Vercel:

```
AUTENTICAÇÃO OIDC VERCEL

1. GitHub Actions gera token OIDC efêmero para o job
2. Vercel valida o token OIDC contra o repositório GitHub
3. Sem necessidade de armazenar token de longa duração no GitHub Secrets
4. Token expira automaticamente ao fim do job
5. Cada deploy gera um token único e rastreável
```

### 12.4 Verificação de Integridade das Actions Usadas

Todas as GitHub Actions de terceiros são fixadas por SHA completo:

```
PADRÃO SEGURO (com SHA fixo):
  uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2

PADRÃO INSEGURO (evitar):
  uses: actions/checkout@v4  # pode mudar sem controle
  uses: actions/checkout@main  # perigoso
```

O SHA é verificado via processo de avaliação manual quando uma Action é adicionada ou atualizada.

### 12.5 Scan de Segurança Semanal

**Arquivo:** `security-scan.yml`  
**Gatilho:** Cron semanal (domingo 02h00)

```
PIPELINE: security-scan.yml

1. Checkout código
2. npm audit --audit-level=moderate
   → Se HIGH/CRITICAL: abrir issue automática + notificar IT_MANAGER
3. Dependabot check: verificar se há PRs de segurança pendentes
4. CodeQL analyze (análise mais profunda do que no ci-full)
5. Trivy scan: verificar vulnerabilidades em imagens Docker (se usado no futuro)
6. gitleaks: scan completo do histórico (não apenas commits novos)
7. Gerar relatório de segurança e anexar como artefato
8. Se findings HIGH/CRITICAL: notificar IT_MANAGER por e-mail
```

---

## 13. Critérios de Aceitação

### 13.1 Pipelines Básicos

- [ ] **CA-01:** `ci-full` passa completamente em uma branch limpa (sem alterações de código).
- [ ] **CA-02:** `ci-quick` completa em ≤ 2 minutos em uma feature branch típica.
- [ ] **CA-03:** `ci-full` completa em ≤ 5 minutos.
- [ ] **CA-04:** Merge para `main` bloqueado automaticamente se qualquer step do `ci-full` falhar.
- [ ] **CA-05:** Merge para `main` bloqueado sem 2 aprovações de reviewers distintos.

### 13.2 Deploy Automático

- [ ] **CA-06:** Merge em `develop` dispara deploy automático para dev em ≤ 4 minutos.
- [ ] **CA-07:** Merge em `staging` dispara deploy automático para homologação com migrations.
- [ ] **CA-08:** Merge em `main` dispara deploy automático para produção.
- [ ] **CA-09:** Smoke tests executados automaticamente após deploy de produção.
- [ ] **CA-10:** Rollback automático disparado se smoke tests falharem pós-deploy.
- [ ] **CA-11:** Deploy com migration em produção aguarda aprovação manual do IT_MANAGER (environment protection).

### 13.3 Preview Deployments

- [ ] **CA-12:** PR aberto gera preview URL comentada automaticamente no PR em ≤ 3 minutos.
- [ ] **CA-13:** Preview URL usa variáveis de ambiente do ambiente de desenvolvimento.
- [ ] **CA-14:** Preview deployment expirado após PR mergeado/fechado.

### 13.4 Segredos e Segurança

- [ ] **CA-15:** Nenhum segredo visível em logs do GitHub Actions (todos mascarados com `***`).
- [ ] **CA-16:** Scan de secrets (gitleaks) bloqueia o pipeline ao detectar credencial no código.
- [ ] **CA-17:** `npm audit --audit-level=high` bloqueia CI se encontrar vulnerabilidade HIGH/CRITICAL.
- [ ] **CA-18:** CodeQL scan executa em todo PR para `main` e bloqueia se finding HIGH/CRITICAL.
- [ ] **CA-19:** PRs de forks não têm acesso a secrets de produção.

### 13.5 Versionamento e Releases

- [ ] **CA-20:** Tag Git criada automaticamente após deploy de produção bem-sucedido.
- [ ] **CA-21:** GitHub Release criado automaticamente com changelog gerado dos commits.
- [ ] **CA-22:** Versão exibida em `/api/version` corresponde à tag do deploy atual.
- [ ] **CA-23:** Commit sem mensagem no padrão Conventional Commits é rejeitado pelo CI.

### 13.6 Auditoria e Notificações

- [ ] **CA-24:** IT_MANAGER recebe e-mail a cada deploy bem-sucedido de produção.
- [ ] **CA-25:** IT_MANAGER recebe alerta urgente se smoke tests falharem.
- [ ] **CA-26:** `shared.audit_log` registra cada deploy de produção com SHA, versão e timestamp.
- [ ] **CA-27:** Rollback executado (automático ou manual) registrado no `shared.audit_log`.

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação com 13 seções e 27 critérios de aceitação |

---

> **Documentos relacionados:**
> [`70_DEPLOYMENT.md`](./70_DEPLOYMENT.md) — Estratégia geral de deploy e ambientes
> [`71_SUPABASE.md`](./71_SUPABASE.md) — Arquitetura Supabase (banco, auth, storage)
> [`20_DATABASE.md`](./20_DATABASE.md) — Modelo de dados (migrations)
> [`50_INTEGRATIONS.md`](./50_INTEGRATIONS.md) — Integrações externas
