"""
Base class for MCP tools with validation.

All MCP tools should inherit from this base class to ensure
consistent validation and error handling.
"""

import logging
from typing import Dict, Any
from pydantic import BaseModel, Field
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)


class ToolResult(BaseModel):
    """Standard result format for all MCP tools."""
    success: bool
    message: str
    data: Dict[str, Any] = Field(default_factory=dict)


class MCPToolBase(ABC):
    """
    Abstract base class for MCP tools.

    All tools must implement the execute method and define their schema.
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Tool name (must be unique)."""
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        """Human-readable description of what the tool does."""
        pass

    @property
    @abstractmethod
    def parameters(self) -> Dict[str, Any]:
        """
        JSON schema describing the tool's parameters.

        Format for Cohere API:
        {
            "param_name": {
                "description": "Parameter description",
                "type": "string|integer|boolean",
                "required": True|False
            }
        }
        """
        pass

    @abstractmethod
    async def execute(self, **kwargs) -> Dict[str, Any]:
        """
        Execute the tool with given parameters.

        Args:
            **kwargs: Tool parameters

        Returns:
            Dictionary with tool execution result

        Raises:
            ValueError: If parameters are invalid
            Exception: If execution fails
        """
        pass

    def validate_user_id(self, user_id: int) -> None:
        """
        Validate that user_id is provided and valid.

        Args:
            user_id: User ID to validate

        Raises:
            ValueError: If user_id is invalid
        """
        if not user_id or user_id <= 0:
            raise ValueError("Invalid user_id")

    def create_success_result(
        self,
        message: str,
        data: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Create a standardized success result.

        Args:
            message: Success message
            data: Optional data to include

        Returns:
            Standardized success result dictionary
        """
        result = ToolResult(
            success=True,
            message=message,
            data=data or {}
        )
        return result.model_dump()

    def create_error_result(
        self,
        message: str,
        error_code: str = "TOOL_ERROR"
    ) -> Dict[str, Any]:
        """
        Create a standardized error result.

        Args:
            message: Error message
            error_code: Error code for categorization

        Returns:
            Standardized error result dictionary
        """
        return {
            "success": False,
            "message": message,
            "error_code": error_code,
            "data": {}
        }
