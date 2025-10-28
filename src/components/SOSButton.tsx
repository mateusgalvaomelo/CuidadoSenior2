import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const SOSButton: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSOS = () => {
    toast({
      title: "🚨 SOS Ativado!",
      description: "Ligando para emergência...",
      variant: "destructive",
    });
    // Em produção, aqui faria a ligação real
    console.log("SOS Button pressed - calling emergency services");
  };

  const handleFamilyCall = () => {
    navigate('/familia');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40">
      <div className="p-3 flex justify-center gap-4">
        <Button
          onClick={handleSOS}
          variant="emergency"
          size="default"
          className="shadow-lg hover:scale-105 transition-transform flex items-center gap-2 bg-emergency/10 border border-emergency hover:bg-emergency/20 text-emergency"
          aria-label="Botão de emergência SOS"
        >
          <AlertTriangle className="h-4 w-4" />
          <span className="font-bold text-sm">EMERGÊNCIA</span>
        </Button>
        
        <Button
          onClick={handleFamilyCall}
          variant="communication"
          size="default"
          className="shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
          aria-label="Falar com a família"
        >
          <Phone className="h-4 w-4" />
          <span className="font-bold text-sm">FAMÍLIA</span>
        </Button>
      </div>
    </div>
  );
};

export default SOSButton;