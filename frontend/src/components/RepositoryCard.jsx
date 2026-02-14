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
    // High Score (Green)
    if (score >= 0.8) return { 
      text: '#10b981', // emerald-500
      border: '#10b981', 
      bg: 'rgba(16, 185, 129, 0.15)',
      glow: '0 0 10px rgba(16, 185, 129, 0.3)'
    };
    // Medium Score (Blue)
    if (score >= 0.6) return { 
      text: '#3b82f6', // blue-500
      border: '#3b82f6', 
      bg: 'rgba(59, 130, 246, 0.15)',
      glow: '0 0 10px rgba(59, 130, 246, 0.3)'
    };
    // Low Score (Yellow/Orange)
    return { 
      text: '#f59e0b', // amber-500
      border: '#f59e0b', 
      bg: 'rgba(245, 158, 11, 0.15)',
      glow: '0 0 10px rgba(245, 158, 11, 0.3)'
    };
  };

  const colors = getScoreColor(score);

  const handleToggleFiles = async () => {
    // Toggle the visible state immediately
    const nextShowFiles = !showFiles;
    setShowFiles(nextShowFiles);

    // If we're opening it and don't have files yet, fetch them
    if (nextShowFiles && !files && !loadingFiles) {
      setLoadingFiles(true);
      setFilesError(null);
      try {
        // Add a small delay so we can see the cool animation
        const [filesData] = await Promise.all([
          recommendFiles(username, repository.full_name, { limit: 5 }),
          new Promise(resolve => setTimeout(resolve, 1500))
        ]);
        setFiles(filesData);
      } catch (err) {
        console.error('Error fetching files for', repository.full_name, err);
        setFilesError('Could not load file recommendations');
      } finally {
        setLoadingFiles(false);
      }
    }
  };

  return (
    <div className="glass-panel" style={{padding: '1.5rem', transition: 'all 0.3s'}}>
      {/* Header */}
      <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem'}}>
        <div style={{
          padding: '0.25rem 0.75rem', 
          borderRadius: '9999px', 
          fontSize: '0.875rem', 
          fontWeight: 'bold', 
          border: `1px solid ${colors.border}`, 
          color: colors.text, 
          background: colors.bg,
          boxShadow: colors.glow
        }}>
          #{rank}
        </div>
        <div style={{textAlign: 'center'}}>
          <div style={{
            width: '4rem', 
            height: '4rem', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            border: `4px solid ${colors.border}`, 
            color: colors.text, 
            background: colors.bg,
            boxShadow: colors.glow
          }}>
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
            <span style={{fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem'}}>Why this match?</span>
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
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem 0'
            }}>
              <div style={{
                position: 'relative',
                width: '64px',
                height: '64px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileCode size={48} color="#3b82f6" style={{ opacity: 0.5 }} />
                
                {/* Scanning Beam */}
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '50%',
                    background: 'linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.8), transparent)',
                    animation: 'scan 1.5s linear infinite',
                    zIndex: 10
                  }}
                ></div>
              </div>
              <p style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#3b82f6',
                animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}>
                Scanning repository structure...
              </p>
              
              <style>{`
                @keyframes scan {
                  0% { transform: translateY(-100%); opacity: 0; }
                  20% { opacity: 1; }
                  80% { opacity: 1; }
                  100% { transform: translateY(200%); opacity: 0; }
                }
                @keyframes pulse {
                  0%, 100% { opacity: 1; }
                  50% { opacity: .5; }
                }
              `}</style>
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
