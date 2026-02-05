"""Recommendation engine service - core ranking and matching logic."""

from typing import Dict, List, Any, Tuple
import numpy as np
import traceback
from app.services.github_service import GitHubService
from app.services.profiling_service import ProfilingService
from app.services.explainability_service import ExplainabilityService
from app.ml import (
    SkillVectorizer,
    cosine_similarity,
    calculate_repo_activity_score,
    calculate_beginner_friendliness_score,
    calculate_growth_potential_score,
    calculate_weighted_recommendation_score,
    estimate_issue_difficulty,
    estimate_issue_time
)
from app.utils import logger, RecommendationError


class RecommendationService:
    """Service for generating repository and issue recommendations."""
    
    def __init__(self):
        self.github_service = GitHubService()
        self.profiling_service = ProfilingService()
        self.explainability_service = ExplainabilityService()
        self.vectorizer = SkillVectorizer()
    
    async def recommend_repositories(
        self,
        username: str,
        limit: int = 10,
        min_stars: int = 100,
        languages: List[str] = None,
        exclude_repos: List[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Generate repository recommendations for a user.
        
        Args:
            username: GitHub username
            limit: Maximum number of recommendations
            min_stars: Minimum stars filter
            languages: Optional language filters
            exclude_repos: Repositories to exclude
            
        Returns:
            List of ranked recommendations
        """
        logger.info(f"Generating repository recommendations for {username}")
        
        try:
            # Get user skill profile
            skill_profile = await self.profiling_service.create_skill_profile(username)
            
            # Get top languages to search for
            if languages:
                search_languages = languages[:3]  # Limit to top 3
            else:
                search_languages = list(skill_profile.get('languages', {}).keys())[:3]
            
            logger.info(f"Searching for repos in languages: {search_languages}")
            
            # Search for repos in each language and combine results
            all_ranked_repos = []
            
            for lang in search_languages:
                query = f"language:{lang} stars:>={min_stars} archived:false"
                logger.info(f"Searching for {lang} repos with query: {query}")
                
                lang_candidates = await self.github_service.search_repositories(
                    query=query,
                    sort='stars',
                    order='desc',
                    per_page=30  # Get 30 per language
                )
                
                logger.info(f"Found {len(lang_candidates)} {lang} repos")
                
                # Filter exclusions
                if exclude_repos:
                    exclude_set = set(exclude_repos)
                    lang_candidates = [r for r in lang_candidates if r['full_name'] not in exclude_set]
                
                # Rank repositories for this language
                if lang_candidates:
                    ranked_repos = await self._rank_repositories(skill_profile, lang_candidates)
                    # Take top 30 per language
                    all_ranked_repos.extend(ranked_repos[:30])
                    logger.info(f"Added {min(30, len(ranked_repos))} ranked {lang} repositories")
            
            # Remove duplicates by full_name and re-sort
            seen = set()
            unique_repos = []
            for repo in all_ranked_repos:
                repo_name = repo['repository'].get('full_name')
                if repo_name and repo_name not in seen:
                    seen.add(repo_name)
                    unique_repos.append(repo)
            
            # Re-sort by score and limit
            unique_repos.sort(key=lambda x: x['score'], reverse=True)
            final_results = unique_repos[:limit]
            
            logger.info(f"Returning {len(final_results)} total repository recommendations")
            return final_results
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise RecommendationError(str(e))
    
    async def recommend_issues(
        self,
        username: str,
        limit: int = 20,
        difficulty: str = 'beginner',
        labels: List[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Generate issue recommendations for a user.
        
        Args:
            username: GitHub username
            limit: Maximum number of recommendations
            difficulty: Difficulty level filter
            labels: Optional label filters
            
        Returns:
            List of ranked issue recommendations
        """
        logger.info(f"Generating issue recommendations for {username}")
        
        try:
            # Get user skill profile
            skill_profile = await self.profiling_service.create_skill_profile(username)
            
            # Build search query
            query = await self._build_issue_search_query(
                skill_profile,
                difficulty,
                labels
            )
            
            # Search for candidate issues
            candidates = await self.github_service.search_issues(
                query=query,
                sort='created',
                order='desc',
                per_page=50
            )
            
            # Filter out pull requests (GitHub API returns both)
            candidates = [c for c in candidates if 'pull_request' not in c]
            
            # Rank issues
            ranked_issues = await self._rank_issues(skill_profile, candidates)
            
            # Limit results
            top_issues = ranked_issues[:limit]
            
            logger.info(f"Returning {len(top_issues)} issue recommendations")
            return top_issues
            
        except Exception as e:
            logger.error(f"Error generating issue recommendations: {e}")
            raise RecommendationError(str(e))
    
    async def _build_repository_search_query(
        self,
        skill_profile: Dict[str, Any],
        min_stars: int,
        languages: List[str] = None
    ) -> str:
        """Build GitHub search query for repositories."""
        query_parts = []
        
        # Language filter - use only top language for simplicity
        if languages:
            # Use first language provided
            query_parts.append(f"language:{languages[0]}")
        else:
            # Use user's top language
            top_languages = list(skill_profile.get('languages', {}).keys())
            if top_languages:
                # Use only the top language to ensure results
                query_parts.append(f"language:{top_languages[0]}")
        
        # Stars filter
        query_parts.append(f"stars:>={min_stars}")
        
        # Exclude archived
        query_parts.append('archived:false')
        
        query = ' '.join(query_parts)
        logger.info(f"Repository search query: {query}")
        return query
    
    async def _build_issue_search_query(
        self,
        skill_profile: Dict[str, Any],
        difficulty: str,
        labels: List[str] = None
    ) -> str:
        """Build GitHub search query for issues."""
        query_parts = []
        
        # Issue type
        query_parts.append('is:issue')
        query_parts.append('is:open')
        
        # Labels
        if labels:
            for label in labels:
                query_parts.append(f'label:"{label}"')
        else:
            # Default beginner-friendly labels
            if difficulty == 'beginner':
                query_parts.append('(label:"good first issue" OR label:"good-first-issue" OR label:"help wanted")')
        
        # Language filters based on user skills
        top_languages = list(skill_profile.get('languages', {}).keys())[:2]
        if top_languages:
            lang_queries = [f"language:{lang}" for lang in top_languages]
            query_parts.append(f"({' OR '.join(lang_queries)})")
        
        # Comments filter (exclude issues with too many comments for beginners)
        if difficulty == 'beginner':
            query_parts.append('comments:<10')
        
        query = ' '.join(query_parts)
        logger.info(f"Issue search query: {query}")
        return query
    
    async def _rank_repositories(
        self,
        skill_profile: Dict[str, Any],
        candidates: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Rank candidate repositories using weighted scoring."""
        ranked = []
        
        # Create user skill vector
        user_text = self._profile_to_text(skill_profile)
        
        for repo in candidates:
            try:
                # Create repo vector
                repo_text = self._repo_to_text(repo)
                
                # Calculate skill match
                skill_match = self._calculate_text_similarity(user_text, repo_text)
                
                # Calculate component scores
                activity_score = calculate_repo_activity_score(repo)
                beginner_score = calculate_beginner_friendliness_score(repo)
                growth_score = calculate_growth_potential_score(repo)
                
                # Calculate final score
                final_score = calculate_weighted_recommendation_score(
                    skill_match,
                    activity_score,
                    beginner_score,
                    growth_score
                )
                
                # Get matching skills
                matching_skills = self.explainability_service.get_matching_skills(
                    skill_profile.get('languages', {}),
                    skill_profile.get('technical_skills', []),
                    repo.get('language', ''),
                    repo.get('topics', []),
                    repo.get('description', '')
                )
                
                # Generate explanation
                explanation = self.explainability_service.explain_repository_recommendation(
                    skill_profile,
                    repo,
                    skill_match,
                    activity_score,
                    beginner_score,
                    growth_score,
                    matching_skills
                )
                
                ranked.append({
                    'repository': repo,
                    'score': final_score,
                    'explanation': explanation,
                    'component_scores': {
                        'skill_match': skill_match,
                        'activity': activity_score,
                        'beginner_friendliness': beginner_score,
                        'growth_potential': growth_score
                    }
                })
                
            except Exception as e:
                logger.warning(f"Error ranking repository {repo.get('full_name')}: {e}")
                continue
        
        # Sort by score
        ranked.sort(key=lambda x: x['score'], reverse=True)
        
        return ranked
    
    async def _rank_issues(
        self,
        skill_profile: Dict[str, Any],
        candidates: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Rank candidate issues using scoring."""
        ranked = []
        
        # Create user skill vector
        user_text = self._profile_to_text(skill_profile)
        
        for issue in candidates:
            try:
                # Get repository info
                repo_url = issue.get('repository_url', '')
                repo_full_name = repo_url.split('/')[-2:] if repo_url else []
                
                # Create issue text for matching
                issue_text = self._issue_to_text(issue)
                
                # Calculate skill match
                skill_match = self._calculate_text_similarity(user_text, issue_text)
                
                # Get issue metadata
                difficulty = estimate_issue_difficulty(issue)
                estimated_time = estimate_issue_time(issue, difficulty)
                
                # Simple scoring for issues
                final_score = skill_match * 0.7 + 0.3  # Base score boost
                
                # Boost for good labels
                labels = [l.get('name', '').lower() for l in issue.get('labels', [])]
                if 'good first issue' in labels:
                    final_score += 0.1
                if 'help wanted' in labels:
                    final_score += 0.05
                
                final_score = min(1.0, final_score)
                
                # Get matching skills
                matching_skills = []
                for lang in skill_profile.get('languages', {}).keys():
                    if lang.lower() in issue_text.lower():
                        matching_skills.append(lang)
                
                # Placeholder repo data (would need separate API call for full data)
                repo_data = {
                    'language': '/'.join(repo_full_name) if repo_full_name else '',
                    'topics': []
                }
                
                # Generate explanation
                explanation = self.explainability_service.explain_issue_recommendation(
                    skill_profile,
                    issue,
                    repo_data,
                    skill_match,
                    matching_skills,
                    difficulty,
                    estimated_time
                )
                
                ranked.append({
                    'issue': issue,
                    'score': final_score,
                    'difficulty': difficulty,
                    'explanation': explanation
                })
                
            except Exception as e:
                logger.warning(f"Error ranking issue {issue.get('number')}: {e}")
                continue
        
        # Sort by score
        ranked.sort(key=lambda x: x['score'], reverse=True)
        
        return ranked
    
    def _profile_to_text(self, skill_profile: Dict[str, Any]) -> str:
        """Convert skill profile to text for vectorization."""
        parts = []
        
        # Add languages
        languages = skill_profile.get('languages', {})
        parts.extend(list(languages.keys()))
        
        # Add technical skills
        technical_skills = skill_profile.get('technical_skills', [])
        parts.extend(technical_skills)
        
        return ' '.join(parts)
    
    def _repo_to_text(self, repo: Dict[str, Any]) -> str:
        """Convert repository data to text for vectorization."""
        parts = []
        
        # Language
        language = repo.get('language', '')
        if language:
            parts.append(language)
        
        # Topics
        topics = repo.get('topics', [])
        parts.extend(topics)
        
        # Description
        description = repo.get('description', '')
        if description:
            parts.append(description)
        
        return ' '.join(parts)
    
    def _issue_to_text(self, issue: Dict[str, Any]) -> str:
        """Convert issue data to text for vectorization."""
        parts = []
        
        # Title
        title = issue.get('title', '')
        if title:
            parts.append(title)
        
        # Labels
        labels = [l.get('name', '') for l in issue.get('labels', [])]
        parts.extend(labels)
        
        # Body (first 200 chars)
        body = issue.get('body', '')
        if body:
            parts.append(body[:200])
        
        return ' '.join(parts)
    
    def _calculate_text_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two text strings."""
        if not text1 or not text2:
            return 0.0
        
        try:
            # Simple TF-IDF based similarity
            documents = [text1, text2]
            matrix, _ = self.vectorizer.fit_transform(documents)
            
            if len(matrix) >= 2:
                vec1 = matrix[0]
                vec2 = matrix[1]
                similarity = cosine_similarity(vec1, vec2)
                return similarity
            
            return 0.0
            
        except Exception as e:
            logger.warning(f"Error calculating similarity: {e}")
            return 0.0
