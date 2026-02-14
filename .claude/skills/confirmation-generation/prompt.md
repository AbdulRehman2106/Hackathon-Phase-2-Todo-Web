# Confirmation Generation Skill

## Purpose
Generate human-friendly confirmation messages after successful MCP tool execution.

## Skill Type
**Response Generation** - Stateless, deterministic message formatting

## Input
```json
{
  "tool_name": "string",
  "tool_response": {
    "success": true,
    "data": {}
  },
  "user_message": "string"
}
```

## Output Format
```json
{
  "message": "string",
  "tone": "professional | casual"
}
```

## Confirmation Templates by Tool

### add_task
**Template:** "Task '[title]' has been added to your list."

**Example:**
```json
{
  "message": "Task 'Buy groceries' has been added to your list.",
  "tone": "professional"
}
```

### list_tasks
**Template:** "Found [count] task(s). [summary]"

**Examples:**
- 0 tasks: "You have no tasks yet. Add one to get started!"
- 1 task: "You have 1 task: [title]"
- Multiple: "Found 5 tasks. 3 pending, 2 completed."

### complete_task
**Template:** "Task '[title]' marked as completed."

**Example:**
```json
{
  "message": "Task 'Buy groceries' marked as completed.",
  "tone": "professional"
}
```

### delete_task
**Template:** "Task '[title]' has been deleted."

**Example:**
```json
{
  "message": "Task 'Old meeting' has been deleted.",
  "tone": "professional"
}
```

### update_task
**Template:** "Task updated successfully. [changes]"

**Example:**
```json
{
  "message": "Task updated successfully. Title changed to 'Call dentist'.",
  "tone": "professional"
}
```

### get_user_info
**Template:** "Your email is [email]."

**Example:**
```json
{
  "message": "Your email is user@example.com.",
  "tone": "professional"
}
```

## Message Generation Rules

### MUST Follow
1. **Confirm action clearly** - State what was done
2. **Include task title** - Reference the specific task when available
3. **Professional tone** - Default to professional unless casual detected
4. **No internal IDs** - Don't expose database IDs unless useful
5. **Concise** - Keep under 100 characters when possible
6. **No emojis** - Unless informal tone detected in user message

### Tone Detection
**Professional tone** (default):
- Formal language
- Complete sentences
- No slang or abbreviations

**Casual tone** (when user uses informal language):
- Conversational style
- Contractions allowed ("you're", "it's")
- Friendly phrasing

**Informal indicators in user message:**
- "hey", "yo", "sup"
- Emojis present
- All lowercase
- Slang terms

## Examples

### Example 1: Add Task Success
**Input:**
```json
{
  "tool_name": "add_task",
  "tool_response": {
    "success": true,
    "data": {
      "task_id": 42,
      "title": "Buy groceries",
      "status": "pending"
    }
  },
  "user_message": "Add a task to buy groceries"
}
```

**Output:**
```json
{
  "message": "Task 'Buy groceries' has been added to your list.",
  "tone": "professional"
}
```

### Example 2: List Tasks (Multiple)
**Input:**
```json
{
  "tool_name": "list_tasks",
  "tool_response": {
    "success": true,
    "data": {
      "tasks": [
        {"id": 1, "title": "Buy milk", "status": "pending"},
        {"id": 2, "title": "Call dentist", "status": "pending"},
        {"id": 3, "title": "Finish report", "status": "completed"}
      ]
    }
  },
  "user_message": "Show my tasks"
}
```

**Output:**
```json
{
  "message": "Found 3 tasks. 2 pending, 1 completed.",
  "tone": "professional"
}
```

### Example 3: List Tasks (Empty)
**Input:**
```json
{
  "tool_name": "list_tasks",
  "tool_response": {
    "success": true,
    "data": {
      "tasks": []
    }
  },
  "user_message": "What's on my list?"
}
```

**Output:**
```json
{
  "message": "You have no tasks yet. Add one to get started!",
  "tone": "professional"
}
```

