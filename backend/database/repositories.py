"""
Repository layer for NIRIKSHAN database operations.
Provides database-focused operations for each entity.
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from database.models import (
    Department, User, Site, Inspection, Evidence, 
    EvidenceSimilarityResult, RiskScore, Complaint, Ticket, AuditEvent,
    UserRole, InspectionStatus, RiskLevel, EvidenceType, 
    TicketStatus, ComplaintStatus, SiteType, ActiveStatus
)
from database.exceptions import (
    RecordNotFoundError, ValidationError, ConstraintViolationError,
    DuplicateRecordError, ForeignKeyError
)


class DepartmentRepository:
    """Repository for Department operations."""
    
    @staticmethod
    def create(db: Session, name: str, description: Optional[str] = None) -> Department:
        """Create a new department."""
        try:
            department = Department(
                name=name,
                description=description,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(department)
            db.commit()
            db.refresh(department)
            return department
        except Exception as e:
            db.rollback()
            if "unique constraint" in str(e).lower():
                raise DuplicateRecordError(f"Department with name '{name}' already exists")
            raise
    
    @staticmethod
    def get_by_id(db: Session, department_id: int) -> Optional[Department]:
        """Get department by ID."""
        return db.query(Department).filter(Department.department_id == department_id).first()
    
    @staticmethod
    def get_by_name(db: Session, name: str) -> Optional[Department]:
        """Get department by name."""
        return db.query(Department).filter(Department.name == name).first()
    
    @staticmethod
    def get_all(db: Session) -> List[Department]:
        """Get all departments."""
        return db.query(Department).order_by(Department.name).all()
    
    @staticmethod
    def update(db: Session, department_id: int, name: Optional[str] = None, description: Optional[str] = None) -> Department:
        """Update department."""
        department = DepartmentRepository.get_by_id(db, department_id)
        if not department:
            raise RecordNotFoundError(f"Department with ID {department_id} not found")
        
        if name is not None:
            department.name = name
        if description is not None:
            department.description = description
        
        department.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(department)
        return department


class UserRepository:
    """Repository for User operations."""
    
    @staticmethod
    def create(db: Session, full_name: str, email: str, password_hash: str, 
               role: UserRole, department_id: Optional[int] = None) -> User:
        """Create a new user."""
        try:
            user = User(
                full_name=full_name,
                email=email,
                password_hash=password_hash,
                role=role,
                department_id=department_id,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            return user
        except Exception as e:
            db.rollback()
            if "unique constraint" in str(e).lower():
                raise DuplicateRecordError(f"User with email '{email}' already exists")
            if "foreign key constraint" in str(e).lower():
                raise ForeignKeyError(f"Department with ID {department_id} not found")
            raise
    
    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return db.query(User).filter(User.user_id == user_id).first()
    
    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email."""
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def get_by_role(db: Session, role: UserRole) -> List[User]:
        """Get users by role."""
        return db.query(User).filter(User.role == role).all()
    
    @staticmethod
    def get_all(db: Session) -> List[User]:
        """Get all users."""
        return db.query(User).order_by(User.full_name).all()
    
    @staticmethod
    def update(db: Session, user_id: int, **kwargs) -> User:
        """Update user."""
        user = UserRepository.get_by_id(db, user_id)
        if not user:
            raise RecordNotFoundError(f"User with ID {user_id} not found")
        
        for key, value in kwargs.items():
            if hasattr(user, key) and key != 'user_id':
                setattr(user, key, value)
        
        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def deactivate(db: Session, user_id: int) -> User:
        """Deactivate user."""
        return UserRepository.update(db, user_id, is_active=False)


