# SGTI — Sistema de Gestão de Tecnologia da Informação
## KPIs, Métricas e Indicadores — Documentação Funcional

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [60_DASHBOARDS.md](./60_DASHBOARDS.md) · [61_REPORTS.md](./61_REPORTS.md) · [40_INCIDENT_MANAGEMENT.md](./40_INCIDENT_MANAGEMENT.md) · [46_FINANCIAL_MANAGEMENT.md](./46_FINANCIAL_MANAGEMENT.md) · [45_COMPLIANCE.md](./45_COMPLIANCE.md)

---

## Sobre este Documento

Este documento é o **catálogo oficial de KPIs, métricas e indicadores do SGTI**. Todos os dashboards e relatórios da plataforma utilizam **exclusivamente** os indicadores aqui definidos. Nenhum cálculo alternativo é permitido sem aprovação e atualização deste documento.

**Escopo:** documentação funcional e de negócio. Nenhum código, SQL ou API é gerado neste documento.

---

## Premissa Fundamental

> **Todos os dashboards e relatórios do SGTI devem utilizar exclusivamente os KPIs oficiais definidos neste documento, com as fórmulas, fontes e frequências aqui especificadas.**

---

## Sumário

1. [Objetivos do Módulo](#1-objetivos-do-módulo)
2. [Governança de Indicadores](#2-governança-de-indicadores)
3. [Indicadores Operacionais](#3-indicadores-operacionais)
4. [Indicadores de SLA](#4-indicadores-de-sla)
5. [Indicadores ITIL](#5-indicadores-itil)
6. [Indicadores de Incidentes](#6-indicadores-de-incidentes)
7. [Indicadores de Requisições](#7-indicadores-de-requisições)
8. [Indicadores de Problemas](#8-indicadores-de-problemas)
9. [Indicadores de Ativos](#9-indicadores-de-ativos)
10. [Indicadores de Identidades](#10-indicadores-de-identidades)
11. [Indicadores de Compliance](#11-indicadores-de-compliance)
12. [Indicadores Financeiros](#12-indicadores-financeiros)
13. [Indicadores de Compras](#13-indicadores-de-compras)
14. [Indicadores de Projetos](#14-indicadores-de-projetos)
15. [Indicadores da Base de Conhecimento](#15-indicadores-da-base-de-conhecimento)
16. [Indicadores das Integrações](#16-indicadores-das-integrações)
17. [Indicadores Estratégicos](#17-indicadores-estratégicos)
18. [Faixas de Classificação](#18-faixas-de-classificação)
19. [Dashboards Relacionados](#19-dashboards-relacionados)
20. [Relatórios Relacionados](#20-relatórios-relacionados)
21. [Auditoria e Rastreabilidade](#21-auditoria-e-rastreabilidade)
22. [Regras de Negócio](#22-regras-de-negócio)
23. [Critérios de Aceitação](#23-critérios-de-aceitação)

---

## 1. Objetivos do Módulo

### 1.1 Objetivo Primário

Definir, documentar e governar todos os KPIs e indicadores utilizados pelo SGTI, garantindo consistência, comparabilidade e rastreabilidade de todas as métricas exibidas em dashboards e relatórios.

### 1.2 Objetivos Específicos

| # | Objetivo |
|---|----------|
| 1 | Catálogo único e centralizado de todos os KPIs da plataforma |
| 2 | Fórmulas padronizadas e documentadas para cada indicador |
| 3 | Fonte de dados rastreável para cada cálculo |
| 4 | Frequência de atualização definida para cada indicador |
| 5 | Faixas de classificação (verde/amarelo/vermelho) para todos os KPIs |
| 6 | Mapeamento entre KPIs, dashboards e relatórios |

---

## 2. Governança de Indicadores

### 2.1 Estrutura de Governança de Cada KPI

Todo KPI neste catálogo é descrito com os seguintes atributos:

| Atributo | Descrição |
|:--------:|-----------|
| **Código** | Identificador único (ex.: KPI-OP-001) |
| **Nome** | Nome oficial do indicador |
| **Conceito** | O que o indicador mede e por que é importante |
| **Fórmula** | Expressão matemática exata |
| **Unidade** | %, horas, R$, contagem, etc. |
| **Fonte dos Dados** | Tabela(s) e campo(s) de origem |
| **Dono do Indicador** | Papel responsável pela meta e análise |
| **Frequência de Cálculo** | Quando o valor é recalculado |
| **Frequência de Atualização** | Quando o valor é exibido/publicado |
| **Meta** | Valor alvo configurável |
| **Faixa Verde** | Quando o indicador está OK |
| **Faixa Amarela** | Quando o indicador requer atenção |
| **Faixa Vermelha** | Quando o indicador está crítico |

### 2.2 Responsáveis por Categoria

| Categoria | Dono Padrão |
|:---------:|:-----------:|
| Operacional (chamados) | IT_MANAGER |
| SLA | IT_MANAGER |
| ITIL | IT_MANAGER |
| Incidentes | IT_MANAGER |
| Requisições | IT_MANAGER |
| Problemas | IT_SPECIALIST |
| Ativos | IT_MANAGER |
| Identidades | IT_MANAGER |
| Compliance | COMPLIANCE_OFFICER |
| Financeiro | FINANCIAL_ANALYST |
| Compras | FINANCIAL_ANALYST |
| Projetos | PROJECT_MANAGER |
| Base de Conhecimento | IT_SPECIALIST |
| Integrações | SUPER_ADMIN |
| Estratégico | IT_MANAGER + EXECUTIVE |

### 2.3 Critérios de Auditoria de KPIs

| Critério | Descrição |
|:--------:|-----------|
| **Rastreabilidade** | Todo valor de KPI pode ser decomposto até os registros individuais que o originam |
| **Reprodutibilidade** | Executando a fórmula com os mesmos dados e período, o resultado é idêntico |
| **Imutabilidade histórica** | Valores de períodos passados não mudam retroativamente |
| **Segregação** | Valores por escopo de usuário (próprios chamados vs. todos) calculados separadamente |
| **Transparência** | A fórmula e a fonte de dados são acessíveis ao usuário que visualiza o KPI |

---

## 3. Indicadores Operacionais

---

### 3.1 Total de Chamados

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-OP-001 |
| **Conceito** | Quantidade total de chamados (incidentes + requisições) criados no período, independentemente do status atual. É a medida bruta do volume de trabalho recebido pela equipe de TI. |
| **Fórmula** | `COUNT(ticket.Ticket WHERE created_at BETWEEN period_start AND period_end AND type IN ('INCIDENT', 'REQUEST'))` |
| **Unidade** | Inteiro (quantidade) |
| **Fonte** | `ticket.Ticket` |
| **Dono** | IT_MANAGER |
| **Frequência de Cálculo** | Tempo real (contagem incremental) |
| **Frequência de Atualização** | Supabase Realtime (≤ 5s) |
| **Meta** | Tendência de redução mês a mês |

---

### 3.2 Chamados Abertos

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-OP-002 |
| **Conceito** | Quantidade de chamados com status ativo (não encerrados nem cancelados) no momento da consulta. Reflete a carga de trabalho atual da equipe. |
| **Fórmula** | `COUNT(ticket.Ticket WHERE status NOT IN ('CLOSED', 'RESOLVED', 'CANCELLED') AND deleted_at IS NULL)` |
| **Unidade** | Inteiro |
| **Fonte** | `ticket.Ticket` |
| **Dono** | IT_MANAGER |
| **Frequência de Cálculo** | Tempo real |
| **Frequência de Atualização** | Supabase Realtime (≤ 5s) |

---

### 3.3 Chamados Fechados

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-OP-003 |
| **Conceito** | Quantidade de chamados com status CLOSED no período selecionado. Mede a capacidade de resolução da equipe no período. |
| **Fórmula** | `COUNT(ticket.Ticket WHERE status = 'CLOSED' AND closed_at BETWEEN period_start AND period_end)` |
| **Unidade** | Inteiro |
| **Fonte** | `ticket.Ticket` |
| **Dono** | IT_MANAGER |
| **Frequência de Cálculo** | Tempo real |
| **Frequência de Atualização** | Supabase Realtime (≤ 5s) |

---

### 3.4 Backlog

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-OP-004 |
| **Conceito** | Chamados abertos há mais tempo que o SLA padrão configurado para o serviço, sem resolução. Indica acúmulo de trabalho não resolvido dentro do prazo esperado. |
| **Fórmula** | `COUNT(ticket.Ticket WHERE status NOT IN ('CLOSED', 'RESOLVED', 'CANCELLED') AND (NOW() - created_at) > sla_policy.resolution_time AND sla_status = 'BREACHED')` |
| **Unidade** | Inteiro |
| **Fonte** | `ticket.Ticket`, `catalog.SLAPolicy`, `ticket.SLAHistory` |
| **Dono** | IT_MANAGER |
| **Frequência de Cálculo** | A cada 5 minutos (SlaMonitoringJob) |
| **Frequência de Atualização** | A cada 5 minutos |
| **Meta** | 0 |

---

### 3.5 Backlog Crítico

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-OP-005 |
| **Conceito** | Subconjunto do backlog composto exclusivamente por chamados com prioridade CRITICAL em atraso. Demanda atenção imediata da gestão. |
| **Fórmula** | `COUNT(ticket.Ticket WHERE priority = 'CRITICAL' AND status NOT IN ('CLOSED', 'RESOLVED', 'CANCELLED') AND sla_status = 'BREACHED')` |
| **Unidade** | Inteiro |
| **Fonte** | `ticket.Ticket` |
| **Dono** | IT_MANAGER |
| **Frequência de Cálculo** | Tempo real |
| **Meta** | 0 (meta absoluta) |

---

### 3.6 Chamados Reabertos

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-OP-006 |
| **Conceito** | Chamados que retornaram ao status ativo após terem sido marcados como RESOLVED ou CLOSED no período. Indica falha na resolução definitiva. |
| **Fórmula** | `COUNT(DISTINCT ticket_id FROM ticket.TicketStatusHistory WHERE old_status IN ('RESOLVED','CLOSED') AND new_status NOT IN ('RESOLVED','CLOSED','CANCELLED') AND changed_at BETWEEN period_start AND period_end)` |
| **Unidade** | Inteiro |
| **Fonte** | `ticket.TicketStatusHistory` |
| **Dono** | IT_MANAGER |
| **Frequência de Cálculo** | Período selecionado |
| **Meta** | ≤ 5% do total fechado |

---

### 3.7 Chamados por Categoria

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-OP-007 |
| **Conceito** | Distribuição do volume de chamados por categoria. Identifica quais tipos de problemas mais consomem a capacidade da equipe. |
| **Fórmula** | `COUNT(ticket.Ticket) GROUP BY category_id ORDER BY count DESC` |
| **Unidade** | Inteiro por categoria |
| **Fonte** | `ticket.Ticket`, `catalog.Category` |
| **Dono** | IT_MANAGER |
| **Frequência de Cálculo** | Período selecionado |

---

### 3.8 Chamados por Serviço

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-OP-008 |
| **Conceito** | Distribuição do volume de chamados por serviço do catálogo. Identifica serviços com maior demanda de suporte. |
| **Fórmula** | `COUNT(ticket.Ticket) GROUP BY service_catalog_id ORDER BY count DESC` |
| **Unidade** | Inteiro por serviço |
| **Fonte** | `ticket.Ticket`, `catalog.ServiceCatalog` |
| **Dono** | IT_MANAGER |
| **Frequência de Cálculo** | Período selecionado |

---

### 3.9 Chamados por Analista

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-OP-009 |
| **Conceito** | Volume de chamados atribuídos a cada analista no período. Auxilia na identificação de desequilíbrio de carga de trabalho. |
| **Fórmula** | `COUNT(ticket.Ticket WHERE assignee_id IS NOT NULL) GROUP BY assignee_id` |
| **Unidade** | Inteiro por analista |
| **Fonte** | `ticket.Ticket`, `auth.User` |
| **Dono** | IT_SPECIALIST |
| **Frequência de Cálculo** | Período selecionado |

---

### 3.10 Chamados por Área

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-OP-010 |
| **Conceito** | Volume de chamados originados por cada departamento/área da organização no período. |
| **Fórmula** | `COUNT(ticket.Ticket) GROUP BY requester.department_id ORDER BY count DESC` |
| **Unidade** | Inteiro por área |
| **Fonte** | `ticket.Ticket`, `auth.User` |
| **Dono** | IT_MANAGER |
| **Frequência de Cálculo** | Período selecionado |

---

## 4. Indicadores de SLA

---

### 4.1 SLA Cumprido (%)

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-SLA-001 |
| **Conceito** | Percentual de chamados fechados dentro do prazo definido pela política de SLA aplicável. É o principal indicador de aderência ao SLA. |
| **Fórmula** | `(COUNT(chamados_CLOSED WHERE sla_status = 'WITHIN') / COUNT(chamados_CLOSED)) × 100` |
| **Unidade** | % (0–100) |
| **Fonte** | `ticket.Ticket`, `ticket.SLAHistory` |
| **Dono** | IT_MANAGER |
| **Frequência de Cálculo** | Período selecionado |
| **Meta** | ≥ 90% |
| **Observação** | Chamados com SLA pausado (PENDING_USER, manutenção) têm o tempo de pausa descontado do cálculo |

---

### 4.2 SLA Violado (%)

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-SLA-002 |
| **Conceito** | Percentual de chamados que extrapolaram o prazo de SLA definido. Complementar ao KPI-SLA-001. |
| **Fórmula** | `(COUNT(chamados WHERE sla_status = 'BREACHED') / COUNT(chamados_CLOSED)) × 100` |
| **Unidade** | % |
| **Fonte** | `ticket.Ticket`, `ticket.SLAHistory` |
| **Dono** | IT_MANAGER |
| **Meta** | ≤ 10% |
| **Observação** | `SLA Violado + SLA Cumprido = 100%` (para chamados fechados) |

---

### 4.3 SLA Primeira Resposta (%)

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-SLA-003 |
| **Conceito** | Percentual de chamados que receberam a primeira ação técnica (atribuição ou comentário do analista) dentro do prazo de primeira resposta configurado na política de SLA. |
| **Fórmula** | `(COUNT(chamados WHERE first_response_at - created_at ≤ sla_policy.first_response_time) / COUNT(chamados)) × 100` |
| **Unidade** | % |
| **Fonte** | `ticket.Ticket`, `ticket.SLAHistory`, `catalog.SLAPolicy` |
| **Dono** | IT_MANAGER |
| **Meta** | ≥ 95% |

---

### 4.4 SLA Atendimento (%)

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-SLA-004 |
| **Conceito** | Percentual de chamados que passaram para status IN_PROGRESS (início do atendimento efetivo) dentro do prazo de atendimento configurado na política de SLA. |
| **Fórmula** | `(COUNT(chamados WHERE (status_change_to_IN_PROGRESS_at - created_at) ≤ sla_policy.response_time) / COUNT(chamados)) × 100` |
| **Unidade** | % |
| **Fonte** | `ticket.Ticket`, `ticket.SLAHistory` |
| **Dono** | IT_MANAGER |
| **Meta** | ≥ 90% |

---

### 4.5 SLA Resolução (%)

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-SLA-005 |
| **Conceito** | Percentual de chamados resolvidos dentro do prazo de resolução configurado na política de SLA. Mede a capacidade de entrega final da equipe. |
| **Fórmula** | `(COUNT(chamados WHERE resolved_at - created_at ≤ sla_policy.resolution_time AND sla_paused_time descontado) / COUNT(chamados_CLOSED)) × 100` |
| **Unidade** | % |
| **Fonte** | `ticket.Ticket`, `ticket.SLAHistory` |
| **Dono** | IT_MANAGER |
| **Meta** | ≥ 90% |

---

### 4.6 Tempo Médio de Atendimento (TMA)

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-SLA-006 |
| **Conceito** | Tempo médio decorrido entre a criação do chamado e a mudança para o status IN_PROGRESS (início do atendimento efetivo pelo analista). |
| **Fórmula** | `AVG(first_in_progress_at - created_at) em horas, para chamados do período` |
| **Unidade** | Horas (decimal, ex.: 1,5h = 1h30min) |
| **Fonte** | `ticket.Ticket`, `ticket.TicketStatusHistory` |
| **Dono** | IT_MANAGER |
| **Meta** | Conforme SLA do serviço |
| **Observação** | Calculado apenas para chamados que passaram pelo status IN_PROGRESS |

---

### 4.7 Tempo Médio de Resolução (TMR)

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-SLA-007 |
| **Conceito** | Tempo médio decorrido entre a criação do chamado e sua resolução definitiva (status RESOLVED). Equivale ao MTTR para o contexto de SLA operacional. |
| **Fórmula** | `AVG(resolved_at - created_at - total_paused_time) em horas, para chamados RESOLVED/CLOSED no período` |
| **Unidade** | Horas (decimal) |
| **Fonte** | `ticket.Ticket`, `ticket.SLAHistory` |
| **Dono** | IT_MANAGER |
| **Meta** | Conforme SLA do serviço |
| **Observação** | `total_paused_time` = soma dos intervalos em que o SLA estava pausado (PENDING_USER, manutenção, feriados) |

---

## 5. Indicadores ITIL

---

### 5.1 MTTR — Mean Time To Repair (Tempo Médio de Reparo)

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-ITIL-001 |
| **Conceito** | Tempo médio necessário para restaurar um serviço após uma falha (incidente). Mede a eficiência técnica da equipe em diagnosticar e corrigir problemas. Diferentemente do TMR (SLA), o MTTR é calculado sobre o tempo total decorrido incluindo pausas, pois representa o tempo real percebido pelo usuário até a restauração do serviço. |
| **Fórmula** | `AVG(resolved_at - created_at) em horas, para incidentes RESOLVED/CLOSED no período` |
| **Unidade** | Horas (decimal) |
| **Fonte** | `ticket.Ticket WHERE type = 'INCIDENT'` |
| **Dono** | IT_MANAGER |
| **Frequência de Cálculo** | Período selecionado |
| **Meta** | Redução contínua mês a mês |
| **Observação** | **Diferença do TMR:** MTTR inclui tempo de pausa (percepção do usuário); TMR exclui (cálculo de aderência ao SLA contratado) |

---

### 5.2 MTBF — Mean Time Between Failures (Tempo Médio entre Falhas)

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-ITIL-002 |
| **Conceito** | Tempo médio entre ocorrências de falha no mesmo serviço. Mede a confiabilidade/estabilidade de um serviço. Quanto maior o MTBF, mais estável é o serviço. |
| **Fórmula** | `Para cada serviço: (período_total_em_horas - SUM(MTTR de todos os incidentes do serviço)) / COUNT(incidentes do serviço no período)` |
| **Unidade** | Horas (decimal) |
| **Fonte** | `ticket.Ticket WHERE type = 'INCIDENT'`, `catalog.ServiceCatalog` |
| **Dono** | IT_MANAGER |
| **Frequência de Cálculo** | Mensal |
| **Meta** | Crescimento contínuo mês a mês por serviço |
| **Observação** | Calculado individualmente por serviço. O valor geral é a média ponderada por volume de incidentes |

---

### 5.3 FCR — First Call Resolution (Resolução no Primeiro Contato)

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-ITIL-003 |
| **Conceito** | Percentual de chamados resolvidos no primeiro atendimento, sem necessidade de escalonamento, reabertura ou atribuição a outro analista. Mede a eficiência e a qualificação da equipe de suporte N1. |
| **Fórmula** | `(COUNT(chamados WHERE was_escalated = false AND reopened_count = 0 AND reassigned_count = 0 AND status = 'CLOSED') / COUNT(chamados_CLOSED)) × 100` |
| **Unidade** | % |
| **Fonte** | `ticket.Ticket`, `ticket.TicketStatusHistory` |
| **Dono** | IT_SPECIALIST |
| **Meta** | ≥ 70% |
| **Observação** | Chamados com mais de 1 atribuição de analista são considerados como não-FCR |

---

### 5.4 Taxa de Reabertura

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-ITIL-004 |
| **Conceito** | Percentual de chamados reabertos após terem sido fechados no período. Indica a qualidade da resolução entregue. |
| **Fórmula** | `(COUNT(chamados reabertos no período) / COUNT(chamados CLOSED no período)) × 100` |
| **Unidade** | % |
| **Fonte** | `ticket.Ticket`, `ticket.TicketStatusHistory` |
| **Dono** | IT_MANAGER |
| **Meta** | ≤ 5% |

---

### 5.5 Taxa de Escalonamento

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-ITIL-005 |
| **Conceito** | Percentual de chamados que foram escalonados para N2 ou N3 em relação ao total de chamados do período. Altos valores podem indicar lacuna de treinamento no N1. |
| **Fórmula** | `(COUNT(chamados WHERE was_escalated = true) / COUNT(chamados no período)) × 100` |
| **Unidade** | % |
| **Fonte** | `ticket.Ticket` |
| **Dono** | IT_SPECIALIST |
| **Meta** | ≤ 30% |

---

## 6. Indicadores de Incidentes

| Código | Nome | Fórmula Resumida | Meta | Unidade |
|:------:|------|:----------------:|:----:|:-------:|
| KPI-INC-001 | Total de Incidentes | COUNT(type='INCIDENT' no período) | — | Inteiro |
| KPI-INC-002 | Incidentes Abertos | COUNT(INC com status ativo) | — | Inteiro |
| KPI-INC-003 | Incidentes Fechados | COUNT(INC CLOSED no período) | — | Inteiro |
| KPI-INC-004 | Incidentes Críticos Abertos | COUNT(INC CRITICAL e abertos) | 0 | Inteiro |
| KPI-INC-005 | Incidentes Críticos Fechados | COUNT(INC CRITICAL CLOSED no período) | — | Inteiro |
| KPI-INC-006 | SLA de Incidentes Cumprido | % INC dentro do SLA | ≥ 90% | % |
| KPI-INC-007 | MTTR de Incidentes | AVG(resolved_at − created_at) para INC | Redução | Horas |
| KPI-INC-008 | MTBF por Serviço | Tempo médio entre INC do mesmo serviço | Crescimento | Horas |
| KPI-INC-009 | FCR de Incidentes | % INC resolvidos no primeiro atendimento | ≥ 70% | % |
| KPI-INC-010 | Taxa de Reabertura de Incidentes | % INC reabertos / INC fechados | ≤ 5% | % |
| KPI-INC-011 | Incidentes com KB Vinculado | COUNT(INC com kb_article_id) / total × 100 | ≥ 60% | % |
| KPI-INC-012 | Incidentes por Origem | COUNT agrupado por origin (PORTAL/EMAIL/PHONE) | — | Inteiro |
| KPI-INC-013 | Incidentes Vinculados a Problema | COUNT(INC com problem_id IS NOT NULL) | — | Inteiro |
| KPI-INC-014 | Incidentes Recorrentes | COUNT(INC do mesmo serviço + categoria com ≥ 3 no período) | 0 | Inteiro |
| KPI-INC-015 | Impacto Médio por Incidente Crítico | AVG(impact_scope) para INC CRITICAL | — | Usuários |

---

## 7. Indicadores de Requisições

| Código | Nome | Fórmula Resumida | Meta | Unidade |
|:------:|------|:----------------:|:----:|:-------:|
| KPI-REQ-001 | Total de Requisições | COUNT(type='REQUEST' no período) | — | Inteiro |
| KPI-REQ-002 | Requisições Abertas | COUNT(REQ com status ativo) | — | Inteiro |
| KPI-REQ-003 | Requisições Concluídas | COUNT(REQ FULFILLED no período) | — | Inteiro |
| KPI-REQ-004 | Requisições Aguardando Aprovação | COUNT(REQ PENDING_APPROVAL) | ≤ 5% | Inteiro |
| KPI-REQ-005 | SLA de Requisições Cumprido | % REQ dentro do SLA | ≥ 90% | % |
| KPI-REQ-006 | Tempo Médio de Ciclo | AVG(fulfilled_at − created_at) | Redução | Horas |
| KPI-REQ-007 | Tempo Médio de Aprovação | AVG(approved_at − submitted_at) | ≤ 24h | Horas |
| KPI-REQ-008 | Taxa de Cancelamento | COUNT(CANCELLED) / total × 100 | ≤ 5% | % |
| KPI-REQ-009 | CSAT Médio | AVG(satisfaction_score) | ≥ 4,0/5,0 | Decimal |
| KPI-REQ-010 | Requisições por Canal | COUNT por origin | — | Inteiro |
| KPI-REQ-011 | Top Serviços Requisitados | COUNT por service_catalog_id DESC | — | Inteiro |
| KPI-REQ-012 | Requisições Geradas por Compra | COUNT(REQ que originaram PurchaseRequest) | — | Inteiro |

---

## 8. Indicadores de Problemas

| Código | Nome | Fórmula Resumida | Meta | Unidade |
|:------:|------|:----------------:|:----:|:-------:|
| KPI-PRB-001 | Total de Problemas | COUNT(Problem no período) | — | Inteiro |
| KPI-PRB-002 | Problemas Abertos | COUNT(PRB com status ativo) | — | Inteiro |
| KPI-PRB-003 | Erros Conhecidos (KEDB) | COUNT(status = 'KNOWN_ERROR') | — | Inteiro |
| KPI-PRB-004 | Workarounds Ativos | COUNT(workaround publicado e não depreciado) | — | Inteiro |
| KPI-PRB-005 | Incidentes por Problema | AVG(COUNT de INC vinculados por PRB) | — | Decimal |
| KPI-PRB-006 | Taxa de Resolução Definitiva | COUNT(RESOLVED) / total × 100 | ≥ 80% | % |
| KPI-PRB-007 | Tempo Médio até Workaround | AVG(workaround_published_at − created_at) | ≤ 4h | Horas |
| KPI-PRB-008 | Tempo Médio de Resolução | AVG(resolved_at − created_at) | Redução | Dias |
| KPI-PRB-009 | Problemas Recorrentes | COUNT(mesmo serviço com ≥ 2 PRB no período) | 0 | Inteiro |
| KPI-PRB-010 | Problemas Críticos Abertos | COUNT(PRB CRITICAL e abertos) | 0 | Inteiro |

---

## 9. Indicadores de Ativos

| Código | Nome | Fórmula Resumida | Meta | Unidade |
|:------:|------|:----------------:|:----:|:-------:|
| KPI-AST-001 | Total de Ativos Ativos | COUNT(status IN IN_STOCK, ALLOCATED, IN_USE, UNDER_MAINTENANCE) | — | Inteiro |
| KPI-AST-002 | Ativos por Usuário | COUNT(Asset) GROUP BY assignee_id | — | Inteiro |
| KPI-AST-003 | Ativos por Área | COUNT(Asset) GROUP BY department_id | — | Inteiro |
| KPI-AST-004 | Ativos Sem Responsável | COUNT(status=IN_USE AND assignee_id IS NULL) | 0 | Inteiro |
| KPI-AST-005 | Ativos em Garantia | COUNT(warranty_end ≥ TODAY AND status ≠ DECOMMISSIONED) | — | Inteiro |
| KPI-AST-006 | Ativos Fora da Garantia | COUNT(warranty_end < TODAY AND status ≠ DECOMMISSIONED) | Redução | Inteiro |
| KPI-AST-007 | Ativos Depreciados | COUNT(current_value ≤ residual_value AND status ≠ DECOMMISSIONED) | — | Inteiro |
| KPI-AST-008 | Valor Total do Parque | SUM(current_value) para ativos CAPEX ativos | — | R$ |
| KPI-AST-009 | Depreciação Acumulada | SUM(accumulated_depreciation) para ativos CAPEX | — | R$ |
| KPI-AST-010 | Garantias Vencendo (90d) | COUNT(warranty_end BETWEEN TODAY e +90d) | — | Inteiro |
| KPI-AST-011 | Taxa de Utilização do Parque | COUNT(IN_USE) / COUNT(total ativos ativos) × 100 | ≥ 80% | % |
| KPI-AST-012 | Licenças com Uso > 90% | COUNT(license.usage_pct > 90%) | — | Inteiro |
| KPI-AST-013 | Licenças Subutilizadas (<20%) | COUNT(license.usage_pct < 20%) | 0 | Inteiro |
| KPI-AST-014 | Ativos Ociosos (>180 dias) | COUNT(IN_STOCK por > 180 dias sem movimentação) | 0 | Inteiro |
| KPI-AST-015 | Custo Médio por Ativo | SUM(purchase_value) / COUNT(ativos ativos) | — | R$ |

---

## 10. Indicadores de Identidades

| Código | Nome | Fórmula Resumida | Meta | Unidade |
|:------:|------|:----------------:|:----:|:-------:|
| KPI-IAM-001 | Usuários Ativos | COUNT(status='ACTIVE') | — | Inteiro |
| KPI-IAM-002 | Usuários Bloqueados | COUNT(status='SUSPENDED') | — | Inteiro |
| KPI-IAM-003 | Provisionamentos Pendentes | COUNT(status='PENDING_PROVISIONING') | 0 | Inteiro |
| KPI-IAM-004 | Revisões de Acesso Vencidas | COUNT(next_review_due < TODAY) | 0 | Inteiro |
| KPI-IAM-005 | Cobertura de MFA (Geral) | COUNT(mfa_enabled=true) / COUNT(ACTIVE) × 100 | — | % |
| KPI-IAM-006 | MFA em Papéis Críticos | COUNT(IT_MANAGER+ com mfa=true) / COUNT(IT_MANAGER+) × 100 | 100% | % |
| KPI-IAM-007 | Usuários por Departamento | COUNT(User) GROUP BY department_id | — | Inteiro |
| KPI-IAM-008 | Onboardings (período) | COUNT(status mudou para ACTIVE no período) | — | Inteiro |
| KPI-IAM-009 | Offboardings (período) | COUNT(status mudou para INACTIVE no período) | — | Inteiro |
| KPI-IAM-010 | Tempo Médio de Provisionamento | AVG(ACTIVE_at − INVITED_at) | ≤ 10 min | Minutos |
| KPI-IAM-011 | Tempo Médio de Desprovisionamento | AVG(DEPROVISIONED_at − request_at) | ≤ 120 min | Minutos |
| KPI-IAM-012 | Usuários Sem Gestor | COUNT(status=ACTIVE AND manager_id IS NULL) | 0 | Inteiro |
| KPI-IAM-013 | Divergências de Sync Google | COUNT(sync_status='CONFLICT') | ≤ 5 | Inteiro |

---

## 11. Indicadores de Compliance

---

### 11.1 Compliance Score

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-CMP-001 |
| **Conceito** | Índice percentual que representa o nível de maturidade de implementação dos controles de um framework normativo. Calculado ao concluir cada auditoria. |
| **Fórmula** | `( Σ(controles_IMPLEMENTED × 1,0) + Σ(controles_PARTIALLY_IMPLEMENTED × 0,5) ) / Σ(controles_APLICÁVEIS) × 100` |
| **Unidade** | % (0–100) |
| **Fonte** | `compliance.ComplianceAudit`, `compliance.NormItem` |
| **Dono** | COMPLIANCE_OFFICER |
| **Frequência de Cálculo** | Ao concluir auditoria (status = COMPLETED) |
| **Frequência de Atualização** | Ao concluir auditoria |
| **Meta** | ≥ 80% |

---

### 11.2 Taxa de Conformidade

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-CMP-002 |
| **Conceito** | Percentual de controles totalmente implementados em relação ao total de controles aplicáveis da norma. Diferencia-se do Compliance Score por não considerar implementações parciais. |
| **Fórmula** | `COUNT(controles_IMPLEMENTED) / COUNT(controles_APLICÁVEIS) × 100` |
| **Unidade** | % |
| **Fonte** | `compliance.NormItem` |
| **Dono** | COMPLIANCE_OFFICER |
| **Meta** | ≥ 75% |

---

### 11.3 Taxa de Regularização

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-CMP-003 |
| **Conceito** | Percentual de apontamentos de não-conformidade que foram concluídos (regularizados) dentro do prazo definido no período. Mede a eficiência do processo de tratativa. |
| **Fórmula** | `COUNT(findings CONCLUDED AND concluded_at ≤ due_date) / COUNT(findings CONCLUDED no período) × 100` |
| **Unidade** | % |
| **Fonte** | `compliance.ComplianceFinding` |
| **Dono** | COMPLIANCE_OFFICER |
| **Meta** | ≥ 85% |

---

### 11.4 Apontamentos Abertos

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-CMP-004 |
| **Fórmula** | `COUNT(ComplianceFinding WHERE status NOT IN ('CONCLUDED', 'REJECTED', 'CANCELLED'))` |
| **Unidade** | Inteiro |
| **Meta** | — |

---

### 11.5 Apontamentos Vencidos

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-CMP-005 |
| **Fórmula** | `COUNT(ComplianceFinding WHERE due_date < TODAY AND status NOT IN ('CONCLUDED', 'REJECTED', 'CANCELLED'))` |
| **Unidade** | Inteiro |
| **Meta** | 0 |

---

### 11.6 Evidências Pendentes de Revisão

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-CMP-006 |
| **Fórmula** | `COUNT(ComplianceEvidence WHERE review_status = 'PENDING')` |
| **Unidade** | Inteiro |
| **Meta** | ≤ 10 |

---

## 12. Indicadores Financeiros

---

### 12.1 OPEX Total

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-FIN-001 |
| **Conceito** | Soma total das despesas operacionais de TI no período. |
| **Fórmula** | `SUM(OpexExpense.amount_brl WHERE competency_date BETWEEN period_start AND period_end AND status IN ('APPROVED','PAID'))` |
| **Unidade** | R$ |
| **Fonte** | `finance.OpexExpense` |
| **Dono** | FINANCIAL_ANALYST |
| **Frequência de Cálculo** | Mensal / Período selecionado |
| **Meta** | Dentro do orçamento aprovado |

---

### 12.2 CAPEX Total

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-FIN-002 |
| **Conceito** | Soma total dos investimentos de capital de TI no período. |
| **Fórmula** | `SUM(CapexInvestment.value_brl WHERE acquisition_date BETWEEN period_start AND period_end AND status IN ('APPROVED','ACTIVE'))` |
| **Unidade** | R$ |
| **Fonte** | `finance.CapexInvestment` |
| **Dono** | FINANCIAL_ANALYST |
| **Meta** | Dentro do orçamento CAPEX aprovado |

---

### 12.3 OPEX por Serviço

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-FIN-003 |
| **Fórmula** | `SUM(OpexExpense.amount_brl) GROUP BY service_catalog_id` |
| **Unidade** | R$ por serviço |
| **Fonte** | `finance.OpexExpense` |

---

### 12.4 CAPEX por Serviço

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-FIN-004 |
| **Fórmula** | `SUM(CapexInvestment.value_brl) GROUP BY service_catalog_id` |
| **Unidade** | R$ por serviço |
| **Fonte** | `finance.CapexInvestment`, `asset.Asset` |

---

### 12.5 OPEX por Projeto

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-FIN-005 |
| **Fórmula** | `SUM(OpexExpense.amount_brl WHERE project_id IS NOT NULL) GROUP BY project_id` |
| **Unidade** | R$ por projeto |
| **Fonte** | `finance.OpexExpense` |

---

### 12.6 CAPEX por Projeto

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-FIN-006 |
| **Fórmula** | `SUM(CapexInvestment.value_brl WHERE project_id IS NOT NULL) GROUP BY project_id` |
| **Unidade** | R$ por projeto |
| **Fonte** | `finance.CapexInvestment` |

---

### 12.7 OPEX por Área

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-FIN-007 |
| **Fórmula** | `SUM(OpexExpense.amount_brl) GROUP BY cost_center_id → department` |
| **Unidade** | R$ por área |
| **Fonte** | `finance.OpexExpense`, `finance.CostCenter` |

---

### 12.8 CAPEX por Área

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-FIN-008 |
| **Fórmula** | `SUM(CapexInvestment.value_brl) GROUP BY cost_center_id → department` |
| **Unidade** | R$ por área |
| **Fonte** | `finance.CapexInvestment`, `finance.CostCenter` |

---

### 12.9 Orçado vs. Realizado

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-FIN-009 |
| **Conceito** | Comparativo entre o valor orçado aprovado e o valor efetivamente realizado no período, por centro de custo e tipo (OPEX/CAPEX). |
| **Fórmula Realizado** | `SUM(OpexExpense.amount_brl) + SUM(CapexInvestment.value_brl) para o CC e período` |
| **Fórmula Orçado** | `Budget.approved_amount para o CC e tipo` |
| **Fórmula Variância (%)** | `((Realizado − Orçado) / Orçado) × 100` |
| **Unidade** | R$ e % |
| **Fonte** | `finance.Budget`, `finance.OpexExpense`, `finance.CapexInvestment` |
| **Dono** | FINANCIAL_ANALYST |
| **Meta** | Variância entre −5% e +5% (aderência ao orçamento) |
| **Observação** | Variância positiva = estouro; variância negativa = saldo |

---

### 12.10 ROI — Return on Investment

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-FIN-010 |
| **Conceito** | Retorno sobre o investimento total em TI, calculado como a razão entre os benefícios realizados e os custos totais (OPEX + CAPEX). |
| **Fórmula** | `(SUM(benefícios_realizados) / SUM(OPEX + CAPEX do período)) × 100` |
| **Unidade** | % |
| **Fonte** | `project.ProjectBenefit`, `finance.OpexExpense`, `finance.CapexInvestment` |
| **Dono** | IT_MANAGER |
| **Frequência de Cálculo** | Semestral |
| **Meta** | > 100% (benefícios superam os investimentos) |
| **Observação** | `benefícios_realizados` provêm de `ProjectBenefit.financial_value_realized`. Quando não mensuráveis financeiramente, o ROI é qualitativo |

---

## 13. Indicadores de Compras

| Código | Nome | Fórmula Resumida | Meta | Unidade |
|:------:|------|:----------------:|:----:|:-------:|
| KPI-PRC-001 | Compras Abertas | COUNT(PurchaseRequest com status ativo) | — | Inteiro |
| KPI-PRC-002 | Compras Concluídas | COUNT(PurchaseRequest COMPLETED no período) | — | Inteiro |
| KPI-PRC-003 | Lead Time de Compra | AVG(completed_at − submitted_at) | Redução | Dias |
| KPI-PRC-004 | Gasto por Fornecedor | SUM(PO.total_value) GROUP BY supplier_id | — | R$ |
| KPI-PRC-005 | Contratos Ativos | COUNT(Contract WHERE status='ACTIVE') | — | Inteiro |
| KPI-PRC-006 | Contratos Vencendo (90d) | COUNT(Contract WHERE end_date ≤ TODAY+90) | — | Inteiro |
| KPI-PRC-007 | Taxa de Conformidade de Cotação | % compras > R$10k com ≥ 3 cotações | 100% | % |
| KPI-PRC-008 | Saving Gerado | SUM(estimated_value − po.total_value) | Máximo | R$ |
| KPI-PRC-009 | Compras em Atraso | COUNT(PO com prazo vencido sem recebimento) | 0 | Inteiro |
| KPI-PRC-010 | Avaliação Média de Fornecedores | AVG(SupplierRating.overall_score) | ≥ 3,5/5,0 | Decimal |
| KPI-PRC-011 | Concentração de Fornecedor | MAX fornecedor / SUM OPEX total × 100 | ≤ 40% | % |

---

## 14. Indicadores de Projetos

| Código | Nome | Fórmula Resumida | Meta | Unidade |
|:------:|------|:----------------:|:----:|:-------:|
| KPI-PRJ-001 | Projetos Ativos | COUNT(status IN PLANNING, EXECUTION, TESTING, DEPLOYMENT) | — | Inteiro |
| KPI-PRJ-002 | Projetos Concluídos | COUNT(status=CLOSED no período) | — | Inteiro |
| KPI-PRJ-003 | Projetos Atrasados | COUNT(health_status IN YELLOW, RED) | ≤ 20% do portfólio | Inteiro |
| KPI-PRJ-004 | Prazo Planejado vs. Realizado | AVG(actual_end_date − planned_end_date) em dias | ≤ 10% de variância | Dias |
| KPI-PRJ-005 | Custo Planejado vs. Realizado | (Realizado − Orçado) / Orçado × 100 por projeto | ≤ ±10% | % |
| KPI-PRJ-006 | Taxa de Entrega no Prazo | COUNT(fechados sem extensão) / COUNT(fechados) × 100 | ≥ 70% | % |
| KPI-PRJ-007 | Taxa Dentro do Orçamento | COUNT(fechados com variância ≤ 0%) / COUNT(fechados) × 100 | ≥ 75% | % |
| KPI-PRJ-008 | ROI de Projetos | SUM(benefícios_realizados) / SUM(custo_total_projetos) × 100 | > 100% | % |
| KPI-PRJ-009 | Marcos Vencidos | COUNT(Milestone.status=OVERDUE) | 0 | Inteiro |
| KPI-PRJ-010 | Riscos Críticos Ativos | COUNT(ProjectRisk WHERE level=CRITICAL AND status≠CLOSED) | 0 | Inteiro |
| KPI-PRJ-011 | CRs Pendentes de Aprovação | COUNT(ChangeRequest WHERE status=UNDER_ANALYSIS) | ≤ 5 | Inteiro |
| KPI-PRJ-012 | Benefícios Realizados (%) | SUM(realized) / SUM(expected) × 100 | ≥ 80% | % |

---

## 15. Indicadores da Base de Conhecimento

| Código | Nome | Fórmula Resumida | Meta | Unidade |
|:------:|------|:----------------:|:----:|:-------:|
| KPI-KB-001 | Artigos Publicados | COUNT(status='PUBLISHED') | Crescimento | Inteiro |
| KPI-KB-002 | Artigos Utilizados (período) | COUNT(DISTINCT kb_article_id de INC resolvidos) | — | Inteiro |
| KPI-KB-003 | Taxa de Reutilização | COUNT(INC com kb_article_id) / COUNT(INC_CLOSED) × 100 | ≥ 60% | % |
| KPI-KB-004 | Taxa de Sucesso (Helpful Rate) | AVG(helpful_count / (helpful_count + not_helpful_count)) × 100 | ≥ 75% | % |
| KPI-KB-005 | Taxa de Deflexão | deflections / (deflections + chamados) × 100 | ≥ 15% | % |
| KPI-KB-006 | Artigos com Revisão Vencida | COUNT(PUBLISHED WHERE next_review_date < TODAY) | 0 | Inteiro |
| KPI-KB-007 | Cobertura de Serviços | COUNT(serviços com artigo) / COUNT(serviços PUBLISHED) × 100 | ≥ 80% | % |
| KPI-KB-008 | KEDB Ativo | COUNT(WORKAROUND publicado e não depreciado) | — | Inteiro |
| KPI-KB-009 | Tempo Médio de Revisão | AVG(published_at − submitted_for_review_at) | ≤ 3 dias | Dias |
| KPI-KB-010 | Novos Artigos (período) | COUNT(PUBLISHED no período) | Crescimento | Inteiro |

---

## 16. Indicadores das Integrações

| Código | Nome | Fórmula Resumida | Meta | Unidade |
|:------:|------|:----------------:|:----:|:-------:|
| KPI-INT-001 | Sincronizações Executadas | COUNT(SyncExecution.status='COMPLETED' no período) | — | Inteiro |
| KPI-INT-002 | Sincronizações com Falha | COUNT(SyncExecution.status='FAILED' no período) | 0 | Inteiro |
| KPI-INT-003 | Taxa de Sucesso de Sync | COMPLETED / (COMPLETED + FAILED) × 100 | ≥ 99% | % |
| KPI-INT-004 | Disponibilidade da API | Uptime verificado / total × 100 | ≥ 99,5% | % |
| KPI-INT-005 | Latência da API (p95) | p95 dos response_times no período | ≤ 2s | Segundos |
| KPI-INT-006 | Tickets sem Espelho GLPI | COUNT(INC WHERE glpi_ticket_id IS NULL AND status≠CLOSED) | 0 | Inteiro |
| KPI-INT-007 | E-mails Processados | COUNT(EmailMessage WHERE processing_status='PROCESSED' no período) | — | Inteiro |
| KPI-INT-008 | Taxa de Processamento de E-mail | PROCESSED / (PROCESSED + FAILED) × 100 | ≥ 99% | % |
| KPI-INT-009 | DLQ Acumulada | COUNT(dead_letter_queue) | 0 | Inteiro |
| KPI-INT-010 | Divergências GLPI Pendentes | COUNT(GlpiAssetDivergence WHERE resolution='PENDING') | ≤ 10 | Inteiro |
| KPI-INT-011 | Circuit Breakers Abertos | COUNT(circuit_breaker.state='OPEN') | 0 | Inteiro |
| KPI-INT-012 | Webhooks Entregues (%) | webhooks_OK / total_webhooks × 100 | ≥ 98% | % |

---

## 17. Indicadores Estratégicos

---

### 17.1 Maturidade ITIL

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-EST-001 |
| **Conceito** | Índice composto que mede a maturidade de adoção das práticas ITIL v4 pela organização, calculado com base em um conjunto de critérios de avaliação por processo. |
| **Fórmula** | `Média ponderada dos scores de cada processo ITIL avaliado (escala 1–5)` |
| **Componentes** | Gestão de Incidentes, Gestão de Problemas, Gestão de Requisições, Gestão de Ativos, Gestão do Conhecimento, Gestão de SLA, Melhoria Contínua |
| **Unidade** | Decimal (1,0–5,0) |
| **Dono** | IT_MANAGER |
| **Frequência** | Semestral |
| **Meta** | ≥ 3,5 (processo "Definido") |

---

### 17.2 Saúde Operacional

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-EST-002 |
| **Conceito** | Índice composto que resume a saúde geral da operação de TI, combinando indicadores de SLA, MTTR, FCR e CSAT em um único score. |
| **Fórmula** | `(KPI-SLA-001 × 0,40) + (FCR_normalizado × 0,25) + (CSAT_normalizado × 0,20) + (MTTR_score × 0,15)` onde cada componente é normalizado de 0–100 |
| **Unidade** | % (0–100) |
| **Dono** | IT_MANAGER |
| **Frequência** | Mensal |
| **Meta** | ≥ 80% |

---

### 17.3 Saúde Financeira

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-EST-003 |
| **Conceito** | Índice que representa a aderência orçamentária e a eficiência de custos de TI. |
| **Fórmula** | `(Orçamento_dentro_meta × 0,50) + (ROI_score × 0,30) + (Saving_score × 0,20)` |
| **Unidade** | % (0–100) |
| **Dono** | FINANCIAL_ANALYST |
| **Frequência** | Mensal |
| **Meta** | ≥ 75% |

---

### 17.4 Saúde de Compliance

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-EST-004 |
| **Conceito** | Índice que combina Compliance Score, taxa de regularização e apontamentos vencidos em um indicador único de conformidade. |
| **Fórmula** | `(KPI-CMP-001 × 0,50) + (KPI-CMP-003 × 0,30) + ((1 - (vencidos/abertos)) × 100 × 0,20)` |
| **Unidade** | % (0–100) |
| **Dono** | COMPLIANCE_OFFICER |
| **Frequência** | Trimestral |
| **Meta** | ≥ 75% |

---

### 17.5 Saúde dos Projetos

| Atributo | Valor |
|:--------:|-------|
| **Código** | KPI-EST-005 |
| **Conceito** | Índice que mede a saúde geral do portfólio de projetos, combinando taxa de entrega no prazo, aderência orçamentária e benefícios realizados. |
| **Fórmula** | `(KPI-PRJ-006 × 0,40) + (KPI-PRJ-007 × 0,35) + (KPI-PRJ-012 × 0,25)` |
| **Unidade** | % (0–100) |
| **Dono** | IT_MANAGER |
| **Frequência** | Trimestral |
| **Meta** | ≥ 70% |

---

## 18. Faixas de Classificação

### 18.1 Tabela Completa de Faixas por KPI

| Código | KPI | 🟢 Verde (Bom) | 🟡 Amarelo (Atenção) | 🔴 Vermelho (Crítico) |
|:------:|-----|:--------------:|:--------------------:|:---------------------:|
| KPI-SLA-001 | SLA Cumprido | ≥ 90% | 75–89% | < 75% |
| KPI-SLA-002 | SLA Violado | ≤ 10% | 11–25% | > 25% |
| KPI-SLA-003 | SLA 1ª Resposta | ≥ 95% | 80–94% | < 80% |
| KPI-SLA-005 | SLA Resolução | ≥ 90% | 75–89% | < 75% |
| KPI-SLA-007 | TMR | ≤ SLA padrão | SLA+10% | > SLA+10% |
| KPI-ITIL-001 | MTTR | ≤ meta mensal | meta+20% | > meta+20% |
| KPI-ITIL-003 | FCR | ≥ 70% | 50–69% | < 50% |
| KPI-ITIL-004 | Taxa de Reabertura | ≤ 5% | 6–10% | > 10% |
| KPI-ITIL-005 | Taxa de Escalonamento | ≤ 30% | 31–50% | > 50% |
| KPI-INC-004 | Incidentes Críticos Abertos | 0 | 1–2 | ≥ 3 |
| KPI-REQ-009 | CSAT Médio | ≥ 4,0/5,0 | 3,0–3,9 | < 3,0 |
| KPI-AST-004 | Ativos Sem Responsável | 0 | 1–5 | > 5 |
| KPI-AST-011 | Taxa de Utilização do Parque | ≥ 80% | 60–79% | < 60% |
| KPI-IAM-003 | Provisionamentos Pendentes | 0 | 1–3 | > 3 |
| KPI-IAM-006 | MFA em Papéis Críticos | 100% | 90–99% | < 90% |
| KPI-CMP-001 | Compliance Score | ≥ 80% | 60–79% | < 60% |
| KPI-CMP-003 | Taxa de Regularização | ≥ 85% | 70–84% | < 70% |
| KPI-CMP-005 | Apontamentos Vencidos | 0 | 1–5 | > 5 |
| KPI-FIN-009 | Variância Orçamentária | −5% a +5% | +6% a +15% | > +15% |
| KPI-PRC-007 | Conformidade de Cotações | 100% | 90–99% | < 90% |
| KPI-PRC-010 | Avaliação de Fornecedores | ≥ 4,0 | 3,0–3,9 | < 3,0 |
| KPI-PRC-011 | Concentração de Fornecedor | ≤ 30% | 31–40% | > 40% |
| KPI-PRJ-003 | Projetos Atrasados | ≤ 10% portfólio | 11–20% | > 20% |
| KPI-PRJ-006 | Entrega no Prazo | ≥ 70% | 50–69% | < 50% |
| KPI-KB-004 | Helpful Rate | ≥ 75% | 60–74% | < 60% |
| KPI-KB-005 | Taxa de Deflexão | ≥ 15% | 8–14% | < 8% |
| KPI-INT-003 | Taxa de Sucesso de Sync | ≥ 99% | 95–98% | < 95% |
| KPI-INT-004 | Disponibilidade da API | ≥ 99,5% | 99–99,4% | < 99% |
| KPI-INT-009 | DLQ Acumulada | 0 | 1–3 | > 3 |
| KPI-EST-001 | Maturidade ITIL | ≥ 3,5 | 2,5–3,4 | < 2,5 |
| KPI-EST-002 | Saúde Operacional | ≥ 80% | 60–79% | < 60% |
| KPI-EST-003 | Saúde Financeira | ≥ 75% | 55–74% | < 55% |
| KPI-EST-004 | Saúde de Compliance | ≥ 75% | 55–74% | < 55% |
| KPI-EST-005 | Saúde dos Projetos | ≥ 70% | 50–69% | < 50% |

### 18.2 Regra de Classificação Visual

- **Verde 🟢:** KPI dentro da faixa esperada. Nenhuma ação imediata necessária.
- **Amarelo 🟡:** KPI fora da meta mas não crítico. Requer atenção e plano de melhoria.
- **Vermelho 🔴:** KPI em situação crítica. Requer intervenção imediata do IT_MANAGER.

---

## 19. Dashboards Relacionados

| Código KPI | Nome do Indicador | Dashboards que Exibem |
|:----------:|------------------:|:---------------------:|
| KPI-OP-001 | Total de Chamados | Operacional, Executivo |
| KPI-OP-002 | Chamados Abertos | Operacional, Executivo |
| KPI-OP-004 | Backlog | Operacional, Executivo, Estratégico |
| KPI-SLA-001 | SLA Cumprido | Executivo, SLA, Operacional |
| KPI-SLA-002 | SLA Violado | Executivo, SLA |
| KPI-ITIL-001 | MTTR | Executivo, Incidentes, Estratégico |
| KPI-ITIL-002 | MTBF | Incidentes |
| KPI-ITIL-003 | FCR | Incidentes, Executivo, Estratégico |
| KPI-INC-004 | Incidentes Críticos | Executivo, Incidentes, Operacional |
| KPI-REQ-009 | CSAT | Requisições, Executivo, Estratégico |
| KPI-AST-001 | Total de Ativos Ativos | Ativos |
| KPI-AST-008 | Valor Total do Parque | Ativos, Financeiro, Executivo |
| KPI-IAM-001 | Usuários Ativos | Identidades |
| KPI-IAM-006 | MFA Papéis Críticos | Identidades, Compliance |
| KPI-CMP-001 | Compliance Score | Compliance, Executivo, Estratégico |
| KPI-CMP-005 | Apontamentos Vencidos | Compliance, Executivo |
| KPI-FIN-001 | OPEX Total | Financeiro, Executivo |
| KPI-FIN-002 | CAPEX Total | Financeiro, Executivo |
| KPI-FIN-009 | Orçado vs. Realizado | Financeiro, Executivo |
| KPI-FIN-010 | ROI | Executivo, Estratégico |
| KPI-PRC-001 | Compras Abertas | Compras |
| KPI-PRJ-001 | Projetos Ativos | Projetos, Executivo |
| KPI-PRJ-003 | Projetos Atrasados | Projetos, Executivo |
| KPI-KB-005 | Taxa de Deflexão | KB |
| KPI-INT-004 | Disponibilidade da API | Integrações |
| KPI-INT-011 | Circuit Breakers Abertos | Integrações |
| KPI-EST-001 | Maturidade ITIL | Estratégico |
| KPI-EST-002 | Saúde Operacional | Estratégico, Executivo |

---

## 20. Relatórios Relacionados

| Código KPI | Nome do Indicador | Relatórios que Utilizam |
|:----------:|------------------:|:-----------------------:|
| KPI-SLA-001 | SLA Cumprido | SLA-RPT-001, SLA-RPT-004, EXE-RPT-001 |
| KPI-SLA-002 | SLA Violado | SLA-RPT-005, INC-RPT-009 |
| KPI-ITIL-001 | MTTR | INC-RPT-010, EXE-RPT-002 |
| KPI-ITIL-003 | FCR | INC-RPT-002, EXE-RPT-001 |
| KPI-INC-001 | Total de Incidentes | INC-RPT-001 a 010, EXE-RPT-002 |
| KPI-AST-005 | Ativos em Garantia | AST-RPT-006 |
| KPI-AST-009 | Depreciação Acumulada | AST-RPT-008, FIN-RPT-010 |
| KPI-CMP-001 | Compliance Score | CMP-RPT-009, EXE-RPT-004 |
| KPI-CMP-005 | Apontamentos Vencidos | CMP-RPT-002, EXE-RPT-001 |
| KPI-FIN-009 | Orçado vs. Realizado | FIN-RPT-009, EXE-RPT-005 |
| KPI-FIN-010 | ROI | EXE-RPT-007 |
| KPI-PRJ-004 | Prazo Planejado vs. Realizado | PRJ-RPT-001, PRJ-RPT-002 |
| KPI-PRJ-005 | Custo Planejado vs. Realizado | PRJ-RPT-004 |
| KPI-KB-005 | Taxa de Deflexão | KB-RPT-004 |
| KPI-INT-001 | Sincronizações Executadas | INT-RPT-001 |

---

## 21. Auditoria e Rastreabilidade

### 21.1 Rastreabilidade do Cálculo

Para qualquer valor exibido em um KPI, deve ser possível:

1. **Identificar a fórmula** utilizada (via tooltip ou link para este documento).
2. **Identificar a fonte de dados** (tabela e campo).
3. **Decompor o valor** em registros individuais via drill down.
4. **Reproduzir o cálculo** com os mesmos dados e período para obter resultado idêntico.

### 21.2 Imutabilidade de Valores Históricos

- Valores de KPI de períodos passados são calculados sobre dados históricos imutáveis.
- Nenhuma correção retroativa de KPI é permitida sem registro formal em audit_log.
- Ajustes de dados históricos (ex.: reclassificação de incidente) podem alterar KPIs históricos; esta alteração é registrada.

### 21.3 Rastreabilidade por Aggregation Log

Para KPIs calculados por jobs em background (ex.: MTTR mensal, Compliance Score), o resultado de cada execução é armazenado com:

| Campo | Descrição |
|:-----:|-----------|
| `kpi_code` | Código oficial do KPI (ex.: KPI-ITIL-001) |
| `period_start` | Início do período calculado |
| `period_end` | Fim do período calculado |
| `value` | Valor calculado |
| `record_count` | Quantidade de registros que compõem o cálculo |
| `calculated_at` | Timestamp do cálculo |
| `job_name` | Job que executou o cálculo |
| `formula_version` | Versão da fórmula utilizada (rastreia mudanças de fórmula) |

---

## 22. Regras de Negócio

---

**KPI-001** — Todos os dashboards devem utilizar exclusivamente os KPIs oficiais definidos neste documento
Nenhum dashboard ou relatório do SGTI pode calcular indicadores com fórmulas diferentes das definidas neste catálogo. Implementações alternativas requerem atualização formal deste documento com aprovação do IT_MANAGER.

---

**KPI-002** — Todos os relatórios devem utilizar os KPIs oficiais
Relatórios que exibam métricas de desempenho devem referenciar os códigos de KPI deste catálogo (ex.: KPI-SLA-001) para garantir rastreabilidade e consistência.

---

**KPI-003** — Todo KPI deve possuir fórmula documentada
Não é permitido exibir indicador sem fórmula registrada neste catálogo. A adição de novos KPIs requer atualização deste documento antes da implementação.

---

**KPI-004** — Todo KPI deve possuir origem rastreável
A fonte de dados de cada KPI é declarada explicitamente. Consultas que calculam KPIs devem referenciar apenas as tabelas e campos declarados na seção "Fonte" do indicador.

---

**KPI-005** — Todo KPI deve ser auditável
Qualquer valor de KPI exibido pode ser decomposto em registros individuais via drill down ou relatório de detalhe, sem exceção.

---

**KPI-006** — Faixas de classificação aplicadas consistentemente em todos os pontos de exibição
As faixas verde/amarelo/vermelho definidas na seção 18 são aplicadas em todos os lugares onde o KPI é exibido (dashboard, relatório, e-mail). Nenhum ponto de exibição usa faixas diferentes.

---

**KPI-007** — SLA calculado com desconto de pausas em todos os indicadores relevantes
KPI-SLA-001, KPI-SLA-005 e KPI-SLA-007 sempre descontam o tempo de pausa registrado em `ticket.SLAHistory`. Cálculos sem este desconto são inválidos.

---

**KPI-008** — MTTR inclui tempo total; TMR exclui pausas
KPI-ITIL-001 (MTTR) usa tempo total desde criação até resolução sem descontos. KPI-SLA-007 (TMR) desconta pausas. Esta distinção é preservada em todo o sistema.

---

**KPI-009** — FCR calculado apenas sobre chamados CLOSED
KPI-ITIL-003 considera apenas chamados com status CLOSED no período. Chamados abertos não entram no denominador.

---

**KPI-010** — Chamados cancelados excluídos de todos os cálculos de desempenho
Status CANCELLED não entra no cálculo de SLA, MTTR, FCR e outros indicadores de desempenho. Entram apenas em contagens de volume quando explicitamente especificado.

---

**KPI-011** — MTBF calculado por serviço individualmente
KPI-ITIL-002 nunca é calculado globalmente como média geral sem distinção por serviço. O valor global é a média ponderada por volume de incidentes de cada serviço.

---

**KPI-012** — Compliance Score calculado apenas ao concluir auditoria
KPI-CMP-001 é recalculado exclusivamente quando uma auditoria muda para status COMPLETED. O valor não é recalculado durante a execução da auditoria.

---

**KPI-013** — Variância orçamentária com sinal indicativo de direção
No KPI-FIN-009, valores positivos indicam estouro do orçamento; valores negativos indicam saldo disponível. Esta convenção é consistente em dashboards e relatórios.

---

**KPI-014** — ROI calculado apenas sobre benefícios com valor financeiro mensurado
KPI-FIN-010 considera apenas benefícios com `financial_value_realized > 0`. Benefícios qualitativos não entram no cálculo numérico; são documentados separadamente.

---

**KPI-015** — KPIs de SLA segmentados por política aplicada
Quando o dashboard permite filtrar por serviço, os KPIs de SLA são calculados considerando a política de SLA específica de cada serviço, não uma política genérica.

---

**KPI-016** — Taxa de deflexão calculada apenas com clique explícito do usuário
KPI-KB-005 conta como deflexão apenas quando o usuário clicou em "Isso resolveu meu problema". Consultas sem clique não são deflexões.

---

**KPI-017** — Ativos depreciados: definição baseada no valor atual ≤ valor residual
KPI-AST-007 classifica como depreciado qualquer ativo onde `current_value ≤ residual_value`, independentemente da data de fim de vida útil.

---

**KPI-018** — Saving de compras calculado como diferença entre estimado e PO aprovado
KPI-PRC-008 usa `estimated_value` da solicitação original, não o valor de cotações. O valor negativo (estouro) é exibido em vermelho.

---

**KPI-019** — Usuários inativos excluídos de todos os KPIs de identidades em atividade
KPI-IAM-001 a KPI-IAM-013 consideram apenas usuários com `status = 'ACTIVE'`, exceto quando explicitamente indicado (ex.: KPI-IAM-009 conta usuários que foram para INACTIVE).

---

**KPI-020** — Maturidade ITIL: escala de 1 a 5 com critérios documentados por nível
O KPI-EST-001 usa a escala de maturidade: 1=Inicial, 2=Em Desenvolvimento, 3=Definido, 4=Gerenciado, 5=Otimizado. Os critérios de cada nível por processo são documentados no módulo de Configuração.

---

**KPI-021** — KPIs de volume: contagem por período de criação, não de fechamento
KPI-OP-001, KPI-INC-001, KPI-REQ-001 contam chamados pelo `created_at` no período. KPI-OP-003, KPI-INC-003 contam pelo `closed_at`. Esta distinção é mantida rigorosamente.

---

**KPI-022** — Helpful Rate: artigos com menos de 10 avaliações exibem "N/A" em vez de taxa
Para evitar distorções, o KPI-KB-004 (Helpful Rate) exibe "N/A" para artigos com menos de 10 votos totais. A taxa geral usa apenas artigos com ≥ 10 avaliações.

---

**KPI-023** — Taxa de Reabertura: cada reabertura conta uma vez por chamado no período
Um chamado reaberto 3 vezes no período conta como 1 no numerador do KPI-ITIL-004, não como 3, para não inflar artificialmente a taxa.

---

**KPI-024** — Taxa de Escalonamento: contada no momento do escalonamento
KPI-ITIL-005 conta chamados que foram escalonados pelo menos uma vez, não o número de escalonamentos. Chamado escalonado 2 vezes conta como 1.

---

**KPI-025** — Provisionamentos Pendentes: inclui apenas usuários com tentativas dentro de 3h
KPI-IAM-003 conta apenas usuários com `status = 'PENDING_PROVISIONING'` criados há menos de 3 horas (dentro do período de retry automático). Após 3h sem resolver, é tratado como falha.

---

**KPI-026** — Disponibilidade de API calculada como uptime verificado externamente
KPI-INT-004 é calculado com base em verificações do endpoint `/health` por serviço de monitoramento externo, não por autodiagnóstico do SGTI.

---

**KPI-027** — Taxa de Conformidade de Cotações: denominador inclui apenas compras aprovadas
KPI-PRC-007 usa no denominador apenas compras com valor > R$10.000 que chegaram ao status APPROVED ou além. Compras rejeitadas ou canceladas são excluídas.

---

**KPI-028** — Projetos Atrasados: health_status calculado diariamente pelo ProjectHealthJob
KPI-PRJ-003 é alimentado exclusivamente pelo `health_status` calculado pelo `ProjectHealthJob`. Nenhuma regra alternativa de cálculo de atraso é usada no SGTI.

---

**KPI-029** — Cobertura de Serviços da KB: considera serviços com status PUBLISHED no catálogo
KPI-KB-007 usa no denominador apenas serviços com `status = 'PUBLISHED'` no catálogo de serviços. Serviços desativados são excluídos.

---

**KPI-030** — Tempo Médio de Provisionamento: do convite à ativação
KPI-IAM-010 calcula `AVG(ACTIVE_at − INVITED_at)` apenas para usuários que completaram o ciclo INVITED → ACTIVE no período. Usuários em PENDING_PROVISIONING não entram.

---

**KPI-031** — Backlog Crítico: atualizado a cada 5 minutos pelo SlaMonitoringJob
KPI-OP-005 é recalculado pelo `SlaMonitoringJob` a cada 5 minutos. O valor exibido no dashboard pode ter defasagem de até 5 minutos em relação ao estado real.

---

**KPI-032** — CSAT Médio: calculado apenas sobre avaliações enviadas (não forçadas)
KPI-REQ-009 considera apenas registros onde `satisfaction_score IS NOT NULL`. Chamados sem avaliação não entram no cálculo (não são tratados como nota 0).

---

**KPI-033** — Indicadores de área filtrados pelo departamento do solicitante
KPI-OP-010, KPI-INC-007 e KPI-REQ-005 usam o `department_id` do solicitante (`requester.department_id`), não do analista responsável.

---

**KPI-034** — Taxa de utilização do parque: exclui ativos em manutenção do numerador
KPI-AST-011 calcula `COUNT(status=IN_USE) / COUNT(todos os ativos ativos)`. Ativos em UNDER_MAINTENANCE são contados no denominador mas não no numerador, refletindo a real utilização produtiva.

---

**KPI-035** — KPIs calculados em UTC; exibidos no timezone do usuário
Todos os cálculos de KPI (timestamps) são realizados em UTC. A conversão para o timezone local do usuário ocorre apenas na exibição.

---

**KPI-036** — Lead Time de Compra: calculado apenas sobre compras COMPLETED
KPI-PRC-003 usa `AVG(completed_at − submitted_at)` apenas para compras com status COMPLETED. Compras em andamento não entram no cálculo.

---

**KPI-037** — Saving negativo exibido explicitamente, sem mascarar
KPI-PRC-008 exibe valor negativo (estouro em relação ao estimado) sem conversão para zero ou valor absoluto. O sinal negativo é exibido com cor vermelha.

---

**KPI-038** — Benefícios Realizados: medidos 6 meses após o encerramento do projeto
KPI-PRJ-012 considera apenas benefícios com `realization_date ≤ TODAY`, garantindo que apenas benefícios efetivamente medidos entram no cálculo.

---

**KPI-039** — Taxa de Regularização de Compliance: exclui apontamentos NA
Apontamentos com status `NOT_APPLICABLE` são excluídos do numerador e denominador do KPI-CMP-003. Não aplicável ≠ não regularizado.

---

**KPI-040** — Divergências GLPI: apenas divergências com status PENDING contam
KPI-INT-010 conta apenas `GlpiAssetDivergence WHERE resolution = 'PENDING'`. Divergências já resolvidas não impactam o KPI.

---

**KPI-041** — Novas versões de fórmula registradas com versionamento
Ao alterar a fórmula de um KPI, a versão anterior é preservada no histórico com a data de vigência. Valores históricos calculados com a versão anterior são sinalizados.

---

**KPI-042** — KPIs de integrações: atualizados pelo job de monitoramento, não em tempo real
KPI-INT-001 a KPI-INT-012 são calculados pelo `IntegrationMonitoringJob` a cada 30 minutos. A atualização em tempo real não é aplicável para estes indicadores.

---

**KPI-043** — Faixa de classificação do CSAT: escala 1–5 (não 1–10 ou 0–5)
O CSAT no SGTI usa escala 1–5 (estrelas). As faixas verde/amarelo/vermelho são definidas para esta escala. Sem exceções.

---

**KPI-044** — Taxa de MFA: papéis críticos têm meta separada da meta geral
KPI-IAM-005 (geral) e KPI-IAM-006 (papéis críticos) têm metas e faixas de classificação distintas. A meta 100% é exigida para papéis críticos; a meta geral é menor.

---

**KPI-045** — Saúde Operacional (composto): componentes recalculados mensalmente
KPI-EST-002 é recalculado no primeiro dia útil de cada mês com os dados do mês anterior. Não é calculado em tempo real.

---

**KPI-046** — KPIs de volume exibem variação percentual vs. período anterior equivalente
Contadores de volume em dashboards executivos exibem sempre a variação em relação ao período anterior equivalente (ex.: mês anterior, mesmo mês do ano anterior).

---

**KPI-047** — Artigos com status DEPRECATED excluídos de todos os KPIs de KB
KPI-KB-001 a KPI-KB-010 consideram apenas artigos com `status = 'PUBLISHED'`. Artigos DEPRECATED, DRAFT e DRAFT_AI são excluídos de todos os cálculos.

---

**KPI-048** — Projetos estratégicos reportados separadamente nos indicadores executivos
KPI-PRJ-001 a KPI-PRJ-012 podem ser filtrados por `strategic = true` para exibição exclusiva dos projetos estratégicos no dashboard executivo.

---

**KPI-049** — Orçamento base para variância: valor aprovado (não previsto)
No KPI-FIN-009, o denominador da variância é sempre `Budget.approved_amount`. O `planned_amount` (previsto inicial) não é usado como base de comparação.

---

**KPI-050** — KEDB: workarounds depreciados excluídos da contagem ativa
KPI-PRB-004 conta apenas workarounds com artigos KB publicados e com `status ≠ 'DEPRECATED'`. Workarounds depreciados ao resolver o problema não são contados como ativos.

---

**KPI-051** — SLA de incidentes calculado separadamente do SLA de requisições
KPI-SLA-001 a KPI-SLA-007 podem ser filtrados por type='INCIDENT' ou type='REQUEST'. O valor geral é a média ponderada por volume dos dois tipos.

---

**KPI-052** — Taxa de escalonamento: baseada em escalonamento explícito, não em reatribuição
KPI-ITIL-005 conta apenas chamados onde `was_escalated = true` (escalonamento formal para grupo N2/N3). Reatribuições entre analistas do mesmo nível não são escalonamento.

---

**KPI-053** — Concentração de fornecedor: calculada sobre OPEX + CAPEX do período
KPI-PRC-011 usa como denominador `SUM(OpexExpense) + SUM(CapexInvestment)` do período completo de TI, não apenas as compras do período.

---

**KPI-054** — Maturidade ITIL atualizada apenas após avaliação formal
KPI-EST-001 é atualizado apenas após avaliação formal conduzida semestralmente. Não é calculado automaticamente com base em outros KPIs.

---

**KPI-055** — Tempo médio de desprovisionamento: da aprovação da requisição à conta inativada
KPI-IAM-011 mede `DEPROVISIONED_at − request_approved_at`, não o tempo desde a solicitação. O prazo de 2 horas SLA é contado a partir da aprovação.

---

**KPI-056** — Chamados reabertos e chamados de reabertura são o mesmo objeto
A reabertura de um chamado CLOSED altera o `status` do chamado original; não cria um novo chamado. O `reopened_count` do chamado original é incrementado.

---

**KPI-057** — Ativos em garantia: garantia vigente na data de cálculo
KPI-AST-005 usa `WARRANTY_END >= TODAY` no momento do cálculo. Não considera garantias futuras (não iniciadas).

---

**KPI-058** — KPI de projetos atrasados: calculado pelo ProjectHealthJob, não por data de fim
KPI-PRJ-003 é baseado em `health_status IN (YELLOW, RED)` calculado pelo job, que considera tanto atraso de prazo quanto estouro orçamentário.

---

**KPI-059** — Taxa de reutilização de KB: contabiliza uso único por incidente
KPI-KB-003 conta o número de incidentes que usaram algum artigo KB, não o número de visualizações. Cada incidente conta uma vez, mesmo que use múltiplos artigos.

---

**KPI-060** — Custo de TI por usuário: total de OPEX + CAPEX dividido por usuários ativos
O indicador estratégico de custo por usuário usa `SUM(OPEX + CAPEX) / COUNT(usuarios_ACTIVE)` no período. Usuários inativos no período são excluídos do denominador.

---

**KPI-061** — KPIs de disponibilidade: calculados em janela de 24 horas corridas
KPI-INT-004 é calculado na janela das últimas 24 horas corridas, não em janela de calendário (dia útil/não útil). Disponibilidade é calculada 24×7.

---

**KPI-062** — FCR não considera transferências de grupo como escalonamento
KPI-ITIL-003 considera como FCR chamados que foram transferidos apenas entre analistas do mesmo grupo (N1). Transferência para grupo diferente é escalonamento e exclui do FCR.

---

**KPI-063** — Orçado vs. realizado: comprometidos somados ao realizado para saldo disponível
O saldo disponível (denominador de KPI-FIN-009) considera `orçado − (realizado + comprometido)`. Valores comprometidos em POs emitidos reduzem o saldo disponível.

---

**KPI-064** — Taxa de conformidade de compliance: exclui controles NOT_APPLICABLE
KPI-CMP-002 usa no denominador apenas `COUNT(controles WHERE status ≠ 'NOT_APPLICABLE')`, pois controles não aplicáveis não devem impactar o percentual.

---

**KPI-065** — Indicadores de SLA: feriados e horários de suporte configurados pelo IT_MANAGER
As políticas de SLA definem horário de suporte e feriados. O cálculo de tempo decorrido para KPIs de SLA usa apenas horas dentro do horário de suporte configurado, quando aplicável.

---

**KPI-066** — Compliance Score global: média ponderada dos scores por norma
O Compliance Score global (KPI-CMP-001 agregado) é a média ponderada dos scores de cada norma ativa. O peso de cada norma é configurável pelo SUPER_ADMIN.

---

**KPI-067** — Chamados por analista: inclui apenas chamados com atribuição confirmada
KPI-OP-009 conta chamados onde `assignee_id IS NOT NULL`. Chamados em grupo sem analista individual atribuído não entram na contagem individual.

---

**KPI-068** — Taxa de cancelamento de requisições: calculada sobre total criado no período
KPI-REQ-008 usa como denominador `COUNT(REQ created_at no período)`, não apenas as concluídas. Isto inclui canceladas, abertas e concluídas.

---

**KPI-069** — KPIs de backlog incluem apenas chamados de suporte (excluem rascunhos)
KPI-OP-004 e KPI-OP-005 excluem chamados com status DRAFT (rascunhos não submetidos). O backlog conta apenas chamados formalmente submetidos e em processamento.

---

**KPI-070** — Indicadores de identidades: cálculo por tenant isolado
KPI-IAM-001 a KPI-IAM-013 são sempre calculados por `tenant_id`. Nunca há agregação cross-tenant mesmo para relatórios executivos.

---

**KPI-071** — Licenças subutilizadas: média de utilização dos últimos 3 meses
KPI-AST-013 não usa o percentual de uso instantâneo, mas a média dos últimos 3 meses (`AVG(usage_pct) dos últimos 90 dias`). Isso evita falsos positivos por sazonalidade.

---

**KPI-072** — Taxa de entrega no prazo de projetos: sem extensão de nenhum parâmetro
KPI-PRJ-006 considera como "no prazo" apenas projetos fechados onde `actual_end_date ≤ planned_end_date (versão baseline v1.0)`. Mudanças aprovadas de prazo não alteram este critério.

---

**KPI-073** — Webhooks entregues: tentativas com sucesso no primeiro envio
KPI-INT-012 conta webhooks entregues com HTTP 2xx na primeira tentativa. Entregas que precisaram de retry são contadas como "entregue" mas sinalizadas separadamente.

---

**KPI-074** — Gasto por fornecedor: inclui todos os POs pagos e recebidos no período
KPI-PRC-004 considera POs com `status IN ('RECEIVED', 'COMPLETED')` com data de recebimento no período. POs emitidos mas não recebidos são "comprometidos", não "gastos".

---

**KPI-075** — Saúde dos Projetos: calculada sobre portfólio ativo (exclui ON_HOLD e CANCELLED)
KPI-EST-005 exclui projetos com status ON_HOLD e CANCELLED do cálculo dos componentes. Apenas projetos no ciclo ativo contribuem para o índice.

---

**KPI-076** — Contratos ativos: contagem na data de cálculo
KPI-PRC-005 conta contratos onde `start_date ≤ TODAY AND end_date ≥ TODAY AND status = 'ACTIVE'`. Contratos futuros (start_date > TODAY) não são "ativos".

---

**KPI-077** — MTBF mínimo: pelo menos 2 incidentes necessários para o cálculo
KPI-ITIL-002 exige pelo menos 2 incidentes no período para calcular o MTBF de um serviço. Com apenas 1 incidente, exibe "N/A — dados insuficientes".

---

**KPI-078** — KPIs de compliance: apontamentos reabertos contam novamente como abertos
Ao reabrir apontamento (CONCLUDED → NEW), o apontamento volta a ser contado nos KPIs de apontamentos abertos (KPI-CMP-004) e seu prazo original é redefinido.

---

**KPI-079** — Indicador de saúde operacional: CSAT normalizado considera apenas escala 1–5
Na fórmula de KPI-EST-002, o CSAT é normalizado para escala 0–100: `(CSAT_medio − 1) / 4 × 100`. Nota 5,0 = 100%; nota 1,0 = 0%.

---

**KPI-080** — KPIs pré-computados: cache invalidado após job concluir
Quando um job recalcula um KPI pré-computado (ex.: DepreciationJob, SlaMonitoringJob), o cache Redis do dashboard correspondente é invalidado imediatamente para forçar exibição do valor atualizado.

---

**KPI-081** — Chamados por área: contagem do período, não snapshot atual
KPI-OP-010 conta chamados criados no período por área, não o estado atual da fila. É uma métrica de fluxo (flow metric), não de estoque (stock metric).

---

**KPI-082** — Taxa de sucesso de KB: inclui artigos de todos os tipos
KPI-KB-004 (Helpful Rate) inclui artigos de todos os tipos (SOLUTION, PROCEDURE, FAQ, MANUAL, WORKAROUND, POLICY, LESSON_LEARNED, REFERENCE) publicados.

---

**KPI-083** — Taxa de reutilização de KB: numerador considera apenas incidentes CLOSED
KPI-KB-003 usa como numerador `COUNT(INC_CLOSED WHERE kb_article_id IS NOT NULL)` e como denominador `COUNT(INC_CLOSED no período)`. Incidentes abertos são excluídos.

---

**KPI-084** — Compliance Score por norma: calculado apenas sobre controles da norma avaliada
KPI-CMP-001 calculado para uma norma específica usa apenas os NormItems daquela norma como denominador. Controles de outras normas não interferem no score individual.

---

**KPI-085** — KPIs de identidade: papéis transversais incluídos nas contagens por papel
KPI-IAM-001 a KPI-IAM-013 incluem usuários com papéis transversais (FINANCIAL_ANALYST, PROJECT_MANAGER, AUDITOR, EXECUTIVE) nas contagens gerais.

---

**KPI-086** — Lead Time de compra: contado em dias corridos, não úteis
KPI-PRC-003 usa dias corridos (não dias úteis) para o cálculo do lead time, pois inclui tempo de espera de fornecedor que ocorre fora do horário comercial.

---

**KPI-087** — Taxa de reabertura: denominador são chamados fechados no período
KPI-ITIL-004 usa como denominador `COUNT(chamados CLOSED no período)`, não o total histórico. Isto reflete a qualidade das resoluções realizadas especificamente no período.

---

**KPI-088** — Indicadores financeiros: conversão de moeda estrangeira pelo câmbio do dia da transação
Para lançamentos em USD ou EUR, o valor em R$ usado nos KPIs financeiros é o registrado no campo `amount_brl` no momento do lançamento, que usa o câmbio do dia da transação.

---

**KPI-089** — OPEX e CAPEX de projetos: deduzidos do total OPEX/CAPEX quando segmentados
KPI-FIN-005 e KPI-FIN-006 mostram apenas custos vinculados a projetos. Para o total geral (KPI-FIN-001 e KPI-FIN-002), os custos de projetos são incluídos, não deduzidos.

---

**KPI-090** — Indicadores operacionais: sem distinção entre incidentes e requisições por padrão
KPI-OP-001 a KPI-OP-010 agregam incidentes e requisições. Quando o contexto exige separação, os KPIs específicos de incidentes (seção 6) e de requisições (seção 7) são utilizados.

---

**KPI-091** — Taxa de conformidade de cotações: exibe "N/A" se não há compras > R$10k no período
KPI-PRC-007 exibe "N/A" (sem dados) quando não existem compras > R$10.000 no período selecionado, evitando exibir 100% por ausência de dados.

---

**KPI-092** — Ativos ociosos: apenas ativos com status IN_STOCK contam
KPI-AST-014 conta apenas ativos com `status = 'IN_STOCK'` sem movimentação por mais de 180 dias. Ativos em outras situações não são ociosos por definição.

---

**KPI-093** — Sincronizações com falha: contam job completo como falha, não item individual
KPI-INT-002 conta execuções de `SyncExecution` com `status = 'FAILED'`, não registros individuais com erro dentro de uma execução bem-sucedida.

---

**KPI-094** — Indicadores de projetos: marcos bloqueantes têm peso dobrado no health status
No cálculo do `health_status` que alimenta KPI-PRJ-003, marcos com `blocking = true` em atraso contribuem com peso dobrado para a classificação YELLOW/RED.

---

**KPI-095** — DLQ: considera apenas mensagens não reprocessadas
KPI-INT-009 conta apenas mensagens na Dead Letter Queue com `status = 'PENDING'` (não reprocessadas). Mensagens já reprocessadas com sucesso ou descartadas formalmente não contam.

---

**KPI-096** — Tempo médio de atendimento: contabiliza horário de suporte configurado
KPI-SLA-006 (TMA) usa apenas tempo dentro do horário de suporte para chamados com política de SLA de horário comercial. Para chamados 24×7, usa tempo total.

---

**KPI-097** — Indicadores de compras: POs parcialmente recebidos não contam como COMPLETED
KPI-PRC-002 conta apenas POs com `status = 'COMPLETED'` (todos os itens recebidos). POs com `status = 'PARTIALLY_RECEIVED'` contam como abertos.

---

**KPI-098** — Saúde financeira: orçamento calculado apenas sobre centros de custo ativos
KPI-EST-003 usa apenas CostCenters com `is_active = true`. CCs inativados no período são excluídos do cálculo de aderência orçamentária.

---

**KPI-099** — KPIs com meta configurable: valores padrão definidos neste documento são o baseline
Os valores de meta definidos na coluna "Meta" de cada KPI neste catálogo são os valores padrão (baseline). O IT_MANAGER pode ajustar as metas via painel de configuração, mas deve documentar a justificativa.

---

**KPI-100** — Novos KPIs adicionados ao catálogo antes de serem exibidos em qualquer dashboard ou relatório
Nenhum indicador pode ser adicionado a dashboards ou relatórios sem primeiro ser registrado neste catálogo com todos os atributos obrigatórios (código, nome, conceito, fórmula, fonte, dono, frequência, meta, faixas).

---

## 23. Critérios de Aceitação

### 23.1 Catálogo e Governança

- [ ] **CA-01:** Todo KPI exibido em dashboard tem código único mapeado neste catálogo.
- [ ] **CA-02:** Todo KPI tem fórmula documentada e acessível via tooltip na interface.
- [ ] **CA-03:** Todo KPI tem faixa verde/amarelo/vermelho definida na seção 18.
- [ ] **CA-04:** Faixas de classificação aplicadas consistentemente em todos os pontos de exibição do mesmo KPI.
- [ ] **CA-05:** Alteração de fórmula de KPI gera nova versão com histórico preservado.

### 23.2 Cálculos e Fórmulas

- [ ] **CA-06:** KPI-SLA-001 a KPI-SLA-007 descontam pausas corretamente (PENDING_USER, feriados).
- [ ] **CA-07:** KPI-ITIL-001 (MTTR) inclui pausas; KPI-SLA-007 (TMR) exclui pausas.
- [ ] **CA-08:** KPI-ITIL-003 (FCR) calculado apenas sobre chamados CLOSED.
- [ ] **CA-09:** KPI-CMP-001 (Compliance Score) calculado apenas ao concluir auditoria (status = COMPLETED).
- [ ] **CA-10:** KPI-FIN-009 variância positiva indica estouro; negativa indica saldo.
- [ ] **CA-11:** KPI-KB-005 (deflexão) contabiliza apenas cliques explícitos do usuário.
- [ ] **CA-12:** KPI-ITIL-002 (MTBF) exibe "N/A" para serviços com < 2 incidentes no período.
- [ ] **CA-13:** KPI-KB-004 (Helpful Rate) exibe "N/A" para artigos com < 10 avaliações.
- [ ] **CA-14:** Chamados CANCELLED excluídos de todos os cálculos de SLA e desempenho.

### 23.3 Rastreabilidade e Auditoria

- [ ] **CA-15:** Todo valor de KPI pode ser decomposto em registros individuais via drill down.
- [ ] **CA-16:** KPIs pré-computados armazenados com `kpi_code`, `period_start`, `period_end`, `value` e `calculated_at`.
- [ ] **CA-17:** Valores históricos de KPI são imutáveis (não sofrem recálculo retroativo não documentado).
- [ ] **CA-18:** Auditoria de execução de KPI disponível no audit_log com `action = KPI_CALCULATED`.

### 23.4 Consistência entre Dashboards e Relatórios

- [ ] **CA-19:** Dashboard Executivo usa exclusivamente KPIs da seção 3 (operacionais), 4 (SLA), 5 (ITIL), 12 (financeiro) e 17 (estratégico).
- [ ] **CA-20:** Relatório INC-RPT-002 usa KPI-ITIL-001 (MTTR) e KPI-ITIL-003 (FCR) com as fórmulas exatas definidas neste catálogo.
- [ ] **CA-21:** Dashboard de Compliance usa KPI-CMP-001 a KPI-CMP-006 sem cálculos alternativos.
- [ ] **CA-22:** Relatório FIN-RPT-009 usa exatamente a fórmula do KPI-FIN-009 (variância sobre `approved_amount`).

### 23.5 Faixas e Alertas Visuais

- [ ] **CA-23:** KPI-OP-005 (Backlog Crítico) em vermelho quando > 0.
- [ ] **CA-24:** KPI-IAM-006 (MFA Papéis Críticos) em vermelho quando < 100%.
- [ ] **CA-25:** KPI-CMP-005 (Apontamentos Vencidos) em vermelho quando > 0.
- [ ] **CA-26:** KPI-INT-009 (DLQ) em vermelho quando > 0.
- [ ] **CA-27:** Gauge de SLA exibe linha de meta (ex.: 90%) como referência visual.

### 23.6 Metas e Configuração

- [ ] **CA-28:** Metas de KPIs configuráveis pelo IT_MANAGER via painel de configuração.
- [ ] **CA-29:** Alteração de meta registrada em audit_log com valor anterior, novo valor e justificativa.
- [ ] **CA-30:** KPI com meta alterada exibe o novo threshold nas faixas de cor imediatamente.

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação com 23 seções, 100 regras KPI e 30 critérios de aceitação |

---

> **Documentos relacionados:**
> [`60_DASHBOARDS.md`](./60_DASHBOARDS.md) — Dashboards (consumidores deste catálogo)
> [`61_REPORTS.md`](./61_REPORTS.md) — Relatórios (consumidores deste catálogo)
> [`40_INCIDENT_MANAGEMENT.md`](./40_INCIDENT_MANAGEMENT.md) — Fonte de KPIs de incidentes
> [`46_FINANCIAL_MANAGEMENT.md`](./46_FINANCIAL_MANAGEMENT.md) — Fonte de KPIs financeiros
