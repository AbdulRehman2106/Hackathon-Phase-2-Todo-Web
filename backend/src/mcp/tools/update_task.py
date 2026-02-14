"""
Update Task MCP Tool.

This tool allows the AI to modify task titles and descriptions.
"""

import logging
from typing import Dict, Any, Optional
from sqlmodel import Session, select
from src.mcp.tools.base import MCPToolBase
from src.models.task import Task
from src.validation.security_guard import security_guard

logger = logging.getLogger(__name__)


class UpdateTaskTool(MCPToolBase):
    """MCP tool for updating tasks."""

    @property
    def name(self) -> str:
        return "update_task"

    @property
    def description(self) -> str:
        return "Update a task's title and/or description. Accepts either task_id or task_title for identification. Validates that the task belongs to the authenticated user."

    @property
    def parameters(self) -> Dict[str, Any]:
        return {
            "user_id": {
                "description": "ID of the authenticated user (automatically provided by system)",
                "type": "integer",
                "required": True
            },
            "task_id": {
                "description": "ID of the task to update",
                "type": "integer",
                "required": False
            },
            "task_title": {
                "description": "Current title or partial title of the task to update (case-insensitive substring match)",
                "type": "string",
                "required": False
            },
            "new_title": {
                "description": "New title for the task",
                "type": "string",
                "required": False
            },
            "new_description": {
                "description": "New description for the task",
                "type": "string",
                "required": False
            }
        }

    async def execute(
        self,
        user_id: int,
        task_id: Optional[int] = None,
        task_title: Optional[str] = None,
        new_title: Optional[str] = None,
        new_description: Optional[str] = None,
        db: Session = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Execute update_task tool.

        Args:
            user_id: Authenticated user ID
            task_id: Task ID to update
            task_title: Current task title for matching
            new_title: New task title
            new_description: New task description
            db: Database session

        Returns:
            Dictionary with success status and updated task details
        """
        try:
            # Validate user_id
            security_guard.validate_user_id(user_id)

            # Must provide either task_id or task_title
            if not task_id and not task_title:
                return self.create_error_result(
                    "Please specify either a task ID or task title",
                    "MISSING_IDENTIFIER"
                )

            # Must provide at least one update
            if not new_title and new_description is None:
                return self.create_error_result(
                    "Please specify what you'd like to update",
                    "NO_UPDATES"
                )

            # Validate new_title if provided
            if new_title and not new_title.strip():
                return self.create_error_result(
                    "Task title cannot be empty",
                    "INVALID_TITLE"
                )

            # Find task
            if task_id:
                task = await security_guard.validate_task_ownership(db, task_id, user_id)
            else:
                # Search by title (case-insensitive substring match)
                statement = select(Task).where(
                    Task.user_id == user_id,
                    Task.title.ilike(f"%{task_title}%")
                )
                matching_tasks = db.exec(statement).all()

                if not matching_tasks:
                    return self.create_error_result(
                        "Task not found. Use 'show tasks' to see your list",
                        "TASK_NOT_FOUND"
                    )

                if len(matching_tasks) > 1:
                    task_titles = [f"- {t.title} (ID: {t.id})" for t in matching_tasks]
                    return self.create_error_result(
                        f"Multiple tasks match that description:\n" + "\n".join(task_titles) + "\nPlease be more specific or use the task ID.",
                        "AMBIGUOUS_MATCH"
                    )

                task = matching_tasks[0]

            # Update task
            if new_title:
                task.title = new_title.strip()
            if new_description is not None:
                task.description = new_description.strip()

            db.add(task)
            db.commit()
            db.refresh(task)

            logger.info(f"Task updated: ID={task.id}, User={user_id}")

            return self.create_success_result(
                message="Task updated successfully",
                data={
                    "task_id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed,
                    "updated_at": task.updated_at.isoformat()
                }
            )

        except ValueError as e:
            logger.error(f"Validation error in update_task: {str(e)}")
            return self.create_error_result(str(e), "VALIDATION_ERROR")
        except Exception as e:
            logger.error(f"Error updating task: {str(e)}")
            db.rollback()
            return self.create_error_result(
                "Failed to update task. Please try again.",
                "DATABASE_ERROR"
            )


# Tool instance
update_task_tool = UpdateTaskTool()
