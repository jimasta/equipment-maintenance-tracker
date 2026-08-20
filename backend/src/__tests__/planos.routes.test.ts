import { beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const ativoFindUnique = vi.fn();
const planoFindMany = vi.fn();
const planoFindUnique = vi.fn();
const planoCreate = vi.fn();
const planoUpdate = vi.fn();

vi.mock('../lib/prisma', () => ({
  prisma: {
    ativo: {
      findUnique: (...args: unknown[]) => ativoFindUnique(...args),
    },
    planoManutencao: {
      findMany: (...args: unknown[]) => planoFindMany(...args),
      findUnique: (...args: unknown[]) => planoFindUnique(...args),
      create: (...args: unknown[]) => planoCreate(...args),
      update: (...args: unknown[]) => planoUpdate(...args),
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

describe('GET /planos', () => {
  it('returns 400 when ativoId is missing', async () => {
    const { createApp } = await import('../app');
    const app = createApp();
    const token = await tokenFor('TECNICO');

    const response = await request(app).get('/planos').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
  });

  it('computes proximoVencimento and status for each active plano', async () => {
    planoFindMany.mockResolvedValueOnce([
      {
        id: 'p1',
        ativoId: 'a1',
        intervaloTipo: 'DIAS',
        intervaloValor: 30,
        estaAtivo: true,
        ativo: { id: 'a1', nome: 'Bomba', dataAquisicao: new Date('2026-01-01T00:00:00.000Z') },
        registros: [],
      },
      {
        id: 'p2',
        ativoId: 'a1',
        intervaloTipo: 'DIAS',
        intervaloValor: 30,
        estaAtivo: false,
        ativo: { id: 'a1', nome: 'Bomba', dataAquisicao: new Date('2026-01-01T00:00:00.000Z') },
        registros: [],
      },
    ]);
    const { createApp } = await import('../app');
    const app = createApp();
    const token = await tokenFor('TECNICO');

    const response = await request(app)
      .get('/planos?ativoId=a1')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body[0]).toMatchObject({ id: 'p1', status: 'VENCIDO' });
    expect(response.body[1]).toMatchObject({ id: 'p2', status: null, proximoVencimento: null });
  });
});

describe('GET /planos/pendentes', () => {
  it('only returns planos with status PROXIMO or VENCIDO', async () => {
    planoFindMany.mockResolvedValueOnce([
      {
        id: 'p-vencido',
        intervaloValor: 10,
        estaAtivo: true,
        ativo: { id: 'a1', nome: 'Bomba', dataAquisicao: new Date('2020-01-01T00:00:00.000Z') },
        registros: [],
      },
      {
        id: 'p-em-dia',
        intervaloValor: 3650,
        estaAtivo: true,
        ativo: { id: 'a2', nome: 'Gerador', dataAquisicao: new Date() },
        registros: [],
      },
    ]);
    const { createApp } = await import('../app');
    const app = createApp();
    const token = await tokenFor('TECNICO');

    const response = await request(app)
      .get('/planos/pendentes')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({ id: 'p-vencido', status: 'VENCIDO' });
  });
});

describe('POST /planos', () => {
  it('returns 400 for an invalid intervaloTipo', async () => {
    const { createApp } = await import('../app');
    const app = createApp();
    const token = await tokenFor('SUPERVISOR');

    const response = await request(app)
      .post('/planos')
      .set('Authorization', `Bearer ${token}`)
      .send({ ativoId: 'a1', intervaloTipo: 'ANOS', intervaloValor: 10 });

    expect(response.status).toBe(400);
  });

  it('returns 404 when the ativo does not exist', async () => {
    ativoFindUnique.mockResolvedValueOnce(null);
    const { createApp } = await import('../app');
    const app = createApp();
    const token = await tokenFor('SUPERVISOR');

    const response = await request(app)
      .post('/planos')
      .set('Authorization', `Bearer ${token}`)
      .send({ ativoId: 'missing', intervaloTipo: 'DIAS', intervaloValor: 90 });

    expect(response.status).toBe(404);
  });

  it('creates a plano for a valid ativo', async () => {
    ativoFindUnique.mockResolvedValueOnce({ id: 'a1' });
    planoCreate.mockResolvedValueOnce({ id: 'p1', ativoId: 'a1', intervaloTipo: 'DIAS' });
    const { createApp } = await import('../app');
    const app = createApp();
    const token = await tokenFor('GESTOR');

    const response = await request(app)
      .post('/planos')
      .set('Authorization', `Bearer ${token}`)
      .send({ ativoId: 'a1', intervaloTipo: 'DIAS', intervaloValor: 90 });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ id: 'p1', ativoId: 'a1' });
  });
});

describe('PATCH /planos/:id/desativar', () => {
  it('rejects a técnico', async () => {
    const { createApp } = await import('../app');
    const app = createApp();
    const token = await tokenFor('TECNICO');

    const response = await request(app)
      .patch('/planos/p1/desativar')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it('deactivates an existing plano', async () => {
    planoFindUnique.mockResolvedValueOnce({ id: 'p1', estaAtivo: true });
    planoUpdate.mockResolvedValueOnce({ id: 'p1', estaAtivo: false });
    const { createApp } = await import('../app');
    const app = createApp();
    const token = await tokenFor('SUPERVISOR');

    const response = await request(app)
      .patch('/planos/p1/desativar')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 'p1', estaAtivo: false });
  });
});
