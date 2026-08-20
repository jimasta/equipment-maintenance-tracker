import { Button } from './components/Button';
import { StatusBadge } from './components/StatusBadge';

export function App() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
      <h1>Equipment Maintenance Tracker</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
        Design system em construção — cores, tipografia e componentes base.
      </p>

      <section style={{ marginTop: 'var(--space-8)', display: 'flex', gap: 'var(--space-3)' }}>
        <Button variant="primary">Novo ativo</Button>
        <Button variant="secondary">Ver histórico</Button>
        <Button variant="ghost">Cancelar</Button>
      </section>

      <section style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-2)' }}>
        <StatusBadge status="em-dia" />
        <StatusBadge status="proximo" />
        <StatusBadge status="vencido" />
      </section>
    </main>
  );
}
