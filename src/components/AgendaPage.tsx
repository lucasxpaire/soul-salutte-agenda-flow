import React, { useState, useEffect, useCallback } from 'react';
import AgendaSemanal from './AgendaSemanal';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, RefreshCw } from 'lucide-react';
import { Sessao, CalendarEvent, Cliente, FormSessaoData } from '@/types';
import { sessaoApi, clienteApi, handleApiError } from '@/services/api';
import { mockApiCalls } from '@/data/demoData';
import { toast } from 'sonner';
import moment from 'moment';

export default function AgendaPage() {
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      
      // Carregar sessões da semana atual
      const inicioSemana = moment().startOf('week').format('YYYY-MM-DD');
      const fimSemana = moment().endOf('week').format('YYYY-MM-DD');
      
      // Usar dados de demonstração para desenvolvimento
      const [sessoesData, clientesData] = await Promise.all([
        mockApiCalls.getSessoesPorPeriodo(inicioSemana, fimSemana),
        mockApiCalls.getClientes(),
      ]);

      setSessoes(sessoesData);
      setClientes(clientesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados da agenda', {
        className: 'soul-toast-error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const atualizarDados = async () => {
    try {
      setIsRefreshing(true);
      await carregarDados();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handler para arrastar e soltar sessões
  const handleEventDrop = useCallback(async (event: CalendarEvent, newStart: Date, newEnd?: Date) => {
    const sessaoId = event.id;
    const novoInicio = moment(newStart).format('YYYY-MM-DDTHH:mm:ss');
    const novoFim = moment(newEnd || moment(newStart).add(1, 'hour')).format('YYYY-MM-DDTHH:mm:ss');

    try {
      // Usar mock API para desenvolvimento
      const response = await mockApiCalls.moverSessao(sessaoId, novoInicio, novoFim);
      
      // Atualizar estado local
      setSessoes(prev => prev.map(sessao => 
        sessao.id === sessaoId 
          ? { ...sessao, dataHoraInicio: novoInicio, dataHoraFim: novoFim }
          : sessao
      ));

      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao mover sessão:', error);
      return Promise.reject(error);
    }
  }, []);

  // Handler para redimensionar sessões
  const handleEventResize = useCallback(async (event: CalendarEvent, newStart: Date, newEnd: Date) => {
    const sessaoId = event.id;
    const novoInicio = moment(newStart).format('YYYY-MM-DDTHH:mm:ss');
    const novoFim = moment(newEnd).format('YYYY-MM-DDTHH:mm:ss');

    try {
      // Usar mock API para desenvolvimento
      const response = await mockApiCalls.moverSessao(sessaoId, novoInicio, novoFim);
      
      // Atualizar estado local
      setSessoes(prev => prev.map(sessao => 
        sessao.id === sessaoId 
          ? { ...sessao, dataHoraInicio: novoInicio, dataHoraFim: novoFim }
          : sessao
      ));

      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao redimensionar sessão:', error);
      return Promise.reject(error);
    }
  }, []);

  // Handler para selecionar slot vazio (criar nova sessão)
  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date }) => {
    setShowNewSessionDialog(true);
  }, []);

  // Handler para selecionar evento existente
  const handleEventSelect = useCallback((event: CalendarEvent) => {
    // Por enquanto, apenas log - pode implementar modal de edição aqui
    console.log('Evento selecionado:', event);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenda de Sessões</h1>
          <p className="text-muted-foreground">
            Gerencie seus agendamentos com facilidade
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={atualizarDados}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Dialog open={showNewSessionDialog} onOpenChange={setShowNewSessionDialog}>
            <DialogTrigger asChild>
              <Button className="soul-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Nova Sessão
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Agendar Nova Sessão</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <p className="text-muted-foreground">
                  Funcionalidade de agendamento será implementada aqui.
                  Por enquanto, clique em um horário vazio no calendário.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Instruções */}
      <div className="bg-accent/50 border border-accent rounded-lg p-4">
        <h3 className="font-semibold text-accent-foreground mb-2">
          💡 Como usar a agenda interativa:
        </h3>
        <ul className="text-sm text-accent-foreground space-y-1">
          <li>• <strong>Arrastar e soltar:</strong> Clique e arraste uma sessão para reagendá-la</li>
          <li>• <strong>Redimensionar:</strong> Arraste a borda inferior para alterar a duração</li>
          <li>• <strong>Clique em sessão:</strong> Visualize detalhes e altere o status</li>
          <li>• <strong>Clique em horário vazio:</strong> Agende uma nova sessão</li>
        </ul>
      </div>

      {/* Calendário */}
      <AgendaSemanal
        sessoes={sessoes}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        onEventSelect={handleEventSelect}
        onSelectSlot={handleSelectSlot}
        isLoading={isLoading}
      />
    </div>
  );
}