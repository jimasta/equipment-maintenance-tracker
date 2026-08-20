import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { EmptyState, ErrorState, SkeletonList } from '../../components/AsyncState';
import { AssetTypeTag } from '../../components/AssetTypeTag';
import { Button } from '../../components/Button';
import { Drawer } from '../../components/Drawer';
import { StatusBadge, AssetStatus } from '../../components/StatusBadge';
import { Toast } from '../../components/Toast';
import {
  ApiError,
  Ativo,
  PlanoInput,
  PlanoManutencao,
  RegistroHistorico,
  RegistroInput,
  StatusPlano,
  createPlano,
  createRegistro,
  desativarPlano,
  fetchAtivo,
  fetchHistoricoAtivo,
  fetchPlanos,
} from '../../lib/api';
import { PlanoForm } from './PlanoForm';
import { RegistroForm } from './RegistroForm';
import styles from './AtivoDetailPage.module.css';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function formatCusto(custo: string) {
  return Number(custo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const STATUS_MAP: Record<StatusPlano, AssetStatus> = {
  EM_DIA: 'em-dia',
  PROXIMO: 'proximo',
  VENCIDO: 'vencido',
};

export function AtivoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const podeGerenciar = usuario?.papel === 'SUPERVISOR' || usuario?.papel === 'GESTOR';

  const [ativo, setAtivo] = useState<Ativo | null>(null);
  const [planos, setPlanos] = useState<PlanoManutencao[] | null>(null);
  const [historico, setHistorico] = useState<RegistroHistorico[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [planoEmExecucao, setPlanoEmExecucao] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function carregar() {
    if (!id) return;
    setLoadError(null);
    setAtivo(null);
    setPlanos(null);
    setHistorico(null);
    try {
      const [ativoEncontrado, planosDoAtivo, historicoDoAtivo] = await Promise.all([
        fetchAtivo(id),
        fetchPlanos(id),
        fetchHistoricoAtivo(id),
      ]);
      setAtivo(ativoEncontrado);
      setPlanos(planosDoAtivo);
      setHistorico(historicoDoAtivo);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Erro inesperado ao carregar o ativo.');
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function salvarPlano(data: PlanoInput) {
    await createPlano(data);
    setToast('Plano de manutenção adicionado.');
    setDrawerAberto(false);
    await carregar();
  }

  async function desativar(planoId: string) {
    await desativarPlano(planoId);
    setToast('Plano desativado.');
    await carregar();
  }

  async function salvarRegistro(data: RegistroInput) {
    await createRegistro(data);
    setToast('Execução registrada com sucesso.');
    setPlanoEmExecucao(null);
    await carregar();
  }

  if (!id) {
    navigate('/ativos', { replace: true });
    return null;
  }

  return (
    <div className={styles.page}>
      <Link to="/ativos" className={styles.back}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M14 6l-6 6 6 6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Ativos
      </Link>

      {ativo === null && !loadError && <SkeletonList rows={3} />}
      {loadError && <ErrorState description={loadError} onRetry={carregar} />}

      {ativo && (
        <div className={styles.summary}>
          <div>
            <h1>{ativo.nome}</h1>
            <div className={styles.summaryMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Tipo</span>
                <AssetTypeTag tipo={ativo.tipo} />
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Localização</span>
                <span className={styles.metaValue}>{ativo.localizacao}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Aquisição</span>
                <span className={styles.metaValue}>{formatDate(ativo.dataAquisicao)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {ativo && (
        <section>
          <div className={styles.sectionHeader}>
            <h2>Planos de manutenção</h2>
            {podeGerenciar && <Button onClick={() => setDrawerAberto(true)}>Novo plano</Button>}
          </div>

          {planos === null && <SkeletonList rows={2} />}

          {planos !== null && planos.length === 0 && (
            <EmptyState
              title="Nenhum plano de manutenção"
              description="Cadastre um plano para definir a periodicidade esperada deste ativo."
              action={
                podeGerenciar ? (
                  <Button onClick={() => setDrawerAberto(true)}>Novo plano</Button>
                ) : undefined
              }
            />
          )}

          {planos !== null && planos.length > 0 && (
            <div className={styles.planCards}>
              {planos.map((plano) => (
                <div
                  key={plano.id}
                  className={`${styles.planCard} ${!plano.estaAtivo ? styles.planCardInactive : ''}`}
                >
                  <div className={styles.planInterval}>
                    <span className={styles.planValue}>{plano.intervaloValor}</span>
                    <span className={styles.planUnit}>
                      {plano.intervaloTipo === 'HORAS_USO' ? 'horas de uso' : 'dias'}
                    </span>
                  </div>

                  {plano.estaAtivo && plano.status && (
                    <div className={styles.planStatus}>
                      <StatusBadge status={STATUS_MAP[plano.status]} />
                      {plano.proximoVencimento && (
                        <span className={styles.planDueDate}>
                          vence em {formatDate(plano.proximoVencimento)}
                        </span>
                      )}
                    </div>
                  )}

                  <div className={styles.planFooter}>
                    {plano.estaAtivo ? (
                      <>
                        <Button variant="secondary" onClick={() => setPlanoEmExecucao(plano.id)}>
                          Registrar execução
                        </Button>
                        {podeGerenciar && (
                          <Button variant="ghost" onClick={() => desativar(plano.id)}>
                            Desativar
                          </Button>
                        )}
                      </>
                    ) : (
                      <span className={styles.inactiveLabel}>Desativado</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {ativo && (
        <section>
          <div className={styles.sectionHeader}>
            <h2>Histórico de manutenção</h2>
          </div>

          {historico === null && <SkeletonList rows={2} />}

          {historico !== null && historico.length === 0 && (
            <EmptyState
              title="Nenhuma manutenção registrada"
              description="O histórico aparece aqui assim que uma execução for registrada em algum plano deste ativo."
            />
          )}

          {historico !== null && historico.length > 0 && (
            <div className={styles.historicoWrap}>
              <table className={styles.historicoTable}>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Técnico</th>
                    <th>Observações</th>
                    <th>Custo</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.map((registro) => (
                    <tr key={registro.id}>
                      <td className={styles.historicoDate}>{formatDate(registro.dataExecucao)}</td>
                      <td>{registro.tecnico?.nome ?? '—'}</td>
                      <td className={styles.historicoObs}>{registro.observacoes ?? '—'}</td>
                      <td className={styles.historicoCusto}>{formatCusto(registro.custo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {drawerAberto && ativo && (
        <Drawer title="Novo plano de manutenção" onClose={() => setDrawerAberto(false)}>
          <PlanoForm
            ativoId={ativo.id}
            onSubmit={salvarPlano}
            onCancel={() => setDrawerAberto(false)}
          />
        </Drawer>
      )}

      {planoEmExecucao && (
        <Drawer title="Registrar execução" onClose={() => setPlanoEmExecucao(null)}>
          <RegistroForm
            planoManutencaoId={planoEmExecucao}
            onSubmit={salvarRegistro}
            onCancel={() => setPlanoEmExecucao(null)}
          />
        </Drawer>
      )}

      {toast && <Toast>{toast}</Toast>}
    </div>
  );
}
