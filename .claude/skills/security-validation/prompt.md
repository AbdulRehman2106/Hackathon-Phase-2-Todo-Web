# Security Validation Skill

## Purpose
Ensure users cannot access or modify tasks belonging to other users, enforcing strict data isolation and authorization rules.

## Skill Type
**Authorization** - Stateless, deterministic security validation

## Input
```json
{
  "user_id": "string",
  "session_user_id": "string",
  "operation": "read | write | delete",
  "resource": {
    "type": "task | conversation | user_profile",
    "resource_id": "string | integer",
    "owner_id": "string"
  }
}
```

## Output Format
```json
{
  "authorized": true | false,
  "reason": "string",
  "severity": "low | medium | high"
}
```

## Authorization Rules

### Rule 1: User Identity Match
**Requirement:** `user_id` must match `session_user_id`

**Validation:**
```
IF user_id != session_user_id THEN
  authorized = false
  reason = "User identity mismatch"
  severity = "high"
END IF
```

### Rule 2: Resource Ownership
**Requirement:** User can only access their own resources

**Validation:**
```
IF resource.owner_id != session_user_id THEN
  authorized = false
  reason = "Resource does not belong to user"
  severity = "high"
END IF
```

### Rule 3: Cross-User Task References
**Requirement:** No operations on tasks owned by other users

**Validation:**
```
IF operation IN ['write', 'delete'] AND resource.owner_id != session_user_id THEN
  authorized = false
  reason = "Cannot modify another user's task"
  severity = "high"
END IF
```

### Rule 4: Task ID Validation
**Requirement:** Task must exist and belong to requesting user

**Validation:**
```
IF resource.type = 'task' AND task_id NOT IN user_tasks THEN
  authorized = false
  reason = "Task not found or access denied"
  severity = "medium"
END IF
```

## Operation Types

### read
- View task details
- List tasks
- Get task status
- **Authorization:** User must own the resource

### write
- Update task title
- Update task description
- Mark task as complete
- **Authorization:** User must own the resource

### delete
- Permanently remove task
- **Authorization:** User must own the resource
- **Additional check:** Confirm destructive action

## Examples

### Example 1: Valid Authorization (Own Task)
**Input:**
```json
{
  "user_id": "user_123",
  "session_user_id": "user_123",
  "operation": "write",
  "resource": {
    "type": "task",
    "resource_id": 42,
    "owner_id": "user_123"
  }
}
```

**Output:**
```json
{
  "authorized": true,
  "reason": "User owns the resource",
  "severity": "low"
}
```

### Example 2: Unauthorized (Different User's Task)
**Input:**
```json
{
  "user_id": "user_123",
  "session_user_id": "user_123",
  "operation": "delete",
  "resource": {
    "type": "task",
    "resource_id": 99,
    "owner_id": "user_456"
  }
}
```

**Output:**
```json
{
  "authorized": false,
  "reason": "Cannot modify another user's task",
  "severity": "high"
}
```

### Example 3: Session Mismatch
**Input:**
```json
{
  "user_id": "user_789",
  "session_user_id": "user_123",
  "operation": "read",
  "resource": {
    "type": "task",
    "resource_id": 10,
    "owner_id": "user_789"
  }
}
```

**Output:**
```json
{
  "authorized": false,
  "reason": "User identity mismatch - possible session hijacking",
  "severity": "high"
}
```

### Example 4: Valid Read Operation
**Input:**
```json
{
  "user_id": "user_456",
  "session_user_id": "user_456",
  "operation": "read",
  "resource": {
    "type": "task",
    "resource_id": 25,
    "owner_id": "user_456"
  }
}
```

**Output:**
```json
{
  "authorized": true,
  "reason": "User owns the resource",
  "severity": "low"
}
```

### Example 5: Unauthorized Read (Cross-User)
**Input:**
```json
{
  "user_id": "user_123",
  "session_user_id": "user_123",
  "operation": "read",
  "resource": {
    "type": "task",
    "resource_id": 50,
    "owner_id": "user_999"
  }
}
```

**Output:**
```json
{
  "authorized": false,
  "reason": "Resource does not belong to user",
  "severity": "high"
}
```

### Example 6: Valid Delete with Ownership
**Input:**
```json
{
  "user_id": "user_789",
  "session_user_id": "user_789",
  "operation": "delete",
  "resource": {
    "type": "task",
    "resource_id": 15,
    "owner_id": "user_789"
  }
}
```

