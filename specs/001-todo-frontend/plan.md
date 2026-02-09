# Implementation Plan: Todo Frontend Application

**Branch**: `001-todo-frontend` | **Date**: 2026-02-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-frontend/spec.md`

## Summary

Build a production-quality Todo web application frontend with professional UI/UX, secure JWT-based authentication, and seamless FastAPI backend integration. The frontend will provide a clean, modern interface for task management with full CRUD operations, user isolation, and responsive design across all devices.

**Technical Approach**: Next.js 16+ App Router with TypeScript and Tailwind CSS for the frontend, integrating with Better Auth for JWT authentication and FastAPI backend for task operations. Emphasis on optimistic UI updates, comprehensive error handling, and WCAG 2.1 AA accessibility compliance.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16+ (App Router)
**Primary Dependencies**: Next.js, React 18+, Tailwind CSS 3.x, Better Auth (JWT), TypeScript
**Storage**: Backend-managed via FastAPI + SQLModel (Neon PostgreSQL) - frontend has no direct database access
**Testing**: Jest + React Testing Library for unit tests, Playwright for E2E tests
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge - latest 2 versions), responsive 320px-2560px
**Project Type**: Web application (frontend-only, separate backend)
**Performance Goals**: <3s initial load, <100ms UI feedback, 60fps interactions, <5s task operations
**Constraints**: JWT-only auth, no local storage for tasks, optimistic updates with rollback, WCAG 2.1 AA compliance
**Scale/Scope**: Single-user sessions, 50-500 tasks per user, 3 main pages (sign-up, sign-in, dashboard), 8 reusable components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Spec-Driven Development ✅
- [x] Feature has complete spec.md with acceptance criteria
- [x] All requirements documented before implementation
- [x] Plan follows specification requirements

### II. Agentic Workflow ✅
- [x] All implementation via Claude Code agents
- [x] PHRs will be created for all phases
- [x] No manual coding planned

### III. Separation of Concerns ✅
- [x] Frontend communicates with backend only via REST API
- [x] No direct database access from frontend
- [x] Clear API contracts defined
- [x] Authentication handled by Better Auth (separate service)

### IV. Security by Design ✅
- [x] JWT verification on every backend request
- [x] User-scoped task rendering (backend enforces ownership)
- [x] No secrets in frontend code
- [x] 401 errors trigger re-authentication

### V. UI/UX Excellence ✅
- [x] Design system defined (typography, spacing, colors)
- [x] Responsive design 320px-2560px
- [x] WCAG 2.1 AA accessibility requirements
- [x] Loading states, error handling, empty states
- [x] Professional, production-ready appearance

**Result**: ✅ All constitution checks passed. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-frontend/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (technology decisions)
├── data-model.md        # Phase 1 output (entity definitions)
├── quickstart.md        # Phase 1 output (setup instructions)
├── contracts/           # Phase 1 output (API contracts)
│   ├── auth-api.yaml    # Authentication endpoints
│   └── tasks-api.yaml   # Task CRUD endpoints
├── checklists/
│   └── requirements.md  # Spec quality validation (complete)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Web application structure (frontend + backend separation)

backend/
├── src/
│   ├── models/
│   │   ├── user.py          # User model with SQLModel
│   │   └── task.py          # Task model with SQLModel
│   ├── services/
│   │   ├── auth.py          # JWT verification logic
│   │   └── tasks.py         # Task business logic
│   ├── api/
│   │   ├── auth.py          # Authentication endpoints
│   │   └── tasks.py         # Task CRUD endpoints
│   ├── middleware/
│   │   └── jwt_auth.py      # JWT verification middleware
│   └── main.py              # FastAPI application entry
├── tests/
│   ├── test_auth.py
│   └── test_tasks.py
├── alembic/                 # Database migrations
├── .env.example
└── requirements.txt

frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── sign-up/
│   │   │   │   └── page.tsx
│   │   │   └── sign-in/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Landing/redirect page
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── LoadingSkeleton.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ErrorMessage.tsx
│   │   └── tasks/
│   │       ├── TaskItem.tsx
│   │       ├── TaskList.tsx
│   │       ├── TaskForm.tsx
│   │       └── DeleteConfirmation.tsx
│   ├── lib/
│   │   ├── api.ts           # Centralized API client
│   │   ├── auth.ts          # Better Auth integration
│   │   └── types.ts         # TypeScript types
│   └── styles/
│       └── globals.css      # Tailwind + custom styles
├── public/
├── tests/
│   ├── unit/
│   └── e2e/
├── .env.local.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

**Structure Decision**: Web application structure selected due to frontend-backend separation requirement. Frontend uses Next.js App Router for modern React patterns with Server Components where appropriate. Backend uses FastAPI with clear separation of models, services, and API layers. No shared code between frontend and backend - communication only via REST API.

## System Architecture

### 1. Frontend-Backend Interaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Next.js App Router (TypeScript + Tailwind)        │    │
│  │                                                      │    │
│  │  Pages:                                             │    │
│  │  - /sign-up    → Better Auth sign-up flow          │    │
│  │  - /sign-in    → Better Auth sign-in flow          │    │
│  │  - /dashboard  → Task management UI                │    │
│  │                                                      │    │
│  │  Components:                                        │    │
│  │  - UI Components (Button, Input, Modal, etc.)      │    │
│  │  - Task Components (TaskItem, TaskList, etc.)      │    │
│  │                                                      │    │
│  │  API Client (lib/api.ts):                          │    │
│  │  - Centralized HTTP client                         │    │
│  │  - Attaches JWT to Authorization header            │    │
│  │  - Handles 401 → redirect to sign-in               │    │
│  │  - Optimistic updates with rollback                │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS + JWT
                            │
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │  FastAPI (Python + SQLModel)                       │    │
│  │                                                      │    │
│  │  Middleware:                                        │    │
│  │  - JWT Verification (every request)                │    │
│  │  - Extract user_id from JWT claims                 │    │
│  │                                                      │    │
│  │  API Endpoints:                                     │    │
│  │  - POST /api/auth/signup                           │    │
│  │  - POST /api/auth/signin                           │    │
│  │  - GET  /api/tasks         (user-scoped)          │    │
│  │  - POST /api/tasks         (user-scoped)          │    │
│  │  - PUT  /api/tasks/{id}    (user-scoped)          │    │
│  │  - DELETE /api/tasks/{id}  (user-scoped)          │    │
│  │                                                      │    │
│  │  Services:                                          │    │
│  │  - Auth service (JWT generation/validation)        │    │
│  │  - Task service (CRUD with user_id filter)         │    │
│  │                                                      │    │
│  │  Models (SQLModel):                                 │    │
│  │  - User (id, email, hashed_password)               │    │
│  │  - Task (id, user_id, title, description, etc.)    │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ SQLModel ORM
                            │
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE (Neon PostgreSQL)                  │
│                                                               │
│  Tables:                                                      │
│  - users (id, email, hashed_password, created_at)           │
│  - tasks (id, user_id FK, title, description, completed,    │
│           created_at, updated_at)                            │
└─────────────────────────────────────────────────────────────┘
```

