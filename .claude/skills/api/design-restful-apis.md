# Skill: Design RESTful APIs

## Purpose
Create well-designed RESTful API specifications that follow industry best practices, ensuring consistency, predictability, and ease of use.

## When to Use
- Designing new API endpoints
- Reviewing existing API designs
- Creating API documentation
- Establishing API conventions for a project

## Instruction

### REST Principles

A RESTful API MUST adhere to these principles:

1. **Stateless**: Each request contains all information needed
2. **Resource-Based**: URLs represent resources, not actions
3. **Uniform Interface**: Consistent patterns across endpoints
4. **Client-Server Separation**: Clear boundary between concerns

### URL Design Rules

#### Resource Naming
```
# Good - nouns, plural, lowercase
GET /api/tasks
GET /api/users
GET /api/task-categories

# Bad - verbs, singular, camelCase
GET /api/getTask
GET /api/User
GET /api/taskCategories
```

#### Hierarchical Resources
```
# Parent-child relationships
GET /api/users/{user_id}/tasks
GET /api/projects/{project_id}/tasks/{task_id}

# Maximum nesting: 2 levels
# Beyond 2 levels, use query parameters or separate endpoints
```

#### Query Parameters
```
# Filtering
GET /api/tasks?status=pending&priority=high

# Pagination
GET /api/tasks?page=2&limit=20

# Sorting
GET /api/tasks?sort=created_at&order=desc

# Searching
GET /api/tasks?search=meeting
```

### HTTP Method Mapping

| Method | Purpose | Request Body | Response Body | Idempotent |
|--------|---------|--------------|---------------|------------|
| GET | Retrieve resource(s) | No | Yes | Yes |
| POST | Create new resource | Yes | Yes (created) | No |
| PUT | Replace entire resource | Yes | Yes (updated) | Yes |
| PATCH | Partial update | Yes | Yes (updated) | Yes |
| DELETE | Remove resource | No | Optional | Yes |

### Request/Response Design

#### Request Body Structure
```json
{
  "title": "Complete project",
  "description": "Finish all remaining tasks",
  "due_date": "2024-12-31",
  "priority": "high"
}
```

#### Success Response Structure
```json
{
  "data": {
    "id": "uuid-here",
    "title": "Complete project",
    "description": "Finish all remaining tasks",
    "due_date": "2024-12-31",
    "priority": "high",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Collection Response Structure
```json
{
  "data": [
    { "id": "1", "title": "Task 1" },
    { "id": "2", "title": "Task 2" }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "total_pages": 5
  }
}
```

#### Error Response Structure
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "title",
        "message": "Title is required"
      }
    ]
  }
}
```

### HTTP Status Codes

#### Success Codes
| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE |

#### Client Error Codes
| Code | Meaning | When to Use |
|------|---------|-------------|
| 400 | Bad Request | Invalid request syntax/data |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Valid auth but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource state conflict |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |

#### Server Error Codes
| Code | Meaning | When to Use |
|------|---------|-------------|
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | Temporary unavailability |

### API Versioning Strategy

```
# URL versioning (recommended for simplicity)
/api/v1/tasks
/api/v2/tasks

# Header versioning (alternative)
Accept: application/vnd.api+json; version=1
```

### Documentation Template

For each endpoint, document:

```markdown
## POST /api/tasks

Create a new task for the authenticated user.

### Authentication
Required: Bearer token

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Task title (1-200 chars) |
| description | string | No | Task description |
| due_date | string | No | ISO 8601 date |
| priority | string | No | low, medium, high |

### Response
**201 Created**
```json
{
  "data": {
    "id": "uuid",
    "title": "string",
    ...
  }
}
```

**400 Bad Request** - Invalid request body
**401 Unauthorized** - Missing or invalid token
**422 Unprocessable Entity** - Validation errors
```

## Output Format
API specification document with endpoints, methods, request/response schemas, and status codes.

## Related Skills
- map-http-methods
- design-jwt-protected-apis
- enforce-api-data-isolation
