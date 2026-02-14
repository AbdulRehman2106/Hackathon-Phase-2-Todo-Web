"""
Message model for AI chatbot.

Represents a single message in a conversation (either from user or assistant).
"""

from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, Literal, TYPE_CHECKING

if TYPE_CHECKING:
    from src.models.conversation import Conversation
    from src.models.user import User


class Message(SQLModel, table=True):
    """
    Message model representing a single message in a conversation.

    Messages are immutable once created (no editing).
    Role must be either 'user' or 'assistant'.
    """
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(
        foreign_key="conversations.id",
        index=True,
        nullable=False
    )
    user_id: int = Field(
        foreign_key="users.id",
        index=True,
        nullable=False
    )
    role: str = Field(
        max_length=20,
        nullable=False,
        description="Message sender role: 'user' or 'assistant'"
    )
    content: str = Field(
        max_length=10000,
        nullable=False,
        description="Message text content"
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        index=True
    )

    # Relationships
    conversation: Optional["Conversation"] = Relationship(back_populates="messages")
    user: Optional["User"] = Relationship()
