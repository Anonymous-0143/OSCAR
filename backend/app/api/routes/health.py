"""Health check and metrics routes."""

from fastapi import APIRouter
from datetime import datetime
from app.config import get_settings

settings = get_settings()
router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint.
    
    Returns service health status.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "service": "oscrec-api",
        "version": settings.app_version
    }


@router.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "OSCREC API - Smart Open-Source Contribution Recommendations",
        "version": settings.app_version,
        "docs_url": f"/api/{settings.api_version}/docs",
        "health_url": f"/api/{settings.api_version}/health"
    }
