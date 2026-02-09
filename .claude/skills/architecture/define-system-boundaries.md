# Define System Boundaries

## Purpose
Guide the clear definition of system boundaries to establish what is inside vs. outside the system, and how components interact across boundaries.

## Skill Description
This skill provides techniques for identifying and documenting system boundaries, component interfaces, and integration points in software architecture.

## What Are System Boundaries?

### Definition
System boundaries define:
- What is part of the system vs. external
- Where one component ends and another begins
- How components communicate across boundaries
- What data crosses boundaries
- Who is responsible for what

### Why Boundaries Matter
- **Clarity**: Everyone knows what belongs where
- **Independence**: Components can evolve separately
- **Testing**: Clear boundaries enable isolated testing
- **Security**: Boundaries are security checkpoints
- **Scalability**: Independent scaling of components
- **Maintenance**: Changes contained within boundaries

## Types of Boundaries

### 1. System Boundary
Separates your system from external world:
```
┌─────────────────────────────────┐
│     Your System                 │
│  ┌──────────┐  ┌──────────┐   │
│  │Frontend  │  │Backend   │   │
│  └──────────┘  └──────────┘   │
└─────────────────────────────────┘
         │              │
    ┌────┴────┐    ┌────┴────┐
    │ Users   │    │External │
    │         │    │ APIs    │
    └─────────┘    └─────────┘
```

**Inside System**: Components you control
**Outside System**: Users, external services, third-party APIs

### 2. Component Boundary
Separates internal components:
```
┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │
│  Component   │     │  Component   │
└──────────────┘     └──────────────┘
```

**Boundary**: API contract between frontend and backend

### 3. Layer Boundary
Separates architectural layers:
```
┌─────────────────┐
│ Presentation    │
├─────────────────┤ ← Boundary
│ Business Logic  │
├─────────────────┤ ← Boundary
│ Data Access     │
└─────────────────┘
```

### 4. Service Boundary
Separates microservices:
```
┌────────┐  ┌────────┐  ┌────────┐
│ Auth   │  │ User   │  │ Task   │
│Service │  │Service │  │Service │
└────────┘  └────────┘  └────────┘
```

Each service is independently deployable

## Defining Frontend-Backend Boundary

### Frontend Responsibilities
**Inside Frontend Boundary**:
- UI rendering and styling
- User interaction handling
- Client-side validation
- Local state management
- API request formation
- Response handling and display

**Outside Frontend Boundary**:
- Business logic execution
- Data persistence
- Authentication verification
- Authorization decisions
- Server-side validation

### Backend Responsibilities
**Inside Backend Boundary**:
- Business logic implementation
- Data validation and processing
- Authentication and authorization
- Database operations
- External service integration
- API response formation

**Outside Backend Boundary**:
- UI rendering
- User interaction
- Client-side state
- Direct database access from frontend

### Communication Across Boundary
**Protocol**: HTTP/HTTPS
**Format**: JSON
**Authentication**: JWT tokens
**Direction**: Frontend initiates, Backend responds

```
Frontend                    Backend
   │                           │
   │  POST /api/tasks          │
   │  Authorization: Bearer... │
   │  { title: "..." }         │
   ├──────────────────────────▶│
   │                           │
   │                           │ Validate token
   │                           │ Check authorization
   │                           │ Process business logic
   │                           │ Save to database
   │                           │
   │  201 Created              │
   │  { id: 123, ... }         │
   │◀──────────────────────────┤
   │                           │
```

## Defining Backend-Database Boundary

### Backend Responsibilities
**Inside Backend Boundary**:
- SQL query construction
- Transaction management
- Connection pooling
- ORM usage
- Data mapping
- Query optimization

**Outside Backend Boundary**:
- Raw data storage
- Index management
- Physical storage
- Replication

### Database Responsibilities
**Inside Database Boundary**:
- Data persistence
- ACID guarantees
- Constraint enforcement
- Index maintenance
- Query execution

**Outside Database Boundary**:
- Business logic
- Data validation (beyond constraints)
- Authorization decisions

### Communication Across Boundary
**Protocol**: Database-specific (PostgreSQL wire protocol)
**Format**: SQL queries and result sets
**Authentication**: Database credentials
**Direction**: Backend initiates, Database responds

## External Service Boundaries

### Your System's Responsibility
- API client implementation
- Request formation
- Response parsing
- Error handling
- Retry logic
- Timeout management

### External Service's Responsibility
- Service implementation
- Data processing
- Response formation
- Availability
- Performance

### Integration Points
```
Your Backend              External Service
     │                          │
     │  POST /api/endpoint      │
     │  API-Key: ...            │
     ├─────────────────────────▶│
     │                          │
     │  200 OK                  │
     │  { result: ... }         │
     │◀─────────────────────────┤
     │                          │
```

**Boundary Considerations**:
- What if service is down?
- What if response is slow?
- How to handle errors?
- How to secure API keys?
- How to test without real service?

## Data Boundaries

### What Data Crosses Boundaries?

**Frontend ↔ Backend**:
- User input (forms, actions)
- Display data (lists, details)
- Authentication tokens
- Error messages
- Status updates

**Backend ↔ Database**:
- Entity data (create, read, update, delete)
- Query parameters
- Result sets
- Transaction commands

**Backend ↔ External Services**:
- Request payloads
- Response data
- API credentials
- Status codes

