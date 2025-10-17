// src/db.ts
import Dexie, { type EntityTable } from 'dexie';

export interface Contact {
  id?: number;
  name: string;
  relation: string;
  photo: string;  // emoji ou URL
  phone: string;
}

class AppDB extends Dexie {
  contacts!: EntityTable<Contact, 'id'>;
  constructor() {
    super('cuidado-senior');
    this.version(1).stores({
      contacts: '++id, name, relation, phone'
    });
  }
}

export const db = new AppDB();
export default db;
