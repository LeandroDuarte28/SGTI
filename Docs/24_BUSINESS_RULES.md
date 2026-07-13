# SGTI — Sistema de Gestão de Tecnologia da Informação
## Regras de Negócio Globais

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [12_ARCHITECTURE.md](./12_ARCHITECTURE.md) · [20_DATABASE.md](./20_DATABASE.md) · [23_USER_ROLES.md](./23_USER_ROLES.md) · [21_API_SPEC.md](./21_API_SPEC.md)

---

## Sobre este Documento

Este documento registra todas as **regras de negócio globais do SGTI** de forma numerada, rastreável e verificável. Cada regra é a fonte de verdade para a implementação dos Use Cases, validações de domínio e testes automatizados do sistema.

### Convenções

| Campo | Descrição |
|-------|-----------|
| **ID** | Identificador único no formato `BR-[MÓDULO]-[NNN]` |
| **Descrição** | Enunciado da regra em linguagem de negócio |
| **Camada** | Onde a regra é aplicada: `Domínio`, `Aplicação`, `Banco` ou `Sistema` |
| **Gatilho** | O que dispara a verificação da regra |
| **Violação** | Comportamento do sistema ao detectar violação |
| **Referência** | Documento ou seção que aprofunda o contexto |

### Prefixos de Módulo

| Prefixo | Módulo |
|---------|--------|
| `INC` | Incidentes |
| `REQ` | Requisições |
| `PRB` | Problemas |
| `AST` | Ativos |
| `CPL` | Compliance |
| `FIN` | Financeiro |
| `PRC` | Compras |
| `PRJ` | Projetos |
| `KB` | Base de Conhecimento |
| `SLA` | SLA |
| `EML` | E-mail |
| `GWS` | Google Workspace |
| `GLP` | GLPI |
| `GLB` | Globais / Transversais |

---

## Sumário

