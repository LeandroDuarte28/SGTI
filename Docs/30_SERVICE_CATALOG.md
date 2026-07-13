# SGTI — Sistema de Gestão de Tecnologia da Informação
## Catálogo de Serviços Corporativo

> **Classificação:** Interno — Público (colaboradores)
> **Versão:** 1.0.0
> **Status:** Aprovado para Publicação
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [20_DATABASE.md](./20_DATABASE.md) · [24_BUSINESS_RULES.md](./24_BUSINESS_RULES.md) · [23_USER_ROLES.md](./23_USER_ROLES.md)

---

## Sobre este Documento

Este documento define o **Catálogo de Serviços Corporativo do SGTI** — repositório formal de todos os serviços de TI oferecidos à organização. Serve como referência para usuários finais que precisam solicitar serviços e como base de configuração do módulo `catalog.ServiceCatalog`.

### Convenções de SLA

Prazos calculados em **minutos de horário comercial** (08h–18h, seg–sex), exceto serviços com indicação `24×7`.

| Nível | 1º Atendimento | Resolução |
|:-----:|:--------------:|:---------:|
| **CRÍTICO** | 15 min | 2 horas |
| **ALTO** | 30 min | 4 horas |
| **MÉDIO** | 2 horas | 8 horas |
| **BAIXO** | 4 horas | 3 dias úteis |
| **PLANEJADO** | 1 dia útil | 5 dias úteis |

### Criticidade

| Criticidade | Definição |
|:-----------:|-----------|
| **CRÍTICO** | Indisponibilidade compromete operações essenciais do negócio |
| **ALTO** | Impacto significativo na produtividade de múltiplos colaboradores |
| **MÉDIO** | Impacto individual ou em grupos pequenos, sem paralisação |
| **BAIXO** | Serviços de suporte, melhorias e solicitações de conveniência |

---

## 1. Service Desk

**Categoria:** Suporte técnico ao colaborador — equipamentos, sistemas operacionais, periféricos e dúvidas gerais.

---

### SDS-001 — Suporte a Hardware de Workstation

| Campo | Valor |
|-------|-------|
| **Nome** | Suporte a Hardware de Workstation |
| **Categoria** | Service Desk |
| **Descrição** | Diagnóstico e resolução de problemas físicos em desktops, notebooks e workstations corporativas. Inclui falhas de hardware, lentidão extrema por componentes, telas com defeito e periféricos integrados. |
| **Tipo de chamado** | Incidente |
| **Responsável** | Equipe de Suporte N1 — Analistas de TI |
| **Audiência** | Usuário Final |
| **Criticidade** | ALTO |
| **SLA Resposta** | 30 minutos |
| **SLA Resolução** | 4 horas (substituição temporária em 2h se reparo não for possível no dia) |
| **Disponibilidade** | Horário comercial |
| **Notas** | Equipamento irrecuperável no dia: usuário recebe reserva. Peça necessária: processo de compras acionado. |

---

### SDS-002 — Instalação e Configuração de Software

| Campo | Valor |
|-------|-------|
| **Nome** | Instalação e Configuração de Software |
| **Categoria** | Service Desk |
| **Descrição** | Instalação, atualização ou remoção de softwares corporativos homologados na estação de trabalho. Inclui pacotes de escritório, clientes de e-mail, VPN e demais aplicações do portfólio. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de Suporte N1 |
| **Audiência** | Usuário Final |
| **Criticidade** | MÉDIO |
| **SLA Resposta** | 2 horas |
| **SLA Resolução** | 8 horas |
| **Fluxo de Aprovação** | Verificação automática de licença; IT_MANAGER para softwares fora do portfólio |
| **Notas** | Softwares não homologados requerem justificativa e aprovação do IT_MANAGER. |

---

### SDS-003 — Redefinição de Senha de Sistema

| Campo | Valor |
|-------|-------|
| **Nome** | Redefinição de Senha de Sistema |
| **Categoria** | Service Desk |
| **Descrição** | Redefinição de senhas de acesso a sistemas corporativos internos quando o colaborador não consegue fazer login por esquecimento ou bloqueio de conta. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de Suporte N1 |
| **Audiência** | Usuário Final |
| **Criticidade** | ALTO |
| **SLA Resposta** | 30 minutos |
| **SLA Resolução** | 1 hora |
| **Notas** | Senha do Google Workspace é redefinida pelo colaborador via portal Google. Este serviço cobre apenas sistemas internos sem SSO. Validação de identidade obrigatória. |

---

### SDS-004 — Configuração de Impressora e Scanner

| Campo | Valor |
|-------|-------|
| **Nome** | Configuração de Impressora e Scanner |
| **Categoria** | Service Desk |
| **Descrição** | Instalação de drivers, configuração de conexão de rede e resolução de problemas com impressoras e scanners compartilhados ou locais. |
| **Tipo de chamado** | Incidente / Requisição |
| **Responsável** | Equipe de Suporte N1 |
| **Audiência** | Usuário Final |
| **Criticidade** | MÉDIO |
| **SLA Resposta** | 2 horas |
| **SLA Resolução** | 4 horas |
| **Notas** | Consumíveis (papel, toner) são tratados com facilities. TI cuida apenas de configuração e conectividade. |

---

### SDS-005 — Suporte a Dispositivos Móveis Corporativos

| Campo | Valor |
|-------|-------|
| **Nome** | Suporte a Dispositivos Móveis Corporativos |
| **Categoria** | Service Desk |
| **Descrição** | Configuração e suporte de smartphones e tablets corporativos (iOS e Android). Inclui configuração de e-mail, aplicativos de negócio e MDM. |
| **Tipo de chamado** | Incidente / Requisição |
| **Responsável** | Equipe de Suporte N1 |
| **Audiência** | Usuário Final |
| **Criticidade** | MÉDIO |
| **SLA Resposta** | 2 horas |
| **SLA Resolução** | 8 horas |
| **Notas** | Dispositivos pessoais (BYOD) não são suportados pela TI corporativa. |

---

### SDS-006 — Kit de Equipamentos para Novo Colaborador

| Campo | Valor |
|-------|-------|
| **Nome** | Kit de Equipamentos — Onboarding |
| **Categoria** | Service Desk |
| **Descrição** | Requisição do kit completo de equipamentos para onboarding: notebook/desktop, teclado, mouse, headset e periféricos definidos pelo perfil do cargo. Abertura pelo gestor com antecedência mínima de 5 dias úteis. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de Suporte N1 |
| **Audiência** | IT_MANAGER, IT_SPECIALIST |
| **Criticidade** | ALTO |
| **SLA Resposta** | 8 horas |
| **SLA Resolução** | 5 dias úteis |
| **Fluxo de Aprovação** | IT_MANAGER (automático se dentro do orçamento aprovado) |
| **Notas** | Abrir com 5 dias úteis antes da admissão. Equipamentos fora do padrão requerem aprovação adicional. |

---

### SDS-007 — Suporte Remoto à Estação de Trabalho

