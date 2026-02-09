# Write Acceptance Criteria

## Purpose
Guide the creation of clear, testable acceptance criteria that define when a feature is complete and working correctly.

## Skill Description
This skill provides techniques for writing effective acceptance criteria using Given-When-Then format and other structured approaches.

## Core Principles

### What Are Acceptance Criteria?
Acceptance criteria are specific conditions that must be met for a feature to be considered complete and acceptable. They:
- Define the boundaries of a user story
- Provide testable conditions
- Clarify requirements for all stakeholders
- Serve as the basis for test cases
- Prevent scope creep

### Characteristics of Good Acceptance Criteria
- **Testable**: Can be verified objectively
- **Clear**: No ambiguity in interpretation
- **Concise**: Brief but complete
- **User-focused**: Written from user perspective
- **Achievable**: Realistic within constraints
- **Independent**: Not dependent on other stories' criteria

## Given-When-Then Format

### Structure
```
Given [precondition or context]
When [action or event]
Then [expected outcome]
```

### Components

**Given (Context)**:
- Initial state or precondition
- What must be true before the action
- Can have multiple Given statements

**When (Action)**:
- The action taken by the user or system
- The trigger or event
- Usually a single action

**Then (Outcome)**:
- Expected result or behavior
- Observable change in system state
- Can have multiple Then statements

### Examples

**User Authentication**:
```
Given I am on the login page
And I have a valid account
When I enter my correct email and password
And I click the "Log In" button
Then I am redirected to my dashboard
And I see a welcome message with my name
```

**Task Creation**:
```
Given I am logged in as a registered user
When I enter a task title "Buy groceries"
And I click the "Create Task" button
Then the task appears in my task list
And I see a success message "Task created successfully"
```

**Validation Error**:
```
Given I am on the task creation form
When I leave the title field empty
And I click the "Create Task" button
Then I see an error message "Title is required"
And the task is not created
And I remain on the creation form
```

## Alternative Formats

### Scenario-Based
```
Scenario: User creates a task successfully
- User is logged in
- User navigates to task creation page
- User enters task title "Complete project"
- User clicks "Create Task"
- Task appears in task list
- Success message is displayed
```

### Checklist Format
```
Task Creation Acceptance Criteria:
- [ ] User can enter a task title (required)
- [ ] User can enter a task description (optional)
- [ ] User can set a due date (optional)
- [ ] Task is saved to database
- [ ] Task appears in user's task list
- [ ] Success message is shown
- [ ] Empty title shows error message
- [ ] User cannot create task without title
```

### Rule-Based Format
```
Rules for Task Completion:
1. Only the task owner can mark a task as complete
2. Completed tasks show a checkmark icon
3. Completed tasks move to "Completed" section
4. Completion timestamp is recorded
5. Completed tasks can be uncompleted
```

## Coverage Areas

### Happy Path
The expected, successful flow:
```
Given I am logged in
When I create a task with valid data
Then the task is created successfully
```

### Error Cases
What happens when things go wrong:
```
Given I am not logged in
When I try to create a task
Then I am redirected to the login page

Given I am logged in
When I submit a task without a title
Then I see an error message
And the task is not created
```

### Edge Cases
Boundary conditions and unusual scenarios:
```
Given I am logged in
When I enter a task title with 500 characters (maximum)
Then the task is created successfully

Given I am logged in
When I enter a task title with 501 characters
Then I see an error "Title must be 500 characters or less"
```

### Security Cases
Authorization and access control:
```
Given I am logged in as User A
When I try to edit User B's task
Then I receive a "Permission denied" error
And the task is not modified
```

### Performance Cases
Speed and responsiveness:
```
Given I am on the task list page
When the page loads
Then all tasks are displayed within 2 seconds
```

## Writing Effective Criteria

### Be Specific
**Bad**: "The system should work correctly"
**Good**: "When a user submits a valid task, it appears in their task list within 1 second"

### Use Measurable Terms
**Bad**: "The page should load quickly"
**Good**: "The page should load within 2 seconds for 95% of requests"

### Focus on Outcomes, Not Implementation
**Bad**: "The system uses PostgreSQL to store tasks"
**Good**: "Tasks are persisted and available after page refresh"

### Include All Scenarios
Don't just test the happy path:
- Success scenarios
- Validation failures
- Authorization failures
- Network errors
- Edge cases
- Concurrent operations

### Make Them Independent
Each criterion should be testable independently:
**Bad**: "User can create and edit tasks"
**Good**:
- "User can create tasks"
- "User can edit their own tasks"

## Common Patterns

