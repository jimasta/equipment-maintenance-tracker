import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorState, SkeletonList } from '../../components/AsyncState';
import { ApiError, RelatorioCustoAtivo, fetchRelatorioCustos } from '../../lib/api';
import styles from './RelatoriosPage.module.css';

function formatCusto(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function RelatoriosPage() {
  const [relatorio, setRelatorio] = useState<RelatorioCustoAtivo[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function carregar() {
    setLoadError(null);
    setRelatorio(null);
    try {
      const dados = await fetchRelatorioCustos();
      setRelatorio(dados);
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.message : 'Erro inesperado ao carregar o relatório.',
      );
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const maiorCusto = relatorio && relatorio.length > 0 ? relatorio[0].custoTotal : 0;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Relatório de custos</h1>
        <span className={styles.subtitle}>
          Custo total e frequência de manutenção por ativo, para apoiar decisões de substituição.
        </span>
      </div>

      {loadError && <ErrorState description={loadError} onRetry={carregar} />}

      {!loadError && relatorio === null && <SkeletonList rows={4} />}

      {!loadError && relatorio !== null && relatorio.length === 0 && (
        <EmptyState
          title="Nenhum ativo cadastrado"
          description="O relatório aparece aqui assim que houver ativos cadastrados."
        />
      )}

      {!loadError && relatorio !== null && relatorio.length > 0 && (
        <>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>Custo total por ativo</div>
            <div
              className={styles.chart}
              role="img"
              aria-label="Gráfico de barras de custo total por ativo"
            >
              {relatorio.map((item) => (
                <div key={item.ativoId} className={styles.chartRow}>
                  <Link
                    to={`/ativos/${item.ativoId}`}
                    className={styles.chartLabel}
                    title={item.ativoNome}
                  >
                    {item.ativoNome}
                  </Link>
                  <div className={styles.chartTrack}>
                    <div
                      className={styles.chartFill}
                      style={{
                        width: maiorCusto > 0 ? `${(item.custoTotal / maiorCusto) * 100}%` : '0%',
                      }}
                      title={`${item.ativoNome}: ${formatCusto(item.custoTotal)}`}
                    />
                  </div>
                  <span className={styles.chartValue}>{formatCusto(item.custoTotal)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Ativo</th>
                  <th>Tipo</th>
                  <th>Manutenções</th>
                  <th>Custo total</th>
                </tr>
              </thead>
              <tbody>
                {relatorio.map((item) => (
                  <tr key={item.ativoId}>
                    <td>
                      <Link to={`/ativos/${item.ativoId}`}>{item.ativoNome}</Link>
                    </td>
                    <td>{item.ativoTipo}</td>
                    <td className={styles.tableNum}>{item.quantidadeManutencoes}</td>
                    <td className={styles.tableNum}>{formatCusto(item.custoTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
