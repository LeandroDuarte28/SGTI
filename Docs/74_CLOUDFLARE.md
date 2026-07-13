# SGTI — Sistema de Gestão de Tecnologia da Informação
## Arquitetura Cloudflare — DNS, CDN, Segurança e Proteção — Documentação Técnica

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [70_DEPLOYMENT.md](./70_DEPLOYMENT.md) · [71_SUPABASE.md](./71_SUPABASE.md) · [72_GITHUB_ACTIONS.md](./72_GITHUB_ACTIONS.md) · [73_VERCEL.md](./73_VERCEL.md) · [50_INTEGRATIONS.md](./50_INTEGRATIONS.md)

---

## Sobre este Documento

Este documento define a **arquitetura oficial do Cloudflare no SGTI**, cobrindo DNS, SSL/TLS, CDN, WAF, segurança, performance, monitoramento e estratégias de contingência e disaster recovery.

**Premissa obrigatória:** Utilizar preferencialmente recursos gratuitos do Cloudflare (plano Free), migrando para planos pagos apenas quando os limites ou funcionalidades exigirem.

---

## Stack e Posicionamento do Cloudflare

| Tecnologia | Papel no SGTI |
|:----------:|:-------------|
| **Cloudflare** | DNS autoritativo, CDN, WAF, DDoS, rate limiting, SSL/TLS |
| **Vercel** | Hospedagem do frontend Next.js (origem dos dados) |
| **Supabase** | Backend-as-a-service (banco, auth, storage, realtime) |
| **GitHub/Actions** | Versionamento e CI/CD (sem envolvimento do Cloudflare) |

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura](#2-arquitetura)
3. [DNS](#3-dns)
4. [SSL/TLS](#4-ssltls)
5. [CDN e Cache](#5-cdn-e-cache)
6. [Segurança](#6-segurança)
7. [Headers de Segurança](#7-headers-de-segurança)
8. [Performance](#8-performance)
9. [Integração com Vercel](#9-integração-com-vercel)
10. [Integração com Supabase](#10-integração-com-supabase)
11. [Monitoramento](#11-monitoramento)
12. [Logs](#12-logs)
13. [Alertas](#13-alertas)
14. [Auditoria](#14-auditoria)
15. [Custos](#15-custos)
16. [Limitações do Plano Gratuito](#16-limitações-do-plano-gratuito)
17. [Estratégia de Crescimento](#17-estratégia-de-crescimento)
18. [Plano de Contingência](#18-plano-de-contingência)
19. [Disaster Recovery](#19-disaster-recovery)
20. [Critérios de Aceitação](#20-critérios-de-aceitação)

---

## 1. Visão Geral

### 1.1 Por que Cloudflare no SGTI

| Critério | Justificativa |
|:--------:|:-------------|
| **DNS autoritativo gratuito** | DNS de alta performance e disponibilidade global sem custo |
| **CDN global** | 300+ PoPs (Points of Presence) — assets chegam mais rápido aos usuários brasileiros |
| **WAF sem custo** | OWASP Core Rule Set gratuito no plano Free |
| **DDoS mitigation** | Proteção automática contra ataques volumétricos sem configuração |
| **SSL/TLS automático** | Certificados gratuitos com renovação automática |
| **Ocultar IP de origem** | Vercel fica invisível; usuários maliciosos não encontram a origem |
| **Bot Protection** | Bloqueio automático de bots maliciosos (Bot Fight Mode) |
| **Rate Limiting** | Proteção contra abuso de API (5 regras gratuitas no Free) |

### 1.2 O que o Cloudflare Faz e Não Faz no SGTI

| Função | Cloudflare | Alternativa |
|:------:|:----------:|:-----------:|
| DNS autoritativo | ✅ Principal | — |
| CDN para assets estáticos | ✅ Principal | Vercel Edge Network (complementar) |
| WAF (Web Application Firewall) | ✅ Principal | — |
| DDoS Protection | ✅ Principal | — |
| SSL/TLS (usuário → Cloudflare) | ✅ Principal | — |
| SSL/TLS (Cloudflare → Vercel) | ✅ Valida certificado Vercel | Vercel (emite) |
| Compressão Brotli | ✅ Principal | Vercel (Gzip como fallback) |
| Execução de código (Workers) | ❌ Não usado | Vercel Edge Functions |
| Roteamento de banco de dados | ❌ Não passa pelo Cloudflare | Supabase direto |
| WebSocket Realtime | ❌ Não proxia WebSocket estável | Supabase direto |

---

## 2. Arquitetura

### 2.1 Diagrama de Fluxo Completo

```
ARQUITETURA CLOUDFLARE NO SGTI

USUÁRIO FINAL (Browser)
         │
         │ DNS Query: sgti.empresa.com.br
         ▼
CLOUDFLARE DNS (Autoritativo)
         │ Resolve para IP do Cloudflare (não da Vercel)
         │ IP de origem da Vercel: OCULTO
         │
         ▼
CLOUDFLARE EDGE (PoP mais próximo do usuário)
         │
         ├── Verificações de Segurança:
         │   ├── DDoS detection & mitigation (automático)
         │   ├── Bot Fight Mode (bloqueia bots maliciosos)
         │   ├── IP Reputation (bloqueia IPs em lista negra)
         │   ├── WAF Rules (OWASP CRS + regras customizadas)
         │   ├── Rate Limiting (endpoints críticos)
         │   └── Geo-blocking (se configurado)
         │
         ├── Cache Check:
         │   ├── Asset estático com hash? → SERVE DO CACHE (sem chegar na Vercel)
         │   ├── Asset cacheável sem hash? → VERIFICA SE EXPIROU
         │   └── Página dinâmica / API? → PASSA PARA VERCEL (bypass cache)
         │
         ├── SSL/TLS Termination:
         │   ├── Usuário → Cloudflare: TLS 1.3 (certificado Cloudflare)
         │   └── Cloudflare → Vercel: TLS 1.3 (valida certificado Vercel)
         │
         └── Headers de Segurança adicionados:
             ├── Strict-Transport-Security
             ├── X-Frame-Options
             ├── X-Content-Type-Options
             └── Referrer-Policy

         │ (Se não cacheado e passou nas verificações)
         ▼
VERCEL (Origem — IP oculto pelo Cloudflare)
         │ Headers adicionados:
         │   ├── CF-Connecting-IP: IP real do usuário
         │   ├── CF-IPCountry: País do usuário
         │   └── CF-Ray: ID único da request no Cloudflare
         │
         ▼
NEXT.JS (Frontend + API Routes)
         │
         ├── Server Components → renderiza HTML
         ├── API Routes → acessa Supabase PostgreSQL
         └── Static Assets → servidos via Vercel CDN
                              (já foram cacheados pelo Cloudflare na segunda request)

         │ (Conexões diretas — NÃO passam pelo Cloudflare)
         │
SUPABASE (Conexão direta do browser):
  ├── Supabase Auth: browser → auth.supabase.co (direto)
  ├── Supabase Storage: browser → storage.supabase.co (direto)
  └── Supabase Realtime: browser → wss://[ref].supabase.co (WebSocket direto)
```

### 2.2 Camadas de Proteção do Cloudflare

```
ORDEM DE PROCESSAMENTO DE UMA REQUEST NO CLOUDFLARE

1. DDoS Detection (automático, sempre ativo)
   → Request volumétrica? Bloquear/desafiar
   
2. IP Reputation Check
   → IP em lista negra conhecida? Bloquear/desafiar
   
3. Bot Fight Mode
   → Comportamento de bot? Bloquear/CAPTCHA

4. Rate Limiting Rules
   → Excedeu limite por endpoint? 429 Too Many Requests

5. WAF Rules (OWASP CRS)
   → SQL Injection? XSS? Path Traversal? Bloquear

6. Custom Rules (regras do SGTI)
   → Método não permitido? Bloquear
   → Payload suspeito? Bloquear

7. Cache Check
   → Cacheável? Servir do cache (fim)
   → Não cacheável? Encaminhar para Vercel

8. Origin Request (Vercel)
   → Adicionar headers Cloudflare
   → Aguardar resposta

9. Response Processing
   → Adicionar headers de segurança
   → Cache da resposta se aplicável
   → Entregar ao usuário
```

---

## 3. DNS

### 3.1 Estrutura de DNS do SGTI

O domínio `empresa.com.br` (substituir pelo domínio real) é gerenciado pelo Cloudflare como DNS autoritativo.

| Registro | Tipo | Nome | Valor | Proxy (TTL) | Ambiente |
|:--------:|:----:|:----:|:-----:|:-----------:|:--------:|
| Frontend prod | CNAME | `sgti` | `cname.vercel-dns.com` | ✅ Proxy ativo | Produção |
| Frontend homolog | CNAME | `homolog.sgti` | `cname.vercel-dns.com` | ✅ Proxy ativo | Homologação |
| Frontend dev | CNAME | `dev.sgti` | `cname.vercel-dns.com` | 🔘 DNS only | Desenvolvimento |
| E-mail | MX | `@` | Google Workspace MX | — | Corporativo |
| SPF | TXT | `@` | `v=spf1 include:_spf.google.com ~all` | — | E-mail |
| DKIM | TXT | `google._domainkey` | Google Workspace DKIM | — | E-mail |
| DMARC | TXT | `_dmarc` | `v=DMARC1; p=quarantine; ...` | — | E-mail |
| Verificação Google | TXT | `@` | `google-site-verification=...` | — | Google Workspace |

### 3.2 Diferença entre Proxy Ativo (🟠) e DNS Only (⚪)

| Modo | Ícone | Comportamento | Quando Usar |
|:----:|:-----:|:-------------|:-----------:|
| **Proxy Ativo** | 🟠 Nuvem laranja | Tráfego passa pelo Cloudflare; IP de origem oculto; WAF e CDN ativos | Produção e homologação |
| **DNS Only** | ⚪ Nuvem cinza | DNS apenas; tráfego vai diretamente à origem; sem WAF ou CDN | Desenvolvimento (agilidade) |

### 3.3 TTL e Propagação

| Tipo | TTL em Proxy Mode | TTL em DNS Only |
|:----:|:-----------------:|:---------------:|
| Registros com proxy ativo | Automático (Cloudflare define ~300s) | N/A |
| Registros DNS Only | Configurável (mínimo 60s no free) | Configurável |

**Propagação global:** Com Cloudflare como DNS autoritativo, alterações de registro se propagam em segundos (TTL controlado pelo Cloudflare, sem depender dos 24–48h tradicionais).

### 3.4 Proteção de Registro de Domínio

| Proteção | Status |
|:--------:|:------:|
| DNSSEC | ✅ Habilitado (Cloudflare assina o DNS) |
| Registry Lock | Configurar no registrador do domínio |
| Transfer Lock | Configurar no registrador do domínio |
| Renovação automática | Configurar no registrador do domínio |

---

## 4. SSL/TLS

### 4.1 Modo SSL/TLS Recomendado: Full (Strict)

```
MODOS SSL/TLS DO CLOUDFLARE

Flexível:
  Usuário → HTTPS → Cloudflare → HTTP → Origem
  ❌ NÃO USAR: tráfego não criptografado entre Cloudflare e Vercel

Full:
  Usuário → HTTPS → Cloudflare → HTTPS → Origem (certificado auto-assinado aceito)
  ⚠️ Não valida certificado da origem

Full (Strict): ← ESTE É O MODO CORRETO
  Usuário → HTTPS → Cloudflare → HTTPS → Origem (certificado válido obrigatório)
  ✅ Vercel emite certificado Let's Encrypt válido — este modo é seguro
  ✅ Previne ataques MITM entre Cloudflare e Vercel

```

**Configuração:** Dashboard Cloudflare → SSL/TLS → Overview → **Full (strict)**.

### 4.2 Certificados Cloudflare

| Certificado | Tipo | Renovação | Onde Usado |
|:-----------:|:----:|:---------:|:----------:|
| **Universal SSL** | Wildcard `*.empresa.com.br` | Automática (Cloudflare) | Usuário → Cloudflare |
| **Vercel Managed Cert** | `sgti.empresa.com.br` (Let's Encrypt) | Automática (Vercel) | Cloudflare → Vercel |

O Cloudflare emite automaticamente o certificado Universal SSL para o domínio. Não é necessário adquirir ou renovar manualmente.

### 4.3 Configurações SSL/TLS

| Configuração | Valor | Justificativa |
|:------------:|:-----:|:-------------:|
| **TLS mínimo** | TLS 1.2 (recomendado: TLS 1.3) | TLS 1.0 e 1.1 têm vulnerabilidades conhecidas |
| **TLS máximo** | TLS 1.3 | Versão mais segura e performática |
| **HSTS** | Habilitado | `max-age=63072000; includeSubDomains; preload` |
| **HSTS Preload** | Sim (submeter ao HSTS Preload List) | Browser nunca tenta HTTP |
| **Automatic HTTPS Rewrites** | ✅ Habilitado | Converte links HTTP mistos para HTTPS |
| **Always Use HTTPS** | ✅ Habilitado | Redireciona HTTP → HTTPS com 301 |
| **Opportunistic Encryption** | ✅ Habilitado | Anuncia HTTPS via DNS |
| **Cipher Suites** | Padrão Cloudflare (moderno) | Apenas suites seguras habilitadas |

### 4.4 HSTS (HTTP Strict Transport Security)

```
HSTS HEADER (configurado via Cloudflare):

Strict-Transport-Security:
  max-age=63072000;   ← 2 anos em segundos
  includeSubDomains;  ← Aplica a todos os subdomínios
  preload             ← Permite submissão ao HSTS Preload List

SIGNIFICADO:
  Browser que visitou o site memoriza: "SEMPRE usar HTTPS por 2 anos"
  Mesmo se o usuário digitar http://, o browser usa HTTPS diretamente
  (sem nem fazer o request HTTP — proteção total contra downgrade attacks)
```

---

## 5. CDN e Cache

### 5.1 Como o Cache do Cloudflare Funciona

O Cloudflare serve assets do PoP (Point of Presence) mais próximo ao usuário, sem precisar chegar à Vercel:

```
FLUXO DE CACHE

PRIMEIRA REQUEST (cache miss):
Usuário BR → Cloudflare PoP São Paulo → MISS → Vercel (EUA/São Paulo)
  → Vercel responde com arquivo
  → Cloudflare armazena no PoP de São Paulo
  → Entrega ao usuário (latência: ~200ms)

SEGUNDA REQUEST (cache hit):
Usuário BR → Cloudflare PoP São Paulo → HIT → resposta instantânea
  → Não chega à Vercel
  → Entrega ao usuário (latência: ~5ms)
```

### 5.2 Regras de Cache por Tipo de Conteúdo

| Tipo de Conteúdo | Cache no Cloudflare | Cache-Control Esperado | Exemplo |
|:----------------:|:-------------------:|:----------------------:|---------|
| **JS/CSS com hash no nome** | ✅ 1 ano | `public, max-age=31536000, immutable` | `/_next/static/chunks/main-abc123.js` |
| **Imagens otimizadas next/image** | ✅ 1 dia | `public, max-age=86400` | `/_next/image?url=...` |
| **Fonts** | ✅ 1 ano | `public, max-age=31536000` | Google Fonts |
| **Assets públicos (/public/)** | ✅ Configurável | Conforme `Cache-Control` da Vercel | `/icons/logo.svg` |
| **Páginas HTML (SSR)** | ❌ Bypass | `no-store, no-cache` | `/dashboard`, `/incidents/*` |
| **API Routes (/api/)** | ❌ Bypass | `no-store` | `/api/incidents`, `/api/health` |
| **Auth endpoints** | ❌ Bypass + Sem cache | `private, no-cache` | `/api/auth/*` |

### 5.3 Page Rules de Cache (Free: 3 regras)

As 3 Page Rules gratuitas são usadas para casos especiais:

| Regra | URL Pattern | Configuração | Prioridade |
|:-----:|:-----------:|:------------:|:----------:|
| 1 | `sgti.empresa.com.br/_next/static/*` | Cache Level: Cache Everything, Edge TTL: 1 year | Alta |
| 2 | `sgti.empresa.com.br/api/*` | Cache Level: Bypass, Security Level: High | Alta |
| 3 | `sgti.empresa.com.br/auth/*` | Cache Level: Bypass, Security Level: High | Alta |

**Nota:** Com apenas 3 Page Rules no plano Free, priorizar as regras de maior impacto. Expandir para Cache Rules (plano Pro) quando necessário.

### 5.4 Tiered Cache

O Cloudflare usa Tiered Cache automaticamente: assets são cacheados em datacenters "Upper Tier" (regiões maiores) antes de ir à origem. Isso reduz requisições à Vercel mesmo quando um PoP pequeno não tem o asset.

### 5.5 Cache para Conteúdo Dinâmico

Conteúdo dinâmico (páginas do SGTI que dependem do usuário) **não é cacheado** no Cloudflare:
- Todas as páginas protegidas por autenticação têm `Cache-Control: private, no-store`.
- O Cloudflare identifica esses headers e não armazena o conteúdo.
- Isso garante que um usuário nunca veja dados de outro usuário via cache.

---

## 6. Segurança

### 6.1 WAF — Web Application Firewall

**Plano Free:** OWASP Core Rule Set + regras gerenciadas básicas da Cloudflare.

```
WAF DO CLOUDFLARE — CONFIGURAÇÃO SGTI

Managed Rules (Cloudflare Free):
  ✅ Cloudflare Managed Ruleset
  ✅ OWASP Core Rule Set

Modo de ação:
  Produção: BLOCK (bloqueia imediatamente)
  Homologação: SIMULATE (registra, não bloqueia) ← útil durante testes

Proteções principais do OWASP CRS:
  → SQL Injection (SELECT, INSERT, DROP, UNION)
  → Cross-Site Scripting (XSS) — injeção de scripts
  → Path Traversal (../../etc/passwd)
  → Remote File Inclusion
  → Command Injection
  → HTTP Protocol Violations
  → Malicious Bots (scanners conhecidos)
```

### 6.2 Regras WAF Customizadas (Free: 5 regras)

As 5 regras customizadas gratuitas são usadas estrategicamente:

| Regra | Condição | Ação | Justificativa |
|:-----:|:--------:|:----:|:-------------:|
| 1 | Método != GET\|POST\|OPTIONS\|HEAD para `/api/*` | BLOCK | Bloqueia métodos não utilizados (TRACE, CONNECT, etc.) |
| 2 | `cf.threat_score > 30` | CHALLENGE | IPs com reputação suspeita devem resolver CAPTCHA |
| 3 | URI contém `../` ou `..%2F` | BLOCK | Path traversal explícito |
| 4 | User-Agent = vazio para `/api/*` | BLOCK | Bots simples sem User-Agent |
| 5 | ASN de país não esperado + `/api/auth/*` | CHALLENGE | Login de países sem histórico no SGTI |

### 6.3 Rate Limiting (Free: 1 regra)

```
RATE LIMITING — CONFIGURAÇÃO SGTI

Regra 1 (única gratuita): Endpoints de autenticação
  URL Pattern: sgti.empresa.com.br/api/auth/*
  Threshold: 10 requests por 1 minuto por IP
  Action: BLOCK por 10 minutos
  Justificativa: Previne brute force em login e refresh token

Rate Limiting adicional (via WAF Custom Rule — sem custo extra):
  Usar threshold no WAF como alternativa:
  Condição: requests > 100/min do mesmo IP para qualquer rota
  Ação: CHALLENGE (CAPTCHA)
```

### 6.4 Bot Protection

```
BOT FIGHT MODE (gratuito no plano Free):
  ✅ Habilitado em produção
  
  O que faz:
  → Detecta bots conhecidos (scrapers, scanners, spiders maliciosos)
  → Serve "honeypot" ou CAPTCHA em vez de bloquear diretamente
  → Não afeta bots legítimos (Google, Bing, etc.)
  → Penaliza IPs que completam o honeypot automaticamente

Super Bot Fight Mode (plano Pro+):
  Não disponível no free — Bot Fight Mode básico é suficiente inicialmente

Bots legítimos que não devem ser bloqueados:
  → Google Search (Googlebot)
  → Bing (bingbot)
  → Vercel deployment bots (durante CI/CD)
  → UptimeRobot (monitoramento)
```

### 6.5 DDoS Protection

```
PROTEÇÃO DDOS — AUTOMÁTICA E GRATUITA

Camadas de proteção:
  L3/L4 (Network Layer): Proteção volumétrica — absorve ataques UDP/TCP flood
  L7 (Application Layer): Cloudflare detecta padrões anômalos de requests HTTP

Capacidade: Cloudflare tem capacidade de rede de ~321 Tbps
  → Qualquer DDoS realista é absorvido sem impacto para o SGTI

Modo Under Attack (ativação manual):
  Se o SGTI sofrer ataque direcionado:
  1. Dashboard → Overview → Security Level: "Under Attack"
  2. TODOS os visitantes recebem challenge JavaScript (5s de delay)
  3. Bots sem JS são bloqueados automaticamente
  4. Após cessar o ataque: voltar para Security Level "Medium"
```

### 6.6 IP Reputation e Geo-blocking

```
IP REPUTATION (automático no Free):
  Cloudflare mantém banco de dados de IPs maliciosos
  IPs com threat score alto recebem CHALLENGE automaticamente
  Configurável: Security Level (Low / Medium / High / Under Attack)
  Recomendado para SGTI: "Medium"

GEO-BLOCKING (opcional — via WAF Custom Rule):
  O SGTI é uma plataforma corporativa brasileira
  Opção: bloquear requests de países sem histórico de usuários
  Implementação: WAF Custom Rule com cf.ip.geoip.country
  Exceção: IPs do time de TI devem estar na allowlist
  
  ATENÇÃO: Usar com cautela — bloquear países pode afetar VPNs/viagens
  Recomendação: Apenas CHALLENGE (CAPTCHA), nunca BLOCK total por país
```

---

## 7. Headers de Segurança

### 7.1 Headers Adicionados pelo Cloudflare

O Cloudflare adiciona automaticamente alguns headers e permite configurar outros:

```
HEADERS AUTOMÁTICOS DO CLOUDFLARE (toda response):

CF-Ray: 8a9b7c6d5e4f3a2b-GRU
  → ID único da request para diagnóstico

Server: cloudflare
  → Oculta o servidor de origem (Vercel não aparece)
```

### 7.2 Headers de Segurança via Transform Rules

O Cloudflare permite adicionar headers via **Transform Rules** (Response Headers):

**Configuração no Dashboard:** Security → Transform Rules → Modify Response Header

```
HEADERS DE SEGURANÇA VIA CLOUDFLARE TRANSFORM RULES

Strict-Transport-Security:
  Valor: max-age=63072000; includeSubDomains; preload
  Quando: Todas as responses do domínio sgti.empresa.com.br
  Ação: Set (sobrescreve se existir)

X-Frame-Options:
  Valor: SAMEORIGIN
  Quando: Todas as responses HTML
  Ação: Set

X-Content-Type-Options:
  Valor: nosniff
  Quando: Todas as responses
  Ação: Set

Referrer-Policy:
  Valor: strict-origin-when-cross-origin
  Quando: Todas as responses
  Ação: Set

Permissions-Policy:
  Valor: camera=(), microphone=(), geolocation=(), payment=()
  Quando: Todas as responses HTML
  Ação: Set
```

### 7.3 Content Security Policy (CSP)

O CSP é configurado pelo Next.js (via `next.config.js`) e não pelo Cloudflare, pois precisa de valores dinâmicos (nonces):

```
Content-Security-Policy (configurado no Next.js):

default-src 'self';

script-src 'self' 'unsafe-inline' 'unsafe-eval'
  https://vercel.com
  https://cdn.vercel-insights.com;

style-src 'self' 'unsafe-inline'
  https://fonts.googleapis.com;

font-src 'self' data:
  https://fonts.gstatic.com;

img-src 'self' data: blob:
  https://*.supabase.co
  https://lh3.googleusercontent.com;

connect-src 'self'
  https://*.supabase.co
  wss://*.supabase.co
  https://accounts.google.com
  https://cdn.vercel-insights.com;

frame-ancestors 'none';
form-action 'self';
base-uri 'self';
upgrade-insecure-requests;

NOTA IMPORTANTE:
  O Cloudflare NÃO deve sobrescrever o CSP definido pelo Next.js.
  Usar modo "Add" (não "Set") nas Transform Rules para CSP.
  Se o Cloudflare definir CSP e o Next.js também, podem conflitar.
  Solução: definir CSP apenas no Next.js; Cloudflare não toca no CSP.
```

### 7.4 Verificação de Headers com Security Headers

Após o deploy, verificar os headers em:
- `securityheaders.com` — análise completa dos headers de segurança.
- `observatory.mozilla.org` — avaliação Mozilla de segurança.

**Meta:** Nota A ou A+ em ambas as ferramentas.

---

## 8. Performance

### 8.1 Compressão Brotli

O Cloudflare usa **Brotli** como algoritmo de compressão principal (melhor que Gzip):

| Arquivo | Tamanho Original | Após Gzip | Após Brotli | Economia |
|:-------:|:----------------:|:---------:|:-----------:|:--------:|
| HTML típico | 100 KB | 35 KB | 28 KB | 72% |
| JavaScript bundle | 500 KB | 175 KB | 140 KB | 72% |
| CSS | 50 KB | 15 KB | 12 KB | 76% |

**Configuração:** Cloudflare → Speed → Optimization → Compression → Brotli: ON.

### 8.2 Minificação

O Cloudflare pode minificar HTML, CSS e JavaScript na borda:

| Tipo | Minificação Cloudflare | Minificação Next.js |
|:----:|:----------------------:|:-------------------:|
| JavaScript | ✅ Habilitado (Cloudflare) | ✅ Habilitado (build) |
| CSS | ✅ Habilitado (Cloudflare) | ✅ Habilitado (build) |
| HTML | ✅ Habilitado (Cloudflare) | Parcial |

**Observação:** Como o Next.js já minifica JS e CSS no build, a minificação do Cloudflare é complementar (principalmente para HTML).

### 8.3 Early Hints (HTTP 103)

O Cloudflare suporta **Early Hints** (HTTP 103), que permite ao browser iniciar o download de recursos críticos antes de receber o HTML completo:

```
Early Hints envia antes do HTML:
  Link: </_next/static/css/main.css>; rel=preload; as=style
  Link: </_next/static/chunks/main.js>; rel=preload; as=script

Resultado: browser carrega CSS e JS em paralelo com o HTML
→ Melhora LCP e FCP consideravelmente
```

**Configuração:** Cloudflare → Speed → Optimization → Early Hints: ON.

### 8.4 HTTP/2 e HTTP/3 (QUIC)

| Protocolo | Status | Benefício |
|:---------:|:------:|:---------:|
| **HTTP/2** | ✅ Automático | Multiplexação de requests; sem head-of-line blocking |
| **HTTP/3 (QUIC)** | ✅ Habilitado | Menor latência em redes congestionadas; 0-RTT reconnect |

O Cloudflare anuncia HTTP/3 para todos os clientes que suportam. O browser negocia automaticamente o melhor protocolo.

### 8.5 Polish — Otimização de Imagens

```
CLOUDFLARE POLISH (FREE):
  ✅ Disponível no plano Free (diferente do Image Resizing que é Pro)

Modos:
  Lossless: Remove metadados EXIF sem afetar qualidade visual
  Lossy: Comprime imagens com perda mínima de qualidade

Recomendação SGTI:
  Usar Lossless para imagens de evidências de compliance (fidelidade importante)
  Usar Lossy para assets de interface (avatares, ícones)

NOTA: Next.js Image Optimization já otimiza imagens para WebP/AVIF.
      Polish complementa removendo metadados das imagens que passam pelo Cloudflare.
```

### 8.6 Rocket Loader (Usar com Cautela)

```
ROCKET LOADER (Cloudflare):
  O que faz: Adia carregamento de JavaScript para após o conteúdo visível
  Potencial problema: Pode conflitar com Next.js App Router
  
  Recomendação: DESABILITADO para o SGTI
  Razão: Next.js já tem otimização de carregamento de scripts integrada.
         Rocket Loader pode causar comportamentos inesperados com React Hydration.
```

---

## 9. Integração com Vercel

### 9.1 Configuração de Domínio Customizado

```
CONFIGURAÇÃO VERCEL + CLOUDFLARE (passo a passo)

Na Vercel:
1. Acessar projeto → Settings → Domains
2. Adicionar domínio: sgti.empresa.com.br
3. Vercel mostra: "Add CNAME record pointing to cname.vercel-dns.com"
4. Vercel verifica e emite certificado Let's Encrypt automaticamente

No Cloudflare:
5. Dashboard → DNS → Records → Add Record
   Tipo: CNAME
   Nome: sgti
   Valor: cname.vercel-dns.com
   Proxy: ✅ Ativo (nuvem laranja)
6. SSL/TLS → Overview → Modo: Full (strict)
7. Aguardar 2–5 minutos para propagação
```

### 9.2 Headers Propagados do Cloudflare para a Vercel

| Header | Valor | Uso na Vercel/Next.js |
|:------:|:-----:|:---------------------:|
| `CF-Connecting-IP` | IP real do usuário | Logs de auditoria, rate limiting customizado |
| `CF-IPCountry` | País (código ISO) | Alertas de acesso geográfico incomum |
| `CF-Ray` | ID único do edge | Correlação de logs Cloudflare ↔ Vercel |
| `CF-Visitor` | `{"scheme":"https"}` | Confirmar que chegou via HTTPS |
| `X-Forwarded-For` | Cadeia de IPs | O Next.js prefere `CF-Connecting-IP` |
| `X-Real-IP` | IP do proxy Cloudflare | Ignorado; usar `CF-Connecting-IP` |

**Configuração no Next.js:** O middleware lê `CF-Connecting-IP` para obter o IP real do usuário (não o IP do Cloudflare que aparece em `X-Forwarded-For`).

### 9.3 Certificado SSL no Modo Full (Strict)

Para que o modo Full (Strict) funcione, a Vercel precisa ter um certificado válido:

1. **Vercel emite automaticamente** via Let's Encrypt ao adicionar o domínio customizado.
2. O Cloudflare **valida** este certificado antes de proxiar a request.
3. Se o certificado Vercel expirar, o Cloudflare recusa a conexão (proteção automática).

**Renovação automática:** Vercel renova Let's Encrypt antes do vencimento (90 dias). Nenhuma ação manual necessária.

### 9.4 Evitar Loop Infinito de Redirecionamento

Um erro comum ao combinar Cloudflare + Vercel é o loop de redirecionamento quando ambos tentam forçar HTTPS:

```
PROBLEMA: Loop de redirecionamento

Cloudflare: HTTP → HTTPS redirect (302)
Vercel: HTTP → HTTPS redirect (301)
→ Browser entra em loop

SOLUÇÃO: Apenas o Cloudflare faz o redirect HTTP→HTTPS
  Cloudflare: "Always Use HTTPS" → ON
  Vercel: sem redirect HTTP→HTTPS (Cloudflare já faz isso)
  
  OU:
  
  Definir SSL mode no Cloudflare como Full (strict)
  → Cloudflare só envia HTTPS para a Vercel, sem conflito
```

---

## 10. Integração com Supabase

### 10.1 Tráfego Supabase NÃO Passa pelo Cloudflare

As conexões do browser para o Supabase (banco, auth, storage, realtime) são diretas e **não passam pelo proxy do Cloudflare**:

```
CONEXÕES DIRETAS (bypass Cloudflare):

Auth:     browser → https://[ref].supabase.co/auth/v1/
Storage:  browser → https://[ref].supabase.co/storage/v1/
Realtime: browser → wss://[ref].supabase.co/realtime/v1/
Rest API: browser → https://[ref].supabase.co/rest/v1/

MOTIVO: O Cloudflare é configurado apenas para o domínio empresa.com.br.
        O domínio supabase.co não está no Cloudflare do SGTI.
        
IMPLICAÇÃO: Supabase tem sua própria proteção (SSL, rate limiting).
            O WAF do Cloudflare NÃO protege as chamadas diretas ao Supabase.
```

### 10.2 Conexões via Next.js (passam pelo Cloudflare)

Quando o Next.js (rodando na Vercel) faz requisições ao Supabase, o fluxo é:

```
Server-Side Requests (passam pela Vercel, não pelo Cloudflare):
  Next.js Server → Supabase PostgreSQL (via connection string)
  (Este tráfego é interno Vercel ↔ Supabase, não exposto ao usuário)

Client-Side Requests (direto ao Supabase, sem Cloudflare):
  Browser → Supabase (sem passar pelo Cloudflare)
```

### 10.3 Domínio Personalizado para Supabase (Opcional)

Para que o tráfego Supabase passe pelo Cloudflare (WAF + DDoS):

```
SUPABASE CUSTOM DOMAIN (Plano Pro do Supabase necessário):
  api.sgti.empresa.com.br → [ref].supabase.co (via Cloudflare proxy)

BENEFÍCIOS:
  → Tráfego da API Supabase protegido pelo WAF Cloudflare
  → Mesmo domínio para frontend e backend
  → Ocultação do ID do projeto Supabase

CUSTO ADICIONAL: Supabase Pro (USD 25/mês) requerido para custom domain
DECISÃO: Deixar para fase de crescimento (v2)
```

---

## 11. Monitoramento

### 11.1 Analytics do Cloudflare

O Cloudflare Free provê analytics básicos disponíveis em tempo real:

| Métrica | Granularidade | Retenção |
|:-------:|:-------------:|:--------:|
| Requests totais | Por minuto | 24 horas |
| Requests cacheadas vs. não-cacheadas | Diária | 30 dias |
| Bandwidth economizado pelo cache | Diária | 30 dias |
| Threats blocked | Por minuto | 24 horas |
| Unique visitors | Diária | 30 dias |
| HTTP status codes | Diária | 30 dias |
| Top Countries | Diária | 30 dias |
| Top URLs | Diária | 24 horas |

### 11.2 Security Analytics

O Cloudflare Free provê visibilidade de ameaças:

| Informação | Disponível |
|:----------:|:----------:|
| WAF rules triggered | ✅ Sim |
| Blocked IPs | ✅ Sim |
| Bot traffic | ✅ Básico |
| Rate limiting events | ✅ Sim |
| Top threats por tipo | ✅ Sim |

### 11.3 Health Checks Cloudflare

O Cloudflare Free suporta Health Checks básicos para monitoramento da origem:

```
CONFIGURAÇÃO HEALTH CHECK CLOUDFLARE

Health Check 1: Frontend Principal
  URL: https://sgti.empresa.com.br/api/health
  Method: GET
  Expected status: 200
  Frequency: Every 1 minute
  Alert: E-mail ao IT_MANAGER se DOWN por 2+ verificações consecutivas

Health Check 2: API Status
  URL: https://sgti.empresa.com.br/api/health/db
  Method: GET
  Expected status: 200
  Frequency: Every 5 minutes
```

---

## 12. Logs

### 12.1 Logs Disponíveis no Plano Free

```
LIMITAÇÃO DO FREE: Logs de requests não disponíveis em tempo real no Free
  → Disponível apenas no plano Enterprise (Logpush)

ALTERNATIVAS NO FREE:
  1. Cloudflare Analytics (agregados — sem detalhes por request)
  2. Logs via Firewall Events (para requests bloqueadas pelo WAF)
  3. Cloudflare Ray ID nos logs do servidor Vercel
     (permite correlacionar request Cloudflare com log Vercel)
```

### 12.2 Firewall Events Log

O Cloudflare registra eventos de firewall (bloqueios e challenges) com detalhes:

| Campo | Descrição |
|:-----:|-----------|
| Timestamp | Data e hora do evento |
| Action | BLOCK, CHALLENGE, LOG |
| Rule ID | Qual regra foi acionada |
| IP | IP do visitante |
| Country | País de origem |
| URL | URL da request bloqueada |
| User Agent | Agente da request |
| Ray ID | ID único para correlação |

### 12.3 Estratégia de Logging com CF-Ray

O Cloudflare adiciona o header `CF-Ray` em todas as requests. Este ID é registrado nos logs do Next.js e permite correlação:

```
CORRELAÇÃO DE LOGS:

Log Cloudflare (Firewall Events):
  CF-Ray: 8abc123-GRU, IP: 1.2.3.4, Rule: OWASP-941100, Action: BLOCK

Log Vercel (Runtime Logs — se a request chegou):
  {"cf_ray": "8abc123-GRU", "route": "/api/auth", "status": 401}

Resultado: É possível rastrear uma request específica
           do Cloudflare até o servidor e ao banco de dados
```

---

## 13. Alertas

### 13.1 Alertas Configurados no Cloudflare (Free)

O plano Free suporta **notificações por e-mail** para eventos críticos:

| Evento | Alertas Disponíveis | Canal |
|:------:|:-------------------:|:-----:|
| Ataque DDoS detectado | ✅ | E-mail IT_MANAGER |
| Domínio expirado | ✅ | E-mail IT_MANAGER |
| Certificado SSL prestes a expirar | ✅ | E-mail IT_MANAGER |
| Origem offline (Health Check falhou) | ✅ | E-mail IT_MANAGER |
| Pico de tráfego anômalo | ✅ | E-mail IT_MANAGER |

### 13.2 Configuração de Alertas

```
Cloudflare Dashboard → Notifications → Add Notification

Tipo 1: Origin Health Check Alert
  Acionar quando: Health check falha 2x consecutivas
  Canal: E-mail (implantacao@pinpag.com.br)
  Urgência: Alta

Tipo 2: DDoS Attack Alert
  Acionar quando: Ataque DDoS L7 detectado
  Canal: E-mail
  Urgência: Crítica

Tipo 3: Security Events Alert (WAF)
  Acionar quando: > 100 requests bloqueadas em 5 minutos
  Canal: E-mail
  Urgência: Média
```

### 13.3 Alertas Externos (Complementares)

Além dos alertas nativos do Cloudflare:

| Ferramenta | O que Monitora | Alerta |
|:----------:|:--------------:|:------:|
| UptimeRobot (Free) | `sgti.empresa.com.br` disponível | E-mail se DOWN > 1 min |
| Cloudflare Status | Infraestrutura Cloudflare | status.cloudflare.com + E-mail |
| GitHub Actions | Falhas de deploy | E-mail ao IT_MANAGER |

---

## 14. Auditoria

### 14.1 Audit Log do Cloudflare

O Cloudflare registra todas as alterações de configuração no **Audit Log**:

| Ação | Registrada |
|:----:|:----------:|
| Adicionar/remover registro DNS | ✅ |
| Alterar configuração SSL/TLS | ✅ |
| Criar/modificar regra WAF | ✅ |
| Alterar Page Rules | ✅ |
| Modificar Rate Limiting | ✅ |
| Ativar/desativar serviços | ✅ |
| Acesso ao painel Cloudflare | ✅ |

**Retenção:** 6 meses no plano Free.

### 14.2 Quem Tem Acesso ao Painel Cloudflare

| Papel | Acesso | Permissões |
|:-----:|:------:|:----------:|
| IT_MANAGER | Administrador | Configurações completas |
| SUPER_ADMIN SGTI | Administrador | Configurações completas |
| Desenvolvedor Sênior | Membros | Somente leitura + DNS |

### 14.3 Correlação com Auditoria do SGTI

O SGTI registra em `shared.audit_log` quando alterações de infraestrutura são feitas:

- Ao alterar DNS, registrar manualmente no audit_log com `action = CLOUDFLARE_DNS_CHANGED`.
- Ao criar nova regra WAF, registrar com `action = CLOUDFLARE_WAF_RULE_CREATED`.
- Ao alterar configurações SSL, registrar com `action = CLOUDFLARE_SSL_CONFIG_CHANGED`.

---

## 15. Custos

### 15.1 Custo Atual (Plano Free)

| Recurso | Limite Free | Custo |
|:-------:|:-----------:|:-----:|
| DNS autoritativo | Ilimitado | R$ 0,00 |
| WAF (regras gerenciadas) | Ativo | R$ 0,00 |
| DDoS Protection | Ilimitado | R$ 0,00 |
| SSL/TLS Universal | ✅ Gratuito | R$ 0,00 |
| CDN (bandwidth) | Ilimitado | R$ 0,00 |
| Rate Limiting | 1 regra gratuita | R$ 0,00 |
| WAF Custom Rules | 5 regras | R$ 0,00 |
| Page Rules | 3 regras | R$ 0,00 |
| Analytics | Básico (30 dias) | R$ 0,00 |
| Health Checks | Básico | R$ 0,00 |
| **Total** | | **R$ 0,00/mês** |

### 15.2 Custo ao Escalar (Cloudflare Pro — USD 20/mês)

| Recurso Adicional | Valor |
|:-----------------:|:-----:|
| Plano base Pro | USD 20/mês (~R$ 100) |
| WAF Custom Rules | 100 regras (vs. 5 no Free) |
| Rate Limiting | 10 regras (vs. 1) |
| Page Rules | 20 regras (vs. 3) |
| Image Resizing | Incluído |
| Analytics | 7 dias de logs detalhados |
| Advanced DDoS | Maior granularidade |
| **Total estimado Pro** | ~R$ 100/mês |

---

## 16. Limitações do Plano Gratuito

### 16.1 Limitações Técnicas e Mitigações

| Limitação | Impacto | Mitigação |
|:----------:|:-------:|:---------:|
| **1 regra de Rate Limiting** | Proteção limitada a 1 endpoint | Usar WAF Custom Rule como rate limiting alternativo |
| **5 regras WAF customizadas** | Poucas regras para cenários específicos | Priorizar regras de maior impacto; OWASP CRS cobre a maioria |
| **3 Page Rules** | Gestão de cache limitada | Usar Cache Rules no painel (interface mais moderna, mais regras no Pro) |
| **Sem Logpush** | Sem logs detalhados de requests | CF-Ray nos logs Vercel para correlação |
| **Analytics: 30 dias** | Histórico limitado | Dados de auditoria no banco SGTI para histórico longo |
| **Sem Advanced Bots** | Detecção básica de bots | Bot Fight Mode básico é suficiente para o SGTI inicial |
| **Sem Preview Protection** | Não aplicável (gerenciado pelo Vercel) | Autenticação Google do SGTI protege previews |
| **Sem Custom SSL** | Certificado Cloudflare padrão | Universal SSL é suficiente para todos os subdomínios |
| **Health Checks básicos** | Alertas menos granulares | UptimeRobot como complemento |
| **Sem Workers** | Sem edge computing via Cloudflare | Vercel Edge Middleware como alternativa |

---

## 17. Estratégia de Crescimento

### 17.1 Critérios para Upgrade para Cloudflare Pro

| Critério | Threshold | Ação |
|:--------:|:---------:|:----:|
| Ataques frequentes precisando de mais regras WAF | > 3 ataques/mês | Upgrade para Pro |
| Necessidade de mais de 5 regras WAF customizadas | > 5 regras necessárias | Upgrade para Pro |
| Necessidade de logs detalhados por request | Compliance requer | Upgrade para Pro |
| Volume de bots causando problemas | Bot Fight Mode insuficiente | Upgrade para Pro |
| Necessidade de Rate Limiting em múltiplos endpoints | > 1 regra necessária | Upgrade para Pro |
| Necessidade de Image Resizing na borda | Performance crítica | Upgrade para Pro |

### 17.2 Roadmap de Features Cloudflare

| Fase | Feature | Plano |
|:----:|:-------:|:-----:|
| **v1 (atual)** | DNS + WAF básico + CDN + DDoS Free | Free |
| **v1.x** | Mais regras WAF + Rate Limiting múltiplo | Pro (USD 20/mês) |
| **v2** | Logpush + Advanced Bot + Workers | Pro + Logpush |
| **v3 (enterprise)** | Dedicated IP + SLA + Compliance | Enterprise |

---

## 18. Plano de Contingência

### 18.1 Cenário: Cloudflare Indisponível

```
CLOUDFLARE DOWN — PLANO DE CONTINGÊNCIA

Probabilidade: Muito baixa (Cloudflare tem SLA 99,99%)
Última outage significativa: Histórico raro; uptime próximo de 100%

Verificação imediata:
  1. Acessar https://www.cloudflarestatus.com
  2. Verificar se é outage global ou regional

Impacto durante outage Cloudflare:
  → DNS: Domínio pode ficar inacessível (DNS não resolve)
  → Alternativa: Cloudflare tem múltiplas camadas de redundância

Plano de contingência (se outage > 30 min):
  1. Alterar NS do domínio para outro DNS provider (ex.: Google Cloud DNS)
     ATENÇÃO: Propagação de NS leva 24–48h — não é solução rápida
  2. Comunicar usuários sobre indisponibilidade temporária
  3. Aguardar resolução pelo Cloudflare (histórico: < 30 min)
  
MELHOR ESTRATÉGIA: Aguardar resolução (99% dos casos < 15 min)
```

### 18.2 Cenário: Falso Positivo WAF Bloqueando Usuários

```
WAF BLOQUEANDO USUÁRIOS LEGÍTIMOS — PLANO DE CONTINGÊNCIA

Sintoma: Usuários relatam erro 403 ou CAPTCHA inesperado

Verificação imediata:
  1. Acessar Cloudflare → Security → Events
  2. Identificar qual regra está acionando o bloqueio
  3. Verificar o CF-Ray do usuário afetado nos logs Vercel

Ações corretivas:
  A. Colocar a regra em modo "Log" (não Block):
     WAF → Managed Rules → {regra} → Action: Log
     → Usuário não é mais bloqueado mas evento é registrado
  
  B. Adicionar IP específico à allowlist:
     Security → WAF → Tools → IP Access Rules → Allow

  C. Desativar regra específica temporariamente:
     WAF → Managed Rules → {regra} → Disabled
     → Usar apenas se impacto for mínimo na segurança

  D. Escalar para análise mais profunda se padrão persistir
```

### 18.3 Cenário: Ataque DDoS Ativo

```
ATAQUE DDOS EM ANDAMENTO — PLANO DE RESPOSTA

T+0: Alertas Cloudflare / UptimeRobot indicam degradação
  1. Verificar Cloudflare → Analytics → Traffic para confirmar

T+1 min: Ativar modo Under Attack
  Dashboard → Overview → Security Level: "Under Attack"
  → Todos os visitantes recebem JavaScript Challenge (5s delay)
  → Bots automatizados são bloqueados

T+5 min: Análise
  → Identificar padrão do ataque (IP fixo, país, User-Agent)
  → Criar WAF Custom Rule específica para o padrão

T+10 min: Regras específicas
  → Bloquear IP específico ou ASN do atacante
  → Bloquear país de origem se não há usuários legítimos

T+30 min (se ataque cessar):
  Dashboard → Overview → Security Level: "High" → "Medium"
  → Monitorar por mais 1h antes de voltar ao normal

NOTIFICAÇÃO:
  → IT_MANAGER comunicado imediatamente
  → Usuários notificados se impacto foi > 5 minutos
  → Post-mortem documentado após resolver
```

---

## 19. Disaster Recovery

### 19.1 Componentes do SGTI que Dependem do Cloudflare

```
ANÁLISE DE DEPENDÊNCIA DO CLOUDFLARE

CRÍTICO (sem Cloudflare, SGTI fica inacessível):
  → DNS: sem resolução, domínio não funciona
  → Solução: ter NS secundário configurado como fallback

IMPORTANTE (degradado sem Cloudflare, mas acessível):
  → CDN: sem cache, latência aumenta mas sistema funciona
  → WAF: sem proteção de borda, Vercel/Supabase têm proteções próprias
  → SSL entre Cloudflare e usuário: Vercel também tem HTTPS

NÃO CRÍTICO (sem impacto ao usuário final):
  → Analytics do Cloudflare: dados não coletados, mas sistema funciona
  → Rate Limiting Cloudflare: Supabase tem rate limiting próprio
```

### 19.2 RTO e RPO para Falha do Cloudflare

| Cenário | RTO (Recovery Time Objective) | RPO (Recovery Point Objective) |
|:-------:|:-----------------------------:|:------------------------------:|
| Outage Cloudflare (< 30 min) | 30 minutos (aguardar resolução) | Zero (sem perda de dados) |
| Outage Cloudflare (> 30 min) | 2 horas (migrar DNS) | Zero (sem perda de dados) |
| Configuração WAF apagada acidentalmente | 30 minutos (restaurar via Export/Import) | Última configuração salva |
| Domínio expirado | 24 horas (renovar domínio) | Zero (sem perda de dados) |

### 19.3 Backup de Configurações Cloudflare

```
BACKUP DAS CONFIGURAÇÕES CLOUDFLARE

O que fazer backup:
  1. Registros DNS (exportar via Cloudflare: DNS → Export)
     Formato: BIND zone file compatível
     Frequência: Mensal ou a cada mudança significativa
     Armazenamento: Repositório Git (não publicado) ou S3

  2. Regras WAF customizadas (documentar manualmente ou via Terraform)
     Frequência: A cada criação/modificação de regra
     Armazenamento: Este documento (74_CLOUDFLARE.md) + Git

  3. Page Rules e Cache Rules (documentar)
     Frequência: A cada alteração
     Armazenamento: Este documento

PROCEDIMENTO DE BACKUP MENSAL:
  1. Cloudflare Dashboard → DNS → Export zone file
  2. Salvar no repositório: /infra/cloudflare/dns-backup-{data}.txt
  3. Documentar regras WAF ativas neste documento
  4. Confirmar que configurações estão corretas com teste rápido
```

### 19.4 Procedimento de Migração de DNS de Emergência

Para o caso extremo de necessidade de migrar para outro DNS provider:

```
MIGRAÇÃO EMERGENCIAL PARA GOOGLE CLOUD DNS (exemplo)

PRÉ-REQUISITO: Backup do zone file disponível (seção 19.3)

1. Criar zona no Google Cloud DNS com o domínio
2. Importar zone file exportado do Cloudflare
3. Verificar todos os registros (especialmente MX e TXT)
4. Anotar os nameservers do Google Cloud DNS:
   ns-cloud-X.googledomains.com (4 nameservers)
5. No registrador do domínio: alterar NS para Google Cloud DNS
6. Aguardar propagação (24–48h para NS)
7. Monitorar resolução via: dig sgti.empresa.com.br

ATENÇÃO:
  → Sem proxy do Cloudflare: WAF e DDoS ficam inativos
  → Vercel passa a receber tráfego diretamente
  → IP da Vercel fica exposto
  → Monitorar Vercel diretamente para ataques

REVERTER PARA CLOUDFLARE:
  → Alterar NS de volta para Cloudflare
  → Aguardar propagação
  → Reconfigurar proxies e regras
```

---

## 20. Critérios de Aceitação

### 20.1 DNS e SSL

- [ ] **CA-01:** `sgti.empresa.com.br` resolve corretamente (CNAME para Vercel via Cloudflare).
- [ ] **CA-02:** Acesso via HTTP redireciona para HTTPS com status 301.
- [ ] **CA-03:** Certificado SSL Universal ativo e válido para todos os subdomínios.
- [ ] **CA-04:** HSTS configurado: `max-age=63072000; includeSubDomains; preload`.
- [ ] **CA-05:** Modo SSL/TLS configurado como Full (strict).
- [ ] **CA-06:** DNSSEC habilitado e funcionando.

### 20.2 Segurança

- [ ] **CA-07:** WAF em modo BLOCK em produção (não apenas LOG).
- [ ] **CA-08:** OWASP Core Rule Set ativo.
- [ ] **CA-09:** Bot Fight Mode habilitado.
- [ ] **CA-10:** Rate Limiting configurado para `/api/auth/*` (10 req/min por IP).
- [ ] **CA-11:** Regra WAF customizada bloqueando métodos HTTP não utilizados.
- [ ] **CA-12:** IP de origem da Vercel oculto (não exposto via DNS lookups).
- [ ] **CA-13:** `cf.threat_score > 30` triggering CHALLENGE.

### 20.3 Headers de Segurança

- [ ] **CA-14:** `X-Frame-Options: SAMEORIGIN` presente em todas as responses.
- [ ] **CA-15:** `X-Content-Type-Options: nosniff` presente em todas as responses.
- [ ] **CA-16:** `Referrer-Policy: strict-origin-when-cross-origin` configurado.
- [ ] **CA-17:** Nota A+ em `securityheaders.com` para o domínio de produção.

### 20.4 CDN e Performance

- [ ] **CA-18:** Assets estáticos (`/_next/static/`) sendo servidos com HIT no cache Cloudflare na segunda request.
- [ ] **CA-19:** Páginas dinâmicas (`/dashboard`) com status BYPASS (não cacheadas).
- [ ] **CA-20:** Compressão Brotli ativa (verificar header `Content-Encoding: br`).
- [ ] **CA-21:** HTTP/3 anunciado e funcionando para browsers compatíveis.

### 20.5 Monitoramento e Alertas

- [ ] **CA-22:** Health Check do Cloudflare configurado para `/api/health`.
- [ ] **CA-23:** Alerta de e-mail ao IT_MANAGER quando origem fica offline.
- [ ] **CA-24:** Alerta de DDoS configurado e funcional.
- [ ] **CA-25:** Headers `CF-Connecting-IP` e `CF-Ray` chegando ao Next.js e sendo logados.

### 20.6 Disaster Recovery

- [ ] **CA-26:** Backup do zone file DNS salvo e atualizado mensalmente.
- [ ] **CA-27:** Procedimento de migração emergencial de DNS documentado e testado.

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação com 20 seções e 27 critérios de aceitação |

---

> **Documentos relacionados:**
> [`70_DEPLOYMENT.md`](./70_DEPLOYMENT.md) — Estratégia geral de deploy
> [`71_SUPABASE.md`](./71_SUPABASE.md) — Arquitetura Supabase
> [`72_GITHUB_ACTIONS.md`](./72_GITHUB_ACTIONS.md) — Pipelines CI/CD
> [`73_VERCEL.md`](./73_VERCEL.md) — Arquitetura Vercel (Frontend)
> [`50_INTEGRATIONS.md`](./50_INTEGRATIONS.md) — Integrações externas
