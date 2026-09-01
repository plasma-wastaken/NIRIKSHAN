"""
Tests for NIRIKSHAN spatial queries.
Note: These tests require PostgreSQL with PostGIS extension.
They are skipped when using SQLite for testing.
"""
import pytest
from unittest.mock import Mock, patch
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from database.models import Base
from database.queries import (
    InspectionQueries, SiteQueries, EvidenceQueries,
    TicketQueries, DashboardQueries, AuditQueries, UserQueries
)
from database.exceptions import SpatialQueryError



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


class TestInspectionQueries:
    """Tests for Inspection query methods."""
    
    def test_get_inspections_by_inspector(self, db_session):
        """Test getting inspections by inspector ID."""
        from database.models import Department, User, Site, Inspection, UserRole, InspectionStatus, SiteType
        
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
        
        inspections = InspectionQueries.get_inspections_by_inspector(db_session, user.user_id)
        
        assert len(inspections) == 2
        assert all(i.inspector_id == user.user_id for i in inspections)
    
    def test_get_inspections_by_site(self, db_session):
        """Test getting inspections by site ID."""
        from database.models import Department, User, Site, Inspection, UserRole, InspectionStatus, SiteType
        
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
        
        inspections = InspectionQueries.get_inspections_by_site(db_session, site.site_id)
        
        assert len(inspections) == 2
        assert all(i.site_id == site.site_id for i in inspections)
    
    @pytest.mark.skip(reason="Requires PostgreSQL with PostGIS")
    def test_check_inspection_geofence(self, db_session):
        """Test geofence check (requires PostGIS)."""
        # This test would require PostgreSQL with PostGIS
        pass
    
    @pytest.mark.skip(reason="Requires PostgreSQL with PostGIS")
    def test_calculate_inspection_to_site_distance(self, db_session):
        """Test distance calculation (requires PostGIS)."""
        # This test would require PostgreSQL with PostGIS
        pass


class TestSiteQueries:
    """Tests for Site query methods."""
    
    @pytest.mark.skip(reason="Requires PostgreSQL with PostGIS")
    def test_find_sites_near_point(self, db_session):
        """Test finding sites near a point (requires PostGIS)."""
        # This test would require PostgreSQL with PostGIS
        pass
    
    @pytest.mark.skip(reason="Requires PostgreSQL with PostGIS")
    def test_find_nearby_complaints(self, db_session):
        """Test finding nearby complaints (requires PostGIS)."""
        # This test would require PostgreSQL with PostGIS
        pass


class TestEvidenceQueries:
    """Tests for Evidence query methods."""
    
    def test_find_duplicate_reuse_evidence(self, db_session):
        """Test finding evidence with duplicate/reuse flags."""
        from database.models import (
            Department, User, Site, Inspection, Evidence, 
            EvidenceSimilarityResult, UserRole, InspectionStatus, 
            SiteType, EvidenceType
        )
        
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
        
        flagged_evidence = EvidenceQueries.find_duplicate_reuse_evidence(db_session)
        
        assert len(flagged_evidence) >= 1
        assert evidence1 in flagged_evidence
    
    def test_find_inspections_with_flagged_evidence(self, db_session):
        """Test finding inspections with flagged evidence."""
        from database.models import (
            Department, User, Site, Inspection, Evidence, 
            EvidenceSimilarityResult, UserRole, InspectionStatus, 
            SiteType, EvidenceType
        )
        
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
        
        flagged_inspections = EvidenceQueries.find_inspections_with_flagged_evidence(db_session)
        
        assert len(flagged_inspections) >= 1
        assert inspection in flagged_inspections


class TestTicketQueries:
    """Tests for Ticket query methods."""
    
    def test_find_open_tickets(self, db_session):
        """Test finding open tickets."""
        from database.models import User, Ticket, UserRole, TicketStatus
        
        user = User(
            full_name="Test User",
            email="user@example.com",
            password_hash="hash",
            role=UserRole.INSPECTOR
        )
        db_session.add(user)
        db_session.commit()
        
        ticket1 = Ticket(
            owner_id=user.user_id,
            priority=1,
            status=TicketStatus.OPEN
        )
        ticket2 = Ticket(
            owner_id=user.user_id,
            priority=2,
            status=TicketStatus.IN_PROGRESS
        )
        ticket3 = Ticket(
            owner_id=user.user_id,
            priority=1,
            status=TicketStatus.OPEN
        )
        db_session.add_all([ticket1, ticket2, ticket3])
        db_session.commit()
        
        open_tickets = TicketQueries.find_open_tickets(db_session)
        
        assert len(open_tickets) == 2
        assert all(t.status == TicketStatus.OPEN for t in open_tickets)
    
    def test_find_overdue_tickets(self, db_session):
        """Test finding overdue tickets."""
        from database.models import User, Ticket, UserRole, TicketStatus
        from datetime import datetime, timedelta
        
        user = User(
            full_name="Test User",
            email="user@example.com",
            password_hash="hash",
            role=UserRole.INSPECTOR
        )
        db_session.add(user)
        db_session.commit()
        
        # Overdue ticket
        overdue_ticket = Ticket(
            owner_id=user.user_id,
            priority=2,
            status=TicketStatus.OPEN,
            sla_deadline=datetime.utcnow() - timedelta(days=1)
        )
        
        # Non-overdue ticket
        future_ticket = Ticket(
            owner_id=user.user_id,
            priority=1,
            status=TicketStatus.OPEN,
            sla_deadline=datetime.utcnow() + timedelta(days=7)
        )
        
        db_session.add_all([overdue_ticket, future_ticket])
        db_session.commit()
        
        overdue_tickets = TicketQueries.find_overdue_tickets(db_session)
        
        assert len(overdue_tickets) == 1
        assert overdue_tickets[0].ticket_id == overdue_ticket.ticket_id


