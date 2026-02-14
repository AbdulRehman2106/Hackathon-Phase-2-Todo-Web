---
id: 002
title: Integrate AI Chatbot Architecture Principles
stage: constitution
date: 2026-02-15
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: ar204
command: /sp.constitution
labels: ["constitution", "ai-chatbot", "cohere", "mcp", "stateless-architecture"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - none
---

## Prompt

Project: AI-Powered Todo Chatbot Integration into Existing Full-Stack Application

Objective:
Integrate a production-grade AI Todo Chatbot into the existing FastAPI + PostgreSQL full-stack backend.
The chatbot must operate via MCP tool architecture and use Cohere API as the LLM provider.
OpenAI Agents SDK orchestration logic must be adapted to execute using Cohere API instead of OpenAI models.

========================================================
CORE ARCHITECTURAL PRINCIPLES
========================================================

1. Stateless Server Architecture
   - No in-memory state storage.
   - All conversation context persisted in PostgreSQL.
   - Every request independently reproducible.

2. Tool-Driven AI Execution
   - AI must interact with system exclusively via MCP tools.
   - No direct database manipulation by LLM.
   - Tools serve as strict execution boundary.

3. Strict Separation of Concerns
   - Chat endpoint = orchestration only.
   - MCP server = task operation layer.
   - Cohere API = reasoning engine.
   - Database = single source of truth.

4. Security by Design
   - user_id must always be authenticated.
   - Zero cross-user access allowed.
   - All tool calls validated before execution.
   - No exposure of internal system details.

5. Deterministic Behavior
   - Structured JSON outputs from AI.
   - Tool calls must be predictable.
   - No hallucinated task IDs.

6. Production Scalability
   - Horizontally scalable backend.
   - Stateless load-balanced deployment.
   - Fail-safe error handling.

========================================================
TECHNOLOGY STANDARDS
========================================================

Frontend:
- Existing React/Next.js Todo UI
- AI Chat Interface integrated within dashboard

Backend:
- FastAPI (existing backend)
- Python 3.11+

Database:
- PostgreSQL (Neon Serverless)
- SQLModel ORM

Authentication:
- Better Auth (existing)

AI Framework:
- OpenAI Agents SDK (for orchestration layer)
- Cohere API (as LLM engine)
- MCP Official SDK for tool exposure

========================================================
COHERE INTEGRATION REQUIREMENTS
========================================================

1. Replace default OpenAI model calls with Cohere API calls.
2. Agents SDK must use Cohere chat/completion endpoint internally.
3. Tool call structure must remain compatible with Agents SDK format.
4. Ensure JSON-mode output enforcement.
5. Implement retry logic for rate limits and transient failures.
6. Token usage must be monitored and logged.

Model Requirements:
- Must support tool-calling pattern.
- Must support structured output.
- Temperature controlled (0.2–0.4).
- Deterministic responses preferred.

========================================================
MCP TOOL GOVERNANCE
========================================================

Approved Tools:
- add_task
- list_tasks
- complete_task
- delete_task
- update_task

Rules:
- All mutations require authenticated user_id.
- list_tasks must filter by user_id.
- No bulk destructive operations.
- All tool responses logged.

Tool Output Contract:
- Must return structured JSON.
- Must include operation status.
- Must not expose DB schema.

========================================================
CONVERSATION PERSISTENCE STANDARDS
========================================================

Tables:
- tasks
- conversations
- messages

Rules:
- Store every user message before AI execution.
- Store every assistant response after execution.
- Maintain strict chronological ordering.
- Conversation must resume after server restart.

========================================================
ERROR HANDLING STANDARDS
========================================================

Must gracefully handle:
- Task not found
- Invalid task_id
- Cohere API failure
- Rate limiting
- MCP tool validation failure
- Unauthorized access

Error responses must:
- Be user-friendly.
- Not expose stack traces.
- Suggest corrective action.
- Be logged internally.

========================================================
PERFORMANCE REQUIREMENTS
========================================================

Response Time:
- Target < 2.5 seconds per request.

Scalability:
- Must support horizontal scaling.
- No session locking.
- No memory-based caching of conversations.

Observability:
- Log tool calls.
- Log Cohere API latency.
- Log token usage.
- Log errors with severity levels.

========================================================
SECURITY CONSTRAINTS
========================================================

- Strict user isolation.
- No cross-tenant task visibility.
- No direct SQL exposure.
- Environment variables for API keys.
- Cohere API key stored securely.
- HTTPS required in production.
- Domain allowlist enforced for frontend.

========================================================
QUALITY STANDARDS
========================================================

- All AI outputs must be JSON when required.
- No hallucinated database entries.
- No fabricated task IDs.
- All tool calls validated.
- 100% deterministic test coverage for MCP tools.
- Code must pass linting and type checks.
- Zero hardcoded credentials.

========================================================
SUCCESS CRITERIA
========================================================

The integrated AI chatbot must:

1. Add tasks via natural language.
2. List tasks (all/pending/completed).
3. Complete tasks by ID.
4. Delete tasks by ID or title resolution.
5. Update tasks.
6. Resume conversation after restart.
7. Identify logged-in user correctly.
8. Operate entirely via MCP tools.
9. Use Cohere API as reasoning engine.
10. Scale without session state.

========================================================
NON-GOALS
========================================================

- No vendor comparison logic.
- No advanced analytics.
- No predictive task suggestions.
- No memory embedding system.
- No vector database.
- No background AI agents.

========================================================
DEPLOYMENT REQUIREMENTS
========================================================

Environment Variables:
- COHERE_API_KEY
- DATABASE_URL
- AUTH_SECRET
- MCP_SERVER_CONFIG

Deployment Targets:
- Backend: Railway / Render / Fly.io
- Frontend: Vercel
- Neon production database

Must support:
- Zero-downtime deployment.
- Safe migration scripts.
- Rollback strategy.

========================================================
VALIDATION REQUIREMENTS
========================================================

System must pass:

- Functional testing (all MCP tools)
- Load testing (stateless behavior)
- Security validation
- Error simulation testing
- Cohere API failure simulation
- Restart resilience test

## Response snapshot

Constitution successfully updated from version 1.0.0 to 1.1.0 with AI chatbot integration principles.

**Key Changes:**
1. Added Principle VI: Stateless AI Architecture (NON-NEGOTIABLE)
2. Expanded Technology Stack to include AI components (Cohere API, MCP, OpenAI Agents SDK)
3. Added comprehensive AI Chatbot Standards section covering:
   - Tool Governance (5 approved MCP tools)
   - Conversation Persistence (database tables and rules)
   - Cohere Integration Requirements (API integration, model configuration)
   - Error Handling Standards (graceful failures, user-friendly messages)
   - Performance Requirements (< 2.5s response time, horizontal scaling)
4. Updated Success Criteria with 12 AI-specific checkpoints
5. Modified Separation of Concerns principle to include AI layer
6. Enhanced Security by Design with AI tool authorization rules

**Version Bump Rationale:**
MINOR version (1.0.0 → 1.1.0) because new principles and sections were added without removing or breaking existing principles. This is backward compatible with existing features while extending the constitution to govern AI chatbot development.

**Template Validation:**
- ✅ spec-template.md - Compatible with AI tool requirements
- ✅ plan-template.md - Constitution Check will include AI principles
- ✅ tasks-template.md - Supports AI tool implementation tasks

**Files Modified:**
- .specify/memory/constitution.md (updated with Sync Impact Report)

## Outcome

- ✅ Impact: Constitution amended to govern AI chatbot integration with production-grade standards
- 🧪 Tests: No tests required (documentation update)
- 📁 Files: 1 file modified (.specify/memory/constitution.md)
- 🔁 Next prompts: Create AI chatbot feature specification using /sp.specify
- 🧠 Reflection: Successfully integrated comprehensive AI governance without disrupting existing principles. The stateless architecture principle is critical for production scalability.

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution amendment completed successfully
- Graders run and results (PASS/FAIL): PASS - All templates validated for compatibility
- Prompt variant (if applicable): Standard constitution amendment workflow
- Next experiment (smallest change to try): Begin AI chatbot feature specification with /sp.specify command
