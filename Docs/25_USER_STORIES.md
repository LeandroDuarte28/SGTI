# SGTI — Sistema de Gestão de Tecnologia da Informação
## Histórias de Usuário

> **Classificação:** Interno — Restrito
> **Versão:** 2.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [24_BUSINESS_RULES.md](./24_BUSINESS_RULES.md) · [23_USER_ROLES.md](./23_USER_ROLES.md) · [21_API_SPEC.md](./21_API_SPEC.md)

---

## Sobre este Documento

Este documento reúne as **histórias de usuário do SGTI**, organizadas por módulo e perfil. Cada história segue o formato padrão com critérios de aceitação verificáveis e rastreabilidade com as regras de negócio.

### Formato

```
US-[MÓDULO]-[NNN] — [Título]
Como [perfil],
quero [objetivo],
para [benefício].

Critérios de Aceitação:
  CA-1: [condição verificável]
  ...

Regras de Negócio: BR-XXX-NNN
Prioridade: [MVP | ALTA | MÉDIA | BAIXA]
```

### Prioridades

| Prioridade | Definição |
|------------|-----------|
| **MVP** | Essencial para o go-live |
| **ALTA** | Deve estar no primeiro release |
| **MÉDIA** | Pode entrar em release subsequente |
| **BAIXA** | Backlog para versões futuras |

---

## Sumário