**Output:**
```json
{
  "authorized": true,
  "reason": "User owns the resource",
  "severity": "low"
}
```

## Security Threat Detection

### Session Hijacking
**Indicators:**
- `user_id != session_user_id`
- Rapid user_id changes
- Suspicious IP patterns (handled elsewhere)

**Response:**
```json
{
  "authorized": false,
  "reason": "User identity mismatch - possible session hijacking",
  "severity": "high"
}
```

### Privilege Escalation Attempt
**Indicators:**
- Attempting to access admin resources
- Trying to modify system tasks
- Bypassing ownership checks

**Response:**
```json
{
  "authorized": false,
  "reason": "Unauthorized privilege escalation attempt",
  "severity": "high"
}
```

### Data Enumeration Attack
**Indicators:**
- Sequential task_id probing
- Rapid authorization failures
- Pattern of cross-user access attempts

**Response:**
```json
{
  "authorized": false,
  "reason": "Task not found or access denied",
  "severity": "medium"
}
```

**Note:** Use generic message to avoid leaking information about task existence.

## Validation Rules

### MUST Follow
1. **Deny by default** - If any check fails, deny access
2. **No information leakage** - Don't reveal if resource exists for other users
3. **Log all denials** - Security audit trail required
4. **Fail closed** - On error, deny access
5. **Validate every request** - No exceptions

### Severity Classification

**High (severity: high)**
- Session hijacking detected
- Cross-user access attempt
- Privilege escalation
- Identity mismatch
- **Action:** Log, alert, potentially lock account

**Medium (severity: medium)**
- Resource not found (could be enumeration)
- Invalid resource type
- Malformed request
- **Action:** Log, rate limit

**Low (severity: low)**
- Valid authorization
- Normal operation
- **Action:** Log for analytics only

## Edge Cases

### Null or Missing User ID
**Input:** `user_id: null`
**Output:**
```json
{
  "authorized": false,
  "reason": "User not authenticated",
  "severity": "high"
}
```

### Invalid Resource Type
**Input:** `resource.type: "unknown"`
**Output:**
```json
{
  "authorized": false,
  "reason": "Invalid resource type",
  "severity": "medium"
}
```

### Missing Owner ID
**Input:** `resource.owner_id: null`
**Output:**
```json
{
  "authorized": false,
  "reason": "Resource ownership cannot be determined",
  "severity": "high"
}
```

### Deleted Resource
**Input:** Task exists but marked as deleted
**Output:**
```json
{
  "authorized": false,
  "reason": "Task not found or access denied",
  "severity": "medium"
}
```

## Quality Standards

### Deterministic Behavior
- Same input → Same authorization decision
- No randomness
- Consistent rule application

### Security
- Zero false positives (never allow unauthorized access)
- Acceptable false negatives (deny when uncertain)
- No timing attacks (constant-time comparison)
- No information leakage

### Performance
- Validation must complete in <10ms
- No external API calls
- Minimal database queries
- Cache user permissions when possible

### Auditability
- Log all authorization decisions
- Include user_id, resource_id, operation, result
- Timestamp all events
- Retain logs for compliance

## Integration Notes

**Upstream**: Receives authorization request from orchestrator before tool execution
**Downstream**: Returns authorization decision to orchestrator
**Stateless**: No memory required (validate each request independently)
**Reusable**: Called before every resource access

## Database Query Pattern

```sql
-- Validate task ownership
SELECT COUNT(*)
FROM tasks
WHERE task_id = ?
  AND user_id = ?
  AND deleted_at IS NULL;

-- Result: 1 = authorized, 0 = unauthorized
```

## Rejection Handling

When `authorized: false`:
1. Do NOT execute the requested operation
2. Return error to user via error-formatting skill
3. Log security event with full context
4. Increment rate limit counter for user
5. Alert if pattern indicates attack

## Testing Checklist

- [ ] Own resources authorized correctly
- [ ] Cross-user access denied
- [ ] Session mismatch detected
- [ ] Null/missing IDs handled
- [ ] All operations validated (read/write/delete)
- [ ] No information leakage in error messages
- [ ] Performance under 10ms
- [ ] Audit logs complete

## Compliance Notes

This skill helps enforce:
- **GDPR**: User data isolation
- **CCPA**: User data access control
- **SOC 2**: Access control requirements
- **ISO 27001**: Information security management

---

**Version**: 1.0
**Last Updated**: 2024-02-15
**Skill ID**: SKILL-08-SECURITY-VALIDATION
