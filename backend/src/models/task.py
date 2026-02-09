from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .subtask import Subtask

class Task(SQLModel, table=True):
    """Task model representing a work item belonging to a user."""

    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=500)
    description: Optional[str] = Field(default=None)
    completed: bool = Field(default=False)
    category: Optional[str] = Field(default=None, max_length=50)
    due_date: Optional[datetime] = Field(default=None)
    priority: Optional[str] = Field(default="medium", max_length=20)  # low, medium, high

    # Recurring task fields
    is_recurring: bool = Field(default=False)
    recurrence_type: Optional[str] = Field(default=None, max_length=20)  # daily, weekly, monthly, yearly
    recurrence_interval: Optional[int] = Field(default=1)  # e.g., every 2 days, every 3 weeks
    recurrence_end_date: Optional[datetime] = Field(default=None)
    parent_task_id: Optional[int] = Field(default=None, foreign_key="tasks.id")  # For recurring instances

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: "User" = Relationship(back_populates="tasks")
    subtasks: List["Subtask"] = Relationship(back_populates="task")

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 42,
                "title": "Buy groceries",
                "description": "Milk, eggs, bread",
                "completed": False,
                "category": "Personal",
                "due_date": "2026-02-10T10:00:00Z",
                "created_at": "2026-02-05T10:00:00Z",
                "updated_at": "2026-02-05T10:00:00Z"
            }
        }
