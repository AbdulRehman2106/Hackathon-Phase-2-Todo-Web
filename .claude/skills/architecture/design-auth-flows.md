# Skill: Design Authentication Flows Conceptually

## Purpose
Create clear, secure authentication flow designs that establish how users prove their identity and how that identity is maintained across requests.

## When to Use
- Planning authentication for a new application
- Evaluating authentication architecture decisions
- Documenting auth flows for implementation
- Reviewing existing auth implementations

## Instruction

### Authentication Flow Components

Every authentication system has these core components:

1. **Identity Provider**: Source of truth for user credentials
2. **Authentication Endpoint**: Where credentials are verified
3. **Token/Session**: Proof of successful authentication
4. **Token Storage**: Where authentication proof is kept
5. **Token Transmission**: How proof is sent with requests
6. **Token Validation**: How proof is verified on each request

### JWT-Based Authentication Flow

#### Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                           │
└──────────────────────────────────────────────────────────────────┘

1. LOGIN REQUEST
   ┌─────────┐                    ┌─────────┐
   │ Client  │───credentials────▶│ Backend │
   └─────────┘                    └────┬────┘
                                       │
                                       ▼
                                 ┌─────────┐
                                 │   DB    │ verify credentials
                                 └────┬────┘
                                       │
2. TOKEN ISSUANCE                      │
   ┌─────────┐                    ┌────▼────┐
   │ Client  │◀──────JWT─────────│ Backend │ sign token
   └─────────┘                    └─────────┘

3. AUTHENTICATED REQUEST
   ┌─────────┐   JWT in header    ┌─────────┐
   │ Client  │──────────────────▶│ Backend │ validate + decode
   └─────────┘                    └────┬────┘
                                       │
                                       ▼
                                 ┌─────────┐
                                 │   DB    │ query with user_id
                                 └─────────┘

4. TOKEN REFRESH (before expiry)
   ┌─────────┐   refresh token    ┌─────────┐
   │ Client  │──────────────────▶│ Backend │ validate + issue new
   └─────────┘◀────new JWT───────└─────────┘
```

### Flow Design Checklist

#### Registration Flow
- [ ] Email/username uniqueness validation
- [ ] Password strength requirements
- [ ] Email verification (if required)
- [ ] Initial token issuance or redirect to login
- [ ] Secure password hashing (bcrypt/argon2)

#### Login Flow
- [ ] Credential validation
- [ ] Rate limiting for brute force protection
- [ ] Token generation with appropriate claims
- [ ] Secure token delivery
- [ ] Login attempt logging

#### Session Maintenance
- [ ] Token expiration strategy
- [ ] Refresh token mechanism
- [ ] Secure token storage on client
- [ ] Automatic token refresh before expiry

#### Logout Flow
- [ ] Client token removal
- [ ] Server-side invalidation (if stateful)
- [ ] Redirect to unauthenticated state

### Token Design Considerations

#### Access Token Claims (JWT Payload)
```json
{
  "sub": "user_uuid",           // Subject (user identifier)
  "iat": 1234567890,            // Issued at
  "exp": 1234571490,            // Expiration (short-lived)
  "iss": "your-app",            // Issuer
  "aud": "your-app-api"         // Audience
}
```

#### Token Lifecycle
| Token Type | Lifetime | Storage | Purpose |
|------------|----------|---------|---------|
| Access Token | 15-60 min | Memory/httpOnly cookie | API authentication |
| Refresh Token | 7-30 days | httpOnly cookie | Obtain new access tokens |

### Security Requirements

#### Must Implement
- HTTPS for all auth endpoints
- Secure password hashing
- Token signature verification
- Expiration enforcement
- CSRF protection for cookie-based tokens

#### Must Avoid
- Storing tokens in localStorage (XSS risk)
- Long-lived access tokens
- Sensitive data in token payload
- Token transmission via URL parameters
- Symmetric secrets in client code

### Better Auth Integration Points

When designing for Better Auth:

1. **Frontend Responsibility**
   - Initialize Better Auth client
   - Handle auth UI (login/register forms)
   - Store tokens as directed by library
   - Include tokens in API requests

2. **Backend Responsibility**
   - Share JWT secret with Better Auth
   - Validate tokens on each request
   - Extract user identity from token
   - Never trust client-provided user IDs

### Error Handling

| Scenario | HTTP Status | Action |
|----------|-------------|--------|
| Invalid credentials | 401 | Generic error message |
| Expired token | 401 | Trigger refresh flow |
| Invalid token | 401 | Clear token, redirect to login |
| Insufficient permissions | 403 | Show forbidden message |
| Rate limited | 429 | Show retry message |

## Output Format
Authentication flow documentation with diagrams, suitable for inclusion in architecture plan or security documentation.

## Related Skills
- design-fullstack-architecture
- jwt-structure-lifecycle
- secure-token-handling
