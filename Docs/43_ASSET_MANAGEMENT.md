# SGTI — Sistema de Gestão de Tecnologia da Informação
## Módulo de Gestão de Ativos de TI — Documentação Funcional

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [24_BUSINESS_RULES.md](./24_BUSINESS_RULES.md) · [41_REQUEST_MANAGEMENT.md](./41_REQUEST_MANAGEMENT.md) · [40_INCIDENT_MANAGEMENT.md](./40_INCIDENT_MANAGEMENT.md) · [20_DATABASE.md](./20_DATABASE.md) · [23_USER_ROLES.md](./23_USER_ROLES.md)

---

## Sobre este Documento

Este documento define a **especificação funcional completa do Módulo de Gestão de Ativos de TI (ITAM) do SGTI**. Cobre o conceito ITIL v4, estrutura de dados, categorias, fluxos de controle, integrações, controles financeiros, regras de negócio e critérios de aceitação.

**Escopo exclusivo:** documentação funcional e de processo. Nenhum código, SQL ou especificação de API é gerado neste documento.

---

## Sumário

1. [Conceito de Ativo de TI](#1-conceito-de-ativo-de-ti)
2. [Objetivos do Processo](#2-objetivos-do-processo)
3. [Papéis e Responsabilidades](#3-papéis-e-responsabilidades)
4. [Categorias de Ativos](#4-categorias-de-ativos)
5. [Estrutura do Ativo](#5-estrutura-do-ativo)
6. [Integração com GLPI — Fonte Oficial](#6-integração-com-glpi--fonte-oficial)
7. [Controle de Entregas](#7-controle-de-entregas)
8. [Controle de Devoluções](#8-controle-de-devoluções)
9. [Controle de Movimentações](#9-controle-de-movimentações)
10. [Gestão de Licenças](#10-gestão-de-licenças)
11. [Gestão de Garantias](#11-gestão-de-garantias)
12. [Gestão de Contratos de Ativo](#12-gestão-de-contratos-de-ativo)
13. [Integração com Requisições](#13-integração-com-requisições)
14. [Integração com Incidentes](#14-integração-com-incidentes)
15. [Integração com Problemas](#15-integração-com-problemas)
16. [Integração com Compliance](#16-integração-com-compliance)
17. [Classificação Financeira — OPEX e CAPEX](#17-classificação-financeira--opex-e-capex)
18. [Controle CAPEX](#18-controle-capex)
19. [Controle OPEX](#19-controle-opex)
20. [Controle de Custos](#20-controle-de-custos)
21. [Dashboards Operacionais](#21-dashboards-operacionais)
22. [Dashboards Executivos](#22-dashboards-executivos)
23. [Relatórios](#23-relatórios)
24. [Auditoria e Rastreabilidade](#24-auditoria-e-rastreabilidade)
25. [Compliance e Conformidade](#25-compliance-e-conformidade)
26. [Regras de Negócio](#26-regras-de-negócio)
27. [Critérios de Aceitação](#27-critérios-de-aceitação)

---

## 1. Conceito de Ativo de TI

### 1.1 Definição ITIL v4

> Um **Ativo** é qualquer recurso ou capacidade que pode contribuir para a entrega de um produto ou serviço. Ativos podem incluir pessoas, informações, aplicações, infraestrutura, hardware e capital financeiro.
>
> — ITIL v4, AXELOS

No contexto do SGTI, ativos de TI são todos os recursos tecnológicos que suportam os serviços corporativos — desde computadores físicos até licenças de software e contratos de serviços em nuvem.

### 1.2 Diferenciação de Tipos de Ativo

| Tipo | Definição | Exemplos | Identificação |
|:----:|-----------|---------|:-------------:|
| **Ativo Físico (Hardware)** | Equipamento tangível com existência material | Notebook, servidor, impressora, switch | Etiqueta patrimonial + número de série |
| **Ativo Lógico (Software)** | Recurso intangível instalado ou implantado | SO, aplicativos, ferramentas corporativas | Licença + chave de ativação |
| **Licença** | Direito de uso de software por quantidade e período | Microsoft 365, Adobe Creative Cloud | Número de licença + quantidade |
| **Serviço Contratado** | Serviço externo prestado continuamente | SaaS, cloud, hospedagem, suporte | Contrato + vigência |

### 1.3 Item de Configuração (CI — Configuration Item)

No vocabulário ITIL, ativos que precisam ser gerenciados para entregar serviços de TI são chamados de **Itens de Configuração (CI)**. No SGTI, todo ativo do inventário é tratado como CI, com:

- Identificação única (asset_tag ou licença).
- Atributos documentados (specs, localização, responsável).
- Relacionamentos rastreados (com usuários, serviços, incidentes, problemas).
- Histórico completo de mudanças.

---

## 2. Objetivos do Processo

### 2.1 Objetivo Primário

Manter inventário completo, preciso e atualizado de todos os ativos de TI da organização, garantindo controle patrimonial, rastreabilidade de uso, otimização de custos e conformidade com políticas internas e regulações externas.

### 2.2 Objetivos Operacionais

| # | Objetivo | Indicador | Meta |
|---|----------|-----------|:----:|
| 1 | Inventário 100% dos ativos de TI | % do inventário cadastrado no SGTI | 100% |
| 2 | Rastreabilidade de responsável por ativo | % ativos com responsável vinculado | 100% |
| 3 | Controle de garantias vencendo | % ativos com alerta de garantia configurado | 100% |
| 4 | Controle de licenças | % licenças com contagem de uso atualizada | 100% |
| 5 | Prevenção de ativos sem requisição | % entregas com requisição vinculada | 100% |
| 6 | Controle financeiro (OPEX/CAPEX) | % ativos com classificação financeira | 100% |
| 7 | Sincronização com GLPI | Frequência de sync com divergências < 2% | Diária |
| 8 | Conformidade patrimonial | % ativos sem movimentação > 1 ano auditados | 100% semestral |
| 9 | Redução de ativos ociosos | % licenças com utilização < 20% identificadas | Relatório mensal |

### 2.3 Limites do Módulo

**O módulo ITAM:**
- Registra, controla e rastreia ativos de TI.
- Integra com GLPI como fonte oficial de inventário.
- Controla ciclo de vida completo (pedido → descarte).

**Não faz:**
- Não gerencia aprovações de compra (módulo Compras).
- Não gerencia contratos financeiros detalhados (módulo Financeiro).
- Não gerencia incidentes ou problemas (módulos específicos).

---

## 3. Papéis e Responsabilidades

### 3.1 Usuário (END_USER)

**No contexto de ativos:**
- Visualizar os ativos alocados a si mesmo.
- Reportar problemas com ativo via abertura de incidente.
- Confirmar recebimento ao aceitar entrega de ativo.
- Solicitar transferência de ativo via requisição.

**Limitações:** Não pode criar, editar ou mover ativos diretamente.

---

### 3.2 Analista de TI (IT_TECHNICIAN)

**Responsabilidades:**
- Registrar novos ativos recebidos no inventário.
- Executar alocação, desalocação e movimentação de ativos.
- Registrar manutenções preventivas e corretivas.
- Agendar e documentar envio para assistência técnica.
- Verificar e atualizar condição física dos ativos.
- Executar entregas e devoluções com registro completo.
- Sincronizar ativos recebidos com o GLPI.

---

### 3.3 Gestor de Patrimônio (papel funcional — IT_SPECIALIST)

**Perfil:** Coordenador ou Especialista responsável pelo controle patrimonial de TI.

**Responsabilidades:**
- Supervisionar o inventário completo e garantir integridade dos dados.
- Executar auditorias físicas periódicas de ativos.
- Coordenar o processo de descomissionamento e descarte.
- Reconciliar divergências entre SGTI e GLPI.
- Gerar relatórios de inventário para Compliance e Financeiro.
- Controlar o ciclo de vida dos ativos estratégicos.
- Aprovar movimentações entre unidades/localizações.

---

### 3.4 Gestor de Compras (FINANCIAL_ANALYST / IT_MANAGER)

**No contexto de ativos:**
- Acompanhar recebimento de ativos oriundos de pedidos de compra.
- Verificar que todo bem recebido está cadastrado no inventário.
- Controlar documentação fiscal (NF) vinculada a cada ativo.
- Gerar relatórios de CAPEX para o financeiro corporativo.

---

### 3.5 Coordenador de TI (IT_SPECIALIST)

**Responsabilidades adicionais:**
- Aprovar descomissionamento de ativos.
- Gerenciar o inventário de licenças de software.
- Definir parâmetros de categorias e campos customizados.
- Validar inventário pós-auditoria física.

---

### 3.6 Gestor de TI (IT_MANAGER)

**Responsabilidades:**
- Aprovar descomissionamento de ativos de alto valor.
- Revisar relatórios executivos de inventário e custos.
- Tomar decisões de renovação ou substituição de ativos estratégicos.
- Autorizar descarte e doação de ativos descomissionados.
- Monitorar KPIs de inventário no dashboard executivo.

---

### 3.7 Analista de Compliance (COMPLIANCE_OFFICER)

**No contexto de ativos:**
- Realizar auditorias patrimoniais para fins de conformidade.
- Verificar rastreabilidade de ativos vinculados a dados sensíveis.
- Garantir conformidade LGPD no descarte de ativos com dados pessoais.
- Revisar processos de sanitização de dados em ativos descartados.

---

### 3.8 Administrador (SUPER_ADMIN)

**Responsabilidades:**
- Configurar categorias, campos customizados e taxonomia.
- Gerenciar parâmetros de integração com GLPI.
- Executar operações privilegiadas de correção de inventário.
- Auditar o módulo com acesso completo ao audit_log.

---

## 4. Categorias de Ativos

### 4.1 Hardware — Computadores e Workstations

| Subcategoria | Vida Útil Padrão | Depreciação | Campos Específicos |
|:------------:|:----------------:|:-----------:|-------------------|
| **Notebook** | 3 anos | Linear | Processador, RAM, SSD/HDD, bateria, resolução display, peso |
| **Desktop** | 4 anos | Linear | Processador, RAM, HDD/SSD, placa de vídeo, fator de forma |
| **Monitor** | 5 anos | Linear | Tamanho (pol.), resolução, tipo de painel, conectores |
| **Workstation** | 4 anos | Linear | Processador Xeon/ThreadRipper, RAM ECC, GPU profissional |
| **Thin Client** | 5 anos | Linear | Processador, RAM, SO embarcado, conectores |

### 4.2 Hardware — Impressão e Digitalização

| Subcategoria | Vida Útil | Depreciação | Campos Específicos |
|:------------:|:---------:|:-----------:|-------------------|
| **Impressora** | 5 anos | Linear | Tipo (laser/jato/térmica), PPM, conectividade (rede/USB), consumíveis |
| **Scanner** | 5 anos | Linear | DPI, velocidade (PPM), ADF, tipo (flatbed/alimentador) |
| **Multifuncional** | 5 anos | Linear | Funções (impressão/cópia/scan/fax), PPM, conectividade |

### 4.3 Hardware — Infraestrutura e Rede

| Subcategoria | Vida Útil | Depreciação | Campos Específicos |
|:------------:|:---------:|:-----------:|-------------------|
| **Servidor** | 5 anos | Linear | Processador, RAM, storage, slots, gerenciamento remoto (iDRAC/iLO) |
| **Storage** | 5 anos | Linear | Capacidade total, tipo (SAN/NAS/DAS), RAID, expansibilidade |
| **Switch** | 7 anos | Linear | Portas, velocidade (GbE/10GbE), gerenciável, PoE |
| **Firewall/UTM** | 5 anos | Linear | Throughput, UTM, VPN, IDS/IPS |
| **Access Point** | 5 anos | Linear | Padrão Wi-Fi (802.11ax/ac), bandas, PoE, controlador |
| **Roteador** | 5 anos | Linear | WAN ports, LAN ports, VPN, throughput |
| **Rack / No-break** | 10 anos | Linear | Tamanho (U), capacidade (kVA), autonomia (min.) |

### 4.4 Periféricos

| Subcategoria | Vida Útil | Classificação | Campos Específicos |
|:------------:|:---------:|:-------------:|-------------------|
| **Mouse** | 2 anos | OPEX | Tipo (com fio/sem fio/vertical), DPI, conexão |
| **Teclado** | 3 anos | OPEX | Tipo (membrana/mecânico/ergonômico), layout, conexão |
| **Headset** | 2 anos | OPEX | Tipo (over-ear/on-ear), conexão, cancelamento de ruído, microfone |
| **Webcam** | 3 anos | OPEX | Resolução (HD/FHD/4K), FPS, campo de visão, microfone integrado |
| **Dock Station** | 3 anos | CAPEX | Conexões suportadas, potência de carga, compatibilidade |
| **Adaptadores** | — | OPEX | Tipo (USB-C/HDMI/DisplayPort), velocidade, fabricante |

> **Nota:** Periféricos de valor < R$200,00 são registrados com dados simplificados (nome + tipo + asset_tag opcional). Periféricos de valor ≥ R$200,00 recebem registro completo.

### 4.5 Software e Licenças

| Subcategoria | Tipo | Controle Principal |
|:------------:|:----:|:------------------:|
| **Sistema Operacional** | CAPEX (licença perpétua) / OPEX (assinatura) | Versão, chave, vínculos com hardware |
| **Aplicativos Corporativos** | CAPEX / OPEX | Quantidade licenças, usuários ativos, expiração |
| **Ferramentas de Produtividade** | OPEX | Licenças por usuário, utilização, expiração |
| **Ferramentas de Segurança** | OPEX | Quantidade dispositivos cobertos, expiração |
| **Ferramentas de Desenvolvimento** | OPEX | Licenças por desenvolvedor, tipo (named/concurrent) |
| **Banco de Dados** | CAPEX / OPEX | Tipo (core/usuário), versão, manutenção |

### 4.6 Serviços Contratados

| Subcategoria | Tipo | Controle Principal |
|:------------:|:----:|:------------------:|
| **SaaS** | OPEX | Contratos por usuário/mês, utilização, renovação |
| **IaaS / PaaS (Cloud)** | OPEX | Custo por mês, recursos provisionados, otimização |
| **Hospedagem** | OPEX | Domínios, certificados, storage, bandwidth |
| **Suporte / Manutenção** | OPEX | Vigência, SLA contratado, horas cobertas |
| **Conectividade** | OPEX | Link, velocidade, operadora, MPLS, vigência |

---

## 5. Estrutura do Ativo

### 5.1 Seção: Identificação

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **Código Patrimonial** (asset_tag) | String (50) | Sim | Não após criar | Identificador único no tenant. Ex.: `NB-2026-0042`, `SW-2026-001`. Formato configurável por categoria. Imutável. |
| **Número de Série** | String (100) | Não (obrigatório para hardware) | Analista | Serial do fabricante. Único por tenant quando preenchido. |
| **ID GLPI** | Inteiro | Não — automático | Não | Identificador no GLPI (preenchido na sincronização). Imutável após preenchido. |
| **Código de Barras / QR** | String | Não | Analista | Código para leitura óptica (gerado pelo sistema ou cadastrado manualmente). |

### 5.2 Seção: Identificação do Item

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **Nome** | String (300) | Sim | Analista | Nome descritivo: Fabricante + Modelo + specs principais. Ex.: "Notebook Dell XPS 15 i9/32GB/1TB". |
| **Categoria** | FK — AssetCategory | Sim | Não após criar | Categoria do ativo. Define campos customizados disponíveis. |
| **Fabricante** | String (200) | Sim (hardware) | Analista | Nome do fabricante. Ex.: Dell Technologies, HP, Cisco. |
| **Modelo** | String (200) | Sim (hardware) | Analista | Modelo específico. Ex.: XPS 9520, LaserJet Pro M404n. |
| **Número de Parte** | String (100) | Não | Analista | Part number do fabricante para peças de reposição. |
| **Campos Customizados** | JSONB | Conforme categoria | Analista | Campos específicos da categoria: processador, RAM, disco, resolução, etc. |

### 5.3 Seção: Datas de Ciclo de Vida

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **Data de Aquisição** | Date | Sim | Analista | Data da compra/contratação. Usado para cálculo de depreciação. |
| **Data de Entrada no Inventário** | Date | Sim — automático | Não | Data em que o ativo foi cadastrado no SGTI. Preenchido pelo sistema. |
| **Data de Início de Uso** | Date | Não | Analista | Data da primeira alocação ao usuário. |
| **Data de Fim de Vida Útil** | Date | Não — calculado | Não | Data de aquisição + vida útil da categoria. Calculado automaticamente. |
| **Data de Descomissionamento** | Date | Não — automático | Não | Preenchido ao mudar status para DECOMMISSIONED. |
| **Data de Descarte** | Date | Não — automático | Não | Preenchido ao mudar status para DISPOSED. |

### 5.4 Seção: Financeiro

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **Valor de Aquisição** | Decimal (15,2) | Sim | Analista, Financeiro | Valor pago na aquisição. Base para depreciação e controle patrimonial. |
| **Valor Atual** | Decimal (15,2) | Sim — calculado | Não | Valor após depreciação acumulada. Calculado automaticamente pelo sistema. |
| **Classificação Financeira** | Enum | Sim | Analista, Financeiro | `CAPEX` (investimento) ou `OPEX` (despesa operacional). |
| **Centro de Custo** | FK — CostCenter | Sim | Analista, Financeiro | Centro de custo responsável pelo ativo. Obrigatório. |
| **Nota Fiscal** | String (100) | Não | Analista | Número da NF de aquisição para rastreabilidade fiscal. |
| **Fornecedor** | FK — Supplier | Não | Analista | Fornecedor que vendeu o ativo. |
| **Contrato** | FK — Contract | Não | Analista, Financeiro | Contrato de aquisição ou manutenção vinculado. |
| **Projeto** | FK — Project | Não | Analista, Financeiro | Projeto ao qual o ativo foi alocado como investimento. |

### 5.5 Seção: Garantia

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **Início da Garantia** | Date | Não | Analista | Data de início da cobertura. |
| **Fim da Garantia** | Date | Não | Analista | Data de vencimento. Usado para alertas automáticos. |
| **Fornecedor da Garantia** | String (200) | Não | Analista | Empresa responsável pelo suporte em garantia. |
| **Tipo de Garantia** | Enum | Não | Analista | `FABRICANTE`, `REVENDEDOR`, `SEGURO`, `EXTENDED`. |
| **Número do Contrato de Garantia** | String (100) | Não | Analista | Número do contrato ou protocolo de garantia. |

### 5.6 Seção: Localização e Status

| Campo | Tipo | Obrigatório | Editável | Descrição |
|-------|------|:-----------:|:--------:|-----------|
| **Status** | Enum | Sim | Conforme ciclo | `ORDERED`, `RECEIVED`, `IN_STOCK`, `ALLOCATED`, `IN_USE`, `UNDER_MAINTENANCE`, `DECOMMISSIONED`, `DISPOSED`. |
| **Localização** | String (300) | Sim | Analista | Localização física atual: unidade + andar + sala. Ex.: "SP — Paulista, Andar 3, Sala 301". |
| **Departamento** | FK — Department | Não | Analista | Departamento ao qual o ativo está vinculado. |
| **Responsável** | FK — User | Condicional | Analista | Usuário responsável pelo ativo. Obrigatório para status IN_USE e ALLOCATED. |
| **Tags** | Array String | Não | Analista | Tags livres para agrupamento e busca. Ex.: `["home-office", "executivo", "projeto-x"]`. |
| **Observações** | Texto | Não | Analista | Notas gerais sobre o ativo. |

### 5.7 Status do Ciclo de Vida

```
CICLO DE VIDA DE UM ATIVO

ORDERED      → Pedido de compra emitido; ativo ainda não recebido
    │
RECEIVED     → Ativo recebido fisicamente; aguarda cadastro completo
    │
IN_STOCK     → Cadastrado no inventário; disponível para entrega
    │
ALLOCATED    → Reservado para entrega; técnico separou para o usuário
    │
IN_USE       → Em uso pelo responsável atribuído
    │
    ├── UNDER_MAINTENANCE → Em manutenção (preventiva ou corretiva)
    │           │
    │           └── Retorna para IN_USE ou IN_STOCK após manutenção
    │
DECOMMISSIONED → Descomissionado; sem uso; aguardando destinação
    │
DISPOSED       → Descartado, doado ou alienado formalmente
                 (Estado terminal — somente leitura)
```

**Transições permitidas:**

| De | Para | Quem | Condição |
|----|------|:----:|---------|
| ORDERED | RECEIVED | Analista | Confirmação de recebimento físico |
| RECEIVED | IN_STOCK | Analista | Cadastro completo + asset_tag |
| IN_STOCK | ALLOCATED | Analista | Reserva para entrega com requisição |
| ALLOCATED | IN_USE | Analista | Entrega executada + aceite do usuário |
| IN_USE | IN_STOCK | Analista | Devolução pelo usuário |
| IN_USE | UNDER_MAINTENANCE | Analista | Agendamento de manutenção |
| IN_STOCK | UNDER_MAINTENANCE | Analista | Manutenção preventiva |
| UNDER_MAINTENANCE | IN_USE | Analista | Manutenção concluída (ativo em uso) |
| UNDER_MAINTENANCE | IN_STOCK | Analista | Manutenção concluída (retornou ao estoque) |
| IN_STOCK | DECOMMISSIONED | Coordenador (req. Gestor) | Processo de descomissionamento aprovado |
| DECOMMISSIONED | DISPOSED | IT_MANAGER | Destinação finalizada (descarte/doação) |

---

## 6. Integração com GLPI — Fonte Oficial

### 6.1 GLPI como Fonte de Autoridade do Inventário

**Princípio fundamental:** O GLPI é a **fonte oficial dos ativos de TI** da organização. O SGTI consome e complementa os dados do GLPI, mas não os substitui como registro patrimonial.

| Aspecto | GLPI | SGTI |
|---------|:----:|:----:|
| Registro patrimonial oficial | ✅ Fonte primária | Espelho + complemento |
| Dados de gestão (responsável, SLA, incidentes) | Limitado | ✅ Fonte primária |
| Integração com tickets/chamados | Nativo | Via sincronização |
| Controle de movimentação e entrega | Limitado | ✅ Fonte primária |
| Controle financeiro e CAPEX/OPEX | Não | ✅ Fonte primária |

### 6.2 Frequência e Tipo de Sincronização

| Tipo | Frequência | Direção | Escopo |
|:----:|:----------:|:-------:|--------|
| **Sincronização Incremental** | Diária (02h00) | GLPI → SGTI | Ativos criados ou alterados no GLPI nas últimas 24h |
| **Sincronização Completa** | Semanal (domingo 03h00) | GLPI → SGTI | Todo o inventário do GLPI vs. SGTI |
| **Sincronização Manual** | Sob demanda (IT_MANAGER+) | GLPI → SGTI | Escopo configurável: tipo, localização, período |
| **Push de Ticket** | Imediato (ao abrir incidente) | SGTI → GLPI | Tickets de incidente espelhados no GLPI |

### 6.3 Campos Sincronizados do GLPI para o SGTI

| Campo GLPI | Campo SGTI | Observação |
|-----------|-----------|-----------|
| `itemtype` | `category` | Mapeamento configurável (Computer → Notebook/Desktop) |
| `name` | `name` | Sobrescreve se GLPI tiver nome mais completo |
| `serial` | `serial_number` | — |
| `otherserial` | `asset_tag` | Etiqueta patrimonial GLPI → SGTI |
| `entities_id` | `department_id` | Mapeamento de entidade GLPI → departamento SGTI |
| `locations_id` | `location` | Mapeamento de localização GLPI → texto SGTI |
| `users_id_tech` | — | Não sincronizado (gerenciado pelo SGTI) |
| `manufacturers_id` | `manufacturer` | — |
| `computermodels_id` | `model` | — |

### 6.4 Campos de Domínio Exclusivo do SGTI (não sobrescritos pelo GLPI)

Os seguintes campos são gerenciados exclusivamente pelo SGTI e nunca sobrescritos pela sincronização:

- `assignee_id` (responsável pelo ativo)
- `cost_center_id` (centro de custo)
- `purchase_value` / `current_value` (valores financeiros)
- `warranty_start` / `warranty_end` (garantia)
- `classification` (CAPEX/OPEX)
- `project_id` (projeto vinculado)
- `AssetAssignment` (histórico de atribuições)
- `AssetMovement` (histórico de movimentações)

### 6.5 Tratamento de Inconsistências

| Tipo de Inconsistência | Tratamento |
|------------------------|-----------|
| Ativo no GLPI, ausente no SGTI | Criado automaticamente no SGTI com dados do GLPI |
| Ativo no SGTI, ausente no GLPI | Registrado como `sync_status = CONFLICT`; Gestor notificado |
| Campos divergentes (nome, serial, localização) | GLPI prevalece; diferença registrada em `glpi_data_snapshot` |
| Ativo no GLPI com status inconsistente com SGTI | Alerta ao Gestor de Patrimônio; resolução manual |

### 6.6 Consulta de Ativos do GLPI em Outros Módulos

Durante atendimento de incidentes, problemas ou execução de requisições, o técnico pode buscar ativos diretamente no GLPI via modal integrado:

```
Modal "Buscar no GLPI"
  Campos de busca: nome, serial, etiqueta, tipo, localização, usuário responsável
  Resultado: lista com dados GLPI + status de sincronização com SGTI
  Ação: "Importar para SGTI" → cria/atualiza registro local e vincula ao chamado
```

### 6.7 Circuit Breaker da Integração GLPI

- 5 falhas consecutivas de sincronização → circuit breaker ativado.
- Durante 15 minutos: tentativas suspensas; IT_MANAGER notificado.
- Após 15 minutos: tentativa automática; se bem-sucedida, circuit breaker fechado.
- Falhas de integração nunca bloqueiam operações do SGTI.

---

## 7. Controle de Entregas

### 7.1 Fluxo Completo de Entrega de Ativo

```
 ETAPA 1: SOLICITAÇÃO
 ─────────────────────
 Gestor ou usuário abre requisição de equipamento (módulo Requisições)
 Tipo: REQ-TYPE-006 (Notebook), REQ-TYPE-007 (Desktop), etc.
 Aprovações: Gestor → Financeiro (se CAPEX) → TI
                  │
                  ▼
 ETAPA 2: RESERVA
 ──────────────────
 Técnico recebe requisição APPROVED na fila de execução.
 Verifica estoque no inventário SGTI:

   ┌─ Ativo disponível em estoque:
   │   → Status do ativo: IN_STOCK → ALLOCATED
   │   → Campo `reserved_for_request_id` preenchido
   │   → Usuário beneficiário notificado de previsão de entrega
   │
   └─ Sem estoque:
       → Abrir demanda no módulo Compras
       → Aguardar recebimento físico
       → Ao receber: cadastrar no inventário → ALLOCATED
                  │
                  ▼
 ETAPA 3: PREPARAÇÃO
 ─────────────────────
 Técnico prepara o ativo para entrega:
   Hardware:
     → Instalação e configuração do SO padrão corporativo
     → Integração ao domínio Active Directory / Google Workspace
     → Instalação dos softwares do portfólio
     → Teste completo de hardware e software
     → Afixação da etiqueta patrimonial (asset_tag)
     → Foto do estado do ativo antes da entrega (opcional)

   Software/Licença:
     → Ativação da licença para o usuário
     → Confirmação de acesso no sistema licenciado
                  │
                  ▼
 ETAPA 4: ENTREGA FÍSICA
 ─────────────────────────
 Técnico entrega ao usuário/beneficiário e registra no SGTI:
   → Ativo vinculado (asset_id obrigatório)
   → Condição na entrega: NEW / GOOD / REGULAR / DAMAGED
   → Notas de entrega (mín. 10 chars)
   → Status: IN_USE
   → AssetAssignment criado: assigned_at, assigned_by, condition_on_assign
   → Requisição de origem: REQ vinculada
   → Requisição marcada como FULFILLED
                  │
                  ▼
 ETAPA 5: ACEITE FORMAL DO USUÁRIO
 ──────────────────────────────────
 Sistema envia notificação ao usuário:
   "O ativo {nome} ({asset_tag}) foi entregue. Confirme o recebimento."

   ┌─ Usuário confirma dentro de 48h:
   │   → Campo `termo_responsabilidade = true`
   │   → CSAT opcional
   │   → Requisição → CLOSED
   │   → AuditLog: action = ASSET_ACCEPTANCE_SIGNED
   │
   ├─ Usuário reporta problema:
   │   → Requisição retorna IN_PROGRESS
   │   → Técnico notificado com detalhe do problema
   │
   └─ Sem resposta em 48h:
       → Aceite implícito registrado automaticamente
       → AuditLog: action = ASSET_ACCEPTANCE_IMPLICIT
       → Requisição → CLOSED
```

### 7.2 Termo de Responsabilidade Digital

O aceite do usuário constitui o Termo de Responsabilidade Digital. O sistema registra:

| Campo | Conteúdo |
|-------|---------|
| Ativo | Nome, asset_tag, número de série, modelo |
| Responsável | user_id + nome de exibição + matrícula |
| Departamento | Departamento atual do usuário |
| Data e hora do aceite | Timestamp UTC |
| Condição na entrega | NEW / GOOD / REGULAR |
| Localização de uso | Campo preenchido pelo técnico |
| Requisição vinculada | REQ-YYYY-NNNNNN |
| IP do aceite | Endereço IP do usuário no momento do aceite |
| Evidência digital | Hash SHA-256 dos dados acima |

O PDF do Termo de Responsabilidade pode ser gerado pelo IT_MANAGER a qualquer momento.

---

## 8. Controle de Devoluções

### 8.1 Situações de Devolução

| Motivo | Processo | Urgência |
|--------|---------|:--------:|
| Desligamento do colaborador | Obrigatório no último dia de trabalho | Urgente |
| Transferência de setor/unidade | Avaliação caso a caso | Normal |
| Substituição por equipamento novo | Simultâneo com entrega do novo | Normal |
| Manutenção corretiva | Temporário; retorna após reparo | Variável |
| Excesso de ativo | Otimização de inventário | Planejado |

### 8.2 Fluxo Completo de Devolução

```
 ETAPA 1: NOTIFICAÇÃO
 ─────────────────────
 Analista ou gestor identifica necessidade de devolução.
 Ou: Sistema alerta automaticamente ao detectar desligamento pendente
 (integração com módulo de Identidades).
                  │
                  ▼
 ETAPA 2: INSPEÇÃO FÍSICA
 ──────────────────────────
 Técnico recebe o ativo e inspeciona:
   → Condição física: GOOD / REGULAR / DAMAGED / LOST
   → Acessórios incluídos: carregador, bolsa, mouse, teclado
   → Funcionamento básico testado (liga, acessa sistema)
   → Foto do estado do ativo na devolução (recomendado)
                  │
                  ▼
 ETAPA 3: REGISTRO DA DEVOLUÇÃO
 ──────────────────────────────
 Técnico registra no SGTI:
   → AssetAssignment.returned_at = NOW()
   → AssetAssignment.condition_on_return = GOOD/REGULAR/DAMAGED
   → AssetAssignment.returned_by = técnico
   → Status do ativo: IN_USE → IN_STOCK
   → Campo de observações preenchido (se houver dano)
   → AuditLog: action = ASSET_RETURNED
                  │
                  ├─ Condição DAMAGED:
                  │   → Incidente aberto automaticamente (prioridade MÉDIO)
                  │   → Notificação ao IT_MANAGER e RH
                  │   → Ativo: status = UNDER_MAINTENANCE
                  │
                  ├─ Condição LOST:
                  │   → Ocorrência registrada no Compliance
                  │   → Boletim de ocorrência (protocolo RH)
                  │   → Ativo: status = DECOMMISSIONED (com observação "PERDIDO")
                  │
                  └─ Condição GOOD / REGULAR:
                      → Ativo retorna ao estoque (IN_STOCK)
                      → Disponível para nova entrega
                  │
                  ▼
 ETAPA 4: SANITIZAÇÃO (obrigatória para desligamento)
 ────────────────────────────────────────────────────
 Para devoluções por desligamento:
   → Formatação segura do HD/SSD (DoD 5220.22-M ou equivalente)
   → Log de sanitização gerado e armazenado como evidência
   → Campo `data_sanitizacao` preenchido
   → Evidência de sanitização vinculada ao ativo para compliance LGPD
```

---

## 9. Controle de Movimentações

### 9.1 Tipos de Movimentação Registrada

| Tipo | Gatilho | Campos Obrigatórios |
|:----:|---------|:------------------:|
| **Troca de Usuário** | Devolução seguida de nova entrega | De → Para (usuários) + condição + motivo |
| **Troca de Departamento** | Transferência com mesmo usuário | De → Para (departamentos) + data + motivo |
| **Troca de Unidade** | Transferência entre unidades físicas | De → Para (unidades) + aprovação do Gestor |
| **Transferência Física** | Mudança de localização sem troca de responsável | De → Para (localizações) + motivo |
| **Envio para Manutenção** | Envio à assistência técnica | Fornecedor de manutenção + protocolo + previsão de retorno |
| **Retorno de Manutenção** | Retorno ao inventário após reparo | Condição pós-manutenção + relatório técnico |
| **Transferência entre Projetos** | Ativo realocado para projeto diferente | Projeto de origem → destino + aprovação |

### 9.2 Estrutura do Registro de Movimentação (AssetMovement)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| `asset_id` | UUID | Sim | Ativo movimentado |
| `movement_type` | Enum | Sim | Tipo da movimentação (tabela acima) |
| `from_location` | String | Sim | Localização de origem (texto livre) |
| `to_location` | String | Sim | Localização de destino |
| `from_user_id` | UUID | Condicional | Usuário de origem (para troca de usuário) |
| `to_user_id` | UUID | Condicional | Usuário destino |
| `from_department_id` | UUID | Condicional | Departamento de origem |
| `to_department_id` | UUID | Condicional | Departamento destino |
| `moved_at` | DateTime | Sim | Timestamp da movimentação |
| `reason` | String | Sim | Motivo da movimentação (mín. 20 chars) |
| `moved_by` | UUID | Sim — automático | Usuário que registrou |
| `approved_by` | UUID | Condicional | Para movimentações entre unidades |
| `request_id` | UUID | Condicional | Requisição que originou a movimentação |

### 9.3 Aprovação para Movimentações entre Unidades

Movimentações de ativos entre unidades distintas requerem aprovação do IT_MANAGER da unidade de destino antes de serem efetivadas. O sistema mantém a movimentação em status `PENDING_APPROVAL` até a aprovação.

---

## 10. Gestão de Licenças

### 10.1 Modelo de Licenciamento

| Tipo de Licença | Controle | Exemplo |
|:---------------:|---------|---------|
| **Por Usuário (Named)** | Licença vinculada a usuário específico | Adobe CC, AutoCAD |
| **Por Dispositivo** | Licença vinculada a hardware específico | Windows OEM, ArcGIS |
| **Concurrent (Flutuante)** | Quantidade máxima simultânea | MATLAB, SAS |
| **Enterprise (Site)** | Número ilimitado de usuários | Microsoft 365 E3 |
| **Por Core/CPU** | Baseada em hardware do servidor | SQL Server, Oracle DB |

### 10.2 Campos de Controle de Licença

| Campo | Tipo | Descrição |
|-------|------|-----------|
| **Produto** | String | Nome do software |
| **Fabricante** | String | Empresa fabricante |
| **Versão** | String | Versão específica da licença |
| **Tipo de Licença** | Enum | Named / Device / Concurrent / Enterprise / Core |
| **Quantidade Adquirida** | Inteiro | Total de licenças compradas no contrato |
| **Quantidade em Uso** | Inteiro — automático | Calculado pelo sistema baseado em atribuições ativas |
| **Quantidade Disponível** | Inteiro — automático | Adquirida − Em Uso |
| **Data de Expiração** | Date | Data de vencimento da licença |
| **Chave de Licença** | String (criptografada) | Chave de ativação (armazenada de forma segura) |
| **Contrato** | FK — Contract | Contrato de licenciamento vinculado |
| **Taxa de Utilização** | Decimal — automático | Em Uso / Adquirida × 100 |

### 10.3 Alertas de Licença

| Condição | Alerta | Destinatário |
|----------|:------:|:------------:|
| 90 dias antes da expiração | E-mail + in-app | IT_MANAGER |
| 60 dias antes da expiração | E-mail | IT_MANAGER |
| 30 dias antes da expiração | E-mail urgente | IT_MANAGER + Financeiro |
| 2 dias antes da expiração | E-mail crítico | IT_MANAGER + Financeiro |
| Utilização > 90% | In-app | IT_MANAGER (risco de exceder licenças) |
| Utilização < 20% por 3 meses consecutivos | E-mail mensal | IT_MANAGER (licença subutilizada) |
| Utilização atingiu 100% | Alerta imediato | IT_MANAGER (risco de violação de licença) |

### 10.4 Regra de Licença Subutilizada

Licenças com utilização < 20% por 3 meses consecutivos são candidatas a cancelamento:
1. Sistema gera relatório mensal com lista de licenças subutilizadas.
2. IT_MANAGER avalia e decide: manter, cancelar ou transferir.
3. Decisão de cancelar inicia requisição no módulo Compras.

---

## 11. Gestão de Garantias

### 11.1 Controle do Ciclo de Garantia

| Status da Garantia | Condição | Exibição |
|:-----------------:|---------|:--------:|
| **Vigente** | Data atual < `warranty_end` | 🟢 Verde |
| **A Vencer** | `warranty_end` entre hoje e 90 dias | 🟡 Amarelo |
| **Vencida** | Data atual > `warranty_end` | 🔴 Vermelho |
| **Sem Garantia** | Campo `warranty_end` não preenchido | ⚫ Cinza |

### 11.2 Alertas de Garantia

| Marco | Canal | Destinatário |
|:-----:|:-----:|:------------:|
| 90 dias antes do vencimento | In-app + e-mail | Analista responsável + IT_MANAGER |
| 60 dias antes do vencimento | In-app + e-mail | IT_MANAGER |
| 30 dias antes do vencimento | E-mail | IT_MANAGER + Financeiro |
| 2 dias antes do vencimento | E-mail urgente | IT_MANAGER + Financeiro |
| Garantia vencida há 7 dias | In-app | IT_MANAGER (para decisão de extensão) |

### 11.3 Histórico de Acionamentos de Garantia

Cada acionamento de garantia (envio para reparo sob garantia) é registrado:

| Campo | Descrição |
|-------|-----------|
| Data do acionamento | Quando foi enviado para reparo |
| Protocolo do fabricante | Número do protocolo de suporte |
| Motivo/Defeito | Descrição do problema |
| Data de retorno | Quando retornou após reparo |
| Peças substituídas | Lista de componentes trocados |
| Resultado | Resolvido / Substituído / Recusado |
| Custo (se fora de garantia) | Valor cobrado pelo reparo |

O histórico de acionamentos é consultável na página do ativo e usado como dado para decisão de descomissionamento.

---

## 12. Gestão de Contratos de Ativo

### 12.1 Tipos de Contrato Vinculável

| Tipo | Exemplos | Campos-Chave |
|:----:|---------|:------------:|
| **Manutenção / Suporte** | Dell Support, HPE Care Pack | Vigência, SLA contratado, horas cobertas |
| **Licença** | Microsoft EA, Adobe VIP | Vigência, quantidade, plataforma |
| **Leasing** | Leasing de equipamentos | Vigência, valor mensal, opção de compra |
| **Serviço Gerenciado** | MDM, antivírus gerenciado | Vigência, escopo de dispositivos, SLA |
| **Conectividade** | MPLS, link dedicado | Vigência, velocidade, SLA, valor mensal |

### 12.2 Alertas de Vencimento de Contrato

Mesmos marcos de alerta das garantias: 90, 60, 30 e 2 dias antes do vencimento.

### 12.3 Renovação de Contrato

Ao detectar contrato com `auto_renew = true`:
- Sistema alerta `alert_days_before` dias antes do vencimento (padrão: 90 dias).
- IT_MANAGER tem `alert_days_before` dias para decidir renovar ou não.
- Sem ação: contrato é renovado automaticamente e evento `ContractRenewed` é registrado.
- Com ação de cancelamento: módulo Compras é acionado para renegociação.

---

## 13. Integração com Requisições

### 13.1 Regras Obrigatórias de Rastreabilidade

**Regra 1:** Toda entrega de equipamento (hardware) deve ter uma requisição aprovada vinculada no SGTI. Entrega sem requisição é proibida.

**Regra 2:** Todo periférico entregue deve ter requisição vinculada. Não há exceção.

**Regra 3:** Toda devolução de ativo deve ser registrada com data, condição e responsável pelo registro.

### 13.2 Vínculo Bidirecional Requisição ↔ Ativo

| Na Requisição | No Ativo |
|:-------------:|:--------:|
| Campo `asset_id` preenchido ao concluir | Campo `request_id` (de origem) preenchido ao ser criado |
| Histórico de entregas visível | Requisições que geraram ou modificaram o ativo visíveis |
| Notas de cumprimento incluem asset_tag | Histórico de movimentação referencia requisições |

### 13.3 Ativo Criado a Partir de Compra

Quando um pedido de compra é recebido (módulo Compras), o ativo é criado automaticamente no inventário:

```
PurchaseItem.received_quantity > 0 → AssetCreated event →
  Asset.status = RECEIVED
  Asset.purchase_value = purchase_item.unit_price
  Asset.supplier_id = purchase_order.supplier_id
  Asset.request_id = related_service_request_id
```

---

## 14. Integração com Incidentes

### 14.1 Vinculação de Ativo a Incidente

Durante o atendimento de incidente, o técnico pode vincular o ativo afetado. Efeitos:

- Histórico do ativo exibe todos os incidentes vinculados com datas e soluções.
- MTBF (Mean Time Between Failures) calculado automaticamente por ativo.
- Se o mesmo ativo tiver > 2 incidentes abertos: alerta de "ativo problemático" ao técnico.

### 14.2 Pausa Automática de SLA

Quando ativo vinculado ao incidente entra em `UNDER_MAINTENANCE`:
- SLA do incidente pausado automaticamente (motivo: `ASSET_UNDER_MAINTENANCE`).
- Retomada automática quando manutenção é concluída.

### 14.3 Substituto Temporário

Se o ativo principal está em manutenção e o usuário precisa de equipamento substituto, o técnico pode vincular um segundo ativo temporariamente ao incidente via campo "Ativo Substituto".

---

## 15. Integração com Problemas

### 15.1 Vinculação de Ativo a Problema

Quando a causa raiz de um problema está relacionada a um ativo específico:

- O ativo é vinculado ao problema via campo `related_assets`.
- O histórico do ativo exibe o problema vinculado com causa raiz documentada.
- Se o problema for de hardware em série (mesmo modelo com falha recorrente), o sistema agrupa os ativos afetados e sugere alerta ao fabricante.

### 15.2 Flag de "Ativo Problemático"

Ativo vinculado a problema com prioridade CRÍTICO recebe flag visível no inventário, alertando futuros técnicos sobre histórico de problemas sérios.

---

## 16. Integração com Compliance

### 16.1 Auditoria Patrimonial

O módulo suporta auditorias patrimoniais periódicas:

**Processo de Auditoria Física:**
```
1. IT_MANAGER agenda ciclo de auditoria (mensal, trimestral, semestral)
2. Sistema gera lista de ativos esperados por localização
3. Auditor percorre fisicamente e confirma cada ativo:
   → Ativo encontrado e OK: ✅ Confirmado
   → Ativo encontrado com dano: ⚠️ Discrepância
   → Ativo não encontrado: ❌ Não localizado
4. Sistema gera relatório de divergências
5. Divergências são tratadas:
   → Não localizado → investigação + NC de compliance
   → Com dano → incidente de manutenção aberto
6. Relatório de auditoria arquivado como evidência de compliance
```

### 16.2 Sanitização de Dados em Descartes (LGPD)

Todo ativo descartado que contenha dados pessoais (notebooks, desktops, servidores, pendrives):

1. Sanitização obrigatória antes do descarte (DoD 5220.22-M ou equivalente certificado).
2. Relatório de sanitização gerado e assinado pelo técnico responsável.
3. Relatório arquivado como evidência no módulo de Compliance.
4. Campo `data_sanitizacao` preenchido no registro do ativo.
5. Status → DISPOSED somente após sanitização confirmada.

### 16.3 Rastreabilidade para ISO 27001

O módulo mantém para fins de auditoria ISO 27001:
- Inventário completo de ativos de TI (Controle A.8.1.1).
- Responsável por cada ativo (A.8.1.2).
- Uso aceitável documentado (A.8.1.3).
- Devolução de ativos ao desligar (A.8.1.4).
- Sanitização e descarte seguros (A.8.3.2).

---

## 17. Classificação Financeira — OPEX e CAPEX

### 17.1 Regra de Classificação

**Todo ativo deve ter classificação financeira obrigatória:** `CAPEX` ou `OPEX`.

| Critério | CAPEX | OPEX |
|----------|:-----:|:----:|
| Natureza do gasto | Investimento (cria ativo) | Despesa (mantém operação) |
| Vida útil | > 1 ano | ≤ 1 ano ou recorrente |
| Exemplos | Notebook, servidor, switch, software perpétuo | Mouse, headset, licença mensal, SaaS |
| Tratamento contábil | Ativado e depreciado | Lançado diretamente como despesa |
| Impacto no balanço | Aparece no ativo permanente | Aparece no resultado do período |

### 17.2 Tabela de Classificação por Categoria

| Categoria | Classificação Padrão | Observação |
|-----------|:--------------------:|-----------|
| Notebook | CAPEX | Vida útil 3 anos |
| Desktop | CAPEX | Vida útil 4 anos |
| Monitor | CAPEX | Vida útil 5 anos |
| Servidor / Storage | CAPEX | Vida útil 5 anos |
| Switch / Firewall / AP | CAPEX | Vida útil 5–7 anos |
| Impressora / Scanner | CAPEX | Vida útil 5 anos |
| Mouse / Teclado | OPEX | Vida útil ≤ 3 anos; valor baixo |
| Headset / Webcam | OPEX | Valor geralmente < R$500 |
| Licença Perpétua | CAPEX | Ativo intangível; amortização |
| Licença por Assinatura | OPEX | Renovação recorrente |
| SaaS / Cloud | OPEX | Despesa mensal |
| Serviço de Suporte | OPEX | Contrato recorrente |

---

## 18. Controle CAPEX

### 18.1 Ciclo de Vida Financeiro de um Ativo CAPEX

```
CAPEX — CICLO FINANCEIRO COMPLETO

1. AQUISIÇÃO
   → Data de aquisição registrada
   → Valor de aquisição registrado
   → Nota fiscal vinculada
   → CapexInvestment criado no módulo Financeiro
   → Budget.spent_amount atualizado

2. INÍCIO DA DEPRECIAÇÃO
   → Data de início: primeiro dia do mês seguinte à aquisição (padrão)
   → Método: LINEAR (STRAIGHT_LINE) ou SALDO DECRESCENTE (DECLINING_BALANCE)
   → Vida útil: conforme categoria do ativo
   → Cálculo mensal automático

3. CÁLCULO DA DEPRECIAÇÃO (método linear):
   Depreciação Anual = Valor de Aquisição / Anos de Vida Útil
   Depreciação Mensal = Depreciação Anual / 12
   Valor Atual = Valor de Aquisição − (Depreciação Mensal × Meses Decorridos)

4. BAIXA PATRIMONIAL
   → Ao descomissionar: valor atual registrado como zero na data
   → CapexInvestment.status = WRITTEN_OFF
   → Registro no módulo Financeiro

5. RELATÓRIO DE DEPRECIAÇÃO
   → Gerado mensalmente no primeiro dia útil
   → Disponível para Financeiro corporativo e auditoria
```

### 18.2 Controle por Projeto

Ativos CAPEX podem ser vinculados a projetos específicos:

- O custo do ativo é debitado do orçamento do projeto ao ser registrado.
- O dashboard do projeto exibe o ativo no portfólio de investimentos.
- Após o projeto, o ativo pode ser transferido para o inventário geral.

---

## 19. Controle OPEX

### 19.1 Ativos e Custos OPEX

Para ativos OPEX (licenças, SaaS, serviços), o controle financeiro acompanha:

| Métrica | Periodicidade | Fonte de Dados |
|---------|:------------:|:-------------:|
| Custo mensal recorrente | Mensal | Contrato + NF |
| Quantidade contratada vs. utilizada | Mensal | Inventário de licenças |
| Custo por usuário ativo | Mensal | Calculado: custo_total / usuários_ativos |
| Variação de custo mês a mês | Mensal | Comparativo automático |
| Projeção de custo anual | Anual | Baseado na média dos últimos 3 meses |

### 19.2 Otimização de Custos OPEX

O sistema identifica automaticamente oportunidades de redução de custos OPEX:

| Oportunidade | Detecção Automática | Ação Sugerida |
|:------------:|:------------------:|:-------------:|
| Licença subutilizada (< 20%) | Job mensal | Cancelar licença não utilizada |
| Serviço duplicado (mesmo produto, dois contratos) | Job semanal | Consolidar em um contrato |
| SaaS sem utilização por 60 dias | Job mensal | Revisar necessidade |
| Custo superior à média de mercado | Relatório trimestral | Renegociar contrato |

---

## 20. Controle de Custos

### 20.1 Visões de Custo Disponíveis

| Visão | Composição | Periodicidade |
|:-----:|-----------|:------------:|
| **Custo por Ativo** | TCO: aquisição + manutenções + contratos vinculados | Calculado dinamicamente |
| **Custo por Usuário** | Soma de todos os ativos alocados ao usuário (CAPEX depreciado + OPEX) | Mensal |
| **Custo por Departamento** | Soma dos custos de todos os ativos do departamento | Mensal |
| **Custo por Projeto** | Soma dos ativos CAPEX do projeto + OPEX de licenças do projeto | Por projeto |
| **Custo Total do Parque** | Soma de todos os ativos ativos (CAPEX valor atual + OPEX mensal × 12) | Calculado dinamicamente |

### 20.2 TCO — Total Cost of Ownership por Ativo

```
TCO do Ativo = Valor de Aquisição
             + Custos de Manutenção Acumulados
             + Custo de Suporte/Garantia (contratos vinculados)
             + Custo de Licença do SO (se aplicável)
             − Valor de Revenda Estimado (opcional)
```

O TCO é calculado dinamicamente ao consultar a página do ativo.

### 20.3 Benchmark de Custo por Usuário

O dashboard financeiro exibe o custo médio de TI por usuário e por departamento, permitindo ao IT_MANAGER identificar departamentos com custo de TI acima da média corporativa.

---

## 21. Dashboards Operacionais

### 21.1 Painel do Inventário em Tempo Real

**Destino:** Analistas, Coordenadores e Gestor. Atualizado via Supabase Realtime.

| Componente | Tipo | Dados Exibidos |
|------------|:----:|---------------|
| **Ativos por Status** | Contadores | IN_STOCK / ALLOCATED / IN_USE / UNDER_MAINTENANCE / DECOMMISSIONED |
| **Ativos por Categoria** | Barras | Top categorias por quantidade |
| **Ativos por Usuário** | Tabela | Top 10 usuários com mais ativos alocados |
| **Ativos por Departamento** | Pizza | Distribuição por departamento |
| **Ativos Sem Responsável** | Lista de alerta | Ativos IN_USE sem `assignee_id` |
| **Garantias Vencendo** | Lista urgente | Ativos com garantia expirando em ≤ 90 dias |
| **Licenças Críticas** | Lista | Licenças > 90% de utilização ou expirando em ≤ 30 dias |
| **Pendentes de Aceite** | Contador | Ativos entregues aguardando confirmação do usuário |
| **Sincronização GLPI** | Status | Último sync, itens sincronizados, divergências |

### 21.2 Indicadores Operacionais

| KPI | Fórmula | Meta |
|-----|---------|:----:|
| **Total de Ativos Ativos** | COUNT(status IN IN_STOCK, ALLOCATED, IN_USE, UNDER_MAINTENANCE) | — |
| **Taxa de Ativos em Uso** | COUNT(IN_USE) / COUNT(ativos ativos) × 100 | ≥ 80% |
| **Ativos Sem Responsável** | COUNT(status = IN_USE AND assignee_id IS NULL) | 0 |
| **Garantias Vencidas** | COUNT(warranty_end < TODAY AND status ≠ DECOMMISSIONED) | 0 |
| **Licenças Expiradas** | COUNT(license.expiry < TODAY AND status ≠ CANCELLED) | 0 |
| **Divergências com GLPI** | COUNT(sync_status = CONFLICT) | ≤ 10 |

---

## 22. Dashboards Executivos

### 22.1 Painel Financeiro de Ativos

**Destino:** IT_MANAGER e Diretoria/Financeiro.

| Indicador Executivo | Composição | Uso |
|--------------------|-----------|-----|
| **Valor Total do Parque Tecnológico** | Soma dos `current_value` de todos os ativos CAPEX ativos | Controle patrimonial |
| **CAPEX por Período** | Investimentos em ativos por trimestre/ano | Planejamento orçamentário |
| **OPEX por Período** | Custos recorrentes por mês/trimestre/ano | Controle de despesas |
| **Custos por Área** | Distribuição do custo total de TI por departamento/BU | Rateio e benchmarking |
| **Custos por Projeto** | Ativos CAPEX e OPEX por projeto | Controle de investimento por iniciativa |
| **Depreciação Acumulada** | Depreciação total acumulada do parque | Transparência fiscal |
| **Evolução do Parque** | Comparativo do valor do parque ao longo do tempo | Tendência de investimento |

### 22.2 Gráficos Executivos

| Gráfico | Tipo | Objetivo |
|---------|:----:|---------|
| CAPEX vs. OPEX por mês | Barras agrupadas | Composição do custo de TI |
| Distribuição de valor por categoria | Pizza | Onde está o valor do parque |
| Evolução do valor total do parque (12 meses) | Linha | Tendência de depreciação vs. novos investimentos |
| Top 10 ativos mais caros (TCO) | Tabela | Foco de manutenção e renovação |
| Mapa de calor: custo por departamento | Heatmap | Benchmarking de custo por área |

---

## 23. Relatórios

### 23.1 Relatórios Operacionais Automáticos

| Relatório | Geração | Destinatário | Conteúdo |
|-----------|:-------:|:------------:|---------|
| **Inventário Semanal** | Semanal (seg) | IT_MANAGER | Status geral: novos ativos, descomissionados, movimentações |
| **Ativos Sem Responsável** | Semanal | IT_MANAGER | Lista de ativos IN_USE sem responsável |
| **Garantias a Vencer (90 dias)** | Mensal | IT_MANAGER + Financeiro | Lista com asset_tag, modelo, data de vencimento |
| **Licenças a Vencer (60 dias)** | Mensal | IT_MANAGER + Financeiro | Lista com produto, quantidade, data, valor |
| **Licenças Subutilizadas** | Mensal | IT_MANAGER | Licenças < 20% de utilização nos últimos 3 meses |

### 23.2 Relatórios Gerenciais

| Relatório | Frequência | Destinatário | Conteúdo |
|-----------|:----------:|:------------:|---------|
| **Inventário Completo** | Mensal | IT_MANAGER | Todos os ativos com status, responsável, localização |
| **Ativos por Departamento** | Mensal | IT_MANAGER + Financeiro | Quantidade e valor por departamento |
| **Histórico de Movimentações** | Mensal | IT_MANAGER | Todas as movimentações do período |
| **Manutenções Realizadas** | Mensal | IT_MANAGER | Manutenções com custo, fornecedor e resultado |
| **Auditoria de Entregas/Devoluções** | Mensal | IT_MANAGER + Compliance | Entregas e devoluções com rastreabilidade |

### 23.3 Relatórios Executivos

| Relatório | Frequência | Destinatário | Conteúdo |
|-----------|:----------:|:------------:|---------|
| **Valor do Parque Tecnológico** | Trimestral | IT_MANAGER + Diretoria | CAPEX/OPEX, depreciação, valor atual total |
| **TCO por Categoria** | Trimestral | Financeiro + IT_MANAGER | Custo total de posse por tipo de ativo |
| **Relatório de Compliance Patrimonial** | Semestral | Compliance + IT_MANAGER | Ativos auditados, divergências, sanitizações |
| **Análise de Renovação** | Anual | IT_MANAGER + Diretoria | Ativos próximos ao fim da vida útil; plano de renovação |

---

## 24. Auditoria e Rastreabilidade

### 24.1 Eventos Auditados Obrigatoriamente

| Evento | `action` | Dados Capturados |
|--------|:--------:|:----------------:|
| Ativo criado | CREATE | Todos os campos iniciais |
| Campos atualizados | UPDATE | Campo alterado: old_value → new_value |
| Status alterado | UPDATE | Status anterior + novo + motivo |
| Ativo alocado a usuário | CREATE (AssetAssignment) | Usuário, condição, data, responsável pelo registro |
| Ativo desalocado | UPDATE (AssetAssignment) | Usuário, condição de devolução, data, responsável |
| Aceite digital do usuário | CREATE | user_id, IP, timestamp, asset_tag |
| Aceite implícito (48h) | CREATE | timestamp, contexto |
| Movimentação registrada | CREATE (AssetMovement) | De → para, tipo, motivo, registrado por |
| Manutenção agendada | CREATE (AssetMaintenance) | Tipo, data, fornecedor |
| Manutenção concluída | UPDATE | Resultado, custo, condição pós |
| Descomissionamento solicitado | UPDATE | Solicitado por, motivo |
| Descomissionamento aprovado | UPDATE | Aprovado por, data |
| Descarte executado | UPDATE (DISPOSED) | Método de descarte, data |
| Sanitização confirmada | UPDATE | Técnico, data, protocolo |
| Licença atribuída a usuário | CREATE | Usuário, produto, data |
| Licença revogada de usuário | UPDATE | Usuário, produto, data, motivo |
| Sincronização com GLPI | UPDATE | Campos sincronizados, timestamp |

### 24.2 Rastreabilidade do Ciclo de Vida Completo

Para qualquer ativo, a página do histórico exibe:

```
HISTÓRICO COMPLETO DO ATIVO NB-2026-0042 (Dell XPS 15)

Jan 15, 2026  📦 RECEBIDO — Ana Lima (Analista TI)
              Pedido de Compra: PO-2026-001 | NF: 12345 | Valor: R$8.500,00

Jan 17, 2026  🔧 CONFIGURADO — Ana Lima
              SO: Windows 11 Pro | Office 365 instalado | Ingressado no domínio

Jan 18, 2026  📤 ALOCADO — Ana Lima
              Para: João Silva | Departamento: Financeiro
              Condição na entrega: NOVO
              Aceite: João Silva (18/01/2026 09:42 — IP: 10.0.1.45)
              Requisição: REQ-2026-000015

Mar 05, 2026  🔴 INCIDENTE vinculado: INC-2026-000087
              VPN não conecta — Resolvido em 2h

Abr 12, 2026  🔧 MANUTENÇÃO — Dell Suporte Técnico
              Tipo: Corretiva | Motivo: Bateria não carrega
              Retorno: 19/04/2026 | Resultado: Bateria substituída (garantia)

Mai 10, 2026  🔄 MOVIMENTADO — Carlos Souza
              Localização: SP Paulista Andar 3 → SP Paulista Andar 5
              Motivo: Realocação de equipe
```

---

## 25. Compliance e Conformidade

### 25.1 Requisitos Obrigatórios por Regulação

| Regulação | Requisito | Atendimento pelo Módulo |
|-----------|-----------|------------------------|
| **ISO/IEC 27001** | A.8 — Gestão de Ativos (inventário, responsabilidade, uso aceitável, devolução, sanitização) | Inventário completo + histórico + sanitização documentada |
| **LGPD** | Art. 46 — Medidas de segurança em dispositivos com dados pessoais | Sanitização obrigatória + evidência antes do descarte |
| **SOX** | Controle sobre ativos de TI que suportam processos financeiros | Rastreabilidade de responsável + audit_log imutável |
| **ITIL v4** | ITAM como prática de gestão de serviços | Módulo implementa todo o ciclo de vida ITAM |
| **IFRS / CPC** | Registro de ativos imobilizados e controle de depreciação | CAPEX com cálculo automático de depreciação |

### 25.2 Checklist de Conformidade de Ativo

Ao registrar um ativo, o sistema verifica automaticamente:
- [ ] Código patrimonial único atribuído.
- [ ] Responsável designado (para ativos IN_USE).
- [ ] Classificação OPEX/CAPEX definida.
- [ ] Centro de custo vinculado.
- [ ] Nota fiscal número registrada (para CAPEX).
- [ ] Garantia registrada (para hardware).

Ativos sem todos os campos obrigatórios ficam marcados com flag "Cadastro Incompleto" no inventário.

---

## 26. Regras de Negócio

---

**AST-001** — Todo ativo deve possuir responsável
Ativo com status `IN_USE` ou `ALLOCATED` deve ter `assignee_id` preenchido. A transição para esses status é bloqueada sem responsável definido.
**Referência:** BR-AST-001

---

**AST-002** — Toda movimentação gera trilha de auditoria imutável
Toda alteração de localização, status ou responsável de um ativo gera registro em `asset.AssetMovement` e em `shared.audit_log`. Operação bloqueada sem registro completo.
**Referência:** BR-AST-002

---

**AST-003** — Etiqueta patrimonial única e imutável
O campo `asset_tag` é único por tenant e imutável após criação. Tentativa de duplicação resulta em erro 409 `DUPLICATE_ASSET_TAG`.
**Referência:** BR-AST-003

---

**AST-004** — Todo ativo deve possuir classificação financeira
O campo `classification` (OPEX ou CAPEX) é obrigatório. Ativos sem classificação são marcados como "Cadastro Incompleto" e geram alerta semanal ao IT_MANAGER.

---

**AST-005** — Todo ativo deve possuir rastreabilidade completa
O histórico de status, responsável e localização deve ser preservado integralmente. Nenhuma alteração de ativo pode apagar registros anteriores.

---

**AST-006** — GLPI é a fonte oficial dos ativos
Para ativos sincronizados com o GLPI, campos de identificação (nome, serial, modelo, categoria) têm o GLPI como fonte autoritativa. Divergências entre SGTI e GLPI são sinalizadas e resolvidas em favor do GLPI.

---

**AST-007** — Todo periférico entregue deve possuir requisição vinculada
Nenhum periférico pode ser entregue sem requisição aprovada correspondente no SGTI. Entrega sem requisição caracteriza não-conformidade registrada no módulo de Compliance.
**Referência:** BR-AST-002, REQ-013

---

**AST-008** — Toda entrega de equipamento deve possuir aceite formal
O aceite do usuário (digital, dentro de 48h, ou implícito após 48h) é obrigatório para todos os ativos entregues. Registrado em `audit_log` com IP e timestamp.
**Referência:** BR-AST-002, REQ-014

---

**AST-009** — Todo ativo adquirido deve possuir centro de custo
O campo `cost_center_id` é obrigatório para todos os ativos. Ativos sem centro de custo não podem ser cadastrados como CAPEX.

---

**AST-010** — Ativo CAPEX gera CapexInvestment automaticamente
Ao registrar ativo com `classification = CAPEX`, o sistema cria automaticamente um registro `finance.CapexInvestment` com status PLANNED, vinculado ao ativo.

---

**AST-011** — Depreciação calculada automaticamente para ativos CAPEX
O `current_value` de ativos CAPEX é calculado mensalmente pelo `DepreciationJob` usando o método configurado para a categoria (STRAIGHT_LINE padrão).

---

**AST-012** — Alerta de garantia 90/60/30/2 dias antes do vencimento
Ativos com `warranty_end` preenchido recebem alertas automáticos ao técnico responsável e ao IT_MANAGER nos marcos configurados.
**Referência:** BR-AST-006

---

**AST-013** — Licença com utilização < 20% em 3 meses: candidata a cancelamento
Job mensal verifica licenças subutilizadas e gera relatório para o IT_MANAGER e Analista Financeiro decidirem sobre cancelamento.
**Referência:** BR-AST-007

---

**AST-014** — Ativo em manutenção pausa SLA de incidentes vinculados
Quando ativo entra em `UNDER_MAINTENANCE`, o SLA de todos os incidentes abertos com esse ativo vinculado é pausado automaticamente. Retomada automática após manutenção concluída.
**Referência:** BR-AST-009

---

**AST-015** — Ativo DISPOSED é estado terminal
Status `DISPOSED` é terminal e somente leitura. Nenhuma operação de uso, alocação ou movimentação é permitida. Histórico preservado indefinidamente para auditoria.

---

**AST-016** — Descomissionamento requer aprovação do Gestor
A operação de descomissionamento segue dois passos: (1) Coordenador solicita com justificativa; (2) IT_MANAGER aprova. Sem aprovação, o status `DECOMMISSIONED` não é atingido.
**Referência:** BR-AST-005

---

**AST-017** — Descarte exige sanitização documentada para ativos com dados
Ativo que conteve dados pessoais ou corporativos (notebooks, desktops, servidores) não pode ter status alterado para `DISPOSED` sem o campo `data_sanitizacao` preenchido e evidência de sanitização arquivada.

---

**AST-018** — Ativo recebido de compra deve ser registrado antes de ser entregue
O ativo deve ter status `IN_STOCK` (cadastrado) antes de ser alocado. Entrega direta sem cadastro é bloqueada.
**Referência:** BR-AST-008

---

**AST-019** — Número de série único quando preenchido
O campo `serial_number`, quando preenchido, é único por tenant. Duplicação resulta em erro 409.
**Referência:** BR-AST-010

---

**AST-020** — Ativo descomissionado não pode ser realocado
Status `DECOMMISSIONED` bloqueia operações de alocação, movimentação e manutenção de uso.
**Referência:** BR-AST-011

---

**AST-021** — Ativo sem responsável há 30 dias gera alerta
Ativos com status `IN_USE` sem `assignee_id` por mais de 30 dias geram alerta semanal ao IT_MANAGER.
**Referência:** BR-AST-012

---

**AST-022** — Movimentação entre unidades exige aprovação
Movimentação de ativo entre unidades físicas distintas requer aprovação do IT_MANAGER da unidade de destino antes de ser efetivada.

---

**AST-023** — Ativo com > 2 incidentes abertos: alerta e sugestão de Problema
Se o mesmo ativo tiver mais de 2 incidentes abertos simultaneamente, o sistema exibe aviso e sugere vinculação a um Problema para investigação de causa raiz.
**Referência:** BR-INC-011

---

**AST-024** — Aceite implícito após 48 horas
Se o usuário não confirmar o recebimento do ativo em 48 horas após FULFILLED da requisição, o sistema registra aceite implícito automaticamente.

---

**AST-025** — Ativo de terceiro sem reconhecimento de aceite implícito
Ativos altos valor (> R$5.000,00) com aceite implícito geram alerta ao IT_MANAGER para confirmação manual.

---

**AST-026** — Manutenção dentro da garantia: acionamento obrigatório do fornecedor
Ativos em garantia devem ter manutenção corretiva solicitada ao fornecedor da garantia antes de ser enviado para assistência alternativa. Registro do protocolo de garantia obrigatório.

---

**AST-027** — Ativo com condição DAMAGED na devolução: incidente aberto automaticamente
Quando `condition_on_return = DAMAGED`, o sistema abre automaticamente incidente com prioridade MÉDIO vinculado ao ativo e notifica IT_MANAGER e RH.

---

**AST-028** — Ativo perdido (LOST) registrado como DECOMMISSIONED com observação
Ativo reportado como perdido recebe status DECOMMISSIONED com observação "PERDIDO", gera NC no módulo Compliance e aciona procedimento de boletim de ocorrência.

---

**AST-029** — Licença com utilização = 100%: alerta imediato
Quando a contagem de licenças em uso atingir exatamente 100% da quantidade contratada, alerta imediato é enviado ao IT_MANAGER para evitar violação de licença.

---

**AST-030** — Licença expirada bloqueia novas atribuições
Licença com data de expiração no passado não pode receber novas atribuições de usuário. O sistema bloqueia a operação com erro 422 `LICENSE_EXPIRED`.

---

**AST-031** — Licença expirada e em uso gera alerta de violação
Licença expirada ainda com usuários atribuídos gera alerta diário ao IT_MANAGER enquanto a situação persistir.

---

**AST-032** — Ativo vinculado à requisição de compra: NF obrigatória para CAPEX
Ativos CAPEX adquiridos por pedido de compra devem ter o número da nota fiscal registrado antes de avançar para status IN_STOCK.

---

**AST-033** — Ativo recebido de fornecedor diferente do pedido: alerta de divergência
Se o fornecedor do ativo recebido for diferente do fornecedor do PurchaseOrder correspondente, alerta é gerado ao IT_MANAGER para verificação.

---

**AST-034** — Etiqueta patrimonial gerada automaticamente se não informada
Quando o técnico não informa o `asset_tag` no cadastro, o sistema gera automaticamente usando o formato configurado para a categoria. O técnico pode sobrescrever antes de salvar.

---

**AST-035** — Auditoria física semestral obrigatória para ativos críticos
Ativos classificados como "missão crítica" (servidores, switches de core, firewalls) devem ser auditados fisicamente no mínimo semestralmente. Ausência de auditoria gera NC.

---

**AST-036** — Ativos do mesmo modelo com > 3 falhas: recomendação de substituição
Se 3 ou mais ativos do mesmo modelo de hardware apresentarem falhas corretivas dentro de 12 meses, o sistema gera sugestão de avaliação do modelo para o IT_MANAGER.

---

**AST-037** — Dados de custo financeiro visíveis apenas para IT_MANAGER+
Campos como `purchase_value`, `current_value`, `classification` e dados de contratos são visíveis somente para IT_MANAGER e perfis superiores. Técnicos não visualizam dados financeiros.

---

**AST-038** — Ativo com vida útil expirada: alerta de renovação
Ativos com `data_fim_vida_util` no passado geram alerta ao IT_MANAGER para decisão de renovação, extensão de vida útil ou descomissionamento.

---

**AST-039** — Movimentação registrada antes do status ser alterado
O registro de `AssetMovement` deve ser criado antes da atualização do status/localização do ativo. Se o registro falhar, o status não é alterado.

---

**AST-040** — Ativos de projeto: custo debitado do orçamento do projeto
Quando um ativo CAPEX é vinculado a um projeto, seu valor de aquisição é debitado automaticamente do orçamento CAPEX do projeto.

---

**AST-041** — Relatório de inventário físico vs. sistema exibido em divergências
O relatório de auditoria patrimonial compara o inventário físico levantado com os dados do sistema e destaca automaticamente os ativos não localizados e os não cadastrados.

---

**AST-042** — Ativo exportado (doação, leilão, reciclagem) registrado como DISPOSED
Todo ativo que sair definitivamente do patrimônio da empresa (por qualquer método) deve ter status atualizado para `DISPOSED` com o método de destinação documentado.

---

**AST-043** — Campos PII não são armazenados no ativo
Dados pessoais do usuário responsável (nome completo, CPF, etc.) não são armazenados diretamente no ativo. Apenas o `user_id` (UUID pseudônimo) é referenciado.

---

**AST-044** — Sync com GLPI: dados financeiros e de responsável nunca sobrescritos
A sincronização do GLPI jamais sobrescreve: `purchase_value`, `current_value`, `classification`, `cost_center_id`, `assignee_id`, `project_id`. Esses campos são gerenciados exclusivamente pelo SGTI.

---

**AST-045** — Ativo entregue com condição DAMAGED: bloqueio e incidente
Se técnico tentar registrar entrega com `condition_on_assign = DAMAGED`, o sistema bloqueia a operação e abre automaticamente incidente de manutenção do ativo antes de permitir a entrega.

---

**AST-046** — Dashboard de ativos atualizado em tempo real via Realtime
O painel operacional de ativos usa Supabase Realtime para atualizações automáticas, sem necessidade de F5 manual. Latência máxima de 5 segundos para refletir mudanças.

---

**AST-047** — Ativos SaaS/Cloud com custo mensal > R$5.000: revisão trimestral
Contratos de SaaS/Cloud com custo mensal superior a R$5.000,00 geram revisão automática trimestral com relatório de utilização e oportunidade de renegociação.

---

**AST-048** — Contrato de ativo com auto_renew: alerta de revisão consciente
Contratos com `auto_renew = true` disparam alerta ao IT_MANAGER com `alert_days_before` dias de antecedência para garantir que a renovação seja uma decisão consciente.

---

**AST-049** — Ativo descomissionado com baixa patrimonial automática no Financeiro
Ao descomissionar um ativo CAPEX, o evento `AssetDecommissioned` publica a baixa patrimonial no módulo Financeiro, zerando o `current_value` e encerrando a depreciação.

---

**AST-050** — Ativo sem nota fiscal CAPEX: flag de pendência fiscal
Ativos com `classification = CAPEX` sem `invoice_number` preenchido ficam com flag "Pendência Fiscal" e aparecem em relatório semanal para o Financeiro.

---

**AST-051** — Histórico de manutenções preservado para avaliar TCO
O histórico completo de manutenções de um ativo (preventivas e corretivas, com custos) é preservado indefinidamente para compor o TCO do ativo.

---

**AST-052** — Ativos de alto valor (> R$10.000): dupla conferência no recebimento
Ativos com `purchase_value > R$10.000,00` requerem confirmação de recebimento por dois funcionários: o técnico que recebeu e o Gestor de Patrimônio ou IT_MANAGER.

---

**AST-053** — Auditoria patrimonial: relatório gerado automaticamente
Após cada ciclo de auditoria física concluído, o sistema gera automaticamente o relatório de divergências para o IT_MANAGER e para o Compliance Officer.

---

**AST-054** — Ativo com status IN_STOCK por mais de 180 dias: alerta de ociosidade
Ativo em estoque (IN_STOCK) por mais de 180 dias sem movimentação gera alerta mensal ao IT_MANAGER para decisão: manter em estoque, alocar ou descomissionar.

---

**AST-055** — Ativo associado a projeto finalizado: transferência para inventário geral
Quando projeto vinculado ao ativo é encerrado, notificação é enviada ao IT_MANAGER para definir nova alocação do ativo (transferência para inventário geral ou novo projeto).

---

**AST-056** — Número de série obrigatório para hardware de alto valor
Hardware com `purchase_value > R$500,00` deve ter `serial_number` preenchido. Cadastro sem serial de hardware de alto valor é bloqueado com aviso.

---

**AST-057** — Tipo de garantia EXTENDED requer contrato vinculado
Quando `warranty_type = EXTENDED`, o campo `contract_id` é obrigatório, pois a garantia estendida deve ter contrato de suporte correspondente.

---

**AST-058** — Importação em lote via planilha disponível para IT_MANAGER+
O módulo permite importação em lote de ativos via planilha Excel para cadastros iniciais ou migrações. Disponível apenas para IT_MANAGER+. Importação gera relatório de erros e confirmação antes de persistir.

---

**AST-059** — QR Code gerado automaticamente para cada ativo cadastrado
O sistema gera automaticamente o QR Code para cada ativo, vinculando ao registro no SGTI. O QR Code pode ser impresso e afixado junto à etiqueta patrimonial.

---

**AST-060** — Ativos de servidor: inventário de componentes internos documentado
Servidores devem ter documentação de componentes internos (processadores, memória, discos, placas de rede) nos campos customizados, para facilitar manutenção e planejamento de capacidade.

---

**AST-061** — Licença de software deve documentar o tipo de licenciamento
Toda licença cadastrada deve ter o campo `license_type` preenchido (Named/Device/Concurrent/Enterprise/Core) para permitir controle correto de utilização.

---

**AST-062** — Ativos OPEX não são depreciados
Ativos classificados como OPEX não passam pelo cálculo de depreciação. Apenas ativos CAPEX têm `current_value` calculado ao longo do tempo.

---

**AST-063** — Contrato vencido vinculado a ativo ativo: alerta de risco
Quando um contrato de manutenção ou licença vinculado a ativo ativo vencer, o ativo recebe flag "Contrato Vencido" e alerta é enviado ao IT_MANAGER.

---

**AST-064** — Ativo físico excluído fisicamente: proibido
Ativos físicos (hardware) nunca são excluídos do inventário. Apenas status DISPOSED marca o fim do ciclo de vida. O histórico é preservado indefinidamente.

---

**AST-065** — Relatório de depreciação gerado automaticamente todo dia 1
O relatório de depreciação do mês anterior é gerado automaticamente no primeiro dia útil de cada mês e enviado ao Financeiro e IT_MANAGER.

---

**AST-066** — Ativo associado a certificação: rastreabilidade de compliance
Ativos que suportam certificações (ISO 27001, SOC 2) são marcados com tag de compliance e incluídos automaticamente no escopo de auditoria do módulo de Compliance.

---

**AST-067** — Custo de manutenção superior ao valor atual: alerta de substituição
Quando o custo acumulado de manutenções de um ativo supera 70% do seu `current_value`, o sistema gera alerta ao IT_MANAGER sugerindo avaliação de substituição.

---

**AST-068** — Inventário de ativos exportável em CSV/Excel a qualquer momento
O inventário completo pode ser exportado em CSV ou Excel por IT_MANAGER+ para conciliação com sistemas financeiros externos, auditorias ou análises ad-hoc.

---

**AST-069** — Status do ativo refletido no GLPI pós-sincronização
Após descomissionamento ou descarte no SGTI, o status é propagado para o GLPI na próxima sincronização, garantindo consistência entre os dois sistemas.

---

**AST-070** — Ativo com projeto vinculado: custo visível no dashboard do projeto
Todo ativo vinculado a um projeto é visível no dashboard do projeto com seu valor de aquisição, custo de manutenção e status atual.

---

## 27. Critérios de Aceitação

### 27.1 Cadastro e Inventário

- [ ] **CA-01:** Cadastro de ativo bloqueado sem `asset_tag` único.
- [ ] **CA-02:** Cadastro de ativo CAPEX sem `cost_center_id` bloqueado.
- [ ] **CA-03:** Cadastro de ativo hardware de alto valor (> R$500) bloqueado sem `serial_number`.
- [ ] **CA-04:** `asset_tag` gerado automaticamente quando não informado.
- [ ] **CA-05:** QR Code gerado automaticamente após cadastro.
- [ ] **CA-06:** Importação em lote via planilha funciona com relatório de erros correto.
- [ ] **CA-07:** Campos customizados exibidos corretamente conforme a categoria selecionada.

### 27.2 GLPI e Sincronização

- [ ] **CA-08:** Sincronização incremental GLPI → SGTI executada diariamente às 02h00.
- [ ] **CA-09:** Ativo presente no GLPI e ausente no SGTI criado automaticamente.
- [ ] **CA-10:** Campos financeiros e de responsável nunca sobrescritos pela sincronização GLPI.
- [ ] **CA-11:** Divergências SGTI vs. GLPI registradas com `sync_status = CONFLICT`.
- [ ] **CA-12:** Circuit breaker ativado após 5 falhas consecutivas; IT_MANAGER notificado.
- [ ] **CA-13:** Modal "Buscar no GLPI" funciona e importa dados corretamente.

### 27.3 Entregas e Devoluções

- [ ] **CA-14:** Transição para `IN_USE` bloqueada sem `assignee_id`.
- [ ] **CA-15:** Entrega de ativo bloqueada sem requisição vinculada.
- [ ] **CA-16:** Aceite digital registrado em `audit_log` com IP e timestamp.
- [ ] **CA-17:** Aceite implícito executado automaticamente após 48h sem resposta.
- [ ] **CA-18:** PDF do Termo de Responsabilidade gerado corretamente.
- [ ] **CA-19:** Devolução com `condition_on_return = DAMAGED` abre incidente automaticamente.
- [ ] **CA-20:** Ativo DISPOSED bloqueado para novas operações de uso.

### 27.4 Movimentações

- [ ] **CA-21:** Todas as movimentações registradas em `AssetMovement` com campos obrigatórios.
- [ ] **CA-22:** Movimentação entre unidades bloqueada sem aprovação do IT_MANAGER.
- [ ] **CA-23:** `audit_log` registra todas as movimentações com old/new values.

### 27.5 Licenças e Garantias

- [ ] **CA-24:** Alertas de licença enviados nos marcos de 90, 60, 30 e 2 dias.
- [ ] **CA-25:** Nova atribuição bloqueada quando licença expirada.
- [ ] **CA-26:** Nova atribuição bloqueada quando licença atingiu 100% de utilização.
- [ ] **CA-27:** Relatório de licenças subutilizadas (< 20%) gerado mensalmente.
- [ ] **CA-28:** Alertas de garantia enviados nos marcos corretos.
- [ ] **CA-29:** Acionamento de garantia registrado com protocolo e resultado.

### 27.6 Controle Financeiro

- [ ] **CA-30:** Ativo CAPEX gera CapexInvestment automaticamente no módulo Financeiro.
- [ ] **CA-31:** Depreciação calculada corretamente mês a mês pelo método Linear.
- [ ] **CA-32:** Baixa patrimonial gerada automaticamente ao descomissionar ativo CAPEX.
- [ ] **CA-33:** Relatório de depreciação gerado no primeiro dia útil do mês.
- [ ] **CA-34:** Dados financeiros invisíveis para usuários com papel IT_TECHNICIAN ou inferior.

### 27.7 Integrações com Outros Módulos

- [ ] **CA-35:** Incidente com ativo vinculado exibe link direto ao ativo.
- [ ] **CA-36:** SLA de incidente pausado automaticamente quando ativo entra em manutenção.
- [ ] **CA-37:** Problema com ativo crítico vinculado exibe flag no inventário.
- [ ] **CA-38:** Ativo vinculado a projeto debita custo do orçamento do projeto.
- [ ] **CA-39:** Ativo descartado sem sanitização documentada bloqueado pelo sistema (para hardware com dados).

### 27.8 Compliance e Auditoria

- [ ] **CA-40:** Auditoria patrimonial gera relatório de divergências com ativos não localizados.
- [ ] **CA-41:** Ativo DISPOSED sem sanitização registrada gera NC no Compliance.
- [ ] **CA-42:** `audit_log` registra todas as operações com old_values e new_values.
- [ ] **CA-43:** RLS impede UPDATE e DELETE em `audit_log`.
- [ ] **CA-44:** Relatório de compliance patrimonial exportável em PDF para auditorias externas.

### 27.9 Dashboards e Relatórios

- [ ] **CA-45:** Dashboard operacional exibe ativos sem responsável em destaque.
- [ ] **CA-46:** Dashboard executivo calcula corretamente o valor total do parque.
- [ ] **CA-47:** Gráfico de depreciação acumulada correto para o período selecionado.
- [ ] **CA-48:** Relatório de inventário exportável em CSV e Excel com filtros funcionando.
- [ ] **CA-49:** Dashboard atualizado em tempo real (latência < 5 segundos).
- [ ] **CA-50:** Alerta de licença subutilizada exibido no dashboard operacional.

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação com 27 seções, 70 regras AST e 50 critérios de aceitação |

---

> **Próximos documentos recomendados:**
> [`41_REQUEST_MANAGEMENT.md`](./41_REQUEST_MANAGEMENT.md) — Módulo de Requisições (entrega e devolução de ativos)
> [`40_INCIDENT_MANAGEMENT.md`](./40_INCIDENT_MANAGEMENT.md) — Módulo de Incidentes (vinculação de ativos)
> [`44_IDENTITY_MANAGEMENT.md`](./44_IDENTITY_MANAGEMENT.md) — Módulo de Gestão de Identidades
