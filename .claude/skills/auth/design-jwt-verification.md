# Skill: Design JWT Verification for Backend Services

## Purpose
Establish robust JWT verification patterns for backend services, ensuring secure token validation and user authentication.

## When to Use
- Designing authentication middleware
- Establishing token validation requirements
- Creating backend security specifications
- Reviewing existing JWT verification logic

## Instruction

### JWT Verification Flow

Backend services MUST verify JWTs following this sequence:

```
┌─────────────────────────────────────────────────────────────────┐
│                   JWT VERIFICATION FLOW                          │
└─────────────────────────────────────────────────────────────────┘

Request Arrives
      │
      ▼
┌─────────────┐
│ Extract     │ Authorization: Bearer <token>
│ Token       │──────▶ Missing? → 401 Unauthorized
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Decode      │ Split into header.payload.signature
│ Structure   │──────▶ Malformed? → 401 Invalid Token
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Verify      │ HMAC(header.payload, secret) == signature
│ Signature   │──────▶ Invalid? → 401 Invalid Token
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Validate    │ exp > current_time
│ Expiration  │──────▶ Expired? → 401 Token Expired
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Validate    │ iss == expected_issuer
│ Issuer      │──────▶ Wrong? → 401 Invalid Token
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Validate    │ aud == expected_audience
│ Audience    │──────▶ Wrong? → 401 Invalid Token
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Extract     │ sub → user_id
│ Claims      │ role → permissions
└──────┬──────┘
       │
       ▼
   Proceed with
   Authenticated
   Request
```

### Verification Requirements

#### 1. Token Extraction

```yaml
extraction:
  source: Authorization header
  format: "Bearer {token}"
  case_sensitive: No (for "Bearer")

validation:
  - Header present
  - Starts with "Bearer " (with space)
  - Token portion is non-empty

errors:
  missing_header: 401 - "Authorization header required"
  invalid_format: 401 - "Invalid authorization format"
```

#### 2. Signature Verification

```yaml
signature_verification:
  algorithm: HS256 (or as specified in header)
  secret_source: Environment variable
  timing_safe: Yes (prevent timing attacks)

checks:
  - Algorithm in header matches expected
  - Signature matches computed value
  - No algorithm confusion (never "none")

security_rules:
  - Never accept alg: "none"
  - Validate alg claim before trusting
  - Use constant-time comparison
```

#### 3. Claims Validation

```yaml
required_claims:
  sub: User identifier (MUST be present)
  exp: Expiration time (MUST be valid)
  iat: Issued at (SHOULD be present)

optional_claims:
  iss: Issuer (validate if present)
  aud: Audience (validate if present)
  nbf: Not before (validate if present)

validation_rules:
  exp: current_timestamp < exp
  nbf: current_timestamp >= nbf (if present)
  iss: matches expected issuer (if validating)
  aud: matches expected audience (if validating)
```

### Middleware Design Specification

```yaml
middleware_name: JWTAuthMiddleware

responsibilities:
  - Extract token from request
  - Verify token validity
  - Attach user context to request
  - Pass through to next handler

configuration:
  secret_key: from_environment("JWT_SECRET")
  algorithm: "HS256"
  issuer: optional_validation
  audience: optional_validation
  leeway: 30  # seconds grace for clock skew

request_context:
  user_id: extracted from "sub" claim
  email: extracted from "email" claim (if present)
  role: extracted from "role" claim (if present)

bypass_paths:
  - /api/health
  - /api/auth/login
  - /api/auth/register
  - /api/public/*
```

### Error Response Specifications

```yaml
authentication_errors:

  missing_token:
    status: 401
    body:
      error:
        code: "MISSING_TOKEN"
        message: "Authorization header required"
    headers:
      WWW-Authenticate: 'Bearer'

  invalid_format:
    status: 401
    body:
      error:
        code: "INVALID_TOKEN_FORMAT"
        message: "Invalid authorization header format"

  invalid_signature:
    status: 401
    body:
      error:
        code: "INVALID_TOKEN"
        message: "Token validation failed"
    security_note: "Never reveal signature details"

  expired_token:
    status: 401
    body:
      error:
        code: "TOKEN_EXPIRED"
        message: "Token has expired"
    headers:
      WWW-Authenticate: 'Bearer error="invalid_token", error_description="Token expired"'

  invalid_claims:
    status: 401
    body:
      error:
        code: "INVALID_TOKEN"
        message: "Token validation failed"
    security_note: "Don't specify which claim failed"
```

### Better Auth Integration Design

When verifying tokens from Better Auth:

```yaml
better_auth_integration:

  shared_secret:
    source: Same BETTER_AUTH_SECRET in both frontend and backend
    environment_var: BETTER_AUTH_SECRET

  token_structure:
    header: { alg: "HS256", typ: "JWT" }
    payload:
      sub: User ID
      email: User email (if included)
      exp: Expiration timestamp
      iat: Issued at timestamp

  verification_steps:
    1. Use same secret as Better Auth
    2. Verify HS256 signature
    3. Validate expiration
    4. Extract sub as user identifier

  trust_model:
    frontend: Issues tokens (Better Auth)
    backend: Validates tokens (FastAPI)
    shared: Secret key (environment variable)
```

### Security Best Practices

#### Must Implement
- [ ] Signature verification before any claim access
- [ ] Expiration validation on every request
- [ ] Constant-time signature comparison
- [ ] Rejection of "alg: none"
- [ ] Secret key from environment variables
- [ ] Generic error messages (no info leakage)

#### Must Avoid
- [ ] Accepting tokens without signature verification
- [ ] Trusting client-provided user IDs
- [ ] Logging full token contents
- [ ] Exposing secret keys in code or logs
- [ ] Specific error messages about validation failures

### Performance Considerations

```yaml
performance:
  caching:
    - Cache verified tokens (short TTL)
    - Cache is invalidated on logout
    - Use user_id as cache key

  optimization:
    - Verify signature first (cheapest check)
    - Skip claims validation if signature fails
    - Use async verification where possible

  monitoring:
    - Track verification latency
    - Monitor failure rates
    - Alert on unusual patterns
```

## Output Format
JWT verification design specification suitable for backend implementation plans or security documentation.

## Related Skills
- jwt-structure-lifecycle
- secure-token-handling
- enforce-authorization-checks
