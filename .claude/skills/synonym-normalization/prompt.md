# Synonym Normalization Skill

## Purpose
Normalize language variations and synonyms into canonical intent keywords to improve intent detection accuracy.

## Skill Type
**Text Normalization** - Stateless, deterministic synonym mapping

## Input
```json
{
  "user_message": "string"
}
```

## Output Format
```json
{
  "normalized_text": "string",
  "transformations": [
    {
      "original": "string",
      "normalized": "string",
      "position": "integer"
    }
  ]
}
```

## Synonym Mapping Table

### Add/Create Synonyms
| Original | Normalized |
|----------|------------|
| add | add |
| create | add |
| make | add |
| new | add |
| remember | add |
| note | add |
| save | add |
| record | add |

### Delete/Remove Synonyms
| Original | Normalized |
|----------|------------|
| delete | delete |
| remove | delete |
| cancel | delete |
| erase | delete |
| get rid of | delete |
| discard | delete |
| trash | delete |

### Complete/Finish Synonyms
| Original | Normalized |
|----------|------------|
| complete | complete |
| done | complete |
| finish | complete |
| finished | complete |
| mark as done | complete |
| check off | complete |
| accomplish | complete |

### Update/Change Synonyms
| Original | Normalized |
|----------|------------|
| update | update |
| change | update |
| modify | update |
| edit | update |
| rename | update |
| alter | update |
| revise | update |

### List/Show Synonyms
| Original | Normalized |
|----------|------------|
| list | list |
| show | list |
| display | list |
| view | list |
| see | list |
| what's | list |
| get | list |
| fetch | list |

## Normalization Rules

### MUST Follow
1. **Preserve meaning** - Don't alter user's intent
2. **Case insensitive** - Treat "Add" same as "add"
3. **Whole word matching** - "adding" should not match "add" (unless stemming applied)
4. **Context aware** - Don't normalize task content, only action verbs
5. **Multi-word phrases** - Handle "get rid of" → "delete"

### What to Normalize
- Action verbs (add, delete, complete, etc.)
- Command keywords
- Intent indicators

### What NOT to Normalize
- Task titles
- Task descriptions
- User names
- Dates and times
- Numbers

## Examples

### Example 1: Create → Add
**Input:**
```json
{
  "user_message": "Create a task to buy milk"
}
```

**Output:**
```json
{
  "normalized_text": "Add a task to buy milk",
  "transformations": [
    {
      "original": "Create",
      "normalized": "Add",
      "position": 0
    }
  ]
}
```

### Example 2: Remove → Delete
**Input:**
```json
{
  "user_message": "Remove the meeting task"
}
```

**Output:**
```json
{
  "normalized_text": "Delete the meeting task",
  "transformations": [
    {
      "original": "Remove",
      "normalized": "Delete",
      "position": 0
    }
  ]
}
```

### Example 3: Done → Complete
**Input:**
```json
{
  "user_message": "Mark task 5 as done"
}
```

**Output:**
```json
{
  "normalized_text": "Mark task 5 as complete",
  "transformations": [
    {
      "original": "done",
      "normalized": "complete",
      "position": 18
    }
  ]
}
```

### Example 4: Show → List
**Input:**
```json
{
  "user_message": "Show me all my tasks"
}
```

**Output:**
```json
{
  "normalized_text": "List me all my tasks",
  "transformations": [
    {
      "original": "Show",
      "normalized": "List",
      "position": 0
    }
  ]
}
```

### Example 5: Multiple Synonyms
**Input:**
```json
{
  "user_message": "Create a new task and display all tasks"
}
```

**Output:**
```json
{
  "normalized_text": "Add a add task and list all tasks",
  "transformations": [
    {
      "original": "Create",
      "normalized": "Add",
      "position": 0
    },
    {
      "original": "new",
      "normalized": "add",
      "position": 9
    },
    {
      "original": "display",
      "normalized": "list",
      "position": 22
    }
  ]
}
```

