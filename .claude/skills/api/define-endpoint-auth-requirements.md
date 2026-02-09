# Skill: Define Authentication Requirements for Endpoints

## Purpose
Establish clear authentication and authorization requirements for each API endpoint, ensuring proper access control across the API surface.

## When to Use
- Designing new API endpoints
- Documenting API security requirements
- Reviewing endpoint access controls
- Creating API security specifications

## Instruction

### Authentication Levels

Define three levels of authentication for endpoints:

#### Level 1: Public (No Authentication)
```
Endpoints accessible without any authentication.

Examples:
- GET /api/health          # Health check
- POST /api/auth/login     # Login
- POST /api/auth/register  # Registration
- GET /api/public/*        # Public content
```

#### Level 2: Authenticated (Valid Token Required)
```
Endpoints requiring a valid JWT token.

Examples:
- GET /api/tasks           # List user's tasks
- POST /api/tasks          # Create task
- GET /api/profile         # Get user profile
- PUT /api/profile         # Update user profile
```

#### Level 3: Authorized (Token + Permission Check)
```
Endpoints requiring authentication plus specific permissions.

Examples:
- DELETE /api/tasks/{id}   # Must own the task
- PUT /api/tasks/{id}      # Must own the task
- GET /api/admin/users     # Must have admin role
```

### Endpoint Documentation Format

Document each endpoint's auth requirements:

```markdown
## Endpoint: GET /api/tasks

### Authentication
- **Required**: Yes
- **Method**: Bearer Token (JWT)
- **Header**: `Authorization: Bearer <token>`

### Authorization
- **Level**: User
- **Scope**: Own resources only
- **Check**: `task.user_id == token.sub`

### Responses
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Valid token but insufficient permissions
```

### Authorization Patterns

#### Pattern 1: User-Owned Resources
```
Resource belongs to a specific user.
Access Rule: user_id in resource == user_id in token

Endpoints:
- GET /api/tasks         → Returns only user's tasks
- GET /api/tasks/{id}    → Returns task if owned by user
- PUT /api/tasks/{id}    → Updates if owned by user
- DELETE /api/tasks/{id} → Deletes if owned by user
```

#### Pattern 2: Role-Based Access
```
Access determined by user's role.

Roles: user, moderator, admin

Endpoints:
- GET /api/admin/stats   → admin only
- GET /api/mod/reports   → moderator, admin
- GET /api/tasks         → user, moderator, admin
```

#### Pattern 3: Resource-Level Permissions
```
Explicit permissions on resources.

Permission Types: read, write, admin

Endpoints:
- GET /api/projects/{id}     → read permission
- PUT /api/projects/{id}     → write permission
- DELETE /api/projects/{id}  → admin permission
```

### Auth Requirements Matrix Template

| Endpoint | Method | Auth Level | Owner Check | Role Required |
|----------|--------|------------|-------------|---------------|
| `/api/tasks` | GET | Authenticated | Implicit (filter) | user |
| `/api/tasks` | POST | Authenticated | N/A (creates) | user |
| `/api/tasks/{id}` | GET | Authorized | Yes | user |
| `/api/tasks/{id}` | PUT | Authorized | Yes | user |
| `/api/tasks/{id}` | DELETE | Authorized | Yes | user |
| `/api/auth/login` | POST | Public | N/A | N/A |
| `/api/admin/users` | GET | Authorized | N/A | admin |

### Token Claims Usage

Define which token claims are used for authorization:

```json
{
  "sub": "user-uuid",        // Used for: ownership checks
  "email": "user@example.com", // Used for: audit logging
  "role": "user",            // Used for: role-based access
  "exp": 1234567890,         // Used for: token expiry
  "iat": 1234567800          // Used for: token freshness
}
```

### Error Response Specifications

#### 401 Unauthorized
When to return:
- No token provided
- Token expired
- Token signature invalid
- Token malformed

Response:
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

#### 403 Forbidden
When to return:
- Valid token but wrong user
- Valid token but insufficient role
- Valid token but lacks permission

Response:
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

### Security Checklist

For each endpoint, verify:
- [ ] Auth level documented (public/authenticated/authorized)
- [ ] Token validation performed
- [ ] User ownership verified (for owned resources)
- [ ] Role check performed (for role-restricted endpoints)
- [ ] Error responses are generic (no info leakage)
- [ ] Rate limiting considered

## Output Format
Authentication requirements documentation suitable for API specification or security documentation.

## Related Skills
- design-restful-apis
- design-jwt-protected-apis
- enforce-api-data-isolation
