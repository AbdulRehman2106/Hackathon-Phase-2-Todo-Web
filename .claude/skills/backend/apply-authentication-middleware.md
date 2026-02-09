# Apply Authentication Middleware Concepts

## Purpose
Guide the conceptual design and application of authentication middleware in backend services.

## Skill Description
This skill provides understanding of authentication middleware patterns, how they work, and how to apply them effectively in backend applications.

## Middleware Concept

### What is Middleware?
Software that sits between the request and the route handler, processing requests before they reach the endpoint.

**Flow**:
```
Request → Middleware → Route Handler → Response
```

**Authentication Middleware Flow**:
```
Request
  ↓
Extract Token
  ↓
Validate Token
  ↓
Extract User Context
  ↓
Attach to Request
  ↓
Route Handler (has user context)
  ↓
Response
```

## Authentication Middleware Patterns

### Pattern 1: Global Middleware

**Concept**: Apply to all routes

**Use Case**: When most routes require authentication

**Pseudocode**:
```
app.use(authentication_middleware)

# All routes now require authentication
@app.get("/api/tasks")
def get_tasks():
    # user already authenticated
    pass
```

**Pros**:
- Consistent authentication
- Single point of control
- Less code duplication

**Cons**:
- Must explicitly exclude public routes
- All-or-nothing approach

### Pattern 2: Route-Level Middleware

**Concept**: Apply to specific routes

**Use Case**: Mix of public and protected routes

**Pseudocode**:
```
# Public route (no middleware)
@app.get("/api/health")
def health():
    return {"status": "ok"}

# Protected route (with middleware)
@app.get("/api/tasks", middleware=[authenticate])
def get_tasks():
    # user authenticated
    pass
```

**Pros**:
- Explicit authentication requirements
- Flexible per-route
- Clear which routes are protected

**Cons**:
- Must remember to add middleware
- More verbose

### Pattern 3: Dependency Injection

**Concept**: Authentication as a dependency

**Use Case**: FastAPI and similar frameworks

**Pseudocode**:
```
def get_current_user(token: str) -> User:
    # Validate token
    # Return user
    pass

@app.get("/api/tasks")
def get_tasks(current_user: User = Depends(get_current_user)):
    # current_user automatically injected
    pass
```

**Pros**:
- Type-safe
- Testable
- Reusable
- Clear dependencies

**Cons**:
- Framework-specific
- Requires understanding of DI

## Middleware Responsibilities

### 1. Token Extraction

**From Authorization Header**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Steps**:
1. Check if Authorization header exists
2. Verify format is "Bearer {token}"
3. Extract token part
4. Handle missing or malformed headers

**Error Cases**:
- Missing header → 401 Unauthorized
- Wrong format → 401 Unauthorized
- Empty token → 401 Unauthorized

### 2. Token Validation

**Steps**:
1. Decode token
2. Verify signature
3. Check expiration
4. Validate required claims
5. Handle validation errors

**Validation Checks**:
- Signature matches (not tampered)
- Not expired (exp claim)
- Has required claims (sub, etc.)
- Algorithm is allowed

**Error Cases**:
- Invalid signature → 401 Unauthorized
- Expired token → 401 Unauthorized
- Missing claims → 401 Unauthorized
- Invalid format → 401 Unauthorized

### 3. User Context Extraction

**From Token Payload**:
```
{
  "sub": "user_123",
  "email": "user@example.com",
  "role": "user"
}
```

**Extract**:
- User ID (sub claim)
- User email (if present)
- User role (if present)
- Other relevant claims

**Optional Database Lookup**:
- Verify user still exists
- Check user account status
- Get additional user data

### 4. Context Attachment

**Attach to Request**:
- Make user context available to route handlers
- Store in request object or context
- Accessible throughout request lifecycle

**Access in Handlers**:
```
def get_tasks(request):
    user_id = request.user.id
    # Use user_id for queries
```

## Middleware Implementation Patterns

### Synchronous Middleware

**Concept**: Blocking execution

**Pattern**:
```
def auth_middleware(request):
    # Extract token
    token = extract_token(request)

    # Validate token
    payload = validate_token(token)

    # Attach user
    request.user = get_user(payload['sub'])

    # Continue to handler
    return next(request)
```

### Asynchronous Middleware

**Concept**: Non-blocking execution

**Pattern**:
```
async def auth_middleware(request):
    # Extract token
    token = extract_token(request)

    # Validate token (async)
    payload = await validate_token_async(token)

    # Attach user (async DB lookup)
    request.user = await get_user_async(payload['sub'])

    # Continue to handler
    return await next(request)
```

### Decorator Pattern

**Concept**: Wrap route handlers

