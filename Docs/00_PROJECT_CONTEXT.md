# SGTI — Sistema de Gestão de Tecnologia da Informação
## Documento de Contexto do Projeto

> **Classificação:** Interno — Restrito  
> **Versão:** 1.0.0  
> **Status:** Aprovado para Desenvolvimento  
> **Última Atualização:** 2026-06-09  
> **Responsável:** Arquitetura Corporativa de TI

---

## Sumário

1. [Resumo Executivo](#1-resumo-executivo)
2. [Objetivo do Sistema](#2-objetivo-do-sistema)
3. [Escopo Geral](#3-escopo-geral)
4. [Principais Módulos](#4-principais-módulos)
5. [Benefícios Esperados](#5-benefícios-esperados)
6. [Público-Alvo](#6-público-alvo)
7. [Restrições Técnicas](#7-restrições-técnicas)
8. [Integrações Obrigatórias](#8-integrações-obrigatórias)
9. [Indicadores Estratégicos](#9-indicadores-estratégicos)

---

## 1. Resumo Executivo

O **SGTI (Sistema de Gestão de Tecnologia da Informação)** é uma plataforma corporativa unificada concebida para centralizar, automatizar e governar os processos de TI da organização. O sistema foi projetado com base nas práticas do **ITIL v4**, incorporando gestão de serviços, ativos, identidades, conformidade regulatória e controle financeiro de TI em uma única solução integrada.

A ausência de um sistema unificado de gestão de TI gera fragmentação de processos, dificuldade na rastreabilidade de ativos, inconsistência no controle de acessos, baixa visibilidade sobre SLAs e ausência de indicadores financeiros confiáveis para decisões de CAPEX e OPEX. O SGTI resolve diretamente esse conjunto de problemas ao estabelecer uma camada de governança transversal, integrada às ferramentas já em uso na organização — Google Workspace e GLPI — e orientada a dashboards executivos, operacionais, financeiros e de compliance.

O projeto é de caráter estratégico e seu desenvolvimento seguirá os princípios de **Clean Architecture**, **Domain-Driven Design (DDD)** e separação clara de responsabilidades técnicas, garantindo manutenibilidade, escalabilidade e auditabilidade em todas as camadas do sistema.

---

## 2. Objetivo do Sistema

### 2.1 Objetivo Geral

Prover uma plataforma centralizada de Gestão de TI que unifique os processos de suporte, controle de ativos, gerenciamento de identidades, compliance regulatório e visibilidade financeira, alinhada ao framework ITIL v4 e integrada ao ecossistema tecnológico existente da organização.

### 2.2 Objetivos Específicos

**Governança e Compliance**
- Estabelecer rastreabilidade completa de ativos de TI, do ciclo de aquisição ao descarte.
- Garantir conformidade com políticas internas de segurança e regulações aplicáveis (LGPD, ISO/IEC 27001, auditorias internas).
- Formalizar e monitorar SLAs de todos os serviços de TI catalogados.

**Operacional**
- Centralizar o registro e o acompanhamento de chamados de Service Desk com vínculo direto ao GLPI.
- Automatizar o ciclo de vida de identidades e acessos, reduzindo operações manuais e riscos de acesso indevido.
- Disponibilizar uma Base de Conhecimento estruturada acessível a usuários finais e técnicos.

**Estratégico e Financeiro**
- Oferecer visibilidade em tempo real sobre o consumo de recursos de TI (OPEX) e investimentos (CAPEX).
- Subsidiar decisões de renovação, descontinuação e aquisição de ativos com dados concretos.
- Prover dashboards executivos com KPIs estratégicos de TI para alta direção.

---

## 3. Escopo Geral

### 3.1 O que está no escopo

| Área | Descrição |
|------|-----------|
| Service Desk | Gestão de chamados, SLA, categorização, escalonamento e histórico |
| Catálogo de Serviços | Definição, publicação e controle de versões dos serviços de TI |
| Gestão de Ativos | Inventário, ciclo de vida, localização, responsáveis e depreciação |
| Gestão de Identidades | Provisionamento, desprovisionamento, controle de acessos e revisão periódica |
| Compliance | Auditorias, políticas, evidências, não-conformidades e planos de ação |
| Base de Conhecimento | Artigos, FAQs, soluções de contorno e procedimentos técnicos |
| Gestão Financeira de TI | Controle de CAPEX, OPEX, orçamento, contratos e fornecedores |
| Dashboards | Executivo, Operacional, Financeiro e Compliance |
| Integrações | Google Workspace e GLPI |

### 3.2 O que está fora do escopo

- Desenvolvimento ou substituição do GLPI (o SGTI se integra ao GLPI existente, não o substitui).
- Gestão de infraestrutura de rede (roteadores, switches, firewall) — monitorado por ferramentas específicas.
- Sistemas de ERP, CRM ou outras plataformas corporativas não relacionadas à TI.
- Desenvolvimento de aplicativos móveis nativos na fase inicial.
- Gestão de projetos de TI (escopo futuro — fora do MVP).

### 3.3 Premissas do Projeto

- A organização já possui o Google Workspace ativo com domínio gerenciado.
- O GLPI está instalado e operacional com base de dados acessível via API.
- A equipe de TI possui processos informais que serão formalizados pelo SGTI.
- Existe um patrocinador executivo responsável pela aprovação de investimentos CAPEX do projeto.

---

## 4. Principais Módulos

### 4.1 Módulo de Service Desk

Responsável pelo ciclo completo de atendimento a chamados de TI, desde a abertura até o fechamento com avaliação de satisfação. Integra-se bidireccionalmente ao GLPI, preservando o histórico de tickets e habilitando workflows de escalonamento automático baseados em SLA.

Funcionalidades centrais:
- Abertura de chamados por usuário final, técnico ou integração automática.
- Categorização por tipo, impacto e urgência (matriz de prioridade ITIL).
- Painel de fila de atendimento por técnico e por grupo.
- Controle de tempo de resposta e resolução com alertas de SLA.
- Registro de solução vinculado à Base de Conhecimento.
- Avaliação de satisfação pós-atendimento (CSAT).
- Histórico completo por usuário, ativo e serviço.

### 4.2 Módulo de Catálogo de Serviços

Repositório formal de todos os serviços de TI oferecidos à organização, com definição clara de escopo, responsáveis, canais de solicitação, SLAs acordados e custos associados.

Funcionalidades centrais:
- Cadastro e publicação de serviços com descrição técnica e para o usuário final.
- Versionamento do catálogo com controle de aprovação.
- Associação de SLAs por tipo de serviço e perfil de usuário.
- Classificação por categoria (Infraestrutura, Aplicações, Segurança, Suporte, etc.).
- Portal de solicitação integrado ao Service Desk.
- Relatório de demanda por serviço para planejamento de capacidade.

### 4.3 Módulo de Gestão de Ativos (ITAM)

Controle completo do ciclo de vida dos ativos de TI — hardware, software, licenças e infraestrutura — desde a requisição de compra até o descarte. Inclui rastreabilidade por número de série, responsável, localização e estado de conformidade.

Funcionalidades centrais:
- Inventário de ativos com campos configuráveis por categoria.
- Gestão de ciclo de vida: Aquisição → Implantação → Em uso → Manutenção → Descarte.
- Vinculação de ativos a usuários, setores e contratos.
- Controle de licenças de software (quantidade adquirida vs. utilizada).
- Cálculo de depreciação para fins de CAPEX e balanço patrimonial.
- Alertas de garantia, licença e manutenção preventiva.
- Integração com GLPI para sincronização de inventário.

### 4.4 Módulo de Gestão de Identidades e Acessos (IAM)

Administração do ciclo de vida de identidades digitais — criação, manutenção, revisão e revogação de acessos — com integração ao Google Workspace como provedor de identidade central.

Funcionalidades centrais:
- Provisionamento automatizado de usuários a partir de eventos de RH (admissão, transferência, desligamento).
- Integração com Google Workspace para criação e desativação de contas.
- Gestão de grupos, perfis e permissões por sistema.
- Fluxo de aprovação para concessão de acessos privilegiados.
- Revisão periódica de acessos (Access Review / Recertificação).
- Registro de auditoria de todas as alterações de acesso.
- Alertas para contas inativas, acessos expirados e anomalias.

### 4.5 Módulo de Compliance e Governança

Centralização dos processos de conformidade de TI, incluindo gestão de políticas, controles, evidências e não-conformidades, com rastreabilidade para auditorias internas e externas.

Funcionalidades centrais:
- Cadastro e publicação de políticas e normas de TI com controle de versão.
- Mapeamento de controles por framework (ISO 27001, LGPD, ITIL v4).
- Registro e acompanhamento de não-conformidades com plano de ação.
- Coleta e armazenamento de evidências de conformidade.
- Agenda de auditorias internas com checklist dinâmico.
- Relatórios de maturidade de conformidade por domínio.
- Dashboard de Compliance com indicadores de risco e progresso.

### 4.6 Módulo de Base de Conhecimento (KMDB)

Repositório estruturado de conhecimento técnico e operacional, acessível a técnicos e usuários finais, com controle de qualidade editorial e vinculação a chamados resolvidos.

Funcionalidades centrais:
- Criação e publicação de artigos com categorização por serviço e público-alvo.
- Controle de versão e aprovação editorial de artigos.
- Busca full-text com relevância por uso e avaliação.
- Vínculo entre artigo e chamado resolvido (Conhecimento originado de incidente).
- Relatórios de utilização e lacunas de conhecimento.
- Avaliação de utilidade por leitores.

### 4.7 Módulo de Gestão Financeira de TI

Visibilidade e controle sobre os custos de TI, integrando dados de contratos, ativos, licenças e consumo de serviços para subsidiar planejamento de CAPEX e OPEX.

Funcionalidades centrais:
- Registro e controle de contratos com fornecedores e suas renovações.
- Rateio de custos de TI por setor/centro de custo.
- Planejamento e acompanhamento do orçamento de TI (CAPEX e OPEX).
- Controle de despesas recorrentes e não-recorrentes.
- Alertas de vencimento contratual e estouro de orçamento.
- Relatórios de custo por serviço, por ativo e por período.

### 4.8 Módulo de Dashboards

Camada de visualização estratégica e operacional do SGTI, com painéis dedicados para diferentes perfis de audiência, atualizados em tempo real ou near-real-time.

Sub-módulos:

**Dashboard Executivo**
Visão de alto nível para a alta direção, com KPIs estratégicos de TI: nível de SLA global, satisfação de usuários, custo total de TI, maturidade de compliance e disponibilidade de serviços críticos.

**Dashboard Operacional**
Painel de acompanhamento diário para coordenadores e técnicos de TI: fila de chamados em aberto, SLAs em risco, ativos em manutenção, acessos pendentes de aprovação e alertas operacionais.

**Dashboard de Compliance**
Visibilidade sobre o estado de conformidade da TI: políticas publicadas vs. vigentes, controles implementados vs. pendentes, não-conformidades abertas, próximas auditorias e nível de maturidade por domínio.

**Dashboard Financeiro**
Controle orçamentário em tempo real: realizado vs. orçado (CAPEX e OPEX), contratos a vencer, custo por serviço, evolução mensal de despesas e alertas de desvio financeiro.

---

## 5. Benefícios Esperados

### 5.1 Benefícios Operacionais

- Redução do tempo médio de resolução de chamados (MTTR) pela estruturação do fluxo de atendimento e acesso à Base de Conhecimento.
- Eliminação de processos manuais no provisionamento e revogação de acessos, reduzindo o risco de acesso indevido por atraso operacional.
- Aumento da visibilidade sobre o estado real do parque de ativos, evitando compras desnecessárias e perda de equipamentos.
- Padronização dos processos de TI com base no ITIL v4, promovendo consistência e previsibilidade no atendimento.

### 5.2 Benefícios Estratégicos

- Habilitação de decisões de investimento (CAPEX) baseadas em dados concretos de ciclo de vida de ativos e tendências de consumo.
- Visibilidade executiva sobre desempenho, custo e conformidade da TI sem necessidade de relatórios manuais.
- Redução de riscos regulatórios e de segurança por meio da gestão contínua de compliance.
- Sustentação de auditorias internas e externas com evidências rastreáveis e centralizadas.

### 5.3 Benefícios Financeiros

- Controle efetivo do OPEX de TI com rateio por área e identificação de desperdícios.
- Prevenção de renovações automáticas de contratos e licenças desnecessárias.
- Redução de horas improdutivas por interrupções de serviço com SLAs mal gerenciados.
- Subsídio para negociações com fornecedores baseadas em dados históricos de consumo e performance.

### 5.4 Benefícios para o Usuário Final

- Portal de autoatendimento para abertura de chamados, consulta ao status e acesso à Base de Conhecimento.
- Comunicação proativa sobre andamento de solicitações e incidentes que afetam o usuário.
- Redução do tempo de espera por acesso a sistemas em processos de onboarding.

---

## 6. Público-Alvo

### 6.1 Usuários do Sistema

| Perfil | Descrição | Módulos Principais |
|--------|-----------|--------------------|
| **Usuário Final** | Colaborador que consome serviços de TI | Service Desk (portal), Base de Conhecimento |
| **Técnico de TI** | Analista responsável pelo atendimento de chamados | Service Desk, Ativos, Base de Conhecimento |
| **Especialista de TI** | Profissional responsável por domínios específicos (Infra, Segurança, Sistemas) | Todos os módulos operacionais |
| **Gestor de TI** | Coordenador ou gerente responsável pela operação de TI | Operacional, Financeiro, SLA, Compliance |
| **Auditor Interno** | Responsável por avaliações de conformidade | Compliance, Identidades, Ativos |
| **Diretor / C-Level** | Alta direção com interesse em KPIs estratégicos | Dashboard Executivo, Financeiro |
| **Administrador do Sistema** | Responsável pela configuração e manutenção do SGTI | Todos os módulos + Administração |

### 6.2 Partes Interessadas (Stakeholders)

- **TI Corporativa:** principal beneficiária e operadora do sistema.
- **RH:** parceiro na integração de processos de admissão e desligamento para gestão de identidades.
- **Financeiro / Controladoria:** consumidor dos relatórios de CAPEX/OPEX e contratos.
- **Jurídico / Compliance:** beneficiário dos módulos de conformidade e auditoria.
- **Alta Direção:** receptora dos dashboards executivos e relatórios estratégicos.
- **Fornecedores de TI:** referenciados no módulo de contratos e gestão financeira.

---

## 7. Restrições Técnicas

### 7.1 Restrições de Arquitetura

- O sistema deve ser desenvolvido seguindo os princípios de **Clean Architecture** e **Domain-Driven Design (DDD)**, com separação clara entre camadas de domínio, aplicação, infraestrutura e interface.
- O backend será construído com **NestJS**, o frontend com **NextJS** e o banco de dados principal com **PostgreSQL** gerenciado via **Supabase**, com acesso via **Prisma ORM**.
- Toda a lógica de negócio deve residir na camada de domínio, sendo independente de frameworks e infraestrutura.
- APIs externas (GLPI, Google Workspace) devem ser abstraídas por interfaces de porta/adaptador (padrão Ports & Adapters / Hexagonal Architecture).

### 7.2 Restrições de Segurança

- Toda autenticação de usuários deve ser federada pelo **Google Workspace (OAuth 2.0 / SAML)** — nenhuma senha local deve ser armazenada no SGTI.
- O sistema deve implementar controle de acesso baseado em papéis (**RBAC**) com segregação de privilégios.
- Dados sensíveis (PII, credenciais de integração, logs de auditoria) devem ser armazenados com criptografia em repouso.
- Toda comunicação entre serviços e com APIs externas deve ocorrer exclusivamente via HTTPS/TLS 1.2+.
- Logs de auditoria devem ser imutáveis — sem operação de DELETE permitida para registros de auditoria.

### 7.3 Restrições Operacionais

- O sistema deve ser capaz de operar com disponibilidade mínima de **99,5%** no horário comercial (07h–20h, segunda a sexta).
- O tempo de resposta das APIs principais não deve exceder **2 segundos** em condições normais de carga.
- O sistema deve suportar ao menos **500 usuários simultâneos** sem degradação de performance.
- Toda alteração em produção deve ser precedida por registro no sistema de mudanças (Change Management).

### 7.4 Restrições de Integração

- A integração com o GLPI deve ser **bidirecional**, preservando o GLPI como sistema de registro oficial de chamados.
- A integração com o Google Workspace deve respeitar as **políticas de privacidade e escopo de API** definidas pelo administrador do domínio.
- Nenhuma integração deve expor credenciais ou tokens em logs, variáveis de ambiente não protegidas ou interfaces de usuário.

### 7.5 Restrições Regulatórias

- O sistema deve estar em conformidade com a **LGPD (Lei Geral de Proteção de Dados — Lei nº 13.709/2018)**, especialmente no tratamento de dados pessoais de colaboradores.
- Dados de auditoria e compliance devem ser retidos por no mínimo **5 anos**, conforme política interna de retenção de dados.
- O sistema deve suportar a exportação de evidências de conformidade em formatos auditáveis (PDF, CSV, JSON).

---

## 8. Integrações Obrigatórias

### 8.1 Google Workspace

**Propósito:** Provedor de identidade central e fonte autoritativa de dados de colaboradores.

| Funcionalidade | Direção | Módulos Envolvidos |
|---------------|---------|-------------------|
| Autenticação SSO (OAuth 2.0) | Google → SGTI | Todos |
| Sincronização de usuários e grupos | Google → SGTI | IAM |
| Provisionamento de contas | SGTI → Google | IAM |
| Desativação de contas (offboarding) | SGTI → Google | IAM |
| Consulta de unidade organizacional | Google → SGTI | IAM, Ativos |
| Envio de notificações via Gmail | SGTI → Google | Service Desk, Compliance |

**APIs utilizadas:** Google Admin SDK, Google Directory API, Google OAuth 2.0, Gmail API.

**Premissas:** A organização deve possuir uma conta de serviço (Service Account) com delegação de domínio para as operações de provisionamento automatizado.

### 8.2 GLPI

**Propósito:** Sistema de registro oficial de chamados e inventário de ativos legado. O SGTI atua como camada de governança e orquestração, mantendo o GLPI como fonte de verdade para tickets e inventário sincronizado.

| Funcionalidade | Direção | Módulos Envolvidos |
|---------------|---------|-------------------|
| Criação de chamados | SGTI → GLPI | Service Desk |
| Consulta de status de chamados | GLPI → SGTI | Service Desk |
| Atualização de chamados (notas, status) | SGTI ↔ GLPI | Service Desk |
| Sincronização de inventário de ativos | GLPI → SGTI | Gestão de Ativos |
| Consulta de histórico de ativos | GLPI → SGTI | Gestão de Ativos |
| Importação de categorias e tipos | GLPI → SGTI | Configuração |

**APIs utilizadas:** GLPI REST API (session token, recursos de Ticket, Asset, User).

**Premissas:** O GLPI deve estar na versão 10.x ou superior com a API REST habilitada e configurada para autenticação via token. Um usuário de integração dedicado deve ser provisionado no GLPI com permissões específicas para leitura e escrita.

### 8.3 Visão Geral das Integrações

```
┌─────────────────────────────────────────────────────────┐
│                        SGTI                             │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │  Service │  │   IAM    │  │  Ativos  │  │Finance │ │
│  │   Desk   │  │          │  │  (ITAM)  │  │        │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┘ │
│       │              │              │                    │
└───────┼──────────────┼──────────────┼────────────────────┘
        │              │              │
        ▼              ▼              │
   ┌─────────┐   ┌──────────────┐    │
   │  GLPI   │   │    Google    │    │
   │ REST API│   │  Workspace   │◄───┘
   └─────────┘   └──────────────┘
```

---

## 9. Indicadores Estratégicos

Os indicadores estratégicos do SGTI são organizados em quatro perspectivas alinhadas aos dashboards do sistema: Executiva, Operacional, Financeira e de Compliance.

### 9.1 Perspectiva Executiva

| Indicador | Descrição | Meta | Frequência |
|-----------|-----------|------|------------|
| **SLA Global de TI** | Percentual de chamados atendidos dentro do SLA acordado | ≥ 95% | Mensal |
| **Disponibilidade de Serviços Críticos** | Uptime dos serviços classificados como críticos no catálogo | ≥ 99,5% | Mensal |
| **CSAT (Satisfação do Usuário)** | Nota média de satisfação pós-atendimento | ≥ 4,0 / 5,0 | Mensal |
| **Maturidade de Compliance de TI** | Percentual de controles implementados sobre o total mapeado | ≥ 80% | Trimestral |
| **Custo Total de TI (TCO)** | Custo total de propriedade da TI (CAPEX + OPEX) por período | Conforme orçamento | Mensal |

### 9.2 Perspectiva Operacional

| Indicador | Descrição | Meta | Frequência |
|-----------|-----------|------|------------|
| **MTTR** | Tempo médio de resolução de chamados por categoria | Conforme SLA | Semanal |
| **MTTA** | Tempo médio de primeiro atendimento | Conforme SLA | Semanal |
| **Volume de Chamados por Canal** | Distribuição de chamados por origem (portal, e-mail, telefone) | — | Semanal |
| **Taxa de Reabertura de Chamados** | Percentual de tickets reabertos após resolução | ≤ 5% | Mensal |
| **Chamados Resolvidos via Base de Conhecimento** | Percentual de resoluções com vínculo a artigo de conhecimento | ≥ 30% | Mensal |
| **Ativos com Garantia Vencida** | Quantidade de ativos sem cobertura de garantia ativa | 0 críticos | Mensal |
| **Acessos Pendentes de Revisão** | Quantidade de acessos com revisão periódica em atraso | 0 | Semanal |
| **Onboarding / Offboarding no Prazo** | Percentual de provisionamentos e revogações realizados no prazo | ≥ 98% | Mensal |

### 9.3 Perspectiva Financeira

| Indicador | Descrição | Meta | Frequência |
|-----------|-----------|------|------------|
| **OPEX Realizado vs. Orçado** | Desvio percentual entre despesas recorrentes realizadas e orçadas | ≤ 5% desvio | Mensal |
| **CAPEX Realizado vs. Orçado** | Desvio percentual entre investimentos realizados e orçados | ≤ 10% desvio | Mensal |
| **Custo por Chamado** | Custo médio operacional de TI por chamado atendido | Benchmarking | Trimestral |
| **Contratos a Vencer em 90 dias** | Quantidade e valor de contratos próximos ao vencimento | 0 sem tratativa | Mensal |
| **Licenças Subutilizadas** | Percentual de licenças de software com uso abaixo de 20% | ≤ 10% | Trimestral |
| **ROI de Iniciativas de TI** | Retorno sobre investimentos em projetos e melhorias de TI | Positivo | Semestral |

### 9.4 Perspectiva de Compliance

| Indicador | Descrição | Meta | Frequência |
|-----------|-----------|------|------------|
| **Políticas Publicadas e Vigentes** | Percentual de políticas de TI publicadas, revisadas e vigentes | 100% | Semestral |
| **Não-Conformidades em Aberto** | Quantidade de não-conformidades identificadas sem plano de ação | 0 | Mensal |
| **Tempo Médio de Tratamento de NC** | Tempo médio para fechamento de uma não-conformidade | ≤ 30 dias | Mensal |
| **Cobertura de Controles por Framework** | Percentual de controles mapeados com evidência de implementação | ≥ 85% | Trimestral |
| **Usuários com Acesso Revisado** | Percentual de usuários com revisão de acesso concluída no ciclo | 100% | Semestral |
| **Incidentes de Segurança Registrados** | Quantidade de incidentes de segurança registrados e tratados | Tendência 0 | Mensal |
| **Conformidade LGPD** | Percentual de processos com tratamento de dados pessoais mapeados e documentados | 100% | Semestral |

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição da Alteração |
|--------|------|-------|------------------------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa | Criação do documento |

---

> **Próximos Documentos Previstos:**  
> `01_ARCHITECTURE_OVERVIEW.md` — Visão geral da arquitetura técnica do SGTI  
> `02_DOMAIN_MODEL.md` — Modelo de domínio (DDD) e bounded contexts  
> `03_SERVICE_CATALOG.md` — Catálogo de serviços de TI e SLAs  
> `04_INTEGRATIONS.md` — Especificação detalhada das integrações (Google Workspace e GLPI)
