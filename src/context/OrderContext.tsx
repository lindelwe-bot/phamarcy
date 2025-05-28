import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order } from '../types';
import { db } from '../db';

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  syncOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const allOrders = await db.orders.toArray();
      setOrders(allOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const addOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date().toISOString();
      const id = await db.orders.add({
        ...order,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now
      });
      await loadOrders();
    } catch (error) {
      console.error('Error adding order:', error);
    }
  };

  const updateOrder = async (id: string, order: Partial<Order>) => {
    try {
      await db.orders.update(id, {
        ...order,
        updatedAt: new Date().toISOString()
      });
      await loadOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await db.orders.delete(id);
      await loadOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const syncOrders = async () => {
    try {
      await loadOrders();
    } catch (error) {
      console.error('Error syncing orders:', error);
    }
  };

  return (
    <OrderContext.Provider value={{
      orders,
      addOrder,
      updateOrder,
      deleteOrder,
      syncOrders
    }}>
      {children}
    </OrderContext.Provider>
  );
}; 