### Example 6: No Normalization Needed
**Input:**
```json
{
  "user_message": "Add a task to buy groceries"
}
```

**Output:**
```json
{
  "normalized_text": "Add a task to buy groceries",
  "transformations": []
}
```

### Example 7: Multi-Word Phrase
**Input:**
```json
{
  "user_message": "Get rid of the old task"
}
```

**Output:**
```json
{
  "normalized_text": "Delete the old task",
  "transformations": [
    {
      "original": "Get rid of",
      "normalized": "Delete",
      "position": 0
    }
  ]
}
```

### Example 8: Preserve Task Content
**Input:**
```json
{
  "user_message": "Add a task to create a new report"
}
```

**Output:**
```json
{
  "normalized_text": "Add a task to create a new report",
  "transformations": []
}
```

**Note:** "create" in task description is NOT normalized because it's part of task content, not an action verb.

## Context-Aware Normalization

### Action Verb Detection
Normalize only when word appears as:
1. First word in sentence
2. After "to" (infinitive form)
3. In command position

**Examples:**
- "Create a task" → Normalize (command position)
- "Task to create report" → Don't normalize (part of task content)
- "I want to create a task" → Normalize "create" after "to"

### Boundary Detection
Use word boundaries to avoid partial matches:
- "adding" ≠ "add" (different word)
- "add" = "add" (exact match)
- "Add" = "add" (case insensitive match)

## Edge Cases

### Ambiguous Words
**Input:** "Change the task to finish the report"
**Analysis:**
- "Change" → action verb → normalize to "update"
- "finish" → part of task content → don't normalize

**Output:**
```json
{
  "normalized_text": "Update the task to finish the report",
  "transformations": [
    {
      "original": "Change",
      "normalized": "Update",
      "position": 0
    }
  ]
}
```

### Negations
**Input:** "Don't add a task"
**Output:** No normalization (contradictory command, will be handled as "unknown" intent)

### Questions
**Input:** "How do I create a task?"
**Output:** No normalization (help request, not action)

### Slang/Informal
**Input:** "Lemme add a task"
**Output:**
```json
{
  "normalized_text": "Lemme add a task",
  "transformations": []
}
```
**Note:** "Lemme" is preserved; only canonical synonyms are normalized.

## Quality Standards

### Deterministic Behavior
- Same input → Same normalized output
- No randomness
- Consistent mapping rules

### Security
- No code execution
- No injection vulnerabilities
- Sanitize special characters

### Performance
- Normalization must complete in <30ms
- No external API calls
- Pure text transformation

### Accuracy
- Preserve user intent
- Don't over-normalize
- Context-aware decisions

## Stemming Considerations

**Current approach:** Exact word matching only

**Future enhancement:** Optional stemming
- "adding" → "add"
- "created" → "create" → "add"
- "finished" → "finish" → "complete"

**Not implemented yet** to avoid false positives.

## Integration Notes

**Upstream**: Receives raw user message before intent detection
**Downstream**: Passes normalized text to intent-detection skill
**Stateless**: No memory required
**Reusable**: Can be called for every user message

## Pipeline Position

```
User Message
    ↓
[Synonym Normalization] ← YOU ARE HERE
    ↓
Intent Detection
    ↓
Entity Extraction
    ↓
...
```

## Testing Checklist

- [ ] All synonym mappings work correctly
- [ ] Case insensitivity enforced
- [ ] Multi-word phrases handled
- [ ] Task content preserved
- [ ] Action verbs detected correctly
- [ ] No over-normalization
- [ ] Performance under 30ms
- [ ] Transformations tracked accurately

## Extensibility

To add new synonyms:
1. Add entry to mapping table
2. Update normalization logic
3. Test with sample messages
4. Document in this file

**Do not modify core normalization logic** - only extend mapping tables.

---

**Version**: 1.0
**Last Updated**: 2024-02-15
**Skill ID**: SKILL-09-SYNONYM-NORMALIZATION
