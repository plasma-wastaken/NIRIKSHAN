import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ClipboardList, ShieldAlert, AlertTriangle, CheckSquare } from 'lucide-react';
import { useInspections } from '../../context/InspectionContext';
import { SiteMap } from '../../components/map/SiteMap';
import { mockMapSites } from '../../data/mockMapSites';

export const SupervisorDashboard: React.FC = () => {
  const { inspections } = useInspections();
  const navigate = useNavigate();

  const submitted = inspections.filter(i => i.status === 'SUBMITTED');
  const highRisk = submitted.filter(i => i.risk_level === 'HIGH' || i.risk_level === 'CRITICAL');
  const critical = submitted.filter(i => i.risk_level === 'CRITICAL');
  const reviewedToday = inspections.filter(i => i.status === 'APPROVED' || i.status === 'RETURNED').length; // Mock metric

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 bg-white p-6 rounded-xl border border-surface-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900">
            Supervisor Dashboard
          </h1>
          <p className="text-sm text-surface-500 mt-1">Review and manage compliance inspections.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Awaiting Review', value: submitted.length, icon: ClipboardList, color: 'text-primary-600' },
          { label: 'High Risk', value: highRisk.length, icon: ShieldAlert, color: 'text-orange-600' },
          { label: 'Critical Cases', value: critical.length, icon: AlertTriangle, color: 'text-red-600' },
          { label: 'Reviewed Today', value: reviewedToday, icon: CheckSquare, color: 'text-green-600' },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-surface-100 ${kpi.color}`}>
                <kpi.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900">{kpi.value}</p>
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="border-b border-surface-100 flex flex-row items-center justify-between pb-4">
          <CardTitle>Inspections Awaiting Review</CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate('/supervisor/reviews')}>
            View All Queue
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-surface-500 bg-surface-50 border-b border-surface-200 uppercase">
                <tr>
                  <th className="px-6 py-3 font-medium">Inspection</th>
                  <th className="px-6 py-3 font-medium">Site</th>
                  <th className="px-6 py-3 font-medium">Inspector</th>
                  <th className="px-6 py-3 font-medium">Risk Score</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {submitted.slice(0, 5).map(insp => (
                  <tr key={insp.inspection_id} className="hover:bg-surface-50">
                    <td className="px-6 py-4 font-mono font-medium text-primary-700">{insp.inspection_id}</td>
                    <td className="px-6 py-4">{insp.site_name}</td>
                    <td className="px-6 py-4 text-surface-600">{insp.inspector_id}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        insp.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        insp.risk_level === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        'bg-surface-100 text-surface-800'
                      }`}>{insp.risk_level}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="default">Submitted</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button size="sm" onClick={() => navigate(`/supervisor/inspections/${insp.inspection_id}`)}>
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
                {submitted.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-surface-500">
                      No inspections awaiting review.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Site Map — high-risk sites highlighted */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-surface-900">High-Risk Sites Overview</h2>
        <SiteMap
          sites={mockMapSites.filter(s => s.risk_level === 'CRITICAL' || s.risk_level === 'HIGH')}
          height="420px"
          showLegend={true}
        />
      </div>
    </div>
  );
};
