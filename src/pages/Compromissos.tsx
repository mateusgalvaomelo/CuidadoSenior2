// src/pages/Compromissos.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import SOSButton from '@/components/SOSButton';
import { Calendar as CalendarIcon, MapPin, Clock, Plus, Pencil, Trash2, Save, X, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { db, type Appointment, todayISO } from '@/db';

type FormState = {
  title: string;
  date: string;    // YYYY-MM-DD
  time: string;    // HH:mm (opcional)
  location: string;
  notes: string;
};

function toDateKey(d: string) {
  // já vem YYYY-MM-DD; aqui só validaria se necessário
  return d;
}

function cmpDateTime(a: Appointment, b: Appointment) {
  const da = `${a.date} ${a.time ?? '00:00'}`;
  const dbv = `${b.date} ${b.time ?? '00:00'}`;
  return da.localeCompare(dbv);
}

const Compromissos: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Appointment[]>([]);
  const [form, setForm] = useState<FormState>({
    title: '',
    date: todayISO(),
    time: '',
    location: '',
    notes: ''
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<FormState>({
    title: '',
    date: todayISO(),
    time: '',
    location: '',
    notes: ''
  });

  const today = useMemo(() => todayISO(), []);

  async function loadAll() {
    setLoading(true);
    // traz tudo, ordena por data+hora, mostrando primeiro os não concluídos de hoje em diante
    const all = await db.appointments.toArray();
    all.sort(cmpDateTime);

    // estratégia simples: primeiro futuros/hoje, depois passados
    const future = all.filter(a => a.date >= today);
    const past   = all.filter(a => a.date <  today);

    setItems([...future, ...past]);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addAppointment(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.date) {
      toast({ title: 'Preencha pelo menos Título e Data.', variant: 'destructive' });
      return;
    }

    const now = Date.now();
    await db.appointments.add({
      title: form.title.trim(),
      date: toDateKey(form.date),
      time: form.time?.trim() || undefined,
      location: form.location?.trim() || undefined,
      notes: form.notes?.trim() || undefined,
      done: false,
      createdAt: now,
      updatedAt: now,
    });

    setForm({ title: '', date: today, time: '', location: '', notes: '' });
    toast({ title: '✅ Compromisso adicionado!' });
    loadAll();
  }

  function beginEdit(a: Appointment) {
    setEditingId(a.id!);
    setEditForm({
      title: a.title,
      date: a.date,
      time: a.time ?? '',
      location: a.location ?? '',
      notes: a.notes ?? ''
    });
  }

  async function saveEdit(id: number) {
    if (!editForm.title || !editForm.date) {
      toast({ title: 'Preencha Título e Data.', variant: 'destructive' });
      return;
    }
    await db.appointments.update(id, {
      title: editForm.title.trim(),
      date: toDateKey(editForm.date),
      time: editForm.time?.trim() || undefined,
      location: editForm.location?.trim() || undefined,
      notes: editForm.notes?.trim() || undefined,
      updatedAt: Date.now(),
    });
    setEditingId(null);
    toast({ title: '✅ Compromisso atualizado!' });
    loadAll();
  }

  async function removeAppointment(id?: number) {
    if (!id) return;
    await db.appointments.delete(id);
    toast({ title: 'Compromisso removido.' });
    loadAll();
  }

  async function toggleDone(a: Appointment) {
    const newVal = !a.done;
    await db.appointments.update(a.id!, { done: newVal, updatedAt: Date.now() });
    setItems(prev => prev.map(x => x.id === a.id ? { ...x, done: newVal } : x));
    toast({ title: newVal ? '✅ Marcado como concluído' : '⏪ Marcado como pendente' });
  }

  // Agrupar por data para visual mais limpo
  const grouped = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of items) {
      const k = toDateKey(a.date);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(a);
    }
    // ordena internamente por hora
    for (const arr of map.values()) arr.sort(cmpDateTime);
    // retorna array ordenado por data
    return Array.from(map.entries()).sort(([d1], [d2]) => d1.localeCompare(d2));
  }, [items]);

  return (
    <div className="min-h-screen bg-background">
      <Header title="Compromissos" showBack onBack={() => navigate('/')} />

      <main className="p-6 space-y-6">
        {/* Formulário de criação */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-6 w-6" />
              Novo Compromisso
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={addAppointment} className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-5">
                <label className="text-sm text-muted-foreground">Título</label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Consulta com Dr. Silva"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-sm text-muted-foreground">Data</label>
                <input
                  type="date"
                  className="w-full border rounded-md px-3 py-2"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground">Hora (opcional)</label>
                <input
                  type="time"
                  className="w-full border rounded-md px-3 py-2"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground">Local</label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Clínica Vida"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>

              <div className="md:col-span-12">
                <label className="text-sm text-muted-foreground">Observações</label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Levar exames"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="md:col-span-12 flex justify-end">
                <Button type="submit" size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Adicionar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Lista agrupada por data */}
        {loading ? (
          <p className="text-center text-muted-foreground">Carregando...</p>
        ) : grouped.length === 0 ? (
          <p className="text-center text-muted-foreground">Nenhum compromisso.</p>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {grouped.map(([date, arr]) => (
              <div key={date} className="space-y-3">
                <div className="flex items-center gap-2 text-foreground">
                  <CalendarIcon className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">
                    {date === today ? 'Hoje' : date}
                  </h3>
                </div>

                {arr.map((a) => {
                  const isEditing = editingId === a.id;

                  return (
                    <Card key={a.id} className="shadow-lg">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between">
                          {!isEditing ? (
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className={`h-6 w-6 ${a.done ? 'text-health' : 'text-muted-foreground'}`} />
                              <div>
                                <div className="text-xl">{a.title}</div>
                                <div className="text-sm text-muted-foreground flex flex-wrap gap-3">
                                  {a.time && (
                                    <span className="inline-flex items-center gap-1">
                                      <Clock className="h-4 w-4" /> {a.time}
                                    </span>
                                  )}
                                  {a.location && (
                                    <span className="inline-flex items-center gap-1">
                                      <MapPin className="h-4 w-4" /> {a.location}
                                    </span>
                                  )}
                                  {a.notes && <span>• {a.notes}</span>}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 w-full">
                              <input
                                className="border rounded-md px-3 py-2"
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                              />
                              <input
                                type="date"
                                className="border rounded-md px-3 py-2"
                                value={editForm.date}
                                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                              />
                              <input
                                type="time"
                                className="border rounded-md px-3 py-2"
                                value={editForm.time}
                                onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                              />
                              <input
                                className="border rounded-md px-3 py-2"
                                placeholder="Local"
                                value={editForm.location}
                                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                              />
                              <input
                                className="border rounded-md px-3 py-2 md:col-span-4"
                                placeholder="Observações"
                                value={editForm.notes}
                                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                              />
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            {!isEditing ? (
                              <>
                                <Button
                                  variant={a.done ? 'secondary' : 'health'}
                                  onClick={() => toggleDone(a)}
                                  title={a.done ? 'Marcar como pendente' : 'Marcar como concluído'}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" onClick={() => beginEdit(a)} title="Editar">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" onClick={() => removeAppointment(a.id)} title="Excluir">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button variant="health" onClick={() => saveEdit(a.id!)} title="Salvar">
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" onClick={() => setEditingId(null)} title="Cancelar">
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          Data: {a.date}{a.time ? ` • ${a.time}` : ''}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </main>

      <SOSButton />
    </div>
  );
};

export default Compromissos;
