from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from typing import List
import os
import shutil
from datetime import datetime
from schemas import EvidenceUploadResponse, EvidenceType
from services.repository import Repository
from dependencies import get_current_user, require_inspector
import ml_bridge

router = APIRouter()

# Repository will be set by main.py
repository = None

def set_repository(repo):
    global repository
    repository = repo

@router.post("/upload", response_model=EvidenceUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_evidence(
    inspection_id: str,
    file: UploadFile = File(...),
    evidence_type: str = "PHOTO",
    latitude: float = 0.0,
    longitude: float = 0.0,
    current_user: dict = Depends(require_inspector)
):
    """
    Upload evidence file for an inspection.
    
    Only inspectors can upload evidence for their assigned inspections.
    """
    # Validate inspection exists and belongs to the inspector
    inspection = repository.get_inspection(inspection_id)
    
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection not found"
        )
    
    if inspection.get("inspector_id") != current_user.get("user_id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only upload evidence for your assigned inspections"
        )
    
    # Validate evidence type
    try:
        validated_type = EvidenceType(evidence_type.upper())
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid evidence type. Must be one of: {[e.value for e in EvidenceType]}"
        )
    
    # Validate file type
    allowed_extensions = {
        EvidenceType.PHOTO: ['.jpg', '.jpeg', '.png', '.gif'],
        EvidenceType.VIDEO: ['.mp4', '.webm', '.mov'],
        EvidenceType.AUDIO: ['.mp3', '.wav', '.m4a'],
        EvidenceType.DOCUMENT: ['.pdf', '.doc', '.docx']
    }
    
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions.get(validated_type, []):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid file type for {evidence_type}. Allowed: {allowed_extensions.get(validated_type, [])}"
        )
    
    # Get upload directory from environment
    upload_dir = os.getenv("UPLOAD_DIR", "./uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    timestamp = int(datetime.now().timestamp())
    filename = f"evidence_{timestamp}_{file.filename}"
    file_path = os.path.join(upload_dir, filename)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    
    # Generate SHA-256 hash
    try:
        hash_sha256 = ml_bridge.generate_file_hash(file_path)
    except Exception as e:
        # If hash generation fails, use a fallback
        import hashlib
        hash_sha256 = hashlib.sha256(str(timestamp).encode()).hexdigest()
    
    # Create evidence record
    evidence_data = {
        "inspection_id": inspection_id,
        "file_path": file_path,
        "evidence_type": validated_type.value,
        "captured_at": datetime.now().isoformat(),
        "latitude": latitude,
        "longitude": longitude,
        "hash_sha256": hash_sha256,
        "actor_id": current_user.get("user_id")
    }
    
    created_evidence = repository.create_evidence(evidence_data)
    
    # Run ML validation (mock for now)
    try:
        validation_result = ml_bridge.run_cv_validation(
            created_evidence["evidence_id"],
            file_path
        )
    except Exception as e:
        # Log the error but don't fail the upload
        print(f"ML validation failed: {e}")
    
    return EvidenceUploadResponse(
        evidence_id=created_evidence["evidence_id"],
        inspection_id=created_evidence["inspection_id"],
        file_path=created_evidence["file_path"],
        evidence_type=EvidenceType(created_evidence["evidence_type"]),
        captured_at=created_evidence["captured_at"],
        latitude=created_evidence["latitude"],
        longitude=created_evidence["longitude"],
        hash_sha256=created_evidence["hash_sha256"]
    )

@router.get("", response_model=List[dict])
async def get_evidence(
    inspection_id: str = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Get evidence records.
    
    Inspectors can see evidence for their inspections.
    Supervisors and admins can see all evidence.
    """
    # Role-based filtering
    user_role = current_user.get("role")
    
    if user_role == "INSPECTOR" and inspection_id:
        # Verify inspector owns the inspection
        inspection = repository.get_inspection(inspection_id)
        if not inspection or inspection.get("inspector_id") != current_user.get("user_id"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only access evidence for your inspections"
            )
    elif user_role == "CITIZEN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Citizens cannot access evidence directly"
        )
    
    evidence = repository.get_evidence(inspection_id)
    return evidence