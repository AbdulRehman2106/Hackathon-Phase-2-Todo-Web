from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from typing import Optional
import os

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

security = HTTPBearer()


async def verify_jwt_token(credentials: HTTPAuthorizationCredentials) -> dict:
    """
    Verify JWT token and return payload.

    Args:
        credentials: HTTP Authorization credentials with Bearer token

    Returns:
        dict: JWT payload containing user_id and other claims

    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: Optional[int] = payload.get("user_id")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return payload

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> int:
    """
    Extract user_id from JWT token.

    This function is used as a dependency in FastAPI routes to get the
    authenticated user's ID from the JWT token.

    Args:
        credentials: HTTP Authorization credentials (injected by FastAPI)

    Returns:
        int: The authenticated user's ID

    Raises:
        HTTPException: If token is invalid or user_id is missing
    """
    payload = await verify_jwt_token(credentials)
    return payload["user_id"]


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Extract full user payload from JWT token.

    This function is used as a dependency in FastAPI routes to get the
    authenticated user's full information from the JWT token.

    Args:
        credentials: HTTP Authorization credentials (injected by FastAPI)

    Returns:
        dict: The JWT payload containing user information

    Raises:
        HTTPException: If token is invalid
    """
    payload = await verify_jwt_token(credentials)
    return payload