| Campo | Valor |
|-------|-------|
| **Nome** | Suporte Remoto à Estação de Trabalho |
| **Categoria** | Service Desk |
| **Descrição** | Atendimento remoto via ferramenta de acesso seguro para resolução de problemas de software, configurações e dúvidas sem necessidade de deslocamento do técnico. |
| **Tipo de chamado** | Incidente / Requisição |
| **Responsável** | Equipe de Suporte N1 |
| **Audiência** | Usuário Final |
| **Criticidade** | MÉDIO |
| **SLA Resposta** | 30 minutos |
| **SLA Resolução** | 2 horas |
| **Notas** | Requer consentimento explícito do usuário. Sessões registradas no sistema de auditoria. |

---

### SDS-008 — Formatação e Reinstalação de Estação de Trabalho

| Campo | Valor |
|-------|-------|
| **Nome** | Formatação / Reinstalação de Estação de Trabalho |
| **Categoria** | Service Desk |
| **Descrição** | Formatação, reinstalação do sistema operacional e configuração completa do ambiente padrão corporativo, incluindo todos os softwares do portfólio e integração ao domínio. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de Suporte N2 — Coordenadores de TI |
| **Audiência** | Usuário Final / Analista TI |
| **Criticidade** | MÉDIO |
| **SLA Resposta** | 4 horas |
| **SLA Resolução** | 1 dia útil |
| **Notas** | Usuário deve fazer backup antes da formatação. TI não se responsabiliza por dados perdidos. |

---

## 2. Infraestrutura e Servidores

**Categoria:** Gestão, manutenção e resolução de problemas em servidores, armazenamento e backup.

---

### INF-001 — Falha ou Indisponibilidade de Servidor

| Campo | Valor |
|-------|-------|
| **Nome** | Falha ou Indisponibilidade de Servidor |
| **Categoria** | Infraestrutura e Servidores |
| **Descrição** | Atendimento a incidentes de servidores físicos ou virtuais indisponíveis, com erros críticos, lentidão extrema ou comportamento anômalo que afeta serviços hospedados. |
| **Tipo de chamado** | Incidente |
| **Responsável** | Equipe de Infraestrutura N2/N3 |
| **Audiência** | IT_TECHNICIAN+ |
| **Criticidade** | CRÍTICO |
| **SLA Resposta** | 15 minutos |
| **SLA Resolução** | 2 horas |
| **Disponibilidade** | 24×7 |
| **Notas** | Incidentes em produção com impacto generalizado acionam IT_MANAGER imediatamente. Comunicação de status a cada 30 minutos. |

---

### INF-002 — Provisionamento de Servidor Virtual (VM)

| Campo | Valor |
|-------|-------|
| **Nome** | Provisionamento de Servidor Virtual |
| **Categoria** | Infraestrutura e Servidores |
| **Descrição** | Criação, configuração e entrega de nova máquina virtual no ambiente de virtualização corporativo ou em nuvem, conforme especificações aprovadas. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de Infraestrutura N2 |
| **Audiência** | IT_SPECIALIST+, IT_MANAGER |
| **Criticidade** | ALTO |
| **SLA Resposta** | 4 horas |
| **SLA Resolução** | 3 dias úteis |
| **Fluxo de Aprovação** | IT_MANAGER obrigatório + análise de capacidade |
| **Notas** | Preencher formulário técnico: CPU, memória, disco, SO e finalidade. |

---

### INF-003 — Falha ou Recuperação de Backup

| Campo | Valor |
|-------|-------|
| **Nome** | Falha ou Recuperação de Backup |
| **Categoria** | Infraestrutura e Servidores |
| **Descrição** | Investigação de falhas no processo de backup, verificação de integridade e execução de restore de dados a partir de cópias de segurança. |
| **Tipo de chamado** | Incidente / Requisição |
| **Responsável** | Equipe de Infraestrutura N2/N3 |
| **Audiência** | IT_TECHNICIAN+ |
| **Criticidade** | CRÍTICO |
| **SLA Resposta** | 15 minutos |
| **SLA Resolução** | 4 horas |
| **Disponibilidade** | 24×7 para recuperação de dados críticos |
| **Notas** | Restores de bases de produção requerem aprovação do IT_MANAGER e janela de manutenção. |

---

### INF-004 — Expansão de Armazenamento

| Campo | Valor |
|-------|-------|
| **Nome** | Expansão de Armazenamento |
| **Categoria** | Infraestrutura e Servidores |
| **Descrição** | Aumento de capacidade de disco em servidores, VMs, storage de rede (NAS/SAN) ou contas de armazenamento em nuvem. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de Infraestrutura N2 |
| **Audiência** | IT_SPECIALIST+ |
| **Criticidade** | MÉDIO |
| **SLA Resposta** | 4 horas |
| **SLA Resolução** | 2 dias úteis |
| **Fluxo de Aprovação** | IT_MANAGER se expansão gerar custo adicional |
| **Notas** | Alertas de uso > 80% devem ser tratados antes de atingir 95%. |

---

### INF-005 — Manutenção Programada de Infraestrutura

| Campo | Valor |
|-------|-------|
| **Nome** | Manutenção Programada de Infraestrutura |
| **Categoria** | Infraestrutura e Servidores |
| **Descrição** | Janelas de manutenção agendadas para patches de segurança, atualizações de firmware, reinicializações e atividades que requerem indisponibilidade planejada. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de Infraestrutura N2/N3 |
| **Audiência** | IT_SPECIALIST+ |
| **Criticidade** | MÉDIO |
| **SLA Resposta** | 1 dia útil |
| **SLA Resolução** | Conforme cronograma acordado |
| **Fluxo de Aprovação** | IT_MANAGER obrigatório; comunicação aos usuários afetados com 24h de antecedência |
| **Notas** | Manutenções em produção preferencialmente fora do horário comercial. |

---

### INF-006 — Investigação de Performance de Servidor

| Campo | Valor |
|-------|-------|
| **Nome** | Investigação de Performance de Servidor |
| **Categoria** | Infraestrutura e Servidores |
| **Descrição** | Análise e diagnóstico de degradação de performance: alta utilização de CPU, memória, I/O de disco ou rede causando lentidão em serviços e aplicações. |
| **Tipo de chamado** | Incidente |
| **Responsável** | Equipe de Infraestrutura N2 |
| **Audiência** | IT_TECHNICIAN+ |
| **Criticidade** | ALTO |
| **SLA Resposta** | 30 minutos |
| **SLA Resolução** | 4 horas |
| **Notas** | Alertas automáticos ao sistema de monitoramento quando CPU > 85% ou memória > 90% por mais de 5 minutos. |

---

## 3. Redes e Conectividade

**Categoria:** Suporte à conectividade LAN, Wi-Fi corporativo, internet, VPN e demais componentes de rede.

---

### NET-001 — Falha de Conectividade de Rede (LAN/Wi-Fi)

