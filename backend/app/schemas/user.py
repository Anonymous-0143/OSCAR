"""Pydantic schemas for user-related API endpoints."""

from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Dict, List, Optional


class UserAnalysisRequest(BaseModel):
    """Request schema for user analysis."""
    
    github_username: str = Field(
        ...,
        min_length=1,
        max_length=39,
        description="GitHub username to analyze"
    )
    
    @field_validator('github_username')
    @classmethod
    def validate_username(cls, v: str) -> str:
        """Validate GitHub username format."""
        # GitHub usernames can only contain alphanumeric characters and hyphens
        # Cannot start with hyphen
        if not v.replace('-', '').replace('_', '').isalnum():
            raise ValueError("Invalid GitHub username format")
        if v.startswith('-'):
            raise ValueError("Username cannot start with hyphen")
        return v.lower()


class SkillProfile(BaseModel):
    """Skill profile data."""
    
    languages: Dict[str, float] = Field(
        default_factory=dict,
        description="Programming languages with weights"
    )
    technical_skills: List[str] = Field(
        default_factory=list,
        description="Technical skills and keywords"
    )
    experience_level: str = Field(
        ...,
        description="Estimated experience level"
    )
    activity_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="User activity score (0-1)"
    )
    total_repos: int = Field(default=0, description="Total repositories")
    total_commits: int = Field(default=0, description="Total commits")
    account_age_days: int = Field(default=0, description="Account age in days")


class SkillProfileResponse(BaseModel):
    """Response schema for skill profile endpoint."""
    
    username: str
    skill_profile: SkillProfile
    last_updated: datetime
    from_cache: bool = False


class UserAnalysisResponse(BaseModel):
    """Response schema for user analysis."""
    
    username: str
    profile_url: str
    analysis_timestamp: datetime
    skill_profile: SkillProfile
    cache_hit: bool = False
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "octocat",
                "profile_url": "https://github.com/octocat",
                "analysis_timestamp": "2026-02-02T08:40:55Z",
                "skill_profile": {
                    "languages": {
                        "Python": 0.45,
                        "JavaScript": 0.30,
                        "Go": 0.15
                    },
                    "technical_skills": ["REST API", "Docker", "PostgreSQL"],
                    "experience_level": "intermediate",
                    "activity_score": 0.78,
                    "total_repos": 42,
                    "total_commits": 1337,
                    "account_age_days": 1825
                },
                "cache_hit": False
            }
        }
