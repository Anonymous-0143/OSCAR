"""Application configuration management."""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/oscrec"
    
    # GitHub API
    github_token: str = ""
    github_api_url: str = "https://api.github.com"
    
    # App Configuration
    api_version: str = "v1"
    debug: bool = False
    allowed_origins: str = "http://localhost:3000"
    
    # Optional: Redis
    redis_url: str = "redis://localhost:6379/0"
    use_redis: bool = False
    
    # ML Configuration
    tfidf_max_features: int = 500
    min_skill_weight: float = 0.05
    recommendation_limit: int = 50
    
    # Rate Limiting
    rate_limit_per_minute: int = 60
    
    # Application Info
    app_name: str = "OSCREC API"
    app_version: str = "1.0.0"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        
    @property
    def origins_list(self) -> list[str]:
        """Parse allowed origins as list."""
        return [origin.strip() for origin in self.allowed_origins.split(",")]


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
