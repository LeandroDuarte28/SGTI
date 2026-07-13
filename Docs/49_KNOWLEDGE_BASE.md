# SGTI — Sistema de Gestão de Tecnologia da Informação
## Módulo de Base de Conhecimento — Documentação Funcional

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [24_BUSINESS_RULES.md](./24_BUSINESS_RULES.md) · [40_INCIDENT_MANAGEMENT.md](./40_INCIDENT_MANAGEMENT.md) · [42_PROBLEM_MANAGEMENT.md](./42_PROBLEM_MANAGEMENT.md) · [45_COMPLIANCE.md](./45_COMPLIANCE.md) · [20_DATABASE.md](./20_DATABASE.md)

---

## Sobre este Documento

Este documento define a **especificação funcional completa do Módulo de Base de Conhecimento do SGTI**. Cobre conceito ITIL v4, estrutura de artigos, workflow editorial, versionamento, busca inteligente, sugestão automática, integrações, dashboards, regras de negócio e critérios de aceitação.

**Escopo exclusivo:** documentação funcional e de processo. Nenhum código, SQL ou especificação de API é gerado neste documento.

---

## Sumário

1. [Conceito de Base de Conhecimento](#1-conceito-de-base-de-conhecimento)
2. [Objetivos do Módulo](#2-objetivos-do-módulo)
3. [Papéis e Responsabilidades](#3-papéis-e-responsabilidades)
4. [Estrutura do Artigo](#4-estrutura-do-artigo)
5. [Tipos de Conteúdo](#5-tipos-de-conteúdo)
6. [Categorias](#6-categorias)
7. [Workflow Editorial](#7-workflow-editorial)
8. [Versionamento](#8-versionamento)
9. [Aprovações e Revisão](#9-aprovações-e-revisão)
10. [Busca Inteligente](#10-busca-inteligente)
11. [Sugestão Automática durante o Atendimento](#11-sugestão-automática-durante-o-atendimento)
12. [Integração com Incidentes](#12-integração-com-incidentes)
13. [Integração com Problemas](#13-integração-com-problemas)
14. [Integração com Compliance](#14-integração-com-compliance)
15. [Integração com Projetos](#15-integração-com-projetos)
16. [Preparação para IA Futura](#16-preparação-para-ia-futura)
17. [Dashboards e Indicadores](#17-dashboards-e-indicadores)
18. [Relatórios](#18-relatórios)
19. [Auditoria e Rastreabilidade](#19-auditoria-e-rastreabilidade)
20. [Regras de Negócio](#20-regras-de-negócio)
21. [Critérios de Aceitação](#21-critérios-de-aceitação)

---

## 1. Conceito de Base de Conhecimento

### 1.1 Definição ITIL v4

> **Gestão do Conhecimento** é a prática de manter e melhorar o uso eficaz das informações e do conhecimento em toda a organização. O objetivo é garantir que as pessoas certas tenham o conhecimento certo, no momento certo.
>
> — ITIL v4, AXELOS

No contexto do SGTI, a **Base de Conhecimento (KB — Knowledge Base)** é o repositório centralizado de todo o conhecimento técnico e operacional da equipe de TI, estruturado para:

- Reduzir o tempo de resolução de incidentes ao disponibilizar soluções conhecidas.
- Empoderar usuários finais para resolver problemas simples sem abrir chamados (deflexão).
- Capturar e preservar o conhecimento tácito da equipe, tornando-o explícito e reutilizável.
- Alimentar o KEDB (Known Error DataBase) com workarounds publicados.
- Servir como base de dados estruturada para futuras capacidades de IA.

### 1.2 Conhecimento Tácito vs. Explícito

| Tipo | Definição | Problema | Como a KB Resolve |
|:----:|-----------|---------|:------------------:|
| **Tácito** | Conhecimento na cabeça das pessoas; difícil de articular | "Só o João sabe resolver isso" | Forçar documentação ao resolver incidentes e fechar projetos |
| **Explícito** | Conhecimento documentado, transmissível e replicável | Documentação desatualizada ou dispersa | Fluxo editorial com revisão, versionamento e validade |

### 1.3 Pilares da KB no SGTI

| Pilar | Descrição |
|:-----:|-----------|
| **Completude** | Toda solução nova documentada; nenhum conhecimento perdido |
| **Qualidade** | Todo artigo revisado antes de publicar; avaliado pelos leitores |
| **Descoberta** | Busca eficiente por texto e tags; sugestão automática no momento certo |
| **Atualidade** | Revisão periódica; depreciação de conteúdo obsoleto |
| **Rastreabilidade** | Origem de cada artigo rastreada (incidente, problema, projeto) |

### 1.4 KEDB — Known Error DataBase

O **KEDB** é um subconjunto especializado da KB que contém exclusivamente artigos sobre **Erros Conhecidos** — problemas com causa raiz identificada e workaround publicado, mas ainda sem solução definitiva.

O KEDB é exibido em destaque durante o atendimento de incidentes do serviço afetado, permitindo ao técnico aplicar o workaround imediatamente.

---

## 2. Objetivos do Módulo

### 2.1 Objetivo Primário

Reduzir continuamente o tempo de resolução de incidentes e o volume de chamados repetitivos, tornando o conhecimento técnico da equipe de TI acessível, estruturado e reutilizável por todos os colaboradores.

### 2.2 Objetivos Específicos

| # | Objetivo | Indicador | Meta |
|---|----------|-----------|:----:|
| 1 | Deflexão de chamados | % de chamados não abertos após consulta à KB | ≥ 15% |
| 2 | Resolução pelo técnico usando KB | % incidentes resolvidos com artigo KB vinculado | ≥ 60% |
| 3 | Documentação de soluções novas | % incidentes resolvidos com nota de solução que geram artigo KB | ≥ 80% |
| 4 | Qualidade da KB | Avaliação média de utilidade dos artigos (helpful_rate) | ≥ 75% |
| 5 | Artigos sem revisão identificados | % artigos com `review_due_date` vencida | 0% |
| 6 | KEDB atualizado | % erros conhecidos com workaround publicado na KB | 100% |
| 7 | Conhecimento de projetos preservado | % projetos encerrados com lição aprendida publicada na KB | ≥ 80% |
| 8 | Atualidade do conteúdo | % artigos publicados há > 1 ano sem revisão | ≤ 10% |

### 2.3 Limites do Módulo

**O módulo da KB:**
- Gerencia artigos, procedimentos, manuais, FAQs e workarounds.
- Integra com todos os módulos do SGTI para captura automática.
- Não substitui sistemas de documentação técnica complexa (Confluence, SharePoint) para grandes organizações.

---

## 3. Papéis e Responsabilidades

### 3.1 Usuário (END_USER)

**Responsabilidades:**
- Consultar artigos publicados antes de abrir chamado.
- Avaliar a utilidade de artigos consultados (botões Útil / Não Útil).
- Sugerir novos artigos via formulário de feedback.

**Pode ver:** Artigos com `audience = END_USER` ou `EVERYONE`. Não visualiza artigos com `audience = TECHNICAL`.

**Não pode:** criar, editar ou publicar artigos.

---

### 3.2 Analista de TI (IT_TECHNICIAN)

**Responsabilidades:**
- Criar rascunhos de artigos ao resolver incidentes com solução inédita.
- Revisar rascunhos gerados automaticamente pela IA (`DRAFT_AI`).
- Atualizar artigos existentes sob sua autoria.
- Vincular artigos a incidentes resolvidos.
- Sugerir depreciação de artigos desatualizados ao coordenador.

**Pode ver:** Artigos com `audience = TECHNICAL` ou `END_USER` ou `EVERYONE`.
**Não pode:** publicar artigos diretamente (apenas submeter para revisão).

---

### 3.3 Coordenador de TI (IT_SPECIALIST)

**Responsabilidades:**
- Revisar e aprovar artigos submetidos pelos Analistas.
- Publicar artigos revisados (com aprovação do IT_MANAGER para artigos críticos).
- Organizar e categorizar artigos do seu domínio.
- Identificar lacunas de conhecimento no domínio.
- Depreciar artigos obsoletos do seu domínio.
- Garantir a qualidade e atualidade dos artigos sob sua responsabilidade.

**Pode:** criar, editar, revisar e publicar artigos de qualquer categoria dentro do seu grupo de suporte.
**Referência:** BR-KB-002

---

### 3.4 Gestor de TI (IT_MANAGER)

**Responsabilidades:**
- Monitorar KPIs da KB no dashboard.
- Aprovar publicação de artigos críticos ou de alta sensibilidade.
- Revisar artigos com avaliação de utilidade baixa (helpful_rate < 60%).
- Autorizar depreciação em massa de artigos desatualizados.
- Receber alertas de artigos com revisão urgente pendente.

---

### 3.5 Administrador (SUPER_ADMIN)

**Responsabilidades:**
- Configurar categorias, tags padrão e parâmetros do módulo.
- Gerenciar templates de artigo por tipo de conteúdo.
- Executar operações de gestão editorial em massa.
- Auditar o módulo com acesso completo ao audit_log.

---

## 4. Estrutura do Artigo

### 4.1 Seção: Identificação

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **id** | UUID | Automático | Não | Identificador único |
| **Código** | String (sequencial) | Automático | Não | `KB-YYYY-NNNNNN`. Imutável. |
| **Título** | String (400) | Sim | Autor, Revisor | Título claro, conciso e pesquisável. Ex.: "Como reiniciar o Cisco AnyConnect quando a VPN não conecta". |
| **Slug** | String | Automático | Não | URL amigável gerada a partir do título. |
| **Versão** | Decimal | Automático | Não | `1.0` na publicação inicial; incrementado a cada publicação de nova versão. |

### 4.2 Seção: Classificação e Descoberta

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **Categoria** | FK — KBCategory | Sim | Autor, Revisor | Categoria principal do artigo. Ver seção 6. |
| **Subcategoria** | FK — KBSubcategory | Não | Autor, Revisor | Refinamento dentro da categoria. |
| **Tipo de Conteúdo** | Enum | Sim | Autor | `SOLUTION`, `PROCEDURE`, `FAQ`, `MANUAL`, `WORKAROUND`, `POLICY`, `LESSON_LEARNED`, `REFERENCE`. Ver seção 5. |
| **Serviço** | FK — ServiceCatalog | Não | Autor, Revisor | Serviço do catálogo ao qual o artigo está vinculado. |
| **Palavras-chave (Tags)** | Array String | Sim (mín. 3) | Autor, Revisor | Tags para facilitar busca e agrupamento. Mínimo de 3. |
| **Audiência** | Enum | Sim | Autor, Revisor | `END_USER` (usuário final pode ler e aplicar), `TECHNICAL` (apenas técnicos), `EVERYONE` (sem restrição). |
| **Idioma** | Enum | Sim | Autor | `pt-BR` (padrão), `en-US`. |

### 4.3 Seção: Conteúdo

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **Conteúdo** | Markdown (Rich Text) | Sim | Autor | Corpo completo do artigo em formato Markdown. Suporta títulos, listas, tabelas, código, imagens e links. |
| **Resumo** | Texto (500 chars) | Sim | Autor | Sumário em 2–3 frases exibido nas listagens e nos cards de sugestão. |
| **Pré-requisitos** | Texto | Não | Autor | O que é necessário saber ou ter antes de executar os passos. |
| **Ambiente** | Texto | Não | Autor | Sistema operacional, versão do software, configuração específica onde a solução funciona. |
| **Passos Detalhados** | Markdown | Condicional | Autor | Obrigatório para tipos SOLUTION, PROCEDURE e WORKAROUND. |
| **Limitações** | Texto | Condicional | Autor | Obrigatório para WORKAROUND: casos onde não funciona. |
| **Anexos** | Lista FileReference | Não | Autor | Screenshots, logs de exemplo, arquivos de configuração. |

### 4.4 Seção: Autoria e Revisão

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **Autor** | FK — User | Automático | Não | Criador do artigo. Imutável após publicação. |
| **Co-autores** | Array FK — User | Não | Autor | Colaboradores que contribuíram com o conteúdo. |
| **Revisor** | FK — User | Condicional | Revisores | Quem revisou e aprovou. Preenchido automaticamente ao aprovar. |
| **Revisado Em** | DateTime | Automático | Não | Timestamp da última aprovação. |
| **Próxima Revisão** | Date | Sim | Revisor | Data limite para próxima revisão. Padrão: publicação + 12 meses. |

### 4.5 Seção: Ciclo de Vida e Status

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **Status** | Enum | Sim | Conforme workflow | `DRAFT`, `DRAFT_AI`, `UNDER_REVIEW`, `PUBLISHED`, `DEPRECATED`. |
| **Data de Criação** | DateTime | Automático | Não | Timestamp de criação. Preenchido pelo banco. |
| **Data de Publicação** | DateTime | Automático | Não | Preenchida ao mudar para PUBLISHED. |
| **Data de Depreciação** | DateTime | Automático | Não | Preenchida ao mudar para DEPRECATED. |
| **Artigo Substituto** | FK — KnowledgeArticle | Condicional | Revisor | Obrigatório ao depreciar: artigo que substitui este. |
| **Origem** | Enum | Automático | Não | `MANUAL` (criado pelo autor), `INCIDENT_AUTO` (gerado por incidente), `PROBLEM_AUTO` (gerado por workaround), `PROJECT_AUTO` (gerado por lição aprendida), `COMPLIANCE_AUTO` (gerado por apontamento), `AI_GENERATED` (gerado por IA futura). |
| **Referência de Origem** | UUID | Automático | Não | ID do incidente, problema ou projeto que originou o artigo. |

### 4.6 Seção: Métricas de Uso e Qualidade

| Campo | Tipo | Editável | Descrição |
|-------|------|:--------:|-----------|
| **Visualizações Totais** | Inteiro | Automático | Total de vezes que o artigo foi aberto. |
| **Visualizações (30 dias)** | Inteiro | Automático | Visualizações no último mês. Usado para detectar artigos inativos. |
| **Avaliações Útil** | Inteiro | Automático | Quantidade de votos "Útil". |
| **Avaliações Não Útil** | Inteiro | Automático | Quantidade de votos "Não Útil". |
| **Taxa de Utilidade** | Decimal — calculado | Não | `helpful_count / (helpful_count + not_helpful_count) × 100`. |
| **Flag Revisão Urgente** | Boolean | Automático | `true` quando taxa de utilidade < 60% com ≥ 10 avaliações. |
| **Deflexões Geradas** | Inteiro | Automático | Usuários que consultaram o artigo e não abriram chamado. |
| **Incidentes Resolvidos com este Artigo** | Inteiro | Automático | Count de incidentes com este `kb_article_id`. |

---

## 5. Tipos de Conteúdo

### 5.1 Tabela de Tipos

| Tipo | Código | Descrição | Audiência Padrão | Quando Criar |
|:----:|:------:|-----------|:----------------:|:------------:|
| **Solução** | `SOLUTION` | Solução para problema ou incidente específico | TECHNICAL | Ao resolver incidente com solução inédita |
| **Procedimento** | `PROCEDURE` | Passo a passo para executar tarefa operacional | TECHNICAL | Ao documentar processo técnico repetível |
| **FAQ** | `FAQ` | Perguntas frequentes com respostas diretas | END_USER | Ao identificar dúvidas recorrentes de usuários |
| **Manual** | `MANUAL` | Documentação completa de sistema ou ferramenta | TECHNICAL | Ao implantar novo sistema ou ferramenta |
| **Workaround** | `WORKAROUND` | Solução temporária para erro conhecido | TECHNICAL | Ao publicar workaround de problema ITIL |
| **Política** | `POLICY` | Regras, diretrizes e políticas internas de TI | EVERYONE | Ao formalizar política corporativa de TI |
| **Lição Aprendida** | `LESSON_LEARNED` | Conhecimento gerado em projetos encerrados | TECHNICAL | Ao encerrar projeto com retrospectiva |
| **Referência** | `REFERENCE` | Documentação técnica de referência rápida | TECHNICAL | Ao documentar configurações, comandos, APIs |

### 5.2 Templates por Tipo

Cada tipo possui um template de conteúdo pré-definido:

**Template SOLUTION:**
```
## Problema
Descrição clara do sintoma observado.

## Ambiente
SO, versão do software, configuração.

## Causa
Causa identificada (se conhecida).

## Solução
### Pré-requisitos
### Passo a Passo
1. ...
2. ...

## Verificação
Como confirmar que a solução funcionou.

## Observações
Casos especiais; quando não funciona.
```

**Template PROCEDURE:**
```
## Objetivo
O que este procedimento realiza.

## Pré-requisitos
Permissões, ferramentas, contexto necessário.

## Procedimento
### Etapa 1: ...
### Etapa 2: ...

## Resultado Esperado
O que deve acontecer ao concluir.

## Rollback
Como desfazer, se necessário.
```

**Template WORKAROUND:**
```
## Erro Conhecido
Descrição do problema e seu impacto.

## Quando Aplicar
Condições para uso deste workaround.

## Passos do Workaround
1. ...
2. ...

## Limitações
Quando NÃO funciona; riscos conhecidos.

## Solução Definitiva
Status: Em desenvolvimento (PRB-YYYY-NNNNNN).
```

---

## 6. Categorias

### 6.1 Estrutura de Categorias e Subcategorias

| Categoria | Código | Subcategorias | Descrição |
|-----------|:------:|--------------|-----------|
| **Incidentes** | `INCIDENT` | Hardware, Software, Rede, Acesso, Performance, Segurança, Google Workspace | Soluções para incidentes resolvidos |
| **Requisições** | `REQUEST` | Criação de Usuário, Acesso, Hardware, Software, Licença | Procedimentos de atendimento de requisições |
| **Problemas** | `PROBLEM` | Erros Conhecidos, Workarounds, Causas Raiz | Erros conhecidos e workarounds do KEDB |
| **Compliance** | `COMPLIANCE` | ISO 27001, LGPD, PCI DSS, Políticas Internas | Políticas, procedimentos e controles de conformidade |
| **Projetos** | `PROJECT` | Infraestrutura, Sistemas, Cloud, Segurança | Lições aprendidas e documentação de projetos |
| **Ativos** | `ASSETS` | Hardware, Software, Licenças, Inventário | Procedimentos de gestão de ativos e inventário |
| **Segurança** | `SECURITY` | Endpoint, Identidades, Redes, Dados, Resposta a Incidentes | Guias de segurança da informação |
| **Sistemas** | `SYSTEMS` | ERP, CRM, Integrações, Bancos de Dados, APIs | Documentação de sistemas corporativos |
| **Google Workspace** | `GOOGLE_WORKSPACE` | Gmail, Drive, Meet, Admin, Grupos | Procedimentos e soluções do Google Workspace |
| **Infraestrutura** | `INFRASTRUCTURE` | Servidores, Virtualização, Storage, Backup, Cloud | Procedimentos de infraestrutura |
| **Geral** | `GENERAL` | Onboarding, Políticas Gerais, Ferramentas | Documentação geral não categorizada acima |

### 6.2 Expansão de Categorias

Novas categorias e subcategorias podem ser adicionadas pelo SUPER_ADMIN via módulo de Administração. Cada categoria pode ter templates personalizados e configuração de audiência padrão.

---

## 7. Workflow Editorial

### 7.1 Diagrama de Status

```
 ORIGENS DE CRIAÇÃO
 ──────────────────
 Autor (manual) · Resolução de Incidente (auto) · Workaround Publicado (auto)
 Lição de Projeto (auto) · Correção de Compliance (auto) · IA Futura (auto)
             │
             ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                      RASCUNHO                                │
 │                   (Status: DRAFT)                            │
 │  Criado manualmente pelo autor.                              │
 │  Editável sem restrições. Sem SLA. Sem visibilidade.         │
 └──────────────────────────┬───────────────────────────────────┘
                            │
 ┌──────────────────────────┴──────────────────────────────────┐
 │                   RASCUNHO DE IA                             │
 │                  (Status: DRAFT_AI)                          │
 │  Gerado automaticamente pelo sistema.                        │
 │  Exige ao menos uma edição humana antes da revisão.          │
 │  Badge "Gerado por IA — Requer Revisão Humana" exibido.      │
 └──────────────────────────┬───────────────────────────────────┘
                            │
       Autor submete para revisão ("Enviar para Revisão")
                            │
                            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                     EM REVISÃO                               │
 │                  (Status: UNDER_REVIEW)                      │
 │  Aguardando revisão técnica do Coordenador ou IT_MANAGER.    │
 │  Não visível para usuários finais.                           │
 └──────────┬─────────────────────────────┬────────────────────┘
            │ Revisão aprovada             │ Revisão rejeitada
            ▼                             ▼
 ┌──────────────────────────┐  ┌──────────────────────────────┐
 │       PUBLICADO          │  │   Devolvido para o Autor     │
 │   (Status: PUBLISHED)    │  │  (retorna para DRAFT)        │
 │  Visível para a audiência│  │  Feedback obrigatório.       │
 │  definida.               │  └──────────────────────────────┘
 │  SLA de revisão ativo.   │
 └──────────┬───────────────┘
            │ Conteúdo obsoleto ou substituído
            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                     ARQUIVADO                                │
 │                  (Status: DEPRECATED)                        │
 │  Removido da busca padrão. Artigo substituto obrigatório.    │
 │  Preservado no histórico para referência.                    │
 └──────────────────────────────────────────────────────────────┘
```

### 7.2 Regras de Transição

| De | Para | Quem | Pré-condição |
|----|------|:----:|:------------|
| DRAFT | UNDER_REVIEW | Autor | Título + Conteúdo + Resumo + Categoria + 3 tags + Audiência preenchidos |
| DRAFT_AI | UNDER_REVIEW | Autor | Obrigatório ao menos 1 edição humana no conteúdo (detectada pelo sistema) |
| UNDER_REVIEW | PUBLISHED | IT_SPECIALIST+ | Revisão aprovada |
| UNDER_REVIEW | DRAFT | IT_SPECIALIST+ (devolução) | Feedback obrigatório (mín. 20 chars) |
| PUBLISHED | DEPRECATED | IT_SPECIALIST+ | Artigo substituto informado + motivo |
| PUBLISHED | UNDER_REVIEW | Autor | Para atualização de conteúdo (nova versão) |

**Nenhum artigo pula a etapa de revisão (UNDER_REVIEW).**
**Referência:** BR-KB-001 e BR-KB-002

---

## 8. Versionamento

### 8.1 Modelo de Versionamento

Todo artigo publicado tem versionamento automático:

| Versão | Quando é criada | Tipo de Mudança |
|:------:|:---------------:|:---------------:|
| `1.0` | Primeira publicação | — |
| `1.1` | Correção menor (typo, link quebrado) | `MINOR` |
| `1.2` | Atualização de conteúdo parcial | `MINOR` |
| `2.0` | Revisão completa ou mudança significativa | `MAJOR` |
| `3.0` | Novo escopo / reescrita total | `MAJOR` |

### 8.2 Fluxo de Atualização de Artigo Publicado

Ao editar artigo com status PUBLISHED:

```
Autor clica "Editar" em artigo PUBLISHED:
  → Sistema cria NOVA VERSÃO do artigo com status DRAFT
  → Artigo publicado permanece ativo para consulta
  → Nova versão (draft) editada pelo autor
  → Nova versão submetida para revisão (UNDER_REVIEW)
  → Revisor aprova → Nova versão publicada (PUBLISHED)
  → Versão anterior arquivada (DEPRECATED) automaticamente
  → Link canônico aponta para nova versão
```

### 8.3 Histórico de Versões

Todas as versões publicadas de um artigo são preservadas no histórico e acessíveis:
- Comparação visual entre versões (diff highlighting).
- Data e autor de cada versão.
- Motivo da atualização registrado.
- Versão específica acessível via URL com parâmetro de versão.

---

## 9. Aprovações e Revisão

### 9.1 Critérios de Revisão

O revisor avalia o artigo em 5 dimensões:

| Dimensão | O que verificar |
|:--------:|----------------|
| **Clareza** | O título descreve corretamente o conteúdo? O resumo é preciso? |
| **Completude** | O artigo tem tudo o que o leitor precisa para aplicar a solução? |
| **Correção Técnica** | Os passos e informações técnicas estão corretos? |
| **Segurança** | O conteúdo não expõe informações sensíveis (senhas, IPs internos, dados pessoais)? |
| **Descoberta** | As tags são suficientes (mín. 3) e relevantes? A categoria está correta? |

### 9.2 Fluxo de Revisão

```
Artigo submetido para revisão (UNDER_REVIEW):
  → Notificação ao grupo de revisores da categoria
  → Prazo para revisão: 3 dias úteis (padrão)

Revisor (IT_SPECIALIST+) analisa:
  ├── Aprovado:
  │   → Status: PUBLISHED
  │   → Versão incrementada automaticamente
  │   → Autor notificado: "Seu artigo foi publicado"
  │   → Data de publicação registrada
  │   → Próxima revisão: publicação + 12 meses
  │
  └── Devolvido para ajustes:
      → Status: DRAFT
      → Feedback obrigatório (mín. 20 chars)
      → Autor notificado com o feedback
      → Contador de devoluções registrado
```

### 9.3 Artigos Críticos: Aprovação do IT_MANAGER

Artigos das seguintes categorias exigem aprovação adicional do IT_MANAGER antes de publicar:

- **Compliance:** artigos de política com implicação regulatória.
- **Segurança:** procedimentos com acesso a sistemas críticos.
- **Workarounds de serviços críticos:** VPN, e-mail corporativo, ERP.

---

## 10. Busca Inteligente

### 10.1 Tipos de Busca Disponíveis

| Tipo | Descrição | Quando Usar |
|:----:|-----------|:-----------:|
| **Full-text** | Busca no título, resumo, conteúdo e tags | Busca geral por palavras |
| **Por Serviço** | Filtra artigos vinculados ao serviço selecionado | Ao abrir chamado de serviço específico |
| **Por Categoria** | Navega pela hierarquia de categorias | Exploração do conteúdo |
| **Por Tag** | Busca artigos com a tag exata | Busca por tecnologia ou produto |
| **Por Tipo** | Filtra por tipo de conteúdo | Quando precisa de procedimento ou FAQ |
| **Por Audiência** | Filtra por END_USER, TECHNICAL, EVERYONE | Contextual por perfil do usuário |
| **KEDB** | Lista apenas erros conhecidos com workaround ativo | Durante atendimento de incidente |

### 10.2 Ranking de Resultados

Os resultados da busca são ordenados por relevância combinando múltiplos fatores:

| Fator | Peso | Descrição |
|:-----:|:----:|-----------|
| Correspondência no título | 40% | Título contém exatamente os termos buscados |
| Correspondência nas tags | 25% | Tags têm correspondência com os termos |
| Correspondência no conteúdo | 15% | Termos encontrados no corpo do artigo |
| Avaliação de utilidade (helpful_rate) | 10% | Artigos mais bem avaliados sobem no ranking |
| Recência | 5% | Artigos mais recentes ligeiramente favorecidos |
| Número de usos em incidentes | 5% | Artigos com mais resoluções vinculadas têm maior relevância |

### 10.3 Busca em Tempo Real (Debounce)

A busca na KB começa com o usuário digitando e retorna resultados em tempo real:

- Debounce de 300ms: busca inicia após parar de digitar por 300ms.
- Mínimo de 3 caracteres para iniciar a busca.
- Máximo de 10 resultados por busca rápida (expandível).
- Indicador visual de loading enquanto busca.

### 10.4 Filtros Avançados

A busca avançada permite combinar:
- Período de publicação (último mês, trimestre, ano, qualquer).
- Autor específico.
- Status (incluir DEPRECATED na busca).
- Idioma.
- Categoria + subcategoria.
- Tags múltiplas (AND ou OR).
- Tipo de conteúdo.

---

## 11. Sugestão Automática durante o Atendimento

### 11.1 Momento 1 — Usuário Preenchendo Chamado

**Gatilho:** campo "Título" sendo preenchido no formulário de abertura de incidente ou requisição.

**Comportamento:**
```
Usuário digita: "VPN não conecta após atualização"
  → Debounce: 1,5 segundos após parar de digitar
  → Busca full-text semântica na KB
  → Exibe card "Artigos Relacionados":

  💡 Encontramos artigos que podem ajudar:

  📄 Como reiniciar o Cisco AnyConnect quando a VPN não conecta
      ★★★★☆ (4.2) · 127 leituras · Solução · VPN
      [Ler artigo]  [Isso resolveu meu problema ✓]

  📄 VPN: Erro de certificado SSL após atualização do Windows
      ★★★★★ (4.8) · 89 leituras · Workaround
      [Ler artigo]  [Isso resolveu meu problema ✓]

  → Se usuário clica "Isso resolveu meu problema":
      Chamado NÃO é criado
      Evento KB_DEFLECTION registrado: +1 deflexão no artigo
      Artigo.helpful_count + 1
```

### 11.2 Momento 2 — Técnico no Atendimento de Incidente

**Gatilho:** incidente atribuído ao técnico (status IN_PROGRESS).

**Comportamento:**
- Card "Soluções Sugeridas" exibido no topo da página do incidente.
- 3 artigos mais relevantes com score de relevância.
- Busca considera: título do incidente + categoria + serviço selecionado.
- Botão "Vincular este artigo ao incidente" para registrar que o artigo foi utilizado.
- Botão "Buscar mais artigos" abre modal de busca completa.

### 11.3 Momento 3 — KEDB no Atendimento

**Gatilho:** serviço do incidente tem Problema com status `KNOWN_ERROR` vinculado.

**Comportamento:**
```
Banner KEDB exibido automaticamente:

  ┌────────────────────────────────────────────────────────────┐
  │ ⚠️  ERRO CONHECIDO PARA ESTE SERVIÇO                        │
  │                                                             │
  │ Problema: Certificado SSL da VPN expira sem renovação       │
  │                                                             │
  │ Workaround disponível:                                      │
  │ Reiniciar o cliente Cisco AnyConnect resolve em 85%         │
  │ dos casos (não funciona se certificado > 48h expirado).     │
  │                                                             │
  │ [Ver passos completos]  [Vincular ao chamado]               │
  └────────────────────────────────────────────────────────────┘
```

### 11.4 Momento 4 — Pós-Resolução de Incidente

**Gatilho:** incidente marcado como RESOLVED com `resolution_notes` preenchido.

**Comportamento:**
- Sistema busca artigos similares (threshold ≥ 0,80).
- Se **não existe** artigo similar: cria `DRAFT_AI` com conteúdo baseado na solução.
- Se **existe**: sugere vinculação ao artigo existente.
- Notificação ao técnico: "Rascunho KB criado para revisão. Por favor, revise e submeta para publicação."

---

## 12. Integração com Incidentes

### 12.1 Vínculos Bidirecionais

| No Incidente | No Artigo KB |
|:------------:|:------------:|
| Campo `kb_article_id` com link direto | Campo `incident_resolution_count` incrementado |
| Badge "Solução documentada na KB" | Lista de incidentes resolvidos com este artigo |
| Solução do incidente como base do artigo | Referência de origem `incident_id` |

### 12.2 Geração Automática de Artigo

Ao resolver incidente com `resolution_notes` preenchido:

```
LÓGICA COMPLETA DE GERAÇÃO AUTOMÁTICA

1. Event: IncidentResolved publicado
2. KnowledgeModule recebe o evento
3. Busca semântica por artigos similares (título do incidente)
   threshold = 0.80 (80% de similaridade)

4. Se artigo similar encontrado:
   → Notificação ao técnico: "Artigo similar existe: [KB-YYYY-NNNNNN].
      Deseja vinculá-lo à resolução?"
   → Técnico confirma vinculação

5. Se artigo similar NÃO encontrado:
   → Cria KnowledgeArticle com status = DRAFT_AI:
      título: gerado com base no título do incidente
      tipo: SOLUTION
      categoria: mesma do incidente
      serviço: mesmo do incidente
      conteúdo: based em resolution_notes
      origem: INCIDENT_AUTO
      incident_id: incidente.id
      audiência: TECHNICAL (padrão)
   → Notificação ao técnico: "Rascunho de artigo KB criado para revisão"
```

### 12.3 Impacto nas Métricas de Incidente

- Incidente resolvido com artigo KB vinculado → `first_contact_resolution_via_kb` = true.
- Percentual de incidentes resolvidos via KB é exibido no dashboard de incidentes.

---

## 13. Integração com Problemas

### 13.1 Publicação de Workaround Gera Artigo KB

Ao publicar workaround no módulo de Problemas:

```
WorkaroundPublished event →
  KnowledgeModule.createArticleFromWorkaround({
    título: "[Workaround] {titulo_do_workaround}",
    tipo: WORKAROUND,
    conteúdo: passos + limitações (estrutura do template WORKAROUND),
    categoria: PROBLEM,
    serviço: problema.service_id,
    tags: ["workaround", "erro-conhecido", "kedb"],
    audiência: TECHNICAL,
    status: DRAFT_AI,
    origem: PROBLEM_AUTO,
    problem_id: problema.id
  })
```

**Referência:** BR-KB-004

### 13.2 Solução Definitiva Atualiza o Artigo

Quando o Problema é marcado como RESOLVED (solução definitiva implementada):

```
ProblemResolved event →
  KnowledgeModule.updateWorkaroundArticle({
    artigo_workaround.status = "atualizado",
    adiciona seção: "Solução Definitiva Disponível",
    adiciona link: para artigo de solução
    workaround_status: DEPRECATED (automaticamente)
  })
```

**Referência:** BR-KB-005 (extensão)

---

## 14. Integração com Compliance

### 14.1 Política Publicada Gera Artigo KB

Ao publicar política no módulo de Compliance:

```
PolicyPublished event →
  KnowledgeArticle criado com:
    tipo: POLICY
    categoria: COMPLIANCE
    audiência: EVERYONE
    status: DRAFT_AI
    conteúdo: texto da política
    tags: ["política", norma_code, departamento]
    origem: COMPLIANCE_AUTO
    compliance_finding_id: finding.id (se vinculada a apontamento)
```

### 14.2 Correção de Apontamento Gera Artigo de Procedimento

Ao concluir apontamento de compliance com solução documentada, o sistema sugere criação de artigo de procedimento documentando o controle implementado:

- Tipo: PROCEDURE.
- Categoria: COMPLIANCE.
- Audiência: TECHNICAL.
- Conteúdo baseado nas ações do plano de ação e evidências coletadas.

---

## 15. Integração com Projetos

### 15.1 Lições Aprendidas de Projetos

Ao encerrar projeto, lições aprendidas geram artigos da KB:

```
ProjectClosed event →
  Para cada LessonLearned do projeto:
    KnowledgeArticle criado com:
      tipo: LESSON_LEARNED
      título: "Lição Aprendida: {título_da_lição}"
      categoria: PROJECTS
      audiência: TECHNICAL
      conteúdo: situação + solução + recomendações
      status: DRAFT_AI
      origem: PROJECT_AUTO
      project_id: projeto.id
```

### 15.2 Documentação Técnica de Entregas

O PM pode criar artigos de referência durante e após o projeto para documentar:
- Arquitetura implantada.
- Runbooks operacionais.
- Procedimentos de manutenção.
- Configurações críticas.

---

## 16. Preparação para IA Futura

### 16.1 Estrutura Preparada para IA

O módulo foi projetado para integrar capacidades de IA em versões futuras do SGTI. As estruturas já implementadas que suportam IA futura:

| Estrutura | Propósito para IA | Status Atual |
|:----------:|-------------------|:------------:|
| `content_embedding` | Vetor semântico do conteúdo para busca por similaridade | Campo reservado — sem dados |
| `DRAFT_AI` status | Identifica artigos gerados por IA para revisão humana | Implementado |
| `origin = AI_GENERATED` | Rastreia conteúdo gerado por IA | Campo reservado |
| `semantic_threshold` | Parâmetro para busca semântica | Configurável |
| `deflection_count` | Mede efetividade de sugestões | Implementado |
| Histórico de buscas | Dados de treinamento para rankings | Implementado |
| Avaliações de utilidade | Feedback para rankeamento e retraining | Implementado |

### 16.2 Capacidades de IA Planejadas (Roadmap)

| Capacidade | Descrição | Fase Planejada |
|:----------:|-----------|:--------------:|
| **Geração automática de artigos** | IA gera primeiro rascunho a partir da solução do incidente | v2 |
| **Busca semântica** | Busca por significado (não apenas palavras) | v2 |
| **Classificação automática** | IA sugere categoria, tags e audiência | v2 |
| **Detecção de duplicatas** | IA identifica artigos redundantes antes da publicação | v2 |
| **Resumo automático** | IA gera resumo do artigo automaticamente | v3 |
| **Chatbot de suporte** | Assistente baseado na KB responde dúvidas dos usuários | v3 |
| **Análise de gaps** | IA identifica lacunas de conhecimento com base em incidentes sem solução KB | v3 |
| **Recomendação personalizada** | Artigos sugeridos com base no histórico do técnico | v3 |

### 16.3 Princípio de IA Responsável na KB

Todo conteúdo gerado por IA no SGTI:
- Recebe status `DRAFT_AI` e badge visual diferenciado.
- Exige ao menos uma edição humana antes de ser submetido para revisão.
- Passa pelo mesmo fluxo editorial que conteúdo escrito por humanos.
- Mantém o campo `origin = AI_GENERATED` para rastreabilidade.

---

## 17. Dashboards e Indicadores

### 17.1 Dashboard Operacional da KB

**Destino:** Analistas, Coordenadores, IT_MANAGER.

| Componente | Dados Exibidos |
|------------|---------------|
| **Artigos por Status** | DRAFT / DRAFT_AI / UNDER_REVIEW / PUBLISHED / DEPRECATED |
| **Rascunhos Pendentes de Revisão** | Artigos UNDER_REVIEW com prazo de revisão |
| **Artigos com Revisão Vencida** | Artigos PUBLISHED com `next_review_date < hoje` |
| **Artigos com Revisão Urgente** | Flag `urgent_review = true` (helpful_rate < 60%) |
| **Rascunhos de IA Pendentes** | Artigos DRAFT_AI aguardando edição humana |
| **KEDB Status** | Total de erros conhecidos com workaround ativo |
| **Deflexões do Mês** | Usuários que encontraram solução sem abrir chamado |

### 17.2 Indicadores de Desempenho

| KPI | Fórmula | Meta |
|-----|---------|:----:|
| **Total de Artigos Publicados** | COUNT(status = PUBLISHED) | Crescimento contínuo |
| **Taxa de Deflexão** | deflections / (deflections + chamados_abertos_com_busca) × 100 | ≥ 15% |
| **Taxa de Resolução via KB** | incidentes com kb_article_id / total incidentes × 100 | ≥ 60% |
| **Helpful Rate Médio** | AVG(helpful_count / (helpful_count + not_helpful_count)) × 100 | ≥ 75% |
| **Artigos com Revisão Vencida** | COUNT(next_review_date < hoje AND status = PUBLISHED) | 0 |
| **Cobertura de Serviços** | Serviços com artigo vinculado / total serviços PUBLISHED × 100 | ≥ 80% |
| **Tempo Médio de Revisão** | AVG(published_at − submitted_for_review_at) em dias | ≤ 3 dias úteis |

### 17.3 Dashboard do Catálogo de Conhecimento

Visão pública disponível para todos os usuários autenticados:
- Artigos mais acessados no mês.
- Artigos mais bem avaliados.
- Novos artigos publicados na semana.
- Artigos do KEDB (erros conhecidos).
- Busca em destaque.

---

## 18. Relatórios

### 18.1 Relatórios Operacionais Automáticos

| Relatório | Geração | Destinatário | Conteúdo |
|-----------|:-------:|:------------:|---------|
| **Artigos para Revisão** | Semanal (seg) | IT_SPECIALIST + IT_MANAGER | Artigos UNDER_REVIEW com prazo vencendo |
| **Revisões Vencidas** | Semanal | IT_MANAGER | Artigos PUBLISHED com next_review_date passada |
| **Rascunhos de IA Pendentes** | Semanal | IT_TECHNICIAN + IT_SPECIALIST | DRAFT_AI sem edição humana há > 7 dias |
| **Artigos com Avaliação Baixa** | Mensal | IT_MANAGER | Artigos com helpful_rate < 60% e ≥ 10 avaliações |

### 18.2 Relatórios Gerenciais

| Relatório | Frequência | Destinatário | Conteúdo |
|-----------|:----------:|:------------:|---------|
| **Performance da KB** | Mensal | IT_MANAGER | Deflexões, taxa de resolução via KB, helpful_rate médio |
| **Cobertura por Serviço** | Mensal | IT_MANAGER | Serviços com e sem artigos vinculados |
| **Artigos por Autor** | Mensal | IT_MANAGER | Produção de cada membro da equipe |
| **KEDB Completo** | Mensal | IT_MANAGER + Equipe | Erros conhecidos com status de workaround e solução |

### 18.3 Relatórios Executivos

| Relatório | Frequência | Destinatário | Conteúdo |
|-----------|:----------:|:------------:|---------|
| **Panorama do Conhecimento** | Trimestral | IT_MANAGER + Diretoria | Volume, qualidade, deflexões, impacto nos incidentes |
| **ROI da Base de Conhecimento** | Semestral | IT_MANAGER + Diretoria | Horas economizadas com deflexões + resolução mais rápida |

---

## 19. Auditoria e Rastreabilidade

### 19.1 Eventos Auditados

| Evento | `action` | Dados Capturados |
|--------|:--------:|:----------------:|
| Artigo criado | CREATE | Todos os campos + autor + origem |
| Conteúdo editado | UPDATE | Versão anterior → nova + campos alterados |
| Artigo submetido para revisão | UPDATE | status DRAFT → UNDER_REVIEW |
| Artigo aprovado e publicado | UPDATE | Aprovado_por + timestamp + versão |
| Artigo devolvido para revisão | UPDATE | Devolvido_por + feedback |
| Artigo depreciado | UPDATE | status → DEPRECATED + artigo_substituto + motivo |
| Artigo avaliado (Útil) | CREATE | user_id + article_id + `helpful` |
| Artigo avaliado (Não Útil) | CREATE | user_id + article_id + `not_helpful` |
| Artigo vinculado a incidente | UPDATE | incident_id + article_id + vinculado_por |
| Deflexão registrada | CREATE | user_id + article_id + chamado_não_aberto |
| Artigo gerado automaticamente | CREATE | origem + referência de origem |
| Artigo acessado | CREATE | user_id + article_id + timestamp (para analytics) |

---

## 20. Regras de Negócio

As regras a seguir complementam as regras BR-KB-001 a BR-KB-009 definidas em `Docs/24_BUSINESS_RULES.md`.

---

**KB-001** — Fluxo obrigatório: DRAFT → UNDER_REVIEW → PUBLISHED
Nenhum artigo pula a etapa de revisão. Artigos DRAFT_AI exigem ao menos uma edição humana antes de poder ser submetidos para revisão.
**Referência:** BR-KB-001 e BR-KB-002

---

**KB-002** — IT_SPECIALIST publica; IT_TECHNICIAN apenas submete
Analistas (IT_TECHNICIAN) podem criar e editar artigos, mas apenas submetê-los para revisão. A publicação é feita exclusivamente por IT_SPECIALIST+.
**Referência:** BR-KB-002

---

**KB-003** — Artigo PUBLISHED não pode ser deletado — apenas depreciado
Artigos publicados são depreciados, nunca excluídos. A depreciação exige artigo substituto informado.
**Referência:** BR-KB-003

---

**KB-004** — Workaround publicado gera rascunho KB automaticamente
Ao publicar workaround no módulo de Problemas, o evento cria automaticamente rascunho DRAFT_AI na KB.
**Referência:** BR-KB-004

---

**KB-005** — Incidente resolvido verifica artigo similar antes de criar rascunho
Busca semântica com threshold ≥ 0,80 executada antes de criar DRAFT_AI. Sem similar → cria rascunho. Com similar → sugere vinculação.
**Referência:** BR-KB-005

---

**KB-006** — Helpful rate < 40% com ≥ 10 avaliações: revisão urgente
Artigo com helpful_count / total_votes < 0,40 e ≥ 10 avaliações recebe flag `urgent_review = true` e notificação ao IT_MANAGER.
**Referência:** BR-KB-006

---

**KB-007** — Artigo sem visualização em 6 meses: sugestão de depreciação
PUBLISHED com `view_count_30d = 0` por 6 meses consecutivos gera sugestão de depreciação ao autor e IT_MANAGER.
**Referência:** BR-KB-007

---

**KB-008** — Artigo DEPRECATED excluído da busca padrão
Artigos DEPRECATED não aparecem na busca padrão. Visíveis apenas com filtro explícito `status=DEPRECATED` aplicado por IT_TECHNICIAN+.
**Referência:** BR-KB-008

---

**KB-009** — Mínimo de 3 tags por artigo
Artigos com menos de 3 tags geram aviso ao submeter para revisão (não bloqueio) e aparecem em relatório de manutenção editorial.
**Referência:** BR-KB-009

---

**KB-010** — Código do artigo imutável após criação
O código KB-YYYY-NNNNNN é sequencial, único por tenant e imutável após criação.

---

**KB-011** — Audiência TECHNICAL: invisível para END_USER
Artigos com `audience = TECHNICAL` não são exibidos para usuários com papel END_USER em nenhuma circunstância.

---

**KB-012** — Devolução para ajustes: feedback obrigatório
Ao devolver artigo (UNDER_REVIEW → DRAFT), o revisor deve fornecer feedback com mínimo de 20 caracteres.

---

**KB-013** — DRAFT_AI exige edição humana antes da revisão
Artigos com status DRAFT_AI que não tenham sido editados por humano (nenhuma alteração no content desde a criação) são bloqueados na submissão para revisão.

---

**KB-014** — DRAFT_AI: badge visual obrigatório até publicação
Artigos DRAFT_AI exibem badge "Gerado por IA — Requer Revisão Humana" até receberem ao menos uma edição humana no conteúdo.

---

**KB-015** — Busca em tempo real com debounce de 300ms
A busca inicia após 300ms de inatividade no campo de busca e com mínimo de 3 caracteres.

---

**KB-016** — Workaround depreciado ao resolver problema com solução definitiva
Quando problema é marcado como RESOLVED, o artigo de workaround vinculado é automaticamente marcado como DEPRECATED.
**Referência:** Extensão de BR-KB-005

---

**KB-017** — Próxima revisão definida no momento da publicação
Ao publicar artigo, o campo `next_review_date` é automaticamente calculado como `published_at + 12 meses`. IT_SPECIALIST pode ajustar para período menor (nunca maior que 12 meses).

---

**KB-018** — Revisão de artigo não cria novo artigo — atualiza versão
A atualização de artigo publicado incrementa a versão (1.0 → 1.1 → 2.0). Não cria novo registro de artigo.

---

**KB-019** — Histórico de versões preservado indefinidamente
Todas as versões publicadas de um artigo são preservadas no histórico e acessíveis por IT_TECHNICIAN+.

---

**KB-020** — Deflexão registrada apenas com confirmação do usuário
O evento de deflexão (usuário resolveu sem abrir chamado) é registrado apenas quando o usuário clica explicitamente em "Isso resolveu meu problema". Consulta sem clique não conta como deflexão.

---

**KB-021** — Avaliação de artigo: 1 voto por usuário por artigo
Cada usuário pode avaliar um artigo apenas uma vez (Útil ou Não Útil). Reavaliação substitui o voto anterior.

---

**KB-022** — Artigo vinculado a incidente: contadores atualizados
Ao vincular artigo à resolução de incidente: `resolution_count + 1` e `helpful_count + 1` (voto implícito do técnico que usou).

---

**KB-023** — Artigos de política aprovados pelo IT_MANAGER antes de publicar
Artigos do tipo POLICY e de categoria COMPLIANCE exigem aprovação do IT_MANAGER além da revisão do IT_SPECIALIST.

---

**KB-024** — Artigo de workaround deve ter seção de limitações obrigatória
Artigos do tipo WORKAROUND não podem ser publicados sem a seção "Limitações" preenchida com mínimo de 30 caracteres.

---

**KB-025** — Conteúdo sensível bloqueado na publicação
O revisor deve verificar que o artigo não contém: senhas em texto claro, IPs internos, dados pessoais de colaboradores ou clientes. Conteúdo com esses dados bloqueia a publicação com aviso.

---

**KB-026** — Sugestão automática exibida em até 1,5 segundos
A sugestão de artigos durante o preenchimento do título do chamado deve retornar resultados em até 1,5 segundos após o debounce.

---

**KB-027** — KEDB exibido em destaque durante atendimento de incidente
Erros conhecidos do serviço afetado são exibidos em banner destacado no topo da página do incidente, antes de qualquer outro conteúdo.

---

**KB-028** — Artigo pode ser vinculado a apenas 1 incidente por resolução
O campo `kb_article_id` do incidente aceita um único artigo vinculado à resolução. Para múltiplos artigos úteis, o técnico registra o principal e menciona os demais nas notas.

---

**KB-029** — Depreciação em cascata: artigos que referenciam artigo depreciado são sinalizados
Ao depreciar um artigo, o sistema verifica se outros artigos publicados têm links internos para ele. Se sim, exibe lista de artigos a atualizar ao revisor.

---

**KB-030** — Artigo do tipo MANUAL: versão de produto obrigatória
Artigos do tipo MANUAL devem ter o campo "Ambiente" preenchido com a versão do produto documentado. Sem este campo, a submissão é bloqueada.

---

**KB-031** — Cobertura de serviço: alerta para serviços sem artigo KB
O dashboard exibe alerta para serviços PUBLISHED no catálogo que não possuem nenhum artigo KB vinculado.

---

**KB-032** — Tags padronizadas sugeridas ao criar artigo
Ao criar artigo, o sistema sugere tags com base na categoria e no tipo de conteúdo selecionados, com base em tags mais usadas no mesmo contexto.

---

**KB-033** — Artigo publicado notifica a equipe do serviço vinculado
Ao publicar artigo vinculado a serviço do catálogo, o grupo responsável pelo serviço recebe notificação in-app.

---

**KB-034** — Rascunho sem atividade por 30 dias: alerta ao autor
Artigo com status DRAFT ou DRAFT_AI sem edição por 30 dias gera alerta ao autor para atualizar ou descartar.

---

**KB-035** — Artigo gerado por projeto: visível somente após revisão
Artigos LESSON_LEARNED gerados automaticamente ao encerrar projeto ficam em DRAFT_AI e não são visíveis até edição humana e aprovação.

---

**KB-036** — Exportação de artigos em PDF disponível para todos
Qualquer artigo PUBLISHED pode ser exportado em PDF pelo usuário autenticado para uso offline ou compartilhamento.

---

**KB-037** — Busca por tag exata retorna apenas artigos com a tag completa
A busca por tag não faz match parcial. Tag "vpn" não retorna artigos com tag "vpn-corporativa". Busca full-text no conteúdo cobre termos parciais.

---

**KB-038** — Contribuição da equipe visível nos relatórios
O relatório mensal exibe o número de artigos criados, revisados e publicados por cada membro da equipe (sem dados de avaliação individual).

---

**KB-039** — Artigo de FAQ: formato pergunta-resposta obrigatório
Artigos do tipo FAQ devem ter o conteúdo estruturado com perguntas e respostas. Template de FAQ deve ser seguido.

---

**KB-040** — Artigo com `origin = INCIDENT_AUTO` e sem resolução documentada: não criado
A criação automática de rascunho só ocorre quando `resolution_notes` do incidente tem mínimo de 30 caracteres. Incidentes com notas genéricas não geram artigo KB.

---

**KB-041** — Sugestão automática: máximo de 5 artigos por momento de sugestão
O card de sugestão exibe no máximo 5 artigos para não sobrecarregar visualmente o formulário de abertura de chamado.

---

**KB-042** — Artigo pode ter múltiplos serviços vinculados
Um único artigo pode ser vinculado a múltiplos serviços do catálogo quando a solução se aplica a mais de um serviço.

---

**KB-043** — Busca retorna apenas artigos PUBLISHED (padrão)
A busca padrão retorna apenas artigos com status PUBLISHED da audiência compatível com o papel do usuário. Artigos DRAFT e UNDER_REVIEW são visíveis apenas para IT_TECHNICIAN+.

---

**KB-044** — Comentários em artigos: habilitados para IT_TECHNICIAN+
Técnicos podem adicionar comentários contextuais em artigos publicados (ex.: "Funciona também no Windows 11"). Comentários são moderados pelo IT_SPECIALIST.

---

**KB-045** — Artigo de referência: versão do produto monitorada
Artigos de referência vinculados a um produto específico geram alerta ao autor quando uma nova versão do produto é lançada (se o produto estiver no inventário de ativos).

---

**KB-046** — Feedback de texto em avaliação: opcional mas incentivado
Ao clicar em "Não Útil", o sistema exibe campo de texto opcional: "O que faltou neste artigo?" Feedbacks registrados para análise editorial.

---

**KB-047** — Relatório mensal de qualidade gerado automaticamente
No primeiro dia útil de cada mês, relatório de qualidade da KB (helpful_rate, artigos vencidos, deflexões) gerado e enviado ao IT_MANAGER.

---

**KB-048** — Artigo pode ser impresso (print-friendly)
A visualização do artigo inclui botão de impressão que remove o menu de navegação e exibe o conteúdo em formato otimizado para impressão em PDF.

---

**KB-049** — Artigos com histórico de incidentes vinculados visível para IT_TECHNICIAN+
A página do artigo exibe, para técnicos, a lista dos últimos 10 incidentes resolvidos usando este artigo, com link direto.

---

**KB-050** — Importação em lote de artigos via CSV/Markdown
O SUPER_ADMIN pode importar artigos em lote via planilha CSV ou arquivos Markdown para migração de bases de conhecimento existentes. Importados com status DRAFT para revisão individual.

---

## 21. Critérios de Aceitação

### 21.1 Workflow Editorial

- [ ] **CA-01:** Artigo não pode ser publicado sem passar por UNDER_REVIEW.
- [ ] **CA-02:** DRAFT_AI bloqueado na submissão para revisão sem edição humana detectada.
- [ ] **CA-03:** Badge "Gerado por IA" exibido em DRAFT_AI até edição humana.
- [ ] **CA-04:** Devolução para ajustes sem feedback bloqueada.
- [ ] **CA-05:** Artigo PUBLISHED sem `next_review_date` bloqueado na publicação.
- [ ] **CA-06:** Depreciação sem artigo substituto bloqueada.
- [ ] **CA-07:** Artigo PUBLISHED não pode ser deletado (soft-delete bloqueado).

### 21.2 Versionamento

- [ ] **CA-08:** Edição de artigo PUBLISHED cria nova versão DRAFT sem afetar o artigo publicado.
- [ ] **CA-09:** Histórico de versões exibe comparação visual (diff) entre versões.
- [ ] **CA-10:** Versão anterior arquivada automaticamente ao publicar nova versão.
- [ ] **CA-11:** Código KB-YYYY-NNNNNN imutável após criação.

### 21.3 Busca e Sugestão Automática

- [ ] **CA-12:** Busca retorna resultados em menos de 1,5 segundos.
- [ ] **CA-13:** Sugestão automática exibida durante preenchimento do título do chamado (debounce 300ms para busca, 1,5s para card).
- [ ] **CA-14:** Deflexão registrada ao usuário clicar "Isso resolveu meu problema".
- [ ] **CA-15:** KEDB exibido em banner destacado quando há erro conhecido para o serviço do incidente.
- [ ] **CA-16:** Artigos TECHNICAL não exibidos para usuários END_USER em nenhuma circunstância.

### 21.4 Geração Automática

- [ ] **CA-17:** Ao resolver incidente com `resolution_notes` ≥ 30 chars: busca semântica executada.
- [ ] **CA-18:** DRAFT_AI criado automaticamente quando não há artigo similar (threshold < 0,80).
- [ ] **CA-19:** Vinculação a artigo similar sugerida quando threshold ≥ 0,80.
- [ ] **CA-20:** Workaround publicado no módulo Problemas gera DRAFT_AI na KB em até 5 minutos.

### 21.5 Integrações

- [ ] **CA-21:** Incidente resolvido com artigo KB vinculado incrementa `resolution_count` do artigo.
- [ ] **CA-22:** Artigo de workaround depreciado automaticamente quando problema é RESOLVED.
- [ ] **CA-23:** Lições aprendidas de projeto encerrado geram DRAFT_AI na KB.
- [ ] **CA-24:** Política publicada no Compliance gera DRAFT_AI na KB.

### 21.6 Qualidade e Métricas

- [ ] **CA-25:** Helpful rate < 60% com ≥ 10 avaliações: flag `urgent_review` ativado e IT_MANAGER notificado.
- [ ] **CA-26:** Artigo sem visualização por 6 meses: sugestão de depreciação gerada.
- [ ] **CA-27:** Avaliação duplicada do mesmo usuário substitui voto anterior.
- [ ] **CA-28:** Dashboard exibe taxa de deflexão calculada corretamente.

### 21.7 Auditoria e Segurança

- [ ] **CA-29:** `audit_log` registra todos os eventos da KB com old/new values.
- [ ] **CA-30:** RLS impede UPDATE e DELETE em `audit_log`.
- [ ] **CA-31:** Artigo com senha em texto claro bloqueado na publicação.
- [ ] **CA-32:** Relatório mensal de qualidade gerado automaticamente no primeiro dia útil.

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação com 21 seções, 50 regras KB e 32 critérios de aceitação |

---

> **Próximos documentos recomendados:**
> [`40_INCIDENT_MANAGEMENT.md`](./40_INCIDENT_MANAGEMENT.md) — Incidentes (geração automática de artigos KB)
> [`42_PROBLEM_MANAGEMENT.md`](./42_PROBLEM_MANAGEMENT.md) — Problemas (KEDB e workarounds)
> [`50_DASHBOARDS.md`](./50_DASHBOARDS.md) — Dashboards consolidados do SGTI
