"""
Chat endpoint for AI-powered conversational task management.

This module provides the REST API endpoint for the AI chatbot,
implementing stateless conversation management with MCP tool execution.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from sqlmodel import Session
import logging

from src.database import get_db
from src.middleware.jwt_auth import get_current_user
from src.services.conversation_service import conversation_service
from src.agents.orchestrator import orchestrator

logger = logging.getLogger(__name__)

router = APIRouter()


# Request/Response Models

class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    message: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="User's message to the AI chatbot"
    )


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    conversation_id: int = Field(description="ID of the conversation")
    message_id: int = Field(description="ID of the assistant's message")
    response: str = Field(description="AI assistant's response")
    timestamp: str = Field(description="ISO 8601 timestamp of the response")


class ConversationHistoryResponse(BaseModel):
    """Response model for conversation history."""
    conversation_id: int
    messages: List[Dict[str, Any]]
    total_count: int
    has_more: bool = False


# Endpoints

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a message to the AI chatbot.

    The chatbot will:
    - Understand user intent (add task, list tasks, complete task, etc.)
    - Execute appropriate MCP tool operations
    - Return conversational response with operation results

    All conversation history is automatically persisted and loaded for context.

    Requires authentication.
    """
    try:
        user_id = current_user["user_id"]
        logger.info(f"Chat request from user {user_id}: {request.message[:50]}...")

        # 1. Get or create conversation
        conversation = await conversation_service.get_or_create_conversation(db, user_id)

        # 2. Store user message
        user_message = await conversation_service.store_message(
            db=db,
            conversation_id=conversation.id,
            user_id=user_id,
            role="user",
            content=request.message
        )

        # 3. Load conversation history
        history = await conversation_service.load_conversation_history(
            db=db,
            conversation_id=conversation.id,
            limit=50
        )

        # 4. Build message array for AI
        messages = conversation_service.build_message_array(history)

        # 5. Run agent orchestrator
        result = await orchestrator.run(messages=messages, user_id=user_id, db=db)

        # 6. Store assistant response
        assistant_message = await conversation_service.store_message(
            db=db,
            conversation_id=conversation.id,
            user_id=user_id,
            role="assistant",
            content=result["response"]
        )

        # 7. Return structured response
        return ChatResponse(
            conversation_id=conversation.id,
            message_id=assistant_message.id,
            response=result["response"],
            timestamp=assistant_message.created_at.isoformat()
        )

    except ValueError as e:
        logger.error(f"Validation error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your message. Please try again."
        )


@router.get("/chat/history", response_model=ConversationHistoryResponse)
async def get_chat_history(
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve conversation history for the authenticated user.

    Returns messages in chronological order.

    Requires authentication.
    """
    try:
        user_id = current_user["user_id"]

        # Get user's conversation
        conversation = await conversation_service.get_or_create_conversation(db, user_id)

        # Load messages
        messages = await conversation_service.load_conversation_history(
            db=db,
            conversation_id=conversation.id,
            limit=limit
        )

        # Format messages
        formatted_messages = [
            {
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "timestamp": msg.created_at.isoformat()
            }
            for msg in messages
        ]

        return ConversationHistoryResponse(
            conversation_id=conversation.id,
            messages=formatted_messages,
            total_count=len(formatted_messages),
            has_more=len(formatted_messages) >= limit
        )

    except Exception as e:
        logger.error(f"Error retrieving chat history: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving chat history."
        )


@router.get("/chat/health")
async def chat_health_check():
    """
    Check if chat service is properly configured.

    Does not require authentication.
    """
    try:
        import os
        cohere_key = os.getenv("COHERE_API_KEY")

        if not cohere_key:
            return {
                "status": "error",
                "message": "COHERE_API_KEY not configured"
            }

        return {
            "status": "healthy",
            "message": "Chat service is configured and ready",
            "provider": "Cohere",
            "architecture": "Stateless with MCP tools"
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
