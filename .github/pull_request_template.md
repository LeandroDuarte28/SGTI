## Descrição

<!-- Descreva o que esta PR faz e por quê. -->

## Tipo de mudança

- [ ] 🐛 Bug fix
- [ ] ✨ Nova funcionalidade (feature)
- [ ] 🔧 Refatoração (sem mudança de comportamento)
- [ ] 📝 Documentação
- [ ] 🔒 Segurança
- [ ] ⚡ Performance
- [ ] 🏗️ Infraestrutura / CI/CD

## Módulo(s) afetado(s)

- [ ] Shared / Foundation
- [ ] Incidentes
- [ ] Requisições
- [ ] Problemas
- [ ] Ativos (ITAM)
- [ ] Identidades (IAM)
- [ ] Compliance
- [ ] Financeiro (OPEX/CAPEX)
- [ ] Compras
- [ ] Projetos
- [ ] Base de Conhecimento
- [ ] Catálogo de Serviços / SLA
- [ ] Dashboards
- [ ] Integrações (GLPI / Google Workspace)
- [ ] Auth / Segurança
- [ ] CI/CD / Infra

## Documento de referência

<!-- Link para o documento em Docs/ que autoriza esta implementação -->
Docs/: <!-- ex: Módulos/05_SERVICE_DESK.md -->

## Checklist

### Código

- [ ] O código segue os padrões de `Docs/81_CODING_STANDARDS.md`
- [ ] Sem uso de `any` no TypeScript
- [ ] Sem lógica de negócio em componentes ou controllers
- [ ] Sem `console.log` (apenas `console.warn`/`console.error` onde necessário)
- [ ] Todas as queries Prisma/Supabase especificam campos (sem `SELECT *`)

### Segurança

- [ ] Nenhuma credencial, token ou chave exposta no código
- [ ] RLS habilitado para novas tabelas com dados sensíveis
- [ ] PII de usuários não logado
- [ ] Inputs validados com Zod antes de qualquer operação

### Banco de Dados

- [ ] Migration nomeada no formato `YYYYMMDDHHMMSS_descricao.sql`
- [ ] Nenhuma migration destrutiva sem aprovação do Arquiteto

### Testes

- [ ] Testes unitários adicionados/atualizados para nova lógica
- [ ] `npm run type-check` passa sem erros
- [ ] `npm run lint` passa sem erros/warnings

### PR

- [ ] Título segue Conventional Commits (`feat:`, `fix:`, `refactor:`, etc.)
- [ ] Branch baseada em `develop` (não diretamente em `main` ou `staging`)
- [ ] PR tem no máximo 400 linhas alteradas (splits menores são preferíveis)

## Screenshots / Evidências

<!-- Se aplicável, adicione capturas de tela das mudanças visuais. -->

## Como testar

<!-- Passos para o revisor reproduzir e validar as mudanças. -->

1.
2.
3.
