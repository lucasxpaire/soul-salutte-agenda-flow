import React from 'react';
import Navigation from '@/components/Navigation';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage={currentPage} onNavigate={onNavigate} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}