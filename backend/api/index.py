"""
Vercel Serverless Function for FastAPI
Vercel natively supports ASGI apps - just export the app directly
"""
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.main import app

# Vercel will automatically detect and handle the ASGI app
# No need for Mangum or any wrapper

# For local testing
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
