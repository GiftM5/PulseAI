#!/usr/bin/env python3
"""
PulseAI Backend Server
Run this script to start the FastAPI backend server
"""

import uvicorn
import sys
import os

# Add the app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

if __name__ == "__main__":
    print("🚀 Starting PulseAI Backend Server...")
    print("📊 Health monitoring API with AI-powered risk assessment")
    print("🌐 Server will be available at: http://127.0.0.1:8000")
    print("📖 API Documentation: http://127.0.0.1:8000/docs")
    print("=" * 60)
    
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info",
        access_log=True
    )
