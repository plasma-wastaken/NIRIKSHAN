import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

import { Badge } from '../../components/ui/Badge';
import { useInspections } from '../../context/InspectionContext';

export const SupervisorReviews: React.FC = () => {
  const { inspections } = useInspections();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Queue typically shows everything that was submitted. 
  // We can include already reviewed items if we want, but usually it's just SUBMITTED.
  const queue = inspections.filter(i => 
    ['SUBMITTED', 'APPROVED', 'RETURNED', 'FLAGGED'].includes(i.status) &&
    (i.inspection_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
     i.site_name.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => {
    // Sort submitted first, then by date
    if (a.status === 'SUBMITTED' && b.status !== 'SUBMITTED') return -1;
    if (b.status === 'SUBMITTED' && a.status !== 'SUBMITTED') return 1;
    return 0;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-surface-900">Review Queue</h1>
        <p className="text-sm text-surface-500 mt-1">Manage and review all submitted inspections.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input 
            type="text" 
            placeholder="Search by ID or site..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <Button variant="outline" className="bg-white">
          <Filter className="mr-2 h-4 w-4" /> Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {queue.map(insp => (
          <Card key={insp.inspection_id} className="hover:border-primary-300 transition-colors cursor-pointer group" onClick={() => navigate(`/supervisor/inspections/${insp.inspection_id}`)}>
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-sm font-bold text-primary-700">{insp.inspection_id}</span>
                  <Badge variant={insp.status === 'SUBMITTED' ? 'default' : insp.status === 'APPROVED' ? 'success' : insp.status === 'RETURNED' ? 'danger' : 'warning'}>
                    {insp.status}
                  </Badge>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    insp.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                    insp.risk_level === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    'bg-surface-100 text-surface-800'
                  }`}>{insp.risk_level} RISK</span>
                </div>
                <h3 className="font-semibold text-surface-900 mt-2">{insp.site_name}</h3>
                <p className="text-sm text-surface-500">Inspector: {insp.inspector_id}</p>
              </div>
              <div className="shrink-0 text-left sm:text-right">
                <Button size="sm" variant={insp.status === 'SUBMITTED' ? 'primary' : 'outline'}>
                  {insp.status === 'SUBMITTED' ? 'Review Now' : 'View Details'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {queue.length === 0 && (
          <div className="text-center py-12 text-surface-500 bg-surface-50 rounded-xl border border-dashed border-surface-200">
            No inspections found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};
