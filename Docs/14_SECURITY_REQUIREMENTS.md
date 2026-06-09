# SGTI — Sistema de Gestão de Tecnologia da Informação
## Requisitos de Segurança

> **Classificação:** Interno — Confidencial
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI · Segurança da Informação
> **Documentos Relacionados:** [12_ARCHITECTURE.md](./12_ARCHITECTURE.md) · [13_NON_FUNCTIONAL_REQUIREMENTS.md](./13_NON_FUNCTIONAL_REQUIREMENTS.md) · [82_ARCHITECT_DECISIONS.md](./82_ARCHITECT_DECISIONS.md)

---

## Sobre este Documento

Este documento especifica os **Requisitos de Segurança** do SGTI, estabelecendo os controles técnicos e organizacionais obrigatórios para proteção dos dados, da infraestrutura e dos processos do sistema. Os requisitos são fundamentados nas práticas do **OWASP Application Security Verification Standard (ASVS) v4.0** e do **OWASP Top 10 2021**, adaptados ao contexto corporativo e à stack tecnológica do SGTI.

### Referências Normativas

| Framework | Versão | Uso |
|-----------|--------|-----|
| OWASP ASVS | 4.0.3 | Referência principal para controles técnicos de segurança |
| OWASP Top 10 | 2021 | Referência para ameaças comuns a aplicações web |
| ISO/IEC 27001 | 2022 | Framework de gestão de segurança da informação |
| LGPD | Lei nº 13.709/2018 | Proteção de dados pessoais |
| NIST SP 800-63B | 2024 | Diretrizes para identidade digital e autenticação |

### Nível de Verificação ASVS

O SGTI opera no **Nível 2 (Standard)** do OWASP ASVS, aplicável a sistemas que processam dados pessoais sensíveis, dados financeiros e informações de conformidade regulatória. Controles do Nível 3 são aplicados seletivamente nos módulos de Authentication, Identity e Compliance.

### Identificação dos Requisitos

```
RS-[CATEGORIA]-[NÚMERO]
```

| Código | Categoria |
|--------|-----------|
| `AUTH` | Autenticação |
| `AUTHZ` | Autorização |
| `RBAC` | Controle de Acesso Baseado em Papéis |
| `MFA` | Autenticação Multifator |
| `CRYPT` | Criptografia |
| `API` | Proteção de APIs |
| `AUDIT` | Auditoria e Rastreabilidade |
| `LOG` | Logs de Segurança |
| `LGPD` | Proteção de Dados Pessoais |
| `SESS` | Gestão de Sessões |
| `ATK` | Proteção contra Ataques |
| `BKP` | Backup e Recuperação |
| `EVID` | Evidências de Compliance |
| `SECRET` | Gestão de Segredos |
| `ADMIN` | Controle de Acesso Administrativo |

---

## Sumário

