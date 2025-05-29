import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Patient } from '../types';
import { db } from '../db';

interface PatientContextType {
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id'>) => void;
  updatePatient: (id: string, patient: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  syncPatients: () => void;
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

  const loadPatients = () => {
    try {
      setPatients(db.patients);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const addPatient = (patient: Omit<Patient, 'id'>) => {
    try {
      const newPatient = {
        ...patient,
        id: crypto.randomUUID()
      };
      db.patients.push(newPatient);
      setPatients([...db.patients]);
    } catch (error) {
      console.error('Error adding patient:', error);
    }
  };

  const updatePatient = (id: string, patient: Partial<Patient>) => {
    try {
      const index = db.patients.findIndex(p => p.id === id);
      if (index !== -1) {
        db.patients[index] = { ...db.patients[index], ...patient };
        setPatients([...db.patients]);
      }
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  };

  const deletePatient = (id: string) => {
    try {
      const index = db.patients.findIndex(p => p.id === id);
      if (index !== -1) {
        db.patients.splice(index, 1);
        setPatients([...db.patients]);
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  const syncPatients = () => {
    try {
      loadPatients();
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