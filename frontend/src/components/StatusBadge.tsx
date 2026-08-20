import styles from './StatusBadge.module.css';

export type AssetStatus = 'em-dia' | 'proximo' | 'vencido';

const LABELS: Record<AssetStatus, string> = {
  'em-dia': 'Em dia',
  proximo: 'Próximo do vencimento',
  vencido: 'Vencido',
};

export function StatusBadge({ status }: { status: AssetStatus }) {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      <span className={styles.dot} aria-hidden="true" />
      {LABELS[status]}
    </span>
  );
}
