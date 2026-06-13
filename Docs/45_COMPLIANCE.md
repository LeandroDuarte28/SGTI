# SGTI — Sistema de Gestão de Tecnologia da Informação
## Módulo de Compliance — Documentação Funcional e de Negócio

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [24_BUSINESS_RULES.md](./24_BUSINESS_RULES.md) · [20_DATABASE.md](./20_DATABASE.md) · [46_FINANCIAL_MANAGEMENT.md](./46_FINANCIAL_MANAGEMENT.md) · [48_PROJECT_MANAGEMENT.md](./48_PROJECT_MANAGEMENT.md)

---

## Sobre este Documento

Este documento define a **especificação funcional completa do Módulo de Compliance do SGTI**, cobrindo auditorias, apontamentos, planos de ação, evidências, riscos, Compliance Score, workflows, notificações, escalonamentos, dashboards e relatórios.

**Escopo exclusivo:** documentação funcional e de negócio. Nenhum código, SQL ou API é gerado neste documento.

---

## Sumário

1. [Objetivos do Módulo](#1-objetivos-do-módulo)
2. [Conceitos](#2-conceitos)
3. [Cadastro de Consultorias](#3-cadastro-de-consultorias)
4. [Cadastro de Auditorias](#4-cadastro-de-auditorias)
5. [Cadastro de Normas](#5-cadastro-de-normas)
6. [Cadastro de Itens Normativos](#6-cadastro-de-itens-normativos)
7. [Gestão de Apontamentos](#7-gestão-de-apontamentos)
8. [Gestão de Evidências](#8-gestão-de-evidências)
9. [Plano de Ação](#9-plano-de-ação)
10. [Gestão de Riscos](#10-gestão-de-riscos)
11. [Workflow](#11-workflow)
12. [Notificações](#12-notificações)
13. [Escalonamento](#13-escalonamento)
14. [Dashboard de Compliance](#14-dashboard-de-compliance)
15. [Compliance Score](#15-compliance-score)
16. [Relatórios](#16-relatórios)
17. [Integrações](#17-integrações)
18. [Segurança](#18-segurança)
19. [Auditoria](#19-auditoria)
20. [KPIs](#20-kpis)
21. [Regras de Negócio](#21-regras-de-negócio)
22. [Critérios de Aceitação](#22-critérios-de-aceitação)

---

## 1. Objetivos do Módulo

### 1.1 Objetivo Geral

Prover ao SGTI uma plataforma integrada de gestão de compliance que permita controlar o ciclo completo de auditorias, apontamentos de não-conformidade, planos de ação, evidências e riscos, garantindo rastreabilidade total, conformidade regulatória e visibilidade executiva sobre o programa de conformidade de TI.

### 1.2 Objetivos Específicos

| # | Objetivo |
|---|----------|
| 1 | Centralizar o controle de todas as auditorias internas, externas e regulatórias |
| 2 | Garantir o ciclo completo: abertura → plano de ação → evidência → validação → conclusão |
| 3 | Calcular e monitorar o Compliance Score por norma e de forma consolidada |
| 4 | Automatizar notificações de prazos para reduzir apontamentos vencidos |
| 5 | Gerar evidências rastreáveis com hash SHA-256 para auditorias externas |
| 6 | Integrar com dashboards executivos para visibilidade da diretoria |
| 7 | Garantir conformidade com LGPD na coleta e tratamento de dados pessoais |

### 1.3 Benefícios

| Benefício | Descrição |
|:---------:|-----------|
| **Redução de retrabalho** | Histórico de apontamentos evita recoleta em auditorias recorrentes |
| **Visibilidade em tempo real** | Dashboard atualizado automaticamente com status de todos os apontamentos |
| **Conformidade regulatória** | Estrutura pronta para BACEN, LGPD, ISO 27001, PCI DSS, COBIT e ITIL |
| **Rastreabilidade completa** | Todo apontamento, evidência e ação registrado com autor, data e histórico |
| **Automação de alertas** | Redução de apontamentos vencidos por negligência |

### 1.4 Escopo do Módulo

**Está no escopo:** Auditorias internas, externas, consultorias e regulatórias; apontamentos NC/OBS/OM; planos de ação; evidências com hash SHA-256; gestão de riscos; Compliance Score; integração com Projetos, Financeiro e Dashboard Executivo.

**Não está no escopo:** Execução de auditorias externas (responsabilidade do auditor); gestão de contratos com consultorias (módulo de Compras); aprovação de políticas (módulo KB).

---

## 2. Conceitos

### 2.1 Auditoria

Processo sistemático, independente e documentado para obter e avaliar evidências, determinando o grau de atendimento aos critérios estabelecidos. No SGTI é o evento guarda-chuva que origina apontamentos.

**Tipos:** Interna, Externa, Consultoria, Regulatória (BACEN, ANPD, Bandeiras de cartão).

### 2.2 Achado (Finding)

Resultado de uma auditoria que representa uma situação identificada. Pode resultar em Não Conformidade, Observação ou Oportunidade de Melhoria.

### 2.3 Não Conformidade (NC)

Não atendimento de um requisito definido por norma, lei, regulamento ou política interna. Exige tratativa obrigatória com prazo e evidência de regularização.

**Classificação:**
- **Crítica (Critical):** Ausência total de controle; risco imediato à organização.
- **Maior (Major):** Falha significativa; risco moderado-alto.
- **Menor (Minor):** Desvio pontual; risco baixo.

### 2.4 Observação

Situação identificada que não constitui NC, mas que, se não tratada, pode evoluir para uma. Recomenda-se ação preventiva.

### 2.5 Oportunidade de Melhoria (OM)

Sugestão de aprimoramento identificada durante a auditoria. Não é obrigatório tratar, mas é registrada e monitorada.

### 2.6 Plano de Ação

Documento que detalha as ações necessárias para regularizar um apontamento. Contém responsável, prazo, percentual de conclusão e status. Um apontamento pode ter múltiplos itens.

### 2.7 Evidência

Registro documental (arquivo, print, log, relatório) que comprova a implementação de ação corretiva. Armazenada no Supabase Storage com hash SHA-256 para garantir integridade.

### 2.8 Norma

Documento de referência que estabelece critérios e requisitos. Ex.: ISO 27001:2022, LGPD, PCI DSS v4.0, Resolução BACEN 4.893/2021.

### 2.9 Item Normativo

Controle, artigo ou seção específica de uma norma que é objeto de avaliação. Ex.: A.9.2.1 da ISO 27001, Art. 46 da LGPD.

### 2.10 Risco

Probabilidade de uma não-conformidade se materializar e causar dano à organização, ponderada pelo impacto potencial.

### 2.11 Responsável

Usuário do SGTI designado para tratar um apontamento, executar uma ação ou fornecer evidência. Recebe notificações automáticas de prazo.

---

## 3. Cadastro de Consultorias

### 3.1 Finalidade

Registro de empresas e profissionais especializados que realizam auditorias e assessorias de compliance.

### 3.2 Campos do Cadastro

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| **id** | UUID | Automático | Identificador único |
| **Nome Fantasia** | String (300) | Sim | Nome comercial da consultoria |
| **Razão Social** | String (300) | Sim | Nome jurídico da empresa |
| **CNPJ** | String (18) | Sim (PJ) | Formato XX.XXX.XXX/XXXX-XX. Validado. |
| **CPF** | String (14) | Condicional (PF) | Para consultores autônomos |
| **Contato Principal — Nome** | String (200) | Sim | Nome do profissional responsável |
| **Contato Principal — E-mail** | String (255) | Sim | E-mail do contato |
| **Contato Principal — Telefone** | String (20) | Não | Telefone/WhatsApp |
| **Website** | URL | Não | Site da consultoria |
| **Especialidades** | Array String | Não | Ex.: ISO 27001, PCI DSS, LGPD |
| **Status** | Enum | Sim | `ACTIVE` ou `INACTIVE` |
| **Possui NDA** | Boolean | Não | Se há Acordo de Confidencialidade assinado |
| **Data do NDA** | Date | Condicional | Data de assinatura do NDA |
| **Observações** | Texto | Não | Notas internas |

---

## 4. Cadastro de Auditorias

### 4.1 Campos do Cadastro

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| **id** | UUID | Automático | Identificador único |
| **Código** | String (sequencial) | Automático | `AUD-YYYY-NNNN`. Imutável. |
| **Nome** | String (300) | Sim | Nome descritivo da auditoria |
| **Tipo** | Enum | Sim | `INTERNAL`, `EXTERNAL`, `CONSULTORIA`, `REGULATORY` |
| **Consultoria** | FK — Consultoria | Condicional | Obrigatório para EXTERNAL e CONSULTORIA |
| **Normas Avaliadas** | Array FK — Norma | Sim | Normas que serão avaliadas |
| **Escopo** | Texto | Sim | Descrição do que será avaliado |
| **Áreas Envolvidas** | Array FK — Department | Não | Departamentos em escopo |
| **Data de Início** | Date | Sim | Início das atividades de auditoria |
| **Data de Fim** | Date | Sim | Encerramento previsto/realizado |
| **Auditor Líder** | String (200) | Não | Nome do auditor líder (externo) |
| **Auditor Interno** | FK — User | Não | Responsável interno pelo acompanhamento |
| **Status** | Enum | Sim | `PLANNED`, `IN_PROGRESS`, `PENDING_RESPONSES`, `IN_REVIEW`, `COMPLETED`, `CANCELLED` |
| **Relatório Final** | FileReference | Não | Arquivo do relatório de auditoria |
| **Compliance Score Final** | Decimal (5,2) | Calculado | Score ao concluir a auditoria |
| **Projeto Vinculado** | FK — Project | Não | Projeto de adequação vinculado |
| **Observações** | Texto | Não | Notas adicionais |

### 4.2 Ciclo de Vida da Auditoria

```
PLANNED → IN_PROGRESS → PENDING_RESPONSES → IN_REVIEW → COMPLETED
PLANNED / IN_PROGRESS → CANCELLED (com justificativa obrigatória)
```

---

## 5. Cadastro de Normas

### 5.1 Normas Pré-cadastradas

| Norma | Código | Tipo |
|:-----:|:------:|:----:|
| ISO/IEC 27001:2022 | `ISO_27001` | Internacional |
| LGPD (Lei 13.709/2018) | `LGPD` | Regulatória BR |
| PCI DSS v4.0 | `PCI_DSS` | Internacional |
| BACEN 4.893/2021 | `BACEN_4893` | Regulatória BR |
| BACEN 4.658/2018 | `BACEN_4658` | Regulatória BR |
| COBIT 2019 | `COBIT_2019` | Framework |
| ITIL v4 | `ITIL_V4` | Framework |
| ISO/IEC 20000:2018 | `ISO_20000` | Internacional |
| SOC 2 | `SOC_2` | Americana |
| Política Interna | `INTERNAL_POLICY` | Interna |

### 5.2 Campos da Norma

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| **id** | UUID | Automático | Identificador único |
| **Código** | String (50) | Sim | Código curto. Ex.: `ISO_27001` |
| **Nome Completo** | String (300) | Sim | Nome oficial da norma |
| **Versão** | String (50) | Não | Versão/Edição |
| **Órgão Emissor** | String (200) | Sim | Ex.: ISO, BACEN, ANPD |
| **Tipo** | Enum | Sim | `INTERNATIONAL`, `REGULATORY_BR`, `FRAMEWORK`, `INTERNAL` |
| **Descrição** | Texto | Não | Contextualização da norma |
| **URL Oficial** | URL | Não | Link para o documento oficial |
| **Data de Vigência** | Date | Não | Quando a versão entrou em vigor |
| **is_active** | Boolean | Sim | Normas inativas não aparecem para seleção |

---

## 6. Cadastro de Itens Normativos

### 6.1 Finalidade

Decomposição de cada norma em controles, artigos ou seções individualmente auditáveis.

### 6.2 Campos do Item Normativo

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| **id** | UUID | Automático | Identificador único |
| **Norma** | FK — Norma | Sim | Norma pai |
| **Código do Item** | String (50) | Sim | Ex.: A.9.2.1, Art. 46 |
| **Nome do Item** | String (300) | Sim | Ex.: "Registro e Cancelamento de Usuário" |
| **Descrição** | Texto | Sim | Texto do requisito conforme a norma |
| **Domínio / Seção** | String (200) | Não | Agrupamento. Ex.: "A.9 — Controle de Acesso" |
| **Criticidade Padrão** | Enum | Sim | `CRITICAL`, `MAJOR`, `MINOR`, `OBSERVATION` |
| **Aplicável** | Boolean | Sim | Se o controle se aplica à organização |
| **Justificativa de Exclusão** | Texto | Condicional | Obrigatório se `aplicável = false` |
| **Status de Implementação** | Enum | Sim | `NOT_STARTED`, `PARTIAL`, `IMPLEMENTED`, `NOT_APPLICABLE` |
| **Responsável pelo Controle** | FK — User | Não | Dono do controle na organização |

### 6.3 Exemplos de Itens

**ISO 27001 (seleção):**

| Código | Item | Criticidade |
|:------:|------|:-----------:|
| A.5.1.1 | Políticas para Segurança da Informação | MAJOR |
| A.9.2.1 | Registro e Cancelamento de Usuário | CRITICAL |
| A.9.2.3 | Gerenciamento de Direitos de Acesso Privilegiado | CRITICAL |
| A.12.3.1 | Backup de Informações | CRITICAL |

**LGPD (seleção):**

| Código | Item | Criticidade |
|:------:|------|:-----------:|
| Art. 6 | Princípios do tratamento de dados pessoais | CRITICAL |
| Art. 37 | Registro das atividades de tratamento | MAJOR |
| Art. 46 | Medidas de segurança, técnicas e administrativas | CRITICAL |
| Art. 48 | Comunicação de incidentes de segurança | CRITICAL |

---

## 7. Gestão de Apontamentos

### 7.1 Conceito

Um **Apontamento** é o registro formal de uma situação identificada durante uma auditoria que requer tratativa. É o objeto central do módulo de compliance.

### 7.2 Campos do Apontamento

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **id** | UUID | Automático | Não | Identificador único |
| **Código** | String (sequencial) | Automático | Não | `CMP-YYYY-NNNNNN`. Imutável. |
| **Auditoria** | FK — Auditoria | Sim | Não após criar | Auditoria que originou o apontamento |
| **Norma** | FK — Norma | Sim | Não após criar | Norma referenciada |
| **Item Normativo** | FK — NormItem | Sim | Não após criar | Controle específico avaliado |
| **Tipo de Apontamento** | Enum | Sim | COMPLIANCE_OFFICER+ | `NON_CONFORMITY`, `OBSERVATION`, `IMPROVEMENT_OPPORTUNITY` |
| **Título** | String (400) | Sim | COMPLIANCE_OFFICER+ | Resumo do apontamento |
| **Descrição** | Texto longo | Sim | COMPLIANCE_OFFICER+ | Detalhamento completo da situação encontrada |
| **Criticidade** | Enum | Sim | COMPLIANCE_OFFICER+ | `CRITICAL`, `MAJOR`, `MINOR`, `OBSERVATION` |
| **Área Responsável** | FK — Department | Sim | COMPLIANCE_OFFICER+ | Departamento responsável pela regularização |
| **Analista Responsável** | FK — User | Sim | IT_MANAGER+, COMPLIANCE_OFFICER | Pessoa que responderá pelo apontamento |
| **Data Limite** | Date | Sim | COMPLIANCE_OFFICER+ | Prazo máximo para regularização |
| **Status** | Enum | Sim | Conforme fluxo | Ver tabela 7.3 |
| **Recorrente** | Boolean | Automático | Não | `true` se mesmo item normativo foi apontado antes |
| **Projeto Vinculado** | FK — Project | Não | IT_MANAGER+ | Projeto criado para tratar o apontamento |
| **Custo Estimado** | Decimal (15,2) | Não | FINANCIAL_ANALYST | Custo estimado de regularização |
| **is_urgent** | Boolean | Não | COMPLIANCE_OFFICER | Urgência adicional além da criticidade |

### 7.3 Status do Apontamento

| Status | Código | Descrição |
|:------:|:------:|-----------|
| **Aberto** | `NEW` | Registrado; aguardando início de tratativa |
| **Em Tratativa** | `IN_PROGRESS` | Analista trabalhando no plano de ação |
| **Aguardando Evidência** | `PENDING_EVIDENCE` | Plano executado; aguardando envio de evidências |
| **Em Validação** | `IN_VALIDATION` | Evidências submetidas; aguardando aprovação |
| **Concluído** | `CONCLUDED` | Regularização aprovada com evidências válidas |
| **Cancelado** | `CANCELLED` | Cancelado (com justificativa obrigatória) |
| **Não Aplicável** | `NOT_APPLICABLE` | Item não aplicável (com justificativa) |
| **Reaberto** | `REOPENED` | Concluído que precisou ser reaberto |

### 7.4 Workflow de Status

```
NEW → IN_PROGRESS → PENDING_EVIDENCE → IN_VALIDATION → CONCLUDED
NEW / IN_PROGRESS → CANCELLED (justificativa obrigatória)
NEW → NOT_APPLICABLE (justificativa obrigatória)
CONCLUDED → REOPENED (motivo obrigatório)
IN_VALIDATION → IN_PROGRESS (evidência reprovada)
```

---

## 8. Gestão de Evidências

### 8.1 Tipos de Arquivo Aceitos

| Tipo | Extensões | Tamanho Máximo |
|:----:|:---------:|:--------------:|
| PDF | `.pdf` | 50 MB |
| Word | `.docx`, `.doc` | 50 MB |
| Excel | `.xlsx`, `.xls` | 50 MB |
| Imagem | `.png`, `.jpg`, `.jpeg` | 20 MB |
| CSV | `.csv` | 20 MB |

### 8.2 Campos da Evidência

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| **id** | UUID | Automático | Identificador único |
| **Apontamento** | FK — ComplianceFinding | Sim | Apontamento vinculado |
| **Título** | String (300) | Sim | Identificação descritiva |
| **Descrição** | Texto | Sim | O que a evidência comprova |
| **Tipo** | Enum | Sim | `SCREENSHOT`, `DOCUMENT`, `LOG`, `REPORT`, `CERTIFICATE`, `OTHER` |
| **Arquivo** | FileReference | Sim | Referência ao arquivo no Supabase Storage |
| **Hash SHA-256** | String (64) | Automático | Calculado no upload para integridade |
| **Data da Evidência** | Date | Sim | Quando a evidência foi gerada/coletada |
| **Responsável** | FK — User | Sim | Quem enviou a evidência |
| **Status de Revisão** | Enum | Sim | `PENDING`, `APPROVED`, `REJECTED` |
| **Revisor** | FK — User | Condicional | COMPLIANCE_OFFICER que revisou |
| **Motivo de Rejeição** | Texto | Condicional | Obrigatório se `status = REJECTED` |

### 8.3 Armazenamento no Supabase Storage

```
PATH: evidences/{tenant_id}/{audit_id}/{finding_id}/{uuid}_{filename_sanitizado}

PROTECAO:
  - Bucket privado com RLS por tenant
  - Presigned URL com validade de 15 minutos
  - Criptografia AES-256 em repouso
```

### 8.4 Processo de Validação

```
Analista faz upload (status: PENDING)
     |
COMPLIANCE_OFFICER revisa:
     |- APROVADA -> status: APPROVED -> apontamento avança
     |
     `- REJEITADA -> status: REJECTED (motivo obrigatorio)
           -> Analista notificado
           -> Apontamento retorna para IN_PROGRESS
```

---

## 9. Plano de Ação

### 9.1 Campos do Item de Plano de Ação

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| **id** | UUID | Automático | Identificador único |
| **Apontamento** | FK — ComplianceFinding | Sim | Apontamento pai |
| **Sequência** | Inteiro | Automático | Número do item no apontamento |
| **Descrição** | Texto | Sim | O que deve ser feito (mínimo 30 chars) |
| **Responsável** | FK — User | Sim | Quem executará a ação |
| **Prazo** | Date | Sim | Data limite para execução |
| **Status** | Enum | Sim | `PENDING`, `IN_PROGRESS`, `DONE`, `CANCELLED`, `OVERDUE` |
| **Percentual Concluído** | Inteiro (0–100) | Sim | Estimativa de progresso |
| **Evidência Vinculada** | FK — ComplianceEvidence | Não | Evidência que comprova a conclusão |
| **Observações** | Texto | Não | Notas sobre a execução |

### 9.2 Regras do Plano de Ação

- O prazo de cada ActionItem **não pode ser posterior** ao `due_date` do apontamento pai.
- Ao concluir todos os itens, o sistema sugere mover o apontamento para `PENDING_EVIDENCE`.
- O percentual do apontamento é calculado como a média dos percentuais dos itens.

---

## 10. Gestão de Riscos

### 10.1 Campos do Risco

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| **id** | UUID | Automático | Identificador único |
| **Apontamento** | FK — ComplianceFinding | Sim | Apontamento vinculado |
| **Descrição do Risco** | Texto | Sim | O que pode acontecer se não tratado |
| **Probabilidade** | Enum | Sim | `VERY_LOW`(1), `LOW`(2), `MEDIUM`(3), `HIGH`(4), `VERY_HIGH`(5) |
| **Impacto** | Enum | Sim | `VERY_LOW`(1), `LOW`(2), `MEDIUM`(3), `HIGH`(4), `VERY_HIGH`(5) |
| **Nível de Risco** | Enum — calculado | Automático | Probabilidade × Impacto |
| **Categoria** | Enum | Sim | `REGULATORY`, `OPERATIONAL`, `REPUTATIONAL`, `FINANCIAL`, `SECURITY`, `PRIVACY` |
| **Plano de Contingência** | Texto | Condicional | Obrigatório se nível CRITICAL ou HIGH |
| **Status** | Enum | Sim | `IDENTIFIED`, `MONITORING`, `MATERIALIZED`, `MITIGATED`, `ACCEPTED` |
| **Responsável** | FK — User | Sim | Quem monitora o risco |

### 10.2 Matriz de Risco 5×5

| Probabilidade / Impacto | Muito Baixo (1) | Baixo (2) | Médio (3) | Alto (4) | Muito Alto (5) |
|:-----------------------:|:---------------:|:---------:|:---------:|:--------:|:--------------:|
| **Muito Alto (5)** | Médio (5) | Alto (10) | Crítico (15) | Crítico (20) | Crítico (25) |
| **Alto (4)** | Médio (4) | Médio (8) | Alto (12) | Crítico (16) | Crítico (20) |
| **Médio (3)** | Baixo (3) | Médio (6) | Médio (9) | Alto (12) | Crítico (15) |
| **Baixo (2)** | Baixo (2) | Baixo (4) | Médio (6) | Médio (8) | Alto (10) |
| **Muito Baixo (1)** | Baixo (1) | Baixo (2) | Baixo (3) | Médio (4) | Médio (5) |

**Classificação:** Baixo (1–4) | Médio (5–9) | Alto (10–14) | Crítico (15–25)

---

## 11. Workflow

### 11.1 Fluxo Completo do Ciclo de Compliance

```
1. AUDITORIA CRIADA
   COMPLIANCE_OFFICER registra auditoria
   Status: PLANNED -> IN_PROGRESS

2. APONTAMENTO GERADO
   Para cada achado: norma + item + criticidade + responsável + prazo
   Status: NEW

3. PLANO DE ACAO
   Analista elabora e registra itens do plano
   Status: IN_PROGRESS

4. EXECUCAO E EVIDENCIAS
   Analista executa acoes e faz upload de evidências
   Status: PENDING_EVIDENCE

5. VALIDACAO
   COMPLIANCE_OFFICER revisa cada evidência
   APROVADA: avança | REPROVADA: retorna para analista
   Status: IN_VALIDATION

6. CONCLUSAO
   Todas as evidências aprovadas
   Status: CONCLUDED

7. RELATORIO FINAL
   Compliance Score atualizado automaticamente
   Evidências arquivadas com hash SHA-256
```

---

## 12. Notificações

### 12.1 Tipos de Notificação

| Evento | Canal | Destinatários |
|:------:|:-----:|:-------------:|
| Apontamento criado | In-app + E-mail | Analista Responsável, Gestor da Área |
| Apontamento alterado | In-app | Analista Responsável |
| Plano de ação criado | In-app | Analista Responsável |
| Novo prazo definido | In-app + E-mail | Analista, COMPLIANCE_OFFICER |
| Prazo vencendo (7 dias) | In-app + E-mail | Analista, Coordenador |
| **Prazo vencendo (2 dias)** | **In-app + E-mail urgente** | **Analista, Coordenador, IT_MANAGER** |
| Prazo vencido | In-app + E-mail diário | Analista, Coordenador, IT_MANAGER |
| Evidência enviada | In-app | COMPLIANCE_OFFICER |
| Evidência aprovada | In-app + E-mail | Analista Responsável |
| Evidência reprovada | In-app + E-mail urgente | Analista + motivo |
| Apontamento concluído | In-app + E-mail | Analista, COMPLIANCE_OFFICER, IT_MANAGER |
| Apontamento CRITICAL vencido | E-mail urgente diário | COMPLIANCE_OFFICER, IT_MANAGER, Diretoria |

---

## 13. Escalonamento

### 13.1 Regras de Escalonamento Automático

| Condição | Ação | Nível |
|:--------:|:----:|:-----:|
| Prazo vencido há 1–5 dias | Notificação diária ao Analista e Coordenador | Nível 1 |
| Prazo vencido há 6–15 dias | Notificação ao IT_MANAGER + Alerta no dashboard | Nível 2 |
| Prazo vencido há > 15 dias | Notificação urgente à Diretoria + Destaque crítico | Nível 3 |
| Apontamento CRITICAL vencido (qualquer prazo) | Notificação imediata ao IT_MANAGER e Diretoria | Crítico |
| Apontamento regulatório (BACEN, LGPD) vencido | Notificação imediata ao IT_MANAGER e COMPLIANCE_OFFICER | Regulatório |

### 13.2 Escalonamento Manual

COMPLIANCE_OFFICER ou IT_MANAGER pode escalonar manualmente:
- Selecionar "Escalonar" na página do apontamento.
- Informar nível e destinatário adicional.
- Escalonamento registrado em audit_log com motivo.

---

## 14. Dashboard de Compliance

### 14.1 Painel Principal

| Componente | Dados Exibidos |
|------------|:-------------:|
| **Apontamentos Abertos** | COUNT(status != CONCLUDED, CANCELLED, NOT_APPLICABLE) |
| **Em Atraso** | COUNT(due_date < hoje AND status != CONCLUDED) — VERMELHO |
| **Vencendo em 7 dias** | COUNT(due_date entre hoje e +7 dias) |
| **Vencendo em 30 dias** | COUNT(due_date entre hoje e +30 dias) |
| **Concluídos no mês** | COUNT(CONCLUDED no mês atual) |
| **Compliance Score Global** | Score médio ponderado de todas as normas ativas |
| **Por Consultoria** | Distribuição de apontamentos por consultoria |
| **Por Auditoria** | Distribuição por auditoria |
| **Por Norma** | Score e volume por norma |
| **Por Área** | Distribuição por departamento responsável |
| **Por Analista** | Carga de trabalho por analista |
| **Riscos Críticos** | COUNT(risk_level = CRITICAL AND status != MITIGATED) |
| **Evidências Pendentes** | COUNT(evidence.status = PENDING) |

### 14.2 Alertas Visuais

| Condição | Cor |
|:--------:|:---:|
| Apontamento vencido | Vermelho |
| Apontamento vencendo em <= 7 dias | Laranja |
| Compliance Score < 60% | Vermelho |
| Compliance Score 60–79% | Amarelo |
| Compliance Score >= 80% | Verde |
| Risco Crítico aberto | Vermelho pulsante |

---

## 15. Compliance Score

### 15.1 Conceito

Índice percentual que representa o nível de maturidade de implementação dos controles de uma norma. Calculado ao concluir cada auditoria.

### 15.2 Fórmula de Cálculo

```
SCORE POR NORMA:
Score = (SUM(IMPLEMENTED * 1.0) + SUM(PARTIAL * 0.5)) / SUM(APLICAVEIS) * 100

EXEMPLO — ISO 27001 com 80 controles aplicáveis:
  50 IMPLEMENTED * 1.0 = 50.0
  20 PARTIAL * 0.5     = 10.0
  10 NOT_STARTED * 0   = 0.0
  Score = (50 + 10) / 80 * 100 = 75.0%

SCORE GLOBAL:
Média ponderada dos scores por norma (pesos configuráveis pelo SUPER_ADMIN).
```

### 15.3 Faixas de Classificação

| Faixa | Intervalo | Cor | Significado |
|:-----:|:---------:|:---:|:-----------:|
| Critico | 0%–49% | Vermelho | Conformidade gravemente comprometida |
| Insatisfatório | 50%–59% | Laranja | Controles importantes ausentes |
| Em Desenvolvimento | 60%–74% | Amarelo | Conformidade em evolução |
| Satisfatório | 75%–89% | Verde claro | Boa conformidade |
| Excelente | 90%–100% | Verde escuro | Alta maturidade |

---

## 16. Relatórios

### 16.1 Catálogo de Relatórios

| Código | Nome | Tipo |
|:------:|------|:----:|
| REL-CMP-001 | Auditorias por Período | Gerencial |
| REL-CMP-002 | Auditoria Específica (detalhado) | Gerencial |
| REL-CMP-003 | Apontamentos em Aberto | Operacional |
| REL-CMP-004 | Apontamentos Vencidos | Operacional |
| REL-CMP-005 | Apontamentos Recorrentes | Gerencial |
| REL-CMP-006 | Evidências por Apontamento | Operacional |
| REL-CMP-007 | Pacote de Evidências para Auditoria Externa | Executivo |
| REL-CMP-008 | Status de Planos de Ação | Operacional |
| REL-CMP-009 | Inventário de Riscos | Gerencial |
| REL-CMP-010 | Compliance Score Histórico por Norma | Executivo |
| REL-CMP-011 | Compliance Score Global Consolidado | Executivo |

### 16.2 Destaques dos Relatórios

**REL-CMP-007 — Pacote de Evidências para Auditoria Externa:**
Relatório consolidado exportável em PDF com hash SHA-256 de cada evidência. Requer aprovação do IT_MANAGER antes de gerar. Inclui sumário executivo com score, período e lista de evidências com hashes.

**REL-CMP-011 — Compliance Score Global:**
Gerado automaticamente no primeiro dia útil de cada trimestre e enviado ao IT_MANAGER e Diretoria. Inclui decomposição por norma e variação vs. trimestre anterior.

---

## 17. Integrações

### 17.1 Supabase Storage

Evidências armazenadas no bucket privado `evidences` com:
- RLS por tenant.
- Presigned URL com validade de 15 minutos.
- Hash SHA-256 calculado no upload.
- Criptografia AES-256 em repouso.

### 17.2 Google Workspace

- Notificações via e-mail corporativo (`implantacao@pinpag.com.br`).
- Evidências podem ser links do Google Drive.
- Relatórios enviados por e-mail para gestores e diretoria.

### 17.3 Sistema de Chamados

- Apontamentos podem gerar chamado de Requisição no módulo de tickets.
- Rastreabilidade bidirecional: Chamado <-> Apontamento.

### 17.4 Módulo de Projetos

- Apontamentos com esforço > 80 horas ou custo > R$10.000 podem gerar projeto formal.
- Botão "Criar Projeto para Regularização" disponível na página do apontamento.
- Rastreabilidade: Apontamento -> Projeto.

### 17.5 Dashboard Executivo

- Compliance Score global e por norma exibidos no Dashboard Executivo.
- Indicadores de apontamentos críticos e vencidos no painel da diretoria.
- Atualizacao automática a cada alteração de status.

---

## 18. Segurança

### 18.1 RBAC

| Ação | END_USER | IT_TECHNICIAN | IT_SPECIALIST | COMPLIANCE_OFFICER | IT_MANAGER | AUDITOR | SUPER_ADMIN |
|:----:|:--------:|:-------------:|:-------------:|:------------------:|:----------:|:-------:|:-----------:|
| Ver apontamentos da própria área | Sim | Sim | Sim | Sim | Sim | Sim | Sim |
| Ver todos os apontamentos | Não | Não | Não | Sim | Sim | Sim | Sim |
| Criar apontamento | Não | Não | Não | Sim | Sim | Sim | Sim |
| Editar apontamento | Não | Não | Próprios | Sim | Sim | Não | Sim |
| Aprovar evidência | Não | Não | Não | Sim | Sim | Não | Sim |
| Criar norma | Não | Não | Não | Sim | Sim | Não | Sim |
| Criar auditoria | Não | Não | Não | Sim | Sim | Sim | Sim |
| Exportar pacote de evidências | Não | Não | Não | Sim | Sim | Sim | Sim |

### 18.2 LGPD

- Dados pessoais protegidos por RBAC.
- Evidências com dados pessoais de terceiros: acesso restrito ao COMPLIANCE_OFFICER e IT_MANAGER.
- Logs de acesso a evidências sensíveis: retenção de 5 anos.
- Pacote de evidências para auditores externos requer aprovação formal do IT_MANAGER.

---

## 19. Auditoria

### 19.1 Eventos Auditados

| Evento | Dados Capturados |
|--------|:----------------:|
| Auditoria criada/alterada | Todos os campos + usuário + timestamp |
| Apontamento criado/editado | Campo + old_value + new_value |
| Status de apontamento alterado | Status anterior + novo |
| Prazo alterado | Prazo anterior + novo + motivo |
| Evidência enviada | evidence_id + filename + hash + tamanho |
| Evidência aprovada/reprovada | evidence_id + revisor + motivo |
| Evidência acessada (download) | evidence_id + user_id + IP |
| Compliance Score calculado | Norma + score + auditoria |
| Pacote exportado | Lista de evidências + exportado_por |
| Escalonamento executado | Nível + destinatário + motivo |

### 19.2 Imutabilidade

A tabela `shared.audit_log` tem RLS **INSERT-ONLY**. Nenhum UPDATE ou DELETE é possível.

---

## 20. KPIs

### 20.1 Tabela de KPIs

| Código | KPI | Fórmula | Meta |
|:------:|-----|---------|:----:|
| KPI-CMP-001 | Compliance Score | (SUM(IMPL*1) + SUM(PART*0.5)) / SUM(APLIC) * 100 | >= 80% |
| KPI-CMP-002 | Taxa de Conformidade | COUNT(IMPLEMENTED) / COUNT(APLICAVEIS) * 100 | >= 75% |
| KPI-CMP-003 | Taxa de Regularizacao | COUNT(CONCLUDED_NO_PRAZO) / COUNT(CONCLUDED) * 100 | >= 85% |
| KPI-CMP-004 | Evidências Pendentes | COUNT(evidence.status = 'PENDING') | <= 10 |
| KPI-CMP-005 | Tempo Médio de Regularizacao | AVG(concluded_at - created_at) em dias | Reducao trimestral |

### 20.2 Faixas dos KPIs

| KPI | Verde | Amarelo | Vermelho |
|:---:|:-----:|:-------:|:--------:|
| Compliance Score | >= 80% | 60–79% | < 60% |
| Taxa de Conformidade | >= 75% | 60–74% | < 60% |
| Taxa de Regularizacao | >= 85% | 70–84% | < 70% |
| Evidências Pendentes | <= 10 | 11–30 | > 30 |

---

## 21. Regras de Negócio

---

**CMP-001** — Todo apontamento deve possuir responsável
O campo `analyst_id` é obrigatório. Apontamento sem responsável não pode ser salvo.

---

**CMP-002** — Todo apontamento deve possuir prazo
O campo `due_date` é obrigatório. Prazo não pode ser no passado ao criar.

---

**CMP-003** — Todo apontamento deve possuir norma associada
O campo `norm_id` é obrigatório. Apontamento sem norma não pode ser salvo.

---

**CMP-004** — Todo apontamento deve possuir item normativo associado
O campo `norm_item_id` é obrigatório. Apontamento sem item normativo não pode ser salvo.

---

**CMP-005** — Todo apontamento concluído deve possuir ao menos uma evidência aprovada
Transição para `CONCLUDED` bloqueada se não houver evidência com `review_status = APPROVED`.

---

**CMP-006** — Toda evidência deve possuir responsável
O campo `uploaded_by` é obrigatório. Evidência sem responsável não pode ser salva.

---

**CMP-007** — Toda evidência deve possuir data
O campo `evidence_date` é obrigatório. Data não pode ser no futuro.

---

**CMP-008** — O sistema deve notificar 2 dias antes do vencimento
`NotificationJob` executa diariamente. E-mail urgente enviado ao analista, coordenador e IT_MANAGER para apontamentos com `due_date = TODAY + 2`.

---

**CMP-009** — Apontamentos vencidos destacados em vermelho
Qualquer tela que exiba apontamentos com `due_date < TODAY AND status != CONCLUDED` deve mostrar a linha com fundo vermelho e badge `VENCIDO`.

---

**CMP-010** — Todo apontamento deve ser auditável
Toda criação, edição ou mudança de status gera registro em `shared.audit_log` com user_id, timestamp, campos alterados (old/new).

---

**CMP-011** — Código do apontamento imutável após criação
O código `CMP-YYYY-NNNNNN` é sequencial, único por tenant e imutável após criação.

---

**CMP-012** — Código da auditoria imutável após criação
O código `AUD-YYYY-NNNN` é sequencial, único e imutável.

---

**CMP-013** — CNPJ de consultoria validado com verificador de dígito
Consultoria PJ exige CNPJ válido. Bloqueado na criação se inválido.

---

**CMP-014** — Apontamento CRITICAL: prazo máximo de 90 dias
Prazo acima de 90 dias é bloqueado para criticidade CRITICAL. Aviso se prazo superior a 30 dias.

---

**CMP-015** — Apontamento de norma regulatória vencido: escalonamento imediato
Apontamentos com `norm.type = REGULATORY_BR` vencidos disparam notificação urgente imediata ao IT_MANAGER e COMPLIANCE_OFFICER.

---

**CMP-016** — Evidência aprovada não pode ser excluída
Evidência com `review_status = APPROVED` não pode ser excluída por nenhum papel. Somente soft-delete.

---

**CMP-017** — Hash SHA-256 calculado no servidor
O hash é calculado pelo servidor antes do upload no Supabase Storage e armazenado no banco com os metadados.

---

**CMP-018** — Presigned URL de evidência com validade de 15 minutos
URL de download expira em 15 minutos. Novo download requer nova URL com log de acesso.

---

**CMP-019** — Prazo do item de plano de ação não pode superar prazo do apontamento
`ActionItem.due_date <= ComplianceFinding.due_date`. Bloqueado na criação/edição.

---

**CMP-020** — Compliance Score calculado apenas ao concluir auditoria
O score é recalculado automaticamente quando auditoria muda para `COMPLETED`.

---

**CMP-021** — Item normativo com `aplicável = false` exige justificativa
Ao marcar item como não aplicável, `exclusion_justification` é obrigatório.

---

**CMP-022** — Apontamento recorrente identificado automaticamente
Ao criar apontamento, o sistema verifica se o mesmo `norm_item_id` foi apontado antes. Se sim, marca `recurrent = true` e exibe banner de alerta.

---

**CMP-023** — Analista não pode aprovar sua própria evidência
SoD aplicado: `reviewed_by != uploaded_by` em evidências.

---

**CMP-024** — Escalonamento registrado em audit_log
Todo escalonamento (automático ou manual) gera registro com nível, destinatário e motivo.

---

**CMP-025** — Notificação 7 dias antes do prazo
Além dos 2 dias obrigatórios, notificação 7 dias antes para analista e coordenador.

---

**CMP-026** — Apontamentos cancelados: motivo obrigatório
Transição para `CANCELLED` exige `cancellation_reason` com mínimo de 30 caracteres.

---

**CMP-027** — Apontamentos não podem ser excluídos — apenas cancelados
Registros preservados indefinidamente. Exclusão física bloqueada por RLS.

---

**CMP-028** — Consultoria inativa não aparece para seleção em novas auditorias
Consultoria com `status = INACTIVE` não é exibida no seletor.

---

**CMP-029** — Norma inativa não aparece para seleção em novos apontamentos
Norma com `is_active = false` não é exibida no seletor.

---

**CMP-030** — Pacote de evidências para auditoria externa requer aprovação do IT_MANAGER
Ao gerar REL-CMP-007, o sistema exige aprovação do IT_MANAGER registrada em audit_log.

---

**CMP-031** — Risco crítico aberto aciona alerta imediato no dashboard executivo
Risco `CRITICAL` com status != MITIGATED ou ACCEPTED exibe alerta no dashboard executivo em tempo real.

---

**CMP-032** — Compliance Score global ponderado configurável pelo SUPER_ADMIN
Pesos das normas configuráveis via interface de administração. Alterações registradas em audit_log.

---

**CMP-033** — Apontamento em auditoria COMPLETED não pode ser alterado
Após auditoria mudar para `COMPLETED`, apontamentos ficam somente leitura. Requer reabertura da auditoria.

---

**CMP-034** — Evidência com tipo de arquivo não autorizado é rejeitada
Tipos não listados na seção 8.1 são bloqueados no frontend e backend. MIME type real validado no servidor.

---

**CMP-035** — Evidência com tamanho acima do limite é rejeitada
Arquivos acima dos limites da seção 8.1 são bloqueados com mensagem de erro clara.

---

**CMP-036** — Relatório de apontamentos enviado mensalmente ao COMPLIANCE_OFFICER
No primeiro dia útil de cada mês, relatório de status de todos os apontamentos abertos é gerado e enviado automaticamente.

---

**CMP-037** — Apontamento CRITICAL vencido: alerta diário à Diretoria
E-mail urgente enviado diariamente ao IT_MANAGER e Diretoria até regularização.

---

**CMP-038** — Consultor externo acesso restrito como AUDITOR
Usuários com papel `AUDITOR` veem apenas apontamentos da auditoria vinculada. Somente leitura.

---

**CMP-039** — NDA da consultoria exibido como aviso antes de compartilhar evidências
Ao gerar pacote para consultoria sem `nda_signed = true`, exibe aviso de ausência de NDA.

---

**CMP-040** — Percentual do apontamento calculado automaticamente
`ComplianceFinding.completion_percentage = AVG(ActionItem.completion_percentage)` calculado pelo servidor.

---

**CMP-041** — Rejeição de evidência: motivo com mínimo de 30 caracteres obrigatório
`rejection_reason` obrigatório com mínimo de 30 caracteres para garantir feedback útil.

---

**CMP-042** — Reabertura de apontamento: motivo obrigatório e registrado
Ao mover de `CONCLUDED` para `REOPENED`, `reopen_reason` é obrigatório e registrado em audit_log.

---

**CMP-043** — Apontamento com risco CRITICAL: prazo máximo de 15 dias
Se risco associado for `CRITICAL`, prazo máximo é 15 dias. Maior exige confirmação do IT_MANAGER.

---

**CMP-044** — Norma sem itens normativos cadastrados não pode ser usada em auditoria
Tentativa exibe erro: "Norma sem controles cadastrados."

---

**CMP-045** — Evidência PDF com preview inline
Evidências PDF renderizadas em preview inline via presigned URL sem necessidade de download.

---

**CMP-046** — Item normativo NOT_STARTED conta como zero no score
Itens `NOT_STARTED` não contribuem para o numerador. Contam apenas no denominador.

---

**CMP-047** — Auditoria sem apontamentos pode ser concluída diretamente
Se nenhum apontamento foi criado, auditoria pode ser movida para `COMPLETED` com nota de "sem achados".

---

**CMP-048** — Apontamento pode ter múltiplos itens normativos associados
Um achado pode violar simultaneamente controles de diferentes normas (ex.: ISO 27001 e LGPD).

---

**CMP-049** — Compliance Score por auditoria preservado historicamente
Score calculado em cada auditoria `COMPLETED` é armazenado e imutável para histórico de evolução.

---

**CMP-050** — Norma regulatória obrigatória não pode ter peso zero no score global
Normas com `type = REGULATORY_BR` têm peso mínimo de 10% no score global.

---

**CMP-051** — Auditoria só pode ser cancelada com justificativa pelo IT_MANAGER+
Transição para `CANCELLED` exige justificativa obrigatória e papel IT_MANAGER ou COMPLIANCE_OFFICER.

---

**CMP-052** — Apontamento pode gerar projeto formal para regularização
Botão "Criar Projeto para Regularização" cria projeto no módulo de Projetos com rastreabilidade bidirecional.

---

**CMP-053** — Linha de auditoria mostra variação vs. auditoria anterior
Ao calcular score de nova auditoria para a mesma norma, sistema exibe delta com seta e cor vs. anterior.

---

**CMP-054** — IT_TECHNICIAN pode ser responsável por ActionItem (não por apontamento)
Analistas IT_TECHNICIAN podem ser designados em itens do plano de ação. O responsável pelo apontamento deve ser IT_SPECIALIST ou superior.

---

**CMP-055** — Evidência pode ser link externo (Google Drive, SharePoint)
Além de upload direto, evidência pode ser registrada como URL externa. Links externos não têm hash SHA-256.

---

**CMP-056** — Apontamento CRITICAL requer aprovação do IT_MANAGER para concluir
Além de evidências aprovadas, apontamentos CRITICAL precisam de aprovação formal do IT_MANAGER para `CONCLUDED`.

---

**CMP-057** — AUDITOR não pode criar, editar ou excluir registros
Papel `AUDITOR` tem acesso somente leitura. Sem permissão de escrita em nenhuma operação.

---

**CMP-058** — Data de fim de auditoria não pode ser anterior à data de início
Validação aplicada na criação e edição da auditoria.

---

**CMP-059** — Dashboard de compliance atualizado via Supabase Realtime
Alterações em apontamentos refletem no dashboard em <= 5 segundos via WebSocket.

---

**CMP-060** — Relatório de compliance score com gráfico de linha histórico
REL-CMP-010 inclui gráfico de linha mostrando a evolução do score ao longo das auditorias concluídas.

---

**CMP-061** — Apontamento pode ter múltiplas evidências sem limite máximo
Todas as evidências são exibidas na página do apontamento.

---

**CMP-062** — Apontamento recorrente tem badge visual diferenciado
Badge "RECORRENTE" em laranja exibido ao lado do código em todas as listagens.

---

**CMP-063** — Relatório de apontamentos vencidos enviado diariamente ao IT_MANAGER
Job diário às 07h00 envia lista de apontamentos vencidos se houver ao menos 1.

---

**CMP-064** — Auditoria pode ter mais de uma norma avaliada simultaneamente
Campo `norms_evaluated` é array de FKs. Apontamentos da auditoria referenciam normas deste array.

---

**CMP-065** — Prazo de apontamento pode ser prorrogado com justificativa e aprovação
Prorrogação requer `extension_reason` e aprovação do COMPLIANCE_OFFICER. Registrada em audit_log.

---

**CMP-066** — COMPLIANCE_OFFICER pode reatribuir apontamento a outro analista
Reatribuição registrada em audit_log com motivo. Novo responsável notificado imediatamente.

---

**CMP-067** — Em IN_VALIDATION: somente COMPLIANCE_OFFICER pode atualizar status
Quando `status = IN_VALIDATION`, apenas o COMPLIANCE_OFFICER pode alterar o status.

---

**CMP-068** — Norma pode ter itens normativos importados via CSV
SUPER_ADMIN pode importar itens normativos em lote via CSV para evitar cadastro manual.

---

**CMP-069** — Download em massa de evidências de auditoria em ZIP
COMPLIANCE_OFFICER pode solicitar download de todas as evidências em ZIP. Gerado assincronamente.

---

**CMP-070** — Auditoria com apontamentos CRITICAL abertos não pode ser concluída
Tentativa de mover para `COMPLETED` com apontamentos CRITICAL em aberto exibe bloqueio.

---

**CMP-071** — Compliance Score exibido com 1 casa decimal
Score exibido com 1 casa decimal nas interfaces (ex.: 75.3%).

---

**CMP-072** — Todos os relatórios de compliance respeitam permissões RBAC
Relatórios filtrados por tenant_id e papel do solicitante.

---

**CMP-073** — Evidência rejeitada: analista tem 3 dias para enviar nova evidência
Após rejeição, se o analista não enviar nova evidência em 3 dias úteis, o sistema escala ao coordenador.

---

**CMP-074** — Percentual de conclusão do apontamento é somente leitura
Calculado a partir dos ActionItems. Campo não editável manualmente na interface.

---

**CMP-075** — Exportação de evidências registrada em audit_log
Toda exportação registra: usuário, timestamp, lista de evidências exportadas.

---

**CMP-076** — Plano de ação 100% concluído sugere envio de evidências
Quando todos os ActionItems atingem `status = DONE`, sistema exibe notificação ao analista.

---

**CMP-077** — Observações internas visíveis apenas para IT_SPECIALIST+
Campo `internal_notes` não exibido para analistas IT_TECHNICIAN.

---

**CMP-078** — Auditoria cancelada: apontamentos vinculados movidos para CANCELLED
Ao cancelar auditoria, apontamentos com status != CONCLUDED são automaticamente cancelados.

---

**CMP-079** — Relatório de auditoria específica inclui variação de score vs. anterior
REL-CMP-002 exibe comparativo automático com a auditoria mais recente anterior da mesma norma.

---

**CMP-080** — Analista vê apenas apontamentos atribuídos a si sem papel superior
Usuários IT_TECHNICIAN veem apenas apontamentos onde `analyst_id = self`.

---

**CMP-081** — Notificação não enviada para usuário desativado
NotificationJob verifica `auth.User.status = ACTIVE` antes de enviar. IT_MANAGER notificado como fallback.

---

**CMP-082** — Evidências parcialmente aprovadas mantêm apontamento em IN_VALIDATION
Se parte aprovada e parte rejeitada, status permanece `IN_VALIDATION` até todas serem aprovadas ou resubmetidas.

---

**CMP-083** — Exportação de pacote inclui sumário executivo
REL-CMP-007 inclui sumário com: auditoria, período, número de apontamentos, score, lista de evidências com hashes.

---

**CMP-084** — Auditoria pode ser vinculada a projeto do módulo de Projetos
Campo `project_id` da auditoria vincula ao projeto correspondente de adequação.

---

**CMP-085** — Risco de compliance inclui plano de contingência obrigatório se CRITICAL ou HIGH
Ao cadastrar risco CRITICAL ou HIGH, campo `contingency_plan` é obrigatório.

---

**CMP-086** — COMPLIANCE_OFFICER pode adicionar comentários privados em apontamentos
Comentários com `private = true` visíveis apenas para COMPLIANCE_OFFICER e IT_MANAGER.

---

**CMP-087** — Dashboard de compliance pré-calculado por job nightly
KPIs do dashboard pré-calculados pelo `DashboardNightlyJob` para carregamento rápido.

---

**CMP-088** — Auditoria regulatória notifica IT_MANAGER ao ser criada
Criação de auditoria com `type = REGULATORY` envia notificação automática ao IT_MANAGER.

---

**CMP-089** — Apontamento pode ser clonado para nova auditoria
COMPLIANCE_OFFICER pode clonar apontamento recorrente preservando norma, item e criticidade.

---

**CMP-090** — Score de compliance calculado separadamente para cada norma
Score de uma norma não interfere no cálculo de outra.

---

**CMP-091** — Área responsável do apontamento determina o grupo de notificação
Notificações enviadas ao analista, coordenador do departamento e IT_MANAGER.

---

**CMP-092** — Apontamento com item normativo NOT_APPLICABLE bloqueado para criação
Não é possível criar apontamento para item com `aplicavel = false`. Exibe erro explicativo.

---

**CMP-093** — Relatório de conformidade exportável em PDF, Excel e CSV
Todos os relatórios do módulo suportam exportação nos três formatos.

---

**CMP-094** — Compliance Score não pode ser alterado manualmente
Score sempre calculado automaticamente pela fórmula oficial. Nenhum campo de score é editável.

---

**CMP-095** — Apontamento pode ser marcado como urgente além da criticidade
Campo `is_urgent` permite ao COMPLIANCE_OFFICER sinalizar urgência adicional. Badge "URGENTE" em vermelho.

---

**CMP-096** — Relatório executivo de compliance gerado automaticamente todo trimestre
No primeiro dia útil de jan, abr, jul e out, REL-CMP-011 é gerado e enviado ao IT_MANAGER e Diretoria.

---

**CMP-097** — Evidência aprovada revogável apenas pelo SUPER_ADMIN com justificativa
Em casos excepcionais, aprovação pode ser revogada pelo SUPER_ADMIN com justificativa e registro em audit_log.

---

**CMP-098** — Compliance Score histórico imutável por auditoria
Valores de score calculados em auditorias passadas são imutáveis e servem como histórico oficial.

---

**CMP-099** — Apontamento de observação (OBSERVATION) não bloqueia conclusão da auditoria
Apontamentos com tipo `OBSERVATION` ou `IMPROVEMENT_OPPORTUNITY` não impedem a auditoria de ser concluída.

---

**CMP-100** — Todo download de evidência gera entrada no audit_log
O acesso a arquivos de evidência (download) é rastreado com user_id, timestamp, evidence_id e IP do acesso.

---

## 22. Critérios de Aceitação

### 22.1 Apontamentos e Ciclo de Vida

- [ ] **CA-01:** Apontamento sem responsável bloqueado ao salvar.
- [ ] **CA-02:** Apontamento sem prazo bloqueado ao salvar.
- [ ] **CA-03:** Apontamento sem norma bloqueado ao salvar.
- [ ] **CA-04:** Apontamento sem item normativo bloqueado ao salvar.
- [ ] **CA-05:** Código `CMP-YYYY-NNNNNN` gerado automaticamente e imutável.
- [ ] **CA-06:** Apontamento vencido exibido com destaque vermelho em todas as telas.
- [ ] **CA-07:** Transição para CONCLUDED bloqueada sem evidência aprovada.
- [ ] **CA-08:** Transição para CANCELLED exige motivo com mínimo de 30 caracteres.
- [ ] **CA-09:** Apontamento CRITICAL com prazo superior a 30 dias exibe aviso.

### 22.2 Evidências

- [ ] **CA-10:** Upload de evidência com tipo não autorizado bloqueado no frontend e backend.
- [ ] **CA-11:** Hash SHA-256 calculado no servidor e armazenado no banco.
- [ ] **CA-12:** Presigned URL de evidência expira em 15 minutos.
- [ ] **CA-13:** Analista não pode aprovar sua própria evidência (SoD validado).
- [ ] **CA-14:** Evidência aprovada não pode ser excluída.
- [ ] **CA-15:** Rejeição de evidência exige motivo com mínimo de 30 caracteres.
- [ ] **CA-16:** Download de evidência registrado em audit_log com user_id e IP.

### 22.3 Notificações e Escalonamento

- [ ] **CA-17:** E-mail enviado ao analista, coordenador e IT_MANAGER 2 dias antes do vencimento.
- [ ] **CA-18:** E-mail enviado ao analista e coordenador 7 dias antes do vencimento.
- [ ] **CA-19:** E-mail diário enviado ao IT_MANAGER para apontamentos CRITICAL vencidos.
- [ ] **CA-20:** Notificação não enviada para usuário inativo; IT_MANAGER notificado como fallback.

### 22.4 Compliance Score

- [ ] **CA-21:** Score calculado automaticamente ao concluir auditoria (status = COMPLETED).
- [ ] **CA-22:** Score exibido com 1 casa decimal (ex.: 75.3%).
- [ ] **CA-23:** Score global é média ponderada configurável pelo SUPER_ADMIN.
- [ ] **CA-24:** Histórico de scores imutável por auditoria.

### 22.5 Segurança e Auditoria

- [ ] **CA-25:** audit_log registra todas as operações com old/new values.
- [ ] **CA-26:** RLS impede UPDATE e DELETE em `shared.audit_log`.
- [ ] **CA-27:** Auditor externo (papel AUDITOR) ve apenas dados da sua auditoria.
- [ ] **CA-28:** Pacote de evidências externo exige aprovação do IT_MANAGER.

### 22.6 Dashboard e Relatórios

- [ ] **CA-29:** Dashboard de compliance atualizado em <= 5 segundos via Realtime.
- [ ] **CA-30:** Relatório trimestral gerado automaticamente no primeiro dia útil.
- [ ] **CA-31:** Todos os relatórios respeitam permissões RBAC e tenant.
- [ ] **CA-32:** Relatório de compliance exportável em PDF, Excel e CSV.

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação com 22 seções, 100 regras CMP e 32 critérios de aceitação |

---

> **Próximos documentos recomendados:**
> [`46_FINANCIAL_MANAGEMENT.md`](./46_FINANCIAL_MANAGEMENT.md) — Módulo Financeiro (custos de compliance)
> [`48_PROJECT_MANAGEMENT.md`](./48_PROJECT_MANAGEMENT.md) — Gestão de Projetos (regularizações)
> [`60_DASHBOARDS.md`](./60_DASHBOARDS.md) — Dashboards consolidados
