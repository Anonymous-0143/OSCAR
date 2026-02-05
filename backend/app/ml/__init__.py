"""ML package initialization."""

from .vectorizers import (
    SkillVectorizer,
    cosine_similarity,
    normalize_weights,
    merge_weighted_dicts
)
from .scorers import (
    calculate_repo_activity_score,
    calculate_beginner_friendliness_score,
    calculate_growth_potential_score,
    calculate_weighted_recommendation_score,
    estimate_issue_difficulty,
    estimate_issue_time
)
from .cold_start import (
    detect_cold_start,
    get_cold_start_strategy,
    get_popular_technologies,
    generate_default_skill_profile
)

__all__ = [
    "SkillVectorizer",
    "cosine_similarity",
    "normalize_weights",
    "merge_weighted_dicts",
    "calculate_repo_activity_score",
    "calculate_beginner_friendliness_score",
    "calculate_growth_potential_score",
    "calculate_weighted_recommendation_score",
    "estimate_issue_difficulty",
    "estimate_issue_time",
    "detect_cold_start",
    "get_cold_start_strategy",
    "get_popular_technologies",
    "generate_default_skill_profile",
]
