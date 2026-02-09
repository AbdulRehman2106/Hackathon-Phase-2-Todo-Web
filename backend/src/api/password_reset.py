"""
Password Reset API endpoints for secure password recovery.

This module provides:
- POST /api/auth/forgot-password - Request password reset email
- GET /api/auth/reset-password/{token} - Verify reset token validity
- POST /api/auth/reset-password - Reset password with token
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

from ..models.user import User
from ..services.auth import hash_password
from ..services.password_reset import (
    create_reset_token,
    validate_reset_token,
    invalidate_token,
    check_rate_limit,
    validate_password_strength,
    get_user_by_email
)
from ..services.email import send_password_reset_email
from ..database import get_session

router = APIRouter()


# Request/Response Models
class ForgotPasswordRequest(BaseModel):
    """Request model for forgot password."""
    email: EmailStr = Field(..., description="User email address")


class ForgotPasswordResponse(BaseModel):
    """Response model for forgot password request."""
    message: str


class TokenValidationResponse(BaseModel):
    """Response model for token validation."""
    valid: bool
    email: Optional[str] = None
    error: Optional[str] = None


class ResetPasswordRequest(BaseModel):
    """Request model for password reset."""
    token: str = Field(..., description="Password reset token")
    new_password: str = Field(..., min_length=8, description="New password (minimum 8 characters)")


class ResetPasswordResponse(BaseModel):
    """Response model for password reset."""
    message: str


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(
    request: ForgotPasswordRequest,
    session: Session = Depends(get_session)
) -> ForgotPasswordResponse:
    """
    Request a password reset email.

    Security features:
    - No user enumeration (same response for existing/non-existing emails)
    - Rate limiting (3 requests per hour per user)
    - Cryptographically secure tokens
    - 15-minute token expiry

    Args:
        request: Forgot password request with email
        session: Database session

    Returns:
        Generic success message (no user enumeration)

    Raises:
        HTTPException 400: If email format is invalid
        HTTPException 429: If rate limit exceeded
    """
    # Find user by email
    user = get_user_by_email(session, request.email)

    # Always return same message to prevent user enumeration
    generic_message = "If an account exists with this email, you will receive a password reset link shortly."

    # If user doesn't exist, return generic message (no enumeration)
    if not user:
        return ForgotPasswordResponse(message=generic_message)

    # Check rate limit
    if not check_rate_limit(session, user.id):
        raise HTTPException(
            status_code=429,
            detail="Too many password reset requests. Please try again later."
        )

    # Create reset token
    token = create_reset_token(session, user.id)

    # Send reset email
    email_sent = send_password_reset_email(user.email, token)

    if not email_sent:
        # Log error but don't expose to user
        print(f"Failed to send password reset email to {user.email}")

    # Always return generic message
    return ForgotPasswordResponse(message=generic_message)


@router.get("/reset-password/{token}", response_model=TokenValidationResponse)
async def verify_reset_token(
    token: str,
    session: Session = Depends(get_session)
) -> TokenValidationResponse:
    """
    Verify if a password reset token is valid.

    Checks:
    - Token exists
    - Token has not expired (15 minutes)
    - Token has not been used

    Args:
        token: Password reset token to verify
        session: Database session

    Returns:
        TokenValidationResponse with validity status and user email

    Example:
        GET /api/auth/reset-password/abc123def456
    """
    # Validate token
    token_record = validate_reset_token(session, token)

    if not token_record:
        return TokenValidationResponse(
            valid=False,
            error="Invalid or expired reset token"
        )

    # Get user email
    user = session.get(User, token_record.user_id)

    if not user:
        return TokenValidationResponse(
            valid=False,
            error="User not found"
        )

    return TokenValidationResponse(
        valid=True,
        email=user.email
    )


@router.post("/reset-password", response_model=ResetPasswordResponse)
async def reset_password(
    request: ResetPasswordRequest,
    session: Session = Depends(get_session)
) -> ResetPasswordResponse:
    """
    Reset user password with a valid token.

    Security features:
    - Token validation (expiry, usage)
    - Password strength validation
    - One-time use tokens
    - Automatic token invalidation

    Args:
        request: Reset password request with token and new password
        session: Database session

    Returns:
        Success message

    Raises:
        HTTPException 400: If token is invalid or password is weak
        HTTPException 422: If validation fails
    """
    # Validate token
    token_record = validate_reset_token(session, request.token)

    if not token_record:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token"
        )

    # Validate password strength
    password_validation = validate_password_strength(request.new_password)

    if not password_validation["valid"]:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Password does not meet strength requirements",
                "errors": password_validation["errors"]
            }
        )

    # Get user
    user = session.get(User, token_record.user_id)

    if not user:
        raise HTTPException(
            status_code=400,
            detail="User not found"
        )

    # Hash new password
    hashed_password = hash_password(request.new_password)

    # Update user password
    user.hashed_password = hashed_password
    session.add(user)

    # Invalidate token (mark as used)
    invalidate_token(session, request.token)

    # Commit changes
    session.commit()

    return ResetPasswordResponse(
        message="Password successfully reset. You can now sign in with your new password."
    )
