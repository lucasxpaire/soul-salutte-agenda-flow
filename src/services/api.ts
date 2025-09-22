import axios, { AxiosResponse } from 'axios';
import { Cliente, Sessao, AvaliacaoFisioterapeutica, ApiResponse, FormSessaoData, DashboardStats } from '@/types';

// Configuração base do Axios
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador para adicionar token de autenticação se necessário
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// =============================================================================
// CLIENTES API
// =============================================================================

// Funções para Clientes
export const getClientes = async (nome?: string): Promise<Cliente[]> => {
  // Para desenvolvimento, usar dados mock
  const { demoClientes } = await import('@/data/demoData');
  return demoClientes.filter(cliente => 
    !nome || cliente.nome.toLowerCase().includes(nome.toLowerCase())
  );
};

export const getClienteById = (id: number): Promise<Cliente> => {
  return api.get(`/clientes/${id}`).then(res => res.data);
};

export const createCliente = (cliente: Omit<Cliente, 'id' | 'dataCadastro'>): Promise<Cliente> => {
  return api.post('/clientes', cliente).then(res => res.data);
};

export const updateCliente = (id: number, cliente: Partial<Cliente>): Promise<Cliente> => {
  return api.put(`/clientes/${id}`, cliente).then(res => res.data);
};

export const deleteCliente = (id: number): Promise<void> => {
  return api.delete(`/clientes/${id}`);
};

// =============================================================================
// SESSÕES API
// =============================================================================

// Funções para Sessões
export const getSessoes = (): Promise<Sessao[]> => {
  return api.get('/sessoes').then(res => res.data);
};

export const getSessoesByClienteId = async (clienteId: number): Promise<Sessao[]> => {
    // Para desenvolvimento, usar dados mock
    const { demoSessoes } = await import('@/data/demoData');
    return demoSessoes.filter(sessao => sessao.clienteId === clienteId);
};

export const createSessao = (sessao: Omit<Sessao, 'id'>): Promise<Sessao> => {
    return api.post(`/sessoes/cliente/${sessao.clienteId}`, sessao).then(res => res.data);
};

export const updateSessao = (id: number, sessao: Partial<Sessao>): Promise<Sessao> => {
    return api.put(`/sessoes/${id}`, sessao).then(res => res.data);
};

export const deleteSessao = (id: number): Promise<void> => {
    return api.delete(`/sessoes/${id}`);
};

// Função para obter sessões por período
export const getSessoesPorPeriodo = async (inicio: string, fim: string): Promise<Sessao[]> => {
  const response = await api.get('/sessoes', {
    params: { inicio, fim }
  });
  return response.data;
};

// Novo endpoint para mover sessão (drag and drop)
export const moverSessaoApi = async (sessaoId: number, novoInicio: string, novoFim: string): Promise<Sessao> => {
  const response = await api.put(`/sessoes/${sessaoId}/mover`, {
    dataHoraInicio: novoInicio,
    dataHoraFim: novoFim,
  });
  return response.data;
};

// Novo endpoint para atualizar status
export const atualizarStatusSessao = (id: number, status: string): Promise<Sessao> => 
  api.patch(`/sessoes/${id}/status`, { status }).then(res => res.data);

// =============================================================================
// AVALIAÇÕES API
// =============================================================================

// Funções para Avaliações
export const getAvaliacoesByCliente = async (clienteId: number): Promise<AvaliacaoFisioterapeutica[]> => {
  // Para desenvolvimento, retornar array vazio
  return [];
};

export const createAvaliacao = (avaliacao: Omit<AvaliacaoFisioterapeutica, 'id'>): Promise<AvaliacaoFisioterapeutica> => {
    return api.post(`/avaliacoes/cliente/${avaliacao.clienteId}`, avaliacao).then(res => res.data);
};

export const updateAvaliacao = (id: number, avaliacao: Partial<AvaliacaoFisioterapeutica>): Promise<AvaliacaoFisioterapeutica> => {
    return api.put(`/avaliacoes/${id}`, avaliacao).then(res => res.data);
};

export const deleteAvaliacao = (id: number): Promise<void> => {
    return api.delete(`/avaliacoes/${id}`);
};

export const adicionarEvolucao = (avaliacaoId: number, texto: string): Promise<AvaliacaoFisioterapeutica> => {
    return api.post(`/avaliacoes/${avaliacaoId}/evolucoes`, { evolucao: texto }).then(res => res.data);
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