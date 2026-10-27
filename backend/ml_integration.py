"""
ML Integration Module for NIRIKSHAN

This module loads and uses the trained ML models from the nirikshan ml folder.
It provides interfaces for:
- Anomaly detection using Isolation Forest
- Risk scoring using the main ML model
- Feature scaling and engineering
- Similarity detection
"""

import os
import pickle
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional
from datetime import datetime
from pathlib import Path

# ML Model paths — defaults to backend/ml_models/ so the files are included in the
# Vercel service bundle. Override with the ML_MODELS_PATH environment variable if needed.
ML_MODELS_PATH = Path(os.environ.get("ML_MODELS_PATH", "")) or Path(__file__).parent / "ml_models"

class MLIntegration:
    """Main ML integration class that loads and uses trained models."""
    
    def __init__(self):
        self.ml_model = None
        self.isolation_forest = None
        self.scaler = None
        self.features = None
        self.models_loaded = False
        
    def load_models(self):
        """Load all trained ML models from the nirikshan ml folder."""
        try:
            # Load main ML model
            model_path = ML_MODELS_PATH / "nirikshan_ml_model.pkl"
            if model_path.exists():
                with open(model_path, 'rb') as f:
                    self.ml_model = pickle.load(f)
            else:
                print(f"Warning: ML model not found at {model_path}")
            
            # Load Isolation Forest for anomaly detection
            iso_path = ML_MODELS_PATH / "nirikshan_isolation_forest.pkl"
            if iso_path.exists():
                with open(iso_path, 'rb') as f:
                    self.isolation_forest = pickle.load(f)
            else:
                print(f"Warning: Isolation Forest model not found at {iso_path}")
            
            # Load scaler
            scaler_path = ML_MODELS_PATH / "nirikshan_scaler.pkl"
            if scaler_path.exists():
                with open(scaler_path, 'rb') as f:
                    self.scaler = pickle.load(f)
            else:
                print(f"Warning: Scaler not found at {scaler_path}")
            
            # Load features
            features_path = ML_MODELS_PATH / "nirikshan_features.pkl"
            if features_path.exists():
                with open(features_path, 'rb') as f:
                    self.features = pickle.load(f)
            else:
                print(f"Warning: Features not found at {features_path}")
            
            self.models_loaded = True
            print("ML models loaded successfully")
            
        except Exception as e:
            print(f"Error loading ML models: {e}")
            self.models_loaded = False
    
    def run_anomaly_detection(self, features: np.ndarray) -> Dict[str, Any]:
        """
        Run anomaly detection using Isolation Forest.
        
        Args:
            features: Feature array for anomaly detection
            
        Returns:
            Dict with anomaly detection results
        """
        if not self.models_loaded:
            self.load_models()
        
        if self.isolation_forest is None:
            # Fallback to simple rule-based detection
            return self._rule_based_anomaly_detection(features)
        
        try:
            # Scale features if scaler is available
            if self.scaler is not None:
                features_scaled = self.scaler.transform(features.reshape(1, -1))
            else:
                features_scaled = features.reshape(1, -1)
            
            # Get anomaly score (lower = more anomalous)
            anomaly_score = self.isolation_forest.decision_function(features_scaled)[0]
            is_anomaly = self.isolation_forest.predict(features_scaled)[0] == -1
            
            return {
                "is_anomaly": is_anomaly,
                "anomaly_score": float(anomaly_score),
                "confidence": 0.85,
                "method": "isolation_forest"
            }
        except Exception as e:
            print(f"Error in anomaly detection: {e}")
            return self._rule_based_anomaly_detection(features)
    
    def run_risk_scoring(self, inspection_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run risk scoring using the main ML model.
        
        Args:
            inspection_data: Dictionary containing inspection features
            
        Returns:
            Dict with risk scoring results
        """
        if not self.models_loaded:
            self.load_models()
        
        if self.ml_model is None:
            # Fallback to rule-based scoring
            return self._rule_based_risk_scoring(inspection_data)
        
        try:
            # Extract features from inspection data
            features = self._extract_features(inspection_data)
            
            # Scale features if scaler is available
            if self.scaler is not None:
                features_scaled = self.scaler.transform(features.reshape(1, -1))
            else:
                features_scaled = features.reshape(1, -1)
            
            # Get risk score from model
            risk_score = self.ml_model.predict_proba(features_scaled)[0]
            risk_level = self._determine_risk_level(risk_score)
            
            return {
                "risk_score": float(risk_score),
                "risk_level": risk_level,
                "confidence": 0.85,
                "method": "ml_model",
                "factors": self._analyze_factors(inspection_data)
            }
        except Exception as e:
            print(f"Error in risk scoring: {e}")
            return self._rule_based_risk_scoring(inspection_data)
    
    def run_similarity_detection(self, evidence_features: np.ndarray, 
                                  historical_features: Optional[np.ndarray] = None) -> Dict[str, Any]:
        """
        Run similarity detection for evidence.
        
        Args:
            evidence_features: Features of current evidence
            historical_features: Features of historical evidence for comparison
            
        Returns:
            Dict with similarity detection results
        """
        try:
            if historical_features is None or len(historical_features) == 0:
                return {
                    "similarity_score": 0.0,
                    "similar_evidence": [],
                    "potential_duplicates": [],
                    "method": "no_historical_data"
                }
            
            # Calculate cosine similarity
            similarities = []
            for hist_features in historical_features:
                similarity = self._cosine_similarity(evidence_features, hist_features)
                similarities.append(similarity)
            
            max_similarity = max(similarities) if similarities else 0.0
            potential_duplicates = []
            
            # Flag high similarity items
            threshold = 0.85
            for i, sim in enumerate(similarities):
                if sim >= threshold:
                    potential_duplicates.append({
                        "index": i,
                        "similarity": float(sim)
                    })
            
            return {
                "similarity_score": float(max_similarity),
                "similar_evidence": similarities,
                "potential_duplicates": potential_duplicates,
                "method": "cosine_similarity"
            }
        except Exception as e:
            print(f"Error in similarity detection: {e}")
            return {
                "similarity_score": 0.0,
                "similar_evidence": [],
                "potential_duplicates": [],
                "method": "error"
            }
    
    def _extract_features(self, inspection_data: Dict[str, Any]) -> np.ndarray:
        """Extract features from inspection data for ML model."""
        # This is a simplified feature extraction
        # In production, this should match the exact feature engineering used during training
        features = []
        
        # Numerical features
        features.append(inspection_data.get("evidence_count", 0))
        features.append(inspection_data.get("location_accuracy", 1.0))
        features.append(inspection_data.get("time_validity", 1.0))
        features.append(inspection_data.get("site_risk_score", 0.5))
        
        # Categorical features (one-hot encoded)
        inspection_type = inspection_data.get("inspection_type", "routine")
        if inspection_type == "routine":
            features.extend([1, 0, 0])
        elif inspection_type == "complaint":
            features.extend([0, 1, 0])
        else:
            features.extend([0, 0, 1])
        
        return np.array(features)
    
    def _determine_risk_level(self, risk_score: float) -> str:
        """Determine risk level from risk score."""
        if risk_score >= 0.75:
            return "CRITICAL"
        elif risk_score >= 0.50:
            return "HIGH"
        elif risk_score >= 0.25:
            return "MEDIUM"
        else:
            return "LOW"
    
    def _analyze_factors(self, inspection_data: Dict[str, Any]) -> Dict[str, float]:
        """Analyze contributing factors to risk."""
        factors = {}
        
        # Evidence quantity factor
        evidence_count = inspection_data.get("evidence_count", 0)
        factors["evidence_quantity"] = min(evidence_count * 5, 30)
        
        # Location consistency factor
        factors["location_consistency"] = inspection_data.get("location_accuracy", 20.0)
        
        # Time validity factor
        factors["time_validity"] = inspection_data.get("time_validity", 15.0)
        
        # Site risk factor
        factors["site_risk"] = inspection_data.get("site_risk_score", 20.0)
        
        return factors
    
    def _rule_based_anomaly_detection(self, features: np.ndarray) -> Dict[str, Any]:
        """Fallback rule-based anomaly detection."""
        # Simple rule: check if any feature is outside normal range
        is_anomaly = False
        for feature in features:
            if abs(feature) > 3:  # More than 3 standard deviations
                is_anomaly = True
                break
        
        return {
            "is_anomaly": is_anomaly,
            "anomaly_score": -1.0 if is_anomaly else 1.0,
            "confidence": 0.70,
            "method": "rule_based"
        }
    
    def _rule_based_risk_scoring(self, inspection_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback rule-based risk scoring."""
        evidence_count = inspection_data.get("evidence_count", 0)
        base_score = min(evidence_count * 10, 100)
        
        risk_level = self._determine_risk_level(base_score / 100)
        
        return {
            "risk_score": float(base_score),
            "risk_level": risk_level,
            "confidence": 0.70,
            "method": "rule_based",
            "factors": self._analyze_factors(inspection_data)
        }
    
    def _cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Calculate cosine similarity between two vectors."""
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return dot_product / (norm1 * norm2)

# Global ML integration instance
ml_integration = MLIntegration()

def get_ml_integration() -> MLIntegration:
    """Get the global ML integration instance."""
    return ml_integration
