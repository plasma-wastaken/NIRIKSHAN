"""
Seed data for NIRIKSHAN database.
Creates realistic but completely fictional sample data for testing and demonstration.
Uses fictional Indian locations and data.
"""
import hashlib
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from geoalchemy2.elements import WKTElement

from database.database import SessionLocal, Base, engine
from database.models import (
    Department, User, Site, Inspection, Evidence, 
    EvidenceSimilarityResult, RiskScore, Complaint, Ticket, AuditEvent,
    UserRole, InspectionStatus, RiskLevel, EvidenceType, 
    TicketStatus, ComplaintStatus, SiteType, ActiveStatus
)
from database.repositories import (
    DepartmentRepository, UserRepository, SiteRepository, InspectionRepository,
    EvidenceRepository, SimilarityResultRepository, RiskScoreRepository,
    ComplaintRepository, TicketRepository, AuditEventRepository
)


def hash_password(password: str) -> str:
    """Simple password hashing for seed data (not for production)."""
    return hashlib.sha256(password.encode()).hexdigest()


def create_departments(db: Session) -> dict:
    """Create fictional departments."""
    print("Creating departments...")
    
    departments = {}
    
    dept_data = [
        ("Education", "Department of School Education"),
        ("Food Safety", "Food Safety and Standards Authority"),
        ("Social Welfare", "Department of Social Welfare")
    ]
    
    for name, description in dept_data:
        dept = DepartmentRepository.create(db, name, description)
        departments[name] = dept
        print(f"  Created department: {name}")
    
    return departments


def create_users(db: Session, departments: dict) -> dict:
    """Create fictional users."""
    print("Creating users...")
    
    users = {}
    
    # Citizens
    citizens_data = [
        ("Rajesh Kumar", "rajesh.kumar@email.com", UserRole.CITIZEN, None),
        ("Priya Sharma", "priya.sharma@email.com", UserRole.CITIZEN, None),
        ("Amit Patel", "amit.patel@email.com", UserRole.CITIZEN, None)
    ]
    
    for full_name, email, role, dept_id in citizens_data:
        user = UserRepository.create(
            db, full_name, email, hash_password("password123"), role, dept_id
        )
        users[email] = user
        print(f"  Created citizen: {full_name}")
    
    # Inspectors
    inspectors_data = [
        ("Ravi Singh", "ravi.singh@email.com", UserRole.INSPECTOR, departments["Education"].department_id),
        ("Sneha Reddy", "sneha.reddy@email.com", UserRole.INSPECTOR, departments["Food Safety"].department_id),
        ("Vikram Joshi", "vikram.joshi@email.com", UserRole.INSPECTOR, departments["Social Welfare"].department_id)
    ]
    
    for full_name, email, role, dept_id in inspectors_data:
        user = UserRepository.create(
            db, full_name, email, hash_password("password123"), role, dept_id
        )
        users[email] = user
        print(f"  Created inspector: {full_name}")
    
    # Supervisor
    supervisor = UserRepository.create(
        db, "Anil Mehta", "anil.mehta@email.com", hash_password("password123"),
        UserRole.SUPERVISOR, departments["Education"].department_id
    )
    users["anil.mehta@email.com"] = supervisor
    print(f"  Created supervisor: Anil Mehta")
    
    # Overall Admin (combines features of DEPT_ADMIN and GOVT_ADMIN)
    admin = UserRepository.create(
        db, "Rajesh Gupta", "rajesh.gupta@email.com", hash_password("password123"),
        UserRole.ADMIN, None
    )
    users["rajesh.gupta@email.com"] = admin
    print(f"  Created overall admin: Rajesh Gupta")
    
    return users


