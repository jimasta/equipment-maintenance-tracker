import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { fetchMe, login as apiLogin, Usuario } from '../lib/api';

interface AuthContextValue {
  usuario: Usuario | null;
  status: 'loading' | 'authenticated' | 'anonymous';
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [status, setStatus] = useState<AuthContextValue['status']>('loading');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setStatus('anonymous');
      return;
    }

    fetchMe()
      .then((me) => {
        setUsuario((prev) => ({ ...me, email: prev?.email ?? '' }));
        setStatus('authenticated');
      })
      .catch(() => {
        localStorage.removeItem('token');
        setStatus('anonymous');
      });
  }, []);

  async function login(email: string, senha: string) {
    const { token, usuario: usuarioLogado } = await apiLogin(email, senha);
    localStorage.setItem('token', token);
    setUsuario(usuarioLogado);
    setStatus('authenticated');
  }

  function logout() {
    localStorage.removeItem('token');
    setUsuario(null);
    setStatus('anonymous');
  }

  return (
    <AuthContext.Provider value={{ usuario, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return ctx;
}
