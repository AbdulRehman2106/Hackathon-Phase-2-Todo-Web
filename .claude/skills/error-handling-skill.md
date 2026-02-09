# Error Handling Skill

## Purpose
Provide structured, professional error handling solutions for applications, systems, and user interfaces. Transform failure scenarios into resilient, user-friendly experiences with comprehensive error management strategies.

## Core Capabilities

### 1. Identify Possible Failure Points
- Analyze system architecture for vulnerabilities
- Map user journeys for potential errors
- Identify external dependencies and failure modes
- Assess data validation requirements
- Evaluate network and I/O operations
- Review authentication and authorization flows

### 2. Design Error Handling Flows
- Create error propagation strategies
- Define error boundaries and containment
- Design recovery and retry mechanisms
- Establish fallback behaviors
- Plan graceful degradation paths
- Implement circuit breakers for external services

### 3. Write Clear and Actionable Error Messages
- User-facing: Simple, helpful, non-technical
- Developer-facing: Detailed, contextual, debuggable
- Avoid technical jargon for end users
- Provide next steps and solutions
- Include error codes for support reference
- Maintain consistent tone and format

### 4. Suggest Fallback and Retry Mechanisms
- Exponential backoff strategies
- Circuit breaker patterns
- Cached data fallbacks
- Default values and safe modes
- Partial functionality degradation
- Queue-based retry systems

### 5. Improve Debugging and Logging Strategies
- Structured logging with context
- Error tracking and aggregation
- Stack traces and breadcrumbs
- Performance monitoring
- Alerting and notification systems
- Log levels and filtering

### 6. Enhance System Resilience and Stability
- Defensive programming practices
- Input validation and sanitization
- Timeout and deadline management
- Resource cleanup and disposal
- Health checks and monitoring
- Chaos engineering principles

## Error Classification Taxonomy

### By Severity
1. **Critical**: System failure, data loss, security breach
2. **High**: Feature unavailable, significant user impact
3. **Medium**: Degraded functionality, workaround available
4. **Low**: Minor inconvenience, cosmetic issues
5. **Info**: Expected behavior, informational only

### By Category
1. **Validation Errors**: Invalid input, constraint violations
2. **Authentication Errors**: Login failures, token expiration
3. **Authorization Errors**: Permission denied, access forbidden
4. **Network Errors**: Connection failures, timeouts, DNS issues
5. **Database Errors**: Query failures, connection pool exhaustion
6. **External Service Errors**: API failures, third-party downtime
7. **System Errors**: Out of memory, disk full, CPU overload
8. **Business Logic Errors**: Rule violations, state conflicts
9. **Configuration Errors**: Missing settings, invalid config
10. **Unknown Errors**: Unexpected exceptions, edge cases

### By Recoverability
1. **Recoverable**: Retry possible, user can fix
2. **Partially Recoverable**: Some functionality available
3. **Non-Recoverable**: Requires intervention, system restart
4. **Transient**: Temporary issue, will resolve automatically

## Error Handling Patterns

### 1. Try-Catch-Finally
```javascript
try {
  // Risky operation
  const result = await fetchData();
  return result;
} catch (error) {
  // Handle specific errors
  if (error instanceof NetworkError) {
    return handleNetworkError(error);
  }
  // Log and rethrow unknown errors
  logger.error('Unexpected error', { error, context });
  throw error;
} finally {
  // Cleanup resources
  cleanup();
}
```

### 2. Error Boundaries (React)
```javascript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <FallbackUI />;
    }
    return this.props.children;
  }
}
```

### 3. Middleware Error Handling (Express)
```javascript
app.use((err, req, res, next) => {
  logger.error(err.stack);

  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.details
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    requestId: req.id
  });
});
```

### 4. Result/Either Pattern
```typescript
type Result<T, E> =
  | { success: true; value: T }
  | { success: false; error: E };

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return { success: false, error: 'Division by zero' };
  }
  return { success: true, value: a / b };
}
```

### 5. Circuit Breaker
```javascript
class CircuitBreaker {
  constructor(threshold, timeout) {
    this.failureCount = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      throw new Error('Circuit breaker is OPEN');
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
```

