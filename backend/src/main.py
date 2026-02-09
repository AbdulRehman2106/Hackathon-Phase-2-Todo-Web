from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Create FastAPI application
app = FastAPI(
    title="Todo Application API",
    description="Backend API for Todo application with JWT authentication",
    version="1.0.0",
)

# CORS Configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004,http://localhost:3005").split(",")

# Allow all Vercel preview and production URLs
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database tables on startup
# Note: Disabled for Vercel serverless deployment
# Database tables should be created manually or via migration scripts
# from src.database import create_db_and_tables

# @app.on_event("startup")
# def on_startup():
#     create_db_and_tables()

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint to verify API is running."""
    return {"status": "healthy"}

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Todo Application API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

# Router registration
from src.api import auth, tasks, subtasks, password_reset
# AI router temporarily disabled due to Vercel size constraints
# from src.api import ai

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(password_reset.router, prefix="/api/auth", tags=["Password Reset"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(subtasks.router, prefix="/api", tags=["Subtasks"])
# app.include_router(ai.router, prefix="/api/ai", tags=["AI Features"])
