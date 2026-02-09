# Design Stateless JWT-Protected APIs

## Purpose
Guide the design of stateless APIs that use JWT tokens for authentication, ensuring scalability and security.

## Skill Description
This skill provides principles and patterns for designing APIs that are stateless, scalable, and secured with JWT (JSON Web Token) authentication.

## Stateless API Principles

### What is Stateless?
**Definition**: Server doesn't store client session state between requests

**Characteristics**:
- Each request contains all information needed
- No server-side session storage
- No dependency on previous requests
- Horizontally scalable

**Benefits**:
- Easy to scale (add more servers)
- No session synchronization needed
- Simpler server architecture
- Better performance

### Stateless vs Stateful

**Stateful (Session-Based)**:
```
Request 1: Login → Server creates session → Returns session ID
Request 2: Get data + session ID → Server looks up session → Returns data
```
- Server stores session state
- Session ID in cookie
- Requires session storage (memory, Redis, database)
- Sticky sessions or session replication needed

**Stateless (JWT-Based)**:
```
Request 1: Login → Server generates JWT → Returns JWT
Request 2: Get data + JWT → Server validates JWT → Returns data
```
- Server stores nothing
- JWT contains all needed information
- No session storage required
- Any server can handle any request

## JWT Structure

### Token Components

**Header**:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```
- Algorithm used for signing
- Token type

**Payload (Claims)**:
```json
{
  "sub": "user_id_123",
  "email": "user@example.com",
  "role": "user",
  "iat": 1640000000,
  "exp": 1640003600
}
```
- User identification
- User attributes
- Token metadata

**Signature**:
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```
- Cryptographic signature
- Verifies token integrity
- Prevents tampering

**Complete Token**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```
- Base64-encoded header
- Base64-encoded payload
- Signature

## JWT Claims

### Standard Claims

**sub (Subject)**:
- User identifier
- Primary key or unique ID
- Used to identify user

**iat (Issued At)**:
- Token creation timestamp
- Unix timestamp
- Used for token age verification

**exp (Expiration)**:
- Token expiration timestamp
- Unix timestamp
- Token invalid after this time

**iss (Issuer)**:
- Who issued the token
- Your application identifier
- Optional but recommended

**aud (Audience)**:
- Who token is intended for
- Your API identifier
- Optional but recommended

### Custom Claims

**User Information**:
```json
{
  "sub": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user"
}
```

**Permissions**:
```json
{
  "sub": "user_123",
  "permissions": ["read:tasks", "write:tasks"],
  "role": "admin"
}
```

**Application-Specific**:
```json
{
  "sub": "user_123",
  "organization_id": "org_456",
  "subscription_tier": "premium"
}
```

## Token Lifecycle

### 1. Token Generation (Login)
```
User                    Server
 │                        │
 │  POST /api/auth/login  │
 │  { email, password }   │
 ├───────────────────────▶│
 │                        │ Validate credentials
 │                        │ Generate JWT
 │                        │   - Set user_id in sub
 │                        │   - Set expiration
 │                        │   - Sign with secret
 │                        │
 │  200 OK                │
 │  { access_token: JWT } │
 │◀───────────────────────┤
 │                        │
 │  Store token           │
 │                        │
```

### 2. Token Usage (Authenticated Request)
```
User                    Server
 │                        │
 │  GET /api/tasks        │
 │  Authorization: Bearer │
 ├───────────────────────▶│
 │                        │ Extract token
 │                        │ Verify signature
 │                        │ Check expiration
 │                        │ Extract user_id
 │                        │ Process request
 │                        │
 │  200 OK                │
 │  [tasks data]          │
 │◀───────────────────────┤
 │                        │
```

### 3. Token Expiration
```
User                    Server
 │                        │
 │  GET /api/tasks        │
 │  Authorization: Bearer │
 ├───────────────────────▶│
 │                        │ Extract token
 │                        │ Verify signature
 │                        │ Check expiration
 │                        │ ❌ Token expired
 │                        │
 │  401 Unauthorized      │
 │  { error: "expired" }  │
 │◀───────────────────────┤
 │                        │
 │  Request new token     │
 │  (refresh flow)        │
 │                        │
```

## Token Validation

### Server-Side Validation Steps

**1. Extract Token**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                      ↑
                Extract this part
```

**2. Verify Signature**:
```
Recompute signature using:
- Token header
- Token payload
- Server secret

Compare with token signature
If mismatch → Invalid token
```

**3. Check Expiration**:
```
Extract exp claim
Compare with current time
If expired → Token invalid
```

**4. Validate Claims**:
```
Check required claims present:
- sub (user ID)
- exp (expiration)
- iss (issuer, if used)
- aud (audience, if used)
```

**5. Extract User Information**:
```
Get user_id from sub claim
Use for authorization checks
```

## Stateless API Design Patterns

### Pattern 1: All State in Token
```json
{
  "sub": "user_123",
  "email": "user@example.com",
  "role": "admin",
  "permissions": ["read", "write", "delete"],
  "organization_id": "org_456"
}
```

**Advantages**:
- No database lookups needed
- Fast validation
- Truly stateless

**Disadvantages**:
- Larger tokens
- Can't revoke before expiration
- Stale data if user changes

### Pattern 2: Minimal Token + Database Lookup
```json
{
  "sub": "user_123",
  "exp": 1640003600
}
```

**Advantages**:
- Smaller tokens
- Always current data
- Can check user status

**Disadvantages**:
- Database lookup per request
- Slightly slower
- Not purely stateless

### Pattern 3: Hybrid Approach
```json
{
  "sub": "user_123",
  "role": "user",
  "exp": 1640003600
}
```

**Advantages**:
- Balance of size and functionality
- Basic info in token
- Lookup only when needed

