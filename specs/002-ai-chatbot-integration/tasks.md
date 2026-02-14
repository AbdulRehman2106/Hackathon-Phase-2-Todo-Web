# Tasks: AI Todo Chatbot Integration

**Input**: Design documents from `/specs/002-ai-chatbot-integration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT explicitly requested in the specification, so test tasks are omitted per template guidelines.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Backend: Python 3.11+ with FastAPI, SQLModel, Cohere SDK, MCP SDK
- Frontend: Next.js 16+ with React, TypeScript, Tailwind CSS

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [x] T001 Install Cohere Python SDK in backend/requirements.txt
- [x] T002 Install MCP SDK in backend/requirements.txt (Note: Using custom MCP implementation)
- [x] T003 [P] Install tenacity (retry library) in backend/requirements.txt
- [x] T004 [P] Create backend/src/agents/ directory structure
- [x] T005 [P] Create backend/src/mcp/ directory structure
- [x] T006 [P] Create backend/src/validation/ directory structure
- [x] T007 [P] Create frontend/src/components/chat/ directory structure
- [x] T008 Configure environment variables template in backend/.env.example (COHERE_API_KEY, DATABASE_URL, JWT_SECRET)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Models & Migrations

- [x] T009 [P] Create Conversation model in backend/src/models/conversation.py
- [x] T010 [P] Create Message model in backend/src/models/message.py
- [x] T011 Create Alembic migration for conversations and messages tables in backend/alembic/versions/003_ai_chatbot_tables.py
- [ ] T012 Run database migrations to create new tables

### MCP Server Infrastructure

- [x] T013 Create MCP server initialization in backend/src/mcp/server.py
- [x] T014 Create tool base class with validation in backend/src/mcp/tools/base.py
- [x] T015 Register MCP server in FastAPI app startup in backend/src/main.py

### Cohere Integration

- [x] T016 Create Cohere client service in backend/src/agents/cohere_client.py with API key loading, retry logic, and timeout configuration
- [ ] T017 Create Cohere adapter for OpenAI Agents SDK in backend/src/agents/cohere_adapter.py (SKIPPED - Using Cohere directly)
- [x] T018 Create agent orchestrator in backend/src/agents/orchestrator.py with tool-calling support

### Validation & Security Layer

- [x] T019 [P] Create tool schema validator in backend/src/validation/tool_validator.py with Pydantic models
- [x] T020 [P] Create security guard for user authorization in backend/src/validation/security_guard.py

### Conversation Persistence (US6 Foundation)

- [x] T021 Create conversation service in backend/src/services/conversation_service.py with get_or_create, store_message, load_history methods
- [x] T022 Implement stateless conversation fetch logic in conversation_service.py

### Chat Endpoint Base

- [x] T023 Create chat endpoint skeleton in backend/src/api/chat.py with JWT authentication
- [x] T024 Implement request/response models for chat endpoint in backend/src/api/chat.py
- [x] T025 Add chat endpoint to FastAPI router in backend/src/main.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add Tasks via Natural Language (Priority: P1) 🎯 MVP Core

**Goal**: Users can create new todo tasks by typing natural language commands in a chat interface

**Independent Test**: Send chat message "Add a task to buy groceries tomorrow" and verify new task appears in user's task list with correct title

### Implementation for User Story 1

- [x] T026 [US1] Create add_task MCP tool in backend/src/mcp/tools/add_task.py with user_id validation, DB insertion, structured JSON response, logging, and transaction wrapping
- [x] T027 [US1] Register add_task tool in MCP server in backend/src/mcp/server.py
- [x] T028 [US1] Implement chat endpoint logic for add_task in backend/src/api/chat.py: fetch history, store user message, call orchestrator, validate tool call, execute add_task, store assistant response
- [x] T029 [US1] Add error handling for add_task failures in backend/src/api/chat.py
- [x] T030 [US1] Add logging for add_task operations in backend/src/mcp/tools/add_task.py

**Checkpoint**: At this point, users can add tasks via chat. Test independently before proceeding.

---

## Phase 4: User Story 2 - View Tasks via Conversation (Priority: P1) 🎯 MVP Complete

**Goal**: Users can ask the chatbot to show their tasks using natural language queries with filtering options

**Independent Test**: Ask "Show my tasks" or "What's on my list?" and verify chatbot returns user's current tasks

### Implementation for User Story 2

- [x] T031 [US2] Create list_tasks MCP tool in backend/src/mcp/tools/list_tasks.py with user_id filtering, optional status filter (all/pending/completed), structured array response, and index optimization check
- [x] T032 [US2] Register list_tasks tool in MCP server in backend/src/mcp/server.py
- [x] T033 [US2] Integrate list_tasks tool execution in chat endpoint in backend/src/api/chat.py
- [x] T034 [US2] Add error handling for empty task lists in backend/src/mcp/tools/list_tasks.py
- [x] T035 [US2] Add logging for list_tasks operations in backend/src/mcp/tools/list_tasks.py

**Checkpoint**: At this point, User Stories 1 AND 2 work independently. MVP is complete - users can add and view tasks via chat.

---

## Phase 5: User Story 3 - Complete Tasks via Chat (Priority: P2)

**Goal**: Users can mark tasks as complete by referencing them in natural language, either by task ID or task title

**Independent Test**: Say "Complete task 5" or "Mark grocery shopping as done" and verify task status changes to completed

### Implementation for User Story 3

- [x] T036 [US3] Create complete_task MCP tool in backend/src/mcp/tools/complete_task.py with task ownership validation, completed flag update, updated_at timestamp, and structured confirmation response
- [x] T037 [US3] Implement task title matching logic in complete_task tool for case-insensitive substring matching
- [x] T038 [US3] Register complete_task tool in MCP server in backend/src/mcp/server.py
- [x] T039 [US3] Integrate complete_task tool execution in chat endpoint in backend/src/api/chat.py
- [x] T040 [US3] Add error handling for task not found and ambiguous matches in backend/src/mcp/tools/complete_task.py
- [x] T041 [US3] Add logging for complete_task operations in backend/src/mcp/tools/complete_task.py

**Checkpoint**: User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Delete Tasks via Chat (Priority: P3)

**Goal**: Users can remove tasks from their list by asking the chatbot to delete them, either by task ID or title

**Independent Test**: Say "Delete task 3" or "Remove the meeting task" and verify task is removed from user's list

### Implementation for User Story 4

- [x] T042 [US4] Create delete_task MCP tool in backend/src/mcp/tools/delete_task.py with ownership validation, safe deletion, and structured output
- [x] T043 [US4] Implement task title matching logic in delete_task tool for case-insensitive substring matching
- [x] T044 [US4] Register delete_task tool in MCP server in backend/src/mcp/server.py
- [x] T045 [US4] Integrate delete_task tool execution in chat endpoint in backend/src/api/chat.py
- [x] T046 [US4] Add error handling for task not found and ambiguous matches in backend/src/mcp/tools/delete_task.py
- [x] T047 [US4] Add logging for delete_task operations with proper severity in backend/src/mcp/tools/delete_task.py

**Checkpoint**: User Stories 1-4 should all work independently

---

## Phase 7: User Story 5 - Update Tasks via Chat (Priority: P3)

**Goal**: Users can modify existing task titles or descriptions through natural language commands

**Independent Test**: Say "Change task 5 to 'Call dentist'" and verify task title updates

### Implementation for User Story 5

- [x] T048 [US5] Create update_task MCP tool in backend/src/mcp/tools/update_task.py with ownership validation, title/description update, created_at preservation, and structured JSON response
- [x] T049 [US5] Implement task title matching logic in update_task tool for case-insensitive substring matching
- [x] T050 [US5] Implement partial update support (title only, description only, or both) in backend/src/mcp/tools/update_task.py
- [x] T051 [US5] Register update_task tool in MCP server in backend/src/mcp/server.py
- [x] T052 [US5] Integrate update_task tool execution in chat endpoint in backend/src/api/chat.py
- [x] T053 [US5] Add error handling for task not found and ambiguous matches in backend/src/mcp/tools/update_task.py
- [x] T054 [US5] Add logging for update_task operations in backend/src/mcp/tools/update_task.py

**Checkpoint**: All backend user stories (1-5) should now be independently functional

- [ ] T021 Create conversation service in backend/src/services/conversation_service.py with get_or_create, store_message, load_history methods
- [ ] T022 Implement stateless conversation fetch logic in conversation_service.py

### Chat Endpoint Base

- [ ] T023 Create chat endpoint skeleton in backend/src/api/chat.py with JWT authentication
- [ ] T024 Implement request/response models for chat endpoint in backend/src/api/chat.py
- [ ] T025 Add chat endpoint to FastAPI router in backend/src/main.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add Tasks via Natural Language (Priority: P1) 🎯 MVP Core

**Goal**: Users can create new todo tasks by typing natural language commands in a chat interface

**Independent Test**: Send chat message "Add a task to buy groceries tomorrow" and verify new task appears in user's task list with correct title

### Implementation for User Story 1

- [ ] T026 [US1] Create add_task MCP tool in backend/src/mcp/tools/add_task.py with user_id validation, DB insertion, structured JSON response, logging, and transaction wrapping
- [ ] T027 [US1] Register add_task tool in MCP server in backend/src/mcp/server.py
- [ ] T028 [US1] Implement chat endpoint logic for add_task in backend/src/api/chat.py: fetch history, store user message, call orchestrator, validate tool call, execute add_task, store assistant response
- [ ] T029 [US1] Add error handling for add_task failures in backend/src/api/chat.py
- [ ] T030 [US1] Add logging for add_task operations in backend/src/mcp/tools/add_task.py

**Checkpoint**: At this point, users can add tasks via chat. Test independently before proceeding.

---

## Phase 4: User Story 2 - View Tasks via Conversation (Priority: P1) 🎯 MVP Complete

**Goal**: Users can ask the chatbot to show their tasks using natural language queries with filtering options

**Independent Test**: Ask "Show my tasks" or "What's on my list?" and verify chatbot returns user's current tasks

### Implementation for User Story 2

- [ ] T031 [US2] Create list_tasks MCP tool in backend/src/mcp/tools/list_tasks.py with user_id filtering, optional status filter (all/pending/completed), structured array response, and index optimization check
- [ ] T032 [US2] Register list_tasks tool in MCP server in backend/src/mcp/server.py
- [ ] T033 [US2] Integrate list_tasks tool execution in chat endpoint in backend/src/api/chat.py
- [ ] T034 [US2] Add error handling for empty task lists in backend/src/mcp/tools/list_tasks.py
- [ ] T035 [US2] Add logging for list_tasks operations in backend/src/mcp/tools/list_tasks.py

**Checkpoint**: At this point, User Stories 1 AND 2 work independently. MVP is complete - users can add and view tasks via chat.

---

## Phase 5: User Story 3 - Complete Tasks via Chat (Priority: P2)

**Goal**: Users can mark tasks as complete by referencing them in natural language, either by task ID or task title

**Independent Test**: Say "Complete task 5" or "Mark grocery shopping as done" and verify task status changes to completed

### Implementation for User Story 3

- [ ] T036 [US3] Create complete_task MCP tool in backend/src/mcp/tools/complete_task.py with task ownership validation, completed flag update, updated_at timestamp, and structured confirmation response
- [ ] T037 [US3] Implement task title matching logic in complete_task tool for case-insensitive substring matching
- [ ] T038 [US3] Register complete_task tool in MCP server in backend/src/mcp/server.py
- [ ] T039 [US3] Integrate complete_task tool execution in chat endpoint in backend/src/api/chat.py
- [ ] T040 [US3] Add error handling for task not found and ambiguous matches in backend/src/mcp/tools/complete_task.py
- [ ] T041 [US3] Add logging for complete_task operations in backend/src/mcp/tools/complete_task.py

**Checkpoint**: User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Delete Tasks via Chat (Priority: P3)

**Goal**: Users can remove tasks from their list by asking the chatbot to delete them, either by task ID or title

**Independent Test**: Say "Delete task 3" or "Remove the meeting task" and verify task is removed from user's list

### Implementation for User Story 4

- [ ] T042 [US4] Create delete_task MCP tool in backend/src/mcp/tools/delete_task.py with ownership validation, safe deletion, and structured output
- [ ] T043 [US4] Implement task title matching logic in delete_task tool for case-insensitive substring matching
- [ ] T044 [US4] Register delete_task tool in MCP server in backend/src/mcp/server.py
- [ ] T045 [US4] Integrate delete_task tool execution in chat endpoint in backend/src/api/chat.py
- [ ] T046 [US4] Add error handling for task not found and ambiguous matches in backend/src/mcp/tools/delete_task.py
- [ ] T047 [US4] Add logging for delete_task operations with proper severity in backend/src/mcp/tools/delete_task.py

**Checkpoint**: User Stories 1-4 should all work independently

---

## Phase 7: User Story 5 - Update Tasks via Chat (Priority: P3)

**Goal**: Users can modify existing task titles or descriptions through natural language commands

**Independent Test**: Say "Change task 5 to 'Call dentist'" and verify task title updates

### Implementation for User Story 5

- [ ] T048 [US5] Create update_task MCP tool in backend/src/mcp/tools/update_task.py with ownership validation, title/description update, created_at preservation, and structured JSON response
- [ ] T049 [US5] Implement task title matching logic in update_task tool for case-insensitive substring matching
- [ ] T050 [US5] Implement partial update support (title only, description only, or both) in backend/src/mcp/tools/update_task.py
- [ ] T051 [US5] Register update_task tool in MCP server in backend/src/mcp/server.py
- [ ] T052 [US5] Integrate update_task tool execution in chat endpoint in backend/src/api/chat.py
- [ ] T053 [US5] Add error handling for task not found and ambiguous matches in backend/src/mcp/tools/update_task.py
- [ ] T054 [US5] Add logging for update_task operations in backend/src/mcp/tools/update_task.py

**Checkpoint**: All backend user stories (1-5) should now be independently functional

---

## Phase 8: User Story 6 - Resume Conversations (Priority: P2)

**Goal**: Users can return to chat interface after closing it or restarting the application, and conversation history is preserved

**Independent Test**: Have a conversation, close browser, reopen it, and verify previous messages are still visible

**Note**: Foundation for this was built in Phase 2 (Foundational). This phase validates and tests the stateless architecture.

### Validation for User Story 6

- [ ] T055 [US6] Validate conversation persistence after page refresh in backend/src/services/conversation_service.py
- [ ] T056 [US6] Validate conversation persistence after server restart (manual test with restart procedure)
- [ ] T057 [US6] Add conversation history endpoint GET /api/v1/chat/history in backend/src/api/chat.py
- [ ] T058 [US6] Verify no in-memory state exists (code review of chat endpoint and orchestrator)

**Checkpoint**: Stateless architecture validated - conversation survives restarts

---

## Phase 9: Frontend Chat Interface

**Purpose**: Build React chat UI integrated into dashboard

### Chat Components

- [ ] T059 [P] Create ChatInterface component in frontend/src/components/chat/ChatInterface.tsx with message list, input, and typing indicator
- [ ] T060 [P] Create MessageList component in frontend/src/components/chat/MessageList.tsx with scrollable history and auto-scroll
- [ ] T061 [P] Create MessageInput component in frontend/src/components/chat/MessageInput.tsx with text input and send button
- [ ] T062 [P] Create TypingIndicator component in frontend/src/components/chat/TypingIndicator.tsx for loading state

### Chat Service & Integration

- [ ] T063 Create chat service in frontend/src/services/chatService.ts with API client for POST /api/v1/chat
- [ ] T064 Create chat page in frontend/src/app/dashboard/chat/page.tsx integrating ChatInterface component
- [ ] T065 Implement conversation history loading on page load in frontend/src/components/chat/ChatInterface.tsx
- [ ] T066 Add error state handling in chat interface in frontend/src/components/chat/ChatInterface.tsx
- [ ] T067 Add responsive design for mobile/tablet/desktop in frontend/src/components/chat/ChatInterface.tsx

**Checkpoint**: Frontend chat interface complete and integrated with backend

---

## Phase 10: Error Handling & User Experience

**Purpose**: Comprehensive error handling and user-friendly messaging

### Error Handling Framework

- [ ] T068 [P] Create error formatter in backend/src/services/error_formatter.py to map technical errors to user-friendly messages
- [ ] T069 [P] Implement Cohere failure handler in backend/src/agents/cohere_client.py with timeout fallback and retry logic
- [ ] T070 [P] Add database failure guard with transaction rollback in backend/src/services/conversation_service.py
- [ ] T071 Integrate error formatter in chat endpoint in backend/src/api/chat.py
- [ ] T072 Add error handling for invalid tool calls in backend/src/validation/tool_validator.py
- [ ] T073 Add error handling for unauthorized access in backend/src/validation/security_guard.py

**Checkpoint**: All error scenarios handled gracefully with user-friendly messages

---

## Phase 11: Performance & Logging

**Purpose**: Optimize performance and add comprehensive logging

### Logging Framework

- [ ] T074 [P] Create structured logging configuration in backend/src/config/logging.py
- [ ] T075 [P] Add tool call logging in backend/src/mcp/server.py
- [ ] T076 [P] Add Cohere API latency logging in backend/src/agents/cohere_client.py
- [ ] T077 [P] Add token usage logging in backend/src/agents/cohere_client.py
- [ ] T078 [P] Add error logging with severity levels in backend/src/api/chat.py

### Performance Optimization

- [ ] T079 Verify database indexes on user_id in conversations and messages tables
- [ ] T080 Ensure all FastAPI endpoints use async/await in backend/src/api/chat.py
- [ ] T081 Add database connection pooling configuration in backend/src/config/database.py
- [ ] T082 Optimize conversation history query with limit in backend/src/services/conversation_service.py
- [ ] T083 Validate average response time < 2.5 seconds (performance test)

**Checkpoint**: System meets performance targets and has comprehensive logging

---

## Phase 12: Security Hardening

**Purpose**: Validate and enforce security at all layers

### Security Validation

- [ ] T084 Verify JWT verification on every chat request in backend/src/api/chat.py
- [ ] T085 Verify user_id extraction from JWT matches request context in backend/src/api/chat.py
- [ ] T086 Verify all MCP tools validate task ownership in backend/src/mcp/tools/*.py
- [ ] T087 Verify tool validation layer prevents unauthorized tool calls in backend/src/validation/tool_validator.py
- [ ] T088 Verify database queries include user_id filters in all MCP tools
- [ ] T089 Verify no cross-user data exposure in responses (code review)
- [ ] T090 Verify API keys protected in environment variables (code review)

### Security Testing

- [ ] T091 Test cross-user task access attempt (should fail) - manual security test
- [ ] T092 Test request without JWT (should fail) - manual security test
- [ ] T093 Test request with invalid JWT (should fail) - manual security test
- [ ] T094 Test attempt to access another user's conversation (should fail) - manual security test

**Checkpoint**: All security validations pass - zero cross-user data exposure

---

## Phase 13: Deployment Preparation

**Purpose**: Prepare system for production deployment

### Production Configuration

- [ ] T095 Create production environment configuration in backend/.env.production.example
- [ ] T096 Add HTTPS enforcement configuration in backend/src/config/security.py
- [ ] T097 Add CORS domain allowlist configuration in backend/src/main.py
- [ ] T098 Validate all secrets are in environment variables (code review)

### Migration & Rollback

- [ ] T099 Test database migration on staging environment
- [ ] T100 Create rollback script for database migrations in backend/alembic/versions/
- [ ] T101 Document migration procedure in specs/002-ai-chatbot-integration/quickstart.md

### Restart Resilience

- [ ] T102 Perform restart resilience test: restart server, resume conversation, verify integrity
- [ ] T103 Validate stateless behavior under concurrent requests (load test with 10 concurrent users)

**Checkpoint**: System ready for production deployment

---

## Phase 14: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and documentation

- [ ] T104 [P] Update quickstart.md with final setup instructions in specs/002-ai-chatbot-integration/quickstart.md
- [ ] T105 [P] Add inline code comments for complex logic in backend/src/agents/orchestrator.py
- [ ] T106 [P] Add inline code comments for MCP tools in backend/src/mcp/tools/*.py
- [ ] T107 Code cleanup and formatting (run black and isort on backend)
- [ ] T108 Code cleanup and formatting (run prettier on frontend)
- [ ] T109 Run quickstart.md validation (follow guide to ensure it works)
- [ ] T110 Create deployment checklist in specs/002-ai-chatbot-integration/deployment-checklist.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-8)**: All depend on Foundational phase completion
  - US1 (Phase 3): Can start after Foundational - No dependencies on other stories
  - US2 (Phase 4): Can start after Foundational - No dependencies on other stories (but logically follows US1)
  - US3 (Phase 5): Can start after Foundational - No dependencies on other stories
  - US4 (Phase 6): Can start after Foundational - No dependencies on other stories
  - US5 (Phase 7): Can start after Foundational - No dependencies on other stories
  - US6 (Phase 8): Validation phase - depends on Foundational being complete
- **Frontend (Phase 9)**: Depends on at least US1 and US2 being complete for meaningful testing
- **Error Handling (Phase 10)**: Can start after Foundational - enhances all stories
- **Performance (Phase 11)**: Can start after Foundational - enhances all stories
- **Security (Phase 12)**: Can start after Foundational - validates all stories
- **Deployment (Phase 13)**: Depends on all desired user stories being complete
- **Polish (Phase 14)**: Depends on all other phases being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 6 (P2)**: Foundation built in Phase 2, validation in Phase 8

### Within Each User Story

- MCP tool implementation before registration
- Tool registration before chat endpoint integration
- Core implementation before error handling
- Error handling before logging
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 (Setup)**: Tasks T003, T004, T005, T006, T007 can run in parallel (different directories)
- **Phase 2 (Foundational)**: Tasks T009-T010 (models), T019-T020 (validation) can run in parallel
- **After Foundational**: All user stories (Phases 3-7) can be worked on in parallel by different team members
- **Phase 9 (Frontend)**: Tasks T059-T062 (components) can run in parallel
- **Phase 10 (Error Handling)**: Tasks T068-T070 can run in parallel
- **Phase 11 (Logging)**: Tasks T074-T078 can run in parallel
- **Phase 14 (Polish)**: Tasks T104-T106 can run in parallel

---

## Parallel Example: After Foundational Phase

```bash
# Once Phase 2 (Foundational) is complete, launch user stories in parallel:

