import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';

describe('App', () => {
  it('redirects unauthenticated users to the login page', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/equipment tracker/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeDefined();
  });
});
