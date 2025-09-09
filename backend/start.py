#!/usr/bin/env python3
"""
Startup script for Summit Security Questionnaire API
"""

import uvicorn
import os
from pathlib import Path

# Add the current directory to Python path
import sys
sys.path.append(str(Path(__file__).parent))

if __name__ == "__main__":
    print("🚀 Starting Summit Security Questionnaire API...")
    print("📍 Visit: http://localhost:8000")
    print("📖 API Docs: http://localhost:8000/docs")
    print("🔄 Interactive API: http://localhost:8000/redoc")
    print()
    
    # Check if .env file exists
    env_file = Path(__file__).parent / ".env"
    if not env_file.exists():
        print("⚠️  No .env file found. Please copy env_template.txt to .env and configure your settings.")
        print()
    
    try:
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,  # Enable auto-reload during development
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)
