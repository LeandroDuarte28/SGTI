-- ─────────────────────────────────────────────────────────────────────────
-- Service Catalog: align SLA definitions with Docs/30_SERVICE_CATALOG.md,
-- consolidate categories onto the document's official 10-category taxonomy,
-- and seed the approved list of 59 services.
-- ─────────────────────────────────────────────────────────────────────────

-- ─── Step 1: correct existing SLA tiers to match the doc's SLA table ──────
UPDATE catalog."SLADefinition" SET response_time_minutes = 15, resolution_time_minutes = 120 WHERE name = 'Padrão Crítico';
UPDATE catalog."SLADefinition" SET response_time_minutes = 30, resolution_time_minutes = 240 WHERE name = 'Padrão Alto';
UPDATE catalog."SLADefinition" SET response_time_minutes = 120, resolution_time_minutes = 480 WHERE name = 'Padrão Médio';
UPDATE catalog."SLADefinition" SET response_time_minutes = 240, resolution_time_minutes = 1440 WHERE name = 'Padrão Baixo';

-- ─── Step 2: insert the document's official 10 categories ────────────────
INSERT INTO catalog."ServiceCategory" (name, description, sort_order) VALUES
    ('Service Desk', 'Suporte técnico ao colaborador — equipamentos, sistemas operacionais, periféricos e dúvidas gerais.', 1),
    ('Infraestrutura e Servidores', 'Gestão, manutenção e resolução de problemas em servidores, armazenamento e backup.', 2),
    ('Redes e Conectividade', 'Suporte à conectividade LAN, Wi-Fi corporativo, internet, VPN e demais componentes de rede.', 3),
    ('Segurança da Informação', 'Proteção de dados, controle de acesso, resposta a incidentes de segurança e conformidade.', 4),
    ('Google Workspace', 'Suporte, configuração e gestão das ferramentas Google Workspace: Gmail, Drive, Meet, Calendar, Docs, Sheets, Slides e Admin Console.', 5),
    ('Gestão de Ativos', 'Ciclo de vida de ativos de TI: registro, alocação, movimentação, manutenção e descarte.', 6),
    ('Sistemas Internos e Aplicações', 'Suporte a sistemas de negócio, aplicações corporativas e integrações entre sistemas.', 7),
    ('Compliance e Governança de TI', 'Conformidade regulatória, auditorias, gestão de políticas e obrigações de governança.', 8),
    ('Financeiro de TI', 'Gestão financeira da TI: orçamento, contratos, compras, rateio e análise de investimentos.', 9),
    ('Projetos e Inovação', 'Gestão de projetos de TI, inovação tecnológica, implantação de sistemas e transformação digital.', 10)
ON CONFLICT (name) DO NOTHING;

-- ─── Step 3: remap existing Knowledge Base articles off the old demo
-- categories onto the closest official category, before removing them ────
UPDATE knowledge."Article" a
SET category_id = new_c.id
FROM catalog."ServiceCategory" old_c, catalog."ServiceCategory" new_c
WHERE a.category_id = old_c.id
  AND old_c.name = 'Hardware'
  AND new_c.name = 'Service Desk';

UPDATE knowledge."Article" a
SET category_id = new_c.id
FROM catalog."ServiceCategory" old_c, catalog."ServiceCategory" new_c
WHERE a.category_id = old_c.id
  AND old_c.name = 'Acesso e Contas'
  AND new_c.name = 'Segurança da Informação';

UPDATE knowledge."Article" a
SET category_id = new_c.id
FROM catalog."ServiceCategory" old_c, catalog."ServiceCategory" new_c
WHERE a.category_id = old_c.id
  AND old_c.name = 'Rede e Conectividade'
  AND new_c.name = 'Redes e Conectividade';

-- ─── Step 4: drop the old demo catalog items and categories (unused by
-- any ServiceRequest — superseded by the official catalog below) ─────────
DELETE FROM catalog."ServiceCatalogItem"
WHERE category_id IN (
    SELECT id FROM catalog."ServiceCategory" WHERE name IN ('Hardware', 'Software', 'Acesso e Contas', 'Rede e Conectividade')
);
DELETE FROM catalog."ServiceCategory" WHERE name IN ('Hardware', 'Software', 'Acesso e Contas', 'Rede e Conectividade');

