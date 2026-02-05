"""Pydantic schemas for repository-related models."""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional


class RepositoryInfo(BaseModel):
    """Repository information."""
    
    name: str
    full_name: str
    description: Optional[str] = None
    url: str
    stars: int = 0
    forks: int = 0
    language: Optional[str] = None
    topics: List[str] = Field(default_factory=list)
    open_issues: int = 0
    last_updated: datetime
    has_contributing: bool = False
    has_good_first_issues: bool = False


class IssueInfo(BaseModel):
    """GitHub issue information."""
    
    title: str
    url: str
    number: int
    repository: str
    labels: List[str] = Field(default_factory=list)
    created_at: datetime
    comments_count: int = 0
    estimated_difficulty: str = "beginner"
    estimated_time: Optional[str] = None


class RepositoryResponse(BaseModel):
    """Response schema for repository data."""
    
    rank: int
    repository: RepositoryInfo
    score: float = Field(..., ge=0.0, le=1.0)
    explanation: "ExplanationResponse"
    beginner_issues_count: int = 0


class IssueResponse(BaseModel):
    """Response schema for issue data."""
    
    rank: int
    issue: IssueInfo
    score: float = Field(..., ge=0.0, le=1.0)
    explanation: "ExplanationResponse"


class ExplanationResponse(BaseModel):
    """Explanation for recommendation."""
    
    summary: str
    matching_skills: List[str] = Field(default_factory=list)
    learning_opportunities: List[str] = Field(default_factory=list)
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    estimated_time: Optional[str] = None


# Update forward references
RepositoryResponse.model_rebuild()
IssueResponse.model_rebuild()
