import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { FileText, Download, BarChart2, PieChart, Activity, CheckCircle2, Clock } from 'lucide-react';
import { useInspections } from '../../context/InspectionContext';

export const AdminReports: React.FC = () => {
  const { inspections } = useInspections();
  const [reportType, setReportType] = useState('monthly');
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert('Report downloaded successfully!');
    }, 1500);
  };

  const totalInspections = inspections.length;
  const compliant = inspections.filter(i => i.risk_level === 'LOW').length;
  const complianceRate = totalInspections > 0 ? Math.round((compliant / totalInspections) * 100) : 0;
  
  const highRisk = inspections.filter(i => i.risk_level === 'HIGH' || i.risk_level === 'CRITICAL').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 bg-white p-6 rounded-xl border border-surface-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary-600" />
            System Reports & Analytics
          </h1>
          <p className="text-sm text-surface-500 mt-1">Generate, view, and download operational reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            label=""
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={[
              { label: 'Monthly Report', value: 'monthly' },
              { label: 'Quarterly Report', value: 'quarterly' },
              { label: 'Annual Summary', value: 'annual' },
            ]}
          />
          <Button onClick={handleDownload} isLoading={downloading} className="bg-primary-800">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary-900 text-white border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-primary-100 text-sm font-medium">Average Compliance Rate</p>
                <h3 className="text-4xl font-bold mt-2">{complianceRate}%</h3>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400 opacity-80" />
            </div>
            <div className="mt-4 text-xs text-primary-200">
              Based on {totalInspections} total inspections
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-surface-500 text-sm font-medium">Critical Risk Sites</p>
                <h3 className="text-3xl font-bold text-surface-900 mt-2">{highRisk}</h3>
              </div>
              <Activity className="h-8 w-8 text-red-500 opacity-80" />
            </div>
            <div className="mt-4 text-xs text-surface-500">
              Requires immediate attention
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-surface-500 text-sm font-medium">Average Resolution Time</p>
                <h3 className="text-3xl font-bold text-surface-900 mt-2">4.2 <span className="text-lg">days</span></h3>
              </div>
              <Clock className="h-8 w-8 text-yellow-500 opacity-80" />
            </div>
            <div className="mt-4 text-xs text-surface-500">
              -12% compared to last month
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-surface-900">
              <BarChart2 className="h-5 w-5 text-primary-600" />
              Inspection Volume Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center bg-surface-50 rounded-b-lg border-t border-surface-100">
            <p className="text-surface-400 font-medium">Chart Visualization Placeholder</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-surface-900">
              <PieChart className="h-5 w-5 text-primary-600" />
              Violation Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center bg-surface-50 rounded-b-lg border-t border-surface-100">
            <p className="text-surface-400 font-medium">Chart Visualization Placeholder</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports Archive</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-surface-100">
            {[1, 2, 3].map((i) => (
              <div key={i} className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-50 p-2 rounded text-primary-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-surface-900">Monthly Compliance Report - {new Date(2026, 8 - i, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
                    <p className="text-xs text-surface-500">System Generated &bull; PDF (2.4 MB)</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleDownload}>
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
