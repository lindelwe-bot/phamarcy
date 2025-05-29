import { InventoryItem, Order, Patient } from './types';

// Mock database for development
export const db = {
  inventory: [] as InventoryItem[],
  orders: [] as Order[],
  patients: [] as Patient[],
  prescriptions: [],
  settings: {
    pharmacyName: 'My Pharmacy',
    address: '123 Main St',
    phone: '555-0123',
    email: 'contact@mypharmacy.com'
  }
};

// Helper functions for database operations
export const getInventory = () => db.inventory;
export const getOrders = () => db.orders;
export const getPatients = () => db.patients;
export const getPrescriptions = () => db.prescriptions;
export const getSettings = () => db.settings;

// Add type definitions
export interface Database {
  inventory: InventoryItem[];
  orders: Order[];
  patients: Patient[];
  prescriptions: any[];
  settings: {
    pharmacyName: string;
    address: string;
    phone: string;
    email: string;
  };
} 