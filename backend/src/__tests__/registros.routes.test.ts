import { beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const planoFindUnique = vi.fn();
const registroFindMany = vi.fn();
const registroCreate = vi.fn();

vi.mock('../lib/prisma', () => ({
  prisma: {
    planoManutencao: {
      findUnique: (...args: unknown[]) => planoFindUnique(...args),
    },
    registroManutencao: {
      findMany: (...args: unknown[]) => registroFindMany(...args),
      create: (...args: unknown[]) => registroCreate(...args),
    },
  },
}));

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
});

async function tokenFor(papel: 'TECNICO' | 'SUPERVISOR' | 'GESTOR') {
  const { signToken } = await import('../services/authService');
  return signToken({ sub: 'user-1', nome: 'Usuário Teste', papel });
}

describe('GET /registros', () => {
  it('returns 400 when planoManutencaoId is missing', async () => {
    const { createApp } = await import('../app');
    const app = createApp();
    const token = await tokenFor('TECNICO');

    const response = await request(app).get('/registros').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
  });

  it('lists registros for a plano', async () => {
    registroFindMany.mockResolvedValueOnce([{ id: 'r1', custo: '150.00' }]);
    const { createApp } = await import('../app');
    const app = createApp();
    const token = await tokenFor('TECNICO');

    const response = await request(app)
      .get('/registros?planoManutencaoId=p1')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 'r1', custo: '150.00' }]);
  });
});

describe('POST /registros', () => {
  it('returns 400 when required fields are missing', async () => {
    const { createApp } = await import('../app');
    const app = createApp();
    const token = await tokenFor('TECNICO');

    const response = await request(app)
      .post('/registros')
      .set('Authorization', `Bearer ${token}`)
      .send({ planoManutencaoId: 'p1' });

    expect(response.status).toBe(400);
  });

  it('returns 404 when the plano does not exist', async () => {
    planoFindUnique.mockResolvedValueOnce(null);
    const { createApp } = await import('../app');
    const app = createApp();
    const token = await tokenFor('TECNICO');

    const response = await request(app)
      .post('/registros')
      .set('Authorization', `Bearer ${token}`)
      .send({ planoManutencaoId: 'missing', dataExecucao: '2026-08-20', custo: 100 });

    expect(response.status).toBe(404);
  });

  it('creates a registro using the token subject as tecnicoId', async () => {
    planoFindUnique.mockResolvedValueOnce({ id: 'p1' });
    registroCreate.mockResolvedValueOnce({ id: 'r1', tecnicoId: 'user-1' });
    const { createApp } = await import('../app');
    const app = createApp();
    const token = await tokenFor('TECNICO');

    const response = await request(app)
      .post('/registros')
      .set('Authorization', `Bearer ${token}`)
      .send({
        planoManutencaoId: 'p1',
        dataExecucao: '2026-08-20',
        observacoes: 'Troca de óleo',
        custo: 150,
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 'r1', tecnicoId: 'user-1' });
    expect(registroCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ tecnicoId: 'user-1' }) }),
    );
  });
});
