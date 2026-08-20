import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ErrorState, SkeletonList } from '../components/AsyncState';
import { AssetStatus, StatusBadge } from '../components/StatusBadge';
import {
  ApiError,
  Ativo,
  PlanoManutencao,
  StatusPlano,
  fetchAtivos,
  fetchPlanos,
} from '../lib/api';
import styles from './DashboardPage.module.css';

const STATUS_MAP: Record<StatusPlano, AssetStatus> = {
  EM_DIA: 'em-dia',
  PROXIMO: 'proximo',
  VENCIDO: 'vencido',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function saudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function DashboardPage() {
  const { usuario } = useAuth();
  const podeGerenciar = usuario?.papel === 'SUPERVISOR' || usuario?.papel === 'GESTOR';

  const [ativos, setAtivos] = useState<Ativo[] | null>(null);
  const [planos, setPlanos] = useState<PlanoManutencao[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function carregar() {
    setLoadError(null);
    setAtivos(null);
    setPlanos(null);
    try {
      const dados = await fetchAtivos();
      setAtivos(dados);
      const planosPorAtivo = await Promise.all(dados.map((ativo) => fetchPlanos(ativo.id)));
      setPlanos(planosPorAtivo.flat());
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Erro inesperado ao carregar o painel.');
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const porTipo = useMemo(() => {
    if (!ativos) return [];
    const contagem = new Map<string, number>();
    for (const ativo of ativos) {
      contagem.set(ativo.tipo, (contagem.get(ativo.tipo) ?? 0) + 1);
    }
    return Array.from(contagem.entries()).sort((a, b) => b[1] - a[1]);
  }, [ativos]);

  const recentes = useMemo(() => {
    if (!ativos) return [];
    return [...ativos]
      .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
      .slice(0, 5);
  }, [ativos]);

  const maiorContagem = porTipo[0]?.[1] ?? 1;

  const porStatus = useMemo(() => {
    if (!planos) return { EM_DIA: 0, PROXIMO: 0, VENCIDO: 0 };
    const contagem = { EM_DIA: 0, PROXIMO: 0, VENCIDO: 0 };
    for (const plano of planos) {
      if (plano.status) contagem[plano.status]++;
    }
    return contagem;
  }, [planos]);

  return (
    <div className={styles.page}>
      <div className={styles.greeting}>
        <h1>
          {saudacao()}
          {usuario ? `, ${usuario.nome.split(' ')[0]}` : ''}!
        </h1>
        <span className={styles.greetingSubtitle}>
          Aqui está um resumo do inventário de ativos e manutenção.
        </span>
      </div>

      {loadError && <ErrorState description={loadError} onRetry={carregar} />}

      {!loadError && ativos === null && <SkeletonList rows={3} />}

      {!loadError && ativos !== null && (
        <>
          <div className={styles.metricGrid}>
            <div className={styles.metricCard}>
              <span className={styles.metricIcon}>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect
                    x="4"
                    y="4"
                    width="7"
                    height="7"
                    rx="1.4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <rect
                    x="13"
                    y="4"
                    width="7"
                    height="7"
                    rx="1.4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <rect
                    x="4"
                    y="13"
                    width="7"
                    height="7"
                    rx="1.4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <rect
                    x="13"
                    y="13"
                    width="7"
                    height="7"
                    rx="1.4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </svg>
              </span>
              <span className={styles.metricValue}>{ativos.length}</span>
              <span className={styles.metricLabel}>Ativos cadastrados</span>
            </div>

            <div className={styles.metricCard}>
              <span className={styles.metricIcon}>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M4 4v16h16"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7 15l4-5 3 3 5-7"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className={styles.metricValue}>{porTipo.length}</span>
              <span className={styles.metricLabel}>Tipos de ativo</span>
            </div>

            <div className={styles.metricCard}>
              <span className={styles.metricIcon}>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
                  <path
                    d="M12 7.5V12l3 2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className={styles.metricValue}>
                {recentes.length > 0 ? formatDate(recentes[0].criadoEm) : '—'}
              </span>
              <span className={styles.metricLabel}>Último cadastro</span>
            </div>
          </div>

          <div className={styles.mainGrid}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelTitle}>Ativos recentes</span>
                <Link to="/ativos" className={styles.panelLink}>
                  Ver todos
                </Link>
              </div>

              {recentes.length === 0 && (
                <span className={styles.greetingSubtitle}>Nenhum ativo cadastrado ainda.</span>
              )}

              {recentes.map((ativo) => (
                <Link key={ativo.id} to={`/ativos/${ativo.id}`} className={styles.assetRow}>
                  <div className={styles.assetRowMain}>
                    <span className={styles.assetRowName}>{ativo.nome}</span>
                    <span className={styles.assetRowMeta}>
                      {ativo.tipo} · {ativo.localizacao}
                    </span>
                  </div>
                  <span className={styles.assetRowDate}>{formatDate(ativo.criadoEm)}</span>
                </Link>
              ))}

              {podeGerenciar && (
                <div className={styles.ctaCard}>
                  <span className={styles.ctaTitle}>Cadastre um novo ativo</span>
                  <span className={styles.ctaDescription}>
                    Registre equipamentos e defina planos de manutenção preventiva.
                  </span>
                  <Link to="/ativos" className={styles.ctaButton}>
                    Ir para Ativos
                  </Link>
                </div>
              )}
            </div>

            <div className={styles.sideColumn}>
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <span className={styles.panelTitle}>Status de manutenção</span>
                  <Link to="/pendencias" className={styles.panelLink}>
                    Ver pendências
                  </Link>
                </div>

                <div className={styles.statusList}>
                  <div className={styles.statusRow}>
                    <StatusBadge status={STATUS_MAP.EM_DIA} />
                    <span className={styles.statusCount}>{porStatus.EM_DIA}</span>
                  </div>
                  <div className={styles.statusRow}>
                    <StatusBadge status={STATUS_MAP.PROXIMO} />
                    <span className={styles.statusCount}>{porStatus.PROXIMO}</span>
                  </div>
                  <div className={styles.statusRow}>
                    <StatusBadge status={STATUS_MAP.VENCIDO} />
                    <span className={styles.statusCount}>{porStatus.VENCIDO}</span>
                  </div>
                </div>
              </div>

              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <span className={styles.panelTitle}>Por tipo</span>
                </div>

                {porTipo.length === 0 && (
                  <span className={styles.greetingSubtitle}>Sem dados ainda.</span>
                )}

                <div className={styles.breakdownList}>
                  {porTipo.map(([tipo, count]) => (
                    <div key={tipo} className={styles.breakdownRow}>
                      <div className={styles.breakdownLabelRow}>
                        <span className={styles.breakdownLabel}>{tipo}</span>
                        <span className={styles.breakdownCount}>{count}</span>
                      </div>
                      <div className={styles.breakdownTrack}>
                        <div
                          className={styles.breakdownFill}
                          style={{ width: `${(count / maiorContagem) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