# Developer A works on US1 (Add Tasks):
Task T026: Create add_task MCP tool
Task T027: Register add_task tool
Task T028: Implement chat endpoint logic for add_task
Task T029: Add error handling for add_task
Task T030: Add logging for add_task

# Developer B works on US2 (View Tasks):
Task T031: Create list_tasks MCP tool
Task T032: Register list_tasks tool
Task T033: Integrate list_tasks tool execution
Task T034: Add error handling for empty lists
Task T035: Add logging for list_tasks

# Developer C works on US3 (Complete Tasks):
Task T036: Create complete_task MCP tool
Task T037: Implement task title matching
Task T038: Register complete_task tool
Task T039: Integrate complete_task tool execution
Task T040: Add error handling
Task T041: Add logging
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Add Tasks)
4. Complete Phase 4: User Story 2 (View Tasks)
5. **STOP and VALIDATE**: Test US1 and US2 independently
6. Deploy/demo MVP if ready

**MVP Definition**: Users can add tasks and view tasks via natural language chat. This demonstrates core AI chatbot value.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Can add tasks)
3. Add User Story 2 → Test independently → Deploy/Demo (MVP complete!)
4. Add User Story 3 → Test independently → Deploy/Demo (Can complete tasks)
5. Add User Story 4 → Test independently → Deploy/Demo (Can delete tasks)
6. Add User Story 5 → Test independently → Deploy/Demo (Can update tasks)
7. Add Frontend → Test independently → Deploy/Demo (Full UI)
8. Add Error Handling, Performance, Security → Deploy/Demo (Production ready)

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Add Tasks)
   - Developer B: User Story 2 (View Tasks)
   - Developer C: User Story 3 (Complete Tasks)
3. Stories complete and integrate independently
4. Team works on Frontend together
5. Team works on Error Handling, Performance, Security together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Tests are NOT included per specification (no TDD requirement stated)
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Definition of Done

The system is complete when:

- ✅ All 5 MCP tools functional (add, list, complete, delete, update)
- ✅ Cohere API powers reasoning
- ✅ Agents SDK orchestrates tool calls
- ✅ MCP tools handle all DB operations
- ✅ Stateless architecture validated (conversation survives restart)
- ✅ Security constraints enforced (JWT, user isolation, no cross-user access)
- ✅ Frontend chat interface integrated and functional
- ✅ Error handling comprehensive with user-friendly messages
- ✅ Performance targets achieved (< 2.5s response time)
- ✅ Logging captures all operations
- ✅ Production deployment successful
- ✅ No hallucinated task IDs
- ✅ No cross-user data leakage
- ✅ All acceptance scenarios from spec.md pass
