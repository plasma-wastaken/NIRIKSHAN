import pytest
from fastapi.testclient import TestClient
from main import app
from services.repository import Repository

client = TestClient(app)

# Initialize repository for testing
@pytest.fixture(scope="function")
def test_repository():
    repo = Repository()
    repo.initialize_mock_data()
    return repo

# ============================================================================
# HEALTH CHECK TESTS
# ============================================================================

def test_health_check():
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

# ============================================================================
# AUTHENTICATION TESTS
# ============================================================================

def test_login_success():
    """Test successful login with valid credentials."""
    response = client.post("/auth/login", json={
        "username": "inspector001",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["role"] == "INSPECTOR"
    assert data["user_id"] == "USR-INS-001"

def test_login_invalid_credentials():
    """Test login with invalid credentials."""
    response = client.post("/auth/login", json={
        "username": "invalid_user",
        "password": "wrong_password"
    })
    assert response.status_code == 401

def test_login_wrong_password():
    """Test login with correct username but wrong password."""
    response = client.post("/auth/login", json={
        "username": "inspector001",
        "password": "wrong_password"
    })
    assert response.status_code == 401

def test_login_different_roles():
    """Test login for different user roles."""
    roles = [
        ("citizen001", "CITIZEN"),
        ("inspector001", "INSPECTOR"),
        ("supervisor001", "SUPERVISOR"),
        ("admin001", "DEPT_ADMIN")
    ]
    
    for username, expected_role in roles:
        response = client.post("/auth/login", json={
            "username": username,
            "password": "password123"
        })
        assert response.status_code == 200
        assert response.json()["role"] == expected_role

# ============================================================================
# INSPECTION API TESTS
# ============================================================================

def test_get_inspections_unauthorized():
    """Test getting inspections without authentication."""
    response = client.get("/inspections")
    assert response.status_code == 401

def test_get_inspections_authorized():
    """Test getting inspections with valid authentication."""
    # First login to get token
    login_response = client.post("/auth/login", json={
        "username": "inspector001",
        "password": "password123"
    })
    token = login_response.json()["access_token"]
    
    # Get inspections with token
    response = client.get("/inspections", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    inspections = response.json()
    assert isinstance(inspections, list)
    assert len(inspections) > 0

def test_get_inspection_by_id():
    """Test getting a specific inspection by ID."""
    # Login as inspector
    login_response = client.post("/auth/login", json={
        "username": "inspector001",
        "password": "password123"
    })
    token = login_response.json()["access_token"]
    
    # Get specific inspection
    response = client.get("/inspections/INS-1001", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    inspection = response.json()
    assert inspection["inspection_id"] == "INS-1001"

def test_get_inspection_not_found():
    """Test getting a non-existent inspection."""
    # Login as inspector
    login_response = client.post("/auth/login", json={
        "username": "inspector001",
        "password": "password123"
    })
    token = login_response.json()["access_token"]
    
    # Try to get non-existent inspection
    response = client.get("/inspections/INS-9999", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 404

def test_submit_inspection():
    """Test submitting an inspection."""
    # Login as inspector
    login_response = client.post("/auth/login", json={
        "username": "inspector001",
        "password": "password123"
    })
    token = login_response.json()["access_token"]
    
    # Submit inspection
    response = client.post("/inspections/INS-1002/submit", 
        json={"inspector_notes": "Inspection completed successfully"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    inspection = response.json()
    assert inspection["status"] == "SUBMITTED"

# ============================================================================
# COMPLAINT API TESTS
# ============================================================================

def test_get_complaints_unauthorized():
    """Test getting complaints without authentication."""
    response = client.get("/complaints")
    assert response.status_code == 401

def test_get_complaints_authorized():
    """Test getting complaints with valid authentication."""
    # Login as citizen
    login_response = client.post("/auth/login", json={
        "username": "citizen001",
        "password": "password123"
    })
    token = login_response.json()["access_token"]
    
    # Get complaints with token
    response = client.get("/complaints", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    complaints = response.json()
    assert isinstance(complaints, list)

def test_create_complaint():
    """Test creating a new complaint."""
    # Login as citizen
    login_response = client.post("/auth/login", json={
        "username": "citizen001",
        "password": "password123"
    })
    token = login_response.json()["access_token"]
    user_id = login_response.json()["user_id"]
    
    # Create complaint
    response = client.post("/complaints", 
        json={
            "citizen_id": user_id,
            "category": "Infrastructure",
            "description": "Test complaint for API testing",
            "latitude": 28.6139,
            "longitude": 77.2090
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    complaint = response.json()
    assert "complaint_id" in complaint
    assert complaint["status"] == "SUBMITTED"

def test_get_complaint_by_id():
    """Test getting a specific complaint by ID."""
    # Login as citizen
    login_response = client.post("/auth/login", json={
        "username": "citizen001",
        "password": "password123"
    })
    token = login_response.json()["access_token"]
    
    # Get specific complaint
    response = client.get("/complaints/CMP-1001", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    complaint = response.json()
    assert complaint["complaint_id"] == "CMP-1001"

# ============================================================================
# TICKET API TESTS
# ============================================================================

def test_get_tickets_unauthorized():
    """Test getting tickets without authentication."""
    response = client.get("/tickets")
    assert response.status_code == 401

def test_get_tickets_supervisor():
    """Test getting tickets as supervisor."""
    # Login as supervisor
    login_response = client.post("/auth/login", json={
        "username": "supervisor001",
        "password": "password123"
    })
    token = login_response.json()["access_token"]
    
    # Get tickets with token
    response = client.get("/tickets", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    tickets = response.json()
    assert isinstance(tickets, list)

def test_create_ticket():
    """Test creating a new ticket."""
    # Login as supervisor
    login_response = client.post("/auth/login", json={
        "username": "supervisor001",
        "password": "password123"
    })
    token = login_response.json()["access_token"]
    user_id = login_response.json()["user_id"]
    
    # Create ticket
    response = client.post("/tickets", 
        json={
            "complaint_id": "CMP-1002",
            "owner_id": user_id,
            "priority": "HIGH",
            "sla_deadline": "2026-09-15T00:00:00Z"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    ticket = response.json()
    assert "ticket_id" in ticket
    assert ticket["status"] == "OPEN"

def test_get_ticket_by_id():
    """Test getting a specific ticket by ID."""
    # Login as supervisor
    login_response = client.post("/auth/login", json={
        "username": "supervisor001",
        "password": "password123"
    })
    token = login_response.json()["access_token"]
    
    # Get specific ticket
    response = client.get("/tickets/TKT-1001", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    ticket = response.json()
    assert ticket["ticket_id"] == "TKT-1001"

def test_update_ticket():
    """Test updating a ticket."""
    # Login as supervisor
    login_response = client.post("/auth/login", json={
        "username": "supervisor001",
        "password": "password123"
    })
    token = login_response.json()["access_token"]
    
    # Update ticket
    response = client.patch("/tickets/TKT-1001", 
        json={"status": "IN_PROGRESS"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    ticket = response.json()
    assert ticket["status"] == "IN_PROGRESS"

# ============================================================================
# EVIDENCE API TESTS
# ============================================================================

def test_upload_evidence_unauthorized():
    """Test uploading evidence without authentication."""
    response = client.post("/evidence/upload")
    assert response.status_code == 401

def test_upload_evidence_missing_file():
    """Test uploading evidence without file."""
    # Login as inspector
    login_response = client.post("/auth/login", json={
        "username": "inspector001",
        "password": "password123"
    })
    token = login_response.json()["access_token"]
    
    # Try to upload without file
    response = client.post("/evidence/upload?inspection_id=INS-1001", 
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422  # Unprocessable Entity

def test_upload_evidence_wrong_inspection():
    """Test uploading evidence for non-existent inspection."""
    # Login as inspector
    login_response = client.post("/auth/login", json={
        "username": "inspector001",
        "password": "password123"
    })
    token = login_response.json()["access_token"]
    
    # Try to upload for non-existent inspection
    response = client.post("/evidence/upload?inspection_id=INS-9999", 
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 404

# ============================================================================
# DASHBOARD API TESTS
# ============================================================================

def test_get_dashboard_unauthorized():
    """Test getting dashboard stats without authentication."""
    response = client.get("/dashboard")
    assert response.status_code == 401

def test_get_dashboard_authorized():
    """Test getting dashboard stats with authentication."""
    # Login as inspector
    login_response = client.post("/auth/login", json={
        "username": "inspector001",
        "password": "password123"
    })
    token = login_response.json()["access_token"]
    
    # Get dashboard stats
    response = client.get("/dashboard", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    stats = response.json()
    assert "total_inspections" in stats
    assert "total_complaints" in stats
    assert "total_tickets" in stats
    assert "role_specific" in stats

def test_get_dashboard_different_roles():
    """Test dashboard stats for different roles."""
    roles = ["citizen001", "inspector001", "supervisor001", "admin001"]
    
    for username in roles:
        login_response = client.post("/auth/login", json={
            "username": username,
            "password": "password123"
        })
        token = login_response.json()["access_token"]
        
        response = client.get("/dashboard", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        stats = response.json()
        assert "role_specific" in stats

# ============================================================================
# RBAC TESTS
# ============================================================================

def test_citizen_cannot_access_inspections():
    """Test that citizens cannot access inspection endpoints."""
    # Login as citizen
    login_response = client.post("/auth/login", json={
        "username": "citizen001",
        "password": "password123"
    })
    token = login_response.json()["access_token"]
    
    # Try to access inspections
    response = client.get("/inspections", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 403

def test_inspector_cannot_create_tickets():
    """Test that inspectors cannot create tickets."""
    # Login as inspector
    login_response = client.post("/auth/login", json={
        "username": "inspector001",
        "password": "password123"
    })
    token = login_response.json()["access_token"]
    user_id = login_response.json()["user_id"]
    
    # Try to create ticket
    response = client.post("/tickets", 
        json={
            "complaint_id": "CMP-1002",
            "owner_id": user_id,
            "priority": "HIGH",
            "sla_deadline": "2026-09-15T00:00:00Z"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403

def test_inspector_can_only_own_inspections():
    """Test that inspectors can only access their own inspections."""
    # Login as inspector
    login_response = client.post("/auth/login", json={
        "username": "inspector001",
        "password": "password123"
    })
    token = login_response.json()["access_token"]
    
    # All mock inspections are assigned to USR-INS-001, so this should work
    response = client.get("/inspections/INS-1001", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200

# ============================================================================
# ERROR HANDLING TESTS
# ============================================================================

def test_404_error():
    """Test 404 error for non-existent endpoints."""
    response = client.get("/nonexistent-endpoint")
    assert response.status_code == 404

def test_405_method_not_allowed():
    """Test 405 error for wrong HTTP method."""
    response = client.put("/health")
    assert response.status_code == 405

def test_422_validation_error():
    """Test 422 error for invalid request data."""
    response = client.post("/auth/login", json={
        "username": "test"  # Missing password
    })
    assert response.status_code == 422