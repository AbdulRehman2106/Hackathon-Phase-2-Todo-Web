# Define API Authentication Requirements

## Purpose
Guide the specification of authentication requirements for API endpoints to ensure secure and appropriate access control.

## Skill Description
This skill provides knowledge for determining which endpoints require authentication, what authentication mechanisms to use, and how to document authentication requirements clearly.

## Authentication Requirement Levels

### Public Endpoints
**No authentication required**

**Use Cases**:
- Public information retrieval
- Health check endpoints
- API documentation
- Login/registration endpoints
- Password reset request

**Examples**:
```
GET /api/health
GET /api/docs
POST /api/auth/login
POST /api/auth/register
POST /api/auth/forgot-password
```

**Considerations**:
- Rate limiting still applies
- Input validation required
- May need CAPTCHA for abuse prevention
- Monitor for suspicious activity

### Authenticated Endpoints
**Valid authentication token required**

**Use Cases**:
- User-specific data access
- Resource creation
- Resource modification
- Resource deletion
- Protected information

**Examples**:
```
GET /api/users/me
GET /api/tasks
POST /api/tasks
PUT /api/tasks/123
DELETE /api/tasks/123
```

**Requirements**:
- Valid JWT token in Authorization header
- Token not expired
- Token signature valid
- User account active

### Role-Based Endpoints
**Authentication + specific role required**

**Use Cases**:
- Administrative functions
- Privileged operations
- System configuration
- User management

**Examples**:
```
GET /api/admin/users
POST /api/admin/users/456/suspend
DELETE /api/admin/tasks/123
GET /api/reports/analytics
```

**Requirements**:
- Valid authentication
- User has required role (admin, moderator, etc.)
- Role permissions checked
- Actions logged for audit

## Authentication Mechanisms

### JWT Bearer Token
**Most common for stateless APIs**

**Format**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Characteristics**:
- Stateless (no server-side session)
- Self-contained (includes user info)
- Cryptographically signed
- Time-limited (expiration)

**Token Contents**:
```json
{
  "sub": "user_id_123",
  "email": "user@example.com",
  "role": "user",
  "iat": 1640000000,
  "exp": 1640003600
}
```

### API Keys
**For service-to-service or long-lived access**

**Format**:
```
X-API-Key: your-api-key-here
```

**Characteristics**:
- Long-lived credentials
- Tied to application, not user
- Can be revoked
- Rate limiting per key

**Use Cases**:
- Third-party integrations
- Server-to-server communication
- Automated scripts
- Mobile app authentication

### Session Cookies
**For traditional web applications**

**Format**:
```
Cookie: session_id=abc123...
```

**Characteristics**:
- Stateful (server stores session)
- Automatic browser handling
- CSRF protection needed
- Domain-specific

## Endpoint Authentication Specification

### Documentation Template

```markdown
## Endpoint: [Name]

**URL**: `/api/v1/resource`
**Method**: `GET`
**Authentication**: Required | Optional | Not Required

### Authentication Details
- **Type**: JWT Bearer Token
- **Required Scopes**: read:tasks, write:tasks
- **Required Roles**: user, admin

### Request Headers
```
Authorization: Bearer {jwt_token}
```

### Authentication Errors
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Valid token but insufficient permissions
```

### Example Specifications

**Public Endpoint**:
```markdown
## Login

**URL**: `/api/v1/auth/login`
**Method**: `POST`
**Authentication**: Not Required

### Request Body
{
  "email": "user@example.com",
  "password": "password123"
}

### Response (200 OK)
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "expires_in": 3600
}
```

**Authenticated Endpoint**:
```markdown
## Get User Tasks

**URL**: `/api/v1/tasks`
**Method**: `GET`
**Authentication**: Required (JWT)

### Request Headers
Authorization: Bearer {jwt_token}

### Authentication Errors
- 401: Token missing, invalid, or expired
- 403: User account suspended

### Response (200 OK)
[
  { "id": 1, "title": "Task 1" },
  { "id": 2, "title": "Task 2" }
]
```

**Role-Based Endpoint**:
```markdown
## Suspend User Account

**URL**: `/api/v1/admin/users/{id}/suspend`
**Method**: `POST`
**Authentication**: Required (JWT)
**Required Role**: admin

### Request Headers
Authorization: Bearer {jwt_token}

### Authorization Check
- User must have 'admin' role
- User must have 'users:suspend' permission

### Authentication/Authorization Errors
- 401: Token missing or invalid
- 403: User does not have admin role

### Response (200 OK)
{
  "id": 456,
  "status": "suspended",
  "suspended_at": "2024-01-15T10:30:00Z"
}
```

## Authentication Flow

### Request with Authentication
```
Client                          Server
  │                               │
  │  GET /api/tasks               │
  │  Authorization: Bearer token  │
  ├──────────────────────────────▶│
  │                               │
  │                               │ Extract token
  │                               │ Verify signature
  │                               │ Check expiration
  │                               │ Extract user ID
  │                               │ Check user status
  │                               │ Process request
  │                               │
  │  200 OK                       │
  │  [tasks data]                 │
  │◀──────────────────────────────┤
  │                               │
```

