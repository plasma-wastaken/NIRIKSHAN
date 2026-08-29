/**
 * Mock ML result data structures.
 * Field names exactly mirror the SRS §6.3 / §6.4 / §6.5 contracts.
 * When the real backend is ready, replace these mocks with API responses
 * that have the same shape — no further UI changes should be needed.
 */

// ─── §6.3  run_cv_validation() return contract ────────────────────────────────
export interface CVValidationResult {
  evidence_id: string;
  flags: string[];           // e.g. ["blocked_exit"]
  confidence: number;        // 0.0 – 1.0
  detected_issues: string[]; // human-readable descriptions
}

// ─── §6.4  run_similarity_check() return contract ─────────────────────────────
// (maps 1:1 onto EvidenceSimilarityResult columns)
export interface SimilarityCheckResult {
  similarity_id: string;
  evidence_id: string;
  matched_evidence_id: string | null;
  similarity_score: number;  // 0.0 – 1.0
  method: 'phash' | 'embedding' | 'none';
  flagged: boolean;
}

// ─── §6.5  run_anomaly_scoring() return contract ──────────────────────────────
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AnomalyScoringResult {
  inspection_id: string;
  score: number;             // 0-100
  risk_level: RiskLevel;
  factors: Record<string, number>; // e.g. { gps_mismatch: 0.4, short_duration: 0.2 }
  confidence: number;        // 0.0 – 1.0
  computed_at: string;       // ISO 8601
}

// ─── Aggregate ML result (what the analysis page receives/renders) ─────────────
export interface InspectionMLResult {
  cv_validation: CVValidationResult;
  similarity_check: SimilarityCheckResult;
  anomaly_scoring: AnomalyScoringResult;
}

// ─── Mock data ─────────────────────────────────────────────────────────────────

export const MOCK_ML_RESULTS: Record<string, InspectionMLResult> = {
  // HIGH-risk inspection — has flags and repeated evidence
  'INS-2023-1030': {
    cv_validation: {
      evidence_id: 'EV-1042',
      flags: ['blocked_exit', 'missing_signage'],
      confidence: 0.87,
      detected_issues: [
        'Potential blocked emergency exit detected in frame',
        'Required safety signage not visible',
      ],
    },
    similarity_check: {
      similarity_id: 'SIM-7731',
      evidence_id: 'EV-1042',
      matched_evidence_id: 'EV-0998',
      similarity_score: 0.91,
      method: 'embedding',
      flagged: true,
    },
    anomaly_scoring: {
      inspection_id: 'INS-2023-1030',
      score: 72,
      risk_level: 'HIGH',
      factors: {
        gps_mismatch: 0.4,
        short_duration: 0.2,
        repeated_evidence: 0.85,
        metadata_inconsistency: 0.3,
      },
      confidence: 0.89,
      computed_at: '2023-10-26T16:47:00Z',
    },
  },

  // LOW-risk inspection — clean bill of health
  'INS-2023-1025': {
    cv_validation: {
      evidence_id: 'EV-1033',
      flags: [],
      confidence: 0.92,
      detected_issues: [],
    },
    similarity_check: {
      similarity_id: 'SIM-7720',
      evidence_id: 'EV-1033',
      matched_evidence_id: null,
      similarity_score: 0.18,
      method: 'phash',
      flagged: false,
    },
    anomaly_scoring: {
      inspection_id: 'INS-2023-1025',
      score: 14,
      risk_level: 'LOW',
      factors: {
        gps_mismatch: 0.05,
        short_duration: 0.0,
        repeated_evidence: 0.18,
        metadata_inconsistency: 0.0,
      },
      confidence: 0.94,
      computed_at: '2023-10-26T10:32:00Z',
    },
  },

  // Default / generic inspection — medium risk
  default: {
    cv_validation: {
      evidence_id: 'EV-1042',
      flags: ['unguarded_machinery'],
      confidence: 0.79,
      detected_issues: ['Unguarded rotating machinery detected near operator zone'],
    },
    similarity_check: {
      similarity_id: 'SIM-7790',
      evidence_id: 'EV-1042',
      matched_evidence_id: null,
      similarity_score: 0.33,
      method: 'phash',
      flagged: false,
    },
    anomaly_scoring: {
      inspection_id: 'GENERIC',
      score: 45,
      risk_level: 'MEDIUM',
      factors: {
        gps_mismatch: 0.1,
        short_duration: 0.25,
        repeated_evidence: 0.33,
        metadata_inconsistency: 0.15,
      },
      confidence: 0.81,
      computed_at: new Date().toISOString(),
    },
  },
};

/** Retrieve mock ML results for an inspection, falling back to the generic default. */
export function getMockMLResult(inspectionId: string): InspectionMLResult {
  const result = MOCK_ML_RESULTS[inspectionId] ?? MOCK_ML_RESULTS['default'];
  // Patch in the real inspectionId so the UI is accurate
  return {
    ...result,
    anomaly_scoring: { ...result.anomaly_scoring, inspection_id: inspectionId },
  };
}
