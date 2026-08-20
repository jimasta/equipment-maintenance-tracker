import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import styles from './AppShell.module.css';

const PAPEL_LABELS: Record<string, string> = {
  TECNICO: 'Técnico',
  SUPERVISOR: 'Supervisor',
  GESTOR: 'Gestor',
};

const NAV_ITEMS = [
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
          {NAV_ITEMS.map((item) => (
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
          ))}
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
