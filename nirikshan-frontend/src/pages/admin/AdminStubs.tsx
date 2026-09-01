import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useInspections } from '../../context/InspectionContext';
import { useComplaints } from '../../context/ComplaintContext';
import { useTickets } from '../../context/TicketContext';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText,
  Ticket as TicketIcon,
  Activity,
  ArrowRight
} from 'lucide-react';
import { AdminMap } from './AdminMap';
import { SiteMap } from '../../components/map/SiteMap';
import { mockMapSites } from '../../data/mockMapSites';

const StubPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <p>This page is a stub for the {title} feature.</p>
  </div>
);

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { inspections } = useInspections();
  const { complaints } = useComplaints();
  const { tickets } = useTickets();

  // Calculate KPIs from real data
  const totalInspections = inspections.length;
  const pendingInspections = inspections.filter(i => 
    i.status === 'ASSIGNED' || i.status === 'IN_PROGRESS'
  ).length;
  const completedInspections = inspections.filter(i => 
    i.status === 'COMPLETED' || i.status === 'APPROVED'
  ).length;
  const highRiskInspections = inspections.filter(i => 
    i.risk_level === 'HIGH' || i.risk_level === 'CRITICAL'
  ).length;
  
  const openComplaints = complaints.filter(c => 
    c.status !== 'RESOLVED' && c.status !== 'CLOSED'
  ).length;
  
  const openTickets = tickets.filter(t => t.status === 'OPEN').length;
  const overdueTickets = tickets.filter(t => {
    const deadline = new Date(t.sla_deadline);
    return t.status !== 'RESOLVED' && t.status !== 'CLOSED' && deadline < new Date();
  }).length;

  // Calculate status distributions
  const inspectionStatusCounts = inspections.reduce((acc, i) => {
    acc[i.status] = (acc[i.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const riskDistribution = inspections.reduce((acc, i) => {
    acc[i.risk_level] = (acc[i.risk_level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const complaintStatusCounts = complaints.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const ticketStatusCounts = tickets.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Generate recent activity from shared data
  const recentActivity = [
    ...complaints.slice(-3).map(c => ({
      id: c.complaint_id,
      type: 'complaint',
      action: 'Complaint created',
      description: c.category,
      timestamp: c.created_at,
      route: `/admin/complaints/${c.complaint_id}`
    })),
    ...tickets.slice(-3).map(t => ({
      id: t.ticket_id,
      type: 'ticket',
      action: 'Ticket created',
      description: `Priority: ${t.priority}`,
      timestamp: t.created_at,
      route: `/admin/tickets/${t.ticket_id}`
    })),
    ...inspections.slice(-3).map(i => ({
      id: i.inspection_id,
      type: 'inspection',
      action: i.status === 'SUBMITTED' ? 'Inspection submitted' : 
             i.status === 'APPROVED' ? 'Supervisor approved' :
             i.status === 'RETURNED' ? 'Supervisor returned' :
             'Inspection assigned',
      description: i.site_name,
      timestamp: i.started_at || i.scheduled_date,
      route: `/admin/inspections/${i.inspection_id}`
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

  // Pending attention items
  const pendingReview = inspections.filter(i => i.status === 'SUBMITTED');
  const approachingSLA = tickets.filter(t => {
    const deadline = new Date(t.sla_deadline);
    const daysUntilDeadline = (deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
    return t.status !== 'RESOLVED' && t.status !== 'CLOSED' && daysUntilDeadline <= 2 && daysUntilDeadline > 0;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

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
      case 'OPEN':
        return <Badge variant="info">Open</Badge>;
      case 'RESOLVED':
        return <Badge variant="success">Resolved</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="warning">Under Review</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 bg-white p-6 rounded-xl border border-surface-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-surface-500 mt-1">Overview of all system operations</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border-l-4 border-l-primary-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-surface-500">Total Inspections</p>
              <ClipboardList className="h-5 w-5 text-primary-500" />
            </div>
            <p className="mt-2 text-3xl font-bold text-surface-900">{totalInspections}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-l-4 border-l-yellow-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-surface-500">Pending Inspections</p>
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="mt-2 text-3xl font-bold text-surface-900">{pendingInspections}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-green-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-surface-500">Completed Inspections</p>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <p className="mt-2 text-3xl font-bold text-surface-900">{completedInspections}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-l-4 border-l-red-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-surface-500">High Risk Inspections</p>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <p className="mt-2 text-3xl font-bold text-surface-900">{highRiskInspections}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-blue-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-surface-500">Open Complaints</p>
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <p className="mt-2 text-3xl font-bold text-surface-900">{openComplaints}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-purple-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-surface-500">Open Tickets</p>
              <TicketIcon className="h-5 w-5 text-purple-500" />
            </div>
            <p className="mt-2 text-3xl font-bold text-surface-900">{openTickets}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-orange-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-surface-500">Overdue Tickets</p>
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>
            <p className="mt-2 text-3xl font-bold text-surface-900">{overdueTickets}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-teal-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-surface-500">System Health</p>
              <Activity className="h-5 w-5 text-teal-500" />
            </div>
            <p className="mt-2 text-3xl font-bold text-surface-900">Good</p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inspection Status */}
        <Card>
          <CardHeader>
            <CardTitle>Inspection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(inspectionStatusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(status)}
                    <span className="text-sm text-surface-600">{status}</span>
                  </div>
                  <span className="font-semibold text-surface-900">{count}</span>
                </div>
              ))}
              {Object.keys(inspectionStatusCounts).length === 0 && (
                <p className="text-sm text-surface-500 text-center py-4">No inspection data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(riskDistribution).map(([risk, count]) => (
                <div key={risk} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      risk === 'CRITICAL' ? 'danger' :
                      risk === 'HIGH' ? 'danger' :
                      risk === 'MEDIUM' ? 'warning' :
                      risk === 'LOW' ? 'success' : 'default'
                    }>
                      {risk}
                    </Badge>
                  </div>
                  <span className="font-semibold text-surface-900">{count}</span>
                </div>
              ))}
              {Object.keys(riskDistribution).length === 0 && (
                <p className="text-sm text-surface-500 text-center py-4">No risk data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Complaint Status */}
        <Card>
          <CardHeader>
            <CardTitle>Complaint Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(complaintStatusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(status)}
                    <span className="text-sm text-surface-600">{status}</span>
                  </div>
                  <span className="font-semibold text-surface-900">{count}</span>
                </div>
              ))}
              {Object.keys(complaintStatusCounts).length === 0 && (
                <p className="text-sm text-surface-500 text-center py-4">No complaint data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ticket Status */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(ticketStatusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(status)}
                    <span className="text-sm text-surface-600">{status}</span>
                  </div>
                  <span className="font-semibold text-surface-900">{count}</span>
                </div>
              ))}
              {Object.keys(ticketStatusCounts).length === 0 && (
                <p className="text-sm text-surface-500 text-center py-4">No ticket data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="border-b border-surface-100 flex flex-row items-center justify-between pb-4">
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-surface-100">
            {recentActivity.map((activity) => (
              <div 
                key={`${activity.type}-${activity.id}`}
                className="p-4 hover:bg-surface-50 cursor-pointer"
                onClick={() => navigate(activity.route)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium text-primary-700 hover:underline">
                        {activity.id}
                      </span>
                      <span className="text-xs text-surface-500">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-surface-900 mt-1">{activity.action}</p>
                    <p className="text-sm text-surface-600">{activity.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-surface-400 mt-1" />
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="p-8 text-center text-surface-500">
                No recent activity
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inspections Awaiting Review */}
        <Card>
          <CardHeader className="border-b border-surface-100 flex flex-row items-center justify-between pb-4">
            <CardTitle>Inspections Awaiting Review</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/supervisor/reviews')}>
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-surface-100">
              {pendingReview.slice(0, 3).map((inspection) => (
                <div 
                  key={inspection.inspection_id}
                  className="p-4 hover:bg-surface-50 cursor-pointer"
                  onClick={() => navigate(`/admin/inspections/${inspection.inspection_id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium text-primary-700 hover:underline">
                          {inspection.inspection_id}
                        </span>
                        {getStatusBadge(inspection.status)}
                      </div>
                      <p className="text-sm text-surface-900 mt-1">{inspection.site_name}</p>
                      <p className="text-sm text-surface-600">{inspection.address}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-surface-400 mt-1" />
                  </div>
                </div>
              ))}
              {pendingReview.length === 0 && (
                <div className="p-8 text-center text-surface-500">
                  No inspections awaiting review
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tickets Approaching SLA */}
        <Card>
          <CardHeader className="border-b border-surface-100 flex flex-row items-center justify-between pb-4">
            <CardTitle>Tickets Approaching SLA</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/tickets')}>
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-surface-100">
              {approachingSLA.slice(0, 3).map((ticket) => (
                <div 
                  key={ticket.ticket_id}
                  className="p-4 hover:bg-surface-50 cursor-pointer"
                  onClick={() => navigate(`/admin/tickets/${ticket.ticket_id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium text-primary-700 hover:underline">
                          {ticket.ticket_id}
                        </span>
                        <Badge variant="warning">SLA Warning</Badge>
                      </div>
                      <p className="text-sm text-surface-900 mt-1">Priority: {ticket.priority}</p>
                      <p className="text-sm text-surface-600">
                        Deadline: {new Date(ticket.sla_deadline).toLocaleDateString()}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-surface-400 mt-1" />
                  </div>
                </div>
              ))}
              {approachingSLA.length === 0 && (
                <div className="p-8 text-center text-surface-500">
                  No tickets approaching SLA deadline
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Overview Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-surface-900">Geographic Overview — Delhi NCR</h2>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/map')}>
            Full Map View
          </Button>
        </div>
        <SiteMap
          sites={mockMapSites}
          height="450px"
          showLegend={true}
        />
      </div>
    </div>
  );
};

export { AdminInspections } from './AdminInspections';
export const AdminInspectionDetail = () => <StubPage title="Admin Inspection Detail" />;
export const AdminInspectors = () => <StubPage title="Admin Inspectors" />;
export { AdminComplaints } from './AdminComplaints';
export const AdminComplaintDetail = () => <StubPage title="Admin Complaint Detail" />;
export { AdminTickets } from './AdminTickets';
export const AdminTicketDetail = () => <StubPage title="Admin Ticket Detail" />;
export const AdminTicketSLA = () => <StubPage title="Admin Ticket SLA" />;
export const AdminUsers = () => <StubPage title="Admin Users" />;
export const AdminAudit = () => <StubPage title="Admin Audit" />;
export const AdminAnalytics = () => <StubPage title="Admin Analytics" />;
export { AdminReports } from './AdminReports';
export { AdminMap } from './AdminMap';