## User-Facing Error Messages

### Principles
1. **Be Human**: Use conversational, empathetic language
2. **Be Specific**: Explain what went wrong clearly
3. **Be Helpful**: Provide actionable next steps
4. **Be Honest**: Don't hide problems or make false promises
5. **Be Brief**: Respect user's time and attention

### Message Structure
```
[What Happened] + [Why It Happened] + [What To Do Next]
```

### Examples

**Bad**: "Error 500: Internal Server Error"
**Good**: "We couldn't save your changes. Our servers are experiencing issues. Please try again in a few minutes."

**Bad**: "Validation failed"
**Good**: "Please check your email address. It should look like: name@example.com"

**Bad**: "Unauthorized"
**Good**: "Your session has expired. Please log in again to continue."

**Bad**: "Network error"
**Good**: "We couldn't connect to the server. Check your internet connection and try again."

**Bad**: "Exception in thread main"
**Good**: "Something unexpected happened. We've been notified and are looking into it. (Error ID: #12345)"

### Error Message Templates

#### Validation Errors
- "Please enter a valid [field name]"
- "[Field name] must be at least [X] characters"
- "[Field name] is required"
- "Please choose a different [field name] - this one is already taken"

#### Authentication Errors
- "Incorrect email or password. Please try again."
- "Your session has expired. Please log in again."
- "Too many login attempts. Please try again in [X] minutes."
- "We sent a verification email to [email]. Please check your inbox."

#### Authorization Errors
- "You don't have permission to access this page."
- "This feature is only available to [plan name] users. Upgrade to continue."
- "Your account has been suspended. Contact support for help."

#### Network Errors
- "We couldn't connect to the server. Please check your internet connection."
- "The request timed out. Please try again."
- "We're having trouble loading this page. Please refresh and try again."

#### System Errors
- "Something went wrong on our end. We're working to fix it."
- "This feature is temporarily unavailable. Please try again later."
- "We're experiencing high traffic. Please wait a moment and try again."

## Developer-Facing Error Information

### Structured Error Objects
```typescript
interface AppError {
  // User-facing
  message: string;
  userMessage: string;

  // Developer-facing
  code: string;
  statusCode: number;
  stack?: string;

  // Context
  timestamp: Date;
  requestId: string;
  userId?: string;

  // Debugging
  context: Record<string, any>;
  innerError?: Error;

  // Metadata
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  recoverable: boolean;
}
```

### Error Codes
Use hierarchical error codes for easy categorization:
- `AUTH_001`: Invalid credentials
- `AUTH_002`: Token expired
- `AUTH_003`: Account locked
- `VAL_001`: Missing required field
- `VAL_002`: Invalid format
- `NET_001`: Connection timeout
- `NET_002`: DNS resolution failed
- `DB_001`: Query timeout
- `DB_002`: Connection pool exhausted

### Logging Best Practices
```javascript
// Good: Structured logging with context
logger.error('Payment processing failed', {
  error: error.message,
  stack: error.stack,
  userId: user.id,
  orderId: order.id,
  amount: order.total,
  paymentMethod: payment.method,
  timestamp: new Date().toISOString(),
  requestId: req.id
});

// Bad: Minimal information
logger.error('Error');
```

### Log Levels
1. **FATAL**: Application crash, immediate attention required
2. **ERROR**: Operation failed, needs investigation
3. **WARN**: Unexpected but handled, monitor for patterns
4. **INFO**: Normal operations, significant events
5. **DEBUG**: Detailed information for debugging
6. **TRACE**: Very detailed, typically disabled in production

## Recovery and Resilience Strategies

### 1. Retry with Exponential Backoff
```javascript
async function retryWithBackoff(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
      await sleep(delay);
    }
  }
}
```

### 2. Fallback Data
```javascript
async function fetchUserData(userId) {
  try {
    return await api.getUser(userId);
  } catch (error) {
    logger.warn('API failed, using cached data', { userId, error });
    return cache.get(`user:${userId}`) || getDefaultUser();
  }
}
```

### 3. Graceful Degradation
```javascript
async function loadDashboard() {
  const [userData, analytics, notifications] = await Promise.allSettled([
    fetchUserData(),
    fetchAnalytics(),
    fetchNotifications()
  ]);

  return {
    user: userData.status === 'fulfilled' ? userData.value : null,
    analytics: analytics.status === 'fulfilled' ? analytics.value : null,
    notifications: notifications.status === 'fulfilled' ? notifications.value : []
  };
}
```

### 4. Timeout Protection
```javascript
async function withTimeout(promise, timeoutMs) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new TimeoutError()), timeoutMs)
  );
  return Promise.race([promise, timeout]);
}
```

### 5. Queue-Based Retry
```javascript
class RetryQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  async add(operation) {
    this.queue.push(operation);
    if (!this.processing) {
      this.process();
    }
  }

  async process() {
    this.processing = true;
    while (this.queue.length > 0) {
      const operation = this.queue.shift();
      try {
        await operation();
      } catch (error) {
        // Re-queue with delay
        setTimeout(() => this.add(operation), 5000);
      }
    }
    this.processing = false;
  }
}
```

## Security Considerations

### Never Expose
- Stack traces in production
- Database query details
- Internal file paths
- API keys or secrets
- User data from other accounts
- System architecture details
- Version numbers of dependencies

### Safe Error Messages
**Bad**: "SQL Error: SELECT * FROM users WHERE id = 123 failed"
**Good**: "We couldn't retrieve your profile. Please try again."

**Bad**: "File not found: /var/www/app/config/secrets.json"
**Good**: "Configuration error. Please contact support."

**Bad**: "Invalid JWT token: signature verification failed"
**Good**: "Your session is invalid. Please log in again."

### Rate Limiting Error Responses
```javascript
if (rateLimitExceeded) {
  return {
    error: 'Too many requests',
    message: 'Please wait before trying again',
    retryAfter: 60 // seconds
  };
}
```

## Platform-Specific Guidance

### Frontend (React/Vue/Angular)

#### Error Boundaries
```javascript
// Wrap components that might fail
<ErrorBoundary fallback={<ErrorPage />}>
  <UserDashboard />
</ErrorBoundary>
```

#### Global Error Handler
```javascript
window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection', {
    reason: event.reason,
    promise: event.promise
  });
  showErrorToast('Something went wrong. Please refresh the page.');
});
```

#### Form Validation
```javascript
const [errors, setErrors] = useState({});

function validateForm(data) {
  const newErrors = {};

  if (!data.email) {
    newErrors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    newErrors.email = 'Please enter a valid email address';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
}
```

### Backend (Node.js/Express)

#### Global Error Handler
```javascript
app.use((err, req, res, next) => {
  // Log error with context
  logger.error('Request failed', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    userId: req.user?.id,
    requestId: req.id
  });

  // Send appropriate response
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.details
    });
  }

  if (err instanceof AuthenticationError) {
    return res.status(401).json({
      error: 'Authentication required'
    });
  }

  // Default error response
  res.status(500).json({
    error: 'Internal server error',
    requestId: req.id
  });
});
```

#### Async Error Handling
```javascript
// Wrapper to catch async errors
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  res.json(user);
}));
```

### API Design

#### HTTP Status Codes
- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource doesn't exist
- `409 Conflict`: Resource conflict (duplicate)
- `422 Unprocessable Entity`: Semantic error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `502 Bad Gateway`: Upstream service failed
- `503 Service Unavailable`: Temporary downtime
- `504 Gateway Timeout`: Upstream timeout

#### Error Response Format
```json
{
  "error": {
    "code": "VAL_001",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ],
    "requestId": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Testing Error Scenarios

### Unit Tests
```javascript
describe('User registration', () => {
  it('should return validation error for invalid email', async () => {
    const result = await registerUser({ email: 'invalid' });
    expect(result.error).toBe('VAL_002');
    expect(result.message).toContain('valid email');
  });

  it('should handle database connection failure', async () => {
    mockDb.connect.mockRejectedValue(new Error('Connection failed'));
    await expect(registerUser(validData)).rejects.toThrow();
  });
});
```

### Integration Tests
```javascript
describe('API error handling', () => {
  it('should return 400 for missing required fields', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('should return 401 for invalid token', async () => {
    const response = await request(app)
      .get('/api/profile')
      .set('Authorization', 'Bearer invalid_token');

    expect(response.status).toBe(401);
  });
});
```

### Chaos Testing
```javascript
// Randomly inject failures to test resilience
function chaosMiddleware(req, res, next) {
  if (Math.random() < 0.1) { // 10% failure rate
    return next(new Error('Chaos monkey struck!'));
  }
  next();
}
```

## Monitoring and Alerting

### Key Metrics
1. **Error Rate**: Errors per minute/hour
2. **Error Types**: Distribution by category
3. **Affected Users**: Unique users experiencing errors
4. **Response Time**: P50, P95, P99 latencies
5. **Success Rate**: Percentage of successful requests

### Alert Thresholds
- **Critical**: Error rate > 5% for 5 minutes
- **High**: Error rate > 2% for 10 minutes
- **Medium**: New error type detected
- **Low**: Error rate increasing trend

### Error Tracking Tools
- Sentry (error tracking and monitoring)
- Rollbar (real-time error tracking)
- Bugsnag (error monitoring)
- LogRocket (session replay with errors)
- Datadog (full-stack monitoring)

## Output Format Template

When analyzing or designing error handling, use this structure:

### Error Type
- Classification (validation, network, auth, etc.)
- Severity (critical, high, medium, low)
- Recoverability (recoverable, partial, non-recoverable)

### Cause
- Root cause analysis
- Triggering conditions
- Frequency and patterns
- Related dependencies

### Impact
- User experience impact
- Business impact
- System stability impact
- Data integrity impact

### Handling Strategy
- Detection method
- Containment approach
- Recovery mechanism
- Fallback behavior
- Retry logic (if applicable)

### User Message
- Clear, non-technical explanation
- Actionable next steps
- Expected resolution time (if known)
- Support contact (if needed)

### Developer Notes
- Error code and status code
- Logging requirements
- Monitoring and alerting
- Stack trace and context
- Related documentation
- Known issues and workarounds

## Best Practices Checklist

- [ ] All errors are caught and handled appropriately
- [ ] User-facing messages are clear and helpful
- [ ] Sensitive information is never exposed
- [ ] Errors are logged with sufficient context
- [ ] Critical errors trigger alerts
- [ ] Retry logic is implemented for transient failures
- [ ] Fallback mechanisms are in place
- [ ] Timeouts are configured for external calls
- [ ] Error boundaries prevent cascading failures
- [ ] Error responses follow consistent format
- [ ] HTTP status codes are used correctly
- [ ] Validation errors provide specific field feedback
- [ ] Error scenarios are covered by tests
- [ ] Documentation includes error handling guide
- [ ] Monitoring dashboards track error metrics

## Common Anti-Patterns to Avoid

### 1. Silent Failures
**Bad**: Catching errors without logging or handling
```javascript
try {
  await saveData();
} catch (error) {
  // Do nothing
}
```

### 2. Generic Error Messages
**Bad**: "An error occurred"
**Good**: "We couldn't save your profile. Please check your internet connection and try again."

### 3. Exposing Stack Traces
**Bad**: Showing full stack traces to users in production

### 4. Swallowing Errors
**Bad**: Returning success when operation failed
```javascript
try {
  await operation();
  return { success: true };
} catch (error) {
  return { success: true }; // Lying about success
}
```

### 5. No Error Context
**Bad**: `logger.error(error.message)`
**Good**: `logger.error('Payment failed', { error, userId, orderId, amount })`

### 6. Retry Without Backoff
**Bad**: Immediately retrying failed requests in a tight loop

### 7. No Timeout
**Bad**: Waiting indefinitely for external service response

### 8. Catching Everything
**Bad**: Catching all errors including programming errors that should crash

---

**Activation**: This skill provides comprehensive error handling guidance covering detection, handling, recovery, logging, monitoring, and user communication. Use it to build resilient, user-friendly applications that gracefully handle failures.
