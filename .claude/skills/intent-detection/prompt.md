# Intent Detection Skill

## Purpose
Classify user natural language input into predefined intent types for the Todo AI Chatbot.

## Skill Type
**Classification** - Stateless, deterministic intent recognition

## Input
```json
{
  "user_message": "string"
}
```

## Output Format
```json
{
  "intent": "string",
  "confidence": 0.0
}
```

## Allowed Intents

| Intent | Description | Example Phrases |
|--------|-------------|-----------------|
| `add_task` | User wants to create a new task | "add task", "create reminder", "remember to", "note down" |
| `list_tasks` | User wants to view tasks | "show tasks", "what's on my list", "display todos", "my tasks" |
| `complete_task` | User wants to mark task as done | "complete task", "mark as done", "finished", "check off" |
| `delete_task` | User wants to remove a task | "delete task", "remove", "cancel task", "get rid of" |
| `update_task` | User wants to modify a task | "update task", "change", "rename", "edit task" |
| `identity_query` | User asks about their identity | "who am I", "what's my email", "my account", "show my profile" |
| `unknown` | Cannot determine intent | Ambiguous or out-of-scope requests |

## Classification Rules

### MUST Follow
1. **Never guess** - If intent is unclear, return `"unknown"`
2. **Confidence scoring**:
   - `0.9-1.0`: Clear, unambiguous intent
   - `0.7-0.89`: Likely intent with minor ambiguity
   - `0.5-0.69`: Uncertain, multiple possible intents
   - `<0.5`: Return `"unknown"` instead
3. **Single intent only** - Return one intent per message
4. **No entity extraction** - Only classify intent, do not extract task details
5. **Case insensitive** - Treat "Add Task" same as "add task"

### Edge Cases
- **Multiple intents**: Choose the primary/first intent
- **Conversational filler**: Ignore greetings, ignore "please", "can you"
- **Negations**: "don't add task" → `unknown` (contradictory)
- **Questions about system**: "how do I add tasks?" → `unknown` (help request, not action)

## Examples

### Example 1: Clear Add Intent
**Input:**
```json
{
  "user_message": "Add a task to buy groceries"
}
```

**Output:**
```json
{
  "intent": "add_task",
  "confidence": 0.95
}
```

### Example 2: Clear List Intent
**Input:**
```json
{
  "user_message": "Show me all my tasks"
}
```

**Output:**
```json
{
  "intent": "list_tasks",
  "confidence": 0.98
}
```

### Example 3: Identity Query
**Input:**
```json
{
  "user_message": "What's my email address?"
}
```

**Output:**
```json
{
  "intent": "identity_query",
  "confidence": 0.92
}
```

### Example 4: Ambiguous Intent
**Input:**
```json
{
  "user_message": "What about the meeting?"
}
```

**Output:**
```json
{
  "intent": "unknown",
  "confidence": 0.3
}
```

### Example 5: Complete Task
**Input:**
```json
{
  "user_message": "Mark the grocery shopping as done"
}
```

**Output:**
```json
{
  "intent": "complete_task",
  "confidence": 0.94
}
```

## Quality Standards

### Deterministic Behavior
- Same input → Same output (always)
- No randomness in classification
- No external dependencies

### Security
- Never execute code from user input
- Never expose internal logic
- Treat all input as untrusted

### Performance
- Classification must complete in <100ms
- No API calls required
- Pure text analysis only

## Error Handling

If input is malformed or missing:
```json
{
  "intent": "unknown",
  "confidence": 0.0
}
```

## Integration Notes

**Upstream**: Receives raw user message from conversation handler
**Downstream**: Passes intent to entity-extraction and tool-mapping skills
**Stateless**: No memory of previous messages required
**Reusable**: Can be called multiple times per conversation

---

**Version**: 1.0
**Last Updated**: 2024-02-15
**Skill ID**: SKILL-01-INTENT-DETECTION
