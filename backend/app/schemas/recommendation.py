"""Pydantic schemas for recommendation endpoints."""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from .repository import RepositoryResponse, IssueResponse


class RecommendReposRequest(BaseModel):
    """Request schema for repository recommendations."""
    
    github_username: str = Field(..., min_length=1, max_length=39)
    limit: int = Field(default=10, ge=1, le=500)
    min_stars: int = Field(default=100, ge=0)
    languages: Optional[List[str]] = None
    exclude_repos: Optional[List[str]] = None


class RecommendIssuesRequest(BaseModel):
    """Request schema for issue recommendations."""
    
    github_username: str = Field(..., min_length=1, max_length=39)
    limit: int = Field(default=20, ge=1, le=100)
    difficulty: str = Field(default="beginner", pattern="^(beginner|intermediate|advanced)$")
    labels: Optional[List[str]] = None


class RecommendReposResponse(BaseModel):
    """Response schema for repository recommendations."""
    
    username: str
    total_recommendations: int
    recommendations: List[RepositoryResponse]
    generated_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "octocat",
                "total_recommendations": 10,
                "generated_at": "2026-02-02T08:40:55Z"
            }
        }


class RecommendIssuesResponse(BaseModel):
    """Response schema for issue recommendations."""
    
    username: str
    total_issues: int
    issues: List[IssueResponse]
    generated_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "octocat",
                "total_issues": 20,
                "generated_at": "2026-02-02T08:40:55Z"
            }
        }
