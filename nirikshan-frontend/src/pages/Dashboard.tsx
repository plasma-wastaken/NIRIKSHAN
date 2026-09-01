import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ListTodo,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { mockKpiData } from '../data/mockDashboard';
import type { DashboardInspection } from '../data/mockDashboard';
import { useInspections } from '../context/InspectionContext';
import { SiteMap } from '../components/map/SiteMap';
import { mockMapSites } from '../data/mockMapSites';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { inspections } = useInspections();
  
  // Transform context data to dashboard format
  const dashboardInspections = inspections.map(i => ({
    inspection_id: i.inspection_id,
    site_id: i.site_id,
    status: i.status,
    location: i.address || i.site_name,
    latitude: i.latitude,
    longitude: i.longitude,
    started_at: i.started_at,
    scheduled_for: i.scheduled_date,
    risk_level: i.risk_level,
  }));
  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
        return <Badge variant="info">Assigned</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="warning">In Progress</Badge>;
      case 'SUBMITTED':
        return <Badge variant="default">Submitted</Badge>;
      case 'COMPLETED':
      case 'APPROVED':
        return <Badge variant="success">Completed</Badge>;
      case 'RETURNED':
        return <Badge variant="danger">Returned</Badge>;
      case 'FLAGGED':
        return <Badge variant="warning">Flagged</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRiskBadge = (risk: DashboardInspection['risk_level']) => {
    switch (risk) {
      case 'LOW':
        return <Badge variant="success">Low Risk</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning">Medium</Badge>;
      case 'HIGH':
      case 'CRITICAL':
        return <Badge variant="danger">{risk === 'CRITICAL' ? 'Critical' : 'High Risk'}</Badge>;
      case 'UNASSESSED':
        return <Badge variant="default" className="text-surface-500 bg-surface-100">Pending Eval</Badge>;
      default:
        return null;
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 bg-white p-6 rounded-xl border border-surface-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900">
            Good morning, Inspector
          </h1>
          <div className="flex items-center mt-1 gap-2">
            <Badge variant="info" className="uppercase text-[10px] tracking-wider">Inspector Role</Badge>
            <span className="text-sm text-surface-500">{currentDate}</span>
          </div>
        </div>
        
        {/* Quick Actions (Desktop inline, Mobile wrapped) */}
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          <Button variant="outline" size="sm" onClick={() => navigate('/inspector/inspections')}>
            <ListTodo className="mr-2 h-4 w-4" />
            All Inspections
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/inspector/sync')}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Data
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border-l-4 border-l-primary-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-surface-500">Assigned</p>
              <ListTodo className="h-5 w-5 text-primary-500" />
            </div>
            <p className="mt-2 text-3xl font-bold text-surface-900">{mockKpiData.assigned}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-l-4 border-l-yellow-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-surface-500">Pending / In Progress</p>
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="mt-2 text-3xl font-bold text-surface-900">{mockKpiData.pending}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-green-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-surface-500">Completed</p>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <p className="mt-2 text-3xl font-bold text-surface-900">{mockKpiData.completed}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-l-4 border-l-red-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-surface-500">High Risk Identified</p>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <p className="mt-2 text-3xl font-bold text-surface-900">{mockKpiData.highRisk}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Inspections Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-surface-900">Today's Inspections</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/inspector/inspections?status=pending')}>
              View All Pending <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-surface-50 text-surface-500 border-b border-surface-200 uppercase text-[11px] tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3">Inspection ID / Site</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Timing</th>
                    <th className="px-4 py-3">Risk Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 bg-white">
                  {dashboardInspections.map((inspection) => (
                    <tr key={inspection.inspection_id} className="hover:bg-surface-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-medium text-primary-900">{inspection.inspection_id}</div>
                        <div className="text-surface-500 mt-0.5 text-xs flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-[200px]" title={inspection.location}>
                            {inspection.site_id} &bull; {inspection.location}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(inspection.status)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-surface-900 font-medium">
                          {formatTime(inspection.scheduled_for)}
                        </div>
                        {inspection.started_at && (
                          <div className="text-surface-500 text-[11px] mt-0.5">
                            Started: {formatTime(inspection.started_at)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {getRiskBadge(inspection.risk_level)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {dashboardInspections.length === 0 && (
              <div className="p-8 text-center text-surface-500">
                No inspections assigned for today.
              </div>
            )}
          </Card>
        </div>

        {/* Map Panel */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-surface-900">Location Overview</h2>
          <SiteMap
            sites={mockMapSites.slice(0, 6)}
            height="400px"
            showLegend={true}
          />
        </div>
      </div>
    </div>
  );
};
