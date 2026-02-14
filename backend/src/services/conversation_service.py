"""
Conversation service for managing chat conversations.

This service handles:
- Creating and retrieving conversations
- Storing and loading messages
- Maintaining conversation history
- Stateless conversation management
"""

import logging
from typing import List, Optional
from datetime import datetime
from sqlmodel import Session, select
from src.models.conversation import Conversation
from src.models.message import Message

logger = logging.getLogger(__name__)


class ConversationService:
    """
    Service for managing AI chatbot conversations.

    All conversation operations are stateless - conversation context
    is loaded from the database on each request.
    """

    @staticmethod
    async def get_or_create_conversation(
        db: Session,
        user_id: int
    ) -> Conversation:
        """
        Get the most recent conversation for a user, or create a new one.

        Args:
            db: Database session
            user_id: User ID

        Returns:
            Conversation object
        """
        # Get most recent conversation
        statement = select(Conversation).where(
            Conversation.user_id == user_id
        ).order_by(Conversation.updated_at.desc())

        conversation = db.exec(statement).first()

        if not conversation:
            # Create new conversation
            conversation = Conversation(user_id=user_id)
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
            logger.info(f"Created new conversation {conversation.id} for user {user_id}")
        else:
            logger.info(f"Using existing conversation {conversation.id} for user {user_id}")

        return conversation

    @staticmethod
    async def store_message(
        db: Session,
        conversation_id: int,
        user_id: int,
        role: str,
        content: str
    ) -> Message:
        """
        Store a message in the conversation.

        Args:
            db: Database session
            conversation_id: Conversation ID
            user_id: User ID
            role: Message role ('user' or 'assistant')
            content: Message content

        Returns:
            Created Message object
        """
        if role not in ['user', 'assistant']:
            raise ValueError(f"Invalid role: {role}. Must be 'user' or 'assistant'")

        message = Message(
            conversation_id=conversation_id,
            user_id=user_id,
            role=role,
            content=content
        )
        db.add(message)

        # Update conversation timestamp
        statement = select(Conversation).where(Conversation.id == conversation_id)
        conversation = db.exec(statement).first()
        if conversation:
            conversation.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(message)

        logger.info(f"Stored {role} message in conversation {conversation_id}")
        return message

    @staticmethod
    async def load_conversation_history(
        db: Session,
        conversation_id: int,
        limit: int = 50
    ) -> List[Message]:
        """
        Load conversation history ordered chronologically.

        Args:
            db: Database session
            conversation_id: Conversation ID
            limit: Maximum number of messages to load

        Returns:
            List of Message objects
        """
        statement = select(Message).where(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at.asc()).limit(limit)

        messages = db.exec(statement).all()
        logger.info(f"Loaded {len(messages)} messages from conversation {conversation_id}")
        return list(messages)

    @staticmethod
    def build_message_array(messages: List[Message]) -> List[dict]:
        """
        Build message array for Cohere API from Message objects.

        Args:
            messages: List of Message objects

        Returns:
            List of message dictionaries for Cohere API
        """
        return [
            {
                "role": msg.role,
                "content": msg.content
            }
            for msg in messages
        ]


# Singleton instance
conversation_service = ConversationService()
