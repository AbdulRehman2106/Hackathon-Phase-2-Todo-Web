# Enforce User-Level Data Isolation

## Purpose
Guide the design of APIs that properly isolate user data to prevent unauthorized access to other users' information.

## Skill Description
This skill provides principles and patterns for ensuring that users can only access their own data, preventing data leakage and unauthorized access in multi-tenant applications.

## Data Isolation Principles

### 1. Principle of Least Privilege
Users should only access data they own or are explicitly granted access to.

### 2. Defense in Depth
Multiple layers of protection:
- Authentication (who are you?)
- Authorization (what can you do?)
- Data filtering (only your data)
- Database constraints (enforce at DB level)

### 3. Fail Secure
When in doubt, deny access rather than allow.

### 4. Explicit Ownership
Every resource has a clear owner or access control list.

## Ownership Models

### Single Owner Model
Each resource belongs to exactly one user.

**Example**: Personal todo tasks
```
tasks table:
- id
- title
- description
- user_id  ← Owner
```

**Access Rule**: User can only access tasks where `user_id = authenticated_user_id`

### Multi-Owner Model
Resources can have multiple owners or collaborators.

**Example**: Shared projects
```
projects table:
- id
- name
- created_by

project_members table:
- project_id
- user_id
- role (owner, editor, viewer)
```

**Access Rule**: User can access project if they are a member

### Hierarchical Ownership
Resources belong to organizations, which users belong to.

**Example**: Organization tasks
```
organizations table:
- id
- name

users table:
- id
- organization_id

tasks table:
- id
- title
- organization_id
```

**Access Rule**: User can access tasks where `task.organization_id = user.organization_id`

## API-Level Data Isolation

### Pattern 1: Filter by User ID

**Concept**: Always filter queries by authenticated user's ID

**List Endpoint**:
```
GET /api/tasks

Backend Logic:
1. Extract user_id from JWT token
2. Query: SELECT * FROM tasks WHERE user_id = {authenticated_user_id}
3. Return filtered results
```

**Single Resource Endpoint**:
```
GET /api/tasks/123

Backend Logic:
1. Extract user_id from JWT token
2. Query: SELECT * FROM tasks WHERE id = 123 AND user_id = {authenticated_user_id}
3. If found → Return task
4. If not found → Return 404 (not 403, to avoid information leakage)
```

### Pattern 2: Ownership Verification

**Concept**: Fetch resource, then verify ownership

**Update Endpoint**:
```
PUT /api/tasks/123

Backend Logic:
1. Extract user_id from JWT token
2. Fetch task: SELECT * FROM tasks WHERE id = 123
3. If not found → Return 404
4. If task.user_id != authenticated_user_id → Return 403
5. If owner → Update task
```

**Delete Endpoint**:
```
DELETE /api/tasks/123

Backend Logic:
1. Extract user_id from JWT token
2. Fetch task: SELECT * FROM tasks WHERE id = 123
3. If not found → Return 404
4. If task.user_id != authenticated_user_id → Return 403
5. If owner → Delete task
```

### Pattern 3: Implicit User Context

**Concept**: User context automatically applied to all operations

**Create Endpoint**:
```
POST /api/tasks
Body: { "title": "New task" }

Backend Logic:
1. Extract user_id from JWT token
2. Create task with user_id = authenticated_user_id
3. User cannot specify different user_id
4. Return created task
```

**Important**: Never trust user_id from request body!

## Common Vulnerabilities

### 1. Insecure Direct Object Reference (IDOR)

**Vulnerable Code**:
```
GET /api/tasks/123

# Bad: No ownership check
task = database.get_task(123)
return task
```

**Attack**: User can access any task by changing ID

**Secure Code**:
```
GET /api/tasks/123

# Good: Ownership check
user_id = extract_user_id_from_token()
task = database.get_task(123)
if task.user_id != user_id:
    return 403_forbidden()
return task
```

### 2. Missing Authorization in Updates

**Vulnerable Code**:
```
PUT /api/tasks/123
Body: { "title": "Updated" }

# Bad: No ownership check
task = database.get_task(123)
task.update(title="Updated")
return task
```

**Attack**: User can modify any task

