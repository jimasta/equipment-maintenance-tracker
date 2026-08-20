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

export interface Ativo {
  id: string;
  nome: string;
  tipo: string;
  localizacao: string;
  dataAquisicao: string;
  criadoEm: string;
  planosAtivos: number;
}

export interface AtivoInput {
  nome: string;
  tipo: string;
  localizacao: string;
  dataAquisicao: string;
}

export function fetchAtivos(filtros: { tipo?: string; localizacao?: string } = {}) {
  const params = new URLSearchParams();
  if (filtros.tipo) params.set('tipo', filtros.tipo);
  if (filtros.localizacao) params.set('localizacao', filtros.localizacao);
  const query = params.toString();
  return request<Ativo[]>(`/ativos${query ? `?${query}` : ''}`);
}

export function fetchAtivo(id: string) {
  return request<Ativo>(`/ativos/${id}`);
}

export function createAtivo(data: AtivoInput) {
  return request<Ativo>('/ativos', { method: 'POST', body: JSON.stringify(data) });
}

export function updateAtivo(id: string, data: AtivoInput) {
  return request<Ativo>(`/ativos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export type IntervaloTipo = 'DIAS' | 'HORAS_USO';

export interface PlanoManutencao {
  id: string;
  ativoId: string;
  intervaloTipo: IntervaloTipo;
  intervaloValor: number;
  estaAtivo: boolean;
}

export interface PlanoInput {
  ativoId: string;
  intervaloTipo: IntervaloTipo;
  intervaloValor: number;
}

export function fetchPlanos(ativoId: string) {
  return request<PlanoManutencao[]>(`/planos?ativoId=${ativoId}`);
}

export function createPlano(data: PlanoInput) {
  return request<PlanoManutencao>('/planos', { method: 'POST', body: JSON.stringify(data) });
}

export function desativarPlano(id: string) {
  return request<PlanoManutencao>(`/planos/${id}/desativar`, { method: 'PATCH' });
}
