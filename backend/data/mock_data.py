from datetime import datetime, timedelta
from typing import Dict, List, Any
import uuid

# ============================================================================
# MOCK USERS
# ============================================================================

MOCK_USERS = {
    "USR-INS-001": {
        "user_id": "USR-INS-001",
        "username": "inspector001",
        "password": "password123",  # In production, this would be hashed
        "name": "Jane Doe",
        "email": "jane.doe@nirikshan.gov.in",
        "phone": "+91 98100 00001",
        "role": "INSPECTOR",
        "account_status": "ACTIVE",
        "avatar_url": None,
        "joined_at": "2024-03-15T09:00:00Z"
    },
    "USR-SUP-001": {
        "user_id": "USR-SUP-001",
        "username": "supervisor001",
        "password": "password123",
        "name": "Rajesh Kumar",
        "email": "rajesh.kumar@nirikshan.gov.in",
        "phone": "+91 98100 00002",
        "role": "SUPERVISOR",
        "account_status": "ACTIVE",
        "avatar_url": None,
        "joined_at": "2023-11-01T09:00:00Z"
    },
    "USR-ADM-001": {
        "user_id": "USR-ADM-001",
        "username": "admin001",
        "password": "password123",
        "name": "Priya Sharma",
        "email": "admin@nirikshan.gov.in",
        "phone": "+91 98100 00003",
        "role": "DEPT_ADMIN",
        "account_status": "ACTIVE",
        "avatar_url": None,
        "joined_at": "2023-06-20T09:00:00Z"
    },
    "USR-CIT-001": {
        "user_id": "USR-CIT-001",
        "username": "citizen001",
        "password": "password123",
        "name": "Meera Pillai",
        "email": "meera.pillai@example.com",
        "phone": "+91 98100 00005",
        "role": "CITIZEN",
        "account_status": "ACTIVE",
        "avatar_url": None,
        "joined_at": "2025-02-14T09:00:00Z"
    }
}

# ============================================================================
# MOCK INSPECTIONS
# ============================================================================

MOCK_INSPECTIONS = [
    {
        "inspection_id": "INS-1001",
        "site_id": "SITE-802",
        "inspector_id": "USR-INS-001",
        "status": "ASSIGNED",
        "started_at": None,
        "submitted_at": None,
        "latitude": 28.7041,
        "longitude": 77.1025,
        "created_at": "2023-10-27T08:00:00Z",
        "site_name": "Sector 12 Construction",
        "address": "Sector 12, Industrial Area Phase II, New Delhi",
        "risk_level": "UNASSESSED",
        "scheduled_date": "2023-10-27T10:00:00Z",
        "inspector_notes": None,
        "supervisor_notes": None
    },
    {
        "inspection_id": "INS-1002",
        "site_id": "SITE-415",
        "inspector_id": "USR-INS-001",
        "status": "IN_PROGRESS",
        "started_at": "2023-10-27T13:35:00Z",
        "submitted_at": None,
        "latitude": 28.6139,
        "longitude": 77.2090,
        "created_at": "2023-10-27T12:00:00Z",
        "site_name": "Riverside Block B",
        "address": "Riverside Construction Block B, New Delhi",
        "risk_level": "UNASSESSED",
        "scheduled_date": "2023-10-27T13:30:00Z",
        "inspector_notes": None,
        "supervisor_notes": None
    },
    {
        "inspection_id": "INS-1003",
        "site_id": "SITE-911",
        "inspector_id": "USR-INS-001",
        "status": "SUBMITTED",
        "started_at": "2023-10-26T15:10:00Z",
        "submitted_at": "2023-10-26T16:45:00Z",
        "latitude": 28.6505,
        "longitude": 77.2303,
        "created_at": "2023-10-26T14:00:00Z",
        "site_name": "Central Market Complex",
        "address": "Central Market Commercial Complex, New Delhi",
        "risk_level": "HIGH",
        "scheduled_date": "2023-10-26T15:00:00Z",
        "inspector_notes": "Structural concerns found in main building",
        "supervisor_notes": None
    },
    {
        "inspection_id": "INS-1004",
        "site_id": "SITE-204",
        "inspector_id": "USR-INS-001",
        "status": "COMPLETED",
        "started_at": "2023-10-26T09:05:00Z",
        "submitted_at": "2023-10-26T10:30:00Z",
        "latitude": 28.5355,
        "longitude": 77.2410,
        "created_at": "2023-10-26T08:00:00Z",
        "site_name": "Govt School Expansion",
        "address": "Govt School Expansion Project, South Delhi",
        "risk_level": "LOW",
        "scheduled_date": "2023-10-26T09:00:00Z",
        "inspector_notes": "All compliance requirements met",
        "supervisor_notes": "Approved for completion"
    }
]

# ============================================================================
# MOCK COMPLAINTS
# ============================================================================