### 2. JWT Authentication Flow

```
┌──────────┐                                    ┌──────────┐
│ Frontend │                                    │ Backend  │
└────┬─────┘                                    └────┬─────┘
     │                                                │
     │ 1. POST /api/auth/signup                      │
     │    { email, password }                        │
     ├──────────────────────────────────────────────>│
     │                                                │
     │                                          2. Hash password
     │                                          3. Create user in DB
     │                                          4. Generate JWT
     │                                                │
     │ 5. { token, user }                            │
     │<──────────────────────────────────────────────┤
     │                                                │
     │ 6. Store JWT (Better Auth handles this)       │
     │                                                │
     │ 7. GET /api/tasks                             │
     │    Authorization: Bearer <JWT>                │
     ├──────────────────────────────────────────────>│
     │                                                │
     │                                          8. Verify JWT
     │                                          9. Extract user_id
     │                                          10. Query tasks WHERE user_id=X
     │                                                │
     │ 11. { tasks: [...] }                          │
     │<──────────────────────────────────────────────┤
     │                                                │
     │ 12. POST /api/tasks (invalid/expired JWT)     │
     ├──────────────────────────────────────────────>│
     │                                                │
     │                                          13. JWT verification fails
     │                                                │
     │ 14. 401 Unauthorized                          │
     │<──────────────────────────────────────────────┤
     │                                                │
     │ 15. Redirect to /sign-in                      │
     │                                                │
```

