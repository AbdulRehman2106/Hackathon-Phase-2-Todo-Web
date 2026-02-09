<!--
Sync Impact Report:
- Version Change: [NEW] → 1.0.0
- Modified Principles: Initial creation
- Added Sections: All (initial constitution)
- Removed Sections: None
- Templates Status:
  ✅ Constitution created
  ✅ spec-template.md validated - aligns with Spec-Driven Development principle
  ✅ tasks-template.md validated - supports user story organization and independent testing
  ✅ plan-template.md validated - includes Constitution Check gate
- Follow-up TODOs: None - all templates align with constitution principles
-->

# Full-Stack Todo Web Application Constitution

## Core Principles

### I. Spec-Driven Development (NON-NEGOTIABLE)

All implementation MUST follow written specifications. No code changes are permitted without a corresponding specification document that defines requirements, acceptance criteria, and expected behavior.

**Rationale**: Ensures traceability, prevents scope creep, and maintains alignment between business requirements and technical implementation. Specifications serve as the single source of truth for what should be built.

**Rules**:
- Every feature MUST have a spec.md before implementation begins
- Specs MUST include clear acceptance criteria
- Implementation MUST NOT deviate from approved specs without amendment
- Changes to specs require explicit approval and version tracking

### II. Agentic Workflow

No manual coding is permitted. All code changes, file operations, and development tasks MUST be performed via Claude Code agents following defined workflows.

**Rationale**: Ensures consistency, auditability, and adherence to established patterns. Prevents ad-hoc changes that bypass quality gates and documentation requirements.

**Rules**:
- All code generation via Claude Code agents
- Manual file edits are prohibited
- Agent actions MUST be traceable via PHRs (Prompt History Records)
- Workflow deviations require explicit justification

### III. Separation of Concerns

Frontend, backend, authentication, and database layers MUST be clearly decoupled with well-defined interfaces. No layer may directly access another layer's internal implementation details.

**Rationale**: Enables independent development, testing, and scaling of each layer. Reduces coupling and improves maintainability.

**Rules**:
- Frontend communicates with backend only via REST API
- Backend accesses database only via SQLModel ORM
- Authentication handled by dedicated service (Better Auth)
- No direct database session sharing between frontend and backend
- Each layer has clear, documented contracts

### IV. Security by Design (NON-NEGOTIABLE)

User isolation and task ownership MUST be enforced at all layers. Every request MUST be authenticated and authorized before processing.

**Rationale**: Prevents unauthorized access, data leakage, and privilege escalation. Security cannot be retrofitted; it must be built into the architecture from the start.

**Rules**:
- Backend MUST verify JWT on every request
- Tasks MUST always be scoped to the authenticated user
- No user can access another user's data
- All secrets via environment variables (no hardcoding)
- Database queries MUST include user_id filters for user-scoped resources

### V. UI/UX Excellence

Frontend MUST be visually polished, accessible, and professional. The application should feel production-ready, not like a prototype or placeholder.

**Rationale**: User experience directly impacts adoption and satisfaction. A well-designed interface reduces cognitive load and increases productivity.

**Rules**:
- Clean, modern, minimal design language
- Consistent spacing, typography scale, and color system
- Clear visual hierarchy for task states (pending vs completed)
- Responsive design: mobile, tablet, desktop
- Accessibility basics: readable contrast, focus states, semantic HTML
- No placeholder-looking UI elements

## UI & UX Standards

### Design Language
- **Typography**: Consistent scale (e.g., 12px, 14px, 16px, 20px, 24px, 32px)
- **Spacing**: 4px base unit (4, 8, 12, 16, 24, 32, 48, 64)
- **Colors**: Defined palette with semantic naming (primary, secondary, success, warning, error, neutral)
- **Components**: Reusable, composable, with clear states (default, hover, active, disabled, loading)

### Interaction Patterns
- Loading states for all async operations
- Error messages that are clear and actionable
- Confirmation dialogs for destructive actions
- Keyboard navigation support
- Touch-friendly targets (minimum 44x44px)

### Accessibility Requirements
- WCAG 2.1 Level AA contrast ratios
- Semantic HTML structure
- ARIA labels where needed
- Focus indicators visible and clear
- Screen reader friendly

## Technology Stack & Constraints

### Frontend
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Authentication**: Better Auth (JWT-based)
- **State Management**: React hooks, Server Components where appropriate

### Backend
- **Framework**: FastAPI
- **ORM**: SQLModel
- **Authentication**: JWT verification
- **API Style**: REST with JSON payloads

### Database
- **Provider**: Neon Serverless PostgreSQL
- **Access Pattern**: SQLModel ORM only (no raw SQL)
- **Migrations**: Alembic or equivalent

### Security
- **Authentication**: Better Auth with JWT tokens
- **Authorization**: User-scoped queries enforced at database layer
- **Secrets Management**: Environment variables only (.env files, never committed)

## Development Workflow

### Specification Phase
1. Feature requirements documented in `specs/<feature>/spec.md`
2. Acceptance criteria clearly defined
3. User stories and edge cases identified
4. Spec reviewed and approved before proceeding

### Planning Phase
1. Architecture decisions documented in `specs/<feature>/plan.md`
2. API contracts defined
3. Database schema changes planned
4. Security implications assessed
5. ADRs created for significant decisions

### Implementation Phase
1. Tasks broken down in `specs/<feature>/tasks.md`
2. Each task includes test cases
3. Implementation via Claude Code agents
4. PHRs created for all significant work
5. Code changes follow smallest viable diff principle

### Validation Phase
1. All acceptance criteria verified
2. Security checks passed (user isolation, JWT verification)
3. UI/UX standards met
4. Cross-browser/device testing completed
5. Documentation updated

## Success Criteria

A feature is considered complete when ALL of the following are true:

- [ ] User can sign up and sign in securely
- [ ] Each user only sees and modifies their own tasks
- [ ] All CRUD operations work end-to-end
- [ ] UI is responsive, visually refined, and intuitive
- [ ] No hardcoded secrets or credentials
- [ ] JWT verification on all protected endpoints
- [ ] Database queries properly scoped to authenticated user
- [ ] Entire system can be explained clearly from spec → plan → implementation
- [ ] All tests pass
- [ ] Documentation is complete and accurate

## Governance

### Amendment Process
1. Proposed changes documented with rationale
2. Impact analysis on existing specs, plans, and code
3. Approval required before implementation
4. Version number incremented according to semantic versioning:
   - **MAJOR**: Backward incompatible principle changes
   - **MINOR**: New principles or sections added
   - **PATCH**: Clarifications, wording improvements, typo fixes
5. Dependent templates and documentation updated
6. Migration plan created if existing code affected

### Compliance
- All PRs MUST verify compliance with constitution principles
- Spec reviews MUST check alignment with core principles
- Security reviews MUST verify user isolation and JWT verification
- UI reviews MUST verify adherence to design standards
- Complexity MUST be justified against simplicity principle

### Version Control
- Constitution changes tracked in git
- Each amendment creates a new version
- Sync Impact Report prepended to document
- PHR created for each amendment

### Runtime Guidance
For day-to-day development guidance, refer to `CLAUDE.md` which provides operational instructions for Claude Code agents working within this constitutional framework.

**Version**: 1.0.0 | **Ratified**: 2026-02-05 | **Last Amended**: 2026-02-05
