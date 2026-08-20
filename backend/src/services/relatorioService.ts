import { prisma } from '../lib/prisma';

export interface RelatorioCustoAtivo {
  ativoId: string;
  ativoNome: string;
  ativoTipo: string;
  quantidadeManutencoes: number;
  custoTotal: number;
}

export async function relatorioCustoPorAtivo(): Promise<RelatorioCustoAtivo[]> {
  const ativos = await prisma.ativo.findMany({
    select: {
      id: true,
      nome: true,
      tipo: true,
      planos: {
        select: {
          registros: { select: { custo: true } },
        },
      },
    },
  });

  return ativos
    .map((ativo) => {
      const registros = ativo.planos.flatMap((p) => p.registros);
      const custoTotal = registros.reduce((soma, r) => soma + Number(r.custo), 0);
      return {
        ativoId: ativo.id,
        ativoNome: ativo.nome,
        ativoTipo: ativo.tipo,
        quantidadeManutencoes: registros.length,
        custoTotal,
      };
    })
    .sort((a, b) => b.custoTotal - a.custoTotal);
}
