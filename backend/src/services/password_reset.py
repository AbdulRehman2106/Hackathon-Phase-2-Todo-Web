"""
Password reset service for secure token management and validation.

This module provides utilities for:
- Generating cryptographically secure reset tokens
- Validating token expiry and usage
- Rate limiting reset requests
- Password strength validation
- Token cleanup
"""

import os
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, List
from sqlmodel import Session, select

from src.models.password_reset import PasswordResetToken
from src.models.user import User


# Configuration from environment variables
TOKEN_EXPIRY_MINUTES = int(os.getenv("PASSWORD_RESET_TOKEN_EXPIRY_MINUTES", "15"))
MAX_REQUESTS_PER_HOUR = int(os.getenv("PASSWORD_RESET_MAX_REQUESTS_PER_HOUR", "3"))


def generate_reset_token() -> str:
    """
    Generate a cryptographically secure random token.

    Returns:
        URL-safe random token string (32 bytes = 43 characters)

    Example:
        >>> token = generate_reset_token()
        >>> len(token)
        43
    """
    return secrets.token_urlsafe(32)


def create_reset_token(session: Session, user_id: int) -> str:
    """
    Create a password reset token for a user.

    Args:
        session: Database session
        user_id: User ID to create token for

    Returns:
        Generated reset token string

    Example:
        >>> token = create_reset_token(session, user_id=1)
        >>> print(token)
        abc123def456...
    """
    # Generate token
    token = generate_reset_token()

    # Calculate expiry time
    expires_at = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRY_MINUTES)

    # Create token record
    reset_token = PasswordResetToken(
        user_id=user_id,
        token=token,
        expires_at=expires_at,
        used=False,
        created_at=datetime.utcnow()
    )

    session.add(reset_token)
    session.commit()
    session.refresh(reset_token)

    return token


def validate_reset_token(session: Session, token: str) -> Optional[PasswordResetToken]:
    """
    Validate a password reset token.

    Checks:
    - Token exists in database
    - Token has not expired
    - Token has not been used

    Args:
        session: Database session
        token: Reset token to validate

    Returns:
        PasswordResetToken if valid, None otherwise

    Example:
        >>> token_record = validate_reset_token(session, "abc123")
        >>> if token_record:
        ...     print(f"Valid token for user {token_record.user_id}")
    """
    # Find token in database
    statement = select(PasswordResetToken).where(PasswordResetToken.token == token)
    token_record = session.exec(statement).first()

    if not token_record:
        return None

    # Check if token has been used
    if token_record.used:
        return None

    # Check if token has expired
    if datetime.utcnow() > token_record.expires_at:
        return None

    return token_record


def invalidate_token(session: Session, token: str) -> bool:
    """
    Mark a token as used (invalidate it).

    Args:
        session: Database session
        token: Reset token to invalidate

    Returns:
        True if token was invalidated, False if not found

    Example:
        >>> success = invalidate_token(session, "abc123")
        >>> print(success)
        True
    """
    statement = select(PasswordResetToken).where(PasswordResetToken.token == token)
    token_record = session.exec(statement).first()

    if not token_record:
        return False

    token_record.used = True
    session.add(token_record)
    session.commit()

    return True


def check_rate_limit(session: Session, user_id: int) -> bool:
    """
    Check if user has exceeded rate limit for password reset requests.

    Rate limit: MAX_REQUESTS_PER_HOUR requests per hour

    Args:
        session: Database session
        user_id: User ID to check

    Returns:
        True if user is within rate limit, False if exceeded

    Example:
        >>> can_request = check_rate_limit(session, user_id=1)
        >>> if not can_request:
        ...     print("Rate limit exceeded")
    """
    # Get tokens created in the last hour
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)

    statement = select(PasswordResetToken).where(
        PasswordResetToken.user_id == user_id,
        PasswordResetToken.created_at >= one_hour_ago
    )
    recent_tokens = session.exec(statement).all()

    # Check if user has exceeded rate limit
    return len(recent_tokens) < MAX_REQUESTS_PER_HOUR


def validate_password_strength(password: str) -> Dict[str, any]:
    """
    Validate password strength requirements.

    Requirements:
    - At least 8 characters
    - Contains uppercase letter
    - Contains lowercase letter
    - Contains number

    Args:
        password: Password to validate

    Returns:
        Dictionary with 'valid' boolean and 'errors' list

    Example:
        >>> result = validate_password_strength("weak")
        >>> print(result)
        {'valid': False, 'errors': ['Password must be at least 8 characters', ...]}
    """
    errors = []

    # Check length
    if len(password) < 8:
        errors.append("Password must be at least 8 characters")

    # Check for uppercase
    if not any(c.isupper() for c in password):
        errors.append("Password must contain at least one uppercase letter")

    # Check for lowercase
    if not any(c.islower() for c in password):
        errors.append("Password must contain at least one lowercase letter")

    # Check for number
    if not any(c.isdigit() for c in password):
        errors.append("Password must contain at least one number")

    return {
        "valid": len(errors) == 0,
        "errors": errors
    }


def cleanup_expired_tokens(session: Session) -> int:
    """
    Delete expired password reset tokens from database.

    This should be run periodically as a background job.

    Args:
        session: Database session

    Returns:
        Number of tokens deleted

    Example:
        >>> deleted_count = cleanup_expired_tokens(session)
        >>> print(f"Deleted {deleted_count} expired tokens")
    """
    # Find expired tokens
    statement = select(PasswordResetToken).where(
        PasswordResetToken.expires_at < datetime.utcnow()
    )
    expired_tokens = session.exec(statement).all()

    # Delete expired tokens
    for token in expired_tokens:
        session.delete(token)

    session.commit()

    return len(expired_tokens)


def get_user_by_email(session: Session, email: str) -> Optional[User]:
    """
    Get user by email address.

    Args:
        session: Database session
        email: User email address

    Returns:
        User if found, None otherwise

    Example:
        >>> user = get_user_by_email(session, "user@example.com")
        >>> if user:
        ...     print(f"Found user {user.id}")
    """
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()
