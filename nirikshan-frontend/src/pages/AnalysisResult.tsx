import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldAlert,
  Fingerprint,
  ScanSearch,
  Brain,
  Info,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { cn } from '../utils/cn';
import {
  getMockMLResult,
  type InspectionMLResult,
  type RiskLevel,
} from '../data/mockMLResults';

// ─── Processing pipeline steps ────────────────────────────────────────────────

type PipelineStatus = 'pending' | 'active' | 'done';

interface PipelineStep {
  id: string;
  label: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  { id: 'received',    label: 'Evidence received' },
  { id: 'integrity',   label: 'Image integrity checked' },
  { id: 'compliance',  label: 'Visual compliance analysis' },
  { id: 'similarity',  label: 'Repeated-evidence check' },
  { id: 'anomaly',     label: 'Anomaly analysis' },
  { id: 'result',      label: 'Generating inspection risk result' },
];

// ─── Risk level config ─────────────────────────────────────────────────────────

const RISK_CONFIG: Record<
  RiskLevel,
  { label: string; barColor: string; badgeCls: string; ringCls: string; textCls: string }
> = {
  LOW: {
    label: 'LOW',
    barColor: 'bg-green-500',
    badgeCls: 'bg-green-100 text-green-800 border-green-200',
    ringCls: 'ring-green-300',
    textCls: 'text-green-700',
  },
  MEDIUM: {
    label: 'MEDIUM',
    barColor: 'bg-yellow-500',
    badgeCls: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ringCls: 'ring-yellow-300',
    textCls: 'text-yellow-700',
  },
  HIGH: {
    label: 'HIGH',
    barColor: 'bg-orange-500',
    badgeCls: 'bg-orange-100 text-orange-800 border-orange-200',
    ringCls: 'ring-orange-300',
    textCls: 'text-orange-700',
  },
  CRITICAL: {
    label: 'CRITICAL',
    barColor: 'bg-red-600',
    badgeCls: 'bg-red-100 text-red-800 border-red-200',
    ringCls: 'ring-red-400',
    textCls: 'text-red-700',
  },
};

// ─── Factor label map ──────────────────────────────────────────────────────────

const FACTOR_LABELS: Record<string, string> = {
  gps_mismatch:             'GPS mismatch',
  short_duration:           'Short duration',
  repeated_evidence:        'Repeated evidence',
  metadata_inconsistency:   'Metadata inconsistency',
};

// ─── Helper: percentage display ────────────────────────────────────────────────

