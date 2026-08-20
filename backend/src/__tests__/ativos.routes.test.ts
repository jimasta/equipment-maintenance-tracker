import { beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const findMany = vi.fn();
const findUnique = vi.fn();
const create = vi.fn();
const update = vi.fn();

vi.mock('../lib/prisma', () => ({
  prisma: {
    ativo: {
      findMany: (...args: unknown[]) => findMany(...args),
      findUnique: (...args: unknown[]) => findUnique(...args),
      create: (...args: unknown[]) => create(...args),
      update: (...args: unknown[]) => update(...args),
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

describe('GET /ativos', () => {
  it('rejects requests without a token', async () => {
    const { createApp } = await import('../app');
    const app = createApp();

    const response = await request(app).get('/ativos');
    expect(response.status).toBe(401);
  });

  it('lists ativos for an authenticated user of any role', async () => {
    findMany.mockResolvedValueOnce([{ id: 'a1', nome: 'Bomba 1' }]);
    const { createApp } = await import('../app');
    const app = createApp();
    const token = await tokenFor('TECNICO');

    const response = await request(app).get('/ativos').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 'a1', nome: 'Bomba 1' }]);
  });
});

describe('POST /ativos', () => {
  it('rejects a técnico (requires supervisor or gestor)', async () => {
    const { createApp } = await import('../app');
    const app = createApp();
    const token = await tokenFor('TECNICO');

    const response = await request(app)
      .post('/ativos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nome: 'Bomba 1',
        tipo: 'bomba',
        localizacao: 'Setor A',
        dataAquisicao: '2024-01-01',
      });

    expect(response.status).toBe(403);
  });

  it('returns 400 when required fields are missing', async () => {
    const { createApp } = await import('../app');
    const app = createApp();
    const token = await tokenFor('SUPERVISOR');

    const response = await request(app)
      .post('/ativos')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: '' });

    expect(response.status).toBe(400);
  });

  it('creates an ativo for a supervisor with valid data', async () => {
    create.mockResolvedValueOnce({ id: 'a1', nome: 'Bomba 1' });
    const { createApp } = await import('../app');
    const app = createApp();
    const token = await tokenFor('SUPERVISOR');

    const response = await request(app)
      .post('/ativos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nome: 'Bomba 1',
        tipo: 'bomba',
        localizacao: 'Setor A',
        dataAquisicao: '2024-01-01',
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 'a1', nome: 'Bomba 1' });
  });
});

describe('PUT /ativos/:id', () => {
  it('returns 404 when the ativo does not exist', async () => {
    findUnique.mockResolvedValueOnce(null);
    const { createApp } = await import('../app');
    const app = createApp();
    const token = await tokenFor('GESTOR');

    const response = await request(app)
      .put('/ativos/missing')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nome: 'Bomba 1',
        tipo: 'bomba',
        localizacao: 'Setor A',
        dataAquisicao: '2024-01-01',
      });

    expect(response.status).toBe(404);
  });
});
