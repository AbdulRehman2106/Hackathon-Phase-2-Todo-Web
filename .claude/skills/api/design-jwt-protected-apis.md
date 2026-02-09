# Skill: Design Stateless, JWT-Protected APIs

## Purpose
Create API designs that leverage JWT for stateless authentication, ensuring scalability, security, and proper token handling.

## When to Use
- Designing APIs with JWT authentication
- Establishing token handling patterns
- Creating stateless API architectures
- Documenting API security requirements

## Instruction

### Stateless API Principles

A stateless JWT-protected API MUST:

1. **No Server Sessions**: Server stores no client state between requests
2. **Self-Contained Tokens**: JWT contains all needed user information
3. **Request Independence**: Each request is complete on its own
4. **Horizontal Scalability**: Any server can handle any request

### JWT Flow in API Design

```
┌─────────────────────────────────────────────────────────────┐
│                    STATELESS API FLOW                        │
└─────────────────────────────────────────────────────────────┘

1. CLIENT OBTAINS TOKEN
   ┌────────┐  credentials   ┌────────┐
   │ Client │───────────────▶│  Auth  │──▶ Validate credentials
   │        │◀───────────────│ Server │◀── Generate JWT
   └────────┘     JWT        └────────┘

2. CLIENT MAKES API REQUEST
   ┌────────┐  JWT in header  ┌────────┐
   │ Client │────────────────▶│  API   │──▶ Validate JWT signature
   │        │                 │ Server │──▶ Extract user from claims
   └────────┘                 └────────┘──▶ Process request

3. NO SESSION LOOKUP REQUIRED
   API Server validates JWT cryptographically
   No database query for session
   No shared session store between servers
```

### API Design Requirements

#### Request Structure
```http
GET /api/tasks HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

#### Token Validation Steps (Design Specification)
1. Extract token from Authorization header
2. Verify JWT signature using shared secret
3. Check token expiration (`exp` claim)
4. Extract user identity from `sub` claim
5. Proceed with business logic using extracted identity

#### Response Headers
```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: private, no-store  # For authenticated responses
```

### API Endpoint Design Patterns

#### Protected Endpoint Design
```yaml
endpoint: GET /api/tasks
authentication:
  required: true
  method: JWT Bearer Token
  header: Authorization
stateless_requirements:
  - No session lookup
  - User ID from token.sub
  - No server-side state dependency
request:
  headers:
    Authorization: Bearer <jwt>
  query_params:
    status: optional
    page: optional
response:
  success:
    status: 200
    body: { data: [...], meta: {...} }
  auth_failure:
    status: 401
    body: { error: { code: "UNAUTHORIZED" } }
```

#### User Context Extraction Design
```yaml
token_claims_usage:
  sub: User identifier for queries
  exp: Expiration validation
  iat: Token freshness check (optional)

user_context:
  source: JWT claims only
  never_from: Request body, query params
  database_lookup: Optional, for profile enrichment only
```

### Stateless Design Constraints

#### DO Design For:
- Token self-sufficiency
- Request isolation
- Horizontal scaling
- Load balancer compatibility
- Cache-friendly responses

#### DO NOT Design For:
- Server-side session storage
- Token-to-user database lookups for auth
- Sticky sessions
- In-memory user state
- Request correlation (except for logging)

### Token Handling Specifications

#### Token Transmission
```yaml
transmission:
  method: HTTP Header
  header_name: Authorization
  format: "Bearer {token}"

alternatives_not_recommended:
  - Query parameters (logged, cached)
  - Request body (non-standard)
  - Cookies without httpOnly (XSS risk)
```

#### Token Refresh Design
```yaml
refresh_flow:
  trigger: Token approaching expiration
  endpoint: POST /api/auth/refresh
  input: Valid (not expired) access token
  output: New access token

stateless_consideration:
  - Refresh can be validated without database
  - Or use separate refresh token with DB lookup
```

### Error Design for JWT APIs

```yaml
authentication_errors:
  missing_token:
    status: 401
    code: MISSING_TOKEN
    message: "Authorization header required"

  invalid_format:
    status: 401
    code: INVALID_TOKEN_FORMAT
    message: "Invalid authorization header format"

  expired_token:
    status: 401
    code: TOKEN_EXPIRED
    message: "Token has expired"
    www_authenticate: 'Bearer error="invalid_token", error_description="Token expired"'

  invalid_signature:
    status: 401
    code: INVALID_TOKEN
    message: "Invalid token"
    # Never reveal signature details

authorization_errors:
  insufficient_permissions:
    status: 403
    code: FORBIDDEN
    message: "Insufficient permissions"
```

### Scalability Considerations

```yaml
horizontal_scaling:
  enabled_by:
    - No server session state
    - JWT self-validation
    - Shared secret across instances

load_balancing:
  session_affinity: Not required
  any_instance_handles: Any authenticated request

caching:
  public_endpoints: Cache-Control headers
  authenticated_endpoints: private, no-store
```

### Security Design Requirements

```yaml
jwt_security:
  algorithm: HS256 or RS256
  secret_management: Environment variables
  token_lifetime: 15-60 minutes

api_security:
  https: Required for all endpoints
  cors: Configured for known origins
  rate_limiting: Per-user/per-IP limits

defense_in_depth:
  - Validate token on every request
  - Short token lifetime
  - Implement refresh mechanism
  - Monitor for token abuse patterns
```

## Output Format
API design specification with JWT authentication patterns, suitable for plan.md or API documentation.

## Related Skills
- design-restful-apis
- define-endpoint-auth-requirements
- enforce-api-data-isolation
