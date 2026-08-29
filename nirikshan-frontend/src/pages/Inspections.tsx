import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Search, MapPin, Calendar, Clock, ChevronRight } from 'lucide-react';
import { useInspections } from '../context/InspectionContext';

export const Inspections: React.FC = () => {
  const { inspections } = useInspections();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return <Badge variant="info">Assigned</Badge>;
      case 'IN_PROGRESS': return <Badge variant="warning">In Progress</Badge>;
      case 'SUBMITTED': return <Badge variant="default">Submitted</Badge>;
      case 'COMPLETED': return <Badge variant="success">Completed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'LOW': return <Badge variant="success">Low Risk</Badge>;
      case 'MEDIUM': return <Badge variant="warning">Medium</Badge>;
      case 'HIGH':
      case 'CRITICAL': return <Badge variant="danger">{risk === 'CRITICAL' ? 'Critical' : 'High Risk'}</Badge>;
      case 'UNASSESSED': return <Badge variant="default" className="text-surface-500 bg-surface-100">Pending Eval</Badge>;
      default: return null;
    }
  };

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-IN', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // Simple client-side filtering for prototype
  const filteredInspections = inspections.filter(item => {
    const matchesSearch = item.inspection_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.site_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    const matchesRisk = riskFilter ? item.risk_level === riskFilter : true;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-surface-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900">Inspection Management</h1>
          <p className="text-sm text-surface-500 mt-1">View and manage your assigned compliance checks.</p>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="border-surface-200">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-1/3 relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-surface-400 mt-6" />
              </div>
              <Input 
                label="Search"
                className="pl-9" 
                placeholder="Search ID or site name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-1/5">
              <Select 
                label="Status"
                options={[
                  { label: 'All Statuses', value: '' },
                  { label: 'Assigned', value: 'ASSIGNED' },
                  { label: 'In Progress', value: 'IN_PROGRESS' },
                  { label: 'Submitted', value: 'SUBMITTED' },
                  { label: 'Completed', value: 'COMPLETED' },
                ]}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
            </div>

            <div className="w-full md:w-1/5">
              <Select 
                label="Risk Level"
                options={[
                  { label: 'All Risks', value: '' },
                  { label: 'High / Critical', value: 'HIGH' },
                  { label: 'Medium', value: 'MEDIUM' },
                  { label: 'Low', value: 'LOW' },
                  { label: 'Unassessed', value: 'UNASSESSED' },
                ]}
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-auto md:ml-auto">
              {/* Date filter could be a date picker, just a button for now in prototype */}
              <Button variant="outline" className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Select Date
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inspections List */}
      <div className="space-y-4">
        {filteredInspections.map((inspection) => (
          <Card 
            key={inspection.inspection_id} 
            className="hover:border-primary-300 transition-colors cursor-pointer group shadow-sm hover:shadow-md"
            onClick={() => navigate(`/inspector/inspections/${inspection.inspection_id}`)}
          >
            <CardContent className="p-5 flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-lg text-primary-900">{inspection.inspection_id}</h3>
                  {getStatusBadge(inspection.status)}
                  {getRiskBadge(inspection.risk_level)}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-surface-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-surface-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-surface-900 block">{inspection.site_name}</span>
                      <span className="text-surface-500 text-xs">ID: {inspection.site_id}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-surface-400 mt-0.5 flex-shrink-0" />
                    <div className="flex flex-col">
                      <span>
                        <span className="text-surface-500">Scheduled: </span>
                        {formatDateTime(inspection.scheduled_date)}
                      </span>
                      {inspection.started_at && (
                        <span className="text-xs text-primary-600 font-medium">
                          Started: {formatDateTime(inspection.started_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center sm:pl-4 sm:border-l border-surface-200 justify-end sm:justify-center">
                <div className="h-10 w-10 rounded-full bg-surface-50 flex items-center justify-center group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                  <ChevronRight className="h-5 w-5 text-surface-400 group-hover:text-primary-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredInspections.length === 0 && (
          <div className="p-12 text-center text-surface-500 bg-white rounded-xl border border-dashed border-surface-300">
            No inspections found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};
