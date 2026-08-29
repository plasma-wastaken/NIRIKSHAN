import React, { createContext, useContext, useState, useEffect } from "react";
import type { ComplaintDetail, ComplaintStatus } from "../types";
import { useAuth } from "./AuthContext";
import { apiService } from "../services/api";

interface ComplaintContextValue {
  complaints: ComplaintDetail[];
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

  const refreshComplaints = async () => {
    const data = await apiService.getComplaints();
    setComplaints(data);
  };

  useEffect(() => {
    refreshComplaints();
  }, []);

  const addComplaint = async (data: Omit<ComplaintDetail, "complaint_id" | "citizen_id" | "created_at" | "status">): Promise<string> => {
    const newId = `CMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newComplaint: ComplaintDetail = {
      ...data,
      complaint_id: newId,
      citizen_id: currentUser.user_id,
      created_at: new Date().toISOString(),
      status: "SUBMITTED",
    };
    await apiService.addComplaint(newComplaint);
    await refreshComplaints();
    return newId;
  };

  const updateComplaintStatus = async (complaint_id: string, status: ComplaintStatus) => {
    await apiService.updateComplaintStatus(complaint_id, status);
    await refreshComplaints();
  };

  const linkComplaintToTicket = async (complaint_id: string, ticket_id: string) => {
    await apiService.linkComplaintToTicket(complaint_id, ticket_id);
    await refreshComplaints();
  };

  const linkComplaintToInspection = async (complaint_id: string, inspection_id: string) => {
    await apiService.linkComplaintToInspection(complaint_id, inspection_id);
    await refreshComplaints();
  };

  return (
    <ComplaintContext.Provider value={{ complaints, addComplaint, updateComplaintStatus, linkComplaintToTicket, linkComplaintToInspection, refreshComplaints }}>
      {children}
    </ComplaintContext.Provider>
  );
};

export const useComplaints = () => {
  const ctx = useContext(ComplaintContext);
  if (!ctx) throw new Error("useComplaints must be used within <ComplaintProvider>");
  return ctx;
};
