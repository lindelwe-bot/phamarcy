import Dexie, { Table } from 'dexie';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export interface Patient {
  id?: number;
  name: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  medicalHistory: string;
  allergies: string[];
  paymentMethod: 'medical_aid' | 'cash' | 'credit_card';
  medicalAid?: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
    membershipNumber: string;
    planType: string;
    expiryDate: string;
    dependents: Array<{
      name: string;
      relationship: string;
      dateOfBirth: string;
    }>;
    coPayPercentage: number;
    annualLimit: number;
    remainingBalance: number;
  };
  status: 'active' | 'inactive';
  syncStatus?: 'synced' | 'pending' | 'error';
  lastModified?: number;
}

export interface OrderItem {
  id: string;
  medication: string;
  quantity: number;
  price: number;
  dosage: string;
  instructions: string;
}

export interface Order {
  id?: number;
  patientId: number;
  patientName: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'medical_aid' | 'cash' | 'credit_card';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'processing' | 'completed' | 'cancelled';
  orderDate: string;
  deliveryDate?: string;
  notes?: string;
  syncStatus?: 'synced' | 'pending' | 'error';
  lastModified?: number;
}

export interface Medication {
  id?: number;
  name: string;
  quantity: number;
  category: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  price: number;
  supplier: string;
  expiryDate: string;
  batchNumber: string;
  lastModified?: number;
}

class PharmacyDatabase extends Dexie {
  patients!: Table<Patient, number>;
  orders!: Table<Order, number>;
  medications!: Table<Medication, number>;

  constructor() {
    super('PharmacyDB');
    
    // Define the database schema
    this.version(1).stores({
      patients: '++id, name, phone, email, status, syncStatus, lastModified',
      orders: '++id, patientId, patientName, orderDate, orderStatus, syncStatus, lastModified',
      medications: '++id, name, category, status, lastModified'
    });

    // Add error handling for database initialization
    this.on('close', () => {
      console.log('Database connection closed');
    });

    // Add ready event handler
    this.on('ready', () => {
      console.log('Database is ready');
    });
  }
}

let db: PharmacyDatabase | null = null;

