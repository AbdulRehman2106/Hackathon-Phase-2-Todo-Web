---
id: 002
title: AI Chatbot Integration Implementation Plan
stage: plan
date: 2026-02-15
surface: agent
model: claude-sonnet-4-5
feature: ai-chatbot-integration
branch: 002-ai-chatbot-integration
user: system
command: /sp.plan
labels: ["planning", "ai-chatbot", "cohere", "mcp-tools", "stateless-architecture"]
links:
  spec: specs/002-ai-chatbot-integration/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-ai-chatbot-integration/plan.md
  - specs/002-ai-chatbot-integration/research.md
  - specs/002-ai-chatbot-integration/data-model.md
  - specs/002-ai-chatbot-integration/contracts/chat-api.yaml
  - specs/002-ai-chatbot-integration/contracts/mcp-tools.json
  - specs/002-ai-chatbot-integration/quickstart.md
tests:
  - None (planning phase - no tests yet)
---

## Prompt

Project: AI Todo Chatbot Integration
Stack: FastAPI + PostgreSQL (Neon) + MCP SDK + OpenAI Agents SDK + Cohere API

Objective:
Design a complete implementation plan for integrating
an AI-powered Todo Chatbot into the existing backend
using stateless architecture and MCP tool execution.

========================================================
1. ARCHITECTURE SKETCH
========================================================

Frontend (Existing Dashboard + Chat UI)
        │
        ▼
POST /api/{user_id}/chat
        │
        ▼
FastAPI Chat Endpoint (Stateless)
        │
        ├── Fetch Conversation History (DB)
        ├── Store User Message
        │
        ▼
Agents SDK Orchestrator
        │
        ▼
Cohere API (LLM reasoning engine)
        │
        ▼
Tool Call Decision (Structured JSON)
        │
        ▼
Tool Validation Layer
        │
        ▼
MCP Server (Task Tools)
        │
        ▼
PostgreSQL (Neon)
        │
        ▼
Assistant Response Stored
        │
        ▼
Return Response to Client

Key Architectural Guarantees:
- No server memory storage
- All context persisted in DB
- All AI operations through MCP tools
- Cohere API used for reasoning only

[Full implementation phases and detailed architecture provided in user input]

## Response snapshot

Successfully completed Phase 0 (Research) and Phase 1 (Design & Contracts) of the implementation planning workflow:

**Phase 0 - Research (research.md):**
- Cohere API tool-calling format and OpenAI Agents SDK compatibility
- MCP SDK Python implementation patterns
- Stateless conversation management in FastAPI
- Cohere API rate limits and retry strategies
- Database schema for conversation persistence
- Tool validation patterns to prevent hallucinations

**Phase 1 - Design & Contracts:**
- data-model.md: Complete database schema for Conversation and Message entities
- contracts/chat-api.yaml: OpenAPI specification for chat endpoint
- contracts/mcp-tools.json: JSON schemas for all 5 MCP tools
- quickstart.md: Developer guide for setup and testing

**Key Architectural Decisions:**
1. Cohere API with adapter layer for OpenAI Agents SDK
2. Single orchestrator agent pattern
3. Stateless database persistence
4. Integrated MCP server inside FastAPI
5. Strict JSON schema validation for tool calls

**Constitution Check:** ✅ PASSED
- All constitutional requirements satisfied
- Spec-driven development enforced
- Security by design maintained
- Stateless AI architecture validated
- User isolation enforced at all layers

## Outcome

- ✅ Impact: Complete implementation plan created with research, data models, API contracts, and developer quickstart guide
- 🧪 Tests: No tests in planning phase (tests will be created during implementation)
- 📁 Files: 6 files created (plan.md, research.md, data-model.md, chat-api.yaml, mcp-tools.json, quickstart.md)
- 🔁 Next prompts: Run `/sp.tasks` to generate task breakdown for implementation
- 🧠 Reflection: Planning workflow successfully completed all required phases. Architecture is well-defined with clear separation of concerns, security enforcement, and stateless design principles.

## Evaluation notes (flywheel)

- Failure modes observed: None - planning workflow executed successfully
- Graders run and results (PASS/FAIL): Constitution Check: PASS, All gates satisfied
- Prompt variant (if applicable): Standard /sp.plan workflow
- Next experiment (smallest change to try): Proceed to task generation with /sp.tasks command