def create_sites(db: Session, departments: dict) -> dict:
    """Create fictional sites with Indian locations."""
    print("Creating sites...")
    
    sites = {}
    
    # Education sites (schools)
    education_sites = [
        ("Delhi Public School", SiteType.SCHOOL, 28.6139, 77.2090, "Sector 4, Dwarka, New Delhi"),
        ("Kendriya Vidyalaya", SiteType.SCHOOL, 19.0760, 72.8777, "Andheri East, Mumbai"),
        ("St. Xavier's School", SiteType.SCHOOL, 12.9716, 77.5946, "Richmond Road, Bangalore")
    ]
    
    for name, site_type, lat, lon, address in education_sites:
        site = SiteRepository.create(
            db, name, site_type, lat, lon, departments["Education"].department_id, address
        )
        sites[name] = site
        print(f"  Created education site: {name}")
    
    # Food Safety sites (restaurants)
    food_sites = [
        ("Spice Garden Restaurant", SiteType.RESTAURANT, 28.6279, 77.2087, "Connaught Place, New Delhi"),
        ("Coastal Kitchen", SiteType.RESTAURANT, 19.0302, 72.8476, "Juhu, Mumbai"),
        ("Royal Mughal", SiteType.RESTAURANT, 13.0827, 80.2707, "T. Nagar, Chennai")
    ]
    
    for name, site_type, lat, lon, address in food_sites:
        site = SiteRepository.create(
            db, name, site_type, lat, lon, departments["Food Safety"].department_id, address
        )
        sites[name] = site
        print(f"  Created food safety site: {name}")
    
    # Social Welfare sites
    welfare_sites = [
        ("City Community Center", SiteType.WELFARE_CENTER, 26.9124, 75.7873, "Raja Park, Jaipur"),
        ("Women's Shelter Home", SiteType.WELFARE_CENTER, 22.5726, 88.3639, "Kolkata"),
        ("Senior Citizen Home", SiteType.WELFARE_CENTER, 17.3850, 78.4867, "Hyderabad")
    ]
    
    for name, site_type, lat, lon, address in welfare_sites:
        site = SiteRepository.create(
            db, name, site_type, lat, lon, departments["Social Welfare"].department_id, address
        )
        sites[name] = site
        print(f"  Created welfare site: {name}")
    
    return sites


def create_inspections(db: Session, users: dict, sites: dict) -> dict:
    """Create fictional inspections."""
    print("Creating inspections...")
    
    inspections = {}
    
    inspection_data = [
        # Education inspections
        (sites["Delhi Public School"], users["ravi.singh@email.com"], InspectionStatus.SUBMITTED, 
         28.6140, 77.2091, datetime.utcnow() - timedelta(days=5)),
        (sites["Kendriya Vidyalaya"], users["ravi.singh@email.com"], InspectionStatus.APPROVED,
         19.0761, 72.8778, datetime.utcnow() - timedelta(days=10)),
        
        # Food Safety inspections
        (sites["Spice Garden Restaurant"], users["sneha.reddy@email.com"], InspectionStatus.SUBMITTED,
         28.6280, 77.2088, datetime.utcnow() - timedelta(days=2)),
        (sites["Coastal Kitchen"], users["sneha.reddy@email.com"], InspectionStatus.UNDER_REVIEW,
         19.0303, 72.8477, datetime.utcnow() - timedelta(days=1)),
        
        # Social Welfare inspections
        (sites["City Community Center"], users["vikram.joshi@email.com"], InspectionStatus.APPROVED,
         26.9125, 75.7874, datetime.utcnow() - timedelta(days=15)),
        (sites["Women's Shelter Home"], users["vikram.joshi@email.com"], InspectionStatus.IN_PROGRESS,
         22.5727, 88.3640, datetime.utcnow() - timedelta(hours=6))
    ]
    
    for site, inspector, status, lat, lon, started_at in inspection_data:
        inspection = InspectionRepository.create(
            db, site.site_id, inspector.user_id, lat, lon, status
        )
        inspection.started_at = started_at
        if status in [InspectionStatus.SUBMITTED, InspectionStatus.APPROVED]:
            inspection.submitted_at = started_at + timedelta(hours=2)
        db.commit()
        inspections[f"{site.name}_{inspector.full_name}"] = inspection
        print(f"  Created inspection: {site.name} by {inspector.full_name}")
    
    return inspections


