"""
Error formatter for user-friendly error messages.

This module maps technical errors to safe, user-friendly messages
without exposing internal system details.
"""

import logging
from typing import Dict, Any, Optional
from enum import Enum

logger = logging.getLogger(__name__)


class ErrorSeverity(str, Enum):
    """Error severity levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ErrorCategory(str, Enum):
    """Error categories for classification."""
    VALIDATION = "validation"
    AUTHENTICATION = "authentication"
    AUTHORIZATION = "authorization"
    NOT_FOUND = "not_found"
    DATABASE = "database"
    EXTERNAL_API = "external_api"
    INTERNAL = "internal"


class ErrorFormatter:
    """
    Formats errors into user-friendly messages.

    This formatter ensures that:
    - Users never see stack traces or technical details
    - Error messages are actionable and helpful
    - Internal details are logged for debugging
    - Severity is properly categorized
    """

    # Map error codes to user-friendly messages
    ERROR_MESSAGES = {
        # Validation errors
        "INVALID_TITLE": "Task title cannot be empty. Please provide a title for your task.",
        "INVALID_FILTER": "Invalid filter. Please use 'all', 'pending', or 'completed'.",
        "MISSING_IDENTIFIER": "Please specify either a task ID or task title.",
        "NO_UPDATES": "Please specify what you'd like to update (title or description).",
        "VALIDATION_ERROR": "The information provided is invalid. Please check and try again.",

        # Task errors
        "TASK_NOT_FOUND": "Task not found. Use 'show tasks' to see your list.",
        "AMBIGUOUS_MATCH": "Multiple tasks match that description. Please be more specific or use the task ID.",
        "ALREADY_COMPLETED": "This task is already marked as complete.",

        # Database errors
        "DATABASE_ERROR": "We're having trouble saving your changes. Please try again in a moment.",
        "CONNECTION_ERROR": "Unable to connect to the database. Please try again later.",

        # AI/API errors
        "AI_SERVICE_ERROR": "The AI service is temporarily unavailable. Please try again.",
        "RATE_LIMIT_EXCEEDED": "Too many requests. Please wait a moment and try again.",
        "TIMEOUT_ERROR": "The request took too long. Please try again.",

        # Authentication/Authorization errors
        "UNAUTHORIZED": "You need to be logged in to do that.",
        "FORBIDDEN": "You don't have permission to access that resource.",
        "INVALID_TOKEN": "Your session has expired. Please log in again.",

        # Generic errors
        "INTERNAL_ERROR": "Something went wrong on our end. We're looking into it.",
        "UNKNOWN_ERROR": "An unexpected error occurred. Please try again."
    }

    @classmethod
    def format_error(
        cls,
        error_code: str,
        error_message: Optional[str] = None,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        category: ErrorCategory = ErrorCategory.INTERNAL,
        internal_details: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Format an error into a user-friendly response.

        Args:
            error_code: Error code for classification
            error_message: Optional custom error message
            severity: Error severity level
            category: Error category
            internal_details: Internal details for logging (not shown to user)

        Returns:
            Formatted error dictionary
        """
        # Get user-friendly message
        user_message = error_message or cls.ERROR_MESSAGES.get(
            error_code,
            cls.ERROR_MESSAGES["UNKNOWN_ERROR"]
        )

        # Log internal details
        if internal_details:
            log_level = cls._get_log_level(severity)
            logger.log(
                log_level,
                f"Error [{error_code}] - Category: {category}, Severity: {severity} - {internal_details}"
            )

        return {
            "success": False,
            "error": user_message,
            "error_code": error_code,
            "severity": severity.value,
            "category": category.value
        }

    @classmethod
    def format_validation_error(cls, message: str, field: Optional[str] = None) -> Dict[str, Any]:
        """Format a validation error."""
        return cls.format_error(
            error_code="VALIDATION_ERROR",
            error_message=message,
            severity=ErrorSeverity.LOW,
            category=ErrorCategory.VALIDATION,
            internal_details=f"Validation failed for field: {field}" if field else None
        )

    @classmethod
    def format_database_error(cls, exception: Exception) -> Dict[str, Any]:
        """Format a database error."""
        return cls.format_error(
            error_code="DATABASE_ERROR",
            severity=ErrorSeverity.HIGH,
            category=ErrorCategory.DATABASE,
            internal_details=str(exception)
        )

    @classmethod
    def format_ai_service_error(cls, exception: Exception) -> Dict[str, Any]:
        """Format an AI service error."""
        return cls.format_error(
            error_code="AI_SERVICE_ERROR",
            severity=ErrorSeverity.MEDIUM,
            category=ErrorCategory.EXTERNAL_API,
            internal_details=str(exception)
        )

    @classmethod
    def format_authentication_error(cls) -> Dict[str, Any]:
        """Format an authentication error."""
        return cls.format_error(
            error_code="UNAUTHORIZED",
            severity=ErrorSeverity.MEDIUM,
            category=ErrorCategory.AUTHENTICATION
        )

    @classmethod
    def format_authorization_error(cls) -> Dict[str, Any]:
        """Format an authorization error."""
        return cls.format_error(
            error_code="FORBIDDEN",
            severity=ErrorSeverity.MEDIUM,
            category=ErrorCategory.AUTHORIZATION
        )

    @staticmethod
    def _get_log_level(severity: ErrorSeverity) -> int:
        """Map severity to logging level."""
        severity_map = {
            ErrorSeverity.LOW: logging.INFO,
            ErrorSeverity.MEDIUM: logging.WARNING,
            ErrorSeverity.HIGH: logging.ERROR,
            ErrorSeverity.CRITICAL: logging.CRITICAL
        }
        return severity_map.get(severity, logging.ERROR)


# Singleton instance
error_formatter = ErrorFormatter()
