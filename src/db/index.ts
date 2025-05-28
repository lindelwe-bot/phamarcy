import Dexie, { Table } from 'dexie';
import { Patient, InventoryItem, Order } from '../types';

export class PharmacyDatabase extends Dexie {
  patients!: Table<Patient>;
  inventory!: Table<InventoryItem>;
  orders!: Table<Order>;

  constructor() {
    super('PharmacyDB');
    this.version(1).stores({
      patients: 'id, name, age, gender, contact, address',
      inventory: 'id, name, description, quantity, price, category, expiryDate',
      orders: 'id, patientId, status, totalAmount, paymentStatus, createdAt, updatedAt'
    });
  }
}

export const db = new PharmacyDatabase(); 