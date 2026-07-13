# SGTI — Sistema de Gestão de Tecnologia da Informação
## Matriz de Permissões e Controle de Acesso

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Aprovado para Desenvolvimento
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [22_AUTHENTICATION.md](./22_AUTHENTICATION.md) · [14_SECURITY_REQUIREMENTS.md](./14_SECURITY_REQUIREMENTS.md) · [12_ARCHITECTURE.md](./12_ARCHITECTURE.md)

---

## Sobre este Documento

Este documento define a **matriz completa de permissões do SGTI** — o contrato formal entre os perfis de acesso e as operações permitidas em cada módulo do sistema. É a referência de autoridade para implementação dos Guards NestJS, políticas RLS do Supabase e configuração de visibilidade no frontend.

### Convenções da Matriz

| Símbolo | Significado |
|:-------:|-------------|
| ✅ | Permitido — sem restrição adicional |
| ✅* | Permitido com restrição — ver nota correspondente |
| 🔒 | Requer aprovação dupla ou step-up authentication |
| ❌ | Proibido — retorna 403 Forbidden |
| — | Não aplicável ao contexto do perfil |

### Mapeamento de Perfis

| Perfil de Negócio | Role Code (Sistema) | Prioridade |
|-------------------|--------------------:|:---------:|
| **Usuário** | `END_USER` | 5 |
| **Analista** | `IT_TECHNICIAN` | 4 |
| **Coordenador** | `IT_SPECIALIST` | 3 |
| **Compliance** | `COMPLIANCE_OFFICER` | 3 |
| **Gestor** | `IT_MANAGER` | 2 |
| **Administrador** | `SUPER_ADMIN` | 1 |

> **Papéis transversais** (não incluídos nas matrizes principais):
> `FINANCIAL_ANALYST`, `PROJECT_MANAGER`, `AUDITOR`, `EXECUTIVE`
> são tratados na seção 14 — Papéis Especializados.

---

## Sumário

