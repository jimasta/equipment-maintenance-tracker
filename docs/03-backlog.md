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

### Épico: Fundação de UI / Design System
- **US00** — Como usuário, quero uma interface com identidade visual consistente (cores, tipografia, espaçamento) em variáveis centralizadas, para que a aplicação pareça profissional e seja fácil de evoluir. *(Concluída — ver `frontend/src/styles/tokens.css`)*
- **US00a** — Como usuário, quero um layout shell (topo/navegação + área de conteúdo) responsivo, para navegar entre telas de forma consistente no desktop e no tablet. (RNF04)
- **US00b** — Como usuário, quero estados visuais claros de carregamento, vazio e erro em toda tela que busca dados, para entender o que está acontecendo sem ambiguidade.
- **US00c** — Como usuário, quero componentes de formulário (input, select, date picker) com o mesmo padrão visual e validação inline, para preencher cadastros com confiança e sem retrabalho.
- **US00d** — Como técnico usando tablet em campo, quero que tabelas e formulários se adaptem a telas menores (empilhamento, alvo de toque adequado), para operar o sistema fora do escritório. (RNF04)

### Épico: Autenticação
- **US01** — Como usuário, quero fazer login com e-mail e senha, para acessar o sistema com segurança. (RF07)
- **US01a** — Como usuário, quero uma tela de login com identidade visual da aplicação e feedback claro de erro (credenciais inválidas), para entender rapidamente por que não consegui entrar.
- **US02** — Como gestor, quero que papéis (técnico/supervisor/gestor) controlem o que cada um vê, para restringir dados sensíveis como custo. (RF07, RNF02)
- **US02a** — Como usuário, quero ver meu nome e papel no cabeçalho e ter uma opção clara de logout, para saber com qual identidade estou operando o sistema.

### Épico: Cadastro de Ativos
- **US03** — Como supervisor, quero cadastrar um ativo com nome, tipo, localização e data de aquisição, para começar a rastreá-lo. (RF01)
- **US03a** — Como supervisor, quero um formulário de cadastro de ativo com validação inline e feedback de sucesso, para completar o cadastro com confiança e sem recarregar a página.
- **US04** — Como supervisor, quero editar e listar ativos cadastrados, para manter os dados atualizados.
- **US04a** — Como supervisor, quero uma tabela de ativos com busca/filtro por tipo e localização, para localizar rapidamente um ativo específico em uma lista grande.

### Épico: Plano de Manutenção Preventiva
- **US05** — Como supervisor, quero cadastrar um plano de manutenção por ativo com intervalo em dias ou horas de uso, para definir a periodicidade esperada. (RF02)
- **US06** — Como supervisor, quero desativar um plano de manutenção sem apagar o histórico, para lidar com ativos aposentados.

### Épico: Execução de Manutenção
- **US07** — Como técnico, quero registrar a execução de uma manutenção com data, observações e custo, para manter o histórico auditável. (RF03)
- **US08** — Como técnico, quero ver a lista de manutenções pendentes para hoje/semana, para saber o que fazer no meu turno. (Persona: Técnico)
- **US08a** — Como técnico, quero que a lista de pendências use cartões grandes e legíveis (não uma tabela densa), para consultar rapidamente em campo, inclusive em tablet.

### Épico: Status e Alertas
- **US09** — Como supervisor, quero ver todos os ativos com status Em dia / Próximo do vencimento / Vencido, para priorizar ação. (RF04)
- **US09a** — Como supervisor, quero que o status seja visualmente distinto (cor + ícone + texto, nunca só cor) na listagem de ativos, para identificar prioridades num relance mesmo com daltonismo.
- **US10** — Como supervisor, quero um painel de alertas destacando ativos a X dias do vencimento, para agir antes da falha. (RF05 — versão painel, ADR-003)
- **US10a** — Como supervisor, quero um painel inicial (dashboard) com contagem de ativos por status e destaque dos mais urgentes, para ter uma visão geral ao abrir o sistema.

### Épico: Histórico e Relatórios
- **US11** — Como técnico ou supervisor, quero ver o histórico completo de manutenções de um ativo em uma única tela, para entender seu passado. (RF06)
- **US12** — Como gestor, quero um relatório de custo e frequência de manutenção por ativo, para decidir sobre substituição.
- **US12a** — Como gestor, quero visualizar o relatório de custo com gráfico (não só tabela), seguindo boas práticas de visualização de dados (paleta acessível, rótulos claros), para identificar tendências rapidamente.

---

## Divisão em Sprints

### Sprint 0 — Fundação Visual *(concluído)*
**Objetivo:** estabelecer o design system antes de construir qualquer tela funcional.
- US00 — Tokens de cor/tipografia centralizados

**DoD do sprint:**
- [x] `tokens.css` com paleta (accent + status fixo), tipografia e espaçamento em variáveis
- [x] Suporte a tema claro/escuro desde o início
- [x] Componentes base (`Button`, `StatusBadge`) consumindo só tokens, sem hex hardcoded

### Sprint 1 — Fundação + Autenticação
**Objetivo:** ter login funcionando, com layout shell responsivo, e esqueleto do projeto rodando via Docker.
- US00a — Layout shell (navegação + conteúdo) responsivo
- US00c — Componentes de formulário padronizados (input, select) com validação inline
- US01 — Login com e-mail/senha
- US01a — Tela de login com identidade visual e feedback de erro
- US02 — Controle de acesso por papel
- US02a — Nome/papel do usuário no cabeçalho + logout

**DoD do sprint:**
- [ ] `docker-compose up` sobe API + banco sem erro *(a revalidar — ambiente atual sem Docker disponível)*
- [x] Login retorna JWT válido; rota protegida rejeita token ausente/inválido
- [x] Papel do usuário embutido no token e validado em pelo menos uma rota
- [x] Layout shell funciona em viewport de desktop e tablet (≥768px)
- [x] Tela de login segue os tokens de design (sem cor/fonte hardcoded)

### Sprint 2 — Cadastro de Ativos e Planos
**Objetivo:** permitir cadastro completo de ativo + plano de manutenção, com UI polida.
- US00b — Estados de carregamento/vazio/erro (padrão reutilizável)
- US03 — Cadastrar ativo
- US03a — Formulário de ativo com validação inline e feedback de sucesso
- US04 — Editar/listar ativos
- US04a — Tabela de ativos com busca/filtro
- US05 — Cadastrar plano de manutenção
- US06 — Desativar plano sem apagar histórico

**DoD do sprint:**
- [ ] CRUD de Ativo completo com validação de campos obrigatórios
- [ ] Plano de manutenção vinculado corretamente ao Ativo (FK)
- [ ] Componentes de loading/vazio/erro reaproveitados em pelo menos 2 telas
- [ ] Critério de aceite do MVP: cadastro de ativo + plano em menos de 2 minutos (validado manualmente)

### Sprint 3 — Execução e Status
**Objetivo:** registrar manutenções e calcular status derivado (RF04, ADR-002), com destaque visual de urgência.
- US07 — Registrar execução de manutenção
- US08 — Lista de pendências do técnico
- US08a — Lista de pendências em cartões (mobile/tablet-friendly)
- US09 — Status Em dia/Próximo/Vencido
- US09a — Status com cor + ícone + texto (acessível a daltonismo)

**DoD do sprint:**
- [ ] Cálculo de `proximoVencimento` implementado conforme regra do `docs/02-architecture.md`
- [ ] Teste automatizado cobrindo os 3 estados de status com datas fixas (mock de data atual)
- [ ] Critério de aceite do MVP: status correto baseado na data atual
- [ ] Nenhum status é comunicado só por cor (checagem manual com simulador de daltonismo)

### Sprint 4 — Alertas, Histórico e Relatório
**Objetivo:** fechar os critérios de aceite restantes do MVP com um dashboard de abertura e visualização de dados adequada.
- US10 — Painel de alertas (Próximo do vencimento)
- US10a — Dashboard inicial com contagem por status
- US11 — Histórico completo por ativo em uma tela
- US12 — Relatório de custo e frequência por ativo
- US12a — Gráfico de custo (paleta acessível, rótulos diretos)

**DoD do sprint:**
- [ ] Painel destaca ativos "Próximo do vencimento" com base no job/consulta de status
- [ ] Dashboard inicial mostra contagem de ativos por status ao fazer login
- [ ] Tela de histórico lista todos os `RegistroManutencao` de um ativo, ordenados por data
- [ ] Relatório agrega custo total e contagem de manutenções por ativo, com gráfico e tabela
- [ ] Todos os 4 critérios de aceite do MVP (docs/01-discovery.md) revalidados e passando

---

## Padrão de Qualidade Visual (vale para todo sprint a partir daqui)
- Nenhuma cor, fonte ou espaçamento hardcoded em componente novo — sempre via `var(--token)` de `frontend/src/styles/tokens.css`
- Toda tela que busca dados tem estado de loading, vazio e erro tratados (não só o "caminho feliz")
- Toda tela testada visualmente em pelo menos 2 larguras de viewport (desktop ~1280px, tablet ~768px)
- Gráficos (US12a) seguem o método da skill `dataviz`: forma pela função dos dados, paleta validada, rótulos diretos

## GitHub Issues
Cada user story deve virar uma Issue no repositório, com label do épico correspondente (`ui-foundation`, `auth`, `ativos`, `manutencao`, `status-alertas`, `historico-relatorio`) e milestone do sprint (`Sprint 0`–`Sprint 4`).

## Próximo passo
Sprint 1 concluído (auth API + UI). Revalidar `docker-compose up` fim a fim quando Docker estiver disponível; em seguida, iniciar Sprint 2 (cadastro de ativos e planos de manutenção).

## Nota de ambiente — Docker
O ambiente de desenvolvimento atual (sandbox de agente) não tem Docker/Docker Compose instalado, então `docker-compose up` não pôde ser exercitado diretamente aqui. Como alternativa equivalente, a validação de ponta a ponta do Sprint 1 foi feita com:
- PostgreSQL portátil (binários EDB, sem instalação como serviço) com as migrations reais do Prisma aplicadas;
- backend e frontend rodando via `npm run dev` (fora de containers), backend em `:3000`, frontend em `:5173`;
- login real (`POST /auth/login`) com usuário seedado no banco, incluindo os casos de credenciais válidas, inválidas e rota protegida `/me` com/sem token — todos via `curl`;
- fluxo de UI real (preenchimento do form de login → submit → redirecionamento para o dashboard autenticado, header com nome/papel e botão Sair) verificado com Chrome headless controlando o browser de fato, screenshots incluídas.

Essa validação revelou e corrigiu um bug real: o backend não tinha CORS habilitado, então qualquer chamada do frontend (porta diferente do backend) era bloqueada pelo browser mesmo com tudo funcionando via `curl`. Corrigido em `backend/src/app.ts` com o pacote `cors`, liberando a origin configurável via `FRONTEND_URL` (default `http://localhost:5173`, também setado no `docker-compose.yml`).

Ainda assim, recomenda-se rodar `docker-compose up` real em uma máquina com Docker Desktop pelo menos uma vez, para confirmar que os `Dockerfile`s constroem sem erro — isso não foi exercitado nesta validação.
