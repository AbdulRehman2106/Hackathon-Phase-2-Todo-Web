# Conversation Structuring Skill

## Purpose
Prepare message objects for database persistence while maintaining conversation context and chronological order.

## Skill Type
**Data Structuring** - Stateless, deterministic message formatting

## Input
```json
{
  "role": "user | assistant",
  "content": "string",
  "conversation_id": "string",
  "user_id": "string",
  "metadata": {
    "intent": "string | null",
    "tool_used": "string | null",
    "success": "boolean | null"
  }
}
```

## Output Format
```json
{
  "role": "user | assistant",
  "content": "string",
  "conversation_id": "string",
  "user_id": "string",
  "timestamp": "ISO 8601 string",
  "metadata": {
    "intent": "string | null",
    "tool_used": "string | null",
    "success": "boolean | null",
    "message_length": "integer",
    "contains_task_reference": "boolean"
  },
  "sequence_number": "integer"
}
```

## Message Structure Rules

### MUST Follow
1. **Preserve chronological order** - Messages must be sequentially numbered
2. **Never duplicate messages** - Check for existing message before adding
3. **Never modify original content** - Store exactly what user/assistant said
4. **Immutable after creation** - Messages cannot be edited once stored
5. **Complete metadata** - All fields must be populated

### Role Types

**user**
- Messages from the human user
- Input to the system
- Always precedes assistant response

**assistant**
- Messages from the AI chatbot
- Output from the system
- Always follows user message

### Timestamp Format
- **Standard**: ISO 8601 format
- **Example**: `2024-02-15T14:30:00.000Z`
- **Timezone**: UTC
- **Precision**: Milliseconds

### Sequence Numbering
- Starts at 1 for first message in conversation
- Increments by 1 for each message
- Never skips numbers
- Never reuses numbers
- Unique within conversation_id

## Examples

### Example 1: User Message
**Input:**
```json
{
  "role": "user",
  "content": "Add a task to buy groceries",
  "conversation_id": "conv_abc123",
  "user_id": "user_456",
  "metadata": {
    "intent": "add_task",
    "tool_used": null,
    "success": null
  }
}
```

**Output:**
```json
{
  "role": "user",
  "content": "Add a task to buy groceries",
  "conversation_id": "conv_abc123",
  "user_id": "user_456",
  "timestamp": "2024-02-15T14:30:00.000Z",
  "metadata": {
    "intent": "add_task",
    "tool_used": null,
    "success": null,
    "message_length": 28,
    "contains_task_reference": false
  },
  "sequence_number": 1
}
```

### Example 2: Assistant Response
**Input:**
```json
{
  "role": "assistant",
  "content": "Task 'Buy groceries' has been added to your list.",
  "conversation_id": "conv_abc123",
  "user_id": "user_456",
  "metadata": {
    "intent": "add_task",
    "tool_used": "add_task",
    "success": true
  }
}
```

**Output:**
```json
{
  "role": "assistant",
  "content": "Task 'Buy groceries' has been added to your list.",
  "conversation_id": "conv_abc123",
  "user_id": "user_456",
  "timestamp": "2024-02-15T14:30:01.500Z",
  "metadata": {
    "intent": "add_task",
    "tool_used": "add_task",
    "success": true,
    "message_length": 52,
    "contains_task_reference": true
  },
  "sequence_number": 2
}
```

### Example 3: Error Response
**Input:**
```json
{
  "role": "assistant",
  "content": "Task title is required. Please provide a title for your task.",
  "conversation_id": "conv_abc123",
  "user_id": "user_456",
  "metadata": {
    "intent": "add_task",
    "tool_used": "add_task",
    "success": false
  }
}
```

**Output:**
```json
{
  "role": "assistant",
  "content": "Task title is required. Please provide a title for your task.",
  "conversation_id": "conv_abc123",
  "user_id": "user_456",
  "timestamp": "2024-02-15T14:31:00.000Z",
  "metadata": {
    "intent": "add_task",
    "tool_used": "add_task",
    "success": false,
    "message_length": 63,
    "contains_task_reference": false
  },
  "sequence_number": 3
}
```

### Example 4: Multi-Turn Conversation
**Messages in order:**