1. [Módulo: Incidentes](#1-módulo-incidentes)
2. [Módulo: Requisições](#2-módulo-requisições)
3. [Módulo: Problemas](#3-módulo-problemas)
4. [Módulo: Ativos](#4-módulo-ativos)
5. [Módulo: Identidades](#5-módulo-identidades)
6. [Módulo: Compliance](#6-módulo-compliance)
7. [Módulo: Financeiro](#7-módulo-financeiro)
8. [Módulo: Compras](#8-módulo-compras)
9. [Módulo: Projetos](#9-módulo-projetos)
10. [Módulo: Base de Conhecimento](#10-módulo-base-de-conhecimento)
11. [Módulo: Dashboard](#11-módulo-dashboard)
12. [Módulo: Administração](#12-módulo-administração)
13. [Herança de Permissões](#13-herança-de-permissões)
14. [Papéis Especializados](#14-papéis-especializados)
15. [Segregação de Funções](#15-segregação-de-funções)
16. [Restrições por Perfil](#16-restrições-por-perfil)
17. [Conformidade e Compliance das Permissões](#17-conformidade-e-compliance-das-permissões)
18. [Glossário de Operações](#18-glossário-de-operações)

---

## 1. Módulo: Incidentes

### 1.1 Matriz de Permissões

| Operação | Usuário | Analista | Coordenador | Compliance | Gestor | Administrador |
|----------|:-------:|:--------:|:-----------:|:----------:|:------:|:-------------:|
| **Visualizar** próprios incidentes | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Visualizar** todos os incidentes | ❌ | ✅ | ✅ | ✅* | ✅ | ✅ |
| **Visualizar** incidentes do grupo | ❌ | ✅ | ✅ | — | ✅ | ✅ |
| **Criar** incidente | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Editar** incidente próprio (antes atribuição) | ✅* | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Editar** incidente atribuído a mim | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Editar** qualquer incidente | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Atribuir** técnico ao incidente | ❌ | ✅* | ✅ | ❌ | ✅ | ✅ |
| **Transferir** incidente | ❌ | ✅* | ✅ | ❌ | ✅ | ✅ |
| **Resolver** incidente | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Fechar** incidente | ✅* | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Reabrir** incidente | ✅* | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Cancelar** incidente próprio | ✅* | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Excluir** (soft delete) incidente | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Comentar** (público) | ✅* | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Comentar** (interno) | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Anexar** arquivos | ✅* | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Pausar SLA** | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Registrar** causa/impacto | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Vincular** a problema | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Aprovar** escalada crítica | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Exportar** relatório de incidentes | ❌ | ❌ | ✅* | ✅* | ✅ | ✅ |
| **Administrar** categorias e tipos | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Avaliar** atendimento (CSAT) | ✅* | — | — | — | — | — |

**Notas:**
- ✅* Visualizar próprios: somente registros onde `requester_id = userId`.
- ✅* Compliance Visualizar: apenas leitura para fins de auditoria; sem escrita.
- ✅* Atribuir (Analista): apenas atribuir ao próprio ou ao próprio grupo.
- ✅* Transferir (Analista): somente incidentes atribuídos a si mesmo.
- ✅* Fechar (Usuário): apenas confirmar resolução do próprio incidente, em até 7 dias pós-resolução.
- ✅* Reabrir (Usuário): apenas próprios incidentes, em até 7 dias pós-fechamento, com justificativa obrigatória.
- ✅* Cancelar (Usuário): apenas próprios incidentes com status `OPEN`.
- ✅* Comentar/Anexar (Usuário): apenas em próprios incidentes.
- ✅* Exportar (Coordenador): apenas do seu grupo; sem dados pessoais de outros departamentos.
- ✅* Exportar (Compliance): somente para fins de auditoria documentados.
- ✅* CSAT (Usuário): apenas para incidentes próprios com status `RESOLVED` ou `CLOSED`.

---

## 2. Módulo: Requisições

### 2.1 Matriz de Permissões

| Operação | Usuário | Analista | Coordenador | Compliance | Gestor | Administrador |
|----------|:-------:|:--------:|:-----------:|:----------:|:------:|:-------------:|
| **Visualizar** catálogo de serviços | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Visualizar** próprias requisições | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Visualizar** todas as requisições | ❌ | ✅ | ✅ | ✅* | ✅ | ✅ |
| **Criar** requisição | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Editar** requisição própria (DRAFT) | ✅* | ✅ | ✅ | ✅* | ✅ | ✅ |
| **Cancelar** requisição própria | ✅* | ✅ | ✅ | ✅* | ✅ | ✅ |
| **Excluir** requisição | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Aprovar** requisição (etapa de seu papel) | ❌ | ❌ | ✅* | ❌ | ✅ | ✅ |
| **Rejeitar** requisição (etapa de seu papel) | ❌ | ❌ | ✅* | ❌ | ✅ | ✅ |
| **Delegar** aprovação | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Executar** requisição (fulfillment) | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Comentar** na requisição | ✅* | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Visualizar** aprovações pendentes de mim | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Exportar** histórico de requisições | ❌ | ❌ | ✅* | ✅* | ✅ | ✅ |
| **Administrar** tipos de requisição | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Configurar** fluxos de aprovação | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Avaliar** atendimento (CSAT) | ✅* | — | — | — | — | — |

**Notas:**
- ✅* Editar/Cancelar (Usuário): apenas requisições próprias com status `DRAFT` ou `SUBMITTED`.
- ✅* Editar/Cancelar (Compliance): somente as próprias requisições.
- ✅* Aprovar/Rejeitar (Coordenador): somente quando designado como aprovador da etapa atual.
- ✅* Comentar (Usuário): apenas em próprias requisições.
- ✅* Exportar (Coordenador/Compliance): escopo limitado ao seu departamento.
- **Segregação obrigatória:** solicitante da requisição NÃO pode ser o aprovador da mesma requisição, independentemente do papel.

---

## 3. Módulo: Problemas

### 3.1 Matriz de Permissões

| Operação | Usuário | Analista | Coordenador | Compliance | Gestor | Administrador |
|----------|:-------:|:--------:|:-----------:|:----------:|:------:|:-------------:|
| **Visualizar** lista de problemas | ❌ | ✅ | ✅ | ✅* | ✅ | ✅ |
| **Visualizar** problema completo | ❌ | ✅ | ✅ | ✅* | ✅ | ✅ |
| **Visualizar** KEDB (erros conhecidos) | ✅* | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Visualizar** workarounds publicados | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Criar** problema | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Editar** problema | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Vincular** incidentes a problema | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Registrar** causa raiz | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Confirmar** causa raiz | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Criar** workaround | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Publicar** workaround | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Fechar** problema | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Excluir** problema | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Aprovar** registro de erro conhecido | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Exportar** relatório de problemas | ❌ | ❌ | ✅* | ✅* | ✅ | ✅ |
| **Administrar** categorias | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

**Notas:**
- ✅* KEDB (Usuário): apenas erros conhecidos com workaround publicado — visão simplificada.
- ✅* Visualizar (Compliance): somente leitura para correlação com evidências de controles.
- ✅* Exportar: escopo limitado ao grupo/departamento do exportador.

---

## 4. Módulo: Ativos

### 4.1 Matriz de Permissões

| Operação | Usuário | Analista | Coordenador | Compliance | Gestor | Administrador |
|----------|:-------:|:--------:|:-----------:|:----------:|:------:|:-------------:|
| **Visualizar** ativos atribuídos a mim | ✅ | ✅ | ✅ | ✅* | ✅ | ✅ |
| **Visualizar** inventário completo | ❌ | ✅ | ✅ | ✅* | ✅ | ✅ |
| **Visualizar** histórico de ativo | ❌ | ✅ | ✅ | ✅* | ✅ | ✅ |
| **Visualizar** dados financeiros do ativo | ❌ | ❌ | ✅* | ❌ | ✅ | ✅ |
| **Criar** ativo (registrar) | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Editar** dados do ativo | ❌ | ✅* | ✅ | ❌ | ✅ | ✅ |
| **Alocar** ativo a usuário | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Desalocar** ativo | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Registrar** movimentação | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Agendar** manutenção | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Registrar** conclusão de manutenção | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Descomissionar** ativo | ❌ | ❌ | 🔒 | ❌ | ✅ | ✅ |
| **Excluir** (soft delete) ativo | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Aprovar** descomissionamento | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Gerenciar** licenças de software | ❌ | ✅* | ✅ | ❌ | ✅ | ✅ |
| **Exportar** inventário | ❌ | ❌ | ✅ | ✅* | ✅ | ✅ |
| **Administrar** categorias de ativos | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Importar** ativos em lote | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

**Notas:**
- ✅* Visualizar (Compliance): apenas metadados (tag, status, valor) para fins de controle patrimonial; sem histórico de atribuições pessoais.
- ✅* Visualizar financeiro (Coordenador): somente ativos do seu departamento.
- ✅* Editar (Analista): apenas campos de localização, status e observações; sem campos financeiros.
- 🔒 Descomissionar (Coordenador): requer aprovação explícita do Gestor no sistema.
- ✅* Exportar (Compliance): apenas campos de inventário; sem dados pessoais de usuários alocados.
- ✅* Gerenciar licenças (Analista): apenas visualizar e atualizar contagem de uso; sem criar ou excluir licenças.

---

## 5. Módulo: Identidades

### 5.1 Matriz de Permissões

| Operação | Usuário | Analista | Coordenador | Compliance | Gestor | Administrador |
|----------|:-------:|:--------:|:-----------:|:----------:|:------:|:-------------:|
| **Visualizar** próprio perfil de acesso | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Visualizar** perfil de outro usuário | ❌ | ❌ | ✅* | ✅* | ✅ | ✅ |
| **Visualizar** lista de usuários | ❌ | ❌ | ✅* | ✅* | ✅ | ✅ |
| **Visualizar** grupos | ❌ | ✅* | ✅ | ✅* | ✅ | ✅ |
| **Visualizar** histórico de acessos | ❌ | ❌ | ❌ | ✅* | ✅ | ✅ |
| **Visualizar** revisões de acesso | ❌ | ❌ | ❌ | ✅* | ✅ | ✅ |
| **Criar** usuário / Convidar | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Editar** próprio perfil | ✅* | ✅* | ✅* | ✅* | ✅* | ✅ |
| **Editar** perfil de outro usuário | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Provisionar** acesso | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Desprovisionar** acesso | ❌ | ❌ | ❌ | ❌ | 🔒 | ✅ |
| **Suspender** usuário | ❌ | ❌ | ❌ | ❌ | 🔒 | ✅ |
| **Reativar** usuário | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Atribuir** papel | ❌ | ❌ | ❌ | ❌ | ✅* | ✅ |
| **Revogar** papel | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Criar** grupo | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Gerenciar** membros de grupo | ❌ | ❌ | ✅* | ❌ | ✅ | ✅ |
| **Iniciar** revisão de acesso | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Executar** revisão de acesso | ❌ | ❌ | ❌ | ✅* | ✅ | ✅ |
| **Exportar** lista de usuários | ❌ | ❌ | ❌ | ✅* | 🔒 | ✅ |
| **Exportar** dados pessoais (LGPD) | ✅* | — | — | — | ❌ | ✅ |
| **Anonimizar** usuário (LGPD) | ❌ | ❌ | ❌ | ❌ | ❌ | 🔒 |
| **Excluir** conta de usuário | ❌ | ❌ | ❌ | ❌ | ❌ | 🔒 |
| **Administrar** configurações de IAM | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

**Notas:**
- ✅* Visualizar perfil (Coordenador): apenas usuários do seu departamento; sem dados sensíveis.
- ✅* Visualizar (Compliance): apenas para fins de auditoria de acesso; sem alterar nada.
- ✅* Grupos (Analista): apenas grupos dos quais é membro.
- ✅* Histórico (Compliance): acesso a log de acessos concedidos/revogados; sem dados pessoais detalhados.
- ✅* Revisões (Compliance): pode participar como revisor quando designado.
- ✅* Editar próprio perfil: nome de exibição, fuso horário, locale, preferências de notificação. E-mail e departamento são imutáveis pelo usuário — alterados via Google Workspace.
- 🔒 Desprovisionar/Suspender (Gestor): requer confirmação step-up authentication.
- ✅* Atribuir papel (Gestor): apenas papéis até `IT_SPECIALIST`; papéis mais altos requerem `SUPER_ADMIN`.
- ✅* Gerenciar membros (Coordenador): apenas grupos do seu departamento/especialidade.
- ✅* Executar revisão (Compliance): apenas quando designado como revisor pelo Gestor.
- 🔒 Exportar lista (Gestor): requer step-up authentication; gera registro de auditoria obrigatório.
- ✅* Exportar dados pessoais (Usuário): apenas os próprios dados (direito de acesso LGPD Art. 18).
- 🔒 Anonimizar/Excluir (Administrador): requer step-up authentication + justificativa formal.

---

## 6. Módulo: Compliance

### 6.1 Matriz de Permissões

| Operação | Usuário | Analista | Coordenador | Compliance | Gestor | Administrador |
|----------|:-------:|:--------:|:-----------:|:----------:|:------:|:-------------:|
| **Visualizar** políticas publicadas | ✅* | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Visualizar** auditorias | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Visualizar** achados e NCs | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Visualizar** evidências | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Visualizar** planos de ação | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Visualizar** normas e controles | ❌ | ❌ | ✅* | ✅ | ✅ | ✅ |
| **Criar** auditoria | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Editar** auditoria | ❌ | ❌ | ❌ | ✅* | ✅ | ✅ |
| **Registrar** achado/NC | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Editar** achado | ❌ | ❌ | ❌ | ✅* | ✅ | ✅ |
| **Coletar** evidência | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Aprovar** evidência | ❌ | ❌ | ❌ | 🔒 | ✅ | ✅ |
| **Rejeitar** evidência | ❌ | ❌ | ❌ | 🔒 | ✅ | ✅ |
| **Criar** plano de ação | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Editar** plano de ação | ❌ | ❌ | ❌ | ✅* | ✅ | ✅ |
| **Concluir** plano de ação | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Fechar** auditoria | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Publicar** política | ❌ | ❌ | ❌ | ✅* | ✅ | ✅ |
| **Versionar** política | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Excluir** registros de compliance | ❌ | ❌ | ❌ | ❌ | ❌ | ✅* |
| **Exportar** relatório de compliance | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Exportar** evidências para auditoria externa | ❌ | ❌ | ❌ | ✅* | ✅ | ✅ |
| **Administrar** normas e frameworks | ❌ | ❌ | ❌ | ✅* | ✅ | ✅ |

**Notas:**
- ✅* Políticas (Usuário): apenas políticas com status `PUBLISHED` e audiência `END_USER`.
- ✅* Normas (Coordenador): apenas visualização; sem editar ou criar.
- ✅* Editar auditoria (Compliance): somente auditorias em andamento das quais é responsável; sem editar auditorias concluídas.
- ✅* Editar achado (Compliance): somente antes da aprovação de evidência; sem alterar achados já resolvidos.
- 🔒 Aprovar/Rejeitar evidência (Compliance): não pode aprovar evidência que o próprio coletou — segregação de funções obrigatória.
- ✅* Editar plano de ação (Compliance): somente planos sob sua responsabilidade.
- ✅* Publicar política (Compliance): apenas políticas aprovadas pelo Gestor; sem publicar sem aprovação.
- ✅* Excluir (Administrador): exclusão física proibida — apenas soft delete com justificativa e registro de auditoria.
- ✅* Exportar evidências externas (Compliance): requer aprovação do Gestor; gera auditoria de exportação.
- ✅* Administrar normas (Compliance): pode cadastrar itens de norma; sem excluir frameworks vigentes.

---

## 7. Módulo: Financeiro

### 7.1 Matriz de Permissões

| Operação | Usuário | Analista | Coordenador | Compliance | Gestor | Administrador |
|----------|:-------:|:--------:|:-----------:|:----------:|:------:|:-------------:|
| **Visualizar** resumo de custos TI | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Visualizar** orçamento completo | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Visualizar** despesas OPEX | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Visualizar** investimentos CAPEX | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Visualizar** contratos | ❌ | ❌ | ❌ | ✅* | ✅ | ✅ |
| **Visualizar** fornecedores | ❌ | ❌ | ❌ | ✅* | ✅ | ✅ |
| **Criar** orçamento | ❌ | ❌ | ❌ | ❌ | ✅* | ✅ |
| **Editar** orçamento (status DRAFT) | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Aprovar** orçamento | ❌ | ❌ | ❌ | ❌ | 🔒 | ✅ |
| **Registrar** despesa OPEX | ❌ | ❌ | ❌ | ❌ | ✅* | ✅ |
| **Aprovar** despesa OPEX | ❌ | ❌ | ❌ | ❌ | 🔒 | ✅ |
| **Registrar** investimento CAPEX | ❌ | ❌ | ❌ | ❌ | ✅* | ✅ |
| **Aprovar** investimento CAPEX | ❌ | ❌ | ❌ | ❌ | 🔒 | ✅ |
| **Cadastrar** fornecedor | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Editar** fornecedor | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Cadastrar** contrato | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Editar** contrato ativo | ❌ | ❌ | ❌ | ❌ | 🔒 | ✅ |
| **Cancelar** contrato | ❌ | ❌ | ❌ | ❌ | 🔒 | ✅ |
| **Excluir** registros financeiros | ❌ | ❌ | ❌ | ❌ | ❌ | 🔒 |
| **Gerar** rateio de custos | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Exportar** relatório financeiro | ❌ | ❌ | ❌ | ✅* | ✅ | ✅ |
| **Administrar** categorias financeiras | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Administrar** centros de custo | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

**Notas:**
- ✅* Contratos (Compliance): apenas visualizar, para fins de evidência de conformidade.
- ✅* Fornecedores (Compliance): somente nomes e categorias — sem valores contratuais.
- ✅* Criar/Registrar (Gestor): sem aprovar o próprio lançamento — segregação obrigatória.
- 🔒 Aprovar (Gestor): quem registra não pode aprovar; aprovação requer outro usuário com papel Gestor ou superior.
- 🔒 Editar contrato ativo/Cancelar (Gestor): requer step-up authentication + justificativa formal.
- 🔒 Excluir (Administrador): apenas soft delete; auditoria obrigatória; registros financeiros têm retenção mínima de 5 anos.
- ✅* Exportar (Compliance): apenas relatório de conformidade com fornecedores e contratos; sem valores detalhados.

---

## 8. Módulo: Compras

### 8.1 Matriz de Permissões

| Operação | Usuário | Analista | Coordenador | Compliance | Gestor | Administrador |
|----------|:-------:|:--------:|:-----------:|:----------:|:------:|:-------------:|
| **Visualizar** próprias requisições de compra | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Visualizar** todas as requisições | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Visualizar** pedidos de compra | ❌ | ❌ | ❌ | ✅* | ✅ | ✅ |
| **Criar** requisição de compra | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Editar** requisição própria (DRAFT) | ❌ | ✅* | ✅* | ❌ | ✅ | ✅ |
| **Cancelar** requisição | ❌ | ✅* | ✅* | ❌ | ✅ | ✅ |
| **Aprovar** requisição (≤ R$1.000) | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Aprovar** requisição (> R$1.000 e ≤ R$10.000) | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Aprovar** requisição (> R$10.000) | ❌ | ❌ | ❌ | ❌ | 🔒 | ✅ |
| **Rejeitar** requisição | ❌ | ❌ | ✅* | ❌ | ✅ | ✅ |
| **Criar** pedido de compra | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Editar** pedido de compra | ❌ | ❌ | ❌ | ❌ | ✅* | ✅ |
| **Registrar** recebimento de itens | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Avaliar** fornecedor | ❌ | ✅* | ✅ | ❌ | ✅ | ✅ |
| **Excluir** pedido de compra | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Exportar** histórico de compras | ❌ | ❌ | ❌ | ✅* | ✅ | ✅ |
| **Administrar** configurações de compras | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

**Notas:**
- ✅* Editar/Cancelar (Analista/Coordenador): apenas requisições próprias com status `DRAFT`.
- ✅* Aprovar (Coordenador): apenas se designado como aprovador da etapa; não pode aprovar a própria requisição.
- ✅* Rejeitar (Coordenador): apenas requisições em sua etapa de aprovação.
- ✅* Editar pedido (Gestor): apenas pedidos com status `DRAFT` ou `SENT`; sem editar pedidos já recebidos.
- ✅* Avaliar fornecedor (Analista): apenas fornecedores com os quais interagiu no processo de recebimento.
- ✅* Visualizar pedidos (Compliance): apenas lista e status para fins de conformidade; sem valores detalhados.
- ✅* Exportar (Compliance): apenas para fins de auditoria de processos; com aprovação do Gestor.

---

## 9. Módulo: Projetos

### 9.1 Matriz de Permissões

| Operação | Usuário | Analista | Coordenador | Compliance | Gestor | Administrador |
|----------|:-------:|:--------:|:-----------:|:----------:|:------:|:-------------:|
| **Visualizar** lista de projetos | ❌ | ✅* | ✅ | ✅* | ✅ | ✅ |
| **Visualizar** projeto completo | ❌ | ✅* | ✅ | ✅* | ✅ | ✅ |
| **Visualizar** tarefas do projeto | ❌ | ✅* | ✅ | ❌ | ✅ | ✅ |
| **Visualizar** custos do projeto | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Criar** projeto | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Editar** projeto | ❌ | ❌ | ✅* | ❌ | ✅ | ✅ |
| **Aprovar** projeto | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Cancelar** projeto | ❌ | ❌ | ❌ | ❌ | 🔒 | ✅ |
| **Criar** tarefa | ❌ | ❌ | ✅* | ❌ | ✅ | ✅ |
| **Editar** tarefa atribuída a mim | ❌ | ✅* | ✅* | ❌ | ✅ | ✅ |
| **Atualizar** progresso de tarefa | ❌ | ✅* | ✅* | ❌ | ✅ | ✅ |
| **Excluir** tarefa | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Registrar** custo de projeto | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Concluir** projeto | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Excluir** projeto | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Exportar** relatório de projetos | ❌ | ❌ | ✅* | ✅* | ✅ | ✅ |
| **Administrar** configurações | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

**Notas:**
- ✅* Visualizar (Analista): apenas projetos dos quais é membro ou está atribuído.
- ✅* Visualizar (Compliance): apenas status e escopo; sem dados financeiros.
- ✅* Editar projeto (Coordenador): apenas projetos dos quais é gerente designado; somente campos operacionais (cronograma, status, riscos) — sem orçamento.
- ✅* Criar/Editar tarefa (Coordenador): apenas em projetos sob sua gestão.
- ✅* Editar/Atualizar tarefa (Analista): apenas tarefas atribuídas ao próprio usuário.
- 🔒 Cancelar projeto (Gestor): requer step-up authentication + justificativa; reserva orçamentária é liberada automaticamente.
- ✅* Exportar (Coordenador): apenas projetos sob sua gestão.
- ✅* Exportar (Compliance): apenas relatório de status — sem dados financeiros.

---

## 10. Módulo: Base de Conhecimento

### 10.1 Matriz de Permissões

| Operação | Usuário | Analista | Coordenador | Compliance | Gestor | Administrador |
|----------|:-------:|:--------:|:-----------:|:----------:|:------:|:-------------:|
| **Visualizar** artigos publicados (END_USER) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Visualizar** artigos técnicos publicados | ❌ | ✅ | ✅ | ✅* | ✅ | ✅ |
| **Visualizar** artigos em rascunho | ❌ | ✅* | ✅ | ❌ | ✅ | ✅ |
| **Visualizar** artigos gerados por IA (DRAFT_AI) | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Buscar** artigos | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Criar** artigo | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Editar** próprio artigo (DRAFT) | ❌ | ✅* | ✅* | ❌ | ✅ | ✅ |
| **Editar** qualquer artigo (DRAFT) | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Editar** artigo publicado | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Submeter** para revisão | ❌ | ✅* | ✅ | ❌ | ✅ | ✅ |
| **Revisar** artigo | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Aprovar** e **Publicar** artigo | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Reprovar** artigo na revisão | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Deprecar** artigo | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Excluir** artigo | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Vincular** artigo a ticket | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Avaliar** artigo (👍/👎) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Gerenciar** categorias | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Gerenciar** tags | ❌ | ❌ | ✅* | ❌ | ✅ | ✅ |
| **Exportar** artigos | ❌ | ❌ | ✅* | ✅* | ✅ | ✅ |
| **Administrar** fluxo editorial | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

**Notas:**
- ✅* Artigos técnicos (Compliance): apenas artigos relacionados a políticas e procedimentos; sem artigos de troubleshooting técnico restrito.
- ✅* Visualizar rascunhos (Analista): apenas rascunhos próprios.
- ✅* Editar (Analista/Coordenador): apenas artigos de autoria própria com status `DRAFT`.
- ✅* Submeter para revisão (Analista): apenas artigos de sua autoria.
- ✅* Gerenciar tags (Coordenador): criar e associar tags; sem excluir tags em uso.
- ✅* Exportar (Coordenador): artigos do seu domínio de especialidade.
- ✅* Exportar (Compliance): apenas artigos de políticas e normas.

---

## 11. Módulo: Dashboard

### 11.1 Matriz de Permissões

| Dashboard / Componente | Usuário | Analista | Coordenador | Compliance | Gestor | Administrador |
|-----------------------|:-------:|:--------:|:-----------:|:----------:|:------:|:-------------:|
| **Dashboard Operacional** — Fila do técnico | ❌ | ✅* | ✅ | ❌ | ✅ | ✅ |
| **Dashboard Operacional** — Visão geral equipe | ❌ | ❌ | ✅* | ❌ | ✅ | ✅ |
| **Dashboard Operacional** — SLA em risco | ❌ | ✅* | ✅ | ❌ | ✅ | ✅ |
| **Dashboard Operacional** — Alertas técnicos | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Dashboard Executivo** — KPIs globais | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Dashboard Executivo** — SLA global | ❌ | ❌ | ✅* | ❌ | ✅ | ✅ |
| **Dashboard Executivo** — CSAT | ❌ | ❌ | ✅* | ❌ | ✅ | ✅ |
| **Dashboard de Compliance** | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Dashboard Financeiro** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Dashboard de Projetos** | ❌ | ❌ | ✅* | ❌ | ✅ | ✅ |
| **Dashboard de Ativos** — Inventário | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Dashboard de Ativos** — Alertas de garantia | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Dashboard de IAM** — Revisões pendentes | ❌ | ❌ | ❌ | ✅* | ✅ | ✅ |
| **KPIs** — Consultar definições | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **KPIs** — Criar / Editar definição | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **KPIs** — Histórico de valores | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Relatórios** — Exportar PDF/Excel | ❌ | ❌ | ✅* | ✅* | ✅ | ✅ |
| **Administrar** configurações de dashboard | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

**Notas:**
- ✅* Fila do técnico (Analista): apenas própria fila e fila do grupo.
- ✅* SLA em risco (Analista): apenas chamados atribuídos a si ou ao grupo.
- ✅* Visão geral equipe (Coordenador): apenas dados do grupo/especialidade sob sua coordenação.
- ✅* SLA global e CSAT (Coordenador): dados agregados sem identificação individual de técnicos.
- ✅* Projetos (Coordenador): apenas projetos dos quais é membro ou gerente.
- ✅* IAM — Revisões (Compliance): apenas visão de revisões pendentes; sem dados de usuário individual.
- ✅* Exportar (Coordenador): relatórios operacionais do seu escopo; sem dados financeiros.
- ✅* Exportar (Compliance): relatórios de compliance e auditoria exclusivamente.

---

## 12. Módulo: Administração

### 12.1 Matriz de Permissões

| Operação | Usuário | Analista | Coordenador | Compliance | Gestor | Administrador |
|----------|:-------:|:--------:|:-----------:|:----------:|:------:|:-------------:|
| **Configurar** catálogo de serviços | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Configurar** SLAs | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Configurar** departamentos e BUs | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Configurar** centros de custo | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Gerenciar** integrações (GLPI, Google) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Forçar** sincronização GLPI | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Forçar** sincronização Google | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Gerenciar** API Keys | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Atribuir** papel até Coordenador | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Atribuir** papel Gestor | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Atribuir** papel Administrador | ❌ | ❌ | ❌ | ❌ | ❌ | 🔒 |
| **Revogar** qualquer sessão de usuário | ❌ | ❌ | ❌ | ❌ | ✅* | ✅ |
| **Habilitar** login por e-mail | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Configurar** templates de notificação | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Visualizar** logs de sistema | ❌ | ❌ | ❌ | ❌ | ✅* | ✅ |
| **Visualizar** log de auditoria completo | ❌ | ❌ | ❌ | ✅* | ✅* | ✅ |
| **Exportar** log de auditoria | ❌ | ❌ | ❌ | 🔒 | ❌ | 🔒 |
| **Configurar** retenção de dados | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Executar** job de anonimização (LGPD) | ❌ | ❌ | ❌ | ❌ | ❌ | 🔒 |
| **Gerenciar** health check e monitoramento | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Configurar** parâmetros do sistema | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Criar** tenant (multiempresa) | ❌ | ❌ | ❌ | ❌ | ❌ | 🔒 |

**Notas:**
- ✅* Revogar sessão (Gestor): apenas usuários com papel até `IT_SPECIALIST`; não pode revogar sessões de outros Gestores ou Administradores.
- ✅* Logs de sistema (Gestor): apenas logs de nível `ERROR` e `WARN` dos módulos sob sua responsabilidade; sem access log de outros usuários.
- ✅* Log de auditoria (Compliance): apenas ações relacionadas a compliance e acessos concedidos/revogados; sem log de autenticação e dados financeiros.
- ✅* Log de auditoria (Gestor): apenas ações da equipe de TI; sem log de Administrador.
- 🔒 Exportar log de auditoria (Compliance/Administrador): requer step-up authentication; registra automaticamente quem exportou, quando e quais filtros foram aplicados.
- 🔒 Atribuir Administrador: requer aprovação de outro Administrador ativo; não pode ser autoatribuído.
- 🔒 Anonimização: requer step-up + justificativa formal + registro no módulo Compliance.
- 🔒 Criar tenant: operação de alto impacto; requer step-up + confirmação por e-mail enviado ao Administrador.

---

## 13. Herança de Permissões

### 13.1 Modelo de Herança

O SGTI adota um modelo de **herança parcial declarativa** — as permissões são definidas explicitamente por papel, mas papéis superiores na hierarquia acumulam as permissões operacionais (não administrativas) dos papéis inferiores.

```
HIERARQUIA DE HERANÇA
──────────────────────

SUPER_ADMIN
  ↑ herda operacional de todos
IT_MANAGER
  ↑ herda operacional de:
    IT_SPECIALIST
    COMPLIANCE_OFFICER (compliance operacional)
    FINANCIAL_ANALYST  (visão financeira)
    IT_TECHNICIAN
IT_SPECIALIST
  ↑ herda operacional de:
    IT_TECHNICIAN
IT_TECHNICIAN
  ↑ herda operacional de:
    END_USER

COMPLIANCE_OFFICER: papel independente — sem herança de IT_TECHNICIAN
FINANCIAL_ANALYST:  papel independente — sem herança de IT_TECHNICIAN
AUDITOR:            papel transversal — leitura ampla sem herança de escrita
EXECUTIVE:          papel transversal — dashboards sem herança de operações
```

### 13.2 O que é Herdado

| Herança | Inclui | Não Inclui |
|---------|--------|------------|
| `IT_MANAGER` herda de `IT_SPECIALIST` | Gestão de problemas, publicação de workarounds, coordenação de grupos | Permissões administrativas do Gestor |
| `IT_MANAGER` herda de `IT_TECHNICIAN` | Criação e resolução de chamados, gestão de ativos, edição de artigos KB | — |
| `IT_MANAGER` herda de `END_USER` | Abertura de chamados próprios, visualização KB pública | — |
| `IT_SPECIALIST` herda de `IT_TECHNICIAN` | Criação e resolução de chamados, gestão básica de ativos, rascunhos KB | Publicação de artigos KB (requer IT_MANAGER) |
| `IT_TECHNICIAN` herda de `END_USER` | Abertura de chamados, KB pública, avaliações | — |

### 13.3 Exceções de Herança

Os seguintes casos NÃO são herdados, mesmo para papéis superiores, devido a segregação de funções:

| Situação | Restrição Mesmo para Papéis Superiores |
|----------|----------------------------------------|
| Aprovação de própria requisição | Gestor não pode aprovar requisição que ele mesmo criou |
| Aprovação de própria despesa financeira | Gestor não pode aprovar lançamento que ele mesmo registrou |
| Aprovação de evidência de compliance coletada por si | Compliance não pode aprovar evidência que coletou |
| Auditoria de próprias ações | Nenhum papel pode auditar/excluir os próprios registros de auditoria |
| Autoatribuição do papel mais alto | Administrador não pode se autoatribuir ou promover a si mesmo |

---

## 14. Papéis Especializados

### 14.1 Analista Financeiro (FINANCIAL_ANALYST)

Papel dedicado à gestão financeira de TI. **Não herda** de `IT_TECHNICIAN`.

| Módulo | Permissões |
|--------|-----------|
| Financeiro | CRUD completo (exceto aprovar próprios lançamentos) |
| Compras | Visualizar pedidos; registrar recebimentos |
| Projetos | Visualizar custos; registrar lançamentos financeiros |
| Ativos | Visualizar dados financeiros (valor, depreciação) |
| Dashboard | Dashboard Financeiro completo |
| Relatórios | Relatórios financeiros completos |
| Incidentes/Requisições | Apenas leitura básica — sem operações de Service Desk |

### 14.2 Gestor de Projetos (PROJECT_MANAGER)

| Módulo | Permissões |
|--------|-----------|
| Projetos | CRUD completo + aprovação de projeto |
| Compras | Criar requisição; visualizar pedidos vinculados ao projeto |
| Financeiro | Visualizar orçamento do projeto; registrar custos |
| Ativos | Visualizar ativos vinculados ao projeto |
| Dashboard | Dashboard de Projetos + resumo operacional |
| Relatórios | Relatórios de projetos |

### 14.3 Auditor (AUDITOR)

Papel transversal de **leitura ampla** sem capacidade de escrita. Acesso para fins de auditoria interna ou externa.

| Módulo | Permissões |
|--------|-----------|
| Todos os módulos | Somente leitura (sem criar, editar ou excluir) |
| Compliance | Leitura completa incluindo evidências e planos de ação |
| Identidades | Leitura de histórico de acessos e revisões |
| Financeiro | Leitura de contratos e orçamentos |
| Audit Log | Acesso completo ao log de auditoria (leitura) |
| Exportação | Pode exportar com aprovação do Gestor; gera auditoria |

**Restrição:** O `AUDITOR` não pode alterar nada. Qualquer tentativa de escrita retorna `403 FORBIDDEN`.

### 14.4 Executivo (EXECUTIVE)

Papel transversal para alta direção. Foco em visibilidade estratégica.

| Módulo | Permissões |
|--------|-----------|
| Dashboard Executivo | Acesso completo |
| Dashboard Financeiro | Acesso completo (resumo executivo) |
| Dashboard de Compliance | Acesso completo |
| KPIs | Visualizar todos os KPIs e histórico |
| Relatórios | Todos os relatórios executivos (PDF) |
| Demais módulos | Apenas visualização de resumos executivos; sem acesso operacional |

---

## 15. Segregação de Funções

### 15.1 Princípio

A segregação de funções (*Segregation of Duties* — SoD) garante que operações críticas não possam ser realizadas por uma única pessoa, eliminando oportunidades de fraude, erro não detectado e abuso de privilégio.

### 15.2 Regras de Segregação Obrigatórias

| ID | Operação Conflitante A | Operação Conflitante B | Impacto | Controle |
|----|------------------------|------------------------|---------|---------|
| **SoD-01** | Criar requisição de compra | Aprovar a mesma requisição | Fraude em compras | Validação no Use Case de aprovação |
| **SoD-02** | Registrar despesa financeira | Aprovar a mesma despesa | Fraude financeira | Validação no Use Case de aprovação |
| **SoD-03** | Coletar evidência de compliance | Aprovar a mesma evidência | Manipulação de auditoria | Validação no Use Case de aprovação |
| **SoD-04** | Criar usuário / provisionar | Aprovar provisionamento | Criação não autorizada de acesso | Aprovação dupla para papéis privilegiados |
| **SoD-05** | Solicitar acesso (requisição) | Aprovar a própria requisição | Concessão de acesso indevido | Validação: `requesterId != approverId` |
| **SoD-06** | Registrar lançamento CAPEX | Aprovar o mesmo lançamento | Desvio de capital | Validação no Use Case de aprovação |
| **SoD-07** | Criar contrato com fornecedor | Aprovar pagamento ao mesmo fornecedor | Conflito de interesse | Revisão manual + alerta automático |
| **SoD-08** | Executar fulfillment de requisição | Fechar a mesma requisição como concluída | Ateste falso | Validação: diferentes usuários para executar e confirmar |
| **SoD-09** | Provisionar acesso de usuário | Ser o próprio gestor do usuário provisionado | Nepotismo de acesso | Revisão obrigatória por segundo Gestor |
| **SoD-10** | Realizar auditoria interna | Ser responsável pelo controle auditado | Independência de auditoria | Validação de conflito no Use Case de auditoria |

### 15.3 Implementação Técnica das Regras SoD

```
IMPLEMENTAÇÃO NO USE CASE (exemplo SoD-01):

ApproveRequestUseCase.execute(approverId, requestId):
  1. Buscar a Request pelo requestId
  2. Verificar:
     IF request.requesterId == approverId:
       THROW SelfApprovalForbiddenException
       (HTTP 422: BUSINESS_RULE_VIOLATION / SELF_APPROVAL_NOT_ALLOWED)
  3. Continuar com aprovação...

IMPLEMENTAÇÃO NO USE CASE (exemplo SoD-03):

ApproveEvidenceUseCase.execute(reviewerId, evidenceId):
  1. Buscar a Evidence pelo evidenceId
  2. Verificar:
     IF evidence.uploadedBy == reviewerId:
       THROW SelfApprovalForbiddenException
       (HTTP 422: SELF_REVIEW_NOT_ALLOWED)
  3. Continuar com aprovação...
```

### 15.4 Monitoramento de Conflitos SoD

O sistema monitora automaticamente e alerta para:
- Usuário que cria E aprova >3 requisições no mesmo mês (possível bypass de controles).
- Usuário com papéis potencialmente conflitantes atribuídos simultaneamente.
- Padrão anômalo de aprovações de próprios subordinados.

Alertas enviados para IT_MANAGER e Compliance Officer semanalmente.

---

## 16. Restrições por Perfil

### 16.1 Restrições do Perfil Usuário (END_USER)

| Restrição | Descrição |
|-----------|-----------|
| **Escopo de dados** | Acessa apenas registros onde é solicitante; sem visibilidade de dados de terceiros |
| **Sem acesso a módulos internos** | Ativos, Identidades, Compliance, Financeiro, Compras, Projetos são invisíveis |
| **CSAT obrigatório** | Para reabrir chamado fechado, deve fornecer motivo; CSAT é incentivado mas não obrigatório |
| **Restrição de edição** | Só pode editar chamados com status `OPEN` e antes de atribuição técnica |
| **Sem escalada manual** | Não pode escalar chamados — escalonamento é automático por SLA ou feito pelo técnico |
| **Sem acesso a comentários internos** | Comentários marcados como `INTERNAL` são invisíveis |

### 16.2 Restrições do Perfil Analista (IT_TECHNICIAN)

| Restrição | Descrição |
|-----------|-----------|
| **Atribuição limitada** | Pode atribuir chamados apenas a si mesmo ou ao próprio grupo |
| **Sem publicação KB** | Pode criar e editar artigos em DRAFT; publicação requer IT_MANAGER |
| **Sem acesso financeiro** | Módulo financeiro completamente restrito |
| **Sem gestão de usuários** | Não pode criar, editar ou suspender usuários |
| **Sem descomissionamento** | Pode registrar manutenção mas não descomissionar ativos |
| **Relatórios limitados** | Apenas relatórios operacionais do próprio grupo |

### 16.3 Restrições do Perfil Coordenador (IT_SPECIALIST)

| Restrição | Descrição |
|-----------|-----------|
| **Sem publicação KB** | Pode submeter para revisão; publicação requer IT_MANAGER |
| **Descomissionamento com aprovação** | Pode solicitar; requer aprovação formal do Gestor |
| **Sem gestão de IAM** | Pode ver grupos; sem provisionar ou revogar acessos de usuários |
| **Sem acesso financeiro detalhado** | Apenas visão de custos agregados do departamento |
| **Sem criação de projetos** | Pode gerenciar projetos atribuídos; não pode criar novos |
| **Escopo de dados** | Relatórios e dashboards limitados ao próprio grupo/departamento |

### 16.4 Restrições do Perfil Compliance (COMPLIANCE_OFFICER)

| Restrição | Descrição |
|-----------|-----------|
| **Segregação de evidências** | Não pode aprovar evidências que coletou |
| **Sem operações de Service Desk** | Pode visualizar chamados; sem atribuir, resolver ou editar |
| **Sem escrita em módulos não-compliance** | Leitura em outros módulos é para correlação; sem escrever |
| **Auditoria independente** | Não pode auditar controles pelos quais é responsável direto |
| **Exportação de evidências** | Requer aprovação do Gestor para exportar para auditores externos |

### 16.5 Restrições do Perfil Gestor (IT_MANAGER)

| Restrição | Descrição |
|-----------|-----------|
| **Segregação financeira** | Não pode aprovar os próprios lançamentos financeiros |
| **Segregação de compras** | Não pode aprovar as próprias requisições de compra |
| **Limite de atribuição de papéis** | Não pode atribuir papéis acima de IT_SPECIALIST; SUPER_ADMIN exclusivo ao Administrador |
| **Acesso ao audit_log** | Limitado — não pode acessar logs do Administrador ou de si mesmo |
| **Revogação de sessão** | Apenas para usuários com papel abaixo do próprio |
| **Aprovação > R$10.000** | Requer step-up authentication para compras de alto valor |

### 16.6 Restrições do Perfil Administrador (SUPER_ADMIN)

| Restrição | Descrição |
|-----------|-----------|
| **Sessão única** | Máximo 1 sessão ativa simultaneamente |
| **Timeout rigoroso** | Inatividade de 30 minutos encerra a sessão |
| **Monitoramento total** | Todo login gera notificação à equipe de segurança |
| **Autoatribuição proibida** | Não pode elevar próprio papel ou criar outro Administrador sem aprovação |
| **Anonimização com step-up** | Toda operação irreversível requer reautenticação |
| **Limite máximo** | Máximo 2 Administradores ativos por tenant |
| **Auditoria integral** | 100% das ações auditadas sem exceção |

---

## 17. Conformidade e Compliance das Permissões

### 17.1 Requisitos de Revisão Periódica

| Papel | Frequência de Revisão | Revisor | Ação se Não Renovado |
|-------|:--------------------:|---------|---------------------|
| END_USER | Anual | Gestor direto | Mantém acesso (papel básico) |
| IT_TECHNICIAN | Semestral | IT_MANAGER | Rebaixado para END_USER |
| IT_SPECIALIST | Trimestral | IT_MANAGER | Rebaixado para IT_TECHNICIAN |
| COMPLIANCE_OFFICER | Trimestral | IT_MANAGER | Rebaixado para END_USER |
| FINANCIAL_ANALYST | Trimestral | IT_MANAGER | Rebaixado para END_USER |
| PROJECT_MANAGER | Trimestral | IT_MANAGER | Rebaixado para END_USER |
| AUDITOR | Semestral | IT_MANAGER | Papel revogado |
| EXECUTIVE | Semestral | IT_MANAGER | Papel revogado |
| IT_MANAGER | Semestral | SUPER_ADMIN | Rebaixado para IT_SPECIALIST |
| SUPER_ADMIN | Trimestral | Segundo SUPER_ADMIN | Papel suspenso para revisão |

### 17.2 Alertas de Conformidade das Permissões

| Condição | Alerta Para | Prazo de Resolução |
|----------|------------|:-----------------:|
| Usuário com papel privilegiado sem MFA no Google | IT_MANAGER | 48 horas |
| Revisão de acesso atrasada > 15 dias | IT_MANAGER | 7 dias |
| Usuário sem atividade há > 60 dias com papel ativo | IT_MANAGER | 15 dias |
| Mais de 2 papéis conflitantes atribuídos | IT_MANAGER + Compliance | Imediato |
| Violação SoD detectada (aprovação própria) | IT_MANAGER | Imediato |
| Administrador sem atividade há > 30 dias | Segundo SUPER_ADMIN | 7 dias |
| Tentativa de escalada de privilégios | IT_MANAGER + SUPER_ADMIN | Imediato |

### 17.3 Rastreabilidade para Auditoria

Todas as operações listadas nas matrizes acima geram registro automático em `shared.audit_log`. Para fins de auditoria, o sistema garante:

- **Quem** realizou a operação (`user_id`, `user_role`).
- **Quando** foi realizado (`occurred_at` — preenchido pelo banco).
- **O quê** foi alterado (`old_values`, `new_values` em JSONB).
- **De onde** foi realizado (`ip_address`, `user_agent`).
- **Por que** foi realizado (`reason` — obrigatório para operações críticas).
- **Em qual contexto** (`session_id`, `request_id`).

O log de auditoria é **imutável** (RLS INSERT-only) e retido por **5 anos**.

### 17.4 Evidências de Conformidade das Permissões

O módulo de Compliance do SGTI mantém automaticamente as seguintes evidências:

| Evidência | Frequência | Responsável |
|-----------|-----------|------------|
| Relatório de papéis ativos por usuário | Mensal | Sistema (automático) |
| Relatório de revisões de acesso concluídas | Trimestral | IT_MANAGER |
| Log de atribuições e revogações de papéis | Contínuo | Sistema (AuditLog) |
| Evidência de segregação de funções (sem violações) | Mensal | Sistema (automático) |
| Relatório de usuários com papéis conflitantes | Semanal | Sistema (automático) |

---

## 18. Glossário de Operações

| Operação | Definição no Contexto do SGTI |
|----------|-------------------------------|
| **Visualizar** | Ler e exibir dados de um ou mais registros. Sem modificação. |
| **Criar** | Gerar um novo registro no sistema. Operação irreversível sem soft delete. |
| **Editar** | Modificar campos de um registro existente. Gera registro de auditoria com `old_values`. |
| **Excluir** | Soft delete — marcar registro como excluído (`deleted_at`). Nunca exclusão física. |
| **Aprovar** | Confirmar formalmente uma operação submetida por outro usuário. Sujeto a SoD. |
| **Exportar** | Gerar arquivo (PDF, Excel, CSV) com dados do sistema para uso externo. Gera auditoria obrigatória. |
| **Administrar** | Configurar parâmetros, categorias, templates e comportamentos do módulo. Operação privilegiada. |
| **Publicar** | Tornar um registro visível para audiência mais ampla (ex: artigo KB, política). |
| **Cancelar** | Encerrar operação/registro antes da conclusão. Requer justificativa. |
| **Suspender** | Desativar temporariamente acesso ou funcionalidade, reversível. |
| **Deprecar** | Marcar como obsoleto mantendo histórico. Sem aceitar novos registros vinculados. |
| **Vincular** | Criar associação entre dois registros existentes (ex: incidente ↔ problema). |
| **Transferir** | Alterar responsabilidade de um registro de um usuário/grupo para outro. |
| **Provisionar** | Criar e configurar acesso de usuário em sistemas externos (Google Workspace). |
| **Desprovisionar** | Revogar e remover acesso de usuário em sistemas externos. Operação crítica de segurança. |

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição da Alteração |
|--------|------|-------|------------------------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação do documento com matriz completa de 12 módulos |

---

> **Próximos documentos recomendados:**
> [`22_AUTHENTICATION.md`](./22_AUTHENTICATION.md) — Estratégia de autenticação e implementação técnica do RBAC
> [`14_SECURITY_REQUIREMENTS.md`](./14_SECURITY_REQUIREMENTS.md) — Requisitos de segurança (OWASP ASVS, segregação de funções)
> [`21_API_SPEC.md`](./21_API_SPEC.md) — Especificação dos endpoints com permissões por papel
