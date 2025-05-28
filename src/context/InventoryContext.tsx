import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InventoryItem } from '../types';
import { db } from '../db';

interface InventoryContextType {
  inventory: InventoryItem[];
  addItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  updateItem: (id: string, item: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  syncInventory: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

interface InventoryProviderProps {
  children: ReactNode;
}

export const InventoryProvider: React.FC<InventoryProviderProps> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const allItems = await db.inventory.toArray();
      setInventory(allItems);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const addItem = async (item: Omit<InventoryItem, 'id'>) => {
    try {
      const id = await db.inventory.add({
        ...item,
        id: crypto.randomUUID()
      });
      await loadInventory();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const updateItem = async (id: string, item: Partial<InventoryItem>) => {
    try {
      await db.inventory.update(id, item);
      await loadInventory();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await db.inventory.delete(id);
      await loadInventory();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const syncInventory = async () => {
    try {
      await loadInventory();
    } catch (error) {
      console.error('Error syncing inventory:', error);
    }
  };

  return (
    <InventoryContext.Provider value={{
      inventory,
      addItem,
      updateItem,
      deleteItem,
      syncInventory
    }}>
      {children}
    </InventoryContext.Provider>
  );
}; 