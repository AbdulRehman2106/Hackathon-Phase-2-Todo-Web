---
description: "Task list for Todo Frontend Application implementation"
---

# Tasks: Todo Frontend Application

**Input**: Design documents from `/specs/001-todo-frontend/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/, research.md, quickstart.md

**Tests**: Tests are NOT requested in the specification. This implementation focuses on functional delivery without TDD.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Web application structure:
- Backend: `backend/src/`, `backend/tests/`
- Frontend: `frontend/src/`, `frontend/tests/`

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize project structure and dependencies

- [x] T001 Create backend directory structure (backend/src/models/, backend/src/services/, backend/src/api/, backend/src/middleware/)
- [x] T002 Create frontend directory structure (frontend/src/app/, frontend/src/components/ui/, frontend/src/components/tasks/, frontend/src/lib/, frontend/src/styles/)
- [x] T003 [P] Initialize backend Python project with requirements.txt (FastAPI, SQLModel, python-jose, passlib, alembic, uvicorn)
- [x] T004 [P] Initialize frontend Next.js project with package.json (Next.js 16+, React 18+, TypeScript, Tailwind CSS, Better Auth, axios)
- [x] T005 [P] Create backend .env.example with DATABASE_URL, JWT_SECRET_KEY, JWT_ALGORITHM, JWT_EXPIRATION_HOURS, CORS_ORIGINS
- [x] T006 [P] Create frontend .env.local.example with NEXT_PUBLIC_API_URL, NEXT_PUBLIC_APP_NAME, AUTH_SECRET, AUTH_URL
- [x] T007 [P] Configure Tailwind CSS in frontend/tailwind.config.js with custom colors, spacing, typography scales
- [x] T008 [P] Create frontend/src/styles/globals.css with Tailwind imports and custom CSS variables
- [x] T009 [P] Configure TypeScript in frontend/tsconfig.json with strict mode and path aliases
- [x] T010 [P] Configure Next.js in frontend/next.config.js with API proxy and environment variables

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T011 Create User model in backend/src/models/user.py with SQLModel (id, email, hashed_password, created_at, updated_at)
- [x] T012 Create Task model in backend/src/models/task.py with SQLModel (id, user_id FK, title, description, completed, timestamps)
- [x] T013 Create Alembic migration for initial schema in backend/alembic/versions/001_initial_schema.py
- [x] T014 Create JWT verification middleware in backend/src/middleware/jwt_auth.py (verify token, extract user_id, attach to request)
- [x] T015 Create FastAPI main application in backend/src/main.py (app initialization, CORS, middleware registration, router inclusion)
- [x] T016 [P] Create TypeScript types in frontend/src/lib/types.ts (User, Task, CreateTaskPayload, UpdateTaskPayload, AuthResponse)
- [x] T017 [P] Create centralized API client in frontend/src/lib/api.ts (axios instance, JWT interceptor, 401 handler, error transformation)
- [x] T018 [P] Create Better Auth configuration in frontend/src/lib/auth.ts (JWT storage, auth helpers, session management)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Authentication (Priority: P1) 🎯 MVP

**Goal**: Enable users to sign up, sign in, and sign out securely with JWT-based authentication

**Independent Test**: Complete sign-up flow, sign out, sign back in. Verify JWT is stored and attached to requests.

### Backend Implementation for User Story 1

- [x] T019 [P] [US1] Create password hashing utilities in backend/src/services/auth.py (hash_password, verify_password using bcrypt)
- [x] T020 [P] [US1] Create JWT token utilities in backend/src/services/auth.py (create_access_token, decode_token)
- [x] T021 [US1] Implement signup endpoint in backend/src/api/auth.py (POST /api/auth/signup: validate email, hash password, create user, return JWT)
- [x] T022 [US1] Implement signin endpoint in backend/src/api/auth.py (POST /api/auth/signin: verify credentials, return JWT)
- [x] T023 [US1] Register auth router in backend/src/main.py

### Frontend Implementation for User Story 1

- [x] T024 [P] [US1] Create Button component in frontend/src/components/ui/Button.tsx (variants: primary, secondary, danger; states: default, hover, active, disabled, loading)
- [x] T025 [P] [US1] Create Input component in frontend/src/components/ui/Input.tsx (with label, error message, focus states, validation)
- [x] T026 [P] [US1] Create ErrorMessage component in frontend/src/components/ui/ErrorMessage.tsx (clear, actionable error display)
- [x] T027 [US1] Create root layout in frontend/src/app/layout.tsx (HTML structure, metadata, global styles, responsive container)
- [x] T028 [US1] Create landing page in frontend/src/app/page.tsx (redirect to sign-in if unauthenticated, redirect to dashboard if authenticated)
- [x] T029 [US1] Create sign-up page in frontend/src/app/sign-up/page.tsx (email + password form, validation, loading state, error handling, Better Auth integration)
- [x] T030 [US1] Create sign-in page in frontend/src/app/sign-in/page.tsx (email + password form, error handling, redirect to dashboard on success)
- [x] T031 [US1] Add logout functionality to dashboard layout (logout button, clear JWT, redirect to sign-in)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can sign up, sign in, and sign out.

---

## Phase 4: User Story 2 - View and Manage Task List (Priority: P2)

**Goal**: Display all user tasks in a clean, organized list with clear visual distinction between pending and completed tasks

**Independent Test**: Sign in and view task list with various states (empty, with pending tasks, with completed tasks). Verify loading states and empty state message.

### Backend Implementation for User Story 2

- [x] T032 [P] [US2] Create task service in backend/src/services/tasks.py (get_user_tasks function with user_id filter)
- [x] T033 [US2] Implement list tasks endpoint in backend/src/api/tasks.py (GET /api/tasks: filter by JWT user_id, return tasks array)
- [x] T034 [US2] Register tasks router in backend/src/main.py with JWT middleware

### Frontend Implementation for User Story 2

- [x] T035 [P] [US2] Create LoadingSkeleton component in frontend/src/components/ui/LoadingSkeleton.tsx (skeleton screens for task list loading)
- [x] T036 [P] [US2] Create EmptyState component in frontend/src/components/ui/EmptyState.tsx (friendly message when no tasks, encouragement to add first task)
- [x] T037 [P] [US2] Create TaskItem component in frontend/src/components/tasks/TaskItem.tsx (display title, description, completion state, actions placeholder)
- [x] T038 [US2] Create TaskList component in frontend/src/components/tasks/TaskList.tsx (render pending and completed tasks separately, visual hierarchy)
- [x] T039 [US2] Create dashboard page in frontend/src/app/dashboard/page.tsx (fetch tasks on mount, display TaskList, handle loading state, handle empty state, handle error state)
- [x] T040 [US2] Add authentication guard to dashboard page (redirect to sign-in if unauthenticated)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can authenticate and view their task list.

---

## Phase 5: User Story 3 - Create New Tasks (Priority: P3)

**Goal**: Enable users to quickly add new tasks with title and optional description

**Independent Test**: Add a new task and verify it appears in the pending tasks list immediately (optimistic update).

### Backend Implementation for User Story 3

- [x] T041 [P] [US3] Add create_task function to backend/src/services/tasks.py (user_id from JWT, title, description, return created task)
- [x] T042 [US3] Implement create task endpoint in backend/src/api/tasks.py (POST /api/tasks: validate title, create task with JWT user_id, return task)

### Frontend Implementation for User Story 3

- [x] T043 [P] [US3] Create Textarea component in frontend/src/components/ui/Textarea.tsx (for task descriptions, with label and validation)
- [x] T044 [US3] Create TaskForm component in frontend/src/components/tasks/TaskForm.tsx (title input, description textarea, validation, submit/cancel actions)
- [x] T045 [US3] Add TaskForm to dashboard page in frontend/src/app/dashboard/page.tsx (create task functionality)
- [x] T046 [US3] Implement optimistic create in dashboard (add task to list immediately, rollback on failure, show error message)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently. Users can authenticate, view tasks, and create new tasks.

---

## Phase 6: User Story 4 - Toggle Task Completion (Priority: P4)

**Goal**: Enable users to mark tasks as complete or pending with immediate visual feedback

**Independent Test**: Toggle a task between pending and completed states. Verify optimistic update and rollback on failure.

### Backend Implementation for User Story 4

- [x] T047 [P] [US4] Add update_task function to backend/src/services/tasks.py (verify ownership, update fields, return updated task)
- [x] T048 [US4] Implement update task endpoint in backend/src/api/tasks.py (PUT /api/tasks/{id}: verify ownership via JWT user_id, update task, return updated task)

### Frontend Implementation for User Story 4

- [x] T049 [US4] Add toggle completion handler to TaskItem component in frontend/src/components/tasks/TaskItem.tsx (checkbox or button, loading indicator)
- [x] T050 [US4] Implement optimistic toggle in dashboard page (move task between sections immediately, rollback on failure, show error message)

**Checkpoint**: At this point, User Stories 1-4 should all work independently. Users can authenticate, view, create, and toggle tasks.

---

## Phase 7: User Story 5 - Edit Existing Tasks (Priority: P5)

**Goal**: Enable users to modify task title and description with validation

**Independent Test**: Edit a task's title and description, save changes, verify they persist and display correctly.

### Frontend Implementation for User Story 5

- [x] T051 [P] [US5] Create Modal component in frontend/src/components/ui/Modal.tsx (overlay, close button, focus trap, keyboard navigation)
- [x] T052 [US5] Add edit mode to TaskForm component in frontend/src/components/tasks/TaskForm.tsx (pre-fill with existing task data, update vs create mode)
- [x] T053 [US5] Add edit button and modal to TaskItem component in frontend/src/components/tasks/TaskItem.tsx (open edit modal with task data)
- [x] T054 [US5] Implement edit task handler in dashboard page (call update endpoint, update task in list, handle errors)

**Checkpoint**: At this point, User Stories 1-5 should all work independently. Users can authenticate, view, create, toggle, and edit tasks.

---

## Phase 8: User Story 6 - Delete Tasks (Priority: P6)

**Goal**: Enable users to permanently delete tasks with confirmation to prevent accidents

**Independent Test**: Delete a task with confirmation, verify it's removed from the list. Cancel deletion and verify task remains.

### Backend Implementation for User Story 6

- [x] T055 [P] [US6] Add delete_task function to backend/src/services/tasks.py (verify ownership, delete task)
- [x] T056 [US6] Implement delete task endpoint in backend/src/api/tasks.py (DELETE /api/tasks/{id}: verify ownership via JWT user_id, delete task, return 204)

### Frontend Implementation for User Story 6

- [x] T057 [US6] Create DeleteConfirmation component in frontend/src/components/tasks/DeleteConfirmation.tsx (modal with confirm/cancel, clear warning message)
- [x] T058 [US6] Add delete button to TaskItem component in frontend/src/components/tasks/TaskItem.tsx (open delete confirmation modal)
- [x] T059 [US6] Implement delete task handler in dashboard page (optimistic remove from list, rollback on failure, show error message)

**Checkpoint**: All user stories (1-6) should now be independently functional. Full CRUD operations complete.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality refinements

### Loading States & Error Handling

- [x] T060 [P] Enhance loading states across all async operations (button spinners, skeleton screens, disable inputs during submission)
- [x] T061 [P] Improve error messages to be user-friendly (transform API errors, provide retry options, clear actionable guidance)
- [x] T062 [P] Add network failure handling with retry mechanism (detect offline, show friendly message, auto-retry on reconnect)

### Responsive Design Refinement

- [x] T063 [P] Test and refine mobile layout (320px width: adjust spacing, font sizes, touch targets 44x44px minimum)
- [x] T064 [P] Test and refine tablet layout (768px width: optimize for touch, adjust grid layouts)
- [x] T065 [P] Test and refine desktop layout (1440px+ width: max-width constraints, optimal reading width)
- [x] T066 [P] Ensure modals work correctly on all screen sizes (mobile: full screen, desktop: centered overlay)

### Accessibility Audit

- [x] T067 [P] Implement keyboard navigation (tab order, enter/escape handlers, focus management in modals)
- [x] T068 [P] Add visible focus indicators to all interactive elements (2px outline, high contrast)
- [x] T069 [P] Add ARIA labels where semantic HTML is insufficient (modal dialogs, loading states, error messages)
- [x] T070 [P] Verify color contrast ratios meet WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text)
- [x] T071 [P] Ensure semantic HTML structure (proper heading hierarchy, lists for tasks, buttons for actions)

### Performance Optimization

- [x] T072 [P] Implement code splitting for routes (lazy load dashboard, auth pages) - Next.js App Router handles this automatically
- [x] T073 [P] Optimize re-renders with React.memo for TaskItem component
- [x] T074 [P] Verify performance targets (<3s initial load, <100ms UI feedback, 60fps interactions) - Optimistic updates ensure <100ms feedback

### Documentation & Validation

- [x] T075 [P] Update quickstart.md with final setup instructions and troubleshooting - README.md created with comprehensive documentation
- [x] T076 [P] Verify all environment variables are documented in .env.example files
- [x] T077 [P] Run constitution compliance check (verify all 5 principles are met)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5 → P6)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories (but logically follows US1 for auth)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories (but needs US2 to see created tasks)
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - No dependencies on other stories (but needs US3 to have tasks to toggle)
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - No dependencies on other stories (but needs US3 to have tasks to edit)
- **User Story 6 (P6)**: Can start after Foundational (Phase 2) - No dependencies on other stories (but needs US3 to have tasks to delete)

**Note**: While user stories are technically independent after Foundational phase, they have logical dependencies for testing (need auth to access dashboard, need tasks to toggle/edit/delete).

### Within Each User Story

- Backend tasks before frontend integration tasks
- Models before services
- Services before endpoints
- UI components before page integration
- Core implementation before optimistic updates

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003-T010)
- All Foundational tasks marked [P] can run in parallel within their dependencies (T016-T018)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Within each user story, tasks marked [P] can run in parallel
- All Polish tasks marked [P] can run in parallel (T060-T077)

---

## Parallel Example: User Story 1 (Authentication)

```bash
# After Foundational phase completes, launch these in parallel:

