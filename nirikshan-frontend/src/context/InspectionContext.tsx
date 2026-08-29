import React, { createContext, useContext, useState, useEffect } from 'react';
import type { InspectionDetail, InspectionStatus } from '../types';
import { apiService } from '../services/api';

interface InspectionContextValue {
  inspections: InspectionDetail[];
  updateInspectionStatus: (id: string, status: InspectionStatus, additionalNotes?: string) => Promise<void>;
  refreshInspections: () => Promise<void>;
}

const InspectionContext = createContext<InspectionContextValue | null>(null);

export const InspectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inspections, setInspections] = useState<InspectionDetail[]>([]);

  const refreshInspections = async () => {
    const data = await apiService.getInspections();
    setInspections(data);
  };

  useEffect(() => {
    refreshInspections();
  }, []);

  const updateInspectionStatus = async (id: string, status: InspectionStatus, additionalNotes?: string) => {
    await apiService.updateInspectionStatus(id, status, additionalNotes);
    await refreshInspections();
  };

  return (
    <InspectionContext.Provider value={{ inspections, updateInspectionStatus, refreshInspections }}>
      {children}
    </InspectionContext.Provider>
  );
};

export const useInspections = () => {
  const ctx = useContext(InspectionContext);
  if (!ctx) throw new Error('useInspections must be used within <InspectionProvider>');
  return ctx;
};
