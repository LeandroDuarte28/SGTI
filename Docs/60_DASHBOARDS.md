# SGTI — Sistema de Gestão de Tecnologia da Informação
## Dashboards e Painéis de Controle — Documentação Funcional

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [20_DATABASE.md](./20_DATABASE.md) · [40_INCIDENT_MANAGEMENT.md](./40_INCIDENT_MANAGEMENT.md) · [46_FINANCIAL_MANAGEMENT.md](./46_FINANCIAL_MANAGEMENT.md) · [45_COMPLIANCE.md](./45_COMPLIANCE.md) · [48_PROJECT_MANAGEMENT.md](./48_PROJECT_MANAGEMENT.md)

---

## Sobre este Documento

Este documento define a **especificação funcional completa de todos os dashboards do SGTI**, cobrindo KPIs, gráficos, filtros, drill down, permissões, performance e regras de negócio.

**Escopo:** documentação funcional. Nenhum código, SQL ou API é gerado neste documento.

---

## Premissas Globais

### Filtros Universais

Todos os dashboards possuem obrigatoriamente os seguintes filtros, aplicados globalmente a todos os componentes do painel:

| Filtro | Tipo | Comportamento |
|:------:|:----:|:-------------:|
| **Período** | Seletor de data (início / fim) + atalhos (hoje, 7d, 30d, 90d, ano, custom) | Padrão: últimos 30 dias |
| **Área / Departamento** | Multi-select de departamentos | Padrão: todos |
| **Analista** | Multi-select de usuários ativos | Padrão: todos |
| **Categoria** | Multi-select de categorias do módulo | Padrão: todas |
| **Serviço** | Multi-select do catálogo de serviços | Padrão: todos |

### Exportações Universais

Todos os dashboards oferecem exportação em dois formatos:

| Formato | Conteúdo | Disponível para |
|:-------:|:--------:|:---------------:|
| **PDF** | Captura visual do dashboard com filtros aplicados, cabeçalho corporativo e timestamp | IT_SPECIALIST+ |
| **Excel** | Dados tabulares de cada componente em abas separadas | FINANCIAL_ANALYST, IT_MANAGER+ |

### Atualização em Tempo Real

- Dashboards operacionais: atualização via **Supabase Realtime** com latência ≤ 5 segundos.
- Dashboards executivos: atualização periódica (polling) a cada **5 minutos**.
- Badge de "última atualização" exibido em todos os painéis.

---

## Sumário

