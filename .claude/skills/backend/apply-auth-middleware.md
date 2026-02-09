# Skill: Apply Authentication Middleware Concepts

## Purpose
Design and document authentication middleware patterns for FastAPI applications, ensuring consistent security across all protected endpoints.

## When to Use
- Designing authentication for FastAPI apps
- Planning JWT verification implementation
- Establishing auth patterns for the team
- Reviewing auth middleware design

## Instruction

### Authentication Middleware Concepts

Authentication middleware in FastAPI uses the Dependency Injection pattern:

```
┌─────────────────────────────────────────────────────────────────┐
│                 FASTAPI AUTH FLOW                                │
└─────────────────────────────────────────────────────────────────┘

Request Arrives
      │
      ▼
┌─────────────┐
│ Dependency  │ get_current_user()
│ Injection   │
└──────┬──────┘
       │
       ├──────▶ Extract token from header
       │
       ├──────▶ Verify token signature
       │
       ├──────▶ Validate expiration
       │
       ├──────▶ Return User object
       │        OR raise HTTPException
       │
       ▼
┌─────────────┐
│ Route       │ Receives authenticated User
│ Handler     │ Proceeds with request
└─────────────┘
```

### Dependency Design Patterns

#### Basic Auth Dependency

```yaml
dependency_name: get_current_user
purpose: Extract and verify user from JWT token
injection_point: Route handler parameter

design:
  input: Request (via Depends)
  output: User object or raises HTTPException

  steps:
    1. Extract Authorization header
    2. Validate "Bearer " prefix
    3. Decode JWT token
    4. Verify signature with shared secret
    5. Check expiration
    6. Return user data from claims

  errors:
    missing_header: 401 - "Authorization header required"
    invalid_format: 401 - "Invalid authorization format"
    invalid_token: 401 - "Invalid token"
    expired_token: 401 - "Token expired"
```

#### Optional Auth Dependency

```yaml
dependency_name: get_current_user_optional
purpose: Extract user if present, None if not
use_case: Endpoints accessible both authenticated and anonymous

design:
  behavior:
    - Token present and valid → Return User
    - Token present but invalid → Raise 401
    - Token absent → Return None

  note: Different from just skipping auth
```

#### Role-Based Auth Dependency

```yaml
dependency_name: require_role
purpose: Verify user has required role
pattern: Dependency factory (parameterized)

design:
  factory_pattern:
    input: Required role(s)
    output: Dependency function

  usage:
    admin_required: Depends(require_role("admin"))
    moderator_or_admin: Depends(require_role(["moderator", "admin"]))

  behavior:
    - Valid token + correct role → Proceed
    - Valid token + wrong role → 403 Forbidden
    - Invalid/missing token → 401 Unauthorized
```

### Token Extraction Design

```yaml
authorization_header:
  format: "Authorization: Bearer {token}"
  extraction:
    1. Get "Authorization" header
    2. Split by space
    3. Verify first part is "Bearer"
    4. Second part is the token

token_validation:
  library: PyJWT (jose or python-jwt)
  algorithm: HS256
  secret: Environment variable (BETTER_AUTH_SECRET)

  claims_to_extract:
    sub: User ID
    exp: Expiration (validated automatically)
    email: User email (if present)
```

### User Context Design

```yaml
user_context:
  purpose: Represent authenticated user in handlers

  options:
    option_1_simple_dict:
      type: dict
      contents: {id: UUID, email: str}

    option_2_pydantic_model:
      type: Pydantic BaseModel
      contents: TokenPayload class

    option_3_database_user:
      type: SQLModel User
      contents: Full user record (requires DB lookup)

  recommendation: |
    Start with Pydantic model (TokenPayload).
    Only fetch full User if additional data needed.
```

### Error Response Design

```yaml
error_responses:

  missing_authentication:
    status: 401
    body:
      detail: "Not authenticated"
    headers:
      WWW-Authenticate: "Bearer"

  invalid_token:
    status: 401
    body:
      detail: "Could not validate credentials"
    headers:
      WWW-Authenticate: "Bearer"
    note: Same message for signature and format errors

  expired_token:
    status: 401
    body:
      detail: "Token has expired"
    headers:
      WWW-Authenticate: 'Bearer error="invalid_token"'

  insufficient_permissions:
    status: 403
    body:
      detail: "Insufficient permissions"
```

### Middleware vs Dependency

```yaml
comparison:

  middleware:
    runs: Every request (or path-filtered)
    access: Cannot inject into handler
    use_case: Logging, CORS, request timing

  dependency:
    runs: Only when declared
    access: Injects value into handler
    use_case: Authentication, authorization

recommendation: |
  Use Dependencies for authentication in FastAPI.
  More flexible, testable, and explicit.
```

### Security Configuration

```yaml
configuration_requirements:

  jwt_secret:
    source: Environment variable
    name: BETTER_AUTH_SECRET (or JWT_SECRET)
    sharing: Same value in frontend (Better Auth) and backend

  algorithm:
    value: HS256
    config: Application constant

  token_lifetime:
    value: Determined by Better Auth
    backend_responsibility: Verify expiration only
```

### Testing Auth Design

```yaml
test_patterns:

  unit_test_dependency:
    approach: Test dependency function directly
    mock: JWT decoding library
    verify: Correct error for each case

  integration_test_routes:
    approach: Test routes with/without tokens
    fixtures:
      - valid_token: Returns user
      - expired_token: Returns 401
      - no_token: Returns 401

  test_override:
    approach: Override dependency in tests
    benefit: Test routes without JWT complexity
```

### Design Documentation Template

```markdown
## Authentication Design for [Application]

### Overview
JWT-based authentication using FastAPI dependencies.

### Dependencies

#### get_current_user
- **Location**: `src/dependencies/auth.py`
- **Purpose**: Extract authenticated user from JWT
- **Returns**: `TokenPayload` with user ID and email
- **Errors**: 401 if missing/invalid/expired

#### require_admin (if needed)
- **Location**: `src/dependencies/auth.py`
- **Purpose**: Verify admin role
- **Returns**: Same as get_current_user
- **Errors**: 403 if not admin

### Token Format
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "exp": 1234567890
}
```

### Configuration
| Setting | Source | Shared With |
|---------|--------|-------------|
| JWT Secret | BETTER_AUTH_SECRET | Better Auth |
| Algorithm | HS256 | Better Auth |

### Error Responses
| Scenario | Status | Message |
|----------|--------|---------|
| No token | 401 | "Not authenticated" |
| Invalid | 401 | "Could not validate credentials" |
| Expired | 401 | "Token has expired" |
| Wrong role | 403 | "Insufficient permissions" |
```

### Implementation Readiness Checklist

- [ ] JWT secret configured in environment
- [ ] Token extraction logic designed
- [ ] Claims mapping defined
- [ ] Error responses specified
- [ ] User context type defined
- [ ] Protected routes identified
- [ ] Optional auth routes identified
- [ ] Role requirements documented

## Output Format
Authentication middleware design documentation suitable for backend implementation planning.

## Related Skills
- design-jwt-verification
- handle-errors-edge-cases
- implement-fastapi-from-specs
