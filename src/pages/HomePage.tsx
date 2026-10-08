import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  Trophy, 
  Building2, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  QrCode, 
  Terminal, 
  Code2, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { CollegeEvent, College, EventCategory } from '../types';
import { EventCard } from '../components/EventCard';
import { apiService } from '../services/apiService';

interface HomePageProps {
  onNavigate: (view: string, params?: any) => void;
  onSelectEvent: (id: string) => void;
  onRegisterEvent: (id: string) => void;
  onOpenApiTester: () => void;
  onOpenJavaModal: () => void;
  onOpenAiChat?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectEvent,
  onRegisterEvent,
  onOpenApiTester,
  onOpenJavaModal,
  onOpenAiChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const stats = apiService.getPlatformStats();
  const allEvents = apiService.getEvents();
  const colleges = apiService.getColleges();

  const featuredEvents = allEvents.filter(e => e.featured);
  const filteredEvents = selectedCategory === 'All' 
    ? allEvents.slice(0, 6) 
    : allEvents.filter(e => e.category === selectedCategory).slice(0, 6);

  const categories: { label: string; category: EventCategory | 'All' }[] = [
    { label: 'All Categories', category: 'All' },
    { label: 'Hackathons', category: 'Hackathon' },
    { label: 'RoboWars & Tech', category: 'Technical' },
    { label: 'Cultural & Bands', category: 'Cultural' },
    { label: 'Esports & Gaming', category: 'Gaming' },
    { label: 'Workshops', category: 'Workshop' },
    { label: 'Sports', category: 'Sports' },
    { label: 'Symposiums', category: 'Symposium' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('search', { query: searchQuery.trim() });
    } else {
      onNavigate('events');
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      
      {/* Hero Section with Vibrant Subtle Gradient & Clean Hierarchy */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        
        {/* Subtle Ambient Radial Highlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-tr from-indigo-500/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          
          {/* Subtle quiet kicker */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>2026 Inter-College Season is Live</span>
            <span className="text-slate-500" aria-hidden="true">·</span>
            <span className="text-slate-300">Over {stats.estimatedPrizePool} in prizes</span>
          </div>

          {/* Display Heading with deliberate tracking */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            Where Campus Talents <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-200 to-pink-300 bg-clip-text text-transparent">
              Compete, Build & Win
            </span>
          </h1>

          {/* Subtitle with balanced line length */}
          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
            The centralized collegiate gateway for discovering hackathons, cultural festivals, RoboWars, and research symposiums across premier universities.
          </p>

          {/* Interactive Search Bar Component */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto pt-2">
            <div className="relative flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 shadow-2xl focus-within:border-indigo-400 focus-within:bg-white/15 transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, colleges, robotics, or hackathons..."
                className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-hidden"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30 shrink-0 focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Action Buttons with balanced padding */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
            <button
              onClick={() => {
                if (onOpenAiChat) onOpenAiChat();
                else onNavigate('ai-chat');
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold transition shadow-lg shadow-indigo-500/30 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
              <span>Ask Campus AI</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-white/20">⌘J</span>
            </button>
            <button
              onClick={() => onNavigate('events')}
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 transition shadow-xs focus-visible:ring-2 focus-visible:ring-white"
            >
              Browse All Events
            </button>
            <button
              onClick={() => onNavigate('calendar')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold transition shadow-md shadow-indigo-500/25 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-white"
            >
              <Calendar className="w-4 h-4" />
              <span>Monthly Calendar</span>
            </button>
            <button
              onClick={() => onNavigate('add-event')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold border border-white/20 transition focus-visible:ring-2 focus-visible:ring-white"
            >
              Host College Event
            </button>
            <button
              onClick={onOpenApiTester}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-slate-700/80 transition"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>REST API Sandbox</span>
            </button>
            <button
              onClick={onOpenJavaModal}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-slate-700/80 transition"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Java Spring Boot Code</span>
            </button>
          </div>

          {/* Key Metrics Dashboard Row */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{stats.totalEvents}+</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Inter-College Events</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 tracking-tight">{stats.participatingColleges}</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Premier Institutes</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 tracking-tight">{stats.totalRegistrations}+</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Registered Attendees</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight">{stats.estimatedPrizePool}</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Prizes & Grants</div>
            </div>
          </div>

        </div>
      </section>

      {/* Segmented Filter Control Bar (Balanced Whitespace) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg p-2 sm:p-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.category;
              return (
                <button
                  key={cat.category}
                  onClick={() => setSelectedCategory(cat.category)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Flagship Featured Events Section */}
      {featuredEvents.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8 pb-4 border-b border-slate-200/70">
            <div>
              <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                Spotlight Events
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Featured Flagship Competitions
              </h2>
            </div>
            <button
              onClick={() => onNavigate('events')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition"
            >
              <span>View All Events</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.slice(0, 3).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onSelect={onSelectEvent}
                onRegister={onRegisterEvent}
              />
            ))}
          </div>
        </section>
      )}

      {/* Categorized Events Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-slate-200/70">
          <div>
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
              Active Opportunities
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {selectedCategory === 'All' ? 'Upcoming Fests & Seminars' : `${selectedCategory} Competitions`}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('events', { category: selectedCategory })}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition"
          >
            <span>See More</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onSelect={onSelectEvent}
              onRegister={onRegisterEvent}
            />
          ))}
        </div>
      </section>

      {/* Partner Colleges Directory */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8 pb-4 border-b border-slate-200">
            <div>
              <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                Campus Partners
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Top Host Colleges & Institutes
              </h2>
            </div>
            <button
              onClick={() => onNavigate('colleges')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition"
            >
              <span>All Colleges ({colleges.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {colleges.slice(0, 6).map((college) => (
              <div
                key={college.id}
                onClick={() => onNavigate('college-details', { collegeId: college.id })}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3.5 mb-3">
                    <img
                      src={college.logoUrl}
                      alt={college.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition leading-snug">
                        {college.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {college.location}, {college.state}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {college.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-600">
                    {college.eventCount} Active Events
                  </span>
                  <span className="text-slate-400 font-medium">Est. {college.establishedYear}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Value Props (Clean Minimalist Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Engineered for Higher Education Excellence
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            No messy forms, lost registrations, or gate bottlenecks. Standardized tooling for campuses and students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-cyan-300 transition group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Campus AI Knowledge Bot</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Ask natural questions to discover events, query deadlines, compare prize pools, and check your registered ticket passes instantly.
            </p>
            <button
              onClick={() => {
                if (onOpenAiChat) onOpenAiChat();
                else onNavigate('ai-chat');
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Chat with AI</span>
              <span className="text-[10px] bg-indigo-50 px-1 py-0.5 rounded font-mono">Gemini 3.8</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-indigo-300 transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Instant Ticket Passes & QR Clearance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upon registration, each attendee receives a unique ticket number and scannable QR pass for fast gate entry at campus entrances.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-indigo-300 transition">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Live REST API Sandbox</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore the full REST API specification in your browser with real responses, HTTP timing, and pre-formatted cURL snippets.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-indigo-300 transition">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Spring Boot Companion Backend</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Inspect and download a complete production Spring Boot 3.3.4 JPA microservice package with one click to run your backend locally.
            </p>
          </div>
        </div>
      </section>

      {/* Host Event Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl">
          <div className="max-w-2xl space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Colleges & Department Councils
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Hosting a Fest, Hackathon, or Symposium?
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Reach thousands of students across institutions nationwide. Manage registrations, issue QR tickets, and monitor analytics with ease.
            </p>
            <div className="flex flex-wrap gap-3 pt-3">
              <button
                onClick={() => onNavigate('add-event')}
                className="px-5 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition shadow-md"
              >
                Create Event Now
              </button>
              <button
                onClick={() => onNavigate('college-registration')}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/20 transition"
              >
                Register Your College
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
