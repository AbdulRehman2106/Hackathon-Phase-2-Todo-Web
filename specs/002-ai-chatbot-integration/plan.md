# Implementation Plan: AI Todo Chatbot Integration

**Branch**: `002-ai-chatbot-integration` | **Date**: 2026-02-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-ai-chatbot-integration/spec.md`

## Summary

Integrate an AI-powered chatbot into the existing Todo application that enables users to manage tasks through natural language conversation. The chatbot will use Cohere API for reasoning, MCP (Model Context Protocol) tools for task operations, and maintain stateless architecture with all conversation context persisted in PostgreSQL. Users will be able to create, view, complete, delete, and update tasks through conversational commands while maintaining strict user isolation and security.

## Technical Context

**Language/Version**: Python 3.11+ (Backend), TypeScript 5.x (Frontend)
**Primary Dependencies**:
- Backend: FastAPI, SQLModel, OpenAI Agents SDK (adapted for Cohere), MCP SDK, Cohere Python SDK
- Frontend: Next.js 16+ (App Router), React, Tailwind CSS, Better Auth

**Storage**: PostgreSQL (Neon Serverless) via SQLModel ORM
**Testing**: pytest (backend), Jest/React Testing Library (frontend)
**Target Platform**: Web application (Linux server backend, browser frontend)
**Project Type**: Web (frontend + backend)
**Performance Goals**:
- < 2.5 seconds average AI response time
- Support 100 concurrent chat users
- 95% of requests under 2.5s

**Constraints**:
- Stateless architecture (no in-memory session state)
- All conversation context in database
- AI operates exclusively via MCP tools (no direct DB access)
- User isolation enforced at all layers
- JWT authentication required for all requests

**Scale/Scope**:
- Multi-user SaaS application
- Unlimited conversation history retention
- 5 core MCP tools (add, list, complete, delete, update tasks)
- Single orchestrator agent pattern

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Spec-Driven Development (NON-NEGOTIABLE)
- [x] Feature has complete spec.md with acceptance criteria
- [x] Implementation will follow approved specification
- [x] No code changes without spec documentation

### ✅ Agentic Workflow
- [x] All implementation via Claude Code agents
- [x] PHRs will be created for all significant work
- [x] No manual file edits permitted

### ✅ Separation of Concerns
- [x] Frontend communicates with backend only via REST API
- [x] Backend accesses database only via SQLModel ORM
- [x] AI chatbot interacts with system exclusively via MCP tools
- [x] No direct database access from AI layer
- [x] Clear layer boundaries maintained

### ✅ Security by Design (NON-NEGOTIABLE)
- [x] JWT verification on every chat request
- [x] User isolation enforced in all MCP tools
- [x] No cross-user task access possible
- [x] All secrets via environment variables
- [x] Database queries include user_id filters
- [x] Tool validation layer before execution

### ✅ UI/UX Excellence
- [x] Chat interface integrated seamlessly into dashboard
- [x] Typing indicators during AI processing
- [x] Clear message history display
- [x] Responsive design for mobile/tablet/desktop
- [x] Accessible and professional appearance

### ✅ Stateless AI Architecture (NON-NEGOTIABLE)
- [x] No in-memory conversation state storage
- [x] All conversation context persisted in database
- [x] AI interacts exclusively via MCP tools
- [x] No direct database manipulation by LLM
- [x] Every request independently reproducible
- [x] Conversation resumes correctly after server restart

**Gate Status**: ✅ PASSED - All constitutional requirements satisfied

## Project Structure

### Documentation (this feature)

```text
specs/002-ai-chatbot-integration/
├── spec.md              # Feature specification (COMPLETE)
├── plan.md              # This file (IN PROGRESS)
├── research.md          # Phase 0 output (PENDING)
├── data-model.md        # Phase 1 output (PENDING)
├── quickstart.md        # Phase 1 output (PENDING)
├── contracts/           # Phase 1 output (PENDING)
│   ├── chat-api.yaml    # OpenAPI spec for chat endpoint
│   └── mcp-tools.json   # MCP tool schemas
└── tasks.md             # Phase 2 output via /sp.tasks (NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── conversation.py      # NEW: Conversation model
│   │   ├── message.py           # NEW: Message model
│   │   └── task.py              # EXISTING: Task model
│   ├── api/
│   │   ├── chat.py              # NEW: Chat endpoint
│   │   └── tasks.py             # EXISTING: Task CRUD endpoints
│   ├── agents/
│   │   ├── cohere_runner.py     # NEW: Cohere API integration
│   │   └── orchestrator.py      # NEW: Agent orchestration logic
│   ├── mcp/
│   │   ├── server.py            # NEW: MCP server initialization
│   │   └── tools/
│   │       ├── add_task.py      # NEW: Add task tool
│   │       ├── list_tasks.py    # NEW: List tasks tool
│   │       ├── complete_task.py # NEW: Complete task tool
│   │       ├── delete_task.py   # NEW: Delete task tool
│   │       └── update_task.py   # NEW: Update task tool
│   ├── validation/
│   │   ├── tool_validator.py    # NEW: Tool call validation
│   │   └── security_guard.py    # NEW: User authorization checks
│   └── services/
│       ├── conversation_service.py  # NEW: Conversation persistence
│       └── task_service.py          # EXISTING: Task operations
└── tests/
    ├── test_chat_endpoint.py        # NEW: Chat API tests
    ├── test_mcp_tools.py            # NEW: MCP tool tests
    ├── test_cohere_integration.py   # NEW: Cohere API tests
    └── test_security.py             # NEW: Security validation tests

