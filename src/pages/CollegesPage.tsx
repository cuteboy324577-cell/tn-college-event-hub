import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  MapPin, 
  Calendar, 
  Award, 
  ExternalLink, 
  PlusCircle, 
  CheckCircle, 
  Star,
  ChevronRight
} from 'lucide-react';
import { College } from '../types';
import { apiService } from '../services/apiService';

interface CollegesPageProps {
  onSelectCollege: (id: string) => void;
  onNavigate: (view: string, params?: any) => void;
}

export const CollegesPage: React.FC<CollegesPageProps> = ({
  onSelectCollege,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('All');

  const colleges = apiService.getColleges();

  const states = ['All', ...Array.from(new Set(colleges.map(c => c.state)))];

  const filteredColleges = colleges.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.shortName.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase());
    const matchesState = selectedState === 'All' || c.state === selectedState;
    return matchesSearch && matchesState;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Partner Colleges & Universities
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Explore {colleges.length} recognized institutes hosting official collegiate events and fests
          </p>
        </div>

        <button
          onClick={() => onNavigate('college-registration')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New College</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search college by name, city, or institute code (e.g. IITM, Anna Univ)..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 shadow-2xs"
          />
        </div>

        <div className="sm:w-60">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            aria-label="Filter by Region or State"
            className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 focus:outline-hidden focus:border-indigo-500 shadow-2xs"
          >
            {states.map(st => (
              <option key={st} value={st}>State: {st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Colleges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredColleges.map((college) => (
          <div
            key={college.id}
            onClick={() => onSelectCollege(college.id)}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
          >
            <div>
              {/* Cover Image */}
              <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                <img
                  src={college.coverUrl}
                  alt={college.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                {/* Institute Code Badge */}
                <span className="absolute top-3 right-3 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white border border-white/20">
                  {college.code}
                </span>

                {/* Logo overlapping banner */}
                <div className="absolute -bottom-5 left-4">
                  <img
                    src={college.logoUrl}
                    alt={college.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md bg-white"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="p-5 pt-8 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">{college.location}, {college.state}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition">
                  {college.name}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {college.description}
                </p>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="p-5 pt-0">
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  {college.eventCount} Active Events
                </span>

                <div className="flex items-center gap-1 text-slate-600 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{college.rating}</span>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
