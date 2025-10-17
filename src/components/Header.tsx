import React from 'react';
import { Button } from '@/components/ui/button';
import { Type, ArrowLeft } from 'lucide-react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showBack = false, onBack }) => {
  const { increaseFontSize, fontSize } = useAccessibility();

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
      
      <Button
        onClick={increaseFontSize}
        variant="outline"
        size="elderIcon"
        className="flex flex-col gap-1"
        aria-label={`Tamanho da fonte: ${fontSize}. Clique para aumentar`}
      >
        <Type className="h-5 w-5" />
        <span className="text-xs">A+</span>
      </Button>
    </header>
  );
};

export default Header;