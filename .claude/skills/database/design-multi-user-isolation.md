# Design Multi-User Data Isolation Strategies

## Purpose
Guide the design of database-level strategies to ensure data isolation between users in multi-tenant applications.

## Skill Description
This skill provides patterns and techniques for implementing data isolation at the database level to prevent users from accessing each other's data.

## Data Isolation Levels

### 1. Application-Level Isolation
**Approach**: Application code filters data by user

**Implementation**:
```sql
-- Application always includes user_id in queries
SELECT * FROM tasks WHERE user_id = 123;
```

**Pros**:
- Simple to implement
- Flexible
- No database changes needed

**Cons**:
- Relies on application code
- Can be bypassed by bugs
- No database-level enforcement

### 2. Database-Level Isolation
**Approach**: Database enforces isolation automatically

**Implementation**: Row-Level Security, Views, Schemas

**Pros**:
- Enforced at database level
- Can't be bypassed by application bugs
- Defense in depth

**Cons**:
- More complex setup
- Database-specific features
- May impact performance

### 3. Physical Isolation
**Approach**: Separate databases per tenant

**Implementation**: One database per user/organization

**Pros**:
- Complete isolation
- Easy to backup/restore per tenant
- Scalable

**Cons**:
- Complex management
- Higher costs
- Schema updates across all databases

## Row-Level Security (PostgreSQL)

### Concept
Database automatically filters rows based on user context.

### Basic Implementation

**Enable RLS**:
```sql
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
```

**Create Policy**:
```sql
CREATE POLICY user_tasks_policy ON tasks
FOR ALL
TO authenticated_user
USING (user_id = current_setting('app.current_user_id')::INTEGER);
```

**Set User Context**:
```sql
-- Application sets current user before queries
SET app.current_user_id = 123;

-- All queries automatically filtered
SELECT * FROM tasks;  -- Only returns user 123's tasks
```

### Policy Types

**SELECT Policy**:
```sql
CREATE POLICY user_select_policy ON tasks
FOR SELECT
USING (user_id = current_setting('app.current_user_id')::INTEGER);
```

**INSERT Policy**:
```sql
CREATE POLICY user_insert_policy ON tasks
FOR INSERT
WITH CHECK (user_id = current_setting('app.current_user_id')::INTEGER);
```

**UPDATE Policy**:
```sql
CREATE POLICY user_update_policy ON tasks
FOR UPDATE
USING (user_id = current_setting('app.current_user_id')::INTEGER)
WITH CHECK (user_id = current_setting('app.current_user_id')::INTEGER);
```

**DELETE Policy**:
```sql
CREATE POLICY user_delete_policy ON tasks
FOR DELETE
USING (user_id = current_setting('app.current_user_id')::INTEGER);
```

### Complex Policies

**Owner or Admin**:
```sql
CREATE POLICY task_access_policy ON tasks
FOR ALL
USING (
    user_id = current_setting('app.current_user_id')::INTEGER
    OR
    EXISTS (
        SELECT 1 FROM users
        WHERE id = current_setting('app.current_user_id')::INTEGER
        AND role = 'admin'
    )
);
```

**Shared Resources**:
```sql
CREATE POLICY project_access_policy ON projects
FOR SELECT
USING (
    owner_id = current_setting('app.current_user_id')::INTEGER
    OR
    EXISTS (
        SELECT 1 FROM project_members
        WHERE project_id = projects.id
        AND user_id = current_setting('app.current_user_id')::INTEGER
    )
);
```

**Time-Based Access**:
```sql
CREATE POLICY temporary_access_policy ON documents
FOR SELECT
USING (
    owner_id = current_setting('app.current_user_id')::INTEGER
    OR
    EXISTS (
        SELECT 1 FROM document_access
        WHERE document_id = documents.id
        AND user_id = current_setting('app.current_user_id')::INTEGER
        AND valid_from <= NOW()
        AND (valid_until IS NULL OR valid_until > NOW())
    )
);
```

## Database Views for Isolation

### User-Specific Views

**Create View**:
```sql
CREATE VIEW my_tasks AS
SELECT *
FROM tasks
WHERE user_id = current_setting('app.current_user_id')::INTEGER;
```

