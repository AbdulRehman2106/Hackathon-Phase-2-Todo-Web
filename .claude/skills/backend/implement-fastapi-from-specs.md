# Skill: Implement FastAPI Applications from Specs

## Purpose
Guide the implementation of FastAPI applications that strictly follow specification documents, ensuring alignment between design and implementation.

## When to Use
- Starting backend implementation from specs
- Verifying implementation matches specifications
- Establishing spec-to-code workflow patterns
- Training on spec-driven development

## Instruction

### Spec-to-Implementation Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                 SPEC-TO-IMPLEMENTATION FLOW                      │
└─────────────────────────────────────────────────────────────────┘

1. READ SPEC
   ┌──────────────┐
   │ spec.md      │ Extract requirements
   │ plan.md      │ Understand architecture
   │ tasks.md     │ Follow task order
   └──────┬───────┘
          │
2. MAP TO FASTAPI
          │
          ▼
   ┌──────────────┐
   │ Endpoints    │──▶ Router definitions
   │ Data Models  │──▶ Pydantic schemas
   │ Auth Rules   │──▶ Dependency injection
   │ Validations  │──▶ Field validators
   └──────┬───────┘
          │
3. IMPLEMENT
          │
          ▼
   ┌──────────────┐
   │ Code files   │ Following structure
   │ Test files   │ Matching acceptance criteria
   └──────────────┘
```

### Reading Specifications

#### From spec.md: Extract Requirements

```yaml
extract_from_spec:
  functional_requirements:
    location: "Functional Requirements" section
    maps_to: FastAPI endpoints and business logic

  acceptance_criteria:
    location: "Acceptance Criteria" section
    maps_to: Test cases and validation logic

  data_requirements:
    location: "Data Requirements" section
    maps_to: SQLModel models and Pydantic schemas

  api_requirements:
    location: "API Requirements" section
    maps_to: Route definitions, request/response models

  error_cases:
    location: Within acceptance criteria
    maps_to: Exception handlers and error responses
```

#### From plan.md: Extract Architecture

```yaml
extract_from_plan:
  endpoint_definitions:
    location: "API Design" section
    maps_to: Router structure

  authentication_flow:
    location: "Authentication" section
    maps_to: Auth middleware, dependencies

  database_schema:
    location: "Database Design" section
    maps_to: SQLModel models

  error_handling:
    location: "Error Handling" section
    maps_to: Exception classes, handlers
```

### Mapping Spec to FastAPI Components

#### Endpoint Mapping

```yaml
spec_requirement: |
  POST /api/tasks - Create a new task
  - Authentication: Required
  - Request: { title: string, description?: string }
  - Response: 201 with created task

fastapi_implementation:
  router_file: routers/tasks.py
  components:
    - Route decorator with method and path
    - Request model (Pydantic)
    - Response model (Pydantic)
    - Auth dependency
    - Handler function

  mapping:
    path: "/tasks"
    method: post
    request_model: TaskCreate
    response_model: TaskResponse
    dependencies: [get_current_user]
    status_code: 201
```

#### Data Model Mapping

```yaml
spec_data_requirement: |
  Task Entity:
  - id: UUID (auto-generated)
  - user_id: UUID (owner)
  - title: string (required, max 255 chars)
  - description: string (optional)
  - status: enum (pending, in_progress, completed)
  - created_at: timestamp

sqlmodel_mapping:
  model_class: Task
  fields:
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id")
    title: str = Field(max_length=255)
    description: str | None = Field(default=None)
    status: str = Field(default="pending")
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

#### Acceptance Criteria Mapping

```yaml
spec_acceptance_criteria: |
  AC1: Successful Task Creation
  Given I am logged in
  When I submit a task with valid title
  Then the task is created with my user_id
  And I receive 201 status

test_implementation:
  test_name: test_create_task_success
  setup:
    - Authenticated user fixture
    - Valid task data
  action:
    - POST /api/tasks with data
  assertions:
    - Response status == 201
    - Response body contains task
    - task.user_id == authenticated user's id
```

### Implementation Checklist from Spec

For each spec section, verify:

```yaml
functional_requirements:
  - [ ] Each requirement has corresponding endpoint
  - [ ] Business logic matches requirement exactly
  - [ ] Edge cases from spec are handled

acceptance_criteria:
  - [ ] Each AC has corresponding test
  - [ ] Happy path tested
  - [ ] Error paths tested
  - [ ] All Given/When/Then steps verified

data_requirements:
  - [ ] SQLModel models match spec entities
  - [ ] Field types match spec
  - [ ] Constraints match spec
  - [ ] Relationships defined

api_requirements:
  - [ ] All endpoints implemented
  - [ ] Request/response schemas match spec
  - [ ] Status codes match spec
  - [ ] Error responses match spec

authentication:
  - [ ] Auth required where spec says
  - [ ] User context available in handlers
  - [ ] Ownership checks implemented
```

### Code Structure from Spec

```yaml
spec_organization:
  feature: task-management
  spec_file: specs/task-management/spec.md
  plan_file: specs/task-management/plan.md

maps_to_code:
  router: apps/backend/src/routers/tasks.py
  models: apps/backend/src/models/task.py
  schemas: apps/backend/src/schemas/task.py
  services: apps/backend/src/services/task_service.py
  tests: apps/backend/tests/test_tasks.py

naming_convention:
  spec_feature: task-management
  router_name: tasks
  model_name: Task
  schema_prefix: Task (TaskCreate, TaskResponse, etc.)
```

### Validation Requirements from Spec

```yaml
spec_validation: |
  Title must be:
  - Required
  - Between 1 and 255 characters
  - Not empty or whitespace only

pydantic_implementation:
  field: title
  type: str
  validators:
    - min_length=1
    - max_length=255
    - strip_whitespace (custom validator)

spec_business_rule: |
  User can only have 100 active tasks

implementation:
  location: Service layer
  check: Before task creation
  error: 400 with "Task limit exceeded"
```

### Error Mapping from Spec

```yaml
spec_errors:
  - condition: Missing authentication
    response: 401 Unauthorized
  - condition: Task not found
    response: 404 Not Found
  - condition: Task not owned by user
    response: 404 Not Found (not 403)
  - condition: Invalid task data
    response: 422 Validation Error

fastapi_implementation:
  error_handlers:
    - AuthenticationError → 401
    - NotFoundError → 404
    - ValidationError → 422

  ownership_handling:
    query_pattern: WHERE id = :id AND user_id = :user_id
    not_found_same_as_not_owned: True
```

### Spec Reference in Code

Include spec references in implementation:

```python
# Implementation follows @specs/task-management/spec.md#FR-001
# See acceptance criteria: @specs/task-management/spec.md#AC-001
```

### Verification Process

```yaml
before_marking_complete:
  1. Read spec section being implemented
  2. Implement feature
  3. Write tests matching acceptance criteria
  4. Run tests, ensure all pass
  5. Cross-reference implementation with spec
  6. Document any deviations (should be minimal)

deviation_handling:
  if_spec_unclear:
    - Ask for clarification
    - Document assumption
    - Update spec if authorized
  if_spec_impossible:
    - Raise issue before implementing
    - Never silently deviate from spec
```

## Output Format
Implementation guidance and verification checklist for spec-driven FastAPI development.

## Related Skills
- structure-backend-projects
- apply-auth-middleware
- handle-errors-edge-cases
