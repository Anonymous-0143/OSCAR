"""Custom exceptions for the application."""


class OSCRECException(Exception):
    """Base exception for OSCREC application."""
    pass


class GitHubAPIError(OSCRECException):
    """Raised when GitHub API request fails."""
    pass


class UserNotFoundError(OSCRECException):
    """Raised when GitHub user is not found."""
    pass


class InsufficientDataError(OSCRECException):
    """Raised when user has insufficient data for profiling."""
    pass


class DatabaseError(OSCRECException):
    """Raised when database operation fails."""
    pass


class RecommendationError(OSCRECException):
    """Raised when recommendation generation fails."""
    pass


class ValidationError(OSCRECException):
    """Raised when input validation fails."""
    pass
