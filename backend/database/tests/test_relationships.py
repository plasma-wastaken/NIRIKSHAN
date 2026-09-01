"""
Tests for NIRIKSHAN database relationships and foreign key integrity.
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from database.models import (
    Base, Department, User, Site, Inspection, Evidence,
    EvidenceSimilarityResult, RiskScore, Complaint, Ticket, AuditEvent,
    UserRole, InspectionStatus, RiskLevel, EvidenceType,
    TicketStatus, ComplaintStatus, SiteType
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


class TestDepartmentRelationships:
    """Tests for Department relationships."""
    
    def test_department_users_relationship(self, db_session):
        """Test Department -> Users relationship."""
        dept = Department(name="Test Department")
        db_session.add(dept)
        db_session.commit()
        
        user1 = User(
            full_name="User 1",
            email="user1@example.com",
            password_hash="hash",
            role=UserRole.INSPECTOR,
            department_id=dept.department_id
        )
        user2 = User(
            full_name="User 2",
            email="user2@example.com",
            password_hash="hash",
            role=UserRole.INSPECTOR,
            department_id=dept.department_id
        )
        db_session.add_all([user1, user2])
        db_session.commit()
        
        assert len(dept.users) == 2
        assert dept.users[0].department == dept
    
    def test_department_sites_relationship(self, db_session):
        """Test Department -> Sites relationship."""
        dept = Department(name="Test Department")
        db_session.add(dept)
        db_session.commit()
        
        site1 = Site(
            name="Site 1",
            site_type=SiteType.SCHOOL,
            latitude=28.6139,
            longitude=77.2090,
            department_id=dept.department_id
        )
        site2 = Site(
            name="Site 2",
            site_type=SiteType.RESTAURANT,
            latitude=28.6140,
            longitude=77.2091,
            department_id=dept.department_id
        )
        db_session.add_all([site1, site2])
        db_session.commit()
        
        assert len(dept.sites) == 2
        assert dept.sites[0].department == dept


class TestUserRelationships:
    """Tests for User relationships."""
    
    def test_user_department_relationship(self, db_session):
        """Test User -> Department relationship."""
        dept = Department(name="Test Department")
        db_session.add(dept)
        db_session.commit()
        
        user = User(
            full_name="Test User",
            email="user@example.com",
            password_hash="hash",
            role=UserRole.INSPECTOR,
            department_id=dept.department_id
        )
        db_session.add(user)
        db_session.commit()
        
        assert user.department == dept
        assert user in dept.users
    
    def test_user_inspections_relationship(self, db_session):
        """Test User -> Inspections relationship."""
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
        
        inspection1 = Inspection(
            site_id=site.site_id,
            inspector_id=user.user_id,
            status=InspectionStatus.DRAFT,
            latitude=28.6139,
            longitude=77.2090
        )
        inspection2 = Inspection(
            site_id=site.site_id,
            inspector_id=user.user_id,
            status=InspectionStatus.IN_PROGRESS,
            latitude=28.6140,
            longitude=77.2091
        )
        db_session.add_all([inspection1, inspection2])
        db_session.commit()
        
        assert len(user.inspections_as_inspector) == 2
        assert user.inspections_as_inspector[0].inspector == user
    
    def test_user_complaints_relationship(self, db_session):
        """Test User -> Complaints relationship."""
        user = User(
            full_name="Test Citizen",
            email="citizen@example.com",
            password_hash="hash",
            role=UserRole.CITIZEN
        )
        db_session.add(user)
        db_session.commit()
        
        complaint1 = Complaint(
            citizen_id=user.user_id,
            category="Category 1",
            description="Complaint 1",
            latitude=28.6139,
            longitude=77.2090
        )
        complaint2 = Complaint(
            citizen_id=user.user_id,
            category="Category 2",
            description="Complaint 2",
            latitude=28.6140,
            longitude=77.2091
        )
        db_session.add_all([complaint1, complaint2])
        db_session.commit()
        
        assert len(user.complaints) == 2
        assert user.complaints[0].citizen == user


class TestSiteRelationships:
    """Tests for Site relationships."""
    
    def test_site_inspections_relationship(self, db_session):
        """Test Site -> Inspections relationship."""
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
        
        inspection1 = Inspection(
            site_id=site.site_id,
            inspector_id=user.user_id,
            status=InspectionStatus.DRAFT,
            latitude=28.6139,
            longitude=77.2090
        )
        inspection2 = Inspection(
            site_id=site.site_id,
            inspector_id=user.user_id,
            status=InspectionStatus.SUBMITTED,
            latitude=28.6140,
            longitude=77.2091
        )
        db_session.add_all([inspection1, inspection2])
        db_session.commit()
        
        assert len(site.inspections) == 2
        assert site.inspections[0].site == site


class TestInspectionRelationships:
    """Tests for Inspection relationships."""
    
    def test_inspection_evidence_relationship(self, db_session):
        """Test Inspection -> Evidence relationship."""
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
        
        assert len(inspection.evidence) == 2
        assert inspection.evidence[0].inspection == inspection
    
    def test_inspection_risk_scores_relationship(self, db_session):
        """Test Inspection -> RiskScores relationship."""
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
        risk_score1 = RiskScore(
            inspection_id=inspection.inspection_id,
            score=50,
            risk_level=RiskLevel.MEDIUM,
            factors=json.dumps({}),
            confidence=0.8
        )
        risk_score2 = RiskScore(
            inspection_id=inspection.inspection_id,
            score=75,
            risk_level=RiskLevel.HIGH,
            factors=json.dumps({}),
            confidence=0.9
        )
        db_session.add_all([risk_score1, risk_score2])
        db_session.commit()
        
        assert len(inspection.risk_scores) == 2
        assert inspection.risk_scores[0].inspection == inspection


class TestEvidenceRelationships:
    """Tests for Evidence relationships."""
    
    def test_evidence_similarity_results_relationship(self, db_session):
        """Test Evidence -> EvidenceSimilarityResult relationship."""
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
        
        similarity = EvidenceSimilarityResult(
            evidence_id=evidence1.evidence_id,
            matched_evidence_id=evidence2.evidence_id,
            similarity_score=0.85,
            method="phash",
            flagged=True
        )
        db_session.add(similarity)
        db_session.commit()
        
        assert len(evidence1.similarity_results_as_evidence) == 1
        assert evidence1.similarity_results_as_evidence[0].evidence == evidence1
        assert len(evidence2.similarity_results_as_matched) == 1
        assert evidence2.similarity_results_as_matched[0].matched_evidence == evidence2


class TestComplaintRelationships:
    """Tests for Complaint relationships."""
    
    def test_complaint_tickets_relationship(self, db_session):
        """Test Complaint -> Tickets relationship."""
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
        
        ticket1 = Ticket(
            complaint_id=complaint.complaint_id,
            owner_id=user.user_id,
            priority=2,
            status=TicketStatus.OPEN
        )
        ticket2 = Ticket(
            complaint_id=complaint.complaint_id,
            owner_id=user.user_id,
            priority=1,
            status=TicketStatus.IN_PROGRESS
        )
        db_session.add_all([ticket1, ticket2])
        db_session.commit()
        
        assert len(complaint.tickets) == 2
        assert complaint.tickets[0].complaint == complaint


class TestTicketRelationships:
    """Tests for Ticket relationships."""
    
    def test_ticket_inspection_relationship(self, db_session):
        """Test Ticket -> Inspection relationship."""
        dept = Department(name="Test Department")
        db_session.add(dept)
        db_session.commit()
        
        user = User(
            full_name="Test User",
            email="user@example.com",
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
        
        ticket = Ticket(
            inspection_id=inspection.inspection_id,
            owner_id=user.user_id,
            priority=2,
            status=TicketStatus.OPEN
        )
        db_session.add(ticket)
        db_session.commit()
        
        assert ticket.inspection == inspection
    
    def test_ticket_owner_relationship(self, db_session):
        """Test Ticket -> Owner relationship."""
        user = User(
            full_name="Test User",
            email="user@example.com",
            password_hash="hash",
            role=UserRole.INSPECTOR
        )
        db_session.add(user)
        db_session.commit()
        
        ticket = Ticket(
            owner_id=user.user_id,
            priority=1,
            status=TicketStatus.OPEN
        )
        db_session.add(ticket)
        db_session.commit()
        
        assert ticket.owner == user
        assert ticket in user.owned_tickets


class TestAuditEventRelationships:
    """Tests for AuditEvent relationships."""
    
    def test_audit_event_actor_relationship(self, db_session):
        """Test AuditEvent -> Actor relationship."""
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
            after_state=json.dumps({"status": "DRAFT"})
        )
        db_session.add(audit_event)
        db_session.commit()
        
        assert audit_event.actor == user
        assert audit_event in user.audit_events


class TestForeignKeyIntegrity:
    """Tests for foreign key integrity constraints."""
    
    def test_cascade_delete_inspection_evidence(self, db_session):
        """Test CASCADE delete from Inspection to Evidence."""
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
        
        evidence_id = evidence.evidence_id
        db_session.delete(inspection)
        db_session.commit()
        
        # Evidence should be cascade deleted
        assert db_session.query(Evidence).filter(Evidence.evidence_id == evidence_id).first() is None
    
    def test_restrict_delete_site_inspection(self, db_session):
        """Test RESTRICT delete from Site to Inspection."""
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
            latitude=28.6139,
            longitude=77.2090
        )
        db_session.add(inspection)
        db_session.commit()
        
        # Should not be able to delete site with existing inspections
        with pytest.raises(Exception):  # IntegrityError
            db_session.delete(site)
            db_session.commit()
