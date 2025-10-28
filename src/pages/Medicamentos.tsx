// src/pages/Medicamentos.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import SOSButton from '@/components/SOSButton';
import { Pill, Plus, Clock, Bell, History, Trash2, Pencil, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import medicineIcon from '@/assets/medicine-icon.png';
import { db, type Medication, type MedicationIntake, todayISO } from '@/db';

type FormState = {
  name: string;
  dosage: string;
  timesInput: string; // "08:00, 20:00"
  notes?: string;
};

function parseTimes(input: string): string[] {
  return input
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)
    .map(t => {
      // normaliza HH:mm
      const m = t.match(/^(\d{1,2}):(\d{2})$/);
      if (!m) return t; // retorna como veio, validamos no UI
      const hh = String(Math.min(23, Number(m[1]))).padStart(2, '0');
      const mm = String(Math.min(59, Number(m[2]))).padStart(2, '0');
      return `${hh}:${mm}`;
    });
}

const Medicamentos: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [meds, setMeds] = useState<Medication[]>([]);
  const [intakes, setIntakes] = useState<MedicationIntake[]>([]);
  const [form, setForm] = useState<FormState>({ name: '', dosage: '', timesInput: '', notes: '' });

  // edição inline
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<FormState>({ name: '', dosage: '', timesInput: '', notes: '' });

  const today = useMemo(() => todayISO(), []);

  async function ensureTodayIntakes(med: Medication) {
    const existing = await db.medicationIntakes
      .where({ medicationId: med.id!, date: today })
      .toArray();

    const existingKeys = new Set(existing.map(e => `${e.date}|${e.time}`));
    const toAdd: MedicationIntake[] = [];

    for (const t of med.times) {
      const key = `${today}|${t}`;
      if (!existingKeys.has(key)) {
        toAdd.push({
          medicationId: med.id!,
          date: today,
          time: t,
          taken: false,
        });
      }
    }
    if (toAdd.length) await db.medicationIntakes.bulkAdd(toAdd);
  }

  async function loadAll() {
    setLoading(true);
    const list = await db.medications.orderBy('createdAt').toArray();
    setMeds(list);

    // garante as tomadas de hoje para cada med
    for (const m of list) await ensureTodayIntakes(m);

    const todayIntakes = await db.medicationIntakes.where('date').equals(today).toArray();
    setIntakes(todayIntakes);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function timesToInput(times: string[]): string {
    return times.join(', ');
  }

  async function addMedication(e: React.FormEvent) {
    e.preventDefault();
    const times = parseTimes(form.timesInput);
    if (!form.name || !form.dosage || times.length === 0) {
      toast({ title: 'Preencha nome, dosagem e pelo menos 1 horário.', variant: 'destructive' });
      return;
    }

    const now = Date.now();
    const id = await db.medications.add({
      name: form.name.trim(),
      dosage: form.dosage.trim(),
      times,
      notes: form.notes?.trim(),
      createdAt: now,
      updatedAt: now,
    });

    // cria tomadas de hoje
    for (const t of times) {
      await db.medicationIntakes.add({
        medicationId: id,
        date: today,
        time: t,
        taken: false,
      });
    }

    setForm({ name: '', dosage: '', timesInput: '', notes: '' });
    toast({ title: '✅ Medicamento adicionado!' });
    loadAll();
  }

  async function removeMedication(id?: number) {
    if (!id) return;
    await db.transaction('rw', db.medications, db.medicationIntakes, async () => {
      await db.medicationIntakes.where('medicationId').equals(id).delete();
      await db.medications.delete(id);
    });
    toast({ title: 'Medicamento removido.' });
    loadAll();
  }

  function beginEdit(m: Medication) {
    setEditingId(m.id!);
    setEditForm({
      name: m.name,
      dosage: m.dosage,
      timesInput: timesToInput(m.times),
      notes: m.notes ?? '',
    });
  }

  async function saveEdit(id: number) {
    const times = parseTimes(editForm.timesInput);
    if (!editForm.name || !editForm.dosage || times.length === 0) {
      toast({ title: 'Preencha nome, dosagem e ao menos 1 horário.', variant: 'destructive' });
      return;
    }

    await db.transaction('rw', db.medications, db.medicationIntakes, async () => {
      await db.medications.update(id, {
        name: editForm.name.trim(),
        dosage: editForm.dosage.trim(),
        times,
        notes: editForm.notes?.trim(),
        updatedAt: Date.now(),
      });

      // Recria as tomadas de HOJE conforme novos horários (sem mexer em históricos de outros dias)
      await db.medicationIntakes.where({ medicationId: id, date: today }).delete();
      const fresh: MedicationIntake[] = times.map(t => ({
        medicationId: id,
        date: today,
        time: t,
        taken: false,
      }));
      if (fresh.length) await db.medicationIntakes.bulkAdd(fresh);
    });

    setEditingId(null);
    toast({ title: '✅ Medicamento atualizado!' });
    loadAll();
  }

  async function toggleTaken(intake: MedicationIntake) {
    const newVal = !intake.taken;
    await db.medicationIntakes.update(intake.id!, {
      taken: newVal,
      takenAt: newVal ? Date.now() : undefined,
    });
    setIntakes(prev =>
      prev.map(i => (i.id === intake.id ? { ...i, taken: newVal, takenAt: newVal ? Date.now() : undefined } : i)),
    );
    toast({
      title: newVal ? '✅ Tomado!' : '⏪ Desmarcado',
      description: `${intake.time} atualizado.`,
    });
  }

  function getTodayIntakesFor(medId: number): MedicationIntake[] {
    return intakes
      .filter(i => i.medicationId === medId && i.date === today)
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Meus Remédios" showBack onBack={() => navigate('/')} />

      <main className="p-6 space-y-6">
        <div className="flex justify-center mb-2">
          <img src={medicineIcon} alt="Ícone de medicamentos" className="w-24 h-24 object-contain" />
        </div>

        {/* Ações topo */}
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-accent animate-bounce" />
            <h2 className="text-xl font-semibold">Medicamentos de Hoje</h2>
          </div>

          <Button
            variant="outline"
            size="lg"
            onClick={() =>
              toast({
                title: 'Histórico do dia',
                description:
                  'Cada horário marcado como "Tomado" fica registrado nas tomadas do dia. Uma tela de histórico detalhado pode ser adicionada depois.',
              })
            }
          >
            <History className="h-5 w-5" />
            Histórico
          </Button>
        </div>

        {/* Formulário adicionar */}
        <Card className="max-w-3xl">
          <CardContent className="p-6">
            <form onSubmit={addMedication} className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-4">
                <label className="text-sm text-muted-foreground">Nome</label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Losartana"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-sm text-muted-foreground">Dosagem</label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="50mg"
                  value={form.dosage}
                  onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                />
              </div>

              <div className="md:col-span-5">
                <label className="text-sm text-muted-foreground">Horários (separe por vírgula)</label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="08:00, 20:00"
                  value={form.timesInput}
                  onChange={(e) => setForm({ ...form, timesInput: e.target.value })}
                />
              </div>

              <div className="md:col-span-12">
                <label className="text-sm text-muted-foreground">Observações (opcional)</label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Tomar após o café"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="md:col-span-12 flex justify-end">
                <Button type="submit" size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Adicionar Remédio
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Lista de medicamentos */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-muted-foreground">Carregando...</p>
          ) : meds.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhum medicamento cadastrado.</p>
          ) : (
            meds.map((m) => {
              const todays = getTodayIntakesFor(m.id!);
              const isEditing = editingId === m.id;

              return (
                <Card key={m.id} className="shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Pill className="h-8 w-8 text-health" />
                        {!isEditing ? (
                          <div>
                            <span className="text-xl">{m.name}</span>
                            <p className="text-sm text-muted-foreground font-normal">
                              {m.dosage} {m.notes ? `• ${m.notes}` : ''}
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
                            <input
                              className="border rounded-md px-3 py-2"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                            <input
                              className="border rounded-md px-3 py-2"
                              value={editForm.dosage}
                              onChange={(e) => setEditForm({ ...editForm, dosage: e.target.value })}
                            />
                            <input
                              className="border rounded-md px-3 py-2"
                              placeholder="08:00, 20:00"
                              value={editForm.timesInput}
                              onChange={(e) => setEditForm({ ...editForm, timesInput: e.target.value })}
                            />
                            <input
                              className="border rounded-md px-3 py-2 md:col-span-3"
                              placeholder="Observações"
                              value={editForm.notes}
                              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {!isEditing ? (
                          <>
                            <Button variant="outline" onClick={() => beginEdit(m)} title="Editar">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" onClick={() => removeMedication(m.id)} title="Excluir">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="health" onClick={() => saveEdit(m.id!)} title="Salvar alterações">
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

                  {/* horários do dia */}
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <span className="text-lg">
                        Horários de hoje: {todays.length ? todays.map(t => t.time).join(', ') : '—'}
                      </span>
                    </div>

                    {todays.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {todays.map((intake) => (
                          <Button
                            key={intake.id}
                            onClick={() => toggleTaken(intake)}
                            variant={intake.taken ? 'health' : 'secondary'}
                            size="lg"
                            className="flex items-center justify-between"
                          >
                            <span>{intake.time}</span>
                            <span className="text-sm">{intake.taken ? '✅ Tomado' : 'Marcar como Tomado'}</span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>

      <SOSButton />
    </div>
  );
};

export default Medicamentos;
