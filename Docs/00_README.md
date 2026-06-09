# SGTI — Sistema de Gestão de Tecnologia da Informação
## Guia da Documentação

> **Classificação:** Interno — Restrito  
> **Versão:** 1.0.0  
> **Status:** Em Elaboração  
> **Última Atualização:** 2026-06-09  
> **Responsável:** Arquitetura Corporativa de TI

---

## Sumário

1. [Objetivo do Projeto](#1-objetivo-do-projeto)
2. [Estrutura da Documentação](#2-estrutura-da-documentação)
3. [Ordem Recomendada de Leitura](#3-ordem-recomendada-de-leitura)
4. [Convenções](#4-convenções)
5. [Como Utilizar o Claude Code neste Projeto](#5-como-utilizar-o-claude-code-neste-projeto)

---

## 1. Objetivo do Projeto

O **SGTI (Sistema de Gestão de Tecnologia da Informação)** é uma plataforma corporativa unificada que centraliza, automatiza e governa os processos de TI da organização. Construído sobre os princípios do **ITIL v4**, **Clean Architecture** e **Domain-Driven Design (DDD)**, o sistema integra Service Desk, Gestão de Ativos, Gestão de Identidades, Compliance, Base de Conhecimento e Controle Financeiro em uma única solução.

O SGTI se integra obrigatoriamente ao **Google Workspace** — como provedor de identidade — e ao **GLPI** — como sistema de registro de chamados e inventário —, preservando os investimentos tecnológicos existentes e adicionando uma camada de governança, visibilidade e automação sobre eles.

Esta documentação é o artefato central do projeto. Ela antecede qualquer implementação e serve como contrato entre as equipes de negócio, arquitetura e desenvolvimento. Toda decisão de design, regra de negócio, estrutura de domínio e comportamento esperado do sistema deve estar registrada aqui antes de ser codificada.

> **Princípio fundamental:** se não está documentado, não existe.

---

## 2. Estrutura da Documentação

A documentação do SGTI é organizada em camadas que partem do contexto estratégico e avançam progressivamente para os detalhes técnicos e operacionais. Cada arquivo é autossuficiente e referencia os demais quando necessário.

```
Docs/
│
├── 00_README.md                    ← Este arquivo. Guia de navegação da documentação.
├── 00_PROJECT_CONTEXT.md           ← Contexto estratégico, escopo, módulos e indicadores.
│
├── Arquitetura/
│   ├── 01_ARCHITECTURE_OVERVIEW.md     ← Visão geral da arquitetura técnica do sistema.
│   ├── 02_DOMAIN_MODEL.md              ← Modelo de domínio, bounded contexts e linguagem ubíqua.
│   ├── 03_CLEAN_ARCHITECTURE.md        ← Estrutura de camadas, regras de dependência e decisões.
│   └── 04_TECHNOLOGY_STACK.md          ← Stack tecnológica justificada (NestJS, NextJS, Supabase...).
│
├── Módulos/
│   ├── 05_SERVICE_DESK.md              ← Regras, fluxos, estados e SLAs do Service Desk.
│   ├── 06_SERVICE_CATALOG.md           ← Catálogo de serviços, categorias e acordos de nível.
│   ├── 07_ASSET_MANAGEMENT.md          ← Ciclo de vida de ativos, ITAM e controle de licenças.
│   ├── 08_IDENTITY_MANAGEMENT.md       ← IAM, provisionamento, revisão de acessos e RBAC.
│   ├── 09_COMPLIANCE.md                ← Políticas, controles, auditorias e gestão de NC.
│   ├── 10_KNOWLEDGE_BASE.md            ← Base de conhecimento, fluxo editorial e categorização.
│   └── 11_FINANCIAL_MANAGEMENT.md      ← CAPEX, OPEX, contratos, orçamento e rateio.
│
├── Integrações/
│   ├── 12_INTEGRATION_GOOGLE.md        ← Integração com Google Workspace (SSO, IAM, Gmail).
│   └── 13_INTEGRATION_GLPI.md          ← Integração com GLPI (chamados, inventário, sync).
│
├── Dashboards/
│   ├── 14_DASHBOARD_EXECUTIVE.md       ← KPIs estratégicos para alta direção.
│   ├── 15_DASHBOARD_OPERATIONAL.md     ← Painel operacional para gestores e técnicos de TI.
│   ├── 16_DASHBOARD_COMPLIANCE.md      ← Visibilidade de conformidade, riscos e auditorias.
│   └── 17_DASHBOARD_FINANCIAL.md       ← Controle orçamentário, CAPEX/OPEX e contratos.
│
├── Governança/
│   ├── 18_SLA_POLICY.md                ← Política de SLA, níveis, penalidades e exceções.
│   ├── 19_SECURITY_POLICY.md           ← Política de segurança, acesso e proteção de dados.
│   └── 20_DATA_RETENTION_POLICY.md     ← Retenção, descarte e compliance com LGPD.
│
└── Operação/
    ├── 21_DEPLOYMENT_GUIDE.md          ← Guia de implantação e configuração de ambiente.
    ├── 22_RUNBOOK.md                   ← Procedimentos operacionais e respostas a incidentes.
    └── 23_CHANGELOG.md                 ← Histórico de versões e alterações da documentação.
```

### 2.1 Legenda de Status dos Documentos

Cada documento exibe um status no cabeçalho:

| Status | Significado |
|--------|-------------|
| `Rascunho` | Em elaboração. Conteúdo sujeito a alterações significativas. |
| `Em Revisão` | Aguardando aprovação de stakeholders ou revisão técnica. |
| `Aprovado para Desenvolvimento` | Conteúdo validado. Base para implementação. |
| `Vigente` | Publicado e operacional. Alterações exigem Change Request. |
| `Depreciado` | Substituído por versão mais recente. Mantido para histórico. |

---

## 3. Ordem Recomendada de Leitura

A leitura deve seguir a progressão do contexto estratégico para o detalhe técnico. Desvios da ordem abaixo são possíveis, mas podem gerar lacunas de compreensão.

### 3.1 Para todos os perfis (leitura obrigatória)

| # | Arquivo | Por quê |
|---|---------|---------|
| 1 | `00_README.md` | Navegação e convenções da documentação. |
| 2 | `00_PROJECT_CONTEXT.md` | Contexto estratégico, escopo, módulos e KPIs. |

### 3.2 Para Gestores, Diretores e Stakeholders

| # | Arquivo | Por quê |
|---|---------|---------|
| 3 | `06_SERVICE_CATALOG.md` | Entendimento dos serviços de TI e acordos de nível. |
| 4 | `18_SLA_POLICY.md` | Compromissos de qualidade de serviço. |
| 5 | `14_DASHBOARD_EXECUTIVE.md` | KPIs e visibilidade estratégica. |
| 6 | `17_DASHBOARD_FINANCIAL.md` | Controle de CAPEX/OPEX e orçamento. |
| 7 | `09_COMPLIANCE.md` | Visão geral de conformidade e governança. |

### 3.3 Para Analistas e Técnicos de TI

| # | Arquivo | Por quê |
|---|---------|---------|
| 3 | `05_SERVICE_DESK.md` | Fluxos de atendimento, SLAs e escalonamento. |
| 4 | `07_ASSET_MANAGEMENT.md` | Ciclo de vida de ativos e ITAM. |
| 5 | `08_IDENTITY_MANAGEMENT.md` | Provisionamento e revisão de acessos. |
| 6 | `10_KNOWLEDGE_BASE.md` | Criação e uso da base de conhecimento. |
| 7 | `15_DASHBOARD_OPERATIONAL.md` | Painel de acompanhamento operacional. |
| 8 | `13_INTEGRATION_GLPI.md` | Comportamento da integração com GLPI. |

### 3.4 Para Arquitetos e Desenvolvedores

| # | Arquivo | Por quê |
|---|---------|---------|
| 3 | `01_ARCHITECTURE_OVERVIEW.md` | Visão macro da arquitetura. |
| 4 | `02_DOMAIN_MODEL.md` | Modelo de domínio, bounded contexts e linguagem ubíqua. |
| 5 | `03_CLEAN_ARCHITECTURE.md` | Estrutura de camadas e regras de dependência. |
| 6 | `04_TECHNOLOGY_STACK.md` | Stack técnica e decisões de design. |
| 7 | `12_INTEGRATION_GOOGLE.md` | Especificação da integração com Google Workspace. |
| 8 | `13_INTEGRATION_GLPI.md` | Especificação da integração com GLPI. |
| 9 | `19_SECURITY_POLICY.md` | Requisitos de segurança para implementação. |
| 10 | `21_DEPLOYMENT_GUIDE.md` | Configuração e implantação de ambientes. |

### 3.5 Para Auditores e Profissionais de Compliance

| # | Arquivo | Por quê |
|---|---------|---------|
| 3 | `09_COMPLIANCE.md` | Framework de compliance, controles e auditorias. |
| 4 | `08_IDENTITY_MANAGEMENT.md` | Segregação de funções e controle de acessos. |
| 5 | `19_SECURITY_POLICY.md` | Políticas de segurança da informação. |
| 6 | `20_DATA_RETENTION_POLICY.md` | Retenção de dados e conformidade com LGPD. |
| 7 | `16_DASHBOARD_COMPLIANCE.md` | Visibilidade de conformidade e não-conformidades. |

---

## 4. Convenções

### 4.1 Nomenclatura de Arquivos

Todos os arquivos de documentação seguem o padrão:

```
NN_NOME_EM_MAIUSCULO.md
```

Onde:
- `NN` é o número de ordem com dois dígitos (ex: `01`, `12`, `23`).
- `NOME_EM_MAIUSCULO` é o nome descritivo em inglês, separado por underscores.
- Prefixo `00_` é reservado para documentos de navegação e contexto geral.

Exemplos válidos:
```
05_SERVICE_DESK.md
12_INTEGRATION_GOOGLE.md
21_DEPLOYMENT_GUIDE.md
```

### 4.2 Estrutura Interna dos Documentos

Todo documento de documentação deve seguir esta estrutura de cabeçalho:

```markdown
# SGTI — [Nome do Módulo ou Tema]
## [Subtítulo descritivo]

> **Classificação:** Interno — Restrito
> **Versão:** X.Y.Z
> **Status:** [Rascunho | Em Revisão | Aprovado para Desenvolvimento | Vigente | Depreciado]
> **Última Atualização:** AAAA-MM-DD
> **Responsável:** [Nome ou Papel]
> **Documento Relacionado:** [Link para documento pai ou anterior]
```

E deve encerrar com:

```markdown
## Controle de Versões do Documento

| Versão | Data | Autor | Descrição da Alteração |
|--------|------|-------|------------------------|
| 1.0.0  | AAAA-MM-DD | [Papel] | Criação do documento |
```

### 4.3 Versionamento Semântico da Documentação

Os documentos seguem versionamento semântico adaptado:

| Componente | Quando incrementar |
|------------|-------------------|
| **MAJOR** (X) | Mudança de escopo, reestruturação completa ou decisão arquitetural de alto impacto. |
| **MINOR** (Y) | Adição de seções, novos fluxos ou regras de negócio sem alterar o existente. |
| **PATCH** (Z) | Correções, ajustes de texto, erros factuais ou atualizações menores. |

### 4.4 Diagramas e Representações Visuais

Todos os diagramas devem ser representados em **texto estruturado (ASCII/Unicode)** ou em sintaxe **Mermaid** (quando suportado pelo visualizador). Não são permitidos diagramas em formatos binários (PNG, JPG) embutidos nos arquivos Markdown — use links para recursos externos quando necessário.

Exemplo de diagrama em texto:
```
[Usuário] → [Portal SGTI] → [Service Desk] → [GLPI]
                                          ↓
                                  [Base de Conhecimento]
```

### 4.5 Referências Cruzadas

Ao referenciar outro documento da documentação, use sempre o caminho relativo:

```markdown
Para detalhes sobre o modelo de domínio, consulte [02_DOMAIN_MODEL.md](./Arquitetura/02_DOMAIN_MODEL.md).
```

### 4.6 Linguagem e Tom

- **Idioma:** Português brasileiro em toda a documentação.
- **Tom:** Técnico e objetivo. Sem ambiguidades.
- **Termos em inglês:** Aceitos quando são termos técnicos consagrados (ex: *Service Desk*, *onboarding*, *RBAC*, *uptime*). Devem ser escritos em itálico na primeira ocorrência em cada documento.
- **Siglas:** Devem ser definidas na primeira ocorrência em cada documento. Ex: "ITIL (*Information Technology Infrastructure Library*)".
- **Requisitos:** Usar linguagem normativa clara. Preferir "deve" para obrigações, "pode" para permissões e "não deve" para proibições.

### 4.7 Tabelas de Regras de Negócio

Regras de negócio devem ser identificadas com código único no formato:

```
RN-[MÓDULO]-[NÚMERO]
```

Exemplos:
```
RN-SD-001   → Regra de negócio 001 do módulo Service Desk
RN-IAM-004  → Regra de negócio 004 do módulo de Identidades
RN-FIN-012  → Regra de negócio 012 do módulo Financeiro
```

Toda regra deve ser documentada com: identificador, descrição, justificativa e referência ITIL ou regulatória quando aplicável.

---

## 5. Como Utilizar o Claude Code neste Projeto

O **Claude Code** é a ferramenta de desenvolvimento assistido por IA adotada pelo projeto SGTI. Seu uso é estruturado para garantir consistência, rastreabilidade e alinhamento com a documentação.

### 5.1 Princípio de Uso

> **A documentação precede o código.**  
> Nenhum artefato de código — seja backend, frontend, banco de dados ou script — deve ser criado sem que o documento correspondente esteja com status `Aprovado para Desenvolvimento`.

O Claude Code deve ser utilizado para **implementar o que está documentado**, não para definir o que será implementado. Decisões de arquitetura, regras de negócio e estrutura de módulos são definidas nesta documentação e então passadas ao Claude Code como contexto.

### 5.2 Arquivo de Contexto do Agente

Na raiz do projeto existe (ou deve existir) um arquivo chamado `CLAUDE.md`. Este arquivo é lido automaticamente pelo Claude Code ao iniciar uma sessão e contém:

- Resumo do projeto e tecnologias utilizadas.
- Referência aos documentos de arquitetura e domínio relevantes.
- Convenções de código do projeto.
- Comandos frequentes de desenvolvimento.
- Restrições e decisões técnicas que o agente deve respeitar.

> O arquivo `CLAUDE.md` é o ponto de entrada do Claude Code. Mantê-lo atualizado é responsabilidade do time de arquitetura.

### 5.3 Fluxo de Trabalho com Claude Code

O fluxo recomendado para cada funcionalidade ou módulo é:

```
1. DOCUMENTAR
   └── Elaborar ou atualizar o documento do módulo correspondente (status: Aprovado)

2. CONTEXTUALIZAR
   └── Garantir que CLAUDE.md referencia os documentos relevantes para a tarefa

3. SOLICITAR
   └── Abrir sessão do Claude Code e descrever a tarefa com referência explícita
       ao documento: "Implemente o módulo X conforme Docs/Módulos/05_SERVICE_DESK.md"

4. REVISAR
   └── Validar o artefato gerado contra o documento de origem

5. REGISTRAR
   └── Atualizar CHANGELOG.md e o documento correspondente se necessário
```

### 5.4 Estrutura de Comandos Recomendados

Ao iniciar uma sessão do Claude Code para o SGTI, use comandos estruturados que referenciem explicitamente os documentos:

**Padrão recomendado:**
```
Implemente [ARTEFATO] do módulo [MÓDULO] conforme especificado em 
[CAMINHO DO DOCUMENTO]. Respeite a Clean Architecture com as camadas 
definidas em Docs/Arquitetura/03_CLEAN_ARCHITECTURE.md.
```

**Exemplos práticos:**

```
# Criação de um caso de uso
Crie o caso de uso "AbrirChamado" do módulo Service Desk conforme
Docs/Módulos/05_SERVICE_DESK.md, seção 4.2. Use NestJS com a estrutura
de camadas definida em Docs/Arquitetura/03_CLEAN_ARCHITECTURE.md.

# Criação de uma entidade de domínio
Crie a entidade "Ativo" do bounded context AssetManagement conforme
o modelo em Docs/Arquitetura/02_DOMAIN_MODEL.md, seção 3.3.

# Criação de schema de banco de dados
Crie o schema Prisma para o módulo de Identidades conforme
Docs/Módulos/08_IDENTITY_MANAGEMENT.md. Use Supabase/PostgreSQL.
```

### 5.5 Restrições de Uso do Claude Code

As seguintes operações **não devem** ser solicitadas ao Claude Code sem aprovação prévia do Arquiteto Responsável:

| Operação Restrita | Motivo |
|-------------------|--------|
| Alterar a estrutura de camadas da Clean Architecture | Impacto arquitetural global |
| Criar ou modificar migrations de banco de dados em produção | Risco de perda de dados |
| Alterar configurações de integração com Google Workspace ou GLPI | Impacto em sistemas externos |
| Modificar lógica de autenticação e autorização (RBAC) | Risco de segurança |
| Remover ou renomear módulos já implantados | Impacto em contratos de API |

### 5.6 Gestão de Contexto em Sessões Longas

O Claude Code não mantém memória entre sessões. Para sessões longas ou retomada de trabalho:

1. **Sempre inicie com o contexto:** Instrua o Claude Code a ler o `CLAUDE.md` e o documento do módulo em questão antes de qualquer implementação.
2. **Use checkpoints:** Ao final de cada sessão, documente o estado atual no `CLAUDE.md` ou em comentários no código (ex: `// TODO: continuar em 05_SERVICE_DESK.md seção 6.3`).
3. **Documente decisões tomadas durante a sessão:** Qualquer decisão técnica tomada em conjunto com o Claude Code que desvie ou complemente a documentação deve ser registrada no documento correspondente antes do fim da sessão.

### 5.7 Responsabilidades

| Papel | Responsabilidade com o Claude Code |
|-------|------------------------------------|
| **Arquiteto** | Manter `CLAUDE.md` e documentação de arquitetura atualizados. Revisar artefatos de alto impacto. |
| **Tech Lead** | Garantir que as solicitações ao Claude Code referenciam documentação aprovada. |
| **Desenvolvedor** | Seguir o fluxo de trabalho definido. Reportar divergências entre código gerado e documentação. |
| **Gestor de TI** | Aprovar documentos antes de autorizar implementação. Validar entregáveis contra requisitos de negócio. |

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição da Alteração |
|--------|------|-------|------------------------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa | Criação do documento |

---

> **Documento seguinte recomendado:**  
> [`00_PROJECT_CONTEXT.md`](./00_PROJECT_CONTEXT.md) — Contexto estratégico, escopo completo, módulos e indicadores do SGTI.
