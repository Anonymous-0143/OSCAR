import { Code, TrendingUp, Calendar, GitBranch, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SkillProfile({ profile }) {
  const { skill_profile } = profile;
  const [showExperienceInfo, setShowExperienceInfo] = useState(false);
  const [showActivityInfo, setShowActivityInfo] = useState(false);

  // Close tooltips when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If clicking outside the info button, close tooltips
      if (!event.target.closest('.info-button')) {
        setShowExperienceInfo(false);
        setShowActivityInfo(false);
      }
    };

    const handleScroll = () => {
      // Close tooltips when scrolling
      setShowExperienceInfo(false);
      setShowActivityInfo(false);
    };

    if (showExperienceInfo || showActivityInfo) {
      document.addEventListener('click', handleClickOutside);
      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showExperienceInfo, showActivityInfo]);

  const getExperienceBadge = (level) => {
    const badges = {
      beginner: { style: { background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.3)' }, label: 'Beginner' },
      intermediate: { style: { background: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', border: '1px solid rgba(245, 158, 11, 0.3)' }, label: 'Intermediate' },
      advanced: { style: { background: 'rgba(128, 128, 128, 0.2)', color: '#d1d5db', border: '1px solid rgba(128, 128, 128, 0.3)' }, label: 'Advanced' },
    };
    return badges[level] || badges.beginner;
  };

  const experienceBadge = getExperienceBadge(skill_profile.experience_level);

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'visible'}}>
      {/* Header */}
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'}}>
        <h2 style={{fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0}}>Your Skill Profile</h2>
        <a
          href={profile.profile_url}
          target="_blank"
          rel="noopener noreferrer"
          className="glass-button"
          style={{padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none'}}
        >
          <GitBranch size={18} />
          View GitHub
        </a>
      </div>

      {/* Stats Cards */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', overflow: 'visible'}}>
        <div className="glass-panel" style={{padding: '1.5rem', position: 'relative', overflow: 'visible'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem'}}>
            <Code size={20} style={{color: '#60a5fa'}} />
            <p style={{color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0}}>Experience</p>
            <button
              onClick={() => setShowExperienceInfo(!showExperienceInfo)}
              className="info-button"
              style={{background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 'auto'}}
            >
              <Info size={20} style={{color: showExperienceInfo ? '#60a5fa' : 'var(--text-secondary)'}} />
            </button>
          </div>
          <span style={{...experienceBadge.style, display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600}}>
            {experienceBadge.label}
          </span>
        </div>

        <div className="glass-panel" style={{padding: '1.5rem', position: 'relative', overflow: 'visible'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem'}}>
            <TrendingUp size={20} style={{color: '#34d399'}} />
            <p style={{color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0}}>Activity Score</p>
            <button
              onClick={() => setShowActivityInfo(!showActivityInfo)}
              className="info-button"
              style={{background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 'auto'}}
            >
              <Info size={20} style={{color: showActivityInfo ? '#34d399' : 'var(--text-secondary)'}} />
            </button>
          </div>
          <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0}}>{(skill_profile.activity_score * 100).toFixed(0)}%</h3>
        </div>

        <div className="glass-panel" style={{padding: '1.5rem'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem'}}>
            <GitBranch size={20} style={{color: '#9ca3af'}} />
            <p style={{color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0}}>Public Repos</p>
          </div>
          <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0}}>{skill_profile.total_repos}</h3>
        </div>

        <div className="glass-panel" style={{padding: '1.5rem'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem'}}>
            <Calendar size={20} style={{color: '#f87171'}} />
            <p style={{color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0}}>Account Age</p>
          </div>
          <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0}}>{Math.floor(skill_profile.account_age_days / 365)}y</h3>
        </div>
      </div>

      {/* Language Proficiency - Horizontal Progress Bars */}
      {skill_profile.languages && Object.keys(skill_profile.languages).length > 0 && (
        <div className="glass-panel" style={{padding: '1.5rem'}}>
          <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '1.5rem'}}>Language Proficiency</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {Object.entries(skill_profile.languages)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 8)
              .map(([language, proficiency]) => {
                const percentage = (proficiency * 100).toFixed(0);
                return (
                  <div key={language} style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span style={{color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem'}}>{language}</span>
                      <span style={{color: 'var(--text-secondary)', fontSize: '0.875rem'}}>{percentage}%</span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '9999px',
                      overflow: 'hidden'
                    }}>
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: `linear-gradient(to right, #6b7280, #9ca3af)`,
                          borderRadius: '9999px',
                          transition: 'width 0.5s ease'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Technical Skills */}
      {skill_profile.technical_skills && skill_profile.technical_skills.length > 0 && (
        <div className="glass-panel" style={{padding: '1.5rem'}}>
          <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '1rem'}}>Technical Skills</h3>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
            {skill_profile.technical_skills.map((skill, idx) => (
              <span
                key={idx}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  color: 'var(--text-primary)'
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Fixed Position Tooltips */}
      {showExperienceInfo && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '1.5rem',
          background: 'rgba(0,0,0,0.95)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(128, 128, 128, 0.5)',
          borderRadius: '1rem',
          zIndex: 10000,
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
          boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
          maxWidth: '400px',
          width: '90%'
        }}>
          <div style={{fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1rem'}}>🎓 Experience Level Calculation</div>
          <div style={{marginBottom: '0.5rem'}}><strong style={{color: 'var(--text-primary)'}}>Based on 0-9 point system:</strong></div>
          <div style={{marginLeft: '1rem'}}>
            <div>• Repos: 5/10/20+ → 1/2/3 pts</div>
            <div>• Followers: 5/20/50+ → 1/2/3 pts</div>
            <div>• Stars: 5/20/100+ → 1/2/3 pts</div>
          </div>
          <div style={{marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.2)'}}>
            <div>7-9 pts = <strong style={{color: '#60a5fa'}}>Advanced</strong></div>
            <div>4-6 pts = <strong style={{color: '#fbbf24'}}>Intermediate</strong></div>
            <div>0-3 pts = <strong style={{color: '#34d399'}}>Beginner</strong></div>
          </div>
        </div>
      )}

      {showActivityInfo && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '1.5rem',
          background: 'rgba(0,0,0,0.95)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(52, 211, 153, 0.5)',
          borderRadius: '1rem',
          zIndex: 10000,
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
          boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
          maxWidth: '400px',
          width: '90%'
        }}>
          <div style={{fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1rem'}}>⚡ Activity Score Calculation</div>
          <div style={{marginBottom: '0.5rem'}}><strong style={{color: 'var(--text-primary)'}}>Weighted average (0-100%):</strong></div>
          <div style={{marginLeft: '1rem'}}>
            <div>• <strong style={{color: 'var(--text-primary)'}}>Repositories (40%):</strong> Total repos / 50</div>
            <div>• <strong style={{color: 'var(--text-primary)'}}>Followers (30%):</strong> Followers / 100</div>
            <div>• <strong style={{color: 'var(--text-primary)'}}>Recency (30%):</strong> Repos updated in last 90 days</div>
          </div>
          <div style={{marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.2)', fontStyle: 'italic'}}>
            Higher score = more active on GitHub
          </div>
        </div>
      )}
    </div>
  );
}
