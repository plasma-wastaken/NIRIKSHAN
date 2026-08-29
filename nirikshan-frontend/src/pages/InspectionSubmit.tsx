import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  ImageIcon,
  ScanSearch,
  Fingerprint,
  ShieldAlert,
  FileText,
  Send,
  LayoutDashboard,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useInspections } from '../context/InspectionContext';
import { getMockMLResult } from '../data/mockMLResults';
import { cn } from '../utils/cn';

// ─── Risk level colours (reuse same palette as AnalysisResult) ─────────────────
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

const RISK_BADGE: Record<RiskLevel, string> = {
  LOW:      'bg-green-100  text-green-800  border border-green-200',
  MEDIUM:   'bg-yellow-100 text-yellow-800 border border-yellow-200',
  HIGH:     'bg-orange-100 text-orange-800 border border-orange-200',
  CRITICAL: 'bg-red-100    text-red-800    border border-red-200',
};

// ─── Small summary row ────────────────────────────────────────────────────────

interface SummaryRowProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  status?: 'ok' | 'warn' | 'neutral';
}

const SummaryRow: React.FC<SummaryRowProps> = ({ icon, label, children, status = 'neutral' }) => (
  <div className="flex items-start gap-3 py-3">
    <div
      className={cn(
        'flex-shrink-0 p-1.5 rounded-lg',
        status === 'ok'   && 'bg-green-100',
        status === 'warn' && 'bg-orange-100',
        status === 'neutral' && 'bg-surface-100',
      )}
    >
      <span
        className={cn(
          'flex items-center',
          status === 'ok'      && 'text-green-700',
          status === 'warn'    && 'text-orange-700',
          status === 'neutral' && 'text-surface-500',
        )}
      >
        {icon}
      </span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">{label}</p>
      <div className="text-sm text-surface-900 font-medium mt-0.5">{children}</div>
    </div>
  </div>
);

// ─── Confirmation Modal ───────────────────────────────────────────────────────

interface ConfirmModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  isSubmitting,
  onCancel,
  onConfirm,
}) => (
  <Modal isOpen={isOpen} onClose={onCancel} title="Submit Inspection for Review?">
    <div className="space-y-4">
      <p className="text-sm text-surface-600">
        You are about to submit this inspection. Once submitted, the record will be queued for
        supervisor review and the status will be updated to&nbsp;
        <span className="font-semibold">SUBMITTED</span>.
      </p>
      <div className="flex items-start gap-2 text-xs text-surface-500 bg-surface-50 border border-surface-200 rounded-lg p-3">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-surface-400" />
        <span>
          AI risk signals attached to this inspection are for decision support only and do not
          constitute automated enforcement.
        </span>
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="outline" className="flex-1" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button className="flex-1" onClick={onConfirm} isLoading={isSubmitting}>
          <Send className="h-4 w-4 mr-2" />
          Submit
        </Button>
      </div>
    </div>
  </Modal>
);

// ─── Success screen ───────────────────────────────────────────────────────────

