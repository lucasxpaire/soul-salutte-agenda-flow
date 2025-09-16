// Soul Saluttē - Sistema de Gestão para Clínica de Fisioterapia
// TypeScript Types and Interfaces

export interface Cliente {
  id?: number;
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  endereco: string;
  observacoes?: string;
  dataRegistro?: string;
}

export interface Sessao {
  id?: number;
  clienteId: number;
  cliente?: Cliente;
  dataHoraInicio: string;
  dataHoraFim: string;
  tipo: string;
  status: StatusSessao;
  observacoes?: string;
  valor?: number;
  googleEventId?: string;
}

export enum StatusSessao {
  AGENDADA = 'AGENDADA',
  CONCLUIDA = 'CONCLUIDA',
  CANCELADA = 'CANCELADA',
  FALTA = 'FALTA'
}

export interface Avaliacao {
  id?: number;
  clienteId: number;
  cliente?: Cliente;
  dataAvaliacao: string;
  queixaPrincipal: string;
  historiaClinica: string;
  exameFisico: string;
  diagnostico: string;
  planoTerapeutico: string;
  observacoes?: string;
  evolucao?: string;
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
  faturamentoMes: number;
}

// Context Types
export interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  user: User | null;
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