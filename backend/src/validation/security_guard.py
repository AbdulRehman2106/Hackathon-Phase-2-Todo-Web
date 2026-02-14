"""
Security guard for user authorization checks.

This module ensures that all tool operations are authorized
and that users can only access their own data.
"""

import logging
from typing import Optional
from sqlmodel import Session, select
from src.models.task import Task

logger = logging.getLogger(__name__)


class SecurityGuard:
    """
    Security guard for validating user authorization.

    All MCP tools must use this guard to verify that:
    1. User is authenticated (user_id is valid)
    2. User owns the resources they're trying to access
    3. No cross-user data access is possible
    """

    @staticmethod
    async def validate_task_ownership(
        db: Session,
        task_id: int,
        user_id: int
    ) -> Optional[Task]:
        """
        Validate that a task belongs to the authenticated user.

        Args:
            db: Database session
            task_id: Task ID to validate
            user_id: Authenticated user ID

        Returns:
            Task object if valid, None if not found or unauthorized

        Raises:
            ValueError: If task doesn't belong to user
        """
        statement = select(Task).where(
            Task.id == task_id,
            Task.user_id == user_id
        )
        task = db.exec(statement).first()

        if not task:
            logger.warning(f"Task {task_id} not found or unauthorized for user {user_id}")
            raise ValueError(f"Task not found or access denied")

        return task

    @staticmethod
    def validate_user_id(user_id: int) -> None:
        """
        Validate that user_id is provided and valid.

        Args:
            user_id: User ID to validate

        Raises:
            ValueError: If user_id is invalid
        """
        if not user_id or user_id <= 0:
            logger.error(f"Invalid user_id: {user_id}")
            raise ValueError("Invalid user_id")

    @staticmethod
    async def validate_conversation_ownership(
        db: Session,
        conversation_id: int,
        user_id: int
    ) -> bool:
        """
        Validate that a conversation belongs to the authenticated user.

        Args:
            db: Database session
            conversation_id: Conversation ID to validate
            user_id: Authenticated user ID

        Returns:
            True if valid, False otherwise
        """
        from src.models.conversation import Conversation

        statement = select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        )
        conversation = db.exec(statement).first()

        if not conversation:
            logger.warning(f"Conversation {conversation_id} not found or unauthorized for user {user_id}")
            return False

        return True


# Singleton instance
security_guard = SecurityGuard()
