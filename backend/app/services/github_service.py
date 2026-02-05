"""GitHub API integration service."""

import httpx
from typing import Dict, List, Any, Optional
from datetime import datetime
from app.config import get_settings
from app.utils import logger, GitHubAPIError, UserNotFoundError

settings = get_settings()


class GitHubService:
    """Service for interacting with GitHub API (Singleton)."""
    
    _instance: Optional['GitHubService'] = None
    _client: Optional[httpx.AsyncClient] = None
    _lock = None  # Will be initialized when needed
    
    def __new__(cls):
        """Ensure only one instance of GitHubService exists."""
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
    
    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create a shared httpx client with connection pooling."""
        # Use class-level _client to ensure it's shared across all instances
        if GitHubService._client is None or GitHubService._client.is_closed:
            limits = httpx.Limits(
                max_keepalive_connections=20,
                max_connections=50,
                keepalive_expiry=30.0
            )
            GitHubService._client = httpx.AsyncClient(
                headers=self.headers,
                timeout=30.0,
                limits=limits,
                verify=False  # Disable SSL verification for corporate/proxy networks
            )
            logger.info("Created new shared HTTP client for GitHub API")
        return GitHubService._client
    
    async def close(self):
        """Close the HTTP client."""
        if GitHubService._client is not None and not GitHubService._client.is_closed:
            await GitHubService._client.aclose()
            GitHubService._client = None
            logger.info("Closed shared HTTP client for GitHub API")
    
    
    async def get_user(self, username: str) -> Dict[str, Any]:
        """
        Fetch GitHub user profile.
        
        Args:
            username: GitHub username
            
        Returns:
            User profile data
            
        Raises:
            UserNotFoundError: If user doesn't exist
            GitHubAPIError: If API request fails
        """
        try:
            client = await self._get_client()
            response = await client.get(
                f"{self.api_url}/users/{username}"
            )
            
            if response.status_code == 404:
                raise UserNotFoundError(f"GitHub user '{username}' not found")
            
            response.raise_for_status()
            return response.json()
                
        except httpx.HTTPStatusError as e:
            logger.error(f"GitHub API error for user {username}: {e}")
            raise GitHubAPIError(f"Failed to fetch user: {e}")
        except Exception as e:
            logger.error(f"Unexpected error fetching user {username}: {e}")
            raise GitHubAPIError(str(e))
    
    
    async def get_user_repos(self, username: str, per_page: int = 100) -> List[Dict[str, Any]]:
        """
        Fetch user's repositories.
        
        Args:
            username: GitHub username
            per_page: Results per page (max 100)
            
        Returns:
            List of repository data
        """
        try:
            all_repos = []
            page = 1
            client = await self._get_client()
            
            while True:
                response = await client.get(
                    f"{self.api_url}/users/{username}/repos",
                    params={"per_page": per_page, "page": page, "sort": "updated"}
                )
                response.raise_for_status()
                
                repos = response.json()
                if not repos:
                    break
                
                all_repos.extend(repos)
                
                # Limit to first 100 repos to avoid rate limits
                if len(all_repos) >= 100:
                    all_repos = all_repos[:100]
                    break
                
                page += 1
            
            logger.info(f"Fetched {len(all_repos)} repositories for {username}")
            return all_repos
            
        except Exception as e:
            logger.error(f"Error fetching repos for {username}: {e}")
            raise GitHubAPIError(str(e))
    
    async def get_repo_languages(self, owner: str, repo: str) -> Dict[str, int]:
        """
        Fetch language statistics for a repository.
        
        Args:
            owner: Repository owner
            repo: Repository name
            
        Returns:
            Dictionary of languages and their byte counts
        """
        try:
            client = await self._get_client()
            response = await client.get(
                f"{self.api_url}/repos/{owner}/{repo}/languages"
            )
            response.raise_for_status()
            return response.json()
                
        except Exception as e:
            logger.warning(f"Error fetching languages for {owner}/{repo}: {e}")
            return {}
    
    async def get_user_events(self, username: str, per_page: int = 100) -> List[Dict[str, Any]]:
        """
        Fetch recent user events (commits, issues, etc.).
        
        Args:
            username: GitHub username
            per_page: Results per page (max 100)
            
        Returns:
            List of event data
        """
        try:
            client = await self._get_client()
            response = await client.get(
                f"{self.api_url}/users/{username}/events",
                params={"per_page": per_page}
            )
            response.raise_for_status()
            events = response.json()
            
            logger.info(f"Fetched {len(events)} events for {username}")
            return events
            
        except Exception as e:
            logger.warning(f"Error fetching events for {username}: {e}")
            return []
    
    async def search_repositories(
        self,
        query: str,
        sort: str = "stars",
        order: str = "desc",
        per_page: int = 30
    ) -> List[Dict[str, Any]]:
        """
        Search for repositories.
        
        Args:
            query: Search query
            sort: Sort field (stars, forks, updated)
            order: Sort order (asc, desc)
            per_page: Results per page (max 100)
            
        Returns:
            List of repository data
        """
        try:
            logger.info(f"Searching GitHub repos with query: {query}")
            client = await self._get_client()
            response = await client.get(
                f"{self.api_url}/search/repositories",
                params={
                    "q": query,
                    "sort": sort,
                    "order": order,
                    "per_page": per_page
                }
            )
            logger.info(f"GitHub search response status: {response.status_code}")
            response.raise_for_status()
            data = response.json()
            
            total_count = data.get("total_count", 0)
            items = data.get("items", [])
            logger.info(f"GitHub search returned {total_count} total matches, returning {len(items)} items")
            
            return items
            
        except Exception as e:
            logger.error(f"Error searching repositories: {e}")
            logger.error(f"Query was: {query}")
            raise GitHubAPIError(str(e))
    
    async def get_repo_issues(
        self,
        owner: str,
        repo: str,
        labels: Optional[List[str]] = None,
        state: str = "open",
        per_page: int = 30
    ) -> List[Dict[str, Any]]:
        """
        Fetch repository issues.
        
        Args:
            owner: Repository owner
            repo: Repository name
            labels: Filter by labels
            state: Issue state (open, closed, all)
            per_page: Results per page
            
        Returns:
            List of issue data
        """
        try:
            params = {
                "state": state,
                "per_page": per_page,
                "sort": "created",
                "direction": "desc"
            }
            
            if labels:
                params["labels"] = ",".join(labels)
            
            client = await self._get_client()
            response = await client.get(
                f"{self.api_url}/repos/{owner}/{repo}/issues",
                params=params
            )
            response.raise_for_status()
            return response.json()
                
        except Exception as e:
            logger.warning(f"Error fetching issues for {owner}/{repo}: {e}")
            return []
    
    async def search_issues(
        self,
        query: str,
        sort: str = "created",
        order: str = "desc",
        per_page: int = 30
    ) -> List[Dict[str, Any]]:
        """
        Search for issues across GitHub.
        
        Args:
            query: Search query
            sort: Sort field
            order: Sort order
            per_page: Results per page
            
        Returns:
            List of issue data
        """
        try:
            client = await self._get_client()
            response = await client.get(
                f"{self.api_url}/search/issues",
                params={
                    "q": query,
                    "sort": sort,
                    "order": order,
                    "per_page": per_page
                }
            )
            response.raise_for_status()
            data = response.json()
            
            return data.get("items", [])
            
        except Exception as e:
            logger.error(f"Error searching issues: {e}")
            raise GitHubAPIError(str(e))
