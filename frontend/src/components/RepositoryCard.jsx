import { useState } from 'react';
import { Star, GitFork, AlertCircle, ExternalLink, CheckCircle, Lightbulb, ChevronDown, ChevronUp, FileCode, Loader2 } from 'lucide-react';
import { recommendFiles } from '../services/api';
import FileRecommendationCard from './FileRecommendationCard';

export default function RepositoryCard({ repo, rank, username }) {
  const { repository, score, explanation, beginner_issues_count } = repo;
  const [showFiles, setShowFiles] = useState(false);
  const [files, setFiles] = useState(null);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [filesError, setFilesError] = useState(null);

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num;
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return { text: '#6ee7b7', border: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' };
    if (score >= 0.6) return { text: '#93c5fd', border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)' };
    return { text: '#fde047', border: '#eab308', bg: 'rgba(234, 179, 8, 0.2)' };
  };

  const colors = getScoreColor(score);

  const handleToggleFiles = async () => {
    if (!showFiles && !files && !loadingFiles) {
      // Fetch files for the first time
      setLoadingFiles(true);
      setFilesError(null);
      try {
        const filesData = await recommendFiles(username, repository.full_name, { limit: 5 });
        setFiles(filesData);
      } catch (err) {
        console.error('Error fetching files for', repository.full_name, err);
        setFilesError('Could not load file recommendations');
      } finally {
        setLoadingFiles(false);
      }
    }
    setShowFiles(!showFiles);
  };

  return (
    <div className="glass-panel" style={{padding: '1.5rem', transition: 'all 0.3s'}}>
      {/* Header */}
      <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem'}}>
        <div style={{padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 'bold', border: `1px solid ${colors.border}`, color: colors.text, background: colors.bg}}>
          #{rank}
        </div>
        <div style={{textAlign: 'center'}}>
          <div style={{width: '4rem', height: '4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `4px solid ${colors.border}`, color: colors.text, background: colors.bg}}>
            <span style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{(score * 100).toFixed(0)}</span>
          </div>
          <span style={{fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem'}}>Match</span>
        </div>
      </div>

      {/* Title */}
      <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
        <a 
          href={repository.url} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{color: 'var(--text-primary)', textDecoration: 'none'}}
          onMouseEnter={(e) => e.target.style.color = '#60a5fa'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-primary)'}
        >
          {repository.full_name}
        </a>
      </h3>

      {repository.language && (
        <span style={{display: 'inline-block', padding: '0.25rem 0.75rem', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#93c5fd', borderRadius: '9999px', fontSize: '0.875rem', marginBottom: '0.75rem'}}>
          {repository.language}
        </span>
      )}

      {/* Description */}
      <p style={{color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
        {repository.description || 'No description available'}
      </p>

      {/* Topics */}
      {repository.topics && repository.topics.length > 0 && (
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem'}}>
          {repository.topics.slice(0, 5).map((topic, idx) => (
            <span key={idx} style={{padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)', borderRadius: '0.25rem', fontSize: '0.75rem'}}>
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
          <Star size={16} />
          <span>{formatNumber(repository.stars)}</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
          <GitFork size={16} />
          <span>{formatNumber(repository.forks)}</span>
        </div>
        {beginner_issues_count > 0 && (
          <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
            <AlertCircle size={16} color="#6ee7b7" />
            <span>{beginner_issues_count} beginner issues</span>
          </div>
        )}
      </div>

      {/* Why Recommended */}
      <div style={{padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', borderLeft: `3px solid ${colors.border}`, marginBottom: '1rem'}}>
        <div style={{display: 'flex', alignItems: 'start', gap: '0.5rem'}}>
          <Lightbulb size={16} style={{color: colors.text, marginTop: '0.2rem', flexShrink: 0}} />
          <div>
            <span style={{fontSize: '0.75rem', fontWeight: 600, color: colors.text , display: 'block', marginBottom: '0.25rem'}}>Why this match?</span>
            <p style={{fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0}}>
              {typeof explanation === 'string' ? explanation : explanation?.summary || 'Good match for your skills'}
            </p>
          </div>
        </div>
      </div>

      {/* File Recommendations Toggle Button */}
      <button
        onClick={handleToggleFiles}
        className="glass-button"
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: showFiles ? '1rem' : 0
        }}
      >
        <FileCode size={16} />
        {showFiles ? 'Hide' : 'Show'} Files to Contribute
        {showFiles ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Expandable File Recommendations Section */}
      {showFiles && (
        <div style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          animation: 'slideDown 0.3s ease-out'
        }}>
          {loadingFiles && (
            <div style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>
              <Loader2 size={32} className="animate-spin" style={{margin: '0 auto 0.5rem'}} />
              <p>Loading file recommendations...</p>
            </div>
          )}

          {filesError && (
            <div style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>
              <p>{filesError}</p>
            </div>
          )}

          {files && files.recommendations && files.recommendations.length > 0 && (
            <div style={{display: 'grid', gap: '1rem'}}>
              {files.recommendations.map((fileRec, idx) => (
                <FileRecommendationCard key={idx} recommendation={fileRec} />
              ))}
            </div>
          )}

          {files && files.recommendations && files.recommendations.length === 0 && (
            <div style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>
              <p>No file recommendations found for your skills</p>
            </div>
          )}
        </div>
      )}

      {/* View on GitHub */}
      <a
        href={repository.url}
        target="_blank"
        rel="noopener noreferrer"
        className="glass-button"
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          textDecoration: 'none',
          marginTop: '0.5rem'
        }}
      >
        View on GitHub
        <ExternalLink size={16} />
      </a>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
