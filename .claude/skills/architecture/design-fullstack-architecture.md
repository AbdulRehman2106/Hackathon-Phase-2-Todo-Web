# Skill: Design Full-Stack System Architecture

## Purpose
Create comprehensive architectural designs for full-stack applications that establish clear boundaries, communication patterns, and scalability considerations.

## When to Use
- Starting a new full-stack project
- Planning major architectural changes
- Documenting existing system architecture
- Evaluating architectural trade-offs

## Instruction

### Architecture Document Structure

A complete architectural design MUST include:

#### 1. System Overview

```markdown
## System Overview

### Purpose
[One paragraph describing what the system does]

### Key Stakeholders
- End Users: [description]
- Administrators: [description]
- External Systems: [description]

### High-Level Architecture Diagram
[ASCII or reference to diagram file]

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Backend   │────▶│  Database   │
│  (Next.js)  │◀────│  (FastAPI)  │◀────│   (Neon)    │
└─────────────┘     └─────────────┘     └─────────────┘
```

#### 2. Component Breakdown

```markdown
## Components

### Frontend (Next.js App Router)
- **Responsibility**: User interface, client-side state, API consumption
- **Technology**: Next.js 14+, React 18+, TypeScript
- **Deployment**: Vercel / Static hosting

### Backend (FastAPI)
- **Responsibility**: Business logic, data validation, API endpoints
- **Technology**: FastAPI, Python 3.11+, SQLModel
- **Deployment**: Container / Serverless

### Database (Neon PostgreSQL)
- **Responsibility**: Data persistence, transactions, constraints
- **Technology**: PostgreSQL (serverless)
- **Scaling**: Connection pooling, read replicas
```

#### 3. Communication Patterns

```markdown
## Communication Patterns

### Client to Backend
- Protocol: HTTPS
- Format: JSON REST API
- Authentication: JWT Bearer tokens

### Backend to Database
- Protocol: PostgreSQL wire protocol
- Connection: Pooled connections via Neon
- ORM: SQLModel (async)

### Error Propagation
- Frontend receives standardized error responses
- Backend logs errors with correlation IDs
- User-friendly messages returned to client
```

#### 4. Data Flow

```markdown
## Data Flow

### Request Lifecycle
1. User action triggers API call from frontend
2. Request includes JWT in Authorization header
3. Backend validates JWT, extracts user context
4. Business logic executes with user isolation
5. Database query scoped to user's data
6. Response formatted and returned
7. Frontend updates UI state

### State Management
- Server State: React Query / SWR for API data
- Client State: React Context / Zustand for UI state
- Form State: React Hook Form for inputs
```

#### 5. Security Architecture

```markdown
## Security Architecture

### Authentication
- Method: JWT tokens via Better Auth
- Token Storage: httpOnly cookies (preferred) or secure localStorage
- Token Refresh: Automatic refresh before expiry

### Authorization
- Model: User-based ownership
- Enforcement: Backend middleware + database constraints
- Principle: Deny by default, explicit allow

### Data Protection
- Transit: TLS 1.3 for all connections
- Storage: Encrypted at rest (Neon managed)
- Secrets: Environment variables, never in code
```

#### 6. Scalability Considerations

```markdown
## Scalability

### Horizontal Scaling
- Frontend: CDN + edge caching
- Backend: Stateless, container orchestration ready
- Database: Neon autoscaling + connection pooling

### Performance Targets
- API Response: p95 < 200ms
- Page Load: LCP < 2.5s
- Database Query: p95 < 50ms

### Caching Strategy
- API: Response caching headers
- Database: Query result caching (optional)
- Static Assets: CDN with long TTL
```

### Architecture Decision Criteria

When making architectural decisions, evaluate:

| Criterion | Question |
|-----------|----------|
| Simplicity | Is this the simplest solution that works? |
| Scalability | Can this grow with user demand? |
| Maintainability | Can the team understand and modify this? |
| Security | Does this follow security best practices? |
| Cost | Is this cost-effective at scale? |
| Reversibility | Can we change this decision later? |

### Documentation Requirements

Architecture documentation MUST be:
- Versioned alongside code
- Updated when significant changes occur
- Reviewed by stakeholders
- Accessible to all team members

## Output Format
Markdown document suitable for `specs/<project>/plan.md` or dedicated architecture documentation.

## Related Skills
- define-layer-boundaries
- design-auth-flows
- validate-monorepo-structure
