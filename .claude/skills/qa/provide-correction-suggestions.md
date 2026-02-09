# Skill: Provide Correction Suggestions Without Implementing Fixes

## Purpose
Generate clear, actionable correction suggestions for identified issues without directly implementing the fixes, enabling developers to make informed decisions and learn from the guidance.

## When to Use
- After detecting spec violations
- During code review
- When QA identifies issues
- For educational or mentoring purposes

## Instruction

### Suggestion Philosophy

Correction suggestions should:

1. **Be Specific**: Point to exact locations and issues
2. **Be Actionable**: Provide clear steps to fix
3. **Be Educational**: Explain why the correction matters
4. **Not Implement**: Describe the fix, don't write the code
5. **Respect Context**: Consider existing code patterns

### Suggestion Format

```yaml
suggestion_template:
  id: SUG-001
  severity: [Critical|High|Medium|Low]
  category: [Spec Violation|Security|Performance|Best Practice]

  issue:
    summary: Brief description of the problem
    location: File path and line number(s)
    spec_reference: "@specs/feature/spec.md#section" (if applicable)

  current_state:
    description: What the code currently does
    evidence: Relevant code snippet or behavior

  expected_state:
    description: What the code should do
    reference: Spec or standard that defines expected behavior

  correction_guidance:
    approach: High-level approach to fixing
    steps:
      - Step 1: What to change first
      - Step 2: What to change next
      - ...
    considerations: Things to be aware of while fixing

  impact:
    if_not_fixed: Consequences of leaving as-is
    scope: What else might be affected by the fix

  related_issues: Other suggestions that relate to this one
```

### Suggestion Categories

#### 1. Spec Violation Corrections

```yaml
spec_violation_suggestion:
  id: SUG-SPEC-001
  severity: High
  category: Spec Violation

  issue:
    summary: Endpoint returns 200 instead of 201 on resource creation
    location: src/routers/tasks.py:45
    spec_reference: "@specs/task-management/spec.md#api-requirements"

  current_state:
    description: The create_task endpoint returns status 200
    evidence: |
      @router.post("/tasks")
      async def create_task(...):
          # ... creates task
          return task  # Returns 200 by default

  expected_state:
    description: Should return 201 Created for successful resource creation
    reference: |
      Spec says: "POST /api/tasks returns 201 Created on success"
      REST convention: 201 for created resources

  correction_guidance:
    approach: Add explicit status_code to route decorator
    steps:
      - Locate the @router.post decorator for create_task
      - Add status_code=status.HTTP_201_CREATED parameter
      - Verify response model is still applied
    considerations:
      - Ensure any tests expecting 200 are updated to 201
      - Check if API documentation needs update

  impact:
    if_not_fixed: API contract violation, client confusion
    scope: All clients expecting 201 on create
```

#### 2. Security Corrections

```yaml
security_suggestion:
  id: SUG-SEC-001
  severity: Critical
  category: Security

  issue:
    summary: Missing ownership check allows cross-user data access
    location: src/routers/tasks.py:60-70
    spec_reference: "@specs/_shared/authorization.md"

  current_state:
    description: Get task by ID doesn't verify user ownership
    evidence: |
      Query fetches task by ID only:
      task = await session.get(Task, task_id)
      # No user_id check

  expected_state:
    description: Query should filter by both task_id AND user_id
    reference: |
      Authorization requirement: Users can only access their own tasks
      Security best practice: Defense in depth

  correction_guidance:
    approach: Add user_id filter to database query
    steps:
      - Modify the query to include user_id condition
      - User ID should come from token (get_current_user dependency)
      - If task not found OR not owned, return 404 (same response)
      - Do NOT return 403 for non-owned (prevents enumeration)
    considerations:
      - Same pattern needed for PUT and DELETE endpoints
      - Consider creating reusable function for owned-resource lookup
      - Add tests for cross-user access attempts

  impact:
    if_not_fixed: Critical data exposure vulnerability
    scope: All resource endpoints need same pattern
```

#### 3. Validation Corrections

