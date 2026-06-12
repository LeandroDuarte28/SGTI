# SGTI — Sistema de Gestão de Tecnologia da Informação
## Relatórios — Documentação Funcional

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [60_DASHBOARDS.md](./60_DASHBOARDS.md) · [40_INCIDENT_MANAGEMENT.md](./40_INCIDENT_MANAGEMENT.md) · [46_FINANCIAL_MANAGEMENT.md](./46_FINANCIAL_MANAGEMENT.md) · [45_COMPLIANCE.md](./45_COMPLIANCE.md) · [20_DATABASE.md](./20_DATABASE.md)

---

## Sobre este Documento

Este documento define a **especificação funcional completa do módulo de Relatórios do SGTI**, cobrindo todos os relatórios operacionais, gerenciais, executivos, financeiros, de compliance e de auditoria, além de agendamento, distribuição, segurança e regras de negócio.

**Escopo:** documentação funcional. Nenhum código, SQL ou API é gerado neste documento.

---

## Premissas Globais

Todo relatório do SGTI deve obrigatoriamente:

| Premissa | Descrição |
|:--------:|-----------|
| **Filtros Avançados** | Filtros por período, área, analista, categoria, serviço e campos específicos do relatório |
| **Exportação PDF** | Relatório formatado com cabeçalho corporativo, filtros e timestamp |
| **Exportação Excel** | Dados tabulares em planilha, com cabeçalhos e formatação numérica correta |
| **Exportação CSV** | Dados brutos delimitados por vírgula para integração com outros sistemas |
| **Agendamento Automático** | Execução recorrente (diária, semanal, mensal) sem intervenção manual |
| **Envio por E-mail** | Distribuição automática para lista de destinatários configurada |
| **RBAC** | Acesso restrito conforme papel do usuário; dados filtrados pelo escopo do solicitante |
| **Auditoria** | Toda execução, exportação e envio registrado em `shared.audit_log` |

---

## Sumário

