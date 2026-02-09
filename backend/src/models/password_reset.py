from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

class PasswordResetToken(SQLModel, table=True):
    """Password reset token model for secure password recovery."""

    __tablename__ = "password_reset_tokens"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    token: str = Field(unique=True, index=True, max_length=255)
    expires_at: datetime = Field(index=True)
    used: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: Optional["User"] = Relationship()

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 1,
                "token": "abc123def456...",
                "expires_at": "2026-02-07T12:15:00Z",
                "used": False,
                "created_at": "2026-02-07T12:00:00Z"
            }
        }
