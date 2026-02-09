# Skill: Write Spec-Kit Compliant Feature Specification

## Purpose
Create feature specifications that conform to Spec-Kit standards, ensuring consistency, clarity, and completeness across all project features.

## When to Use
- Starting a new feature definition
- Converting informal requirements into formal specs
- Documenting feature scope before implementation begins

## Instruction

### Structure Requirements

A Spec-Kit compliant feature specification MUST include the following sections in order:

1. **Title and Overview**
   - Feature name as H1 heading
   - One-paragraph summary of the feature's purpose
   - Target user or persona

2. **Goals and Non-Goals**
   - Explicit list of what this feature will accomplish
   - Explicit list of what is intentionally excluded

3. **Functional Requirements**
   - Numbered list of specific behaviors
   - Each requirement must be testable
   - Use "MUST", "SHOULD", "MAY" keywords per RFC 2119

4. **User Stories**
   - Format: "As a [role], I want [capability] so that [benefit]"
   - Each story should map to functional requirements

5. **Acceptance Criteria**
   - Given/When/Then format preferred
   - Must cover happy path and error cases
   - Must be independently verifiable

6. **Data Requirements**
   - Entities involved
   - Relationships between entities
   - Required fields and constraints

7. **API Requirements** (if applicable)
   - Endpoint signatures
   - Request/response schemas
   - Authentication requirements

8. **UI Requirements** (if applicable)
   - Page or component descriptions
   - User interaction flows
   - State handling requirements

9. **Constraints and Dependencies**
   - Technical constraints
   - External dependencies
   - Integration requirements

10. **Open Questions**
    - Unresolved decisions
    - Items requiring stakeholder input

### File Naming Convention
```
specs/<feature-name>/spec.md
```

### Quality Checklist
- [ ] All requirements are testable
- [ ] No implementation details in spec
- [ ] Clear success criteria defined
- [ ] Error cases documented
- [ ] Dependencies identified

## Output Format
Markdown file following the structure above, saved to the appropriate specs directory.

## Related Skills
- write-user-stories
- write-acceptance-criteria
- organize-monorepo-specs
