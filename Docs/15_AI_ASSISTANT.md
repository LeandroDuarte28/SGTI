# SGTI — Sistema de Gestão de Tecnologia da Informação
## Assistente Inteligente — Arquitetura Funcional e Técnica

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [12_ARCHITECTURE.md](./12_ARCHITECTURE.md) · [14_SECURITY_REQUIREMENTS.md](./14_SECURITY_REQUIREMENTS.md) · [13_NON_FUNCTIONAL_REQUIREMENTS.md](./13_NON_FUNCTIONAL_REQUIREMENTS.md)

---

## Sobre este Documento

Este documento especifica a **arquitetura funcional e técnica do Assistente Inteligente do SGTI** — uma camada de inteligência artificial desacoplada do núcleo do sistema, projetada para amplificar a produtividade de analistas, gestores e usuários finais durante a utilização da plataforma.

O Assistente é concebido segundo o princípio de **augmentação** — não de substituição. Ele apoia decisões, sugere ações e sintetiza informações, mas a decisão final permanece sempre com o ser humano. Nenhuma ação do Assistente produz efeito no sistema sem confirmação explícita do usuário.

### Posicionamento Estratégico

```
Sem Assistente Inteligente:          Com Assistente Inteligente:
                                     
Técnico abre chamado                 Técnico abre chamado
  → busca manualmente na KB            → Assistente sugere 3 artigos
  → não encontra solução               → Técnico seleciona 1 artigo
  → escala o chamado                   → Problema resolvido em 15min
  → MTTR: 4 horas                      → MTTR: 45 minutos
```

---

## Sumário