| Campo | Valor |
|-------|-------|
| **Nome** | Falha de Conectividade de Rede |
| **Categoria** | Redes e Conectividade |
| **Descrição** | Resolução de problemas de falta de acesso à rede local cabeada ou sem fio corporativa. Inclui falhas de switch, ponto de acesso wireless, cabos e configurações TCP/IP. |
| **Tipo de chamado** | Incidente |
| **Responsável** | Equipe de Redes N2 |
| **Audiência** | Usuário Final / IT_TECHNICIAN+ |
| **Criticidade** | ALTO |
| **SLA Resposta** | 30 minutos |
| **SLA Resolução** | 2 horas (localizada) / 4 horas (generalizada) |
| **Disponibilidade** | 24×7 para falhas generalizadas |
| **Notas** | Falha impactando mais de 10 usuários simultaneamente eleva automaticamente para CRÍTICO. |

---

### NET-002 — Falha ou Lentidão de Acesso à Internet

| Campo | Valor |
|-------|-------|
| **Nome** | Falha ou Lentidão de Acesso à Internet |
| **Categoria** | Redes e Conectividade |
| **Descrição** | Diagnóstico e resolução de problemas de acesso à internet: indisponibilidade, lentidão significativa ou bloqueio indevido de sites e serviços corporativos. |
| **Tipo de chamado** | Incidente |
| **Responsável** | Equipe de Redes N2 |
| **Audiência** | Usuário Final / IT_TECHNICIAN+ |
| **Criticidade** | ALTO |
| **SLA Resposta** | 30 minutos |
| **SLA Resolução** | 4 horas |
| **Notas** | Falhas no link com operadora: comunicadas com número de protocolo e prazo de resolução externo. |

---

### NET-003 — Problema de Acesso à VPN Corporativa

| Campo | Valor |
|-------|-------|
| **Nome** | Problema de Acesso à VPN Corporativa |
| **Categoria** | Redes e Conectividade |
| **Descrição** | Resolução de problemas de conexão à VPN: falha de autenticação, certificado expirado, cliente com erro, conexão instável ou qualquer impedimento ao acesso remoto seguro. |
| **Tipo de chamado** | Incidente |
| **Responsável** | Equipe de Redes / Segurança N2 |
| **Audiência** | Usuário Final |
| **Criticidade** | ALTO |
| **SLA Resposta** | 30 minutos |
| **SLA Resolução** | 2 horas |
| **Notas** | Colaboradores em home office com VPN indisponível são priorizados por impacto no trabalho remoto. |

---

### NET-004 — Solicitação de Acesso à VPN Corporativa

| Campo | Valor |
|-------|-------|
| **Nome** | Solicitação de Acesso à VPN |
| **Categoria** | Redes e Conectividade |
| **Descrição** | Habilitação do acesso à VPN corporativa para colaboradores que necessitam trabalhar remotamente. Inclui criação de credenciais e instalação do cliente VPN. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de Redes / Segurança N2 |
| **Audiência** | Usuário Final |
| **Criticidade** | MÉDIO |
| **SLA Resposta** | 2 horas |
| **SLA Resolução** | 4 horas |
| **Fluxo de Aprovação** | IT_MANAGER com justificativa de necessidade |
| **Notas** | Acesso VPN requer aprovação do gestor direto e justificativa de negócio. |

---

### NET-005 — Configuração de VLAN e Segmentação de Rede

| Campo | Valor |
|-------|-------|
| **Nome** | Configuração de VLAN e Segmentação de Rede |
| **Categoria** | Redes e Conectividade |
| **Descrição** | Criação ou modificação de VLANs, roteamento entre sub-redes e ajustes na segmentação da rede corporativa para novos projetos, departamentos ou requisitos de segurança. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de Redes N3 — Especialistas |
| **Audiência** | IT_SPECIALIST+ |
| **Criticidade** | ALTO |
| **SLA Resposta** | 4 horas |
| **SLA Resolução** | 3 dias úteis |
| **Fluxo de Aprovação** | IT_MANAGER + análise de segurança |
| **Notas** | Mudanças na topologia requerem documentação e aprovação prévia. Execução em janela de manutenção. |

---

### NET-006 — Solicitação de Ponto de Rede (Cabeamento)

| Campo | Valor |
|-------|-------|
| **Nome** | Solicitação de Ponto de Rede |
| **Categoria** | Redes e Conectividade |
| **Descrição** | Instalação de novo ponto de rede cabeado em posição de trabalho, sala de reunião ou outro espaço. Inclui passagem de cabo, tomada RJ45 e patch cord. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de Redes N2 / Infraestrutura Física |
| **Audiência** | IT_MANAGER+ |
| **Criticidade** | BAIXO |
| **SLA Resposta** | 1 dia útil |
| **SLA Resolução** | 5 dias úteis |
| **Fluxo de Aprovação** | IT_MANAGER + Gestão de Facilities |
| **Notas** | Obras físicas requerem alinhamento com facilities e administração do prédio. |

---

## 4. Segurança da Informação

**Categoria:** Proteção de dados, controle de acesso, resposta a incidentes de segurança e conformidade.

---

### SEC-001 — Suspeita de Comprometimento de Conta

| Campo | Valor |
|-------|-------|
| **Nome** | Suspeita de Comprometimento de Conta |
| **Categoria** | Segurança da Informação |
| **Descrição** | Atendimento emergencial a suspeitas de acesso não autorizado a contas corporativas, vazamento de credenciais, phishing bem-sucedido ou indícios de comprometimento. |
| **Tipo de chamado** | Incidente |
| **Responsável** | Equipe de Segurança N3 |
| **Audiência** | Todos |
| **Criticidade** | CRÍTICO |
| **SLA Resposta** | 15 minutos |
| **SLA Resolução** | 2 horas |
| **Disponibilidade** | 24×7 |
| **Notas** | Ação imediata: revogar sessões ativas e suspender conta temporariamente. IT_MANAGER e SUPER_ADMIN notificados em tempo real. |

---

### SEC-002 — Detecção de Malware ou Ameaça em Endpoint

| Campo | Valor |
|-------|-------|
| **Nome** | Detecção de Malware em Endpoint |
| **Categoria** | Segurança da Informação |
| **Descrição** | Resposta a detecção de vírus, malware, ransomware ou outras ameaças em dispositivos corporativos. Inclui isolamento do endpoint, análise e remediação. |
| **Tipo de chamado** | Incidente |
| **Responsável** | Equipe de Segurança N2/N3 |
| **Audiência** | Usuário Final / IT_TECHNICIAN+ |
| **Criticidade** | CRÍTICO |
| **SLA Resposta** | 15 minutos |
| **SLA Resolução** | 4 horas |
| **Disponibilidade** | 24×7 |
| **Notas** | Endpoint infectado é isolado da rede imediatamente. Investigação de possível vazamento de dados obrigatória. |

---

### SEC-003 — Solicitação de Certificado Digital

