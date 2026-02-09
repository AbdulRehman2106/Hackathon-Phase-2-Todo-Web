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
# For Vercel serverless, use /tmp directory for SQLite
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL is None:
    # Check if running on Vercel (serverless environment)
    if os.getenv("VERCEL"):
        # Use /tmp directory which is writable in Vercel serverless
        DATABASE_URL = "sqlite:////tmp/todo.db"
    else:
        # Local development
        DATABASE_URL = "sqlite:///./todo.db"

# Create database engine
# connect_args only needed for SQLite
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    echo=False,  # Disable SQL query logging for serverless
    connect_args=connect_args,
    pool_pre_ping=True,  # Verify connections before using
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
