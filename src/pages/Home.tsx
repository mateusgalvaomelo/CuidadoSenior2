import React from 'react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import SOSButton from '@/components/SOSButton';
import { Pill, Calendar, Users, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-16">
      <Header title="Bem-vindo(a) ao CuidadoSênior" />
      
      <main className="p-6 space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Olá! Como posso ajudar hoje?
          </h2>
          <p className="text-muted-foreground text-lg">
            Escolha uma das opções abaixo
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
          <Button
            onClick={() => navigate('/familia')}
            variant="communication"
            size="elder"
            className="flex flex-col gap-4 p-10 min-h-[120px]"
          >
            <Users className="h-14 w-14" />
            <span className="text-xl font-semibold">Falar com a Família</span>
            <span className="text-sm opacity-90">Ligar, vídeo e mensagens</span>
          </Button>

          <Button
            onClick={() => navigate('/compromissos')}
            variant="elder"
            size="elder"
            className="flex flex-col gap-4 p-10 min-h-[120px]"
          >
            <Calendar className="h-14 w-14" />
            <span className="text-xl font-semibold">Calendário</span>
            <span className="text-sm opacity-90">Agendar e ver consultas</span>
          </Button>

          <Button
            onClick={() => navigate('/medicamentos')}
            variant="health"
            size="elder"
            className="flex flex-col gap-4 p-10 min-h-[120px]"
          >
            <Pill className="h-14 w-14" />
            <span className="text-xl font-semibold">Meus Remédios</span>
            <span className="text-sm opacity-90">Gerenciar medicamentos e lembretes</span>
          </Button>

          <Button
            onClick={() => navigate('/outras-funcoes')}
            variant="accent"
            size="elder"
            className="flex flex-col gap-4 p-10 min-h-[120px]"
          >
            <MoreHorizontal className="h-14 w-14" />
            <span className="text-xl font-semibold">Outras Funções</span>
            <span className="text-sm opacity-90">Ajuda, notas e mais</span>
          </Button>
        </div>

        {/* Emergency Section */}
        <div className="mt-12 p-6 bg-card rounded-2xl border-2 border-emergency/20 max-w-2xl mx-auto">
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold text-emergency mb-2">Em caso de Emergência</h3>
            <p className="text-muted-foreground">Pressione o botão abaixo para solicitar ajuda</p>
          </div>
        </div>
      </main>

      <SOSButton />
    </div>
  );
};

export default Home;