### 3. Database Access Pattern (SQLModel)

**Backend Only** - Frontend has NO direct database access.

```python
# Backend: models/task.py
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime

class Task(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    title: str = Field(max_length=500)
    description: str | None = Field(default=None)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    user: "User" = Relationship(back_populates="tasks")

# Backend: services/tasks.py
def get_user_tasks(user_id: int, session: Session) -> list[Task]:
    """Get all tasks for a specific user - ALWAYS filtered by user_id"""
    return session.exec(
        select(Task).where(Task.user_id == user_id)
    ).all()

def create_task(user_id: int, title: str, description: str | None, session: Session) -> Task:
    """Create task - ALWAYS associated with user_id from JWT"""
    task = Task(user_id=user_id, title=title, description=description)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task
```

## Phased Execution Plan

### Phase 0: Research & Technology Decisions ✅

**Status**: Complete (documented in research.md)

**Decisions Made**:
1. **JWT Storage**: Better Auth handles JWT storage in httpOnly cookies (secure, XSS-protected)
2. **State Management**: React state + Server Components (no Redux/Zustand needed for this scope)
3. **API Client**: Centralized axios-based client with interceptors for JWT and 401 handling
4. **Optimistic Updates**: Implement for toggle/create/edit with rollback on failure
5. **Design System**: Tailwind CSS with custom design tokens (no external UI library needed)

### Phase 1: Backend Foundation

**Goal**: Establish secure, user-isolated backend API

**Tasks**:
1. **Database Models** (backend/src/models/)
   - User model with email, hashed_password
   - Task model with user_id FK, title, description, completed, timestamps
   - Alembic migrations for schema

2. **JWT Verification Middleware** (backend/src/middleware/jwt_auth.py)
   - Verify JWT signature and expiration
   - Extract user_id from JWT claims
   - Attach user_id to request context
   - Return 401 for invalid/missing JWT

3. **Authentication Endpoints** (backend/src/api/auth.py)
   - POST /api/auth/signup: Create user, return JWT
   - POST /api/auth/signin: Verify credentials, return JWT
   - Input validation (email format, password strength)

4. **Task CRUD Endpoints** (backend/src/api/tasks.py)
   - GET /api/tasks: List user's tasks (filtered by JWT user_id)
   - POST /api/tasks: Create task (user_id from JWT)
   - PUT /api/tasks/{id}: Update task (verify ownership)
   - DELETE /api/tasks/{id}: Delete task (verify ownership)
   - All endpoints protected by JWT middleware

**Acceptance Criteria**:
- ✅ All endpoints require valid JWT (401 without)
- ✅ Tasks always filtered by authenticated user_id
- ✅ User A cannot access User B's tasks
- ✅ API returns proper error codes (400, 401, 404, 500)

### Phase 2: Frontend Foundation

**Goal**: Establish design system, layout, and authentication UI

**Tasks**:
1. **Design System Setup** (frontend/src/styles/)
   - Tailwind config with custom colors, spacing, typography
   - CSS variables for semantic colors (primary, error, success, neutral)
   - Typography scale: 12px, 14px, 16px, 20px, 24px, 32px
   - Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px

2. **UI Components** (frontend/src/components/ui/)
   - Button: variants (primary, secondary, danger), states (default, hover, active, disabled, loading)
   - Input: with label, error message, focus states
   - Textarea: for task descriptions
   - Modal: for edit/delete confirmations
   - LoadingSkeleton: for task list loading
   - EmptyState: friendly message when no tasks
   - ErrorMessage: clear, actionable error display

