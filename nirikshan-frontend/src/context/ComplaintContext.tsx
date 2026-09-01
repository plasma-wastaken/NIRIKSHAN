import React, { createContext, useContext, useState, useEffect } from "react";
import type { ComplaintDetail, ComplaintStatus } from "../types";
import { useAuth } from "./AuthContext";
import { getComplaints, createComplaint } from "../services/api";

interface ComplaintContextValue {
  complaints: ComplaintDetail[];
  loading: boolean;
  error: string | null;
  addComplaint: (complaint: Omit<ComplaintDetail, "complaint_id" | "citizen_id" | "created_at" | "status">) => Promise<string>;
  updateComplaintStatus: (complaint_id: string, status: ComplaintStatus) => Promise<void>;
  linkComplaintToTicket: (complaint_id: string, ticket_id: string) => Promise<void>;
  linkComplaintToInspection: (complaint_id: string, inspection_id: string) => Promise<void>;
  refreshComplaints: () => Promise<void>;
}

const ComplaintContext = createContext<ComplaintContextValue | null>(null);

export const ComplaintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [complaints, setComplaints] = useState<ComplaintDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getComplaints();
      setComplaints(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch complaints';
      setError(errorMessage);
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshComplaints();
  }, []);

  const addComplaint = async (data: Omit<ComplaintDetail, "complaint_id" | "citizen_id" | "created_at" | "status">): Promise<string> => {
    try {
      const newComplaint: Omit<ComplaintDetail, "complaint_id" | "created_at"> = {
        ...data,
        citizen_id: currentUser?.user_id || 'USR-CIT-001',
        status: "SUBMITTED",
      };
      const created = await createComplaint(newComplaint);
      await refreshComplaints();
      return created.complaint_id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create complaint';
      setError(errorMessage);
      console.error('Failed to create complaint:', err);
      throw err;
    }
  };

  const updateComplaintStatus = async (complaint_id: string, status: ComplaintStatus) => {
    try {
      // Update local state for now - in real API this would call an endpoint
      setComplaints(prev => prev.map(comp => 
        comp.complaint_id === complaint_id ? { ...comp, status } : comp
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update complaint status';
      setError(errorMessage);
      console.error('Failed to update complaint status:', err);
      throw err;
    }
  };

  const linkComplaintToTicket = async (complaint_id: string, ticket_id: string) => {
    try {
      // Update local state for now - in real API this would call an endpoint
      setComplaints(prev => prev.map(comp => 
        comp.complaint_id === complaint_id ? { ...comp, ticket_id } : comp
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to link complaint to ticket';
      setError(errorMessage);
      console.error('Failed to link complaint to ticket:', err);
      throw err;
    }
  };

  const linkComplaintToInspection = async (complaint_id: string, inspection_id: string) => {
    try {
      // Update local state for now - in real API this would call an endpoint
      setComplaints(prev => prev.map(comp => 
        comp.complaint_id === complaint_id ? { ...comp, inspection_id } : comp
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to link complaint to inspection';
      setError(errorMessage);
      console.error('Failed to link complaint to inspection:', err);
      throw err;
    }
  };

  return (
    <ComplaintContext.Provider value={{ complaints, loading, error, addComplaint, updateComplaintStatus, linkComplaintToTicket, linkComplaintToInspection, refreshComplaints }}>
      {children}
    </ComplaintContext.Provider>
  );
};

export const useComplaints = () => {
  const ctx = useContext(ComplaintContext);
  if (!ctx) throw new Error("useComplaints must be used within <ComplaintProvider>");
  return ctx;
};
