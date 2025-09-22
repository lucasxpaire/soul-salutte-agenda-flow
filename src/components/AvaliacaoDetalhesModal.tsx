import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AvaliacaoFisioterapeutica, Cliente } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Stethoscope, Activity, Clipboard, Thermometer, FileText, History, CheckCircle2, XCircle, ShieldQuestion, FileDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { gerarPDFAvaliacao } from '@/utils/pdfGenerator';
import { toast } from 'sonner';
import { getClientes } from '@/services/api';

interface AvaliacaoDetalhesModalProps {
  isOpen: boolean;
  onClose: () => void;
  avaliacao: AvaliacaoFisioterapeutica | null;
}

// Componente auxiliar para criar seções padronizadas
const DetailSection: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="space-y-4">
        <h3 className="flex items-center text-lg font-semibold text-primary border-b border-primary/20 pb-2 mb-4">
            <Icon className="w-5 h-5 mr-3" />
            {title}
        </h3>
        <div className="space-y-4 text-sm">{children}</div>
    </div>
);

// Componente para exibir um item de detalhe (label + valor)
const InfoItem: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
    <div>
        <p className="font-semibold text-muted-foreground">{label}</p>
        <p className="text-foreground whitespace-pre-wrap">{value || <span className="italic text-muted-foreground/80">Não informado</span>}</p>
    </div>
);

