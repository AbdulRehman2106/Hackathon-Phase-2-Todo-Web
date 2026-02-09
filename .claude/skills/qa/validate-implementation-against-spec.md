# Skill: Validate Implementation Against Specs

## Purpose
Systematically verify that implemented features match their specifications, ensuring complete coverage of requirements and acceptance criteria.

## When to Use
- After completing feature implementation
- Before marking tasks as done
- During code review
- For QA validation phases

## Instruction

### Validation Process

```
┌─────────────────────────────────────────────────────────────────┐
│                   SPEC VALIDATION PROCESS                        │
└─────────────────────────────────────────────────────────────────┘

1. GATHER ARTIFACTS
   ┌──────────────┐
   │ spec.md      │ Requirements
   │ plan.md      │ Architecture
   │ tasks.md     │ Task breakdown
   │ Code files   │ Implementation
   └──────┬───────┘
          │
2. MAP REQUIREMENTS TO CODE
          │
          ▼
   ┌──────────────────────────────────────────────────────────┐
   │ For each requirement:                                     │
   │ • Identify implementing code                              │
   │ • Verify behavior matches spec                            │
   │ • Check edge cases                                        │
   └──────────────────────────────────────────────────────────┘
          │
3. VERIFY ACCEPTANCE CRITERIA
          │
          ▼
   ┌──────────────────────────────────────────────────────────┐
   │ For each acceptance criterion:                            │
   │ • Verify test exists                                      │
   │ • Verify test passes                                      │
   │ • Verify behavior matches Given/When/Then                 │
   └──────────────────────────────────────────────────────────┘
          │
4. DOCUMENT FINDINGS
          │
          ▼
   ┌──────────────────────────────────────────────────────────┐
   │ Generate validation report:                               │
   │ • Matched requirements                                    │
   │ • Gaps identified                                         │
   │ • Deviations found                                        │
   └──────────────────────────────────────────────────────────┘
```

### Validation Checklist Template

```yaml
feature: [Feature Name]
spec_file: @specs/[feature]/spec.md
validation_date: [Date]
validator: [Name/Agent]

sections:

  functional_requirements:
    FR-001:
      description: "[Requirement text from spec]"
      status: [PASS/FAIL/PARTIAL]
      implementation_location: "[File:line]"
      notes: "[Any observations]"

    FR-002:
      description: "[Requirement text]"
      status: [PASS/FAIL/PARTIAL]
      implementation_location: "[File:line]"
      notes: ""

  acceptance_criteria:
    AC-001:
      given: "[Given condition]"
      when: "[When action]"
      then: "[Then outcome]"
      status: [PASS/FAIL]
      test_location: "[Test file:line]"
      notes: ""

  data_requirements:
    DR-001:
      entity: "[Entity name]"
      fields_match: [true/false]
      constraints_match: [true/false]
      notes: ""

  api_requirements:
    endpoint: "[METHOD /path]"
    implemented: [true/false]
    request_schema_match: [true/false]
    response_schema_match: [true/false]
    status_codes_match: [true/false]
    notes: ""

summary:
  total_requirements: [N]
  passed: [N]
  failed: [N]
  partial: [N]
  overall_status: [PASS/FAIL]
```

### Validation Categories

#### 1. Functional Requirement Validation

```yaml
validation_steps:
  1. Read requirement in spec
  2. Identify code that implements requirement
  3. Trace execution path
  4. Verify behavior matches spec exactly
  5. Check boundary conditions

checks:
  - Does the feature exist?
  - Does it behave as specified?
  - Are all sub-requirements met?
  - Are there unspecified behaviors?
```

#### 2. Acceptance Criteria Validation

```yaml
validation_steps:
  1. Parse Given/When/Then from spec
  2. Find corresponding test
  3. Verify test covers all conditions
  4. Run test to confirm passing
  5. Manual verification if needed

checks:
  - Is there a test for this AC?
  - Does the test accurately reflect the AC?
  - Does the test pass?
  - Are edge cases in AC covered?
```

