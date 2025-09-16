import React, { useState, useEffect, useCallback } from 'react';
import AgendaSemanal from '@/components/AgendaSemanal';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Plus, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sessao, CalendarEvent } from '@/types';
import { moverSessaoApi, atualizarStatusSessao } from '@/services/api';
import { mockApiCalls } from '@/data/demoData';
import { toast } from 'sonner';
import moment from 'moment';

interface CalendarioPageProps {
  onAddSessao: (date: Date) => void;
  onEditSessao: (sessao: Sessao) => void;
}

export default function CalendarioPage({ onAddSessao, onEditSessao }: CalendarioPageProps) {
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const carregarSessoes = useCallback(async () => {
    setIsLoading(true);
    try {
      // Para desenvolvimento, usar dados de mock
      const inicioSemana = moment().startOf('week').format('YYYY-MM-DD');
      const fimSemana = moment().endOf('week').format('YYYY-MM-DD');
      
      const sessoesCarregadas = await mockApiCalls.getSessoesPorPeriodo(inicioSemana, fimSemana);
      setSessoes(sessoesCarregadas);
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
      toast.error('Erro ao carregar sessões. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [refreshKey]);

  useEffect(() => {
    carregarSessoes();
  }, [carregarSessoes]);

  const handleEventDrop = useCallback(async (event: CalendarEvent, newStart: Date, newEnd: Date) => {
    try {
      const novoInicio = moment(newStart).format('YYYY-MM-DDTHH:mm:ss');
      const novoFim = moment(newEnd).format('YYYY-MM-DDTHH:mm:ss');
      
      // Para desenvolvimento, usar mock API
      await mockApiCalls.moverSessao(event.id, novoInicio, novoFim);
      
      // Atualizar estado local
      setSessoes(prev => prev.map(sessao => 
        sessao.id === event.id 
          ? { ...sessao, dataHoraInicio: novoInicio, dataHoraFim: novoFim }
          : sessao
      ));
      
      toast.success('Sessão reagendada com sucesso!');
    } catch (error) {
      console.error('Erro ao mover sessão:', error);
      toast.error('Erro ao reagendar sessão. Tente novamente.');
      throw error; // Re-throw para que o componente AgendaSemanal possa reverter
    }
  }, []);

  const handleEventResize = useCallback(async (event: CalendarEvent, newStart: Date, newEnd: Date) => {
    try {
      const novoInicio = moment(newStart).format('YYYY-MM-DDTHH:mm:ss');
      const novoFim = moment(newEnd).format('YYYY-MM-DDTHH:mm:ss');
      
      // Para desenvolvimento, usar mock API
      await mockApiCalls.moverSessao(event.id, novoInicio, novoFim);
      
      // Atualizar estado local
      setSessoes(prev => prev.map(sessao => 
        sessao.id === event.id 
          ? { ...sessao, dataHoraInicio: novoInicio, dataHoraFim: novoFim }
          : sessao
      ));
      
      toast.success('Duração da sessão atualizada!');
    } catch (error) {
      console.error('Erro ao redimensionar sessão:', error);
      toast.error('Erro ao alterar duração. Tente novamente.');
      throw error;
    }
  }, []);

  const handleEventSelect = useCallback((event: CalendarEvent) => {
    // Implementar seleção de evento se necessário
    console.log('Evento selecionado:', event);
  }, []);

  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date }) => {
    onAddSessao(slotInfo.start);
  }, [onAddSessao]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Calendário</h1>
            <p className="text-muted-foreground">
              Gerencie suas sessões de fisioterapia
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={() => onAddSessao(new Date())}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Sessão
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agenda Semanal</CardTitle>
          <CardDescription>
            Arraste e solte para reagendar sessões. Redimensione para alterar a duração.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <AgendaSemanal
            sessoes={sessoes}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            onEventSelect={handleEventSelect}
            onSelectSlot={handleSelectSlot}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}