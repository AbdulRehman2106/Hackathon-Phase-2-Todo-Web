# Skill: Detect Spec Violations

## Purpose
Identify deviations between implementation and specifications, categorizing them by severity and type for prioritized remediation.

## When to Use
- During code review
- After implementation before release
- When troubleshooting spec compliance issues
- During QA validation phases

## Instruction

### Violation Categories

```yaml
violation_types:

  missing_implementation:
    description: Feature specified but not built
    severity: Critical
    examples:
      - Required endpoint not created
      - Required field missing from model
      - Required validation not implemented

  wrong_behavior:
    description: Feature works differently than specified
    severity: Critical
    examples:
      - Returns 400 instead of 401
      - Creates resource when should reject
      - Allows invalid data that should fail validation

  extra_implementation:
    description: Feature built but not specified
    severity: Medium
    examples:
      - Undocumented API field
      - Extra validation not in spec
      - Unspecified behavior added

  naming_violation:
    description: Names don't match spec
    severity: Medium
    examples:
      - Field named 'dueDate' instead of 'due_date'
      - Endpoint path differs from spec
      - Error code doesn't match spec

  type_violation:
    description: Data types don't match spec
    severity: High
    examples:
      - String instead of number
      - Wrong enum values
      - Different date format

  constraint_violation:
    description: Constraints differ from spec
    severity: High
    examples:
      - Max length not enforced
      - Required field is optional
      - Unique constraint missing
```

### Detection Methods

#### 1. Static Analysis

```yaml
method: Compare spec and code without execution

checks:
  model_fields:
    - List all fields in spec
    - List all fields in code
    - Find differences

  endpoint_paths:
    - List all endpoints in spec
    - List all endpoints in router
    - Compare paths, methods

  type_mappings:
    - Map spec types to expected code types
    - Verify code types match

  constraint_presence:
    - List constraints in spec
    - Verify constraints in model/schema
```

#### 2. Behavioral Analysis

```yaml
method: Execute code and compare behavior to spec

checks:
  happy_path:
    - Execute main flow
    - Compare output to spec

  error_cases:
    - Trigger each error condition
    - Verify error response matches spec

  validation:
    - Submit invalid data
    - Verify rejection matches spec

  authorization:
    - Access as different users
    - Verify access control matches spec
```

#### 3. Contract Testing

```yaml
method: Test API contracts against spec

checks:
  request_validation:
    - Send spec-compliant request
    - Verify acceptance

  response_validation:
    - Receive response
    - Verify matches spec schema

  error_responses:
    - Trigger each error
    - Verify format and codes
```

### Violation Detection Checklist

```yaml
for_each_endpoint:
  path_check:
    - [ ] Path matches spec exactly
    - [ ] Method matches spec
    - [ ] Path parameters named correctly

  request_check:
    - [ ] All required fields enforced
    - [ ] Field names match spec
    - [ ] Field types match spec
    - [ ] Validation rules match spec

  response_check:
    - [ ] Response fields match spec
    - [ ] Response types match spec
    - [ ] Nested objects match spec

  status_codes:
    - [ ] Success code matches spec
    - [ ] Error codes match spec
    - [ ] Edge case codes match spec

  auth_check:
    - [ ] Auth requirement matches spec
    - [ ] Unauthorized returns correct code
    - [ ] Forbidden returns correct code

for_each_model:
  field_check:
    - [ ] All spec fields present
    - [ ] No extra fields (unless technical)
    - [ ] Field names match exactly
    - [ ] Field types match

  constraint_check:
    - [ ] Required fields are NOT NULL
    - [ ] Unique fields have constraint
    - [ ] Foreign keys defined
    - [ ] Check constraints present

  relationship_check:
    - [ ] Relationships match spec
    - [ ] Cascade behavior matches
```

### Violation Report Format

```yaml
violation_report:
  id: V-001
  type: [missing_implementation|wrong_behavior|extra_implementation|naming_violation|type_violation|constraint_violation]
  severity: [Critical|High|Medium|Low]

  spec_reference:
    file: "@specs/feature/spec.md"
    section: "Functional Requirements"
    item: "FR-003"

  spec_says: |
    [Exact quote from spec]

  implementation_says: |
    [What the code actually does]

  location:
    file: "src/routers/tasks.py"
    line: 45

  evidence: |
    [How violation was detected]

  recommendation: |
    [How to fix]

  priority: [P0|P1|P2|P3]
```

### Severity Matrix

```yaml
severity_definitions:

  critical:
    impact: Feature doesn't work as specified
    examples:
      - Missing required functionality
      - Security violation
      - Data integrity issue
    action: Must fix before release

  high:
    impact: Feature works but incorrectly
    examples:
      - Wrong error codes
      - Missing validations
      - Type mismatches
    action: Should fix before release

  medium:
    impact: Inconsistency with spec
    examples:
      - Naming differences
      - Extra features
      - Minor behavior differences
    action: Fix or document deviation

  low:
    impact: Cosmetic or minor
    examples:
      - Error message wording
      - Response field ordering
      - Optional features missing
    action: Consider for future
```

### Common Violation Patterns

```yaml
common_violations:

  auth_mishandling:
    pattern: Wrong status codes for auth errors
    spec_says: 401 for unauthenticated, 403 for unauthorized
    common_error: Using 400 or 403 for both
    detection: Test without token, test with token but wrong user

  field_naming:
    pattern: camelCase instead of snake_case (or vice versa)
    spec_says: field_name
    common_error: fieldName
    detection: Compare field names directly

  missing_validation:
    pattern: Validation specified but not enforced
    spec_says: "Title required, max 255 chars"
    common_error: Accepts empty or too long
    detection: Submit edge case data

  wrong_status_code:
    pattern: Success codes differ from spec
    spec_says: "201 on create"
    common_error: Returns 200
    detection: Check response status

  extra_fields:
    pattern: Response includes unspecified fields
    spec_says: "{ id, title, status }"
    common_error: "{ id, title, status, internal_id }"
    detection: Compare response to spec schema
```

### Violation Tracking

```markdown
## Violation Summary

### By Severity
| Severity | Count | Percentage |
|----------|-------|------------|
| Critical | 2 | 10% |
| High | 5 | 25% |
| Medium | 8 | 40% |
| Low | 5 | 25% |

### By Type
| Type | Count |
|------|-------|
| Wrong Behavior | 4 |
| Missing Implementation | 3 |
| Naming Violation | 6 |
| Type Violation | 2 |
| Extra Implementation | 5 |

### Priority Items
1. **V-001 (Critical)**: Missing authentication check on DELETE endpoint
2. **V-002 (Critical)**: User can access other users' tasks
3. **V-003 (High)**: Wrong status code on create (200 vs 201)
```

## Output Format
Violation detection report with categorized findings suitable for bug tracking and remediation planning.

## Related Skills
- validate-implementation-against-spec
- review-auth-behavior
- provide-correction-suggestions