// Componente para exibir informações booleanas (Sim/Não)
const BooleanInfo: React.FC<{ label: string; value: boolean; text?: string | null }> = ({ label, value, text }) => (
    <div>
        <p className="font-semibold text-muted-foreground">{label}</p>
        <div className="flex items-center gap-2 mt-1">
            {value ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
            <span className="text-foreground">{value ? 'Sim' : 'Não'}</span>
        </div>
        {value && text && <p className="text-sm text-foreground mt-1 p-2 bg-muted/50 rounded-md border">{text}</p>}
    </div>
);

// Componente para exibir a escala de dor
const PainDisplay: React.FC<{ value: number }> = ({ value }) => {
    const getPainColor = () => {
        if (value <= 3) return 'bg-green-500';
        if (value <= 7) return 'bg-yellow-500';
        return 'bg-red-500';
    };
    return (
        <div>
            <p className="font-semibold text-muted-foreground">Avaliação da Dor (EVA 0-10)</p>
            <div className="flex items-center gap-4 mt-2">
                <Thermometer className="h-5 w-5 text-muted-foreground" />
                <div className="w-full bg-muted rounded-full h-2.5">
                    <div className={`${getPainColor()} h-2.5 rounded-full`} style={{ width: `${value * 10}%` }}></div>
                </div>
                <Badge variant="secondary" className="w-12 justify-center text-lg">{value}</Badge>
            </div>
        </div>
    );
};

const AvaliacaoDetalhesModal: React.FC<AvaliacaoDetalhesModalProps> = ({ isOpen, onClose, avaliacao }) => {
  const handleGerarPDF = async () => {
    if (!avaliacao) return;
    
    try {
      // Buscar dados do cliente
      const clientes = await getClientes();
      const cliente = clientes.find(c => c.id === avaliacao.clienteId);
      
      if (!cliente) {
        toast.error('Cliente não encontrado');
        return;
      }
      
      gerarPDFAvaliacao(avaliacao, cliente);
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar PDF');
      console.error(error);
    }
  };

  if (!avaliacao) return null;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    return format(new Date(dateString ? dateString : dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[95vh] flex flex-col p-0 bg-card">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-2xl text-primary">Detalhes da Avaliação</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-4 text-sm mt-1">
                <span>Criada em: {formatDate(avaliacao.createdAt)}</span>
                {avaliacao.updatedAt && avaliacao.createdAt !== avaliacao.updatedAt && (
                  <span className="text-xs text-muted-foreground italic">
                    (Atualizado em: {formatDate(avaliacao.updatedAt)})
                  </span>
                )}
              </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <DetailSection title="Diagnóstico" icon={FileText}>
                <InfoItem label="Diagnóstico Clínico" value={avaliacao.diagnosticoClinico} />
                <InfoItem label="Diagnóstico Fisioterapêutico" value={avaliacao.diagnosticoFisioterapeutico} />
            </DetailSection>

            <DetailSection title="Avaliação" icon={Stethoscope}>
                <InfoItem label="Queixa Principal" value={avaliacao.queixaPrincipal} />
                <InfoItem label="História Clínica" value={avaliacao.historiaClinica} />
                <InfoItem label="Hábitos de Vida" value={avaliacao.habitosVida} />
                <InfoItem label="HMA" value={avaliacao.hma} />
                <InfoItem label="HMP" value={avaliacao.hmp} />
                <InfoItem label="Antecedentes Pessoais" value={avaliacao.antecedentesPessoais} />
                <InfoItem label="Antecedentes Familiares" value={avaliacao.antecedentesFamiliares} />
                <InfoItem label="Tratamentos Realizados" value={avaliacao.tratamentosRealizados} />
            </DetailSection>

            <DetailSection title="Exame Clínico e Físico" icon={Activity}>
                <div className="space-y-4">
                    <div>
                        <p className="font-semibold text-muted-foreground mb-2">Apresentação do Paciente</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-md bg-muted/50">
                            <BooleanInfo label="Deambulando" value={!!avaliacao.deambulando} />
                            <BooleanInfo label="Com Apoio" value={!!avaliacao.deambulandoComApoio} />
                            <BooleanInfo label="Cadeira de Rodas" value={!!avaliacao.cadeiraDeRodas} />
                            <BooleanInfo label="Internado" value={!!avaliacao.internado} />
                            <BooleanInfo label="Orientado" value={!!avaliacao.orientado} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <BooleanInfo label="Exames Complementares?" value={!!avaliacao.temExamesComplementares} text={avaliacao.examesComplementaresDescricao} />
                        <BooleanInfo label="Usa Medicamentos?" value={!!avaliacao.usaMedicamentos} text={avaliacao.medicamentosDescricao} />
                        <BooleanInfo label="Realizou Cirurgia?" value={!!avaliacao.realizouCirurgia} text={avaliacao.cirurgiasDescricao} />
                    </div>
                    <div>
                        <p className="font-semibold text-muted-foreground mb-2">Inspeção e Palpação</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-md bg-muted/50">
                             <BooleanInfo label="Normal" value={!!avaliacao.inspecaoNormal} />
                             <BooleanInfo label="Edema" value={!!avaliacao.inspecaoEdema} />
                             <BooleanInfo label="Cicatrização Incompleta" value={!!avaliacao.inspecaoCicatrizacaoIncompleta} />
                             <BooleanInfo label="Eritemas" value={!!avaliacao.inspecaoEritemas} />
                             <BooleanInfo label="Outros" value={!!avaliacao.inspecaoOutros} text={avaliacao.inspecaoOutrosDescricao} />
                        </div>
                    </div>
                    <InfoItem label="Semiologia" value={avaliacao.semiologia} />
                    <InfoItem label="Testes Específicos" value={avaliacao.testesEspecificos} />
                    <PainDisplay value={avaliacao.avaliacaoDor || 0} />
                </div>
            </DetailSection>
            
            <DetailSection title="Plano Terapêutico" icon={Clipboard}>
                <InfoItem label="Objetivos de Tratamento" value={avaliacao.objetivosTratamento} />
                <InfoItem label="Recursos Terapêuticos" value={avaliacao.recursosTerapeuticos} />
                <InfoItem label="Plano de Tratamento" value={avaliacao.planoTratamento} />
            </DetailSection>

            <DetailSection title="Histórico de Evolução" icon={History}>
                {avaliacao.evolucoes && avaliacao.evolucoes.length > 0 ? (
                    <div className="space-y-3">
                        {[...avaliacao.evolucoes].sort((a, b) => new Date(b.dataEvolucao).getTime() - new Date(a.dataEvolucao).getTime()).map((evolucao) => (
                            <div key={evolucao.id} className="p-3 rounded-lg border bg-muted/50">
                                <p className="font-semibold text-muted-foreground text-xs pb-1">
                                    Registrado em: {formatDate(evolucao.dataEvolucao)}
                                </p>
                                <p className="whitespace-pre-wrap">{evolucao.evolucao}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-4">Nenhuma evolução registrada.</p>
                )}
            </DetailSection>
        </div>

        <DialogFooter className="p-4 border-t bg-muted/30">
          <Button variant="outline" onClick={handleGerarPDF}>
            <FileDown className="w-4 h-4 mr-2" />
            Gerar PDF
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AvaliacaoDetalhesModal;
