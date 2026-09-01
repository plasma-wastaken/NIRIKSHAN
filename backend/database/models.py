"""
SQLAlchemy models for NIRIKSHAN database.
Uses modern SQLAlchemy 2.x syntax with typed declarative mappings.
"""
from datetime import datetime
from typing import Optional, List
from enum import Enum as PyEnum

from sqlalchemy import (
    String, Integer, Float, Boolean, DateTime, Text, 
    ForeignKey, CheckConstraint, Index, UniqueConstraint, Enum as SQLEnum
)
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column, relationship
)
from geoalchemy2 import Geometry
from geoalchemy2.shape import to_shape
import json


class Base(DeclarativeBase):
    """Base class for all models."""
    pass


# ============================================================================
# OFFICIAL ENUMS (from SRS Section 6)
# ============================================================================

class UserRole(PyEnum):
    """Official user roles from SRS."""
    CITIZEN = "CITIZEN"
    INSPECTOR = "INSPECTOR"
    SUPERVISOR = "SUPERVISOR"
    ADMIN = "ADMIN"


class RiskLevel(PyEnum):
    """Official risk levels from SRS."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class EvidenceType(PyEnum):
    """Official evidence types from SRS."""
    PHOTO = "PHOTO"
    VIDEO = "VIDEO"


class TicketStatus(PyEnum):
    """Official ticket statuses from SRS."""
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"


# ============================================================================
# IMPLEMENTATION ENUMS (not in SRS, but required for functionality)
# ============================================================================

class InspectionStatus(PyEnum):
    """
    Implementation decision: Inspection status values.
    The SRS does not define official inspection status values.
    This implementation uses a constrained string representation suitable for the prototype.
    """
    DRAFT = "DRAFT"
    IN_PROGRESS = "IN_PROGRESS"
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class ComplaintStatus(PyEnum):
    """
    Implementation decision: Complaint status values.
    The SRS does not define official complaint status values.
    This implementation uses a constrained string representation suitable for the prototype.
    """
    PENDING = "PENDING"
    UNDER_INVESTIGATION = "UNDER_INVESTIGATION"
    RESOLVED = "RESOLVED"
    DISMISSED = "DISMISSED"


class SiteType(PyEnum):
    """
    Implementation decision: Site type values.
    The SRS does not define official site type values.
    This implementation uses a constrained string representation suitable for the prototype.
    """
    SCHOOL = "SCHOOL"
    RESTAURANT = "RESTAURANT"
    HOSPITAL = "HOSPITAL"
    WELFARE_CENTER = "WELFARE_CENTER"
    OTHER = "OTHER"


class ActiveStatus(PyEnum):
    """
    Implementation decision: Active/Inactive status for sites and users.
    """
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


# ============================================================================
# SUPPORTING TABLES (required for referential integrity)
# ============================================================================

class Department(Base):
    """
    Supporting table: Department
    Required because inspections and users belong to departments.
    The SRS references departments but does not define fields in Section 6.
    This minimal implementation supports department ownership.
    """
    __tablename__ = "departments"
    
    department_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    users: Mapped[List["User"]] = relationship(back_populates="department", cascade="all, delete-orphan")
    sites: Mapped[List["Site"]] = relationship(back_populates="department", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<Department(department_id={self.department_id}, name='{self.name}')>"


class User(Base):
    """
    Supporting table: User
    Required because inspections, complaints, tickets, and audit events reference users.
    The SRS requires centralized user management with roles.
    Uses official UserRole enum from SRS.
    """
    __tablename__ = "users"
    
    user_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)  # Never store plaintext
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), nullable=False)
    department_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("departments.department_id", ondelete="SET NULL"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    department: Mapped[Optional["Department"]] = relationship(back_populates="users")
    inspections_as_inspector: Mapped[List["Inspection"]] = relationship(back_populates="inspector", foreign_keys="Inspection.inspector_id")
    complaints: Mapped[List["Complaint"]] = relationship(back_populates="citizen")
    owned_tickets: Mapped[List["Ticket"]] = relationship(back_populates="owner")
    audit_events: Mapped[List["AuditEvent"]] = relationship(back_populates="actor")
    
    # Indexes
    __table_args__ = (
        Index("idx_user_email", "email"),
        Index("idx_user_role", "role"),
        Index("idx_user_department", "department_id"),
    )
    
    def __repr__(self) -> str:
        return f"<User(user_id={self.user_id}, email='{self.email}', role='{self.role.value}')>"


class Site(Base):
    """
    Supporting table: Site
    Required because inspections reference site_id.
    The SRS uses site_id but does not define Site fields in Section 6.
    This minimal implementation supports site identity, department ownership, and location.
    """
    __tablename__ = "sites"
    
    site_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    site_type: Mapped[SiteType] = mapped_column(SQLEnum(SiteType), nullable=False)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)  # Required by SRS
    longitude: Mapped[float] = mapped_column(Float, nullable=False)  # Required by SRS
    location: Mapped[Optional[Geometry]] = mapped_column(Geometry(geometry_type='POINT', srid=4326), nullable=True)  # PostGIS
    department_id: Mapped[int] = mapped_column(Integer, ForeignKey("departments.department_id", ondelete="RESTRICT"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    department: Mapped["Department"] = relationship(back_populates="sites")
    inspections: Mapped[List["Inspection"]] = relationship(back_populates="site")
    
    # Indexes
    __table_args__ = (
        Index("idx_site_department", "department_id"),
        Index("idx_site_location", "location", postgresql_using='gist'),  # GiST index for PostGIS
        Index("idx_site_active", "is_active"),
    )
    
    def __repr__(self) -> str:
        return f"<Site(site_id={self.site_id}, name='{self.name}', type='{self.site_type.value}')>"


# ============================================================================
# CORE TABLES (from SRS Section 6)
# ============================================================================

class Inspection(Base):
    """
    Core table: Inspection
    Exact SRS fields: inspection_id, site_id, inspector_id, status, started_at, submitted_at, latitude, longitude
    """
    __tablename__ = "inspections"
    
    inspection_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    site_id: Mapped[int] = mapped_column(Integer, ForeignKey("sites.site_id", ondelete="RESTRICT"), nullable=False)
    inspector_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False)
    status: Mapped[InspectionStatus] = mapped_column(SQLEnum(InspectionStatus), nullable=False, default=InspectionStatus.DRAFT)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)  # Required by SRS
    longitude: Mapped[float] = mapped_column(Float, nullable=False)  # Required by SRS
    location: Mapped[Optional[Geometry]] = mapped_column(Geometry(geometry_type='POINT', srid=4326), nullable=True)  # PostGIS
    
    # Relationships
    site: Mapped["Site"] = relationship(back_populates="inspections")
    inspector: Mapped["User"] = relationship(back_populates="inspections_as_inspector", foreign_keys=[inspector_id])
    evidence: Mapped[List["Evidence"]] = relationship(back_populates="inspection", cascade="all, delete-orphan")
    risk_scores: Mapped[List["RiskScore"]] = relationship(back_populates="inspection", cascade="all, delete-orphan")
    tickets: Mapped[List["Ticket"]] = relationship(back_populates="inspection")
    
    # Indexes
    __table_args__ = (
        Index("idx_inspection_site", "site_id"),
        Index("idx_inspection_inspector", "inspector_id"),
        Index("idx_inspection_status", "status"),
        Index("idx_inspection_started", "started_at"),
        Index("idx_inspection_submitted", "submitted_at"),
        Index("idx_inspection_location", "location", postgresql_using='gist'),  # GiST index for PostGIS
    )
    
    def __repr__(self) -> str:
        return f"<Inspection(inspection_id={self.inspection_id}, status='{self.status.value}')>"


class Evidence(Base):
    """
    Core table: Evidence
    Exact SRS fields: evidence_id, inspection_id, file_path, evidence_type, captured_at, latitude, longitude, hash_sha256
    """
    __tablename__ = "evidence"
    
    evidence_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    inspection_id: Mapped[int] = mapped_column(Integer, ForeignKey("inspections.inspection_id", ondelete="CASCADE"), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)  # Path where backend stores media
    evidence_type: Mapped[EvidenceType] = mapped_column(SQLEnum(EvidenceType), nullable=False)
    captured_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)  # Required by SRS
    longitude: Mapped[float] = mapped_column(Float, nullable=False)  # Required by SRS
    hash_sha256: Mapped[str] = mapped_column(String(64), nullable=False)  # SHA-256 hash for integrity
    location: Mapped[Optional[Geometry]] = mapped_column(Geometry(geometry_type='POINT', srid=4326), nullable=True)  # PostGIS
    
    # Relationships
    inspection: Mapped["Inspection"] = relationship(back_populates="evidence")
    similarity_results_as_evidence: Mapped[List["EvidenceSimilarityResult"]] = relationship(
        back_populates="evidence", foreign_keys="EvidenceSimilarityResult.evidence_id"
    )
    similarity_results_as_matched: Mapped[List["EvidenceSimilarityResult"]] = relationship(
        back_populates="matched_evidence", foreign_keys="EvidenceSimilarityResult.matched_evidence_id"
    )
    
    # Indexes
    __table_args__ = (
        Index("idx_evidence_inspection", "inspection_id"),
        Index("idx_evidence_hash", "hash_sha256"),
        Index("idx_evidence_type", "evidence_type"),
        Index("idx_evidence_location", "location", postgresql_using='gist'),  # GiST index for PostGIS
        CheckConstraint("LENGTH(hash_sha256) = 64", name="check_sha256_length"),
    )
    
    def __repr__(self) -> str:
        return f"<Evidence(evidence_id={self.evidence_id}, type='{self.evidence_type.value}')>"


class EvidenceSimilarityResult(Base):
    """
    Core table: EvidenceSimilarityResult
    Exact SRS fields: similarity_id, evidence_id, matched_evidence_id, similarity_score, method, flagged
    """
    __tablename__ = "evidence_similarity_results"
    
    similarity_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    evidence_id: Mapped[int] = mapped_column(Integer, ForeignKey("evidence.evidence_id", ondelete="CASCADE"), nullable=False)
    matched_evidence_id: Mapped[int] = mapped_column(Integer, ForeignKey("evidence.evidence_id", ondelete="CASCADE"), nullable=False)
    similarity_score: Mapped[float] = mapped_column(Float, nullable=False)  # 0.0 - 1.0
    method: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g., "phash", "embedding"
    flagged: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Relationships
    evidence: Mapped["Evidence"] = relationship(
        back_populates="similarity_results_as_evidence", foreign_keys=[evidence_id]
    )
    matched_evidence: Mapped["Evidence"] = relationship(
        back_populates="similarity_results_as_matched", foreign_keys=[matched_evidence_id]
    )
    
    # Indexes
    __table_args__ = (
        Index("idx_similarity_evidence", "evidence_id"),
        Index("idx_similarity_matched", "matched_evidence_id"),
        Index("idx_similarity_flagged", "flagged"),
        CheckConstraint("similarity_score >= 0.0 AND similarity_score <= 1.0", name="check_similarity_score_range"),
        CheckConstraint("evidence_id != matched_evidence_id", name="check_no_self_match"),
    )
    
    def __repr__(self) -> str:
        return f"<EvidenceSimilarityResult(similarity_id={self.similarity_id}, score={self.similarity_score}, flagged={self.flagged})>"


class RiskScore(Base):
    """
    Core table: RiskScore
    Exact SRS fields: risk_score_id, inspection_id, score, risk_level, factors, confidence, computed_at
    Design decision: One-to-many relationship (historical risk scores preserved)
    """
    __tablename__ = "risk_scores"
    
    risk_score_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    inspection_id: Mapped[int] = mapped_column(Integer, ForeignKey("inspections.inspection_id", ondelete="CASCADE"), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)  # 0 - 100
    risk_level: Mapped[RiskLevel] = mapped_column(SQLEnum(RiskLevel), nullable=False)
    factors: Mapped[dict] = mapped_column(Text, nullable=False)  # JSON stored as text
    confidence: Mapped[float] = mapped_column(Float, nullable=False)  # 0.0 - 1.0
    computed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    inspection: Mapped["Inspection"] = relationship(back_populates="risk_scores")
    
    # Indexes
    __table_args__ = (
        Index("idx_risk_inspection", "inspection_id"),
        Index("idx_risk_level", "risk_level"),
        Index("idx_risk_score", "score"),
        CheckConstraint("score >= 0 AND score <= 100", name="check_risk_score_range"),
        CheckConstraint("confidence >= 0.0 AND confidence <= 1.0", name="check_confidence_range"),
    )
    
    @property
    def factors_dict(self) -> dict:
        """Parse factors JSON string to dictionary."""
        return json.loads(self.factors) if isinstance(self.factors, str) else self.factors
    
    @factors_dict.setter
    def factors_dict(self, value: dict):
        """Convert factors dictionary to JSON string."""
        self.factors = json.dumps(value) if not isinstance(value, str) else value
    
    def __repr__(self) -> str:
        return f"<RiskScore(risk_score_id={self.risk_score_id}, score={self.score}, level='{self.risk_level.value}')>"


class Complaint(Base):
    """
    Core table: Complaint
    Exact SRS fields: complaint_id, citizen_id, category, description, latitude, longitude, status
    """
    __tablename__ = "complaints"
    
    complaint_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    citizen_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)  # Required by SRS
    longitude: Mapped[float] = mapped_column(Float, nullable=False)  # Required by SRS
    status: Mapped[ComplaintStatus] = mapped_column(SQLEnum(ComplaintStatus), nullable=False, default=ComplaintStatus.PENDING)
    location: Mapped[Optional[Geometry]] = mapped_column(Geometry(geometry_type='POINT', srid=4326), nullable=True)  # PostGIS
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    citizen: Mapped["User"] = relationship(back_populates="complaints")
    tickets: Mapped[List["Ticket"]] = relationship(back_populates="complaint")
    
    # Indexes
    __table_args__ = (
        Index("idx_complaint_citizen", "citizen_id"),
        Index("idx_complaint_status", "status"),
        Index("idx_complaint_location", "location", postgresql_using='gist'),  # GiST index for PostGIS
    )
    
    def __repr__(self) -> str:
        return f"<Complaint(complaint_id={self.complaint_id}, category='{self.category}', status='{self.status.value}')>"


class Ticket(Base):
    """
    Core table: Ticket
    Exact SRS fields: ticket_id, complaint_id, inspection_id, owner_id, priority, status, created_at, sla_deadline
    Design decision: complaint_id and inspection_id are nullable to support both workflows
    """
    __tablename__ = "tickets"
    
    ticket_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    complaint_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("complaints.complaint_id", ondelete="SET NULL"), nullable=True)
    inspection_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("inspections.inspection_id", ondelete="SET NULL"), nullable=True)
    owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=1)  # 1=low, 2=medium, 3=high, 4=critical
    status: Mapped[TicketStatus] = mapped_column(SQLEnum(TicketStatus), nullable=False, default=TicketStatus.OPEN)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    sla_deadline: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Relationships
    complaint: Mapped[Optional["Complaint"]] = relationship(back_populates="tickets")
    inspection: Mapped[Optional["Inspection"]] = relationship(back_populates="tickets")
    owner: Mapped[Optional["User"]] = relationship(back_populates="owned_tickets")
    
    # Indexes
    __table_args__ = (
        Index("idx_ticket_complaint", "complaint_id"),
        Index("idx_ticket_inspection", "inspection_id"),
        Index("idx_ticket_owner", "owner_id"),
        Index("idx_ticket_status", "status"),
        Index("idx_ticket_sla", "sla_deadline"),
        CheckConstraint("(complaint_id IS NOT NULL) OR (inspection_id IS NOT NULL)", name="check_ticket_source"),
        CheckConstraint("priority >= 1 AND priority <= 4", name="check_priority_range"),
    )
    
    def __repr__(self) -> str:
        return f"<Ticket(ticket_id={self.ticket_id}, status='{self.status.value}', priority={self.priority})>"


class AuditEvent(Base):
    """
    Core table: AuditEvent
    Exact SRS fields: audit_id, entity, entity_id, action, actor_id, timestamp, before_state, after_state
    Append-only design: never update or delete audit records
    """
    __tablename__ = "audit_events"
    
    audit_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    entity: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g., "inspection", "evidence", "ticket"
    entity_id: Mapped[int] = mapped_column(Integer, nullable=False)  # ID of the entity being audited
    action: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g., "create", "update", "delete", "status_change"
    actor_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    before_state: Mapped[Optional[dict]] = mapped_column(Text, nullable=True)  # JSON stored as text
    after_state: Mapped[Optional[dict]] = mapped_column(Text, nullable=True)  # JSON stored as text
    
    # Relationships
    actor: Mapped[Optional["User"]] = relationship(back_populates="audit_events")
    
    # Indexes
    __table_args__ = (
        Index("idx_audit_entity", "entity", "entity_id"),
        Index("idx_audit_actor", "actor_id"),
        Index("idx_audit_timestamp", "timestamp"),
    )
    
    @property
    def before_state_dict(self) -> Optional[dict]:
        """Parse before_state JSON string to dictionary."""
        return json.loads(self.before_state) if self.before_state else None
    
    @before_state_dict.setter
    def before_state_dict(self, value: Optional[dict]):
        """Convert before_state dictionary to JSON string."""
        self.before_state = json.dumps(value) if value else None
    
    @property
    def after_state_dict(self) -> Optional[dict]:
        """Parse after_state JSON string to dictionary."""
        return json.loads(self.after_state) if self.after_state else None
    
    @after_state_dict.setter
    def after_state_dict(self, value: Optional[dict]):
        """Convert after_state dictionary to JSON string."""
        self.after_state = json.dumps(value) if value else None
    
    def __repr__(self) -> str:
        return f"<AuditEvent(audit_id={self.audit_id}, entity='{self.entity}', action='{self.action}')>"
