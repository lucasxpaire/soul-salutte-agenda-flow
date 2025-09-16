import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, FilePlus, User, Mail, Phone, Cake, Briefcase, MapPin, CalendarPlus } from 'lucide-react';
import { Cliente, AvaliacaoFisioterapeutica, Sessao } from '@/types';
import { getAvaliacoesByCliente, getSessoesByClienteId, deleteAvaliacao } from '@/services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

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

const ClienteDetalhesPage: React.FC<ClienteDetalhesPageProps> = ({ 
  cliente, 
  onBack, 
  onEdit, 
  onDelete, 
  onAddAvaliacao, 
  onViewAvaliacao, 
  onEditAvaliacao, 
  onAddSessao 
}) => {
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoFisioterapeutica[]>([]);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);

  const fetchAvaliacoes = async () => {
    try {
      const avaliacoesData = await getAvaliacoesByCliente(cliente.id);
      setAvaliacoes(avaliacoesData);
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
        setAvaliacoes(avaliacoesData);
        setSessoes(sessoesData);
      } catch (error) {
        toast.error('Erro ao carregar dados do cliente.');
        console.error(error);
      }
    };
    fetchData();
  }, [cliente.id]);

  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const handleDeleteAvaliacao = async (avaliacao: AvaliacaoFisioterapeutica) => {
    try {
      await deleteAvaliacao(avaliacao.id);
      toast.success('Avaliação excluída com sucesso!');
      fetchAvaliacoes();
    } catch (error) {
      toast.error('Erro ao excluir avaliação.');
      console.error(error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{cliente.nome}</h1>
            <p className="text-muted-foreground">Detalhes do cliente</p>
          </div>
        </div>
        <div className="flex gap-2">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoCard icon={User} label="Nome" value={cliente.nome} />
            <InfoCard icon={Mail} label="Email" value={cliente.email} />
            <InfoCard icon={Phone} label="Telefone" value={cliente.telefone} />
            <InfoCard icon={Cake} label="Idade" value={`${calcularIdade(cliente.dataNascimento)} anos`} />
            <InfoCard icon={Briefcase} label="Profissão" value={cliente.profissao} />
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-muted-foreground">Sexo:</span>
              <Badge variant={cliente.sexo === 'F' ? 'secondary' : 'outline'}>
                {cliente.sexo === 'F' ? 'Feminino' : 'Masculino'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoCard icon={MapPin} label="Cidade" value={cliente.cidade} />
            <InfoCard icon={MapPin} label="Bairro" value={cliente.bairro} />
            <InfoCard icon={MapPin} label="Endereço Residencial" value={cliente.enderecoResidencial} />
            <InfoCard icon={MapPin} label="Endereço Comercial" value={cliente.enderecoComercial} />
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Adicionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoCard icon={User} label="Naturalidade" value={cliente.naturalidade} />
            <InfoCard icon={User} label="Estado Civil" value={cliente.estadoCivil} />
            <InfoCard icon={User} label="Data de Cadastro" value={
              cliente.dataCadastro ? new Date(cliente.dataCadastro).toLocaleDateString('pt-BR') : 'Não informado'
            } />
          </CardContent>
        </Card>
      </div>

      {/* Avaliações */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Avaliações Fisioterapêuticas</CardTitle>
            <Button onClick={() => onAddAvaliacao(cliente.id)}>
              <FilePlus className="w-4 h-4 mr-2" />
              Nova Avaliação
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {avaliacoes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma avaliação registrada.</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => onAddAvaliacao(cliente.id)}
              >
                <FilePlus className="w-4 h-4 mr-2" />
                Adicionar Primeira Avaliação
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {avaliacoes.map((avaliacao) => (
                <div key={avaliacao.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">
                        Avaliação de {format(new Date(avaliacao.dataAvaliacao), 'dd/MM/yyyy', { locale: ptBR })}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {avaliacao.queixaPrincipal}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onViewAvaliacao(avaliacao)}
                      >
                        Ver Detalhes
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onEditAvaliacao(avaliacao)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteAvaliacao(avaliacao)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sessões */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Histórico de Sessões</CardTitle>
            <Button onClick={() => onAddSessao(cliente.id)}>
              <CalendarPlus className="w-4 h-4 mr-2" />
              Agendar Sessão
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sessoes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma sessão registrada.</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => onAddSessao(cliente.id)}
              >
                <CalendarPlus className="w-4 h-4 mr-2" />
                Agendar Primeira Sessão
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessoes.slice(0, 5).map((sessao) => (
                <div key={sessao.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{sessao.nome}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(sessao.dataHoraInicio), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        sessao.status === 'CONCLUIDA' ? 'default' : 
                        sessao.status === 'AGENDADA' ? 'secondary' : 'destructive'
                      }
                    >
                      {sessao.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {sessoes.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  E mais {sessoes.length - 5} sessão(ões)...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClienteDetalhesPage;