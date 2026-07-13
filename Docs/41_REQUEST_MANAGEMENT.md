# SGTI — Sistema de Gestão de Tecnologia da Informação
## Módulo de Gestão de Requisições de Serviço — Documentação Funcional

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [24_BUSINESS_RULES.md](./24_BUSINESS_RULES.md) · [31_SLA.md](./31_SLA.md) · [30_SERVICE_CATALOG.md](./30_SERVICE_CATALOG.md) · [40_INCIDENT_MANAGEMENT.md](./40_INCIDENT_MANAGEMENT.md) · [23_USER_ROLES.md](./23_USER_ROLES.md)

---

## Sobre este Documento

Este documento define a **especificação funcional completa do Módulo de Gestão de Requisições de Serviço do SGTI**. Cobre o conceito ITIL v4, estrutura, fluxos de aprovação, integrações, regras de negócio e critérios de aceitação do módulo.

**Escopo exclusivo:** documentação funcional e de processo. Nenhum código, SQL ou especificação de API é gerado neste documento.

---

## Sumário

1. [Conceito de Requisição de Serviço](#1-conceito-de-requisição-de-serviço)
2. [Objetivos do Módulo](#2-objetivos-do-módulo)
3. [Papéis e Responsabilidades](#3-papéis-e-responsabilidades)
4. [Estrutura da Requisição](#4-estrutura-da-requisição)
5. [Tipos de Requisição — Catálogo Inicial](#5-tipos-de-requisição--catálogo-inicial)
6. [Workflow de Atendimento](#6-workflow-de-atendimento)
7. [Fluxo de Aprovações](#7-fluxo-de-aprovações)
8. [Integração com Gestão de Ativos](#8-integração-com-gestão-de-ativos)
9. [Integração com GLPI](#9-integração-com-glpi)
10. [Integração com Google Workspace](#10-integração-com-google-workspace)
11. [Integração Financeira — OPEX e CAPEX](#11-integração-financeira--opex-e-capex)
12. [Integração com Compras](#12-integração-com-compras)
13. [Integração com Projetos](#13-integração-com-projetos)
14. [Entrega de Equipamentos](#14-entrega-de-equipamentos)
15. [Entrega de Periféricos](#15-entrega-de-periféricos)
16. [Compliance e Auditoria de Requisições](#16-compliance-e-auditoria-de-requisições)
17. [SLA por Tipo de Requisição](#17-sla-por-tipo-de-requisição)
18. [Notificações](#18-notificações)
19. [Dashboards e Indicadores](#19-dashboards-e-indicadores)
20. [Relatórios](#20-relatórios)
21. [Auditoria e Rastreabilidade](#21-auditoria-e-rastreabilidade)
22. [Regras de Negócio](#22-regras-de-negócio)
23. [Critérios de Aceitação](#23-critérios-de-aceitação)

---

## 1. Conceito de Requisição de Serviço

### 1.1 Definição ITIL v4

> Uma **Requisição de Serviço** é uma solicitação formal de um usuário ou usuário autorizado para iniciar uma ação de serviço que seja parte de um serviço acordado. As requisições de serviço são gerenciadas por um **fluxo predefinido e de baixo risco**, com aprovações quando necessário.
>
> — ITIL v4, AXELOS

No contexto do SGTI, uma requisição é qualquer solicitação em que o usuário:

- Precisa de algo **novo** que ainda não possui (novo acesso, equipamento, software).
- Precisa **alterar** algo existente (mudar perfil de acesso, transferir licença).
- Precisa **encerrar** algo (revogar acesso, devolver equipamento).
- Solicita **informações ou orientações** padronizadas.
- Solicita **recursos para um projeto** ou iniciativa.

### 1.2 Requisição vs. Incidente vs. Problema

| Conceito | Gatilho | Natureza | Urgência Típica |
|----------|---------|----------|:---------------:|
| **Requisição** | "Eu quero / preciso / solicito..." | Novo serviço ou mudança planejada | Baixa a média |
| **Incidente** | "Parou de funcionar / não consigo acessar..." | Interrupção inesperada | Alta a crítica |
| **Problema** | "Por que isso continua acontecendo?" | Causa raiz de incidentes recorrentes | Variável |

> **Regra prática:** Se o serviço estava funcionando e o usuário quer algo diferente do que tem hoje, é uma **Requisição**. Se algo parou de funcionar, é um **Incidente**.

### 1.3 Características Essenciais de uma Requisição

| Característica | Descrição |
|----------------|-----------|
| **Fluxo predefinido** | Cada tipo de requisição tem um workflow configurado com etapas claras |
| **Aprovação quando necessária** | Requisições com custo, risco ou impacto em segurança passam por aprovação formal |
| **SLA definido** | Prazo de atendimento acordado e monitorado automaticamente |
| **Rastreabilidade total** | Toda ação — abertura, aprovação, entrega — registrada com trilha imutável |
| **Baixo risco intrínseco** | Riscos são gerenciados pelos critérios de aprovação, não pelo processo em si |

---

## 2. Objetivos do Módulo

### 2.1 Objetivo Primário

Fornecer um canal único, formal e rastreável para que colaboradores solicitem serviços de TI, com fluxos de aprovação adequados ao tipo e ao impacto de cada solicitação, garantindo controle, visibilidade e conformidade.

### 2.2 Objetivos Específicos

| # | Objetivo | Indicador | Meta |
|---|----------|-----------|:----:|
| 1 | Canal único de solicitação de serviços de TI | % de solicitações via SGTI vs. outros canais informais | ≥ 95% |
| 2 | Fluxos de aprovação formalizados por tipo | % de tipos com workflow configurado | 100% |
| 3 | Atendimento dentro do SLA | % de requisições concluídas no prazo | ≥ 90% |
| 4 | Rastreabilidade de todos os ativos entregues | % de entregas de equipamento com ativo vinculado | 100% |
| 5 | Controle financeiro de solicitações com custo | % de requisições com custo classificadas OPEX/CAPEX | 100% |
| 6 | Segregação de funções em aprovações | Nenhuma requisição aprovada pelo próprio solicitante | 100% |
| 7 | Tempo médio de atendimento monitorado | MTTR de requisições por tipo | Redução trimestral |
| 8 | Integração com Google Workspace | % de criações/revogações de conta via SGTI | ≥ 90% |

### 2.3 Limites do Módulo

**O que o módulo FAZ:**
- Registra, aprova, executa e encerra solicitações de serviço de TI.
- Integra com Catálogo, SLA, Ativos, GLPI, Google Workspace, Financeiro, Compras e Projetos.
- Gera métricas, dashboards e relatórios operacionais e executivos.
- Rastreia entrega de equipamentos e periféricos com aceite formal.

**O que o módulo NÃO FAZ:**
- Não gerencia incidentes (módulo Gestão de Incidentes).
- Não gerencia a execução de compras (módulo Compras recebe a demanda gerada).
- Não gerencia diretamente contratos financeiros (módulo Financeiro gerencia).

---

## 3. Papéis e Responsabilidades

### 3.1 Solicitante (END_USER / qualquer perfil autenticado)

**Quem é:** Qualquer colaborador que abre uma requisição — pode ser Usuário, Analista, Coordenador ou Gestor. O perfil "Solicitante" refere-se ao papel funcional na requisição, não ao papel no sistema.

**Responsabilidades:**
- Abrir a requisição com todas as informações necessárias e justificativa clara.
- Selecionar o serviço correto no catálogo — a categoria da requisição define o workflow.
- Preencher o formulário dinâmico do tipo de serviço selecionado.
- Acompanhar o status e responder quando a equipe técnica solicitar informações.
- Confirmar o recebimento do item ou conclusão do serviço ao aceitar a entrega.
- Assinar o Termo de Responsabilidade na entrega de equipamentos (quando aplicável).
- Avaliar o atendimento ao encerrar a requisição (CSAT).

**Limitações:**
- Não pode aprovar a própria requisição em nenhuma circunstância.
- Não pode visualizar requisições de outros usuários.
- Pode cancelar apenas requisições próprias com status `DRAFT` ou `SUBMITTED`.

---

### 3.2 Gestor Direto (IT_MANAGER / responsável pela área)

**Quem é:** O gestor hierárquico do solicitante ou o IT_MANAGER designado como aprovador no workflow do tipo de serviço.

**Responsabilidades:**
- Analisar e aprovar ou rejeitar requisições dentro da sua alçada.
- Verificar se a solicitação tem justificativa de negócio válida.
- Confirmar que o solicitante tem autorização para o recurso solicitado.
- Delegar aprovação quando em férias ou ausência, com registro formal.
- Acompanhar requisições da sua equipe no dashboard gerencial.

**Limitações:**
- Não pode aprovar requisições que ele mesmo criou (SoD obrigatório).
- Alçada de aprovação limitada por valor conforme tabela de thresholds.

---

### 3.3 Analista de TI (IT_TECHNICIAN)

**Quem é:** Técnico de suporte responsável pela execução do atendimento após aprovação.

**Responsabilidades:**
- Receber requisições aprovadas e executar as ações necessárias.
- Registrar o progresso durante o atendimento com comentários técnicos.
- Registrar ativos entregues no módulo de Inventário.
- Registrar recebimento de periféricos com vínculo obrigatório à requisição.
- Solicitar informações adicionais ao solicitante quando necessário.
- Comunicar a conclusão ao solicitante com notas de cumprimento.
- Criar ordens de compra no módulo de Compras para requisições que exigem aquisição.

---

### 3.4 Coordenador de TI (IT_SPECIALIST)

**Quem é:** Técnico sênior com responsabilidade sobre requisições de maior complexidade técnica.

**Responsabilidades:**
- Aprovar requisições de até R$1.000,00 dentro da sua alçada (conforme configuração).
- Executar requisições técnicas complexas: VLAN, certificados, configurações avançadas.
- Provisionar acessos a sistemas e ao Google Workspace.
- Supervisionar Analistas na execução de requisições em lote (ex.: onboarding múltiplos).
- Revisar e validar formulários de requisição antes da entrega ao Financeiro.

---

### 3.5 Aprovador Financeiro (FINANCIAL_ANALYST / IT_MANAGER com papel financeiro)

**Quem é:** Responsável pela análise financeira de requisições com impacto orçamentário.

**Responsabilidades:**
- Validar a classificação OPEX/CAPEX de requisições com custo.
- Verificar disponibilidade orçamentária antes de aprovar.
- Aprovar requisições dentro do limite orçamentário aprovado.
- Registrar a reserva orçamentária ao aprovar requisições com custo.
- Rejeitar requisições sem orçamento disponível com justificativa documentada.

**Limitações:**
- Não pode aprovar lançamentos financeiros que ele mesmo registrou (SoD).

---

### 3.6 Aprovador Compliance (COMPLIANCE_OFFICER)

**Quem é:** Responsável pela análise de conformidade em requisições com implicação regulatória.

**Responsabilidades:**
- Validar requisições de acesso a sistemas com dados sensíveis (LGPD).
- Revisar requisições de criação/revogação de usuário para conformidade com política de IAM.
- Aprovar ou rejeitar requisições que envolvam dados pessoais ou sistemas regulados.
- Documentar a base legal para concessão de acessos a dados pessoais.
- Gerar evidências de aprovação para fins de auditoria externa.

---

### 3.7 Administrador (SUPER_ADMIN)

**Quem é:** Administrador da plataforma SGTI.

**Responsabilidades:**
- Configurar tipos de requisição, formulários dinâmicos e workflows.
- Definir e ajustar thresholds de aprovação por valor e por tipo.
- Configurar integrações com Google Workspace e GLPI.
- Auditar todas as requisições com acesso ao audit_log completo.
- Executar operações de correção de dados em requisições com inconsistências.

---

## 4. Estrutura da Requisição

### 4.1 Seção: Identificação

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **Número** | String (sequencial) | Sim — automático | **Nunca** | Identificador legível único: `REQ-YYYY-NNNNNN`. Gerado pelo banco via BIGSERIAL. Imutável após criação. |
| **Tipo** | FK — RequestType | Sim | Não (após envio) | Tipo de requisição selecionado. Define o formulário dinâmico e o workflow de aprovação. |
| **Origem** | Enum | Sim — automático | Não | `PORTAL` (usuário), `EMAIL`, `API`. Imutável após criação. |

### 4.2 Seção: Contexto e Classificação

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **Serviço** | FK — ServiceCatalog | Sim | Não (após envio) | Item do catálogo com status `PUBLISHED`. Obrigatório. Define SLA e grupo responsável. |
| **Categoria** | Enum | Sim | Analista | Categoria técnica da requisição (Acesso, Hardware, Software, Serviço, Financeiro, Projeto). |
| **Subcategoria** | Enum | Não | Analista | Refinamento dentro da categoria. |

### 4.3 Seção: Solicitante e Organização

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **Solicitante** | FK — User | Sim — automático | Não | Usuário que abriu a requisição. Preenchido com o usuário logado. Imutável. |
| **Beneficiário** | FK — User | Não | Solicitante (DRAFT) | Usuário que receberá o serviço — quando diferente do solicitante (ex.: gestor abrindo para liderado). |
| **Departamento** | FK — Department | Sim — automático | Analista | Departamento do solicitante (pré-preenchido; ajustável pelo Analista). |
| **Centro de Custo** | FK — CostCenter | Sim | Solicitante, Analista | Centro de custo que arcará com o custo da requisição. Obrigatório para tipos com impacto financeiro. |

### 4.4 Seção: Justificativa e Prioridade

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **Justificativa** | Texto longo | Sim | Solicitante (DRAFT/SUBMITTED) | Justificativa de negócio clara para a solicitação. Mínimo 30 caracteres. |
| **Prioridade** | Enum | Sim | Analista, Gestor | `LOW`, `MEDIUM`, `HIGH`, `URGENT`. Definida pelo solicitante e ajustável pelo Analista na triagem. |
| **Data Necessária** | Date | Não | Solicitante | Data em que o solicitante precisa do serviço. Usada para alertas de SLA. |
| **Projeto Vinculado** | FK — Project | Não | Solicitante, Analista | Projeto ao qual a requisição está vinculada (ver seção 13). |

### 4.5 Seção: Financeiro

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **Tem Custo** | Boolean | Sim | Solicitante | `true` se a requisição envolve gasto financeiro. Ativa campos financeiros adicionais. |
| **Valor Estimado** | Decimal | Sim (se tem custo) | Solicitante, Analista | Valor estimado da requisição em R$. |
| **Classificação Financeira** | Enum | Sim (se tem custo) | Analista, Financeiro | `OPEX` ou `CAPEX`. Obrigatório para aprovação financeira. |
| **Orçamento Vinculado** | FK — Budget | Não | Analista, Financeiro | Orçamento anual de TI que suportará o custo. |

### 4.6 Seção: Status e Datas

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **Status** | Enum | Sim | Conforme transições | Status atual no fluxo de atendimento (ver seção 6). |
| **Etapa de Aprovação Atual** | Inteiro | Sim — automático | Não | Número da etapa corrente no fluxo de aprovação. |
| **Total de Etapas** | Inteiro | Sim — automático | Não | Total de etapas de aprovação configuradas para este tipo. |
| **Data de Abertura** | DateTime | Sim — automático | Não | Timestamp de criação, preenchido pelo banco. Imutável. |
| **Prazo de SLA** | DateTime | Sim — automático | Não | Calculado na submissão com base no SLA do tipo de serviço. |
| **Data de Conclusão** | DateTime | Não — automático | Não | Preenchido ao marcar como `FULFILLED`. |
| **Data de Encerramento** | DateTime | Não — automático | Não | Preenchido ao marcar como `CLOSED`. |

### 4.7 Seção: Execução

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **Responsável pelo Atendimento** | FK — User | Não | Analista, Coordenador | Técnico executando a requisição. |
| **Grupo Responsável** | FK — IdentityGroup | Não | Analista | Grupo responsável pelo atendimento. |
| **Notas de Cumprimento** | Texto longo | Sim (ao concluir) | Analista | Descrição do que foi executado. Mínimo 20 caracteres. |
| **Ativo Entregue** | FK — Asset | Condicional | Analista | Obrigatório para tipos de hardware. Vincula ativo criado ou existente. |
| **Termo de Responsabilidade** | Boolean | Condicional | Sistema | `true` quando usuário assina o aceite digital na entrega de ativo. |

### 4.8 Seção: Dados do Formulário Dinâmico

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| **Dados do Formulário** | JSONB | Sim | Campos específicos do tipo de requisição, validados conforme `form_schema` do RequestType. Conteúdo varia por tipo. |

### 4.9 Seção: Avaliação

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **Nota CSAT** | Inteiro 1–5 | Não | Solicitante apenas | Avaliação do atendimento ao encerrar. 1 = Péssimo, 5 = Excelente. |
| **Comentário CSAT** | Texto | Não | Solicitante apenas | Texto livre da avaliação. |

---

## 5. Tipos de Requisição — Catálogo Inicial

Cada tipo de requisição define: formulário dinâmico, workflow de aprovação, SLA e grupo responsável. Tipos marcados com ⚠️ requerem aprovação de Compliance por implicação regulatória.

### 5.1 Categoria: Gestão de Identidades e Acessos

| Código | Nome | Formulário Principal | Workflow | SLA |
|--------|------|---------------------|---------|:---:|
| **REQ-TYPE-001** | Criação de Usuário ⚠️ | Nome, e-mail, cargo, departamento, gestor, perfis de acesso iniciais, data de admissão | Gestor → TI → Google Workspace | 4 horas |
| **REQ-TYPE-002** | Alteração de Usuário ⚠️ | Tipo de alteração (nome/dept/gestor/cargo), valor anterior, valor novo, motivo | Gestor → TI | 4 horas |
| **REQ-TYPE-003** | Revogação de Acesso ⚠️ | Usuário, sistemas/grupos a revogar, data de revogação, motivo | Gestor → TI → Compliance | 2 horas |
| **REQ-TYPE-004** | Solicitação de Acesso a Sistema ⚠️ | Sistema solicitado, perfil/permissão desejada, justificativa, data de necessidade | Gestor → Responsável pelo Sistema → Compliance | 4 horas |
| **REQ-TYPE-005** | Solicitação de Acesso Google Workspace ⚠️ | Recurso (Drive/Grupo/Calendar), nível de acesso, justificativa, proprietário do recurso | Proprietário do Recurso → TI | 4 horas |

**Notas de Gestão de Identidades:**
- Toda criação, alteração e revogação de usuário gera trilha de auditoria obrigatória no módulo de Compliance.
- Revogação de acesso deve ser processada em até 2 horas da aprovação (BR-GWS-004).
- Criação de usuário dispara automaticamente o provisionamento no Google Workspace.

---

### 5.2 Categoria: Hardware — Computadores e Notebooks

| Código | Nome | Formulário Principal | Workflow | SLA |
|--------|------|---------------------|---------|:---:|
| **REQ-TYPE-006** | Solicitação de Notebook | Finalidade, perfil do usuário, specs mínimas, data necessária | Gestor → Financeiro → TI | 5 dias úteis |
| **REQ-TYPE-007** | Solicitação de Computador (Desktop) | Finalidade, perfil do usuário, specs mínimas, local de instalação | Gestor → Financeiro → TI | 5 dias úteis |
| **REQ-TYPE-008** | Solicitação de Monitor | Tamanho, resolução mínima, finalidade, usuário beneficiário | Gestor → TI | 3 dias úteis |

**Notas de Hardware:**
- Requisições de hardware sempre geram CAPEX ao ser aprovadas com custo.
- Entrega exige criação de ativo no inventário e assinatura do Termo de Responsabilidade.

---

### 5.3 Categoria: Periféricos

| Código | Nome | Formulário Principal | Workflow | SLA |
|--------|------|---------------------|---------|:---:|
| **REQ-TYPE-009** | Solicitação de Impressora | Tipo (laser/jato), uso (individual/compartilhado), local | Gestor → TI | 3 dias úteis |
| **REQ-TYPE-010** | Solicitação de Teclado | Tipo (padrão/ergonômico/mecânico), usuário beneficiário | Gestor → TI | 2 dias úteis |
| **REQ-TYPE-011** | Solicitação de Mouse | Tipo (padrão/ergonômico/vertical), usuário beneficiário | Gestor → TI | 2 dias úteis |
| **REQ-TYPE-012** | Solicitação de Headset | Tipo (com fio/Bluetooth/cancelamento de ruído), finalidade | Gestor → TI | 2 dias úteis |
| **REQ-TYPE-013** | Solicitação de Celular Corporativo | Perfil do usuário, justificativa, plano desejado, data necessária | Gestor → Financeiro → TI | 5 dias úteis |

**Regra obrigatória:** Todo periférico entregue deve possuir uma requisição vinculada registrada no SGTI. Entregas sem requisição são proibidas e geram registro de não-conformidade.

---

### 5.4 Categoria: Software e Licenças

| Código | Nome | Formulário Principal | Workflow | SLA |
|--------|------|---------------------|---------|:---:|
| **REQ-TYPE-014** | Solicitação de Software | Nome do software, versão, finalidade, quantidade de licenças, OS | Gestor → TI → Financeiro (se novo) | 3 dias úteis |
| **REQ-TYPE-015** | Solicitação de Licença Adicional | Software existente, quantidade adicional, usuários beneficiários, justificativa | Gestor → Financeiro → TI | 2 dias úteis |

**Notas de Software:**
- Software homologado no portfólio: apenas aprovação do Gestor.
- Software novo (fora do portfólio): aprovação do Gestor + Financeiro + análise de segurança pela TI.
- Licenças adicionais sempre geram lançamento OPEX.

---

### 5.5 Categoria: Recursos para Projetos

| Código | Nome | Formulário Principal | Workflow | SLA |
|--------|------|---------------------|---------|:---:|
| **REQ-TYPE-016** | Equipamento para Projeto | Projeto vinculado, equipamento, quantidade, período de uso, justificativa | Gerente de Projeto → Gestor → TI | 3 dias úteis |
| **REQ-TYPE-017** | Software/Licença para Projeto | Projeto vinculado, software, período de licença, finalidade | Gerente de Projeto → Gestor → Financeiro → TI | 3 dias úteis |

---

### 5.6 Categoria: Aquisições e Serviços

| Código | Nome | Formulário Principal | Workflow | SLA |
|--------|------|---------------------|---------|:---:|
| **REQ-TYPE-018** | Solicitação de Compra | Descrição do item, quantidade, valor estimado, fornecedor sugerido, justificativa, OPEX/CAPEX | Gestor → Financeiro → TI | 5 dias úteis |
| **REQ-TYPE-019** | Contratação de Serviço | Descrição do serviço, fornecedor, valor estimado, prazo, escopo, justificativa | Gestor → Financeiro → Jurídico (se > R$50k) | 10 dias úteis |

---

### 5.7 Resumo de Workflows por Tipo

| Tipo de Requisição | Etapa 1 | Etapa 2 | Etapa 3 | Etapa 4 |
|-------------------|:-------:|:-------:|:-------:|:-------:|
| Criação de Usuário | Gestor | TI (provisionar) | — | — |
| Alteração de Usuário | Gestor | TI (executar) | — | — |
| Revogação de Acesso | Gestor | TI | Compliance | — |
| Acesso a Sistema | Gestor | Resp. Sistema | Compliance | TI |
| Notebook / Desktop | Gestor | Financeiro | TI (entregar) | — |
| Periférico (teclado, mouse, headset) | Gestor | TI (entregar) | — | — |
| Impressora / Celular | Gestor | Financeiro | TI (entregar) | — |
| Software (portfólio) | Gestor | TI (instalar) | — | — |
| Software (novo) | Gestor | TI (analisar) | Financeiro | TI (instalar) |
| Licença adicional | Gestor | Financeiro | TI | — |
| Compra | Gestor | Financeiro | Compras (pedido) | — |
| Contratação serviço | Gestor | Financeiro | Jurídico (>R$50k) | — |

---

## 6. Workflow de Atendimento

### 6.1 Diagrama Completo de Status

```
 CANAIS DE ENTRADA
 ─────────────────
 Portal Web · E-mail · API
            │
            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                       RASCUNHO                               │
 │                    (Status: DRAFT)                           │
 │  Solicitante preencheu parcialmente. Não submetida.          │
 │  Salva automaticamente. Sem SLA iniciado.                    │
 └──────────────────────────┬───────────────────────────────────┘
                            │ Solicitante clica "Enviar"
                            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                       SUBMETIDA                              │
 │                   (Status: SUBMITTED)                        │
 │  SLA iniciado. Validação dos campos obrigatórios realizada.  │
 │  Aguarda triagem do Analista de TI.                          │
 └──────────────────────────┬───────────────────────────────────┘
                            │ Analista valida e encaminha
                            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                      EM APROVAÇÃO                            │
 │               (Status: PENDING_APPROVAL)                     │
 │  Fluxo de aprovação ativo conforme etapas configuradas.      │
 │  Cada aprovador tem prazo definido para decidir.             │
 └──────┬──────────────────────────────────────┬───────────────┘
        │ TODOS aprovaram                       │ QUALQUER etapa rejeitou
        ▼                                       ▼
 ┌───────────────────────────┐       ┌──────────────────────────┐
 │       APROVADA            │       │       REJEITADA          │
 │  (Status: APPROVED)       │       │  (Status: REJECTED)      │
 │  Todas as etapas OK.      │       │  Motivo obrigatório.     │
 │  Fila de execução da TI.  │       │  Notificação ao          │
 └───────────────┬───────────┘       │  solicitante.            │
                 │                   │  Terminal — não          │
                 │                   │  reativável.             │
                 ▼                   └──────────────────────────┘
 ┌──────────────────────────────────────────────────────────────┐
 │                    EM ATENDIMENTO                            │
 │                 (Status: IN_PROGRESS)                        │
 │  Técnico executa a requisição conforme aprovado.             │
 │  Comentários de progresso registrados.                       │
 └──────┬───────────────────────────────────────┬──────────────┘
        │                                       │
        │ Aguardando usuário / terceiro         │
        ▼                                       │
 ┌─────────────────────────┐                   │
 │   AGUARDANDO            │                   │
 │   (PENDING_USER /       │                   │
 │    PENDING_3RD_PARTY)   │                   │
 │   SLA pausado ⏸         │                   │
 └─────────────┬───────────┘                   │
               │ Retorna                        │
               └──────────────────────┐        │
                                      ▼        ▼
                            ┌──────────────────────────────────┐
                            │           CONCLUÍDA              │
                            │       (Status: FULFILLED)        │
                            │  Serviço entregue / executado.   │
                            │  Aguardando aceite do solicitante │
                            │  (máx. 48 horas).                │
                            └──────────────┬───────────────────┘
                                           │
                         ┌─────────────────┴──────────────────┐
                         │                                    │
                         ▼                                    ▼
                  Solicitante confirma              48h sem resposta
                  o aceite + CSAT                  (encerramento auto)
                         │                                    │
                         └──────────────┬─────────────────────┘
                                        ▼
                            ┌──────────────────────────────────┐
                            │           ENCERRADA              │
                            │        (Status: CLOSED)          │
                            │  Estado final. Somente leitura.  │
                            └──────────────────────────────────┘

 ┌──────────────────────────────────────────────────────────────┐
 │                     CANCELADA (CANCELLED)                    │
 │  Acessível de DRAFT, SUBMITTED ou APPROVED (pelo Gestor).    │
 │  Exige justificativa. Terminal. Não reativável.              │
 └──────────────────────────────────────────────────────────────┘
```

### 6.2 Descrição Funcional de Cada Status

**DRAFT — Rascunho**
Solicitante iniciou o preenchimento mas ainda não submeteu. Sem SLA. Sem notificações. Visível apenas para o solicitante. Pode ser editado ou descartado livremente. Salvo automaticamente.

**SUBMITTED — Submetida**
Solicitante clicou em "Enviar". SLA iniciado. Validação dos campos obrigatórios do formulário dinâmico executada. Notificações de abertura disparadas. Aguarda triagem do Analista de TI.

**PENDING_APPROVAL — Em Aprovação**
Analista verificou a requisição e iniciou o fluxo de aprovação. Aguardando decisão de uma ou mais etapas configuradas para este tipo de requisição.

**APPROVED — Aprovada**
Todas as etapas de aprovação foram concluídas com decisão "Aprovado". Requisição enviada para a fila de execução da equipe técnica. Notificação ao técnico responsável.

**REJECTED — Rejeitada**
Pelo menos uma etapa do fluxo de aprovação foi rejeitada. Motivo de rejeição obrigatório. Notificação imediata ao solicitante com o motivo. Estado terminal — uma nova requisição deve ser criada.

**IN_PROGRESS — Em Atendimento**
Técnico responsável está executando a requisição. Ações em andamento: instalação, configuração, provisionamento, aquisição, entrega.

**PENDING_USER / PENDING_THIRD_PARTY — Aguardando**
Execução pausada aguardando retorno do solicitante ou de terceiro. SLA pausado.

**FULFILLED — Concluída**
Técnico concluiu a execução com notas de cumprimento registradas. Aguarda confirmação do solicitante (aceite). Prazo de 48 horas para o solicitante confirmar ou sinalizar problema.

**CLOSED — Encerrada**
Solicitante confirmou o aceite OU se passaram 48 horas sem ação. Estado final — somente leitura.

**CANCELLED — Cancelada**
Requisição cancelada antes da execução. Exige justificativa. Estado terminal.

### 6.3 Transições de Status Permitidas

| De → Para | Quem executa | Pré-condição |
|-----------|:------------:|:------------|
| DRAFT → SUBMITTED | Solicitante | Formulário válido; campos obrigatórios preenchidos |
| SUBMITTED → PENDING_APPROVAL | Analista (triagem) | Requisição válida; workflow iniciado |
| SUBMITTED → CANCELLED | Solicitante ou IT_MANAGER+ | Justificativa obrigatória |
| PENDING_APPROVAL → APPROVED | Sistema (última etapa aprovada) | Todas as etapas aprovadas |
| PENDING_APPROVAL → REJECTED | Sistema (qualquer etapa rejeitada) | Motivo de rejeição obrigatório |
| PENDING_APPROVAL → CANCELLED | IT_MANAGER+ | Justificativa obrigatória |
| APPROVED → IN_PROGRESS | Analista/Coordenador | Atribuição de técnico |
| APPROVED → CANCELLED | IT_MANAGER+ | Justificativa obrigatória |
| IN_PROGRESS → PENDING_USER | Analista+ | Motivo obrigatório |
| IN_PROGRESS → PENDING_THIRD_PARTY | Analista+ | Motivo + quem está sendo aguardado |
| IN_PROGRESS → FULFILLED | Analista+ | Notas de cumprimento (mín. 20 chars) |
| PENDING_USER → IN_PROGRESS | Analista+ ou automático (usuário comentou) | — |
| FULFILLED → CLOSED | Solicitante (aceite) ou automático (48h) | CSAT opcional |
| FULFILLED → IN_PROGRESS | Solicitante ou IT_MANAGER+ | Problema identificado na entrega; justificativa |

---

## 7. Fluxo de Aprovações

### 7.1 Estrutura do Fluxo de Aprovação

Cada tipo de requisição tem um fluxo de aprovação configurado com uma ou mais etapas sequenciais. Cada etapa define:

- **Aprovador:** usuário fixo ou qualquer usuário com papel mínimo especificado.
- **Prazo:** dias úteis para decidir (padrão: 2 dias úteis por etapa).
- **Critério de escalonamento:** quando o prazo vence sem decisão.

### 7.2 Aprovação do Gestor Direto

**Presente em:** todos os tipos de requisição como primeira etapa.

**Critérios para aprovação:**
- A solicitação possui justificativa de negócio válida?
- O solicitante tem necessidade real do recurso para executar suas funções?
- A data necessária é compatível com o prazo de atendimento?
- A solicitação está dentro do orçamento da área?

**Prazo:** 2 dias úteis. Após este prazo sem decisão: alerta ao Gestor + escalonamento ao IT_MANAGER.

**Segregação obrigatória (SoD):** Gestor não pode aprovar requisição que ele mesmo criou.

---

### 7.3 Aprovação Financeira

**Presente em:** tipos com impacto orçamentário (hardware, software novo, compras, contratações).

**Critérios de acionamento:**

| Condição | Ação |
|----------|------|
| Valor estimado > R$0 | Aprovação financeira obrigatória |
| CAPEX (investimento em ativo) | Aprovação financeira + verificação de orçamento CAPEX |
| OPEX (despesa operacional) | Aprovação financeira + verificação de orçamento OPEX |
| Estouro de orçamento > 20% | Bloqueio — IT_MANAGER deve aprovar adicionalmente |

**O que o Aprovador Financeiro valida:**
1. Classificação OPEX/CAPEX está correta para o tipo de gasto.
2. Existe saldo disponível no orçamento do centro de custo.
3. O valor estimado é razoável para o item/serviço solicitado.
4. A aquisição é necessária no período (sem despesa desnecessária).

**Prazo:** 2 dias úteis.

---

### 7.4 Aprovação Compliance

**Presente em:** tipos com implicação de segurança, privacidade ou conformidade regulatória.

**Critérios de acionamento:**

| Tipo de Requisição | Motivo do Acionamento |
|-------------------|----------------------|
| Criação de Usuário | Concessão de acesso a sistemas corporativos (princípio do menor privilégio, LGPD) |
| Revogação de Acesso | Verificação de completude do processo de offboarding |
| Acesso a Sistema com Dados Pessoais | LGPD Art. 7 — base legal para tratamento de dados |
| Acesso a Sistema Financeiro Crítico | SOX / controles internos |
| Contratação de serviço com acesso a dados | DPA (Data Processing Agreement) necessário |

**O que o Aprovador Compliance valida:**
1. Há base legal para a concessão de acesso solicitada?
2. O princípio do menor privilégio está sendo respeitado?
3. A requisição está em conformidade com a política de IAM vigente?
4. Há necessidade de DPA com o fornecedor (para contratações)?

**Prazo:** 2 dias úteis.

---

### 7.5 Aprovação TI

**Presente em:** tipos técnicos que requerem validação da equipe de TI antes de executar.

**Quando a TI aparece como aprovador (não executor):**
- Software fora do portfólio: análise de compatibilidade, segurança e licenciamento.
- Hardware não padrão: análise de compatibilidade e suporte.
- Serviço de terceiro com acesso à rede ou sistemas.

**Prazo:** 1 dia útil.

---

### 7.6 Thresholds de Aprovação por Valor

| Valor Estimado | Etapas de Aprovação |
|---------------|:-------------------:|
| Sem custo | Gestor direto apenas |
| Até R$500,00 | Gestor direto |
| R$500,01 a R$1.000,00 | Gestor direto + Coordenador TI |
| R$1.000,01 a R$10.000,00 | Gestor direto + IT_MANAGER |
| Acima de R$10.000,00 | Gestor direto + IT_MANAGER (step-up auth) + Financeiro |
| Acima de R$50.000,00 | Gestor + IT_MANAGER + Financeiro + Diretoria |

### 7.7 Delegação de Aprovação

O aprovador pode delegar sua aprovação pendente para um substituto durante ausências:

1. Clicar em "Delegar" na requisição em sua fila.
2. Selecionar substituto com papel compatível (mínimo igual ao do delegante).
3. Informar o motivo da delegação (campo obrigatório).
4. O substituto recebe notificação com todos os detalhes da requisição.
5. A delegação é registrada em `request.ApprovalHistory` com data e motivo.
6. A delegação pode ser desfeita enquanto o substituto ainda não decidiu.

**Segregação obrigatória:** O substituto não pode ser o próprio solicitante da requisição.

---

## 8. Integração com Gestão de Ativos

### 8.1 Vínculo Obrigatório na Entrega de Ativo

Para todos os tipos de requisição que envolvem entrega de equipamento físico:

```
FLUXO DE VINCULAÇÃO DE ATIVO NA ENTREGA

Técnico marca requisição como FULFILLED:
  │
  ├── Se tipo = hardware novo (notebook, desktop, impressora, celular):
  │     Formulário obrigatório: "Registrar Ativo no Inventário"
  │     Campos: asset_tag, serial_number, modelo, fabricante, valor_compra
  │     → Cria novo registro em asset.Asset com status ALLOCATED
  │     → Vincula asset_id à requisição (campo ativo_entregue)
  │
  ├── Se tipo = periférico (teclado, mouse, headset):
  │     Formulário obrigatório: "Associar Periférico"
  │     Campos: asset_tag (se existente) ou dados básicos do item
  │     → Cria ou atualiza registro em asset.Asset
  │     → Vincula asset_id à requisição
  │
  └── Se asset_id NÃO for fornecido:
        → Sistema bloqueia o FULFILLED com erro:
          "Registre o ativo no inventário antes de concluir o atendimento."
```

### 8.2 Aceite Formal do Usuário

Após marcar como FULFILLED, o fluxo de aceite é:

```
Técnico: FULFILLED + notas de cumprimento
    │
    ▼
Sistema envia ao solicitante:
  "Sua solicitação REQ-YYYY-NNNNNN foi concluída.
   Item entregue: {nome_do_ativo} ({asset_tag})
   [Confirmar Recebimento] [Reportar Problema]"
    │
    ├── Solicitante clica "Confirmar Recebimento":
    │     → Campo `termo_responsabilidade = true`
    │     → Requisição muda para CLOSED
    │     → Histórico de atribuição do ativo registrado
    │
    ├── Solicitante clica "Reportar Problema":
    │     → Requisição retorna para IN_PROGRESS
    │     → Técnico notificado com o problema relatado
    │
    └── Sem resposta em 48 horas:
          → Sistema fecha automaticamente
          → `termo_responsabilidade = true` (implícito)
          → Registro de auditoria: "Aceite implícito — prazo de 48h"
```

### 8.3 Devolução de Ativo via Requisição

Ao receber uma requisição de devolução (ex.: desligamento de colaborador):

1. Analista executa a devolução no módulo de Ativos.
2. Campo `condition_on_return` preenchido (Bom/Regular/Danificado).
3. O status do ativo é atualizado para `IN_STOCK`.
4. A requisição referencia o registro de devolução do ativo (`AssetAssignment.returned_at`).
5. Dano identificado: IT_MANAGER notificado e registro encaminhado ao RH.

---

## 9. Integração com GLPI

### 9.1 Sincronização de Requisições com GLPI

O GLPI é o sistema de registro patrimonial legado. A integração com requisições segue o mesmo padrão do módulo de incidentes:

- Requisições abertas no SGTI geram tickets espelho no GLPI (quando configurado para o tipo de requisição).
- Sincronização GLPI → SGTI a cada 5 minutos para atualizações de status.
- Falha no GLPI não bloqueia o processamento da requisição no SGTI.

### 9.2 Consulta de Ativos no GLPI

Durante a execução de uma requisição de entrega de equipamento, o técnico pode:

1. Clicar em "Buscar Ativo no GLPI" no formulário de entrega.
2. Pesquisar por nome, etiqueta patrimonial ou número de série.
3. Selecionar o ativo para importar os dados básicos.
4. Confirmar a associação: ativo vinculado à requisição no SGTI.

Se o ativo não existe no SGTI mas existe no GLPI, a importação cria o registro no inventário SGTI automaticamente com os dados do GLPI.

---

## 10. Integração com Google Workspace

### 10.1 Criação de Conta (REQ-TYPE-001)

Após aprovação da requisição de criação de usuário, o sistema dispara automaticamente o provisionamento via `GoogleDirectoryAdapter`:

```
FLUXO AUTOMÁTICO PÓS-APROVAÇÃO

1. Requisição REQ-TYPE-001 atinge status APPROVED
2. Sistema publica evento ProvisionUserRequested
3. IdentityModule consome o evento:
   a. Cria auth.User com status PENDING_PROVISIONING
   b. Chama GoogleDirectoryAdapter.createAccount():
      → Admin SDK: users.insert(email, nome, unidadeOrg, senha temporária)
   c. Se sucesso:
      → auth.User.status = ACTIVE
      → identity.GoogleUserReference preenchida
      → Requisição muda para IN_PROGRESS (aguardando técnico configurar acessos)
      → E-mail de boas-vindas com magic link enviado ao novo usuário
   d. Se falha:
      → auth.User.status = PENDING_PROVISIONING
      → Técnico notificado para provisionar manualmente
      → Retry automático após 30 minutos
```

### 10.2 Alteração de Conta (REQ-TYPE-002)

Tipos de alteração e ações automáticas correspondentes:

| Tipo de Alteração | Ação no Google Workspace |
|-------------------|--------------------------|
| Nome | `users.update({ name })` |
| Departamento | `users.update({ orgUnitPath })` |
| Gestor | Atualização via Admin SDK |
| Cargo | `users.update({ organizations[0].title })` |
| E-mail (alias) | `users.aliases.insert()` |

### 10.3 Revogação de Acesso (REQ-TYPE-003)

```
FLUXO DE REVOGAÇÃO PÓS-APROVAÇÃO (incluindo Compliance)

1. Requisição REQ-TYPE-003 atinge status APPROVED
2. IMEDIATO — Sistema publica DeprovisionUserRequested
3. AuthModule:
   → Revoga TODAS as sessões ativas do usuário
   → Adiciona user_id à blacklist de JWT por 1 hora
4. GoogleDirectoryAdapter (até 2 horas):
   → users.update({ suspended: true })
   → Remoção de grupos do Google Workspace
5. IdentityModule:
   → Revoga todos os papéis do usuário no SGTI
   → identity.IAMStatus = PENDING_DEPROVISIONING
6. Técnico confirma conclusão:
   → Requisição muda para FULFILLED
   → identity.IAMStatus = INACTIVE
   → Relatório de revogação gerado para o solicitante
```

---

## 11. Integração Financeira — OPEX e CAPEX

### 11.1 Classificação Obrigatória

**Toda requisição com impacto financeiro (valor estimado > R$0) deve ter classificação OPEX ou CAPEX antes de ser aprovada pelo Aprovador Financeiro.**

| Tipo de Gasto | Classificação Correta | Exemplos |
|--------------|:---------------------:|---------|
| Licenças de software (assinatura recorrente) | **OPEX** | Microsoft 365, Adobe CC (mensal/anual) |
| Serviços de suporte e manutenção | **OPEX** | Dell Support, AWS Support |
| Serviços de consultoria | **OPEX** | Horas de consultoria técnica |
| Aquisição de hardware com vida útil > 1 ano | **CAPEX** | Notebook, Desktop, Servidor, Impressora |
| Desenvolvimento de sistema interno | **CAPEX** | Projeto de software customizado |
| Aquisição de licença perpétua | **CAPEX** | Licença permanente de software |
| Celular corporativo (compra) | **CAPEX** | iPhone corporativo adquirido |
| Infraestrutura de rede (compra) | **CAPEX** | Switch, Access Point adquirido |

### 11.2 Regras de Classificação

| Regra | Detalhe |
|-------|---------|
| **CAPEX → Ativo obrigatório** | Requisições classificadas como CAPEX sempre resultam na criação de um ativo no inventário após a entrega. |
| **OPEX → Despesa registrada** | Requisições OPEX aprovadas geram lançamento em `finance.OpexExpense` ao ser concluídas. |
| **Quem aprova não registra** | O Aprovador Financeiro que valida a classificação não pode ser o mesmo que registra o lançamento posterior. |
| **Orçamento verificado automaticamente** | Ao submeter para aprovação financeira, o sistema verifica se o saldo orçamentário do centro de custo comporta o valor estimado. |

### 11.3 Lançamento Automático Pós-Conclusão

Ao concluir uma requisição com custo:

```
Requisição FULFILLED:
  │
  ├── Se OPEX:
  │     → Publicar evento OpexRegistrationRequired
  │     → FinancialModule cria OpexExpense com status PENDING
  │     → Aprovador Financeiro notificado para confirmar valores e NF
  │
  └── Se CAPEX:
        → Publicar evento CapexRegistrationRequired
        → FinancialModule cria CapexInvestment com status PLANNED
        → asset_id do ativo entregue vinculado ao investimento
        → Depreciação inicia conforme categoria do ativo
```

---

## 12. Integração com Compras

### 12.1 Geração de Demanda de Compra

Quando uma requisição requer aquisição de item não disponível em estoque, o técnico executa:

```
FLUXO DE GERAÇÃO DE DEMANDA DE COMPRA

1. Requisição de hardware/software APPROVED chega para execução
2. Técnico verifica estoque:
   a. Ativo disponível em estoque → ir para entrega (seção 14)
   b. Ativo não disponível → criar demanda de compra

3. Técnico clica em "Criar Requisição de Compra"
   → Sistema pré-preenche:
      título: "Compra para: REQ-YYYY-NNNNNN — {título da requisição}"
      categoria: conforme tipo do ativo
      valor estimado: do campo "valor_estimado" da requisição
      centro de custo: do campo "centro_de_custo" da requisição
      projeto: se a requisição tinha projeto vinculado

4. Requisição de Compra aberta no módulo Compras
   → Vinculada à requisição original via campo request_id
   → Fluxo de aprovação de compras iniciado

5. Após entrega do bem (recebimento no módulo Compras):
   → Evento ItemReceived publicado
   → Analista notificado para executar a entrega ao solicitante
   → Requisição original avança para IN_PROGRESS novamente
```

### 12.2 Rastreabilidade Bidirecional

| Entidade | Campo de Vínculo |
|----------|:----------------:|
| Requisição de Serviço | `purchase_request_id` (FK para PurchaseRequest) |
| Requisição de Compra | `service_request_id` (FK para Request) |

Esta rastreabilidade permite ao IT_MANAGER visualizar o ciclo completo: da necessidade do usuário → aprovação → compra → entrega → ativo.

---

## 13. Integração com Projetos

### 13.1 Vinculação de Requisição a Projeto

Quando uma requisição de equipamento, software ou serviço está relacionada a um projeto específico:

1. No formulário de abertura, campo "Projeto Vinculado" é selecionado.
2. A requisição aparece no módulo de Projetos como custo/recurso do projeto.
3. O custo da requisição é debitado automaticamente do orçamento do projeto ao ser concluída.
4. O Gerente de Projeto recebe notificação de cada requisição vinculada ao seu projeto.

### 13.2 Aprovação do Gerente de Projeto

Para tipos REQ-TYPE-016 e REQ-TYPE-017 (recursos para projeto), o Gerente de Projeto é inserido como primeira etapa de aprovação:

```
Workflow: Gerente de Projeto → Gestor TI → Financeiro → TI
```

### 13.3 Visibilidade no Portfólio de Projetos

O módulo de Projetos exibe, para cada projeto:
- Lista de requisições vinculadas com status.
- Total de custo de requisições aprovadas vs. concluídas.
- Requisições pendentes de aprovação que podem impactar prazos do projeto.

---

## 14. Entrega de Equipamentos

### 14.1 Fluxo Completo de Entrega de Equipamento

```
 ETAPA 1: SOLICITAÇÃO
 ─────────────────────
 Solicitante (ou Gestor em nome do liderado) abre requisição
 Tipo: Notebook / Desktop / Impressora / Celular
 Dados: beneficiário, specs, data necessária, justificativa, projeto (se aplicável)
            │
            ▼
 ETAPA 2: APROVAÇÃO
 ───────────────────
 Gestor → Financeiro (se tiver custo) → TI (se equipamento não padrão)
 Todas as etapas aprovadas → status: APPROVED
            │
            ▼
 ETAPA 3: RESERVA
 ─────────────────
 Técnico de TI verifica o estoque:
   a. Ativo disponível em estoque → RESERVAR para o solicitante
      → Status do ativo: ALLOCATED (aguardando entrega)
      → Requisição: IN_PROGRESS
   b. Sem estoque → Criar requisição de compra (seção 12)
      → Aguardar recebimento
      → Quando recebido: ativo cadastrado → RESERVAR
            │
            ▼
 ETAPA 4: PREPARAÇÃO E CONFIGURAÇÃO
 ────────────────────────────────────
 Técnico prepara o equipamento:
   - Instalação e configuração do SO padrão
   - Ingresso no domínio corporativo
   - Instalação dos softwares do portfólio
   - Configuração de conta corporativa (Google)
   - Teste de funcionamento
   - Afixação da etiqueta patrimonial (asset_tag)
   - Registro em AssetAssignment: condição = NEW/GOOD
            │
            ▼
 ETAPA 5: ENTREGA FÍSICA
 ────────────────────────
 Técnico entrega o equipamento ao solicitante/beneficiário
 Técnico registra no SGTI:
   - Ativo vinculado (asset_id obrigatório)
   - Condição na entrega (NEW/GOOD)
   - Notas de cumprimento (mín. 20 chars)
   - Status → FULFILLED
   - Notificação enviada ao solicitante para aceite
            │
            ▼
 ETAPA 6: ACEITE DO USUÁRIO
 ───────────────────────────
 Solicitante recebe notificação:
 "Equipamento entregue: {nome} ({asset_tag}). Confirme o recebimento."
   a. Confirma: CSAT + Requisição → CLOSED
      → Termo de Responsabilidade implicitamente aceito
      → AssetAssignment.assigned_by = técnico; condition = NEW/GOOD
   b. Reporta problema: Requisição → IN_PROGRESS; técnico notificado
   c. Sem resposta em 48h: fechamento automático (aceite implícito)
```

### 14.2 Termo de Responsabilidade

O Termo de Responsabilidade é aceito digitalmente pelo usuário ao confirmar o recebimento do equipamento. O sistema registra:

| Campo | Conteúdo |
|-------|---------|
| Ativo | Nome + asset_tag + número de série |
| Responsável | Nome completo + matrícula |
| Departamento | Departamento atual |
| Data de recebimento | Timestamp do aceite |
| Condição na entrega | NEW/GOOD/REGULAR |
| Requisição vinculada | Número REQ-YYYY-NNNNNN |
| Aceite digital | IP do usuário + timestamp + user_id |

O registro do aceite é imutável em `shared.audit_log` com `action = ASSET_ACCEPTANCE_SIGNED`.

Um PDF do Termo de Responsabilidade pode ser gerado a qualquer momento pelo IT_MANAGER.

---

## 15. Entrega de Periféricos

### 15.1 Regra Fundamental

**Todo periférico entregue pela equipe de TI DEVE possuir uma requisição vinculada registrada no SGTI.** Entregas de periféricos sem requisição são proibidas e caracterizam não-conformidade de processo.

**Periféricos contemplados:** teclado, mouse, headset, webcam, dock station, adaptadores, cabos corporativos, token USB, hub USB.

### 15.2 Fluxo Completo de Entrega de Periférico

```
 ETAPA 1: SOLICITAÇÃO
 Solicitante abre requisição do tipo correspondente:
 REQ-TYPE-010 (teclado), REQ-TYPE-011 (mouse), REQ-TYPE-012 (headset), etc.
            │
            ▼
 ETAPA 2: APROVAÇÃO
 Gestor direto aprova a necessidade.
 Para periféricos de baixo custo (teclado, mouse): apenas Gestor.
 Para periféricos de custo médio (headset premium, webcam): Gestor + Coordenador TI.
            │
            ▼
 ETAPA 3: VERIFICAÇÃO DE ESTOQUE
 Técnico verifica almoxarifado:
   a. Disponível → Separar e registrar saída do estoque
   b. Sem estoque → Criar demanda de compra no módulo Compras
            │
            ▼
 ETAPA 4: REGISTRO NO INVENTÁRIO
 Se o periférico não está cadastrado no inventário SGTI:
   → Técnico cadastra antes de entregar
   → Campos mínimos: nome, tipo, asset_tag (para periféricos de valor > R$100)
   → Periféricos de baixíssimo valor (cabo USB, adaptador < R$30): registro simplificado
            │
            ▼
 ETAPA 5: ENTREGA E REGISTRO
 Técnico entrega ao usuário e registra:
   - asset_id vinculado à requisição (obrigatório)
   - Usuário beneficiário atribuído no ativo
   - Notas de cumprimento
   - Status → FULFILLED
            │
            ▼
 ETAPA 6: ACEITE
 Mesmo fluxo da entrega de equipamentos (seção 14.1, Etapa 6).
 Prazo de aceite: 48 horas.
```

### 15.3 Registro de Não-Conformidade

Caso seja identificada entrega de periférico sem requisição:

1. Técnico ou Gestor abre requisição retroativa (tipo correspondente) com data real de entrega.
2. Justificativa: "Regularização de entrega realizada sem abertura prévia de requisição em [data]."
3. Aprovação: IT_MANAGER obrigatório.
4. Registro de não-conformidade criado automaticamente no módulo Compliance: `CPL-FINDING` com severidade OBSERVAÇÃO.

---

## 16. Compliance e Auditoria de Requisições

### 16.1 Requisições Sujeitas a Auditoria Ampliada

| Tipo de Requisição | Módulo de Compliance Acionado |
|-------------------|-----------------------------|
| Criação de Usuário | Auditoria de provisionamento de acesso |
| Alteração de Usuário | Auditoria de mudança de perfil de acesso |
| Revogação de Acesso | Auditoria de offboarding / deprovisionamento |
| Acesso a Sistema com Dados Pessoais | Evidência de base legal (LGPD) |
| Contratos com terceiros que acessam dados | DPA (Data Processing Agreement) |

### 16.2 Evidências Geradas Automaticamente

Para os tipos com auditoria ampliada, o sistema gera automaticamente evidências no módulo de Compliance:

| Evento | Evidência Gerada |
|--------|-----------------|
| Usuário criado | Formulário de aprovação com data, aprovadores e perfis concedidos |
| Acesso a sistema aprovado | Registro de aprovação com base legal documentada |
| Acesso revogado | Registro de revogação com data, usuário e sistemas afetados |
| Equipamento entregue | Termo de Responsabilidade com aceite digital |
| Periférico entregue | Registro de entrega com requisição vinculada |

### 16.3 Consulta de Requisições pelo Compliance

O `COMPLIANCE_OFFICER` pode acessar em modo leitura todas as requisições do tenant para fins de auditoria, com filtros por:
- Tipo de requisição
- Status
- Aprovadores envolvidos
- Período
- Solicitante / beneficiário

---

## 17. SLA por Tipo de Requisição

### 17.1 Tabela de SLA

Prazos calculados em **horas ou dias úteis** a partir do momento da submissão (`SUBMITTED`):

| Código | Tipo de Requisição | SLA Resposta | SLA Conclusão | Criticidade |
|--------|-------------------|:------------:|:-------------:|:-----------:|
| REQ-TYPE-001 | Criação de Usuário | 30 min | 4 horas | ALTO |
| REQ-TYPE-002 | Alteração de Usuário | 30 min | 4 horas | ALTO |
| REQ-TYPE-003 | Revogação de Acesso | **15 min** | **2 horas** | **CRÍTICO** |
| REQ-TYPE-004 | Acesso a Sistema | 2 horas | 4 horas | MÉDIO |
| REQ-TYPE-005 | Acesso Google Workspace | 2 horas | 4 horas | MÉDIO |
| REQ-TYPE-006 | Notebook | 1 dia útil | 5 dias úteis | PLANEJADO |
| REQ-TYPE-007 | Computador (Desktop) | 1 dia útil | 5 dias úteis | PLANEJADO |
| REQ-TYPE-008 | Monitor | 4 horas | 3 dias úteis | BAIXO |
| REQ-TYPE-009 | Impressora | 4 horas | 3 dias úteis | BAIXO |
| REQ-TYPE-010 | Teclado | 2 horas | 2 dias úteis | BAIXO |
| REQ-TYPE-011 | Mouse | 2 horas | 2 dias úteis | BAIXO |
| REQ-TYPE-012 | Headset | 2 horas | 2 dias úteis | BAIXO |
| REQ-TYPE-013 | Celular Corporativo | 1 dia útil | 5 dias úteis | PLANEJADO |
| REQ-TYPE-014 | Solicitação de Software | 2 horas | 3 dias úteis | MÉDIO |
| REQ-TYPE-015 | Licença Adicional | 2 horas | 2 dias úteis | MÉDIO |
| REQ-TYPE-016 | Equipamento para Projeto | 4 horas | 3 dias úteis | MÉDIO |
| REQ-TYPE-017 | Software/Licença para Projeto | 4 horas | 3 dias úteis | MÉDIO |
| REQ-TYPE-018 | Solicitação de Compra | 4 horas | 5 dias úteis | PLANEJADO |
| REQ-TYPE-019 | Contratação de Serviço | 1 dia útil | 10 dias úteis | PLANEJADO |

### 17.2 Impacto da Aprovação no SLA

O SLA de conclusão conta o tempo **total** desde a submissão até a conclusão, incluindo o tempo em aprovação. Portanto:

- SLA de aprovação eficiente é crítico para o cumprimento do SLA de conclusão.
- Aprovações atrasadas (prazo vencido sem decisão) impactam diretamente o SLA.
- Alertas de SLA em risco incluem o tempo consumido nas aprovações.

### 17.3 Pausa de SLA em Requisições

O SLA pode ser pausado nos mesmos status do módulo de Incidentes: `PENDING_USER` e `PENDING_THIRD_PARTY`. Pausas são registradas em `catalog.SLAHistory` com motivo obrigatório.

---

## 18. Notificações

### 18.1 Tabela Completa de Notificações

| Evento | Destinatário(s) | Canal | Momento |
|--------|:--------------:|:-----:|---------|
| Requisição submetida | Solicitante | E-mail + in-app | Imediato |
| Requisição em aprovação (etapa 1) | Aprovador da etapa 1 | E-mail + in-app | Imediato |
| Aprovação realizada — etapa concluída | Solicitante + próximo aprovador | In-app + e-mail (próximo aprovador) | Imediato |
| Requisição aprovada (todas as etapas) | Solicitante + Técnico responsável | E-mail + in-app | Imediato |
| Requisição rejeitada | Solicitante | E-mail + in-app | Imediato |
| Cancelamento | Solicitante | E-mail + in-app | Imediato |
| Técnico atribuído | Técnico | In-app | Imediato |
| Status → IN_PROGRESS | Solicitante | In-app | Imediato |
| Requisição concluída (FULFILLED) | Solicitante (aceite) | E-mail + in-app | Imediato |
| Lembrete de aceite (24h pós-FULFILLED) | Solicitante | E-mail | Automático |
| Encerramento automático (48h) | Solicitante | E-mail | Automático |
| Aprovação pendente há 1 dia útil | Aprovador + Gestor | In-app + e-mail | Automático |
| Aprovação atrasada (prazo vencido) | Aprovador + IT_MANAGER | E-mail | Automático |
| SLA em risco (80%) | Técnico + IT_MANAGER | In-app + e-mail | Automático |
| SLA violado | Técnico + IT_MANAGER | E-mail | Automático |
| Usuário provisionado no Google | Novo usuário + Gestor + TI | E-mail | Automático |
| Acesso revogado concluído | Solicitante + Compliance | E-mail | Automático |
| Periférico entregue sem requisição detectado | IT_MANAGER + Compliance | In-app + e-mail | Imediato |
| Orçamento insuficiente detectado | Aprovador Financeiro + IT_MANAGER | In-app + e-mail | Imediato |
| Compra gerada por requisição | Técnico de Compras + IT_MANAGER | In-app | Imediato |

### 18.2 Padrão de Assunto de E-mail

```
[REQ-YYYY-NNNNNN] {título da requisição}
```

Exemplo: `[REQ-2026-000042] Solicitação de Notebook — João Silva`

---

## 19. Dashboards e Indicadores

### 19.1 Dashboard Operacional — Visão em Tempo Real

**Destino:** Analistas, Coordenadores e Gestor. Atualizado via Supabase Realtime.

| Componente | Tipo | Dados Exibidos |
|------------|:----:|---------------|
| **Fila de Aprovações Pendentes** | Lista | Requisições aguardando minha aprovação ou do meu grupo |
| **Requisições Abertas por Status** | Contadores | SUBMITTED / PENDING_APPROVAL / APPROVED / IN_PROGRESS |
| **Fila por Técnico** | Barras | Volume por analista + SLA em risco |
| **SLA em Risco** | Lista urgente | Requisições com > 80% do prazo consumido |
| **Requisições Sem Atribuição** | Contador | Aprovadas aguardando técnico |

### 19.2 KPIs Principais

| KPI | Fórmula | Meta |
|-----|---------|:----:|
| **Requisições Abertas** | COUNT(status NOT IN FULFILLED, CLOSED, CANCELLED, REJECTED) | — |
| **Requisições Concluídas (período)** | COUNT(FULFILLED + CLOSED em período) | Tendência crescente |
| **MTTR** (Mean Time to Resolution) | AVG(fulfilled_at - submitted_at) em horas úteis | Redução trimestral |
| **SLA Cumprido (%)** | COUNT(cumpridas no prazo) / COUNT(total concluídas) × 100 | ≥ 90% |
| **Tempo Médio de Aprovação** | AVG(aprovação 1ª etapa - submissão) | ≤ 4 horas |
| **Taxa de Rejeição** | COUNT(rejeitadas) / COUNT(submetidas) × 100 | ≤ 10% |
| **CSAT Médio** | AVG(csat_score) de requisições encerradas | ≥ 4,2 / 5 |
| **Equipamentos Entregues (período)** | COUNT(FULFILLED com asset_id) | — |
| **Periféricos Entregues (período)** | COUNT(FULFILLED de tipos periférico) | — |
| **Custo OPEX Gerado** | SUM(valor_estimado) de requisições OPEX concluídas | — |
| **Custo CAPEX Gerado** | SUM(valor_estimado) de requisições CAPEX concluídas | — |

### 19.3 Gráficos Analíticos

| Gráfico | Tipo | Dimensão | Objetivo |
|---------|:----:|---------|---------|
| Volume de requisições por período | Linha | Semana / mês | Tendência de demanda |
| Requisições por serviço | Barras | Top 10 serviços | Serviços mais solicitados |
| Requisições por área | Pizza | Por departamento | Distribuição de demanda |
| Requisições por analista | Barras | Volume + MTTR | Capacidade e produtividade |
| Tempo médio de aprovação por tipo | Barras | Por RequestType | Gargalos de aprovação |
| Equipamentos entregues por mês | Linha | Mensal | Volume de entregas de hardware |
| Periféricos entregues por mês | Linha | Mensal | Volume de entregas de periférico |
| Custo OPEX vs. CAPEX | Barras agrupadas | Mensal | Composição do gasto de TI |
| Taxa de rejeição por tipo | Barras | Por tipo | Tipos com alta rejeição (processo) |

---

## 20. Relatórios

### 20.1 Relatórios Operacionais Automáticos

| Relatório | Geração | Destinatário | Conteúdo |
|-----------|:-------:|:------------:|---------|
| **Requisições da Semana** | Semanal (seg 07h) | IT_MANAGER + Analistas | Volume, status, SLA, aprovações pendentes |
| **Aprovações Atrasadas** | Diária | IT_MANAGER | Etapas de aprovação sem decisão há > 2 dias úteis |
| **Entregas de Equipamento** | Mensal | IT_MANAGER + Financeiro | Ativos entregues, custos, assinaturas de aceite |
| **Custos de Requisições** | Mensal | IT_MANAGER + Financeiro | OPEX e CAPEX gerados por requisições, por área |

### 20.2 Relatórios Executivos

| Relatório | Frequência | Destinatário | Conteúdo Principal |
|-----------|:----------:|:------------:|-------------------|
| **Performance de Atendimento** | Mensal | IT_MANAGER + Diretoria | MTTR, SLA, CSAT, volume por tipo |
| **Inventário de Entregas** | Trimestral | IT_MANAGER + Compliance | Ativos e periféricos entregues com rastreabilidade |
| **Relatório de Acessos Concedidos** | Trimestral | Compliance + IT_MANAGER | Criações, alterações e revogações de acesso |
| **Custo de TI por Área** | Trimestral | Financeiro + Diretoria | OPEX/CAPEX originados por requisições, por departamento |

### 20.3 Relatórios sob Demanda

Filtros disponíveis: período, tipo de requisição, status, aprovador, solicitante, departamento, centro de custo, classificação financeira, projeto vinculado.

**Formatos:** PDF (apresentação formal) e Excel (análise).

---

## 21. Auditoria e Rastreabilidade

### 21.1 Eventos Auditados Obrigatoriamente

| Evento | `action` | Dados Capturados |
|--------|:--------:|:----------------:|
| Requisição criada | CREATE | todos os campos iniciais |
| Status alterado | UPDATE | status anterior → novo |
| Aprovação realizada | CREATE | etapa, decisão, aprovador, motivo |
| Rejeição realizada | CREATE | etapa, decisão, motivo obrigatório |
| Delegação de aprovação | UPDATE | aprovador original → substituto + motivo |
| Ativo entregue vinculado | UPDATE | asset_id = null → asset_id = uuid |
| Aceite digital do usuário | CREATE | user_id, IP, timestamp, asset_id |
| Devolução de ativo | UPDATE | returned_at, condition_on_return |
| Lançamento financeiro gerado | CREATE | tipo OPEX/CAPEX, valor, centro de custo |
| Provisionamento Google executado | CREATE | google_user_id, org_unit |
| Revogação Google executada | UPDATE | suspended = true, timestamp |
| Cancelamento | UPDATE | status → CANCELLED + motivo |
| Delegação de aprovação | UPDATE | delegated_from + delegated_to + reason |

### 21.2 Trilha de Aprovações

O módulo mantém `request.ApprovalHistory` com registro completo de cada decisão:

| Campo | Conteúdo |
|-------|---------|
| Etapa | Número da etapa no fluxo |
| Aprovador designado | Usuário ou papel |
| Aprovador que decidiu | Usuário real (pode ser diferente após delegação) |
| Decisão | APPROVED / REJECTED / DELEGATED |
| Data e hora | Timestamp UTC |
| Motivo | Texto livre (obrigatório para REJECTED e DELEGATED) |
| IP | Endereço IP do aprovador |

---

## 22. Regras de Negócio

Regras específicas do Módulo de Gestão de Requisições. Complementam as regras BR-REQ-001 a BR-REQ-010 definidas em `Docs/24_BUSINESS_RULES.md`.

---

**REQ-001** — Vínculo obrigatório ao catálogo
Toda requisição deve estar vinculada a um serviço com status `PUBLISHED` no Catálogo de Serviços. A ausência de `catalog_id` impede a criação da requisição.

---

**REQ-002** — Número imutável
O número da requisição (REQ-YYYY-NNNNNN) é sequencial, único e imutável após a criação.

---

**REQ-003** — Solicitante ≠ Aprovador (SoD-01)
O solicitante da requisição não pode ser o aprovador em nenhuma etapa do fluxo, independentemente do papel. Tentativas de aprovação própria são rejeitadas com erro 422 `SELF_APPROVAL_NOT_ALLOWED`.

---

**REQ-004** — Justificativa obrigatória
O campo "Justificativa" é obrigatório com mínimo de 30 caracteres. Justificativas genéricas como "necessário", "urgente" ou "conforme solicitado" são rejeitadas por validação de conteúdo.

---

**REQ-005** — Formulário dinâmico obrigatório
Os campos do formulário dinâmico (`form_schema` do RequestType) são validados antes da submissão. Campos marcados como obrigatórios no schema bloqueiam a submissão se não preenchidos.

---

**REQ-006** — REJECTED é terminal
Requisição rejeitada não pode ser reativada. Uma nova requisição deve ser criada pelo solicitante para tentar novamente.

---

**REQ-007** — Rejeição exige motivo
Toda rejeição de etapa de aprovação exige motivo documentado com mínimo de 20 caracteres. Rejeições sem motivo são bloqueadas.

---

**REQ-008** — CANCELLED é terminal
Requisição cancelada não pode ser reativada.

---

**REQ-009** — Cancelamento exige justificativa
Todo cancelamento exige justificativa com mínimo de 20 caracteres.

---

**REQ-010** — Em aprovação: sem edição pelo solicitante
Após a submissão, a requisição não pode ser editada pelo solicitante enquanto estiver em qualquer etapa de aprovação. Apenas cancelamento é permitido.

---

**REQ-011** — Toda requisição com custo exige classificação OPEX ou CAPEX
Requisições com `valor_estimado > 0` devem ter o campo `classificacao_financeira` preenchido com OPEX ou CAPEX antes de atingir a etapa de aprovação financeira.

---

**REQ-012** — CAPEX gera ativo obrigatório
Toda requisição classificada como CAPEX que resulte em entrega de bem físico deve gerar um ativo cadastrado no inventário do SGTI com `asset_id` vinculado à requisição.

---

**REQ-013** — Todo periférico entregue deve possuir requisição vinculada
Nenhum periférico pode ser entregue pela equipe de TI sem uma requisição aberta e aprovada no SGTI. Entregas sem requisição são registradas como não-conformidade no módulo de Compliance.

---

**REQ-014** — Toda entrega de ativo deve possuir aceite formal do usuário
O aceite do recebimento (botão "Confirmar Recebimento" ou automático após 48h) é obrigatório para fechar requisições de entrega de equipamento. O aceite é registrado em `shared.audit_log` com IP e timestamp.

---

**REQ-015** — Toda criação de usuário gera trilha de auditoria
A aprovação e execução de REQ-TYPE-001 (criação de usuário) gera automaticamente evidência de auditoria no módulo de Compliance com: aprovadores, perfis concedidos, base legal e data de efetivação.

---

**REQ-016** — Prazo de aprovação: 2 dias úteis por etapa
Cada etapa de aprovação tem prazo de 2 dias úteis. Ao vencer sem decisão: alerta ao aprovador + IT_MANAGER. O SLA total da requisição contabiliza o tempo gasto em aprovações.

---

**REQ-017** — Aprovação atrasada é escalonada ao IT_MANAGER
Etapa de aprovação com prazo vencido é escalonada automaticamente ao IT_MANAGER com notificação ao aprovador original.

---

**REQ-018** — Delegação não pode ser ao próprio solicitante
O aprovador não pode delegar a aprovação para o próprio solicitante da requisição.

---

**REQ-019** — Revogação de acesso: SLA CRÍTICO de 2 horas
Requisições do tipo Revogação de Acesso (REQ-TYPE-003) têm SLA CRÍTICO de 2 horas a partir da aprovação. Descumprimento gera alerta imediato ao IT_MANAGER e ao Compliance Officer.

---

**REQ-020** — Provisionamento automático pós-aprovação de criação de usuário
A aprovação de REQ-TYPE-001 dispara automaticamente o provisionamento da conta no Google Workspace, sem necessidade de ação manual adicional do técnico.

---

**REQ-021** — Revogação automática pós-aprovação de revogação de acesso
A aprovação de REQ-TYPE-003 dispara automaticamente a revogação de sessões e a suspensão da conta no Google Workspace, sem necessidade de ação manual.

---

**REQ-022** — Software novo exige análise de segurança
Requisição de software fora do portfólio homologado (REQ-TYPE-014 para software não listado) exige etapa adicional de análise técnica de segurança pela equipe de TI antes da aprovação financeira.

---

**REQ-023** — Lançamento financeiro gerado automaticamente
Requisições com valor estimado aprovadas geram automaticamente lançamento pendente no módulo Financeiro (OPEX ou CAPEX) ao serem concluídas (FULFILLED).

---

**REQ-024** — Centro de custo obrigatório para requisições com custo
Requisições com `valor_estimado > 0` devem ter o campo `centro_de_custo_id` preenchido. A ausência bloqueia a submissão.

---

**REQ-025** — Orçamento verificado antes da aprovação financeira
Ao iniciar a etapa de Aprovação Financeira, o sistema verifica o saldo disponível no orçamento do centro de custo. Se o saldo for insuficiente, o Aprovador Financeiro é alertado antes de decidir.

---

**REQ-026** — Requisição com custo acima do orçamento requer aprovação adicional do IT_MANAGER
Quando o valor estimado da requisição supera o saldo disponível do orçamento em mais de 20%, é necessária aprovação adicional do IT_MANAGER além do fluxo padrão.

---

**REQ-027** — Threshold de alçada por valor
Os thresholds de aprovação por valor são aplicados automaticamente pelo sistema na geração do fluxo de aprovação: Coordenador (≤ R$1k), Gestor (≤ R$10k), Gestor + step-up (> R$10k), + Diretoria (> R$50k).

---

**REQ-028** — Compra gerada vinculada à requisição original
Toda requisição de compra gerada a partir de uma requisição de serviço deve ser rastreável bidirecionalmente. O campo `service_request_id` na requisição de compra é obrigatório.

---

**REQ-029** — Estoque verificado antes de gerar compra
Antes de gerar demanda de compra, o técnico deve verificar o estoque de ativos disponíveis no inventário. Geração de compra para item em estoque é um desvio de processo registrado.

---

**REQ-030** — Aceite automático após 48 horas
Requisição com status FULFILLED sem ação do solicitante por 48 horas é automaticamente encerrada com aceite implícito registrado em auditoria.

---

**REQ-031** — CSAT apenas pelo solicitante original
A avaliação CSAT só pode ser fornecida pelo solicitante original da requisição. Técnicos e gestores não podem avaliar em nome do solicitante.

---

**REQ-032** — Notas de cumprimento obrigatórias
O campo "Notas de Cumprimento" é obrigatório ao marcar como FULFILLED (mínimo 20 caracteres). Requisições não podem ser concluídas sem descrição do que foi executado.

---

**REQ-033** — Asset_id obrigatório para entrega de hardware
Requisições dos tipos hardware (notebook, desktop, impressora, celular) não podem ser marcadas como FULFILLED sem o campo `asset_id` preenchido com o ativo entregue.

---

**REQ-034** — Requisição vinculada a projeto: custo debitado automaticamente
Quando uma requisição com custo está vinculada a um projeto, o valor é debitado automaticamente do orçamento do projeto ao ser concluída.

---

**REQ-035** — Projeto ativo obrigatório para vinculação
Requisições só podem ser vinculadas a projetos com status `APPROVED` ou `IN_PROGRESS`. Projetos em `IDEATION`, `COMPLETED` ou `CANCELLED` não aceitam requisições vinculadas.

---

**REQ-036** — Acesso concedido respeita princípio do menor privilégio
Requisições de acesso a sistemas (REQ-TYPE-004 e REQ-TYPE-005) devem especificar o perfil mínimo necessário. O Compliance Officer pode revisar e reduzir o nível de acesso solicitado.

---

**REQ-037** — Dados pessoais em requisições: base legal obrigatória
Requisições que envolvam tratamento de dados pessoais (ex.: acesso a sistemas com dados de clientes) devem ter a base legal documentada na justificativa conforme LGPD Art. 7.

---

**REQ-038** — Contratação de serviço com acesso a dados exige DPA
Requisições REQ-TYPE-019 (contratação de serviço) onde o fornecedor terá acesso a dados pessoais exigem validação de existência de DPA (Data Processing Agreement) pelo Compliance Officer.

---

**REQ-039** — Data de abertura imutável e gerada pelo banco
O campo `submitted_at` é preenchido pelo banco de dados (DEFAULT NOW()). Nenhum cliente pode fornecer ou alterar este valor.

---

**REQ-040** — Termo de Responsabilidade gerado em PDF sob demanda
O IT_MANAGER pode gerar PDF do Termo de Responsabilidade de qualquer requisição encerrada com entrega de ativo a qualquer momento, sem prazo de expiração.

---

**REQ-041** — Notificação de aprovação pendente ao Gestor
Toda requisição submetida notifica automaticamente o Gestor direto do solicitante (ou o Gestor configurado como aprovador da etapa 1) dentro de 5 minutos da submissão.

---

**REQ-042** — Requisição não pode ser excluída fisicamente
Requisições são somente soft-deleted (via `deleted_at`). A exclusão física é proibida por RLS.

---

**REQ-043** — Registro retroativo de periférico entregue sem requisição
Quando identificada entrega sem requisição, o Analista deve criar requisição retroativa com tipo correspondente, aprovação do IT_MANAGER e registro de não-conformidade no Compliance.

---

**REQ-044** — Plataforma de aprovação: SGTI exclusivamente
Aprovações de requisições devem ser realizadas exclusivamente pela interface do SGTI. Aprovações por e-mail, WhatsApp ou verbal não têm validade formal.

---

**REQ-045** — Acesso revogado: prazo máximo de 2 horas
Após aprovação de REQ-TYPE-003, o acesso do usuário deve ser tecnicamente revogado em até 2 horas. Descumprimento gera Não-Conformidade no módulo de Compliance com severidade MAIOR.

---

**REQ-046** — Solicitante notificado de rejeição com motivo
Ao rejeitar uma requisição, o motivo é obrigatório e é exibido ao solicitante na notificação de rejeição. O solicitante não recebe o nome do aprovador que rejeitou (privacidade da gestão interna).

---

**REQ-047** — Requisição de acesso a sistema: verificação de conflito de papéis
Antes de conceder acesso a sistema, o sistema verifica se o perfil solicitado viola alguma regra de Segregação de Funções (SoD) com os acessos já existentes do usuário.

---

**REQ-048** — Equipamento entregue em condição DANIFICADA: não-conformidade
Se o técnico registrar `condição_na_entrega = DAMAGED` ao entregar um ativo, o sistema cria automaticamente um incidente vinculado com prioridade MÉDIO para tratativa do equipamento danificado.

---

**REQ-049** — Requisição de licença adicional verifica utilização
Antes de aprovar REQ-TYPE-015 (licença adicional), o sistema exibe automaticamente a taxa de utilização atual da licença existente. Se a utilização for < 20%, o Aprovador Financeiro é alertado.

---

**REQ-050** — Histórico de aprovações preservado para auditorias
O `request.ApprovalHistory` é imutável após criação. Nenhum registro de aprovação pode ser editado ou excluído. A trilha é preservada indefinidamente para fins de auditoria.

---

**REQ-051** — Requisição de criação de usuário: conta Google antes do primeiro acesso
A conta no Google Workspace deve ser criada e ativa antes da data de admissão informada na requisição. Sistema alerta o técnico se o provisionamento não foi concluído até 1 dia antes da admissão.

---

**REQ-052** — Requisição de celular corporativo exige plano de dados definido
REQ-TYPE-013 (celular corporativo) exige campo "plano de dados" preenchido para cotação e registro do contrato de telecomunicações correspondente.

---

## 23. Critérios de Aceitação

### 23.1 Registro e Abertura

- [ ] **CA-01:** Solicitante consegue abrir requisição em no máximo 3 interações de navegação a partir da página inicial.
- [ ] **CA-02:** Apenas serviços com status PUBLISHED são exibidos no campo de serviço.
- [ ] **CA-03:** Formulário dinâmico exibe corretamente os campos específicos do tipo de requisição selecionado.
- [ ] **CA-04:** Número REQ-YYYY-NNNNNN gerado e exibido imediatamente após submissão.
- [ ] **CA-05:** Campos obrigatórios do `form_schema` bloqueiam submissão se não preenchidos.
- [ ] **CA-06:** Solicitante recebe e-mail de confirmação em até 1 minuto após submissão.
- [ ] **CA-07:** Rascunho (DRAFT) salvo automaticamente sem SLA ativado.

### 23.2 Fluxo de Aprovação

- [ ] **CA-08:** Fluxo de aprovação correto é gerado automaticamente conforme o tipo de requisição selecionado.
- [ ] **CA-09:** Sistema bloqueia aprovação pelo próprio solicitante com erro 422 `SELF_APPROVAL_NOT_ALLOWED`.
- [ ] **CA-10:** Rejeição sem motivo é bloqueada pelo sistema.
- [ ] **CA-11:** Delegação não pode ser para o próprio solicitante da requisição.
- [ ] **CA-12:** Aprovações pendentes há mais de 2 dias úteis geram alerta automático ao aprovador e IT_MANAGER.
- [ ] **CA-13:** Threshold de valor gera o fluxo de aprovação correto conforme tabela da seção 7.6.
- [ ] **CA-14:** Aprovação via SGTI é registrada em `ApprovalHistory` com timestamp e IP.

### 23.3 Entrega de Equipamentos

- [ ] **CA-15:** FULFILLED sem `asset_id` para tipo hardware é bloqueado com mensagem de erro.
- [ ] **CA-16:** Aceite do usuário registrado em `audit_log` com IP e timestamp.
- [ ] **CA-17:** Fechamento automático ocorre 48 horas após FULFILLED sem aceite do usuário.
- [ ] **CA-18:** PDF do Termo de Responsabilidade gerado corretamente com dados do ativo e do usuário.
- [ ] **CA-19:** Ativo entregue aparece no histórico do usuário no módulo de Identidades.

### 23.4 Periféricos

- [ ] **CA-20:** FULFILLED de periférico sem `asset_id` é bloqueado pelo sistema.
- [ ] **CA-21:** Entrega de periférico vincula corretamente o ativo ao usuário beneficiário.
- [ ] **CA-22:** Detecção de entrega sem requisição cria não-conformidade no módulo Compliance.

### 23.5 Integrações

- [ ] **CA-23:** Aprovação de REQ-TYPE-001 dispara provisionamento automático no Google Workspace.
- [ ] **CA-24:** Aprovação de REQ-TYPE-003 revoga sessões do usuário imediatamente.
- [ ] **CA-25:** Conta Google suspensa em até 2 horas após aprovação de revogação.
- [ ] **CA-26:** Lançamento financeiro (OPEX/CAPEX) criado automaticamente ao concluir requisição com custo.
- [ ] **CA-27:** Requisição com projeto vinculado debita o custo do orçamento do projeto ao concluir.
- [ ] **CA-28:** Demanda de compra gerada por requisição mantém rastreabilidade bidirecional.

### 23.6 SLA e Alertas

- [ ] **CA-29:** SLA calculado corretamente em horário útil para cada tipo de requisição.
- [ ] **CA-30:** Alerta de SLA em risco (80%) notifica técnico e IT_MANAGER.
- [ ] **CA-31:** SLA pausado corretamente em PENDING_USER e PENDING_THIRD_PARTY.
- [ ] **CA-32:** Revogação de acesso (REQ-TYPE-003) respeita SLA CRÍTICO de 2 horas.

### 23.7 Financeiro e Compliance

- [ ] **CA-33:** Requisição com custo > 0 sem classificação OPEX/CAPEX não avança para aprovação financeira.
- [ ] **CA-34:** Verificação de saldo orçamentário exibida ao Aprovador Financeiro antes de decidir.
- [ ] **CA-35:** Criação de usuário gera evidência automática no módulo de Compliance.
- [ ] **CA-36:** Acesso a sistema com dados pessoais aciona etapa de aprovação do Compliance Officer.

### 23.8 Auditoria e Rastreabilidade

- [ ] **CA-37:** `ApprovalHistory` registra corretamente todas as decisões com timestamp, aprovador e motivo.
- [ ] **CA-38:** `audit_log` registra todas as operações de escrita com old_values e new_values.
- [ ] **CA-39:** RLS impede UPDATE e DELETE em `request.ApprovalHistory`.
- [ ] **CA-40:** Solicitante não visualiza requisições de outros usuários.

### 23.9 Dashboards e Relatórios

- [ ] **CA-41:** Dashboard operacional exibe fila de aprovações pendentes do usuário logado.
- [ ] **CA-42:** KPIs de MTTR, SLA e CSAT calculados corretamente para o período selecionado.
- [ ] **CA-43:** Relatório de entregas gerado com lista de ativos e aceites registrados.
- [ ] **CA-44:** Exportação de relatório em PDF e Excel funciona com filtros aplicados.

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação com 23 seções, 52 regras REQ e 44 critérios de aceitação |

---

> **Próximos documentos recomendados:**
> [`40_INCIDENT_MANAGEMENT.md`](./40_INCIDENT_MANAGEMENT.md) — Módulo de Gestão de Incidentes
> [`42_PROBLEM_MANAGEMENT.md`](./42_PROBLEM_MANAGEMENT.md) — Módulo de Gestão de Problemas
> [`43_ASSET_MANAGEMENT.md`](./43_ASSET_MANAGEMENT.md) — Módulo de Gestão de Ativos
