import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InventoryItem } from '../types';
import { db } from '../db';

interface InventoryContextType {
  inventory: InventoryItem[];
  addItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateItem: (id: string, item: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  syncInventory: () => void;
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

  const loadInventory = () => {
    try {
      setInventory(db.inventory);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const addItem = (item: Omit<InventoryItem, 'id'>) => {
    try {
      const newItem = {
        ...item,
        id: crypto.randomUUID()
      };
      db.inventory.push(newItem);
      setInventory([...db.inventory]);
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const updateItem = (id: string, item: Partial<InventoryItem>) => {
    try {
      const index = db.inventory.findIndex(i => i.id === id);
      if (index !== -1) {
        db.inventory[index] = { ...db.inventory[index], ...item };
        setInventory([...db.inventory]);
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const deleteItem = (id: string) => {
    try {
      const index = db.inventory.findIndex(i => i.id === id);
      if (index !== -1) {
        db.inventory.splice(index, 1);
        setInventory([...db.inventory]);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const syncInventory = () => {
    try {
      loadInventory();
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