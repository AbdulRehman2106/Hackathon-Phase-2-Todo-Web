# Skill: Enforce User-Level Data Isolation at API Level

## Purpose
Design APIs that ensure users can only access and modify their own data, implementing proper data isolation at the API layer.

## When to Use
- Designing multi-user API endpoints
- Reviewing API authorization patterns
- Establishing data isolation requirements
- Preventing cross-user data access vulnerabilities

## Instruction

### Data Isolation Principles

Every API that handles user-owned resources MUST:

1. **Identify the User**: Extract user identity from authenticated token
2. **Scope All Queries**: Filter data by user ownership
3. **Verify Ownership**: Check ownership before mutations
4. **Never Trust Client IDs**: Don't use user_id from request body

### Isolation Patterns

#### Pattern 1: Implicit Filtering (Collections)

For list endpoints, automatically filter by authenticated user:

```yaml
endpoint: GET /api/tasks
isolation_type: implicit_filter

design_requirement:
  - Extract user_id from JWT token
  - Query database with user_id filter
  - Return only user's resources

pseudo_logic: |
  user_id = extract_from_token(jwt)
  tasks = db.query(Task).filter(user_id=user_id)
  return tasks

security_note: |
  Client cannot request other users' tasks.
  No user_id parameter accepted in request.
```

#### Pattern 2: Explicit Ownership Check (Single Resource)

For single resource endpoints, verify ownership:

```yaml
endpoint: GET /api/tasks/{task_id}
isolation_type: ownership_verification

design_requirement:
  - Extract user_id from JWT token
  - Fetch resource by task_id
  - Verify resource.user_id == token.user_id
  - Return 404 if not owned (not 403, to prevent enumeration)

pseudo_logic: |
  user_id = extract_from_token(jwt)
  task = db.query(Task).filter(id=task_id).first()
  if not task or task.user_id != user_id:
      return 404  # Intentionally vague
  return task

security_note: |
  404 prevents attackers from discovering valid IDs
  they don't own.
```

#### Pattern 3: Creation Assignment

For creation endpoints, assign ownership from token:

```yaml
endpoint: POST /api/tasks
isolation_type: ownership_assignment

design_requirement:
  - Extract user_id from JWT token
  - Assign user_id to new resource
  - Never accept user_id from request body

pseudo_logic: |
  user_id = extract_from_token(jwt)
  task = Task(
      title=request.title,
      description=request.description,
      user_id=user_id  # From token, NOT request
  )
  db.save(task)
  return task

security_note: |
  Client cannot create resources as other users.
  user_id in request body is ignored or rejected.
```

#### Pattern 4: Update with Ownership

For update endpoints, verify ownership before mutation:

```yaml
endpoint: PUT /api/tasks/{task_id}
isolation_type: ownership_verified_mutation

design_requirement:
  - Extract user_id from JWT token
  - Fetch resource and verify ownership
  - Apply updates only if owned
  - Prevent user_id reassignment

pseudo_logic: |
  user_id = extract_from_token(jwt)
  task = db.query(Task).filter(
      id=task_id,
      user_id=user_id  # Combined filter
  ).first()
  if not task:
      return 404
  task.update(request.body)
  # user_id cannot be changed
  db.save(task)
  return task

security_note: |
  Atomic check-and-update prevents race conditions.
  Changing user_id is not allowed.
```

### API Design Checklist

For each endpoint handling user data:

#### List Endpoints (GET /resources)
- [ ] User ID extracted from token only
- [ ] Query filters by user_id
- [ ] No user_id parameter in query string
- [ ] Response contains only user's resources

#### Single Resource (GET /resources/{id})
- [ ] User ID extracted from token only
- [ ] Ownership verified before returning
- [ ] 404 returned for non-owned resources
- [ ] No information leakage about other users

#### Create Endpoints (POST /resources)
- [ ] User ID extracted from token only
- [ ] User ID assigned from token, not request
- [ ] user_id in request body ignored/rejected
- [ ] Audit log includes actual owner

#### Update Endpoints (PUT/PATCH /resources/{id})
- [ ] Ownership verified before update
- [ ] user_id field cannot be modified
- [ ] 404 returned for non-owned resources
- [ ] Combined ownership check with update

#### Delete Endpoints (DELETE /resources/{id})
- [ ] Ownership verified before deletion
- [ ] 404 returned for non-owned resources
- [ ] Soft delete if audit trail needed

### Common Vulnerabilities to Prevent

| Vulnerability | Example | Prevention |
|---------------|---------|------------|
| IDOR | GET /tasks/123 returns any task | Ownership check |
| Mass Assignment | POST with user_id in body | Ignore user_id from body |
| Ownership Transfer | PATCH { user_id: "other" } | Reject user_id changes |
| Enumeration | Different error for owned vs not | Always 404 |

### Response Examples

#### Correct: Isolated Response
```json
// GET /api/tasks
// Returns ONLY authenticated user's tasks
{
  "data": [
    { "id": "1", "title": "My task", "user_id": "user-123" },
    { "id": "2", "title": "Another task", "user_id": "user-123" }
  ]
}
```

#### Correct: Not Found for Non-Owned
```json
// GET /api/tasks/999 (belongs to another user)
// Status: 404
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Task not found"
  }
}
```

### Database Query Design

For proper isolation, API layer should ensure:

```yaml
query_patterns:
  list_query:
    always_include: WHERE user_id = :current_user_id

  single_query:
    always_include: WHERE id = :resource_id AND user_id = :current_user_id

  update_query:
    always_include: WHERE id = :resource_id AND user_id = :current_user_id

  delete_query:
    always_include: WHERE id = :resource_id AND user_id = :current_user_id
```

## Output Format
Data isolation requirements and patterns for API specification, suitable for security documentation or plan.md.

## Related Skills
- design-restful-apis
- define-endpoint-auth-requirements
- design-jwt-protected-apis
