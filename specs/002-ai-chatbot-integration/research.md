# Research: AI Todo Chatbot Integration

**Date**: 2026-02-15
**Feature**: 002-ai-chatbot-integration
**Phase**: Phase 0 - Research & Technology Validation

## Research Areas

### 1. Cohere API Tool-Calling Format and OpenAI Agents SDK Compatibility

**Decision**: Use Cohere's native tool-calling API with adapter layer for OpenAI Agents SDK

**Research Findings**:
- Cohere API supports tool/function calling via the `tools` parameter in chat completions
- Tool call format: JSON with `name` and `parameters` fields
- Response includes `tool_calls` array when model decides to use a tool
- Compatible with OpenAI's function calling pattern with minor adaptations

**Integration Pattern**:
```python
# Cohere tool definition format
tools = [
    {
        "name": "add_task",
        "description": "Create a new task for the user",
        "parameter_definitions": {
            "title": {
                "description": "The task title",
                "type": "string",
                "required": True
            },
            "description": {
                "description": "Optional task description",
                "type": "string",
                "required": False
            }
        }
    }
]

# Cohere API call
response = cohere_client.chat(
    model="command-r-plus",
    message=user_message,
    tools=tools,
    temperature=0.3
)

# Response structure
if response.tool_calls:
    tool_call = response.tool_calls[0]
    tool_name = tool_call.name
    tool_params = tool_call.parameters
```

**Adapter Strategy**:
- Create wrapper class `CohereAgentAdapter` that implements OpenAI Agents SDK interface
- Translate OpenAI tool format to Cohere tool format
- Translate Cohere responses back to OpenAI format
- Maintain compatibility with existing Agents SDK patterns

**Rationale**: Adapter pattern allows us to use Cohere while maintaining familiar Agents SDK abstractions, making future provider switches easier.

**Alternatives Considered**:
- Direct Cohere integration without Agents SDK (rejected: loses orchestration benefits)
- Fork OpenAI Agents SDK (rejected: maintenance burden)
- Use LangChain (rejected: unnecessary complexity for our use case)

---

### 2. MCP SDK Python Implementation Patterns

**Decision**: Use official MCP Python SDK with FastAPI integration

**Research Findings**:
- MCP SDK provides `@mcp.tool()` decorator for tool registration
- Tools are Python functions with type hints for automatic schema generation
- SDK handles JSON schema validation automatically
- Supports async/await for FastAPI compatibility

**Implementation Pattern**:
```python
from mcp import MCPServer

mcp_server = MCPServer("todo-tools")

@mcp_server.tool()
async def add_task(
    user_id: int,
    title: str,
    description: str = ""
) -> dict:
    """Create a new task for the authenticated user."""
    # Validate user authorization
    # Create task in database
    # Return structured response
    return {
        "success": True,
        "task_id": task.id,
        "message": f"Task '{title}' created successfully"
    }
```

**Integration with FastAPI**:
- Initialize MCP server at application startup
- Register all tools during initialization
- Tools access database via dependency injection
- Tools receive user_id from authenticated context

**Rationale**: Official SDK provides type safety, automatic validation, and clean integration with FastAPI's async patterns.

**Alternatives Considered**:
- Custom tool implementation (rejected: reinventing the wheel)
- LangChain tools (rejected: different abstraction, heavier dependency)
- Direct function calls without MCP (rejected: loses protocol benefits)

---

### 3. Stateless Conversation Management in FastAPI

**Decision**: Database-backed conversation persistence with per-request context loading

**Research Findings**:
- FastAPI is inherently stateless (no session state between requests)
- Each request must load conversation context from database
- Conversation history passed to LLM as message array
- No in-memory caching of conversations (violates stateless principle)

**Implementation Pattern**:
```python
@router.post("/chat")
async def chat_endpoint(
    message: ChatRequest,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Load or create conversation
    conversation = get_or_create_conversation(db, user_id)

    # 2. Store user message
    user_msg = Message(
        conversation_id=conversation.id,
        user_id=user_id,
        role="user",
        content=message.content
    )
    db.add(user_msg)
    db.commit()

    # 3. Load conversation history
    history = get_conversation_history(db, conversation.id)

    # 4. Build message array for LLM
    messages = [
        {"role": msg.role, "content": msg.content}
        for msg in history
    ]

    # 5. Run agent with history
    response = await run_agent(messages, user_id)

    # 6. Store assistant response
    assistant_msg = Message(
        conversation_id=conversation.id,
        user_id=user_id,
        role="assistant",
        content=response.content
    )
    db.add(assistant_msg)
    db.commit()

    return {"response": response.content}
```

**Database Schema**:
- `conversations` table: id, user_id, created_at, updated_at
- `messages` table: id, conversation_id, user_id, role, content, created_at
- Indexes: user_id, conversation_id, created_at for efficient queries

