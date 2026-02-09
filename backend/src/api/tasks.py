"""
Tasks API endpoints for CRUD operations on tasks.

This module provides:
- GET /api/tasks - List all user tasks
- POST /api/tasks - Create new task
- PUT /api/tasks/{id} - Update existing task
- DELETE /api/tasks/{id} - Delete task

All endpoints require JWT authentication and enforce user isolation.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from sqlmodel import Session
from pydantic import BaseModel, Field
from typing import Optional, List

from ..models.task import Task
from ..services import tasks as task_service
from ..middleware.jwt_auth import get_current_user_id
from ..database import get_session

router = APIRouter()


# Request/Response Models
class CreateTaskRequest(BaseModel):
    """Request model for creating a task."""
    title: str = Field(..., min_length=1, max_length=500, description="Task title")
    description: Optional[str] = Field(None, description="Optional task description")
    category: Optional[str] = Field(None, max_length=50, description="Task category/tag")
    due_date: Optional[str] = Field(None, description="Due date in ISO format")
    priority: Optional[str] = Field("medium", description="Task priority: low, medium, high")
    is_recurring: Optional[bool] = Field(False, description="Whether task is recurring")
    recurrence_type: Optional[str] = Field(None, description="Recurrence type: daily, weekly, monthly, yearly")
    recurrence_interval: Optional[int] = Field(1, description="Recurrence interval (e.g., every 2 days)")
    recurrence_end_date: Optional[str] = Field(None, description="Recurrence end date in ISO format")


class UpdateTaskRequest(BaseModel):
    """Request model for updating a task."""
    title: Optional[str] = Field(None, min_length=1, max_length=500, description="Task title")
    description: Optional[str] = Field(None, description="Task description")
    completed: Optional[bool] = Field(None, description="Task completion status")
    category: Optional[str] = Field(None, max_length=50, description="Task category/tag")
    due_date: Optional[str] = Field(None, description="Due date in ISO format")
    priority: Optional[str] = Field(None, description="Task priority: low, medium, high")
    is_recurring: Optional[bool] = Field(None, description="Whether task is recurring")
    recurrence_type: Optional[str] = Field(None, description="Recurrence type: daily, weekly, monthly, yearly")
    recurrence_interval: Optional[int] = Field(None, description="Recurrence interval")
    recurrence_end_date: Optional[str] = Field(None, description="Recurrence end date in ISO format")


class TaskResponse(BaseModel):
    """Task data response model."""
    id: int
    user_id: int
    title: str
    description: Optional[str]
    completed: bool
    category: Optional[str]
    due_date: Optional[str]
    priority: Optional[str]
    is_recurring: bool
    recurrence_type: Optional[str]
    recurrence_interval: Optional[int]
    recurrence_end_date: Optional[str]
    parent_task_id: Optional[int]
    created_at: str
    updated_at: str


class TaskListResponse(BaseModel):
    """Response model for task list."""
    tasks: List[TaskResponse]


@router.get("", response_model=TaskListResponse)
async def list_tasks(
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> TaskListResponse:
    """
    Get all tasks for the authenticated user.

    Args:
        user_id: Current user ID from JWT token
        session: Database session

    Returns:
        TaskListResponse with array of user's tasks

    Raises:
        HTTPException 401: If JWT token is invalid
    """
    # Get user tasks
    tasks = task_service.get_user_tasks(session, user_id)

    # Convert to response format
    task_responses = [
        TaskResponse(
            id=task.id,
            user_id=task.user_id,
            title=task.title,
            description=task.description,
            completed=task.completed,
            category=task.category,
            due_date=task.due_date.isoformat() if task.due_date else None,
            priority=task.priority,
            is_recurring=task.is_recurring,
            recurrence_type=task.recurrence_type,
            recurrence_interval=task.recurrence_interval,
            recurrence_end_date=task.recurrence_end_date.isoformat() if task.recurrence_end_date else None,
            parent_task_id=task.parent_task_id,
            created_at=task.created_at.isoformat(),
            updated_at=task.updated_at.isoformat()
        )
        for task in tasks
    ]

    return TaskListResponse(tasks=task_responses)


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    request: CreateTaskRequest,
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> TaskResponse:
    """
    Create a new task for the authenticated user.

    Args:
        request: Task creation request with title and optional description
        user_id: Current user ID from JWT token
        session: Database session

    Returns:
        TaskResponse with created task data

    Raises:
        HTTPException 401: If JWT token is invalid
        HTTPException 422: If validation fails
    """
    # Create task
    task = task_service.create_task(
        session=session,
        user_id=user_id,
        title=request.title,
        description=request.description,
        category=request.category,
        due_date=request.due_date,
        priority=request.priority,
        is_recurring=request.is_recurring or False,
        recurrence_type=request.recurrence_type,
        recurrence_interval=request.recurrence_interval or 1,
        recurrence_end_date=request.recurrence_end_date
    )

    # Return response
    return TaskResponse(
        id=task.id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        category=task.category,
        due_date=task.due_date.isoformat() if task.due_date else None,
        priority=task.priority,
        is_recurring=task.is_recurring,
        recurrence_type=task.recurrence_type,
        recurrence_interval=task.recurrence_interval,
        recurrence_end_date=task.recurrence_end_date.isoformat() if task.recurrence_end_date else None,
        parent_task_id=task.parent_task_id,
        created_at=task.created_at.isoformat(),
        updated_at=task.updated_at.isoformat()
    )


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    request: UpdateTaskRequest,
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> TaskResponse:
    """
    Update an existing task.

    Args:
        task_id: ID of the task to update
        request: Task update request with optional fields
        user_id: Current user ID from JWT token
        session: Database session

    Returns:
        TaskResponse with updated task data

    Raises:
        HTTPException 401: If JWT token is invalid
        HTTPException 404: If task not found or doesn't belong to user
    """
    # Update task
    task = task_service.update_task(
        session=session,
        task_id=task_id,
        user_id=user_id,
        title=request.title,
        description=request.description,
        completed=request.completed,
        category=request.category,
        due_date=request.due_date,
        priority=request.priority,
        is_recurring=request.is_recurring,
        recurrence_type=request.recurrence_type,
        recurrence_interval=request.recurrence_interval,
        recurrence_end_date=request.recurrence_end_date
    )

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Return response
    return TaskResponse(
        id=task.id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        category=task.category,
        due_date=task.due_date.isoformat() if task.due_date else None,
        priority=task.priority,
        is_recurring=task.is_recurring,
        recurrence_type=task.recurrence_type,
        recurrence_interval=task.recurrence_interval,
        recurrence_end_date=task.recurrence_end_date.isoformat() if task.recurrence_end_date else None,
        parent_task_id=task.parent_task_id,
        created_at=task.created_at.isoformat(),
        updated_at=task.updated_at.isoformat()
    )


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> None:
    """
    Delete a task.

    Args:
        task_id: ID of the task to delete
        user_id: Current user ID from JWT token
        session: Database session

    Returns:
        None (204 No Content)

    Raises:
        HTTPException 401: If JWT token is invalid
        HTTPException 404: If task not found or doesn't belong to user
    """
    # Delete task
    success = task_service.delete_task(
        session=session,
        task_id=task_id,
        user_id=user_id
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