1. [Autenticação](#1-autenticação)
2. [Autorização](#2-autorização)
3. [RBAC — Controle de Acesso por Papel](#3-rbac--controle-de-acesso-por-papel)
4. [MFA — Autenticação Multifator](#4-mfa--autenticação-multifator)
5. [Criptografia](#5-criptografia)
6. [Proteção de APIs](#6-proteção-de-apis)
7. [Auditoria e Rastreabilidade](#7-auditoria-e-rastreabilidade)
8. [Logs de Segurança](#8-logs-de-segurança)
9. [LGPD — Proteção de Dados Pessoais](#9-lgpd--proteção-de-dados-pessoais)
10. [Gestão de Sessões](#10-gestão-de-sessões)
11. [Proteção contra Ataques Comuns](#11-proteção-contra-ataques-comuns)
12. [Backup e Recuperação de Desastres](#12-backup-e-recuperação-de-desastres)
13. [Gestão de Evidências de Compliance](#13-gestão-de-evidências-de-compliance)
14. [Gestão de Segredos](#14-gestão-de-segredos)
15. [Controle de Acesso Administrativo](#15-controle-de-acesso-administrativo)
16. [Matriz de Controles OWASP ASVS](#16-matriz-de-controles-owasp-asvs)

---

## 1. Autenticação

### RS-AUTH-001 — Autenticação Federada Exclusiva via Google Workspace

**Referência ASVS:** V2.1 (Password Security), V2.6 (Look-up Secret Verifier)
**Prioridade:** MANDATÓRIO

O SGTI não deve implementar, armazenar ou processar credenciais locais de usuário. Toda autenticação de usuários humanos é obrigatoriamente delegada ao **Google Workspace via OAuth 2.0 com PKCE (Proof Key for Code Exchange)**.

**Proibições absolutas:**
- Armazenamento de senhas em qualquer formato (texto plano, hash MD5, bcrypt, argon2 ou qualquer outro).
- Formulário de login com campo de senha próprio do SGTI.
- Mecanismo de reset ou recuperação de senha próprio.
- Autenticação por API Key para usuários humanos interativos.
- Basic Authentication em qualquer endpoint.

**Fluxo OAuth 2.0 obrigatório com PKCE:**

```
1. Geração de code_verifier (random 64 bytes, base64url-encoded)
2. code_challenge = SHA256(code_verifier), base64url-encoded
3. Redirecionar para Google com code_challenge e method=S256
4. Google retorna authorization_code
5. Backend troca authorization_code + code_verifier por id_token
6. Validar id_token (assinatura RS256, issuer, audience, expiração)
7. Emitir JWT SGTI e definir cookies de sessão
```

**Validações obrigatórias do id_token Google:**
- Assinatura verificada com chave pública do Google (JWK URI dinâmico).
- `iss` deve ser `accounts.google.com` ou `https://accounts.google.com`.
- `aud` deve corresponder ao `GOOGLE_CLIENT_ID` configurado.
- `exp` deve ser no futuro (com tolerância de clock skew de ≤ 5 minutos).
- `hd` (hosted domain) deve corresponder ao domínio corporativo configurado — rejeitar contas pessoais @gmail.com.

---

### RS-AUTH-002 — Proteção do Fluxo de Autenticação

**Referência ASVS:** V2.1.7, V3.4 (Cookie-based Session Management)
**Prioridade:** MANDATÓRIO

**State parameter anti-CSRF:**
- Parâmetro `state` gerado como random UUID v4 por sessão.
- Armazenado em cookie `SameSite=Strict` e validado no callback.
- Rejeitar callbacks com `state` ausente, expirado (> 10 minutos) ou não correspondente.

**Proteção do endpoint de callback:**
- Rate limiting de 10 requisições por IP por minuto.
- Rejeitar `authorization_code` reutilizado (codes são de uso único no Google).
- Timeout de 5 segundos para troca do code por token com o Google.
- Registrar todas as tentativas de autenticação (sucesso e falha) no audit_log.

**Proteção contra abertura de redirecionamento (Open Redirect):**
- O parâmetro `redirect_uri` deve corresponder exatamente à URI registrada no Google Cloud Console.
- Rejeitar qualquer tentativa de manipular o destino pós-login para URL externa.

---

### RS-AUTH-003 — Autenticação de Serviços e Integrações

**Referência ASVS:** V2.10 (Service Authentication)
**Prioridade:** MANDATÓRIO

Comunicação máquina a máquina (backend → integrações externas) usa mecanismos específicos por integração:

| Integração | Mecanismo de Autenticação | Tipo de Credencial |
|------------|--------------------------|-------------------|
| Google Workspace (Directory API) | Service Account com delegação de domínio | JSON key file (rotação anual) |
| GLPI REST API | Session Token renovado a cada 12 horas | App Token + User Token (armazenados em env vars) |
| Supabase | Service Role Key para operações privilegiadas; Anon Key para operações públicas | JWT (gerenciado pelo Supabase) |
| GitHub API | Personal Access Token com escopo mínimo | PAT (rotação semestral) |
| Vercel API | Token de projeto com escopo mínimo | Bearer Token (rotação semestral) |
| SMTP (Email) | Credenciais OAuth2 da conta de serviço | OAuth2 refresh token |

**Controles obrigatórios para credenciais de serviço:**
- Armazenadas exclusivamente em Vercel Environment Variables (criptografadas em repouso).
- Nunca presentes em código-fonte, mesmo em arquivos `.env` commitados.
- Escopo mínimo necessário — rejeitar escopos mais amplos que o necessário.
- Auditoria de uso: toda chamada a API externa registrada em `sync_failures` ou `system_logs`.

---

## 2. Autorização

### RS-AUTHZ-001 — Verificação de Autorização em Todas as Camadas

**Referência ASVS:** V4.1 (General Access Control Design), V4.2 (Operation Level Access Control)
**Prioridade:** MANDATÓRIO

A autorização no SGTI opera em **dupla camada independente**. A falha de uma camada não deve comprometer a segurança da outra:

```
Camada 1 — Aplicação (NestJS Guards):
  JwtAuthGuard     → verifica token válido e não expirado
  RolesGuard       → verifica papel suficiente para o endpoint
  ModuleAccessGuard → verifica acesso ao módulo específico

Camada 2 — Banco de Dados (PostgreSQL RLS):
  Políticas RLS    → isolam dados por user_id e role
  INSERT-only      → tabelas de auditoria sem UPDATE/DELETE
```

**Princípio de negação por padrão:**
- Na ausência de política de autorização explícita, o acesso é **negado**.
- Endpoints NestJS sem `@UseGuards(JwtAuthGuard)` são proibidos (exceto os declarados explicitamente como públicos com `@Public()`).
- Tabelas PostgreSQL sem política RLS são proibidas para dados de negócio.

**Verificação do lado do servidor obrigatória:**
- Decisões de autorização nunca são tomadas exclusivamente no frontend.
- O frontend pode ocultar elementos de UI baseado no papel, mas a API sempre valida.
- Qualquer endpoint que retorne dados deve verificar se o usuário tem acesso aos dados específicos, não apenas ao endpoint genérico (ex: verificar que o incidente retornado pertence ao scope do usuário).

---

### RS-AUTHZ-002 — Controle de Acesso a Dados (Object-Level Authorization)

**Referência ASVS:** V4.2.1 (IDOR Prevention)
**Prioridade:** MANDATÓRIO

O acesso a recursos individuais deve verificar a propriedade ou a permissão de acesso ao objeto específico, prevenindo Insecure Direct Object Reference (IDOR):

**Implementação obrigatória:**

```
❌ INSEGURO — apenas verifica autenticação:
GET /api/incidents/123
→ JwtAuthGuard passa ✓
→ Retorna incidente 123 sem verificar se pertence ao escopo do usuário ✗

✅ SEGURO — verifica posse + papel:
GET /api/incidents/123
→ JwtAuthGuard passa ✓
→ RolesGuard verifica papel mínimo ✓
→ Repositório aplica filtro: WHERE id=123 AND (reporter_id=:userId OR assignee_id=:userId)
  OU usuário tem papel IT_MANAGER ou superior ✓
→ RLS PostgreSQL como segunda verificação ✓
```

**Controles por módulo:**

| Módulo | Dado Sensível | Controle de Acesso ao Objeto |
|--------|--------------|------------------------------|
| Incidentes | Chamado individual | Reporter, assignee ou IT_MANAGER+ |
| Identidades | Dados pessoais de usuário | Próprio usuário ou IT_MANAGER+ |
| Compliance | Evidências de controle | COMPLIANCE_OFFICER ou IT_MANAGER+ |
| Financeiro | Despesas e contratos | FINANCIAL_ANALYST ou IT_MANAGER+ |
| Projetos | Dados do projeto | Membro do projeto ou IT_MANAGER+ |

---

### RS-AUTHZ-003 — Segregação de Funções

**Referência ASVS:** V4.1.3
**Prioridade:** MANDATÓRIO

Funções conflitantes não devem ser exercidas pelo mesmo usuário na mesma operação:

| Conflito | Regra de Negócio |
|----------|-----------------|
| Criar e aprovar a própria requisição | Proibido — aprovador não pode ser o solicitante |
| Criar e auditar o próprio controle de compliance | Proibido — evidência deve ser validada por terceiro |
| Registrar e aprovar a própria despesa | Proibido — despesa acima do threshold requer aprovação de terceiro |
| Criar e aprovar pedido de compra | Proibido acima do threshold de valor |
| Provisionar acesso e revogar sem revisão | Revisão periódica obrigatória por responsável distinto |

**Implementação:** validação no Use Case correspondente, verificando que `requesterId !== approverId`, com exceção explicitamente documentada para organizações com equipe reduzida (configurável por parâmetro de sistema).

---

## 3. RBAC — Controle de Acesso por Papel

### RS-RBAC-001 — Definição de Papéis e Permissões

**Referência ASVS:** V4.1.2
**Prioridade:** MANDATÓRIO

O SGTI implementa RBAC com os seguintes papéis e matrizes de permissão. Permissões são aditivas — usuário com papel mais alto herda todas as permissões dos papéis inferiores na hierarquia.

**Hierarquia de papéis:**

```
SUPER_ADMIN
    ↑
IT_MANAGER ──────────────────────────────────────────────────
    ↑               ↑                  ↑                    ↑
IT_SPECIALIST  COMPLIANCE_OFFICER  FINANCIAL_ANALYST  PROJECT_MANAGER
    ↑
IT_TECHNICIAN
    ↑
END_USER

AUDITOR   ← Papel transversal com acesso de leitura amplo, sem escrita
EXECUTIVE ← Papel transversal com acesso a dashboards e relatórios
```

**Matriz de permissões por módulo:**

| Módulo | END_USER | IT_TECH | IT_SPEC | IT_MGR | COMP_OFF | FIN_ANA | PROJ_MGR | AUDITOR | EXEC | SUPER |
|--------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Incidentes** | Criar/Ver próprios | CRUD + Fechar | CRUD completo | CRUD + Config | R | R | R | R | R | CRUD |
| **Requisições** | Criar/Ver próprias | Executar | CRUD completo | CRUD + Aprovar | R | R | R | R | R | CRUD |
| **Problemas** | Ver KB | CRUD | CRUD completo | CRUD | R | — | — | R | R | CRUD |
| **Ativos** | Ver atribuídos | CRUD | CRUD completo | CRUD + Descomis. | R | R | R | R | R | CRUD |
| **Identidades** | Ver próprio | — | Ver | CRUD | R | — | — | R | R | CRUD |
| **Compliance** | — | — | R | R + Evidências | CRUD completo | R | R | R | R | CRUD |
| **Financeiro** | — | — | — | R resumido | — | CRUD | R | R | R | CRUD |
| **Compras** | — | — | — | Aprovar | — | R | CRUD | R | R | CRUD |
| **Projetos** | — | — | R | CRUD | R | R | CRUD | R | R | CRUD |
| **Base KB** | R (público) | CRUD | CRUD + Publicar | CRUD + Publicar | R | R | R | R | R | CRUD |
| **Dashboards** | — | Operacional | Operacional | Todos | Compliance | Financeiro | Projetos | Todos | Executivo | Todos |
| **Catálogo** | R | R | R | CRUD | R | R | R | R | R | CRUD |
| **SLA** | — | R | R | CRUD | R | R | — | R | R | CRUD |

**Legenda:** CRUD = Create+Read+Update+Delete · R = Read only · — = Sem acesso

---

### RS-RBAC-002 — Atribuição e Revisão de Papéis

**Referência ASVS:** V4.1.5
**Prioridade:** MANDATÓRIO

**Atribuição de papéis:**
- Papéis são atribuídos pelo `IT_MANAGER` ou `SUPER_ADMIN` no módulo de Identidades.
- A atribuição de papel requer justificativa documentada no campo `accessReason` do `AccessProfile`.
- Papéis privilegiados (`IT_MANAGER`, `COMPLIANCE_OFFICER`, `FINANCIAL_ANALYST`, `SUPER_ADMIN`) exigem aprovação dupla.
- A atribuição é registrada no `audit_log` com `old_values` (papel anterior) e `new_values` (novo papel).

**Revisão periódica (Access Review):**
- Todos os usuários com papéis acima de `END_USER` devem ter acesso revisado a cada **90 dias**.
- Usuários sem atividade por 60 dias devem ter acesso suspenso automaticamente até revisão.
- A revisão deve ser realizada pelo gestor direto do usuário, não pelo administrador de TI.
- Papéis não renovados na revisão são automaticamente rebaixados para `END_USER`.

---

### RS-RBAC-003 — Controle Granular por Recurso

**Referência ASVS:** V4.1.4
**Prioridade:** ALTO

Além do controle por módulo, operações críticas requerem permissão específica adicional:

| Operação Crítica | Papel Mínimo | Controle Adicional |
|-----------------|-------------|-------------------|
| Descomissionar ativo | IT_SPECIALIST | Aprovação do IT_MANAGER |
| Revogar acesso de usuário | IT_MANAGER | Registro de justificativa obrigatório |
| Excluir artigo publicado da KB | IT_MANAGER | Confirmação dupla + registro de auditoria |
| Cancelar pedido de compra aprovado | IT_MANAGER | Registro de justificativa + notificação ao financeiro |
| Visualizar relatório de auditoria completo | AUDITOR ou SUPER_ADMIN | Log de acesso ao relatório sensível |
| Acessar dados financeiros acima de R$100k | FINANCIAL_ANALYST | Log de acesso com IP |
| Exportar base completa de usuários | SUPER_ADMIN | Log de acesso + notificação ao DPO |
| Apagar evidências de compliance | Proibido — soft delete apenas | N/A |

---

## 4. MFA — Autenticação Multifator

### RS-MFA-001 — MFA via Google Workspace

**Referência ASVS:** V2.8 (One-Time Verifier), NIST SP 800-63B AAL2
**Prioridade:** MANDATÓRIO para papéis privilegiados

O SGTI herda o MFA configurado no Google Workspace. Por isso, a **política de MFA obrigatório no Google Workspace** é um pré-requisito operacional do SGTI, não uma funcionalidade implementada pela aplicação.

**Requisitos de configuração do Google Workspace (responsabilidade do administrador do domínio):**

| Grupo de Usuários | MFA Obrigatório | Método Recomendado |
|------------------|----------------|-------------------|
| Administradores de TI (IT_MANAGER, SUPER_ADMIN) | **Sim — obrigatório** | Google Authenticator ou chave de segurança FIDO2 |
| Profissionais técnicos (IT_SPECIALIST, IT_TECHNICIAN) | **Sim — obrigatório** | Google Authenticator |
| Analistas especializados (COMPLIANCE_OFFICER, FINANCIAL_ANALYST) | **Sim — obrigatório** | Google Authenticator |
| Usuários finais (END_USER) | Recomendado | Google Authenticator |

**Verificação de cumprimento:**
- O SGTI deve verificar no `id_token` Google se o autenticador do usuário satisfaz o nível de segurança esperado (claim `acr` quando disponível).
- Usuários de papéis privilegiados com MFA desativado no Google Workspace devem ser bloqueados no callback de autenticação e notificados o administrador.

---

### RS-MFA-002 — Autenticação Step-Up para Operações Críticas

**Referência ASVS:** V2.9 (Cryptographic Software and Devices Verifier)
**Prioridade:** ALTO

Operações de alto risco devem exigir reautenticação (step-up authentication) mesmo com sessão ativa:

| Operação de Alto Risco | Exige Step-Up | Validade do Step-Up |
|------------------------|:---:|-------------------|
| Desprovisionamento de usuário | Sim | 5 minutos |
| Export completo de dados pessoais | Sim | 5 minutos |
| Revogação de acesso em massa | Sim | 5 minutos |
| Visualização de relatório de auditoria sensível | Sim | 15 minutos |
| Alteração de papéis privilegiados | Sim | 5 minutos |

**Implementação:** redirecionamento para Google OAuth com parâmetro `prompt=login` + `max_age=0` forçando nova autenticação Google com MFA independente da sessão ativa no SGTI.

---

## 5. Criptografia

### RS-CRYPT-001 — Criptografia em Trânsito

**Referência ASVS:** V9.1 (Communications Security Requirements)
**Prioridade:** MANDATÓRIO

| Canal | Protocolo | Versão Mínima | Configuração |
|-------|-----------|---------------|-------------|
| Usuário → Cloudflare | HTTPS | TLS 1.2 | Full Strict mode |
| Cloudflare → Vercel (frontend) | HTTPS | TLS 1.2 | Certificado Vercel válido |
| Cloudflare → Backend (API) | HTTPS | TLS 1.2 | Certificado válido |
| Backend → Supabase PostgreSQL | TLS | TLS 1.2 | SSL mode require |
| Backend → Google APIs | HTTPS | TLS 1.3 | Gerenciado pelo Google |
| Backend → GLPI | HTTPS | TLS 1.2 | Certificado válido (não autoassinado) |
| Backend → SMTP | STARTTLS | TLS 1.2 | Port 587, STARTTLS obrigatório |

**Suites de cifra proibidas (desabilitar via Cloudflare):**
- TLS 1.0 e TLS 1.1 — proibidos.
- SSL 2.0 e SSL 3.0 — proibidos.
- RC4, DES, 3DES — proibidos.
- Suites com NULL ou export-grade cipher — proibidas.
- BEAST, POODLE vulnerabilities — mitigadas via configuração Cloudflare.

**Meta:** SSL Labs Grade A ou superior. Verificação semestral.

---

### RS-CRYPT-002 — Criptografia em Repouso

**Referência ASVS:** V6.2 (Algorithms)
**Prioridade:** MANDATÓRIO

| Dado | Algoritmo | Responsável |
|------|-----------|-------------|
| Banco de dados PostgreSQL | AES-256 (gerenciado pelo Supabase) | Supabase |
| Arquivos no Supabase Storage | AES-256 (gerenciado pelo Supabase) | Supabase |
| Variáveis de ambiente (segredos) | Criptografia gerenciada pela Vercel | Vercel |
| Chave privada JWT (RS256) | Armazenada em env var criptografada | Vercel Environment |
| Dados de sessão (refresh tokens) | AES-256 via criptografia do PostgreSQL | Supabase |
| Backups do banco | AES-256 (gerenciado pelo Supabase) | Supabase |

**Proibições:**
- Dados pessoais ou segredos em localStorage ou sessionStorage (sem criptografia de browser).
- Dados sensíveis em cookies sem flag `Secure`.
- Chave privada JWT em variável de ambiente sem criptografia da plataforma.

---

### RS-CRYPT-003 — Padrões Criptográficos Obrigatórios

**Referência ASVS:** V6.2.1–V6.2.8
**Prioridade:** MANDATÓRIO

| Uso | Algoritmo Aprovado | Proibidos |
|-----|-------------------|-----------|
| Assinatura de JWT | RS256 (RSA-PKCS1-v1.5, SHA-256), mínimo 2048 bits | HS256, HS384, HS512 (simétrico), RS512 (overhead sem benefício) |
| Hash de dados (integridade) | SHA-256, SHA-384, SHA-512 | MD5, SHA-1 |
| Geração de tokens aleatórios (state, PKCE, refresh token) | CSPRNG com mínimo 256 bits de entropia | Math.random(), timestamp como token |
| Verificação de assinatura de webhook (GitHub) | HMAC-SHA256 | HMAC-SHA1 |
| Derivação de chave | HKDF com SHA-256 | PBKDF2 com iterações < 100.000 |

**Tamanho mínimo de chaves:**
- RSA: mínimo 2048 bits (recomendado 4096 bits para chave JWT).
- ECDSA: mínimo P-256 (secp256r1).
- Chaves simétricas: mínimo 256 bits.

---

### RS-CRYPT-004 — Rotação de Chaves Criptográficas

**Referência ASVS:** V6.4 (Secret Management)
**Prioridade:** ALTO

| Chave/Segredo | Frequência de Rotação | Procedimento |
|--------------|----------------------|-------------|
| Par de chaves JWT (RS256) | Anual ou imediatamente após suspeita de comprometimento | Gerar novo par, atualizar env vars, invalidar todas as sessões ativas |
| Google Service Account Key | Anual | Criar nova chave, atualizar env var, revogar a anterior |
| GLPI API Token | Semestral | Gerar novo token no GLPI, atualizar env var |
| GitHub PAT | Semestral | Gerar novo PAT com escopo mínimo, revogar anterior |
| Vercel API Token | Semestral | Gerar novo token, revogar anterior |

**Procedimento de rotação de emergência:** em caso de suspeita de comprometimento, a rotação deve ser executada em menos de 2 horas, com invalidação imediata de todas as sessões ativas dos usuários.

---

## 6. Proteção de APIs

### RS-API-001 — Autenticação de Todos os Endpoints

**Referência ASVS:** V4.1.1
**Prioridade:** MANDATÓRIO

Todo endpoint da API do SGTI deve ser explicitamente classificado como protegido ou público:

**Endpoints públicos permitidos:**
- `GET /api/health` — health check para monitoramento.
- `GET /api/health/ready` — Kubernetes readiness probe.
- `GET /api/health/live` — Kubernetes liveness probe.
- `GET /api/auth/google` — início do fluxo OAuth.
- `GET /api/auth/callback` — callback OAuth (protegido por state token).
- `GET /api/catalog` e `GET /api/catalog/:id` — catálogo de serviços público.
- `GET /api/knowledge` e `GET /api/knowledge/:slug` — Base de Conhecimento pública.

Todos os demais endpoints exigem `JwtAuthGuard`. O decorator `@Public()` deve ser usado explicitamente e revisado em code review. Ausência de decorator = acesso negado (fail-safe).

---

### RS-API-002 — Rate Limiting e Throttling

**Referência ASVS:** V4.2.2, V13.4 (GraphQL), OWASP API4:2023
**Prioridade:** MANDATÓRIO

| Endpoint / Categoria | Limite | Janela | Ação ao Exceder |
|---------------------|--------|--------|----------------|
| `POST /api/auth/google` (início OAuth) | 10 req/IP | 1 minuto | 429 Too Many Requests + backoff 60s |
| `GET /api/auth/callback` | 5 req/IP | 1 minuto | 429 + backoff 60s + log de alerta |
| `POST /api/auth/refresh` | 20 req/IP | 1 minuto | 429 |
| Endpoints de escrita (`POST`, `PATCH`, `PUT`, `DELETE`) | 60 req/usuário | 1 minuto | 429 |
| Endpoints de leitura (`GET`) | 300 req/usuário | 1 minuto | 429 |
| Endpoints de busca (`GET /api/knowledge/search`) | 30 req/usuário | 1 minuto | 429 |
| Geração de relatório | 5 req/usuário | 1 hora | 429 |
| Exportação de auditoria | 3 req/usuário | 1 hora | 429 + log de auditoria |

**Headers de resposta obrigatórios:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 43
X-RateLimit-Reset: 1234567890
Retry-After: 60  (quando 429)
```

**Implementação:** `@nestjs/throttler` com `ThrottlerGuard` global; limites customizáveis por endpoint via `@Throttle()` decorator.

---

### RS-API-003 — Validação de Entrada

**Referência ASVS:** V5.1 (Input Validation), OWASP A03:2021
**Prioridade:** MANDATÓRIO

Toda entrada de dados na API deve ser validada antes de qualquer processamento:

**Regras obrigatórias:**

| Regra | Implementação |
|-------|--------------|
| DTOs com `class-validator` em todos os endpoints | `ValidationPipe` global com `whitelist: true` e `forbidNonWhitelisted: true` |
| `whitelist: true` | Propriedades não declaradas no DTO são silenciosamente removidas |
| `forbidNonWhitelisted: true` | Requisição rejeitada se contiver propriedade não declarada |
| `transform: true` | Tipos primitivos transformados automaticamente (string → number, etc.) |
| Tamanho máximo de payload | 10MB padrão; configurável por endpoint (ex: upload de evidências: 50MB) |
| Profundidade máxima de JSON | 5 níveis — rejeitar JSON com aninhamento excessivo (proteção contra JSON bomb) |
| Sanitização de strings | Trim de espaços em branco; remoção de null bytes |

**SQL Injection — proteção estrutural:**
- Prisma ORM com queries parametrizadas por padrão — sem interpolação de string em queries.
- `prisma.$queryRaw` tipado com `Prisma.sql` template literal — interpolação segura.
- Proibição de construção dinâmica de SQL fora do `Prisma.sql`.

---

### RS-API-004 — Headers de Segurança nas Respostas

**Referência ASVS:** V14.4 (HTTP Security Headers)
**Prioridade:** MANDATÓRIO

| Header | Valor | Implementação |
|--------|-------|--------------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Cloudflare |
| `X-Content-Type-Options` | `nosniff` | NestJS Helmet |
| `X-Frame-Options` | `DENY` | NestJS Helmet |
| `Content-Security-Policy` | Ver RS-API-005 | NestJS Helmet + Cloudflare |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Cloudflare |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` | Cloudflare |
| `Cross-Origin-Opener-Policy` | `same-origin` | NestJS Helmet |
| `Cross-Origin-Resource-Policy` | `same-origin` | NestJS Helmet |
| `X-DNS-Prefetch-Control` | `off` | NestJS Helmet |

**Headers proibidos nas respostas:**
- `X-Powered-By: Express` — remover via Helmet.
- `Server: nginx` — remover ou ofuscar.
- Qualquer header que exponha versão de biblioteca ou framework.

---

### RS-API-005 — Content Security Policy (CSP)

**Referência ASVS:** V14.4.3, OWASP A03:2021
**Prioridade:** MANDATÓRIO

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{SERVER_GENERATED_NONCE}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://lh3.googleusercontent.com;
  font-src 'self';
  connect-src 'self' https://*.supabase.co wss://*.supabase.co;
  frame-src 'none';
  frame-ancestors 'none';
  form-action 'self';
  base-uri 'self';
  object-src 'none';
  upgrade-insecure-requests;
  block-all-mixed-content;
```

**Notas:**
- `nonce` gerado pelo servidor a cada resposta (criptograficamente aleatório, base64url-encoded).
- `'unsafe-inline'` para `style-src` é necessário para shadcn/ui; monitorar para remoção futura.
- `'unsafe-eval'` é proibido em todos os contextos.
- CSP em modo `report-only` durante desenvolvimento para detectar violações antes da aplicação.

---

### RS-API-006 — Configuração de CORS

**Referência ASVS:** V14.5 (Validate HTTP Request Header Requirements)
**Prioridade:** MANDATÓRIO

| Parâmetro | Valor |
|-----------|-------|
| `Access-Control-Allow-Origin` | Apenas origens explicitamente permitidas (domínio SGTI) — proibido `*` |
| `Access-Control-Allow-Methods` | `GET, POST, PATCH, PUT, DELETE, OPTIONS` |
| `Access-Control-Allow-Headers` | `Content-Type, Authorization, X-Request-ID` |
| `Access-Control-Allow-Credentials` | `true` (necessário para cookies) |
| `Access-Control-Max-Age` | `86400` (24 horas de preflight cache) |

**Origens permitidas (configuradas em env var `CORS_ORIGINS`):**
- `https://sgti.[dominio]` (produção)
- `https://staging.sgti.[dominio]` (staging)
- `http://localhost:3000` (desenvolvimento local apenas)

---

## 7. Auditoria e Rastreabilidade

### RS-AUDIT-001 — Registro Imutável e Completo

**Referência ASVS:** V7.2 (Log Processing Requirements)
**Prioridade:** MANDATÓRIO

O `AuditInterceptor` global do NestJS captura automaticamente toda operação de escrita e gera registro na tabela `shared.audit_log`. O registro é imutável por design — implementado via política RLS INSERT-only no PostgreSQL.

**Campos obrigatórios no audit_log:**

| Campo | Tipo | Obrigatoriedade | Descrição |
|-------|------|:---:|-----------|
| `id` | UUID v7 | Obrigatório | Identificador único monotônico (ordenável por tempo) |
| `user_id` | UUID | Obrigatório | ID do usuário que executou a ação |
| `user_role` | VARCHAR | Obrigatório | Papel do usuário no momento da ação |
| `action` | ENUM | Obrigatório | `CREATE`, `UPDATE`, `DELETE`, `ACCESS`, `LOGIN`, `LOGOUT`, `FAILED_LOGIN`, `EXPORT` |
| `entity_type` | VARCHAR | Obrigatório | Nome da entidade (ex: `Incident`, `Asset`, `ComplianceControl`) |
| `entity_id` | UUID | Condicional | ID da entidade afetada (null para ações sem entidade específica) |
| `old_values` | JSONB | Condicional | Estado anterior (apenas em UPDATE e DELETE) |
| `new_values` | JSONB | Condicional | Novo estado (apenas em CREATE e UPDATE) |
| `occurred_at` | TIMESTAMPTZ | Obrigatório | Preenchido pelo banco (`DEFAULT NOW()`) — não pela aplicação |
| `ip_address` | INET | Obrigatório | IPv4 ou IPv6 real do cliente (considerando Cloudflare) |
| `user_agent` | VARCHAR(500) | Obrigatório | User-Agent da requisição |
| `request_id` | UUID | Obrigatório | Correlação com logs de sistema |
| `session_id` | UUID | Obrigatório | Identificador da sessão (para correlação de ações da mesma sessão) |

**Extração de IP real via Cloudflare:**
O header `CF-Connecting-IP` provido pelo Cloudflare contém o IP real do cliente. Este header deve ser usado em vez de `X-Forwarded-For` para prevenir spoofing.

---

### RS-AUDIT-002 — Eventos Obrigatoriamente Auditados

**Referência ASVS:** V7.2.1–V7.2.8
**Prioridade:** MANDATÓRIO

| Categoria | Eventos a Auditar |
|-----------|------------------|
| **Autenticação** | Login bem-sucedido, login falho, logout, rotação de refresh token, step-up reautenticação |
| **Autorização** | Acesso negado (403), tentativa de acesso a recurso sem permissão |
| **Gestão de acesso** | Provisionamento, desprovisionamento, concessão de acesso, revogação, suspensão, reativação, alteração de papel |
| **Dados sensíveis** | Visualização de relatório de auditoria, exportação de dados pessoais, acesso a dados financeiros acima de threshold |
| **Operações destrutivas** | Exclusão lógica (soft delete) de qualquer entidade de negócio |
| **Operações de configuração** | Criação/alteração de políticas de SLA, catálogo de serviços, definições de compliance |
| **Integrações** | Falha de sincronização com GLPI ou Google Workspace |
| **Administrativo** | Criação de usuário SUPER_ADMIN, alteração de configurações de segurança |

---

### RS-AUDIT-003 — Proteção da Trilha de Auditoria

**Referência ASVS:** V7.3 (Log Protection Requirements)
**Prioridade:** MANDATÓRIO

A trilha de auditoria deve ser protegida contra adulteração, exclusão e acesso não autorizado:

| Controle | Implementação |
|----------|--------------|
| **Imutabilidade** | RLS policy: `FOR INSERT WITH CHECK (true)` — sem UPDATE, sem DELETE |
| **Integridade** | Campo `occurred_at` preenchido pelo banco (`DEFAULT NOW()`), não pela aplicação |
| **Acesso restrito** | Apenas AUDITOR e SUPER_ADMIN podem ler audit_log; sem acesso via API pública |
| **Prevenção de truncagem** | Monitoramento de crescimento da tabela; alertas antes de atingir limites de armazenamento |
| **Backup separado** | Backup da tabela audit_log exportado separadamente e retido por 5 anos |
| **Non-repudiation** | session_id vinculado ao refresh_token; impossível negar ação de sessão autenticada |

---

## 8. Logs de Segurança

### RS-LOG-001 — Eventos de Segurança Obrigatórios em Log

**Referência ASVS:** V7.2.2–V7.2.6
**Prioridade:** MANDATÓRIO

Os seguintes eventos de segurança devem gerar log de nível `WARN` ou `ERROR`:

| Evento | Nível | Dados Obrigatórios no Log |
|--------|-------|--------------------------|
| Falha de autenticação | `WARN` | IP, user-agent, tentativa de e-mail (hash), timestamp |
| > 5 falhas de autenticação do mesmo IP em 5 minutos | `ERROR` | IP, contagem, janela de tempo |
| Acesso negado (403) a endpoint sensível | `WARN` | userId, endpoint, role, requestId |
| Token JWT inválido ou expirado | `WARN` | IP, endpoint tentado, tipo de falha |
| Refresh token reutilizado após rotação | `ERROR` | sessionId, IP, timestamp — possível roubo de token |
| Tentativa de acesso com usuário suspenso | `ERROR` | userId, IP, endpoint |
| Violação de RLS detectada | `ERROR` | userId, query, tabela |
| Rate limit excedido | `WARN` | IP ou userId, endpoint, contagem |
| Credencial de integração com falha de autenticação | `ERROR` | integração, endpoint, timestamp |
| Tentativa de upload de arquivo com tipo proibido | `WARN` | userId, filename, mime-type detectado |

---

### RS-LOG-002 — Proteção e Integridade dos Logs

**Referência ASVS:** V7.3.1–V7.3.4
**Prioridade:** MANDATÓRIO

| Controle | Especificação |
|----------|--------------|
| **Ausência de PII em logs** | userId (UUID) em vez de nome ou e-mail; dados de negócio como entityId, não conteúdo |
| **Ausência de credenciais** | Tokens, senhas, API keys, connection strings — proibidos em qualquer log |
| **Log injection prevention** | Caracteres de controle (`\n`, `\r`, `\t`) em mensagens de log devem ser escapados ou removidos |
| **Timestamp imutável** | Timestamp gerado pelo servidor no momento do log — não aceitar timestamps do cliente |
| **Sincronização de relógio** | NTP configurado no servidor; tolerância máxima de clock skew de 30 segundos |
| **Integridade de logs persistidos** | Hash SHA-256 dos logs exportados incluído nos metadados de exportação |

---

## 9. LGPD — Proteção de Dados Pessoais

### RS-LGPD-001 — Base Legal e Finalidade do Tratamento

**Referência:** Art. 7º, Art. 11 da Lei nº 13.709/2018
**Prioridade:** MANDATÓRIO

Todo tratamento de dados pessoais no SGTI deve ter base legal explícita documentada:

| Dado Pessoal | Titular | Base Legal (Art. 7º) | Finalidade | Retenção |
|-------------|---------|---------------------|-----------|---------|
| Nome completo | Colaborador | Inciso IX — Legítimo interesse | Identificação no sistema de gestão de TI | Vigência do contrato + 5 anos |
| E-mail corporativo | Colaborador | Inciso IX — Legítimo interesse | Autenticação e comunicação | Vigência do contrato + 5 anos |
| Cargo e unidade organizacional | Colaborador | Inciso IX — Legítimo interesse | Controle de acesso baseado em papel | Vigência do contrato + 5 anos |
| IP de acesso | Colaborador | Inciso IX — Legítimo interesse | Segurança e auditoria | 1 ano |
| Histórico de acessos concedidos | Colaborador | Inciso II — Cumprimento de obrigação legal | Rastreabilidade de conformidade | 5 anos |
| Histórico de chamados abertos | Colaborador | Inciso IX — Legítimo interesse | Prestação de serviço de TI | 5 anos |
| Dados de autenticação (logs) | Colaborador | Inciso IX — Legítimo interesse | Segurança da informação | 1 ano |

---

### RS-LGPD-002 — Minimização e Isolamento de Dados Pessoais

**Referência:** Art. 6º, IV (livre acesso) e VI (transparência) da LGPD
**Prioridade:** MANDATÓRIO

**Centralização:** dados pessoais identificáveis residem exclusivamente no schema `identity`. Todos os demais módulos referenciam `user_id` (UUID) — nunca replicam nome, e-mail ou atributos pessoais.

**Pseudonimização por design:**
- Logs de auditoria contêm `user_id`, não nome.
- Relatórios podem exibir nome apenas quando o papel do usuário permite (IT_MANAGER+).
- Exportações de dados contêm `user_id` por padrão; join com dados pessoais apenas quando necessário e autorizado.

**Dados proibidos no SGTI:**
- CPF, RG, data de nascimento (não são necessários para gestão de TI).
- Dados sensíveis pessoais do Art. 11 (origem racial, saúde, vida sexual, dados biométricos).
- Dados de colaboradores de organizações terceiras (fornecedores, clientes) sem base legal específica.

---

### RS-LGPD-003 — Implementação dos Direitos dos Titulares

**Referência:** Art. 18 da LGPD
**Prioridade:** MANDATÓRIO

| Direito | Endpoint | Papel Mínimo | SLA de Atendimento |
|---------|----------|-------------|-------------------|
| Acesso (inciso I) | `GET /api/admin/users/:id/personal-data` | Próprio usuário ou SUPER_ADMIN | 15 dias úteis |
| Confirmação de tratamento (inciso I) | `GET /api/privacy/processing-confirmation` | Qualquer usuário autenticado | Imediato |
| Correção (inciso III) | Via Google Workspace (fonte autoritativa) | IT_MANAGER | 15 dias úteis |
| Anonimização (inciso IV) | `POST /api/admin/users/:id/anonymize` | SUPER_ADMIN | 15 dias úteis |
| Portabilidade (inciso V) | `GET /api/admin/users/:id/export` | Próprio usuário ou SUPER_ADMIN | 15 dias úteis |
| Eliminação (inciso VI) | `DELETE /api/admin/users/:id` (soft delete + anonimização) | SUPER_ADMIN | 15 dias úteis |
| Informação (inciso VII) | `/privacy` (página pública) | Qualquer usuário | Imediato |
| Revogação de consentimento (inciso IX) | `POST /api/admin/users/:id/revoke-consent` | Próprio usuário | 15 dias úteis |

**Anonimização:** substituição de campos pessoais por valores derivados de hash irreversível:
- Nome → `[Usuário Anonimizado]`
- E-mail → `anonimizado-{SHA256(email)[:8]}@removido.local`
- IP → `0.0.0.0`

---

### RS-LGPD-004 — Transferência Internacional de Dados

**Referência:** Art. 33 da LGPD
**Prioridade:** MANDATÓRIO

O SGTI transfere dados pessoais para os seguintes países/organizações:

| Destinatário | País/Região | Dado Transferido | Base Legal (Art. 33) |
|-------------|-------------|-----------------|---------------------|
| Google LLC (Google Workspace) | EUA | Nome, e-mail, unidade organizacional | Inciso VII — consentimento (autenticação SSO) |
| Supabase Inc. | EUA (servidores configuráveis) | Todos os dados do sistema | Inciso II — cláusulas contratuais padrão (DPA Supabase) |
| Vercel Inc. | EUA | Dados de requisição, variáveis de ambiente | Inciso II — cláusulas contratuais padrão |
| Cloudflare Inc. | EUA | IPs, headers de requisição (em trânsito) | Inciso II — cláusulas contratuais padrão |

**Ação requerida:** DPA (Data Processing Agreement) assinado com cada fornecedor antes do go-live. Verificar adequação do país conforme lista ANPD.

---

### RS-LGPD-005 — Notificação de Incidentes de Dados

**Referência:** Art. 48 da LGPD
**Prioridade:** MANDATÓRIO

Em caso de incidente de segurança envolvendo dados pessoais:

```
0–4 horas:   Identificar e conter o incidente
4–24 horas:  Avaliar impacto — quais dados, quantos titulares, natureza do risco
24–72 horas: Notificar ANPD se risco relevante (formulário eletrônico da ANPD)
72h+:        Notificar titulares afetados com linguagem clara e orientações
```

**Informações obrigatórias na notificação à ANPD (Art. 48, §1º):**
1. Descrição da natureza dos dados pessoais afetados.
2. Informações sobre os titulares envolvidos.
3. Indicação das medidas técnicas e de segurança utilizadas.
4. Riscos relacionados ao incidente.
5. Motivos da demora (quando a comunicação não for imediata).
6. Medidas tomadas ou a serem tomadas para remediar os efeitos.

**Responsável:** DPO (Data Protection Officer) deve ser notificado em até 4 horas após detecção do incidente.

---

## 10. Gestão de Sessões

### RS-SESS-001 — Configuração Segura de Sessões

**Referência ASVS:** V3.2 (Session Binding), V3.3 (Session Logout and Timeout)
**Prioridade:** MANDATÓRIO

**Estrutura de tokens:**

| Token | Tipo | TTL | Armazenamento | Renovação |
|-------|------|-----|--------------|---------|
| Access Token | JWT RS256 signed | 1 hora | Cookie `HttpOnly` | Via Refresh Token |
| Refresh Token | Opaco (UUID v4) | 7 dias | Cookie `HttpOnly` + banco de dados | Rotação a cada uso |

**Configuração de cookies:**

```
Set-Cookie: access_token=<jwt>; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=3600
Set-Cookie: refresh_token=<opaque>; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=604800
```

**Justificativa de `SameSite=Strict`:** previne ataques CSRF em todas as requisições cross-site. Em casos onde `SameSite=Lax` for necessário (ex: navegação de link externo), documentar a decisão como exceção com aprovação do arquiteto de segurança.

---

### RS-SESS-002 — Gerenciamento do Ciclo de Vida da Sessão

**Referência ASVS:** V3.3.1–V3.3.4
**Prioridade:** MANDATÓRIO

**Encerramento de sessão:**
- `POST /api/auth/logout` invalida o Refresh Token no banco de dados.
- Access Token é invalidado pelo frontend (limpeza de cookie).
- Blacklist de `session_id` verificada no `JwtAuthGuard` para invalidação imediata do Access Token em casos de suspensão urgente.

**Timeout de inatividade:**
- Sem atividade por 8 horas consecutivas: Refresh Token invalidado no próximo uso.
- Implementação: campo `last_used_at` no `refresh_tokens`; verificação no endpoint `/api/auth/refresh`.

**Sessões simultâneas:**
- Por padrão, permitidas (usuário pode estar logado em múltiplos dispositivos).
- Administradores (`IT_MANAGER`+) têm máximo de 3 sessões simultâneas.
- `SUPER_ADMIN`: máximo 1 sessão simultânea ativa.
- Endpoint `GET /api/auth/sessions` permite ao usuário visualizar e revogar sessões ativas.

**Invalidação forçada de sessões:**
- Desprovisionamento de usuário → todas as sessões revogadas imediatamente.
- Suspensão de usuário → todas as sessões revogadas imediatamente.
- Alteração de papel → sessão atual revogada; novo JWT emitido no próximo refresh.
- Suspeita de comprometimento → `POST /api/admin/users/:id/revoke-all-sessions` por IT_MANAGER.

---

### RS-SESS-003 — Proteção contra Session Fixation e Hijacking

**Referência ASVS:** V3.4, V3.6
**Prioridade:** MANDATÓRIO

| Ameaça | Controle |
|--------|---------|
| **Session Fixation** | Novo `session_id` gerado após cada autenticação bem-sucedida — nunca reutilizar session_id pré-autenticação |
| **Session Hijacking (Cookie theft)** | Cookies `HttpOnly` (inacessível via JavaScript) + `Secure` (HTTPS only) |
| **CSRF** | Cookies `SameSite=Strict`; verificação de Origin/Referer em operações de escrita |
| **Token theft via network** | TLS 1.2+ obrigatório em todo o tráfego |
| **Refresh token reuse attack** | Detecção de reutilização: refresh token usado após rotação → invalidar todas as sessões do usuário + alerta |

**Detecção de reutilização de Refresh Token:**
```
Se refresh_token.status = ROTATED e tentativa de uso:
  → Invalidar TODAS as sessões do usuário (possível comprometimento)
  → Registrar alerta no audit_log com action=POSSIBLE_TOKEN_THEFT
  → Notificar o usuário por e-mail
  → Notificar IT_MANAGER
```

---

## 11. Proteção contra Ataques Comuns

### RS-ATK-001 — OWASP Top 10 2021 — Controles por Ameaça

**Referência ASVS:** V1–V14 (aplicável)

| # | Ameaça (OWASP Top 10 2021) | Controles Implementados |
|---|---------------------------|------------------------|
| A01 | **Broken Access Control** | RBAC + RLS dupla camada; verificação object-level; segregação de funções; `@Roles` em todos os endpoints |
| A02 | **Cryptographic Failures** | TLS 1.2+ obrigatório; RS256 para JWT; AES-256 em repouso; proibição de MD5/SHA-1 |
| A03 | **Injection** | Prisma ORM parametrizado; `ValidationPipe` com whitelist; sanitização de entrada; CSP restritiva |
| A04 | **Insecure Design** | Clean Architecture com separação de camadas; threat modeling; revisão de segurança em PRs |
| A05 | **Security Misconfiguration** | Helmet obrigatório; Swagger desabilitado em produção; headers de segurança; default deny |
| A06 | **Vulnerable and Outdated Components** | `npm audit` no CI; dependências atualizadas mensalmente; alertas GitHub Dependabot |
| A07 | **Identification and Authentication Failures** | Google OAuth com PKCE; JWT RS256; rotação de refresh token; MFA obrigatório para admins |
| A08 | **Software and Data Integrity Failures** | Verificação de assinatura de webhook (HMAC-SHA256); subresource integrity; pipeline CI assinado |
| A09 | **Security Logging and Monitoring Failures** | AuditInterceptor global; alertas de segurança; audit_log imutável; correlação por requestId |
| A10 | **Server-Side Request Forgery (SSRF)** | Validação de URLs em integrações; sem endpoints que aceitem URL fornecida pelo usuário para fetch |

---

### RS-ATK-002 — Injeção (Injection)

**Referência ASVS:** V5.2 (Sanitization and Sandboxing)
**Prioridade:** MANDATÓRIO

**SQL Injection:**
- Prisma ORM com queries parametrizadas por padrão.
- `prisma.$queryRaw` tipado com `Prisma.sql` — interpolação segura via tagged template literals.
- Proibição de construção manual de SQL com concatenação de strings.
- Auditoria de todo uso de `$queryRaw` no code review.

**XSS (Cross-Site Scripting):**
- React escapa automaticamente todo conteúdo renderizado em JSX.
- `dangerouslySetInnerHTML` proibido — uso requer aprovação de segurança e sanitização via DOMPurify.
- CSP com `script-src 'nonce-{nonce}'` bloqueia scripts inline não autorizados.
- Artigos da Base de Conhecimento renderizados via parser Markdown seguro (sem HTML raw).

**NoSQL Injection:**
- Não aplicável — o SGTI usa PostgreSQL relacional via Prisma, sem queries NoSQL.

**Command Injection:**
- Proibido uso de `child_process.exec()` com input do usuário.
- Scripts de manutenção executam em contexto isolado sem acesso a dados do usuário.

**Log Injection:**
- Caracteres de controle (`\n`, `\r`, `\0`) removidos ou escapados de qualquer entrada antes de logging.
- Formato JSON estruturado previne injeção de campos adicionais em logs.

---

### RS-ATK-003 — Cross-Site Request Forgery (CSRF)

**Referência ASVS:** V4.2.2, V13.2.3
**Prioridade:** MANDATÓRIO

O SGTI implementa proteção CSRF através de múltiplas camadas complementares:

1. **SameSite=Strict nos cookies:** impede que o browser envie cookies em requisições cross-site. Esta é a proteção principal.

2. **Verificação de Origin/Referer:** o backend verifica que o header `Origin` ou `Referer` em requisições mutáveis corresponde ao domínio do SGTI.

3. **Custom Request Header:** requisições AJAX do frontend incluem o header `X-Request-Source: sgti-app`. Requisições cross-site de outros sites não podem definir este header customizado.

4. **JSON Content-Type:** APIs REST aceitam apenas `Content-Type: application/json`. Formulários HTML simples (vetores clássicos de CSRF) enviam `application/x-www-form-urlencoded` e são rejeitados.

---

### RS-ATK-004 — Proteção contra Enumeração e Brute Force

**Referência ASVS:** V2.2, V2.5
**Prioridade:** MANDATÓRIO

| Proteção | Implementação |
|----------|--------------|
| **Rate limiting de autenticação** | 10 tentativas de login por IP em 1 minuto (RS-API-002) |
| **Resposta genérica em falha de auth** | `401 Unauthorized` sem distinção entre "e-mail não existe" e "senha incorreta" — não aplicável (sem senha local), mas aplicável ao e-mail não pertencer ao domínio corporativo |
| **Enumeração de usuários** | `GET /api/admin/users` apenas para IT_MANAGER+; IDs são UUIDs (não sequenciais) |
| **Enumeração de incidentes** | IDs são UUIDs; listagem filtrada por papel e escopo |
| **Enumeração de endpoints** | Resposta `404` genérica (sem distinguir "não existe" de "sem acesso") — ou `403` para endpoints que existem mas o usuário não tem acesso |

---

### RS-ATK-005 — Proteção da Infraestrutura

**Referência ASVS:** V12, V14
**Prioridade:** MANDATÓRIO

| Ameaça | Controle |
|--------|---------|
| **DDoS** | Cloudflare DDoS Protection (L3/L4/L7) ativada |
| **Bot abuse** | Cloudflare Bot Fight Mode ativado |
| **Scanner de vulnerabilidades** | Rate limiting + Cloudflare Security Level: Medium |
| **Path traversal** | NestJS não expõe sistema de arquivos; uploads vão para Supabase Storage (sem path local) |
| **Upload de arquivo malicioso** | Validação de MIME type no servidor (não apenas extensão); limite de tamanho; scan de conteúdo básico |
| **Denial of Service via JSON bomb** | Limite de profundidade de JSON (5 níveis) e tamanho de payload (10MB) |
| **HTTP Request Smuggling** | Cloudflare e Vercel mitigam; headers `Transfer-Encoding` e `Content-Length` inspecionados |

---

## 12. Backup e Recuperação de Desastres

### RS-BKP-001 — Política de Backup

**Referência:** ISO/IEC 27001 Controle A.12.3 (Information backup)
**Prioridade:** MANDATÓRIO

| Componente | Tipo de Backup | Frequência | Retenção | RPO |
|------------|---------------|-----------|---------|-----|
| PostgreSQL (banco) | Point-in-time recovery (PITR) automático via Supabase | Contínuo (WAL streaming) | 30 dias (plano Pro) | ≤ 24h |
| Supabase Storage (arquivos) | Snapshot incremental | Semanal | 90 dias (compliance); 30 dias (demais) | ≤ 7 dias |
| Código-fonte e migrations | Git (repositório GitHub) | A cada commit | Indefinido | 0 |
| Configurações de ambiente | Documentadas em `.env.example` + Vercel env | A cada alteração | Via Git history | 0 |
| Configurações Cloudflare | Export via Cloudflare API | Mensal | 90 dias | ≤ 30 dias |
| Registros de auditoria | Backup separado do banco | Diário | 5 anos | ≤ 24h |

**Verificação de integridade dos backups:**
- Restore de teste do banco de dados: mensal, em ambiente isolado.
- Verificação de integridade do Storage: checksum de arquivos críticos semanalmente.
- Resultado dos testes documentado em `Docs/Operação/22_RUNBOOK.md`.

---

### RS-BKP-002 — Recuperação de Desastres

**Referência:** ISO/IEC 27001 Controle A.17.1 (Information security continuity)
**Prioridade:** MANDATÓRIO

**Objetivos de recuperação:**

| Cenário | RTO | RPO | Estratégia |
|---------|-----|-----|-----------|
| Frontend indisponível (Vercel) | 30 min | 0 | Redeploy via Vercel CLI ou rollback de 1 clique |
| Backend indisponível | 1 hora | 0 | Redeploy via pipeline CI/CD |
| Banco de dados corrompido | 2 horas | 24 horas | Restore PITR via Supabase Dashboard |
| Perda total de dados do banco | 4 horas | 24 horas | Restore de backup diário |
| Comprometimento de credenciais | 2 horas | 0 (rotação imediata) | Rotação emergencial + invalidação de sessões |
| Comprometimento de conta de admin | 1 hora | 0 | Suspensão + rotação de credenciais de serviço |

**Exercício de DR:** simulação semestral de restore completo com tempo cronometrado. Resultado documentado.

---

## 13. Gestão de Evidências de Compliance

### RS-EVID-001 — Armazenamento Seguro de Evidências

**Referência ASVS:** V12.1 (File Upload), ISO/IEC 27001 Controle A.18.1
**Prioridade:** MANDATÓRIO

Evidências de controles de compliance (documentos, screenshots, relatórios) são armazenadas no Supabase Storage com os seguintes controles:

| Controle | Especificação |
|----------|--------------|
| **Bucket dedicado** | `compliance/` com políticas de acesso específicas |
| **Path estruturado** | `compliance/{orgUnit}/{controlId}/{YYYY-MM-DD}_{filename_sanitized}` |
| **Política de acesso (RLS)** | Leitura: COMPLIANCE_OFFICER, IT_MANAGER, AUDITOR, SUPER_ADMIN; Escrita: COMPLIANCE_OFFICER+ |
| **Tipos de arquivo permitidos** | PDF, PNG, JPG, JPEG, DOCX, XLSX, CSV — lista de whitelist validada no servidor |
| **Tamanho máximo** | 50MB por arquivo |
| **Sanitização de nome** | Remoção de caracteres especiais, path traversal (`../`), null bytes |
| **Verificação de MIME** | Validação do conteúdo do arquivo (magic bytes), não apenas extensão |
| **Imutabilidade** | Após aprovação da evidência, arquivos não podem ser substituídos — apenas nova versão |

---

### RS-EVID-002 — Cadeia de Custódia de Evidências

**Referência:** ISO/IEC 27001 Controle A.18.1.3
**Prioridade:** MANDATÓRIO

Toda evidência de compliance deve ter cadeia de custódia rastreável:

```
Evidência de Compliance
│
├── created_by: userId (quem fez upload)
├── created_at: timestamp (banco)
├── file_hash: SHA-256 do arquivo (calculado no upload)
├── storage_path: caminho no Supabase Storage
├── reviewed_by: userId | null (quem aprovou)
├── reviewed_at: timestamp | null
├── review_status: PENDING | APPROVED | REJECTED
└── audit_trail: audit_log entries vinculadas por entity_id
```

**Verificação de integridade:**
- Hash SHA-256 calculado no upload e armazenado no banco.
- Verificação periódica do hash: comparar hash armazenado com hash do arquivo no Storage.
- Discrepância detectada → alerta de segurança + registro no audit_log como `INTEGRITY_VIOLATION`.

---

### RS-EVID-003 — Exportação de Evidências para Auditoria

**Referência ASVS:** V7.2.9
**Prioridade:** MANDATÓRIO

A exportação de evidências para auditores externos deve:

- Ser autorizada por IT_MANAGER ou SUPER_ADMIN.
- Gerar registro no audit_log com `action=EXPORT` e lista de arquivos exportados.
- Produzir pacote com hash SHA-256 de cada arquivo e manifest de integridade.
- Ser entregue via URL assinada com expiração de 24 horas — nunca por e-mail com anexo.
- URLs assinadas expiradas removem o acesso automaticamente, sem necessidade de revogação manual.

---

## 14. Gestão de Segredos

### RS-SECRET-001 — Inventário e Classificação de Segredos

**Referência ASVS:** V6.4 (Secret Management)
**Prioridade:** MANDATÓRIO

| Segredo | Classificação | Armazenamento | Rotação |
|---------|--------------|--------------|---------|
| Chave privada JWT RS256 | Crítico | Vercel Env (criptografada) | Anual + emergencial |
| GOOGLE_CLIENT_SECRET | Crítico | Vercel Env | Anual |
| GOOGLE_SERVICE_ACCOUNT_KEY (JSON) | Crítico | Vercel Env (base64) | Anual |
| SUPABASE_SERVICE_ROLE_KEY | Crítico | Vercel Env | Semestral |
| GLPI_APP_TOKEN + USER_TOKEN | Alto | Vercel Env | Semestral |
| GITHUB_PAT | Alto | Vercel Env | Semestral |
| VERCEL_API_TOKEN | Médio | Vercel Env | Semestral |
| DATABASE_URL (com senha) | Crítico | Vercel Env | Anual ou em caso de comprometimento |
| SMTP_CREDENTIALS | Alto | Vercel Env | Anual |

---

### RS-SECRET-002 — Controles Obrigatórios para Segredos

**Referência ASVS:** V6.4.1–V6.4.2
**Prioridade:** MANDATÓRIO

**Proibições absolutas:**
- Segredos em código-fonte, mesmo em branches de desenvolvimento.
- Segredos em arquivos `.env` commitados (`.env.local`, `.env.production`).
- Segredos em comentários de código ou mensagens de commit.
- Segredos expostos em logs, stack traces ou respostas de API.
- Segredos em variáveis de ambiente não criptografadas em servidores de CI/CD.
- Segredos compartilhados por e-mail, chat ou documentos sem proteção.

**Obrigações:**
- Detecção de segredos via gitleaks ou trufflehog configurada como pre-commit hook e no pipeline CI.
- Qualquer segredo detectado no repositório deve ser revogado imediatamente — commit history não pode ser confiado após exposição.
- Novo segredo deve ser gerado e configurado antes de revogar o antigo (evitar downtime).
- Registro de todos os segredos ativos no inventário deste documento.

---

### RS-SECRET-003 — Procedimento de Rotação de Segredos

**Referência ASVS:** V6.4.2
**Prioridade:** MANDATÓRIO

**Rotação programada (semestral/anual conforme tabela RS-SECRET-001):**

```
1. Gerar novo segredo/chave
2. Atualizar Vercel Environment Variables (staging primeiro)
3. Validar funcionamento em staging (testes de integração)
4. Atualizar Vercel Environment Variables (produção)
5. Acionar redeploy de produção
6. Validar funcionamento em produção (smoke test)
7. Revogar segredo anterior no sistema provedor
8. Atualizar inventário neste documento com nova data de rotação
```

**Rotação emergencial (suspeita de comprometimento):**

```
1. IMEDIATAMENTE: revogar segredo comprometido no sistema provedor
2. Gerar e configurar novo segredo em produção
3. Invalidar todas as sessões de usuário ativas (se comprometimento de JWT key)
4. Registrar incidente de segurança no módulo de Compliance
5. Notificar time de segurança e gestão de TI
6. Analisar trilha de auditoria para identificar uso indevido do segredo
```

---

## 15. Controle de Acesso Administrativo

### RS-ADMIN-001 — Princípio do Menor Privilégio para Administradores

**Referência ASVS:** V4.1.3, V4.3 (Other Access Control Considerations)
**Prioridade:** MANDATÓRIO

O papel `SUPER_ADMIN` deve ter o menor número possível de detentores e os mais rigorosos controles de segurança:

| Controle | Requisito |
|----------|-----------|
| **Número de SUPER_ADMINs** | Máximo 2 por organização |
| **MFA** | Obrigatório com chave de segurança FIDO2 (não apenas TOTP) |
| **Sessões simultâneas** | Máximo 1 sessão ativa por SUPER_ADMIN |
| **Timeout de inatividade** | 30 minutos (mais restritivo que usuários comuns) |
| **Auditoria de todas as ações** | 100% das ações de SUPER_ADMIN auditadas com log de nível INFO |
| **Revisão de acesso** | Revisão mensal (não trimestral como demais papéis) |
| **Acesso just-in-time** | Quando possível, SUPER_ADMIN é elevação temporária, não papel permanente |

---

### RS-ADMIN-002 — Proteção das Interfaces Administrativas

**Referência ASVS:** V4.3.1–V4.3.3
**Prioridade:** MANDATÓRIO

| Interface | Controle de Acesso |
|-----------|-------------------|
| Supabase Studio (banco de dados) | Acesso via Supabase dashboard com MFA obrigatório; sem acesso direto ao PostgreSQL de produção |
| Vercel Dashboard | MFA obrigatório; acesso restrito a membros da equipe de TI |
| GitHub (repositório) | Branch protection em `main` e `staging`; aprovação de PR obrigatória; MFA habilitado na organização |
| Cloudflare Dashboard | MFA obrigatório; acesso restrito a IT_MANAGER+ |
| `GET /api/admin/*` (endpoints administrativos) | `SUPER_ADMIN` apenas; log de auditoria para cada acesso |

**Proibição de acesso direto ao banco de produção:**
- Sem acesso via `psql` ou cliente SQL a partir de máquinas locais de desenvolvimento.
- Queries de produção exclusivamente via Supabase Studio (com auditoria) ou Prisma via código deployado.
- Migrações executadas exclusivamente via pipeline CI/CD — nunca manualmente em produção.

---

### RS-ADMIN-003 — Gestão de Contas Privilegiadas

**Referência ASVS:** V2.3 (Authenticator Lifecycle)
**Prioridade:** MANDATÓRIO

**Criação de conta administrativa:**
- Criação de SUPER_ADMIN requer aprovação de dois IT_MANAGERs existentes.
- O processo de criação é registrado no audit_log.
- A conta é criada com MFA já configurado — nunca ativa sem MFA.

**Monitoramento de contas administrativas:**
- Qualquer login de SUPER_ADMIN gera notificação por e-mail para o time de segurança.
- Login de SUPER_ADMIN fora do horário comercial gera alerta de prioridade alta.
- Tentativa de login falha de conta administrativa gera alerta imediato.

**Contas de serviço (não humanas):**
- Cada serviço de integração (GLPI, Google, GitHub) usa conta de serviço dedicada.
- Contas de serviço sem acesso interativo (sem login humano).
- Credenciais de contas de serviço armazenadas exclusivamente em variáveis de ambiente (RS-SECRET-001).
- Auditoria de uso das contas de serviço via logs de integração.

---

## 16. Matriz de Controles OWASP ASVS

A tabela abaixo mapeia os requisitos de segurança do SGTI com os capítulos do OWASP ASVS v4.0:

| Capítulo ASVS | Título | Requisitos SGTI | Nível |
|--------------|--------|----------------|-------|
| V1 | Architecture, Design and Threat Modeling | RS-AUTHZ-001, RS-AUTHZ-003 | 2 |
| V2 | Authentication | RS-AUTH-001, RS-AUTH-002, RS-AUTH-003, RS-MFA-001, RS-MFA-002 | 2–3 |
| V3 | Session Management | RS-SESS-001, RS-SESS-002, RS-SESS-003 | 2 |
| V4 | Access Control | RS-AUTHZ-001, RS-AUTHZ-002, RS-RBAC-001, RS-RBAC-002, RS-RBAC-003, RS-ADMIN-001 | 2 |
| V5 | Validation, Sanitization and Encoding | RS-API-003, RS-ATK-002 | 2 |
| V6 | Stored Cryptography | RS-CRYPT-002, RS-CRYPT-003, RS-CRYPT-004, RS-SECRET-001, RS-SECRET-002 | 2 |
| V7 | Error Handling and Logging | RS-AUDIT-001, RS-AUDIT-002, RS-AUDIT-003, RS-LOG-001, RS-LOG-002 | 2 |
| V9 | Communications | RS-CRYPT-001, RS-API-006 | 2 |
| V10 | Malicious Code | RS-ATK-002 (injection controls) | 2 |
| V11 | Business Logic | RS-AUTHZ-003 (segregação de funções) | 2 |
| V12 | Files and Resources | RS-EVID-001, RS-ATK-005 (upload) | 2 |
| V13 | API and Web Service | RS-API-001, RS-API-002, RS-API-003, RS-API-004, RS-ATK-003 | 2 |
| V14 | Configuration | RS-API-004, RS-API-005, RS-ADMIN-002 | 2 |

**Controles ASVS Nível 3 aplicados seletivamente:**

| Controle ASVS L3 | Módulo | Justificativa |
|-----------------|--------|--------------|
| V2.6 (Look-up secret verifier) | Authentication | Dados pessoais e acesso a sistemas críticos |
| V3.6 (Re-authentication for sensitive operations) | Identity, Compliance | Operações de alto impacto (desprovisionamento, export) |
| V4.3.3 (Least privilege for admin functions) | SUPER_ADMIN | Acesso privilegiado a todos os dados do sistema |
| V7.3.1 (Log protection) | Audit | Trilha de auditoria como evidência de compliance |

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição da Alteração |
|--------|------|-------|------------------------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa · Segurança da Informação | Criação do documento |

---

> **Próximos documentos recomendados:**
> [`13_NON_FUNCTIONAL_REQUIREMENTS.md`](./13_NON_FUNCTIONAL_REQUIREMENTS.md) — RNFs incluindo requisitos de segurança em perspectiva de qualidade
> [`12_ARCHITECTURE.md`](./12_ARCHITECTURE.md) — Implementação arquitetural dos controles de segurança
> [`82_ARCHITECT_DECISIONS.md`](./82_ARCHITECT_DECISIONS.md) — ADRs relacionados a decisões de segurança (JWT RS256, OAuth, etc.)