// Initialize the database in browser environment
if (isBrowser) {
  try {
    // Delete existing database if it exists
    const dbName = 'PharmacyDB';
    const request = indexedDB.deleteDatabase(dbName);
    
    request.onerror = (event: Event) => {
      console.error('Error deleting database:', event);
    };
    
    request.onsuccess = () => {
      console.log('Old database deleted successfully');
      // Create new database instance
      db = new PharmacyDatabase();
    };
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

class DataService {
  private getDb(): PharmacyDatabase {
    if (!isBrowser || !db) {
      throw new Error('Database is not available in this environment');
    }
    return db;
  }

  // Patient methods
  async addPatient(patient: Omit<Patient, 'id'>): Promise<number> {
    if (!isBrowser) {
      throw new Error('Database operations are only available in browser environment');
    }
    try {
      // Validate required fields
      if (!patient.name?.trim()) {
        throw new Error('Patient name is required');
      }
      if (!patient.dateOfBirth) {
        throw new Error('Date of birth is required');
      }
      if (!patient.phone?.trim()) {
        throw new Error('Phone number is required');
      }
      if (!patient.email?.trim()) {
        throw new Error('Email is required');
      }
      if (!patient.address?.street?.trim()) {
        throw new Error('Street address is required');
      }
      if (!patient.address?.city?.trim()) {
        throw new Error('City is required');
      }

      const database = this.getDb();
      const id = await database.patients.add({
        ...patient,
        syncStatus: 'pending',
        lastModified: Date.now()
      });
      return id;
    } catch (error) {
      console.error('Error adding patient:', error);
      throw error instanceof Error ? error : new Error('Failed to add patient');
    }
  }

  async updatePatient(id: number, patient: Partial<Patient>): Promise<void> {
    if (!id) {
      throw new Error('Patient ID is required');
    }

    const existingPatient = await this.getPatient(id);
    if (!existingPatient) {
      throw new Error('Patient not found');
    }

    // Validate email if provided
    if (patient.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(patient.email)) {
        throw new Error('Invalid email format');
      }
    }

    // Validate phone if provided
    if (patient.phone) {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(patient.phone)) {
        throw new Error('Invalid phone number format');
      }
    }

    await this.getDb().patients.update(id, {
      ...patient,
      syncStatus: 'pending',
      lastModified: Date.now()
    });
  }

  async deletePatient(id: number): Promise<void> {
    if (!id) {
      throw new Error('Patient ID is required');
    }

    const existingPatient = await this.getPatient(id);
    if (!existingPatient) {
      throw new Error('Patient not found');
    }

    // Check if patient has any orders
    const patientOrders = await this.getPatientOrders(id);
    if (patientOrders.length > 0) {
      throw new Error('Cannot delete patient with existing orders');
    }

    await this.getDb().patients.delete(id);
  }

  async getAllPatients(): Promise<Patient[]> {
    try {
      const database = this.getDb();
      return await database.patients.toArray();
    } catch (error) {
      console.error('Error getting all patients:', error);
      throw new Error('Failed to get patients');
    }
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    if (!id) {
      throw new Error('Patient ID is required');
    }
    try {
      const database = this.getDb();
      return await database.patients.get(id);
    } catch (error) {
      console.error('Error getting patient:', error);
      throw new Error('Failed to get patient');
    }
  }

  async searchPatients(query: string): Promise<Patient[]> {
    if (!query?.trim()) {
      return this.getAllPatients();
    }

    try {
      const searchLower = query.toLowerCase();
      const database = this.getDb();
      return await database.patients
        .filter(patient => 
          patient.name.toLowerCase().includes(searchLower) ||
          patient.phone.includes(query) ||
          patient.email.toLowerCase().includes(searchLower)
        )
        .toArray();
    } catch (error) {
      console.error('Error searching patients:', error);
      throw new Error('Failed to search patients');
    }
  }

  // Order methods
  async addOrder(order: Omit<Order, 'id'>): Promise<number> {
    const id = await this.getDb().orders.add({
      ...order,
      syncStatus: 'pending',
      lastModified: Date.now()
    });
    return id;
  }

  async updateOrder(id: number, order: Partial<Order>): Promise<void> {
    await this.getDb().orders.update(id, {
      ...order,
      syncStatus: 'pending',
      lastModified: Date.now()
    });
  }

  async deleteOrder(id: number): Promise<void> {
    await this.getDb().orders.delete(id);
  }

  async getAllOrders(): Promise<Order[]> {
    return await this.getDb().orders.toArray();
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return await this.getDb().orders.get(id);
  }

  async getPatientOrders(patientId: number): Promise<Order[]> {
    return await this.getDb().orders
      .where('patientId')
      .equals(patientId)
      .toArray();
  }

  async searchOrders(query: string): Promise<Order[]> {
    return await this.getDb().orders
      .where('patientName')
      .startsWithIgnoreCase(query)
      .or('items')
      .startsWithIgnoreCase(query)
      .toArray();
  }

  // Medication methods
  async addMedication(medication: Omit<Medication, 'id'>): Promise<number> {
    if (!isBrowser) {
      throw new Error('Database operations are only available in browser environment');
    }
    try {
      const database = this.getDb();
      const id = await database.medications.add({
        ...medication,
        lastModified: Date.now()
      });
      return id;
    } catch (error) {
      console.error('Error adding medication:', error);
      throw error instanceof Error ? error : new Error('Failed to add medication');
    }
  }

  async updateMedication(id: number, medication: Partial<Medication>): Promise<void> {
    if (!id) {
      throw new Error('Medication ID is required');
    }
    try {
      const database = this.getDb();
      await database.medications.update(id, {
        ...medication,
        lastModified: Date.now()
      });
    } catch (error) {
      console.error('Error updating medication:', error);
      throw error instanceof Error ? error : new Error('Failed to update medication');
    }
  }

  async deleteMedication(id: number): Promise<void> {
    if (!id) {
      throw new Error('Medication ID is required');
    }
    try {
      const database = this.getDb();
      await database.medications.delete(id);
    } catch (error) {
      console.error('Error deleting medication:', error);
      throw error instanceof Error ? error : new Error('Failed to delete medication');
    }
  }

  async getAllMedications(): Promise<Medication[]> {
    try {
      const database = this.getDb();
      return await database.medications.toArray();
    } catch (error) {
      console.error('Error getting all medications:', error);
      throw new Error('Failed to get medications');
    }
  }

  async searchMedications(query: string): Promise<Medication[]> {
    if (!query?.trim()) {
      return this.getAllMedications();
    }
    try {
      const database = this.getDb();
      const searchLower = query.toLowerCase();
      return await database.medications
        .filter(medication => 
          medication.name.toLowerCase().includes(searchLower) ||
          medication.category.toLowerCase().includes(searchLower) ||
          medication.supplier.toLowerCase().includes(searchLower)
        )
        .toArray();
    } catch (error) {
      console.error('Error searching medications:', error);
      throw new Error('Failed to search medications');
    }
  }

  // Sync method
  async syncData(): Promise<void> {
    if (!navigator.onLine) {
      throw new Error('Cannot sync while offline');
    }

    // Get all pending patients and orders
    const pendingPatients = await this.getDb().patients
      .where('syncStatus')
      .equals('pending')
      .toArray();

    const pendingOrders = await this.getDb().orders
      .where('syncStatus')
      .equals('pending')
      .toArray();

    // Simulate API calls for patients
    for (const patient of pendingPatients) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (patient.id) {
          await this.updatePatient(patient.id, { syncStatus: 'synced' });
        }
      } catch (error) {
        if (patient.id) {
          await this.updatePatient(patient.id, { syncStatus: 'error' });
        }
      }
    }

    // Simulate API calls for orders
    for (const order of pendingOrders) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (order.id) {
          await this.updateOrder(order.id, { syncStatus: 'synced' });
        }
      } catch (error) {
        if (order.id) {
          await this.updateOrder(order.id, { syncStatus: 'error' });
        }
      }
    }
  }
}

// Export a singleton instance
export const dataService = new DataService(); 