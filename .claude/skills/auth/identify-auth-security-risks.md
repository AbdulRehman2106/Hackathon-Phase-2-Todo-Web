# Skill: Identify Common Authentication Security Risks

## Purpose
Recognize and document common authentication and authorization security vulnerabilities to ensure they are addressed in system design.

## When to Use
- Reviewing authentication designs
- Conducting security assessments
- Creating security requirements
- Training team on security awareness

## Instruction

### Risk Categories

Authentication security risks fall into these categories:

1. **Credential Handling**: How passwords and secrets are managed
2. **Token Security**: JWT and session token vulnerabilities
3. **Authorization Flaws**: Access control weaknesses
4. **Session Management**: Session lifecycle issues
5. **Implementation Errors**: Common coding mistakes

### Critical Security Risks

#### Risk 1: Broken Authentication (OWASP A07:2021)

```yaml
risk_name: Broken Authentication
severity: Critical
description: |
  Permits attackers to compromise passwords, keys, or session tokens,
  or exploit implementation flaws to assume other users' identities.

indicators:
  - Weak password policies
  - No brute force protection
  - Credential stuffing vulnerability
  - Session fixation possible

detection_questions:
  - Are there rate limits on login attempts?
  - Is password complexity enforced?
  - Are credentials stored securely (bcrypt/argon2)?
  - Is session regenerated on login?

mitigation_requirements:
  - Implement account lockout or exponential backoff
  - Enforce strong password policy
  - Use secure password hashing
  - Regenerate session on authentication state change
```

#### Risk 2: Insecure JWT Implementation

```yaml
risk_name: Insecure JWT Implementation
severity: High
description: |
  Flaws in JWT handling that allow token forgery,
  replay attacks, or information disclosure.

specific_vulnerabilities:

  algorithm_confusion:
    description: Accepting "alg: none" or switching algorithms
    impact: Complete authentication bypass
    requirement: Enforce expected algorithm, reject "none"

  weak_secret:
    description: Using guessable or short JWT secrets
    impact: Signature forgery possible
    requirement: Minimum 256-bit random secret

  sensitive_data_in_payload:
    description: Including passwords, PII in token
    impact: Information disclosure (JWT payload is base64, not encrypted)
    requirement: Only include non-sensitive identifiers

  no_expiration:
    description: Tokens without expiration claim
    impact: Stolen tokens valid forever
    requirement: Always include "exp" claim, short lifetime

  token_in_url:
    description: Passing JWT in query parameters
    impact: Logged in server logs, browser history, referrer headers
    requirement: Only transmit in Authorization header or httpOnly cookie

detection_questions:
  - Is the algorithm enforced server-side?
  - How long is the JWT secret?
  - What claims are in the payload?
  - What is the token expiration time?
  - How is the token transmitted?
```

#### Risk 3: Broken Access Control (OWASP A01:2021)

```yaml
risk_name: Broken Access Control
severity: Critical
description: |
  Users can access resources or perform actions outside
  their intended permissions.

specific_vulnerabilities:

  idor:
    name: Insecure Direct Object Reference
    description: Accessing other users' resources by changing IDs
    example: GET /api/tasks/123 returns any user's task
    requirement: Verify ownership before returning resource

  privilege_escalation:
    name: Vertical Privilege Escalation
    description: Regular user accessing admin functions
    example: Regular user accessing /admin/users
    requirement: Role check on every admin endpoint

  missing_function_level_access_control:
    name: Missing Function Level Access Control
    description: Sensitive operations without authorization
    example: DELETE /api/users/{id} without admin check
    requirement: Authorization check on all sensitive endpoints

  mass_assignment:
    name: Mass Assignment
    description: Modifying protected fields through API
    example: PATCH { "role": "admin" } elevates privileges
    requirement: Whitelist allowed fields for update

detection_questions:
  - Can I access another user's data by changing the ID?
  - Are admin endpoints protected?
  - What fields can be modified through the API?
  - Is ownership verified before mutation?
```

