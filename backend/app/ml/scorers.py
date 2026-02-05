"""Scoring functions for repository ranking."""

import math
from datetime import datetime, timedelta
from typing import Dict, Any, List
from app.utils import logger


def calculate_repo_activity_score(repo_data: Dict[str, Any]) -> float:
    """
    Calculate repository activity score.
    
    Formula: log(stars + 1) * recency_boost
    
    Args:
        repo_data: Repository data from GitHub
        
    Returns:
        Activity score (0-1)
    """
    stars = repo_data.get('stargazers_count', 0)
    updated_at_str = repo_data.get('updated_at', '')
    
    # Stars score (logarithmic)
    stars_score = math.log(stars + 1) / math.log(100000)  # Normalize to ~100k stars
    stars_score = min(1.0, stars_score)
    
    # Recency boost
    try:
        updated_at = datetime.fromisoformat(updated_at_str.replace('Z', '+00:00'))
        days_since_update = (datetime.now(updated_at.tzinfo) - updated_at).days
        recency_boost = 1 / (1 + days_since_update / 30)  # Decay over months
    except:
        recency_boost = 0.5
    
    score = stars_score * recency_boost
    return float(min(1.0, max(0.0, score)))


def calculate_beginner_friendliness_score(repo_data: Dict[str, Any]) -> float:
    """
    Calculate how beginner-friendly a repository is.
    
    Args:
        repo_data: Repository data
        
    Returns:
        Beginner friendliness score (0-1)
    """
    score = 0.0
    
    # Check description
    if repo_data.get('description'):
        score += 0.1
    
    # Check if it has topics/tags
    topics = repo_data.get('topics', [])
    if topics:
        score += 0.1
    
    # Check for documentation
    if repo_data.get('has_wiki') or repo_data.get('has_pages'):
        score += 0.2
    
    # Check open issues (indicates activity and opportunities)
    open_issues = repo_data.get('open_issues_count', 0)
    if 5 <= open_issues <= 100:  # Sweet spot
        score += 0.2
    elif open_issues > 0:
        score += 0.1
    
    # License (good practice)
    if repo_data.get('license'):
        score += 0.1
    
    # Not too large (easier to understand)
    size = repo_data.get('size', 0)
    if size < 50000:  # < 50MB
        score += 0.1
    
    # Check for contributing guidelines (will be checked separately)
    # Placeholder for now
    score += 0.2
    
    return float(min(1.0, max(0.0, score)))


def calculate_growth_potential_score(repo_data: Dict[str, Any]) -> float:
    """
    Calculate learning/growth potential.
    
    Args:
        repo_data: Repository data
        
    Returns:
        Growth potential score (0-1)
    """
    score = 0.0
    
    # Active maintenance (forks + watchers)
    forks = repo_data.get('forks_count', 0)
    watchers = repo_data.get('watchers_count', 0)
    
    if forks > 10:
        score += 0.3
    elif forks > 0:
        score += 0.15
    
    if watchers > 50:
        score += 0.2
    elif watchers > 0:
        score += 0.1
    
    # Topics indicate well-documented areas
    topics = repo_data.get('topics', [])
    if len(topics) >= 3:
        score += 0.3
    elif len(topics) > 0:
        score += 0.15
    
    # Open issues (learning opportunities)
    open_issues = repo_data.get('open_issues_count', 0)
    if open_issues > 5:
        score += 0.2
    elif open_issues > 0:
        score += 0.1
    
    return float(min(1.0, max(0.0, score)))


def calculate_weighted_recommendation_score(
    skill_match: float,
    activity_score: float,
    beginner_score: float,
    growth_score: float,
    weights: Dict[str, float] = None
) -> float:
    """
    Calculate final weighted recommendation score.
    
    Default formula:
    Score = (Skill Match * 0.4) + (Activity * 0.2) + (Beginner * 0.2) + (Growth * 0.2)
    
    Args:
        skill_match: Skill similarity score (0-1)
        activity_score: Repository activity score (0-1)
        beginner_score: Beginner friendliness score (0-1)
        growth_score: Growth potential score (0-1)
        weights: Optional custom weights
        
    Returns:
        Final score (0-1)
    """
    if weights is None:
        weights = {
            'skill': 0.4,
            'activity': 0.2,
            'beginner': 0.2,
            'growth': 0.2
        }
    
    final_score = (
        skill_match * weights.get('skill', 0.4) +
        activity_score * weights.get('activity', 0.2) +
        beginner_score * weights.get('beginner', 0.2) +
        growth_score * weights.get('growth', 0.2)
    )
    
    return float(min(1.0, max(0.0, final_score)))


def estimate_issue_difficulty(issue_data: Dict[str, Any]) -> str:
    """
    Estimate issue difficulty based on labels and comments.
    
    Args:
        issue_data: Issue data from GitHub
        
    Returns:
        Difficulty level: 'beginner', 'intermediate', or 'advanced'
    """
    labels = [label.get('name', '').lower() for label in issue_data.get('labels', [])]
    comments_count = issue_data.get('comments', 0)
    
    # Check for explicit difficulty labels
    if any(label in ['good first issue', 'beginner', 'easy', 'starter'] for label in labels):
        return 'beginner'
    
    if any(label in ['intermediate', 'medium'] for label in labels):
        return 'intermediate'
    
    if any(label in ['advanced', 'hard', 'expert', 'complex'] for label in labels):
        return 'advanced'
    
    # Heuristic based on comments
    if comments_count == 0:
        return 'beginner'  # Fresh issue, might be simple
    elif comments_count <= 5:
        return 'beginner'
    elif comments_count <= 15:
        return 'intermediate'
    else:
        return 'advanced'


def estimate_issue_time(issue_data: Dict[str, Any], difficulty: str) -> str:
    """
    Estimate time needed to resolve an issue.
    
    Args:
        issue_data: Issue data
        difficulty: Issue difficulty level
        
    Returns:
        Time estimate string
    """
    time_map = {
        'beginner': '1-3 hours',
        'intermediate': '4-8 hours',
        'advanced': '8+ hours'
    }
    
    return time_map.get(difficulty, '2-4 hours')
