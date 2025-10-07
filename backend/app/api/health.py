"""
Health check endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from datetime import datetime
import logging

from app.services.ai_service import AIService
from app.services.database import DatabaseService
from app.config.settings import get_settings, Settings

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }


@router.get("/health/full")
async def full_health_check(settings: Settings = Depends(get_settings)) -> Dict[str, Any]:
    """
    Comprehensive health check including database and AI service
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "checks": {
            "api": {"status": "ok"},
            "database": {"status": "unknown"},
            "ai_service": {"status": "unknown"},
        }
    }
    
    # Check database connection
    try:
        if not settings.supabase_url or not settings.supabase_key:
            health_status["checks"]["database"] = {
                "status": "error",
                "message": "Database credentials not configured"
            }
        else:
            db_service = DatabaseService(
                supabase_url=settings.supabase_url,
                supabase_key=settings.supabase_key
            )
            # Try a simple query
            policies = await db_service.get_all_policies()
            health_status["checks"]["database"] = {
                "status": "ok",
                "message": f"Connected successfully ({len(policies)} policies found)"
            }
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        health_status["checks"]["database"] = {
            "status": "error",
            "message": str(e)
        }
        health_status["status"] = "degraded"
    
    # Check AI service
    try:
        if not settings.anthropic_api_key:
            health_status["checks"]["ai_service"] = {
                "status": "error",
                "message": "ANTHROPIC_API_KEY not configured in environment variables"
            }
            health_status["status"] = "degraded"
        else:
            ai_service = AIService(settings.anthropic_api_key)
            is_valid = ai_service.validate_api_key()
            
            if is_valid:
                health_status["checks"]["ai_service"] = {
                    "status": "ok",
                    "message": "API key is valid",
                    "model": ai_service.model
                }
            else:
                health_status["checks"]["ai_service"] = {
                    "status": "error",
                    "message": "API key validation failed - key may be invalid or expired"
                }
                health_status["status"] = "degraded"
                
    except Exception as e:
        logger.error(f"AI service health check failed: {str(e)}")
        health_status["checks"]["ai_service"] = {
            "status": "error",
            "message": str(e)
        }
        health_status["status"] = "degraded"
    
    return health_status


@router.get("/health/ai-test")
async def test_ai_service(settings: Settings = Depends(get_settings)) -> Dict[str, Any]:
    """
    Test AI service with a simple generation request
    """
    try:
        if not settings.anthropic_api_key:
            raise HTTPException(
                status_code=500, 
                detail="ANTHROPIC_API_KEY not configured. Please set it in your .env file"
            )
        
        ai_service = AIService(settings.anthropic_api_key)
        
        # Test with a simple question
        test_question = "What is security?"
        test_context = "Security is the practice of protecting systems and data from threats."
        
        logger.info("Testing AI service with sample question...")
        answer = await ai_service.generate_answer(test_question, test_context)
        
        return {
            "success": True,
            "message": "AI service is working correctly",
            "test_question": test_question,
            "test_answer": answer,
            "model": ai_service.model
        }
        
    except Exception as e:
        logger.error(f"AI test failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"AI service test failed: {str(e)}"
        )