**Message 1 (User):**
```json
{
  "role": "user",
  "content": "Show my tasks",
  "conversation_id": "conv_xyz789",
  "user_id": "user_456",
  "timestamp": "2024-02-15T15:00:00.000Z",
  "sequence_number": 1
}
```

**Message 2 (Assistant):**
```json
{
  "role": "assistant",
  "content": "Found 3 tasks. 2 pending, 1 completed.",
  "conversation_id": "conv_xyz789",
  "user_id": "user_456",
  "timestamp": "2024-02-15T15:00:01.200Z",
  "sequence_number": 2
}
```

**Message 3 (User):**
```json
{
  "role": "user",
  "content": "Complete task 5",
  "conversation_id": "conv_xyz789",
  "user_id": "user_456",
  "timestamp": "2024-02-15T15:00:30.000Z",
  "sequence_number": 3
}
```

**Message 4 (Assistant):**
```json
{
  "role": "assistant",
  "content": "Task 'Buy groceries' marked as completed.",
  "conversation_id": "conv_xyz789",
  "user_id": "user_456",
  "timestamp": "2024-02-15T15:00:31.500Z",
  "sequence_number": 4
}
```

## Metadata Enrichment

### message_length
- Character count of content
- Used for analytics
- Helps identify verbose responses

### contains_task_reference
- `true` if message mentions specific task (by title or ID)
- `false` otherwise
- Used for conversation context tracking

### Detection Rules for Task Reference
- Contains task ID pattern: "task 5", "task #3", "id 12"
- Contains task title in quotes: "Buy groceries"
- Contains task status: "completed task", "pending task"

## Conversation Context Rules

### New Conversation
- First message has sequence_number: 1
- Generate new conversation_id if not provided
- Format: `conv_[timestamp]_[random]`

### Continuing Conversation
- Fetch last sequence_number from database
- Increment by 1 for new message
- Validate conversation_id exists
- Validate user_id matches conversation owner

### Conversation Boundaries
- Each conversation_id is isolated
- Messages cannot reference other conversations
- User can have multiple active conversations

## Quality Standards

### Deterministic Behavior
- Same input → Same output structure
- Consistent timestamp format
- Predictable sequence numbering

### Security
- Validate user_id matches authenticated user
- Prevent cross-user conversation access
- Sanitize content for storage (escape special chars)
- No code execution from content

### Performance
- Structuring must complete in <20ms
- No external API calls
- Minimal database queries (only for sequence number)

### Data Integrity
- No message loss
- No duplicate messages
- Chronological order preserved
- Complete audit trail

## Edge Cases

### Empty Content
**Input:** `content: ""`
**Output:** Store as-is, but flag in metadata

### Very Long Content
**Input:** `content: "..." (>10,000 chars)`
**Output:** Truncate to 10,000 chars, add metadata flag

### Missing Conversation ID
**Input:** `conversation_id: null`
**Output:** Generate new conversation_id

### Invalid Role
**Input:** `role: "system"`
**Output:** Reject - only "user" or "assistant" allowed

### Duplicate Sequence Number
**Input:** Sequence number already exists
**Output:** Increment and retry

## Database Schema Expectations

```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  conversation_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  sequence_number INTEGER NOT NULL,
  metadata JSONB,
  UNIQUE(conversation_id, sequence_number)
);
```

## Integration Notes

**Upstream**: Receives raw message data from conversation handler
**Downstream**: Passes structured message to database persistence layer
**Stateless**: No memory required (sequence from database)
**Reusable**: Called for every message in every conversation

## Conversation Retrieval

When fetching conversation history:
1. Query by conversation_id
2. Order by sequence_number ASC
3. Return all messages in chronological order
4. Include metadata for context

## Analytics Use Cases

Structured messages enable:
- Conversation length analysis
- Intent distribution tracking
- Tool usage statistics
- Success/failure rates
- User engagement metrics
- Response time analysis

## Testing Checklist

- [ ] User and assistant messages structured correctly
- [ ] Timestamps in ISO 8601 format
- [ ] Sequence numbers increment properly
- [ ] No duplicate messages
- [ ] Original content preserved
- [ ] Metadata complete and accurate
- [ ] Task references detected correctly
- [ ] Conversation boundaries respected
- [ ] Performance under 20ms

---

**Version**: 1.0
**Last Updated**: 2024-02-15
**Skill ID**: SKILL-07-CONVERSATION-STRUCTURING