1. [Objetivos do Módulo](#1-objetivos-do-módulo)
2. [Arquitetura de Relatórios](#2-arquitetura-de-relatórios)
3. [Relatórios de Incidentes](#3-relatórios-de-incidentes)
4. [Relatórios de Requisições](#4-relatórios-de-requisições)
5. [Relatórios de Problemas](#5-relatórios-de-problemas)
6. [Relatórios de Ativos](#6-relatórios-de-ativos)
7. [Relatórios de Identidades](#7-relatórios-de-identidades)
8. [Relatórios de Compliance](#8-relatórios-de-compliance)
9. [Relatórios Financeiros](#9-relatórios-financeiros)
10. [Relatórios de Compras](#10-relatórios-de-compras)
11. [Relatórios de Projetos](#11-relatórios-de-projetos)
12. [Relatórios de SLA](#12-relatórios-de-sla)
13. [Relatórios da Base de Conhecimento](#13-relatórios-da-base-de-conhecimento)
14. [Relatórios das Integrações](#14-relatórios-das-integrações)
15. [Relatórios Executivos](#15-relatórios-executivos)
16. [Agendamento](#16-agendamento)
17. [Distribuição](#17-distribuição)
18. [Auditoria de Execução](#18-auditoria-de-execução)
19. [Segurança e Permissões](#19-segurança-e-permissões)
20. [Requisitos de Performance](#20-requisitos-de-performance)
21. [Regras de Negócio](#21-regras-de-negócio)
22. [Critérios de Aceitação](#22-critérios-de-aceitação)

---

## 1. Objetivos do Módulo

### 1.1 Objetivo Primário

Prover capacidade de geração de relatórios estruturados, agendados e exportáveis que suportem a gestão operacional, gerencial e executiva de TI, garantindo rastreabilidade, conformidade com políticas de acesso e disponibilidade das informações no momento necessário.

### 1.2 Objetivos Específicos

| # | Objetivo | Meta |
|---|----------|:----:|
| 1 | Relatórios disponíveis para todos os módulos | 100% dos módulos cobertos |
| 2 | Agendamento automático sem intervenção manual | 100% dos relatórios recorrentes agendáveis |
| 3 | Exportação em múltiplos formatos | PDF, Excel e CSV em todos os relatórios |
| 4 | Rastreabilidade completa de execuções | 100% das execuções auditadas |
| 5 | RBAC aplicado consistentemente | Nenhum dado acessado fora do escopo do usuário |
| 6 | Performance adequada | Relatórios operacionais em ≤ 10s; gerenciais em ≤ 30s |

---

## 2. Arquitetura de Relatórios

### 2.1 Categorias de Relatório

| Categoria | Frequência Típica | Audiência | Escopo |
|:---------:|:-----------------:|:---------:|:------:|
| **Operacional** | Diário / Tempo real | IT_TECHNICIAN, IT_SPECIALIST | Fila atual, atrasos, pendências |
| **Gerencial** | Semanal / Mensal | IT_SPECIALIST, IT_MANAGER | Desempenho, tendências, análises |
| **Executivo** | Mensal / Trimestral | IT_MANAGER, EXECUTIVE, Diretoria | KPIs estratégicos, ROI, custos |
| **Financeiro** | Mensal / Anual | FINANCIAL_ANALYST, IT_MANAGER | OPEX, CAPEX, orçado vs. realizado |
| **Compliance** | Sob demanda / Trimestral | COMPLIANCE_OFFICER, IT_MANAGER | Apontamentos, evidências, scores |
| **Auditoria** | Sob demanda | AUDITOR, COMPLIANCE_OFFICER, IT_MANAGER | Trilhas de auditoria, acessos, alterações |

### 2.2 Componentes do Módulo de Relatórios

| Componente | Responsabilidade |
|:----------:|:-----------------|
| **ReportEngine** | Executa queries, aplica filtros e monta o relatório |
| **ReportScheduler** | Gerencia execuções agendadas (diária, semanal, mensal) |
| **ReportExporter** | Converte resultado para PDF, Excel e CSV |
| **ReportDistributor** | Envia relatórios por e-mail ou disponibiliza para download |
| **ReportAuditLogger** | Registra toda execução, exportação e envio em `audit_log` |
| **ReportAccessControl** | Aplica RBAC antes de qualquer execução de relatório |

### 2.3 Campos Padrão de Todo Relatório

Toda saída de relatório inclui:

| Campo | Localização | Descrição |
|:-----:|:----------:|-----------|
| Título do relatório | Cabeçalho | Nome completo do relatório |
| Filtros aplicados | Cabeçalho | Lista de todos os filtros ativos |
| Período de referência | Cabeçalho | Datas de início e fim dos dados |
| Data/hora de geração | Cabeçalho | Timestamp do servidor (UTC) |
| Gerado por | Cabeçalho | Nome do usuário solicitante |
| Total de registros | Rodapé | Count de linhas no relatório |
| Página X de Y (PDF) | Rodapé de página | Paginação para relatórios grandes |
| Versão do SGTI | Rodapé | Versão do sistema na geração |

### 2.4 Estrutura Padrão de Filtros

| Filtro | Tipo | Disponível em |
|:------:|:----:|:-------------:|
| Período (início / fim) | Date range | Todos |
| Área / Departamento | Multi-select | Todos |
| Analista / Responsável | Multi-select | Todos |
| Categoria | Multi-select | Todos |
| Serviço | Multi-select | Todos |
| Status | Multi-select | Operacionais e gerenciais |
| Prioridade | Multi-select | Incidentes, Requisições |
| Centro de Custo | Multi-select | Financeiros |
| Norma | Multi-select | Compliance |
| Fornecedor | Multi-select | Compras, Financeiro |
| Projeto | Multi-select | Projetos, Financeiro |
| Tipo de Aquisição | Multi-select | Compras |
| Tipo de Ativo | Multi-select | Ativos |

---

## 3. Relatórios de Incidentes

### 3.1 Catálogo de Relatórios de Incidentes

| Código | Nome | Tipo | Frequência Padrão | Destinatários Padrão |
|:------:|------|:----:|:-----------------:|:-------------------:|
| `INC-RPT-001` | Incidentes Abertos | Operacional | Diário (07h) | IT_MANAGER, IT_SPECIALIST |
| `INC-RPT-002` | Incidentes Fechados | Gerencial | Mensal | IT_MANAGER |
| `INC-RPT-003` | Incidentes Críticos | Operacional | Diário (07h) | IT_MANAGER |
| `INC-RPT-004` | Incidentes por Categoria | Gerencial | Semanal | IT_MANAGER, IT_SPECIALIST |
| `INC-RPT-005` | Incidentes por Serviço | Gerencial | Mensal | IT_MANAGER |
| `INC-RPT-006` | Incidentes por Analista | Gerencial | Semanal | IT_MANAGER, IT_SPECIALIST |
| `INC-RPT-007` | Incidentes por Área | Gerencial | Mensal | IT_MANAGER |
| `INC-RPT-008` | Incidentes por Período (Tendência) | Executivo | Mensal | IT_MANAGER, EXECUTIVE |
| `INC-RPT-009` | Incidentes com SLA Violado | Operacional | Diário (07h) | IT_MANAGER, IT_SPECIALIST |
| `INC-RPT-010` | MTTR e MTBF por Serviço | Gerencial | Mensal | IT_MANAGER |

---

### 3.2 INC-RPT-001 — Incidentes Abertos

**Descrição:** Lista completa de todos os incidentes com status diferente de CLOSED ou CANCELLED no período.

**Filtros específicos:** Status (multi), Prioridade, SLA Status (dentro/violado/próximo).

**Colunas:**

| Coluna | Tipo | Descrição |
|:------:|:----:|-----------|
| Número | String | INC-YYYY-NNNNNN (link direto) |
| Título | String | Resumo do incidente |
| Prioridade | Enum | CRITICAL / HIGH / MEDIUM / LOW |
| Status | Enum | Status atual |
| Serviço | String | Serviço do catálogo |
| Categoria | String | Categoria do incidente |
| Analista | String | Nome do responsável |
| Área | String | Departamento solicitante |
| Criado em | DateTime | Data e hora de criação |
| SLA — Prazo | DateTime | Deadline do SLA |
| SLA — Status | Enum | WITHIN / AT_RISK / BREACHED |
| Tempo Aberto | Inteiro | Horas desde a criação |

**Ordenação padrão:** CRITICAL → BREACHED → AT_RISK → mais antigos primeiro.

**Agrupamento disponível:** Por prioridade, por analista, por área.

---

### 3.3 INC-RPT-002 — Incidentes Fechados

**Descrição:** Incidentes com status CLOSED no período, com métricas de desempenho.

**Filtros específicos:** SLA Status, Canal de Origem, Com/Sem KB vinculado.

**Colunas:**

| Coluna | Descrição |
|:------:|-----------|
| Número | INC-YYYY-NNNNNN |
| Título | Resumo |
| Prioridade | Nível de prioridade |
| Categoria / Serviço | Classificação |
| Analista | Resolveu |
| Área | Solicitante |
| Criado em | Data/hora de abertura |
| Resolvido em | Data/hora de resolução |
| Fechado em | Data/hora de encerramento |
| MTTR | Tempo total de resolução (horas) |
| SLA | WITHIN / BREACHED |
| FCR | Sim / Não (resolvido no primeiro contato) |
| Artigo KB | Código do artigo utilizado (se houver) |
| CSAT | Nota de satisfação (1–5 ou "N/A") |

**Totalizadores:** Total de incidentes, MTTR médio, % SLA cumprido, % FCR, CSAT médio.

---

### 3.4 INC-RPT-003 — Incidentes Críticos

**Descrição:** Incidentes com prioridade CRITICAL, independentemente do status.

**Colunas adicionais:** `impact_scope` (usuários impactados), `root_cause` (se disponível), `problem_id` (vinculado).

**Seção resumo:** Total críticos no período, média de MTTR para críticos, % resolvidos em SLA.

---

### 3.5 INC-RPT-004 — Incidentes por Categoria

**Descrição:** Distribuição e métricas de incidentes agrupados por categoria.

**Formato:** Tabela resumo + detalhe por categoria.

| Coluna (resumo) | Descrição |
|:---------------:|-----------|
| Categoria | Nome |
| Total | Quantidade no período |
| % do Total | Participação percentual |
| MTTR Médio | Tempo médio de resolução |
| % SLA Cumprido | Aderência ao SLA |
| Recorrentes | COUNT com problema vinculado |

---

### 3.6 INC-RPT-005 — Incidentes por Serviço

**Similar a INC-RPT-004, agrupado por serviço do catálogo.**

Adicional: coluna `MTBF` por serviço (tempo médio entre falhas).

---

### 3.7 INC-RPT-006 — Incidentes por Analista

**Descrição:** Desempenho individual de cada analista no período.

| Coluna | Descrição |
|:------:|-----------|
| Analista | Nome |
| Abertos | COUNT atribuídos no período |
| Fechados | COUNT resolvidos no período |
| Em Aberto | Backlog atual |
| MTTR Médio | Tempo médio de resolução |
| % SLA Cumprido | Aderência pessoal ao SLA |
| FCR (%) | Taxa de resolução no primeiro contato |
| CSAT Médio | Nota média de satisfação |

---

### 3.8 INC-RPT-007 — Incidentes por Área

**Similar ao de analista, agrupado por departamento solicitante.**

---

### 3.9 INC-RPT-008 — Incidentes por Período (Tendência)

**Descrição:** Evolução do volume de incidentes mês a mês.

**Colunas:** Mês/Ano, Total, CRITICAL, HIGH, MEDIUM, LOW, Fechados, MTTR Médio, % SLA Cumprido.

**Gráfico incluso no PDF:** Linha dupla (total abertos vs. fechados por mês).

---

### 3.10 INC-RPT-009 — Incidentes com SLA Violado

**Descrição:** Todos os incidentes que violaram o SLA no período.

**Colunas adicionais:** `breach_reason`, `time_overdue` (horas além do prazo), `sla_policy_name`.

**Totalizadores:** Total violado, tempo médio de atraso, top 5 analistas com mais violações, top 5 serviços com mais violações.

---

### 3.11 INC-RPT-010 — MTTR e MTBF por Serviço

**Descrição:** Métricas de desempenho técnico por serviço.

| Coluna | Descrição |
|:------:|-----------|
| Serviço | Nome do serviço |
| Total Incidentes | Período |
| MTTR Médio | Horas |
| MTTR Mínimo / Máximo | Range |
| MTBF | Horas entre falhas (média) |
| Disponibilidade Estimada | % uptime calculado |
| Tendência | ↑ Piorando / ↓ Melhorando vs. período anterior |

---

## 4. Relatórios de Requisições

### 4.1 Catálogo de Relatórios de Requisições

| Código | Nome | Tipo | Frequência Padrão |
|:------:|------|:----:|:-----------------:|
| `REQ-RPT-001` | Requisições Abertas | Operacional | Diário (07h) |
| `REQ-RPT-002` | Requisições Concluídas | Gerencial | Mensal |
| `REQ-RPT-003` | Requisições por Tipo de Serviço | Gerencial | Mensal |
| `REQ-RPT-004` | Requisições por Analista | Gerencial | Semanal |
| `REQ-RPT-005` | Requisições por Área | Gerencial | Mensal |
| `REQ-RPT-006` | Ciclo de Aprovação | Gerencial | Mensal |
| `REQ-RPT-007` | Satisfação do Usuário (CSAT) | Gerencial | Mensal |
| `REQ-RPT-008` | Requisições com SLA Violado | Operacional | Diário |

### 4.2 Colunas Padrão

Além dos campos de identificação (número, título, status), os relatórios de requisições incluem:
- `fulfillment_time` (tempo de atendimento em horas)
- `approval_time` (tempo médio de aprovação em horas)
- `origin` (PORTAL, EMAIL, PHONE)
- `satisfaction_score` (CSAT 1–5)
- `linked_purchase_request` (se gerou compra)

### 4.3 REQ-RPT-006 — Ciclo de Aprovação

**Objetivo:** Identificar gargalos no processo de aprovação.

**Colunas:** Etapa de aprovação, Volume, Tempo médio nessa etapa (horas), % aprovadas, % rejeitadas, % devolvidas.

---

## 5. Relatórios de Problemas

### 5.1 Catálogo de Relatórios de Problemas

| Código | Nome | Tipo | Frequência Padrão |
|:------:|------|:----:|:-----------------:|
| `PRB-RPT-001` | Problemas Abertos | Operacional | Semanal |
| `PRB-RPT-002` | Erros Conhecidos (KEDB) | Gerencial | Mensal |
| `PRB-RPT-003` | Problemas por Serviço | Gerencial | Mensal |
| `PRB-RPT-004` | Incidentes por Problema | Gerencial | Mensal |
| `PRB-RPT-005` | Taxa de Resolução Definitiva | Executivo | Trimestral |

### 5.2 PRB-RPT-002 — Erros Conhecidos (KEDB)

**Colunas:** Problema, Status (KNOWN_ERROR), Serviço afetado, Workaround disponível (S/N), Incidentes que usaram o workaround, Data de identificação, Solução definitiva prevista.

---

## 6. Relatórios de Ativos

### 6.1 Catálogo de Relatórios de Ativos

| Código | Nome | Tipo | Frequência Padrão |
|:------:|------|:----:|:-----------------:|
| `AST-RPT-001` | Inventário Completo | Gerencial | Mensal |
| `AST-RPT-002` | Ativos por Usuário | Gerencial | Mensal |
| `AST-RPT-003` | Ativos por Departamento | Gerencial | Mensal |
| `AST-RPT-004` | Ativos Sem Responsável | Operacional | Semanal |
| `AST-RPT-005` | Ativos por Categoria | Gerencial | Mensal |
| `AST-RPT-006` | Garantias Vencendo | Operacional | Mensal |
| `AST-RPT-007` | Contratos Vencendo | Operacional | Mensal |
| `AST-RPT-008` | Depreciação do Parque | Financeiro | Mensal (1º dia útil) |
| `AST-RPT-009` | Licenças Subutilizadas | Gerencial | Mensal |
| `AST-RPT-010` | Ativos por Status | Operacional | Semanal |
| `AST-RPT-011` | TCO por Ativo | Financeiro | Trimestral |

---

### 6.2 AST-RPT-001 — Inventário Completo

**Colunas:**

| Coluna | Descrição |
|:------:|-----------|
| Código Patrimonial | asset_tag |
| Nome / Modelo | Identificação do ativo |
| Categoria | Tipo do ativo |
| Fabricante | Fabricante |
| Número de Série | serial_number |
| Status | Status atual |
| Localização | Localização física |
| Responsável | Usuário atribuído |
| Departamento | Departamento |
| Classificação | OPEX ou CAPEX |
| Valor Aquisição | R$ |
| Valor Atual | R$ (após depreciação) |
| Data Aquisição | Data |
| Fim de Garantia | Data |
| Fim Vida Útil | Data |
| Sincronizado GLPI | S/N + data |

---

### 6.3 AST-RPT-002 — Ativos por Usuário

**Colunas:** Usuário, Departamento, Gestor, Quantidade de Ativos, Valor Total (R$), Lista de Ativos (asset_tag, nome, categoria).

**Totalizadores:** Total de usuários com ativos, média de ativos por usuário, usuário com maior valor alocado.

---

### 6.4 AST-RPT-003 — Ativos por Departamento

**Similar ao por usuário, agrupado por departamento.**

Adicional: custo total alocado ao departamento (OPEX + CAPEX dos ativos do departamento).

---

### 6.5 AST-RPT-004 — Ativos Sem Responsável

**Colunas:** asset_tag, Nome, Categoria, Status, Localização, Dias sem responsável, Último responsável.

**Alerta:** Gerado automaticamente toda semana para IT_MANAGER.

---

### 6.6 AST-RPT-006 — Garantias Vencendo

**Filtro adicional:** Janela de vencimento (30, 60, 90 dias).

**Colunas:** asset_tag, Nome, Categoria, Fabricante, Fim de Garantia, Dias restantes, Tipo de Garantia, Fornecedor da Garantia, Valor do ativo.

**Ordenação:** Por data de vencimento (mais próxima primeiro).

---

### 6.7 AST-RPT-007 — Contratos Vencendo

**Colunas:** Contrato, Fornecedor, Tipo, Vigência, Valor, Dias Restantes, Renovação Automática (S/N), Responsável.

---

### 6.8 AST-RPT-008 — Depreciação do Parque

**Colunas:** asset_tag, Nome, Categoria, Valor Original, Depreciação Acumulada, Valor Atual, Método de Depreciação, Vida Útil Restante (meses), Centro de Custo.

**Totalizadores:** Valor total original, depreciação acumulada total, valor atual total do parque.

---

### 6.9 AST-RPT-011 — TCO por Ativo

**Colunas:** asset_tag, Nome, Valor de Aquisição, Custo de Manutenção Acumulado, Custo de Suporte, Custo Total (TCO), Valor Atual, Relação Manutenção/Valor (%), Recomendação (Manter/Avaliar Substituição).

---

## 7. Relatórios de Identidades

### 7.1 Catálogo de Relatórios de Identidades

| Código | Nome | Tipo | Frequência Padrão |
|:------:|------|:----:|:-----------------:|
| `IAM-RPT-001` | Inventário de Usuários | Gerencial | Mensal |
| `IAM-RPT-002` | Usuários por Departamento | Gerencial | Mensal |
| `IAM-RPT-003` | Usuários por Papel (Roles) | Gerencial | Trimestral |
| `IAM-RPT-004` | Revisão de Acessos | Compliance | Trimestral |
| `IAM-RPT-005` | Onboardings e Offboardings | Gerencial | Mensal |
| `IAM-RPT-006` | Usuários sem MFA (Papéis Críticos) | Compliance | Mensal |
| `IAM-RPT-007` | Acessos Concedidos e Revogados | Auditoria | Mensal |

### 7.2 IAM-RPT-001 — Inventário de Usuários

**Colunas:** Nome, E-mail, Cargo, Departamento, Gestor, Status, Papéis, MFA Habilitado, Data de Admissão, Última Autenticação, Próxima Revisão de Acesso.

### 7.3 IAM-RPT-004 — Revisão de Acessos

**Colunas:** Usuário, Papel, Atribuído por, Data de Atribuição, Última revisão, Resultado (Mantido/Revogado), Revisor, Data da Revisão.

**Seção de sumário:** Papéis mantidos, papéis revogados, usuários sem revisão no prazo.

---

## 8. Relatórios de Compliance

### 8.1 Catálogo de Relatórios de Compliance

| Código | Nome | Tipo | Frequência Padrão |
|:------:|------|:----:|:-----------------:|
| `CMP-RPT-001` | Apontamentos Abertos | Operacional | Diário (07h) |
| `CMP-RPT-002` | Apontamentos Vencidos | Operacional | Diário (07h) |
| `CMP-RPT-003` | Evidências Pendentes de Revisão | Operacional | Semanal |
| `CMP-RPT-004` | Apontamentos por Norma | Gerencial | Mensal |
| `CMP-RPT-005` | Apontamentos por Consultoria | Gerencial | Por Auditoria |
| `CMP-RPT-006` | Apontamentos por Analista | Gerencial | Mensal |
| `CMP-RPT-007` | Apontamentos por Área | Gerencial | Mensal |
| `CMP-RPT-008` | Inventário de Riscos | Gerencial | Trimestral |
| `CMP-RPT-009` | Compliance Score Histórico | Executivo | Trimestral |
| `CMP-RPT-010` | Planos de Ação — Status | Gerencial | Mensal |
| `CMP-RPT-011` | Pacote de Evidências para Auditoria | Auditoria | Sob Demanda |
| `CMP-RPT-012` | Custo de Adequação por Norma | Financeiro | Trimestral |

---

### 8.2 CMP-RPT-001 — Apontamentos Abertos

**Colunas:**

| Coluna | Descrição |
|:------:|-----------|
| Código | CMP-YYYY-NNNNNN |
| Título | Resumo |
| Tipo | NC / OBS / OPM / PA |
| Criticidade | CRITICAL / MAJOR / MINOR / OBSERVATION |
| Norma | Framework referenciado |
| Item Normativo | Controle específico |
| Área | Departamento responsável |
| Analista | Responsável |
| Auditoria | Origem |
| Data Limite | Prazo |
| Dias para Vencer | Calculado |
| Status | Status atual |

**Destaque visual no PDF:** Linhas com status OVERDUE em vermelho; linhas com prazo ≤ 7 dias em amarelo.

---

### 8.3 CMP-RPT-002 — Apontamentos Vencidos

**Filtro específico:** Apenas apontamentos com `due_date < hoje` e `status ≠ CONCLUDED`.

**Colunas adicionais:** `days_overdue` (dias de atraso), `last_activity_at` (última movimentação).

**Ordenação:** Por dias de atraso decrescente; CRITICAL primeiro.

---

### 8.4 CMP-RPT-004 — Apontamentos por Norma

**Resumo por norma:**

| Coluna | Descrição |
|:------:|-----------|
| Norma | Framework |
| Compliance Score | % atual |
| Total Apontamentos | No período |
| Abertos | Count |
| Concluídos | Count |
| Vencidos | Count |
| % Resolvidos no Prazo | Eficiência |

---

### 8.5 CMP-RPT-011 — Pacote de Evidências para Auditoria

**Descrição:** Relatório consolidado gerado para entrega a auditores externos.

**Conteúdo:**
- Sumário executivo do programa de compliance.
- Inventário de apontamentos com status.
- Lista de evidências aprovadas com hash SHA-256.
- Planos de ação concluídos.
- Compliance Score por auditoria.
- Histórico de audit_log do período.

**Aprovação obrigatória:** IT_MANAGER deve aprovar antes da geração. A aprovação fica registrada no relatório e no audit_log.

---

## 9. Relatórios Financeiros

### 9.1 Catálogo de Relatórios Financeiros

| Código | Nome | Tipo | Frequência Padrão |
|:------:|------|:----:|:-----------------:|
| `FIN-RPT-001` | OPEX por Período | Financeiro | Mensal (1º dia útil) |
| `FIN-RPT-002` | CAPEX por Período | Financeiro | Mensal (1º dia útil) |
| `FIN-RPT-003` | OPEX por Centro de Custo | Financeiro | Mensal (1º dia útil) |
| `FIN-RPT-004` | CAPEX por Centro de Custo | Financeiro | Mensal (1º dia útil) |
| `FIN-RPT-005` | Custos por Ativo (TCO) | Financeiro | Trimestral |
| `FIN-RPT-006` | Custos por Projeto | Financeiro | Por projeto / Mensal |
| `FIN-RPT-007` | Custos por Serviço | Financeiro | Trimestral |
| `FIN-RPT-008` | Custos de Compliance | Financeiro | Trimestral |
| `FIN-RPT-009` | Orçado vs. Realizado | Executivo | Mensal |
| `FIN-RPT-010` | Depreciação Acumulada | Financeiro | Mensal (1º dia útil) |
| `FIN-RPT-011` | Fornecedores por Gasto | Gerencial | Trimestral |
| `FIN-RPT-012` | Contratos Ativos | Gerencial | Mensal |

---

### 9.2 FIN-RPT-001 — OPEX por Período

**Colunas:**

| Coluna | Descrição |
|:------:|-----------|
| Código | OPX-YYYY-NNNNNN |
| Descrição | Descrição da despesa |
| Categoria | Tipo de despesa |
| Fornecedor | Fornecedor |
| Centro de Custo | CC responsável |
| Competência | Mês/ano |
| Valor (R$) | Valor da despesa |
| NF | Número da nota fiscal |
| Classificação | OPEX (sempre) |
| Projeto | Se vinculado |
| Serviço | Se vinculado |
| Compliance | Se vinculado a auditoria |

**Totalizadores:** Total do período, total por categoria, total por CC.

---

### 9.3 FIN-RPT-003 — OPEX por Centro de Custo

**Resumo:** Uma linha por CC com total OPEX do período, variação vs. período anterior, % do total de TI.

**Detalhe:** Lançamentos individuais por CC na mesma planilha em aba separada.

---

### 9.4 FIN-RPT-009 — Orçado vs. Realizado

**Colunas por linha (uma linha por CC + tipo OPEX/CAPEX):**

| Coluna | Descrição |
|:------:|-----------|
| Centro de Custo | CC |
| Tipo | OPEX / CAPEX |
| Orçado | Valor aprovado no exercício |
| Comprometido | Valor comprometido (POs emitidos) |
| Realizado | Valor efetivado |
| Saldo | Orçado − Comprometido − Realizado |
| % Utilizado | Realizado / Orçado × 100 |
| Variância | Realizado − Orçado (negativo = estouro) |

**Totalizadores:** Total geral orçado, comprometido, realizado e saldo.

**Gráfico incluso (PDF):** Barras agrupadas por CC mostrando orçado × realizado.

---

### 9.5 FIN-RPT-008 — Custos de Compliance

**Colunas:** Auditoria, Norma, Tipo de Custo (honorário/ferramenta/treinamento), Lançamento, Valor (R$), Classificação (OPEX/CAPEX).

**Totalizadores:** Total por norma, total por auditoria, total geral de compliance.

---

## 10. Relatórios de Compras

### 10.1 Catálogo de Relatórios de Compras

| Código | Nome | Tipo | Frequência Padrão |
|:------:|------|:----:|:-----------------:|
| `PRC-RPT-001` | Compras Abertas | Operacional | Diário (07h) |
| `PRC-RPT-002` | Compras Concluídas | Gerencial | Mensal |
| `PRC-RPT-003` | Compras por Fornecedor | Gerencial | Trimestral |
| `PRC-RPT-004` | Compras por Categoria | Gerencial | Mensal |
| `PRC-RPT-005` | Ciclo de Compras | Gerencial | Mensal |
| `PRC-RPT-006` | Saving Gerado | Gerencial | Mensal |
| `PRC-RPT-007` | Conformidade de Cotações | Compliance | Trimestral |
| `PRC-RPT-008` | Contratos por Vencimento | Operacional | Mensal |
| `PRC-RPT-009` | Avaliação de Fornecedores | Gerencial | Trimestral |

### 10.2 PRC-RPT-005 — Ciclo de Compras

**Colunas:** PRC número, Tipo de Aquisição, Valor Estimado, Valor Real, Data Submissão, Data Aprovação, Data Emissão PO, Data Recebimento, Tempo Submissão→Aprovação (dias), Tempo Aprovação→PO (dias), Tempo PO→Recebimento (dias), Ciclo Total (dias).

### 10.3 PRC-RPT-007 — Conformidade de Cotações

**Descrição:** Verifica se compras acima de R$10.000 tiveram 3+ cotações conforme exigido.

**Colunas:** PRC número, Valor, Qtd. Cotações, Conformidade (S/N), Motivo de Não Conformidade (se houver), Aprovador.

---

## 11. Relatórios de Projetos

### 11.1 Catálogo de Relatórios de Projetos

| Código | Nome | Tipo | Frequência Padrão |
|:------:|------|:----:|:-----------------:|
| `PRJ-RPT-001` | Portfólio de Projetos | Gerencial | Semanal |
| `PRJ-RPT-002` | Projetos Atrasados | Operacional | Semanal |
| `PRJ-RPT-003` | Status de Marcos | Gerencial | Semanal |
| `PRJ-RPT-004` | Financeiro por Projeto | Financeiro | Mensal |
| `PRJ-RPT-005` | Riscos do Portfólio | Gerencial | Mensal |
| `PRJ-RPT-006` | Benefícios Realizados | Executivo | Semestral |
| `PRJ-RPT-007` | Lições Aprendidas | Gerencial | Por encerramento |
| `PRJ-RPT-008` | Capacidade vs. Demanda | Gerencial | Trimestral |

### 11.2 PRJ-RPT-001 — Portfólio de Projetos

**Colunas:** Código, Nome, Tipo, Status, Health, Sponsor, PM, Início, Fim Planejado, % Conclusão, Orçado (R$), Realizado (R$), % Orçamento, Atrasos (dias), Riscos Críticos, Estratégico (S/N).

### 11.3 PRJ-RPT-004 — Financeiro por Projeto

**Colunas:** Projeto, CAPEX Orçado, CAPEX Realizado, OPEX Orçado, OPEX Realizado, Total Orçado, Total Realizado, Saldo, % Utilizado.

---

## 12. Relatórios de SLA

### 12.1 Catálogo de Relatórios de SLA

| Código | Nome | Tipo | Frequência Padrão |
|:------:|------|:----:|:-----------------:|
| `SLA-RPT-001` | SLA por Serviço | Gerencial | Mensal |
| `SLA-RPT-002` | SLA por Área | Gerencial | Mensal |
| `SLA-RPT-003` | SLA por Analista | Gerencial | Semanal |
| `SLA-RPT-004` | SLA por Período (Tendência) | Executivo | Mensal |
| `SLA-RPT-005` | SLA Violado — Detalhado | Operacional | Diário |
| `SLA-RPT-006` | SLA por Prioridade | Gerencial | Mensal |

---

### 12.2 SLA-RPT-001 — SLA por Serviço

**Colunas:**

| Coluna | Descrição |
|:------:|-----------|
| Serviço | Nome |
| Política de SLA | Nome da política aplicada |
| Total de Chamados | Período |
| Dentro do SLA | Quantidade + % |
| Violados | Quantidade + % |
| Em Risco | Quantidade + % |
| Tempo Médio de Resposta | Horas |
| Tempo Médio de Resolução | Horas |
| Meta de Resposta | Horas (configurada na política) |
| Meta de Resolução | Horas (configurada na política) |

---

### 12.3 SLA-RPT-003 — SLA por Analista

**Colunas:** Analista, Departamento, Total de Chamados, % SLA Cumprido, Violações, Tempo Médio de Resposta, Tempo Médio de Resolução, CSAT Médio.

**Ordenação padrão:** Por % SLA cumprido crescente (piores primeiro) para identificar necessidade de suporte.

---

### 12.4 SLA-RPT-005 — SLA Violado — Detalhado

**Colunas adicionais:** `breach_reason`, `time_overdue` (horas de atraso), `sla_policy_name`, `was_paused` (S/N), `pause_duration_hours`.

---

## 13. Relatórios da Base de Conhecimento

### 13.1 Catálogo de Relatórios de KB

| Código | Nome | Tipo | Frequência Padrão |
|:------:|------|:----:|:-----------------:|
| `KB-RPT-001` | Artigos Publicados | Gerencial | Mensal |
| `KB-RPT-002` | Artigos Pendentes de Revisão | Operacional | Semanal |
| `KB-RPT-003` | Artigos com Avaliação Baixa | Gerencial | Mensal |
| `KB-RPT-004` | Deflexões Geradas | Gerencial | Mensal |
| `KB-RPT-005` | Resolução de Incidentes via KB | Gerencial | Mensal |
| `KB-RPT-006` | Produção por Autor | Gerencial | Mensal |
| `KB-RPT-007` | Cobertura por Serviço | Gerencial | Mensal |
| `KB-RPT-008` | KEDB Status | Gerencial | Mensal |

### 13.2 KB-RPT-001 — Artigos Publicados

**Colunas:** Código KB, Título, Tipo, Categoria, Autor, Versão, Data Publicação, Próxima Revisão, Visualizações, Helpful Rate (%), Deflexões, Incidentes Resolvidos, Dias desde Publicação.

### 13.3 KB-RPT-004 — Deflexões Geradas

**Colunas:** Data, Artigo KB, Título, Serviço, Deflexões (usuários que não abriram chamado), Visualizações do Dia.

**Totalizadores:** Total de deflexões no período, taxa de deflexão geral, estimativa de horas economizadas (deflexões × MTTR médio de incidentes).

---

## 14. Relatórios das Integrações

### 14.1 Catálogo de Relatórios de Integrações

| Código | Nome | Tipo | Frequência Padrão |
|:------:|------|:----:|:-----------------:|
| `INT-RPT-001` | Status Diário de Integrações | Operacional | Diário (07h) |
| `INT-RPT-002` | Sincronizações Google Workspace | Gerencial | Semanal |
| `INT-RPT-003` | Sincronizações GLPI | Gerencial | Semanal |
| `INT-RPT-004` | E-mails Processados | Gerencial | Semanal |
| `INT-RPT-005` | Falhas de Integração | Operacional | Diário |
| `INT-RPT-006` | Divergências GLPI vs. SGTI | Gerencial | Semanal |

### 14.2 INT-RPT-001 — Status Diário de Integrações

**Colunas:** Integração, Status (OK/DEGRADADO/OFFLINE), Última Sync, Itens Processados, Erros, Circuit Breaker (CLOSED/OPEN), DLQ Pendente.

### 14.3 INT-RPT-005 — Falhas de Integração

**Colunas:** Data/Hora, Integração, Operação, Código do Erro, Mensagem, Tentativas, Status Final (Recuperado/DLQ), Resolução.

---

## 15. Relatórios Executivos

### 15.1 Catálogo de Relatórios Executivos

| Código | Nome | Tipo | Frequência Padrão |
|:------:|------|:----:|:-----------------:|
| `EXE-RPT-001` | Saúde da Operação de TI | Executivo | Mensal |
| `EXE-RPT-002` | Tendências de TI (12 meses) | Executivo | Trimestral |
| `EXE-RPT-003` | Backlog e Capacidade | Executivo | Mensal |
| `EXE-RPT-004` | Compliance Score Consolidado | Executivo | Trimestral |
| `EXE-RPT-005` | Custos e ROI de TI | Executivo | Trimestral |
| `EXE-RPT-006` | Portfólio de Projetos | Executivo | Mensal |
| `EXE-RPT-007` | Indicadores Estratégicos | Executivo | Semestral |

---

### 15.2 EXE-RPT-001 — Saúde da Operação de TI

**Estrutura:**

**Seção 1 — Resumo Executivo:**
- Total de chamados no período
- SLA geral cumprido (%)
- MTTR médio
- CSAT médio
- Incidentes críticos

**Seção 2 — Destaques Positivos e Pontos de Atenção:**
- Top 3 serviços com melhor desempenho
- Top 3 serviços que precisam de atenção
- Variação vs. mês anterior

**Seção 3 — Compliance:**
- Compliance Score global
- Apontamentos críticos abertos

**Seção 4 — Projetos:**
- Projetos ativos / atrasados
- Investimento em andamento (R$)

**Formato:** Sempre em PDF (2–4 páginas); gráficos visuais inclusos.

---

### 15.3 EXE-RPT-002 — Tendências de TI (12 meses)

**Colunas mensais:** Mês, Incidentes, MTTR, SLA%, FCR%, Requisições, CSAT, OPEX, CAPEX, Projetos Abertos, Compliance Score.

**Gráficos:** Evolução de todos os indicadores ao longo dos 12 meses.

---

### 15.4 EXE-RPT-007 — Indicadores Estratégicos

**Conteúdo:**
- Custo de TI / Receita da empresa (%)
- Custo de TI por colaborador (R$)
- ROI de TI (benefícios realizados / custos)
- Disponibilidade média dos serviços críticos (%)
- Taxa de automação (%)
- Maturidade ITIL por processo (1–5)
- Índice de satisfação geral (CSAT consolidado)
- Taxa de resolução no primeiro contato (FCR)

---

## 16. Agendamento

### 16.1 Frequências Disponíveis

| Frequência | Configuração | Exemplo |
|:----------:|:------------:|---------|
| **Diário** | Hora de execução | Todo dia às 07h00 |
| **Semanal** | Dia da semana + hora | Toda segunda-feira às 07h00 |
| **Quinzenal** | Dias do mês + hora | Dias 1 e 15 de cada mês às 08h00 |
| **Mensal** | Dia do mês + hora | Primeiro dia útil de cada mês às 06h00 |
| **Trimestral** | Mês + dia + hora | Primeiro dia útil de jan, abr, jul, out |
| **Sob Demanda** | Manual | Executado quando o usuário aciona |

### 16.2 Campos de Configuração de Agendamento

| Campo | Tipo | Descrição |
|:-----:|:----:|-----------|
| Relatório | FK | Relatório a ser executado |
| Nome do Agendamento | String | Nome descritivo |
| Frequência | Enum | Tabela acima |
| Parâmetros de Frequência | Conforme tipo | Hora, dia, mês |
| Filtros Pré-definidos | JSONB | Filtros aplicados automaticamente na execução |
| Formato de Exportação | Enum | PDF, Excel, CSV ou múltiplos |
| Destinatários | Array String | Lista de e-mails para envio |
| Assunto do E-mail | String | Template configurável |
| Ativo | Boolean | Habilitar/desabilitar sem excluir |
| Próxima Execução | DateTime | Calculado automaticamente |
| Última Execução | DateTime | Timestamp da última execução |
| Criado Por | FK — User | Quem criou o agendamento |

### 16.3 Controle de Execução de Agendamentos

```
ReportSchedulerJob (executa a cada 5 minutos)

1. Busca agendamentos com próxima_execução ≤ NOW() e ativo=true
2. Para cada agendamento:
   a. Verifica permissão do criador (ainda tem acesso ao relatório?)
   b. Executa o relatório com os filtros configurados
   c. Exporta no(s) formato(s) configurado(s)
   d. Distribui para os destinatários
   e. Registra em ReportExecution (sucesso/falha)
   f. Calcula próxima_execução
3. Falha: incrementa tentativas; retry após 30 min; após 3 falhas: notifica criador
```

---

## 17. Distribuição

### 17.1 Distribuição por E-mail

**Configuração:**
- Lista de destinatários (e-mails internos e externos).
- Assunto configurável com variáveis: `{report_name}`, `{period}`, `{date}`.
- Corpo padrão: "Segue em anexo o relatório {report_name} referente ao período {period}."
- Relatório anexado no(s) formato(s) selecionado(s).
- Limite de tamanho do anexo: 25 MB (limite Gmail/SMTP).

**Formato do assunto padrão:**
```
[SGTI] {nome_do_relatório} — {período_de_referência} — {data_geração}
```

### 17.2 Download Direto

Relatórios gerados sob demanda ou agendados ficam disponíveis para download no histórico de execuções do módulo de relatórios:

- Disponível por 30 dias após a geração.
- URL de download com token assinado (presigned URL, 1 hora de validade).
- Listados na seção "Meus Relatórios" para o usuário que solicitou.

### 17.3 Compartilhamento Interno

IT_MANAGER+ pode compartilhar relatório gerado com outros usuários do SGTI:
- Usuário destinatário recebe notificação in-app com link.
- Acesso controlado por RBAC: o destinatário só pode visualizar se tiver permissão para o relatório.
- Compartilhamento registrado em audit_log.

---

## 18. Auditoria de Execução

### 18.1 Campos do Registro de Execução

Toda execução de relatório (manual ou agendada) gera registro em `shared.audit_log` com `action = REPORT_EXECUTED` e em uma tabela dedicada de execuções:

| Campo | Tipo | Descrição |
|:-----:|:----:|-----------|
| id | UUID | Identificador único |
| report_code | String | Código do relatório (ex.: INC-RPT-001) |
| report_name | String | Nome do relatório |
| executed_by | FK — User | Usuário que executou (ou system para agendado) |
| execution_type | Enum | MANUAL ou SCHEDULED |
| schedule_id | UUID | FK para agendamento (se SCHEDULED) |
| filters_applied | JSONB | Todos os filtros utilizados na execução |
| period_start | Date | Data de início do período |
| period_end | Date | Data de fim do período |
| record_count | Inteiro | Quantidade de registros no resultado |
| formats_generated | Array Enum | PDF / Excel / CSV |
| file_size_bytes | Bigint | Tamanho total dos arquivos gerados |
| recipients | Array String | E-mails que receberam o relatório |
| status | Enum | SUCCESS / PARTIAL / FAILED |
| error_message | Text | Detalhes do erro (se falhou) |
| duration_ms | Inteiro | Tempo de execução em milissegundos |
| executed_at | DateTime | Timestamp da execução |
| ip_address | INET | IP do solicitante (manual) |

### 18.2 Eventos Auditados

| Evento | `action` | Quem Gera |
|:------:|:--------:|:---------:|
| Relatório executado | `REPORT_EXECUTED` | ReportAuditLogger |
| Relatório exportado (PDF/Excel/CSV) | `REPORT_EXPORTED` | ReportAuditLogger |
| Relatório enviado por e-mail | `REPORT_EMAILED` | ReportAuditLogger |
| Relatório compartilhado internamente | `REPORT_SHARED` | ReportAuditLogger |
| Agendamento criado | `REPORT_SCHEDULE_CREATED` | ReportAuditLogger |
| Agendamento alterado | `REPORT_SCHEDULE_UPDATED` | ReportAuditLogger |
| Agendamento desativado | `REPORT_SCHEDULE_DISABLED` | ReportAuditLogger |
| Acesso negado (RBAC) | `REPORT_ACCESS_DENIED` | ReportAccessControl |
| Relatório baixado | `REPORT_DOWNLOADED` | ReportAuditLogger |

---

## 19. Segurança e Permissões

### 19.1 Acesso por Relatório e Perfil

| Grupo de Relatórios | END_USER | IT_TECHNICIAN | IT_SPECIALIST | COMPLIANCE_OFFICER | FINANCIAL_ANALYST | PROJECT_MANAGER | IT_MANAGER | AUDITOR | SUPER_ADMIN |
|:-------------------:|:--------:|:-------------:|:-------------:|:------------------:|:-----------------:|:---------------:|:----------:|:-------:|:-----------:|
| Incidentes | ❌ | ✅ (próprios) | ✅ | ❌ | ❌ | ❌ | ✅ | Leitura | ✅ |
| Requisições | ❌ | ✅ (próprios) | ✅ | ❌ | ❌ | ❌ | ✅ | Leitura | ✅ |
| Problemas | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | Leitura | ✅ |
| Ativos | ❌ | ✅ | ✅ | Parcial | ✅ | ❌ | ✅ | Leitura | ✅ |
| Identidades | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Compliance | ❌ | ❌ | ❌ | ✅ | Parcial (custos) | ❌ | ✅ | ✅ | ✅ |
| Financeiros | ❌ | ❌ | ❌ | Parcial | ✅ | Parcial (proj.) | ✅ | Leitura | ✅ |
| Compras | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | Leitura | ✅ |
| Projetos | ❌ | ❌ | ✅ (próprios) | ❌ | ❌ | ✅ (próprios) | ✅ | Leitura | ✅ |
| SLA | ❌ | ✅ (próprios) | ✅ | ❌ | ❌ | ❌ | ✅ | Leitura | ✅ |
| Base de Conhecimento | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | Leitura | ✅ |
| Integrações | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Executivos | ❌ | ❌ | ❌ | Parcial | Parcial | Parcial (proj.) | ✅ | ✅ | ✅ |
| Auditoria Completa | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |

### 19.2 Restrição de Escopo de Dados

| Papel | Escopo dos Dados |
|:-----:|:---------------:|
| IT_TECHNICIAN | Apenas registros onde `assignee_id = self` ou `created_by = self` |
| IT_SPECIALIST | Registros do seu grupo de suporte e áreas sob responsabilidade |
| PROJECT_MANAGER | Dados financeiros e de progresso apenas dos seus projetos |
| COMPLIANCE_OFFICER | Acesso a todos os dados de compliance; dados financeiros apenas de adequação |
| FINANCIAL_ANALYST | Todos os dados financeiros; sem acesso a dados operacionais de incidentes |
| AUDITOR | Leitura de todos os módulos sem filtro de escopo; sem exportação em massa |

### 19.3 Dados Sensíveis em Relatórios

| Tipo de Dado | Visível para |
|:------------:|:------------:|
| Valores financeiros (R$) | FINANCIAL_ANALYST, IT_MANAGER+ |
| E-mail e dados pessoais de usuários | IT_MANAGER+, AUDITOR |
| Hash SHA-256 de evidências | COMPLIANCE_OFFICER, IT_MANAGER+ |
| Chaves de licença de software | FINANCIAL_ANALYST, IT_MANAGER+ |
| IP de acesso em logs | IT_MANAGER+, AUDITOR |

### 19.4 Acesso de Usuário Externo (Auditor Externo)

Usuários com papel `AUDITOR` vinculados a auditorias externas no módulo de Compliance têm acesso restrito:
- Apenas ao pacote `CMP-RPT-011` (Pacote de Evidências para Auditoria) da auditoria à qual estão vinculados.
- Sem acesso a qualquer outro relatório.
- Todo acesso registrado em audit_log.

---

## 20. Requisitos de Performance

### 20.1 Tempo de Execução por Categoria

| Categoria | Volume Típico | Requisito | Estratégia |
|:---------:|:-------------:|:---------:|:----------:|
| Operacional (fila atual) | ≤ 500 registros | ≤ 5 segundos | Query direta com índices |
| Gerencial (mensal) | ≤ 10.000 registros | ≤ 30 segundos | Dados pré-agregados + query |
| Executivo (anual) | ≤ 50.000 registros | ≤ 60 segundos | Pre-computed + query de detalhe |
| Financeiro (anual) | ≤ 20.000 lançamentos | ≤ 30 segundos | Sumários pré-calculados |
| Auditoria (histórico) | ≤ 500.000 registros | ≤ 120 segundos | Processamento assíncrono |

### 20.2 Execução Assíncrona para Relatórios Pesados

Relatórios com tempo estimado > 30 segundos são executados de forma assíncrona:

```
FLUXO DE RELATÓRIO ASSÍNCRONO

1. Usuário solicita relatório pesado
2. Sistema aceita a solicitação: "Seu relatório está sendo gerado."
3. Job adicionado à fila de processamento
4. Usuário recebe notificação in-app ao concluir:
   "Relatório {nome} está pronto para download."
5. Arquivo disponível na seção "Meus Relatórios" por 30 dias
6. E-mail de notificação enviado com link de download (se configurado)
```

### 20.3 Limites de Exportação

| Formato | Limite de Registros | Comportamento se Exceder |
|:-------:|:-------------------:|:------------------------:|
| PDF | 10.000 linhas | Gera múltiplos arquivos ou quebra em páginas |
| Excel | 1.000.000 linhas | Alerta ao usuário; execução assíncrona obrigatória |
| CSV | Sem limite (streaming) | Geração em streaming para evitar timeout |

### 20.4 Cache de Relatórios

| Tipo | Cache | TTL |
|:----:|:-----:|:---:|
| Relatórios executivos pré-calculados | Redis | 5 minutos |
| Relatórios agendados já gerados | Storage | Até download ou 30 dias |
| Dados agregados mensais | Tabelas analytics | Até próxima agregação mensal |

---

## 21. Regras de Negócio

---

**RPT-001** — Todo relatório deve respeitar permissões RBAC
Antes de executar qualquer relatório, o sistema verifica se o usuário tem permissão para o relatório solicitado e para o escopo de dados (próprios chamados, grupo, todos). Violação retorna 403.

---

**RPT-002** — Todo relatório exportado deve ser auditado
Toda exportação (PDF, Excel, CSV) gera registro em `shared.audit_log` com `action = REPORT_EXPORTED`, incluindo: usuário, timestamp, relatório, filtros e tamanho do arquivo.

---

**RPT-003** — Todo relatório financeiro deve respeitar centros de custo
Relatórios financeiros nunca exibem dados de todos os centros de custo para usuários sem permissão global. O escopo é filtrado pelo CC atribuído ao perfil do solicitante.

---

**RPT-004** — Todo relatório de compliance deve exibir evidências vinculadas
Relatórios de apontamentos de compliance sempre incluem coluna indicando se existem evidências aprovadas vinculadas ao apontamento (S/N + quantidade).

---

**RPT-005** — Todo relatório de SLA deve utilizar os cálculos oficiais do sistema
Os cálculos de SLA em relatórios (% cumprimento, tempo de resposta, tempo de resolução) devem usar os mesmos algoritmos e tabelas utilizados pelo `SlaMonitoringJob`. Nenhum cálculo alternativo é aceito.

---

**RPT-006** — Relatório de auditoria para usuários externos requer aprovação do IT_MANAGER
O `CMP-RPT-011` (Pacote de Evidências) só pode ser gerado após aprovação formal do IT_MANAGER. A aprovação fica registrada no relatório e no audit_log.

---

**RPT-007** — Agendamento só pode ser criado por IT_SPECIALIST+
Usuários com papel IT_TECHNICIAN podem executar relatórios manualmente mas não podem criar agendamentos automáticos.

---

**RPT-008** — Agendamento criado por usuário desligado é desativado automaticamente
Ao desprovisionar usuário, seus agendamentos de relatórios são desativados automaticamente. IT_MANAGER notificado para reassinar os agendamentos necessários.

---

**RPT-009** — Código do relatório único e imutável
Cada relatório tem um código único (INC-RPT-001, FIN-RPT-009, etc.) imutável e usado em logs de auditoria para identificação inequívoca.

---

**RPT-010** — Relatórios de incidentes em atraso gerados diariamente às 07h00
Os relatórios `INC-RPT-001` (Incidentes Abertos) e `INC-RPT-009` (SLA Violado) são gerados automaticamente todo dia às 07h00 e enviados ao IT_MANAGER e IT_SPECIALIST configurados.

---

**RPT-011** — Relatório financeiro mensal gerado no primeiro dia útil do mês
Os relatórios FIN-RPT-001 a FIN-RPT-004 são gerados automaticamente no primeiro dia útil de cada mês e enviados ao FINANCIAL_ANALYST e ao IT_MANAGER.

---

**RPT-012** — Período padrão dos relatórios: mês atual
Ao executar um relatório manualmente sem especificar período, o sistema usa o mês corrente como padrão (do dia 1 até hoje).

---

**RPT-013** — Relatórios com dados sensíveis requerem autenticação step-up
Relatórios de identidades com dados pessoais completos (IAM-RPT-001) e relatórios de auditoria de acessos (IAM-RPT-007) requerem re-autenticação MFA do solicitante.

---

**RPT-014** — Resultado vazio exibe mensagem explícita, não tabela em branco
Relatório sem registros no período/filtro exibe mensagem: "Nenhum registro encontrado para os filtros aplicados." Não gera arquivo vazio.

---

**RPT-015** — Exportação Excel: formatação numérica conforme locale pt-BR
Valores monetários em Excel são formatados como números (não texto) com 2 casas decimais e separador de milhar para compatibilidade com Excel em pt-BR.

---

**RPT-016** — Exportação CSV: encoding UTF-8 com BOM
Arquivos CSV são exportados em UTF-8 com BOM para garantir compatibilidade com Excel ao abrir diretamente.

---

**RPT-017** — Filtro de período obrigatório em todos os relatórios
Nenhum relatório pode ser executado sem período definido. Sem período selecionado, o sistema aplica o padrão (mês corrente) antes de executar.

---

**RPT-018** — Relatórios de grande volume executados assincronamente
Relatórios com volume estimado superior a 10.000 registros são automaticamente roteados para execução assíncrona, com notificação ao usuário quando prontos.

---

**RPT-019** — Arquivos gerados retidos por 30 dias
Arquivos de relatórios (PDF, Excel, CSV) ficam disponíveis para download por 30 dias após a geração. Após esse prazo, são excluídos automaticamente do storage.

---

**RPT-020** — Relatório de SLA: pausas computadas corretamente
Cálculos de SLA em relatórios incluem desconto de pausas (PENDING_USER, manutenção, feriados) conforme configuração da política de SLA aplicada ao chamado.

---

**RPT-021** — Dados de relatório filtrados por tenant via RLS
Assim como em dashboards, todos os dados de relatórios são filtrados por `tenant_id` via RLS. Nenhum dado cross-tenant é retornado independentemente do papel.

---

**RPT-022** — Relatório de compliance com evidências: hash SHA-256 visível
No `CMP-RPT-011`, cada evidência listada inclui o hash SHA-256 para verificação de integridade pelo auditor externo.

---

**RPT-023** — Agendamento com destinatário externo requer validação de domínio
Para enviar relatório automaticamente para e-mail externo (fora do domínio corporativo), o IT_MANAGER deve validar explicitamente o endereço. Bloqueado por padrão.

---

**RPT-024** — Relatório executivo: dados de tendência histórica inclusos
Relatórios executivos incluem seção de comparativo com período anterior (mês/trimestre anterior equivalente) para contextualizar os números atuais.

---

**RPT-025** — Ordenação padrão padronizada por categoria
Relatórios operacionais: ordenados por urgência (CRITICAL → atrasados → mais antigos). Relatórios gerenciais: por volume decrescente. Relatórios financeiros: por valor decrescente.

---

**RPT-026** — Relatório de TCO considera todos os custos vinculados ao ativo
O `AST-RPT-011` (TCO por Ativo) inclui: valor de aquisição + todas as manutenções + contratos de suporte vinculados + licenças do SO vinculadas ao hardware.

---

**RPT-027** — Relatório de KEDB atualizado automaticamente ao publicar workaround
O `KB-RPT-008` (KEDB Status) é regenerado automaticamente quando um novo workaround é publicado ou quando um problema KNOWN_ERROR é marcado como RESOLVED.

---

**RPT-028** — Relatório de Portfólio de Projetos inclui projetos de todos os status
O `PRJ-RPT-001` inclui projetos em todos os status (exceto CANCELLED, a menos que o filtro os inclua), incluindo projetos em IDEATION e ON_HOLD.

---

**RPT-029** — Relatório Orçado vs. Realizado calcula variância percentual corretamente
A variância no `FIN-RPT-009` é calculada como `(Realizado − Orçado) / Orçado × 100`. Valores positivos indicam estouro; negativos indicam saldo disponível.

---

**RPT-030** — Envio de relatório por e-mail: máximo 10 destinatários por agendamento
Agendamentos com mais de 10 destinatários de e-mail são bloqueados. Para distribuição ampla, o relatório deve ser compartilhado internamente ou disponibilizado via link.

---

**RPT-031** — Relatório de apontamentos vencidos inclui todos os status exceto CONCLUDED
O `CMP-RPT-002` lista apontamentos com `due_date < hoje` e `status ≠ CONCLUDED`, incluindo apontamentos em NEW, IN_ANALYSIS, IN_PROGRESS, PENDING_EVIDENCE e IN_VALIDATION.

---

**RPT-032** — Relatório de identidades: dados de usuários inativos com indicação clara
`IAM-RPT-001` pode incluir usuários inativos no período (ex.: desligados) se o filtro de status incluir INACTIVE. Estes são marcados com badge "INATIVO" para distinção clara.

---

**RPT-033** — Relatório de deflexões de KB: apenas deflexões confirmadas
`KB-RPT-004` conta apenas deflexões onde o usuário clicou explicitamente em "Isso resolveu meu problema". Consultas sem clique não entram no cálculo.

---

**RPT-034** — Relatórios de auditoria disponíveis apenas com papel AUDITOR ou IT_MANAGER+
Relatórios de trilha de auditoria (`shared.audit_log`) são acessíveis apenas para usuários com papel AUDITOR, COMPLIANCE_OFFICER ou IT_MANAGER+.

---

**RPT-035** — Relatório semanal de portfólio de projetos enviado às segundas-feiras às 07h00
O `PRJ-RPT-001` é gerado e enviado automaticamente todo domingo às 23h00 para estar disponível na segunda às 07h00 para IT_MANAGER e PROJECT_MANAGER.

---

**RPT-036** — Relatório de avaliação de fornecedores inclui tendência de avaliação
O `PRC-RPT-009` exibe além da avaliação atual, a tendência (▲ Melhorou / ▼ Piorou / → Estável) comparando com o período anterior.

---

**RPT-037** — Relatório de Compras Abertas gerado diariamente às 07h00
O `PRC-RPT-001` é gerado automaticamente todo dia às 07h00 e enviado ao IT_MANAGER e ao Analista de Compras configurados.

---

**RPT-038** — Relatório de Saving: valor negativo indica estouro do orçamento de compra
No `PRC-RPT-006`, valor de saving negativo (valor real > estimado) é destacado em vermelho como alerta de estouro.

---

**RPT-039** — Relatório de sincronização Google Workspace inclui divergências por campo
`INT-RPT-002` detalha, para cada sincronização, quais campos foram atualizados e os valores anterior/novo, não apenas o total de registros processados.

---

**RPT-040** — Relatório de SLA por analista: visível apenas para IT_SPECIALIST+
Dados individuais de performance de analistas (SLA por analista, CSAT por analista) são visíveis apenas para IT_SPECIALIST e superiores para proteger privacidade.

---

**RPT-041** — Relatório executivo gerado em PDF automaticamente no 1º dia útil do mês
O `EXE-RPT-001` (Saúde da Operação) é gerado automaticamente no 1º dia útil de cada mês e enviado ao IT_MANAGER e EXECUTIVE configurados.

---

**RPT-042** — Relatório financeiro inclui NF vinculada como referência
Relatórios OPEX e CAPEX incluem o número da nota fiscal de cada lançamento para rastreabilidade fiscal.

---

**RPT-043** — Relatório de riscos: ordenado por nível de risco decrescente
O `CMP-RPT-008` (Inventário de Riscos) é ordenado por nível de risco calculado (CRITICAL → HIGH → MEDIUM → LOW) para priorização visual imediata.

---

**RPT-044** — Relatório de garantias vencendo: janela configurável pelo usuário
O usuário pode configurar a janela de antecedência do `AST-RPT-006` (30, 60 ou 90 dias) sem alterar o agendamento. Padrão: 90 dias.

---

**RPT-045** — Relatórios de incidentes: FCR calculado apenas para incidentes fechados
A taxa de resolução no primeiro contato (FCR) é calculada apenas sobre incidentes com status CLOSED no período, nunca sobre abertos.

---

**RPT-046** — Relatório de backlog: inclui tendência de crescimento ou redução
O `EXE-RPT-003` (Backlog e Capacidade) inclui coluna de tendência semanal do backlog (crescendo ou reduzindo) para antecipação de problemas de capacidade.

---

**RPT-047** — Relatório de auditoria: ações sensíveis sempre incluídas sem filtro
Relatórios de audit_log para AUDITOR nunca omitem ações críticas (LOGIN_FAILED, REPORT_EXPORTED, USER_SUSPENDED, ROLE_ASSIGNED) independente de filtros aplicados.

---

**RPT-048** — Relatório de compliance: apontamentos reabertos com flag de reincidência
No `CMP-RPT-001`, apontamentos com `recurrence = true` têm badge "Reincidente" para identificação imediata pelo Compliance Officer.

---

**RPT-049** — Histórico de execuções de relatório disponível por 1 ano
O histórico de execuções (quem gerou, quando, filtros, quantidade de registros) é preservado por 1 ano no banco de dados para fins de auditoria.

---

**RPT-050** — Relatório executivo: benchmark com período anterior incluso automaticamente
Relatórios executivos calculam automaticamente a variação de cada indicador em relação ao período anterior equivalente, exibindo delta percentual e seta de direção.

---

**RPT-051** — Relatórios de compras sem NF registrada listados em relatório de pendências
Lançamentos CAPEX sem número de NF vinculado aparecem em relatório de pendências financeiras gerado mensalmente para o FINANCIAL_ANALYST.

---

**RPT-052** — Relatório de MTBF: calculado apenas para serviços com ≥ 2 incidentes no período
Para serviços com apenas 1 incidente no período, o campo MTBF exibe "N/A — incidentes insuficientes" ao invés de um valor potencialmente enganoso.

---

**RPT-053** — Relatório de portfólio: projetos estratégicos sinalizados com ícone especial
No `PRJ-RPT-001`, projetos com `strategic = true` têm ícone de destaque para diferenciação visual imediata pela Diretoria.

---

**RPT-054** — Relatório de custo por serviço considera rateio proporcional
No `FIN-RPT-007`, custos de infraestrutura compartilhada são rateados proporcionalmente entre os serviços que utilizam o recurso, conforme configuração do rateio no módulo financeiro.

---

**RPT-055** — Relatório de avaliação de fornecedores: notas por critério discriminadas
O `PRC-RPT-009` mostra a nota geral e as notas individuais por critério (prazo, qualidade, atendimento) para análise detalhada.

---

**RPT-056** — Relatório de conformidade de cotações disponível apenas para IT_MANAGER+
O `PRC-RPT-007` (Conformidade de Cotações) é acessível apenas para IT_MANAGER+ e COMPLIANCE_OFFICER por conter dados sensíveis do processo de compras.

---

**RPT-057** — Relatório de SLA violado inclui análise de causa raiz quando disponível
Para incidentes com `breach_reason` preenchido, o `SLA-RPT-005` inclui esta informação para apoiar a análise de melhoria do processo.

---

**RPT-058** — Relatório de onboardings e offboardings inclui tempo de cada etapa do ciclo
O `IAM-RPT-005` inclui, para cada offboarding, o tempo de cada etapa obrigatória (sessões revogadas → Google suspenso → papéis revogados → inativado) para verificação de conformidade com o SLA de 2 horas.

---

**RPT-059** — Relatório de custos de compliance inclui custo por apontamento médio
O `FIN-RPT-008` calcula o custo médio por apontamento tratado no período, dividindo o custo total de compliance pelo número de apontamentos CONCLUDED.

---

**RPT-060** — Falha em agendamento registrada e criador notificado após 3 tentativas
Se agendamento falhar 3 vezes consecutivas (erro de geração), o criador do agendamento recebe notificação e o agendamento é desativado automaticamente até revisão manual.

---

**RPT-061** — Relatório de indicadores estratégicos requer dados de receita da empresa
O `EXE-RPT-007` para calcular "Custo de TI / Receita" requer que o IT_MANAGER informe a receita da empresa nas configurações do módulo. Sem este dado, o indicador exibe "N/A".

---

**RPT-062** — Relatório de KB por cobertura de serviço lista serviços SEM artigos vinculados
O `KB-RPT-007` inclui explicitamente os serviços do catálogo que não possuem nenhum artigo KB publicado vinculado, para identificar lacunas de documentação.

---

**RPT-063** — Relatório de incidentes críticos inclui impacto estimado de usuários afetados
O `INC-RPT-003` inclui, quando preenchido, o campo `impact_scope` (quantidade de usuários impactados) para priorização do relatório executivo.

---

**RPT-064** — Relatório orçado vs. realizado disponível por CC individual
O `FIN-RPT-009` pode ser filtrado para exibir apenas um CC específico, permitindo que gestores de área visualizem o próprio orçamento sem ver dados de outros centros.

---

**RPT-065** — Relatório de artigos KB inclui taxa de atualização
O `KB-RPT-001` inclui coluna "Dias desde última atualização" para identificar artigos mais antigos que precisam de revisão.

---

**RPT-066** — Relatório de projetos atrasados inclui plano de recuperação quando disponível
O `PRJ-RPT-002` inclui, para cada projeto atrasado, o plano de recuperação registrado pelo PM (se existir) para contextualizar a situação.

---

**RPT-067** — Relatório de SLA por período exibe meta como linha de referência no gráfico
O gráfico incluso no PDF do `SLA-RPT-004` exibe a meta de SLA configurada como linha tracejada horizontal para comparação visual com o valor realizado.

---

**RPT-068** — Relatório de garantias vencidas gera alerta automático ao IT_MANAGER
O `AST-RPT-006`, ao ser executado mensalmente, verifica garantias já vencidas (além das vencendo) e gera alerta adicional ao IT_MANAGER para cada garantia expirada sem tratativa.

---

**RPT-069** — Relatório de Onboarding: inclui comprovante de aceite de políticas
O `IAM-RPT-005`, para novos colaboradores, inclui indicação de quando o aceite das políticas corporativas foi registrado durante o processo de onboarding.

---

**RPT-070** — Relatório de KEDB disponível para IT_TECHNICIAN como referência técnica
O `PRB-RPT-002` (KEDB) é acessível para leitura por IT_TECHNICIAN como ferramenta de consulta técnica durante atendimentos, sem dados financeiros ou confidenciais.

---

**RPT-071** — Relatório de compliance inclui coluna de prazo de resolução regulatória
Para apontamentos vinculados a normas com prazo regulatório específico (LGPD 72h, BACEN 1 dia útil), o relatório exibe o prazo regulatório além do prazo interno do apontamento.

---

**RPT-072** — Relatório de custos por projeto inclui curva S no PDF
O `FIN-RPT-006` inclui gráfico de curva S (custo acumulado planejado vs. realizado) no relatório PDF para visualização da evolução financeira do projeto.

---

**RPT-073** — Relatório de integração GLPI inclui contagem de divergências por campo
O `INT-RPT-006` detalha as divergências detectadas entre GLPI e SGTI por campo (nome, serial, localização) para facilitar a priorização das correções.

---

**RPT-074** — Relatório de satisfação do usuário (CSAT) inclui comentários opcionais
O `REQ-RPT-007` inclui, além da nota numérica de satisfação, os comentários de texto deixados pelos usuários (quando disponíveis) para análise qualitativa.

---

**RPT-075** — Relatório de lições aprendidas inclui link para artigo KB quando disponível
O `PRJ-RPT-007` inclui link direto para o artigo KB gerado a partir de cada lição aprendida, quando o artigo foi publicado.

---

**RPT-076** — Relatório de capacidade vs. demanda inclui projeção de 3 meses
O `PRJ-RPT-008` inclui projeção de demanda para os próximos 3 meses baseada na média histórica dos últimos 6 meses, para planejamento de contratação ou redistribuição de recursos.

---

**RPT-077** — Relatório de compliance score histórico inclui causa de variação
O `CMP-RPT-009`, ao comparar scores de auditorias consecutivas, inclui os apontamentos novos ou concluídos que explicam a variação positiva ou negativa no score.

---

**RPT-078** — Relatório de contratos vencendo inclui valor de renovação estimado
O `AST-RPT-007` inclui, quando disponível, o valor estimado de renovação do contrato para apoiar o planejamento orçamentário do FINANCIAL_ANALYST.

---

**RPT-079** — Relatório de incidentes por área inclui comparativo com SLA da área
O `INC-RPT-007` inclui o SLA médio configurado para os serviços mais utilizados pela área, permitindo comparação entre o desempenho esperado e o realizado.

---

**RPT-080** — Todos os relatórios do SGTI têm identificador único rastreável na URL
A URL de cada relatório gerado inclui um token único (`/reports/download/{execution_id}`) que pode ser auditado. Tokens expiram em 1 hora para downloads diretos.

---

## 22. Critérios de Aceitação

### 22.1 Filtros e Exportação

- [ ] **CA-01:** Filtro de período altera todos os dados do relatório ao ser aplicado.
- [ ] **CA-02:** Exportação PDF inclui cabeçalho com filtros, período, data/hora e usuário.
- [ ] **CA-03:** Exportação Excel inclui dados formatados com separador de milhar (locale pt-BR).
- [ ] **CA-04:** Exportação CSV em UTF-8 com BOM, abre corretamente no Excel pt-BR.
- [ ] **CA-05:** Relatório sem dados exibe mensagem explicativa, não tabela vazia.
- [ ] **CA-06:** Total de registros exibido no rodapé de todos os relatórios.

### 22.2 Agendamento e Distribuição

- [ ] **CA-07:** Agendamento diário às 07h00 executado corretamente com filtros configurados.
- [ ] **CA-08:** Agendamento semanal e mensal executados no horário correto.
- [ ] **CA-09:** E-mail de distribuição enviado com relatório em anexo ao concluir agendamento.
- [ ] **CA-10:** Falha em agendamento gera 3 retries; após o 3º, criador notificado e agendamento desativado.
- [ ] **CA-11:** Agendamento de usuário desligado desativado automaticamente com notificação ao IT_MANAGER.
- [ ] **CA-12:** Arquivo gerado disponível para download por 30 dias.

### 22.3 Segurança e RBAC

- [ ] **CA-13:** IT_TECHNICIAN sem acesso ao relatório recebe 403 com mensagem adequada.
- [ ] **CA-14:** IT_TECHNICIAN vê apenas seus próprios registros em relatórios operacionais.
- [ ] **CA-15:** Dados financeiros invisíveis para IT_TECHNICIAN e END_USER.
- [ ] **CA-16:** Acesso de auditor externo restrito ao `CMP-RPT-011` da auditoria vinculada.
- [ ] **CA-17:** Dados filtrados por `tenant_id` via RLS sem vazamento cross-tenant.

### 22.4 Auditoria

- [ ] **CA-18:** Toda execução de relatório registrada em `shared.audit_log` com filtros e usuário.
- [ ] **CA-19:** Exportação e envio por e-mail registrados em `audit_log` separadamente.
- [ ] **CA-20:** Histórico de execuções preservado por 1 ano.
- [ ] **CA-21:** Relatório CMP-RPT-011 só gerado após aprovação IT_MANAGER registrada em audit_log.

### 22.5 Relatórios Específicos

- [ ] **CA-22:** `INC-RPT-001` (Incidentes Abertos) gerado diariamente às 07h00 com ordenação por urgência.
- [ ] **CA-23:** `FIN-RPT-009` (Orçado vs. Realizado) calcula variância percentual corretamente.
- [ ] **CA-24:** `CMP-RPT-002` (Apontamentos Vencidos) lista apenas status ≠ CONCLUDED com due_date no passado.
- [ ] **CA-25:** `SLA-RPT-005` utiliza cálculos do `SlaMonitoringJob` (incluindo pausas).
- [ ] **CA-26:** `AST-RPT-008` (Depreciação) gerado no 1º dia útil do mês com valores corretos.
- [ ] **CA-27:** `EXE-RPT-001` (Saúde da Operação) gerado no 1º dia útil do mês e enviado ao IT_MANAGER.
- [ ] **CA-28:** `CMP-RPT-011` inclui hash SHA-256 de cada evidência.
- [ ] **CA-29:** `KB-RPT-004` conta deflexões apenas com clique explícito do usuário.

### 22.6 Performance

- [ ] **CA-30:** Relatórios operacionais (≤ 500 registros) gerados em ≤ 5 segundos.
- [ ] **CA-31:** Relatórios gerenciais (≤ 10.000 registros) gerados em ≤ 30 segundos.
- [ ] **CA-32:** Relatórios pesados (> 10.000 registros) executados assincronamente com notificação ao concluir.
- [ ] **CA-33:** Skeleton loader exibido durante geração síncrona de relatório.
- [ ] **CA-34:** URL de download com token único expira em 1 hora.
- [ ] **CA-35:** Exportação CSV gerada em streaming para relatórios de grande volume sem timeout.

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação com 22 seções, 80 regras RPT e 35 critérios de aceitação |

---

> **Documentos relacionados:**
> [`60_DASHBOARDS.md`](./60_DASHBOARDS.md) — Dashboards (visão ao vivo; relatórios são snapshot)
> [`40_INCIDENT_MANAGEMENT.md`](./40_INCIDENT_MANAGEMENT.md) — Fonte de dados para relatórios de incidentes
> [`46_FINANCIAL_MANAGEMENT.md`](./46_FINANCIAL_MANAGEMENT.md) — Fonte de dados para relatórios financeiros
> [`45_COMPLIANCE.md`](./45_COMPLIANCE.md) — Fonte de dados para relatórios de compliance
