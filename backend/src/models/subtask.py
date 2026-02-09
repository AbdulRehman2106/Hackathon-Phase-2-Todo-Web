from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

class Subtask(SQLModel, table=True):
    """Subtask model representing a checklist item within a task."""

    __tablename__ = "subtasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="tasks.id", index=True)
    title: str = Field(max_length=500)
    completed: bool = Field(default=False)
    order: int = Field(default=0)  # For ordering subtasks
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    task: "Task" = Relationship(back_populates="subtasks")

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "task_id": 42,
                "title": "Review documentation",
                "completed": False,
                "order": 0,
                "created_at": "2026-02-05T10:00:00Z",
                "updated_at": "2026-02-05T10:00:00Z"
            }
        }
