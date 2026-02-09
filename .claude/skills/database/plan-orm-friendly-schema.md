# Plan ORM-Friendly Schema

## Purpose
Guide the design of database schemas that work efficiently with Object-Relational Mapping (ORM) tools like SQLModel, SQLAlchemy, and similar frameworks.

## Skill Description
This skill provides principles for designing database schemas that are easy to map to ORM models while maintaining good database design practices.

## ORM Fundamentals

### What is an ORM?
Object-Relational Mapping (ORM) is a technique that lets you query and manipulate data using object-oriented programming paradigms.

**Benefits**:
- Write database queries in programming language
- Automatic SQL generation
- Type safety
- Reduced boilerplate code
- Database abstraction

**Common ORMs**:
- Python: SQLAlchemy, SQLModel, Django ORM
- JavaScript: Sequelize, TypeORM, Prisma
- Java: Hibernate
- C#: Entity Framework

## ORM-Friendly Design Principles

### 1. Simple Primary Keys

**Preferred**: Single-column integer or UUID primary keys

```sql
-- Good: Simple primary key
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL
);
```

**Avoid**: Composite primary keys (harder to map)

```sql
-- Problematic for ORMs
CREATE TABLE user_roles (
    user_id INTEGER,
    role_id INTEGER,
    PRIMARY KEY (user_id, role_id)
);

-- Better: Add surrogate key
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    UNIQUE (user_id, role_id)
);
```

### 2. Consistent Naming Conventions

**Table Names**:
- Plural nouns: `users`, `tasks`, `projects`
- Lowercase with underscores: `user_profiles`, `task_categories`

**Column Names**:
- Lowercase with underscores: `created_at`, `user_id`
- Descriptive: `email_address` not `email_addr`

**Foreign Keys**:
- Pattern: `{table_singular}_id`
- Examples: `user_id`, `task_id`, `project_id`

**Timestamps**:
- Standard names: `created_at`, `updated_at`, `deleted_at`
- Use TIMESTAMP or TIMESTAMPTZ type

### 3. Explicit Relationships

**One-to-Many**:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);
```

**ORM Mapping (SQLModel)**:
```python
class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str
    tasks: list["Task"] = Relationship(back_populates="user")

class Task(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    user_id: int = Field(foreign_key="users.id")
    user: User = Relationship(back_populates="tasks")
```

**Many-to-Many**:
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE task_tags (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE (task_id, tag_id)
);
```

**ORM Mapping (SQLModel)**:
```python
class TaskTag(SQLModel, table=True):
    __tablename__ = "task_tags"
    id: int | None = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="tasks.id")
    tag_id: int = Field(foreign_key="tags.id")

class Task(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    tags: list["Tag"] = Relationship(link_model=TaskTag)

class Tag(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    tasks: list["Task"] = Relationship(link_model=TaskTag)
```

### 4. Nullable vs NOT NULL

**Be Explicit**:
```sql
-- Clear intent
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,        -- Required
    description TEXT,                    -- Optional (nullable)
    due_date DATE,                       -- Optional
    user_id INTEGER NOT NULL             -- Required
);
```

**ORM Mapping**:
```python
class Task(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str                           # Required (no Optional)
    description: str | None = None       # Optional
    due_date: date | None = None         # Optional
    user_id: int                         # Required
```

### 5. Default Values

**Database Defaults**:
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**ORM Mapping**:
```python
class Task(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    status: str = Field(default="pending")
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

## Data Type Mapping

### Common Type Mappings

**PostgreSQL → Python (SQLModel)**:

| PostgreSQL | Python Type | Notes |
|------------|-------------|-------|
| SERIAL | int | Auto-increment |
| INTEGER | int | 4-byte integer |
| BIGINT | int | 8-byte integer |
| VARCHAR(n) | str | Variable length |
| TEXT | str | Unlimited length |
| BOOLEAN | bool | True/False |
| TIMESTAMP | datetime | Date and time |
| TIMESTAMPTZ | datetime | With timezone |
| DATE | date | Date only |
| TIME | time | Time only |
| DECIMAL(p,s) | Decimal | Exact decimal |
| UUID | UUID | Unique identifier |
| JSON | dict | JSON data |
| JSONB | dict | Binary JSON |

**Example Schema**:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);
```

**ORM Model**:
```python
from datetime import datetime
from uuid import UUID

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(max_length=255)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: dict | None = None
```

## Relationship Patterns

### One-to-One

**Schema**:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL
);

CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    bio TEXT,
    avatar_url VARCHAR(500)
);
```

**ORM Model**:
```python
class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str
    profile: "UserProfile" = Relationship(back_populates="user")

class UserProfile(SQLModel, table=True):
    __tablename__ = "user_profiles"
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", unique=True)
    bio: str | None = None
    avatar_url: str | None = None
    user: User = Relationship(back_populates="profile")
```

### Self-Referencing

**Schema**:
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INTEGER REFERENCES categories(id)
);
```

