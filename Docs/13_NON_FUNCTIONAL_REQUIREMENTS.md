# SGTI — Sistema de Gestão de Tecnologia da Informação
## Requisitos Não Funcionais

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [12_ARCHITECTURE.md](./12_ARCHITECTURE.md) · [11_TECH_STACK.md](./11_TECH_STACK.md) · [00_PROJECT_CONTEXT.md](./00_PROJECT_CONTEXT.md)

---

## Sobre este Documento

Este documento especifica os **Requisitos Não Funcionais (RNFs)** do SGTI — as características de qualidade que o sistema deve satisfazer além de sua funcionalidade de negócio. Cada requisito é identificado com código único, possui critério de aceitação mensurável e rastreabilidade com os módulos impactados.

### Identificação dos Requisitos

Os RNFs seguem o padrão de identificação:

```
RNF-[CATEGORIA]-[NÚMERO]
```

| Código de Categoria | Domínio |
|--------------------|---------|
| `PERF` | Performance |
| `ESCA` | Escalabilidade |
| `DISP` | Disponibilidade |
| `SECU` | Segurança |
| `OBSE` | Observabilidade |
| `AUDI` | Auditoria |
| `USAB` | Usabilidade |
| `RESP` | Responsividade |
| `MANU` | Manutenibilidade |
| `BACK` | Backup |
| `DISA` | Recuperação de Desastre |
| `LOGS` | Logs |
| `LGPD` | Proteção de Dados (LGPD) |
| `INTG` | Integrações |

### Prioridade dos Requisitos

| Prioridade | Descrição |
|------------|-----------|
| **MANDATÓRIO** | Requisito inegociável. Não atendê-lo inviabiliza a entrega. |
| **ALTO** | Requisito de alta importância. Deve ser atendido antes do go-live. |
| **MÉDIO** | Requisito relevante. Pode ser relaxado temporariamente com justificativa. |
| **BAIXO** | Requisito desejável. Endereçado após estabilização do MVP. |

---

## Sumário

