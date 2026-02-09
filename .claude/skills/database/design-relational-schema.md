# Design Relational Database Schema

## Purpose
Guide the design of relational database schemas that are normalized, efficient, and maintainable.

## Skill Description
This skill provides principles and patterns for designing relational database schemas that support application requirements while maintaining data integrity and performance.

## Database Design Principles

### 1. Normalization
Organize data to reduce redundancy and improve integrity.

### 2. Data Integrity
Ensure data accuracy and consistency through constraints.

### 3. Performance
Design for efficient queries and scalability.

### 4. Maintainability
Create schemas that are easy to understand and modify.

## Schema Design Process

### Step 1: Identify Entities
Determine the main objects in your domain.

**Example - Todo Application**:
- Users
- Tasks
- Categories
- Tags

### Step 2: Define Attributes
List properties for each entity.

**Users**:
- id
- email
- password_hash
- name
- created_at

**Tasks**:
- id
- title
- description
- status
- due_date
- user_id
- created_at
- updated_at

### Step 3: Identify Relationships
Determine how entities relate to each other.

**Relationships**:
- User has many Tasks (one-to-many)
- Task belongs to one User (many-to-one)
- Task has many Tags (many-to-many)
- Tag has many Tasks (many-to-many)

### Step 4: Define Primary Keys
Unique identifier for each record.

**Options**:
- Auto-incrementing integer (SERIAL)
- UUID (universally unique identifier)
- Composite key (multiple columns)

**Recommendation**: Use SERIAL for internal IDs, UUID for public-facing IDs

### Step 5: Define Foreign Keys
Link related tables together.

**Example**:
```sql
tasks table:
- user_id REFERENCES users(id)
```

### Step 6: Add Constraints
Enforce business rules at database level.

**Types**:
- NOT NULL
- UNIQUE
- CHECK
- DEFAULT
- FOREIGN KEY

## Table Design Patterns

### Basic Table Structure

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Elements**:
- Primary key (id)
- Unique constraint (email)
- NOT NULL constraints
- Timestamps for audit trail

### One-to-Many Relationship

**Pattern**: Foreign key in "many" table

```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Relationship**: One user has many tasks

### Many-to-Many Relationship

**Pattern**: Junction/join table

```sql
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE task_tags (
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id, tag_id)
);
```

**Relationship**: Tasks can have multiple tags, tags can be on multiple tasks

### Self-Referencing Relationship

**Pattern**: Foreign key to same table

```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Use Case**: Hierarchical data (categories with subcategories)

## Data Types

### Common PostgreSQL Types

**Numeric**:
- `SERIAL`: Auto-incrementing integer
- `INTEGER`: 4-byte integer
- `BIGINT`: 8-byte integer
- `DECIMAL(p,s)`: Exact decimal
- `NUMERIC(p,s)`: Exact decimal (same as DECIMAL)

**Text**:
- `VARCHAR(n)`: Variable-length with limit
- `TEXT`: Variable-length unlimited
- `CHAR(n)`: Fixed-length

**Date/Time**:
- `TIMESTAMP`: Date and time
- `TIMESTAMPTZ`: Timestamp with timezone
- `DATE`: Date only
- `TIME`: Time only

**Boolean**:
- `BOOLEAN`: true/false

**JSON**:
- `JSON`: JSON data
- `JSONB`: Binary JSON (faster, indexable)

**UUID**:
- `UUID`: Universally unique identifier

### Type Selection Guidelines

**IDs**:
- Internal: `SERIAL` or `BIGSERIAL`
- Public-facing: `UUID`

**Email/Username**:
- `VARCHAR(255)`

**Passwords**:
- `VARCHAR(255)` (for hashed passwords)

**Descriptions**:
- `TEXT` (unlimited length)

**Status/Enum**:
- `VARCHAR(50)` or PostgreSQL ENUM

**Timestamps**:
- `TIMESTAMPTZ` (includes timezone)

**Money**:
- `DECIMAL(10,2)` (exact precision)

## Constraints

### Primary Key

**Purpose**: Unique identifier for each row

```sql
id SERIAL PRIMARY KEY
```

**Characteristics**:
- Unique
- NOT NULL
- One per table
- Indexed automatically

### Foreign Key

**Purpose**: Maintain referential integrity

```sql
user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
```

**ON DELETE Options**:
- `CASCADE`: Delete related records
- `SET NULL`: Set foreign key to NULL
- `RESTRICT`: Prevent deletion
- `NO ACTION`: Same as RESTRICT

**ON UPDATE Options**:
- `CASCADE`: Update related records
- `SET NULL`: Set foreign key to NULL
- `RESTRICT`: Prevent update

### Unique Constraint

**Purpose**: Ensure column values are unique

```sql
email VARCHAR(255) UNIQUE
```

**Composite Unique**:
```sql
UNIQUE (user_id, task_id)
```

### NOT NULL Constraint

**Purpose**: Require value for column

```sql
title VARCHAR(500) NOT NULL
```

### CHECK Constraint

**Purpose**: Validate column values

