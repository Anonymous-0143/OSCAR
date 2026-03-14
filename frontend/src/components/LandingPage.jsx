import { Search, Github, Terminal, Cpu, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BorderBeam } from './ui/BorderBeam';
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
    { id: 'contact', label: 'Contact', href: '#contact', icon: <BookOpen size={16} /> },
  ];

  const features = [
    {
      Icon: <Cpu className="h-8 w-8" />,
      name: "Smart Matching Engine",
      description: "Our advanced algorithm analyzes your coding style, language preferences, and commit history to find repositories that perfectly match your expertise.",
      bgClass: "from-blue-500/10 to-transparent",
      iconColor: "text-blue-500 dark:text-blue-400"
    },
    {
      Icon: <Terminal className="h-8 w-8" />,
      name: "Good First Issues",
      description: "Specifically curated issues for beginners to help you make your first impact in open source.",
      bgClass: "from-emerald-500/10 to-transparent",
      iconColor: "text-emerald-500 dark:text-emerald-400"
    },
    {
      Icon: <Users className="h-8 w-8" />,
      name: "Community Insights",
      description: "Get deep insights into repository activity, maintainer responsiveness, and community health before you contribute.",
      bgClass: "from-purple-500/10 to-transparent",
      iconColor: "text-purple-500 dark:text-purple-400"
    },
    {
      Icon: <Github className="h-8 w-8" />,
      name: "Seamless Integration",
      description: "Connect directly with GitHub to pull your portfolio and push your contributions without leaving the platform.",
      bgClass: "from-orange-500/10 to-transparent",
      iconColor: "text-orange-500 dark:text-orange-400"
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

      {/* PREMIER FEATURES SECTION */}
      <section id="features" className="min-h-screen flex items-center justify-center px-4 relative bg-transparent py-24 overflow-hidden">
        {/* Decorative background blurs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full opacity-30 dark:opacity-20 pointer-events-none">
          <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse-soft"></div>
          <div className="absolute top-[40%] right-[5%] w-72 h-72 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse-soft animation-delay-200"></div>
          <div className="absolute bottom-[10%] left-[30%] w-72 h-72 bg-emerald-500/30 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse-soft animation-delay-400"></div>
        </div>

        <div className="max-w-7xl w-full mx-auto relative z-10 block">
          <div className="text-center mb-24 space-y-6 animate-fade-in-up">
            <h2 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 tracking-tight" style={{fontFamily: '"Outfit", sans-serif'}}>
              Supercharge Your Output
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto font-light">
              Experience a breakthrough in how you discover and contribute to open source projects.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 animate-fade-in-up animation-delay-200">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="group relative rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-black/70 backdrop-blur-xl overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.05)]"
              >
                {/* Subtle gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgClass} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-black border border-gray-200 dark:border-white/10 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                    <div className={feature.iconColor}>
                      {feature.Icon}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4" style={{fontFamily: '"Outfit", sans-serif'}}>
                    {feature.name}
                  </h3>
                  
                  <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-md flex-grow">
                    {feature.description}
                  </p>
                  
                  <div className={`mt-8 pt-6 border-t border-gray-200 dark:border-white/10 flex items-center ${feature.iconColor} font-semibold transition-all duration-300`}>
                    <span className="opacity-80 group-hover:opacity-100">Explore Feature</span>
                    <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform duration-300 opacity-80 group-hover:opacity-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="min-h-screen flex items-center justify-center px-4 relative bg-transparent py-24 overflow-hidden">
        {/* Decorative background blurs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-full opacity-30 dark:opacity-20 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-[80px] animate-pulse-soft"></div>
          <div className="absolute bottom-[20%] right-[10%] w-64 h-64 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-[80px] animate-pulse-soft animation-delay-400"></div>
        </div>

        <div className="max-w-5xl w-full mx-auto relative z-10">
          <div className="text-center mb-16 space-y-4 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 tracking-tight" style={{fontFamily: '"Outfit", sans-serif', letterSpacing: '-0.02em'}}>
              Get In Touch
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light">
              Have questions or want to collaborate? Send me a message.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 animate-fade-in-up animation-delay-200">
            
            {/* Contact Info Cards */}
            <div className="w-full md:w-1/3 flex flex-col gap-6">
              <div className="bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.2)]">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 text-blue-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2" style={{fontFamily: '"Outfit", sans-serif'}}>Email</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">arinchoubey9@gmail.com</p>
              </div>

              <div className="bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.2)]">
                <a href="https://github.com/Anonymous-0143" target="_blank" rel="noopener noreferrer" className="block w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 text-purple-500 hover:bg-purple-500/20 transition-colors">
                  <Github className="w-6 h-6" />
                </a>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2" style={{fontFamily: '"Outfit", sans-serif'}}>GitHub</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">github.com/Anonymous-0143</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="w-full md:w-2/3">
              <div className="bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 md:p-10 shadow-xl overflow-hidden relative">
                <BorderBeam size={200} duration={15} colorFrom="#3b82f6" colorTo="#a855f7" delay={0} />
                <form 
                  className="space-y-6 relative z-10" 
                  action="https://formspree.io/f/meerzyrq"
                  method="POST"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                      <input 
                        type="text" 
                        name="name"
                        required
                        className="w-full bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-gray-900 dark:text-white"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                      <input 
                        type="email" 
                        name="email"
                        required
                        className="w-full bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-gray-900 dark:text-white"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                    <input 
                      type="text" 
                      name="subject"
                      required
                      className="w-full bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-gray-900 dark:text-white"
                      placeholder="How can I help you?"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                    <textarea 
                      name="message"
                      required
                      rows={4}
                      className="w-full bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-gray-900 dark:text-white resize-none"
                      placeholder="Your message here..."
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                  >
                    Send Message
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              </div>
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
            <a href="https://github.com/Anonymous-0143" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" style={{color: '#9ca3af'}}>
              <Github size={20} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
