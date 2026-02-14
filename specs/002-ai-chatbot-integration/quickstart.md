# AI Todo Chatbot - Quick Start Guide

## Overview

This guide helps you set up and run the AI-powered conversational task management system.

## Prerequisites

- Python 3.11+
- PostgreSQL database (or Neon account)
- Cohere API key ([Get one here](https://dashboard.cohere.com/api-keys))
- Node.js 18+ (for frontend, optional)

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Database (use your Neon connection string or local PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT (generate a secure random string)
JWT_SECRET_KEY=your-super-secret-key-min-32-characters
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Cohere AI
COHERE_API_KEY=your-cohere-api-key-here
COHERE_MODEL=command-r-plus
COHERE_TEMPERATURE=0.3

# Logging
LOG_LEVEL=INFO
```

### 3. Run Database Migrations

```bash
alembic upgrade head
```

This creates the required tables:
- `conversations` - Chat sessions
- `messages` - Individual messages
- Plus existing tables (users, tasks, etc.)

### 4. Start the Server

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Server will be available at: `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

### 5. Verify Installation

```bash
# Check health
curl http://localhost:8000/health

# Check AI chat service
curl http://localhost:8000/api/v1/chat/health
```

Expected response:
```json
{
  "status": "healthy",
  "message": "Chat service is configured and ready",
  "provider": "Cohere",
  "architecture": "Stateless with MCP tools"
}
```

## Testing the Chatbot

### 1. Create a User Account

```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

### 2. Login to Get JWT Token

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

Save the `access_token` from the response.

### 3. Chat with the AI

Replace `YOUR_JWT_TOKEN` with your actual token:

**Add a task:**
```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Add a task to buy groceries tomorrow"
  }'
```

**List tasks:**
```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me all my pending tasks"
  }'
```

**Complete a task:**
```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Mark the grocery task as complete"
  }'
```

**Delete a task:**
```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Delete task 1"
  }'
```

**Update a task:**
```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Change the grocery task to buy milk and eggs"
  }'
```

### 4. View Conversation History

```bash
curl -X GET http://localhost:8000/api/v1/chat/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## What the AI Can Do

The chatbot understands natural language and can:

1. **Add tasks**: "Add a task to...", "Remember to...", "Create a task for..."
2. **List tasks**: "Show my tasks", "What's on my list?", "Show pending tasks"
3. **Complete tasks**: "Mark task 5 as done", "Complete the grocery task"
4. **Delete tasks**: "Delete task 3", "Remove the meeting task"
5. **Update tasks**: "Change task 5 to...", "Update the meeting task"

The AI will:
- Extract task details from natural language
- Handle ambiguous requests by asking for clarification
- Remember conversation context
- Provide helpful error messages

## Architecture

### Stateless Design
- All conversation history stored in PostgreSQL
- No in-memory session state
- Server can restart without losing conversations
- Horizontally scalable

### MCP Tools
The AI uses 5 tools to interact with tasks:
- `add_task` - Create new tasks
- `list_tasks` - Retrieve tasks with filtering
- `complete_task` - Mark tasks complete
- `delete_task` - Remove tasks
- `update_task` - Modify task details

### Security
- JWT authentication required for all chat endpoints
- User isolation enforced at database level
- No cross-user data access possible
- All tool operations validate task ownership

## Troubleshooting

### "COHERE_API_KEY not configured"
- Ensure you've set `COHERE_API_KEY` in `.env`
- Restart the server after updating `.env`

### "Connection refused" (Database)
- Check `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- For Neon, verify connection string includes `?sslmode=require`

### "Unauthorized" errors
- Ensure you're including the JWT token in the Authorization header
- Token format: `Bearer YOUR_TOKEN`
- Tokens expire after 30 minutes by default

### AI not responding correctly
- Check Cohere API key is valid
- Verify you have API quota remaining
- Check logs for detailed error messages

### Conversation not persisting
- Verify database migrations ran successfully
- Check `conversations` and `messages` tables exist
- Ensure database connection is stable

## Development

### Running Tests
```bash
cd backend
pytest
```

### Viewing Logs
Logs are output to console. To save to file:
```bash
uvicorn src.main:app --log-config logging.conf
```

### Database Migrations

Create a new migration:
```bash
alembic revision -m "description"
```

Apply migrations:
```bash
alembic upgrade head
```

Rollback:
```bash
alembic downgrade -1
```

## Production Deployment

### Environment Variables
- Use strong, random `JWT_SECRET_KEY` (32+ characters)
- Use production Cohere API key
- Use production database (Neon recommended)
- Set `LOG_LEVEL=WARNING` or `ERROR`

### Security Checklist
- [ ] Strong JWT secret configured
- [ ] HTTPS enabled
- [ ] CORS origins restricted to your frontend domain
- [ ] Database uses SSL connection
- [ ] API keys not committed to git
- [ ] Rate limiting configured (if needed)

### Performance
- Expected response time: < 2.5 seconds
- Supports 100+ concurrent users
- Database connection pooling enabled
- Async endpoints for non-blocking I/O

## Support

For issues or questions:
- Check the implementation summary: `specs/002-ai-chatbot-integration/IMPLEMENTATION_SUMMARY.md`
- Review the specification: `specs/002-ai-chatbot-integration/spec.md`
- Check the plan: `specs/002-ai-chatbot-integration/plan.md`

## License

[Your License Here]
