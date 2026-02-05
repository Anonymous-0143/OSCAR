"""Service for fetching and analyzing repository files."""

import httpx
from typing import Dict, List, Any, Optional
from datetime import datetime
from app.config import get_settings
from app.utils import logger, GitHubAPIError
from app.schemas import FileInfo, ContributionType

settings = get_settings()


class FileService:
    """Service for repository file analysis and recommendations (Singleton)."""
    
    _instance: Optional['FileService'] = None
    _client: Optional[httpx.AsyncClient] = None
    
    def __new__(cls):
        """Ensure only one instance of FileService exists."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        # Only initialize once
        if not hasattr(self, '_initialized'):
            self.api_url = settings.github_api_url
            self.headers = {
                "Accept": "application/vnd.github.v3+json",
            }
            if settings.github_token:
                self.headers["Authorization"] = f"token {settings.github_token}"
            self._initialized = True
    
    # File extension to language mapping
    LANGUAGE_MAP = {
        '.py': 'Python',
        '.js': 'JavaScript',
        '.jsx': 'JavaScript',
        '.ts': 'TypeScript',
        '.tsx': 'TypeScript',
        '.java': 'Java',
        '.cpp': 'C++',
        '.c': 'C',
        '.go': 'Go',
        '.rs': 'Rust',
        '.rb': 'Ruby',
        '.php': 'PHP',
        '.swift': 'Swift',
        '.kt': 'Kotlin',
        '.md': 'Markdown',
        '.html': 'HTML',
        '.css': 'CSS',
        '.scss': 'SCSS',
        '.sql': 'SQL',
        '.sh': 'Shell',
        '.yaml': 'YAML',
        '.yml': 'YAML',
        '.json': 'JSON',
    }
    
    # Files to exclude from recommendations
    EXCLUDED_PATTERNS = [
        'node_modules/', 'vendor/', '__pycache__/', '.git/',
        'dist/', 'build/', 'target/', 'bin/',
        '.min.js', '.min.css', 'package-lock.json', 'yarn.lock',
    ]
    
    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create a shared httpx client with connection pooling."""
        # Use class-level _client to ensure it's shared across all instances
        if FileService._client is None or FileService._client.is_closed:
            limits = httpx.Limits(
                max_keepalive_connections=20,
                max_connections=50,
                keepalive_expiry=30.0
            )
            FileService._client = httpx.AsyncClient(
                headers=self.headers,
                timeout=30.0,
                limits=limits,
                verify=False  # Disable SSL verification for corporate/proxy networks
            )
            logger.info("Created new shared HTTP client for FileService")
        return FileService._client
    
    async def close(self):
        """Close the HTTP client."""
        if FileService._client is not None and not FileService._client.is_closed:
            await FileService._client.aclose()
            FileService._client = None
            logger.info("Closed shared HTTP client for FileService")
    
    async def get_repo_info(self, owner: str, repo: str) -> Dict[str, Any]:
        """
        Fetch repository information including default branch.
        
        Args:
            owner: Repository owner
            repo: Repository name
            
        Returns:
            Repository information
        """
        try:
            client = await self._get_client()
            response = await client.get(
                f"{self.api_url}/repos/{owner}/{repo}"
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching repo info for {owner}/{repo}: {e}")
            raise GitHubAPIError(str(e))
    
    
    
    async def fetch_repo_tree(
        self,
        owner: str,
        repo: str,
        branch: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Fetch repository file tree using the repository's default branch.
        
        Args:
            owner: Repository owner
            repo: Repository name
            branch: Branch name (if None, will use repository's default branch)
            
        Returns:
            List of file/directory objects
        """
        # Check cache first (10 minute TTL for repo trees)
        from app.services.cache_service import CacheService
        cache = CacheService()
        cache_key = f"repo_tree:{owner}/{repo}:{branch or 'default'}"
        
        cached_tree = cache.get(cache_key, ttl_seconds=600)  # 10 minutes
        if cached_tree is not None:
            logger.info(f"Using cached tree for {owner}/{repo} (branch: {branch or 'default'})")
            return cached_tree
        
        
        client = await self._get_client()
        try:
            # If no branch specified, get the default branch from repo info
            if branch is None:
                repo_info = await self.get_repo_info(owner, repo)
                branch = repo_info.get('default_branch', 'main')
                logger.info(f"Auto-detected default branch '{branch}' for {owner}/{repo}")
            
            # Get branch info to get the commit SHA
            branch_response = await client.get(
                f"{self.api_url}/repos/{owner}/{repo}/branches/{branch}"
            )
            
            # If branch doesn't exist, try common alternatives
            if branch_response.status_code == 404:
                logger.warning(f"Branch '{branch}' not found for {owner}/{repo}, trying alternatives...")
                alternative_branches = ['master', 'main', 'develop']
                
                for alt_branch in alternative_branches:
                    if alt_branch == branch:
                        continue
                    logger.info(f"Trying branch '{alt_branch}'...")
                    branch_response = await client.get(
                        f"{self.api_url}/repos/{owner}/{repo}/branches/{alt_branch}"
                    )
                    if branch_response.status_code == 200:
                        branch = alt_branch
                        logger.info(f"Successfully found branch '{alt_branch}'")
                        break
                
                if branch_response.status_code != 200:
                    raise GitHubAPIError(f"No accessible branch found for {owner}/{repo}")
            
            branch_response.raise_for_status()
            branch_data = branch_response.json()
            commit_sha = branch_data['commit']['sha']
            
            # Get the tree using commit SHA (more reliable than branch name)
            response = await client.get(
                f"{self.api_url}/repos/{owner}/{repo}/git/trees/{commit_sha}",
                params={"recursive": "1"}
            )
            response.raise_for_status()
            data = response.json()
            
            # Filter out directories and get only files
            files = [item for item in data.get('tree', []) if item['type'] == 'blob']
            
            # Cache the result
            cache.set(cache_key, files)
            
            logger.info(f"Fetched {len(files)} files from {owner}/{repo} (branch: {branch}, commit: {commit_sha[:7]})")
            return files
            
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error fetching repo tree for {owner}/{repo}: {e}")
            raise GitHubAPIError(str(e))
        except Exception as e:
            logger.error(f"Error fetching repo tree for {owner}/{repo}: {e}")
            raise GitHubAPIError(str(e))
    
    def should_exclude_file(self, path: str) -> bool:
        """Check if a file should be excluded from recommendations."""
        return any(pattern in path for pattern in self.EXCLUDED_PATTERNS)
    
    def get_file_language(self, path: str) -> Optional[str]:
        """Determine file language from path/extension."""
        import os
        _, ext = os.path.splitext(path)
        return self.LANGUAGE_MAP.get(ext.lower())
    
    def analyze_file_for_contributions(self, path: str, size: int) -> Dict[str, Any]:
        """
        Analyze a file to suggest contribution types.
        
        Args:
            path: File path
            size: File size in bytes
            
        Returns:
            Dictionary with contribution suggestions
        """
        suggestions = []
        contribution_type = ContributionType.FEATURE
        
        # Check file type and suggest contributions
        if 'test' in path.lower() or 'spec' in path.lower():
            suggestions.append("Add more test cases")
            suggestions.append("Improve test coverage")
            contribution_type = ContributionType.TESTS
        elif path.endswith('.md') or 'README' in path:
            suggestions.append("Improve documentation")
            suggestions.append("Add examples and usage instructions")
            contribution_type = ContributionType.DOCUMENTATION
        elif size > 1000:  # Files over 1KB might benefit from refactoring
            suggestions.append("Refactor for better readability")
            suggestions.append("Split into smaller modules")
            contribution_type = ContributionType.REFACTOR
        else:
            suggestions.append("Add new features")
            suggestions.append("Implement missing functionality")
            contribution_type = ContributionType.FEATURE
        
        # Estimate difficulty based on size
        if size < 500:
            difficulty = "beginner"
            estimated_time = "30min - 1hr"
        elif size < 2000:
            difficulty = "intermediate"
            estimated_time = "1-2 hours"
        else:
            difficulty = "advanced"
            estimated_time = "2-4 hours"
        
        return {
            'suggestions': suggestions,
            'contribution_type': contribution_type,
            'difficulty': difficulty,
            'estimated_time': estimated_time
        }
    
    def match_file_to_skills(
        self,
        file_path: str,
        language: Optional[str],
        user_skills: List[str]
    ) -> float:
        """
        Calculate match score between file and user skills.
        
        Args:
            file_path: Path to the file
            language: Programming language of the file
            user_skills: User's programming skills
            
        Returns:
            Match score (0.0 to 1.0)
        """
        score = 0.0
        
        # Direct language match
        if language and language in user_skills:
            score += 0.6
        
        # Framework/tool match from path
        path_lower = file_path.lower()
        for skill in user_skills:
            skill_lower = skill.lower()
            if skill_lower in path_lower:
                score += 0.3
                break
        
        # Bonus for common contribution areas
        if any(keyword in path_lower for keyword in ['test', 'doc', 'example']):
            score += 0.1
        
        return min(score, 1.0)
    
    async def recommend_files(
        self,
        owner: str,
        repo: str,
        user_skills: List[str],
        branch: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get file recommendations for a user.
        
        Args:
            owner: Repository owner
            repo: Repository name
            user_skills: User's programming skills
            branch: Branch name (if None, will use repository's default branch)
            limit: Maximum recommendations
            
        Returns:
            List of file recommendations
        """
        try:
            # Fetch repository files (will auto-detect default branch if branch is None)
            files = await self.fetch_repo_tree(owner, repo, branch)
            
            recommendations = []
            
            for file_data in files:
                path = file_data.get('path', '')
                
                # Skip excluded files
                if self.should_exclude_file(path):
                    continue
                
                # Get file info
                language = self.get_file_language(path)
                size = file_data.get('size', 0)
                
                # Skip very large files (> 100KB)
                if size > 100000:
                    continue
                
                # Analyze file
                analysis = self.analyze_file_for_contributions(path, size)
                
                # Calculate match score
                score = self.match_file_to_skills(path, language, user_skills)
                
                # Only include files with some relevance
                if score > 0.0:
                    file_info = FileInfo(
                        path=path,
                        name=path.split('/')[-1],
                        language=language,
                        size=size,
                        url=f"https://github.com/{owner}/{repo}/blob/{branch}/{path}",
                        content_url=file_data.get('url', '')
                    )
                    
                    recommendations.append({
                        'file': file_info,
                        'score': score,
                        'contribution_type': analysis['contribution_type'],
                        'suggestions': analysis['suggestions'],
                        'difficulty': analysis['difficulty'],
                        'estimated_time': analysis['estimated_time']
                    })
            
            # Sort by score and return top matches
            recommendations.sort(key=lambda x: x['score'], reverse=True)
            return recommendations[:limit]
            
        except Exception as e:
            logger.error(f"Error recommending files for {owner}/{repo}: {e}")
            raise GitHubAPIError(str(e))
