import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import SOSButton from '@/components/SOSButton';
import { Phone, Video, Mic, Heart, Trash2, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import familyIcon from '@/assets/family-icon.png';
import { db, type Contact } from '../db';





const seedContacts: Omit<Contact, 'id'>[] = [
  { name: 'Maria', relation: 'Filha',  photo: '👩‍💼', phone: '(11) 99999-1234' },
  { name: 'João',  relation: 'Filho',  photo: '👨‍💻', phone: '(11) 99999-5678' },
  { name: 'Ana',   relation: 'Neta',   photo: '👩‍🎓', phone: '(11) 99999-9876' },
  { name: 'Dr. Silva', relation: 'Médico', photo: '👨‍⚕️', phone: '(11) 99999-4321' },
];

function onlyDigits(s: string) {
  return s.replace(/\D+/g, '');
}

const Familia: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [form, setForm] = useState<Omit<Contact, 'id'>>({
    name: '',
    relation: '',
    photo: '👤',
    phone: '',
  });
  const [loading, setLoading] = useState(true);

  async function load() {
    const list = await db.contacts.toArray();
    if (list.length === 0) {
      // sem dados? cria o seed (seus contatos de exemplo)
      await db.contacts.bulkAdd(seedContacts as Contact[]);
      const seeded = await db.contacts.toArray();
      setContacts(seeded);
    } else {
      setContacts(list);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addContact(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.relation || !form.phone) {
      toast({ title: 'Preencha nome, relação e telefone.', variant: 'destructive' });
      return;
    }
    await db.contacts.add(form);
    setForm({ name: '', relation: '', photo: '👤', phone: '' });
    toast({ title: 'Contato adicionado!' });
    load();
  }

  async function deleteContact(id?: number) {
    if (!id) return;
    await db.contacts.delete(id);
    toast({ title: 'Contato removido.' });
    load();
  }

  // web: tenta abrir discador; tauri: também funciona (abre o handler do sistema)
  function callNumber(phone: string) {
    const digits = onlyDigits(phone);
    if (!digits) {
      toast({ title: 'Telefone inválido', variant: 'destructive' });
      return;
    }
    window.location.href = `tel:+${digits}`;
  }

  const handleAction = (contact: Contact, type: 'voice' | 'video' | 'message') => {
    if (type === 'voice') {
      callNumber(contact.phone);
      return;
    }
    const actions = {
      video: 'Iniciando videochamada com',
      message: 'Enviando mensagem de voz para',
    } as const;
    toast({
      title: `📞 ${actions[type]} ${contact.name}`,
      description: `Conectando com ${contact.relation}...`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Falar com a Família" showBack onBack={() => navigate('/')} />

      <main className="p-6 space-y-6">
        <div className="flex justify-center mb-6">
          <img src={familyIcon} alt="Ícone da família" className="w-24 h-24 object-contain" />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Seus Contatos Favoritos</h2>
          <p className="text-muted-foreground text-lg flex items-center justify-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Toque para ligar
          </p>
        </div>

        {/* Formulário simples para adicionar contato */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <form onSubmit={addContact} className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="md:col-span-1">
                <label className="text-sm text-muted-foreground">Ícone/Emoji</label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="👤"
                  value={form.photo}
                  onChange={(e) => setForm({ ...form, photo: e.target.value || '👤' })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground">Nome</label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Nome"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="md:col-span-1">
                <label className="text-sm text-muted-foreground">Relação</label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Filho, Neta, Médico..."
                  value={form.relation}
                  onChange={(e) => setForm({ ...form, relation: e.target.value })}
                />
              </div>
              <div className="md:col-span-1">
                <label className="text-sm text-muted-foreground">Telefone</label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="(11) 99999-0000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="md:col-span-5 flex justify-end">
                <Button type="submit" size="lg" className="gap-2">
                  <UserPlus className="h-5 w-5" />
                  Adicionar contato
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
          {loading ? (
            <p className="text-center text-muted-foreground">Carregando...</p>
          ) : contacts.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhum contato ainda.</p>
          ) : (
            contacts.map((contact) => (
              <Card key={contact.id} className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-6xl">{contact.photo || '👤'}</div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold">{contact.name}</h3>
                      <p className="text-lg text-muted-foreground">{contact.relation}</p>
                      <p className="text-sm text-muted-foreground">{contact.phone}</p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => deleteContact(contact.id)}
                      title="Excluir"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      onClick={() => handleAction(contact, 'voice')}
                      variant="communication"
                      size="lg"
                      className="flex flex-col gap-2 p-4"
                    >
                      <Phone className="h-6 w-6" />
                      <span className="text-sm">Ligar</span>
                    </Button>

                    <Button
                      onClick={() => handleAction(contact, 'video')}
                      variant="communication"
                      size="lg"
                      className="flex flex-col gap-2 p-4"
                    >
                      <Video className="h-6 w-6" />
                      <span className="text-sm">Vídeo</span>
                    </Button>

                    <Button
                      onClick={() => handleAction(contact, 'message')}
                      variant="accent"
                      size="lg"
                      className="flex flex-col gap-2 p-4"
                    >
                      <Mic className="h-6 w-6" />
                      <span className="text-sm">Áudio</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <SOSButton />
    </div>
  );
};

export default Familia;