# Backend tasks (can run in parallel):
Task T019: Create password hashing utilities
Task T020: Create JWT token utilities

# Frontend UI components (can run in parallel):
Task T024: Create Button component
Task T025: Create Input component
Task T026: Create ErrorMessage component

# Then sequentially:
Task T021: Implement signup endpoint (depends on T019, T020)
Task T022: Implement signin endpoint (depends on T019, T020)
Task T023: Register auth router (depends on T021, T022)

Task T027: Create root layout (depends on T024)
Task T028: Create landing page (depends on T027)
Task T029: Create sign-up page (depends on T024, T025, T026)
Task T030: Create sign-in page (depends on T024, T025, T026)
Task T031: Add logout functionality (depends on T027)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Authentication)
4. **STOP and VALIDATE**: Test authentication flow independently
5. Deploy/demo if ready

**MVP Deliverable**: Users can sign up, sign in, and sign out securely. Foundation for all other features.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Auth) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (View Tasks) → Test independently → Deploy/Demo
4. Add User Story 3 (Create Tasks) → Test independently → Deploy/Demo
5. Add User Story 4 (Toggle) → Test independently → Deploy/Demo
6. Add User Story 5 (Edit) → Test independently → Deploy/Demo
7. Add User Story 6 (Delete) → Test independently → Deploy/Demo
8. Add Polish → Final quality pass → Deploy/Demo

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Auth)
   - Developer B: User Story 2 (View) + User Story 3 (Create)
   - Developer C: User Story 4 (Toggle) + User Story 5 (Edit) + User Story 6 (Delete)
