import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import SOSButton from '@/components/SOSButton';
import { Pill, Plus, Clock, Bell, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import medicineIcon from '@/assets/medicine-icon.png';

interface Medication {
  id: number;
  name: string;
  dosage: string;
  times: string[];
  taken: boolean;
}

const Medicamentos: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [medications] = useState<Medication[]>([
    {
      id: 1,
      name: "Losartana",
      dosage: "50mg",
      times: ["08:00", "20:00"],
      taken: false
    },
    {
      id: 2,
      name: "Omeprazol",
      dosage: "20mg",
      times: ["08:00"],
      taken: true
    },
    {
      id: 3,
      name: "Sinvastatina",
      dosage: "40mg",
      times: ["22:00"],
      taken: false
    }
  ]);

  const handleTakeMedication = (medicationName: string) => {
    toast({
      title: "✅ Medicamento tomado!",
      description: `${medicationName} foi marcado como tomado.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Meus Remédios" 
        showBack 
        onBack={() => navigate('/')}
      />
      
      <main className="p-6 space-y-6">
        <div className="flex justify-center mb-6">
          <img 
            src={medicineIcon} 
            alt="Ícone de medicamentos" 
            className="w-24 h-24 object-contain"
          />
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            variant="health"
            size="lg"
            className="flex-1"
            onClick={() => toast({
              title: "Em breve!",
              description: "Função para adicionar medicamento em desenvolvimento."
            })}
          >
            <Plus className="h-5 w-5" />
            Adicionar Remédio
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => toast({
              title: "Em breve!",
              description: "Histórico em desenvolvimento."
            })}
          >
            <History className="h-5 w-5" />
            Histórico
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-6 w-6 text-accent animate-bounce" />
            <h2 className="text-xl font-semibold">Medicamentos de Hoje</h2>
          </div>

          {medications.map((medication) => (
            <Card key={medication.id} className="shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Pill className="h-8 w-8 text-health" />
                    <div>
                      <span className="text-xl">{medication.name}</span>
                      <p className="text-sm text-muted-foreground font-normal">
                        {medication.dosage}
                      </p>
                    </div>
                  </div>
                  {medication.taken && (
                    <span className="text-health font-semibold">✅ Tomado</span>
                  )}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg">
                    Horários: {medication.times.join(', ')}
                  </span>
                </div>
                
                {!medication.taken && (
                  <Button
                    onClick={() => handleTakeMedication(medication.name)}
                    variant="health"
                    size="lg"
                    className="w-full"
                  >
                    Marcar como Tomado
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <SOSButton />
    </div>
  );
};

export default Medicamentos;