### Data Transformation at Boundaries

**Frontend to Backend**:
```javascript
// Frontend sends
{ taskTitle: "Buy milk", dueDate: "2024-01-15" }

// Backend receives and transforms
{ title: "Buy milk", due_date: Date("2024-01-15"), user_id: 123 }
```

**Backend to Database**:
```python
# Backend ORM model
Task(title="Buy milk", due_date=date(2024, 1, 15), user_id=123)

# Database stores
INSERT INTO tasks (title, due_date, user_id) VALUES (...)
```

## Security at Boundaries

### Trust Boundaries
```
Untrusted          Trusted           Highly Trusted
┌──────────┐      ┌──────────┐      ┌──────────┐
│ Frontend │─────▶│ Backend  │─────▶│ Database │
└──────────┘      └──────────┘      └──────────┘
```

**Untrusted Zone (Frontend)**:
- Validate all input
- Never trust client data
- Assume malicious users
- No sensitive data storage

**Trusted Zone (Backend)**:
- Verify authentication
- Enforce authorization
- Validate business rules
- Sanitize data

**Highly Trusted Zone (Database)**:
- Enforce constraints
- Maintain integrity
- Secure access

### Validation at Each Boundary

**Frontend Validation**:
- Format checking (email, phone)
- Required field checking
- Length limits
- User experience improvement

**Backend Validation**:
- All frontend validations repeated
- Business rule enforcement
- Authorization checks
- Data integrity verification

**Database Validation**:
- Constraint enforcement
- Type checking
- Referential integrity
- Uniqueness constraints

## Interface Contracts

### API Contract (Frontend-Backend)
```
Endpoint: POST /api/tasks
Authentication: Required (JWT)
Request:
  {
    "title": string (required, 1-500 chars),
    "description": string (optional, max 2000 chars),
    "due_date": ISO date string (optional)
  }
Response (201):
  {
    "id": integer,
    "title": string,
    "description": string,
    "due_date": ISO date string,
    "created_at": ISO datetime string,
    "user_id": integer
  }
Errors:
  400: Validation error
  401: Unauthorized
  500: Server error
```

### Database Contract (Backend-Database)
```sql
Table: tasks
Columns:
  id: SERIAL PRIMARY KEY
  title: VARCHAR(500) NOT NULL
  description: TEXT
  due_date: DATE
  user_id: INTEGER NOT NULL REFERENCES users(id)
  created_at: TIMESTAMP DEFAULT NOW()
  completed: BOOLEAN DEFAULT FALSE

Indexes:
  PRIMARY KEY (id)
  INDEX (user_id)
  INDEX (user_id, completed)
```

## Boundary Crossing Rules

### Rule 1: Explicit Interfaces
All boundary crossings must use defined interfaces:
- No direct database access from frontend
- No UI rendering from backend
- No business logic in database

### Rule 2: Data Transformation
Data may need transformation at boundaries:
- Frontend camelCase ↔ Backend snake_case
- String dates ↔ Date objects
- Display format ↔ Storage format

### Rule 3: Error Handling
Each side handles errors appropriately:
- Frontend: Display user-friendly messages
- Backend: Log details, return safe errors
- Database: Enforce constraints, return errors

### Rule 4: Authentication/Authorization
Security checked at each boundary:
- Frontend: Store and send tokens
- Backend: Verify tokens, check permissions
- Database: Enforce row-level security (if applicable)

## Documentation

### Boundary Documentation Template
```markdown
## [Component A] ↔ [Component B] Boundary

### Communication Protocol
- Protocol: HTTP/REST
- Format: JSON
- Authentication: JWT Bearer token

### [Component A] Responsibilities
- [Responsibility 1]
- [Responsibility 2]

### [Component B] Responsibilities
- [Responsibility 1]
- [Responsibility 2]

### Interface Contract
[API specification or interface definition]

### Data Flow
[Description of data crossing boundary]

### Error Handling
[How errors are handled at boundary]

### Security Considerations
[Security measures at boundary]
```

## Common Boundary Violations

### 1. Frontend Accessing Database Directly
**Problem**: Bypasses business logic and security
**Solution**: All data access through backend APIs

### 2. Business Logic in Frontend
**Problem**: Logic in untrusted environment
**Solution**: Move business logic to backend

### 3. UI Logic in Backend
**Problem**: Backend concerned with presentation
**Solution**: Backend returns data, frontend handles display

### 4. Database Containing Business Logic
**Problem**: Logic hard to test and maintain
**Solution**: Keep database for storage, logic in backend

## Best Practices

1. **Make Boundaries Explicit**: Document clearly in architecture diagrams

2. **Minimize Boundary Crossings**: Reduce chattiness between components

3. **Use Standard Protocols**: HTTP/REST, SQL, etc.

4. **Version Interfaces**: Allow evolution without breaking changes

5. **Validate at Boundaries**: Don't trust data crossing boundaries

6. **Handle Errors at Boundaries**: Each component handles its errors

7. **Test Boundaries**: Integration tests for boundary interactions

8. **Monitor Boundaries**: Track performance and errors at boundaries

## Success Criteria

Well-defined boundaries result in:
- Clear component responsibilities
- Independent development and testing
- Secure system architecture
- Maintainable codebase
- Scalable system design
- Reduced coupling between components

---

**Application**: Use this skill when designing system architecture, defining component interfaces, or resolving architectural ambiguities.
