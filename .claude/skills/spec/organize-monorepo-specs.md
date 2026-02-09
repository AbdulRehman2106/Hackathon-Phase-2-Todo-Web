# Skill: Organize Specs for Monorepo Projects

## Purpose
Structure and organize specification files within a monorepo to maintain clarity, discoverability, and proper separation of concerns.

## When to Use
- Setting up a new monorepo project
- Adding new features to existing monorepo
- Restructuring disorganized specifications
- Establishing spec conventions for a team

## Instruction

### Directory Structure

Specs in a monorepo MUST follow this hierarchy:

```
project-root/
├── specs/
│   ├── _shared/                    # Cross-cutting specifications
│   │   ├── authentication.md       # Auth requirements
│   │   ├── authorization.md        # Permission models
│   │   └── error-handling.md       # Error conventions
│   │
│   ├── <feature-name>/             # Feature-specific folder
│   │   ├── spec.md                 # Feature specification
│   │   ├── plan.md                 # Implementation plan
│   │   ├── tasks.md                # Task breakdown
│   │   └── assets/                 # Diagrams, mockups
│   │
│   └── index.md                    # Spec navigation index
│
├── apps/
│   ├── frontend/                   # Next.js app
│   └── backend/                    # FastAPI app
│
└── packages/                       # Shared packages
```

### Naming Conventions

1. **Feature Folders**: kebab-case (e.g., `user-authentication`, `task-management`)
2. **Spec Files**: Always `spec.md` within feature folder
3. **Plan Files**: Always `plan.md` within feature folder
4. **Task Files**: Always `tasks.md` within feature folder

### Index File Structure

The `specs/index.md` MUST contain:

```markdown
# Specifications Index

## Features

| Feature | Status | Spec | Plan | Tasks |
|---------|--------|------|------|-------|
| User Auth | In Progress | [spec](./user-auth/spec.md) | [plan](./user-auth/plan.md) | [tasks](./user-auth/tasks.md) |
| Task CRUD | Draft | [spec](./task-crud/spec.md) | - | - |

## Shared Specifications

- [Authentication](/_shared/authentication.md)
- [Authorization](/_shared/authorization.md)
- [Error Handling](/_shared/error-handling.md)

## Status Legend

- **Draft**: Initial specification, not reviewed
- **Review**: Awaiting stakeholder approval
- **Approved**: Ready for implementation
- **In Progress**: Currently being implemented
- **Complete**: Implementation finished
```

### Cross-Referencing Rules

1. **Internal References**: Use relative paths
   ```markdown
   See [authentication spec](../_shared/authentication.md)
   ```

2. **Code References**: Use @specs notation
   ```markdown
   Implementation follows @specs/user-auth/spec.md
   ```

3. **Dependency Declaration**: In spec.md frontmatter or dedicated section
   ```markdown
   ## Dependencies
   - @specs/_shared/authentication.md
   - @specs/user-management/spec.md
   ```

### Separation of Concerns

| File | Contains | Does NOT Contain |
|------|----------|------------------|
| spec.md | What and Why | How (implementation) |
| plan.md | How (architecture) | Code |
| tasks.md | Implementation steps | Business requirements |

### Versioning Specs

For breaking changes, maintain version history:

```
specs/
└── task-management/
    ├── spec.md           # Current version
    ├── spec.v1.md        # Previous version
    └── CHANGELOG.md      # Version history
```

## Output Format
Directory structure and properly organized markdown files following the conventions above.

## Related Skills
- write-feature-specification
- reference-specs-notation
- validate-spec-structure
