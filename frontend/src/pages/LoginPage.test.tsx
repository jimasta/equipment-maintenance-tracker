import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { AuthProvider } from '../auth/AuthContext';
import { ApiError, login as apiLogin } from '../lib/api';

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api');
  return { ...actual, login: vi.fn(), fetchMe: vi.fn() };
});

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  afterEach(cleanup);

  it('shows inline validation errors when submitted empty', async () => {
    renderLoginPage();
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText('Informe seu e-mail')).toBeDefined();
    expect(screen.getByText('Informe sua senha')).toBeDefined();
  });

  it('shows an error message when the API rejects the credentials', async () => {
    vi.mocked(apiLogin).mockRejectedValueOnce(new ApiError('E-mail ou senha inválidos'));
    renderLoginPage();

    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect((await screen.findByRole('alert')).textContent).toBe('E-mail ou senha inválidos');
  });
});
