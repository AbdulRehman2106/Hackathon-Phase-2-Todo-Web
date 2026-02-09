# Design Authentication Flows

## Purpose
Guide the conceptual design of authentication flows that are secure, user-friendly, and appropriate for the application's needs.

## Skill Description
This skill provides knowledge for designing authentication flows from a high-level perspective, focusing on user experience, security, and system integration without implementation details.

## Authentication Flow Types

### 1. Registration Flow
User creates a new account

**Steps**:
1. User provides registration information
2. System validates input
3. System checks for existing account
4. System creates user account
5. System sends verification (optional)
6. User confirms account (optional)
7. User is logged in or redirected to login

**Considerations**:
- What information to collect (email, username, password)
- Password requirements (length, complexity)
- Email verification requirement
- Terms of service acceptance
- Privacy policy acknowledgment
- Duplicate account prevention

### 2. Login Flow
User accesses existing account

**Steps**:
1. User provides credentials (email/username + password)
2. System validates credentials
3. System generates authentication token
4. System returns token to user
5. User stores token
6. User accesses protected resources with token

**Considerations**:
- Credential types (email, username, phone)
- "Remember me" functionality
- Failed login attempt handling
- Account lockout after multiple failures
- Password reset link availability

### 3. Logout Flow
User ends authenticated session

**Steps**:
1. User initiates logout
2. System invalidates token (if stateful)
3. Client removes stored token
4. User redirected to public page

**Considerations**:
- Token invalidation strategy
- Cleanup of client-side data
- Redirect destination
- Confirmation requirement

### 4. Password Reset Flow
User recovers forgotten password

**Steps**:
1. User requests password reset
2. System sends reset link to email
3. User clicks link with token
4. System validates reset token
5. User provides new password
6. System updates password
7. System invalidates reset token
8. User logs in with new password

**Considerations**:
- Reset token expiration time
- Email delivery reliability
- Token single-use enforcement
- Password validation rules
- Notification of password change

### 5. Token Refresh Flow
User maintains session without re-login

**Steps**:
1. Access token expires
2. Client detects expiration
3. Client sends refresh token
4. System validates refresh token
5. System issues new access token
6. Client stores new token
7. Client retries original request

**Considerations**:
- Access token lifetime
- Refresh token lifetime
- Refresh token rotation
- Concurrent refresh handling

## Authentication Mechanisms

### Session-Based Authentication
**Concept**: Server maintains session state

**Flow**:
```
1. User logs in
2. Server creates session
3. Server stores session ID in cookie
4. Client sends cookie with each request
5. Server validates session
```

**Characteristics**:
- Stateful (server stores sessions)
- Cookie-based
- Server can invalidate sessions
- Requires session storage

### Token-Based Authentication (JWT)
**Concept**: Client holds authentication proof

**Flow**:
```
1. User logs in
2. Server generates JWT token
3. Client stores token
4. Client sends token in Authorization header
5. Server validates token signature
```

**Characteristics**:
- Stateless (no server-side storage)
- Self-contained tokens
- Cannot invalidate before expiration
- Scalable across servers

### OAuth 2.0 / Social Login
**Concept**: Third-party authentication

**Flow**:
```
1. User clicks "Login with Google"
2. Redirect to Google login
3. User authenticates with Google
4. Google redirects back with code
5. Server exchanges code for token
6. Server creates user session
```

**Characteristics**:
- Delegated authentication
- No password management
- User convenience
- Dependency on third party

## Security Considerations

### Password Security
- Minimum length requirements (8+ characters)
- Complexity requirements (uppercase, lowercase, numbers, symbols)
- Password strength indicator
- Common password prevention
- Password history (prevent reuse)

### Token Security
- Secure token generation (cryptographically random)
- Appropriate token lifetime (short for access, long for refresh)
- Secure token storage (httpOnly cookies or secure storage)
- Token transmission over HTTPS only
- Token signature verification

### Account Security
- Rate limiting on login attempts
- Account lockout after failed attempts
- CAPTCHA for suspicious activity
- Two-factor authentication (optional)
- Email notifications for security events

### Data Protection
- Passwords never stored in plain text
- Passwords hashed with strong algorithm (bcrypt, Argon2)
- Tokens encrypted in transit (HTTPS)
- Sensitive data not in tokens
- Secure password reset process

## User Experience Considerations

### Smooth Onboarding
- Minimal required information
- Clear password requirements
- Inline validation feedback
- Progress indication for multi-step
- Social login options

