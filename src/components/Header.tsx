// src/components/Header.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showBack = false, onBack }) => {
  const { fontSize } = useAccessibility();
  const navigate = useNavigate();

  return (
    <header className="bg-background border-b border-border p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {showBack && (
          <Button
            onClick={onBack}
            variant="ghost"
            size="elderIcon"
            aria-label="Voltar"
          >
            <ArrowLeft />
          </Button>
        )}
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      </div>

      {/* 🔹 Botão ADM */}
      <Button
        onClick={() => navigate('/adm')}
        variant="accent"
        size="elderIcon"
        className="flex flex-col gap-1 bg-blue-500 hover:bg-blue-600 text-white"
        aria-label="Acessar painel ADM"
      >
        <Shield className="h-5 w-5" />
        <span className="text-xs">ADM</span>
      </Button>
    </header>
  );
};

export default Header;
