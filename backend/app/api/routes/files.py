"""File recommendation endpoints."""

import traceback
from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from typing import List
from app.schemas import (
    FileRecommendation,
    RecommendFilesRequest,
    RecommendFilesResponse,
    FileInfo,
    ContributionType
)
from app.services import FileService, ProfilingService
from app.utils import logger, UserNotFoundError, GitHubAPIError

router = APIRouter()
file_service = FileService()
profiling_service = ProfilingService()


@router.post("/recommend-files", response_model=RecommendFilesResponse)
async def recommend_files(request: RecommendFilesRequest):
    """
    Get file recommendations for a user in a specific repository.
    
    Args:
        request: File recommendation request
        
    Returns:
        List of recommended files with contribution suggestions
        
    Raises:
        404: User not found
        500: Server error
    """
    try:
        logger.info(f"Generating file recommendations for {request.github_username} in {request.repository}")
        
        # Check cache first (5 minute TTL for user profiles)
        from app.services.cache_service import CacheService
        cache = CacheService()
        cache_key = f"user_profile:{request.github_username}"
        
        user_profile = cache.get(cache_key, ttl_seconds=300)  # 5 minutes
        if user_profile is None:
            # Get user profile to extract skills
            user_profile = await profiling_service.create_skill_profile(request.github_username)
            cache.set(cache_key, user_profile)
            logger.info(f"Cached user profile for {request.github_username}")
        else:
            logger.info(f"Using cached profile for {request.github_username}")
        
        # Extract top skills (languages and technical skills)
        top_skills = []
        
        # Add languages
        languages = user_profile.get('languages', {})
        if isinstance(languages, dict):
            top_skills.extend(list(languages.keys())[:5])
        
        # Add technical skills
        technical_skills = user_profile.get('technical_skills', [])
        if isinstance(technical_skills, list):
            top_skills.extend(technical_skills[:5])
        
        logger.info(f"User skills for matching: {top_skills}")
        
        # Parse repository owner and name
        owner, repo = request.repository.split('/')
        
        # Get file recommendations
        recommendations = await file_service.recommend_files(
            owner=owner,
            repo=repo,
            user_skills=top_skills,
            branch=request.branch,
            limit=request.limit
        )
        
        # Convert to response models
        file_responses = []
        for idx, rec in enumerate(recommendations, 1):
            file_rec = FileRecommendation(
                rank=idx,
                file=rec['file'],
                score=rec['score'],
                contribution_type=rec['contribution_type'],
                suggested_contribution=rec['suggestions'][0] if rec['suggestions'] else "Contribute to this file",
                difficulty=rec['difficulty'],
                matching_skills=[skill for skill in top_skills if rec['file'].language and skill.lower() in rec['file'].language.lower()],
                estimated_time=rec['estimated_time'],
                related_issues=[]
            )
            file_responses.append(file_rec)
        
        response = RecommendFilesResponse(
            username=request.github_username,
            repository=request.repository,
            total_files=len(file_responses),
            recommendations=file_responses,
            generated_at=datetime.utcnow()
        )
        
        logger.info(f"Returned {len(file_responses)} file recommendations")
        return response
        
    except UserNotFoundError as e:
        logger.error(f"User not found: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    
    except GitHubAPIError as e:
        logger.error(f"GitHub API error: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch repository files: {str(e)}"
        )
    
    except Exception as e:
        logger.error(f"Unexpected error in file recommendations: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )
