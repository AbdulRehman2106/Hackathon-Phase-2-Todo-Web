# Skill: Handle Errors and Edge Cases

## Purpose
Establish comprehensive error handling patterns for FastAPI applications, ensuring consistent, secure, and informative error responses.

## When to Use
- Designing error handling strategy
- Implementing exception handlers
- Planning edge case coverage
- Reviewing error response patterns

## Instruction

### Error Handling Philosophy

Effective error handling MUST:

1. **Be Consistent**: Same error format across all endpoints
2. **Be Secure**: No sensitive information leakage
3. **Be Informative**: Help clients understand what went wrong
4. **Be Specific**: Different error codes for different issues
5. **Be Logged**: Capture details for debugging

### Error Response Structure

```yaml
standard_error_format:
  structure:
    detail: string  # User-facing message
    code: string    # Machine-readable code (optional)
    errors: array   # Validation error details (optional)

  examples:
    simple_error:
      detail: "Task not found"

    with_code:
      detail: "Task not found"
      code: "RESOURCE_NOT_FOUND"

    validation_error:
      detail: "Validation failed"
      errors:
        - field: "title"
          message: "Title is required"
        - field: "due_date"
          message: "Due date must be in the future"
```

### Error Categories

#### Authentication Errors (401)

```yaml
category: Authentication
status_code: 401
scenarios:
  - name: Missing token
    condition: Authorization header absent
    response:
      detail: "Not authenticated"
    headers:
      WWW-Authenticate: "Bearer"

  - name: Invalid token
    condition: Token signature/format invalid
    response:
      detail: "Could not validate credentials"
    security_note: Same message for format and signature errors

  - name: Expired token
    condition: Token past expiration
    response:
      detail: "Token has expired"
```

#### Authorization Errors (403)

```yaml
category: Authorization
status_code: 403
scenarios:
  - name: Insufficient role
    condition: User lacks required role
    response:
      detail: "Insufficient permissions"

  - name: Resource not allowed
    condition: Action not permitted for user
    response:
      detail: "You don't have permission to perform this action"
```

#### Not Found Errors (404)

```yaml
category: Not Found
status_code: 404
scenarios:
  - name: Resource not found
    condition: Resource ID doesn't exist
    response:
      detail: "Task not found"

  - name: Resource not owned
    condition: Resource exists but belongs to another user
    response:
      detail: "Task not found"
    security_note: Same as not found to prevent enumeration
```

#### Validation Errors (422)

```yaml
category: Validation
status_code: 422
scenarios:
  - name: Invalid input
    condition: Request data fails validation
    response:
      detail: "Validation error"
      errors:
        - loc: ["body", "title"]
          msg: "field required"
          type: "value_error.missing"

  - name: Business rule violation
    condition: Data violates business rules
    response:
      detail: "Cannot complete task: task is already archived"
```

#### Conflict Errors (409)

```yaml
category: Conflict
status_code: 409
scenarios:
  - name: Duplicate resource
    condition: Unique constraint violated
    response:
      detail: "A task with this title already exists"

  - name: State conflict
    condition: Operation invalid for current state
    response:
      detail: "Cannot delete: task has active dependencies"
```

#### Server Errors (500)

```yaml
category: Server Error
status_code: 500
scenarios:
  - name: Unexpected error
    condition: Unhandled exception
    response:
      detail: "An unexpected error occurred"
    logging: Full exception stack trace (never in response)
```

### Exception Design Pattern

```yaml
custom_exceptions:
  base_exception:
    name: AppException
    attributes: [detail, status_code, code]

  derived_exceptions:
    - name: NotFoundError
      status_code: 404
      default_detail: "Resource not found"

    - name: UnauthorizedError
      status_code: 401
      default_detail: "Not authenticated"

    - name: ForbiddenError
      status_code: 403
      default_detail: "Permission denied"

    - name: ValidationError
      status_code: 422
      default_detail: "Validation failed"

    - name: ConflictError
      status_code: 409
      default_detail: "Resource conflict"
```

### Edge Cases to Handle

#### Input Edge Cases

```yaml
string_inputs:
  - empty_string: Treat as null or reject based on requirement
  - whitespace_only: Trim and validate
  - unicode: Handle properly (emoji, special chars)
  - very_long: Enforce max length
  - html_script: Sanitize to prevent XSS

numeric_inputs:
  - negative: Validate if negative allowed
  - zero: Validate if zero allowed
  - very_large: Enforce max value
  - decimal_precision: Handle rounding consistently

date_inputs:
  - past_date: Allow or reject based on requirement
  - far_future: Consider max date
  - timezone: Handle consistently (UTC preferred)

array_inputs:
  - empty_array: Allow or require at least one
  - too_many_items: Enforce max count
  - duplicate_items: Handle based on requirement
```

#### State Edge Cases

```yaml
resource_states:
  - already_deleted: Return 404
  - already_completed: Return conflict or allow
  - belongs_to_other_user: Return 404 (not 403)
  - being_modified_concurrently: Handle optimistic locking

relationship_states:
  - parent_deleted: Cascade or orphan handling
  - circular_reference: Prevent or detect
  - missing_required_relation: Validate before save
```

#### Timing Edge Cases

```yaml
concurrent_operations:
  - simultaneous_updates: Last write wins or conflict
  - create_same_unique: Return conflict for second
  - delete_while_reading: Handle gracefully

token_timing:
  - expired_during_request: Handle at validation
  - refreshed_mid-operation: Complete current request
```

### Error Handling Patterns

#### Service Layer Error Handling

```yaml
pattern: Services raise domain exceptions
benefits:
  - Clean separation from HTTP concerns
  - Testable without HTTP context
  - Reusable across different interfaces

design:
  service_raises: DomainException (TaskNotFoundError)
  router_catches: Convert to HTTPException
  alternative: Let exception handler handle domain exceptions
```

#### Global Exception Handler

```yaml
pattern: Centralized exception handling
location: main.py or dedicated exception_handlers.py

handlers:
  - AppException → Return formatted error
  - ValidationError → Return 422 with field errors
  - SQLAlchemyError → Log and return 500
  - Exception → Log and return generic 500
```

### Logging Requirements

```yaml
logging_rules:
  always_log:
    - Request ID/correlation ID
    - User ID (if authenticated)
    - Endpoint called
    - Error type
    - Timestamp

  for_server_errors:
    - Full stack trace
    - Request body (sanitized)
    - Database query (if applicable)

  never_log:
    - Passwords
    - Tokens
    - Personal identifiable information
    - Credit card numbers
```

### Error Handling Checklist

#### Per Endpoint
- [ ] Invalid input handled (422)
- [ ] Resource not found handled (404)
- [ ] Unauthorized access handled (401/403)
- [ ] Business rule violations handled
- [ ] Unexpected errors don't expose internals

#### Application Wide
- [ ] Consistent error format
- [ ] Global exception handlers configured
- [ ] Logging configured for errors
- [ ] Sensitive data not exposed
- [ ] CORS errors handled properly

#### Testing
- [ ] Each error condition has test
- [ ] Edge cases tested
- [ ] Error format verified
- [ ] Status codes verified

## Output Format
Error handling design patterns and specifications suitable for backend implementation planning.

## Related Skills
- implement-fastapi-from-specs
- apply-auth-middleware
- spec-first-backend-development
