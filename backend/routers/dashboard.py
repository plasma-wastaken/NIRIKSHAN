from fastapi import APIRouter, Depends
from schemas import DashboardStats, RoleDashboardStats
from services.repository import Repository
from dependencies import get_current_user

router = APIRouter()

# Repository will be set by main.py
repository = None

def set_repository(repo):
    global repository
    repository = repo

@router.get("", response_model=RoleDashboardStats)
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """
    Get dashboard statistics for the current user.
    
    Returns role-specific aggregated data from the repository.
    """
    # Get base statistics
    base_stats = repository.get_dashboard_stats()
    
    # Add role-specific statistics
    user_role = current_user.get("role")
    user_id = current_user.get("user_id")
    
    role_specific = {}
    
    if user_role == "INSPECTOR":
        # Inspector-specific stats
        my_inspections = repository.get_inspections(inspector_id=user_id)
        role_specific = {
            "my_inspections": len(my_inspections),
            "my_pending_inspections": len([insp for insp in my_inspections if insp.get("status") in ["ASSIGNED", "IN_PROGRESS"]]),
            "my_completed_inspections": len([insp for insp in my_inspections if insp.get("status") == "COMPLETED"])
        }
    elif user_role == "SUPERVISOR":
        # Supervisor-specific stats
        my_tickets = repository.get_tickets(owner_id=user_id)
        role_specific = {
            "my_assigned_tickets": len(my_tickets),
            "my_open_tickets": len([ticket for ticket in my_tickets if ticket.get("status") == "OPEN"]),
            "my_resolved_tickets": len([ticket for ticket in my_tickets if ticket.get("status") == "RESOLVED"])
        }
    elif user_role == "CITIZEN":
        # Citizen-specific stats
        my_complaints = repository.get_complaints(citizen_id=user_id)
        role_specific = {
            "my_complaints": len(my_complaints),
            "my_pending_complaints": len([comp for comp in my_complaints if comp.get("status") in ["SUBMITTED", "UNDER_REVIEW"]]),
            "my_resolved_complaints": len([comp for comp in my_complaints if comp.get("status") == "RESOLVED"])
        }
    elif user_role in ["DEPT_ADMIN", "GOVT_ADMIN"]:
        # Admin-specific stats
        role_specific = {
            "total_users": len(repository.users),
            "active_users": len([user for user in repository.users.values() if user.get("account_status") == "ACTIVE"]),
            "total_evidence": len(repository.evidence),
            "total_audit_events": len(repository.audit_events)
        }
    
    return RoleDashboardStats(
        **base_stats,
        role_specific=role_specific
    )