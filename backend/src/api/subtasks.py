"""
Subtasks API endpoints for CRUD operations on subtasks.

This module provides:
- GET /api/tasks/{task_id}/subtasks - List all subtasks for a task
- POST /api/tasks/{task_id}/subtasks - Create new subtask
- PUT /api/subtasks/{subtask_id} - Update existing subtask
- DELETE /api/subtasks/{subtask_id} - Delete subtask

All endpoints require JWT authentication and enforce user isolation.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from sqlmodel import Session
from pydantic import BaseModel, Field
from typing import Optional, List

from ..models.subtask import Subtask
from ..services import subtasks as subtask_service
from ..middleware.jwt_auth import get_current_user_id
from ..database import get_session

router = APIRouter()


# Request/Response Models
class CreateSubtaskRequest(BaseModel):
    """Request model for creating a subtask."""
    title: str = Field(..., min_length=1, max_length=500, description="Subtask title")
    order: Optional[int] = Field(0, description="Order position")


class UpdateSubtaskRequest(BaseModel):
    """Request model for updating a subtask."""
    title: Optional[str] = Field(None, min_length=1, max_length=500, description="Subtask title")
    completed: Optional[bool] = Field(None, description="Subtask completion status")
    order: Optional[int] = Field(None, description="Order position")


class SubtaskResponse(BaseModel):
    """Subtask data response model."""
    id: int
    task_id: int
    title: str
    completed: bool
    order: int
    created_at: str
    updated_at: str


class SubtaskListResponse(BaseModel):
    """Response model for subtask list."""
    subtasks: List[SubtaskResponse]


@router.get("/tasks/{task_id}/subtasks", response_model=SubtaskListResponse)
async def list_subtasks(
    task_id: int,
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> SubtaskListResponse:
    """
    Get all subtasks for a task.

    Args:
        task_id: Task ID
        user_id: Current user ID from JWT token
        session: Database session

    Returns:
        SubtaskListResponse with array of subtasks

    Raises:
        HTTPException 401: If JWT token is invalid
        HTTPException 404: If task not found or doesn't belong to user
    """
    # Get subtasks
    subtasks = subtask_service.get_task_subtasks(session, task_id, user_id)

    # Convert to response format
    subtask_responses = [
        SubtaskResponse(
            id=subtask.id,
            task_id=subtask.task_id,
            title=subtask.title,
            completed=subtask.completed,
            order=subtask.order,
            created_at=subtask.created_at.isoformat(),
            updated_at=subtask.updated_at.isoformat()
        )
        for subtask in subtasks
    ]

    return SubtaskListResponse(subtasks=subtask_responses)


@router.post("/tasks/{task_id}/subtasks", response_model=SubtaskResponse, status_code=status.HTTP_201_CREATED)
async def create_subtask(
    task_id: int,
    request: CreateSubtaskRequest,
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> SubtaskResponse:
    """
    Create a new subtask for a task.

    Args:
        task_id: Task ID
        request: Subtask creation request
        user_id: Current user ID from JWT token
        session: Database session

    Returns:
        SubtaskResponse with created subtask data

    Raises:
        HTTPException 401: If JWT token is invalid
        HTTPException 404: If task not found or doesn't belong to user
    """
    # Create subtask
    subtask = subtask_service.create_subtask(
        session=session,
        task_id=task_id,
        user_id=user_id,
        title=request.title,
        order=request.order or 0
    )

    if not subtask:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Return response
    return SubtaskResponse(
        id=subtask.id,
        task_id=subtask.task_id,
        title=subtask.title,
        completed=subtask.completed,
        order=subtask.order,
        created_at=subtask.created_at.isoformat(),
        updated_at=subtask.updated_at.isoformat()
    )


@router.put("/subtasks/{subtask_id}", response_model=SubtaskResponse)
async def update_subtask(
    subtask_id: int,
    request: UpdateSubtaskRequest,
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> SubtaskResponse:
    """
    Update an existing subtask.

    Args:
        subtask_id: ID of the subtask to update
        request: Subtask update request
        user_id: Current user ID from JWT token
        session: Database session

    Returns:
        SubtaskResponse with updated subtask data

    Raises:
        HTTPException 401: If JWT token is invalid
        HTTPException 404: If subtask not found or doesn't belong to user
    """
    # Update subtask
    subtask = subtask_service.update_subtask(
        session=session,
        subtask_id=subtask_id,
        user_id=user_id,
        title=request.title,
        completed=request.completed,
        order=request.order
    )

    if not subtask:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subtask not found"
        )

    # Return response
    return SubtaskResponse(
        id=subtask.id,
        task_id=subtask.task_id,
        title=subtask.title,
        completed=subtask.completed,
        order=subtask.order,
        created_at=subtask.created_at.isoformat(),
        updated_at=subtask.updated_at.isoformat()
    )


@router.delete("/subtasks/{subtask_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subtask(
    subtask_id: int,
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> None:
    """
    Delete a subtask.

    Args:
        subtask_id: ID of the subtask to delete
        user_id: Current user ID from JWT token
        session: Database session

    Returns:
        None (204 No Content)

    Raises:
        HTTPException 401: If JWT token is invalid
        HTTPException 404: If subtask not found or doesn't belong to user
    """
    # Delete subtask
    success = subtask_service.delete_subtask(
        session=session,
        subtask_id=subtask_id,
        user_id=user_id
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subtask not found"
        )