### Example 4: Complete Task
**Input:**
```json
{
  "tool_name": "complete_task",
  "tool_response": {
    "success": true,
    "data": {
      "task_id": 5,
      "title": "Buy groceries",
      "status": "completed"
    }
  },
  "user_message": "Mark task 5 as done"
}
```

**Output:**
```json
{
  "message": "Task 'Buy groceries' marked as completed.",
  "tone": "professional"
}
```

### Example 5: Delete Task
**Input:**
```json
{
  "tool_name": "delete_task",
  "tool_response": {
    "success": true,
    "data": {
      "task_id": 8,
      "title": "Old meeting"
    }
  },
  "user_message": "Delete the old meeting task"
}
```

**Output:**
```json
{
  "message": "Task 'Old meeting' has been deleted.",
  "tone": "professional"
}
```

### Example 6: Update Task
**Input:**
```json
{
  "tool_name": "update_task",
  "tool_response": {
    "success": true,
    "data": {
      "task_id": 3,
      "old_title": "Meeting",
      "new_title": "Call dentist"
    }
  },
  "user_message": "Change task 3 to 'Call dentist'"
}
```

**Output:**
```json
{
  "message": "Task updated successfully. Title changed to 'Call dentist'.",
  "tone": "professional"
}
```

### Example 7: Casual Tone Detection
**Input:**
```json
{
  "tool_name": "add_task",
  "tool_response": {
    "success": true,
    "data": {
      "task_id": 10,
      "title": "Buy milk"
    }
  },
  "user_message": "hey add buy milk to my list"
}
```

**Output:**
```json
{
  "message": "Got it! 'Buy milk' is now on your list.",
  "tone": "casual"
}
```

### Example 8: Identity Query
**Input:**
```json
{
  "tool_name": "get_user_info",
  "tool_response": {
    "success": true,
    "data": {
      "email": "john.doe@example.com",
      "user_id": 123
    }
  },
  "user_message": "What's my email?"
}
```

**Output:**
```json
{
  "message": "Your email is john.doe@example.com.",
  "tone": "professional"
}
```

## Edge Cases

### Task Title Too Long
If title exceeds 50 characters, truncate with ellipsis:
```json
{
  "message": "Task 'Review the quarterly financial report and...' has been added.",
  "tone": "professional"
}
```

### Multiple Changes in Update
```json
{
  "message": "Task updated successfully. Title and description changed.",
  "tone": "professional"
}
```

### List with Filter Applied
```json
{
  "message": "Found 3 completed tasks.",
  "tone": "professional"
}
```

## Quality Standards

### Deterministic Behavior
- Same tool response → Same confirmation message
- No randomness in message generation
- Consistent formatting

### Security
- Never expose sensitive data (passwords, tokens)
- Don't reveal internal database IDs unless contextually useful
- Sanitize any user-generated content in confirmations

### Performance
- Message generation must complete in <50ms
- No external API calls
- Pure text formatting only

### User Experience
- Clear and unambiguous
- Action-oriented language
- Positive framing when possible
- Helpful next steps for empty states

## Error Handling

If tool_response indicates failure, do not generate confirmation:
```json
{
  "message": null,
  "tone": "professional"
}
```

**Note:** Error messages are handled by the error-formatting skill.

## Integration Notes

**Upstream**: Receives tool execution results from orchestrator
**Downstream**: Returns formatted message to conversation handler
**Stateless**: No memory required
**Reusable**: Can be called for every successful tool execution

## Localization Considerations

Currently supports English only. Future versions may include:
- Language detection from user message
- Multi-language template support
- Cultural tone adjustments

## Testing Checklist

- [ ] All tool types have confirmation templates
- [ ] Task titles are included when available
- [ ] Tone detection works correctly
- [ ] Empty states have helpful messages
- [ ] Long titles are truncated properly
- [ ] No internal IDs exposed unnecessarily
- [ ] Messages are under 100 characters (when possible)
- [ ] Professional tone is default

---

**Version**: 1.0
**Last Updated**: 2024-02-15
**Skill ID**: SKILL-05-CONFIRMATION-GENERATION
