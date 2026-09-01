import React, { createContext, useContext, useState, useEffect } from "react";
import type { TicketRecord, TicketStatus } from "../types";
import { getTickets, createTicket } from "../services/api";

interface TicketContextValue {
  tickets: TicketRecord[];
  loading: boolean;
  error: string | null;
  addTicket: (ticket: Omit<TicketRecord, "ticket_id">) => Promise<string>;
  updateTicketStatus: (ticket_id: string, status: TicketStatus) => Promise<void>;
  refreshTickets: () => Promise<void>;
}

const TicketContext = createContext<TicketContextValue | null>(null);

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTickets();
      setTickets(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tickets';
      setError(errorMessage);
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTickets();
  }, []);

  const addTicket = async (data: Omit<TicketRecord, "ticket_id">): Promise<string> => {
    try {
      const created = await createTicket(data);
      await refreshTickets();
      return created.ticket_id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create ticket';
      setError(errorMessage);
      console.error('Failed to create ticket:', err);
      throw err;
    }
  };

  const updateTicketStatus = async (ticket_id: string, status: TicketStatus) => {
    try {
      // Update local state for now - in real API this would call an endpoint
      setTickets(prev => prev.map(ticket => 
        ticket.ticket_id === ticket_id ? { ...ticket, status } : ticket
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update ticket status';
      setError(errorMessage);
      console.error('Failed to update ticket status:', err);
      throw err;
    }
  };

  return (
    <TicketContext.Provider value={{ tickets, loading, error, addTicket, updateTicketStatus, refreshTickets }}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error("useTickets must be used within <TicketProvider>");
  return ctx;
};
