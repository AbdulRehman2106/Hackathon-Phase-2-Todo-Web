# Skill: Spec-First Backend Development Rules

## Purpose
Establish strict rules and workflow for developing backend features that originate from specifications, ensuring implementation fidelity and traceability.

## When to Use
- Beginning any backend implementation work
- Reviewing implementation for spec compliance
- Training team on spec-first workflow
- Auditing code-to-spec alignment

## Instruction

### Spec-First Principles

Backend development MUST follow these principles:

1. **Spec Precedes Code**: No implementation without specification
2. **Spec is Source of Truth**: Implementation follows spec, not intuition
3. **Deviations Require Approval**: Any spec deviation must be documented
4. **Traceability Maintained**: Code references specs explicitly

### The Spec-First Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                   SPEC-FIRST WORKFLOW                            │
└─────────────────────────────────────────────────────────────────┘

1. READ SPECIFICATION
   ┌──────────────────────────────────────────────────────────┐
   │ Before writing ANY code:                                  │
   │ • Read entire spec.md for the feature                     │
   │ • Read plan.md for architecture decisions                 │
   │ • Review tasks.md for implementation order                │
   │ • Identify all acceptance criteria                        │
   └──────────────────────────────────────────────────────────┘
                            │
                            ▼
2. MAP REQUIREMENTS TO CODE
   ┌──────────────────────────────────────────────────────────┐
   │ Create mental or written mapping:                         │
   │ • Functional Requirement FR-001 → create_task endpoint    │
   │ • Data Requirement DR-001 → Task model                    │
   │ • Acceptance Criteria AC-001 → test_create_task           │
   └──────────────────────────────────────────────────────────┘
                            │
                            ▼
3. IMPLEMENT TO SPEC
   ┌──────────────────────────────────────────────────────────┐
   │ Write code that exactly matches spec:                     │
   │ • Endpoint paths as specified                             │
   │ • Field names as specified                                │
   │ • Validation rules as specified                           │
   │ • Error responses as specified                            │
   └──────────────────────────────────────────────────────────┘
                            │
                            ▼
4. VERIFY AGAINST SPEC
   ┌──────────────────────────────────────────────────────────┐
   │ Confirm implementation matches:                           │
   │ • Each acceptance criteria is testable                    │
   │ • Tests pass for all criteria                             │
   │ • No undocumented features added                          │
   │ • No specified features missing                           │
   └──────────────────────────────────────────────────────────┘
```

### Rules for Implementation

#### Rule 1: No Undocumented Features

```yaml
rule: Never add features not in spec

examples:
  violation: |
    Spec says: Create task with title and description
    Implementation adds: priority field (not in spec)

  correct_action: |
    If priority needed:
    1. Stop implementation
    2. Request spec update
    3. Get approval
    4. Then implement

exception: |
  Technical necessities (id, timestamps) may be added
  without explicit spec mention if following conventions.
```

#### Rule 2: No Missing Features

```yaml
rule: Implement everything in spec

examples:
  violation: |
    Spec says: Task must have status field with values [pending, in_progress, completed]
    Implementation: Omits status field

  correct_action: |
    Implement all specified fields, validations, and behaviors.
    Mark task incomplete if cannot implement something.
```

#### Rule 3: Match Spec Exactly

```yaml
rule: Names, types, and behaviors must match spec exactly

examples:
  field_name_violation: |
    Spec says: due_date
    Implementation: dueDate, deadline, or due

  type_violation: |
    Spec says: status is enum [pending, in_progress, completed]
    Implementation: status is boolean

  behavior_violation: |
    Spec says: Return 404 if task not found
    Implementation: Returns 400 or empty response
```

#### Rule 4: Document Deviations

```yaml
rule: Any necessary deviation must be documented

deviation_process:
  1. Identify why spec cannot be followed exactly
  2. Document the deviation and reason
  3. Get approval from spec owner
  4. Update spec or add deviation note
  5. Reference in implementation

deviation_documentation:
  location: In code comment and in spec
  format: |
    # DEVIATION from @specs/task-management/spec.md#FR-003
    # Reason: [explanation]
    # Approved by: [approver] on [date]
```

### Pre-Implementation Checklist

Before writing any code for a feature:

```yaml
understanding:
  - [ ] Read spec.md completely
  - [ ] Read plan.md completely
  - [ ] Understand all acceptance criteria
  - [ ] Identify unclear requirements

preparation:
  - [ ] Map requirements to code components
  - [ ] Identify shared components needed
  - [ ] Note dependencies on other features
  - [ ] Clarify any ambiguities BEFORE coding

validation:
  - [ ] Acceptance criteria are testable
  - [ ] All edge cases documented
  - [ ] Error responses specified
  - [ ] Authentication requirements clear
```

### During Implementation Rules

```yaml
while_coding:
  - Reference spec section being implemented
  - Match field names exactly
  - Match endpoint paths exactly
  - Match validation rules exactly
  - Match error responses exactly
  - Do not add unrequested features
  - Do not skip specified features

on_ambiguity:
  - Stop implementation
  - Document the ambiguity
  - Ask for clarification
  - Update spec with clarification
  - Continue implementation

on_impossibility:
  - Stop implementation
  - Document why spec cannot be followed
  - Propose alternative
  - Get approval
  - Update spec
  - Continue implementation
```

### Post-Implementation Verification

```yaml
verification_steps:

  1_acceptance_criteria:
    action: Review each AC in spec
    verify: Test exists and passes for each AC
    result: All AC covered

  2_field_mapping:
    action: Compare spec fields to implementation
    verify: Names, types, constraints match
    result: 100% field match

  3_endpoint_mapping:
    action: Compare spec endpoints to routes
    verify: Paths, methods, status codes match
    result: 100% endpoint match

  4_error_handling:
    action: Compare spec error cases to implementation
    verify: All error cases handled correctly
    result: All errors match spec

  5_no_extras:
    action: Review code for unspecified features
    verify: Nothing added beyond spec
    result: No undocumented features
```

### Traceability Requirements

```yaml
code_to_spec_references:
  purpose: Maintain clear link between code and spec
  format: Comment or docstring with @specs reference

  examples:
    endpoint: |
      # Implements @specs/task-management/spec.md#FR-001
      @router.post("/tasks")
      async def create_task(...):

    model: |
      # Data model per @specs/task-management/spec.md#data-requirements
      class Task(SQLModel, table=True):

    test: |
      # Verifies @specs/task-management/spec.md#AC-001
      def test_create_task_success():

spec_updates:
  rule: If code changes require spec update
  process:
    1. Update spec first
    2. Get approval
    3. Then update code
    4. Update references
```

### Anti-Patterns

| Anti-Pattern | Problem | Correct Approach |
|--------------|---------|------------------|
| Code-first development | Implementation diverges from requirements | Always read spec first |
| Intuitive naming | Field names don't match spec | Use exact spec names |
| Extra features | Scope creep, untested code | Only implement spec |
| Skipping features | Incomplete implementation | Implement everything |
| Silent deviations | Undocumented differences | Document all deviations |
| Assumption-based coding | Wrong implementation | Clarify ambiguities |

## Output Format
Spec-first development guidelines and checklists suitable for development process documentation.

## Related Skills
- implement-fastapi-from-specs
- structure-backend-projects
- handle-errors-edge-cases
