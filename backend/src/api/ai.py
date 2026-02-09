"""
AI-powered task management endpoints using Cohere.

This module provides REST API endpoints for AI features:
- Task suggestions
- Smart auto-completion
- Task categorization
- Description enhancement
- Complexity analysis
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from src.services.cohere_ai import cohere_service
from src.middleware.jwt_auth import get_current_user

router = APIRouter()


# Request/Response Models
class TaskSuggestionRequest(BaseModel):
    context: str = Field(..., description="Context to generate suggestions from")
    count: int = Field(default=5, ge=1, le=10, description="Number of suggestions")


class TaskSuggestionResponse(BaseModel):
    suggestions: List[str]


class EnhanceDescriptionRequest(BaseModel):
    title: str = Field(..., description="Task title")
    description: str = Field(default="", description="Current description")


class EnhanceDescriptionResponse(BaseModel):
    enhanced_description: str


class CategorizeTaskRequest(BaseModel):
    title: str = Field(..., description="Task title")
    description: str = Field(default="", description="Task description")


class CategorizeTaskResponse(BaseModel):
    category: str
    priority: str
    tags: List[str]


class AutoCompleteRequest(BaseModel):
    partial_title: str = Field(..., description="Partial task title")


class AutoCompleteResponse(BaseModel):
    completions: List[str]


class AnalyzeComplexityRequest(BaseModel):
    title: str = Field(..., description="Task title")
    description: str = Field(default="", description="Task description")


class AnalyzeComplexityResponse(BaseModel):
    complexity: str
    estimated_time: str
    needs_subtasks: bool


# Endpoints
@router.post("/suggestions", response_model=TaskSuggestionResponse)
async def generate_task_suggestions(
    request: TaskSuggestionRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate AI-powered task suggestions based on context.

    Requires authentication.
    """
    try:
        suggestions = cohere_service.generate_task_suggestions(
            context=request.context,
            count=request.count
        )

        if not suggestions:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate suggestions. Please try again."
            )

        return TaskSuggestionResponse(suggestions=suggestions)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating suggestions: {str(e)}"
        )


@router.post("/enhance-description", response_model=EnhanceDescriptionResponse)
async def enhance_task_description(
    request: EnhanceDescriptionRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Enhance a task description with AI to make it more clear and actionable.

    Requires authentication.
    """
    try:
        enhanced = cohere_service.enhance_task_description(
            title=request.title,
            description=request.description
        )

        return EnhanceDescriptionResponse(enhanced_description=enhanced)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error enhancing description: {str(e)}"
        )


@router.post("/categorize", response_model=CategorizeTaskResponse)
async def categorize_task(
    request: CategorizeTaskRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Categorize a task and suggest priority level using AI.

    Requires authentication.
    """
    try:
        result = cohere_service.categorize_task(
            title=request.title,
            description=request.description
        )

        return CategorizeTaskResponse(**result)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error categorizing task: {str(e)}"
        )


@router.post("/autocomplete", response_model=AutoCompleteResponse)
async def autocomplete_task(
    request: AutoCompleteRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Provide smart auto-completion suggestions for task titles.

    Requires authentication.
    """
    try:
        completions = cohere_service.smart_complete_task(
            partial_title=request.partial_title
        )

        return AutoCompleteResponse(completions=completions)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating completions: {str(e)}"
        )


@router.post("/analyze-complexity", response_model=AnalyzeComplexityResponse)
async def analyze_task_complexity(
    request: AnalyzeComplexityRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Analyze task complexity and provide time estimates using AI.

    Requires authentication.
    """
    try:
        result = cohere_service.analyze_task_complexity(
            title=request.title,
            description=request.description
        )

        return AnalyzeComplexityResponse(**result)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing complexity: {str(e)}"
        )


@router.get("/health")
async def ai_health_check():
    """
    Check if AI service is properly configured.

    Does not require authentication.
    """
    try:
        import os
        api_key = os.getenv("COHERE_API_KEY")

        if not api_key:
            return {
                "status": "error",
                "message": "COHERE_API_KEY not configured"
            }

        return {
            "status": "healthy",
            "message": "AI service is configured and ready",
            "provider": "Cohere"
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
