# SGTI — Sistema de Gestão de Tecnologia da Informação
## Módulo de Gestão de Projetos de TI — Documentação Funcional

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [24_BUSINESS_RULES.md](./24_BUSINESS_RULES.md) · [46_FINANCIAL_MANAGEMENT.md](./46_FINANCIAL_MANAGEMENT.md) · [45_COMPLIANCE.md](./45_COMPLIANCE.md) · [42_PROBLEM_MANAGEMENT.md](./42_PROBLEM_MANAGEMENT.md) · [20_DATABASE.md](./20_DATABASE.md)

---

## Sobre este Documento

Este documento define a **especificação funcional completa do Módulo de Gestão de Projetos de TI do SGTI**. Cobre conceito PMBOK, ciclo de vida, planejamento, cronograma, gestão de riscos/stakeholders/mudanças/benefícios, integrações, dashboards, regras de negócio e critérios de aceitação.

**Escopo exclusivo:** documentação funcional e de processo. Nenhum código, SQL ou especificação de API é gerado neste documento.

---

## Sumário

1. [Conceito de Projeto de TI](#1-conceito-de-projeto-de-ti)
2. [Objetivos do Módulo](#2-objetivos-do-módulo)
3. [Papéis e Responsabilidades](#3-papéis-e-responsabilidades)
4. [Estrutura do Projeto](#4-estrutura-do-projeto)
5. [Tipos de Projeto](#5-tipos-de-projeto)
6. [Ciclo de Vida do Projeto](#6-ciclo-de-vida-do-projeto)
7. [Gestão de Demandas](#7-gestão-de-demandas)
8. [Planejamento do Projeto](#8-planejamento-do-projeto)
9. [Cronograma](#9-cronograma)
10. [Marcos — Milestones](#10-marcos--milestones)
11. [Gestão de Recursos](#11-gestão-de-recursos)
12. [Gestão Financeira do Projeto](#12-gestão-financeira-do-projeto)
13. [Gestão de Riscos do Projeto](#13-gestão-de-riscos-do-projeto)
14. [Gestão de Stakeholders](#14-gestão-de-stakeholders)
15. [Gestão de Mudanças](#15-gestão-de-mudanças)
16. [Integração com Compliance](#16-integração-com-compliance)
17. [Integração com Problemas](#17-integração-com-problemas)
18. [Integração com Compras](#18-integração-com-compras)
19. [Integração com Ativos](#19-integração-com-ativos)
20. [Integração com Base de Conhecimento](#20-integração-com-base-de-conhecimento)
21. [Gestão de Lições Aprendidas](#21-gestão-de-lições-aprendidas)
22. [Dashboards Operacionais](#22-dashboards-operacionais)
23. [Dashboards Executivos](#23-dashboards-executivos)
24. [Relatórios](#24-relatórios)
25. [Auditoria e Rastreabilidade](#25-auditoria-e-rastreabilidade)
26. [Compliance e Conformidade](#26-compliance-e-conformidade)
27. [Gestão de Benefícios](#27-gestão-de-benefícios)
28. [Indicadores do Projeto](#28-indicadores-do-projeto)
29. [Regras de Negócio](#29-regras-de-negócio)
30. [Critérios de Aceitação](#30-critérios-de-aceitação)

---

## 1. Conceito de Projeto de TI

### 1.1 Definição PMBOK

> Um **Projeto** é um esforço temporário empreendido para criar um produto, serviço ou resultado único. O projeto tem um início e um término definidos, é executado por pessoas, frequentemente constrangido por recursos limitados e planejado, executado e controlado.
>
> — PMBOK 7ª Edição, Project Management Institute

No contexto do SGTI, um Projeto de TI é qualquer iniciativa com as seguintes características:

- **Temporalidade:** tem início e fim definidos.
- **Resultado único:** produz entregas que não existiam antes (novo sistema, nova infraestrutura, nova prática).
- **Progressividade:** é elaborado e refinado ao longo do tempo.
- **Esforço mínimo:** envolve mais de 80 horas de trabalho OU custo superior a R$10.000,00.

### 1.2 Diferenciação de Conceitos Correlatos

| Conceito | Definição | Gatilho | Resultado | Temporalidade |
|:--------:|-----------|---------|---------|:-------------:|
| **Projeto** | Esforço temporário para criar resultado único | Estratégia, compliance, problema sistêmico, inovação | Produto, serviço ou capacidade nova | Definida |
| **Demanda** | Solicitação de alto nível ainda não avaliada para transformação em projeto | Área de negócio, diretoria, regulação | Pode originar projeto ou ser atendida por requisição | Indefinida |
| **Requisição** | Solicitação de serviço padrão, previsível e de baixo risco | Usuário final, gestor | Entrega de serviço existente no catálogo | Curtíssimo prazo |
| **Problema** | Causa raiz de incidentes recorrentes que requer solução sistêmica | Incidentes recorrentes | Eliminação da causa raiz (pode gerar projeto) | Médio prazo |
| **Mudança** | Alteração controlada em serviço, sistema ou processo existente | Necessidade de adaptação ou melhoria | Versão atualizada do existente (fora do escopo SGTI v1) | Pontual |

### 1.3 Quando Criar um Projeto vs. Usar Outro Módulo

```
ÁRVORE DE DECISÃO: PROJETO OU OUTRO MÓDULO?

Algo parou de funcionar?
  SIM → Módulo de INCIDENTES

Causa raiz recorrente a investigar?
  SIM → Módulo de PROBLEMAS

Preciso de algo que já existe no portfólio de TI?
  SIM → Módulo de REQUISIÇÕES

Desvio de conformidade a corrigir?
  DEPENDE:
    Correção simples (< 80h e < R$10k) → Plano de Ação no módulo COMPLIANCE
    Correção complexa → PROJETO

Iniciativa nova com esforço > 80h OU custo > R$10k?
  SIM → Módulo de PROJETOS
```

### 1.4 Alinhamento com ITIL v4

No vocabulário ITIL v4, a Gestão de Projetos de TI alinha-se às práticas de:
- **Gestão de Portfólio de Serviços:** seleção e priorização de projetos estratégicos.
- **Melhoria Contínua:** projetos de melhoria de serviços existentes.
- **Gestão de Mudanças:** implementação controlada de novos serviços e capacidades.

---

## 2. Objetivos do Módulo

### 2.1 Objetivo Primário

Prover visibilidade, controle e governança sobre todos os projetos de TI em andamento, garantindo que iniciativas estratégicas sejam entregues dentro do prazo, escopo e orçamento planejados, com rastreabilidade completa e aprendizado organizacional registrado.

### 2.2 Objetivos Específicos

| # | Objetivo | Indicador | Meta |
|---|----------|-----------|:----:|
| 1 | Portfólio de projetos centralizado | % projetos de TI gerenciados no SGTI | 100% |
| 2 | Saúde do projeto monitorada | % projetos com health_status atualizado | Automático (diário) |
| 3 | Projetos entregues no prazo | % projetos concluídos sem extensão de prazo | ≥ 70% |
| 4 | Projetos dentro do orçamento | % projetos concluídos dentro do budget | ≥ 75% |
| 5 | Lições aprendidas documentadas | % projetos encerrados com lições aprendidas | 100% |
| 6 | Rastreabilidade de origem de projetos | % projetos com origem documentada (demanda, problema, compliance) | 100% |
| 7 | Riscos identificados e acompanhados | % projetos com registro de riscos atualizado | 100% |
| 8 | Benefícios monitorados pós-encerramento | % projetos com benefícios realizados medidos (6 meses pós-entrega) | ≥ 80% |

### 2.3 Limites do Módulo

**O módulo de Projetos:**
- Gerencia o ciclo de vida completo de projetos de TI.
- Não substitui ferramentas avançadas de PPM (Project Portfolio Management) como MS Project, Jira ou Asana para equipes grandes.
- Cobre as necessidades de gestão de projetos para times de TI de médio porte.

---

## 3. Papéis e Responsabilidades

### 3.1 Solicitante (END_USER / qualquer perfil)

**No contexto de projetos:**
- Formalizar demandas estratégicas de TI.
- Acompanhar o andamento do projeto como stakeholder beneficiário.
- Participar de reuniões de validação de entregas.
- Confirmar aceite de entregáveis que afetam sua área.

---

### 3.2 Gerente de Projeto (PROJECT_MANAGER)

**Perfil:** Responsável pela condução técnica e operacional do projeto. Pode ser um IT_SPECIALIST ou IT_MANAGER.

**Responsabilidades:**
- Elaborar o plano do projeto: escopo, cronograma, recursos e custos.
- Coordenar atividades da equipe do projeto.
- Monitorar o progresso e atualizar o status de atividades e marcos.
- Identificar e registrar riscos com plano de mitigação.
- Gerenciar mudanças de escopo, prazo e custo.
- Comunicar o status do projeto aos stakeholders e ao Sponsor.
- Conduzir a homologação das entregas com os beneficiários.
- Documentar lições aprendidas durante e ao encerrar o projeto.
- Publicar artigos de lições aprendidas na Base de Conhecimento.

---

### 3.3 Analista de TI (IT_TECHNICIAN)

**Responsabilidades no contexto de projetos:**
- Executar atividades técnicas atribuídas no cronograma.
- Atualizar o progresso das tarefas sob sua responsabilidade.
- Reportar impedimentos ao Gerente de Projeto.
- Registrar custos e horas de trabalho nas atividades.
- Apoiar a documentação técnica do projeto.

---

### 3.4 Coordenador de TI (IT_SPECIALIST)

**Responsabilidades:**
- Assumir o papel de Gerente de Projeto em iniciativas de menor porte.
- Apoiar o Gerente em projetos complexos como líder técnico de um domínio.
- Revisar entregas técnicas do projeto.
- Atualizar o progresso de atividades e marcos.

---

### 3.5 Gestor de TI (IT_MANAGER)

**Responsabilidades:**
- **Aprovar** a abertura de novos projetos.
- **Monitorar** o portfólio de projetos no dashboard executivo.
- **Intervir** em projetos com health_status VERMELHO (crítico).
- **Autorizar** mudanças significativas de escopo, prazo ou orçamento.
- **Aprovar** encerramento formal e lições aprendidas.
- **Comunicar** à Diretoria o status do portfólio de projetos.
- **Priorizar** projetos quando há conflito de recursos.

---

### 3.6 Sponsor (Patrocinador)

**Perfil:** Líder executivo que patrocina o projeto — responsável pelo alinhamento estratégico e pela aprovação de recursos.

**Responsabilidades:**
- Definir o objetivo estratégico e o valor esperado do projeto.
- Aprovar o orçamento e garantir os recursos necessários.
- Remover impedimentos de alto nível (políticos, organizacionais).
- Participar de revisões de fase e marcos críticos.
- Aprovar a conclusão do projeto e validar os benefícios esperados.
- Comunicar a importância do projeto para a organização.

**Regra:** Sponsor e Gerente de Projeto devem ser usuários distintos.
**Referência:** BR-PRJ-001

---

### 3.7 PMO — Project Management Office (IT_MANAGER com papel funcional)

**Perfil:** Função ou equipe responsável pela governança do portfólio de projetos. Pode ser exercida pelo IT_MANAGER com papel funcional de PMO.

**Responsabilidades:**
- Manter a metodologia de projetos atualizada e aderente.
- Revisar e aprovar o plano do projeto antes de iniciar a execução.
- Monitorar o portfólio global de projetos com visão consolidada.
- Consolidar e distribuir relatórios do portfólio para a Diretoria.
- Manter o catálogo de lições aprendidas organizado.
- Propor ajustes de prioridade no portfólio conforme capacidade.

---

### 3.8 Administrador (SUPER_ADMIN)

**Responsabilidades:**
- Configurar tipos de projeto, categorias e parâmetros do módulo.
- Gerenciar templates de plano de projeto.
- Auditar o módulo com acesso completo ao audit_log.

---

## 4. Estrutura do Projeto

### 4.1 Seção: Identificação

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **id** | UUID | Automático | Não | Identificador único |
| **Código** | String (sequencial) | Automático | Não | `PRJ-YYYY-NNNN`. Imutável após criação. |
| **Nome** | String (300) | Sim | IT_MANAGER+, PM | Nome oficial do projeto. |
| **Sigla** | String (20) | Não | IT_MANAGER+, PM | Abreviação para uso em dashboards e comunicações. |
| **Tipo** | Enum | Sim | IT_MANAGER+ | Ver seção 5. |
| **Descrição** | Texto longo | Sim | PM | Contextualização do projeto: problema que resolve, contexto organizacional. |
| **Objetivo** | Texto | Sim | PM | Objetivo SMART: o que será entregue, quando e com que critério de sucesso. |
| **Escopo** | Texto | Condicional (obrigatório no planejamento) | PM | O que está e o que não está no escopo. |

### 4.2 Seção: Governança

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **Sponsor** | FK — User | Sim | IT_MANAGER+ | Patrocinador do projeto. Deve ser usuário distinto do PM. |
| **Gerente de Projeto** | FK — User | Sim | IT_MANAGER+ | Responsável pela condução. Role mínimo: IT_SPECIALIST. |
| **Área Responsável** | FK — Department | Sim | IT_MANAGER+ | Departamento que receberá o resultado. |
| **Equipe do Projeto** | Array FK — User | Não | PM | Membros alocados ao projeto (máx. 20). |
| **PMO Responsável** | FK — User | Não | IT_MANAGER+ | Responsável pelo PMO acompanhando o projeto. |

### 4.3 Seção: Classificação e Prioridade

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **Status** | Enum | Sim | Conforme fluxo | Estado atual no ciclo de vida. Ver seção 6. |
| **Health Status** | Enum — calculado | Automático | PM (override) | `GREEN`, `YELLOW`, `RED`. Calculado pelo `ProjectHealthJob`. |
| **Prioridade** | Enum | Sim | IT_MANAGER+ | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`. |
| **Estratégico** | Boolean | Não | IT_MANAGER+ | `true` se o projeto é de importância estratégica para a organização. |
| **Origem** | Enum | Sim | IT_MANAGER+ | `STRATEGIC_DEMAND`, `COMPLIANCE`, `PROBLEM`, `REQUEST`, `INNOVATION`, `REGULATORY`, `OTHER`. |
| **Demanda de Origem** | FK — Demand | Condicional | Automático | Se originado de demanda estratégica. |
| **Apontamento de Origem** | FK — ComplianceFinding | Condicional | Automático | Se originado de compliance. |
| **Problema de Origem** | FK — Problem | Condicional | Automático | Se originado de problema ITIL. |

### 4.4 Seção: Datas e Cronograma

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **Data de Início Planejada** | Date | Sim | PM | Início previsto no planejamento. |
| **Data de Fim Planejada** | Date | Sim | PM | Encerramento previsto no planejamento. |
| **Data de Início Real** | Date | Automático | Não | Preenchida ao mudar para EXECUTION. |
| **Data de Fim Real** | Date | Automático | Não | Preenchida ao mudar para CLOSED. |
| **Percentual de Conclusão** | Decimal (5,2) — calculado | Automático | PM (override) | Calculado com base nas atividades concluídas. |
| **Dias de Atraso** | Inteiro — calculado | Automático | Não | Diferença entre data fim planejada e real. |

### 4.5 Seção: Financeiro

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **Centro de Custo** | FK — CostCenter | Sim | IT_MANAGER+ | Centro de custo responsável. |
| **Orçamento CAPEX Aprovado** | Decimal (15,2) | Sim | IT_MANAGER+ | Investimentos aprovados (hardware, infraestrutura, desenvolvimento). |
| **Orçamento OPEX Aprovado** | Decimal (15,2) | Sim | IT_MANAGER+ | Despesas operacionais aprovadas (serviços, licenças temporárias). |
| **CAPEX Realizado** | Decimal (15,2) | Automático | Não | Soma dos investimentos efetivados. |
| **OPEX Realizado** | Decimal (15,2) | Automático | Não | Soma das despesas operacionais efetivadas. |
| **% Orçamento Utilizado** | Decimal (5,2) — calculado | Automático | Não | (CAPEX + OPEX Realizado) / (CAPEX + OPEX Aprovado) × 100. |
| **Saldo Disponível** | Decimal (15,2) — calculado | Automático | Não | Total aprovado − realizado. |

### 4.6 Seção: Metadados

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| **Repositório GitHub** | URL | Não | Link para o repositório de código do projeto. |
| **Pasta de Documentos** | URL | Não | Link para o Google Drive ou repositório documental. |
| **Tags** | Array String | Não | Tags para busca e agrupamento. |

---

## 5. Tipos de Projeto

### 5.1 Tabela de Tipos

| Tipo | Código | Descrição | Exemplos |
|:----:|:------:|-----------|---------|
| **Infraestrutura** | `INFRASTRUCTURE` | Construção ou modernização de infraestrutura física e virtual | Migração de datacenter, upgrade de servidores, expansão de storage |
| **Segurança** | `SECURITY` | Projetos focados em segurança da informação e cibersegurança | Implantação de SIEM, zero trust, gestão de identidades |
| **Sistemas** | `SYSTEMS` | Desenvolvimento, implantação ou integração de sistemas | ERP, CRM, sistemas internos, integrações entre sistemas |
| **Compliance** | `COMPLIANCE` | Adequação a normas, regulações e auditorias | ISO 27001, LGPD, PCI DSS, BACEN |
| **Auditoria** | `AUDIT` | Projetos de auditoria interna ou preparação para externa | Auditoria interna de controles, preparação para certificação |
| **Cloud** | `CLOUD` | Migração, adoção ou otimização de ambientes em nuvem | Migração para AWS, adoção de multi-cloud, FinOps |
| **Redes** | `NETWORKING` | Projetos de infraestrutura de rede | SD-WAN, expansão Wi-Fi, revisão de topologia |
| **Telecom** | `TELECOM` | Projetos de telecomunicações corporativas | Troca de operadora, MPLS, VoIP |
| **Transformação Digital** | `DIGITAL_TRANSFORMATION` | Iniciativas de transformação digital amplas | Digitalização de processos, experiência do colaborador |
| **Inovação** | `INNOVATION` | Projetos experimentais e de inovação tecnológica | IA corporativa, automação RPA, IoT |

### 5.2 Atributos Específicos por Tipo

| Tipo | Deliverable Primário | Integração Principal | Risco Padrão |
|:----:|:--------------------|:--------------------:|:------------:|
| Infraestrutura | Ambiente funcional e testado | Ativos + Compras | ALTO |
| Segurança | Controles implementados + Evidências | Compliance + IAM | ALTO |
| Sistemas | Sistema em produção + Documentação técnica | KB + Compliance | MÉDIO |
| Compliance | Controles implementados + Auditoria concluída | Compliance + KB | ALTO |
| Cloud | Ambiente cloud ativo + Runbook | Ativos + Financeiro | MÉDIO |
| Inovação | POC / MVP validado + Relatório | KB | BAIXO |

---

## 6. Ciclo de Vida do Projeto

### 6.1 Diagrama de Status

```
 ORIGEM DA DEMANDA
 ──────────────────
 Estratégia · Compliance · Problema ITIL · Demanda de Negócio · Inovação
             │
             ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                      PROPOSTO                                │
 │                   (Status: IDEATION)                         │
 │  Ideia registrada. Sponsor e PM designados.                  │
 │  Aguarda avaliação de viabilidade.                           │
 └──────────────────────────┬───────────────────────────────────┘
                            │ PMO/IT_MANAGER avalia
                            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                    EM AVALIAÇÃO                              │
 │                (Status: UNDER_EVALUATION)                    │
 │  Análise de viabilidade: técnica, financeira e estratégica.  │
 │  Business case elaborado. Aprovação do Sponsor.              │
 └──────────────────────────┬───────────────────────────────────┘
                            │ IT_MANAGER + Sponsor aprovam
                            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                      APROVADO                                │
 │                   (Status: APPROVED)                         │
 │  Projeto aprovado. Orçamento reservado no Financeiro.        │
 │  PM inicia o planejamento formal.                            │
 └──────────────────────────┬───────────────────────────────────┘
                            │ Plano aprovado pelo PMO/IT_MANAGER
                            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                    PLANEJAMENTO                              │
 │                  (Status: PLANNING)                          │
 │  Elaboração do plano: escopo, cronograma, riscos, recursos.  │
 │  Marco: Kick-off Meeting realizado.                          │
 └──────────────────────────┬───────────────────────────────────┘
                            │ Plano finalizado; kick-off realizado
                            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                      EXECUÇÃO                                │
 │                   (Status: EXECUTION)                        │
 │  Equipe executando atividades conforme cronograma.           │
 │  Monitoramento de prazo, custo e qualidade ativo.            │
 └──────────────────────────┬───────────────────────────────────┘
                            │ Entregas principais concluídas
                            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                    HOMOLOGAÇÃO                               │
 │                  (Status: TESTING)                           │
 │  Testes e validação das entregas pelos stakeholders.         │
 │  Correção de defeitos e ajustes finais.                      │
 └──────────────────────────┬───────────────────────────────────┘
                            │ Homologação aprovada pelos beneficiários
                            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                    IMPLANTAÇÃO                               │
 │                   (Status: DEPLOYMENT)                       │
 │  Go-live em produção. Monitoramento pós-implantação.         │
 │  Plano de rollback disponível.                               │
 └──────────────────────────┬───────────────────────────────────┘
                            │ Estabilização confirmada; aceitação formal
                            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                      ENCERRADO                               │
 │                   (Status: CLOSED)                           │
 │  Projeto formalmente encerrado. Lições aprendidas.           │
 │  Transferência para operação. Benefícios medidos.            │
 └──────────────────────────────────────────────────────────────┘

 ┌──────────────────────────────────────────────────────────────┐
 │                    CANCELADO (CANCELLED)                     │
 │  Acessível de qualquer status exceto CLOSED.                 │
 │  IT_MANAGER+. Justificativa obrigatória.                     │
 │  Reserva orçamentária liberada automaticamente.              │
 └──────────────────────────────────────────────────────────────┘

 ┌──────────────────────────────────────────────────────────────┐
 │                    SUSPENSO (ON_HOLD)                        │
 │  Pausa temporária. Recursos liberados temporariamente.       │
 │  IT_MANAGER+. Motivo e data prevista de retomada obrigat.    │
 │  Reversível → retorna para o status anterior à suspensão.    │
 └──────────────────────────────────────────────────────────────┘
```

### 6.2 Transições de Status Permitidas

| De | Para | Quem executa | Pré-condição |
|----|------|:------------:|:------------|
| IDEATION | UNDER_EVALUATION | IT_MANAGER+ | Sponsor designado |
| IDEATION | CANCELLED | IT_MANAGER+ | Justificativa |
| UNDER_EVALUATION | APPROVED | IT_MANAGER + Sponsor | Business case aprovado |
| UNDER_EVALUATION | REJECTED | IT_MANAGER+ | Motivo obrigatório |
| UNDER_EVALUATION | CANCELLED | IT_MANAGER+ | Justificativa |
| APPROVED | PLANNING | PM | Orçamento confirmado |
| PLANNING | EXECUTION | IT_MANAGER+ (PMO aprova plano) | Plano completo + kick-off realizado |
| EXECUTION | TESTING | PM | Entregas principais concluídas |
| EXECUTION | ON_HOLD | IT_MANAGER+ | Motivo + data retomada |
| TESTING | DEPLOYMENT | PM + Stakeholders (aceite homologação) | Homologação aprovada |
| TESTING | EXECUTION | PM | Retrabalho necessário |
| DEPLOYMENT | CLOSED | IT_MANAGER + Sponsor | Marcos concluídos + Lições aprendidas |
| ON_HOLD | (status anterior) | IT_MANAGER+ | Decisão de retomada |
| Qualquer (exceto CLOSED) | CANCELLED | IT_MANAGER+ | Justificativa + liberação orçamentária |

### 6.3 Health Status — Indicador de Saúde do Projeto

O `ProjectHealthJob` executa diariamente às 07h00 e calcula o health_status automaticamente:

| Health Status | Cor | Condições |
|:------------:|:---:|-----------|
| **GREEN** | 🟢 | No prazo (≤ 5% de atraso) E dentro do orçamento (≤ 10% de estouro) |
| **YELLOW** | 🟡 | Atraso de 6–20% OU estouro orçamentário de 11–20% OU marco atrasado |
| **RED** | 🔴 | Atraso > 20% OU estouro orçamentário > 20% OU dois marcos consecutivos atrasados |

**Referência:** BR-PRJ-003

---

## 7. Gestão de Demandas

### 7.1 Conceito de Demanda

Uma **Demanda** é a expressão de uma necessidade estratégica ainda não estruturada como projeto. Antes de se tornar projeto, uma demanda passa por análise de viabilidade e priorização pelo PMO e IT_MANAGER.

### 7.2 Origens de Demanda de Projeto

| Origem | Módulo de Origem | Gatilho | Fluxo |
|:------:|:----------------:|---------|-------|
| **Demanda Estratégica** | Manual (pelo PMO) | Decisão da Diretoria ou necessidade estratégica | PMO registra → avaliação → aprovação |
| **Compliance** | Módulo Compliance | Apontamento NC com plano de ação > R$10k ou > 80h | Botão "Criar Projeto" na página do apontamento |
| **Problema ITIL** | Módulo Problemas | Problema com solução > R$10k ou > 80h | Botão "Criar Projeto" na página do problema |
| **Requisição de Serviço** | Módulo Requisições | Requisição que identifica necessidade de novo serviço | IT_MANAGER converte manualmente |
| **Inovação / Demanda Interna** | — | Proposta de novo produto ou serviço de TI | Qualquer IT_MANAGER+ propõe |
| **Regulação** | — | Exigência de novo órgão regulador | COMPLIANCE_OFFICER registra |

### 7.3 Campos da Demanda (ProjectDemand)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| **Código** | String (sequencial) | Automático | `DEM-YYYY-NNNN`. |
| **Título** | String (300) | Sim | Resumo da necessidade. |
| **Descrição** | Texto | Sim | Contextualização completa da necessidade. |
| **Origem** | Enum | Sim | Tipo de origem (tabela acima). |
| **Prioridade** | Enum | Sim | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`. |
| **Valor de Negócio** | Enum | Não | `LOW`, `MEDIUM`, `HIGH`. Avaliação qualitativa do retorno esperado. |
| **Urgência** | Enum | Sim | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`. |
| **Responsável pela Análise** | FK — User | Sim | PMO ou IT_MANAGER designado. |
| **Status** | Enum | Sim | `NEW`, `UNDER_ANALYSIS`, `APPROVED_FOR_PROJECT`, `REJECTED`, `DEFERRED`. |
| **Projeto Gerado** | FK — Project | Automático | Preenchido ao criar projeto a partir da demanda. |

### 7.4 Processo de Triagem e Priorização de Demandas

```
TRIAGEM DE DEMANDA PELO PMO

Nova demanda registrada:
  │
  ▼
PMO analisa (status: UNDER_ANALYSIS):
  1. É tecnicamente viável? (sim/não)
  2. Qual o alinhamento estratégico? (1–5)
  3. Qual o esforço estimado? (P/M/G)
  4. Qual o risco de não fazer? (baixo/médio/alto)
  5. Há dependências com outras iniciativas?
  │
  ├── Viável + Alta prioridade → APPROVED_FOR_PROJECT
  │   → Criar projeto formal
  │
  ├── Viável + Baixa prioridade → DEFERRED
  │   → Mantida no backlog de projetos
  │
  └── Inviável / Fora de escopo → REJECTED
      → Motivo documentado + alternativa sugerida
```

---

## 8. Planejamento do Projeto

### 8.1 Componentes do Plano do Projeto

| Componente | Status | Responsável | Aprovação |
|:----------:|:------:|:-----------:|:---------:|
| **Termo de Abertura** | Obrigatório para APPROVED | PM + Sponsor | IT_MANAGER |
| **Declaração de Escopo** | Obrigatório para PLANNING→EXECUTION | PM | IT_MANAGER + PMO |
| **Cronograma** | Obrigatório para PLANNING→EXECUTION | PM | IT_MANAGER |
| **Plano de Custos** | Obrigatório para PLANNING→EXECUTION | PM + FINANCIAL_ANALYST | IT_MANAGER |
| **Plano de Riscos** | Obrigatório para EXECUTION | PM | IT_MANAGER |
| **Plano de Comunicação** | Recomendado | PM | — |
| **Plano de Qualidade** | Recomendado | PM | — |
| **Plano de Stakeholders** | Recomendado | PM | — |

### 8.2 Declaração de Escopo

A declaração de escopo deve conter:

| Seção | Conteúdo |
|:-----:|---------|
| **Objetivo do Projeto** | Resultado final esperado e critérios de sucesso mensuráveis |
| **Entregas do Projeto** | Lista de entregáveis formais com critérios de aceite |
| **Requisitos das Entregas** | Critérios mínimos que cada entregável deve atender |
| **Exclusões de Escopo** | O que explicitamente não está no escopo do projeto |
| **Premissas** | Condições assumidas como verdadeiras para o planejamento |
| **Restrições** | Limitações conhecidas (orçamento, prazo, recursos) |
| **Critérios de Aceite** | Como o cliente/Sponsor validará cada entrega |

### 8.3 Business Case

O business case é um documento obrigatório para projetos com orçamento total > R$50.000 ou prazo > 6 meses. Deve conter:

- Problema ou oportunidade que justifica o projeto.
- Alternativas avaliadas e por que o projeto é a melhor opção.
- Benefícios esperados (quantificados quando possível).
- Estimativa de custos e prazo.
- Riscos principais.
- Recomendação de aprovação ou rejeição.

---

## 9. Cronograma

### 9.1 Estrutura de Atividade (ProjectTask)

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **id** | UUID | Automático | Não | Identificador único |
| **Projeto** | FK — Project | Sim | Não | Projeto pai |
| **Código WBS** | String (20) | Sim | PM | Código da Estrutura Analítica do Projeto. Ex.: `1.1.2`, `2.3`. |
| **Título** | String (300) | Sim | PM, Responsável | Nome descritivo da atividade |
| **Tipo** | Enum | Sim | PM | `TASK` (tarefa), `MILESTONE` (marco), `PHASE` (fase), `DELIVERABLE` (entrega) |
| **Descrição** | Texto | Não | PM, Responsável | Detalhamento do que deve ser feito |
| **Responsável** | FK — User | Sim | PM | Membro da equipe que executará |
| **Data de Início Planejada** | Date | Sim | PM | Início previsto |
| **Data de Fim Planejada** | Date | Sim | PM | Término previsto |
| **Data de Início Real** | Date | Automático | Responsável | Preenchida ao iniciar |
| **Data de Fim Real** | Date | Automático | Responsável | Preenchida ao concluir |
| **Dependências** | Array FK — ProjectTask | Não | PM | Tarefas que devem ser concluídas antes desta |
| **Status** | Enum | Sim | Responsável, PM | `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `OVERDUE` |
| **% Conclusão** | Inteiro (0–100) | Não | Responsável | Percentual informado pelo responsável |
| **Esforço Estimado** | Decimal (horas) | Não | PM | Horas estimadas para execução |
| **Esforço Real** | Decimal (horas) | Não | Responsável | Horas efetivamente gastas |
| **Custo Estimado** | Decimal (15,2) | Não | PM | Custo previsto para a atividade |
| **Custo Real** | Decimal (15,2) | Não | Responsável | Custo efetivo |
| **Prioridade** | Enum | Não | PM | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| **Observações** | Texto | Não | Responsável | Notas, impedimentos, contexto |

### 9.2 Acompanhamento do Cronograma

A visão de cronograma do projeto exibe:

- **Gráfico de Gantt simplificado:** barras de duração por atividade com código de cor por status.
- **Caminho crítico:** atividades sem folga que impactam diretamente o prazo do projeto.
- **Variância de prazo:** diferença em dias entre planejado e real por atividade.
- **Progresso geral:** % de conclusão calculado com base nas atividades concluídas vs. total.

### 9.3 Atualização de Progresso

O responsável pela atividade pode atualizar diretamente:
- Status da atividade.
- % de conclusão.
- Esforço real (horas trabalhadas).
- Data de início real (ao iniciar) e data de fim real (ao concluir).
- Observações e impedimentos.

**Ao marcar como COMPLETED:** data de fim real é preenchida automaticamente pelo servidor com `NOW()`. O PM é notificado.

---

## 10. Marcos — Milestones

### 10.1 Conceito de Marco

Um **Marco (Milestone)** é um ponto de controle significativo no cronograma do projeto, com duração zero, que representa a conclusão de uma fase, entrega ou evento importante. Marcos são usados para comunicar o progresso a stakeholders e para verificar se o projeto está no caminho certo.

### 10.2 Tipos de Marco

| Tipo | Descrição | Exemplos |
|:----:|-----------|---------|
| **Início de Fase** | Marca o início formal de uma fase | "Kick-off do Projeto", "Início da Execução" |
| **Entrega** | Representa a conclusão de uma entrega formal | "Entrega do Documento de Arquitetura" |
| **Aprovação** | Requer aprovação explícita de stakeholder | "Aprovação do Escopo pelo Sponsor" |
| **Go-live** | Entrada em produção de um sistema ou serviço | "Go-live do ERP Módulo Financeiro" |
| **Revisão de Fase** | Ponto de gate/go-no-go entre fases | "Phase Gate: PLANNING → EXECUTION" |
| **Encerramento** | Encerramento formal do projeto | "Entrega das Lições Aprendidas" |

### 10.3 Campos do Marco

Marcos usam a mesma estrutura de `ProjectTask` com `type = MILESTONE`, acrescida de:

| Campo Extra | Tipo | Descrição |
|:-----------:|:----:|-----------|
| **Aprovadores** | Array FK — User | Quem deve assinar o aceite do marco. |
| **Critério de Conclusão** | Texto | Condição objetiva para considerar o marco cumprido. |
| **Bloqueante para Conclusão** | Boolean | `true` se marcos não concluídos impedem o fechamento do projeto. |

### 10.4 Impacto dos Marcos no Health Status

- Marco com prazo vencido e status ≠ COMPLETED → health_status → YELLOW.
- Dois marcos consecutivos atrasados → health_status → RED.
- Marco bloqueante não concluído → encerramento do projeto bloqueado.

**Referência:** BR-PRJ-007

---

## 11. Gestão de Recursos

### 11.1 Tipos de Recurso do Projeto

| Tipo | Descrição | Como Registrar no SGTI |
|:----:|-----------|:---------------------:|
| **Pessoas** | Membros da equipe alocados ao projeto | Campo "Equipe do Projeto" + responsável por atividade |
| **Equipamentos** | Hardware alocado para uso no projeto | Ativo vinculado ao projeto no módulo de Ativos |
| **Softwares / Licenças** | Ferramentas utilizadas no projeto | Licença vinculada ao projeto + lançamento OPEX |
| **Serviços** | Consultorias e serviços contratados para o projeto | Compra vinculada ao projeto no módulo de Compras |
| **Infraestrutura** | VMs, ambientes cloud, storage para o projeto | Ativo ou lançamento CAPEX vinculado |

### 11.2 Alocação de Pessoas

Para cada membro da equipe do projeto, o PM pode registrar:

| Campo | Tipo | Descrição |
|-------|:----:|-----------|
| **Papel no Projeto** | String | Ex.: Líder Técnico, Analista Funcional, Testador |
| **Percentual de Alocação** | Inteiro (0–100%) | % da jornada dedicada ao projeto |
| **Período de Alocação** | Date início → fim | Período de participação |
| **Atividades Atribuídas** | List FK — Task | Atividades do cronograma sob responsabilidade |

### 11.3 Conflito de Recursos

O sistema detecta e alerta quando:
- Um membro da equipe está alocado em mais de um projeto com sobreposição de período.
- A soma de % de alocação de um usuário ultrapassa 100% em qualquer semana.
- Uma atividade está atribuída a membro não listado na equipe do projeto.

---

## 12. Gestão Financeira do Projeto

### 12.1 Estrutura Financeira do Projeto

O projeto tem orçamento próprio, composto de:

| Componente | Tipo | Descrição |
|:----------:|:----:|-----------|
| **CAPEX Aprovado** | Investimento | Hardware, infraestrutura, desenvolvimento capitalizável |
| **OPEX Aprovado** | Despesa | Serviços, licenças temporárias, consultoria |
| **Reserva de Contingência** | % do total | Buffer para riscos (recomendado: 10–20% do total) |
| **Total Aprovado** | Calculado | CAPEX + OPEX + Reserva |

### 12.2 Eventos Financeiros do Projeto

| Evento | Ação no Módulo Financeiro |
|:------:|:------------------------:|
| Projeto APPROVED | Reserva orçamentária criada: `Budget.committed_amount += total_aprovado` |
| Lançamento vinculado ao projeto | `Budget.committed_amount` reduzido; `spent_amount` aumentado |
| Projeto CANCELLED | Reserva liberada: `Budget.committed_amount -= saldo_não_utilizado` |
| Projeto CLOSED | Relatório financeiro final gerado automaticamente |

**Referência:** BR-PRJ-005

### 12.3 Controle de Variância de Custo

| Situação | Alerta |
|----------|--------|
| Realizado > 80% do aprovado | Alerta ao PM e PROJECT_MANAGER |
| Realizado > 100% (qualquer valor) | Alerta urgente ao IT_MANAGER |
| Realizado > 110% | IT_MANAGER deve aprovar extensão de orçamento antes de novos lançamentos |

**Referência:** BR-PRJ-004

---

## 13. Gestão de Riscos do Projeto

### 13.1 Estrutura do Risco do Projeto (ProjectRisk)

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **id** | UUID | Automático | Não | Identificador único |
| **Código** | String (sequencial) | Automático | Não | `RSK-NNNN` dentro do projeto. |
| **Descrição** | Texto | Sim | PM | Cenário de risco: o que pode dar errado e por quê. |
| **Categoria** | Enum | Sim | PM | `TECHNICAL`, `FINANCIAL`, `SCHEDULE`, `RESOURCE`, `SCOPE`, `REGULATORY`, `VENDOR`, `OTHER`. |
| **Probabilidade** | Enum | Sim | PM | `VERY_LOW` (1), `LOW` (2), `MEDIUM` (3), `HIGH` (4), `VERY_HIGH` (5). |
| **Impacto** | Enum | Sim | PM | `VERY_LOW` (1), `LOW` (2), `MEDIUM` (3), `HIGH` (4), `VERY_HIGH` (5). |
| **Nível de Risco** | Enum — calculado | Automático | PM (override) | Probabilidade × Impacto → `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`. |
| **Estratégia de Resposta** | Enum | Sim | PM | `AVOID`, `MITIGATE`, `TRANSFER`, `ACCEPT`. |
| **Plano de Mitigação** | Texto | Condicional | PM | Obrigatório para estratégias AVOID e MITIGATE. |
| **Plano de Contingência** | Texto | Não | PM | O que fazer SE o risco se materializar. |
| **Responsável** | FK — User | Sim | PM | Membro da equipe responsável pelo monitoramento. |
| **Gatilho do Risco** | Texto | Não | PM | Condição ou evento que indica que o risco está se materializando. |
| **Status** | Enum | Sim | PM | `IDENTIFIED`, `MONITORING`, `MATERIALIZED`, `MITIGATED`, `ACCEPTED`, `CLOSED`. |
| **Data de Identificação** | Date | Automático | Não | Data de criação do registro. |
| **Data da Próxima Revisão** | Date | Sim | PM | Padrão: 30 dias. |

### 13.2 Matriz de Risco do Projeto

A mesma matriz 5×5 do módulo de Compliance é utilizada (ver seção 13.3 de `45_COMPLIANCE.md`), adaptada para o contexto de projetos com as categorias acima.

### 13.3 Monitoramento de Riscos

- O PM deve atualizar os riscos pelo menos quinzenalmente.
- Risco com `next_review_date` vencida gera alerta ao PM.
- Risco materializado exige criação de item de ação no cronograma para tratativa.
- Todo projeto ativo deve ter ao menos 1 risco registrado (mesmo que nível LOW).

---

## 14. Gestão de Stakeholders

### 14.1 Cadastro de Stakeholder do Projeto (ProjectStakeholder)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| **Stakeholder** | FK — User ou texto livre (externo) | Sim | Pessoa ou entidade interessada no projeto. |
| **Tipo** | Enum | Sim | `INTERNAL` (colaborador), `EXTERNAL` (fornecedor, regulador, cliente). |
| **Papel no Projeto** | String | Sim | Ex.: "Usuário Final", "Aprovador Técnico", "Regulador", "Patrocinador". |
| **Nível de Influência** | Enum | Sim | `LOW`, `MEDIUM`, `HIGH`. Quanto pode impactar o projeto. |
| **Nível de Interesse** | Enum | Sim | `LOW`, `MEDIUM`, `HIGH`. Grau de interesse no resultado. |
| **Estratégia de Engajamento** | Texto | Não | Como e com que frequência manter engajado. |
| **Expectativas** | Texto | Não | O que o stakeholder espera do projeto. |
| **Preocupações** | Texto | Não | Riscos ou resistências identificadas. |

### 14.2 Classificação de Stakeholders

```
MAPA DE STAKEHOLDERS

     Alto Interesse
           │
  Gerencie │ Mantenha
  de Perto │ Satisfeito
────────────┼────────────── Alta Influência
  Monitore  │ Mantenha
            │ Informado
           │
     Baixo Interesse
```

---

## 15. Gestão de Mudanças

### 15.1 Conceito de Mudança no Projeto

Uma **Mudança no Projeto** é qualquer alteração formal nos parâmetros acordados de escopo, prazo ou custo que ocorre após o baseline do plano ter sido aprovado.

### 15.2 Tipos de Mudança

| Tipo | Descrição | Aprovação Necessária |
|:----:|-----------|:--------------------:|
| **Mudança de Escopo** | Adição, remoção ou alteração de entregáveis | IT_MANAGER + Sponsor |
| **Mudança de Prazo** | Extensão ou antecipação da data de fim | IT_MANAGER |
| **Mudança de Custo** | Aumento ou redução do orçamento aprovado | IT_MANAGER + FINANCIAL_ANALYST |
| **Mudança Combinada** | Impacta dois ou mais parâmetros simultaneamente | IT_MANAGER + Sponsor + FINANCIAL_ANALYST |

### 15.3 Campos do Registro de Mudança (ChangeRequest)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| **id** | UUID | Automático | Identificador único |
| **Código** | String | Automático | `CR-NNNN` dentro do projeto |
| **Tipo** | Enum | Sim | Tipo de mudança (tabela acima) |
| **Justificativa** | Texto | Sim | Por que a mudança é necessária. Mín. 50 chars. |
| **Descrição da Mudança** | Texto | Sim | O que está sendo alterado e como. |
| **Impacto no Escopo** | Texto | Condicional | Descrição do novo escopo proposto. |
| **Impacto no Prazo** | Inteiro (dias) | Condicional | Dias adicionais (+ extensão / - antecipação). |
| **Impacto no Custo** | Decimal (15,2) | Condicional | Valor adicional (+ aumento / - redução). |
| **Solicitado Por** | FK — User | Automático | Quem solicitou a mudança. |
| **Status** | Enum | Sim | `SUBMITTED`, `UNDER_ANALYSIS`, `APPROVED`, `REJECTED`, `IMPLEMENTED`. |
| **Aprovado Por** | FK — User | Automático | Quem aprovou. |
| **Data de Implementação** | Date | Condicional | Quando a mudança foi efetivada. |

### 15.4 Processo de Aprovação de Mudança

```
CHANGE CONTROL PROCESS

PM registra solicitação de mudança (CR):
  │
  ├── IT_MANAGER analisa (UNDER_ANALYSIS):
  │   Avaliação de impacto completo
  │   │
  │   ├── Mudança de custo? → FINANCIAL_ANALYST valida orçamento
  │   ├── Mudança de escopo? → Sponsor deve aprovar
  │   └── Impacto regulatório? → Compliance consulta
  │
  ├── Aprovada:
  │   → Baseline do plano atualizado (nova versão)
  │   → Versão anterior preservada no histórico
  │   → Cronograma e orçamento ajustados
  │   → Stakeholders notificados
  │
  └── Rejeitada:
      → Motivo documentado
      → PM e solicitante notificados
```

**Toda mudança de escopo é auditada e o baseline anterior preservado.**
**Referência:** BR-PRJ (seção 29)

---

## 16. Integração com Compliance

### 16.1 Transformar Apontamento em Projeto

Quando a tratativa de um apontamento de compliance requer esforço > 80h ou custo > R$10k:

```
Na página do apontamento (módulo Compliance):
  Botão "Transformar em Projeto"
  → Sistema pré-preenche:
     nome: "Compliance: {título_do_apontamento}"
     tipo: COMPLIANCE
     origem: COMPLIANCE
     apontamento_id: finding_id
     objetivo: análise de causa raiz + descrição da correção
     sponsor: Compliance Officer ou IT_MANAGER

Projeto criado com status IDEATION.
Rastreabilidade bidirecional: Apontamento → Projeto / Projeto → Apontamento.
```

### 16.2 Rastreabilidade Compliance ↔ Projeto

| No Apontamento | No Projeto |
|:--------------:|:----------:|
| Link para o projeto vinculado | Origem = COMPLIANCE + link para apontamento |
| Status do projeto visível | Apontamento exibido como origem do projeto |
| Conclusão do projeto avança apontamento para IN_VALIDATION | Encerramento do projeto documenta solução implementada |

---

## 17. Integração com Problemas

### 17.1 Transformar Problema em Projeto

Para soluções definitivas de problemas ITIL que requerem projeto formal:

```
Na página do Problema (módulo Problemas):
  Botão "Criar Projeto para Solução Definitiva"
  → Sistema pré-preenche:
     nome: "Solução: {título_do_problema}"
     tipo: SYSTEMS ou INFRASTRUCTURE (conforme categoria)
     origem: PROBLEM
     problem_id: problem.id
     objetivo: solução definitiva + análise de causa raiz

Rastreabilidade: Problema vincula project_id → Projeto exibe problem_id.
Ao fechar o projeto: Problema avança para RESOLVED automaticamente.
```

---

## 18. Integração com Compras

### 18.1 Compras Vinculadas ao Projeto

Toda aquisição para o projeto segue o fluxo padrão do módulo de Compras, com o campo `project_id` preenchido:

- O custo da compra é debitado do orçamento do projeto (CAPEX ou OPEX).
- O projeto exibe todas as compras vinculadas na aba "Aquisições".
- O saldo disponível do projeto é atualizado em tempo real.

### 18.2 Visibilidade de Compras no Projeto

| Campo Exibido | Origem |
|:-------------:|:------:|
| Lista de POs vinculados | Módulo Compras |
| Total comprado OPEX/CAPEX | Calculado |
| Compras em andamento (pedido emitido) | Módulo Compras |
| Compras pendentes de aprovação | Módulo Compras |

---

## 19. Integração com Ativos

### 19.1 Ativos Vinculados ao Projeto

Ativos utilizados ou adquiridos para o projeto são vinculados via campo `project_id` no registro do ativo:

- Equipamentos reservados para o projeto ficam com status ALLOCATED e responsável = projeto.
- Ao encerrar o projeto: ativos transferidos para o inventário geral ou para o usuário final.
- CAPEX de ativos do projeto debitado do orçamento do projeto.

### 19.2 Inventário de Ativos do Projeto

A aba "Ativos" no projeto lista:
- Equipamentos alocados para uso no projeto.
- Equipamentos adquiridos durante o projeto.
- Status atual de cada ativo.
- Destino pós-projeto (usuário final ou estoque).

---

## 20. Integração com Base de Conhecimento

### 20.1 Geração de Artigo de Lições Aprendidas

Ao encerrar o projeto, o sistema sugere a criação de artigo na Base de Conhecimento:

```
Projeto CLOSED → Sistema pergunta ao PM:
  "Deseja documentar as lições aprendidas na Base de Conhecimento?"
  → Confirmar: cria rascunho DRAFT_AI com:
     título: "Lições Aprendidas: {nome_do_projeto}"
     conteúdo: resumo das lições aprendidas registradas
     categoria: Projetos
     audiência: TECHNICAL
  → PM revisa e submete para publicação
```

### 20.2 Artigos Técnicos de Entregáveis

Durante a execução, o PM ou membros da equipe podem criar artigos técnicos documentando:
- Arquitetura implementada.
- Decisões técnicas e suas justificativas.
- Procedimentos de instalação e configuração.
- Runbooks operacionais das soluções entregues.

---

## 21. Gestão de Lições Aprendidas

### 21.1 Conceito

**Lições Aprendidas** são registros formais de conhecimento obtido durante a execução do projeto — tanto sucessos (o que funcionou bem e deve ser repetido) quanto problemas (o que não funcionou e deve ser evitado).

### 21.2 Campos da Lição Aprendida (LessonLearned)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| **id** | UUID | Automático | Identificador único |
| **Projeto** | FK — Project | Sim | Projeto ao qual a lição pertence |
| **Título** | String (300) | Sim | Resumo da lição. |
| **Categoria** | Enum | Sim | `PLANNING`, `EXECUTION`, `TEAM`, `TECHNOLOGY`, `VENDOR`, `PROCESS`, `COMMUNICATION`, `OTHER`. |
| **Tipo** | Enum | Sim | `SUCCESS` (o que funcionou bem) ou `IMPROVEMENT` (o que pode melhorar). |
| **Situação** | Texto longo | Sim | O que aconteceu? Contexto completo da situação. |
| **Solução Adotada** | Texto longo | Sim | O que foi feito para resolver (ou o que funcionou). |
| **Recomendações** | Texto longo | Sim | O que outros projetos devem fazer ou evitar com base nesta lição. |
| **Fase do Projeto** | Enum | Não | Em qual fase do ciclo de vida ocorreu. |
| **Impacto** | Enum | Sim | `LOW`, `MEDIUM`, `HIGH`. Quão relevante é esta lição para projetos futuros. |
| **Registrado Por** | FK — User | Automático | Membro da equipe que registrou. |
| **Artigo KB Gerado** | FK — KnowledgeArticle | Automático | Artigo criado a partir desta lição. |

### 21.3 Processo de Coleta de Lições Aprendidas

O PM deve coletar lições aprendidas em dois momentos obrigatórios:

1. **Durante a execução:** ao concluir cada fase, registrar ao menos 1 lição.
2. **No encerramento:** sessão formal de retrospectiva com a equipe antes de fechar o projeto.

**Regra:** Projeto não pode ter status alterado para CLOSED sem ao menos 1 lição aprendida registrada.

---

## 22. Dashboards Operacionais

### 22.1 Painel Operacional de Projetos

**Destino:** PM, Analistas, Coordenadores, IT_MANAGER. Atualizado em tempo real.

| Componente | Dados Exibidos |
|------------|---------------|
| **Projetos Ativos** | Contadores por status: PLANNING / EXECUTION / TESTING / DEPLOYMENT |
| **Projetos Atrasados** | Lista de projetos com health_status YELLOW ou RED |
| **Minha Fila de Tarefas** | Atividades atribuídas ao usuário logado com prazo e status |
| **Marcos Pendentes (7 dias)** | Marcos vencendo em ≤ 7 dias com status ≠ COMPLETED |
| **Projetos Concluídos (mês)** | Contador de projetos fechados no mês |
| **Demandas em Avaliação** | Demandas com status UNDER_ANALYSIS aguardando decisão |
| **Solicitações de Mudança Pendentes** | CRs com status UNDER_ANALYSIS aguardando aprovação |
| **Riscos Críticos Ativos** | Riscos com nível CRITICAL e status ≠ CLOSED |

### 22.2 Indicadores Operacionais

| KPI | Fórmula | Meta |
|-----|---------|:----:|
| **Projetos Ativos** | COUNT(status IN PLANNING, EXECUTION, TESTING, DEPLOYMENT) | — |
| **Projetos Atrasados** | COUNT(health_status IN YELLOW, RED) | ≤ 20% do portfólio |
| **Projetos Concluídos no Prazo** | COUNT(fechados sem extensão) / COUNT(fechados) × 100 | ≥ 70% |
| **Marcos Vencidos** | COUNT(MILESTONE.status = OVERDUE) | 0 |
| **Riscos Sem Revisão** | COUNT(next_review_date < hoje) | 0 |

---

## 23. Dashboards Executivos

### 23.1 Painel Executivo de Projetos

**Destino:** IT_MANAGER, Sponsor, Diretoria.

| Indicador | Composição | Objetivo |
|:----------:|-----------|---------|
| **Investimento por Projeto** | CAPEX + OPEX realizado por projeto | Controle de alocação de recursos |
| **CAPEX por Projeto** | SUM(CapexInvestment) por projeto | Tracking de investimentos |
| **OPEX por Projeto** | SUM(OpexExpense) por projeto | Tracking de despesas |
| **Projetos por Área** | Distribuição por departamento beneficiário | Demanda por área de negócio |
| **ROI Estimado** | Benefícios esperados / Custo total × 100 | Valor gerado pelos projetos |
| **Projetos Estratégicos** | Lista de projetos com `strategic = true` e seu status | Alinhamento estratégico |
| **Tendência Anual** | Volume de projetos abertos vs. fechados por mês (12 meses) | Capacidade de execução |
| **Portfólio Health** | Distribuição de projetos por health_status | Saúde geral do portfólio |
| **Orçado vs. Realizado** | Comparativo por projeto e total do portfólio | Aderência orçamentária |
| **Benefícios Realizados** | SUM(benefício_realizado) / SUM(benefício_esperado) × 100 | Efetividade do portfólio |

### 23.2 Gráficos Executivos

| Gráfico | Tipo | Objetivo |
|---------|:----:|---------|
| Distribuição de projetos por health_status | Pizza | Saúde geral do portfólio |
| Evolução de projetos abertos/fechados (12 meses) | Linha | Capacidade e throughput |
| Orçado vs. realizado por projeto | Barras agrupadas | Variância financeira |
| Investimento por tipo de projeto | Pizza | Onde está o dinheiro |
| ROI por projeto | Barras horizontais | Valor gerado |

---

## 24. Relatórios

### 24.1 Relatórios Operacionais Automáticos

| Relatório | Geração | Destinatário | Conteúdo |
|-----------|:-------:|:------------:|---------|
| **Status Semanal do Portfólio** | Semanal (seg) | IT_MANAGER + PMs | Projetos ativos, health_status, marcos da semana |
| **Marcos da Semana** | Semanal (seg) | PMs + Responsáveis | Marcos vencendo em 7 dias |
| **Projetos Atrasados** | Diária | IT_MANAGER | Projetos YELLOW/RED com detalhes |
| **Riscos Não Revisados** | Semanal | PMs | Riscos com revisão vencida |

### 24.2 Relatórios Gerenciais

| Relatório | Frequência | Destinatário | Conteúdo |
|-----------|:----------:|:------------:|---------|
| **Progresso do Projeto** | Por projeto (mensal) | PM + IT_MANAGER + Sponsor | Cronograma, custo, riscos, mudanças |
| **Financeiro do Projeto** | Mensal | IT_MANAGER + FINANCIAL_ANALYST | OPEX/CAPEX previsto vs. realizado por projeto |
| **Portfólio de Demandas** | Mensal | IT_MANAGER + PMO | Demandas em avaliação + backlog |
| **Performance de Entrega** | Trimestral | IT_MANAGER | Taxa de projetos no prazo e no orçamento |

### 24.3 Relatórios Executivos

| Relatório | Frequência | Destinatário | Conteúdo |
|-----------|:----------:|:------------:|---------|
| **Panorama do Portfólio de TI** | Trimestral | Diretoria + IT_MANAGER | Investimentos, ROI, saúde, projetos estratégicos |
| **Benefícios Realizados** | Semestral | Diretoria + Sponsor | Benefícios esperados vs. realizados por projeto |
| **Capacidade vs. Demanda** | Trimestral | IT_MANAGER + PMO | Backlog de demandas vs. capacidade da equipe |

---

## 25. Auditoria e Rastreabilidade

### 25.1 Eventos Auditados Obrigatoriamente

| Evento | `action` | Dados Capturados |
|--------|:--------:|:----------------:|
| Projeto criado | CREATE | Todos os campos iniciais |
| Status alterado | UPDATE | Status anterior + novo + executado_por |
| Sponsor ou PM alterado | UPDATE | Anterior + novo + motivo |
| Orçamento alterado | UPDATE | Valores anteriores + novos + motivo |
| Atividade criada/alterada | CREATE/UPDATE | Campos alterados |
| Marco concluído | UPDATE | Concluído_por + data_real |
| Lição aprendida registrada | CREATE | Todos os campos |
| Risco registrado/alterado | CREATE/UPDATE | Campos relevantes |
| Mudança de escopo aprovada | CREATE | CR completo + aprovador + versão anterior |
| Custos registrados/alterados | CREATE/UPDATE | Origem (PO, lançamento direto) + valor |
| Projeto cancelado | UPDATE | Cancelado_por + motivo + recursos liberados |
| Projeto suspenso | UPDATE | Suspenso_por + motivo + data_retomada |
| Projeto encerrado | UPDATE | Encerrado_por + lições aprendidas + benefícios |
| Demanda criada | CREATE | Todos os campos |
| Demanda transformada em projeto | UPDATE | demand_id + project_id |

### 25.2 Versionamento de Baselines

Toda mudança aprovada (mudança de escopo, prazo ou custo) cria uma nova versão do plano do projeto:

| Campo | Versão 1 (Baseline) | Versão 2 (após mudança) |
|-------|:-------------------:|:-----------------------:|
| Data de Fim | 15/09/2026 | 30/10/2026 (+45 dias) |
| Orçamento Total | R$ 150.000 | R$ 165.000 (+R$15k) |
| Escopo | "Sistema A + B" | "Sistema A + B + C (incluído CR-0001)" |
| Versão | v1.0 | v2.0 |

Versões anteriores são preservadas e acessíveis para auditoria e análise de variância.

---

## 26. Compliance e Conformidade

### 26.1 Requisitos de Conformidade para Projetos

| Norma | Requisito | Atendimento |
|-------|-----------|:----------:|
| **ITIL v4** | Gestão de Projetos alinhada às práticas de gestão de mudanças | Ciclo de vida estruturado com aprovações formais |
| **ISO 21500:2021** | Gestão de Projetos — Diretrizes | Estrutura de projeto alinhada ao framework |
| **LGPD** | Projetos que envolvem dados pessoais devem ter RIPD | Campo de conformidade LGPD no projeto + evidência |
| **ISO 27001** | A.6.1.5 — Segurança da Informação em gerenciamento de projetos | Riscos de segurança considerados no plano de riscos |
| **BACEN** | Projetos de transformação digital em fintechs comunicados | Etapa de comunicação ao regulador em projetos regulatórios |

### 26.2 Projetos com Impacto em Dados Pessoais (LGPD)

Projetos que envolvam tratamento de dados pessoais devem ter:

1. Campo "Envolve Dados Pessoais" = true no cadastro do projeto.
2. RIPD (Relatório de Impacto à Proteção de Dados) vinculado como evidência.
3. Aprovação do DPO/Compliance Officer antes da implantação.
4. Registro em `compliance.ComplianceFinding` como evidência de conformidade.

---

## 27. Gestão de Benefícios

### 27.1 Conceito

**Gestão de Benefícios** é o processo de identificar, planejar, executar, avaliar e confirmar os benefícios que o projeto deveria entregar, garantindo que o valor prometido seja efetivamente realizado pela organização.

### 27.2 Campos do Benefício (ProjectBenefit)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| **id** | UUID | Automático | Identificador único |
| **Descrição do Benefício** | Texto | Sim | Descrição clara do benefício esperado. |
| **Tipo** | Enum | Sim | `FINANCIAL` (economia), `EFFICIENCY` (produtividade), `RISK_REDUCTION`, `COMPLIANCE`, `QUALITY`, `INNOVATION`. |
| **Benefício Esperado** | Texto + Métrica | Sim | Ex.: "Redução de 30% no tempo de resolução de incidentes" |
| **Valor Financeiro Esperado** | Decimal (15,2) | Não | Estimativa de economia ou ganho em R$ por ano. |
| **Prazo para Realização** | Date | Sim | Quando o benefício deverá ser mensurável pós-encerramento. |
| **Responsável pela Medição** | FK — User | Sim | Quem medirá o benefício realizado. |
| **Benefício Realizado** | Texto + Métrica | Condicional | Preenchido após a medição (prazo = `realização_date`). |
| **Valor Financeiro Realizado** | Decimal (15,2) | Não | Valor efetivamente economizado ou ganho. |
| **Data da Medição** | Date | Automático | Quando foi realizada a medição. |
| **Status** | Enum | Sim | `PLANNED`, `PENDING_MEASUREMENT`, `REALIZED`, `NOT_REALIZED`, `PARTIALLY_REALIZED`. |

### 27.3 Ciclo de Medição de Benefícios

```
Projeto CLOSED:
  → Para cada benefício registrado:
     Status: PLANNED → PENDING_MEASUREMENT
     Responsável pela medição notificado com prazo

Em data de prazo de realização:
  → Alerta ao responsável + PM + IT_MANAGER
  → Responsável registra o benefício realizado

Após medição:
  → Status atualizado: REALIZED / PARTIALLY_REALIZED / NOT_REALIZED
  → Dashboard executivo atualizado com ROI realizado vs. esperado
```

---

## 28. Indicadores do Projeto

### 28.1 Indicadores de Prazo (Schedule Performance)

| Indicador | Fórmula | Interpretação |
|:----------:|---------|:-------------:|
| **% Conclusão** | Atividades concluídas / Total de atividades × 100 | Avanço físico do projeto |
| **Variância de Prazo (VP)** | Data fim planejada − Data fim real (ou atual) | Positivo = no prazo; negativo = atrasado |
| **Índice de Desempenho de Prazo (IDP)** | % trabalho concluído / % prazo decorrido | > 1 = adiantado; < 1 = atrasado |

### 28.2 Indicadores de Custo (Cost Performance)

| Indicador | Fórmula | Interpretação |
|:----------:|---------|:-------------:|
| **Variância de Custo (VC)** | Orçamento aprovado − Realizado | Positivo = dentro; negativo = estourou |
| **Índice de Desempenho de Custo (IDC)** | Trabalho realizado (valor) / Custo real | > 1 = eficiente; < 1 = ineficiente |
| **% Orçamento Utilizado** | Realizado / Aprovado × 100 | < 80% ótimo; 80–100% atenção; > 100% alerta |

### 28.3 Indicadores de Escopo

| Indicador | Medição |
|:----------:|---------|
| **Taxa de Mudanças de Escopo** | Número de CRs aprovados / Duração do projeto | Instabilidade de escopo |
| **Entregas Aceitas** | Entregas aprovadas pelos stakeholders / Total planejado × 100 | Qualidade das entregas |

### 28.4 Indicadores de Qualidade

| Indicador | Medição |
|:----------:|---------|
| **Taxa de Defeitos na Homologação** | Defeitos identificados na homologação / Total de itens testados × 100 | Qualidade técnica |
| **Retrabalho** | Atividades refeitas / Total de atividades × 100 | Eficiência do processo |
| **Satisfação dos Stakeholders** | Avaliação formal pós-entrega (1–5) | Qualidade percebida |

---

## 29. Regras de Negócio

---

**PRJ-001** — Sponsor e Gerente de Projeto obrigatórios e distintos
Os campos `sponsor_id` e `manager_id` são obrigatórios. Sponsor e PM devem ser usuários distintos com papéis compatíveis.
**Referência:** BR-PRJ-001

---

**PRJ-002** — Projeto em EXECUTION só a partir de APPROVED com plano aprovado
Status IN_PROGRESS (EXECUTION) só é atingido a partir de APPROVED, com plano do projeto aprovado pelo PMO.
**Referência:** BR-PRJ-002

---

**PRJ-003** — Health status calculado diariamente pelo job
O `ProjectHealthJob` calcula automaticamente o health_status diariamente com base em atraso e estouro orçamentário.
**Referência:** BR-PRJ-003

---

**PRJ-004** — Estouro orçamentário de 110% bloqueia novos lançamentos
Quando o custo realizado supera 110% do orçamento aprovado, novos lançamentos são bloqueados até aprovação de extensão pelo IT_MANAGER.
**Referência:** BR-PRJ-004

---

**PRJ-005** — Cancelamento libera reserva orçamentária automaticamente
Ao cancelar projeto, o evento ProjectCancelled publica a liberação do saldo não utilizado no módulo Financeiro.
**Referência:** BR-PRJ-005

---

**PRJ-006** — CLOSED é estado final; lançamentos bloqueados após encerramento
Após CLOSED, nenhum novo lançamento financeiro pode ser adicionado ao projeto.
**Referência:** BR-PRJ-006

---

**PRJ-007** — Marcos MILESTONE bloqueantes impedem encerramento
Marcos com `blocking = true` e status ≠ COMPLETED bloqueiam a transição para CLOSED.
**Referência:** BR-PRJ-007

---

**PRJ-008** — Todo projeto deve possuir orçamento aprovado
Os campos `capex_budget` e `opex_budget` devem ser definidos antes de avançar para PLANNING. Ao menos um dos dois deve ser > 0.

---

**PRJ-009** — Todo projeto deve possuir centro de custo
O campo `cost_center_id` é obrigatório. Centro de custo deve estar ativo.

---

**PRJ-010** — Todo projeto deve possuir cronograma
Pelo menos uma atividade ou marco deve ser criado antes de avançar do status PLANNING para EXECUTION.

---

**PRJ-011** — Todo projeto encerrado deve possuir lições aprendidas
Transição para CLOSED bloqueada sem ao menos 1 registro de LessonLearned vinculado ao projeto.

---

**PRJ-012** — Todo risco deve possuir responsável
O campo `responsible_id` do risco é obrigatório. Risco sem responsável não pode ser salvo.

---

**PRJ-013** — Toda alteração de escopo deve ser auditada
Mudança de escopo requer registro formal de ChangeRequest (CR) com aprovação do IT_MANAGER + Sponsor. O baseline anterior deve ser preservado.

---

**PRJ-014** — Todo projeto deve possuir status atualizado
O health_status deve refletir a situação real do projeto. PM pode fazer override manual com justificativa obrigatória.

---

**PRJ-015** — Projetos originados por compliance mantêm rastreabilidade
Campo `finding_id` preenchido para projetos de origem COMPLIANCE. A rastreabilidade não pode ser removida.

---

**PRJ-016** — Projetos originados por problema ITIL mantêm rastreabilidade
Campo `problem_id` preenchido para projetos de origem PROBLEM. Encerramento do projeto avança problema para RESOLVED.

---

**PRJ-017** — Código do projeto imutável após criação
O código PRJ-YYYY-NNNN é sequencial, único por tenant e imutável após criação.

---

**PRJ-018** — Suspensão requer motivo e data prevista de retomada
Mudança para ON_HOLD exige `hold_reason` e `expected_resume_date`. Sem esses campos, a suspensão é bloqueada.

---

**PRJ-019** — Projeto suspenso por mais de 90 dias gera alerta de cancelamento
Projeto com status ON_HOLD por mais de 90 dias sem movimentação gera alerta ao IT_MANAGER para decisão de retomar ou cancelar.

---

**PRJ-020** — Business case obrigatório para projetos > R$50k ou > 6 meses
Projetos com `total_budget > R$50.000` ou `duração > 180 dias` exigem business case antes de avançar para APPROVED.

---

**PRJ-021** — Atividade com data de fim menor que data de início: bloqueada
A criação de atividade com `end_date < start_date` é bloqueada pela validação.

---

**PRJ-022** — Atividade concluída: data real de fim preenchida pelo servidor
Ao marcar atividade como COMPLETED, `actual_end_date` é preenchida automaticamente com `NOW()` pelo servidor. Campo imutável após.

---

**PRJ-023** — Dependência circular entre atividades: bloqueada
O sistema valida que não há dependência circular na criação de dependências entre atividades (atividade A depende de B que depende de A).

---

**PRJ-024** — Revisão de riscos quinzenal obrigatória
Riscos com `next_review_date` vencida há mais de 15 dias geram alerta ao PM e ao IT_MANAGER.

---

**PRJ-025** — Projeto ativo sem risco registrado: alerta após 30 dias
Projeto em EXECUTION sem nenhum registro de risco por mais de 30 dias gera alerta ao PM.

---

**PRJ-026** — Mudança de prazo: extensão máxima sem escalonamento = 20%
Mudanças de prazo que estendam o cronograma em mais de 20% do prazo original requerem aprovação do Sponsor além do IT_MANAGER.

---

**PRJ-027** — Equipe do projeto: máximo de 20 membros
O campo `team_members` aceita no máximo 20 usuários. Para equipes maiores, sub-times devem ser estruturados como projetos complementares.

---

**PRJ-028** — Projeto estratégico: revisão mensal pelo IT_MANAGER obrigatória
Projetos com `strategic = true` geram lembrete mensal ao IT_MANAGER para revisão e comunicação à Diretoria.

---

**PRJ-029** — Lição aprendida deve ter impacto definido
O campo `impact` da lição aprendida é obrigatório. Lições sem impacto definido não são exibidas no catálogo da KB.

---

**PRJ-030** — Benefício registrado antes do encerramento
Ao menos 1 benefício esperado deve ser registrado antes de avançar para CLOSED.

---

**PRJ-031** — Medição de benefícios: prazo de 6 meses após encerramento
Por padrão, `realization_date = closed_at + 180 dias`. PM pode ajustar o prazo de medição.

---

**PRJ-032** — Benefício não medido no prazo: alerta ao responsável
Benefício com `realization_date < hoje` e status = PENDING_MEASUREMENT gera alerta mensal ao responsável e ao IT_MANAGER.

---

**PRJ-033** — Notificação ao Sponsor em marcos críticos
O Sponsor recebe notificação automática ao concluir marcos do tipo MILESTONE com `blocking = true`.

---

**PRJ-034** — Projeto não pode ser excluído fisicamente
Projetos são somente soft-deleted. Exclusão física é proibida por RLS.

---

**PRJ-035** — Projeto cancelado: notificação à equipe e aos stakeholders
Ao cancelar projeto, todos os membros da equipe e stakeholders cadastrados recebem notificação com motivo do cancelamento.

---

**PRJ-036** — Solicitação de mudança rejeitada: motivo obrigatório e auditado
Rejeição de CR exige `rejection_reason` com mínimo de 30 chars. Registrado em audit_log.

---

**PRJ-037** — Conflito de alocação de recurso: alerta ao PM
Usuário alocado em mais de um projeto com sobreposição de período e soma de % > 100% gera alerta ao PM de ambos os projetos.

---

**PRJ-038** — Compra vinculada ao projeto: saldo atualizado em tempo real
Ao registrar compra com `project_id`, o saldo do projeto é atualizado imediatamente no dashboard.

---

**PRJ-039** — Projeto com dados pessoais: RIPD obrigatório antes do go-live
Projeto com `involves_personal_data = true` não pode avançar para DEPLOYMENT sem RIPD anexado e aprovação do DPO.

---

**PRJ-040** — Homologação: aprovação formal dos stakeholders beneficiários obrigatória
A transição TESTING → DEPLOYMENT requer aceite formal de ao menos 1 stakeholder beneficiário registrado no projeto.

---

**PRJ-041** — Baseline preservado a cada mudança aprovada
Toda mudança de escopo, prazo ou custo aprovada cria nova versão do plano (v2.0, v3.0...). Versões anteriores imutáveis.

---

**PRJ-042** — Portfólio de projetos disponível para consulta pelo Sponsor
O Sponsor pode visualizar todos os projetos que patrocina em qualquer status, sem acesso a projetos de outros Sponsors.

---

**PRJ-043** — Relatório de encerramento gerado automaticamente ao fechar projeto
Ao marcar projeto como CLOSED, relatório de encerramento (custos, entregas, benefícios, lições) gerado automaticamente pelo sistema.

---

**PRJ-044** — Ativos do projeto: destino obrigatório ao encerrar
Ao encerrar projeto, todos os ativos com `project_id` vinculado devem ter destino definido (usuário final ou estoque). Campo obrigatório no relatório de encerramento.

---

**PRJ-045** — Demanda não pode ser transformada em projeto sem Sponsor designado
A criação de projeto a partir de demanda exige `sponsor_id` definido antes de submeter.

---

**PRJ-046** — Projeto com > 2 marcos consecutivos atrasados: health RED automático
`ProjectHealthJob` força health_status = RED quando 2 marcos consecutivos do tipo MILESTONE estão atrasados.

---

**PRJ-047** — Reserva de contingência recomendada para projetos > R$20k
Projeto com orçamento total > R$20.000 sem reserva de contingência definida exibe aviso ao PM durante o planejamento.

---

**PRJ-048** — Custo de compliance dentro do projeto rastreável ao apontamento de origem
Custos registrados em projeto de origem COMPLIANCE têm `finding_id` automaticamente preenchido nos lançamentos financeiros.

---

**PRJ-049** — Kick-off Meeting: registro obrigatório antes de iniciar execução
A transição PLANNING → EXECUTION requer o campo `kickoff_date` preenchido com a data de realização do kick-off.

---

**PRJ-050** — Projeto de implantação: plano de rollback obrigatório para DEPLOYMENT
Projeto com tipo SYSTEMS, INFRASTRUCTURE ou CLOUD deve ter plano de rollback documentado antes de avançar para DEPLOYMENT.

---

**PRJ-051** — Histórico de health_status preservado para análise de tendência
O `ProjectHealthJob` registra cada cálculo de health_status em histórico. Dashboard exibe evolução da saúde do projeto ao longo do tempo.

---

**PRJ-052** — PM notificado a cada atividade concluída por membro da equipe
Ao marcar atividade como COMPLETED, o PM recebe notificação in-app automática.

---

**PRJ-053** — Demanda adiada (DEFERRED): revisão trimestral obrigatória
Demandas com status DEFERRED há mais de 90 dias sem revisão geram alerta ao PMO para reavaliação de prioridade.

---

**PRJ-054** — Projeto estratégico cancelado: comunicação à Diretoria obrigatória
Cancelamento de projeto com `strategic = true` requer campo de comunicação à Diretoria preenchido e notificação automática ao Sponsor.

---

**PRJ-055** — Planejamento paralelo de múltiplos projetos: visão de portfólio disponível
IT_MANAGER pode visualizar todos os projetos ativos em uma visão de portfólio consolidada com timelines simultâneas.

---

**PRJ-056** — Relatório semanal de portfólio enviado automaticamente
Todo domingo às 23h00, relatório semanal do portfólio de projetos gerado e enviado ao IT_MANAGER e PMO na segunda-feira às 07h00.

---

**PRJ-057** — Stakeholder externo pode ser registrado sem conta SGTI
Stakeholders externos (fornecedores, reguladores, clientes) podem ser registrados com nome e contato, sem necessidade de usuário ativo no sistema.

---

**PRJ-058** — Reunião de status semanal: ata opcional vinculável ao projeto
O PM pode registrar atas de reunião como documentos vinculados ao projeto (anexos ou artigos KB).

---

**PRJ-059** — Indicadores de desempenho calculados automaticamente
SPI (Schedule Performance Index) e CPI (Cost Performance Index) calculados automaticamente quando dados de esforço e custo real estão disponíveis.

---

**PRJ-060** — Projeto sem movimentação por 30 dias: alerta de abandono
Projeto em EXECUTION sem atualização de status de atividades, riscos ou comentários por 30 dias gera alerta ao IT_MANAGER.

---

**PRJ-061** — Lições aprendidas publicadas na KB: visíveis para projetos futuros
Artigos de lições aprendidas publicados na KB são exibidos automaticamente como sugestão ao criar novo projeto do mesmo tipo.

---

**PRJ-062** — Custo de projeto: relatório financeiro detalhado por fase
O relatório financeiro do projeto detalha custos por fase do ciclo de vida (planning, execution, deployment).

---

**PRJ-063** — Projeto ativo com orçamento esgotado: bloqueio automático de novos lançamentos
Quando `spent_amount >= approved_amount`, novos lançamentos são bloqueados com alerta urgente ao IT_MANAGER.

---

**PRJ-064** — Alocação de recurso: somente membros da equipe recebem atividades
Atividade só pode ser atribuída a usuário listado em `team_members` do projeto. Atribuição fora da equipe bloqueada com aviso.

---

**PRJ-065** — Mudança de sponsor ou PM: aprovação do IT_MANAGER obrigatória
Alteração dos campos `sponsor_id` ou `manager_id` requer aprovação formal do IT_MANAGER com justificativa.

---

**PRJ-066** — Projeto de compliance: evidência de conclusão arquivada no módulo Compliance
Ao encerrar projeto de origem COMPLIANCE, o relatório de encerramento é arquivado automaticamente como evidência no módulo de Compliance.

---

**PRJ-067** — Cronograma com > 100 atividades: exportação em Excel disponível
Para projetos com mais de 100 atividades, o cronograma pode ser exportado em Excel para análise detalhada e planejamento offline.

---

**PRJ-068** — Projeto reaberto (CLOSED → EXECUTION): apenas IT_MANAGER+
Reabrir projeto encerrado requer aprovação do IT_MANAGER com justificativa formal. Nova versão do plano deve ser criada.

---

**PRJ-069** — PMO recebe notificação de todo projeto proposto (IDEATION)
Ao criar um projeto, o PMO designado recebe notificação automática para triagem.

---

**PRJ-070** — Todo projeto deve ter ao menos um marco (MILESTONE) cadastrado
Projeto sem marcos cadastrados não pode avançar para EXECUTION. Mínimo de 1 milestone obrigatório.

---

**PRJ-071** — Documentos do projeto vinculáveis via URL ou upload
O PM pode vincular documentos externos (Google Drive, SharePoint) via URL, além de fazer upload direto no SGTI.

---

**PRJ-072** — Dashboard do projeto atualizado em tempo real
O painel do projeto (health, progresso, custos, riscos) é atualizado via Supabase Realtime sem necessidade de recarregar.

---

**PRJ-073** — Entregável com critério de aceite: aprovação do stakeholder registrada
Entregável do tipo DELIVERABLE com critério de aceite definido requer aprovação explícita do stakeholder responsável para ser marcado como COMPLETED.

---

**PRJ-074** — Exportação de cronograma em Gantt: disponível para IT_MANAGER+
O cronograma do projeto pode ser exportado em formato visual de Gantt (PDF) para uso em apresentações executivas.

---

**PRJ-075** — Projeto com tipo COMPLIANCE: Compliance Officer notificado na abertura
Ao criar projeto com tipo COMPLIANCE, o COMPLIANCE_OFFICER recebe notificação automática para acompanhamento.

---

**PRJ-076** — Análise de capacidade da equipe: conflitos exibidos no dashboard
O dashboard operacional exibe indicador de sobreposição de recursos quando membros da equipe estão 100% alocados em múltiplos projetos simultaneamente.

---

**PRJ-077** — Benefício do tipo FINANCIAL: valor esperado obrigatório
Para benefícios do tipo FINANCIAL, o campo `financial_value_expected` é obrigatório para cálculo do ROI estimado.

---

**PRJ-078** — Projeto encerrado: lições aprendidas notificadas ao PMO
Ao fechar projeto, as lições aprendidas registradas são enviadas ao PMO para análise e eventual incorporação à metodologia.

---

**PRJ-079** — Risco materializado: item de ação criado automaticamente no cronograma
Ao marcar risco com `status = MATERIALIZED`, o sistema sugere criação de atividade de contingência no cronograma.

---

**PRJ-080** — Portfólio de lições aprendidas acessível a todos os PMs
O catálogo de lições aprendidas publicadas na KB é acessível a todos os PROJECT_MANAGERs para consulta antes de iniciar novos projetos.

---

## 30. Critérios de Aceitação

### 30.1 Cadastro e Ciclo de Vida

- [ ] **CA-01:** Projeto sem Sponsor e PM bloqueado na criação.
- [ ] **CA-02:** Sponsor e PM não podem ser o mesmo usuário.
- [ ] **CA-03:** Código PRJ-YYYY-NNNN gerado automaticamente e imutável.
- [ ] **CA-04:** Transição PLANNING → EXECUTION bloqueada sem plano aprovado e kickoff_date preenchido.
- [ ] **CA-05:** Transição CLOSED bloqueada sem lição aprendida e benefício registrado.
- [ ] **CA-06:** Marcos bloqueantes não concluídos impedem transição para CLOSED.
- [ ] **CA-07:** Projeto cancelado notifica equipe e stakeholders automaticamente.
- [ ] **CA-08:** Suspensão sem motivo e data de retomada bloqueada.

### 30.2 Cronograma e Marcos

- [ ] **CA-09:** Atividade com `end_date < start_date` bloqueada.
- [ ] **CA-10:** `actual_end_date` preenchida pelo servidor ao concluir atividade.
- [ ] **CA-11:** Dependência circular entre atividades detectada e bloqueada.
- [ ] **CA-12:** PM notificado ao concluir atividade sob sua supervisão.
- [ ] **CA-13:** Dois marcos consecutivos atrasados forçam health_status = RED.

### 30.3 Health Status e Financeiro

- [ ] **CA-14:** `ProjectHealthJob` executa diariamente e calcula health corretamente.
- [ ] **CA-15:** Alerta ao PM quando realizado > 80% do orçamento aprovado.
- [ ] **CA-16:** Novos lançamentos bloqueados quando realizado > 110%.
- [ ] **CA-17:** Reserva orçamentária criada ao aprovar projeto e liberada ao cancelar.
- [ ] **CA-18:** Dashboard financeiro do projeto atualizado em tempo real.

### 30.4 Riscos e Mudanças

- [ ] **CA-19:** Risco sem responsável bloqueado ao salvar.
- [ ] **CA-20:** Mudança de escopo exige CR aprovado pelo IT_MANAGER + Sponsor.
- [ ] **CA-21:** Baseline anterior preservado após mudança aprovada.
- [ ] **CA-22:** CR rejeitado exige motivo obrigatório.

### 30.5 Integrações

- [ ] **CA-23:** Projeto criado a partir de apontamento de compliance mantém `finding_id`.
- [ ] **CA-24:** Encerramento de projeto de problema ITIL avança problema para RESOLVED.
- [ ] **CA-25:** Compra vinculada ao projeto debita saldo do projeto em tempo real.
- [ ] **CA-26:** Projeto com `involves_personal_data = true` bloqueia DEPLOYMENT sem RIPD.
- [ ] **CA-27:** Ativo do projeto exibe projeto vinculado na aba histórico do ativo.

### 30.6 Lições Aprendidas e Benefícios

- [ ] **CA-28:** Lição aprendida gera rascunho DRAFT_AI na KB ao encerrar projeto.
- [ ] **CA-29:** Benefício PENDING_MEASUREMENT gera alerta ao responsável na data de prazo.
- [ ] **CA-30:** Relatório de encerramento gerado automaticamente ao fechar projeto.

### 30.7 Dashboards e Relatórios

- [ ] **CA-31:** Dashboard operacional exibe projetos ativos por status em tempo real.
- [ ] **CA-32:** Relatório semanal de portfólio enviado automaticamente às segundas.
- [ ] **CA-33:** `audit_log` registra todas as operações com old/new values.
- [ ] **CA-34:** RLS impede UPDATE e DELETE em `audit_log`.
- [ ] **CA-35:** Exportação de cronograma em PDF (Gantt) disponível para IT_MANAGER+.

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação com 30 seções, 80 regras PRJ e 35 critérios de aceitação |

---

> **Próximos documentos recomendados:**
> [`45_COMPLIANCE.md`](./45_COMPLIANCE.md) — Compliance (origem de projetos via apontamentos)
> [`42_PROBLEM_MANAGEMENT.md`](./42_PROBLEM_MANAGEMENT.md) — Problemas (origem de projetos via causa raiz)
> [`46_FINANCIAL_MANAGEMENT.md`](./46_FINANCIAL_MANAGEMENT.md) — Financeiro (orçamento de projetos)