-- ─── Step 5: seed the 59 approved services (Docs/30_SERVICE_CATALOG.md) ──
INSERT INTO catalog."ServiceCatalogItem" (category_id, name, description, default_sla_id, estimated_delivery_days)
SELECT c.id, v.name, v.description, sla.id, v.delivery_days
FROM (VALUES
    -- Service Desk
    ('Service Desk', 'Suporte a Hardware de Workstation', 'Diagnóstico e resolução de problemas físicos em desktops, notebooks e workstations corporativas. Inclui falhas de hardware, lentidão extrema por componentes, telas com defeito e periféricos integrados.', 'Padrão Alto', 0),
    ('Service Desk', 'Instalação e Configuração de Software', 'Instalação, atualização ou remoção de softwares corporativos homologados na estação de trabalho. Inclui pacotes de escritório, clientes de e-mail, VPN e demais aplicações do portfólio.', 'Padrão Médio', 0),
    ('Service Desk', 'Redefinição de Senha de Sistema', 'Redefinição de senhas de acesso a sistemas corporativos internos quando o colaborador não consegue fazer login por esquecimento ou bloqueio de conta.', 'Padrão Alto', 0),
    ('Service Desk', 'Configuração de Impressora e Scanner', 'Instalação de drivers, configuração de conexão de rede e resolução de problemas com impressoras e scanners compartilhados ou locais.', 'Padrão Médio', 0),
    ('Service Desk', 'Suporte a Dispositivos Móveis Corporativos', 'Configuração e suporte de smartphones e tablets corporativos (iOS e Android). Inclui configuração de e-mail, aplicativos de negócio e MDM.', 'Padrão Médio', 0),
    ('Service Desk', 'Kit de Equipamentos — Onboarding', 'Requisição do kit completo de equipamentos para onboarding: notebook/desktop, teclado, mouse, headset e periféricos definidos pelo perfil do cargo. Abertura pelo gestor com antecedência mínima de 5 dias úteis.', 'Padrão Alto', 5),
    ('Service Desk', 'Suporte Remoto à Estação de Trabalho', 'Atendimento remoto via ferramenta de acesso seguro para resolução de problemas de software, configurações e dúvidas sem necessidade de deslocamento do técnico.', 'Padrão Médio', 0),
    ('Service Desk', 'Formatação / Reinstalação de Estação de Trabalho', 'Formatação, reinstalação do sistema operacional e configuração completa do ambiente padrão corporativo, incluindo todos os softwares do portfólio e integração ao domínio.', 'Padrão Médio', 1),
    -- Infraestrutura e Servidores
    ('Infraestrutura e Servidores', 'Falha ou Indisponibilidade de Servidor', 'Atendimento a incidentes de servidores físicos ou virtuais indisponíveis, com erros críticos, lentidão extrema ou comportamento anômalo que afeta serviços hospedados.', 'Padrão Crítico', 0),
    ('Infraestrutura e Servidores', 'Provisionamento de Servidor Virtual', 'Criação, configuração e entrega de nova máquina virtual no ambiente de virtualização corporativo ou em nuvem, conforme especificações aprovadas.', 'Padrão Alto', 3),
    ('Infraestrutura e Servidores', 'Falha ou Recuperação de Backup', 'Investigação de falhas no processo de backup, verificação de integridade e execução de restore de dados a partir de cópias de segurança.', 'Padrão Crítico', 0),
    ('Infraestrutura e Servidores', 'Expansão de Armazenamento', 'Aumento de capacidade de disco em servidores, VMs, storage de rede (NAS/SAN) ou contas de armazenamento em nuvem.', 'Padrão Médio', 2),
    ('Infraestrutura e Servidores', 'Manutenção Programada de Infraestrutura', 'Janelas de manutenção agendadas para patches de segurança, atualizações de firmware, reinicializações e atividades que requerem indisponibilidade planejada.', 'Padrão Médio', NULL),
    ('Infraestrutura e Servidores', 'Investigação de Performance de Servidor', 'Análise e diagnóstico de degradação de performance: alta utilização de CPU, memória, I/O de disco ou rede causando lentidão em serviços e aplicações.', 'Padrão Alto', 0),
    -- Redes e Conectividade
    ('Redes e Conectividade', 'Falha de Conectividade de Rede', 'Resolução de problemas de falta de acesso à rede local cabeada ou sem fio corporativa. Inclui falhas de switch, ponto de acesso wireless, cabos e configurações TCP/IP.', 'Padrão Alto', 0),
    ('Redes e Conectividade', 'Falha ou Lentidão de Acesso à Internet', 'Diagnóstico e resolução de problemas de acesso à internet: indisponibilidade, lentidão significativa ou bloqueio indevido de sites e serviços corporativos.', 'Padrão Alto', 0),
    ('Redes e Conectividade', 'Problema de Acesso à VPN Corporativa', 'Resolução de problemas de conexão à VPN: falha de autenticação, certificado expirado, cliente com erro, conexão instável ou qualquer impedimento ao acesso remoto seguro.', 'Padrão Alto', 0),
    ('Redes e Conectividade', 'Solicitação de Acesso à VPN', 'Habilitação do acesso à VPN corporativa para colaboradores que necessitam trabalhar remotamente. Inclui criação de credenciais e instalação do cliente VPN.', 'Padrão Médio', 0),
    ('Redes e Conectividade', 'Configuração de VLAN e Segmentação de Rede', 'Criação ou modificação de VLANs, roteamento entre sub-redes e ajustes na segmentação da rede corporativa para novos projetos, departamentos ou requisitos de segurança.', 'Padrão Alto', 3),
    ('Redes e Conectividade', 'Solicitação de Ponto de Rede', 'Instalação de novo ponto de rede cabeado em posição de trabalho, sala de reunião ou outro espaço. Inclui passagem de cabo, tomada RJ45 e patch cord.', 'Padrão Baixo', 5),
    -- Segurança da Informação
    ('Segurança da Informação', 'Suspeita de Comprometimento de Conta', 'Atendimento emergencial a suspeitas de acesso não autorizado a contas corporativas, vazamento de credenciais, phishing bem-sucedido ou indícios de comprometimento.', 'Padrão Crítico', 0),
    ('Segurança da Informação', 'Detecção de Malware em Endpoint', 'Resposta a detecção de vírus, malware, ransomware ou outras ameaças em dispositivos corporativos. Inclui isolamento do endpoint, análise e remediação.', 'Padrão Crítico', 0),
    ('Segurança da Informação', 'Solicitação de Certificado Digital', 'Emissão, renovação ou revogação de certificados digitais para serviços, domínios, aplicações internas ou assinatura digital de documentos.', 'Padrão Alto', 1),
    ('Segurança da Informação', 'Revisão de Permissões e Acessos', 'Auditoria dos acessos de um colaborador ou grupo para verificar aderência ao princípio do menor privilégio. Inclui revisão de sistemas, pastas e grupos corporativos.', 'Padrão Médio', 3),
    ('Segurança da Informação', 'Resposta a Vazamento de Dados (LGPD)', 'Atendimento a suspeitas ou confirmações de vazamento de dados. Inclui contenção, avaliação do impacto, comunicação conforme LGPD e documentação do incidente.', 'Padrão Crítico', 0),
    ('Segurança da Informação', 'Liberação no Firewall ou Proxy', 'Abertura de portas, liberação de URLs, domínios ou IPs no firewall ou proxy corporativo para comunicação necessária a sistemas ou serviços homologados.', 'Padrão Médio', 1),
    ('Segurança da Informação', 'Verificação de E-mail Suspeito / Phishing', 'Análise de e-mails suspeitos: verificação de phishing, links maliciosos e anexos potencialmente perigosos. Orientação ao colaborador sobre como proceder.', 'Padrão Alto', 0),
    -- Google Workspace
    ('Google Workspace', 'Criação de Conta Google Workspace', 'Provisionamento de nova conta de e-mail corporativo para colaboradores, prestadores ou contas funcionais. Inclui configuração inicial, atribuição a grupos e unidade organizacional.', 'Padrão Alto', 0),
    ('Google Workspace', 'Bloqueio de Conta Google Workspace', 'Suspensão imediata de conta em caso de desligamento, suspeita de segurança ou solicitação do RH. Inclui preservação de dados conforme política de retenção.', 'Padrão Crítico', 0),
    ('Google Workspace', 'Criação de Grupo de E-mail Corporativo', 'Criação de grupo de distribuição, lista de distribuição ou espaço colaborativo no Google Groups para departamentos, projetos ou comitês.', 'Padrão Baixo', 0),
    ('Google Workspace', 'Recuperação de Arquivo do Google Drive', 'Recuperação de arquivos, pastas ou documentos excluídos permanentemente do Google Drive corporativo dentro do prazo de retenção do Google Workspace.', 'Padrão Alto', 0),
    ('Google Workspace', 'Delegação de Caixa Postal', 'Configuração de acesso delegado à caixa de e-mail de um colaborador para que outro a gerencie em seu nome durante férias, afastamentos ou como secretário executivo.', 'Padrão Baixo', 0),
    ('Google Workspace', 'Problema com Google Meet', 'Resolução de problemas técnicos em videoconferências: áudio, vídeo, compartilhamento de tela, microfone, câmera, qualidade de conexão e dispositivos periféricos.', 'Padrão Alto', 0),
    -- Gestão de Ativos
    ('Gestão de Ativos', 'Registro de Ativo no Inventário', 'Cadastro formal de novo equipamento de TI recebido: notebook, desktop, servidor, periférico ou dispositivo de rede, com todos os dados patrimoniais, técnicos e de garantia.', 'Padrão Médio', 1),
    ('Gestão de Ativos', 'Alocação de Equipamento', 'Registro formal da entrega de equipamento de TI incluindo atribuição de responsabilidade patrimonial e Termo de Responsabilidade.', 'Padrão Médio', 1),
    ('Gestão de Ativos', 'Devolução de Equipamento', 'Registro da devolução de equipamento no desligamento, transferência ou substituição. Inclui inspeção do estado e atualização do inventário.', 'Padrão Alto', 0),
    ('Gestão de Ativos', 'Solicitação de Manutenção de Equipamento', 'Agendamento de manutenção preventiva ou corretiva com fornecedor autorizado ou equipe interna. Inclui diagnóstico, orçamento e acompanhamento.', 'Padrão Médio', 5),
    ('Gestão de Ativos', 'Descarte e Descomissionamento', 'Descomissionamento formal de equipamentos obsoletos: baixa no inventário, sanitização segura de dados e encaminhamento para descarte correto ou doação.', 'Padrão Baixo', 5),
    ('Gestão de Ativos', 'Gestão de Licenças de Software', 'Controle do inventário de licenças: aquisição, alocação, transferência, renovação e cancelamento. Inclui acompanhamento de utilização para otimização de custos.', 'Padrão Médio', 2),
    -- Sistemas Internos e Aplicações
    ('Sistemas Internos e Aplicações', 'Falha em Sistema Corporativo', 'Atendimento a falhas em sistemas de negócio: ERP, CRM, financeiro, RH e demais aplicações que suportam os processos da organização.', 'Padrão Crítico', 0),
    ('Sistemas Internos e Aplicações', 'Solicitação de Acesso a Sistema', 'Concessão, ampliação ou alteração de perfil de acesso a sistemas corporativos: ERP, CRM, RH, financeiro e demais aplicações gerenciadas pela TI.', 'Padrão Médio', 0),
    ('Sistemas Internos e Aplicações', 'Relatório ou Extração de Dados', 'Criação ou execução de relatórios customizados, extração de dados e consultas que não estão disponíveis nos relatórios padrão.', 'Padrão Médio', 3),
    ('Sistemas Internos e Aplicações', 'Solicitação de Nova Funcionalidade ou Melhoria', 'Registro formal de solicitações de novas funcionalidades, melhorias, integrações ou automações. Inclui análise de viabilidade e priorização no backlog.', 'Padrão Baixo', NULL),
    ('Sistemas Internos e Aplicações', 'Falha de Integração entre Sistemas', 'Diagnóstico e resolução de falhas em integrações (APIs, webhooks, ETL, filas) entre sistemas internos ou externos que causam inconsistência de dados ou falha em processos automatizados.', 'Padrão Alto', 0),
    -- Compliance e Governança de TI
    ('Compliance e Governança de TI', 'Auditoria de Acessos', 'Levantamento completo de todos os acessos e permissões de um colaborador em sistemas e plataformas gerenciadas pela TI. Utilizado em auditorias internas, externas e investigações.', 'Padrão Alto', 1),
    ('Compliance e Governança de TI', 'Exercício de Direitos LGPD', 'Atendimento a solicitações de titulares para exercer direitos garantidos pela LGPD: acesso, correção, portabilidade, eliminação, bloqueio e revogação de consentimento.', 'Padrão Alto', 15),
    ('Compliance e Governança de TI', 'Política de TI', 'Consulta às políticas vigentes (uso aceitável, segurança, classificação de dados, BYOD) ou solicitação de criação/atualização de política para nova necessidade regulatória ou operacional.', 'Padrão Baixo', 5),
    ('Compliance e Governança de TI', 'Incidente de Segurança de Dados — LGPD', 'Tratamento formal de incidentes envolvendo dados pessoais: avaliação de impacto, comunicação à ANPD dentro do prazo legal de 72 horas e notificação aos titulares.', 'Padrão Crítico', 0),
    ('Compliance e Governança de TI', 'Evidências para Auditoria Externa', 'Levantamento e organização de evidências (logs, relatórios, configurações, políticas) para apresentação a auditores externos em certificações ISO, auditorias fiscais ou regulatórias.', 'Padrão Alto', 3),
    -- Financeiro de TI
    ('Financeiro de TI', 'Solicitação de Compra — TI', 'Formalização da necessidade de aquisição de equipamento, software, licença, serviço ou infraestrutura de TI, com análise de orçamento e processo de aprovação conforme alçada de valor.', 'Padrão Médio', 5),
    ('Financeiro de TI', 'Renovação de Contrato de TI', 'Análise, renegociação e renovação de contratos com fornecedores: manutenção, suporte, licenciamento, serviços gerenciados e telecomunicações.', 'Padrão Alto', 10),
    ('Financeiro de TI', 'Análise de Custos e Rateio', 'Elaboração de relatório de distribuição dos custos de TI entre departamentos e unidades de negócio. Inclui análise de TCO de ativos e serviços.', 'Padrão Médio', 5),
    ('Financeiro de TI', 'Orçamento Anual de TI', 'Elaboração, revisão e acompanhamento do orçamento anual de TI (OPEX e CAPEX): planejamento, análise de variâncias, projeções e prestação de contas.', 'Padrão Alto', 5),
    ('Financeiro de TI', 'Gestão de Fornecedor', 'Cadastramento, atualização de dados, avaliação de desempenho e gestão do relacionamento com fornecedores de equipamentos, software, serviços e consultoria de TI.', 'Padrão Baixo', 2),
    -- Projetos e Inovação
    ('Projetos e Inovação', 'Abertura de Projeto de TI', 'Formalização de nova iniciativa de TI como projeto: definição de escopo, cronograma, orçamento, patrocinador e gerente. Inclui análise de viabilidade técnica e aprovação pela gestão.', 'Padrão Médio', 10),
    ('Projetos e Inovação', 'Implantação de Novo Sistema', 'Gerenciamento completo da implantação de novos sistemas: planejamento, homologação, treinamento, go-live e suporte pós-implantação. Inclui migração de dados e integrações.', 'Padrão Alto', NULL),
    ('Projetos e Inovação', 'Suporte a Projeto de TI', 'Suporte técnico, resolução de impedimentos e orientação a projetos já em execução. Inclui análise de riscos, revisão de escopo e comunicação de status.', 'Padrão Alto', NULL),
    ('Projetos e Inovação', 'Consultoria Tecnológica Interna', 'Orientação técnica especializada para áreas de negócio avaliando adoção de novas tecnologias ou ferramentas. Inclui análise de aderência, riscos e recomendações.', 'Padrão Médio', 5),
    ('Projetos e Inovação', 'Encerramento de Projeto de TI', 'Formalização do encerramento: registro de entregas, lições aprendidas, transferência para operação, atualização de documentação técnica e liberação de reserva orçamentária não utilizada.', 'Padrão Baixo', 5)
) AS v(category_name, name, description, sla_name, delivery_days)
JOIN catalog."ServiceCategory" c ON c.name = v.category_name
JOIN catalog."SLADefinition" sla ON sla.name = v.sla_name
ON CONFLICT DO NOTHING;
