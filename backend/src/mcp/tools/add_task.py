"""
Add Task MCP Tool.

This tool allows the AI to create new tasks for users through natural language.
"""

import logging
from typing import Dict, Any
from sqlmodel import Session
from src.mcp.tools.base import MCPToolBase
from src.models.task import Task
from src.validation.security_guard import security_guard

logger = logging.getLogger(__name__)


class AddTaskTool(MCPToolBase):
    """MCP tool for adding tasks."""

    @property
    def name(self) -> str:
        return "add_task"

    @property
    def description(self) -> str:
        return "Create a new task for the authenticated user. Extracts task title and optional description from natural language input."

    @property
    def parameters(self) -> Dict[str, Any]:
        return {
            "user_id": {
                "description": "ID of the authenticated user (automatically provided by system)",
                "type": "integer",
                "required": True
            },
            "title": {
                "description": "Task title extracted from user's message",
                "type": "string",
                "required": True
            },
            "description": {
                "description": "Optional task description or additional details",
                "type": "string",
                "required": False
            }
        }

    async def execute(self, user_id: int, title: str, description: str = "", db: Session = None, **kwargs) -> Dict[str, Any]:
        """
        Execute add_task tool.

        Args:
            user_id: Authenticated user ID
            title: Task title
            description: Optional task description
            db: Database session

        Returns:
            Dictionary with success status and task details
        """
        try:
            # Validate user_id
            security_guard.validate_user_id(user_id)

            # Validate title
            if not title or not title.strip():
                logger.error("Task title is empty")
                return self.create_error_result(
                    "Task title cannot be empty",
                    "INVALID_TITLE"
                )

            # Create task in database (wrapped in transaction)
            task = Task(
                user_id=user_id,
                title=title.strip(),
                description=description.strip() if description else "",
                completed=False
            )

            db.add(task)
            db.commit()
            db.refresh(task)

            logger.info(f"Task created: ID={task.id}, User={user_id}, Title='{title[:50]}'")

            # Return structured success response
            return self.create_success_result(
                message=f"Task '{title}' created successfully",
                data={
                    "task_id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed,
                    "created_at": task.created_at.isoformat()
                }
            )

        except ValueError as e:
            logger.error(f"Validation error in add_task: {str(e)}")
            return self.create_error_result(str(e), "VALIDATION_ERROR")
        except Exception as e:
            logger.error(f"Error creating task: {str(e)}")
            db.rollback()
            return self.create_error_result(
                "Failed to create task. Please try again.",
                "DATABASE_ERROR"
            )


# Tool instance
add_task_tool = AddTaskTool()
