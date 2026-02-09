from fastapi import FastAPI
import os

app = FastAPI(title="Todo API - Minimal Test")

@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "Railway FastAPI is working!",
        "port": os.getenv("PORT", "not set"),
        "database": "connected" if os.getenv("DATABASE_URL") else "not configured"
    }

@app.get("/health")
def health():
    return {"status": "healthy", "service": "railway-test"}

@app.get("/api/health")
def api_health():
    return {"status": "healthy", "api": "working"}
