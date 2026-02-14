# Entity Extraction Skill

## Purpose
Extract structured entities from user natural language input for task operations.

## Skill Type
**Information Extraction** - Stateless, deterministic entity parsing

## Input
```json
{
  "user_message": "string",
  "intent": "string"
}
```

## Output Format
```json
{
  "title": "string | null",
  "description": "string | null",
  "task_id": "integer | null",
  "status_filter": "all | pending | completed | null"
}
```

## Entity Definitions

### title
- **Type**: String
- **Used for**: add_task, update_task, delete_task (when searching by name)
- **Extraction rules**:
  - Remove filler words ("please", "can you", "I want to")
  - Preserve meaningful content
  - Normalize capitalization (title case for task names)
  - Max length: 200 characters

### description
- **Type**: String
- **Used for**: add_task, update_task
- **Extraction rules**:
  - Extract additional context beyond title
  - Preserve full sentences
  - Remove conversational filler
  - Max length: 1000 characters

### task_id
- **Type**: Integer
- **Used for**: complete_task, delete_task, update_task
- **Extraction rules**:
  - Must be numeric
  - Extract from phrases like "task 5", "task #3", "id 12"
  - If multiple IDs present, take the first one
  - Return null if not present

### status_filter
- **Type**: Enum (all | pending | completed)
- **Used for**: list_tasks
- **Extraction rules**:
  - Default: "all" if not specified
  - Map synonyms: "done" → "completed", "incomplete" → "pending"
  - Case insensitive

## Extraction Rules

### MUST Follow
1. **Return null for missing entities** - Never fabricate data
2. **Normalize text** - Remove extra whitespace, normalize capitalization
3. **Preserve meaning** - Don't alter user's intent
4. **Type safety** - task_id must be integer or null
5. **No hallucination** - Only extract what's explicitly present

### Context-Aware Extraction
- **add_task**: Prioritize extracting title and description
- **list_tasks**: Focus on status_filter
- **complete_task/delete_task**: Prioritize task_id, fallback to title
- **update_task**: Extract task_id and new title/description

## Examples

### Example 1: Add Task with Title and Description
**Input:**
```json
{
  "user_message": "Add a task to buy groceries tomorrow morning",
  "intent": "add_task"
}
```

**Output:**
```json
{
  "title": "Buy Groceries",
  "description": "Tomorrow morning",
  "task_id": null,
  "status_filter": null
}
```

### Example 2: Complete Task by ID
**Input:**
```json
{
  "user_message": "Mark task 5 as complete",
  "intent": "complete_task"
}
```

**Output:**
```json
{
  "title": null,
  "description": null,
  "task_id": 5,
  "status_filter": null
}
```

### Example 3: List Completed Tasks
**Input:**
```json
{
  "user_message": "Show me all completed tasks",
  "intent": "list_tasks"
}
```

**Output:**
```json
{
  "title": null,
  "description": null,
  "task_id": null,
  "status_filter": "completed"
}
```

### Example 4: Delete Task by Title
**Input:**
```json
{
  "user_message": "Delete the meeting task",
  "intent": "delete_task"
}
```

**Output:**
```json
{
  "title": "Meeting Task",
  "description": null,
  "task_id": null,
  "status_filter": null
}
```

### Example 5: Update Task
**Input:**
```json
{
  "user_message": "Change task 3 to 'Call dentist'",
  "intent": "update_task"
}
```

**Output:**
```json
{
  "title": "Call Dentist",
  "description": null,
  "task_id": 3,
  "status_filter": null
}
```

### Example 6: Minimal Input
**Input:**
```json
{
  "user_message": "Add task",
  "intent": "add_task"
}
```

**Output:**
```json
{
  "title": null,
  "description": null,
  "task_id": null,
  "status_filter": null
}
```

## Text Normalization Rules

### Filler Words to Remove
- "please", "can you", "could you"
- "I want to", "I need to", "I'd like to"
- "go ahead and", "make sure to"

### Capitalization
- **Title**: Title Case (e.g., "Buy Groceries")
- **Description**: Sentence case (e.g., "Tomorrow morning at 9am")

### Whitespace
- Trim leading/trailing spaces
- Collapse multiple spaces to single space
- Remove newlines unless in description

## Edge Cases

### Multiple Tasks Mentioned
**Input:** "Add buy milk and call dentist"
**Output:** Extract first task only: "Buy Milk"

### Ambiguous References
**Input:** "Complete the task"
**Output:** All entities null (no specific task identified)

### Numbers in Title
**Input:** "Add task: Buy 5 apples"
**Output:** title: "Buy 5 Apples" (preserve numbers in content)

### Special Characters
**Input:** "Add task: Review Q4 report (urgent!)"
**Output:** title: "Review Q4 Report (Urgent!)" (preserve meaningful punctuation)

## Quality Standards

### Deterministic Behavior
- Same input + intent → Same output
- No randomness in extraction
- Consistent normalization rules

### Security
- Sanitize special characters that could cause injection
- Limit string lengths
- No code execution from extracted text

### Performance
- Extraction must complete in <50ms
- No external API calls
- Pure text parsing only

## Error Handling

If input is malformed:
```json
{
  "title": null,
  "description": null,
  "task_id": null,
  "status_filter": null
}
```

## Integration Notes

**Upstream**: Receives user message and classified intent from intent-detection
**Downstream**: Passes extracted entities to tool-mapping and tool-chaining
**Stateless**: No memory required
**Reusable**: Can be called multiple times per conversation

---

**Version**: 1.0
**Last Updated**: 2024-02-15
**Skill ID**: SKILL-02-ENTITY-EXTRACTION
