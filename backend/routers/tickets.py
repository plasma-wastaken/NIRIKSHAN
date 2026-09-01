from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from schemas import (
    TicketResponse, TicketCreate, TicketUpdate, 
    TicketStatus, TicketPriority
)
from services.repository import Repository
from dependencies import get_current_user, require_supervisor, require_admin

router = APIRouter()

# Repository will be set by main.py
repository = None

def set_repository(repo):
    global repository
    repository = repo

@router.get("", response_model=List[TicketResponse])
async def get_tickets(
    owner_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all tickets.
    
    Supervisors can see their assigned tickets.
    Admins can see all tickets.
    """
    # Role-based filtering
    user_role = current_user.get("role")
    
    if user_role == "SUPERVISOR":
        # Supervisors only see their assigned tickets
        owner_id = current_user.get("user_id")
    elif user_role in ["DEPT_ADMIN", "GOVT_ADMIN"]:
        # Admins can see all tickets
        pass
    else:
        # Citizens and inspectors have limited access
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    tickets = repository.get_tickets(owner_id)
    return tickets

@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(
    ticket_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific ticket by ID.
    """
    ticket = repository.get_ticket(ticket_id)
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Role-based access check
    user_role = current_user.get("role")
    user_id = current_user.get("user_id")
    
    if user_role == "SUPERVISOR" and ticket.get("owner_id") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your assigned tickets"
        )
    
    return ticket

@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    ticket: TicketCreate,
    current_user: dict = Depends(require_supervisor)
):
    """
    Create a new ticket.
    
    Only supervisors can create tickets.
    """
    ticket_data = ticket.dict()
    
    created_ticket = repository.create_ticket(ticket_data)
    return created_ticket

@router.patch("/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: str,
    update_data: TicketUpdate,
    current_user: dict = Depends(require_supervisor)
):
    """
    Update a ticket.
    
    Only the assigned supervisor or admins can update tickets.
    """
    ticket = repository.get_ticket(ticket_id)
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Check if user is the ticket owner or admin
    user_role = current_user.get("role")
    user_id = current_user.get("user_id")
    
    if user_role == "SUPERVISOR" and ticket.get("owner_id") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your assigned tickets"
        )
    
    update_data_dict = update_data.dict(exclude_unset=True)
    update_data_dict["actor_id"] = current_user.get("user_id")
    
    updated_ticket = repository.update_ticket(ticket_id, update_data_dict)
    return updated_ticket