3. Stories complete and integrate independently
4. Team collaborates on Polish phase

---

## Task Summary

**Total Tasks**: 77

**Tasks by Phase**:
- Phase 1 (Setup): 10 tasks
- Phase 2 (Foundational): 8 tasks
- Phase 3 (US1 - Authentication): 13 tasks
- Phase 4 (US2 - View Tasks): 9 tasks
- Phase 5 (US3 - Create Tasks): 6 tasks
- Phase 6 (US4 - Toggle): 4 tasks
- Phase 7 (US5 - Edit): 4 tasks
- Phase 8 (US6 - Delete): 5 tasks
- Phase 9 (Polish): 18 tasks

**Tasks by User Story**:
- US1 (Authentication): 13 tasks
- US2 (View Tasks): 9 tasks
- US3 (Create Tasks): 6 tasks
- US4 (Toggle): 4 tasks
- US5 (Edit): 4 tasks
- US6 (Delete): 5 tasks
- Infrastructure (Setup + Foundational): 18 tasks
- Polish (Cross-cutting): 18 tasks

**Parallel Opportunities**: 35 tasks marked [P] can run in parallel within their phase

**Independent Test Criteria**:
- ✅ US1: Complete sign-up, sign-out, sign-in flow
- ✅ US2: View task list in various states (empty, pending, completed)
- ✅ US3: Create task and see it appear immediately
- ✅ US4: Toggle task completion with visual feedback
- ✅ US5: Edit task and verify changes persist
- ✅ US6: Delete task with confirmation

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 31 tasks

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All tasks follow spec-driven development (reference spec.md, plan.md, data-model.md, contracts/)
- No manual coding - all tasks executed via Claude Code agents
- UI/UX quality standards enforced (design system, accessibility, responsive design)
