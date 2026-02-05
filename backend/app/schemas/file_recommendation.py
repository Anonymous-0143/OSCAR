"""Pydantic schemas for file recommendation models."""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from enum import Enum


class ContributionType(str, Enum):
    """Types of contributions that can be made to files."""
    
    BUG_FIX = "bug-fix"
    FEATURE = "feature"
    REFACTOR = "refactor"
    TESTS = "tests"
    DOCUMENTATION = "documentation"
    OPTIMIZATION = "optimization"


class FileInfo(BaseModel):
    """Information about a file in a repository."""
    
    path: str
    name: str
    language: Optional[str] = None
    size: int = 0  # bytes
    last_modified: Optional[datetime] = None
    url: str
    content_url: str


class FileRecommendation(BaseModel):
    """File recommendation with contribution suggestions."""
    
    rank: int
    file: FileInfo
    score: float = Field(..., ge=0.0, le=1.0)
    contribution_type: ContributionType
    suggested_contribution: str
    difficulty: str = Field(..., pattern="^(beginner|intermediate|advanced)$")
    matching_skills: List[str] = Field(default_factory=list)
    estimated_time: Optional[str] = None
    related_issues: List[int] = Field(default_factory=list)


class RecommendFilesRequest(BaseModel):
    """Request to get file recommendations."""
    
    github_username: str = Field(..., min_length=1)
    repository: str = Field(..., pattern=r"^[\w\-\.]+/[\w\-\.]+$")
    limit: int = Field(default=10, ge=1, le=50)
    branch: Optional[str] = Field(default=None)


class RecommendFilesResponse(BaseModel):
    """Response containing file recommendations."""
    
    username: str
    repository: str
    total_files: int
    recommendations: List[FileRecommendation]
    generated_at: datetime
