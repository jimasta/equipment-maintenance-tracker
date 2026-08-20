import { beforeAll, describe, expect, it } from 'vitest';
import { hashPassword, signToken, verifyPassword, verifyToken } from '../services/authService';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
});

describe('authService', () => {
  it('hashes a password and verifies it correctly', async () => {
    const hash = await hashPassword('minhaSenha123');

    expect(await verifyPassword('minhaSenha123', hash)).toBe(true);
    expect(await verifyPassword('senhaErrada', hash)).toBe(false);
  });

  it('signs a token and verifies its payload', () => {
    const token = signToken({ sub: 'user-1', nome: 'Ana', papel: 'SUPERVISOR' });
    const payload = verifyToken(token);

    expect(payload.sub).toBe('user-1');
    expect(payload.nome).toBe('Ana');
    expect(payload.papel).toBe('SUPERVISOR');
  });

  it('rejects a tampered token', () => {
    const token = signToken({ sub: 'user-1', nome: 'Ana', papel: 'SUPERVISOR' });

    expect(() => verifyToken(`${token}tampered`)).toThrow();
  });
});