```sql
status VARCHAR(50) CHECK (status IN ('pending', 'in_progress', 'completed'))
```

```sql
due_date DATE CHECK (due_date >= CURRENT_DATE)
```

### DEFAULT Constraint

**Purpose**: Provide default value

```sql
status VARCHAR(50) DEFAULT 'pending'
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

## Normalization

### First Normal Form (1NF)
- Atomic values (no arrays or lists in columns)
- Each column has unique name
- Order doesn't matter

**Violation**:
```sql
-- Bad: Multiple values in one column
tasks (id, title, tags)
1, "Task 1", "urgent,work,important"
```

**Correct**:
```sql
-- Good: Separate table for tags
tasks (id, title)
task_tags (task_id, tag_id)
```

### Second Normal Form (2NF)
- Must be in 1NF
- No partial dependencies (all non-key columns depend on entire primary key)

**Violation**:
```sql
-- Bad: order_date depends only on order_id, not on (order_id, product_id)
order_items (order_id, product_id, quantity, order_date)
```

**Correct**:
```sql
orders (order_id, order_date)
order_items (order_id, product_id, quantity)
```

### Third Normal Form (3NF)
- Must be in 2NF
- No transitive dependencies (non-key columns don't depend on other non-key columns)

**Violation**:
```sql
-- Bad: city and state depend on zip_code, not directly on user_id
users (id, name, zip_code, city, state)
```

**Correct**:
```sql
users (id, name, zip_code)
zip_codes (zip_code, city, state)
```

### When to Denormalize

**Reasons**:
- Performance optimization
- Reduce complex joins
- Frequently accessed data

**Example**:
```sql
-- Denormalized: Store user name with task for faster queries
tasks (id, title, user_id, user_name)

-- Trade-off: Redundant data, must update in multiple places
```

## Indexes

### Purpose
Speed up data retrieval at cost of slower writes.

### Types

**Single Column Index**:
```sql
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

**Composite Index**:
```sql
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
```

**Unique Index**:
```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

**Partial Index**:
```sql
CREATE INDEX idx_active_tasks ON tasks(user_id)
WHERE status != 'completed';
```

### Index Guidelines

**Index These**:
- Primary keys (automatic)
- Foreign keys
- Columns in WHERE clauses
- Columns in JOIN conditions
- Columns in ORDER BY

**Don't Index**:
- Small tables
- Columns with low cardinality (few unique values)
- Columns rarely queried
- Columns frequently updated

## Common Patterns

### Soft Delete

**Pattern**: Mark as deleted instead of removing

```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    deleted_at TIMESTAMP NULL,
    -- Other columns
);

-- Query only non-deleted
SELECT * FROM tasks WHERE deleted_at IS NULL;
```

### Audit Trail

**Pattern**: Track who changed what and when

```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES users(id)
);
```

### Versioning

**Pattern**: Keep history of changes

```sql
CREATE TABLE task_versions (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    version INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);
```

### Polymorphic Associations

**Pattern**: Relate to multiple table types

```sql
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    commentable_type VARCHAR(50) NOT NULL, -- 'task' or 'project'
    commentable_id INTEGER NOT NULL,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Schema Documentation

### Table Documentation Template

```sql
-- Table: users
-- Description: Stores user account information
-- Relationships:
--   - Has many tasks
--   - Has many projects
CREATE TABLE users (
    -- Primary key
    id SERIAL PRIMARY KEY,

    -- Authentication
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    -- Profile
    name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);

-- Comments
COMMENT ON TABLE users IS 'User accounts and authentication';
COMMENT ON COLUMN users.email IS 'Unique email address for login';
```

## Best Practices

1. **Use Meaningful Names**: Clear, descriptive table and column names

2. **Consistent Naming**: Follow convention (snake_case, plural table names)

3. **Primary Keys**: Every table should have one

4. **Foreign Keys**: Enforce referential integrity

5. **NOT NULL**: Use for required fields

6. **Defaults**: Provide sensible defaults

7. **Timestamps**: Include created_at and updated_at

8. **Indexes**: Index foreign keys and frequently queried columns

9. **Constraints**: Enforce business rules at database level

10. **Documentation**: Comment tables and complex columns

## Common Mistakes

1. **No Primary Key**: Every table needs unique identifier

2. **Missing Foreign Keys**: Relationships not enforced

3. **Wrong Data Types**: Using VARCHAR for numbers, etc.

4. **No Indexes on Foreign Keys**: Slow joins

5. **Over-Indexing**: Too many indexes slow writes

6. **No Timestamps**: Can't track when records created/modified

7. **Storing Calculated Values**: Should be computed, not stored

8. **Using Reserved Words**: Avoid SQL keywords as names

## Success Criteria

Well-designed schema provides:
- Data integrity through constraints
- Efficient queries through proper indexing
- Clear relationships between entities
- Scalability for growth
- Maintainability for changes
- Documentation for understanding

---

**Application**: Use this skill when designing database schemas for new applications, refactoring existing schemas, or planning data models.
