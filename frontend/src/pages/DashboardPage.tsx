import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ErrorState, SkeletonList } from '../components/AsyncState';
import { AssetTypeIcon } from '../components/AssetTypeTag';
import { AssetStatus, StatusBadge } from '../components/StatusBadge';
import {
  ApiError,
  Ativo,
  PlanoManutencao,
  PlanoPendente,
  RegistroHistorico,
  StatusPlano,
  fetchAtivos,
  fetchHistoricoAtivo,
  fetchPlanos,
  fetchPlanosPendentes,
} from '../lib/api';
import styles from './DashboardPage.module.css';

const DIAS_JANELA_VENCIMENTO = 30;
const MS_POR_DIA = 1000 * 60 * 60 * 24;

const MESES_ABREV = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

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
  const [pendentes, setPendentes] = useState<PlanoPendente[] | null>(null);
  const [historico, setHistorico] = useState<RegistroHistorico[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function carregar() {
    setLoadError(null);
    setAtivos(null);
    setPlanos(null);
    setPendentes(null);
    setHistorico(null);
    try {
      const dados = await fetchAtivos();
      setAtivos(dados);
      const [planosPorAtivo, pendentesDados, historicoPorAtivo] = await Promise.all([
        Promise.all(dados.map((ativo) => fetchPlanos(ativo.id))),
        fetchPlanosPendentes(),
        Promise.all(dados.map((ativo) => fetchHistoricoAtivo(ativo.id))),
      ]);
      setPlanos(planosPorAtivo.flat());
      setPendentes(pendentesDados);
      setHistorico(historicoPorAtivo.flat());
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

  const proximosDoVencimento = useMemo(() => {
    if (!pendentes) return [];
    const limite = Date.now() + DIAS_JANELA_VENCIMENTO * MS_POR_DIA;
    return pendentes
      .filter((p) => p.proximoVencimento && new Date(p.proximoVencimento).getTime() <= limite)
      .sort(
        (a, b) =>
          new Date(a.proximoVencimento!).getTime() - new Date(b.proximoVencimento!).getTime(),
      )
      .slice(0, 6);
  }, [pendentes]);

  const porStatus = useMemo(() => {
    if (!planos) return { EM_DIA: 0, PROXIMO: 0, VENCIDO: 0 };
    const contagem = { EM_DIA: 0, PROXIMO: 0, VENCIDO: 0 };
    for (const plano of planos) {
      if (plano.status) contagem[plano.status]++;
    }
    return contagem;
  }, [planos]);

  const manutencoesPorMes = useMemo(() => {
    if (!historico) return [];
    const hoje = new Date();
    const meses: { chave: string; label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      meses.push({
        chave: `${data.getFullYear()}-${data.getMonth()}`,
        label: MESES_ABREV[data.getMonth()],
        count: 0,
      });
    }
    const porChave = new Map(meses.map((m) => [m.chave, m]));
    for (const registro of historico) {
      const data = new Date(registro.dataExecucao);
      const chave = `${data.getFullYear()}-${data.getMonth()}`;
      const mes = porChave.get(chave);
      if (mes) mes.count++;
    }
    return meses;
  }, [historico]);

  const maiorContagemMes = Math.max(1, ...manutencoesPorMes.map((m) => m.count));

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

            {porTipo.map(([tipo, count]) => (
              <Link
                key={tipo}
                to={`/ativos?tipo=${encodeURIComponent(tipo)}`}
                className={styles.metricCard}
              >
                <span className={styles.metricIcon}>
                  <AssetTypeIcon tipo={tipo} />
                </span>
                <span className={styles.metricValue}>{count}</span>
                <span className={styles.metricLabel}>{tipo}</span>
              </Link>
            ))}
          </div>

          <div className={styles.mainGrid}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelTitle}>Ativos próximos do vencimento</span>
                <Link to="/pendencias" className={styles.panelLink}>
                  Ver todos
                </Link>
              </div>

              {proximosDoVencimento.length === 0 && (
                <span className={styles.greetingSubtitle}>
                  Nenhum vencimento nos próximos {DIAS_JANELA_VENCIMENTO} dias.
                </span>
              )}

              {proximosDoVencimento.map((plano) => (
                <Link key={plano.id} to={`/ativos/${plano.ativo.id}`} className={styles.assetRow}>
                  <div className={styles.assetRowMain}>
                    <span className={styles.assetRowName}>{plano.ativo.nome}</span>
                    <StatusBadge status={STATUS_MAP[plano.status!]} />
                  </div>
                  <span className={styles.assetRowDate}>
                    {formatDate(plano.proximoVencimento!)}
                  </span>
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
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Manutenções por mês</span>
            </div>

            {historico !== null && historico.length === 0 && (
              <span className={styles.greetingSubtitle}>Nenhuma manutenção registrada ainda.</span>
            )}

            {historico !== null && historico.length > 0 && (
              <div
                className={styles.monthlyChart}
                role="img"
                aria-label="Gráfico de manutenções realizadas por mês"
              >
                {manutencoesPorMes.map((mes) => (
                  <div key={mes.chave} className={styles.monthlyBar}>
                    <span className={styles.monthlyCount}>{mes.count}</span>
                    <div
                      className={styles.monthlyBarFill}
                      style={{ height: `${(mes.count / maiorContagemMes) * 100}%` }}
                      title={`${mes.label}: ${mes.count} manutenção${mes.count === 1 ? '' : 'ões'}`}
                    />
                    <span className={styles.monthlyLabel}>{mes.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
