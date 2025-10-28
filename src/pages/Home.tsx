import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import SOSButton from '@/components/SOSButton';
import { Pill, Calendar, Users, MoreHorizontal, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';

// Se você tem shadcn Dialog/Input, use estes imports:
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

// fallback simples caso não tenha Dialog/Input do shadcn
const FallbackNamePrompt: React.FC<{ open: boolean; onConfirm: (name: string)=>void; onClose: ()=>void }> = ({ open, onConfirm, onClose }) => {
  useEffect(() => {
    if (open) {
      const n = window.prompt('Como você gostaria de ser chamado(a)?') || '';
      if (n.trim()) onConfirm(n.trim());
      else onClose();
    }
  }, [open, onConfirm, onClose]);
  return null;
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { name, setName } = useUser();

  const [openNameDialog, setOpenNameDialog] = useState(false);
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    // abre o popup se ainda não existe um nome salvo
    if (!name) setOpenNameDialog(true);
  }, [name]);

  const confirmName = () => {
    const n = (tempName || '').trim();
    if (!n) return;
    setName(n);
    setOpenNameDialog(false);
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <Header title={`Bem-vindo(a) ${name ? `, ${name}` : 'ao CuidadoSênior'}`} />
      
      <main className="p-6 space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {name ? `Olá, ${name}!` : 'Olá!'} Como posso ajudar hoje?
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

          {/* Botão ADM */}
          <Button
            onClick={() => navigate('/adm')}
            variant="accent"
            size="elder"
            className="flex flex-col gap-1 bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Shield className="h-14 w-14" />
            <span className="text-xl font-semibold">ADM</span>
            <span className="text-sm opacity-90">Gerenciar acesso de terceiros</span>
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

        <div className="mt-12 p-6 bg-card rounded-2xl border-2 border-emergency/20 max-w-2xl mx-auto">
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold text-emergency mb-2">Em caso de Emergência</h3>
            <p className="text-muted-foreground">Pressione o botão abaixo para solicitar ajuda</p>
          </div>
        </div>
      </main>

      <SOSButton />

      {/* Dialog shadcn (se existir). Se não existir, o fallback com window.prompt cuida. */}
      {Dialog && Input ? (
        <Dialog open={openNameDialog} onOpenChange={setOpenNameDialog}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Como você gostaria de ser chamado(a)?</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                autoFocus
                placeholder="Ex.: Dona Maria"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmName()}
              />
              <p className="text-sm text-muted-foreground">
                Usaremos esse nome para personalizar a sua experiência.
              </p>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setOpenNameDialog(false)}>Agora não</Button>
              <Button onClick={confirmName}>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <FallbackNamePrompt
          open={openNameDialog}
          onConfirm={(n) => { setName(n); setOpenNameDialog(false); }}
          onClose={() => setOpenNameDialog(false)}
        />
      )}
    </div>
  );
};

export default Home;