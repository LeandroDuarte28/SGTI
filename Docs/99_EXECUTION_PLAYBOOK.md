# SGTI — Sistema de Gestão de Tecnologia da Informação
## Execution Playbook — Guia Operacional do Claude Code

> **Classificação:** Interno — Restrito
> **Versão:** 1.0.0
> **Status:** Vigente
> **Última Atualização:** 2026-06-09
> **Responsável:** Arquitetura Corporativa de TI
> **Documentos Relacionados:** [01_CLAUDE.md](./01_CLAUDE.md) · [80_IMPLEMENTATION_ORDER.md](./80_IMPLEMENTATION_ORDER.md) · [12_ARCHITECTURE.md](./12_ARCHITECTURE.md)

---

## Sobre este Documento

Este playbook define como a equipe do SGTI usa o **Claude Code** de forma eficiente, consistente e segura. Cada seção responde a uma pergunta operacional específica e inclui exemplos práticos de prompts otimizados para minimizar consumo de contexto sem sacrificar qualidade.

> **Princípio central:** Claude Code implementa o que está documentado. Decisões de negócio e arquitetura vivem nos documentos de `Docs/` — não nos prompts.

---

## Sumário

1. [Como Solicitar Implementações](#1-como-solicitar-implementações)
2. [Como Economizar Tokens e Contexto](#2-como-economizar-tokens-e-contexto)
3. [Como Trabalhar por Módulo](#3-como-trabalhar-por-módulo)
4. [Como Evitar Regressões](#4-como-evitar-regressões)
5. [Como Validar Entregas](#5-como-validar-entregas)
6. [Como Executar Auditorias Técnicas](#6-como-executar-auditorias-técnicas)
7. [Como Revisar Código](#7-como-revisar-código)
8. [Como Gerar Testes](#8-como-gerar-testes)
9. [Como Gerar Documentação](#9-como-gerar-documentação)
10. [Prompts por Módulo](#10-prompts-por-módulo)
11. [Anti-Padrões a Evitar](#11-anti-padrões-a-evitar)
12. [Checklist de Sessão](#12-checklist-de-sessão)

---

## 1. Como Solicitar Implementações

### 1.1 Anatomia de um Prompt Eficiente

Um prompt eficiente para o Claude Code tem quatro componentes obrigatórios:

```
[CONTEXTO]   → Qual documento consultar antes de implementar
[TAREFA]     → O que implementar, em termos do domínio
[ESCOPO]     → Arquivos exatos a criar ou modificar
[RESTRIÇÕES] → O que NÃO fazer (evita decisões indesejadas)
```

**Exemplo ruim — vago, sem contexto, sem escopo:**
```
Crie o módulo de incidentes com CRUD completo usando NestJS.
```

**Exemplo bom — específico, com contexto e escopo:**
```
Leia Docs/12_ARCHITECTURE.md seção 6.1 e Docs/01_CLAUDE.md seções 5 e 6.

Implemente a entidade de domínio `Incident` no arquivo:
  apps/api/src/modules/incident/domain/entities/incident.entity.ts

A entidade deve:
- Estender BaseAggregate de src/shared/domain/base-aggregate.ts
- Ter os Value Objects: IncidentStatus, Priority, ImpactLevel, UrgencyLevel
- Expor métodos: open(), assign(), escalate(), resolve(), close(), reopen()
- Publicar os eventos de domínio correspondentes a cada transição
- Zero imports de NestJS, Prisma ou qualquer infraestrutura

Não implemente Use Cases, Controllers ou repositórios neste momento.
```

---

### 1.2 Padrão de Prompt por Tipo de Artefato

#### Para Entidade de Domínio

```
Leia [DOCUMENTO] seção [X].

Implemente a entidade `[Nome]` em:
  apps/api/src/modules/[modulo]/domain/entities/[nome].entity.ts

Requisitos de domínio:
- [lista de atributos com tipos]
- [lista de comportamentos/métodos]
- [lista de eventos publicados]
- [invariantes a proteger]

Restrições:
- Estende BaseAggregate de src/shared/domain/base-aggregate.ts
- Zero imports externos (sem NestJS, Prisma, etc.)
- Sem setters públicos — apenas métodos de comportamento
- Exceções do domínio em src/modules/[modulo]/domain/exceptions/
```

#### Para Value Object

```
Implemente o Value Object `[Nome]` em:
  apps/api/src/modules/[modulo]/domain/value-objects/[nome].vo.ts

Valores permitidos: [lista]
Validação no construtor: [regras]
Estende ValueObject de src/shared/domain/value-object.ts
Imutável — readonly em todos os campos
```

#### Para Use Case

```
Leia Docs/12_ARCHITECTURE.md seção 3.4.

Implemente `[Acao][Entidade]UseCase` em:
  apps/api/src/modules/[modulo]/application/use-cases/[acao]-[entidade].use-case.ts

Input DTO: [campos]
Output DTO: [campos]
Fluxo:
  1. [passo 1]
  2. [passo 2]
  ...

Depende de (via DI — apenas interfaces):
- I[Entidade]Repository
- I[Port] (se necessário)
- IEventBus

Não implemente o Controller nem o repositório neste prompt.
```

#### Para Repositório (Infrastructure)

```
Implemente `Prisma[Entidade]Repository` em:
  apps/api/src/modules/[modulo]/infrastructure/repositories/prisma-[entidade].repository.ts

Implementa: I[Entidade]Repository de domain/repositories/
Usa: PrismaClient injetado via DI
Inclui mapper: [Entidade]Mapper no mesmo diretório

Métodos a implementar: [lista]
Schema Prisma de referência: packages/database/schema.prisma model [Model]

Erros Prisma a traduzir:
- P2025 → [Entidade]NotFoundException
- P2002 → Duplicate[Campo]Exception
```

#### Para Controller

```
Implemente `[Modulo]Controller` em:
  apps/api/src/modules/[modulo]/presentation/[modulo].controller.ts

Endpoints:
  POST   /api/[modulo]         → [AcaoUseCase]
  GET    /api/[modulo]         → [ListarUseCase]
  GET    /api/[modulo]/:id     → [BuscarUseCase]
  PATCH  /api/[modulo]/:id/[acao] → [AcaoEspecificaUseCase]

Para cada endpoint:
- @ApiTags, @ApiOperation, @ApiResponse obrigatórios
- @UseGuards(JwtAuthGuard, RolesGuard)
- @Roles([lista de roles permitidos])
- Máximo 8 linhas por método
- Sem lógica de negócio — apenas chamar Use Case
```

---

### 1.3 Tamanho Ideal de Prompt por Complexidade

| Complexidade | Artefatos por Prompt | Linhas de Prompt |
|-------------|---------------------|-----------------|
| Simples | 1 (ex: 1 Value Object) | 10–20 |
| Média | 2–3 (ex: entidade + VO + exceção) | 20–40 |
| Alta | 1 Use Case completo | 30–50 |
| Máxima | 1 módulo completo (domínio apenas) | 50–80 |

> **Regra:** se o prompt tem mais de 80 linhas, está grande demais. Quebre em partes menores.

---

## 2. Como Economizar Tokens e Contexto

### 2.1 Regras de Ouro para Economia de Contexto

**Regra 1 — Referencie, não transcreva**

Nunca cole o conteúdo de documentos no prompt. Referencie por caminho e seção:

```
❌ RUIM — desperdiça tokens:
"A entidade Incident deve ter os campos id, title, description,
 status que pode ser OPEN, IN_PROGRESS, ESCALATED..."
(copiando o conteúdo do documento)

✅ BOM — economiza tokens:
"Leia Docs/12_ARCHITECTURE.md seção 6.1 para os detalhes da entidade."
```

**Regra 2 — Um artefato por sessão**

Cada sessão do Claude Code implementa um único artefato ou um conjunto coeso de artefatos pequenos (ex: entidade + seus VOs + suas exceções). Nunca um módulo inteiro em um prompt.

**Regra 3 — Contexto mínimo necessário**

Inclua no prompt apenas os documentos diretamente relevantes:

| Tarefa | Documentos a referenciar |
|--------|--------------------------|
| Entidade de domínio | `12_ARCHITECTURE.md` seção do módulo + `01_CLAUDE.md` seção 5 |
| Use Case | `12_ARCHITECTURE.md` seção 3.4 + seção do módulo |
| Repositório | `01_CLAUDE.md` seção 4.3 + schema Prisma |
| Controller | `01_CLAUDE.md` seção 4.4 |
| Testes | `01_CLAUDE.md` seção 9 |

**Regra 4 — Evite explicações redundantes**

Claude Code já leu `CLAUDE.md` no início de cada sessão. Não repita regras que já estão lá:

```
❌ RUIM — repete o que está no CLAUDE.md:
"Use TypeScript strict, não use any, siga Clean Architecture,
 não coloque lógica no controller, use injeção de dependência..."

✅ BOM — apenas o específico da tarefa:
"Implemente o Use Case conforme descrito abaixo."
```

**Regra 5 — Use checkpoints entre artefatos**

Ao final de cada artefato entregue, confirme antes de continuar:

```
✅ Entidade Incident criada. Confirme que está OK antes de
   prosseguir para os Value Objects.
```

**Regra 6 — Prefira arquivos pequenos e coesos**

Arquivos grandes consomem mais contexto para edição. Prefira arquivos de 50–150 linhas. Um arquivo por artefato de domínio.

---

### 2.2 Estratégia de Sessão

**Sessão focada (recomendada para a maioria das tarefas):**

```
1. Abrir nova sessão do Claude Code
2. Claude Code lê CLAUDE.md automaticamente
3. Prompt de tarefa específica (1 artefato)
4. Validar saída
5. Commitar antes de continuar
6. Nova tarefa no mesmo contexto OU nova sessão
```

**Sessão longa (apenas para módulos simples):**

```
1. Abrir sessão
2. Prompt: "Leia CLAUDE.md e Docs/12_ARCHITECTURE.md seção [X]."
3. Implementar domínio completo de um módulo pequeno
   (entidade + VOs + exceções + interfaces de repositório)
4. Commitar
5. Continuar com Use Cases na mesma sessão OU abrir nova
```

**Quando abrir nova sessão:**
- Ao mudar de camada (domínio → aplicação → infraestrutura).
- Ao mudar de módulo.
- Quando a sessão atual tiver mais de 20 trocas de mensagem.
- Sempre antes de tarefa de alto risco (migration, autenticação, RLS).

---

### 2.3 Técnica de Contexto Progressivo

Para módulos complexos, carregue o contexto progressivamente:

```
Sessão 1: Domínio
  → Entidade + VOs + Exceções + Interfaces

Sessão 2: Aplicação
  → "Continue o módulo Incident. O domínio está em
     apps/api/src/modules/incident/domain/. 
     Implemente OpenIncidentUseCase conforme..."

Sessão 3: Infraestrutura
  → "O Use Case OpenIncidentUseCase espera IIncidentRepository.
     Implemente PrismaIncidentRepository conforme..."

Sessão 4: Apresentação
  → "Implemente IncidentController expondo os Use Cases
     já criados em application/use-cases/..."
```

---

## 3. Como Trabalhar por Módulo

### 3.1 Sequência Padrão por Módulo

Seguir sempre esta sequência — nunca pular etapas:

```
ETAPA 1 — DOMÍNIO
  ├── Value Objects
  ├── Exceções de domínio
  ├── Entidade raiz (Aggregate Root)
  ├── Entidades filhas (se houver)
  ├── Domain Services (se houver)
  └── Interfaces de repositório

ETAPA 2 — APLICAÇÃO
  ├── DTOs de entrada (Input)
  ├── DTOs de saída (Output)
  ├── Ports (interfaces para serviços externos)
  └── Use Cases (um por vez, em ordem de dependência)

ETAPA 3 — INFRAESTRUTURA
  ├── Mapper (domain entity ↔ Prisma model)
  ├── Repositório Prisma (implementa interface do domínio)
  └── Adapters (implementam Ports da aplicação)

ETAPA 4 — APRESENTAÇÃO
  ├── Controller (endpoints REST)
  ├── Guards específicos do módulo (se necessário)
  └── Pipes específicos do módulo (se necessário)

ETAPA 5 — MÓDULO NESTJS
  └── [Modulo].module.ts (providers, controllers, exports)

ETAPA 6 — TESTES
  ├── Testes unitários do domínio
  ├── Testes unitários dos Use Cases
  └── Testes de integração do Controller

ETAPA 7 — FRONTEND
  ├── Tipos TypeScript (derivados dos Output DTOs)
  ├── Server Actions / Route Handlers
  ├── Componentes de UI
  └── Páginas
```

### 3.2 Template de Início de Módulo

Use este prompt para iniciar qualquer módulo novo:

```
Vou implementar o módulo [NOME] do SGTI.

Leia:
- Docs/01_CLAUDE.md seções 4, 5, 6 (regras de arquitetura)
- Docs/12_ARCHITECTURE.md seção [X] (especificação do módulo)

Confirme que entendeu os seguintes pontos antes de implementar:
1. Qual é o Aggregate Root do módulo?
2. Quais são os Value Objects?
3. Quais eventos de domínio são publicados?
4. Quais interfaces de repositório são necessárias?
5. Quais Ports externos são necessários?

Após confirmar, implemente apenas os Value Objects do módulo,
começando pelos mais simples (sem dependências entre si).
```

### 3.3 Controle de Estado Entre Sessões

Ao retomar trabalho em um módulo após encerrar a sessão, use este prompt de retomada:

```
Estou retomando a implementação do módulo [NOME].

Estado atual (verificar antes de continuar):
- [x] Value Objects em domain/value-objects/ ✓
- [x] Entidade [Entidade] em domain/entities/ ✓
- [ ] Use Cases — PENDENTE
- [ ] Repositório — PENDENTE
- [ ] Controller — PENDENTE

Leia os arquivos já criados:
- apps/api/src/modules/[modulo]/domain/entities/[entidade].entity.ts
- apps/api/src/modules/[modulo]/domain/value-objects/

Próxima tarefa: implementar [AcaoUseCase] conforme
Docs/12_ARCHITECTURE.md seção [X].
```

---

## 4. Como Evitar Regressões

### 4.1 Regra do Commit Atômico

**Nunca deixe código não commitado antes de solicitar a próxima implementação.**

```
Fluxo obrigatório:
  1. Prompt → Claude Code implementa artefato
  2. Revisar o código gerado
  3. Executar: pnpm lint && pnpm type-check && pnpm test
  4. Se tudo OK: git add . && git commit -m "feat(incident): add Incident entity"
  5. Próximo prompt
```

Se o código gerado não passar no lint/type-check, corrija ANTES de commitar.

### 4.2 Proteção de Fronteiras de Módulo

Antes de commitar qualquer módulo novo, verificar:

```bash
# Verificar se há imports cruzados entre módulos (deve retornar vazio)
grep -r "from.*modules/incident" apps/api/src/modules/asset/
grep -r "from.*modules/asset" apps/api/src/modules/incident/

# Verificar se Prisma está sendo importado fora de infraestrutura
grep -r "@prisma/client" apps/api/src/modules/incident/domain/
grep -r "@prisma/client" apps/api/src/modules/incident/application/
```

### 4.3 Verificação de Tipos Antes de Merge

```bash
# Executar type-check em todo o monorepo
pnpm type-check

# Verificar que o Prisma Client foi regenerado após mudanças no schema
pnpm --filter database prisma generate

# Verificar que os tipos shared-types estão atualizados
pnpm --filter shared-types build
```

### 4.4 Prompt de Verificação de Regressão

Quando suspeitar de regressão após uma mudança, use:

```
Analise o impacto das mudanças recentes no módulo [NOME].

Arquivos modificados: [lista de arquivos]

Verifique:
1. Há alguma interface que foi alterada e pode quebrar implementações?
2. Há algum evento de domínio cujo contrato mudou?
3. Algum Use Case foi alterado de forma que quebre o Controller?
4. Algum tipo compartilhado em packages/shared-types foi modificado?

Aponte cada risco encontrado com o arquivo afetado e a correção necessária.
Não faça correções — apenas aponte.
```

---

## 5. Como Validar Entregas

### 5.1 Checklist de Validação por Camada

**Domínio (aplicar após cada entidade/VO):**

```
[ ] Zero imports de @nestjs/*, prisma, axios ou bibliotecas externas
[ ] Entidade estende BaseAggregate ou BaseEntity do Shared Kernel
[ ] Sem setters públicos — apenas métodos de comportamento
[ ] Value Objects são imutáveis (todos os campos readonly)
[ ] Construtores de VO validam e lançam exceção para valores inválidos
[ ] Exceções de domínio são classes tipadas (não Error genérico)
[ ] Eventos publicados em cada transição de estado
[ ] pnpm type-check passa sem erros
[ ] pnpm test passa (testes unitários do domínio)
```

**Aplicação (aplicar após cada Use Case):**

```
[ ] Use Case implementa IUseCase<Input, Output> do Shared Kernel
[ ] Recebe apenas interfaces (IRepository, IPort) — nunca classes concretas
[ ] Input e Output são DTOs — nunca entidades de domínio
[ ] Sem imports de @nestjs/*, prisma ou infraestrutura
[ ] Sem lógica de formatação ou serialização
[ ] Um único propósito declarado no nome da classe
[ ] pnpm type-check passa
[ ] pnpm test passa (Use Case com repositório mockado)
```

**Infraestrutura (aplicar após cada repositório/adapter):**

```
[ ] Implementa interface definida no domínio ou aplicação
[ ] Mapper explícito separando modelo Prisma da entidade de domínio
[ ] Erros Prisma traduzidos para exceções de domínio
[ ] Sem lógica de negócio — apenas acesso a dados e tradução
[ ] PrismaClient injetado via DI (não instanciado diretamente)
[ ] pnpm type-check passa
[ ] pnpm test:integration passa
```

**Apresentação (aplicar após cada Controller):**

```
[ ] Máximo 8 linhas por método
[ ] @ApiTags, @ApiOperation, @ApiResponse em todos os endpoints
[ ] @UseGuards(JwtAuthGuard) em todos os endpoints
[ ] @Roles([...]) em todos os endpoints
[ ] Sem lógica de negócio — apenas chamar Use Case e retornar
[ ] DTOs de entrada com @ApiProperty em todos os campos
[ ] pnpm type-check passa
[ ] pnpm test:integration passa (Supertest)
```

### 5.2 Prompt de Validação Automática

Use este prompt para solicitar que o Claude Code auto-valide antes de entregar:

```
Antes de entregar o código, valide internamente:

1. CLEAN ARCHITECTURE
   - O artefato está na camada correta?
   - Há algum import que viola a regra de dependência?

2. TYPESCRIPT
   - Há uso de `any`? (deve ser zero)
   - Há `@ts-ignore`? (proibido)
   - Todos os tipos são explícitos onde necessário?

3. SOLID
   - A classe tem mais de uma responsabilidade?
   - Há dependência de classe concreta onde deveria ser interface?

4. DOMÍNIO
   - Há lógica de negócio fora da camada de domínio?
   - Há setter público em entidade?

Apresente os resultados desta validação ANTES do código.
Se encontrar violações, corrija-as e apresente o código já corrigido.
```

---

## 6. Como Executar Auditorias Técnicas

### 6.1 Auditoria de Fronteiras de Módulo

Execute periodicamente para garantir que módulos não se acoplaram:

```
Execute uma auditoria de fronteiras arquiteturais no projeto.

Para cada módulo em apps/api/src/modules/, verifique:
1. Há imports diretos de outros módulos? (violação de fronteira DDD)
2. Há uso de PrismaClient fora da pasta infrastructure/?
3. Há lógica de negócio em arquivos de presentation/?
4. Há lógica de infraestrutura em arquivos de domain/ ou application/?

Liste cada violação no formato:
  ARQUIVO: [caminho]
  VIOLAÇÃO: [descrição]
  CORREÇÃO: [como corrigir]

Não corrija — apenas audite e reporte.
```

### 6.2 Auditoria de Segurança

```
Execute uma auditoria de segurança nos seguintes arquivos:
[lista de arquivos a auditar]

Verifique:
1. Há endpoints sem @UseGuards(JwtAuthGuard)?
2. Há endpoints sem @Roles([...]) definido?
3. Há queries Prisma com SELECT * (sem select explícito)?
4. Há dados PII sendo logados?
5. Há tokens ou credenciais em hardcode?
6. Há tabelas de auditoria com operações DELETE permitidas?
7. Há cookies sem flags HttpOnly e Secure?

Liste cada problema com severidade (CRÍTICO/ALTO/MÉDIO/BAIXO).
Não corrija — apenas reporte.
```

### 6.3 Auditoria de Performance

```
Analise os repositórios Prisma em:
apps/api/src/modules/[modulo]/infrastructure/repositories/

Identifique:
1. Queries N+1 (uso de include aninhado em loops)
2. Ausência de paginação em listagens
3. Queries sem filtro que retornam tabela inteira
4. Relações carregadas sem necessidade (include desnecessário)
5. Campos retornados que não são usados (falta de select)

Para cada problema, indique o arquivo, a linha aproximada e
a query Prisma otimizada que deve substituir.
```

### 6.4 Auditoria de Cobertura de Testes

```
Analise os arquivos de domínio em:
apps/api/src/modules/[modulo]/domain/

Para cada entidade e Value Object, liste:
1. Qual arquivo de teste corresponde?
2. Quais métodos/comportamentos NÃO têm teste?
3. Quais cenários de erro NÃO têm teste?

Formato de saída:
  ARTEFATO: [nome da classe]
  TESTADO: [lista de comportamentos com teste]
  SEM TESTE: [lista de comportamentos sem teste]
  PRIORIDADE: [CRÍTICO/ALTO/MÉDIO]
```

---

## 7. Como Revisar Código

### 7.1 Tipos de Revisão

| Tipo | Quando Usar | Foco |
|------|------------|------|
| **Revisão de domínio** | Após entidades e VOs | Regras de negócio, invariantes, eventos |
| **Revisão de arquitetura** | Após Use Cases | Dependências, fluxo, SOLID |
| **Revisão de segurança** | Após controllers e auth | Guards, RBAC, dados expostos |
| **Revisão de performance** | Após repositórios | Queries, N+1, índices |
| **Revisão de completude** | Antes de PR | Testes, tipos, documentação |

### 7.2 Prompt de Revisão de Domínio

```
Revise a entidade [Nome] em:
[caminho do arquivo]

Critérios de revisão:
1. As invariantes de negócio estão sendo protegidas?
   (ex: incidente fechado não pode ser atribuído)
2. Os eventos de domínio fazem sentido semântico?
   (ex: IncidentResolved deve ser publicado em resolve(), não em close())
3. Os Value Objects estão sendo usados onde deveriam?
   (ex: status como string vs IncidentStatus VO)
4. O construtor protege contra estados inválidos?
5. Há comportamento que deveria estar no domínio mas está em outro lugar?

Para cada ponto, avalie como OK, MELHORIA SUGERIDA ou PROBLEMA.
Inclua o código corrigido apenas para itens classificados como PROBLEMA.
```

### 7.3 Prompt de Revisão de Arquitetura

```
Revise o Use Case [Nome] em:
[caminho do arquivo]

Critérios:
1. Depende apenas de interfaces (nunca classes concretas)?
2. Tem uma única responsabilidade?
3. O Input DTO valida os dados de entrada?
4. O Output DTO não expõe entidades de domínio diretamente?
5. Erros de negócio são lançados como exceções de domínio tipadas?
6. Há efeito colateral (evento publicado) quando esperado?
7. A sequência de operações é correta (ex: persistir antes de publicar evento)?

Classifique cada critério como PASSA ou FALHA com justificativa.
```

### 7.4 Prompt de Revisão de PR

Use antes de abrir Pull Request:

```
Revise o conjunto de arquivos desta implementação como se fosse
um code reviewer senior de Clean Architecture e DDD.

Arquivos modificados:
[lista de arquivos do PR]

Critérios de revisão:
1. Clean Architecture — regras de dependência respeitadas?
2. DDD — linguagem ubíqua consistente com Docs/12_ARCHITECTURE.md?
3. SOLID — cada classe com responsabilidade única?
4. TypeScript — zero any, zero ts-ignore, tipos explícitos?
5. Segurança — endpoints protegidos, sem PII em logs?
6. Testes — cobertura mínima da camada de domínio e use cases?
7. Documentação — Swagger atualizado, JSDoc em interfaces públicas?

Apresente um resumo de APROVADO / APROVADO COM RESSALVAS / REPROVADO
com lista de itens para correção antes do merge.
```

---

## 8. Como Gerar Testes

### 8.1 Princípios de Geração de Testes

- **Gere testes junto com o código**, não depois.
- **Testes de domínio primeiro** — são os mais valiosos e os mais rápidos.
- **Teste comportamentos, não implementações** — `incident.resolve()` → status RESOLVED, não `incident._status = 'RESOLVED'`.
- **Nomeie com clareza total**: `deve lançar IncidentAlreadyResolvedException quando tentando resolver incidente já resolvido`.

### 8.2 Prompt para Testes de Entidade de Domínio

```
Gere testes unitários para a entidade [Nome] em:
  apps/api/src/modules/[modulo]/domain/entities/[nome].entity.ts

Arquivo de teste:
  apps/api/src/modules/[modulo]/domain/entities/[nome].entity.spec.ts

Cenários obrigatórios para cada método público:
- Cenário feliz (happy path)
- Cada guarda/invariante violada (deve lançar exceção)
- Transições de estado inválidas (ex: resolver incidente já fechado)
- Eventos publicados após cada transição bem-sucedida

Framework: Jest
Padrão: describe → describe → it (3 níveis)
Nomeação: "deve [resultado] quando [condição]"

Sem mocks de infraestrutura — domínio é testado de forma completamente isolada.
Use o builder pattern para criar instâncias de teste:
  IncidentBuilder.create().withStatus('OPEN').build()
```

### 8.3 Prompt para Testes de Use Case

```
Gere testes unitários para [Nome]UseCase em:
  apps/api/src/modules/[modulo]/application/use-cases/[nome].use-case.ts

Arquivo de teste:
  [mesmo caminho].spec.ts

Para cada Use Case, teste:
1. Happy path — fluxo completo bem-sucedido
2. Entidade não encontrada → exceção correta
3. Violação de regra de negócio → exceção de domínio
4. Evento de domínio publicado após sucesso
5. Repositório chamado com os parâmetros corretos

Mocks obrigatórios (usando jest.fn()):
- I[Entidade]Repository → todas as chamadas mockadas
- IEventBus → verificar que publish() foi chamado com evento correto
- I[Port] (se aplicável)

Use jest.mock() apenas para módulos externos.
Use implementações in-memory para repositórios quando possível.
```

### 8.4 Prompt para Testes de Integração (Controller)

```
Gere testes de integração para [Nome]Controller usando Supertest.

Arquivo de teste:
  apps/api/src/modules/[modulo]/presentation/[nome].controller.spec.ts

Para cada endpoint, teste:
1. Resposta correta com dados válidos e usuário autenticado
2. 401 sem token de autenticação
3. 403 com token de role insuficiente
4. 400 com dados de entrada inválidos
5. 404 para recurso não encontrado
6. 422 para violação de regra de negócio

Setup do teste:
- NestJS Test module com módulo completo
- Banco de dados de teste (PostgreSQL local ou in-memory)
- JWT de teste assinado com chave privada de teste

Não use dados de produção ou staging.
Limpe o banco antes de cada teste (beforeEach).
```

### 8.5 Prompt para Testes E2E (Playwright)

```
Gere teste E2E com Playwright para o fluxo:
[descrição do fluxo em linguagem de negócio]

Arquivo: apps/web/e2e/[modulo]/[nome-do-fluxo].spec.ts

Page Objects necessários (criar se não existirem):
- [NomeDaPagina]Page em apps/web/e2e/pages/

Passos do fluxo:
1. [passo 1 em linguagem de usuário]
2. [passo 2]
...
N. [passo final com assertion]

Assertions obrigatórias:
- [o que verificar ao final do fluxo]

Configuração:
- Base URL via process.env.E2E_BASE_URL
- Autenticação via storageState (sessão pré-autenticada)
- Screenshot em caso de falha (automático via config)
```

---

## 9. Como Gerar Documentação

### 9.1 Documentação de Interface (JSDoc)

```
Adicione JSDoc às interfaces públicas em:
[caminho dos arquivos de interface]

Para cada interface/método, documente:
- O que o método faz (em linguagem de domínio, não técnica)
- Parâmetros com tipo e descrição
- Retorno com tipo e descrição
- Exceções que podem ser lançadas
- Exemplo de uso (quando não for óbvio)

Padrão:
/**
 * [Descrição em linguagem de domínio]
 *
 * @param [param] - [descrição]
 * @returns [descrição do retorno]
 * @throws {[TipoDeExcecao]} quando [condição]
 * @example
 * [exemplo de uso]
 */
```

### 9.2 Atualização de Swagger

```
Revise os decorators Swagger no Controller em:
[caminho do controller]

Verifique e adicione onde faltam:
1. @ApiTags('[nome-do-modulo]') na classe
2. @ApiOperation({ summary: '...', description: '...' }) em cada método
3. @ApiResponse({ status: 200, description: '...', type: [Dto] }) para sucesso
4. @ApiResponse({ status: 400, description: 'Dados inválidos' }) para erro de validação
5. @ApiResponse({ status: 401, description: 'Não autenticado' })
6. @ApiResponse({ status: 403, description: 'Sem permissão' })
7. @ApiResponse({ status: 404, description: 'Não encontrado' })
8. @ApiBearerAuth() em todos os endpoints protegidos
9. @ApiProperty({ description: '...', example: '...' }) em todos os DTOs

Retorne o controller completo com todos os decorators adicionados.
```

### 9.3 Atualização de Documento de Módulo

```
Com base na implementação concluída do módulo [Nome],
atualize o arquivo Docs/Módulos/[XX]_[NOME].md.

Seções a atualizar:
1. Use Cases — adicionar os implementados com Input/Output reais
2. Endpoints da API — adicionar com métodos, paths e roles
3. Eventos publicados — confirmar com os eventos reais do código
4. Regras de negócio — adicionar RN-[MOD]-[NUM] para cada invariante do domínio
5. Exemplos de payload — adicionar request/response reais dos testes

Mantenha o formato existente do documento.
Incremente a versão de PATCH (último dígito).
Adicione entrada no controle de versões.
```

---

## 10. Prompts por Módulo

### 10.1 Banco de Dados

#### Criar Schema de Novo Módulo

```
Adicione ao arquivo packages/database/schema.prisma o schema
para o módulo [Nome] do SGTI.

Referência: Docs/12_ARCHITECTURE.md seção [X].

Requisitos:
- Schema PostgreSQL isolado: [nome_do_schema]
- Modelos: [lista de models com campos principais]
- Relacionamentos: [descrever FKs e cardinalidades]
- Sem FKs cruzando para outros schemas
- Campos de auditoria em todos os models: createdAt, updatedAt
- Soft delete via deletedAt onde aplicável

Após o schema, gere o arquivo de migration:
packages/database/migrations/[YYYYMMDD]_create_[modulo]_schema.sql

Valide que não há referências a tabelas de outros schemas.
```

#### Criar Migration Específica

```
Crie uma migration Prisma para a seguinte mudança de schema:
[descrição da mudança]

Arquivo do schema atual: packages/database/schema.prisma
Mudança a fazer: [descrição precisa]

Requisitos:
- Nome da migration: YYYYMMDD_[descricao_em_snake_case]
- Se for mudança destrutiva (DROP, rename): incluir comentário de risco
- Se renomear coluna: usar estratégia de 3 etapas
  (1. adicionar nova, 2. migrar dados, 3. remover antiga)
- Validar que RLS existente não é quebrado pela mudança

Gere o arquivo de migration SQL equivalente para revisão manual.
```

#### Adicionar Índice de Performance

```
Analise as queries do repositório em:
apps/api/src/modules/[modulo]/infrastructure/repositories/

Identifique as colunas mais filtradas e adicione os índices
correspondentes no schema.prisma.

Para cada índice proposto, justifique:
- Qual query se beneficia
- Estimativa de melhoria de performance
- Se é índice simples ou composto (e por quê)

Não adicione índices em colunas de alta cardinalidade sem justificativa.
```

---

### 10.2 Autenticação

#### Implementar Fluxo OAuth Completo

```
Leia Docs/12_ARCHITECTURE.md seção 6.14 e Docs/01_CLAUDE.md seção 7.

Implemente o AuthModule completo em:
  apps/api/src/modules/auth/

Estrutura:
  domain/
    value-objects/jwt-claims.vo.ts
    value-objects/refresh-token-status.vo.ts
  application/
    use-cases/exchange-google-code.use-case.ts
    use-cases/refresh-session.use-case.ts
    use-cases/revoke-session.use-case.ts
    ports/google-oauth.port.ts
  infrastructure/
    adapters/google-oauth.adapter.ts
  presentation/
    auth.controller.ts

JWT: RS256, Access Token 1h, Refresh Token 7d com rotação
Cookies: HttpOnly, Secure, SameSite=Strict
Endpoints: GET /auth/google, GET /auth/callback, POST /auth/refresh, POST /auth/logout

Não implemente o Google Directory (provisioning) — apenas OAuth.
```

#### Implementar Guard de RBAC

```
Implemente RolesGuard em:
  apps/api/src/shared/presentation/guards/roles.guard.ts

Requisitos:
- Lê roles permitidos do decorator @Roles([...])
- Compara com role do JWT claim
- Lança ForbiddenException se role insuficiente
- Logar tentativas de acesso negado no AuditLog

Implemente também o decorator @Roles em:
  apps/api/src/shared/presentation/decorators/roles.decorator.ts

Implemente o enum Role em:
  apps/api/src/modules/identity/domain/value-objects/role.vo.ts

Com os 10 roles definidos em Docs/12_ARCHITECTURE.md seção 6.5.
```

---

### 10.3 Incidentes

#### Implementar Domínio Completo

```
Leia Docs/12_ARCHITECTURE.md seção 6.1.

Implemente o domínio completo do módulo Incident em:
  apps/api/src/modules/incident/domain/

Ordem de implementação:
1. Value Objects (um por arquivo):
   - incident-status.vo.ts    (OPEN, IN_PROGRESS, ESCALATED, PENDING_USER, RESOLVED, CLOSED)
   - priority.vo.ts           (CRITICAL, HIGH, MEDIUM, LOW)
   - impact-level.vo.ts       (WIDESPREAD, SIGNIFICANT, MODERATE, MINOR)
   - urgency-level.vo.ts      (CRITICAL, HIGH, MEDIUM, LOW)
   - sla-target.vo.ts         (responseDeadline, resolutionDeadline, isPaused, pausedAt)
   - resolution-details.vo.ts (solution, knowledgeArticleId?, resolvedBy, resolvedAt)

2. Exceções (uma por arquivo):
   - incident-not-found.exception.ts
   - incident-already-resolved.exception.ts
   - incident-already-closed.exception.ts
   - invalid-status-transition.exception.ts

3. Entidade Incident (incident.entity.ts)
   - Estende BaseAggregate
   - Métodos: open(), assign(), escalate(), resolve(), close(), reopen(), addComment(), pauseSla(), resumeSla()
   - Publica eventos correspondentes a cada transição

4. Eventos (um por arquivo em events/):
   - incident-opened.event.ts
   - incident-assigned.event.ts
   - incident-escalated.event.ts
   - incident-resolved.event.ts
   - incident-closed.event.ts
   - incident-reopened.event.ts

5. Domain Service:
   - priority-matrix.domain-service.ts
   (recebe ImpactLevel + UrgencyLevel → retorna Priority)

6. Interfaces de repositório:
   - incident.repository.interface.ts

Cada arquivo deve ter seu spec.ts correspondente com testes unitários.
```

#### Implementar Use Case de Abertura

```
Leia a entidade Incident em:
  apps/api/src/modules/incident/domain/entities/incident.entity.ts

Implemente OpenIncidentUseCase em:
  apps/api/src/modules/incident/application/use-cases/open-incident.use-case.ts

Input:
  title: string
  description: string
  category: ServiceCategory
  impact: ImpactLevel
  urgency: UrgencyLevel
  reporterId: string (UserId)
  affectedAssetId?: string (AssetId)

Fluxo:
  1. Validar que reporterId existe (IUserReadRepository)
  2. Calcular Priority via PriorityMatrixDomainService
  3. Carregar SlaTarget para a categoria (IServiceCatalogPort)
  4. Criar Incident via Incident.open(...)
  5. Persistir via IIncidentRepository
  6. Publicar IncidentOpened via IEventBus

Output:
  incidentId: string
  priority: Priority
  slaResponseDeadline: Date
  slaResolutionDeadline: Date

Gere também o spec.ts com testes unitários cobrindo:
- Happy path com evento publicado
- Reporter não encontrado → NotFoundException
- SLA não disponível para categoria → usar SLA padrão
```

---

### 10.4 Requisições

#### Implementar Fluxo de Aprovação

```
Leia Docs/12_ARCHITECTURE.md seção 6.2.

Implemente o domínio do fluxo de aprovação do módulo Request em:
  apps/api/src/modules/request/domain/

Foco nesta sessão: o mecanismo de aprovação multinível

Entidades:
  ServiceRequest (aggregate root)
  ApprovalStep (filho do agregado)
    - stepNumber: number
    - approverRole: Role
    - decision: ApprovalDecision | null
    - decidedAt: Date | null
    - decidedBy: UserId | null

Value Objects:
  ApprovalDecision: APPROVED | REJECTED | DELEGATED
  RequestStatus: [ver Docs/12_ARCHITECTURE.md seção 6.2]

Comportamentos da entidade ServiceRequest:
  - approve(approverId, stepNumber): avança para próxima etapa ou fulfillment
  - reject(approverId, stepNumber, reason): rejeita e notifica
  - delegate(approverId, stepNumber, delegateeId): transfere etapa

Invariantes a proteger:
  - Apenas o aprovador da etapa atual pode tomar decisão
  - Etapas devem ser concluídas em ordem
  - Requisição rejeitada não pode ser aprovada
```

---

### 10.5 Compliance

#### Implementar Upload de Evidências

```
Implemente o fluxo de upload de evidências de compliance em:
  apps/api/src/modules/compliance/

Arquivos a criar:

1. Port de Storage:
   apps/api/src/modules/compliance/application/ports/evidence-storage.port.ts
   Interface: upload(controlId, file, userId): Promise<StoragePath>

2. Supabase Storage Adapter:
   apps/api/src/modules/compliance/infrastructure/adapters/supabase-evidence-storage.adapter.ts
   Implementa o port acima
   Bucket: 'compliance'
   Path: compliance/{controlId}/{timestamp}_{filename_sanitized}
   Retorna: storage_path (não URL pública)

3. Use Case:
   apps/api/src/modules/compliance/application/use-cases/collect-evidence.use-case.ts
   - Valida que o controle existe e está PARTIALLY_IMPLEMENTED ou NOT_IMPLEMENTED
   - Faz upload via IEvidenceStoragePort
   - Cria entidade Evidence com storage_path
   - Atualiza ControlStatus para PARTIALLY_IMPLEMENTED se era NOT_IMPLEMENTED
   - Publica EvidenceCollected event

4. Controller endpoint:
   POST /api/compliance/controls/:id/evidences
   multipart/form-data com campo 'file'
   Roles: COMPLIANCE_OFFICER, IT_MANAGER, SUPER_ADMIN

Validações:
  - Tamanho máximo: 50MB
  - Tipos aceitos: PDF, PNG, JPG, DOCX, XLSX
  - Nome do arquivo sanitizado (sem caracteres especiais)
```

#### Gerar Relatório de Maturidade

```
Implemente GenerateMaturityReportUseCase em:
  apps/api/src/modules/compliance/application/use-cases/generate-maturity-report.use-case.ts

Input:
  framework: Framework (LGPD | ISO_27001 | ITIL_V4 | INTERNAL | ALL)
  period?: { start: Date, end: Date }

Output:
  framework: string
  totalControls: number
  byStatus: {
    implemented: number
    partiallyImplemented: number
    notImplemented: number
    notApplicable: number
  }
  maturityPercentage: number  ← (implemented / (total - notApplicable)) * 100
  controlsByDomain: Array<{
    domain: string
    maturityPercentage: number
    controls: Array<{ id, name, status }>
  }>
  nonConformances: Array<{ id, title, severity, openedAt, daysOpen }>
  generatedAt: Date

Cálculo de maturidade:
  Apenas controles IMPLEMENTED contam como 100%
  PARTIALLY_IMPLEMENTED conta como 50%
  NOT_APPLICABLE é excluído do denominador
```

---

### 10.6 Financeiro

#### Implementar Controle de Orçamento

```
Leia Docs/12_ARCHITECTURE.md seção 6.7.

Implemente o domínio do módulo Finance focado em Budget:
  apps/api/src/modules/finance/domain/

Value Objects:
  budget-type.vo.ts: CAPEX | OPEX
  money-amount.vo.ts: { amount: Decimal, currency: 'BRL' }
    - Validar amount > 0
    - Métodos: add(), subtract(), isGreaterThan(), toDisplay()
  cost-center.vo.ts: { code: string, name: string }
  budget-status.vo.ts: ON_TRACK | AT_RISK | EXCEEDED

Entidade Budget (aggregate root):
  - Campos: id, type, fiscalYear, costCenter, totalAmount, allocatedAmount, spentAmount
  - Métodos:
    - allocate(amount): valida que não excede total; retorna BudgetAllocated event
    - registerExpense(amount): deduz do alocado; publica BudgetExceeded se > 100%
    - getAvailableAmount(): total - spent
    - getUtilizationPercentage(): (spent / total) * 100

Domain Service:
  budget-reconciliation.domain-service.ts
  - Recebe lista de Budget e lista de Expense
  - Retorna status consolidado por centro de custo

Invariante crítica:
  Não permitir registerExpense que resulte em spentAmount > totalAmount * 1.2
  (20% de tolerância configurável)
  Acima disso: lançar BudgetHardLimitExceededException
```

#### Implementar Relatório Financeiro

```
Implemente GenerateFinancialReportUseCase em:
  apps/api/src/modules/finance/application/use-cases/generate-financial-report.use-case.ts

Input:
  period: { start: Date, end: Date }
  budgetType?: BudgetType
  costCenter?: string

Output:
  period: { start: Date, end: Date }
  summary: {
    totalBudgeted: MoneyAmount
    totalSpent: MoneyAmount
    variance: MoneyAmount          ← budgeted - spent
    variancePercentage: number
    utilizationPercentage: number
  }
  byBudgetType: {
    capex: { budgeted, spent, variance }
    opex: { budgeted, spent, variance }
  }
  byCostCenter: Array<{
    costCenter: string
    budgeted: MoneyAmount
    spent: MoneyAmount
    utilizationPercentage: number
  }>
  contractsExpiringSoon: Array<{
    id, name, vendor, expiresAt, value, daysUntilExpiry
  }>
  topExpenses: Array<{
    category, description, amount, date
  }>
  generatedAt: Date
```

---

### 10.7 Base de Conhecimento

#### Implementar Busca Full-Text

```
Implemente SearchArticlesUseCase em:
  apps/api/src/modules/knowledge/application/use-cases/search-articles.use-case.ts

Input:
  query: string          ← texto de busca
  audience?: ArticleAudience
  category?: ArticleCategory
  page: number
  perPage: number

Implementação da busca:
  Usar PostgreSQL full-text search via Prisma $queryRaw tipado
  Query SQL base:
    SELECT *, ts_rank(search_vector, plainto_tsquery('portuguese', $query)) AS rank
    FROM knowledge.knowledge_articles
    WHERE status = 'PUBLISHED'
      AND search_vector @@ plainto_tsquery('portuguese', $query)
    ORDER BY rank DESC, view_count DESC
    LIMIT $perPage OFFSET $offset

Output:
  articles: Array<{
    id, title, slug, excerpt, category, audience
    relevanceScore: number
    viewCount: number
    rating: number
    linkedIncidents: number
  }>
  total: number
  page: number
  perPage: number

O campo search_vector deve ser um tsvector gerado por trigger PostgreSQL
combinando title (peso A) + content (peso B) + tags (peso C).
Gere também o trigger SQL para manutenção automática do tsvector.
```

#### Implementar Sugestão Automática de Artigo

```
Implemente o event handler que cria rascunho automático de artigo
quando um incidente é resolvido:

  apps/api/src/modules/knowledge/application/handlers/incident-resolved.handler.ts

Trigger: evento IncidentResolved do EventBus

Lógica:
  1. Verificar se já existe artigo para esta categoria de incidente
     com solução similar (busca por tokens da solução)
  2. Se não existe: criar rascunho de artigo
     - title: "Como resolver: [incident.title]"
     - content: template pré-preenchido com incident.resolution.solution
     - category: derivada de incident.serviceCategory
     - status: DRAFT
     - audience: TECHNICAL
     - suggestedBy: 'SYSTEM'
     - linkedIncidentId: incident.id
  3. Se já existe artigo similar: apenas vincular o incidente ao artigo

Handler deve ser idempotente:
  Processar o mesmo IncidentResolved event duas vezes não deve criar dois rascunhos.
  Use o incidentId como chave de idempotência.
```

---

### 10.8 Dashboards

#### Implementar Projeção de Incidentes

```
Implemente a projeção de métricas de incidentes para o Dashboard.

Arquivos a criar:

1. Migration para tabela de projeção:
   packages/database/migrations/YYYYMMDD_create_dashboard_incident_metrics.sql
   
   Tabela: dashboard.incident_metrics
   Colunas:
     period_date DATE (data do período — granularidade diária)
     total_opened INT
     total_resolved INT
     total_closed INT
     sla_compliant INT        ← resolvidos dentro do SLA
     sla_breached INT         ← resolvidos fora do SLA
     avg_resolution_hours DECIMAL(10,2)
     by_priority JSONB        ← { critical: N, high: N, medium: N, low: N }
     by_category JSONB        ← { category_name: N, ... }
     updated_at TIMESTAMPTZ

2. Event Handler para atualizar a projeção:
   apps/api/src/modules/dashboard/application/handlers/incident-metrics.handler.ts
   
   Consome: IncidentOpened, IncidentResolved, IncidentClosed
   
   Para cada evento:
     UPSERT em incident_metrics WHERE period_date = DATE(event.occurredOn)
     Incrementar contadores correspondentes
     Recalcular avg_resolution_hours
   
   Handler deve ser idempotente usando eventId como chave.

3. Query de leitura:
   apps/api/src/modules/dashboard/application/use-cases/get-incident-metrics.use-case.ts
   
   Input: { period: 'day' | 'week' | 'month', startDate: Date, endDate: Date }
   Output: Array<IncidentMetricsPeriod> com totais e calculados (MTTR, SLA%)
```

#### Implementar Dashboard Executivo

```
Implemente o endpoint do Dashboard Executivo:
  apps/api/src/modules/dashboard/presentation/executive-dashboard.controller.ts

GET /api/dashboard/executive
Roles: EXECUTIVE, IT_MANAGER, SUPER_ADMIN

Response:
  slaGlobal: {
    percentage: number      ← % chamados dentro do SLA no mês atual
    trend: 'UP' | 'DOWN' | 'STABLE'
    previousMonth: number
  }
  serviceAvailability: {
    percentage: number      ← uptime de serviços críticos
    criticalServicesCount: number
    incidentsThisMonth: number
  }
  csat: {
    average: number         ← nota média de 0 a 5
    responsesCount: number
    trend: 'UP' | 'DOWN' | 'STABLE'
  }
  financialSummary: {
    opexUtilization: number ← % do OPEX utilizado no mês
    capexUtilization: number
    contractsExpiringSoon: number
  }
  complianceMaturity: {
    overallPercentage: number
    byFramework: Array<{ framework, percentage }>
    openNonConformances: number
  }
  activeProjects: {
    total: number
    onTrack: number
    delayed: number
    completed: number
  }
  generatedAt: Date

Todos os dados vêm das tabelas de projeção do schema dashboard.
Zero JOINs em schemas de outros módulos.
Cache de 5 minutos (NestJS CacheInterceptor).
```

---

## 11. Anti-Padrões a Evitar

### 11.1 No Prompt

| Anti-Padrão | Por que é ruim | Alternativa |
|-------------|---------------|-------------|
| Colar conteúdo de documentos no prompt | Desperdiça tokens, cria redundância | Referenciar por caminho e seção |
| Pedir múltiplos módulos em um prompt | Contexto insuficiente, qualidade cai | Um módulo por prompt |
| Prompts sem escopo de arquivo | Claude Code cria arquivos nos lugares errados | Sempre especificar caminhos exatos |
| Pedir "refatore tudo" sem critério | Mudanças sem direção, alto risco de regressão | Critérios específicos de refatoração |
| Repetir regras do CLAUDE.md | Duplicação desnecessária | Referenciar "conforme CLAUDE.md" |

### 11.2 No Código Gerado

| Anti-Padrão | Sinal de Alerta | Ação |
|-------------|----------------|------|
| `any` no TypeScript | `as any`, `: any`, `Record<string, any>` | Solicitar tipo explícito |
| Import cruzado entre módulos | `from '../../outro-modulo/...'` | Solicitar refatoração para evento |
| Lógica de negócio no controller | `if`, `calculate`, `validate` no controller | Mover para Use Case ou Domain Service |
| Prisma no domínio | `@prisma/client` em domain/ | Extrair para repositório |
| Setter público em entidade | `set status(...)` | Substituir por método de comportamento |
| `console.log` em produção | `console.log`, `console.error` | Substituir pelo Logger estruturado |
| try-catch vazio | `catch (e) {}` | Tratar ou relançar como exceção de domínio |

### 11.3 Na Arquitetura

| Anti-Padrão | Consequência | Prevenção |
|-------------|-------------|-----------|
| Shared database entre módulos (JOINs cross-schema) | Quebra fronteiras DDD, dificulta extração | Um schema por módulo, zero JOINs externos |
| God Use Case (>100 linhas) | Responsabilidade única violada | Extrair em Use Cases menores |
| Repository genérico com `findAll({ where })` exposto | Lógica de query vaza para aplicação | Métodos com nomes de domínio |
| DTO = Entidade de domínio | Exposição de internos do domínio | Mapper explícito sempre |
| Event Handler com lógica de negócio | Cross-cutting concerns incorretos | Handler apenas orquestra; domínio decide |

---

## 12. Checklist de Sessão

### Antes de Começar

```
[ ] Li o arquivo CLAUDE.md (Claude Code lê automaticamente)
[ ] Identifiquei a fase atual em Docs/80_IMPLEMENTATION_ORDER.md
[ ] Li o documento do módulo correspondente em Docs/12_ARCHITECTURE.md
[ ] Verifiquei o estado atual do módulo (o que já foi implementado)
[ ] Defini o artefato específico desta sessão
[ ] Tenho os caminhos de arquivo exatos que serão criados/modificados
```

### Durante a Sessão

```
[ ] Prompt tem os 4 componentes: CONTEXTO, TAREFA, ESCOPO, RESTRIÇÕES
[ ] Validei o código antes de aceitar (checklist da seção 5.1)
[ ] Rodei pnpm lint && pnpm type-check antes de continuar
[ ] Rodei pnpm test para o módulo afetado
[ ] Commitei antes de passar para o próximo artefato
[ ] Não há imports cruzados entre módulos (verificar com grep)
```

### Ao Encerrar a Sessão

```
[ ] Todo código desta sessão foi commitado
[ ] CLAUDE.md ou Docs/ atualizados se alguma decisão mudou
[ ] Próximos artefatos registrados como TODO no branch atual
[ ] Nenhum arquivo de teste desativado (skip, only, todo) sem issue
[ ] PR aberto para revisão se a fase foi concluída
[ ] Critérios de conclusão da fase verificados em Docs/80_IMPLEMENTATION_ORDER.md
```

### Template de Mensagem de Commit

```
<tipo>(<modulo>): <descrição imperativa em inglês>

[corpo opcional explicando o "porquê" se não for óbvio]

Docs/80_IMPLEMENTATION_ORDER.md: Fase [N] - [etapa]
```

Exemplos:
```
feat(incident): add Incident aggregate with status transitions
feat(incident): implement OpenIncidentUseCase with sla calculation
feat(incident): add PrismaIncidentRepository with domain mapper
feat(incident): expose incident endpoints via IncidentController
test(incident): add unit tests for Incident domain entity
```

---

## Controle de Versões do Documento

| Versão | Data | Autor | Descrição da Alteração |
|--------|------|-------|------------------------|
| 1.0.0 | 2026-06-09 | Arquitetura Corporativa | Criação do documento |

---

> **Documentos relacionados:**
> [`01_CLAUDE.md`](./01_CLAUDE.md) — Regras permanentes de implementação
> [`80_IMPLEMENTATION_ORDER.md`](./80_IMPLEMENTATION_ORDER.md) — Ordem oficial de implementação
> [`12_ARCHITECTURE.md`](./12_ARCHITECTURE.md) — Arquitetura corporativa completa
> [`82_ARCHITECT_DECISIONS.md`](./82_ARCHITECT_DECISIONS.md) — Decisões arquiteturais (ADRs)
