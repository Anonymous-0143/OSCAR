"""Explainability service - generate human-readable explanations for recommendations."""

from typing import Dict, List, Any
from app.utils import logger


class ExplainabilityService:
    """Service for generating explanations for recommendations."""
    
    @staticmethod
    def explain_repository_recommendation(
        user_profile: Dict[str, Any],
        repo_data: Dict[str, Any],
        skill_match_score: float,
        activity_score: float,
        beginner_score: float,
        growth_score: float,
        matching_skills: List[str]
    ) -> Dict[str, Any]:
        """
        Generate explanation for a repository recommendation.
        
        Args:
            user_profile: User's skill profile
            repo_data: Repository data
            skill_match_score: Skill similarity score
            activity_score: Repository activity score
            beginner_score: Beginner friendliness score
            growth_score: Growth potential score
            matching_skills: List of matching skills
            
        Returns:
            Explanation dictionary
        """
        explanation_parts = []
        learning_opportunities = []
        
        # Part 1: Skill Match
        if matching_skills:
            top_skills = matching_skills[:3]
            if len(top_skills) == 1:
                explanation_parts.append(f"Matches your {top_skills[0]} skills")
            else:
                skills_str = ', '.join(top_skills)
                explanation_parts.append(f"Matches your skills in {skills_str}")
        
        # Part 2: Beginner Friendliness
        if beginner_score > 0.5:
            explanation_parts.append("Contains beginner-friendly issues and good documentation")
        elif beginner_score > 0.3:
            explanation_parts.append("Has beginner-friendly issues available")
        
        # Part 3: Activity
        if activity_score > 0.6:
            explanation_parts.append("Actively maintained with recent updates")
        elif activity_score > 0.4:
            explanation_parts.append("Regularly updated")
        
        # Part 4: Learning Opportunities
        repo_language = repo_data.get('language', '')
        repo_topics = repo_data.get('topics', [])
        user_languages = list(user_profile.get('languages', {}).keys())
        
        # Languages not in user's profile
        if repo_language and repo_language not in user_languages:
            learning_opportunities.append(repo_language)
        
        # Topics that could be learning opportunities
        for topic in repo_topics[:3]:
            if topic not in user_profile.get('technical_skills', []):
                learning_opportunities.append(topic.replace('-', ' ').title())
        
        if learning_opportunities:
            learn_str = ', '.join(learning_opportunities[:2])
            explanation_parts.append(f"Opportunity to learn {learn_str}")
        
        # Part 5: Community
        stars = repo_data.get('stargazers_count', 0)
        if stars > 10000:
            explanation_parts.append("Strong community support")
        elif stars > 1000:
            explanation_parts.append("Active community")
        
        summary = " • ".join(explanation_parts)
        
        return {
            'summary': summary,
            'matching_skills': matching_skills,
            'learning_opportunities': learning_opportunities,
            'confidence_score': round(skill_match_score, 2)
        }
    
    @staticmethod
    def explain_issue_recommendation(
        user_profile: Dict[str, Any],
        issue_data: Dict[str, Any],
        repo_data: Dict[str, Any],
        skill_match_score: float,
        matching_skills: List[str],
        difficulty: str,
        estimated_time: str
    ) -> Dict[str, Any]:
        """
        Generate explanation for an issue recommendation.
        
        Args:
            user_profile: User's skill profile
            issue_data: Issue data
            repo_data: Repository data
            skill_match_score: Skill similarity score
            matching_skills: List of matching skills
            difficulty: Estimated difficulty
            estimated_time: Estimated time to complete
            
        Returns:
            Explanation dictionary
        """
        explanation_parts = []
        learning_opportunities = []
        
        # Part 1: Skill Match
        if matching_skills:
            skills_str = ', '.join(matching_skills[:2])
            explanation_parts.append(f"Matches your {skills_str} skills")
        
        # Part 2: Difficulty & Labels
        labels = [label.get('name', '') for label in issue_data.get('labels', [])]
        
        if 'good first issue' in [l.lower() for l in labels]:
            explanation_parts.append("Tagged as good first issue")
        
        if difficulty == 'beginner':
            explanation_parts.append("Suitable for beginners")
        elif difficulty == 'intermediate':
            explanation_parts.append("Intermediate level challenge")
        
        # Part 3: Community Support
        comments = issue_data.get('comments', 0)
        if comments > 0:
            if comments <= 3:
                explanation_parts.append("Has some discussion and guidance")
            else:
                explanation_parts.append("Active discussion with maintainer guidance")
        else:
            explanation_parts.append("Fresh issue - be the first to contribute!")
        
        # Part 4: Learning Opportunities
        repo_language = repo_data.get('language', '')
        if repo_language:
            user_languages = list(user_profile.get('languages', {}).keys())
            if repo_language not in user_languages:
                learning_opportunities.append(repo_language)
        
        # Extract learning from labels
        learning_labels = ['testing', 'documentation', 'ci', 'docker', 'api']
        for label in labels:
            label_lower = label.lower()
            for learning_label in learning_labels:
                if learning_label in label_lower:
                    learning_opportunities.append(learning_label.title())
        
        if learning_opportunities:
            learn_str = ', '.join(set(learning_opportunities[:2]))
            explanation_parts.append(f"Learn about {learn_str}")
        
        summary = " • ".join(explanation_parts)
        
        return {
            'summary': summary,
            'matching_skills': matching_skills,
            'learning_opportunities': list(set(learning_opportunities)),
            'confidence_score': round(skill_match_score, 2),
            'estimated_time': estimated_time
        }
    
    @staticmethod
    def get_matching_skills(
        user_languages: Dict[str, float],
        user_technical_skills: List[str],
        repo_language: str,
        repo_topics: List[str],
        repo_description: str = ""
    ) -> List[str]:
        """
        Identify which user skills match the repository.
        
        Args:
            user_languages: User's language skills
            user_technical_skills: User's technical skills
            repo_language: Repository's primary language
            repo_topics: Repository topics
            repo_description: Repository description
            
        Returns:
            List of matching skills
        """
        matching = []
        
        # Match languages
        if repo_language and repo_language in user_languages:
            matching.append(repo_language)
        
        # Match topics with languages
        for topic in repo_topics:
            topic_clean = topic.replace('-', ' ').lower()
            
            # Check if topic matches any user language
            for lang in user_languages.keys():
                if lang.lower() in topic_clean or topic_clean in lang.lower():
                    if topic not in matching:
                        matching.append(topic)
            
            # Check if topic matches technical skills
            for skill in user_technical_skills:
                skill_clean = skill.lower()
                if skill_clean in topic_clean or topic_clean in skill_clean:
                    if topic not in matching:
                        matching.append(topic)
        
        # Match description keywords
        if repo_description:
            desc_lower = repo_description.lower()
            for skill in user_technical_skills:
                if skill.lower() in desc_lower:
                    if skill not in matching:
                        matching.append(skill)
        
        return matching[:5]  # Limit to top 5
