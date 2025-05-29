import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order } from '../types';
import { db } from '../db';

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrder: (id: string, order: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  syncOrders: () => void;
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

  const loadOrders = () => {
    try {
      setOrders(db.orders);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const addOrder = (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date().toISOString();
      const newOrder = {
        ...order,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now
      };
      db.orders.push(newOrder);
      setOrders([...db.orders]);
    } catch (error) {
      console.error('Error adding order:', error);
    }
  };

  const updateOrder = (id: string, order: Partial<Order>) => {
    try {
      const index = db.orders.findIndex(o => o.id === id);
      if (index !== -1) {
        db.orders[index] = {
          ...db.orders[index],
          ...order,
          updatedAt: new Date().toISOString()
        };
        setOrders([...db.orders]);
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const deleteOrder = (id: string) => {
    try {
      const index = db.orders.findIndex(o => o.id === id);
      if (index !== -1) {
        db.orders.splice(index, 1);
        setOrders([...db.orders]);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const syncOrders = () => {
    try {
      loadOrders();
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