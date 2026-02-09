# Quickstart Guide: Todo Frontend Application

**Feature**: 001-todo-frontend
**Date**: 2026-02-05
**Branch**: `001-todo-frontend`

## Overview

This guide provides step-by-step instructions for setting up and running the Todo application locally. The application consists of a Next.js frontend and FastAPI backend with PostgreSQL database.

## Prerequisites

### Required Software

- **Node.js**: 18.x or higher ([Download](https://nodejs.org/))
- **Python**: 3.11 or higher ([Download](https://www.python.org/))
- **PostgreSQL**: 14.x or higher ([Download](https://www.postgresql.org/))
- **Git**: Latest version ([Download](https://git-scm.com/))

### Optional Tools

- **pnpm**: Alternative to npm (faster, more efficient)
- **Docker**: For containerized PostgreSQL (optional)
- **Postman/Insomnia**: For API testing

## Project Structure

```
todo-app/
├── backend/              # FastAPI backend
│   ├── src/
│   ├── tests/
│   ├── alembic/
│   ├── requirements.txt
│   └── .env
├── frontend/             # Next.js frontend
│   ├── src/
│   ├── public/
│   ├── tests/
│   ├── package.json
│   └── .env.local
└── specs/                # Feature specifications
    └── 001-todo-frontend/
```

## Setup Instructions

### 1. Clone Repository

```bash
git clone <repository-url>
cd todo-app
git checkout 001-todo-frontend
```

### 2. Database Setup

#### Option A: Local PostgreSQL

1. **Install PostgreSQL** (if not already installed)

2. **Create Database**:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE todo_app;

# Create user (optional)
CREATE USER todo_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE todo_app TO todo_user;

# Exit psql
\q
```

3. **Note your connection string**:
```
postgresql://todo_user:your_password@localhost:5432/todo_app
```

#### Option B: Neon Serverless PostgreSQL (Production)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string provided
4. Use this connection string in backend `.env`

#### Option C: Docker PostgreSQL

```bash
docker run --name todo-postgres \
  -e POSTGRES_DB=todo_app \
  -e POSTGRES_USER=todo_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:14
```

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your settings
# Required variables:
# DATABASE_URL=postgresql://todo_user:your_password@localhost:5432/todo_app
# JWT_SECRET_KEY=<generate-random-secret>
# JWT_ALGORITHM=HS256
# JWT_EXPIRATION_HOURS=24
```

#### Generate JWT Secret Key

```bash
# Python one-liner to generate secure secret
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

#### Run Database Migrations

```bash
# Initialize Alembic (first time only)
alembic init alembic

# Create initial migration
alembic revision --autogenerate -m "Initial schema"

# Apply migrations
alembic upgrade head
```

#### Start Backend Server

```bash
# Development mode with auto-reload
uvicorn src.main:app --reload --port 8000

# Server will be available at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### 4. Frontend Setup

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install
# or with pnpm:
pnpm install

# Create .env.local file
cp .env.local.example .env.local

# Edit .env.local with your settings
# Required variables:
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_APP_NAME=Todo App
```

#### Start Frontend Development Server

```bash
npm run dev
# or with pnpm:
pnpm dev

# Server will be available at http://localhost:3000
```

## Verification

### 1. Backend Health Check

```bash
# Check if backend is running
curl http://localhost:8000/health

# Expected response:
# {"status": "healthy"}
```

### 2. API Documentation

Visit http://localhost:8000/docs to see interactive API documentation (Swagger UI).

### 3. Frontend Access

1. Open browser to http://localhost:3000
2. You should see the landing page
3. Navigate to sign-up page
4. Create a test account

### 4. End-to-End Test

1. **Sign Up**: Create account with email/password
2. **Sign In**: Log in with credentials
3. **Create Task**: Add a new task
4. **Toggle Task**: Mark task as complete
5. **Edit Task**: Modify task title/description
6. **Delete Task**: Remove task with confirmation

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://todo_user:your_password@localhost:5432/todo_app

# JWT Configuration
JWT_SECRET_KEY=<your-secret-key>
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# CORS (for development)
CORS_ORIGINS=http://localhost:3000

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=true
```

### Frontend (.env.local)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# App Configuration
NEXT_PUBLIC_APP_NAME=Todo App

# Better Auth Configuration
AUTH_SECRET=<your-auth-secret>
AUTH_URL=http://localhost:3000
```

## Common Issues & Troubleshooting

### Backend Issues

#### Database Connection Error

**Problem**: `sqlalchemy.exc.OperationalError: could not connect to server`

**Solution**:
1. Verify PostgreSQL is running: `pg_isready`
2. Check DATABASE_URL in .env
3. Verify database exists: `psql -U postgres -l`
4. Check firewall/port 5432 is open

#### Import Errors

**Problem**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
1. Ensure virtual environment is activated
2. Reinstall dependencies: `pip install -r requirements.txt`

#### Migration Errors

**Problem**: `alembic.util.exc.CommandError: Can't locate revision identified by 'xyz'`

**Solution**:
1. Drop database and recreate: `dropdb todo_app && createdb todo_app`
2. Delete alembic/versions/*.py files
3. Recreate migration: `alembic revision --autogenerate -m "Initial schema"`
4. Apply: `alembic upgrade head`

### Frontend Issues

#### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
1. Kill process on port 3000: `npx kill-port 3000`
2. Or use different port: `npm run dev -- -p 3001`

#### API Connection Error

**Problem**: `Failed to fetch` or CORS errors in browser console

**Solution**:
1. Verify backend is running on port 8000
2. Check NEXT_PUBLIC_API_URL in .env.local
3. Verify CORS_ORIGINS in backend .env includes frontend URL

#### Build Errors

**Problem**: TypeScript errors during build

**Solution**:
1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check TypeScript version: `npm list typescript`

## Development Workflow

### Making Changes

1. **Create Feature Branch**:
```bash
git checkout -b feature/your-feature-name
```

2. **Make Changes**: Edit code in backend/ or frontend/

3. **Test Changes**:
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

4. **Commit Changes**:
```bash
git add .
git commit -m "feat: your feature description"
```

### Running Tests

#### Backend Tests

```bash
cd backend
pytest                          # Run all tests
pytest tests/test_auth.py       # Run specific test file
pytest -v                       # Verbose output
pytest --cov=src                # With coverage
```

#### Frontend Tests

```bash
cd frontend
npm test                        # Run unit tests
npm run test:e2e                # Run E2E tests (Playwright)
npm run test:coverage           # With coverage
```

### Code Quality

#### Backend Linting

```bash
cd backend
black src/                      # Format code
flake8 src/                     # Lint code
mypy src/                       # Type checking
```

#### Frontend Linting

```bash
cd frontend
npm run lint                    # ESLint
npm run format                  # Prettier
npm run type-check              # TypeScript
```

## Production Deployment

### Backend Deployment (Example: Railway/Render)

1. **Set Environment Variables**:
   - DATABASE_URL (Neon connection string)
   - JWT_SECRET_KEY (production secret)
   - CORS_ORIGINS (production frontend URL)

2. **Build Command**: `pip install -r requirements.txt`

3. **Start Command**: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`

### Frontend Deployment (Example: Vercel)

1. **Set Environment Variables**:
   - NEXT_PUBLIC_API_URL (production backend URL)
   - AUTH_SECRET (production auth secret)

2. **Build Command**: `npm run build`

3. **Start Command**: `npm start`

## API Testing with Postman

### Import OpenAPI Spec

1. Open Postman
2. Import → Link → Enter: `http://localhost:8000/openapi.json`
3. Collection will be created with all endpoints

### Example Requests

#### Sign Up

```http
POST http://localhost:8000/api/auth/signup
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "SecurePass123"
}
```

#### Sign In

```http
POST http://localhost:8000/api/auth/signin
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "SecurePass123"
}
```

#### Create Task (with JWT)

```http
POST http://localhost:8000/api/tasks
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

## Next Steps

1. **Review Specification**: Read `specs/001-todo-frontend/spec.md`
2. **Review Implementation Plan**: Read `specs/001-todo-frontend/plan.md`
3. **Review API Contracts**: Check `specs/001-todo-frontend/contracts/`
4. **Start Development**: Follow task breakdown in `specs/001-todo-frontend/tasks.md` (once generated)

## Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **SQLModel Documentation**: https://sqlmodel.tiangolo.com/
- **Better Auth Documentation**: https://better-auth.com/docs
- **Tailwind CSS Documentation**: https://tailwindcss.com/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/

## Support

For issues or questions:
1. Check this quickstart guide
2. Review specification and plan documents
3. Check API documentation at http://localhost:8000/docs
4. Review error logs in terminal

## License

[Your License Here]