class SiteRepository:
    """Repository for Site operations."""
    
    @staticmethod
    def create(db: Session, name: str, site_type: SiteType, latitude: float, longitude: float,
                department_id: int, address: Optional[str] = None) -> Site:
        """Create a new site."""
        try:
            from geoalchemy2.elements import WKTElement
            
            site = Site(
                name=name,
                site_type=site_type,
                address=address,
                latitude=latitude,
                longitude=longitude,
                location=WKTElement(f'POINT({longitude} {latitude})', srid=4326),
                department_id=department_id,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(site)
            db.commit()
            db.refresh(site)
            return site
        except Exception as e:
            db.rollback()
            if "foreign key constraint" in str(e).lower():
                raise ForeignKeyError(f"Department with ID {department_id} not found")
            raise
    
    @staticmethod
    def get_by_id(db: Session, site_id: int) -> Optional[Site]:
        """Get site by ID."""
        return db.query(Site).filter(Site.site_id == site_id).first()
    
    @staticmethod
    def get_by_department(db: Session, department_id: int) -> List[Site]:
        """Get sites by department."""
        return db.query(Site).filter(Site.department_id == department_id).all()
    
    @staticmethod
    def get_all(db: Session, active_only: bool = True) -> List[Site]:
        """Get all sites."""
        query = db.query(Site)
        if active_only:
            query = query.filter(Site.is_active == True)
        return query.order_by(Site.name).all()
    
    @staticmethod
    def update(db: Session, site_id: int, **kwargs) -> Site:
        """Update site."""
        site = SiteRepository.get_by_id(db, site_id)
        if not site:
            raise RecordNotFoundError(f"Site with ID {site_id} not found")
        
        for key, value in kwargs.items():
            if hasattr(site, key) and key not in ['site_id', 'department_id']:
                setattr(site, key, value)
        
        site.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(site)
        return site


class InspectionRepository:
    """Repository for Inspection operations."""
    
    @staticmethod
    def create(db: Session, site_id: int, inspector_id: int, latitude: float, longitude: float,
               status: InspectionStatus = InspectionStatus.DRAFT) -> Inspection:
        """Create a new inspection."""
        try:
            from geoalchemy2.elements import WKTElement
            
            inspection = Inspection(
                site_id=site_id,
                inspector_id=inspector_id,
                status=status,
                started_at=datetime.utcnow() if status == InspectionStatus.IN_PROGRESS else None,
                latitude=latitude,
                longitude=longitude,
                location=WKTElement(f'POINT({longitude} {latitude})', srid=4326)
            )
            db.add(inspection)
            db.commit()
            db.refresh(inspection)
            return inspection
        except Exception as e:
            db.rollback()
            if "foreign key constraint" in str(e).lower():
                raise ForeignKeyError("Invalid site_id or inspector_id")
            raise
    
    @staticmethod
    def get_by_id(db: Session, inspection_id: int) -> Optional[Inspection]:
        """Get inspection by ID."""
        return db.query(Inspection).filter(Inspection.inspection_id == inspection_id).first()
    
    @staticmethod
    def get_by_inspector(db: Session, inspector_id: int) -> List[Inspection]:
        """Get inspections by inspector."""
        return db.query(Inspection).filter(Inspection.inspector_id == inspector_id).all()
    
    @staticmethod
    def get_by_site(db: Session, site_id: int) -> List[Inspection]:
        """Get inspections by site."""
        return db.query(Inspection).filter(Inspection.site_id == site_id).all()
    
    @staticmethod
    def update(db: Session, inspection_id: int, **kwargs) -> Inspection:
        """Update inspection."""
        inspection = InspectionRepository.get_by_id(db, inspection_id)
        if not inspection:
            raise RecordNotFoundError(f"Inspection with ID {inspection_id} not found")
        
        for key, value in kwargs.items():
            if hasattr(inspection, key) and key not in ['inspection_id', 'site_id', 'inspector_id']:
                setattr(inspection, key, value)
        
        db.commit()
        db.refresh(inspection)
        return inspection
    
    @staticmethod
    def submit(db: Session, inspection_id: int) -> Inspection:
        """Submit inspection."""
        return InspectionRepository.update(
            db, inspection_id, 
            status=InspectionStatus.SUBMITTED, 
            submitted_at=datetime.utcnow()
        )


class EvidenceRepository:
    """Repository for Evidence operations."""
    
    @staticmethod
    def create(db: Session, inspection_id: int, file_path: str, evidence_type: EvidenceType,
               latitude: float, longitude: float, hash_sha256: str) -> Evidence:
        """Create new evidence."""
        try:
            from geoalchemy2.elements import WKTElement
            
            # Validate SHA-256 format
            if len(hash_sha256) != 64:
                raise ValidationError("SHA-256 hash must be 64 characters")
            
            evidence = Evidence(
                inspection_id=inspection_id,
                file_path=file_path,
                evidence_type=evidence_type,
                captured_at=datetime.utcnow(),
                latitude=latitude,
                longitude=longitude,
                hash_sha256=hash_sha256,
                location=WKTElement(f'POINT({longitude} {latitude})', srid=4326)
            )
            db.add(evidence)
            db.commit()
            db.refresh(evidence)
            return evidence
        except Exception as e:
            db.rollback()
            if "foreign key constraint" in str(e).lower():
                raise ForeignKeyError(f"Inspection with ID {inspection_id} not found")
            raise
    
    @staticmethod
    def get_by_id(db: Session, evidence_id: int) -> Optional[Evidence]:
        """Get evidence by ID."""
        return db.query(Evidence).filter(Evidence.evidence_id == evidence_id).first()
    
    @staticmethod
    def get_by_inspection(db: Session, inspection_id: int) -> List[Evidence]:
        """Get evidence by inspection."""
        return db.query(Evidence).filter(Evidence.inspection_id == inspection_id).all()
    
    @staticmethod
    def get_by_hash(db: Session, hash_sha256: str) -> List[Evidence]:
        """Get evidence by hash."""
        return db.query(Evidence).filter(Evidence.hash_sha256 == hash_sha256).all()


class SimilarityResultRepository:
    """Repository for EvidenceSimilarityResult operations."""
    
    @staticmethod
    def create(db: Session, evidence_id: int, matched_evidence_id: int, 
               similarity_score: float, method: str, flagged: bool = False) -> EvidenceSimilarityResult:
        """Create similarity result."""
        try:
            # Validate similarity score range
            if not 0.0 <= similarity_score <= 1.0:
                raise ValidationError("Similarity score must be between 0.0 and 1.0")
            
            # Prevent self-matching
            if evidence_id == matched_evidence_id:
                raise ValidationError("Evidence cannot match itself")
            
            similarity_result = EvidenceSimilarityResult(
                evidence_id=evidence_id,
                matched_evidence_id=matched_evidence_id,
                similarity_score=similarity_score,
                method=method,
                flagged=flagged
            )
            db.add(similarity_result)
            db.commit()
            db.refresh(similarity_result)
            return similarity_result
        except Exception as e:
            db.rollback()
            if "foreign key constraint" in str(e).lower():
                raise ForeignKeyError("Invalid evidence_id or matched_evidence_id")
            raise
    
    @staticmethod
    def get_by_id(db: Session, similarity_id: int) -> Optional[EvidenceSimilarityResult]:
        """Get similarity result by ID."""
        return db.query(EvidenceSimilarityResult).filter(
            EvidenceSimilarityResult.similarity_id == similarity_id
        ).first()
    
    @staticmethod
    def get_by_evidence(db: Session, evidence_id: int) -> List[EvidenceSimilarityResult]:
        """Get similarity results for evidence."""
        return db.query(EvidenceSimilarityResult).filter(
            EvidenceSimilarityResult.evidence_id == evidence_id
        ).all()
    
    @staticmethod
    def get_flagged(db: Session) -> List[EvidenceSimilarityResult]:
        """Get all flagged similarity results."""
        return db.query(EvidenceSimilarityResult).filter(
            EvidenceSimilarityResult.flagged == True
        ).all()


class RiskScoreRepository:
    """Repository for RiskScore operations."""
    
    @staticmethod
    def create(db: Session, inspection_id: int, score: int, risk_level: RiskLevel,
               factors: Dict[str, float], confidence: float) -> RiskScore:
        """Create risk score."""
        try:
            import json
            
            # Validate ranges
            if not 0 <= score <= 100:
                raise ValidationError("Risk score must be between 0 and 100")
            if not 0.0 <= confidence <= 1.0:
                raise ValidationError("Confidence must be between 0.0 and 1.0")
            
            risk_score = RiskScore(
                inspection_id=inspection_id,
                score=score,
                risk_level=risk_level,
                factors=json.dumps(factors),
                confidence=confidence,
                computed_at=datetime.utcnow()
            )
            db.add(risk_score)
            db.commit()
            db.refresh(risk_score)
            return risk_score
        except Exception as e:
            db.rollback()
            if "foreign key constraint" in str(e).lower():
                raise ForeignKeyError(f"Inspection with ID {inspection_id} not found")
            raise
    
    @staticmethod
    def get_by_id(db: Session, risk_score_id: int) -> Optional[RiskScore]:
        """Get risk score by ID."""
        return db.query(RiskScore).filter(RiskScore.risk_score_id == risk_score_id).first()
    
    @staticmethod
    def get_by_inspection(db: Session, inspection_id: int) -> List[RiskScore]:
        """Get risk scores for inspection (historical)."""
        return db.query(RiskScore).filter(
            RiskScore.inspection_id == inspection_id
        ).order_by(RiskScore.computed_at.desc()).all()
    
    @staticmethod
    def get_latest_by_inspection(db: Session, inspection_id: int) -> Optional[RiskScore]:
        """Get latest risk score for inspection."""
        return db.query(RiskScore).filter(
            RiskScore.inspection_id == inspection_id
        ).order_by(RiskScore.computed_at.desc()).first()


class ComplaintRepository:
    """Repository for Complaint operations."""
    
    @staticmethod
    def create(db: Session, citizen_id: int, category: str, description: str,
               latitude: float, longitude: float) -> Complaint:
        """Create new complaint."""
        try:
            from geoalchemy2.elements import WKTElement
            
            complaint = Complaint(
                citizen_id=citizen_id,
                category=category,
                description=description,
                latitude=latitude,
                longitude=longitude,
                status=ComplaintStatus.PENDING,
                location=WKTElement(f'POINT({longitude} {latitude})', srid=4326),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(complaint)
            db.commit()
            db.refresh(complaint)
            return complaint
        except Exception as e:
            db.rollback()
            if "foreign key constraint" in str(e).lower():
                raise ForeignKeyError(f"User with ID {citizen_id} not found")
            raise
    
    @staticmethod
    def get_by_id(db: Session, complaint_id: int) -> Optional[Complaint]:
        """Get complaint by ID."""
        return db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
    
    @staticmethod
    def get_by_citizen(db: Session, citizen_id: int) -> List[Complaint]:
        """Get complaints by citizen."""
        return db.query(Complaint).filter(Complaint.citizen_id == citizen_id).all()
    
    @staticmethod
    def get_by_status(db: Session, status: ComplaintStatus) -> List[Complaint]:
        """Get complaints by status."""
        return db.query(Complaint).filter(Complaint.status == status).all()
    
    @staticmethod
    def update(db: Session, complaint_id: int, **kwargs) -> Complaint:
        """Update complaint."""
        complaint = ComplaintRepository.get_by_id(db, complaint_id)
        if not complaint:
            raise RecordNotFoundError(f"Complaint with ID {complaint_id} not found")
        
        for key, value in kwargs.items():
            if hasattr(complaint, key) and key not in ['complaint_id', 'citizen_id']:
                setattr(complaint, key, value)
        
        complaint.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(complaint)
        return complaint


class TicketRepository:
    """Repository for Ticket operations."""
    
    @staticmethod
    def create(db: Session, owner_id: int, priority: int = 1,
               complaint_id: Optional[int] = None, inspection_id: Optional[int] = None,
               sla_deadline: Optional[datetime] = None) -> Ticket:
        """Create new ticket."""
        try:
            # Ensure at least one source is provided
            if not complaint_id and not inspection_id:
                raise ValidationError("Either complaint_id or inspection_id must be provided")
            
            ticket = Ticket(
                complaint_id=complaint_id,
                inspection_id=inspection_id,
                owner_id=owner_id,
                priority=priority,
                status=TicketStatus.OPEN,
                created_at=datetime.utcnow(),
                sla_deadline=sla_deadline
            )
            db.add(ticket)
            db.commit()
            db.refresh(ticket)
            return ticket
        except Exception as e:
            db.rollback()
            if "foreign key constraint" in str(e).lower():
                raise ForeignKeyError("Invalid owner_id, complaint_id, or inspection_id")
            if "check constraint" in str(e).lower():
                raise ValidationError("Either complaint_id or inspection_id must be provided")
            raise
    
    @staticmethod
    def get_by_id(db: Session, ticket_id: int) -> Optional[Ticket]:
        """Get ticket by ID."""
        return db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    
    @staticmethod
    def get_by_owner(db: Session, owner_id: int) -> List[Ticket]:
        """Get tickets by owner."""
        return db.query(Ticket).filter(Ticket.owner_id == owner_id).all()
    
    @staticmethod
    def get_by_status(db: Session, status: TicketStatus) -> List[Ticket]:
        """Get tickets by status."""
        return db.query(Ticket).filter(Ticket.status == status).all()
    
    @staticmethod
    def get_overdue(db: Session) -> List[Ticket]:
        """Get overdue tickets."""
        return db.query(Ticket).filter(
            and_(
                Ticket.sla_deadline < datetime.utcnow(),
                Ticket.status.in_([TicketStatus.OPEN, TicketStatus.IN_PROGRESS])
            )
        ).all()
    
    @staticmethod
    def update(db: Session, ticket_id: int, **kwargs) -> Ticket:
        """Update ticket."""
        ticket = TicketRepository.get_by_id(db, ticket_id)
        if not ticket:
            raise RecordNotFoundError(f"Ticket with ID {ticket_id} not found")
        
        for key, value in kwargs.items():
            if hasattr(ticket, key) and key not in ['ticket_id', 'complaint_id', 'inspection_id', 'owner_id']:
                setattr(ticket, key, value)
        
        db.commit()
        db.refresh(ticket)
        return ticket


class AuditEventRepository:
    """Repository for AuditEvent operations (append-only)."""
    
    @staticmethod
    def create(db: Session, entity: str, entity_id: int, action: str, actor_id: Optional[int] = None,
               before_state: Optional[Dict[str, Any]] = None, after_state: Optional[Dict[str, Any]] = None) -> AuditEvent:
        """Create audit event."""
        try:
            import json
            
            audit_event = AuditEvent(
                entity=entity,
                entity_id=entity_id,
                action=action,
                actor_id=actor_id,
                timestamp=datetime.utcnow(),
                before_state=json.dumps(before_state) if before_state else None,
                after_state=json.dumps(after_state) if after_state else None
            )
            db.add(audit_event)
            db.commit()
            db.refresh(audit_event)
            return audit_event
        except Exception as e:
            db.rollback()
            if "foreign key constraint" in str(e).lower():
                raise ForeignKeyError(f"User with ID {actor_id} not found")
            raise
    
    @staticmethod
    def get_by_entity(db: Session, entity: str, entity_id: int) -> List[AuditEvent]:
        """Get audit history for entity."""
        return db.query(AuditEvent).filter(
            and_(
                AuditEvent.entity == entity,
                AuditEvent.entity_id == entity_id
            )
        ).order_by(AuditEvent.timestamp.desc()).all()
    
    @staticmethod
    def get_by_actor(db: Session, actor_id: int) -> List[AuditEvent]:
        """Get audit events by actor."""
        return db.query(AuditEvent).filter(
            AuditEvent.actor_id == actor_id
        ).order_by(AuditEvent.timestamp.desc()).all()
    
    @staticmethod
    def get_recent(db: Session, limit: int = 100) -> List[AuditEvent]:
        """Get recent audit events."""
        return db.query(AuditEvent).order_by(
            AuditEvent.timestamp.desc()
        ).limit(limit).all()
    
    # Note: No update or delete methods for audit events (append-only design)
