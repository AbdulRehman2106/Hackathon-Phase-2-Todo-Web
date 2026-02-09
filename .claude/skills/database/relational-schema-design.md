# Skill: Relational Database Schema Design

## Purpose
Create well-structured relational database schemas that ensure data integrity, support application requirements, and follow best practices for PostgreSQL databases.

## When to Use
- Designing new database schemas
- Planning data models for features
- Reviewing existing schema designs
- Establishing database conventions

## Instruction

### Schema Design Principles

A well-designed relational schema MUST follow these principles:

1. **Normalization**: Reduce data redundancy (typically 3NF)
2. **Referential Integrity**: Foreign keys enforce relationships
3. **Data Types**: Use appropriate types for each column
4. **Constraints**: Enforce business rules at database level
5. **Naming Conventions**: Consistent, readable naming

### Naming Conventions

```yaml
tables:
  style: snake_case, plural
  examples:
    - users
    - tasks
    - task_categories

columns:
  style: snake_case, singular
  examples:
    - id
    - user_id
    - created_at

primary_keys:
  style: "id" in each table
  type: UUID preferred

foreign_keys:
  style: "{referenced_table_singular}_id"
  examples:
    - user_id (references users)
    - category_id (references categories)

indexes:
  style: "ix_{table}_{column(s)}"
  example: ix_tasks_user_id

constraints:
  unique: "uq_{table}_{column(s)}"
  check: "ck_{table}_{description}"
  foreign_key: "fk_{table}_{referenced_table}"
```

### Standard Column Types

```yaml
identifiers:
  id: UUID (primary key)
  foreign_keys: UUID (references)

strings:
  short_text: VARCHAR(255)
  long_text: TEXT
  email: VARCHAR(255) with check constraint
  enum_values: VARCHAR(50) or ENUM type

numbers:
  count: INTEGER
  amount: DECIMAL(10,2)
  percentage: DECIMAL(5,2)

dates_times:
  timestamp: TIMESTAMP WITH TIME ZONE
  date_only: DATE
  time_only: TIME

boolean:
  flag: BOOLEAN DEFAULT FALSE

json:
  flexible_data: JSONB (PostgreSQL)
```

### Standard Table Structure

Every table SHOULD include:

```sql
-- Standard columns for all tables
id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

For user-owned resources, add:
```sql
user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
```

### Relationship Patterns

#### One-to-Many
```yaml
example: User has many Tasks

parent_table: users
  - id: UUID PRIMARY KEY

child_table: tasks
  - id: UUID PRIMARY KEY
  - user_id: UUID REFERENCES users(id)

constraint: ON DELETE CASCADE (tasks deleted when user deleted)
           OR ON DELETE RESTRICT (prevent user deletion if has tasks)
```

#### Many-to-Many
```yaml
example: Tasks can have many Tags, Tags can be on many Tasks

junction_table: task_tags
  - task_id: UUID REFERENCES tasks(id) ON DELETE CASCADE
  - tag_id: UUID REFERENCES tags(id) ON DELETE CASCADE
  - PRIMARY KEY (task_id, tag_id)
```

#### One-to-One
```yaml
example: User has one Profile

option_1: Columns in same table (preferred if always present)
option_2: Separate table with unique foreign key

separate_table: user_profiles
  - user_id: UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE
```

### Schema Documentation Format

```markdown
## Table: tasks

### Purpose
Stores user task items for the todo application.

### Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| user_id | UUID | No | - | Owner reference |
| title | VARCHAR(255) | No | - | Task title |
| description | TEXT | Yes | NULL | Task details |
| status | VARCHAR(50) | No | 'pending' | Task status |
| priority | VARCHAR(20) | Yes | 'medium' | Task priority |
| due_date | DATE | Yes | NULL | Due date |
| created_at | TIMESTAMPTZ | No | NOW() | Creation time |
| updated_at | TIMESTAMPTZ | No | NOW() | Last update |

### Indexes
| Name | Columns | Type | Purpose |
|------|---------|------|---------|
| ix_tasks_user_id | user_id | BTREE | Filter by user |
| ix_tasks_status | status | BTREE | Filter by status |
| ix_tasks_due_date | due_date | BTREE | Sort by due date |

### Constraints
| Name | Type | Definition |
|------|------|------------|
| pk_tasks | PRIMARY KEY | id |
| fk_tasks_users | FOREIGN KEY | user_id REFERENCES users(id) |
| ck_tasks_status | CHECK | status IN ('pending', 'in_progress', 'completed') |
| ck_tasks_priority | CHECK | priority IN ('low', 'medium', 'high') |

### Relationships
- **Belongs to**: users (via user_id)
- **Has many**: task_tags (junction table)
```

### Design Checklist

#### Table Design
- [ ] Primary key defined (UUID recommended)
- [ ] Foreign keys reference existing tables
- [ ] Appropriate column types selected
- [ ] NOT NULL on required columns
- [ ] DEFAULT values where appropriate
- [ ] created_at and updated_at included

#### Constraints
- [ ] Primary key constraint
- [ ] Foreign key constraints with appropriate ON DELETE
- [ ] UNIQUE constraints where needed
- [ ] CHECK constraints for enum-like values
- [ ] NOT NULL constraints on required fields

#### Indexes
- [ ] Foreign key columns indexed
- [ ] Frequently filtered columns indexed
- [ ] Frequently sorted columns indexed
- [ ] Composite indexes for common query patterns

#### Normalization
- [ ] No repeating groups
- [ ] All columns depend on primary key
- [ ] No transitive dependencies

### Anti-Patterns to Avoid

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| Storing comma-separated values | Hard to query, no integrity | Use junction table |
| Using generic "type" column | Unclear schema | Use separate tables or check constraints |
| No foreign keys | No referential integrity | Add foreign key constraints |
| Wide tables | Performance issues | Split into related tables |
| Storing calculated values | Data inconsistency | Calculate at query time or use views |

## Output Format
Database schema documentation with table definitions, relationships, and constraints suitable for plan.md or dedicated schema documentation.

## Related Skills
- model-user-owned-resources
- design-indexes-performance
- orm-friendly-schema-planning
