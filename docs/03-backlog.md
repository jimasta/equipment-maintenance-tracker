# 03 — Backlog de Sprints: Equipment Maintenance Tracker

## Convenções
- Sprints de 1 semana, escopo pequeno e fechável.
- Formato de story: "Como [persona], quero [ação], para [benefício]."
- Cada sprint tem sua **Definition of Done (DoD)** própria, além da DoD geral abaixo.

## Definition of Done — Geral (vale para toda story)
- [ ] Código implementado e rodando localmente via Docker
- [ ] Teste(s) automatizado(s) cobrindo o caminho principal da feature
- [ ] Lint/format sem erros
- [ ] PR aberto, self-review feito, merge em `main`
- [ ] Sem secrets/credenciais commitados

---

## Backlog Completo (User Stories)

### Épico: Autenticação
- **US01** — Como usuário, quero fazer login com e-mail e senha, para acessar o sistema com segurança. (RF07)
- **US02** — Como gestor, quero que papéis (técnico/supervisor/gestor) controlem o que cada um vê, para restringir dados sensíveis como custo. (RF07, RNF02)

### Épico: Cadastro de Ativos
- **US03** — Como supervisor, quero cadastrar um ativo com nome, tipo, localização e data de aquisição, para começar a rastreá-lo. (RF01)
- **US04** — Como supervisor, quero editar e listar ativos cadastrados, para manter os dados atualizados.

### Épico: Plano de Manutenção Preventiva
- **US05** — Como supervisor, quero cadastrar um plano de manutenção por ativo com intervalo em dias ou horas de uso, para definir a periodicidade esperada. (RF02)
- **US06** — Como supervisor, quero desativar um plano de manutenção sem apagar o histórico, para lidar com ativos aposentados.

### Épico: Execução de Manutenção
- **US07** — Como técnico, quero registrar a execução de uma manutenção com data, observações e custo, para manter o histórico auditável. (RF03)
- **US08** — Como técnico, quero ver a lista de manutenções pendentes para hoje/semana, para saber o que fazer no meu turno. (Persona: Técnico)

### Épico: Status e Alertas
- **US09** — Como supervisor, quero ver todos os ativos com status Em dia / Próximo do vencimento / Vencido, para priorizar ação. (RF04)
- **US10** — Como supervisor, quero um painel de alertas destacando ativos a X dias do vencimento, para agir antes da falha. (RF05 — versão painel, ADR-003)

### Épico: Histórico e Relatórios
- **US11** — Como técnico ou supervisor, quero ver o histórico completo de manutenções de um ativo em uma única tela, para entender seu passado. (RF06)
- **US12** — Como gestor, quero um relatório de custo e frequência de manutenção por ativo, para decidir sobre substituição.

---

## Divisão em Sprints

### Sprint 1 — Fundação + Autenticação
**Objetivo:** ter login funcionando e esqueleto do projeto rodando via Docker.
- US01 — Login com e-mail/senha
- US02 — Controle de acesso por papel

**DoD do sprint:**
- [ ] `docker-compose up` sobe API + banco sem erro
- [ ] Login retorna JWT válido; rota protegida rejeita token ausente/inválido
- [ ] Papel do usuário embutido no token e validado em pelo menos uma rota

### Sprint 2 — Cadastro de Ativos e Planos
**Objetivo:** permitir cadastro completo de ativo + plano de manutenção.
- US03 — Cadastrar ativo
- US04 — Editar/listar ativos
- US05 — Cadastrar plano de manutenção
- US06 — Desativar plano sem apagar histórico

**DoD do sprint:**
- [ ] CRUD de Ativo completo com validação de campos obrigatórios
- [ ] Plano de manutenção vinculado corretamente ao Ativo (FK)
- [ ] Critério de aceite do MVP: cadastro de ativo + plano em menos de 2 minutos (validado manualmente)

### Sprint 3 — Execução e Status
**Objetivo:** registrar manutenções e calcular status derivado (RF04, ADR-002).
- US07 — Registrar execução de manutenção
- US08 — Lista de pendências do técnico
- US09 — Status Em dia/Próximo/Vencido

**DoD do sprint:**
- [ ] Cálculo de `proximoVencimento` implementado conforme regra do `docs/02-architecture.md`
- [ ] Teste automatizado cobrindo os 3 estados de status com datas fixas (mock de data atual)
- [ ] Critério de aceite do MVP: status correto baseado na data atual

### Sprint 4 — Alertas, Histórico e Relatório
**Objetivo:** fechar os critérios de aceite restantes do MVP.
- US10 — Painel de alertas (Próximo do vencimento)
- US11 — Histórico completo por ativo em uma tela
- US12 — Relatório de custo e frequência por ativo

**DoD do sprint:**
- [ ] Painel destaca ativos "Próximo do vencimento" com base no job/consulta de status
- [ ] Tela de histórico lista todos os `RegistroManutencao` de um ativo, ordenados por data
- [ ] Relatório agrega custo total e contagem de manutenções por ativo
- [ ] Todos os 4 critérios de aceite do MVP (docs/01-discovery.md) revalidados e passando

---

## GitHub Issues
Cada user story (US01–US12) deve virar uma Issue no repositório, com label do épico correspondente (`auth`, `ativos`, `manutencao`, `status-alertas`, `historico-relatorio`) e milestone do sprint (`Sprint 1`–`Sprint 4`).

## Próximo passo
Etapa 4 — Setup inicial do código (scaffold): estrutura de pastas, lint/formatter, testes, CI básico via GitHub Actions.
