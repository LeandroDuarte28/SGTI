# SGTI — Sistema de Gestão de Tecnologia da Informação
## Módulo de Gestão de Incidentes — Documentação Funcional

> **Classificação:** Interno — Restrito
> **Versão:** 2.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [24_BUSINESS_RULES.md](./24_BUSINESS_RULES.md) · [31_SLA.md](./31_SLA.md) · [30_SERVICE_CATALOG.md](./30_SERVICE_CATALOG.md) · [23_USER_ROLES.md](./23_USER_ROLES.md) · [20_DATABASE.md](./20_DATABASE.md)

---

## Sobre este Documento

Este documento define a **especificação funcional completa do Módulo de Gestão de Incidentes do SGTI**, cobrindo conceito, objetivos, estrutura, fluxos, integrações, regras de negócio e critérios de aceitação.

**Escopo exclusivo:** documentação funcional e de processo. Código-fonte, SQL e especificações de API estão em documentos separados. Nenhuma linha de código é gerada aqui.

---

## Sumário

1. [Conceito de Incidente](#1-conceito-de-incidente)
2. [Objetivos do Módulo](#2-objetivos-do-módulo)
3. [Papéis e Responsabilidades](#3-papéis-e-responsabilidades)
4. [Estrutura do Incidente](#4-estrutura-do-incidente)
5. [Classificação](#5-classificação)
6. [Priorização — Matriz Impacto × Urgência](#6-priorização--matriz-impacto--urgência)
7. [Fluxo de Atendimento](#7-fluxo-de-atendimento)
8. [Escalonamento](#8-escalonamento)
9. [Transferência de Incidentes](#9-transferência-de-incidentes)
10. [Integração com SLA](#10-integração-com-sla)
11. [Integração com Catálogo de Serviços](#11-integração-com-catálogo-de-serviços)
12. [Integração com Gestão de Ativos](#12-integração-com-gestão-de-ativos)
13. [Integração com GLPI](#13-integração-com-glpi)
14. [Integração com Base de Conhecimento](#14-integração-com-base-de-conhecimento)
15. [Integração com Gestão de Problemas](#15-integração-com-gestão-de-problemas)
16. [Notificações](#16-notificações)
17. [Incidentes Críticos — Severidade 1](#17-incidentes-críticos--severidade-1)
18. [Auditoria e Rastreabilidade](#18-auditoria-e-rastreabilidade)
19. [Dashboards e Indicadores](#19-dashboards-e-indicadores)
20. [Relatórios](#20-relatórios)
21. [Regras de Negócio](#21-regras-de-negócio)
22. [Critérios de Aceitação](#22-critérios-de-aceitação)

---

## 1. Conceito de Incidente

### 1.1 Definição ITIL v4

> **Incidente** é uma **interrupção não planejada** de um serviço de TI ou uma **redução na qualidade** de um serviço de TI. Também é incidente a falha de um item de configuração que ainda não afetou o serviço.
>
> — ITIL v4, AXELOS

No contexto do SGTI, um incidente é qualquer situação em que:

- Um serviço de TI que deveria estar funcionando **parou de funcionar** total ou parcialmente.
- A **qualidade de um serviço** caiu abaixo do nível acordado no SLA.
- Um **equipamento ou componente** apresentou falha, mesmo que ainda não tenha causado interrupção visível ao usuário.
- Um **comportamento anômalo** de sistema ou infraestrutura foi detectado pela equipe técnica antes de causar impacto (incidente pró-ativo).

### 1.2 Incidente vs. Requisição vs. Problema

| Conceito | Definição | Exemplos |
|----------|-----------|---------|
| **Incidente** | Algo que estava funcionando **parou de funcionar** | VPN parou de conectar; impressora offline; sistema lento |
| **Requisição de Serviço** | Solicitação de algo **novo ou adicional** | Instalar software; criar conta; solicitar equipamento |
| **Problema** | **Causa raiz** de um ou mais incidentes recorrentes | VPN cai toda semana (causa: certificado sem renovação automática) |

> **Regra de ouro:** Se o usuário diz "parou de funcionar" ou "não consigo acessar", é incidente. Se diz "quero", "preciso", "gostaria" ou "solicito", é requisição.

### 1.3 Incidente Reativo vs. Pró-Ativo

| Tipo | Origem | Exemplo |
|:----:|--------|---------|
| **Reativo** | Usuário reporta o problema | "A impressora do 3º andar não imprime" |
| **Pró-ativo** | Monitoramento detecta antes do usuário | Alerta: uso de CPU acima de 90% no servidor ERP por 10 minutos |

Ambos os tipos são tratados com o mesmo fluxo. A diferença está no campo **Origem** (`PORTAL` para reativo, `MONITORING` para pró-ativo).

### 1.4 Princípios Fundamentais — ITIL v4 Aplicados

| Princípio ITIL v4 | Aplicação no Módulo |
|-------------------|---------------------|
| **Foco no Valor** | Cada incidente resolvido restaura produtividade e valor ao negócio |
| **Comece onde você está** | Registrar imediatamente sem aguardar informações completas |
| **Progrida iterativamente** | Atualizar o incidente a cada ação, sem esperar a solução final |
| **Colabore e promova visibilidade** | Status transparente para todos os stakeholders |
| **Pense holisticamente** | Avaliar impacto em outros serviços e usuários ao classificar |
| **Mantenha simples e prático** | Formulário mínimo de abertura; enriquecer durante o atendimento |
| **Otimize e automatize** | SLA calculado automaticamente; notificações sem intervenção manual |

---

## 2. Objetivos do Módulo

### 2.1 Objetivo Primário

Restaurar a operação normal dos serviços de TI **o mais rapidamente possível**, minimizando o impacto adverso nas operações de negócio e garantindo os níveis de serviço acordados, com conformidade total ao processo ITIL v4.

### 2.2 Objetivos Específicos

| # | Objetivo | Indicador | Meta |
|---|----------|-----------|:----:|
| 1 | Registrar todos os incidentes formalmente | % de atendimentos registrados no SGTI | 100% |
| 2 | Classificar e priorizar de forma consistente | % com prioridade corretamente calculada pela matriz I×U | 100% |
| 3 | Atender dentro dos prazos de SLA | % resolvidos dentro do prazo | ≥ 95% |
| 4 | Comunicar status proativamente | Notificação em cada transição de status | 100% |
| 5 | Documentar soluções para reutilização | % de incidentes com artigo KB vinculado | ≥ 60% |
| 6 | Identificar padrões para análise de Problema | % de incidentes recorrentes vinculados a Problema | 100% |
| 7 | Manter trilha de auditoria completa | % das operações registradas no audit_log | 100% |
| 8 | Sincronizar com o GLPI | % dos incidentes espelhados no GLPI | 100% |
| 9 | Atingir satisfação do usuário (CSAT) | Nota média de CSAT | ≥ 4,0 / 5,0 |
| 10 | Reduzir tempo médio de resolução (MTTR) | MTTR mensal | Tendência de redução mensal |

### 2.3 Limites do Módulo

**O que o módulo FAZ:**
- Registra, classifica, prioriza e gerencia incidentes até o encerramento.
- Integra com SLA, Catálogo, Ativos, KB, Problemas, GLPI, Notificações.
- Gera métricas, dashboards e relatórios operacionais e executivos.

**O que o módulo NÃO FAZ:**
- Não gerencia requisições de serviço (módulo Gestão de Requisições).
- Não substitui a investigação de causa raiz (módulo Gestão de Problemas).
- Não gerencia mudanças de infraestrutura (fora do escopo atual do SGTI v1).
- Não oferece monitoramento ativo de infraestrutura (integra com ferramentas de monitoramento via API).

---

## 3. Papéis e Responsabilidades

### 3.1 Usuário (END_USER)

**Perfil:** Qualquer colaborador que utiliza serviços de TI, sem responsabilidade técnica.

**Pode:**
- Abrir incidentes para si mesmo pelo portal de autoatendimento.
- Visualizar, comentar (comentário público) e anexar arquivos em seus próprios incidentes.
- Confirmar resolução, reabrir dentro de 7 dias e avaliar o atendimento (CSAT).
- Consultar a Base de Conhecimento antes de abrir chamado.
- Cancelar incidente próprio com status OPEN e justificativa.

**Não pode:**
- Ver incidentes de outros usuários.
- Ver comentários marcados como INTERNAL.
- Atribuir, transferir ou escalar incidentes.
- Alterar prioridade ou classificação do incidente.

**Responsabilidades-chave:**
1. Registrar o incidente assim que identificar o problema — não aguardar a situação piorar.
2. Fornecer descrição detalhada e clara, incluindo mensagens de erro, quando ocorreu e o que estava fazendo.
3. Responder prontamente quando o técnico solicitar informações (incidente em PENDING_USER).
4. Confirmar genuinamente se o problema foi resolvido antes de fechar — não apenas clicar "confirmar" sem testar.

---

### 3.2 Analista de TI — Suporte N1 (IT_TECHNICIAN)

**Perfil:** Técnico de suporte de primeiro nível, responsável pelo atendimento inicial.

**Pode:**
- Assumir incidentes ou atribuí-los ao próprio grupo.
- Alterar status, classificar, categorizar e documentar soluções.
- Pausar/retomar SLA em situações autorizadas.
- Criar rascunhos de artigo KB a partir de incidentes.
- Transferir para outro técnico do mesmo grupo ou para outro grupo.

**Responsabilidades-chave:**
1. Monitorar a fila de incidentes abertos e sem atribuição ao início do turno.
2. Consultar a Base de Conhecimento **antes** de iniciar o diagnóstico — soluções existentes economizam tempo.
3. Documentar cada ação realizada em comentários internos durante o atendimento.
4. Comunicar ao usuário em linguagem acessível, sem jargão técnico, o andamento do caso.
5. Escalar para Coordenador quando o problema ultrapassar sua capacidade técnica antes do SLA vencer.
6. Registrar a solução em detalhes ao resolver — evitar registros genéricos como "resolvido" ou "ok".
7. Sugerir criação de artigo KB ao resolver incidente com solução inédita.

---

### 3.3 Coordenador de TI — Suporte N2 (IT_SPECIALIST)

**Perfil:** Técnico sênior especialista em domínios específicos (Infraestrutura, Sistemas, Redes, Segurança).

**Pode:**
- Tudo que o Analista pode, mais:
- Receber escalações e assumir incidentes complexos.
- Transferir incidentes entre quaisquer grupos.
- Criar e vincular Problemas a incidentes.
- Registrar e confirmar causas raiz.
- Criar workarounds (sujeito a aprovação do Gestor para publicar).
- Revisar e submeter artigos KB para publicação.

**Responsabilidades-chave:**
1. Atender escalações de N1 com prioridade.
2. Identificar padrões — incidentes recorrentes devem gerar Problema, não apenas ser resolvidos repetidamente.
3. Coordenar o atendimento de incidentes com impacto amplo (múltiplos usuários/serviços).
4. Garantir que o conhecimento técnico gerado nos incidentes seja documentado e publicado na KB.
5. Realizar análise técnica de incidentes críticos e produzir diagnóstico formal.

---

### 3.4 Gestor de TI (IT_MANAGER)

**Perfil:** Responsável operacional e estratégico pela equipe de TI.

**Pode:**
- Tudo que os perfis anteriores podem, mais:
- Acessar e gerenciar todos os incidentes do tenant.
- Forçar fechamento, reabertura ou cancelamento de qualquer incidente.
- Publicar workarounds validados pelos Coordenadores.
- Reclassificar prioridade com justificativa.
- Acessar relatórios executivos e todos os dashboards.
- Revogar atribuição de qualquer técnico.

**Responsabilidades-chave:**
1. **Monitorar** os KPIs em tempo real via dashboard operacional.
2. **Intervir** em incidentes críticos, SEV-1 ou com SLA em risco.
3. **Comunicar** stakeholders e alta direção em incidentes de alto impacto.
4. **Analisar** tendências de violação e atuar preventivamente nas causas.
5. **Conduzir** reuniões de post-mortem após incidentes SEV-1.
6. **Revisar** relatórios semanais e mensais de incidentes.
7. **Gerir** a capacidade da equipe frente ao volume de chamados.

---

### 3.5 Administrador (SUPER_ADMIN)

**Perfil:** Administrador da plataforma SGTI, acesso irrestrito.

**Responsabilidades:**
- Configurar categorias, subcategorias, grupos de suporte e taxonomia.
- Gerenciar parâmetros do módulo (SLAs, regras de escalonamento automático).
- Configurar e monitorar integrações com GLPI e sistemas externos.
- Auditar registros com acesso completo ao audit_log.
- Executar operações privilegiadas de correção de dados inconsistentes.
- Garantir conformidade técnica com requisitos de segurança (LGPD, OWASP).

---

## 4. Estrutura do Incidente

### 4.1 Seção: Identificação

| Campo | Tipo | Obrigatório | Editável após criação | Descrição |
|-------|------|:-----------:|:--------------------:|-----------|
| **Número** | String (sequencial) | Sim — automático | **Nunca** | Identificador legível único: `INC-YYYY-NNNNNN`. Gerado pelo banco via BIGSERIAL. |
| **Tipo** | Enum | Sim — fixo | Não | Sempre `INCIDENT` neste módulo. |
| **Origem** | Enum | Sim — automático | Não | Canal de criação: `PORTAL`, `EMAIL`, `PHONE`, `MONITORING`, `API`, `GLPI`. Imutável após criação. |

### 4.2 Seção: Descrição do Problema

| Campo | Tipo | Obrigatório | Editável por | Descrição |
|-------|------|:-----------:|:------------:|-----------|
| **Título** | Texto (500 chars) | Sim | Técnico N1+, solicitante (se OPEN) | Resumo conciso. Ex: "VPN não conecta após atualização do Windows 11" |
| **Descrição** | Texto longo | Sim | Técnico N1+, solicitante (se OPEN) | Detalhamento: o que estava fazendo, o que ocorreu, mensagens de erro, frequência, comportamento esperado vs. observado. |
| **Passos para Reproduzir** | Texto longo | Não | Técnico N1+ | Sequência de ações que reproduz o problema. Preenchido durante o diagnóstico. |
| **Evidências Iniciais** | Lista de Anexos | Não | Solicitante, técnico | Screenshots, logs, arquivos de erro enviados na abertura. |

### 4.3 Seção: Classificação

| Campo | Tipo | Obrigatório | Editável por | Descrição |
|-------|------|:-----------:|:------------:|-----------|
| **Serviço** | FK — ServiceCatalog | Sim | Técnico N1+ | Serviço afetado do catálogo. Deve ter status `PUBLISHED`. Obrigatório — vide seção 11. |
| **Categoria** | Enum | Sim | Técnico N1+ | Categoria técnica do incidente. Ver seção 5 para lista completa. |
| **Subcategoria** | Enum | Não | Técnico N1+ | Refinamento dentro da categoria selecionada. |
| **Classificação Técnica** | Enum | Não | Técnico N1+ | `HARDWARE`, `SOFTWARE`, `NETWORK`, `ACCESS`, `PERFORMANCE`, `DATA`, `SECURITY`, `OTHER`. Preenchido durante o diagnóstico. |

### 4.4 Seção: Priorização

| Campo | Tipo | Obrigatório | Editável por | Descrição |
|-------|------|:-----------:|:------------:|-----------|
| **Impacto** | Enum | Sim | Solicitante (abertura), Técnico N1+ | `WIDESPREAD`, `SIGNIFICANT`, `MODERATE`, `MINOR`. Informado pelo solicitante; técnico pode corrigir na triagem. |
| **Urgência** | Enum | Sim | Solicitante (abertura), Técnico N1+ | `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`. Informado pelo solicitante; técnico pode corrigir na triagem. |
| **Prioridade** | Enum | Sim — calculado | Técnico N1+ (com justificativa) | `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`. Calculado automaticamente pela matriz I×U. Reclassificação manual exige justificativa. |
| **Usuários Afetados** | Inteiro | Não | Técnico N1+ | Quantidade estimada de colaboradores impactados (usado nos ajustes automáticos de prioridade). |
| **Impacto no Negócio** | Texto longo | Não (obrigatório para CRÍTICO) | Técnico N1+ | Descrição qualitativa do impacto nas operações. Obrigatório ao fechar incidente CRÍTICO. |

### 4.5 Seção: Responsabilidade e Equipe

| Campo | Tipo | Obrigatório | Editável por | Descrição |
|-------|------|:-----------:|:------------:|-----------|
| **Solicitante** | FK — User | Sim — automático | Não | Usuário que abriu o chamado. Preenchido com o usuário logado. Imutável. |
| **Técnico Responsável** | FK — User | Não | Técnico N1+ | Analista ou Coordenador atualmente responsável pelo atendimento. |
| **Grupo Responsável** | FK — IdentityGroup | Não | Técnico N1+ | Grupo de suporte atualmente responsável. |
| **Departamento** | FK — Department | Não — automático | Técnico N1+ | Departamento do solicitante (pré-preenchido). |

### 4.6 Seção: SLA e Prazos

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **SLA Vinculado** | FK — SLA | Sim — automático | Não | SLA determinado pelo serviço e prioridade no momento da abertura. Imutável. |
| **Prazo de 1ª Resposta** | DateTime | Sim — automático | Não | Calculado na abertura: abertura + minutos_resposta em horário útil. |
| **Prazo de Resolução** | DateTime | Sim — automático | Não | Calculado na abertura: abertura + minutos_resolução em horário útil. |
| **Tempo Total Pausado** | Inteiro (min) | Sim — automático | Não | Acumulado de pausas autorizadas, descontado do prazo efetivo. |
| **Status do SLA** | Enum calculado | — | Não | `ON_TRACK` (< 80%), `AT_RISK` (80–99%), `BREACHED` (≥ 100%). |

### 4.7 Seção: Status e Datas

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **Status** | Enum | Sim | Conforme transições (seção 7) | Status atual no fluxo de atendimento. |
| **Data de Abertura** | DateTime | Sim — automático | Não | Timestamp exato preenchido pelo banco (DEFAULT NOW()). Imutável. |
| **Data do 1º Atendimento** | DateTime | — automático | Não | Momento em que status mudou para `IN_PROGRESS` pela primeira vez. |
| **Data de Resolução** | DateTime | — automático | Não | Momento em que status mudou para `RESOLVED`. |
| **Data de Encerramento** | DateTime | — automático | Não | Momento em que status mudou para `CLOSED`. |
| **Data de Reabertura** | DateTime | — automático | Não | Última reabertura (se houver). Preenchido a cada reabertura. |

### 4.8 Seção: Resolução e Conhecimento

| Campo | Tipo | Obrigatório | Editável por | Descrição |
|-------|------|:-----------:|:------------:|-----------|
| **Causa** | Enum + Texto | Não (obrigatório para CRÍTICO) | Técnico N1+ | Categoria da causa e descrição técnica da causa raiz identificada. |
| **Solução Aplicada** | Texto longo | **Sim** (ao resolver) | Técnico N1+ | Passos executados para resolver. Mínimo 30 caracteres. Genéricos rejeitados. |
| **Artigo KB Vinculado** | FK — KnowledgeArticle | Não | Técnico N1+ | Artigo da KB utilizado ou criado como resultado do incidente. |
| **Problema Vinculado** | FK — Problem | Não | Técnico N1+ | Problema ao qual o incidente está associado. |
| **Notas de Encerramento** | Texto | Não | Técnico N1+ | Informações complementares para o registro histórico. |

### 4.9 Seção: Avaliação do Usuário

| Campo | Tipo | Obrigatório | Editável por | Descrição |
|-------|------|:-----------:|:------------:|-----------|
| **Nota CSAT** | Inteiro 1–5 | Não | Solicitante **apenas** | 1 = Péssimo, 2 = Ruim, 3 = Regular, 4 = Bom, 5 = Excelente. |
| **Comentário CSAT** | Texto | Não | Solicitante **apenas** | Texto livre da avaliação. |

### 4.10 Seção: Integração e Ativos

| Campo | Tipo | Obrigatório | Editável por | Descrição |
|-------|------|:-----------:|:------------:|-----------|
| **Ativo Afetado** | FK — Asset | Não | Técnico N1+ | Equipamento ou sistema vinculado ao incidente. |
| **ID GLPI** | String | Não — automático | Não | Identificador do ticket no GLPI. Imutável após preenchido. |
| **Última Sync GLPI** | DateTime | Não — automático | Não | Timestamp da última sincronização bidirecional com GLPI. |
| **Campos Customizados** | JSONB | Não | Solicitante (abertura) | Campos adicionais do formulário dinâmico do serviço. |
| **Tags** | Array de strings | Não | Técnico N1+ | Tags livres para agrupamento e busca. |

### 4.11 Seção: Evidências e Anexos

| Campo | Tipo | Limite | Formatos Aceitos |
|-------|------|:------:|:----------------:|
| **Anexos** | Lista de FileReference | 50 MB por arquivo, sem limite de quantidade | PDF, PNG, JPG, GIF, DOCX, XLSX, CSV, TXT, LOG, ZIP, MP4 |

---

## 5. Classificação

### 5.1 Categorias, Subcategorias e Exemplos

| Categoria | Subcategorias | Exemplos Comuns |
|-----------|--------------|----------------|
| **Hardware** | Desktop/Notebook, Monitor, Teclado/Mouse, Impressora, Scanner, Servidor, Telefone IP, Dispositivo Móvel, Periférico USB, Outro | Notebook não liga; monitor com tela piscando; impressora não imprime |
| **Software** | SO Windows/macOS/Linux, Aplicativo Corporativo, Navegador Web, Driver, Atualização/Patch, Licença Expirada, Outro | Office não abre; atualização quebrou aplicativo; licença bloqueou acesso |
| **Rede e Conectividade** | Internet, Wi-Fi, LAN (cabeada), VPN, VoIP, DNS, Proxy, Outro | Sem acesso à internet; Wi-Fi desconectando; VPN com erro de certificado |
| **Acesso e Segurança** | Login/Autenticação, Permissão Negada, Conta Bloqueada, Certificado Digital, MFA, Outro | Conta bloqueada; acesso negado a pasta; erro de MFA |
| **Performance e Disponibilidade** | Lentidão de Sistema, Alta CPU/Memória, Serviço Fora do Ar, Instabilidade, Timeout, Outro | ERP lento; sistema travando; aplicação retornando timeout |
| **Dados** | Perda de Dados, Arquivo Corrompido, Sincronização, Banco de Dados, Backup, Outro | Arquivo sumiu do Drive; planilha corrompida; backup não executou |
| **Segurança da Informação** | Malware/Vírus, Phishing, Acesso Não Autorizado, Vazamento de Dados, Outro | Antivírus detectou ameaça; e-mail suspeito recebido; dados na internet |
| **Google Workspace** | Gmail, Google Drive, Meet, Calendar, Docs/Sheets/Slides, Admin, Outro | Gmail não carrega; arquivo do Drive sumiu; Meet sem áudio |
| **Infraestrutura Cloud** | Serviço de Nuvem, Provisionamento, Custo Inesperado, SLA de Provedor, Outro | AWS fora do ar; VM sem resposta; custo anômalo detectado |
| **Outro** | Não Classificado | Situações que não se encaixam nas categorias acima — preencher na triagem |

### 5.2 Criticidade Padrão por Categoria

A criticidade padrão é usada quando o técnico não consegue calcular a prioridade completa na abertura automática:

| Categoria | Criticidade Padrão | Razão |
|-----------|:-----------------:|-------|
| Segurança da Informação | **CRÍTICO** | Risco imediato à confidencialidade ou integridade |
| Performance e Disponibilidade | **ALTO** | Potencial impacto em múltiplos usuários ou processos |
| Rede e Conectividade | **ALTO** | Impacto amplo quando serviço central é afetado |
| Acesso e Segurança | **ALTO** | Pode comprometer conformidade e continuidade |
| Dados | **ALTO** | Risco de perda permanente de informação corporativa |
| Infraestrutura Cloud | **ALTO** | Potencial de indisponibilidade de serviços hospedados |
| Hardware | **MÉDIO** | Impacto geralmente individual ou localizado |
| Software | **MÉDIO** | Impacto dependente do sistema afetado |
| Google Workspace | **MÉDIO** | Impacto na produtividade; raramente na operação crítica |
| Outro | **MÉDIO** | Avaliado individualmente na triagem |

> **Nota:** A criticidade da categoria é apenas referência. A prioridade final é calculada pela Matriz Impacto × Urgência (seção 6).

---

## 6. Priorização — Matriz Impacto × Urgência

### 6.1 Definição de Impacto

| Nível | Código | Definição Técnica | Critérios de Enquadramento |
|:-----:|:------:|-------------------|-----------------------------|
| **Generalizado** | WIDESPREAD | Afeta toda a organização ou um serviço crítico de missão | > 50 usuários; ERP, e-mail, rede completamente indisponíveis |
| **Significativo** | SIGNIFICANT | Afeta um departamento inteiro ou grupo relevante | 10 a 50 usuários; serviço importante com degradação severa |
| **Moderado** | MODERATE | Afeta grupo pequeno ou serviço secundário | 2 a 10 usuários; funcionalidade parcialmente comprometida |
| **Menor** | MINOR | Afeta 1 usuário; inconveniência sem paralisação | 1 usuário; workaround disponível; impacto tolerável |

### 6.2 Definição de Urgência

| Nível | Código | Definição Técnica | Critérios de Enquadramento |
|:-----:|:------:|-------------------|-----------------------------|
| **Crítica** | CRITICAL | Processo de negócio parado agora; nenhuma alternativa | Sem workaround; trabalho essencial totalmente bloqueado |
| **Alta** | HIGH | Processo fortemente comprometido; workaround precário | Trabalho possível mas severamente prejudicado |
| **Média** | MEDIUM | Processo impactado mas funcionando com dificuldade | Alternativa disponível; tolerável por horas |
| **Baixa** | LOW | Inconveniência sem impacto imediato | Pode aguardar atendimento no prazo normal |

### 6.3 Matriz de Prioridade (Resultado Automático)

```
                         U  R  G  Ê  N  C  I  A
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

### 6.4 SLA Resultante por Prioridade

| Prioridade | 1ª Resposta | Início Atendimento | Resolução | Janela |
|:----------:|:-----------:|:-----------------:|:---------:|:------:|
| **CRÍTICO** | 15 min | 30 min | 2 horas | 24×7 |
| **ALTO** | 30 min | 1 hora | 4 horas | Comercial |
| **MÉDIO** | 2 horas | 4 horas | 8 horas | Comercial |
| **BAIXO** | 4 horas | 1 dia útil | 3 dias úteis | Comercial |

### 6.5 Ajuste Automático de Prioridade pelo Sistema

O sistema aplica elevações automáticas de prioridade nas seguintes condições:

| Condição Detectada | Elevação Aplicada |
|--------------------|------------------|
| `usuários_afetados > 50` | Eleva para **CRÍTICO** |
| `usuários_afetados > 10` | Eleva para mínimo **ALTO** |
| Ativo afetado com tag `mission_critical` | Eleva para mínimo **ALTO** |
| Segunda ocorrência do mesmo serviço para o mesmo usuário em 7 dias | Eleva 1 nível |
| Serviço com SLA CRÍTICO no catálogo | Mínimo **ALTO** |
| Categoria = Segurança da Informação | Mínimo **ALTO** |
| Incidente envolve processo financeiro ou regulatório identificado | Eleva para **CRÍTICO** |
| Incidente aberto via Monitoring (alerta automático de servidor) | Mínimo **ALTO** |

> **Importante:** O sistema aplica elevações, nunca reduções automáticas. A redução de prioridade é sempre manual, feita por IT_TECHNICIAN+ com justificativa documentada.

---

## 7. Fluxo de Atendimento

### 7.1 Diagrama Completo de Status

```
 CANAIS DE ENTRADA
 ─────────────────
 Portal Web │ E-mail │ Telefone (técnico registra) │ API │ Monitoramento │ GLPI
            │
            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                         ABERTO                               │
 │                    (Status: OPEN)                            │
 │  • SLA iniciado no timestamp de criação                      │
 │  • Notificações disparadas (solicitante + Coordenador TI)    │
 │  • Visível na fila de chamados sem atribuição                │
 └──────────────────────────┬───────────────────────────────────┘
                            │
            ┌───────────────▼────────────────────┐
            │             TRIAGEM                │
            │  (Ação dentro do status OPEN)       │
            │  • Verificar: incidente ou req.?   │
            │  • Classificar categoria           │
            │  • Confirmar/ajustar prioridade    │
            │  • Atribuir técnico ou grupo       │
            └───────────────┬────────────────────┘
                            │ Técnico atribuído
                            ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                     EM ATENDIMENTO                           │
 │                  (Status: IN_PROGRESS)                       │
 │  • SLA em contagem                                           │
 │  • Técnico executa diagnóstico e resolve                     │
 │  • Comentários técnicos obrigatórios                         │
 └──────┬─────────────────────────────────────────┬────────────┘
        │                                         │
        │ Aguardando usuário             Aguardando terceiro
        ▼                                         ▼
 ┌────────────────────┐               ┌──────────────────────────┐
 │  AGUARDANDO        │               │   AGUARDANDO             │
 │  USUÁRIO           │               │   TERCEIROS              │
 │ (PENDING_USER)     │               │ (PENDING_THIRD_PARTY)    │
 │  SLA pausado ⏸     │               │   SLA pausado ⏸          │
 └────────┬───────────┘               └────────────┬─────────────┘
          │ Usuário responde                        │ Terceiro retorna
          └──────────────────┬──────────────────────┘
                             │ Retoma atendimento
                             ▼
                    ┌────────────────────┐
                    │     ESCALADO       │
                    │   (ESCALATED)      │ ← (quando necessário)
                    │   SLA em contagem  │
                    └────────┬───────────┘
                             │ Especialista resolve
                             ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                       RESOLVIDO                              │
 │                   (Status: RESOLVED)                         │
 │  • Solução documentada (obrigatório, mín. 30 chars)          │
 │  • SLA encerrado (cumprido ou violado — imutável)            │
 │  • Timer de 72h iniciado para confirmação do usuário         │
 └──────────────────────────┬───────────────────────────────────┘
                            │
          ┌─────────────────┴──────────────────────┐
          │                                        │
          ▼                                        ▼
  Usuário confirma                    72h sem resposta do usuário
  resolução + CSAT                    (fechamento automático pelo sistema)
          │                                        │
          └─────────────────┬──────────────────────┘
                            │
 ┌──────────────────────────▼───────────────────────────────────┐
 │                      ENCERRADO                               │
 │                   (Status: CLOSED)                           │
 │  • Estado final (somente leitura)                            │
 │  • Reabertura possível em até 7 dias                         │
 └──────────────────────────┬───────────────────────────────────┘
                            │ ← até 7 dias após fechamento
                            ▼
                   ┌─────────────────────┐
                   │     REABERTO        │
                   │   (retorna a OPEN)  │
                   │   Novo SLA calculado│
                   └─────────────────────┘

 ┌──────────────────────────────────────────────────────────────┐
 │                    CANCELADO (CANCELLED)                     │
 │  Estado terminal acessível de: OPEN, IN_PROGRESS.            │
 │  Apenas solicitante (OPEN) ou IT_MANAGER+ podem cancelar.    │
 │  Justificativa obrigatória. Nunca pode ser reativado.        │
 └──────────────────────────────────────────────────────────────┘
```

### 7.2 Descrição Funcional de Cada Status

**OPEN — Aberto**
Estado inicial de todo incidente. SLA iniciado no timestamp exato da criação. O incidente aguarda atribuição e triagem. Visível na fila de chamados sem técnico atribuído. O solicitante recebe confirmação de abertura.

**IN_PROGRESS — Em Atendimento**
Técnico atribuído e trabalhando ativamente. SLA em contagem. O primeiro comentário técnico após entrar neste status constitui o registro da "1ª Resposta". Mudança para IN_PROGRESS é registrada como data do 1º Atendimento.

**PENDING_USER — Aguardando Usuário**
Atendimento suspenso aguardando informação, confirmação ou ação do solicitante. **SLA pausado automaticamente.** O solicitante recebe notificação solicitando retorno. Após 3 dias: lembrete. Após 5 dias: aviso de fechamento em breve. Após 7 dias sem resposta: fechamento automático.

**PENDING_THIRD_PARTY — Aguardando Terceiros**
Atendimento suspenso aguardando fornecedor externo, operadora ou outra área não-TI. **SLA pausado automaticamente.** O técnico deve registrar: quem está sendo aguardado, qual informação/ação é esperada e prazo estimado de retorno.

**ESCALATED — Escalado**
Incidente transferido para nível técnico superior (N2 ou N3). SLA continua em contagem (não pausa com escalonamento). O status visual indica que um especialista está sendo acionado.

**RESOLVED — Resolvido**
Solução aplicada e documentada (campo obrigatório com mín. 30 chars). SLA encerrado neste momento — cumprido ou violado, o registro é imutável. O solicitante recebe notificação e tem 72 horas para confirmar ou reabrir.

**CLOSED — Encerrado**
Usuário confirmou a resolução OU se passaram 72h após RESOLVED sem ação do solicitante. Estado final — somente leitura. Pode ser reaberto em até 7 dias pelo solicitante; após 7 dias, somente IT_MANAGER+.

**CANCELLED — Cancelado**
Incidente encerrado antes da resolução por: abertura duplicada, fora de escopo (deveria ser requisição), erro do usuário. Exige justificativa. Estado terminal — não pode ser reativado. Contabilizado separadamente dos incidentes resolvidos.

### 7.3 Matriz de Transições de Status

| De → Para | Quem executa | Pré-condição | Ação / Campo obrigatório |
|-----------|:------------:|:-------------|:-------------------------|
| OPEN → IN_PROGRESS | IT_TECHNICIAN+ | Técnico atribuído | — |
| OPEN → CANCELLED | Solicitante ou IT_MANAGER+ | Justificativa (mín. 20 chars) | Campo `reason` obrigatório |
| IN_PROGRESS → PENDING_USER | IT_TECHNICIAN+ | — | Campo `reason` + motivo da pausa |
| IN_PROGRESS → PENDING_THIRD_PARTY | IT_TECHNICIAN+ | — | Campo `reason` + quem está sendo aguardado |
| IN_PROGRESS → ESCALATED | IT_TECHNICIAN ao transferir para N2/N3 | — | Motivo da escalação documentado |
| IN_PROGRESS → RESOLVED | IT_TECHNICIAN+ | Solução aplicada | Campo `resolution_notes` (mín. 30 chars) |
| IN_PROGRESS → CANCELLED | IT_MANAGER+ | Justificativa | Campo `reason` obrigatório |
| PENDING_USER → IN_PROGRESS | IT_TECHNICIAN+ ou automático (usuário comentou) | — | — |
| PENDING_THIRD_PARTY → IN_PROGRESS | IT_TECHNICIAN+ | — | Comentário documentando o retorno |
| ESCALATED → IN_PROGRESS | IT_SPECIALIST+ | Especialista assumiu | — |
| RESOLVED → CLOSED | Solicitante (confirmação) ou automático (72h) | — | CSAT (opcional); ou automático |
| RESOLVED → OPEN | Solicitante (< 7d) ou IT_MANAGER+ | Justificativa (mín. 20 chars) | Campo `reopen_reason`; novo SLA calculado |
| CLOSED → OPEN | Solicitante (< 7d) ou IT_MANAGER+ | Justificativa (mín. 20 chars) | Campo `reopen_reason`; novo SLA calculado |

---

## 8. Escalonamento

### 8.1 Escalonamento Funcional (Técnico — N1 → N2 → N3)

O escalonamento funcional ocorre quando o incidente ultrapassa a competência técnica do nível atual.

**Quando escalar de N1 para N2:**
- Diagnóstico N1 não identificou a causa após 50% do prazo de SLA.
- O problema requer acesso privilegiado (servidor, switch, firewall, banco de dados).
- O incidente requer conhecimento especializado em domínio técnico específico.
- O volume de impacto identificado é maior que o relatado pelo usuário.
- O técnico avalia que a resolução ultrapassa sua capacidade técnica.

**Quando escalar de N2 para N3:**
- Causa raiz requer análise de arquitetura ou mudança de configuração estrutural.
- O incidente envolve múltiplos sistemas interdependentes com potencial de cascata.
- Análise forense de segurança é necessária.
- Potencial impacto em mais de um serviço crítico.
- Incidente SEV-1 ativo.

**Processo de escalonamento funcional:**

```
Passo 1: Técnico atual documenta o diagnóstico parcial em comentário INTERNAL
         ("Verificado servidor de autenticação — logs indicam estouro de disco.
          Capacidade de disco: 99,8%. Escalonando para infra.")

Passo 2: Técnico abre modal "Transferir Chamado"
         → Seleciona grupo de destino: Infraestrutura
         → Informa motivo do escalonamento (campo obrigatório)

Passo 3: Sistema registra em TransferHistory e muda status para ESCALATED
         → Notificação enviada ao grupo de Infraestrutura
         → IT_MANAGER notificado para prioridades CRÍTICO e ALTO

Passo 4: Especialista N2/N3 assume o chamado
         → Status muda para IN_PROGRESS novamente
         → SLA continua em contagem
```

### 8.2 Escalonamento Hierárquico (Gerencial)

O escalonamento hierárquico garante visibilidade da gestão em situações críticas.

**Gatilhos automáticos:**

| Condição | Destinatário da Notificação | Urgência |
|----------|:---------------------------:|:--------:|
| CRÍTICO sem atribuição após 15 min | IT_MANAGER + Grupo responsável | Urgente |
| CRÍTICO sem atualização (comentário) por 1 hora | IT_MANAGER | Urgente |
| ALTO sem atribuição após 30 min | IT_MANAGER | Normal |
| SLA em 80% consumido (qualquer prioridade) | IT_MANAGER | Normal |
| SLA violado (Breach) | IT_MANAGER | Urgente |
| Segunda violação de SLA do mesmo serviço na semana | IT_MANAGER | Normal |
| Incidente CRÍTICO com impacto GENERALIZADO | IT_MANAGER + Coordenador TI imediatamente | Crítico |
| Incidente de Segurança da Informação aberto | IT_MANAGER + Grupo Segurança | Urgente |

**Escalonamento hierárquico manual:**
O Coordenador pode acionar o IT_MANAGER manualmente a qualquer momento para: obter aprovação de recursos adicionais, comunicação com stakeholders externos, ou coordenação de crise além da capacidade do Coordenador.

---

## 9. Transferência de Incidentes

### 9.1 Grupos de Transferência Disponíveis

| Grupo | Abreviação | Especialidade | Exemplos de Incidentes |
|-------|:----------:|--------------|------------------------|
| **Service Desk (N1)** | N1 | Suporte básico a usuários | Chamado resolvido por N2; pode ser encaminhado de volta para acompanhamento |
| **Infraestrutura** | INFRA | Servidores, storage, backup, virtualização | Servidor fora do ar; performance de VM; backup falho |
| **Redes** | NET | LAN, WAN, Wi-Fi, VPN, switches, roteadores | Falha de conectividade; switch com erro; VPN instável |
| **Segurança** | SEC | Firewall, endpoint security, identidades, compliance | Malware detectado; acesso indevido suspeito; firewall bloqueando indevidamente |
| **Sistemas e Aplicações** | SIS | ERP, CRM, sistemas internos, integrações, banco de dados | Falha de aplicação; erro de integração; query lenta |
| **Desenvolvimento** | DEV | Código interno, APIs próprias, bugs de sistema | Bug em sistema interno; erro em código customizado |
| **Google Workspace** | GWS | Administração do Google Workspace | Problemas de conta Google; grupos; Drive corporativo |
| **Compliance** | CPL | Conformidade regulatória, LGPD, auditoria | Incidente com implicação legal; vazamento de dados |
| **Fornecedor Externo** | EXT | Suporte de terceiros (Dell, Microsoft, AWS) | Hardware em garantia; suporte de software licenciado; SLA de nuvem |

### 9.2 Dados Registrados em Cada Transferência

Cada transferência gera um registro imutável em `ticket.TransferHistory`:

| Campo | Conteúdo | Editável |
|-------|---------|:--------:|
| **Data e Hora** | Timestamp exato da transferência (UTC) | Não |
| **De — Técnico** | Técnico/usuário que iniciou a transferência | Não |
| **De — Grupo** | Grupo de origem | Não |
| **Para — Técnico** | Técnico destino (se transferência individual) | Não |
| **Para — Grupo** | Grupo destino | Não |
| **Motivo** | Texto livre (mín. 20 chars) justificando a transferência | Não |
| **Tipo** | `MANUAL` / `ESCALATION` / `AUTO_RULE` / `GLPI_SYNC` | Não |
| **Status SLA no momento** | % do prazo consumido no momento da transferência | Não |

### 9.3 Regras de Transferência

- Um incidente pode ser transferido quantas vezes necessário — sem limite.
- A transferência **não pausa o SLA** — o contador continua independentemente.
- Incidente transferido para grupo sem membros ativos disponíveis gera alerta ao IT_MANAGER.
- Transferência de incidente CRÍTICO sempre notifica o IT_MANAGER, independentemente de quem iniciou.
- O técnico que recebe o chamado tem 15 minutos para confirmar a aceitação; sem confirmação, nova notificação é enviada ao grupo.

---

## 10. Integração com SLA

### 10.1 Determinação do SLA na Abertura

O SLA é determinado automaticamente ao criar o incidente seguindo a lógica de prioridade:

```
LÓGICA DE DETERMINAÇÃO DO SLA

1. Prioridade calculada pela Matriz I×U
2. Buscar SLA específico para (service_id + priority)
   Se encontrado → usar este SLA
3. Se não encontrado → buscar SLA padrão para (priority)
   Se encontrado → usar SLA padrão
4. Se não encontrado → usar SLA padrão MÉDIO (fallback de segurança)
5. Registrar em ticket.Ticket: sla_id, sla_response_deadline, sla_resolution_deadline
```

Campos calculados na abertura:
- `sla_response_deadline` = `created_at` + `response_minutes` (em horário útil do SLA)
- `sla_resolution_deadline` = `created_at` + `resolution_minutes` (em horário útil do SLA)

### 10.2 Cálculo em Horário Comercial

Para SLAs com `working_hours_only = true`:
- Horário útil: 08h00 – 18h00, segunda a sexta-feira.
- Fins de semana e feriados: SLA pausado automaticamente.
- **Exemplo:** Incidente MÉDIO (SLA 8h) aberto às 17h30 de quarta-feira:
  - Quarta 17h30 → 18h00 = 30 min úteis
  - Quinta 08h00 → 16h00 = 8h total → **prazo: quinta às 16h00**

### 10.3 Monitoramento e Alertas Automáticos

O `SlaMonitoringJob` executa a cada 5 minutos para incidentes nos status OPEN, IN_PROGRESS e ESCALATED:

| Marco de Consumo | Evento Publicado | Ação do Sistema |
|:----------------:|:----------------:|----------------|
| 50% | `SlaWarning50` | Notificação in-app ao técnico |
| 75% | `SlaWarning75` | Notificação in-app + e-mail ao técnico |
| 80% | `SlaAtRisk` | Notificação ao técnico + IT_MANAGER; badge LARANJA no portal |
| 90% | `SlaWarning90` | Notificação urgente ao técnico + IT_MANAGER |
| 100% | `SlaBreached` | Registro permanente de violação; notificação técnico + IT_MANAGER; badge VERMELHO |

### 10.4 Indicador Visual de SLA no Portal

| Cor | Texto | Condição |
|:---:|:-----:|---------|
| 🟢 Verde | "No prazo" | < 50% consumido |
| 🟡 Amarelo | "Atenção" | 50%–79% consumido |
| 🟠 Laranja | "Em risco" | 80%–99% consumido |
| 🔴 Vermelho | "SLA Violado" | ≥ 100% consumido |
| ⚪ Cinza | "Pausado" | Status PENDING_USER ou PENDING_THIRD_PARTY |

### 10.5 Recalculo de SLA na Reabertura

Ao reabrir, o SLA é completamente recalculado a partir do momento da reabertura:
- `sla_response_deadline` = `reopened_at` + `response_minutes`
- `sla_resolution_deadline` = `reopened_at` + `resolution_minutes`
- Histórico anterior em `SLAHistory` é preservado integralmente.
- O SLA anterior (violado ou cumprido) não é alterado retroativamente.

---

## 11. Integração com Catálogo de Serviços

### 11.1 Vínculo Obrigatório

**Regra absoluta:** Todo incidente deve ser vinculado a um serviço do catálogo com status `PUBLISHED`. Não é possível abrir ou salvar um incidente sem `catalog_id` preenchido.

Serviços exibidos no formulário de abertura:
- Apenas serviços com `status = PUBLISHED`.
- Apenas serviços com `defaultTicketType = INCIDENT` ou `BOTH`.
- Agrupados por categoria para facilitar a seleção do usuário.
- Campo de busca por texto disponível para localizar rapidamente.

### 11.2 Impacto da Seleção do Serviço

A seleção do serviço no catálogo desencadeia automaticamente:

| Impacto | Detalhe |
|---------|---------|
| **SLA determinado** | SLA específico do serviço + prioridade, ou SLA padrão da prioridade |
| **Grupo de destino** | Grupo responsável pelo serviço acionado automaticamente |
| **Formulário dinâmico** | Campos adicionais específicos do serviço exibidos |
| **KEDB consultado** | Se há Problema com `KNOWN_ERROR` e workaround para o serviço, exibido automaticamente |
| **Métricas alimentadas** | Dashboard de "Incidentes por Serviço" atualizado |

### 11.3 Formulário Dinâmico por Serviço

Cada serviço pode ter campos extras configurados no `form_schema`. Exemplos:

| Serviço | Campos Extras Exibidos |
|---------|----------------------|
| VPN | Sistema Operacional, Versão do Cliente VPN, Mensagem de Erro |
| E-mail | Conta Afetada, Erro ao Enviar/Receber, Última Mensagem Recebida |
| Impressora | Nome/Localização da Impressora, Mensagem no Display |
| Software Específico | Versão Instalada, Sistema Operacional, Módulo com Erro |
| Rede | Ponto de Acesso Wi-Fi, Endereço IP do Computador |

---

## 12. Integração com Gestão de Ativos

### 12.1 Tipos de Ativo Associáveis

| Categoria de Ativo | Exemplos Específicos |
|-------------------|---------------------|
| **Computador / Workstation** | Desktop Dell OptiPlex, Apple Mac Mini |
| **Notebook / Laptop** | Dell XPS 15, Lenovo ThinkPad, MacBook Pro |
| **Servidor** | Dell PowerEdge R750, HPE ProLiant |
| **Impressora** | HP LaserJet Pro, Epson EcoTank |
| **Monitor** | Dell U2722D, LG UltraWide 34" |
| **Dispositivo de Rede** | Cisco Catalyst Switch, Ubiquiti UniFi AP |
| **Dispositivo Móvel** | iPhone 15 corporativo, Samsung Galaxy S24 |
| **Software / Licença** | Microsoft 365, Adobe Creative Cloud, AutoCAD |
| **Periférico** | Webcam, headset, dock USB-C, KVM Switch |

### 12.2 Busca de Ativo no Formulário

O campo "Ativo Afetado" oferece busca por:
- **Etiqueta patrimonial** (asset_tag) — campo primário de identificação
- **Nome do ativo** — busca textual
- **Número de série** — para identificação precisa de hardware
- **Responsável atual** — buscar ativos alocados a um usuário específico

### 12.3 Efeitos Automáticos ao Vincular Ativo

Quando um ativo é vinculado ao incidente:

| Efeito | Detalhes |
|--------|---------|
| **Histórico do ativo atualizado** | Incidente aparece na aba "Histórico" do ativo com link direto |
| **Alerta de reincidência** | Se > 2 incidentes abertos para o mesmo ativo → sugestão de criação de Problema |
| **Manutenção em andamento** | Se ativo está em `UNDER_MAINTENANCE`, SLA do incidente pausa automaticamente |
| **Dados do ativo disponíveis** | Técnico vê diretamente: garantia, responsável atual, histórico de manutenções |
| **MTBF calculado** | Mean Time Between Failures do ativo atualizado ao resolver incidentes |

### 12.4 Consulta ao GLPI para Dados de Ativo

Se o ativo não existe no inventário SGTI mas existe no GLPI:
- O técnico pode buscar pelo nome ou número de série no GLPI via modal dedicado.
- Ao selecionar o ativo do GLPI, o sistema importa os dados básicos e cria o registro no SGTI automaticamente.
- O `glpi_computer_id` é vinculado para sincronização futura.

---

## 13. Integração com GLPI

### 13.1 Arquitetura da Integração

```
SGTI (NestJS Backend)
    │
    ├── GlpiTicketAdapter (Port → Anti-Corruption Layer)
    │       ├── Método: createTicket(incident) → glpi_ticket_id
    │       ├── Método: updateTicketStatus(glpi_id, status)
    │       ├── Método: addComment(glpi_id, comment)
    │       └── Método: getAssets(query) → asset[]
    │
    └── GlpiSyncJob (a cada 5 min)
            ├── Consulta status de tickets sincronizados
            ├── Importa comentários adicionados no GLPI
            └── Atualiza SLAHistory se necessário
```

### 13.2 Sincronização SGTI → GLPI (ao criar incidente)

Campos enviados ao GLPI na criação do ticket espelho:

| Campo SGTI | Campo GLPI | Notas |
|------------|-----------|-------|
| `title` | `name` | — |
| `description` | `content` | — |
| `priority` | `priority` | Mapeamento: CRÍTICO=5, ALTO=4, MÉDIO=3, BAIXO=2 |
| `category.name` | `itilcategory_id` | Mapeamento de categoria configurável |
| `requester.email` | `_users_id_requester` | Por e-mail |
| `status` | `status` | Mapeamento de status configurável |
| `sla_resolution_deadline` | `time_to_resolve` | — |

O `glpi_ticket_id` retornado é armazenado em `incident.glpi_ticket_id` e é **imutável** após preenchido.

### 13.3 Sincronização GLPI → SGTI (a cada 5 minutos)

O `GlpiStatusSyncJob` consulta tickets com atualização recente e:

- Importa mudanças de status: mapeadas para status SGTI equivalente.
- Importa comentários adicionados no GLPI como `TicketComment` com `source = GLPI_SYNC` e `type = INTERNAL`.
- Atualiza `glpi_synced_at` com o timestamp da última sincronização.

### 13.4 Consulta de Ativos no GLPI

Durante o atendimento, o técnico pode clicar em "Buscar no GLPI" no campo de ativo:

```
Modal "Buscar Ativo no GLPI"
  Campos de busca: Nome, Número de Série, Tipo, Usuário Responsável
  
  Resultado: Lista de ativos do GLPI com:
    - Nome, Tipo, Número de Série
    - Localização, Responsável
    - Status no GLPI (Em Uso, Em Estoque, Manutenção)
  
  Ação: "Usar este ativo" → importa para SGTI e vincula ao incidente
```

### 13.5 Resiliência e Circuit Breaker

| Situação | Comportamento |
|----------|--------------|
| GLPI indisponível ao criar incidente | Incidente criado normalmente no SGTI; sync enfileirada para retry |
| 5 falhas consecutivas de sync | Circuit breaker ativado por 15 minutos; IT_MANAGER notificado |
| Circuit breaker ativo | Tentativas de sync suspensas; retry automático após 15 min |
| Conflito de status (SGTI ≠ GLPI) | SGTI prevalece; conflito registrado em `sync_status = CONFLICT` |
| Falha de credencial | IT_MANAGER notificado imediatamente; sync suspensa |

---

## 14. Integração com Base de Conhecimento

### 14.1 Sugestão Automática em Tempo Real

**Durante o preenchimento do formulário (usuário):**

Enquanto o usuário digita o título do incidente, o sistema realiza busca full-text em tempo real (debounce de 1,5 segundos após parar de digitar) e exibe:

```
┌──────────────────────────────────────────────────────────────┐
│ 💡 Encontramos artigos que podem resolver este problema:      │
│                                                               │
│ 📄 Como resolver: VPN não conecta após atualização Windows   │
│    ★★★★☆ (4.2) · 89 acessos · Service Desk                  │
│    [Ler artigo]  [Isso resolveu meu problema ✓]              │
│                                                               │
│ 📄 Erro de certificado VPN — solução definitiva              │
│    ★★★★★ (4.8) · 234 acessos · Infraestrutura               │
│    [Ler artigo]  [Isso resolveu meu problema ✓]              │
└──────────────────────────────────────────────────────────────┘
```

Se o usuário clicar em "Isso resolveu meu problema", o chamado não é aberto e o incidente não é criado — o usuário resolve autonomamente. Isto é registrado como "deflexão de chamado" nas métricas.

**Ao atribuir o incidente (técnico N1):**

O sistema exibe na página do incidente um card "Soluções Sugeridas" com até 3 artigos mais relevantes, com ranking por: relevância semântica, avaliação de utilidade e número de resoluções usando o artigo.

### 14.2 Soluções Conhecidas (KEDB)

Se o serviço selecionado possui Problema com status `KNOWN_ERROR` e workaround publicado, o sistema exibe automaticamente um banner destacado:

```
┌──────────────────────────────────────────────────────────────┐
│ ⚠️  SOLUÇÃO CONHECIDA PARA ESTE SERVIÇO                       │
│                                                               │
│ Problema identificado: Certificado SSL da VPN expira           │
│ periodicamente sem renovação automática.                      │
│                                                               │
│ Workaround disponível:                                        │
│ 1. Feche o Cisco AnyConnect completamente                     │
│ 2. Aguarde 60 segundos                                        │
│ 3. Reabra e conecte novamente                                 │
│                                                               │
│ Limitação: Funciona apenas se o certificado tiver             │
│ menos de 48h expirado.                                        │
│                                                               │
│ [Artigo KB completo]  [Vincular este workaround ao incidente] │
└──────────────────────────────────────────────────────────────┘
```

### 14.3 Busca Manual na KB pelo Técnico

Botão "🔍 Buscar na Base de Conhecimento" disponível na página do incidente, abre modal de busca com filtros: Audiência (técnico/usuário), Categoria, Status (publicados, incluir depreciados).

### 14.4 Geração Automática de Artigo após Resolução

Ao resolver o incidente com solução documentada:

```
LÓGICA DE GERAÇÃO DE ARTIGO KB

1. Sistema busca artigos com similaridade semântica ≥ 80% com o título do incidente

2. Se artigo similar encontrado:
   → Exibe: "📄 Artigo similar já existe: [título]. Deseja vinculá-lo a este incidente?"
   → Ação: Técnico confirma vinculação → kb_article_id preenchido

3. Se não existe artigo similar:
   → Cria automaticamente rascunho DRAFT_AI com:
      Título: (gerado pelo Assistente IA baseado no incidente)
      Conteúdo: solução documentada no incidente + causa identificada
      Categoria: mesma categoria do incidente
      Audiência: TECHNICAL (padrão; técnico pode alterar)
   → Notifica técnico: "Rascunho criado para revisão e publicação na KB"
```

---

## 15. Integração com Gestão de Problemas

### 15.1 Vincular Incidente a Problema Existente

Quando disponível, o técnico pode associar o incidente a um Problema já registrado (status `UNDER_INVESTIGATION`, `ROOT_CAUSE_IDENTIFIED` ou `KNOWN_ERROR`).

**Como vincular:**
1. Na página do incidente, clique em "Vincular a Problema Existente".
2. Modal de busca: filtrar por número, título, serviço.
3. Selecionar o problema e confirmar com breve descrição da relação.
4. O incidente passa a exibir badge "🔗 Vinculado ao Problema PRB-YYYY-NNNNNN".

**Efeitos automáticos:**
- O Problema exibe lista completa dos incidentes vinculados.
- Se o Problema tem workaround publicado, é exibido ao técnico imediatamente.
- Ao resolver o Problema, todos os incidentes vinculados e ainda abertos recebem comentário de sistema informando a resolução da causa raiz.

### 15.2 Criar Problema a Partir de Incidente

O Coordenador (IT_SPECIALIST+) pode criar um novo Problema diretamente de um incidente.

**Quando usar:**
- Incidente com causa raiz sistêmica identificada que justifica investigação formal.
- Segunda ou terceira ocorrência do mesmo sintoma no mesmo serviço.
- Incidente com impacto alto que provavelmente se repetirá sem solução definitiva.

**Como criar:**
1. Na página do incidente, clique em "Criar Problema a Partir deste Incidente".
2. Sistema pré-preenche: título (editável), descrição (do incidente), serviço.
3. O incidente é vinculado automaticamente como incidente de origem do problema.
4. O status do incidente **não é alterado** — o atendimento do incidente continua independentemente.

### 15.3 Regras de Vinculação Incidente ↔ Problema

| Regra | Detalhe |
|-------|---------|
| **Cardinalidade** | 1 incidente → 0 ou 1 problema; 1 problema → N incidentes |
| **Sugestão automática** | Dois incidentes do mesmo serviço com similaridade ≥ 80% em 7 dias → sugestão de criação de Problema |
| **Propagação de resolução** | Problema resolvido → comentário de sistema em incidentes vinculados abertos |
| **Propagação de workaround** | Workaround publicado em Problema → exibido nos novos incidentes do serviço |

---

## 16. Notificações

### 16.1 Tabela Completa de Notificações

| Evento Disparador | Destinatário(s) | Canal | Prioridade |
|-------------------|:--------------:|:-----:|:----------:|
| **Incidente criado (QUALQUER)** | Solicitante | E-mail + in-app | Normal |
| **Incidente criado (QUALQUER)** | **Coordenador de Tecnologia** | **E-mail + in-app** | **Normal** |
| Incidente criado (CRÍTICO) | IT_MANAGER + Grupo responsável | E-mail + in-app | Urgente |
| Incidente criado (ALTO) | IT_MANAGER | In-app | Normal |
| Técnico atribuído | Solicitante + Técnico atribuído | In-app | Normal |
| Status → IN_PROGRESS | Solicitante | In-app + e-mail | Normal |
| Status → PENDING_USER | Solicitante | E-mail (ação necessária) | Alta |
| Status → PENDING_THIRD_PARTY | IT_MANAGER (informativo) | In-app | Baixa |
| Status → ESCALATED | Técnico/grupo destino | In-app + e-mail | Alta |
| Transferência realizada | Técnico/grupo destino | In-app + e-mail | Normal |
| Transferência de CRÍTICO | Técnico destino + IT_MANAGER | E-mail | Urgente |
| SLA em 50% consumido | Técnico atribuído | In-app | Normal |
| SLA em 75% consumido | Técnico atribuído | In-app + e-mail | Alta |
| **SLA em risco (80%)** | **Técnico + IT_MANAGER** | **In-app + e-mail urgente** | **Urgente** |
| SLA em 90% consumido | Técnico + IT_MANAGER | E-mail | Urgente |
| **SLA Violado (Breach)** | **Técnico + IT_MANAGER** | **In-app + e-mail** | **Crítico** |
| CRÍTICO sem atribuição (15 min) | IT_MANAGER + Grupo | In-app + e-mail | Urgente |
| ALTO sem atribuição (30 min) | IT_MANAGER | In-app | Normal |
| Novo comentário público (técnico) | Solicitante | E-mail | Normal |
| Novo comentário (usuário) | Técnico atribuído | In-app | Normal |
| Status → RESOLVED | Solicitante | E-mail (confirmar/reabrir) + in-app | Normal |
| 72h pós-RESOLVED sem resposta | Sistema → fecha automaticamente | — | Sistema |
| 24h pós-RESOLVED sem resposta | Solicitante | E-mail (lembrete) | Normal |
| Status → CLOSED | Solicitante | E-mail (confirmação) | Normal |
| Incidente reaberto | Técnico anterior + IT_MANAGER | In-app + e-mail | Alta |
| Incidente cancelado | Solicitante | E-mail | Normal |
| SEV-1 declarado | IT_MANAGER + Coordenador TI + Alta Direção | E-mail urgente + in-app | Crítico |
| SEV-1 resolvido | Todos os usuários afetados | E-mail broadcast | Normal |
| PENDING_USER há 3 dias | Solicitante | E-mail (lembrete) | Normal |
| PENDING_USER há 5 dias | Solicitante + Técnico | E-mail (aviso de fechamento) | Alta |

### 16.2 Regra Obrigatória — Coordenador de Tecnologia

**Todo incidente aberto no SGTI notifica automaticamente o Coordenador de Tecnologia (IT_MANAGER responsável pela operação de TI).**

Esta notificação:
- É **inviolável** — não pode ser desativada por nenhum usuário ou administrador via interface.
- É disparada para **todos os incidentes**, independentemente da prioridade (incluindo BAIXO).
- É enviada via **e-mail + in-app** com o seguinte template:

```
Assunto: [SGTI] Novo Incidente: INC-2026-NNNNNN — {título}

Serviço:      {nome do serviço}
Prioridade:   {prioridade calculada}
Solicitante:  {nome do solicitante} ({departamento})
Descrição:    {primeiros 200 caracteres da descrição}
SLA Resolução:{prazo de resolução calculado}

[Acessar Incidente]
```

### 16.3 Padrão de Assunto de E-mail

Todos os e-mails relacionados a um incidente específico seguem o padrão:

```
[{número_incidente}] {título_incidente}
```

**Exemplo:** `[INC-2026-000042] VPN não conecta após atualização do Windows 11`

Este padrão garante que respostas de e-mail ao técnico ou ao solicitante sejam automaticamente importadas como `TicketComment` (origem: `EMAIL`), vinculadas ao incidente correto pela `email_thread_id`.

### 16.4 Canal de Entrega

Todos os e-mails são enviados de `implantacao@pinpag.com.br` via SMTP Google Workspace. Falhas de entrega são retentadas com backoff exponencial (30s, 2min, 10min) e registradas em `email_log.EmailMessage`.

---

## 17. Incidentes Críticos — Severidade 1

### 17.1 Definição de Severidade 1 (SEV-1)

Um incidente é classificado como **Severidade 1** quando satisfaz **pelo menos um** dos critérios:

| Critério | Exemplos Concretos |
|----------|-------------------|
| **Indisponibilidade total** de serviço crítico de negócio | ERP fora do ar; e-mail corporativo inacessível; rede completamente indisponível |
| **Impacto financeiro** direto e imediato | Sistema de faturamento parado; processamento de pagamentos interrompido |
| **Impacto regulatório** | Possível violação de LGPD detectada; sistema de conformidade inacessível |
| **> 50 usuários afetados** simultaneamente | Falha de servidor com múltiplos serviços ativos |
| **Ameaça ativa de segurança** | Ransomware em andamento; acesso não autorizado a sistema crítico confirmado |
| **Impacto em processo de missão crítica** | Linha de produção parada; impossibilidade de atendimento a cliente externo |

**Como declarar SEV-1:**
- O sistema declara automaticamente ao detectar prioridade CRÍTICO + impacto GENERALIZADO.
- Um IT_TECHNICIAN+ pode declarar manualmente durante o atendimento ao identificar os critérios.
- A declaração é registrada em auditoria com o momento e o usuário que declarou.

### 17.2 Fluxo de Comunicação SEV-1

```
T + 0min   INCIDENTE DECLARADO SEV-1
           ├── Notificação IMEDIATA → IT_MANAGER
           ├── Notificação IMEDIATA → Coordenador de Tecnologia
           ├── Notificação IMEDIATA → Grupo de Especialistas (N3)
           ├── Badge SEV-1 (vermelho piscante) no Dashboard Operacional
           └── E-mail broadcast aos usuários do serviço afetado:
               "O serviço {X} está sendo atendido pela equipe de TI.
                Previsão de retorno: em apuração."

T + 15min  SE técnico não atribuído:
           └── IT_MANAGER notificado novamente + comentário de sistema no incidente

T + 30min  PRIMEIRA ATUALIZAÇÃO OBRIGATÓRIA:
           ├── Técnico registra comentário interno com diagnóstico parcial
           └── Segunda comunicação aos usuários afetados (se > 15 min sem retorno)

T + 60min  SE não resolvido:
           ├── IT_MANAGER conduz bridge call com equipe técnica
           ├── Análise de workaround para mitigar impacto imediato
           └── Terceira comunicação com ETA atualizado

T + 90min  SE não resolvido:
           ├── IT_MANAGER aciona comunicação formal à Diretoria
           └── Acionamento de fornecedor externo se aplicável

T + 2h     VIOLAÇÃO DE SLA:
           ├── Evento SlaBreached registrado permanentemente
           ├── Relatório parcial gerado automaticamente pelo sistema
           └── Diretoria notificada formalmente sobre violação

T + Resolução:
           ├── Notificação a TODOS os usuários do serviço: "Serviço restaurado"
           ├── Comentário de resolução detalhado no incidente
           └── Timer de post-mortem iniciado (prazo: 5 dias úteis)

T + 5 dias úteis após resolução:
           └── Post-mortem obrigatório entregue ao IT_MANAGER
```

### 17.3 Modelo de Relatório de Post-Mortem SEV-1

| Seção | Conteúdo Obrigatório |
|-------|---------------------|
| **1. Resumo Executivo** | Descrição em 1 parágrafo: o que aconteceu, duração total, impacto em usuários e operações |
| **2. Linha do Tempo** | Cronologia detalhada com timestamps: detecção → escalações → ações → resolução |
| **3. Causa Raiz** | Causa raiz confirmada com método de análise utilizado (5 Porquês, Ishikawa, etc.) |
| **4. Impacto Quantificado** | Usuários afetados, serviços impactados, tempo de indisponibilidade, estimativa de impacto financeiro |
| **5. Ações de Resposta** | O que foi feito, por quem e em que ordem durante o incidente |
| **6. O que Funcionou** | Aspectos do processo de resposta que se mostraram eficientes |
| **7. O que Falhou** | Aspectos que atrasaram ou complicaram a resolução |
| **8. Ações Corretivas** | Lista de tarefas concretas com responsável, prazo e critério de conclusão |
| **9. Prevenção de Recorrência** | Melhorias de processo, monitoramento, infraestrutura ou documentação para evitar recorrência |

---

## 18. Auditoria e Rastreabilidade

### 18.1 Política de Auditoria do Módulo

Toda operação de escrita em qualquer dado relacionado a incidentes — campos, comentários, transferências, SLA, avaliações — gera registro imutável em `shared.audit_log`. A tabela de auditoria é protegida por RLS com política INSERT-only: nenhum UPDATE ou DELETE é possível.

### 18.2 Eventos Auditados Obrigatoriamente

| Evento | `action` | `old_values` | `new_values` |
|--------|:--------:|:------------:|:------------:|
| Incidente criado | CREATE | — | todos os campos do incidente |
| Título alterado | UPDATE | título anterior | novo título |
| Descrição alterada | UPDATE | descrição anterior | nova descrição |
| Status alterado | UPDATE | status anterior + timestamp | novo status + timestamp |
| Prioridade reclassificada | UPDATE | prioridade anterior | nova prioridade + justificativa |
| Técnico atribuído / alterado | UPDATE | assignee anterior | novo assignee |
| Grupo alterado | UPDATE | grupo anterior | novo grupo |
| Transferência realizada | UPDATE | técnico/grupo origem | técnico/grupo destino + motivo |
| Comentário adicionado (público) | CREATE | — | conteúdo + tipo + autor |
| Comentário adicionado (interno) | CREATE | — | conteúdo + tipo + autor |
| Anexo adicionado | CREATE | — | filename + size + uploader |
| SLA pausado | UPDATE | sla_paused_at: null | sla_paused_at: timestamp + reason |
| SLA retomado | UPDATE | sla_paused_at: timestamp | sla_paused_at: null |
| SLA violado (Breach) | CREATE | — | SLAHistory com breach info |
| Incidente resolvido | UPDATE | status RESOLVED | solução + causa |
| Incidente encerrado | UPDATE | status CLOSED | CSAT se fornecido |
| Incidente reaberto | UPDATE | status CLOSED | status OPEN + justificativa |
| Incidente cancelado | UPDATE | status anterior | CANCELLED + motivo |
| Ativo vinculado | UPDATE | asset_id: null | asset_id: uuid |
| Problema vinculado | UPDATE | problem_id: null | problem_id: uuid |
| Artigo KB vinculado | UPDATE | kb_article_id: null | kb_article_id: uuid |
| SEV-1 declarado | UPDATE | sev_level: null | sev_level: 1 + declared_by |
| Categoria / Subcategoria alterada | UPDATE | valores anteriores | novos valores |

### 18.3 Timeline do Incidente na Interface

A página de cada incidente exibe uma timeline cronológica unificada e imutável de todos os eventos:

```
TIMELINE DO INCIDENTE INC-2026-000042

 09:15  📋 CRIADO por João Silva via Portal
        Serviço: VPN Corporativa | Prioridade: ALTO
        SLA Resolução: hoje às 13:15

 09:17  📨 NOTIFICAÇÃO enviada para Ana Lima (Coordenadora TI)

 09:20  👤 ATRIBUÍDO para Ana Lima (Suporte N2)
        SLA Resposta: CUMPRIDO (5 min < 30 min)

 09:22  🔄 STATUS → EM ATENDIMENTO (IN_PROGRESS)

 09:45  🔒 COMENTÁRIO INTERNO — Ana Lima
        "Acessado servidor VPN via SSH. Logs indicam certificado
         expirado em 13/06 às 23:59. Iniciando renovação via
         script de administração Let's Encrypt."

10:10  💬 COMENTÁRIO PÚBLICO — Ana Lima
        "Identificamos o problema: certificado de segurança expirado.
         Estamos aplicando a solução. Retorno em aprox. 20 minutos."

11:00  ✅ RESOLVIDO por Ana Lima
        Causa: SOFTWARE / Certificado SSL Expirado
        Solução: "Certificado SSL do servidor VPN renovado via script
         Let's Encrypt. Serviço validado com 3 usuários afetados.
         Próxima expiração: 13/09/2026."
        Artigo KB: KB-2026-000089 — vinculado
        SLA: CUMPRIDO (1h45 de 4h disponíveis)

11:02  ⭐ AVALIAÇÃO DO USUÁRIO: 5/5
        "Problema resolvido rapidamente. Comunicação excelente."

11:02  🔒 ENCERRADO (confirmação do usuário)
```

Comentários internos exibem ícone 🔒 apenas para IT_TECHNICIAN+. Usuário final não visualiza estes registros.

---

## 19. Dashboards e Indicadores

### 19.1 Dashboard Operacional — Visão em Tempo Real

**Destino:** Analistas, Coordenadores e Gestor. Atualizado em tempo real via Supabase Realtime (< 5 segundos).

| Componente | Tipo | Dados Exibidos |
|------------|:----:|---------------|
| **Fila Atual** | Contadores | Abertos por prioridade: 🔴 CRÍTICO · 🟠 ALTO · 🟡 MÉDIO · ⚪ BAIXO |
| **Sem Atribuição** | Contador + lista | Incidentes sem técnico; alerta se > 0 CRÍTICOS |
| **SLA em Risco** | Lista urgente | Incidentes com > 80% do prazo consumido, ordenados por urgência |
| **SLA Violados (abertos)** | Lista | Incidentes violados ainda não resolvidos, com tempo de violação |
| **Minha Fila** | Lista pessoal | Chamados atribuídos ao técnico logado, por prioridade + SLA |
| **Fila por Técnico** | Barras | Volume atribuído por analista — distribuição de carga |
| **Distribuição por Status** | Pizza | OPEN / IN_PROGRESS / PENDING / ESCALATED em tempo real |
| **Alertas Ativos** | Feed | Notificações pendentes de ação: CRÍTICOS não atribuídos, violações |

### 19.2 Dashboard Executivo — KPIs do Período

**Destino:** IT_MANAGER e Executivos. Período configurável: hoje, semana atual, mês atual, mês anterior, trimestre.

| KPI | Fórmula de Cálculo | Meta Corporativa |
|-----|-------------------|:----------------:|
| **Incidentes Abertos** | COUNT(status NOT IN CLOSED, CANCELLED) | — |
| **Incidentes Fechados no Período** | COUNT(closed_at BETWEEN período) | Tendência crescente |
| **MTTR** (Mean Time to Repair) | AVG(resolved_at - created_at) em horas úteis | Redução mensal |
| **MTBF** (Mean Time Between Failures) | Intervalo médio entre incidentes do mesmo serviço por serviço | Aumento mensal |
| **SLA Cumprido (%)** | COUNT(resolvidos dentro do prazo) / COUNT(total resolvidos) × 100 | ≥ 95% |
| **SLA Violado (%)** | COUNT(violados) / COUNT(total resolvidos) × 100 | ≤ 5% |
| **CSAT Médio** | AVG(csat_score) de incidentes fechados com avaliação | ≥ 4,0 / 5,0 |
| **Taxa de Reabertura** | COUNT(reabertos) / COUNT(fechados) × 100 | ≤ 8% |
| **FCR — First Contact Resolution** | COUNT(resolvidos sem escalonamento) / COUNT(total) × 100 | ≥ 70% |
| **Taxa de Deflexão KB** | COUNT(chamados não abertos após ver KB) / COUNT(visitantes KB) × 100 | ≥ 15% |

### 19.3 Gráficos Analíticos

| Gráfico | Tipo Visual | Dimensões | Objetivo |
|---------|:-----------:|----------|---------|
| Volume de incidentes por período | Linha + área | Dia / semana / mês vs. período anterior | Tendência de volume |
| Incidentes por serviço | Barras horizontais | Top 10 serviços por volume | Serviços problemáticos |
| Incidentes por categoria | Barras horizontais | Top 10 categorias por volume | Tipos mais comuns |
| Incidentes por analista | Barras agrupadas | Volume, MTTR e CSAT por técnico | Desempenho individual |
| Distribuição SLA cumprido vs. violado | Pizza segmentada | Por prioridade | Aderência ao SLA |
| MTTR por prioridade | Barras agrupadas | CRÍTICO / ALTO / MÉDIO / BAIXO | Eficiência por nível |
| Incidentes críticos (SEV-1) por mês | Linha | 12 meses | Tendência de criticidade |
| Heatmap de volume por hora e dia | Mapa de calor | Hora (0–23) × Dia (seg–dom) | Picos de demanda e dimensionamento |
| Taxa de FCR por mês | Gauge + linha | Mensal | Eficiência N1 |
| Tendência de CSAT | Linha | Mensal, 12 meses | Satisfação do usuário |

### 19.4 Projeções e Alertas Inteligentes

O dashboard inclui:

- **Projeção de fechamento do mês:** baseada na taxa de resolução dos últimos 7 dias.
- **Alerta de capacidade:** quando a fila per capita supera 15 incidentes por técnico disponível.
- **Alerta de tendência negativa:** quando volume cresce > 20% comparado à mesma semana do mês anterior.
- **Alerta de qualidade:** quando CSAT médio cai abaixo de 3,5 em 7 dias consecutivos.
- **Serviço problemático:** quando um serviço específico ultrapassa 10% do volume total de incidentes do mês.

---

## 20. Relatórios

### 20.1 Relatórios Operacionais Automáticos

Gerados automaticamente pelo sistema sem intervenção manual:

| Relatório | Geração | Destinatário | Conteúdo |
|-----------|:-------:|:------------:|---------|
| **Incidentes do Dia** | Diária (06h00) | IT_MANAGER | Volume, abertos, fechados, violações, SEV-1 do dia anterior |
| **SLA Diário** | Diária (06h00) | IT_MANAGER | % SLA global, lista de violações, tendência |
| **Fila da Semana** | Semanal (seg 07h) | IT_MANAGER + Coordenadores | Volume por técnico, incidentes > 3 dias abertos |
| **Sem Resolução (> 48h)** | Diária | IT_MANAGER | Incidentes abertos há mais de 2 dias úteis sem resolução |
| **Incidentes Críticos do Mês** | Mensal (1º dia útil) | IT_MANAGER | Lista completa de CRÍTICO e SEV-1 com detalhes |

### 20.2 Relatórios Executivos

| Relatório | Frequência | Destinatário | Conteúdo Principal |
|-----------|:----------:|:------------:|-------------------|
| **Performance Mensal de TI** | Mensal | IT_MANAGER + Diretoria | KPIs: SLA global, MTTR, CSAT, FCR, tendências de 6 meses |
| **Análise de Recorrência** | Mensal | IT_MANAGER | Serviços e categorias com maior reincidência; correlação com Problemas |
| **Produtividade da Equipe** | Mensal | IT_MANAGER | FCR, MTTR, CSAT por técnico (anonimizado em versão externa) |
| **Análise de Causas Raiz** | Trimestral | IT_MANAGER | Causas mais frequentes por categoria; efetividade das ações corretivas |
| **Relatório Executivo de TI** | Trimestral | Diretoria | Visão estratégica: evolução de KPIs, investimentos, riscos, recomendações |

### 20.3 Relatórios sob Demanda

Todos os relatórios podem ser gerados manualmente com filtros customizados:

| Filtro Disponível | Tipo | Exemplo |
|-------------------|:----:|---------|
| Período | Data | 01/06/2026 a 30/06/2026 |
| Prioridade | Multi-seleção | CRÍTICO, ALTO |
| Serviço | Multi-seleção | VPN, E-mail, ERP |
| Categoria | Multi-seleção | Rede, Software |
| Técnico responsável | Multi-seleção | Ana Lima, Carlos Souza |
| Status | Multi-seleção | CLOSED, RESOLVED |
| SLA | Seleção | Cumprido, Violado |
| Departamento | Multi-seleção | TI, Financeiro, Comercial |

**Formatos de exportação:** PDF (layout formal para apresentação) e Excel (dados brutos para análise).

**Geração assíncrona:** relatórios com > 1.000 registros são processados em background com notificação ao usuário quando disponíveis. Histórico de relatórios gerados disponível por 24 horas com link de download.

---

## 21. Regras de Negócio

Regras numeradas e específicas do Módulo de Gestão de Incidentes. Regras globais do sistema estão em `Docs/24_BUSINESS_RULES.md` (BR-INC-001 a BR-INC-013).

---

**INC-001** — Vínculo obrigatório com o catálogo
Todo incidente deve ser vinculado a um serviço com status `PUBLISHED` no Catálogo de Serviços. A ausência de `catalog_id` impede a criação do incidente.

---

**INC-002** — Prioridade calculada, não escolhida pelo usuário
A prioridade é calculada automaticamente pela matriz Impacto × Urgência. O usuário final informa impacto e urgência; o sistema determina a prioridade. Reclassificação manual só é permitida a IT_TECHNICIAN+ com justificativa documentada.

---

**INC-003** — SLA obrigatório desde a criação
O SLA é calculado e vinculado no momento da criação. Um incidente sem SLA calculado é tecnicamente inválido e gera alerta de sistema.

---

**INC-004** — Notificação obrigatória ao Coordenador de Tecnologia
Todo incidente aberto notifica automaticamente o Coordenador de Tecnologia (IT_MANAGER). Esta notificação é inviolável, independentemente da prioridade ou origem do incidente.

---

**INC-005** — Escalonamento automático de CRÍTICO sem atribuição
Incidente CRÍTICO sem técnico atribuído após 15 minutos gera alerta automático ao IT_MANAGER e ao grupo responsável pelo serviço.

---

**INC-006** — Solução obrigatória ao resolver
O campo "Solução Aplicada" é obrigatório ao resolver (mínimo 30 caracteres). O sistema rejeita respostas genéricas como "resolvido", "ok", "feito" ou qualquer valor com menos de 30 caracteres não triviais.

---

**INC-007** — CLOSED é somente leitura
Incidente com status CLOSED é somente leitura. Nenhuma alteração de campo, comentário ou anexo é permitida. A única operação possível é a reabertura.

---

**INC-008** — Janela de reabertura de 7 dias
Reabertura pelo solicitante: até 7 dias corridos após encerramento com justificativa (mín. 20 chars). Após 7 dias: apenas IT_MANAGER+ pode reabrir.

---

**INC-009** — Novo SLA na reabertura
Ao reabrir, SLA calculado do zero a partir do momento da reabertura. Histórico anterior preservado integralmente. Violação anterior não é apagada.

---

**INC-010** — Número imutável
O número do incidente (INC-YYYY-NNNNNN) é sequencial, único e imutável após criação. Nenhuma operação pode alterar o número.

---

**INC-011** — SLA pausa automaticamente em PENDING_USER
Status PENDING_USER pausa o contador de SLA automaticamente. Retomada automática quando solicitante comenta, ou manual quando técnico altera o status.

---

**INC-012** — Tempo pausado descontado do prazo
Prazo efetivo = prazo_original + total_paused_minutes. O desconto é aplicado automaticamente pelo `SlaCalculationService`.

---

**INC-013** — SLA violado é permanente
Evento SlaBreached é permanente e irreversível. Resolução posterior não desfaz a violação registrada em SLAHistory.

---

**INC-014** — Atualização obrigatória em CRÍTICO a cada 1 hora
Incidente CRÍTICO sem comentário técnico (INTERNAL) por mais de 1 hora gera notificação ao técnico atribuído e ao IT_MANAGER.

---

**INC-015** — Limite de incidentes abertos por ativo
Mesmo ativo com mais de 2 incidentes abertos simultaneamente: sistema exibe aviso e sugere vinculação ao Problema correspondente ao criar o terceiro.

---

**INC-016** — Fechamento automático pós-RESOLVED
Incidente é encerrado automaticamente 72 horas após RESOLVED, se o solicitante não confirmar nem reabrir. Fechamento registrado como comentário de sistema.

---

**INC-017** — ID GLPI imutável
O campo `glpi_ticket_id` é imutável após preenchido. Não é possível alterar o ID GLPI de um incidente já sincronizado.

---

**INC-018** — Motivo obrigatório em transferências
Toda transferência de incidente exige motivo documentado (mínimo 20 caracteres). Transferências sem motivo são rejeitadas pela validação.

---

**INC-019** — Histórico de transferências imutável
Registros em TransferHistory não podem ser editados ou excluídos após criação.

---

**INC-020** — Comentários INTERNAL invisíveis para END_USER
Comentários marcados como INTERNAL não são visíveis nem listados para usuários com papel END_USER.

---

**INC-021** — CANCELLED é terminal e irreversível
Incidente cancelado não pode ser reativado. Nova ocorrência exige criação de novo incidente.

---

**INC-022** — Cancelamento exige justificativa
Cancelamento requer justificativa com mínimo de 20 caracteres. Sem justificativa, a operação é bloqueada.

---

**INC-023** — Cancelamento: quem pode
Solicitante pode cancelar apenas incidentes próprios com status OPEN. Demais status: apenas IT_MANAGER+.

---

**INC-024** — Declaração manual de SEV-1
IT_TECHNICIAN+ pode declarar manualmente SEV-1 durante o atendimento ao identificar os critérios definidos na seção 17.1, mesmo que o incidente tenha sido criado com prioridade inferior.

---

**INC-025** — Post-mortem obrigatório para SEV-1
Todo incidente SEV-1 exige relatório de post-mortem em até 5 dias úteis após resolução. Ausência gera alerta semanal ao IT_MANAGER.

---

**INC-026** — Impacto no negócio obrigatório para CRÍTICO
O campo "Impacto no Negócio" é obrigatório ao fechar incidente com prioridade CRÍTICO. Sem esse campo, o encerramento é bloqueado.

---

**INC-027** — Categoria Segurança notifica grupo de segurança
Incidente classificado como "Segurança da Informação" notifica automaticamente o grupo de Segurança TI, independentemente do grupo que recebeu o chamado inicialmente.

---

**INC-028** — Incidente com dados pessoais: compliance
Incidente que envolva dados pessoais identificados deve ser vinculado automaticamente ao módulo de Compliance para rastreabilidade LGPD (Art. 48).

---

**INC-029** — Sugestão de Problema para incidentes similares
Quando dois ou mais incidentes do mesmo serviço são abertos no mesmo período com similaridade semântica ≥ 80%, o sistema sugere criação de Problema, sem bloquear a abertura individual.

---

**INC-030** — CSAT apenas pelo solicitante original
A nota CSAT só pode ser fornecida pelo solicitante original. Técnicos e gestores não podem fornecer avaliação em nome do solicitante.

---

**INC-031** — Segunda reabertura gera alerta de Problema
Incidente reaberto pela segunda vez para o mesmo sintoma e serviço gera alerta ao IT_MANAGER e sugestão automática de criação de Problema.

---

**INC-032** — Transferência de CRÍTICO notifica IT_MANAGER
Transferência de incidente CRÍTICO notifica o IT_MANAGER automaticamente, independentemente de quem iniciou.

---

**INC-033** — Data de abertura imutável e gerada pelo banco
O campo `created_at` é preenchido pelo banco de dados (DEFAULT NOW()). Nenhum cliente pode fornecer ou alterar este valor.

---

**INC-034** — Origem imutável após criação
O campo `origem` reflete o canal de entrada real e não pode ser alterado após criação.

---

**INC-035** — E-mail da mesma thread não cria novo incidente
E-mail recebido com `In-Reply-To` ou `References` de uma thread existente é adicionado como comentário no incidente existente — nunca cria novo incidente.

---

**INC-036** — Incidente de monitoramento: atribuição automática
Incidente criado pela origem MONITORING é atribuído automaticamente ao técnico de plantão conforme escala configurada. Ausência de escala: atribuição ao grupo de infraestrutura.

---

**INC-037** — Tipos e tamanho de anexos
Tipos aceitos: PDF, PNG, JPG, GIF, DOCX, XLSX, CSV, TXT, LOG, ZIP, MP4. Tamanho máximo: 50 MB por arquivo. Outros tipos são rejeitados por validação de MIME type no upload.

---

**INC-038** — CSAT individual: uso restrito
O CSAT individual do analista não é exibido em relatórios públicos — apenas como agregado da equipe. Relatórios internos para IT_MANAGER podem exibir médias por técnico.

---

**INC-039** — Volume > 50 usuários: CRÍTICO obrigatório
Incidente com "Usuários Afetados" > 50, independente da prioridade calculada pela matriz I×U, deve ser elevado para CRÍTICO pelo técnico na triagem.

---

**INC-040** — Criação via API exige API Key com escopo correto
Incidente criado via API requer autenticação com API Key com escopo `incident:create`. Tentativas sem autenticação adequada retornam 401 e são registradas em auditoria.

---

**INC-041** — Ativo em manutenção: SLA pausado
Incidente com ativo vinculado em status `UNDER_MAINTENANCE` tem SLA pausado automaticamente. Ao concluir a manutenção, o SLA retoma automaticamente.

---

**INC-042** — Artigo KB vinculado: contadores atualizados
Artigo KB vinculado ao incidente na resolução incrementa automaticamente `view_count` e `helpful_count` do artigo.

---

**INC-043** — Relatório mensal automático
O relatório mensal de incidentes é gerado automaticamente no primeiro dia útil de cada mês às 06h00 e enviado por e-mail ao IT_MANAGER.

---

**INC-044** — CRÍTICO: causa raiz obrigatória para encerramento
Incidente com prioridade CRÍTICO requer causa raiz documentada (campo "Causa" preenchido) antes do encerramento. Sem causa documentada, o CLOSED é bloqueado.

---

**INC-045** — Pausa de SLA: apenas em status autorizados
O SLA só pode ser pausado quando o chamado está em status `PENDING_USER` ou `PENDING_THIRD_PARTY`. Tentativas de pausar SLA em qualquer outro status são rejeitadas com erro 422.

---

## 22. Critérios de Aceitação

Os seguintes critérios devem ser validados durante a homologação do Módulo de Gestão de Incidentes. Todos os critérios devem ser atendidos para aprovação do módulo em produção.

### 22.1 Registro e Abertura

- [ ] **CA-01:** Usuário consegue abrir incidente pelo portal em no máximo 3 interações de navegação a partir da página inicial.
- [ ] **CA-02:** Formulário exibe apenas serviços com status PUBLISHED do catálogo; serviços DRAFT ou DEPRECATED não aparecem.
- [ ] **CA-03:** Prioridade é calculada automaticamente pela matriz I×U e não pode ser alterada pelo usuário final.
- [ ] **CA-04:** Número do incidente (INC-YYYY-NNNNNN) é gerado e exibido ao usuário imediatamente após submissão.
- [ ] **CA-05:** SLA de primeira resposta e resolução são calculados corretamente e exibidos ao abrir o incidente.
- [ ] **CA-06:** Usuário recebe e-mail de confirmação em até 1 minuto após abertura, com número, prioridade e SLA.
- [ ] **CA-07:** Coordenador de Tecnologia recebe notificação em até 1 minuto após abertura de qualquer incidente.
- [ ] **CA-08:** Artigos relacionados da KB são sugeridos automaticamente ao preencher o título do incidente.

### 22.2 Classificação e Priorização

- [ ] **CA-09:** Matriz I×U produz resultados corretos para todas as 16 combinações de impacto × urgência.
- [ ] **CA-10:** Incidente com campo "usuários afetados" > 50 é automaticamente elevado para CRÍTICO.
- [ ] **CA-11:** Incidente CRÍTICO notifica IT_MANAGER imediatamente (< 1 min) após abertura.
- [ ] **CA-12:** Incidente CRÍTICO sem atribuição após 15 min gera alerta ao IT_MANAGER.
- [ ] **CA-13:** Reclassificação manual de prioridade exige justificativa e é registrada em auditoria.

### 22.3 Fluxo de Atendimento

- [ ] **CA-14:** Todas as transições de status permitidas funcionam corretamente.
- [ ] **CA-15:** Transições não permitidas são rejeitadas com mensagem de erro clara e código HTTP 422.
- [ ] **CA-16:** SLA pausa ao mudar para PENDING_USER e retoma ao mudar para IN_PROGRESS.
- [ ] **CA-17:** Tempo pausado é corretamente descontado do prazo de resolução efetivo.
- [ ] **CA-18:** Incidente é encerrado automaticamente 72h após RESOLVED sem resposta do usuário.
- [ ] **CA-19:** Reabertura dentro de 7 dias recalcula SLA do zero; histórico anterior preservado.
- [ ] **CA-20:** Reabertura após 7 dias é bloqueada para usuário final com mensagem orientativa.
- [ ] **CA-21:** Campo "Solução Aplicada" com menos de 30 caracteres ou com texto genérico é rejeitado ao resolver.
- [ ] **CA-22:** Fechamento de incidente CRÍTICO sem causa documentada é bloqueado.

### 22.4 SLA e Alertas

- [ ] **CA-23:** Badge de SLA muda de cor progressivamente: verde → amarelo → laranja → vermelho.
- [ ] **CA-24:** Alerta de SLA em risco (80%) notifica técnico e IT_MANAGER dentro de 1 ciclo do job (5 minutos).
- [ ] **CA-25:** Violação de SLA é registrada permanentemente no SLAHistory e não é revertida por resolução posterior.
- [ ] **CA-26:** Dashboard operacional reflete status de SLA em tempo real (< 5 segundos de defasagem).
- [ ] **CA-27:** SLA calculado corretamente em horário comercial (não conta fins de semana e horários fora do expediente).

### 22.5 Integrações

- [ ] **CA-28:** Incidente aberto no SGTI aparece no GLPI em até 10 segundos após criação.
- [ ] **CA-29:** Falha no GLPI não bloqueia abertura de incidente no SGTI.
- [ ] **CA-30:** Comentários adicionados no GLPI são importados no SGTI com source = GLPI_SYNC.
- [ ] **CA-31:** Artigos da KB são sugeridos ao digitar o título com debounce correto.
- [ ] **CA-32:** Workaround publicado para o serviço é exibido em banner destacado ao abrir o incidente.
- [ ] **CA-33:** Vinculação de incidente a Problema exibido em ambos os registros.
- [ ] **CA-34:** Ativo vinculado exibe o incidente em seu histórico.
- [ ] **CA-35:** Geração de rascunho DRAFT_AI na KB após resolução de incidente com solução inédita.

### 22.6 Notificações

- [ ] **CA-36:** E-mail de abertura enviado ao solicitante com número, prioridade e prazo de SLA.
- [ ] **CA-37:** E-mail de resolução contém botões funcionais de "Confirmar Resolução" e "Reabrir Chamado".
- [ ] **CA-38:** Resposta ao e-mail de notificação é adicionada como comentário no incidente (source = EMAIL).
- [ ] **CA-39:** Assunto do e-mail segue o padrão `[INC-YYYY-NNNNNN] Título do Incidente`.
- [ ] **CA-40:** Lembrete enviado ao solicitante em PENDING_USER aos 3 dias; aviso de fechamento aos 5 dias.

### 22.7 Auditoria e Rastreabilidade

- [ ] **CA-41:** Timeline do incidente exibe todos os eventos em ordem cronológica rigorosa.
- [ ] **CA-42:** Comentários INTERNAL não são visíveis para usuários END_USER em nenhuma circunstância.
- [ ] **CA-43:** TransferHistory registra data, origem, destino, motivo e tipo de transferência.
- [ ] **CA-44:** Audit_log registra todas as operações de escrita com old_values e new_values.
- [ ] **CA-45:** Políticas RLS impedem UPDATE e DELETE na tabela shared.audit_log (verificar com operação direta no banco).
- [ ] **CA-46:** Data de abertura (created_at) não pode ser forneida ou alterada via API.

### 22.8 Relatórios e Dashboard

- [ ] **CA-47:** Dashboard operacional exibe incidentes abertos por prioridade em tempo real.
- [ ] **CA-48:** MTTR, SLA cumprido (%) e CSAT médio são calculados corretamente para o período selecionado.
- [ ] **CA-49:** Relatório mensal é gerado automaticamente no primeiro dia útil do mês às 06h00.
- [ ] **CA-50:** Exportação de relatório em PDF e Excel funciona com filtros aplicados corretamente.

### 22.9 Segurança e Conformidade

- [ ] **CA-51:** Usuário END_USER visualiza apenas seus próprios incidentes (verificar com usuário de teste).
- [ ] **CA-52:** IT_TECHNICIAN visualiza incidentes do seu grupo mas não de outros grupos (verificar isolamento).
- [ ] **CA-53:** RLS do banco de dados impede acesso a incidentes de outros tenants (verificar com query direta).
- [ ] **CA-54:** Incidente de categoria Segurança da Informação notifica o grupo de segurança automaticamente.
- [ ] **CA-55:** Nenhum campo PII (nome completo, e-mail) aparece em logs de sistema — apenas user_id pseudônimo.
- [ ] **CA-56:** Criação de incidente via API sem API Key válida retorna 401 e registra tentativa em auditoria.

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição da Alteração |
|--------|------|-------|------------------------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação inicial do documento |
| 2.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Expansão completa: 22 seções, 45 regras INC-001 a INC-045, 56 critérios de aceitação |

---

> **Próximos documentos recomendados (módulos sequenciais):**
> [`41_REQUEST_MANAGEMENT.md`](./41_REQUEST_MANAGEMENT.md) — Módulo de Gestão de Requisições
> [`42_PROBLEM_MANAGEMENT.md`](./42_PROBLEM_MANAGEMENT.md) — Módulo de Gestão de Problemas
> [`43_ASSET_MANAGEMENT.md`](./43_ASSET_MANAGEMENT.md) — Módulo de Gestão de Ativos
