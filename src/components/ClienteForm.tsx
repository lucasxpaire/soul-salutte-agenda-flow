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
  const [isLoading, setIsLoading] = useState(false);

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
        dataNascimento: (cliente.dataNascimento || '').split('T')[0]!,
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
        naturalidade: '',
        estadoCivil: 'Solteiro',
      });
      
      setNationalitySearch('');
    }
  }, [cliente, isOpen]);

  const handleInputChange = (field: keyof Cliente, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhoneChange = (value: string) => {
    const formattedPhone = formatPhoneInput(value);
    handleInputChange('telefone', formattedPhone);
  };

  const handleNationalitySelect = (nationality: string) => {
    setNationalitySearch(nationality);
    handleInputChange('naturalidade', nationality);
    setIsNationalityDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validação básica
      if (!formData.nome || !formData.email || !formData.telefone) {
        toast.error('Por favor, preencha os campos obrigatórios.');
        return;
      }

      if (cliente) {
        // Edição
        await updateCliente(cliente.id, formData);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        // Criação
        await createCliente(formData as Omit<Cliente, 'id' | 'dataCadastro'>);
        toast.success('Cliente criado com sucesso!');
      }

      onSave();
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar cliente. Tente novamente.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{cliente ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          <DialogDescription>
            {cliente ? 'Atualize as informações do cliente.' : 'Preencha as informações do novo cliente.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <FormSection title="Informações Básicas">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <InputGroup icon={User}>
                  <Input
                    id="nome"
                    value={formData.nome || ''}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    placeholder="Digite o nome completo"
                    className="pl-10"
                    required
                  />
                </InputGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <InputGroup icon={Mail}>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Digite o email"
                    className="pl-10"
                    required
                  />
                </InputGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <InputGroup icon={Phone}>
                  <Input
                    id="telefone"
                    value={formData.telefone || ''}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(xx) xxxxx-xxxx"
                    className="pl-10"
                    required
                  />
                </InputGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                <InputGroup icon={Cake}>
                  <Input
                    id="dataNascimento"
                    type="date"
                    value={formData.dataNascimento || ''}
                    onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                    className="pl-10"
                  />
                </InputGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sexo">Sexo</Label>
                <Select value={formData.sexo || 'F'} onValueChange={(value) => handleInputChange('sexo', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="F">Feminino</SelectItem>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profissao">Profissão</Label>
                <InputGroup icon={Briefcase}>
                  <Input
                    id="profissao"
                    value={formData.profissao || ''}
                    onChange={(e) => handleInputChange('profissao', e.target.value)}
                    placeholder="Digite a profissão"
                    className="pl-10"
                  />
                </InputGroup>
              </div>
            </div>
          </FormSection>

          {/* Informações de Endereço */}
          <FormSection title="Endereço">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <InputGroup icon={MapPin}>
                  <Input
                    id="cidade"
                    value={formData.cidade || ''}
                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                    placeholder="Digite a cidade"
                    className="pl-10"
                  />
                </InputGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <InputGroup icon={MapPin}>
                  <Input
                    id="bairro"
                    value={formData.bairro || ''}
                    onChange={(e) => handleInputChange('bairro', e.target.value)}
                    placeholder="Digite o bairro"
                    className="pl-10"
                  />
                </InputGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="enderecoResidencial">Endereço Residencial</Label>
                <InputGroup icon={Home}>
                  <Input
                    id="enderecoResidencial"
                    value={formData.enderecoResidencial || ''}
                    onChange={(e) => handleInputChange('enderecoResidencial', e.target.value)}
                    placeholder="Digite o endereço residencial"
                    className="pl-10"
                  />
                </InputGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="enderecoComercial">Endereço Comercial</Label>
                <InputGroup icon={Building}>
                  <Input
                    id="enderecoComercial"
                    value={formData.enderecoComercial || ''}
                    onChange={(e) => handleInputChange('enderecoComercial', e.target.value)}
                    placeholder="Digite o endereço comercial"
                    className="pl-10"
                  />
                </InputGroup>
              </div>
            </div>
          </FormSection>

          {/* Informações Adicionais */}
          <FormSection title="Informações Adicionais">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="naturalidade">Naturalidade</Label>
                <div className="relative" ref={nationalityRef}>
                  <InputGroup icon={Globe}>
                    <Input
                      id="naturalidade"
                      value={nationalitySearch}
                      onChange={(e) => {
                        setNationalitySearch(e.target.value);
                        setIsNationalityDropdownOpen(true);
                      }}
                      onFocus={() => setIsNationalityDropdownOpen(true)}
                      placeholder="Digite ou selecione a naturalidade"
                      className="pl-10"
                    />
                  </InputGroup>
                  
                  {isNationalityDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredNationalities.map((nationality) => (
                        <div
                          key={nationality}
                          className="px-3 py-2 hover:bg-accent cursor-pointer"
                          onClick={() => handleNationalitySelect(nationality)}
                        >
                          {nationality}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estadoCivil">Estado Civil</Label>
                <Select value={formData.estadoCivil || 'Solteiro'} onValueChange={(value) => handleInputChange('estadoCivil', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado civil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solteiro">Solteiro</SelectItem>
                    <SelectItem value="Casado">Casado</SelectItem>
                    <SelectItem value="Divorciado">Divorciado</SelectItem>
                    <SelectItem value="Viúvo">Viúvo</SelectItem>
                    <SelectItem value="União Estável">União Estável</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </FormSection>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : (cliente ? 'Atualizar' : 'Criar')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClienteForm;