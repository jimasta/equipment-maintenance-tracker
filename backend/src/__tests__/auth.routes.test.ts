import { beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const findUnique = vi.fn();

vi.mock('../lib/prisma', () => ({
  prisma: { usuario: { findUnique: (...args: unknown[]) => findUnique(...args) } },
}));

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
});

describe('POST /auth/login', () => {
  it('returns 400 when email or senha is missing', async () => {
    const { createApp } = await import('../app');
    const app = createApp();

    const response = await request(app).post('/auth/login').send({ email: 'a@a.com' });

    expect(response.status).toBe(400);
  });

  it('returns 401 when the user does not exist', async () => {
    findUnique.mockResolvedValueOnce(null);
    const { createApp } = await import('../app');
    const app = createApp();

    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'ghost@example.com', senha: 'whatever' });

    expect(response.status).toBe(401);
  });

  it('returns a JWT and user info on valid credentials', async () => {
    const { hashPassword } = await import('../services/authService');
    findUnique.mockResolvedValueOnce({
      id: 'user-1',
      nome: 'Ana',
      email: 'ana@example.com',
      senhaHash: await hashPassword('senhaCorreta'),
      papel: 'SUPERVISOR',
    });
    const { createApp } = await import('../app');
    const app = createApp();

    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'ana@example.com', senha: 'senhaCorreta' });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeTypeOf('string');
    expect(response.body.usuario).toMatchObject({ nome: 'Ana', papel: 'SUPERVISOR' });
  });
});

describe('GET /me', () => {
  it('rejects requests without a token', async () => {
    const { createApp } = await import('../app');
    const app = createApp();

    const response = await request(app).get('/me');

    expect(response.status).toBe(401);
  });

  it('returns the authenticated user for a valid token', async () => {
    const { signToken } = await import('../services/authService');
    const { createApp } = await import('../app');
    const app = createApp();
    const token = signToken({ sub: 'user-1', nome: 'Ana', papel: 'SUPERVISOR' });

    const response = await request(app).get('/me').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: 'user-1', nome: 'Ana', papel: 'SUPERVISOR' });
  });
});
