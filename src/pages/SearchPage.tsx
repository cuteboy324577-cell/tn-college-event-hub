import React, { useState } from 'react';
import { 
  Search, 
  X, 
  Calendar, 
  Building2, 
  Sparkles, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { EventCard } from '../components/EventCard';

interface SearchPageProps {
  initialQuery?: string;
  onSelectEvent: (id: string) => void;
  onRegisterEvent: (id: string) => void;
  onSelectCollege: (id: string) => void;
  onNavigate: (view: string, params?: any) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  initialQuery = '',
  onSelectEvent,
  onRegisterEvent,
  onSelectCollege,
  onNavigate,
}) => {
  const [query, setQuery] = useState(initialQuery);

  const allEvents = apiService.getEvents();
  const allColleges = apiService.getColleges();

  const trimmed = query.trim().toLowerCase();

  const matchedEvents = trimmed 
    ? allEvents.filter(e => 
        e.title.toLowerCase().includes(trimmed) ||
        e.description.toLowerCase().includes(trimmed) ||
        e.collegeName.toLowerCase().includes(trimmed) ||
        e.category.toLowerCase().includes(trimmed) ||
        e.tags.some(t => t.toLowerCase().includes(trimmed))
      )
    : allEvents;

  const matchedColleges = trimmed
    ? allColleges.filter(c =>
        c.name.toLowerCase().includes(trimmed) ||
        c.shortName.toLowerCase().includes(trimmed) ||
        c.location.toLowerCase().includes(trimmed) ||
        c.code.toLowerCase().includes(trimmed)
      )
    : [];

  const popularTags = ['Hackathon', 'Robotics', 'AI/ML', 'Cultural', 'Cybersecurity', 'Esports', 'EV', 'Competitive Programming'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Search Header */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Search Events & Colleges
        </h1>
        <p className="text-xs text-slate-500">
          Find inter-college competitions, hackathons, seminars, or host institutes instantly.
        </p>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type keywords (e.g. AI, RoboWars, Saarang, IIT Madras, CTF)..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 shadow-md"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Popular Tags */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Trending:</span>
          {popularTags.map(tag => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Matched Colleges (if query given) */}
      {matchedColleges.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Matching Institutes ({matchedColleges.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchedColleges.map(c => (
              <div
                key={c.id}
                onClick={() => onSelectCollege(c.id)}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-md transition cursor-pointer flex items-center gap-3.5"
              >
                <img src={c.logoUrl} alt={c.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" />
                <div className="overflow-hidden">
                  <h4 className="font-bold text-slate-900 text-xs truncate">{c.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{c.location}, {c.state}</p>
                  <span className="text-[10px] font-semibold text-indigo-600">{c.eventCount} Events</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matched Events */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>Events Found ({matchedEvents.length})</span>
          </div>
        </div>

        {matchedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchedEvents.map(evt => (
              <EventCard
                key={evt.id}
                event={evt}
                onSelect={onSelectEvent}
                onRegister={onRegisterEvent}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
            No events matched your search query. Try another keyword.
          </div>
        )}
      </div>

    </div>
  );
};
