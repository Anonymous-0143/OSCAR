import { MessageCircle, ExternalLink, CheckCircle, Lightbulb, Clock } from 'lucide-react';

export default function IssueCard({ issue, rank }) {
  const { issue: issueData, score, explanation, difficulty } = issue;

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'var(--success)',
      intermediate: 'var(--warning)',
      advanced: 'var(--error)',
    };
    return colors[difficulty] || colors.beginner;
  };

  const getDifficultyLabel = (difficulty) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  return (
    <div className="issue-card fade-in" style={{ animationDelay: `${rank * 0.05}s` }}>
      <div className="issue-header">
        <div className="issue-rank">#{rank}</div>
        <div className="issue-difficulty" style={{ 
          background: getDifficultyColor(difficulty) + '20',
          color: getDifficultyColor(difficulty),
          border: `1px solid ${getDifficultyColor(difficulty)}40`
        }}>
          {getDifficultyLabel(difficulty)}
        </div>
      </div>

      <div className="issue-content">
        <h4 className="issue-title">
          <a href={issueData.url} target="_blank" rel="noopener noreferrer">
            {issueData.title}
          </a>
        </h4>

        <div className="issue-meta">
          <span className="issue-repo">{issueData.repository}</span>
          <span className="issue-number">#{issueData.number}</span>
        </div>

        {/* Labels */}
        {issueData.labels && issueData.labels.length > 0 && (
          <div className="issue-labels">
            {issueData.labels.slice(0, 4).map((label, idx) => (
              <span key={idx} className="label-tag">
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="issue-stats">
          <div className="issue-stat">
            <MessageCircle size={14} />
            <span>{issueData.comments_count} comment{issueData.comments_count !== 1 ? 's' : ''}</span>
          </div>
          {explanation.estimated_time && (
            <div className="issue-stat">
              <Clock size={14} />
              <span>{explanation.estimated_time}</span>
            </div>
          )}
        </div>

        {/* Explanation */}
        <div className="issue-explanation">
          <p className="explanation-text">{explanation.summary}</p>

          <div className="explanation-details">
            {/* Matching Skills */}
            {explanation.matching_skills && explanation.matching_skills.length > 0 && (
              <div className="detail-group">
                <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                <div className="detail-badges">
                  {explanation.matching_skills.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="badge badge-success">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Opportunities */}
            {explanation.learning_opportunities && explanation.learning_opportunities.length > 0 && (
              <div className="detail-group">
                <Lightbulb size={14} style={{ color: 'var(--warning)' }} />
                <div className="detail-badges">
                  {explanation.learning_opportunities.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="badge badge-warning">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action */}
        <a
          href={issueData.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm issue-action"
        >
          <ExternalLink size={16} />
          View Issue
        </a>
      </div>
    </div>
  );
}
