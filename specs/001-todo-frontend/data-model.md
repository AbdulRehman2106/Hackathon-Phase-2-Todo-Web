# Data Model: Todo Frontend Application

**Feature**: 001-todo-frontend
**Date**: 2026-02-05
**Phase**: Phase 1 - Data Model Definition

## Overview

This document defines the data entities for the Todo application. The frontend consumes these entities via REST API; the backend implements them using SQLModel with PostgreSQL.

**Important**: Frontend has NO direct database access. All data operations go through the FastAPI backend REST API.

## Entities

### 1. User

**Purpose**: Represents an authenticated user of the application.

**Attributes**:
- `id` (integer, primary key): Unique identifier for the user
- `email` (string, unique, required): User's email address (used for authentication)
- `hashed_password` (string, required): Bcrypt-hashed password (never sent to frontend)
- `created_at` (datetime, required): Timestamp when user account was created
- `updated_at` (datetime, required): Timestamp when user account was last modified

**Relationships**:
- One user has many tasks (one-to-many)

**Validation Rules**:
- Email must be valid format (RFC 5322)
- Email must be unique across all users
- Password must be at least 8 characters (enforced at signup)
- Password is hashed using bcrypt before storage (never stored in plain text)

**Security Notes**:
- `hashed_password` is NEVER included in API responses
- User can only access their own user record
- Email is case-insensitive for uniqueness checks

**Frontend Representation**:
```typescript
interface User {
  id: number;
  email: string;
  created_at: string; // ISO 8601 format
  // Note: hashed_password never sent to frontend
}
```

**Backend Model** (SQLModel):
```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    hashed_password: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    tasks: List["Task"] = Relationship(back_populates="user")
```

---

### 2. Task

**Purpose**: Represents a work item belonging to a user.

**Attributes**:
- `id` (integer, primary key): Unique identifier for the task
- `user_id` (integer, foreign key, required): ID of the user who owns this task
- `title` (string, required): Task title/summary (max 500 characters)
- `description` (string, optional): Detailed task description (no max length)
- `completed` (boolean, required): Whether the task is completed (default: false)
- `created_at` (datetime, required): Timestamp when task was created
- `updated_at` (datetime, required): Timestamp when task was last modified

**Relationships**:
- Each task belongs to exactly one user (many-to-one)

**Validation Rules**:
- `title` is required and cannot be empty string
- `title` maximum length: 500 characters
- `description` is optional (can be null or empty string)
- `completed` defaults to false for new tasks
- `user_id` must reference an existing user
- Tasks are always scoped to the authenticated user (enforced by backend)

**State Transitions**:
- New task: `completed = false`
- Toggle complete: `completed = true`
- Toggle pending: `completed = false`
- Edit: `updated_at` is updated
- Delete: Task is permanently removed (no soft delete)

**Security Notes**:
- User can only access tasks where `user_id` matches their JWT user_id
- Backend MUST filter all queries by authenticated user_id
- Frontend NEVER sends user_id in request body (derived from JWT)

**Frontend Representation**:
```typescript
interface Task {
  id: number;
  user_id: number; // Included in response but not editable
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string; // ISO 8601 format
  updated_at: string; // ISO 8601 format
}

// Create/Update payloads (user_id omitted, derived from JWT)
interface CreateTaskPayload {
  title: string;
  description?: string | null;
}

interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  completed?: boolean;
}
```

**Backend Model** (SQLModel):
```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=500)
    description: Optional[str] = Field(default=None)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: User = Relationship(back_populates="tasks")
```

---

### 3. Session (Conceptual)

**Purpose**: Represents an authenticated user session (managed by Better Auth + JWT).

**Note**: This is NOT a database table. Sessions are stateless and managed via JWT tokens.

**JWT Payload**:
```typescript
interface JWTPayload {
  user_id: number;      // User identifier
  email: string;        // User email
  iat: number;          // Issued at (Unix timestamp)
  exp: number;          // Expiration (Unix timestamp)
}
```

**JWT Storage**:
- Stored in httpOnly cookie (managed by Better Auth)
- Cookie name: `auth_token` (or configured name)
- SameSite: Strict (CSRF protection)
- Secure: true (HTTPS only in production)

**JWT Lifecycle**:
1. **Sign-up/Sign-in**: Backend generates JWT, returns to frontend
2. **Storage**: Better Auth stores JWT in httpOnly cookie
3. **API Requests**: Browser automatically sends cookie with requests
4. **Verification**: Backend middleware verifies JWT on every request
5. **Expiration**: JWT expires after configured duration (e.g., 24 hours)
6. **Refresh**: User must re-authenticate after expiration (no refresh tokens in MVP)

---

## Database Schema

### Tables

**users**:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

