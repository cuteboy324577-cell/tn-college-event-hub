import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Calendar, 
  Users, 
  Trophy, 
  Trash2, 
  CheckCircle, 
  RotateCcw, 
  Terminal, 
  Code2, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { College, CollegeEvent } from '../types';

interface AdminDashboardPageProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenApiTester: () => void;
  onOpenJavaModal: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onNavigate,
  onOpenApiTester,
  onOpenJavaModal,
}) => {
  const [activeTab, setActiveTab] = useState<'colleges' | 'events'>('colleges');
  const [refreshKey, setRefreshKey] = useState(0);

  const stats = apiService.getPlatformStats();
  const colleges = apiService.getColleges();
  const events = apiService.getEvents();

  const handleResetData = () => {
    if (window.confirm('Reset all demo events, colleges, and registrations to initial seed data?')) {
      apiService.resetAllData();
      setRefreshKey(prev => prev + 1);
      alert('Data reset to default successfully!');
    }
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm('Super Admin: Delete this event platform-wide?')) {
      apiService.deleteEvent(id);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleToggleVerified = (collegeId: string, current: boolean) => {
    apiService.updateCollege(collegeId, { verified: !current });
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div key={refreshKey} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-600 text-white">
                SUPER ADMIN
              </span>
              <span className="text-xs text-slate-400">System Management Console</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1">Platform Control Hub</h1>
            <p className="text-xs text-slate-400">Supervise institutional verification, event moderation, and database records.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenApiTester}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>API Tester</span>
          </button>
          <button
            onClick={onOpenJavaModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 transition"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Java Code</span>
          </button>
          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-semibold border border-rose-800 transition"
            title="Reset to default seed data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Database</span>
          </button>
        </div>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Live Events</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalEvents}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">{stats.upcomingEvents} Upcoming</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Registered Colleges</span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">{stats.participatingColleges}</div>
          <div className="text-[11px] text-slate-500 mt-1">Institutes across nation</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Student Passes Issued</span>
          <div className="text-2xl font-extrabold text-cyan-600 mt-1">{stats.totalRegistrations}</div>
          <div className="text-[11px] text-slate-500 mt-1">Confirmed ticket holders</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Aggregated Prizes</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{stats.estimatedPrizePool}</div>
          <div className="text-[11px] text-slate-500 mt-1">Across all contests</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('colleges')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'colleges'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Manage Institutions ({colleges.length})
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'events'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Manage All Events ({events.length})
        </button>
      </div>

      {/* Colleges Table */}
      {activeTab === 'colleges' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Institution</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">Code</th>
                  <th className="px-6 py-3.5">Events Hosted</th>
                  <th className="px-6 py-3.5">Verification</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {colleges.map((col) => (
                  <tr key={col.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{col.name}</div>
                      <div className="text-[11px] text-slate-400">{col.contactEmail}</div>
                    </td>
                    <td className="px-6 py-4">{col.location}, {col.state}</td>
                    <td className="px-6 py-4 font-mono font-semibold">{col.code}</td>
                    <td className="px-6 py-4 font-bold text-indigo-600">{col.eventCount}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleVerified(col.id, col.verified)}
                        className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border transition ${
                          col.verified
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {col.verified ? 'Verified' : 'Pending Verification'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onNavigate('college-details', { collegeId: col.id })}
                        className="text-indigo-600 hover:underline font-semibold"
                      >
                        View Page
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Events Table */}
      {activeTab === 'events' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Event Title</th>
                  <th className="px-6 py-3.5">Host College</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Attendees</th>
                  <th className="px-6 py-3.5 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{evt.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono">ID: {evt.id}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{evt.collegeName}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {evt.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">{evt.date}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {evt.registrationCount} / {evt.maxParticipants}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => onNavigate('edit-event', { eventId: evt.id })}
                        className="text-slate-600 hover:text-slate-900 px-2 py-1 rounded border border-slate-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="text-rose-600 hover:text-rose-800 px-2 py-1 rounded border border-rose-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
