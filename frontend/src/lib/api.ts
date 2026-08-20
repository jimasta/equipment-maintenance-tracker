const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Erro inesperado' }));
    throw new ApiError(body.error ?? 'Erro inesperado');
  }

  return res.json() as Promise<T>;
}

export type Papel = 'TECNICO' | 'SUPERVISOR' | 'GESTOR';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
}

export function login(email: string, senha: string) {
  return request<{ token: string; usuario: Usuario }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  });
}

export function fetchMe() {
  return request<Omit<Usuario, 'email'>>('/me');
}
