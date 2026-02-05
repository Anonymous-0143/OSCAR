import { Search, Github } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BorderBeam } from './ui/BorderBeam';
import { MagicCard } from './ui/MagicCard';
import { ToggleTheme } from './ui/ToggleTheme';
import { DynamicNavigation } from './ui/DynamicNavigation';
import { Home, Star, BookOpen } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const username = e.target.username.value.trim();
    if (username) {
      navigate(`/profile/${username}`);
    }
  };

  const navLinks = [
    { id: 'home', label: 'Home', href: '#home', icon: <Home size={16} /> },
    { id: 'features', label: 'Features', href: '#features', icon: <Star size={16} /> },
    { id: 'how-it-works', label: 'Working', href: '#how-it-works', icon: <BookOpen size={16} /> },
  ];

  return (
    <div className="transition-colors duration-300 bg-transparent" style={{scrollBehavior: 'smooth'}}>
      <div className="fixed top-6 inset-x-0 z-50 flex justify-center items-center gap-4 pointer-events-none">
        <div className="pointer-events-auto">
          <DynamicNavigation 
            links={navLinks}
            className="bg-white/10 dark:bg-black/20 backdrop-blur-xl border-white/20"
          />
        </div>
        <div className="pointer-events-auto">
          <ToggleTheme className="bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 hover:bg-white/20 dark:hover:bg-white/10" />
        </div>
      </div>

      {/* HOME SECTION - Full Page */}
      <section id="home" className="min-h-screen flex items-center justify-center px-4 relative bg-transparent">
        <div className="max-w-4xl w-full text-center mx-auto">
          {/* Logo */}
          <div className="flex items-center justify-center gap-4 mb-8" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '2rem'}}>
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              style={{width: '120px', height: '120px', objectFit: 'contain'}}
              className="text-gray-900 dark:text-white"
            >
              <source src="/logo.mp4" type="video/mp4" />
            </video>
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white" style={{fontSize: '3.75rem', fontWeight: '800', fontFamily: '"Outfit", sans-serif', letterSpacing: '-0.02em'}}>OSCAR</h1>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold mb-6 leading-tight text-gray-700 dark:text-gray-200" style={{fontSize: '2rem', fontWeight: '700', marginBottom: '1.5rem', lineHeight: '1.2', fontFamily: '"Outfit", sans-serif', letterSpacing: '-0.01em'}}>
            Open Source Contribution And Recommendation
          </h2>

          {/* Subtitle */}
          <p className="text-xl mb-12 max-w-2xl mx-auto text-gray-600 dark:text-gray-400" style={{fontSize: '1.25rem', marginBottom: '3rem', maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto'}}>
            Find Your Next Open-Source Contribution with AI-powered recommendations based on your skills and experience.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="glass-panel p-2 max-w-2xl mx-auto flex flex-col sm:flex-row gap-3" style={{padding: '0.5rem', maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg relative overflow-hidden" style={{flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', position: 'relative', overflow: 'hidden'}}>
                <Github size={24} style={{color: '#9ca3af'}} />
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your GitHub username"
                  className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 outline-none text-lg"
                  style={{flex: 1, background: 'transparent', fontSize: '1.125rem', border: 'none', outline: 'none'}}
                  autoComplete="off"
                  required
                />
                <BorderBeam 
                  size={100} 
                  duration={12} 
                  colorFrom="#6b7280" 
                  colorTo="#9ca3af" 
                  delay={0}
                  beamBorderRadius={8}
                />
              </div>
              <button
                type="submit"
                className="glass-button px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:scale-105 transition-transform w-full sm:w-auto focus:outline-none focus:ring-0"
                style={{fontSize: '1rem'}}
              >
                <Search size={18} />
                Analyze Profile
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* FEATURES SECTION - Full Page */}
      <section id="features" className="min-h-screen flex items-center justify-center px-4 relative bg-transparent">
        <div className="max-w-4xl w-full mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white" style={{fontSize: '2.5rem', fontWeight: '800', textAlign: 'center', marginBottom: '3rem', fontFamily: '"Outfit", sans-serif', letterSpacing: '-0.02em'}}>
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem'}}>
            <MagicCard
              icon="🎯"
              title="Smart Matching"
              description="TF-IDF & cosine similarity for precise skill matching"
            />
            <MagicCard
              icon="💡"
              title="Explainable AI"
              description="Understand why each repository was recommended"
            />
            <MagicCard
              icon="🚀"
              title="Beginner Friendly"
              description="Curated issues perfect for your skill level"
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION - Full Page */}
      <section id="how-it-works" className="min-h-screen flex items-center justify-center px-4 relative bg-transparent">
        <div className="max-w-5xl w-full mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white" style={{fontSize: '2.25rem', fontWeight: '800', textAlign: 'center', marginBottom: '3rem', fontFamily: '"Outfit", sans-serif', letterSpacing: '-0.02em'}}>
            How It Works
          </h2>
          
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8" style={{maxWidth: '64rem', marginLeft: 'auto', marginRight: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem'}}>
            {/* Step 1 */}
            <div className="relative text-center" style={{position: 'relative', textAlign: 'center'}}>
              <div className="glass-panel w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full" style={{width: '5rem', height: '5rem', marginLeft: 'auto', marginRight: 'auto', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%'}}>
                <span style={{fontSize: '2rem'}}>📝</span>
              </div>
              <div className="glass-panel px-4 py-2 inline-block mb-2" style={{padding: '0.5rem 1rem', display: 'inline-block', marginBottom: '0.5rem', borderRadius: '0.5rem'}}>
                <span className="text-sm font-semibold text-gray-400" style={{fontSize: '0.875rem', fontWeight: 600, color: '#9ca3af'}}>Step 1</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2" style={{fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>Enter Username</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400" style={{fontSize: '0.875rem'}}>Simply provide your GitHub username</p>
            </div>

            {/* Step 2 */}
            <div className="relative text-center" style={{position: 'relative', textAlign: 'center'}}>
              <div className="glass-panel w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full" style={{width: '5rem', height: '5rem', marginLeft: 'auto', marginRight: 'auto', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%'}}>
                <span style={{fontSize: '2rem'}}>🔍</span>
              </div>
              <div className="glass-panel px-4 py-2 inline-block mb-2" style={{padding: '0.5rem 1rem', display: 'inline-block', marginBottom: '0.5rem', borderRadius: '0.5rem'}}>
                <span className="text-sm font-semibold text-gray-400" style={{fontSize: '0.875rem', fontWeight: 600, color: '#9ca3af'}}>Step 2</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2" style={{fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>AI Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400" style={{fontSize: '0.875rem'}}>Our AI analyzes your skills & experience</p>
            </div>

            {/* Step 3 */}
            <div className="relative text-center" style={{position: 'relative', textAlign: 'center'}}>
              <div className="glass-panel w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full" style={{width: '5rem', height: '5rem', marginLeft: 'auto', marginRight: 'auto', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%'}}>
                <span style={{fontSize: '2rem'}}>🎯</span>
              </div>
              <div className="glass-panel px-4 py-2 inline-block mb-2" style={{padding: '0.5rem 1rem', display: 'inline-block', marginBottom: '0.5rem', borderRadius: '0.5rem'}}>
                <span className="text-sm font-semibold text-gray-400" style={{fontSize: '0.875rem', fontWeight: 600, color: '#9ca3af'}}>Step 3</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2" style={{fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>Get Matches</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400" style={{fontSize: '0.875rem'}}>Receive personalized recommendations</p>
            </div>

            {/* Step 4 */}
            <div className="relative text-center" style={{position: 'relative', textAlign: 'center'}}>
              <div className="glass-panel w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full" style={{width: '5rem', height: '5rem', marginLeft: 'auto', marginRight: 'auto', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%'}}>
                <span style={{fontSize: '2rem'}}>🚀</span>
              </div>
              <div className="glass-panel px-4 py-2 inline-block mb-2" style={{padding: '0.5rem 1rem', display: 'inline-block', marginBottom: '0.5rem', borderRadius: '0.5rem'}}>
                <span className="text-sm font-semibold text-gray-400" style={{fontSize: '0.875rem', fontWeight: 600, color: '#9ca3af'}}>Step 4</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2" style={{fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>Start Contributing</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400" style={{fontSize: '0.875rem'}}>Begin your open source journey</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-panel" style={{borderRadius: 0, borderLeft: 0, borderRight: 0, borderBottom: 0}}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4" style={{maxWidth: '72rem', marginLeft: 'auto', marginRight: 'auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', gap: '1rem'}}>
          <p className="text-sm text-gray-400" style={{fontSize: '0.875rem', color: '#9ca3af'}}>
            © 2026 OSCAR. All rights reserved.
          </p>
          <div className="flex gap-6" style={{display: 'flex', gap: '1.5rem'}}>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" style={{color: '#9ca3af'}}>
              <Github size={20} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