3. **Layout & Navigation** (frontend/src/app/layout.tsx)
   - Root layout with consistent header
   - Responsive container (max-width, centered)
   - Header with app name and logout button (when authenticated)

4. **Authentication Pages** (frontend/src/app/(auth)/)
   - Sign-up page: email + password form, validation, loading state
   - Sign-in page: email + password form, error handling
   - Better Auth integration for JWT management
   - Redirect to dashboard on success
   - Redirect to sign-in when unauthenticated

**Acceptance Criteria**:
- ✅ Design system consistent across all pages
- ✅ All components have proper states (hover, focus, disabled, loading)
- ✅ WCAG 2.1 AA contrast ratios met
- ✅ Responsive 320px-2560px
- ✅ Authentication flow works end-to-end

### Phase 3: Feature Integration (Task CRUD)

**Goal**: Implement task management UI with backend integration

**Tasks**:
1. **API Client** (frontend/src/lib/api.ts)
   - Centralized HTTP client (axios or fetch wrapper)
   - Attach JWT to Authorization header on every request
   - Global 401 interceptor → redirect to /sign-in
   - Error handling with user-friendly messages
   - Optimistic update helpers

2. **Task Components** (frontend/src/components/tasks/)
   - TaskItem: display title, description, completion state, actions (toggle, edit, delete)
   - TaskList: render pending and completed tasks separately
   - TaskForm: create/edit form with validation
   - DeleteConfirmation: modal for delete confirmation

3. **Dashboard Page** (frontend/src/app/dashboard/page.tsx)
   - Fetch tasks on mount (with loading skeleton)
   - Display TaskList with pending/completed sections
   - TaskForm for creating new tasks
   - Handle empty state (no tasks)
   - Handle error state (API failure)

4. **Task Operations**
   - **Create**: Optimistic add to list, rollback on failure
   - **Toggle**: Optimistic move between sections, rollback on failure
   - **Edit**: Modal with pre-filled form, update on save
   - **Delete**: Confirmation modal, optimistic remove, rollback on failure

**Acceptance Criteria**:
- ✅ All CRUD operations work end-to-end
- ✅ JWT attached to every API request
- ✅ User only sees their own tasks
- ✅ Optimistic updates with graceful rollback
- ✅ Clear error messages on failure
- ✅ Loading states for all async operations

### Phase 4: UX & Quality Polish

**Goal**: Refine user experience and ensure production quality

**Tasks**:
1. **Loading States**
   - Skeleton screens for task list loading
   - Button loading spinners during operations
   - Disable inputs during submission
   - No abrupt layout shifts

2. **Error Handling**
   - Network failure messages with retry option
   - Validation errors inline with inputs
   - API error messages user-friendly (not raw error codes)
   - Toast notifications for success/error (optional)

3. **Responsive Refinement**
   - Test on mobile (320px), tablet (768px), desktop (1440px+)
   - Touch-friendly targets (44x44px minimum)
   - Adjust spacing and typography for small screens
   - Ensure modals work on mobile

4. **Accessibility Audit**
   - Keyboard navigation (tab order, enter/escape)
   - Focus indicators visible and clear
   - ARIA labels where needed
   - Semantic HTML (headings, lists, buttons)
   - Color contrast verification (4.5:1 minimum)

5. **Performance Optimization**
   - Code splitting for routes
   - Lazy load modals
   - Optimize re-renders (React.memo where needed)
   - Verify <3s initial load, <100ms UI feedback

**Acceptance Criteria**:
- ✅ Zero layout shifts during normal operation
- ✅ All interactions provide immediate feedback
- ✅ Graceful error handling with retry options
- ✅ Fully responsive and touch-friendly
- ✅ WCAG 2.1 AA compliance verified
- ✅ Performance targets met

## Decisions & Tradeoffs

### 1. JWT User Derivation vs URL user_id