class TestDashboardQueries:
    """Tests for Dashboard query methods."""
    
    def test_get_inspection_counts(self, db_session):
        """Test getting inspection counts by status."""
        from database.models import (
            Department, User, Site, Inspection, UserRole, 
            InspectionStatus, SiteType
        )
        
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
        
        for status in [InspectionStatus.DRAFT, InspectionStatus.SUBMITTED, InspectionStatus.DRAFT]:
            inspection = Inspection(
                site_id=site.site_id,
                inspector_id=user.user_id,
                status=status,
                latitude=28.6139,
                longitude=77.2090
            )
            db_session.add(inspection)
        
        db_session.commit()
        
        counts = DashboardQueries.get_inspection_counts(db_session)
        
        assert counts.get("DRAFT") == 2
        assert counts.get("SUBMITTED") == 1
    
    def test_get_complaint_counts_by_status(self, db_session):
        """Test getting complaint counts by status."""
        from database.models import User, Complaint, UserRole, ComplaintStatus
        
        user = User(
            full_name="Test Citizen",
            email="citizen@example.com",
            password_hash="hash",
            role=UserRole.CITIZEN
        )
        db_session.add(user)
        db_session.commit()
        
        for status in [ComplaintStatus.PENDING, ComplaintStatus.PENDING, ComplaintStatus.RESOLVED]:
            complaint = Complaint(
                citizen_id=user.user_id,
                category="Test",
                description="Test complaint",
                latitude=28.6139,
                longitude=77.2090,
                status=status
            )
            db_session.add(complaint)
        
        db_session.commit()
        
        counts = DashboardQueries.get_complaint_counts_by_status(db_session)
        
        assert counts.get("PENDING") == 2
        assert counts.get("RESOLVED") == 1
    
    def test_get_ticket_counts_by_status(self, db_session):
        """Test getting ticket counts by status."""
        from database.models import User, Ticket, UserRole, TicketStatus
        
        user = User(
            full_name="Test User",
            email="user@example.com",
            password_hash="hash",
            role=UserRole.INSPECTOR
        )
        db_session.add(user)
        db_session.commit()
        
        for status in [TicketStatus.OPEN, TicketStatus.OPEN, TicketStatus.IN_PROGRESS]:
            ticket = Ticket(
                owner_id=user.user_id,
                priority=1,
                status=status
            )
            db_session.add(ticket)
        
        db_session.commit()
        
        counts = DashboardQueries.get_ticket_counts_by_status(db_session)
        
        assert counts.get("OPEN") == 2
        assert counts.get("IN_PROGRESS") == 1


class TestAuditQueries:
    """Tests for Audit query methods."""
    
    def test_get_audit_history(self, db_session):
        """Test getting audit history for an entity."""
        from database.models import User, AuditEvent, UserRole
        import json
        
        user = User(
            full_name="Test User",
            email="user@example.com",
            password_hash="hash",
            role=UserRole.INSPECTOR
        )
        db_session.add(user)
        db_session.commit()
        
        audit1 = AuditEvent(
            entity="inspection",
            entity_id=1,
            action="create",
            actor_id=user.user_id,
            after_state=json.dumps({"status": "DRAFT"})
        )
        audit2 = AuditEvent(
            entity="inspection",
            entity_id=1,
            action="update",
            actor_id=user.user_id,
            before_state=json.dumps({"status": "DRAFT"}),
            after_state=json.dumps({"status": "SUBMITTED"})
        )
        db_session.add_all([audit1, audit2])
        db_session.commit()
        
        audit_history = AuditQueries.get_audit_history(db_session, "inspection", 1)
        
        assert len(audit_history) == 2
        assert all(a.entity == "inspection" and a.entity_id == 1 for a in audit_history)
