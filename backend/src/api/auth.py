"""
Authentication API endpoints for user signup and signin.

This module provides:
- POST /api/auth/signup - Create new user account
- POST /api/auth/signin - Authenticate existing user
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from pydantic import BaseModel, EmailStr, Field

from ..models.user import User
from ..services.auth import hash_password, verify_password, create_access_token
from ..database import get_session

router = APIRouter()


# Request/Response Models
class SignUpRequest(BaseModel):
    """Request model for user signup."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="User password (minimum 8 characters)")


class SignInRequest(BaseModel):
    """Request model for user signin."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")


class UserResponse(BaseModel):
    """User data response model."""
    id: int
    email: str
    created_at: str
    updated_at: str


class AuthResponse(BaseModel):
    """Authentication response with token and user data."""
    token: str
    user: UserResponse


@router.post("/signup", response_model=AuthResponse, status_code=201)
async def signup(
    request: SignUpRequest,
    session: Session = Depends(get_session)
) -> AuthResponse:
    """
    Create a new user account.

    Args:
        request: Signup request with email and password
        session: Database session

    Returns:
        AuthResponse with JWT token and user data

    Raises:
        HTTPException 400: If email already exists
        HTTPException 422: If validation fails
    """
    # Check if email already exists
    statement = select(User).where(User.email == request.email)
    existing_user = session.exec(statement).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Hash password
    hashed_password = hash_password(request.password)

    # Create new user
    new_user = User(
        email=request.email,
        hashed_password=hashed_password
    )

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    # Create JWT token
    token = create_access_token(
        data={
            "user_id": new_user.id,
            "email": new_user.email
        }
    )

    # Return response
    return AuthResponse(
        token=token,
        user=UserResponse(
            id=new_user.id,
            email=new_user.email,
            created_at=new_user.created_at.isoformat(),
            updated_at=new_user.updated_at.isoformat()
        )
    )


@router.post("/signin", response_model=AuthResponse)
async def signin(
    request: SignInRequest,
    session: Session = Depends(get_session)
) -> AuthResponse:
    """
    Authenticate an existing user.

    Args:
        request: Signin request with email and password
        session: Database session

    Returns:
        AuthResponse with JWT token and user data

    Raises:
        HTTPException 401: If credentials are invalid
    """
    # Find user by email
    statement = select(User).where(User.email == request.email)
    user = session.exec(statement).first()

    # Verify user exists and password is correct
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Create JWT token
    token = create_access_token(
        data={
            "user_id": user.id,
            "email": user.email
        }
    )

    # Return response
    return AuthResponse(
        token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            created_at=user.created_at.isoformat(),
            updated_at=user.updated_at.isoformat()
        )
    )
