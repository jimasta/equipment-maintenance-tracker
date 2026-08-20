import { prisma } from '../lib/prisma';

export interface RegistroInput {
  planoManutencaoId: string;
  dataExecucao: string;
  observacoes?: string;
  custo: number;
}

export function listRegistrosPorPlano(planoManutencaoId: string) {
  return prisma.registroManutencao.findMany({
    where: { planoManutencaoId },
    orderBy: { dataExecucao: 'desc' },
    include: { tecnico: { select: { id: true, nome: true } } },
  });
}

export function listRegistrosPorAtivo(ativoId: string) {
  return prisma.registroManutencao.findMany({
    where: { planoManutencao: { ativoId } },
    orderBy: { dataExecucao: 'desc' },
    include: {
      tecnico: { select: { id: true, nome: true } },
      planoManutencao: { select: { id: true, intervaloTipo: true, intervaloValor: true } },
    },
  });
}

export function createRegistro(tecnicoId: string, data: RegistroInput) {
  return prisma.registroManutencao.create({
    data: {
      planoManutencaoId: data.planoManutencaoId,
      tecnicoId,
      dataExecucao: new Date(data.dataExecucao),
      observacoes: data.observacoes,
      custo: data.custo,
    },
  });
}

export function validateRegistroInput(data: Partial<RegistroInput>): string | null {
  if (!data.planoManutencaoId?.trim()) return 'Plano de manutenção é obrigatório';
  if (!data.dataExecucao || Number.isNaN(Date.parse(data.dataExecucao))) {
    return 'Data de execução inválida';
  }
  if (data.custo === undefined || data.custo === null || Number(data.custo) < 0) {
    return 'Custo deve ser maior ou igual a zero';
  }
  return null;
}
