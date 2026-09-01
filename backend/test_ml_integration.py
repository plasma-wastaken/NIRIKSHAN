"""
Test script for ML integration endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Health check: {response.status_code} - {response.json()}")

def test_login():
    """Test login and get token"""
    print("\nTesting login...")
    login_data = {
        "username": "supervisor001",
        "password": "password123"
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if response.status_code == 200:
        token = response.json()["access_token"]
        print(f"Login successful! Token: {token[:20]}...")
        return token
    else:
        print(f"Login failed: {response.status_code} - {response.text}")
        return None

def test_ml_models_status(token):
    """Test ML models status endpoint"""
    print("\nTesting ML models status...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/ml/models/status", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    else:
        print(f"Error: {response.text}")

def test_anomaly_scoring(token):
    """Test anomaly scoring endpoint"""
    print("\nTesting anomaly scoring...")
    headers = {"Authorization": f"Bearer {token}"}
    
    request_data = {
        "inspection_id": "TEST-001",
        "evidence_data": [
            {
                "evidence_id": "EV-1",
                "file_path": "/uploads/test/evidence1.jpg",
                "latitude": 28.6139,
                "longitude": 77.2090,
                "captured_at": "2026-09-01T10:00:00Z"
            },
            {
                "evidence_id": "EV-2",
                "file_path": "/uploads/test/evidence2.jpg",
                "latitude": 28.6140,
                "longitude": 77.2091,
                "captured_at": "2026-09-01T10:05:00Z"
            }
        ]
    }
    
    response = requests.post(f"{BASE_URL}/ml/anomaly-scoring", json=request_data, headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    else:
        print(f"Error: {response.text}")

def test_cv_validation(token):
    """Test CV validation endpoint"""
    print("\nTesting CV validation...")
    headers = {"Authorization": f"Bearer {token}"}
    
    request_data = {
        "evidence_id": "EV-1",
        "file_path": "/uploads/test/evidence1.jpg"
    }
    
    response = requests.post(f"{BASE_URL}/ml/cv-validation", json=request_data, headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    else:
        print(f"Error: {response.text}")

def test_similarity_check(token):
    """Test similarity check endpoint"""
    print("\nTesting similarity check...")
    headers = {"Authorization": f"Bearer {token}"}
    
    request_data = {
        "evidence_id": "EV-1",
        "file_path": "/uploads/test/evidence1.jpg"
    }
    
    response = requests.post(f"{BASE_URL}/ml/similarity-check", json=request_data, headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    else:
        print(f"Error: {response.text}")

def main():
    print("=" * 60)
    print("ML Integration Test Suite")
    print("=" * 60)
    
    # Test health
    test_health()
    
    # Login and get token
    token = test_login()
    if not token:
        print("Cannot proceed without authentication token")
        return
    
    # Test ML endpoints
    test_ml_models_status(token)
    test_anomaly_scoring(token)
    test_cv_validation(token)
    test_similarity_check(token)
    
    print("\n" + "=" * 60)
    print("ML Integration Test Complete!")
    print("=" * 60)

if __name__ == "__main__":
    main()