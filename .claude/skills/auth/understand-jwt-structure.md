# Understand JWT Structure and Lifecycle

## Purpose
Provide comprehensive understanding of JWT (JSON Web Token) structure, components, and lifecycle management.

## Skill Description
This skill explains how JWTs work, their structure, how they're created, validated, and managed throughout their lifecycle.

## JWT Overview

### What is JWT?
JSON Web Token (JWT) is an open standard (RFC 7519) for securely transmitting information between parties as a JSON object.

**Key Characteristics**:
- Self-contained: Contains all necessary information
- Compact: Can be sent via URL, POST parameter, or HTTP header
- Digitally signed: Verifiable and trustworthy
- Stateless: No server-side storage required

### Use Cases
- **Authentication**: User identity verification
- **Authorization**: Access control and permissions
- **Information Exchange**: Secure data transmission

## JWT Structure

### Three Components

A JWT consists of three parts separated by dots (`.`):
```
header.payload.signature
```

**Example**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### 1. Header

**Purpose**: Describes the token type and signing algorithm

**Structure**:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Fields**:
- `alg`: Algorithm used for signing (HS256, RS256, etc.)
- `typ`: Token type (always "JWT")

**Encoding**: Base64Url encoded

### 2. Payload (Claims)

**Purpose**: Contains the actual data (claims)

**Structure**:
```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "iat": 1516239022,
  "exp": 1516242622
}
```

**Encoding**: Base64Url encoded (NOT encrypted!)

**Important**: Payload is readable by anyone who has the token. Don't store sensitive data!

### 3. Signature

**Purpose**: Verifies token hasn't been tampered with

**Creation**:
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

**Verification**: Recompute signature and compare with token signature

## JWT Claims

### Registered Claims (Standard)

**sub (Subject)**:
- Identifies the subject of the token
- Typically user ID
- Example: `"sub": "user_123"`

**iat (Issued At)**:
- When token was created
- Unix timestamp
- Example: `"iat": 1640000000`

**exp (Expiration Time)**:
- When token expires
- Unix timestamp
- Example: `"exp": 1640003600`

**iss (Issuer)**:
- Who issued the token
- Your application identifier
- Example: `"iss": "https://myapp.com"`

**aud (Audience)**:
- Who token is intended for
- Your API identifier
- Example: `"aud": "https://api.myapp.com"`

**nbf (Not Before)**:
- Token not valid before this time
- Unix timestamp
- Example: `"nbf": 1640000000`

**jti (JWT ID)**:
- Unique identifier for token
- Prevents replay attacks
- Example: `"jti": "abc123"`

### Public Claims

Custom claims that should be collision-resistant:
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "role": "admin"
}
```

### Private Claims

Custom claims agreed upon between parties:
```json
{
  "organization_id": "org_456",
  "subscription_tier": "premium",
  "permissions": ["read", "write"]
}
```

## Token Lifecycle

### 1. Token Generation (Login)

**Process**:
1. User provides credentials
2. Server validates credentials
3. Server creates JWT payload with user info
4. Server signs payload with secret
5. Server returns token to client

**Example Flow**:
```
User → POST /api/auth/login
       { email, password }

Server:
  1. Validate credentials
  2. Create payload:
     {
       "sub": "user_123",
       "email": "user@example.com",
       "role": "user",
       "iat": 1640000000,
       "exp": 1640003600
     }
  3. Sign with secret
  4. Return token

Server → 200 OK
         {
           "access_token": "eyJ...",
           "token_type": "Bearer",
           "expires_in": 3600
         }
```

### 2. Token Storage (Client)

**Options**:

**Memory (JavaScript variable)**:
- Most secure
- Lost on page refresh
- Requires refresh token

**LocalStorage**:
- Persists across sessions
- Vulnerable to XSS
- Easy to implement

**SessionStorage**:
- Cleared when tab closes
- Vulnerable to XSS
- Better than LocalStorage

**HttpOnly Cookie**:
- Not accessible to JavaScript
- Protected from XSS
- Requires CSRF protection
- Best for web applications

### 3. Token Usage (Authenticated Requests)

**Process**:
1. Client includes token in request
2. Server extracts token
3. Server validates token
4. Server processes request

**Request Format**:
```
GET /api/tasks
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Server Validation**:
1. Extract token from Authorization header
2. Decode header and payload
3. Verify signature
4. Check expiration
5. Extract user information
6. Process request

### 4. Token Expiration

**Short-Lived Access Tokens**:
- Lifetime: 15 minutes to 1 hour
- Used for API requests
- Expires quickly to limit exposure

**Long-Lived Refresh Tokens**:
- Lifetime: Days to weeks
- Used to obtain new access tokens
- Can be revoked
- Stored securely

**Expiration Handling**:
```
Client → GET /api/tasks
         Authorization: Bearer {expired_token}

Server → 401 Unauthorized
         { "error": "token_expired" }

Client → POST /api/auth/refresh
         { "refresh_token": "..." }

Server → 200 OK
         { "access_token": "new_token..." }

Client → GET /api/tasks (retry)
         Authorization: Bearer {new_token}

Server → 200 OK
         { "tasks": [...] }
```

### 5. Token Refresh

**Purpose**: Obtain new access token without re-login

**Flow**:
```
1. Access token expires
2. Client detects 401 error
3. Client sends refresh token
4. Server validates refresh token
5. Server issues new access token
6. Client stores new token
7. Client retries original request
```

