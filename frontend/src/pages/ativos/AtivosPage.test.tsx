import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AtivosPage } from './AtivosPage';
import { AuthProvider } from '../../auth/AuthContext';
import * as api from '../../lib/api';

vi.mock('../../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../../lib/api')>('../../lib/api');
  return { ...actual, fetchAtivos: vi.fn(), createAtivo: vi.fn(), fetchMe: vi.fn() };
});

const ativoMock: api.Ativo = {
  id: 'a1',
  nome: 'Bomba centrífuga 03',
  tipo: 'Bomba',
  localizacao: 'Galpão 2',
  dataAquisicao: '2024-01-15T00:00:00.000Z',
  criadoEm: '2024-01-15T00:00:00.000Z',
  planosAtivos: 1,
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/ativos']}>
      <AuthProvider>
        <AtivosPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('AtivosPage', () => {
  afterEach(cleanup);

  it('shows the empty state when there are no assets', async () => {
    vi.mocked(api.fetchAtivos).mockResolvedValueOnce([]);
    renderPage();

    expect(await screen.findByText('Nenhum ativo cadastrado ainda')).toBeDefined();
  });

  it('lists assets once loaded', async () => {
    vi.mocked(api.fetchAtivos).mockResolvedValueOnce([ativoMock]);
    renderPage();

    expect(await screen.findByText('Bomba centrífuga 03')).toBeDefined();
    expect(screen.getByText('Galpão 2')).toBeDefined();
  });

  it('filters the list by the search term', async () => {
    vi.mocked(api.fetchAtivos).mockResolvedValueOnce([ativoMock]);
    renderPage();

    await screen.findByText('Bomba centrífuga 03');
    fireEvent.change(screen.getByLabelText('Buscar ativos'), { target: { value: 'gerador' } });

    expect(await screen.findByText('Nenhum ativo encontrado')).toBeDefined();
  });
});
