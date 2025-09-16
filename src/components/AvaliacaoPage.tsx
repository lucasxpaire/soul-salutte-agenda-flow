import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const AvaliacoesPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Avaliações</h1>
          <p className="text-muted-foreground">
            Consulte e gerencie as fichas de avaliação dos pacientes.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <span>Funcionalidade em Desenvolvimento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            A funcionalidade completa para listar e filtrar todas as avaliações será implementada em breve.
          </p>
          <p className="text-muted-foreground mt-2">
            Por enquanto, você pode visualizar e adicionar avaliações na página de detalhes de cada cliente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvaliacoesPage;