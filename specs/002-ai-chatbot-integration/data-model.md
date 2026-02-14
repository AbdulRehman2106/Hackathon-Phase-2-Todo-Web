# Data Model: AI Todo Chatbot Integration

**Feature**: 002-ai-chatbot-integration
**Date**: 2026-02-15
**Phase**: Phase 1 - Design

## Overview

This document defines the database schema for conversation persistence in the AI Todo Chatbot feature. The design follows stateless architecture principles with all conversation context stored in PostgreSQL.

## Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│    User     │         │  Conversation    │         │   Message   │
│             │◄────────│                  │◄────────│             │
│ id (PK)     │  1:N    │ id (PK)          │  1:N    │ id (PK)     │
│ email       │         │ user_id (FK)     │         │ conv_id (FK)│
│ name        │         │ created_at       │         │ user_id (FK)│
│ ...         │         │ updated_at       │         │ role        │
└─────────────┘         └──────────────────┘         │ content     │
                                                      │ created_at  │
      │                                               └─────────────┘
      │ 1:N
      │
      ▼
┌─────────────┐
│    Task     │
│             │
│ id (PK)     │
│ user_id (FK)│
│ title       │
│ description │
│ completed   │
│ created_at  │
│ updated_at  │
└─────────────┘
```

## Entities

### Conversation

Represents a chat session between a user and the AI assistant.

**Table Name**: `conversations`

**Columns**:

| Column      | Type      | Constraints                    | Description                          |
|-------------|-----------|--------------------------------|--------------------------------------|
| id          | INTEGER   | PRIMARY KEY, AUTO_INCREMENT    | Unique conversation identifier       |
| user_id     | INTEGER   | FOREIGN KEY (users.id), NOT NULL, INDEX | Owner of the conversation     |
| created_at  | TIMESTAMP | NOT NULL, DEFAULT NOW()        | When conversation was created        |
| updated_at  | TIMESTAMP | NOT NULL, DEFAULT NOW()        | Last message timestamp               |

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `user_id` (for fast user conversation lookup)
- INDEX on `updated_at` (for sorting by most recent)

**Relationships**:
- `user_id` → `users.id` (Many-to-One)
- One conversation has many messages (One-to-Many)

**Business Rules**:
- Each user can have multiple conversations over time
- Currently, system uses the most recent conversation for each user
- Conversations are never deleted (soft delete could be added later)
- `updated_at` is updated whenever a new message is added

**SQLModel Definition**:
```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List

class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        sa_column_kwargs={"onupdate": datetime.utcnow}
    )

    # Relationships
    messages: List["Message"] = Relationship(back_populates="conversation")
    user: "User" = Relationship(back_populates="conversations")
```

---

### Message

Represents a single message in a conversation (either from user or assistant).

**Table Name**: `messages`

**Columns**:

| Column          | Type      | Constraints                           | Description                          |
|-----------------|-----------|---------------------------------------|--------------------------------------|
| id              | INTEGER   | PRIMARY KEY, AUTO_INCREMENT           | Unique message identifier            |
| conversation_id | INTEGER   | FOREIGN KEY (conversations.id), NOT NULL, INDEX | Parent conversation       |
| user_id         | INTEGER   | FOREIGN KEY (users.id), NOT NULL, INDEX | Message owner (for security)    |
| role            | VARCHAR(20) | NOT NULL, CHECK IN ('user', 'assistant') | Message sender role           |
| content         | TEXT      | NOT NULL                              | Message text content                 |
| created_at      | TIMESTAMP | NOT NULL, DEFAULT NOW(), INDEX        | When message was created             |

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `conversation_id` (for fast conversation history retrieval)
- INDEX on `user_id` (for security validation queries)
- INDEX on `created_at` (for chronological ordering)
- COMPOSITE INDEX on `(conversation_id, created_at)` (optimized history queries)

**Relationships**:
- `conversation_id` → `conversations.id` (Many-to-One)
- `user_id` → `users.id` (Many-to-One)

**Business Rules**:
- Messages are immutable once created (no editing)
- `role` must be either 'user' or 'assistant'
- Messages are always ordered by `created_at` within a conversation
- `user_id` must match the conversation's `user_id` (enforced in application layer)
- Maximum content length: 10,000 characters (enforced in application layer)

**SQLModel Definition**:
```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, Literal

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(
        foreign_key="conversations.id",
        index=True,
        nullable=False
    )
    user_id: int = Field(
        foreign_key="users.id",
        index=True,
        nullable=False
    )
    role: Literal["user", "assistant"] = Field(
        max_length=20,
        nullable=False
    )
    content: str = Field(
        max_length=10000,
        nullable=False
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        index=True
    )

    # Relationships
    conversation: Conversation = Relationship(back_populates="messages")
    user: "User" = Relationship()
```

---

### Task (Existing Entity - No Changes)

Represents a todo item. This entity already exists and requires no modifications for the chatbot feature.

**Table Name**: `tasks`

**Columns**:

| Column      | Type      | Constraints                    | Description                          |
|-------------|-----------|--------------------------------|--------------------------------------|
| id          | INTEGER   | PRIMARY KEY, AUTO_INCREMENT    | Unique task identifier               |
| user_id     | INTEGER   | FOREIGN KEY (users.id), NOT NULL, INDEX | Task owner                    |
| title       | VARCHAR(255) | NOT NULL                     | Task title                           |
| description | TEXT      | NULL                           | Optional task description            |
| completed   | BOOLEAN   | NOT NULL, DEFAULT FALSE        | Task completion status               |
| created_at  | TIMESTAMP | NOT NULL, DEFAULT NOW()        | When task was created                |
| updated_at  | TIMESTAMP | NOT NULL, DEFAULT NOW()        | Last modification timestamp          |

**Note**: No schema changes required. MCP tools will interact with this existing table.

---

## Database Migrations

### Migration 001: Create Conversations Table

```sql
-- Create conversations table
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_conversations_updated_at();
```

### Migration 002: Create Messages Table

```sql
-- Create messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);

-- Add constraint to ensure content is not empty
ALTER TABLE messages ADD CONSTRAINT chk_messages_content_not_empty
    CHECK (LENGTH(TRIM(content)) > 0);
```

### Alembic Migration Script

```python
"""Add conversation and message tables for AI chatbot

Revision ID: 002_ai_chatbot_tables
Revises: 001_initial_schema
Create Date: 2026-02-15

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '002_ai_chatbot_tables'
down_revision = '001_initial_schema'
branch_labels = None
depends_on = None

def upgrade():
    # Create conversations table
    op.create_table(
        'conversations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_conversations_user_id', 'conversations', ['user_id'])
    op.create_index('idx_conversations_updated_at', 'conversations', ['updated_at'], postgresql_ops={'updated_at': 'DESC'})

    # Create messages table
    op.create_table(
        'messages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('conversation_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.CheckConstraint("role IN ('user', 'assistant')", name='chk_messages_role'),
        sa.CheckConstraint("LENGTH(TRIM(content)) > 0", name='chk_messages_content_not_empty'),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_messages_conversation_id', 'messages', ['conversation_id'])
    op.create_index('idx_messages_user_id', 'messages', ['user_id'])
    op.create_index('idx_messages_created_at', 'messages', ['created_at'])
    op.create_index('idx_messages_conversation_created', 'messages', ['conversation_id', 'created_at'])

def downgrade():
    op.drop_table('messages')
    op.drop_table('conversations')
```

---

## Query Patterns

### Get or Create Conversation for User

```python
async def get_or_create_conversation(
    db: Session,
    user_id: int
) -> Conversation:
    """Get the most recent conversation for user, or create new one."""
    conversation = db.query(Conversation).filter(
        Conversation.user_id == user_id
    ).order_by(
        Conversation.updated_at.desc()
    ).first()

    if not conversation:
        conversation = Conversation(user_id=user_id)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    return conversation
```

### Load Conversation History

```python
async def get_conversation_history(
    db: Session,
    conversation_id: int,
    limit: int = 50
) -> List[Message]:
    """Load recent messages from conversation, ordered chronologically."""
    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(
        Message.created_at.asc()
    ).limit(limit).all()

    return messages
```

### Store User Message

```python
async def store_user_message(
    db: Session,
    conversation_id: int,
    user_id: int,
    content: str
) -> Message:
    """Store a user message in the conversation."""
    message = Message(
        conversation_id=conversation_id,
        user_id=user_id,
        role="user",
        content=content
    )
    db.add(message)

    # Update conversation timestamp
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()
    conversation.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(message)
    return message
```

### Store Assistant Response

```python
async def store_assistant_message(
    db: Session,
    conversation_id: int,
    user_id: int,
    content: str
) -> Message:
    """Store an assistant response in the conversation."""
    message = Message(
        conversation_id=conversation_id,
        user_id=user_id,
        role="assistant",
        content=content
    )
    db.add(message)

    # Update conversation timestamp
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()
    conversation.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(message)
    return message
```

---

## Data Validation Rules

### Conversation
- `user_id` must reference existing user
- `created_at` and `updated_at` are system-managed (no manual updates)
- Conversations cannot be deleted (only messages can be deleted in future)

### Message
- `conversation_id` must reference existing conversation
- `user_id` must match conversation's `user_id`
- `role` must be exactly 'user' or 'assistant' (case-sensitive)
- `content` cannot be empty or whitespace-only
- `content` maximum length: 10,000 characters
- `created_at` is immutable after creation

### Task (Existing)
- No changes to existing validation rules
- MCP tools will enforce user_id matching for all operations

---

## Performance Considerations

### Expected Query Performance
- Get conversation by user_id: < 10ms (indexed)
- Load 50 messages: < 50ms (indexed, sequential read)
- Insert message: < 20ms (single row insert)
- Update conversation timestamp: < 10ms (indexed primary key)

### Optimization Strategies
1. **Composite Index**: `(conversation_id, created_at)` optimizes history queries
2. **Limit History**: Load only last 50 messages by default (configurable)
3. **Connection Pooling**: Reuse database connections
4. **Batch Inserts**: Not needed (single message per request)

### Scalability
- Conversations table grows linearly with users (low growth rate)
- Messages table grows with usage (primary growth vector)
- Indexes maintain O(log n) query performance
- Partitioning by date possible if messages table grows very large (future)

---

## Security Considerations

### User Isolation
- All queries MUST filter by `user_id`
- Application layer enforces `user_id` matching between conversation and messages
- Database foreign keys ensure referential integrity

### Data Protection
- No sensitive data stored in messages (user input only)
- PostgreSQL encryption at rest (Neon feature)
- No PII in conversation metadata

### Audit Trail
- All messages immutable (no editing/deletion)
- `created_at` timestamps provide audit trail
- User actions traceable via message history

---

## Future Enhancements

### Deferred Features
- **Multi-conversation support**: Allow users to have multiple named conversations
- **Message editing**: Allow users to edit their messages
- **Message deletion**: Soft delete messages
- **Conversation archival**: Archive old conversations after N days
- **Conversation search**: Full-text search across message content
- **Message reactions**: Allow users to react to assistant messages
- **Conversation sharing**: Share conversation with other users (read-only)

### Schema Extensions (Future)
```sql
-- Add conversation title (future)
ALTER TABLE conversations ADD COLUMN title VARCHAR(255);

-- Add message metadata (future)
ALTER TABLE messages ADD COLUMN metadata JSONB;

-- Add soft delete (future)
ALTER TABLE messages ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE conversations ADD COLUMN deleted_at TIMESTAMP;
```

---

## Conclusion

The data model supports all requirements for stateless conversation persistence:
- ✅ Conversation history stored in database
- ✅ User isolation enforced via foreign keys and indexes
- ✅ Efficient query patterns for common operations
- ✅ Scalable design with proper indexing
- ✅ Immutable message history for audit trail
- ✅ Ready for horizontal scaling (stateless)

Ready to proceed with API contract definitions.
