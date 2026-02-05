import React from 'react';
import { FileCode, Clock, Target, ExternalLink, Sparkles } from 'lucide-react';

const difficultyColors = {
  beginner: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
  intermediate: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20' },
  advanced: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' }
};

const contributionTypeIcons = {
  'bug-fix': '🐛',
  'feature': '✨',
  'refactor': '♻️',
  'tests': '🧪',
  'documentation': '📚',
  'optimization': '⚡'
};

const contributionTypeLabels = {
  'bug-fix': 'Bug Fix',
  'feature': 'Feature',
  'refactor': 'Refactor',
  'tests': 'Tests',
  'documentation': 'Docs',
  'optimization': 'Optimize'
};

export const FileRecommendationCard = ({ recommendation }) => {
  const { file, score, contribution_type, suggested_contribution, difficulty, estimated_time, matching_skills } = recommendation;
  const difficultyStyle = difficultyColors[difficulty] || difficultyColors.beginner;

  return (
    <div className="glass-panel p-6 hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group">
      {/* Score indicator */}
      <div className="absolute top-4 right-4">
        <div className={`${difficultyStyle.bg} ${difficultyStyle.text} ${difficultyStyle.border} border px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
          <Target size={12} />
          {difficulty}
        </div>
      </div>

      {/* File info */}
      <div className="flex items-start gap-4 mb-4">
        <div className="glass-panel w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
          <FileCode size={24} className="text-blue-500" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold mb-1 truncate" style={{color: 'var(--text-primary)'}}>
            {file.name}
          </h3>
          <p className="text-sm mb-2" style={{color: 'var(--text-secondary)', fontFamily: 'monospace'}}>
            {file.path}
          </p>
          
          {/* Language badge */}
          {file.language && (
            <span className="inline-block px-2 py-1 rounded-md text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">
              {file.language}
            </span>
          )}
        </div>
      </div>

      {/* Contribution type */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{contributionTypeIcons[contribution_type]}</span>
          <span className="text-sm font-semibold" style={{color: 'var(--text-secondary)'}}>
            {contributionTypeLabels[contribution_type]}
          </span>
        </div>
        <p className="text-sm leading-relaxed" style={{color: 'var(--text-primary)'}}>
          {suggested_contribution}
        </p>
      </div>

      {/* Matching skills */}
      {matching_skills && matching_skills.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1 mb-2">
            <Sparkles size={14} style={{color: 'var(--text-secondary)'}} />
            <span className="text-xs font-semibold" style={{color: 'var(--text-secondary)'}}>
              Matching Skills
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {matching_skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-500 border border-blue-500/20"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t" style={{borderColor: 'var(--glass-border)'}}>
        <div className="flex items-center gap-2">
          <Clock size={14} style={{color: 'var(--text-secondary)'}} />
          <span className="text-xs" style={{color: 'var(--text-secondary)'}}>
            {estimated_time || 'Time varies'}
          </span>
        </div>
        
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-1.5 rounded-md glass-button text-sm font-medium hover:scale-105 transition-transform"
        >
          View File
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Score bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
        <div 
          className="h-full bg-gradient-to-r from-gray-500 to-gray-400 transition-all duration-500"
          style={{width: `${score * 100}%`}}
        />
      </div>
    </div>
  );
};

export default FileRecommendationCard;
