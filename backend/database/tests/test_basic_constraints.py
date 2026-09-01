"""
Tests for NIRIKSHAN database constraints (non-spatial).
These tests use SQLite for portability and focus on non-spatial constraints.
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, ForeignKey, Enum as SQLEnum, CheckConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from enum import Enum as PyEnum
from datetime import datetime


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


# Simplified models with constraints
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
    __table_args__ = (
        CheckConstraint("LENGTH(hash_sha256) = 64", name="check_sha256_length"),
    )


class EvidenceSimilarityResult(Base):
    __tablename__ = "evidence_similarity_results"
    similarity_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    evidence_id: Mapped[int] = mapped_column(Integer, ForeignKey("evidence.evidence_id"), nullable=False)
    matched_evidence_id: Mapped[int] = mapped_column(Integer, ForeignKey("evidence.evidence_id"), nullable=False)
    similarity_score: Mapped[float] = mapped_column(Float, nullable=False)
    method: Mapped[str] = mapped_column(String(50), nullable=False)
    flagged: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    __table_args__ = (
        CheckConstraint("similarity_score >= 0.0 AND similarity_score <= 1.0", name="check_similarity_score_range"),
        CheckConstraint("evidence_id != matched_evidence_id", name="check_no_self_match"),
    )


class RiskScore(Base):
    __tablename__ = "risk_scores"
    risk_score_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    inspection_id: Mapped[int] = mapped_column(Integer, ForeignKey("inspections.inspection_id"), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    risk_level: Mapped[RiskLevel] = mapped_column(SQLEnum(RiskLevel), nullable=False)
    factors: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    computed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    __table_args__ = (
        CheckConstraint("score >= 0 AND score <= 100", name="check_risk_score_range"),
        CheckConstraint("confidence >= 0.0 AND confidence <= 1.0", name="check_confidence_range"),
    )


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
    __table_args__ = (
        CheckConstraint("(complaint_id IS NOT NULL) OR (inspection_id IS NOT NULL)", name="check_ticket_source"),
        CheckConstraint("priority >= 1 AND priority <= 4", name="check_priority_range"),
    )


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
class TestUserConstraints:
    """Tests for User table constraints."""
    
    def test_email_unique_constraint(self, db_session):
        """Test that email must be unique."""
        user1 = User(full_name="User 1", email="test@example.com", password_hash="hash1", role=UserRole.CITIZEN)
        user2 = User(full_name="User 2", email="test@example.com", password_hash="hash2", role=UserRole.CITIZEN)
        
        db_session.add(user1)
        db_session.commit()
        
        db_session.add(user2)
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_full_name_not_null(self, db_session):
        """Test that full_name cannot be null."""
        user = User(email="test@example.com", password_hash="hash", role=UserRole.CITIZEN)
        
        db_session.add(user)
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_email_not_null(self, db_session):
        """Test that email cannot be null."""
        user = User(full_name="Test User", password_hash="hash", role=UserRole.CITIZEN)
        
        db_session.add(user)
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_password_hash_not_null(self, db_session):
        """Test that password_hash cannot be null."""
        user = User(full_name="Test User", email="test@example.com", role=UserRole.CITIZEN)
        
        db_session.add(user)
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_role_not_null(self, db_session):
        """Test that role cannot be null."""
        user = User(full_name="Test User", email="test@example.com", password_hash="hash")
        
        db_session.add(user)
        with pytest.raises(IntegrityError):
            db_session.commit()


class TestEvidenceConstraints:
    """Tests for Evidence table constraints."""
    
    def test_sha256_length_constraint(self, db_session):
        """Test that hash_sha256 must be exactly 64 characters."""
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
        
        # Invalid SHA-256 length (too short)
        evidence = Evidence(
            inspection_id=inspection.inspection_id,
            file_path="/evidence/test.jpg",
            evidence_type=EvidenceType.PHOTO,
            latitude=28.6139,
            longitude=77.2090,
            hash_sha256="a" * 63  # Invalid length
        )
        
        db_session.add(evidence)
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_file_path_not_null(self, db_session):
        """Test that file_path cannot be null."""
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
            evidence_type=EvidenceType.PHOTO,
            latitude=28.6139,
            longitude=77.2090,
            hash_sha256="a" * 64
        )
        
        db_session.add(evidence)
        with pytest.raises(IntegrityError):
            db_session.commit()


class TestSimilarityResultConstraints:
    """Tests for EvidenceSimilarityResult table constraints."""
    
    def test_similarity_score_range_constraint(self, db_session):
        """Test that similarity_score must be between 0.0 and 1.0."""
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
        
        evidence1 = Evidence(
            inspection_id=inspection.inspection_id,
            file_path="/evidence/test1.jpg",
            evidence_type=EvidenceType.PHOTO,
            latitude=28.6139,
            longitude=77.2090,
            hash_sha256="a" * 64
        )
        evidence2 = Evidence(
            inspection_id=inspection.inspection_id,
            file_path="/evidence/test2.jpg",
            evidence_type=EvidenceType.PHOTO,
            latitude=28.6140,
            longitude=77.2091,
            hash_sha256="b" * 64
        )
        db_session.add_all([evidence1, evidence2])
        db_session.commit()
        
        # Invalid similarity score (too high)
        similarity = EvidenceSimilarityResult(
            evidence_id=evidence1.evidence_id,
            matched_evidence_id=evidence2.evidence_id,
            similarity_score=1.5,  # Invalid: > 1.0
            method="phash"
        )
        
        db_session.add(similarity)
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_no_self_match_constraint(self, db_session):
        """Test that evidence cannot match itself."""
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
            latitude=28.6139,
            longitude=77.2090,
            hash_sha256="a" * 64
        )
        db_session.add(evidence)
        db_session.commit()
        
        # Self-match (should fail constraint)
        similarity = EvidenceSimilarityResult(
            evidence_id=evidence.evidence_id,
            matched_evidence_id=evidence.evidence_id,  # Same evidence
            similarity_score=1.0,
            method="phash"
        )
        
        db_session.add(similarity)
        with pytest.raises(IntegrityError):
            db_session.commit()


class TestRiskScoreConstraints:
    """Tests for RiskScore table constraints."""
    
    def test_score_range_constraint(self, db_session):
        """Test that score must be between 0 and 100."""
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
        # Invalid score (too high)
        risk_score = RiskScore(
            inspection_id=inspection.inspection_id,
            score=150,  # Invalid: > 100
            risk_level=RiskLevel.HIGH,
            factors=json.dumps({}),
            confidence=0.9
        )
        
        db_session.add(risk_score)
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_confidence_range_constraint(self, db_session):
        """Test that confidence must be between 0.0 and 1.0."""
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
        # Invalid confidence (too high)
        risk_score = RiskScore(
            inspection_id=inspection.inspection_id,
            score=75,
            risk_level=RiskLevel.HIGH,
            factors=json.dumps({}),
            confidence=1.5  # Invalid: > 1.0
        )
        
        db_session.add(risk_score)
        with pytest.raises(IntegrityError):
            db_session.commit()


class TestTicketConstraints:
    """Tests for Ticket table constraints."""
    
    def test_ticket_source_constraint(self, db_session):
        """Test that ticket must have either complaint_id or inspection_id."""
        user = User(
            full_name="Test User",
            email="user@example.com",
            password_hash="hash",
            role=UserRole.INSPECTOR
        )
        db_session.add(user)
        db_session.commit()
        
        # Ticket without complaint_id or inspection_id (should fail)
        ticket = Ticket(
            owner_id=user.user_id,
            priority=1,
            status=TicketStatus.OPEN
        )
        
        db_session.add(ticket)
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_priority_range_constraint(self, db_session):
        """Test that priority must be between 1 and 4."""
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
        
        # Invalid priority (too high)
        ticket = Ticket(
            complaint_id=complaint.complaint_id,
            owner_id=user.user_id,
            priority=5,  # Invalid: > 4
            status=TicketStatus.OPEN
        )
        
        db_session.add(ticket)
        with pytest.raises(IntegrityError):
            db_session.commit()


class TestDepartmentConstraints:
    """Tests for Department table constraints."""
    
    def test_name_unique_constraint(self, db_session):
        """Test that department name must be unique."""
        dept1 = Department(name="Test Department")
        dept2 = Department(name="Test Department")
        
        db_session.add(dept1)
        db_session.commit()
        
        db_session.add(dept2)
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_name_not_null(self, db_session):
        """Test that name cannot be null."""
        dept = Department(description="Test description")
        
        db_session.add(dept)
        with pytest.raises(IntegrityError):
            db_session.commit()


class TestSiteConstraints:
    """Tests for Site table constraints."""
    
    def test_latitude_not_null(self, db_session):
        """Test that latitude cannot be null."""
        dept = Department(name="Test Department")
        db_session.add(dept)
        db_session.commit()
        
        site = Site(
            name="Test Site",
            site_type=SiteType.SCHOOL,
            longitude=77.2090,
            department_id=dept.department_id
        )
        
        db_session.add(site)
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_longitude_not_null(self, db_session):
        """Test that longitude cannot be null."""
        dept = Department(name="Test Department")
        db_session.add(dept)
        db_session.commit()
        
        site = Site(
            name="Test Site",
            site_type=SiteType.SCHOOL,
            latitude=28.6139,
            department_id=dept.department_id
        )
        
        db_session.add(site)
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_department_id_not_null(self, db_session):
        """Test that department_id cannot be null."""
        site = Site(
            name="Test Site",
            site_type=SiteType.SCHOOL,
            latitude=28.6139,
            longitude=77.2090
        )
        
        db_session.add(site)
        with pytest.raises(IntegrityError):
            db_session.commit()


class TestInspectionConstraints:
    """Tests for Inspection table constraints."""
    
    def test_latitude_not_null(self, db_session):
        """Test that latitude cannot be null."""
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
            longitude=77.2090
        )
        
        db_session.add(inspection)
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_longitude_not_null(self, db_session):
        """Test that longitude cannot be null."""
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
            latitude=28.6139
        )
        
        db_session.add(inspection)
        with pytest.raises(IntegrityError):
            db_session.commit()
