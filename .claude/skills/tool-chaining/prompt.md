# Tool Chaining Skill

## Purpose
Generate multi-step execution plans when a user request requires multiple MCP tool calls in sequence.

## Skill Type
**Planning** - Stateless, deterministic execution plan generation

## Input
```json
{
  "intent": "string",
  "entities": {
    "title": "string | null",
    "description": "string | null",
    "task_id": "integer | null",
    "status_filter": "string | null"
  },
  "user_message": "string"
}
```

## Output Format
```json
{
  "requires_chaining": true | false,
  "steps": [
    {
      "step_number": 1,
      "tool": "string",
      "reason": "string",
      "depends_on": "integer | null"
    }
  ]
}
```

## Chaining Decision Logic

### Single-Step Operations (requires_chaining: false)
- **add_task** with title provided
- **list_tasks** with or without filter
- **complete_task** with task_id provided
- **delete_task** with task_id provided
- **update_task** with task_id provided
- **identity_query** (always single step)

### Multi-Step Operations (requires_chaining: true)

#### Scenario 1: Delete/Complete by Title
**User says:** "Delete the meeting task"
**Problem:** No task_id provided, only title
**Solution:**
1. `list_tasks` - Get all tasks
2. Match by title (internal logic)
3. `delete_task` - Delete matched task

#### Scenario 2: Update by Title
**User says:** "Change the grocery task to 'Buy milk'"
**Problem:** No task_id, need to find task first
**Solution:**
1. `list_tasks` - Get all tasks
2. Match by old title
3. `update_task` - Update with new title

#### Scenario 3: Ambiguous Reference
**User says:** "Mark it as done"
**Problem:** No task specified
**Solution:**
1. `list_tasks` - Show pending tasks
2. User clarification required (return to conversation)

## Chaining Rules

### MUST Follow
1. **Minimize steps** - Use fewest tools necessary
2. **Preserve order** - Dependencies must execute in sequence
3. **No redundancy** - Don't call same tool twice unless required
4. **Fail fast** - If step 1 fails, don't execute step 2
5. **Explicit dependencies** - Use `depends_on` to link steps

### Step Dependencies
- `depends_on: null` - Can execute immediately
- `depends_on: 1` - Must wait for step 1 to complete
- `depends_on: 2` - Must wait for step 2 to complete

## Examples

### Example 1: Single Step (No Chaining)
**Input:**
```json
{
  "intent": "add_task",
  "entities": {
    "title": "Buy groceries",
    "description": null,
    "task_id": null,
    "status_filter": null
  },
  "user_message": "Add a task to buy groceries"
}
```

**Output:**
```json
{
  "requires_chaining": false,
  "steps": [
    {
      "step_number": 1,
      "tool": "add_task",
      "reason": "Direct task creation with title provided",
      "depends_on": null
    }
  ]
}
```

### Example 2: Delete by Title (Chaining Required)
**Input:**
```json
{
  "intent": "delete_task",
  "entities": {
    "title": "Meeting task",
    "description": null,
    "task_id": null,
    "status_filter": null
  },
  "user_message": "Delete the meeting task"
}
```

**Output:**
```json
{
  "requires_chaining": true,
  "steps": [
    {
      "step_number": 1,
      "tool": "list_tasks",
      "reason": "Retrieve all tasks to find task_id by title match",
      "depends_on": null
    },
    {
      "step_number": 2,
      "tool": "delete_task",
      "reason": "Delete task after identifying task_id from step 1",
      "depends_on": 1
    }
  ]
}
```

### Example 3: Complete by Title (Chaining Required)
**Input:**
```json
{
  "intent": "complete_task",
  "entities": {
    "title": "Grocery shopping",
    "description": null,
    "task_id": null,
    "status_filter": null
  },
  "user_message": "Mark grocery shopping as done"
}
```

**Output:**
```json
{
  "requires_chaining": true,
  "steps": [
    {
      "step_number": 1,
      "tool": "list_tasks",
      "reason": "Find task_id by matching title 'Grocery shopping'",
      "depends_on": null
    },
    {
      "step_number": 2,
      "tool": "complete_task",
      "reason": "Mark identified task as completed",
      "depends_on": 1
    }
  ]
}
```

### Example 4: Update by Title (Chaining Required)
**Input:**
```json
{
  "intent": "update_task",
  "entities": {
    "title": "Call dentist",
    "description": null,
    "task_id": null,
    "status_filter": null
  },
  "user_message": "Change the meeting task to 'Call dentist'"
}
```

**Output:**
```json
{
  "requires_chaining": true,
  "steps": [
    {
      "step_number": 1,
      "tool": "list_tasks",
      "reason": "Find task_id of 'meeting task' to update",
      "depends_on": null
    },
    {
      "step_number": 2,
      "tool": "update_task",
      "reason": "Update task title to 'Call dentist'",
      "depends_on": 1
    }
  ]
}
```

### Example 5: Direct Operation with ID (No Chaining)
**Input:**
```json
{
  "intent": "complete_task",
  "entities": {
    "title": null,
    "description": null,
    "task_id": 5,
    "status_filter": null
  },
  "user_message": "Complete task 5"
}
```

**Output:**
```json
{
  "requires_chaining": false,
  "steps": [
    {
      "step_number": 1,
      "tool": "complete_task",
      "reason": "Direct completion with task_id provided",
      "depends_on": null
    }
  ]
}
```

## Edge Cases

### Ambiguous Reference
**Input:** "Mark it as done" (no task specified)
**Output:**
```json
{
  "requires_chaining": true,
  "steps": [
    {
      "step_number": 1,
      "tool": "list_tasks",
      "reason": "Show pending tasks for user to clarify which task",
      "depends_on": null
    }
  ]
}
```
**Note:** Execution stops after step 1, awaiting user clarification.

### Multiple Matches Possible
**Input:** "Delete the task" (generic reference)
**Output:** Same as ambiguous reference - list tasks first.

### No Entities Extracted
**Input:** "Do something"
**Output:**
```json
{
  "requires_chaining": false,
  "steps": []
}
```
**Note:** Cannot generate plan without entities.

## Quality Standards

### Deterministic Behavior
- Same input → Same execution plan
- No randomness in step generation
- Consistent dependency ordering

### Security
- Never chain destructive operations without confirmation
- Validate each step's authorization independently
- No cross-user operations in chain

### Performance
- Plan generation must complete in <100ms
- Maximum 3 steps per chain
- No circular dependencies

## Error Handling

### Invalid Input
If entities are malformed or intent is unknown:
```json
{
  "requires_chaining": false,
  "steps": []
}
```

### Impossible Chain
If operation cannot be completed with available tools:
```json
{
  "requires_chaining": false,
  "steps": []
}
```

## Integration Notes

**Upstream**: Receives intent and entities from entity-extraction
**Downstream**: Passes execution plan to orchestrator for sequential execution
**Stateless**: No memory of previous chains
**Reusable**: Each request generates independent plan

## Execution Contract

When `requires_chaining: true`:
1. Execute steps in order
2. Pass output of step N to step N+1
3. If any step fails, halt execution
4. Return error from failed step
5. Do not execute remaining steps

## Testing Checklist

- [ ] Single-step operations return requires_chaining: false
- [ ] Multi-step operations have correct dependencies
- [ ] Step order is logical and minimal
- [ ] No circular dependencies
- [ ] Maximum 3 steps enforced
- [ ] Ambiguous cases handled gracefully
- [ ] Performance under 100ms

---

**Version**: 1.0
**Last Updated**: 2024-02-15
**Skill ID**: SKILL-04-TOOL-CHAINING
