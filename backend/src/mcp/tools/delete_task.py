"""
Delete Task MCP Tool.

This tool allows the AI to permanently delete tasks by ID or title matching.
"""

import logging
from typing import Dict, Any, Optional
from sqlmodel import Session, select
from src.mcp.tools.base import MCPToolBase
from src.models.task import Task
from src.validation.security_guard import security_guard

logger = logging.getLogger(__name__)


class DeleteTaskTool(MCPToolBase):
    """MCP tool for deleting tasks."""

    @property
    def name(self) -> str:
        return "delete_task"

    @property
    def description(self) -> str:
        return "Permanently delete a task. Accepts either task_id or task_title for identification. Validates that the task belongs to the authenticated user."

    @property
    def parameters(self) -> Dict[str, Any]:
        return {
            "user_id": {
                "description": "ID of the authenticated user (automatically provided by system)",
                "type": "integer",
                "required": True
            },
            "task_id": {
                "description": "ID of the task to delete",
                "type": "integer",
                "required": False
            },
            "task_title": {
                "description": "Title or partial title of the task to delete (case-insensitive substring match)",
                "type": "string",
                "required": False
            }
        }

    async def execute(
        self,
        user_id: int,
        task_id: Optional[int] = None,
        task_title: Optional[str] = None,
        db: Session = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Execute delete_task tool.

        Args:
            user_id: Authenticated user ID
            task_id: Task ID to delete
            task_title: Task title for matching
            db: Database session

        Returns:
            Dictionary with success status
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
                        "Task not found",
                        "TASK_NOT_FOUND"
                    )

                if len(matching_tasks) > 1:
                    task_titles = [f"- {t.title} (ID: {t.id})" for t in matching_tasks]
                    return self.create_error_result(
                        f"Multiple tasks match that description:\n" + "\n".join(task_titles) + "\nPlease be more specific or use the task ID.",
                        "AMBIGUOUS_MATCH"
                    )

                task = matching_tasks[0]

            # Store task info before deletion
            task_title_deleted = task.title
            task_id_deleted = task.id

            # Delete task
            db.delete(task)
            db.commit()

            logger.info(f"Task deleted: ID={task_id_deleted}, User={user_id}, Title='{task_title_deleted}'")

            return self.create_success_result(
                message=f"Task '{task_title_deleted}' has been deleted",
                data={
                    "task_id": task_id_deleted,
                    "title": task_title_deleted
                }
            )

        except ValueError as e:
            logger.error(f"Validation error in delete_task: {str(e)}")
            return self.create_error_result(str(e), "VALIDATION_ERROR")
        except Exception as e:
            logger.error(f"Error deleting task: {str(e)}")
            db.rollback()
            return self.create_error_result(
                "Failed to delete task. Please try again.",
                "DATABASE_ERROR"
            )


# Tool instance
delete_task_tool = DeleteTaskTool()
