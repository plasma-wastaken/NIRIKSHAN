import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useComplaints } from '../../context/ComplaintContext';
import { useTickets } from '../../context/TicketContext';
import { FileText, Download, CheckCircle2, Clock, AlertTriangle, BarChart2 } from 'lucide-react';

export const CitizenReports: React.FC = () => {
  const { complaints } = useComplaints();
  const { tickets } = useTickets();

  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
  const pendingComplaints = complaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length;
  const openTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
  const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED').length;

  // Category breakdown
  const categoryBreakdown = complaints.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleDownload = () => {
    alert('Your personal report has been queued for download.');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 bg-white p-6 rounded-xl border border-surface-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary-600" />
            Public Reports
          </h1>
          <p className="text-sm text-surface-500 mt-1">View your complaint history and access public transparency reports</p>
        </div>
        <Button onClick={handleDownload} className="bg-primary-800">
          <Download className="h-4 w-4 mr-2" />
          Download My Report
        </Button>
      </div>

      {/* Personal Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="p-5 text-center">
            <FileText className="h-7 w-7 text-primary-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-surface-900">{totalComplaints}</p>
            <p className="text-xs text-surface-500 uppercase tracking-wider mt-1">Total Complaints</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-5 text-center">
            <CheckCircle2 className="h-7 w-7 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-surface-900">{resolvedComplaints}</p>
            <p className="text-xs text-surface-500 uppercase tracking-wider mt-1">Resolved</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-5 text-center">
            <Clock className="h-7 w-7 text-yellow-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-surface-900">{pendingComplaints}</p>
            <p className="text-xs text-surface-500 uppercase tracking-wider mt-1">Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-5 text-center">
            <AlertTriangle className="h-7 w-7 text-orange-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-surface-900">{openTickets}</p>
            <p className="text-xs text-surface-500 uppercase tracking-wider mt-1">Open Tickets</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader className="border-b border-surface-100">
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary-600" />
              My Complaints by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {Object.keys(categoryBreakdown).length === 0 ? (
              <p className="text-surface-400 text-sm text-center py-6">No complaint data available.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(categoryBreakdown).map(([category, count]) => (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-surface-700">{category}</span>
                      <span className="text-surface-500">{count}</span>
                    </div>
                    <div className="w-full bg-surface-100 rounded-full h-2">
                      <div
                        className="bg-primary-800 h-2 rounded-full transition-all"
                        style={{ width: `${Math.round((count / totalComplaints) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ticket Status */}
        <Card>
          <CardHeader className="border-b border-surface-100">
            <CardTitle>Ticket Resolution Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-center p-3 bg-surface-50 rounded-lg">
              <span className="text-sm font-medium text-surface-700">Open / In Progress</span>
              <span className="font-bold text-primary-900">{openTickets}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-800">Resolved</span>
              <span className="font-bold text-green-700">{resolvedTickets}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-surface-50 rounded-lg border border-surface-200">
              <span className="text-sm font-medium text-surface-700">Total Tickets</span>
              <span className="font-bold text-surface-900">{tickets.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Public Transparency Reports */}
      <Card>
        <CardHeader className="border-b border-surface-100">
          <CardTitle>Public Transparency Reports</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-surface-100">
            {[
              { title: 'Monthly Inspection Summary – August 2026', type: 'PDF', size: '1.8 MB' },
              { title: 'Compliance Rate Overview – Q2 2026', type: 'PDF', size: '2.4 MB' },
              { title: 'Citizen Grievance Report – July 2026', type: 'PDF', size: '1.1 MB' },
            ].map((report, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-surface-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-50 p-2 rounded text-primary-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-surface-900 text-sm">{report.title}</h4>
                    <p className="text-xs text-surface-500">Public Document &bull; {report.type} ({report.size})</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