### Error Handling
- Clear, helpful error messages
- No information leakage (don't reveal if email exists)
- Guidance for resolution
- Support contact information

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- Clear focus indicators
- Sufficient color contrast
- Form label associations

### Mobile Experience
- Touch-friendly input fields
- Appropriate keyboard types
- Biometric authentication support
- Remember device option
- Responsive design

## Flow Diagrams

### Registration Flow
```
User                    System
 │                        │
 │  Submit registration   │
 ├───────────────────────▶│
 │                        │ Validate input
 │                        │ Check duplicates
 │                        │ Create account
 │                        │ Send verification
 │                        │
 │  Registration success  │
 │◀───────────────────────┤
 │                        │
 │  Click verify link     │
 ├───────────────────────▶│
 │                        │ Verify account
 │                        │
 │  Account verified      │
 │◀───────────────────────┤
 │                        │
```

### Login Flow (JWT)
```
User                    System
 │                        │
 │  Submit credentials    │
 ├───────────────────────▶│
 │                        │ Validate credentials
 │                        │ Generate JWT
 │                        │
 │  Return JWT token      │
 │◀───────────────────────┤
 │                        │
 │  Store token           │
 │                        │
 │  Request with token    │
 ├───────────────────────▶│
 │                        │ Validate token
 │                        │ Process request
 │                        │
 │  Return response       │
 │◀───────────────────────┤
 │                        │
```

### Password Reset Flow
```
User                    System
 │                        │
 │  Request reset         │
 ├───────────────────────▶│
 │                        │ Generate reset token
 │                        │ Send email
 │                        │
 │  Receive email         │
 │◀───────────────────────┤
 │                        │
 │  Click reset link      │
 ├───────────────────────▶│
 │                        │ Validate token
 │                        │
 │  Show reset form       │
 │◀───────────────────────┤
 │                        │
 │  Submit new password   │
 ├───────────────────────▶│
 │                        │ Update password
 │                        │ Invalidate token
 │                        │
 │  Password updated      │
 │◀───────────────────────┤
 │                        │
```

## State Management

### Client-Side State
- Authentication status (logged in/out)
- User information (name, email, role)
- Token storage location
- Token expiration tracking

### Server-Side State (if applicable)
- Active sessions
- Refresh token registry
- Password reset tokens
- Account lockout status

## Multi-Device Considerations

### Session Management
- Allow multiple concurrent sessions
- Show active sessions to user
- Allow remote session termination
- Device identification

### Token Management
- Separate tokens per device
- Device-specific refresh tokens
- Revocation of specific device tokens

## Error Scenarios

### Invalid Credentials
- Clear error message
- No indication of which part is wrong
- Link to password reset
- Account lockout after attempts

### Expired Token
- Automatic refresh attempt
- Redirect to login if refresh fails
- Preserve user's intended action
- Clear explanation

### Network Errors
- Retry mechanism
- Offline detection
- Queue actions for later
- User notification

### Account Issues
- Account not verified
- Account suspended
- Account deleted
- Clear next steps

## Integration Points

### Frontend Integration
- Login form component
- Registration form component
- Protected route handling
- Token storage and retrieval
- Automatic token refresh
- Logout functionality

### Backend Integration
- Authentication endpoint
- Token generation
- Token validation middleware
- User session management
- Password hashing
- Email sending

### Database Integration
- User account storage
- Password hash storage
- Token storage (if stateful)
- Session storage (if applicable)
- Audit log storage

## Best Practices

1. **Use HTTPS**: All authentication over encrypted connections

2. **Validate Everywhere**: Client and server validation

3. **Fail Securely**: Don't leak information in errors

4. **Limit Attempts**: Rate limiting and account lockout

5. **Short-Lived Tokens**: Minimize exposure window

6. **Secure Storage**: Protect tokens and credentials

7. **Clear Communication**: User-friendly messages

8. **Audit Logging**: Track authentication events

9. **Regular Review**: Update security practices

10. **User Control**: Allow users to manage their security

## Common Pitfalls

### 1. Storing Passwords in Plain Text
**Problem**: Catastrophic if database compromised
**Solution**: Always hash passwords with strong algorithm

### 2. Weak Token Generation
**Problem**: Predictable tokens can be guessed
**Solution**: Use cryptographically secure random generation

### 3. Long Token Lifetimes
**Problem**: Stolen tokens valid for extended period
**Solution**: Short access tokens, refresh token rotation

### 4. Information Leakage
**Problem**: Error messages reveal account existence
**Solution**: Generic messages for authentication failures

### 5. No Rate Limiting
**Problem**: Brute force attacks possible
**Solution**: Implement rate limiting and account lockout

## Success Criteria

Well-designed authentication flows provide:
- Secure user authentication
- Smooth user experience
- Protection against common attacks
- Clear error handling
- Scalable architecture
- Maintainable implementation

---

**Application**: Use this skill when designing authentication systems, planning security architecture, or evaluating authentication approaches for new applications.
