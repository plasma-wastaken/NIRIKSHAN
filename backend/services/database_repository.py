from typing import Dict, List, Optional, Any
from datetime import datetime
from sqlalchemy.orm import Session
from database.models import (
    User, Site, Inspection, Evidence, EvidenceSimilarityResult, 
    RiskScore, Complaint, Ticket, AuditEvent, 
    UserRole, InspectionStatus, ComplaintStatus, TicketStatus, 
    RiskLevel, EvidenceType
)
from database.database import SessionLocal
from schemas import (
    UserRole as SchemaUserRole, InspectionStatus as SchemaInspectionStatus, 
    ComplaintStatus as SchemaComplaintStatus, TicketStatus as SchemaTicketStatus, 
    TicketPriority, RiskLevel as SchemaRiskLevel, EvidenceType as SchemaEvidenceType
)

class DatabaseRepository:
    """
    Database repository for NIRIKSHAN data.
    This replaces the in-memory repository with actual database operations.
    """
    
    def __init__(self):
        self.db: Optional[Session] = None
    
    def get_db(self) -> Session:
        """Get database session."""
        if self.db is None:
            self.db = SessionLocal()
        return self.db
    
    def close_db(self):
        """Close database session."""
        if self.db is not None:
            self.db.close()
            self.db = None
    
    def initialize_mock_data(self):
        """
        Initialize the database with seed data.
        This will be replaced by running the actual seed script.
        """
        try:
            from database.seed import seed_database
            seed_database()
            print("Database seeded successfully")
        except Exception as e:
            print(f"Database seeding failed: {e}")
    
    # ============================================================================
    # USER OPERATIONS
    # ============================================================================
    
    def get_user(self, user_id: int) -> Optional[Dict]:
        """Get user by ID."""
        db = self.get_db()
        user = db.query(User).filter(User.user_id == user_id).first()
        if user:
            return self._user_to_dict(user)
        return None
    
    def get_user_by_email(self, email: str) -> Optional[Dict]:
        """Get user by email."""
        db = self.get_db()
        user = db.query(User).filter(User.email == email).first()
        if user:
            return self._user_to_dict(user)
        return None
    
    def get_users_by_role(self, role: SchemaUserRole) -> List[Dict]:
        """Get all users with a specific role."""
        db = self.get_db()
        # Convert schema enum to model enum
        role_map = {
            SchemaUserRole.CITIZEN: UserRole.CITIZEN,
            SchemaUserRole.INSPECTOR: UserRole.INSPECTOR,
            SchemaUserRole.SUPERVISOR: UserRole.SUPERVISOR,
            SchemaUserRole.ADMIN: UserRole.ADMIN
        }
        model_role = role_map.get(role)
        users = db.query(User).filter(User.role == model_role).all()
        return [self._user_to_dict(user) for user in users]
    
    def _user_to_dict(self, user: User) -> Dict:
        """Convert User model to dictionary."""
        return {
            "user_id": user.user_id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role.value,
            "department_id": user.department_id,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "updated_at": user.updated_at.isoformat() if user.updated_at else None
        }
    
    # ============================================================================
    # INSPECTION OPERATIONS
    # ============================================================================
    
    def get_inspections(self, inspector_id: Optional[int] = None) -> List[Dict]:
        """Get all inspections, optionally filtered by inspector."""
        db = self.get_db()
        query = db.query(Inspection)
        if inspector_id:
            query = query.filter(Inspection.inspector_id == inspector_id)
        inspections = query.all()
        return [self._inspection_to_dict(insp) for insp in inspections]
    
    def get_inspection(self, inspection_id: int) -> Optional[Dict]:
        """Get inspection by ID."""
        db = self.get_db()
        inspection = db.query(Inspection).filter(Inspection.inspection_id == inspection_id).first()
        if inspection:
            return self._inspection_to_dict(inspection)
        return None
    
    def create_inspection(self, inspection_data: Dict) -> Dict:
        """Create a new inspection."""
        db = self.get_db()
        
        inspection = Inspection(
            site_id=inspection_data["site_id"],
            inspector_id=inspection_data["inspector_id"],
            status=InspectionStatus.IN_PROGRESS,
            latitude=inspection_data["latitude"],
            longitude=inspection_data["longitude"]
        )
        
        db.add(inspection)
        db.commit()
        db.refresh(inspection)
        
        return self._inspection_to_dict(inspection)
    
    def update_inspection(self, inspection_id: int, update_data: Dict) -> Optional[Dict]:
        """Update an existing inspection."""
        db = self.get_db()
        inspection = db.query(Inspection).filter(Inspection.inspection_id == inspection_id).first()
        
        if not inspection:
            return None
        
        # Update fields
        for key, value in update_data.items():
            if hasattr(inspection, key) and value is not None:
                setattr(inspection, key, value)
        
        db.commit()
        db.refresh(inspection)
        
        return self._inspection_to_dict(inspection)
    
    def submit_inspection(self, inspection_id: int, submit_data: Dict) -> Optional[Dict]:
        """Submit an inspection for review."""
        db = self.get_db()
        inspection = db.query(Inspection).filter(Inspection.inspection_id == inspection_id).first()
        
        if not inspection:
            return None
        
        inspection.status = InspectionStatus.SUBMITTED
        inspection.submitted_at = datetime.utcnow()
        
        db.commit()
        db.refresh(inspection)
        
        return self._inspection_to_dict(inspection)
    
    def _inspection_to_dict(self, inspection: Inspection) -> Dict:
        """Convert Inspection model to dictionary."""
        return {
            "inspection_id": inspection.inspection_id,
            "site_id": inspection.site_id,
            "inspector_id": inspection.inspector_id,
            "status": inspection.status.value,
            "started_at": inspection.started_at.isoformat() if inspection.started_at else None,
            "submitted_at": inspection.submitted_at.isoformat() if inspection.submitted_at else None,
            "latitude": inspection.latitude,
            "longitude": inspection.longitude,
            "created_at": inspection.site.created_at.isoformat() if inspection.site else None
        }
    
    # ============================================================================
    # COMPLAINT OPERATIONS
    # ============================================================================
    
    def get_complaints(self, citizen_id: Optional[int] = None) -> List[Dict]:
        """Get all complaints, optionally filtered by citizen."""
        db = self.get_db()
        query = db.query(Complaint)
        if citizen_id:
            query = query.filter(Complaint.citizen_id == citizen_id)
        complaints = query.all()
        return [self._complaint_to_dict(comp) for comp in complaints]
    
    def get_complaint(self, complaint_id: int) -> Optional[Dict]:
        """Get complaint by ID."""
        db = self.get_db()
        complaint = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
        if complaint:
            return self._complaint_to_dict(complaint)
        return None
    
    def create_complaint(self, complaint_data: Dict) -> Dict:
        """Create a new complaint."""
        db = self.get_db()
        
        complaint = Complaint(
            citizen_id=complaint_data["citizen_id"],
            category=complaint_data["category"],
            description=complaint_data["description"],
            latitude=complaint_data["latitude"],
            longitude=complaint_data["longitude"],
            status=ComplaintStatus.PENDING
        )
        
        db.add(complaint)
        db.commit()
        db.refresh(complaint)
        
        return self._complaint_to_dict(complaint)
    
    def update_complaint(self, complaint_id: int, update_data: Dict) -> Optional[Dict]:
        """Update an existing complaint."""
        db = self.get_db()
        complaint = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
        
        if not complaint:
            return None
        
        for key, value in update_data.items():
            if hasattr(complaint, key) and value is not None:
                setattr(complaint, key, value)
        
        db.commit()
        db.refresh(complaint)
        
        return self._complaint_to_dict(complaint)
    
    def link_complaint_to_ticket(self, complaint_id: int, ticket_id: int) -> bool:
        """Link a complaint to a ticket."""
        db = self.get_db()
        complaint = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
        
        if not complaint:
            return False
        
        # Note: This would require adding a ticket_id field to the Complaint model
        # For now, we'll update the complaint's inspection_id if needed
        return True
    
    def link_complaint_to_inspection(self, complaint_id: int, inspection_id: int) -> bool:
        """Link a complaint to an inspection."""
        db = self.get_db()
        complaint = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
        
        if not complaint:
            return False
        
        # Note: This would require adding an inspection_id field to the Complaint model
        # For now, this is a stub
        return True
    
    def _complaint_to_dict(self, complaint: Complaint) -> Dict:
        """Convert Complaint model to dictionary."""
        return {
            "complaint_id": complaint.complaint_id,
            "citizen_id": complaint.citizen_id,
            "category": complaint.category,
            "description": complaint.description,
            "latitude": complaint.latitude,
            "longitude": complaint.longitude,
            "status": complaint.status.value,
            "created_at": complaint.created_at.isoformat() if complaint.created_at else None,
            "updated_at": complaint.updated_at.isoformat() if complaint.updated_at else None
        }
    
    # ============================================================================
    # TICKET OPERATIONS
    # ============================================================================
    
    def get_tickets(self, owner_id: Optional[int] = None) -> List[Dict]:
        """Get all tickets, optionally filtered by owner."""
        db = self.get_db()
        query = db.query(Ticket)
        if owner_id:
            query = query.filter(Ticket.owner_id == owner_id)
        tickets = query.all()
        return [self._ticket_to_dict(ticket) for ticket in tickets]
    
    def get_ticket(self, ticket_id: int) -> Optional[Dict]:
        """Get ticket by ID."""
        db = self.get_db()
        ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
        if ticket:
            return self._ticket_to_dict(ticket)
        return None
    
    def create_ticket(self, ticket_data: Dict) -> Dict:
        """Create a new ticket."""
        db = self.get_db()
        
        ticket = Ticket(
            complaint_id=ticket_data.get("complaint_id"),
            inspection_id=ticket_data.get("inspection_id"),
            owner_id=ticket_data["owner_id"],
            priority=ticket_data.get("priority", 1),
            status=TicketStatus.OPEN,
            sla_deadline=ticket_data.get("sla_deadline")
        )
        
        db.add(ticket)
        db.commit()
        db.refresh(ticket)
        
        return self._ticket_to_dict(ticket)
    
    def update_ticket(self, ticket_id: int, update_data: Dict) -> Optional[Dict]:
        """Update an existing ticket."""
        db = self.get_db()
        ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
        
        if not ticket:
            return None
        
        for key, value in update_data.items():
            if hasattr(ticket, key) and value is not None:
                setattr(ticket, key, value)
        
        db.commit()
        db.refresh(ticket)
        
        return self._ticket_to_dict(ticket)
    
    def _ticket_to_dict(self, ticket: Ticket) -> Dict:
        """Convert Ticket model to dictionary."""
        return {
            "ticket_id": ticket.ticket_id,
            "complaint_id": ticket.complaint_id,
            "inspection_id": ticket.inspection_id,
            "owner_id": ticket.owner_id,
            "priority": ticket.priority,
            "status": ticket.status.value,
            "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
            "sla_deadline": ticket.sla_deadline.isoformat() if ticket.sla_deadline else None
        }
    
    # ============================================================================
    # EVIDENCE OPERATIONS
    # ============================================================================
    
    def get_evidence(self, inspection_id: Optional[int] = None) -> List[Dict]:
        """Get all evidence, optionally filtered by inspection."""
        db = self.get_db()
        query = db.query(Evidence)
        if inspection_id:
            query = query.filter(Evidence.inspection_id == inspection_id)
        evidence = query.all()
        return [self._evidence_to_dict(ev) for ev in evidence]
    
    def get_evidence_by_id(self, evidence_id: int) -> Optional[Dict]:
        """Get evidence by ID."""
        db = self.get_db()
        evidence = db.query(Evidence).filter(Evidence.evidence_id == evidence_id).first()
        if evidence:
            return self._evidence_to_dict(evidence)
        return None
    
    def create_evidence(self, evidence_data: Dict) -> Dict:
        """Create a new evidence record."""
        db = self.get_db()
        
        evidence = Evidence(
            inspection_id=evidence_data["inspection_id"],
            file_path=evidence_data["file_path"],
            evidence_type=EvidenceType(evidence_data["evidence_type"]),
            latitude=evidence_data["latitude"],
            longitude=evidence_data["longitude"],
            hash_sha256=evidence_data["hash_sha256"]
        )
        
        db.add(evidence)
        db.commit()
        db.refresh(evidence)
        
        return self._evidence_to_dict(evidence)
    
    def _evidence_to_dict(self, evidence: Evidence) -> Dict:
        """Convert Evidence model to dictionary."""
        return {
            "evidence_id": evidence.evidence_id,
            "inspection_id": evidence.inspection_id,
            "file_path": evidence.file_path,
            "evidence_type": evidence.evidence_type.value,
            "captured_at": evidence.captured_at.isoformat() if evidence.captured_at else None,
            "latitude": evidence.latitude,
            "longitude": evidence.longitude,
            "hash_sha256": evidence.hash_sha256
        }
    
    # ============================================================================
    # RISK SCORE OPERATIONS
    # ============================================================================
    
    def get_risk_scores(self, inspection_id: Optional[int] = None) -> List[Dict]:
        """Get all risk scores, optionally filtered by inspection."""
        db = self.get_db()
        query = db.query(RiskScore)
        if inspection_id:
            query = query.filter(RiskScore.inspection_id == inspection_id)
        risk_scores = query.all()
        return [self._risk_score_to_dict(rs) for rs in risk_scores]
    
    def get_risk_score(self, risk_score_id: int) -> Optional[Dict]:
        """Get risk score by ID."""
        db = self.get_db()
        risk_score = db.query(RiskScore).filter(RiskScore.risk_score_id == risk_score_id).first()
        if risk_score:
            return self._risk_score_to_dict(risk_score)
        return None
    
    def create_risk_score(self, risk_score_data: Dict) -> Dict:
        """Create a new risk score."""
        db = self.get_db()
        
        risk_score = RiskScore(
            inspection_id=risk_score_data["inspection_id"],
            score=risk_score_data["score"],
            risk_level=RiskLevel(risk_score_data["risk_level"]),
            factors=risk_score_data.get("factors", {}),
            confidence=risk_score_data.get("confidence", 0.9)
        )
        
        db.add(risk_score)
        db.commit()
        db.refresh(risk_score)
        
        return self._risk_score_to_dict(risk_score)
    
    def _risk_score_to_dict(self, risk_score: RiskScore) -> Dict:
        """Convert RiskScore model to dictionary."""
        return {
            "risk_score_id": risk_score.risk_score_id,
            "inspection_id": risk_score.inspection_id,
            "score": risk_score.score,
            "risk_level": risk_score.risk_level.value,
            "factors": risk_score.factors_dict if hasattr(risk_score, 'factors_dict') else {},
            "confidence": risk_score.confidence,
            "computed_at": risk_score.computed_at.isoformat() if risk_score.computed_at else None
        }
    
    # ============================================================================
    # AUDIT EVENT OPERATIONS
    # ============================================================================
    
    def get_audit_events(self, entity: Optional[str] = None, entity_id: Optional[int] = None) -> List[Dict]:
        """Get audit events, optionally filtered by entity."""
        db = self.get_db()
        query = db.query(AuditEvent)
        if entity:
            query = query.filter(AuditEvent.entity == entity)
        if entity_id:
            query = query.filter(AuditEvent.entity_id == entity_id)
        events = query.all()
        return [self._audit_event_to_dict(event) for event in events]
    
    def _audit_event_to_dict(self, event: AuditEvent) -> Dict:
        """Convert AuditEvent model to dictionary."""
        return {
            "audit_id": event.audit_id,
            "entity": event.entity,
            "entity_id": event.entity_id,
            "action": event.action,
            "actor_id": event.actor_id,
            "timestamp": event.timestamp.isoformat() if event.timestamp else None,
            "before_state": event.before_state,
            "after_state": event.after_state
        }
    
    # ============================================================================
    # DASHBOARD STATS
    # ============================================================================
    
    def get_dashboard_stats(self) -> Dict[str, Any]:
        """Get aggregated dashboard statistics."""
        db = self.get_db()
        
        total_inspections = db.query(Inspection).count()
        total_complaints = db.query(Complaint).count()
        total_tickets = db.query(Ticket).count()
        
        pending_inspections = db.query(Inspection).filter(
            Inspection.status.in_([InspectionStatus.IN_PROGRESS, InspectionStatus.SUBMITTED])
        ).count()
        
        high_risk_inspections = db.query(Inspection).join(RiskScore).filter(
            RiskScore.risk_level.in_([RiskLevel.HIGH, RiskLevel.CRITICAL])
        ).count()
        
        open_tickets = db.query(Ticket).filter(Ticket.status == TicketStatus.OPEN).count()
        
        return {
            "total_inspections": total_inspections,
            "total_complaints": total_complaints,
            "total_tickets": total_tickets,
            "pending_inspections": pending_inspections,
            "high_risk_inspections": high_risk_inspections,
            "open_tickets": open_tickets
        }
