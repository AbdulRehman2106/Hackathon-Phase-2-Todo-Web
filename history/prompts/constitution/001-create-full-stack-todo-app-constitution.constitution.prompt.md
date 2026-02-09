---
id: 001
title: Create full-stack todo app constitution
stage: constitution
date: 2026-02-05
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: Claude Code - Backend Implementation Specialist
command: /sp.constitution
labels: ["constitution", "project-setup", "governance", "hackathon"]
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

Project: Full-Stack Todo Web Application (Hackathon II)

Objective:
Transform an existing console-based todo application into a modern, production-quality, multi-user web application using a spec-driven, agentic development workflow.

Core Principles:
- Spec-Driven Development: All implementation must follow written specifications.
- Agentic Workflow: No manual coding; all changes performed via Claude Code.
- Separation of Concerns: Frontend, backend, authentication, and database are clearly decoupled.
- Security by Design: User isolation and task ownership enforced at all layers.
- UI/UX Excellence: Frontend must be visually polished, accessible, and professional.

UI & UX Principles (CRITICAL):
- Clean, modern, and minimal design language.
- Consistent spacing, typography scale, and color system.
- Clear visual hierarchy for task states (pending vs completed).
- Responsive design: mobile, tablet, desktop.
- Accessibility basics: readable contrast, focus states, semantic structure.
- No placeholder-looking UI; app should feel production-ready.

Key Standards:
- Authentication via Better Auth with JWT tokens.
- Backend must verify JWT on every request.
- Tasks must always be scoped to the authenticated user.
- REST API must follow documented specs exactly.
- Database access only via SQLModel ORM.

Constraints:
- Frontend: Next.js 16+ (App Router), TypeScript, Tailwind CSS.
- Backend: FastAPI, SQLModel.
- Database: Neon Serverless PostgreSQL.
- Authentication: Better Auth (JWT-based).
- No direct database session sharing between frontend and backend.
- No hardcoded secrets; all secrets via environment variables.

Success Criteria:
- User can sign up and sign in securely.
- Each user only sees and modifies their own tasks.
- All CRUD operations work end-to-end.
- UI is responsive, visually refined, and intuitive.
- Entire system can be explained clearly from spec → plan → implementation.

## Response snapshot

Created project constitution v1.0.0 at `.specify/memory/constitution.md` with five core principles:

1. **Spec-Driven Development (NON-NEGOTIABLE)**: All implementation must follow written specifications with clear acceptance criteria
2. **Agentic Workflow**: All code changes via Claude Code agents, no manual edits
3. **Separation of Concerns**: Clear decoupling of frontend, backend, authentication, and database layers
4. **Security by Design (NON-NEGOTIABLE)**: User isolation and JWT verification enforced at all layers
5. **UI/UX Excellence**: Production-ready, accessible, responsive design with consistent design language

Added comprehensive sections for:
- UI & UX Standards (typography, spacing, colors, interaction patterns, accessibility)
- Technology Stack & Constraints (Next.js 16+, FastAPI, SQLModel, Neon PostgreSQL, Better Auth)
- Development Workflow (Specification → Planning → Implementation → Validation phases)
- Success Criteria (checklist for feature completion)
- Governance (amendment process, compliance requirements, version control)

Validated dependent templates:
- ✅ spec-template.md: Aligns with Spec-Driven Development principle
- ✅ tasks-template.md: Supports user story organization and independent testing
- ✅ plan-template.md: Includes Constitution Check gate

## Outcome

- ✅ Impact: Established foundational governance document defining all architectural principles, technology constraints, and quality standards for the full-stack todo application
- 🧪 Tests: N/A (constitution is documentation, not code)
- 📁 Files: Created .specify/memory/constitution.md (v1.0.0)
- 🔁 Next prompts: /sp.specify to create feature specifications following constitution principles
- 🧠 Reflection: Constitution successfully captures all user requirements including critical UI/UX standards and security-by-design principles. All templates validated for alignment.

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution created successfully with all placeholders filled
- Graders run and results (PASS/FAIL): PASS - No unresolved placeholders, all sections complete, templates validated
- Prompt variant (if applicable): Standard constitution creation workflow
- Next experiment (smallest change to try): N/A - initial constitution complete