**Secure Code**:
```
PUT /api/tasks/123
Body: { "title": "Updated" }

# Good: Ownership check
user_id = extract_user_id_from_token()
task = database.get_task(123)
if task.user_id != user_id:
    return 403_forbidden()
task.update(title="Updated")
return task
```

### 3. Bulk Operations Without Filtering

**Vulnerable Code**:
```
GET /api/tasks

# Bad: Returns all tasks
tasks = database.get_all_tasks()
return tasks
```

**Attack**: User sees all users' tasks

**Secure Code**:
```
GET /api/tasks

# Good: Filter by user
user_id = extract_user_id_from_token()
tasks = database.get_tasks_by_user(user_id)
return tasks
```

### 4. Trusting Client-Provided User ID

**Vulnerable Code**:
```
POST /api/tasks
Body: { "title": "Task", "user_id": 123 }

# Bad: Using user_id from request
task = database.create_task(
    title=body.title,
    user_id=body.user_id  # ❌ Never do this!
)
return task
```

**Attack**: User can create tasks for other users

**Secure Code**:
```
POST /api/tasks
Body: { "title": "Task" }

# Good: Use authenticated user's ID
user_id = extract_user_id_from_token()
task = database.create_task(
    title=body.title,
    user_id=user_id  # ✓ From token, not request
)
return task
```

## Implementation Patterns

### Pattern: Query Filtering

**Always include user_id in WHERE clause**:

```sql
-- List user's tasks
SELECT * FROM tasks
WHERE user_id = {authenticated_user_id}

-- Get specific task
SELECT * FROM tasks
WHERE id = {task_id}
AND user_id = {authenticated_user_id}

-- Update task
UPDATE tasks
SET title = {new_title}
WHERE id = {task_id}
AND user_id = {authenticated_user_id}

-- Delete task
DELETE FROM tasks
WHERE id = {task_id}
AND user_id = {authenticated_user_id}
```

### Pattern: Middleware/Decorator

**Automatic ownership verification**:

```python
# Conceptual example
@require_ownership('task', 'task_id')
def update_task(task_id, data):
    # Ownership already verified by decorator
    task = get_task(task_id)
    task.update(data)
    return task
```

### Pattern: Scoped Queries

**All queries automatically scoped to user**:

```python
# Conceptual example
class UserScopedTaskRepository:
    def __init__(self, user_id):
        self.user_id = user_id

    def get_all(self):
        return query("SELECT * FROM tasks WHERE user_id = ?", self.user_id)

    def get_by_id(self, task_id):
        return query("SELECT * FROM tasks WHERE id = ? AND user_id = ?",
                     task_id, self.user_id)
```

## Shared Resource Access

### Explicit Sharing Model

**Resources with access control lists**:

```
projects table:
- id
- name
- owner_id

project_access table:
- project_id
- user_id
- permission (read, write, admin)
```

**Access Check**:
```
GET /api/projects/123

Backend Logic:
1. Extract user_id from JWT token
2. Check if user has access:
   - Is user the owner? (projects.owner_id = user_id)
   - OR does user have explicit access? (project_access.user_id = user_id)
3. If yes → Return project
4. If no → Return 403
```

### Team/Organization Model

**Resources belong to teams**:

```
teams table:
- id
- name

team_members table:
- team_id
- user_id
- role

projects table:
- id
- name
- team_id
```

**Access Check**:
```
GET /api/projects/123

Backend Logic:
1. Extract user_id from JWT token
2. Get project's team_id
3. Check if user is team member:
   SELECT * FROM team_members
   WHERE team_id = {project.team_id}
   AND user_id = {authenticated_user_id}
4. If member → Return project
5. If not member → Return 403
```

## Error Handling

### Information Leakage Prevention

**Bad - Reveals existence**:
```
GET /api/tasks/123

If task exists but user doesn't own it:
  Return 403 Forbidden
  Message: "You don't have permission to access this task"

→ Attacker knows task 123 exists
```

**Good - Consistent response**:
```
GET /api/tasks/123

If task doesn't exist OR user doesn't own it:
  Return 404 Not Found
  Message: "Task not found"

→ Attacker can't determine if task exists
```

