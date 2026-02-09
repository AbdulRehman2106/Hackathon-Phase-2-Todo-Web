# Skill: Review Authentication and Authorization Behavior

## Purpose
Validate that authentication and authorization mechanisms are correctly implemented, ensuring security requirements are met.

## When to Use
- After implementing authentication features
- During security review phases
- When validating protected endpoints
- Before security-focused releases

## Instruction

### Auth Review Framework

```yaml
review_dimensions:
  authentication:
    question: "Is the user who they claim to be?"
    validates: Token validation, session management

  authorization:
    question: "Can this user perform this action?"
    validates: Permission checks, ownership verification

  data_isolation:
    question: "Can users only access their own data?"
    validates: Query scoping, ownership filters
```

### Authentication Review Checklist

#### Token Handling

```yaml
token_validation:
  presence_check:
    - [ ] Missing token returns 401
    - [ ] Malformed Authorization header returns 401
    - [ ] "Bearer " prefix required

  signature_validation:
    - [ ] Invalid signature returns 401
    - [ ] Token cannot be modified
    - [ ] Algorithm is enforced (no "none")

  expiration_validation:
    - [ ] Expired token returns 401
    - [ ] Expiration is checked on every request
    - [ ] Clock skew handled appropriately

  claims_validation:
    - [ ] Required claims are present (sub, exp)
    - [ ] Claims used correctly in handlers
    - [ ] No sensitive data in payload
```

#### Session Security

```yaml
session_management:
  token_storage:
    - [ ] Tokens stored securely (httpOnly cookies or secure storage)
    - [ ] No tokens in localStorage (XSS risk)
    - [ ] No tokens in URL parameters

  logout:
    - [ ] Logout clears client tokens
    - [ ] Session invalidation (if server-side)

  token_refresh:
    - [ ] Refresh mechanism exists
    - [ ] Refresh tokens handled securely
    - [ ] Old tokens invalidated on refresh
```

### Authorization Review Checklist

#### Endpoint Protection

```yaml
for_each_protected_endpoint:
  authentication_required:
    - [ ] Endpoint requires authentication
    - [ ] No access without valid token
    - [ ] Returns 401 when unauthenticated

  authorization_check:
    - [ ] User can only access their resources
    - [ ] Returns 404 for non-owned resources (not 403)
    - [ ] Query filters by user_id from token
```

#### Ownership Verification

```yaml
ownership_checks:
  create_operations:
    - [ ] Resource created with user_id from token
    - [ ] Cannot create resource as another user
    - [ ] user_id in request body is ignored

  read_operations:
    - [ ] Query filters by user_id
    - [ ] Non-owned resources return 404
    - [ ] List endpoints only return user's items

  update_operations:
    - [ ] Ownership verified before update
    - [ ] Cannot update non-owned resources
    - [ ] Cannot change user_id field

  delete_operations:
    - [ ] Ownership verified before delete
    - [ ] Cannot delete non-owned resources
```

#### Role-Based Access (if applicable)

```yaml
role_checks:
  admin_endpoints:
    - [ ] Only admins can access
    - [ ] Non-admins receive 403
    - [ ] Role extracted from token, not request

  role_elevation:
    - [ ] Cannot self-promote role
    - [ ] Role changes require authorization
```

### Test Scenarios

#### Authentication Tests

```yaml
authentication_scenarios:

  no_token:
    description: Request without Authorization header
    endpoint: GET /api/tasks
    expected: 401 Unauthorized

  invalid_token:
    description: Request with garbage token
    endpoint: GET /api/tasks
    headers: "Authorization: Bearer garbage"
    expected: 401 Unauthorized

  expired_token:
    description: Request with expired token
    endpoint: GET /api/tasks
    token: Expired JWT
    expected: 401 Token expired

  wrong_signature:
    description: Token signed with wrong secret
    endpoint: GET /api/tasks
    token: JWT signed with wrong key
    expected: 401 Invalid token

  valid_token:
    description: Request with valid token
    endpoint: GET /api/tasks
    token: Valid JWT
    expected: 200 Success
```

#### Authorization Tests

