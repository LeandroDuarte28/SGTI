# SGTI — Sistema de Gestão de Tecnologia da Informação
## Módulo de Compras e Aquisições de TI — Documentação Funcional

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [24_BUSINESS_RULES.md](./24_BUSINESS_RULES.md) · [46_FINANCIAL_MANAGEMENT.md](./46_FINANCIAL_MANAGEMENT.md) · [43_ASSET_MANAGEMENT.md](./43_ASSET_MANAGEMENT.md) · [41_REQUEST_MANAGEMENT.md](./41_REQUEST_MANAGEMENT.md) · [20_DATABASE.md](./20_DATABASE.md)

---

## Sobre este Documento

Este documento define a **especificação funcional completa do Módulo de Compras e Aquisições de TI do SGTI**. Cobre conceito, tipos de aquisição, fluxo de workflow, cotações, fornecedores, contratos, aprovações, recebimento, integrações, regras de negócio e critérios de aceitação.

**Escopo exclusivo:** documentação funcional e de processo. Nenhum código, SQL ou especificação de API é gerado neste documento.

---

## Sumário

1. [Conceito de Compras de TI](#1-conceito-de-compras-de-ti)
2. [Objetivos do Módulo](#2-objetivos-do-módulo)
3. [Papéis e Responsabilidades](#3-papéis-e-responsabilidades)
4. [Solicitação de Compra](#4-solicitação-de-compra)
5. [Tipos de Aquisição](#5-tipos-de-aquisição)
6. [Workflow de Compras](#6-workflow-de-compras)
7. [Cotações](#7-cotações)
8. [Fornecedores](#8-fornecedores)
9. [Contratos de Fornecimento](#9-contratos-de-fornecimento)
10. [Aprovações](#10-aprovações)
11. [Pedido de Compra](#11-pedido-de-compra)
12. [Recebimento](#12-recebimento)
13. [Integração com Ativos](#13-integração-com-ativos)
14. [Integração Financeira](#14-integração-financeira)
15. [Integração com Projetos](#15-integração-com-projetos)
16. [Integração com Compliance](#16-integração-com-compliance)
17. [Integração com Requisições](#17-integração-com-requisições)
18. [Dashboards Operacionais](#18-dashboards-operacionais)
19. [Dashboards Executivos](#19-dashboards-executivos)
20. [Relatórios](#20-relatórios)
21. [Auditoria e Rastreabilidade](#21-auditoria-e-rastreabilidade)
22. [Regras de Negócio](#22-regras-de-negócio)
23. [Critérios de Aceitação](#23-critérios-de-aceitação)

---

## 1. Conceito de Compras de TI

### 1.1 Definição

**Compras e Aquisições de TI** é o processo estruturado pelo qual a organização identifica necessidades de recursos tecnológicos, busca fornecedores qualificados, negocia condições, formaliza a aquisição e garante a entrega adequada dos bens e serviços contratados, com rastreabilidade financeira e patrimonial completa.

No SGTI, o módulo de Compras conecta as necessidades identificadas nos outros módulos (Requisições, Projetos, Ativos) ao mercado fornecedor, garantindo que toda aquisição seja planejada, aprovada, documentada e integrada ao controle financeiro e patrimonial.

### 1.2 Diferença entre Solicitação de Serviço e Solicitação de Compra

| Conceito | Gatilho | Resultado |
|:--------:|---------|---------|
| **Requisição de Serviço** | Usuário precisa de acesso, equipamento ou serviço disponível no estoque/portfólio | Entrega com o que já existe (sem nova compra necessária) |
| **Solicitação de Compra** | Não há estoque ou o item não é do portfólio atual | Nova aquisição no mercado; entrada de bem ou serviço |

### 1.3 Ciclo Completo de Aquisição

```
CICLO DE VIDA DE UMA AQUISIÇÃO NO SGTI

1. NECESSIDADE IDENTIFICADA
   Origem: Requisição de serviço (sem estoque) · Projeto de TI · Vencimento de contrato
   Decisão: "Precisamos comprar"

2. SOLICITAÇÃO DE COMPRA
   Formalização da necessidade: item, quantidade, justificativa, CC, classificação financeira

3. COTAÇÃO
   Consulta a fornecedores: mínimo 3 cotações para compras > R$10.000
   Análise comparativa: preço, prazo, SLA, qualidade

4. APROVAÇÃO
   Por alçada de valor: Coordenador → Gestor → Gestor (step-up) → Diretoria
   Por tipo: Financeiro (orçamento) · Compliance (DPA, regulação) · TI (adequação técnica)

5. PEDIDO DE COMPRA
   Emissão formal do PO ao fornecedor selecionado
   Reserva orçamentária no módulo Financeiro

6. RECEBIMENTO
   Conferência física e documental
   Registro no inventário (hardware) ou ativação de acesso (software)
   Baixa orçamentária no módulo Financeiro

7. ENCERRAMENTO
   Avaliação do fornecedor
   Arquivamento da documentação
   Rastreabilidade para auditoria
```

### 1.4 Alinhamento com ITIL v4

No vocabulário ITIL v4, o processo de Compras está alinhado à prática de **Gestão de Fornecedores (Supplier Management)**, que visa garantir que os fornecedores da organização forneçam bens e serviços de acordo com as condições acordadas, suportando a entrega de valor aos usuários finais.

---

## 2. Objetivos do Módulo

### 2.1 Objetivo Primário

Garantir que todas as aquisições de TI sejam realizadas de forma planejada, transparente, rastreável e em conformidade com as políticas financeiras, patrimoniais e de compliance da organização.

### 2.2 Objetivos Específicos

| # | Objetivo | Indicador | Meta |
|---|----------|-----------|:----:|
| 1 | Formalização de todas as compras de TI | % compras registradas no SGTI | 100% |
| 2 | Cotação competitiva | % compras > R$10k com ≥ 3 cotações | 100% |
| 3 | Aprovação por alçada adequada | % compras aprovadas pelo nível correto | 100% |
| 4 | Rastreabilidade financeira | % compras com lançamento OPEX/CAPEX vinculado | 100% |
| 5 | Rastreabilidade patrimonial | % hardware recebido com ativo criado | 100% |
| 6 | Avaliação sistemática de fornecedores | % entregas com avaliação registrada | ≥ 90% |
| 7 | Tempo médio de ciclo de compra | Tempo da solicitação ao recebimento | Redução trimestral |
| 8 | Conformidade com políticas financeiras | % lançamentos com NF vinculada | 100% |

### 2.3 Limites do Módulo

**O módulo de Compras:**
- Gerencia o ciclo completo desde a solicitação até o recebimento.
- Integra com Financeiro, Ativos, Projetos, Compliance e Requisições.
- Não processa pagamentos (responsabilidade do financeiro corporativo).
- Não substitui o sistema de ERP para contabilidade.

---

## 3. Papéis e Responsabilidades

### 3.1 Solicitante (qualquer perfil autenticado)

**Responsabilidades:**
- Identificar a necessidade de compra e formalizar a solicitação.
- Preencher justificativa de negócio clara e completa.
- Informar o centro de custo, projeto (quando aplicável) e classificação financeira.
- Acompanhar o status da solicitação e responder quando solicitado.

**Limitações:** Não pode emitir pedido de compra. Não aprova solicitações próprias.

---

### 3.2 Analista de TI (IT_TECHNICIAN)

**Responsabilidades:**
- Registrar solicitações de compra após identificar necessidade operacional.
- Coletar cotações junto a fornecedores cadastrados.
- Registrar e comparar propostas no sistema.
- Executar o recebimento físico de itens de menor valor.
- Vincular ativos recebidos ao inventário.

---

### 3.3 Gestor de Compras / Coordenador (IT_SPECIALIST)

**Responsabilidades:**
- Aprovar solicitações de compra dentro da sua alçada (≤ R$1.000,00).
- Gerenciar o cadastro de fornecedores e contratos.
- Coordenar o processo de cotação para compras de médio valor.
- Emitir e acompanhar pedidos de compra.
- Executar recebimento e verificação de conformidade.

---

### 3.4 Gestor de TI (IT_MANAGER)

**Responsabilidades:**
- Aprovar solicitações de compra acima da alçada do Coordenador.
- Autorizar aquisições estratégicas ou acima de R$10.000 com step-up auth.
- Comunicar à Diretoria compras acima de R$50.000.
- Revisar e aprovar cancelamentos de pedidos após emissão.
- Monitorar KPIs de compras no dashboard.

**Alçada:**
- Até R$10.000: aprovação simples.
- Acima de R$10.000: aprovação com re-autenticação (step-up auth).
- Acima de R$50.000: IT_MANAGER + Diretoria.

---

### 3.5 Analista Financeiro (FINANCIAL_ANALYST)

**Responsabilidades:**
- Verificar disponibilidade orçamentária antes de aprovar financeiramente.
- Validar a classificação OPEX/CAPEX da solicitação.
- Registrar reserva orçamentária ao emitir pedido de compra.
- Confirmar baixa orçamentária no recebimento do item.
- Receber NF e registrar o lançamento definitivo.

**Segregação (SoD):** Não pode aprovar lançamentos que ele mesmo criou.

---

### 3.6 Analista de Compliance (COMPLIANCE_OFFICER)

**Responsabilidades:**
- Revisar compras com fornecedores que terão acesso a dados pessoais (DPA obrigatório).
- Verificar conformidade regulatória de compras para ambientes financeiros (BACEN, PCI DSS).
- Auditar o processo de compras para fins de certificações ISO.
- Validar contratos com cláusulas de segurança e privacidade.

---

### 3.7 Administrador (SUPER_ADMIN)

**Responsabilidades:**
- Configurar tipos de aquisição, categorias e parâmetros do módulo.
- Definir thresholds de alçada de aprovação.
- Auditar o módulo com acesso completo ao audit_log.
- Executar operações de correção de dados.

---

## 4. Solicitação de Compra

### 4.1 Campos da Solicitação de Compra (PurchaseRequest)

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **id** | UUID | Automático | Não | Identificador único |
| **Número** | String (sequencial) | Automático | Não | `PRC-YYYY-NNNNNN`. Imutável após criação. |
| **Título** | String (300) | Sim | Solicitante (DRAFT) | Resumo da necessidade. Ex.: "3 Notebooks Dell XPS 15 para equipe de desenvolvimento" |
| **Solicitante** | FK — User | Automático | Não | Usuário que criou a solicitação. Imutável. |
| **Área / Departamento** | FK — Department | Sim — automático | Solicitante | Departamento do solicitante. |
| **Beneficiário** | FK — User | Não | Solicitante | Usuário que receberá o bem/serviço, se diferente do solicitante. |
| **Tipo de Aquisição** | Enum | Sim | Solicitante (DRAFT) | Ver seção 5. |
| **Categoria** | FK — ExpenseCategory | Sim | Analista | Categoria financeira da aquisição. |
| **Classificação Financeira** | Enum | Sim | Solicitante | `OPEX` ou `CAPEX`. |
| **Justificativa** | Texto longo | Sim | Solicitante (DRAFT) | Justificativa de negócio clara e completa. Mínimo 50 caracteres. |
| **Centro de Custo** | FK — CostCenter | Sim | Solicitante | Centro de custo responsável. |
| **Projeto** | FK — Project | Não | Solicitante | Projeto ao qual a compra está vinculada. |
| **Orçamento** | FK — Budget | Não | Analista | Orçamento que suportará a compra. |
| **Urgência** | Enum | Sim | Solicitante | `NORMAL`, `HIGH`, `URGENT`. Afeta prioridade na fila. |
| **Data Necessária** | Date | Não | Solicitante | Data em que o item precisa estar disponível. |
| **Status** | Enum | Sim | Conforme fluxo | Ver seção 6. |
| **Valor Estimado** | Decimal (15,2) | Sim | Solicitante | Estimativa de custo para fins orçamentários. |
| **Moeda** | Enum | Sim | Solicitante | `BRL` (padrão), `USD`, `EUR`. |
| **Fornecedor Sugerido** | FK — Supplier | Não | Solicitante | Fornecedor preferencial (sem obrigatoriedade). |
| **Observações Técnicas** | Texto | Não | Analista | Especificações técnicas mínimas ou requisitos específicos. |
| **Requisição de Serviço** | FK — Request | Não | Automático | Requisição de serviço que originou esta solicitação de compra. |

### 4.2 Itens da Solicitação (PurchaseRequestItem)

Cada solicitação pode ter múltiplos itens. Estrutura por item:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| **Descrição do Item** | String (300) | Sim | Descrição detalhada do que está sendo solicitado |
| **Fabricante / Marca** | String (200) | Não | Para hardware: marca e modelo mínimos exigidos |
| **Especificações Técnicas** | Texto | Não | Specs mínimas obrigatórias (ex.: RAM mínimo 32GB) |
| **Quantidade** | Inteiro | Sim | Quantidade solicitada |
| **Unidade** | Enum | Sim | `UNIT`, `LICENSE`, `MONTH`, `YEAR`, `HOUR`, `OTHER` |
| **Valor Unitário Estimado** | Decimal (15,2) | Não | Estimativa por unidade |
| **Valor Total Estimado** | Decimal (15,2) | Calculado | Quantidade × Valor Unitário |
| **Categoria do Item** | FK — AssetCategory | Condicional | Obrigatório para hardware: categoria do ativo a criar |

---

## 5. Tipos de Aquisição

### 5.1 Tabela de Tipos

| Tipo | Código | Descrição | Classificação Padrão | Gera Ativo? |
|:----:|:------:|-----------|:--------------------:|:-----------:|
| **Hardware** | `HARDWARE` | Equipamentos físicos de TI | CAPEX | ✅ Obrigatório |
| **Software** | `SOFTWARE` | Pacotes de software e sistemas | CAPEX (perpétuo) / OPEX (assinatura) | Não (cria licença) |
| **Licença** | `LICENSE` | Licenças adicionais de produtos existentes | OPEX | Não |
| **Serviço** | `SERVICE` | Serviços de TI pontuais ou recorrentes | OPEX | Não |
| **Cloud** | `CLOUD` | Serviços IaaS/PaaS/SaaS | OPEX | Não |
| **Consultoria** | `CONSULTING` | Horas de consultoria técnica | OPEX (ou CAPEX se capitalizado) | Não |
| **Treinamento** | `TRAINING` | Cursos, certificações, capacitação | OPEX | Não |
| **Projeto** | `PROJECT` | Recursos para projeto específico de TI | CAPEX ou OPEX | Condicional |

### 5.2 Regras Específicas por Tipo

| Tipo | Regras Especiais |
|:----:|:----------------|
| **Hardware** | Mínimo 3 cotações para valor > R$5.000. Cria ativo obrigatoriamente ao receber. |
| **Software** | Verificar licença existente no inventário antes de comprar. Análise de segurança para software fora do portfólio. |
| **Cloud** | Aprovação da equipe de segurança para novos provedores. Contrato com cláusula de SLA e DPA obrigatória. |
| **Consultoria** | Fornecedor que terá acesso a dados pessoais requer DPA. Aprovação de Compliance para acesso a sistemas críticos. |
| **Projeto** | Vinculação obrigatória ao projeto correspondente. Custo debitado do orçamento do projeto. |

---

## 6. Workflow de Compras

### 6.1 Diagrama Completo de Status

```
 ORIGEM DA SOLICITAÇÃO
 ──────────────────────
 Requisição de Serviço sem estoque · Projeto de TI · Vencimento de contrato · Necessidade direta
             │
             ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                       RASCUNHO                               │
 │                    (Status: DRAFT)                           │
 │  Solicitante preenchendo o formulário.                       │
 │  Sem número gerado. Sem SLA. Editável livremente.            │
 └──────────────────────────┬───────────────────────────────────┘
                            │ Solicitante submete
                            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                       SUBMETIDA                              │
 │                   (Status: SUBMITTED)                        │
 │  Número PRC-YYYY-NNNNNN gerado. SLA iniciado.                │
 │  Aguardando validação técnica do Analista de TI.             │
 └──────────────────────────┬───────────────────────────────────┘
                            │ Analista valida e inicia cotação
                            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                       COTAÇÃO                                │
 │                   (Status: QUOTING)                          │
 │  Analista coleta propostas de fornecedores.                  │
 │  Compara e seleciona a melhor proposta.                      │
 └──────────────────────────┬───────────────────────────────────┘
                            │ Cotações coletadas; análise concluída
                            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                     EM APROVAÇÃO                             │
 │               (Status: PENDING_APPROVAL)                     │
 │  Fluxo de aprovação por alçada iniciado.                     │
 │  Gestor → Financeiro → Compliance (se aplicável)             │
 └──────────┬─────────────────────────────┬────────────────────┘
            │ APROVADA                    │ REJEITADA
            ▼                             ▼
 ┌──────────────────────────┐  ┌──────────────────────────────┐
 │       APROVADA           │  │       REJEITADA              │
 │   (Status: APPROVED)     │  │    (Status: REJECTED)        │
 │  Emissão do PO liberada. │  │  Terminal. Motivo obrigatório│
 └──────────┬───────────────┘  │  Solicitante notificado.     │
            │                  └──────────────────────────────┘
            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                    PEDIDO EMITIDO                            │
 │                  (Status: ORDERED)                           │
 │  Pedido de Compra (PO) formalizado e enviado ao fornecedor.  │
 │  Reserva orçamentária criada no módulo Financeiro.           │
 └──────────────────────────┬───────────────────────────────────┘
                            │ Fornecedor entrega
                            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                    EM RECEBIMENTO                            │
 │                (Status: IN_RECEIVING)                        │
 │  Item recebido. Conferência física e documental em andamento.│
 │  Ativo criado (se hardware).                                 │
 └──────────┬───────────────────────────────────┬──────────────┘
            │ Recebimento total                 │ Recebimento parcial
            ▼                                   ▼
 ┌──────────────────────────┐  ┌─────────────────────────────────┐
 │      CONCLUÍDA           │  │   PARCIALMENTE RECEBIDA         │
 │   (Status: COMPLETED)    │  │  (Status: PARTIALLY_RECEIVED)   │
 │  NF registrada.          │  │  Aguardando itens pendentes.    │
 │  Lançamento financeiro.  │  │  Prazo de entrega monitorado.   │
 │  Fornecedor avaliado.    │  └───────────────┬─────────────────┘
 └──────────────────────────┘                  │ Itens pendentes recebidos
                                               └──────→ COMPLETED

 ┌──────────────────────────────────────────────────────────────┐
 │                   CANCELADA (CANCELLED)                      │
 │  Acessível de: DRAFT, SUBMITTED, QUOTING, APPROVED, ORDERED  │
 │  Após ORDERED: exige justificativa + notificação fornecedor. │
 │  Terminal. Não reativável.                                   │
 └──────────────────────────────────────────────────────────────┘
```

### 6.2 Transições de Status Permitidas

| De | Para | Quem executa | Pré-condição |
|----|------|:------------:|:------------|
| DRAFT | SUBMITTED | Solicitante | Campos obrigatórios preenchidos; itens adicionados |
| SUBMITTED | QUOTING | Analista+ | Validação técnica concluída |
| SUBMITTED | CANCELLED | Solicitante ou IT_MANAGER+ | Justificativa obrigatória |
| QUOTING | PENDING_APPROVAL | Analista+ | Ao menos 1 cotação registrada (3 se > R$10k) |
| QUOTING | CANCELLED | IT_MANAGER+ | Justificativa obrigatória |
| PENDING_APPROVAL | APPROVED | Sistema (todas etapas aprovadas) | — |
| PENDING_APPROVAL | REJECTED | Sistema (qualquer etapa rejeitada) | Motivo obrigatório |
| APPROVED | ORDERED | Analista+ (emissão do PO) | PO criado e enviado ao fornecedor |
| APPROVED | CANCELLED | IT_MANAGER+ | Justificativa obrigatória |
| ORDERED | IN_RECEIVING | Analista+ (início do recebimento) | — |
| ORDERED | CANCELLED | IT_MANAGER+ | Justificativa + notificação ao fornecedor |
| IN_RECEIVING | PARTIALLY_RECEIVED | Sistema (recebimento parcial) | Ao menos 1 item recebido, outros pendentes |
| IN_RECEIVING | COMPLETED | Analista+ | Todos os itens recebidos + NF registrada |
| PARTIALLY_RECEIVED | COMPLETED | Analista+ | Itens restantes recebidos + NF registrada |

---

## 7. Cotações

### 7.1 Conceito de Cotação

A **Cotação (Quotation)** é o registro formal de uma proposta recebida de um fornecedor para atender à solicitação de compra. O módulo permite comparar múltiplas propostas de forma estruturada e selecionar a mais vantajosa.

### 7.2 Quando São Exigidas

| Valor Estimado da Compra | Cotações Mínimas Exigidas |
|:------------------------:|:-------------------------:|
| Até R$1.000,00 | 1 cotação (informal aceitável) |
| R$1.000,01 a R$10.000,00 | 2 cotações formais |
| Acima de R$10.000,00 | **3 cotações formais** (obrigatório) |
| Fornecedor exclusivo | Carta de exclusividade obrigatória + aprovação IT_MANAGER |

### 7.3 Campos da Cotação (Quotation)

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **id** | UUID | Automático | Não | Identificador único |
| **Solicitação de Compra** | FK — PurchaseRequest | Sim | Não | Solicitação à qual a cotação está vinculada |
| **Fornecedor** | FK — Supplier | Sim | Analista | Fornecedor que apresentou a proposta |
| **Data da Proposta** | Date | Sim | Analista | Data de emissão da proposta pelo fornecedor |
| **Validade da Proposta** | Date | Sim | Analista | Até quando a proposta é válida |
| **Número da Proposta** | String (100) | Não | Analista | Número de referência do fornecedor |
| **Prazo de Entrega** | Inteiro (dias) | Sim | Analista | Prazo em dias corridos para entrega após PO |
| **Condições de Pagamento** | Texto | Não | Analista | Ex.: "30 dias", "50% antecipado + 50% na entrega" |
| **Arquivo da Proposta** | FileReference | Não | Analista | PDF da proposta do fornecedor |
| **Status** | Enum | Sim | Analista | `RECEIVED`, `ANALYZING`, `SELECTED`, `REJECTED_BY_US` |
| **Motivo de Rejeição** | Texto | Condicional | Analista | Obrigatório ao rejeitar |
| **Selecionada Para PO** | Boolean | Automático | Não | `true` quando esta cotação originar o PO |
| **Observações** | Texto | Não | Analista | Notas sobre a proposta |

### 7.4 Itens da Cotação (QuotationItem)

Cada cotação possui itens correspondentes aos itens da solicitação:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| **Item da Solicitação** | FK — PurchaseRequestItem | Sim | Referência ao item cotado |
| **Descrição do Fornecedor** | String | Sim | Como o fornecedor descreve o item |
| **Marca / Modelo** | String | Não | Especificação do fornecedor |
| **Valor Unitário** | Decimal (15,2) | Sim | Preço unitário proposto |
| **Quantidade Cotada** | Inteiro | Sim | Quantidade disponível para o prazo |
| **Valor Total do Item** | Decimal (15,2) | Calculado | Quantidade × Valor Unitário |
| **IPI / Tributos** | Decimal (15,2) | Não | Impostos incidentes |
| **Frete** | Decimal (15,2) | Não | Custo de frete (se destacado) |
| **Valor Total com Impostos** | Decimal (15,2) | Calculado | Total + IPI + Frete |

### 7.5 Comparativo de Cotações

Ao ter ao menos 2 cotações registradas, o sistema exibe automaticamente um **quadro comparativo**:

```
QUADRO COMPARATIVO DE COTAÇÕES — PRC-2026-000042

Item: Dell XPS 15 9520 (3 unidades)

Critério              │ Fornecedor A │ Fornecedor B │ Fornecedor C │
──────────────────────┼──────────────┼──────────────┼──────────────┤
Valor Unitário        │ R$ 8.500,00  │ R$ 8.200,00  │ R$ 8.750,00  │
Valor Total (3 un.)   │ R$ 25.500,00 │ R$ 24.600,00 │ R$ 26.250,00 │
Prazo de Entrega      │ 10 dias      │ 15 dias      │ 7 dias       │
Garantia              │ 3 anos       │ 1 ano        │ 3 anos       │
Nota do Fornecedor    │ ★★★★☆ (4.2) │ ★★★☆☆ (3.1) │ ★★★★★ (4.8) │
Validade da Proposta  │ 30/06/2026   │ 30/06/2026   │ 25/06/2026   │
Avaliação SGTI        │ 🟡 Boa       │ 🔴 Atenção   │ 🟢 Melhor    │

Recomendação automática: Fornecedor C (melhor custo-benefício)
Justificativa: menor prazo + melhor avaliação; diferença de R$750 vs A
```

### 7.6 Seleção da Cotação Vencedora

O Analista ou Gestor seleciona a cotação vencedora registrando:
- Fornecedor selecionado.
- Justificativa da seleção (obrigatória se não for o menor preço).
- Cotações rejeitadas ficam com motivo registrado.

---

## 8. Fornecedores

### 8.1 Campos do Cadastro de Fornecedor (Supplier)

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **id** | UUID | Automático | Não | Identificador único |
| **Razão Social** | String (300) | Sim | FINANCIAL_ANALYST+ | Nome oficial da empresa |
| **Nome Fantasia** | String (300) | Não | FINANCIAL_ANALYST+ | Nome comercial |
| **CNPJ** | String (18) | Sim (PJ) | Não após criar | Formato XX.XXX.XXX/XXXX-XX. Validado. Único por tenant. |
| **CPF** | String (14) | Condicional (PF) | Não após criar | Para fornecedores pessoa física (ex.: consultores autônomos) |
| **Tipo** | Enum | Sim | FINANCIAL_ANALYST+ | `HARDWARE`, `SOFTWARE`, `SERVICE`, `CLOUD`, `TELECOM`, `CONSULTING`, `TRAINING`, `OTHER` |
| **Website** | URL | Não | FINANCIAL_ANALYST+ | Site oficial |
| **E-mail Comercial** | String (255) | Sim | FINANCIAL_ANALYST+ | E-mail para contato comercial e envio de POs |
| **Telefone Comercial** | String (20) | Não | FINANCIAL_ANALYST+ | Telefone principal |
| **Contato Principal — Nome** | String (200) | Sim | FINANCIAL_ANALYST+ | Nome do executivo de conta |
| **Contato Principal — E-mail** | String (255) | Sim | FINANCIAL_ANALYST+ | E-mail do gestor de conta |
| **Contato Técnico — Nome** | String (200) | Não | FINANCIAL_ANALYST+ | Suporte técnico / pós-venda |
| **Contato Técnico — E-mail** | String (255) | Não | FINANCIAL_ANALYST+ | E-mail do suporte técnico |
| **Endereço** | Texto | Não | FINANCIAL_ANALYST+ | Endereço completo |
| **Endereço de Entrega** | Texto | Não | FINANCIAL_ANALYST+ | Se diferente do comercial |
| **Prazo Padrão de Entrega** | Inteiro (dias) | Não | Calculado | Média histórica de dias de entrega |
| **Avaliação Geral** | Decimal (3,1) | Calculado | Não | Média ponderada das avaliações |
| **Taxa de Entrega no Prazo** | Decimal (5,2) | Calculado | Não | % entregas dentro do prazo acordado |
| **Total Comprado** | Decimal (15,2) | Calculado | Não | Valor total de POs recebidos |
| **Situação Receita Federal** | Enum | Verificado | Não | `REGULAR`, `IRREGULAR`, `SUSPENDED`, `UNKNOWN` |
| **Possui DPA** | Boolean | Não | COMPLIANCE_OFFICER | `true` se DPA foi assinado (necessário para fornecedores com acesso a dados pessoais) |
| **Data do DPA** | Date | Condicional | COMPLIANCE_OFFICER | Data de assinatura do DPA |
| **is_active** | Boolean | Sim | FINANCIAL_ANALYST+ | Fornecedores inativos não aparecem para seleção |
| **Motivo da Inativação** | Texto | Condicional | FINANCIAL_ANALYST+ | Obrigatório ao inativar |

### 8.2 Avaliação de Fornecedor

Após cada recebimento de compra ou conclusão de serviço, o Analista registra a avaliação:

| Critério | Peso | Escala |
|:--------:|:----:|:------:|
| Cumprimento do prazo de entrega | 40% | 1–5 |
| Qualidade do produto / serviço entregue | 40% | 1–5 |
| Qualidade do atendimento e suporte pós-venda | 20% | 1–5 |

**Avaliação Geral** = Soma ponderada dos três critérios.

### 8.3 Indicadores Históricos do Fornecedor

Na página do fornecedor, o sistema exibe:
- Número total de pedidos (abertos e fechados).
- Valor total comprado no ano e histórico.
- Avaliação média com gráfico de evolução.
- Número de entregas no prazo vs. fora do prazo.
- Contratos ativos vinculados.
- Incidentes abertos relacionados ao fornecedor.

---

## 9. Contratos de Fornecimento

### 9.1 Tipos de Contrato

| Tipo | Código | Exemplos |
|:----:|:------:|---------|
| **Fornecimento de Hardware** | `HARDWARE_SUPPLY` | Contrato de fornecimento de equipamentos |
| **Licença de Software** | `SOFTWARE_LICENSE` | Contrato de licenciamento Enterprise |
| **SaaS / Assinatura** | `SAAS_SUBSCRIPTION` | Contrato anual de plataforma SaaS |
| **Serviço Gerenciado** | `MANAGED_SERVICE` | Contrato de serviço recorrente |
| **Consultoria** | `CONSULTING` | Contrato de horas de consultoria |
| **Manutenção / Suporte** | `MAINTENANCE` | Contrato de suporte e manutenção |
| **Treinamento** | `TRAINING` | Contrato de capacitação anual |
| **Outro** | `OTHER` | Contratos fora das categorias acima |

### 9.2 Campos do Contrato

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **id** | UUID | Automático | Não | Identificador único |
| **Código** | String (sequencial) | Automático | Não | `CTR-YYYY-NNNNNN`. Imutável. |
| **Título** | String (300) | Sim | FINANCIAL_ANALYST+ | Nome descritivo do contrato |
| **Tipo** | Enum | Sim | Não após criar | Tipo do contrato (tabela acima) |
| **Fornecedor** | FK — Supplier | Sim | Não após criar | Fornecedor contratado |
| **Objeto do Contrato** | Texto | Sim | FINANCIAL_ANALYST+ | Descrição do que está contratado |
| **Data de Início** | Date | Sim | FINANCIAL_ANALYST+ | Início da vigência |
| **Data de Fim** | Date | Sim | FINANCIAL_ANALYST+ | Término da vigência |
| **Vigência (meses)** | Inteiro — calculado | Não | Não | Calculado: (Data Fim − Data Início) em meses |
| **Renovação Automática** | Boolean | Sim | FINANCIAL_ANALYST+ | `true` = renova automaticamente |
| **Dias de Alerta Renovação** | Inteiro | Sim | FINANCIAL_ANALYST+ | Padrão: 90 dias |
| **Valor Total** | Decimal (15,2) | Sim | FINANCIAL_ANALYST+ | Valor total do contrato |
| **Valor Mensal** | Decimal (15,2) | Condicional | FINANCIAL_ANALYST+ | Para contratos mensais |
| **Classificação Financeira** | Enum | Sim | FINANCIAL_ANALYST+ | `OPEX` ou `CAPEX` |
| **Centro de Custo** | FK — CostCenter | Sim | FINANCIAL_ANALYST+ | Centro que arca com o custo |
| **Solicitação de Origem** | FK — PurchaseRequest | Não | Automático | PRC que originou o contrato |
| **Arquivo do Contrato** | FileReference | Não | FINANCIAL_ANALYST+ | PDF do contrato assinado |
| **Possui DPA** | Boolean | Condicional | COMPLIANCE_OFFICER | Para fornecedores com acesso a dados pessoais |
| **SLA Contratado** | Texto | Não | FINANCIAL_ANALYST+ | SLA do fornecedor conforme contrato |
| **Penalidades** | Texto | Não | FINANCIAL_ANALYST+ | Multas contratuais por não cumprimento |
| **Responsável** | FK — User | Sim | FINANCIAL_ANALYST+ | Responsável pela gestão do contrato |
| **Status** | Enum | Sim | Conforme fluxo | `DRAFT`, `ACTIVE`, `EXPIRING_SOON`, `EXPIRED`, `CANCELLED`, `RENEWED` |

### 9.3 Alertas de Vencimento de Contrato

| Marco | Destinatário | Canal |
|:-----:|:------------:|:-----:|
| 90 dias antes | Responsável + IT_MANAGER | In-app + e-mail |
| 60 dias antes | Responsável + IT_MANAGER | In-app + e-mail |
| 30 dias antes | Responsável + IT_MANAGER | E-mail urgente |
| 2 dias antes | IT_MANAGER | E-mail crítico |
| Expirado | IT_MANAGER | Alerta diário |

---

## 10. Aprovações

### 10.1 Fluxo de Aprovação por Alçada de Valor

| Valor Estimado | Aprovadores |
|:--------------:|:----------:|
| Até R$1.000,00 | Coordenador (IT_SPECIALIST) |
| R$1.000,01 a R$10.000,00 | IT_MANAGER |
| Acima de R$10.000,00 | IT_MANAGER com step-up auth (re-autenticação obrigatória) |
| Acima de R$50.000,00 | IT_MANAGER + Diretoria |

**Referência:** BR-PRC-003

### 10.2 Aprovação do Gestor Direto

**Presente em:** todas as solicitações como primeira etapa.

**O que o Gestor valida:**
- A necessidade é real e justificada para a função do solicitante?
- A data necessária é compatível com o tempo de aquisição?
- O centro de custo informado está correto?
- A classificação OPEX/CAPEX está correta para este tipo de gasto?

**Segregação (SoD):** O Gestor não pode aprovar solicitação que ele mesmo criou.

### 10.3 Aprovação Financeira

**Presente em:** solicitações com valor estimado > R$0.

**O que o Financeiro valida:**
- Existe saldo disponível no orçamento do centro de custo?
- O tipo de gasto está dentro do orçamento aprovado para o período?
- O número de cotações é suficiente para o valor solicitado?
- A proposta vencedora representa a melhor relação custo-benefício?

### 10.4 Aprovação de Compliance

**Presente em:** situações com implicação regulatória.

| Situação | Por que Compliance entra |
|----------|:------------------------:|
| Fornecedor com acesso a dados pessoais | DPA obrigatório (LGPD) |
| Software de segurança ou monitoramento | Adequação à política de segurança |
| Fornecedor de infraestrutura crítica | Análise de risco de cadeia de fornecimento |
| Aquisição para ambiente de dados de cartão | Conformidade PCI DSS |
| Contratação de consultoria com acesso a sistemas | Controle de acesso e confidencialidade |

### 10.5 Aprovação de TI

**Presente em:** software novo (fora do portfólio homologado), hardware fora do padrão.

**O que TI valida:**
- O software é compatível com o ambiente corporativo?
- Há risco de segurança no produto solicitado?
- O hardware atende às especificações mínimas do padrão corporativo?
- Há licença existente disponível antes de aprovar nova compra?

### 10.6 Delegação de Aprovação

Mesmo fluxo do módulo de Requisições:
- Aprovador pode delegar durante ausências.
- Delegado deve ter papel compatível (mínimo igual).
- Delegação registrada em `PurchaseApprovalHistory` com motivo.

---

## 11. Pedido de Compra

### 11.1 Conceito

O **Pedido de Compra (PurchaseOrder — PO)** é o documento formal emitido pela organização ao fornecedor selecionado, formalizando a intenção de compra e servindo como base contratual para a entrega.

No SGTI, o PO só pode ser criado a partir de uma `PurchaseRequest` com status `APPROVED`.

**Referência:** BR-PRC-001

### 11.2 Campos do Pedido de Compra

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **id** | UUID | Automático | Não | Identificador único |
| **Número** | String (sequencial) | Automático | Não | `PO-YYYY-NNNNNN`. Imutável. |
| **Solicitação de Origem** | FK — PurchaseRequest | Sim | Não | PRC que originou o PO |
| **Cotação Selecionada** | FK — Quotation | Sim | Não | Proposta vencedora do processo de cotação |
| **Fornecedor** | FK — Supplier | Sim | Não | Herdado da cotação selecionada |
| **Status** | Enum | Sim | Conforme fluxo | `DRAFT`, `SENT`, `CONFIRMED`, `IN_DELIVERY`, `PARTIALLY_RECEIVED`, `RECEIVED`, `CANCELLED` |
| **Data de Emissão** | Date | Automático | Não | Data de criação do PO |
| **Data de Envio ao Fornecedor** | Date | Automático | Não | Data em que o PO foi enviado |
| **Prazo de Entrega Acordado** | Date | Sim | Analista+ | Data acordada para entrega |
| **Valor Total do PO** | Decimal (15,2) | Calculado | Não | Soma dos itens do PO |
| **Arquivo do PO** | FileReference | Não | Analista+ | PDF gerado do PO para envio ao fornecedor |
| **Confirmação do Fornecedor** | FileReference | Não | Analista+ | Confirmação/aceite do fornecedor |
| **Reserva Orçamentária** | FK — Budget | Automático | Não | Orçamento que terá o valor comprometido |
| **Contrato Vinculado** | FK — Contract | Não | Analista+ | Contrato que ampara o PO (para compras recorrentes) |
| **Emitido Por** | FK — User | Automático | Não | Quem emitiu o PO |
| **Observações** | Texto | Não | Analista+ | Condições especiais, instruções de entrega |

### 11.3 Itens do Pedido de Compra (PurchaseOrderItem)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| **Item da Cotação** | FK — QuotationItem | Sim | Referência ao item da proposta vencedora |
| **Descrição** | String | Sim | Descrição do item no PO |
| **Quantidade Pedida** | Inteiro | Sim | Quantidade a entregar |
| **Valor Unitário** | Decimal (15,2) | Sim | Preço unitário acordado |
| **Valor Total** | Decimal (15,2) | Calculado | Quantidade × Valor Unitário |
| **Quantidade Recebida** | Inteiro | Automático | Atualizado a cada registro de recebimento |
| **Status do Item** | Enum | Automático | `PENDING`, `PARTIALLY_RECEIVED`, `RECEIVED` |
| **Ativo Gerado** | FK — Asset | Condicional | Para hardware: ativo criado ao receber |

### 11.4 Geração e Envio do PO

```
FLUXO DE EMISSÃO DO PEDIDO DE COMPRA

1. Analista clica "Emitir Pedido de Compra" na solicitação APPROVED
2. Sistema pré-preenche o PO com dados da cotação selecionada
3. Analista confirma: prazo de entrega, condições, observações
4. Sistema gera PDF do PO com número, logotipo e assinatura digital
5. Status → DRAFT → SENT
6. Módulo Financeiro:
   → Reserva orçamentária criada: Budget.committed_amount += valor_total
7. Notificação ao Financeiro: "PO PO-2026-000042 emitido — R$ 25.500,00 comprometidos"
8. E-mail com PDF do PO enviado ao e-mail comercial do fornecedor
9. Solicitante notificado: "Pedido de compra emitido para {nome_fornecedor}"
```

---

## 12. Recebimento

### 12.1 Fluxo Completo de Recebimento

```
 ETAPA 1: NOTIFICAÇÃO DE ENTREGA
 ─────────────────────────────────
 Fornecedor entrega fisicamente ou notifica disponibilidade (software/serviço).
 Analista designado para o recebimento inicia o processo no SGTI.
           │
           ▼
 ETAPA 2: CONFERÊNCIA FÍSICA
 ─────────────────────────────
 Para hardware / periféricos:
   → Verificar quantidades entregues vs. pedidas
   → Verificar integridade das embalagens
   → Verificar modelos e especificações (conf. PO)
   → Verificar número de série vs. NF (quando aplicável)

 Para software / licenças:
   → Verificar chaves de licença ou credenciais de acesso
   → Testar ativação em ambiente de homologação

 Para serviços:
   → Verificar entrega dos produtos acordados (relatório, consultoria, etc.)
   → Validar SLA cumprido (quando aplicável)
           │
           ▼
 ETAPA 3: REGISTRO NO SGTI
 ──────────────────────────
 Para cada PurchaseOrderItem:
   → Informar quantidade efetivamente recebida
   → Registrar condição na entrega (GOOD / DAMAGED / INCOMPLETE)
   → Registrar número de série (hardware)
   → Informar número da NF

 Para hardware: OBRIGATÓRIO criar ativo no inventário:
   → Sistema redireciona para formulário de cadastro de ativo
   → Ativo vinculado ao item do PO automaticamente
   → CapexInvestment criado no módulo Financeiro

 Para software: ativar licença no inventário de licenças
           │
           ▼
 ETAPA 4: REGISTRO DOCUMENTAL
 ────────────────────────────
 → Número da NF registrado no recebimento
 → Arquivo da NF anexado (obrigatório para CAPEX)
 → Data de recebimento registrada
 → Responsável pelo recebimento registrado
           │
           ▼
 ETAPA 5: BAIXA ORÇAMENTÁRIA
 ────────────────────────────
 Ao completar o recebimento (todos os itens):
   → Evento ItemsReceived publicado no EventBus
   → Módulo Financeiro:
      Budget.committed_amount -= valor_total
      Budget.spent_amount += valor_total
      CapexInvestment.status = ACTIVE (para CAPEX)
      OpexExpense criado (para OPEX)
           │
           ▼
 ETAPA 6: AVALIAÇÃO DO FORNECEDOR
 ──────────────────────────────────
 → Analista avalia o fornecedor (3 critérios)
 → Avaliação registrada no histórico do fornecedor
 → Média atualizada automaticamente
           │
           ▼
 ETAPA 7: CONCLUSÃO
 ──────────────────
 → PO.status = RECEIVED
 → PurchaseRequest.status = COMPLETED
 → Solicitante notificado: "Sua compra foi recebida e processada"
 → Documento arquivado para auditoria
```

### 12.2 Campos do Recebimento (ReceiptRecord)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| **Data de Recebimento** | Date | Sim | Data efetiva de recebimento |
| **Responsável pelo Recebimento** | FK — User | Automático | Quem executou o recebimento |
| **Número da NF** | String (100) | Sim (CAPEX) / Condicional (OPEX) | Número da nota fiscal |
| **Data da NF** | Date | Sim | Data de emissão da NF |
| **Valor na NF** | Decimal (15,2) | Sim | Valor conforme NF (pode diferir do PO) |
| **Arquivo da NF** | FileReference | Sim (CAPEX) | Anexo da nota fiscal |
| **Condição do Recebimento** | Enum | Sim | `COMPLETE_GOOD`, `PARTIAL`, `DAMAGED` |
| **Observações** | Texto | Não | Notas sobre o recebimento, divergências |
| **Avaliação do Fornecedor** | FK — SupplierRating | Não | Avaliação do fornecedor neste recebimento |

### 12.3 Recebimento Parcial

Quando o fornecedor entrega apenas parte dos itens do PO:

- PO.status → `PARTIALLY_RECEIVED`.
- Módulo registra itens recebidos e mantém pendentes.
- Prazo de entrega dos itens pendentes monitorado.
- Alerta ao IT_MANAGER quando prazo excedido.
- Saldo orçamentário comprometido permanece até recebimento total.

### 12.4 Divergência entre NF e PO

Quando o valor da NF difere do valor do PO:

| Situação | Ação |
|----------|------|
| Valor NF < Valor PO | Lançamento pelo valor da NF; saldo não utilizado liberado |
| Valor NF > Valor PO até 5% | Registrado com alerta ao Financeiro para validação |
| Valor NF > Valor PO acima de 5% | Bloqueio do recebimento; IT_MANAGER notificado para decisão |

---

## 13. Integração com Ativos

### 13.1 Criação Obrigatória de Ativo para Hardware

**Regra:** Ao receber qualquer item de categoria HARDWARE ou PERIPHERAL, o sistema **obriga** a criação do ativo no módulo de Gestão de Ativos antes de concluir o recebimento.

**Referência:** BR-PRC-005

```
FLUXO DE CRIAÇÃO DE ATIVO NO RECEBIMENTO

Item de hardware recebido →
  Sistema exibe formulário de cadastro de ativo:
    Campos pré-preenchidos: nome, categoria, fornecedor, valor (da NF)
    Campos a completar: asset_tag (ou gerado automaticamente), localização, serial

  Analista confirma e salva o ativo.
  Asset.status = RECEIVED
  PurchaseOrderItem.asset_id = asset.id
  CapexInvestment.asset_id = asset.id
  Recebimento concluído ✓
```

### 13.2 Rastreabilidade Bidirecional PO ↔ Ativo

| No PO | No Ativo |
|:-----:|:--------:|
| Link para o ativo criado | Link para o PO de origem |
| Número do PO visível no histórico do ativo | Data de aquisição = data de recebimento do PO |
| Valor do PO como valor de aquisição do ativo | NF do PO vinculada ao ativo |

---

## 14. Integração Financeira

### 14.1 CAPEX — Investimentos em Ativos

Para compras classificadas como CAPEX:

```
CAPEX — INTEGRAÇÃO FINANCEIRA

Ao emitir o PO (ORDERED):
  → Budget.committed_amount += valor_total_PO

Ao receber o item (RECEIVED):
  → Budget.committed_amount -= valor_total_PO
  → Budget.spent_amount += valor_NF
  → CapexInvestment criado:
      valor = valor_NF
      data_aquisição = data_recebimento
      life_time = conforme categoria do ativo
      método depreciação = STRAIGHT_LINE (padrão)
      status = ACTIVE → depreciação iniciada no próximo mês

Ao descomissionar o ativo:
  → CapexInvestment.status = WRITTEN_OFF
  → current_value = 0
```

### 14.2 OPEX — Despesas Operacionais

Para compras classificadas como OPEX (serviços, licenças, SaaS):

```
OPEX — INTEGRAÇÃO FINANCEIRA

Ao emitir o PO (ORDERED):
  → Budget.committed_amount += valor_total_PO

Ao receber / confirmar entrega (COMPLETED):
  → Budget.committed_amount -= valor_total_PO
  → Budget.spent_amount += valor_NF
  → OpexExpense criado:
      valor = valor_NF
      data_competência = mês/ano do recebimento
      categoria = conforme tipo do item
      status = APPROVED (automático se NF anexada)
```

### 14.3 Reserva Orçamentária

A reserva orçamentária garante que o saldo disponível reflita todos os comprometimentos:

```
Saldo Disponível = Budget.approved_amount
                 - Budget.spent_amount
                 - Budget.committed_amount

Committed_amount aumenta ao emitir o PO.
Committed_amount diminui e Spent_amount aumenta ao receber.
```

---

## 15. Integração com Projetos

### 15.1 Solicitação de Compra Vinculada a Projeto

Quando uma solicitação tem `project_id` preenchido:

- O custo é debitado automaticamente do orçamento do projeto (OPEX ou CAPEX).
- O PROJECT_MANAGER recebe notificação de cada compra vinculada ao projeto.
- O dashboard do projeto exibe a compra como despesa do projeto.
- O relatório financeiro do projeto inclui todas as compras vinculadas.

### 15.2 Visibilidade no Portfólio de Projetos

| No Projeto | Na Solicitação de Compra |
|:-----------:|:------------------------:|
| Lista de POs vinculados com status e valor | Campo projeto_id com link direto |
| Custo total de compras realizadas vs. orçado | Orçamento disponível do projeto exibido ao solicitante |

---

## 16. Integração com Compliance

### 16.1 DPA — Data Processing Agreement

Para compras que envolvam fornecedor com acesso a dados pessoais:
- Campo `dpa_required` marcado automaticamente quando tipo = CLOUD, SAAS ou CONSULTING.
- Aprovação de Compliance bloqueada sem DPA registrado no cadastro do fornecedor.
- Evidência do DPA gerada automaticamente no módulo de Compliance ao aprovar.

### 16.2 Auditoria de Aquisições

O COMPLIANCE_OFFICER pode auditar o processo de compras:

- Consultar todas as solicitações com filtros por tipo, fornecedor, valor, período.
- Verificar se cotações obrigatórias foram coletadas.
- Verificar segregação de funções nas aprovações.
- Gerar relatório de aquisições para fins de auditoria ISO 27001 (A.15 — Relações com Fornecedores).

### 16.3 Conformidade PCI DSS e BACEN

Para aquisições em ambientes financeiros regulados:
- Compras de hardware/software para ambientes de dados de cartão (CDE) passam por etapa adicional de análise de compliance.
- Fornecedores para ambientes BACEN validados contra lista de credenciados.

---

## 17. Integração com Requisições

### 17.1 Requisição de Serviço como Origem de Compra

Quando uma requisição de serviço não pode ser atendida com estoque existente:

```
Analista executa requisição APPROVED:
  "Item não disponível em estoque"
  → Botão "Criar Solicitação de Compra"
  → Sistema pré-preenche:
     título, item, quantidade, centro de custo, projeto
     service_request_id = requisição.id

Solicitação de Compra criada com rastreabilidade à requisição de origem.
Ao receber a compra: analista retorna para a requisição e executa a entrega.
```

### 17.2 Rastreabilidade Completa

```
Ciclo rastreável:
  Usuário → Requisição de Serviço (REQ-2026-000042)
         → Solicitação de Compra (PRC-2026-000018)
           → Pedido de Compra (PO-2026-000007)
             → Recebimento + Ativo (NB-2026-0042)
               → Lançamento CAPEX (CPX-2026-000003)
```

---

## 18. Dashboards Operacionais

### 18.1 Painel Operacional de Compras

**Destino:** Analistas, Coordenadores, IT_MANAGER, Financeiro. Tempo real.

| Componente | Dados Exibidos |
|------------|---------------|
| **Compras Abertas** | Contadores por status: SUBMITTED / QUOTING / PENDING_APPROVAL / APPROVED / ORDERED |
| **Aguardando Aprovação** | Lista com valor, tipo, solicitante e prazo |
| **Compras em Atraso** | Pedidos com prazo de entrega vencido sem recebimento |
| **Recebimentos Pendentes** | POs com status ORDERED há > 5 dias sem início de recebimento |
| **Cotações a Vencer** | Propostas com validade expirando em ≤ 7 dias |
| **Contratos Vencendo (90 dias)** | Lista por fornecedor e data |
| **Compras por Fornecedor** | Volume e valor por fornecedor no mês |
| **Compras por Categoria** | Distribuição por tipo de aquisição |

### 18.2 Indicadores Operacionais

| KPI | Fórmula | Meta |
|-----|---------|:----:|
| **Compras Abertas** | COUNT(status ≠ COMPLETED, REJECTED, CANCELLED) | — |
| **Compras Concluídas (mês)** | COUNT(COMPLETED no mês) | Tendência crescente |
| **Em Atraso** | COUNT(prazo_entrega < hoje AND status ≠ COMPLETED) | 0 |
| **Tempo Médio de Ciclo** | AVG(completed_at − submitted_at) em dias úteis | Redução trimestral |
| **Taxa de Conformidade de Cotação** | COUNT(> R$10k com 3+ cotações) / COUNT(> R$10k) × 100 | 100% |
| **Compras Sem NF** | COUNT(CAPEX sem invoice_number) | 0 |

---

## 19. Dashboards Executivos

### 19.1 Painel Executivo de Compras

**Destino:** IT_MANAGER, Diretoria/CFO.

| Indicador | Composição | Objetivo |
|:----------:|-----------|---------|
| **OPEX por Fornecedor** | SUM(valor_OPEX) agrupado por fornecedor | Concentração de gastos |
| **CAPEX por Fornecedor** | SUM(valor_CAPEX) agrupado por fornecedor | Dependência de fornecedores |
| **Gastos por Área** | SUM(valor) agrupado por departamento/CC | Distribuição de custos |
| **Gastos por Projeto** | SUM(valor) agrupado por projeto | Controle de orçamento de projetos |
| **Contratos Próximos ao Vencimento** | Contratos com `end_date ≤ hoje + 90 dias` | Gestão de renovações |
| **Evolução de Compras** | Valor mensal de compras concluídas nos últimos 12 meses | Tendência de gastos |
| **Top 10 Fornecedores** | Por valor total do ano | Negociações estratégicas |
| **Taxa de Entrega no Prazo** | COUNT(entregues no prazo) / COUNT(total entregas) × 100 | Qualidade de fornecedores |
| **Saving Gerado** | SUM(valor_estimado − valor_PO) para compras concluídas | Economia obtida no processo |

### 19.2 Gráficos Executivos

| Gráfico | Tipo | Objetivo |
|---------|:----:|---------|
| OPEX vs. CAPEX em compras por mês | Barras agrupadas | Composição dos gastos |
| Top 10 fornecedores por valor | Barras horizontais | Concentração |
| Gastos por área (pizza) | Pizza | Distribuição proporcional |
| Ciclo médio de compra por tipo | Barras | Eficiência do processo |
| Saving acumulado no ano | Linha | Economia gerada |

---

## 20. Relatórios

### 20.1 Relatórios Operacionais Automáticos

| Relatório | Geração | Destinatário | Conteúdo |
|-----------|:-------:|:------------:|---------|
| **Compras em Atraso** | Diária | IT_MANAGER | POs com prazo vencido sem recebimento |
| **Aprovações Pendentes** | Diária | Aprovadores | Lista de solicitações aguardando decisão |
| **Contratos Vencendo** | Semanal | IT_MANAGER + FINANCIAL_ANALYST | Contratos nos próximos 90 dias |
| **Cotações a Vencer** | Semanal | Analistas | Propostas com validade ≤ 7 dias |

### 20.2 Relatórios Gerenciais

| Relatório | Frequência | Destinatário | Conteúdo |
|-----------|:----------:|:------------:|---------|
| **Compras do Mês** | Mensal | IT_MANAGER + FINANCIAL_ANALYST | Volume, valor, por tipo e fornecedor |
| **Avaliação de Fornecedores** | Trimestral | IT_MANAGER + Compras | Notas, prazo médio, taxa de conformidade |
| **Contratos Ativos** | Mensal | IT_MANAGER + FINANCIAL_ANALYST | Todos os contratos com status e vencimento |
| **Compras por Projeto** | Mensal | IT_MANAGER + PROJECT_MANAGER | Realizado vs. orçado por projeto |

### 20.3 Relatórios Executivos

| Relatório | Frequência | Destinatário | Conteúdo |
|-----------|:----------:|:------------:|---------|
| **Panorama de Compras TI** | Trimestral | Diretoria + IT_MANAGER | OPEX/CAPEX, fornecedores estratégicos, saving |
| **Análise de Fornecedores** | Semestral | Diretoria + IT_MANAGER | Dependência, avaliações, riscos de cadeia |

---

## 21. Auditoria e Rastreabilidade

### 21.1 Eventos Auditados Obrigatoriamente

| Evento | `action` | Dados Capturados |
|--------|:--------:|:----------------:|
| Solicitação criada | CREATE | Todos os campos + solicitante |
| Solicitação alterada | UPDATE | Campo + old_value + new_value |
| Status alterado | UPDATE | Status anterior + novo + executado_por |
| Cotação registrada | CREATE | Fornecedor + valor + prazo + analista |
| Cotação selecionada | UPDATE | Cotação selecionada + justificativa |
| Cotação rejeitada | UPDATE | Cotação rejeitada + motivo |
| Aprovação realizada | CREATE | Etapa + decisão + aprovador + timestamp |
| Aprovação rejeitada | CREATE | Etapa + motivo + aprovador + timestamp |
| PO emitido | CREATE | Todos os campos + emitido_por |
| PO cancelado | UPDATE | Status CANCELLED + motivo + notificação |
| Recebimento iniciado | CREATE | Responsável + data + PO vinculado |
| Item recebido | CREATE | Item + quantidade + condição + serial |
| Ativo criado no recebimento | CREATE | asset_id + po_item_id |
| NF registrada | UPDATE | Número NF + valor + arquivo |
| Lançamento financeiro criado | CREATE | Tipo (OPEX/CAPEX) + valor + budget |
| Fornecedor avaliado | CREATE | Critérios + notas + avaliador |
| Contrato criado/alterado | CREATE/UPDATE | Todos os campos relevantes |
| Cancelamento | UPDATE | Status CANCELLED + motivo |

### 21.2 Trilha de Aprovações de Compra

`purchase.PurchaseApprovalHistory` preserva o histórico completo de cada decisão com: etapa, aprovador, decisão, timestamp, IP do aprovador e motivo (quando rejeitado).

---

## 22. Regras de Negócio

As regras a seguir complementam as regras BR-PRC-001 a BR-PRC-008 definidas em `Docs/24_BUSINESS_RULES.md`.

---

**PRC-001** — PO só pode ser criado a partir de requisição aprovada
Não é possível criar um PurchaseOrder sem um PurchaseRequest com status APPROVED. Criação direta de PO sem requisição é bloqueada.
**Referência:** BR-PRC-001

---

**PRC-002** — Aprovação por alçada conforme valor estimado
O sistema determina automaticamente os aprovadores conforme o valor estimado: Coordenador (≤ R$1k), Gestor (≤ R$10k), Gestor com step-up auth (> R$10k), + Diretoria (> R$50k).
**Referência:** BR-PRC-003

---

**PRC-003** — Hardware recebido gera ativo obrigatoriamente
Item recebido de categoria HARDWARE ou PERIPHERAL obriga a criação de ativo no módulo ITAM antes de concluir o recebimento.
**Referência:** BR-PRC-005

---

**PRC-004** — Recebimento parcial permitido com status PARTIALLY_RECEIVED
O sistema aceita recebimento de parte dos itens do PO, alterando o status para PARTIALLY_RECEIVED e mantendo controle dos itens pendentes.
**Referência:** BR-PRC-004

---

**PRC-005** — Cancelamento de PO emitido exige justificativa e notificação ao fornecedor
Cancelamento de PO com status SENT ou CONFIRMED requer justificativa formal e notificação ao FINANCIAL_ANALYST para comunicação ao fornecedor.
**Referência:** BR-PRC-006

---

**PRC-006** — Fornecedor sem CNPJ válido não pode ser cadastrado como ativo
CNPJ validado com verificador de dígito. Fornecedores PJ sem CNPJ válido são bloqueados.
**Referência:** BR-PRC-007

---

**PRC-007** — Recebimento integral baixa reserva orçamentária automaticamente
Quando todos os itens são recebidos, evento ItemsReceived é publicado e o módulo Financeiro baixa o valor do committed_amount e aumenta o spent_amount.
**Referência:** BR-PRC-008

---

**PRC-008** — Toda compra deve possuir justificativa
O campo `justification` é obrigatório com mínimo de 50 caracteres. Justificativas genéricas são rejeitadas pela validação.

---

**PRC-009** — Toda compra deve possuir classificação financeira
O campo `classification` (OPEX ou CAPEX) é obrigatório. Solicitação sem classificação não pode ser submetida.

---

**PRC-010** — Toda compra deve possuir centro de custo
O campo `cost_center_id` é obrigatório. Centro de custo deve estar ativo para ser selecionado.

---

**PRC-011** — Toda compra deve possuir responsável
O campo `requester_id` (solicitante) é obrigatório e imutável após criação.

---

**PRC-012** — Compras de hardware devem gerar ativos
Item de tipo HARDWARE não pode ter recebimento concluído sem asset_id preenchido.

---

**PRC-013** — Compras vinculadas a projetos devem registrar projeto
Quando o tipo de aquisição é PROJECT, o campo `project_id` é obrigatório.

---

**PRC-014** — Toda cotação deve possuir fornecedor
O campo `supplier_id` da cotação é obrigatório. Cotação sem fornecedor é bloqueada.

---

**PRC-015** — Compras > R$10.000: mínimo 3 cotações obrigatórias
Solicitação com valor estimado > R$10.000 não pode avançar para PENDING_APPROVAL com menos de 3 cotações registradas e aprovadas.

---

**PRC-016** — Compras R$1.000 a R$10.000: mínimo 2 cotações
Solicitação com valor entre R$1.000,01 e R$10.000 exige ao menos 2 cotações antes da aprovação.

---

**PRC-017** — Fornecedor único: carta de exclusividade obrigatória
Para compras com valor > R$10.000 com apenas 1 cotação (fornecedor exclusivo), carta de exclusividade do fornecedor deve ser anexada. Aprovação do IT_MANAGER obrigatória.

---

**PRC-018** — Solicitante não pode ser o aprovador da própria compra
SoD aplicado: `approved_by ≠ requester_id` em todas as etapas de aprovação.

---

**PRC-019** — Número do PO imutável após criação
O código PO-YYYY-NNNNNN é sequencial, único por tenant e imutável após a criação do PO.

---

**PRC-020** — Número da solicitação imutável após submissão
O código PRC-YYYY-NNNNNN é gerado na submissão e imutável.

---

**PRC-021** — Fornecedor com acesso a dados pessoais: DPA obrigatório
Para tipos CLOUD, SAAS e CONSULTING, a aprovação de Compliance é bloqueada sem DPA registrado no cadastro do fornecedor.

---

**PRC-022** — Validade da cotação monitorada
Cotações com `validity_date < hoje + 3 dias` geram alerta ao analista para obter nova proposta.

---

**PRC-023** — Cotação rejeitada: motivo obrigatório
Ao rejeitar uma cotação, o campo `rejection_reason` é obrigatório com mínimo de 20 caracteres.

---

**PRC-024** — Cotação selecionada para PO: justificativa se não for menor preço
Se a cotação selecionada não for a de menor valor total, o campo `selection_justification` é obrigatório.

---

**PRC-025** — CAPEX: NF obrigatória no recebimento
Compra CAPEX não pode ter recebimento concluído sem o número da NF registrado e arquivo da NF anexado.

---

**PRC-026** — OPEX > R$500: NF ou fatura obrigatória
Compra OPEX com valor > R$500 deve ter número da NF/fatura registrado no recebimento.

---

**PRC-027** — Reserva orçamentária criada ao emitir PO
Ao emitir o PO, Budget.committed_amount é aumentado pelo valor total do PO imediatamente.

---

**PRC-028** — Reserva orçamentária liberada ao cancelar PO
PO cancelado tem o committed_amount correspondente liberado automaticamente no orçamento.

---

**PRC-029** — Verificação de orçamento antes da aprovação financeira
O Aprovador Financeiro visualiza o saldo disponível do CC antes de aprovar. Saldo insuficiente gera alerta, mas não bloqueia automaticamente (IT_MANAGER decide).

---

**PRC-030** — Divergência NF > 5% do PO: bloqueio e notificação
Valor da NF superior ao valor do PO em mais de 5% bloqueia o recebimento e notifica o IT_MANAGER para decisão.

---

**PRC-031** — Compra cancelada: solicitação de serviço correspondente retorna à fila
Quando a compra é cancelada, a requisição de serviço de origem (se houver) retorna ao status IN_PROGRESS com comentário de sistema informando o cancelamento.

---

**PRC-032** — Avaliação de fornecedor: prazo de 5 dias úteis após recebimento
O sistema solicita avaliação após recebimento. Sem avaliação em 5 dias úteis: alerta ao analista responsável.

---

**PRC-033** — Fornecedor com avaliação < 2,0: alerta de risco e revisão obrigatória
Fornecedor com avaliação geral abaixo de 2,0 recebe flag de alerta. IT_MANAGER notificado para revisão da relação comercial.

---

**PRC-034** — Inativação de fornecedor: compras ativas não bloqueadas
Inativar fornecedor não cancela POs existentes. Apenas novas compras são bloqueadas para o fornecedor inativo.

---

**PRC-035** — Contrato de fornecimento vinculado à compra recorrente
Para compras recorrentes do mesmo fornecedor e item, o analista deve vincular o contrato existente ao invés de criar nova solicitação de compra avulsa.

---

**PRC-036** — Urgência HIGH/URGENT prioriza na fila de aprovação
Solicitações com urgência HIGH ou URGENT aparecem no topo da fila de aprovadores com badge visual diferenciado.

---

**PRC-037** — Prazo de entrega monitorado automaticamente
POs com prazo de entrega vencido sem recebimento geram alerta diário ao analista e ao IT_MANAGER.

---

**PRC-038** — Compra duplicada detectada automaticamente
Sistema detecta possível duplicidade quando: mesmo fornecedor + mesmo item + mesmo período nos últimos 30 dias. Exibe aviso antes de submeter.

---

**PRC-039** — Contrato com auto_renew: revisão consciente obrigatória
Contratos com `auto_renew = true` geram alerta ao responsável com antecedência configurada para decisão consciente de renovar ou cancelar.

---

**PRC-040** — Contrato sem data de fim: bloqueado para criação
Contrato sem `end_date` preenchido não pode ser ativado. Vigência obrigatória para todos os contratos.

---

**PRC-041** — Compra de software: verificar licença existente primeiro
Antes de criar solicitação de tipo SOFTWARE ou LICENSE, o sistema exibe automaticamente as licenças existentes do mesmo produto para evitar duplicidade de compra.

---

**PRC-042** — Cotações armazenadas e imutáveis após seleção
Após o PO ser emitido, as cotações vinculadas à solicitação são marcadas como imutáveis para garantir rastreabilidade do processo decisório.

---

**PRC-043** — Compra de cloud: aprovação de segurança obrigatória
Solicitações do tipo CLOUD com fornecedor não cadastrado no inventário de provedores aprovados passam por etapa adicional de aprovação da equipe de segurança.

---

**PRC-044** — Recebimento registrado por pessoa diferente do solicitante
O recebimento físico deve ser registrado por um técnico diferente do solicitante original (SoD aplicado ao processo de entrega).

---

**PRC-045** — PO enviado ao fornecedor por e-mail com cópia ao FINANCIAL_ANALYST
O PDF do PO é enviado automaticamente ao e-mail comercial do fornecedor e ao FINANCIAL_ANALYST ao ser emitido.

---

**PRC-046** — Contrato encerrado: lançamentos recorrentes suspensos
Contrato expirado que possui lançamentos OPEX recorrentes tem novas competências suspensas até renovação ou substituição.

---

**PRC-047** — Fornecedor sem e-mail comercial: bloqueado para receber POs
Fornecedor sem `email_commercial` preenchido não pode ser selecionado como destinatário de um PO.

---

**PRC-048** — Compras > R$50.000: aprovação da Diretoria
Solicitações com valor estimado > R$50.000 requerem aprovação da Diretoria além do IT_MANAGER.

---

**PRC-049** — Compra de treinamento: vinculada ao colaborador beneficiário
Solicitações do tipo TRAINING devem ter o campo `beneficiary_id` preenchido com o(s) colaborador(es) que farão o treinamento.

---

**PRC-050** — NF com CNPJ diferente do fornecedor do PO: alerta de divergência
Ao registrar a NF, o sistema valida se o CNPJ emitente corresponde ao CNPJ do fornecedor do PO. Divergência gera alerta ao FINANCIAL_ANALYST.

---

**PRC-051** — Relatório de compras enviado ao financeiro corporativo mensalmente
No primeiro dia útil de cada mês, relatório consolidado de compras (OPEX + CAPEX) exportado automaticamente para integração com o ERP financeiro corporativo.

---

**PRC-052** — Solicitação REJECTED: não pode ser reativada
Solicitação rejeitada é terminal. Uma nova solicitação deve ser criada para tentar novamente.

---

**PRC-053** — Cotação de fornecedor inativo: exibir aviso
Ao adicionar cotação de fornecedor com `is_active = false`, o sistema exibe aviso e exige confirmação antes de prosseguir.

---

**PRC-054** — Item recebido com condição DAMAGED: incidente aberto automaticamente
Recebimento com `condition = DAMAGED` abre automaticamente incidente de garantia vinculado ao fornecedor e ao ativo (se criado).

---

**PRC-055** — Aprovação de compra de consultoria com acesso a dados: DPA antes do PO
Para tipo CONSULTING com acesso a dados pessoais marcado, o PO não pode ser emitido sem DPA registrado no fornecedor. Etapa de Compliance bloqueia a transição.

---

**PRC-056** — Compra de licença: verificar conformidade antes de fechar
Ao receber compra de licença, o sistema verifica automaticamente se a quantidade adquirida é compatível com o número de usuários/dispositivos a serem cobertos.

---

**PRC-057** — Histórico completo de compras do fornecedor acessível
Na página do fornecedor, o histórico completo de POs (abertos e fechados) está disponível para consulta pelo FINANCIAL_ANALYST e IT_MANAGER.

---

**PRC-058** — Compra urgente sem cotação suficiente: aprovação especial do IT_MANAGER
Em situações URGENT com justificativa de negócio, o IT_MANAGER pode aprovar compra com menos cotações do que o mínimo exigido, registrando justificativa obrigatória.

---

**PRC-059** — Solicitação não pode ser excluída fisicamente
Solicitações são somente soft-deleted. Exclusão física é proibida por RLS. Histórico preservado indefinidamente para auditoria.

---

**PRC-060** — Compra de projeto: vinculação ao projeto obrigatória para aquisições > R$5.000
Compras com valor > R$5.000 e tipo PROJECT devem ter `project_id` preenchido. Sem projeto vinculado, a compra é bloqueada com aviso.

---

## 23. Critérios de Aceitação

### 23.1 Solicitação e Cotação

- [ ] **CA-01:** Solicitação sem justificativa (< 50 chars) bloqueada ao submeter.
- [ ] **CA-02:** Solicitação sem classificação OPEX/CAPEX bloqueada.
- [ ] **CA-03:** Solicitação sem centro de custo bloqueada.
- [ ] **CA-04:** Número PRC-YYYY-NNNNNN gerado automaticamente e imutável.
- [ ] **CA-05:** Compra > R$10k bloqueada para aprovação com menos de 3 cotações.
- [ ] **CA-06:** Quadro comparativo exibido automaticamente com 2+ cotações registradas.
- [ ] **CA-07:** Seleção de cotação não sendo o menor preço exige justificativa.

### 23.2 Aprovações

- [ ] **CA-08:** SoD verificado: solicitante não pode ser aprovador da própria compra.
- [ ] **CA-09:** Fluxo de aprovação correto gerado conforme o valor estimado.
- [ ] **CA-10:** IT_MANAGER > R$10k requer step-up auth (re-autenticação MFA).
- [ ] **CA-11:** Aprovação > R$50k inclui etapa de Diretoria no fluxo.
- [ ] **CA-12:** Rejeição sem motivo bloqueada.

### 23.3 Pedido de Compra e Recebimento

- [ ] **CA-13:** PO criado apenas a partir de solicitação APPROVED.
- [ ] **CA-14:** PO emitido cria reserva orçamentária automaticamente no módulo Financeiro.
- [ ] **CA-15:** Recebimento de hardware bloqueia conclusão sem criar ativo no inventário.
- [ ] **CA-16:** Recebimento parcial muda status do PO para PARTIALLY_RECEIVED.
- [ ] **CA-17:** Divergência NF > 5% do PO bloqueia recebimento e notifica IT_MANAGER.
- [ ] **CA-18:** Cancelamento de PO SENT/CONFIRMED exige justificativa + notificação ao fornecedor.

### 23.4 Integrações

- [ ] **CA-19:** CapexInvestment criado automaticamente no módulo Financeiro ao receber hardware.
- [ ] **CA-20:** Reserva orçamentária baixada automaticamente ao receber integralmente.
- [ ] **CA-21:** Compra vinculada a projeto debita orçamento do projeto em tempo real.
- [ ] **CA-22:** DPA exigido para fornecedor CLOUD/SaaS/CONSULTING com dados pessoais.
- [ ] **CA-23:** Requisição de serviço de origem vinculada bidireccionalmente à compra.

### 23.5 Fornecedores e Contratos

- [ ] **CA-24:** CNPJ validado com verificador de dígito ao cadastrar fornecedor.
- [ ] **CA-25:** Fornecedor inativo bloqueado em novos POs e cotações.
- [ ] **CA-26:** Alertas de contrato enviados nos marcos de 90/60/30/2 dias.
- [ ] **CA-27:** Contrato sem data de fim bloqueado para ativação.
- [ ] **CA-28:** Avaliação do fornecedor solicitada após recebimento (prazo 5 dias úteis).

### 23.6 Dashboards e Auditoria

- [ ] **CA-29:** Dashboard operacional exibe compras abertas por status em tempo real.
- [ ] **CA-30:** `audit_log` registra todas as operações com old/new values.
- [ ] **CA-31:** RLS impede UPDATE e DELETE em `audit_log`.
- [ ] **CA-32:** Relatório mensal de compras gerado automaticamente no primeiro dia útil.
- [ ] **CA-33:** Solicitações preservadas indefinidamente (sem exclusão física).
- [ ] **CA-34:** Trilha completa de cotações, aprovações e recebimento disponível para auditoria.

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação com 23 seções, 60 regras PRC e 34 critérios de aceitação |

---

> **Próximos documentos recomendados:**
> [`46_FINANCIAL_MANAGEMENT.md`](./46_FINANCIAL_MANAGEMENT.md) — Módulo Financeiro (OPEX/CAPEX)
> [`43_ASSET_MANAGEMENT.md`](./43_ASSET_MANAGEMENT.md) — Gestão de Ativos (inventário)
> [`48_PROJECTS.md`](./48_PROJECTS.md) — Módulo de Projetos
