"""
Tool schema validator using Pydantic models.

This module validates tool call parameters against defined schemas
before execution to prevent errors and security issues.
"""

import logging
from typing import Dict, Any
from pydantic import BaseModel, Field, ValidationError

logger = logging.getLogger(__name__)


# Pydantic models for tool parameters

class AddTaskParams(BaseModel):
    """Parameters for add_task tool."""
    user_id: int = Field(..., gt=0, description="User ID")
    title: str = Field(..., min_length=1, max_length=255, description="Task title")
    description: str = Field(default="", max_length=1000, description="Task description")


class ListTasksParams(BaseModel):
    """Parameters for list_tasks tool."""
    user_id: int = Field(..., gt=0, description="User ID")
    filter: str = Field(default="all", pattern="^(all|pending|completed)$", description="Task filter")
    limit: int = Field(default=50, ge=1, le=100, description="Maximum tasks to return")


class CompleteTaskParams(BaseModel):
    """Parameters for complete_task tool."""
    user_id: int = Field(..., gt=0, description="User ID")
    task_id: int = Field(default=None, gt=0, description="Task ID")
    task_title: str = Field(default=None, min_length=1, description="Task title for matching")


class DeleteTaskParams(BaseModel):
    """Parameters for delete_task tool."""
    user_id: int = Field(..., gt=0, description="User ID")
    task_id: int = Field(default=None, gt=0, description="Task ID")
    task_title: str = Field(default=None, min_length=1, description="Task title for matching")


class UpdateTaskParams(BaseModel):
    """Parameters for update_task tool."""
    user_id: int = Field(..., gt=0, description="User ID")
    task_id: int = Field(default=None, gt=0, description="Task ID")
    task_title: str = Field(default=None, min_length=1, description="Current task title for matching")
    new_title: str = Field(default=None, min_length=1, max_length=255, description="New task title")
    new_description: str = Field(default=None, max_length=1000, description="New task description")


class ToolValidator:
    """Validates tool call parameters against schemas."""

    # Map tool names to their parameter models
    TOOL_SCHEMAS = {
        "add_task": AddTaskParams,
        "list_tasks": ListTasksParams,
        "complete_task": CompleteTaskParams,
        "delete_task": DeleteTaskParams,
        "update_task": UpdateTaskParams
    }

    @classmethod
    def validate(cls, tool_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate tool parameters against schema.

        Args:
            tool_name: Name of the tool
            parameters: Parameters to validate

        Returns:
            Validated parameters dictionary

        Raises:
            ValueError: If tool name is unknown
            ValidationError: If parameters are invalid
        """
        if tool_name not in cls.TOOL_SCHEMAS:
            raise ValueError(f"Unknown tool: {tool_name}")

        schema = cls.TOOL_SCHEMAS[tool_name]

        try:
            validated = schema(**parameters)
            logger.info(f"Tool parameters validated: {tool_name}")
            return validated.model_dump()
        except ValidationError as e:
            logger.error(f"Tool parameter validation failed: {tool_name} - {str(e)}")
            raise

    @classmethod
    def validate_tool_call(cls, tool_call: Dict[str, Any]) -> bool:
        """
        Validate that a tool call has the required structure.

        Args:
            tool_call: Tool call dictionary

        Returns:
            True if valid structure, False otherwise
        """
        if not isinstance(tool_call, dict):
            return False

        if "name" not in tool_call or "parameters" not in tool_call:
            return False

        if not isinstance(tool_call["name"], str):
            return False

        if not isinstance(tool_call["parameters"], dict):
            return False

        return True


# Singleton instance
tool_validator = ToolValidator()
