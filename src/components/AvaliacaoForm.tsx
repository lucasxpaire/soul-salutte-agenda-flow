import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { AvaliacaoFisioterapeutica, Evolucao } from '@/types';
import { toast } from 'sonner';
import { createAvaliacao, updateAvaliacao, adicionarEvolucao } from '@/services/api'; 
import { Stethoscope, Activity, Clipboard, Thermometer, FileText, History, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AvaliacaoFormProps {
  isOpen: boolean;
  onClose: () => void;
  clienteId: number;
  avaliacao?: AvaliacaoFisioterapeutica;
  onSave: () => void;
}

const initialFormData: Omit<AvaliacaoFisioterapeutica, 'id' | 'clienteId' | 'dataAvaliacao' | 'createdAt' | 'updatedAt'> = {
    diagnosticoClinico: '',
    diagnosticoFisioterapeutico: '',
    queixaPrincipal: '',
    historiaClinica: '',
    habitosVida: '',
    hma: '',
    hmp: '',
    antecedentesPessoais: '',
    antecedentesFamiliares: '',
    tratamentosRealizados: '',
    deambulando: false,
    deambulandoComApoio: false,
    cadeiraDeRodas: false,
    internado: false,
    orientado: false,
    temExamesComplementares: false,
    examesComplementaresDescricao: '',
    usaMedicamentos: false,
    medicamentosDescricao: '',
    realizouCirurgia: false,
    cirurgiasDescricao: '',
    inspecaoNormal: false,
    inspecaoEdema: false,
    inspecaoCicatrizacaoIncompleta: false,
    inspecaoEritemas: false,
    inspecaoOutros: false,
    inspecaoOutrosDescricao: '',
    semiologia: '',
    testesEspecificos: '',
    avaliacaoDor: 0,
    objetivosTratamento: '',
    recursosTerapeuticos: '',
    planoTratamento: '',
    evolucoes: [],
};

const FormSection: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="space-y-4">
        <h3 className="flex items-center text-lg font-semibold text-primary border-b border-primary/20 pb-2 mb-4">
            <Icon className="w-5 h-5 mr-3" />
            {title}
        </h3>
        {children}
    </div>
);
const CheckboxWithLabel: React.FC<{id: string, label: string, checked: boolean, onCheckedChange: (checked: boolean) => void}> = ({id, label, checked, onCheckedChange}) => (
    <div className="flex items-center space-x-2">
        <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
        <Label htmlFor={id} className="font-normal text-sm">{label}</Label>
    </div>
);
const ConditionalTextarea: React.FC<{
    title: string;
    checkboxId: string;
    textareaId: string;
    textareaPlaceholder: string;
    isChecked: boolean;
    textValue: string;
    onCheckedChange: (checked: boolean) => void;
    onTextChange: (value: string) => void;
}> = ({ title, checkboxId, textareaId, textareaPlaceholder, isChecked, textValue, onCheckedChange, onTextChange }) => (
    <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
        <Label className="font-semibold">{title}</Label>
        <div className="flex items-center space-x-6 pt-1">
            <div className="flex items-center space-x-2">
                <Checkbox id={`${checkboxId}-sim`} checked={isChecked} onCheckedChange={onCheckedChange} />
                <Label htmlFor={`${checkboxId}-sim`}>Sim</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id={`${checkboxId}-nao`} checked={!isChecked} onCheckedChange={(c) => onCheckedChange(!c)} />
                <Label htmlFor={`${checkboxId}-nao`}>Não</Label>
            </div>
        </div>
        {isChecked && <Textarea id={textareaId} placeholder={textareaPlaceholder} value={textValue} onChange={(e) => onTextChange(e.target.value)} className="mt-2 bg-card"/>}
    </div>
);
const PainSlider: React.FC<{ value: number; onChange: (value: number) => void; }> = ({ value, onChange }) => {
    const getSliderColor = () => {
        const percentage = value * 10;
        if (percentage <= 40) return 'accent-green-500';
        if (percentage <= 70) return 'accent-yellow-500';
        return 'accent-red-500';
    };
    return (
        <div className="space-y-2">
            <Label htmlFor="avaliacaoDor">Avaliação da Dor (EVA 0-10)</Label>
            <div className="flex items-center gap-4">
                <Thermometer className="h-5 w-5 text-muted-foreground" />
                <input id="avaliacaoDor" type="range" min="0" max="10" value={value} onChange={(e) => onChange(parseInt(e.target.value))} className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${getSliderColor()}`} />
                <Badge variant="secondary" className="w-12 justify-center text-lg">{value}</Badge>
            </div>
        </div>
    );
};


const AvaliacaoForm: React.FC<AvaliacaoFormProps> = ({ isOpen, onClose, clienteId, avaliacao, onSave }) => {
  const [formData, setFormData] = useState<Partial<AvaliacaoFisioterapeutica>>(initialFormData);
  const [novaEvolucao, setNovaEvolucao] = useState('');
  const [isSubmittingEvolucao, setIsSubmittingEvolucao] = useState(false);

  useEffect(() => {
    if (isOpen) {
        if (avaliacao) {
            setFormData(avaliacao);
        } else {
            setFormData({ ...initialFormData, clienteId });
        }
        setNovaEvolucao('');
    }
  }, [avaliacao, clienteId, isOpen]);

  const handleChange = (field: keyof AvaliacaoFisioterapeutica, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.id) {
        const { evolucoes, ...dataToSave } = formData;
        await updateAvaliacao(formData.id, dataToSave as AvaliacaoFisioterapeutica);
        toast.success('Avaliação atualizada com sucesso!');
      } else {
        const dataToSend = {
          ...formData,
          clienteId: clienteId,
          dataAvaliacao: new Date().toISOString(),
        };
        await createAvaliacao(dataToSend as Omit<AvaliacaoFisioterapeutica, 'id'>);
        toast.success('Avaliação criada com sucesso!');
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar avaliação.');
    }
  };

  const handleAdicionarEvolucao = async () => {
    if (!novaEvolucao.trim()) {
        toast.warning("O campo de evolução não pode estar vazio.");
        return;
    }

    if (formData.id) {
        setIsSubmittingEvolucao(true);
        try {
            const avaliacaoAtualizada = await adicionarEvolucao(formData.id, novaEvolucao);
            setFormData(avaliacaoAtualizada);
            setNovaEvolucao('');
            toast.success("Evolução adicionada com sucesso!");
        } catch (error) {
            toast.error("Falha ao adicionar evolução.");
        } finally {
            setIsSubmittingEvolucao(false);
        }
    } else {
        const novaEvolucaoObj = {
            evolucao: novaEvolucao,
            dataEvolucao: new Date().toISOString(),
        };
        setFormData(prev => ({
            ...prev,
            evolucoes: [...(prev.evolucoes || []), novaEvolucaoObj as Evolucao]
        }));
        setNovaEvolucao('');
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('pt-BR');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[95vh] flex flex-col p-0 bg-card">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-2xl text-primary">{avaliacao ? 'Editar Avaliação Fisioterapêutica' : 'Nova Avaliação Fisioterapêutica'}</DialogTitle>
          <DialogDescription>
            {avaliacao?.createdAt ? `Avaliação criada em: ${formatDate(avaliacao.createdAt)}` : 'Preencha os campos para documentar a avaliação.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <FormSection title="Diagnóstico" icon={FileText}>
               <div className="space-y-2">
                    <Label htmlFor="diagnosticoClinico">Diagnóstico Clínico</Label>
                    <Textarea id="diagnosticoClinico" value={formData.diagnosticoClinico || ''} onChange={e => handleChange('diagnosticoClinico', e.target.value)} className="bg-muted/50"/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="diagnosticoFisioterapeutico">Diagnóstico Fisioterapêutico</Label>
                    <Textarea id="diagnosticoFisioterapeutico" value={formData.diagnosticoFisioterapeutico || ''} onChange={e => handleChange('diagnosticoFisioterapeutico', e.target.value)} className="bg-muted/50"/>
                </div>
            </FormSection>

            <FormSection title="Avaliação" icon={Stethoscope}>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="queixaPrincipal">Queixa Principal do Paciente</Label>
                        <Textarea id="queixaPrincipal" value={formData.queixaPrincipal || ''} onChange={e => handleChange('queixaPrincipal', e.target.value)} className="bg-muted/50"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="historiaClinica">História Clínica</Label>
                        <Textarea id="historiaClinica" value={formData.historiaClinica || ''} onChange={e => handleChange('historiaClinica', e.target.value)} className="bg-muted/50"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="habitosVida">Hábitos de Vida</Label>
                        <Textarea id="habitosVida" value={formData.habitosVida || ''} onChange={e => handleChange('habitosVida', e.target.value)} className="bg-muted/50"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="hma">HMA</Label>
                        <Textarea id="hma" value={formData.hma || ''} onChange={e => handleChange('hma', e.target.value)} className="bg-muted/50"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="hmp">HMP</Label>
                        <Textarea id="hmp" value={formData.hmp || ''} onChange={e => handleChange('hmp', e.target.value)} className="bg-muted/50"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="antecedentesPessoais">Antecedentes Pessoais</Label>
                        <Textarea id="antecedentesPessoais" value={formData.antecedentesPessoais || ''} onChange={e => handleChange('antecedentesPessoais', e.target.value)} className="bg-muted/50"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="antecedentesFamiliares">Antecedentes Familiares</Label>
                        <Textarea id="antecedentesFamiliares" value={formData.antecedentesFamiliares || ''} onChange={e => handleChange('antecedentesFamiliares', e.target.value)} className="bg-muted/50"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tratamentosRealizados">Tratamentos Realizados</Label>
                        <Textarea id="tratamentosRealizados" value={formData.tratamentosRealizados || ''} onChange={e => handleChange('tratamentosRealizados', e.target.value)} className="bg-muted/50"/>
                    </div>
                </div>
            </FormSection>

            <FormSection title="Exame Clínico e Físico" icon={Activity}>
                <div className="space-y-4">
                    <div>
                        <Label className="font-semibold">Apresentação do Paciente</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 mt-2 border rounded-md">
                            <CheckboxWithLabel id="deambulando" label="Deambulando" checked={!!formData.deambulando} onCheckedChange={c => handleChange('deambulando', c)} />
                            <CheckboxWithLabel id="deambulandoComApoio" label="Com Apoio" checked={!!formData.deambulandoComApoio} onCheckedChange={c => handleChange('deambulandoComApoio', c)} />
                            <CheckboxWithLabel id="cadeiraDeRodas" label="Cadeira de Rodas" checked={!!formData.cadeiraDeRodas} onCheckedChange={c => handleChange('cadeiraDeRodas', c)} />
                            <CheckboxWithLabel id="internado" label="Internado" checked={!!formData.internado} onCheckedChange={c => handleChange('internado', c)} />
                            <CheckboxWithLabel id="orientado" label="Orientado" checked={!!formData.orientado} onCheckedChange={c => handleChange('orientado', c)} />
                        </div>
                    </div>
                     <div className="space-y-4">
                        <ConditionalTextarea title="Exames Complementares?" checkboxId="examesComp" textareaId="examesCompDesc" textareaPlaceholder="Se sim, quais?" isChecked={!!formData.temExamesComplementares} textValue={formData.examesComplementaresDescricao || ''} onCheckedChange={c => handleChange('temExamesComplementares', c)} onTextChange={v => handleChange('examesComplementaresDescricao', v)} />
                        <ConditionalTextarea title="Usa Medicamentos?" checkboxId="usaMeds" textareaId="usaMedsDesc" textareaPlaceholder="Se sim, quais?" isChecked={!!formData.usaMedicamentos} textValue={formData.medicamentosDescricao || ''} onCheckedChange={c => handleChange('usaMedicamentos', c)} onTextChange={v => handleChange('medicamentosDescricao', v)} />
                        <ConditionalTextarea title="Realizou Cirurgia?" checkboxId="realizouCirurgia" textareaId="realizouCirurgiaDesc" textareaPlaceholder="Se sim, quais?" isChecked={!!formData.realizouCirurgia} textValue={formData.cirurgiasDescricao || ''} onCheckedChange={c => handleChange('realizouCirurgia', c)} onTextChange={v => handleChange('cirurgiasDescricao', v)} />
                    </div>
                     <div>
                        <Label className="font-semibold">Inspeção e Palpação</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 mt-2 border rounded-md">
                            <CheckboxWithLabel id="inspecaoNormal" label="Normal" checked={!!formData.inspecaoNormal} onCheckedChange={c => handleChange('inspecaoNormal', c)} />
                            <CheckboxWithLabel id="inspecaoEdema" label="Edema" checked={!!formData.inspecaoEdema} onCheckedChange={c => handleChange('inspecaoEdema', c)} />
                            <CheckboxWithLabel id="inspecaoCicatrizacaoIncompleta" label="Cicatrização Incompleta" checked={!!formData.inspecaoCicatrizacaoIncompleta} onCheckedChange={c => handleChange('inspecaoCicatrizacaoIncompleta', c)} />
                            <CheckboxWithLabel id="inspecaoEritemas" label="Eritemas" checked={!!formData.inspecaoEritemas} onCheckedChange={c => handleChange('inspecaoEritemas', c)} />
                            <CheckboxWithLabel id="inspecaoOutros" label="Outros" checked={!!formData.inspecaoOutros} onCheckedChange={c => handleChange('inspecaoOutros', c)} />
                        </div>
                        {formData.inspecaoOutros && <Textarea placeholder="Descreva outras observações da inspeção..." value={formData.inspecaoOutrosDescricao || ''} onChange={e => handleChange('inspecaoOutrosDescricao', e.target.value)} className="mt-2 bg-muted/50"/>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="semiologia">Semiologia</Label>
                        <Textarea id="semiologia" value={formData.semiologia || ''} onChange={e => handleChange('semiologia', e.target.value)} className="bg-muted/50"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="testesEspecificos">Testes Específicos</Label>
                        <Textarea id="testesEspecificos" value={formData.testesEspecificos || ''} onChange={e => handleChange('testesEspecificos', e.target.value)} className="bg-muted/50"/>
                    </div>
                    <PainSlider 
                        value={formData.avaliacaoDor || 0} 
                        onChange={value => handleChange('avaliacaoDor', value)} 
                    />
                </div>
            </FormSection>
            
            <FormSection title="Plano Terapêutico" icon={Clipboard}>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="objetivosTratamento">Objetivos de Tratamento</Label>
                        <Textarea id="objetivosTratamento" value={formData.objetivosTratamento || ''} onChange={e => handleChange('objetivosTratamento', e.target.value)} rows={4} className="bg-muted/50"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="recursosTerapeuticos">Recursos Terapêuticos</Label>
                        <Textarea id="recursosTerapeuticos" value={formData.recursosTerapeuticos || ''} onChange={e => handleChange('recursosTerapeuticos', e.target.value)} rows={4} className="bg-muted/50"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="planoTratamento">Plano de Tratamento</Label>
                        <Textarea id="planoTratamento" value={formData.planoTratamento || ''} onChange={e => handleChange('planoTratamento', e.target.value)} rows={4} className="bg-muted/50"/>
                    </div>
                </div>
            </FormSection>

            <FormSection title="Histórico de Evolução" icon={History}>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nova-evolucao" className="font-semibold">Adicionar Nova Evolução</Label>
                        <Textarea id="nova-evolucao" placeholder="Descreva a nova evolução do paciente aqui..." value={novaEvolucao} onChange={(e) => setNovaEvolucao(e.target.value)} className="bg-muted/50" />
                    </div>
                    <Button onClick={handleAdicionarEvolucao} disabled={isSubmittingEvolucao} size="sm">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        {isSubmittingEvolucao ? 'A Adicionar...' : 'Adicionar Evolução'}
                    </Button>
                </div>

                <div className="mt-6 space-y-4 max-h-64 overflow-y-auto pr-2 border-t pt-4">
                    {formData.evolucoes && formData.evolucoes.length > 0 ? (
                        [...formData.evolucoes].sort((a, b) => new Date(b.dataEvolucao).getTime() - new Date(a.dataEvolucao).getTime()).map((evolucao, index) => (
                            <div key={evolucao.id || `temp-${index}`} className="p-3 rounded-lg border bg-muted/50 text-sm">
                                <p className="font-semibold text-muted-foreground text-xs pb-1">
                                    Registado em: {formatDate(evolucao.dataEvolucao)}
                                </p>
                                <p className="whitespace-pre-wrap">{evolucao.evolucao}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-center text-muted-foreground py-4">Nenhuma evolução registada ainda.</p>
                    )}
                </div>
            </FormSection>
        </div>

        <DialogFooter className="p-6 border-t">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="button" onClick={handleSubmit}>Salvar Avaliação</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AvaliacaoForm;
