import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  Clock, 
  Plus, 
  TrendingUp,
  Activity
} from 'lucide-react';
import { DashboardStats, Sessao } from '@/types';
import { mockApiCalls, demoStats, demoSessoes } from '@/data/demoData';
import { toast } from 'sonner';
import moment from 'moment';
import 'moment/locale/pt-br';

moment.locale('pt-br');

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalClientes: 0,
    sessoesHoje: 0,
    sessoesSemana: 0,
    taxaConclusao: 0,
  });
  const [sessoesHoje, setSessoesHoje] = useState<Sessao[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setIsLoading(true);

        // Carregar estatísticas (usando dados de demonstração)
        const statsData = await mockApiCalls.getStats();
        setStats(statsData);

        // Carregar sessões de hoje
        const hoje = moment().format('YYYY-MM-DD');
        const amanha = moment().add(1, 'day').format('YYYY-MM-DD');
        const sessoesData = await mockApiCalls.getSessoesPorPeriodo(hoje, amanha);
        setSessoesHoje(Array.isArray(sessoesData) ? sessoesData : []);

      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        toast.error('Erro ao carregar dados do dashboard', {
          className: 'soul-toast-error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, []);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONCLUIDA':
        return 'bg-secondary text-secondary-foreground';
      case 'CANCELADA':
        return 'bg-destructive text-destructive-foreground';
      case 'FALTA':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="soul-card">
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao Soul Saluttē - {moment().format('dddd, DD [de] MMMM [de] YYYY')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => onNavigate('agenda')}
            className="soul-button-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Sessão
          </Button>
          <Button 
            variant="outline"
            onClick={() => onNavigate('clientes')}
          >
            <Users className="h-4 w-4 mr-2" />
            Clientes
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="soul-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClientes}</div>
            <p className="text-xs text-muted-foreground">
              Clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card className="soul-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sessoesHoje}</div>
            <p className="text-xs text-muted-foreground">
              Agendamentos para hoje
            </p>
          </CardContent>
        </Card>

        <Card className="soul-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões da Semana</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sessoesSemana}</div>
            <p className="text-xs text-muted-foreground">
              Nesta semana
            </p>
          </CardContent>
        </Card>

        <Card className="soul-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              <Activity className="h-3 w-3 inline mr-1" />
              Sessões concluídas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sessões de Hoje */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="soul-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Sessões de Hoje
            </CardTitle>
            <CardDescription>
              {sessoesHoje.length} sessão(ões) agendada(s) para hoje
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessoesHoje.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma sessão agendada para hoje</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {sessoesHoje.map((sessao) => (
                  <div
                    key={sessao.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{sessao.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {moment(sessao.dataHoraInicio).format('HH:mm')} - {moment(sessao.dataHoraFim).format('HH:mm')}
                      </p>
                    </div>
                    <Badge className={getStatusColor(sessao.status)}>
                      {sessao.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="soul-card">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => onNavigate('agenda')}
              className="w-full justify-start"
              variant="outline"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Ir para Agenda
            </Button>
            <Button 
              onClick={() => onNavigate('clientes')}
              className="w-full justify-start"
              variant="outline"
            >
              <Users className="h-4 w-4 mr-2" />
              Gerenciar Clientes
            </Button>
            <Button 
              onClick={() => onNavigate('agenda')}
              className="w-full justify-start"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Sessão
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}