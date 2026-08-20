import { describe, expect, it, vi } from 'vitest';

const ativoFindMany = vi.fn();

vi.mock('../lib/prisma', () => ({
  prisma: { ativo: { findMany: (...args: unknown[]) => ativoFindMany(...args) } },
}));

describe('relatorioCustoPorAtivo', () => {
  it('aggregates cost and count per ativo, sorted by highest cost first', async () => {
    ativoFindMany.mockResolvedValueOnce([
      {
        id: 'a1',
        nome: 'Bomba',
        tipo: 'Bomba',
        planos: [
          { registros: [{ custo: '100.00' }, { custo: '50.00' }] },
          { registros: [{ custo: '25.00' }] },
        ],
      },
      {
        id: 'a2',
        nome: 'Gerador',
        tipo: 'Gerador',
        planos: [{ registros: [{ custo: '500.00' }] }],
      },
      {
        id: 'a3',
        nome: 'Caminhão',
        tipo: 'Veículo',
        planos: [],
      },
    ]);

    const { relatorioCustoPorAtivo } = await import('../services/relatorioService');
    const relatorio = await relatorioCustoPorAtivo();

    expect(relatorio).toEqual([
      {
        ativoId: 'a2',
        ativoNome: 'Gerador',
        ativoTipo: 'Gerador',
        quantidadeManutencoes: 1,
        custoTotal: 500,
      },
      {
        ativoId: 'a1',
        ativoNome: 'Bomba',
        ativoTipo: 'Bomba',
        quantidadeManutencoes: 3,
        custoTotal: 175,
      },
      {
        ativoId: 'a3',
        ativoNome: 'Caminhão',
        ativoTipo: 'Veículo',
        quantidadeManutencoes: 0,
        custoTotal: 0,
      },
    ]);
  });
});
