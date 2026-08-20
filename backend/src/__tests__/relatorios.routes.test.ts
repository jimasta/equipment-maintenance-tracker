import { beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const ativoFindMany = vi.fn();

vi.mock('../lib/prisma', () => ({
  prisma: { ativo: { findMany: (...args: unknown[]) => ativoFindMany(...args) } },
}));

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
});

async function tokenFor(papel: 'TECNICO' | 'SUPERVISOR' | 'GESTOR') {
  const { signToken } = await import('../services/authService');
  return signToken({ sub: 'user-1', nome: 'Usuário Teste', papel });
}

describe('GET /relatorios/custos', () => {
  it('rejects a técnico', async () => {
    const { createApp } = await import('../app');
    const app = createApp();
    const token = await tokenFor('TECNICO');

    const response = await request(app)
      .get('/relatorios/custos')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it('rejects a supervisor (report is gestor-only)', async () => {
    const { createApp } = await import('../app');
    const app = createApp();
    const token = await tokenFor('SUPERVISOR');

    const response = await request(app)
      .get('/relatorios/custos')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it('returns the aggregated report for a gestor', async () => {
    ativoFindMany.mockResolvedValueOnce([
      { id: 'a1', nome: 'Bomba', tipo: 'Bomba', planos: [{ registros: [{ custo: '100.00' }] }] },
    ]);
    const { createApp } = await import('../app');
    const app = createApp();
    const token = await tokenFor('GESTOR');

    const response = await request(app)
      .get('/relatorios/custos')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        ativoId: 'a1',
        ativoNome: 'Bomba',
        ativoTipo: 'Bomba',
        quantidadeManutencoes: 1,
        custoTotal: 100,
      },
    ]);
  });
});