**Grant Access**:
```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON my_tasks TO app_user;
```

**Application Usage**:
```sql
-- Set user context
SET app.current_user_id = 123;

-- Query view (automatically filtered)
SELECT * FROM my_tasks;
```

### Updatable Views

**Create Updatable View**:
```sql
CREATE VIEW my_tasks AS
SELECT id, title, description, status, created_at
FROM tasks
WHERE user_id = current_setting('app.current_user_id')::INTEGER;

-- Make it updatable
CREATE RULE my_tasks_insert AS
ON INSERT TO my_tasks
DO INSTEAD
INSERT INTO tasks (title, description, status, user_id)
VALUES (NEW.title, NEW.description, NEW.status,
        current_setting('app.current_user_id')::INTEGER);
```

## Schema-Based Isolation

### Separate Schemas Per Tenant

**Create Schemas**:
```sql
CREATE SCHEMA user_123;
CREATE SCHEMA user_456;
```

**Create Tables in Schemas**:
```sql
CREATE TABLE user_123.tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_456.tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Set Search Path**:
```sql
-- Application sets schema for user
SET search_path TO user_123, public;

-- Queries use user's schema
SELECT * FROM tasks;  -- Queries user_123.tasks
```

**Pros**:
- Complete isolation
- Easy to backup per user
- Clear separation

**Cons**:
- Schema management overhead
- Schema updates for all users
- Connection pooling complexity

## Partition-Based Isolation

### Table Partitioning by User

**Create Partitioned Table**:
```sql
CREATE TABLE tasks (
    id SERIAL,
    title VARCHAR(500) NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) PARTITION BY LIST (user_id);
```

**Create Partitions**:
```sql
CREATE TABLE tasks_user_123 PARTITION OF tasks
FOR VALUES IN (123);

CREATE TABLE tasks_user_456 PARTITION OF tasks
FOR VALUES IN (456);
```

**Query**:
```sql
-- Automatically routes to correct partition
SELECT * FROM tasks WHERE user_id = 123;
```

**Pros**:
- Performance benefits
- Physical separation
- Easier maintenance per partition

**Cons**:
- Complex setup
- Partition management
- Limited to known users

## Connection-Level Isolation

### Database Roles Per User

**Create Roles**:
```sql
CREATE ROLE user_123 LOGIN PASSWORD 'secure_password';
CREATE ROLE user_456 LOGIN PASSWORD 'secure_password';
```

**Grant Permissions**:
```sql
-- User can only see their own data
GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO user_123;

-- RLS ensures they only see their rows
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_policy ON tasks
USING (user_id = current_user::INTEGER);
```

**Connect as User**:
```
psql -U user_123 -d mydb
```

## Hybrid Approaches

### Application + Database Isolation

**Layer 1: Application Filtering**:
```python
def get_user_tasks(user_id: int):
    return db.query(Task).filter(Task.user_id == user_id).all()
```

**Layer 2: Database RLS**:
```sql
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_tasks_policy ON tasks
USING (user_id = current_setting('app.current_user_id')::INTEGER);
```

**Benefits**:
- Defense in depth
- Application bugs can't bypass database
- Clear intent in application code

### Organization + User Isolation

**Schema**:
```sql
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    organization_id INTEGER NOT NULL REFERENCES organizations(id)
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    organization_id INTEGER NOT NULL REFERENCES organizations(id)
);
```

**RLS Policy**:
```sql
CREATE POLICY org_isolation_policy ON tasks
USING (
    organization_id IN (
        SELECT organization_id FROM users
        WHERE id = current_setting('app.current_user_id')::INTEGER
    )
);
```

## Performance Considerations

### Index Strategy

**User ID Index**:
```sql
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

**Composite Index**:
```sql
CREATE INDEX idx_tasks_user_created ON tasks(user_id, created_at DESC);
```

**Partial Index**:
```sql
CREATE INDEX idx_active_tasks_user ON tasks(user_id)
WHERE deleted_at IS NULL;
```

### Query Optimization

**Efficient Filtering**:
```sql
-- Good: Uses index
SELECT * FROM tasks WHERE user_id = 123;

-- Bad: Full table scan
SELECT * FROM tasks WHERE user_id IN (SELECT id FROM users);
```

