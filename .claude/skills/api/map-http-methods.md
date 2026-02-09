# Skill: Map HTTP Methods Correctly

## Purpose
Ensure correct usage of HTTP methods for different operations, maintaining REST semantics and predictable API behavior.

## When to Use
- Designing new API endpoints
- Reviewing API method choices
- Explaining HTTP method semantics
- Correcting improper method usage

## Instruction

### HTTP Method Semantics

Each HTTP method has specific semantics that MUST be respected:

#### GET - Retrieve Resources

**Purpose**: Retrieve data without side effects

**Characteristics**:
- Safe: Does not modify server state
- Idempotent: Multiple identical requests have same effect
- Cacheable: Response can be cached
- No request body

**Correct Usage**:
```
GET /api/tasks              # List all tasks
GET /api/tasks/{id}         # Get specific task
GET /api/tasks?status=done  # Filter tasks
```

**Incorrect Usage**:
```
GET /api/tasks/delete/{id}  # ❌ Don't use GET for mutations
GET /api/tasks/create       # ❌ Don't use GET to create
```

---

#### POST - Create Resources

**Purpose**: Create new resources or trigger actions

**Characteristics**:
- Not safe: Modifies server state
- Not idempotent: Multiple requests create multiple resources
- Not cacheable
- Has request body

**Correct Usage**:
```
POST /api/tasks             # Create new task
POST /api/auth/login        # Trigger login action
POST /api/tasks/bulk        # Create multiple tasks
```

**Incorrect Usage**:
```
POST /api/tasks/{id}        # ❌ Use PUT/PATCH for updates
POST /api/tasks/list        # ❌ Use GET for retrieval
```

---

#### PUT - Replace Resources

**Purpose**: Replace entire resource with new representation

**Characteristics**:
- Not safe: Modifies server state
- Idempotent: Multiple identical requests have same effect
- Not cacheable
- Has request body (complete resource)

**Correct Usage**:
```
PUT /api/tasks/{id}         # Replace entire task
```

**Request Body** (must include all fields):
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "pending",
  "priority": "high"
}
```

**Behavior**: Missing fields are set to null/default, not preserved.

---

#### PATCH - Partial Update

**Purpose**: Apply partial modifications to a resource

**Characteristics**:
- Not safe: Modifies server state
- Idempotent (when properly implemented)
- Not cacheable
- Has request body (partial fields)

**Correct Usage**:
```
PATCH /api/tasks/{id}       # Update specific fields
```

**Request Body** (only changed fields):
```json
{
  "status": "completed"
}
```

**Behavior**: Only specified fields are updated, others preserved.

---

#### DELETE - Remove Resources

**Purpose**: Remove a resource

**Characteristics**:
- Not safe: Modifies server state
- Idempotent: Multiple deletes have same effect (resource gone)
- Not cacheable
- No request body (typically)

**Correct Usage**:
```
DELETE /api/tasks/{id}      # Delete specific task
```

**Response Codes**:
- `204 No Content`: Successfully deleted
- `404 Not Found`: Resource doesn't exist (acceptable for idempotency)

---

### Decision Matrix

| Operation | Method | URL Pattern | Body |
|-----------|--------|-------------|------|
| List resources | GET | `/resources` | No |
| Get single resource | GET | `/resources/{id}` | No |
| Search/filter | GET | `/resources?query=x` | No |
| Create resource | POST | `/resources` | Yes |
| Replace resource | PUT | `/resources/{id}` | Yes (full) |
| Update fields | PATCH | `/resources/{id}` | Yes (partial) |
| Delete resource | DELETE | `/resources/{id}` | No |
| Bulk create | POST | `/resources/bulk` | Yes |
| Bulk delete | DELETE | `/resources/bulk` | Yes (ids) |

### Special Cases

#### Actions on Resources
When an operation doesn't fit CRUD:

```
# Acceptable: Action as sub-resource
POST /api/tasks/{id}/complete
POST /api/tasks/{id}/archive
POST /api/users/{id}/verify-email

# Alternative: Use PATCH with status
PATCH /api/tasks/{id}
{ "status": "completed" }
```

#### Search with Complex Criteria
When GET query strings become unwieldy:

```
# POST for complex search (body contains criteria)
POST /api/tasks/search
{
  "filters": {
    "status": ["pending", "in_progress"],
    "due_before": "2024-12-31",
    "tags": ["urgent", "important"]
  },
  "sort": [{"field": "due_date", "order": "asc"}]
}
```

### Idempotency Guide

| Method | Idempotent | Explanation |
|--------|------------|-------------|
| GET | Yes | Always returns current state |
| POST | No | Creates new resource each time |
| PUT | Yes | Same input = same result |
| PATCH | Yes* | Same input = same result |
| DELETE | Yes | Resource stays deleted |

*PATCH is idempotent if properly implemented (same input produces same state).

### Anti-Patterns

| Anti-Pattern | Problem | Correct Approach |
|--------------|---------|------------------|
| `GET /deleteTask` | GET should be safe | `DELETE /tasks/{id}` |
| `POST /getTask` | POST for retrieval | `GET /tasks/{id}` |
| `PUT /tasks` (no id) | PUT needs identifier | `POST /tasks` |
| `PATCH /tasks` (bulk) | Ambiguous scope | `PATCH /tasks/bulk` |

## Output Format
Method recommendations with justification based on REST semantics.

## Related Skills
- design-restful-apis
- design-jwt-protected-apis
- api-error-handling