**ORM Model**:
```python
class Category(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    parent_id: int | None = Field(default=None, foreign_key="categories.id")

    parent: "Category" = Relationship(
        back_populates="children",
        sa_relationship_kwargs={"remote_side": "Category.id"}
    )
    children: list["Category"] = Relationship(back_populates="parent")
```

## Timestamps and Audit Fields

### Standard Pattern

**Schema**:
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);
```

**ORM Model with Auto-Update**:
```python
from datetime import datetime

class Task(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow}
    )
    created_by: int | None = Field(default=None, foreign_key="users.id")
    updated_by: int | None = Field(default=None, foreign_key="users.id")
```

## Soft Delete Pattern

**Schema**:
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    deleted_at TIMESTAMP NULL,
    deleted_by INTEGER REFERENCES users(id)
);
```

**ORM Model**:
```python
class Task(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    deleted_at: datetime | None = None
    deleted_by: int | None = Field(default=None, foreign_key="users.id")

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None
```

**Query Non-Deleted**:
```python
# Get active tasks
active_tasks = session.exec(
    select(Task).where(Task.deleted_at.is_(None))
).all()
```

## Enum Handling

### Database Enum

**Schema**:
```sql
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed');

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    status task_status DEFAULT 'pending'
);
```

**ORM Model**:
```python
from enum import Enum

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class Task(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    status: TaskStatus = Field(default=TaskStatus.PENDING)
```

### String-Based Enum (More Flexible)

**Schema**:
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'completed'))
);
```

**ORM Model**: Same as above

## JSON/JSONB Fields

**Schema**:
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    metadata JSONB,
    settings JSONB DEFAULT '{}'::jsonb
);
```

**ORM Model**:
```python
from typing import Any

class Task(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    metadata: dict[str, Any] | None = None
    settings: dict[str, Any] = Field(default_factory=dict)
```

**Usage**:
```python
task = Task(
    title="Example",
    metadata={"priority": "high", "tags": ["urgent"]},
    settings={"notifications": True}
)
```

## Indexes in ORM

**Schema**:
```sql
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

**ORM Model**:
```python
from sqlmodel import Field, Index

class Task(SQLModel, table=True):
    __table_args__ = (
        Index("idx_tasks_user_id", "user_id"),
        Index("idx_tasks_status", "status"),
    )

    id: int | None = Field(default=None, primary_key=True)
    title: str
    user_id: int = Field(foreign_key="users.id")
    status: str

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
```

## Migration Considerations

### Schema Evolution

**Add Column**:
```sql
ALTER TABLE tasks ADD COLUMN priority VARCHAR(50) DEFAULT 'medium';
```

**ORM Model Update**:
```python
class Task(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    priority: str = Field(default="medium")  # New field
```

### Alembic/Migration Tools

**Generate Migration**:
```bash
alembic revision --autogenerate -m "Add priority to tasks"
```

**Migration File**:
```python
def upgrade():
    op.add_column('tasks',
        sa.Column('priority', sa.String(50), server_default='medium')
    )

def downgrade():
    op.drop_column('tasks', 'priority')
```

## Best Practices

1. **Simple Primary Keys**: Use SERIAL or UUID, avoid composite keys

2. **Consistent Naming**: Follow conventions for tables, columns, foreign keys

3. **Explicit Nullability**: Make nullable vs required clear

4. **Standard Timestamps**: Use created_at, updated_at consistently

5. **Foreign Key Constraints**: Always define relationships in database

6. **Appropriate Data Types**: Match database types to ORM types

7. **Index Foreign Keys**: Essential for query performance

8. **Document Relationships**: Clear back_populates in ORM models

9. **Use Migrations**: Track schema changes with migration tools

10. **Test Mappings**: Verify ORM models match database schema

## Common Pitfalls

### 1. Composite Primary Keys

**Problem**: Difficult to map in ORMs

**Solution**: Add surrogate key

### 2. Inconsistent Naming

**Problem**: Confusion between database and code

**Solution**: Follow consistent conventions

### 3. Missing Foreign Keys

**Problem**: Relationships not enforced

**Solution**: Always define foreign key constraints

### 4. Wrong Data Types

**Problem**: Type mismatches cause errors

**Solution**: Match database and ORM types carefully

### 5. No Indexes on Foreign Keys

**Problem**: Slow queries

**Solution**: Index all foreign keys

## Validation Checklist

- [ ] All tables have simple primary keys
- [ ] Naming conventions consistent
- [ ] Foreign keys defined in database
- [ ] Nullable vs NOT NULL explicit
- [ ] Appropriate data types used
- [ ] Timestamps included (created_at, updated_at)
- [ ] Foreign keys indexed
- [ ] Relationships documented in ORM
- [ ] Migrations set up
- [ ] ORM models tested

## Success Criteria

ORM-friendly schema provides:
- Easy mapping to ORM models
- Type-safe database operations
- Efficient queries
- Clear relationships
- Maintainable code
- Good performance

---

**Application**: Use this skill when designing database schemas for applications using ORMs, planning data models, or setting up new projects with SQLModel/SQLAlchemy.
