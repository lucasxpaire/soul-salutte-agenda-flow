import { Cliente, Sessao, DashboardStats } from '@/types';
import moment from 'moment';

// Status enum for demo data
export enum StatusSessao {
  AGENDADA = 'AGENDADA',
  CONCLUIDA = 'CONCLUIDA', 
  CANCELADA = 'CANCELADA',
  FALTA = 'FALTA'
}

// Dados de demonstração para desenvolvimento/teste

export const demoClientes: Cliente[] = [
  {
    id: 1,
    nome: 'Maria Silva Santos',
    email: 'maria.silva@email.com',
    telefone: '(11) 99876-5432',
    dataNascimento: '1985-03-15',
    dataCadastro: '2024-01-15',
    sexo: 'F',
    cidade: 'São Paulo',
    bairro: 'Centro',
    profissao: 'Professora',
    enderecoResidencial: 'Rua das Flores, 123',
    enderecoComercial: 'Escola Municipal ABC',
    naturalidade: 'Brasileira',
    estadoCivil: 'Casado',
  },
  {
    id: 2,
    nome: 'João Carlos Oliveira',
    email: 'joao.carlos@email.com',
    telefone: '(11) 98765-4321',
    dataNascimento: '1978-08-22',
    dataCadastro: '2024-02-01',
    sexo: 'M',
    cidade: 'São Paulo',
    bairro: 'Vila Madalena',
    profissao: 'Engenheiro',
    enderecoResidencial: 'Av. Principal, 456',
    enderecoComercial: 'Empresa XYZ Ltda',
    naturalidade: 'Brasileira',
    estadoCivil: 'Solteiro',
  },
  {
    id: 3,
    nome: 'Ana Paula Ferreira',
    email: 'ana.paula@email.com',
    telefone: '(11) 97654-3210',
    dataNascimento: '1992-12-10',
    dataCadastro: '2024-02-10',
    sexo: 'F',
    cidade: 'São Paulo',
    bairro: 'Moema',
    profissao: 'Advogada',
    enderecoResidencial: 'Rua da Alegria, 789',
    enderecoComercial: 'Escritório Jurídico ABC',
    naturalidade: 'Brasileira',
    estadoCivil: 'Divorciado',
  },
  {
    id: 4,
    nome: 'Roberto Costa',
    email: 'roberto.costa@email.com',
    telefone: '(11) 96543-2109',
    dataNascimento: '1960-05-30',
    dataCadastro: '2024-01-20',
    sexo: 'M',
    cidade: 'São Paulo',
    bairro: 'Liberdade',
    profissao: 'Aposentado',
    enderecoResidencial: 'Praça Central, 321',
    enderecoComercial: '',
    naturalidade: 'Brasileira',
    estadoCivil: 'Viúvo',
  },
  {
    id: 5,
    nome: 'Carla Mendes',
    email: 'carla.mendes@email.com',
    telefone: '(11) 95432-1098',
    dataNascimento: '1988-09-18',
    dataCadastro: '2024-02-15',
    sexo: 'F',
    cidade: 'São Paulo',
    bairro: 'Pinheiros',
    profissao: 'Designer',
    enderecoResidencial: 'Rua Nova, 654',
    enderecoComercial: 'Studio Design Criativo',
    naturalidade: 'Brasileira',
    estadoCivil: 'União Estável',
  },
];