const pct = (v: number) => `${Math.round(v * 100)}%`;

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Animated processing pipeline */
const ProcessingPipeline: React.FC<{ currentStep: number }> = ({ currentStep }) => (
  <div className="space-y-3 py-2">
    {PIPELINE_STEPS.map((step, idx) => {
      const status: PipelineStatus =
        idx < currentStep ? 'done' : idx === currentStep ? 'active' : 'pending';
      const isLast = idx === PIPELINE_STEPS.length - 1;

      return (
        <div key={step.id} className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
            {status === 'done' && (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
            {status === 'active' && (
              <Loader2
                className={cn(
                  'h-5 w-5 animate-spin',
                  isLast ? 'text-primary-600' : 'text-yellow-500'
                )}
              />
            )}
            {status === 'pending' && (
              <div className="h-4 w-4 rounded-full border-2 border-surface-300" />
            )}
          </div>

          {/* Label */}
          <span
            className={cn(
              'text-sm font-medium transition-colors',
              status === 'done'   && 'text-green-700',
              status === 'active' && (isLast ? 'text-primary-700 font-semibold' : 'text-yellow-700'),
              status === 'pending' && 'text-surface-400'
            )}
          >
            {status === 'active' && isLast ? `→ ${step.label}` : step.label}
          </span>
        </div>
      );
    })}
  </div>
);

/** Confidence pill */
const ConfidencePill: React.FC<{ value: number }> = ({ value }) => (
  <div className="flex items-center gap-1.5 mt-2">
    <span className="text-xs text-surface-500 font-medium uppercase tracking-wider">Confidence</span>
    <span
      className={cn(
        'text-xs font-bold px-2 py-0.5 rounded-full',
        value >= 0.8 ? 'bg-green-100 text-green-800' :
        value >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                       'bg-red-100 text-red-800'
      )}
    >
      {pct(value)}
    </span>
  </div>
);

/** CV Validation section */
const CVValidationCard: React.FC<{ result: InspectionMLResult['cv_validation'] }> = ({ result }) => {
  const clean = result.flags.length === 0 && result.detected_issues.length === 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary-100 rounded-lg">
            <ScanSearch className="h-5 w-5 text-primary-700" />
          </div>
          <CardTitle className="text-base">Visual Compliance</CardTitle>
          <span className="ml-auto text-[10px] font-mono text-surface-400 uppercase tracking-wider">
            run_cv_validation()
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Status banner */}
        <div
          className={cn(
            'flex items-start gap-3 rounded-lg p-3 mb-3',
            clean ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'
          )}
        >
          {clean ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p className={cn('font-semibold text-sm', clean ? 'text-green-800' : 'text-orange-800')}>
              {clean
                ? 'No compliance issues detected'
                : `${result.detected_issues.length} potential issue${result.detected_issues.length > 1 ? 's' : ''} flagged`}
            </p>
            {result.detected_issues.map((issue, i) => (
              <p key={i} className="text-xs text-orange-700 mt-1">{issue}</p>
            ))}
          </div>
        </div>

        {/* Flags */}
        {result.flags.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium uppercase tracking-wider text-surface-500 mb-1.5">
              Flags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {result.flags.map((flag) => (
                <Badge key={flag} variant="warning" className="font-mono text-[11px]">
                  {flag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <ConfidencePill value={result.confidence} />
      </CardContent>
    </Card>
  );
};

/** Similarity Detection section */
const SimilarityCard: React.FC<{ result: InspectionMLResult['similarity_check'] }> = ({ result }) => {
  const scoreBarWidth = `${Math.round(result.similarity_score * 100)}%`;
  const scoreColor =
    result.similarity_score >= 0.75 ? 'bg-red-500' :
    result.similarity_score >= 0.4  ? 'bg-yellow-500' :
                                       'bg-green-500';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary-100 rounded-lg">
            <Fingerprint className="h-5 w-5 text-primary-700" />
          </div>
          <CardTitle className="text-base">Similarity Detection</CardTitle>
          <span className="ml-auto text-[10px] font-mono text-surface-400 uppercase tracking-wider">
            run_similarity_check()
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Flagged banner */}
        {result.flagged && (
          <div className="flex items-start gap-3 rounded-lg p-3 mb-4 bg-red-50 border border-red-200">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-red-800">Potential repeated evidence</p>
              {result.matched_evidence_id && (
                <p className="text-xs text-red-700 mt-0.5">
                  Matched against&nbsp;
                  <span className="font-mono font-bold">{result.matched_evidence_id}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Score bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium uppercase tracking-wider text-surface-500">
              Similarity Score
            </span>
            <span
              className={cn(
                'text-sm font-bold tabular-nums',
                result.similarity_score >= 0.75 ? 'text-red-700' :
                result.similarity_score >= 0.4  ? 'text-yellow-700' : 'text-green-700'
              )}
            >
              {result.similarity_score.toFixed(2)}
            </span>
          </div>
          <div className="h-2.5 bg-surface-200 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-700', scoreColor)}
              style={{ width: scoreBarWidth }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-surface-400 mt-0.5">
            <span>0.00 — Unique</span>
            <span>1.00 — Identical</span>
          </div>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-surface-500 font-medium uppercase tracking-wider mb-0.5">Method</p>
            <p className="font-mono font-semibold text-surface-900">{result.method}</p>
          </div>
          <div>
            <p className="text-surface-500 font-medium uppercase tracking-wider mb-0.5">Flagged</p>
            <div className="flex items-center gap-1">
              {result.flagged ? (
                <>
                  <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                  <span className="font-bold text-red-700">Yes</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  <span className="font-bold text-green-700">No</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/** Risk score gauge ring + level badge */
const RiskScoreDial: React.FC<{ score: number; level: RiskLevel }> = ({ score, level }) => {
  const cfg = RISK_CONFIG[level];
  const circumference = 2 * Math.PI * 44; // r=44
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      {/* SVG gauge */}
      <div className={cn('relative w-32 h-32 rounded-full ring-4', cfg.ringCls)}>
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {/* Track */}
          <circle cx="50" cy="50" r="44" fill="none" stroke="#e2e8f0" strokeWidth="8" />
          {/* Arc */}
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn('transition-all duration-1000', cfg.textCls)}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-surface-900 tabular-nums leading-none">
            {score}
          </span>
          <span className="text-[10px] text-surface-500 font-medium">/ 100</span>
        </div>
      </div>

      {/* Level badge */}
      <div
        className={cn(
          'mt-3 px-4 py-1 rounded-full border text-xs font-bold tracking-widest uppercase',
          cfg.badgeCls
        )}
      >
        {cfg.label}
      </div>
    </div>
  );
};

/** Anomaly / Risk Score section */
const AnomalyScoringCard: React.FC<{ result: InspectionMLResult['anomaly_scoring'] }> = ({
  result,
}) => {
  // Sort factors descending by weight for visual clarity
  const sortedFactors = Object.entries(result.factors).sort(([, a], [, b]) => b - a);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary-100 rounded-lg">
            <ShieldAlert className="h-5 w-5 text-primary-700" />
          </div>
          <CardTitle className="text-base">Anomaly Risk Score</CardTitle>
          <span className="ml-auto text-[10px] font-mono text-surface-400 uppercase tracking-wider">
            run_anomaly_scoring()
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Dial + level */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-5">
          <RiskScoreDial score={Math.round(result.score)} level={result.risk_level as RiskLevel} />

          {/* Factors */}
          <div className="flex-1 w-full">
            <p className="text-xs font-medium uppercase tracking-wider text-surface-500 mb-2">
              Contributing Factors
            </p>
            <div className="space-y-2">
              {sortedFactors.map(([key, weight]) => {
                const barPct = `${Math.round(weight * 100)}%`;
                const barColor =
                  weight >= 0.6 ? 'bg-red-500' :
                  weight >= 0.3 ? 'bg-yellow-500' : 'bg-green-500';

                return (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-xs text-surface-700 font-medium">
                        {FACTOR_LABELS[key] ?? key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs font-mono font-bold text-surface-600 tabular-nums">
                        {weight.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-700', barColor)}
                        style={{ width: barPct }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Metadata row */}
        <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-surface-100">
          <div>
            <p className="text-surface-500 font-medium uppercase tracking-wider mb-0.5">Confidence</p>
            <span
              className={cn(
                'text-sm font-bold tabular-nums',
                result.confidence >= 0.8 ? 'text-green-700' :
                result.confidence >= 0.6 ? 'text-yellow-700' : 'text-red-700'
              )}
            >
              {pct(result.confidence)}
            </span>
          </div>
          <div>
            <p className="text-surface-500 font-medium uppercase tracking-wider mb-0.5">Computed At</p>
            <div className="flex items-center gap-1 text-surface-700 font-medium">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span>
                {new Date(result.computed_at).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Main page ─────────────────────────────────────────────────────────────────

export const AnalysisResult: React.FC = () => {
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const navigate = useNavigate();

  // Pipeline animation state
  const [pipelineStep, setPipelineStep] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [mlResult, setMlResult] = useState<InspectionMLResult | null>(null);

  useEffect(() => {
    if (!inspectionId) return;

    // Simulate pipeline progression — each step takes ~700 ms
    const stepCount = PIPELINE_STEPS.length;
    let step = 0;

    const advance = () => {
      step += 1;
      setPipelineStep(step);

      if (step >= stepCount) {
        // All steps done — load ML result and show results
        setTimeout(() => {
          setMlResult(getMockMLResult(inspectionId));
          setAnalysisComplete(true);
        }, 600);
      } else {
        setTimeout(advance, 700);
      }
    };

    const timer = setTimeout(advance, 700);
    return () => clearTimeout(timer);
  }, [inspectionId]);

  const riskCfg = mlResult
    ? RISK_CONFIG[mlResult.anomaly_scoring.risk_level as RiskLevel]
    : null;

  return (
    <div className="space-y-6 pb-24 max-w-3xl mx-auto">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="px-2"
        >
          <ArrowLeft className="h-5 w-5 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary-700" />
            AI Analysis
          </h1>
          {inspectionId && (
            <p className="text-xs text-surface-500 font-mono mt-0.5">{inspectionId}</p>
          )}
        </div>
      </div>

      {/* ── Processing pipeline ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            {analysisComplete ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Loader2 className="h-5 w-5 text-primary-600 animate-spin" />
            )}
            {analysisComplete ? 'Analysis Complete' : 'Analyzing Evidence…'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProcessingPipeline currentStep={pipelineStep} />
        </CardContent>
      </Card>

      {/* ── Results — rendered only after pipeline completes ─────────────────── */}
      {analysisComplete && mlResult && (
        <>
          {/* Summary banner */}
          <div
            className={cn(
              'flex items-center gap-3 rounded-xl border p-4',
              riskCfg?.badgeCls
            )}
          >
            <ShieldAlert className="h-6 w-6 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-sm">
                Inspection risk level assessed as&nbsp;
                <span className="uppercase tracking-wide">{mlResult.anomaly_scoring.risk_level}</span>
              </p>
              <p className="text-xs mt-0.5 opacity-80">
                Score: {Math.round(mlResult.anomaly_scoring.score)} / 100 &nbsp;·&nbsp;
                Confidence: {pct(mlResult.anomaly_scoring.confidence)}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 opacity-60" />
          </div>

          {/* ── AI signal cards ─────────────────────────────────────────────── */}
          <CVValidationCard result={mlResult.cv_validation} />
          <SimilarityCard result={mlResult.similarity_check} />
          <AnomalyScoringCard result={mlResult.anomaly_scoring} />

          {/* ── Disclaimer ──────────────────────────────────────────────────── */}
          <div className="flex items-start gap-3 rounded-xl border border-surface-200 bg-surface-50 p-4">
            <Info className="h-5 w-5 text-surface-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-surface-600 leading-relaxed">
              <span className="font-semibold text-surface-700">Decision-support only. </span>
              AI-generated risk signals are provided for inspection decision support and do not
              constitute automated legal enforcement. All findings must be reviewed and confirmed
              by a qualified inspector or supervisor before any official action is taken.
            </p>
          </div>

          {/* ── Action row ──────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                navigate(`/inspector/inspections/${inspectionId}/evidence`)
              }
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Add More Evidence
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => navigate(`/inspector/inspections/${inspectionId}`)}
            >
              Back to Inspection
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() =>
                navigate(`/inspector/inspections/${inspectionId}/submit`)
              }
            >
              Proceed to Submit
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
