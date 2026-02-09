"""
Subtask service layer for business logic.

This module provides functions for:
- Creating subtasks
- Updating subtasks
- Deleting subtasks
- Getting subtasks for a task
"""

from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime

from ..models.subtask import Subtask
from ..models.task import Task


def get_task_subtasks(session: Session, task_id: int, user_id: int) -> List[Subtask]:
    """
    Get all subtasks for a task (with user verification).

    Args:
        session: Database session
        task_id: Task ID
        user_id: User ID for verification

    Returns:
        List of subtasks ordered by order field
    """
    # First verify the task belongs to the user
    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        return []

    # Get subtasks
    statement = select(Subtask).where(Subtask.task_id == task_id).order_by(Subtask.order)
    subtasks = session.exec(statement).all()
    return list(subtasks)


def create_subtask(
    session: Session,
    task_id: int,
    user_id: int,
    title: str,
    order: int = 0
) -> Optional[Subtask]:
    """
    Create a new subtask for a task.

    Args:
        session: Database session
        task_id: Task ID
        user_id: User ID for verification
        title: Subtask title
        order: Order position

    Returns:
        Created subtask or None if task doesn't belong to user
    """
    # Verify task belongs to user
    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        return None

    # Create subtask
    subtask = Subtask(
        task_id=task_id,
        title=title,
        order=order,
        completed=False
    )

    session.add(subtask)
    session.commit()
    session.refresh(subtask)

    return subtask


def update_subtask(
    session: Session,
    subtask_id: int,
    user_id: int,
    title: Optional[str] = None,
    completed: Optional[bool] = None,
    order: Optional[int] = None
) -> Optional[Subtask]:
    """
    Update a subtask.

    Args:
        session: Database session
        subtask_id: Subtask ID
        user_id: User ID for verification
        title: New title (optional)
        completed: New completion status (optional)
        order: New order (optional)

    Returns:
        Updated subtask or None if not found or doesn't belong to user
    """
    # Get subtask and verify ownership through task
    subtask = session.get(Subtask, subtask_id)
    if not subtask:
        return None

    task = session.get(Task, subtask.task_id)
    if not task or task.user_id != user_id:
        return None

    # Update fields
    if title is not None:
        subtask.title = title
    if completed is not None:
        subtask.completed = completed
    if order is not None:
        subtask.order = order

    subtask.updated_at = datetime.utcnow()

    session.add(subtask)
    session.commit()
    session.refresh(subtask)

    return subtask


def delete_subtask(
    session: Session,
    subtask_id: int,
    user_id: int
) -> bool:
    """
    Delete a subtask.

    Args:
        session: Database session
        subtask_id: Subtask ID
        user_id: User ID for verification

    Returns:
        True if deleted, False if not found or doesn't belong to user
    """
    # Get subtask and verify ownership through task
    subtask = session.get(Subtask, subtask_id)
    if not subtask:
        return False

    task = session.get(Task, subtask.task_id)
    if not task or task.user_id != user_id:
        return False

    session.delete(subtask)
    session.commit()

    return True
