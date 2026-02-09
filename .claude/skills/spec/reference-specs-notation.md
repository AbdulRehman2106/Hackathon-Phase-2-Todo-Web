# Skill: Reference Specs Using @specs Notation

## Purpose
Establish and use a consistent notation system for referencing specifications across the codebase, documentation, and communication.

## When to Use
- Referencing specs in code comments
- Linking specs in documentation
- Communicating about specs in discussions
- Creating traceability between implementation and requirements

## Instruction

### @specs Notation Format

The standard notation for referencing specifications is:

```
@specs/<path-to-spec>
```

### Reference Types

#### 1. Feature Specification Reference
```
@specs/task-management/spec.md
@specs/user-authentication/spec.md
```

#### 2. Shared Specification Reference
```
@specs/_shared/authentication.md
@specs/_shared/error-handling.md
```

#### 3. Section Reference (with anchor)
```
@specs/task-management/spec.md#acceptance-criteria
@specs/user-auth/spec.md#functional-requirements
```

#### 4. Plan Reference
```
@specs/task-management/plan.md
@specs/user-auth/plan.md#api-design
```

#### 5. Task Reference
```
@specs/task-management/tasks.md
@specs/task-management/tasks.md#task-3
```

### Usage Contexts

#### In Code Comments
```python
# Implements @specs/task-management/spec.md#FR-001
def create_task(title: str, user_id: str):
    pass
```

```typescript
// See @specs/user-auth/spec.md#login-flow
async function handleLogin() {}
```

#### In Commit Messages
```
feat(tasks): implement task creation

Implements @specs/task-management/spec.md#US-001
- Add POST /api/tasks endpoint
- Validate required fields
```

#### In Pull Request Descriptions
```markdown
## Changes
Implements the task creation feature.

## Spec Reference
- @specs/task-management/spec.md
- @specs/task-management/plan.md#api-endpoints

## Acceptance Criteria
All criteria from @specs/task-management/spec.md#acceptance-criteria verified.
```

#### In Documentation
```markdown
## Task Management API

This API implements the requirements defined in @specs/task-management/spec.md.

### Authentication
All endpoints require authentication as specified in @specs/_shared/authentication.md.
```

### Resolution Rules

When resolving @specs references:

1. **Root**: Always relative to project root `specs/` directory
2. **Case Sensitivity**: Use exact case matching
3. **File Extension**: Always include `.md` extension
4. **Anchors**: Use lowercase, hyphen-separated anchors

### Validation Checklist

A valid @specs reference MUST:
- [ ] Point to an existing file
- [ ] Use correct relative path from specs root
- [ ] Include file extension
- [ ] Use valid anchor if section reference

### Anti-Patterns

| Incorrect | Correct |
|-----------|---------|
| `@spec/tasks` | `@specs/task-management/spec.md` |
| `@specs/tasks/` | `@specs/task-management/spec.md` |
| `specs/task-management` | `@specs/task-management/spec.md` |
| `@specs/TaskManagement/spec.md` | `@specs/task-management/spec.md` |

### IDE Integration Hints

For tooling that supports custom link resolution:

```json
{
  "specReference": {
    "pattern": "@specs/([\\w-/]+\\.md)(#[\\w-]+)?",
    "basePath": "./specs"
  }
}
```

## Output Format
Properly formatted @specs references suitable for the target context (code, documentation, communication).

## Related Skills
- organize-monorepo-specs
- write-feature-specification
- validate-spec-compliance
