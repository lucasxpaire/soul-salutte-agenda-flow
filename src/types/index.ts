// Soul Saluttē - Sistema de Gestão para Clínica de Fisioterapia
// TypeScript Types and Interfaces

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  dataCadastro: string;
  sexo: 'M' | 'F' | 'Outro';
  cidade: string;
  bairro: string;
  profissao: string;
  enderecoResidencial: string;
  enderecoComercial: string;
  naturalidade: string;
  estadoCivil: 'Solteiro' | 'Casado' | 'Divorciado' | 'Viúvo' | 'União Estável';
}

export interface Evolucao {
  id: number;
  evolucao: string;
  dataEvolucao: string;
}

export interface Sessao {
  id: number;
  nome: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  status: 'AGENDADA' | 'CONCLUIDA' | 'CANCELADA' | 'FALTA';
  notasSessao: string;
  clienteId: number;
  notificacao?: boolean; 
}

export enum StatusSessao {
  AGENDADA = 'AGENDADA',
  CONCLUIDA = 'CONCLUIDA',
  CANCELADA = 'CANCELADA',
  FALTA = 'FALTA'
}

export interface AvaliacaoFisioterapeutica {
  id: number;
  clienteId: number;
  dataAvaliacao: string;
  
  // 2.0 AVALIAÇÃO
  diagnosticoClinico: string;
  diagnosticoFisioterapeutico: string;
  historiaClinica: string;
  queixaPrincipal: string;
  habitosVida: string;
  hma: string; // História da Moléstia Atual
  hmp: string; // História da Moléstia Pregressa
  antecedentesPessoais: string;
  antecedentesFamiliares: string;
  tratamentosRealizados: string;

  // 3.0 EXAME CLÍNICO/FÍSICO
  // 3.1 Apresentação
  deambulando: boolean;
  deambulandoComApoio: boolean;
  cadeiraDeRodas: boolean;
  internado: boolean;
  orientado: boolean;
  
  // 3.2 Exames
  temExamesComplementares: boolean;
  examesComplementaresDescricao: string;

  // 3.3 Medicamentos
  usaMedicamentos: boolean;
  medicamentosDescricao: string;

  // 3.4 Cirurgias
  realizouCirurgia: boolean;
  cirurgiasDescricao: string;

  // 3.5 Inspeção/Palpação
  inspecaoNormal: boolean;
  inspecaoEdema: boolean;
  inspecaoCicatrizacaoIncompleta: boolean;
  inspecaoEritemas: boolean;
  inspecaoOutros: boolean;
  inspecaoOutrosDescricao: string;

  // 3.6, 3.7, 3.8
  semiologia: string;
  testesEspecificos: string;
  avaliacaoDor: number; // 0-10

  // 4.0 PLANO TERAPÊUTICO
  objetivosTratamento: string;
  recursosTerapeuticos: string;
  planoTratamento: string;

  evolucoes: Evolucao[];
  createdAt: string;
  updatedAt: string;
}

export interface FormSessaoData {
  clienteId: number;
  dataHoraInicio: string;
  dataHoraFim: string;
  tipo: string;
  observacoes?: string;
  valor?: number;
}

export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: Sessao;
  action?: 'edit' | 'delete';
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface DashboardStats {
  totalClientes: number;
  sessoesHoje: number;
  sessoesSemana: number;
  taxaConclusao: number;
}

// Context Types
export interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  user: User | null;
  isLoading: boolean;
}

export interface User {
  id: number;
  username: string;
  nome: string;
  email: string;
  role: string;
}

// Component Props Types
export interface AgendaSemanalProps {
  sessoes: Sessao[];
  onEventDrop?: (event: CalendarEvent, newDate: Date, newEndDate?: Date) => Promise<void>;
  onEventResize?: (event: CalendarEvent, newStart: Date, newEnd: Date) => Promise<void>;
  onEventSelect?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  isLoading?: boolean;
}

export interface SessaoFormProps {
  onSubmit: (data: FormSessaoData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<FormSessaoData>;
  clientes: Cliente[];
  isLoading?: boolean;
}

export interface ClienteFormProps {
  onSubmit: (data: Cliente) => Promise<void>;
  onCancel: () => void;
  initialData?: Cliente;
  isLoading?: boolean;
}

// API Error Types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// Calendar View Types
export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

// Notification Types
export interface NotificationOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}