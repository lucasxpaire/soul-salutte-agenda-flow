import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Contextos
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Componentes
import LoginPage from '@/components/LoginPage';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import CalendarioPage from '@/components/CalendarioPage';
import ClientesPage from '@/components/ClientesPage';
import AvaliacaoPage from '@/components/AvaliacaoPage';
import { Card, CardContent } from '@/components/ui/card';
import { Users, FileText, Calendar, Home } from 'lucide-react';

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

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'agenda':
        return <CalendarioPage onAddSessao={() => {}} onEditSessao={() => {}} />;
      case 'clientes':
        return <ClientesPage onSelectCliente={() => {}} onAddCliente={() => {}} />;
      case 'avaliacoes':
        return <AvaliacaoPage />;
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
    </div>
  );
};

// Componente principal que gerencia autenticação
const AppContent = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
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
