import { prisma } from '../lib/prisma';

export interface AtivoInput {
  nome: string;
  tipo: string;
  localizacao: string;
  dataAquisicao: string;
}

export async function listAtivos(filtros: { tipo?: string; localizacao?: string }) {
  const ativos = await prisma.ativo.findMany({
    where: {
      ...(filtros.tipo ? { tipo: { contains: filtros.tipo, mode: 'insensitive' } } : {}),
      ...(filtros.localizacao
        ? { localizacao: { contains: filtros.localizacao, mode: 'insensitive' } }
        : {}),
    },
    orderBy: { criadoEm: 'desc' },
    include: {
      _count: { select: { planos: { where: { estaAtivo: true } } } },
    },
  });

  return ativos.map(({ _count, ...ativo }) => ({ ...ativo, planosAtivos: _count.planos }));
}

export function getAtivo(id: string) {
  return prisma.ativo.findUnique({ where: { id } });
}

export function createAtivo(data: AtivoInput) {
  return prisma.ativo.create({
    data: {
      nome: data.nome,
      tipo: data.tipo,
      localizacao: data.localizacao,
      dataAquisicao: new Date(data.dataAquisicao),
    },
  });
}

export function updateAtivo(id: string, data: AtivoInput) {
  return prisma.ativo.update({
    where: { id },
    data: {
      nome: data.nome,
      tipo: data.tipo,
      localizacao: data.localizacao,
      dataAquisicao: new Date(data.dataAquisicao),
    },
  });
}

export function validateAtivoInput(data: Partial<AtivoInput>): string | null {
  if (!data.nome?.trim()) return 'Nome é obrigatório';
  if (!data.tipo?.trim()) return 'Tipo é obrigatório';
  if (!data.localizacao?.trim()) return 'Localização é obrigatória';
  if (!data.dataAquisicao || Number.isNaN(Date.parse(data.dataAquisicao))) {
    return 'Data de aquisição inválida';
  }
  return null;
}
