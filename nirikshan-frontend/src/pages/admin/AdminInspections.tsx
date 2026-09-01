import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useInspections } from '../../context/InspectionContext';
import { ClipboardList, Search, MapPin, Calendar } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useNavigate } from 'react-router-dom';
import type { RiskLevel } from '../../types';

export const AdminInspections: React.FC = () => {
  const { inspections } = useInspections();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredInspections = inspections.filter(inspection => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      inspection.inspection_id.toLowerCase().includes(term) || 
      inspection.site_name.toLowerCase().includes(term) ||
      inspection.inspector_id.toLowerCase().includes(term);
    
    const matchesStatus = statusFilter === 'ALL' || inspection.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return <Badge variant="info">Assigned</Badge>;
      case 'IN_PROGRESS': return <Badge variant="warning">In Progress</Badge>;
      case 'SUBMITTED': return <Badge variant="default">Submitted (Review)</Badge>;
      case 'COMPLETED': return <Badge variant="success">Completed</Badge>;
      case 'APPROVED': return <Badge variant="success">Approved</Badge>;
      case 'RETURNED': return <Badge variant="danger">Returned</Badge>;
      case 'FLAGGED': return <Badge variant="warning">Flagged</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'LOW': return <Badge variant="success">Low Risk</Badge>;
      case 'MEDIUM': return <Badge variant="warning">Medium</Badge>;
      case 'HIGH': return <Badge variant="danger">High Risk</Badge>;
      case 'CRITICAL': return <Badge variant="danger">Critical</Badge>;
      default: return <Badge variant="default">Unassessed</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 bg-white p-6 rounded-xl border border-surface-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary-600" />
            Inspection Management
          </h1>
          <p className="text-sm text-surface-500 mt-1">Monitor and assign government inspections</p>
        </div>
        <Button onClick={() => alert("Assignment feature coming soon")} className="bg-primary-800">
          Assign New Inspection
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-surface-400" />
              <Input 
                placeholder="Search by ID, Site, or Inspector..." 
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
                  { label: 'Assigned', value: 'ASSIGNED' },
                  { label: 'In Progress', value: 'IN_PROGRESS' },
                  { label: 'Submitted', value: 'SUBMITTED' },
                  { label: 'Completed', value: 'COMPLETED' },
                  { label: 'Approved', value: 'APPROVED' },
                ]}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-50 text-surface-500 border-b border-surface-200 uppercase text-[11px] tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Inspection / Site</th>
                  <th className="px-4 py-3">Inspector</th>
                  <th className="px-4 py-3">Status & Risk</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 bg-white">
                {filteredInspections.map((insp) => (
                  <tr key={insp.inspection_id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-medium text-primary-900">{insp.inspection_id}</div>
                      <div className="text-surface-500 text-xs mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3"/> {insp.site_name}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-surface-900 font-medium">
                      {insp.inspector_id}
                    </td>
                    <td className="px-4 py-4 space-y-2">
                      <div>{getStatusBadge(insp.status)}</div>
                      <div>{getRiskBadge(insp.risk_level)}</div>
                    </td>
                    <td className="px-4 py-4 text-surface-600 text-xs space-y-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3"/> {new Date(insp.scheduled_date).toLocaleDateString()}
                      </div>
                      {insp.started_at && (
                        <div className="text-surface-400">Started: {new Date(insp.started_at).toLocaleDateString()}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/admin/inspections/${insp.inspection_id}`)}>
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredInspections.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-surface-500">
                      No inspections found matching your criteria.
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
