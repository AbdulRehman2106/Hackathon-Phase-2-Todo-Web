# Skill: Write User Stories and Acceptance Criteria

## Purpose
Create well-formed user stories with comprehensive acceptance criteria that clearly communicate feature requirements from the user's perspective.

## When to Use
- Defining feature requirements from user perspective
- Breaking down features into implementable units
- Establishing testable success criteria

## Instruction

### User Story Format

Every user story MUST follow this template:

```
As a [specific role/persona],
I want [specific capability/action],
So that [measurable benefit/outcome].
```

### Story Quality Rules

1. **Independent**: Stories should be self-contained and implementable without depending on other stories
2. **Negotiable**: Details can be discussed, but core intent is clear
3. **Valuable**: Delivers clear value to the user or business
4. **Estimable**: Scope is clear enough to estimate effort
5. **Small**: Can be completed in a single iteration
6. **Testable**: Has clear pass/fail criteria

### Acceptance Criteria Format

Use Given/When/Then (Gherkin) format:

```
Given [precondition/context],
When [action/trigger],
Then [expected outcome].
```

### Acceptance Criteria Requirements

Each user story MUST have acceptance criteria covering:

1. **Happy Path**: Normal successful flow
2. **Validation Errors**: Invalid input handling
3. **Authorization**: Permission checks
4. **Edge Cases**: Boundary conditions
5. **Error States**: System failure handling

### Example Structure

```markdown
## User Story: Create Task

As a registered user,
I want to create a new task,
So that I can track my work items.

### Acceptance Criteria

**AC1: Successful Task Creation**
Given I am logged in as a registered user,
When I submit a task with valid title and description,
Then the task is created with my user ID as owner,
And I receive confirmation of successful creation.

**AC2: Title Validation**
Given I am logged in as a registered user,
When I submit a task with an empty title,
Then the task is not created,
And I receive a validation error message.

**AC3: Unauthorized Access**
Given I am not logged in,
When I attempt to create a task,
Then the request is rejected with 401 Unauthorized.
```

### Mapping to Requirements

Each user story should:
- Reference the functional requirement it fulfills
- Include a unique identifier (US-001, US-002, etc.)
- Be traceable to acceptance criteria

### Anti-Patterns to Avoid

- Generic roles ("As a user" without specificity)
- Technical implementation details in story
- Multiple actions in single story
- Missing "so that" benefit clause
- Vague acceptance criteria

## Output Format
Markdown with structured user stories and acceptance criteria, suitable for inclusion in spec.md.

## Related Skills
- write-feature-specification
- write-acceptance-criteria
- validate-spec-compliance
