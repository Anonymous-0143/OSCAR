"""Simple in-memory cache service with TTL support."""

import threading
from typing import Any, Optional, Dict, Tuple
from datetime import datetime, timedelta
from app.utils import logger


class CacheService:
    """Thread-safe in-memory cache with TTL support."""
    
    _instance: Optional['CacheService'] = None
    _lock = threading.Lock()
    
    def __new__(cls):
        """Ensure only one instance of CacheService exists."""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        # Only initialize once
        if not hasattr(self, '_initialized'):
            self._cache: Dict[str, Tuple[Any, datetime]] = {}
            self._cache_lock = threading.Lock()
            self._initialized = True
            logger.info("CacheService initialized")
    
    def get(self, key: str, ttl_seconds: Optional[int] = None) -> Optional[Any]:
        """
        Get value from cache if it exists and hasn't expired.
        
        Args:
            key: Cache key
            ttl_seconds: TTL in seconds (if None, any cached value is valid)
            
        Returns:
            Cached value or None if not found/expired
        """
        with self._cache_lock:
            if key not in self._cache:
                logger.debug(f"Cache MISS: {key}")
                return None
            
            value, timestamp = self._cache[key]
            
            # Check if expired
            if ttl_seconds is not None:
                age = (datetime.now() - timestamp).total_seconds()
                if age > ttl_seconds:
                    logger.debug(f"Cache EXPIRED: {key} (age: {age:.1f}s, ttl: {ttl_seconds}s)")
                    del self._cache[key]
                    return None
            
            logger.debug(f"Cache HIT: {key}")
            return value
    
    def set(self, key: str, value: Any) -> None:
        """
        Set value in cache with current timestamp.
        
        Args:
            key: Cache key
            value: Value to cache
        """
        with self._cache_lock:
            self._cache[key] = (value, datetime.now())
            logger.debug(f"Cache SET: {key}")
    
    def delete(self, key: str) -> None:
        """
        Delete value from cache.
        
        Args:
            key: Cache key
        """
        with self._cache_lock:
            if key in self._cache:
                del self._cache[key]
                logger.debug(f"Cache DELETE: {key}")
    
    def clear(self) -> None:
        """Clear all cached values."""
        with self._cache_lock:
            count = len(self._cache)
            self._cache.clear()
            logger.info(f"Cache CLEAR: Removed {count} entries")
    
    def cleanup_expired(self, ttl_seconds: int) -> int:
        """
        Remove all expired entries from cache.
        
        Args:
            ttl_seconds: TTL in seconds
            
        Returns:
            Number of entries removed
        """
        with self._cache_lock:
            now = datetime.now()
            expired_keys = []
            
            for key, (value, timestamp) in self._cache.items():
                age = (now - timestamp).total_seconds()
                if age > ttl_seconds:
                    expired_keys.append(key)
            
            for key in expired_keys:
                del self._cache[key]
            
            if expired_keys:
                logger.info(f"Cache CLEANUP: Removed {len(expired_keys)} expired entries")
            
            return len(expired_keys)
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics.
        
        Returns:
            Dictionary with cache stats
        """
        with self._cache_lock:
            return {
                'total_entries': len(self._cache),
                'keys': list(self._cache.keys())
            }
