# SGTI — Sistema de Gestão de Tecnologia da Informação
## Integração de E-mail Corporativo — Documentação Funcional e Técnica

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Conta de E-mail:** `implantacao@pinpag.com.br`
> **Documentos Relacionados:** [50_INTEGRATIONS.md](./50_INTEGRATIONS.md) · [40_INCIDENT_MANAGEMENT.md](./40_INCIDENT_MANAGEMENT.md) · [41_REQUEST_MANAGEMENT.md](./41_REQUEST_MANAGEMENT.md) · [20_DATABASE.md](./20_DATABASE.md)

---

## Sobre este Documento

Este documento define a **especificação funcional e técnica da integração de e-mail corporativo do SGTI**, cobrindo criação automática de chamados, tratamento de threads, processamento de anexos, segurança, auditoria, tratamento de falhas e dashboards.

**Escopo exclusivo:** documentação funcional e técnica. Nenhum código ou SQL é gerado neste documento.

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura da Integração](#2-arquitetura-da-integração)
3. [Protocolos — IMAP e SMTP](#3-protocolos--imap-e-smtp)
4. [Criação Automática de Chamados](#4-criação-automática-de-chamados)
5. [Atualização de Chamados via Thread](#5-atualização-de-chamados-via-thread)
6. [Tratamento do Assunto](#6-tratamento-do-assunto)
7. [Tratamento de Anexos](#7-tratamento-de-anexos)
8. [Limites de Tamanho e Volume](#8-limites-de-tamanho-e-volume)
9. [Segurança — SPF, DKIM e DMARC](#9-segurança--spf-dkim-e-dmarc)
10. [Anti-Spam](#10-anti-spam)
11. [Notificações](#11-notificações)
12. [SLA e E-mail](#12-sla-e-e-mail)
13. [Auditoria e Rastreabilidade](#13-auditoria-e-rastreabilidade)
14. [Logs](#14-logs)
15. [Tratamento de Falhas](#15-tratamento-de-falhas)
16. [Dashboards e Indicadores](#16-dashboards-e-indicadores)
17. [Relatórios](#17-relatórios)
18. [Regras de Negócio](#18-regras-de-negócio)
19. [Critérios de Aceitação](#19-critérios-de-aceitação)

---

## 1. Visão Geral

### 1.1 Objetivo da Integração

A integração de e-mail do SGTI transforma a caixa de entrada corporativa `implantacao@pinpag.com.br` em um **canal formal de abertura e atualização de chamados**, garantindo que toda comunicação chegue via e-mail seja rastreada, processada e respondida dentro dos prazos de SLA.

Isso permite que colaboradores que não acessam o portal web do SGTI ainda possam:
- Abrir chamados enviando e-mail diretamente.
- Receber atualizações de status por e-mail.
- Responder ao e-mail para adicionar comentários ao chamado.
- Confirmar resolução respondendo ao e-mail de encerramento.

### 1.2 Canal de E-mail do SGTI

| Atributo | Valor |
|:--------:|-------|
| **Conta** | `implantacao@pinpag.com.br` |
| **Plataforma** | Google Workspace |
| **Uso para envio** | SMTP autenticado do Google |
| **Uso para recebimento** | Gmail API (Pub/Sub push) + IMAP como fallback |
| **Volume estimado** | Até 500 e-mails/dia (pico); ~100 e-mails/dia (médio) |
| **SLA de processamento** | < 2 minutos entre recebimento e criação do chamado |

### 1.3 Tipos de E-mail Processados

| Tipo | Origem | Ação |
|:----:|--------|------|
| **Novo chamado** | E-mail sem referência a thread existente | Cria novo Ticket com `origem = EMAIL` |
| **Atualização de chamado** | Resposta a e-mail de notificação SGTI | Adiciona comentário ao ticket existente |
| **Confirmação de resolução** | Usuário responde com "confirmo" ou clica no link | Fecha o ticket |
| **Reabertura** | Usuário responde informando que problema persiste | Reabre o ticket |
| **Bounce / NDR** | Falha de entrega de notificação | Registrada como falha; IT_MANAGER notificado |
| **Spam / Indesejado** | E-mail fora das regras de aceitação | Ignorado + registrado como `IGNORED` |

---

## 2. Arquitetura da Integração

### 2.1 Fluxo Completo de Processamento

```
E-MAIL RECEBIDO EM implantacao@pinpag.com.br
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│               GMAIL (Google Workspace)                           │
│  Pub/Sub Notification → SGTI Backend webhook                    │
│  Fallback: IMAP polling a cada 2 minutos                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Notificação de novo e-mail
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              EMAIL PROCESSING JOB (NestJS)                       │
│                                                                   │
│  ETAPA 1 — BUSCA DO PAYLOAD                                      │
│  Busca conteúdo completo do e-mail via Gmail API                 │
│                                                                   │
│  ETAPA 2 — VALIDAÇÃO DE SEGURANÇA                                │
│  Verifica SPF, DKIM, DMARC                                       │
│  Aplica regras anti-spam                                         │
│  Valida tamanho total e tipos de anexo                           │
│                                                                   │
│  ETAPA 3 — IDENTIFICAÇÃO DE THREAD                               │
│  Verifica Message-ID, In-Reply-To, References                    │
│  Extrai número de chamado do assunto [INC/REQ-YYYY-NNNNNN]      │
│  Busca thread no email_log pelo external_thread_id              │
│                                                                   │
│  ETAPA 4 — DECISÃO DE ROTEAMENTO                                 │
│  ┌── Thread ENCONTRADA → ATUALIZAR chamado existente            │
│  └── Thread NÃO ENCONTRADA → CRIAR novo chamado                 │
│                                                                   │
│  ETAPA 5 — PROCESSAMENTO DE ANEXOS                               │
│  Upload para Supabase Storage bucket "attachments"               │
│  Geração de referência FileReference                             │
│                                                                   │
│  ETAPA 6 — PERSISTÊNCIA                                          │
│  Salva EmailThread + EmailMessage no email_log                   │
│  Cria/atualiza Ticket no módulo correspondente                   │
│  Registra em audit_log                                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┴──────────────────────┐
         │                                        │
         ▼                                        ▼
┌──────────────────────┐               ┌──────────────────────────┐
│   NOVO CHAMADO       │               │  CHAMADO ATUALIZADO       │
│   Ticket criado com  │               │  Comentário adicionado    │
│   origem=EMAIL       │               │  fonte=EMAIL              │
│   SLA iniciado       │               │  Remetente notificado     │
│   Notificação ao     │               │  da atualização           │
│   solicitante        │               └──────────────────────────┘
└──────────────────────┘
```

### 2.2 Componentes da Integração

| Componente | Tecnologia | Responsabilidade |
|:----------:|:----------:|:----------------:|
| **EmailProcessingJob** | NestJS (Scheduled Task) | Orquestra o processamento dos e-mails recebidos |
| **GmailPubSubHandler** | NestJS Controller | Recebe notificações push do Gmail via Pub/Sub |
| **ImapFallbackPoller** | NestJS Cron (2 min) | Backup IMAP para quando Pub/Sub falha |
| **EmailParser** | Domain Service | Extrai estrutura, headers, corpo e anexos |
| **ThreadResolver** | Domain Service | Identifica se e-mail é novo ou parte de thread |
| **TicketEmailCreator** | Application Use Case | Cria ticket a partir de e-mail novo |
| **TicketEmailUpdater** | Application Use Case | Adiciona comentário a ticket existente |
| **EmailNotifier** | Infrastructure | Envia notificações de volta ao remetente |
| **EmailAuditLogger** | Infrastructure | Registra eventos em email_log e audit_log |

### 2.3 Modelo de Dados de E-mail

```
EMAIL_LOG SCHEMA

EmailThread (thread de e-mail vinculada ao ticket)
  id                UUID         Identificador único
  tenant_id         UUID         Tenant do ticket
  ticket_id         UUID         Ticket vinculado (incident ou request)
  ticket_type       ENUM         INCIDENT ou REQUEST
  external_thread_id VARCHAR(500) Message-ID do primeiro e-mail (thread root)
  gmail_thread_id   VARCHAR(100) ID da thread no Gmail
  subject           TEXT         Assunto original do primeiro e-mail
  from_email        VARCHAR(255) E-mail do solicitante
  from_name         VARCHAR(300) Nome do remetente
  status            ENUM         ACTIVE, CLOSED
  created_at        TIMESTAMPTZ
  updated_at        TIMESTAMPTZ

EmailMessage (mensagem individual da thread)
  id                UUID
  thread_id         UUID         FK → EmailThread
  external_message_id VARCHAR(500) Message-ID desta mensagem
  in_reply_to       VARCHAR(500) Header In-Reply-To
  references_ids    TEXT[]       Array de Message-IDs do header References
  direction         ENUM         INBOUND (recebido) ou OUTBOUND (enviado)
  from_email        VARCHAR(255)
  to_emails         TEXT[]
  cc_emails         TEXT[]
  subject           TEXT
  body_html         TEXT         Corpo em HTML
  body_text         TEXT         Corpo em texto plano
  raw_headers       JSONB        Headers completos para diagnóstico
  processing_status ENUM         PENDING, PROCESSING, PROCESSED, IGNORED, FAILED
  processing_notes  TEXT         Detalhes do processamento ou erro
  attachments       JSONB        Metadados dos anexos [{name, size, type, storage_path}]
  received_at       TIMESTAMPTZ  Quando chegou no Gmail
  processed_at      TIMESTAMPTZ  Quando foi processado pelo SGTI
```

---

## 3. Protocolos — IMAP e SMTP

### 3.1 Gmail API como Canal Principal (Pub/Sub)

O SGTI usa a **Gmail API com Pub/Sub push notifications** como método primário de recebimento, pois é mais eficiente que polling IMAP:

```
FLUXO GMAIL API + PUB/SUB

1. SGTI registra "watch" na caixa implantacao@pinpag.com.br
   → Gmail API: users.watch({ userId: "me", topicName: "projects/.../topics/sgti-gmail" })
   → Renovação automática a cada 7 dias (watch expira em 7 dias)

2. Gmail recebe novo e-mail
   → Publica mensagem no Pub/Sub topic configurado

3. Google Cloud Pub/Sub entrega para endpoint SGTI:
   POST https://sgti.empresa.com.br/api/v1/email/gmail-webhook
   Body: { message: { data: base64({historyId, emailAddress}) } }

4. SGTI valida assinatura JWT do Google Pub/Sub
5. SGTI busca conteúdo completo via Gmail API:
   → users.messages.get({id: messageId, format: "full"})
6. Processa o e-mail (fluxo da seção 2.1)
```

### 3.2 IMAP como Fallback

Em caso de falha do Pub/Sub ou do webhook, o `ImapFallbackPoller` realiza polling IMAP a cada 2 minutos:

| Configuração IMAP | Valor |
|:-----------------:|-------|
| **Servidor** | `imap.gmail.com` |
| **Porta** | 993 (SSL/TLS) |
| **Autenticação** | OAuth 2.0 com Service Account (sem senha) |
| **Pasta monitorada** | `INBOX` |
| **Intervalo de polling** | 2 minutos |
| **Filtro** | E-mails com flag `\Unseen` (não lidos) |
| **Ação pós-processamento** | Marca como lido + adiciona label `sgti-processed` |

**Detecção de duplicata:** Antes de processar e-mail via IMAP, o sistema verifica se o `external_message_id` já existe em `EmailMessage`. Se sim, ignora (processado pelo Pub/Sub).

### 3.3 SMTP para Envio

Todas as notificações de saída são enviadas via SMTP do Google Workspace:

| Configuração SMTP | Valor |
|:-----------------:|-------|
| **Servidor** | `smtp.gmail.com` |
| **Porta** | 587 (STARTTLS) |
| **Autenticação** | OAuth 2.0 com conta de serviço |
| **From** | `implantacao@pinpag.com.br` |
| **Reply-To** | `implantacao@pinpag.com.br` |
| **Timeout por operação** | 15 segundos |
| **Retry** | 3 tentativas (30s, 2min, 10min) |
| **Rate limit** | 500 e-mails/dia (limite Google Workspace) |

---

## 4. Criação Automática de Chamados

### 4.1 Regra Fundamental

> **Todo e-mail novo recebido em `implantacao@pinpag.com.br` que não pertença a uma thread existente gera automaticamente uma Requisição de Serviço** (tipo `REQUEST`, origem `EMAIL`).

### 4.2 Tipo de Chamado Criado

O chamado criado por e-mail é sempre uma **Requisição** com as seguintes características:

| Campo do Chamado | Valor Definido |
|:----------------:|:--------------|
| **Tipo** | `REQUEST` (Requisição de Serviço) |
| **Origem** | `EMAIL` |
| **Título** | Assunto do e-mail (limitado a 500 chars; se vazio: "Solicitação via e-mail") |
| **Descrição** | Corpo do e-mail em texto plano (HTML convertido para texto) |
| **Solicitante** | Identificado pelo e-mail do remetente → busca em `auth.User.email` |
| **Serviço** | Serviço padrão configurado para origem EMAIL (`catalog_id` configurável) |
| **Prioridade** | `MEDIUM` (padrão para origem EMAIL) |
| **Status** | `SUBMITTED` (iniciado com SLA) |
| **Anexos** | Extraídos do e-mail e vinculados ao chamado |

### 4.3 Resolução do Solicitante

```
LÓGICA DE IDENTIFICAÇÃO DO SOLICITANTE

mail_from = e-mail do campo "From" do e-mail recebido

Cenário 1 — E-mail interno (domínio corporativo):
  Busca em auth.User.email WHERE email = mail_from AND status = ACTIVE
  → Encontrado: solicitante = usuário encontrado
  → Não encontrado: cria usuário "fantasma" com status PENDING_PROVISIONING
    solicitante = usuário fantasma
    IT_MANAGER notificado: "Chamado recebido de e-mail corporativo não cadastrado"

Cenário 2 — E-mail externo (domínio fora do corporativo):
  Busca em external_contacts (tabela de contatos externos)
  → Encontrado: solicitante = contato externo
  → Não encontrado: chamado criado com remetente registrado apenas no EmailThread
    solicitante_externo = mail_from (armazenado em request.external_requester_email)
    Badge "Externo" exibido no chamado
```

### 4.4 Serviço Padrão para E-mails

Um serviço do catálogo é configurado como padrão para e-mails:
- Nome sugerido: "Suporte Geral — Canal E-mail".
- SLA padrão para este serviço: 4 horas para primeiro atendimento.
- Grupo responsável: Service Desk (N1).
- Configurável pelo SUPER_ADMIN sem necessidade de código.

### 4.5 Exemplo de Chamado Criado por E-mail

```
E-mail Recebido:
  From: joao.silva@empresa.com.br
  Subject: VPN não conecta desde ontem
  Body: Bom dia, minha VPN parou de funcionar ontem às 15h.
        Já reiniciei o computador mas não resolve.
        Mensagem de erro: "Authentication failed".
        Preciso de ajuda urgente.

Chamado Criado:
  Número: REQ-2026-000087
  Título: VPN não conecta desde ontem
  Origem: EMAIL
  Solicitante: João Silva <joao.silva@empresa.com.br>
  Descrição: "Bom dia, minha VPN parou de funcionar ontem às 15h..."
  Serviço: Suporte Geral — Canal E-mail
  Prioridade: MEDIUM
  Status: SUBMITTED
  SLA Resposta: 15/06/2026 às 10:00

Resposta automática enviada ao remetente:
  Subject: [REQ-2026-000087] VPN não conecta desde ontem
  Body: "Seu chamado foi registrado com o número REQ-2026-000087.
        Prazo de atendimento: 15/06/2026 às 10:00.
        Para acompanhar ou adicionar informações, responda este e-mail."
```

---

## 5. Atualização de Chamados via Thread

### 5.1 Mecanismo de Identificação de Thread

O SGTI usa **dois mecanismos complementares** para identificar se um e-mail pertence a um chamado existente:

#### Mecanismo 1 — Headers MIME (Primário)

```
HIERARQUIA DE VERIFICAÇÃO DE HEADERS

1. Header "In-Reply-To":
   Contém o Message-ID do e-mail que está sendo respondido.
   Busca em EmailMessage.external_message_id WHERE = in_reply_to_value
   → Encontrado: e-mail pertence à thread do chamado vinculado

2. Header "References":
   Lista todos os Message-IDs anteriores da thread (separados por espaço).
   Para cada ID na lista: busca em EmailMessage.external_message_id
   → Qualquer encontrado: e-mail pertence à thread

3. Gmail Thread-ID (header X-GM-THRID ou via API):
   ID interno do Gmail para a thread.
   Busca em EmailThread.gmail_thread_id
   → Encontrado: e-mail pertence à thread
```

#### Mecanismo 2 — Padrão no Assunto (Fallback)

```
EXTRAÇÃO DO NÚMERO DO CHAMADO DO ASSUNTO

Regex aplicado ao campo Subject:
  /\[(INC|REQ)-\d{4}-\d{6}\]/i

Exemplos:
  "[REQ-2026-000087] VPN não conecta desde ontem" → REQ-2026-000087
  "Re: [INC-2026-000042] Impressora não funciona" → INC-2026-000042
  "Fwd: [REQ-2026-000021] Monitor sem sinal" → REQ-2026-000021

Se número encontrado:
  Busca ticket com esse número em ticket.Ticket
  → Encontrado + ACTIVE: e-mail é atualização desse chamado
  → Não encontrado: trata como novo chamado
```

### 5.2 Decisão Final de Roteamento

```
ÁRVORE DE DECISÃO — NOVO CHAMADO OU ATUALIZAÇÃO?

1. Verificar headers In-Reply-To / References
   → Thread encontrada? SIM → ATUALIZAÇÃO → ir para etapa 3
                         NÃO → ir para etapa 2

2. Verificar padrão [INC/REQ-YYYY-NNNNNN] no assunto
   → Número encontrado E chamado ativo? SIM → ATUALIZAÇÃO → ir para etapa 3
                                         NÃO → NOVO CHAMADO → criar ticket

3. ATUALIZAÇÃO: adicionar comentário ao chamado existente
   → Tipo comentário: PUBLIC (visível ao solicitante)
   → Fonte: EMAIL
   → Conteúdo: corpo do e-mail em texto plano
   → Anexos: vinculados ao chamado
   → Notificação ao técnico atribuído (in-app)
```

### 5.3 Conteúdo do Comentário Criado

Ao atualizar um chamado via e-mail, o comentário criado contém:

| Campo | Conteúdo |
|:-----:|---------|
| **Tipo** | `PUBLIC` (visível ao solicitante) |
| **Fonte** | `EMAIL` |
| **Autor** | Usuário identificado pelo e-mail do remetente |
| **Conteúdo** | Corpo do e-mail com formatação preservada |
| **Anexos** | Lista de anexos extraídos e armazenados |
| **Cabeçalho** | "Recebido por e-mail em {data_hora} de {from_email}" |

### 5.4 Chamado CLOSED: Comentário Não Adicionado

E-mail recebido referenciando chamado com status `CLOSED`:

```
Chamado CLOSED detectado como destino:
  → Comentário NÃO é adicionado
  → E-mail registrado como EmailMessage com processing_status = IGNORED
  → Remetente recebe e-mail automático:
    "Seu chamado REQ-2026-000087 foi encerrado.
     Se o problema persistir, abra um novo chamado respondendo
     este e-mail com 'Reabrir' no início da mensagem."

Exceção — Reabertura:
  Se corpo do e-mail começa com "Reabrir" (case-insensitive):
    → Chamado reaberto com justificativa = corpo do e-mail
    → Comentário adicionado
    → Fluxo normal de reabertura
```

---

## 6. Tratamento do Assunto

### 6.1 Regras de Padronização do Assunto

| Situação | Tratamento |
|:--------:|-----------|
| Assunto presente e dentro do limite | Usado como título do chamado (máx. 500 chars) |
| Assunto muito longo (> 500 chars) | Truncado em 497 chars + "..." |
| Assunto vazio | Título padrão: "Solicitação via e-mail de {from_name}" |
| Assunto com prefixo "Re:" | Removido para identificação do título original |
| Assunto com prefixo "Fwd:" | Removido; flag `is_forwarded = true` no EmailMessage |
| Assunto com número de chamado | Usado para correlação (ver seção 5.2) |
| Assunto com apenas espaços | Tratado como vazio |
| Caracteres especiais | Sanitizados (HTML entities convertidas) |

### 6.2 Geração do Assunto nas Notificações de Saída

Todos os e-mails enviados pelo SGTI seguem o padrão:

```
[{número_do_chamado}] {título_do_chamado}

Exemplos:
  [REQ-2026-000087] VPN não conecta desde ontem
  [INC-2026-000042] Impressora do 3º andar não imprime
  [REQ-2026-000021] Solicitação de Notebook — João Silva
```

Este padrão garante que:
1. O assunto é inconfundível e permite identificação imediata.
2. Respostas mantêm o assunto com o número, facilitando a correlação.
3. E-mails encaminhados ("Fwd:") preservam o número para correlação.

---

## 7. Tratamento de Anexos

### 7.1 Tipos de Arquivo Aceitos

| Tipo | Extensões | Tamanho Máximo Individual |
|:----:|:---------:|:-------------------------:|
| **PDF** | `.pdf` | 50 MB |
| **Word** | `.docx`, `.doc` | 50 MB |
| **Excel** | `.xlsx`, `.xls` | 50 MB |
| **Imagem** | `.png`, `.jpg`, `.jpeg` | 20 MB |
| **Arquivo compactado** | `.zip` | 100 MB |
| **Texto / Log** | `.txt`, `.log`, `.csv` | 20 MB |

### 7.2 Tipos de Arquivo Rejeitados

Arquivos com extensão ou MIME type associado a executáveis e scripts são rejeitados e **não armazenados**:

| Tipo | Extensões | Motivo |
|:----:|:---------:|:------:|
| Executável | `.exe`, `.msi`, `.bat`, `.cmd`, `.ps1`, `.sh` | Risco de segurança |
| Script | `.js`, `.vbs`, `.wsf`, `.jar` | Risco de segurança |
| Arquivo compactado com executável interno | `.zip` com `.exe` dentro | Verificação básica de conteúdo |
| Imagem de disco | `.iso`, `.img` | Volume excessivo + risco |
| Outros não listados acima | Qualquer extensão não na lista aceita | Não reconhecido = rejeitado |

### 7.3 Fluxo de Processamento de Anexo

```
PARA CADA ANEXO DO E-MAIL RECEBIDO

1. Extração do payload base64 via Gmail API
2. Detecção do MIME type real (não confiar apenas na extensão)
3. Verificação de extensão e MIME type na lista de aceitos
   → Rejeitado: anexo ignorado + registrado em processing_notes

4. Verificação de tamanho
   → Excede limite: rejeitado + registrado

5. Verificação de antivírus (ClamAV ou equivalente, se configurado)
   → Infectado: rejeitado + alerta de segurança ao IT_MANAGER

6. Upload para Supabase Storage, bucket "attachments":
   Caminho: attachments/{tenant_id}/{ticket_id}/{uuid}_{filename_sanitizado}

7. Criação de FileReference no banco:
   → filename, size, mime_type, storage_path, uploaded_by (sistema), ticket_id

8. Registro no array EmailMessage.attachments:
   { name: "screenshot.png", size: 245678, type: "image/png", file_reference_id: uuid }
```

### 7.4 Notificação sobre Anexos Rejeitados

Se o e-mail continha anexos que foram rejeitados, o remetente é notificado:

```
"Seu chamado foi criado, mas os seguintes anexos não foram aceitos:

  ❌ malware.exe — Tipo de arquivo não permitido
  ❌ planilha_gigante.xlsx — Tamanho excede 50 MB (61 MB)

Os demais anexos foram incluídos normalmente.
Para enviar estes arquivos, compacte em .zip respeitando o limite de 100 MB."
```

---

## 8. Limites de Tamanho e Volume

### 8.1 Limites por E-mail

| Recurso | Limite | Ação se Exceder |
|:-------:|:------:|:---------------:|
| Tamanho total do e-mail | 100 MB | E-mail ignorado; remetente notificado; IT_MANAGER alertado |
| Tamanho do corpo (HTML) | 1 MB | Truncado; nota adicionada: "Conteúdo truncado — enviado original completo em anexo" |
| Tamanho do corpo (texto plano) | 500 KB | Truncado com nota |
| Número de anexos por e-mail | 20 | Excedentes ignorados com notificação ao remetente |
| Tamanho individual de anexo | Conforme seção 7.1 | Anexo rejeitado individualmente |

### 8.2 Limites de Volume (Rate Limiting)

| Limite | Threshold | Ação |
|:------:|:---------:|------|
| E-mails por minuto (mesmo remetente) | 5 | E-mails adicionais com `processing_status = RATE_LIMITED` |
| E-mails por hora (mesmo remetente) | 20 | Idem + alerta ao IT_MANAGER |
| E-mails por dia (caixa total) | 1000 | Alerta ao IT_MANAGER; processamento continua |
| E-mails por dia (mesmo remetente) | 50 | Remetente suspeito de spam; requer análise manual |

### 8.3 Limite de Envio (SMTP Google Workspace)

| Limite | Valor |
|:------:|-------|
| E-mails enviados por dia | 500 (conta gratuita) / 2000 (Google Workspace Business) |
| Destinatários por mensagem | 500 |
| Tamanho máximo de envio | 25 MB |

---

## 9. Segurança — SPF, DKIM e DMARC

### 9.1 SPF — Sender Policy Framework

O SPF verifica se o servidor que enviou o e-mail está autorizado a enviar em nome do domínio do remetente.

**Registro SPF do domínio `pinpag.com.br`:**
```
v=spf1 include:_spf.google.com ~all
```

**Uso no processamento:**

| Resultado SPF | Ação |
|:-------------:|------|
| `PASS` | E-mail aceito normalmente |
| `NEUTRAL` | E-mail aceito com flag de revisão |
| `SOFTFAIL (~all)` | E-mail aceito mas marcado como suspeito; score anti-spam incrementado |
| `FAIL (-all)` | E-mail rejeitado; remetente notificado; registrado como `SPAM_REJECTED` |

### 9.2 DKIM — DomainKeys Identified Mail

O DKIM verifica se o e-mail foi realmente enviado pelo domínio declarado via assinatura criptográfica.

**Para e-mails recebidos:**

| Resultado DKIM | Ação |
|:--------------:|------|
| `PASS` | E-mail aceito normalmente |
| `FAIL` | Score anti-spam incrementado (+2 pontos) |
| `MISSING` | Score anti-spam incrementado (+1 ponto) |

**Para e-mails enviados pelo SGTI:**
O Google Workspace assina automaticamente todos os e-mails enviados de `implantacao@pinpag.com.br` com DKIM. Nenhuma configuração adicional necessária.

### 9.3 DMARC — Domain-based Message Authentication

O DMARC define a política do domínio para lidar com e-mails que falham em SPF e/ou DKIM.

**Registro DMARC sugerido para `pinpag.com.br`:**
```
_dmarc.pinpag.com.br IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@pinpag.com.br; ruf=mailto:dmarc-failures@pinpag.com.br; pct=100; sp=quarantine; adkim=r; aspf=r"
```

| Campo DMARC | Valor | Significado |
|:-----------:|:-----:|-------------|
| `p=quarantine` | Mover para spam | E-mails que falham em SPF e DKIM |
| `rua=` | E-mail para relatórios agregados | Receber relatórios diários de DMARC |
| `pct=100` | 100% das mensagens | Aplicar política a todos os e-mails |

**Uso no processamento SGTI:**

| Resultado DMARC | Ação |
|:---------------:|------|
| `PASS` | E-mail aceito normalmente |
| `FAIL (p=quarantine)` | Marcado como suspeito; IT_MANAGER notificado; não cria chamado automaticamente |
| `FAIL (p=reject)` | E-mail rejeitado; nenhum chamado criado; registrado |

---

## 10. Anti-Spam

### 10.1 Sistema de Score Anti-Spam

O processador de e-mails calcula um **score de spam** para cada e-mail recebido:

| Critério | Pontos |
|:--------:|:------:|
| DKIM ausente | +1 |
| DKIM falhou | +2 |
| SPF SOFTFAIL | +1 |
| SPF FAIL | +3 |
| DMARC FAIL | +2 |
| Remetente em lista negra | +5 |
| E-mail apenas em HTML sem texto plano | +1 |
| Assunto com > 3 letras maiúsculas consecutivas | +1 |
| Assunto com termos suspeitos (lista configurável) | +2 |
| Corpo com > 5 links externos | +1 |
| Corpo vazio ou < 10 caracteres úteis | +1 |
| Enviado por Gmail com domínio externo sem SPF | +1 |

### 10.2 Thresholds de Ação

| Score | Ação |
|:-----:|------|
| 0–2 | Processar normalmente |
| 3–4 | Processar com flag `suspicious = true`; IT_MANAGER pode revisar |
| 5–6 | Processar como chamado com prioridade LOW; IT_MANAGER notificado |
| ≥ 7 | Rejeitar; `processing_status = SPAM_REJECTED`; remetente NÃO notificado; IT_MANAGER alerta |

### 10.3 Listas de Remetentes

| Lista | Função |
|:-----:|--------|
| **Allowlist** | Remetentes que nunca têm score calculado; processados diretamente (ex.: sistemas internos) |
| **Blocklist** | Remetentes que sempre são rejeitados; `processing_status = BLOCKED` |
| **Graylist** | Remetentes de primeiro contato que aguardam análise (apenas se habilitado) |

Gerenciadas pelo IT_MANAGER via interface de administração.

### 10.4 Proteção contra Loop de E-mail

Loop de e-mail (quando resposta automática gera nova resposta automática) é prevenido por:

1. Verificação do header `X-Auto-Submitted` → se presente e ≠ `no`, e-mail é ignorado.
2. Verificação de `Auto-Submitted`, `Auto-Reply`, `Precedence: bulk/list/junk`.
3. Contador de e-mails de mesmo thread em menos de 1 minuto → suspensão do processamento.

---

## 11. Notificações

### 11.1 Notificação de Abertura de Chamado (SGTI → Remetente)

Enviada imediatamente após a criação do chamado por e-mail:

```
De: implantacao@pinpag.com.br
Para: {from_email}
Message-ID: <REQ-2026-000087.sgti.empresa.com.br>
In-Reply-To: {message_id_do_email_original}
References: {message_id_do_email_original}
Subject: [REQ-2026-000087] VPN não conecta desde ontem

Seu chamado foi registrado com sucesso.

📋 Número: REQ-2026-000087
📌 Título: VPN não conecta desde ontem
⚡ Prioridade: Média
⏱ Prazo de atendimento: 15/06/2026 às 10:00

Para acompanhar o andamento, adicionar informações ou enviar
arquivos, basta responder este e-mail.

Acesse também pelo portal: https://sgti.empresa.com.br/chamados/uuid

Equipe de TI
```

### 11.2 Notificação de Atualização de Status

Enviada a cada mudança relevante de status:

| Evento | Assunto | Conteúdo |
|:------:|:-------:|---------|
| Técnico atribuído | `[REQ-2026-000087] Em atendimento` | Nome do técnico responsável |
| PENDING_USER | `[REQ-2026-000087] Aguardando sua resposta` | Pergunta do técnico + link |
| RESOLVED | `[REQ-2026-000087] Resolvido — Confirme o recebimento` | Solução aplicada + botões de confirmação/reabertura |
| CLOSED (automático) | `[REQ-2026-000087] Encerrado` | Chamado encerrado + CSAT request |
| Novo comentário público | `[REQ-2026-000087] Nova atualização` | Conteúdo do comentário |

### 11.3 E-mail de Resolução com Botões de Ação

O e-mail de resolução inclui dois botões de ação para simplificar a interação:

```
Seu problema foi resolvido pela equipe de TI.

Solução aplicada:
"{solução_documentada_pelo_técnico}"

[✅ Confirmar Resolução]  [⚠️ Problema Persiste]

Se não responder em 72 horas, o chamado será encerrado automaticamente.
```

Os botões são links de ação única com token assinado para prevenir uso indevido.

### 11.4 Notificações ao Técnico Responsável

Quando um usuário responde ao e-mail de notificação, o técnico responsável recebe:

- Notificação in-app: "Novo comentário de {from_name} no chamado REQ-2026-000087".
- Se o chamado estava em `PENDING_USER`: status automaticamente revertido para `IN_PROGRESS`.

---

## 12. SLA e E-mail

### 12.1 Início do SLA por E-mail

O SLA inicia no momento em que o chamado é criado pelo processador de e-mail, **não** no momento em que o e-mail chegou ao servidor.

| Referência de Tempo | Uso |
|:-----------------:|-----|
| `EmailMessage.received_at` | Quando o e-mail chegou no Gmail |
| `Ticket.created_at` | Quando o chamado foi criado (início do SLA) |
| Defasagem esperada | ≤ 2 minutos (SLA de processamento do EmailProcessingJob) |

### 12.2 Pausa de SLA via E-mail

O SLA é pausado automaticamente quando o chamado muda para `PENDING_USER`. O técnico pode fazer isso respondendo ao thread com o comando:

`AGUARDANDO_USUARIO: {motivo da espera}`

O SGTI detecta o comando, muda o status e pausa o SLA.

### 12.3 Retomada de SLA via E-mail

O SLA retoma automaticamente quando:
- Usuário responde ao thread (via e-mail processado pelo SGTI).
- O processador detecta nova mensagem na thread e muda status para `IN_PROGRESS`.

### 12.4 SLA de Processamento de E-mail

Um SLA interno monitora a eficiência do próprio processamento:

| Marco | SLA Interno | Alerta se Exceder |
|:-----:|:-----------:|:-----------------:|
| Recebimento → Processamento | ≤ 2 minutos | IT_MANAGER notificado se média > 5 min em 1h |
| Processamento → Criação de chamado | ≤ 30 segundos | Log de erro gerado |
| Criação de chamado → Notificação ao remetente | ≤ 1 minuto | Log de warning gerado |

---

## 13. Auditoria e Rastreabilidade

### 13.1 Eventos Auditados no email_log

Todo e-mail processado gera registros em `EmailThread` e `EmailMessage` com rastreabilidade completa:

| Campo | Conteúdo |
|-------|---------|
| `received_at` | Timestamp exato de chegada no Gmail |
| `processed_at` | Timestamp de processamento pelo SGTI |
| `processing_status` | PENDING → PROCESSING → PROCESSED / IGNORED / FAILED |
| `processing_notes` | Detalhes do processamento, erros, decisões de roteamento |
| `raw_headers` | Todos os headers MIME completos (para diagnóstico) |
| `attachments` | Metadados de cada anexo processado |

### 13.2 Eventos Auditados no shared.audit_log

| Evento | `action` | Dados Capturados |
|--------|:--------:|:----------------:|
| E-mail recebido | `EMAIL_RECEIVED` | from_email, subject, message_id, received_at |
| Chamado criado por e-mail | `TICKET_CREATED_FROM_EMAIL` | ticket_id, thread_id, from_email |
| Chamado atualizado por e-mail | `TICKET_UPDATED_FROM_EMAIL` | ticket_id, comment_id, thread_id, from_email |
| E-mail ignorado (spam) | `EMAIL_SPAM_REJECTED` | score, motivos, message_id |
| E-mail ignorado (outro) | `EMAIL_IGNORED` | motivo, message_id |
| E-mail falhou no processamento | `EMAIL_PROCESSING_FAILED` | erro, message_id, tentativas |
| Anexo rejeitado | `ATTACHMENT_REJECTED` | motivo (tipo/tamanho/vírus), filename |
| Bounce detectado | `EMAIL_BOUNCE_DETECTED` | destinatário, motivo do bounce |
| Remetente adicionado à blocklist | `EMAIL_SENDER_BLOCKED` | from_email, motivo |

### 13.3 Rastreabilidade Completa do Ciclo

```
TRILHA AUDITÁVEL COMPLETA DE UM CHAMADO VIA E-MAIL

1. email_log.EmailMessage (INBOUND): recebimento registrado
2. shared.audit_log (EMAIL_RECEIVED): e-mail chegou
3. ticket.Ticket: chamado criado com origin=EMAIL
4. shared.audit_log (TICKET_CREATED_FROM_EMAIL): chamado criado
5. email_log.EmailMessage (OUTBOUND): notificação enviada ao remetente
6. ticket.TicketComment: comentário criado (quando usuário responde)
7. email_log.EmailMessage (INBOUND): resposta do usuário registrada
8. shared.audit_log (TICKET_UPDATED_FROM_EMAIL): chamado atualizado
```

---

## 14. Logs

### 14.1 Estrutura do Log de E-mail

Cada operação do `EmailProcessingJob` gera log estruturado em JSON:

```json
{
  "timestamp": "2026-06-09T08:00:01.234Z",
  "level": "info",
  "service": "sgti-backend",
  "module": "EmailModule",
  "action": "email.processed",
  "correlation_id": "uuid-da-operação",
  "message_id": "<abc123@mail.gmail.com>",
  "from_email": "joao.silva@empresa.com.br",
  "subject": "VPN não conecta desde ontem",
  "decision": "CREATE_TICKET",
  "ticket_number": "REQ-2026-000087",
  "duration_ms": 312,
  "attachments_count": 2,
  "attachments_accepted": 2,
  "attachments_rejected": 0,
  "spam_score": 0
}
```

### 14.2 Logs por Nível

| Nível | Situações |
|:-----:|-----------|
| `INFO` | E-mail processado com sucesso; chamado criado; chamado atualizado |
| `WARN` | E-mail ignorado por spam; anexo rejeitado; remetente externo não cadastrado |
| `ERROR` | Falha de processamento; Gmail API indisponível; upload de anexo falhou |
| `DEBUG` | Headers completos do e-mail (apenas em ambiente non-prod) |

### 14.3 Retenção de Logs

| Tipo | Retenção |
|:----:|:--------:|
| Logs de aplicação (EmailProcessingJob) | 30 dias no Vercel |
| email_log (EmailThread + EmailMessage) | 90 dias no Supabase |
| raw_headers de e-mails processados | 30 dias |
| audit_log de eventos de e-mail | Indefinida |
| E-mails originais (no Gmail) | Política de retenção do Google Workspace |

---

## 15. Tratamento de Falhas

### 15.1 Falhas no Processamento de E-mail

| Falha | Causa Provável | Ação |
|:-----:|:-------------:|------|
| Gmail API timeout | Sobrecarga ou instabilidade | Retry após 30s (até 5 tentativas) |
| Upload de anexo falhou | Supabase Storage indisponível | Retry após 1min; chamado criado sem o anexo |
| Banco de dados indisponível | Supabase PostgreSQL down | E-mail em fila em memória; processado quando DB voltar |
| Remetente não resolvido | Usuário não cadastrado | Chamado criado com `requester_email` salvo externamente |
| Corpo do e-mail malformado | E-mail inválido ou corrompido | `processing_status = FAILED`; raw_headers preservados para diagnóstico |
| Quota Gmail API atingida | Rate limit | Fallback para IMAP polling imediato |

### 15.2 Retry por Tipo de Falha

```
ESTRATÉGIA DE RETRY PARA FALHAS DE E-MAIL

Falha transiente (5xx, timeout, quota):
  Tentativas: 1, 2, 3, 4, 5
  Intervalos: 30s, 2min, 8min, 30min, 2h
  → Após 5 falhas: EmailMessage.processing_status = FAILED
  → IT_MANAGER notificado
  → E-mail original preservado para reprocessamento manual

Falha permanente (e-mail corrompido, tipo de arquivo inválido):
  Sem retry
  → processing_status = FAILED imediatamente
  → Log detalhado com causa
  → IT_MANAGER notificado se volumoso (> 3 em 1h)
```

### 15.3 Fila de E-mails com Falha

E-mails que falharam em todos os retries são mantidos em `EmailMessage` com `processing_status = FAILED` e podem ser:

- **Reprocessados manualmente** pelo IT_MANAGER via interface de administração.
- **Descartados** com justificativa documentada.
- **Exportados** para análise técnica.

### 15.4 Pub/Sub Indisponível

Quando o webhook do Gmail Pub/Sub não está recebendo notificações (detectado se o último processamento foi > 5 minutos atrás):

```
HealthMonitorJob detecta:
  last_email_processed_at > 5 minutos atrás
  → Ativa fallback IMAP automático (mesmo se já ativo)
  → IT_MANAGER alertado via in-app: "Gmail Pub/Sub pode estar indisponível"
  → Após 30 minutos sem Pub/Sub: alerta de e-mail urgente ao IT_MANAGER
```

---

## 16. Dashboards e Indicadores

### 16.1 Painel de Monitoramento de E-mail

**Destino:** IT_MANAGER, SUPER_ADMIN.

| Componente | Dados Exibidos |
|------------|---------------|
| **E-mails Recebidos (24h)** | Total de EmailMessages INBOUND nas últimas 24 horas |
| **Chamados Criados por E-mail** | COUNT(tickets com origin=EMAIL) no dia |
| **Chamados Atualizados por E-mail** | COUNT(comments com source=EMAIL) no dia |
| **Taxa de Processamento** | PROCESSED / (PROCESSED + FAILED + IGNORED) × 100 |
| **E-mails com Falha** | Lista de EmailMessages com status FAILED |
| **Spam Rejeitado** | COUNT(SPAM_REJECTED) no dia |
| **Status do Pub/Sub** | Última notificação recebida; latência média |
| **Status do IMAP Fallback** | Ativo ou inativo; último polling |
| **Tempo Médio de Processamento** | AVG(processed_at - received_at) em segundos |
| **Fila Pendente** | E-mails com status PENDING há > 5 minutos |

### 16.2 Indicadores Operacionais

| KPI | Fórmula | Meta |
|-----|---------|:----:|
| **Taxa de Processamento** | PROCESSED / total × 100 | ≥ 99% |
| **Tempo Médio de Processamento** | AVG(processado − recebido) | ≤ 2 minutos |
| **Taxa de Spam** | SPAM_REJECTED / total × 100 | < 5% |
| **E-mails com Falha** | COUNT(FAILED) por dia | ≤ 1% |
| **Disponibilidade do Canal** | Uptime do processamento / total × 100 | ≥ 99,5% |
| **Respostas SLA via E-mail** | Chamados via e-mail dentro do SLA | ≥ 90% |

---

## 17. Relatórios

### 17.1 Relatórios Operacionais Automáticos

| Relatório | Geração | Destinatário | Conteúdo |
|-----------|:-------:|:------------:|---------|
| **E-mails Processados do Dia** | Diária (07h) | IT_MANAGER | Total recebido, criados, atualizados, falhas, spam |
| **E-mails com Falha Pendente** | Diária (07h) | IT_MANAGER | Lista de EmailMessages com FAILED para reprocessamento |
| **Resumo Semanal do Canal E-mail** | Semanal (seg) | IT_MANAGER | Volume, tendência, top remetentes, taxa de sucesso |

### 17.2 Relatórios Gerenciais

| Relatório | Frequência | Destinatário | Conteúdo |
|-----------|:----------:|:------------:|---------|
| **Performance do Canal E-mail** | Mensal | IT_MANAGER | KPIs, tendência, SLA de chamados via e-mail |
| **Análise de Spam e Segurança** | Mensal | IT_MANAGER + Compliance | Remetentes bloqueados, scores altos, padrões |

---

## 18. Regras de Negócio

---

**EML-001** — Todo e-mail novo gera uma Requisição
Todo e-mail recebido em `implantacao@pinpag.com.br` que não pertença a thread existente gera automaticamente uma Requisição (`Request`) com `origin = EMAIL`.

---

**EML-002** — E-mails da mesma thread não geram novo chamado
E-mail identificado como pertencente a thread existente via `In-Reply-To`, `References` ou padrão `[INC/REQ-YYYY-NNNNNN]` no assunto NÃO cria novo chamado. Adiciona comentário `PUBLIC` ao chamado existente.

---

**EML-003** — Anexos aceitos devem ser armazenados
Anexos de tipos aceitos (PDF, DOCX, XLSX, PNG, JPG, ZIP, TXT, LOG, CSV) são obrigatoriamente armazenados no Supabase Storage antes de concluir o processamento do e-mail.

---

**EML-004** — Todo processamento deve ser auditado
Cada e-mail processado gera registro em `email_log.EmailMessage` e evento em `shared.audit_log`. Processamento sem registro de auditoria é considerado falha crítica.

---

**EML-005** — Falhas devem ser registradas com contexto
E-mails que falham no processamento têm `processing_status = FAILED` e `processing_notes` com detalhes do erro. IT_MANAGER notificado via alerta in-app.

---

**EML-006** — SLA inicia no momento da criação do chamado
O SLA do chamado criado por e-mail começa em `Ticket.created_at`, não em `EmailMessage.received_at`. A diferença deve ser ≤ 2 minutos.

---

**EML-007** — Conta de e-mail exclusiva e imutável
A conta `implantacao@pinpag.com.br` é o único endereço de recebimento do SGTI. Não é possível configurar outro endereço de recebimento sem alteração de infraestrutura.

---

**EML-008** — Remetente identificado pelo campo "From"
O remetente do chamado é identificado pelo campo `From` do e-mail. Aliases de e-mail são resolvidos para o usuário principal cadastrado no SGTI.

---

**EML-009** — Domínio corporativo recebe tratamento prioritário
E-mails de remetentes do domínio corporativo configurado são tratados como de maior confiança. SPF/DKIM failures de domínios externos têm peso maior no score de spam.

---

**EML-010** — Assunto como título do chamado
O assunto do e-mail é usado como título do chamado, limitado a 500 caracteres. Assunto vazio resulta em título padrão "Solicitação via e-mail de {nome_remetente}".

---

**EML-011** — Corpo do e-mail como descrição do chamado
O corpo em texto plano (ou HTML convertido para texto) é usado como descrição do chamado. HTML sanitizado antes de armazenar.

---

**EML-012** — Notificação de abertura enviada ao remetente imediatamente
Ao criar o chamado, notificação de confirmação é enviada ao remetente em até 1 minuto, com o número do chamado, prazo de SLA e link para o portal.

---

**EML-013** — Notificação de abertura com In-Reply-To vinculado ao e-mail original
O e-mail de confirmação de abertura inclui `In-Reply-To` e `References` apontando para o e-mail original, garantindo que respostas mantenham o vínculo da thread.

---

**EML-014** — Thread rastreada pelo Message-ID do primeiro e-mail
O `EmailThread.external_thread_id` é o `Message-ID` do primeiro e-mail da thread. Todos os e-mails subsequentes que referenciem esse ID são vinculados à mesma thread.

---

**EML-015** — Padrão [INC/REQ-YYYY-NNNNNN] como fallback de correlação
Quando os headers MIME não são suficientes para correlação, o sistema usa o número do chamado no assunto como fallback, reconhecendo padrões com ou sem prefixo "Re:" ou "Fwd:".

---

**EML-016** — Chamado CLOSED não recebe comentários via e-mail
Respostas a thread de chamado CLOSED são registradas como `IGNORED` no EmailMessage. Remetente notificado sobre o encerramento e opção de reabrir.

---

**EML-017** — Reabertura de chamado via e-mail
E-mail para thread de chamado CLOSED com corpo iniciando em "Reabrir" (case-insensitive) reabre o chamado com a justificativa como comentário inicial.

---

**EML-018** — Anexos de tipos não autorizados rejeitados
Arquivos com extensão ou MIME type não na lista autorizada são rejeitados, não armazenados e o remetente notificado sobre quais arquivos não foram aceitos.

---

**EML-019** — Executáveis sempre rejeitados independente do contexto
Arquivos com extensões `.exe`, `.msi`, `.bat`, `.cmd`, `.ps1`, `.sh`, `.vbs`, `.jar` são sempre rejeitados, independentemente do remetente ou da situação. Alerta de segurança ao IT_MANAGER.

---

**EML-020** — Tamanho máximo de e-mail: 100 MB
E-mail com tamanho total superior a 100 MB é ignorado (`IGNORED`). Remetente notificado com instruções para enviar através do portal web.

---

**EML-021** — SPF FAIL gera rejeição imediata
E-mail com resultado SPF = `FAIL` (`-all`) é rejeitado sem criar chamado. Registrado como `SPAM_REJECTED`. Remetente NÃO é notificado (anti-spam: confirma que o endereço existe).

---

**EML-022** — DMARC FAIL com política reject: rejeição imediata
E-mail que falha em DMARC com política `p=reject` é rejeitado. Registrado como `SPAM_REJECTED`.

---

**EML-023** — Score de spam ≥ 7 rejeita o e-mail
E-mail com score anti-spam ≥ 7 é rejeitado sem criar chamado. Registrado como `SPAM_REJECTED`. Remetente NÃO notificado.

---

**EML-024** — Rate limit: 5 e-mails por minuto do mesmo remetente
Mais de 5 e-mails em 1 minuto do mesmo remetente são colocados em `RATE_LIMITED`. Processados gradualmente com delay de 30 segundos entre cada um.

---

**EML-025** — Loop de e-mail prevenido pelos headers Auto-Submitted e Precedence
E-mails com `X-Auto-Submitted` (≠ "no"), `Auto-Reply`, ou `Precedence: bulk/list/junk` são classificados como automáticos e ignorados sem criar chamado.

---

**EML-026** — Pub/Sub como canal primário; IMAP como fallback obrigatório
O `ImapFallbackPoller` executa sempre a cada 2 minutos como backup. Mesmo quando Pub/Sub está ativo, IMAP garante que nenhum e-mail seja perdido.

---

**EML-027** — Renovação do Gmail Pub/Sub watch automática a cada 7 dias
O watch do Gmail API expira em 7 dias. `GmailWatchRenewalJob` renova automaticamente com 24 horas de antecedência. Falha na renovação ativa modo IMAP exclusivo.

---

**EML-028** — Dupl icidade prevenida por external_message_id
Antes de processar e-mail via IMAP, o sistema verifica `EmailMessage.external_message_id`. Se já existe, ignora sem reprocessar (processado pelo Pub/Sub).

---

**EML-029** — Corpo do e-mail em HTML: sanitização antes de armazenar
HTML do corpo é sanitizado (remove scripts, iframes, event handlers) antes de armazenar no banco. A versão texto plano é sempre extraída e armazenada também.

---

**EML-030** — Remetente não cadastrado no SGTI: chamado criado com e-mail externo
E-mail de remetente não encontrado em `auth.User` cria chamado com `external_requester_email = from_email`. Badge "Externo" exibido no chamado. IT_MANAGER notificado.

---

**EML-031** — Usuário com domínio corporativo mas não cadastrado: PENDING_PROVISIONING
Remetente com domínio corporativo mas sem conta no SGTI gera usuário com `status = PENDING_PROVISIONING` e IT_MANAGER notificado para provisionar.

---

**EML-032** — Notificação de resolução com link de ação única assinado
O e-mail de resolução inclui links de confirmação e reabertura com tokens assinados (válidos 72 horas). Uso do token registrado em audit_log.

---

**EML-033** — Fechamento automático por e-mail: 72 horas após RESOLVED
Se o chamado foi criado ou atualizou-se por e-mail, o fechamento automático após 72 horas funciona normalmente. O sistema envia e-mail de aviso 24 horas antes.

---

**EML-034** — Comentário via e-mail: status PENDING_USER → IN_PROGRESS automático
Quando chamado está em `PENDING_USER` e usuário responde por e-mail, o status muda automaticamente para `IN_PROGRESS` e o SLA retoma.

---

**EML-035** — raw_headers preservados por 30 dias para diagnóstico
Todos os headers MIME completos são armazenados em `EmailMessage.raw_headers` por 30 dias, permitindo diagnóstico de problemas de correlação e spam.

---

**EML-036** — Attachments de e-mail seguem as mesmas regras de arquivos do portal
Os mesmos tipos aceitos, limites de tamanho e verificação de MIME type aplicados a uploads via portal aplicam-se aos anexos de e-mail.

---

**EML-037** — E-mail enviado de conta SGTI inclui header X-SGTI-Ticket-ID
Todo e-mail de notificação enviado pelo SGTI inclui o header personalizado `X-SGTI-Ticket-ID: {ticket_id}` para facilitar triagem e diagnóstico.

---

**EML-038** — Confirmação de resolução por link: não requer autenticação
Os links de ação única no e-mail de resolução (confirmar/reabrir) não exigem login no portal SGTI. O token assinado é suficiente para autenticação contextual.

---

**EML-039** — Limite de 20 anexos por e-mail
E-mails com mais de 20 anexos processam os primeiros 20 (por tamanho crescente) e ignoram os demais. Remetente notificado sobre os arquivos não processados.

---

**EML-040** — E-mail encaminhado (Fwd:) cria novo chamado
E-mail com prefixo "Fwd:" que não contém número de chamado no assunto é tratado como novo chamado. `EmailMessage.is_forwarded = true` registrado.

---

**EML-041** — Bounce de notificação SGTI registrado e IT_MANAGER notificado
Quando o Google reporta bounce (NDR) de e-mail enviado pelo SGTI, o bounce é registrado em `EmailMessage` com status `BOUNCED` e IT_MANAGER notificado.

---

**EML-042** — Notificações SGTI NÃO são processadas como novos chamados
E-mails enviados pelo próprio SGTI (identificados pelo `Message-ID` com domínio `sgti.empresa.com.br`) são ignorados se chegarem de volta à caixa de entrada. Proteção anti-loop.

---

**EML-043** — Blocklist gerenciada pelo IT_MANAGER via interface
A blocklist de remetentes bloqueados é gerenciada pelo IT_MANAGER via interface de administração do SGTI. Nenhuma operação de code deploy é necessária.

---

**EML-044** — Chamado via e-mail: mesmo ciclo de vida do chamado via portal
Chamado criado por e-mail segue exatamente o mesmo ciclo de vida, regras de SLA, aprovações e auditoria que chamados abertos pelo portal web.

---

**EML-045** — E-mail recebido fora do horário comercial: SLA em horário útil
Para chamados com SLA de horário comercial, o prazo é calculado a partir do horário útil, mesmo que o e-mail chegue à madrugada ou no fim de semana.

---

**EML-046** — Assunto modificado pelo usuário não rompe correlação se token presente
Se usuário modificar o assunto da resposta mas mantiver o padrão `[REQ-YYYY-NNNNNN]`, a correlação é mantida. Se remover o número e headers não correlacionarem, novo chamado é criado.

---

**EML-047** — Prioridade URGENT detectada automaticamente no assunto
Se o assunto contiver os termos "URGENTE", "URGENT" ou "CRÍTICO" (case-insensitive), a prioridade do chamado é elevada para HIGH automaticamente. IT_MANAGER notificado.

---

**EML-048** — Thread de chamado encerrado retida por 90 dias
`EmailThread` e `EmailMessage` de chamados encerrados são retidos por 90 dias após o encerramento do chamado. Após 90 dias: `EmailMessage.body_html` e `body_text` são substituídos por `[CONTEÚDO EXPIRADO]`.

---

**EML-049** — Relatório diário gerado automaticamente
Relatório diário de e-mails processados (recebidos, chamados criados/atualizados, falhas, spam) gerado automaticamente às 07h00 e enviado ao IT_MANAGER.

---

**EML-050** — Health check do canal de e-mail monitorado externamente
O endpoint `/health/email` é monitorado por serviço externo a cada 5 minutos. Retorna `up` quando SMTP de envio e Gmail API de recebimento estão operacionais.

---

## 19. Critérios de Aceitação

### 19.1 Criação e Atualização de Chamados

- [ ] **CA-01:** E-mail novo em `implantacao@pinpag.com.br` cria Requisição em até 2 minutos.
- [ ] **CA-02:** Resposta a e-mail de notificação adiciona comentário ao chamado correto (não cria novo).
- [ ] **CA-03:** Chamado criado com título = assunto do e-mail e descrição = corpo.
- [ ] **CA-04:** Assunto vazio resulta em título padrão "Solicitação via e-mail de {nome}".
- [ ] **CA-05:** Correlação por `In-Reply-To` funciona corretamente.
- [ ] **CA-06:** Correlação por `References` funciona corretamente.
- [ ] **CA-07:** Correlação por padrão `[REQ/INC-YYYY-NNNNNN]` no assunto funciona.
- [ ] **CA-08:** E-mail para chamado CLOSED registrado como IGNORED; remetente notificado.
- [ ] **CA-09:** E-mail com "Reabrir" para chamado CLOSED reabre corretamente.

### 19.2 Notificações

- [ ] **CA-10:** Notificação de abertura enviada em até 1 minuto após criar chamado.
- [ ] **CA-11:** Notificação contém número do chamado e prazo de SLA.
- [ ] **CA-12:** Notificação de abertura tem `In-Reply-To` vinculado ao e-mail original.
- [ ] **CA-13:** E-mail de resolução com links de confirmação e reabertura funcionais.
- [ ] **CA-14:** Link de ação única expira em 72 horas.

### 19.3 Processamento de Anexos

- [ ] **CA-15:** Anexos aceitos (PDF, DOCX, XLSX, PNG, JPG, ZIP) armazenados corretamente.
- [ ] **CA-16:** Executáveis (.exe, .bat, .ps1) rejeitados; alerta ao IT_MANAGER.
- [ ] **CA-17:** Remetente notificado sobre anexos rejeitados com motivo.
- [ ] **CA-18:** Chamado criado mesmo quando todos os anexos são rejeitados.

### 19.4 Segurança e Anti-Spam

- [ ] **CA-19:** E-mail com SPF FAIL rejeitado sem criar chamado.
- [ ] **CA-20:** Score de spam ≥ 7 rejeita o e-mail sem notificar o remetente.
- [ ] **CA-21:** Header `X-Auto-Submitted` detectado corretamente; e-mail ignorado.
- [ ] **CA-22:** Loop de e-mail prevenido quando SGTI recebe e-mail próprio de volta.

### 19.5 Resiliência e Fallback

- [ ] **CA-23:** IMAP polling a cada 2 minutos como backup do Pub/Sub.
- [ ] **CA-24:** Duplicidade prevenida por `external_message_id` entre Pub/Sub e IMAP.
- [ ] **CA-25:** `GmailWatchRenewalJob` renova o watch com 24h de antecedência.
- [ ] **CA-26:** Pub/Sub sem notificação por 5 min ativa fallback e alerta IT_MANAGER.

### 19.6 SLA e Auditoria

- [ ] **CA-27:** SLA inicia em `Ticket.created_at`, não em `EmailMessage.received_at`.
- [ ] **CA-28:** Chamado em PENDING_USER avança para IN_PROGRESS quando usuário responde por e-mail.
- [ ] **CA-29:** Todo e-mail processado registrado em `email_log.EmailMessage`.
- [ ] **CA-30:** `audit_log` registra todos os eventos com `action` correto.
- [ ] **CA-31:** raw_headers preservados por 30 dias.

### 19.7 Dashboards e Relatórios

- [ ] **CA-32:** Dashboard exibe taxa de processamento em tempo real.
- [ ] **CA-33:** E-mails com falha listados para reprocessamento manual.
- [ ] **CA-34:** Relatório diário gerado automaticamente às 07h00.

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação com 19 seções, 50 regras EML e 34 critérios de aceitação |

---

> **Próximos documentos recomendados:**
> [`50_INTEGRATIONS.md`](./50_INTEGRATIONS.md) — Arquitetura geral de integrações
> [`40_INCIDENT_MANAGEMENT.md`](./40_INCIDENT_MANAGEMENT.md) — Canal e-mail para incidentes
> [`41_REQUEST_MANAGEMENT.md`](./41_REQUEST_MANAGEMENT.md) — Canal e-mail para requisições
