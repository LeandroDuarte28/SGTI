# SGTI — Sistema de Gestão de Tecnologia da Informação
## Documento de Contexto do Projeto

> **Classificação:** Interno — Restrito
> **Versão:** 2.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documento Relacionado:** [00_README.md](./00_README.md)

---

## Sumário

1. [Resumo Executivo](#1-resumo-executivo)
2. [Objetivo do Sistema](#2-objetivo-do-sistema)
3. [Escopo Geral](#3-escopo-geral)
4. [Módulos Principais](#4-módulos-principais)
5. [Benefícios Esperados](#5-benefícios-esperados)
6. [Integrações](#6-integrações)
7. [Indicadores Estratégicos](#7-indicadores-estratégicos)
8. [Restrições Técnicas](#8-restrições-técnicas)
9. [Critérios de Sucesso](#9-critérios-de-sucesso)

---

## 1. Resumo Executivo

O **SGTI (Sistema de Gestão de Tecnologia da Informação)** é uma plataforma corporativa unificada projetada para centralizar, automatizar e governar todos os processos de TI da organização. Fundamentado no framework **ITIL v4** (*Information Technology Infrastructure Library*), o sistema consolida em uma única solução a gestão de incidentes, requisições, problemas, ativos, identidades, conformidade, projetos, compras, controle financeiro e base de conhecimento.

A ausência de um sistema integrado de gestão de TI impõe custos operacionais crescentes: processos fragmentados, rastreabilidade insuficiente de ativos, controle manual de acessos, ausência de visibilidade sobre SLAs e incapacidade de medir com precisão os custos reais de TI (OPEX e CAPEX). O SGTI resolve diretamente esse conjunto de problemas ao estabelecer uma camada de governança transversal, integrada ao ecossistema tecnológico existente — **Google Workspace**, **GLPI**, **Supabase**, **GitHub** e **Vercel** — e orientada a decisões baseadas em dados por meio de dashboards executivos e operacionais.

O projeto adota **Clean Architecture**, **Domain-Driven Design (DDD)**, **NestJS** no backend, **NextJS** no frontend e **PostgreSQL via Supabase** como base de dados, garantindo manutenibilidade, escalabilidade, auditabilidade e alinhamento com as melhores práticas de engenharia de software.

---

## 2. Objetivo do Sistema

### 2.1 Objetivo Geral

Prover uma plataforma centralizada de Gestão de TI que unifique os processos de suporte, controle de ativos, gerenciamento de identidades, conformidade regulatória, gestão financeira e visibilidade estratégica, alinhada ao framework ITIL v4 e integrada ao ecossistema tecnológico existente da organização.

### 2.2 Objetivos Específicos

**Operacional**
- Centralizar o registro, categorização e acompanhamento de incidentes, requisições e problemas com integração bidirecional ao GLPI.
- Reduzir o tempo médio de resolução (MTTR) por meio de fluxos estruturados, SLAs automatizados e acesso à Base de Conhecimento.
- Formalizar o Catálogo de Serviços de TI com SLAs definidos, publicados e monitorados.

**Governança e Compliance**
- Estabelecer rastreabilidade completa de ativos de TI do ciclo de aquisição ao descarte.
- Automatizar o ciclo de vida de identidades e acessos, eliminando operações manuais e riscos de acesso indevido.
- Garantir conformidade com políticas internas, LGPD e frameworks de segurança (ISO/IEC 27001).

**Estratégico e Financeiro**
- Prover controle granular de OPEX e CAPEX de TI com rateio por centro de custo.
- Subsidiar decisões de investimento em TI com dados concretos de ciclo de vida, consumo e performance.
- Disponibilizar dashboards executivos com KPIs estratégicos para a alta direção.

**Desenvolvimento e Entrega**
- Integrar o ciclo de vida de projetos de TI com controle de escopo, prazo, custo e entrega.
- Centralizar o processo de compras de TI com aprovações, fornecedores e contratos rastreáveis.
- Automatizar o pipeline de implantação via GitHub e Vercel com rastreabilidade de mudanças.

---

## 3. Escopo Geral

### 3.1 Dentro do Escopo

| Área | Descrição |
|------|-----------|
| Gestão de Incidentes | Registro, priorização, escalonamento e resolução de interrupções de serviço. |
| Gestão de Requisições | Atendimento de solicitações de serviço com fluxo de aprovação e SLA. |
| Gestão de Problemas | Investigação de causa raiz, workarounds e erros conhecidos. |
| Gestão de Ativos (ITAM) | Inventário, ciclo de vida, localização, responsáveis e depreciação. |
| Gestão de Identidades (IAM) | Provisionamento, revisão e revogação de acessos com integração Google Workspace. |
| Compliance | Políticas, controles, auditorias, não-conformidades e evidências. |
| OPEX e CAPEX | Orçamento, contratos, despesas recorrentes e investimentos de TI. |
| Projetos de TI | Gestão de iniciativas, escopo, cronograma, custo e entregas. |
| Compras de TI | Requisições de compra, fornecedores, aprovações e contratos. |
| Base de Conhecimento | Artigos, FAQs, procedimentos e soluções vinculadas a incidentes resolvidos. |
| Catálogo de Serviços | Definição, publicação e controle de versões dos serviços de TI oferecidos. |
| SLA | Definição, monitoramento e reporte de acordos de nível de serviço. |
| Dashboards Executivos | KPIs estratégicos para alta direção: custo, SLA, compliance e disponibilidade. |
| Dashboards Operacionais | Visibilidade diária para gestores e técnicos: filas, alertas e performance. |
| Integrações | Google Workspace, GLPI, e-mail, Supabase, GitHub e Vercel. |

### 3.2 Fora do Escopo

- Substituição do GLPI — o SGTI integra-se ao GLPI existente, sem substituí-lo.
- Monitoramento de infraestrutura de rede (switches, roteadores, firewall) — gerenciado por ferramentas específicas.
- Sistemas de ERP, CRM ou plataformas corporativas não relacionadas à TI.
- Aplicativos móveis nativos na fase inicial do projeto.
- Gestão de RH — o SGTI consome eventos de RH via integração, mas não os gerencia.

### 3.3 Premissas

- Google Workspace ativo com domínio gerenciado e conta de serviço disponível para integração.
- GLPI instalado, operacional e acessível via REST API (versão 10.x ou superior).
- Repositório GitHub criado e com permissões para o pipeline de CI/CD.
- Projeto Vercel configurado para o frontend NextJS.
- Projeto Supabase criado com PostgreSQL disponível para o backend.
- Patrocinador executivo identificado e comprometido com a aprovação de CAPEX do projeto.

---

## 4. Módulos Principais

### 4.1 Gestão de Incidentes

Gerenciamento do ciclo completo de interrupções não planejadas de serviço, desde o registro até a resolução, com priorização por impacto e urgência, escalonamento automático por SLA e comunicação proativa ao usuário.

Capacidades principais:
- Registro por portal, e-mail ou integração automática com monitoramento.
- Matriz de prioridade ITIL: Crítico, Alto, Médio e Baixo.
- Escalonamento funcional e hierárquico baseado em tempo e SLA.
- Vínculo a ativos afetados, serviços impactados e usuários envolvidos.
- Comunicação automática de status via e-mail (implantacao@pinpag.com.br como remetente de sistema).
- Encerramento com solução vinculada à Base de Conhecimento.
- Integração bidirecional com GLPI para sincronização de tickets.

### 4.2 Gestão de Requisições

Atendimento estruturado de solicitações de serviço previstas no Catálogo, com fluxos de aprovação configuráveis, SLAs específicos por tipo de requisição e rastreabilidade completa.

Capacidades principais:
- Portal de autoatendimento com catálogo de requisições disponíveis.
- Fluxos de aprovação multinível configuráveis por tipo de serviço.
- SLAs diferenciados por categoria de requisição e perfil do solicitante.
- Acompanhamento em tempo real pelo solicitante.
- Integração com o módulo de IAM para requisições de acesso.
- Integração com o módulo de Compras para requisições de aquisição.

### 4.3 Gestão de Problemas

Investigação sistemática das causas raiz de incidentes recorrentes ou de alto impacto, com registro de *workarounds*, erros conhecidos e publicação de soluções definitivas.

Capacidades principais:
- Criação de problemas a partir de incidentes individuais ou agrupados.
- Registro e publicação de *workarounds* para uso imediato pelo Service Desk.
- Controle de Erros Conhecidos (*Known Error Database* — KEDB).
- Análise de causa raiz com registro de metodologia utilizada (ex: 5 Porquês, Ishikawa).
- Vinculação de solução definitiva à Base de Conhecimento.
- Relatórios de tendência de incidentes por categoria e serviço.

### 4.4 Gestão de Ativos (ITAM)

Controle completo do ciclo de vida dos ativos de TI — hardware, software, licenças e infraestrutura — desde a requisição de compra até o descarte, com rastreabilidade por número de série, responsável, localização e estado de conformidade.

Capacidades principais:
- Inventário com campos configuráveis por categoria de ativo.
- Ciclo de vida gerenciado: Requisição → Aquisição → Implantação → Em Uso → Manutenção → Descarte.
- Vinculação de ativos a usuários, setores, contratos e chamados.
- Controle de licenças de software: quantidade adquirida vs. utilizada vs. disponível.
- Cálculo de depreciação para CAPEX e balanço patrimonial.
- Alertas automáticos de garantia, licença e manutenção preventiva.
- Sincronização de inventário com GLPI.

### 4.5 Gestão de Identidades e Acessos (IAM)

Administração do ciclo de vida de identidades digitais com integração ao Google Workspace como provedor de identidade central, garantindo provisionamento ágil, revisão periódica e revogação imediata de acessos.

Capacidades principais:
- Provisionamento automatizado a partir de eventos de admissão, transferência e desligamento.
- Integração direta com Google Workspace (criação, desativação e gestão de grupos).
- Controle de acesso baseado em papéis (*Role-Based Access Control* — RBAC).
- Fluxo de aprovação para concessão de acessos privilegiados.
- Revisão periódica de acessos (*Access Review* / Recertificação).
- Registro de auditoria imutável de todas as alterações de acesso.
- Alertas para contas inativas, acessos expirados e acessos sem revisão.

### 4.6 Compliance

Centralização dos processos de conformidade de TI com gestão de políticas, controles, evidências e não-conformidades, garantindo rastreabilidade para auditorias internas e externas.

Capacidades principais:
- Cadastro e publicação de políticas e normas de TI com controle de versão e aprovação.
- Mapeamento de controles por framework (LGPD, ISO/IEC 27001, ITIL v4).
- Registro e acompanhamento de não-conformidades com plano de ação.
- Coleta e armazenamento de evidências com vínculo a controles.
- Agenda de auditorias internas com checklist dinâmico.
- Relatórios de maturidade de conformidade por domínio e período.

### 4.7 OPEX e CAPEX

Visibilidade e controle sobre os custos de TI, integrando dados de contratos, ativos, licenças e consumo de serviços para subsidiar planejamento orçamentário e decisões de investimento.

Capacidades principais:
- Registro e controle de contratos com fornecedores, incluindo renovações e vencimentos.
- Rateio de custos de TI por setor e centro de custo.
- Planejamento e acompanhamento do orçamento de TI (CAPEX e OPEX).
- Controle de despesas recorrentes e não-recorrentes com categorização.
- Alertas de vencimento contratual e desvio de orçamento.
- Relatórios de custo total por serviço, ativo e período (TCO).

### 4.8 Projetos de TI

Gestão de iniciativas e projetos de TI com controle de escopo, cronograma, custo, riscos e entregas, integrada ao ciclo de vida de mudanças e ao controle financeiro.

Capacidades principais:
- Registro de projetos com escopo, justificativa, patrocinador e equipe.
- Cronograma com marcos e entregas rastreáveis.
- Controle de orçamento de projeto vinculado ao módulo CAPEX.
- Gestão de riscos e pendências (*issues*).
- Integração com GitHub para rastreabilidade de entregas técnicas.
- Relatórios de progresso e status para stakeholders.

### 4.9 Compras de TI

Centralização do processo de aquisição de produtos e serviços de TI, com rastreabilidade desde a requisição até o recebimento, integrada ao módulo de Ativos e ao controle financeiro.

Capacidades principais:
- Registro de requisições de compra com justificativa e vinculação ao orçamento.
- Fluxo de aprovação multinível por valor e categoria.
- Cadastro de fornecedores com histórico de aquisições e avaliação.
- Vinculação de pedidos de compra a contratos e ativos adquiridos.
- Controle de recebimento e aceite de itens adquiridos.
- Integração com módulo CAPEX para baixa automática no orçamento.

### 4.10 Base de Conhecimento (KMDB)

Repositório estruturado de conhecimento técnico e operacional, acessível a técnicos e usuários finais, com controle editorial e vinculação a chamados resolvidos.

Capacidades principais:
- Criação e publicação de artigos com categorização por serviço e público-alvo.
- Controle de versão e fluxo de aprovação editorial.
- Busca *full-text* com relevância por uso e avaliação dos leitores.
- Vínculo automático entre artigo publicado e incidente/problema resolvido.
- Relatórios de utilização, artigos mais acessados e lacunas de conhecimento.

### 4.11 Catálogo de Serviços

Repositório formal de todos os serviços de TI oferecidos à organização, com definição de escopo, canais de solicitação, SLAs e custos.

Capacidades principais:
- Cadastro e publicação de serviços com descrição técnica e para o usuário final.
- Versionamento do catálogo com controle de aprovação.
- Associação de SLAs por tipo de serviço e perfil de usuário.
- Portal de solicitação integrado ao módulo de Requisições.
- Relatório de demanda por serviço para planejamento de capacidade.

### 4.12 SLA (Acordo de Nível de Serviço)

Definição, monitoramento e reporte de todos os acordos de nível de serviço do SGTI, com alertas proativos, relatórios de desempenho e histórico para auditoria.

Capacidades principais:
- Definição de SLAs por tipo de chamado, categoria de serviço e prioridade.
- Monitoramento em tempo real com alertas de risco de violação.
- Pausa de SLA para situações previstas em contrato (aguardando usuário, aprovação externa).
- Relatórios de cumprimento de SLA por período, equipe e serviço.
- Vinculação de SLAs ao Catálogo de Serviços e contratos com fornecedores.

### 4.13 Dashboards Executivos

Visão de alto nível para a alta direção, com KPIs estratégicos de TI apresentados em painéis de fácil leitura e atualizados em tempo real.

Indicadores centrais:
- SLA Global de TI (% de chamados atendidos dentro do prazo).
- Disponibilidade de serviços críticos (uptime).
- Satisfação do usuário (CSAT médio).
- Custo Total de TI (CAPEX + OPEX) vs. orçamento.
- Maturidade de Compliance (% de controles implementados).
- Status de projetos estratégicos de TI.

### 4.14 Dashboards Operacionais

Painel de acompanhamento diário para coordenadores e técnicos de TI, com foco em filas, alertas e performance de atendimento.

Indicadores centrais:
- Fila de chamados em aberto por técnico e por grupo.
- Chamados com SLA em risco (próximos do vencimento).
- MTTR e MTTA por categoria de chamado.
- Ativos em manutenção e com garantia próxima do vencimento.
- Acessos pendentes de aprovação e revisão.
- Projetos com prazo em risco.

---

## 5. Benefícios Esperados

### 5.1 Benefícios Operacionais

- Redução do MTTR pela estruturação dos fluxos de atendimento e acesso direto à Base de Conhecimento durante o atendimento.
- Eliminação de processos manuais no provisionamento e revogação de acessos, reduzindo o risco de acessos indevidos por atraso operacional.
- Aumento da visibilidade sobre o parque de ativos, evitando compras desnecessárias e extravios.
- Padronização dos processos de TI com base no ITIL v4, promovendo consistência e previsibilidade no atendimento.
- Redução de retrabalho por causa raiz não investigada, por meio da Gestão de Problemas.

### 5.2 Benefícios Estratégicos

- Habilitação de decisões de CAPEX baseadas em dados concretos de ciclo de vida de ativos e tendências de consumo.
- Visibilidade executiva sobre desempenho, custo e conformidade da TI sem dependência de relatórios manuais.
- Redução de riscos regulatórios e de segurança por meio da gestão contínua de compliance.
- Sustentação de auditorias internas e externas com evidências rastreáveis e centralizadas.
- Gestão estruturada de projetos de TI com rastreabilidade financeira e técnica.

### 5.3 Benefícios Financeiros

- Controle efetivo do OPEX de TI com rateio por área e identificação de desperdícios.
- Prevenção de renovações automáticas de contratos e licenças desnecessárias.
- Redução de horas improdutivas geradas por interrupções de serviço sem SLA gerenciado.
- Subsídio para negociações com fornecedores baseadas em dados históricos de consumo e performance.
- Visibilidade do custo real por serviço de TI (TCO — *Total Cost of Ownership*).

### 5.4 Benefícios para o Usuário Final

- Portal único de autoatendimento para abertura de chamados, acompanhamento de status e acesso à Base de Conhecimento.
- Comunicação proativa e automática sobre o andamento de solicitações e incidentes.
- Redução do tempo de espera por acesso a sistemas em processos de *onboarding*.
- Maior transparência sobre os serviços de TI disponíveis e os prazos acordados.

---

## 6. Integrações

### 6.1 Google Workspace

**Propósito:** Provedor de identidade central e fonte autoritativa de dados de colaboradores.

| Funcionalidade | Direção | Módulo SGTI |
|----------------|---------|-------------|
| Autenticação SSO (OAuth 2.0) | Google → SGTI | Todos |
| Sincronização de usuários e grupos | Google → SGTI | IAM |
| Provisionamento de contas (*onboarding*) | SGTI → Google | IAM |
| Desativação de contas (*offboarding*) | SGTI → Google | IAM |
| Consulta de unidade organizacional | Google → SGTI | IAM, Ativos |
| Envio de notificações via Gmail | SGTI → Google | Incidentes, Requisições |

**APIs:** Google Admin SDK, Google Directory API, Google OAuth 2.0, Gmail API.

**Premissa:** Conta de serviço (*Service Account*) com delegação de domínio provisionada pelo administrador do Google Workspace.

### 6.2 GLPI

**Propósito:** Sistema de registro oficial de chamados e inventário legado. O SGTI atua como camada de governança, mantendo o GLPI como fonte de verdade para tickets existentes.

| Funcionalidade | Direção | Módulo SGTI |
|----------------|---------|-------------|
| Criação de chamados | SGTI → GLPI | Incidentes, Requisições |
| Consulta e atualização de status de chamados | SGTI ↔ GLPI | Incidentes, Requisições |
| Sincronização de inventário de ativos | GLPI → SGTI | Gestão de Ativos |
| Importação de categorias e tipos | GLPI → SGTI | Configuração |
| Histórico de atendimentos por ativo/usuário | GLPI → SGTI | Gestão de Ativos, IAM |

**API:** GLPI REST API v10.x (autenticação por *session token*).

**Premissa:** Usuário de integração dedicado no GLPI com permissões de leitura e escrita via API.

### 6.3 E-mail (implantacao@pinpag.com.br)

**Propósito:** Canal oficial de notificações transacionais e comunicações automáticas do sistema SGTI.

| Funcionalidade | Direção | Módulo SGTI |
|----------------|---------|-------------|
| Notificação de abertura de chamado | SGTI → Usuário | Incidentes, Requisições |
| Alertas de SLA em risco | SGTI → Técnico/Gestor | SLA |
| Comunicados de manutenção programada | SGTI → Usuários afetados | Gestão de Ativos |
| Alertas de aprovação pendente | SGTI → Aprovador | IAM, Compras, Projetos |
| Notificações de compliance | SGTI → Responsáveis | Compliance |
| Resumo diário operacional | SGTI → Gestores | Dashboards Operacionais |

**Configuração:** SMTP autenticado via Google Workspace com o endereço `implantacao@pinpag.com.br` como remetente padrão do sistema.

### 6.4 Supabase

**Propósito:** Plataforma de banco de dados e serviços de backend que hospeda o PostgreSQL, autenticação auxiliar e *storage* de evidências e anexos.

| Funcionalidade | Uso no SGTI |
|----------------|-------------|
| PostgreSQL gerenciado | Banco de dados principal de todos os módulos |
| Supabase Auth | Autenticação auxiliar e gerenciamento de sessões |
| Supabase Storage | Armazenamento de evidências de compliance, anexos de chamados e documentos |
| Supabase Realtime | Atualização em tempo real dos dashboards operacionais |
| Row Level Security (RLS) | Isolamento de dados por perfil e organização |

**Premissa:** Projeto Supabase criado com PostgreSQL disponível e RLS habilitado para todos os recursos sensíveis.

### 6.5 GitHub

**Propósito:** Repositório de código-fonte, controle de versão e rastreabilidade de entregas técnicas vinculadas a projetos e mudanças de TI.

| Funcionalidade | Direção | Módulo SGTI |
|----------------|---------|-------------|
| Rastreabilidade de *commits* por projeto | GitHub → SGTI | Projetos de TI |
| Webhooks de *pull request* e *merge* | GitHub → SGTI | Projetos de TI, Mudanças |
| Status de pipelines CI/CD | GitHub → SGTI | Dashboards Operacionais |
| Registro automático de mudanças em produção | GitHub → SGTI | Gestão de Mudanças |

**API:** GitHub REST API v3 / GraphQL API v4, autenticação via GitHub App ou PAT (*Personal Access Token*).

### 6.6 Vercel

**Propósito:** Plataforma de hospedagem e entrega contínua do frontend NextJS do SGTI.

| Funcionalidade | Direção | Módulo SGTI |
|----------------|---------|-------------|
| *Deploy* automático via GitHub | GitHub → Vercel | Pipeline CI/CD |
| Status de *deployments* | Vercel → SGTI | Dashboards Operacionais |
| Variáveis de ambiente por projeto | Vercel | Configuração |
| *Preview deployments* para ambientes de homologação | Vercel | Gestão de Projetos |

**API:** Vercel REST API, autenticação via *token* de projeto.

### 6.7 Mapa de Integrações

```
                        ┌─────────────────────────────────────────┐
                        │                  SGTI                   │
                        │                                         │
         ┌──────────────┤  Incidentes │ IAM │ Ativos │ Projetos  ├──────────────┐
         │              │  Requisições│Comp.│ Financ.│ Compras   │              │
         │              └──────┬──────┴──┬──┴───┬────┴─────┬─────┘              │
         │                     │         │      │          │                     │
         ▼                     ▼         ▼      ▼          ▼                    ▼
   ┌──────────┐         ┌──────────┐  ┌──────┐ ┌────────┐ ┌────────┐    ┌──────────┐
   │  Google  │         │   GLPI   │  │E-mail│ │Supabase│ │ GitHub │    │  Vercel  │
   │Workspace │         │ REST API │  │SMTP  │ │  PG    │ │  API   │    │   API    │
   └──────────┘         └──────────┘  └──────┘ └────────┘ └────────┘    └──────────┘
   SSO, IAM,            Chamados,     Notif.   BD, Auth,   Código,       Deploy,
   Gmail                Inventário    Trans.   Storage     Mudanças      Frontend
```

---

## 7. Indicadores Estratégicos

### 7.1 Perspectiva de Serviço e Atendimento

| Indicador | Descrição | Meta | Frequência |
|-----------|-----------|------|------------|
| **SLA Global** | % de chamados resolvidos dentro do prazo acordado | ≥ 95% | Mensal |
| **MTTR** | Tempo médio de resolução por categoria de chamado | Conforme SLA | Semanal |
| **MTTA** | Tempo médio de primeiro atendimento | Conforme SLA | Semanal |
| **CSAT** | Nota média de satisfação pós-atendimento | ≥ 4,0 / 5,0 | Mensal |
| **Taxa de Reabertura** | % de chamados reabertos após resolução | ≤ 5% | Mensal |
| **Chamados via KB** | % de resoluções com vínculo à Base de Conhecimento | ≥ 30% | Mensal |
| **Disponibilidade de Serviços Críticos** | Uptime de serviços classificados como críticos | ≥ 99,5% | Mensal |

### 7.2 Perspectiva de Ativos e Identidades

| Indicador | Descrição | Meta | Frequência |
|-----------|-----------|------|------------|
| **Precisão do Inventário** | % de ativos físicos com registro atualizado no SGTI | ≥ 98% | Trimestral |
| **Ativos com Garantia Vencida** | Qtd. de ativos críticos sem cobertura de garantia ativa | 0 | Mensal |
| **Licenças Subutilizadas** | % de licenças com uso abaixo de 20% | ≤ 10% | Trimestral |
| **Onboarding no Prazo** | % de provisionamentos de acesso realizados no prazo | ≥ 98% | Mensal |
| **Offboarding no Prazo** | % de revogações de acesso em até 24h do desligamento | 100% | Mensal |
| **Acessos sem Revisão** | Qtd. de acessos com revisão periódica em atraso | 0 | Semanal |

### 7.3 Perspectiva Financeira

| Indicador | Descrição | Meta | Frequência |
|-----------|-----------|------|------------|
| **OPEX Realizado vs. Orçado** | Desvio entre despesas recorrentes realizadas e orçadas | ≤ 5% | Mensal |
| **CAPEX Realizado vs. Orçado** | Desvio entre investimentos realizados e orçados | ≤ 10% | Mensal |
| **Contratos a Vencer (90 dias)** | Qtd. e valor de contratos sem tratativa de renovação | 0 | Mensal |
| **Custo por Chamado** | Custo operacional médio de TI por chamado atendido | Benchmarking | Trimestral |
| **TCO por Serviço** | Custo total de propriedade por serviço de TI | Tendência decrescente | Semestral |

### 7.4 Perspectiva de Compliance e Governança

| Indicador | Descrição | Meta | Frequência |
|-----------|-----------|------|------------|
| **Maturidade de Compliance** | % de controles implementados sobre o total mapeado | ≥ 85% | Trimestral |
| **NCs em Aberto** | Qtd. de não-conformidades sem plano de ação definido | 0 | Mensal |
| **Tempo Médio de Tratamento de NC** | Tempo médio para fechamento de não-conformidade | ≤ 30 dias | Mensal |
| **Políticas Vigentes e Revisadas** | % de políticas publicadas dentro do prazo de revisão | 100% | Semestral |
| **Conformidade LGPD** | % de processos com dados pessoais mapeados e documentados | 100% | Semestral |
| **Incidentes de Segurança** | Qtd. de incidentes de segurança registrados e tratados | Tendência 0 | Mensal |

### 7.5 Perspectiva de Projetos e Entrega

| Indicador | Descrição | Meta | Frequência |
|-----------|-----------|------|------------|
| **Projetos no Prazo** | % de projetos de TI com entregas dentro do cronograma | ≥ 80% | Mensal |
| **Projetos no Orçamento** | % de projetos com custo realizado dentro do orçamento aprovado | ≥ 85% | Mensal |
| **Lead Time de Compras** | Tempo médio entre requisição de compra e recebimento | Benchmarking | Trimestral |

---

## 8. Restrições Técnicas

### 8.1 Restrições de Arquitetura

- O sistema deve ser desenvolvido seguindo **Clean Architecture** com **DDD**, separando domínio, aplicação, infraestrutura e interface em camadas independentes.
- O backend deve ser implementado em **NestJS** e o frontend em **NextJS**, com separação clara de responsabilidades.
- O banco de dados principal é **PostgreSQL gerenciado via Supabase**, com acesso via **Prisma ORM**.
- Toda lógica de negócio deve residir na camada de domínio, sendo independente de frameworks e infraestrutura.
- Integrações externas (GLPI, Google Workspace, GitHub, Vercel) devem ser abstraídas por interfaces de *port/adapter*, nunca acopladas diretamente ao domínio.

### 8.2 Restrições de Segurança

- Toda autenticação deve ser federada via **Google Workspace (OAuth 2.0)** — nenhuma senha local deve ser armazenada no SGTI.
- O sistema deve implementar **RBAC** com segregação de privilégios mínimos por módulo e operação.
- Dados sensíveis (PII, credenciais de integração, logs de auditoria) devem ser armazenados com criptografia em repouso.
- Toda comunicação entre serviços e APIs externas deve ocorrer exclusivamente via **HTTPS/TLS 1.2+**.
- Registros de auditoria devem ser imutáveis — operações de DELETE são proibidas em tabelas de log de auditoria.
- *Tokens* e credenciais de integração devem ser armazenados exclusivamente em variáveis de ambiente gerenciadas (Supabase Vault, Vercel Environment Variables) — nunca em código-fonte ou documentação.

### 8.3 Restrições Operacionais

- Disponibilidade mínima de **99,5%** no horário comercial (07h–20h, segunda a sexta).
- Tempo de resposta das APIs principais não deve exceder **2 segundos** em condições normais de carga.
- Suporte mínimo a **500 usuários simultâneos** sem degradação perceptível de performance.
- Toda alteração em produção deve ser precedida por registro de mudança (*change record*) no SGTI.
- O processo de *deploy* deve ser automatizado via **GitHub Actions + Vercel**, sem intervenção manual em produção.

### 8.4 Restrições de Integração

- A integração com o GLPI deve ser **bidirecional** e preservar o GLPI como sistema de registro oficial de tickets.
- A integração com o Google Workspace deve respeitar os escopos de API definidos pelo administrador do domínio.
- Nenhuma integração deve expor credenciais, tokens ou dados pessoais em logs, interfaces de usuário ou respostas de API.
- Falhas em integrações externas não devem interromper o funcionamento do núcleo do SGTI — o sistema deve operar em modo degradado com fila de retry para operações pendentes.

### 8.5 Restrições Regulatórias

- O sistema deve estar em conformidade com a **LGPD (Lei nº 13.709/2018)** no tratamento de dados pessoais de colaboradores.
- Dados de auditoria e compliance devem ser retidos por no mínimo **5 anos**.
- O sistema deve suportar exportação de evidências de conformidade em formatos auditáveis (PDF, CSV, JSON).
- Dados pessoais de colaboradores desligados devem ser anonimizados após o período de retenção definido.

---

## 9. Critérios de Sucesso

Os critérios de sucesso do SGTI são organizados em três horizontes de avaliação: implantação, operação estabilizada e maturidade.

### 9.1 Critérios de Implantação (até 90 dias após go-live)

| Critério | Indicador de Cumprimento |
|----------|--------------------------|
| Todos os módulos do escopo implantados e operacionais | 100% dos módulos com status Vigente |
| Integrações com Google Workspace e GLPI funcionando | 0 falhas críticas de sincronização por semana |
| Equipe de TI treinada e operando no SGTI | ≥ 90% dos técnicos usando o SGTI como canal principal |
| Migração de chamados históricos do GLPI concluída | Base histórica disponível para consulta no SGTI |
| Catálogo de Serviços publicado com SLAs definidos | 100% dos serviços críticos catalogados com SLA |
| Dashboards executivos e operacionais funcionando | Relatório semanal gerado automaticamente |

### 9.2 Critérios de Operação Estabilizada (90 a 180 dias após go-live)

| Critério | Indicador de Cumprimento |
|----------|--------------------------|
| SLA Global ≥ 95% mantido por 3 meses consecutivos | Relatório mensal de SLA sem violações críticas |
| CSAT médio ≥ 4,0 por 3 meses consecutivos | Pesquisa pós-atendimento com resultado sustentado |
| 100% dos offboardings realizados em até 24h | Nenhum caso de acesso ativo após desligamento |
| Inventário de ativos com precisão ≥ 98% | Auditoria física vs. sistema com ≤ 2% de divergência |
| Base de Conhecimento com ≥ 50 artigos publicados | Relatório do módulo KMDB |
| Zero não-conformidades críticas de compliance abertas | Dashboard de Compliance sem NCs críticas abertas |

### 9.3 Critérios de Maturidade (após 180 dias)

| Critério | Indicador de Cumprimento |
|----------|--------------------------|
| Redução de ≥ 20% no MTTR em relação ao baseline pré-SGTI | Comparativo de relatórios antes e depois |
| Redução de ≥ 15% no OPEX de TI por eliminação de contratos e licenças redundantes | Relatório financeiro comparativo |
| Maturidade de Compliance ≥ 85% nos frameworks mapeados | Relatório de maturidade do módulo Compliance |
| 100% dos projetos de TI gerenciados dentro do SGTI | Nenhum projeto fora da plataforma |
| Dashboard Executivo utilizado pela alta direção como fonte primária de KPIs de TI | Confirmação em reunião de governança trimestral |
| NPS (*Net Promoter Score*) interno do SGTI ≥ 7,0 | Pesquisa semestral com usuários do sistema |

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição da Alteração |
|--------|------|-------|------------------------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa | Criação inicial do documento |
| 2.0.0 | 2026-06-09 | Arquitetura Corporativa | Revisão completa: módulos expandidos para 14, integrações atualizadas (e-mail, GitHub, Vercel, Supabase), seção de Critérios de Sucesso adicionada |

---

> **Próximos documentos recomendados:**
> [`Arquitetura/01_ARCHITECTURE_OVERVIEW.md`](./Arquitetura/01_ARCHITECTURE_OVERVIEW.md) — Visão geral da arquitetura técnica do SGTI
> [`Arquitetura/02_DOMAIN_MODEL.md`](./Arquitetura/02_DOMAIN_MODEL.md) — Modelo de domínio, bounded contexts e linguagem ubíqua