1. [Incidentes (13 histórias)](#1-incidentes)
2. [Requisições (7 histórias)](#2-requisições)
3. [Problemas (6 histórias)](#3-problemas)
4. [Ativos (9 histórias)](#4-ativos)
5. [Identidades (6 histórias)](#5-identidades)
6. [Compliance (7 histórias)](#6-compliance)
7. [Financeiro (5 histórias)](#7-financeiro)
8. [Compras (5 histórias)](#8-compras)
9. [Projetos (5 histórias)](#9-projetos)
10. [Base de Conhecimento (8 histórias)](#10-base-de-conhecimento)
11. [Dashboard (10 histórias)](#11-dashboard)

---

## 1. Incidentes

---

**US-INC-001** — Abrir incidente pelo portal de autoatendimento
Como **Usuário**,
quero abrir um chamado de incidente descrevendo o problema que estou enfrentando,
para que a equipe de TI seja notificada e possa me ajudar rapidamente.

**Critérios de Aceitação:**
- CA-1: O formulário apresenta campos de título, descrição, impacto percebido e urgência.
- CA-2: Somente serviços com status `PUBLISHED` do catálogo são listados para seleção.
- CA-3: Ao submeter, o sistema gera o número único do chamado e exibe na confirmação.
- CA-4: O usuário recebe e-mail de confirmação com o número e prazo de SLA calculado.
- CA-5: A prioridade é calculada automaticamente pelo sistema — o usuário não a define.
- CA-6: O chamado aparece imediatamente em "Meus Chamados" com status `OPEN`.
- CA-7: Artigos relacionados da KB são sugeridos automaticamente com base no título.

**Regras de Negócio:** BR-INC-001, BR-INC-002, BR-INC-003, BR-INC-008
**Prioridade:** MVP

---

**US-INC-002** — Acompanhar status do chamado em tempo real
Como **Usuário**,
quero acompanhar o status e o andamento do meu chamado em tempo real,
para saber o que está sendo feito e quando meu problema será resolvido.

**Critérios de Aceitação:**
- CA-1: A página do chamado exibe status, técnico atribuído e countdown do SLA com código de cor.
- CA-2: Comentários públicos do técnico são exibidos em ordem cronológica com data e hora.
- CA-3: Notificação in-app e e-mail são disparados a cada mudança de status relevante.
- CA-4: O indicador de SLA muda: verde (no prazo), amarelo (risco), vermelho (violado).
- CA-5: Comentários marcados como INTERNAL não são exibidos para o usuário final.
- CA-6: O usuário pode clicar no nome do técnico para ver somente o nome de exibição, sem dados pessoais adicionais.

**Regras de Negócio:** BR-INC-008, BR-SLA-003
**Prioridade:** MVP

---

**US-INC-003** — Adicionar informações ao chamado após abertura
Como **Usuário**,
quero adicionar comentários e anexos ao meu chamado depois de aberto,
para fornecer detalhes adicionais que auxiliem o técnico na resolução.

**Critérios de Aceitação:**
- CA-1: Campo de comentário disponível em chamados próprios com status diferente de `CLOSED`.
- CA-2: Upload de arquivos aceita PDF, PNG, JPG, DOCX com limite de 50 MB por arquivo.
- CA-3: O comentário aparece imediatamente na timeline após submissão.
- CA-4: O técnico atribuído recebe notificação in-app do novo comentário do usuário.
- CA-5: O histórico de comentários e anexos é preservado mesmo após o fechamento do chamado.

**Regras de Negócio:** BR-INC-008
**Prioridade:** MVP

---

**US-INC-004** — Confirmar resolução e avaliar o atendimento
Como **Usuário**,
quero confirmar que meu problema foi resolvido e avaliar o atendimento recebido,
para dar feedback à equipe de TI sobre a qualidade do serviço.

**Critérios de Aceitação:**
- CA-1: Ao entrar em `RESOLVED`, o usuário recebe notificação com botões "Confirmar" e "Reabrir".
- CA-2: Ao confirmar, o sistema solicita nota de 1 a 5 estrelas (obrigatória) e comentário (opcional).
- CA-3: Após confirmação com nota, o chamado muda para `CLOSED`.
- CA-4: Se o usuário não responder em 72 horas, o chamado é fechado automaticamente.
- CA-5: A nota CSAT é registrada e usada nos indicadores do dashboard.
- CA-6: O técnico não vê avaliações individuais — apenas médias agregadas são exibidas.

**Regras de Negócio:** BR-INC-012
**Prioridade:** ALTA

---

**US-INC-005** — Reabrir chamado com problema recorrente
Como **Usuário**,
quero reabrir um chamado já fechado quando o problema voltar a ocorrer,
para não perder o histórico e evitar duplicação de registros.

**Critérios de Aceitação:**
- CA-1: O botão "Reabrir" fica visível por 7 dias após o fechamento do chamado.
- CA-2: Justificativa de reabertura é obrigatória com mínimo de 20 caracteres.
- CA-3: Ao reabrir, o SLA é recalculado a partir da data de reabertura com a prioridade atual.
- CA-4: O histórico anterior é integralmente preservado e visível na timeline.
- CA-5: Após 7 dias do fechamento, o botão desaparece e uma mensagem orienta abrir novo chamado.
- CA-6: O técnico atribuído anteriormente recebe notificação de reabertura.

**Regras de Negócio:** BR-INC-005, BR-SLA-008
**Prioridade:** ALTA

---

**US-INC-006** — Gerenciar fila de incidentes com filtros avançados
Como **Analista de TI**,
quero visualizar e filtrar a fila de incidentes abertos,
para organizar meu trabalho e priorizar o atendimento dos casos mais críticos.

**Critérios de Aceitação:**
- CA-1: A fila exibe: número, título, prioridade, status, solicitante, técnico, SLA restante e serviço.
- CA-2: Filtros disponíveis: prioridade, status, serviço, data de abertura, técnico, grupo, SLA em risco.
- CA-3: Ordenação padrão: prioridade DESC, depois SLA restante ASC.
- CA-4: Chamados com SLA em risco são destacados visualmente com ícone de alerta.
- CA-5: Contador por prioridade exibido no topo da fila com totais do dia.
- CA-6: O filtro de fila é salvo por sessão — ao retornar, os filtros anteriores são mantidos.

**Regras de Negócio:** BR-SLA-003
**Prioridade:** MVP

---

**US-INC-007** — Assumir ou atribuir incidente
Como **Analista de TI**,
quero assumir um incidente ou atribuí-lo a outro técnico do meu grupo,
para formalizar a responsabilidade pelo atendimento e notificar o solicitante.

**Critérios de Aceitação:**
- CA-1: Botão "Assumir" disponível em incidentes sem técnico atribuído.
- CA-2: Modal de atribuição permite selecionar técnico do grupo ou si mesmo.
- CA-3: Ao atribuir, o status muda automaticamente para `IN_PROGRESS`.
- CA-4: O solicitante recebe notificação com o nome do técnico responsável.
- CA-5: O histórico de atribuições fica registrado em TransferHistory com data e usuário.
- CA-6: Técnico não pode atribuir chamado para usuário fora do grupo sem permissão de Coordenador.

**Regras de Negócio:** BR-INC-008
**Prioridade:** MVP

---

**US-INC-008** — Resolver incidente com documentação da solução
Como **Analista de TI**,
quero registrar a solução aplicada ao resolver um incidente,
para documentar o conhecimento e contribuir com a Base de Conhecimento da equipe.

**Critérios de Aceitação:**
- CA-1: Campo "Notas de Resolução" com editor de texto é obrigatório antes de resolver.
- CA-2: Campo opcional para vincular artigo da KB já existente relacionado à solução.
- CA-3: Ao resolver, o sistema sugere artigos KB similares baseados no título e descrição.
- CA-4: Ao salvar, o sistema pergunta se deseja gerar rascunho de artigo KB com a solução.
- CA-5: Status muda para `RESOLVED` apenas após salvar as notas de resolução (mínimo 30 caracteres).
- CA-6: Notificação enviada ao solicitante com resumo da solução.

**Regras de Negócio:** BR-INC-007, BR-KB-005
**Prioridade:** MVP

---

**US-INC-009** — Transferir incidente para grupo especializado
Como **Analista de TI**,
quero transferir um incidente para outro técnico ou grupo especializado,
para garantir que o problema seja resolvido pela equipe mais capacitada.

**Critérios de Aceitação:**
- CA-1: Modal com seleção de técnico ou grupo destino, e campo de motivo obrigatório.
- CA-2: A transferência é registrada em TransferHistory com data, origem e destino.
- CA-3: O técnico ou grupo de destino recebe notificação in-app e e-mail.
- CA-4: O solicitante é notificado da transferência sem revelar o motivo técnico interno.
- CA-5: O SLA continua contando durante a transferência sem interrupção.
- CA-6: O histórico completo de transferências fica visível na timeline do chamado.

**Prioridade:** ALTA

---

**US-INC-010** — Pausar SLA durante aguardo de resposta
Como **Analista de TI**,
quero pausar o contador de SLA quando estou aguardando retorno do usuário ou terceiro,
para que o tempo de espera não seja contabilizado na minha métrica de atendimento.

**Critérios de Aceitação:**
- CA-1: Pausa de SLA disponível apenas ao mudar status para `PENDING_USER` ou `PENDING_THIRD_PARTY`.
- CA-2: Campo de motivo é obrigatório ao pausar.
- CA-3: Badge visual "SLA Pausado" exibido na página do chamado e na fila.
- CA-4: O SLA retoma automaticamente quando o usuário comenta ou o técnico muda o status.
- CA-5: O tempo total de pausa é descontado do cálculo de cumprimento de SLA.
- CA-6: Histórico de pausas (início, fim, motivo) fica registrado no chamado.

**Regras de Negócio:** BR-INC-009, BR-SLA-005, BR-SLA-006
**Prioridade:** ALTA

---

**US-INC-011** — Registrar impacto e causa do incidente
Como **Coordenador de TI**,
quero registrar a causa identificada e os ativos ou serviços impactados pelo incidente,
para documentar o diagnóstico técnico e subsidiar análises de problema.

**Critérios de Aceitação:**
- CA-1: Formulário de causa com seleção de categoria (Hardware, Software, Rede, Configuração, Erro humano) e descrição livre.
- CA-2: Formulário de impacto com tipo (ativo, serviço, grupo, departamento), referência e descrição.
- CA-3: Múltiplas causas e impactos podem ser registrados no mesmo incidente.
- CA-4: Uma causa pode ser sinalizada como "causa raiz confirmada".
- CA-5: Causas e impactos são exibidos na timeline do incidente.
- CA-6: Se mais de 1 ativo for impactado, o sistema sugere verificar se existe problema vinculado.

**Prioridade:** ALTA

---

**US-INC-012** — Vincular incidente a problema existente
Como **Coordenador de TI**,
quero vincular um incidente recorrente a um problema já registrado,
para consolidar a investigação e evitar trabalho duplicado.

**Critérios de Aceitação:**
- CA-1: Busca de problemas ativos pelo título ou número para vinculação.
- CA-2: Ao vincular, o incidente exibe badge "Vinculado a Problema" com link direto.
- CA-3: O problema vinculado exibe a lista de todos os incidentes associados.
- CA-4: Se o problema tiver workaround publicado, ele é sugerido ao técnico do incidente.
- CA-5: A vinculação é registrada no histórico do incidente e do problema.

**Regras de Negócio:** BR-PRB-005
**Prioridade:** ALTA

---

**US-INC-013** — Monitorar incidentes críticos sem atribuição
Como **Gestor de TI**,
quero ser alertado quando incidente crítico ficar sem atribuição técnica por mais de 15 minutos,
para garantir que nenhum incidente de alta severidade fique sem responsável.

**Critérios de Aceitação:**
- CA-1: Notificação in-app e e-mail enviados ao IT_MANAGER após 15 minutos sem atribuição.
- CA-2: A notificação contém: número, título, serviço, prioridade e link direto.
- CA-3: O sistema registra o alerta na timeline do incidente como comentário de sistema.
- CA-4: A notificação é enviada uma única vez por incidente — sem repetição de spam.
- CA-5: Ao atribuir o incidente, o alerta é automaticamente encerrado.
- CA-6: Relatório semanal de incidentes que passaram pelo alerta de ausência de atribuição.

**Regras de Negócio:** BR-INC-006
**Prioridade:** ALTA

---

## 2. Requisições

---

**US-REQ-001** — Solicitar serviço pelo catálogo
Como **Usuário**,
quero solicitar um serviço de TI a partir do catálogo disponível,
para formalizar minha necessidade e acompanhar o andamento de forma transparente.

**Critérios de Aceitação:**
- CA-1: Catálogo exibe serviços agrupados por categoria com campo de busca por texto.
- CA-2: Ao selecionar um serviço, um formulário dinâmico é exibido com os campos definidos pelo tipo de serviço.
- CA-3: Campos obrigatórios são claramente sinalizados com asterisco.
- CA-4: Ao submeter, número de requisição é gerado e exibido na confirmação.
- CA-5: E-mail de confirmação enviado com número, SLA esperado e próximos passos.
- CA-6: A requisição aparece em "Minhas Requisições" com a etapa de aprovação atual.

**Regras de Negócio:** BR-REQ-001, BR-REQ-009
**Prioridade:** MVP

---

**US-REQ-002** — Acompanhar etapas de aprovação
Como **Usuário**,
quero visualizar em qual etapa de aprovação minha requisição se encontra,
para saber se há pendências e estimar quando serei atendido.

**Critérios de Aceitação:**
- CA-1: Timeline visual exibe todas as etapas com status: pendente, aprovado, rejeitado.
- CA-2: O nome do aprovador responsável pela etapa atual é exibido.
- CA-3: Prazo de cada etapa exibido com countdown.
- CA-4: O usuário recebe notificação a cada decisão de aprovação ou rejeição.
- CA-5: Botão "Cancelar" visível enquanto status for `SUBMITTED` ou `PENDING_APPROVAL`.
- CA-6: Ao cancelar, campo de motivo é solicitado e o histórico é preservado.

**Regras de Negócio:** BR-REQ-003, BR-REQ-004
**Prioridade:** MVP

---

**US-REQ-003** — Aprovar ou rejeitar requisição
Como **Coordenador de TI**,
quero aprovar ou rejeitar requisições que chegam à minha etapa do fluxo,
para garantir que apenas solicitações válidas e justificadas sejam atendidas.

**Critérios de Aceitação:**
- CA-1: Página "Aprovações Pendentes" lista requisições aguardando minha decisão com dados resumidos.
- CA-2: Detalhe completo: solicitante, justificativa, formulário preenchido e impacto.
- CA-3: Botões "Aprovar", "Rejeitar" e "Delegar" disponíveis.
- CA-4: Rejeição exige motivo obrigatório de mínimo 20 caracteres, que é enviado ao solicitante.
- CA-5: Sistema bloqueia aprovação de requisição criada pelo próprio aprovador.
- CA-6: Notificação enviada ao solicitante imediatamente após decisão.

**Regras de Negócio:** BR-REQ-002, BR-REQ-007
**Prioridade:** MVP

---

**US-REQ-004** — Delegar aprovação durante ausência
Como **Coordenador de TI**,
quero delegar minha aprovação pendente para um substituto durante ausências,
para que as requisições não fiquem paradas e o atendimento não seja prejudicado.

**Critérios de Aceitação:**
- CA-1: Botão "Delegar" disponível para requisições em minha etapa de aprovação.
- CA-2: Busca de aprovador substituto por nome, com filtro por papel compatível.
- CA-3: Campo de justificativa obrigatório para documentar o motivo da delegação.
- CA-4: Substituto recebe notificação com detalhes completos da requisição.
- CA-5: O histórico de aprovação registra delegação com data, origem e destino.
- CA-6: A delegação pode ser desfeita enquanto o substituto ainda não decidiu.

**Prioridade:** ALTA

---

**US-REQ-005** — Registrar entrega da requisição
Como **Analista de TI**,
quero registrar a conclusão do atendimento de uma requisição após executar a tarefa,
para informar ao solicitante que sua solicitação foi cumprida e encerrar o ciclo.

**Critérios de Aceitação:**
- CA-1: Campo "Notas de Cumprimento" obrigatório ao marcar como `FULFILLED`.
- CA-2: Para requisições de equipamento, o campo de ativo entregue (`asset_id`) é obrigatório.
- CA-3: Para requisições de acesso, o sistema dispara automaticamente o provisionamento no IAM.
- CA-4: O solicitante recebe notificação com as notas de cumprimento.
- CA-5: Status muda para `FULFILLED` e o SLA de cumprimento é registrado.

**Regras de Negócio:** BR-REQ-005, BR-REQ-006
**Prioridade:** MVP

---

**US-REQ-006** — Configurar fluxo de aprovação por tipo de serviço
Como **Gestor de TI**,
quero configurar o fluxo de aprovação de cada tipo de serviço no catálogo,
para garantir que cada requisição passe pelas aprovações corretas antes de ser executada.

**Critérios de Aceitação:**
- CA-1: Interface para adicionar, reordenar e remover etapas do fluxo de aprovação.
- CA-2: Cada etapa define: aprovador por papel ou por usuário fixo, e prazo máximo de decisão.
- CA-3: Opção de aprovação automática para etapas de baixo risco.
- CA-4: Preview do fluxo configurado antes de salvar.
- CA-5: Alteração do fluxo não afeta requisições já em andamento — apenas as novas.
- CA-6: Log de alterações no fluxo de aprovação com data e usuário responsável.

**Prioridade:** ALTA

---

**US-REQ-007** — Monitorar gargalos no processo de aprovação
Como **Gestor de TI**,
quero visualizar quais etapas de aprovação estão gerando atrasos,
para agir preventivamente e garantir que o SLA de requisições seja cumprido.

**Critérios de Aceitação:**
- CA-1: Relatório de aprovações com tempo médio de espera por etapa e aprovador.
- CA-2: Alerta visual para aprovações pendentes há mais de 2 dias úteis.
- CA-3: Possibilidade de reencaminhar aprovação atrasada para outro aprovador sem cancelar a requisição.
- CA-4: Gráfico de tendência do tempo médio de aprovação por mês.
- CA-5: Lista de aprovadores com maior volume de pendências para discussão de capacidade.

**Prioridade:** MÉDIA

---

## 3. Problemas

---

**US-PRB-001** — Criar problema a partir de incidentes recorrentes
Como **Coordenador de TI**,
quero criar um registro de problema vinculando incidentes recorrentes do mesmo serviço,
para iniciar a investigação formal de causa raiz e reduzir a reincidência.

**Critérios de Aceitação:**
- CA-1: Formulário exige título, descrição e vinculação de ao menos um incidente existente.
- CA-2: Múltiplos incidentes podem ser associados ao criar ou editar o problema.
- CA-3: Ao criar, os incidentes vinculados exibem badge "Vinculado a Problema" nas suas páginas.
- CA-4: Status inicial é `UNDER_INVESTIGATION` e número é gerado automaticamente.
- CA-5: Notificação enviada ao IT_MANAGER informando a criação do problema.
- CA-6: O sistema sugere incidentes similares já abertos para vinculação ao criar.

**Regras de Negócio:** BR-PRB-001
**Prioridade:** ALTA

---

**US-PRB-002** — Documentar análise de causa raiz
Como **Coordenador de TI**,
quero registrar a análise de causa raiz com o método utilizado e as evidências levantadas,
para documentar o diagnóstico técnico com rigor metodológico.

**Critérios de Aceitação:**
- CA-1: Seleção obrigatória do método: 5 Porquês, Ishikawa, Árvore de Falhas ou Linha do Tempo.
- CA-2: Editor de texto para análise detalhada com suporte a formatação e listas.
- CA-3: Opção de marcar uma causa como "causa raiz confirmada".
- CA-4: Status do problema atualiza para `ROOT_CAUSE_IDENTIFIED` ao confirmar a causa.
- CA-5: Histórico de todas as hipóteses levantadas é preservado, mesmo as descartadas.

**Regras de Negócio:** BR-PRB-006
**Prioridade:** ALTA

---

**US-PRB-003** — Publicar workaround para alívio imediato
Como **Coordenador de TI**,
quero criar e submeter um workaround para aprovação,
para que técnicos possam aplicar uma solução imediata enquanto a definitiva é desenvolvida.

**Critérios de Aceitação:**
- CA-1: Formulário com título, passos detalhados e limitações conhecidas do workaround.
- CA-2: Rascunho criado em status `DRAFT` e submetido para aprovação do Gestor.
- CA-3: Ao ser publicado pelo Gestor, o problema muda para `KNOWN_ERROR`.
- CA-4: Workaround publicado aparece na KEDB e gera rascunho automático de artigo KB.
- CA-5: Novos incidentes do mesmo serviço recebem sugestão automática do workaround.

**Regras de Negócio:** BR-PRB-002, BR-PRB-005, BR-KB-004
**Prioridade:** ALTA

---

**US-PRB-004** — Aprovar e publicar workaround
Como **Gestor de TI**,
quero revisar e publicar workarounds submetidos pela equipe técnica,
para assegurar que apenas informações validadas cheguem aos técnicos e usuários.

**Critérios de Aceitação:**
- CA-1: Fila de workarounds em status `DRAFT` aguardando publicação.
- CA-2: Preview completo do workaround com contexto do problema vinculado.
- CA-3: Botões "Publicar" e "Devolver para Revisão" com feedback obrigatório na devolução.
- CA-4: Ao publicar, notificação enviada aos técnicos do grupo responsável pelo serviço.
- CA-5: Rascunho de artigo KB gerado automaticamente após publicação do workaround.

**Regras de Negócio:** BR-PRB-002
**Prioridade:** ALTA

---

**US-PRB-005** — Consultar base de erros conhecidos (KEDB)
Como **Analista de TI**,
quero consultar a lista de erros conhecidos com workarounds publicados,
para resolver chamados recorrentes mais rapidamente sem precisar reinvestigar.

**Critérios de Aceitação:**
- CA-1: Lista de erros conhecidos com busca por texto, serviço e categoria.
- CA-2: Cada erro exibe: título, serviço, workaround resumido e contagem de incidentes resolvidos.
- CA-3: Botão para vincular o erro conhecido ao incidente que está atendendo.
- CA-4: Link para o artigo KB com o workaround completo.
- CA-5: Filtro por status do problema: `KNOWN_ERROR` (workaround disponível) e `UNDER_INVESTIGATION`.

**Regras de Negócio:** BR-PRB-005
**Prioridade:** ALTA

---

**US-PRB-006** — Fechar problema com solução definitiva
Como **Coordenador de TI**,
quero fechar um problema após implementar a solução definitiva,
para encerrar formalmente o ciclo e deprecar automaticamente o workaround associado.

**Critérios de Aceitação:**
- CA-1: Fechamento só é permitido com causa raiz confirmada ou workaround publicado.
- CA-2: Campo "Solução Definitiva Implementada" obrigatório ao fechar.
- CA-3: Workarounds associados são marcados como `DEPRECATED` automaticamente.
- CA-4: Artigos KB vinculados são atualizados com a solução definitiva.
- CA-5: Incidentes vinculados recebem comentário de sistema informando o fechamento do problema.
- CA-6: O Gestor recebe notificação de encerramento do problema com o resumo da solução.

**Regras de Negócio:** BR-PRB-003, BR-PRB-004
**Prioridade:** ALTA

---

## 4. Ativos

---

**US-AST-001** — Registrar novo ativo no inventário
Como **Analista de TI**,
quero registrar um novo ativo recebido no inventário do SGTI,
para manter controle formal do patrimônio de TI desde a entrada do equipamento.

**Critérios de Aceitação:**
- CA-1: Formulário com campos obrigatórios: categoria, etiqueta patrimonial, nome.
- CA-2: Campos adicionais dinâmicos exibidos conforme a categoria selecionada.
- CA-3: Etiqueta patrimonial validada como única antes de salvar.
- CA-4: Número de série único quando preenchido.
- CA-5: Status inicial automaticamente definido como `RECEIVED`.
- CA-6: O ativo recém-cadastrado aparece imediatamente no inventário com todos os dados.

**Regras de Negócio:** BR-AST-003, BR-AST-010
**Prioridade:** MVP

---

**US-AST-002** — Alocar ativo a colaborador
Como **Analista de TI**,
quero registrar formalmente a alocação de um ativo a um colaborador,
para garantir rastreabilidade da posse e responsabilidade sobre o equipamento.

**Critérios de Aceitação:**
- CA-1: Busca de usuário por nome ou e-mail com seleção clara.
- CA-2: Campo de condição na entrega obrigatório: Novo, Bom, Regular ou Danificado.
- CA-3: Campo de observações opcional para registrar detalhes da entrega.
- CA-4: Status do ativo muda para `IN_USE` e o responsável é vinculado.
- CA-5: Histórico de atribuição registrado com data, condição e usuário responsável.
- CA-6: Notificação enviada ao colaborador com os dados do ativo recebido.
- CA-7: Tentativa de alocar ativo já alocado é bloqueada com mensagem orientativa.

**Regras de Negócio:** BR-AST-001, BR-AST-002
**Prioridade:** MVP

---

**US-AST-003** — Registrar devolução de ativo
Como **Analista de TI**,
quero registrar a devolução de um ativo quando o colaborador o devolve,
para liberar o equipamento para reutilização e atualizar o inventário.

**Critérios de Aceitação:**
- CA-1: Tela de devolução exibe dados completos do ativo e do responsável atual.
- CA-2: Campo de condição na devolução obrigatório.
- CA-3: Campo de observações para registrar danos encontrados ou pendências.
- CA-4: Status atualizado para `IN_STOCK` e o campo de responsável esvaziado.
- CA-5: O histórico de atribuição é encerrado com `returned_at` e condição de devolução.
- CA-6: Notificação enviada ao IT_MANAGER quando a condição de devolução for "Danificado".

**Regras de Negócio:** BR-AST-002
**Prioridade:** MVP

---

**US-AST-004** — Registrar movimentação física de ativo
Como **Analista de TI**,
quero registrar quando um ativo é movido para outra localização física,
para manter o controle preciso de onde cada equipamento se encontra.

**Critérios de Aceitação:**
- CA-1: Formulário com localização de origem (pré-preenchida), destino e motivo da movimentação.
- CA-2: A localização do ativo é atualizada imediatamente após o registro.
- CA-3: Movimentação registrada em `AssetMovement` com data, usuário e motivo.
- CA-4: Histórico completo de movimentações acessível na aba "Histórico" do ativo.
- CA-5: Para movimentações entre unidades diferentes, notificação ao IT_MANAGER da unidade destino.

**Regras de Negócio:** BR-AST-002
**Prioridade:** ALTA

---

**US-AST-005** — Agendar e registrar manutenção de ativo
Como **Analista de TI**,
quero agendar manutenção preventiva ou registrar manutenção corretiva de um ativo,
para garantir que equipamentos recebam os cuidados necessários no momento adequado.

**Critérios de Aceitação:**
- CA-1: Tipos de manutenção: Preventiva, Corretiva, Upgrade, Inspeção.
- CA-2: Campos: data agendada, fornecedor de manutenção, descrição do serviço previsto.
- CA-3: Ao agendar, o ativo muda para `UNDER_MAINTENANCE` e o responsável é notificado.
- CA-4: SLA de incidentes vinculados ao ativo é pausado automaticamente.
- CA-5: Ao registrar conclusão: campo de resultado, custo efetivo e condição pós-manutenção.
- CA-6: Status retorna ao estado anterior após a conclusão, e o SLA é retomado.

**Regras de Negócio:** BR-AST-009
**Prioridade:** ALTA

---

**US-AST-006** — Consultar histórico completo do ativo
Como **Analista de TI**,
quero visualizar o histórico completo de um ativo desde sua entrada no inventário,
para entender seu ciclo de vida e embasar decisões de substituição ou extensão de garantia.

**Critérios de Aceitação:**
- CA-1: Timeline do ativo com todos os eventos: recebimento, atribuições, movimentações, manutenções e chamados.
- CA-2: Dados financeiros: valor de aquisição, valor depreciado atual, custo acumulado de manutenções.
- CA-3: Informações de garantia: datas, provedor, status (vigente, a vencer em X dias, vencida).
- CA-4: Chamados vinculados ao ativo com link direto para cada chamado.
- CA-5: Exportação do histórico em PDF para fins de controle patrimonial.

**Prioridade:** ALTA

---

**US-AST-007** — Receber alertas de garantia próxima do vencimento
Como **Gestor de TI**,
quero receber alertas automáticos sobre garantias de ativos que estão vencendo,
para tomar providências antes de perder a cobertura e incorrer em custos inesperados.

**Critérios de Aceitação:**
- CA-1: Alertas automáticos nos marcos de 90, 60, 30 e 2 dias antes do vencimento.
- CA-2: Alerta enviado por e-mail e in-app ao técnico responsável e ao IT_MANAGER.
- CA-3: Widget "Garantias a Vencer" no dashboard de ativos com lista ordenada por urgência.
- CA-4: Opção de marcar alerta como "ciente" para reduzir notificações repetidas.
- CA-5: Botão de ação rápida para criar requisição de extensão de garantia direto do alerta.

**Regras de Negócio:** BR-AST-006, BR-GLB-009
**Prioridade:** ALTA

---

**US-AST-008** — Solicitar descomissionamento de ativo obsoleto
Como **Coordenador de TI**,
quero solicitar formalmente o descomissionamento de um ativo que atingiu o fim da vida útil,
para iniciar o processo de descarte ou doação com as devidas aprovações.

**Critérios de Aceitação:**
- CA-1: O ativo deve estar desalocado para que o botão "Solicitar Descomissionamento" seja exibido.
- CA-2: Formulário com motivo do descomissionamento e método de descarte proposto.
- CA-3: A solicitação é enviada ao Gestor para aprovação formal.
- CA-4: Gestor recebe notificação com dados do ativo e justificativa do solicitante.
- CA-5: Após aprovação do Gestor, o status muda para `DECOMMISSIONED` — operação irreversível.
- CA-6: Módulo Financeiro registra a baixa patrimonial automaticamente após descomissionamento.

**Regras de Negócio:** BR-AST-004, BR-AST-005, BR-FIN-007
**Prioridade:** ALTA

---

**US-AST-009** — Monitorar licenças de software com subutilização
Como **Gestor de TI**,
quero identificar licenças de software com baixa utilização,
para reduzir custos cancelando licenças desnecessárias e otimizando o portfólio de software.

**Critérios de Aceitação:**
- CA-1: Dashboard de licenças com: produto, total contratado, em uso, percentual de utilização.
- CA-2: Licenças abaixo de 20% de utilização destacadas visualmente em vermelho.
- CA-3: Alerta automático mensal ao IT_MANAGER para licenças abaixo do threshold.
- CA-4: Link direto para o contrato da licença no módulo Financeiro.
- CA-5: Botão "Criar Solicitação de Cancelamento" que abre requisição no módulo Compras.
- CA-6: Histórico de utilização mês a mês para validar tendência de subutilização.

**Regras de Negócio:** BR-AST-007, BR-FIN-010
**Prioridade:** ALTA

---

## 5. Identidades

---

**US-IDT-001** — Convidar novo colaborador para o sistema
Como **Gestor de TI**,
quero convidar um novo colaborador para acessar o SGTI antes da data de admissão,
para garantir que tenha acesso no primeiro dia de trabalho sem atrasos.

**Critérios de Aceitação:**
- CA-1: Formulário com e-mail corporativo, papel inicial, departamento e gestor direto.
- CA-2: E-mail de convite enviado com link válido por 72 horas.
- CA-3: Usuário criado com status `PENDING` até aceitar o convite.
- CA-4: Ao aceitar via Google OAuth, o status muda para `ACTIVE`.
- CA-5: IT_MANAGER recebe notificação quando o convite é aceito.
- CA-6: Botão "Reenviar Convite" disponível para convites expirados.

**Regras de Negócio:** BR-GWS-003
**Prioridade:** MVP

---

**US-IDT-002** — Provisionar acesso com papéis e grupos corretos
Como **Gestor de TI**,
quero provisionar o acesso completo de um colaborador com os papéis adequados,
para que ele utilize o SGTI com as permissões corretas para sua função desde o início.

**Critérios de Aceitação:**
- CA-1: Seleção de um ou mais papéis com campo de justificativa obrigatório.
- CA-2: Seleção de grupos de suporte para roteamento de chamados.
- CA-3: Papéis `IT_MANAGER` e acima requerem aprovação de um segundo `IT_MANAGER` ou `SUPER_ADMIN`.
- CA-4: Conta no Google Workspace criada automaticamente se não existir.
- CA-5: E-mail de boas-vindas enviado ao colaborador com instruções de primeiro acesso.
- CA-6: Status atualizado para `ACTIVE` após conclusão completa do provisionamento.

**Regras de Negócio:** BR-GWS-003
**Prioridade:** MVP

---

**US-IDT-003** — Desprovisionar acesso de colaborador desligado
Como **Gestor de TI**,
quero desprovisionar imediatamente o acesso de um colaborador desligado,
para eliminar riscos de acesso indevido após o desligamento.

**Critérios de Aceitação:**
- CA-1: Todas as sessões ativas revogadas imediatamente ao confirmar o desprovisionamento.
- CA-2: Conta Google suspensa dentro de 2 horas após a operação.
- CA-3: Ativos alocados ao usuário são desalocados com alerta ao IT_MANAGER.
- CA-4: Chamados atribuídos ao usuário transferidos para o grupo ou gestor responsável.
- CA-5: Projetos e contratos onde era responsável têm o campo atualizado.
- CA-6: Relatório de desprovisionamento gerado ao final com todas as ações executadas.

**Regras de Negócio:** BR-GWS-004, BR-GWS-002
**Prioridade:** MVP

---

**US-IDT-004** — Iniciar ciclo de revisão periódica de acessos
Como **Gestor de TI**,
quero iniciar uma revisão periódica dos acessos dos colaboradores,
para garantir que ninguém mantenha permissões além do necessário para sua função atual.

**Critérios de Aceitação:**
- CA-1: Seleção de colaboradores para revisão: individual, por departamento ou em lote.
- CA-2: Designação de revisores (gestores diretos).
- CA-3: E-mail enviado ao revisor com lista de acessos e botões de manter ou revogar cada papel.
- CA-4: Prazo configurável (padrão 15 dias); alerta ao IT_MANAGER para revisões não concluídas.
- CA-5: Relatório final de revisão com todas as decisões tomadas, para fins de evidência de compliance.
- CA-6: Papéis não confirmados na revisão são automaticamente marcados para rebaixamento após o prazo.

**Prioridade:** ALTA

---

**US-IDT-005** — Auditar histórico de concessões e revogações de acesso
Como **Analista de Compliance**,
quero visualizar o histórico de acessos concedidos e revogados por usuário,
para coletar evidências de conformidade com políticas de segurança e gestão de identidades.

**Critérios de Aceitação:**
- CA-1: Histórico de papéis atribuídos e revogados com data, responsável e justificativa.
- CA-2: Histórico de revisões de acesso realizadas com decisões tomadas.
- CA-3: Exportação em PDF com carimbo de data/hora para uso como evidência formal.
- CA-4: Filtros por período, usuário, tipo de operação e papel envolvido.
- CA-5: Dados pessoais exibidos conforme permissão do papel — Compliance vê somente o necessário para auditoria.

**Prioridade:** ALTA

---

**US-IDT-006** — Identificar usuários com revisão de acesso atrasada
Como **Gestor de TI**,
quero visualizar colaboradores cuja revisão de acesso está vencida ou próxima do vencimento,
para priorizar as revisões e manter conformidade com a política de acesso mínimo.

**Critérios de Aceitação:**
- CA-1: Lista de usuários com `next_access_review_due` vencido ou a vencer em 30 dias.
- CA-2: Ordenação por urgência: mais atrasados primeiro, com indicador de dias em atraso.
- CA-3: Filtro por departamento e papel para organizar as revisões por área.
- CA-4: Botão de ação rápida para iniciar revisão individual ou em lote.
- CA-5: Widget no dashboard operacional mostrando total de revisões pendentes e atrasadas.

**Prioridade:** ALTA

---

## 6. Compliance

---

**US-CPL-001** — Criar ciclo de auditoria vinculado a um framework
Como **Analista de Compliance**,
quero criar um ciclo de auditoria estruturado com framework e escopo definidos,
para organizar formalmente as avaliações de controles e rastrear o progresso.

**Critérios de Aceitação:**
- CA-1: Seleção do framework: ISO 27001, LGPD, ITIL v4 ou Interno.
- CA-2: Definição de escopo, responsável, empresa auditora (se externa) e período planejado.
- CA-3: Seleção dos itens de norma incluídos no escopo desta auditoria.
- CA-4: Vinculação de auditoria anterior para comparativo de evolução de maturidade.
- CA-5: Status inicial `PLANNED`; muda para `IN_PROGRESS` ao registrar o primeiro achado.
- CA-6: Auditoria com NCs críticas em aberto não pode ser fechada (bloqueio automático).

**Regras de Negócio:** BR-CPL-009
**Prioridade:** MVP

---

**US-CPL-002** — Registrar não-conformidade com severidade
Como **Analista de Compliance**,
quero registrar formalmente um apontamento de não-conformidade identificado,
para documentar o desvio com severidade, responsável e prazo de tratamento.

**Critérios de Aceitação:**
- CA-1: Formulário com título, descrição, item de norma, tipo e severidade obrigatórios.
- CA-2: Tipos: Não-Conformidade, Observação, Oportunidade de Melhoria.
- CA-3: Severidades para NC: Crítica, Maior, Menor.
- CA-4: Definição de responsável pelo tratamento e prazo de resolução.
- CA-5: Notificação automática ao responsável e ao Gestor (para NCs Críticas).
- CA-6: NC Crítica sem plano de ação após 5 dias úteis gera alerta escalonado.

**Regras de Negócio:** BR-CPL-003
**Prioridade:** MVP

---

**US-CPL-003** — Coletar e anexar evidências de conformidade
Como **Analista de Compliance**,
quero coletar evidências documentais para comprovar a implementação de controles,
para sustentar a avaliação de conformidade durante e após a auditoria.

**Critérios de Aceitação:**
- CA-1: Upload de arquivos (PDF, imagem, planilha, documento) até 50 MB por arquivo.
- CA-2: Campos obrigatórios: tipo de evidência e descrição.
- CA-3: Hash SHA-256 calculado automaticamente e armazenado para verificação de integridade.
- CA-4: Evidência criada em status `PENDING`, aguardando revisão de outro analista.
- CA-5: Notificação enviada ao revisor designado.
- CA-6: Lista de evidências da NC exibe status de cada uma: pendente, aprovada, rejeitada.

**Regras de Negócio:** BR-CPL-001
**Prioridade:** MVP

---

**US-CPL-004** — Revisar e aprovar evidências coletadas
Como **Analista de Compliance**,
quero revisar evidências coletadas por outro analista e aprovar ou rejeitar,
para garantir a independência e qualidade das evidências utilizadas na auditoria.

**Critérios de Aceitação:**
- CA-1: Fila de evidências pendentes de revisão atribuídas ao meu perfil.
- CA-2: Preview do arquivo de evidência com metadados: tipo, coletor, data de coleta e descrição.
- CA-3: Botões "Aprovar" e "Rejeitar" com campo de feedback obrigatório na rejeição.
- CA-4: Sistema bloqueia aprovação de evidência coletada pelo próprio revisor.
- CA-5: Evidência aprovada torna-se imutável — nenhuma substituição de arquivo é possível.
- CA-6: Histórico de revisão registrado com data, decisão e justificativa.

**Regras de Negócio:** BR-CPL-002, BR-CPL-004
**Prioridade:** MVP

---

**US-CPL-005** — Criar e acompanhar plano de ação para NC
Como **Analista de Compliance**,
quero criar um plano de ação estruturado para tratamento de uma não-conformidade,
para documentar medidas corretivas com responsáveis e prazos claros.

**Critérios de Aceitação:**
- CA-1: Campo de análise de causa raiz da não-conformidade obrigatório.
- CA-2: Lista de ações individuais com: descrição, responsável, prazo e status.
- CA-3: Data alvo global do plano calculada automaticamente com base nas ações.
- CA-4: Notificação ao responsável de cada ação ao criar o plano.
- CA-5: Alertas automáticos 2 dias antes do prazo de cada ação.
- CA-6: Status geral do plano atualizado conforme conclusão das ações.

**Prioridade:** MVP

---

**US-CPL-006** — Publicar política de TI com versionamento
Como **Analista de Compliance**,
quero criar e publicar políticas de TI com controle de versões,
para garantir que os colaboradores sempre consultem a versão vigente e atualizada.

**Critérios de Aceitação:**
- CA-1: Editor de texto para criação da política com campos: título, versão, data de vigência.
- CA-2: Política criada em `DRAFT`; aprovação do Gestor obrigatória antes de publicar.
- CA-3: Ao publicar, versão anterior é automaticamente marcada como `DEPRECATED`.
- CA-4: Política publicada aparece no catálogo de políticas acessível a todos os colaboradores.
- CA-5: Histórico de todas as versões preservado e acessível para auditoria.

**Regras de Negócio:** BR-CPL-006
**Prioridade:** ALTA

---

**US-CPL-007** — Visualizar score de maturidade de compliance
Como **Gestor de TI**,
quero consultar o score de maturidade de compliance por framework,
para comunicar o nível de conformidade à alta direção e orientar investimentos em melhoria.

**Critérios de Aceitação:**
- CA-1: Score de maturidade em percentual e gráfico de gauge (verde/amarelo/vermelho) por framework.
- CA-2: Detalhamento por domínio/seção com status de cada controle avaliado.
- CA-3: Comparativo com a auditoria anterior mostrando evolução do score.
- CA-4: Lista dos controles mais críticos abertos com responsável e prazo.
- CA-5: Exportação de relatório executivo de maturidade em PDF para apresentações.

**Regras de Negócio:** BR-CPL-008
**Prioridade:** ALTA

---

## 7. Financeiro

---

**US-FIN-001** — Criar orçamento anual de TI
Como **Gestor de TI**,
quero criar o orçamento anual de TI separado por OPEX e CAPEX e centro de custo,
para ter controle formal sobre os recursos financeiros aprovados para a área.

**Critérios de Aceitação:**
- CA-1: Seleção do ano fiscal, tipo (OPEX/CAPEX) e centro de custo.
- CA-2: Adição de itens de orçamento com categoria, descrição e valor planejado por mês.
- CA-3: Orçamento criado em `DRAFT`; aprovação formal necessária para ativar.
- CA-4: Após aprovação, orçamento recebe status `APPROVED` e fica disponível para lançamentos.
- CA-5: O gestor que criou não pode aprovar o próprio orçamento (segregação SoD).
- CA-6: Sistema calcula e exibe o total planejado por categoria e o total geral.

**Regras de Negócio:** BR-FIN-001, BR-FIN-002
**Prioridade:** MVP

---

**US-FIN-002** — Registrar e aprovar despesas OPEX
Como **Analista Financeiro**,
quero registrar despesas operacionais de TI com todas as informações contábeis,
para manter o controle do realizado versus o planejado e garantir rastreabilidade.

**Critérios de Aceitação:**
- CA-1: Campos obrigatórios: centro de custo, categoria, fornecedor, valor, data de competência.
- CA-2: Despesas acima de R$500,00 exigem nota fiscal anexada.
- CA-3: Saldo disponível do orçamento exibido em tempo real ao preencher o valor.
- CA-4: Despesa que cause estouro acima de 20% do orçamento é bloqueada sem aprovação adicional.
- CA-5: O analista que registrou não pode aprovar o mesmo lançamento.
- CA-6: Aprovação dispara a efetivação do lançamento no orçamento.

**Regras de Negócio:** BR-FIN-001, BR-FIN-002, BR-FIN-003, BR-FIN-004, BR-FIN-008
**Prioridade:** MVP

---

**US-FIN-003** — Monitorar vencimento de contratos
Como **Gestor de TI**,
quero receber alertas automáticos sobre contratos próximos do vencimento,
para tomar decisão de renovação, renegociação ou cancelamento com tempo hábil.

**Critérios de Aceitação:**
- CA-1: Alertas automáticos nos marcos de 90, 60, 30 e 2 dias antes do vencimento.
- CA-2: Dashboard de contratos a vencer com valor, fornecedor, data e responsável.
- CA-3: Opção de marcar contrato como "em tratamento" para suprimir alertas repetidos.
- CA-4: Integração com Compras: botão "Iniciar Renovação" cria requisição de compra.
- CA-5: Histórico de todos os alertas enviados por contrato disponível para auditoria.

**Regras de Negócio:** BR-FIN-005, BR-FIN-006
**Prioridade:** ALTA

---

**US-FIN-004** — Visualizar rateio de custos de TI por unidade de negócio
Como **Analista Financeiro**,
quero visualizar o rateio mensal dos custos de TI distribuídos por unidade de negócio,
para embasar reuniões de governança e prestação de contas às áreas de negócio.

**Critérios de Aceitação:**
- CA-1: Relatório de rateio com BU, percentual, valor absoluto e metodologia aplicada.
- CA-2: Comparativo mês a mês e acumulado do ano fiscal.
- CA-3: Gráfico de participação de cada BU no custo total de TI.
- CA-4: Exportação em Excel com dados brutos para envio às áreas.
- CA-5: Base de cálculo do rateio configurável: usuários, ativos, volume de chamados ou manual.

**Regras de Negócio:** BR-FIN-009
**Prioridade:** ALTA

---

**US-FIN-005** — Acompanhar realizado versus orçado em tempo real
Como **Gestor de TI**,
quero visualizar o OPEX e CAPEX realizado comparado ao orçado em tempo real,
para identificar desvios antecipadamente e tomar ações corretivas antes do fechamento.

**Critérios de Aceitação:**
- CA-1: Visão consolidada com realizado, orçado, variância e percentual de utilização.
- CA-2: Drill-down por centro de custo, categoria e fornecedor.
- CA-3: Gráfico de barras mensal com linha de orçamento planejado.
- CA-4: Indicador de risco: verde (< 80%), amarelo (80–100%), vermelho (> 100%).
- CA-5: Projeção de fechamento do ano baseada na tendência de consumo atual.
- CA-6: Alerta automático ao IT_MANAGER quando utilização ultrapassa 80% do orçamento.

**Regras de Negócio:** BR-FIN-004
**Prioridade:** ALTA

---

## 8. Compras

---

**US-PRC-001** — Criar solicitação de compra com justificativa
Como **Analista de TI**,
quero formalizar uma necessidade de aquisição criando uma solicitação de compra,
para iniciar o processo formal de aprovação e garantir rastreabilidade da demanda.

**Critérios de Aceitação:**
- CA-1: Formulário com título, categoria, justificativa, valor estimado, centro de custo e urgência.
- CA-2: Possibilidade de vincular a projeto ou orçamento existente.
- CA-3: Número gerado automaticamente ao submeter.
- CA-4: Fluxo de aprovação iniciado automaticamente com base no valor e categoria.
- CA-5: Solicitante recebe e-mail de confirmação com número e próximos passos.

**Regras de Negócio:** BR-PRC-001, BR-PRC-003
**Prioridade:** MVP

---

**US-PRC-002** — Aprovar solicitação de compra por faixa de valor
Como **Coordenador de TI**,
quero aprovar solicitações de compra de baixo valor dentro do meu nível de alçada,
para agilizar aquisições urgentes sem criar dependência do Gestor para itens menores.

**Critérios de Aceitação:**
- CA-1: Aprovações até R$1.000,00 chegam ao Coordenador; acima disso seguem para Gestor.
- CA-2: Detalhe completo da solicitação visível antes de decidir.
- CA-3: Rejeição exige motivo e dispara notificação ao solicitante.
- CA-4: Aprovação por etapa registrada com data e justificativa opcional.
- CA-5: Coordenador não pode aprovar solicitações que ele mesmo criou.

**Regras de Negócio:** BR-PRC-002, BR-PRC-003
**Prioridade:** MVP

---

**US-PRC-003** — Emitir pedido de compra para fornecedor
Como **Gestor de TI**,
quero emitir um pedido de compra formal após a aprovação da requisição,
para formalizar a aquisição junto ao fornecedor selecionado.

**Critérios de Aceitação:**
- CA-1: Pedido vinculado obrigatoriamente a uma requisição com status `APPROVED`.
- CA-2: Seleção de fornecedor cadastrado ou cadastramento de novo fornecedor.
- CA-3: Itens do pedido com descrição, quantidade, unidade e preço unitário.
- CA-4: Número do pedido gerado automaticamente.
- CA-5: Reserva orçamentária atualizada no módulo Financeiro ao emitir o pedido.
- CA-6: Status do pedido inicia em `DRAFT` e muda para `SENT` ao confirmar o envio.

**Regras de Negócio:** BR-PRC-001
**Prioridade:** MVP

---

**US-PRC-004** — Registrar recebimento de itens do pedido
Como **Analista de TI**,
quero registrar o recebimento físico dos itens de um pedido de compra,
para confirmar a entrega e acionar o cadastro patrimonial de novos ativos.

**Critérios de Aceitação:**
- CA-1: Lista de itens pendentes com quantidade pedida e já recebida.
- CA-2: Registro individual por linha com quantidade efetivamente recebida.
- CA-3: Para itens de hardware, formulário de cadastro de ativo é exibido automaticamente.
- CA-4: Ativo criado vinculado ao item do pedido com rastreabilidade bidirecional.
- CA-5: Status do pedido atualizado: `PARTIALLY_RECEIVED` ou `RECEIVED` conforme as confirmações.
- CA-6: Baixa de CAPEX executada automaticamente no módulo Financeiro ao receber integralmente.

**Regras de Negócio:** BR-PRC-004, BR-PRC-005, BR-PRC-008
**Prioridade:** MVP

---

**US-PRC-005** — Cadastrar e avaliar fornecedores
Como **Gestor de TI**,
quero manter um cadastro qualificado de fornecedores de TI com histórico de desempenho,
para embasar decisões de compra com informações objetivas sobre qualidade e entrega.

**Critérios de Aceitação:**
- CA-1: Formulário com razão social, CNPJ validado, categoria, contato e endereço.
- CA-2: Avaliação de fornecedor após cada recebimento: prazo, qualidade e relacionamento.
- CA-3: Histórico de pedidos, contratos e avaliações vinculados ao fornecedor.
- CA-4: Indicadores calculados automaticamente: média de avaliação, prazo médio de entrega, pontualidade.
- CA-5: Fornecedor inativo pode ser reativado pelo Gestor com justificativa.

**Regras de Negócio:** BR-PRC-007
**Prioridade:** ALTA

---

## 9. Projetos

---

**US-PRJ-001** — Criar e aprovar projeto de TI
Como **Gestor de TI**,
quero criar um projeto de TI com escopo, patrocinador, cronograma e orçamento formalizados,
para gerenciar iniciativas estratégicas com visibilidade e governança adequadas.

**Critérios de Aceitação:**
- CA-1: Formulário com nome, código único, descrição, patrocinador, gerente, datas e orçamento.
- CA-2: Patrocinador e gerente devem ser usuários distintos.
- CA-3: Projeto criado com status `IDEATION`; requer aprovação formal para avançar.
- CA-4: Ao aprovar, reserva orçamentária é criada no módulo Financeiro.
- CA-5: Repositórios GitHub podem ser vinculados ao projeto para rastreabilidade técnica.

**Regras de Negócio:** BR-PRJ-001, BR-PRJ-002
**Prioridade:** ALTA

---

**US-PRJ-002** — Criar cronograma com marcos e tarefas
Como **Gestor de TI**,
quero criar um cronograma detalhado com marcos, tarefas e entregas do projeto,
para ter visibilidade do progresso e identificar atrasos com antecedência.

**Critérios de Aceitação:**
- CA-1: Criação de marcos (milestones), tarefas e entregas com hierarquia configurável.
- CA-2: Atribuição de responsável, datas planejadas e dependências por item.
- CA-3: Percentual de conclusão atualizável pelo responsável da tarefa.
- CA-4: Marcas de "concluída" registram a data real de conclusão automaticamente.
- CA-5: Marco atrasado aciona alerta automático ao gerente e altera o indicador de saúde.

**Regras de Negócio:** BR-PRJ-003
**Prioridade:** ALTA

---

**US-PRJ-003** — Atualizar progresso das tarefas atribuídas
Como **Coordenador de TI**,
quero atualizar facilmente o progresso das tarefas de projeto atribuídas a mim,
para que o gerente tenha visibilidade em tempo real do andamento sem reuniões de status.

**Critérios de Aceitação:**
- CA-1: Lista "Minhas Tarefas de Projeto" consolidada com todos os projetos e tarefas atribuídas.
- CA-2: Atualização de status e percentual de conclusão diretamente na lista.
- CA-3: Campo de observações para registrar impedimentos, riscos ou comentários.
- CA-4: Ao marcar como concluída, data real de conclusão é registrada automaticamente.
- CA-5: Notificação automática ao gerente do projeto quando tarefa é concluída.

**Prioridade:** ALTA

---

**US-PRJ-004** — Monitorar saúde do projeto com indicadores automáticos
Como **Gestor de TI**,
quero visualizar o status de saúde do projeto com atualizações automáticas,
para identificar riscos de atraso ou estouro orçamentário e agir preventivamente.

**Critérios de Aceitação:**
- CA-1: Indicador de saúde: Verde (no prazo e orçamento), Amarelo (em risco), Vermelho (crítico).
- CA-2: Saúde atualizada automaticamente: amarelo se marco atrasado ou orçamento > 110%; vermelho se 2+ marcos ou > 120%.
- CA-3: Gráfico de Gantt simplificado com marcos, status e datas planejadas vs. reais.
- CA-4: Indicadores: % tarefas concluídas, dias de atraso acumulados, variância orçamentária.
- CA-5: Histórico de mudanças de saúde com justificativa para rastreabilidade.

**Regras de Negócio:** BR-PRJ-003, BR-PRJ-004
**Prioridade:** ALTA

---

**US-PRJ-005** — Controlar custos realizados do projeto
Como **Analista Financeiro**,
quero visualizar e registrar os custos realizados em cada projeto,
para controlar o CAPEX investido e garantir que o projeto permaneça dentro do orçamento.

**Critérios de Aceitação:**
- CA-1: Resumo financeiro: orçamento aprovado, realizado, saldo e percentual utilizado.
- CA-2: Lançamentos de custo por categoria: mão de obra, licença, hardware, serviço.
- CA-3: Projeção de custo final baseada na tendência de consumo atual.
- CA-4: Alerta automático quando realizado ultrapassa 80% e 100% do orçamento.
- CA-5: Exportação de relatório financeiro do projeto em PDF e Excel.

**Regras de Negócio:** BR-PRJ-004, BR-PRJ-006
**Prioridade:** ALTA

---

## 10. Base de Conhecimento

---

**US-KB-001** — Buscar solução antes de abrir chamado
Como **Usuário**,
quero buscar artigos na Base de Conhecimento antes de abrir um chamado,
para resolver meu problema de forma autônoma e reduzir a demanda de atendimento.

**Critérios de Aceitação:**
- CA-1: Campo de busca disponível na página inicial sem necessidade de login.
- CA-2: Resultados relevantes ordenados por utilidade com destaque dos termos buscados.
- CA-3: Filtros por categoria e tipo de audiência (usuário final / técnico).
- CA-4: Cada resultado exibe título, trecho resumido, categoria e avaliação média.
- CA-5: Sugestão automática de artigos ao preencher o título ao abrir um novo chamado.
- CA-6: Botão "Isso não resolveu — abrir chamado" visível em cada artigo.

**Prioridade:** MVP

---

**US-KB-002** — Avaliar utilidade de artigo
Como **Usuário**,
quero indicar se um artigo foi útil para resolver meu problema,
para contribuir com a qualidade da base de conhecimento e ajudar outros usuários.

**Critérios de Aceitação:**
- CA-1: Botões 👍 Útil e 👎 Não foi útil visíveis no final de cada artigo publicado.
- CA-2: Campo de comentário opcional para detalhar o motivo da avaliação negativa.
- CA-3: Cada usuário pode avaliar um artigo apenas uma vez (nova avaliação substitui a anterior).
- CA-4: Contadores de avaliações exibidos abaixo dos botões.
- CA-5: Artigos com índice de rejeição acima de 40% são sinalizados para revisão editorial.

**Regras de Negócio:** BR-KB-006
**Prioridade:** ALTA

---

**US-KB-003** — Criar artigo técnico documentando solução
Como **Analista de TI**,
quero criar um artigo técnico documentando a solução de um problema complexo,
para que outros técnicos possam resolver problemas similares sem escalar chamados.

**Critérios de Aceitação:**
- CA-1: Editor de texto rico com suporte a formatação, listas, blocos de código e imagens.
- CA-2: Campos obrigatórios: título, categoria, público-alvo e conteúdo.
- CA-3: Campo de tags para facilitar a descoberta (mínimo recomendado: 3 tags).
- CA-4: Artigo criado em status `DRAFT` — invisível ao público até publicação.
- CA-5: Botão "Submeter para Revisão" disponível ao autor após salvar.

**Regras de Negócio:** BR-KB-001, BR-KB-002
**Prioridade:** MVP

---

**US-KB-004** — Revisar artigos submetidos pela equipe
Como **Coordenador de TI**,
quero revisar artigos submetidos pelos analistas antes da publicação,
para garantir qualidade técnica, precisão e aderência ao padrão editorial do SGTI.

**Critérios de Aceitação:**
- CA-1: Fila de artigos em revisão com autor, data de submissão e categoria.
- CA-2: Preview completo do artigo para leitura antes de decidir.
- CA-3: Botões "Aprovar para Publicação" e "Devolver para Revisão".
- CA-4: Feedback obrigatório ao devolver (mínimo 20 caracteres), enviado ao autor.
- CA-5: Ao aprovar, artigo entra na fila de publicação final para o Gestor.
- CA-6: Notificação ao autor com resultado da revisão e, se reprovado, o feedback recebido.

**Regras de Negócio:** BR-KB-002
**Prioridade:** MVP

---

**US-KB-005** — Publicar artigos aprovados na revisão
Como **Gestor de TI**,
quero publicar artigos que passaram pela revisão editorial,
para disponibilizá-los aos colaboradores e ampliar o autoatendimento da organização.

**Critérios de Aceitação:**
- CA-1: Fila de artigos aprovados aguardando publicação final.
- CA-2: Preview do artigo antes de confirmar a publicação.
- CA-3: Ao publicar, artigo recebe `published_at` e fica visível para a audiência configurada.
- CA-4: Versão anterior do mesmo artigo (se existir) é automaticamente supersedida.
- CA-5: Notificação enviada ao autor confirmando a publicação e o link do artigo.

**Regras de Negócio:** BR-KB-002, BR-KB-010
**Prioridade:** MVP

---

**US-KB-006** — Revisar rascunhos gerados pelo Assistente IA
Como **Analista de TI**,
quero revisar e completar rascunhos de artigos gerados automaticamente pela IA,
para acelerar a documentação sem abrir mão da qualidade e responsabilidade sobre o conteúdo.

**Critérios de Aceitação:**
- CA-1: Lista "Rascunhos Gerados por IA" com badge `DRAFT_AI` distinguindo dos manuais.
- CA-2: Editor com conteúdo pré-preenchido pela IA e link para o incidente ou problema de origem.
- CA-3: Aviso visível: "Conteúdo gerado por assistente — revise antes de submeter para publicação."
- CA-4: Ao menos uma edição humana obrigatória antes de submeter para revisão.
- CA-5: O artigo publicado registra que foi originado por IA com revisão humana.

**Regras de Negócio:** BR-KB-002
**Prioridade:** ALTA

---

**US-KB-007** — Deprecar artigo desatualizado
Como **Gestor de TI**,
quero deprecar um artigo que não deve mais ser utilizado por estar desatualizado,
para evitar que técnicos sigam procedimentos obsoletos que podem causar problemas.

**Critérios de Aceitação:**
- CA-1: Botão "Deprecar" disponível apenas para artigos com status `PUBLISHED`.
- CA-2: Campo de motivo da depreciação obrigatório.
- CA-3: Campo opcional para informar o artigo substituto.
- CA-4: Artigo depreciado é removido das buscas padrão.
- CA-5: Usuários que acessarem via link antigo veem aviso de depreciação e link para substituto.
- CA-6: Artigo não pode ser excluído — apenas depreciado — para preservar o histórico.

**Regras de Negócio:** BR-KB-003, BR-KB-008
**Prioridade:** ALTA

---

**US-KB-008** — Receber relatório editorial semanal da Base de Conhecimento
Como **Gestor de TI**,
quero receber semanalmente um relatório sobre a qualidade e saúde da base de conhecimento,
para priorizar ações editoriais e garantir que o conteúdo permaneça relevante e confiável.

**Critérios de Aceitação:**
- CA-1: Relatório inclui: artigos com alto índice de avaliação negativa (> 40%).
- CA-2: Lista de artigos sem visualização há 6 meses, candidatos à depreciação.
- CA-3: Artigos publicados com menos de 3 tags (descoberta prejudicada).
- CA-4: Top 10 artigos mais acessados do período com contagem de visualizações.
- CA-5: Quantidade de novos artigos publicados no período comparado ao anterior.
- CA-6: Entrega automática por e-mail toda segunda-feira às 08h00.

**Regras de Negócio:** BR-KB-006, BR-KB-007, BR-KB-009
**Prioridade:** MÉDIA

---

## 11. Dashboard

---

**US-DSH-001** — Visualizar resumo pessoal de chamados na página inicial
Como **Usuário**,
quero ver um resumo dos meus chamados abertos ao acessar o sistema,
para ter acesso imediato ao status das minhas solicitações sem navegar por menus.

**Critérios de Aceitação:**
- CA-1: Widget "Meus Chamados" com contadores: Abertos, Em Atendimento, Resolvidos.
- CA-2: Lista dos 5 chamados mais recentes com número, título, status e SLA.
- CA-3: Indicador visual de SLA para cada chamado em aberto.
- CA-4: Botão de ação rápida "Abrir Novo Chamado" no topo do widget.
- CA-5: Link "Ver Todos" redirecionando para a lista completa filtrada pelos chamados do usuário.

**Prioridade:** MVP

---

**US-DSH-002** — Visualizar fila de trabalho personalizada
Como **Analista de TI**,
quero ver minha fila de trabalho ao acessar o sistema a cada turno,
para começar imediatamente sabendo o que precisa de atenção sem precisar fazer buscas manuais.

**Critérios de Aceitação:**
- CA-1: Painel "Minha Fila" com chamados atribuídos, ordenados por prioridade e SLA restante.
- CA-2: Destaque visual (borda vermelha) para chamados com SLA em risco (< 25% do tempo).
- CA-3: Contadores de chamados por status: Abertos, Em Andamento, Aguardando Usuário.
- CA-4: Seção de alertas: aprovações pendentes, revisões de acesso atrasadas, manutenções agendadas.
- CA-5: Atalhos rápidos: Abrir Incidente, Registrar Ativo, Buscar KB.
- CA-6: Atualização automática a cada 30 segundos via Supabase Realtime.

**Prioridade:** MVP

---

**US-DSH-003** — Monitorar KPIs operacionais em tempo real
Como **Gestor de TI**,
quero visualizar o dashboard operacional com os principais indicadores de atendimento,
para monitorar a performance da equipe e agir rapidamente em situações críticas.

**Critérios de Aceitação:**
- CA-1: KPIs em tempo real: total de chamados abertos, SLA global do dia, CSAT médio do mês.
- CA-2: Gráfico de distribuição por prioridade e status com atualização automática.
- CA-3: Lista de incidentes críticos em aberto com tempo decorrido desde a abertura.
- CA-4: Painel de SLA em risco com chamados próximos ao vencimento ordenados por urgência.
- CA-5: Comparativo com os mesmos períodos anteriores (dia anterior, semana, mês).
- CA-6: Alertas ativos do sistema exibidos: falhas de integração, jobs com erro.

**Prioridade:** ALTA

---

**US-DSH-004** — Consultar dashboard executivo de TI
Como **Gestor de TI**,
quero visualizar o dashboard executivo com os KPIs estratégicos da área de TI,
para apresentar resultados em reuniões de gestão com informações consolidadas e visuais.

**Critérios de Aceitação:**
- CA-1: KPIs estratégicos: SLA global (%), CSAT médio, disponibilidade de serviços críticos, maturidade de compliance.
- CA-2: Resumo financeiro: OPEX e CAPEX realizado vs. orçado com percentual de utilização.
- CA-3: Status do portfólio de projetos: no prazo, em risco, atrasados, concluídos.
- CA-4: Tendências de 12 meses para os principais KPIs com gráficos de linha.
- CA-5: Exportação do dashboard executivo em PDF com layout para apresentação.
- CA-6: Dados atualizados a cada 30 segundos via Supabase Realtime.

**Prioridade:** ALTA

---

**US-DSH-005** — Monitorar conformidade e maturidade de compliance
Como **Analista de Compliance**,
quero visualizar o dashboard de compliance com status atual das auditorias e controles,
para monitorar o nível de conformidade e priorizar ações de melhoria de forma contínua.

**Critérios de Aceitação:**
- CA-1: Score de maturidade global com gauge colorido por percentual.
- CA-2: Breakdown por framework com percentual de controles implementados em cada um.
- CA-3: Não-conformidades abertas por severidade com indicador de prazo de tratamento.
- CA-4: Próximas auditorias programadas com contagem de dias restantes.
- CA-5: Planos de ação em atraso com responsável, NC vinculada e dias de atraso.

**Prioridade:** ALTA

---

**US-DSH-006** — Acompanhar execução orçamentária de TI
Como **Analista Financeiro**,
quero visualizar o dashboard financeiro com OPEX e CAPEX de forma consolidada,
para controlar a execução orçamentária e detectar desvios antes que se tornem problemas.

**Critérios de Aceitação:**
- CA-1: Gráficos separados de OPEX e CAPEX com realizado, orçado e variância mês a mês.
- CA-2: Lista de contratos a vencer nos próximos 90 dias com valor e fornecedor.
- CA-3: Top 5 centros de custo com maior consumo do período corrente.
- CA-4: Percentual do orçamento consumido com projeção de encerramento do ano fiscal.
- CA-5: Alertas de orçamentos com utilização acima de 80% em destaque visual.

**Prioridade:** ALTA

---

**US-DSH-007** — Acessar visão estratégica consolidada sem navegar pelo sistema
Como **Executivo**,
quero acessar um dashboard executivo consolidado diretamente ao fazer login,
para ter uma visão estratégica da saúde da TI em segundos, sem precisar navegar por múltiplas telas.

**Critérios de Aceitação:**
- CA-1: Dashboard executivo definido como página inicial para usuários com papel `EXECUTIVE`.
- CA-2: Máximo de 6 KPIs visíveis sem necessidade de scroll.
- CA-3: Clique em qualquer KPI exibe drill-down com mais detalhes.
- CA-4: Opção de receber resumo executivo semanal por e-mail às segundas-feiras às 08h00.
- CA-5: Interface responsiva e adequada para visualização em tablet durante reuniões.

**Prioridade:** MÉDIA

---

**US-DSH-008** — Configurar KPIs e metas dos dashboards
Como **Administrador**,
quero configurar quais KPIs são exibidos nos dashboards e definir as metas de cada indicador,
para personalizar os painéis conforme as prioridades estratégicas da organização no período.

**Critérios de Aceitação:**
- CA-1: Interface de gestão de KPIs com lista completa de indicadores disponíveis.
- CA-2: Campos configuráveis por KPI: nome, meta, unidade, direção (maior/menor é melhor).
- CA-3: Threshold de alerta configurável com cor de sinalização por faixa.
- CA-4: Ativação e desativação de KPIs sem excluí-los do histórico.
- CA-5: Preview de como o KPI aparecerá no dashboard antes de salvar.

**Prioridade:** MÉDIA

---

**US-DSH-009** — Exportar relatórios dos dashboards em PDF e Excel
Como **Gestor de TI**,
quero exportar qualquer relatório de dashboard em PDF ou Excel,
para compartilhar informações com stakeholders que não têm acesso ao sistema.

**Critérios de Aceitação:**
- CA-1: Botão "Exportar" disponível em todos os dashboards com opções PDF e Excel.
- CA-2: PDF gerado com logotipo, data de geração, período de referência e filtros aplicados.
- CA-3: Excel com dados brutos em abas separadas por seção do dashboard.
- CA-4: Geração assíncrona para relatórios grandes com notificação quando disponível.
- CA-5: Histórico de exportações com link de download disponível por 24 horas.
- CA-6: Log de auditoria registrado para cada exportação de dados sensíveis.

**Prioridade:** ALTA

---

**US-DSH-010** — Acompanhar indicadores de performance individual
Como **Analista de TI**,
quero ver meus indicadores de performance pessoal no painel,
para acompanhar meu desempenho e identificar áreas de melhoria de forma objetiva.

**Critérios de Aceitação:**
- CA-1: MTTR médio pessoal comparado à média anônima da equipe.
- CA-2: Chamados resolvidos dentro do SLA versus fora do SLA no mês corrente.
- CA-3: CSAT médio das avaliações recebidas no período (sem identificar o avaliador).
- CA-4: Volume de chamados atendidos por semana com gráfico de evolução mensal.
- CA-5: Artigos KB criados, vinculados a chamados resolvidos ou revisados pelo analista.

**Prioridade:** MÉDIA

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição da Alteração |
|--------|------|-------|------------------------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação inicial com 81 histórias |
| 2.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Revisão completa — 80 histórias finais cobrindo todos os módulos e perfis |

---

> **Próximos documentos recomendados:**
> [`24_BUSINESS_RULES.md`](./24_BUSINESS_RULES.md) — Regras de negócio que embasam os critérios de aceitação
> [`23_USER_ROLES.md`](./23_USER_ROLES.md) — Matriz de permissões por perfil de usuário
> [`21_API_SPEC.md`](./21_API_SPEC.md) — Endpoints da API correspondentes a cada história