MOCK_COMPLAINTS = [
    {
        "complaint_id": "CMP-1001",
        "citizen_id": "USR-CIT-001",
        "category": "Road / Infrastructure",
        "description": "Deep pothole on main road causing accidents during rain.",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "status": "IN_PROGRESS",
        "created_at": "2026-08-20T10:30:00Z",
        "ticket_id": "TKT-1001",
        "inspection_id": "INS-1001",
        "evidence_files": []
    },
    {
        "complaint_id": "CMP-1002",
        "citizen_id": "USR-CIT-001",
        "category": "Sanitation",
        "description": "Garbage not collected for 3 days in residential area.",
        "latitude": 28.6200,
        "longitude": 77.2100,
        "status": "UNDER_REVIEW",
        "created_at": "2026-08-25T14:15:00Z",
        "ticket_id": None,
        "inspection_id": None,
        "evidence_files": []
    },
    {
        "complaint_id": "CMP-1003",
        "citizen_id": "USR-CIT-001",
        "category": "Public Safety",
        "description": "Street lights not working on 4th Avenue.",
        "latitude": 28.6300,
        "longitude": 77.2200,
        "status": "RESOLVED",
        "created_at": "2026-08-10T09:00:00Z",
        "ticket_id": "TKT-0950",
        "inspection_id": None,
        "evidence_files": []
    }
]

# ============================================================================
# MOCK TICKETS
# ============================================================================

MOCK_TICKETS = [
    {
        "ticket_id": "TKT-1001",
        "complaint_id": "CMP-1001",
        "inspection_id": "INS-1001",
        "owner_id": "USR-SUP-001",
        "priority": "HIGH",
        "status": "IN_PROGRESS",
        "created_at": "2026-08-20T11:00:00Z",
        "sla_deadline": "2026-09-01T00:00:00Z",
        "updated_at": "2026-08-25T15:00:00Z"
    },
    {
        "ticket_id": "TKT-0950",
        "complaint_id": "CMP-1003",
        "inspection_id": None,
        "owner_id": "USR-SUP-001",
        "priority": "MEDIUM",
        "status": "RESOLVED",
        "created_at": "2026-08-10T10:00:00Z",
        "sla_deadline": "2026-08-20T00:00:00Z",
        "updated_at": "2026-08-15T12:00:00Z"
    }
]

# ============================================================================
# MOCK EVIDENCE
# ============================================================================

MOCK_EVIDENCE = [
    {
        "evidence_id": "EV-1001",
        "inspection_id": "INS-1003",
        "file_path": "/uploads/evidence_EV-1001.jpg",
        "evidence_type": "PHOTO",
        "captured_at": "2023-10-26T15:15:00Z",
        "latitude": 28.6505,
        "longitude": 77.2303,
        "hash_sha256": "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
        "created_at": "2023-10-26T15:20:00Z"
    }
]

# ============================================================================
# MOCK RISK SCORES
# ============================================================================

MOCK_RISK_SCORES = [
    {
        "risk_score_id": "RS-1001",
        "inspection_id": "INS-1003",
        "score": 85.5,
        "risk_level": "HIGH",
        "factors": {
            "structural_integrity": 30.0,
            "safety_violations": 25.5,
            "material_quality": 20.0,
            "workmanship": 10.0
        },
        "confidence": 0.92,
        "computed_at": "2023-10-26T17:00:00Z"
    },
    {
        "risk_score_id": "RS-1002",
        "inspection_id": "INS-1004",
        "score": 15.0,
        "risk_level": "LOW",
        "factors": {
            "structural_integrity": 5.0,
            "safety_violations": 2.0,
            "material_quality": 4.0,
            "workmanship": 4.0
        },
        "confidence": 0.95,
        "computed_at": "2023-10-26T11:00:00Z"
    }
]

# ============================================================================
# MOCK AUDIT EVENTS
# ============================================================================

MOCK_AUDIT_EVENTS = [
    {
        "audit_id": "AUD-1001",
        "entity": "complaint",
        "entity_id": "CMP-1001",
        "action": "created",
        "actor_id": "USR-CIT-001",
        "timestamp": "2026-08-20T10:30:00Z",
        "before_state": None,
        "after_state": {"status": "SUBMITTED", "category": "Road / Infrastructure"}
    },
    {
        "audit_id": "AUD-1002",
        "entity": "ticket",
        "entity_id": "TKT-1001",
        "action": "created",
        "actor_id": "USR-SUP-001",
        "timestamp": "2026-08-20T11:00:00Z",
        "before_state": None,
        "after_state": {"status": "OPEN", "priority": "HIGH"}
    },
    {
        "audit_id": "AUD-1003",
        "entity": "inspection",
        "entity_id": "INS-1003",
        "action": "submitted",
        "actor_id": "USR-INS-001",
        "timestamp": "2023-10-26T16:45:00Z",
        "before_state": {"status": "IN_PROGRESS"},
        "after_state": {"status": "SUBMITTED", "inspector_notes": "Structural concerns found in main building"}
    }
]

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def generate_id(prefix: str) -> str:
    """Generate a unique ID with the given prefix."""
    return f"{prefix}-{int(datetime.now().timestamp())}"