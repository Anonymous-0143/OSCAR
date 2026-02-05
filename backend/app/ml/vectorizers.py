"""TF-IDF vectorization and skill extraction using ML."""

from sklearn.feature_extraction.text import TfidfVectorizer
from typing import List, Dict, Tuple
import numpy as np
from app.config import get_settings
from app.utils import logger

settings = get_settings()


class SkillVectorizer:
    """Vectorize skills using TF-IDF."""
    
    def __init__(self, max_features: int = None):
        self.max_features = max_features or settings.tfidf_max_features
        self.vectorizer = TfidfVectorizer(
            max_features=self.max_features,
            stop_words='english',
            ngram_range=(1, 2),  # Unigrams and bigrams
            min_df=1,
            lowercase=True
        )
        self.is_fitted = False
    
    def fit_transform(self, documents: List[str]) -> Tuple[np.ndarray, List[str]]:
        """
        Fit vectorizer and transform documents.
        
        Args:
            documents: List of text documents
            
        Returns:
            Tuple of (feature matrix, feature names)
        """
        if not documents:
            return np.array([]), []
        
        matrix = self.vectorizer.fit_transform(documents)
        self.is_fitted = True
        feature_names = self.vectorizer.get_feature_names_out()
        
        logger.info(f"Fitted TF-IDF vectorizer with {len(feature_names)} features")
        return matrix.toarray(), list(feature_names)
    
    def transform(self, documents: List[str]) -> np.ndarray:
        """
        Transform documents using fitted vectorizer.
        
        Args:
            documents: List of text documents
            
        Returns:
            Feature matrix
        """
        if not self.is_fitted:
            raise ValueError("Vectorizer must be fitted before transform")
        
        matrix = self.vectorizer.transform(documents)
        return matrix.toarray()
    
    def extract_top_keywords(
        self,
        text: str,
        top_n: int = 20
    ) -> List[Tuple[str, float]]:
        """
        Extract top keywords from text using TF-IDF.
        
        Args:
            text: Input text
            top_n: Number of top keywords to extract
            
        Returns:
            List of (keyword, score) tuples
        """
        if not text.strip():
            return []
        
        # Create a temporary vectorizer for this text
        temp_vectorizer = TfidfVectorizer(
            max_features=self.max_features,
            stop_words='english',
            ngram_range=(1, 2),
            lowercase=True
        )
        
        try:
            matrix = temp_vectorizer.fit_transform([text])
            feature_names = temp_vectorizer.get_feature_names_out()
            scores = matrix.toarray()[0]
            
            # Get top N keywords
            top_indices = np.argsort(scores)[::-1][:top_n]
            keywords = [(feature_names[i], float(scores[i])) for i in top_indices if scores[i] > 0]
            
            return keywords
        except Exception as e:
            logger.warning(f"Error extracting keywords: {e}")
            return []


def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    """
    Calculate cosine similarity between two vectors.
    
    Args:
        vec1: First vector
        vec2: Second vector
        
    Returns:
        Similarity score (0-1)
    """
    if len(vec1) == 0 or len(vec2) == 0:
        return 0.0
    
    # Ensure vectors are 1D
    vec1 = np.array(vec1).flatten()
    vec2 = np.array(vec2).flatten()
    
    # Handle different vector lengths
    if len(vec1) != len(vec2):
        max_len = max(len(vec1), len(vec2))
        vec1 = np.pad(vec1, (0, max_len - len(vec1)))
        vec2 = np.pad(vec2, (0, max_len - len(vec2)))
    
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    similarity = dot_product / (norm1 * norm2)
    
    # Ensure result is in [0, 1]
    return float(max(0.0, min(1.0, similarity)))


def normalize_weights(weights: Dict[str, float]) -> Dict[str, float]:
    """
    Normalize weights to sum to 1.0.
    
    Args:
        weights: Dictionary of items and their weights
        
    Returns:
        Normalized weights
    """
    if not weights:
        return {}
    
    total = sum(weights.values())
    if total == 0:
        return weights
    
    return {k: v / total for k, v in weights.items()}


def merge_weighted_dicts(
    dicts_with_weights: List[Tuple[Dict[str, float], float]]
) -> Dict[str, float]:
    """
    Merge multiple dictionaries with weighted combination.
    
    Args:
        dicts_with_weights: List of (dict, weight) tuples
        
    Returns:
        Merged dictionary
    """
    result = {}
    
    for data_dict, weight in dicts_with_weights:
        for key, value in data_dict.items():
            if key in result:
                result[key] += value * weight
            else:
                result[key] = value * weight
    
    return result
