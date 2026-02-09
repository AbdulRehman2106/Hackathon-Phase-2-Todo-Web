"""
Task service for business logic related to task operations.

This module provides:
- Get user tasks with filtering
- Create new tasks
- Update existing tasks
- Delete tasks
- User isolation enforcement
"""

from typing import List, Optional
from sqlmodel import Session, select
from ..models.task import Task


def get_user_tasks(session: Session, user_id: int) -> List[Task]:
    """
    Get all tasks for a specific user.

    Args:
        session: Database session
        user_id: ID of the user whose tasks to retrieve

    Returns:
        List of Task objects belonging to the user, ordered by creation date (newest first)

    Example:
        >>> tasks = get_user_tasks(session, user_id=1)
        >>> print(len(tasks))
        5
    """
    statement = select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())
    tasks = session.exec(statement).all()
    return list(tasks)


def get_task_by_id(session: Session, task_id: int, user_id: int) -> Optional[Task]:
    """
    Get a specific task by ID, ensuring it belongs to the user.

    Args:
        session: Database session
        task_id: ID of the task to retrieve
        user_id: ID of the user (for ownership verification)

    Returns:
        Task object if found and belongs to user, None otherwise

    Example:
        >>> task = get_task_by_id(session, task_id=1, user_id=1)
        >>> if task:
        ...     print(task.title)
    """
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = session.exec(statement).first()
    return task


def create_task(
    session: Session,
    user_id: int,
    title: str,
    description: Optional[str] = None,
    category: Optional[str] = None,
    due_date: Optional[str] = None,
    priority: Optional[str] = "medium",
    is_recurring: bool = False,
    recurrence_type: Optional[str] = None,
    recurrence_interval: Optional[int] = 1,
    recurrence_end_date: Optional[str] = None
) -> Task:
    """
    Create a new task for a user.

    Args:
        session: Database session
        user_id: ID of the user creating the task
        title: Task title
        description: Optional task description
        category: Optional task category/tag
        due_date: Optional due date in ISO format
        priority: Task priority (low, medium, high)
        is_recurring: Whether task is recurring
        recurrence_type: Type of recurrence (daily, weekly, monthly, yearly)
        recurrence_interval: Interval for recurrence (e.g., every 2 days)
        recurrence_end_date: End date for recurrence in ISO format

    Returns:
        Created Task object

    Example:
        >>> task = create_task(session, user_id=1, title="Buy groceries", description="Milk, eggs, bread", category="Personal")
        >>> print(task.id)
        1
    """
    from datetime import datetime

    # Parse due_date if provided
    due_date_obj = None
    if due_date:
        try:
            due_date_obj = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            pass

    # Parse recurrence_end_date if provided
    recurrence_end_date_obj = None
    if recurrence_end_date:
        try:
            recurrence_end_date_obj = datetime.fromisoformat(recurrence_end_date.replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            pass

    new_task = Task(
        user_id=user_id,
        title=title,
        description=description,
        completed=False,
        category=category,
        due_date=due_date_obj,
        priority=priority or "medium",
        is_recurring=is_recurring,
        recurrence_type=recurrence_type if is_recurring else None,
        recurrence_interval=recurrence_interval if is_recurring else None,
        recurrence_end_date=recurrence_end_date_obj if is_recurring else None
    )

    session.add(new_task)
    session.commit()
    session.refresh(new_task)

    return new_task


def update_task(
    session: Session,
    task_id: int,
    user_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None,
    completed: Optional[bool] = None,
    category: Optional[str] = None,
    due_date: Optional[str] = None,
    priority: Optional[str] = None,
    is_recurring: Optional[bool] = None,
    recurrence_type: Optional[str] = None,
    recurrence_interval: Optional[int] = None,
    recurrence_end_date: Optional[str] = None
) -> Optional[Task]:
    """
    Update an existing task.

    Args:
        session: Database session
        task_id: ID of the task to update
        user_id: ID of the user (for ownership verification)
        title: New title (optional)
        description: New description (optional)
        completed: New completion status (optional)
        category: New category/tag (optional)
        due_date: New due date in ISO format (optional)
        priority: New priority (optional)
        is_recurring: Whether task is recurring (optional)
        recurrence_type: Type of recurrence (optional)
        recurrence_interval: Interval for recurrence (optional)
        recurrence_end_date: End date for recurrence (optional)

    Returns:
        Updated Task object if found and belongs to user, None otherwise

    Example:
        >>> task = update_task(session, task_id=1, user_id=1, completed=True)
        >>> if task:
        ...     print(task.completed)
        True
    """
    from datetime import datetime

    # Get task with ownership verification
    task = get_task_by_id(session, task_id, user_id)

    if not task:
        return None

    # Update fields if provided
    if title is not None:
        task.title = title
    if description is not None:
        task.description = description
    if completed is not None:
        task.completed = completed
    if category is not None:
        task.category = category
    if due_date is not None:
        try:
            task.due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            pass
    if priority is not None:
        task.priority = priority
    if is_recurring is not None:
        task.is_recurring = is_recurring
    if recurrence_type is not None:
        task.recurrence_type = recurrence_type
    if recurrence_interval is not None:
        task.recurrence_interval = recurrence_interval
    if recurrence_end_date is not None:
        try:
            task.recurrence_end_date = datetime.fromisoformat(recurrence_end_date.replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            pass

    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)

    return task


def delete_task(session: Session, task_id: int, user_id: int) -> bool:
    """
    Delete a task.

    Args:
        session: Database session
        task_id: ID of the task to delete
        user_id: ID of the user (for ownership verification)

    Returns:
        True if task was deleted, False if not found or doesn't belong to user

    Example:
        >>> success = delete_task(session, task_id=1, user_id=1)
        >>> print(success)
        True
    """
    # Get task with ownership verification
    task = get_task_by_id(session, task_id, user_id)

    if not task:
        return False

    session.delete(task)
    session.commit()

    return True
