import { IntervaloTipo } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { notificarVencimento } from './notificationService';
import { calcularProximoVencimento, calcularStatus } from './statusService';

export interface PlanoInput {
  ativoId: string;
  intervaloTipo: IntervaloTipo;
  intervaloValor: number;
}

const INCLUDE_PARA_STATUS = {
  ativo: { select: { id: true, nome: true, dataAquisicao: true } },
  registros: {
    orderBy: { dataExecucao: 'desc' as const },
    take: 1,
    select: { dataExecucao: true },
  },
};

function comStatus<
  T extends {
    estaAtivo: boolean;
    intervaloValor: number;
    ativo: { dataAquisicao: Date };
    registros: { dataExecucao: Date }[];
  },
>(plano: T) {
  const { registros, ...resto } = plano;
  if (!plano.estaAtivo) {
    return { ...resto, proximoVencimento: null, status: null };
  }
  const proximoVencimento = calcularProximoVencimento({
    intervaloValor: plano.intervaloValor,
    dataAquisicaoAtivo: plano.ativo.dataAquisicao,
    ultimaExecucao: registros[0]?.dataExecucao ?? null,
  });
  return {
    ...resto,
    proximoVencimento,
    status: calcularStatus(proximoVencimento),
  };
}

export async function listPlanosPorAtivo(ativoId: string) {
  const planos = await prisma.planoManutencao.findMany({
    where: { ativoId },
    orderBy: { id: 'asc' },
    include: INCLUDE_PARA_STATUS,
  });

  return planos.map(comStatus);
}

export async function listPlanosPendentes() {
  const planos = await prisma.planoManutencao.findMany({
    where: { estaAtivo: true },
    include: INCLUDE_PARA_STATUS,
  });

  const pendentes = planos
    .map(comStatus)
    .filter((p) => p.status === 'PROXIMO' || p.status === 'VENCIDO')
    .sort((a, b) => a.proximoVencimento!.getTime() - b.proximoVencimento!.getTime());

  for (const plano of pendentes) {
    notificarVencimento({
      planoId: plano.id,
      ativoId: plano.ativo.id,
      ativoNome: plano.ativo.nome,
      status: plano.status!,
      proximoVencimento: plano.proximoVencimento!,
    });
  }

  return pendentes;
}

export function getPlano(id: string) {
  return prisma.planoManutencao.findUnique({ where: { id } });
}

export function createPlano(data: PlanoInput) {
  return prisma.planoManutencao.create({
    data: {
      ativoId: data.ativoId,
      intervaloTipo: data.intervaloTipo,
      intervaloValor: data.intervaloValor,
    },
  });
}

export function desativarPlano(id: string) {
  return prisma.planoManutencao.update({
    where: { id },
    data: { estaAtivo: false },
  });
}

const TIPOS_VALIDOS: IntervaloTipo[] = ['DIAS', 'HORAS_USO'];

export function validatePlanoInput(data: Partial<PlanoInput>): string | null {
  if (!data.ativoId?.trim()) return 'Ativo é obrigatório';
  if (!data.intervaloTipo || !TIPOS_VALIDOS.includes(data.intervaloTipo)) {
    return 'Tipo de intervalo deve ser DIAS ou HORAS_USO';
  }
  if (!data.intervaloValor || data.intervaloValor <= 0) {
    return 'Valor do intervalo deve ser maior que zero';
  }
  return null;
}