1. [Visão Geral do Assistente](#1-visão-geral-do-assistente)
2. [Arquitetura Técnica](#2-arquitetura-técnica)
3. [Funcionalidades do Assistente](#3-funcionalidades-do-assistente)
4. [Fluxos de Interação](#4-fluxos-de-interação)
5. [Segurança e Privacidade](#5-segurança-e-privacidade)
6. [Controle de Acesso](#6-controle-de-acesso)
7. [Custos e Gestão de Consumo](#7-custos-e-gestão-de-consumo)
8. [Regras de Negócio](#8-regras-de-negócio)
9. [Indicadores de Performance (KPIs)](#9-indicadores-de-performance-kpis)
10. [Estratégia de Evolução Futura](#10-estratégia-de-evolução-futura)

---

## 1. Visão Geral do Assistente

### 1.1 Propósito

O **Assistente Inteligente do SGTI** é uma camada de serviço de IA que se integra transversalmente a todos os módulos do sistema, provendo capacidades de análise semântica, síntese de informação e recomendação contextual sem substituir nenhuma funcionalidade existente.

**O que o Assistente faz:**
- Sugere artigos da Base de Conhecimento com base no contexto do chamado em aberto.
- Resume incidentes, auditorias e projetos complexos em linguagem executiva.
- Identifica soluções semelhantes em chamados históricos resolvidos.
- Auxilia na análise de conformidade e evidências de compliance.
- Sintetiza indicadores financeiros com interpretação contextualizada.
- Gera rascunhos de artigos para a Base de Conhecimento ao encerrar chamados.

**O que o Assistente não faz:**
- Não executa ações no sistema sem confirmação explícita do usuário.
- Não acessa dados fora do escopo de autorização do usuário autenticado.
- Não armazena conversas para treinamento de modelos externos sem consentimento.
- Não substitui julgamento humano em decisões críticas (aprovações, descomissionamento, compliance).

### 1.2 Perfis Atendidos

| Perfil | Contexto de Uso | Funcionalidades Principais |
|--------|----------------|--------------------------|
| **Técnico de TI** | Atendimento de chamados | Sugestão de artigos, sugestão de solução, geração de artigo |
| **Especialista de TI** | Investigação de problemas | Busca inteligente, resumo de incidentes, análise de causa raiz |
| **Gestor de TI** | Coordenação operacional | Resumo executivo, tendências, riscos operacionais |
| **Analista de Compliance** | Revisão de controles | Assistente de compliance, análise de apontamentos |
| **Analista Financeiro** | Análise de custos | Assistente financeiro, análise de OPEX/CAPEX |
| **Usuário Final** | Autoatendimento | Busca inteligente na KB, perguntas frequentes |
| **Diretor / C-Level** | Visão estratégica | Resumo executivo, indicadores, riscos |

### 1.3 Modos de Operação

O Assistente opera em dois modos complementares:

**Modo Reativo (Triggered):**
Acionado automaticamente por eventos do sistema — abertura de chamado, encerramento de incidente, upload de evidência. O Assistente analisa o contexto e apresenta sugestões sem intervenção do usuário.

**Modo Interativo (Chat):**
Interface de conversa natural disponível em todas as páginas do SGTI. O usuário formula perguntas em linguagem natural e o Assistente responde com base nos dados do sistema, respeitando o escopo de autorização do usuário.

---

## 2. Arquitetura Técnica

### 2.1 Princípio de Desacoplamento

O Assistente Inteligente é implementado como um **serviço desacoplado** do núcleo do SGTI, comunicando-se exclusivamente via:
- Eventos de domínio publicados pelo EventBus do SGTI (modo reativo).
- Chamadas REST ao backend do SGTI (modo interativo).
- APIs externas de LLM via camada de abstração (AIProviderPort).

O núcleo do SGTI não conhece o Assistente. O Assistente conhece o núcleo via interfaces públicas. Isso garante que:
- O Assistente pode ser desativado sem afetar nenhuma funcionalidade do SGTI.
- Troca de provedor de IA (OpenAI → Anthropic → Gemini) não requer alteração no núcleo.
- Falha do Assistente não afeta a disponibilidade do sistema principal.

### 2.2 Diagrama de Arquitetura

```
┌──────────────────────────────────────────────────────────────────────┐
│                          SGTI (Núcleo)                               │
│                                                                      │
│   IncidentModule  │  KnowledgeModule  │  ComplianceModule  │  ...    │
│                   │                   │                    │         │
│              EventBus (publish)   REST API (read)          │         │
└───────────────┬───────────────────┬────────────────────────┘         │
                │                   │                                  │
                ▼                   ▼                                  │
┌──────────────────────────────────────────────────────────────────────┐
│                    AI ASSISTANT SERVICE                               │
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────────┐   │
│  │  EventListener │  │  ChatController │  │  TriggeredSuggestion │   │
│  │  (reativo)     │  │  (interativo)  │  │  Controller          │   │
│  └───────┬────────┘  └───────┬────────┘  └──────────┬───────────┘   │
│          │                   │                        │              │
│          └───────────────────┴────────────────────────┘              │
│                               │                                      │
│                   ┌───────────▼───────────┐                         │
│                   │  AssistantOrchestrator │                         │
│                   │  (Use Cases de IA)    │                         │
│                   └───────────┬───────────┘                         │
│                               │                                      │
│          ┌────────────────────┼────────────────────┐                │
│          │                    │                    │                │
│  ┌───────▼──────┐  ┌──────────▼────────┐  ┌───────▼──────┐        │
│  │ContextBuilder│  │  PromptEngine     │  │ ResponseParser│        │
│  │ (monta ctx)  │  │  (monta prompts)  │  │ (processa resp│        │
│  └───────┬──────┘  └──────────┬────────┘  └───────┬──────┘        │
│          │                    │                    │                │
│          └────────────────────┴────────────────────┘                │
│                               │                                      │
│                   ┌───────────▼───────────┐                         │
│                   │   AIProviderPort       │                         │
│                   │   (interface pura)     │                         │
│                   └───────────┬───────────┘                         │
│                               │                                      │
│          ┌────────────────────┼────────────────────┐                │
│          │                    │                    │                │
│  ┌───────▼──────┐  ┌──────────▼────────┐  ┌───────▼──────┐        │
│  │ AnthropicAdapt│  │  OpenAIAdapter   │  │ GeminiAdapter │        │
│  │ (Prod/Primary)│  │  (Alternativo)   │  │ (Alternativo) │        │
│  └──────────────┘  └──────────────────┘  └──────────────┘        │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  AIUsageLogger  │  RateLimiter  │  CostTracker  │  AuditLog  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
       ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
       │  Anthropic  │  │   OpenAI    │  │Google Gemini│
       │  Claude API │  │   GPT-4o    │  │   API       │
       └─────────────┘  └─────────────┘  └─────────────┘
```

### 2.3 Componentes do AI Assistant Service

#### AssistantOrchestrator

Componente central que coordena todos os casos de uso de IA. Recebe o contexto (módulo, usuário, dados relevantes) e decide qual pipeline de IA acionar.

**Use Cases:**
- `SuggestKnowledgeArticlesUseCase`
- `IntelligentSearchUseCase`
- `GenerateSummaryUseCase`
- `SuggestSolutionUseCase`
- `GenerateArticleDraftUseCase`
- `AnalyzeComplianceUseCase`
- `AnalyzeFinancialDataUseCase`
- `GenerateExecutiveBriefingUseCase`

#### ContextBuilder

Monta o contexto a ser enviado ao LLM, coletando dados relevantes do SGTI via chamadas ao backend. Aplica filtragem de dados conforme o escopo de autorização do usuário:
- Dados do chamado/incidente/projeto em questão.
- Artigos relevantes da KB (top 10 por similaridade).
- Histórico de chamados similares (últimos 30 dias, mesmo serviço/categoria).
- Metadados de configuração do módulo (SLAs, políticas).

#### PromptEngine

Mantém o repositório de templates de prompts por funcionalidade. Cada template é versionado e testado. Substitui variáveis de contexto e aplica instruções de sistema específicas por papel de usuário.

Estrutura de um prompt:

```
[SYSTEM PROMPT]
Você é o Assistente Inteligente do SGTI, um sistema corporativo de gestão
de serviços de TI baseado em ITIL v4. Você auxilia [PERFIL_DO_USUARIO].

Responda sempre em português brasileiro.
Seja objetivo e técnico. Máximo de [N] linhas para este tipo de resposta.
Nunca invente informações — baseie-se exclusivamente nos dados fornecidos.
Se não houver informação suficiente, diga explicitamente.

[CONTEXT]
{dados_relevantes_do_sgti}

[INSTRUCTION]
{instrução_específica_da_funcionalidade}

[USER_INPUT] (somente no modo interativo)
{pergunta_ou_solicitação_do_usuário}
```

#### ResponseParser

Processa a resposta do LLM e a transforma em estrutura de dados utilizável pelo frontend:
- Extrai sugestões em formato de lista quando aplicável.
- Valida que a resposta não contém dados que o usuário não deveria ver.
- Aplica filtro de conteúdo inadequado.
- Formata em JSON estruturado para consumo pelo frontend.

#### AIProviderPort

Interface de abstração que desacopla o Assistente do provedor de IA específico:

```typescript
interface IAIProviderPort {
  complete(request: AICompletionRequest): Promise<AICompletionResponse>
  streamComplete(request: AICompletionRequest): AsyncIterable<AIStreamChunk>
  estimateTokens(text: string): number
  getModelInfo(): AIModelInfo
}

interface AICompletionRequest {
  systemPrompt: string
  userMessage: string
  maxTokens: number
  temperature: number  // 0.0–1.0
  stream: boolean
}
```

### 2.4 Banco de Dados do Assistente

O AI Assistant Service utiliza tabelas dedicadas no schema `ai_assistant` do PostgreSQL:

```
ai_assistant.conversations
  id, user_id, module, entity_type, entity_id,
  started_at, ended_at, message_count, total_tokens_used

ai_assistant.messages
  id, conversation_id, role (user|assistant|system),
  content, tokens_used, provider, model, created_at

ai_assistant.suggestions
  id, user_id, module, entity_id, suggestion_type,
  content, accepted (bool), accepted_at, feedback_score,
  tokens_used, provider, created_at

ai_assistant.usage_log
  id, user_id, feature, provider, model,
  input_tokens, output_tokens, cost_usd, latency_ms,
  success (bool), error_message, created_at

ai_assistant.prompt_templates
  id, name, version, feature, role,
  system_prompt, instruction_template, max_tokens,
  temperature, is_active, created_at, updated_at
```

---

## 3. Funcionalidades do Assistente

### 3.1 Sugestão Automática de Artigos

**Trigger:** evento `IncidentOpened`, `ServiceRequestSubmitted` e ao digitar no formulário de abertura de chamado (debounce de 1,5 segundos após parar de digitar).

**Objetivo:** reduzir o MTTR ao apresentar artigos relevantes da Base de Conhecimento antes mesmo que o técnico comece a buscar manualmente.

#### Algoritmo de Relevância

```
Score(artigo) = 0.4 × similaridade_semântica(título_chamado, artigo.title)
              + 0.3 × match_categoria(chamado.category, artigo.category)
              + 0.2 × match_serviço(chamado.service, artigo.linkedServices)
              + 0.1 × popularidade_recente(artigo.viewCount_30d)

Threshold de exibição: Score ≥ 0.55
Máximo de sugestões: 5 artigos
```

**Fluxo:**

```
1. IncidentOpened publicado no EventBus
2. SuggestArticlesEventHandler consome o evento
3. ContextBuilder coleta: título, descrição, categoria, serviço do chamado
4. SuggestKnowledgeArticlesUseCase:
   a. Busca top 20 artigos por full-text search (PostgreSQL tsvector)
   b. Envia ao AIProviderPort para reranking semântico
   c. Aplica threshold de Score
   d. Retorna top 5 ordenados por relevância
5. Sugestões armazenadas em ai_assistant.suggestions (vinculadas ao incidentId)
6. Notificação via Supabase Realtime para o técnico atribuído
7. Frontend exibe card "Artigos Sugeridos" na página do incidente
```

**Contexto enviado ao LLM:**

```
INSTRUÇÃO: Dos artigos abaixo, selecione os que mais provavelmente
resolvem o problema descrito no chamado. Retorne apenas os IDs
dos artigos relevantes em ordem decrescente de relevância,
em formato JSON: {"relevant_articles": ["id1", "id2", "id3"]}.
Inclua apenas artigos com relevância clara. Máximo 5.

CHAMADO:
Título: {incident.title}
Descrição: {incident.description}
Categoria: {incident.category}
Serviço: {incident.service}

ARTIGOS CANDIDATOS:
[{id: "...", title: "...", excerpt: "..."}]
```

---

### 3.2 Busca Inteligente

**Objetivo:** permitir que usuários encontrem informação relevante em linguagem natural, sem precisar conhecer a taxonomia ou palavras-chave exatas da Base de Conhecimento.

**Fontes de busca disponíveis:**

| Fonte | Conteúdo | Disponível para |
|-------|----------|----------------|
| Base de Conhecimento | Artigos publicados, FAQs, procedimentos | Todos |
| Runbooks | Procedimentos de resposta a incidentes | IT_TECH+ |
| Workarounds | Soluções temporárias de problemas conhecidos | Todos |
| Artigos Técnicos | Documentação técnica interna | IT_SPEC+ |
| Chamados Resolvidos | Histórico de soluções aplicadas | IT_TECH+ |
| Políticas de Compliance | Normas e políticas de TI | COMPLIANCE_OFFICER+ |
| Procedimentos Operacionais | SOPs e guias operacionais | IT_TECH+ |

**Interface de busca:**

O usuário digita uma pergunta em linguagem natural no campo de busca global do SGTI. Exemplos:

```
"Como resetar senha do sistema ERP?"
"O que fazer quando a impressora não aparece na rede?"
"Qual é o procedimento de offboarding de funcionário?"
"Como calcular depreciação de ativo no sistema?"
```

**Pipeline de processamento:**

```
1. Usuário digita pergunta (mínimo 10 caracteres)
2. IntelligentSearchUseCase:
   a. full-text search inicial (PostgreSQL) → top 30 candidatos
   b. Reformulação da query pelo LLM para variantes semânticas
   c. Reranking dos candidatos por relevância semântica
   d. Filtro por escopo de autorização do usuário
3. Retorna top 10 resultados com:
   - score de relevância
   - trecho destacado (highlight)
   - tipo de fonte
   - link direto
4. Opção: "Não encontrou? Pergunte ao Assistente" → modo chat
```

**Resposta contextualizada (modo chat):**
Quando a busca não retorna resultados satisfatórios, o usuário pode optar por uma resposta direta do Assistente, que sintetiza as informações encontradas em texto coerente.

---

### 3.3 Resumo Automático

**Objetivo:** permitir que gestores e técnicos compreendam rapidamente o estado de chamados complexos, incidentes de longa duração, auditorias extensas e projetos em andamento.

#### 3.3.1 Resumo de Chamado / Incidente

**Trigger:** botão "Resumir Chamado" na página do incidente; ou automaticamente ao atingir 10+ comentários.

**Contexto enviado ao LLM:**

```
INSTRUÇÃO: Gere um resumo estruturado do incidente abaixo.
O resumo deve ter:
1. Situação atual (1 parágrafo)
2. Linha do tempo (lista de marcos)
3. Ações tomadas (lista)
4. Próximos passos sugeridos (lista)
5. Tempo total em aberto e status do SLA

Seja objetivo. Máximo 300 palavras.

INCIDENTE:
Título: {incident.title}
Status: {incident.status}
Prioridade: {incident.priority}
Aberto em: {incident.openedAt}
SLA: {incident.slaStatus} ({incident.minutesRemaining}min restantes)
Técnico: {incident.assignee}

COMENTÁRIOS (cronológico):
{incident.comments[].map(c => `[${c.createdAt}] ${c.author}: ${c.content}`)}

HISTÓRICO DE STATUS:
{incident.statusHistory}
```

**Formato de saída:**

```json
{
  "currentStatus": "string",
  "timeline": ["string"],
  "actionsTaken": ["string"],
  "nextSteps": ["string"],
  "slaAlert": "string | null",
  "generatedAt": "ISO8601"
}
```

#### 3.3.2 Resumo de Problema (Root Cause Analysis)

**Trigger:** botão "Resumir Análise" na página do problema.

**Conteúdo do resumo:**
- Incidentes vinculados (quantidade e padrão identificado).
- Hipóteses de causa raiz levantadas.
- Análise de causa raiz atual (método e conclusão).
- Workaround publicado (se houver).
- Status da solução definitiva.

#### 3.3.3 Resumo de Auditoria

**Trigger:** ao finalizar um ciclo de auditoria; ou botão "Resumir Auditoria" pelo COMPLIANCE_OFFICER.

**Conteúdo do resumo:**
- Escopo da auditoria (framework, período, responsável).
- Total de controles avaliados por status.
- Não-conformidades identificadas por severidade.
- Planos de ação em andamento.
- Score de maturidade resultante.
- Comparativo com auditoria anterior (se disponível).

#### 3.3.4 Resumo de Projeto

**Trigger:** botão "Resumir Projeto" na página do projeto; automaticamente no início de cada semana para projetos ativos.

**Conteúdo do resumo:**
- Status geral (verde/amarelo/vermelho) com justificativa.
- Marcos concluídos e pendentes.
- Riscos ativos.
- Desvio de prazo e orçamento.
- Entregas da semana anterior e próxima semana.

---

### 3.4 Sugestão de Solução

**Objetivo:** apresentar ao técnico as soluções mais prováveis para o incidente em aberto, baseando-se em chamados resolvidos historicamente e na Base de Conhecimento.

**Algoritmo:**

```
1. Extrair palavras-chave semânticas do chamado (título + descrição)
2. Buscar chamados resolvidos similares:
   - Mesma categoria de serviço
   - Resolução nos últimos 180 dias
   - Score de similaridade ≥ 0.60
   - Limite: 10 chamados
3. Buscar artigos da KB por similaridade semântica (top 5)
4. Enviar ao LLM com instrução de síntese de solução
5. Retornar lista de soluções candidatas com:
   - Descrição da solução
   - Fonte (chamado resolvido ou artigo KB)
   - Score de confiança (0–100%)
   - Link para a fonte
```

**Prompt de sugestão de solução:**

```
INSTRUÇÃO: Com base nos chamados resolvidos e artigos abaixo,
sugira as 3 soluções mais prováveis para o incidente em aberto.
Para cada solução, forneça:
- Descrição da solução (máximo 5 passos)
- Nível de confiança: ALTO (>80%), MÉDIO (50-80%), BAIXO (<50%)
- Fonte (ID do chamado ou artigo)

Se não houver solução clara, diga "Nenhuma solução similar encontrada".
Não invente soluções sem base nas fontes fornecidas.

INCIDENTE:
{incident.title}
{incident.description}

CHAMADOS RESOLVIDOS SIMILARES:
{resolvedIncidents.map(i => `[${i.id}] ${i.title} | Solução: ${i.resolution}`)}

ARTIGOS RELEVANTES DA KB:
{articles.map(a => `[${a.id}] ${a.title} | ${a.excerpt}`)}
```

**Feedback do usuário:**
Após aplicar ou rejeitar uma sugestão, o técnico pode pontuar a qualidade (👍 / 👎). Esse feedback é armazenado em `ai_assistant.suggestions.feedback_score` e utilizado para melhorar o ranking futuro.

---

### 3.5 Geração de Artigos para a Base de Conhecimento

**Objetivo:** transformar o conhecimento gerado durante a resolução de chamados em artigos estruturados para a KB, reduzindo o esforço manual de documentação.

**Trigger:**
- Automático: evento `IncidentResolved` com `resolution.solution` preenchido.
- Manual: botão "Gerar Artigo" ao resolver qualquer chamado ou problema.

**Fluxo:**

```
1. IncidentResolved publicado com solução documentada
2. GenerateArticleDraftUseCase:
   a. Verificar se já existe artigo similar publicado (threshold: 0.80)
   b. Se similar existe → sugerir vinculação ao artigo existente
   c. Se não existe → gerar rascunho de novo artigo
3. Rascunho criado em ai_assistant.draft_articles (não na KB ainda)
4. Notificação ao técnico: "Novo rascunho de artigo gerado para revisão"
5. Técnico revisa, ajusta e submete para aprovação editorial
6. Após aprovação: artigo publicado na KB e vinculado ao incidente
```

**Estrutura do artigo gerado:**

```markdown
# [Título gerado baseado no incidente]

## Problema
[Descrição do sintoma relatado pelo usuário]

## Ambiente
- Sistema/Serviço: [categoria do chamado]
- Versão/Configuração: [se informado na solução]

## Causa Raiz
[Causa identificada durante a resolução]

## Solução Passo a Passo
1. [Passo 1]
2. [Passo 2]
...

## Verificação
[Como confirmar que o problema foi resolvido]

## Observações
[Informações adicionais, workarounds conhecidos]

---
Gerado pelo Assistente Inteligente com base no incidente #{incident.id}
Requer revisão técnica antes da publicação.
```

**Prompt de geração:**

```
INSTRUÇÃO: Gere um artigo para a Base de Conhecimento com base
no incidente resolvido abaixo. O artigo deve ser:
- Claro para técnicos de nível intermediário
- Reproduzível (qualquer técnico deve conseguir seguir os passos)
- Objetivo — sem informações desnecessárias
- Em português brasileiro

NÃO inclua nomes de usuários ou dados pessoais.
NÃO inclua informações de credenciais ou segredos.
Gere apenas com base nas informações fornecidas.

INCIDENTE:
Título: {incident.title}
Categoria: {incident.category}
Serviço: {incident.service}
Descrição do problema: {incident.description}
Solução aplicada: {incident.resolution.solution}
Tempo de resolução: {incident.resolutionTimeHours}h
```

---

### 3.6 Assistente para Compliance

**Objetivo:** auxiliar o analista de compliance na análise de apontamentos, evidências e normas, reduzindo o tempo necessário para preparar relatórios de auditoria.

#### Funcionalidades

**Análise de Apontamentos:**
- Dado um apontamento de auditoria, o Assistente sugere:
  - Controles relacionados ao apontamento.
  - Evidências que podem ser coletadas para fechar o apontamento.
  - Referências à norma ou framework correspondente (LGPD, ISO 27001, ITIL v4).
  - Prazo razoável para implementação com base na severidade.

**Análise de Evidências:**
- Dado um arquivo de evidência carregado (PDF, imagem), o Assistente analisa:
  - Se a evidência é suficiente para o controle em questão.
  - Pontos de atenção ou informações faltantes.
  - Sugestão de complementação.

**Interpretação de Normas:**
- O analista pode perguntar em linguagem natural sobre a norma:
  - "O que o item 8.1 da ISO 27001 exige?"
  - "Quais controles cobrem o Art. 46 da LGPD?"
  - "Qual é o prazo da LGPD para responder uma solicitação de titular?"

**Geração de Relatório Narrativo:**
- Com base nos dados de uma auditoria concluída, gera narrativa executiva do resultado:
  - Resumo do escopo.
  - Principais achados positivos.
  - Não-conformidades críticas e respectivos riscos.
  - Recomendações prioritárias.
  - Comparativo com auditoria anterior.

**Contexto enviado (compliance):**
- Framework e controles selecionados.
- Status atual de cada controle.
- Evidências coletadas (metadados, não o arquivo em si — por privacidade).
- Histórico de não-conformidades do mesmo controle.
- Benchmark de maturidade da área.

---

### 3.7 Assistente Financeiro

**Objetivo:** auxiliar o analista financeiro e gestores na interpretação de dados financeiros de TI, identificando tendências, anomalias e oportunidades de otimização de custos.

#### Funcionalidades

**Análise de OPEX:**
- Identificar categorias com crescimento acima da média histórica.
- Sinalizar despesas recorrentes que superam o orçamento por mais de X%.
- Comparar custos de fornecedores similares.
- Sugerir contratos candidatos à renegociação com base no histórico.

**Análise de CAPEX:**
- Status do orçamento de projetos e aquisições.
- Ativos com ROI abaixo do esperado baseado em histórico de uso e custo.
- Sugestão de cronograma de renovação para ativos próximos do fim da vida útil.

**Análise de Custo por Dimensão:**
- Custo por ativo (TCO calculado: aquisição + manutenção + suporte).
- Custo por projeto (CAPEX + alocação de OPEX proporcional).
- Custo por fornecedor (histórico de faturas vs. SLAs cumpridos).
- Custo por centro de custo (rateio e desvios).

**Geração de Narrativa Financeira:**
- Para reuniões de revisão de orçamento, o Assistente gera:
  - Síntese do período (mês/trimestre).
  - Variâncias significativas com explicação.
  - Projeção do restante do período.
  - Alertas de risco orçamentário.

**Prompt financeiro:**

```
INSTRUÇÃO: Analise os dados financeiros de TI abaixo e forneça:
1. Resumo executivo do período (3–5 frases)
2. Principais desvios do orçamento (lista de até 5 itens)
3. Tendências identificadas (lista de até 3 itens)
4. Alertas de risco (lista de até 3 itens)
5. Recomendações de ação imediata (lista de até 3 itens)

Use linguagem clara para gestão — evite jargão técnico excessivo.
Baseie-se exclusivamente nos dados fornecidos.

PERÍODO: {period.start} a {period.end}
OPEX ORÇADO: R$ {opex.budgeted}
OPEX REALIZADO: R$ {opex.spent} ({opex.variancePercent}%)
CAPEX ORÇADO: R$ {capex.budgeted}
CAPEX REALIZADO: R$ {capex.spent} ({capex.variancePercent}%)
TOP 5 DESPESAS DO PERÍODO: {expenses.top5}
CONTRATOS A VENCER: {contracts.expiringSoon}
```

---

### 3.8 Assistente para Gestores

**Objetivo:** prover à gestão de TI e à alta direção uma visão sintetizada e interpretada dos indicadores operacionais, financeiros e estratégicos do SGTI, sem necessidade de análise manual de múltiplos relatórios.

#### Funcionalidades

**Resumo Executivo Diário/Semanal:**
Gerado automaticamente toda segunda-feira às 08h00 e enviado por e-mail para IT_MANAGER e EXECUTIVE:
- Status geral dos serviços críticos.
- Incidentes críticos da semana anterior.
- SLA global (% cumprimento).
- Top 3 problemas recorrentes.
- Alertas financeiros e de compliance.
- Projetos com risco.

**Análise de Tendências:**
O gestor pode perguntar em linguagem natural:
- "Qual serviço tem mais chamados nos últimos 30 dias?"
- "Há tendência de crescimento no volume de incidentes críticos?"
- "Quais técnicos têm os melhores tempos de resolução?"
- "O MTTR melhorou ou piorou em comparação ao mês passado?"

**Identificação de Riscos Operacionais:**
Baseado nos dados do sistema, o Assistente identifica:
- Serviços com SLA consistentemente em risco.
- Usuários sem revisão de acesso há mais de 90 dias.
- Ativos críticos com garantia próxima do vencimento.
- Contratos expirando sem tratativa registrada.
- Projetos com marcos atrasados.

**Benchmark Interno:**
- Comparativo de desempenho entre períodos (mês a mês, trimestre a trimestre).
- Evolução do MTTR por categoria.
- Evolução da satisfação do usuário (CSAT).
- Evolução da maturidade de compliance.

---

## 4. Fluxos de Interação

### 4.1 Fluxo Reativo — Sugestão ao Abrir Chamado

```
Usuário                 Frontend            AI Service         LLM Provider
   │                       │                    │                   │
   ├─ Preenche form ───────►│                    │                   │
   │  (título + desc)       │                    │                   │
   │                       │── debounce 1.5s ──►│                   │
   │                       │                    ├─ ContextBuilder   │
   │                       │                    │  (coleta KB top20)│
   │                       │                    ├─ PromptEngine     │
   │                       │                    ├─ AIProviderPort ──►│
   │                       │                    │                   ├─ reranking
   │                       │                    │◄── top 5 IDs ─────│
   │                       │                    ├─ ResponseParser   │
   │                       │◄── sugestões ──────│                   │
   │◄─ card "Artigos ──────│                    │                   │
   │   Sugeridos"          │                    │                   │
   │                       │                    │                   │
   ├─ Clica no artigo ─────►│ → navega para artigo KB               │
   │  OU ignora            │                    │                   │
   │                       │                    │                   │
   ├─ Submete chamado ─────►│                    │                   │
   │                       │── EventBus: ───────►│                   │
   │                       │   IncidentOpened    ├─ persiste sugestões
   │                       │                    │  em ai_assistant.suggestions
```

### 4.2 Fluxo Interativo — Chat do Assistente

```
Usuário                 Frontend            AI Service         LLM Provider
   │                       │                    │                   │
   ├─ Abre Chat ───────────►│                    │                   │
   │                       │── GET /ai/context ─►│                   │
   │                       │                    ├─ ContextBuilder   │
   │                       │                    │  (módulo atual,   │
   │                       │                    │   dados da página)│
   │◄─ Chat aberto ─────────│                    │                   │
   │                       │                    │                   │
   ├─ Digita pergunta ─────►│                    │                   │
   │                       │── POST /ai/chat ───►│                   │
   │                       │                    ├─ PromptEngine     │
   │                       │                    │  (monta prompt    │
   │                       │                    │   com contexto)   │
   │                       │                    ├─ AIProviderPort ──►│
   │                       │                    │  (streaming)      ├─ gera resposta
   │                       │◄── stream chunks ───│◄── stream ────────│
   │◄─ texto aparece ───────│                    │                   │
   │   progressivamente    │                    │                   │
   │                       │                    ├─ AIUsageLogger    │
   │                       │                    │  (registra tokens)│
   ├─ Feedbacks 👍/👎 ──────►│── POST /ai/feedback►│                   │
```

### 4.3 Fluxo de Fallback — Provedor Indisponível

```
AI Service                  Primary Provider         Fallback Provider
    │                            │                         │
    ├─ Request ──────────────────►│                         │
    │                            │  timeout > 10s          │
    │◄─── TIMEOUT ───────────────│                         │
    │                            │                         │
    ├─ Log: AI_PROVIDER_TIMEOUT  │                         │
    ├─ Increment circuit_breaker.failures                  │
    │                            │                         │
    │  [se failures > 5 em 5min] │                         │
    ├─ Circuit breaker OPEN ─────────────────────────────► │
    ├─ Request ──────────────────────────────────────────── ►│
    │◄─── Response ──────────────────────────────────────── │
    │                            │                         │
    │  [se fallback também falha]│                         │
    ├─ Retornar resposta de degradação graciosa            │
    │  "Assistente temporariamente indisponível."          │
    │  (Sistema principal continua funcionando)            │
```

---

## 5. Segurança e Privacidade

### 5.1 Dados que Nunca São Enviados ao LLM

Independentemente do contexto ou da funcionalidade solicitada, os seguintes dados **nunca** são incluídos no contexto enviado ao LLM externo:

| Dado Proibido | Categoria | Justificativa |
|---------------|-----------|--------------|
| Senhas e credenciais | Segredo | Risco crítico de segurança |
| Chaves de API e tokens | Segredo | Risco crítico de segurança |
| CPF, RG, data de nascimento | PII sensível | LGPD — dado desnecessário para o contexto |
| Dados financeiros bancários (contas, agências) | PII financeiro | LGPD |
| Dados de saúde | PII sensível | LGPD Art. 11 |
| E-mails pessoais (não corporativos) | PII | Minimização |
| IPs de usuários | PII | Desnecessário para a funcionalidade |
| Dados de colaboradores de outras organizações | PII terceiros | Sem base legal |
| Conteúdo de arquivos de evidência de compliance | Dado sensível | Arquivos enviados apenas por caminho; LLM recebe apenas metadados |
| Connection strings e configurações de infraestrutura | Segredo de infraestrutura | Risco crítico |

### 5.2 Filtragem e Sanitização de Contexto

O **ContextBuilder** aplica os seguintes filtros antes de enviar qualquer dado ao LLM:

```
1. WHITELIST DE CAMPOS: apenas campos explicitamente aprovados
   por tipo de entidade são incluídos no contexto.
   Ex: Incident → [title, description, category, status, priority]
       NÃO inclui: [reporterEmail, ipAddress, internalNotes]

2. PSEUDONIMIZAÇÃO: user_id substituído por referência anônima
   quando o dado pessoal não é necessário para a funcionalidade.
   Ex: "Técnico: Analista #A7823" em vez de "Técnico: João Silva"

3. TRUNCAGEM: textos longos são truncados para limitar tokens
   e reduzir exposição de dados.
   Ex: descrição de chamado: máximo 2.000 caracteres

4. REMOÇÃO DE PADRÕES SENSÍVEIS: regex para detectar e remover:
   - Padrões de CPF: \d{3}\.\d{3}\.\d{3}-\d{2}
   - Padrões de e-mail pessoal: @gmail.com, @hotmail.com, @yahoo.com
   - Padrões de IP: \d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}
   - Padrões de credenciais: password=, token=, key=, secret=
```

### 5.3 Dados Residuais nos Provedores de IA

| Provedor | Política de Retenção de Dados | DPA Disponível | Zero Data Retention |
|----------|------------------------------|----------------|---------------------|
| Anthropic Claude API | 30 dias por padrão; ZDR disponível no plano Enterprise | Sim | Disponível (Enterprise) |
| OpenAI API | 30 dias por padrão; ZDR disponível via API | Sim | Disponível via header |
| Google Gemini API | Conforme política Google Cloud | Sim (Google Cloud DPA) | Configurável |

**Requisito obrigatório:** antes do go-live do Assistente em produção, o DPA com o provedor de IA escolhido deve ser assinado e arquivado no módulo de Compliance do SGTI.

**Recomendação:** habilitar Zero Data Retention (ZDR) no provedor principal para garantir que nenhum dado do SGTI seja utilizado para treinamento de modelos.

### 5.4 Conformidade com LGPD

O uso do Assistente Inteligente é tratado como uma atividade de tratamento de dados pessoais sujeita à LGPD:

- **Base legal:** Legítimo interesse (Art. 7º, IX) para suporte ao trabalho dos colaboradores.
- **Mapeamento:** o Assistente deve ser incluído no Registro de Atividades de Tratamento (ROPA) da organização.
- **Transparência:** os colaboradores devem ser informados sobre o uso de IA no sistema (notificação no primeiro acesso).
- **Portabilidade:** histórico de conversas do Assistente incluído no export de dados pessoais do usuário.
- **Eliminação:** ao solicitar eliminação de dados, o histórico de conversas do AI Assistant deve ser incluído.

---

## 6. Controle de Acesso

### 6.1 Permissões por Funcionalidade

| Funcionalidade | END_USER | IT_TECH | IT_SPEC | IT_MGR | COMP_OFF | FIN_ANA | PROJ_MGR | EXEC | SUPER |
|----------------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Sugestão automática de artigos | ● | ● | ● | ● | ● | ● | ● | — | ● |
| Busca inteligente (KB pública) | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| Busca em chamados resolvidos | — | ● | ● | ● | — | — | — | — | ● |
| Resumo de chamado/incidente | — | ● | ● | ● | — | — | — | — | ● |
| Resumo de auditoria | — | — | — | ● | ● | — | — | — | ● |
| Resumo de projeto | — | — | ● | ● | — | — | ● | ● | ● |
| Sugestão de solução | — | ● | ● | ● | — | — | — | — | ● |
| Geração de artigo (KB) | — | ● | ● | ● | — | — | — | — | ● |
| Assistente de Compliance | — | — | — | ● | ● | — | — | — | ● |
| Assistente Financeiro | — | — | — | ● | — | ● | ● | ● | ● |
| Resumo Executivo | — | — | — | ● | ● | ● | ● | ● | ● |
| Análise de Tendências | — | — | — | ● | — | — | — | ● | ● |
| Identificação de Riscos | — | — | — | ● | — | — | — | ● | ● |
| Chat livre com Assistente | — | ● | ● | ● | ● | ● | ● | ● | ● |

**Legenda:** ● Permitido · — Sem acesso

### 6.2 Escopo de Dados no Chat

O Assistente responde apenas com dados que o usuário tem permissão de ver no SGTI. O ContextBuilder aplica o mesmo escopo de autorização do RBAC do sistema:

- Um técnico de TI não pode obter, via chat, dados financeiros que não veria na interface.
- Um usuário final não pode, via chat, obter dados de outros usuários.
- O Assistente não pode ser usado como vetor para bypass do controle de acesso.

**Validação técnica:**
- O `ContextBuilder` usa o `userId` e `role` do JWT do usuário para filtrar os dados antes de enviar ao LLM.
- O `ResponseParser` verifica se a resposta do LLM não contém padrões que sugiram dados além do escopo.

### 6.3 Auditoria de Uso

Toda interação com o Assistente é registrada em `ai_assistant.usage_log`:
- Quem usou (user_id).
- Qual funcionalidade.
- Qual provedor e modelo.
- Quantidade de tokens consumidos.
- Custo estimado em USD.
- Latência da resposta.
- Sucesso ou falha.

O log de uso é acessível para IT_MANAGER e SUPER_ADMIN via endpoint `GET /api/ai/usage` e no Dashboard Operacional.

---

## 7. Custos e Gestão de Consumo

### 7.1 Modelo de Custo por Funcionalidade

Estimativa de consumo de tokens por funcionalidade (baseado em uso típico):

| Funcionalidade | Input Tokens (est.) | Output Tokens (est.) | Custo/Uso (Claude Sonnet) |
|----------------|:-------------------:|:--------------------:|:-------------------------:|
| Sugestão de artigos (triagem) | ~800 | ~200 | ~USD 0.003 |
| Busca inteligente (reranking) | ~1.200 | ~400 | ~USD 0.005 |
| Resumo de chamado simples | ~2.000 | ~600 | ~USD 0.009 |
| Resumo de incidente complexo | ~5.000 | ~800 | ~USD 0.018 |
| Sugestão de solução | ~3.000 | ~600 | ~USD 0.011 |
| Geração de artigo | ~2.500 | ~1.500 | ~USD 0.014 |
| Assistente Compliance (análise) | ~4.000 | ~1.000 | ~USD 0.016 |
| Assistente Financeiro | ~3.500 | ~800 | ~USD 0.013 |
| Resumo Executivo | ~4.500 | ~1.200 | ~USD 0.017 |
| Chat livre (mensagem média) | ~2.000 | ~500 | ~USD 0.008 |

*Preços estimados baseados em Claude claude-sonnet-4-20250514 em junho/2026. Verificar preços atuais em anthropic.com/pricing.*

### 7.2 Limites de Consumo por Usuário e Período

Para controlar os custos, os seguintes limites são aplicados por papel:

| Papel | Requisições/dia | Tokens/mês | Chat msgs/dia |
|-------|:--------------:|:----------:|:-------------:|
| END_USER | 5 | 50.000 | 10 |
| IT_TECHNICIAN | 20 | 200.000 | 30 |
| IT_SPECIALIST | 40 | 400.000 | 50 |
| IT_MANAGER | 100 | 1.000.000 | 100 |
| COMPLIANCE_OFFICER | 50 | 500.000 | 50 |
| FINANCIAL_ANALYST | 50 | 500.000 | 50 |
| EXECUTIVE | 20 | 200.000 | 20 |
| SUPER_ADMIN | Ilimitado | Ilimitado | Ilimitado |

**Comportamento ao atingir o limite:**
- O usuário recebe mensagem informando o limite atingido e quando renova.
- Funcionalidades reativas (sugestão automática) são suspensas.
- Chat desabilitado até renovação do período.
- IT_MANAGER pode aumentar o limite de um usuário específico via configuração.

### 7.3 Dashboard de Custos de IA

Painel dedicado acessível para IT_MANAGER e SUPER_ADMIN:
- Custo total acumulado no mês (em USD).
- Custo por funcionalidade.
- Custo por usuário (top 10 consumidores).
- Custo por provedor/modelo.
- Projeção de custo para o fim do mês.
- Alerta configurável quando custo mensal supera threshold definido.

### 7.4 Estratégia de Otimização de Custos

**Cache de respostas:** respostas idênticas (mesmo contexto + mesma pergunta) são cacheadas por 24 horas, evitando chamadas redundantes ao LLM.

**Seleção de modelo por complexidade:**

| Complexidade da Tarefa | Modelo Recomendado | Custo Relativo |
|------------------------|-------------------|----------------|
| Triagem e reranking simples | Claude Haiku ou GPT-4o-mini | $ |
| Resumos e análises de médio porte | Claude Sonnet | $$ |
| Análises complexas de compliance e financeiro | Claude Sonnet ou GPT-4o | $$ |
| Geração de artigo completo | Claude Sonnet | $$ |
| Análise de documentos longos | Claude Sonnet (200k context) | $$$ |

**Chunking inteligente:** documentos longos são divididos em chunks com resumo progressivo em vez de enviar o documento inteiro ao LLM.

---

## 8. Regras de Negócio

### RN-AI-001 — Confirmação Humana Obrigatória para Ações

O Assistente **nunca executa ações no SGTI sem confirmação explícita do usuário**. Toda sugestão é apresentada como proposta — o usuário decide se aplica, modifica ou rejeita.

**Aplicação:** sugestão de solução, geração de artigo, aplicação de workaround, análise de compliance.

---

### RN-AI-002 — Transparência da Fonte

Toda resposta do Assistente que se baseia em dados do SGTI deve indicar a fonte:
- "Baseado nos chamados #1234 e #1289, resolvidos em fevereiro/2026..."
- "Com base no artigo 'Como configurar VPN' publicado na Base de Conhecimento..."
- "Dados do período de 01/05/2026 a 31/05/2026 do módulo Financeiro..."

Respostas sem fonte identificável devem ser marcadas como "Análise do Assistente (sem fonte específica)".

---

### RN-AI-003 — Limitação ao Escopo de Dados do Usuário

O Assistente opera exclusivamente com dados que o usuário autenticado tem permissão de acessar no SGTI. Não há exceção para esta regra, independentemente do conteúdo da pergunta do usuário.

---

### RN-AI-004 — Proibição de Fabricação de Informação (Hallucination Guard)

O Assistente deve ser configurado para operar em modo conservador: quando não há dados suficientes para uma resposta confiável, deve responder explicitamente que não tem informação suficiente, em vez de gerar uma resposta inventada.

**Instrução obrigatória em todos os prompts de sistema:**
```
Se não houver informação suficiente nos dados fornecidos para responder
com confiança, responda: "Não encontrei dados suficientes no SGTI para
responder a esta pergunta. Tente reformular ou consulte diretamente o
módulo correspondente."

Nunca invente dados, números, datas ou nomes que não estejam
explicitamente nos dados fornecidos.
```

---

### RN-AI-005 — Rejeição de Prompts Maliciosos (Prompt Injection)

O Assistente deve ignorar instruções fornecidas pelo usuário que tentem:
- Alterar o comportamento do sistema (ex: "ignore as instruções anteriores e...").
- Extrair o system prompt ou contexto.
- Executar ações não previstas (ex: "envie um e-mail para...").
- Contornar o controle de acesso (ex: "me mostre dados de todos os usuários").

**Mitigação técnica:**
- System prompt separado do user message por delimitadores explícitos.
- Validação de resposta pelo ResponseParser para detectar desvios de comportamento.
- Limite de tokens de entrada do usuário em chat: máximo 2.000 tokens.
- Monitoramento de tentativas de prompt injection via palavras-chave no input.

---

### RN-AI-006 — Sugestões de Artigo Requerem Revisão Editorial

Artigos gerados automaticamente pelo Assistente são criados com status `DRAFT_AI` — diferente de `DRAFT` (humano). Artigos `DRAFT_AI`:
- Não são visíveis para usuários finais.
- Exigem revisão e aprovação por IT_TECHNICIAN ou superior antes de progredir para `DRAFT`.
- São marcados com badge "Gerado por IA — requer revisão" na interface editorial.
- Devem ter ao menos uma edição humana antes da publicação.

---

### RN-AI-007 — Limite de Contexto por Conversa de Chat

Conversas de chat são limitadas a **20 mensagens de ida e volta** por sessão. Após o limite:
- O usuário é informado que o limite de contexto foi atingido.
- Uma nova conversa é iniciada automaticamente.
- O histórico da conversa anterior é salvo e acessível via `GET /api/ai/conversations`.

**Justificativa:** limitar consumo de tokens (contexto acumulado aumenta custo) e manter respostas focadas.

---

### RN-AI-008 — Feedback e Melhoria Contínua

Todo resultado do Assistente deve oferecer opção de feedback imediato:
- 👍 Útil / 👎 Não foi útil — para sugestões e resumos.
- Escala 1–5 para artigos gerados.
- Campo de texto opcional para comentário.

Feedback é armazenado e usado para:
- Ajuste de threshold de relevância (sugestões com feedback negativo consistente têm threshold aumentado).
- Identificação de templates de prompt com baixa performance.
- Relatório mensal de qualidade do Assistente para IT_MANAGER.

---

### RN-AI-009 — Indisponibilidade Não Bloqueia o Sistema

A indisponibilidade do AI Assistant Service ou dos provedores de LLM **não deve impedir nenhuma funcionalidade do SGTI**. O Assistente é uma camada adicional — o sistema funciona normalmente sem ele.

**Comportamento em falha:**
- Sugestões automáticas: não exibidas (sem mensagem de erro ao usuário).
- Chat: exibe "Assistente temporariamente indisponível. Tente novamente mais tarde."
- Resumos: botão de resumo desabilitado com tooltip explicativo.
- Alertas de degradação registrados no health check (`GET /api/health`).

---

### RN-AI-010 — Registro e Auditabilidade de Uso

Todo uso do Assistente é registrado para fins de auditoria, conformidade com LGPD e controle de custos. O usuário pode acessar seu histórico de conversas via `GET /api/ai/my-conversations`. Dados de uso são retidos por **1 ano**.

---

### RN-AI-011 — Idioma e Tom

O Assistente responde **exclusivamente em português brasileiro**, independentemente do idioma do input do usuário. O tom é:
- **Técnico** quando respondendo a técnicos e especialistas.
- **Executivo** (conciso, sem jargão) quando respondendo a gestores e diretores.
- **Simples e direto** quando respondendo a usuários finais.

O papel do usuário (extraído do JWT) determina o tom automaticamente via variável no system prompt.

---

### RN-AI-012 — Operação Offline do Assistente (Graceful Degradation)

Quando o provedor de IA principal estiver indisponível, o sistema tenta o provedor secundário. Se ambos falharem, o Assistente opera em **modo básico**:
- Busca textual convencional substitui a busca semântica.
- Sugestão de artigos via full-text search (sem reranking semântico).
- Sem resumos, sem análises, sem chat.
- Sem custo adicional (operação local).

---

## 9. Indicadores de Performance (KPIs)

### 9.1 KPIs de Utilização

| KPI | Descrição | Meta | Frequência |
|-----|-----------|------|-----------|
| **Taxa de Adoção** | % de chamados abertos que tiveram ao menos 1 sugestão visualizada | ≥ 70% | Mensal |
| **Usuários Ativos do Assistente** | Quantidade de usuários únicos que usaram o Assistente no período | Crescimento mensal | Mensal |
| **Sessões de Chat por Semana** | Número de conversas de chat iniciadas | Tendência crescente | Semanal |
| **Funcionalidades Mais Usadas** | Ranking de funcionalidades por volume de uso | — | Mensal |
| **Taxa de Ativação Reativa** | % de eventos que geraram sugestão automática | ≥ 90% | Semanal |

### 9.2 KPIs de Efetividade

| KPI | Descrição | Meta | Frequência |
|-----|-----------|------|-----------|
| **Taxa de Aceitação de Sugestões** | % de sugestões de artigo clicadas ou aceitas / total de sugestões exibidas | ≥ 35% | Mensal |
| **Taxa de Aceitação de Solução** | % de soluções sugeridas que foram aplicadas e resolveram o chamado | ≥ 25% | Mensal |
| **CSAT de Sugestões** | Nota média de qualidade das sugestões (escala 1–5) | ≥ 4,0 | Mensal |
| **Taxa de Artigos Gerados Publicados** | % de rascunhos de IA que chegaram ao status PUBLISHED | ≥ 40% | Mensal |
| **Precisão de Busca Inteligente** | % de buscas onde o usuário clicou em um dos top 3 resultados | ≥ 60% | Mensal |
| **Taxa de Rejeição** | % de respostas marcadas como 👎 | ≤ 15% | Mensal |

### 9.3 KPIs de Impacto Operacional

| KPI | Descrição | Baseline | Meta 6 meses | Frequência |
|-----|-----------|---------|-------------|-----------|
| **Redução de MTTR (Assistência)** | Diferença no MTTR médio de chamados com vs. sem Assistente | A medir | -20% | Mensal |
| **Reutilização da KB** | % de chamados vinculados a artigo da KB (via Assistente ou manual) | < 10% (estimado) | ≥ 35% | Mensal |
| **Tempo de Busca** | Tempo médio entre abertura do chamado e primeiro acesso à KB | A medir | -40% | Mensal |
| **Taxa de Autoatendimento** | % de chamados END_USER resolvidos após visualizar sugestão do Assistente | 0% | ≥ 15% | Mensal |
| **Artigos Gerados por IA** | Quantidade de artigos publicados com origem em geração por IA | 0 | ≥ 5/mês | Mensal |

### 9.4 KPIs de Custo e Performance Técnica

| KPI | Descrição | Meta | Frequência |
|-----|-----------|------|-----------|
| **Custo Médio por Interação** | Custo médio em USD por uso do Assistente | ≤ USD 0.015 | Mensal |
| **Latência Média do Assistente** | Tempo médio de resposta (p50) do Assistente | ≤ 3 segundos | Semanal |
| **Latência p95 do Assistente** | Percentil 95 do tempo de resposta | ≤ 8 segundos | Semanal |
| **Taxa de Erro do Assistente** | % de requisições que resultaram em erro | ≤ 2% | Semanal |
| **Taxa de Fallback** | % de requisições que usaram provedor secundário | ≤ 5% | Mensal |
| **Tokens por Interação** | Média de tokens (input+output) por interação | ≤ 5.000 | Mensal |

### 9.5 Dashboard de KPIs do Assistente

Painel dedicado acessível via `IT_MANAGER` e `SUPER_ADMIN` em `/dashboard/ai-assistant`:
- Visão geral de adoção e efetividade.
- Gráfico de utilização por funcionalidade e período.
- Tabela de top 10 usuários por consumo.
- Métricas de custo com projeção mensal.
- Alertas de qualidade (sugestões com alto índice de rejeição).
- Comparativo de MTTR: chamados com Assistente vs. sem Assistente.

---

## 10. Estratégia de Evolução Futura

### 10.1 Roadmap do Assistente

```
FASE 1 — MVP (Lançamento)
├── Sugestão automática de artigos (evento-driven)
├── Busca inteligente semântica na KB
├── Resumo de chamado/incidente
├── Chat básico com contexto da página atual
└── Provedor: Anthropic Claude Sonnet (primário)

FASE 2 — Expansão (3–6 meses após MVP)
├── Sugestão de solução com histórico de chamados
├── Geração automática de artigos
├── Assistente de Compliance (apontamentos + normas)
├── Resumo Executivo automatizado semanal
└── Dashboard de KPIs do Assistente

FASE 3 — Inteligência Avançada (6–12 meses)
├── Assistente Financeiro completo
├── Análise preditiva de risco operacional
├── Detecção de anomalias em volumes de chamados
├── Sugestão proativa de controles de compliance
└── Multi-provedor com seleção dinâmica por custo/performance

FASE 4 — Agente Autônomo (12–24 meses)
├── Capacidade de executar ações com aprovação (agentic mode)
├── Integração com GLPI via IA (triagem automática)
├── Análise de causa raiz assistida por IA
└── Personalização de prompts por usuário (fine-tuning contextual)
```

### 10.2 Estratégia Multi-Provedor

O design do `AIProviderPort` permite trocar ou combinar provedores sem alterar nenhuma lógica de negócio:

```
Cenário 1 — Provedor Único (MVP):
  Anthropic Claude Sonnet → todas as funcionalidades

Cenário 2 — Multi-Provedor por Custo (Fase 3):
  Baixa complexidade → Claude Haiku (menor custo)
  Média complexidade → Claude Sonnet (equilíbrio)
  Alta complexidade → Claude Sonnet (200k context)

Cenário 3 — Multi-Provedor por Resiliência (Fase 3):
  Primário: Anthropic Claude
  Fallback: OpenAI GPT-4o
  Emergência: Google Gemini 1.5 Pro

Cenário 4 — Modelo Local (Fase 4, opcional):
  Para dados ultra-sensíveis: modelo open-source local
  (Llama, Mistral) rodando on-premise sem enviar dados a nuvem
```

### 10.3 Evolução para Modo Agente (Agentic Mode)

Na Fase 4, o Assistente evolui de ferramenta de análise para agente com capacidade de execução:

**Capacidades agente planejadas:**
- Criar rascunho de chamado a partir de descrição em linguagem natural.
- Agendar manutenção de ativo após análise do histórico.
- Gerar e submeter relatório de compliance para aprovação.
- Iniciar fluxo de revisão de acesso para usuários em risco.

**Controles obrigatórios para modo agente:**
- Toda ação proposta exige confirmação explícita do usuário (nenhuma ação silenciosa).
- Limite de escopo: agente só acessa módulos que o usuário tem permissão.
- Log auditável de cada ação executada pelo agente.
- Capacidade de desfazer ação dentro de 5 minutos (onde tecnicamente viável).
- Aprovação do SUPER_ADMIN para habilitar modo agente na instância.

### 10.4 Modelo de Dados para Evolução

O schema `ai_assistant` foi projetado para suportar as fases futuras:

```
Fase 1 → Tabelas: conversations, messages, suggestions, usage_log
Fase 2 → + prompt_templates (já criada), article_drafts
Fase 3 → + model_performance_metrics, provider_routing_rules
Fase 4 → + agent_actions, agent_approvals, agent_execution_log
```

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição da Alteração |
|--------|------|-------|------------------------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação do documento |

---

> **Próximos documentos recomendados:**
> [`12_ARCHITECTURE.md`](./12_ARCHITECTURE.md) — Arquitetura do núcleo do SGTI (EventBus, módulos)
> [`14_SECURITY_REQUIREMENTS.md`](./14_SECURITY_REQUIREMENTS.md) — Requisitos de segurança aplicáveis ao Assistente
> [`80_IMPLEMENTATION_ORDER.md`](./80_IMPLEMENTATION_ORDER.md) — O Assistente é implementado após as fases principais do SGTI