**Refresh Token Rotation**:
- Issue new refresh token with each refresh
- Invalidate old refresh token
- Prevents token reuse
- Enhances security

### 6. Token Revocation (Logout)

**Challenges**:
- JWTs are stateless
- Can't be invalidated before expiration
- Need additional mechanism

**Solutions**:

**1. Short Expiration + Refresh Tokens**:
- Access tokens expire quickly
- Revoke refresh token on logout
- Access token becomes useless after expiration

**2. Token Blacklist**:
- Store revoked tokens in database/cache
- Check blacklist on each request
- Loses stateless benefit

**3. Token Versioning**:
- Include version number in token
- Increment version on logout
- Reject tokens with old version

## Token Validation

### Server-Side Validation Steps

**Step 1: Extract Token**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                      ↑
                Extract this part
```

**Step 2: Decode Token**:
```
Split by '.' to get three parts:
- header (base64url decode)
- payload (base64url decode)
- signature (keep as is)
```

**Step 3: Verify Signature**:
```
Recompute signature:
  HMACSHA256(
    base64UrlEncode(header) + "." + base64UrlEncode(payload),
    server_secret
  )

Compare with token signature:
  If match → Valid
  If mismatch → Invalid (tampered)
```

**Step 4: Check Expiration**:
```
current_time = now()
token_exp = payload.exp

If current_time > token_exp:
  → Token expired
Else:
  → Token valid
```

**Step 5: Validate Claims**:
```
Check required claims:
- sub exists (user ID)
- exp exists and valid
- iss matches (if used)
- aud matches (if used)
```

**Step 6: Extract User Info**:
```
user_id = payload.sub
user_email = payload.email
user_role = payload.role
```

## Security Considerations

### Secret Management

**Requirements**:
- Strong, random secret (256+ bits)
- Stored in environment variables
- Never in code or version control
- Different per environment
- Rotated periodically

**Example**:
```bash
# Generate strong secret
openssl rand -base64 64

# Store in .env
JWT_SECRET=your-very-long-random-secret-here
```

### Token Security

**Do**:
- Use HTTPS for all token transmission
- Short expiration times
- Validate signature on every request
- Check expiration on every request
- Use strong signing algorithms (HS256, RS256)

**Don't**:
- Store sensitive data in payload
- Use weak secrets
- Skip signature verification
- Ignore expiration
- Send tokens over HTTP

### Common Vulnerabilities

**1. None Algorithm Attack**:
- Attacker sets alg to "none"
- No signature verification
- **Prevention**: Always verify algorithm

**2. Weak Secret**:
- Short or predictable secret
- Can be brute-forced
- **Prevention**: Use strong, random secrets

**3. Missing Expiration Check**:
- Expired tokens still accepted
- **Prevention**: Always check exp claim

**4. Sensitive Data in Payload**:
- Payload is readable
- Passwords, secrets exposed
- **Prevention**: Only store non-sensitive identifiers

## Token Types

### Access Token
- Short-lived (15-60 minutes)
- Used for API requests
- Contains user identity and permissions
- Cannot be revoked (expires naturally)

### Refresh Token
- Long-lived (days to weeks)
- Used to obtain new access tokens
- Stored securely
- Can be revoked
- Should be rotated on use

### ID Token (OpenID Connect)
- Contains user profile information
- Used for authentication
- Not for API authorization
- Consumed by client application

## Best Practices

1. **Short Access Token Lifetime**: 15-60 minutes maximum

2. **Use Refresh Tokens**: For long-lived sessions

3. **Rotate Refresh Tokens**: Issue new on each use

4. **Strong Secrets**: 256+ bits, cryptographically random

5. **HTTPS Only**: Never send tokens over HTTP

6. **Validate Everything**: Signature, expiration, claims

7. **Minimal Payload**: Only essential information

8. **Proper Storage**: HttpOnly cookies or secure storage

9. **Monitor Usage**: Track authentication failures

10. **Plan for Revocation**: Logout and security events

## Debugging JWTs

### Decode Token (jwt.io)
Visit https://jwt.io to decode and inspect tokens

### Manual Decoding
```javascript
// Split token
const [header, payload, signature] = token.split('.');

// Decode header
const decodedHeader = JSON.parse(atob(header));

// Decode payload
const decodedPayload = JSON.parse(atob(payload));

console.log('Header:', decodedHeader);
console.log('Payload:', decodedPayload);
```

### Verify Expiration
```javascript
const payload = JSON.parse(atob(token.split('.')[1]));
const exp = payload.exp;
const now = Math.floor(Date.now() / 1000);

if (now > exp) {
  console.log('Token expired');
} else {
  console.log('Token valid for', exp - now, 'seconds');
}
```

## Common Issues

**Issue**: Token too large
**Solution**: Minimize payload, use references instead of full data

**Issue**: Token expired immediately
**Solution**: Check server time synchronization

**Issue**: Signature verification fails
**Solution**: Ensure same secret on all servers

**Issue**: Cannot revoke tokens
**Solution**: Use refresh tokens with short access token lifetime

## Success Criteria

Understanding JWT structure and lifecycle enables:
- Proper token generation
- Correct token validation
- Secure token handling
- Effective debugging
- Appropriate security measures

---

**Application**: Use this skill when implementing JWT authentication, debugging token issues, or designing secure authentication systems.
