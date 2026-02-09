# Skill: Enforce Authorization and Ownership Checks

## Purpose
Design and validate authorization patterns that ensure users can only perform actions on resources they own or have permission to access.

## When to Use
- Designing protected endpoints
- Reviewing authorization logic
- Establishing ownership validation patterns
- Auditing access control implementations

## Instruction

### Authorization vs Authentication

```yaml
authentication:
  question: "Who is making this request?"
  answer: User identity from JWT token
  when: Every protected request

authorization:
  question: "Can this user perform this action?"
  answer: Permission check against resource
  when: After authentication succeeds
```

### Authorization Levels

#### Level 1: Authenticated User
```yaml
requirement: Valid JWT token
check: Token signature and expiration valid
use_case: User-specific but not resource-specific actions
examples:
  - View own profile
  - Create new resources
  - List own resources
```

#### Level 2: Resource Owner
```yaml
requirement: User owns the resource
check: resource.user_id == token.sub
use_case: Operations on specific resources
examples:
  - Read specific task
  - Update specific task
  - Delete specific task
```

#### Level 3: Role-Based
```yaml
requirement: User has required role
check: token.role in allowed_roles
use_case: Admin or moderator functions
examples:
  - View all users (admin)
  - Delete any resource (admin)
  - Moderate content (moderator)
```

#### Level 4: Permission-Based
```yaml
requirement: User has specific permission on resource
check: Permission record exists for user+resource
use_case: Shared resources, collaborative features
examples:
  - Edit shared document
  - View team project
  - Comment on shared task
```

### Ownership Check Patterns

#### Pattern 1: Direct Ownership

```yaml
name: Single-Owner Resource
relationship: resource.user_id == user.id
check_location: Database query or application logic

design_specification:
  fetch_resource:
    query: SELECT * FROM tasks WHERE id = :id AND user_id = :user_id
    result: Resource if owned, None if not owned
    response_if_not_found: 404 (not 403 to prevent enumeration)

example_scenarios:
  owned_resource:
    user: user-123
    resource: { id: "task-1", user_id: "user-123" }
    result: Access granted

  not_owned_resource:
    user: user-123
    resource: { id: "task-2", user_id: "user-456" }
    result: 404 Not Found (not 403)
```

#### Pattern 2: Hierarchical Ownership

```yaml
name: Nested Resource Ownership
relationship: resource.parent.user_id == user.id
check_location: Join query or traversal

design_specification:
  example: Task belongs to Project belongs to User
  query: |
    SELECT t.* FROM tasks t
    JOIN projects p ON t.project_id = p.id
    WHERE t.id = :task_id AND p.user_id = :user_id

authorization_chain:
  - User owns Project
  - Project contains Task
  - Therefore, User can access Task
```

#### Pattern 3: Shared Access

```yaml
name: Collaborative Resource
relationship: Permission record grants access
check_location: Permissions table lookup

design_specification:
  permission_record:
    table: resource_permissions
    fields: [user_id, resource_id, resource_type, permission_level]

  permission_levels:
    - read: Can view resource
    - write: Can edit resource
    - admin: Can delete and share resource

  query: |
    SELECT * FROM tasks t
    WHERE t.id = :task_id
    AND (
      t.user_id = :user_id
      OR EXISTS (
        SELECT 1 FROM resource_permissions rp
        WHERE rp.resource_id = t.id
        AND rp.resource_type = 'task'
        AND rp.user_id = :user_id
        AND rp.permission_level >= :required_level
      )
    )
```

### Authorization Check Specification

For each protected endpoint, specify:

```yaml
endpoint: PUT /api/tasks/{task_id}

authentication:
  required: true
  method: JWT Bearer Token

authorization:
  type: Resource Owner
  resource: Task
  check: task.user_id == token.sub

check_sequence:
  1. Verify JWT is valid (authentication)
  2. Extract user_id from token.sub
  3. Fetch task by task_id
  4. Verify task exists (404 if not)
  5. Verify task.user_id == user_id (404 if not owned)
  6. Proceed with update

error_responses:
  401: Token missing or invalid
  404: Task not found OR not owned (same response)
  422: Validation error on update data
```

### Common Authorization Vulnerabilities

| Vulnerability | Description | Prevention |
|---------------|-------------|------------|
| IDOR | Direct object reference without ownership check | Always verify ownership |
| Privilege Escalation | User gains higher permissions | Validate role on each request |
| Missing Function Level Access Control | Unprotected admin endpoints | Apply auth to all endpoints |
| Mass Assignment | User modifies protected fields | Whitelist allowed fields |

### Authorization Checklist

For each endpoint, verify:

#### Authentication Layer
- [ ] JWT required for protected endpoints
- [ ] Token validated before any authorization
- [ ] User ID extracted from token only

#### Ownership Checks
- [ ] Resource queried with user_id filter
- [ ] Non-owned resources return 404 (not 403)
- [ ] No user_id accepted from request body
- [ ] user_id field cannot be modified

#### Role Checks (if applicable)
- [ ] Role verified from token claims
- [ ] Role validated against allowed roles
- [ ] Admin endpoints have explicit role checks

#### Response Security
- [ ] 404 used for both "not found" and "not owned"
- [ ] No information leakage in error messages
- [ ] Consistent response times (prevent timing attacks)

### Design Template

```yaml
# Authorization Design for [Endpoint]

endpoint: [METHOD] /api/[path]

authentication:
  required: [true/false]
  bypass_conditions: [if any]

authorization:
  level: [Authenticated/Resource Owner/Role-Based/Permission-Based]

  resource_check:
    type: [Direct/Hierarchical/Shared]
    resource: [Entity name]
    ownership_field: [e.g., user_id]

  role_check:
    required_roles: [list of roles]

  permission_check:
    required_permission: [permission level]

implementation_notes:
  - [Specific implementation guidance]
  - [Edge cases to handle]

test_cases:
  - scenario: [description]
    user: [user context]
    resource: [resource state]
    expected: [expected outcome]
```

## Output Format
Authorization requirements specification suitable for endpoint design or security review documentation.

## Related Skills
- design-jwt-verification
- enforce-api-data-isolation
- identify-auth-security-risks