def create_evidence(db: Session, inspections: dict) -> dict:
    """Create fictional evidence."""
    print("Creating evidence...")
    
    evidence_items = {}
    
    # Generate SHA-256 hashes for evidence
    def generate_hash(evidence_id: int) -> str:
        return hashlib.sha256(f"evidence_{evidence_id}".encode()).hexdigest()
    
    evidence_data = []
    inspection_list = list(inspections.values())
    
    # Create evidence for first few inspections
    for i, inspection in enumerate(inspection_list[:4]):
        # Add 2-3 evidence items per inspection
        for j in range(2):
            lat_offset = 0.0001 * j
            lon_offset = 0.0001 * j
            
            evidence = EvidenceRepository.create(
                db,
                inspection.inspection_id,
                f"/evidence/insp_{inspection.inspection_id}_ev_{j+1}.jpg",
                EvidenceType.PHOTO,
                inspection.latitude + lat_offset,
                inspection.longitude + lon_offset,
                generate_hash(i * 10 + j)
            )
            evidence_items[f"ev_{i}_{j}"] = evidence
            print(f"  Created evidence: {evidence.file_path}")
    
    return evidence_items


def create_similarity_results(db: Session, evidence_items: dict) -> None:
    """Create fictional similarity results for duplicate detection."""
    print("Creating similarity results...")
    
    evidence_list = list(evidence_items.values())
    
    # Create some similarity results
    if len(evidence_list) >= 2:
        # Flag first two evidence items as similar
        similarity = SimilarityResultRepository.create(
            db,
            evidence_list[0].evidence_id,
            evidence_list[1].evidence_id,
            0.85,  # High similarity
            "phash",
            flagged=True
        )
        print(f"  Created similarity result: evidence {evidence_list[0].evidence_id} matches {evidence_list[1].evidence_id}")
    
    if len(evidence_list) >= 4:
        # Create non-flagged similarity
        similarity = SimilarityResultRepository.create(
            db,
            evidence_list[2].evidence_id,
            evidence_list[3].evidence_id,
            0.45,  # Lower similarity
            "embedding",
            flagged=False
        )
        print(f"  Created similarity result: evidence {evidence_list[2].evidence_id} matches {evidence_list[3].evidence_id}")


def create_risk_scores(db: Session, inspections: dict) -> None:
    """Create fictional risk scores."""
    print("Creating risk scores...")
    
    inspection_list = list(inspections.values())
    
    risk_data = [
        (inspection_list[0], 25, RiskLevel.LOW, {"gps_mismatch": 0.1, "duration": 0.2}, 0.8),
        (inspection_list[1], 75, RiskLevel.HIGH, {"gps_mismatch": 0.8, "repeated_evidence": 0.6}, 0.9),
        (inspection_list[2], 90, RiskLevel.CRITICAL, {"gps_mismatch": 0.9, "short_duration": 0.7, "repeated_evidence": 0.8}, 0.95),
        (inspection_list[3], 45, RiskLevel.MEDIUM, {"duration": 0.5}, 0.7),
    ]
    
    for inspection, score, risk_level, factors, confidence in risk_data:
        risk_score = RiskScoreRepository.create(
            db,
            inspection.inspection_id,
            score,
            risk_level,
            factors,
            confidence
        )
        print(f"  Created risk score: {score} ({risk_level.value}) for inspection {inspection.inspection_id}")


def create_complaints(db: Session, users: dict) -> dict:
    """Create fictional complaints."""
    print("Creating complaints...")
    
    complaints = {}
    
    citizen_emails = ["rajesh.kumar@email.com", "priya.sharma@email.com", "amit.patel@email.com"]
    
    complaint_data = [
        (users[citizen_emails[0]], "Food Safety", "Restaurant not maintaining hygiene standards", 
         28.6280, 77.2088),
        (users[citizen_emails[1]], "Education", "School building in poor condition", 
         19.0761, 72.8778),
        (users[citizen_emails[2]], "Social Welfare", "Welfare center not providing proper services", 
         26.9125, 75.7874)
    ]
    
    for citizen, category, description, lat, lon in complaint_data:
        complaint = ComplaintRepository.create(
            db, citizen.user_id, category, description, lat, lon
        )
        complaints[f"{citizen.full_name}_{category}"] = complaint
        print(f"  Created complaint: {category} by {citizen.full_name}")
    
    return complaints