**Recommended**: Use this approach for most applications

## Token Security

### Secret Management

**Never**:
- Hardcode secrets in code
- Commit secrets to version control
- Share secrets between environments
- Use weak or short secrets

**Always**:
- Store secrets in environment variables
- Use strong, random secrets (256+ bits)
- Rotate secrets periodically
- Use different secrets per environment

**Example**:
```
# .env file
JWT_SECRET=your-very-long-random-secret-key-here-at-least-256-bits
JWT_EXPIRATION=3600
```

### Token Expiration

**Access Token**:
- Short lifetime (15 minutes to 1 hour)
- Used for API requests
- Expires quickly to limit exposure

**Refresh Token**:
- Long lifetime (days to weeks)
- Used to get new access tokens
- Stored securely
- Can be revoked

**Pattern**:
```
Login → Access Token (1 hour) + Refresh Token (7 days)
Access Token expires → Use Refresh Token → New Access Token
Refresh Token expires → User must login again
```

### Token Storage

**Client-Side Storage Options**:

**1. Memory (Most Secure)**:
- Store in JavaScript variable
- Lost on page refresh
- Requires refresh token

**2. LocalStorage (Convenient)**:
- Persists across sessions
- Vulnerable to XSS
- Easy to implement

**3. HttpOnly Cookie (Secure)**:
- Not accessible to JavaScript
- Protected from XSS
- Requires CSRF protection

**Recommendation**: HttpOnly cookie for web apps, secure storage for mobile apps

## Refresh Token Pattern

### Flow
```
1. User logs in
   → Server returns access token (short) + refresh token (long)

2. User makes requests with access token
   → Works until access token expires

3. Access token expires
   → Client detects 401 error
   → Client sends refresh token to /api/auth/refresh
   → Server validates refresh token
   → Server returns new access token

4. Client retries original request with new access token
   → Request succeeds
```

### Implementation Considerations

**Refresh Token Storage**:
- Store in database (makes it revocable)
- Associate with user
- Track usage and expiration

**Refresh Token Rotation**:
- Issue new refresh token with each refresh
- Invalidate old refresh token
- Prevents token reuse

**Refresh Token Revocation**:
- User logout → Revoke refresh token
- Password change → Revoke all refresh tokens
- Suspicious activity → Revoke tokens

## Stateless Authorization

### Resource Ownership Check
```
GET /api/tasks/123

1. Extract user_id from JWT (sub claim)
2. Fetch task from database
3. Compare task.user_id with JWT user_id
4. If match → Allow access
5. If no match → Return 403 Forbidden
```

### Role-Based Access
```
DELETE /api/admin/users/456

1. Extract role from JWT
2. Check if role is 'admin'
3. If admin → Allow access
4. If not admin → Return 403 Forbidden
```

### Permission-Based Access
```
POST /api/projects/789/delete

1. Extract permissions from JWT
2. Check if 'delete:projects' permission present
3. If present → Allow access
4. If not present → Return 403 Forbidden
```

## Scalability Benefits

### Horizontal Scaling
```
Load Balancer
     │
     ├─────┬─────┬─────┐
     ▼     ▼     ▼     ▼
   API   API   API   API
  Server Server Server Server
```

**Benefits**:
- Any server can handle any request
- No session affinity needed
- Easy to add/remove servers
- No session synchronization

### No Session Storage
- No Redis/Memcached for sessions
- No database session table
- Reduced infrastructure complexity
- Lower operational costs

### Caching
- Responses can be cached
- No user-specific server state
- CDN-friendly for public endpoints

## Common Pitfalls

### 1. Storing Sensitive Data in JWT
**Problem**: JWT payload is base64-encoded, not encrypted
**Solution**: Only store non-sensitive identifiers

### 2. Long Token Lifetimes
**Problem**: Stolen tokens valid for extended period
**Solution**: Short access tokens + refresh tokens

### 3. No Token Revocation
**Problem**: Can't invalidate tokens before expiration
**Solution**: Use refresh tokens that can be revoked

### 4. Weak Secrets
**Problem**: Tokens can be forged
**Solution**: Use strong, random secrets (256+ bits)

### 5. Not Validating Expiration
**Problem**: Expired tokens still accepted
**Solution**: Always check exp claim

### 6. Trusting Client-Side Validation
**Problem**: Client can modify tokens
**Solution**: Always validate on server

## Best Practices

1. **Short Access Tokens**: 15-60 minutes maximum

2. **Refresh Token Rotation**: Issue new refresh token on each use

3. **Secure Secret Storage**: Environment variables, never in code

4. **Validate Every Request**: Check signature, expiration, claims

5. **Minimal Token Payload**: Only essential information

6. **HTTPS Only**: Never send tokens over HTTP

7. **Proper Error Handling**: Clear 401/403 responses

8. **Token Revocation Strategy**: Plan for logout and security events

9. **Monitor Token Usage**: Track authentication failures

10. **Regular Secret Rotation**: Change secrets periodically

## Testing Checklist

- [ ] Token generation works correctly
- [ ] Token validation rejects invalid signatures
- [ ] Token validation rejects expired tokens
- [ ] Token validation rejects malformed tokens
- [ ] User information extracted correctly
- [ ] Authorization checks work with token claims
- [ ] Refresh token flow works
- [ ] Token revocation works
- [ ] Multiple concurrent requests work
- [ ] Tokens work across different servers

## Success Criteria

Well-designed stateless JWT-protected APIs provide:
- Horizontal scalability
- No server-side session state
- Secure authentication
- Fast request processing
- Simple infrastructure
- Easy to test and debug

---

**Application**: Use this skill when designing authentication for scalable APIs, planning JWT implementation, or reviewing stateless API architectures.