interface SuccessScreenProps {
  inspectionId: string;
  submittedAt: string;
  onDashboard: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ inspectionId, submittedAt, onDashboard }) => (
  <div className="flex flex-col items-center justify-center text-center py-12 space-y-6 max-w-sm mx-auto">
    {/* Animated checkmark ring */}
    <div className="relative">
      <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center ring-8 ring-green-50 animate-pulse">
        <CheckCircle2 className="h-12 w-12 text-green-600" />
      </div>
    </div>

    <div>
      <h2 className="text-2xl font-bold text-surface-900">Inspection Submitted</h2>
      <p className="text-surface-500 text-sm mt-2">
        Your inspection has been queued for supervisor review.
      </p>
    </div>

    {/* Details card */}
    <div className="w-full bg-white rounded-xl border border-surface-200 shadow-sm text-left divide-y divide-surface-100">
      <div className="px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-400">
          Inspection ID
        </p>
        <p className="text-base font-bold text-primary-900 mt-0.5 font-mono">{inspectionId}</p>
      </div>
      <div className="px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-400">
          Submitted At
        </p>
        <p className="text-sm font-medium text-surface-900 mt-0.5">
          {new Date(submittedAt).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </p>
      </div>
      <div className="px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-400">
          Status
        </p>
        <div className="mt-1">
          <Badge variant="default">SUBMITTED</Badge>
        </div>
      </div>
    </div>

    <Button size="lg" className="w-full" onClick={onDashboard}>
      <LayoutDashboard className="h-5 w-5 mr-2" />
      Return to Dashboard
    </Button>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────

export const InspectionSubmit: React.FC = () => {
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const navigate = useNavigate();
  const { inspections, updateInspectionStatus } = useInspections();

  const [notes, setNotes] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  const id = inspectionId ?? '';
  const inspection =
    inspections.find((i) => i.inspection_id === id) ?? inspections[1];
  const ml = getMockMLResult(id);

  const riskLevel = ml.anomaly_scoring.risk_level as RiskLevel;
  const cvClean = ml.cv_validation.flags.length === 0;
  const simFlagged = ml.similarity_check.flagged;

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowModal(false);
      updateInspectionStatus(id, 'SUBMITTED', notes);
      setSubmittedAt(new Date().toISOString());
    }, 1800);
  };

  // ── Post-submission success screen ─────────────────────────────────────────
  if (submittedAt) {
    return (
      <div className="max-w-3xl mx-auto pb-20">
        <SuccessScreen
          inspectionId={id}
          submittedAt={submittedAt}
          onDashboard={() => navigate('/inspector/dashboard')}
        />
      </div>
    );
  }

  // ── Summary + submission form ───────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-24 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="px-2">
          <ArrowLeft className="h-5 w-5 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900">
            Inspection Summary
          </h1>
          <p className="text-xs text-surface-500 font-mono mt-0.5">{id}</p>
        </div>
      </div>

      {/* ── Inspection Checklist Summary ──────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2 border-b border-surface-100">
          <CardTitle className="text-base">Workflow Checklist</CardTitle>
        </CardHeader>
        <CardContent className="px-5 divide-y divide-surface-100 pb-2">
          {/* 1. Location */}
          <SummaryRow
            icon={<MapPin className="h-4 w-4" />}
            label="Location Verification"
            status="ok"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              <span>Verified — within geofence ({inspection.site_name})</span>
            </div>
            <p className="text-xs text-surface-500 mt-0.5">
              {inspection.latitude.toFixed(5)}° N,&nbsp;{inspection.longitude.toFixed(5)}° E
            </p>
          </SummaryRow>

          {/* 2. Evidence */}
          <SummaryRow
            icon={<ImageIcon className="h-4 w-4" />}
            label="Evidence Captured"
            status="ok"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              <span>3 items captured &amp; hashed (SHA-256)</span>
            </div>
          </SummaryRow>

          {/* 3. CV Validation */}
          <SummaryRow
            icon={<ScanSearch className="h-4 w-4" />}
            label="Visual Compliance (CV)"
            status={cvClean ? 'ok' : 'warn'}
          >
            {cvClean ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                <span>No compliance issues detected</span>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-orange-600" />
                  <span className="text-orange-800">
                    {ml.cv_validation.detected_issues.length} issue
                    {ml.cv_validation.detected_issues.length > 1 ? 's' : ''} flagged
                  </span>
                </div>
                {ml.cv_validation.detected_issues.map((issue, i) => (
                  <p key={i} className="text-xs text-orange-700 pl-5">
                    {issue}
                  </p>
                ))}
              </div>
            )}
            <p className="text-xs text-surface-500 mt-0.5">
              Confidence: {Math.round(ml.cv_validation.confidence * 100)}%
            </p>
          </SummaryRow>

          {/* 4. Similarity */}
          <SummaryRow
            icon={<Fingerprint className="h-4 w-4" />}
            label="Evidence Similarity"
            status={simFlagged ? 'warn' : 'ok'}
          >
            {simFlagged ? (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-orange-600" />
                <span className="text-orange-800">Potential repeated evidence detected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                <span>No repeated evidence</span>
              </div>
            )}
            <p className="text-xs text-surface-500 mt-0.5">
              Score: {ml.similarity_check.similarity_score.toFixed(2)} · Method:{' '}
              {ml.similarity_check.method}
            </p>
          </SummaryRow>

          {/* 5. Risk Score */}
          <SummaryRow
            icon={<ShieldAlert className="h-4 w-4" />}
            label="Risk Score"
            status={riskLevel === 'LOW' ? 'ok' : riskLevel === 'MEDIUM' ? 'neutral' : 'warn'}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl font-extrabold tabular-nums">
                {Math.round(ml.anomaly_scoring.score)}{' '}
                <span className="text-sm font-normal text-surface-500">/ 100</span>
              </span>
              <span
                className={cn(
                  'text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border',
                  RISK_BADGE[riskLevel]
                )}
              >
                {riskLevel}
              </span>
            </div>
            <p className="text-xs text-surface-500 mt-0.5">
              Confidence: {Math.round(ml.anomaly_scoring.confidence * 100)}%
            </p>
          </SummaryRow>
        </CardContent>
      </Card>

      {/* ── Inspector Notes ───────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3 border-b border-surface-100">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary-700" />
            Inspector Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <label className="block text-xs font-medium text-surface-600 mb-2">
            Add any observations, context, or corrective recommendations (optional)
          </label>
          <textarea
            rows={5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Site foreman was present. Emergency exit partially obstructed by pallets — verbal instruction given. Recommend follow-up within 7 days…"
            className={cn(
              'w-full resize-none rounded-lg border border-surface-300 bg-white px-3 py-2.5',
              'text-sm text-surface-900 placeholder:text-surface-400',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
              'transition-colors'
            )}
          />
          <p className="text-xs text-surface-400 mt-1 text-right">
            {notes.length} character{notes.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      {/* ── Disclaimer ──────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 rounded-xl border border-surface-200 bg-surface-50 p-4">
        <Info className="h-5 w-5 text-surface-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-surface-600 leading-relaxed">
          <span className="font-semibold text-surface-700">Decision-support only. </span>
          AI-generated risk signals are provided for inspection decision support and do not
          constitute automated legal enforcement. All findings require human review.
        </p>
      </div>

      {/* ── Submit button ─────────────────────────────────────────────────── */}
      <Button
        size="lg"
        className="w-full text-base h-14"
        onClick={() => setShowModal(true)}
      >
        <Send className="h-5 w-5 mr-2" />
        Submit Inspection
      </Button>

      {/* ── Confirmation modal ────────────────────────────────────────────── */}
      <ConfirmModal
        isOpen={showModal}
        isSubmitting={isSubmitting}
        onCancel={() => setShowModal(false)}
        onConfirm={handleSubmit}
      />
    </div>
  );
};
