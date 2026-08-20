import { StatusPlano } from './statusService';

export interface AlertaVencimento {
  planoId: string;
  ativoId: string;
  ativoNome: string;
  status: StatusPlano;
  proximoVencimento: Date;
}

/**
 * Mock/log de notificação por e-mail (ADR-003). No MVP não há integração SMTP/SendGrid —
 * esta função representa o ponto de extensão para um provedor real, satisfazendo o critério
 * de aceite "alerta é disparado automaticamente" via log estruturado.
 */
export function notificarVencimento(alerta: AlertaVencimento): void {
  console.log(
    `[ALERTA] Plano ${alerta.planoId} do ativo "${alerta.ativoNome}" está ${alerta.status} — vencimento em ${alerta.proximoVencimento.toISOString().slice(0, 10)}`,
  );
}
