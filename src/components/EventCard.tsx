import React from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Trophy, 
  Clock, 
  Ticket,
  ArrowRight
} from 'lucide-react';
import { CollegeEvent } from '../types';

interface EventCardProps {
  event: CollegeEvent;
  onSelect: (eventId: string) => void;
  onRegister: (eventId: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onSelect,
  onRegister,
}) => {
  const spotsLeft = Math.max(0, event.maxParticipants - event.registrationCount);
  const percentageFilled = Math.min(100, Math.round((event.registrationCount / event.maxParticipants) * 100));

  return (
    <article 
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500"
    >
      {/* Banner Image Container */}
      <div className="relative aspect-16/9 w-full overflow-hidden bg-slate-100">
        <img
          src={event.bannerUrl}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>

        {/* Pricing tag */}
        <div className="absolute top-3 right-3">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md shadow-xs ${
            event.fee === 0 
              ? 'bg-emerald-500/90 text-white border border-emerald-400/30' 
              : 'bg-slate-900/80 text-white border border-white/20'
          }`}>
            {event.fee === 0 ? 'FREE ENTRY' : `₹${event.fee}`}
          </span>
        </div>

        {/* Bottom banner info: Host College & Team format */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
          <span className="font-semibold text-slate-100 truncate max-w-[200px] drop-shadow-xs">
            {event.collegeName}
          </span>
          <span className="text-[11px] font-medium text-slate-200 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md">
            {event.teamSize}
          </span>
        </div>
      </div>

      {/* Card Content with balanced whitespace */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Unboxed Metadata Kicker */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
            <span>{event.category}</span>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <span className="text-slate-500 font-medium">Deadline {event.registrationDeadline}</span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelect(event.id)}
            className="font-bold text-slate-900 text-base leading-snug hover:text-indigo-600 cursor-pointer transition line-clamp-2"
          >
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Event Key Metrics in quiet layout */}
          <div className="pt-2 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="font-medium text-slate-800">{event.date}</span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span className="text-slate-500">{event.time}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate text-slate-600" title={event.venue}>
                {event.venue}
              </span>
            </div>

            {event.prizePool && (
              <div className="flex items-center gap-2 text-amber-800 font-semibold bg-amber-50/80 px-2.5 py-1.5 rounded-lg border border-amber-200/60 mt-1">
                <Trophy className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate text-[11px]">{event.prizePool}</span>
              </div>
            )}
          </div>
        </div>

        {/* Capacity & Action Row */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          {/* Capacity Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-medium text-slate-500">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-400" />
                <span>{event.registrationCount} Registered</span>
              </span>
              <span className={spotsLeft < 15 ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Housefull'}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  percentageFilled > 85 ? 'bg-rose-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${percentageFilled}%` }}
              ></div>
            </div>
          </div>

          {/* Buttons with clear touch targets */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onSelect(event.id)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition flex items-center justify-center focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Details
            </button>
            <button
              onClick={() => onRegister(event.id)}
              className="w-full h-10 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs transition shadow-xs flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
