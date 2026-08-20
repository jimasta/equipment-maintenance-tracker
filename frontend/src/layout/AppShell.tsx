import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import styles from './AppShell.module.css';

const PAPEL_LABELS: Record<string, string> = {
  TECNICO: 'Técnico',
  SUPERVISOR: 'Supervisor',
  GESTOR: 'Gestor',
};

interface NavItem {
  to: string;
  end: boolean;
  label: string;
  icon: JSX.Element;
  gestorOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    to: '/',
    end: true,
    label: 'Painel',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 11.5L12 4l8 7.5M6 10v9a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-9"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: '/ativos',
    end: false,
    label: 'Ativos',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
        <rect x="13" y="4" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
        <rect x="4" y="13" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
        <rect x="13" y="13" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    to: '/pendencias',
    end: true,
    label: 'Pendências',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6 9a6 6 0 0 1 12 0c0 3.4 1 5 1.5 5.5H4.5C5 14 6 12.4 6 9z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M10 18a2 2 0 0 0 4 0"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    to: '/relatorios',
    end: true,
    label: 'Relatórios',
    gestorOnly: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 4v16h16"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="7" y="12" width="2.5" height="5" rx="0.5" fill="currentColor" />
        <rect x="11.5" y="9" width="2.5" height="8" rx="0.5" fill="currentColor" />
        <rect x="16" y="6" width="2.5" height="11" rx="0.5" fill="currentColor" />
      </svg>
    ),
  },
];

function getInitials(nome: string) {
  const parts = nome.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function useBreadcrumb() {
  const location = useLocation();
  if (location.pathname === '/') return ['Painel'];
  if (location.pathname === '/ativos') return ['Ativos'];
  if (location.pathname.startsWith('/ativos/')) return ['Ativos', 'Detalhe do ativo'];
  if (location.pathname === '/pendencias') return ['Pendências'];
  if (location.pathname === '/relatorios') return ['Relatórios'];
  return [];
}

export function AppShell() {
  const { usuario, logout } = useAuth();
  const breadcrumb = useBreadcrumb();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebar-collapsed') === '1',
  );

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <span className={styles.brand}>
            <span className={styles.brandMark}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 3l8 4v5c0 4.6-3.2 8.4-8 9.4-4.8-1-8-4.8-8-9.4V7l8-4z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 12l2 2 4-4.2"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {!collapsed && 'Equipment Tracker'}
          </span>
          <button
            type="button"
            className={styles.collapseButton}
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 5l-7 7 7 7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {!collapsed && <span className={styles.sectionLabel}>Menu</span>}
        <nav className={styles.nav} aria-label="Navegação principal">
          {NAV_ITEMS.filter((item) => !item.gestorOnly || usuario?.papel === 'GESTOR').map(
            (item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  [styles.navLink, isActive ? styles.navLinkActive : ''].filter(Boolean).join(' ')
                }
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
              </NavLink>
            ),
          )}
        </nav>

        <div className={styles.sidebarFooter}>
          {usuario && (
            <div className={styles.userCard}>
              <span className={styles.avatar}>{getInitials(usuario.nome)}</span>
              {!collapsed && (
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{usuario.nome}</span>
                  <span className={styles.userRole}>
                    {PAPEL_LABELS[usuario.papel] ?? usuario.papel}
                  </span>
                </div>
              )}
            </div>
          )}
          <button
            type="button"
            className={styles.logoutButton}
            onClick={logout}
            title={collapsed ? 'Sair' : undefined}
          >
            <span className={styles.navIcon}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M16 16l4-4-4-4M20 12H9"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {!collapsed && <span className={styles.navLabel}>Sair</span>}
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <div className={styles.topbar}>
          <div className={styles.breadcrumb}>
            {breadcrumb.map((item, i) => (
              <span key={item}>
                {i > 0 && ' / '}
                <span
                  className={i === breadcrumb.length - 1 ? styles.breadcrumbCurrent : undefined}
                >
                  {item}
                </span>
              </span>
            ))}
          </div>
        </div>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
