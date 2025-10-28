// src/db.ts
import Dexie, { Table } from 'dexie';

/* ========= Tipos de dados ========= */

// 📞 Contatos (Família)
export type Contact = {
  id?: number;
  name: string;
  relation: string;
  photo: string;   // emoji ou URL
  phone: string;
  isAdmin?: boolean; //
};

// 💊 Medicamentos
export type Medication = {
  id?: number;
  name: string;
  dosage: string;       // ex: "50mg"
  times: string[];      // ex: ["08:00", "20:00"]
  notes?: string;
  createdAt: number;
  updatedAt: number;
};

// 💊 Registro de tomadas (por dia e horário)
export type MedicationIntake = {
  id?: number;
  medicationId: number;
  date: string;         // "YYYY-MM-DD"
  time: string;         // "HH:mm"
  taken: boolean;
  takenAt?: number;     // epoch ms
};

// 📅 Compromissos
export type Appointment = {
  id?: number;
  title: string;
  date: string;         // "YYYY-MM-DD"
  time?: string;        // "HH:mm" (opcional)
  location?: string;
  notes?: string;
  done: boolean;
  createdAt: number;
  updatedAt: number;
};

/* ========= Banco de Dados ========= */

export class AppDB extends Dexie {
  contacts!: Table<Contact, number>;
  medications!: Table<Medication, number>;
  medicationIntakes!: Table<MedicationIntake, number>;
  appointments!: Table<Appointment, number>;

  constructor() {
    super('cuidado_senior_db');

    // v1: contatos
    this.version(1).stores({
      contacts: '++id, name, relation, phone',
    });

    // v2: medicamentos e tomadas
    this.version(2).stores({
      contacts: '++id, name, relation, phone',
      medications: '++id, name, createdAt',
      medicationIntakes: '++id, medicationId, date, time',
    });

    // v3: migrações internas se necessário
    this.version(3).stores({
      contacts: '++id, name, relation, phone',
      medications: '++id, name, createdAt',
      medicationIntakes: '++id, medicationId, date, time',
    }).upgrade(() => {
      // exemplo: normalizar dados antigos
    });

    // v4: compromissos
    this.version(4).stores({
      contacts: '++id, name, relation, phone',
      medications: '++id, name, createdAt',
      medicationIntakes: '++id, medicationId, date, time',
      appointments: '++id, date, createdAt'
    });
  }
}

/* ========= Instância Única ========= */

export const db = new AppDB();

/* ========= Helpers ========= */

// Retorna data atual em formato ISO (YYYY-MM-DD)
export function todayISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}
