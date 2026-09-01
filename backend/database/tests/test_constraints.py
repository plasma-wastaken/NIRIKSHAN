"""
Tests for NIRIKSHAN database constraints.
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database.models import (
    Base, Department, User, Site, Inspection, Evidence,
    EvidenceSimilarityResult, RiskScore, Ticket, Complaint,
    UserRole, InspectionStatus, RiskLevel, EvidenceType,
    TicketStatus, SiteType
)



import os
import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

TEST_DB_URL = os.environ.get('TEST_DATABASE_URL', 'postgresql+psycopg://postgres:postgres@localhost:5432/postgres?connect_timeout=2')

@pytest.fixture
def in_memory_db():
    engine = create_engine(TEST_DB_URL)
    try:
        with engine.connect() as conn:
            pass
    except Exception:
        pytest.skip("PostgreSQL not available")
    
    from database.models import Base
    try:
        # Need to create postgis extension if not exists
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
            conn.commit()
    except Exception:
        pass

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)



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


class TestUserConstraints:
    """Tests for User table constraints."""
    
    def test_email_unique_constraint(self, db_session):
        """Test that email must be unique."""
        user1 = User(
            full_name="User 1",
            email="test@example.com",
            password_hash="hash1",
            role=UserRole.CITIZEN
        )
        user2 = User(
            full_name="User 2",
            email="test@example.com",
            password_hash="hash2",
            role=UserRole.CITIZEN
        )
        
        db_session.add(user1)
        db_session.commit()
        
        db_session.add(user2)
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_full_name_not_null(self, db_session):
        """Test that full_name cannot be null."""
        user = User(
            email="test@example.com",
            password_hash="hash",
            role=UserRole.CITIZEN
        )
        
        db_session.add(user)
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_email_not_null(self, db_session):
        """Test that email cannot be null."""
        user = User(
            full_name="Test User",
            password_hash="hash",
            role=UserRole.CITIZEN
        )
        
        db_session.add(user)
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_password_hash_not_null(self, db_session):
        """Test that password_hash cannot be null."""
        user = User(
            full_name="Test User",
            email="test@example.com",
            role=UserRole.CITIZEN
        )
        
        db_session.add(user)
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_role_not_null(self, db_session):
        """Test that role cannot be null."""
        user = User(
            full_name="Test User",
            email="test@example.com",
            password_hash="hash"
        )
        
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
