# Skill: JWT Structure and Lifecycle Understanding

## Purpose
Provide comprehensive understanding of JWT (JSON Web Token) structure, components, and lifecycle management for secure authentication systems.

## When to Use
- Designing authentication systems
- Debugging JWT-related issues
- Reviewing token security
- Explaining JWT concepts to team members

## Instruction

### JWT Structure

A JWT consists of three parts separated by dots (.):

```
xxxxx.yyyyy.zzzzz
  │      │      │
  │      │      └── Signature
  │      └── Payload
  └── Header
```

#### 1. Header

The header contains metadata about the token:

```json
{
  "alg": "HS256",   // Signing algorithm
  "typ": "JWT"     // Token type
}
```

**Common Algorithms:**
| Algorithm | Type | Use Case |
|-----------|------|----------|
| HS256 | Symmetric | Shared secret (single service) |
| HS384 | Symmetric | Higher security variant |
| HS512 | Symmetric | Highest security variant |
| RS256 | Asymmetric | Public/private key (distributed) |
| ES256 | Asymmetric | Elliptic curve (efficient) |

#### 2. Payload (Claims)

The payload contains claims about the entity:

```json
{
  // Registered Claims (standardized)
  "iss": "https://auth.example.com",  // Issuer
  "sub": "user-uuid-here",            // Subject (user ID)
  "aud": "https://api.example.com",   // Audience
  "exp": 1735689600,                  // Expiration (Unix timestamp)
  "iat": 1735686000,                  // Issued At
  "nbf": 1735686000,                  // Not Before
  "jti": "unique-token-id",           // JWT ID (for revocation)

  // Public Claims (application-specific)
  "email": "user@example.com",
  "role": "user"
}
```

**Claim Types:**

| Type | Description | Examples |
|------|-------------|----------|
| Registered | Predefined by JWT spec | iss, sub, aud, exp, iat, nbf, jti |
| Public | Custom, registered in IANA | email, name, roles |
| Private | Custom, shared by agreement | app_user_id, tenant_id |

#### 3. Signature

Created by signing header + payload:

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

The signature ensures:
- Token wasn't modified
- Token came from legitimate issuer

### JWT Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                       JWT LIFECYCLE                              │
└─────────────────────────────────────────────────────────────────┘

1. CREATION (Authentication)
   ┌──────────────┐
   │ User Login   │
   │ (credentials)│
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Validate     │
   │ Credentials  │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Generate JWT │──▶ Claims populated
   │ Sign Token   │──▶ Signature created
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Return Token │
   │ to Client    │
   └──────────────┘

2. USAGE (Authorization)
   ┌──────────────┐
   │ Client sends │
   │ JWT in header│
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Verify       │
   │ Signature    │──▶ Reject if invalid
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Check        │
   │ Expiration   │──▶ Reject if expired
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Extract      │
   │ Claims       │──▶ Use for authorization
   └──────────────┘

3. REFRESH (Token Renewal)
   ┌──────────────┐
   │ Token near   │
   │ expiration   │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Send refresh │
   │ request      │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Validate     │
   │ refresh cred │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Issue new    │
   │ access token │
   └──────────────┘

4. EXPIRATION/REVOCATION
   ┌──────────────┐
   │ Token        │
   │ expires      │──▶ Auto-invalidated
   └──────────────┘
        OR
   ┌──────────────┐
   │ Manual       │
   │ revocation   │──▶ Blocklist (if stateful)
   └──────────────┘
```

### Token Lifetimes

| Token Type | Typical Lifetime | Storage | Purpose |
|------------|------------------|---------|---------|
| Access Token | 15-60 minutes | Memory/httpOnly cookie | API authentication |
| Refresh Token | 7-30 days | httpOnly cookie | Obtain new access tokens |
| ID Token | 1 hour | Not stored long-term | User info (OIDC) |

### Lifecycle Best Practices

#### Token Creation
- Include only necessary claims
- Never include sensitive data (passwords, PII)
- Use appropriate expiration times
- Generate unique JTI for tracking

#### Token Storage
- Access tokens: httpOnly cookies or memory
- Refresh tokens: httpOnly, secure cookies
- Never: localStorage (XSS vulnerable)

#### Token Validation
1. Verify signature first
2. Check expiration (exp)
3. Verify issuer (iss)
4. Check audience (aud)
5. Validate not-before (nbf) if present

#### Token Refresh Strategy
```yaml
strategy:
  preemptive: Refresh before expiry
  threshold: 5 minutes before exp
  silent: Background refresh without user action
  fallback: Redirect to login if refresh fails
```

### Security Considerations

#### Never Do
- Store tokens in localStorage
- Include sensitive data in payload
- Use weak or no signature algorithm
- Accept expired tokens
- Trust client-provided claims

#### Always Do
- Use HTTPS for token transmission
- Validate signature on every request
- Use appropriate expiration times
- Implement secure token storage
- Log token usage for audit

### Decoding vs Verifying

```yaml
decode:
  purpose: Read claims without validation
  use_case: Client-side claim inspection
  security: Unsafe for authorization decisions

verify:
  purpose: Validate signature and claims
  use_case: Server-side authorization
  security: Required for secure operations
```

**Rule**: Clients may decode tokens; servers MUST verify tokens.

## Output Format
Educational documentation about JWT structure and lifecycle, suitable for team knowledge sharing or architecture documentation.

## Related Skills
- design-jwt-verification
- secure-token-handling
- design-auth-flows
