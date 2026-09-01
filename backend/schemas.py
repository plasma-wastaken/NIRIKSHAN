from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

# ============================================================================
# ENUMS - Exact SRS values
# ============================================================================

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class EvidenceType(str, Enum):
    PHOTO = "PHOTO"
    VIDEO = "VIDEO"
    AUDIO = "AUDIO"
    DOCUMENT = "DOCUMENT"

class TicketStatus(str, Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"

class UserRole(str, Enum):
    CITIZEN = "CITIZEN"
    INSPECTOR = "INSPECTOR"
    SUPERVISOR = "SUPERVISOR"
    DEPT_ADMIN = "DEPT_ADMIN"
    GOVT_ADMIN = "GOVT_ADMIN"

class InspectionStatus(str, Enum):
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    SUBMITTED = "SUBMITTED"
    COMPLETED = "COMPLETED"
    APPROVED = "APPROVED"
    RETURNED = "RETURNED"
    FLAGGED = "FLAGGED"

class ComplaintStatus(str, Enum):
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class TicketPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"

# ============================================================================
# AUTHENTICATION SCHEMAS
# ============================================================================

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    email: str
    role: UserRole

# ============================================================================
# INSPECTION SCHEMAS
# ============================================================================

class InspectionBase(BaseModel):
    site_id: str
    inspector_id: str
    status: InspectionStatus
    started_at: Optional[datetime] = None
    submitted_at: Optional[datetime] = None
    latitude: float
    longitude: float

class InspectionCreate(InspectionBase):
    pass

class InspectionUpdate(BaseModel):
    status: Optional[InspectionStatus] = None
    started_at: Optional[datetime] = None
    submitted_at: Optional[datetime] = None
    inspector_notes: Optional[str] = None
    supervisor_notes: Optional[str] = None

class InspectionResponse(InspectionBase):
    inspection_id: str
    created_at: datetime
    
    # Additional fields for UI (not in base SRS but needed for frontend)
    site_name: Optional[str] = None
    address: Optional[str] = None
    risk_level: Optional[RiskLevel] = None
    scheduled_date: Optional[datetime] = None
    inspector_notes: Optional[str] = None
    supervisor_notes: Optional[str] = None

class InspectionSubmit(BaseModel):
    inspector_notes: Optional[str] = None

# ============================================================================
# EVIDENCE SCHEMAS
# ============================================================================

class EvidenceBase(BaseModel):
    inspection_id: str
    file_path: str
    evidence_type: EvidenceType
    captured_at: datetime
    latitude: float
    longitude: float
    hash_sha256: str

class EvidenceCreate(BaseModel):
    inspection_id: str
    evidence_type: EvidenceType
    captured_at: datetime
    latitude: float
    longitude: float

class EvidenceResponse(EvidenceBase):
    evidence_id: str
    created_at: datetime

class EvidenceUploadResponse(BaseModel):
    evidence_id: str
    inspection_id: str
    file_path: str
    evidence_type: EvidenceType
    captured_at: datetime
    latitude: float
    longitude: float
    hash_sha256: str

# ============================================================================
# EVIDENCE SIMILARITY SCHEMAS
# ============================================================================

class EvidenceSimilarityResult(BaseModel):
    similarity_id: str
    evidence_id: str
    matched_evidence_id: str
    similarity_score: float
    method: str
    flagged: bool
    created_at: datetime

# ============================================================================
# RISK SCORE SCHEMAS
# ============================================================================

class RiskScoreBase(BaseModel):
    inspection_id: str
    score: float
    risk_level: RiskLevel
    factors: Dict[str, float]
    confidence: float

class RiskScoreResponse(RiskScoreBase):
    risk_score_id: str
    computed_at: datetime

# ============================================================================
# COMPLAINT SCHEMAS
# ============================================================================

class ComplaintBase(BaseModel):
    citizen_id: str
    category: str
    description: str
    latitude: float
    longitude: float
    status: ComplaintStatus

class ComplaintCreate(BaseModel):
    citizen_id: str
    category: str
    description: str
    latitude: float
    longitude: float

class ComplaintUpdate(BaseModel):
    status: Optional[ComplaintStatus] = None
    category: Optional[str] = None
    description: Optional[str] = None

class ComplaintResponse(ComplaintBase):
    complaint_id: str
    created_at: datetime
    
    # Additional fields for relationships
    ticket_id: Optional[str] = None
    inspection_id: Optional[str] = None
    evidence_files: List[EvidenceResponse] = []

# ============================================================================
# TICKET SCHEMAS
# ============================================================================

class TicketBase(BaseModel):
    complaint_id: str
    inspection_id: Optional[str] = None
    owner_id: str
    priority: TicketPriority
    status: TicketStatus
    created_at: datetime
    sla_deadline: datetime

class TicketCreate(BaseModel):
    complaint_id: str
    inspection_id: Optional[str] = None
    owner_id: str
    priority: TicketPriority
    sla_deadline: datetime

class TicketUpdate(BaseModel):
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    owner_id: Optional[str] = None

class TicketResponse(TicketBase):
    ticket_id: str
    updated_at: Optional[datetime] = None

# ============================================================================
# AUDIT EVENT SCHEMAS
# ============================================================================

class AuditEventBase(BaseModel):
    entity: str
    entity_id: str
    action: str
    actor_id: str
    timestamp: datetime
    before_state: Optional[Dict[str, Any]] = None
    after_state: Optional[Dict[str, Any]] = None

class AuditEventCreate(BaseModel):
    entity: str
    entity_id: str
    action: str
    actor_id: str
    before_state: Optional[Dict[str, Any]] = None
    after_state: Optional[Dict[str, Any]] = None

class AuditEventResponse(AuditEventBase):
    audit_id: str

# ============================================================================
# DASHBOARD SCHEMAS
# ============================================================================

class DashboardStats(BaseModel):
    total_inspections: int
    total_complaints: int
    total_tickets: int
    pending_inspections: int
    high_risk_inspections: int
    open_tickets: int

class RoleDashboardStats(DashboardStats):
    role_specific: Dict[str, Any] = {}

# ============================================================================
# ERROR RESPONSE SCHEMAS
# ============================================================================

class ErrorResponse(BaseModel):
    detail: str
    status_code: int
    error_type: str

class ValidationErrorResponse(BaseModel):
    detail: List[Dict[str, Any]]