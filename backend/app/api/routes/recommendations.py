"""Recommendation endpoints for repositories and issues."""

from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from typing import List
from app.schemas import (
    RecommendReposRequest,
    RecommendIssuesRequest,
    RecommendReposResponse,
    RecommendIssuesResponse,
    RepositoryResponse,
    IssueResponse,
    RepositoryInfo,
    IssueInfo,
    ExplanationResponse
)
from app.services import RecommendationService
from app.utils import logger, UserNotFoundError, RecommendationError

router = APIRouter()
recommendation_service = RecommendationService()


@router.post("/recommend-repos", response_model=RecommendReposResponse)
async def recommend_repositories(request: RecommendReposRequest):
    """
    Get repository recommendations for a user.
    
    Args:
        request: Repository recommendation request
        
    Returns:
        List of recommended repositories with explanations
        
    Raises:
        404: User not found
        500: Server error
    """
    try:
        logger.info(f"Generating repo recommendations for: {request.github_username}")
        
        # Get recommendations
        recommendations = await recommendation_service.recommend_repositories(
            username=request.github_username,
            limit=request.limit,
            min_stars=request.min_stars,
            languages=request.languages,
            exclude_repos=request.exclude_repos
        )
        
        # Convert to response models
        repo_responses = []
        for idx, rec in enumerate(recommendations, 1):
            repo_data = rec['repository']
            
            repo_info = RepositoryInfo(
                name=repo_data.get('name', ''),
                full_name=repo_data.get('full_name', ''),
                description=repo_data.get('description'),
                url=repo_data.get('html_url', ''),
                stars=repo_data.get('stargazers_count', 0),
                forks=repo_data.get('forks_count', 0),
                language=repo_data.get('language'),
                topics=repo_data.get('topics', []),
                open_issues=repo_data.get('open_issues_count', 0),
                last_updated=datetime.fromisoformat(
                    repo_data.get('updated_at', '').replace('Z', '+00:00')
                ),
                has_contributing=False,
                has_good_first_issues=repo_data.get('has_issues', False)
            )
            
            explanation = ExplanationResponse(**rec['explanation'])
            
            repo_response = RepositoryResponse(
                rank=idx,
                repository=repo_info,
                score=rec['score'],
                explanation=explanation,
                beginner_issues_count=repo_data.get('open_issues_count', 0)
            )
            
            repo_responses.append(repo_response)
        
        response = RecommendReposResponse(
            username=request.github_username,
            total_recommendations=len(repo_responses),
            recommendations=repo_responses,
            generated_at=datetime.utcnow()
        )
        
        logger.info(f"Returning {len(repo_responses)} repository recommendations")
        return response
        
    except UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    
    except RecommendationError as e:
        logger.error(f"Recommendation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate recommendations"
        )
    
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


@router.post("/recommend-issues", response_model=RecommendIssuesResponse)
async def recommend_issues(request: RecommendIssuesRequest):
    """
    Get issue recommendations for a user.
    
    Args:
        request: Issue recommendation request
        
    Returns:
        List of recommended issues with explanations
        
    Raises:
        404: User not found
        500: Server error
    """
    try:
        logger.info(f"Generating issue recommendations for: {request.github_username}")
        
        # Get recommendations
        recommendations = await recommendation_service.recommend_issues(
            username=request.github_username,
            limit=request.limit,
            difficulty=request.difficulty,
            labels=request.labels
        )
        
        # Convert to response models
        issue_responses = []
        for idx, rec in enumerate(recommendations, 1):
            issue_data = rec['issue']
            
            # Extract repository name from URL
            repo_url = issue_data.get('repository_url', '')
            repo_name = '/'.join(repo_url.split('/')[-2:]) if repo_url else 'unknown/unknown'
            
            issue_info = IssueInfo(
                title=issue_data.get('title', ''),
                url=issue_data.get('html_url', ''),
                number=issue_data.get('number', 0),
                repository=repo_name,
                labels=[l.get('name', '') for l in issue_data.get('labels', [])],
                created_at=datetime.fromisoformat(
                    issue_data.get('created_at', '').replace('Z', '+00:00')
                ),
                comments_count=issue_data.get('comments', 0),
                estimated_difficulty=rec.get('difficulty', 'beginner'),
                estimated_time=rec['explanation'].get('estimated_time')
            )
            
            explanation = ExplanationResponse(**rec['explanation'])
            
            issue_response = IssueResponse(
                rank=idx,
                issue=issue_info,
                score=rec['score'],
                explanation=explanation
            )
            
            issue_responses.append(issue_response)
        
        response = RecommendIssuesResponse(
            username=request.github_username,
            total_issues=len(issue_responses),
            issues=issue_responses,
            generated_at=datetime.utcnow()
        )
        
        logger.info(f"Returning {len(issue_responses)} issue recommendations")
        return response
        
    except UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    
    except RecommendationError as e:
        logger.error(f"Recommendation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate issue recommendations"
        )
    
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )
