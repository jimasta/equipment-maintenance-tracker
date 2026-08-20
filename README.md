<div align="center">

# Equipment Maintenance Tracker

Centraliza cadastro de ativos industriais, planos de manutenção preventiva e histórico de execução — substituindo a planilha por um fluxo com alertas e histórico auditável.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)

[Documentação](docs/) · [Reportar Bug](../../issues)

</div>

---

## 📋 Índice
- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Stack Tecnológica](#-stack-tecnológica)
- [Design System](#-design-system)
- [Como Rodar Localmente](#-como-rodar-localmente)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Decisões Técnicas](#-decisões-técnicas)
- [Testes](#-testes)
- [Roadmap](#-roadmap)
- [Licença](#-licença)

## 🎯 Sobre o Projeto
Empresas industriais (oil & gas, agribusiness) operam ativos críticos — bombas, geradores, veículos, maquinário pesado — cuja falha não planejada gera parada de produção e custo alto de reparo emergencial. Hoje esse controle costuma ser feito em planilhas soltas, sem alerta automático e sem histórico centralizado.

**Problema:** manutenções perdidas e falhas evitáveis por falta de um fluxo centralizado e auditável.
**Solução:** sistema web que cadastra ativos, agenda manutenções preventivas por periodicidade (tempo ou uso) e alerta responsáveis antes do vencimento.

Contexto completo de negócio, personas e requisitos em [`docs/01-discovery.md`](docs/01-discovery.md).

## ✨ Funcionalidades
Status atual: Sprint 3 concluído ([`docs/03-backlog.md`](docs/03-backlog.md)) — execução de manutenção e status automático completos.

- [x] Design system (tokens de cor/tipografia, componentes base)
- [x] Login (API) e controle de acesso por papel (Técnico / Supervisor / Gestor) — `POST /auth/login`, JWT, middleware `requireAuth`/`requireRole`
- [x] Tela de login e layout shell responsivo (frontend) — sidebar colapsável com navegação, validação inline, avatar/nome/papel do usuário e logout, rota protegida com redirecionamento
- [x] Painel inicial com resumo de inventário — total de ativos, tipos, últimos cadastrados e distribuição por tipo
- [x] Cadastro e listagem de ativos — busca por nome/localização, filtro por tipo, formulário em painel lateral com validação inline, edição restrita a Supervisor/Gestor
- [x] Cadastro de plano de manutenção preventiva (por dias ou horas de uso) — vinculado ao ativo, com desativação sem apagar histórico
- [x] Registro de execução de manutenção (data, técnico, custo, observações) — qualquer usuário autenticado registra, técnico vem do token
- [x] Status automático por ativo: Em dia / Próximo do vencimento / Vencido — calculado em tempo de leitura, nunca armazenado (ADR-002)
- [x] Tela de Pendências — planos vencidos/próximos do vencimento em todos os ativos, em cartões, ordenados por urgência
- [ ] Painel de alertas e dashboard inicial
- [ ] Histórico completo de manutenções por ativo
- [ ] Relatório de custo e frequência de manutenção (com gráfico)

## 🏗️ Arquitetura
Modelo de dados (Ativo, PlanoManutenção, RegistroManutenção, Usuário), diagrama de camadas e Architecture Decision Records completos em [`docs/02-architecture.md`](docs/02-architecture.md).

Resumo do fluxo: SPA React consome uma API REST (Express), que aplica regras de negócio (cálculo de status derivado por data) antes de ler/gravar no PostgreSQL via Prisma.

Autenticação: `POST /auth/login` valida e-mail/senha (bcrypt) e emite um JWT (8h de validade) contendo `id`, `nome` e `papel` do usuário. Rotas protegidas usam o middleware `requireAuth` (exige token válido) e `requireRole(...papeis)` (restringe por papel) em `backend/src/middleware/auth.ts`.

No frontend, `AuthProvider` (`frontend/src/auth/AuthContext.tsx`) guarda o token em `localStorage`, valida a sessão via `GET /me` ao carregar a aplicação e expõe `login`/`logout`. `RequireAuth` protege rotas privadas redirecionando para `/login` (preservando a rota de origem para retorno pós-login).

Ativos e planos: `GET/POST/PUT /ativos` e `GET/POST /planos` + `PATCH /planos/:id/desativar`, todos atrás de `requireAuth`; criação/edição restrita a `SUPERVISOR`/`GESTOR` via `requireRole` (leitura liberada a qualquer papel autenticado, incluindo Técnico). No frontend, `AtivosPage` (busca, filtro por tipo, tabela) e `AtivoDetailPage` (planos de manutenção do ativo) consomem essas rotas via `frontend/src/lib/api.ts`; formulários abrem em um painel lateral (`Drawer`) para manter o contexto da listagem.

Status derivado: `backend/src/services/statusService.ts` calcula `proximoVencimento` (última execução, ou data de aquisição do ativo se nunca houve execução, + `intervaloValor` dias) e classifica em `EM_DIA` / `PROXIMO` (≤7 dias) / `VENCIDO`, sem persistir nada — é recalculado em toda leitura de `GET /planos` e `GET /planos/pendentes`. `intervaloTipo = HORAS_USO` não rastreia horas de uso reais no MVP (não há esse dado no schema); `intervaloValor` é sempre tratado como dias corridos, por decisão de produto. `POST /registros` registra uma execução (técnico vem do token, não do corpo) e `GET /planos/pendentes` lista, entre todos os ativos, os planos com status Próximo ou Vencido — usado pela tela de Pendências (`/pendencias`), com `StatusBadge` (dot + texto, nunca só cor) nos cards.

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React + TypeScript + Vite |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Banco de Dados | PostgreSQL |
| Autenticação | JWT (stateless) |
| Infraestrutura | Docker + docker-compose |
| CI/CD | GitHub Actions (lint + test) |

## 🎨 Design System
Cores, tipografia, espaçamento e raio de borda são centralizados em variáveis CSS (`frontend/src/styles/tokens.css`). A aplicação usa somente tema claro (o suporte a tema escuro automático foi removido por decisão do usuário, para simplificar a manutenção da paleta):

- **Accent de marca:** azul-petróleo, usado em botões e links primários, escolhido deliberadamente distante da faixa laranja/âmbar/vermelho usada pelos status, para que uma ação primária nunca seja confundida com um alerta de manutenção vencida.
- **Status fixo:** verde (Em dia), âmbar (Próximo do vencimento), vermelho (Vencido) — sempre comunicado com cor + ícone + texto, nunca só cor.
- **Sidebar com superfície terracota/laranja-queimado:** distinta do fundo claro do conteúdo, via tokens dedicados (`--sidebar-bg`, `--sidebar-text`, `--sidebar-accent`, etc. em `tokens.css`). É uma cor de superfície passiva (não uma cor de ação/alerta), então convive com o accent teal e o status âmbar sem ambiguidade — teal e terracota são aproximadamente complementares, o que reforça o contraste.
- **Tipografia:** Inter (interface) + JetBrains Mono (dados tabulares/códigos de ativo).

Componentes de UI (`frontend/src/components/`) consomem exclusivamente essas variáveis — trocar a paleta ou a fonte da aplicação inteira é uma edição em um único arquivo.

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js >= 18
- Docker e Docker Compose

### Passos
```bash
# Clone o repositório
git clone https://github.com/jimasta/equipment-maintenance-tracker.git
cd equipment-maintenance-tracker

# Configure variáveis de ambiente do backend
cp backend/.env.example backend/.env

# Suba a aplicação completa (API + frontend + PostgreSQL)
docker-compose up

# Em outro terminal: aplique as migrations do banco
docker-compose exec backend npx prisma migrate dev
```

- Backend: http://localhost:3000
- Frontend: http://localhost:5173

> **Nota:** a imagem do backend instala `openssl` (exigido pelo engine do Prisma em Alpine). Se ao rodar `bcrypt` dentro do container aparecer erro de binário incompatível, o `.dockerignore` do projeto evita que o `node_modules` do host vaze para a imagem — não delete/ignore esse arquivo.

## 📁 Estrutura de Pastas
```
equipment-maintenance-tracker/
├── backend/
│   ├── prisma/           # schema.prisma (modelo de dados) + migrations/
│   └── src/
│       ├── routes/       # auth.ts (login), me.ts, ativos.ts, planos.ts, registros.ts
│       ├── middleware/   # requireAuth, requireRole
│       ├── services/     # authService, ativoService, planoService, registroService, statusService
│       └── lib/          # prisma.ts (client singleton)
├── frontend/
│   └── src/
│       ├── auth/         # AuthContext (sessão/token), RequireAuth (guarda de rota)
│       ├── layout/       # AppShell (sidebar colapsável + topbar com breadcrumb)
│       ├── pages/
│       │   ├── ativos/   # AtivosPage, AtivoDetailPage, AtivoForm, PlanoForm, RegistroForm
│       │   ├── pendencias/ # PendenciasPage
│       │   ├── LoginPage.tsx
│       │   └── DashboardPage.tsx
│       ├── lib/          # api.ts (cliente HTTP)
│       ├── components/   # Button, StatusBadge, Input, Select, Drawer, AsyncState, Toast, ...
│       └── styles/       # tokens.css, globals.css
├── docs/
│   ├── 01-discovery.md
│   ├── 02-architecture.md
│   └── 03-backlog.md
├── docker-compose.yml
└── README.md
```

## 🧠 Decisões Técnicas
Principais decisões de arquitetura documentadas em [`docs/02-architecture.md`](docs/02-architecture.md) como ADRs, incluindo:
- PostgreSQL em vez de SQL Server/MongoDB
- Status de ativo calculado em tempo de leitura, nunca armazenado
- Alertas apenas em painel no MVP (e-mail real fica para iteração futura)
- Autenticação JWT stateless (8h de validade, papel do usuário embutido no token)

Detalhe de implementação relevante: o `Dockerfile` do backend precisou de `openssl` explícito (Prisma não detecta a lib corretamente em Alpine sem isso) e ambos os projetos precisam de `.dockerignore` para impedir que o `node_modules` do host contamine a imagem Linux com binários nativos incompatíveis (ex: `bcrypt`).

CORS habilitado no backend (`backend/src/app.ts`) restrito à origin do frontend, configurável via `FRONTEND_URL` — sem isso, toda chamada do frontend real (porta diferente do backend em dev, domínio diferente em produção) seria bloqueada pelo browser mesmo com a API respondendo normalmente a `curl`.

## ✅ Testes
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```
Cobertura atual (backend): smoke test de `/health`; `authService` (hash/verificação de senha, emissão/validação de JWT); `statusService` (os 3 estados de status com datas fixas, cálculo de `proximoVencimento` a partir da última execução ou da aquisição); rotas de autenticação (`/auth/login` com credenciais válidas/inválidas, `/me` com e sem token); rotas de ativos (listagem, criação com validação, controle por papel, 404 em edição inexistente); rotas de planos (validação de intervalo, vínculo com ativo existente, controle por papel, desativação, status calculado em `GET /planos` e `GET /planos/pendentes`); rotas de registros (validação, 404 para plano inexistente, técnico extraído do token) — 35 testes automatizados, todos com Prisma mockado. Frontend: redirecionamento de rota protegida, validação inline de login e do formulário de ativo, listagem/busca/estado vazio de `AtivosPage` — 6 testes automatizados. Cobertura por feature será expandida a cada sprint, conforme a Definition of Done em [`docs/03-backlog.md`](docs/03-backlog.md).

Validação end-to-end (login real, JWT real, CRUD de ativo/plano/registro de execução, recálculo de status, navegação autenticada) foi feita com PostgreSQL real e o fluxo de UI dirigido por browser de verdade, com screenshots do resultado — ver detalhes em [`docs/03-backlog.md`](docs/03-backlog.md#nota-de-ambiente--docker). No Sprint 1 essa validação revelou e corrigiu a ausência de CORS no backend, que bloquearia toda chamada do frontend em produção/dev com portas ou domínios diferentes. No Sprint 3, confirmou que registrar uma execução real recalcula o status do plano corretamente (Vencido → Em dia) e remove o item da lista de pendências.

## 🗺️ Roadmap
- [x] Sprint 1 — Autenticação completa (API + layout shell responsivo + tela de login)
- [x] Sprint 2 — Cadastro de ativos e planos de manutenção
- [x] Sprint 3 — Registro de execução e cálculo de status
- [ ] Sprint 4 — Painel de alertas, histórico e relatório de custo
- [ ] Deploy e release `v1.0.0`

## 📄 Licença
Distribuído sob licença MIT. Veja [`LICENSE`](LICENSE) para mais detalhes.

---
<div align="center">
Desenvolvido por <b>Jorge</b> — parte de um portfólio de 18 projetos cobrindo Fullstack e Power Platform
</div>
