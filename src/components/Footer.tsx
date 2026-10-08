import React from 'react';
import { 
  GraduationCap, 
  Terminal, 
  Code2, 
  ShieldCheck, 
  Heart, 
  MapPin, 
  Mail, 
  Phone,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenApiTester: () => void;
  onOpenJavaModal: () => void;
  onOpenAiChat?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenApiTester,
  onOpenJavaModal,
  onOpenAiChat,
}) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand & Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-xl text-white tracking-tight">CollegeEvent</span>
                <span className="ml-1 text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">Hub</span>
              </div>
            </div>
            
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              The centralized digital ecosystem connecting colleges, student organizers, and attendees. Discover symposiums, hackathons, cultural festivals, and championships across top institutions.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={() => {
                  if (onOpenAiChat) onOpenAiChat();
                  else onNavigate('ai-chat');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600/30 to-purple-600/30 hover:from-cyan-600/50 hover:to-purple-600/50 text-cyan-300 hover:text-white text-xs font-medium border border-cyan-400/30 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Campus AI Assistant</span>
              </button>

              <button
                onClick={onOpenApiTester}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 text-xs font-medium border border-slate-700 transition"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>REST API Console</span>
              </button>

              <button
                onClick={onOpenJavaModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 text-xs font-medium border border-slate-700 transition"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Java Spring Boot Code</span>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => {
                    if (onOpenAiChat) onOpenAiChat();
                    else onNavigate('ai-chat');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Campus AI Concierge</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('events')} className="text-slate-400 hover:text-white transition">
                  Browse All Events
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('calendar')} className="text-slate-400 hover:text-white transition">
                  Monthly Event Calendar
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('colleges')} className="text-slate-400 hover:text-white transition">
                  Partner Colleges
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('search')} className="text-slate-400 hover:text-white transition">
                  Search & Filters
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('add-event')} className="text-slate-400 hover:text-white transition">
                  Host an Event
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('college-registration')} className="text-slate-400 hover:text-white transition">
                  Register Your College
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Categories</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('events', { category: 'Hackathon' })} className="text-slate-400 hover:text-white transition">
                  Hackathons & Ideathons
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('events', { category: 'Technical' })} className="text-slate-400 hover:text-white transition">
                  RoboWars & Coding
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('events', { category: 'Cultural' })} className="text-slate-400 hover:text-white transition">
                  Cultural & Music Fests
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('events', { category: 'Workshop' })} className="text-slate-400 hover:text-white transition">
                  Hands-on Workshops
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('events', { category: 'Gaming' })} className="text-slate-400 hover:text-white transition">
                  Esports & LAN Arenas
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Support & Contact</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>support@collegeeventhub.org</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>+91 44 2257 8000</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>National Higher Education Corridor</span>
              </li>
              <li className="pt-2">
                <button 
                  onClick={() => onNavigate('about')} 
                  className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  <span>About Platform</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verified University Portals & Secure Student Registrations</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Built for higher education innovation & academic excellence</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