**Pattern**:
```
def require_auth(handler):
    def wrapper(request):
        # Authenticate
        user = authenticate(request)
        if not user:
            return unauthorized_response()

        # Call handler with user
        return handler(request, user)

    return wrapper

@require_auth
def get_tasks(request, user):
    # user already authenticated
    pass
```

## Error Handling in Middleware

### Authentication Failures

**Missing Token**:
```
Response: 401 Unauthorized
Body: {
  "error": {
    "code": "MISSING_TOKEN",
    "message": "Authentication required"
  }
}
```

**Invalid Token**:
```
Response: 401 Unauthorized
Body: {
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid authentication token"
  }
}
```

**Expired Token**:
```
Response: 401 Unauthorized
Body: {
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Authentication token has expired"
  }
}
```

### Error Response Pattern

**Consistent Structure**:
```
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

**Security Considerations**:
- Don't reveal token structure
- Generic messages for security
- Log detailed errors server-side
- Include request ID for debugging

## Middleware Ordering

### Order Matters

**Correct Order**:
```
1. CORS middleware
2. Logging middleware
3. Authentication middleware
4. Authorization middleware
5. Route handler
```

**Why**:
- CORS must be first (preflight requests)
- Logging before authentication (log all attempts)
- Authentication before authorization (need user first)
- Authorization before handler (check permissions)

### Example Flow

```
Request
  ↓
CORS Middleware (allow origin)
  ↓
Logging Middleware (log request)
  ↓
Authentication Middleware (verify token)
  ↓
Authorization Middleware (check permissions)
  ↓
Route Handler (process request)
  ↓
Response
```

## Optional Authentication

### Pattern: Optional User Context

**Concept**: Endpoint works with or without authentication

**Implementation**:
```
def optional_auth_middleware(request):
    try:
        token = extract_token(request)
        payload = validate_token(token)
        request.user = get_user(payload['sub'])
    except:
        request.user = None  # No user, but continue

    return next(request)
```

**Use Case**:
```
@app.get("/api/tasks")
def get_tasks(request):
    if request.user:
        # Return user's private tasks
        return get_user_tasks(request.user.id)
    else:
        # Return public tasks
        return get_public_tasks()
```

## Performance Considerations

### Caching

**Token Validation Cache**:
- Cache validated tokens temporarily
- Reduce repeated validation overhead
- Invalidate on token expiration

**User Data Cache**:
- Cache user data from database
- Reduce database queries
- Invalidate on user updates

### Async Operations

**Non-Blocking**:
- Use async token validation
- Async database lookups
- Don't block request processing

### Connection Pooling

**Database Connections**:
- Use connection pooling
- Reuse connections
- Limit concurrent connections

## Testing Middleware

### Test Cases

**Valid Token**:
```
Test: Request with valid token
Expected: User context attached, handler called
```

**Invalid Token**:
```
Test: Request with invalid token
Expected: 401 Unauthorized, handler not called
```

**Missing Token**:
```
Test: Request without token
Expected: 401 Unauthorized, handler not called
```

**Expired Token**:
```
Test: Request with expired token
Expected: 401 Unauthorized, handler not called
```

**Malformed Token**:
```
Test: Request with malformed token
Expected: 401 Unauthorized, handler not called
```

### Mock Testing

**Mock Token Validation**:
```
def test_auth_middleware():
    # Mock token validation
    mock_validate_token.return_value = {"sub": "user_123"}

    # Test middleware
    response = auth_middleware(request)

    # Verify user attached
    assert request.user.id == "user_123"
```

## Best Practices

1. **Fail Securely**: Deny access by default

2. **Clear Errors**: Helpful error messages

3. **Log Failures**: Track authentication attempts

4. **Performance**: Cache when appropriate

5. **Testable**: Easy to test in isolation

6. **Consistent**: Same pattern across endpoints

7. **Documented**: Clear documentation

8. **Secure**: Don't leak sensitive information

9. **Maintainable**: Simple, clear code

10. **Monitored**: Track authentication metrics

## Common Pitfalls

### 1. Not Checking Token Expiration
**Problem**: Expired tokens accepted
**Solution**: Always validate exp claim

### 2. Exposing Errors
**Problem**: Detailed errors reveal system info
**Solution**: Generic client errors, detailed server logs

### 3. No Rate Limiting
**Problem**: Brute force attacks possible
**Solution**: Rate limit authentication attempts

### 4. Synchronous Blocking
**Problem**: Slow middleware blocks requests
**Solution**: Use async operations

### 5. No Logging
**Problem**: Can't debug authentication issues
**Solution**: Log all authentication attempts

## Success Criteria

Effective authentication middleware provides:
- Secure token validation
- Clear error handling
- Good performance
- Easy to test
- Consistent behavior
- Comprehensive logging
- Maintainable code

---

**Application**: Use this skill when designing authentication systems, implementing middleware, or reviewing authentication architecture.