**Decision**: Derive user_id from JWT claims, never from URL parameters

**Rationale**:
- **Security**: URL parameters can be manipulated by users
- **Simplicity**: Single source of truth (JWT) for user identity
- **Enforcement**: Backend middleware extracts user_id before reaching endpoint handlers

**Tradeoff**: Slightly more complex JWT setup, but significantly more secure

**Alternative Rejected**: URL-based user_id (e.g., /api/users/{user_id}/tasks) because it requires additional authorization checks and is prone to IDOR vulnerabilities

### 2. Server Components vs Client Components (Next.js)

**Decision**: Use Client Components for interactive UI, Server Components for static layouts

**Rationale**:
- **Interactivity**: Task CRUD requires client-side state and event handlers
- **Performance**: Server Components for layout reduces client bundle size
- **Simplicity**: Clear separation - interactive = client, static = server

**Tradeoff**: Cannot use Server Components for task list (needs client state for optimistic updates)

**Implementation**:
- Server Components: Root layout, auth page layouts
- Client Components: Dashboard, task components, forms, modals

### 3. Optimistic Updates vs Wait-for-Response

**Decision**: Implement optimistic updates with rollback for toggle/create operations

**Rationale**:
- **UX**: Immediate feedback feels responsive (<100ms requirement)
- **Perceived Performance**: Users don't wait for network round-trip
- **Complexity**: Manageable with proper error handling

**Tradeoff**: More complex state management, need rollback logic

**Alternative Rejected**: Wait for API response before updating UI - feels sluggish, violates <100ms feedback requirement

### 4. Tailwind CSS vs Component Library (MUI, Chakra)

**Decision**: Tailwind CSS with custom components, no external UI library

**Rationale**:
- **Control**: Full control over design system and styling
- **Bundle Size**: Smaller bundle without large UI library
- **Customization**: Easier to match exact design requirements
- **Learning**: Team familiar with Tailwind

**Tradeoff**: Need to build components from scratch (Button, Input, Modal)

**Alternative Rejected**: MUI/Chakra - adds significant bundle size, harder to customize to exact design specs

### 5. Centralized API Client vs Inline Fetch Calls

**Decision**: Centralized API client (lib/api.ts) with interceptors

**Rationale**:
- **DRY**: JWT attachment logic in one place
- **Error Handling**: Global 401 interceptor for re-authentication
- **Consistency**: All API calls follow same pattern
- **Testability**: Easier to mock for tests

**Tradeoff**: Additional abstraction layer

**Alternative Rejected**: Inline fetch calls in components - leads to duplicated JWT logic and inconsistent error handling

### 6. Inline Edit vs Modal Edit

**Decision**: Modal-based edit for tasks

**Rationale**:
- **Focus**: Modal provides dedicated space for editing
- **Validation**: Easier to show validation errors in modal
- **Consistency**: Matches delete confirmation pattern
- **Mobile**: Better UX on small screens

**Tradeoff**: Requires modal component, slightly more clicks

**Alternative Rejected**: Inline edit - harder to implement validation, clutters task list UI

## Validation & Testing Strategy

### 1. Task Ownership Enforcement Verification

**Backend Tests**:
```python
def test_user_cannot_access_other_user_tasks():
    # Create User A and User B
    # User A creates tasks
    # User B attempts to GET /api/tasks with User A's task IDs
    # Assert: 404 or empty list (User B sees no tasks)

def test_user_cannot_update_other_user_task():
    # User A creates task
    # User B attempts PUT /api/tasks/{task_id}
    # Assert: 404 or 403 (not found or forbidden)

def test_user_cannot_delete_other_user_task():
    # User A creates task
    # User B attempts DELETE /api/tasks/{task_id}
    # Assert: 404 or 403
```

**Frontend Tests**:
```typescript
// E2E test with Playwright
test('user only sees their own tasks', async ({ page, context }) => {
  // Sign in as User A, create tasks
  // Sign out, sign in as User B
  // Assert: User B sees empty task list (not User A's tasks)
});
```

