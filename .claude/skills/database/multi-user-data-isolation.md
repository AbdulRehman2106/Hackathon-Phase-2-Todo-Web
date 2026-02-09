# Skill: Multi-User Data Isolation Strategies

## Purpose
Design database-level strategies that ensure users can only access their own data, preventing data leakage across user boundaries.

## When to Use
- Designing multi-user application databases
- Establishing data isolation patterns
- Planning security at the database layer
- Auditing data access patterns

## Instruction

### Data Isolation Principles

Multi-user databases MUST ensure:

1. **Complete Separation**: Users cannot access others' data
2. **Query Safety**: All queries scoped to user context
3. **Defense in Depth**: Multiple layers of protection
4. **Audit Capability**: Track data access patterns

### Isolation Strategies

#### Strategy 1: Row-Level Isolation (Most Common)

All users share tables; rows filtered by user_id.

```yaml
strategy: Row-Level Isolation
implementation: user_id column on all user-owned tables
filtering: WHERE user_id = :current_user_id

advantages:
  - Simple schema
  - Efficient storage
  - Easy to implement
  - Works with any ORM

disadvantages:
  - Requires discipline in queries
  - Application must always filter
  - No database-enforced isolation

schema_pattern:
  every_table:
    user_id: UUID NOT NULL REFERENCES users(id)
    index: ix_{table}_user_id ON {table}(user_id)
```

```sql
-- Example: Tasks table with row-level isolation
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    -- other columns
    CONSTRAINT fk_tasks_users FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX ix_tasks_user_id ON tasks(user_id);

-- All queries MUST include user_id filter
-- SELECT * FROM tasks WHERE user_id = :user_id AND id = :task_id
```

#### Strategy 2: Row-Level Security (RLS) - PostgreSQL

Database enforces isolation through policies.

```yaml
strategy: Row-Level Security
implementation: PostgreSQL RLS policies
enforcement: Database level (automatic)

advantages:
  - Database-enforced
  - Cannot bypass in application code
  - Works even with direct SQL access

disadvantages:
  - PostgreSQL specific
  - Performance overhead
  - More complex setup

requirements:
  - Set user context on each connection
  - Define policies for each table
  - Enable RLS on tables
```

```sql
-- Enable RLS on tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their tasks
CREATE POLICY user_isolation_policy ON tasks
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- Application sets context on connection
SET app.current_user_id = ':user_uuid';

-- Now all queries automatically filtered
SELECT * FROM tasks;  -- Only returns current user's tasks
```

#### Strategy 3: Schema-Per-Tenant

Each user/tenant has separate schema.

```yaml
strategy: Schema-Per-Tenant
implementation: Separate PostgreSQL schemas per tenant
isolation: Complete schema separation

advantages:
  - Strongest isolation
  - Independent backups
  - Independent scaling

disadvantages:
  - Complex management
  - Migration overhead
  - Not suitable for many users

use_case: Enterprise multi-tenancy (organizations, not individual users)

schema_pattern:
  public: Shared tables (users, auth)
  tenant_001: Tenant-specific tables
  tenant_002: Tenant-specific tables
```

### Query Patterns for Isolation

#### Safe Query Patterns

```yaml
list_resources:
  pattern: SELECT * FROM tasks WHERE user_id = :user_id
  note: Always filter by user_id

get_single_resource:
  pattern: SELECT * FROM tasks WHERE id = :id AND user_id = :user_id
  note: Include user_id even for single fetch

update_resource:
  pattern: UPDATE tasks SET title = :title WHERE id = :id AND user_id = :user_id
  note: user_id in WHERE prevents unauthorized updates

delete_resource:
  pattern: DELETE FROM tasks WHERE id = :id AND user_id = :user_id
  note: user_id in WHERE prevents unauthorized deletes

create_resource:
  pattern: INSERT INTO tasks (user_id, title, ...) VALUES (:user_id, :title, ...)
  note: user_id from token, NOT from request body
```

#### Unsafe Patterns to Avoid