```yaml
validation_suggestion:
  id: SUG-VAL-001
  severity: Medium
  category: Spec Violation

  issue:
    summary: Title field missing max length validation
    location: src/schemas/task.py:10
    spec_reference: "@specs/task-management/spec.md#data-requirements"

  current_state:
    description: TaskCreate schema accepts any length title
    evidence: |
      class TaskCreate(BaseModel):
          title: str  # No max_length

  expected_state:
    description: Title should be limited to 255 characters
    reference: |
      Spec says: "title: string (required, max 255 chars)"

  correction_guidance:
    approach: Add Field constraint with max_length
    steps:
      - Import Field from pydantic if not already imported
      - Change title field to use Field with max_length parameter
      - Consider adding min_length=1 to prevent empty strings
      - Add custom error message for better UX
    considerations:
      - Database column should also have VARCHAR(255)
      - Existing data may violate constraint (check first)
      - Update API documentation if auto-generated

  impact:
    if_not_fixed: Database errors or data inconsistency
    scope: TaskCreate and TaskUpdate schemas
```

### Grouping Related Suggestions

```yaml
related_suggestions_group:
  title: "Ownership Check Pattern Missing Across Endpoints"
  description: |
    Multiple endpoints are missing ownership verification.
    All should be fixed using the same pattern.

  suggestions:
    - SUG-SEC-001: GET /tasks/{id} missing ownership check
    - SUG-SEC-002: PUT /tasks/{id} missing ownership check
    - SUG-SEC-003: DELETE /tasks/{id} missing ownership check

  unified_approach:
    recommendation: |
      Create a reusable dependency or helper function for
      fetching owned resources. Use consistently across all
      single-resource endpoints.

    pattern_description: |
      async def get_owned_task(
          task_id: UUID,
          user_id: UUID,
          session: AsyncSession
      ) -> Task:
          task = await session.exec(
              select(Task).where(
                  Task.id == task_id,
                  Task.user_id == user_id
              )
          ).first()
          if not task:
              raise HTTPException(status_code=404)
          return task
```

### Suggestion Report Format

```markdown
# Correction Suggestions Report

## Summary
- **Total Suggestions**: 8
- **Critical**: 2
- **High**: 3
- **Medium**: 2
- **Low**: 1

## Critical Priority

### SUG-SEC-001: Missing Ownership Check on GET /tasks/{id}
**Location**: src/routers/tasks.py:60

**Issue**: Task can be accessed by any authenticated user regardless of ownership.

**Spec Reference**: @specs/_shared/authorization.md

**Correction Guidance**:
1. Modify the task query to include user_id filter
2. Get user_id from the authenticated user (via get_current_user)
3. Return 404 if task not found OR not owned by user
4. Do NOT return 403 (prevents resource enumeration)

**Considerations**:
- Same fix needed for PUT and DELETE endpoints
- Consider creating helper function for reuse
- Add integration tests for cross-user access

---

### SUG-SEC-002: List Endpoint Returns All Tasks
**Location**: src/routers/tasks.py:30

**Issue**: GET /tasks returns tasks from all users.

**Correction Guidance**:
1. Add WHERE clause filtering by user_id
2. User ID from authenticated user context
3. Ensure pagination still works correctly

---

## High Priority

### SUG-SPEC-001: Wrong Status Code on Create
**Location**: src/routers/tasks.py:45

**Issue**: Returns 200 instead of 201 on task creation.

**Correction Guidance**:
1. Add status_code=201 to @router.post decorator
2. Update any tests expecting 200

---

## Recommendations Summary

1. **Immediate**: Fix all ownership check issues (Critical)
2. **Before Release**: Correct status codes (High)
3. **Technical Debt**: Refactor to use consistent patterns
```

### Suggestion Quality Checklist

```yaml
per_suggestion_verify:
  - [ ] Issue clearly identified with location
  - [ ] Current behavior described accurately
  - [ ] Expected behavior referenced to spec/standard
  - [ ] Correction steps are actionable
  - [ ] No actual code written (guidance only)
  - [ ] Considerations included for edge cases
  - [ ] Impact explained
  - [ ] Severity appropriately assigned
```

### Communication Guidelines

```yaml
tone:
  - Constructive, not critical
  - Educational, not condescending
  - Specific, not vague
  - Actionable, not just complaints

format:
  - Start with what needs to change
  - Explain why it matters
  - Provide clear steps
  - Mention related considerations

avoid:
  - Writing the actual fix code
  - Being overly prescriptive about implementation
  - Missing context from existing codebase
  - Ignoring practical constraints
```

## Output Format
Correction suggestions document with categorized, actionable guidance suitable for developer remediation work.

## Related Skills
- validate-implementation-against-spec
- detect-spec-violations
- review-auth-behavior
