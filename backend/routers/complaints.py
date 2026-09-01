from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from schemas import (
    ComplaintResponse, ComplaintCreate, ComplaintUpdate, 
    ComplaintStatus
)
from services.repository import Repository
from dependencies import get_current_user, require_citizen, require_admin

router = APIRouter()

# Repository will be set by main.py
repository = None

def set_repository(repo):
    global repository
    repository = repo

@router.get("", response_model=List[ComplaintResponse])
async def get_complaints(
    citizen_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all complaints.
    
    Citizens can see their own complaints.
    Admins can see all complaints.
    """
    # Role-based filtering
    user_role = current_user.get("role")
    
    if user_role == "CITIZEN":
        # Citizens only see their own complaints
        citizen_id = current_user.get("user_id")
    elif user_role in ["SUPERVISOR", "DEPT_ADMIN", "GOVT_ADMIN"]:
        # Supervisors and admins can see all complaints
        pass
    else:
        # Inspectors can see complaints but may be limited
        pass
    
    complaints = repository.get_complaints(citizen_id)
    return complaints

@router.get("/{complaint_id}", response_model=ComplaintResponse)
async def get_complaint(
    complaint_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific complaint by ID.
    """
    complaint = repository.get_complaint(complaint_id)
    
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )
    
    # Role-based access check
    user_role = current_user.get("role")
    user_id = current_user.get("user_id")
    
    if user_role == "CITIZEN" and complaint.get("citizen_id") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own complaints"
        )
    
    return complaint

@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    complaint: ComplaintCreate,
    current_user: dict = Depends(require_citizen)
):
    """
    Create a new complaint.
    
    Only citizens can create complaints.
    """
    # Ensure the citizen is creating for themselves
    if complaint.citizen_id != current_user.get("user_id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create complaints for yourself"
        )
    
    complaint_data = complaint.dict()
    
    created_complaint = repository.create_complaint(complaint_data)
    return created_complaint

@router.patch("/{complaint_id}", response_model=ComplaintResponse)
async def update_complaint(
    complaint_id: str,
    update_data: ComplaintUpdate,
    current_user: dict = Depends(require_admin)
):
    """
    Update a complaint.
    
    Only admins can update complaints (e.g., change status, assign to inspection).
    """
    complaint = repository.get_complaint(complaint_id)
    
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )
    
    update_data_dict = update_data.dict(exclude_unset=True)
    update_data_dict["actor_id"] = current_user.get("user_id")
    
    updated_complaint = repository.update_complaint(complaint_id, update_data_dict)
    return updated_complaint