// Gerar sessões de demonstração para a semana atual
export const gerarSessoesDemoSemana = (): Sessao[] => {
  const sessoes: Sessao[] = [];
  const inicioSemana = moment().startOf('week');
  
  // Horários padrão: 8h, 9h, 10h, 14h, 15h, 16h, 17h
  const horarios = [8, 9, 10, 14, 15, 16, 17];
  
  // Segunda a Sexta
  for (let dia = 1; dia <= 5; dia++) {
    const dataAtual = inicioSemana.clone().add(dia, 'days');
    
    // Adicionar algumas sessões aleatórias por dia
    const numSessoes = Math.floor(Math.random() * 4) + 2; // 2-5 sessões por dia
    const horariosUsados = horarios
      .sort(() => 0.5 - Math.random())
      .slice(0, numSessoes);
    
    horariosUsados.forEach((hora, index) => {
      const cliente = demoClientes[Math.floor(Math.random() * demoClientes.length)];
      const inicio = dataAtual.clone().hour(hora).minute(0).second(0);
      const fim = inicio.clone().add(1, 'hour');
      
      // Definir status baseado na data
      let status = StatusSessao.AGENDADA;
      if (dataAtual.isBefore(moment(), 'day')) {
        // Sessões passadas - maioria concluída
        const rand = Math.random();
        if (rand < 0.8) status = StatusSessao.CONCLUIDA;
        else if (rand < 0.95) status = StatusSessao.FALTA;
        else status = StatusSessao.CANCELADA;
      } else if (dataAtual.isSame(moment(), 'day') && hora < moment().hour()) {
        // Sessões de hoje que já passaram
        status = Math.random() < 0.9 ? StatusSessao.CONCLUIDA : StatusSessao.FALTA;
      }
      
      sessoes.push({
        id: sessoes.length + 1,
        clienteId: cliente.id!,
        nome: `${cliente.nome} - Fisioterapia`,
        dataHoraInicio: inicio.format('YYYY-MM-DDTHH:mm:ss'),
        dataHoraFim: fim.format('YYYY-MM-DDTHH:mm:ss'),
        status: status as 'AGENDADA' | 'CONCLUIDA' | 'CANCELADA',
        notasSessao: `Sessão de fisioterapia - ${cliente.nome}`,
        notificacao: true,
      });
    });
  }
  
  return sessoes.sort((a, b) => 
    moment(a.dataHoraInicio).valueOf() - moment(b.dataHoraInicio).valueOf()
  );
};

export const demoSessoes = gerarSessoesDemoSemana();

export const demoStats: DashboardStats = {
  totalClientes: demoClientes.length,
  sessoesHoje: demoSessoes.filter(s => 
    moment(s.dataHoraInicio).isSame(moment(), 'day')
  ).length,
  sessoesSemana: demoSessoes.length,
  taxaConclusao: Math.round((demoSessoes.filter(s => s.status === 'CONCLUIDA').length / demoSessoes.length) * 100),
};

// Simular chamadas de API com delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock APIs para desenvolvimento
export const mockApiCalls = {
  async getSessoesPorPeriodo(inicio: string, fim: string): Promise<Sessao[]> {
    await delay(500);
    return demoSessoes.filter(sessao => {
      const dataInicio = moment(sessao.dataHoraInicio);
      return dataInicio.isBetween(moment(inicio), moment(fim), 'day', '[]');
    });
  },

  async moverSessao(id: number, novoInicio: string, novoFim: string): Promise<Sessao> {
    await delay(300);
    const sessaoIndex = demoSessoes.findIndex(s => s.id === id);
    if (sessaoIndex === -1) {
      throw new Error('Sessão não encontrada');
    }
    
    demoSessoes[sessaoIndex] = {
      ...demoSessoes[sessaoIndex],
      dataHoraInicio: novoInicio,
      dataHoraFim: novoFim,
    };
    
    return demoSessoes[sessaoIndex];
  },

  async atualizarStatusSessao(id: number, status: 'AGENDADA' | 'CONCLUIDA' | 'CANCELADA'): Promise<Sessao> {
    await delay(300);
    const sessaoIndex = demoSessoes.findIndex(s => s.id === id);
    if (sessaoIndex === -1) {
      throw new Error('Sessão não encontrada');
    }
    
    demoSessoes[sessaoIndex] = {
      ...demoSessoes[sessaoIndex],
      status: status,
    };
    
    return demoSessoes[sessaoIndex];
  },

  async getStats(): Promise<DashboardStats> {
    await delay(400);
    return demoStats;
  },

  async getClientes(): Promise<Cliente[]> {
    await delay(300);
    return demoClientes;
  },
};