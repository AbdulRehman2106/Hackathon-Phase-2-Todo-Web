# Skill: Define Frontend, Backend, and Database Boundaries

## Purpose
Establish clear responsibilities and interfaces between application layers to ensure proper separation of concerns and maintainable architecture.

## When to Use
- Designing new features that span multiple layers
- Reviewing existing architecture for boundary violations
- Onboarding team members to architecture patterns
- Resolving ambiguity about where logic should reside

## Instruction

### Layer Definitions

#### Frontend Layer (Next.js)

**Responsibilities:**
- User interface rendering
- Client-side routing
- Form handling and validation (UX validation)
- API request orchestration
- Client-side state management
- User feedback (loading, errors, success)
- Accessibility implementation

**MUST NOT:**
- Contain business logic
- Directly access database
- Store sensitive data
- Perform authorization decisions
- Trust client-side validation alone

**Boundary Interface:**
- Consumes REST API endpoints
- Sends/receives JSON payloads
- Handles HTTP status codes

---

#### Backend Layer (FastAPI)

**Responsibilities:**
- Business logic implementation
- Data validation (security validation)
- Authentication verification
- Authorization enforcement
- Database query orchestration
- External service integration
- Error handling and logging
- API response formatting

**MUST NOT:**
- Contain UI/presentation logic
- Return HTML (API-only)
- Store state between requests
- Bypass database constraints
- Expose internal errors to clients

**Boundary Interfaces:**
- Exposes REST API to frontend
- Connects to database via ORM
- Integrates with external services

---

#### Database Layer (PostgreSQL/Neon)

**Responsibilities:**
- Data persistence
- Referential integrity
- Constraint enforcement
- Transaction management
- Index optimization
- Data type enforcement

**MUST NOT:**
- Contain business logic (stored procedures discouraged)
- Handle authentication
- Format data for presentation
- Make external API calls

**Boundary Interface:**
- Accessed via SQLModel ORM
- Exposes tables, views, indexes
- Enforces schema constraints

---

### Boundary Decision Matrix

Use this matrix to determine where functionality belongs:

| Functionality | Frontend | Backend | Database |
|--------------|----------|---------|----------|
| Field format display | ✓ | | |
| Required field check (UX) | ✓ | | |
| Required field check (security) | | ✓ | |
| Business rule validation | | ✓ | |
| Data type enforcement | | | ✓ |
| User authentication | | ✓ | |
| Permission checking | | ✓ | |
| Data ownership query | | ✓ | ✓ |
| Loading state UI | ✓ | | |
| Error message formatting | ✓ | | |
| Error logging | | ✓ | |
| Data transformation | | ✓ | |
| Pagination logic | | ✓ | ✓ |
| Sorting logic | | ✓ | ✓ |

### Anti-Patterns to Avoid

#### Frontend Overreach
```
❌ Frontend directly constructs SQL-like queries
❌ Business logic in React components
❌ Authorization checks only in UI
❌ Sensitive data in localStorage
```

#### Backend Overreach
```
❌ HTML templates in API responses
❌ Presentation formatting in responses
❌ Frontend state management
❌ UI-specific error messages
```

#### Database Overreach
```
❌ Complex business logic in triggers
❌ Application state in database
❌ Presentation formatting in queries
❌ External API calls from database
```

### Communication Contracts

#### Frontend → Backend
```typescript
// Request
{
  method: 'POST' | 'GET' | 'PUT' | 'DELETE',
  headers: {
    'Authorization': 'Bearer <jwt>',
    'Content-Type': 'application/json'
  },
  body: JSON  // for POST/PUT
}

// Response
{
  status: number,
  body: {
    data?: any,
    error?: {
      code: string,
      message: string
    }
  }
}
```

#### Backend → Database
```python
# Always through ORM
async with session.begin():
    result = await session.execute(
        select(Model).where(Model.user_id == user_id)
    )
```

### Validation Strategy

| Layer | Validation Type | Purpose |
|-------|----------------|---------|
| Frontend | Format, required | UX feedback |
| Backend | All rules | Security, business rules |
| Database | Constraints | Data integrity |

**Rule:** Never trust frontend validation alone. Backend MUST revalidate all input.

## Output Format
Documentation of layer responsibilities and boundaries, suitable for architecture documentation or plan.md.

## Related Skills
- design-fullstack-architecture
- design-auth-flows
- enforce-data-isolation
