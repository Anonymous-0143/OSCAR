"""Cold-start handling for new users with minimal GitHub activity."""

from typing import Dict, List, Any
from app.utils import logger


def detect_cold_start(user_data: Dict[str, Any], repos: List[Dict[str, Any]]) -> bool:
    """
    Detect if user is in cold-start scenario.
    
    Args:
        user_data: GitHub user data
        repos: User's repositories
        
    Returns:
        True if cold-start scenario detected
    """
    total_repos = user_data.get('public_repos', 0)
    
    # Cold start conditions
    if total_repos == 0:
        return True
    
    if total_repos < 3:
        return True
    
    if len(repos) < 2:
        return True
    
    return False


def get_cold_start_strategy(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Determine cold-start strategy based on user data.
    
    Args:
        user_data: GitHub user data
        
    Returns:
        Strategy information
    """
    total_repos = user_data.get('public_repos', 0)
    
    if total_repos == 0:
        return {
            'strategy': 'explicit_input',
            'reason': 'No public repositories found',
            'message': 'Please select your programming languages and areas of interest',
            'suggested_options': get_popular_technologies()
        }
    
    elif total_repos < 3:
        return {
            'strategy': 'trending_beginner',
            'reason': 'Limited repository history',
            'message': 'Showing popular beginner-friendly repositories',
            'fallback_query': 'good-first-issue language:python OR language:javascript'
        }
    
    else:
        return {
            'strategy': 'standard',
            'reason': 'Sufficient data for profiling',
            'message': 'Analyzing your profile...'
        }


def get_popular_technologies() -> List[str]:
    """
    Get list of popular technologies for cold-start selection.
    
    Returns:
        List of popular technology names
    """
    return [
        'Python',
        'JavaScript',
        'TypeScript',
        'Java',
        'C++',
        'Go',
        'Rust',
        'Ruby',
        'PHP',
        'C#',
        'Swift',
        'Kotlin',
        'SQL',
        'HTML/CSS',
        'React',
        'Node.js',
        'Machine Learning',
        'Web Development',
        'Mobile Development',
        'DevOps'
    ]


def get_trending_beginner_repos_query(language: str = None) -> str:
    """
    Generate search query for trending beginner-friendly repos.
    
    Args:
        language: Optional programming language filter
        
    Returns:
        GitHub search query string
    """
    base_query = 'good-first-issue is:issue is:open'
    
    if language:
        return f'{base_query} language:{language.lower()}'
    
    # Default to popular languages
    return f'{base_query} language:python OR language:javascript'


def generate_default_skill_profile(languages: List[str] = None) -> Dict[str, Any]:
    """
    Generate a default skill profile for cold-start users.
    
    Args:
        languages: List of languages user is interested in
        
    Returns:
        Default skill profile
    """
    if not languages:
        languages = ['Python', 'JavaScript']
    
    # Equal weight distribution
    weight = 1.0 / len(languages)
    language_weights = {lang: weight for lang in languages}
    
    return {
        'languages': language_weights,
        'technical_skills': [
            'beginner-friendly',
            'documentation',
            'open-source'
        ],
        'experience_level': 'beginner',
        'activity_score': 0.3,
        'total_repos': 0,
        'total_commits': 0,
        'account_age_days': 0,
        'is_cold_start': True
    }