```yaml
missing_user_filter:
  bad: SELECT * FROM tasks WHERE id = :id
  good: SELECT * FROM tasks WHERE id = :id AND user_id = :user_id
  risk: Returns any user's task

trusting_request_user_id:
  bad: INSERT INTO tasks (user_id, ...) VALUES (:request_user_id, ...)
  good: INSERT INTO tasks (user_id, ...) VALUES (:token_user_id, ...)
  risk: User creates data as another user

aggregate_without_filter:
  bad: SELECT COUNT(*) FROM tasks WHERE status = 'completed'
  good: SELECT COUNT(*) FROM tasks WHERE user_id = :user_id AND status = 'completed'
  risk: Leaks information about all users

join_without_isolation:
  bad: SELECT t.*, p.name FROM tasks t JOIN projects p ON t.project_id = p.id
  good: SELECT t.*, p.name FROM tasks t JOIN projects p ON t.project_id = p.id WHERE p.user_id = :user_id
  risk: Accesses projects of other users
```

### Hierarchical Data Isolation

For nested resources:

```yaml
pattern: Project → Tasks isolation
principle: Access to child requires ownership of parent

tables:
  projects:
    user_id: Direct ownership
  tasks:
    project_id: Indirect ownership through project

safe_query:
  get_project_tasks: |
    SELECT t.* FROM tasks t
    JOIN projects p ON t.project_id = p.id
    WHERE p.user_id = :user_id AND p.id = :project_id

  get_single_task: |
    SELECT t.* FROM tasks t
    JOIN projects p ON t.project_id = p.id
    WHERE p.user_id = :user_id AND t.id = :task_id
```

### Isolation Verification Checklist

#### Schema Level
- [ ] All user-owned tables have user_id column
- [ ] user_id columns are NOT NULL
- [ ] user_id has foreign key to users table
- [ ] Indexes exist on user_id columns

#### Query Level
- [ ] All SELECT queries include user_id filter
- [ ] All UPDATE queries include user_id in WHERE
- [ ] All DELETE queries include user_id in WHERE
- [ ] INSERT uses user_id from authentication, not request
- [ ] Aggregate queries are user-scoped

#### Application Level
- [ ] user_id extracted from JWT, not request
- [ ] No endpoint accepts user_id as parameter
- [ ] 404 returned for resources not owned (not 403)
- [ ] Audit logging tracks data access

### Testing Isolation

```yaml
test_scenarios:

  cross_user_read:
    setup: User A creates task, User B authenticated
    action: User B requests User A's task by ID
    expected: 404 Not Found
    validates: Read isolation

  cross_user_list:
    setup: User A and B both have tasks
    action: User A lists tasks
    expected: Only User A's tasks returned
    validates: List isolation

  cross_user_update:
    setup: User A creates task, User B authenticated
    action: User B attempts to update User A's task
    expected: 404 or no rows affected
    validates: Update isolation

  cross_user_delete:
    setup: User A creates task, User B authenticated
    action: User B attempts to delete User A's task
    expected: 404 or no rows affected
    validates: Delete isolation

  ownership_spoofing:
    setup: User A authenticated
    action: User A creates task with user_id = User B's ID in body
    expected: Task created with User A's ID (body ignored)
    validates: Creation isolation
```

### Documentation Template

```markdown
## Data Isolation Strategy for [Application]

### Isolation Model
- **Strategy**: Row-Level Isolation
- **Key Column**: user_id on all user-owned tables
- **Enforcement**: Application layer with database foreign keys

### Tables with User Isolation

| Table | Isolation Column | Cascade Behavior |
|-------|------------------|------------------|
| tasks | user_id | CASCADE |
| projects | user_id | CASCADE |
| settings | user_id | CASCADE |

### Query Requirements

All queries MUST:
1. Include user_id filter for user-owned resources
2. Extract user_id from authentication token only
3. Return 404 for resources not owned by current user

### Verification
- Unit tests cover cross-user access attempts
- Code review checklist includes isolation check
- Regular security audits verify isolation
```

## Output Format
Data isolation strategy documentation suitable for security documentation or database design specification.

## Related Skills
- model-user-owned-resources
- relational-schema-design
- enforce-api-data-isolation