1. [Performance](#1-performance)
2. [Escalabilidade](#2-escalabilidade)
3. [Disponibilidade](#3-disponibilidade)
4. [Segurança](#4-segurança)
5. [Observabilidade](#5-observabilidade)
6. [Auditoria](#6-auditoria)
7. [Usabilidade](#7-usabilidade)
8. [Responsividade](#8-responsividade)
9. [Manutenibilidade](#9-manutenibilidade)
10. [Backup](#10-backup)
11. [Recuperação de Desastre](#11-recuperação-de-desastre)
12. [Logs](#12-logs)
13. [LGPD — Proteção de Dados Pessoais](#13-lgpd--proteção-de-dados-pessoais)
14. [Integrações](#14-integrações)
15. [Matriz de Rastreabilidade](#15-matriz-de-rastreabilidade)

---

## 1. Performance

Os requisitos de performance estabelecem os limites de tempo de resposta e capacidade de processamento que o SGTI deve satisfazer sob condições normais e de pico de utilização.

---

### RNF-PERF-001 — Tempo de Resposta de APIs REST

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Todos

**Especificação:**
O tempo de resposta das APIs REST do SGTI, medido no servidor (sem latência de rede), deve respeitar os limites estabelecidos na tabela abaixo sob carga normal de operação (até 200 requisições simultâneas):

| Tipo de Operação | p50 | p95 | p99 | Limite Absoluto |
|------------------|-----|-----|-----|----------------|
| Leitura simples (por ID) | ≤ 100ms | ≤ 300ms | ≤ 500ms | 1.000ms |
| Listagem paginada | ≤ 200ms | ≤ 600ms | ≤ 1.000ms | 2.000ms |
| Escrita simples (criação/atualização) | ≤ 200ms | ≤ 500ms | ≤ 800ms | 1.500ms |
| Operação com integração externa (GLPI) | ≤ 500ms | ≤ 1.500ms | ≤ 3.000ms | 5.000ms |
| Geração de relatório (assíncrono) | N/A | N/A | N/A | 30.000ms |
| Consulta de dashboard (read model) | ≤ 50ms | ≤ 150ms | ≤ 300ms | 500ms |

**Critério de aceitação:** Teste de carga com ferramenta k6 ou artillery demonstrando que os percentis p95 estão dentro dos limites para cada categoria de operação.

**Exclusões:** Operações assíncronas de longa duração (geração de relatórios, sincronização de inventário) estão fora do escopo desta métrica e são monitoradas pelo tempo de conclusão do job.

---

### RNF-PERF-002 — Tempo de Carregamento de Páginas Frontend

**Prioridade:** ALTO
**Módulos impactados:** Dashboards, Portal de Autoatendimento, Todos os módulos com interface

**Especificação:**
As páginas do SGTI devem satisfazer os seguintes indicadores de Core Web Vitals medidos em conexão de rede corporativa padrão (100Mbps):

| Indicador | Meta | Limite Aceitável |
|-----------|------|-----------------|
| **LCP** (Largest Contentful Paint) | ≤ 1,5s | ≤ 2,5s |
| **FID** (First Input Delay) | ≤ 50ms | ≤ 100ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0,05 | ≤ 0,10 |
| **TTFB** (Time to First Byte) | ≤ 400ms | ≤ 800ms |
| **FCP** (First Contentful Paint) | ≤ 800ms | ≤ 1.500ms |

**Critério de aceitação:** Vercel Analytics e Lighthouse CI reportando valores dentro das metas para as 5 rotas mais acessadas do sistema, medidos semanalmente.

---

### RNF-PERF-003 — Capacidade Mínima de Usuários Simultâneos

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Todos

**Especificação:**
O SGTI deve suportar, sem degradação perceptível de performance (sem violação de RNF-PERF-001), a seguinte carga simultânea:

| Cenário | Usuários Simultâneos | Condição |
|---------|---------------------|---------|
| Operação normal | 200 | Carga típica em horário comercial |
| Pico de segunda-feira | 400 | Início de semana com abertura de chamados em massa |
| Capacidade máxima garantida | 500 | Sem degradação acima dos limites de p95 |
| Capacidade de degração graciosa | 750 | Sistema operacional com degradação controlada |

**Degradação graciosa:** acima de 500 usuários simultâneos, o sistema pode aumentar tempos de resposta (respeitando o Limite Absoluto da tabela de RNF-PERF-001) mas não pode apresentar erros 5xx ou perda de dados.

**Critério de aceitação:** Teste de carga com rampa de 0 a 500 usuários em 10 minutos sem erro de disponibilidade e sem violação do Limite Absoluto.

---

### RNF-PERF-004 — Performance de Busca na Base de Conhecimento

**Prioridade:** ALTO
**Módulos impactados:** Base de Conhecimento

**Especificação:**
A busca full-text na Base de Conhecimento, implementada via PostgreSQL `tsvector`, deve retornar resultados em:

| Tamanho da Base | Tempo de Resposta p95 |
|----------------|----------------------|
| Até 1.000 artigos | ≤ 300ms |
| De 1.000 a 10.000 artigos | ≤ 600ms |
| Acima de 10.000 artigos | ≤ 1.000ms |

**Critério de aceitação:** Teste com base de dados populada com o volume esperado, executando 100 buscas distintas e medindo o percentil 95.

---

### RNF-PERF-005 — Atualização em Tempo Real dos Dashboards

**Prioridade:** ALTO
**Módulos impactados:** Dashboards

**Especificação:**
As projeções exibidas nos Dashboards Operacionais e Executivos devem ser atualizadas com a seguinte latência máxima após a ocorrência do evento de domínio que as origina:

| Tipo de Dashboard | Latência Máxima de Atualização |
|------------------|-------------------------------|
| Dashboard Operacional (filas, alertas) | ≤ 5 segundos |
| Dashboard Executivo (KPIs) | ≤ 30 segundos |
| Dashboard de Compliance (maturidade) | ≤ 60 segundos |
| Dashboard Financeiro (OPEX/CAPEX) | ≤ 60 segundos |

**Critério de aceitação:** Teste mensurando o tempo entre a publicação de um evento de domínio (ex: `IncidentResolved`) e a atualização da projeção correspondente visível no frontend, via Supabase Realtime.

---

## 2. Escalabilidade

Os requisitos de escalabilidade definem a capacidade do sistema de crescer de forma controlada em resposta ao aumento de carga e volume de dados.

---

### RNF-ESCA-001 — Escalabilidade Horizontal do Backend

**Prioridade:** ALTO
**Módulos impactados:** Todos (backend NestJS)

**Especificação:**
O backend NestJS deve ser stateless e capaz de escalar horizontalmente através da execução de múltiplas instâncias simultâneas sem coordenação entre elas. Não deve haver:

- Estado em memória compartilhado entre instâncias (sem sessões em memória).
- Dependência de sistema de arquivos local.
- Locks distribuídos sem mecanismo externo (Redis ou banco de dados).

O mecanismo de sessão (JWT) é stateless por design. Dados de estado transiente (filas, jobs) são persistidos no banco de dados, não em memória.

**Critério de aceitação:** Sistema operando com 2 instâncias em paralelo sem perda de requisições, verificado por teste de carga com sessões persistentes.

---

### RNF-ESCA-002 — Particionamento de Dados por Volume

**Prioridade:** MÉDIO
**Módulos impactados:** Incidentes, Ativos, Logs de Auditoria

**Especificação:**
Tabelas com crescimento projetado superior a 1 milhão de registros em 12 meses devem implementar estratégia de particionamento antes de atingir 500.000 registros:

| Tabela | Estratégia | Critério de Ativação |
|--------|-----------|---------------------|
| `incident.incidents` | Particionamento por intervalo (mensal) | > 500.000 registros |
| `shared.audit_log` | Particionamento por intervalo (mensal) | > 2.000.000 registros |
| `notification.notifications` | Particionamento por intervalo (semanal) | > 1.000.000 registros |
| `email_log.email_messages` | Particionamento por intervalo (mensal) | > 500.000 registros |

**Critério de aceitação:** Plano de particionamento documentado antes do go-live; implementação executada antes de atingir o limiar definido.

---

### RNF-ESCA-003 — Capacidade de Armazenamento

**Prioridade:** ALTO
**Módulos impactados:** Compliance, Incidentes, Projetos, Base de Conhecimento

**Especificação:**
O sistema deve ser dimensionado para suportar o crescimento de armazenamento projetado abaixo, com alertas configurados ao atingir 80% do limite disponível:

| Componente | Crescimento Mensal Estimado | Projeção em 12 meses |
|------------|---------------------------|---------------------|
| Banco de dados (total) | ~8 MB/mês | ~100 MB |
| Storage — evidências de compliance | ~50 MB/mês | ~600 MB |
| Storage — anexos de chamados | ~20 MB/mês | ~240 MB |
| Storage — documentos de projeto | ~10 MB/mês | ~120 MB |
| Storage — Base de Conhecimento | ~5 MB/mês | ~60 MB |
| Logs de auditoria | ~2 MB/mês | ~24 MB |

**Critério de aceitação:** Dashboard de monitoramento de uso de armazenamento configurado com alertas em 80% do limite; plano de upgrade documentado para quando o armazenamento ultrapassar o plano gratuito (500MB banco, 1GB storage).

---

### RNF-ESCA-004 — Connection Pooling

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Todos (backend NestJS)

**Especificação:**
O acesso ao banco de dados deve obrigatoriamente utilizar connection pooling via PgBouncer (gerenciado pelo Supabase) para prevenir esgotamento de conexões em ambiente serverless. A string de conexão do Prisma Client deve utilizar a URL com parâmetro `?pgbouncer=true` para operações de leitura e escrita. A URL direta (sem pool) deve ser utilizada exclusivamente para execução de migrations.

| Parâmetro | Valor |
|-----------|-------|
| Pool mode | Transaction |
| Pool size máximo | 10 conexões por instância |
| Timeout de aquisição de conexão | 10 segundos |
| String de conexão | `DATABASE_URL` (com pool) e `DIRECT_URL` (sem pool) |

**Critério de aceitação:** Ausência de erros `too many connections` sob carga de 100 usuários simultâneos.

---

## 3. Disponibilidade

Os requisitos de disponibilidade definem os acordos de nível de serviço internos do próprio SGTI.

---

### RNF-DISP-001 — Disponibilidade em Horário Comercial

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Todos

**Especificação:**
O SGTI deve garantir disponibilidade mínima de **99,5%** em horário comercial (07h00–20h00, segunda a sexta-feira, exceto feriados nacionais).

| Métrica | Valor |
|---------|-------|
| Disponibilidade mínima em horário comercial | 99,5% |
| Indisponibilidade máxima tolerada por mês | ≤ 195 minutos |
| Indisponibilidade máxima tolerada por semana | ≤ 45 minutos |

Fora do horário comercial, a disponibilidade mínima é de **95%**, permitindo janelas de manutenção planejada com aviso prévio de 24 horas.

**Critério de aceitação:** Monitoramento externo (UptimeRobot ou equivalente) com alertas a cada 5 minutos, relatório mensal de uptime disponível.

---

### RNF-DISP-002 — Tempo Máximo de Indisponibilidade por Incidente

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Todos

**Especificação:**
Em caso de incidente que cause indisponibilidade do SGTI, os seguintes tempos máximos de recuperação devem ser observados:

| Severidade do Incidente | RTO (Recovery Time Objective) |
|------------------------|-------------------------------|
| Crítico (sistema inacessível) | ≤ 30 minutos |
| Alto (módulo principal indisponível) | ≤ 2 horas |
| Médio (funcionalidade degradada) | ≤ 4 horas |
| Baixo (funcionalidade auxiliar indisponível) | ≤ 8 horas |

**Critério de aceitação:** Plano de resposta a incidentes documentado em `Docs/Operação/22_RUNBOOK.md` com procedimentos para cada nível de severidade.

---

### RNF-DISP-003 — Manutenção com Zero Downtime

**Prioridade:** ALTO
**Módulos impactados:** Todos

**Especificação:**
Deploys de rotina (releases, correções de bugs, atualizações de dependências) devem ser executados com **zero downtime** para o usuário final, sem janelas de manutenção no horário comercial.

A estratégia de zero-downtime é suportada por:
- Deploy automático via Vercel com rolling update transparente.
- Migrations de banco de dados executadas como etapa anterior e separada do deploy de código, garantindo compatibilidade reversa entre schema novo e código antigo.
- Toda migration deve ser compatível com a versão anterior do código por pelo menos 1 ciclo de deploy (estratégia expand-contract).

**Critério de aceitação:** Simulação de deploy em staging com usuários ativos sem interrupção de sessão.

---

### RNF-DISP-004 — Degradação Graciosa em Falha de Integração

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Incidentes (GLPI), Identidades (Google Workspace), Notificações (Email)

**Especificação:**
Falhas em sistemas externos integrados ao SGTI não devem causar indisponibilidade do núcleo do sistema. O comportamento esperado em caso de falha de integração é:

| Integração | Comportamento em Falha | Impacto Aceitável |
|------------|----------------------|------------------|
| GLPI | Chamado criado no SGTI; sincronização enfileirada para retry | Ticket não aparece no GLPI imediatamente |
| Google Workspace (IAM) | Usuário criado no SGTI com status `PENDING_PROVISIONING`; conta Google criada no retry | Acesso ao Google atrasado |
| Google OAuth (SSO) | Indisponibilidade do SSO impede login — sem fallback | Usuários não conseguem autenticar |
| Email (SMTP) | Notificação enfileirada; retry com backoff exponencial | E-mail atrasado |
| GitHub | Dashboard sem dados de pipeline; funcionalidade degradada | KPIs de projetos desatualizados |

**Critério de aceitação:** Teste de falha de cada integração (simulando timeout e erro 500) com verificação de que o fluxo principal do SGTI continua operacional.

---

## 4. Segurança

Os requisitos de segurança estabelecem os controles obrigatórios para proteção dos dados e da infraestrutura do SGTI.

---

### RNF-SECU-001 — Autenticação Federada Obrigatória

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Authentication, Identity, Todos

**Especificação:**
O SGTI não deve armazenar, processar ou transmitir senhas de usuários. Toda autenticação deve ser delegada ao Google Workspace via OAuth 2.0. As seguintes práticas são estritamente proibidas:

- Criação de formulário de login com campo de senha no SGTI.
- Armazenamento de hash de senha no banco de dados.
- Implementação de mecanismo de reset de senha próprio.
- Autenticação por API Key para usuários humanos.

**Critério de aceitação:** Inspeção do schema de banco de dados confirmando ausência de coluna de senha; inspeção do código confirmando ausência de lógica de hash de senha.

---

### RNF-SECU-002 — Criptografia em Trânsito

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Todos

**Especificação:**
Toda comunicação que envolva dados do SGTI deve ser criptografada em trânsito:

| Comunicação | Protocolo Obrigatório | Versão Mínima |
|-------------|----------------------|---------------|
| Usuário → Frontend (Vercel) | HTTPS | TLS 1.2 |
| Frontend → Backend (NestJS) | HTTPS | TLS 1.2 |
| Backend → PostgreSQL (Supabase) | TLS | TLS 1.2 |
| Backend → GLPI | HTTPS | TLS 1.2 |
| Backend → Google APIs | HTTPS | TLS 1.2 |
| Backend → Supabase Storage | HTTPS | TLS 1.2 |

Comunicação HTTP sem TLS é **proibida** em qualquer ambiente (desenvolvimento, staging, produção).

**Critério de aceitação:** SSL Labs Score A ou A+ para `sgti.[dominio]` e `api.sgti.[dominio]`; verificação de TLS mínimo 1.2 via ferramenta de auditoria de SSL.

---

### RNF-SECU-003 — Controle de Acesso Baseado em Papéis (RBAC)

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Todos

**Especificação:**
Todo endpoint da API e toda página do frontend deve ter acesso controlado por papel de usuário. Os princípios de controle de acesso são:

- **Menor privilégio:** cada usuário recebe apenas as permissões mínimas necessárias para suas funções.
- **Separação de funções:** funções conflitantes (ex: criar requisição e aprovar a mesma requisição) não podem ser executadas pelo mesmo usuário.
- **Negação por padrão:** na ausência de permissão explícita, o acesso é negado.

| Controle | Implementação |
|----------|--------------|
| Autenticação obrigatória | `JwtAuthGuard` global em todos os endpoints protegidos |
| Verificação de papel | `RolesGuard` com `@Roles([...])` em todos os endpoints |
| Isolamento de dados por usuário | Supabase RLS em todas as tabelas com dados pessoais |
| Segregação de dados por módulo | Um schema PostgreSQL por módulo |

**Critério de aceitação:** Testes automatizados verificando que cada role tem acesso apenas às operações permitidas; teste de penetração verificando escalação de privilégio.

---

### RNF-SECU-004 — Segurança dos Tokens JWT

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Authentication

**Especificação:**

| Parâmetro | Requisito |
|-----------|-----------|
| Algoritmo de assinatura | RS256 (assimétrico) — proibido HS256 |
| Tempo de expiração do Access Token | 1 hora |
| Tempo de expiração do Refresh Token | 7 dias |
| Armazenamento no cliente | Cookie `HttpOnly`, `Secure`, `SameSite=Strict` — proibido `localStorage` |
| Rotação do Refresh Token | Obrigatória a cada uso — token anterior invalidado imediatamente |
| Revogação por suspensão | Verificação de blacklist no `JwtAuthGuard` para usuários suspensos |
| Transmissão da chave privada | Proibida — chave privada reside exclusivamente no backend |

**Critério de aceitação:** Auditoria de código confirmando cookies corretos; teste de uso de Refresh Token revogado retornando 401; teste de acesso com usuário suspenso retornando 401.

---

### RNF-SECU-005 — Proteção contra Ataques Comuns (OWASP Top 10)

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Todos

**Especificação:**
O SGTI deve implementar controles para os principais vetores de ataque do OWASP Top 10:

| Ameaça | Controle Implementado |
|--------|----------------------|
| **Injection (SQL, NoSQL)** | Prisma ORM com queries parametrizadas; `$queryRaw` tipado; proibição de interpolação de string em queries |
| **Broken Authentication** | JWT RS256, rotação de refresh token, cookies HttpOnly |
| **Sensitive Data Exposure** | TLS 1.2+, criptografia em repouso para dados sensíveis, mascaramento de PII em logs |
| **Broken Access Control** | RBAC + RLS (dupla camada) |
| **Security Misconfiguration** | Headers de segurança via Cloudflare + NestJS Helmet; Swagger desabilitado em produção |
| **XSS** | Content Security Policy restritiva; React escapa HTML por padrão; sem dangerouslySetInnerHTML |
| **Insecure Deserialization** | DTOs validados com class-validator antes de qualquer processamento |
| **Using Components with Known Vulnerabilities** | `npm audit` no pipeline CI; dependências atualizadas mensalmente |
| **Insufficient Logging** | AuditInterceptor capturando toda operação de escrita; logs de acesso negado |
| **SSRF** | Validação de URLs em integrações externas; sem requisições a URLs fornecidas pelo usuário |

**Critério de aceitação:** Execução de scan OWASP ZAP ou equivalente sem vulnerabilidades de severidade Alta ou Crítica antes do go-live.

---

### RNF-SECU-006 — Proteção de Credenciais e Segredos

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Todos

**Especificação:**
Credenciais, tokens e segredos do sistema nunca devem residir em código-fonte, logs, interfaces de usuário ou variáveis não criptografadas:

| Tipo de Segredo | Armazenamento Permitido |
|----------------|------------------------|
| Chave privada JWT (RS256) | Vercel Environment Variables (criptografada) |
| Google Client Secret | Vercel Environment Variables |
| GLPI API Token | Vercel Environment Variables |
| Supabase Service Key | Vercel Environment Variables |
| GitHub PAT | Vercel Environment Variables |
| Connection String do banco | Vercel Environment Variables |

**Proibido em qualquer circunstância:**
- Credenciais em arquivos `.env` commitados no repositório.
- Credenciais em comentários de código.
- Credenciais expostas em respostas de API.
- Credenciais em mensagens de log.

**Critério de aceitação:** Ferramenta de detecção de segredos (gitleaks ou trufflehog) configurada no pipeline CI; zero segredos detectados no histórico do repositório.

---

### RNF-SECU-007 — Headers de Segurança HTTP

**Prioridade:** ALTO
**Módulos impactados:** Frontend (Next.js), Backend (NestJS)

**Especificação:**
Todas as respostas HTTP do SGTI devem incluir os headers de segurança obrigatórios:

| Header | Valor Obrigatório |
|--------|------------------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'nonce-{nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` |
| `X-XSS-Protection` | `0` (desabilitado — CSP é o controle correto em browsers modernos) |

**Critério de aceitação:** SecurityHeaders.com Score A ou superior para `sgti.[dominio]`.

---

## 5. Observabilidade

Os requisitos de observabilidade garantem que o estado do sistema possa ser compreendido e diagnosticado em tempo real e retrospectivamente.

---

### RNF-OBSE-001 — Health Check dos Subsistemas

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Todos

**Especificação:**
O endpoint `GET /api/health` deve retornar o status operacional de cada subsistema do SGTI em tempo real:

```
Resposta esperada:
{
  "status": "healthy" | "degraded" | "unhealthy",
  "timestamp": "ISO8601",
  "subsystems": {
    "database":       { "status": "healthy" | "unhealthy", "latencyMs": N },
    "storage":        { "status": "healthy" | "unhealthy" },
    "glpi":           { "status": "healthy" | "degraded" | "unhealthy", "latencyMs": N },
    "googleWorkspace":{ "status": "healthy" | "degraded" | "unhealthy" },
    "email":          { "status": "healthy" | "unhealthy", "queueSize": N },
    "eventBus":       { "status": "healthy" | "unhealthy", "pendingEvents": N }
  }
}
```

O endpoint deve responder em menos de 2 segundos. Status `degraded` indica integração parcialmente funcional; `unhealthy` indica falha total.

**Critério de aceitação:** Endpoint retornando estrutura correta; monitoramento externo configurado para alertar em status `unhealthy`.

---

### RNF-OBSE-002 — Métricas de Negócio em Tempo Real

**Prioridade:** ALTO
**Módulos impactados:** Dashboards, Incidentes, SLA

**Especificação:**
O sistema deve manter e expor as seguintes métricas de negócio em tempo real, atualizadas a cada ciclo de evento de domínio:

| Métrica | Atualização | Endpoint |
|---------|------------|---------|
| SLA compliance rate (%) | Tempo real | Dashboard projection |
| Incidentes em aberto por prioridade | Tempo real | Dashboard projection |
| Fila de aprovações pendentes | Tempo real | Dashboard projection |
| MTTR médio (últimas 24h, 7d, 30d) | A cada resolução | Dashboard projection |
| Taxa de utilização de licenças de software | Diária | Asset module |
| OPEX realizado vs. orçado (%) | A cada lançamento | Finance module |

**Critério de aceitação:** Projeções de dashboard atualizadas em conformidade com RNF-PERF-005, verificadas por teste de eventos sequenciais.

---

### RNF-OBSE-003 — Rastreabilidade de Requisições

**Prioridade:** ALTO
**Módulos impactados:** Todos

**Especificação:**
Toda requisição HTTP deve ser associada a um identificador único de correlação (`X-Request-ID`) que permita rastrear a execução completa da requisição através de todos os componentes do sistema:

- O `X-Request-ID` é gerado no backend se não fornecido pelo cliente.
- O identificador é incluído em todos os logs relacionados à requisição.
- O identificador é retornado no header de resposta para correlação pelo cliente.
- Em caso de erro, o `X-Request-ID` deve constar na resposta de erro para suporte.

**Critério de aceitação:** Pesquisa de um `X-Request-ID` específico nos logs deve retornar todo o rastro de execução da requisição correspondente.

---

## 6. Auditoria

Os requisitos de auditoria garantem rastreabilidade completa e imutável de todas as operações relevantes para conformidade e investigação.

---

### RNF-AUDI-001 — Registro Imutável de Operações

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Todos

**Especificação:**
Toda operação de criação, modificação ou exclusão lógica de entidades de negócio deve gerar um registro imutável na tabela `shared.audit_log`. O registro deve conter:

| Campo | Descrição | Obrigatório |
|-------|-----------|-------------|
| `id` | UUID único do registro de auditoria | Sim |
| `user_id` | Identificador do usuário que executou a operação | Sim |
| `action` | Tipo de operação: `CREATE`, `UPDATE`, `DELETE`, `ACCESS` | Sim |
| `entity_type` | Nome da entidade afetada (ex: `Incident`, `Asset`) | Sim |
| `entity_id` | Identificador da entidade afetada | Sim |
| `old_values` | Estado anterior em JSONB (apenas para UPDATE e DELETE) | Condicional |
| `new_values` | Novo estado em JSONB (apenas para CREATE e UPDATE) | Condicional |
| `occurred_at` | Timestamp com timezone da operação | Sim |
| `ip_address` | Endereço IP de origem da requisição | Sim |
| `request_id` | Identificador de correlação da requisição | Sim |

**Imutabilidade garantida por:**
- Política RLS `INSERT`-only na tabela `audit_log` — sem permissão de UPDATE ou DELETE.
- Ausência de soft-delete na tabela de auditoria.
- Campo `occurred_at` preenchido pelo banco de dados, não pela aplicação.

**Critério de aceitação:** Tentativa de DELETE na tabela `audit_log` retorna erro de política RLS; log de auditoria gerado para cada operação de escrita em módulo de negócio.

---

### RNF-AUDI-002 — Auditoria de Acesso a Dados Sensíveis

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Compliance, Identity, Finance

**Especificação:**
O acesso a dados classificados como sensíveis deve gerar registro de auditoria mesmo em operações de leitura, além das operações de escrita. São considerados dados sensíveis para fins deste requisito:

| Módulo | Dados Sensíveis | Operações Auditadas |
|--------|----------------|---------------------|
| Identity | Dados pessoais de colaboradores, perfis de acesso | Leitura, Criação, Alteração |
| Compliance | Evidências de controles, não-conformidades críticas | Leitura, Criação, Alteração |
| Finance | Valores de contratos, despesas acima de R$10.000 | Leitura, Criação, Alteração |
| Auth | Tokens de sessão, tentativas de autenticação | Todas as tentativas (sucesso e falha) |

**Critério de aceitação:** Relatório de acesso a dados sensíveis exportável por período, usuário e tipo de dado.

---

### RNF-AUDI-003 — Retenção de Registros de Auditoria

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Todos

**Especificação:**
Os registros de auditoria devem ser retidos pelos seguintes períodos mínimos, em conformidade com política interna e requisitos legais:

| Tipo de Registro | Período de Retenção | Base Legal/Política |
|-----------------|---------------------|---------------------|
| Operações em dados de compliance | 5 anos | Política interna de conformidade |
| Acesso a dados pessoais (LGPD) | 5 anos | Art. 37 da LGPD |
| Tentativas de autenticação | 1 ano | Política de segurança |
| Operações financeiras | 5 anos | Legislação tributária |
| Operações em ativos | 5 anos | Controle patrimonial |
| Logs de sistema | 1 ano | Política operacional |
| Logs de integração | 6 meses | Rastreabilidade operacional |

Após o período de retenção, os registros devem ser anonimizados (dados pessoais substituídos por hash) ou excluídos, conforme política de descarte.

**Critério de aceitação:** Job automático de purge/anonimização configurado e testado; relatório de conformidade com retenção disponível para auditoria.

---

### RNF-AUDI-004 — Exportação de Evidências para Auditoria

**Prioridade:** ALTO
**Módulos impactados:** Compliance, Identity, Finance

**Especificação:**
O sistema deve permitir a exportação de trilhas de auditoria em formatos padronizados para uso em processos de auditoria interna e externa:

| Formato | Casos de Uso |
|---------|-------------|
| PDF | Relatórios formais de conformidade, apresentações a auditores |
| CSV | Análise de dados, importação em ferramentas de BI e GRC |
| JSON | Integração com sistemas externos de GRC e SIEM |

A exportação deve suportar filtros por período, módulo, usuário, tipo de operação e entidade afetada. O arquivo exportado deve incluir metadados de geração (data, filtros aplicados, usuário que exportou) e ser assinado digitalmente para garantia de integridade.

**Critério de aceitação:** Exportação de auditoria funcional para cada formato; hash SHA-256 do arquivo incluído nos metadados para verificação de integridade.

---

## 7. Usabilidade

Os requisitos de usabilidade garantem que o SGTI seja eficiente e acessível para todos os perfis de usuário.

---

### RNF-USAB-001 — Eficiência de Tarefas Críticas

**Prioridade:** ALTO
**Módulos impactados:** Incidentes, Requisições, Portal de Autoatendimento

**Especificação:**
As tarefas mais frequentes do SGTI devem ser completáveis dentro dos limites de interações abaixo por usuários treinados:

| Tarefa | Máximo de Cliques/Ações | Máximo de Telas |
|--------|------------------------|-----------------|
| Abrir novo incidente | ≤ 5 campos obrigatórios, 1 submissão | 1 |
| Consultar status de incidente aberto | ≤ 2 cliques a partir do dashboard | 1 |
| Aprovar requisição pendente | ≤ 3 cliques (1 para acessar, 1 para revisar, 1 para aprovar) | 1 |
| Buscar artigo na Base de Conhecimento | ≤ 2 interações (1 campo de busca, 1 click no resultado) | 1 |
| Registrar novo ativo | ≤ 8 campos obrigatórios, 1 submissão | 1 |

**Critério de aceitação:** Teste de usabilidade com 5 usuários representativos completando cada tarefa dentro dos limites, sem auxílio.

---

### RNF-USAB-002 — Mensagens de Erro e Feedback

**Prioridade:** ALTO
**Módulos impactados:** Todos

**Especificação:**
Todas as mensagens de erro apresentadas ao usuário devem ser:

- **Compreensíveis:** redigidas em linguagem de negócio, sem termos técnicos ou códigos de erro expostos.
- **Acionáveis:** indicando o que o usuário pode fazer para resolver a situação.
- **Precisas:** apontando o campo ou a condição específica que causou o erro.

Mensagens de erro técnicas (stack traces, mensagens de banco de dados, detalhes de exceção) são **proibidas** em respostas ao usuário final. O código de erro interno (`X-Request-ID`) deve ser exibido para facilitar o suporte, sem expor detalhes do sistema.

**Exemplos de mensagens aceitáveis:**
```
"O campo 'Título do Incidente' é obrigatório."
"Este ativo já está alocado para outro colaborador. Desaloque-o primeiro."
"Sua sessão expirou. Faça login novamente para continuar."
```

**Critério de aceitação:** Revisão de todas as mensagens de erro do sistema; ausência de mensagens técnicas em ambiente de produção.

---

### RNF-USAB-003 — Acessibilidade (WCAG 2.1)

**Prioridade:** MÉDIO
**Módulos impactados:** Todos (frontend)

**Especificação:**
O SGTI deve atender ao nível **WCAG 2.1 AA** nas interfaces de usuário, garantindo acessibilidade para colaboradores com deficiências visuais, motoras e cognitivas.

| Critério | Requisito |
|----------|-----------|
| Contraste de cores | Mínimo 4.5:1 para texto normal; 3:1 para texto grande |
| Navegação por teclado | 100% das funcionalidades acessíveis sem mouse |
| Leitores de tela | Atributos ARIA presentes em todos os componentes interativos (shadcn/ui os provê via Radix UI) |
| Textos alternativos | Todas as imagens com `alt` descritivo |
| Formulários | Todos os campos com `label` explícito associado |
| Foco visível | Indicador de foco sempre visível em navegação por teclado |

**Critério de aceitação:** Auditoria com Lighthouse Accessibility Score ≥ 90 nas 5 páginas mais acessadas.

---

### RNF-USAB-004 — Consistência Visual e de Interação

**Prioridade:** ALTO
**Módulos impactados:** Todos (frontend)

**Especificação:**
O sistema deve manter consistência visual e de interação em todos os módulos, garantindo que padrões aprendidos em um módulo se apliquem aos demais:

- Paleta de cores e tipografia definidas no `tailwind.config.ts` e aplicadas uniformemente.
- Componentes de UI exclusivamente do shadcn/ui — sem componentes custom para elementos que já existem na biblioteca.
- Padrões de listagem (DataTable paginado), formulário (labels acima dos campos), confirmação (modal de confirmação para ações destrutivas) e feedback (toast para ações completadas) uniformes.
- Terminologia de domínio consistente com o glossário definido em `Docs/12_ARCHITECTURE.md`.

**Critério de aceitação:** Design review confirmando uniformidade entre os módulos antes do go-live.

---

## 8. Responsividade

Os requisitos de responsividade garantem que o SGTI seja utilizável em diferentes tamanhos de tela e dispositivos.

---

### RNF-RESP-001 — Suporte a Dispositivos e Resoluções

**Prioridade:** ALTO
**Módulos impactados:** Todos (frontend)

**Especificação:**
O SGTI deve ser totalmente funcional nas seguintes combinações de dispositivo e resolução:

| Categoria | Resolução Mínima | Resolução Alvo | Suporte |
|-----------|-----------------|----------------|---------|
| Desktop corporativo | 1.280 × 800 | 1.920 × 1.080 | Completo |
| Laptop | 1.366 × 768 | 1.440 × 900 | Completo |
| Tablet (landscape) | 1.024 × 768 | 1.280 × 800 | Completo |
| Tablet (portrait) | 768 × 1.024 | 810 × 1.080 | Funcional (algumas telas adaptadas) |
| Mobile (smartphone) | 375 × 667 | 390 × 844 | Portal de autoatendimento e consulta |

**Nota:** Funcionalidades administrativas complexas (gestão de compliance, configuração de SLA, dashboards financeiros) são priorizadas para desktop. O portal de autoatendimento (abertura de chamados, consulta de status, Base de Conhecimento) deve ser totalmente funcional em mobile.

**Critério de aceitação:** Teste manual nas resoluções alvo para os 3 fluxos mais críticos de cada categoria de dispositivo.

---

### RNF-RESP-002 — Design Mobile-First

**Prioridade:** ALTO
**Módulos impactados:** Portal de Autoatendimento, Base de Conhecimento, Notificações

**Especificação:**
Os módulos voltados ao usuário final (Portal de Autoatendimento, Base de Conhecimento e centro de Notificações) devem ser desenvolvidos com abordagem mobile-first, garantindo experiência otimizada em smartphones antes de adaptar para telas maiores.

Requisitos técnicos:
- Breakpoints Tailwind CSS: `sm` (640px), `md` (768px), `lg` (1.024px), `xl` (1.280px).
- Touch targets mínimos de 44×44px para elementos interativos em mobile.
- Ausência de hover-only interactions (todas as interações acessíveis por toque).
- Fontes com tamanho mínimo de 16px em mobile para evitar zoom automático em iOS.

**Critério de aceitação:** Teste em dispositivo físico (ou emulador) em iPhone SE (375px) e Android médio (390px) para os fluxos do portal de autoatendimento.

---

### RNF-RESP-003 — Performance em Dispositivos Móveis

**Prioridade:** MÉDIO
**Módulos impactados:** Portal de Autoatendimento, Base de Conhecimento

**Especificação:**
As páginas do portal de autoatendimento devem carregar adequadamente em condições de conectividade móvel:

| Condição de Rede | LCP Máximo | Funcional |
|-----------------|-----------|---------|
| Wi-Fi corporativo (100Mbps) | ≤ 1,5s | Sim |
| 4G (20Mbps) | ≤ 2,5s | Sim |
| 3G (2Mbps) | ≤ 4,0s | Sim (com skeleton loading) |

**Estratégias obrigatórias para mobile:**
- Imagens otimizadas via `next/image` com `sizes` responsivos.
- Lazy loading de imagens abaixo do fold.
- Skeleton loading para estados de carregamento de dados.
- Compressão de assets estáticos via Cloudflare.

**Critério de aceitação:** Lighthouse Performance Score ≥ 75 simulando rede 3G para páginas do portal de autoatendimento.

---

## 9. Manutenibilidade

Os requisitos de manutenibilidade garantem que o SGTI possa ser evoluído, corrigido e operado de forma eficiente ao longo do tempo.

---

### RNF-MANU-001 — Cobertura Mínima de Testes

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Todos

**Especificação:**
O SGTI deve manter cobertura de testes automatizados nos seguintes níveis mínimos:

| Camada | Cobertura Mínima | Métrica |
|--------|-----------------|---------|
| Domínio (entidades, VOs, domain services) | 90% | Statement coverage |
| Aplicação (Use Cases) | 85% | Statement coverage |
| Infraestrutura (mappers, adapters) | 70% | Statement coverage |
| Apresentação (controllers) | 100% | Endpoint coverage via Supertest |
| E2E (fluxos críticos) | 6 fluxos obrigatórios | Cobertura de cenário |

A cobertura é verificada automaticamente no pipeline CI. Pull Requests que reduzam a cobertura abaixo dos limites são bloqueados automaticamente.

**Critério de aceitação:** Relatório de cobertura publicado como artifact no GitHub Actions; pipeline CI configurado para falhar abaixo dos limites.

---

### RNF-MANU-002 — Qualidade de Código

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Todos

**Especificação:**
O código do SGTI deve atender aos seguintes critérios de qualidade, verificados automaticamente no pipeline CI:

| Critério | Ferramenta | Limite |
|----------|-----------|--------|
| Ausência de erros TypeScript | `tsc --noEmit` | Zero erros |
| Lint sem erros | ESLint | Zero erros |
| Formatação padronizada | Prettier | Zero divergências |
| Ausência de `any` explícito | ESLint `@typescript-eslint/no-explicit-any` | Zero ocorrências |
| Imports circulares | ESLint `import/no-cycle` | Zero ocorrências |
| Imports entre módulos | ESLint `no-restricted-imports` | Zero violações |
| Complexidade ciclomática | ESLint `complexity` | Máximo 10 por função |
| Tamanho de função | ESLint `max-lines-per-function` | Máximo 30 linhas |

**Critério de aceitação:** Pipeline CI passing em todos os checks acima para cada Pull Request.

---

### RNF-MANU-003 — Documentação de Decisões Técnicas

**Prioridade:** ALTO
**Módulos impactados:** Todos

**Especificação:**
Toda decisão arquitetural ou técnica relevante deve ser registrada em formato ADR em `Docs/82_ARCHITECT_DECISIONS.md`. São consideradas decisões relevantes:

- Adoção ou substituição de biblioteca ou framework.
- Mudança no modelo de dados com impacto em múltiplos módulos.
- Introdução de padrão arquitetural não previsto nos documentos existentes.
- Decisão que contradiga ou complemente documentação já aprovada.

O registro deve ocorrer antes da implementação, não após. ADRs são imutáveis — novas decisões que contradigam ADRs existentes criam novos ADRs que supersede os anteriores, sem modificar o histórico.

**Critério de aceitação:** Revisão trimestral de ADRs confirmando que nenhuma decisão técnica relevante foi implementada sem registro.

---

### RNF-MANU-004 — Versionamento Semântico da API

**Prioridade:** ALTO
**Módulos impactados:** Todos (API REST)

**Especificação:**
A API do SGTI deve seguir versionamento semântico com as seguintes regras de compatibilidade:

| Tipo de Mudança | Ação Obrigatória | Período de Depreciação |
|----------------|-----------------|----------------------|
| Adição de campo opcional em resposta | Nenhuma (compatível) | N/A |
| Adição de campo obrigatório em requisição | Nova versão (`/v2/`) | N/A |
| Remoção de campo de resposta | Header `Deprecation` + nova versão | Mínimo 90 dias |
| Alteração de tipo de campo | Nova versão (`/v2/`) | N/A |
| Remoção de endpoint | Header `Deprecation` + nova versão | Mínimo 90 dias |

O schema OpenAPI 3.0 é gerado e versionado no pipeline CI. Breaking changes são detectados automaticamente via diff do schema em Pull Requests.

**Critério de aceitação:** Pipeline CI com detecção automática de breaking changes na API.

---

## 10. Backup

Os requisitos de backup garantem que os dados do SGTI possam ser recuperados em caso de perda acidental ou falha de sistema.

---

### RNF-BACK-001 — Backup do Banco de Dados

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Todos

**Especificação:**

| Parâmetro | Requisito |
|-----------|-----------|
| Frequência | Diária (automática via Supabase) |
| Tipo | Point-in-time recovery (PITR) |
| Retenção (plano gratuito) | 7 dias |
| Retenção (plano Pro — produção) | 30 dias |
| RPO (Recovery Point Objective) | ≤ 24 horas |
| Verificação de integridade | Restore de teste mensal em ambiente isolado |
| Localização dos backups | Gerenciado pelo Supabase (região configurada no projeto) |

**Critério de aceitação:** Restore de teste executado mensalmente com confirmação de integridade dos dados restaurados.

---

### RNF-BACK-002 — Backup de Arquivos (Supabase Storage)

**Prioridade:** ALTO
**Módulos impactados:** Compliance, Incidentes, Projetos, Base de Conhecimento

**Especificação:**

| Parâmetro | Requisito |
|-----------|-----------|
| Frequência | Semanal (backup incremental) |
| Itens cobertos | Evidências de compliance, anexos de chamados, documentos de projeto |
| Método | Export manual para bucket de backup separado |
| Retenção | 90 dias para arquivos de compliance; 30 dias para demais |
| RPO | ≤ 7 dias |

**Critério de aceitação:** Procedimento de backup de storage documentado em `Docs/Operação/22_RUNBOOK.md` e executado semanalmente.

---

### RNF-BACK-003 — Backup de Configurações e Segredos

**Prioridade:** ALTO
**Módulos impactados:** Todos (infraestrutura)

**Especificação:**
As configurações do sistema devem ser versionadas e recuperáveis:

| Artefato | Método de Backup | Frequência |
|----------|-----------------|-----------|
| Schema Prisma e migrations | Git (repositório) | A cada commit |
| Variáveis de ambiente | Documentadas em `.env.example` sem valores reais; valores reais no Vercel | A cada alteração |
| Configurações Cloudflare (DNS, rules) | Export manual via Cloudflare API | Mensal |
| Documentação de configuração | `Docs/Operação/21_DEPLOYMENT_GUIDE.md` | A cada alteração |

**Critério de aceitação:** Ambiente completo recriado a partir do repositório e das variáveis de ambiente em menos de 4 horas.

---

## 11. Recuperação de Desastre

Os requisitos de recuperação de desastre definem os objetivos e procedimentos para restauração do sistema em cenários de falha grave.

---

### RNF-DISA-001 — Objetivos de Recuperação

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Todos

**Especificação:**
Os objetivos de recuperação de desastre do SGTI são:

| Objetivo | Definição | Meta |
|----------|-----------|------|
| **RPO** (Recovery Point Objective) | Máximo de dados perdidos em caso de desastre | ≤ 24 horas |
| **RTO** (Recovery Time Objective) | Tempo máximo para restaurar o serviço | ≤ 4 horas |

**Componentes cobertos pelo plano de DR:**

| Componente | RPO | RTO | Estratégia |
|------------|-----|-----|-----------|
| Banco de dados (Supabase) | 24h | 2h | Restore de backup via Supabase dashboard |
| Frontend (Vercel) | 0 (código no Git) | 30min | Redeploy via Vercel CLI |
| Backend (NestJS) | 0 (código no Git) | 1h | Redeploy via pipeline CI/CD |
| Variáveis de ambiente | 0 (documentadas) | 30min | Reconfiguração via Vercel Environment Variables |
| Arquivos (Storage) | 7 dias | 2h | Restore de backup semanal |

**Critério de aceitação:** Exercício de DR executado semestralmente com restauração completa do ambiente dentro dos objetivos definidos.

---

### RNF-DISA-002 — Plano de Rollback de Deploy

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Todos

**Especificação:**
Todo deploy de produção deve ter plano de rollback documentado e testado. O rollback deve ser executável em menos de 5 minutos para o frontend e 15 minutos para o backend.

| Componente | Mecanismo de Rollback | Tempo Estimado |
|------------|----------------------|----------------|
| Frontend (Next.js) | Vercel Dashboard: "Promote to Production" em deployment anterior | < 2 minutos |
| Backend (NestJS) | Reverter commit + push para `main` + pipeline CD | < 15 minutos |
| Migrations de banco | Migration de reversão criada manualmente + `prisma migrate deploy` | Variável (30min+) |

**Regra:** Migrations destrutivas (DROP coluna, DROP tabela) exigem aprovação dupla do arquiteto e possuem janela de rollback restrita. Estratégia expand-contract obrigatória para estas operações.

**Critério de aceitação:** Rollback simulado em ambiente de staging com tempo cronometrado antes de cada release de produção.

---

### RNF-DISA-003 — Continuidade Operacional com Integração Indisponível

**Prioridade:** ALTO
**Módulos impactados:** Incidentes, Identity, Notification

**Especificação:**
O SGTI deve manter operação parcial mesmo quando integrações críticas estão indisponíveis, conforme definido em RNF-DISP-004. O plano de continuidade para os cenários mais críticos é:

**Cenário: Google OAuth indisponível**
- Impacto: usuários não conseguem realizar novo login.
- Mitigação: sessões ativas (com Access Token válido) continuam funcionando por até 1 hora; Refresh Token permite renovação até Google ser restaurado.
- Duração tolerável: até 4 horas (SLA do Google é 99,9% — ≈ 8,7h de downtime/ano).

**Cenário: Supabase indisponível**
- Impacto: sistema completamente indisponível (banco de dados é o coração do sistema).
- Mitigação: SLA do Supabase Pro é 99,9%. Monitorar status.supabase.com. Executar RTO de 2h via restore de backup se necessário.

**Cenário: GLPI indisponível**
- Impacto: chamados não sincronizados com GLPI.
- Mitigação: chamados continuam sendo criados no SGTI; sincronização enfileirada; circuit breaker ativado após 10 falhas.

**Critério de aceitação:** Testes de falha de cada integração crítica com verificação de comportamento esperado.

---

## 12. Logs

Os requisitos de logs definem o que deve ser registrado, como e por quanto tempo, para suporte à operação e investigação de incidentes.

---

### RNF-LOGS-001 — Estrutura de Logs

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Todos

**Especificação:**
Todos os logs do SGTI devem ser estruturados em formato JSON com os seguintes campos obrigatórios:

```json
{
  "timestamp": "2026-06-09T14:30:00.000Z",
  "level": "ERROR",
  "service": "sgti-api",
  "module": "incident",
  "requestId": "req-uuid-aqui",
  "userId": "user-uuid-aqui",
  "message": "Descrição legível do evento",
  "context": {
    "entityType": "Incident",
    "entityId": "incident-uuid",
    "action": "resolve",
    "additionalData": {}
  },
  "error": {
    "name": "IncidentAlreadyResolvedException",
    "message": "Incident with id X is already resolved",
    "stack": "apenas em ambiente de desenvolvimento"
  }
}
```

**Proibições em logs:**
- Dados pessoais identificáveis (nome completo, CPF, e-mail pessoal) — registrar apenas `userId`.
- Senhas, tokens, API keys ou qualquer credencial.
- Dados financeiros de clientes (valores, dados bancários).
- Stack traces completos em produção (apenas em desenvolvimento).

**Critério de aceitação:** Inspeção de 100 logs de produção aleatórios confirmando ausência de PII e credenciais.

---

### RNF-LOGS-002 — Níveis de Log e Casos de Uso

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Todos

**Especificação:**

| Nível | Quando Usar | Exemplos |
|-------|------------|---------|
| `ERROR` | Falha que impede a operação de ser concluída | Exceção não tratada, falha de banco, integração indisponível |
| `WARN` | Situação anômala que não impede a operação mas requer atenção | Retry de integração, SLA em risco, lentidão de query |
| `INFO` | Eventos significativos de negócio e operação | Incidente aberto, usuário provisionado, relatório gerado |
| `DEBUG` | Informações detalhadas de diagnóstico | Parâmetros de query, payloads de integração, estado intermediário |

`DEBUG` é habilitado apenas em ambiente de desenvolvimento. Em produção, apenas `INFO`, `WARN` e `ERROR` são registrados.

**Critério de aceitação:** Verificação de que logs `DEBUG` não aparecem em produção; cobertura de logs `INFO` para todos os casos de uso principais.

---

### RNF-LOGS-003 — Retenção e Armazenamento de Logs

**Prioridade:** ALTO
**Módulos impactados:** Todos

**Especificação:**

| Tipo de Log | Plataforma | Retenção | Acesso |
|-------------|-----------|---------|--------|
| Logs de runtime (Serverless Functions) | Vercel Logs | 1 hora (plano gratuito) | Dashboard Vercel |
| Logs `ERROR` e `WARN` persistidos | Supabase (tabela `system_logs`) | 1 ano | API interna |
| Logs de auditoria de negócio | Supabase (tabela `audit_log`) | 5 anos | API interna + exportação |
| Logs de integração (GLPI, Google) | Supabase (tabela `sync_failures`) | 6 meses | API interna |

**Mitigação da retenção limitada do Vercel (1 hora):**
O `LoggerService` do SGTI persiste automaticamente logs de nível `ERROR` e `WARN` na tabela `shared.system_logs` do Supabase, garantindo retenção de 1 ano independentemente das limitações da plataforma de hospedagem.

**Critério de aceitação:** Log `ERROR` gerado em produção aparece na tabela `system_logs` em menos de 30 segundos; pesquisa por `requestId` retorna todos os logs associados.

---

### RNF-LOGS-004 — Alertas Baseados em Logs

**Prioridade:** ALTO
**Módulos impactados:** Todos

**Especificação:**
Os seguintes eventos de log devem gerar alertas automáticos para a equipe de TI responsável:

| Evento | Nível | Canal de Alerta | Urgência |
|--------|-------|----------------|---------|
| Taxa de erros 5xx > 5% em 5 minutos | ERROR | E-mail `implantacao@pinpag.com.br` | Imediato |
| Falha de backup do banco de dados | ERROR | E-mail | Imediato |
| Integração GLPI com circuit breaker ativado | WARN | E-mail | 1 hora |
| Supabase atingindo 80% do limite de armazenamento | WARN | E-mail | 24 horas |
| Tentativas de acesso com credenciais inválidas repetidas (> 10/min por IP) | WARN | E-mail | 1 hora |
| Job de monitoramento de SLA com falha | ERROR | E-mail | Imediato |

**Critério de aceitação:** Simulação de cada evento de alerta confirmando disparo correto do e-mail de notificação.

---

## 13. LGPD — Proteção de Dados Pessoais

Os requisitos de LGPD definem os controles obrigatórios para conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).

---

### RNF-LGPD-001 — Mapeamento de Dados Pessoais

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Identity, Compliance, Todos que processam dados de colaboradores

**Especificação:**
Todos os dados pessoais processados pelo SGTI devem estar mapeados e documentados, incluindo:

| Campo | Obrigatório no Mapeamento |
|-------|--------------------------|
| Finalidade do tratamento | Sim |
| Base legal (Art. 7º ou Art. 11 da LGPD) | Sim |
| Categorias de titulares | Sim |
| Categorias de dados | Sim |
| Período de retenção | Sim |
| Compartilhamento com terceiros | Sim |
| Medidas de segurança aplicadas | Sim |

**Dados pessoais processados pelo SGTI (inventário mínimo):**

| Dado | Módulo | Base Legal | Finalidade |
|------|--------|-----------|-----------|
| Nome do colaborador | Identity | Legítimo interesse (Art. 7º, IX) | Identificação para atendimento |
| E-mail corporativo | Identity | Legítimo interesse | Comunicação e autenticação |
| Cargo e unidade organizacional | Identity | Legítimo interesse | Controle de acesso RBAC |
| Histórico de acessos concedidos | Identity | Obrigação legal (compliance) | Rastreabilidade de segurança |
| IP de acesso | Auth, Audit | Legítimo interesse | Segurança e auditoria |
| Registro de chamados abertos | Incidents | Legítimo interesse | Prestação de serviço de TI |

**Critério de aceitação:** Registro de Atividades de Tratamento (ROPA) documentado e revisado pelo DPO antes do go-live.

---

### RNF-LGPD-002 — Minimização de Dados

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Todos

**Especificação:**
O SGTI deve tratar apenas os dados pessoais estritamente necessários para cada finalidade declarada. São proibidos:

- Coleta de dados além do necessário para a funcionalidade (ex: data de nascimento não é necessária para gestão de chamados).
- Retenção de dados além do período necessário.
- Replicação de dados pessoais entre módulos — módulos referenciam `user_id`, não copiam nome, e-mail ou outros atributos pessoais.
- Uso de dados de produção (incluindo dados pessoais reais) em ambientes de desenvolvimento e teste — usar dados sintéticos.

**Critério de aceitação:** Revisão do schema de banco confirmando ausência de campos desnecessários; confirmação de que ambientes de dev/staging usam dados sintéticos.

---

### RNF-LGPD-003 — Direitos dos Titulares

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Identity, Compliance, Todos

**Especificação:**
O SGTI deve suportar o exercício dos direitos dos titulares previstos no Art. 18 da LGPD:

| Direito (Art. 18) | Implementação no SGTI |
|-------------------|----------------------|
| **Acesso** (inciso I) | API `GET /api/admin/users/:id/personal-data` exporta todos os dados pessoais do titular |
| **Correção** (inciso III) | Dados pessoais do Identity atualizados via Google Workspace (fonte autoritativa) |
| **Anonimização/Bloqueio** (inciso IV) | Job de anonimização executado ao final do período de retenção |
| **Eliminação** (inciso VI) | Procedimento documentado para eliminação de dados após desligamento + período legal |
| **Portabilidade** (inciso V) | Exportação de dados do titular em formato JSON via API autenticada |
| **Informação** (inciso VII/VIII) | Política de privacidade documentada e acessível no sistema |

**Prazo de resposta às solicitações:** máximo 15 dias úteis a partir do recebimento da solicitação formal.

**Critério de aceitação:** Procedimento formal para atendimento de solicitações documentado; teste de extração e anonimização de dados de usuário de teste.

---

### RNF-LGPD-004 — Segurança no Tratamento

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Todos

**Especificação:**
O tratamento de dados pessoais deve obedecer às seguintes medidas de segurança técnica:

| Medida | Implementação |
|--------|--------------|
| Pseudonimização | `user_id` (UUID) utilizado em logs e módulos — nunca nome ou e-mail diretamente |
| Criptografia em repouso | Supabase criptografa dados em repouso por padrão (AES-256) |
| Criptografia em trânsito | TLS 1.2+ obrigatório (RNF-SECU-002) |
| Controle de acesso | RBAC + RLS (RNF-SECU-003) |
| Auditoria de acesso | Registro de toda consulta a dados sensíveis (RNF-AUDI-002) |
| Anonimização pós-retenção | Job automático ao atingir período de retenção (RNF-AUDI-003) |

**Critério de aceitação:** Relatório de Impacto à Proteção de Dados (RIPD) elaborado e aprovado pelo DPO antes do go-live.

---

### RNF-LGPD-005 — Gestão de Incidentes de Segurança com Dados Pessoais

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Todos

**Especificação:**
Em caso de incidente de segurança que envolva dados pessoais (vazamento, acesso não autorizado, perda), o SGTI e a organização devem:

1. **Identificar e conter** o incidente em até 4 horas após detecção.
2. **Avaliar o impacto** sobre os titulares afetados em até 24 horas.
3. **Comunicar à ANPD** em até 72 horas, quando o incidente puder acarretar risco ou dano relevante aos titulares (Art. 48 da LGPD).
4. **Comunicar os titulares afetados** em prazo razoável após a notificação à ANPD.
5. **Registrar o incidente** no módulo de Compliance do SGTI como Não-Conformidade de severidade Crítica.

**Critério de aceitação:** Procedimento de resposta a incidentes de dados pessoais documentado em `Docs/Operação/22_RUNBOOK.md`; exercício simulado semestralmente.

---

## 14. Integrações

Os requisitos de integração definem as garantias de qualidade, resiliência e segurança para todas as integrações externas do SGTI.

---

### RNF-INTG-001 — Contrato de Integração (Anti-Corruption Layer)

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Todos com integrações externas

**Especificação:**
Toda integração com sistema externo deve ser isolada por uma camada de Anti-Corruption Layer (ACL) implementada como Adapter na camada de infraestrutura do NestJS. Nenhum código de domínio ou de aplicação deve conter referências a modelos de dados de sistemas externos.

| Integração | Interface (Port) | Adapter | Modelo Externo Isolado |
|------------|-----------------|---------|----------------------|
| Google OAuth | `IGoogleOAuthPort` | `GoogleOAuthAdapter` | Google id_token, authorization code |
| Google Directory | `IGoogleUserPort`, `IGoogleGroupPort` | `GoogleDirectoryAdapter` | Admin SDK User, Group |
| GLPI Tickets | `IGlpiTicketPort` | `GlpiTicketAdapter` | GLPI Ticket model |
| GLPI Assets | `IGlpiAssetPort` | `GlpiAssetAdapter` | GLPI Computer, Monitor model |
| GitHub | `IGithubRepoPort`, `IGithubActionsPort` | `GithubAdapter` | GitHub Repository, WorkflowRun |
| Vercel | `IVercelDeployPort` | `VercelAdapter` | Vercel Deployment |
| SMTP (Email) | `ISmtpEmailPort` | `NodemailerSmtpAdapter` | Nodemailer transport |

**Critério de aceitação:** Inspeção de código confirmando ausência de modelos de sistemas externos nas camadas de domínio e aplicação.

---

### RNF-INTG-002 — Resiliência de Integrações

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Todos com integrações externas

**Especificação:**
Todas as integrações externas devem implementar os seguintes mecanismos de resiliência:

| Mecanismo | Especificação |
|-----------|--------------|
| **Timeout** | Máximo de 5 segundos para operações síncronas; 30 segundos para operações batch |
| **Retry com backoff** | 3 tentativas com backoff exponencial: 30s → 2min → 10min |
| **Circuit breaker** | Abrir após 10 falhas consecutivas; retentar após 15 minutos |
| **Fallback** | Operação principal do SGTI não deve falhar devido à falha de integração (ver RNF-DISP-004) |
| **Dead letter** | Após 5 tentativas sem sucesso, registrar em `sync_failures` e alertar administrador |
| **Idempotência** | Operações de sincronização devem ser idempotentes — reprocessamento não deve duplicar dados |

**Critério de aceitação:** Teste de falha de cada integração confirmando ativação correta dos mecanismos de resiliência.

---

### RNF-INTG-003 — Segurança das Integrações

**Prioridade:** MANDATÓRIO
**Módulos impactados:** Todos com integrações externas

**Especificação:**

| Requisito | Aplicação |
|-----------|-----------|
| Todas as comunicações via HTTPS/TLS 1.2+ | Google, GLPI, GitHub, Vercel, Supabase |
| Credenciais armazenadas em variáveis de ambiente (nunca em código) | Todos |
| Credenciais com escopo mínimo necessário | Google Service Account com delegação limitada; GLPI token com permissões específicas |
| Rotação periódica de credenciais | Semestral; documentada em `Docs/Operação/22_RUNBOOK.md` |
| Validação de webhook (HMAC) | GitHub webhooks validados via `X-Hub-Signature-256` |
| Tokens de integração sem expiração desabilitados | Revisar e habilitar rotação onde possível |

**Critério de aceitação:** Auditoria semestral de todas as credenciais de integração; confirmação de escopos mínimos.

---

### RNF-INTG-004 — Monitoramento de Saúde das Integrações

**Prioridade:** ALTO
**Módulos impactados:** GLPI, Google Workspace, Email

**Especificação:**
O status operacional de cada integração deve ser monitorado e acessível:

| Integração | Método de Verificação | Frequência | Alerta em |
|------------|----------------------|-----------|----------|
| GLPI | `GET /api/integrations/glpi/health` | A cada 5 minutos | > 2 falhas consecutivas |
| Google Workspace | `GET /api/integrations/google/health` | A cada 10 minutos | > 1 falha |
| Email (SMTP) | Verificação de conexão SMTP | A cada 15 minutos | > 1 falha |
| GitHub | `GET /api/integrations/github/health` | A cada 30 minutos | > 3 falhas consecutivas |

O endpoint `GET /api/health` agrega o status de todas as integrações (conforme RNF-OBSE-001).

**Critério de aceitação:** Dashboard de saúde das integrações funcionando; alerta disparado em menos de 10 minutos após falha de integração crítica.

---

## 15. Matriz de Rastreabilidade

A tabela abaixo mapeia os requisitos não funcionais com os módulos do sistema afetados, facilitando a priorização e verificação durante o desenvolvimento.

| RNF | Incidentes | Requisições | Problemas | Ativos | Identidades | Compliance | Financeiro | Compras | Projetos | KB | Catálogo | SLA | Dashboards |
|-----|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| PERF-001 | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| PERF-002 | ● | ● | ○ | ● | ● | ○ | ○ | ○ | ● | ● | ● | ○ | ● |
| PERF-003 | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| PERF-004 | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ● | ○ | ○ | ○ |
| PERF-005 | ● | ● | ○ | ● | ● | ● | ● | ○ | ● | ○ | ○ | ● | ● |
| ESCA-001 | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| SECU-001 | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| SECU-003 | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| AUDI-001 | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ○ | ○ |
| AUDI-002 | ○ | ○ | ○ | ○ | ● | ● | ● | ○ | ○ | ○ | ○ | ○ | ○ |
| LGPD-001 | ● | ● | ○ | ○ | ● | ● | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| LGPD-002 | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| INTG-001 | ● | ○ | ○ | ● | ● | ○ | ○ | ○ | ● | ○ | ○ | ○ | ● |
| INTG-002 | ● | ○ | ○ | ● | ● | ○ | ○ | ○ | ● | ○ | ○ | ○ | ○ |

**Legenda:** ● Impacto direto · ○ Impacto indireto ou parcial

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição da Alteração |
|--------|------|-------|------------------------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa | Criação do documento com 14 categorias de RNFs |

---

> **Próximos documentos recomendados:**
> [`12_ARCHITECTURE.md`](./12_ARCHITECTURE.md) — Arquitetura corporativa e decisões técnicas
> [`80_IMPLEMENTATION_ORDER.md`](./80_IMPLEMENTATION_ORDER.md) — Ordem de implementação com critérios de conclusão
> [`82_ARCHITECT_DECISIONS.md`](./82_ARCHITECT_DECISIONS.md) — ADRs relacionados às decisões que endereçam estes RNFs
