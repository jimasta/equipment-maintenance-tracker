import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { EmptyState, ErrorState, SkeletonList } from '../../components/AsyncState';
import { AssetTypeTag } from '../../components/AssetTypeTag';
import { Button } from '../../components/Button';
import { Drawer } from '../../components/Drawer';
import { Toast } from '../../components/Toast';
import {
  ApiError,
  Ativo,
  PlanoInput,
  PlanoManutencao,
  createPlano,
  desativarPlano,
  fetchAtivo,
  fetchPlanos,
} from '../../lib/api';
import { PlanoForm } from './PlanoForm';
import styles from './AtivoDetailPage.module.css';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

export function AtivoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const podeGerenciar = usuario?.papel === 'SUPERVISOR' || usuario?.papel === 'GESTOR';

  const [ativo, setAtivo] = useState<Ativo | null>(null);
  const [planos, setPlanos] = useState<PlanoManutencao[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function carregar() {
    if (!id) return;
    setLoadError(null);
    setAtivo(null);
    setPlanos(null);
    try {
      const [ativoEncontrado, planosDoAtivo] = await Promise.all([fetchAtivo(id), fetchPlanos(id)]);
      setAtivo(ativoEncontrado);
      setPlanos(planosDoAtivo);
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
                  <div className={styles.planFooter}>
                    {plano.estaAtivo ? (
                      podeGerenciar && (
                        <Button variant="ghost" onClick={() => desativar(plano.id)}>
                          Desativar
                        </Button>
                      )
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

      {drawerAberto && ativo && (
        <Drawer title="Novo plano de manutenção" onClose={() => setDrawerAberto(false)}>
          <PlanoForm
            ativoId={ativo.id}
            onSubmit={salvarPlano}
            onCancel={() => setDrawerAberto(false)}
          />
        </Drawer>
      )}

      {toast && <Toast>{toast}</Toast>}
    </div>
  );
}
