# SGTI — Sistema de Gestão de Tecnologia da Informação
## Módulo de Gestão Financeira de TI — Documentação Funcional

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [24_BUSINESS_RULES.md](./24_BUSINESS_RULES.md) · [43_ASSET_MANAGEMENT.md](./43_ASSET_MANAGEMENT.md) · [41_REQUEST_MANAGEMENT.md](./41_REQUEST_MANAGEMENT.md) · [45_COMPLIANCE.md](./45_COMPLIANCE.md) · [20_DATABASE.md](./20_DATABASE.md)

---

## Sobre este Documento

Este documento define a **especificação funcional completa do Módulo de Gestão Financeira de TI do SGTI**. Cobre conceito, estrutura orçamentária, controle de OPEX e CAPEX, gestão de contratos e fornecedores, custos por ativo/projeto/serviço/compliance, depreciação, integrações, dashboards, regras de negócio e critérios de aceitação.

**Escopo exclusivo:** documentação funcional e de processo. Nenhum código, SQL ou especificação de API é gerado neste documento.

---

## Sumário

1. [Conceito de Gestão Financeira de TI](#1-conceito-de-gestão-financeira-de-ti)
2. [Objetivos do Módulo](#2-objetivos-do-módulo)
3. [Papéis e Responsabilidades](#3-papéis-e-responsabilidades)
4. [Estrutura Orçamentária](#4-estrutura-orçamentária)
5. [OPEX — Despesas Operacionais](#5-opex--despesas-operacionais)
6. [CAPEX — Investimentos de Capital](#6-capex--investimentos-de-capital)
7. [Centros de Custo](#7-centros-de-custo)
8. [Classificação Financeira Obrigatória](#8-classificação-financeira-obrigatória)
9. [Ciclo Orçamentário](#9-ciclo-orçamentário)
10. [Custos por Ativo](#10-custos-por-ativo)
11. [Custos por Projeto](#11-custos-por-projeto)
12. [Custos por Serviço](#12-custos-por-serviço)
13. [Custos de Compliance](#13-custos-de-compliance)
14. [Gestão de Contratos](#14-gestão-de-contratos)
15. [Gestão de Fornecedores](#15-gestão-de-fornecedores)
16. [Integração com Ativos](#16-integração-com-ativos)
17. [Integração com Requisições](#17-integração-com-requisições)
18. [Integração com Compras](#18-integração-com-compras)
19. [Integração com Projetos](#19-integração-com-projetos)
20. [Integração com Compliance](#20-integração-com-compliance)
21. [Depreciação de Ativos](#21-depreciação-de-ativos)
22. [Dashboards Operacionais](#22-dashboards-operacionais)
23. [Dashboards Executivos](#23-dashboards-executivos)
24. [Relatórios](#24-relatórios)
25. [Auditoria e Rastreabilidade](#25-auditoria-e-rastreabilidade)
26. [Compliance Financeiro](#26-compliance-financeiro)
27. [Regras de Negócio](#27-regras-de-negócio)
28. [Critérios de Aceitação](#28-critérios-de-aceitação)

---

## 1. Conceito de Gestão Financeira de TI

### 1.1 Definição

**Gestão Financeira de TI** é o conjunto de processos, controles e práticas que garantem que os recursos financeiros alocados à Tecnologia da Informação sejam planejados, controlados e otimizados, fornecendo transparência sobre custos, suportando decisões de investimento e demonstrando o valor gerado pela TI para o negócio.

### 1.2 Alinhamento com ITIL v4

No vocabulário ITIL v4, a Gestão Financeira de Serviços é uma prática que visa:

| Objetivo ITIL v4 | Implementação no SGTI |
|:----------------:|----------------------|
| **Orçar recursos** | Ciclo de orçamento anual com previsto, aprovado e realizado por centro de custo |
| **Contabilizar custos** | Registro de OPEX e CAPEX com rastreabilidade por origem |
| **Cobrar pelos serviços** | Rateio de custos por área, departamento e serviço consumido |
| **Demonstrar valor** | Dashboard executivo com ROI estimado e comparativo orçado vs. realizado |

### 1.3 Diferença entre OPEX e CAPEX no Contexto de TI

| Aspecto | OPEX | CAPEX |
|---------|:----:|:-----:|
| **Natureza** | Despesa operacional recorrente | Investimento em ativo de longo prazo |
| **Tratamento contábil** | Lançado diretamente no resultado do período | Ativado no balanço e depreciado ao longo da vida útil |
| **Impacto no fluxo de caixa** | Imediato e recorrente | Pontual (na aquisição) + depreciação anual |
| **Exemplos de TI** | Licenças SaaS, internet, suporte | Notebooks, servidores, infraestrutura |
| **Gestão no SGTI** | `finance.OpexExpense` | `finance.CapexInvestment` |

### 1.4 Princípios da Gestão Financeira de TI no SGTI

| Princípio | Aplicação |
|-----------|-----------|
| **Transparência** | Todo custo registrado e visível para as áreas responsáveis |
| **Rastreabilidade** | Cada lançamento vinculado a origem (ativo, projeto, contrato, requisição) |
| **Segregação de Funções** | Quem registra não pode aprovar o mesmo lançamento |
| **Responsabilidade** | Todo custo atribuído a centro de custo, projeto ou serviço |
| **Otimização contínua** | Licenças subutilizadas e contratos desnecessários identificados automaticamente |

---

## 2. Objetivos do Módulo

### 2.1 Objetivo Primário

Prover visibilidade, controle e otimização sobre todos os gastos de TI da organização — desde o planejamento orçamentário até a análise de custos realizados — suportando decisões estratégicas de investimento em tecnologia com dados confiáveis e atualizados.

### 2.2 Objetivos Específicos

| # | Objetivo | Indicador | Meta |
|---|----------|-----------|:----:|
| 1 | Controle total de OPEX e CAPEX | % lançamentos com classificação financeira | 100% |
| 2 | Orçamento monitorado em tempo real | Defasagem entre realizado e orçado disponível em < 5 minutos | Tempo real |
| 3 | Rastreabilidade de todos os custos | % lançamentos vinculados a origem (ativo, projeto, requisição, contrato) | 100% |
| 4 | Controle de contratos vencendo | % contratos com alerta configurado | 100% |
| 5 | Rateio mensal de custos por área | Relatório de rateio disponível no 1º dia útil do mês | 100% |
| 6 | Licenças subutilizadas identificadas | Relatório mensal de subutilização | 100% |
| 7 | Depreciação calculada automaticamente | % ativos CAPEX com depreciação configurada | 100% |
| 8 | Custo de compliance rastreável | % custos de auditoria vinculados a auditoria correspondente | 100% |

### 2.3 Limites do Módulo

**O módulo Financeiro de TI:**
- Controla gastos **internos de TI** — não é o sistema financeiro corporativo.
- Integra com a contabilidade corporativa via exportação de lançamentos.
- Não emite notas fiscais nem processa pagamentos (responsabilidade do financeiro corporativo).

---

## 3. Papéis e Responsabilidades

### 3.1 Solicitante (END_USER / qualquer perfil)

**No contexto financeiro:**
- Informar o centro de custo e justificativa em requisições com impacto financeiro.
- Não visualiza dados financeiros de outros usuários ou áreas.

---

### 3.2 Analista de TI (IT_TECHNICIAN)

**Responsabilidades:**
- Registrar lançamentos de custo vinculados a ativos, requisições e manutenções.
- Informar dados de nota fiscal no recebimento de compras.
- Verificar classificação OPEX/CAPEX antes de submeter lançamento.

**Limitações:** Não pode aprovar lançamentos. Valor máximo registrável sem alerta: R$500,00.

---

### 3.3 Gestor de TI (IT_MANAGER)

**Responsabilidades:**
- Elaborar e aprovar o orçamento anual de TI.
- Aprovar lançamentos acima dos limites de alçada do Coordenador.
- Monitorar o orçado vs. realizado no dashboard executivo.
- Autorizar estouro de orçamento com justificativa formal.
- Revisar contratos próximos do vencimento e decidir renovação.
- Aprovar cancelamento de licenças subutilizadas.
- Comunicar à diretoria os resultados financeiros de TI.

**Alçada de aprovação:**
- Lançamentos de R$1.000,01 a R$10.000,00: aprovação do IT_MANAGER.
- Lançamentos acima de R$10.000,00: aprovação do IT_MANAGER com step-up auth.
- Lançamentos acima de R$50.000,00: IT_MANAGER + Diretoria.

---

### 3.4 Analista Financeiro (FINANCIAL_ANALYST)

**Perfil:** Responsável pelo controle financeiro da área de TI.

**Responsabilidades:**
- Registrar e validar lançamentos de OPEX e CAPEX.
- Verificar disponibilidade orçamentária antes de aprovar.
- Executar o rateio mensal de custos por centro de custo.
- Gerar relatórios financeiros para prestação de contas internas e externas.
- Controlar depreciação dos ativos CAPEX.
- Monitorar contratos com vencimento próximo.
- Identificar oportunidades de redução de custos.

**Segregação (SoD):** Não pode aprovar lançamento que ele mesmo registrou.

---

### 3.5 Gestor de Compras (papel funcional)

**Responsabilidades no contexto financeiro:**
- Emitir pedidos de compra vinculados a requisições e orçamentos aprovados.
- Registrar recebimento de itens com dados fiscais (NF, valor real).
- Sinalizar divergências entre valor estimado e valor real da compra.

---

### 3.6 Analista de Compliance (COMPLIANCE_OFFICER)

**No contexto financeiro:**
- Visualizar custos de auditorias e adequações vinculados ao módulo de Compliance.
- Verificar segregação de funções em aprovações financeiras.
- Auditar lançamentos para fins de conformidade fiscal e regulatória.

---

### 3.7 Administrador (SUPER_ADMIN)

**Responsabilidades:**
- Configurar centros de custo, categorias de despesa e parâmetros de rateio.
- Gerenciar regras de depreciação por categoria de ativo.
- Executar operações privilegiadas de correção de lançamentos.
- Auditar o módulo com acesso completo ao audit_log.

---

## 4. Estrutura Orçamentária

### 4.1 Hierarquia do Orçamento

```
ESTRUTURA HIERÁRQUICA DO ORÇAMENTO DE TI

Exercício Fiscal (ano)
  └── Tipo (OPEX / CAPEX)
        └── Área / Unidade de Negócio
              └── Centro de Custo
                    ├── Categoria de Despesa
                    ├── Projeto (opcional)
                    └── Serviço (opcional)
```

### 4.2 Dimensões do Orçamento

| Dimensão | Descrição | Obrigatória |
|:--------:|-----------|:-----------:|
| **Exercício** | Ano fiscal (ex.: 2026) | Sim |
| **Tipo** | OPEX ou CAPEX | Sim |
| **Área** | Departamento ou unidade de negócio | Sim |
| **Centro de Custo** | Unidade contábil de alocação de custos | Sim |
| **Categoria de Despesa** | Tipo de custo (Licenças, Hardware, Serviços, etc.) | Sim |
| **Projeto** | Projeto específico ao qual o orçamento está vinculado | Não |
| **Serviço** | Serviço do catálogo que o custo suporta | Não |

### 4.3 Campos do Registro de Orçamento (Budget)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| **id** | UUID | Automático | Identificador único |
| **Exercício** | Inteiro | Sim | Ano fiscal (ex.: 2026) |
| **Tipo** | Enum | Sim | `OPEX` ou `CAPEX` |
| **Centro de Custo** | FK — CostCenter | Sim | Centro responsável |
| **Categoria** | FK — ExpenseCategory | Sim | Categoria de despesa |
| **Projeto** | FK — Project | Não | Projeto vinculado |
| **Descrição** | Texto | Sim | Descrição do orçamento |
| **Valor Previsto** | Decimal (15,2) | Sim | Valor inicial planejado |
| **Valor Aprovado** | Decimal (15,2) | Sim | Valor após aprovação formal |
| **Valor Realizado** | Decimal (15,2) | Automático | Soma dos lançamentos efetivados |
| **Valor Comprometido** | Decimal (15,2) | Automático | Lançamentos aprovados mas não pagos |
| **Saldo Disponível** | Decimal (15,2) | Calculado | Aprovado − Realizado − Comprometido |
| **% Utilizado** | Decimal (5,2) | Calculado | Realizado / Aprovado × 100 |
| **Status** | Enum | Sim | `DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `ACTIVE`, `CLOSED` |
| **Responsável** | FK — User | Sim | IT_MANAGER responsável |
| **Aprovado Por** | FK — User | Automático | Quem aprovou |
| **Aprovado Em** | DateTime | Automático | Timestamp da aprovação |

---

## 5. OPEX — Despesas Operacionais

### 5.1 Conceito

**OPEX (Operating Expenditure)** são despesas operacionais recorrentes necessárias para manter a operação de TI em funcionamento. São lançadas integralmente no resultado do período em que ocorrem.

No contexto de TI, OPEX representa todos os custos contínuos — aqueles que existem independentemente de aquisições de novos ativos.

### 5.2 Categorias de OPEX em TI

| Categoria | Descrição | Exemplos |
|-----------|-----------|---------|
| **Licenciamento de Software** | Licenças de uso de software por assinatura ou renovação anual | Microsoft 365, Adobe Creative Cloud, Slack, GitHub Enterprise |
| **SaaS (Software as a Service)** | Plataformas e ferramentas acessadas via nuvem | Salesforce, Jira, Zendesk, HubSpot, Google Workspace |
| **IaaS / PaaS (Cloud)** | Infraestrutura e plataforma como serviço | AWS EC2, Azure VMs, GCP Storage, RDS, Lambda |
| **Hospedagem e CDN** | Servidores dedicados, colocation, CDN, DNS | DigitalOcean, Cloudflare, registro de domínio |
| **Conectividade e Internet** | Links de internet, MPLS, SD-WAN, VoIP | Operadoras de telecom, links dedicados, PABX |
| **Telefonia Corporativa** | Planos de celular corporativo, ramais, conferências | Planos corporativos Vivo/Claro/TIM, Zoom Phone |
| **Suporte e Manutenção** | Contratos de suporte técnico com fabricantes e fornecedores | Dell Support, HPE Care Pack, suporte de software |
| **Serviços Gerenciados** | Serviços contínuos terceirizados | MDM gerenciado, NOC terceirizado, SOC as a Service |
| **Serviços de Segurança** | Antivírus, firewall gerenciado, pentest recorrente | Crowdstrike, Fortinet FWaaS, scan mensal |
| **Assinaturas de Ferramentas** | Ferramentas de produtividade e gestão | Figma, Trello, 1Password, Calendly |
| **Consultorias Recorrentes** | Horas de consultoria técnica recorrente | Consultoria de nuvem, assessoria jurídica TI |
| **Outros OPEX** | Despesas operacionais não classificadas acima | Treinamentos recorrentes, certificações anuais |

### 5.3 Campos do Lançamento OPEX (OpexExpense)

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **id** | UUID | Automático | Não | Identificador único |
| **Código** | String (sequencial) | Automático | Não | `OPX-YYYY-NNNNNN`. Imutável. |
| **Descrição** | Texto | Sim | Analista | Descrição da despesa |
| **Categoria** | FK — ExpenseCategory | Sim | Analista | Categoria de OPEX |
| **Fornecedor** | FK — Supplier | Não | Analista | Fornecedor do serviço |
| **Contrato** | FK — Contract | Não | Analista | Contrato de referência |
| **Centro de Custo** | FK — CostCenter | Sim | Analista | Centro responsável pela despesa |
| **Orçamento** | FK — Budget | Não | Analista | Orçamento OPEX de referência |
| **Projeto** | FK — Project | Não | Analista | Projeto que originou a despesa |
| **Serviço** | FK — ServiceCatalog | Não | Analista | Serviço do catálogo suportado |
| **Ativo** | FK — Asset | Não | Analista | Ativo relacionado (ex.: licença associada ao notebook) |
| **Compliance** | FK — ComplianceFinding | Não | Analista | Apontamento de compliance relacionado |
| **Data de Competência** | Date | Sim | Analista | Mês/ano de competência da despesa |
| **Data de Pagamento** | Date | Não | FINANCIAL_ANALYST | Data efetiva de pagamento |
| **Valor** | Decimal (15,2) | Sim | Analista | Valor da despesa em R$ |
| **Moeda** | Enum | Sim | Analista | `BRL`, `USD`, `EUR`. Padrão: `BRL`. |
| **Valor em BRL** | Decimal (15,2) | Calculado | Não | Convertido automaticamente pela taxa do dia |
| **Número da NF / Fatura** | String | Condicional | Analista | Obrigatório para despesas > R$500,00 |
| **Arquivo NF** | FileReference | Condicional | Analista | Anexo da nota fiscal |
| **Status** | Enum | Sim | Conforme fluxo | `PENDING`, `APPROVED`, `REJECTED`, `PAID`, `CANCELLED` |
| **Registrado Por** | FK — User | Automático | Não | Quem criou o lançamento |
| **Aprovado Por** | FK — User | Automático | Não | `approved_by ≠ created_by` (SoD) |
| **Período de Recorrência** | Enum | Não | Analista | `ONE_TIME`, `MONTHLY`, `QUARTERLY`, `ANNUAL`. |
| **Próxima Competência** | Date | Calculado | Não | Para lançamentos recorrentes |
| **Observações** | Texto | Não | Analista | Notas adicionais |

### 5.4 Fluxo de Aprovação OPEX

```
FLUXO DE APROVAÇÃO POR VALOR

Lançamento registrado pelo Analista
  │
  ├── Valor ≤ R$500,00:
  │     Sem alerta de NF → aprovação automática se orçamento disponível
  │
  ├── R$500,01 a R$1.000,00:
  │     NF obrigatória → Coordenador aprova → Efetivado
  │
  ├── R$1.000,01 a R$10.000,00:
  │     NF obrigatória → IT_MANAGER aprova → Efetivado
  │
  └── > R$10.000,00:
        NF obrigatória → IT_MANAGER (step-up auth) → Efetivado

Em todos os casos: quem registra ≠ quem aprova (SoD)
```

---

## 6. CAPEX — Investimentos de Capital

### 6.1 Conceito

**CAPEX (Capital Expenditure)** são investimentos em ativos de longo prazo — equipamentos, infraestrutura e sistemas — que geram benefícios por períodos superiores a 12 meses. São ativados no balanço patrimonial e depreciados ao longo da vida útil do ativo.

### 6.2 Categorias de CAPEX em TI

| Categoria | Vida Útil Típica | Exemplos |
|-----------|:----------------:|---------|
| **Computadores e Notebooks** | 3 anos | Dell XPS, MacBook Pro, workstations |
| **Servidores** | 5 anos | Dell PowerEdge, HPE ProLiant, servidores blade |
| **Storage** | 5 anos | NAS, SAN, unidades de backup empresarial |
| **Infraestrutura de Rede** | 7 anos | Switches core, firewalls enterprise, roteadores |
| **Access Points e Wi-Fi** | 5 anos | UniFi, Cisco Meraki, Aruba |
| **Equipamentos de Energia** | 10 anos | No-breaks, geradores, PDUs inteligentes |
| **Impressoras e Multifuncionais** | 5 anos | HP LaserJet Enterprise, Xerox |
| **Dispositivos de Videoconferência** | 4 anos | Cisco WebEx Boards, Logitech Rally |
| **Licenças Perpétuas** | Amortização | SQL Server Perpetual, Adobe CC Perpetual |
| **Desenvolvimento de Sistemas** | 5 anos | Sistemas customizados capitalizáveis |
| **Projetos de Implantação** | 3–5 anos | Implantação de ERP, migração de datacenter |

### 6.3 Campos do Lançamento CAPEX (CapexInvestment)

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **id** | UUID | Automático | Não | Identificador único |
| **Código** | String (sequencial) | Automático | Não | `CPX-YYYY-NNNNNN`. Imutável. |
| **Descrição** | Texto | Sim | Analista | Descrição do investimento |
| **Categoria** | FK — AssetCategory | Sim | Analista | Categoria do ativo adquirido |
| **Fornecedor** | FK — Supplier | Sim | Analista | Fornecedor do equipamento/sistema |
| **Pedido de Compra** | FK — PurchaseOrder | Não | Automático | PO que gerou este investimento |
| **Ativo** | FK — Asset | Condicional | Automático / Analista | Ativo no inventário criado com esta aquisição |
| **Centro de Custo** | FK — CostCenter | Sim | Analista | Centro que arca com o investimento |
| **Projeto** | FK — Project | Não | Analista | Projeto ao qual o investimento está vinculado |
| **Orçamento** | FK — Budget | Não | Analista | Orçamento CAPEX de referência |
| **Data de Aquisição** | Date | Sim | Analista | Data da compra ou contrato |
| **Data de Reconhecimento** | Date | Sim | FINANCIAL_ANALYST | Data de início da depreciação |
| **Valor Total** | Decimal (15,2) | Sim | Analista | Valor total do investimento em R$ |
| **Moeda Original** | Enum | Sim | Analista | `BRL`, `USD`, `EUR` |
| **Valor em BRL** | Decimal (15,2) | Calculado | Não | Conversão automática |
| **Número da NF** | String | Sim | Analista | Nota fiscal de aquisição |
| **Arquivo NF** | FileReference | Sim | Analista | Anexo da nota fiscal (sempre obrigatório) |
| **Vida Útil (meses)** | Inteiro | Sim | FINANCIAL_ANALYST | Prazo de depreciação em meses |
| **Método de Depreciação** | Enum | Sim | FINANCIAL_ANALYST | `STRAIGHT_LINE`, `DECLINING_BALANCE` |
| **Valor Residual** | Decimal (15,2) | Não | FINANCIAL_ANALYST | Valor estimado ao final da vida útil |
| **Depreciação Mensal** | Decimal (15,2) | Calculado | Não | (Valor − Valor Residual) / Vida Útil |
| **Depreciação Acumulada** | Decimal (15,2) | Calculado | Não | Soma das depreciações mensais |
| **Valor Atual (Contábil)** | Decimal (15,2) | Calculado | Não | Valor Total − Depreciação Acumulada |
| **Status** | Enum | Sim | Conforme fluxo | `PLANNED`, `APPROVED`, `ACTIVE`, `WRITTEN_OFF` |
| **Registrado Por** | FK — User | Automático | Não | Quem criou o lançamento |
| **Aprovado Por** | FK — User | Automático | Não | `approved_by ≠ created_by` (SoD) |

---

## 7. Centros de Custo

### 7.1 Conceito

Um **Centro de Custo** é uma unidade organizacional ou contábil à qual são atribuídos custos de TI para fins de controle, rateio e prestação de contas. Permite responder: "Quanto cada área está consumindo de TI?"

### 7.2 Campos do Centro de Custo

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **id** | UUID | Automático | Não | Identificador único |
| **Código** | String (50) | Sim | SUPER_ADMIN | Código único: `CC-TI-001`, `CC-FIN-001`. Único por tenant. |
| **Nome** | String (200) | Sim | SUPER_ADMIN | Nome descritivo: "Infraestrutura de TI", "Projetos de TI" |
| **Descrição** | Texto | Não | SUPER_ADMIN | Escopo do centro de custo |
| **Departamento** | FK — Department | Não | SUPER_ADMIN | Departamento ao qual o CC está vinculado |
| **Unidade de Negócio** | FK — BusinessUnit | Não | SUPER_ADMIN | BU responsável |
| **Responsável** | FK — User | Sim | SUPER_ADMIN | IT_MANAGER ou gestor da área |
| **Orçamento Anual OPEX** | Decimal (15,2) | Não | FINANCIAL_ANALYST | Total OPEX aprovado para o ano |
| **Orçamento Anual CAPEX** | Decimal (15,2) | Não | FINANCIAL_ANALYST | Total CAPEX aprovado para o ano |
| **Percentual de Rateio** | Decimal (5,2) | Não | SUPER_ADMIN | % de participação no rateio de custos compartilhados |
| **Base de Rateio** | Enum | Não | SUPER_ADMIN | `BY_USERS`, `BY_ASSETS`, `BY_TICKETS`, `MANUAL`, `EQUAL` |
| **is_active** | Boolean | Sim | SUPER_ADMIN | CCs inativos não recebem novos lançamentos |

### 7.3 Hierarquia de Centros de Custo

```
EXEMPLO DE HIERARQUIA DE CCs DE TI

CC-TI-TOTAL (consolidador)
  ├── CC-TI-INFRA: Infraestrutura e Servidores
  ├── CC-TI-SEGUR: Segurança da Informação
  ├── CC-TI-SISTM: Sistemas e Aplicações
  ├── CC-TI-SUPORT: Service Desk e Suporte
  ├── CC-TI-CLOUD: Serviços de Nuvem
  ├── CC-TI-PROJ: Projetos de TI
  └── CC-TI-COMPL: Compliance e Auditoria de TI
```

### 7.4 Rateio de Custos Compartilhados

Custos de TI que beneficiam múltiplas áreas são rateados mensalmente:

| Método de Rateio | Fórmula | Quando Usar |
|:----------------:|---------|:-----------:|
| **Por Usuários** | Custo × (usuários da área / total usuários) | Licenças por usuário, suporte geral |
| **Por Ativos** | Custo × (ativos da área / total ativos) | Infraestrutura, energia de datacenter |
| **Por Tickets** | Custo × (tickets da área / total tickets) | Service Desk, suporte técnico |
| **Manual** | Percentuais fixos definidos pelo gestor | Custos específicos com alocação conhecida |
| **Igual** | Custo / número de áreas | Custos de uso igualitário |

---

## 8. Classificação Financeira Obrigatória

### 8.1 Regra Fundamental

**Todo custo registrado no módulo Financeiro de TI deve obrigatoriamente ter classificação `OPEX` ou `CAPEX`.** Esta classificação determina o tratamento contábil, o impacto orçamentário e as aprovações necessárias.

A ausência de classificação financeira bloqueia o registro do lançamento com erro `MISSING_CLASSIFICATION`.

### 8.2 Tabela de Classificação por Tipo de Gasto

| Tipo de Gasto | Classificação | Justificativa |
|:-------------:|:-------------:|:--------------|
| Notebook, Desktop, Servidor | CAPEX | Vida útil > 1 ano; ativo imobilizável |
| Switch, Firewall, Access Point | CAPEX | Infraestrutura de rede com vida útil longa |
| Impressora, scanner | CAPEX | Ativo com vida útil > 1 ano |
| Mouse, teclado, headset | OPEX | Valor baixo; vida útil ≤ 3 anos |
| Licença de software perpétua | CAPEX | Ativo intangível; amortizável |
| Licença de software por assinatura | OPEX | Despesa recorrente; sem ativo |
| SaaS, cloud mensal | OPEX | Serviço; não gera ativo |
| Internet, telefonia | OPEX | Serviço recorrente |
| Suporte e manutenção de hardware | OPEX | Despesa operacional |
| Consultoria de implantação de sistema | CAPEX | Pode ser capitalizado no custo do sistema |
| Treinamento de equipe | OPEX | Despesa do período |
| Desenvolvimento de sistema interno | CAPEX | Pode ser capitalizado se atender critérios contábeis |
| Auditoria externa (honorários) | OPEX | Despesa de compliance do período |

### 8.3 Alertas de Classificação Incorreta

O sistema identifica possíveis erros de classificação:

| Situação | Alerta |
|----------|--------|
| Notebook classificado como OPEX | Aviso: "Este tipo de ativo é geralmente CAPEX. Confirmar OPEX?" |
| Licença SaaS classificada como CAPEX | Aviso: "SaaS recorrente é geralmente OPEX. Confirmar CAPEX?" |
| Valor > R$5.000 classificado como OPEX | Aviso: "Valor elevado. Verificar se deve ser capitalizado como CAPEX." |

---

## 9. Ciclo Orçamentário

### 9.1 Fases do Ciclo

```
CICLO ORÇAMENTÁRIO ANUAL

OUT–NOV do ano anterior:
  → IT_MANAGER elabora orçamento previsto para o próximo exercício
  → Considera: contratos vigentes + renovações + novos projetos + inflação
  → Status: DRAFT

NOV–DEZ:
  → Financeiro corporativo revisa e negocia
  → Ajustes e cenários (conservador, base, otimista)
  → Status: PENDING_APPROVAL

DEZ / JAN:
  → Aprovação formal pela Diretoria
  → Status: APPROVED → ACTIVE no início do exercício

JAN–DEZ (ao longo do exercício):
  → Monitoramento mensal: realizado vs. aprovado
  → Revisões orçamentárias trimestrais (budget revisions)
  → Encerramento do exercício em DEZ

JAN do ano seguinte:
  → Status: CLOSED
  → Relatório de encerramento gerado automaticamente
```

### 9.2 Fases do Lançamento Orçamentário

| Fase | Campo | Descrição |
|:----:|-------|-----------|
| **Previsto** | `planned_amount` | Valor inicial estimado na elaboração do orçamento |
| **Aprovado** | `approved_amount` | Valor oficial após aprovação pela Diretoria |
| **Realizado** | `spent_amount` | Soma dos lançamentos efetivados no período |
| **Comprometido** | `committed_amount` | Soma de lançamentos aprovados, mas ainda não pagos |
| **Disponível** | Calculado | Aprovado − Realizado − Comprometido |

### 9.3 Controle de Estouro Orçamentário

| Situação | Ação |
|----------|------|
| Realizado > 80% do aprovado | Alerta ao IT_MANAGER (aviso preventivo) |
| Realizado > 100% (estouro até 20%) | Alerta urgente ao IT_MANAGER; novos lançamentos permitidos com alerta |
| Realizado > 120% (estouro > 20%) | Bloqueio automático de novos lançamentos; desbloqueio só com aprovação do IT_MANAGER |
| Realizado > 150% | Bloqueio + notificação à Diretoria |

**Referência:** BR-FIN-004

---

## 10. Custos por Ativo

### 10.1 Composição do TCO (Total Cost of Ownership)

Para cada ativo de TI, o módulo calcula o **Custo Total de Propriedade (TCO)**:

```
TCO do Ativo = Custo de Aquisição (CAPEX)
             + Custos de Manutenção acumulados (OPEX)
             + Custos de Suporte / Garantia estendida (OPEX)
             + Custos de Licença do SO / Software embarcado (OPEX)
             + Custos de Conectividade associados (OPEX)
             − Valor Residual estimado
```

### 10.2 Tipos de Custo Vinculáveis ao Ativo

| Tipo | Registro | Classificação |
|:----:|---------|:-------------:|
| **Aquisição** | Automático via CapexInvestment na criação do ativo | CAPEX |
| **Manutenção Corretiva** | Registrado ao concluir manutenção no módulo de Ativos | OPEX |
| **Manutenção Preventiva** | Registrado ao concluir manutenção preventiva | OPEX |
| **Garantia Estendida** | Registrado no contrato de garantia | OPEX |
| **Licença de Software** | Vinculado ao ativo (ex.: Windows no notebook) | OPEX |
| **Renovação** | Novo lançamento OPEX ao renovar contrato vinculado | OPEX |

### 10.3 Indicadores Financeiros por Ativo

Na página de cada ativo, o módulo exibe:

- Valor de aquisição original.
- Valor atual contábil (após depreciação).
- Total de custos de manutenção acumulados.
- TCO calculado dinamicamente.
- Benchmark: custo médio de manutenção para o modelo de ativo.
- Alerta: quando custo de manutenção > 70% do valor atual → sugestão de substituição.

---

## 11. Custos por Projeto

### 11.1 Tipos de Custo em Projetos

| Tipo | Fase do Projeto | Classificação |
|:----:|:--------------:|:-------------:|
| Licenças temporárias para o projeto | Execução | OPEX |
| Hardware adquirido para o projeto | Execução | CAPEX |
| Horas de consultoria | Execução | OPEX ou CAPEX |
| Software desenvolvido internamente | Execução | CAPEX |
| Treinamento da equipe do projeto | Execução | OPEX |
| Infraestrutura de cloud (temporária) | Execução | OPEX |

### 11.2 Visão Financeira do Projeto

Para cada projeto, o módulo exibe:

| Dimensão | Dados Exibidos |
|:--------:|---------------|
| **Orçamento do Projeto** | Aprovado vs. realizado vs. saldo disponível |
| **Distribuição por Categoria** | Hardware, software, serviços, recursos humanos |
| **Evolução Mensal** | Gráfico de curva S (orçado vs. realizado acumulado) |
| **Projeção de Encerramento** | Estimativa do custo final com base na tendência atual |
| **Desvio** | Variância em R$ e % entre orçado e realizado |

### 11.3 Apropriação de Custos ao Projeto

Quando um lançamento de OPEX ou CAPEX é vinculado a um projeto:

- O valor é debitado automaticamente do orçamento CAPEX ou OPEX do projeto.
- O dashboard do projeto atualiza o saldo disponível em tempo real.
- Alerta gerado ao IT_MANAGER e PROJECT_MANAGER quando realizado > 80% do orçamento do projeto.

---

## 12. Custos por Serviço

### 12.1 Visão de Custo por Serviço do Catálogo

O módulo permite análise de custo por serviço do catálogo, respondendo: "Quanto custa entregar este serviço por mês?"

### 12.2 Como Custos São Vinculados a Serviços

| Origem do Custo | Vinculação ao Serviço |
|:---------------:|:---------------------:|
| Lançamento OPEX | Campo `service_id` preenchido |
| Lançamento CAPEX | Ativo vinculado ao serviço |
| Contrato | Campo `service_id` no contrato |
| Rateio | Proporcional ao volume de chamados do serviço |

### 12.3 Indicadores de Custo por Serviço

| Indicador | Cálculo | Uso |
|:----------:|---------|-----|
| **Custo Total do Serviço** | Soma de OPEX + CAPEX vinculados | Composição do custo |
| **Custo por Ticket** | Custo total / tickets abertos no período | Eficiência de atendimento |
| **Custo por Usuário** | Custo total / usuários do serviço | Benchmark por colaborador |
| **TCO do Serviço** | Custo total da vida útil / usuários beneficiados | Decisão de renovação vs. substituição |

---

## 13. Custos de Compliance

### 13.1 Tipos de Custo de Compliance Rastreáveis

| Tipo | Classificação | Vinculado a |
|:----:|:-------------:|:------------|
| Honorários de auditoria externa | OPEX | Auditoria específica |
| Ferramentas de GRC / compliance | CAPEX ou OPEX | Auditoria / Norma |
| Treinamento de equipe para conformidade | OPEX | Norma |
| Certificação ISO e taxas | OPEX | Auditoria de certificação |
| Consultoria de adequação (DPO, etc.) | OPEX | Apontamento ou norma |
| Infraestrutura para controles (HSM, etc.) | CAPEX | Controle de segurança |

### 13.2 Rastreabilidade Compliance → Financeiro

```
Auditoria AUD-2026-0001 (ISO 27001 — Certificação)
  ├── Honorário consultoria: OPX-2026-000123 → R$ 45.000,00 (OPEX)
  ├── Ferramenta de gestão: CPX-2026-000018 → R$ 8.500,00 (CAPEX)
  └── Treinamento equipe: OPX-2026-000145 → R$ 3.200,00 (OPEX)
  Total da auditoria: R$ 56.700,00

Apontamento CMP-2026-000089 (NC ISO 27001 A.9.2.1)
  └── Correção: OPX-2026-000189 → R$ 1.200,00 (consultoria de ajuste)
```

### 13.3 Dashboard de Custo de Compliance

O módulo exibe para IT_MANAGER e COMPLIANCE_OFFICER:

- Custo total de compliance por norma (ISO 27001, LGPD, PCI DSS).
- Custo médio por apontamento tratado.
- Comparativo de custo de auditoria por exercício.
- Projeção de custo de conformidade para o próximo exercício.

---

## 14. Gestão de Contratos

### 14.1 Tipos de Contrato

| Tipo | Código | Exemplos |
|:----:|:------:|---------|
| **Licença de Software** | `SOFTWARE_LICENSE` | Microsoft EA, Adobe VIP, Oracle |
| **SaaS / Assinatura** | `SAAS_SUBSCRIPTION` | Salesforce, GitHub, AWS (committed use) |
| **Manutenção / Suporte** | `MAINTENANCE_SUPPORT` | Dell Support, HPE Care Pack |
| **Serviço Gerenciado** | `MANAGED_SERVICE` | MDM gerenciado, SOC as a Service |
| **Conectividade** | `CONNECTIVITY` | Links de internet, MPLS, telefonia |
| **Consultoria** | `CONSULTING` | Consultoria técnica, compliance, DPO |
| **Leasing** | `LEASING` | Leasing de equipamentos |
| **Hospedagem / Colocation** | `HOSTING` | Datacenter terceirizado, cloud hosting |
| **Garantia Estendida** | `WARRANTY` | Garantia estendida de hardware |
| **Outro** | `OTHER` | Contratos não classificados acima |

### 14.2 Campos do Contrato

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **id** | UUID | Automático | Não | Identificador único |
| **Código** | String (sequencial) | Automático | Não | `CTR-YYYY-NNNNNN`. Imutável. |
| **Título** | String (300) | Sim | FINANCIAL_ANALYST+ | Nome descritivo do contrato |
| **Tipo** | Enum | Sim | Não após criar | Tipo do contrato (tabela acima) |
| **Fornecedor** | FK — Supplier | Sim | FINANCIAL_ANALYST+ | Empresa contratada |
| **Classificação Financeira** | Enum | Sim | FINANCIAL_ANALYST+ | `OPEX` ou `CAPEX` |
| **Centro de Custo** | FK — CostCenter | Sim | FINANCIAL_ANALYST+ | Centro que arca com o custo |
| **Serviço do Catálogo** | FK — ServiceCatalog | Não | FINANCIAL_ANALYST+ | Serviço suportado por este contrato |
| **Ativo** | FK — Asset | Não | FINANCIAL_ANALYST+ | Ativo coberto pelo contrato |
| **Número do Contrato** | String (100) | Sim | FINANCIAL_ANALYST+ | Identificador oficial do contrato |
| **Objeto do Contrato** | Texto | Sim | FINANCIAL_ANALYST+ | Descrição do que está contratado |
| **Data de Início** | Date | Sim | FINANCIAL_ANALYST+ | Início da vigência |
| **Data de Fim** | Date | Sim | FINANCIAL_ANALYST+ | Término da vigência |
| **Renovação Automática** | Boolean | Sim | FINANCIAL_ANALYST+ | `true` se renova automaticamente |
| **Dias de Alerta de Renovação** | Inteiro | Sim | FINANCIAL_ANALYST+ | Antecedência para alertas. Padrão: 90 dias. |
| **Valor Mensal** | Decimal (15,2) | Condicional | FINANCIAL_ANALYST+ | Para contratos de pagamento mensal |
| **Valor Anual** | Decimal (15,2) | Condicional | FINANCIAL_ANALYST+ | Para contratos de pagamento anual |
| **Valor Total** | Decimal (15,2) | Sim | FINANCIAL_ANALYST+ | Valor total do contrato |
| **Moeda** | Enum | Sim | FINANCIAL_ANALYST+ | `BRL`, `USD`, `EUR` |
| **Arquivo do Contrato** | FileReference | Não | FINANCIAL_ANALYST+ | PDF do contrato assinado |
| **Status** | Enum | Sim | Conforme fluxo | `DRAFT`, `ACTIVE`, `EXPIRING_SOON`, `EXPIRED`, `CANCELLED`, `RENEWED` |
| **Responsável** | FK — User | Sim | FINANCIAL_ANALYST+ | IT_MANAGER responsável pela gestão |
| **SLA Contratado** | Texto | Não | FINANCIAL_ANALYST+ | SLA do fornecedor conforme contrato |
| **Penalidades** | Texto | Não | FINANCIAL_ANALYST+ | Multas e penalidades contratuais |

### 14.3 Alertas de Vencimento de Contrato

| Marco | Canal | Destinatário | Ação Esperada |
|:-----:|:-----:|:------------:|:-------------:|
| 90 dias antes | In-app + e-mail | IT_MANAGER + Responsável | Iniciar processo de renovação/renegociação |
| 60 dias antes | In-app + e-mail | IT_MANAGER + Responsável | Confirmar decisão (renovar/cancelar) |
| 30 dias antes | E-mail urgente | IT_MANAGER + Responsável | Emitir novo contrato ou cancelar |
| 2 dias antes | E-mail crítico | IT_MANAGER | Ação imediata ou aceitar expiração |
| Expirado | Alerta diário | IT_MANAGER | Resolver pendência urgente |

**Referência:** BR-FIN-005

---

## 15. Gestão de Fornecedores

### 15.1 Campos do Cadastro de Fornecedor

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **id** | UUID | Automático | Não | Identificador único |
| **Razão Social** | String (300) | Sim | FINANCIAL_ANALYST+ | Razão social oficial |
| **Nome Fantasia** | String (300) | Não | FINANCIAL_ANALYST+ | Nome comercial |
| **CNPJ** | String (18) | Sim | Não após criar | CNPJ validado (XX.XXX.XXX/XXXX-XX). Único por tenant. |
| **Tipo** | Enum | Sim | FINANCIAL_ANALYST+ | `HARDWARE`, `SOFTWARE`, `SERVICE`, `CLOUD`, `TELECOM`, `CONSULTING`, `OTHER` |
| **Website** | URL | Não | FINANCIAL_ANALYST+ | Site oficial |
| **E-mail Comercial** | String | Não | FINANCIAL_ANALYST+ | E-mail para contato comercial |
| **Telefone** | String (20) | Não | FINANCIAL_ANALYST+ | Telefone principal |
| **Contato Principal — Nome** | String (200) | Sim | FINANCIAL_ANALYST+ | Nome do gestor de conta |
| **Contato Principal — E-mail** | String | Sim | FINANCIAL_ANALYST+ | E-mail do contato principal |
| **Contato Técnico — Nome** | String (200) | Não | FINANCIAL_ANALYST+ | Nome do contato técnico/suporte |
| **Contato Técnico — E-mail** | String | Não | FINANCIAL_ANALYST+ | E-mail do contato técnico |
| **Endereço** | Texto | Não | FINANCIAL_ANALYST+ | Endereço completo |
| **Avaliação Geral** | Decimal (3,1) | Calculado | Não | Média das avaliações (1,0 a 5,0) |
| **Prazo Médio de Entrega** | Inteiro (dias) | Calculado | Não | Média de dias entre PO e entrega |
| **Taxa de Entrega no Prazo** | Decimal (5,2) | Calculado | Não | % entregas dentro do prazo |
| **Situação Receita Federal** | Enum | Calculado | Não | `REGULAR`, `IRREGULAR`, `SUSPENDED` (verificação automática de CNPJ) |
| **is_active** | Boolean | Sim | FINANCIAL_ANALYST+ | Fornecedores inativos não aparecem para seleção |

### 15.2 Avaliação de Fornecedor

Após cada recebimento de compra ou conclusão de serviço, o sistema solicita avaliação do fornecedor:

| Critério | Escala | Peso |
|:--------:|:------:|:----:|
| Cumprimento do prazo de entrega | 1–5 | 40% |
| Qualidade do produto/serviço | 1–5 | 40% |
| Qualidade do atendimento e suporte | 1–5 | 20% |

A avaliação geral é a média ponderada dos três critérios.

### 15.3 Indicadores de Fornecedor

Na página do fornecedor:

- Total comprado no ano corrente e histórico.
- Número de contratos ativos e encerrados.
- Avaliação média com histórico de avaliações.
- Pedidos de compra vinculados.
- Incidentes abertos relacionados ao fornecedor.

---

## 16. Integração com Ativos

### 16.1 Todo Ativo Deve Possuir Custo Associado

**Regra obrigatória:** Todo ativo registrado no inventário deve ter ao menos um lançamento financeiro vinculado:
- Ativo CAPEX: lançamento `CapexInvestment` obrigatório.
- Ativo OPEX (licença, serviço): lançamento `OpexExpense` ou contrato OPEX.
- Ativo sem custo: marcado como "Custo Pendente" no inventário com alerta ao IT_MANAGER.

### 16.2 Eventos Automáticos de Integração

| Evento no Módulo de Ativos | Ação no Módulo Financeiro |
|----------------------------|:------------------------:|
| Ativo CAPEX cadastrado | CapexInvestment criado com status PLANNED |
| Ativo recebido de compra | CapexInvestment vinculado ao PurchaseOrder e NF |
| Manutenção corretiva concluída | OpexExpense criada com tipo MAINTENANCE |
| Ativo descomissionado | CapexInvestment status → WRITTEN_OFF + baixa patrimonial |
| Garantia vencendo | Alerta ao FINANCIAL_ANALYST para renovação ou cancelamento |
| Licença com utilização < 20% | Sugestão de cancelamento ao IT_MANAGER + FINANCIAL_ANALYST |

**Referência:** BR-FIN-007, BR-FIN-010

---

## 17. Integração com Requisições

### 17.1 Toda Requisição com Custo Gera Lançamento

Requisições com `has_cost = true` e `estimated_value > 0` geram lançamento financeiro ao serem concluídas (FULFILLED):

```
Requisição FULFILLED com custo:
  │
  ├── Se OPEX:
  │   → OpexExpense criada com status PENDING
  │   → FINANCIAL_ANALYST notificado para confirmar valor e NF
  │
  └── Se CAPEX:
      → CapexInvestment criada com status PLANNED
      → asset_id preenchido (obrigatório para CAPEX)
      → FINANCIAL_ANALYST notificado para confirmar NF e iniciar depreciação
```

### 17.2 Verificação de Orçamento na Aprovação

Ao iniciar a etapa de aprovação financeira de uma requisição, o sistema verifica automaticamente o saldo disponível no orçamento do centro de custo. O Aprovador Financeiro visualiza:

- Saldo disponível atual do CC.
- Projeção de consumo para o restante do período.
- % do orçamento que esta requisição consumirá.

---

## 18. Integração com Compras

### 18.1 Geração Automática de Lançamento no Recebimento

Quando um pedido de compra é recebido (status → RECEIVED):

```
PurchaseOrder RECEIVED:
  │
  ├── Para cada item CAPEX recebido:
  │   → CapexInvestment criado automaticamente:
  │      valor = purchase_item.unit_price × quantity_received
  │      fornecedor = purchase_order.supplier_id
  │      nf_number = recebimento.invoice_number
  │      ativo = asset criado na entrada do equipamento
  │
  └── Para cada item OPEX recebido:
      → OpexExpense criada automaticamente:
         valor = purchase_item.unit_price × quantity_received
         categoria = conforme tipo do item
         data_competência = data do recebimento
```

### 18.2 Rastreabilidade Completa

| Entidade | Vínculo |
|:--------:|:-------:|
| OpexExpense | `purchase_order_id` (FK para PurchaseOrder) |
| CapexInvestment | `purchase_order_id` + `asset_id` |
| PurchaseOrder | `budget_id` (reserva orçamentária) |

---

## 19. Integração com Projetos

### 19.1 Orçamento do Projeto

Cada projeto de TI tem seu próprio orçamento dentro do orçamento geral de TI:

```
Projeto PRJ-2026-000042 — Implantação de ERP
  ├── Orçamento CAPEX aprovado: R$ 150.000,00
  │   ├── Hardware: R$ 40.000,00
  │   ├── Licenças perpétuas: R$ 80.000,00
  │   └── Desenvolvimento customizado: R$ 30.000,00
  │
  └── Orçamento OPEX aprovado: R$ 20.000,00
      ├── Consultoria de implantação: R$ 12.000,00
      └── Treinamento da equipe: R$ 8.000,00
```

### 19.2 Apropriação de Custos ao Projeto

Quando um lançamento financeiro é vinculado a um projeto:

- O valor é automaticamente debitado do orçamento do projeto (CAPEX ou OPEX).
- Dashboard do projeto atualizado em tempo real.
- Alerta ao PROJECT_MANAGER quando realizado > 80% do orçamento.
- Relatório financeiro do projeto disponível a qualquer momento.

### 19.3 Encerramento Financeiro do Projeto

Ao encerrar o projeto:
- Relatório final de custos gerado automaticamente.
- Saldo não utilizado liberado de volta ao orçamento central.
- Ativos CAPEX do projeto transferidos para o inventário geral com depreciação iniciada.

---

## 20. Integração com Compliance

### 20.1 Custos de Compliance Rastreados

Todo custo relacionado a atividades de compliance é registrado com vínculo ao módulo:

```
Lançamento OPEX com compliance_audit_id preenchido:
  → Aparece na visão financeira da auditoria
  → Compõe o custo total de compliance por norma
  → Relatório de custo de adequação disponível para IT_MANAGER
```

### 20.2 Relatório de ROI de Compliance

O dashboard executivo calcula o ROI de compliance comparando:
- Custo total de adequação (investimentos em compliance).
- Custo potencial evitado (multas, sanções, danos à reputação baseados em benchmarks de mercado).

---

## 21. Depreciação de Ativos

### 21.1 Conceito

**Depreciação** é o processo contábil de reconhecer, ao longo do tempo, o custo de um ativo de longo prazo como despesa do período correspondente ao seu uso. No SGTI, a depreciação é calculada automaticamente pelo `DepreciationJob`.

### 21.2 Métodos de Depreciação Suportados

| Método | Código | Fórmula | Quando Usar |
|:------:|:------:|---------|:-----------:|
| **Linear (Quotas Constantes)** | `STRAIGHT_LINE` | Depreciação Anual = (Valor − Residual) / Vida Útil | Padrão para maioria dos ativos |
| **Saldo Decrescente** | `DECLINING_BALANCE` | Depreciação Ano N = Valor Atual × Taxa | Para ativos com depreciação acelerada |

### 21.3 Vida Útil por Categoria de Ativo

| Categoria | Vida Útil Padrão | Taxa Anual (Linear) |
|-----------|:----------------:|:-------------------:|
| Notebook / Desktop | 3 anos (36 meses) | 33,33% |
| Servidor | 5 anos (60 meses) | 20,00% |
| Storage | 5 anos | 20,00% |
| Switch / Roteador | 7 anos (84 meses) | 14,29% |
| Firewall | 5 anos | 20,00% |
| Access Point | 5 anos | 20,00% |
| Impressora / MFP | 5 anos | 20,00% |
| Celular Corporativo | 3 anos | 33,33% |
| Licença Perpétua | Amortização: 3–5 anos | Configurável |
| Sistema Desenvolvido | 5 anos | 20,00% |

### 21.4 Cálculo Detalhado — Método Linear

```
EXEMPLO DE DEPRECIAÇÃO LINEAR

Ativo: Dell XPS 15 (Notebook)
Valor de Aquisição: R$ 8.500,00
Valor Residual: R$ 500,00 (estimado)
Vida Útil: 36 meses
Início da Depreciação: Primeiro dia do mês seguinte à aquisição

Depreciação Mensal = (8.500,00 − 500,00) / 36 = R$ 222,22/mês

Mês 1: Valor Atual = R$ 8.500,00 − R$ 222,22 = R$ 8.277,78
Mês 12: Valor Atual = R$ 8.500,00 − (R$ 222,22 × 12) = R$ 5.833,36
Mês 36: Valor Atual = R$ 500,00 (valor residual)
Mês 37+: Depreciação encerrada; valor permanece em R$ 500,00
```

### 21.5 Execução da Depreciação

- O `DepreciationJob` executa no **primeiro dia útil de cada mês** às 04h00.
- Calcula a depreciação do mês anterior para todos os ativos CAPEX com status IN_USE, IN_STOCK ou UNDER_MAINTENANCE.
- Atualiza `current_value` e `accumulated_depreciation` de cada ativo.
- Gera relatório mensal de depreciação enviado automaticamente ao FINANCIAL_ANALYST e IT_MANAGER.

---

## 22. Dashboards Operacionais

### 22.1 Painel Financeiro Operacional

**Destino:** FINANCIAL_ANALYST, IT_MANAGER. Atualizado em tempo real.

| Componente | Dados Exibidos |
|------------|---------------|
| **OPEX do Mês** | Total realizado vs. orçado com % de utilização |
| **CAPEX do Mês** | Investimentos realizados vs. orçado |
| **Lançamentos Pendentes de Aprovação** | Lista com valor, solicitante e prazo |
| **Contratos Vencendo (90 dias)** | Lista com contrato, fornecedor e data |
| **Orçamento por Centro de Custo** | Barras de realizado vs. disponível por CC |
| **Despesas Sem NF** | Lançamentos > R$500 sem nota fiscal anexada |
| **Licenças Subutilizadas** | Licenças < 20% de uso com valor mensal |
| **Ativos Sem Custo** | Ativos no inventário sem lançamento financeiro |

### 22.2 Indicadores Operacionais Principais

| KPI | Fórmula | Meta |
|-----|---------|:----:|
| **OPEX do Mês** | SUM(OpexExpense.amount) do mês corrente | Dentro do orçado |
| **CAPEX do Mês** | SUM(CapexInvestment.value) do mês corrente | Dentro do orçado |
| **Custos por Área** | SUM(custos) por departamento | Distribuição conforme rateio |
| **Custos por Serviço** | SUM(custos vinculados a serviço) | — |
| **Contratos Vencendo** | COUNT(status = EXPIRING_SOON) | 0 sem tratativa |
| **Lançamentos Pendentes** | COUNT(status = PENDING) | ≤ 10 |

---

## 23. Dashboards Executivos

### 23.1 Painel Financeiro Executivo

**Destino:** IT_MANAGER, Diretoria/CFO.

| Indicador Executivo | Composição | Objetivo |
|:-----------------:|-----------|---------|
| **Evolução OPEX** | OPEX mensal dos últimos 12 meses vs. orçado | Tendência de despesas operacionais |
| **Evolução CAPEX** | CAPEX mensal dos últimos 12 meses vs. orçado | Tendência de investimentos |
| **Custos por Projeto** | OPEX + CAPEX realizado por projeto ativo | Controle de projetos |
| **Custos por Ativo** | TCO por categoria de ativo | Otimização do parque tecnológico |
| **ROI Estimado** | Benefícios estimados / Custo total de TI × 100 | Valor gerado pela TI |
| **Orçado vs. Realizado** | Comparativo mensal OPEX e CAPEX | Aderência ao orçamento |
| **Tendência Anual** | Projeção de encerramento baseada na tendência atual | Planejamento |
| **Custo de TI por Usuário** | Total de TI / total de colaboradores | Benchmark eficiência |
| **Custo de TI sobre Receita** | Total de TI / Receita da empresa × 100 | Eficiência estratégica |
| **Depreciação Acumulada** | Soma da depreciação acumulada de todos os ativos CAPEX | Controle patrimonial |

### 23.2 Gráficos Executivos

| Gráfico | Tipo | Objetivo |
|---------|:----:|---------|
| OPEX vs. CAPEX por mês | Barras agrupadas | Composição do gasto de TI |
| Evolução do custo total de TI (12 meses) | Linha | Tendência de crescimento |
| Distribuição de custos por área | Pizza | Rateio e responsabilização |
| Top 10 fornecedores por valor contratado | Barras | Concentração de gasto |
| Orçado vs. Realizado acumulado | Linhas duplas | Aderência ao budget |
| Projeção de encerramento do ano | Área + projeção | Planejamento |
| Depreciação acumulada por categoria | Barras empilhadas | Controle patrimonial |

---

## 24. Relatórios

### 24.1 Relatórios Operacionais Automáticos

| Relatório | Geração | Destinatário | Conteúdo |
|-----------|:-------:|:------------:|---------|
| **Lançamentos do Dia** | Diária | FINANCIAL_ANALYST | Novos lançamentos, aprovações pendentes |
| **Contratos Vencendo** | Semanal | IT_MANAGER + FINANCIAL_ANALYST | Contratos nos próximos 90 dias |
| **OPEX e CAPEX do Mês** | Mensal (1º dia útil) | IT_MANAGER + FINANCIAL_ANALYST | Realizado vs. orçado por centro de custo |
| **Rateio de Custos** | Mensal (1º dia útil) | IT_MANAGER + Áreas | Distribuição proporcional dos custos de TI |
| **Depreciação do Mês** | Mensal (1º dia útil) | FINANCIAL_ANALYST + IT_MANAGER | Depreciação de cada ativo + valor atual |
| **Licenças Subutilizadas** | Mensal | IT_MANAGER + FINANCIAL_ANALYST | Licenças < 20% de utilização |

### 24.2 Relatórios Gerenciais

| Relatório | Frequência | Destinatário | Conteúdo |
|-----------|:----------:|:------------:|---------|
| **Custo por Projeto** | Por projeto ou mensal | IT_MANAGER + PROJECT_MANAGER | OPEX + CAPEX realizado vs. orçado por projeto |
| **TCO por Ativo** | Trimestral | IT_MANAGER | TCO detalhado por ativo com projeção de substituição |
| **Avaliação de Fornecedores** | Trimestral | IT_MANAGER + Compras | Avaliações, cumprimento de SLA e custo por fornecedor |
| **Custo de Compliance** | Trimestral | IT_MANAGER + COMPLIANCE_OFFICER | Custos por norma e auditoria |

### 24.3 Relatórios Executivos

| Relatório | Frequência | Destinatário | Conteúdo |
|-----------|:----------:|:------------:|---------|
| **Panorama Financeiro de TI** | Trimestral | Diretoria + IT_MANAGER | OPEX/CAPEX, tendências, ROI, projeção |
| **Orçamento vs. Realizado Anual** | Semestral + anual | Diretoria + Financeiro | Análise completa de aderência ao budget |
| **Valor do Parque Tecnológico** | Anual | Diretoria + Financeiro | Valor contábil total; depreciação acumulada |

---

## 25. Auditoria e Rastreabilidade

### 25.1 Eventos Auditados Obrigatoriamente

| Evento | `action` | Dados Capturados |
|--------|:--------:|:----------------:|
| Lançamento OPEX criado | CREATE | Todos os campos + criado_por |
| Lançamento OPEX aprovado | UPDATE | aprovado_por + timestamp (SoD verificado) |
| Lançamento OPEX rejeitado | UPDATE | rejeitado_por + motivo |
| Lançamento CAPEX criado | CREATE | Todos os campos + criado_por |
| Lançamento CAPEX aprovado | UPDATE | aprovado_por + timestamp |
| Orçamento criado | CREATE | Todos os campos + criado_por |
| Orçamento aprovado | UPDATE | aprovado_por + timestamp |
| Orçamento excedido | CREATE (alerta) | CC + valor excedido + % |
| Contrato criado | CREATE | Todos os campos |
| Contrato atualizado | UPDATE | Campo + valor anterior + novo |
| Contrato encerrado | UPDATE | encerrado_por + motivo |
| Contrato renovado | UPDATE | renovado_por + novo prazo |
| Fornecedor cadastrado | CREATE | Todos os campos |
| Fornecedor avaliado | CREATE (rating) | avaliado_por + nota + critérios |
| Depreciação executada | CREATE (batch) | Mês + qtd ativos + total depreciado |
| Rateio executado | CREATE (batch) | Mês + método + distribuição |
| Ajuste de lançamento | UPDATE | Campo + old_value + new_value + motivo obrigatório |
| Exportação de relatório | CREATE | Tipo + filtros + exportado_por |

### 25.2 Trilha de Aprovações Financeiras

O `audit_log` preserva o caminho completo de aprovação de cada lançamento:

```
Lançamento OPX-2026-000123:
  Criado por: Ana Lima (Analista TI) em 15/06/2026 09:15
  Valor: R$ 3.500,00 | Categoria: SaaS | CC: CC-TI-SISTM
  → Aguardando aprovação IT_MANAGER (> R$1.000)

  Aprovado por: Carlos Souza (IT_MANAGER) em 15/06/2026 11:30
  IP: 10.0.1.45 | Session: jwt_abc123
  → Status: APPROVED
```

---

## 26. Compliance Financeiro

### 26.1 Requisitos de Conformidade

| Norma | Requisito | Atendimento no Módulo |
|-------|-----------|----------------------|
| **SOX / Controles Internos** | Segregação de funções em aprovações financeiras | Quem registra ≠ quem aprova (SoD-02) |
| **IFRS / CPC 27** | Reconhecimento e depreciação de ativos imobilizados | CAPEX com depreciação linear configurável |
| **Lei 6.404/1976** | Controle de ativo imobilizado | Inventário CAPEX com baixa patrimonial |
| **Instrução CVM** | Transparência contábil | Relatórios exportáveis para auditoria |
| **ISO/IEC 20000** | Gestão financeira de serviços de TI | Custo por serviço do catálogo |
| **ITIL v4** | Gestão financeira como prática de ITSM | Orçamento, contabilidade e cobrança |

### 26.2 Segregação de Funções Financeiras

| SoD | Restrição | Aplicação |
|:---:|:----------:|:--------:|
| **SoD-FIN-01** | Registrar ≠ Aprovar (mesmo lançamento) | `approved_by ≠ created_by` |
| **SoD-FIN-02** | Criar orçamento ≠ Aprovar orçamento | IT_MANAGER cria; Diretoria aprova |
| **SoD-FIN-03** | Emitir PO ≠ Receber mercadoria | Compras emite; Analista recebe |
| **SoD-FIN-04** | Cadastrar fornecedor ≠ Aprovar pagamento | Financeiro cadastra; Gestor aprova |

---

## 27. Regras de Negócio

As regras a seguir complementam as regras BR-FIN-001 a BR-FIN-010 definidas em `Docs/24_BUSINESS_RULES.md`.

---

**FIN-001** — Todo custo deve possuir classificação OPEX ou CAPEX
O campo `classification` é obrigatório em todos os lançamentos financeiros. Não é possível registrar despesa ou investimento sem esta classificação. Violação: erro 400 `MISSING_CLASSIFICATION`.
**Referência:** BR-FIN-001

---

**FIN-002** — Quem registra não pode aprovar o mesmo lançamento
`approved_by ≠ created_by` em todos os lançamentos. Segregação de funções inviolável. Violação: erro 422 `SELF_APPROVAL_NOT_ALLOWED`.
**Referência:** BR-FIN-002

---

**FIN-003** — Toda despesa deve possuir centro de custo ativo
O campo `cost_center_id` é obrigatório. O CC referenciado deve ter `is_active = true`. Violação: erro 400 `MISSING_COST_CENTER`.
**Referência:** BR-FIN-003

---

**FIN-004** — Orçamento excedido em 20% bloqueia novos lançamentos
Lançamento que cause o realizado superar o aprovado em mais de 20% é bloqueado automaticamente. Desbloqueio exige aprovação adicional do IT_MANAGER com justificativa.
**Referência:** BR-FIN-004

---

**FIN-005** — Todo ativo deve possuir custo associado
Ativo cadastrado no inventário sem lançamento financeiro vinculado é marcado como "Custo Pendente" e gera alerta semanal ao FINANCIAL_ANALYST. Ativos CAPEX sem CapexInvestment não podem ter status IN_USE.

---

**FIN-006** — Todo projeto deve permitir apropriação financeira
Projetos com status APPROVED ou IN_PROGRESS devem ter orçamento definido (OPEX e/ou CAPEX). Lançamentos financeiros podem ser vinculados ao projeto via `project_id`.

---

**FIN-007** — Todo contrato deve possuir vigência
Os campos `start_date` e `end_date` são obrigatórios em todos os contratos. Contrato sem data de vencimento não pode ser cadastrado.

---

**FIN-008** — Todo fornecedor deve possuir cadastro válido com CNPJ
O campo `cnpj` é obrigatório, único por tenant e validado com verificador de dígito. Fornecedor com CNPJ inválido ou em situação irregular na Receita Federal é bloqueado.
**Referência:** BR-FIN-008 (extensão)

---

**FIN-009** — Toda despesa OPEX > R$500 deve ter nota fiscal
Lançamentos OPEX com valor > R$500,00 devem ter nota fiscal ou fatura anexada. Sem documentação: status `PENDING_INVOICE`, alerta semanal ao IT_MANAGER.
**Referência:** BR-FIN-008

---

**FIN-010** — Lançamento CAPEX deve ter nota fiscal obrigatória
Todo lançamento CAPEX requer nota fiscal, independentemente do valor. Sem NF: bloqueio do lançamento com erro `INVOICE_REQUIRED`.

---

**FIN-011** — Orçamento deve ser aprovado antes de receber lançamentos
Lançamentos não podem ser vinculados a orçamento com status DRAFT ou PENDING_APPROVAL. Apenas orçamentos APPROVED ou ACTIVE aceitam novos lançamentos.

---

**FIN-012** — Contrato vencendo: alertas automáticos nos marcos de 90/60/30/2 dias
Contratos ativos com `end_date` preenchida recebem alertas automáticos ao responsável e ao IT_MANAGER nos marcos de 90, 60, 30 e 2 dias antes do vencimento.
**Referência:** BR-FIN-005

---

**FIN-013** — Contrato com auto_renew: alerta de revisão consciente obrigatório
Contratos com `auto_renew = true` geram alerta `alert_days_before` dias antes para revisão. Sem ação do responsável: renovado automaticamente com registro em auditoria.
**Referência:** BR-FIN-006

---

**FIN-014** — Ativo descomissionado: baixa patrimonial automática no financeiro
Evento `AssetDecommissioned` cria automaticamente registro de baixa patrimonial, zerando `current_value` e encerrando a depreciação.
**Referência:** BR-FIN-007

---

**FIN-015** — Rateio de custos executado mensalmente no primeiro dia útil
O `CostAllocationJob` distribui os custos compartilhados de TI no primeiro dia útil de cada mês, conforme a base de rateio configurada por centro de custo.
**Referência:** BR-FIN-009

---

**FIN-016** — Licença com utilização < 20% por 3 meses: sugestão de cancelamento
Job mensal detecta licenças subutilizadas e cria sugestão de cancelamento no módulo de Compras, notificando IT_MANAGER e FINANCIAL_ANALYST.
**Referência:** BR-FIN-010

---

**FIN-017** — Código do lançamento imutável após criação
Códigos OPX-YYYY-NNNNNN e CPX-YYYY-NNNNNN são sequenciais, únicos por tenant e imutáveis após criação.

---

**FIN-018** — Ajuste de lançamento aprovado: campos limitados e motivo obrigatório
Após aprovação, apenas campos de observação e data de pagamento podem ser alterados em lançamentos OPEX. Para ajuste de valor: novo lançamento de estorno + novo lançamento correto.

---

**FIN-019** — Estorno de lançamento exige aprovação do IT_MANAGER
Qualquer estorno de lançamento financeiro requer aprovação do IT_MANAGER com justificativa obrigatória (mín. 30 chars). O lançamento original é preservado no histórico.

---

**FIN-020** — Todo custo de compliance deve ser rastreável à sua origem
Lançamentos relacionados a compliance devem ter `compliance_audit_id` ou `compliance_finding_id` preenchido. Sem rastreabilidade: flag "Compliance Não Rastreado" no relatório mensal.

---

**FIN-021** — Depreciação calculada automaticamente no primeiro dia útil do mês
O `DepreciationJob` executa às 04h00 do primeiro dia útil de cada mês. Nenhuma intervenção manual é necessária para a depreciação rotineira.

---

**FIN-022** — Valor atual do ativo nunca negativo
O `current_value` de um ativo CAPEX não pode ser menor que o `residual_value` configurado. Ao atingir o valor residual, a depreciação é encerrada automaticamente.

---

**FIN-023** — Lançamento em moeda estrangeira: conversão automática para BRL
Lançamentos em USD ou EUR têm o valor convertido automaticamente para BRL usando a taxa do dia (API de câmbio configurada). A taxa utilizada é registrada no lançamento.

---

**FIN-024** — Alçada de aprovação aplicada automaticamente pelo sistema
O sistema determina automaticamente o aprovador necessário com base no valor do lançamento: Coordenador (≤ R$1k), IT_MANAGER (≤ R$10k), IT_MANAGER com step-up auth (> R$10k), + Diretoria (> R$50k).

---

**FIN-025** — Lançamento vinculado a projeto: débito automático do orçamento do projeto
Ao registrar lançamento com `project_id`, o valor é automaticamente debitado do saldo disponível do orçamento do projeto correspondente (OPEX ou CAPEX).

---

**FIN-026** — Orçamento sem aprovação até o início do exercício: alerta ao IT_MANAGER
Exercício fiscal iniciado sem orçamento com status APPROVED gera alerta diário ao IT_MANAGER até que o orçamento seja aprovado.

---

**FIN-027** — Fornecedor inativo bloqueado em novos lançamentos
Fornecedor com `is_active = false` não pode ser vinculado a novos contratos ou lançamentos financeiros.

---

**FIN-028** — CNPJ validado na Receita Federal periodicamente
O sistema verifica a situação dos CNPJs dos fornecedores mensalmente. Fornecedores com CNPJ irregular ou cancelado recebem flag de alerta ao FINANCIAL_ANALYST.

---

**FIN-029** — Contrato vencido sem tratativa: lançamentos automáticos suspensos
Contrato expirado que possui lançamentos recorrentes vinculados: novos lançamentos automáticos são suspensos até que o contrato seja renovado ou substituído.

---

**FIN-030** — Relatório de rateio gerado antes do fechamento do mês
O relatório de rateio do mês corrente deve estar disponível para consulta das áreas até o dia 5 do mês seguinte.

---

**FIN-031** — Orçamento do exercício fechado: sem novos lançamentos
Orçamento com status CLOSED não aceita novos lançamentos. Lançamentos de competência passada devem ser lançados no exercício corrente como ajustes.

---

**FIN-032** — Custo por serviço calculado e disponível para o catálogo
O custo associado a cada serviço do catálogo é calculado automaticamente pela soma dos lançamentos com `service_id` correspondente. Disponível no dashboard do catálogo de serviços.

---

**FIN-033** — Exportação de dados financeiros requer IT_MANAGER+
A exportação de relatórios financeiros completos (todos os centros de custo) requer autorização do IT_MANAGER e gera registro de auditoria com o escopo exportado.

---

**FIN-034** — Projeção de custo anual calculada automaticamente
O dashboard executivo exibe projeção do custo de encerramento do ano baseada na média mensal dos últimos 3 meses. Atualizada mensalmente após o fechamento do `CostAllocationJob`.

---

**FIN-035** — Depreciação de licença perpétua: amortização configurável
Licenças perpétuas classificadas como CAPEX têm amortização (depreciação de intangível) configurada pelo FINANCIAL_ANALYST com vida útil entre 3 e 5 anos.

---

**FIN-036** — Avaliação de fornecedor obrigatória após recebimento
Após cada recebimento de compra ou conclusão de serviço, o sistema solicita avaliação do fornecedor (prazo: 5 dias úteis). Sem avaliação: alerta ao FINANCIAL_ANALYST.

---

**FIN-037** — Lançamento cancelado: valor devolvido ao orçamento
Ao cancelar um lançamento OPEX aprovado, o valor é automaticamente devolvido ao saldo disponível do orçamento correspondente.

---

**FIN-038** — CAPEX sem ativo vinculado: alerta de pendência patrimonial
CapexInvestment sem `asset_id` vinculado após 30 dias do recebimento gera alerta ao FINANCIAL_ANALYST para vinculação ao ativo correspondente no inventário.

---

**FIN-039** — Lançamento com data de competência retroativa: alerta de atraso
Lançamentos com `competency_date` anterior ao mês corrente em mais de 2 meses geram alerta ao FINANCIAL_ANALYST indicando possível lançamento tardio.

---

**FIN-040** — Custo de manutenção > 70% do valor atual: alerta de substituição
Quando o custo acumulado de manutenções de um ativo ultrapassa 70% do `current_value`, alerta automático ao IT_MANAGER sugerindo avaliação de substituição do ativo.

---

**FIN-041** — Comparativo orçado vs. realizado disponível em tempo real
O dashboard executivo exibe o comparativo orçado vs. realizado com atualização a cada 5 minutos via Supabase Realtime.

---

**FIN-042** — Contrato sem responsável designado: bloqueado para ativação
Contrato com status DRAFT não pode ser ativado sem `responsible_id` preenchido (usuário responsável pela gestão do contrato).

---

**FIN-043** — Pedido de compra vinculado a orçamento aprovado
Todo pedido de compra deve ser vinculado a um orçamento com status APPROVED ou ACTIVE. POs sem orçamento geram alerta ao FINANCIAL_ANALYST.

---

**FIN-044** — Custo de cloud calculado mensalmente
Custos de serviços IaaS/PaaS (AWS, Azure, GCP) são registrados como OPEX mensal. Variação > 20% entre meses consecutivos gera alerta ao IT_MANAGER.

---

**FIN-045** — ROI estimado calculado semestralmente
O indicador de ROI estimado é calculado no dashboard executivo semestralmente, comparando o investimento total de TI com os benefícios quantificáveis (redução de incidentes, automações, produtividade) configurados pelo IT_MANAGER.

---

**FIN-046** — Orçamento revisado: histórico de versões preservado
Revisões orçamentárias (budget revisions) criam nova versão do orçamento; a versão anterior é preservada no histórico para comparação e auditoria.

---

**FIN-047** — Lançamento com fornecedor fora do cadastro: bloqueado
Não é possível criar lançamento financeiro com fornecedor não cadastrado no sistema. O cadastro do fornecedor deve ser criado antes do primeiro lançamento.

---

**FIN-048** — Alerta de orçamento em 80% disparado automaticamente
Quando o saldo utilizado de qualquer orçamento atingir 80% do valor aprovado, alerta automático enviado ao IT_MANAGER e ao responsável pelo centro de custo.

---

**FIN-049** — Histórico de depreciação preservado indefinidamente
Todos os registros mensais de depreciação são preservados indefinidamente para fins de auditoria fiscal e patrimonial, mesmo após o ativo ser descomissionado.

---

**FIN-050** — Cálculo de custo por usuário disponível no dashboard
O custo médio de TI por usuário é calculado mensalmente: Total OPEX + CAPEX / Número de usuários ativos. Exibido no dashboard executivo.

---

**FIN-051** — Variância orçamentária acima de 10% requer justificativa
Ao encerrar o exercício com variância entre previsto e realizado superior a 10%, o IT_MANAGER deve registrar justificativa formal no relatório de encerramento.

---

**FIN-052** — Custo por ticket calculado mensalmente
O custo médio por ticket de suporte é calculado: Total OPEX de suporte / Total de tickets do período. Exibido no dashboard do catálogo de serviços.

---

**FIN-053** — Arquivos de nota fiscal criptografados no storage
Notas fiscais e faturas armazenadas no storage são criptografadas com AES-256. Download via URL presigned com validade de 15 minutos.

---

**FIN-054** — Contrato com valor > R$50.000: aprovação da Diretoria
Contratos com `total_value > R$50.000,00` requerem aprovação da Diretoria além da aprovação do IT_MANAGER.

---

**FIN-055** — Lançamento recorrente: geração automática mensal
Lançamentos OPEX com `recurrence = MONTHLY` geram automaticamente o próximo lançamento no início do mês seguinte, com status PENDING aguardando confirmação do FINANCIAL_ANALYST.

---

**FIN-056** — Custo de implantação de sistema capitalizável conforme critérios contábeis
Custos de desenvolvimento e implantação de sistemas podem ser classificados como CAPEX (capitalizado) quando atendem critérios contábeis: viabilidade técnica demonstrada, intenção de conclusão e uso futuro.

---

**FIN-057** — Relatório financeiro para auditoria externo exportável em PDF
Todos os relatórios financeiros podem ser exportados em PDF com cabeçalho corporativo, hash SHA-256 e período de referência para uso em auditorias externas.

---

**FIN-058** — Orçamento de TI como % da receita: indicador disponível
O indicador "Custo de TI / Receita Total × 100" é calculado semestralmente quando o FINANCIAL_ANALYST informa a receita da empresa no campo de configuração.

---

**FIN-059** — Lançamentos pendentes há > 5 dias úteis: escalonamento ao IT_MANAGER
Lançamentos financeiros com status PENDING por mais de 5 dias úteis sem ação do aprovador geram alerta de escalonamento ao IT_MANAGER.

---

**FIN-060** — Fornecedor avaliado abaixo de 2,0: flag de risco de fornecedor
Fornecedor com avaliação geral < 2,0 recebe flag de alerta no cadastro. IT_MANAGER notificado para revisão da continuidade da relação comercial.

---

**FIN-061** — OPEX de conectividade monitorado por variação
Despesas recorrentes de conectividade (internet, MPLS) com variação > 10% entre meses consecutivos geram alerta ao FINANCIAL_ANALYST para verificação de possível erro ou fraude.

---

**FIN-062** — Custo de projeto encerrado transferido para o inventário
Ao encerrar projeto com ativos CAPEX, o valor residual dos ativos criados no projeto é transferido para o inventário geral com depreciação contínua.

---

**FIN-063** — Meta de redução de OPEX configurável pelo IT_MANAGER
O IT_MANAGER pode configurar uma meta de redução percentual de OPEX para o exercício. O dashboard exibe o progresso em relação à meta definida.

---

**FIN-064** — Contrato de consultoria de compliance vinculado à auditoria
Contratos de consultoria criados para suporte a auditorias devem ter `compliance_audit_id` preenchido para rastreabilidade de custos de compliance.

---

**FIN-065** — Lançamento duplicado detectado automaticamente
O sistema detecta possível duplicidade de lançamento quando: mesmo fornecedor + mesmo valor + mesma competência nos últimos 30 dias. Exibe aviso ao analista antes de salvar.

---

**FIN-066** — Saldo de caixa de TI calculado e exibido
O módulo calcula o saldo de caixa de TI: orçamento total aprovado − comprometido − realizado. Exibido no dashboard operacional para controle do FINANCIAL_ANALYST.

---

**FIN-067** — Variância de CAPEX entre planejado e executado documentada
Ao fechar exercício com variância CAPEX > 15% entre planejado e executado, relatório de análise de variância gerado automaticamente para a Diretoria.

---

**FIN-068** — Custo de TI por departamento disponível para gestores de área
Gestores de área (IT_MANAGER de cada departamento) visualizam apenas os custos do seu centro de custo. Dados de outros CCs requerem autorização do IT_MANAGER geral.

---

**FIN-069** — Lançamento vinculado a requisição: REQ_ID imutável após aprovação
O campo `request_id` de um lançamento vinculado a uma requisição é imutável após a aprovação do lançamento.

---

**FIN-070** — Análise de concentração de fornecedor: alerta de risco
Quando um único fornecedor representa > 40% do OPEX mensal de TI, o dashboard exibe alerta de concentração de fornecedor ao IT_MANAGER.

---

**FIN-071** — Custo de cloud: análise de anomalias mensais
Job mensal compara o custo de cloud do mês com a média dos últimos 3 meses. Variação > 25% gera alerta imediato ao IT_MANAGER para investigar consumo anômalo.

---

**FIN-072** — Relatório de orçamento anual enviado ao financeiro corporativo
No primeiro dia útil de cada mês, o relatório consolidado OPEX + CAPEX é exportado automaticamente em CSV/XLSX para integração com o sistema financeiro corporativo.

---

**FIN-073** — Todo lançamento preservado indefinidamente
Lançamentos financeiros (OPEX e CAPEX) são preservados indefinidamente no sistema. Exclusão física é proibida por RLS. Cancelamentos são soft-deletes com registro de auditoria.

---

**FIN-074** — Centro de custo inativo: lançamentos existentes preservados
Ao inativar um centro de custo, os lançamentos históricos vinculados são preservados. Apenas novos lançamentos são bloqueados.

---

**FIN-075** — Lançamento OPEX recorrente cancelado: ciclo encerrado automaticamente
Ao cancelar um lançamento recorrente (OPEX), todos os lançamentos futuros do mesmo ciclo são cancelados automaticamente e o responsável é notificado.

---

**FIN-076** — Custo médio por incidente calculado mensalmente
O custo médio de TI por incidente resolvido é calculado: Total OPEX de suporte do mês / incidentes resolvidos no mês. Disponível no dashboard executivo.

---

**FIN-077** — Valor de compra vs. valor contábil: diferença documentada
Ao encerrar projeto ou descomissionar ativo, se `valor_venda > valor_atual`, o ganho de capital é registrado como nota no lançamento de baixa patrimonial.

---

**FIN-078** — Orçamento de projeto aprovado antes da execução
Projeto com status IN_PROGRESS sem orçamento aprovado gera alerta semanal ao IT_MANAGER e ao PROJECT_MANAGER para regularização.

---

**FIN-079** — Impostos e tributos sobre lançamentos: campo informativo
O módulo oferece campo opcional `tax_amount` para registrar impostos e tributos incidentes sobre despesas, sem processar o cálculo tributário (responsabilidade do financeiro corporativo).

---

**FIN-080** — Módulo financeiro de TI integrado ao orçamento corporativo via exportação
O módulo exporta relatórios padronizados (XLSX, CSV, PDF) para integração com sistemas de ERP financeiro corporativo. A integração não é bidirecional — o ERP é a fonte de autoridade do orçamento corporativo.

---

## 28. Critérios de Aceitação

### 28.1 Lançamentos e Classificação

- [ ] **CA-01:** Lançamento sem classificação OPEX/CAPEX bloqueado com erro `MISSING_CLASSIFICATION`.
- [ ] **CA-02:** Auto-aprovação de lançamento retorna erro `SELF_APPROVAL_NOT_ALLOWED`.
- [ ] **CA-03:** Lançamento OPEX > R$500 sem NF com status PENDING e alerta gerado.
- [ ] **CA-04:** Lançamento CAPEX sem NF bloqueado com erro `INVOICE_REQUIRED`.
- [ ] **CA-05:** Lançamento sem centro de custo ativo bloqueado.
- [ ] **CA-06:** Código OPX/CPX gerado automaticamente e imutável após criação.

### 28.2 Orçamento e Controle

- [ ] **CA-07:** Alerta ao IT_MANAGER quando realizado atinge 80% do orçado.
- [ ] **CA-08:** Novos lançamentos bloqueados quando estouro > 20% do orçamento sem aprovação.
- [ ] **CA-09:** Comparativo orçado vs. realizado atualizado em tempo real (< 5 min).
- [ ] **CA-10:** Revisão orçamentária cria nova versão preservando histórico.
- [ ] **CA-11:** Orçamento fechado bloqueia novos lançamentos.

### 28.3 Depreciação

- [ ] **CA-12:** `DepreciationJob` executa no primeiro dia útil do mês e calcula corretamente.
- [ ] **CA-13:** `current_value` não cai abaixo do `residual_value`.
- [ ] **CA-14:** Depreciação encerrada automaticamente ao atingir valor residual.
- [ ] **CA-15:** Baixa patrimonial automática ao descomissionar ativo CAPEX.

### 28.4 Contratos e Fornecedores

- [ ] **CA-16:** Alertas de contrato vencendo enviados nos marcos de 90/60/30/2 dias.
- [ ] **CA-17:** Contrato com auto_renew renovado automaticamente com registro em auditoria.
- [ ] **CA-18:** Contrato sem `end_date` bloqueado na criação.
- [ ] **CA-19:** CNPJ do fornecedor validado com verificador de dígito.
- [ ] **CA-20:** Fornecedor inativo bloqueado em novos contratos e lançamentos.

### 28.5 Integrações

- [ ] **CA-21:** CapexInvestment criado automaticamente ao cadastrar ativo CAPEX.
- [ ] **CA-22:** Ativo descomissionado gera baixa patrimonial automática.
- [ ] **CA-23:** Requisição FULFILLED com custo gera lançamento financeiro automaticamente.
- [ ] **CA-24:** Lançamento vinculado a projeto debita orçamento do projeto em tempo real.
- [ ] **CA-25:** Custo de compliance vinculado a auditoria visível no dashboard de compliance.
- [ ] **CA-26:** Recebimento de compra CAPEX gera CapexInvestment automaticamente com NF.

### 28.6 Dashboards e Relatórios

- [ ] **CA-27:** OPEX e CAPEX do mês exibidos corretamente no dashboard operacional.
- [ ] **CA-28:** Gráfico de orçado vs. realizado correto para o período selecionado.
- [ ] **CA-29:** Relatório de rateio gerado no primeiro dia útil do mês.
- [ ] **CA-30:** Relatório de depreciação gerado no primeiro dia útil do mês.
- [ ] **CA-31:** Relatório mensal de licenças subutilizadas gerado corretamente.
- [ ] **CA-32:** Exportação de relatório em PDF com cabeçalho corporativo e hash SHA-256.

### 28.7 Auditoria e Compliance

- [ ] **CA-33:** `audit_log` registra todas as operações financeiras com old/new values.
- [ ] **CA-34:** RLS impede UPDATE e DELETE em `audit_log`.
- [ ] **CA-35:** Lançamentos preservados indefinidamente (sem exclusão física).
- [ ] **CA-36:** Exportação de dados financeiros requer IT_MANAGER+ e gera registro de auditoria.
- [ ] **CA-37:** Segregação de funções financeiras aplicada e impossível de contornar.
- [ ] **CA-38:** Notas fiscais armazenadas criptografadas com download via URL presigned.

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação com 28 seções, 80 regras FIN e 38 critérios de aceitação |

---

> **Próximos documentos recomendados:**
> [`43_ASSET_MANAGEMENT.md`](./43_ASSET_MANAGEMENT.md) — Módulo de Ativos (CAPEX e depreciação)
> [`47_PURCHASING.md`](./47_PURCHASING.md) — Módulo de Compras
> [`48_PROJECTS.md`](./48_PROJECTS.md) — Módulo de Projetos
