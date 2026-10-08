import React from 'react';
import { 
  Calendar as CalendarIcon, 
  Sparkles, 
  Ticket, 
  PlusCircle, 
  ArrowLeft,
  Building2,
  CheckCircle2,
  BookmarkCheck
} from 'lucide-react';
import { MonthlyCalendarView } from '../components/MonthlyCalendarView';
import { User } from '../types';
import { apiService } from '../services/apiService';

interface CalendarPageProps {
  currentUser?: User;
  onSelectEvent: (eventId: string) => void;
  onRegisterEvent: (eventId: string) => void;
  onOpenWalletPasses: () => void;
  onNavigate: (view: string, params?: any) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  currentUser,
  onSelectEvent,
  onRegisterEvent,
  onOpenWalletPasses,
  onNavigate,
}) => {
  const registrations = apiService.getRegistrations();
  const allEvents = apiService.getEvents();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Campus Schedule</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Monthly Event Calendar
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Visualize all registered inter-college competitions, symposiums, hackathons, and deadlines with real-time pass status and schedule timelines.
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('events')}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Explore All Events
          </button>
          <button
            onClick={onOpenWalletPasses}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Ticket className="w-4 h-4" />
            My Registered Passes ({registrations.length})
          </button>
          <button
            onClick={() => onNavigate('add-event')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Host Event
          </button>
        </div>
      </div>

      {/* Summary Highlight Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{allEvents.length}</div>
            <div className="text-xs font-medium text-slate-500">Scheduled Events across Colleges</div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">{registrations.length}</div>
            <div className="text-xs font-medium text-slate-500">Your Registered Passes (Active)</div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">6+</div>
            <div className="text-xs font-medium text-slate-500">Participating Partner Universities</div>
          </div>
        </div>
      </div>

      {/* Main Monthly Calendar View Component */}
      <MonthlyCalendarView
        onSelectEvent={onSelectEvent}
        onRegisterEvent={onRegisterEvent}
        onOpenWalletPass={onOpenWalletPasses}
        currentUser={currentUser}
      />

    </div>
  );
};