1. [Dashboard Executivo](#1-dashboard-executivo)
2. [Dashboard Operacional](#2-dashboard-operacional)
3. [Dashboard de Incidentes](#3-dashboard-de-incidentes)
4. [Dashboard de Requisições](#4-dashboard-de-requisições)
5. [Dashboard de Problemas](#5-dashboard-de-problemas)
6. [Dashboard de Ativos](#6-dashboard-de-ativos)
7. [Dashboard de Identidades](#7-dashboard-de-identidades)
8. [Dashboard de Compliance](#8-dashboard-de-compliance)
9. [Dashboard Financeiro](#9-dashboard-financeiro)
10. [Dashboard de Compras](#10-dashboard-de-compras)
11. [Dashboard de Projetos](#11-dashboard-de-projetos)
12. [Dashboard de Base de Conhecimento](#12-dashboard-de-base-de-conhecimento)
13. [Dashboard de Integrações](#13-dashboard-de-integrações)
14. [Dashboard de SLA](#14-dashboard-de-sla)
15. [Dashboard Estratégico](#15-dashboard-estratégico)
16. [Drill Down](#16-drill-down)
17. [Permissões por Perfil](#17-permissões-por-perfil)
18. [Requisitos de Performance](#18-requisitos-de-performance)
19. [Regras de Negócio](#19-regras-de-negócio)
20. [Critérios de Aceitação](#20-critérios-de-aceitação)

---

## 1. Dashboard Executivo

### 1.1 Objetivo

Prover à Diretoria e à alta gestão uma visão consolidada e estratégica do desempenho dos serviços de TI, investimentos e conformidade, sem necessidade de navegar entre módulos específicos.

**Audiência:** IT_MANAGER, EXECUTIVE, Diretoria.
**Atualização:** A cada 5 minutos.

---

### 1.2 Seção: Chamados — Visão Geral

| KPI | Fórmula | Visualização | Cor |
|:---:|---------|:------------:|:---:|
| **Chamados Abertos** | COUNT(status ≠ CLOSED, RESOLVED, CANCELLED) | Contador grande | Azul |
| **Chamados Fechados (período)** | COUNT(status = CLOSED no período) | Contador | Verde |
| **Backlog** | COUNT(abertos há > SLA padrão sem resolução) | Contador com alerta | Vermelho se > meta |
| **Incidentes Críticos Abertos** | COUNT(INC, priority = CRITICAL, status ≠ CLOSED) | Contador urgente | Vermelho |
| **Problemas Recorrentes** | COUNT(PRB com ≥ 3 incidentes vinculados) | Contador | Laranja |

---

### 1.3 Seção: SLA

| KPI | Fórmula | Visualização |
|:---:|---------|:------------:|
| **SLA Cumprido (%)** | Chamados dentro do SLA / total × 100 | Gauge 0–100% (verde se ≥ meta) |
| **SLA Violado (%)** | Chamados fora do SLA / total × 100 | Gauge (vermelho se > 10%) |
| **SLA Cumprido por Serviço** | Top 5 serviços com melhor/pior SLA | Barras horizontais |

---

### 1.4 Seção: Performance Técnica

| KPI | Fórmula | Visualização |
|:---:|---------|:------------:|
| **MTTR** (Mean Time To Resolve) | AVG(resolved_at − created_at) em horas | Contador (horas) |
| **MTBF** (Mean Time Between Failures) | Intervalo médio entre incidentes do mesmo serviço | Contador (horas) |
| **Tendência de Incidentes (12 meses)** | Volume de incidentes por mês | Linha |

---

### 1.5 Seção: Compliance

| KPI | Fórmula | Visualização |
|:---:|---------|:------------:|
| **Compliance Score Global** | Score médio ponderado de todos os frameworks ativos | Gauge 0–100% com faixas de cor |
| **Apontamentos Abertos** | COUNT(findings com status ≠ CONCLUDED) | Contador |
| **Apontamentos em Atraso** | COUNT(due_date < hoje AND status ≠ CONCLUDED) | Contador (vermelho) |
| **Score por Norma** | Score por ISO 27001, LGPD, PCI DSS | Barras horizontais comparativas |

---

### 1.6 Seção: Financeiro

| KPI | Fórmula | Visualização |
|:---:|---------|:------------:|
| **OPEX do Mês** | SUM(OpexExpense no mês corrente) em R$ | Contador com variação vs. mês anterior |
| **CAPEX do Período** | SUM(CapexInvestment no período) em R$ | Contador |
| **Orçado vs. Realizado** | Budget.approved × Budget.spent por CC | Barras agrupadas |
| **Custo de TI por Usuário** | Total TI / usuários ativos | Contador |

---

### 1.7 Seção: Projetos

| KPI | Fórmula | Visualização |
|:---:|---------|:------------:|
| **Projetos Ativos** | COUNT(status IN PLANNING, EXECUTION, TESTING, DEPLOYMENT) | Contador |
| **Projetos Atrasados** | COUNT(health_status IN YELLOW, RED) | Contador (laranja/vermelho) |
| **Projetos Concluídos (período)** | COUNT(status = CLOSED no período) | Contador |
| **Investimento em Projetos** | SUM(CAPEX + OPEX realizado por projetos ativos) | Contador R$ |
| **Portfólio Health** | Distribuição de projetos por health_status | Pizza (verde/amarelo/vermelho) |

---

### 1.8 Gráficos do Dashboard Executivo

| Gráfico | Tipo | Dados | Objetivo |
|---------|:----:|-------|---------|
| Chamados abertos vs. fechados (12 meses) | Linha dupla | Mensal | Tendência |
| SLA Cumprido por área | Barras horizontais | Por departamento | Benchmarking |
| OPEX vs. CAPEX por mês | Barras agrupadas | Mensal | Composição de custos |
| Compliance Score por norma | Gauge múltipla | Por framework | Maturidade |
| Top 5 categorias de incidente | Pizza | Volume | Foco de melhoria |
| Projetos por health_status | Pizza | Atual | Saúde do portfólio |
| Custo de TI por área | Mapa de calor (heatmap) | Por departamento | Distribuição |
| MTTR por categoria (12 meses) | Linha | Mensal | Melhoria contínua |

---

## 2. Dashboard Operacional

### 2.1 Objetivo

Apoiar a gestão diária da equipe de TI — analistas, coordenadores e gestores — com visão em tempo real da fila de trabalho, SLAs, atrasos e desempenho individual.

**Audiência:** IT_TECHNICIAN, IT_SPECIALIST, IT_MANAGER.
**Atualização:** Tempo real via Supabase Realtime (≤ 5 segundos).

---

### 2.2 KPIs Principais

| KPI | Fórmula | Visualização | Cor |
|:---:|---------|:------------:|:---:|
| **Fila Atual (total)** | COUNT(tickets abertos não concluídos) | Contador grande | Neutro |
| **Chamados em Atraso** | COUNT(due_date < agora AND status ≠ CLOSED) | Contador com badge | Vermelho |
| **SLA Próximo do Vencimento (2h)** | COUNT(sla_deadline entre agora e +2h) | Contador urgente | Laranja |
| **Sem Atribuição** | COUNT(assignee_id IS NULL AND status ≠ CLOSED) | Contador | Amarelo |
| **Pendentes de Aprovação** | COUNT(status = PENDING_APPROVAL) | Contador | Azul |
| **Abertos por Analista** | COUNT agrupado por assignee | Barras | — |
| **Chamados por Prioridade** | COUNT agrupado por priority | Pizza | Vermelho/Laranja/Azul/Verde |

---

### 2.3 Lista de Chamados em Tempo Real

A seção central do dashboard operacional é uma **lista ao vivo** dos chamados ativos, ordenada por urgência:

| Coluna | Descrição |
|:------:|-----------|
| Número | INC/REQ-YYYY-NNNNNN com link direto |
| Título | Resumo (máx. 80 chars) |
| Prioridade | Badge colorido (CRITICAL/HIGH/MEDIUM/LOW) |
| SLA | Countdown colorido (verde/amarelo/vermelho) |
| Analista | Avatar + nome |
| Status | Badge de status |
| Criado há | Tempo relativo ("há 2h") |

Ordenação padrão: CRITICAL → atrasados → próximos do vencimento.

---

### 2.4 Mini-Gráficos Operacionais

| Gráfico | Tipo | Atualização |
|---------|:----:|:-----------:|
| Chamados abertos por hora (últimas 8h) | Área | Tempo real |
| Volume por categoria (hoje) | Barras | Tempo real |
| Performance por analista (hoje) | Barras horizontais | A cada 5 min |
| Heatmap de volume por hora × dia da semana | Mapa de calor | Semanal |

---

## 3. Dashboard de Incidentes

### 3.1 Objetivo

Monitorar o desempenho do processo de gestão de incidentes, identificar tendências, serviços com maior impacto e oportunidades de melhoria.

**Audiência:** IT_TECHNICIAN, IT_SPECIALIST, IT_MANAGER.

---

### 3.2 KPIs de Incidentes

| KPI | Fórmula | Meta | Visualização |
|:---:|---------|:----:|:------------:|
| **Total de Incidentes (período)** | COUNT(INC no período) | — | Contador |
| **Abertos** | COUNT(status ≠ CLOSED, CANCELLED) | — | Contador |
| **Fechados** | COUNT(status = CLOSED no período) | — | Contador |
| **MTTR** | AVG(resolved_at − created_at) em horas | ≤ 4h | Contador |
| **MTBF por Serviço** | Tempo médio entre incidentes do mesmo serviço | Máximo possível | Tabela |
| **Taxa de FCR** (First Contact Resolution) | COUNT(RESOLVED no primeiro atendimento) / total × 100 | ≥ 70% | Gauge |
| **Taxa de Reabertura** | COUNT(reabertos) / total × 100 | ≤ 5% | Gauge |
| **Incidentes Críticos** | COUNT(priority = CRITICAL) | 0 abertos | Contador |
| **SLA Cumprido** | COUNT(dentro_sla) / total × 100 | ≥ 90% | Gauge |
| **SLA Violado** | COUNT(fora_sla) / total × 100 | ≤ 10% | Gauge |
| **Incidentes com KB Vinculado** | COUNT(kb_article_id IS NOT NULL) / total × 100 | ≥ 60% | Gauge |
| **Incidentes por Ativo** | Top 10 ativos com mais incidentes | Tabela | — |

---

### 3.3 Gráficos de Incidentes

| Gráfico | Tipo | Objetivo |
|---------|:----:|---------|
| Volume de incidentes por dia (período selecionado) | Barras | Tendência diária |
| Distribuição por prioridade | Pizza | Composição da fila |
| Top 10 categorias | Barras horizontais | Foco de atenção |
| Top 10 serviços mais impactados | Barras horizontais | Serviços críticos |
| MTTR por mês (12 meses) | Linha | Evolução da resolução |
| Incidentes por analista (período) | Barras | Distribuição de carga |
| Incidentes por origem (Portal/E-mail/Telefone) | Pizza | Mix de canais |
| Heat map: volume por hora × dia da semana | Mapa de calor | Padrões de demanda |

---

## 4. Dashboard de Requisições

### 4.1 Objetivo

Monitorar o processo de atendimento de requisições, tempo de ciclo, gargalos de aprovação e satisfação dos usuários.

**Audiência:** IT_TECHNICIAN, IT_SPECIALIST, IT_MANAGER.

---

### 4.2 KPIs de Requisições

| KPI | Fórmula | Meta | Visualização |
|:---:|---------|:----:|:------------:|
| **Total de Requisições (período)** | COUNT(REQ no período) | — | Contador |
| **Abertas** | COUNT(status ≠ CLOSED, CANCELLED) | — | Contador |
| **Concluídas** | COUNT(status = FULFILLED no período) | — | Contador |
| **Aguardando Aprovação** | COUNT(status = PENDING_APPROVAL) | ≤ 5% do total | Contador |
| **Tempo Médio de Ciclo** | AVG(fulfilled_at − created_at) em horas | ≤ SLA do serviço | Contador |
| **Tempo Médio de Aprovação** | AVG(approved_at − submitted_at) em horas | ≤ 24h | Contador |
| **SLA Cumprido** | % dentro do SLA | ≥ 90% | Gauge |
| **Taxa de Cancelamento** | COUNT(CANCELLED) / total × 100 | ≤ 5% | Gauge |
| **CSAT Médio** | AVG(satisfaction_score) | ≥ 4.0 / 5.0 | Gauge |
| **Requisições por Canal** | COUNT por origin (PORTAL, EMAIL, PHONE) | — | Pizza |
| **Requisições por Tipo** | COUNT por tipo de serviço | — | Barras |

---

### 4.3 Gráficos de Requisições

| Gráfico | Tipo | Objetivo |
|---------|:----:|---------|
| Volume de requisições por dia | Barras | Tendência |
| Top 10 serviços mais solicitados | Barras horizontais | Demanda por serviço |
| Tempo de ciclo por tipo de requisição | Caixa (box plot simplificado) | Variabilidade |
| Requisições por analista | Barras | Distribuição de carga |
| Tendência de CSAT por mês | Linha | Satisfação ao longo do tempo |
| Gargalos no fluxo (Funil) | Funil (SUBMITTED→APPROVED→IN_PROGRESS→FULFILLED) | Identificar onde travam |

---

## 5. Dashboard de Problemas

### 5.1 Objetivo

Monitorar a gestão proativa de problemas, erros conhecidos, workarounds ativos e a efetividade das soluções definitivas implementadas.

**Audiência:** IT_SPECIALIST, IT_MANAGER.

---

### 5.2 KPIs de Problemas

| KPI | Fórmula | Meta | Visualização |
|:---:|---------|:----:|:------------:|
| **Problemas Abertos** | COUNT(status ≠ RESOLVED, CLOSED) | — | Contador |
| **Erros Conhecidos (KEDB)** | COUNT(status = KNOWN_ERROR) | — | Contador destaque |
| **Workarounds Ativos** | COUNT(workaround publicado e ativo) | — | Contador |
| **Problemas Críticos** | COUNT(priority = CRITICAL AND abertos) | 0 | Contador |
| **Tempo Médio de Resolução** | AVG(resolved_at − created_at) em dias | — | Contador |
| **Incidentes por Problema** | AVG(incidentes vinculados por problema) | — | Contador |
| **Problemas Recorrentes** | COUNT(mesmo serviço com ≥ 2 problemas no período) | 0 | Contador |
| **Taxa de Resolução Definitiva** | COUNT(RESOLVED com solução definitiva) / total × 100 | ≥ 80% | Gauge |
| **Tempo Médio para Workaround** | AVG(workaround_at − created_at) em horas | ≤ 4h | Contador |

---

### 5.3 Gráficos de Problemas

| Gráfico | Tipo | Objetivo |
|---------|:----:|---------|
| Problemas por status ao longo do tempo | Área empilhada | Evolução da carteira |
| Top 10 serviços com mais problemas | Barras | Serviços críticos |
| Distribuição por categoria | Pizza | Tipos de problema |
| Tempo médio de resolução por mês | Linha | Melhoria contínua |

---

## 6. Dashboard de Ativos

### 6.1 Objetivo

Fornecer visibilidade completa sobre o inventário de TI — distribuição por status, garantias, custos e ativos problemáticos.

**Audiência:** IT_TECHNICIAN, IT_SPECIALIST, IT_MANAGER, FINANCIAL_ANALYST.

---

### 6.2 KPIs de Ativos

| KPI | Fórmula | Meta | Visualização |
|:---:|---------|:----:|:------------:|
| **Total de Ativos Ativos** | COUNT(status IN IN_STOCK, ALLOCATED, IN_USE, UNDER_MAINTENANCE) | — | Contador |
| **Em Uso** | COUNT(status = IN_USE) | — | Contador |
| **Em Estoque** | COUNT(status = IN_STOCK) | — | Contador |
| **Em Manutenção** | COUNT(status = UNDER_MAINTENANCE) | — | Contador |
| **Sem Responsável** | COUNT(IN_USE AND assignee_id IS NULL) | 0 | Contador (vermelho) |
| **Garantias Vencendo (90 dias)** | COUNT(warranty_end BETWEEN hoje E +90d) | — | Contador (amarelo) |
| **Garantias Vencidas** | COUNT(warranty_end < hoje AND status ≠ DECOMMISSIONED) | 0 | Contador (vermelho) |
| **Valor Total do Parque** | SUM(current_value) de ativos CAPEX ativos | — | Contador R$ |
| **Depreciação Acumulada** | SUM(accumulated_depreciation) | — | Contador R$ |
| **Ativos Ociosos (>180 dias sem uso)** | COUNT(IN_STOCK por > 180 dias) | 0 | Contador |
| **Licenças com Utilização > 90%** | COUNT(license.usage_pct > 90%) | — | Contador |
| **Licenças Subutilizadas (<20%)** | COUNT(license.usage_pct < 20%) | — | Contador |

---

### 6.3 Gráficos de Ativos

| Gráfico | Tipo | Objetivo |
|---------|:----:|---------|
| Distribuição por categoria | Pizza | Composição do parque |
| Distribuição por status | Pizza | Estado do inventário |
| Ativos por departamento | Barras | Concentração por área |
| Garantias vencendo por mês (próximos 12 meses) | Barras | Planejamento de renovação |
| Evolução do valor do parque (12 meses) | Linha | Depreciação vs. aquisições |
| Custo de manutenção por ativo (Top 10) | Barras horizontais | TCO por ativo |

---

## 7. Dashboard de Identidades

### 7.1 Objetivo

Monitorar o ciclo de vida das identidades corporativas — usuários ativos, provisionamentos pendentes, MFA e revisões de acesso.

**Audiência:** IT_MANAGER, SUPER_ADMIN, COMPLIANCE_OFFICER.

---

### 7.2 KPIs de Identidades

| KPI | Fórmula | Meta | Visualização |
|:---:|---------|:----:|:------------:|
| **Usuários Ativos** | COUNT(status = ACTIVE) | — | Contador |
| **Usuários Bloqueados** | COUNT(status = SUSPENDED) | — | Contador |
| **Provisionamentos Pendentes** | COUNT(status = PENDING_PROVISIONING) | 0 | Contador |
| **Sem Revisão de Acesso** | COUNT(next_review_due < hoje) | 0 | Contador (vermelho) |
| **Revisões Vencendo em 30 dias** | COUNT(next_review_due BETWEEN hoje E +30d) | — | Contador |
| **MFA Habilitado (%)** | COUNT(mfa_enabled=true) / COUNT(ACTIVE) × 100 | 100% (críticos) | Gauge |
| **Usuários por Departamento** | COUNT agrupado por department | — | Barras |
| **Usuários por Gestor (top 10)** | COUNT liderados por gestor | — | Tabela |
| **Provisionamentos (período)** | COUNT(ACTIVE no período) | — | Contador |
| **Desprovisionamentos (período)** | COUNT(INACTIVE no período) | — | Contador |
| **Papéis mais atribuídos** | COUNT por role_code | — | Barras |

---

### 7.3 Gráficos de Identidades

| Gráfico | Tipo | Objetivo |
|---------|:----:|---------|
| Distribuição de usuários por departamento | Pizza | Estrutura organizacional |
| Histórico de provisionamentos/desprovisionamentos (12 meses) | Barras agrupadas | Turnover de TI |
| MFA por departamento | Barras horizontais | Cobertura de segurança |
| Revisões de acesso: concluídas vs. pendentes | Pizza | Conformidade |

---

## 8. Dashboard de Compliance

### 8.1 Objetivo

Monitorar o programa de compliance de TI — apontamentos, planos de ação, evidências e evolução do Compliance Score.

**Audiência:** COMPLIANCE_OFFICER, IT_MANAGER.

---

### 8.2 KPIs de Compliance

| KPI | Fórmula | Meta | Visualização |
|:---:|---------|:----:|:------------:|
| **Compliance Score Global** | Score médio ponderado de todos os frameworks | ≥ 80% | Gauge com faixas |
| **Apontamentos Abertos** | COUNT(status ≠ CONCLUDED) | — | Contador |
| **Apontamentos em Atraso** | COUNT(due_date < hoje AND ≠ CONCLUDED) | 0 | Contador (vermelho) |
| **Apontamentos Críticos** | COUNT(severity = CRITICAL AND abertos) | 0 | Contador (vermelho) |
| **Planos de Ação Atrasados** | COUNT(ActionItem.status = OVERDUE) | 0 | Contador |
| **Evidências Pendentes** | COUNT(review_status = PENDING) | ≤ 10 | Contador |
| **Score por Norma** | Score individual por framework | — | Gauges múltiplos |
| **Taxa de Conclusão no Prazo** | COUNT(CONCLUDED_NO_PRAZO) / total × 100 | ≥ 85% | Gauge |
| **Apontamentos por Área** | COUNT agrupado por department | — | Barras |
| **Riscos Críticos Ativos** | COUNT(risk_level = CRITICAL AND ≠ CLOSED) | 0 | Contador |
| **Custo de Compliance (período)** | SUM(OpexExpense com compliance_audit_id) | — | Contador R$ |

---

### 8.3 Gráficos de Compliance

| Gráfico | Tipo | Objetivo |
|---------|:----:|---------|
| Evolução do Compliance Score (12 meses) | Linha | Maturidade ao longo do tempo |
| Apontamentos por criticidade e status | Barras empilhadas | Composição do backlog |
| Score por framework (comparativo) | Barras horizontais | Benchmarking entre normas |
| Top 5 áreas com mais apontamentos | Barras | Foco de atenção |
| Apontamentos abertos vs. fechados por mês | Barras agrupadas | Ritmo de resolução |
| Distribuição de riscos por nível | Pizza | Perfil de risco |

---

## 9. Dashboard Financeiro

### 9.1 Objetivo

Monitorar o desempenho financeiro de TI — OPEX, CAPEX, orçado vs. realizado, depreciação e custos por área.

**Audiência:** FINANCIAL_ANALYST, IT_MANAGER, EXECUTIVE.

---

### 9.2 KPIs Financeiros

| KPI | Fórmula | Meta | Visualização |
|:---:|---------|:----:|:------------:|
| **OPEX do Mês** | SUM(OpexExpense do mês) | Dentro do orçado | Contador R$ |
| **CAPEX do Período** | SUM(CapexInvestment do período) | Dentro do orçado | Contador R$ |
| **% Orçamento Utilizado** | (OPEX + CAPEX realizado) / aprovado × 100 | ≤ 100% | Gauge |
| **Saldo Disponível** | Budget.approved − committed − spent | — | Contador R$ |
| **Lançamentos Pendentes** | COUNT(status = PENDING) | ≤ 10 | Contador |
| **Contratos Vencendo (90 dias)** | COUNT(end_date ≤ +90d) | — | Contador |
| **Depreciação do Mês** | SUM(DepreciationRecord do mês) | — | Contador R$ |
| **Valor Total do Parque** | SUM(current_value dos ativos CAPEX) | — | Contador R$ |
| **Custo de TI por Usuário** | (OPEX + CAPEX) / usuários ativos | — | Contador R$ |
| **Licenças Subutilizadas** | SUM(value de licenças < 20% uso) | 0 | Contador R$ |

---

### 9.3 Gráficos Financeiros

| Gráfico | Tipo | Objetivo |
|---------|:----:|---------|
| OPEX vs. CAPEX por mês (12 meses) | Barras agrupadas | Composição histórica |
| Orçado vs. Realizado acumulado | Linhas duplas | Aderência ao budget |
| Distribuição de OPEX por categoria | Pizza | Onde vai o dinheiro operacional |
| Top 10 fornecedores por valor | Barras horizontais | Concentração de gastos |
| Evolução do valor do parque (depreciação) | Área | Controle patrimonial |
| Custo por área (heatmap) | Mapa de calor | Benchmarking entre áreas |
| Projeção de encerramento do ano | Linhas + projeção | Planejamento |

---

## 10. Dashboard de Compras

### 10.1 Objetivo

Monitorar o processo de aquisições de TI — volume, fornecedores, prazos, saving e integração com o financeiro.

**Audiência:** FINANCIAL_ANALYST, IT_SPECIALIST, IT_MANAGER.

---

### 10.2 KPIs de Compras

| KPI | Fórmula | Meta | Visualização |
|:---:|---------|:----:|:------------:|
| **Compras Abertas** | COUNT(status ≠ COMPLETED, REJECTED, CANCELLED) | — | Contador |
| **Aguardando Aprovação** | COUNT(status = PENDING_APPROVAL) | — | Contador |
| **Compras em Atraso** | COUNT(PO com prazo vencido sem recebimento) | 0 | Contador (vermelho) |
| **Compras Concluídas (período)** | COUNT(status = COMPLETED) | — | Contador |
| **Cotações a Vencer (7 dias)** | COUNT(quotation.validity_date ≤ +7d) | — | Contador |
| **Tempo Médio de Ciclo** | AVG(completed_at − submitted_at) em dias | Redução trimestral | Contador |
| **Taxa de Cotações Conformes** | % compras > R$10k com ≥ 3 cotações | 100% | Gauge |
| **Saving Gerado** | SUM(valor_estimado − valor_PO) | — | Contador R$ |
| **Gasto por Fornecedor** | SUM(valor) agrupado por supplier | — | Barras |
| **Gasto por Categoria** | SUM(valor) por tipo de aquisição | — | Pizza |

---

### 10.3 Gráficos de Compras

| Gráfico | Tipo | Objetivo |
|---------|:----:|---------|
| Volume de compras por mês | Barras | Tendência |
| OPEX vs. CAPEX em compras | Barras agrupadas | Composição |
| Top 10 fornecedores por valor | Barras horizontais | Concentração |
| Ciclo médio de compra por tipo | Barras | Eficiência do processo |
| Saving acumulado no ano | Linha | Economia gerada |

---

## 11. Dashboard de Projetos

### 11.1 Objetivo

Monitorar o portfólio de projetos de TI — saúde, financeiro, recursos e benefícios.

**Audiência:** PROJECT_MANAGER, IT_MANAGER, EXECUTIVE.

---

### 11.2 KPIs de Projetos

| KPI | Fórmula | Meta | Visualização |
|:---:|---------|:----:|:------------:|
| **Projetos Ativos** | COUNT(status IN PLANNING, EXECUTION, TESTING, DEPLOYMENT) | — | Contador |
| **Projetos Atrasados** | COUNT(health_status IN YELLOW, RED) | ≤ 20% do total | Contador |
| **Projetos Concluídos (período)** | COUNT(status = CLOSED) | — | Contador |
| **Marcos Vencidos** | COUNT(MILESTONE.status = OVERDUE) | 0 | Contador (vermelho) |
| **Marcos Vencendo (7 dias)** | COUNT(MILESTONE.end_date ≤ +7d AND ≠ COMPLETED) | — | Contador |
| **Taxa de Entrega no Prazo** | COUNT(fechados sem extensão) / total × 100 | ≥ 70% | Gauge |
| **Taxa Dentro do Orçamento** | COUNT(fechados dentro do budget) / total × 100 | ≥ 75% | Gauge |
| **ROI Estimado** | SUM(benefício_esperado) / SUM(custo_total) × 100 | > 100% | Gauge |
| **Investimento Ativo (total)** | SUM(CAPEX + OPEX realizados em projetos ativos) | — | Contador R$ |
| **CRs Pendentes** | COUNT(ChangeRequest.status = UNDER_ANALYSIS) | ≤ 5 | Contador |
| **Riscos Críticos** | COUNT(risk_level = CRITICAL AND ≠ CLOSED) | 0 | Contador |

---

### 11.3 Gráficos de Projetos

| Gráfico | Tipo | Objetivo |
|---------|:----:|---------|
| Portfólio health (distribuição por cor) | Pizza | Saúde geral |
| Projetos por status ao longo do tempo | Área empilhada | Evolução do portfólio |
| Orçado vs. realizado por projeto | Barras agrupadas | Variância financeira |
| Investimento por tipo de projeto | Pizza | Alocação estratégica |
| Throughput: projetos abertos vs. fechados (12 meses) | Linhas | Capacidade de entrega |
| ROI realizado vs. esperado (por projeto fechado) | Barras | Efetividade |

---

## 12. Dashboard de Base de Conhecimento

### 12.1 Objetivo

Monitorar a saúde e efetividade da Base de Conhecimento — cobertura, qualidade, deflexões e artigos pendentes de revisão.

**Audiência:** IT_TECHNICIAN, IT_SPECIALIST, IT_MANAGER.

---

### 12.2 KPIs da Base de Conhecimento

| KPI | Fórmula | Meta | Visualização |
|:---:|---------|:----:|:------------:|
| **Total de Artigos Publicados** | COUNT(status = PUBLISHED) | Crescimento | Contador |
| **Taxa de Deflexão** | deflections / (deflections + chamados) × 100 | ≥ 15% | Gauge |
| **Resolução via KB (%)** | Incidentes com kb_article_id / total × 100 | ≥ 60% | Gauge |
| **Helpful Rate Médio** | AVG(helpful_count / total_votes) × 100 | ≥ 75% | Gauge |
| **Artigos com Revisão Vencida** | COUNT(next_review_date < hoje AND PUBLISHED) | 0 | Contador (vermelho) |
| **Rascunhos de IA Pendentes** | COUNT(status = DRAFT_AI sem edição humana) | — | Contador |
| **KEDB Ativo** | COUNT(WORKAROUND publicado e ativo) | — | Contador |
| **Cobertura de Serviços** | Serviços com artigo / total serviços PUBLISHED × 100 | ≥ 80% | Gauge |
| **Tempo Médio de Revisão** | AVG(published_at − submitted_at) em dias | ≤ 3 dias | Contador |
| **Novos Artigos (período)** | COUNT(PUBLISHED no período) | — | Contador |

---

### 12.3 Gráficos de Base de Conhecimento

| Gráfico | Tipo | Objetivo |
|---------|:----:|---------|
| Artigos por categoria | Barras | Distribuição do conteúdo |
| Deflexões por mês (12 meses) | Linha | Tendência de autoatendimento |
| Top 10 artigos mais acessados | Tabela | Conteúdo mais relevante |
| Artigos por helpful_rate (distribuição) | Histograma | Qualidade do conteúdo |
| Produção por autor (período) | Barras | Contribuição da equipe |

---

## 13. Dashboard de Integrações

### 13.1 Objetivo

Monitorar a saúde e desempenho de todas as integrações externas do SGTI — Google Workspace, GLPI, E-mail, Supabase Realtime, Cloudflare.

**Audiência:** IT_MANAGER, SUPER_ADMIN.

---

### 13.2 KPIs de Integrações

| KPI | Componente | Meta | Visualização |
|:---:|:----------:|:----:|:------------:|
| **Status Google Workspace** | Circuit breaker | CLOSED | Indicador (verde/amarelo/vermelho) |
| **Status GLPI** | Circuit breaker | CLOSED | Indicador |
| **Status E-mail (SMTP)** | Conectividade | UP | Indicador |
| **Status Supabase** | Health check DB | UP | Indicador |
| **Última Sync Google** | last_synced_at | ≤ 24h | Timestamp |
| **Última Sync GLPI** | last_synced_at | ≤ 24h | Timestamp |
| **Tickets sem espelho GLPI** | COUNT(glpi_ticket_id IS NULL) | 0 | Contador |
| **E-mails Processados (24h)** | COUNT(EmailMessage PROCESSED) | — | Contador |
| **E-mails com Falha (24h)** | COUNT(EmailMessage FAILED) | ≤ 1% | Contador |
| **DLQ Pendente** | COUNT(dead_letter_queue) | 0 | Contador (vermelho) |
| **Latência de API (p95)** | p95 dos response_times | ≤ 2s | Contador ms |
| **Webhooks Entregues (%)** | OK / total × 100 | ≥ 98% | Gauge |
| **Divergências GLPI Pendentes** | COUNT(resolution = PENDING) | ≤ 10 | Contador |

---

### 13.3 Gráficos de Integrações

| Gráfico | Tipo | Objetivo |
|---------|:----:|---------|
| Latência de API por endpoint (24h) | Linha | Performance |
| Taxa de erros 5xx por hora (24h) | Barras | Estabilidade |
| Volume de e-mails processados por hora | Barras | Carga no canal e-mail |
| Histórico de circuit breaker (30 dias) | Timeline | Incidentes de integração |

---

## 14. Dashboard de SLA

### 14.1 Objetivo

Analisar profundamente o desempenho de SLA por serviço, período, área e analista — identificando padrões de violação e oportunidades de melhoria.

**Audiência:** IT_SPECIALIST, IT_MANAGER.

---

### 14.2 KPIs de SLA

| KPI | Fórmula | Meta | Visualização |
|:---:|---------|:----:|:------------:|
| **SLA Geral Cumprido (%)** | Chamados dentro SLA / total × 100 | ≥ 90% | Gauge grande |
| **SLA por Prioridade — CRITICAL** | % dentro SLA para CRITICAL | ≥ 99% | Gauge |
| **SLA por Prioridade — HIGH** | % dentro SLA para HIGH | ≥ 95% | Gauge |
| **SLA por Prioridade — MEDIUM** | % dentro SLA para MEDIUM | ≥ 90% | Gauge |
| **SLA por Prioridade — LOW** | % dentro SLA para LOW | ≥ 80% | Gauge |
| **Tempo Médio p/ Primeiro Atendimento** | AVG(first_response_at − created_at) | ≤ SLA resposta | Contador |
| **Chamados Expirados com SLA Ativo** | COUNT(SLA status = BREACHED) | 0 | Contador (vermelho) |
| **SLA por Serviço (Top 10 Piores)** | % violação por serviço | — | Tabela |
| **SLA por Analista** | % cumprimento por analista | ≥ 85% | Tabela |
| **SLA por Período (tendência)** | % cumprimento por mês | Melhoria | Linha |
| **Violações por Motivo** | COUNT agrupado por breach_reason | — | Pizza |

---

### 14.3 Gráficos de SLA

| Gráfico | Tipo | Objetivo |
|---------|:----:|---------|
| SLA cumprido por mês (12 meses) | Linha com meta | Tendência histórica |
| SLA por prioridade (comparativo) | Barras agrupadas | Diferença por nível |
| Top 10 serviços com mais violações | Barras horizontais | Foco de atenção |
| Distribuição de violações por horário | Barras (24h) | Identificar horários críticos |
| SLA por analista (heatmap) | Mapa de calor (analista × semana) | Padrões individuais |
| Chamados próximos do vencimento (tempo real) | Lista ao vivo | Ação imediata |

---

## 15. Dashboard Estratégico

### 15.1 Objetivo

Apoiar a tomada de decisão estratégica da Diretoria e da alta gestão de TI, consolidando tendências de longo prazo, ROI, benchmarking e oportunidades de otimização.

**Audiência:** EXECUTIVE, IT_MANAGER.
**Atualização:** Semanal (dados calculados todo domingo às 23h00).

---

### 15.2 KPIs Estratégicos

| KPI | Fórmula | Objetivo |
|:---:|---------|---------|
| **Custo de TI sobre Receita (%)** | Custo total TI / Receita empresa × 100 | Eficiência estratégica |
| **Custo de TI por Colaborador** | Custo total TI / total colaboradores | Benchmarking |
| **ROI de TI** | Benefícios realizados / Custo total × 100 | Valor gerado |
| **Disponibilidade média dos serviços críticos** | AVG(uptime de serviços críticos) × 100 | ≥ 99,5% |
| **Taxa de Automação** | Chamados resolvidos por automação / total × 100 | Tendência crescente |
| **Índice de Satisfação Geral (CSAT)** | AVG(satisfaction_score) consolidado | ≥ 4,0 / 5,0 |
| **Taxa de Maturidade ITIL** | Score médio de aderência às práticas ITIL | Crescente |
| **Cobertura do Portfólio de Serviços** | Serviços com SLA definido / total × 100 | 100% |
| **Taxa de Resolução no Primeiro Contato** | FCR acumulado | ≥ 70% |

---

### 15.3 Gráficos Estratégicos

| Gráfico | Tipo | Objetivo |
|---------|:----:|---------|
| Evolução do CSAT (24 meses) | Linha | Tendência de satisfação |
| Custo de TI vs. volume de chamados (12 meses) | Linhas duplas eixo Y dual | Eficiência de custo |
| Maturidade ITIL por processo (radar) | Radar | Visão 360° dos processos |
| Tendência de incidentes críticos (24 meses) | Linha | Redução de criticidade |
| ROI por projeto (últimos 10 projetos) | Barras | Valor gerado por projeto |
| Evolução do Compliance Score (24 meses) | Linha | Maturidade de conformidade |
| Distribuição de investimento (pizza 3 anos) | Pizza | Onde TI investe ao longo do tempo |

---

## 16. Drill Down

### 16.1 Conceito de Drill Down

Drill Down é a capacidade de navegar de um indicador agregado para os dados detalhados que o compõem, permitindo investigação sem sair da experiência do dashboard.

### 16.2 Regras Gerais de Drill Down

| Regra | Descrição |
|:-----:|-----------|
| **Qualquer KPI é clicável** | Todo contador, gauge e ponto em gráfico com dados rastreáveis abre drill down |
| **Abertura em painel lateral** | Drill down abre em painel deslizante (slide-over) sem perder o contexto do dashboard |
| **Filtros herdados** | Os filtros ativos no dashboard são automaticamente aplicados à visão de detalhe |
| **Link direto** | O painel de detalhe sempre oferece um link para a página completa do item |
| **Máximo de 3 níveis** | Dashboard → Lista filtrada → Item individual. Mais que 3 níveis navega para o módulo correspondente |
| **Paginação no detalhe** | Listas no drill down são paginadas (25 itens por página) |

### 16.3 Exemplos de Drill Down por Dashboard

| Dashboard | KPI | Drill Down Abre |
|:----------:|:---:|:---------------:|
| Executivo | "Chamados Abertos: 42" | Lista de todos os 42 chamados abertos com filtros |
| Executivo | "Compliance Score: 74%" | Detalhamento por framework + controles não conformes |
| Operacional | Barra de "Analista X: 8 chamados" | Lista dos 8 chamados atribuídos ao analista X |
| Incidentes | "MTTR: 3h 45min" | Distribuição de tempos de resolução + outliers |
| SLA | "SLA Violado: 12%" | Lista de chamados que violaram o SLA no período |
| Financeiro | "OPEX do Mês: R$ 45.230" | Lista de lançamentos OPEX do mês |
| Projetos | "Marcos Vencidos: 3" | Lista dos 3 marcos com data, projeto e responsável |
| Ativos | "Garantias Vencendo: 7" | Lista dos 7 ativos com data de vencimento |
| KB | "Helpful Rate: 68%" | Lista de artigos com avaliação < 60% |
| Integrações | "DLQ: 2 operações" | Lista das operações com falha e payload |

### 16.4 Drill Down em Gráficos

| Tipo de Gráfico | Comportamento ao Clicar |
|:---------------:|:------------------------|
| Barra / Coluna | Clique em barra: filtra o dashboard pela dimensão clicada |
| Linha | Clique em ponto: mostra detalhe daquele dia/mês |
| Pizza | Clique em fatia: filtra o dashboard pela categoria clicada |
| Tabela | Clique na linha: abre o registro completo no módulo correspondente |
| Gauge | Clique no indicador: abre lista dos itens que compõem o valor |
| Contador | Clique no número: abre lista filtrada dos registros contados |

---

## 17. Permissões por Perfil

### 17.1 Tabela de Acesso por Dashboard

| Dashboard | END_USER | IT_TECHNICIAN | IT_SPECIALIST | COMPLIANCE_OFFICER | FINANCIAL_ANALYST | PROJECT_MANAGER | IT_MANAGER | EXECUTIVE | SUPER_ADMIN |
|:----------:|:--------:|:-------------:|:-------------:|:------------------:|:-----------------:|:---------------:|:----------:|:---------:|:-----------:|
| Executivo | ❌ | ❌ | ❌ | ❌ | Parcial¹ | Parcial² | ✅ | ✅ | ✅ |
| Operacional | ❌ | ✅ (próprios) | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Incidentes | ❌ | ✅ | ✅ | Leitura | ❌ | ❌ | ✅ | ❌ | ✅ |
| Requisições | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Problemas | ❌ | ✅ | ✅ | Leitura | ❌ | ❌ | ✅ | ❌ | ✅ |
| Ativos | ❌ | ✅ | ✅ | Leitura | ✅ | ❌ | ✅ | ❌ | ✅ |
| Identidades | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Compliance | ❌ | ❌ | ❌ | ✅ | Parcial³ | ❌ | ✅ | ❌ | ✅ |
| Financeiro | ❌ | ❌ | ❌ | Parcial⁴ | ✅ | Parcial⁵ | ✅ | ✅ | ✅ |
| Compras | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Projetos | ❌ | ❌ | ✅ (próprios) | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| KB | ✅ (limitado) | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Integrações | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| SLA | ❌ | ✅ (próprios) | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Estratégico | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

**Notas:**
- ¹ FINANCIAL_ANALYST vê seção financeira do Executivo (sem compliance e SLA)
- ² PROJECT_MANAGER vê seção de projetos do Executivo
- ³ FINANCIAL_ANALYST vê custos de compliance no Dashboard de Compliance
- ⁴ COMPLIANCE_OFFICER vê custos de adequação no Financeiro
- ⁵ PROJECT_MANAGER vê financeiro dos seus próprios projetos

### 17.2 Visibilidade de Dados Sensíveis

| Tipo de Dado | Quem Pode Ver |
|:------------:|:-------------:|
| Valores financeiros (R$) | FINANCIAL_ANALYST, IT_MANAGER, EXECUTIVE, SUPER_ADMIN |
| Dados de compliance score | COMPLIANCE_OFFICER, IT_MANAGER, EXECUTIVE |
| Dados de identidades individuais | IT_MANAGER, SUPER_ADMIN |
| Dados de SLA individuais por analista | IT_SPECIALIST+, IT_MANAGER |
| DLQ e status de integrações | IT_MANAGER, SUPER_ADMIN |

### 17.3 Restrição de Escopo de Dados

- **END_USER:** não acessa dashboards (apenas portais de autoatendimento).
- **IT_TECHNICIAN:** vê apenas dados dos seus próprios chamados no Operacional; no SLA, apenas seus próprios indicadores.
- **IT_SPECIALIST:** vê dados do seu grupo de suporte e áreas sob sua responsabilidade.
- **PROJECT_MANAGER:** vê dados financeiros e de progresso apenas dos seus projetos.

---

## 18. Requisitos de Performance

### 18.1 Tempo de Carregamento

| Dashboard | Requisito de Carregamento Inicial | Requisito de Atualização (Realtime) |
|:----------:|:---------------------------------:|:------------------------------------:|
| Executivo | ≤ 3 segundos | ≤ 5 minutos (polling) |
| Operacional | ≤ 2 segundos | ≤ 5 segundos (Realtime) |
| Incidentes | ≤ 2 segundos | ≤ 5 segundos |
| Requisições | ≤ 2 segundos | ≤ 5 segundos |
| Financeiro | ≤ 3 segundos | ≤ 5 minutos |
| Compliance | ≤ 3 segundos | ≤ 5 minutos |
| Integrações | ≤ 2 segundos | ≤ 30 segundos |
| Estratégico | ≤ 5 segundos | Semanal (pré-calculado) |

### 18.2 Estratégias de Performance

| Estratégia | Descrição | Aplicação |
|:----------:|-----------|:---------:|
| **Pré-computação** | KPIs complexos calculados em background por jobs periódicos e armazenados | Dashboards Executivo e Estratégico |
| **Cache de consultas** | Resultados de queries frequentes cacheados por 5 minutos no Redis | Todos os dashboards |
| **Paginação de listas** | Listas de drill down paginadas (máx. 25 itens) | Drill down de qualquer KPI |
| **Lazy loading** | Gráficos carregados progressivamente conforme scroll | Todos os dashboards |
| **Supabase Realtime** | Atualizações via WebSocket sem polling | Dashboards operacionais |
| **Dados agregados** | Contadores diários/mensais pré-agregados em tabelas de analytics | KPIs históricos |
| **Filtro de tenant** | Todos os dados filtrados por `tenant_id` via RLS antes de qualquer query | Todos os dashboards |

### 18.3 Limites de Volume

| Cenário | Limite Suportado |
|:-------:|:----------------:|
| Chamados no período selecionado | Até 100.000 registros (filtragem eficiente via índices) |
| Usuários simultâneos no dashboard | Até 100 usuários simultâneos |
| Exportação de dados (Excel) | Até 50.000 linhas por exportação |
| Gráfico de linha (pontos de dados) | Até 366 pontos (1 por dia em 1 ano) |
| Drill down (lista paginada) | 25 itens por página; max 1.000 registros recuperados |

---

## 19. Regras de Negócio

---

**DSH-001** — Filtros globais aplicados a todos os componentes do dashboard
Ao aplicar qualquer filtro (período, área, analista, categoria, serviço), todos os contadores, gauges, gráficos e listas do dashboard são atualizados simultaneamente.

---

**DSH-002** — Período padrão: últimos 30 dias
Ao carregar qualquer dashboard, o filtro de período inicia com os últimos 30 dias. Usuário pode alterar para qualquer período; preferência salva por usuário e dashboard.

---

**DSH-003** — Dados em tempo real para dashboards operacionais
Dashboards Operacional, de Incidentes e de Requisições usam Supabase Realtime para atualizações sem F5. Latência máxima de 5 segundos entre evento no banco e reflexo no dashboard.

---

**DSH-004** — Dados pré-calculados para dashboards executivos
KPIs complexos do Dashboard Executivo, Financeiro e Estratégico são calculados por jobs em background (nightly/weekly) e armazenados em tabelas de analytics. Carregamento sem query pesada.

---

**DSH-005** — Apontamentos vencidos exibidos em vermelho obrigatoriamente
Em qualquer dashboard que exiba prazo de apontamento, chamado ou projeto, itens com `due_date < hoje` e status diferente de concluído têm badge vermelho obrigatório.
**Referência:** CMP-005

---

**DSH-006** — Exportação PDF inclui filtros aplicados e timestamp
O PDF exportado inclui no cabeçalho: nome do dashboard, filtros ativos, data/hora de geração e nome do usuário que exportou.

---

**DSH-007** — Exportação Excel inclui dados brutos em abas separadas
O arquivo Excel exportado tem uma aba por componente (KPIs, Gráfico 1, Gráfico 2...) com os dados tabulares que originam os componentes visuais.

---

**DSH-008** — Dashboard exibe estado de "última atualização"
Todo dashboard exibe no rodapé o timestamp da última atualização de dados, diferenciando componentes em tempo real de componentes com polling.

---

**DSH-009** — Acesso ao dashboard restrito por papel
Usuários sem permissão para um dashboard recebem redirecionamento para a página inicial com mensagem "Você não tem permissão para acessar este painel."

---

**DSH-010** — Dados financeiros invisíveis para IT_TECHNICIAN e END_USER
Qualquer valor monetário (R$) em dashboards é invisível para usuários com papel IT_TECHNICIAN ou END_USER. Componentes financeiros são ocultados e não exibem "sem permissão".

---

**DSH-011** — Drill down em KPI: máximo de 3 níveis
A navegação por drill down está limitada a 3 níveis (dashboard → lista → detalhe). Além disso, o usuário é redirecionado para a página completa do módulo.

---

**DSH-012** — Filtros de drill down herdam filtros do dashboard pai
Ao clicar em um KPI para ver o detalhe, os filtros do dashboard (período, área, analista) são automaticamente aplicados à lista de drill down.

---

**DSH-013** — KPIs críticos com alertas visuais obrigatórios
KPIs com valor fora da meta têm visualização alterada: contador fica vermelho, gauge entra na zona vermelha, badge de alerta exibido. Não é permitido exibir KPI fora da meta sem destaque visual.

---

**DSH-014** — Dashboard operacional exibe fila ao vivo ordenada por urgência
A lista de chamados no Dashboard Operacional é ordenada: 1º CRITICAL em atraso, 2º itens com SLA ≤ 2h, 3º CRITICAL, 4º HIGH em atraso, 5º demais.

---

**DSH-015** — Gauge de SLA exibe meta como linha de referência
Todo gauge de SLA exibe a meta configurada (ex.: 90%) como linha ou marcador de referência visual, facilitando a comparação com o valor atual.

---

**DSH-016** — Metas de KPI configuráveis pelo IT_MANAGER
As metas exibidas nos gauges (ex.: SLA ≥ 90%, MTTR ≤ 4h) são configuráveis pelo IT_MANAGER via painel de configuração. Padrões pré-definidos são aplicados na instalação.

---

**DSH-017** — Dashboard estratégico com dados históricos de 24 meses
O Dashboard Estratégico exibe tendências de 24 meses (2 anos). Períodos inferiores a 24 meses exibem os dados disponíveis sem erro.

---

**DSH-018** — MTTR calculado apenas para incidentes resolvidos
O MTTR considera apenas incidentes com `resolved_at IS NOT NULL`. Incidentes abertos não entram no cálculo.

---

**DSH-019** — Compliance Score atualizado ao concluir auditoria
O gauge de Compliance Score no Dashboard de Compliance e no Executivo é atualizado automaticamente ao concluir auditoria (status = COMPLETED). Sem necessidade de ação manual.

---

**DSH-020** — Taxa de deflexão calculada apenas com clique explícito do usuário
A deflexão é contada apenas quando o usuário clica em "Isso resolveu meu problema" no card de sugestão. Consulta sem clique não conta.

---

**DSH-021** — Dashboard de integrações exibe circuit breaker em tempo real
O estado do circuit breaker (CLOSED/OPEN/HALF-OPEN) de cada integração externa é exibido em tempo real no Dashboard de Integrações, sem delay de polling.

---

**DSH-022** — KPIs históricos calculados por jobs nightly
Indicadores que requerem comparação histórica (MTTR por mês, SLA por mês, custo por mês) são calculados pelo `DashboardNightlyJob` e armazenados em tabelas de analytics para carregamento rápido.

---

**DSH-023** — Dashboard de SLA exibe chamados críticos próximos do vencimento em lista ao vivo
A seção "Chamados próximos do vencimento" no Dashboard de SLA exibe lista em tempo real com countdown por chamado, atualizada via Realtime.

---

**DSH-024** — Gráfico de Gantt no Dashboard de Projetos exibe marcos críticos
O cronograma visual de projetos destacas marcos bloqueantes em vermelho quando atrasados.

---

**DSH-025** — Filtro "Analista" no Dashboard Operacional padrão = usuário logado
Para usuários com papel IT_TECHNICIAN, o filtro de analista é pré-carregado com o próprio usuário como padrão, mostrando apenas sua fila. IT_SPECIALIST+ vê todos.

---

**DSH-026** — Dashboard de KB exibe cobertura por serviço
O Dashboard de KB exibe quais serviços do catálogo têm artigos vinculados e quais não têm, para identificar lacunas de documentação.

---

**DSH-027** — Exportação requer confirmação para dados > 10.000 linhas
Exportações que gerariam mais de 10.000 linhas no Excel exibem confirmação com aviso sobre o volume e estimativa de tempo antes de processar.

---

**DSH-028** — Heatmap de volume: escala de cor padronizada
Heatmaps de volume (hora × dia, analista × semana) usam escala de cor padronizada: branco/cinza (zero) → azul claro (baixo) → azul escuro (alto).

---

**DSH-029** — Favoritar dashboard: atalho na barra de navegação
Usuário pode marcar até 3 dashboards como favoritos. Estes aparecem como atalhos na barra de navegação superior para acesso rápido.

---

**DSH-030** — Dashboard carregado com dados de tenant correto via RLS
Todos os dados dos dashboards são filtrados por `tenant_id` via RLS no Supabase. Nenhum dado cross-tenant é exibido independentemente do papel do usuário.

---

**DSH-031** — Percentuais sempre exibidos com 1 casa decimal
Todos os KPIs percentuais (SLA, FCR, helpful_rate) são exibidos com 1 casa decimal (ex.: 87,3%). Arredondamento padrão.

---

**DSH-032** — Valores monetários exibidos com separador de milhar
Valores em R$ são formatados com separador de milhar (ex.: R$ 1.234.567,89) conforme locale `pt-BR`.

---

**DSH-033** — Dashboard Estratégico gerado aos domingos às 23h00
Os dados do Dashboard Estratégico são recalculados integralmente todo domingo às 23h00 pelo `DashboardStrategicJob`. O dashboard exibe a data do último cálculo.

---

**DSH-034** — Gráfico de linha com meta: linha tracejada horizontal
Em gráficos de linha que têm uma meta configurada (ex.: SLA meta 90%), a meta é exibida como linha tracejada horizontal para comparação visual imediata.

---

**DSH-035** — Dashboard de Projetos: visão por portfólio e por projeto individual
O Dashboard de Projetos tem dois modos: (1) visão de portfólio (todos os projetos) e (2) visão de projeto individual (selecionado via filtro de projeto).

---

**DSH-036** — Atualização simultânea de todos os componentes ao mudar filtro
Ao alterar qualquer filtro, todos os componentes do dashboard são atualizados simultaneamente, sem exibir estados inconsistentes (alguns atualizados, outros não).

---

**DSH-037** — Loading state obrigatório durante atualização de dados
Durante qualquer atualização de dados (filtro, Realtime ou polling), componentes em carregamento exibem skeleton loader ou spinner. Nunca exibem dados antigos sem indicação de que estão desatualizados.

---

**DSH-038** — Dados ausentes exibidos como "—" e nunca como zero
KPIs sem dados no período selecionado (ex.: sem incidentes no período) exibem "—" ou "Sem dados" ao invés de "0" para evitar interpretações incorretas.

---

**DSH-039** — Dashboard operacional: badge de SLA com countdown
Cada chamado na lista ao vivo do Dashboard Operacional exibe o countdown do SLA em formato HH:MM com cor progressiva: verde (> 50% restante) → amarelo (≤ 50%) → vermelho (≤ 10% ou vencido).

---

**DSH-040** — Gráfico de Gantt disponível no Dashboard de Projetos
Para projetos específicos (filtro de projeto individual), o Dashboard de Projetos exibe gráfico de Gantt simplificado com as atividades e marcos do projeto.

---

**DSH-041** — Dashboard de Compliance: apontamentos vencidos destacados com ícone
Além do badge vermelho, apontamentos vencidos no Dashboard de Compliance exibem ícone de relógio com "X dias de atraso" para indicar a gravidade.

---

**DSH-042** — Taxa de FCR calculada por período completo e por mês
O Dashboard de Incidentes exibe a taxa de FCR tanto para o período selecionado quanto o histórico mês a mês nos últimos 12 meses.

---

**DSH-043** — Dashboard de SLA: violações detalhadas por motivo de breach
O Dashboard de SLA categoriza violações por `breach_reason` (sem atribuição, pendente de usuário, recurso indisponível, etc.) para identificar as causas raízes mais frequentes.

---

**DSH-044** — Visão de "minha fila" acessível com um clique no menu
Um atalho no menu de navegação leva o IT_TECHNICIAN diretamente ao Dashboard Operacional com filtro pré-aplicado para seus próprios chamados.

---

**DSH-045** — Dashboard de Compras: saving calculado como diferença entre estimado e PO
O KPI "Saving Gerado" é a soma de (valor_estimado_na_solicitação − valor_real_do_PO) para todas as compras concluídas no período. Saving negativo (estouro) é exibido em vermelho.

---

**DSH-046** — Performance de carregamento monitorada e alertada
Se o carregamento de qualquer dashboard ultrapassar 5 segundos, evento de slow-dashboard é registrado em log e alerta ao SUPER_ADMIN após 3 ocorrências seguidas.

---

**DSH-047** — Refresh manual disponível com botão dedicado
Todo dashboard tem botão de refresh manual (ícone de reload) para forçar atualização imediata dos dados além do ciclo automático.

---

**DSH-048** — Dashboard de Identidades: alerta de MFA por papel crítico
No Dashboard de Identidades, usuários com papel IT_MANAGER+ sem MFA habilitado são exibidos em lista de alerta destacada no topo do painel.

---

**DSH-049** — Dashboard Financeiro: projeção de encerramento do ano visível
O Dashboard Financeiro exibe no gráfico de OPEX/CAPEX uma projeção do custo de encerramento do ano baseada na média dos últimos 3 meses, com linha tracejada distinguindo dados reais de projeção.

---

**DSH-050** — Dashboard de KB: artigos DEPRECATED excluídos de todos os KPIs
KPIs do Dashboard de Base de Conhecimento consideram apenas artigos com status PUBLISHED. Artigos DEPRECATED, DRAFT e DRAFT_AI são excluídos de todos os cálculos.

---

**DSH-051** — Dashboard de Incidentes: MTBF por serviço calculado individualmente
O MTBF é calculado separadamente por serviço do catálogo. O valor exibido no KPI geral é a média ponderada por volume de incidentes de cada serviço.

---

**DSH-052** — Período "Ano Corrente" como atalho sempre disponível
Todos os seletores de período incluem o atalho "Ano Corrente" (1º de janeiro até hoje) além dos atalhos padrão (7 dias, 30 dias, 90 dias).

---

**DSH-053** — Dashboard de Ativos: valor do parque atualizado após DepreciationJob
O KPI "Valor Total do Parque" é recalculado automaticamente após a execução do `DepreciationJob` no primeiro dia útil de cada mês. A data do último cálculo é exibida próxima ao contador.

---

**DSH-054** — Dashboard Executivo: seções colapsáveis
Cada seção do Dashboard Executivo (Chamados, SLA, Financeiro, Compliance, Projetos) pode ser colapsada individualmente pelo usuário. Preferência de layout salva por usuário.

---

**DSH-055** — KPI com meta não atingida: sugestão de ação drill down
Quando um KPI está fora da meta, além do destaque visual, o sistema exibe uma dica contextual ao passar o mouse: "Clique para ver os itens que estão impactando este indicador."

---

**DSH-056** — Dashboard de Compliance: riscos críticos sempre visíveis no topo
Riscos com nível CRÍTICO e status ≠ CLOSED são exibidos em lista destacada no topo do Dashboard de Compliance, independentemente dos filtros aplicados.

---

**DSH-057** — Dashboard Estratégico: benchmark setorial como referência
O Dashboard Estratégico permite que o IT_MANAGER insira benchmarks setoriais (ex.: custo médio TI/usuário do setor) como linhas de referência nos gráficos para comparação.

---

**DSH-058** — Dashboard de Projetos: visibilidade do sponsor
No Dashboard de Projetos, o sponsor de cada projeto é exibido na tabela de portfólio, permitindo ao IT_MANAGER identificar quem precisa ser comunicado sobre projetos atrasados.

---

**DSH-059** — Dashboard de SLA: violações por analista com ranking
O Dashboard de SLA inclui ranking de analistas por taxa de violação, do maior para o menor percentual de violação, para identificar necessidade de treinamento ou redistribuição de carga.

---

**DSH-060** — Todos os dashboards responsivos para resolução ≥ 1280px
Os dashboards são otimizados para telas de desktop e notebook (≥ 1280px de largura). Em telas menores (tablet/mobile), exibem versão simplificada com os KPIs principais e sem gráficos complexos.

---

**DSH-061** — Dashboard de Compras: cotações a vencer exibidas com countdown
Cotações com `validity_date ≤ +7 dias` no Dashboard de Compras exibem countdown "vence em X dias" para facilitar a priorização do analista de compras.

---

**DSH-062** — Legenda obrigatória em todos os gráficos
Todo gráfico nos dashboards possui legenda identificando séries, categorias e cores. Gráficos sem legenda são considerados não conformes com os padrões de UX do SGTI.

---

**DSH-063** — Dashboard de Integrações: histórico de status do circuit breaker (30 dias)
O Dashboard de Integrações inclui uma timeline dos últimos 30 dias mostrando os períodos em que cada circuit breaker ficou aberto, com duração e frequência de abertura.

---

**DSH-064** — KPIs calculados no servidor, nunca no cliente
Todos os valores de KPI são calculados no backend e enviados prontos para exibição. O frontend nunca realiza cálculos sobre dados brutos para garantir consistência e performance.

---

**DSH-065** — Dashboard de Requisições: funil de aprovação visível
O Dashboard de Requisições exibe funil mostrando o volume de requisições em cada etapa do workflow, facilitando a identificação de gargalos no processo de aprovação.

---

**DSH-066** — Dashboard de Identidades: filtro por OrgUnit do Google
Além dos filtros padrão, o Dashboard de Identidades permite filtrar por OrgUnit do Google Workspace (sincronizado como departamento), facilitando análise por estrutura organizacional.

---

**DSH-067** — Dashboard Financeiro: alerta visual quando orçamento > 80% consumido
Barras de orçamento no Dashboard Financeiro mudam de cor: azul (≤ 60%) → amarelo (61–80%) → laranja (81–99%) → vermelho (≥ 100%).

---

**DSH-068** — Dashboard de Projetos: lista de projetos estratégicos no topo
Projetos com `strategic = true` aparecem em seção destacada no topo do Dashboard de Projetos, independentemente dos filtros aplicados.

---

**DSH-069** — Tooltips em todos os KPIs com definição e fórmula
Ao passar o mouse sobre qualquer KPI, tooltip exibe: nome completo do indicador, definição, fórmula de cálculo e período de referência dos dados.

---

**DSH-070** — Dashboard de KB: KEDB com lista clicável de workarounds
A seção KEDB do Dashboard de KB exibe lista clicável dos workarounds ativos, com serviço afetado, data de criação e número de incidentes que utilizaram o workaround.

---

**DSH-071** — Dashboard Operacional: notificação sonora opcional para novos criticals
Usuários com papel IT_TECHNICIAN e IT_SPECIALIST podem habilitar notificação sonora (beep) quando um novo incidente CRITICAL é adicionado à fila. Desabilitado por padrão.

---

**DSH-072** — Dashboard de Compliance: progresso dos planos de ação por apontamento
Cada apontamento aberto no Dashboard de Compliance exibe barra de progresso baseada no percentual de ActionItems concluídos.

---

**DSH-073** — Dashboard de Ativos: mapa de ativos por localização (futuro)
O Dashboard de Ativos reserva espaço para um mapa visual de ativos por localização física (implementação futura v2). Na v1, exibe tabela por localização.

---

**DSH-074** — Gráfico de pizza: máximo de 7 fatias, demais agrupadas em "Outros"
Gráficos de pizza com mais de 7 categorias agrupam as categorias menores em uma fatia "Outros" para manter legibilidade.

---

**DSH-075** — Dashboard Executivo: comparativo com período anterior
Cada contador no Dashboard Executivo exibe variação percentual em relação ao período anterior equivalente (ex.: "▲ 12% vs. mês anterior"), com seta verde/vermelha conforme se a variação é positiva ou negativa para o negócio.

---

**DSH-076** — Dashboard de SLA: exibe percentual de SLA por nível de serviço separadamente
O Dashboard de SLA exibe os percentuais de cumprimento separadamente para cada nível de SLA (Platina, Ouro, Prata, Bronze), não apenas o consolidado.

---

**DSH-077** — Dashboard de Compras: concentração de fornecedor alertada
Quando um único fornecedor representa > 40% do OPEX mensal de TI, alerta visual é exibido no Dashboard de Compras.

---

**DSH-078** — Dashboard de Projetos: burndown por projeto individual
Na visão de projeto individual, o Dashboard de Projetos exibe gráfico de burndown comparando trabalho planejado vs. realizado ao longo do tempo.

---

**DSH-079** — Preferências de filtro salvas por usuário e por dashboard
Ao aplicar filtros e navegar para outra parte do sistema, ao retornar ao dashboard, os filtros são restaurados para os últimos valores usados pelo usuário naquele dashboard específico.

---

**DSH-080** — Dashboard de Integrações: volume de e-mails processados por hora visível
O Dashboard de Integrações exibe gráfico de barras com o volume de e-mails processados por hora nas últimas 24 horas, facilitando a identificação de horários de pico e anomalias.

---

## 20. Critérios de Aceitação

### 20.1 Filtros e Exportação

- [ ] **CA-01:** Filtro de período aplicado altera todos os componentes do dashboard simultaneamente.
- [ ] **CA-02:** Filtros de área, analista, categoria e serviço funcionam em todos os dashboards.
- [ ] **CA-03:** Exportação PDF inclui filtros aplicados, cabeçalho corporativo e timestamp.
- [ ] **CA-04:** Exportação Excel inclui uma aba por componente com dados tabulares.
- [ ] **CA-05:** Período padrão é "últimos 30 dias" ao carregar qualquer dashboard.
- [ ] **CA-06:** Preferências de filtro salvas por usuário e restauradas ao retornar.

### 20.2 Tempo Real e Performance

- [ ] **CA-07:** Dashboard Operacional atualiza em ≤ 5 segundos via Supabase Realtime.
- [ ] **CA-08:** Dashboard Executivo carrega em ≤ 3 segundos.
- [ ] **CA-09:** Dashboard Operacional carrega em ≤ 2 segundos.
- [ ] **CA-10:** Skeleton loaders exibidos durante carregamento de todos os componentes.
- [ ] **CA-11:** Badge de última atualização exibido em todos os dashboards.

### 20.3 KPIs e Visualização

- [ ] **CA-12:** KPIs fora da meta exibidos com destaque visual correto (vermelho/laranja).
- [ ] **CA-13:** Valores monetários formatados com separador de milhar (locale pt-BR).
- [ ] **CA-14:** Percentuais exibidos com 1 casa decimal.
- [ ] **CA-15:** Gauge de SLA exibe linha de meta como referência.
- [ ] **CA-16:** Gráficos de pizza com > 7 categorias agrupam excedentes em "Outros".
- [ ] **CA-17:** Tooltips com definição e fórmula disponíveis em todos os KPIs.
- [ ] **CA-18:** Dados ausentes exibidos como "—" e não como "0".

### 20.4 Drill Down

- [ ] **CA-19:** Todo contador e gauge abre drill down com lista filtrada ao ser clicado.
- [ ] **CA-20:** Drill down herda filtros do dashboard pai.
- [ ] **CA-21:** Drill down limitado a 3 níveis; 4º nível navega para o módulo.
- [ ] **CA-22:** Lista do drill down paginada em 25 itens por página.
- [ ] **CA-23:** Clique em fatia de pizza filtra o dashboard pela categoria clicada.

### 20.5 Permissões

- [ ] **CA-24:** IT_TECHNICIAN vê apenas seus próprios chamados no Dashboard Operacional.
- [ ] **CA-25:** Dados financeiros invisíveis para IT_TECHNICIAN e END_USER.
- [ ] **CA-26:** Usuário sem permissão recebe mensagem adequada e é redirecionado.
- [ ] **CA-27:** RLS garante que dados de Tenant A não aparecem para Tenant B.

### 20.6 Dashboards Específicos

- [ ] **CA-28:** Dashboard Executivo exibe todos os 14 KPIs definidos na seção 1.
- [ ] **CA-29:** Dashboard Operacional exibe lista ao vivo ordenada por urgência.
- [ ] **CA-30:** Gauge de Compliance Score atualizado automaticamente ao concluir auditoria.
- [ ] **CA-31:** Dashboard de Integrações exibe estado do circuit breaker em tempo real.
- [ ] **CA-32:** Dashboard Estratégico gerado todo domingo às 23h00 com dados de 24 meses.
- [ ] **CA-33:** Dashboard de SLA exibe countdown por chamado em lista ao vivo.
- [ ] **CA-34:** Dashboard de Projetos exibe Gantt para projetos individuais.
- [ ] **CA-35:** Dashboard de KB exibe taxa de deflexão calculada corretamente.

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação com 20 seções, 80 regras DSH e 35 critérios de aceitação |

---

> **Documentos relacionados:**
> [`40_INCIDENT_MANAGEMENT.md`](./40_INCIDENT_MANAGEMENT.md) — Módulo de Incidentes (KPIs de fonte)
> [`46_FINANCIAL_MANAGEMENT.md`](./46_FINANCIAL_MANAGEMENT.md) — Módulo Financeiro (KPIs de fonte)
> [`48_PROJECT_MANAGEMENT.md`](./48_PROJECT_MANAGEMENT.md) — Módulo de Projetos (KPIs de fonte)
> [`45_COMPLIANCE.md`](./45_COMPLIANCE.md) — Módulo de Compliance (KPIs de fonte)
