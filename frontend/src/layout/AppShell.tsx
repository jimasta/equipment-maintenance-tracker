import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/Button';
import styles from './AppShell.module.css';

const PAPEL_LABELS: Record<string, string> = {
  TECNICO: 'Técnico',
  SUPERVISOR: 'Supervisor',
  GESTOR: 'Gestor',
};

export function AppShell() {
  const { usuario, logout } = useAuth();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.brand}>Equipment Tracker</span>
        <nav className={styles.nav} aria-label="Navegação principal">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              [styles.navLink, isActive ? styles.navLinkActive : ''].filter(Boolean).join(' ')
            }
          >
            Painel
          </NavLink>
        </nav>
        <div className={styles.userMenu}>
          {usuario && (
            <div className={styles.userInfo}>
              <span className={styles.userName}>{usuario.nome}</span>
              <span className={styles.userRole}>
                {PAPEL_LABELS[usuario.papel] ?? usuario.papel}
              </span>
            </div>
          )}
          <Button variant="secondary" onClick={logout}>
            Sair
          </Button>
        </div>
      </header>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