### CRUD Operations

**Create**:
```
Given I am authenticated
When I submit valid data
Then the resource is created
And I see a success confirmation
And the resource appears in the list
```

**Read**:
```
Given I am authenticated
And I have created resources
When I view the resource list
Then I see all my resources
And each resource shows correct data
```

**Update**:
```
Given I am authenticated
And I own a resource
When I modify the resource
And I save changes
Then the resource is updated
And I see the updated data
```

**Delete**:
```
Given I am authenticated
And I own a resource
When I delete the resource
And I confirm deletion
Then the resource is removed
And I no longer see it in the list
```

### Authentication

**Login**:
```
Given I have a valid account
When I enter correct credentials
Then I am logged in
And I am redirected to the dashboard
And my session is maintained
```

**Logout**:
```
Given I am logged in
When I click logout
Then I am logged out
And I am redirected to the login page
And my session is terminated
```

### Validation

**Required Fields**:
```
Given I am on a form
When I submit without required field [X]
Then I see error "[X] is required"
And the form is not submitted
```

**Format Validation**:
```
Given I am on a form
When I enter invalid email format
Then I see error "Please enter a valid email"
And the form is not submitted
```

## Acceptance Criteria for Different Feature Types

### User Interface Features
```
Given I am on the [page]
When I [interact with element]
Then I see [visual change]
And [state change occurs]
```

### API Endpoints
```
Given I am authenticated
When I send [HTTP method] to [endpoint] with [data]
Then I receive [status code]
And the response contains [expected data]
```

### Background Jobs
```
Given [condition exists]
When [time trigger occurs]
Then [job executes]
And [expected side effect happens]
```

### Integrations
```
Given [external system is available]
When [trigger occurs]
Then [data is sent/received]
And [local state is updated]
```

## Validation Checklist

Before finalizing acceptance criteria, verify:
- [ ] All criteria are testable
- [ ] Happy path is covered
- [ ] Error cases are included
- [ ] Edge cases are addressed
- [ ] Security requirements are specified
- [ ] Performance expectations are defined
- [ ] Criteria are independent
- [ ] Language is clear and unambiguous
- [ ] User perspective is maintained
- [ ] Success and failure states are defined

## Anti-Patterns to Avoid

### 1. Too Vague
**Bad**: "The feature should work well"
**Good**: "When a user creates a task, it appears in their list within 1 second"

### 2. Implementation Details
**Bad**: "The system uses JWT tokens for authentication"
**Good**: "Users remain logged in across browser sessions"

### 3. Multiple Actions in One Criterion
**Bad**: "User can create, edit, and delete tasks"
**Good**: Separate criteria for create, edit, and delete

### 4. Untestable Criteria
**Bad**: "The interface should be intuitive"
**Good**: "Users can create a task without viewing documentation"

### 5. Missing Negative Cases
Only testing success scenarios without error handling

### 6. Ambiguous Language
**Bad**: "The system should respond quickly"
**Good**: "API responses complete within 200ms for 95% of requests"

## Integration with Testing

### Test Case Mapping
Each acceptance criterion should map to one or more test cases:

**Acceptance Criterion**:
```
Given I am logged in
When I create a task with title "Test Task"
Then the task appears in my task list
```

**Test Cases**:
1. Verify task appears in list after creation
2. Verify task has correct title
3. Verify task belongs to logged-in user
4. Verify task has creation timestamp

### Automated Testing
Acceptance criteria should be automatable:
```javascript
describe('Task Creation', () => {
  it('should create task when user is logged in', async () => {
    // Given
    await loginAsUser();

    // When
    await createTask({ title: 'Test Task' });

    // Then
    const tasks = await getTaskList();
    expect(tasks).toContainTask('Test Task');
  });
});
```

## Best Practices

1. **Write Criteria Early**: Define acceptance criteria before implementation

2. **Collaborate**: Involve developers, testers, and stakeholders

3. **Keep It Simple**: One criterion per condition

4. **Be Consistent**: Use the same format throughout

5. **Review Regularly**: Update criteria as understanding evolves

6. **Link to Tests**: Ensure each criterion has corresponding tests

7. **Use Examples**: Provide concrete examples for clarity

8. **Consider All Users**: Include criteria for different user roles

## Success Indicators

Effective acceptance criteria result in:
- Clear definition of "done"
- Reduced ambiguity and rework
- Comprehensive test coverage
- Aligned stakeholder expectations
- Faster development cycles
- Higher quality deliverables

---

**Application**: Use this skill when defining requirements for user stories, creating test plans, or clarifying feature scope with stakeholders.
