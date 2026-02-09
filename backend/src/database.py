"""
Database configuration and session management.

This module provides:
- Database engine creation
- Session management
- Dependency injection for FastAPI routes
"""

import os
from typing import Generator

from sqlmodel import Session, create_engine, SQLModel

# Get database URL from environment variable
# Using SQLite for development/testing
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./todo.db"
)

# Create database engine
# connect_args only needed for SQLite
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    echo=False,  # Disable SQL query logging for serverless
    connect_args=connect_args
)


def create_db_and_tables():
    """Create all database tables."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """
    Dependency function to provide database session to FastAPI routes.

    Yields:
        Session: SQLModel database session

    Example:
        @app.get("/items")
        def get_items(session: Session = Depends(get_session)):
            items = session.exec(select(Item)).all()
            return items
    """
    with Session(engine) as session:
        yield session
