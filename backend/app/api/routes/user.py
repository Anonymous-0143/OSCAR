"""User analysis and skill profiling routes."""

from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from app.schemas import (
    UserAnalysisRequest,
    UserAnalysisResponse,
    SkillProfileResponse,
    SkillProfile
)
from app.services import ProfilingService
from app.utils import logger, UserNotFoundError, InsufficientDataError, GitHubAPIError

router = APIRouter()
profiling_service = ProfilingService()


@router.post("/analyze-user", response_model=UserAnalysisResponse)
async def analyze_user(request: UserAnalysisRequest):
    """
    Analyze a GitHub user and generate skill profile.
    
    Args:
        request: User analysis request with GitHub username
        
    Returns:
        User analysis response with skill profile
        
    Raises:
        404: User not found
        400: Insufficient data
        500: Server error
    """
    try:
        logger.info(f"Analyzing user: {request.github_username}")
        
        # Generate skill profile
        skill_profile_dict = await profiling_service.create_skill_profile(
            request.github_username
        )
        
        # Convert to Pydantic model
        skill_profile = SkillProfile(**skill_profile_dict)
        
        # Build response
        response = UserAnalysisResponse(
            username=request.github_username,
            profile_url=f"https://github.com/{request.github_username}",
            analysis_timestamp=datetime.utcnow(),
            skill_profile=skill_profile,
            cache_hit=False
        )
        
        logger.info(f"Successfully analyzed user: {request.github_username}")
        return response
        
    except UserNotFoundError as e:
        logger.warning(f"User not found: {request.github_username}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    
    except InsufficientDataError as e:
        logger.warning(f"Insufficient data for user: {request.github_username}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    except GitHubAPIError as e:
        logger.error(f"GitHub API error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GitHub API is currently unavailable. Please try again later."
        )
    
    except Exception as e:
        logger.error(f"Unexpected error analyzing user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again later."
        )


@router.get("/skill-profile/{username}", response_model=SkillProfileResponse)
async def get_skill_profile(username: str):
    """
    Get cached skill profile for a user.
    
    Args:
        username: GitHub username
        
    Returns:
        Skill profile response
        
    Note:
        This endpoint currently generates a fresh profile.
        In production, this would check a cache first.
    """
    try:
        logger.info(f"Fetching skill profile for: {username}")
        
        # Generate skill profile (in production, check cache first)
        skill_profile_dict = await profiling_service.create_skill_profile(username)
        skill_profile = SkillProfile(**skill_profile_dict)
        
        response = SkillProfileResponse(
            username=username,
            skill_profile=skill_profile,
            last_updated=datetime.utcnow(),
            from_cache=False
        )
        
        return response
        
    except UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    
    except Exception as e:
        logger.error(f"Error fetching skill profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch skill profile"
        )