#### Risk 4: Session Security Issues

```yaml
risk_name: Session Security Issues
severity: High
description: |
  Vulnerabilities in how user sessions are created,
  maintained, and terminated.

specific_vulnerabilities:

  session_fixation:
    description: Attacker sets session ID before victim logs in
    requirement: Regenerate session ID on authentication

  session_hijacking:
    description: Attacker steals valid session token
    requirements:
      - Use httpOnly cookies
      - Use secure flag
      - Implement proper HTTPS

  insecure_token_storage:
    description: Storing tokens in vulnerable locations
    bad: localStorage (XSS vulnerable)
    good: httpOnly cookies, memory

  no_session_invalidation:
    description: Tokens remain valid after logout
    requirement: Implement token revocation or short expiry

  concurrent_sessions:
    description: Unlimited sessions per user
    risk: Compromised credentials go undetected
    consideration: Limit concurrent sessions or notify on new login

detection_questions:
  - Where is the token stored client-side?
  - What happens to the token on logout?
  - Is the token transmitted securely?
  - Can users see their active sessions?
```

#### Risk 5: Credential Storage Vulnerabilities

```yaml
risk_name: Credential Storage Vulnerabilities
severity: Critical
description: |
  Improper storage of passwords and secrets enabling
  credential theft.

specific_vulnerabilities:

  plaintext_passwords:
    description: Storing passwords without hashing
    impact: Database breach exposes all passwords
    requirement: Use bcrypt or argon2 for password hashing

  weak_hashing:
    description: Using MD5, SHA1, or unsalted hashes
    impact: Rainbow table and brute force attacks
    requirement: Use bcrypt with work factor ≥ 10

  secrets_in_code:
    description: Hardcoded credentials in source code
    impact: Secrets exposed in version control
    requirement: Environment variables, secret managers

  secrets_in_logs:
    description: Logging credentials or tokens
    impact: Secrets exposed in log aggregation
    requirement: Scrub sensitive data from logs

detection_questions:
  - What hashing algorithm is used for passwords?
  - Are secrets in environment variables?
  - Is logging filtering sensitive data?
  - Are database backups encrypted?
```

### Security Risk Assessment Template

```yaml
# Security Risk Assessment for [Feature/System]

assessment_date: [YYYY-MM-DD]
assessor: [Name/Team]

risks_identified:

  - risk_id: [R001]
    category: [Category]
    name: [Risk Name]
    severity: [Critical/High/Medium/Low]
    likelihood: [High/Medium/Low]
    description: |
      [Detailed description of the risk]
    affected_components:
      - [Component 1]
      - [Component 2]
    mitigation_status: [Open/In Progress/Mitigated]
    mitigation_requirements:
      - [Requirement 1]
      - [Requirement 2]
    verification_method: |
      [How to verify mitigation is effective]

recommendations:
  immediate:
    - [Action items for critical/high risks]
  short_term:
    - [Action items for medium risks]
  long_term:
    - [Action items for low risks or improvements]
```

### Security Checklist

#### Authentication
- [ ] Strong password policy enforced
- [ ] Passwords hashed with bcrypt/argon2
- [ ] Rate limiting on authentication endpoints
- [ ] Account lockout after failed attempts
- [ ] Multi-factor authentication available

#### JWT/Tokens
- [ ] Strong secret (≥256 bits)
- [ ] Short expiration time
- [ ] Algorithm enforced server-side
- [ ] No sensitive data in payload
- [ ] Secure transmission only

#### Authorization
- [ ] Ownership verified on all resource access
- [ ] Role checks on privileged endpoints
- [ ] No IDOR vulnerabilities
- [ ] Mass assignment prevented

#### Session Management
- [ ] Secure token storage
- [ ] Proper logout implementation
- [ ] Session timeout configured
- [ ] HTTPS enforced

## Output Format
Security risk assessment document suitable for security review or compliance documentation.

## Related Skills
- design-jwt-verification
- enforce-authorization-checks
- secure-secrets-handling
