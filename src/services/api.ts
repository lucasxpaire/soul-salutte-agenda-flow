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
// Mock de avaliações fisioterapêuticas
const mockAvaliacoes: AvaliacaoFisioterapeutica[] = [
  {
    id: 1,
    clienteId: 1,
    dataAvaliacao: '2024-01-15',
    diagnosticoClinico: 'Lombalgia mecânica',
    diagnosticoFisioterapeutico: 'Lombalgia crônica com limitação funcional',
    historiaClinica: 'Paciente com histórico de dor lombar crônica',
    queixaPrincipal: 'Dor lombar há 6 meses',
    habitosVida: 'Sedentário, trabalha sentado 8h/dia',
    hma: 'Paciente relata dor lombar constante há 6 meses, iniciada após esforço físico no trabalho.',
    hmp: 'Nega histórico de lesões lombares prévias',
    antecedentesPessoais: 'Nega cirurgias prévias. Histórico de hipertensão controlada.',
    antecedentesFamiliares: 'Pai com histórico de lombalgia',
    tratamentosRealizados: 'Uso de anti-inflamatórios e relaxante muscular',
    
    deambulando: true,
    deambulandoComApoio: false,
    cadeiraDeRodas: false,
    internado: false,
    orientado: true,
    
    temExamesComplementares: true,
    examesComplementaresDescricao: 'RX lombar sem alterações significativas',
    
    usaMedicamentos: true,
    medicamentosDescricao: 'Ibuprofeno 600mg 12/12h',
    
    realizouCirurgia: false,
    cirurgiasDescricao: '',
    
    inspecaoNormal: false,
    inspecaoEdema: false,
    inspecaoCicatrizacaoIncompleta: false,
    inspecaoEritemas: false,
    inspecaoOutros: true,
    inspecaoOutrosDescricao: 'Tensão muscular paravertebral',
    
    semiologia: 'Teste de Lasègue negativo, flexão lombar limitada',
    testesEspecificos: 'Teste de elevação da perna estendida negativo',
    avaliacaoDor: 7,
    
    objetivosTratamento: 'Reduzir dor, melhorar mobilidade lombar, fortalecimento do core',
    recursosTerapeuticos: 'Cinesioterapia, mobilização articular, fortalecimento',
    planoTratamento: 'Exercícios de mobilização, fortalecimento e reeducação postural',
    
    evolucoes: [
      {
        id: 1,
        evolucao: 'Paciente apresentou melhora de 30% da dor após primeira sessão',
        dataEvolucao: '2024-01-20'
      },
      {
        id: 2,
        evolucao: 'Aumento da amplitude de movimento. Dor reduzida para escala 5',
        dataEvolucao: '2024-01-25'
      }
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-25T15:30:00Z'
  },
  {
    id: 2,
    clienteId: 2,
    dataAvaliacao: '2024-02-01',
    diagnosticoClinico: 'Síndrome do impacto',
    diagnosticoFisioterapeutico: 'Síndrome do ombro doloroso',
    historiaClinica: 'Dor progressiva no ombro direito',
    queixaPrincipal: 'Dor no ombro direito com limitação de movimento',
    habitosVida: 'Ativo, pratica tênis 3x/semana',
    hma: 'Dor no ombro direito há 3 meses, iniciada gradualmente. Piora com movimentos acima da cabeça.',
    hmp: 'Nega lesões prévias no ombro',
    antecedentesPessoais: 'Diabetes tipo 2 controlada',
    antecedentesFamiliares: 'Nega',
    tratamentosRealizados: 'Fisioterapia há 1 mês sem melhora significativa',
    
    deambulando: true,
    deambulandoComApoio: false,
    cadeiraDeRodas: false,
    internado: false,
    orientado: true,
    
    temExamesComplementares: true,
    examesComplementaresDescricao: 'Ultrassom de ombro com sinais de tendinopatia',
    
    usaMedicamentos: false,
    medicamentosDescricao: '',
    
    realizouCirurgia: false,
    cirurgiasDescricao: '',
    
    inspecaoNormal: false,
    inspecaoEdema: false,
    inspecaoCicatrizacaoIncompleta: false,
    inspecaoEritemas: false,
    inspecaoOutros: true,
    inspecaoOutrosDescricao: 'Atrofia discreta do músculo supraespinhal',
    
    semiologia: 'Teste de Neer positivo, teste de Hawkins positivo',
    testesEspecificos: 'Jobe test positivo para supraespinhal',
    avaliacaoDor: 6,
    
    objetivosTratamento: 'Reduzir dor, restaurar amplitude de movimento, fortalecimento do manguito rotador',
    recursosTerapeuticos: 'Mobilização articular, exercícios pendulares, fortalecimento progressivo',
    planoTratamento: 'Mobilização articular, exercícios pendulares, fortalecimento progressivo',
    
    evolucoes: [],
    createdAt: '2024-02-01T14:00:00Z',
    updatedAt: '2024-02-01T14:00:00Z'
  }
];

export const getAvaliacoesByCliente = async (clienteId: number): Promise<AvaliacaoFisioterapeutica[]> => {
  // Para desenvolvimento, usar dados mock
  return mockAvaliacoes.filter(avaliacao => avaliacao.clienteId === clienteId);
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