**Avoid N+1 Queries**:
```sql
-- Bad: Multiple queries
SELECT * FROM tasks WHERE user_id = 123;
SELECT * FROM users WHERE id = 123;

-- Good: Single query with JOIN
SELECT t.*, u.name
FROM tasks t
JOIN users u ON t.user_id = u.id
WHERE t.user_id = 123;
```

## Testing Data Isolation

### Test Cases

**Test 1: User Cannot See Others' Data**:
```sql
-- Create data for user 123
INSERT INTO tasks (title, user_id) VALUES ('Task 1', 123);

-- Set context to user 456
SET app.current_user_id = 456;

-- Attempt to query
SELECT * FROM tasks WHERE id = 1;
-- Should return no rows
```

**Test 2: User Cannot Modify Others' Data**:
```sql
-- Set context to user 456
SET app.current_user_id = 456;

-- Attempt to update user 123's task
UPDATE tasks SET title = 'Hacked' WHERE id = 1;
-- Should fail or affect 0 rows
```

**Test 3: User Cannot Delete Others' Data**:
```sql
-- Set context to user 456
SET app.current_user_id = 456;

-- Attempt to delete user 123's task
DELETE FROM tasks WHERE id = 1;
-- Should fail or affect 0 rows
```

**Test 4: Shared Resource Access**:
```sql
-- Add user 456 as collaborator
INSERT INTO project_members (project_id, user_id) VALUES (1, 456);

-- Set context to user 456
SET app.current_user_id = 456;

-- Query shared project
SELECT * FROM projects WHERE id = 1;
-- Should return the project
```

## Security Best Practices

### 1. Defense in Depth
- Application-level filtering
- Database-level enforcement
- Regular security audits

### 2. Principle of Least Privilege
- Grant minimum necessary permissions
- Use specific policies, not broad access

### 3. Audit Logging
```sql
CREATE TABLE access_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(50) NOT NULL,
    record_id INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Regular Testing
- Automated isolation tests
- Penetration testing
- Security reviews

### 5. Monitor Access Patterns
- Track unusual queries
- Alert on suspicious activity
- Review access logs

## Common Pitfalls

### 1. Forgetting to Set User Context
**Problem**: RLS policies don't work without context

**Solution**: Always set user context before queries

### 2. Performance Impact
**Problem**: Complex policies slow queries

**Solution**: Optimize policies, use appropriate indexes

### 3. Policy Gaps
**Problem**: Missing policies for some operations

**Solution**: Test all CRUD operations

### 4. Circular Dependencies
**Problem**: Policies reference tables with policies

**Solution**: Careful policy design, avoid circular references

### 5. Maintenance Overhead
**Problem**: Policies need updates with schema changes

**Solution**: Document policies, test after changes

## Strategy Selection Guide

| Strategy | Isolation Level | Complexity | Performance | Use Case |
|----------|----------------|------------|-------------|----------|
| Application-Level | Medium | Low | High | Simple apps |
| Row-Level Security | High | Medium | Medium | Most apps |
| Views | Medium | Low | Medium | Read-heavy |
| Schemas | Very High | High | High | Large tenants |
| Partitions | High | High | Very High | Scale |
| Separate DBs | Complete | Very High | High | Enterprise |

## Best Practices

1. **Start with Application-Level**: Simple and flexible

2. **Add Database-Level**: Defense in depth

3. **Index user_id**: Essential for performance

4. **Test Thoroughly**: Verify isolation works

5. **Monitor Performance**: Watch for slow queries

6. **Document Policies**: Clear documentation

7. **Regular Audits**: Security reviews

8. **Plan for Scale**: Consider future growth

9. **Backup Strategy**: Per-user or per-tenant

10. **Incident Response**: Plan for breaches

## Success Criteria

Effective data isolation ensures:
- Users cannot access others' data
- Performance remains acceptable
- Easy to maintain and update
- Testable and verifiable
- Scalable as users grow
- Defense in depth

---

**Application**: Use this skill when designing multi-user applications, implementing data isolation, or reviewing security of database access patterns.
