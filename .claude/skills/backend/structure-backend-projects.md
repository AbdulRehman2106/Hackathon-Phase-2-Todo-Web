# Skill: Structure Backend Projects Cleanly

## Purpose
Establish clear, maintainable directory structures and code organization patterns for FastAPI backend applications.

## When to Use
- Setting up new FastAPI projects
- Refactoring disorganized codebases
- Establishing team conventions
- Reviewing project structure

## Instruction

### Project Structure Overview

A well-structured FastAPI backend MUST have clear separation of concerns:

```
apps/backend/
├── src/
│   ├── __init__.py
│   ├── main.py                 # Application entry point
│   ├── config.py               # Configuration management
│   ├── database.py             # Database connection setup
│   │
│   ├── models/                 # SQLModel database models
│   │   ├── __init__.py
│   │   ├── base.py            # Base model class
│   │   ├── user.py            # User model
│   │   └── task.py            # Task model
│   │
│   ├── schemas/                # Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── user.py            # User schemas
│   │   └── task.py            # Task schemas
│   │
│   ├── routers/                # API route handlers
│   │   ├── __init__.py
│   │   ├── auth.py            # Authentication routes
│   │   ├── users.py           # User routes
│   │   └── tasks.py           # Task routes
│   │
│   ├── services/               # Business logic layer
│   │   ├── __init__.py
│   │   ├── auth_service.py    # Authentication logic
│   │   └── task_service.py    # Task business logic
│   │
│   ├── dependencies/           # FastAPI dependencies
│   │   ├── __init__.py
│   │   ├── auth.py            # Auth dependencies
│   │   └── database.py        # DB session dependency
│   │
│   ├── middleware/             # Custom middleware
│   │   ├── __init__.py
│   │   └── cors.py            # CORS configuration
│   │
│   └── utils/                  # Utility functions
│       ├── __init__.py
│       └── security.py        # Security utilities
│
├── tests/                      # Test files
│   ├── __init__.py
│   ├── conftest.py            # Test fixtures
│   ├── test_auth.py           # Auth tests
│   └── test_tasks.py          # Task tests
│
├── alembic/                    # Database migrations
│   ├── versions/
│   └── env.py
│
├── pyproject.toml             # Dependencies and project config
├── alembic.ini                # Alembic configuration
└── .env.example               # Environment template
```

### Layer Responsibilities

#### main.py - Application Entry Point

```yaml
responsibilities:
  - Create FastAPI application instance
  - Configure middleware
  - Include routers
  - Set up exception handlers
  - Configure CORS

should_not_contain:
  - Business logic
  - Database queries
  - Route handler implementations
```

#### config.py - Configuration

```yaml
responsibilities:
  - Load environment variables
  - Define configuration classes
  - Validate required settings
  - Expose typed configuration

pattern: Pydantic Settings
```

#### models/ - Database Models

```yaml
responsibilities:
  - Define SQLModel table classes
  - Define relationships
  - Handle database-level defaults

naming:
  - One file per major entity
  - Class name matches entity (Task, User)
  - File name is lowercase singular (task.py, user.py)

should_not_contain:
  - Business logic
  - API-specific code
  - Request/response formatting
```

#### schemas/ - Request/Response Schemas

```yaml
responsibilities:
  - Define Pydantic models for API
  - Handle request validation
  - Define response shapes
  - Handle serialization

naming:
  - EntityCreate (for POST requests)
  - EntityUpdate (for PUT/PATCH)
  - EntityResponse (for responses)
  - EntityList (for collection responses)

should_not_contain:
  - Database operations
  - Business logic
```

#### routers/ - API Routes

```yaml
responsibilities:
  - Define API endpoints
  - Handle HTTP concerns
  - Call services for business logic
  - Return appropriate responses

pattern:
  - One router per resource/domain
  - Router handles HTTP, delegates to services

should_not_contain:
  - Complex business logic
  - Direct database access (use services)
  - Inline validation logic
```

#### services/ - Business Logic

```yaml
responsibilities:
  - Implement business rules
  - Orchestrate database operations
  - Handle complex logic
  - Enforce authorization rules

pattern:
  - Pure functions or classes
  - Receives dependencies (session, user)
  - Returns domain objects or raises exceptions

should_not_contain:
  - HTTP-specific code
  - Request/response handling
  - Framework-specific decorators
```

#### dependencies/ - FastAPI Dependencies

```yaml
responsibilities:
  - Define reusable dependencies
  - Handle authentication extraction
  - Provide database sessions
  - Inject common services

patterns:
  - get_current_user: Extract user from token
  - get_db: Provide database session
  - require_admin: Role verification
```

### File Naming Conventions

```yaml
files:
  routers: plural resource name (tasks.py, users.py)
  models: singular entity name (task.py, user.py)
  schemas: singular entity name (task.py, user.py)
  services: singular + _service (task_service.py)
  tests: test_ + module name (test_tasks.py)

classes:
  models: PascalCase entity (Task, User)
  schemas: PascalCase with suffix (TaskCreate, TaskResponse)
  routers: router variable (router = APIRouter())
  services: PascalCase with Service (TaskService or functions)
```

### Import Organization

```yaml
import_order:
  1. Standard library imports
  2. Third-party imports (fastapi, sqlmodel, etc.)
  3. Local imports (relative to project)

within_project:
  models: from src.models.task import Task
  schemas: from src.schemas.task import TaskCreate, TaskResponse
  services: from src.services.task_service import create_task
  dependencies: from src.dependencies.auth import get_current_user
```

### Router Organization Pattern

```yaml
router_structure:
  prefix: /tasks
  tags: ["Tasks"]

  endpoints:
    - POST /: Create task
    - GET /: List tasks
    - GET /{id}: Get task
    - PUT /{id}: Update task
    - DELETE /{id}: Delete task

  file_structure: |
    from fastapi import APIRouter, Depends, status
    from src.schemas.task import TaskCreate, TaskResponse
    from src.dependencies.auth import get_current_user
    from src.services import task_service

    router = APIRouter(prefix="/tasks", tags=["Tasks"])

    @router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
    async def create_task(...):
        ...
```

### Service Layer Pattern

```yaml
service_pattern:
  pure_functions:
    - Receive all dependencies as parameters
    - Return domain objects or raise exceptions
    - No framework dependencies in signature

  example: |
    async def create_task(
        session: AsyncSession,
        user_id: UUID,
        data: TaskCreate
    ) -> Task:
        task = Task(user_id=user_id, **data.model_dump())
        session.add(task)
        await session.commit()
        await session.refresh(task)
        return task
```

### Structure Checklist

#### Essential Directories
- [ ] src/ with __init__.py
- [ ] models/ directory
- [ ] schemas/ directory
- [ ] routers/ directory
- [ ] dependencies/ directory
- [ ] tests/ directory

#### Key Files
- [ ] main.py (entry point)
- [ ] config.py (settings)
- [ ] database.py (connection)
- [ ] pyproject.toml (dependencies)
- [ ] .env.example (template)

#### Organization
- [ ] One router per resource
- [ ] Schemas separate from models
- [ ] Business logic in services
- [ ] Auth in dependencies
- [ ] Tests mirror source structure

## Output Format
Project structure guidelines and directory organization suitable for backend setup documentation.

## Related Skills
- implement-fastapi-from-specs
- apply-auth-middleware
- spec-first-backend-development
