import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorState, SkeletonList } from '../../components/AsyncState';
import { AssetStatus, StatusBadge } from '../../components/StatusBadge';
import { ApiError, PlanoPendente, StatusPlano, fetchPlanosPendentes } from '../../lib/api';
import styles from './PendenciasPage.module.css';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

const STATUS_MAP: Record<StatusPlano, AssetStatus> = {
  EM_DIA: 'em-dia',
  PROXIMO: 'proximo',
  VENCIDO: 'vencido',
};

export function PendenciasPage() {
  const [planos, setPlanos] = useState<PlanoPendente[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function carregar() {
    setLoadError(null);
    setPlanos(null);
    try {
      const dados = await fetchPlanosPendentes();
      setPlanos(dados);
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.message : 'Erro inesperado ao carregar pendências.',
      );
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Pendências</h1>
        <span className={styles.subtitle}>
          Planos de manutenção próximos do vencimento ou vencidos, em todos os ativos.
        </span>
      </div>

      {planos === null && !loadError && <SkeletonList rows={4} />}

      {loadError && <ErrorState description={loadError} onRetry={carregar} />}

      {planos !== null && !loadError && planos.length === 0 && (
        <EmptyState
          title="Nenhuma pendência no momento"
          description="Todos os planos de manutenção ativos estão em dia."
        />
      )}

      {planos !== null && !loadError && planos.length > 0 && (
        <div className={styles.grid}>
          {planos.map((plano) => (
            <div
              key={plano.id}
              className={`${styles.card} ${plano.status === 'VENCIDO' ? styles.cardVencido : ''}`}
            >
              <div className={styles.cardHeader}>
                <Link to={`/ativos/${plano.ativo.id}`} className={styles.assetName}>
                  {plano.ativo.nome}
                </Link>
                {plano.status && <StatusBadge status={STATUS_MAP[plano.status]} />}
              </div>

              <div className={styles.planInfo}>
                <span className={styles.planValue}>{plano.intervaloValor}</span>
                <span className={styles.planUnit}>
                  {plano.intervaloTipo === 'HORAS_USO' ? 'horas de uso' : 'dias'}
                </span>
              </div>

              {plano.proximoVencimento && (
                <span className={styles.dueDate}>
                  vencimento: {formatDate(plano.proximoVencimento)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
