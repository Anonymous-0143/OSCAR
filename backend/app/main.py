"""Main FastAPI application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
import os

from app.config import get_settings
from app.api.routes import user, recommendations, health, files
from app.utils import logger

# Get settings instance
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    logger.info(f"🚀 OSCREC API v{settings.app_version} starting...")
    logger.info(f"📊 Debug mode: {settings.debug}")
    logger.info(f"🔗 Allowed origins: {settings.origins_list}")
    yield
    # Cleanup on shutdown
    logger.info("👋 Shutting down OSCREC API...")
    # Close the shared GitHub HTTP client
    from app.services.github_service import GitHubService
    github_service = GitHubService()
    await github_service.close()
    logger.info("✅ Cleanup completed")


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-based Open-Source Contribution Recommendation Platform",
    docs_url=f"/api/{settings.api_version}/docs",
    redoc_url=f"/api/{settings.api_version}/redoc",
    openapi_url=f"/api/{settings.api_version}/openapi.json",
    lifespan=lifespan,
)


# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers first
app.include_router(
    health.router,
    prefix=f"/api/{settings.api_version}",
    tags=["Health"]
)

app.include_router(
    user.router,
    prefix=f"/api/{settings.api_version}",
    tags=["User Analysis"]
)

app.include_router(
    recommendations.router,
    prefix=f"/api/{settings.api_version}",
    tags=["Recommendations"]
)

app.include_router(
    files.router,
    prefix=f"/api/{settings.api_version}",
    tags=["File Recommendations"]
)

# Mount static files AFTER routers to avoid intercepting API calls
# The 'static' directory should contain the built frontend (dist)
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")

if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
else:
    # If static dir doesn't exist (e.g. local dev), redirect root to docs
    @app.get("/", include_in_schema=False)
    async def root_redirect():
        return RedirectResponse(url=f"/api/{settings.api_version}/docs")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
