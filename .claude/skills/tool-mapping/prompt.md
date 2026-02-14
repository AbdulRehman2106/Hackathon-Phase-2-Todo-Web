# Tool Mapping Skill

## Purpose
Map classified user intent to the corresponding MCP tool name for execution.

## Skill Type
**Mapping** - Stateless, deterministic intent-to-tool translation

## Input
```json
{
  "intent": "string"
}
```

## Output Format
```json
{
  "tool_name": "string | null"
}
```

## Intent-to-Tool Mapping Table

| Intent | MCP Tool Name | Description |
|--------|---------------|-------------|
| `add_task` | `add_task` | Creates a new task in the database |
| `list_tasks` | `list_tasks` | Retrieves tasks based on filters |
| `complete_task` | `complete_task` | Marks a task as completed |
| `delete_task` | `delete_task` | Permanently removes a task |
| `update_task` | `update_task` | Modifies an existing task |
| `identity_query` | `get_user_info` | Retrieves authenticated user information |
| `unknown` | `null` | No tool mapping available |

## Mapping Rules

### MUST Follow
1. **Exact mapping only** - No interpretation or logic beyond the table
2. **One-to-one mapping** - Each intent maps to exactly one tool
3. **Return null for unknown** - If intent not in table, return null
4. **Case sensitive** - Intent must match exactly (lowercase)
5. **No fallback logic** - Don't guess or approximate

### Validation
- Input intent must be a string
- Output tool_name must match MCP tool registry
- No custom tool names allowed

## Examples

### Example 1: Add Task
**Input:**
```json
{
  "intent": "add_task"
}
```

**Output:**
```json
{
  "tool_name": "add_task"
}
```

### Example 2: List Tasks
**Input:**
```json
{
  "intent": "list_tasks"
}
```

**Output:**
```json
{
  "tool_name": "list_tasks"
}
```

### Example 3: Identity Query
**Input:**
```json
{
  "intent": "identity_query"
}
```

**Output:**
```json
{
  "tool_name": "get_user_info"
}
```

### Example 4: Unknown Intent
**Input:**
```json
{
  "intent": "unknown"
}
```

**Output:**
```json
{
  "tool_name": null
}
```

### Example 5: Invalid Intent
**Input:**
```json
{
  "intent": "invalid_intent"
}
```

**Output:**
```json
{
  "tool_name": null
}
```

## Edge Cases

### Case Mismatch
**Input:** `"ADD_TASK"` (uppercase)
**Output:** `null` (must be exact lowercase match)

### Typo in Intent
**Input:** `"ad_task"` (typo)
**Output:** `null` (no fuzzy matching)

### Empty Intent
**Input:** `""`
**Output:** `null`

### Null Intent
**Input:** `null`
**Output:** `null`

## Quality Standards

### Deterministic Behavior
- Same intent → Same tool_name (always)
- No randomness
- No external dependencies
- Pure lookup operation

### Security
- No code execution
- No dynamic tool name generation
- Only return registered MCP tools
- Prevent tool injection attacks

### Performance
- Mapping must complete in <10ms
- Simple hash table lookup
- No API calls
- No database queries

## Error Handling

If input is malformed or missing:
```json
{
  "tool_name": null
}
```

## MCP Tool Registry Validation

Before returning a tool_name, ensure it exists in the MCP tool registry:

**Registered MCP Tools:**
- `add_task`
- `list_tasks`
- `complete_task`
- `delete_task`
- `update_task`
- `get_user_info`

If a tool is not in this registry, return `null` even if there's a mapping.

## Integration Notes

**Upstream**: Receives classified intent from intent-detection skill
**Downstream**: Passes tool_name to tool-chaining or direct execution
**Stateless**: No memory required
**Reusable**: Can be called multiple times per conversation

## Future Extensibility

When adding new intents:
1. Add intent to intent-detection allowed list
2. Register new MCP tool in tool registry
3. Add mapping entry to this table
4. Update documentation

**Do not modify this skill's logic** - only update the mapping table.

## Testing Checklist

- [ ] All intents in table map correctly
- [ ] Unknown intent returns null
- [ ] Invalid intent returns null
- [ ] Case sensitivity enforced
- [ ] No hallucinated tool names
- [ ] Performance under 10ms
- [ ] Output matches MCP registry

---

**Version**: 1.0
**Last Updated**: 2024-02-15
**Skill ID**: SKILL-03-TOOL-MAPPING
