import { describe, expect, it } from 'vitest';
import { calcularProximoVencimento, calcularStatus } from '../services/statusService';

const HOJE = new Date('2026-08-20T12:00:00.000Z');

describe('calcularProximoVencimento', () => {
  it('uses the last execution as the base when it exists', () => {
    const proximo = calcularProximoVencimento({
      intervaloValor: 90,
      dataAquisicaoAtivo: new Date('2020-01-01T00:00:00.000Z'),
      ultimaExecucao: new Date('2026-06-01T00:00:00.000Z'),
    });
    expect(proximo.toISOString()).toBe('2026-08-30T00:00:00.000Z');
  });

  it('falls back to dataAquisicao when there is no execution yet', () => {
    const proximo = calcularProximoVencimento({
      intervaloValor: 30,
      dataAquisicaoAtivo: new Date('2026-08-01T00:00:00.000Z'),
      ultimaExecucao: null,
    });
    expect(proximo.toISOString()).toBe('2026-08-31T00:00:00.000Z');
  });

  it('treats HORAS_USO intervals as calendar days too (no usage-hours tracking in the MVP)', () => {
    const proximo = calcularProximoVencimento({
      intervaloValor: 500,
      dataAquisicaoAtivo: new Date('2026-01-01T00:00:00.000Z'),
      ultimaExecucao: null,
    });
    expect(proximo.toISOString()).toBe('2027-05-16T00:00:00.000Z');
  });
});

describe('calcularStatus', () => {
  it('returns VENCIDO when proximoVencimento is in the past', () => {
    const proximoVencimento = new Date('2026-08-10T00:00:00.000Z');
    expect(calcularStatus(proximoVencimento, HOJE)).toBe('VENCIDO');
  });

  it('returns PROXIMO when within 7 days of proximoVencimento', () => {
    const proximoVencimento = new Date('2026-08-25T00:00:00.000Z');
    expect(calcularStatus(proximoVencimento, HOJE)).toBe('PROXIMO');
  });

  it('returns EM_DIA when more than 7 days remain', () => {
    const proximoVencimento = new Date('2026-09-15T00:00:00.000Z');
    expect(calcularStatus(proximoVencimento, HOJE)).toBe('EM_DIA');
  });

  it('treats exactly today as VENCIDO boundary correctly (0 days remaining is PROXIMO)', () => {
    const proximoVencimento = new Date('2026-08-20T12:00:00.000Z');
    expect(calcularStatus(proximoVencimento, HOJE)).toBe('PROXIMO');
  });
});
