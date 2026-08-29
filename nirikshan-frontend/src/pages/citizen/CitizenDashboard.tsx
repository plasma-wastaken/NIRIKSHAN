import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, FileText, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const CitizenDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { complaints } = useComplaints();
  const navigate = useNavigate();

  const myComplaints = complaints.filter(c => c.citizen_id === currentUser.user_id);
  
  const total = myComplaints.length;
  const underReview = myComplaints.filter(c => c.status === 'UNDER_REVIEW').length;
  const inProgress = myComplaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length;
  const resolved = myComplaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Welcome back, {currentUser.name}</h1>
          <p className="text-sm text-surface-500 mt-1">Track your civic complaints and reports.</p>
        </div>
        <Button onClick={() => navigate('/citizen/complaints/new')} className="w-full sm:w-auto shrink-0 shadow-sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Submit Complaint
        </Button>
      </div>

      {/* Demo Warning */}
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3 text-sm flex items-start gap-3">
        <AlertCircle className="h-5 w-5 shrink-0 text-yellow-600" />
        <p>This is a prototype environment. The statistics and records shown below are generated mock data for demonstration purposes only.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Complaints', value: total, icon: FileText, color: 'text-primary-600' },
          { label: 'Under Review', value: underReview, icon: Clock, color: 'text-yellow-600' },
          { label: 'In Progress', value: inProgress, icon: AlertCircle, color: 'text-orange-600' },
          { label: 'Resolved', value: resolved, icon: CheckCircle2, color: 'text-green-600' },
        ].map(kpi => (
          <Card key={kpi.label} className="border-surface-200">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <kpi.icon className={`h-6 w-6 mb-2 ${kpi.color}`} />
              <p className="text-3xl font-bold text-surface-900">{kpi.value}</p>
              <p className="text-xs font-medium text-surface-500 uppercase tracking-wider mt-1">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="border-surface-200">
        <CardHeader className="border-b border-surface-100 pb-4">
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-surface-100">
          {myComplaints.slice(0, 3).map(comp => (
            <div 
              key={comp.complaint_id} 
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-50 transition-colors cursor-pointer"
              onClick={() => navigate(`/citizen/complaints/${comp.complaint_id}`)}
            >
              <div>
                <p className="font-semibold text-surface-900">{comp.category}</p>
                <p className="text-sm text-surface-500 truncate max-w-md">{comp.description}</p>
              </div>
              <div className="flex items-center gap-4 text-sm whitespace-nowrap">
                <span className="font-mono text-surface-400">{comp.complaint_id}</span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  comp.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                  comp.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-800' :
                  'bg-surface-100 text-surface-800'
                }`}>
                  {comp.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
          {myComplaints.length === 0 && (
            <div className="p-8 text-center text-surface-500 text-sm">
              You haven't submitted any complaints yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
