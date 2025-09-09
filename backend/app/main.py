"""
Main FastAPI application for Summit Security Questionnaire App
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.api import health, upload, questionnaires
from app.config.settings import get_settings

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Summit Security Questionnaire API",
    description="Backend API for processing PDF policies and generating AI-powered questionnaire answers",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-frontend-domain.com"],  # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.include_router(questionnaires.router, prefix="/api/questionnaires", tags=["questionnaires"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Summit Security Questionnaire API", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
