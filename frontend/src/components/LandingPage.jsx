import { Search, Github, Terminal, Cpu, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BorderBeam } from './ui/BorderBeam';
import { BentoCard } from './ui/BentoCard';
import { ToggleTheme } from './ui/ToggleTheme';
import { DynamicNavigation } from './ui/DynamicNavigation';
import { Home, Star, BookOpen } from 'lucide-react';

import { useTheme } from '../hooks/useTheme';

export default function LandingPage() {
  const navigate = useNavigate();
  const isDark = useTheme();
  
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

  const features = [
    {
      Icon: <Cpu className="h-6 w-6" />,
      name: "Smart Matching Engine",
      description: "Our advanced algorithm analyzes your coding style, language preferences, and commit history to find repositories that perfectly match your expertise.",
      href: "#",
      // cta: "Learn more",
      className: "col-span-3 lg:col-span-2",
      background: <div className="absolute right-0 top-0 h-[300px] w-[600px] bg-gradient-to-l from-blue-500/10 to-transparent" />,
    },
    {
      Icon: <Terminal className="h-6 w-6" />,
      name: "Good First Issues",
      description: "Specifically curated issues for beginners to help you make your first impact in open source.",
      href: "#",
      // cta: "Explore",
      className: "col-span-3 lg:col-span-1",
      background: <div className="absolute right-0 top-0 h-[300px] w-[600px] bg-gradient-to-l from-emerald-500/10 to-transparent" />,
    },
    {
      Icon: <Users className="h-6 w-6" />,
      name: "Community Insights",
      description: "Get deep insights into repository activity, maintainer responsiveness, and community health before you contribute.",
      href: "#",
      // cta: "See how",
      className: "col-span-3 lg:col-span-1",
      background: <div className="absolute right-0 top-0 h-[300px] w-[600px] bg-gradient-to-l from-purple-500/10 to-transparent" />,
    },
    {
      Icon: <Github className="h-6 w-6" />,
      name: "Seamless Integration",
      description: "Connect directly with GitHub to pull your portfolio and push your contributions without leaving the platform.",
      href: "#",
      // cta: "Connect",
      className: "col-span-3 lg:col-span-2",
      background: <div className="absolute right-0 top-0 h-[300px] w-[600px] bg-gradient-to-l from-orange-500/10 to-transparent" />,
    },
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
          <div className="flex items-center justify-center gap-2 mb-8" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem'}}>
            <video 
              key={isDark ? 'dark' : 'light'}
              autoPlay 
              loop 
              muted 
              playsInline
              style={{width: '140px', height: '140px', objectFit: 'contain'}}
              className="text-gray-900 dark:text-white"
            >
              <source src={isDark ? "/catvid.mp4" : "/logo.mp4"} type="video/mp4" />
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

      {/* FEATURES SECTION - Bento Grid */}
      <section id="features" className="min-h-screen flex items-center justify-center px-4 relative bg-transparent py-20">
        <div className="max-w-6xl w-full mx-auto">
          <div className="text-center mb-16 space-y-4 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white" style={{fontFamily: '"Outfit", sans-serif', letterSpacing: '-0.02em'}}>
              Engineered for Developers
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to find your place in the open source ecosystem.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-[250px] animate-fade-in-up animation-delay-200">
            {features.map((feature, idx) => (
              <BentoCard key={idx} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION - Timeline */}
      <section id="how-it-works" className="min-h-screen flex items-center justify-center px-4 relative bg-transparent py-20">
        <div className="max-w-5xl w-full mx-auto">
          <div className="text-center mb-24 space-y-4 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white" style={{fontFamily: '"Outfit", sans-serif', letterSpacing: '-0.02em'}}>
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              From analysis to contribution in four steps.
            </p>
          </div>
          
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-700 to-transparent transform md:-translate-x-1/2"></div>

            <div className="space-y-12 md:space-y-24">
              {[
                { number: "01", title: "Enter Username", desc: "Start by entering your GitHub username. No signup required.", align: "left" },
                { number: "02", title: "AI Analysis", desc: "Our engine scans your public repositories, languages, and commit history to build a skill profile.", align: "right" },
                { number: "03", title: "Get Recommendations", desc: "Receive tailored repository suggestions with 'Why this match' explanations.", align: "left" },
                { number: "04", title: "Start Contributing", desc: "Pick a 'Good First Issue' and make your impact on the community.", align: "right" }
              ].map((step, idx) => (
                <div key={idx} className={`relative flex flex-col md:flex-row items-center ${step.align === 'left' ? 'md:flex-row' : 'md:flex-row-reverse'} animate-fade-in-up`} style={{animationDelay: `${idx * 0.2}s`}}>
                  
                  {/* Content */}
                  <div className={`w-full md:w-1/2 pl-20 md:pl-0 ${step.align === 'left' ? 'md:pr-12 md:text-right text-left' : 'md:pl-12 md:text-left text-left'}`}>
                    <div className="text-sm font-bold text-blue-500 mb-2 tracking-widest">STEP {step.number}</div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">{step.desc}</p>
                  </div>

                  {/* Marker */}
                  <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-white dark:bg-black border-4 border-blue-500 z-10 box-content top-0 md:top-1/2 md:-translate-y-1/2"></div>
                  
                  {/* Empty half for desktop spacing */}
                  <div className="hidden md:block w-1/2"></div>
                </div>
              ))}
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
