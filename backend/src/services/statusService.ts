export type StatusPlano = 'EM_DIA' | 'PROXIMO' | 'VENCIDO';

const DIAS_ALERTA_PROXIMO = 7;
const MS_POR_DIA = 1000 * 60 * 60 * 24;

export interface PlanoParaStatus {
  intervaloValor: number;
  dataAquisicaoAtivo: Date;
  ultimaExecucao: Date | null;
}

/**
 * proximoVencimento = (última execução, ou dataAquisicao se nunca houve execução) + intervaloValor dias.
 * intervaloTipo (DIAS ou HORAS_USO) não afeta o cálculo: HORAS_USO usa intervaloValor como dias corridos
 * também, por decisão de produto — não há rastreamento de horas de uso acumuladas no MVP.
 */
export function calcularProximoVencimento(plano: PlanoParaStatus): Date {
  const base = plano.ultimaExecucao ?? plano.dataAquisicaoAtivo;
  return new Date(base.getTime() + plano.intervaloValor * MS_POR_DIA);
}

export function calcularStatus(proximoVencimento: Date, agora: Date = new Date()): StatusPlano {
  const diasRestantes = (proximoVencimento.getTime() - agora.getTime()) / MS_POR_DIA;
  if (diasRestantes < 0) return 'VENCIDO';
  if (diasRestantes <= DIAS_ALERTA_PROXIMO) return 'PROXIMO';
  return 'EM_DIA';
}
