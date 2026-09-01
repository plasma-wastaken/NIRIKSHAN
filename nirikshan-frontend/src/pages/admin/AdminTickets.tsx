import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useTickets } from '../../context/TicketContext';
import { Ticket as TicketIcon, Clock, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useNavigate } from 'react-router-dom';

export const AdminTickets: React.FC = () => {
  const { tickets } = useTickets();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.ticket_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ticket.complaint_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT': return <Badge variant="danger">Urgent</Badge>;
      case 'HIGH': return <Badge variant="warning">High</Badge>;
      case 'MEDIUM': return <Badge variant="info">Medium</Badge>;
      case 'LOW': return <Badge variant="default">Low</Badge>;
      default: return <Badge>{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return <Badge variant="info">Open</Badge>;
      case 'IN_PROGRESS': return <Badge variant="warning">In Progress</Badge>;
      case 'RESOLVED': return <Badge variant="success">Resolved</Badge>;
      case 'CLOSED': return <Badge variant="default">Closed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getSLAStatus = (deadline: string, status: string) => {
    if (status === 'RESOLVED' || status === 'CLOSED') return <span className="text-green-600 flex items-center text-xs"><CheckCircle2 className="w-3 h-3 mr-1"/> Met</span>;
    const isOverdue = new Date(deadline) < new Date();
    return isOverdue 
      ? <span className="text-red-600 flex items-center text-xs font-semibold"><AlertCircle className="w-3 h-3 mr-1"/> Overdue</span> 
      : <span className="text-yellow-600 flex items-center text-xs"><Clock className="w-3 h-3 mr-1"/> Pending</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 bg-white p-6 rounded-xl border border-surface-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 flex items-center gap-2">
            <TicketIcon className="h-6 w-6 text-primary-600" />
            Ticket Management
          </h1>
          <p className="text-sm text-surface-500 mt-1">Manage and track all system tickets and SLAs</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-surface-400" />
              <Input 
                placeholder="Search by Ticket ID or Complaint ID..." 
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
                  { label: 'Closed', value: 'CLOSED' },
                ]}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-50 text-surface-500 border-b border-surface-200 uppercase text-[11px] tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Ticket Details</th>
                  <th className="px-4 py-3">Status & Priority</th>
                  <th className="px-4 py-3">SLA Deadline</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 bg-white">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.ticket_id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-medium text-primary-900">{ticket.ticket_id}</div>
                      <div className="text-surface-500 text-xs mt-0.5">Ref: {ticket.complaint_id}</div>
                    </td>
                    <td className="px-4 py-4 space-y-2">
                      <div>{getStatusBadge(ticket.status)}</div>
                      <div className="mt-1">{getPriorityBadge(ticket.priority)}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-surface-900">{new Date(ticket.sla_deadline).toLocaleDateString()}</div>
                      <div className="mt-1">{getSLAStatus(ticket.sla_deadline, ticket.status)}</div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/admin/tickets/${ticket.ticket_id}`)}>
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-surface-500">
                      No tickets found matching your criteria.
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
