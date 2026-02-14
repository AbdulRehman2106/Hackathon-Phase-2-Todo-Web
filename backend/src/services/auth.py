"""
Authentication service for password hashing and JWT token management.

This module provides utilities for:
- Password hashing and verification using bcrypt
- JWT token creation and decoding
- User authentication workflows
"""

import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from passlib.context import CryptContext
from jose import JWTError, jwt

# Password hashing configuration using Argon2 (more secure and no compatibility issues)
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# JWT configuration from environment variables
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", "10080"))  # Default: 7 days


def hash_password(password: str) -> str:
    """
    Hash a plain text password using Argon2.

    Args:
        password: Plain text password to hash

    Returns:
        Hashed password string

    Example:
        >>> hashed = hash_password("mypassword123")
        >>> print(hashed)
        $argon2id$...
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain text password against a hashed password.

    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password to compare against

    Returns:
        True if password matches, False otherwise

    Example:
        >>> hashed = hash_password("mypassword123")
        >>> verify_password("mypassword123", hashed)
        True
        >>> verify_password("wrongpassword", hashed)
        False
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token with user data.

    Args:
        data: Dictionary containing user data to encode in token (must include 'user_id')
        expires_delta: Optional custom expiration time delta

    Returns:
        Encoded JWT token string

    Example:
        >>> token = create_access_token({"user_id": 1, "email": "user@example.com"})
        >>> print(token)
        eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    """
    to_encode = data.copy()

    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRATION_MINUTES)

    to_encode.update({"exp": expire})

    # Create JWT token
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode and verify a JWT token.

    Args:
        token: JWT token string to decode

    Returns:
        Dictionary containing decoded token payload, or None if invalid

    Example:
        >>> token = create_access_token({"user_id": 1})
        >>> payload = decode_token(token)
        >>> print(payload["user_id"])
        1
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None