### Appropriate Status Codes

**404 Not Found**:
- Resource doesn't exist
- OR resource exists but user doesn't have access
- Use when you don't want to reveal existence

**403 Forbidden**:
- Resource exists and user knows about it
- But user doesn't have permission
- Use for shared resources where existence is known

## Testing Data Isolation

### Test Cases

**Test 1: User A cannot access User B's resources**
```
1. Create task as User A
2. Authenticate as User B
3. Try to GET User A's task
4. Expect: 404 Not Found
```

**Test 2: User cannot modify other user's resources**
```
1. Create task as User A
2. Authenticate as User B
3. Try to PUT/PATCH User A's task
4. Expect: 404 Not Found or 403 Forbidden
```

**Test 3: User cannot delete other user's resources**
```
1. Create task as User A
2. Authenticate as User B
3. Try to DELETE User A's task
4. Expect: 404 Not Found or 403 Forbidden
```

**Test 4: List endpoints only return user's data**
```
1. Create tasks as User A
2. Create tasks as User B
3. Authenticate as User A
4. GET /api/tasks
5. Expect: Only User A's tasks returned
```

**Test 5: Cannot create resources for other users**
```
1. Authenticate as User A
2. POST /api/tasks with user_id = User B's ID
3. Expect: Task created with User A's ID (ignore provided user_id)
```

**Test 6: Bulk operations respect isolation**
```
1. Create tasks as User A and User B
2. Authenticate as User A
3. Try bulk delete with IDs including User B's tasks
4. Expect: Only User A's tasks deleted
```

## Database-Level Isolation

### Row-Level Security (PostgreSQL)

**Concept**: Database enforces isolation automatically

```sql
-- Enable row-level security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own tasks
CREATE POLICY user_isolation ON tasks
FOR ALL
TO authenticated_user
USING (user_id = current_user_id());

-- Policy: Users can only modify their own tasks
CREATE POLICY user_modification ON tasks
FOR UPDATE
TO authenticated_user
USING (user_id = current_user_id());
```

**Benefits**:
- Enforced at database level
- Can't be bypassed by application bugs
- Defense in depth

### Foreign Key Constraints

**Ensure referential integrity**:

```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Ensures user_id always references valid user
-- Cascades delete when user is deleted
```

## Best Practices

1. **Always Filter by User**: Include user_id in all queries

2. **Never Trust Client Input**: Get user_id from token, not request

3. **Verify Ownership**: Check ownership before modifications

4. **Consistent Errors**: Use 404 to avoid information leakage

5. **Test Thoroughly**: Verify isolation with automated tests

6. **Database Constraints**: Use foreign keys and RLS when possible

7. **Audit Logging**: Log access attempts for security monitoring

8. **Principle of Least Privilege**: Grant minimum necessary access

9. **Defense in Depth**: Multiple layers of protection

10. **Regular Security Reviews**: Audit code for isolation issues

## Security Checklist

For each endpoint, verify:
- [ ] User authentication required
- [ ] User ID extracted from token (not request)
- [ ] Queries filtered by user ID
- [ ] Ownership verified before modifications
- [ ] Cannot access other users' data
- [ ] Cannot modify other users' data
- [ ] Cannot delete other users' data
- [ ] List endpoints return only user's data
- [ ] Appropriate error codes (404 vs 403)
- [ ] Tests verify isolation

## Common Mistakes

1. **Forgetting to filter queries**: Returning all data instead of user's data

2. **Using user_id from request**: Trusting client-provided user ID

3. **Inconsistent checks**: Some endpoints check ownership, others don't

4. **Information leakage**: Using 403 when 404 is more appropriate

5. **Missing tests**: Not verifying isolation with automated tests

6. **Assuming frontend validation**: Relying on client-side checks

7. **Bulk operation gaps**: Not checking ownership in batch operations

## Success Criteria

Proper data isolation ensures:
- Users can only access their own data
- No unauthorized data access
- No information leakage
- Consistent security across all endpoints
- Defense in depth
- Testable and verifiable isolation

---

**Application**: Use this skill when designing APIs with user-specific data, implementing authorization logic, or reviewing security of multi-tenant applications.