**Rationale**: Database persistence ensures conversation survives server restarts and enables horizontal scaling without session affinity.

**Alternatives Considered**:
- Redis session storage (rejected: still requires session affinity)
- In-memory cache (rejected: violates stateless principle)
- Client-side conversation storage (rejected: security risk, large payloads)

---

### 4. Cohere API Rate Limits and Retry Strategies

**Decision**: Exponential backoff with jitter for rate limit handling

**Research Findings**:
- Cohere API rate limits vary by plan (typically 100-1000 requests/minute)
- Rate limit errors return HTTP 429 with `Retry-After` header
- Transient failures (5xx errors) should be retried
- Network timeouts should have reasonable limits (30 seconds)

**Retry Strategy**:
```python
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type
)

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((RateLimitError, TimeoutError))
)
async def call_cohere_with_retry(
    client: CohereClient,
    messages: list,
    tools: list
):
    try:
        response = await client.chat(
            model="command-r-plus",
            messages=messages,
            tools=tools,
            temperature=0.3,
            timeout=30.0
        )
        return response
    except RateLimitError as e:
        # Log rate limit hit
        logger.warning(f"Rate limit hit: {e}")
        raise
    except TimeoutError as e:
        # Log timeout
        logger.error(f"Cohere API timeout: {e}")
        raise
```

**Error Handling**:
- 429 Rate Limit: Retry with exponential backoff
- 5xx Server Error: Retry up to 3 times
- 4xx Client Error: Do not retry, return user-friendly error
- Timeout: Retry once, then fail gracefully

**Rationale**: Exponential backoff with jitter prevents thundering herd problem and respects API rate limits while maximizing success rate.

**Alternatives Considered**:
- Fixed delay retry (rejected: inefficient, can worsen rate limiting)
- No retry logic (rejected: poor user experience on transient failures)
- Circuit breaker pattern (deferred: can add later if needed)

---

### 5. Database Schema for Conversation Persistence

**Decision**: Two-table design with conversations and messages

**Schema Design**:

```python
# models/conversation.py
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List

class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    messages: List["Message"] = Relationship(back_populates="conversation")
    user: "User" = Relationship(back_populates="conversations")

# models/message.py
class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    role: str = Field(max_length=20)  # "user" or "assistant"
    content: str = Field(max_length=10000)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    # Relationships
    conversation: Conversation = Relationship(back_populates="messages")
    user: "User" = Relationship()
```

**Indexes**:
- `conversations.user_id` - Fast lookup of user's conversations
- `messages.conversation_id` - Fast retrieval of conversation history
- `messages.user_id` - Security validation queries
- `messages.created_at` - Chronological ordering

**Query Patterns**:
```python
# Get or create conversation for user
conversation = db.query(Conversation).filter(
    Conversation.user_id == user_id
).order_by(Conversation.updated_at.desc()).first()

if not conversation:
    conversation = Conversation(user_id=user_id)
    db.add(conversation)
    db.commit()

# Load conversation history
messages = db.query(Message).filter(
    Message.conversation_id == conversation.id
).order_by(Message.created_at.asc()).all()
```

**Rationale**: Simple two-table design supports all requirements while maintaining query efficiency and data integrity.

**Alternatives Considered**:
- Single table with JSON conversation field (rejected: poor queryability)
- Separate table per user (rejected: schema management nightmare)
- NoSQL document store (rejected: adds complexity, PostgreSQL sufficient)

---

### 6. Tool Validation Patterns to Prevent Hallucinations

**Decision**: Multi-layer validation with schema enforcement and authorization checks

**Validation Layers**:

**Layer 1: Schema Validation**
```python
from pydantic import BaseModel, validator

class AddTaskParams(BaseModel):
    user_id: int
    title: str
    description: str = ""

    @validator('title')
    def title_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()

def validate_tool_call(tool_name: str, params: dict) -> dict:
    """Validate tool call against schema."""
    if tool_name == "add_task":
        validated = AddTaskParams(**params)
        return validated.dict()
    # ... other tools
    else:
        raise ValueError(f"Unknown tool: {tool_name}")
```

**Layer 2: Authorization Validation**
```python
async def validate_user_authorization(
    user_id: int,
    tool_name: str,
    params: dict,
    db: Session
) -> bool:
    """Verify user is authorized for this operation."""

    # For task operations, verify task belongs to user
    if tool_name in ["complete_task", "delete_task", "update_task"]:
        task_id = params.get("task_id")
        if task_id:
            task = db.query(Task).filter(
                Task.id == task_id,
                Task.user_id == user_id
            ).first()
            if not task:
                raise UnauthorizedError(
                    "Task not found or access denied"
                )

    return True
```

