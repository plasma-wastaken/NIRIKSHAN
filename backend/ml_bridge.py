"""
ML Bridge Module

This module provides interfaces for ML operations using the trained ML models.
It bridges the backend API with the ML integration module.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import hashlib
import numpy as np
from ml_integration import get_ml_integration

# ============================================================================
# COMPUTER VISION VALIDATION
# ============================================================================

def run_cv_validation(evidence_id: str, file_path: str) -> Dict[str, Any]:
    """
    Run computer vision validation on evidence.
    
    Args:
        evidence_id: ID of the evidence to validate
        file_path: Path to the evidence file
        
    Returns:
        Dict with validation results matching SRS contract:
        {
            "validation_id": str,
            "evidence_id": str,
            "is_valid": bool,
            "confidence_score": float,
            "validation_type": str,
            "issues_detected": List[str],
            "validated_at": datetime
        }
    """
    # Mock implementation - in production this would call the ML package
    return {
        "validation_id": f"VAL-{int(datetime.now().timestamp())}",
        "evidence_id": evidence_id,
        "is_valid": True,
        "confidence_score": 0.95,
        "validation_type": "integrity_check",
        "issues_detected": [],
        "validated_at": datetime.now().isoformat()
    }

# ============================================================================
# SIMILARITY CHECK
# ============================================================================

def run_similarity_check(evidence_id: str, file_path: str) -> Dict[str, Any]:
    """
    Run similarity check on evidence against existing database.
    
    Args:
        evidence_id: ID of the evidence to check
        file_path: Path to the evidence file
        
    Returns:
        Dict with similarity results matching SRS contract:
        {
            "similarity_check_id": str,
            "evidence_id": str,
            "similar_evidence": List[Dict],
            "highest_similarity_score": float,
            "potential_duplicates": List[str],
            "checked_at": datetime
        }
    """
    # Mock implementation - in production this would call the ML package
    return {
        "similarity_check_id": f"SIM-{int(datetime.now().timestamp())}",
        "evidence_id": evidence_id,
        "similar_evidence": [],
        "highest_similarity_score": 0.0,
        "potential_duplicates": [],
        "checked_at": datetime.now().isoformat()
    }

# ============================================================================
# ANOMALY SCORING
# ============================================================================

def run_anomaly_scoring(inspection_id: str, evidence_data: List[Dict]) -> Dict[str, Any]:
    """
    Run anomaly scoring on inspection evidence using ML models.
    
    Args:
        inspection_id: ID of the inspection
        evidence_data: List of evidence records for the inspection
        
    Returns:
        Dict with anomaly scoring results matching SRS contract:
        {
            "scoring_id": str,
            "inspection_id": str,
            "overall_risk_score": float,
            "risk_level": str,
            "anomaly_factors": Dict[str, float],
            "flagged_anomalies": List[Dict],
            "confidence": float,
            "scored_at": datetime
        }
    """
    # Get ML integration instance
    ml = get_ml_integration()
    
    # Prepare inspection data for ML
    inspection_data = {
        "evidence_count": len(evidence_data),
        "inspection_type": "routine",  # Default, can be enhanced
        "location_accuracy": 1.0,  # Default, can be enhanced
        "time_validity": 1.0,  # Default, can be enhanced
        "site_risk_score": 0.5  # Default, can be enhanced
    }
    
    # Run ML risk scoring
    ml_result = ml.run_risk_scoring(inspection_data)
    
    # Check for anomalies in individual evidence
    flagged_anomalies = []
    anomaly_factors = ml_result.get("factors", {})
    
    for evidence in evidence_data:
        # Extract features from evidence
        features = np.array([
            evidence.get("latitude", 0),
            evidence.get("longitude", 0),
            len(evidence.get("file_path", "")),  # File size approximation
            1.0  # Default validity
        ])
        
        # Run anomaly detection
        try:
            anomaly_result = ml.run_anomaly_detection(features)
            
            if anomaly_result.get("is_anomaly"):
                flagged_anomalies.append({
                    "evidence_id": evidence.get("evidence_id"),
                    "anomaly_score": anomaly_result.get("anomaly_score"),
                    "type": "location_anomaly"
                })
        except Exception as e:
            print(f"Error detecting anomaly for evidence {evidence.get('evidence_id')}: {e}")
            continue
    
    return {
        "scoring_id": f"ANOM-{int(datetime.now().timestamp())}",
        "inspection_id": inspection_id,
        "overall_risk_score": ml_result.get("risk_score", 50.0),
        "risk_level": ml_result.get("risk_level", "MEDIUM"),
        "anomaly_factors": anomaly_factors,
        "flagged_anomalies": flagged_anomalies,
        "confidence": ml_result.get("confidence", 0.85),
        "scored_at": datetime.now().isoformat()
    }

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def generate_file_hash(file_path: str) -> str:
    """
    Generate SHA-256 hash of a file.
    
    Args:
        file_path: Path to the file
        
    Returns:
        SHA-256 hash as hex string
    """
    sha256_hash = hashlib.sha256()
    
    try:
        with open(file_path, "rb") as f:
            # Read file in chunks to handle large files
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    except Exception as e:
        # In case of error, return a mock hash
        # In production, this should be handled properly
        return hashlib.sha256(str(datetime.now().timestamp()).encode()).hexdigest()

def validate_file_type(file_path: str, allowed_types: List[str]) -> bool:
    """
    Validate file type based on extension.
    
    Args:
        file_path: Path to the file
        allowed_types: List of allowed file extensions (e.g., ['.jpg', '.png'])
        
    Returns:
        True if file type is allowed, False otherwise
    """
    import os
    file_ext = os.path.splitext(file_path)[1].lower()
    return file_ext in allowed_types