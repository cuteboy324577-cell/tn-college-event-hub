import React from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Globe, 
  Mail, 
  Phone, 
  Star, 
  Building2, 
  PlusCircle, 
  CheckCircle2, 
  Share2 
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { EventCard } from '../components/EventCard';

interface CollegeDetailsPageProps {
  collegeId: string;
  onBack: () => void;
  onSelectEvent: (id: string) => void;
  onRegisterEvent: (id: string) => void;
  onNavigate: (view: string, params?: any) => void;
}

export const CollegeDetailsPage: React.FC<CollegeDetailsPageProps> = ({
  collegeId,
  onBack,
  onSelectEvent,
  onRegisterEvent,
  onNavigate,
}) => {
  const college = apiService.getCollegeById(collegeId);
  const collegeEvents = apiService.getEvents({ collegeId });

  if (!college) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">College Not Found</h2>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Back to Colleges
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Colleges Directory</span>
      </button>

      {/* College Banner Header */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        
        {/* Cover */}
        <div className="relative h-60 sm:h-72 w-full bg-slate-900">
          <img
            src={college.coverUrl}
            alt={college.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
        </div>

        {/* Profile Info Bar */}
        <div className="px-6 sm:px-10 pb-8 relative -mt-16 sm:-mt-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            <img
              src={college.logoUrl}
              alt={college.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-xl bg-white shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                  {college.code}
                </span>
                {college.verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Institution</span>
                  </span>
                )}
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>{college.rating} Rating</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {college.name}
              </h1>

              <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{college.location}, {college.state}</span>
                </div>
                <span>•</span>
                <span>Est. {college.establishedYear}</span>
                <span>•</span>
                <span className="font-semibold text-indigo-600">{collegeEvents.length} Active Events</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('add-event', { collegeId: college.id })}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Host Event for this College</span>
            </button>
          </div>

        </div>

        {/* Description & Contact Details */}
        <div className="px-6 sm:px-10 py-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
          <div className="md:col-span-2">
            <h3 className="font-bold text-slate-900 text-sm mb-2">About the Campus</h3>
            <p className="leading-relaxed">{college.description}</p>
          </div>

          <div className="space-y-2 border-t md:border-t-0 md:border-l md:pl-6 border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm mb-2">Contact & Web</h3>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <a href={`mailto:${college.contactEmail}`} className="text-indigo-600 hover:underline truncate">
                {college.contactEmail}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>{college.contactPhone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <a href={college.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate">
                {college.website}
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* College Events Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Competitions & Fests Hosted by {college.shortName} ({collegeEvents.length})
          </h2>
        </div>

        {collegeEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collegeEvents.map((evt) => (
              <EventCard
                key={evt.id}
                event={evt}
                onSelect={onSelectEvent}
                onRegister={onRegisterEvent}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
            No events currently scheduled for this college.
          </div>
        )}
      </div>

    </div>
  );
};
