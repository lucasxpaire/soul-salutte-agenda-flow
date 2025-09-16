import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer, View, Event } from 'react-big-calendar';
import withDragAndDrop, { DragAndDropCalendarProps } from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { Sessao, CalendarEvent, AgendaSemanalProps } from '@/types';
import { StatusSessao } from '@/data/demoData';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, User, Edit, Trash2, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

// Configurar o localizador em português
moment.locale('pt-br');
const localizer = momentLocalizer(moment);

// Componente de calendário com drag and drop
const DragAndDropCalendar = withDragAndDrop(Calendar);

// Mensagens customizadas em português
const messages = {
  allDay: 'Dia todo',
  previous: 'Anterior',
  next: 'Próximo',
  today: 'Hoje',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Sessão',
  noEventsInRange: 'Não há sessões neste período.',
  showMore: (count: number) => `+ ${count} mais`,
};

// Formatos de data em português
const formats = {
  dateFormat: 'dd',
  dayFormat: (date: Date, culture?: string) => 
    moment(date).format('dddd DD/MM'),
  dayHeaderFormat: (date: Date, culture?: string) => 
    moment(date).format('dddd DD/MM'),
  dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }, culture?: string) =>
    `${moment(start).format('DD MMM')} - ${moment(end).format('DD MMM YYYY')}`,
  timeGutterFormat: (date: Date, culture?: string) => 
    moment(date).format('HH:mm'),
  eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }, culture?: string) =>
    `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
};

interface AgendaSemanalState {
  loadingEventId: number | null;
  selectedEvent: CalendarEvent | null;
  showEventPopover: boolean;
}

export default function AgendaSemanal({
  sessoes,
  onEventDrop,
  onEventResize,
  onEventSelect,
  onSelectSlot,
  isLoading = false,
}: AgendaSemanalProps) {
  const [state, setState] = useState<AgendaSemanalState>({
    loadingEventId: null,
    selectedEvent: null,
    showEventPopover: false,
  });

  // Converter sessões para eventos do calendário
  const events: CalendarEvent[] = useMemo(() => {
    return sessoes.map((sessao) => ({
      id: sessao.id!,
      title: sessao.cliente?.nome || 'Cliente não informado',
      start: new Date(sessao.dataHoraInicio),
      end: new Date(sessao.dataHoraFim),
      resource: sessao,
    }));
  }, [sessoes]);

  // Função para obter cor baseada no status
  const getEventStyle = useCallback((event: CalendarEvent) => {
    const status = event.resource.status;
    const isLoading = state.loadingEventId === event.id;
    
    let backgroundColor = 'hsl(var(--primary))';
    let borderColor = 'hsl(var(--primary))';
    
    switch (status) {
      case StatusSessao.CONCLUIDA:
        backgroundColor = 'hsl(var(--secondary))';
        borderColor = 'hsl(var(--secondary))';
        break;
      case StatusSessao.CANCELADA:
        backgroundColor = 'hsl(var(--destructive))';
        borderColor = 'hsl(var(--destructive))';
        break;
      case StatusSessao.FALTA:
        backgroundColor = 'hsl(var(--muted-foreground))';
        borderColor = 'hsl(var(--muted-foreground))';
        break;
      default: // AGENDADA
        backgroundColor = 'hsl(var(--primary))';
        borderColor = 'hsl(var(--primary))';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        opacity: isLoading ? 0.6 : 1,
        cursor: isLoading ? 'not-allowed' : 'move',
        fontSize: '12px',
        padding: '2px 4px',
        borderRadius: '6px',
        border: `1px solid ${borderColor}`,
        transition: 'all 0.15s ease-out',
      },
    };
  }, [state.loadingEventId]);

  // Handler para arrastar e soltar eventos
  const handleEventDrop = useCallback(async ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
    if (!onEventDrop) return;

    setState(prev => ({ ...prev, loadingEventId: event.id }));

    try {
      await onEventDrop(event, start, end);
      toast.success('Sessão reagendada com sucesso!', {
        className: 'soul-toast-success',
      });
    } catch (error) {
      console.error('Erro ao reagendar sessão:', error);
      toast.error('Falha ao reagendar a sessão. Tente novamente.', {
        className: 'soul-toast-error',
      });
    } finally {
      setState(prev => ({ ...prev, loadingEventId: null }));
    }
  }, [onEventDrop]);

  // Handler para redimensionar eventos
  const handleEventResize = useCallback(async ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
    if (!onEventResize) return;

    setState(prev => ({ ...prev, loadingEventId: event.id }));

    try {
      await onEventResize(event, start, end);
      toast.success('Duração da sessão atualizada!', {
        className: 'soul-toast-success',
      });
    } catch (error) {
      console.error('Erro ao redimensionar sessão:', error);
      toast.error('Falha ao alterar a duração. Tente novamente.', {
        className: 'soul-toast-error',
      });
    } finally {
      setState(prev => ({ ...prev, loadingEventId: null }));
    }
  }, [onEventResize]);

  // Handler para selecionar evento
  const handleEventSelect = useCallback((event: CalendarEvent) => {
    setState(prev => ({
      ...prev,
      selectedEvent: event,
      showEventPopover: true,
    }));
    
    if (onEventSelect) {
      onEventSelect(event);
    }
  }, [onEventSelect]);

  // Handler para atualizar status da sessão
  const handleStatusChange = useCallback(async (newStatus: StatusSessao) => {
    if (!state.selectedEvent) return;

    setState(prev => ({ ...prev, loadingEventId: state.selectedEvent!.id }));

    try {
      // Importar e usar mock API para desenvolvimento
      const { mockApiCalls } = await import('@/data/demoData');
      await mockApiCalls.atualizarStatusSessao(state.selectedEvent.id, newStatus);
      
      toast.success(`Status atualizado para ${newStatus}!`, {
        className: 'soul-toast-success',
      });
      
      setState(prev => ({ ...prev, showEventPopover: false, selectedEvent: null }));
      
      // Recarregar dados para atualizar a interface
      window.location.reload();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Falha ao atualizar status. Tente novamente.', {
        className: 'soul-toast-error',
      });
    } finally {
      setState(prev => ({ ...prev, loadingEventId: null }));
    }
  }, [state.selectedEvent]);

  // Componente customizado do evento
  const EventComponent = useCallback(({ event }: { event: CalendarEvent }) => {
    const status = event.resource.status;
    const isLoading = state.loadingEventId === event.id;
    
    return (
      <div className={`h-full w-full ${isLoading ? 'soul-loading' : ''}`}>
        <div className="flex items-center gap-1 text-xs">
          <User className="h-3 w-3" />
          <span className="truncate">{event.title}</span>
        </div>
        <div className="flex items-center gap-1 text-xs opacity-90">
          <Clock className="h-3 w-3" />
          <span>
            {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
          </span>
        </div>
        {status !== StatusSessao.AGENDADA && (
          <Badge 
            variant="secondary" 
            className="text-xs mt-1 bg-white/20 text-white border-white/30"
          >
            {status}
          </Badge>
        )}
      </div>
    );
  }, [state.loadingEventId]);

  return (
    <div className="soul-card h-[600px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Agenda Semanal</h2>
        </div>
        
        {/* Legenda de status */}
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-primary"></div>
            <span>Agendada</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-secondary"></div>
            <span>Concluída</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-destructive"></div>
            <span>Cancelada</span>
          </div>
        </div>
      </div>

      <div className={`h-[calc(100%-80px)] ${isLoading ? 'soul-loading' : ''}`}>
        <DragAndDropCalendar
          localizer={localizer}
          events={events}
          defaultView="week"
          views={['week', 'day']}
          step={15}
          timeslots={4}
          min={new Date(2024, 0, 1, 7, 0)} // 7:00 AM
          max={new Date(2024, 0, 1, 20, 0)} // 8:00 PM
          messages={messages}
          formats={formats}
          culture="pt-BR"
          
          // Drag and Drop
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          resizable={true}
          
          // Event handling
          onSelectEvent={handleEventSelect}
          onSelectSlot={onSelectSlot}
          selectable={true}
          
          // Styling
          eventPropGetter={getEventStyle}
          components={{
            event: EventComponent,
          }}
          
          // Accessibility
          accessors={{
            start: 'start',
            end: 'end',
            title: 'title',
          }}
        />
      </div>

      {/* Popover para ações rápidas */}
      {state.selectedEvent && (
        <Popover 
          open={state.showEventPopover} 
          onOpenChange={(open) => setState(prev => ({ ...prev, showEventPopover: open }))}
        >
          <PopoverTrigger asChild>
            <div className="hidden" />
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="center">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{state.selectedEvent.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {moment(state.selectedEvent.start).format('dddd, DD/MM/YYYY')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {moment(state.selectedEvent.start).format('HH:mm')} - {moment(state.selectedEvent.end).format('HH:mm')}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Status da Sessão:</label>
                <Select
                  value={state.selectedEvent.resource.status}
                  onValueChange={(value) => handleStatusChange(value as StatusSessao)}
                  disabled={state.loadingEventId === state.selectedEvent.id}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={StatusSessao.AGENDADA}>Agendada</SelectItem>
                    <SelectItem value={StatusSessao.CONCLUIDA}>Concluída</SelectItem>
                    <SelectItem value={StatusSessao.CANCELADA}>Cancelada</SelectItem>
                    <SelectItem value={StatusSessao.FALTA}>Falta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button variant="destructive" size="sm" className="flex-1">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}