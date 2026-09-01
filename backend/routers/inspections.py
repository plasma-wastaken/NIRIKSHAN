from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from schemas import (
    InspectionResponse, InspectionCreate, InspectionUpdate, 
    InspectionSubmit, InspectionStatus
)
from services.repository import Repository
from dependencies import get_current_user, require_inspector, require_supervisor

router = APIRouter()

# Repository will be set by main.py
repository = None

def set_repository(repo):
    global repository
    repository = repo

@router.get("", response_model=List[InspectionResponse])
async def get_inspections(
    inspector_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all inspections.
    
    Inspectors can see their own inspections.
    Supervisors and admins can see all inspections.
    """
    # Role-based filtering
    user_role = current_user.get("role")
    
    if user_role == "INSPECTOR":
        # Inspectors only see their own inspections
        inspector_id = current_user.get("user_id")
    elif user_role in ["SUPERVISOR", "DEPT_ADMIN", "GOVT_ADMIN"]:
        # Supervisors and admins can see all inspections
        pass
    else:
        # Citizens shouldn't access inspections
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    inspections = repository.get_inspections(inspector_id)
    return inspections

@router.get("/{inspection_id}", response_model=InspectionResponse)
async def get_inspection(
    inspection_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific inspection by ID.
    """
    inspection = repository.get_inspection(inspection_id)
    
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection not found"
        )
    
    # Role-based access check
    user_role = current_user.get("role")
    user_id = current_user.get("user_id")
    
    if user_role == "INSPECTOR" and inspection.get("inspector_id") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own inspections"
        )
    
    return inspection

@router.post("", response_model=InspectionResponse, status_code=status.HTTP_201_CREATED)
async def create_inspection(
    inspection: InspectionCreate,
    current_user: dict = Depends(require_inspector)
):
    """
    Create a new inspection.
    
    Only inspectors can create inspections.
    """
    # Ensure the inspector is creating for themselves
    if inspection.inspector_id != current_user.get("user_id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create inspections for yourself"
        )
    
    inspection_data = inspection.dict()
    inspection_data["actor_id"] = current_user.get("user_id")
    
    created_inspection = repository.create_inspection(inspection_data)
    return created_inspection

@router.post("/{inspection_id}/submit", response_model=InspectionResponse)
async def submit_inspection(
    inspection_id: str,
    submit_data: InspectionSubmit,
    current_user: dict = Depends(require_inspector)
):
    """
    Submit an inspection for review.
    
    Only the assigned inspector can submit their inspection.
    """
    inspection = repository.get_inspection(inspection_id)
    
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection not found"
        )
    
    # Verify the inspector owns this inspection
    if inspection.get("inspector_id") != current_user.get("user_id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only submit your own inspections"
        )
    
    submit_data_dict = submit_data.dict(exclude_unset=True)
    submit_data_dict["actor_id"] = current_user.get("user_id")
    
    updated_inspection = repository.submit_inspection(inspection_id, submit_data_dict)
    return updated_inspection

@router.patch("/{inspection_id}", response_model=InspectionResponse)
async def update_inspection(
    inspection_id: str,
    update_data: InspectionUpdate,
    current_user: dict = Depends(require_supervisor)
):
    """
    Update an inspection.
    
    Only supervisors can update inspections (e.g., approve, return, etc.).
    """
    inspection = repository.get_inspection(inspection_id)
    
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection not found"
        )
    
    update_data_dict = update_data.dict(exclude_unset=True)
    update_data_dict["actor_id"] = current_user.get("user_id")
    
    updated_inspection = repository.update_inspection(inspection_id, update_data_dict)
    return updated_inspection