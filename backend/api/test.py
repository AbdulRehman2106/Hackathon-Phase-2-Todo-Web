"""
Minimal test endpoint for Vercel deployment debugging
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="Todo API - Minimal Test")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "Minimal FastAPI working on Vercel",
        "environment": {
            "VERCEL": os.getenv("VERCEL", "not set"),
            "VERCEL_ENV": os.getenv("VERCEL_ENV", "not set"),
        }
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/test-db")
async def test_db():
    """Test database connection"""
    try:
        from src.database import engine
        from sqlmodel import text

        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
