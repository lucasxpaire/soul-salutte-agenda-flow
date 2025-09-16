import axios, { AxiosResponse } from 'axios';
import { Cliente, Sessao, Avaliacao, ApiResponse, FormSessaoData, DashboardStats } from '@/types';

// Configuração base do Axios
const api = axios.create({
  baseURL: '/api', // Vite proxy configurado para redirecionar para localhost:8080
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador para adicionar token de autenticação se necessário
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptador de resposta para tratamento global de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// =============================================================================
// CLIENTES API
// =============================================================================

export const clienteApi = {
  listar: (): Promise<AxiosResponse<Cliente[]>> => 
    api.get('/clientes'),

  buscar: (id: number): Promise<AxiosResponse<Cliente>> => 
    api.get(`/clientes/${id}`),

  criar: (cliente: Cliente): Promise<AxiosResponse<Cliente>> => 
    api.post('/clientes', cliente),

  atualizar: (id: number, cliente: Cliente): Promise<AxiosResponse<Cliente>> => 
    api.put(`/clientes/${id}`, cliente),

  excluir: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`/clientes/${id}`),

  buscarPorNome: (nome: string): Promise<AxiosResponse<Cliente[]>> => 
    api.get(`/clientes/buscar?nome=${encodeURIComponent(nome)}`),
};

// =============================================================================
// SESSÕES API
// =============================================================================

export const sessaoApi = {
  listar: (): Promise<AxiosResponse<Sessao[]>> => 
    api.get('/sessoes'),

  listarPorPeriodo: (inicio: string, fim: string): Promise<AxiosResponse<Sessao[]>> => 
    api.get(`/sessoes?inicio=${inicio}&fim=${fim}`),

  buscar: (id: number): Promise<AxiosResponse<Sessao>> => 
    api.get(`/sessoes/${id}`),

  criar: (sessao: FormSessaoData): Promise<AxiosResponse<Sessao>> => 
    api.post('/sessoes', sessao),

  atualizar: (id: number, sessao: Partial<Sessao>): Promise<AxiosResponse<Sessao>> => 
    api.put(`/sessoes/${id}`, sessao),

  excluir: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`/sessoes/${id}`),

  // Novo endpoint para mover sessão (drag and drop)
  mover: (id: number, novoInicio: string, novoFim: string): Promise<AxiosResponse<Sessao>> => 
    api.patch(`/sessoes/${id}/mover`, {
      dataHoraInicio: novoInicio,
      dataHoraFim: novoFim,
    }),

  // Novo endpoint para atualizar status
  atualizarStatus: (id: number, status: string): Promise<AxiosResponse<Sessao>> => 
    api.patch(`/sessoes/${id}/status`, { status }),

  listarPorCliente: (clienteId: number): Promise<AxiosResponse<Sessao[]>> => 
    api.get(`/sessoes/cliente/${clienteId}`),
};

// =============================================================================
// AVALIAÇÕES API
// =============================================================================

export const avaliacaoApi = {
  listar: (): Promise<AxiosResponse<Avaliacao[]>> => 
    api.get('/avaliacoes'),

  buscar: (id: number): Promise<AxiosResponse<Avaliacao>> => 
    api.get(`/avaliacoes/${id}`),

  criar: (avaliacao: Avaliacao): Promise<AxiosResponse<Avaliacao>> => 
    api.post('/avaliacoes', avaliacao),

  atualizar: (id: number, avaliacao: Avaliacao): Promise<AxiosResponse<Avaliacao>> => 
    api.put(`/avaliacoes/${id}`, avaliacao),

  excluir: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`/avaliacoes/${id}`),

  listarPorCliente: (clienteId: number): Promise<AxiosResponse<Avaliacao[]>> => 
    api.get(`/avaliacoes/cliente/${clienteId}`),
};

// =============================================================================
// DASHBOARD API
// =============================================================================

export const dashboardApi = {
  estatisticas: (): Promise<AxiosResponse<DashboardStats>> => 
    api.get('/dashboard/estatisticas'),
};

// =============================================================================
// AUTENTICAÇÃO API
// =============================================================================

export const authApi = {
  login: (username: string, password: string): Promise<AxiosResponse<{ token: string; user: any }>> => 
    api.post('/auth/login', { username, password }),

  logout: (): Promise<AxiosResponse<void>> => 
    api.post('/auth/logout'),

  verificarToken: (): Promise<AxiosResponse<{ valid: boolean; user: any }>> => 
    api.get('/auth/verify'),
};

// Funções utilitárias para tratamento de erros
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Erro desconhecido. Tente novamente.';
};

export const isNetworkError = (error: any): boolean => {
  return !error.response && error.code === 'NETWORK_ERROR';
};

export default api;