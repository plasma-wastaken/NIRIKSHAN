import React, { createContext, useContext, useState, useEffect } from 'react';
import type { InspectionDetail, InspectionStatus } from '../types';
import { getInspections, submitInspection } from '../services/api';

interface InspectionContextValue {
  inspections: InspectionDetail[];
  loading: boolean;
  error: string | null;
  updateInspectionStatus: (id: string, status: InspectionStatus, additionalNotes?: string) => Promise<void>;
  refreshInspections: () => Promise<void>;
}

const InspectionContext = createContext<InspectionContextValue | null>(null);

export const InspectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inspections, setInspections] = useState<InspectionDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshInspections = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInspections();
      setInspections(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inspections';
      setError(errorMessage);
      console.error('Failed to fetch inspections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshInspections();
  }, []);

  const updateInspectionStatus = async (id: string, _status: InspectionStatus, additionalNotes?: string) => {
    try {
      await submitInspection(id, { inspector_notes: additionalNotes });
      await refreshInspections();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update inspection status';
      setError(errorMessage);
      console.error('Failed to update inspection status:', err);
      throw err;
    }
  };

  return (
    <InspectionContext.Provider value={{ inspections, loading, error, updateInspectionStatus, refreshInspections }}>
      {children}
    </InspectionContext.Provider>
  );
};

export const useInspections = () => {
  const ctx = useContext(InspectionContext);
  if (!ctx) throw new Error('useInspections must be used within <InspectionProvider>');
  return ctx;
};
