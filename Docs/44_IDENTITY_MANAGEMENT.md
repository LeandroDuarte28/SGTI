# SGTI — Sistema de Gestão de Tecnologia da Informação
## Módulo de Gestão de Identidades e Acessos (IAM) — Documentação Funcional

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [22_AUTHENTICATION.md](./22_AUTHENTICATION.md) · [23_USER_ROLES.md](./23_USER_ROLES.md) · [24_BUSINESS_RULES.md](./24_BUSINESS_RULES.md) · [41_REQUEST_MANAGEMENT.md](./41_REQUEST_MANAGEMENT.md) · [20_DATABASE.md](./20_DATABASE.md)

---

## Sobre este Documento

Este documento define a **especificação funcional completa do Módulo de Gestão de Identidades e Acessos (IAM) do SGTI**. Cobre conceito, ciclo de vida de identidades, fluxos de provisionamento e desprovisionamento, integração com Google Workspace, sincronização, API corporativa, auditoria, compliance, dashboards e regras de negócio.

**Escopo exclusivo:** documentação funcional e de processo. Nenhum código, SQL ou especificação de API é gerado neste documento.

---

## Sumário

1. [Conceito de IAM](#1-conceito-de-iam)
2. [Objetivos do Módulo](#2-objetivos-do-módulo)
3. [Perfis e Responsabilidades](#3-perfis-e-responsabilidades)
4. [Estrutura do Usuário](#4-estrutura-do-usuário)
5. [Estrutura de Grupos](#5-estrutura-de-grupos)
6. [Estrutura de Permissões — RBAC](#6-estrutura-de-permissões--rbac)
7. [Provisionamento de Usuário](#7-provisionamento-de-usuário)
8. [Alteração de Acessos](#8-alteração-de-acessos)
9. [Revogação e Desprovisionamento](#9-revogação-e-desprovisionamento)
10. [Integração com Google Workspace](#10-integração-com-google-workspace)
11. [Sincronização Google ↔ SGTI](#11-sincronização-google--sgti)
12. [API Corporativa de Identidades](#12-api-corporativa-de-identidades)
13. [Auditoria e Rastreabilidade](#13-auditoria-e-rastreabilidade)
14. [Compliance e Conformidade](#14-compliance-e-conformidade)
15. [Dashboards e Indicadores](#15-dashboards-e-indicadores)
16. [Relatórios](#16-relatórios)
17. [Regras de Negócio](#17-regras-de-negócio)
18. [Critérios de Aceitação](#18-critérios-de-aceitação)

---

## 1. Conceito de IAM

### 1.1 Definição

**Gestão de Identidades e Acessos (IAM — Identity and Access Management)** é o conjunto de processos, políticas e tecnologias que garantem que as pessoas certas tenham acesso aos recursos certos, no momento certo e pelos motivos corretos, enquanto impedem acesso não autorizado.

No contexto do SGTI, IAM governa:

- **Quem** pode acessar o sistema (identidades de usuários).
- **O que** cada usuário pode fazer (papéis e permissões).
- **Como** o acesso é concedido e revogado (provisionamento e desprovisionamento).
- **Quando e de onde** o acesso ocorre (sessões, auditoria de acessos).

### 1.2 Pilares do IAM no SGTI

| Pilar | Definição | Implementação |
|:-----:|-----------|--------------|
| **Autenticação** | Verificar que o usuário é quem diz ser | Google OAuth 2.0 + PKCE; magic link via Supabase |
| **Autorização** | Controlar o que o usuário pode fazer | RBAC com 10 papéis hierárquicos; policies por módulo |
| **Provisionamento** | Criar e configurar identidades | Fluxo automatizado via Google Admin SDK |
| **Desprovisionamento** | Remover acessos ao encerrar vínculo | Fluxo obrigatório de offboarding com ordem definida |
| **Auditoria** | Registrar quem fez o quê e quando | Trilha imutável em `shared.audit_log` |
| **Revisão de Acesso** | Validar periodicamente que acessos ainda são adequados | Ciclo trimestral gerenciado pelo módulo |

### 1.3 IAM no Contexto ITIL v4

No vocabulário ITIL v4, o IAM está alinhado à prática de **Gestão de Informações de Segurança (Information Security Management)** e ao conceito de **Controle de Acesso** — garantindo que serviços sejam acessados apenas por usuários autorizados e que acessos sejam removidos quando não mais necessários.

### 1.4 Princípios Fundamentais de IAM

| Princípio | Aplicação no SGTI |
|-----------|------------------|
| **Menor Privilégio** | Todo usuário recebe apenas as permissões mínimas necessárias para sua função |
| **Separação de Funções (SoD)** | Funções conflitantes não podem ser exercidas pela mesma pessoa |
| **Necessidade de Conhecimento** | Acesso concedido apenas quando há justificativa documentada |
| **Acesso por Padrão Negado** | Sem papel atribuído, o usuário não acessa nenhum recurso do SGTI |
| **Revogação Imediata** | Acessos revogados entram em vigor imediatamente, sem delay |
| **Rastreabilidade Completa** | Todo acesso concedido ou revogado é registrado com responsável e motivo |

---

## 2. Objetivos do Módulo

### 2.1 Objetivo Primário

Garantir que apenas identidades devidamente autorizadas acessem o SGTI e os serviços corporativos integrados, com ciclo de vida de acesso gerenciado, rastreado e em conformidade com políticas internas e regulações externas.

### 2.2 Objetivos Específicos

| # | Objetivo | Indicador | Meta |
|---|----------|-----------|:----:|
| 1 | Único ponto de gestão de identidades | % identidades gerenciadas exclusivamente pelo SGTI | 100% |
| 2 | Provisionamento automatizado | % contas Google criadas automaticamente via SGTI | ≥ 95% |
| 3 | Desprovisionamento imediato em desligamentos | Tempo máximo entre solicitação e suspensão Google | ≤ 2 horas |
| 4 | Revisão periódica de acessos | % usuários com revisão de acesso em dia | 100% trimestral |
| 5 | Segregação de funções aplicada | Conflitos SoD detectados e bloqueados | 100% |
| 6 | Rastreabilidade de concessões | % concessões com responsável e justificativa | 100% |
| 7 | Conformidade com LGPD e ISO 27001 | Evidências de acesso disponíveis para auditoria | 100% |
| 8 | API corporativa disponível | Latência < 200ms para operações de identidade | 100% |

### 2.3 Limites do Módulo

**O módulo IAM do SGTI:**
- Gerencia identidades e acessos **dentro do SGTI** e orquestra o Google Workspace.
- Não substitui o Google Admin Console como console de administração do Google.
- Não gerencia acessos a outros sistemas de negócio (ERP, CRM) diretamente — esses sistemas têm seus próprios controles que podem ser acionados por requisição via SGTI.

---

## 3. Perfis e Responsabilidades

### 3.1 Usuário (END_USER)

**No contexto do IAM:**
- Visualizar seu próprio perfil de usuário e papéis atribuídos.
- Solicitar alterações de acesso via módulo de Requisições.
- Confirmar revisões de acesso próprias quando solicitado.
- Visualizar última sessão e atividade recente na conta.

**Limitações:** Não visualiza acessos de outros usuários. Não pode solicitar papéis diretamente — apenas via requisição.

---

### 3.2 Analista de TI (IT_TECHNICIAN)

**Responsabilidades:**
- Executar provisionamento de contas após aprovação do IT_MANAGER.
- Executar configuração de acessos em sistemas específicos pós-aprovação.
- Reportar inconsistências detectadas no inventário de identidades.

**Limitações:**
- Não pode atribuir papéis IT_SPECIALIST ou superiores.
- Não pode aprovar requisições de acesso.

---

### 3.3 Coordenador de TI (IT_SPECIALIST)

**Responsabilidades:**
- Atribuir papéis até IT_TECHNICIAN.
- Gerenciar membros de grupos de suporte.
- Configurar delegações temporárias de acesso.
- Conduzir revisões de acesso para usuários do seu grupo.
- Executar desprovisionamentos de urgência sob supervisão do IT_MANAGER.

---

### 3.4 Gestor de TI (IT_MANAGER)

**Responsabilidades:**
- **Aprovar** concessão e revogação de qualquer papel.
- **Iniciar e concluir** ciclos de revisão periódica de acessos.
- **Autorizar** provisionamento de novos colaboradores.
- **Executar ou supervisionar** desprovisionamentos por desligamento.
- **Revisar** relatórios de acesso e anomalias.
- **Garantir** conformidade com a política de IAM.
- **Aprovar** papéis críticos (IT_MANAGER+) com validação dupla.

---

### 3.5 Analista de Compliance (COMPLIANCE_OFFICER)

**Responsabilidades:**
- Auditar concessões e revogações de acesso para fins regulatórios.
- Validar que revisões de acesso foram realizadas dentro dos prazos.
- Gerar evidências de IAM para auditorias externas (ISO 27001, LGPD).
- Reportar ao IT_MANAGER acessos não conformes identificados.
- Verificar cumprimento das regras de Segregação de Funções.

---

### 3.6 Administrador (SUPER_ADMIN)

**Responsabilidades:**
- Configurar papéis, grupos e políticas de acesso do sistema.
- Executar operações privilegiadas de correção de identidades.
- Gerenciar parâmetros de integração com Google Workspace e Supabase Auth.
- Auditar o módulo com acesso irrestrito ao audit_log.
- Atribuir e revogar o papel SUPER_ADMIN (operação de altíssimo risco; requer 2FA e justificativa).

---

## 4. Estrutura do Usuário

### 4.1 Seção: Identificação e Autenticação

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **id** | UUID v4 | Sim — automático | Não | Identificador interno único. Gerado pelo banco. Imutável. |
| **tenant_id** | UUID | Sim — automático | Não | Tenant da organização. Preenchido automaticamente. |
| **email** | String (255) | Sim | Não após criar | E-mail corporativo do domínio configurado (ex.: @empresa.com.br). Único por tenant. |
| **display_name** | String (200) | Sim | Sincronizado do Google | Nome de exibição. Fonte primária: Google Workspace. |
| **google_user_id** | String (200) | Não (obrigatório após provisionamento) | Não | ID único da conta Google (`sub` claim do token OAuth). |
| **supabase_user_id** | UUID | Não | Não | ID do usuário no Supabase Auth. Preenchido na criação da sessão. |
| **avatar_url** | URL | Não | Sincronizado do Google | URL da foto de perfil. Origem: Google. |
| **status** | Enum | Sim | Conforme fluxo | `INVITED`, `PENDING_PROVISIONING`, `ACTIVE`, `SUSPENDED`, `INACTIVE`. |
| **iam_status** | Enum | Sim | Automático | `PROVISIONING`, `ACTIVE`, `PENDING_DEPROVISIONING`, `DEPROVISIONED`, `SUSPENDED`. |

### 4.2 Seção: Dados Organizacionais

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **full_name** | String (300) | Sim | IT_MANAGER+ | Nome completo do colaborador. Armazenado separado do display_name para fins de auditoria. |
| **job_title** | String (200) | Não | IT_MANAGER+ | Cargo/função. Sincronizado do Google Workspace (organizações). |
| **department_id** | UUID (FK) | Não | IT_MANAGER+ | Departamento ao qual o usuário pertence. |
| **business_unit_id** | UUID (FK) | Não | IT_MANAGER+ | Unidade de negócio. |
| **manager_id** | UUID (FK) | Não | IT_MANAGER+ | ID do gestor direto do usuário. Utilizado para aprovações de requisições. |
| **employee_id** | String (50) | Não | IT_MANAGER+ | Matrícula corporativa do colaborador (quando existente). |
| **hire_date** | Date | Não | IT_MANAGER+ | Data de admissão. Usado para automações de onboarding. |
| **termination_date** | Date | Não | IT_MANAGER+ | Data de desligamento planejada. Aciona alertas de offboarding. |

### 4.3 Seção: Configurações e Preferências

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **locale** | String (10) | Sim | Usuário | Idioma da interface: `pt-BR` (padrão), `en-US`. |
| **timezone** | String (50) | Sim | Usuário | Fuso horário: `America/Sao_Paulo` (padrão). |
| **notification_email** | Boolean | Sim | Usuário | Receber notificações por e-mail. Padrão: `true`. |
| **notification_inapp** | Boolean | Sim | Usuário | Receber notificações in-app. Padrão: `true`. |
| **theme** | Enum | Não | Usuário | `LIGHT`, `DARK`, `SYSTEM`. |

### 4.4 Seção: Controle de Acesso e Sessão

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **mfa_enabled** | Boolean | Sim — sincronizado | Não | Indica se MFA está habilitado na conta Google. Informativo. |
| **last_sign_in** | DateTime | Automático | Não | Timestamp do último login bem-sucedido. |
| **last_activity** | DateTime | Automático | Não | Última atividade registrada no sistema. |
| **failed_login_count** | Inteiro | Automático | Não | Contador de tentativas de login falhas consecutivas. Zerado ao autenticar com sucesso. |
| **google_org_unit** | String (300) | Sincronizado | Não | Unidade Organizacional do Google Workspace. |
| **next_access_review_due** | Date | Automático | IT_MANAGER+ | Data limite para a próxima revisão de acesso do usuário. |

### 4.5 Seção: Rastreabilidade (campos de auditoria padrão)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| **created_at** | DateTime | Timestamp de criação. Preenchido pelo banco. Imutável. |
| **created_by** | UUID | Usuário que criou o registro. |
| **updated_at** | DateTime | Última atualização. |
| **updated_by** | UUID | Quem realizou a última atualização. |
| **deleted_at** | DateTime | Soft-delete. Nulo = ativo. |
| **deleted_by** | UUID | Quem executou o soft-delete. |

### 4.6 Status do Ciclo de Vida do Usuário

```
CICLO DE VIDA DO USUÁRIO

INVITED
  ↓ Usuário aceita convite e autentica via Google
PENDING_PROVISIONING
  ↓ Provisionamento Google concluído + papéis atribuídos
ACTIVE
  ↓ Desligamento solicitado / Suspensão por segurança
SUSPENDED (temporário — segurança ou férias longas)
  ↓ Desligamento confirmado
INACTIVE
  ↓ Soft-delete (após período de retenção)
[deleted_at preenchido]
```

---

## 5. Estrutura de Grupos

### 5.1 Conceito de Grupo no SGTI

Grupos são coleções de usuários que compartilham características operacionais: um time técnico, um grupo de suporte de um domínio, ou uma unidade de negócio. Grupos são usados para:

- Roteamento de chamados de incidentes e requisições.
- Atribuição em lote de papéis e permissões.
- Comunicação por e-mail via grupos Google Workspace.
- Escalonamento automático de chamados.

### 5.2 Tipos de Grupo

| Tipo | Propósito | Gerenciado por |
|:----:|-----------|:--------------:|
| **Grupo de Suporte** | Time técnico responsável por um domínio (Infraestrutura, Redes, Sistemas, Segurança) | IT_SPECIALIST+ |
| **Grupo de Aprovação** | Conjunto de aprovadores para fluxos de requisição | IT_MANAGER+ |
| **Grupo Organizacional** | Reflete a estrutura hierárquica da empresa (departamento, BU) | Sincronizado do Google |
| **Grupo de Projeto** | Time de um projeto específico | PROJECT_MANAGER+ |
| **Grupo de Compliance** | Equipe de conformidade e auditoria | COMPLIANCE_OFFICER+ |

### 5.3 Campos da Estrutura de Grupo

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **id** | UUID | Sim — automático | Não | Identificador único. |
| **name** | String (200) | Sim | IT_SPECIALIST+ | Nome do grupo. Ex.: "Suporte de Infraestrutura". |
| **type** | Enum | Sim | Não após criar | `SUPPORT`, `APPROVAL`, `ORGANIZATIONAL`, `PROJECT`, `COMPLIANCE`. |
| **description** | Texto | Não | IT_SPECIALIST+ | Descrição do escopo e responsabilidade do grupo. |
| **email** | String | Não | IT_SPECIALIST+ | E-mail de grupo Google correspondente (ex.: ti-infra@empresa.com.br). |
| **google_group_id** | String | Não | Sincronizado | ID do grupo no Google Workspace. |
| **is_managed_by_google** | Boolean | Automático | Não | `true` quando grupo sincronizado do Google via tag `sgti:managed=true`. |
| **leader_id** | UUID (FK) | Não | IT_MANAGER+ | Líder técnico do grupo (responsável por aprovações e escalonamentos). |
| **members** | Array (FK User) | Não | IT_SPECIALIST+ | Membros do grupo. |
| **is_active** | Boolean | Sim | IT_MANAGER+ | Grupos inativos não aparecem para seleção em chamados. |

### 5.4 Hierarquia de Grupos de Suporte

Para o roteamento de chamados, os grupos de suporte seguem a hierarquia técnica:

```
HIERARQUIA DE GRUPOS DE SUPORTE

N1 — Service Desk
  └── Suporte Geral (resolução de primeiro contato)

N2 — Especialistas de Domínio
  ├── Suporte de Infraestrutura
  ├── Suporte de Redes
  ├── Suporte de Sistemas e Aplicações
  ├── Suporte de Segurança
  └── Suporte Google Workspace

N3 — Arquitetura e Engenharia
  ├── Arquitetura de TI
  └── Engenharia de Segurança
```

---

## 6. Estrutura de Permissões — RBAC

### 6.1 Modelo de Controle de Acesso

O SGTI utiliza **RBAC (Role-Based Access Control)** com os seguintes componentes:

| Componente | Definição | Exemplo |
|:----------:|-----------|---------|
| **Sujeito** | Usuário autenticado | João Silva (END_USER) |
| **Papel (Role)** | Conjunto nomeado de permissões | `IT_TECHNICIAN` |
| **Permissão** | Operação sobre um recurso | `incident:create`, `asset:read` |
| **Recurso** | Entidade do sistema | Incidente, Ativo, Usuário |
| **Contexto** | Condição adicional | Próprios chamados vs. todos |

### 6.2 Papéis do SGTI

| Papel de Negócio | Role Code | Hierarquia | Escopo |
|:-----------------:|:---------:|:----------:|--------|
| **Usuário** | `END_USER` | 5 (mais baixo) | Acesso a próprios chamados e KB pública |
| **Analista** | `IT_TECHNICIAN` | 4 | Atendimento técnico de chamados e ativos |
| **Coordenador** | `IT_SPECIALIST` | 3 | Investigação de problemas; aprovações de nível 1 |
| **Compliance** | `COMPLIANCE_OFFICER` | 3 | Auditoria e conformidade (papel horizontal) |
| **Gestor** | `IT_MANAGER` | 2 | Gestão operacional completa de TI |
| **Administrador** | `SUPER_ADMIN` | 1 (mais alto) | Acesso irrestrito à plataforma |
| **Analista Financeiro** | `FINANCIAL_ANALYST` | — | Papel transversal: acesso ao módulo Financeiro |
| **Gerente de Projeto** | `PROJECT_MANAGER` | — | Papel transversal: gestão de projetos |
| **Auditor** | `AUDITOR` | — | Papel transversal: leitura de audit_log |
| **Executivo** | `EXECUTIVE` | — | Papel transversal: dashboards executivos |

### 6.3 Atribuição de Múltiplos Papéis

Um usuário pode ter múltiplos papéis simultaneamente. O sistema aplica a **união das permissões** de todos os papéis atribuídos. Exceto para regras de SoD, onde o conflito é detectado e bloqueado.

**Exemplo válido:** `IT_TECHNICIAN` + `FINANCIAL_ANALYST` → técnico com acesso ao módulo financeiro.
**Exemplo inválido (SoD):** `IT_TECHNICIAN` + `AUDITOR` para auditar seus próprios registros → bloqueado.

### 6.4 Regras de Segregação de Funções (SoD)

| SoD ID | Papel A | Papel B | Motivo da Restrição |
|:------:|:-------:|:-------:|:-------------------:|
| SoD-01 | Quem abre chamado | Quem fecha chamado | Não pode auto-fechar |
| SoD-02 | Quem registra lançamento financeiro | Quem aprova | Controle financeiro |
| SoD-03 | Quem provisiona usuário | Quem aprova provisioning | Controle de acesso |
| SoD-04 | Quem solicita requisição | Quem aprova requisição | Anti-fraude |
| SoD-05 | Quem executa ação | Quem audita a ação | Independência de auditoria |
| SoD-06 | Gestor de área | Aprovador de compras de sua área | Conflito de interesse |

### 6.5 Estrutura de UserRole

Cada atribuição de papel é um registro em `auth.UserRole` com:

| Campo | Descrição |
|-------|-----------|
| `user_id` | Usuário que recebe o papel |
| `role_id` | Papel atribuído |
| `assigned_by` | Quem atribuiu |
| `assignment_reason` | Justificativa obrigatória |
| `valid_from` | Data de início da vigência |
| `valid_until` | Data de expiração (null = indefinido) |
| `is_active` | Status atual da atribuição |
| `revoked_by` | Quem revogou (null se ativo) |
| `revoked_at` | Quando foi revogado |
| `revocation_reason` | Motivo da revogação |

---

## 7. Provisionamento de Usuário

### 7.1 Conceito de Provisionamento

Provisionamento é o processo de **criar e configurar** a identidade digital de um novo colaborador, garantindo que ele tenha acesso exatamente ao que precisa no primeiro dia de trabalho — nem mais, nem menos.

### 7.2 Origens de Provisionamento

| Origem | Fluxo | Responsável |
|:------:|-------|:-----------:|
| **Requisição de Criação de Usuário** | Via módulo Requisições (REQ-TYPE-001) — fluxo formal e auditado | IT_MANAGER |
| **Onboarding em Lote** | Importação via planilha para admissões em grupo | IT_MANAGER+ |
| **API Corporativa** | Integração direta para sistemas de RH que disparam o onboarding | IT_MANAGER (autoriza) |
| **Manual** | SUPER_ADMIN cria diretamente (apenas casos especiais com justificativa) | SUPER_ADMIN |

### 7.3 Fluxo Completo de Provisionamento

```
 ETAPA 1: SOLICITAÇÃO E APROVAÇÃO
 ──────────────────────────────────
 Gestor da área ou RH abre REQ-TYPE-001 (Criação de Usuário):
   Campos: nome completo, e-mail corporativo, cargo, departamento,
           gestor direto, data de admissão, papéis iniciais solicitados
   Fluxo de aprovação: IT_MANAGER → (Compliance se papel sensível)
           │
           ▼
 ETAPA 2: VALIDAÇÕES PRÉ-PROVISIONAMENTO
 ─────────────────────────────────────────
 Ao aprovar, o sistema valida:
   ✓ E-mail não existe em outro usuário ativo do tenant
   ✓ Domínio do e-mail pertence ao tenant configurado
   ✓ Papéis solicitados não violam nenhuma regra SoD
   ✓ Gestor informado é um usuário ACTIVE com papel IT_MANAGER+
   ✓ Data de admissão é válida (presente ou futura)
           │
           ▼
 ETAPA 3: CRIAÇÃO NO SGTI
 ──────────────────────────
 auth.User criado com:
   status = INVITED
   iam_status = PROVISIONING
   email = e-mail corporativo
   created_by = IT_MANAGER aprovador
   next_access_review_due = admissão + 90 dias
           │
           ▼
 ETAPA 4: PROVISIONAMENTO NO GOOGLE WORKSPACE
 ──────────────────────────────────────────────
 GoogleDirectoryAdapter.createAccount():
   → Cria conta Google: users.insert({email, name, password temporária, orgUnit})
   → Adiciona aos grupos Google conforme papéis solicitados
   → Define orgUnitPath baseado no departamento

   Sucesso:
     → auth.User.google_user_id preenchido
     → auth.User.status = ACTIVE
     → identity.GoogleUserReference criado
     → iam_status = ACTIVE

   Falha:
     → auth.User.status = PENDING_PROVISIONING
     → Retry automático em 30 min (backoff exponencial)
     → Após 3 tentativas: alerta ao IT_MANAGER para ação manual
           │
           ▼
 ETAPA 5: ATRIBUIÇÃO DE PAPÉIS
 ────────────────────────────────
 Para cada papel solicitado na requisição:
   → auth.UserRole criado com:
      assigned_by = IT_MANAGER aprovador
      assignment_reason = justificativa da requisição
      valid_from = data de admissão
      is_active = true
   → Verificação SoD para cada papel
   → Registro em audit_log: action = ROLE_ASSIGNED
           │
           ▼
 ETAPA 6: COMUNICAÇÃO DE BOAS-VINDAS
 ─────────────────────────────────────
 Ao usuário:
   E-mail de boas-vindas com:
   → Magic link de primeiro acesso (válido 72 horas)
   → Instruções de configuração da conta Google
   → Guia rápido do SGTI para o papel atribuído

 Ao IT_MANAGER:
   Confirmação de provisionamento concluído
   Lista de papéis atribuídos
           │
           ▼
 ETAPA 7: CONCLUSÃO DA REQUISIÇÃO
 ────────────────────────────────────
 Requisição REQ-TYPE-001 marcada como FULFILLED
 Evidência de provisionamento gerada no módulo Compliance
 AuditLog: action = USER_PROVISIONED
```

### 7.4 Provisionamento em Lote

Para onboarding de múltiplos colaboradores (eventos de admissão em grupo):

1. IT_MANAGER+ importa planilha com dados dos colaboradores.
2. Sistema valida cada linha: e-mail único, domínio correto, campos obrigatórios.
3. Relatório de validação exibido antes de confirmar.
4. Ao confirmar: processo de provisionamento executado sequencialmente.
5. Relatório final com: sucesso, erros e pendências de retry.

### 7.5 Convidar Colaborador com Antecedência

Para garantir acesso no primeiro dia:

```
IT_MANAGER usa "Convidar Colaborador" com data de admissão futura:
  → auth.User criado com status = INVITED
  → E-mail de convite enviado com link válido por 72 horas
  → No dia da admissão (ou no dia seguinte se convite não aceito):
      Sistema provisionamento automático disparado
  → Alerta ao IT_MANAGER se colaborador não aceitou convite
    até 1 dia antes da admissão
```

---

## 8. Alteração de Acessos

### 8.1 Tipos de Alteração Suportados

| Tipo | Via | Aprovação |
|:----:|:---:|:---------:|
| Concessão de novo papel | REQ-TYPE-004 ou direto pelo IT_MANAGER | IT_MANAGER obrigatório |
| Revogação de papel específico | IT_MANAGER ou Compliance | IT_MANAGER |
| Alteração de departamento | REQ-TYPE-002 | IT_MANAGER |
| Alteração de gestor direto | REQ-TYPE-002 | IT_MANAGER |
| Promoção de cargo | REQ-TYPE-002 | IT_MANAGER |
| Concessão de papel crítico (IT_MANAGER+) | Processo especial | Dois IT_MANAGERs ou SUPER_ADMIN |
| Delegação temporária | IT_SPECIALIST+ | IT_MANAGER |

### 8.2 Fluxo de Concessão de Novo Papel

```
CONCESSÃO DE PAPEL — FLUXO

1. Solicitante (ou IT_MANAGER em nome do usuário) abre requisição REQ-TYPE-004

2. Formulário:
   - Usuário beneficiário
   - Papel solicitado
   - Justificativa de negócio (obrigatória, mín. 30 chars)
   - Data de vigência (opcional: acesso temporário)
   - Base legal se dados pessoais (LGPD)

3. Verificação automática de SoD:
   Se conflito detectado → requisição BLOQUEADA com detalhe do conflito

4. Aprovação:
   - Até IT_SPECIALIST: aprovação do IT_MANAGER
   - IT_MANAGER: aprovação de segundo IT_MANAGER + Compliance
   - SUPER_ADMIN: apenas pelo SUPER_ADMIN atual com 2FA obrigatório

5. Execução:
   - auth.UserRole criado
   - Grupos Google atualizados (se aplicável)
   - AuditLog: action = ROLE_ASSIGNED
   - Usuário notificado do novo acesso
```

### 8.3 Delegação Temporária de Acesso

Para cobertura de ausências (férias, licenças):

```
IT_SPECIALIST+ configura delegação:
  - Usuário delegante (quem está se ausentando)
  - Usuário delegado (quem cobrirá)
  - Período (data início + data fim)
  - Escopo: todos os papéis ou papéis específicos

Efeitos:
  - Delegado recebe papel temporário com valid_until = fim da delegação
  - Ao fim do período: papel revogado automaticamente
  - Delegante mantém seus próprios acessos durante a delegação

Restrições:
  - Delegado não pode ter conflito SoD com o delegante
  - Delegado não pode receber papéis superiores ao seu papel atual
  - IT_MANAGER precisa aprovar delegações de papéis IT_SPECIALIST+
```

---

## 9. Revogação e Desprovisionamento

### 9.1 Diferença entre Revogação e Desprovisionamento

| Operação | Escopo | Gatilho | Reversibilidade |
|:--------:|--------|:-------:|:---------------:|
| **Revogação de Papel** | Remove um papel específico; usuário permanece ativo | Mudança de função, SoD, revisão de acesso | Reversível |
| **Suspensão** | Bloqueia acesso temporariamente; dados e papéis preservados | Suspeita de segurança, afastamento | Reversível |
| **Desprovisionamento** | Remove todos os acessos; desliga a identidade | Desligamento definitivo do colaborador | Irreversível |

### 9.2 Revogação de Papel Específico

```
REVOGAÇÃO DE PAPEL — FLUXO

1. IT_MANAGER (ou Compliance Officer) inicia:
   - Usuário alvo
   - Papel a revogar
   - Motivo (obrigatório, mín. 20 chars)
   - Verificação: usuário tem outros papéis funcionais?

2. Execução imediata:
   - auth.UserRole.is_active = false
   - auth.UserRole.revoked_by = executante
   - auth.UserRole.revoked_at = NOW()
   - auth.UserRole.revocation_reason = motivo

3. Sessões afetadas:
   - Sessões ATIVAS do usuário invalidadas imediatamente
   - Próximo request retornará 403 Forbidden

4. Registro:
   - AuditLog: action = ROLE_REVOKED
   - Usuário notificado (sem detalhar motivo interno)
   - Compliance notificado (se papel sensível)
```

### 9.3 Suspensão de Usuário

```
SUSPENSÃO TEMPORÁRIA — GATILHOS E FLUXO

Gatilhos automáticos (sistema):
  → 5 tentativas de login falhas consecutivas → suspensão automática
  → Conta Google suspensa detectada na sincronização
  → Evento de segurança crítico (comprometimento de conta)

Gatilho manual (IT_MANAGER+):
  → Suspeita de uso indevido
  → Afastamento prolongado sem previsão de retorno
  → Investigação disciplinar em andamento

Fluxo de suspensão:
  1. auth.User.status = SUSPENDED
  2. Todas as sessões ativas revogadas IMEDIATAMENTE
  3. JWT da sessão bloqueado via blacklist Redis
  4. Conta Google suspensa (users.update({suspended: true}))
  5. AuditLog: action = USER_SUSPENDED + motivo
  6. IT_MANAGER notificado

Reativação (apenas IT_MANAGER+):
  1. auth.User.status = ACTIVE
  2. Conta Google reativada
  3. Usuário recebe e-mail de reativação
  4. AuditLog: action = USER_REACTIVATED
```

### 9.4 Desprovisionamento por Desligamento — Fluxo Obrigatório

```
ORDEM OBRIGATÓRIA DE DESPROVISIONAMENTO (BR-GWS-004)

T+0min: Solicitação de desprovisionamento recebida (via REQ-TYPE-003)
         ↓
T+0min: PASSO 1 — REVOGAR SESSÕES SGTI
         → Todas as sessões ativas do usuário invalidadas IMEDIATAMENTE
         → user_id adicionado à blacklist JWT por 1 hora
         → auth.User.iam_status = PENDING_DEPROVISIONING

T+0–30min: PASSO 2 — SUSPENDER CONTA GOOGLE
         → GoogleDirectoryAdapter.suspendAccount(google_user_id)
         → Google suspende acesso a Gmail, Drive, Meet, etc.
         → identity.GoogleUserReference.suspended = true

T+0–2h: PASSO 3 — TRANSFERIR RESPONSABILIDADES
         → Ativos alocados: desalocados automaticamente
            Notificação ao IT_MANAGER com lista de ativos
         → Chamados atribuídos: transferidos para o grupo
         → Projetos como responsável: gestor do projeto notificado
         → Aprovações pendentes: delegadas ao IT_MANAGER
         → Grupos de e-mail: removido de todos

T+0–2h: PASSO 4 — REVOGAR PAPÉIS NO SGTI
         → Todos os auth.UserRole.is_active = false
         → Todos os papéis encerrados com revocation_reason = OFFBOARDING

T+2h (prazo máximo): PASSO 5 — INATIVAR CONTA
         → auth.User.status = INACTIVE
         → auth.User.iam_status = DEPROVISIONED
         → auth.User.termination_date = data efetiva

T+RESOLUÇÃO: PASSO 6 — RELATÓRIO DE OFFBOARDING
         → Relatório automático gerado:
            Ativos desalocados, chamados transferidos,
            papéis revogados, conta Google suspensa
         → Arquivado como evidência de compliance
         → REQ-TYPE-003 marcada como FULFILLED

APÓS PERÍODO DE RETENÇÃO (configurável, padrão 6 meses):
         → soft-delete do usuário (deleted_at preenchido)
         → Dados de auditoria preservados indefinidamente
```

### 9.5 Retenção de Dados Pós-Desligamento

| Tipo de Dado | Retenção | Motivo |
|:------------:|:--------:|--------|
| Registros de auditoria | Indefinida | Conformidade legal |
| Histórico de acessos | 5 anos | LGPD + ISO 27001 |
| Chamados criados | Indefinida | Rastreabilidade |
| Dados de perfil (nome, e-mail) | 5 anos | Requerimento legal |
| Dados pessoais sensíveis | Excluídos após 6 meses | LGPD (minimização) |

---

## 10. Integração com Google Workspace

### 10.1 Arquitetura da Integração

O SGTI integra com o Google Workspace via **Google Admin SDK** usando uma **Service Account** com delegação em todo o domínio (Domain-Wide Delegation):

```
SGTI Backend (NestJS)
    │
    ├── GoogleDirectoryAdapter (Port → Infrastructure Layer)
    │       ├── createAccount(userData) → google_user_id
    │       ├── updateAccount(google_user_id, changes)
    │       ├── suspendAccount(google_user_id)
    │       ├── deleteAccount(google_user_id) [apenas SUPER_ADMIN]
    │       ├── addToGroup(google_user_id, group_email)
    │       ├── removeFromGroup(google_user_id, group_email)
    │       ├── getUser(google_user_id) → user_data
    │       └── listGroupMembers(group_email) → [user_ids]
    │
    └── GoogleTokenAdapter
            ├── validateOAuthToken(id_token) → claims
            └── refreshToken(refresh_token) → access_token
```

### 10.2 Operações Automáticas no Google Workspace

| Evento no SGTI | Ação no Google Workspace | Tempo |
|----------------|--------------------------|:-----:|
| Usuário criado (PROVISIONING) | `users.insert()` | Imediato |
| Usuário ativado | `users.update({suspended: false})` | Imediato |
| Papel atribuído com grupo vinculado | `members.insert(group_email, user_id)` | Imediato |
| Papel revogado | `members.delete(group_email, user_id)` | Imediato |
| Usuário suspenso | `users.update({suspended: true})` | Imediato |
| Departamento alterado | `users.update({orgUnitPath})` | Imediato |
| Cargo alterado | `users.update({organizations[0].title})` | Imediato |
| E-mail alias adicionado | `aliases.insert()` | Imediato |
| Desprovisionamento | `users.update({suspended: true})` | Dentro de 2h |

### 10.3 Mapeamento SGTI ↔ Google Workspace

| Campo SGTI | Campo Google (Admin SDK) | Direção | Prioridade |
|:----------:|:------------------------:|:-------:|:----------:|
| `display_name` | `name.fullName` | ← (Google → SGTI) | Google |
| `email` | `primaryEmail` | ← e → | Imutável após criação |
| `google_user_id` | `id` | ← | Google |
| `job_title` | `organizations[0].title` | ← e → | Google |
| `department` | `organizations[0].department` | ← e → | SGTI |
| `google_org_unit` | `orgUnitPath` | ← | Google |
| `mfa_enabled` | `isEnrolledIn2Sv` | ← | Google |
| `avatar_url` | `thumbnailPhotoUrl` | ← | Google |
| `status` | `suspended` | → | SGTI |

### 10.4 Autenticação via Google OAuth 2.0 + PKCE

Todo acesso ao SGTI é feito via Google OAuth 2.0 com fluxo PKCE:

```
FLUXO DE AUTENTICAÇÃO

1. Usuário clica "Entrar com Google"
2. SGTI gera code_verifier e code_challenge (SHA-256)
3. Redireciona para Google OAuth:
   → Scopes: openid, email, profile
   → Parâmetro hd: domínio corporativo (filtra contas pessoais)
4. Google retorna authorization_code
5. SGTI troca code por id_token + access_token
6. Validação do id_token:
   → Assinatura RSA válida
   → hd = domínio corporativo configurado
   → email_verified = true
   → exp > now()
7. Identificação do usuário pelo sub (google_user_id)
8. Se usuário ACTIVE: emite JWT RS256 do SGTI
9. Se usuário INVITED: direciona para onboarding
10. Se usuário SUSPENDED: retorna 403 com mensagem
11. Se usuário INACTIVE: retorna 403
```

### 10.5 Tratamento de Conta Google Inexistente

Se o usuário tenta logar com conta Google válida mas não existe no SGTI:

```
Conta Google válida + domínio correto + NÃO encontrada no SGTI:
  → Tentativa de auto-provisionamento:
    1. Consulta Google Directory API para dados do usuário
    2. Cria auth.User com status = PENDING_PROVISIONING
    3. Notifica IT_MANAGER: "Acesso solicitado por {email} — não cadastrado"
    4. IT_MANAGER decide: provisionar (com papéis) ou bloquear
  → Usuário recebe: "Seu acesso está sendo configurado. Aguarde o e-mail de confirmação."
```

---

## 11. Sincronização Google ↔ SGTI

### 11.1 Jobs de Sincronização

| Job | Frequência | Direção | Escopo |
|:---:|:----------:|:-------:|--------|
| **GoogleUserSyncJob** | Diária (02h00) | Google → SGTI | Todos os usuários do domínio |
| **GoogleGroupSyncJob** | Semanal (dom 03h00) | Google → SGTI | Grupos com tag `sgti:managed=true` |
| **GoogleStatusSyncJob** | A cada 30 min | Google → SGTI | Contas suspensas/reativadas recentemente |
| **TokenValidationJob** | A cada 5 min | SGTI → Google | Valida sessões ativas vs. status Google |

### 11.2 Campos Sincronizados vs. Campos SGTI-Exclusivos

**Campos que o Google pode atualizar no SGTI** (Google → SGTI):
- `display_name`, `avatar_url`, `job_title`, `google_org_unit`, `mfa_enabled`

**Campos que o SGTI gerencia exclusivamente** (nunca sobrescritos pelo Google):
- `locale`, `timezone`, `notification_*`, `theme`
- `papéis (auth.UserRole)`, `grupos de suporte (IdentityGroup)`
- `department_id`, `manager_id`, `cost_center` (gerenciados pelo SGTI)

### 11.3 Detecção e Tratamento de Divergências

| Cenário | Ação Automática | Notificação |
|---------|:--------------:|:-----------:|
| Conta Google suspensa + SGTI ACTIVE | Suspenso no SGTI (BR-GWS-002) | IT_MANAGER |
| Conta Google excluída + SGTI ACTIVE | Status = INACTIVE no SGTI | IT_MANAGER |
| Usuário no SGTI sem conta Google | Flag `PENDING_PROVISIONING` | IT_MANAGER |
| Nome/cargo divergente | SGTI atualizado com dados Google | Sem notificação |
| E-mail alterado no Google | Alerta para IT_MANAGER (e-mail é imutável no SGTI) | IT_MANAGER urgente |

### 11.4 Gestão do Ciclo de Revisão de Acesso

**Revisões trimestrais obrigatórias (ITIL + ISO 27001):**

```
CICLO DE REVISÃO DE ACESSO

1. IT_MANAGER inicia ciclo: seleciona usuários (individual, dept, todos)
2. Sistema gera formulário de revisão por gestor direto:
   Para cada usuário do gestor: lista de papéis atribuídos
   Opções por papel: MANTER / REVOGAR / ESCALAR (para review manual)

3. E-mail enviado ao gestor com prazo de 15 dias úteis:
   "[SGTI] Revisão de Acesso — Prazo: {data_limite}"

4. Gestor responde na interface do SGTI (não por e-mail):
   Decisão registrada com timestamp e IP

5. Papéis marcados para revogação:
   → Revogados automaticamente ao submeter o formulário

6. Sem resposta no prazo:
   → Alerta ao IT_MANAGER
   → Extensão de 5 dias úteis
   → Sem resposta após extensão: papéis não-essenciais revogados automaticamente

7. Relatório de revisão gerado:
   → Evidência arquivada no módulo Compliance
   → next_access_review_due = hoje + 90 dias (trimestral)
```

---

## 12. API Corporativa de Identidades

### 12.1 Propósito

A API Corporativa de Identidades do SGTI expõe endpoints seguros para que sistemas internos da organização possam:

- Verificar se um usuário existe e está ativo.
- Consultar os papéis de um usuário.
- Disparar provisionamento ou desprovisionamento programático.
- Receber eventos de identidade via webhook.

### 12.2 Casos de Uso Suportados

| Caso de Uso | Descrição | Sistemas Que Usam |
|:------------:|-----------|:-----------------:|
| Verificação de Identidade | Confirmar que e-mail é colaborador ativo | Qualquer sistema corporativo |
| Consulta de Papéis | Obter papéis SGTI de um usuário para controle externo | ERP, CRM, ferramentas corporativas |
| Provisionamento Externo | Disparar onboarding via sistema de RH | Sistema de RH corporativo |
| Desprovisionamento Externo | Disparar offboarding via sistema de RH | Sistema de RH corporativo |
| Webhook de Identidade | Receber eventos: criado, suspenso, inativo | Qualquer sistema integrado |

### 12.3 Autenticação da API

```
AUTENTICAÇÃO DA API CORPORATIVA

Tipo: API Key com escopo granular
Formato do header: Authorization: ApiKey {key}

Escopos disponíveis:
  identity:read     → consultar identidades e papéis
  identity:write    → provisionar e modificar usuários
  identity:deprovisioning → desprovisionar usuários
  identity:webhooks → registrar e gerenciar webhooks

Emissão:
  → Apenas SUPER_ADMIN pode emitir API Keys
  → Cada key tem nome, escopo, validade e IP allowlist
  → Rotação automática anual; renovação manual disponível
  → Uso registrado em audit_log por key
```

### 12.4 Principais Operações da API

| Operação | Descrição | Escopo Mínimo |
|:--------:|-----------|:-------------:|
| `GET /v1/identities/{email}` | Retorna status e papéis do usuário | `identity:read` |
| `GET /v1/identities/{email}/roles` | Lista papéis atribuídos | `identity:read` |
| `POST /v1/identities/provision` | Dispara provisionamento | `identity:write` |
| `POST /v1/identities/{email}/suspend` | Suspende conta | `identity:write` |
| `POST /v1/identities/{email}/deprovision` | Desprovisionamento completo | `identity:deprovisioning` |
| `POST /v1/webhooks` | Registra endpoint webhook | `identity:webhooks` |

### 12.5 Webhooks de Identidade

Sistemas externos podem receber notificações automáticas de eventos de identidade:

| Evento | Payload Enviado |
|:------:|----------------|
| `user.provisioned` | `{user_id, email, display_name, roles, provisioned_at}` |
| `user.role_assigned` | `{user_id, email, role, assigned_by, assigned_at}` |
| `user.role_revoked` | `{user_id, email, role, revoked_by, revoked_at, reason}` |
| `user.suspended` | `{user_id, email, suspended_by, suspended_at}` |
| `user.deprovisioned` | `{user_id, email, deprovisioned_by, deprovisioned_at}` |

Webhooks são entregues com retry exponencial (30s, 5min, 30min, 4h, 24h). Falha após 5 tentativas: notificação ao SUPER_ADMIN e desativação do webhook.

---

## 13. Auditoria e Rastreabilidade

### 13.1 Eventos Auditados Obrigatoriamente

| Evento | `action` | Dados Capturados |
|--------|:--------:|:----------------:|
| Usuário criado | `USER_CREATED` | e-mail, papéis iniciais, criado_por |
| Usuário ativado | `USER_ACTIVATED` | ativado_por, método (convite/auto) |
| Papel atribuído | `ROLE_ASSIGNED` | papel, usuário, atribuído_por, justificativa |
| Papel revogado | `ROLE_REVOKED` | papel, usuário, revogado_por, motivo |
| Usuário suspenso | `USER_SUSPENDED` | suspenso_por, motivo, tipo (auto/manual) |
| Usuário reativado | `USER_REACTIVATED` | reativado_por, motivo |
| Desprovisionamento iniciado | `DEPROVISIONING_STARTED` | iniciado_por, motivo |
| Conta Google suspensa | `GOOGLE_ACCOUNT_SUSPENDED` | sync ou manual, timestamp |
| Conta Google criada | `GOOGLE_ACCOUNT_CREATED` | google_user_id, org_unit |
| Sessão criada | `SESSION_CREATED` | IP, user_agent, timestamp |
| Sessão revogada | `SESSION_REVOKED` | motivo, revogado_por (ou auto) |
| Login falho | `LOGIN_FAILED` | e-mail, IP, razão |
| Falha repetida (bloqueio) | `ACCOUNT_LOCKED` | e-mail, IP, contagem |
| Revisão de acesso iniciada | `ACCESS_REVIEW_STARTED` | iniciado_por, usuários em revisão |
| Revisão de acesso concluída | `ACCESS_REVIEW_COMPLETED` | papéis mantidos, revogados, revisor |
| API Key emitida | `API_KEY_ISSUED` | escopo, válida_até, emitida_por |
| API Key revogada | `API_KEY_REVOKED` | revogada_por, motivo |
| Delegação criada | `DELEGATION_CREATED` | delegante, delegado, período, papéis |
| Delegação encerrada | `DELEGATION_ENDED` | automático ou manual |
| Usuário deletado (soft) | `USER_SOFT_DELETED` | deletado_por, justificativa |

### 13.2 Trilha de Acesso Completa por Usuário

Para qualquer usuário, o IT_MANAGER pode consultar:

```
TRILHA DE ACESSO — exemplo de visualização

USUÁRIO: João Silva (joao.silva@empresa.com.br)

Abr 10, 2025  📋 CRIADO via REQ-2025-000012
              Aprovado por: Maria Santos (IT_MANAGER)
              Papéis concedidos: END_USER
              Conta Google: criada (ID: 123456789)

Mai 15, 2025  ➕ PAPEL CONCEDIDO: IT_TECHNICIAN
              Por: Maria Santos | Justificativa: Promoção interna
              Requisição: REQ-2025-000089

Nov 20, 2025  🔍 REVISÃO DE ACESSO
              Revisor: Carlos Lima (gestor direto)
              Decisão: MANTER todos os papéis

Jan 08, 2026  🔐 13 sessões ativas neste mês
              Último acesso: 08/01/2026 09:15 (IP: 10.0.1.45)

Fev 28, 2026  ⚠️  SUSPENSÃO TEMPORÁRIA (auto — 5 falhas de login)
              Duração: 2 horas
              Reativado por: Sistema (após timeout)

Mar 10, 2026  🚪 DESLIGAMENTO INICIADO — REQ-2026-000456
              Iniciado por: RH (via API)
              Sessões revogadas: 14h32
              Google suspenso: 14h45
              Papéis revogados: 14h46
              Status: INACTIVE (16h00)
```

---

## 14. Compliance e Conformidade

### 14.1 Requisitos Regulatórios Atendidos

| Framework | Controle | Implementação no Módulo |
|-----------|----------|------------------------|
| **ISO/IEC 27001** | A.9.1 — Política de controle de acesso | Política RBAC documentada e auditada |
| **ISO/IEC 27001** | A.9.2 — Gestão de acesso de usuário | Provisionamento/desprovisionamento formal |
| **ISO/IEC 27001** | A.9.3 — Responsabilidade do usuário | Aceite de políticas no onboarding |
| **ISO/IEC 27001** | A.9.4 — Controle de acesso a sistemas | RBAC com revisão trimestral |
| **LGPD** | Art. 46 — Segurança e medidas técnicas | Acesso por autenticação forte (OAuth + MFA) |
| **LGPD** | Art. 47 — Responsabilidade dos agentes | Auditoria completa de quem acessou o quê |
| **NIST SP 800-53** | AC-2 — Gestão de contas | Ciclo completo de criação/revisão/encerramento |
| **ITIL v4** | Prática: Gestão de Segurança da Informação | IAM como prática integrada ao ITSM |

### 14.2 Evidências Geradas para Auditorias

| Evidência | Quando Gerada | Destinatário |
|-----------|:------------:|:------------:|
| Relatório de Onboarding | Ao concluir provisionamento | Compliance + IT_MANAGER |
| Relatório de Offboarding | Ao concluir desprovisionamento | Compliance + IT_MANAGER |
| Relatório de Revisão de Acesso | Ao concluir cada ciclo | Compliance + IT_MANAGER |
| Relatório de Papéis Atribuídos | Mensal | Compliance |
| Relatório de Contas Sem Revisão | Mensal | IT_MANAGER |
| Relatório de Violações SoD Detectadas | Imediato ao detectar | Compliance + IT_MANAGER |
| Exportação de Audit Log | Sob demanda | Compliance, Auditor externo |

### 14.3 Tratamento de Requisições LGPD — Direitos do Titular

O módulo IAM suporta requisições de titulares de dados pessoais:

| Direito LGPD | Implementação |
|:------------:|:-------------:|
| Acesso (Art. 18, I) | Exportação dos dados pessoais do usuário via portal |
| Correção (Art. 18, III) | Requisição de alteração via REQ-TYPE-002 |
| Eliminação (Art. 18, VI) | Soft-delete após período de retenção; dados de auditoria preservados |
| Portabilidade (Art. 18, V) | Exportação em JSON/CSV pelo IT_MANAGER |
| Informação (Art. 18, VII) | Página de "Meus Dados" exibe base legal de cada processamento |

---

## 15. Dashboards e Indicadores

### 15.1 Dashboard Operacional de Identidades

**Destino:** IT_SPECIALIST, IT_MANAGER. Atualizado em tempo real.

| Componente | Dados Exibidos |
|------------|---------------|
| **Usuários por Status** | ACTIVE / INVITED / PENDING_PROVISIONING / SUSPENDED / INACTIVE |
| **Provisionamentos Pendentes** | Usuários em `PENDING_PROVISIONING` aguardando retry ou ação |
| **Revisões de Acesso Vencidas** | Usuários com `next_access_review_due` no passado |
| **Revisões Próximas (30 dias)** | Usuários com revisão vencendo em 30 dias |
| **Contas Sem Papel** | Usuários ACTIVE sem nenhum papel atribuído além de END_USER |
| **Conflitos SoD Ativos** | Atribuições que violam regras SoD detectadas (devem ser zero) |
| **Sincronização Google** | Status do último job, divergências detectadas |
| **Delegações Ativas** | Delegações temporárias em vigor com data de expiração |

### 15.2 Indicadores KPI de Identidades

| KPI | Fórmula | Meta |
|-----|---------|:----:|
| **Total Usuários Ativos** | COUNT(status = ACTIVE) | — |
| **Taxa de Provisionamento Automático** | COUNT(provisionados via fluxo auto) / COUNT(total provisionados) × 100 | ≥ 95% |
| **Tempo Médio de Desprovisionamento** | AVG(deprovisioned_at - request_at) em minutos | ≤ 120 min |
| **Revisões em Atraso** | COUNT(next_access_review_due < TODAY) | 0 |
| **Conflitos SoD Abertos** | COUNT(violações SoD não resolvidas) | 0 |
| **Contas Sem Revisão Trimestral** | COUNT(next_access_review_due < 90 dias atrás) | 0 |
| **MFA Habilitado** | COUNT(mfa_enabled = true) / COUNT(ACTIVE) × 100 | 100% |

---

## 16. Relatórios

### 16.1 Relatórios Operacionais Automáticos

| Relatório | Geração | Destinatário | Conteúdo |
|-----------|:-------:|:------------:|---------|
| **Usuários Sem Revisão de Acesso** | Semanal (seg) | IT_MANAGER | Lista com dias de atraso |
| **Novas Concessões de Acesso** | Semanal | IT_MANAGER + Compliance | Papéis atribuídos na semana |
| **Revogações de Acesso** | Semanal | IT_MANAGER + Compliance | Papéis revogados na semana |
| **Falhas de Provisionamento** | Diária | IT_MANAGER | Contas em PENDING_PROVISIONING com erro |
| **Contas Suspensas** | Semanal | IT_MANAGER | Lista de contas suspensas com motivo |

### 16.2 Relatórios de Compliance

| Relatório | Frequência | Destinatário | Conteúdo |
|-----------|:----------:|:------------:|---------|
| **Inventário de Acessos** | Mensal | Compliance + IT_MANAGER | Todos os papéis ativos por usuário |
| **Histórico de Concessões e Revogações** | Trimestral | Compliance | Trilha completa de alterações de acesso |
| **Resultados de Revisão de Acesso** | Por ciclo | Compliance + IT_MANAGER | Papéis mantidos e revogados com decisores |
| **Análise de SoD** | Trimestral | Compliance + IT_MANAGER | Violações detectadas e tratadas |
| **Onboardings e Offboardings** | Mensal | Compliance | Lista com datas e responsáveis |

### 16.3 Relatórios Executivos

| Relatório | Frequência | Destinatário | Conteúdo |
|-----------|:----------:|:------------:|---------|
| **Panorama de Identidades** | Trimestral | Diretoria + IT_MANAGER | KPIs IAM, tendências, riscos |
| **Conformidade IAM** | Semestral | Diretoria + Compliance | % controles atendidos, evidências principais |

---

## 17. Regras de Negócio

---

**IAM-001** — Domínio corporativo obrigatório
Todo usuário do SGTI deve ter e-mail do domínio corporativo configurado para o tenant. Contas Gmail pessoais ou de outros domínios são rejeitadas na autenticação.
**Referência:** BR-GWS-001

---

**IAM-002** — Google como único provedor de autenticação primário
O SGTI não aceita autenticação por usuário + senha locais. Todo acesso requer autenticação via Google OAuth 2.0. O Supabase Auth serve apenas como camada de sessão, não de provedor de identidade primário.
**Referência:** BR-GWS-001

---

**IAM-003** — Usuário inativo no Google = acesso revogado no SGTI
Conta suspensa no Google Workspace tem acesso ao SGTI revogado em até 24 horas via `GoogleStatusSyncJob`. Para casos de segurança urgentes, a revogação é imediata.
**Referência:** BR-GWS-002

---

**IAM-004** — Provisionamento automático ao criar usuário
A aprovação de REQ-TYPE-001 dispara automaticamente o provisionamento da conta Google e a atribuição dos papéis iniciais, sem necessidade de ação manual adicional do técnico.
**Referência:** BR-GWS-003

---

**IAM-005** — Ordem obrigatória de desprovisionamento
O desprovisionamento deve seguir a ordem: (1) revogar sessões SGTI, (2) suspender Google, (3) transferir responsabilidades, (4) revogar papéis, (5) inativar conta. Alterar esta ordem é violação de segurança.
**Referência:** BR-GWS-004

---

**IAM-006** — Suspensão Google em até 2 horas após solicitação de offboarding
Após aprovação de REQ-TYPE-003 (revogação de acesso/desligamento), a conta Google deve ser suspensa em no máximo 2 horas. Descumprimento gera NC no módulo Compliance com severidade MAIOR.

---

**IAM-007** — Campos SGTI nunca sobrescritos pela sincronização Google
Campos gerenciados pelo SGTI (locale, timezone, notificações, papéis, grupos de suporte, centro de custo) nunca são sobrescritos pela sincronização com Google.
**Referência:** BR-GWS-006

---

**IAM-008** — Papel END_USER atribuído por padrão a todo usuário novo
Todo usuário criado recebe automaticamente o papel `END_USER` como papel base. Este papel não pode ser revogado enquanto o usuário estiver ACTIVE.

---

**IAM-009** — Concessão de papel IT_MANAGER+ exige aprovação dupla
Papéis `IT_MANAGER` ou superiores requerem aprovação de dois `IT_MANAGER` existentes ou do `SUPER_ADMIN`. Aprovação única é insuficiente.

---

**IAM-010** — Concessão de SUPER_ADMIN exige step-up auth
A atribuição do papel `SUPER_ADMIN` requer re-autenticação com MFA (step-up authentication) pelo aprovador no momento da concessão. Operação registrada com extra_metadata = `{mfa_verified: true}`.

---

**IAM-011** — Usuário não pode aprovar concessão de papel para si mesmo
O mesmo usuário que solicitou um papel não pode ser o aprovador da própria concessão. SoD aplicado automaticamente.

---

**IAM-012** — Detecção automática de conflitos SoD ao atribuir papel
Antes de atribuir qualquer papel, o sistema verifica automaticamente conflitos de SoD com os papéis já atribuídos. Conflito bloqueante impede a atribuição com erro descritivo.

---

**IAM-013** — Revogação de papel entra em vigor imediatamente
Ao revogar um papel, todas as sessões ativas do usuário são invalidadas imediatamente. O próximo request retorna 403.

---

**IAM-014** — Usuário ACTIVE sem nenhum papel funcional gera alerta
Usuário ACTIVE com apenas o papel END_USER há mais de 30 dias gera alerta ao IT_MANAGER para verificar se precisa de papel adicional ou deve ser desativado.

---

**IAM-015** — Revisão de acesso trimestral obrigatória
Todo usuário deve ter revisão de acesso realizada a cada 90 dias (trimestral). `next_access_review_due` vencido gera alerta semanal ao IT_MANAGER e notificação ao gestor direto.

---

**IAM-016** — Revisão de acesso não concluída no prazo: papéis não essenciais revogados
Após 15 dias úteis sem resposta do revisor, o sistema envia extensão de 5 dias. Sem resposta após extensão: papéis acima de END_USER marcados para revisão pelo IT_MANAGER.

---

**IAM-017** — Usuário desligado sem revisão prévia: revogação imediata
No caso de desligamento emergencial, o sistema executa o desprovisionamento sem aguardar a revisão de acesso formal. A revisão é substituída pelo relatório de offboarding.

---

**IAM-018** — MFA obrigatório para papéis IT_MANAGER+
Usuários com papel `IT_MANAGER`, `SUPER_ADMIN` ou `AUDITOR` devem ter MFA habilitado no Google Workspace. Se `mfa_enabled = false` for detectado na sincronização, alerta imediato ao IT_MANAGER.

---

**IAM-019** — Sessão JWT RS256 com expiração de 1 hora
Tokens JWT emitidos pelo SGTI têm expiração de 1 hora (3600 segundos). Refresh token válido por 30 dias. Papéis verificados no refresh para garantir acessos ainda ativos.

---

**IAM-020** — Sessão invalidada automaticamente ao revogar papel crítico
Ao revogar papel IT_SPECIALIST ou superior, a sessão ativa é invalidada imediatamente, mesmo sem logout explícito.

---

**IAM-021** — Bloqueio de conta após 5 tentativas de login falhas
Após 5 tentativas de autenticação falhas consecutivas (com o mesmo e-mail), a conta é suspensa automaticamente por 30 minutos. IT_MANAGER notificado.

---

**IAM-022** — Tentativas de login de IP incomum geram alerta
Login de IP geograficamente distante do padrão histórico do usuário gera alerta ao IT_MANAGER e notificação ao usuário.

---

**IAM-023** — E-mail corporativo é imutável após criação do usuário
O campo `email` não pode ser alterado após a criação do usuário. Mudança de e-mail (ex.: casamento) exige: (1) desprovisionamento do usuário antigo, (2) criação do novo usuário com novo e-mail.

---

**IAM-024** — Dados de auditoria preservados após desligamento
Registros de audit_log de usuários desligados são preservados indefinidamente. Soft-delete do usuário não afeta os registros de auditoria.

---

**IAM-025** — Delegação temporária não pode exceder 90 dias
Delegações de papel têm duração máxima de 90 dias. Após o prazo, são encerradas automaticamente. Prorrogação exige nova aprovação do IT_MANAGER.

---

**IAM-026** — Delegado não pode receber papel superior ao seu papel atual
Ao delegar papel, o delegado não pode receber papel de hierarquia superior ao seu papel atual. Ex.: IT_TECHNICIAN não pode receber delegação de IT_MANAGER.

---

**IAM-027** — API Key com escopo mínimo necessário
API Keys devem ser emitidas com o menor escopo suficiente para a integração. Key com escopo `identity:write` não pode ser emitida quando `identity:read` é suficiente.

---

**IAM-028** — API Key rotacionada anualmente
API Keys têm validade máxima de 1 ano. SUPER_ADMIN notificado 30 dias antes da expiração para renovação. Keys expiradas são desativadas automaticamente.

---

**IAM-029** — Webhook com falha repetida desativado
Webhook que falha em 5 tentativas consecutivas de entrega é desativado automaticamente. SUPER_ADMIN notificado para investigação.

---

**IAM-030** — Grupos Google com sgti:managed=true sincronizados semanalmente
Grupos do Google Workspace marcados com a label `sgti:managed=true` são sincronizados semanalmente para o SGTI como grupos de suporte ou aprovação.
**Referência:** BR-GWS-005

---

**IAM-031** — Membro de grupo de suporte recebe chamados do grupo automaticamente
Ao ingressar em grupo de suporte, o usuário começa a receber notificações de chamados do grupo a partir do próximo chamado aberto. Retroatividade não se aplica.

---

**IAM-032** — Remoção de grupo de suporte: chamados ativos redistribuídos
Ao remover usuário de grupo de suporte, chamados atribuídos a ele (e não ao grupo genérico) permanecem com ele até resolução ou transferência manual.

---

**IAM-033** — Usuário pode pertencer a múltiplos grupos de suporte
Um usuário pode ser membro de quantos grupos de suporte forem necessários. Não há limite de grupos por usuário.

---

**IAM-034** — Grupo sem líder definido: IT_MANAGER assume como líder padrão
Grupo de suporte sem `leader_id` definido utiliza o IT_MANAGER como líder padrão para escalações automáticas.

---

**IAM-035** — Onboarding em lote: falha em um item não bloqueia os demais
Na importação em lote de usuários, erros em itens individuais são registrados no relatório de erros sem bloquear o processamento dos demais itens válidos.

---

**IAM-036** — Usuário inativado retém dados por 5 anos
Dados de usuários desligados são retidos por 5 anos conforme requisito legal. Após 5 anos: dados pessoais são anonimizados; registros de auditoria permanecem.

---

**IAM-037** — Notificação ao usuário em toda concessão de papel
O usuário recebe notificação in-app e e-mail ao receber qualquer novo papel, informando o papel concedido e quem o concedeu.

---

**IAM-038** — Notificação ao usuário em toda revogação de papel
O usuário recebe notificação in-app ao ter papel revogado. A notificação não detalha o motivo interno; informa apenas que o acesso foi ajustado.

---

**IAM-039** — Papel com valid_until expirado revogado automaticamente
Papéis com `valid_until` preenchido são verificados diariamente pelo `RoleExpirationJob`. Papéis expirados são revogados automaticamente com action = `ROLE_AUTO_EXPIRED`.

---

**IAM-040** — Histórico completo de papéis: imutável
Registros em `auth.UserRole` nunca são excluídos fisicamente. Mesmo papéis revogados permanecem com `is_active = false` para rastreabilidade histórica.

---

**IAM-041** — Usuário com status INVITED que não aceitou em 72h: reenvio automático
Convite não aceito em 72 horas dispara re-envio automático do e-mail de convite. Após 3 reenvios sem resposta: IT_MANAGER notificado para ação manual.

---

**IAM-042** — Tentativa de provisionar domínio diferente do configurado: bloqueado
Qualquer tentativa de criar usuário com e-mail fora do domínio corporativo configurado é bloqueada na validação com erro `INVALID_DOMAIN`.

---

**IAM-043** — Logs de acesso por sessão preservados por 2 anos
Registros de sessão (login, logoff, IP, user_agent) são preservados por 2 anos para investigação de incidentes de segurança.

---

**IAM-044** — Papéis transversais (FINANCIAL_ANALYST, PROJECT_MANAGER) não herdam hierarquia
Papéis transversais concedem acesso apenas ao módulo específico, sem herdar permissões da hierarquia principal (não são superiores a END_USER na hierarquia de suporte).

---

**IAM-045** — Conta Google deletada definitivamente apenas pelo SUPER_ADMIN
A exclusão definitiva da conta Google de um usuário (users.delete) é uma operação irreversível que requer execução pelo SUPER_ADMIN com justificativa formal e MFA.

---

**IAM-046** — Gestor de um usuário inativado: redistribuição automática de dependentes
Ao inativar um usuário que é gestor direto de outros usuários, o sistema alerta o IT_MANAGER para reatribuir os dependentes a um novo gestor antes de concluir o offboarding.

---

**IAM-047** — Usuário ativo sem login por 90 dias: alerta de conta ociosa
Conta ACTIVE sem nenhum login nos últimos 90 dias gera alerta ao IT_MANAGER para verificar se o acesso ainda é necessário.

---

**IAM-048** — SUPER_ADMIN com múltiplos titulares
O sistema requer que haja sempre pelo menos 2 usuários com papel `SUPER_ADMIN` ativos. Se restar apenas 1, alerta é gerado para que o segundo seja designado.

---

**IAM-049** — Exportação de dados de identidade requer aprovação IT_MANAGER+
A exportação em massa de dados de identidades (inventário de usuários e papéis) requer aprovação do IT_MANAGER e é registrada em auditoria com o escopo exportado.

---

**IAM-050** — Evidências de IAM exportáveis para auditorias externas
O módulo IAM permite ao COMPLIANCE_OFFICER exportar pacote de evidências (relatório de revisão de acesso, onboarding/offboarding, inventário de papéis) em PDF com hash SHA-256 para apresentação a auditores externos.

---

## 18. Critérios de Aceitação

### 18.1 Provisionamento

- [ ] **CA-01:** Aprovação de REQ-TYPE-001 dispara provisionamento automático no Google Workspace em até 5 minutos.
- [ ] **CA-02:** Conta Google criada com orgUnitPath correto baseado no departamento informado.
- [ ] **CA-03:** Papéis atribuídos conforme solicitado na requisição, com justificativa registrada.
- [ ] **CA-04:** E-mail de boas-vindas com magic link enviado ao novo usuário após provisionamento.
- [ ] **CA-05:** Usuário em `PENDING_PROVISIONING` após falha Google — retry automático em 30 min.
- [ ] **CA-06:** IT_MANAGER notificado após 3 tentativas falhas de provisionamento.

### 18.2 Autenticação e Sessão

- [ ] **CA-07:** Login com conta pessoal `@gmail.com` rejeitado com mensagem clara.
- [ ] **CA-08:** Login com conta do domínio correto funciona e emite JWT RS256 válido.
- [ ] **CA-09:** JWT expira em 1 hora; refresh token funciona corretamente dentro de 30 dias.
- [ ] **CA-10:** Conta suspensa no Google rejeita login no SGTI com status 403.
- [ ] **CA-11:** Bloqueio após 5 tentativas falhas consecutivas; IT_MANAGER notificado.

### 18.3 RBAC e Permissões

- [ ] **CA-12:** Concessão de papel IT_MANAGER requer aprovação de dois IT_MANAGERs.
- [ ] **CA-13:** Concessão de SUPER_ADMIN requer step-up auth MFA do aprovador.
- [ ] **CA-14:** Conflito SoD detectado e bloqueado com mensagem descritiva do conflito.
- [ ] **CA-15:** Papel END_USER atribuído automaticamente a todo usuário novo.
- [ ] **CA-16:** Papel com `valid_until` expirado revogado automaticamente pelo `RoleExpirationJob`.

### 18.4 Desprovisionamento

- [ ] **CA-17:** Aprovação de REQ-TYPE-003 revoga sessões SGTI imediatamente (< 1 min).
- [ ] **CA-18:** Conta Google suspensa em até 2 horas após aprovação de desprovisionamento.
- [ ] **CA-19:** Ativos desalocados e chamados transferidos automaticamente no offboarding.
- [ ] **CA-20:** Relatório de offboarding gerado ao concluir o processo.
- [ ] **CA-21:** Dados de auditoria preservados após inativação do usuário.

### 18.5 Sincronização Google

- [ ] **CA-22:** `GoogleUserSyncJob` executa diariamente e atualiza campos corretos.
- [ ] **CA-23:** Campos SGTI-exclusivos nunca sobrescritos pela sincronização.
- [ ] **CA-24:** Conta suspensa no Google detectada e sincronizada no SGTI em até 30 min.
- [ ] **CA-25:** Divergência SGTI vs. Google registrada e IT_MANAGER notificado.

### 18.6 Revisão de Acesso

- [ ] **CA-26:** Ciclo de revisão trimestral iniciado pelo IT_MANAGER gera formulários corretamente.
- [ ] **CA-27:** Gestor direto recebe e-mail com formulário de revisão dentro de 5 min.
- [ ] **CA-28:** Papéis marcados para revogação na revisão revogados automaticamente ao submeter.
- [ ] **CA-29:** `next_access_review_due` atualizado para hoje + 90 dias após revisão concluída.
- [ ] **CA-30:** Alerta de revisão vencida exibido no dashboard operacional.

### 18.7 API Corporativa

- [ ] **CA-31:** API Key com escopo `identity:read` retorna dados corretos de usuário ativo.
- [ ] **CA-32:** API Key com escopo incorreto retorna 403 Forbidden.
- [ ] **CA-33:** Webhook entregue corretamente para evento `user.provisioned`.
- [ ] **CA-34:** Webhook com 5 falhas consecutivas desativado e SUPER_ADMIN notificado.
- [ ] **CA-35:** API Key expirada retorna 401 e registra tentativa em auditoria.

### 18.8 Auditoria

- [ ] **CA-36:** Todo evento IAM registrado em `audit_log` com campos obrigatórios.
- [ ] **CA-37:** RLS impede UPDATE e DELETE em `audit_log`.
- [ ] **CA-38:** Trilha de acesso do usuário exibe todos os eventos em ordem cronológica.
- [ ] **CA-39:** Exportação de audit log por período funciona e inclui todos os eventos IAM.

### 18.9 Compliance e Segurança

- [ ] **CA-40:** Evidência de onboarding gerada automaticamente no módulo Compliance.
- [ ] **CA-41:** Evidência de offboarding gerada automaticamente ao concluir desprovisionamento.
- [ ] **CA-42:** Relatório de revisão de acesso exportável em PDF com hash SHA-256.
- [ ] **CA-43:** Usuário sem MFA em papel IT_MANAGER+ gera alerta imediato.
- [ ] **CA-44:** Dados pessoais sensíveis não visíveis em logs de sistema (apenas user_id pseudônimo).

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação com 18 seções, 50 regras IAM e 44 critérios de aceitação |

---

> **Próximos documentos recomendados:**
> [`22_AUTHENTICATION.md`](./22_AUTHENTICATION.md) — Fluxos de autenticação detalhados (JWT, OAuth, magic link)
> [`23_USER_ROLES.md`](./23_USER_ROLES.md) — Matriz de permissões por papel
> [`41_REQUEST_MANAGEMENT.md`](./41_REQUEST_MANAGEMENT.md) — REQ-TYPE-001, 003, 004 (provisionamento via requisição)
