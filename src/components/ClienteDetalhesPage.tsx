import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, FilePlus, User, Mail, Phone, Cake, Briefcase, MapPin, CalendarPlus, FileDown } from 'lucide-react';
import { Cliente, AvaliacaoFisioterapeutica, Sessao } from '@/types';
import { getAvaliacoesByCliente, getSessoesByClienteId, deleteAvaliacao } from '@/services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { gerarPDFAvaliacao } from '@/utils/pdfGenerator';

interface ClienteDetalhesPageProps {
  cliente: Cliente;
  onBack: () => void;
  onEdit: (cliente: Cliente) => void;
  onDelete: (cliente: Cliente) => void;
  onAddAvaliacao: (clienteId: number) => void;
  onViewAvaliacao: (avaliacao: AvaliacaoFisioterapeutica) => void;
  onEditAvaliacao: (avaliacao: AvaliacaoFisioterapeutica) => void;
  onAddSessao: (clienteId: number) => void;
}

const InfoCard: React.FC<{ icon: React.ElementType; label: string; value?: string | null }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start text-sm">
    <Icon className="w-4 h-4 mr-3 mt-1 text-primary flex-shrink-0" />
    <div className="flex flex-col">
      <span className="font-semibold text-muted-foreground">{label}</span>
      <span className="text-foreground">{value || 'Não informado'}</span>
    </div>
  </div>
);

const ClienteDetalhesPage: React.FC<ClienteDetalhesPageProps> = ({ cliente, onBack, onEdit, onDelete, onAddAvaliacao, onViewAvaliacao, onEditAvaliacao, onAddSessao }) => {
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoFisioterapeutica[]>([]);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);

  const fetchAvaliacoes = async () => {
    try {
      const avaliacoesData = await getAvaliacoesByCliente(cliente.id);
      setAvaliacoes(Array.isArray(avaliacoesData) ? avaliacoesData : []);
    } catch (error) {
      toast.error('Erro ao recarregar as avaliações.');
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [avaliacoesData, sessoesData] = await Promise.all([
          getAvaliacoesByCliente(cliente.id),
          getSessoesByClienteId(cliente.id)
        ]);
        setAvaliacoes(Array.isArray(avaliacoesData) ? avaliacoesData : []);
        setSessoes(Array.isArray(sessoesData) ? sessoesData : []);
      } catch (error) {
        toast.error('Erro ao buscar dados do cliente.');
        console.error(error);
      }
    };
    fetchData();
  }, [cliente.id]);

  const handleDeleteAvaliacao = async (avaliacaoId: number) => {
    try {
      await deleteAvaliacao(avaliacaoId);
      toast.success("Avaliação excluída com sucesso!");
      fetchAvaliacoes(); 
    } catch (error) {
      toast.error("Falha ao excluir a avaliação.");
      console.error(error);
    }
  };

  const handleGerarPDF = (avaliacao: AvaliacaoFisioterapeutica) => {
    try {
      gerarPDFAvaliacao(avaliacao, cliente);
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar PDF');
      console.error(error);
    }
  };

  const calcularIdade = (dataNascimento: string) => {
    if (!dataNascimento) return '';
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return `${idade} anos`;
  };

  const parseDateAsUTC = (dateString: string) => {
    return new Date(dateString + 'Z');
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{cliente.nome}</h1>
            <p className="text-muted-foreground">Detalhes do paciente</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" onClick={() => onAddSessao(cliente.id)}>
              <CalendarPlus className="w-4 h-4 mr-2" />
              Nova Sessão
          </Button>
          <Button variant="outline" onClick={() => onEdit(cliente)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button variant="destructive" onClick={() => onDelete(cliente)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Informações do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoCard icon={User} label="Sexo" value={cliente.sexo === 'F' ? 'Feminino' : cliente.sexo === 'M' ? 'Masculino' : 'Outro'} />
          <InfoCard icon={Mail} label="Email" value={cliente.email} />
          <InfoCard icon={Phone} label="Telefone" value={cliente.telefone} />
          <InfoCard icon={Cake} label="Idade" value={calcularIdade(cliente.dataNascimento)} />
          <InfoCard icon={Briefcase} label="Profissão" value={cliente.profissao} />
          <InfoCard icon={MapPin} label="Endereço" value={`${cliente.enderecoResidencial}, ${cliente.bairro}, ${cliente.cidade}`} />
        </CardContent>
      </Card>

      {/* Avaliações */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Avaliações Fisioterapêuticas</CardTitle>
          <Button onClick={() => onAddAvaliacao(cliente.id)}>
            <FilePlus className="w-4 h-4 mr-2" />
            Nova Avaliação
          </Button>
        </CardHeader>
        <CardContent>
          {Array.isArray(avaliacoes) && avaliacoes.length > 0 ? (
            <div className="space-y-3">
              {avaliacoes.map(ava => (
                <div key={ava.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">{format(new Date(ava.dataAvaliacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                    {ava.updatedAt && ava.createdAt && ava.updatedAt !== ava.createdAt && (
                        <p className="text-xs text-muted-foreground italic">
                            (Atualizado em: {format(new Date(ava.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })})
                        </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => onViewAvaliacao(ava)}>Ver Detalhes</Button>
                    <Button variant="outline" size="sm" onClick={() => handleGerarPDF(ava)}>
                      <FileDown className="w-3 h-3 mr-1.5" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onEditAvaliacao(ava)}>
                      <Edit className="w-3 h-3 mr-1.5" />
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteAvaliacao(ava.id)}>
                      <Trash2 className="w-3 h-3 mr-1.5" />
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">Nenhuma avaliação encontrada.</p>
          )}
        </CardContent>
      </Card>

      {/* Sessões */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Sessões</CardTitle>
        </CardHeader>
        <CardContent>
          {Array.isArray(sessoes) && sessoes.length > 0 ? (
            <div className="space-y-3">
              {sessoes.map(sessao => (
                <div key={sessao.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">{sessao.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(sessao.dataHoraInicio), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <Badge>{sessao.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">Nenhuma sessão encontrada.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClienteDetalhesPage;