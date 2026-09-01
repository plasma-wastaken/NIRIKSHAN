"""
Basic tests for NIRIKSHAN database models without spatial functionality.
These tests use SQLite for portability and focus on non-spatial functionality.
"""
import pytest
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from typing import Optional
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from enum import Enum as PyEnum


class Base(DeclarativeBase):
    pass


# Enums
class UserRole(PyEnum):
    CITIZEN = "CITIZEN"
    INSPECTOR = "INSPECTOR"
    SUPERVISOR = "SUPERVISOR"
    ADMIN = "ADMIN"


class InspectionStatus(PyEnum):
    DRAFT = "DRAFT"
    IN_PROGRESS = "IN_PROGRESS"
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class SiteType(PyEnum):
    SCHOOL = "SCHOOL"
    RESTAURANT = "RESTAURANT"
    HOSPITAL = "HOSPITAL"
    WELFARE_CENTER = "WELFARE_CENTER"
    OTHER = "OTHER"


class EvidenceType(PyEnum):
    PHOTO = "PHOTO"
    VIDEO = "VIDEO"


class RiskLevel(PyEnum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class TicketStatus(PyEnum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"


class ComplaintStatus(PyEnum):
    PENDING = "PENDING"
    UNDER_INVESTIGATION = "UNDER_INVESTIGATION"
    RESOLVED = "RESOLVED"
    DISMISSED = "DISMISSED"


# Simplified models without spatial columns
class Department(Base):
    __tablename__ = "departments"
    department_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class User(Base):
    __tablename__ = "users"
    user_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), nullable=False)
    department_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("departments.department_id"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class Site(Base):
    __tablename__ = "sites"
    site_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    site_type: Mapped[SiteType] = mapped_column(SQLEnum(SiteType), nullable=False)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    department_id: Mapped[int] = mapped_column(Integer, ForeignKey("departments.department_id"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class Inspection(Base):
    __tablename__ = "inspections"
    inspection_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    site_id: Mapped[int] = mapped_column(Integer, ForeignKey("sites.site_id"), nullable=False)
    inspector_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id"), nullable=False)
    status: Mapped[InspectionStatus] = mapped_column(SQLEnum(InspectionStatus), nullable=False, default=InspectionStatus.DRAFT)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)


class Evidence(Base):
    __tablename__ = "evidence"
    evidence_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    inspection_id: Mapped[int] = mapped_column(Integer, ForeignKey("inspections.inspection_id"), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    evidence_type: Mapped[EvidenceType] = mapped_column(SQLEnum(EvidenceType), nullable=False)
    captured_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    hash_sha256: Mapped[str] = mapped_column(String(64), nullable=False)


class RiskScore(Base):
    __tablename__ = "risk_scores"
    risk_score_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    inspection_id: Mapped[int] = mapped_column(Integer, ForeignKey("inspections.inspection_id"), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    risk_level: Mapped[RiskLevel] = mapped_column(SQLEnum(RiskLevel), nullable=False)
    factors: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    computed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class Complaint(Base):
    __tablename__ = "complaints"
    complaint_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    citizen_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id"), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[ComplaintStatus] = mapped_column(SQLEnum(ComplaintStatus), nullable=False, default=ComplaintStatus.PENDING)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class Ticket(Base):
    __tablename__ = "tickets"
    ticket_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    complaint_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("complaints.complaint_id"), nullable=True)
    inspection_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("inspections.inspection_id"), nullable=True)
    owner_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.user_id"), nullable=True)
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    status: Mapped[TicketStatus] = mapped_column(SQLEnum(TicketStatus), nullable=False, default=TicketStatus.OPEN)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    sla_deadline: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)


class AuditEvent(Base):
    __tablename__ = "audit_events"
    audit_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    entity: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_id: Mapped[int] = mapped_column(Integer, nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    actor_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.user_id"), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    before_state: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    after_state: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


# Fixtures
@pytest.fixture
def in_memory_db():
    """Create an in-memory SQLite database for testing."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    return engine


@pytest.fixture
def db_session(in_memory_db):
    """Create a database session for testing."""
    from sqlalchemy.orm import sessionmaker
    SessionLocal = sessionmaker(bind=in_memory_db)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


# Tests
class TestDepartmentModel:
    """Tests for Department model."""
    
    def test_create_department(self, db_session):
        """Test creating a department."""
        dept = Department(name="Test Department", description="Test description")
        db_session.add(dept)
        db_session.commit()
        
        assert dept.department_id is not None
        assert dept.name == "Test Department"
        assert dept.description == "Test description"
        assert dept.created_at is not None
        assert dept.updated_at is not None
    
    def test_department_unique_name(self, db_session):
        """Test that department names must be unique."""
        dept1 = Department(name="Test Department")
        dept2 = Department(name="Test Department")
        
        db_session.add(dept1)
        db_session.commit()
        
        db_session.add(dept2)
        with pytest.raises(Exception):  # IntegrityError
            db_session.commit()


class TestUserModel:
    """Tests for User model."""
    
    def test_create_user(self, db_session):
        """Test creating a user."""
        dept = Department(name="Test Department")
        db_session.add(dept)
        db_session.commit()
        
        user = User(
            full_name="Test User",
            email="test@example.com",
            password_hash="hashed_password",
            role=UserRole.INSPECTOR,
            department_id=dept.department_id
        )
        db_session.add(user)
        db_session.commit()
        
        assert user.user_id is not None
        assert user.email == "test@example.com"
        assert user.role == UserRole.INSPECTOR
        assert user.is_active is True
    
    def test_user_unique_email(self, db_session):
        """Test that user emails must be unique."""
        user1 = User(full_name="User 1", email="test@example.com", password_hash="hash1", role=UserRole.CITIZEN)
        user2 = User(full_name="User 2", email="test@example.com", password_hash="hash2", role=UserRole.CITIZEN)
        
        db_session.add(user1)
        db_session.commit()
        
        db_session.add(user2)
        with pytest.raises(Exception):  # IntegrityError
            db_session.commit()
    
    def test_user_role_enum(self, db_session):
        """Test that user role uses correct enum values."""
        for role in UserRole:
            user = User(
                full_name=f"User {role.value}",
                email=f"{role.value.lower()}@example.com",
                password_hash="hash",
                role=role
            )
            db_session.add(user)
        
        db_session.commit()
        assert db_session.query(User).count() == len(UserRole)


class TestSiteModel:
    """Tests for Site model."""
    
    def test_create_site(self, db_session):
        """Test creating a site."""
        dept = Department(name="Test Department")
        db_session.add(dept)
        db_session.commit()
        
        site = Site(
            name="Test Site",
            site_type=SiteType.SCHOOL,
            latitude=28.6139,
            longitude=77.2090,
            department_id=dept.department_id
        )
        db_session.add(site)
        db_session.commit()
        
        assert site.site_id is not None
        assert site.name == "Test Site"
        assert site.site_type == SiteType.SCHOOL
        assert site.latitude == 28.6139
        assert site.longitude == 77.2090
        assert site.is_active is True


class TestInspectionModel:
    """Tests for Inspection model."""
    
    def test_create_inspection(self, db_session):
        """Test creating an inspection."""
        dept = Department(name="Test Department")
        db_session.add(dept)
        db_session.commit()
        
        user = User(
            full_name="Test Inspector",
            email="inspector@example.com",
            password_hash="hash",
            role=UserRole.INSPECTOR,
            department_id=dept.department_id
        )
        db_session.add(user)
        db_session.commit()
        
        site = Site(
            name="Test Site",
            site_type=SiteType.SCHOOL,
            latitude=28.6139,
            longitude=77.2090,
            department_id=dept.department_id
        )
        db_session.add(site)
        db_session.commit()
        
        inspection = Inspection(
            site_id=site.site_id,
            inspector_id=user.user_id,
            status=InspectionStatus.DRAFT,
            latitude=28.6140,
            longitude=77.2091
        )
        db_session.add(inspection)
        db_session.commit()
        
        assert inspection.inspection_id is not None
        assert inspection.status == InspectionStatus.DRAFT
        assert inspection.latitude == 28.6140
        assert inspection.longitude == 77.2091


class TestEvidenceModel:
    """Tests for Evidence model."""
    
    def test_create_evidence(self, db_session):
        """Test creating evidence."""
        dept = Department(name="Test Department")
        db_session.add(dept)
        db_session.commit()
        
        user = User(
            full_name="Test Inspector",
            email="inspector@example.com",
            password_hash="hash",
            role=UserRole.INSPECTOR,
            department_id=dept.department_id
        )
        db_session.add(user)
        db_session.commit()
        
        site = Site(
            name="Test Site",
            site_type=SiteType.SCHOOL,
            latitude=28.6139,
            longitude=77.2090,
            department_id=dept.department_id
        )
        db_session.add(site)
        db_session.commit()
        
        inspection = Inspection(
            site_id=site.site_id,
            inspector_id=user.user_id,
            status=InspectionStatus.IN_PROGRESS,
            latitude=28.6139,
            longitude=77.2090
        )
        db_session.add(inspection)
        db_session.commit()
        
        evidence = Evidence(
            inspection_id=inspection.inspection_id,
            file_path="/evidence/test.jpg",
            evidence_type=EvidenceType.PHOTO,
            latitude=28.6140,
            longitude=77.2091,
            hash_sha256="a" * 64
        )
        db_session.add(evidence)
        db_session.commit()
        
        assert evidence.evidence_id is not None
        assert evidence.evidence_type == EvidenceType.PHOTO
        assert evidence.hash_sha256 == "a" * 64


class TestRiskScoreModel:
    """Tests for RiskScore model."""
    
    def test_create_risk_score(self, db_session):
        """Test creating a risk score."""
        dept = Department(name="Test Department")
        db_session.add(dept)
        db_session.commit()
        
        user = User(
            full_name="Test Inspector",
            email="inspector@example.com",
            password_hash="hash",
            role=UserRole.INSPECTOR,
            department_id=dept.department_id
        )
        db_session.add(user)
        db_session.commit()
        
        site = Site(
            name="Test Site",
            site_type=SiteType.SCHOOL,
            latitude=28.6139,
            longitude=77.2090,
            department_id=dept.department_id
        )
        db_session.add(site)
        db_session.commit()
        
        inspection = Inspection(
            site_id=site.site_id,
            inspector_id=user.user_id,
            status=InspectionStatus.SUBMITTED,
            latitude=28.6139,
            longitude=77.2090
        )
        db_session.add(inspection)
        db_session.commit()
        
        import json
        risk_score = RiskScore(
            inspection_id=inspection.inspection_id,
            score=75,
            risk_level=RiskLevel.HIGH,
            factors=json.dumps({"gps_mismatch": 0.8}),
            confidence=0.9
        )
        db_session.add(risk_score)
        db_session.commit()
        
        assert risk_score.risk_score_id is not None
        assert risk_score.score == 75
        assert risk_score.risk_level == RiskLevel.HIGH
        assert risk_score.confidence == 0.9


class TestComplaintModel:
    """Tests for Complaint model."""
    
    def test_create_complaint(self, db_session):
        """Test creating a complaint."""
        user = User(
            full_name="Test Citizen",
            email="citizen@example.com",
            password_hash="hash",
            role=UserRole.CITIZEN
        )
        db_session.add(user)
        db_session.commit()
        
        complaint = Complaint(
            citizen_id=user.user_id,
            category="Test Category",
            description="Test complaint description",
            latitude=28.6139,
            longitude=77.2090,
            status=ComplaintStatus.PENDING
        )
        db_session.add(complaint)
        db_session.commit()
        
        assert complaint.complaint_id is not None
        assert complaint.category == "Test Category"
        assert complaint.status == ComplaintStatus.PENDING


class TestTicketModel:
    """Tests for Ticket model."""
    
    def test_create_ticket_from_complaint(self, db_session):
        """Test creating a ticket from a complaint."""
        user = User(
            full_name="Test User",
            email="user@example.com",
            password_hash="hash",
            role=UserRole.INSPECTOR
        )
        db_session.add(user)
        db_session.commit()
        
        citizen = User(
            full_name="Test Citizen",
            email="citizen@example.com",
            password_hash="hash",
            role=UserRole.CITIZEN
        )
        db_session.add(citizen)
        db_session.commit()
        
        complaint = Complaint(
            citizen_id=citizen.user_id,
            category="Test",
            description="Test complaint",
            latitude=28.6139,
            longitude=77.2090
        )
        db_session.add(complaint)
        db_session.commit()
        
        ticket = Ticket(
            complaint_id=complaint.complaint_id,
            owner_id=user.user_id,
            priority=2,
            status=TicketStatus.OPEN
        )
        db_session.add(ticket)
        db_session.commit()
        
        assert ticket.ticket_id is not None
        assert ticket.complaint_id == complaint.complaint_id
        assert ticket.status == TicketStatus.OPEN


class TestAuditEventModel:
    """Tests for AuditEvent model."""
    
    def test_create_audit_event(self, db_session):
        """Test creating an audit event."""
        user = User(
            full_name="Test User",
            email="user@example.com",
            password_hash="hash",
            role=UserRole.INSPECTOR
        )
        db_session.add(user)
        db_session.commit()
        
        import json
        audit_event = AuditEvent(
            entity="inspection",
            entity_id=1,
            action="create",
            actor_id=user.user_id,
            before_state=None,
            after_state=json.dumps({"status": "DRAFT"})
        )
        db_session.add(audit_event)
        db_session.commit()
        
        assert audit_event.audit_id is not None
        assert audit_event.entity == "inspection"
        assert audit_event.action == "create"
        assert audit_event.timestamp is not None