1. [Regras Globais e Transversais](#1-regras-globais-e-transversais-glb)
2. [Incidentes](#2-incidentes-inc)
3. [Requisições](#3-requisições-req)
4. [Problemas](#4-problemas-prb)
5. [Ativos](#5-ativos-ast)
6. [Compliance](#6-compliance-cpl)
7. [Financeiro](#7-financeiro-fin)
8. [Compras](#8-compras-prc)
9. [Projetos](#9-projetos-prj)
10. [Base de Conhecimento](#10-base-de-conhecimento-kb)
11. [SLA](#11-sla-sla)
12. [E-mail](#12-e-mail-eml)
13. [Google Workspace](#13-google-workspace-gws)
14. [GLPI](#14-glpi-glp)

---

## 1. Regras Globais e Transversais (GLB)

---

**BR-GLB-001**
**Toda operação de escrita deve ser auditada.**
Todo CREATE, UPDATE e DELETE lógico em qualquer entidade de negócio gera registro imutável em `shared.audit_log` com: `user_id`, `user_role`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `occurred_at`.
**Camada:** Sistema (AuditInterceptor global)
**Violação:** A operação é bloqueada se o registro de auditoria não puder ser criado.

---

**BR-GLB-002**
**Nenhum registro de negócio é fisicamente excluído.**
Toda exclusão é lógica (soft delete) via preenchimento de `deleted_at` e `deleted_by`. A exclusão física é tecnicamente proibida por políticas RLS no banco de dados.
**Camada:** Banco (RLS) + Domínio
**Violação:** 403 Forbidden para qualquer operação de DELETE físico.

---

**BR-GLB-003**
**Todo registro pertence a um tenant.**
Toda entidade de negócio possui o campo `tenant_id` preenchido obrigatoriamente. Registros de tenants distintos são completamente isolados por Row Level Security.
**Camada:** Banco (RLS)
**Violação:** Acesso a dados de outro tenant retorna 404 (sem revelar existência).

---

**BR-GLB-004**
**Toda data e hora é armazenada em UTC.**
O banco de dados armazena todos os timestamps em UTC com timezone explícito (`TIMESTAMPTZ`). A conversão para o fuso horário do usuário ocorre apenas na camada de apresentação.
**Camada:** Banco + Aplicação
**Violação:** Timestamps sem timezone são rejeitados na entrada da API.

---

**BR-GLB-005**
**Todos os IDs são UUID v4.**
Identificadores primários de todas as entidades são UUID v4 gerados pela aplicação. IDs sequenciais inteiros não são usados como chave primária de negócio, exceto para números legíveis (ex: `TKT-2026-000001`).
**Camada:** Aplicação
**Violação:** Criação de entidade com ID fornecido pelo cliente é ignorada — sistema gera o próprio UUID.

---

**BR-GLB-006**
**O número legível de chamados é sequencial, imutável e único por tenant.**
O campo `number` (ex: `TKT-2026-000123`, `INC-2026-000045`) é gerado pelo banco via `BIGSERIAL`, nunca reutilizado e nunca alterado após criação.
**Camada:** Banco
**Violação:** Tentativa de alterar o number de um chamado retorna 422.

---

**BR-GLB-007**
**Notificação é disparada a cada transição de estado relevante.**
Toda mudança de status em chamado, ativo, identidade, compliance ou projeto gera notificação ao(s) responsável(is) configurado(s), via canal preferencial do usuário (in-app e/ou e-mail).
**Camada:** Aplicação (EventBus → NotificationModule)
**Violação:** Falha no envio de notificação não bloqueia a transição de estado — é registrada para retry.

---

**BR-GLB-008**
**Dados pessoais identificáveis (PII) residem exclusivamente no schema `identity`.**
Nome, e-mail, cargo e outros dados pessoais de colaboradores são armazenados apenas no schema `identity`. Os demais módulos referenciam exclusivamente o `user_id` (UUID pseudônimo).
**Camada:** Arquitetura (DDD)
**Violação:** Pull Request que crie campo PII fora do schema `identity` é bloqueado por code review.

---

**BR-GLB-009**
**Todo aviso de vencimento é emitido com antecedência mínima de 2 dias úteis.**
Alertas automáticos de vencimento (SLA, garantia de ativo, contrato, licença) são disparados com pelo menos 2 dias úteis de antecedência. Alertas adicionais são configuráveis por módulo.
**Camada:** Sistema (jobs agendados)
**Gatilho:** Job diário às 07h00.
**Referência:** BR-AST-012, BR-FIN-008, BR-SLA-003.

---

**BR-GLB-010**
**O campo `reason` é obrigatório em todas as operações destrutivas ou críticas.**
Exclusão lógica, suspensão de usuário, cancelamento de contrato, revogação de acesso e outras operações irreversíveis ou de alto impacto exigem preenchimento obrigatório do campo `reason` com mínimo de 10 caracteres.
**Camada:** Aplicação (Use Cases)
**Violação:** 400 VALIDATION_ERROR com mensagem "Justificativa obrigatória para esta operação."

---

## 2. Incidentes (INC)

---

**BR-INC-001**
**Todo incidente deve pertencer a um serviço do catálogo.**
Ao criar um incidente, o campo `catalog_id` é obrigatório e deve referenciar um item de serviço com status `PUBLISHED` no `catalog.ServiceCatalog`. Não é possível abrir incidente sem categoria de serviço.
**Camada:** Domínio
**Violação:** 400 VALIDATION_ERROR — "Selecione um serviço do catálogo para prosseguir."

---

**BR-INC-002**
**Todo incidente possui SLA calculado no momento da abertura.**
Imediatamente após a criação, o sistema calcula e persiste os prazos `sla_response_deadline` e `sla_resolution_deadline` com base na prioridade e no SLA do serviço. Um incidente sem SLA calculado é inválido.
**Camada:** Aplicação (OpenIncidentUseCase → SlaCalculationService)
**Violação:** Se o SLA do serviço não for encontrado, aplica-se o SLA padrão da prioridade calculada.

---

**BR-INC-003**
**A prioridade do incidente é calculada pela matriz impacto × urgência — nunca informada pelo usuário final.**
O sistema determina a prioridade automaticamente cruzando `impact` e `urgency`. O usuário final informa apenas o impacto percebido e a urgência; o sistema calcula a prioridade real.
**Camada:** Domínio (PriorityMatrixDomainService)
**Matriz:**

| | Urgência Crítica | Urgência Alta | Urgência Média | Urgência Baixa |
|---|:---:|:---:|:---:|:---:|
| **Impacto Generalizado** | CRÍTICO | CRÍTICO | ALTO | ALTO |
| **Impacto Significativo** | CRÍTICO | ALTO | ALTO | MÉDIO |
| **Impacto Moderado** | ALTO | ALTO | MÉDIO | BAIXO |
| **Impacto Menor** | ALTO | MÉDIO | BAIXO | BAIXO |

---

**BR-INC-004**
**Incidente com status CLOSED não pode ser atribuído, editado ou resolvido.**
Após o fechamento (`CLOSED`), o incidente é somente leitura. A única operação permitida é reabertura (conforme BR-INC-005).
**Camada:** Domínio (Incident entity — invariante)
**Violação:** 409 TICKET_ALREADY_CLOSED.

---

**BR-INC-005**
**Reabertura de incidente exige justificativa e possui janela de 7 dias.**
Um incidente com status `CLOSED` pode ser reaberto apenas dentro de 7 dias corridos após o fechamento. Após 7 dias, somente `IT_MANAGER` ou superior pode reabrir. Justificativa mínima de 20 caracteres é obrigatória.
**Camada:** Domínio + Aplicação
**Violação:** 422 BUSINESS_RULE_VIOLATION — "Prazo de reabertura encerrado. Abra um novo incidente."

---

**BR-INC-006**
**Incidente crítico não atribuído em 15 minutos é escalonado automaticamente para o grupo responsável.**
Se um incidente com prioridade `CRITICAL` permanecer sem atribuição técnica por 15 minutos após a abertura, o sistema escala automaticamente para o grupo de suporte responsável pelo serviço e notifica o IT_MANAGER.
**Camada:** Sistema (SlaMonitoringJob)
**Gatilho:** Job a cada 5 minutos.

---

**BR-INC-007**
**Incidente não pode ser resolvido sem preenchimento das notas de resolução.**
O campo `resolution_notes` é obrigatório ao resolver um incidente. Mínimo de 30 caracteres. A solução deve descrever o que foi feito, não apenas "resolvido".
**Camada:** Domínio (ResolutionDetails value object)
**Violação:** 400 VALIDATION_ERROR — "Descreva a solução aplicada antes de resolver o chamado."

---

**BR-INC-008**
**O solicitante recebe notificação em cada transição de status do seu incidente.**
O usuário que abriu o incidente recebe notificação automática (in-app + e-mail) quando o status muda para: `IN_PROGRESS`, `PENDING_USER`, `ESCALATED`, `RESOLVED` e `CLOSED`.
**Camada:** Aplicação (EventBus → Notification)
**Exceção:** Transições `SYSTEM` (automáticas) de baixo impacto não enviam e-mail — apenas in-app.

---

**BR-INC-009**
**Incidente com status PENDING_USER tem SLA pausado automaticamente.**
Quando o status é alterado para `PENDING_USER` (aguardando retorno do solicitante), o contador de SLA é pausado. O SLA é retomado automaticamente quando o solicitante adiciona um comentário ou quando o técnico altera o status.
**Camada:** Domínio (Incident entity → pauseSla())
**Violação:** Tentativa de marcar SLA como pausado sem status PENDING_USER retorna 422.

---

**BR-INC-010**
**Incidente com prioridade CRITICAL deve ter ao menos um comentário técnico a cada 1 hora.**
Se um incidente `CRITICAL` passar 1 hora sem nenhum comentário `INTERNAL` ou atualização de status, o sistema notifica o técnico atribuído e o IT_MANAGER sobre ausência de atualização.
**Camada:** Sistema (MonitoringJob)
**Gatilho:** Job a cada 30 minutos para incidentes críticos.

---

**BR-INC-011**
**O mesmo ativo não pode estar vinculado a mais de 2 incidentes abertos simultaneamente.**
Se um ativo já possui 2 incidentes com status diferente de `RESOLVED` ou `CLOSED`, a criação de um terceiro incidente vinculado ao mesmo ativo requer confirmação explícita e cria automaticamente uma sugestão de vinculação ao Problema correspondente.
**Camada:** Aplicação
**Violação:** 422 com aviso — "Este ativo já possui 2 incidentes abertos. Deseja vincular ao problema existente?"

---

**BR-INC-012**
**Incidente não pode ser fechado sem avaliação CSAT do solicitante ou decurso de 72 horas após resolução.**
O status `CLOSED` é atingido quando: (a) o solicitante confirma a resolução e fornece CSAT, ou (b) passam-se 72 horas após o status `RESOLVED` sem ação do solicitante (fechamento automático com CSAT não fornecido registrado).
**Camada:** Aplicação + Sistema (job)
**Gatilho:** Evento `IncidentResolved` inicia timer de 72h.

---

**BR-INC-013**
**Incidente GLPI sincronizado não pode ter o número GLPI alterado após criação.**
O campo `glpi_ticket_id` é imutável após ser preenchido. A sincronização com o GLPI usa sempre este ID para atualizações, nunca cria um segundo ticket para o mesmo incidente.
**Camada:** Domínio + Infraestrutura (GlpiTicketAdapter)
**Violação:** 422 se tentativa de alterar `glpi_ticket_id` de incidente já sincronizado.

---

## 3. Requisições (REQ)

---

**BR-REQ-001**
**Toda requisição deve ser baseada em um tipo de serviço publicado no catálogo.**
O campo `catalog_id` é obrigatório. A requisição deve referenciar um item de catálogo com status `PUBLISHED` e `defaultTicketType = REQUEST`.
**Camada:** Domínio
**Violação:** 400 VALIDATION_ERROR — "Selecione um tipo de serviço para sua requisição."

---

**BR-REQ-002**
**O solicitante de uma requisição não pode ser seu próprio aprovador em nenhuma etapa.**
Em qualquer etapa do fluxo de aprovação, o sistema verifica que `approver_id != requester_id`. Esta regra se aplica independentemente do papel do usuário.
**Camada:** Domínio (ApproveRequestUseCase — segregação SoD-01)
**Violação:** 422 SELF_APPROVAL_NOT_ALLOWED.

---

**BR-REQ-003**
**Requisição não aprovada dentro do prazo da etapa gera escalonamento automático.**
Cada etapa de aprovação possui prazo configurável (padrão: 2 dias úteis). Se o aprovador não decidir dentro do prazo, o sistema escala para o IT_MANAGER e registra a ocorrência.
**Camada:** Sistema (ApprovalExpiryJob)
**Gatilho:** Job diário às 08h.

---

**BR-REQ-004**
**Requisição cancelada não pode ser reativada — deve ser criada uma nova.**
Status `CANCELLED` é terminal. Nenhuma operação, exceto visualização, é permitida em requisição cancelada.
**Camada:** Domínio (ServiceRequest entity — invariante)
**Violação:** 409 CONFLICT — "Requisição cancelada. Abra uma nova solicitação."

---

**BR-REQ-005**
**Todo periférico entregue como fulfillment de requisição gera registro de ativo.**
Quando o fulfillment de uma requisição do tipo "Aquisição de Equipamento" é concluído, o sistema automaticamente direciona o técnico para o módulo de Ativos para registro do bem recebido. O fulfillment não pode ser marcado como concluído sem o `asset_id` do ativo criado.
**Camada:** Aplicação (FulfillRequestUseCase)
**Violação:** 422 — "Registre o ativo no módulo de Inventário antes de concluir o fulfillment."

---

**BR-REQ-006**
**Requisição de acesso fulfillada dispara provisionamento automático no módulo de Identidades.**
Quando uma requisição com categoria de acesso é marcada como `FULFILLED`, o evento `AccessRequestFulfilled` é publicado e consumido pelo módulo IAM, que inicia o fluxo de concessão de acesso.
**Camada:** Aplicação (EventBus → IdentityModule)
**Referência:** BR-GWS-003.

---

**BR-REQ-007**
**Requisição rejeitada deve informar o motivo ao solicitante.**
Ao rejeitar uma requisição, o campo `reason` é obrigatório (mínimo 20 caracteres). O motivo é exibido ao solicitante na notificação de rejeição.
**Camada:** Domínio
**Violação:** 400 VALIDATION_ERROR — "Informe o motivo da rejeição."

---

**BR-REQ-008**
**Não é permitido reenviar requisição rejeitada — deve ser criada nova com as correções.**
Após rejeição, o solicitante pode visualizar o motivo e criar uma nova requisição. O sistema sugere pré-preencher com os dados da requisição rejeitada.
**Camada:** Aplicação
**Comportamento:** Interface oferece botão "Solicitar Novamente" que pré-popula o formulário.

---

**BR-REQ-009**
**O formulário de requisição deve seguir o schema definido no tipo de serviço.**
Os campos do formulário são dinâmicos e definidos pelo `form_schema` do `RequestType`. O sistema valida todos os campos obrigatórios do schema antes de submeter a requisição.
**Camada:** Aplicação (ValidationPipe + DTO dinâmico)
**Violação:** 400 com lista de campos obrigatórios não preenchidos.

---

**BR-REQ-010**
**Requisição em status PENDING_APPROVAL não pode ser editada pelo solicitante.**
Após a submissão, a requisição entra em fluxo de aprovação. Qualquer edição requereria recomeçar o fluxo, portanto é bloqueada. Apenas cancelamento é permitido.
**Camada:** Domínio
**Violação:** 409 CONFLICT — "Requisição em aprovação não pode ser editada."

---

## 4. Problemas (PRB)

---

**BR-PRB-001**
**Um problema deve estar vinculado a pelo menos um incidente.**
O módulo de Gestão de Problemas serve para investigar causas raiz de incidentes. Não é possível criar um problema sem vincular ao menos um incidente existente.
**Camada:** Domínio (Problem entity — invariante)
**Violação:** 400 — "Vincule ao menos um incidente para registrar o problema."

---

**BR-PRB-002**
**Workaround publicado torna-se imediatamente disponível no KEDB e na Base de Conhecimento.**
Ao publicar um workaround, o sistema automaticamente: (a) registra o problema como `KNOWN_ERROR`, (b) cria rascunho de artigo na KB (status `DRAFT_AI`) e (c) disponibiliza o workaround na listagem pública de erros conhecidos.
**Camada:** Aplicação (EventBus → KnowledgeModule)
**Referência:** BR-KB-004.

---

**BR-PRB-003**
**Problema não pode ser fechado sem causa raiz confirmada ou sem workaround publicado.**
O sistema impede o fechamento de problema que não possua ao menos um de: (a) causa raiz confirmada (`is_root_cause=true`) ou (b) workaround publicado. Problemas sem solução devem ser mantidos como `KNOWN_ERROR`.
**Camada:** Domínio (CloseProblemUseCase — pré-condição)
**Violação:** 422 — "Confirme a causa raiz ou publique um workaround antes de fechar o problema."

---

**BR-PRB-004**
**Problema fechado com solução definitiva depreca automaticamente o workaround associado.**
Quando um problema é fechado com solução definitiva implementada, os workarounds associados são automaticamente marcados como `DEPRECATED` e os artigos KB vinculados são atualizados.
**Camada:** Aplicação
**Exceção:** Workarounds de erros conhecidos sem solução definitiva não são depreciados.

---

**BR-PRB-005**
**Incidente vinculado a problema herda o workaround publicado como sugestão de solução imediata.**
Quando um novo incidente é criado para um serviço que já possui um problema com workaround publicado, o sistema sugere automaticamente o workaround ao técnico atribuído, com link para o artigo KB correspondente.
**Camada:** Aplicação (OpenIncidentUseCase → KnowledgeModule)
**Comportamento:** Card "Solução Sugerida" exibido no topo da página do incidente.

---

**BR-PRB-006**
**A análise de causa raiz deve especificar o método utilizado.**
O campo `root_cause_method` é obrigatório ao registrar uma causa raiz. Os métodos aceitos são: `FIVE_WHYS`, `FISHBONE`, `FAULT_TREE`, `TIMELINE`.
**Camada:** Domínio (RootCause entity)
**Violação:** 400 VALIDATION_ERROR — "Informe o método de análise de causa raiz utilizado."

---

## 5. Ativos (AST)

---

**BR-AST-001**
**Todo ativo deve possuir responsável atribuído.**
Um ativo não pode ter status `IN_USE` ou `ALLOCATED` sem um responsável (`user_id`) atribuído. Ativos em estoque ou em manutenção podem ter responsável como o grupo de TI.
**Camada:** Domínio (Asset entity — invariante)
**Violação:** 422 — "Informe o responsável pelo ativo antes de alterar o status para Em Uso."

---

**BR-AST-002**
**Toda movimentação de ativo deve ser registrada e auditada.**
Qualquer alteração de localização, status ou responsável de um ativo gera registro na tabela `asset.AssetMovement`, além do registro padrão em `shared.audit_log`. Não é possível mover um ativo sem registrar a movimentação.
**Camada:** Aplicação (AllocateAssetUseCase, MoveAssetUseCase)
**Violação:** Operação bloqueada sem preenchimento de `from_location`, `to_location` e `reason`.

---

**BR-AST-003**
**Todo ativo deve possuir etiqueta patrimonial (asset_tag) única no tenant.**
O campo `asset_tag` é obrigatório e único por tenant. Não é possível registrar dois ativos com a mesma etiqueta.
**Camada:** Banco (UNIQUE constraint) + Domínio
**Violação:** 409 DUPLICATE_ASSET_TAG.

---

**BR-AST-004**
**Ativo em uso não pode ser descomissionado sem desalocação prévia.**
O ciclo de vida exige que o ativo seja primeiro desalocado (status `IN_STOCK`) antes de ser descomissionado. Ativos com usuário atribuído não aceitam descomissionamento direto.
**Camada:** Domínio (DecommissionAssetUseCase — pré-condição)
**Violação:** 422 — "Desaloque o ativo do usuário responsável antes de descomissionar."

---

**BR-AST-005**
**Descomissionamento de ativo requer aprovação do Gestor.**
A operação de descomissionamento é sempre de dois passos: (1) Coordenador solicita, (2) Gestor aprova. Apenas após aprovação o status `DECOMMISSIONED` é efetivado.
**Camada:** Aplicação (fluxo de aprovação em DecommissionAssetUseCase)
**Referência:** BR em 23_USER_ROLES.md seção 4.1.

---

**BR-AST-006**
**Alerta automático de garantia é emitido 90, 60 e 30 dias antes do vencimento.**
Ativos com `warranty_end` preenchido recebem alertas automáticos ao técnico responsável e ao IT_MANAGER com 90, 60 e 30 dias de antecedência. Alerta final com 2 dias de antecedência (conforme BR-GLB-009).
**Camada:** Sistema (WarrantyExpiryJob — diário)
**Destino:** Notificação in-app + e-mail para técnico atribuído e IT_MANAGER.

---

**BR-AST-007**
**Licença de software com utilização abaixo de 20% gera alerta de subutilização.**
O sistema monitora mensalmente a relação `licenses_used / licenses_total` por produto. Quando a utilização cair abaixo de 20%, alerta é emitido ao IT_MANAGER e ao módulo Financeiro para avaliação de cancelamento.
**Camada:** Sistema (LicenseUtilizationJob — mensal)
**Referência:** BR-FIN-010.

---

**BR-AST-008**
**Ativo recebido de compra deve ser registrado no inventário antes do recebimento ser concluído.**
A conclusão do recebimento de um pedido de compra exige o registro dos itens recebidos como ativos no módulo ITAM. O campo `asset_id` de cada `PurchaseItem` deve estar preenchido antes de marcar o item como recebido.
**Camada:** Aplicação (ReceivePurchaseItemUseCase)
**Referência:** BR-PRC-005.

---

**BR-AST-009**
**Ativo em manutenção tem seu SLA de incidente vinculado pausado automaticamente.**
Quando um ativo entra em status `UNDER_MAINTENANCE`, todos os incidentes abertos vinculados a este ativo têm o SLA pausado automaticamente (razão: `ASSET_UNDER_MAINTENANCE`).
**Camada:** Aplicação (EventBus: AssetUnderMaintenance → IncidentModule)
**Referência:** BR-INC-009.

---

**BR-AST-010**
**Número de série (serial_number) é único por tenant quando preenchido.**
O campo `serial_number` é opcional, mas quando preenchido, deve ser único por tenant. O sistema rejeita duplicação de número de série.
**Camada:** Banco (UNIQUE partial constraint WHERE serial_number IS NOT NULL)
**Violação:** 409 — "Número de série já cadastrado para outro ativo."

---

**BR-AST-011**
**Ativo descomissionado não pode ser realocado ou colocado em uso.**
Status `DECOMMISSIONED` é terminal para operações de uso. O ativo pode ser consultado para fins históricos, mas não aceita atribuição, movimentação de uso ou manutenção.
**Camada:** Domínio (Asset entity — invariante de status)
**Violação:** 422 — "Ativo descomissionado não pode ser realocado."

---

**BR-AST-012**
**Ativo sem responsável há mais de 30 dias gera alerta de conformidade.**
Ativos com status `IN_USE` ou `ALLOCATED` que permanecerem sem `user_id` atribuído por mais de 30 dias geram alerta semanal ao IT_MANAGER para regularização.
**Camada:** Sistema (OrphanAssetJob — semanal)

---

## 6. Compliance (CPL)

---

**BR-CPL-001**
**Todo apontamento de compliance exige ao menos uma evidência para ser resolvido.**
Não-conformidades com status `IN_TREATMENT` não podem ser marcadas como `RESOLVED` sem ao menos uma evidência com status `APPROVED` vinculada. Evidências em status `PENDING` ou `REJECTED` não satisfazem esta regra.
**Camada:** Domínio (ResolveFindingUseCase — pré-condição)
**Violação:** 422 — "Adicione e aprove ao menos uma evidência antes de resolver o apontamento."

---

**BR-CPL-002**
**Evidência de compliance não pode ser aprovada por quem a coletou.**
A aprovação de uma evidência exige que `reviewer_id != uploaded_by`. Esta regra implementa a segregação de funções em compliance (SoD-03).
**Camada:** Domínio (ApproveEvidenceUseCase — pré-condição)
**Violação:** 422 SELF_REVIEW_NOT_ALLOWED — "O revisor da evidência deve ser diferente de quem a coletou."

---

**BR-CPL-003**
**Não-conformidade crítica deve ter plano de ação criado em até 5 dias úteis.**
Achados com `severity = CRITICAL` que não possuam plano de ação criado após 5 dias úteis da identificação geram alerta diário ao IT_MANAGER e ao Compliance Officer responsável.
**Camada:** Sistema (ComplianceAlertJob — diário)
**Violação:** Alerta de escalada para SUPER_ADMIN após 10 dias úteis sem plano de ação.

---

**BR-CPL-004**
**Evidência de compliance é imutável após aprovação.**
Uma vez que a evidência tem `review_status = APPROVED`, o arquivo não pode ser substituído. Para atualizar, deve-se criar nova evidência — a anterior é mantida no histórico.
**Camada:** Domínio (ComplianceEvidence — invariante)
**Violação:** 422 — "Evidência aprovada não pode ser substituída. Adicione uma nova evidência."

---

**BR-CPL-005**
**Auditoria concluída não pode ter novos achados adicionados.**
Após o status da auditoria ser alterado para `COMPLETED`, o sistema bloqueia a criação de novos achados vinculados a ela. Achados descobertos após a conclusão devem ser vinculados a uma nova auditoria ou ciclo de acompanhamento.
**Camada:** Domínio
**Violação:** 422 — "Auditoria encerrada. Crie um novo ciclo para registrar achados adicionais."

---

**BR-CPL-006**
**Política publicada deve passar por aprovação do Gestor antes de entrar em vigor.**
Políticas criadas pelo Compliance Officer têm status `DRAFT` até aprovação formal do IT_MANAGER. Somente após aprovação e publicação a política é exibida para os usuários.
**Camada:** Aplicação (PublishPolicyUseCase — pré-condição)
**Violação:** 403 — "Aprovação do Gestor necessária para publicar a política."

---

**BR-CPL-007**
**Controle mapeado como NOT_APPLICABLE deve ter justificativa documentada.**
Ao marcar um controle como `NOT_APPLICABLE`, o campo `not_applicable_reason` é obrigatório (mínimo de 50 caracteres). Justificativas genéricas são rejeitadas.
**Camada:** Domínio
**Violação:** 400 VALIDATION_ERROR — "Documente a justificativa para não aplicabilidade do controle."

---

**BR-CPL-008**
**Revisão de maturidade de compliance é gerada automaticamente ao concluir uma auditoria.**
Ao fechar uma auditoria, o sistema calcula automaticamente o `maturity_score` baseado no percentual de controles `IMPLEMENTED` e `PARTIALLY_IMPLEMENTED` (com peso 0,5) sobre o total aplicável.
**Fórmula:** `(implemented + partially_implemented * 0.5) / (total - not_applicable) * 100`
**Camada:** Domínio (GenerateMaturityReportUseCase)

---

**BR-CPL-009**
**Achado não-conformidade de severidade CRITICAL bloqueia a conclusão da auditoria.**
Uma auditoria com achados de severidade `CRITICAL` em status `OPEN` não pode ser marcada como `COMPLETED`. Todos os achados críticos devem ter plano de ação criado (não necessariamente concluído).
**Camada:** Aplicação (CloseAuditUseCase — pré-condição)
**Violação:** 422 — "Existem não-conformidades críticas em aberto sem plano de ação."

---

**BR-CPL-010**
**Exportação de evidências para auditores externos gera registro de auditoria obrigatório.**
Toda exportação de pacote de evidências (endpoint `POST /compliance/findings/:id/evidence-export`) gera registro em `shared.audit_log` com `action=EXPORT`, incluindo lista dos arquivos exportados, destino declarado e aprovação do Gestor.
**Camada:** Aplicação (ExportEvidenceUseCase)
**Referência:** RS-AUDIT-002 em 14_SECURITY_REQUIREMENTS.md.

---

## 7. Financeiro (FIN)

---

**BR-FIN-001**
**Todo custo de TI deve ser classificado obrigatoriamente como OPEX ou CAPEX.**
O campo `type` com valores `OPEX` ou `CAPEX` é obrigatório em todos os lançamentos financeiros. Não é possível registrar despesa ou investimento sem esta classificação.
**Camada:** Domínio
**Violação:** 400 VALIDATION_ERROR — "Classifique o custo como OPEX (despesa operacional) ou CAPEX (investimento)."

---

**BR-FIN-002**
**Quem registra um lançamento financeiro não pode aprová-lo.**
A aprovação de despesa OPEX ou investimento CAPEX requer que `approved_by != created_by`. Esta regra implementa a segregação SoD-02.
**Camada:** Aplicação (ApproveExpenseUseCase — pré-condição)
**Violação:** 422 SELF_APPROVAL_NOT_ALLOWED.

---

**BR-FIN-003**
**Toda despesa deve estar vinculada a um centro de custo ativo.**
O campo `cost_center_id` é obrigatório em despesas OPEX e investimentos CAPEX. O centro de custo referenciado deve ter `is_active = true`.
**Camada:** Domínio
**Violação:** 400 — "Centro de custo obrigatório e deve estar ativo."

---

**BR-FIN-004**
**Orçamento excedido em 100% gera alerta imediato ao IT_MANAGER.**
Quando o total de despesas realizadas supera o valor orçado (`total_amount`), o sistema publica o evento `BudgetExceeded` e notifica imediatamente o IT_MANAGER responsável pelo centro de custo.
**Camada:** Domínio (Budget entity — RegisterExpense invariante) + EventBus
**Limite de tolerância:** Até 20% de estouro é registrado como alerta; acima de 20% bloqueia novos lançamentos sem aprovação do IT_MANAGER.

---

**BR-FIN-005**
**Contrato vence com alerta automático 90, 60, 30 e 2 dias antes do vencimento.**
Contratos com `status = ACTIVE` e `end_date` preenchida recebem alertas automáticos ao responsável e ao IT_MANAGER nos marcos de 90, 60, 30 e 2 dias antes do vencimento.
**Camada:** Sistema (ContractExpiryJob — diário às 07h00)
**Referência:** BR-GLB-009.

---

**BR-FIN-006**
**Contrato com renovação automática (`auto_renew = true`) gera alerta de revisão antes de ser renovado.**
Contratos com `auto_renew = true` geram alerta ao responsável `alert_days_before` dias antes do vencimento (padrão: 90 dias) para revisão consciente da renovação. Sem ação do responsável, o contrato é renovado automaticamente e o evento `ContractRenewed` é registrado.
**Camada:** Sistema (ContractRenewalJob)

---

**BR-FIN-007**
**Ativo descomissionado gera baixa patrimonial automática no módulo financeiro.**
Quando o evento `AssetDecommissioned` é publicado, o módulo Financeiro registra automaticamente a baixa do ativo, zerando o `current_value` e encerrando a depreciação.
**Camada:** Aplicação (EventBus: AssetDecommissioned → FinancialModule)

---

**BR-FIN-008**
**Despesa registrada sem nota fiscal referenciada gera alerta de pendência.**
Toda despesa OPEX acima de R$500,00 deve ter nota fiscal ou fatura anexada via `file_reference_id`. Despesas sem documentação fiscal ficam com status `PENDING` e geram alerta semanal ao IT_MANAGER.
**Camada:** Aplicação
**Exceção:** Despesas abaixo de R$500,00 podem ser registradas sem anexo.

---

**BR-FIN-009**
**Rateio de custos de TI é recalculado mensalmente por centro de custo.**
No primeiro dia útil de cada mês, o sistema gera automaticamente o rateio do mês anterior, distribuindo os custos de TI proporcionalmente por centro de custo conforme a base de alocação configurada.
**Camada:** Sistema (CostAllocationJob — mensal)

---

**BR-FIN-010**
**Licença de software subutilizada por 3 meses consecutivos é candidata a cancelamento.**
Quando `LicenseUtilizationLow` é publicado por 3 meses seguidos para o mesmo produto, o sistema cria automaticamente uma sugestão de cancelamento no módulo de Compras e notifica o IT_MANAGER e o Analista Financeiro.
**Camada:** Sistema (LicenseAnalysisJob — mensal)
**Referência:** BR-AST-007.

---

## 8. Compras (PRC)

---

**BR-PRC-001**
**Todo pedido de compra deve estar vinculado a uma requisição de compra aprovada.**
Não é possível criar um `PurchaseOrder` sem um `PurchaseRequest` com status `APPROVED`. A criação direta de pedido sem requisição prévia é bloqueada.
**Camada:** Domínio
**Violação:** 400 — "Crie e aprove uma requisição de compra antes de emitir o pedido."

---

**BR-PRC-002**
**Quem cria a requisição de compra não pode aprová-la.**
Implementação da regra SoD-01 para compras. O aprovador de cada etapa deve ser diferente do solicitante.
**Camada:** Aplicação (ApprovePurchaseRequestUseCase — pré-condição)
**Violação:** 422 SELF_APPROVAL_NOT_ALLOWED.

---

**BR-PRC-003**
**O threshold de aprovação define o nível de autorização necessário por valor.**
Requisições de compra seguem o seguinte escalonamento de aprovação:
- Até R$1.000,00: aprovação do Coordenador.
- De R$1.000,01 a R$10.000,00: aprovação do Gestor.
- Acima de R$10.000,00: aprovação do Gestor com step-up authentication.
**Camada:** Aplicação (SubmitPurchaseRequestUseCase — geração do fluxo de aprovação)

---

**BR-PRC-004**
**Todo recebimento de item deve ser registrado individualmente por linha do pedido.**
O sistema exige que cada linha (`PurchaseItem`) do pedido seja confirmada individualmente com a quantidade efetivamente recebida. Recebimento parcial é permitido e altera o status do pedido para `PARTIALLY_RECEIVED`.
**Camada:** Domínio (ReceivePurchaseItemUseCase)

---

**BR-PRC-005**
**Item recebido de categoria hardware ou periférico cria ativo automaticamente.**
Ao registrar o recebimento de um `PurchaseItem` de categoria `HARDWARE` ou `PERIPHERAL`, o sistema redireciona o técnico para criação do ativo no módulo ITAM. O recebimento só é concluído após o ativo ser criado.
**Camada:** Aplicação
**Referência:** BR-AST-008 e BR-REQ-005.

---

**BR-PRC-006**
**Pedido de compra cancelado após emissão requer justificativa e notificação ao fornecedor.**
Cancelamento de `PurchaseOrder` com status `SENT` ou `CONFIRMED` exige justificativa formal e gera notificação ao Analista Financeiro para providenciar comunicação formal ao fornecedor.
**Camada:** Aplicação
**Violação:** 400 — "Justificativa obrigatória para cancelar pedido já emitido ao fornecedor."

---

**BR-PRC-007**
**Fornecedor sem CNPJ válido não pode ser cadastrado como ativo.**
O campo `cnpj`, quando preenchido, deve ser validado quanto ao formato e dígito verificador. Fornecedores pessoa física ou estrangeiros podem ter `cnpj = null`, mas devem ter `contact_email` preenchido.
**Camada:** Domínio (Supplier entity — value object de CNPJ)
**Violação:** 400 VALIDATION_ERROR — "CNPJ inválido."

---

**BR-PRC-008**
**Pedido de compra recebido integralmente baixa a reserva orçamentária automaticamente.**
Quando todos os itens de um `PurchaseOrder` estão com status `RECEIVED`, o evento `ItemReceived` publica o valor total para o módulo Financeiro efetuar a baixa no CAPEX orçado.
**Camada:** Aplicação (EventBus: ItemReceived → FinancialModule)

---

## 9. Projetos (PRJ)

---

**BR-PRJ-001**
**Todo projeto deve ter patrocinador e gerente designados.**
Os campos `sponsor_id` e `manager_id` são obrigatórios na criação do projeto. O patrocinador e o gerente devem ser usuários distintos com papéis compatíveis.
**Camada:** Domínio
**Violação:** 400 — "Informe o patrocinador e o gerente do projeto."

---

**BR-PRJ-002**
**Projeto não pode ser iniciado sem aprovação formal.**
Status `IN_PROGRESS` só é atingido a partir de `APPROVED`. Nenhum projeto pode sair de `IDEATION` ou `APPROVED` diretamente para `IN_PROGRESS` sem o evento de aprovação registrado.
**Camada:** Domínio (Project entity — máquina de estado)
**Violação:** 422 — "Projeto precisa ser aprovado antes de iniciar."

---

**BR-PRJ-003**
**Marco (milestone) atrasado altera automaticamente o status de saúde do projeto.**
Quando a data atual ultrapassa o `planned_end` de um marco não concluído, o sistema altera o `health` do projeto para `YELLOW`. Dois ou mais marcos atrasados alteram para `RED`.
**Camada:** Sistema (ProjectHealthJob — diário às 07h00)

---

**BR-PRJ-004**
**Projeto com orçamento excedido em 10% tem status de saúde alterado para YELLOW.**
Quando `spent_amount > budget_amount * 1.10`, o sistema altera o `health` do projeto para `YELLOW` e notifica o Gestor. Acima de 20% o health passa para `RED`.
**Camada:** Sistema (ProjectBudgetJob — ao registrar custo)

---

**BR-PRJ-005**
**Cancelamento de projeto libera automaticamente a reserva orçamentária.**
Ao cancelar um projeto, o sistema publica `ProjectCancelled`, e o módulo Financeiro libera o valor ainda não realizado da reserva orçamentária associada ao projeto.
**Camada:** Aplicação (EventBus: ProjectCancelled → FinancialModule)

---

**BR-PRJ-006**
**Projeto concluído não pode ter novos custos lançados.**
Status `COMPLETED` é o estado final do projeto. Após conclusão, lançamentos de custo são bloqueados. Para corrigir, é necessário reabrir o projeto (somente IT_MANAGER).
**Camada:** Domínio
**Violação:** 422 — "Projeto encerrado não aceita novos lançamentos de custo."

---

**BR-PRJ-007**
**Projeto só pode ser concluído com todos os marcos obrigatórios completados.**
Marcos do tipo `MILESTONE` com `status != COMPLETED` e `status != CANCELLED` bloqueiam a conclusão do projeto. Marcos de tipo `TASK` não bloqueiam, mas geram aviso.
**Camada:** Aplicação (CompleteProjectUseCase — pré-condição)
**Violação:** 422 — "Conclua ou cancele todos os marcos obrigatórios antes de encerrar o projeto."

---

## 10. Base de Conhecimento (KB)

---

**BR-KB-001**
**Todo artigo da Base de Conhecimento deve possuir categoria.**
O campo `category_id` é obrigatório na criação de qualquer artigo. Não é possível criar ou publicar artigo sem categoria definida.
**Camada:** Domínio
**Violação:** 400 VALIDATION_ERROR — "Selecione uma categoria para o artigo."

---

**BR-KB-002**
**Artigo não pode ser publicado sem revisão editorial aprovada.**
O fluxo obrigatório é: `DRAFT` → `UNDER_REVIEW` → `PUBLISHED`. Nenhum artigo pula a etapa de revisão. Artigos gerados por IA (`DRAFT_AI`) seguem o mesmo fluxo e exigem ao menos uma edição humana.
**Camada:** Domínio (KnowledgeArticle — máquina de estado)
**Violação:** 422 — "Artigo precisa ser submetido para revisão antes da publicação."

---

**BR-KB-003**
**Artigo publicado nunca é excluído — apenas depreciado.**
Artigos com status `PUBLISHED` não podem ter soft delete aplicado. A operação correta é a depreciação (`DEPRECATED`), que mantém o histórico e redireciona buscas para artigos mais recentes.
**Camada:** Domínio (KnowledgeArticle — invariante de exclusão)
**Violação:** 422 — "Artigo publicado não pode ser excluído. Use a ação de Deprecar."

---

**BR-KB-004**
**Workaround publicado gera rascunho automático de artigo na KB.**
Ao publicar um workaround no módulo de Problemas, o evento `WorkaroundPublished` cria automaticamente um rascunho de artigo (status `DRAFT_AI`) na KB, pré-preenchido com título, descrição do workaround e limitações conhecidas.
**Camada:** Aplicação (EventBus: WorkaroundPublished → KnowledgeModule)
**Referência:** BR-PRB-002.

---

**BR-KB-005**
**Incidente resolvido com solução documentada gera sugestão de artigo.**
Ao resolver um incidente com `resolution_notes` preenchido, o evento `IncidentResolved` verifica se já existe artigo similar (busca semântica com threshold ≥ 0,80). Se não existe, cria rascunho `DRAFT_AI`. Se existe, apenas sugere vinculação.
**Camada:** Aplicação (EventBus: IncidentResolved → KnowledgeModule)

---

**BR-KB-006**
**Artigo com avaliação negativa superior a 40% recebe alerta editorial.**
Se `not_helpful_count / (helpful_count + not_helpful_count) > 0.40` e `(helpful_count + not_helpful_count) >= 10`, o artigo é marcado com flag de revisão urgente e o IT_MANAGER é notificado.
**Camada:** Sistema (KnowledgeQualityJob — semanal)

---

**BR-KB-007**
**Artigo sem visualização há 6 meses é automaticamente sugerido para depreciação.**
Artigos `PUBLISHED` com `view_count_30d = 0` por 6 meses consecutivos geram sugestão de depreciação para o autor e o IT_MANAGER.
**Camada:** Sistema (KnowledgeMaintenanceJob — mensal)
**Exceção:** Artigos de políticas e normas não seguem esta regra.

---

**BR-KB-008**
**Artigo depreciado não aparece nos resultados de busca padrão.**
Artigos com status `DEPRECATED` são excluídos dos resultados de busca padrão. Aparecem apenas quando o filtro `status=DEPRECATED` é explicitamente aplicado por IT_TECHNICIAN+.
**Camada:** Aplicação (SearchArticlesUseCase — filtro implícito)

---

**BR-KB-009**
**Todo artigo deve ter ao menos 3 tags para garantir descoberta.**
Artigos submetidos para revisão com menos de 3 tags geram aviso (não bloqueio). Artigos publicados com menos de 3 tags são listados no relatório de manutenção editorial.
**Camada:** Aplicação (SubmitArticleForReviewUseCase — validação soft)

---

**BR-KB-010**
**A versão anterior de um artigo editado é preservada no histórico.**
Toda edição de artigo `PUBLISHED` cria automaticamente uma nova versão (`version_number + 1`), marcando a anterior com `is_current = false`. O histórico completo de versões é acessível para IT_MANAGER+.
**Camada:** Aplicação (UpdateArticleUseCase — versionamento)

---

## 11. SLA (SLA)

---

**BR-SLA-001**
**Todo chamado (incidente e requisição) deve ter SLA atribuído no momento da criação.**
O SLA é calculado e persistido imediatamente após a criação do chamado. Chamados sem SLA atribuído são tratados como erro de sistema e alertam o IT_MANAGER.
**Camada:** Aplicação (OpenIncidentUseCase, SubmitServiceRequestUseCase)
**Fallback:** Se o SLA do serviço não for encontrado, aplica o SLA padrão da prioridade.

---

**BR-SLA-002**
**SLA é calculado em minutos de trabalho, não em minutos corridos (para SLAs de horário comercial).**
Quando `working_hours_only = true`, o cálculo de deadline respeita horário comercial configurado (`business_hours_start` a `business_hours_end`) e exclui fins de semana quando `pause_on_weekends = true`.
**Camada:** Domínio (SlaCalculationService)
**Exemplo:** Incidente aberto às 17h30 com SLA de 4h (horário comercial): deadline = próximo dia às 09h30.

---

**BR-SLA-003**
**Alerta de SLA em risco é disparado quando 80% do tempo de resolução é consumido.**
O `SlaMonitoringJob` (execução a cada 5 minutos) publica `SlaAtRisk` para chamados onde o tempo decorrido ultrapassa 80% do `sla_resolution_deadline`. O evento notifica o técnico e o IT_MANAGER.
**Camada:** Sistema (SlaMonitoringJob)
**Cálculo:** `elapsed_minutes / resolution_minutes >= 0.80`

---

**BR-SLA-004**
**SLA violado gera evento `SlaBreached` e não pode ser revertido.**
Uma vez que `SlaBreached` é publicado, o chamado é marcado permanentemente como fora do SLA. Mesmo se resolvido posteriormente, a violação permanece no histórico para fins de relatório.
**Camada:** Domínio (SlaCalculationService)
**Impacto:** Afeta os KPIs de SLA global e o CSAT esperado.

---

**BR-SLA-005**
**Pausa de SLA é válida apenas para status específicos.**
O SLA só pode ser pausado quando o chamado está nos status `PENDING_USER` ou `PENDING_THIRD_PARTY`. Tentativas de pausar SLA em outros status são rejeitadas.
**Camada:** Domínio (Incident entity — PauseSla() invariante)
**Violação:** 422 SLA_CANNOT_PAUSE — "SLA pode ser pausado apenas quando o chamado aguarda retorno."

---

**BR-SLA-006**
**Tempo pausado de SLA não conta no cálculo de cumprimento.**
O campo `sla_paused_total_minutes` acumula o tempo total de pausas. O deadline efetivo é recalculado adicionando o tempo pausado ao prazo original.
**Camada:** Domínio (SlaCalculationService)
**Fórmula:** `effective_deadline = original_deadline + paused_total_minutes`

---

**BR-SLA-007**
**Definição de SLA possui versionamento — alterações criam nova versão, não sobrescrevem.**
Toda edição de um `SLA` cria uma nova versão (`version_number + 1`) com `is_current = true`. Chamados abertos antes da alteração mantêm o SLA da versão vigente no momento da abertura.
**Camada:** Aplicação (UpdateSlaUseCase — versionamento automático)

---

**BR-SLA-008**
**Chamado reaberto reinicia o cálculo de SLA.**
Ao reabrir um chamado (BR-INC-005), um novo SLA é calculado a partir do momento da reabertura, com base na prioridade atual do chamado. O histórico de SLA anterior é preservado.
**Camada:** Aplicação (ReopenIncidentUseCase)

---

## 12. E-mail (EML)

---

**BR-EML-001**
**E-mail da mesma thread nunca cria novo chamado.**
Quando um e-mail recebido contém `In-Reply-To` ou `References` que identifica uma thread existente, o sistema o adiciona como comentário ao chamado existente. Um segundo chamado para a mesma thread é tecnicamente impossível.
**Camada:** Infraestrutura (EmailProcessingAdapter)
**Implementação:** `external_thread_id` é verificado antes de criar novo ticket.

---

**BR-EML-002**
**E-mail recebido sem referência de thread existente pode criar novo chamado automaticamente.**
Quando habilitado por configuração (`auto_create_ticket_from_email = true`), e-mails de domínio corporativo sem thread existente criam automaticamente incidente ou requisição (definido pelo assunto e palavras-chave). O chamado é criado com prioridade `MEDIUM` e categoria padrão.
**Camada:** Infraestrutura (EmailToTicketJob)
**Exceção:** E-mails de endereços não cadastrados são ignorados e registrados em `email_log`.

---

**BR-EML-003**
**O remetente padrão de todas as notificações do sistema é `implantacao@pinpag.com.br`.**
Todos os e-mails transacionais do SGTI (notificações, alertas, relatórios, convites) são enviados pelo endereço `implantacao@pinpag.com.br` via SMTP Google Workspace. Nenhum outro remetente é utilizado.
**Camada:** Infraestrutura (EmailModule — NodemailerSmtpAdapter)

---

**BR-EML-004**
**E-mail de notificação com falha de entrega é retentado com backoff exponencial.**
E-mails com status `FAILED` são retentados automaticamente com intervalos de 30 segundos, 2 minutos e 10 minutos. Após 3 tentativas sem sucesso, o status é `FAILED` permanente e registrado em `email_log` para diagnóstico.
**Camada:** Infraestrutura (EmailRetryJob)

---

**BR-EML-005**
**E-mail com múltiplos destinatários do mesmo chamado é enviado como cópia oculta (BCC).**
Quando múltiplos usuários devem ser notificados sobre o mesmo evento, o sistema envia e-mails individuais por BCC — nunca expõe endereços de outros destinatários no campo `To` ou `CC`.
**Camada:** Infraestrutura (EmailModule)
**Objetivo:** Proteção de privacidade de e-mails corporativos.

---

**BR-EML-006**
**Resposta de e-mail pelo solicitante é adicionada como comentário público no chamado.**
Quando o solicitante responde ao e-mail de notificação de um chamado, a resposta é processada e adicionada como `TicketComment` com `type = PUBLIC` e `source = EMAIL`. O chamado é atualizado com timestamp da resposta.
**Camada:** Infraestrutura (EmailProcessingAdapter)

---

**BR-EML-007**
**Assunto do e-mail de notificação inclui sempre o número do chamado.**
O assunto de todo e-mail relacionado a chamados segue o padrão: `[{number}] {titulo_do_chamado}`. Isso facilita a correlação de respostas de e-mail com o chamado correto no sistema.
**Camada:** Infraestrutura (EmailTemplate — subject_template)
**Exemplo:** `[TKT-2026-000123] VPN não conecta após atualização do Windows`

---

## 13. Google Workspace (GWS)

---

**BR-GWS-001**
**Todo usuário do SGTI deve ter conta ativa no Google Workspace do domínio corporativo.**
Autenticação via Google OAuth aceita apenas contas do domínio corporativo configurado (`hd` claim no id_token). Contas pessoais @gmail.com são rejeitadas.
**Camada:** Infraestrutura (GoogleOAuthAdapter — validação do claim `hd`)
**Violação:** 403 INVALID_DOMAIN — "Acesso permitido apenas para contas corporativas."

---

**BR-GWS-002**
**Usuário desativado no Google Workspace tem acesso ao SGTI revogado em até 24 horas.**
O `GoogleSyncJob` (execução diária às 02h00) detecta contas suspensas no Google e sincroniza a suspensão no SGTI, revogando todas as sessões ativas. A revogação imediata ocorre se o evento for detectado em tempo real.
**Camada:** Sistema (GoogleSyncJob) + Infraestrutura
**Meta:** Revogação em até 2 horas (via sincronização manual pelo IT_MANAGER quando necessário urgente).

---

**BR-GWS-003**
**Provisionamento de conta Google é iniciado automaticamente ao criar usuário no SGTI.**
Ao criar um usuário via `ProvisionUserUseCase`, o sistema tenta criar a conta no Google Workspace via Admin SDK. Se a criação falha, o usuário é criado no SGTI com `status = PENDING_PROVISIONING` e a operação é retentada.
**Camada:** Aplicação (ProvisionUserUseCase → GoogleDirectoryAdapter)
**Referência:** Seção 7.3 em 22_AUTHENTICATION.md.

---

**BR-GWS-004**
**Desprovisionamento no Google deve ocorrer antes da desativação completa no SGTI.**
A ordem obrigatória do offboarding é: (1) revogar sessões SGTI, (2) suspender conta Google, (3) transferir responsabilidades, (4) marcar SGTI como INACTIVE. Desativar SGTI antes de suspender o Google é uma violação de segurança.
**Camada:** Aplicação (DeprovisionUserUseCase — orquestração sequencial)
**Referência:** Seção 7.4 em 22_AUTHENTICATION.md.

---

**BR-GWS-005**
**Grupos do Google Workspace marcados com `sgti:managed=true` são sincronizados automaticamente.**
O `GoogleGroupSyncJob` (semanal) importa grupos do Google com a tag de gestão e cria/atualiza os `IdentityGroups` correspondentes no SGTI para roteamento de chamados.
**Camada:** Sistema (GoogleGroupSyncJob — semanal)

---

**BR-GWS-006**
**Sincronização com Google nunca atualiza campos editados manualmente no SGTI.**
Campos marcados como gerenciados localmente (`locale`, `timezone`, preferências de notificação) não são sobrescritos pela sincronização Google. A sincronização atualiza apenas campos de origem Google: `display_name`, `avatar_url`, `google_org_unit`, `mfa_enabled`.
**Camada:** Infraestrutura (GoogleSyncJob — lógica de merge)

---

## 14. GLPI (GLP)

---

**BR-GLP-001**
**Todo incidente criado no SGTI gera ticket correspondente no GLPI.**
A integração é bidirecional: incidente criado no SGTI é sincronizado com o GLPI via `GlpiTicketAdapter`. O `glpi_ticket_id` é armazenado no incidente e nunca alterado após atribuído.
**Camada:** Infraestrutura (GlpiSyncEventHandler — consome `IncidentOpened`)

---

**BR-GLP-002**
**Ticket criado no GLPI não cria automaticamente incidente no SGTI.**
A sincronização GLPI → SGTI é apenas para atualização de status de tickets existentes criados pelo SGTI. O GLPI é o sistema legado; o SGTI é a fonte de novos chamados.
**Camada:** Infraestrutura (GlpiStatusSyncJob)
**Exceção:** Futuramente, migração de tickets históricos do GLPI pode ser realizada via job específico.

---

**BR-GLP-003**
**Falha na criação do ticket no GLPI não bloqueia a criação do incidente no SGTI.**
Se o GLPI estiver indisponível no momento da criação do incidente, o incidente é criado normalmente no SGTI. A sincronização com o GLPI é enfileirada para retry com backoff exponencial.
**Camada:** Infraestrutura (Circuit Breaker + SyncFailureRecord)
**Referência:** Seção 9.3 em 12_ARCHITECTURE.md.

---

**BR-GLP-004**
**Sincronização de status GLPI → SGTI ocorre a cada 5 minutos para incidentes abertos.**
O `GlpiStatusSyncJob` consulta o GLPI a cada 5 minutos para verificar atualizações de status nos tickets sincronizados. Mudanças são refletidas no SGTI como comentários de sistema e atualização de status.
**Camada:** Sistema (GlpiStatusSyncJob — a cada 5 minutos)

---

**BR-GLP-005**
**Inventário do GLPI é sincronizado diariamente às 02h00.**
O `GlpiInventorySyncJob` importa o inventário de ativos do GLPI (`Computer`, `Monitor`, `Printer`, `Peripheral`) diariamente, criando ou atualizando registros em `asset.GlpiAssetReference`.
**Camada:** Sistema (GlpiInventorySyncJob — diário às 02h00)

---

**BR-GLP-006**
**Após 5 falhas consecutivas de sincronização, o circuit breaker é ativado.**
O circuit breaker da integração GLPI é ativado após 5 falhas consecutivas. Durante 15 minutos, novas tentativas são bloqueadas. Após este período, o sistema tenta uma requisição de teste; se bem-sucedida, o circuit breaker é fechado.
**Camada:** Infraestrutura (CircuitBreaker — GlpiAdapter)
**Alerta:** IT_MANAGER notificado imediatamente quando o circuit breaker é ativado.

---

**BR-GLP-007**
**Comentários adicionados no GLPI são importados como comentários de sistema no SGTI.**
Atualizações de técnicos no ticket do GLPI são importadas como `TicketComment` com `type = INTERNAL` e `source = GLPI_SYNC` no SGTI, mantendo o histórico unificado.
**Camada:** Infraestrutura (GlpiStatusSyncJob — importação de notas)

---

## Índice de Regras por Tipo de Violação

### Regras com HTTP 400 (Validation Error)
BR-INC-007, BR-PRB-006, BR-AST-003, BR-CPL-007, BR-FIN-003, BR-KB-001, BR-REQ-007, BR-PRC-007

### Regras com HTTP 409 (Conflict)
BR-INC-004, BR-REQ-004, BR-AST-003, BR-KB-003, BR-REQ-010

### Regras com HTTP 422 (Business Rule Violation)
BR-INC-005, BR-INC-011, BR-AST-004, BR-AST-011, BR-CPL-001, BR-CPL-005, BR-CPL-009, BR-FIN-002, BR-PRB-003, BR-PRJ-002, BR-PRJ-006, BR-PRJ-007, BR-KB-002, BR-SLA-005, BR-REQ-002, BR-REQ-008, BR-PRC-002

### Regras com Comportamento de Sistema (Jobs/Events)
BR-GLB-007, BR-INC-006, BR-INC-010, BR-AST-006, BR-AST-007, BR-AST-009, BR-CPL-003, BR-CPL-008, BR-FIN-005, BR-FIN-006, BR-FIN-007, BR-FIN-009, BR-FIN-010, BR-KB-004, BR-KB-005, BR-KB-006, BR-KB-007, BR-SLA-003, BR-SLA-004, BR-PRJ-003, BR-PRJ-004, BR-PRJ-005, BR-GWS-002, BR-GLP-001, BR-GLP-004, BR-GLP-005, BR-EML-004

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição da Alteração |
|--------|------|-------|------------------------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação do documento com 113 regras de negócio |

---

> **Próximos documentos recomendados:**
> [`12_ARCHITECTURE.md`](./12_ARCHITECTURE.md) — Implementação arquitetural das regras de domínio
> [`23_USER_ROLES.md`](./23_USER_ROLES.md) — Segregação de funções que embasam as regras SoD
> [`20_DATABASE.md`](./20_DATABASE.md) — Constraints e triggers que enforçam regras no banco
