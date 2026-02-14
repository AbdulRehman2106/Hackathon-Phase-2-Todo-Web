"""
List Tasks MCP Tool.

This tool allows the AI to retrieve and display tasks for users with filtering options.
"""

import logging
from typing import Dict, Any
from sqlmodel import Session, select
from src.mcp.tools.base import MCPToolBase
from src.models.task import Task
from src.validation.security_guard import security_guard

logger = logging.getLogger(__name__)


class ListTasksTool(MCPToolBase):
    """MCP tool for listing tasks."""

    @property
    def name(self) -> str:
        return "list_tasks"

    @property
    def description(self) -> str:
        return "Retrieve tasks for the authenticated user. Supports filtering by completion status (all, pending, or completed)."

    @property
    def parameters(self) -> Dict[str, Any]:
        return {
            "user_id": {
                "description": "ID of the authenticated user (automatically provided by system)",
                "type": "integer",
                "required": True
            },
            "filter": {
                "description": "Filter tasks by status: 'all', 'pending', or 'completed'",
                "type": "string",
                "required": False
            },
            "limit": {
                "description": "Maximum number of tasks to return",
                "type": "integer",
                "required": False
            }
        }

    async def execute(
        self,
        user_id: int,
        filter: str = "all",
        limit: int = 50,
        db: Session = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Execute list_tasks tool.

        Args:
            user_id: Authenticated user ID
            filter: Task filter ('all', 'pending', 'completed')
            limit: Maximum tasks to return
            db: Database session

        Returns:
            Dictionary with success status and task list
        """
        try:
            # Validate user_id
            security_guard.validate_user_id(user_id)

            # Validate filter
            if filter not in ['all', 'pending', 'completed']:
                return self.create_error_result(
                    "Filter must be 'all', 'pending', or 'completed'",
                    "INVALID_FILTER"
                )

            # Build query
            statement = select(Task).where(Task.user_id == user_id)

            if filter == 'pending':
                statement = statement.where(Task.completed == False)
            elif filter == 'completed':
                statement = statement.where(Task.completed == True)

            statement = statement.order_by(Task.created_at.desc()).limit(limit)

            # Execute query
            tasks = db.exec(statement).all()

            logger.info(f"Retrieved {len(tasks)} tasks for user {user_id} (filter: {filter})")

            # Format tasks
            task_list = [
                {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed,
                    "created_at": task.created_at.isoformat(),
                    "updated_at": task.updated_at.isoformat()
                }
                for task in tasks
            ]

            # Generate message
            if not task_list:
                message = "You have no tasks yet. Add one to get started!"
            else:
                filter_text = filter if filter != 'all' else ''
                message = f"You have {len(task_list)} {filter_text} task{'s' if len(task_list) != 1 else ''}"

            return self.create_success_result(
                message=message,
                data={
                    "tasks": task_list,
                    "count": len(task_list),
                    "filter": filter
                }
            )

        except ValueError as e:
            logger.error(f"Validation error in list_tasks: {str(e)}")
            return self.create_error_result(str(e), "VALIDATION_ERROR")
        except Exception as e:
            logger.error(f"Error listing tasks: {str(e)}")
            return self.create_error_result(
                "Failed to retrieve tasks. Please try again.",
                "DATABASE_ERROR"
            )


# Tool instance
list_tasks_tool = ListTasksTool()