**Layer 3: Existence Validation**
```python
async def validate_task_exists(
    task_id: int,
    user_id: int,
    db: Session
) -> Task:
    """Verify task exists and belongs to user."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user_id
    ).first()

    if not task:
        raise TaskNotFoundError(
            f"Task {task_id} not found"
        )

    return task
```

**Integration Pattern**:
```python
async def execute_tool_safely(
    tool_name: str,
    params: dict,
    user_id: int,
    db: Session
):
    # Layer 1: Schema validation
    validated_params = validate_tool_call(tool_name, params)

    # Layer 2: Authorization check
    await validate_user_authorization(
        user_id, tool_name, validated_params, db
    )

    # Layer 3: Execute tool
    result = await execute_mcp_tool(
        tool_name, validated_params, db
    )

    return result
```

**Rationale**: Multi-layer validation catches hallucinations, prevents unauthorized access, and provides clear error messages at each stage.

**Alternatives Considered**:
- Single validation layer (rejected: insufficient security)
- Trust LLM output (rejected: hallucinations are common)
- Post-execution validation (rejected: too late, data already modified)

---

## Technology Stack Summary

### Backend Dependencies
```
fastapi==0.109.0
sqlmodel==0.0.14
cohere==4.37.0
mcp-sdk==0.1.0  # Official MCP Python SDK
pydantic==2.5.0
tenacity==8.2.3  # Retry logic
python-jose[cryptography]==3.3.0  # JWT handling
psycopg2-binary==2.9.9  # PostgreSQL driver
alembic==1.13.0  # Database migrations
```

### Frontend Dependencies
```
next@16.0.0
react@19.0.0
typescript@5.3.0
tailwindcss@3.4.0
@auth/core@0.18.0  # Better Auth
```

### Environment Variables
```
# Backend
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=your-secret-key
COHERE_API_KEY=your-cohere-api-key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Performance Considerations

### Expected Latency Breakdown
- Database query (conversation history): ~50ms
- Cohere API call: ~1500ms (average)
- MCP tool execution: ~100ms
- Database write (store response): ~50ms
- **Total**: ~1700ms (well under 2.5s target)

### Optimization Strategies
1. **Database Connection Pooling**: Reuse connections to reduce overhead
2. **Indexed Queries**: All queries use indexed columns (user_id, conversation_id)
3. **Async Operations**: All I/O operations use async/await
4. **Efficient History Loading**: Limit conversation history to last 50 messages if needed
5. **Cohere Model Selection**: Use `command-r-plus` for balance of speed and quality

### Scalability
- Stateless design enables horizontal scaling
- Database is bottleneck (Neon handles this well)
- No session affinity required
- Can add read replicas for conversation history queries

---

## Security Considerations

### Authentication Flow
1. User authenticates via Better Auth (existing system)
2. JWT token issued with user_id claim
3. Every chat request includes JWT in Authorization header
4. Backend verifies JWT and extracts user_id
5. All operations scoped to authenticated user_id

### Authorization Enforcement
- MCP tools receive user_id from authenticated context
- All database queries filtered by user_id
- Task operations verify task ownership before execution
- No cross-user data access possible

### Data Protection
- API keys stored in environment variables only
- No secrets in code or logs
- User messages stored with encryption at rest (PostgreSQL feature)
- Conversation history only accessible to owning user

---

## Testing Strategy

### Unit Tests
- MCP tool functions (isolated from database)
- Schema validation logic
- Authorization validation logic
- Cohere adapter layer
- Error formatting functions

### Integration Tests
- Chat endpoint with full request lifecycle
- Database persistence and retrieval
- Tool execution with real database
- JWT verification and user extraction
- Conversation resumption after restart

### Security Tests
- Cross-user access attempts (should fail)
- Invalid JWT handling
- Missing JWT handling
- Task ownership validation
- SQL injection prevention (via ORM)

### Load Tests
- 100 concurrent users sending messages
- Rapid successive messages from same user
- Very long conversation histories
- Cohere API rate limit handling

---

## Open Questions & Future Considerations

### Resolved
- ✅ Cohere API compatibility with tool calling
- ✅ MCP SDK integration pattern
- ✅ Stateless conversation management
- ✅ Database schema design
- ✅ Tool validation approach

### Deferred to Future Iterations
- Conversation archival strategy (when to archive old conversations)
- Multi-conversation support (currently one active conversation per user)
- Conversation search functionality
- Message editing/deletion
- Rich media support (images, files)
- Voice input/output
- Multi-language support

---

## Conclusion

All technical unknowns have been researched and resolved. The chosen architecture is:
- **Feasible**: All components have proven integration patterns
- **Secure**: Multi-layer validation and authorization enforcement
- **Scalable**: Stateless design enables horizontal scaling
- **Maintainable**: Clear separation of concerns and standard patterns
- **Performant**: Expected latency well under 2.5s target

Ready to proceed to Phase 1: Design & Contracts.