frontend/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   └── chat/
│   │   │       └── page.tsx     # NEW: Chat interface page
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts     # NEW: Chat API proxy (optional)
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx    # NEW: Main chat component
│   │   │   ├── MessageList.tsx      # NEW: Message history display
│   │   │   ├── MessageInput.tsx     # NEW: User input component
│   │   │   └── TypingIndicator.tsx  # NEW: Loading state component
│   │   └── tasks/                   # EXISTING: Task components
│   └── services/
│       └── chatService.ts           # NEW: Chat API client
└── tests/
    └── chat/
        ├── ChatInterface.test.tsx   # NEW: Chat component tests
        └── chatService.test.ts      # NEW: Chat service tests
```

**Structure Decision**: Web application structure with clear frontend/backend separation. Backend implements stateless chat endpoint with MCP tool integration. Frontend adds chat interface to existing dashboard. All AI logic contained in backend/src/agents/ and backend/src/mcp/ directories to maintain separation of concerns.

## Complexity Tracking

> No constitutional violations requiring justification. All complexity is inherent to the feature requirements and aligns with constitutional principles.

## Architecture Overview

### Request Flow

```
User Message
    ↓
Frontend Chat Interface
    ↓
POST /api/v1/chat (with JWT)
    ↓
FastAPI Chat Endpoint
    ├── Verify JWT
    ├── Fetch conversation history from DB
    ├── Store user message in DB
    ↓
Agents SDK Orchestrator
    ├── Build message array (history + new message)
    ├── Call Cohere API for reasoning
    ↓
Cohere API Response (with tool call decision)
    ↓
Tool Validation Layer
    ├── Validate tool name
    ├── Validate parameters
    ├── Verify user authorization
    ↓
MCP Tool Execution
    ├── Execute tool (add_task, list_tasks, etc.)
    ├── Return structured JSON result
    ↓
Store Assistant Response in DB
    ↓
Return Response to Frontend
    ↓
