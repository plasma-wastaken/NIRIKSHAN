import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useComplaints } from '../../context/ComplaintContext';
import { MessageSquare, Search, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useNavigate } from 'react-router-dom';

export const AdminComplaints: React.FC = () => {
  const { complaints } = useComplaints();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredComplaints = complaints.filter(c => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      c.complaint_id.toLowerCase().includes(term) || 
      c.category.toLowerCase().includes(term) ||
      c.citizen_id.toLowerCase().includes(term);
    
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return <Badge variant="info">Submitted</Badge>;
      case 'UNDER_REVIEW': return <Badge variant="warning">Under Review</Badge>;
      case 'ASSIGNED': return <Badge variant="info">Assigned</Badge>;
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
            <MessageSquare className="h-6 w-6 text-primary-600" />
            Citizen Complaints
          </h1>
          <p className="text-sm text-surface-500 mt-1">Review and manage complaints submitted by citizens</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-surface-400" />
              <Input 
                placeholder="Search by ID, Category, or Citizen..." 
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
                  { label: 'Submitted', value: 'SUBMITTED' },
                  { label: 'Under Review', value: 'UNDER_REVIEW' },
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
                  <th className="px-4 py-3">Complaint Info</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date Submitted</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 bg-white">
                {filteredComplaints.map((c) => (
                  <tr key={c.complaint_id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-medium text-primary-900">{c.complaint_id}</div>
                      <div className="text-surface-500 text-xs mt-1">Citizen: {c.citizen_id}</div>
                    </td>
                    <td className="px-4 py-4 text-surface-900 font-medium">
                      {c.category}
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(c.status)}
                    </td>
                    <td className="px-4 py-4 text-surface-600 text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3"/> {new Date(c.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/admin/complaints/${c.complaint_id}`)}>
                        Review <ExternalLink className="w-3 h-3 ml-2"/>
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredComplaints.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-surface-500">
                      No complaints found matching your criteria.
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
