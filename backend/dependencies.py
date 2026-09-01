from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import os
from dotenv import load_dotenv
from schemas import UserRole, TokenResponse

load_dotenv()

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

security = HTTPBearer()

# ============================================================================
# JWT TOKEN OPERATIONS
# ============================================================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> dict:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# ============================================================================
# DEPENDENCY FUNCTIONS
# ============================================================================

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """Get the current authenticated user from JWT token."""
    token = credentials.credentials
    payload = decode_token(token)
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # In a real implementation, we would fetch the user from the database
    # For now, we return the basic user info from the token
    return {
        "user_id": user_id,
        "role": payload.get("role"),
        "name": payload.get("name"),
        "email": payload.get("email")
    }

# ============================================================================
# ROLE-BASED ACCESS CONTROL DEPENDENCIES
# ============================================================================

def require_role(*allowed_roles: UserRole):
    """Create a dependency that requires specific user roles."""
    async def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        user_role = current_user.get("role")
        if user_role not in [role.value for role in allowed_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return role_checker

# Specific role dependencies
require_inspector = require_role(UserRole.INSPECTOR)
require_supervisor = require_role(UserRole.SUPERVISOR)
require_citizen = require_role(UserRole.CITIZEN)
require_admin = require_role(UserRole.DEPT_ADMIN, UserRole.GOVT_ADMIN)

# ============================================================================
# OPTIONAL AUTH (for endpoints that work with or without auth)
# ============================================================================

async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[dict]:
    """Get the current user if authenticated, otherwise return None."""
    if credentials is None:
        return None
    
    try:
        token = credentials.credentials
        payload = decode_token(token)
        
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        
        return {
            "user_id": user_id,
            "role": payload.get("role"),
            "name": payload.get("name"),
            "email": payload.get("email")
        }
    except HTTPException:
        return None