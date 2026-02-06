import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analyzeUser, recommendRepos, recommendIssues, recommendFiles } from '../services/api';
import SkillProfile from '../components/SkillProfile';
import RepositoryCard from '../components/RepositoryCard';
import IssueCard from '../components/IssueCard';
import { Github, ArrowLeft } from 'lucide-react';
import { ToggleTheme } from '../components/ui/ToggleTheme';

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [repositories, setRepositories] = useState(null);
  const [issues, setIssues] = useState(null);
  const [repoFiles, setRepoFiles] = useState({}); // Store files per repo
  const [loadingFiles, setLoadingFiles] = useState({}); // Track loading state perrepo
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) {
        navigate('/');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const profileData = await analyzeUser(username);
        setUserProfile(profileData);

        // Calculate dynamic limit based on number of languages (30 per language)
        // Note: profileData contains skill_profile which has languages
        const languages = profileData.skill_profile?.languages || {};
        const languageCount = Object.keys(languages).length || 3;
        const dynamicLimit = Math.max(30, languageCount * 30);
        
        console.log('Profile Languages:', Object.keys(languages));
        console.log('Dynamic Limit:', dynamicLimit);

        const reposData = await recommendRepos(username, { limit: dynamicLimit });
        console.log('Returned Repositories:', reposData.recommendations.length);
        setRepositories(reposData);

        const issuesData = await recommendIssues(username, { limit: 20, difficulty: 'beginner' });
        setIssues(issuesData);

        // Fetch file recommendations for top 5 repositories in parallel
        if (reposData && reposData.recommendations && reposData.recommendations.length > 0) {
          const topRepos = reposData.recommendations.slice(0, 5);
          
          // Initialize loading states
          const initialLoading = {};
          topRepos.forEach(repo => {
            initialLoading[repo.repository.full_name] = false;
          });
          setLoadingFiles(initialLoading);

          console.log(`Fetching file recommendations for ${topRepos.length} repositories`);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error during analysis:', err);
        setError(err.response?.data?.detail || err.message || 'An error occurred. Please try again.');
        setLoading(false);
      }
    };

    loadProfile();
  }, [username, navigate]);

  const handleReset = () => {
    navigate('/');
  };

  // Group repos by language logic
  const reposByLanguage = {};
  const languages = [];
  
  if (repositories && repositories.recommendations) {
    const grouped = {};
    repositories.recommendations.forEach(repo => {
      const lang = repo.repository.language || 'Other';
      if (!grouped[lang]) {
        grouped[lang] = [];
      }
      grouped[lang].push(repo);
    });

    Object.assign(reposByLanguage, grouped);
    languages.push(...Object.keys(grouped).sort((a, b) => grouped[b].length - grouped[a].length));
  }

  const filteredRepos = selectedLanguage === 'all' 
    ? (repositories?.recommendations || [])
    : (repositories?.recommendations || []).filter(repo => (repo.repository.language || 'Other') === selectedLanguage);

  if (loading) {
    return (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem', background: '#000'}}>
        <div style={{padding: '3rem', textAlign: 'center', maxWidth: '600px', background: 'transparent'}}>
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            style={{
              width: '100%',
              maxWidth: '160px',
              height: 'auto',
              margin: '0 auto 1.5rem',
              borderRadius: '1rem'
            }}
          >
            <source src="/loading-animation.mp4" type="video/mp4" />
            {/* Fallback for browsers that don't support video */}
            <Github size={64} className="text-gray-900 dark:text-white animate-pulse" style={{margin: '0 auto 1.5rem'}} />
          </video>
          <h2 className="text-gray-900 dark:text-white" style={{fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem'}}>Analyzing @{username}...</h2>
          <p className="text-gray-600 dark:text-gray-400">Extracting skills and finding matches</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem'}}>
        <div className="glass-panel" style={{padding: '3rem', textAlign: 'center', maxWidth: '28rem'}}>
          <h2 className="text-gray-900 dark:text-white" style={{fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem'}}>❌ Oops!</h2>
          <p className="text-gray-600 dark:text-gray-300" style={{marginBottom: '2rem'}}>{error}</p>
          <button 
            onClick={handleReset} 
            className="glass-button"
            style={{padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto'}}
          >
            <ArrowLeft size={20} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/30 dark:bg-black/30 border-b border-gray-200 dark:border-white/10">
        <div style={{maxWidth: '80rem', margin: '0 auto', padding: '1rem 1.5rem'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
              <Github size={32} className="text-gray-900 dark:text-white" />
              <span className="text-gray-900 dark:text-white" style={{fontSize: '1.5rem', fontWeight: 'bold'}}>OSCAR</span>
            </div>
            <div className="flex items-center gap-4">
              <ToggleTheme />
              <button 
                onClick={handleReset} 
                className="glass-button"
                style={{padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}
              >
                <ArrowLeft size={18} />
                New Search
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{paddingTop: '6rem', paddingBottom: '4rem', padding: '6rem 1rem 4rem 1rem'}}>
        <div style={{maxWidth: '80rem', margin: '0 auto'}}>
          <div style={{marginBottom: '3rem'}}>
            <SkillProfile profile={userProfile} />
          </div>

          {repositories && repositories.recommendations.length > 0 && (
            <section style={{marginBottom: '3rem'}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem'}}>
                <div>
                  <h2 className="text-gray-900 dark:text-white" style={{fontSize: '1.875rem', fontWeight: 'bold'}}>Recommended Repositories</h2>
                  <p className="text-gray-600 dark:text-gray-400" style={{marginTop: '0.5rem'}}>
                    {selectedLanguage === 'all' 
                      ? `${repositories.total_recommendations} total repositories` 
                      : `${filteredRepos.length} ${selectedLanguage} repositories`}
                  </p>
                </div>
              </div>

              {/* Language Filter Buttons */}
              <div style={{marginBottom: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
                <button
                  onClick={() => setSelectedLanguage('all')}
                  className="glass-button"
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '9999px',
                    fontWeight: 600,
                    background: selectedLanguage === 'all' ? 'rgba(128, 128, 128, 0.3)' : 'rgba(255,255,255,0.1)',
                    borderColor: selectedLanguage === 'all' ? 'rgba(128, 128, 128, 0.5)' : 'rgba(255,255,255,0.2)',
                  }}
                >
                  All Languages ({repositories.total_recommendations})
                </button>
                {languages.map(lang => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className="glass-button"
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: '9999px',
                      fontWeight: 600,
                      background: selectedLanguage === lang ? 'rgba(128, 128, 128, 0.3)' : 'rgba(255,255,255,0.1)',
                      borderColor: selectedLanguage === lang ? 'rgba(128, 128, 128, 0.5)' : 'rgba(255,255,255,0.2)',
                    }}
                  >
                    {lang} ({reposByLanguage[lang]?.length || 0})
                  </button>
                ))}
              </div>

              {/* Repository Grid */}
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', gap: '1.5rem'}}>
                {filteredRepos.map((repo, idx) => (
                  <RepositoryCard key={idx} repo={repo} rank={repo.rank} username={username} />
                ))}
              </div>
            </section>
          )}

          {issues && issues.issues.length > 0 && (
            <section style={{marginBottom: '3rem'}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                <h2 className="text-gray-900 dark:text-white" style={{fontSize: '1.875rem', fontWeight: 'bold'}}>Beginner-Friendly Issues</h2>
                <span className="glass-badge text-gray-900 dark:text-white" style={{padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600}}>
                  {issues.total_issues} issues
                </span>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr', gap: '1rem'}}>
                {issues.issues.map((issue, idx) => (
                  <IssueCard key={idx} issue={issue} rank={issue.rank} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="backdrop-blur-xl bg-white/30 dark:bg-black/30 border-t border-gray-200 dark:border-white/10 py-8">
        <div style={{maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem'}}>
          <p style={{textAlign: 'center', color: '#9ca3af'}}>
            Built with ❤️ using FastAPI, React, and ML
          </p>
        </div>
      </footer>
    </div>
  );
}
