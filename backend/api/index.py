"""
Vercel Serverless Function Wrapper for FastAPI
This file is required for Vercel deployment
"""
from src.main import app
from mangum import Mangum

# Mangum handler for AWS Lambda/Vercel
handler = Mangum(app, lifespan="off")

# For local testing
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