| Campo | Valor |
|-------|-------|
| **Nome** | Solicitação de Certificado Digital |
| **Categoria** | Segurança da Informação |
| **Descrição** | Emissão, renovação ou revogação de certificados digitais para serviços, domínios, aplicações internas ou assinatura digital de documentos. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de Segurança N2 |
| **Audiência** | IT_TECHNICIAN+ |
| **Criticidade** | ALTO |
| **SLA Resposta** | 2 horas |
| **SLA Resolução** | 1 dia útil |
| **Fluxo de Aprovação** | IT_MANAGER para certificados de domínio e serviços de produção |
| **Notas** | Certificados com menos de 30 dias para expirar devem ser renovados com urgência. Alertas automáticos no SGTI. |

---

### SEC-004 — Revisão de Permissões e Acessos

| Campo | Valor |
|-------|-------|
| **Nome** | Revisão de Permissões e Acessos |
| **Categoria** | Segurança da Informação |
| **Descrição** | Auditoria dos acessos de um colaborador ou grupo para verificar aderência ao princípio do menor privilégio. Inclui revisão de sistemas, pastas e grupos corporativos. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de Segurança / IAM N2 |
| **Audiência** | IT_MANAGER+ |
| **Criticidade** | MÉDIO |
| **SLA Resposta** | 4 horas |
| **SLA Resolução** | 3 dias úteis |
| **Fluxo de Aprovação** | IT_MANAGER |
| **Notas** | Revisões periódicas trimestrais são iniciadas automaticamente pelo módulo de Identidades do SGTI. |

---

### SEC-005 — Resposta a Incidente de Vazamento de Dados

| Campo | Valor |
|-------|-------|
| **Nome** | Resposta a Vazamento de Dados (LGPD) |
| **Categoria** | Segurança da Informação |
| **Descrição** | Atendimento a suspeitas ou confirmações de vazamento de dados. Inclui contenção, avaliação do impacto, comunicação conforme LGPD e documentação do incidente. |
| **Tipo de chamado** | Incidente |
| **Responsável** | Equipe de Segurança N3 / Compliance |
| **Audiência** | IT_SPECIALIST+ |
| **Criticidade** | CRÍTICO |
| **SLA Resposta** | 15 minutos |
| **SLA Resolução** | 4 horas (contenção inicial) |
| **Disponibilidade** | 24×7 |
| **Notas** | LGPD exige notificação à ANPD em até 72 horas. Compliance Officer e IT_MANAGER notificados imediatamente. |

---

### SEC-006 — Liberação no Firewall ou Proxy

| Campo | Valor |
|-------|-------|
| **Nome** | Liberação no Firewall ou Proxy |
| **Categoria** | Segurança da Informação |
| **Descrição** | Abertura de portas, liberação de URLs, domínios ou IPs no firewall ou proxy corporativo para comunicação necessária a sistemas ou serviços homologados. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de Segurança / Redes N2/N3 |
| **Audiência** | IT_SPECIALIST+ |
| **Criticidade** | MÉDIO |
| **SLA Resposta** | 2 horas |
| **SLA Resolução** | 1 dia útil |
| **Fluxo de Aprovação** | IT_MANAGER + análise de segurança obrigatória |
| **Notas** | Documentar: justificativa, origem, destino, porta e protocolo. Liberações temporárias têm validade máxima de 30 dias. |

---

### SEC-007 — Verificação de E-mail Suspeito ou Phishing

| Campo | Valor |
|-------|-------|
| **Nome** | Verificação de E-mail Suspeito / Phishing |
| **Categoria** | Segurança da Informação |
| **Descrição** | Análise de e-mails suspeitos: verificação de phishing, links maliciosos e anexos potencialmente perigosos. Orientação ao colaborador sobre como proceder. |
| **Tipo de chamado** | Incidente |
| **Responsável** | Equipe de Segurança N2 |
| **Audiência** | Usuário Final |
| **Criticidade** | ALTO |
| **SLA Resposta** | 30 minutos |
| **SLA Resolução** | 2 horas |
| **Notas** | Nunca clicar em links antes da análise. Encaminhar o e-mail suspeito como anexo para a equipe de segurança. |

---

## 5. Google Workspace

**Categoria:** Suporte, configuração e gestão das ferramentas Google Workspace: Gmail, Drive, Meet, Calendar, Docs, Sheets, Slides e Admin Console.

---

### GWS-001 — Criação de Conta Google Workspace

| Campo | Valor |
|-------|-------|
| **Nome** | Criação de Conta Google Workspace |
| **Categoria** | Google Workspace |
| **Descrição** | Provisionamento de nova conta de e-mail corporativo para colaboradores, prestadores ou contas funcionais. Inclui configuração inicial, atribuição a grupos e unidade organizacional. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de IAM / Suporte N2 |
| **Audiência** | IT_MANAGER+ |
| **Criticidade** | ALTO |
| **SLA Resposta** | 30 minutos |
| **SLA Resolução** | 4 horas |
| **Fluxo de Aprovação** | IT_MANAGER obrigatório |
| **Notas** | Criação automática pelo módulo de Identidades do SGTI ao provisionar colaborador. Este serviço cobre criações manuais e urgentes. |

---

### GWS-002 — Bloqueio ou Suspensão de Conta Google

| Campo | Valor |
|-------|-------|
| **Nome** | Bloqueio de Conta Google Workspace |
| **Categoria** | Google Workspace |
| **Descrição** | Suspensão imediata de conta em caso de desligamento, suspeita de segurança ou solicitação do RH. Inclui preservação de dados conforme política de retenção. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de IAM / Segurança N2 |
| **Audiência** | IT_MANAGER+ |
| **Criticidade** | CRÍTICO |
| **SLA Resposta** | 15 minutos |
| **SLA Resolução** | 1 hora |
| **Disponibilidade** | 24×7 |
| **Fluxo de Aprovação** | IT_MANAGER (desligamento voluntário) / Automático por workflow de RH |
| **Notas** | Suspensão bloqueia acesso mas não exclui dados — exclusão após período de retenção conforme política. |

---

### GWS-003 — Criação de Grupo de E-mail Corporativo

| Campo | Valor |
|-------|-------|
| **Nome** | Criação de Grupo de E-mail Corporativo |
| **Categoria** | Google Workspace |
| **Descrição** | Criação de grupo de distribuição, lista de distribuição ou espaço colaborativo no Google Groups para departamentos, projetos ou comitês. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de IAM / Suporte N1 |
| **Audiência** | IT_MANAGER+ |
| **Criticidade** | BAIXO |
| **SLA Resposta** | 2 horas |
| **SLA Resolução** | 4 horas |
| **Fluxo de Aprovação** | IT_MANAGER |
| **Notas** | Informar: nome, e-mail desejado, membros iniciais, tipo e permissão de envio. |

---

### GWS-004 — Recuperação de Arquivo do Google Drive