```yaml
authorization_scenarios:

  access_own_resource:
    description: User accesses their own task
    setup: User A creates task 1
    request: User A GET /api/tasks/1
    expected: 200 with task data

  access_other_resource:
    description: User tries to access another user's task
    setup: User A creates task 1
    request: User B GET /api/tasks/1
    expected: 404 Not Found (not 403)

  update_own_resource:
    description: User updates their own task
    setup: User A creates task 1
    request: User A PUT /api/tasks/1
    expected: 200 Success

  update_other_resource:
    description: User tries to update another user's task
    setup: User A creates task 1
    request: User B PUT /api/tasks/1
    expected: 404 Not Found

  delete_own_resource:
    description: User deletes their own task
    setup: User A creates task 1
    request: User A DELETE /api/tasks/1
    expected: 204 No Content

  delete_other_resource:
    description: User tries to delete another user's task
    setup: User A creates task 1
    request: User B DELETE /api/tasks/1
    expected: 404 Not Found

  create_as_other_user:
    description: User tries to create resource as another user
    request: User A POST /api/tasks with { user_id: "user_b_id" }
    expected: Resource created with User A's id (body user_id ignored)

  list_isolation:
    description: User only sees their resources in list
    setup: User A has 3 tasks, User B has 2 tasks
    request: User A GET /api/tasks
    expected: Only User A's 3 tasks returned
```

### Security Review Report Format

```markdown
# Authentication & Authorization Review

## Feature: [Feature Name]
## Review Date: [Date]
## Reviewer: [Name/Agent]

## Summary
- **Overall Status**: [PASS/FAIL]
- **Critical Issues**: [N]
- **Warnings**: [N]

## Authentication Review

### Token Handling
| Check | Status | Notes |
|-------|--------|-------|
| Missing token returns 401 | ✅ | |
| Expired token returns 401 | ✅ | |
| Invalid signature returns 401 | ❌ | Returns 500 instead |
| Algorithm enforced | ✅ | |

### Session Security
| Check | Status | Notes |
|-------|--------|-------|
| Secure token storage | ⚠️ | Consider httpOnly |
| Logout clears tokens | ✅ | |

## Authorization Review

### Endpoint Protection
| Endpoint | Auth Required | Ownership Check | Status |
|----------|---------------|-----------------|--------|
| GET /tasks | ✅ | ✅ | PASS |
| POST /tasks | ✅ | N/A | PASS |
| GET /tasks/{id} | ✅ | ❌ | FAIL |
| PUT /tasks/{id} | ✅ | ✅ | PASS |
| DELETE /tasks/{id} | ✅ | ✅ | PASS |

### Test Results
| Scenario | Expected | Actual | Status |
|----------|----------|--------|--------|
| Access own resource | 200 | 200 | ✅ |
| Access other's resource | 404 | 200 | ❌ |
| List isolation | Own only | All tasks | ❌ |

## Critical Issues

### ISSUE-001: Missing Ownership Check on GET /tasks/{id}
- **Severity**: Critical
- **Description**: Any authenticated user can access any task by ID
- **Impact**: Data leakage across users
- **Recommendation**: Add user_id filter to query

### ISSUE-002: Missing Query Filter on GET /tasks
- **Severity**: Critical
- **Description**: List returns all tasks, not just user's
- **Impact**: Complete data exposure
- **Recommendation**: Filter by user_id from token

## Warnings

### WARN-001: Token Storage
- **Description**: Token stored in localStorage
- **Risk**: XSS vulnerability could steal tokens
- **Recommendation**: Consider httpOnly cookies

## Recommendations
1. Add ownership checks to all single-resource endpoints
2. Add user_id filter to all list endpoints
3. Review token storage strategy
4. Add integration tests for all auth scenarios
```

### Review Automation Support

```yaml
automated_tests:
  authentication:
    - Test each endpoint without token
    - Test each endpoint with invalid token
    - Test each endpoint with expired token
    - Verify 401 responses

  authorization:
    - Create test user pair (User A, User B)
    - Have User A create resources
    - Test User B accessing User A's resources
    - Verify 404 responses for cross-user access

  data_isolation:
    - Have both users create resources
    - Verify list endpoints filter correctly
    - Verify no cross-user data in any response
```

## Output Format
Authentication and authorization review report suitable for security documentation and compliance.

## Related Skills
- validate-implementation-against-spec
- detect-spec-violations
- identify-auth-security-risks