def create_tickets(db: Session, users: dict, complaints: dict, inspections: dict) -> None:
    """Create fictional tickets."""
    print("Creating tickets...")
    
    # Ticket from complaint
    complaint_ticket = TicketRepository.create(
        db,
        users["sneha.reddy@email.com"].user_id,
        priority=2,
        complaint_id=list(complaints.values())[0].complaint_id,
        sla_deadline=datetime.utcnow() + timedelta(days=7)
    )
    print(f"  Created ticket from complaint: {complaint_ticket.ticket_id}")
    
    # Ticket from inspection
    inspection_ticket = TicketRepository.create(
        db,
        users["ravi.singh@email.com"].user_id,
        priority=3,
        inspection_id=list(inspections.values())[0].inspection_id,
        sla_deadline=datetime.utcnow() + timedelta(days=3)
    )
    print(f"  Created ticket from inspection: {inspection_ticket.ticket_id}")
    
    # Overdue ticket
    overdue_ticket = TicketRepository.create(
        db,
        users["vikram.joshi@email.com"].user_id,
        priority=2,
        complaint_id=list(complaints.values())[1].complaint_id,
        sla_deadline=datetime.utcnow() - timedelta(days=1)  # Already overdue
    )
    print(f"  Created overdue ticket: {overdue_ticket.ticket_id}")


def create_audit_events(db: Session, users: dict) -> None:
    """Create fictional audit events."""
    print("Creating audit events...")
    
    admin = users["rajesh.gupta@email.com"]
    
    # Create various audit events
    audit_data = [
        ("inspection", 1, "create", admin.user_id, None, {"status": "DRAFT"}),
        ("inspection", 1, "update", admin.user_id, {"status": "DRAFT"}, {"status": "SUBMITTED"}),
        ("evidence", 1, "create", admin.user_id, None, {"evidence_type": "PHOTO"}),
        ("risk_score", 1, "create", admin.user_id, None, {"score": 25, "risk_level": "LOW"}),
        ("complaint", 1, "create", admin.user_id, None, {"status": "PENDING"}),
        ("ticket", 1, "create", admin.user_id, None, {"status": "OPEN", "priority": 2}),
    ]
    
    for entity, entity_id, action, actor_id, before_state, after_state in audit_data:
        audit_event = AuditEventRepository.create(
            db, entity, entity_id, action, actor_id, before_state, after_state
        )
        print(f"  Created audit event: {action} on {entity} {entity_id}")


def seed_database():
    """Main function to seed the database with sample data."""
    print("Starting database seeding...")
    print("=" * 50)
    
    db = SessionLocal()
    
    try:
        # Create data in dependency order
        departments = create_departments(db)
        users = create_users(db, departments)
        sites = create_sites(db, departments)
        inspections = create_inspections(db, users, sites)
        evidence_items = create_evidence(db, inspections)
        create_similarity_results(db, evidence_items)
        create_risk_scores(db, inspections)
        complaints = create_complaints(db, users)
        create_tickets(db, users, complaints, inspections)
        create_audit_events(db, users)
        
        print("=" * 50)
        print("Database seeding completed successfully!")
        print("\nSummary:")
        print(f"  Departments: {len(departments)}")
        print(f"  Users: {len(users)}")
        print(f"  Sites: {len(sites)}")
        print(f"  Inspections: {len(inspections)}")
        print(f"  Evidence items: {len(evidence_items)}")
        print(f"  Complaints: {len(complaints)}")
        
    except Exception as e:
        print(f"Error during seeding: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
