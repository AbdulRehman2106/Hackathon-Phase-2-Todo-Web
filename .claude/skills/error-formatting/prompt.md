# Error Formatting Skill

## Purpose
Convert backend errors, MCP tool failures, and system exceptions into safe, user-friendly error messages.

## Skill Type
**Error Translation** - Stateless, deterministic error message generation

## Input
```json
{
  "error_type": "string",
  "error_context": {
    "tool_name": "string | null",
    "original_error": "string",
    "status_code": "integer | null"
  },
  "user_message": "string"
}
```

## Output Format
```json
{
  "user_message": "string",
  "severity": "low | medium | high",
  "suggested_action": "string",
  "show_details": false
}
```

## Error Type Categories

### 1. Validation Errors (severity: low)
**Causes:**
- Missing required fields
- Invalid data format
- Out of range values

**User Message Template:**
"[Field] is required/invalid. Please provide [expected format]."

### 2. Not Found Errors (severity: low)
**Causes:**
- Task ID doesn't exist
- User not found
- Resource missing

**User Message Template:**
"Task not found. Please check the task ID and try again."

### 3. Authorization Errors (severity: medium)
**Causes:**
- User not authenticated
- Insufficient permissions
- Token expired

**User Message Template:**
"You don't have permission to perform this action. Please log in again."

### 4. Database Errors (severity: high)
**Causes:**
- Connection timeout
- Query failure
- Constraint violation

**User Message Template:**
"We're experiencing technical difficulties. Please try again in a moment."

### 5. MCP Tool Errors (severity: medium)
**Causes:**
- Tool execution failure
- Invalid parameters
- Tool not available

**User Message Template:**
"Unable to complete your request. Please try rephrasing or contact support."

### 6. Rate Limit Errors (severity: low)
**Causes:**
- Too many requests
- Quota exceeded

**User Message Template:**
"You're making requests too quickly. Please wait a moment and try again."

## Error Formatting Rules

### MUST Follow
1. **Never expose stack traces** - No technical details to users
2. **Never expose SQL queries** - Security risk
3. **Never expose internal paths** - No file system details
4. **Never expose API keys/tokens** - Security critical
5. **Provide corrective action** - Tell user what to do next
6. **Professional tone** - Calm and helpful
7. **No blame language** - Don't say "you did X wrong"

### Severity Levels

**Low (severity: low)**
- User can fix immediately
- No data loss
- Service still functional
- Examples: validation errors, not found

**Medium (severity: medium)**
- Requires user action (re-auth, retry)
- Temporary service disruption
- No data loss
- Examples: auth errors, tool failures

**High (severity: high)**
- System-level issue
- User cannot fix
- Potential data loss
- Requires admin intervention
- Examples: database errors, critical failures

## Examples

### Example 1: Missing Required Field
**Input:**
```json
{
  "error_type": "validation_error",
  "error_context": {
    "tool_name": "add_task",
    "original_error": "ValidationError: title is required",
    "status_code": 400
  },
  "user_message": "Add a task"
}
```

**Output:**
```json
{
  "user_message": "Task title is required. Please provide a title for your task.",
  "severity": "low",
  "suggested_action": "Try: 'Add a task to buy groceries'",
  "show_details": false
}
```

### Example 2: Task Not Found
**Input:**
```json
{
  "error_type": "not_found",
  "error_context": {
    "tool_name": "complete_task",
    "original_error": "Task with ID 999 not found",
    "status_code": 404
  },
  "user_message": "Complete task 999"
}
```

**Output:**
```json
{
  "user_message": "Task not found. Please check the task ID and try again.",
  "severity": "low",
  "suggested_action": "Use 'list tasks' to see available tasks",
  "show_details": false
}
```

### Example 3: Authentication Error
**Input:**
```json
{
  "error_type": "auth_error",
  "error_context": {
    "tool_name": "list_tasks",
    "original_error": "JWT token expired at 2024-02-15T10:30:00Z",
    "status_code": 401
  },
  "user_message": "Show my tasks"
}
```

**Output:**
```json
{
  "user_message": "Your session has expired. Please log in again to continue.",
  "severity": "medium",
  "suggested_action": "Log in to access your tasks",
  "show_details": false
}
```

### Example 4: Database Connection Error
**Input:**
```json
{
  "error_type": "database_error",
  "error_context": {
    "tool_name": "add_task",
    "original_error": "psycopg2.OperationalError: could not connect to server",
    "status_code": 500
  },
  "user_message": "Add task to buy milk"
}
```

**Output:**
```json
{
  "user_message": "We're experiencing technical difficulties. Please try again in a moment.",
  "severity": "high",
  "suggested_action": "If the problem persists, contact support",
  "show_details": false
}
```

