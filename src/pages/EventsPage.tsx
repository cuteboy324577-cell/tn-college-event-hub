import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  RotateCcw, 
  Calendar, 
  PlusCircle, 
  Sparkles, 
  ArrowUpDown,
  LayoutGrid,
  CalendarDays
} from 'lucide-react';
import { CollegeEvent, EventCategory, EventFilter } from '../types';
import { EventCard } from '../components/EventCard';
import { MonthlyCalendarView } from '../components/MonthlyCalendarView';
import { apiService } from '../services/apiService';

interface EventsPageProps {
  initialCategory?: string;
  initialSearch?: string;
  initialViewMode?: 'grid' | 'calendar';
  onSelectEvent: (id: string) => void;
  onRegisterEvent: (id: string) => void;
  onNavigate: (view: string, params?: any) => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({
  initialCategory,
  initialSearch,
  initialViewMode = 'grid',
  onSelectEvent,
  onRegisterEvent,
  onNavigate,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>(initialViewMode);
  const [search, setSearch] = useState(initialSearch || '');
  const [category, setCategory] = useState<string>(initialCategory || 'All');
  const [collegeId, setCollegeId] = useState<string>('');
  const [feeType, setFeeType] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc' | 'popular' | 'prizes'>('date-asc');

  const colleges = apiService.getColleges();

  const filter: EventFilter = {
    search: search.trim() || undefined,
    category: category === 'All' ? undefined : (category as EventCategory),
    collegeId: collegeId || undefined,
    feeType,
    sortBy,
  };

  const events = apiService.getEvents(filter);

  const categories: (EventCategory | 'All')[] = [
    'All',
    'Hackathon',
    'Technical',
    'Cultural',
    'Gaming',
    'Workshop',
    'Sports',
    'Symposium',
  ];

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setCollegeId('');
    setFeeType('all');
    setSortBy('date-asc');
  };

  const hasActiveFilters = search !== '' || category !== 'All' || collegeId !== '' || feeType !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Inter-College Events
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Discover {events.length} competitions, symposiums, hackathons and cultural festivals
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View switcher: Grid vs Monthly Calendar */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards Grid</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Monthly Calendar</span>
            </button>
          </div>

          {hasActiveFilters && viewMode === 'grid' && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('add-event')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Host New Event</span>
          </button>
        </div>
      </div>

      {/* Conditional rendering based on View Mode */}
      {viewMode === 'calendar' ? (
        <MonthlyCalendarView
          onSelectEvent={onSelectEvent}
          onRegisterEvent={onRegisterEvent}
          onOpenWalletPass={() => onNavigate('calendar')}
        />
      ) : (
        <>
          {/* Filter Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
            
            {/* Search & Selectors Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              {/* Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search title, tags, or topic..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
                />
              </div>

              {/* College Filter */}
              <div>
                <select
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value)}
                  aria-label="Filter by College"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
                >
                  <option value="">All Colleges & Institutes</option>
                  {colleges.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name} ({col.shortName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fee Filter */}
              <div>
                <select
                  value={feeType}
                  onChange={(e) => setFeeType(e.target.value as any)}
                  aria-label="Filter by Entry Fee"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
                >
                  <option value="all">All Entry Fees (Free & Paid)</option>
                  <option value="free">Free Entry Only</option>
                  <option value="paid">Paid Registrations</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label="Sort Events"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
                >
                  <option value="date-asc">Date: Earliest First</option>
                  <option value="date-desc">Date: Latest First</option>
                  <option value="popular">Most Popular / Registered</option>
                  <option value="prizes">Highest Prize Pool</option>
                </select>
              </div>

            </div>

            {/* Category Pills Row */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                <span>Category:</span>
              </span>
              {categories.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

          </div>

          {/* Events Grid */}
          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onSelect={onSelectEvent}
                  onRegister={onRegisterEvent}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">No Matching Events Found</h3>
              <p className="text-xs text-slate-500">
                We couldn't find any events matching your selected criteria. Try adjusting your keyword or reset your filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
};