#### 3. Data Model Validation

```yaml
validation_steps:
  1. Compare spec entities to models
  2. Verify field names match
  3. Verify field types match
  4. Check constraints (required, unique, etc.)
  5. Verify relationships

checks:
  - Do entity names match?
  - Do field names match exactly?
  - Do types match (considering ORM mapping)?
  - Are all constraints implemented?
  - Are relationships correct?
```

#### 4. API Contract Validation

```yaml
validation_steps:
  1. List all endpoints in spec
  2. Verify each endpoint exists
  3. Check request schemas
  4. Check response schemas
  5. Verify status codes

checks:
  - Does endpoint path match?
  - Does HTTP method match?
  - Do request fields match?
  - Do response fields match?
  - Do error responses match?
```

### Gap Detection

```yaml
gap_types:

  missing_feature:
    definition: Spec requirement not implemented
    severity: High
    action: Implement missing feature

  incomplete_feature:
    definition: Partially implemented
    severity: Medium-High
    action: Complete implementation

  behavior_mismatch:
    definition: Implemented differently than spec
    severity: High
    action: Correct behavior or update spec

  extra_feature:
    definition: Implemented but not in spec
    severity: Medium
    action: Remove or document in spec

  naming_mismatch:
    definition: Different names than spec
    severity: Medium
    action: Rename to match spec

  type_mismatch:
    definition: Different types than spec
    severity: High
    action: Correct types
```

### Validation Report Format

```markdown
# Spec Validation Report

## Feature: [Feature Name]

### Summary
- **Spec File**: @specs/[feature]/spec.md
- **Validation Date**: [Date]
- **Overall Status**: [PASS/FAIL]
- **Requirements Validated**: [X/Y passed]
- **Acceptance Criteria**: [X/Y passed]

### Findings

#### ✅ Passed Requirements
- FR-001: Create task endpoint - Implemented correctly
- FR-002: List tasks endpoint - Implemented correctly

#### ❌ Failed Requirements
- FR-003: Task priority field
  - **Issue**: Not implemented
  - **Spec Says**: Task should have priority (low/medium/high)
  - **Implementation**: Field missing from model
  - **Recommendation**: Add priority field to Task model

#### ⚠️ Partial Requirements
- FR-004: Task filtering
  - **Issue**: Status filter works, date filter missing
  - **Spec Says**: Filter by status and due date
  - **Implementation**: Only status filter implemented
  - **Recommendation**: Add due date filter

### Acceptance Criteria Status

| AC ID | Description | Status | Notes |
|-------|-------------|--------|-------|
| AC-001 | Successful task creation | ✅ PASS | |
| AC-002 | Title validation | ✅ PASS | |
| AC-003 | Unauthorized access | ❌ FAIL | Returns 400 instead of 401 |

### API Contract Validation

| Endpoint | Path Match | Request Match | Response Match | Status |
|----------|------------|---------------|----------------|--------|
| Create Task | ✅ | ✅ | ✅ | PASS |
| List Tasks | ✅ | ✅ | ❌ | FAIL - Missing pagination |

### Recommendations
1. Add priority field to Task model
2. Implement due date filtering
3. Fix error response for unauthorized access
4. Add pagination to list endpoint

### Next Steps
- [ ] Address failed requirements
- [ ] Re-run validation after fixes
- [ ] Update spec if changes approved
```

### Automation Support

```yaml
automated_checks:
  schema_comparison:
    tool: Schema diff tools
    purpose: Compare spec schemas to actual schemas

  api_testing:
    tool: OpenAPI validation, Postman
    purpose: Test endpoints against spec

  test_coverage:
    tool: Coverage tools
    purpose: Ensure tests cover requirements

manual_verification:
  required_for:
    - Complex business logic
    - UI/UX requirements
    - Edge case behaviors
    - Error message content
```

## Output Format
Validation report with specific findings, gaps, and recommendations suitable for QA documentation.

## Related Skills
- detect-spec-violations
- review-auth-behavior
- provide-correction-suggestions
