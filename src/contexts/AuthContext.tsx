import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User } from '@/types';
import { authApi, handleApiError } from '@/services/api';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Verificar token ao carregar a aplicação
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token && token.startsWith('demo_token_')) {
          // Token de demonstração válido
          setIsAuthenticated(true);
          setUser({
            id: 1,
            username: 'demo',
            nome: 'Dr. Demonstração',
            email: 'demo@soulsalutte.com',
            role: 'Fisioterapeuta',
          });
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error);
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Simulação de login para desenvolvimento
      // Aceitar qualquer usuário/senha para demonstração
      if (username && password) {
        const token = 'demo_token_' + Date.now();
        const userData = {
          id: 1,
          username: username,
          nome: 'Dr. ' + username,
          email: username + '@soulsalutte.com',
          role: 'Fisioterapeuta',
        };

        localStorage.setItem('auth_token', token);
        setIsAuthenticated(true);
        setUser(userData);

        toast.success('Login realizado com sucesso!', {
          className: 'soul-toast-success',
        });

        return true;
      } else {
        throw new Error('Usuário e senha são obrigatórios');
      }
    } catch (error) {
      toast.error('Erro ao fazer login. Verifique suas credenciais.', {
        className: 'soul-toast-error',
      });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    setUser(null);
    
    toast.success('Logout realizado com sucesso!', {
      className: 'soul-toast-success',
    });
  };

  const value: AuthContextType = {
    isAuthenticated,
    login,
    logout,
    user,
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};