| Campo | Valor |
|-------|-------|
| **Nome** | Recuperação de Arquivo do Google Drive |
| **Categoria** | Google Workspace |
| **Descrição** | Recuperação de arquivos, pastas ou documentos excluídos permanentemente do Google Drive corporativo dentro do prazo de retenção do Google Workspace. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de Suporte N2 / Admin Google |
| **Audiência** | Usuário Final |
| **Criticidade** | ALTO |
| **SLA Resposta** | 1 hora |
| **SLA Resolução** | 4 horas |
| **Notas** | Google mantém arquivos excluídos da lixeira por até 25 dias. Após esse prazo, recuperação pode não ser possível. |

---

### GWS-005 — Configuração de Delegação de Caixa Postal

| Campo | Valor |
|-------|-------|
| **Nome** | Delegação de Caixa Postal |
| **Categoria** | Google Workspace |
| **Descrição** | Configuração de acesso delegado à caixa de e-mail de um colaborador para que outro a gerencie em seu nome durante férias, afastamentos ou como secretário executivo. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de Suporte N1 |
| **Audiência** | Usuário Final / IT_MANAGER |
| **Criticidade** | BAIXO |
| **SLA Resposta** | 2 horas |
| **SLA Resolução** | 4 horas |
| **Fluxo de Aprovação** | Consentimento do titular ou IT_MANAGER em afastamentos sem retorno previsto |
| **Notas** | Delegação deve ser removida ao término da necessidade. Acessos delegados registrados no log de auditoria. |

---

### GWS-006 — Problema com Google Meet / Videoconferência

| Campo | Valor |
|-------|-------|
| **Nome** | Problema com Google Meet |
| **Categoria** | Google Workspace |
| **Descrição** | Resolução de problemas técnicos em videoconferências: áudio, vídeo, compartilhamento de tela, microfone, câmera, qualidade de conexão e dispositivos periféricos. |
| **Tipo de chamado** | Incidente |
| **Responsável** | Equipe de Suporte N1 |
| **Audiência** | Usuário Final |
| **Criticidade** | ALTO |
| **SLA Resposta** | 30 minutos |
| **SLA Resolução** | 2 horas |
| **Notas** | Para reuniões críticas em andamento: atendimento imediato via suporte remoto. |

---

## 6. Gestão de Ativos

**Categoria:** Ciclo de vida de ativos de TI: registro, alocação, movimentação, manutenção e descarte.

---

### AST-001 — Registro de Ativo no Inventário

| Campo | Valor |
|-------|-------|
| **Nome** | Registro de Ativo no Inventário |
| **Categoria** | Gestão de Ativos |
| **Descrição** | Cadastro formal de novo equipamento de TI recebido: notebook, desktop, servidor, periférico ou dispositivo de rede, com todos os dados patrimoniais, técnicos e de garantia. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de Suporte N1 |
| **Audiência** | IT_TECHNICIAN+ |
| **Criticidade** | MÉDIO |
| **SLA Resposta** | 2 horas |
| **SLA Resolução** | 1 dia útil |
| **Notas** | Registro obrigatório antes de entregar o equipamento ao colaborador. Etiqueta patrimonial afixada antes do cadastro. |

---

### AST-002 — Alocação de Equipamento a Colaborador

| Campo | Valor |
|-------|-------|
| **Nome** | Alocação de Equipamento |
| **Categoria** | Gestão de Ativos |
| **Descrição** | Registro formal da entrega de equipamento de TI incluindo atribuição de responsabilidade patrimonial e Termo de Responsabilidade. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de Suporte N1 |
| **Audiência** | IT_TECHNICIAN+ |
| **Criticidade** | MÉDIO |
| **SLA Resposta** | 2 horas |
| **SLA Resolução** | 1 dia útil |
| **Notas** | Termo de Responsabilidade assinado pelo colaborador antes da entrega. |

---

### AST-003 — Devolução de Equipamento

| Campo | Valor |
|-------|-------|
| **Nome** | Devolução de Equipamento |
| **Categoria** | Gestão de Ativos |
| **Descrição** | Registro da devolução de equipamento no desligamento, transferência ou substituição. Inclui inspeção do estado e atualização do inventário. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de Suporte N1 |
| **Audiência** | IT_TECHNICIAN+, IT_MANAGER |
| **Criticidade** | ALTO |
| **SLA Resposta** | 2 horas |
| **SLA Resolução** | 4 horas |
| **Fluxo de Aprovação** | Comunicação ao RH e Financeiro em caso de dano ou perda |
| **Notas** | Em desligamento: devolução no último dia de trabalho. Danos reportados ao RH para providências. |

---

### AST-004 — Manutenção de Equipamento

| Campo | Valor |
|-------|-------|
| **Nome** | Solicitação de Manutenção de Equipamento |
| **Categoria** | Gestão de Ativos |
| **Descrição** | Agendamento de manutenção preventiva ou corretiva com fornecedor autorizado ou equipe interna. Inclui diagnóstico, orçamento e acompanhamento. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de Suporte N1/N2 |
| **Audiência** | IT_TECHNICIAN+ |
| **Criticidade** | MÉDIO |
| **SLA Resposta** | 4 horas |
| **SLA Resolução** | 5 dias úteis |
| **Fluxo de Aprovação** | IT_MANAGER para reparos acima de R$500,00 |
| **Notas** | Dentro da garantia: acionar fornecedor. Fora da garantia: orçamento prévio obrigatório. |

---

### AST-005 — Descarte e Descomissionamento de Ativo

| Campo | Valor |
|-------|-------|
| **Nome** | Descarte e Descomissionamento |
| **Categoria** | Gestão de Ativos |
| **Descrição** | Descomissionamento formal de equipamentos obsoletos: baixa no inventário, sanitização segura de dados e encaminhamento para descarte correto ou doação. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de Suporte N2 / Coordenador de TI |
| **Audiência** | IT_SPECIALIST+ |
| **Criticidade** | BAIXO |
| **SLA Resposta** | 1 dia útil |
| **SLA Resolução** | 5 dias úteis |
| **Fluxo de Aprovação** | IT_MANAGER obrigatório; Financeiro para baixa patrimonial |
| **Notas** | Apagamento seguro obrigatório antes do descarte (LGPD). Equipamentos não podem ir ao lixo comum. |

---

### AST-006 — Gestão de Licenças de Software

| Campo | Valor |
|-------|-------|
| **Nome** | Gestão de Licenças de Software |
| **Categoria** | Gestão de Ativos |
| **Descrição** | Controle do inventário de licenças: aquisição, alocação, transferência, renovação e cancelamento. Inclui acompanhamento de utilização para otimização de custos. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de TI N2 / Analista Financeiro |
| **Audiência** | IT_MANAGER+ |
| **Criticidade** | MÉDIO |
| **SLA Resposta** | 4 horas |
| **SLA Resolução** | 2 dias úteis |
| **Fluxo de Aprovação** | IT_MANAGER + Financeiro para novas aquisições |
| **Notas** | Licenças < 20% de utilização por 3 meses são candidatas a cancelamento. Alertas automáticos no SGTI. |

---

## 7. Sistemas Internos e Aplicações

**Categoria:** Suporte a sistemas de negócio, aplicações corporativas e integrações entre sistemas.

---

### SIS-001 — Falha em Sistema ou Aplicação Corporativa

| Campo | Valor |
|-------|-------|
| **Nome** | Falha em Sistema Corporativo |
| **Categoria** | Sistemas Internos e Aplicações |
| **Descrição** | Atendimento a falhas em sistemas de negócio: ERP, CRM, financeiro, RH e demais aplicações que suportam os processos da organização. |
| **Tipo de chamado** | Incidente |
| **Responsável** | Equipe de Sistemas N2/N3 |
| **Audiência** | Usuário Final / IT_TECHNICIAN+ |
| **Criticidade** | CRÍTICO |
| **SLA Resposta** | 15 minutos |
| **SLA Resolução** | 4 horas |
| **Disponibilidade** | 24×7 para sistemas críticos de negócio |
| **Notas** | Sistemas críticos (financeiros/operacionais): SLA crítico. Sistemas administrativos: SLA alto. |

---

### SIS-002 — Solicitação de Acesso a Sistema

| Campo | Valor |
|-------|-------|
| **Nome** | Solicitação de Acesso a Sistema |
| **Categoria** | Sistemas Internos e Aplicações |
| **Descrição** | Concessão, ampliação ou alteração de perfil de acesso a sistemas corporativos: ERP, CRM, RH, financeiro e demais aplicações gerenciadas pela TI. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de IAM / Sistemas N2 |
| **Audiência** | Usuário Final |
| **Criticidade** | MÉDIO |
| **SLA Resposta** | 2 horas |
| **SLA Resolução** | 4 horas |
| **Fluxo de Aprovação** | Gestor direto (obrigatório) + responsável pelo sistema |
| **Notas** | Informar perfil desejado e justificativa. Princípio do menor privilégio aplicado. |

---

### SIS-003 — Solicitação de Relatório ou Extração de Dados

| Campo | Valor |
|-------|-------|
| **Nome** | Relatório ou Extração de Dados |
| **Categoria** | Sistemas Internos e Aplicações |
| **Descrição** | Criação ou execução de relatórios customizados, extração de dados e consultas que não estão disponíveis nos relatórios padrão. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de Sistemas N3 / BI |
| **Audiência** | IT_MANAGER+, Gestores de Área |
| **Criticidade** | MÉDIO |
| **SLA Resposta** | 4 horas |
| **SLA Resolução** | 3 dias úteis |
| **Fluxo de Aprovação** | IT_MANAGER + DPO para extrações com dados pessoais |
| **Notas** | Extrações com dados pessoais requerem base legal documentada (LGPD). |

---

### SIS-004 — Solicitação de Nova Funcionalidade

| Campo | Valor |
|-------|-------|
| **Nome** | Solicitação de Nova Funcionalidade ou Melhoria |
| **Categoria** | Sistemas Internos e Aplicações |
| **Descrição** | Registro formal de solicitações de novas funcionalidades, melhorias, integrações ou automações. Inclui análise de viabilidade e priorização no backlog. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de Desenvolvimento / Projetos N3 |
| **Audiência** | IT_MANAGER+, Gestores de Área |
| **Criticidade** | BAIXO |
| **SLA Resposta** | 1 dia útil |
| **SLA Resolução** | Conforme análise de complexidade |
| **Fluxo de Aprovação** | IT_MANAGER + Product Owner + análise técnica |
| **Notas** | Alta complexidade pode resultar em projeto formal. Retorno com análise de viabilidade em até 5 dias úteis. |

---

### SIS-005 — Falha de Integração entre Sistemas

| Campo | Valor |
|-------|-------|
| **Nome** | Falha de Integração entre Sistemas |
| **Categoria** | Sistemas Internos e Aplicações |
| **Descrição** | Diagnóstico e resolução de falhas em integrações (APIs, webhooks, ETL, filas) entre sistemas internos ou externos que causam inconsistência de dados ou falha em processos automatizados. |
| **Tipo de chamado** | Incidente |
| **Responsável** | Equipe de Sistemas N3 — Especialistas em Integração |
| **Audiência** | IT_TECHNICIAN+ |
| **Criticidade** | ALTO |
| **SLA Resposta** | 30 minutos |
| **SLA Resolução** | 4 horas |
| **Notas** | Identificar sistemas de origem e destino, operação que falhou e impacto no processo de negócio. |

---

## 8. Compliance e Governança de TI

**Categoria:** Conformidade regulatória, auditorias, gestão de políticas e obrigações de governança.

---

### CPL-001 — Auditoria de Acessos de Colaborador

| Campo | Valor |
|-------|-------|
| **Nome** | Auditoria de Acessos |
| **Categoria** | Compliance e Governança de TI |
| **Descrição** | Levantamento completo de todos os acessos e permissões de um colaborador em sistemas e plataformas gerenciadas pela TI. Utilizado em auditorias internas, externas e investigações. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de Compliance / IAM N2 |
| **Audiência** | COMPLIANCE_OFFICER, IT_MANAGER+ |
| **Criticidade** | ALTO |
| **SLA Resposta** | 2 horas |
| **SLA Resolução** | 1 dia útil |
| **Fluxo de Aprovação** | IT_MANAGER obrigatório |
| **Notas** | Relatório gerado com auditoria obrigatória. Dados pessoais protegidos conforme LGPD. |

---

### CPL-002 — Exercício de Direitos LGPD

| Campo | Valor |
|-------|-------|
| **Nome** | Exercício de Direitos LGPD |
| **Categoria** | Compliance e Governança de TI |
| **Descrição** | Atendimento a solicitações de titulares para exercer direitos garantidos pela LGPD: acesso, correção, portabilidade, eliminação, bloqueio e revogação de consentimento. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de Compliance / DPO |
| **Audiência** | Todos |
| **Criticidade** | ALTO |
| **SLA Resposta** | 2 horas |
| **SLA Resolução** | 15 dias úteis (prazo legal) |
| **Fluxo de Aprovação** | DPO obrigatório |
| **Notas** | Prazo legal: 15 dias úteis. Solicitação acompanhada pelo módulo de Compliance do SGTI. |

---

### CPL-003 — Consulta ou Criação de Política de TI

| Campo | Valor |
|-------|-------|
| **Nome** | Política de TI |
| **Categoria** | Compliance e Governança de TI |
| **Descrição** | Consulta às políticas vigentes (uso aceitável, segurança, classificação de dados, BYOD) ou solicitação de criação/atualização de política para nova necessidade regulatória ou operacional. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de Compliance N2 |
| **Audiência** | Todos |
| **Criticidade** | BAIXO |
| **SLA Resposta** | 4 horas |
| **SLA Resolução** | 5 dias úteis (consulta) / 30 dias (nova política) |
| **Fluxo de Aprovação** | IT_MANAGER para novas políticas ou atualizações significativas |
| **Notas** | Políticas vigentes disponíveis na Base de Conhecimento do SGTI. |

---

### CPL-004 — Notificação de Incidente de Dados (LGPD)

| Campo | Valor |
|-------|-------|
| **Nome** | Incidente de Segurança de Dados — LGPD |
| **Categoria** | Compliance e Governança de TI |
| **Descrição** | Tratamento formal de incidentes envolvendo dados pessoais: avaliação de impacto, comunicação à ANPD dentro do prazo legal de 72 horas e notificação aos titulares. |
| **Tipo de chamado** | Incidente |
| **Responsável** | DPO / Compliance / Segurança |
| **Audiência** | COMPLIANCE_OFFICER, IT_MANAGER+ |
| **Criticidade** | CRÍTICO |
| **SLA Resposta** | 15 minutos |
| **SLA Resolução** | 4 horas (contenção e avaliação inicial) |
| **Disponibilidade** | 24×7 |
| **Notas** | LGPD Art. 48: comunicação à ANPD em até 72 horas. Toda comunicação documentada como evidência. |

---

### CPL-005 — Coleta de Evidências para Auditoria Externa

| Campo | Valor |
|-------|-------|
| **Nome** | Evidências para Auditoria Externa |
| **Categoria** | Compliance e Governança de TI |
| **Descrição** | Levantamento e organização de evidências (logs, relatórios, configurações, políticas) para apresentação a auditores externos em certificações ISO, auditorias fiscais ou regulatórias. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de Compliance N2/N3 |
| **Audiência** | COMPLIANCE_OFFICER, IT_MANAGER+ |
| **Criticidade** | ALTO |
| **SLA Resposta** | 2 horas |
| **SLA Resolução** | 3 dias úteis |
| **Fluxo de Aprovação** | IT_MANAGER + aprovação de cada pacote antes de enviar ao auditor |
| **Notas** | Pacotes gerados com hash de integridade. Toda exportação auditada no SGTI. |

---

## 9. Financeiro de TI

**Categoria:** Gestão financeira da TI: orçamento, contratos, compras, rateio e análise de investimentos.

---

### FIN-001 — Solicitação de Compra de TI

| Campo | Valor |
|-------|-------|
| **Nome** | Solicitação de Compra — TI |
| **Categoria** | Financeiro de TI |
| **Descrição** | Formalização da necessidade de aquisição de equipamento, software, licença, serviço ou infraestrutura de TI, com análise de orçamento e processo de aprovação conforme alçada de valor. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Analista Financeiro de TI / Compras |
| **Audiência** | IT_TECHNICIAN+ |
| **Criticidade** | MÉDIO |
| **SLA Resposta** | 4 horas |
| **SLA Resolução** | 5 dias úteis |
| **Fluxo de Aprovação** | Coordenador (≤ R$1k) → Gestor (R$1k–R$10k) → Gestor + step-up (> R$10k) |
| **Notas** | Solicitações urgentes com impacto operacional podem ter prazo reduzido mediante aprovação do Gestor. |

---

### FIN-002 — Renovação de Contrato com Fornecedor

| Campo | Valor |
|-------|-------|
| **Nome** | Renovação de Contrato de TI |
| **Categoria** | Financeiro de TI |
| **Descrição** | Análise, renegociação e renovação de contratos com fornecedores: manutenção, suporte, licenciamento, serviços gerenciados e telecomunicações. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Analista Financeiro / IT_MANAGER |
| **Audiência** | IT_MANAGER+ |
| **Criticidade** | ALTO |
| **SLA Resposta** | 4 horas |
| **SLA Resolução** | 10 dias úteis |
| **Fluxo de Aprovação** | IT_MANAGER + Financeiro para contratos acima de R$50k |
| **Notas** | Alertas automáticos 90, 60 e 30 dias antes do vencimento. Renovações iniciadas com antecedência mínima de 60 dias. |

---

### FIN-003 — Análise de Custos e Rateio de TI

| Campo | Valor |
|-------|-------|
| **Nome** | Análise de Custos e Rateio |
| **Categoria** | Financeiro de TI |
| **Descrição** | Elaboração de relatório de distribuição dos custos de TI entre departamentos e unidades de negócio. Inclui análise de TCO de ativos e serviços. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Analista Financeiro de TI |
| **Audiência** | FINANCIAL_ANALYST, IT_MANAGER+ |
| **Criticidade** | MÉDIO |
| **SLA Resposta** | 1 dia útil |
| **SLA Resolução** | 5 dias úteis |
| **Fluxo de Aprovação** | IT_MANAGER para divulgação do rateio às áreas |
| **Notas** | Rateio mensal gerado automaticamente pelo SGTI no primeiro dia útil do mês. Este serviço cobre análises específicas. |

---

### FIN-004 — Elaboração e Análise de Orçamento de TI

| Campo | Valor |
|-------|-------|
| **Nome** | Orçamento Anual de TI |
| **Categoria** | Financeiro de TI |
| **Descrição** | Elaboração, revisão e acompanhamento do orçamento anual de TI (OPEX e CAPEX): planejamento, análise de variâncias, projeções e prestação de contas. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Analista Financeiro / IT_MANAGER |
| **Audiência** | FINANCIAL_ANALYST, IT_MANAGER+ |
| **Criticidade** | ALTO |
| **SLA Resposta** | 4 horas |
| **SLA Resolução** | 5 dias úteis |
| **Fluxo de Aprovação** | IT_MANAGER + Financeiro corporativo |
| **Notas** | Dashboard financeiro do SGTI oferece visão em tempo real. Este serviço cobre análises aprofundadas e apresentações para gestão. |

---

### FIN-005 — Cadastro e Gestão de Fornecedor de TI

| Campo | Valor |
|-------|-------|
| **Nome** | Gestão de Fornecedor |
| **Categoria** | Financeiro de TI |
| **Descrição** | Cadastramento, atualização de dados, avaliação de desempenho e gestão do relacionamento com fornecedores de equipamentos, software, serviços e consultoria de TI. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Analista Financeiro / Compras |
| **Audiência** | IT_MANAGER+ |
| **Criticidade** | BAIXO |
| **SLA Resposta** | 1 dia útil |
| **SLA Resolução** | 2 dias úteis |
| **Fluxo de Aprovação** | IT_MANAGER para novos fornecedores com contratos acima de R$10k |
| **Notas** | CNPJ validado automaticamente. Fornecedores devem estar com situação regular na Receita Federal. |

---

## 10. Projetos e Inovação

**Categoria:** Gestão de projetos de TI, inovação tecnológica, implantação de sistemas e transformação digital.

---

### PRJ-001 — Abertura de Projeto de TI

| Campo | Valor |
|-------|-------|
| **Nome** | Abertura de Projeto de TI |
| **Categoria** | Projetos e Inovação |
| **Descrição** | Formalização de nova iniciativa de TI como projeto: definição de escopo, cronograma, orçamento, patrocinador e gerente. Inclui análise de viabilidade técnica e aprovação pela gestão. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Gerência de TI / Project Manager |
| **Audiência** | IT_MANAGER+ |
| **Criticidade** | MÉDIO |
| **SLA Resposta** | 1 dia útil |
| **SLA Resolução** | 10 dias úteis |
| **Fluxo de Aprovação** | IT_MANAGER → Patrocinador executivo (projetos acima de R$50k) |
| **Notas** | Iniciativas com mais de 80h de esforço ou custo > R$10k devem ser formalizadas como projeto. |

