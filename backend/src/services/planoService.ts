import { IntervaloTipo } from '@prisma/client';
import { prisma } from '../lib/prisma';

export interface PlanoInput {
  ativoId: string;
  intervaloTipo: IntervaloTipo;
  intervaloValor: number;
}

export function listPlanosPorAtivo(ativoId: string) {
  return prisma.planoManutencao.findMany({
    where: { ativoId },
    orderBy: { id: 'asc' },
  });
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
