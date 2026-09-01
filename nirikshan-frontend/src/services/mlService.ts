import { api } from './api';

export interface MLAnalysisRequest {
  inspection_id: string;
  evidence_data: Array<{
    evidence_id: string;
    file_path: string;
    latitude: number;
    longitude: number;
    captured_at: string;
  }>;
}

export interface MLAnalysisResponse {
  scoring_id: string;
  inspection_id: string;
  overall_risk_score: number;
  risk_level: string;
  anomaly_factors: Record<string, number>;
  flagged_anomalies: Array<{
    evidence_id: string;
    anomaly_score: number;
    type: string;
  }>;
  confidence: number;
  scored_at: string;
}

export interface CVValidationRequest {
  evidence_id: string;
  file_path: string;
}

export interface CVValidationResponse {
  validation_id: string;
  evidence_id: string;
  is_valid: boolean;
  confidence_score: number;
  validation_type: string;
  issues_detected: string[];
  validated_at: string;
}

export interface SimilarityCheckRequest {
  evidence_id: string;
  file_path: string;
}

export interface SimilarityCheckResponse {
  similarity_check_id: string;
  evidence_id: string;
  similar_evidence: number[];
  highest_similarity_score: number;
  potential_duplicates: Array<{
    index: number;
    similarity: number;
  }>;
  checked_at: string;
}

export const mlService = {
  // Run complete ML analysis for an inspection
  async runAnalysis(inspectionId: string, evidenceData: MLAnalysisRequest['evidence_data']): Promise<MLAnalysisResponse> {
    const response = await api.post('/ml/anomaly-scoring', {
      inspection_id: inspectionId,
      evidence_data: evidenceData
    });
    return response.data;
  },

  // Run CV validation on a single evidence
  async runCVValidation(request: CVValidationRequest): Promise<CVValidationResponse> {
    const response = await api.post('/ml/cv-validation', request);
    return response.data;
  },

  // Run similarity check on evidence
  async runSimilarityCheck(request: SimilarityCheckRequest): Promise<SimilarityCheckResponse> {
    const response = await api.post('/ml/similarity-check', request);
    return response.data;
  },

  // Get ML models status
  async getModelsStatus(): Promise<{
    models_loaded: boolean;
    ml_model_available: boolean;
    isolation_forest_available: boolean;
    scaler_available: boolean;
    features_available: boolean;
  }> {
    const response = await api.get('/ml/models/status');
    return response.data;
  },

  // Reload ML models (admin only)
  async reloadModels(): Promise<{ message: string; models_loaded: boolean }> {
    const response = await api.post('/ml/models/reload');
    return response.data;
  }
};
