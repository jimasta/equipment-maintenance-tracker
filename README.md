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
Status atual: Sprint 1 em andamento ([`docs/03-backlog.md`](docs/03-backlog.md)) — backend de autenticação implementado e validado; layout shell e telas de login/UI ainda pendentes.

- [x] Design system (tokens de cor/tipografia, tema claro/escuro, componentes base)
- [x] Login (API) e controle de acesso por papel (Técnico / Supervisor / Gestor) — `POST /auth/login`, JWT, middleware `requireAuth`/`requireRole`
- [ ] Tela de login e layout shell responsivo (frontend)
- [ ] Cadastro e listagem de ativos
- [ ] Cadastro de plano de manutenção preventiva (por dias ou horas de uso)
- [ ] Registro de execução de manutenção (data, técnico, custo, observações)
- [ ] Status automático por ativo: Em dia / Próximo do vencimento / Vencido
- [ ] Painel de alertas e dashboard inicial
- [ ] Histórico completo de manutenções por ativo
- [ ] Relatório de custo e frequência de manutenção (com gráfico)

## 🏗️ Arquitetura
Modelo de dados (Ativo, PlanoManutenção, RegistroManutenção, Usuário), diagrama de camadas e Architecture Decision Records completos em [`docs/02-architecture.md`](docs/02-architecture.md).

Resumo do fluxo: SPA React consome uma API REST (Express), que aplica regras de negócio (cálculo de status derivado por data) antes de ler/gravar no PostgreSQL via Prisma.

Autenticação: `POST /auth/login` valida e-mail/senha (bcrypt) e emite um JWT (8h de validade) contendo `id`, `nome` e `papel` do usuário. Rotas protegidas usam o middleware `requireAuth` (exige token válido) e `requireRole(...papeis)` (restringe por papel) em `backend/src/middleware/auth.ts`.

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
Cores, tipografia, espaçamento e raio de borda são centralizados em variáveis CSS (`frontend/src/styles/tokens.css`), com suporte completo a tema claro e escuro desde a fundação do projeto:

- **Accent de marca:** azul-petróleo, escolhido deliberadamente distante da faixa laranja/âmbar/vermelho usada pelos status, para que uma ação primária (botão, link) nunca seja confundida com um alerta de manutenção vencida.
- **Status fixo (não temático):** verde (Em dia), âmbar (Próximo do vencimento), vermelho (Vencido) — sempre comunicado com cor + ícone + texto, nunca só cor.
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
│       ├── routes/       # auth.ts (login), me.ts (exemplo de rota protegida)
│       ├── middleware/   # requireAuth, requireRole
│       ├── services/     # authService.ts (hash de senha, JWT)
│       └── lib/          # prisma.ts (client singleton)
├── frontend/
│   └── src/
│       ├── components/   # componentes de UI (Button, StatusBadge, ...)
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

## ✅ Testes
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```
Cobertura atual (backend): smoke test de `/health`, `authService` (hash/verificação de senha, emissão/validação de JWT) e rotas de autenticação (`/auth/login` com credenciais válidas/inválidas, `/me` com e sem token) — 9 testes automatizados, todos com Prisma mockado. Frontend: smoke test de render do `App`. Cobertura por feature será expandida a cada sprint, conforme a Definition of Done em [`docs/03-backlog.md`](docs/03-backlog.md).

Validação end-to-end do login também foi feita manualmente via `docker-compose` com PostgreSQL real (não só com mocks), incluindo aplicação de migration e criação de usuário de teste.

## 🗺️ Roadmap
- [x] Sprint 1 (parcial) — API de autenticação (login, JWT, controle por papel)
- [ ] Sprint 1 (restante) — Layout shell responsivo + tela de login
- [ ] Sprint 2 — Cadastro de ativos e planos de manutenção
- [ ] Sprint 3 — Registro de execução e cálculo de status
- [ ] Sprint 4 — Painel de alertas, histórico e relatório de custo
- [ ] Deploy e release `v1.0.0`

## 📄 Licença
Distribuído sob licença MIT. Veja [`LICENSE`](LICENSE) para mais detalhes.

---
<div align="center">
Desenvolvido por <b>Jorge</b> — parte de um portfólio de 18 projetos cobrindo Fullstack e Power Platform
</div>
