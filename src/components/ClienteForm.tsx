import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cliente } from '@/types';
import { toast } from 'sonner';
import { createCliente, updateCliente } from '@/services/api';
import { User, Mail, Phone, Cake, Briefcase, MapPin, Building, Home, Globe } from 'lucide-react';

interface ClienteFormProps {
  isOpen: boolean;
  onClose: () => void;
  cliente?: Cliente | undefined;
  onSave: () => void;
}

// Lista de nacionalidades com "Brasileira" como primeira opção
const nationalities = [
  "Brasileira", "Portuguesa", "Americana", "Canadense", "Argentina", "Mexicana", "Espanhola", "Italiana", "Francesa", "Alemã", "Japonesa", "Chinesa", "Indiana", "Russa", "Sul-africana", "Australiana", "Inglesa"
];

// Componente para agrupar campos com um ícone
const InputGroup: React.FC<{ icon: React.ElementType; children: React.ReactNode }> = ({ icon: Icon, children }) => (
  <div className="relative flex items-center">
    <Icon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
    {children}
  </div>
);

// Componente para seções do formulário
const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary border-b border-primary/20 pb-2 mb-4">{title}</h3>
        {children}
    </div>
);

// Função para formatar o telefone enquanto o usuário digita
const formatPhoneInput = (value: string) => {
  if (!value) return "";
  value = value.replace(/\D/g, '');
  value = value.replace(/(\d{2})(\d)/, '($1) $2');
  value = value.replace(/(\d{5})(\d)/, '$1-$2');
  return value.slice(0, 15); // Limita o tamanho para (XX) XXXXX-XXXX
};


const ClienteForm: React.FC<ClienteFormProps> = ({
  isOpen,
  onClose,
  cliente,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<Cliente>>({});
  const [nationalitySearch, setNationalitySearch] = useState('');
  const [isNationalityDropdownOpen, setIsNationalityDropdownOpen] = useState(false);
  const nationalityRef = useRef<HTMLDivElement>(null);

  // O useMemo otimiza a filtragem, recalculando a lista apenas quando a busca muda
  const filteredNationalities = useMemo(() => {
    if (!nationalitySearch) {
      // Se a busca estiver vazia, retorna a lista completa com "Brasileira" no topo
      return ["Brasileira", ...nationalities.filter(n => n !== "Brasileira")];
    }
    // Caso contrário, retorna a lista filtrada
    return nationalities.filter(n => 
      n.toLowerCase().includes(nationalitySearch.toLowerCase())
    );
  }, [nationalitySearch]);

  useEffect(() => {
    if (cliente) {
      // Atribuição explícita para evitar erro de tipo
      const initialData: Partial<Cliente> = {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        dataCadastro: cliente.dataCadastro,
        sexo: cliente.sexo,
        cidade: cliente.cidade,
        bairro: cliente.bairro,
        profissao: cliente.profissao,
        enderecoResidencial: cliente.enderecoResidencial,
        enderecoComercial: cliente.enderecoComercial,
        naturalidade: cliente.naturalidade,
        estadoCivil: cliente.estadoCivil,
        dataNascimento: cliente.dataNascimento ? cliente.dataNascimento.split('T')[0] : '',
      };
      setFormData(initialData);
      
      // Inicia com a nacionalidade do cliente ou vazio se não houver
      setNationalitySearch(cliente.naturalidade || '');
    } else {
      // Para um novo cliente, todos os campos começam vazios ou com um padrão
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        dataNascimento: '',
        sexo: 'F',
        cidade: '',
        bairro: '',
        profissao: '',
        enderecoResidencial: '',
        enderecoComercial: '',
        naturalidade: '', // Começa vazio
        estadoCivil: 'Solteiro'
      });
      setNationalitySearch(''); // A busca também começa vazia
    }
  }, [cliente, isOpen]);

  // Efeito para fechar o dropdown se clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (nationalityRef.current && !nationalityRef.current.contains(event.target as Node)) {
        setIsNationalityDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email || !formData.telefone || !formData.dataNascimento) {
      toast.error('Por favor, preencha os campos obrigatórios (*)');
      return;
    }

    try {
      if (cliente && cliente.id) {
        await updateCliente(cliente.id, formData);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await createCliente(formData as Omit<Cliente, 'id' | 'dataCadastro'>);
        toast.success('Cliente cadastrado com sucesso!');
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error('Ocorreu um erro ao salvar o cliente.');
      console.error(error);
    }
  };

  const handleChange = (field: keyof Cliente, value: string) => {
    if (field === 'telefone') {
      value = formatPhoneInput(value);
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNationalityChange = (value: string) => {
    setNationalitySearch(value);
    handleChange('naturalidade', value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[95vh] flex flex-col p-0 bg-card">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-2xl text-primary">
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
          <DialogDescription>
            {cliente 
              ? 'Atualize as informações do cliente abaixo.'
              : 'Preencha os dados para cadastrar um novo cliente.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
            <FormSection title="Dados Pessoais">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <InputGroup icon={User}>
                    <Input id="nome" value={formData.nome || ''} onChange={(e) => handleChange('nome', e.target.value)} required className="pl-10"/>
                  </InputGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <InputGroup icon={Mail}>
                    <Input id="email" type="email" value={formData.email || ''} onChange={(e) => handleChange('email', e.target.value)} required className="pl-10"/>
                  </InputGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <InputGroup icon={Phone}>
                    <Input id="telefone" value={formData.telefone || ''} onChange={(e) => handleChange('telefone', e.target.value)} required className="pl-10"/>
                  </InputGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                  <InputGroup icon={Cake}>
                    <Input id="dataNascimento" type="date" value={formData.dataNascimento || ''} onChange={(e) => handleChange('dataNascimento', e.target.value)} required className="pl-10"/>
                  </InputGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sexo">Sexo</Label>
                   <Select value={formData.sexo ?? 'F'} onValueChange={(value) => handleChange('sexo', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="F">Feminino</SelectItem>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="estadoCivil">Estado Civil</Label>
                   <Select value={formData.estadoCivil ?? 'Solteiro'} onValueChange={(value) => handleChange('estadoCivil', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Solteiro">Solteiro(a)</SelectItem>
                      <SelectItem value="Casado">Casado(a)</SelectItem>
                      <SelectItem value="Divorciado">Divorciado(a)</SelectItem>
                      <SelectItem value="Viúvo">Viúvo(a)</SelectItem>
                      <SelectItem value="União Estável">União Estável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="profissao">Profissão</Label>
                  <InputGroup icon={Briefcase}>
                    <Input id="profissao" value={formData.profissao || ''} onChange={(e) => handleChange('profissao', e.target.value)} className="pl-10"/>
                  </InputGroup>
                </div>
                <div className="space-y-2 relative" ref={nationalityRef}>
                  <Label htmlFor="naturalidade">Naturalidade</Label>
                  <InputGroup icon={Globe}>
                    <Input 
                      id="naturalidade" 
                      value={nationalitySearch} 
                      onChange={(e) => setNationalitySearch(e.target.value)} 
                      onFocus={() => setIsNationalityDropdownOpen(true)}
                      onBlur={() => handleChange('naturalidade', nationalitySearch)}
                      className="pl-10"
                      autoComplete="off"
                    />
                  </InputGroup>
                  {isNationalityDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-card border rounded-md shadow-lg max-h-40 overflow-y-auto">
                      <ul>
                        {filteredNationalities.map(n => (
                          <li 
                            key={n} 
                            className="px-3 py-2 cursor-pointer hover:bg-accent"
                            onMouseDown={() => {
                              handleNationalityChange(n);
                              setIsNationalityDropdownOpen(false);
                            }}
                          >
                            {n}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </FormSection>

            <FormSection title="Endereço">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="enderecoResidencial">Endereço Residencial</Label>
                        <InputGroup icon={Home}>
                            <Input id="enderecoResidencial" value={formData.enderecoResidencial || ''} onChange={(e) => handleChange('enderecoResidencial', e.target.value)} className="pl-10"/>
                        </InputGroup>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="bairro">Bairro</Label>
                            <InputGroup icon={MapPin}>
                                <Input id="bairro" value={formData.bairro || ''} onChange={(e) => handleChange('bairro', e.target.value)} className="pl-10"/>
                            </InputGroup>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cidade">Cidade</Label>
                            <InputGroup icon={Building}>
                                <Input id="cidade" value={formData.cidade || ''} onChange={(e) => handleChange('cidade', e.target.value)} className="pl-10"/>
                            </InputGroup>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="enderecoComercial">Endereço Comercial</Label>
                        <InputGroup icon={Building}>
                            <Input id="enderecoComercial" value={formData.enderecoComercial || ''} onChange={(e) => handleChange('enderecoComercial', e.target.value)} className="pl-10"/>
                        </InputGroup>
                    </div>
                </div>
            </FormSection>
        </form>
        
        <DialogFooter className="p-6 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            {cliente ? 'Salvar Alterações' : 'Cadastrar Cliente'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClienteForm;