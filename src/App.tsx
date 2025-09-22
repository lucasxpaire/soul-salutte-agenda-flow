import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Contextos
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Componentes
import LoginForm from '@/components/LoginForm';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import CalendarioPage from '@/components/CalendarioPage';
import ClientesPage from '@/components/ClientesPage';
import ClienteDetalhesPage from '@/components/ClienteDetalhesPage';
import ClienteForm from '@/components/ClienteForm';
import AvaliacaoForm from '@/components/AvaliacaoForm';
import AvaliacaoDetalhesModal from '@/components/AvaliacaoDetalhesModal';
import SessaoForm from '@/components/SessaoForm';
import { Card, CardContent } from '@/components/ui/card';
import { Users, FileText, Calendar, Home } from 'lucide-react';
import { Cliente, AvaliacaoFisioterapeutica } from '@/types';

const queryClient = new QueryClient();

// Componente de placeholder para páginas não implementadas
const PlaceholderPage = ({ title, icon: Icon, description }: { 
  title: string; 
  icon: React.ElementType; 
  description: string; 
}) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
    <Card className="soul-card w-full max-w-md">
      <CardContent className="pt-6">
        <Icon className="h-16 w-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  </div>
);

// Componente principal da aplicação autenticada
const AuthenticatedApp = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [showClienteForm, setShowClienteForm] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState<Cliente | null>(null);
  const [showAvaliacaoForm, setShowAvaliacaoForm] = useState(false);
  const [avaliacaoToEdit, setAvaliacaoToEdit] = useState<AvaliacaoFisioterapeutica | null>(null);
  const [showAvaliacaoDetalhes, setShowAvaliacaoDetalhes] = useState(false);
  const [clienteIdForAvaliacao, setClienteIdForAvaliacao] = useState<number | null>(null);
  const [showSessaoForm, setShowSessaoForm] = useState(false);
  const [initialDate, setInitialDate] = useState<Date | undefined>();
  const [sessaoToEdit, setSessaoToEdit] = useState<any>(null);

  const handleSelectCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente);
  };

  const handleBackToClientes = () => {
    setSelectedCliente(null);
  };

  const handleAddCliente = () => {
    setClienteToEdit(null);
    setShowClienteForm(true);
  };

  const handleEditCliente = (cliente: Cliente) => {
    setClienteToEdit(cliente);
    setShowClienteForm(true);
  };

  const handleDeleteCliente = (cliente: Cliente) => {
    // Implementar lógica de exclusão
    console.log('Delete cliente:', cliente);
  };

  const handleAddAvaliacao = (clienteId: number) => {
    setClienteIdForAvaliacao(clienteId);
    setAvaliacaoToEdit(null);
    setShowAvaliacaoForm(true);
  };

  const handleViewAvaliacao = (avaliacao: AvaliacaoFisioterapeutica) => {
    setAvaliacaoToEdit(avaliacao);
    setShowAvaliacaoDetalhes(true);
  };

  const handleEditAvaliacao = (avaliacao: AvaliacaoFisioterapeutica) => {
    setAvaliacaoToEdit(avaliacao);
    setClienteIdForAvaliacao(avaliacao.clienteId);
    setShowAvaliacaoForm(true);
  };

  const handleAddSessao = (clienteId: number) => {
    setClienteIdForAvaliacao(clienteId);
    setSessaoToEdit(null);
    setShowSessaoForm(true);
  };

  const renderPage = () => {
    if (selectedCliente) {
      return (
        <ClienteDetalhesPage
          cliente={selectedCliente}
          onBack={handleBackToClientes}
          onEdit={handleEditCliente}
          onDelete={handleDeleteCliente}
          onAddAvaliacao={handleAddAvaliacao}
          onViewAvaliacao={handleViewAvaliacao}
          onEditAvaliacao={handleEditAvaliacao}
          onAddSessao={handleAddSessao}
        />
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'agenda':
        return <CalendarioPage 
          onAddSessao={(date) => {
            setInitialDate(date);
            setSessaoToEdit(null);
            setShowSessaoForm(true);
          }} 
          onEditSessao={(sessao) => {
            setSessaoToEdit(sessao);
            setShowSessaoForm(true);
          }} 
        />;
      case 'clientes':
        return <ClientesPage onSelectCliente={handleSelectCliente} onAddCliente={handleAddCliente} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="max-w-7xl mx-auto p-6">
        {renderPage()}
      </main>

      {/* Modais */}
      <ClienteForm
        isOpen={showClienteForm}
        onClose={() => setShowClienteForm(false)}
        cliente={clienteToEdit}
        onSave={() => {
          setShowClienteForm(false);
          setClienteToEdit(null);
        }}
      />

      <AvaliacaoForm
        isOpen={showAvaliacaoForm}
        onClose={() => setShowAvaliacaoForm(false)}
        clienteId={clienteIdForAvaliacao || 0}
        avaliacao={avaliacaoToEdit}
        onSave={() => {
          setShowAvaliacaoForm(false);
          setAvaliacaoToEdit(null);
        }}
      />

      <AvaliacaoDetalhesModal
        isOpen={showAvaliacaoDetalhes}
        onClose={() => setShowAvaliacaoDetalhes(false)}
        avaliacao={avaliacaoToEdit}
      />

      <SessaoForm
        isOpen={showSessaoForm}
        onClose={() => {
          setShowSessaoForm(false);
          setInitialDate(undefined);
          setSessaoToEdit(null);
        }}
        sessao={sessaoToEdit}
        initialDate={initialDate}
        onSave={() => {
          setShowSessaoForm(false);
          setInitialDate(undefined);
          setSessaoToEdit(null);
        }}
      />
    </div>
  );
};

// Componente principal que gerencia autenticação
const AppContent = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <AuthenticatedApp />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner position="top-right" />
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
