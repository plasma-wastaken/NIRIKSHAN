import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, ShieldAlert, ScanSearch, Fingerprint, CheckCircle2, AlertTriangle, Info, Image as ImageIcon } from 'lucide-react';
import { useInspections } from '../../context/InspectionContext';
import { getMockMLResult } from '../../data/mockMLResults';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';

export const SupervisorReviewDetail: React.FC = () => {
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const navigate = useNavigate();
  const { inspections, updateInspectionStatus } = useInspections();

  const [notes, setNotes] = useState('');
  const [modalAction, setModalAction] = useState<'APPROVE' | 'RETURN' | 'FLAG' | null>(null);

  const insp = inspections.find(i => i.inspection_id === inspectionId);
  
  if (!insp) {
    return <EmptyState title="Not Found" description="Inspection not found." actionLabel="Back" onAction={() => navigate(-1)} />;
  }

  const ml = getMockMLResult(insp.inspection_id);
  const cvClean = ml.cv_validation.flags.length === 0;

  const handleAction = () => {
    if (modalAction) {
      const statusMap = { 'APPROVE': 'APPROVED', 'RETURN': 'RETURNED', 'FLAG': 'FLAGGED' } as const;
      updateInspectionStatus(insp.inspection_id, statusMap[modalAction], notes);
      navigate('/supervisor/reviews');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="px-2">
          <ArrowLeft className="h-5 w-5 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Review Inspection</h1>
          <p className="text-sm text-surface-500 font-mono mt-0.5">{insp.inspection_id}</p>
        </div>
        <div className="ml-auto">
          <Badge variant={insp.status === 'SUBMITTED' ? 'default' : insp.status === 'APPROVED' ? 'success' : insp.status === 'RETURNED' ? 'danger' : 'warning'}>
            {insp.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-surface-100">
              <CardTitle className="text-base">Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-surface-500 text-xs font-bold uppercase tracking-wider mb-1">Site</p>
                <p className="font-semibold text-surface-900">{insp.site_name}</p>
                <p className="text-surface-500">{insp.site_id}</p>
              </div>
              <div>
                <p className="text-surface-500 text-xs font-bold uppercase tracking-wider mb-1">Inspector</p>
                <p className="font-semibold text-surface-900">{insp.inspector_id}</p>
              </div>
              <div className="col-span-2 bg-surface-50 p-3 rounded-lg flex items-center gap-3 border border-surface-200">
                <MapPin className="h-5 w-5 text-surface-400" />
                <div>
                  <p className="font-medium text-surface-900">Location Verified</p>
                  <p className="text-xs text-surface-500">{insp.latitude}, {insp.longitude}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b border-surface-100">
              <CardTitle className="text-base flex items-center gap-2">
                <ScanSearch className="h-4 w-4" /> AI Visual Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {cvClean ? (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span className="font-medium">No visual compliance issues detected.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-orange-800 bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <span className="font-medium">Potential issues flagged by CV model</span>
                  </div>
                  <ul className="list-disc list-inside text-sm text-surface-700 pl-2">
                    {ml.cv_validation.detected_issues.map((iss, i) => <li key={i}>{iss}</li>)}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b border-surface-100">
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Evidence & Integrity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
               <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg border border-green-200 text-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span className="font-medium">Evidence integrity verified (SHA-256)</span>
               </div>
               {ml.similarity_check.flagged && (
                 <div className="flex items-center gap-2 text-orange-800 bg-orange-50 p-3 rounded-lg border border-orange-200 text-sm">
                   <Fingerprint className="h-4 w-4 shrink-0" />
                   <span className="font-medium">Potential repeated evidence detected (Score: {ml.similarity_check.similarity_score.toFixed(2)})</span>
                 </div>
               )}
               <div className="h-32 bg-surface-100 border-2 border-dashed border-surface-200 rounded-lg flex items-center justify-center text-surface-400 text-sm">
                 [Mock Photo/Video Previews]
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-surface-100 bg-surface-50 rounded-t-xl">
              <CardTitle className="text-base text-surface-700">Inspector Notes</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm text-surface-600 italic">
                {insp.inspector_notes || 'No additional notes provided by inspector.'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3 border-b border-surface-100 bg-surface-50 rounded-t-xl">
              <CardTitle className="text-base text-surface-700">Related Records</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-surface-500">Complaint</span>
                <span className="text-sm font-mono text-primary-600 cursor-pointer hover:underline">CMP-2026-882</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-surface-500">Ticket</span>
                <span className="text-sm font-mono text-primary-600 cursor-pointer hover:underline">TKT-104-B</span>
              </div>
            </CardContent>
          </Card>
          <Card className={insp.risk_level === 'CRITICAL' ? 'border-red-300 shadow-sm' : ''}>
            <CardHeader className="pb-3 border-b border-surface-100 bg-surface-50 rounded-t-xl">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-surface-600" /> Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="text-center pb-4 border-b border-surface-100 mb-4">
                <span className="text-4xl font-extrabold text-surface-900">{Math.round(ml.anomaly_scoring.score)}</span>
                <span className="text-surface-500 font-medium">/100</span>
                <div className="mt-2">
                  <Badge variant={insp.risk_level === 'CRITICAL' || insp.risk_level === 'HIGH' ? 'danger' : 'warning'}>
                    {insp.risk_level} RISK
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase text-surface-500 tracking-wider">Factors</p>
                {Object.entries(ml.anomaly_scoring.factors).map(([factor, weight], i) => (
                  <p key={i} className="text-sm text-surface-700">• {factor.replace(/_/g, ' ')} ({Math.round(weight * 100)}%)</p>
                ))}
              </div>
              <div className="mt-4 flex items-start gap-2 bg-blue-50 text-blue-800 p-3 rounded-lg text-xs">
                <Info className="h-4 w-4 shrink-0" />
                <p>AI-generated risk signals are provided for decision support and do not constitute automated legal enforcement.</p>
              </div>
            </CardContent>
          </Card>

          {insp.status === 'SUBMITTED' && (
            <Card className="border-primary-200">
              <CardHeader className="pb-3 border-b border-surface-100 bg-primary-50">
                <CardTitle className="text-base">Review Decision</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-surface-700">Supervisor Notes / Reason</label>
                  <textarea 
                    className="w-full mt-1 border border-surface-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary-500" 
                    rows={3} 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Enter reason if returning or flagging..."
                  />
                </div>
                <div className="space-y-2">
                  <Button className="w-full" onClick={() => setModalAction('APPROVE')}>Approve Inspection</Button>
                  <Button variant="outline" className="w-full text-orange-700 border-orange-200 hover:bg-orange-50" onClick={() => setModalAction('RETURN')} disabled={!notes}>
                    Return for Review
                  </Button>
                  <Button variant="outline" className="w-full text-red-700 border-red-200 hover:bg-red-50" onClick={() => setModalAction('FLAG')} disabled={!notes}>
                    Flag for Attention
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Modal isOpen={!!modalAction} onClose={() => setModalAction(null)} title="Confirm Decision">
        <div className="space-y-4">
          <p className="text-sm text-surface-700">
            Are you sure you want to <strong>{modalAction?.toLowerCase()}</strong> this inspection?
          </p>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setModalAction(null)}>Cancel</Button>
            <Button className="flex-1" onClick={handleAction}>Confirm</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