### Failed Authentication
```
Client                          Server
  │                               │
  │  GET /api/tasks               │
  │  Authorization: Bearer token  │
  ├──────────────────────────────▶│
  │                               │
  │                               │ Extract token
  │                               │ Verify signature
  │                               │ ❌ Invalid signature
  │                               │
  │  401 Unauthorized             │
  │  { "error": "Invalid token" } │
  │◀──────────────────────────────┤
  │                               │
```

## Resource Ownership

### Owner-Only Access
Resources that belong to specific users:

**Pattern**:
```
GET /api/tasks/{id}
- Verify authentication
- Check if task.user_id == authenticated_user_id
- Return 403 if not owner
```

**Example**:
```markdown
## Get Task

**URL**: `/api/v1/tasks/{id}`
**Method**: `GET`
**Authentication**: Required
**Authorization**: User must own the task

### Authorization Logic
- Extract user_id from JWT token
- Fetch task from database
- Verify task.user_id == token.user_id
- Return 403 if mismatch
```

### Shared Resource Access
Resources accessible to multiple users:

**Pattern**:
```
GET /api/projects/{id}
- Verify authentication
- Check if user is project member
- Return 403 if not member
```

## Authentication Decision Matrix

| Endpoint Type | Authentication | Authorization | Example |
|---------------|----------------|---------------|---------|
| Public Info | Not Required | N/A | GET /api/health |
| Login/Register | Not Required | N/A | POST /api/auth/login |
| User Profile | Required | Owner only | GET /api/users/me |
| User Resources | Required | Owner only | GET /api/tasks |
| Shared Resources | Required | Member check | GET /api/projects/123 |
| Admin Functions | Required | Role check | POST /api/admin/users |
| System Config | Required | Admin role | PUT /api/config |

## Security Considerations

### Token Validation
Every authenticated endpoint must:
1. Extract token from Authorization header
2. Verify token signature
3. Check token expiration
4. Validate token format
5. Extract user information
6. Verify user account status

### Authorization Checks
After authentication:
1. Determine required permissions
2. Check user has permissions
3. Verify resource ownership (if applicable)
4. Check role requirements (if applicable)
5. Log access attempts
6. Return appropriate error if unauthorized

### Error Responses

**401 Unauthorized** - Authentication failed:
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

**403 Forbidden** - Authenticated but not authorized:
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to access this resource"
  }
}
```

### Security Best Practices

1. **Always Use HTTPS**: Never send tokens over HTTP

2. **Validate Every Request**: Don't trust client-side checks

3. **Short Token Lifetimes**: Minimize exposure window

4. **Secure Token Storage**: Client-side secure storage

5. **Rate Limiting**: Prevent brute force attacks

6. **Audit Logging**: Log authentication attempts

7. **Token Rotation**: Refresh tokens regularly

8. **Revocation Support**: Ability to invalidate tokens

## Common Patterns

### Optional Authentication
Some endpoints work differently based on authentication:

```markdown
## Get Tasks

**URL**: `/api/v1/tasks`
**Method**: `GET`
**Authentication**: Optional

### Behavior
- If authenticated: Return user's tasks
- If not authenticated: Return public tasks

### Response
Authenticated: User's private tasks
Unauthenticated: Public tasks only
```

### Conditional Requirements
Authentication required for certain operations:

```markdown
## Get Task

**URL**: `/api/v1/tasks/{id}`
**Method**: `GET`
**Authentication**: Required for private tasks

### Behavior
- Public tasks: No authentication needed
- Private tasks: Authentication required
- Check task visibility setting
```

## Testing Authentication

### Test Cases

**Public Endpoint**:
- [ ] Accessible without token
- [ ] Returns expected data
- [ ] Rate limiting works

**Authenticated Endpoint**:
- [ ] Rejects requests without token
- [ ] Rejects requests with invalid token
- [ ] Rejects requests with expired token
- [ ] Accepts requests with valid token
- [ ] Returns user-specific data

**Role-Based Endpoint**:
- [ ] Rejects requests without token
- [ ] Rejects requests from non-admin users
- [ ] Accepts requests from admin users
- [ ] Logs admin actions

**Owner-Only Endpoint**:
- [ ] Rejects requests without token
- [ ] Rejects requests from non-owners
- [ ] Accepts requests from owners
- [ ] Returns 404 for non-existent resources

## Documentation Checklist

For each endpoint, document:
- [ ] Authentication requirement (required/optional/not required)
- [ ] Authentication mechanism (JWT, API key, etc.)
- [ ] Required roles or permissions
- [ ] Ownership requirements
- [ ] Authentication error responses
- [ ] Authorization error responses
- [ ] Token format and location
- [ ] Example authenticated requests

## Best Practices

1. **Default to Authenticated**: Require authentication unless there's a reason not to

2. **Principle of Least Privilege**: Grant minimum necessary permissions

3. **Explicit Requirements**: Clearly document what's needed

4. **Consistent Patterns**: Use same authentication across similar endpoints

5. **Secure by Default**: Err on the side of more security

6. **Test Thoroughly**: Verify authentication and authorization

7. **Monitor Access**: Track authentication failures

8. **Document Clearly**: Make requirements obvious

## Success Criteria

Well-defined authentication requirements result in:
- Clear security boundaries
- Appropriate access control
- Consistent authentication patterns
- Comprehensive documentation
- Testable specifications
- Secure API design

---

**Application**: Use this skill when designing API endpoints, writing API specifications, or reviewing security requirements for APIs.
