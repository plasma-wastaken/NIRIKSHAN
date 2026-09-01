from fastapi import APIRouter, HTTPException, status, Depends
from schemas import LoginRequest, TokenResponse, UserRole
from services.repository import Repository
from dependencies import create_access_token

router = APIRouter()

# Repository will be set by main.py
repository = None

def set_repository(repo):
    global repository
    repository = repo

@router.post("/login", response_model=TokenResponse)
async def login(login_request: LoginRequest):
    """
    Authenticate user and return JWT token.
    
    Supports roles: CITIZEN, INSPECTOR, SUPERVISOR, DEPT_ADMIN, GOVT_ADMIN
    """
    # Find user by username
    user = repository.get_user_by_username(login_request.username)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Verify password (in production, use proper password hashing)
    if user.get("password") != login_request.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Check account status
    if user.get("account_status") != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is not active"
        )
    
    # Create JWT token
    access_token = create_access_token(
        data={
            "sub": user["user_id"],
            "role": user["role"],
            "name": user["name"],
            "email": user["email"]
        }
    )
    
    return TokenResponse(
        access_token=access_token,
        user_id=user["user_id"],
        name=user["name"],
        email=user["email"],
        role=UserRole(user["role"])
    )