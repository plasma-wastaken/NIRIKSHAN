import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useInspections } from '../../context/InspectionContext';

export const SupervisorHighRisk: React.FC = () => {
  const { inspections } = useInspections();
  const navigate = useNavigate();

  const highRisk = inspections.filter(i => i.status === 'SUBMITTED' && (i.risk_level === 'HIGH' || i.risk_level === 'CRITICAL'));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex items-center gap-3 bg-red-50 text-red-900 p-4 rounded-xl border border-red-200">
        <ShieldAlert className="h-6 w-6 text-red-600 shrink-0" />
        <div>
          <h1 className="font-bold">High Risk Cases</h1>
          <p className="text-sm opacity-80">These inspections require immediate operational review.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {highRisk.map(insp => (
          <Card key={insp.inspection_id} className="border-red-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <span className="font-mono text-sm font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                  {insp.inspection_id}
                </span>
                <Badge variant="danger">{insp.risk_level}</Badge>
              </div>
              <div>
                <h3 className="font-semibold text-surface-900">{insp.site_name}</h3>
                <p className="text-xs text-surface-500 mt-1 line-clamp-2">{insp.address}</p>
              </div>
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={() => navigate(`/supervisor/inspections/${insp.inspection_id}`)}>
                Review Case
              </Button>
            </div>
          </Card>
        ))}
        {highRisk.length === 0 && (
          <div className="col-span-full text-center py-12 text-surface-500 bg-surface-50 rounded-xl border border-dashed border-surface-200">
            No high-risk cases currently awaiting review.
          </div>
        )}
      </div>
    </div>
  );
};
