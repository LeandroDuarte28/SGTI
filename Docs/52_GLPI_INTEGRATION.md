# SGTI — Sistema de Gestão de Tecnologia da Informação
## Integração com GLPI — Documentação Funcional e Técnica

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [50_INTEGRATIONS.md](./50_INTEGRATIONS.md) · [40_INCIDENT_MANAGEMENT.md](./40_INCIDENT_MANAGEMENT.md) · [43_ASSET_MANAGEMENT.md](./43_ASSET_MANAGEMENT.md) · [24_BUSINESS_RULES.md](./24_BUSINESS_RULES.md) · [20_DATABASE.md](./20_DATABASE.md)

---

## Sobre este Documento

Este documento define a **especificação funcional e técnica da integração entre o SGTI e o GLPI (Gestionnaire Libre de Parc Informatique)**, cobrindo sincronização de tickets, inventário de ativos, mapeamento de campos, tratamento de inconsistências, segurança, auditoria, tratamento de falhas e dashboards.

**Princípio Arquitetural Fundamental:** O GLPI é o **sistema de registro patrimonial oficial** da organização. O SGTI é o **novo sistema de gestão de serviços de TI** — consome e complementa os dados do GLPI, sem substituí-lo como inventário patrimonial. Tickets e chamados são criados no SGTI; o GLPI recebe espelhos para continuidade e rastreabilidade.

