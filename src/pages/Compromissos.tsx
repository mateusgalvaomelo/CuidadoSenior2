import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import SOSButton from '@/components/SOSButton';
import { Calendar, Plus, Clock, MapPin, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'medical' | 'personal';
}

const Compromissos: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const appointments: Appointment[] = [
    {
      id: 1,
      title: "Consulta Cardiologista",
      date: "Hoje",
      time: "14:00",
      location: "Hospital São Lucas",
      type: "medical"
    },
    {
      id: 2,
      title: "Fisioterapia",
      date: "Amanhã",
      time: "09:00",
      location: "Clínica Vida",
      type: "medical"
    },
    {
      id: 3,
      title: "Aniversário da Ana",
      date: "Sábado",
      time: "18:00",
      location: "Casa da Maria",
      type: "personal"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Meus Compromissos" 
        showBack 
        onBack={() => navigate('/')}
      />
      
      <main className="p-6 space-y-6">
        <div className="flex justify-center mb-6">
          <Calendar className="w-24 h-24 text-primary" />
        </div>

        <Button
          variant="elder"
          size="elder"
          className="w-full"
          onClick={() => toast({
            title: "Em breve!",
            description: "Função para adicionar compromisso em desenvolvimento."
          })}
        >
          <Plus className="h-6 w-6" />
          Novo Compromisso
        </Button>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-6 w-6 text-accent" />
            Próximos Compromissos
          </h2>

          {appointments.map((appointment) => (
            <Card key={appointment.id} className="shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3">
                  {appointment.type === 'medical' ? (
                    <Stethoscope className="h-8 w-8 text-health" />
                  ) : (
                    <Calendar className="h-8 w-8 text-accent" />
                  )}
                  <div>
                    <span className="text-xl">{appointment.title}</span>
                    <p className="text-sm text-muted-foreground font-normal">
                      {appointment.date} às {appointment.time}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg">{appointment.location}</span>
                </div>
                
                <Button
                  onClick={() => toast({
                    title: "🔔 Lembrete ativado!",
                    description: `Você será lembrado 1 hora antes de ${appointment.title}.`
                  })}
                  variant={appointment.type === 'medical' ? 'health' : 'accent'}
                  size="lg"
                  className="w-full"
                >
                  Ativar Lembrete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <SOSButton />
    </div>
  );
};

export default Compromissos;