Display in Chat Interface
```

### Key Architectural Guarantees

1. **Stateless Operation**: No server memory storage; all context in PostgreSQL
2. **Tool-Only AI Access**: AI cannot directly query or modify database
3. **User Isolation**: Every tool call validates user_id matches authenticated user
4. **Conversation Persistence**: All messages stored before and after AI processing
5. **Restart Resilience**: Conversation resumes correctly after server restart
6. **Security First**: JWT verification and user authorization at every layer

## Implementation Phases

### Phase 0: Research & Technology Validation

**Objective**: Resolve all technical unknowns and validate integration patterns

**Research Tasks**:
1. Cohere API tool-calling format and compatibility with OpenAI Agents SDK
2. MCP SDK Python implementation patterns and best practices
3. Stateless conversation management patterns in FastAPI
4. Cohere API rate limits, retry strategies, and error handling
5. Database schema design for conversation persistence
6. Tool validation patterns to prevent hallucinated tool calls

**Deliverable**: `research.md` with decisions, rationale, and alternatives for each research area

### Phase 1: Design & Contracts

**Objective**: Define data models, API contracts, and integration patterns

**Design Artifacts**:
1. **data-model.md**: Database schema for Conversation and Message entities
2. **contracts/chat-api.yaml**: OpenAPI specification for chat endpoint
3. **contracts/mcp-tools.json**: JSON schemas for all 5 MCP tools
4. **quickstart.md**: Developer guide for running and testing the chatbot

**Key Design Decisions**:
- Conversation model: user_id, created_at, updated_at
- Message model: conversation_id, user_id, role (user/assistant), content, timestamp
- Chat endpoint: POST /api/v1/chat with JWT authentication
- MCP tool schemas: Strict JSON validation for all parameters
- Error response format: User-friendly messages with internal logging

**Deliverable**: Complete design documentation ready for implementation

### Phase 2: Infrastructure Preparation

**Objective**: Set up Cohere integration, MCP server, and database models

**Tasks**:
1. Add Cohere Python SDK to backend dependencies
2. Add MCP SDK to backend dependencies
3. Configure COHERE_API_KEY in environment variables
4. Create Conversation and Message SQLModel models
5. Generate database migrations for new tables
6. Set up structured logging for AI operations
7. Create MCP server initialization module

**Acceptance Criteria**:
- Cohere API reachable and authenticated
- MCP SDK initialized successfully
- Database tables created
- Logging captures all AI operations

### Phase 3: MCP Tool Implementation

**Objective**: Implement all 5 MCP tools with strict validation

**Tools to Implement**:
1. **add_task**: Create new task for authenticated user
2. **list_tasks**: Retrieve tasks filtered by user_id (all/pending/completed)
3. **complete_task**: Mark task as completed (by ID or title match)
4. **delete_task**: Remove task (by ID or title match)
5. **update_task**: Modify task title/description (by ID or title match)

**Tool Requirements** (each tool):
- Accept user_id parameter
- Validate user owns the task (for operations on existing tasks)
- Return structured JSON response
- Be completely stateless
- Log all operations with severity levels
- Handle errors gracefully with user-friendly messages

**Acceptance Criteria**:
- All 5 tools tested independently
- User isolation verified for each tool
- Error handling covers all edge cases
- Tool responses follow consistent schema

### Phase 4: Agents SDK + Cohere Bridge

**Objective**: Integrate Cohere API with Agents SDK for tool-calling

**Tasks**:
1. Create Cohere API client wrapper
2. Adapt OpenAI Agents SDK to use Cohere endpoints
3. Ensure tool-calling JSON format compatibility
4. Implement deterministic temperature (0.2-0.4)
5. Add retry logic for rate limits and transient failures
6. Log token usage and API latency
7. Create orchestrator module to coordinate agent execution

**Acceptance Criteria**:
- Agent correctly triggers MCP tools via Cohere
- Tool call format validated and parsed correctly
- Retry logic handles transient failures
- Token usage logged for all requests
- No hallucinated tool calls or parameters

### Phase 5: Chat Endpoint Integration

**Objective**: Implement stateless chat endpoint with full lifecycle

**Request Lifecycle**:
1. Receive POST /api/v1/chat with JWT and message
2. Verify JWT and extract user_id
3. Fetch conversation history from database
4. Store user message in database
5. Build message array (history + new message)
6. Run agent orchestrator with Cohere
7. Validate tool call (if any)
8. Execute MCP tool (if tool call present)
9. Store assistant response in database
10. Return structured response to client

**Acceptance Criteria**:
- Fully functional /api/v1/chat endpoint
- Stateless operation verified
- Conversation history correctly loaded
- User isolation enforced
- Error handling for all failure modes
- Response time < 2.5s for 95% of requests

### Phase 6: Frontend Chat Interface

**Objective**: Build React chat UI integrated into dashboard

**Components**:
1. **ChatInterface**: Main container component
2. **MessageList**: Scrollable message history
3. **MessageInput**: Text input with send button
4. **TypingIndicator**: Loading state during AI processing

**Features**:
- Display conversation history on load
- Send messages to backend chat endpoint
- Show typing indicator during processing
- Auto-scroll to latest message
- Responsive design for all screen sizes
- Accessible keyboard navigation

**Acceptance Criteria**:
- Chat interface integrated into dashboard
- Messages sent and received correctly
- Conversation history loads on page load
- UI responsive and accessible
- Error states handled gracefully

### Phase 7: Security Hardening

**Objective**: Validate and enforce security at all layers

**Security Validations**:
1. JWT verification on every chat request
2. User_id extraction from JWT matches request context
3. MCP tools validate user owns tasks before operations
4. Tool validation layer prevents unauthorized tool calls
5. Database queries include user_id filters
6. No cross-user data exposure in responses
7. API keys protected in environment variables

**Security Tests**:
- Attempt cross-user task access (should fail)
- Send request without JWT (should fail)
- Send request with invalid JWT (should fail)
- Attempt to access another user's conversation (should fail)
- Verify tool calls validate user authorization

**Acceptance Criteria**:
- All security tests pass
- Zero cross-user data exposure
- JWT verification enforced
- Tool authorization validated

### Phase 8: Testing & Validation

**Objective**: Comprehensive testing across all layers

**Functional Tests**:
- Add task via chat
- List tasks (all/pending/completed) via chat
- Complete task by ID via chat
- Complete task by title match via chat
- Delete task by ID via chat
- Delete task by title match via chat
- Update task via chat
- Resume conversation after page refresh
- Resume conversation after server restart

**Failure Simulation Tests**:
- Invalid task_id provided
- Task not found
- Unauthorized access attempt
- Cohere API timeout
- Cohere API rate limit
- MCP tool validation failure
- Database connection failure
- Empty message sent
- Very long message sent (>1000 chars)

**Load Tests**:
- 100 concurrent chat users
- Rapid successive messages from same user
- Very long conversation history (>100 messages)

**Acceptance Criteria**:
- All functional tests pass
- All failure scenarios handled gracefully
- Load tests meet performance targets
- System passes all validation criteria

## Critical Decisions & Tradeoffs

### Decision 1: Cohere vs OpenAI Direct
**Chosen**: Cohere API
**Rationale**: Unified LLM provider strategy, cost optimization, and vendor diversification
**Tradeoff**: Requires adapter layer for OpenAI Agents SDK compatibility
**Alternative Rejected**: Direct OpenAI API (vendor lock-in, higher cost)

### Decision 2: Single Orchestrator vs Multi-Agent
**Chosen**: Single orchestrator agent
**Rationale**: Simplicity, determinism, easier debugging, sufficient for task management domain
**Tradeoff**: Less flexible for complex multi-step workflows
**Alternative Rejected**: Multi-agent system (unnecessary complexity for current scope)

### Decision 3: Stateless DB Persistence vs In-Memory
**Chosen**: Stateless with database persistence
**Rationale**: Horizontal scalability, zero-downtime deployments, restart resilience
**Tradeoff**: Slightly higher latency per request (database round-trips)
**Alternative Rejected**: In-memory state (not production-ready, loses data on restart)

### Decision 4: Integrated MCP Server vs Separate Service
**Chosen**: Integrated MCP server inside FastAPI backend
**Rationale**: Lower latency, simpler deployment, fewer network hops
**Tradeoff**: Tighter coupling between API and tool execution
**Alternative Rejected**: Separate MCP service (added complexity, network latency)

### Decision 5: Strict JSON Enforcement vs Flexible Parsing
**Chosen**: Strict JSON schema validation for all tool calls
**Rationale**: Prevents hallucinated tool calls, ensures data integrity, clear error messages
**Tradeoff**: More rigid, requires careful schema design
**Alternative Rejected**: Flexible parsing (risk of hallucinations, data corruption)

## Risk Mitigation

### Risk: Cohere JSON Inconsistency
**Impact**: Tool calls fail or produce incorrect results
**Probability**: Medium
**Mitigation**:
- Strict response schema enforcement
- Validation layer before tool execution
- Comprehensive error handling and logging
- Fallback to clarification questions on parse failure

### Risk: Tool Misuse or Hallucination
**Impact**: Incorrect task operations, data corruption
**Probability**: Medium
**Mitigation**:
- Validation layer before all tool executions
- User authorization checks in every tool
- Structured JSON schemas with strict validation
- Logging all tool calls for audit

### Risk: Race Conditions in Concurrent Requests
**Impact**: Data inconsistency, lost updates
**Probability**: Low
**Mitigation**:
- Database transactions for all mutations
- Optimistic locking where appropriate
- Stateless architecture prevents session conflicts

### Risk: Unauthorized Cross-User Access
**Impact**: Critical security breach, data exposure
**Probability**: Low (with proper implementation)
**Mitigation**:
- JWT verification on every request
- User_id validation in all MCP tools
- Database queries always filtered by user_id
- Security testing in every phase
- Code review focused on authorization

### Risk: Performance Degradation Under Load
**Impact**: Poor user experience, timeouts
**Probability**: Medium
**Mitigation**:
- Cohere API retry logic with exponential backoff
- Database connection pooling
- Efficient query patterns (indexed user_id)
- Load testing before production deployment
- Horizontal scaling capability (stateless design)

### Risk: Conversation History Growth
**Impact**: Slow queries, high storage costs
**Probability**: Low (long-term)
**Mitigation**:
- Indexed queries on conversation_id and user_id
- Pagination for very long conversations (future)
- Archival strategy for old conversations (future)
- Monitor database size and query performance

## Validation Strategy

### Acceptance Criteria Validation

**Must Verify**:
- ✓ All tool calls logged with timestamp, user_id, tool name, parameters
- ✓ No hallucinated task IDs (all task references validated against database)
- ✓ user_id isolation enforced (security tests confirm no cross-user access)
- ✓ Restart does not break conversation (test: restart server, reload page, verify history)
- ✓ Cohere failures handled gracefully (test: simulate API failure, verify user-friendly error)
- ✓ No direct DB access from AI layer (code review: AI only calls MCP tools)

### Automated Testing Requirements

**Tool Schema Validation**:
- Unit tests for each tool's JSON schema
- Validation of required parameters
- Validation of parameter types
- Validation of response structure

**Security Guard**:
- Unit tests for JWT verification
- Unit tests for user_id extraction
- Unit tests for authorization checks
- Integration tests for cross-user access prevention

**Error Formatter**:
- Unit tests for error message generation
- Verification of no stack traces in user-facing errors
- Verification of internal logging with full details

**Conversation Persistence Logic**:
- Unit tests for message storage
- Unit tests for conversation history retrieval
- Integration tests for conversation resumption
- Integration tests for restart resilience

## Deployment Strategy

### Step 1: Backend Deployment with Cohere Integration
- Deploy backend with new models, endpoints, and MCP tools
- Configure COHERE_API_KEY in production environment
- Run database migrations to create conversation and message tables
- Verify Cohere API connectivity
- Smoke test: Send test chat message, verify tool execution

### Step 2: Frontend Chat UI Deployment
- Deploy frontend with chat interface components
- Integrate chat UI into existing dashboard
- Configure API endpoint URLs
- Verify chat interface loads correctly
- Smoke test: Send message from UI, verify response

### Step 3: Environment Configuration
- Verify all environment variables set correctly
- Verify JWT secret matches between frontend and backend
- Verify database connection string correct
- Verify Cohere API key valid and has sufficient quota

### Step 4: Restart Resilience Test
- Send several chat messages to create conversation history
- Restart backend server
- Reload frontend page
- Verify conversation history loads correctly
- Send new message and verify it continues the conversation

### Step 5: Monitoring and Observability
- Monitor logs for first 48 hours
- Track Cohere API latency and token usage
- Monitor error rates and types
- Track user adoption and engagement
- Set up alerts for critical errors

## Completion Definition

Project considered complete when ALL of the following are true:

### Core Functionality
- [ ] Users can add tasks via natural language chat
- [ ] Users can list tasks (all/pending/completed) via chat
- [ ] Users can complete tasks by ID or title via chat
- [ ] Users can delete tasks by ID or title via chat
- [ ] Users can update tasks via chat
- [ ] Conversation history persists across page refreshes
- [ ] Conversation history persists across server restarts

### Architecture & Quality
- [ ] AI chatbot fully operational with Cohere API
- [ ] All 5 MCP tools functional and tested
- [ ] Stateless architecture validated (no in-memory state)
- [ ] Security constraints enforced (JWT, user isolation)
- [ ] Performance targets achieved (< 2.5s response time)
- [ ] Codebase documented with clear comments
- [ ] All tests passing (unit, integration, security)

### Production Readiness
- [ ] Production deployment successful
- [ ] Environment variables configured correctly
- [ ] Monitoring and logging operational
- [ ] Error handling covers all edge cases
- [ ] User-friendly error messages for all failure modes
- [ ] No cross-user data exposure (security audit passed)

### Documentation
- [ ] research.md complete with all decisions documented
- [ ] data-model.md complete with schema definitions
- [ ] contracts/ directory contains all API and tool schemas
- [ ] quickstart.md provides clear developer onboarding
- [ ] tasks.md generated via /sp.tasks (Phase 2 output)
- [ ] PHRs created for all significant implementation work

---

**Next Steps**:
1. Execute Phase 0 research to resolve technical unknowns
2. Generate research.md with findings and decisions
3. Execute Phase 1 design to create data models and contracts
4. Update agent context with new technologies
5. Proceed to /sp.tasks for task breakdown
