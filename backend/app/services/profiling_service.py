"""User profiling service - skill extraction from GitHub data."""

from typing import Dict, List, Any, Tuple
from datetime import datetime
from collections import Counter
from app.services.github_service import GitHubService
from app.ml import (
    SkillVectorizer,
    normalize_weights,
    merge_weighted_dicts,
    detect_cold_start,
    get_cold_start_strategy,
    generate_default_skill_profile
)
from app.utils import logger, InsufficientDataError


class ProfilingService:
    """Service for extracting user skill profiles from GitHub data."""
    
    def __init__(self):
        self.github_service = GitHubService()
        self.vectorizer = SkillVectorizer()
    
    async def create_skill_profile(self, username: str) -> Dict[str, Any]:
        """
        Create comprehensive skill profile for a user.
        
        Args:
            username: GitHub username
            
        Returns:
            Skill profile dictionary
            
        Raises:
            InsufficientDataError: If user has insufficient data
        """
        logger.info(f"Creating skill profile for {username}")
        
        # Fetch user data
        user_data = await self.github_service.get_user(username)
        repos = await self.github_service.get_user_repos(username)
        
        # Check for cold-start
        if detect_cold_start(user_data, repos):
            logger.warning(f"Cold-start detected for {username}")
            strategy = get_cold_start_strategy(user_data)
            
            if strategy['strategy'] == 'explicit_input':
                raise InsufficientDataError(
                    f"User {username} has insufficient data. "
                    f"{strategy['message']}"
                )
            
            # Use default profile for trending strategy
            return generate_default_skill_profile()
        
        # Extract skills from multiple sources
        language_skills = await self._extract_language_skills(repos)
        commit_skills = await self._extract_commit_skills(username)
        repo_description_skills = self._extract_repo_description_skills(repos)
        
        # Merge with weights
        weighted_skills = merge_weighted_dicts([
            (language_skills, 0.4),
            (commit_skills, 0.3),
            (repo_description_skills, 0.3)
        ])
        
        # Extract technical keywords
        technical_skills = self._extract_technical_keywords(repos)
        
        # Calculate experience level
        experience_level = self._estimate_experience_level(user_data, repos)
        
        # Calculate activity score
        activity_score = self._calculate_activity_score(user_data, repos)
        
        # Calculate account age
        created_at = datetime.fromisoformat(user_data['created_at'].replace('Z', '+00:00'))
        account_age_days = (datetime.now(created_at.tzinfo) - created_at).days
        
        skill_profile = {
            'languages': normalize_weights(language_skills),
            'technical_skills': technical_skills,
            'experience_level': experience_level,
            'activity_score': activity_score,
            'total_repos': user_data.get('public_repos', 0),
            'total_commits': self._estimate_total_commits(repos),
            'account_age_days': account_age_days,
            'is_cold_start': False
        }
        
        logger.info(f"Successfully created skill profile for {username}")
        return skill_profile
    
    async def _extract_language_skills(self, repos: List[Dict[str, Any]]) -> Dict[str, float]:
        """Extract language skills from repositories."""
        language_bytes = Counter()
        
        for repo in repos:
            # Get primary language
            language = repo.get('language')
            if language:
                # Use repo size as proxy for language bytes
                size = repo.get('size', 1000)
                language_bytes[language] += size
        
        if not language_bytes:
            return {}
        
        # Convert to weights
        total = sum(language_bytes.values())
        return {lang: count / total for lang, count in language_bytes.items()}
    
    async def _extract_commit_skills(self, username: str) -> Dict[str, float]:
        """Extract skills from commit messages and activity."""
        try:
            events = await self.github_service.get_user_events(username)
            
            # Extract commit messages
            commit_messages = []
            for event in events:
                if event.get('type') == 'PushEvent':
                    commits = event.get('payload', {}).get('commits', [])
                    for commit in commits:
                        message = commit.get('message', '')
                        if message:
                            commit_messages.append(message)
            
            if not commit_messages:
                return {}
            
            # Extract keywords using TF-IDF
            all_messages = ' '.join(commit_messages)
            keywords = self.vectorizer.extract_top_keywords(all_messages, top_n=15)
            
            # Convert to dict
            return {keyword: score for keyword, score in keywords}
            
        except Exception as e:
            logger.warning(f"Error extracting commit skills: {e}")
            return {}
    
    def _extract_repo_description_skills(self, repos: List[Dict[str, Any]]) -> Dict[str, float]:
        """Extract skills from repository descriptions and topics."""
        all_text = []
        
        for repo in repos:
            # Description
            description = repo.get('description')
            if description:
                all_text.append(description)
            
            # Topics
            topics = repo.get('topics', [])
            if topics:
                all_text.append(' '.join(str(t) for t in topics if t))
        
        if not all_text:
            return {}
        
        # Extract keywords
        combined_text = ' '.join(all_text)
        keywords = self.vectorizer.extract_top_keywords(combined_text, top_n=15)
        
        return {keyword: score for keyword, score in keywords}
    
    def _extract_technical_keywords(self, repos: List[Dict[str, Any]]) -> List[str]:
        """Extract technical keywords from repos."""
        keywords = set()
        
        # Common technical terms
        technical_terms = {
            'api', 'rest', 'graphql', 'docker', 'kubernetes', 'aws', 'azure',
            'react', 'vue', 'angular', 'node', 'express', 'django', 'flask',
            'fastapi', 'postgresql', 'mysql', 'mongodb', 'redis', 'machine-learning',
            'deep-learning', 'ai', 'data-science', 'web-development', 'mobile',
            'backend', 'frontend', 'fullstack', 'devops', 'testing', 'ci-cd'
        }
        
        for repo in repos:
            # Check topics
            topics = repo.get('topics', [])
            if topics:
                for topic in topics:
                    if topic and topic.lower() in technical_terms:
                        keywords.add(topic)
            
            # Check description
            description = repo.get('description') or ''
            description_lower = description.lower() if description else ''
            for term in technical_terms:
                if term in description_lower:
                    keywords.add(term.replace('-', ' ').title())
        
        return list(keywords)[:20]  # Limit to top 20
    
    def _estimate_experience_level(self, user_data: Dict[str, Any], repos: List[Dict[str, Any]]) -> str:
        """Estimate user's experience level."""
        total_repos = user_data.get('public_repos', 0)
        followers = user_data.get('followers', 0)
        
        # Calculate total stars across repos
        total_stars = sum(repo.get('stargazers_count', 0) for repo in repos)
        
        # Heuristic scoring
        score = 0
        
        if total_repos >= 20:
            score += 3
        elif total_repos >= 10:
            score += 2
        elif total_repos >= 5:
            score += 1
        
        if followers >= 50:
            score += 3
        elif followers >= 20:
            score += 2
        elif followers >= 5:
            score += 1
        
        if total_stars >= 100:
            score += 3
        elif total_stars >= 20:
            score += 2
        elif total_stars >= 5:
            score += 1
        
        # Determine level
        if score >= 7:
            return 'advanced'
        elif score >= 4:
            return 'intermediate'
        else:
            return 'beginner'
    
    def _calculate_activity_score(self, user_data: Dict[str, Any], repos: List[Dict[str, Any]]) -> float:
        """Calculate user's activity score (0-1)."""
        total_repos = user_data.get('public_repos', 0)
        followers = user_data.get('followers', 0)
        
        # Normalize scores
        repo_score = min(1.0, total_repos / 50)
        follower_score = min(1.0, followers / 100)
        
        # Recent activity (check if repos were updated recently)
        recent_repos = 0
        now = datetime.now()
        
        for repo in repos[:10]:  # Check top 10 repos
            try:
                updated_at = datetime.fromisoformat(repo['updated_at'].replace('Z', '+00:00'))
                days_since_update = (now - updated_at.replace(tzinfo=None)).days
                if days_since_update < 90:  # Updated in last 3 months
                    recent_repos += 1
            except:
                pass
        
        recency_score = recent_repos / 10 if repos else 0
        
        # Weighted average
        activity_score = (repo_score * 0.4) + (follower_score * 0.3) + (recency_score * 0.3)
        
        return round(activity_score, 2)
    
    def _estimate_total_commits(self, repos: List[Dict[str, Any]]) -> int:
        """Estimate total commits (rough approximation)."""
        # GitHub API doesn't directly give total commits easily
        # We estimate based on repo count and activity
        return len(repos) * 50  # Rough estimate
