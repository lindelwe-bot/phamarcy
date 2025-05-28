export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  address: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  category: string;
  expiryDate: string;
}

export interface Order {
  id: string;
  patientId: string;
  items: Array<{
    itemId: string;
    quantity: number;
    price: number;
  }>;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  updatedAt: string;
} 