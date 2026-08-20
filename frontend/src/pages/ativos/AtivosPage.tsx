import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { EmptyState, ErrorState, SkeletonList } from '../../components/AsyncState';
import { AssetTypeTag } from '../../components/AssetTypeTag';
import { Button } from '../../components/Button';
import { Drawer } from '../../components/Drawer';
import { IconButton } from '../../components/IconButton';
import { Toast } from '../../components/Toast';
import { ApiError, Ativo, AtivoInput, createAtivo, fetchAtivos, updateAtivo } from '../../lib/api';
import { AtivoForm } from './AtivoForm';
import styles from './AtivosPage.module.css';

const TIPOS_FILTRO = ['Bomba', 'Gerador', 'Veículo', 'Maquinário', 'Outro'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

export function AtivosPage() {
  const { usuario } = useAuth();
  const podeGerenciar = usuario?.papel === 'SUPERVISOR' || usuario?.papel === 'GESTOR';

  const [searchParams] = useSearchParams();

  const [ativos, setAtivos] = useState<Ativo[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<string | null>(
    () => searchParams.get('tipo') ?? null,
  );

  const [drawerAberto, setDrawerAberto] = useState(false);
  const [ativoEmEdicao, setAtivoEmEdicao] = useState<Ativo | undefined>(undefined);
  const [toast, setToast] = useState<string | null>(null);

  async function carregar() {
    setLoadError(null);
    setAtivos(null);
    try {
      const dados = await fetchAtivos({ tipo: tipoFiltro ?? undefined });
      setAtivos(dados);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Erro inesperado ao carregar ativos.');
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoFiltro]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const ativosFiltrados = useMemo(() => {
    if (!ativos) return [];
    const termo = busca.trim().toLowerCase();
    if (!termo) return ativos;
    return ativos.filter(
      (a) => a.nome.toLowerCase().includes(termo) || a.localizacao.toLowerCase().includes(termo),
    );
  }, [ativos, busca]);

  function abrirNovoAtivo() {
    setAtivoEmEdicao(undefined);
    setDrawerAberto(true);
  }

  function abrirEdicao(ativo: Ativo) {
    setAtivoEmEdicao(ativo);
    setDrawerAberto(true);
  }

  async function salvar(data: AtivoInput) {
    if (ativoEmEdicao) {
      await updateAtivo(ativoEmEdicao.id, data);
      setToast('Ativo atualizado com sucesso.');
    } else {
      await createAtivo(data);
      setToast('Ativo cadastrado com sucesso.');
    }
    setDrawerAberto(false);
    await carregar();
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1>Ativos</h1>
          <span className={styles.subtitle}>
            {ativos
              ? `${ativos.length} ativo${ativos.length === 1 ? '' : 's'} cadastrado${ativos.length === 1 ? '' : 's'}`
              : 'Carregando inventário…'}
          </span>
        </div>
        {podeGerenciar && <Button onClick={abrirNovoAtivo}>Novo ativo</Button>}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
            <path
              d="M20 20l-4.3-4.3"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Buscar por nome ou localização"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar ativos"
          />
        </div>

        <div className={styles.chips} role="group" aria-label="Filtrar por tipo">
          <button
            type="button"
            className={`${styles.chip} ${tipoFiltro === null ? styles.chipActive : ''}`}
            onClick={() => setTipoFiltro(null)}
          >
            Todos
          </button>
          {TIPOS_FILTRO.map((tipo) => (
            <button
              key={tipo}
              type="button"
              className={`${styles.chip} ${tipoFiltro === tipo ? styles.chipActive : ''}`}
              onClick={() => setTipoFiltro(tipo)}
            >
              {tipo}
            </button>
          ))}
        </div>
      </div>

      {ativos === null && !loadError && (
        <div className={`${styles.tableWrap} ${styles.loadingWrap}`}>
          <SkeletonList rows={5} />
        </div>
      )}

      {loadError && <ErrorState description={loadError} onRetry={carregar} />}

      {ativos !== null && !loadError && ativosFiltrados.length === 0 && (
        <EmptyState
          title={busca || tipoFiltro ? 'Nenhum ativo encontrado' : 'Nenhum ativo cadastrado ainda'}
          description={
            busca || tipoFiltro
              ? 'Tente ajustar a busca ou remover o filtro de tipo.'
              : 'Cadastre o primeiro ativo para começar a rastrear a manutenção.'
          }
          action={
            podeGerenciar && !busca && !tipoFiltro ? (
              <Button onClick={abrirNovoAtivo}>Cadastrar ativo</Button>
            ) : undefined
          }
        />
      )}

      {ativos !== null && !loadError && ativosFiltrados.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ativo</th>
                <th>Tipo</th>
                <th>Localização</th>
                <th>Aquisição</th>
                <th>Manutenção</th>
                {podeGerenciar && <th aria-label="Ações" />}
              </tr>
            </thead>
            <tbody>
              {ativosFiltrados.map((ativo) => (
                <tr key={ativo.id}>
                  <td>
                    <Link to={`/ativos/${ativo.id}`} className={styles.ativoLink}>
                      {ativo.nome}
                    </Link>
                  </td>
                  <td>
                    <AssetTypeTag tipo={ativo.tipo} />
                  </td>
                  <td>{ativo.localizacao}</td>
                  <td className={styles.dateCell}>{formatDate(ativo.dataAquisicao)}</td>
                  <td>
                    <span
                      className={`${styles.planoBadge} ${ativo.planosAtivos > 0 ? styles.planoBadgeActive : styles.planoBadgeNone}`}
                    >
                      <span className={styles.planoBadgeDot} aria-hidden="true" />
                      {ativo.planosAtivos > 0
                        ? `${ativo.planosAtivos} plano${ativo.planosAtivos === 1 ? '' : 's'} ativo${ativo.planosAtivos === 1 ? '' : 's'}`
                        : 'Sem plano'}
                    </span>
                  </td>
                  {podeGerenciar && (
                    <td>
                      <div className={styles.rowActions}>
                        <IconButton label="Editar ativo" onClick={() => abrirEdicao(ativo)}>
                          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path
                              d="M4 20l1-4 11-11 3 3-11 11-4 1z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </IconButton>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {drawerAberto && (
        <Drawer
          title={ativoEmEdicao ? 'Editar ativo' : 'Novo ativo'}
          onClose={() => setDrawerAberto(false)}
        >
          <AtivoForm
            ativo={ativoEmEdicao}
            onSubmit={salvar}
            onCancel={() => setDrawerAberto(false)}
          />
        </Drawer>
      )}

      {toast && <Toast>{toast}</Toast>}
    </div>
  );
}
