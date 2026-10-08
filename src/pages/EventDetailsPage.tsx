import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Trophy, 
  Users, 
  Mail, 
  Phone, 
  Share2, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Ticket, 
  Sparkles,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { CollegeEvent } from '../types';
import { apiService } from '../services/apiService';

interface EventDetailsPageProps {
  eventId: string;
  onBack: () => void;
  onRegister: (eventId: string) => void;
  onNavigate: (view: string, params?: any) => void;
}

export const EventDetailsPage: React.FC<EventDetailsPageProps> = ({
  eventId,
  onBack,
  onRegister,
  onNavigate,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const event = apiService.getEventById(eventId);

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Event Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The requested event could not be found or has ended.</p>
        <button
          onClick={onBack}
          className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          Back to Events
        </button>
      </div>
    );
  }

  const college = apiService.getCollegeById(event.collegeId);
  const relatedEvents = apiService.getEvents({ category: event.category }).filter(e => e.id !== event.id).slice(0, 3);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const spotsLeft = Math.max(0, event.maxParticipants - event.registrationCount);
  const percentageFilled = Math.min(100, Math.round((event.registrationCount / event.maxParticipants) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events Catalog</span>
      </button>

      {/* Main Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 text-white shadow-xl">
        <div className="h-72 sm:h-96 w-full relative">
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>

          {/* Header Content */}
          <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-600 text-white shadow-xs">
                {event.category}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-slate-200 border border-white/20">
                {event.teamSize}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Status: {event.status}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300">
              <button
                onClick={() => college && onNavigate('college-details', { collegeId: college.id })}
                className="flex items-center gap-1.5 hover:text-white transition group underline decoration-indigo-400"
              >
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold">{event.collegeName}</span>
              </button>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>{event.date} {event.endDate ? `to ${event.endDate}` : ''}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{event.time}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details, Rules, Itinerary */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Overview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900">About this Event</h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
              {event.tags.map((tag, idx) => (
                <span key={idx} className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Rules & Eligibility */}
          {event.rules && event.rules.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-indigo-600" />
                <span>Rules & Guidelines</span>
              </h2>
              <ul className="space-y-2.5">
                {event.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Schedule & Timeline */}
          {event.schedule && event.schedule.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span>Event Schedule & Milestones</span>
              </h2>
              
              <div className="relative border-l-2 border-indigo-100 ml-3 space-y-6">
                {event.schedule.map((item, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-xs"></div>
                    <div className="text-xs font-bold text-indigo-600 font-mono">{item.time}</div>
                    <div className="text-sm font-semibold text-slate-900 mt-0.5">{item.activity}</div>
                    {item.speakerOrVenue && (
                      <div className="text-xs text-slate-500 mt-0.5">{item.speakerOrVenue}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Venue & Location Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-500" />
              <span>Venue & Location</span>
            </h2>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-slate-900">{event.venue}</h4>
                <p className="text-xs text-slate-600 mt-1">{event.collegeName}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Registration Card, Prize, Coordinator */}
        <div className="space-y-6">
          
          {/* Main Action Ticket Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-lg space-y-6 sticky top-20">
            
            {/* Fee & Prize Pool */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Entry Fee</span>
                <div className="text-2xl font-extrabold text-slate-900">
                  {event.fee === 0 ? (
                    <span className="text-emerald-600">FREE</span>
                  ) : (
                    `₹${event.fee}`
                  )}
                </div>
              </div>

              {event.prizePool && (
                <div className="text-right">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Prize Pool</span>
                  <div className="text-sm font-bold text-amber-600 flex items-center justify-end gap-1">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>{event.prizePool}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Spots Left Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600">{event.registrationCount} Registered</span>
                <span className={spotsLeft < 15 ? 'text-rose-600' : 'text-slate-600'}>
                  {spotsLeft > 0 ? `${spotsLeft} spots remaining` : 'Capacity Full'}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    percentageFilled > 80 ? 'bg-rose-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${percentageFilled}%` }}
                ></div>
              </div>
            </div>

            {/* Registration Deadline Alert */}
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
              <Calendar className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Deadline:</span> {event.registrationDeadline}
                <div className="text-[11px] text-amber-700 mt-0.5">Register early before registrations close.</div>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => onRegister(event.id)}
              disabled={spotsLeft === 0}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm transition shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              <Ticket className="w-4 h-4" />
              <span>{spotsLeft > 0 ? 'Register Now' : 'Registrations Closed'}</span>
            </button>

            {/* Share / Copy Button */}
            <button
              onClick={handleShare}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-500" />}
              <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Share Event Link'}</span>
            </button>

            {/* Coordinator Info */}
            <div className="pt-5 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Event Coordinator</h4>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="font-semibold text-slate-900">{event.coordinatorName}</div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  <a href={`mailto:${event.coordinatorEmail}`} className="hover:underline">{event.coordinatorEmail}</a>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{event.coordinatorContact}</span>
                </div>
              </div>
            </div>

          </div>

          {/* College Info Widget */}
          {college && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={college.logoUrl}
                  alt={college.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-tight">{college.name}</h4>
                  <p className="text-xs text-slate-500">{college.location}, {college.state}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2">
                {college.description}
              </p>
              <button
                onClick={() => onNavigate('college-details', { collegeId: college.id })}
                className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                View College Profile & Events
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Related Events Section */}
      {relatedEvents.length > 0 && (
        <div className="pt-12 border-t border-slate-200 space-y-6">
          <h3 className="text-xl font-extrabold text-slate-900">
            More {event.category} Events
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedEvents.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onNavigate('event-details', { eventId: rel.id })}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition cursor-pointer group"
              >
                <img
                  src={rel.bannerUrl}
                  alt={rel.title}
                  className="w-full h-36 object-cover rounded-xl mb-3 group-hover:scale-102 transition duration-300"
                />
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">
                  {rel.category}
                </span>
                <h4 className="font-bold text-slate-900 text-sm mt-1.5 line-clamp-1 group-hover:text-indigo-600 transition">
                  {rel.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 truncate">{rel.collegeName}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
