// src/pages/Adm.tsx
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import SOSButton from "@/components/SOSButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"; // precisa existir
import { Shield, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db, type Contact } from "@/db";
import { useToast } from "@/hooks/use-toast";

const Adm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const list = await db.contacts.orderBy("name").toArray();
      setContacts(list);
      setLoading(false);
    })();
  }, []);

  async function toggleAdmin(c: Contact, checked: boolean) {
    await db.contacts.update(c.id!, { isAdmin: checked });
    setContacts(prev => prev.map(x => (x.id === c.id ? { ...x, isAdmin: checked } : x)));
    toast({ title: checked ? "Acesso de ADM concedido" : "Acesso de ADM revogado" });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Administração" showBack onBack={() => navigate("/")} />
      <main className="p-6 space-y-6 max-w-3xl mx-auto">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Gerenciar Acesso de Terceiros
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Ative a chave para permitir que um familiar/cuidador gerencie o app (visual).
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              Contatos com permissão ADM
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : contacts.length === 0 ? (
              <p className="text-muted-foreground">Nenhum contato cadastrado.</p>
            ) : (
              <div className="space-y-3">
                {contacts.map(c => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{c.photo || "👤"}</div>
                      <div>
                        <div className="font-semibold">{c.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {c.relation} • {c.phone}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm">ADM</span>
                      <Switch checked={!!c.isAdmin} onCheckedChange={v => toggleAdmin(c, v)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => navigate("/familia")}>
            Ir para Família
          </Button>
        </div>
      </main>
      <SOSButton />
    </div>
  );
};

export default Adm;
