"""
Tests for NIRIKSHAN database seed data.
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from database.models import Base, Department, User, Site, Inspection, Complaint, Ticket
from database.seed import seed_database


@pytest.fixture
def test_db():
    import os
    from sqlalchemy import text
    TEST_DB_URL = os.environ.get("TEST_DATABASE_URL", "postgresql+psycopg://postgres:postgres@localhost:5432/postgres?connect_timeout=2")
    engine = create_engine(TEST_DB_URL)
    try:
        with engine.connect() as conn:
            pass
    except Exception:
        pytest.skip("PostgreSQL not available")
    
    try:
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
            conn.commit()
    except Exception:
        pass

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


def test_seed_database(test_db):
    """Test that seed database runs without errors."""
    from sqlalchemy.orm import sessionmaker
    from database.database import Base, engine
    from database.models import Department, User, Site, Inspection, Complaint, Ticket
    
    # Mock the engine to use test database
    SessionLocal = sessionmaker(bind=test_db)
    
    # Import and patch the session
    import database.seed
    original_session = database.seed.SessionLocal
    database.seed.SessionLocal = SessionLocal
    
    try:
        # Run seed
        seed_database()
        
        # Verify data was created
        db = SessionLocal()
        
        # Check departments
        departments = db.query(Department).all()
        assert len(departments) == 3, f"Expected 3 departments, got {len(departments)}"
        
        # Check users
        users = db.query(User).all()
        assert len(users) >= 7, f"Expected at least 7 users, got {len(users)}"
        
        # Check sites
        sites = db.query(Site).all()
        assert len(sites) >= 9, f"Expected at least 9 sites, got {len(sites)}"
        
        # Check inspections
        inspections = db.query(Inspection).all()
        assert len(inspections) >= 6, f"Expected at least 6 inspections, got {len(inspections)}"
        
        # Check complaints
        complaints = db.query(Complaint).all()
        assert len(complaints) >= 3, f"Expected at least 3 complaints, got {len(complaints)}"
        
        # Check tickets
        tickets = db.query(Ticket).all()
        assert len(tickets) >= 3, f"Expected at least 3 tickets, got {len(tickets)}"
        
        db.close()
        
    finally:
        # Restore original session
        database.seed.SessionLocal = original_session


def test_seed_data_integrity(test_db):
    """Test that seeded data maintains referential integrity."""
    from sqlalchemy.orm import sessionmaker
    import database.seed
    
    SessionLocal = sessionmaker(bind=test_db)
    original_session = database.seed.SessionLocal
    database.seed.SessionLocal = SessionLocal
    
    try:
        seed_database()
        
        db = SessionLocal()
        
        # Check that all users have valid roles
        from database.models import UserRole
        users = db.query(User).all()
        for user in users:
            assert user.role in UserRole, f"User {user.email} has invalid role: {user.role}"
        
        # Check that all sites have valid departments
        sites = db.query(Site).all()
        for site in sites:
            assert site.department_id is not None, f"Site {site.name} has no department"
            dept = db.query(Department).filter(Department.department_id == site.department_id).first()
            assert dept is not None, f"Site {site.name} has invalid department_id"
        
        # Check that all inspections have valid sites and inspectors
        inspections = db.query(Inspection).all()
        for inspection in inspections:
            assert inspection.site_id is not None, f"Inspection {inspection.inspection_id} has no site"
            assert inspection.inspector_id is not None, f"Inspection {inspection.inspection_id} has no inspector"
            
            site = db.query(Site).filter(Site.site_id == inspection.site_id).first()
            assert site is not None, f"Inspection {inspection.inspection_id} has invalid site_id"
            
            inspector = db.query(User).filter(User.user_id == inspection.inspector_id).first()
            assert inspector is not None, f"Inspection {inspection.inspection_id} has invalid inspector_id"
        
        # Check that all complaints have valid citizens
        complaints = db.query(Complaint).all()
        for complaint in complaints:
            assert complaint.citizen_id is not None, f"Complaint {complaint.complaint_id} has no citizen"
            
            citizen = db.query(User).filter(User.user_id == complaint.citizen_id).first()
            assert citizen is not None, f"Complaint {complaint.complaint_id} has invalid citizen_id"
        
        db.close()
        
    finally:
        database.seed.SessionLocal = original_session


def test_seed_enum_values(test_db):
    """Test that seeded data uses correct enum values."""
    from sqlalchemy.orm import sessionmaker
    import database.seed
    from database.models import UserRole, InspectionStatus, RiskLevel, EvidenceType, TicketStatus, ComplaintStatus, SiteType
    
    SessionLocal = sessionmaker(bind=test_db)
    original_session = database.seed.SessionLocal
    database.seed.SessionLocal = SessionLocal
    
    try:
        seed_database()
        
        db = SessionLocal()
        
        # Check user roles
        users = db.query(User).all()
        for user in users:
            assert user.role in UserRole, f"Invalid user role: {user.role}"
        
        # Check inspection statuses
        inspections = db.query(Inspection).all()
        for inspection in inspections:
            assert inspection.status in InspectionStatus, f"Invalid inspection status: {inspection.status}"
        
        # Check risk levels
        from database.models import RiskScore
        risk_scores = db.query(RiskScore).all()
        for risk_score in risk_scores:
            assert risk_score.risk_level in RiskLevel, f"Invalid risk level: {risk_score.risk_level}"
        
        # Check evidence types
        from database.models import Evidence
        evidence = db.query(Evidence).all()
        for ev in evidence:
            assert ev.evidence_type in EvidenceType, f"Invalid evidence type: {ev.evidence_type}"
        
        # Check ticket statuses
        tickets = db.query(Ticket).all()
        for ticket in tickets:
            assert ticket.status in TicketStatus, f"Invalid ticket status: {ticket.status}"
        
        # Check complaint statuses
        complaints = db.query(Complaint).all()
        for complaint in complaints:
            assert complaint.status in ComplaintStatus, f"Invalid complaint status: {complaint.status}"
        
        # Check site types
        sites = db.query(Site).all()
        for site in sites:
            assert site.site_type in SiteType, f"Invalid site type: {site.site_type}"
        
        db.close()
        
    finally:
        database.seed.SessionLocal = original_session
