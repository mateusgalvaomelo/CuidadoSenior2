import React from 'react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import SOSButton from '@/components/SOSButton';
import { HelpCircle, StickyNote, Mic, Settings, Volume2, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const OutrasFuncoes: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const functions = [
    {
      icon: HelpCircle,
      title: "Ajuda",
      description: "Assistente por voz",
      color: "elder",
      action: () => toast({
        title: "🎤 Ajuda por Voz",
        description: "Diga 'Olá' para começar a conversar comigo!"
      })
    },
    {
      icon: StickyNote,
      title: "Minhas Notas",
      description: "Bloco de anotações",
      color: "accent",
      action: () => toast({
        title: "📝 Notas",
        description: "Função de notas em desenvolvimento."
      })
    },
    {
      icon: Mic,
      title: "Gravar Áudio",
      description: "Deixar recado por voz",
      color: "communication",
      action: () => toast({
        title: "🎙️ Gravação",
        description: "Gravador de voz em desenvolvimento."
      })
    },
    {
      icon: Volume2,
      title: "Leitura de Tela",
      description: "Ouvir textos da tela",
      color: "health",
      action: () => toast({
        title: "🔊 Leitura Ativada",
        description: "Função de leitura de tela em desenvolvimento."
      })
    },
    {
      icon: Sun,
      title: "Modo Contraste",
      description: "Melhorar visibilidade",
      color: "secondary",
      action: () => toast({
        title: "🌙 Modo Contraste",
        description: "Ajuste de contraste em desenvolvimento."
      })
    },
    {
      icon: Settings,
      title: "Configurações",
      description: "Ajustar preferências",
      color: "outline",
      action: () => toast({
        title: "⚙️ Configurações",
        description: "Tela de configurações em desenvolvimento."
      })
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Outras Funções" 
        showBack 
        onBack={() => navigate('/')}
      />
      
      <main className="p-6 space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Ferramentas Úteis
          </h2>
          <p className="text-muted-foreground text-lg">
            Funções extras para te ajudar no dia a dia
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
          {functions.map((func, index) => {
            const IconComponent = func.icon;
            return (
              <Button
                key={index}
                onClick={func.action}
                variant={func.color as any}
                size="elder"
                className="flex items-center gap-4 p-6 h-auto min-h-[100px] justify-start"
              >
                <IconComponent className="h-10 w-10 flex-shrink-0" />
                <div className="flex flex-col items-start gap-1 flex-1">
                  <span className="text-xl font-semibold">{func.title}</span>
                  <span className="text-sm opacity-90">{func.description}</span>
                </div>
              </Button>
            );
          })}
        </div>

        <div className="text-center mt-8 p-6 bg-card rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold mb-2">💡 Dica</h3>
          <p className="text-muted-foreground">
            Use o botão vermelho de emergência no canto da tela sempre que precisar de ajuda urgente!
          </p>
        </div>
      </main>

      <SOSButton />
    </div>
  );
};

export default OutrasFuncoes;