**tasks**:
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
```

### Indexes

**Performance Indexes**:
- `users.email`: For fast login lookups
- `tasks.user_id`: For fast user-scoped queries (most common query pattern)
- `tasks.completed`: For filtering by completion status (optional, may not be needed)

**Rationale**:
- User-scoped queries are the most common pattern (GET /api/tasks)
- Email lookup happens on every login
- Completed index may be premature optimization (can add later if needed)

---

## Data Flow Patterns

### 1. User Registration Flow

```
Frontend                Backend                 Database
   |                       |                        |
   |-- POST /auth/signup ->|                        |
   |   {email, password}   |                        |
   |                       |-- Hash password        |
   |                       |-- INSERT INTO users -->|
   |                       |<-- user record --------|
   |                       |-- Generate JWT         |
   |<-- {token, user} -----|                        |
   |                       |                        |
```

### 2. Task Creation Flow

```
Frontend                Backend                 Database
   |                       |                        |
   |-- POST /api/tasks --->|                        |
   |   Authorization: JWT  |                        |
   |   {title, desc}       |                        |
   |                       |-- Verify JWT           |
   |                       |-- Extract user_id      |
   |                       |-- INSERT INTO tasks -->|
   |                       |    (user_id from JWT)  |
   |                       |<-- task record --------|
   |<-- {task} ------------|                        |
   |                       |                        |
```

### 3. Task List Retrieval Flow

```
Frontend                Backend                 Database
   |                       |                        |
   |-- GET /api/tasks ---->|                        |
   |   Authorization: JWT  |                        |
   |                       |-- Verify JWT           |
   |                       |-- Extract user_id      |
   |                       |-- SELECT * FROM tasks->|
   |                       |    WHERE user_id=X     |
   |                       |<-- task records -------|
   |<-- {tasks: [...]} ----|                        |
   |                       |                        |
```

### 4. Task Update Flow (with Ownership Verification)

```
Frontend                Backend                 Database
   |                       |                        |
   |-- PUT /api/tasks/123->|                        |
   |   Authorization: JWT  |                        |
   |   {completed: true}   |                        |
   |                       |-- Verify JWT           |
   |                       |-- Extract user_id      |
   |                       |-- SELECT task WHERE -->|
   |                       |    id=123 AND          |
   |                       |    user_id=X           |
   |                       |<-- task or null -------|
   |                       |-- If null: 404         |
   |                       |-- UPDATE task -------->|
   |                       |<-- updated task -------|
   |<-- {task} ------------|                        |
   |                       |                        |
```

---

## Validation Rules Summary

### User Entity
- ✅ Email: Required, unique, valid format, max 255 chars
- ✅ Password: Required, min 8 chars (at signup), hashed with bcrypt
- ✅ Timestamps: Auto-generated, not user-editable

### Task Entity
- ✅ Title: Required, non-empty, max 500 chars
- ✅ Description: Optional, no max length
- ✅ Completed: Boolean, defaults to false
- ✅ User ID: Required, must reference existing user, derived from JWT
- ✅ Timestamps: Auto-generated, updated_at changes on edit

### Business Rules
- ✅ User can only access their own tasks
- ✅ User cannot access other users' tasks (enforced by backend)
- ✅ Task deletion is permanent (no soft delete)
- ✅ Email is case-insensitive for uniqueness
- ✅ JWT expiration triggers re-authentication

---

## Migration Strategy

### Initial Schema Creation

**Alembic Migration** (backend):
```python
# alembic/versions/001_initial_schema.py
def upgrade():
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )
    op.create_index('idx_users_email', 'users', ['email'])

    # Create tasks table
    op.create_table(
        'tasks',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=False, default=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )
    op.create_index('idx_tasks_user_id', 'tasks', ['user_id'])

def downgrade():
    op.drop_table('tasks')
    op.drop_table('users')
```

---

## Future Considerations (Out of Scope)

### Potential Schema Extensions
- **Task Categories/Tags**: Many-to-many relationship with tags table
- **Task Due Dates**: Add `due_date` column to tasks
- **Task Priority**: Add `priority` enum column (low, medium, high)
- **Task Sharing**: Add `shared_with` many-to-many relationship
- **Soft Delete**: Add `deleted_at` column for soft delete pattern
- **Task History**: Separate audit table for tracking changes

### Performance Optimizations
- **Pagination**: Add limit/offset to task queries for large lists
- **Caching**: Redis cache for frequently accessed tasks
- **Full-Text Search**: PostgreSQL full-text search on title/description
- **Archiving**: Move old completed tasks to archive table

---

## Summary

**Entities Defined**: 2 database tables (User, Task) + 1 conceptual (Session/JWT)

**Key Relationships**:
- User → Tasks (one-to-many)
- Task → User (many-to-one)

**Security Enforcement**:
- All task queries filtered by authenticated user_id from JWT
- No user can access another user's data
- Frontend never sends user_id (always derived from JWT)

**Next Steps**: Define API contracts in contracts/ directory
