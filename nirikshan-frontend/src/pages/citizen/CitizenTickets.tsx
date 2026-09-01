import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useTickets } from '../../context/TicketContext';
import { Ticket as TicketIcon, Clock, CheckCircle2, Search, ArrowRight } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

export const CitizenTickets: React.FC = () => {
  const { tickets } = useTickets();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // For a citizen, they should only see tickets linked to their complaints.
  // Since this is a prototype, we'll just show all tickets but style it for the citizen.
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.ticket_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ticket.complaint_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return <Badge variant="info">Open</Badge>;
      case 'IN_PROGRESS': return <Badge variant="warning">In Progress</Badge>;
      case 'RESOLVED': return <Badge variant="success">Resolved</Badge>;
      case 'CLOSED': return <Badge variant="default">Closed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 bg-white p-6 rounded-xl border border-surface-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 flex items-center gap-2">
            <TicketIcon className="h-6 w-6 text-primary-600" />
            My Tickets
          </h1>
          <p className="text-sm text-surface-500 mt-1">Track the resolution of your submitted complaints</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-surface-400" />
              <Input 
                placeholder="Search by Ticket ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select 
                label=""
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { label: 'All Statuses', value: 'ALL' },
                  { label: 'Open', value: 'OPEN' },
                  { label: 'In Progress', value: 'IN_PROGRESS' },
                  { label: 'Resolved', value: 'RESOLVED' },
                ]}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-50 text-surface-500 border-b border-surface-200 uppercase text-[11px] tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Ticket ID</th>
                  <th className="px-4 py-3">Related Complaint</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created On</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 bg-white">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.ticket_id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-4 font-medium text-primary-900">
                      {ticket.ticket_id}
                    </td>
                    <td className="px-4 py-4 text-surface-600">
                      {ticket.complaint_id}
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="px-4 py-4 text-surface-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3"/> {new Date(ticket.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => alert("Ticket details modal coming soon")}>
                        View Details <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-surface-500">
                      You have no tickets matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
