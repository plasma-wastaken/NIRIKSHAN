from typing import Dict, List, Optional, Any
from datetime import datetime
from data.mock_data import (
    MOCK_USERS, MOCK_INSPECTIONS, MOCK_COMPLAINTS, 
    MOCK_TICKETS, MOCK_EVIDENCE, MOCK_RISK_SCORES, MOCK_AUDIT_EVENTS, generate_id
)
from schemas import (
    UserRole, InspectionStatus, ComplaintStatus, TicketStatus, 
    TicketPriority, RiskLevel, EvidenceType
)

class Repository:
    """
    In-memory repository for NIRIKSHAN data.
    This is a temporary implementation that will be replaced with database operations.
    """
    
    def __init__(self):
        self.users: Dict[str, Dict] = {}
        self.inspections: Dict[str, Dict] = {}
        self.complaints: Dict[str, Dict] = {}
        self.tickets: Dict[str, Dict] = {}
        self.evidence: Dict[str, Dict] = {}
        self.risk_scores: Dict[str, Dict] = {}
        self.audit_events: List[Dict] = []
        
    def initialize_mock_data(self):
        """Initialize the repository with mock data."""
        self.users = {user["user_id"]: user.copy() for user in MOCK_USERS.values()}
        self.inspections = {insp["inspection_id"]: insp.copy() for insp in MOCK_INSPECTIONS}
        self.complaints = {comp["complaint_id"]: comp.copy() for comp in MOCK_COMPLAINTS}
        self.tickets = {ticket["ticket_id"]: ticket.copy() for ticket in MOCK_TICKETS}
        self.evidence = {ev["evidence_id"]: ev.copy() for ev in MOCK_EVIDENCE}
        self.risk_scores = {rs["risk_score_id"]: rs.copy() for rs in MOCK_RISK_SCORES}
        self.audit_events = [event.copy() for event in MOCK_AUDIT_EVENTS]
        
        # Store repository instance for module-level access
        import services.repository as repo_module
        repo_module._repository_instance = self
    
    # ============================================================================
    # USER OPERATIONS
    # ============================================================================
    
    def get_user(self, user_id: str) -> Optional[Dict]:
        """Get user by ID."""
        return self.users.get(user_id)
    
    def get_user_by_username(self, username: str) -> Optional[Dict]:
        """Get user by username."""
        for user in self.users.values():
            if user.get("username") == username:
                return user.copy()
        return None
    
    def get_users_by_role(self, role: UserRole) -> List[Dict]:
        """Get all users with a specific role."""
        return [user.copy() for user in self.users.values() if user.get("role") == role.value]
    
    # ============================================================================
    # INSPECTION OPERATIONS
    # ============================================================================
    
    def get_inspections(self, inspector_id: Optional[str] = None) -> List[Dict]:
        """Get all inspections, optionally filtered by inspector."""
        inspections = list(self.inspections.values())
        if inspector_id:
            inspections = [insp for insp in inspections if insp.get("inspector_id") == inspector_id]
        return [insp.copy() for insp in inspections]
    
    def get_inspection(self, inspection_id: str) -> Optional[Dict]:
        """Get inspection by ID."""
        return self.inspections.get(inspection_id)
    
    def create_inspection(self, inspection_data: Dict) -> Dict:
        """Create a new inspection."""
        inspection_id = generate_id("INS")
        inspection_data["inspection_id"] = inspection_id
        inspection_data["created_at"] = datetime.now().isoformat()
        inspection_data["status"] = inspection_data.get("status", "ASSIGNED")
        
        self.inspections[inspection_id] = inspection_data.copy()
        return self.inspections[inspection_id].copy()
    
    def update_inspection(self, inspection_id: str, update_data: Dict) -> Optional[Dict]:
        """Update an existing inspection."""
        if inspection_id not in self.inspections:
            return None
        
        before_state = self.inspections[inspection_id].copy()
        
        # Update fields
        for key, value in update_data.items():
            if value is not None:
                self.inspections[inspection_id][key] = value
        
        after_state = self.inspections[inspection_id].copy()
        
        # Create audit event
        self._create_audit_event(
            entity="inspection",
            entity_id=inspection_id,
            action="updated",
            actor_id=update_data.get("actor_id", "system"),
            before_state=before_state,
            after_state=after_state
        )
        
        return self.inspections[inspection_id].copy()
    
    def submit_inspection(self, inspection_id: str, submit_data: Dict) -> Optional[Dict]:
        """Submit an inspection for review."""
        if inspection_id not in self.inspections:
            return None
        
        before_state = self.inspections[inspection_id].copy()
        
        self.inspections[inspection_id]["status"] = "SUBMITTED"
        self.inspections[inspection_id]["submitted_at"] = datetime.now().isoformat()
        
        if "inspector_notes" in submit_data:
            self.inspections[inspection_id]["inspector_notes"] = submit_data["inspector_notes"]
        
        after_state = self.inspections[inspection_id].copy()
        
        # Create audit event
        self._create_audit_event(
            entity="inspection",
            entity_id=inspection_id,
            action="submitted",
            actor_id=submit_data.get("actor_id", "system"),
            before_state=before_state,
            after_state=after_state
        )
        
        return self.inspections[inspection_id].copy()
    
    # ============================================================================
    # COMPLAINT OPERATIONS
    # ============================================================================
    
    def get_complaints(self, citizen_id: Optional[str] = None) -> List[Dict]:
        """Get all complaints, optionally filtered by citizen."""
        complaints = list(self.complaints.values())
        if citizen_id:
            complaints = [comp for comp in complaints if comp.get("citizen_id") == citizen_id]
        return [comp.copy() for comp in complaints]
    
    def get_complaint(self, complaint_id: str) -> Optional[Dict]:
        """Get complaint by ID."""
        complaint = self.complaints.get(complaint_id)
        if complaint:
            # Include evidence files
            complaint_copy = complaint.copy()
            complaint_copy["evidence_files"] = [
                ev.copy() for ev in self.evidence.values() 
                if ev.get("inspection_id") == complaint.get("inspection_id")
            ]
            return complaint_copy
        return None
    
    def create_complaint(self, complaint_data: Dict) -> Dict:
        """Create a new complaint."""
        complaint_id = generate_id("CMP")
        complaint_data["complaint_id"] = complaint_id
        complaint_data["created_at"] = datetime.now().isoformat()
        complaint_data["status"] = complaint_data.get("status", "SUBMITTED")
        complaint_data["ticket_id"] = None
        complaint_data["inspection_id"] = None
        complaint_data["evidence_files"] = []
        
        self.complaints[complaint_id] = complaint_data.copy()
        
        # Create audit event
        self._create_audit_event(
            entity="complaint",
            entity_id=complaint_id,
            action="created",
            actor_id=complaint_data.get("citizen_id", "system"),
            before_state=None,
            after_state={"status": "SUBMITTED", "category": complaint_data.get("category")}
        )
        
        return self.complaints[complaint_id].copy()
    
    def update_complaint(self, complaint_id: str, update_data: Dict) -> Optional[Dict]:
        """Update an existing complaint."""
        if complaint_id not in self.complaints:
            return None
        
        before_state = self.complaints[complaint_id].copy()
        
        for key, value in update_data.items():
            if value is not None:
                self.complaints[complaint_id][key] = value
        
        after_state = self.complaints[complaint_id].copy()
        
        # Create audit event
        self._create_audit_event(
            entity="complaint",
            entity_id=complaint_id,
            action="updated",
            actor_id=update_data.get("actor_id", "system"),
            before_state=before_state,
            after_state=after_state
        )
        
        return self.complaints[complaint_id].copy()
    
    def link_complaint_to_ticket(self, complaint_id: str, ticket_id: str) -> bool:
        """Link a complaint to a ticket."""
        if complaint_id not in self.complaints:
            return False
        
        self.complaints[complaint_id]["ticket_id"] = ticket_id
        return True
    
    def link_complaint_to_inspection(self, complaint_id: str, inspection_id: str) -> bool:
        """Link a complaint to an inspection."""
        if complaint_id not in self.complaints:
            return False
        
        self.complaints[complaint_id]["inspection_id"] = inspection_id
        return True
    
    # ============================================================================
    # TICKET OPERATIONS
    # ============================================================================
    
    def get_tickets(self, owner_id: Optional[str] = None) -> List[Dict]:
        """Get all tickets, optionally filtered by owner."""
        tickets = list(self.tickets.values())
        if owner_id:
            tickets = [ticket for ticket in tickets if ticket.get("owner_id") == owner_id]
        return [ticket.copy() for ticket in tickets]
    
    def get_ticket(self, ticket_id: str) -> Optional[Dict]:
        """Get ticket by ID."""
        return self.tickets.get(ticket_id)
    
    def create_ticket(self, ticket_data: Dict) -> Dict:
        """Create a new ticket."""
        ticket_id = generate_id("TKT")
        ticket_data["ticket_id"] = ticket_id
        ticket_data["created_at"] = datetime.now().isoformat()
        ticket_data["status"] = ticket_data.get("status", "OPEN")
        ticket_data["updated_at"] = None
        
        self.tickets[ticket_id] = ticket_data.copy()
        
        # Create audit event
        self._create_audit_event(
            entity="ticket",
            entity_id=ticket_id,
            action="created",
            actor_id=ticket_data.get("owner_id", "system"),
            before_state=None,
            after_state={"status": "OPEN", "priority": ticket_data.get("priority")}
        )
        
        return self.tickets[ticket_id].copy()
    
    def update_ticket(self, ticket_id: str, update_data: Dict) -> Optional[Dict]:
        """Update an existing ticket."""
        if ticket_id not in self.tickets:
            return None
        
        before_state = self.tickets[ticket_id].copy()
        
        for key, value in update_data.items():
            if value is not None:
                self.tickets[ticket_id][key] = value
        
        self.tickets[ticket_id]["updated_at"] = datetime.now().isoformat()
        after_state = self.tickets[ticket_id].copy()
        
        # Create audit event
        self._create_audit_event(
            entity="ticket",
            entity_id=ticket_id,
            action="updated",
            actor_id=update_data.get("actor_id", "system"),
            before_state=before_state,
            after_state=after_state
        )
        
        return self.tickets[ticket_id].copy()
    
    # ============================================================================
    # EVIDENCE OPERATIONS
    # ============================================================================
    
    def get_evidence(self, inspection_id: Optional[str] = None) -> List[Dict]:
        """Get all evidence, optionally filtered by inspection."""
        evidence = list(self.evidence.values())
        if inspection_id:
            evidence = [ev for ev in evidence if ev.get("inspection_id") == inspection_id]
        return [ev.copy() for ev in evidence]
    
    def get_evidence_by_id(self, evidence_id: str) -> Optional[Dict]:
        """Get evidence by ID."""
        return self.evidence.get(evidence_id)
    
    def create_evidence(self, evidence_data: Dict) -> Dict:
        """Create a new evidence record."""
        evidence_id = generate_id("EV")
        evidence_data["evidence_id"] = evidence_id
        evidence_data["created_at"] = datetime.now().isoformat()
        
        self.evidence[evidence_id] = evidence_data.copy()
        
        # Create audit event
        self._create_audit_event(
            entity="evidence",
            entity_id=evidence_id,
            action="uploaded",
            actor_id=evidence_data.get("actor_id", "system"),
            before_state=None,
            after_state={"evidence_type": evidence_data.get("evidence_type")}
        )
        
        return self.evidence[evidence_id].copy()
    
    # ============================================================================
    # RISK SCORE OPERATIONS
    # ============================================================================
    
    def get_risk_scores(self, inspection_id: Optional[str] = None) -> List[Dict]:
        """Get all risk scores, optionally filtered by inspection."""
        risk_scores = list(self.risk_scores.values())
        if inspection_id:
            risk_scores = [rs for rs in risk_scores if rs.get("inspection_id") == inspection_id]
        return [rs.copy() for rs in risk_scores]
    
    def get_risk_score(self, risk_score_id: str) -> Optional[Dict]:
        """Get risk score by ID."""
        return self.risk_scores.get(risk_score_id)
    
    def create_risk_score(self, risk_score_data: Dict) -> Dict:
        """Create a new risk score."""
        risk_score_id = generate_id("RS")
        risk_score_data["risk_score_id"] = risk_score_id
        risk_score_data["computed_at"] = datetime.now().isoformat()
        
        self.risk_scores[risk_score_id] = risk_score_data.copy()
        return self.risk_scores[risk_score_id].copy()
    
    # ============================================================================
    # AUDIT EVENT OPERATIONS
    # ============================================================================
    
    def get_audit_events(self, entity: Optional[str] = None, entity_id: Optional[str] = None) -> List[Dict]:
        """Get audit events, optionally filtered by entity."""
        events = self.audit_events
        if entity:
            events = [event for event in events if event.get("entity") == entity]
        if entity_id:
            events = [event for event in events if event.get("entity_id") == entity_id]
        return [event.copy() for event in events]
    
    def _create_audit_event(self, entity: str, entity_id: str, action: str, 
                           actor_id: str, before_state: Optional[Dict] = None, 
                           after_state: Optional[Dict] = None) -> None:
        """Create an audit event (internal method)."""
        audit_id = generate_id("AUD")
        audit_event = {
            "audit_id": audit_id,
            "entity": entity,
            "entity_id": entity_id,
            "action": action,
            "actor_id": actor_id,
            "timestamp": datetime.now().isoformat(),
            "before_state": before_state,
            "after_state": after_state
        }
        self.audit_events.append(audit_event)
    
    # ============================================================================
    # DASHBOARD STATS
    # ============================================================================
    
    def get_dashboard_stats(self) -> Dict[str, Any]:
        """Get aggregated dashboard statistics."""
        return {
            "total_inspections": len(self.inspections),
            "total_complaints": len(self.complaints),
            "total_tickets": len(self.tickets),
            "pending_inspections": len([insp for insp in self.inspections.values() if insp.get("status") in ["ASSIGNED", "IN_PROGRESS"]]),
            "high_risk_inspections": len([insp for insp in self.inspections.values() if insp.get("risk_level") in ["HIGH", "CRITICAL"]]),
            "open_tickets": len([ticket for ticket in self.tickets.values() if ticket.get("status") == "OPEN"])
        }