**Escopo:** documentação funcional e técnica. Nenhum código ou SQL é gerado neste documento.

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura da Integração](#2-arquitetura-da-integração)
3. [Objetivos da Integração](#3-objetivos-da-integração)
4. [Sincronização de Tickets](#4-sincronização-de-tickets)
5. [Sincronização de Inventário de Ativos](#5-sincronização-de-inventário-de-ativos)
6. [Mapeamento de Campos — Tickets](#6-mapeamento-de-campos--tickets)
7. [Mapeamento de Campos — Ativos](#7-mapeamento-de-campos--ativos)
8. [Campos Exclusivos do SGTI](#8-campos-exclusivos-do-sgti)
9. [Tratamento de Inconsistências](#9-tratamento-de-inconsistências)
10. [Autenticação com o GLPI](#10-autenticação-com-o-glpi)
11. [Jobs de Sincronização](#11-jobs-de-sincronização)
12. [Sincronização Sob Demanda](#12-sincronização-sob-demanda)
13. [Segurança](#13-segurança)
14. [Auditoria e Rastreabilidade](#14-auditoria-e-rastreabilidade)
15. [Logs](#15-logs)
16. [Tratamento de Falhas](#16-tratamento-de-falhas)
17. [Dashboards e Indicadores](#17-dashboards-e-indicadores)
18. [Relatórios](#18-relatórios)
19. [Regras de Negócio](#19-regras-de-negócio)
20. [Critérios de Aceitação](#20-critérios-de-aceitação)

---

## 1. Visão Geral

### 1.1 Papel do GLPI no Ecossistema SGTI

| Aspecto | GLPI | SGTI |
|:-------:|:----:|:----:|
| **Inventário patrimonial oficial** | ✅ Fonte de autoridade | Espelho + complemento de negócio |
| **Gestão de tickets (chamados)** | Legado (mantido em paralelo) | ✅ Sistema principal de ITSM |
| **Dados financeiros dos ativos** | Não | ✅ CAPEX/OPEX, depreciação, CC |
| **Responsável pelo ativo** | Limitado | ✅ Fonte primária |
| **Movimentações de ativo** | Não | ✅ Fonte primária |
| **Planos de ação de incidentes** | Não | ✅ Fluxo completo no SGTI |
| **Gerenciamento de problemas** | Não | ✅ ITIL v4 completo |

### 1.2 Premissas da Integração

1. O GLPI continua operando em paralelo durante a implantação do SGTI.
2. Toda interação nova (novos chamados, requisições) acontece no SGTI.
3. Tickets criados no SGTI são espelhados no GLPI para continuidade operacional.
4. O inventário patrimonial no GLPI é consumido pelo SGTI diariamente.
5. A integração é assíncrona — falhas no GLPI não bloqueiam operações no SGTI.

### 1.3 Versão e API do GLPI

| Atributo | Valor |
|:--------:|-------|
| **Versão GLPI suportada** | 10.x (testado em 10.0.x) |
| **Protocolo da API** | REST JSON (GLPI REST API) |
| **URL base** | `{GLPI_BASE_URL}/apirest.php` |
| **Autenticação** | `App-Token` + `Session-Token` |
| **Formato** | JSON (Accept: application/json) |
| **TLS** | HTTPS obrigatório |

---

## 2. Arquitetura da Integração

### 2.1 Diagrama de Fluxo

```
SGTI (NestJS Backend)
         │
         │  GLPI REST API  (HTTPS)
         │  App-Token + Session-Token
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│                   GLPI REST API LAYER                           │
│                                                                  │
│  GlpiTicketAdapter         GlpiAssetAdapter                     │
│  ────────────────────────  ──────────────────────────────────   │
│  createTicket()            getAssets(filters)                   │
│  updateTicketStatus()      getAsset(id)                         │
│  addComment()              getAssetsByUpdatedSince()            │
│  getTicket(id)             searchAssets(query)                  │
│  getTicketUpdates()                                             │
└────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│                    GLPI DATABASE                                 │
│   glpi_tickets (chamados) · glpi_computers (ativos)             │
│   glpi_monitors · glpi_printers · glpi_peripherals              │
│   glpi_items_tickets (vinculação ativo ↔ ticket)                │
└────────────────────────────────────────────────────────────────┘

FLUXO SGTI → GLPI (Tickets):
  Incidente criado no SGTI
    → GlpiTicketAdapter.createTicket()
    → GLPI retorna glpi_ticket_id
    → ticket.Ticket.glpi_ticket_id = glpi_ticket_id (imutável)

FLUXO GLPI → SGTI (Status de Tickets):
  GlpiStatusSyncJob (a cada 5 min)
    → Consulta GLPI: tickets com glpi_ticket_id da lista de abertos
    → Diferenças de status refletidas como comentários de sistema

FLUXO GLPI → SGTI (Inventário):
  GlpiInventorySyncJob (diário 02h00)
    → Consulta GLPI: ativos com updatedSince = last_sync
    → Cria/atualiza asset.GlpiAssetReference no SGTI
```

### 2.2 Componentes da Integração

| Componente | Responsabilidade |
|:----------:|:----------------:|
| **GlpiTicketAdapter** | Encapsula operações de ticket no GLPI (criar, atualizar, adicionar comentário, buscar) |
| **GlpiAssetAdapter** | Encapsula consultas de inventário no GLPI (buscar, listar, filtrar por tipo) |
| **GlpiSessionManager** | Gerencia ciclo de vida do `Session-Token` (iniciar sessão, renovar, encerrar) |
| **GlpiStatusSyncJob** | Job periódico (5 min) que verifica atualizações de status em tickets abertos |
| **GlpiInventorySyncJob** | Job diário (02h00) que importa/atualiza inventário de ativos |
| **GlpiCircuitBreaker** | Circuit breaker dedicado para isolar falhas do GLPI do SGTI |
| **GlpiDivergenceDetector** | Compara dados GLPI vs. SGTI e registra divergências |

---

## 3. Objetivos da Integração

### 3.1 Objetivos Estratégicos

| Objetivo | Descrição |
|:--------:|-----------|
| **Continuidade operacional** | Técnicos que ainda usam o GLPI visualizam os tickets criados no SGTI |
| **Inventário centralizado** | SGTI tem visão completa do inventário oficial vindo do GLPI |
| **Migração gradual** | Permite transição suave do GLPI para o SGTI sem big bang |
| **Rastreabilidade** | Histórico de chamados legados preservado via glpi_ticket_id |

### 3.2 Objetivos Operacionais

| # | Objetivo | Indicador | Meta |
|---|----------|-----------|:----:|
| 1 | Tickets espelhados no GLPI | % incidentes criados no SGTI com glpi_ticket_id preenchido | ≥ 99% |
| 2 | Status sync tempestiva | Latência máxima entre status no GLPI e reflexo no SGTI | ≤ 5 min |
| 3 | Inventário atualizado | Defasagem máxima da sync de ativos | ≤ 24h |
| 4 | Falhas do GLPI não bloqueiam SGTI | Incidentes criados sem espera do GLPI | 100% |
| 5 | Divergências detectadas | % divergências registradas automaticamente | 100% |
| 6 | Disponibilidade da integração | Uptime do canal SGTI ↔ GLPI | ≥ 99% |

---

## 4. Sincronização de Tickets

### 4.1 Direção e Tipo de Sincronização

| Direção | Escopo | Gatilho | Job |
|:-------:|--------|:-------:|:---:|
| **SGTI → GLPI** | Novo incidente criado | Evento `IncidentCreated` | Síncrono (ao criar) |
| **GLPI → SGTI** | Atualizações de status em tickets abertos | Periódico | `GlpiStatusSyncJob` (5 min) |
| **SGTI → GLPI** | Encerramento de incidente | Evento `IncidentResolved` | Síncrono (ao resolver) |
| **SGTI → GLPI** | Novos comentários | Evento `TicketCommentAdded` (tipo PUBLIC) | Assíncrono (fila) |

### 4.2 Criação de Ticket no GLPI ao Criar Incidente no SGTI

```
FLUXO DE CRIAÇÃO DO TICKET GLPI

1. Evento IncidentCreated publicado no EventBus
2. GlpiIntegrationHandler recebe o evento
3. GlpiSessionManager.getSession() → Session-Token ativo

4. GlpiTicketAdapter.createTicket({
     name: incidente.title,
     content: incidente.description,
     priority: mapeamento_prioridade(incidente.priority),
     status: 1  (Novo),
     itilcategories_id: mapeamento_categoria(incidente.category),
     users_id_recipient: mapeamento_usuario(incidente.requester_id)
   })

5. GLPI retorna: { id: 12345, ... }

6. SUCESSO:
   ticket.Ticket.glpi_ticket_id = 12345
   audit_log: action=GLPI_TICKET_CREATED, glpi_ticket_id=12345

7. FALHA:
   Incidente criado normalmente no SGTI sem glpi_ticket_id
   Operação enfileirada para retry (backoff exponencial)
   IT_MANAGER NÃO notificado (falha silenciosa; retry automático)
   Se 5 retries falharem: IT_MANAGER notificado
```

**Princípio-chave:** A criação do ticket no GLPI **nunca bloqueia** a criação do incidente no SGTI. O usuário tem resposta imediata independente do estado do GLPI.

**Referência:** BR-GLP-001, BR-GLP-003

### 4.3 Sincronização de Status (GLPI → SGTI)

```
GlpiStatusSyncJob — execução a cada 5 minutos

1. Busca lista de incidentes ABERTOS com glpi_ticket_id preenchido
   (status IN SUBMITTED, ASSIGNED, IN_PROGRESS, PENDING)

2. Para cada grupo de até 100 tickets:
   GET /apirest.php/Ticket?searchText[id]=12345,12346,...
     &range=0-99&forcedisplay[1]=2[status],...

3. Para cada ticket retornado:
   Compara glpi.status com mapeamento → sgti.status

   Se GLPI fechou o ticket (status=6) E sgti.status ≠ RESOLVED:
     → Adiciona TicketComment (type=INTERNAL, source=GLPI_SYNC):
       "Ticket encerrado no GLPI pelo técnico {nome}."
     → NÃO altera o status do SGTI automaticamente
       (encerramento no SGTI requer confirmação do usuário via portal)
     → IT_MANAGER notificado para revisão

   Se GLPI adicionou solução (followup):
     → Importa como TicketComment (type=INTERNAL, source=GLPI_SYNC)

4. SyncExecution registrada em audit_log
```

**Referência:** BR-GLP-004, BR-GLP-007

### 4.4 Encerramento de Incidente — SGTI → GLPI

```
Evento IncidentResolved publicado no EventBus

GlpiTicketAdapter.updateTicketStatus({
  ticket_id: glpi_ticket_id,
  status: 5,  (Solucionado no GLPI)
  solution: incidente.resolution_notes
})

Se glpi_ticket_id não existe (sync pendente):
  → Operação enfileirada para quando o ticket for criado no GLPI
```

### 4.5 Comentários SGTI → GLPI

Comentários **públicos** adicionados ao incidente no SGTI são propagados ao GLPI:

```
Evento TicketCommentAdded (type=PUBLIC) publicado

GlpiTicketAdapter.addFollowup({
  ticket_id: glpi_ticket_id,
  content: comment.content,
  is_private: 0  (público)
  users_id: mapeamento_usuario(comment.author_id)
})
```

Comentários **internos** (type=INTERNAL) **não** são propagados ao GLPI.

---

## 5. Sincronização de Inventário de Ativos

### 5.1 Tipos de Ativo Importados do GLPI

| Tipo GLPI | Endpoint GLPI | Categoria SGTI | Prioridade |
|:---------:|:-------------:|:--------------:|:----------:|
| `Computer` | `/Computer` | Notebook / Desktop / Workstation | Alta |
| `Monitor` | `/Monitor` | Monitor | Alta |
| `Printer` | `/Printer` | Impressora | Alta |
| `Peripheral` | `/Peripheral` | Periférico | Média |
| `NetworkEquipment` | `/NetworkEquipment` | Switch / Roteador / AP | Alta |
| `Phone` | `/Phone` | Celular Corporativo | Média |
| `SoftwareLicense` | `/SoftwareLicense` | Licença de Software | Média |

### 5.2 Fluxo de Sincronização do Inventário

```
GlpiInventorySyncJob — execução diária 02h00

SYNC INCREMENTAL (padrão):
  Para cada tipo de ativo:
    GET /apirest.php/{ItemType}
      ?last_update={last_successful_sync_at}
      &is_deleted=0
      &range=0-999

  Para cada ativo retornado:
    Busca GlpiAssetReference WHERE glpi_id = ativo.id

    ├── NÃO ENCONTRADO (ativo novo no GLPI):
    │   Cria asset.Asset com dados do GLPI
    │   Cria asset.GlpiAssetReference vinculando
    │   audit_log: action=GLPI_ASSET_CREATED
    │
    └── ENCONTRADO (ativo existente):
        Para cada campo na lista de campos sincronizados:
          SE valor GLPI ≠ valor SGTI:
            Atualiza SGTI com valor GLPI
            audit_log: action=GLPI_ASSET_FIELD_UPDATED

SYNC COMPLETA (domingos 03h00):
  Busca TODOS os ativos do GLPI (sem filtro de data)
  Compara com todos os asset.GlpiAssetReference no SGTI
  Detecta e registra divergências bidirecionais
```

### 5.3 Vinculação de Ativo ao Incidente via GLPI

Ao vincular ativo a incidente no SGTI, a vinculação é propagada ao GLPI:

```
GlpiTicketAdapter.addItem({
  ticket_id: glpi_ticket_id,
  itemtype: mapeamento_tipo(ativo.category),  // "Computer", "Monitor"...
  items_id: ativo.glpi_id
})
```

---

## 6. Mapeamento de Campos — Tickets

### 6.1 Criação de Ticket (SGTI → GLPI)

| Campo SGTI | Campo GLPI | Mapeamento |
|:----------:|:----------:|:----------:|
| `incident.title` | `name` | Direto (máx. 255 chars) |
| `incident.description` | `content` | HTML convertido de Markdown |
| `incident.priority` | `priority` | Tabela 6.2 |
| `incident.category` | `itilcategories_id` | Tabela de categorias configurável |
| `incident.requester_id` → email | `users_id_recipient` | Busca por e-mail no GLPI |
| `incident.assignee_id` → email | `users_id_assign` | Busca por e-mail no GLPI |
| `incident.created_at` | `date` | ISO 8601 |
| — | `entities_id` | 0 (entidade raiz, configurável) |
| — | `type` | 1 (Incidente) |

### 6.2 Mapeamento de Prioridade

| SGTI Priority | GLPI Priority | Descrição |
|:-------------:|:-------------:|-----------|
| `CRITICAL` | 6 | Muito Alta |
| `HIGH` | 4 | Alta |
| `MEDIUM` | 3 | Média |
| `LOW` | 2 | Baixa |

### 6.3 Mapeamento de Status

| GLPI Status | Código | Status SGTI correspondente | Ação no SGTI |
|:-----------:|:------:|:--------------------------|:------------:|
| Novo | 1 | SUBMITTED | — (informativo) |
| Em Processamento (Atribuído) | 2 | ASSIGNED | Comentário de sistema |
| Em Processamento (Planejado) | 3 | IN_PROGRESS | Comentário de sistema |
| Em Espera | 4 | PENDING | Comentário de sistema |
| Solucionado | 5 | — | Notificação ao técnico SGTI |
| Fechado | 6 | — | Notificação + revisão manual |

**Nota:** Status do SGTI **não é alterado automaticamente** pela sync do GLPI. Atualizações do GLPI chegam como comentários internos para o técnico revisar.

---

## 7. Mapeamento de Campos — Ativos

### 7.1 Campos Sincronizados do GLPI para o SGTI

| Campo GLPI | Campo SGTI | Escopo | Prioridade |
|:----------:|:----------:|:------:|:----------:|
| `id` | `glpi_id` (em GlpiAssetReference) | Imutável | GLPI |
| `name` | `asset.name` | Identificação | GLPI |
| `serial` | `asset.serial_number` | Identificação | GLPI |
| `otherserial` | `asset.asset_tag` | Patrimonial | GLPI |
| `manufacturers_id` → nome | `asset.manufacturer` | Identificação | GLPI |
| `computermodels_id` → nome | `asset.model` | Identificação | GLPI |
| `states_id` → nome | `asset.glpi_status_name` | Informativo | GLPI |
| `entities_id` → nome | `asset.glpi_entity` | Informativo | GLPI |
| `locations_id` → nome | `asset.location` | Localização | GLPI |
| `is_deleted` | — (exclui da sync se true) | Controle | GLPI |
| `date_mod` | `GlpiAssetReference.last_synced_at` | Controle | GLPI |
| `date_creation` | `asset.created_at` (apenas na criação) | Histórico | GLPI |

### 7.2 Campos GLPI específicos por Tipo de Ativo

**Computer (Notebook/Desktop):**

| Campo GLPI | Campo SGTI (custom_fields JSONB) |
|:----------:|:--------------------------------:|
| `processors` (via API) | `cpu` (modelo + velocidade) |
| `memories` (via API) | `ram_gb` |
| `items_disks` (via API) | `storage` (tipo + capacidade) |
| `operatingsystems_id` | `operating_system` |
| `os_versions_id` | `os_version` |
| `computertypes_id` | Determina subcategoria (Notebook/Desktop) |

**NetworkEquipment (Switch/Firewall/AP):**

| Campo GLPI | Campo SGTI (custom_fields JSONB) |
|:----------:|:--------------------------------:|
| `networktypes_id` | `network_type` |
| `networkportethernets` | `ports` (contagem via sub-request) |

---

## 8. Campos Exclusivos do SGTI

Os campos a seguir são gerenciados **exclusivamente pelo SGTI** e nunca são sobrescritos pela sincronização com o GLPI:

| Campo | Schema | Descrição | Por que é SGTI-exclusivo |
|:-----:|:------:|-----------|:-------------------------:|
| `assignee_id` | asset.Asset | Responsável atual pelo ativo | GLPI não tem o conceito de "responsável individual" com o mesmo nível de gestão |
| `cost_center_id` | asset.Asset | Centro de custo | Gestão financeira exclusiva do SGTI |
| `purchase_value` | asset.Asset | Valor de aquisição | Controle CAPEX do SGTI |
| `current_value` | asset.Asset | Valor atual (após depreciação) | Calculado pelo DepreciationJob do SGTI |
| `classification` | asset.Asset | OPEX ou CAPEX | Controle financeiro exclusivo |
| `project_id` | asset.Asset | Projeto ao qual está vinculado | Módulo de Projetos do SGTI |
| `AssetAssignment` | asset.AssetAssignment | Histórico de atribuições | Controle de entrega/devolução do SGTI |
| `AssetMovement` | asset.AssetMovement | Histórico de movimentações | Rastreabilidade de movimentação do SGTI |
| `warranty_start/end` | asset.Asset | Dados de garantia | Alertas do módulo ITAM do SGTI |
| `contract_id` | asset.Asset | Contrato de suporte | Módulo Financeiro do SGTI |

---

## 9. Tratamento de Inconsistências

### 9.1 Cenários de Inconsistência e Tratamento

| Cenário | Detecção | Ação |
|:-------:|:--------:|:----:|
| Ativo no GLPI, ausente no SGTI | GlpiInventorySyncJob (sync completa) | Criado automaticamente no SGTI com `sync_status = SYNCED` |
| Ativo no SGTI com `glpi_id`, ausente no GLPI | GlpiInventorySyncJob (sync completa) | `sync_status = CONFLICT`; IT_MANAGER notificado |
| Campo divergente (ex.: nome diferente) | GlpiInventorySyncJob | GLPI prevalece para campos sincronizados; atualização registrada em audit_log |
| Ticket GLPI sem correspondência no SGTI | GlpiStatusSyncJob | Ignorado (BR-GLP-002); registrado como `GLPI_ORPHAN_TICKET` |
| glpi_ticket_id inválido (ticket deletado no GLPI) | GlpiStatusSyncJob | `glpi_ticket_id` marcado como inválido; IT_MANAGER notificado |
| Ativo com `is_deleted = true` no GLPI | GlpiInventorySyncJob | Asset no SGTI tem `glpi_deleted = true`; não exclui o asset |
| Número de série divergente | GlpiInventorySyncJob | GLPI prevalece; divergência registrada; alerta ao Gestor de Patrimônio |
| Tipo de ativo incompatível (mapeamento ausente) | GlpiInventorySyncJob | Ativo criado com categoria `GENERAL`; alerta ao SUPER_ADMIN para configurar mapeamento |

### 9.2 Registro de Divergências

```
GlpiAssetDivergence (tabela de divergências)
  id                  UUID
  asset_id            UUID (FK → asset.Asset)
  glpi_id             INT  (ID no GLPI)
  field               VARCHAR  (campo com divergência)
  sgti_value          TEXT     (valor atual no SGTI)
  glpi_value          TEXT     (valor retornado pelo GLPI)
  detected_at         TIMESTAMPTZ
  resolution          ENUM     GLPI_WINS / SGTI_WINS / PENDING / IGNORED
  resolved_by         UUID (FK → auth.User)
  resolved_at         TIMESTAMPTZ
  notes               TEXT
```

IT_MANAGER pode visualizar e resolver divergências pelo painel de administração.

---

## 10. Autenticação com o GLPI

### 10.1 Mecanismo de Autenticação

O GLPI REST API usa um esquema de autenticação em duas camadas:

```
CAMADA 1 — App-Token (permanente)
  Identifica a aplicação que está chamando a API.
  Criado em: GLPI → Configuração → Geral → API
  Armazenamento: Vercel Secret (GLPI_APP_TOKEN)
  Header: App-Token: {token}
  Rotação: Anual

CAMADA 2 — Session-Token (temporário)
  Identifica a sessão da aplicação (equivale a um login).
  Obtido via: GET /apirest.php/initSession
    Headers: App-Token + Authorization: Basic {base64(user:pass)}
    ou Authorization: user_token {token_do_usuario_tecnico}
  Validade: Configurável no GLPI (padrão: 1 hora de inatividade)
  Armazenamento: Memória da aplicação (Redis)

FLUXO DE SESSÃO:
  1. GlpiSessionManager.initSession()
     → GET /initSession com App-Token + credenciais
     → Retorna session_token
     → Armazenado em Redis com TTL de 50 minutos

  2. Todas as requisições incluem:
     App-Token: {app_token}
     Session-Token: {session_token}

  3. GlpiSessionManager.keepalive() (a cada 45 minutos)
     → GET /getGlpiConfig (requisição leve para manter sessão ativa)

  4. Ao detectar 401 (sessão expirada):
     → initSession() automaticamente
     → Retry da operação original
```

### 10.2 Credenciais da Conta de Serviço GLPI

| Atributo | Valor / Armazenamento |
|:--------:|:--------------------:|
| Tipo de conta | Usuário técnico dedicado (`sgti-integration`) |
| Permissões no GLPI | Leitura de ativos; criação, atualização e leitura de tickets |
| Armazenamento da senha | Vercel Secret (`GLPI_SERVICE_ACCOUNT_PASSWORD`) |
| Rotação | Anual (coordenada entre IT_MANAGER e administrador do GLPI) |
| App-Token | Vercel Secret (`GLPI_APP_TOKEN`) |
| URL da API | Vercel Env (`GLPI_API_URL`) |

---

## 11. Jobs de Sincronização

### 11.1 Tabela Completa de Jobs

| Job | Frequência | Direção | Escopo | SLA |
|:---:|:----------:|:-------:|:------:|:---:|
| **GlpiTicketCreateJob** | Imediato (evento) | SGTI → GLPI | Ticket novo | < 10s |
| **GlpiTicketUpdateJob** | Assíncrono (fila) | SGTI → GLPI | Comentários e atualizações | < 2 min |
| **GlpiStatusSyncJob** | A cada 5 min | GLPI → SGTI | Status de tickets abertos | ≤ 5 min |
| **GlpiInventorySyncJob** | Diário 02h00 | GLPI → SGTI | Inventário incremental | < 30 min |
| **GlpiInventoryFullSyncJob** | Semanal dom 03h00 | GLPI → SGTI | Inventário completo | < 2h |
| **GlpiDivergenceDetectorJob** | Semanal dom 04h00 | GLPI ↔ SGTI | Todos os ativos vinculados | < 1h |
| **GlpiSessionKeepaliveJob** | A cada 45 min | SGTI → GLPI | Sessão | Instantâneo |

### 11.2 GlpiStatusSyncJob — Detalhamento

```
GlpiStatusSyncJob (5 minutos)

OBJETIVO: Detectar atualizações de status, soluções e comentários
          em tickets GLPI que correspondem a incidentes abertos no SGTI.

PASSOS:
1. Busca incidentes no SGTI com:
   glpi_ticket_id IS NOT NULL
   AND status IN (SUBMITTED, ASSIGNED, IN_PROGRESS, PENDING, PENDING_USER)

2. Agrupa em lotes de 100 tickets

3. Para cada lote, consulta o GLPI:
   GET /Ticket?searchText[id]=id1,id2,...
     &forcedisplay[1]=2  ← status
     &forcedisplay[2]=4  ← users_id_assign
     &forcedisplay[3]=11 ← ITILFollowups (comentários)

4. Detecta e processa mudanças:
   a. Mudança de status
   b. Mudança de técnico atribuído
   c. Novos followups (comentários)
   d. Solução registrada (solution)

5. Atualiza SGTI e registra em audit_log

6. Registra SyncExecution com métricas
```

### 11.3 GlpiInventorySyncJob — Detalhamento

```
GlpiInventorySyncJob (diário 02h00)

CONFIGURAÇÃO:
  Tipos processados: Computer, Monitor, Printer, Peripheral,
                     NetworkEquipment, Phone, SoftwareLicense
  Batch size: 500 ativos por requisição
  last_sync_at: armazenado em tabela de controle

PASSOS:
1. Para cada tipo de ativo:
   GET /{ItemType}
     ?last_update={last_sync_at}
     &is_deleted=0
     &range=0-499
     &expand_dropdowns=1  ← Expandir IDs para nomes

2. Para equipamentos complexos (Computer), buscar specs adicionais:
   GET /Computer/{id}/Processor
   GET /Computer/{id}/Memory
   GET /Computer/{id}/Item_Disk

3. Processar cada ativo (criar ou atualizar no SGTI)

4. Atualizar last_sync_at = NOW() ao concluir com sucesso

CONTROLES:
  → Timeout por requisição: 10 segundos
  → Máximo de 50 batch requests por execução
  → Se ultrapassar: job continua no próximo dia do ponto de parada
  → Progresso persistido em tabela de controle para retomada
```

---

## 12. Sincronização Sob Demanda

### 12.1 Tipos de Sync Manual

IT_MANAGER+ pode disparar sincronização manual via interface:

| Tipo | Escopo | Quando Usar |
|:----:|:------:|:------------|
| **Sync de Ticket Específico** | Um glpi_ticket_id | Divergência detectada em incidente específico |
| **Sync de Ativo Específico** | Um glpi_id | Divergência detectada em ativo específico |
| **Sync Completa de Ativos** | Todo inventário | Pós-migração ou reestruturação no GLPI |
| **Sync de Ativos por Tipo** | Ex.: apenas Computers | Atualização massiva de um tipo específico |
| **Re-enfileirar Ticket com Falha** | Tickets com glpi_ticket_id nulo | Criação pendente após falhas de retry |

### 12.2 Modal de Busca Direta no GLPI

Durante o atendimento de incidente, o técnico pode buscar ativos diretamente no GLPI:

```
Modal "Buscar Ativo no GLPI"
  Campos de busca: nome, serial, etiqueta, tipo, localização, usuário responsável
  
  Resultado:
    Lista com dados do GLPI + status de sincronização com SGTI
    Badge: "Sincronizado" | "Não importado" | "Divergência detectada"
  
  Ações disponíveis:
    [Importar para SGTI] → cria/atualiza asset.Asset e vincula ao incidente
    [Vincular ao chamado] → vincula ativo já existente no SGTI ao incidente
```

---

## 13. Segurança

### 13.1 TLS Obrigatório

Todas as chamadas ao GLPI são feitas exclusivamente via HTTPS. O certificado TLS do servidor GLPI é validado. Conexões com certificado inválido ou auto-assinado são rejeitadas.

### 13.2 Credenciais na Vercel Secrets

| Variável | Tipo | Descrição |
|:--------:|:----:|-----------|
| `GLPI_API_URL` | Env | URL base da API REST do GLPI |
| `GLPI_APP_TOKEN` | Secret | App-Token permanente |
| `GLPI_SERVICE_ACCOUNT_LOGIN` | Secret | Login da conta de serviço |
| `GLPI_SERVICE_ACCOUNT_PASSWORD` | Secret | Senha da conta de serviço |

Nenhuma credencial é commitada no repositório GitHub ou exposta em logs.

### 13.3 Conta de Serviço com Permissões Mínimas

A conta `sgti-integration` no GLPI tem apenas as permissões necessárias:

| Recurso GLPI | Leitura | Escrita | Deleção |
|:------------:|:-------:|:-------:|:-------:|
| Tickets | ✅ | ✅ (criar, atualizar) | ❌ |
| Followups (comentários) | ✅ | ✅ (criar) | ❌ |
| Computers / Monitor / Printer | ✅ | ❌ | ❌ |
| NetworkEquipment / Peripheral | ✅ | ❌ | ❌ |
| SoftwareLicense | ✅ | ❌ | ❌ |
| Configurações do GLPI | ❌ | ❌ | ❌ |

### 13.4 Session-Token em Redis

O `session_token` do GLPI é armazenado em Redis com TTL de 50 minutos (margem de 10 minutos antes da expiração padrão de 1 hora). Acesso ao Redis protegido por senha.

---

## 14. Auditoria e Rastreabilidade

### 14.1 Eventos Auditados

| Evento | `action` | Dados Capturados |
|--------|:--------:|:----------------:|
| Ticket criado no GLPI | `GLPI_TICKET_CREATED` | `incident_id`, `glpi_ticket_id`, duração |
| Ticket atualizado no GLPI | `GLPI_TICKET_UPDATED` | `glpi_ticket_id`, campo atualizado |
| Comentário adicionado no GLPI | `GLPI_FOLLOWUP_CREATED` | `glpi_ticket_id`, `comment_id` |
| Status GLPI diferente detectado | `GLPI_STATUS_DIFF_DETECTED` | `glpi_ticket_id`, status_glpi, status_sgti |
| Ativo importado do GLPI (novo) | `GLPI_ASSET_CREATED` | `asset_id`, `glpi_id`, tipo |
| Ativo atualizado pelo GLPI | `GLPI_ASSET_UPDATED` | `asset_id`, `glpi_id`, campo, old, new |
| Divergência detectada | `GLPI_DIVERGENCE_DETECTED` | `glpi_id`, campo, valor_glpi, valor_sgti |
| Divergência resolvida | `GLPI_DIVERGENCE_RESOLVED` | resolução, resolvido_por |
| Sync executada | `GLPI_SYNC_EXECUTED` | job, duração, contagens |
| Sync falhou | `GLPI_SYNC_FAILED` | job, erro, tentativa |
| Circuit breaker aberto | `GLPI_CIRCUIT_BREAKER_OPEN` | timestamp, última_falha |
| Circuit breaker fechado | `GLPI_CIRCUIT_BREAKER_CLOSED` | timestamp, duração_aberto |
| Sessão GLPI iniciada | `GLPI_SESSION_STARTED` | timestamp |
| Sessão GLPI encerrada/expirada | `GLPI_SESSION_ENDED` | motivo (normal/expirada) |

### 14.2 Rastreabilidade Ticket SGTI ↔ GLPI

```
TRILHA COMPLETA — INCIDENTE COM INTEGRAÇÃO GLPI

1. ticket.Ticket criado (SGTI):
   id=uuid, number="INC-2026-000042", glpi_ticket_id=NULL

2. GLPI_TICKET_CREATED (audit_log):
   glpi_ticket_id=12345 preenchido em ticket.Ticket

3. GlpiStatusSyncJob (5 min depois):
   GLPI ticket 12345 status=2 (Em Processamento)
   → TicketComment adicionado: "GLPI: Ticket em processamento (status atualizado)"
   → GLPI_STATUS_DIFF_DETECTED registrado

4. Técnico resolve no SGTI:
   IncidentResolved event → GlpiTicketAdapter.updateTicketStatus(12345, 5)
   → GLPI_TICKET_UPDATED registrado
```

---

## 15. Logs

### 15.1 Estrutura do Log da Integração GLPI

```json
{
  "timestamp": "2026-06-09T02:01:22.456Z",
  "level": "info",
  "service": "sgti-backend",
  "module": "GlpiIntegrationModule",
  "job": "GlpiInventorySyncJob",
  "action": "glpi.asset.created",
  "glpi_id": 547,
  "asset_id": "uuid-do-asset-sgti",
  "glpi_type": "Computer",
  "sgti_category": "Notebook",
  "duration_ms": 89,
  "correlation_id": "uuid-da-execução-do-job"
}
```

### 15.2 Níveis de Log

| Nível | Situações |
|:-----:|-----------|
| `INFO` | Ticket criado no GLPI; ativo importado; sync concluída com sucesso |
| `WARN` | Ticket GLPI sem correspondência no SGTI; tipo de ativo sem mapeamento; session_token próximo de expirar |
| `ERROR` | Timeout ao chamar GLPI; falha de autenticação; circuit breaker aberto |
| `DEBUG` | Payload JSON completo de requisições GLPI (apenas non-prod) |

### 15.3 Retenção de Logs

| Tipo | Retenção |
|:----:|:--------:|
| Logs de aplicação (Vercel) | 30 dias |
| audit_log (shared.audit_log) | Indefinida |
| GlpiAssetDivergence | 1 ano |
| GlpiAssetReference.glpi_data_snapshot | 90 dias |
| SyncExecution records | 1 ano |

---

## 16. Tratamento de Falhas

### 16.1 Falhas de Criação de Ticket no GLPI

```
RETRY PARA CRIAÇÃO DE TICKET GLPI

Ticket não criado no GLPI (qualquer falha):
  → Incidente salvo no SGTI normalmente
  → Operação adicionada à fila de retry

Fila de retry:
  Tentativa 1: 30 segundos após a falha
  Tentativa 2: 2 minutos
  Tentativa 3: 8 minutos
  Tentativa 4: 30 minutos
  Tentativa 5: 2 horas
  → Após 5 falhas: IT_MANAGER notificado
     "Ticket INC-2026-000042 não foi sincronizado com o GLPI.
      Verifique a disponibilidade do GLPI ou crie manualmente."
```

### 16.2 Circuit Breaker para o GLPI

```
CIRCUIT BREAKER — GLPI

CLOSED (normal):
  Chamadas executam normalmente
  Contador de falhas monitorado
  threshold: 5 falhas consecutivas → OPEN

OPEN (degradado — 15 minutos):
  → Chamadas bloqueadas (fail-fast com ServiceUnavailableException)
  → Jobs GlpiStatusSyncJob e GlpiInventorySyncJob SUSPENSOS
  → Todas as operações de integração enfileiradas na DLQ
  → SGTI continua funcionando normalmente (incidentes criados sem espelhar)
  → IT_MANAGER notificado imediatamente

HALF-OPEN (após 15 min):
  → 1 requisição de teste: GET /apirest.php/getAPINamespaces
  → Sucesso → CLOSED; jobs retomados; DLQ processada
  → Falha → OPEN por mais 15 min; IT_MANAGER notificado novamente
```

**Referência:** BR-GLP-006

### 16.3 Timeout por Tipo de Operação

| Operação | Timeout | Retry |
|:--------:|:-------:|:-----:|
| Iniciar sessão (`initSession`) | 5s | 3x imediato |
| Criar ticket | 5s | Backoff exponencial |
| Atualizar ticket | 5s | Backoff exponencial |
| Buscar ticket | 5s | Backoff exponencial |
| Buscar ativos (batch) | 10s | 3x com backoff |
| Buscar specs de ativo | 5s por ativo | 2x, falha graciosa |

### 16.4 Falha na Sync de Inventário

Se a sync de inventário excede o tempo limite ou falha parcialmente:

- O progresso é persistido na tabela de controle (`last_processed_glpi_id` por tipo).
- Na próxima execução, a sync retoma do ponto de parada.
- Falhas em ativos individuais não bloqueiam o processamento dos demais.
- Relatório de erros gerado ao final da execução.

### 16.5 DLQ — Dead Letter Queue para GLPI

Operações que esgotaram todos os retries:

- Armazenadas em `shared.dead_letter_queue` com payload completo.
- IT_MANAGER notificado imediatamente.
- Podem ser reprocessadas manualmente pelo IT_MANAGER após resolução do problema.
- Retenção: 7 dias.

---

## 17. Dashboards e Indicadores

### 17.1 Painel da Integração GLPI

**Destino:** IT_MANAGER, SUPER_ADMIN.

| Componente | Dados Exibidos |
|------------|:-------------:|
| **Status da Integração** | Conectado / Degradado / Offline (baseado no circuit breaker) |
| **Última Sync de Tickets** | Timestamp + duração + tickets processados |
| **Última Sync de Inventário** | Timestamp + duração + ativos criados/atualizados |
| **Tickets Sem glpi_ticket_id** | COUNT de incidentes abertos sem espelho no GLPI |
| **Divergências Pendentes** | COUNT(GlpiAssetDivergence WHERE resolution=PENDING) |
| **Ativos Sem Correspondência** | Ativos SGTI com `glpi_id` nulo (não importados do GLPI) |
| **DLQ Pendente** | Operações com falha aguardando reprocessamento |
| **Circuit Breaker** | Estado atual + tempo aberto se OPEN |

### 17.2 Indicadores de Integração

| KPI | Fórmula | Meta |
|-----|---------|:----:|
| **Taxa de Tickets Espelhados** | COUNT(glpi_ticket_id IS NOT NULL) / COUNT(abertos) × 100 | ≥ 99% |
| **Latência da Sync de Status** | AVG(detected_at − ticket_updated_at no GLPI) | ≤ 5 min |
| **Taxa de Sync Bem-Sucedida** | Syncs OK / Total syncs × 100 | ≥ 99% |
| **Divergências Pendentes** | COUNT(resolution=PENDING) | ≤ 10 |
| **DLQ Acumulada** | COUNT(dead_letter_queue WHERE source=GLPI) | 0 |

---

## 18. Relatórios

### 18.1 Relatórios Operacionais Automáticos

| Relatório | Geração | Destinatário | Conteúdo |
|-----------|:-------:|:------------:|---------|
| **Status Diário da Integração GLPI** | Diária (07h) | IT_MANAGER | Syncs executadas, falhas, DLQ, tickets sem espelho |
| **Divergências de Inventário** | Semanal (seg) | IT_MANAGER | Divergências pendentes de resolução |
| **Ativos Sem Correspondência** | Semanal | Gestor de Patrimônio | Ativos SGTI sem glpi_id |

### 18.2 Relatórios Gerenciais

| Relatório | Frequência | Destinatário | Conteúdo |
|-----------|:----------:|:------------:|---------|
| **Performance da Integração** | Mensal | IT_MANAGER | Latências, taxas de sucesso, anomalias |
| **Reconciliação de Inventário** | Mensal | IT_MANAGER + Patrimônio | GLPI vs. SGTI: ativos em comum, exclusivos de cada sistema |

---

## 19. Regras de Negócio

As regras a seguir complementam as regras BR-GLP-001 a BR-GLP-007 já definidas em `Docs/24_BUSINESS_RULES.md`.

---

**GLP-001** — Todo incidente criado no SGTI gera ticket correspondente no GLPI
Ao criar incidente no SGTI, ticket espelho é criado automaticamente no GLPI via `GlpiTicketAdapter`. O `glpi_ticket_id` é armazenado no incidente e nunca alterado após atribuído.
**Referência:** BR-GLP-001

---

**GLP-002** — Ticket criado no GLPI não cria incidente automaticamente no SGTI
A sincronização GLPI → SGTI é apenas para atualização de status de tickets criados pelo SGTI. Tickets legados do GLPI não geram incidentes automaticamente no SGTI.
**Referência:** BR-GLP-002

---

**GLP-003** — Falha no GLPI não bloqueia criação de incidente no SGTI
O incidente é criado imediatamente no SGTI independente da disponibilidade do GLPI. A criação no GLPI é assíncrona com retry automático.
**Referência:** BR-GLP-003

---

**GLP-004** — Status do GLPI sincronizado a cada 5 minutos
O `GlpiStatusSyncJob` verifica atualizações de status em tickets abertos a cada 5 minutos. Mudanças chegam ao SGTI como comentários internos.
**Referência:** BR-GLP-004

---

**GLP-005** — Inventário do GLPI sincronizado diariamente às 02h00
O `GlpiInventorySyncJob` importa ativos do GLPI diariamente. Sync completa executada nos domingos às 03h00.
**Referência:** BR-GLP-005

---

**GLP-006** — Circuit breaker após 5 falhas consecutivas
Integração com o GLPI usa circuit breaker com 5 falhas → aberto por 15 min → half-open → fechado. IT_MANAGER notificado ao abrir.
**Referência:** BR-GLP-006

---

**GLP-007** — Comentários do GLPI importados como comentários internos no SGTI
Followups de técnicos no ticket GLPI são importados como `TicketComment` com `type=INTERNAL` e `source=GLPI_SYNC`.
**Referência:** BR-GLP-007

---

**GLP-008** — glpi_ticket_id imutável após ser preenchido
O campo `glpi_ticket_id` no incidente é imutável após o primeiro preenchimento. Tentativa de alteração retorna 422.

---

**GLP-009** — GLPI é fonte de autoridade para campos de identificação de ativos
Para campos sincronizados (nome, serial, modelo, fabricante, localização), o GLPI prevalece em caso de conflito. Campos de negócio (responsável, CC, financeiro) são exclusivos do SGTI.

---

**GLP-010** — Campos SGTI-exclusivos jamais sobrescritos pela sync do GLPI
`assignee_id`, `cost_center_id`, `purchase_value`, `current_value`, `classification`, `project_id` e históricos de atribuição/movimentação nunca são atualizados pela sincronização com o GLPI.

---

**GLP-011** — Credenciais do GLPI armazenadas exclusivamente como Vercel Secrets
`GLPI_APP_TOKEN` e `GLPI_SERVICE_ACCOUNT_PASSWORD` são Vercel Secrets. Nenhuma credencial aparece em logs, código-fonte ou variáveis de ambiente de ambientes não-prod.

---

**GLP-012** — Conta de serviço GLPI com permissões mínimas
A conta `sgti-integration` tem apenas permissão de leitura de ativos e criação/atualização de tickets. Nenhuma permissão de exclusão ou acesso a configurações do GLPI.

---

**GLP-013** — Session-Token armazenado em Redis com TTL de 50 minutos
Para evitar chamadas desnecessárias de `initSession`, o session_token é reutilizado enquanto válido (TTL 50 min para margem de segurança antes da expiração de 1h).

---

**GLP-014** — 401 no GLPI dispara renovação automática de sessão
Ao receber 401 (session expired) em qualquer chamada ao GLPI, o `GlpiSessionManager` reinicia automaticamente a sessão e retenta a operação original.

---

**GLP-015** — Ativo deletado no GLPI marcado no SGTI sem excluir
Ativo com `is_deleted=true` no GLPI não é excluído no SGTI. O flag `glpi_deleted=true` é registrado e o ativo permanece no inventário SGTI para rastreabilidade histórica.

---

**GLP-016** — Tipo de ativo sem mapeamento cria ativo na categoria GENERAL
Tipo de ativo retornado pelo GLPI sem configuração de mapeamento para categoria SGTI cria o ativo na categoria GENERAL. Alerta ao SUPER_ADMIN para configurar o mapeamento.

---

**GLP-017** — Divergência detectada registrada sem sobrescrever automaticamente
Divergências entre GLPI e SGTI (campos que divergem além dos esperados) são registradas em `GlpiAssetDivergence` para resolução manual. IT_MANAGER notificado.

---

**GLP-018** — Sync incompleta retomada pelo ponto de parada
Se a sync de inventário for interrompida (timeout, crash), o progresso é persistido. A próxima execução retoma do último ativo processado.

---

**GLP-019** — Timeout de 10 segundos para busca de ativos em lote
Requisições de inventário ao GLPI têm timeout de 10 segundos. Ultrapassado: retry com backoff; job continua com o próximo lote.

---

**GLP-020** — Falha em ativo individual não bloqueia a sync do lote
Erros ao processar um ativo específico (campo inválido, tipo não reconhecido) são registrados e o processamento continua para os demais ativos do lote.

---

**GLP-021** — DLQ notifica IT_MANAGER imediatamente
Qualquer operação que esgotar retries e for movida para a Dead Letter Queue notifica o IT_MANAGER imediatamente via alerta in-app e e-mail urgente.

---

**GLP-022** — Ticket sem espelho no GLPI listado no dashboard
Incidentes ativos sem `glpi_ticket_id` (falha de criação pendente) são listados no dashboard da integração para acompanhamento do IT_MANAGER.

---

**GLP-023** — Comentários internos não são propagados ao GLPI
Apenas comentários com `type=PUBLIC` no SGTI são propagados como followups ao GLPI. Comentários `INTERNAL` ficam exclusivamente no SGTI.

---

**GLP-024** — Encerramento no GLPI não encerra automaticamente no SGTI
Se técnico encerrar ticket no GLPI, o SGTI detecta a mudança de status e notifica o técnico SGTI para revisar e encerrar pelo portal SGTI (com confirmação do usuário).

---

**GLP-025** — Sync completa semanal gera relatório de reconciliação
A `GlpiInventoryFullSyncJob` (domingos 03h00) gera relatório de reconciliação comparando todo o inventário GLPI vs. SGTI, enviado ao IT_MANAGER e Gestor de Patrimônio.

---

**GLP-026** — Busca direta no GLPI disponível durante atendimento de incidente
O técnico pode buscar ativos diretamente no GLPI via modal integrado no SGTI, sem precisar abrir o GLPI separadamente.

---

**GLP-027** — glpi_data_snapshot preservado por 90 dias
O campo `GlpiAssetReference.glpi_data_snapshot` armazena o último payload completo retornado pelo GLPI, preservado por 90 dias para diagnóstico e auditoria.

---

**GLP-028** — Sync de status não cria TicketComment duplicado
Antes de criar TicketComment de sync, o sistema verifica se já existe comentário do mesmo glpi_ticket_id e timestamp. Duplicatas são ignoradas.

---

**GLP-029** — Histórico de SyncExecution preservado por 1 ano
Cada execução de job de sync registrada em audit_log é preservada por 1 ano para análise de tendências e resolução de disputas sobre estado histórico do inventário.

---

**GLP-030** — Relatório diário de integração enviado automaticamente às 07h00
Relatório com status da integração nas últimas 24h (syncs executadas, tickets sem espelho, divergências, DLQ) enviado automaticamente ao IT_MANAGER.

---

**GLP-031** — Mapeamento de usuário SGTI para GLPI por e-mail
Ao criar ticket no GLPI, o `users_id_recipient` é resolvido buscando o e-mail do solicitante SGTI no diretório de usuários do GLPI. Se não encontrado: ticket criado sem `users_id_recipient`.

---

**GLP-032** — Ativo GLPI vinculado a incidente SGTI refletido no GLPI
Ao vincular ativo a incidente no SGTI, a vinculação `items_tickets` é criada no GLPI via `GlpiTicketAdapter.addItem()`.

---

**GLP-033** — Sync com GLPI não afeta outras operações do SGTI
Jobs de sync do GLPI executam em pool de threads separado, sem bloquear a thread principal do NestJS. Lentidão na sync não afeta o tempo de resposta da API do SGTI.

---

**GLP-034** — Registro de divergência incluído no pacote de evidências de compliance
Divergências entre GLPI e SGTI detectadas na sync semanal são incluídas automaticamente no relatório de auditoria patrimonial do módulo de Compliance.

---

**GLP-035** — App-Token e credenciais rotacionados anualmente
`GLPI_APP_TOKEN` e senha da conta de serviço são rotacionados anualmente. A troca é coordenada entre o administrador do GLPI e o IT_MANAGER do SGTI para evitar interrupções.

---

## 20. Critérios de Aceitação

### 20.1 Criação e Atualização de Tickets

- [ ] **CA-01:** Incidente criado no SGTI espelhado no GLPI em até 10 segundos (quando GLPI disponível).
- [ ] **CA-02:** Falha no GLPI não bloqueia criação do incidente no SGTI.
- [ ] **CA-03:** `glpi_ticket_id` preenchido após criação bem-sucedida e imutável após isso.
- [ ] **CA-04:** Comentário público no SGTI propagado ao GLPI como followup.
- [ ] **CA-05:** Comentário interno no SGTI NÃO é propagado ao GLPI.
- [ ] **CA-06:** Encerramento no SGTI atualiza status do ticket GLPI para Solucionado (status=5).

### 20.2 Sincronização de Status

- [ ] **CA-07:** `GlpiStatusSyncJob` executa a cada 5 minutos sem intervenção manual.
- [ ] **CA-08:** Atualização de status no GLPI aparece como comentário interno no SGTI em até 5 minutos.
- [ ] **CA-09:** Ticket fechado no GLPI notifica técnico SGTI sem fechar automaticamente o chamado.
- [ ] **CA-10:** Comentário duplicado de sync não é criado (idempotência verificada).

### 20.3 Sincronização de Inventário

- [ ] **CA-11:** `GlpiInventorySyncJob` executa diariamente às 02h00.
- [ ] **CA-12:** Ativo novo no GLPI criado automaticamente no SGTI na próxima sync.
- [ ] **CA-13:** Campos SGTI-exclusivos não são sobrescritos pela sync do GLPI.
- [ ] **CA-14:** Ativo deletado no GLPI recebe flag `glpi_deleted=true` sem ser excluído.
- [ ] **CA-15:** Sync interrompida retoma do ponto de parada na próxima execução.

### 20.4 Inconsistências e Divergências

- [ ] **CA-16:** Divergência detectada registrada em `GlpiAssetDivergence` com valores GLPI e SGTI.
- [ ] **CA-17:** IT_MANAGER notificado sobre divergências pendentes de resolução.
- [ ] **CA-18:** Modal de busca direta no GLPI retorna resultados corretos e permite importação.

### 20.5 Segurança e Autenticação

- [ ] **CA-19:** 401 do GLPI dispara renovação automática de sessão e retry transparente.
- [ ] **CA-20:** Nenhuma credencial GLPI visível em logs de aplicação.
- [ ] **CA-21:** Conta de serviço GLPI não tem permissão de deleção ou configuração.

### 20.6 Tratamento de Falhas

- [ ] **CA-22:** Circuit breaker abre após 5 falhas consecutivas; IT_MANAGER notificado.
- [ ] **CA-23:** Circuit breaker fecha após 15 minutos se GLPI recuperar.
- [ ] **CA-24:** Retry com backoff correto (30s, 2min, 8min, 30min, 2h).
- [ ] **CA-25:** DLQ notifica IT_MANAGER imediatamente; operações reprocessáveis via interface.
- [ ] **CA-26:** Falha em ativo individual não interrompe sync do lote.

### 20.7 Dashboards e Relatórios

- [ ] **CA-27:** Dashboard exibe contagem de tickets sem espelho no GLPI.
- [ ] **CA-28:** Status do circuit breaker exibido em tempo real no dashboard.
- [ ] **CA-29:** Relatório diário enviado automaticamente às 07h00.
- [ ] **CA-30:** Relatório de reconciliação semanal gerado após sync completa dominical.

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação com 20 seções, 35 regras GLP e 30 critérios de aceitação |

---

> **Próximos documentos recomendados:**
> [`50_INTEGRATIONS.md`](./50_INTEGRATIONS.md) — Arquitetura geral de integrações e padrões
> [`43_ASSET_MANAGEMENT.md`](./43_ASSET_MANAGEMENT.md) — Módulo de Gestão de Ativos
> [`40_INCIDENT_MANAGEMENT.md`](./40_INCIDENT_MANAGEMENT.md) — Módulo de Incidentes
