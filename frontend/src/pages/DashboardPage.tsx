import { useAuth } from '../auth/AuthContext';

export function DashboardPage() {
  const { usuario } = useAuth();

  return (
    <section>
      <h1>Painel</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
        Bem-vindo{usuario ? `, ${usuario.nome}` : ''}. O painel de ativos e alertas será construído
        nos próximos sprints.
      </p>
    </section>
  );
}
