import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Patient } from '../types';
import { db } from '../db';

interface PatientContextType {
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id'>) => Promise<void>;
  updatePatient: (id: string, patient: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  syncPatients: () => Promise<void>;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const usePatients = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
};

interface PatientProviderProps {
  children: ReactNode;
}

export const PatientProvider: React.FC<PatientProviderProps> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const allPatients = await db.patients.toArray();
      setPatients(allPatients);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const addPatient = async (patient: Omit<Patient, 'id'>) => {
    try {
      const id = await db.patients.add({
        ...patient,
        id: crypto.randomUUID()
      });
      await loadPatients();
    } catch (error) {
      console.error('Error adding patient:', error);
    }
  };

  const updatePatient = async (id: string, patient: Partial<Patient>) => {
    try {
      await db.patients.update(id, patient);
      await loadPatients();
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  };

  const deletePatient = async (id: string) => {
    try {
      await db.patients.delete(id);
      await loadPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  const syncPatients = async () => {
    try {
      await loadPatients();
    } catch (error) {
      console.error('Error syncing patients:', error);
    }
  };

  return (
    <PatientContext.Provider value={{
      patients,
      addPatient,
      updatePatient,
      deletePatient,
      syncPatients
    }}>
      {children}
    </PatientContext.Provider>
  );
}; 