### 2. JWT Rejection (401 Cases) Verification

**Backend Tests**:
```python
def test_missing_jwt_returns_401():
    response = client.get("/api/tasks")  # No Authorization header
    assert response.status_code == 401

def test_invalid_jwt_returns_401():
    response = client.get("/api/tasks", headers={"Authorization": "Bearer invalid"})
    assert response.status_code == 401

def test_expired_jwt_returns_401():
    expired_token = generate_expired_jwt()
    response = client.get("/api/tasks", headers={"Authorization": f"Bearer {expired_token}"})
    assert response.status_code == 401
```

**Frontend Tests**:
```typescript
// E2E test
test('expired JWT redirects to sign-in', async ({ page }) => {
  // Mock API to return 401
  await page.route('**/api/tasks', route => route.fulfill({ status: 401 }));

  // Navigate to dashboard
  await page.goto('/dashboard');

  // Assert: Redirected to /sign-in
  await expect(page).toHaveURL('/sign-in');
});
```

### 3. UI Responsiveness & Polish Verification

**Manual Testing Checklist**:
- [ ] Test on Chrome, Firefox, Safari, Edge (latest versions)
- [ ] Test on mobile (320px), tablet (768px), desktop (1440px, 2560px)
- [ ] Verify all buttons have hover, focus, active, disabled states
- [ ] Verify loading states appear during async operations
- [ ] Verify no layout shifts during loading
- [ ] Verify error messages are clear and actionable
- [ ] Verify keyboard navigation works (tab, enter, escape)
- [ ] Verify touch targets are 44x44px minimum on mobile

**Automated Tests**:
```typescript
// Accessibility test
test('dashboard meets WCAG 2.1 AA', async ({ page }) => {
  await page.goto('/dashboard');
  const results = await injectAxe(page);
  expect(results.violations).toHaveLength(0);
});

// Performance test
test('initial load under 3 seconds', async ({ page }) => {
  const start = Date.now();
  await page.goto('/dashboard');
  await page.waitForSelector('[data-testid="task-list"]');
  const duration = Date.now() - start;
  expect(duration).toBeLessThan(3000);
});

// Responsive test
test('dashboard responsive on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/dashboard');
  // Assert: No horizontal scroll, all elements visible
  const hasHorizontalScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
  expect(hasHorizontalScroll).toBe(false);
});
```

**Visual Regression Tests** (optional but recommended):
- Capture screenshots of key pages at different breakpoints
- Compare against baseline to detect unintended visual changes
- Tools: Percy, Chromatic, or Playwright screenshots

### 4. Integration Testing Strategy

**Critical Flows to Test**:
1. **Sign-up → Sign-in → Create Task → View Task**
2. **Create Task → Toggle Complete → Toggle Pending**
3. **Create Task → Edit Task → Save**
4. **Create Task → Delete Task → Confirm**
5. **Network Failure → Retry → Success**
6. **Expired JWT → Redirect to Sign-in → Re-authenticate**

**Test Environment**:
- Backend: Test database with isolated test data
- Frontend: Mock API responses for unit tests, real API for E2E tests
- Authentication: Test JWT tokens with short expiration for testing

## Next Steps

1. **Phase 0 Complete**: Research documented in research.md ✅
2. **Phase 1 Artifacts**: Create data-model.md, contracts/, quickstart.md
3. **Agent Context Update**: Run update-agent-context script
4. **Constitution Re-check**: Verify all gates still pass after design
5. **Ready for /sp.tasks**: Generate atomic task breakdown for implementation

**Estimated Effort**:
- Phase 1 (Backend): 2-3 days
- Phase 2 (Frontend Foundation): 2-3 days
- Phase 3 (Feature Integration): 3-4 days
- Phase 4 (UX Polish): 1-2 days
- **Total**: 8-12 days for full implementation

**Dependencies**:
- Backend must be deployed and accessible before frontend integration testing
- Better Auth configuration must be complete before authentication flow testing
- Design system must be finalized before component implementation