---

### PRJ-002 — Implantação de Novo Sistema

| Campo | Valor |
|-------|-------|
| **Nome** | Implantação de Novo Sistema |
| **Categoria** | Projetos e Inovação |
| **Descrição** | Gerenciamento completo da implantação de novos sistemas: planejamento, homologação, treinamento, go-live e suporte pós-implantação. Inclui migração de dados e integrações. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Gerência de TI / Equipe de Projetos N3 |
| **Audiência** | IT_MANAGER+ |
| **Criticidade** | ALTO |
| **SLA Resposta** | 1 dia útil |
| **SLA Resolução** | Conforme cronograma do projeto |
| **Fluxo de Aprovação** | IT_MANAGER + Patrocinador executivo obrigatórios |
| **Notas** | Plano de rollback e critérios de go-live obrigatórios. Treinamento de usuários antes do go-live. |

---

### PRJ-003 — Suporte a Projeto em Andamento

| Campo | Valor |
|-------|-------|
| **Nome** | Suporte a Projeto de TI |
| **Categoria** | Projetos e Inovação |
| **Descrição** | Suporte técnico, resolução de impedimentos e orientação a projetos já em execução. Inclui análise de riscos, revisão de escopo e comunicação de status. |
| **Tipo de chamado** | Incidente / Requisição |
| **Responsável** | Gerência de TI / Project Manager |
| **Audiência** | IT_SPECIALIST+, IT_MANAGER |
| **Criticidade** | ALTO |
| **SLA Resposta** | 2 horas |
| **SLA Resolução** | Conforme complexidade do impedimento |
| **Notas** | Impedimentos críticos que colocam o projeto em risco devem ser escalados ao Patrocinador imediatamente. |

---

### PRJ-004 — Consultoria Tecnológica Interna

| Campo | Valor |
|-------|-------|
| **Nome** | Consultoria Tecnológica Interna |
| **Categoria** | Projetos e Inovação |
| **Descrição** | Orientação técnica especializada para áreas de negócio avaliando adoção de novas tecnologias ou ferramentas. Inclui análise de aderência, riscos e recomendações. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Equipe de Projetos N3 — Especialistas e Arquitetos |
| **Audiência** | IT_MANAGER+, Gestores de Área |
| **Criticidade** | MÉDIO |
| **SLA Resposta** | 1 dia útil |
| **SLA Resolução** | 5 dias úteis |
| **Fluxo de Aprovação** | IT_MANAGER para consultorias com mais de 16h de esforço |
| **Notas** | Parecer técnico entregue por escrito. Pode resultar na abertura de projeto formal. |

---

### PRJ-005 — Encerramento de Projeto

| Campo | Valor |
|-------|-------|
| **Nome** | Encerramento de Projeto de TI |
| **Categoria** | Projetos e Inovação |
| **Descrição** | Formalização do encerramento: registro de entregas, lições aprendidas, transferência para operação, atualização de documentação técnica e liberação de reserva orçamentária não utilizada. |
| **Tipo de chamado** | Requisição |
| **Responsável** | Gerência de TI / Project Manager |
| **Audiência** | IT_MANAGER+ |
| **Criticidade** | BAIXO |
| **SLA Resposta** | 1 dia útil |
| **SLA Resolução** | 5 dias úteis |
| **Fluxo de Aprovação** | IT_MANAGER + Patrocinador |
| **Notas** | Lições aprendidas obrigatórias para projetos > R$10k. Publicar artigo na KB com principais decisões técnicas. |

---

## Resumo do Catálogo

### Total de Serviços por Categoria

| # | Categoria | Qtd | Tipos | Responsável Principal |
|---|-----------|:---:|-------|----------------------|
| 1 | Service Desk | 8 | INC + REQ | Suporte N1 |
| 2 | Infraestrutura e Servidores | 6 | INC + REQ | Infraestrutura N2/N3 |
| 3 | Redes e Conectividade | 6 | INC + REQ | Redes N2 |
| 4 | Segurança da Informação | 7 | INC + REQ | Segurança N2/N3 |
| 5 | Google Workspace | 6 | REQ | IAM / Suporte N2 |
| 6 | Gestão de Ativos | 6 | REQ | Suporte N1/N2 |
| 7 | Sistemas Internos e Aplicações | 5 | INC + REQ | Sistemas N2/N3 |
| 8 | Compliance e Governança | 5 | INC + REQ | Compliance |
| 9 | Financeiro de TI | 5 | REQ | Analista Financeiro |
| 10 | Projetos e Inovação | 5 | REQ | Gerência TI |
| | **TOTAL** | **59** | | |

### Serviços com Atendimento 24×7 e SLA Crítico

| Código | Serviço |
|--------|---------|
| INF-001 | Falha ou Indisponibilidade de Servidor |
| INF-003 | Falha ou Recuperação de Backup |
| SEC-001 | Suspeita de Comprometimento de Conta |
| SEC-002 | Detecção de Malware em Endpoint |
| SEC-005 | Resposta a Vazamento de Dados |
| GWS-002 | Bloqueio de Conta Google Workspace |
| CPL-004 | Incidente de Segurança de Dados — LGPD |

### Serviços com Fluxo de Aprovação Obrigatório

| Código | Serviço | Aprovador |
|--------|---------|-----------|
| SDS-006 | Kit de Equipamentos — Onboarding | IT_MANAGER |
| INF-002 | Provisionamento de Servidor Virtual | IT_MANAGER + Análise de Capacidade |
| NET-004 | Solicitação de Acesso à VPN | IT_MANAGER |
| NET-005 | Configuração de VLAN | IT_MANAGER + Segurança |
| SEC-006 | Liberação no Firewall/Proxy | IT_MANAGER + Segurança |
| GWS-001 | Criação de Conta Google | IT_MANAGER |
| AST-005 | Descarte e Descomissionamento | IT_MANAGER + Financeiro |
| CPL-002 | Exercício de Direitos LGPD | DPO |
| FIN-001 | Solicitação de Compra | Por alçada de valor |
| PRJ-001 | Abertura de Projeto | IT_MANAGER + Patrocinador |

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa de TI | Criação do catálogo com 59 serviços em 10 categorias |

---

> **Próximos documentos recomendados:**
> [`20_DATABASE.md`](./20_DATABASE.md) — Estrutura de dados do catálogo (catalog.ServiceCatalog, catalog.SLA)
> [`24_BUSINESS_RULES.md`](./24_BUSINESS_RULES.md) — Regras BR-INC-001, BR-REQ-001
> [`23_USER_ROLES.md`](./23_USER_ROLES.md) — Permissões por perfil
