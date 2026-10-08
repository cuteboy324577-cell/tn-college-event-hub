import React, { useState } from 'react';
import { 
  Building2, 
  Calendar, 
  Users, 
  PlusCircle, 
  Edit, 
  Trash2, 
  Download, 
  Search, 
  Ticket, 
  CheckCircle, 
  DollarSign, 
  BarChart3,
  QrCode
} from 'lucide-react';
import { User, CollegeEvent, Registration } from '../types';
import { apiService } from '../services/apiService';

interface CollegeDashboardPageProps {
  currentUser: User;
  onNavigate: (view: string, params?: any) => void;
  onSelectEvent: (id: string) => void;
}

export const CollegeDashboardPage: React.FC<CollegeDashboardPageProps> = ({
  currentUser,
  onNavigate,
  onSelectEvent,
}) => {
  const [activeTab, setActiveTab] = useState<'events' | 'registrations'>('events');
  const [searchReg, setSearchReg] = useState('');

  // Default to first college if not set
  const collegeId = currentUser.collegeId || 'clg-1';
  const college = apiService.getCollegeById(collegeId) || apiService.getColleges()[0];

  const collegeEvents = apiService.getEvents({ collegeId: college.id });
  const allRegistrations = apiService.getRegistrations();
  
  // Registrations for this college's events
  const collegeRegistrations = allRegistrations.filter(r => 
    collegeEvents.some(e => e.id === r.eventId) || r.collegeName.includes(college.shortName)
  );

  const totalSeats = collegeEvents.reduce((acc, e) => acc + e.maxParticipants, 0);
  const totalBooked = collegeEvents.reduce((acc, e) => acc + e.registrationCount, 0);
  const totalRevenue = collegeEvents.reduce((acc, e) => acc + (e.fee * e.registrationCount), 0);

  const filteredRegistrations = collegeRegistrations.filter(r => 
    r.participantName.toLowerCase().includes(searchReg.toLowerCase()) ||
    r.participantEmail.toLowerCase().includes(searchReg.toLowerCase()) ||
    r.ticketNumber.toLowerCase().includes(searchReg.toLowerCase()) ||
    r.eventTitle.toLowerCase().includes(searchReg.toLowerCase())
  );

  const handleExportCsv = () => {
    const headers = ['Ticket Number', 'Event Title', 'Participant Name', 'Email', 'Phone', 'College', 'Roll No', 'Department', 'Team Name', 'Registered At', 'Status'];
    const rows = filteredRegistrations.map(r => [
      r.ticketNumber,
      `"${r.eventTitle.replace(/"/g, '""')}"`,
      `"${r.participantName}"`,
      r.participantEmail,
      r.participantPhone,
      `"${r.participantCollege}"`,
      r.rollNumber,
      `"${r.department}"`,
      `"${r.teamName || 'N/A'}"`,
      r.registeredAt,
      r.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${college.shortName}_attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteEvent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this event?')) {
      apiService.deleteEvent(id);
      window.location.reload();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* College Coordinator Top Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={college.logoUrl}
            alt={college.name}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                {college.code}
              </span>
              <span className="text-xs text-slate-500 font-medium">Organizer Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              {college.name}
            </h1>
            <p className="text-xs text-slate-500">
              Coordinator: <span className="font-semibold text-slate-700">{currentUser.name}</span> ({currentUser.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('add-event', { collegeId: college.id })}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Host New Event</span>
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Active Events</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{collegeEvents.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Listed on global directory</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Registrations</span>
            <Users className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalBooked}</div>
          <div className="text-[11px] text-slate-500 mt-1">Out of {totalSeats} total capacity</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Seat Utilization</span>
            <BarChart3 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            {totalSeats > 0 ? Math.round((totalBooked / totalSeats) * 100) : 0}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Campus participation rate</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Revenue Generated</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">₹{totalRevenue.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 mt-1">From paid event registrations</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'events'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Hosted Events ({collegeEvents.length})
        </button>
        <button
          onClick={() => setActiveTab('registrations')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'registrations'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Attendee Registrations & Passes ({collegeRegistrations.length})
        </button>
      </div>

      {/* Tab 1: Hosted Events Table */}
      {activeTab === 'events' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Event Details</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Date & Venue</th>
                  <th className="px-6 py-3.5">Fee & Prize</th>
                  <th className="px-6 py-3.5">Registrations</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {collegeEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 line-clamp-1">{evt.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">ID: {evt.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700">
                        {evt.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>{evt.date}</div>
                      <div className="text-slate-400 truncate max-w-[150px]">{evt.venue}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold">{evt.fee === 0 ? 'Free' : `₹${evt.fee}`}</div>
                      <div className="text-amber-600 font-medium">{evt.prizePool}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{evt.registrationCount} / {evt.maxParticipants}</div>
                      <div className="w-20 bg-slate-100 h-1 rounded-full mt-1">
                        <div
                          className="bg-indigo-600 h-1 rounded-full"
                          style={{ width: `${Math.min(100, (evt.registrationCount / evt.maxParticipants) * 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => onSelectEvent(evt.id)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                        title="View"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onNavigate('edit-event', { eventId: evt.id })}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5 inline" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteEvent(evt.id, e)}
                        className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Registrations Table */}
      {activeTab === 'registrations' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchReg}
                onChange={(e) => setSearchReg(e.target.value)}
                placeholder="Search attendee by name, ticket code, or email..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV Attendee List</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Ticket Pass</th>
                    <th className="px-6 py-3.5">Student Attendee</th>
                    <th className="px-6 py-3.5">Institution & Dept</th>
                    <th className="px-6 py-3.5">Registered Event</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                        {reg.ticketNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{reg.participantName}</div>
                        <div className="text-[11px] text-slate-400">{reg.participantEmail} • {reg.participantPhone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{reg.participantCollege}</div>
                        <div className="text-slate-400">{reg.department} ({reg.rollNumber})</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 line-clamp-1">{reg.eventTitle}</div>
                        {reg.teamName && (
                          <div className="text-indigo-600 font-medium text-[11px]">Team: {reg.teamName}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold uppercase text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {reg.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
