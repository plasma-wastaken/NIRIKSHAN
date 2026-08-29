import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Image as ImageIcon, Ticket, Calendar, ShieldAlert } from 'lucide-react';
import { useComplaints } from '../../context/ComplaintContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export const ComplaintDetail: React.FC = () => {
  const { complaintId } = useParams<{ complaintId: string }>();
  const { complaints } = useComplaints();
  const navigate = useNavigate();

  const comp = complaints.find(c => c.complaint_id === complaintId);

  if (!comp) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold">Complaint Not Found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary-600 hover:underline">Go back</button>
      </div>
    );
  }

  const timelineStages = [
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'UNDER_REVIEW', label: 'Under Review' },
    { key: 'ASSIGNED', label: 'Assigned' },
    { key: 'IN_PROGRESS', label: 'Inspection / Resolution' },
    { key: 'RESOLVED', label: 'Resolved' },
    { key: 'CLOSED', label: 'Closed' }
  ];

  const currentIndex = timelineStages.findIndex(s => s.key === comp.status) || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-surface-500 hover:text-surface-900 transition-colors mt-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-surface-900">{comp.category}</h1>
            <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
              {comp.complaint_id}
            </span>
          </div>
          <p className="text-sm text-surface-500 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Submitted on {new Date(comp.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <Card>
        <CardContent className="p-6 overflow-x-auto">
          <div className="flex items-center min-w-[600px]">
            {timelineStages.map((stage, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              return (
                <React.Fragment key={stage.key}>
                  <div className="flex flex-col items-center relative z-10 w-24">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${
                      isPast ? 'bg-primary-600 border-primary-600 text-white' :
                      isCurrent ? 'bg-white border-primary-600 text-primary-700 ring-4 ring-primary-50' :
                      'bg-surface-100 border-surface-300 text-surface-400'
                    }`}>
                      {idx + 1}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 text-center ${
                      isCurrent ? 'text-primary-700' : isPast ? 'text-surface-900' : 'text-surface-400'
                    }`}>
                      {stage.label}
                    </span>
                  </div>
                  {idx < timelineStages.length - 1 && (
                    <div className={`flex-1 h-1 -mx-4 z-0 ${
                      isPast ? 'bg-primary-600' : 'bg-surface-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Details */}
          <Card>
            <CardHeader className="border-b border-surface-100 pb-3">
              <CardTitle className="text-base">Complaint Details</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div>
                <p className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-1">Description</p>
                <p className="text-surface-900 text-sm leading-relaxed">{comp.description}</p>
              </div>
              <div className="flex items-start gap-2 bg-surface-50 p-3 rounded-lg border border-surface-200">
                <MapPin className="h-5 w-5 text-surface-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-0.5">Location</p>
                  <p className="text-sm font-mono text-surface-900">{comp.latitude}, {comp.longitude}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evidence */}
          <Card>
            <CardHeader className="border-b border-surface-100 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Evidence Attached
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {comp.evidence_files.length > 0 ? (
                <div className="flex gap-4">
                  {comp.evidence_files.map((file, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-surface-50 border border-surface-200 rounded-lg">
                      <div className="h-10 w-10 bg-primary-100 text-primary-700 flex items-center justify-center rounded">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                      <div className="text-sm">
                        <p className="font-semibold text-surface-900">{file.evidence_id}</p>
                        <p className="text-surface-500 text-xs">{file.evidence_type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-surface-500 italic">No evidence files attached.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Linked Records */}
          <Card>
            <CardHeader className="border-b border-surface-100 pb-3 bg-surface-50 rounded-t-xl">
              <CardTitle className="text-sm flex items-center gap-2 text-surface-700">
                <Ticket className="h-4 w-4" /> Internal Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div>
                <p className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-1">Ticket Assignment</p>
                {comp.ticket_id ? (
                  <p className="text-sm font-mono font-medium text-surface-900">{comp.ticket_id}</p>
                ) : (
                  <p className="text-xs text-surface-500">Ticket has not yet been created.</p>
                )}
              </div>
              
              <div className="border-t border-surface-100 pt-4">
                <p className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-1">Field Inspection</p>
                {comp.inspection_id ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-mono font-medium text-surface-900">{comp.inspection_id}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">SCHEDULED</span>
                  </div>
                ) : (
                  <p className="text-xs text-surface-500">No inspection scheduled yet.</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-start gap-2 text-blue-800 mt-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-xs font-medium leading-relaxed">
                  Internal notes and risk scoring are restricted to department officials.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
