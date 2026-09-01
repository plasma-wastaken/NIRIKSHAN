from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Dict, Any
from pydantic import BaseModel
from ml_bridge import run_cv_validation, run_similarity_check, run_anomaly_scoring
from dependencies import get_current_user

router = APIRouter()

# Repository will be set by main.py
repository = None

def set_repository(repo):
    global repository
    repository = repo

# ============================================================================
# Pydantic Models for ML Operations
# ============================================================================

class CVValidationRequest(BaseModel):
    evidence_id: str
    file_path: str

class SimilarityCheckRequest(BaseModel):
    evidence_id: str
    file_path: str

class AnomalyScoringRequest(BaseModel):
    inspection_id: str
    evidence_data: List[Dict[str, Any]]

class EvidenceData(BaseModel):
    evidence_id: str
    file_path: str
    latitude: float
    longitude: float
    captured_at: str

# ============================================================================
# ML Endpoints
# ============================================================================

@router.post("/cv-validation")
async def run_computer_vision_validation(
    request: CVValidationRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Run computer vision validation on evidence.
    
    Only Inspectors and Supervisors can access this endpoint.
    """
    user_role = current_user.get("role")
    if user_role not in ["INSPECTOR", "SUPERVISOR", "ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    try:
        result = run_cv_validation(request.evidence_id, request.file_path)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"CV validation failed: {str(e)}"
        )

@router.post("/similarity-check")
async def run_evidence_similarity_check(
    request: SimilarityCheckRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Run similarity check on evidence against historical database.
    
    Only Inspectors and Supervisors can access this endpoint.
    """
    user_role = current_user.get("role")
    if user_role not in ["INSPECTOR", "SUPERVISOR", "ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    try:
        result = run_similarity_check(request.evidence_id, request.file_path)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Similarity check failed: {str(e)}"
        )

@router.post("/anomaly-scoring")
async def run_inspection_anomaly_scoring(
    request: AnomalyScoringRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Run anomaly scoring on inspection evidence.
    
    Only Inspectors and Supervisors can access this endpoint.
    """
    user_role = current_user.get("role")
    if user_role not in ["INSPECTOR", "SUPERVISOR", "ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    try:
        result = run_anomaly_scoring(request.inspection_id, request.evidence_data)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Anomaly scoring failed: {str(e)}"
        )

@router.get("/models/status")
async def get_ml_models_status(current_user: dict = Depends(get_current_user)):
    """
    Get the status of ML models.
    
    Admins and Supervisors can access this endpoint.
    """
    user_role = current_user.get("role")
    if user_role not in ["ADMIN", "SUPERVISOR"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    try:
        from ml_integration import get_ml_integration
        ml = get_ml_integration()
        
        # Load models if not already loaded
        if not ml.models_loaded:
            ml.load_models()
        
        return {
            "models_loaded": ml.models_loaded,
            "ml_model_available": ml.ml_model is not None,
            "isolation_forest_available": ml.isolation_forest is not None,
            "scaler_available": ml.scaler is not None,
            "features_available": ml.features is not None
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get ML models status: {str(e)}"
        )

@router.post("/models/reload")
async def reload_ml_models(current_user: dict = Depends(get_current_user)):
    """
    Reload ML models from disk.
    
    Only Admins can access this endpoint.
    """
    user_role = current_user.get("role")
    if user_role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    try:
        from ml_integration import get_ml_integration
        ml = get_ml_integration()
        ml.load_models()
        
        return {
            "message": "ML models reloaded successfully",
            "models_loaded": ml.models_loaded
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reload ML models: {str(e)}"
        )
