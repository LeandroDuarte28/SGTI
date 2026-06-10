# SGTI — Sistema de Gestão de Tecnologia da Informação
## Política de SLA — Acordos de Nível de Serviço

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Produção
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [30_SERVICE_CATALOG.md](./30_SERVICE_CATALOG.md) · [24_BUSINESS_RULES.md](./24_BUSINESS_RULES.md) · [20_DATABASE.md](./20_DATABASE.md)

---

## Sobre este Documento

Esta política define os **Acordos de Nível de Serviço (SLA)** do SGTI — os compromissos formais de tempo de atendimento assumidos pela equipe de TI para cada serviço do catálogo. É a referência normativa para configuração do módulo `catalog.SLA`, para comunicação com usuários e para apuração de indicadores de desempenho.

---

## Sumário

1. [Definições e Conceitos](#1-definições-e-conceitos)
2. [Horário Comercial e Calendário](#2-horário-comercial-e-calendário)
3. [Níveis de SLA por Prioridade](#3-níveis-de-sla-por-prioridade)
4. [Cálculo de Prioridade — Matriz Impacto × Urgência](#4-cálculo-de-prioridade--matriz-impacto--urgência)
5. [Pausas de SLA](#5-pausas-de-sla)
6. [Reabertura de Chamados](#6-reabertura-de-chamados)
7. [Escalonamentos](#7-escalonamentos)
8. [Alertas de SLA](#8-alertas-de-sla)
9. [Violações de SLA](#9-violações-de-sla)
10. [Tabela de SLA por Serviço](#10-tabela-de-sla-por-serviço)
11. [Indicadores de SLA](#11-indicadores-de-sla)

---

## 1. Definições e Conceitos

| Termo | Definição |
|-------|-----------|
| **SLA** | Service Level Agreement — Acordo de Nível de Serviço. Compromisso formal de prazo entre a TI e os usuários. |
| **Tempo de Primeira Resposta** | Tempo máximo entre a abertura do chamado e o primeiro contato humano qualificado da equipe de TI. Não se confunde com confirmação automática de recebimento. |
| **Tempo de Atendimento** | Tempo máximo entre a abertura e o início efetivo da investigação/tratativa, evidenciado por mudança de status para `IN_PROGRESS` e primeiro comentário técnico. |
| **Tempo de Resolução** | Tempo máximo entre a abertura do chamado e a mudança de status para `RESOLVED`. Não inclui o tempo de confirmação pelo usuário (status `CLOSED`). |
| **Tempo Efetivo** | Tempo decorrido descontando pausas autorizadas. É o valor utilizado para apurar cumprimento de SLA. |
| **Janela de SLA** | Período em que o contador de SLA está ativo. Por padrão: horário comercial, exceto serviços `24×7`. |
| **Violação de SLA** | Situação em que o tempo efetivo ultrapassa o prazo contratado. Violação é irreversível — não se "cura" com resolução posterior. |
| **Breach** | Sinônimo de violação de SLA. Publicado como evento `SlaBreached` no EventBus. |

---

## 2. Horário Comercial e Calendário

### 2.1 Horário Comercial Padrão

| Configuração | Valor |
|-------------|-------|
| **Horário de início** | 08h00 (horário de Brasília — UTC-3) |
| **Horário de término** | 18h00 (horário de Brasília — UTC-3) |
| **Dias úteis** | Segunda a sexta-feira |
| **Fins de semana** | Sábado e domingo — SLA pausado |
| **Feriados nacionais** | SLA pausado conforme calendário anual |
| **Feriados estaduais/municipais** | Configuráveis anualmente pelo IT_MANAGER |

### 2.2 Exemplo de Cálculo em Horário Comercial

```
Cenário: Chamado MÉDIO aberto às 17h30 de uma quarta-feira.
SLA de resolução = 8 horas úteis

Cálculo:
  Quarta 17h30 → 18h00 = 30 minutos
  Quinta 08h00 → 16h30 = 8h30 (total)
  
  30 min (quarta) + 7h30 (quinta) = 8h → RESOLVIDO até quinta às 16h00
```

### 2.3 Exceções de Horário Comercial

Serviços marcados com **24×7** têm SLA calculado em tempo corrido, 24 horas por dia, 7 dias por semana, incluindo feriados:

- `INF-001` — Falha ou Indisponibilidade de Servidor
- `INF-003` — Falha ou Recuperação de Backup
- `SEC-001` — Suspeita de Comprometimento de Conta
- `SEC-002` — Detecção de Malware em Endpoint
- `SEC-005` — Resposta a Incidente de Vazamento de Dados
- `GWS-002` — Bloqueio ou Suspensão de Conta Google
- `CPL-004` — Incidente de Segurança de Dados — LGPD

---

## 3. Níveis de SLA por Prioridade

### 3.1 SLA CRÍTICO

Reservado para situações de indisponibilidade total de serviços essenciais ou risco de segurança com impacto imediato no negócio.

| Métrica | Prazo | Observação |
|---------|:-----:|-----------|
| **1ª Resposta** | 15 minutos | Técnico sênior deve responder; não pode ser apenas confirmação automática |
| **Início do Atendimento** | 30 minutos | Status `IN_PROGRESS` + comentário técnico documentado |
| **Resolução** | 2 horas | Ou workaround funcional que restore o serviço |
| **Janela** | 24×7 | Independe de horário comercial |
| **Comunicação de Status** | A cada 30 min | Atualizações obrigatórias enquanto aberto |
| **Acionamento de Gestor** | Imediato (abertura) | IT_MANAGER notificado ao abrir o chamado |

**Exemplos de situações CRÍTICAS:**
- Servidor de produção fora do ar
- Ransomware detectado em servidor
- Vazamento confirmado de dados pessoais
- Sistema ERP/CRM principal indisponível

---

### 3.2 SLA ALTO

Impacto significativo na produtividade de múltiplos colaboradores ou em processos importantes, sem paralisação total.

| Métrica | Prazo | Observação |
|---------|:-----:|-----------|
| **1ª Resposta** | 30 minutos | Técnico qualificado responde |
| **Início do Atendimento** | 1 hora | Status `IN_PROGRESS` + diagnóstico inicial |
| **Resolução** | 4 horas | Dentro da janela comercial |
| **Janela** | Horário comercial (padrão) | Alguns serviços: 24×7 |
| **Comunicação de Status** | A cada 2 horas | Se chamado permanecer aberto |
| **Acionamento de Gestor** | Após 80% do tempo | IT_MANAGER alertado ao atingir 3h12min |

**Exemplos de situações ALTAS:**
- VPN indisponível para grupo de colaboradores
- Falha de conectividade localizada
- Sistema interno com erro afetando setor específico

---

### 3.3 SLA MÉDIO

Impacto individual ou em grupos pequenos, sem paralisação de processos críticos.

| Métrica | Prazo | Observação |
|---------|:-----:|-----------|
| **1ª Resposta** | 2 horas | Resposta técnica qualificada |
| **Início do Atendimento** | 4 horas | Status `IN_PROGRESS` |
| **Resolução** | 8 horas | Dentro da janela comercial |
| **Janela** | Horário comercial | |
| **Comunicação de Status** | A cada 4 horas | Se chamado permanecer aberto |
| **Acionamento de Gestor** | Após 80% do tempo | Alerta com 6h24min decorridas |

**Exemplos de situações MÉDIAS:**
- Impressora sem funcionar em setor específico
- Problema de configuração de software
- Lentidão em aplicação não crítica

---

### 3.4 SLA BAIXO

Serviços de suporte, melhorias, configurações de conveniência e solicitações sem urgência operacional.

| Métrica | Prazo | Observação |
|---------|:-----:|-----------|
| **1ª Resposta** | 4 horas | |
| **Início do Atendimento** | 1 dia útil | |
| **Resolução** | 3 dias úteis (24 horas úteis) | |
| **Janela** | Horário comercial | |
| **Comunicação de Status** | A cada 1 dia útil | |
| **Acionamento de Gestor** | Após 80% do tempo | Alerta com 19h12min decorridas |

**Exemplos de situações BAIXAS:**
- Criação de grupo de e-mail
- Solicitação de novo ponto de rede
- Descarte de equipamento obsoleto

---

### 3.5 SLA PLANEJADO

Exclusivo para serviços que, por natureza, requerem análise, aprovação e agendamento prévios.

| Métrica | Prazo | Observação |
|---------|:-----:|-----------|
| **1ª Resposta** | 1 dia útil | Confirmação de recebimento e triagem |
| **Início do Atendimento** | 2 dias úteis | Análise de viabilidade |
| **Resolução** | 5 dias úteis | Execução conforme cronograma acordado |
| **Janela** | Horário comercial | |
| **Comunicação de Status** | Semanal | |

**Exemplos de serviços PLANEJADOS:**
- Implantação de novo sistema
- Abertura de projeto de TI
- Provisão de servidor virtual

---

### 3.6 Tabela Resumo de Prazos

| Nível | 1ª Resposta | Início Atendimento | Resolução | Janela | Comunicação de Status |
|:-----:|:-----------:|:------------------:|:---------:|:------:|:--------------------:|
| **CRÍTICO** | 15 min | 30 min | 2 horas | 24×7 | A cada 30 min |
| **ALTO** | 30 min | 1 hora | 4 horas | Comercial* | A cada 2 horas |
| **MÉDIO** | 2 horas | 4 horas | 8 horas | Comercial | A cada 4 horas |
| **BAIXO** | 4 horas | 1 dia útil | 3 dias úteis | Comercial | 1× por dia útil |
| **PLANEJADO** | 1 dia útil | 2 dias úteis | 5 dias úteis | Comercial | Semanal |

\* Alguns serviços ALTO operam 24×7 — ver tabela da seção 10.

---

## 4. Cálculo de Prioridade — Matriz Impacto × Urgência

A prioridade de um chamado de incidente é calculada automaticamente pelo sistema com base no cruzamento de **Impacto** e **Urgência** informados pelo usuário.

### 4.1 Definição de Impacto

| Nível de Impacto | Definição | Exemplos |
|:----------------:|-----------|---------|
| **GENERALIZADO** | Afeta toda a organização ou serviços críticos de negócio | Servidor de produção fora do ar; ERP indisponível |
| **SIGNIFICATIVO** | Afeta um departamento inteiro ou grupo relevante de usuários | Rede do setor financeiro com falha; VPN de 20+ usuários |
| **MODERADO** | Afeta um grupo pequeno (até 5 usuários) ou serviço secundário | Impressora de uma sala; acesso de 2 colaboradores |
| **MENOR** | Afeta apenas 1 usuário ou causa inconveniência sem paralisação | Problema de configuração pessoal; dúvida de uso |

### 4.2 Definição de Urgência

| Nível de Urgência | Definição |
|:-----------------:|-----------|
| **CRÍTICA** | Processo de negócio parado agora; não há alternativa |
| **ALTA** | Processo fortemente comprometido; workaround precário disponível |
| **MÉDIA** | Processo impactado mas funcionando com dificuldade |
| **BAIXA** | Inconveniência; não há impacto imediato no trabalho |

### 4.3 Matriz de Prioridade

```
                    URGÊNCIA
                 Crítica  Alta   Média  Baixa
               ┌────────┬──────┬──────┬──────┐
  GENERALIZADO │CRÍTICO │CRÍTICO│ ALTO │ ALTO │
               ├────────┼──────┼──────┼──────┤
 SIGNIFICATIVO │CRÍTICO │ ALTO │ ALTO │MÉDIO │
               ├────────┼──────┼──────┼──────┤
    MODERADO   │ ALTO   │ ALTO │MÉDIO │BAIXO │
               ├────────┼──────┼──────┼──────┤
I     MENOR   │ ALTO   │MÉDIO │BAIXO │BAIXO │
M              └────────┴──────┴──────┴──────┘
P
A
C
T
O
```

### 4.4 Regras de Ajuste de Prioridade

O sistema pode ajustar automaticamente a prioridade calculada nos seguintes cenários:

| Condição | Ajuste |
|----------|--------|
| Serviço marcado como CRÍTICO no catálogo e qualquer impacto/urgência | Eleva ao mínimo para ALTO |
| Mais de 10 usuários impactados simultaneamente (falha de rede, por exemplo) | Eleva para CRÍTICO |
| Serviço ALTO com ativo CRÍTICO de negócio afetado | Eleva para CRÍTICO |
| Incidente vinculado a problema `KNOWN_ERROR` com workaround disponível | Pode reduzir prioridade em 1 nível |
| Segunda ocorrência do mesmo incidente para o mesmo usuário em 7 dias | Eleva 1 nível |

---

## 5. Pausas de SLA

### 5.1 Situações que Autorizam Pausa

O contador de SLA pode ser pausado nas seguintes situações, devidamente documentadas:

| Status do Chamado | Motivo de Pausa | Quem pode pausar |
|:-----------------:|----------------|:----------------:|
| `PENDING_USER` | Aguardando retorno de informações do solicitante | IT_TECHNICIAN+ |
| `PENDING_THIRD_PARTY` | Aguardando fornecedor externo ou operadora | IT_TECHNICIAN+ |

**SLA NÃO pode ser pausado** em nenhum outro status. Tentativas de pausar em status não autorizados são rejeitadas pelo sistema com erro 422.

### 5.2 Regras de Pausa

| Regra | Detalhe |
|-------|---------|
| **Motivo obrigatório** | Campo `reason` com mínimo de 20 caracteres ao pausar |
| **Registro imutável** | Cada pausa registrada em `catalog.SLAHistory` com início, fim e motivo |
| **Retomada automática** | SLA retoma automaticamente quando o usuário adiciona comentário no chamado |
| **Retomada manual** | Técnico pode retomar manualmente ao mudar o status para `IN_PROGRESS` |
| **Tempo pausado descontado** | `effective_deadline = original_deadline + total_paused_minutes` |
| **Sem limite de pausas** | Múltiplas pausas permitidas; cada uma é registrada individualmente |
| **Pausa não reverte violação** | SLA já violado permanece violado independentemente de pausa posterior |

### 5.3 Controle de Abusos de Pausa

O sistema monitora padrões de pausa para prevenir uso indevido como mecanismo de burlar SLA:

| Condição de Alerta | Ação |
|-------------------|------|
| Mesmo chamado com > 3 pausas | Alerta ao IT_MANAGER no próximo ciclo do job |
| Pausa acumulada > 50% do prazo de resolução | Alerta ao IT_MANAGER |
| Técnico com taxa de pausa > 30% dos chamados | Relatório semanal para IT_MANAGER |
| Pausa `PENDING_USER` sem resposta do usuário por > 5 dias úteis | Sistema sugere fechamento automático ao técnico |

### 5.4 Fechamento por Inatividade do Usuário

Chamados pausados com status `PENDING_USER` onde o solicitante não responde por 5 dias úteis:

```
1. Sistema notifica o usuário (dia 3): "Seu chamado aguarda retorno há 3 dias."
2. Sistema notifica novamente (dia 5): "Seu chamado será encerrado em 2 dias sem resposta."
3. Dia 7 sem resposta: sistema fecha o chamado automaticamente.
   Status: CLOSED
   Comentário de sistema: "Fechado automaticamente por ausência de resposta do solicitante após 7 dias em PENDING_USER."
4. Usuário pode reabrir dentro dos 7 dias normais de reabertura (BR-INC-005).
```

---

## 6. Reabertura de Chamados

### 6.1 Regras de Reabertura

| Regra | Detalhe |
|-------|---------|
| **Janela de reabertura** | 7 dias corridos após o fechamento (`CLOSED`) |
| **Quem pode reabrir** | Solicitante original ou IT_MANAGER+ |
| **Justificativa obrigatória** | Mínimo de 20 caracteres explicando o motivo |
| **Novo SLA calculado** | A partir do momento da reabertura, com a prioridade atual |
| **Histórico preservado** | Todo o histórico anterior (comentários, anexos, SLA) é mantido |
| **Após 7 dias** | Somente IT_MANAGER+ pode reabrir; usuário deve abrir novo chamado |
| **Chamado CANCELLED** | Não pode ser reaberto — deve ser criado novo chamado |

### 6.2 Impacto da Reabertura no SLA

```
Cenário: Chamado resolvido dentro do SLA (CUMPRIU o SLA original)
→ Ao reabrir, novo SLA começa do zero a partir da reabertura
→ Se o novo SLA for cumprido: chamado encerrado como CUMPRIU
→ Se o novo SLA for violado: chamado encerrado como VIOLOU
→ O evento de violação na reabertura NÃO afeta o registro histórico do SLA original

Cenário: Chamado fechado automaticamente (PENDING_USER sem resposta)
→ Ao reabrir, o SLA é calculado como novo chamado
→ Prioridade reavaliada conforme situação atual
```

### 6.3 Segunda Reabertura

Se um chamado for reaberto pela segunda vez para o mesmo problema:

- O sistema alerta automaticamente o IT_MANAGER sobre a reincidência.
- O chamado é vinculado automaticamente à sugestão de criação de Problema.
- A prioridade pode ser elevada em 1 nível pelo sistema.

---

## 7. Escalonamentos

### 7.1 Escalonamento Automático por Tempo

O sistema executa o `SlaMonitoringJob` a cada 5 minutos e publica alertas de escalonamento nos seguintes marcos:

| Marco | Ação Automática |
|:-----:|----------------|
| **50% do tempo de resolução consumido** | Notificação in-app ao técnico atribuído |
| **75% do tempo de resolução consumido** | Notificação in-app e e-mail ao técnico atribuído |
| **80% do tempo de resolução consumido** | Evento `SlaAtRisk` publicado → notificação ao técnico + IT_MANAGER |
| **90% do tempo de resolução consumido** | Notificação urgente ao IT_MANAGER + alerta no Dashboard Operacional |
| **100% do tempo de resolução (BREACH)** | Evento `SlaBreached` publicado → notificação ao técnico, IT_MANAGER + registro permanente de violação |

### 7.2 Escalonamento por Prioridade sem Atribuição

Chamados sem técnico atribuído (sem `assignee_id`) são escalonados conforme a prioridade:

| Prioridade | Tempo sem Atribuição | Ação de Escalonamento |
|:----------:|:--------------------:|----------------------|
| **CRÍTICO** | 15 minutos | Notificação ao IT_MANAGER + ao grupo de suporte responsável |
| **ALTO** | 30 minutos | Notificação ao IT_MANAGER |
| **MÉDIO** | 2 horas | Notificação ao IT_MANAGER |
| **BAIXO** | 4 horas | Notificação ao IT_MANAGER (informativa) |

### 7.3 Escalonamento por Hierarquia de Nível

Quando o técnico N1 não consegue resolver o chamado dentro de 50% do prazo de SLA, o sistema sugere escalonamento:

```
FLUXO DE ESCALONAMENTO POR NÍVEL

N1 — Analistas de TI (Suporte)
  → 50% do prazo de resolução: sugestão de escalonamento para N2
  → 75% do prazo: alerta de escalonamento automático ao N2

N2 — Coordenadores / Analistas Sênior
  → 80% do prazo: alerta ao N3 + IT_MANAGER

N3 — Especialistas / Arquitetos
  → 95% do prazo: chamado crítico; IT_MANAGER assume gestão direta

ESCALAÇÃO MANUAL:
  Técnico pode escalar manualmente a qualquer momento
  via "Transferir Chamado" com motivo documentado.
```

### 7.4 Escalonamento de Incidentes Críticos — Procedimento de Crise

Para incidentes com prioridade CRÍTICO e impacto GENERALIZADO:

```
T+0:    Incidente aberto
T+0:    Notificação automática → IT_MANAGER + Especialista de Plantão
T+15min: 1ª atualização obrigatória de status
T+30min: 2ª atualização + comunicação aos usuários afetados
T+60min: SE não resolvido → IT_MANAGER aciona reunião de crise (bridge call)
T+90min: SE não resolvido → Comunicação formal à Diretoria
T+2h:   SE não resolvido → Acionamento de fornecedor externo se aplicável
T+4h:   Pós-resolução: relatório de post-mortem obrigatório
```

---

## 8. Alertas de SLA

### 8.1 Alertas Automáticos

O sistema envia os seguintes alertas automáticos relacionados a SLA:

| Alerta | Gatilho | Canal | Destinatário |
|--------|---------|:-----:|:------------:|
| **SLA em Risco (80%)** | 80% do tempo de resolução consumido | In-app + E-mail | Técnico + IT_MANAGER |
| **SLA em Risco (90%)** | 90% do tempo consumido | In-app + E-mail urgente | Técnico + IT_MANAGER |
| **SLA Violado** | 100% do tempo consumido | In-app + E-mail | Técnico + IT_MANAGER |
| **Sem Atribuição (CRÍTICO)** | 15 min sem técnico atribuído | In-app + E-mail | IT_MANAGER + Grupo |
| **Sem Atribuição (ALTO)** | 30 min sem técnico atribuído | In-app | IT_MANAGER |
| **Pendente com Usuário (3 dias)** | 3 dias em PENDING_USER | In-app | Técnico |
| **Pendente com Usuário (5 dias)** | 5 dias em PENDING_USER | In-app + E-mail | Técnico + Solicitante |
| **SLA Global Abaixo da Meta** | SLA global cair abaixo de 90% | In-app | IT_MANAGER |
| **SLA Semanal em Declínio** | Tendência negativa por 2 semanas | E-mail | IT_MANAGER |

### 8.2 Alerta Visual no Sistema

O indicador de SLA muda de cor progressivamente na interface do SGTI:

| Cor | Significado | Condição |
|:---:|------------|---------|
| 🟢 Verde | No prazo — SLA seguro | < 50% do tempo consumido |
| 🟡 Amarelo | Atenção — Monitorar | 50%–79% do tempo consumido |
| 🟠 Laranja | Em risco — Ação necessária | 80%–99% do tempo consumido |
| 🔴 Vermelho | SLA Violado | 100% ou mais do tempo consumido |
| ⚪ Cinza | SLA Pausado | Status PENDING_USER ou PENDING_THIRD_PARTY |

---

## 9. Violações de SLA

### 9.1 Características de uma Violação

```
Uma violação de SLA (Breach) é:
  ✓ PERMANENTE: uma vez violada, não pode ser revertida
  ✓ INDEPENDENTE: resolução posterior não cancela a violação
  ✓ AUDITÁVEL: registrada em catalog.SLAHistory com timestamp
  ✓ IMPUTÁVEL: associada ao técnico e grupo responsável no momento

Uma violação de SLA NÃO é:
  ✗ Reversível por pausa posterior
  ✗ Cancelável por resolução rápida após o prazo
  ✗ Apagável do histórico (registro imutável)
```

### 9.2 Registro de Violação

Ao ocorrer uma violação, o sistema registra automaticamente:

```
catalog.SLAHistory:
  event: BREACHED
  event_at: <timestamp exato da violação>
  response_deadline: <prazo original>
  resolution_deadline: <prazo original>

ticket.Ticket:
  sla_status: BREACHED (campo calculado, não armazenado)

shared.audit_log:
  action: SLA_BREACHED
  entity_type: Ticket
  entity_id: <ticket_id>
  metadata: { priority, breached_at, elapsed_minutes, technician_id }
```

### 9.3 Tratamento Pós-Violação

Chamados com SLA violado continuam sendo atendidos normalmente. A violação não altera o fluxo de atendimento, mas:

- Badge vermelho "SLA VIOLADO" exibido permanentemente na página do chamado.
- Chamado adicionado ao relatório de violações do período.
- IT_MANAGER notificado com detalhes da violação.
- Chamado aparece destacado no Dashboard Operacional na seção "Violações".

### 9.4 Apuração e Reporte de Violações

**Meta corporativa de cumprimento de SLA:** ≥ 95% dos chamados dentro do prazo (mensurado mensalmente).

| Período | Relatório | Destinatário | Ação |
|---------|-----------|:------------:|------|
| Diário | Lista de violações do dia | IT_MANAGER | Revisão operacional |
| Semanal | Resumo de violações por técnico e serviço | IT_MANAGER | Análise de capacidade |
| Mensal | Relatório executivo de SLA global | IT_MANAGER + Diretoria | Prestação de contas |
| Trimestral | Análise de tendências e causas raiz | IT_MANAGER | Revisão de processos |

### 9.5 Causas Comuns de Violação e Ações Corretivas

| Causa | Indicador | Ação Corretiva |
|-------|-----------|----------------|
| Falta de técnicos disponíveis | Alto volume de chamados sem atribuição | Revisão de capacidade; contratação ou redistribuição |
| Complexidade não prevista | Chamados repassados múltiplas vezes | Revisão de nível de SLA para o serviço |
| Dependência de terceiros | Alto índice de `PENDING_THIRD_PARTY` | SLA específico para serviços com dependência externa |
| SLA incorreto para o serviço | Violações sistemáticas no mesmo serviço | Revisão e ajuste do SLA no catálogo |
| Prioridade subestimada | Muitos chamados MÉDIO que deveriam ser ALTO | Revisão da matriz de prioridade |

---

## 10. Tabela de SLA por Serviço

### Legenda

| Abreviação | Significado |
|:----------:|-------------|
| **1ªR** | 1ª Resposta |
| **INI** | Início do Atendimento |
| **RES** | Resolução |
| **HC** | Horário Comercial |
| **24×7** | 24 horas, 7 dias |

---

### 10.1 Service Desk

| Código | Serviço | Prioridade | 1ªR | INI | Resolução | Janela |
|--------|---------|:----------:|:---:|:---:|:---------:|:------:|
| SDS-001 | Suporte a Hardware de Workstation | ALTO | 30 min | 1 h | 4 h | HC |
| SDS-002 | Instalação e Configuração de Software | MÉDIO | 2 h | 4 h | 8 h | HC |
| SDS-003 | Redefinição de Senha de Sistema | ALTO | 30 min | 1 h | 1 h | HC |
| SDS-004 | Configuração de Impressora e Scanner | MÉDIO | 2 h | 4 h | 4 h | HC |
| SDS-005 | Suporte a Dispositivos Móveis Corporativos | MÉDIO | 2 h | 4 h | 8 h | HC |
| SDS-006 | Kit de Equipamentos — Onboarding | PLANEJADO | 8 h | 1 dia | 5 dias | HC |
| SDS-007 | Suporte Remoto à Estação de Trabalho | MÉDIO | 30 min | 1 h | 2 h | HC |
| SDS-008 | Formatação / Reinstalação | MÉDIO | 4 h | 4 h | 1 dia | HC |

**Notas SDS:**
- **SDS-001:** Substituto temporário em até 2 horas se reparo não possível no dia.
- **SDS-003:** Prazo de resolução = 1 hora (mais restrito que o nível ALTO padrão) — impacto imediato no trabalho.
- **SDS-006:** Abertura com antecedência mínima de 5 dias úteis. SLA não se aplica a solicitações de última hora.
- **SDS-007:** Diagnóstico no próprio atendimento remoto; resolução simultânea quando possível.

---

### 10.2 Infraestrutura e Servidores

| Código | Serviço | Prioridade | 1ªR | INI | Resolução | Janela |
|--------|---------|:----------:|:---:|:---:|:---------:|:------:|
| INF-001 | Falha ou Indisponibilidade de Servidor | CRÍTICO | 15 min | 30 min | 2 h | 24×7 |
| INF-002 | Provisionamento de Servidor Virtual | PLANEJADO | 4 h | 1 dia | 3 dias | HC |
| INF-003 | Falha ou Recuperação de Backup | CRÍTICO | 15 min | 30 min | 4 h | 24×7 |
| INF-004 | Expansão de Armazenamento | MÉDIO | 4 h | 4 h | 2 dias | HC |
| INF-005 | Manutenção Programada de Infraestrutura | PLANEJADO | 1 dia | 2 dias | Agendado | HC |
| INF-006 | Investigação de Performance de Servidor | ALTO | 30 min | 1 h | 4 h | HC |

**Notas INF:**
- **INF-001:** Comunicação de status obrigatória a cada 30 minutos. IT_MANAGER acionado na abertura.
- **INF-003:** Prazo de 4 horas refere-se ao início do restore. Tempo total de recuperação depende do volume de dados.
- **INF-005:** SLA de resolução = conforme janela de manutenção acordada. SLA de 1ªR e INI obrigatórios.

---

### 10.3 Redes e Conectividade

| Código | Serviço | Prioridade | 1ªR | INI | Resolução | Janela |
|--------|---------|:----------:|:---:|:---:|:---------:|:------:|
| NET-001 | Falha de Conectividade de Rede | ALTO | 30 min | 1 h | 2 h (local) / 4 h (geral) | HC* |
| NET-002 | Falha ou Lentidão de Acesso à Internet | ALTO | 30 min | 1 h | 4 h | HC |
| NET-003 | Problema de Acesso à VPN | ALTO | 30 min | 1 h | 2 h | HC |
| NET-004 | Solicitação de Acesso à VPN | MÉDIO | 2 h | 4 h | 4 h | HC |
| NET-005 | Configuração de VLAN e Segmentação | ALTO | 4 h | 1 dia | 3 dias | HC |
| NET-006 | Solicitação de Ponto de Rede | BAIXO | 1 dia | 1 dia | 5 dias | HC |

**Notas NET:**
- **NET-001:** Falha que impacte > 10 usuários simultaneamente eleva automaticamente para CRÍTICO (24×7).
- **NET-003:** Home office sem VPN: prioridade elevada para ALTO com atendimento prioritário.
- **NET-005:** Resolução em 3 dias úteis após aprovação. Execução somente em janela de manutenção aprovada.

---

### 10.4 Segurança da Informação

| Código | Serviço | Prioridade | 1ªR | INI | Resolução | Janela |
|--------|---------|:----------:|:---:|:---:|:---------:|:------:|
| SEC-001 | Suspeita de Comprometimento de Conta | CRÍTICO | 15 min | 30 min | 2 h | 24×7 |
| SEC-002 | Detecção de Malware em Endpoint | CRÍTICO | 15 min | 30 min | 4 h | 24×7 |
| SEC-003 | Solicitação de Certificado Digital | ALTO | 2 h | 4 h | 1 dia | HC |
| SEC-004 | Revisão de Permissões e Acessos | MÉDIO | 4 h | 4 h | 3 dias | HC |
| SEC-005 | Resposta a Vazamento de Dados | CRÍTICO | 15 min | 30 min | 4 h (contenção) | 24×7 |
| SEC-006 | Liberação no Firewall ou Proxy | MÉDIO | 2 h | 4 h | 1 dia | HC |
| SEC-007 | Verificação de E-mail Suspeito | ALTO | 30 min | 1 h | 2 h | HC |

**Notas SEC:**
- **SEC-001 e SEC-002:** Isolamento imediato como primeira ação independente de SLA formal.
- **SEC-005:** Resolução de 4 horas = contenção inicial + avaliação de impacto. Notificação ANPD em até 72h (LGPD).
- **SEC-003:** Certificados críticos (domínio, produção): resolução em 4 horas. Demais: 1 dia útil.

---

### 10.5 Google Workspace

| Código | Serviço | Prioridade | 1ªR | INI | Resolução | Janela |
|--------|---------|:----------:|:---:|:---:|:---------:|:------:|
| GWS-001 | Criação de Conta Google Workspace | ALTO | 30 min | 1 h | 4 h | HC |
| GWS-002 | Bloqueio ou Suspensão de Conta | CRÍTICO | 15 min | 30 min | 1 h | 24×7 |
| GWS-003 | Criação de Grupo de E-mail | BAIXO | 2 h | 4 h | 4 h | HC |
| GWS-004 | Recuperação de Arquivo do Drive | ALTO | 1 h | 2 h | 4 h | HC |
| GWS-005 | Delegação de Caixa Postal | BAIXO | 2 h | 4 h | 4 h | HC |
| GWS-006 | Problema com Google Meet | ALTO | 30 min | 1 h | 2 h | HC |

**Notas GWS:**
- **GWS-002:** Suspensão executada imediatamente ao receber a solicitação; SLA de resolução = confirmação e documentação.
- **GWS-004:** Disponibilidade do arquivo depende do prazo de retenção do Google (25 dias após exclusão permanente).

---

### 10.6 Gestão de Ativos

| Código | Serviço | Prioridade | 1ªR | INI | Resolução | Janela |
|--------|---------|:----------:|:---:|:---:|:---------:|:------:|
| AST-001 | Registro de Ativo no Inventário | MÉDIO | 2 h | 4 h | 1 dia | HC |
| AST-002 | Alocação de Equipamento | MÉDIO | 2 h | 4 h | 1 dia | HC |
| AST-003 | Devolução de Equipamento | ALTO | 2 h | 4 h | 4 h | HC |
| AST-004 | Manutenção de Equipamento | MÉDIO | 4 h | 4 h | 5 dias* | HC |
| AST-005 | Descarte e Descomissionamento | BAIXO | 1 dia | 1 dia | 5 dias | HC |
| AST-006 | Gestão de Licenças de Software | MÉDIO | 4 h | 4 h | 2 dias | HC |

**Notas AST:**
- **AST-003:** Prioridade ALTO em desligamentos — SLA apertado pois colega já encerrou o contrato.
- **AST-004:** Prazo de 5 dias = para manutenção interna. Manutenção com assistência técnica externa: sujeito ao prazo do fornecedor (sem SLA interno de resolução garantido).

---

### 10.7 Sistemas Internos e Aplicações

| Código | Serviço | Prioridade | 1ªR | INI | Resolução | Janela |
|--------|---------|:----------:|:---:|:---:|:---------:|:------:|
| SIS-001 | Falha em Sistema Corporativo | CRÍTICO | 15 min | 30 min | 4 h | 24×7* |
| SIS-002 | Solicitação de Acesso a Sistema | MÉDIO | 2 h | 4 h | 4 h | HC |
| SIS-003 | Relatório ou Extração de Dados | MÉDIO | 4 h | 4 h | 3 dias | HC |
| SIS-004 | Solicitação de Nova Funcionalidade | BAIXO | 1 dia | 2 dias | Conforme análise | HC |
| SIS-005 | Falha de Integração entre Sistemas | ALTO | 30 min | 1 h | 4 h | HC |

**Notas SIS:**
- **SIS-001:** CRÍTICO 24×7 apenas para sistemas financeiros e operacionais críticos. Sistemas administrativos: ALTO, HC.
- **SIS-004:** Sem SLA de resolução fixo — análise de viabilidade em até 5 dias úteis; implementação conforme backlog priorizado.

---

### 10.8 Compliance e Governança de TI

| Código | Serviço | Prioridade | 1ªR | INI | Resolução | Janela |
|--------|---------|:----------:|:---:|:---:|:---------:|:------:|
| CPL-001 | Auditoria de Acessos de Colaborador | ALTO | 2 h | 4 h | 1 dia | HC |
| CPL-002 | Exercício de Direitos LGPD | ALTO | 2 h | 4 h | 15 dias úteis | HC |
| CPL-003 | Consulta ou Criação de Política de TI | BAIXO | 4 h | 1 dia | 5 dias (30 dias nova) | HC |
| CPL-004 | Incidente de Segurança de Dados (LGPD) | CRÍTICO | 15 min | 30 min | 4 h (contenção) | 24×7 |
| CPL-005 | Evidências para Auditoria Externa | ALTO | 2 h | 4 h | 3 dias | HC |

**Notas CPL:**
- **CPL-002:** SLA de resolução = 15 dias úteis conforme prazo legal da LGPD (Art. 18). Prazo interno de 1ªR é de 2 horas para recebimento e protocolo da solicitação.
- **CPL-004:** Resolução de 4 horas = contenção e avaliação inicial. Processo de notificação ANPD segue prazo de 72 horas independentemente.

---

### 10.9 Financeiro de TI

| Código | Serviço | Prioridade | 1ªR | INI | Resolução | Janela |
|--------|---------|:----------:|:---:|:---:|:---------:|:------:|
| FIN-001 | Solicitação de Compra de TI | MÉDIO | 4 h | 4 h | 5 dias | HC |
| FIN-002 | Renovação de Contrato | ALTO | 4 h | 1 dia | 10 dias | HC |
| FIN-003 | Análise de Custos e Rateio | MÉDIO | 1 dia | 1 dia | 5 dias | HC |
| FIN-004 | Orçamento Anual de TI | ALTO | 4 h | 1 dia | 5 dias | HC |
| FIN-005 | Gestão de Fornecedor | BAIXO | 1 dia | 1 dia | 2 dias | HC |

**Notas FIN:**
- **FIN-001:** Prazo de 5 dias inclui análise, aprovação por alçada e emissão do pedido. Compras urgentes com impacto operacional: SLA ALTO (4h resposta, 1 dia resolução).
- **FIN-002:** Alertas automáticos emitidos 90, 60, 30 e 2 dias antes do vencimento do contrato — o SLA desta tabela refere-se ao processo de renovação em si, após abertura do chamado.

---

### 10.10 Projetos e Inovação

| Código | Serviço | Prioridade | 1ªR | INI | Resolução | Janela |
|--------|---------|:----------:|:---:|:---:|:---------:|:------:|
| PRJ-001 | Abertura de Projeto de TI | MÉDIO | 1 dia | 2 dias | 10 dias | HC |
| PRJ-002 | Implantação de Novo Sistema | PLANEJADO | 1 dia | 2 dias | Conforme projeto | HC |
| PRJ-003 | Suporte a Projeto em Andamento | ALTO | 2 h | 4 h | Conforme impedimento | HC |
| PRJ-004 | Consultoria Tecnológica Interna | MÉDIO | 1 dia | 1 dia | 5 dias | HC |
| PRJ-005 | Encerramento de Projeto | BAIXO | 1 dia | 1 dia | 5 dias | HC |

**Notas PRJ:**
- **PRJ-002 e PRJ-001:** SLA de resolução = análise e aprovação. Execução segue cronograma do projeto aprovado.
- **PRJ-003:** SLA de resposta e início aplicados. Resolução do impedimento depende da complexidade; meta: resolver sem comprometer marcos do projeto.

---

## 11. Indicadores de SLA

### 11.1 KPIs de SLA

| KPI | Fórmula | Meta | Frequência |
|-----|---------|:----:|:----------:|
| **SLA Global (%)** | chamados_dentro_prazo / total_chamados × 100 | ≥ 95% | Mensal |
| **SLA por Prioridade — CRÍTICO** | resolvidos_no_prazo / total_críticos × 100 | ≥ 99% | Mensal |
| **SLA por Prioridade — ALTO** | resolvidos_no_prazo / total_altos × 100 | ≥ 98% | Mensal |
| **SLA por Prioridade — MÉDIO** | resolvidos_no_prazo / total_médios × 100 | ≥ 95% | Mensal |
| **SLA por Prioridade — BAIXO** | resolvidos_no_prazo / total_baixos × 100 | ≥ 90% | Mensal |
| **MTTR** (Mean Time to Repair) | soma_tempo_resolução / total_chamados | Tendência de redução | Mensal |
| **MTTF** (Mean Time to First Response) | soma_tempo_1ªresposta / total_chamados | ≤ 80% do SLA | Mensal |
| **Taxa de Violação** | chamados_violados / total_chamados × 100 | ≤ 5% | Mensal |
| **Taxa de Pausa** | chamados_com_pausa / total_chamados × 100 | ≤ 15% | Mensal |
| **Taxa de Reabertura** | chamados_reabertos / total_fechados × 100 | ≤ 8% | Mensal |

### 11.2 Revisão da Política de SLA

Esta política é revisada:

| Gatilho de Revisão | Prazo para Análise |
|-------------------|:-----------------:|
| SLA global abaixo de 90% por 2 meses consecutivos | Imediato |
| Novo serviço adicionado ao catálogo | Antes da publicação do serviço |
| Mudança de equipe ou capacidade de atendimento | Dentro de 30 dias |
| Solicitação do IT_MANAGER ou Compliance | Dentro de 15 dias úteis |
| Revisão periódica regular | Semestral |

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação da política com SLA dos 59 serviços do catálogo |

---

> **Próximos documentos recomendados:**
> [`30_SERVICE_CATALOG.md`](./30_SERVICE_CATALOG.md) — Catálogo de serviços com detalhes de cada serviço
> [`24_BUSINESS_RULES.md`](./24_BUSINESS_RULES.md) — Regras BR-SLA-001 a BR-SLA-008
> [`20_DATABASE.md`](./20_DATABASE.md) — Estrutura de dados de SLA (catalog.SLA, catalog.SLAHistory)
