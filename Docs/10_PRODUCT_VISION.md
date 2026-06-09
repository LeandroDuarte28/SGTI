# SGTI — Sistema de Gestão de Tecnologia da Informação
## Visão do Produto

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documento Relacionado:** [00_PROJECT_CONTEXT.md](../00_PROJECT_CONTEXT.md)

---

## Sumário

1. [Visão do Produto](#1-visão-do-produto)
2. [Problema de Negócio](#2-problema-de-negócio)
3. [Objetivos Estratégicos](#3-objetivos-estratégicos)
4. [Benefícios Esperados](#4-benefícios-esperados)
5. [Escopo](#5-escopo)
6. [Fora do Escopo](#6-fora-do-escopo)
7. [Público-Alvo](#7-público-alvo)
8. [Critérios de Sucesso](#8-critérios-de-sucesso)
9. [Indicadores de Valor](#9-indicadores-de-valor)

---

## 1. Visão do Produto

### 1.1 Declaração de Visão

> **Para** as equipes de TI e para a organização como um todo,
> **o SGTI** é uma plataforma corporativa unificada de gestão de serviços de TI,
> **que** centraliza, automatiza e governa todos os processos de TI em um único sistema,
> **diferente de** ferramentas isoladas, planilhas e processos informais,
> **nosso produto** entrega visibilidade total, governança real e decisões baseadas em dados —
> do chamado aberto pelo colaborador até o KPI apresentado ao conselho.

### 1.2 Síntese do Produto

O **SGTI (Sistema de Gestão de Tecnologia da Informação)** é uma plataforma corporativa construída sobre os princípios do **ITIL v4** (*Information Technology Infrastructure Library*) que unifica em uma única solução todos os processos críticos de TI: atendimento, operação, governança, conformidade e finanças.

O sistema não é uma ferramenta de helpdesk. É uma camada de inteligência operacional que conecta o colaborador que abre um chamado ao gestor que aprova um investimento, passando pelo técnico que resolve o incidente, pelo auditor que valida a conformidade e pelo diretor que analisa os indicadores estratégicos.

O SGTI é integrado nativamente ao **Google Workspace** — como provedor de identidade e canal de comunicação —, ao **GLPI** — como sistema de registro de chamados existente —, ao **GitHub** e **Vercel** — para rastreabilidade de entregas técnicas e pipeline de implantação —, e ao **Supabase** como plataforma de dados.

### 1.3 Posicionamento

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SGTI                                        │
│                                                                     │
│   "Uma plataforma. Todos os processos de TI. Decisões com dados."   │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  ATENDIMENTO │  │  GOVERNANÇA  │  │  ESTRATÉGIA  │              │
│  │              │  │              │  │              │              │
│  │  Incidentes  │  │   Ativos     │  │  Financeiro  │              │
│  │  Requisições │  │  Identidades │  │  Projetos    │              │
│  │  Problemas   │  │  Compliance  │  │  Dashboards  │              │
│  │  SLA         │  │  Compras     │  │  Executivos  │              │
│  │  Catálogo    │  │  Políticas   │  │              │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
            │                  │                  │
            ▼                  ▼                  ▼
     Google Workspace        GLPI           GitHub / Vercel
     (Identidade, E-mail)  (Tickets)       (Código, Deploy)
```

---

## 2. Problema de Negócio

### 2.1 Diagnóstico da Situação Atual

A organização opera sem um sistema unificado de gestão de TI. Os processos existem — mas estão fragmentados entre ferramentas distintas, planilhas de controle manual, comunicações informais por e-mail e memória operacional das equipes. Isso gera um conjunto de problemas sistêmicos que impactam diretamente a eficiência operacional, a segurança da informação, a conformidade regulatória e a capacidade de decisão da liderança.

### 2.2 Problemas Identificados

**Problema 1 — Invisibilidade do Atendimento**

Sem um fluxo estruturado de chamados, não há como medir com precisão o volume de demanda, o tempo médio de resolução, a taxa de recorrência de problemas ou o cumprimento de SLAs. A gestão de TI opera no modo reativo, apagando incêndios sem dados para preveni-los.

*Impacto:* Usuários insatisfeitos, SLAs descumpridos, retrabalho recorrente e ausência de base para decisões de capacidade e contratação.

---

**Problema 2 — Rastreabilidade Zero de Ativos**

O parque de ativos de TI é gerenciado de forma parcial ou inexistente. Equipamentos sem localização confirmada, licenças de software com quantidade desconhecida, garantias vencidas não identificadas e depreciação não calculada são realidades que geram tanto desperdício financeiro quanto risco operacional.

*Impacto:* Compras desnecessárias, auditorias não sustentadas, risco de uso de software sem licença e impossibilidade de planejamento preciso de CAPEX.

---

**Problema 3 — Gestão Manual de Acessos**

O provisionamento e a revogação de acessos dependem de processos manuais e comunicações informais. Colaboradores iniciam suas atividades sem os acessos necessários. Colaboradores desligados permanecem com acessos ativos por horas ou dias após o desligamento.

*Impacto:* Risco de segurança crítico, descumprimento de LGPD e ISO/IEC 27001, além de perda de produtividade nos processos de *onboarding*.

---

**Problema 4 — Conformidade sem Evidências**

Políticas de TI existem em documentos dispersos, sem versionamento, sem rastreabilidade de publicação e sem mecanismo de coleta de evidências de implementação. Em processos de auditoria, a equipe de TI gasta semanas reunindo manualmente informações que deveriam estar disponíveis em minutos.

*Impacto:* Risco regulatório elevado, alto custo de preparação para auditorias e incapacidade de demonstrar maturidade de segurança para parceiros e clientes.

---

**Problema 5 — Cegueira Financeira sobre TI**

Os custos reais de TI — somados OPEX e CAPEX — não estão consolidados em nenhum sistema. Contratos com fornecedores vencem sem aviso. Licenças são renovadas automaticamente sem análise de uso. Não existe rateio de custo por área. A TI não consegue demonstrar seu valor nem justificar seus investimentos com dados.

*Impacto:* Decisões de investimento baseadas em percepção, não em dados; desperdício orçamentário; impossibilidade de calcular TCO (*Total Cost of Ownership*) por serviço.

---

**Problema 6 — Conhecimento Não Documentado**

O conhecimento técnico da equipe de TI reside na memória das pessoas. Soluções encontradas para incidentes complexos não são registradas. Quando um técnico experiente se ausenta ou é desligado, o conhecimento vai junto. O resultado é a resolução repetida dos mesmos problemas.

*Impacto:* MTTR elevado, dependência de pessoas-chave, perda de produtividade e incapacidade de escalar o atendimento.

---

**Problema 7 — Ausência de Visibilidade Executiva**

A alta direção não tem acesso a indicadores consolidados de TI. Não existe um painel que mostre, em tempo real, o estado dos serviços, o custo de TI, o nível de conformidade ou o status dos projetos estratégicos. Decisões de priorização e investimento são tomadas sem dados objetivos.

*Impacto:* TI percebida como centro de custo opaco, dificuldade de justificar investimentos e ausência de alinhamento entre estratégia de TI e objetivos de negócio.

### 2.3 Custo da Inação

Manter o cenário atual sem o SGTI implica:

| Dimensão | Custo da Inação |
|----------|----------------|
| **Operacional** | Continuidade do modo reativo, MTTR elevado e retrabalho recorrente |
| **Financeiro** | Desperdício estimado em licenças subutilizadas, contratos não gerenciados e compras duplicadas |
| **Segurança** | Risco crescente de incidentes de segurança por acessos não revogados e sem gestão |
| **Conformidade** | Exposição a penalidades regulatórias (LGPD) e desclassificação em auditorias |
| **Estratégico** | Incapacidade de demonstrar valor da TI e alinhar investimentos aos objetivos da organização |

---

## 3. Objetivos Estratégicos

Os objetivos estratégicos do SGTI estão organizados em três horizontes, refletindo a progressão da implantação ao valor de longo prazo.

### 3.1 Horizonte 1 — Fundação (0 a 90 dias)

**OE-01 — Unificação do Atendimento**
Consolidar todos os chamados de TI — incidentes, requisições e problemas — em uma única plataforma com fluxos estruturados, SLAs definidos e integração bidirecional com o GLPI. Eliminar o atendimento informal por e-mail, WhatsApp ou verbal sem registro.

**OE-02 — Inventário Real de Ativos**
Estabelecer inventário completo e rastreável do parque de ativos de TI, sincronizado com o GLPI e enriquecido com dados de responsável, localização, garantia, licença e ciclo de vida.

**OE-03 — Controle de Identidades**
Automatizar o provisionamento e a revogação de acessos integrado ao Google Workspace, eliminando o intervalo entre o evento de RH (admissão/desligamento) e a ação de TI sobre os acessos.

### 3.2 Horizonte 2 — Governança (90 a 180 dias)

**OE-04 — Compliance Rastreável**
Publicar o mapa de controles de TI com framework definido (LGPD, ISO/IEC 27001), coletar evidências de implementação e gerar relatórios de maturidade auditáveis.

**OE-05 — Visibilidade Financeira**
Consolidar OPEX e CAPEX de TI com rateio por centro de custo, controle de contratos, alertas de vencimento e relatórios de custo por serviço. Prover dados para o planejamento orçamentário anual.

**OE-06 — Base de Conhecimento Ativa**
Transformar o conhecimento tácito da equipe em base de conhecimento estruturada, vinculando soluções de incidentes a artigos publicados e reduzindo a dependência de pessoas específicas.

### 3.3 Horizonte 3 — Maturidade (180+ dias)

**OE-07 — Inteligência Estratégica**
Disponibilizar dashboards executivos com KPIs consolidados de TI para a alta direção, eliminando a necessidade de relatórios manuais e posicionando a TI como parceira estratégica do negócio.

**OE-08 — Gestão de Projetos e Compras**
Integrar o ciclo de vida de projetos e o processo de compras de TI à plataforma, com rastreabilidade financeira, aprovações estruturadas e vínculo com ativos adquiridos.

**OE-09 — Melhoria Contínua Orientada a Dados**
Usar os dados acumulados pelo SGTI para identificar padrões de recorrência, gargalos de atendimento, oportunidades de redução de custo e áreas de risco, alimentando um ciclo contínuo de melhoria dos serviços de TI.

---

## 4. Benefícios Esperados

### 4.1 Para a Organização

| Benefício | Descrição | Horizonte |
|-----------|-----------|-----------|
| **Redução de risco operacional** | Eliminação de acessos indevidos, ativos sem rastreabilidade e conformidade sem evidências | H1 |
| **Decisões baseadas em dados** | KPIs de TI disponíveis em tempo real para gestores e diretores | H2/H3 |
| **Redução de custo de TI** | Identificação de licenças subutilizadas, contratos desnecessários e compras duplicadas | H2 |
| **Sustentação de auditorias** | Evidências de conformidade centralizadas e rastreáveis, reduzindo custo de preparação | H2 |
| **Alinhamento TI-Negócio** | Visibilidade do valor entregue pela TI e rastreabilidade do ROI de projetos | H3 |

### 4.2 Para a Equipe de TI

| Benefício | Descrição | Horizonte |
|-----------|-----------|-----------|
| **Processos estruturados** | Fluxos de atendimento padronizados com SLAs claros e escalonamento automático | H1 |
| **Menos trabalho manual** | Provisionamento de acesso, notificações e escalações automatizadas | H1 |
| **Conhecimento acessível** | Base de conhecimento disponível durante o atendimento, reduzindo MTTR | H2 |
| **Visibilidade da carga** | Dashboards operacionais com fila por técnico, SLAs em risco e backlog | H1/H2 |
| **Reconhecimento do trabalho** | Métricas de atendimento visíveis pela gestão, justificando capacidade e investimentos | H2/H3 |

### 4.3 Para o Usuário Final

| Benefício | Descrição | Horizonte |
|-----------|-----------|-----------|
| **Canal único** | Portal de autoatendimento para abertura, acompanhamento e histórico de chamados | H1 |
| **Transparência** | Comunicação proativa sobre status, SLA e previsão de resolução | H1 |
| **Agilidade no onboarding** | Acesso aos sistemas necessários disponível no primeiro dia de trabalho | H1 |
| **Autoatendimento** | Base de conhecimento para resolução autônoma de problemas comuns | H2 |

### 4.4 Para a Alta Direção

| Benefício | Descrição | Horizonte |
|-----------|-----------|-----------|
| **Visibilidade executiva** | Dashboard consolidado com KPIs de TI sem dependência de relatórios manuais | H2/H3 |
| **Controle de investimentos** | CAPEX e OPEX de TI rastreáveis e comparáveis ao orçamento aprovado | H2 |
| **Gestão de riscos** | Indicadores de compliance, segurança e conformidade acessíveis em tempo real | H2 |
| **ROI demonstrável** | Custo por serviço e por chamado calculados, permitindo comparação com benchmarks | H3 |

---

## 5. Escopo

### 5.1 Módulos do Sistema

| # | Módulo | Descrição Funcional |
|---|--------|---------------------|
| 01 | **Gestão de Incidentes** | Ciclo completo de interrupções: registro, priorização (matriz ITIL), escalonamento por SLA, resolução e encerramento com vínculo à Base de Conhecimento. Integração bidirecional com GLPI. |
| 02 | **Gestão de Requisições** | Atendimento de solicitações previstas no Catálogo de Serviços com fluxos de aprovação configuráveis por tipo, SLAs diferenciados e portal de autoatendimento. |
| 03 | **Gestão de Problemas** | Investigação de causa raiz de incidentes recorrentes ou de alto impacto, registro de workarounds, KEDB (*Known Error Database*) e publicação de soluções definitivas. |
| 04 | **Gestão de Ativos (ITAM)** | Inventário completo com ciclo de vida (Aquisição → Uso → Descarte), depreciação, controle de licenças, alertas de garantia e sincronização com GLPI. |
| 05 | **Gestão de Identidades (IAM)** | Provisionamento e revogação de acessos integrado ao Google Workspace, RBAC, revisão periódica (*Access Review*) e log imutável de alterações. |
| 06 | **Gestão de Compliance** | Publicação de políticas com versionamento, mapeamento de controles (LGPD, ISO 27001, ITIL v4), gestão de não-conformidades, coleta de evidências e auditorias. |
| 07 | **Gestão Financeira (OPEX/CAPEX)** | Controle de orçamento, contratos, despesas recorrentes, rateio por centro de custo, TCO por serviço e alertas de vencimento contratual. |
| 08 | **Gestão de Compras** | Requisições de compra com fluxo de aprovação, cadastro de fornecedores, controle de recebimento e integração com o módulo financeiro e ITAM. |
| 09 | **Gestão de Projetos de TI** | Gestão de iniciativas com escopo, cronograma, custo, riscos, rastreabilidade de entregas via GitHub e integração com o módulo financeiro. |
| 10 | **Catálogo de Serviços** | Repositório formal de serviços de TI com descrição, canais de solicitação, responsáveis, SLAs associados e controle de versão. |
| 11 | **SLA** | Definição, monitoramento em tempo real, pausa de SLA, alertas preditivos de violação e relatórios históricos de desempenho. |
| 12 | **Base de Conhecimento (KMDB)** | Artigos técnicos e para usuário final com controle editorial, busca *full-text*, avaliação por leitores e vínculo a chamados resolvidos. |
| 13 | **Dashboards Executivos** | KPIs estratégicos consolidados: SLA global, custo de TI, maturidade de compliance, disponibilidade de serviços e status de projetos. |
| 14 | **Dashboards Operacionais** | Visibilidade diária: fila por técnico, SLAs em risco, ativos em manutenção, acessos pendentes e alertas operacionais. |

### 5.2 Integrações do Escopo

| Integração | Tipo | Propósito Principal |
|------------|------|---------------------|
| **Google Workspace** | Bidirecional | SSO, provisionamento de identidades, sincronização de grupos e notificações via Gmail |
| **GLPI** | Bidirecional | Sincronização de chamados e inventário de ativos |
| **E-mail** (`implantacao@pinpag.com.br`) | Saída | Notificações transacionais, alertas de SLA e comunicados automáticos do sistema |
| **Supabase** | Interno | Banco de dados PostgreSQL, storage de evidências/anexos e autenticação auxiliar |
| **GitHub** | Entrada | Rastreabilidade de commits, status de pipelines e registro automático de mudanças |
| **Vercel** | Entrada | Status de deploys e gestão de ambientes do frontend |

### 5.3 Capacidades Transversais

Presentes em todos os módulos, sem necessidade de configuração adicional:

- **Auditoria completa:** toda alteração em qualquer entidade gera registro imutável de quem, quando e o quê foi alterado.
- **Controle de acesso RBAC:** cada operação em cada módulo é controlada por papel e permissão granular.
- **Notificações automáticas:** eventos relevantes disparam notificações via e-mail (`implantacao@pinpag.com.br`) para os responsáveis configurados.
- **Busca global:** pesquisa unificada que atravessa chamados, ativos, artigos e contratos.
- **Exportação de dados:** todos os relatórios exportáveis em PDF, CSV e JSON para fins de auditoria e integração.

---

## 6. Fora do Escopo

### 6.1 Sistemas Não Substituídos

O SGTI **não substitui** os sistemas abaixo. Integra-se a eles, preservando os investimentos existentes:

| Sistema | Papel Mantido | Relação com o SGTI |
|---------|--------------|---------------------|
| **GLPI** | Sistema de registro oficial de chamados e inventário legado | SGTI integra e governa; GLPI permanece como fonte de verdade para tickets existentes |
| **Google Workspace** | Provedor de identidade corporativa, e-mail e colaboração | SGTI consome identidades e delega autenticação; não gerencia o Workspace |
| **GitHub** | Repositório de código-fonte e controle de versão | SGTI consome eventos do GitHub; não gerencia repositórios |
| **Vercel** | Plataforma de hospedagem e deploy do frontend | SGTI monitora status; não gerencia a plataforma Vercel |

### 6.2 Funcionalidades Explicitamente Excluídas

| Funcionalidade | Justificativa da Exclusão |
|----------------|--------------------------|
| Monitoramento de infraestrutura de rede (switches, roteadores, firewall) | Escopo de ferramentas especializadas de monitoramento (Zabbix, Grafana, etc.) |
| Sistemas de ERP, CRM ou plataformas corporativas não relacionadas a TI | Fora do domínio de TI; sem benefício de integração imediata |
| Aplicativos móveis nativos (iOS e Android) | Fora do escopo do MVP; avaliado para fase posterior |
| Gestão de Recursos Humanos | SGTI consome eventos de RH, mas não os gerencia |
| Ferramenta de vídeoconferência ou colaboração em tempo real | Google Meet/Google Chat cobrem essa necessidade no ecossistema existente |
| Gestão de projetos não relacionados a TI | Fora do domínio — SGTI cobre apenas projetos de TI |
| Helpdesk externo (atendimento a clientes da organização) | O SGTI atende colaboradores internos, não clientes externos |
| Business Intelligence (BI) avançado com modelagem multidimensional | Dashboards do SGTI cobrem KPIs operacionais e executivos; BI avançado é fora do escopo |

---

## 7. Público-Alvo

### 7.1 Usuários Primários — Operam o Sistema Diariamente

| Perfil | Descrição | Módulos Principais |
|--------|-----------|-------------------|
| **Técnico de TI** | Analista que atende chamados, registra soluções e gerencia ativos | Incidentes, Requisições, Ativos, Base de Conhecimento |
| **Especialista de TI** | Profissional sênior responsável por domínios específicos (Infra, Segurança, Sistemas) | Problemas, IAM, Compliance, Projetos |
| **Gestor de TI** | Coordenador ou gerente responsável pela operação e entrega de serviços de TI | Todos — com foco em SLA, Financeiro e Dashboards Operacionais |

### 7.2 Usuários Secundários — Utilizam Pontualmente

| Perfil | Descrição | Módulos Principais |
|--------|-----------|-------------------|
| **Colaborador (usuário final)** | Qualquer funcionário que consome serviços de TI | Portal de autoatendimento, Incidentes, Requisições, Base de Conhecimento |
| **Gestor de área** | Líderes de equipe que aprovam requisições e acompanham chamados da sua equipe | Requisições, Projetos, Dashboards |
| **Auditor interno** | Responsável por avaliações periódicas de conformidade | Compliance, IAM, Ativos, Logs de Auditoria |

### 7.3 Usuários Estratégicos — Consomem Resultados

| Perfil | Descrição | Módulos Principais |
|--------|-----------|-------------------|
| **Diretor de TI** | Responsável pela estratégia e governança de TI | Dashboards Executivos, Financeiro, Compliance, Projetos |
| **C-Level / Diretoria** | Alta direção com interesse em KPIs estratégicos e financeiros de TI | Dashboards Executivos, Financeiro |

### 7.4 Usuários Técnicos — Configuram e Mantêm

| Perfil | Descrição | Módulos Principais |
|--------|-----------|-------------------|
| **Administrador do SGTI** | Responsável pela configuração, parametrização e manutenção da plataforma | Todos os módulos + Administração do sistema |
| **Arquiteto de TI** | Define e mantém a arquitetura técnica e as integrações | Integrações, Configuração avançada |

### 7.5 Stakeholders (não usuários diretos)

| Stakeholder | Interesse no SGTI |
|-------------|------------------|
| **RH / Gestão de Pessoas** | Parceiro nos processos de admissão e desligamento que disparam o IAM |
| **Financeiro / Controladoria** | Consumidor dos relatórios de CAPEX/OPEX e contratos de TI |
| **Jurídico / DPO** | Beneficiário do módulo de Compliance e conformidade com LGPD |
| **Fornecedores de TI** | Referenciados no módulo de Compras e contratos |
| **Conselho / Acionistas** | Receptores indiretos dos indicadores de governança e maturidade de TI |

---

## 8. Critérios de Sucesso

### 8.1 Critérios de Implantação — Horizonte 1 (até 90 dias)

Os critérios abaixo determinam se o projeto foi implantado com sucesso. A ausência de qualquer um deles configura implantação incompleta.

| # | Critério | Como Medir | Meta |
|---|----------|------------|------|
| CS-01 | Todos os 14 módulos implantados e operacionais | Status dos módulos no ambiente de produção | 100% Vigente |
| CS-02 | Integração com Google Workspace ativa | Usuários autenticando via SSO sem erros | 0 falhas críticas/semana |
| CS-03 | Integração com GLPI sincronizando chamados | Tickets criados no SGTI refletindo no GLPI | Sincronização em < 5 min |
| CS-04 | Equipe de TI operando no SGTI como canal principal | % de chamados registrados no SGTI vs. canal informal | ≥ 90% |
| CS-05 | Catálogo de Serviços publicado com SLAs definidos | Serviços críticos catalogados com SLA ativo | 100% dos serviços críticos |
| CS-06 | Notificações automáticas via e-mail funcionando | Taxa de entrega de e-mails transacionais | ≥ 99% |
| CS-07 | Treinamento da equipe concluído | % da equipe de TI treinada e certificada | ≥ 90% |

### 8.2 Critérios de Estabilização — Horizonte 2 (90 a 180 dias)

| # | Critério | Como Medir | Meta |
|---|----------|------------|------|
| CS-08 | SLA Global mantido por 3 meses consecutivos | Relatório mensal de SLA | ≥ 95% |
| CS-09 | CSAT sustentado por 3 meses consecutivos | Pesquisa pós-atendimento | ≥ 4,0 / 5,0 |
| CS-10 | 100% dos offboardings em até 24h | Tempo entre desligamento e revogação de acesso | 0 acessos ativos após 24h |
| CS-11 | Inventário de ativos com precisão confirmada | Auditoria física vs. registro no sistema | ≤ 2% de divergência |
| CS-12 | Base de Conhecimento com volume operacional | Artigos publicados e vinculados a chamados | ≥ 50 artigos ativos |
| CS-13 | Zero NCs críticas de compliance em aberto | Dashboard de Compliance | 0 NCs críticas sem plano de ação |
| CS-14 | Dashboards executivos em uso pela liderança | Confirmação de uso regular pelo Diretor de TI | Uso semanal confirmado |

### 8.3 Critérios de Maturidade — Horizonte 3 (após 180 dias)

| # | Critério | Como Medir | Meta |
|---|----------|------------|------|
| CS-15 | Redução mensurável do MTTR | Comparativo MTTR pré e pós-SGTI por categoria | Redução ≥ 20% |
| CS-16 | Redução de desperdício financeiro | Contratos/licenças cancelados após análise do SGTI | Redução ≥ 15% no OPEX |
| CS-17 | Maturidade de compliance consolidada | Relatório trimestral de maturidade | ≥ 85% de controles implementados |
| CS-18 | 100% dos projetos de TI gerenciados no SGTI | Auditoria de projetos ativos | 0 projetos fora da plataforma |
| CS-19 | NPS interno do SGTI positivo | Pesquisa semestral com usuários | NPS ≥ 30 / Nota média ≥ 7,0 |
| CS-20 | SGTI como fonte primária de KPIs de TI | Confirmação em reunião de governança | Validado em reunião trimestral |

---

## 9. Indicadores de Valor

Os indicadores de valor traduzem o impacto do SGTI em métricas objetivas, organizados por perspectiva e dimensão de valor entregue.

### 9.1 Valor Operacional — Eficiência do Atendimento

| Indicador | Linha Base (pré-SGTI) | Meta (12 meses) | Fonte de Dados |
|-----------|----------------------|-----------------|----------------|
| **MTTR médio geral** | A medir no go-live | Redução ≥ 20% | Módulo Incidentes |
| **MTTA (primeiro atendimento)** | A medir no go-live | Conforme SLA por categoria | Módulo Incidentes |
| **SLA Global** | Não medido | ≥ 95% | Módulo SLA |
| **Taxa de reabertura de chamados** | A medir no go-live | ≤ 5% | Módulo Incidentes/Requisições |
| **% chamados resolvidos via KB** | 0% (sem KB estruturado) | ≥ 30% | Base de Conhecimento |
| **CSAT médio** | Não medido | ≥ 4,0 / 5,0 | Módulo Incidentes/Requisições |
| **Volume de chamados informais (fora do sistema)** | ~100% informal | ≤ 10% | Auditoria periódica |

### 9.2 Valor de Segurança e Governança — Redução de Risco

| Indicador | Linha Base (pré-SGTI) | Meta (12 meses) | Fonte de Dados |
|-----------|----------------------|-----------------|----------------|
| **Tempo médio de revogação de acesso (offboarding)** | > 48h (manual) | ≤ 4h (automatizado) | Módulo IAM |
| **Tempo médio de provisionamento (onboarding)** | > 24h (manual) | ≤ 2h (automatizado) | Módulo IAM |
| **Contas ativas após desligamento** | Desconhecido | 0 | Módulo IAM |
| **Precisão do inventário de ativos** | < 70% (estimado) | ≥ 98% | Gestão de Ativos |
| **Licenças sem revisão de uso** | Desconhecido | ≤ 10% subutilizadas | Gestão de Ativos |
| **Maturidade de compliance (controles implementados)** | A avaliar no go-live | ≥ 85% | Módulo Compliance |
| **NCs críticas de compliance em aberto** | Desconhecido | 0 | Módulo Compliance |

### 9.3 Valor Financeiro — Eficiência de Custo

| Indicador | Linha Base (pré-SGTI) | Meta (12 meses) | Fonte de Dados |
|-----------|----------------------|-----------------|----------------|
| **OPEX de TI rastreado vs. total** | < 40% rastreado | 100% rastreado | Módulo Financeiro |
| **Contratos com renovação automática sem análise** | Maioria | 0 | Módulo Financeiro |
| **Redução de OPEX por eliminação de itens desnecessários** | Baseline após primeiro inventário | ≥ 15% no 2º ano | Módulo Financeiro |
| **Tempo de preparação para auditoria de TI** | Semanas (manual) | ≤ 1 dia (automatizado) | Módulo Compliance |
| **Custo por chamado atendido** | Não calculado | Calculado e em declínio | Módulos Financeiro + Service Desk |

### 9.4 Valor Estratégico — Alinhamento e Decisão

| Indicador | Linha Base (pré-SGTI) | Meta (12 meses) | Fonte de Dados |
|-----------|----------------------|-----------------|----------------|
| **Frequência de acesso da liderança a KPIs de TI** | Sob demanda (relatório manual) | Semanal (dashboard automático) | Dashboard Executivo |
| **Projetos de TI com rastreabilidade de custo** | < 30% | 100% | Módulo Projetos |
| **Tempo médio de aprovação de compras de TI** | A medir no go-live | Redução ≥ 40% | Módulo Compras |
| **NPS interno do SGTI** | N/A | ≥ 30 | Pesquisa semestral |
| **% da liderança usando SGTI como fonte de KPIs** | 0% | ≥ 80% | Pesquisa e análise de uso |

### 9.5 Resumo do Valor em 12 Meses

```
DIMENSÃO          ANTES (pré-SGTI)          DEPOIS (12 meses)
─────────────────────────────────────────────────────────────
Atendimento       Reativo, informal          Proativo, estruturado, com SLA ≥ 95%
Acessos           Manual, > 48h              Automatizado, ≤ 4h
Ativos            < 70% rastreados           ≥ 98% inventariados
Compliance        Sem evidências             Maturidade ≥ 85%, auditoria em 1 dia
Financeiro        < 40% OPEX rastreado       100% rastreado, redução ≥ 15%
Decisão           Percepção + relatório      Dashboard em tempo real
```

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição da Alteração |
|--------|------|-------|------------------------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa | Criação do documento |

---

> **Próximos documentos recomendados:**
> [`Arquitetura/01_ARCHITECTURE_OVERVIEW.md`](./Arquitetura/01_ARCHITECTURE_OVERVIEW.md) — Visão geral da arquitetura técnica do SGTI
> [`Módulos/05_SERVICE_DESK.md`](./Módulos/05_SERVICE_DESK.md) — Especificação funcional dos módulos de Incidentes e Requisições