### Example 5: Invalid Task ID Format
**Input:**
```json
{
  "error_type": "validation_error",
  "error_context": {
    "tool_name": "complete_task",
    "original_error": "ValueError: invalid literal for int() with base 10: 'abc'",
    "status_code": 400
  },
  "user_message": "Complete task abc"
}
```

**Output:**
```json
{
  "user_message": "Task ID must be a number. Please provide a valid task ID.",
  "severity": "low",
  "suggested_action": "Try: 'Complete task 5'",
  "show_details": false
}
```

### Example 6: Rate Limit Exceeded
**Input:**
```json
{
  "error_type": "rate_limit",
  "error_context": {
    "tool_name": "add_task",
    "original_error": "RateLimitExceeded: 100 requests per minute exceeded",
    "status_code": 429
  },
  "user_message": "Add task"
}
```

**Output:**
```json
{
  "user_message": "You're making requests too quickly. Please wait a moment and try again.",
  "severity": "low",
  "suggested_action": "Wait 30 seconds before trying again",
  "show_details": false
}
```

### Example 7: Unauthorized Access
**Input:**
```json
{
  "error_type": "authorization_error",
  "error_context": {
    "tool_name": "delete_task",
    "original_error": "User 123 does not have permission to delete task 456",
    "status_code": 403
  },
  "user_message": "Delete task 456"
}
```

**Output:**
```json
{
  "user_message": "You don't have permission to modify this task.",
  "severity": "medium",
  "suggested_action": "You can only modify your own tasks",
  "show_details": false
}
```

### Example 8: MCP Tool Unavailable
**Input:**
```json
{
  "error_type": "tool_error",
  "error_context": {
    "tool_name": "add_task",
    "original_error": "MCPToolNotAvailable: add_task tool is not registered",
    "status_code": 503
  },
  "user_message": "Add a task"
}
```

**Output:**
```json
{
  "user_message": "This feature is temporarily unavailable. Please try again later.",
  "severity": "medium",
  "suggested_action": "Try again in a few minutes",
  "show_details": false
}
```

## Security Sanitization Rules

### NEVER Include in User Messages
- Stack traces
- File paths (`/app/src/models/task.py`)
- SQL queries (`SELECT * FROM tasks WHERE...`)
- Database connection strings
- API keys or tokens
- Internal user IDs (unless contextually necessary)
- Server hostnames or IPs
- Environment variables
- Library version numbers

### Safe to Include
- Generic error categories ("validation error", "not found")
- Field names ("title", "task_id")
- Expected formats ("must be a number", "required field")
- User-facing identifiers (task titles, public IDs)

## Error Message Patterns

### Validation Errors
- "[Field] is required."
- "[Field] must be [format]."
- "[Field] is invalid."

### Not Found Errors
- "[Resource] not found."
- "Could not find [resource]."

### Authorization Errors
- "You don't have permission to [action]."
- "Please log in to [action]."
- "Your session has expired."

### System Errors
- "We're experiencing technical difficulties."
- "This feature is temporarily unavailable."
- "Something went wrong. Please try again."

## Quality Standards

### Deterministic Behavior
- Same error type → Same user message pattern
- Consistent severity classification
- Predictable suggested actions

### Security
- Zero information leakage
- No technical details exposed
- Safe for public display
- Audit log original error separately

### Performance
- Error formatting must complete in <50ms
- No external API calls
- Pure text transformation

### User Experience
- Clear and actionable
- Non-technical language
- Helpful suggestions
- Calm and professional tone
- No panic-inducing language

## Edge Cases

### Unknown Error Type
**Input:** Unrecognized error_type
**Output:**
```json
{
  "user_message": "Something went wrong. Please try again.",
  "severity": "medium",
  "suggested_action": "If the problem persists, contact support",
  "show_details": false
}
```

### Null Error Context
**Input:** Missing error_context
**Output:** Same as unknown error type

### Multiple Errors
**Input:** Array of errors
**Output:** Format first error only, log others

## Integration Notes

**Upstream**: Receives errors from MCP tools, backend services, or orchestrator
**Downstream**: Returns formatted message to conversation handler
**Stateless**: No memory required
**Reusable**: Can be called for any error in the system

## Logging Requirements

While user sees sanitized message, system must log:
- Original error with full stack trace
- User ID and session ID
- Tool name and parameters (sanitized)
- Timestamp and request ID
- Severity level

**Log separately** - Never mix user-facing and internal logging.

## Testing Checklist

- [ ] All error types have user-friendly messages
- [ ] No stack traces in user messages
- [ ] No SQL queries exposed
- [ ] No file paths revealed
- [ ] Severity levels correct
- [ ] Suggested actions helpful
- [ ] Professional tone maintained
- [ ] Security sanitization complete

---

**Version**: 1.0
**Last Updated**: 2024-02-15
**Skill ID**: SKILL-06-ERROR-FORMATTING
