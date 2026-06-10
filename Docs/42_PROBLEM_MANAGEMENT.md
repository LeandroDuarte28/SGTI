# SGTI — Sistema de Gestão de Tecnologia da Informação
## Módulo de Gestão de Problemas — Documentação Funcional

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [24_BUSINESS_RULES.md](./24_BUSINESS_RULES.md) · [40_INCIDENT_MANAGEMENT.md](./40_INCIDENT_MANAGEMENT.md) · [41_REQUEST_MANAGEMENT.md](./41_REQUEST_MANAGEMENT.md) · [31_SLA.md](./31_SLA.md) · [23_USER_ROLES.md](./23_USER_ROLES.md)

---

## Sobre este Documento

Este documento define a **especificação funcional completa do Módulo de Gestão de Problemas do SGTI**. Cobre o conceito ITIL v4, estrutura, metodologias de análise de causa raiz, fluxos, integrações, regras de negócio e critérios de aceitação.

**Escopo exclusivo:** documentação funcional e de processo. Nenhum código, SQL ou especificação de API é gerado aqui.

---

## Sumário

1. [Conceito de Problema](#1-conceito-de-problema)
2. [Objetivos do Processo](#2-objetivos-do-processo)
3. [Papéis e Responsabilidades](#3-papéis-e-responsabilidades)
4. [Estrutura do Problema](#4-estrutura-do-problema)
5. [Categorias de Problema](#5-categorias-de-problema)
6. [Priorização — Matriz Impacto × Urgência](#6-priorização--matriz-impacto--urgência)
7. [Fluxo de Atendimento](#7-fluxo-de-atendimento)
8. [Root Cause Analysis — RCA](#8-root-cause-analysis--rca)
9. [Workaround](#9-workaround)
10. [Solução Definitiva](#10-solução-definitiva)
11. [Integração com Gestão de Incidentes](#11-integração-com-gestão-de-incidentes)
12. [Integração com Gestão de Ativos](#12-integração-com-gestão-de-ativos)
13. [Integração com Base de Conhecimento](#13-integração-com-base-de-conhecimento)
14. [Integração com Compliance](#14-integração-com-compliance)
15. [Integração com Projetos](#15-integração-com-projetos)
16. [SLA de Problemas](#16-sla-de-problemas)
17. [Notificações](#17-notificações)
18. [Dashboards Operacionais](#18-dashboards-operacionais)
19. [Dashboards Executivos](#19-dashboards-executivos)
20. [Relatórios](#20-relatórios)
21. [Auditoria e Rastreabilidade](#21-auditoria-e-rastreabilidade)
22. [Compliance e Conformidade](#22-compliance-e-conformidade)
23. [Regras de Negócio](#23-regras-de-negócio)
24. [Critérios de Aceitação](#24-critérios-de-aceitação)

---

## 1. Conceito de Problema

### 1.1 Definição ITIL v4

> Um **Problema** é a causa ou causa potencial de um ou mais incidentes. Problemas são analisados para identificar e remover a causa raiz, reduzindo ou eliminando o impacto e a probabilidade de incidentes futuros.
>
> — ITIL v4, AXELOS

No contexto do SGTI, um problema é uma investigação formal de **por que** incidentes ocorrem — não uma resolução de um sintoma individual, mas a eliminação da causa que os origina.

### 1.2 Diferenciação de Conceitos

| Conceito | Pergunta-chave | Objetivo | Quem abre |
|----------|---------------|---------|:----------:|
| **Incidente** | "O que parou de funcionar?" | Restaurar o serviço o mais rápido possível | Qualquer usuário |
| **Problema** | "Por que continua parando?" | Eliminar a causa raiz para evitar recorrência | IT_SPECIALIST+ |
| **Requisição** | "O que preciso que seja feito?" | Entregar serviço solicitado de forma planejada | Qualquer usuário |
| **Mudança** | "Como implementar a solução com segurança?" | Controlar implementação de alterações (fora do escopo SGTI v1) | IT_SPECIALIST+ |

### 1.3 Tipos de Problema ITIL v4

| Tipo | Quando Ocorre | Característica |
|:----:|---------------|---------------|
| **Reativo** | Após um ou mais incidentes já ocorridos | Investigação pós-incidente; mais comum |
| **Pró-ativo** | Antes de o incidente ocorrer | Análise de tendências; incidente potencial detectado por monitoramento |

**Problema Reativo:** O incidente já causou impacto. O problema é criado para evitar que se repita.

**Problema Pró-ativo:** Monitoramento detecta comportamento anômalo crescente (ex.: utilização de disco em curva exponencial) antes da falha. Um problema é registrado preventivamente.

### 1.4 Erro Conhecido (Known Error — KEDB)

Um Problema atinge o estado de **Erro Conhecido** quando:
1. A causa raiz foi identificada e confirmada.
2. Um workaround foi definido (mesmo que temporário).
3. Não há solução definitiva implementada ainda.

O **KEDB (Known Error DataBase)** é o repositório de todos os Erros Conhecidos do SGTI, acessível pelos técnicos durante o atendimento de incidentes. Está diretamente integrado à Base de Conhecimento.

---

## 2. Objetivos do Processo

### 2.1 Objetivo Estratégico

Reduzir continuamente o número e o impacto de incidentes causados por causas raiz conhecidas, através de investigação estruturada, publicação de workarounds e implementação de soluções definitivas.

### 2.2 Objetivos Operacionais

| # | Objetivo | Indicador | Meta |
|---|----------|-----------|:----:|
| 1 | Identificar e registrar causas raiz de incidentes recorrentes | % incidentes recorrentes vinculados a Problema | 100% |
| 2 | Reduzir volume de incidentes recorrentes ao longo do tempo | Redução mensal de incidentes do mesmo serviço | ≥ 15% ao trimestre |
| 3 | Disponibilizar workarounds rapidamente | Tempo da identificação à publicação do workaround | ≤ 48 horas |
| 4 | Implementar soluções definitivas para causas raiz confirmadas | % problemas com solução definitiva implementada | ≥ 70% (6 meses) |
| 5 | Documentar todo conhecimento técnico gerado | % problemas com artigo KB vinculado | 100% |
| 6 | Reduzir MTTR de incidentes vinculados a Erros Conhecidos | MTTR com workaround vs. sem workaround | ≥ 40% de redução |
| 7 | Manter rastreabilidade para auditorias | % problemas com causa raiz documentada ao fechar | 100% |

### 2.3 Limites do Processo

**O módulo de Gestão de Problemas:**
- **Investiga** causas raiz — não resolve o incidente imediato (isso é do módulo de Incidentes).
- **Define workarounds** — não os aplica diretamente (o técnico de incidentes aplica).
- **Propõe soluções definitivas** — a implementação pode resultar em um Projeto.
- **Não bloqueia** o atendimento de incidentes — os processos são paralelos e independentes.

---

## 3. Papéis e Responsabilidades

### 3.1 Analista de TI (IT_TECHNICIAN)

**Responsabilidades no contexto de Problemas:**
- Sinalizar incidentes recorrentes que podem indicar Problema subjacente.
- Vincular incidentes ao Problema correto quando identificado pelo Coordenador.
- Aplicar workarounds publicados durante o atendimento de incidentes.
- Fornecer dados e logs aos Especialistas investigando o problema.

**Limitações:**
- Não pode criar Problemas (apenas IT_SPECIALIST+).
- Não pode confirmar causa raiz.
- Não pode publicar workarounds.

---

### 3.2 Especialista / Coordenador de TI (IT_SPECIALIST)

**Perfil:** Técnico sênior com conhecimento especializado em domínios específicos (Infraestrutura, Redes, Sistemas, Segurança).

**Responsabilidades:**
- **Criar** problemas ao identificar causa raiz sistêmica em incidentes recorrentes.
- **Conduzir** a investigação técnica e a análise de causa raiz (RCA).
- **Selecionar e aplicar** a metodologia de RCA adequada (5 Porquês, Ishikawa, etc.).
- **Registrar** hipóteses e descobertas durante a investigação.
- **Confirmar** a causa raiz após evidências suficientes.
- **Criar** workarounds e soluções definitivas para aprovação.
- **Vincular** incidentes ao problema correspondente.
- **Sugerir** transformação do problema em projeto se a solução for complexa.

---

### 3.3 Gestor de TI (IT_MANAGER)

**Responsabilidades:**
- **Monitorar** o dashboard de problemas em aberto, especialmente os críticos.
- **Aprovar** publicação de workarounds validados pelos Especialistas.
- **Aprovar** soluções definitivas antes da implementação.
- **Priorizar** problemas quando há conflito de recursos da equipe.
- **Decidir** quando um problema deve ser convertido em Projeto.
- **Comunicar** à alta direção problemas com impacto estratégico.
- **Conduzir** revisões pós-implementação de soluções definitivas.
- **Cobrar** análises de problemas recorrentes sem investigação em andamento.

---

### 3.4 Analista de Compliance (COMPLIANCE_OFFICER)

**Responsabilidades no contexto de Problemas:**
- **Verificar** conformidade de problemas com impacto regulatório (LGPD, ISO, auditorias).
- **Associar** problemas a apontamentos de auditoria correspondentes.
- **Solicitar** abertura formal de Problema quando incidentes de compliance se repetem.
- **Revisar** evidências de resolução de problemas com implicação regulatória.
- **Garantir** rastreabilidade completa de problemas vinculados a auditorias externas.

---

### 3.5 Administrador (SUPER_ADMIN)

**Responsabilidades:**
- Configurar categorias, subcategorias e taxonomia de problemas.
- Gerenciar parâmetros do módulo.
- Auditar todos os registros com acesso completo ao audit_log.
- Executar operações de correção de dados inconsistentes.

---

## 4. Estrutura do Problema

### 4.1 Seção: Identificação

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **Número** | String (sequencial) | Sim — automático | **Nunca** | Identificador legível único: `PRB-YYYY-NNNNNN`. Gerado pelo banco via BIGSERIAL. Imutável. |
| **Tipo** | Enum | Sim | Não | `REACTIVE` (pós-incidente) ou `PROACTIVE` (pró-ativo). |
| **Origem** | Enum | Sim — automático | Não | `MANUAL` (criado pelo técnico), `AUTO_SUGGEST` (sugestão automática por recorrência), `MONITORING` (alerta de monitoramento). |

### 4.2 Seção: Descrição

| Campo | Tipo | Obrigatório | Editável por | Descrição |
|-------|------|:-----------:|:------------:|-----------|
| **Título** | Texto (500 chars) | Sim | IT_SPECIALIST+ | Título descritivo do problema (não do sintoma). Errado: "VPN falhando". Certo: "Certificado SSL da VPN sem renovação automática". |
| **Descrição** | Texto longo | Sim | IT_SPECIALIST+ | Contextualização completa: histórico de incidentes, padrão observado, impacto acumulado, dados de monitoramento. |
| **Sintoma Observado** | Texto longo | Sim | IT_SPECIALIST+ | Manifestação visível do problema para os usuários. |
| **Hipótese Inicial** | Texto longo | Não | IT_SPECIALIST+ | Suspeita técnica inicial antes de confirmar causa raiz. Atualizada durante a investigação. |

### 4.3 Seção: Classificação

| Campo | Tipo | Obrigatório | Editável por | Descrição |
|-------|------|:-----------:|:------------:|-----------|
| **Serviço** | FK — ServiceCatalog | Sim | IT_SPECIALIST+ | Serviço afetado do catálogo. Obrigatório. |
| **Categoria** | Enum | Sim | IT_SPECIALIST+ | Categoria técnica do problema (ver seção 5). |
| **Subcategoria** | Enum | Não | IT_SPECIALIST+ | Refinamento dentro da categoria. |

### 4.4 Seção: Priorização

| Campo | Tipo | Obrigatório | Editável por | Descrição |
|-------|------|:-----------:|:------------:|-----------|
| **Impacto** | Enum | Sim | IT_SPECIALIST+ | `WIDESPREAD`, `SIGNIFICANT`, `MODERATE`, `MINOR`. Avaliado com base nos incidentes vinculados. |
| **Urgência** | Enum | Sim | IT_SPECIALIST+ | `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`. Quão rapidamente o problema precisa ser resolvido. |
| **Prioridade** | Enum | Sim — calculado | IT_MANAGER (ajuste manual) | Calculada pela Matriz I×U. Ajuste manual com justificativa. |
| **Usuários Afetados** | Inteiro | Não | IT_SPECIALIST+ | Total acumulado de usuários afetados pelos incidentes vinculados. |
| **Recorrência** | Inteiro | Automático | Não | Número de incidentes vinculados a este problema. Calculado automaticamente. |

### 4.5 Seção: Responsabilidade e Equipe

| Campo | Tipo | Obrigatório | Editável por | Descrição |
|-------|------|:-----------:|:------------:|-----------|
| **Responsável** | FK — User | Sim | IT_SPECIALIST+, IT_MANAGER | Especialista responsável pela investigação. Obrigatório. |
| **Grupo Responsável** | FK — IdentityGroup | Não | IT_SPECIALIST+ | Grupo de especialistas envolvido. |
| **Colaboradores** | Array FK — User | Não | IT_SPECIALIST+ | Outros técnicos participando da investigação (máx. 5). |

### 4.6 Seção: Status e Datas

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **Status** | Enum | Sim | Conforme transições | Status atual no ciclo de vida do problema. |
| **É Erro Conhecido** | Boolean | Sim — automático | Não | `true` quando causa raiz confirmada E workaround publicado. |
| **Título do Erro Conhecido** | Texto | Não | IT_SPECIALIST+ | Título simplificado exibido no KEDB para técnicos. |
| **Data de Abertura** | DateTime | Sim — automático | Não | Timestamp de criação. Preenchido pelo banco. |
| **Data de Identificação da Causa Raiz** | DateTime | Não — automático | Não | Preenchido ao confirmar causa raiz. |
| **Data de Publicação do Workaround** | DateTime | Não — automático | Não | Preenchido ao publicar o workaround. |
| **Data de Resolução** | DateTime | Não — automático | Não | Preenchido ao implementar solução definitiva. |
| **Data de Encerramento** | DateTime | Não — automático | Não | Preenchido ao fechar o problema. |

### 4.7 Seção: Investigação e RCA

| Campo | Tipo | Obrigatório | Editável por | Descrição |
|-------|------|:-----------:|:------------:|-----------|
| **Metodologia de RCA** | Enum | Sim (ao registrar causa raiz) | IT_SPECIALIST+ | `FIVE_WHYS`, `FISHBONE`, `FAULT_TREE`, `TIMELINE`, `PARETO`. |
| **Análise de Causa Raiz** | Texto longo | Sim (ao confirmar) | IT_SPECIALIST+ | Análise completa com metodologia aplicada, evidências e raciocínio. |
| **Causa Raiz Confirmada** | Boolean | Automático | Não | `true` quando IT_SPECIALIST confirma e IT_MANAGER valida. |
| **Confirmado Por** | FK — User | Automático | Não | IT_SPECIALIST que confirmou + IT_MANAGER que validou. |
| **Confirmado Em** | DateTime | Automático | Não | Timestamp da confirmação. |
| **Solução Definitiva** | Texto longo | Sim (ao resolver) | IT_SPECIALIST+ | Descrição da solução implementada. |
| **Solução Implementada** | Boolean | Automático | Não | `true` após validação da solução definitiva. |

### 4.8 Seção: Workaround

| Campo | Tipo | Obrigatório | Editável por | Descrição |
|-------|------|:-----------:|:------------:|-----------|
| **Título do Workaround** | Texto (300 chars) | Sim (se criado) | IT_SPECIALIST+ | Título conciso do workaround para exibição no KEDB. |
| **Passos do Workaround** | Texto longo | Sim (se criado) | IT_SPECIALIST+ | Instrução passo a passo para aplicação do workaround. |
| **Limitações do Workaround** | Texto longo | Sim (se criado) | IT_SPECIALIST+ | Casos onde não funciona; condições de aplicabilidade; riscos. |
| **Status do Workaround** | Enum | Automático | IT_MANAGER | `DRAFT` → `PUBLISHED` → `DEPRECATED`. |
| **Publicado Por** | FK — User | Automático | Não | IT_MANAGER que publicou. |
| **Publicado Em** | DateTime | Automático | Não | Timestamp da publicação. |
| **Artigo KB Vinculado** | FK — KnowledgeArticle | Automático | Não | Artigo KB gerado automaticamente pelo workaround. |

### 4.9 Seção: Evidências e Vínculos

| Campo | Tipo | Obrigatório | Editável por | Descrição |
|-------|------|:-----------:|:------------:|-----------|
| **Incidentes Vinculados** | Array FK — Incident | Sim (mínimo 1) | IT_SPECIALIST+ | Incidentes que originaram o problema. |
| **Ativos Relacionados** | Array FK — Asset | Não | IT_SPECIALIST+ | Equipamentos ou sistemas envolvidos. |
| **Apontamento Compliance** | FK — ComplianceFinding | Não | COMPLIANCE_OFFICER | Apontamento de auditoria correlacionado. |
| **Projeto Vinculado** | FK — Project | Não | IT_MANAGER+ | Projeto criado para implementar a solução definitiva. |
| **Anexos** | Lista FileReference | Não | IT_SPECIALIST+ | Logs, dumps, screenshots, relatórios de diagnóstico. Máx. 50 MB/arquivo. |

---

## 5. Categorias de Problema

### 5.1 Estrutura de Categorias e Subcategorias

| Categoria | Subcategorias | Exemplos de Problemas |
|-----------|--------------|----------------------|
| **Infraestrutura** | Servidores, Storage, Backup, Virtualização, Energia | Servidor com reinicialização espontânea; backup falhando semanalmente |
| **Redes** | LAN, Wi-Fi, VPN, Roteamento, DNS, Proxy, Firewall | VPN com queda diária; DNS com resolução lenta; switch com loop de rede |
| **Segurança** | Endpoints, Identidade, Certificados, Firewall, SIEM | Certificados SSL expirando sem alerta; malware recorrente em endpoints |
| **Sistemas** | ERP, CRM, Aplicações Internas, Integrações, APIs | Timeout recorrente no módulo financeiro; falha de integração ERP-CRM |
| **Banco de Dados** | Performance, Locks, Corrupção, Replicação, Backups | Query lenta impactando ERP periodicamente; locks recorrentes em tabela |
| **Google Workspace** | Gmail, Drive, Meet, Calendar, Admin, Grupos | Limite de armazenamento do Drive causando erros recorrentes |
| **Ativos** | Hardware Recorrente, Licenças, Periféricos, Fabricante | Modelo específico de notebook com falha de hardware em série |
| **Compliance** | LGPD, ISO, Auditoria, Controles Internos | Controle de acesso sem revisão periódica (não-conformidade sistêmica) |
| **Financeiro** | Integração Financeira, Relatórios, Conciliação | Divergências recorrentes na conciliação entre sistemas |
| **Projetos** | Infraestrutura de Projeto, Ferramentas, Integrações | Falha recorrente em pipeline de CI/CD de projeto específico |
| **Outro** | Não Classificado | Avaliado individualmente durante a investigação |

### 5.2 Expansão de Categorias

Novas categorias e subcategorias podem ser adicionadas pelo SUPER_ADMIN via módulo de Administração, sem necessidade de código. Cada nova categoria pode receber:
- Subcategorias específicas.
- Grupos de especialistas padrão.
- Templates de análise de causa raiz.

---

## 6. Priorização — Matriz Impacto × Urgência

### 6.1 Contexto de Priorização em Problemas

A priorização de Problemas difere dos Incidentes: enquanto incidentes priorizam a **velocidade de restauração do serviço**, problemas priorizam o **risco de recorrência e o impacto acumulado**.

### 6.2 Definição de Impacto (para Problemas)

| Nível | Código | Critérios para Problemas |
|:-----:|:------:|--------------------------|
| **Generalizado** | WIDESPREAD | > 50 usuários afetados acumuladamente pelos incidentes vinculados; serviço crítico comprometido ciclicamente |
| **Significativo** | SIGNIFICANT | 10–50 usuários afetados; departamento impactado periodicamente; SLA violado recorrentemente |
| **Moderado** | MODERATE | 2–10 usuários afetados; impacto periódico em processo secundário |
| **Menor** | MINOR | ≤ 2 usuários; inconveniência sem impacto em processo crítico; baixa recorrência |

### 6.3 Definição de Urgência (para Problemas)

| Nível | Código | Critérios para Problemas |
|:-----:|:------:|--------------------------|
| **Crítica** | CRITICAL | Processo crítico de negócio em risco iminente; incidente recorrente com SLA sempre violado; ameaça de segurança |
| **Alta** | HIGH | Processo importante com interrupções frequentes; workaround é precário ou tem alto custo operacional |
| **Média** | MEDIUM | Processo impactado mas com workaround eficiente; incidentes recorrentes mas controláveis |
| **Baixa** | LOW | Inconveniência tolerável; workaround resolve adequadamente; sem pressão por resolução imediata |

### 6.4 Matriz de Prioridade

```
                         U R G Ê N C I A
                    CRÍTICA   ALTA    MÉDIA   BAIXA
               ┌──────────┬────────┬────────┬────────┐
  GENERALIZADO │ CRÍTICO  │CRÍTICO │  ALTO  │  ALTO  │
               ├──────────┼────────┼────────┼────────┤
 SIGNIFICATIVO │ CRÍTICO  │  ALTO  │  ALTO  │ MÉDIO  │
               ├──────────┼────────┼────────┼────────┤
I    MODERADO  │  ALTO    │  ALTO  │ MÉDIO  │ BAIXO  │
M              ├──────────┼────────┼────────┼────────┤
P      MENOR   │  ALTO    │ MÉDIO  │ BAIXO  │ BAIXO  │
A              └──────────┴────────┴────────┴────────┘
C
T
O
```

### 6.5 Ajuste de Prioridade por Recorrência

O sistema aplica ajuste automático baseado na frequência dos incidentes vinculados:

| Condição | Ajuste |
|----------|--------|
| ≥ 10 incidentes vinculados (mesmo serviço, 30 dias) | Eleva mínimo para ALTO |
| ≥ 20 incidentes vinculados | Eleva para CRÍTICO |
| Incidente SEV-1 vinculado ao problema | Eleva para mínimo ALTO |
| Problema com SLA violado em > 50% dos incidentes vinculados | Eleva 1 nível |
| Problema com impacto financeiro documentado | Mínimo ALTO |

---

## 7. Fluxo de Atendimento

### 7.1 Diagrama Completo de Status

```
 ORIGENS DE CRIAÇÃO
 ──────────────────
 Manual (IT_SPECIALIST+) · Sugestão Automática (recorrência) · Monitoramento
                │
                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                        NOVO                                  │
 │                  (Status: NEW)                               │
 │  Problema registrado. Aguarda triagem do Coordenador.        │
 │  Incidentes vinculados na criação.                           │
 └──────────────────────────┬───────────────────────────────────┘
                            │ Coordenador valida e inicia
                            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                      EM INVESTIGAÇÃO                         │
 │              (Status: UNDER_INVESTIGATION)                   │
 │  Especialista conduz diagnóstico técnico aprofundado.        │
 │  Coleta de evidências, logs, métricas.                       │
 │  Hipóteses registradas e testadas.                           │
 └──────────────────────────┬───────────────────────────────────┘
                            │ Causa raiz identificada
                            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                  CAUSA RAIZ IDENTIFICADA                     │
 │            (Status: ROOT_CAUSE_IDENTIFIED)                   │
 │  RCA concluída. Causa confirmada pelo Especialista.          │
 │  Aguarda validação do Gestor.                                │
 └──────────┬──────────────────────────────────────────────────┘
            │
            ├── Workaround disponível:
            │         ▼
            │   ┌──────────────────────────────────────────────┐
            │   │          WORKAROUND DISPONÍVEL               │
            │   │         (via campo: workaround publicado)    │
            │   │  Workaround aprovado e publicado no KEDB.    │
            │   │  Artigo KB gerado automaticamente.           │
            │   │  Problema = ERRO CONHECIDO.                  │
            │   └──────────────────────────────────────────────┘
            │
            │ Gestor valida causa raiz
            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                     ERRO CONHECIDO                           │
 │                  (Status: KNOWN_ERROR)                       │
 │  Causa raiz confirmada. Workaround publicado.                │
 │  Solução definitiva planejada / em desenvolvimento.          │
 │  Disponível no KEDB para técnicos.                           │
 └──────────────────────────┬───────────────────────────────────┘
                            │ Solução implementada
                            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                       RESOLVIDO                              │
 │                  (Status: RESOLVED)                          │
 │  Solução definitiva implementada e validada.                 │
 │  Workaround depreciado automaticamente.                      │
 │  Incidentes vinculados informados da resolução.              │
 └──────────────────────────┬───────────────────────────────────┘
                            │ Período de validação cumprido
                            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                      ENCERRADO                               │
 │                   (Status: CLOSED)                           │
 │  Estado final. Somente leitura.                              │
 │  Reabertura possível se problema recorrer.                   │
 └──────────────────────────┬───────────────────────────────────┘
                            │ ← Recorrência detectada
                            ▼
                   ┌─────────────────────────┐
                   │      REABERTO           │
                   │  (retorna a NEW com     │
                   │   histórico preservado) │
                   └─────────────────────────┘

 ┌──────────────────────────────────────────────────────────────┐
 │                    CANCELADO (CANCELLED)                     │
 │  Problema criado por engano ou duplicidade.                  │
 │  Terminal. IT_MANAGER+. Justificativa obrigatória.           │
 └──────────────────────────────────────────────────────────────┘
```

### 7.2 Descrição Funcional de Cada Status

**NEW — Novo**
Problema recém-criado. Aguarda triagem pelo Coordenador para validar que é realmente um problema (e não um incidente) e atribuir responsável. Incidentes vinculados desde a criação.

**UNDER_INVESTIGATION — Em Investigação**
Especialista conduz investigação técnica ativa: coleta de logs, análise de métricas, testes de hipóteses. Evidências registradas como comentários internos e anexos.

**ROOT_CAUSE_IDENTIFIED — Causa Raiz Identificada**
A causa raiz foi identificada pelo Especialista usando metodologia de RCA estruturada. Aguarda validação do Gestor antes de avançar.

**KNOWN_ERROR — Erro Conhecido**
Causa raiz validada pelo Gestor. Workaround publicado (ou em processo de publicação). Disponível no KEDB para consulta pelos técnicos. Solução definitiva planejada ou em desenvolvimento.

**RESOLVED — Resolvido**
Solução definitiva implementada e validada em período de observação. Incidentes do mesmo tipo monitorados para confirmar que não ocorreram novamente.

**CLOSED — Encerrado**
Período de validação pós-resolução cumprido sem recorrência. Estado final somente leitura.

**CANCELLED — Cancelado**
Problema cancelado (duplicado ou aberto por engano). Terminal. Justificativa obrigatória.

### 7.3 Transições de Status Permitidas

| De → Para | Quem executa | Pré-condição |
|-----------|:------------:|:------------|
| NEW → UNDER_INVESTIGATION | IT_SPECIALIST+ | Responsável atribuído |
| NEW → CANCELLED | IT_MANAGER+ | Justificativa + motivo (engano/duplicata) |
| UNDER_INVESTIGATION → ROOT_CAUSE_IDENTIFIED | IT_SPECIALIST+ | RCA documentada + causa confirmada |
| UNDER_INVESTIGATION → KNOWN_ERROR | IT_SPECIALIST+ | Causa confirmada + workaround publicado |
| ROOT_CAUSE_IDENTIFIED → KNOWN_ERROR | IT_MANAGER (validação) | Gestor valida a causa raiz |
| ROOT_CAUSE_IDENTIFIED → UNDER_INVESTIGATION | IT_SPECIALIST+ | Causa raiz descartada; nova hipótese |
| KNOWN_ERROR → RESOLVED | IT_SPECIALIST+ | Solução implementada + evidência |
| RESOLVED → CLOSED | IT_MANAGER+ | Período de validação: 30 dias sem recorrência |
| CLOSED → NEW | IT_SPECIALIST+ (reabertura) | Justificativa: "Problema recorreu em {data}" |

---

## 8. Root Cause Analysis — RCA

### 8.1 Princípio da Obrigatoriedade

Toda investigação de problema no SGTI **deve** utilizar uma metodologia estruturada de RCA. Registrar "causa: hardware" ou "causa: bug" sem análise estruturada é considerado RCA insuficiente e bloqueia a confirmação da causa raiz.

A escolha da metodologia é do Especialista responsável, mas deve ser justificada.

---

### 8.2 Método: 5 Porquês (Five Whys)

**Conceito:** Técnica de interrogação iterativa que aprofunda a causa raiz perguntando "Por quê?" sucessivamente, tipicamente 5 vezes, até atingir a causa fundamental.

**Quando usar:**
- Problemas com causa raiz linear e direta.
- Problemas de processo (falha humana, falta de procedimento).
- Quando o time técnico é pequeno ou o problema é relativamente simples.
- Tempo disponível é curto (análise pode ser feita em 1–2 horas).

**Quando NÃO usar:**
- Problemas com múltiplas causas simultâneas e interconectadas.
- Problemas de alta complexidade técnica com muitas variáveis.

**Estrutura no SGTI:**

```
Campo "Análise de Causa Raiz" com 5 níveis obrigatórios:

Sintoma (Nível 0):   A VPN parou de conectar
Por quê 1:           O certificado SSL expirou
Por quê 2:           A renovação automática do certificado não foi executada
Por quê 3:           O script de renovação falhou silenciosamente
Por quê 4:           O script não tinha monitoramento de sucesso/falha configurado
Por quê 5 (raiz):    O processo de renovação de certificados não possui alertas
                      automáticos nem foi documentado nos procedimentos operacionais

CAUSA RAIZ CONFIRMADA:
Ausência de procedimento documentado e alerta automático para renovação
de certificados SSL, tornando o processo dependente de intervenção manual
sem gatilho de notificação.
```

---

### 8.3 Método: Diagrama de Ishikawa (Fishbone / Espinha de Peixe)

**Conceito:** Diagrama visual que categoriza causas em 6 ramos principais (6Ms) convergindo para o efeito/problema central.

**Quando usar:**
- Problemas com múltiplas causas potenciais de diferentes naturezas.
- Problemas que envolvem pessoas, processos, tecnologia e ambiente simultaneamente.
- Análise em grupo (workshops de análise).
- Problemas recorrentes com causas anteriores não totalmente identificadas.

**Os 6 Ramos do Diagrama (adaptados para TI):**

| Categoria | Descrição | Perguntas-guia |
|-----------|-----------|----------------|
| **Método** | Processos e procedimentos | O processo é adequado? Existe documentação? É seguido? |
| **Máquina** | Hardware e infraestrutura | O equipamento está calibrado? Em manutenção? Obsoleto? |
| **Material** | Software, dados, licenças | O software está atualizado? Os dados estão íntegros? |
| **Mão de Obra** | Habilidades e treinamento | A equipe tem o conhecimento necessário? Houve falha humana? |
| **Meio Ambiente** | Infraestrutura física, energia, rede | O ambiente é estável? Há interferências externas? |
| **Medição** | Monitoramento e alertas | Os alertas estão configurados? As métricas são adequadas? |

**Estrutura no SGTI:**
O campo "Análise de Causa Raiz" exibe uma tabela estruturada com os 6 ramos, onde o Especialista documenta cada hipótese investigada e descarta ou confirma causas por categoria.

---

### 8.4 Método: Análise de Pareto (Regra 80/20)

**Conceito:** Identificar os 20% das causas que geram 80% dos problemas, priorizando o esforço de resolução nas causas mais impactantes.

**Quando usar:**
- Análise de múltiplos problemas similares para identificar padrão dominante.
- Decisão sobre quais causas priorizar quando há múltiplas candidatas.
- Justificativa de investimento em solução específica.
- Análise de tendências de incidentes por serviço ou categoria.

**Aplicação no SGTI:**
O dashboard de Problemas gera automaticamente o Gráfico de Pareto de:
- Incidentes por serviço (top 20% de serviços que geram 80% dos incidentes).
- Categorias de causa raiz mais frequentes.
- Incidentes por grupo responsável.

Utilizado pelo Gestor para priorizar quais problemas resolver primeiro.

---

### 8.5 Método: Árvore de Falhas (Fault Tree Analysis — FTA)

**Quando usar:**
- Problemas de segurança com múltiplas vias de falha.
- Infraestrutura crítica onde é necessário mapear todos os caminhos possíveis até a falha.
- Análise de confiabilidade de sistemas complexos.
- Incidentes SEV-1 com causa não imediatamente evidente.

---

### 8.6 Método: Análise de Linha do Tempo (Timeline Analysis)

**Quando usar:**
- Incidentes em que a sequência de eventos é crítica para entender a causa.
- Problemas de segurança (correlação de eventos em logs).
- Falhas intermitentes que ocorrem em horários ou condições específicas.
- Post-mortems de incidentes SEV-1.

---

### 8.7 Guia de Seleção da Metodologia

```
ÁRVORE DE DECISÃO PARA SELEÇÃO DE METODOLOGIA

Problema tem causa única e linear?
  SIM → FIVE_WHYS

O problema envolve múltiplas causas simultâneas?
  SIM → FISHBONE (Ishikawa)

É necessário priorizar entre múltiplos problemas similares?
  SIM → PARETO

O problema é de segurança ou envolve múltiplas vias de falha?
  SIM → FAULT_TREE

A sequência de eventos é crítica para entender a causa?
  SIM → TIMELINE
  
Incidente SEV-1 com causa complexa?
  SIM → TIMELINE + FISHBONE (combinados)
```

---

## 9. Workaround

### 9.1 Conceito

Um **Workaround** é uma **solução temporária** que reduz ou elimina o impacto de um problema enquanto a solução definitiva não está disponível. O workaround não resolve a causa raiz — apenas mitiga o sintoma.

**Diferenças importantes:**

| Aspecto | Workaround | Solução Definitiva |
|---------|:----------:|:-----------------:|
| Remove a causa raiz? | ❌ Não | ✅ Sim |
| Velocidade de implementação | Rápida (horas/dias) | Lenta (dias/semanas) |
| Custo operacional | Médio (depende da complexidade) | Geralmente mais alto |
| Risco de aplicação | Baixo | Médio a alto (requer teste) |
| Duração | Temporária | Definitiva |

### 9.2 Critérios para Criação de Workaround

Um workaround deve ser criado quando:
- A causa raiz foi identificada (mesmo que não confirmada).
- A solução definitiva levará mais de 48 horas para ser implementada.
- Há impacto recorrente nos usuários durante o período de investigação.

### 9.3 Estrutura do Workaround

```
COMPONENTES OBRIGATÓRIOS DO WORKAROUND

1. Título (curto e descritivo para o KEDB)
   Exemplo: "Reiniciar cliente VPN resolve temporariamente"

2. Passos Detalhados
   1. Feche completamente o Cisco AnyConnect (File → Exit)
   2. Aguarde 60 segundos
   3. Reabra o Cisco AnyConnect
   4. Tente conectar normalmente
   5. Se o erro persistir: reiniciar o serviço VPN (se técnico)
      ou aguardar 5 minutos e tentar novamente (se usuário final)

3. Quando NÃO funciona (Limitações)
   - Se o certificado tiver mais de 48h expirado
   - Se o servidor VPN estiver inacessível
   - Em dispositivos iOS (workaround alternativo disponível)

4. Audiência
   END_USER (usuário pode aplicar) ou TECHNICAL (apenas técnico)

5. Efetividade Estimada
   Resolve o sintoma em: ≥ 85% dos casos
```

### 9.4 Critérios de Aprovação do Workaround

O workaround é aprovado pelo IT_MANAGER seguindo os critérios:

| Critério | O que verificar |
|----------|----------------|
| **Completude** | Os passos são claros e não ambíguos? Qualquer técnico/usuário consegue seguir? |
| **Segurança** | O workaround introduz novos riscos de segurança? |
| **Efetividade** | Foi testado em ambiente real? Taxa de sucesso documentada? |
| **Limitações** | As limitações e casos de falha estão documentados? |
| **Audiência** | O nível técnico adequado está selecionado? |

### 9.5 Critérios de Publicação e Impactos

Ao publicar o workaround (aprovação do IT_MANAGER):

```
AÇÕES AUTOMÁTICAS AO PUBLICAR WORKAROUND

1. Status do Problema → KNOWN_ERROR (se já havia causa raiz confirmada)
2. Campo is_known_error = true no Problem
3. Evento WorkaroundPublished publicado no EventBus:
   a. KnowledgeModule: Criação automática de rascunho DRAFT_AI na KB
   b. IncidentModule: Novos incidentes do mesmo serviço exibem banner de workaround
   c. KEDB: Workaround disponível na listagem para técnicos
4. Notificação ao grupo responsável pelo serviço
5. AuditLog: action=WORKAROUND_PUBLISHED + published_by + timestamp
```

### 9.6 Depreciação Automática do Workaround

Quando a solução definitiva é implementada e validada:
- O workaround é automaticamente marcado como `DEPRECATED`.
- O artigo KB vinculado é atualizado com a solução definitiva.
- O banner no KEDB é atualizado: "Solução definitiva disponível — workaround não mais necessário."
- Técnicos que aplicaram o workaround nos últimos 30 dias são notificados da solução definitiva.

---

## 10. Solução Definitiva

### 10.1 Conceito e Objetivo

A **Solução Definitiva** é a implementação técnica que remove a causa raiz do problema, eliminando permanentemente a possibilidade de recorrência (ou reduzindo drasticamente sua probabilidade).

### 10.2 Critérios para Definição da Solução

A solução definitiva deve atender:

| Critério | Descrição |
|----------|-----------|
| **Endereça a causa raiz** | Atua diretamente na causa identificada, não nos sintomas |
| **Verificável** | Há evidência objetiva de que foi implementada (config, log, teste) |
| **Monitorável** | Após implementação, há indicadores que confirmam a resolução |
| **Viável** | Técnica e economicamente viável para a organização |
| **Sem novos riscos** | Não introduz novos problemas |

### 10.3 Tipos de Solução Definitiva

| Tipo | Exemplos |
|:----:|---------|
| **Técnica direta** | Atualização de software, patch de segurança, configuração corrigida |
| **Infra/Hardware** | Substituição de componente defeituoso, upgrade de infraestrutura |
| **Processo** | Criação de procedimento operacional, automação de processo manual |
| **Treinamento** | Capacitação da equipe para evitar erro humano recorrente |
| **Monitoramento** | Implantação de alerta que detecta o problema antes do impacto |
| **Projeto** | Quando a solução é complexa e requer planejamento formal (ver seção 15) |

### 10.4 Aprovações para Implementar Solução Definitiva

| Complexidade da Solução | Aprovação Necessária |
|------------------------|:-------------------:|
| Alteração de configuração simples (baixo risco) | IT_SPECIALIST aprova e implementa |
| Alteração de configuração em ambiente de produção | IT_MANAGER obrigatório |
| Atualização de software crítico | IT_MANAGER + janela de manutenção |
| Mudança arquitetural ou de infraestrutura | IT_MANAGER + Diretoria (acima de R$50k) |
| Solução que requer projeto formal | IT_MANAGER + abertura de Projeto |

### 10.5 Evidências Exigidas para Solução Definitiva

Antes de marcar o problema como RESOLVED:

1. **Evidência de implementação:** print de configuração, log de deploy, screenshot do sistema atualizado.
2. **Teste de validação:** resultado de teste que confirma que o problema não reproduz mais.
3. **Período de observação:** mínimo de **30 dias** sem recorrência do incidente correspondente.
4. **Confirmação do Gestor:** IT_MANAGER valida as evidências e aprova a resolução.

### 10.6 Período de Validação

```
PERÍODO DE VALIDAÇÃO PÓS-IMPLEMENTAÇÃO

Problema RESOLVED:
  → Monitoramento ativo por 30 dias
  → SlaMonitoringJob verifica se novos incidentes do mesmo serviço/tipo foram abertos
  
  Se incidente recorrer durante o período:
    → Problema permanece em RESOLVED (não cancela a solução)
    → Nova investigação iniciada (novo Problema ou reabertura)
    → IT_MANAGER notificado
  
  Após 30 dias sem recorrência:
    → IT_MANAGER pode fechar o problema (CLOSED)
    → Artigo KB atualizado com solução definitiva
    → Post-mortem opcional para problemas críticos
```

---

## 11. Integração com Gestão de Incidentes

### 11.1 Vinculação de Incidentes ao Problema

**Criação na abertura:** O Especialista pode vincular incidentes existentes ao criar o Problema.

**Vinculação durante investigação:** Incidentes adicionais podem ser vinculados a qualquer momento durante a investigação.

**Vinculação pelo técnico de incidente:** Ao atender um incidente, o Analista pode vinculá-lo a um Problema existente via botão "Vincular a Problema".

### 11.2 Critérios para Abertura Automática de Problema

O sistema gera automaticamente uma **sugestão de Problema** (não cria o Problema — requer confirmação do IT_SPECIALIST) quando:

| Condição | Gatilho | Ação |
|----------|---------|------|
| ≥ 3 incidentes do mesmo serviço em 7 dias | `SlaMonitoringJob` detecção de padrão | Sugestão com badge "Recorrência Detectada" na fila do IT_SPECIALIST |
| Mesmo ativo vinculado em ≥ 3 incidentes abertos | `AssetIncidentTracker` | Sugestão vinculada ao ativo |
| Incidente reaberto 2+ vezes | `IncidentReopenHandler` | Sugestão imediata |
| SLA violado em ≥ 3 incidentes do mesmo serviço no mês | `SlaBreachAnalyzer` | Sugestão mensal |

**Notificação:** IT_SPECIALIST recebe in-app: "3 incidentes do serviço VPN nos últimos 7 dias. Criar Problema?"

### 11.3 Efeitos da Vinculação

Quando um incidente é vinculado a um Problema:

```
EFEITOS DA VINCULAÇÃO INCIDENTE ↔ PROBLEMA

No Incidente:
  → Badge "Vinculado ao Problema PRB-YYYY-NNNNNN" exibido
  → Se KNOWN_ERROR: workaround exibido automaticamente ao técnico
  → Campo problem_id preenchido

No Problema:
  → Lista de incidentes vinculados atualizada
  → Contadores de recorrência e usuários_afetados recalculados
  → Prioridade pode ser ajustada automaticamente

Na Resolução do Problema:
  → Todos os incidentes vinculados ABERTOS recebem comentário de sistema:
    "A causa raiz deste problema foi resolvida. Verifique se o sintoma persiste."
```

### 11.4 Cardinalidade

| Relação | Cardinalidade | Observação |
|---------|:------------:|-----------|
| Incidente ↔ Problema | N:1 | Um incidente pode ser vinculado a apenas 1 problema |
| Problema ↔ Incidentes | 1:N | Um problema pode ter múltiplos incidentes vinculados |
| Problema ↔ Problema | 1:1 (superseeded_by) | Problema reaberto referencia o anterior |

---

## 12. Integração com Gestão de Ativos

### 12.1 Ativos Vinculáveis

| Tipo de Ativo | Quando Vincular | Exemplo |
|---------------|:---------------:|---------|
| Computador / Notebook | Hardware com falha recorrente | Notebook modelo X com pane de GPU após 1 ano |
| Servidor | Servidor com reinicialização espontânea | PowerEdge R750 com falha de PSU recorrente |
| Impressora | Impressora com atolamento ou falha de rede | HP LaserJet com erro de firmware |
| Monitor | Monitor com problema de imagem recorrente | LG 27" com flicker após aquecimento |
| Software | Aplicação com bugs recorrentes | ERP v3.2 com timeout no módulo fiscal |
| Licença | Licença expirando sem alerta | Adobe CC com renovação manual sem processo |
| Switch / Roteador | Dispositivo de rede com instabilidade | Cisco Catalyst com loop de spanning tree |

### 12.2 Efeitos da Vinculação de Ativo

- O histórico do ativo exibe o Problema vinculado.
- O MTBF (Mean Time Between Failures) do ativo é atualizado ao resolver o problema.
- Se o problema for de hardware recorrente no mesmo modelo: o sistema sugere avaliação de substituto ao IT_MANAGER.
- Ativo vinculado a problema CRÍTICO tem flag de "ativo problemático" no inventário.

---

## 13. Integração com Base de Conhecimento

### 13.1 Geração Automática de Artigo por Workaround

Ao publicar o workaround:

```
WorkaroundPublished event →
  KnowledgeModule.createDraftArticle({
    title: "[Problema PRB-YYYY] {titulo_do_workaround}",
    content: {passos_do_workaround} + {limitacoes} + {problema_vinculado},
    category: categoria_do_problema,
    status: DRAFT_AI,
    source_problem_id: problem.id,
    audience: TECHNICAL (padrão; ajustável)
  })
  → Notifica IT_SPECIALIST: "Rascunho de artigo KB criado para revisão."
```

### 13.2 Atualização do Artigo com Solução Definitiva

Quando o problema é marcado como RESOLVED:

```
ProblemResolved event →
  Se existe artigo KB vinculado ao workaround:
    → Adiciona seção "Solução Definitiva" ao artigo
    → Status do artigo atualizado: aguarda re-publicação
    → Workaround marcado como DEPRECATED no artigo
    → Notifica autor do artigo para revisar e republicar
```

### 13.3 Sugestão de Artigos Existentes

Durante a investigação, o sistema exibe automaticamente artigos KB relacionados:
- Busca full-text no título e descrição do problema.
- Exibe artigos de problemas similares resolvidos anteriormente.
- Exibe workarounds de erros conhecidos do mesmo serviço.

### 13.4 KEDB — Base de Erros Conhecidos

Problemas com status KNOWN_ERROR alimentam automaticamente o KEDB:

```
KEDB (Known Error DataBase) — Visão do Técnico
─────────────────────────────────────────────────
Serviço: VPN Corporativa

🔴 ERRO CONHECIDO: Certificado SSL expira sem renovação automática
   Workaround: Reiniciar o cliente VPN resolve em 85% dos casos
   [Ver passos completos] [Vincular ao incidente atual]
   Problema: PRB-2026-000042 | Em investigação para solução definitiva
```

---

## 14. Integração com Compliance

### 14.1 Associação Problema ↔ Apontamento de Auditoria

O Compliance Officer pode associar um Problema a um apontamento formal de auditoria (ComplianceFinding) quando o problema representa uma não-conformidade sistêmica:

**Cenários de associação:**
- Controle de acesso sem revisão periódica → Problema de Compliance + NC em auditoria ISO 27001.
- Processo de backup sem evidência de teste → Problema de Infraestrutura + NC em auditoria interna.
- Vazamento de dados por falha de controle → Problema de Segurança + NC regulatória LGPD.

**Efeitos da Associação:**
- O Problema aparece no relatório de tratamento de não-conformidades da auditoria.
- A resolução do Problema pode ser usada como evidência de tratamento da NC.
- Problemas com NC vinculada têm prazo de resolução alinhado ao prazo da NC.

### 14.2 Rastreabilidade para Auditorias Externas

Para auditorias externas (ISO 27001, SOC 2, regulatórias):

| Documento | Gerado pelo Sistema |
|-----------|:-------------------:|
| Relatório de Problemas Abertos com NC vinculada | Automático por módulo de Compliance |
| Histórico de causas raiz documentadas | Automático via audit_log |
| Evidências de workarounds e soluções implementadas | Via FileReference + AuditLog |
| Relatório de redução de incidentes recorrentes | Dashboard Executivo |

---

## 15. Integração com Projetos

### 15.1 Transformar Correção em Projeto Formal

Quando a solução definitiva requer:
- Esforço estimado > 80 horas de trabalho.
- Custo > R$10.000,00.
- Envolvimento de múltiplos times por mais de 1 mês.
- Mudança arquitetural significativa.

O IT_MANAGER pode transformar a solução definitiva do problema em um Projeto formal no módulo de Projetos:

```
FLUXO DE TRANSFORMAÇÃO EM PROJETO

1. Na página do Problema → botão "Criar Projeto para Solução"
2. Sistema pré-preenche:
   - Nome do projeto: "Solução: {titulo_do_problema}"
   - Descrição: análise de causa raiz + descrição da solução
   - Justificativa: incidentes vinculados + impacto acumulado
3. IT_MANAGER completa: sponsor, gerente, cronograma, orçamento
4. Projeto aprovado e iniciado
5. Problema fica vinculado ao Projeto via campo project_id
6. O dashboard do Projeto exibe: "Origem: Problema PRB-YYYY-NNNNNN"
```

### 15.2 Associar Problema a Projeto Existente

Se já existe um Projeto em andamento que abrange a solução do problema:

1. Na página do Problema → campo "Projeto Vinculado".
2. Buscar o projeto pelo código ou nome.
3. Confirmar a associação.
4. O Gerente do Projeto recebe notificação: "Problema PRB-YYYY-NNNNNN vinculado ao seu projeto."

### 15.3 Visibilidade Bidirecional

| No Problema | No Projeto |
|:-----------:|:-----------:|
| Link para o projeto vinculado | Link para o problema de origem |
| Status do projeto visível | Lista de problemas vinculados |
| Alertas de atraso do projeto | Impacto dos problemas no escopo |

---

## 16. SLA de Problemas

### 16.1 Filosofia de SLA para Problemas

Diferentemente de Incidentes, o SLA de Problemas é medido em **dias**, não em horas, refletindo a natureza investigativa e o planejamento necessário para soluções definitivas. O foco principal é:
- **Tempo para confirmar causa raiz** (SLA de investigação).
- **Tempo para publicar workaround** (SLA de mitigação).
- **Tempo para implementar solução definitiva** (SLA de resolução).

### 16.2 SLA por Prioridade

| Prioridade | Triagem | Causa Raiz Identificada | Workaround Publicado | Solução Definitiva |
|:----------:|:-------:|:-----------------------:|:--------------------:|:-----------------:|
| **CRÍTICO** | 2 horas | 2 dias úteis | 48 horas | 30 dias |
| **ALTO** | 4 horas | 5 dias úteis | 5 dias úteis | 60 dias |
| **MÉDIO** | 1 dia útil | 15 dias úteis | 15 dias úteis | 90 dias |
| **BAIXO** | 2 dias úteis | 30 dias úteis | 30 dias úteis | 180 dias |

**Notas:**
- O SLA de "Workaround Publicado" não é obrigatório — somente quando o workaround é tecnicamente viável.
- O SLA de "Solução Definitiva" é uma meta, não uma violação automática. Após o prazo, o IT_MANAGER é alertado para justificar a extensão ou transformar em projeto.

### 16.3 Alertas de SLA para Problemas

| Marco | Alerta Para | Canal |
|:-----:|:------------|:-----:|
| 50% do prazo de causa raiz | IT_SPECIALIST responsável | In-app |
| 80% do prazo de causa raiz | IT_SPECIALIST + IT_MANAGER | In-app + e-mail |
| Prazo de causa raiz vencido | IT_MANAGER | E-mail urgente |
| 30 dias sem workaround em problema CRÍTICO | IT_MANAGER + Compliance | E-mail |
| Prazo de solução definitiva vencido | IT_MANAGER | E-mail mensal |

### 16.4 Problema sem Resolução > 90 dias

Problemas abertos há mais de 90 dias sem solução definitiva:
- Aparecem em relatório especial mensal para IT_MANAGER.
- IT_MANAGER deve documentar justificativa para manutenção em aberto.
- Após 180 dias sem justificativa: alerta para Diretoria.

---

## 17. Notificações

### 17.1 Tabela de Notificações

| Evento | Destinatário(s) | Canal | Momento |
|--------|:--------------:|:-----:|---------|
| Problema criado | IT_MANAGER + Responsável designado | E-mail + in-app | Imediato |
| Problema CRÍTICO criado | IT_MANAGER + Grupo responsável | E-mail urgente + in-app | Imediato |
| Responsável atribuído | Responsável | In-app | Imediato |
| Status → UNDER_INVESTIGATION | Técnicos com incidentes vinculados | In-app | Imediato |
| Status → ROOT_CAUSE_IDENTIFIED | IT_MANAGER (para validação) | E-mail + in-app | Imediato |
| Causa raiz validada pelo Gestor | IT_SPECIALIST responsável | In-app | Imediato |
| Workaround publicado | Grupo responsável pelo serviço | E-mail + in-app | Imediato |
| Workaround publicado | Técnicos com incidentes vinculados | In-app | Imediato |
| Status → KNOWN_ERROR | IT_MANAGER + Compliance | In-app | Imediato |
| Solução definitiva implementada | IT_MANAGER + Solicitantes dos incidentes | E-mail + in-app | Imediato |
| Status → RESOLVED | IT_MANAGER + Compliance | E-mail | Imediato |
| Problema reaberto | IT_MANAGER + IT_SPECIALIST | E-mail + in-app | Imediato |
| Problema CRÍTICO sem causa raiz (> 80% prazo) | IT_MANAGER | E-mail urgente | Automático |
| Sugestão automática de Problema (recorrência) | IT_SPECIALIST | In-app | Automático |
| Problema vinculado a NC de compliance | COMPLIANCE_OFFICER | In-app + e-mail | Imediato |
| Workaround depreciado pós-solução definitiva | Técnicos que o usaram nos últimos 30 dias | In-app | Automático |
| Problema > 90 dias sem resolução | IT_MANAGER | E-mail mensal | Automático |

### 17.2 Notificação a Solicitantes de Incidentes Vinculados

Quando o problema é resolvido (RESOLVED), os solicitantes de todos os incidentes vinculados recebem:

```
Assunto: [SGTI] Causa raiz resolvida — {título_do_problema}

O problema técnico que causou os chamados nos quais você foi afetado
foi resolvido de forma definitiva pela equipe de TI.

Serviço: {nome_do_serviço}
Solução implementada: {resumo_da_solução}
Data de implementação: {data}

Caso o sintoma persista, abra um novo chamado descrevendo a situação.
```

---

## 18. Dashboards Operacionais

### 18.1 Painel Operacional em Tempo Real

**Destino:** IT_SPECIALIST, Coordenadores e IT_MANAGER.

| Componente | Dados Exibidos |
|------------|---------------|
| **Problemas Abertos por Status** | NEW / UNDER_INVESTIGATION / ROOT_CAUSE_IDENTIFIED / KNOWN_ERROR |
| **Problemas Críticos Ativos** | Lista com countdown do SLA |
| **Em Investigação** | Número e lista de problemas com investigação ativa |
| **Erros Conhecidos (KEDB)** | Total de erros conhecidos sem solução definitiva |
| **Sem Responsável** | Problemas sem técnico atribuído |
| **SLA em Risco** | Problemas com > 80% do prazo de causa raiz consumido |
| **Sugestões de Problema** | Alertas de recorrência aguardando avaliação |

### 18.2 Indicadores Operacionais Principais

| Indicador | Fórmula | Meta |
|-----------|---------|:----:|
| **Problemas Abertos** | COUNT(status NOT IN RESOLVED, CLOSED, CANCELLED) | — |
| **Problemas Resolvidos (período)** | COUNT(RESOLVED + CLOSED no período) | Tendência crescente |
| **Problemas em Investigação** | COUNT(status = UNDER_INVESTIGATION) | — |
| **Problemas Críticos** | COUNT(status ≠ CLOSED AND prioridade = CRITICAL) | ≤ 2 simultâneos |
| **MTTR de Problemas** | AVG(resolved_at - created_at) em dias | Redução trimestral |
| **KEDB (Erros Conhecidos)** | COUNT(status = KNOWN_ERROR) | Tendência de redução |
| **Taxa de Reincidência** | COUNT(reabertos) / COUNT(fechados) × 100 | ≤ 5% |

---

## 19. Dashboards Executivos

### 19.1 Visão Estratégica

**Destino:** IT_MANAGER e Diretoria. Período configurável.

| Indicador Executivo | Fórmula / Composição | Objetivo |
|--------------------|---------------------|---------|
| **Top Causas Raiz** | Ranking das causas raiz mais frequentes por categoria | Identificar padrões estruturais |
| **Serviços Mais Impactados** | Serviços com maior número de problemas vinculados | Priorizar investimentos em melhoria |
| **Redução de Incidentes Recorrentes** | Comparativo mensal de incidentes do mesmo serviço antes/após resolução de problema | Medir efetividade do processo |
| **Tendência Anual de Problemas** | Volume de problemas criados vs. resolvidos mês a mês | Capacidade de gestão |
| **Problemas por Categoria** | Distribuição por Infraestrutura / Sistemas / Segurança / etc. | Foco de investimento |

### 19.2 Gráficos Executivos

| Gráfico | Tipo | Objetivo |
|---------|:----:|---------|
| Problemas abertos vs. resolvidos por mês | Linha | Tendência de resolução |
| Top 10 serviços com mais problemas (Pareto) | Barras + Pareto | Onde investir em melhorias |
| Distribuição por categoria | Pizza | Natureza dos problemas |
| Redução de incidentes pós-resolução de problema | Barras comparativas | ROI do processo |
| MTTR de problemas por trimestre | Linha | Eficiência da investigação |
| Workarounds publicados vs. soluções definitivas | Barras agrupadas | Maturidade do processo |

---

## 20. Relatórios

### 20.1 Relatórios Operacionais

| Relatório | Geração | Destinatário | Conteúdo |
|-----------|:-------:|:------------:|---------|
| **Problemas em Aberto** | Semanal (seg 07h) | IT_MANAGER + Coordenadores | Lista completa com status, prioridade, SLA |
| **Investigações em Andamento** | Semanal | IT_MANAGER | Problemas em UNDER_INVESTIGATION com progresso |
| **Erros Conhecidos (KEDB)** | Mensal | IT_MANAGER + Suporte | Lista completa de Known Errors com workarounds |
| **Recorrências Sem Problema** | Semanal | IT_SPECIALIST | Serviços com recorrência sem Problema aberto |

### 20.2 Relatórios Gerenciais

| Relatório | Frequência | Destinatário | Conteúdo |
|-----------|:----------:|:------------:|---------|
| **Performance do Processo de Problemas** | Mensal | IT_MANAGER | MTTR, taxa de resolução, workarounds publicados |
| **Impacto dos Problemas Resolvidos** | Mensal | IT_MANAGER | Redução de incidentes pré/pós resolução por problema |
| **Problemas sem Solução Definitiva** | Mensal | IT_MANAGER | Lista com tempo em aberto e justificativa |
| **Rastreabilidade Compliance** | Trimestral | Compliance + IT_MANAGER | Problemas vinculados a NCs e status de resolução |

### 20.3 Relatórios Executivos

| Relatório | Frequência | Destinatário | Conteúdo |
|-----------|:----------:|:------------:|---------|
| **Panorama de Problemas TI** | Trimestral | Diretoria | Top causas raiz, serviços críticos, investimentos propostos |
| **Efetividade do KEDB** | Semestral | IT_MANAGER + Diretoria | MTTR de incidentes com workaround vs. sem workaround |
| **ROI da Gestão de Problemas** | Anual | Diretoria | Redução de incidentes, horas economizadas, impacto financeiro |

---

## 21. Auditoria e Rastreabilidade

### 21.1 Eventos Auditados Obrigatoriamente

| Evento | `action` | Dados Capturados |
|--------|:--------:|:----------------:|
| Problema criado | CREATE | todos os campos iniciais |
| Status alterado | UPDATE | status anterior + novo + timestamp |
| Responsável alterado | UPDATE | anterior + novo + motivo |
| Prioridade reclassificada | UPDATE | anterior + novo + justificativa |
| Causa raiz documentada | UPDATE | metodologia + análise + confirmador |
| Causa raiz validada pelo Gestor | UPDATE | validado_por + validado_em |
| Workaround criado | CREATE | título + passos + criador |
| Workaround publicado | UPDATE | status DRAFT → PUBLISHED + publicado_por |
| Workaround depreciado | UPDATE | status → DEPRECATED + razão |
| Solução definitiva documentada | UPDATE | descrição + solução_implementada = true |
| Problema resolvido | UPDATE | evidências + resolvido_por + data |
| Problema reaberto | UPDATE | status → NEW + justificativa |
| Incidente vinculado | CREATE | incident_id + vinculado_por |
| Ativo vinculado | CREATE | asset_id + vinculado_por |
| Apontamento compliance vinculado | UPDATE | finding_id + vinculado_por |
| Projeto criado a partir do problema | CREATE | project_id + criado_por |
| Cancelamento | UPDATE | status → CANCELLED + motivo |

### 21.2 Timeline do Problema

A página do problema exibe timeline cronológica unificada de todos os eventos, visível para IT_SPECIALIST+.

---

## 22. Compliance e Conformidade

### 22.1 Requisitos de Conformidade Aplicáveis

| Framework | Requisito | Como o Módulo Atende |
|-----------|-----------|---------------------|
| **ITIL v4** | Gestão de Problemas como prática formal | Módulo implementa todas as fases do ciclo ITIL |
| **ISO/IEC 27001** | A.16.1 — Gestão de Incidentes e Melhorias | Rastreabilidade de causa raiz e implementação de melhoria |
| **ISO/IEC 20000** | 8.6 — Gestão de Problemas | Processo documentado com papéis e SLA definidos |
| **LGPD** | Art. 48 — Notificação de incidentes sistêmicos | Problemas de segurança com impacto em dados pessoais rastreados |
| **SOX / Controles Internos** | Segregação de funções e rastreabilidade | Aprovação separada de causa raiz e workaround |

### 22.2 Evidências para Auditorias Externas

O módulo gera automaticamente evidências exportáveis para:
- **ISO 27001:** Relatório de problemas de segurança com causa raiz documentada e solução implementada.
- **LGPD:** Rastreabilidade de problemas com impacto em dados pessoais e medidas adotadas.
- **Auditoria interna:** Histórico completo de cada problema com todas as ações e aprovações.

---

## 23. Regras de Negócio

---

**PRB-001** — Vínculo obrigatório com serviço
Todo problema deve estar associado a um serviço publicado no Catálogo de Serviços. Problema sem `catalog_id` não pode ser criado.

---

**PRB-002** — Vínculo obrigatório com incidente
Todo problema deve ter ao menos um incidente vinculado no momento da criação. Não é possível criar um problema sem referenciar o incidente que o originou.
**Referência:** BR-PRB-001

---

**PRB-003** — Responsável obrigatório
Todo problema deve possuir responsável (`assignee_id`) atribuído. Não é possível avançar o status além de NEW sem responsável definido.

---

**PRB-004** — Somente IT_SPECIALIST+ pode criar problemas
Analistas (IT_TECHNICIAN) não podem criar problemas diretamente. Apenas IT_SPECIALIST, IT_MANAGER e SUPER_ADMIN podem abrir registros de problema.

---

**PRB-005** — Causa raiz documentada antes do encerramento
O campo "Análise de Causa Raiz" e a confirmação de causa raiz (`is_root_cause = true`) são obrigatórios antes de fechar (CLOSED) qualquer problema. Sem causa raiz confirmada, o CLOSED é bloqueado.

---

**PRB-006** — Metodologia de RCA obrigatória
Ao confirmar a causa raiz, o campo `root_cause_method` deve ser preenchido com a metodologia utilizada: `FIVE_WHYS`, `FISHBONE`, `FAULT_TREE`, `TIMELINE` ou `PARETO`.
**Referência:** BR-PRB-006

---

**PRB-007** — Causa raiz validada pelo Gestor antes de avançar para KNOWN_ERROR
A transição para KNOWN_ERROR exige validação formal do IT_MANAGER da causa raiz identificada pelo Especialista. O Especialista não pode avançar o status sem aprovação do Gestor.

---

**PRB-008** — Workaround exige evidência de teste
O workaround deve ter a taxa de efetividade estimada e ter sido testado em ambiente real antes de ser submetido para publicação. "Testado por" e "taxa de sucesso estimada" são campos obrigatórios.

---

**PRB-009** — Workaround publicado gera artigo KB automaticamente
Ao publicar o workaround, o sistema cria automaticamente um rascunho de artigo na Base de Conhecimento com status DRAFT_AI. O IT_SPECIALIST deve revisar e submeter para publicação.
**Referência:** BR-PRB-002

---

**PRB-010** — Problema não pode ser fechado sem causa raiz ou workaround
Para fechar (CLOSED), o problema deve ter ao menos uma das condições: (a) causa raiz confirmada E solução implementada, ou (b) workaround publicado E situação justificada de Known Error de longo prazo.
**Referência:** BR-PRB-003

---

**PRB-011** — Solução definitiva exige evidências documentadas
Ao implementar a solução definitiva, evidências são obrigatórias: evidência de implementação + resultado de teste de validação. Sem evidências, o status não avança para RESOLVED.

---

**PRB-012** — Período de validação de 30 dias antes de fechar
Após marcar como RESOLVED, o problema permanece em observação por 30 dias. O IT_MANAGER só pode fechar (CLOSED) após esse período sem recorrência confirmada.

---

**PRB-013** — Solução definitiva depreca automaticamente o workaround
Ao implementar a solução definitiva e marcar como RESOLVED, o workaround associado é automaticamente marcado como `DEPRECATED`. Artigos KB vinculados são atualizados.
**Referência:** BR-PRB-004

---

**PRB-014** — Problema recorrente exige nova análise obrigatória
Ao reabrir um problema (recorrência detectada), o sistema exige nova análise de causa raiz com campo de justificativa: "Por que a solução anterior não foi efetiva?" Antes de avançar para UNDER_INVESTIGATION, esta análise deve ser iniciada.

---

**PRB-015** — Sugestão automática por recorrência
O sistema gera sugestão de criação de Problema quando ≥ 3 incidentes do mesmo serviço são registrados em 7 dias com sintomas similares. A sugestão é apresentada ao IT_SPECIALIST como ação de triagem, não como problema criado automaticamente.

---

**PRB-016** — Workaround publicado disponível no KEDB imediatamente
Após publicação, o workaround está disponível no KEDB em até 5 minutos (propagação do evento). Novos incidentes do mesmo serviço exibem o workaround automaticamente.

---

**PRB-017** — Problema vinculado a NC de compliance exige rastreabilidade
Problemas associados a apontamentos de auditoria (`finding_id` preenchido) devem ter a resolução evidenciada no módulo de Compliance antes de serem fechados.
**Referência:** Seção 14.

---

**PRB-018** — Número imutável
O número do problema (PRB-YYYY-NNNNNN) é sequencial, único e imutável após a criação.

---

**PRB-019** — Problema CANCELLED é terminal
Problema cancelado não pode ser reativado. Novo registro deve ser criado se o problema persistir.

---

**PRB-020** — Cancelamento exige justificativa
Cancelamento de problema exige justificativa com mínimo de 20 caracteres. Apenas IT_MANAGER+ pode cancelar.

---

**PRB-021** — Data de abertura imutável e gerada pelo banco
O campo `created_at` é preenchido pelo banco de dados. Nenhum cliente pode fornecer ou alterar este valor.

---

**PRB-022** — Problema não pode ser excluído fisicamente
Problemas são somente soft-deleted via `deleted_at`. Exclusão física é proibida por RLS.

---

**PRB-023** — Incidente pode ser vinculado a apenas um problema
Um incidente pode ser vinculado a no máximo 1 problema. Tentativa de vincular um incidente já associado a outro problema exibe aviso e requer confirmação de substituição.

---

**PRB-024** — Workaround sem publicação: sem efeito externo
Workaround em status DRAFT não aparece no KEDB, não é sugerido em incidentes e não gera artigo KB. Apenas workarounds PUBLISHED têm efeito externo.

---

**PRB-025** — Problemas pró-ativos requerem justificativa de prevenção
Problemas criados com tipo `PROACTIVE` devem ter campo de justificativa explicando o risco iminente identificado antes da ocorrência do incidente.

---

**PRB-026** — Colaboradores do problema não podem exceder 5
O campo `colaboradores` aceita no máximo 5 usuários além do responsável principal.

---

**PRB-027** — Alerta de recorrência ao fechar incidente reaberto duas vezes
Incidente reaberto pela segunda vez gera alerta automático ao IT_SPECIALIST e sugestão de criação de Problema para análise formal de causa raiz.
**Referência:** INC-031

---

**PRB-028** — Solução definitiva > R$10k: aprovação adicional
Solução definitiva que requeira investimento acima de R$10.000,00 exige criação de projeto formal com aprovação do IT_MANAGER e avaliação financeira, não podendo ser implementada de forma ad-hoc.

---

**PRB-029** — KNOWN_ERROR sem solução definitiva > 90 dias: relatório obrigatório
Problemas com status KNOWN_ERROR há mais de 90 dias sem plano de solução definitiva geram relatório mensal para IT_MANAGER com justificativa de manutenção em aberto.

---

**PRB-030** — Artigo KB vinculado ao workaround é exclusivo do problema
Cada workaround publicado gera exatamente um artigo KB. Não é possível vincular o mesmo artigo KB a múltiplos problemas.

---

**PRB-031** — Problema vinculado a SEV-1 é automaticamente CRÍTICO
Se um incidente SEV-1 é vinculado a um problema, a prioridade do problema é elevada automaticamente para CRÍTICO, independentemente do cálculo da matriz I×U.

---

**PRB-032** — Investigação de problema não pausa SLA de incidentes vinculados
A abertura de um Problema e a investigação em andamento NÃO pausam o SLA dos incidentes vinculados. Cada incidente continua seu ciclo normalmente.

---

**PRB-033** — Comunicação de resolução aos usuários de incidentes vinculados
Ao marcar como RESOLVED, todos os solicitantes dos incidentes vinculados recebem notificação informando que a causa raiz foi resolvida. Esta notificação é automática e obrigatória.

---

**PRB-034** — Pareamento de workarounds: mesmo serviço e sintoma similar
Se um novo problema é criado para o mesmo serviço com sintoma similar a um erro conhecido existente, o sistema sugere vinculação ao problema existente antes de criar um novo registro.

---

**PRB-035** — Ativo vinculado a problema CRÍTICO recebe flag no inventário
Quando um ativo é vinculado a um problema com prioridade CRÍTICO, o inventário do ativo exibe flag de "Ativo com Problema Crítico" visível para todos os técnicos.

---

**PRB-036** — Evidências de problemas: imutáveis após aprovação de compliance
Evidências vinculadas a apontamentos de auditoria não podem ser alteradas ou removidas após aprovação pelo Compliance Officer.

---

**PRB-037** — Histórico de hipóteses preservado mesmo quando descartadas
Todas as hipóteses registradas durante a investigação são preservadas no histórico, mesmo quando descartadas. O registro de hipóteses descartadas faz parte da rastreabilidade da metodologia de RCA.

---

**PRB-038** — Workaround de problema CRÍTICO deve ser revisado mensalmente
Workarounds de problemas com prioridade CRÍTICO mantidos ativos por mais de 30 dias recebem lembrete mensal ao IT_SPECIALIST responsável para verificar se ainda é necessário ou se a solução definitiva pode ser adiantada.

---

**PRB-039** — Transformação em projeto: rastreabilidade obrigatória
Quando um problema é transformado em projeto formal, o campo `project_id` é preenchido obrigatoriamente. O problema não pode ser fechado enquanto o projeto estiver ativo.

---

**PRB-040** — Fechamento de projeto não fecha automaticamente o problema
O fechamento de um Projeto NÃO encerra automaticamente o Problema vinculado. O IT_MANAGER deve validar as evidências da solução e fechar o Problema explicitamente.

---

**PRB-041** — Notificação ao Compliance em problemas com impacto em dados pessoais
Problema de categoria Segurança com potencial impacto em dados pessoais (campo marcado pelo técnico) notifica automaticamente o Compliance Officer na criação.

---

**PRB-042** — Workaround aprovado pode ser aplicado por qualquer técnico sem novo ciclo de aprovação
Uma vez publicado, o workaround de um erro conhecido pode ser aplicado pelos técnicos de N1 nos incidentes correspondentes sem necessidade de nova aprovação. A aprovação do IT_MANAGER no momento da publicação é suficiente.

---

**PRB-043** — Problemas de compliance: SLA vinculado ao prazo da NC
Problemas associados a não-conformidades de auditoria têm o SLA de solução definitiva alinhado automaticamente ao prazo da NC correspondente, prevalecendo sobre o SLA padrão de prioridade.

---

**PRB-044** — Análise de Pareto disponível para IT_MANAGER a qualquer momento
O IT_MANAGER pode solicitar a geração do gráfico de Pareto de incidentes por serviço e categoria a qualquer momento, para suporte à decisão de priorização de problemas.

---

**PRB-045** — Problema reaberto preserva número original
Ao reabrir um problema, o mesmo número PRB-YYYY-NNNNNN é mantido. Não é gerado novo número. O status retorna para NEW com indicador "Reaberto" na timeline.

---

**PRB-046** — Workaround deve especificar audiência
O campo `audiência` do workaround é obrigatório: `END_USER` (usuário pode aplicar) ou `TECHNICAL` (apenas técnico). Workarounds para usuário final são escritos em linguagem acessível.

---

**PRB-047** — Múltiplos métodos de RCA podem ser utilizados em problemas complexos
Para problemas CRÍTICOS de alta complexidade, o Especialista pode combinar metodologias (ex.: TIMELINE + FISHBONE). O campo `root_cause_method` aceita múltiplos valores neste caso.

---

**PRB-048** — Problema sem atividade por 30 dias: alerta ao responsável
Problema em status UNDER_INVESTIGATION sem nenhum comentário, alteração ou evidência adicionada por 30 dias gera alerta ao IT_SPECIALIST responsável e ao IT_MANAGER sobre possível abandono da investigação.

---

**PRB-049** — KEDB deve ser acessível aos técnicos durante atendimento de incidente
Os erros conhecidos do KEDB devem ser exibidos em destaque na interface de atendimento de incidentes do mesmo serviço, sem necessidade de navegação separada.

---

**PRB-050** — Problema com prioridade CRÍTICO: atualização de status obrigatória a cada 2 dias úteis
Problema com prioridade CRÍTICO deve ter atualização de status (comentário técnico ou mudança de status) a cada 2 dias úteis. Ausência de atualização gera notificação ao IT_MANAGER.

---

## 24. Critérios de Aceitação

### 24.1 Registro e Criação

- [ ] **CA-01:** IT_SPECIALIST+ consegue criar problema vinculando ao menos 1 incidente existente.
- [ ] **CA-02:** IT_TECHNICIAN não consegue criar problema — botão "Criar Problema" não exibido.
- [ ] **CA-03:** Número PRB-YYYY-NNNNNN gerado e exibido imediatamente após criação.
- [ ] **CA-04:** Serviço obrigatório — formulário não submete sem `catalog_id`.
- [ ] **CA-05:** Sugestão automática de Problema gerada quando ≥ 3 incidentes do mesmo serviço em 7 dias.

### 24.2 Investigação e RCA

- [ ] **CA-06:** Confirmação de causa raiz bloqueada sem metodologia de RCA selecionada.
- [ ] **CA-07:** Status ROOT_CAUSE_IDENTIFIED só é atingido após campo de análise de causa raiz preenchido.
- [ ] **CA-08:** Validação do Gestor obrigatória antes de avançar para KNOWN_ERROR.
- [ ] **CA-09:** Histórico de hipóteses descartadas preservado e visível na timeline.

### 24.3 Workaround

- [ ] **CA-10:** Workaround em status DRAFT não aparece no KEDB.
- [ ] **CA-11:** Publicação de workaround gera rascunho DRAFT_AI na KB automaticamente em até 5 minutos.
- [ ] **CA-12:** Novos incidentes do mesmo serviço exibem banner de workaround após publicação.
- [ ] **CA-13:** Campos obrigatórios do workaround (passos + limitações + audiência) bloqueiam publicação se ausentes.

### 24.4 Solução Definitiva e Encerramento

- [ ] **CA-14:** Status RESOLVED bloqueado sem evidência de implementação e validação.
- [ ] **CA-15:** Workaround depreciado automaticamente ao marcar como RESOLVED.
- [ ] **CA-16:** Status CLOSED disponível apenas após 30 dias sem recorrência pós-RESOLVED.
- [ ] **CA-17:** Fechamento bloqueado sem causa raiz confirmada.
- [ ] **CA-18:** Reabertura retorna ao status NEW com número original preservado.

### 24.5 Integrações

- [ ] **CA-19:** Incidente vinculado ao problema exibe badge "Vinculado a Problema" com link direto.
- [ ] **CA-20:** Solicitantes dos incidentes vinculados notificados ao marcar RESOLVED.
- [ ] **CA-21:** Ativo vinculado ao problema exibe flag no inventário para prioridade CRÍTICO.
- [ ] **CA-22:** Vinculação a NC de compliance exibe o problema no módulo de Compliance.
- [ ] **CA-23:** Botão "Criar Projeto para Solução" funciona e pré-preenche dados do problema.
- [ ] **CA-24:** Artigo KB vinculado ao workaround atualizado com solução definitiva após RESOLVED.

### 24.6 KEDB

- [ ] **CA-25:** KEDB exibe todos os erros conhecidos com workaround publicado.
- [ ] **CA-26:** Busca no KEDB por serviço retorna resultados corretos.
- [ ] **CA-27:** Técnico de incidente consegue vincular erro conhecido ao incidente via KEDB.
- [ ] **CA-28:** Workaround depreciado removido do KEDB após solução definitiva.

### 24.7 SLA e Notificações

- [ ] **CA-29:** Alertas de SLA enviados corretamente nos marcos de 50%, 80% e 100% do prazo.
- [ ] **CA-30:** Problema CRÍTICO sem atualização por 2 dias úteis gera alerta ao IT_MANAGER.
- [ ] **CA-31:** Notificação ao grupo responsável enviada ao publicar workaround.
- [ ] **CA-32:** IT_SPECIALIST notificado ao receber sugestão automática de problema por recorrência.

### 24.8 Auditoria e Rastreabilidade

- [ ] **CA-33:** Timeline do problema exibe todos os eventos em ordem cronológica.
- [ ] **CA-34:** `audit_log` registra todas as operações de escrita com old_values e new_values.
- [ ] **CA-35:** RLS impede UPDATE e DELETE em registros de auditoria do módulo.
- [ ] **CA-36:** IT_TECHNICIAN não visualiza problemas de outros grupos.
- [ ] **CA-37:** Relatório de rastreabilidade para compliance exportável em PDF com trilha completa.

### 24.9 Compliance e Conformidade

- [ ] **CA-38:** Problema associado a NC exige evidência de resolução no módulo Compliance antes de fechar.
- [ ] **CA-39:** Problemas com impacto em dados pessoais notificam automaticamente o Compliance Officer.
- [ ] **CA-40:** Relatório executivo de redução de incidentes recorrentes calculado corretamente.

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação com 24 seções, 50 regras PRB e 40 critérios de aceitação |

---

> **Próximos documentos recomendados:**
> [`40_INCIDENT_MANAGEMENT.md`](./40_INCIDENT_MANAGEMENT.md) — Módulo de Gestão de Incidentes
> [`41_REQUEST_MANAGEMENT.md`](./41_REQUEST_MANAGEMENT.md) — Módulo de Gestão de Requisições
> [`43_ASSET_MANAGEMENT.md`](./43_ASSET_MANAGEMENT.md) — Módulo de Gestão de Ativos
