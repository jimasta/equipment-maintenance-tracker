# 01 — Discovery: Equipment Maintenance Tracker

## Problema de Negócio
Empresas industriais (oil & gas, agribusiness) operam ativos críticos — bombas, geradores, veículos, maquinário pesado — cuja falha não planejada gera parada de produção e custo alto de reparo emergencial. Hoje esse controle costuma ser feito em planilhas soltas, sem alerta automático e sem histórico centralizado, o que causa manutenções perdidas e falhas evitáveis.

## Solução Proposta
Sistema web que centraliza o cadastro de ativos, agenda manutenções preventivas por periodicidade (tempo ou uso), e alerta responsáveis antes do vencimento — substituindo a planilha por um fluxo com histórico auditável.

## Personas

| Persona | Necessidade |
|---|---|
| **Técnico de Manutenção** | Ver o que precisa fazer hoje/na semana, registrar manutenção realizada |
| **Supervisor de Operações** | Visão geral de todos os ativos, o que está vencido/próximo do vencimento |
| **Gestor** | Relatório de custo e frequência de manutenção por ativo, para decisão de substituição |

## Requisitos Funcionais (MVP)
- RF01 — Cadastrar ativo (nome, tipo, localização, data de aquisição, periodicidade de manutenção)
- RF02 — Cadastrar plano de manutenção preventiva por ativo (intervalo em dias ou horas de uso)
- RF03 — Registrar execução de manutenção (data, técnico responsável, observações, custo)
- RF04 — Listar ativos com status: Em dia / Próximo do vencimento / Vencido
- RF05 — Alertar (painel + e-mail) quando manutenção está a X dias do vencimento
- RF06 — Histórico completo de manutenções por ativo
- RF07 — Login/autenticação básica (só usuários autorizados acessam)

## Requisitos Não Funcionais
- RNF01 — Tempo de resposta da listagem de ativos < 1s com até 1.000 registros
- RNF02 — Dados sensíveis (custo, credenciais) nunca em texto plano
- RNF03 — Sistema deve rodar via Docker (portabilidade de ambiente)
- RNF04 — Interface responsiva (uso também em tablet, comum em campo)

## Fora de Escopo (explicitamente, para o MVP)
- Aplicativo mobile nativo (fica pro projeto #17 — Coleta de Dados em Campo)
- Integração com sensores IoT / manutenção preditiva
- Múltiplas empresas/multi-tenant (fica pro projeto #9 — Gestão Multi-cliente)
- Aprovação em múltiplos níveis para custo de manutenção

## Critérios de Aceite do MVP
- [ ] Um técnico consegue cadastrar um ativo e seu plano de manutenção em menos de 2 minutos
- [ ] O sistema mostra corretamente o status (Em dia/Próximo/Vencido) baseado na data atual
- [ ] Um e-mail de alerta é disparado automaticamente quando um ativo entra em "Próximo do vencimento"
- [ ] Todo histórico de manutenção de um ativo é visível numa única tela

## Próximo passo
Etapa 2 — Arquitetura e modelagem de dados (diagrama ER com as entidades: Ativo, PlanoManutenção, RegistroManutenção, Usuário).
