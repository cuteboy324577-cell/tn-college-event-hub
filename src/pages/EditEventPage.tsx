import React, { useState } from 'react';
import { ArrowLeft, Save, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { CollegeEvent, EventCategory, EventStatus, TeamSizeType } from '../types';
import { apiService } from '../services/apiService';

interface EditEventPageProps {
  eventId: string;
  onBack: () => void;
  onNavigate: (view: string, params?: any) => void;
}

export const EditEventPage: React.FC<EditEventPageProps> = ({
  eventId,
  onBack,
  onNavigate,
}) => {
  const event = apiService.getEventById(eventId);

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Event Not Found</h2>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Return
        </button>
      </div>
    );
  }

  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [category, setCategory] = useState<EventCategory>(event.category);
  const [date, setDate] = useState(event.date);
  const [time, setTime] = useState(event.time);
  const [venue, setVenue] = useState(event.venue);
  const [fee, setFee] = useState(event.fee);
  const [maxParticipants, setMaxParticipants] = useState(event.maxParticipants);
  const [prizePool, setPrizePool] = useState(event.prizePool);
  const [status, setStatus] = useState<EventStatus>(event.status);
  const [coordinatorName, setCoordinatorName] = useState(event.coordinatorName);
  const [coordinatorEmail, setCoordinatorEmail] = useState(event.coordinatorEmail);

  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      apiService.updateEvent(eventId, {
        title,
        description,
        category,
        date,
        time,
        venue,
        fee: Number(fee),
        maxParticipants: Number(maxParticipants),
        prizePool,
        status,
        coordinatorName,
        coordinatorEmail,
      });

      onNavigate('event-details', { eventId });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      apiService.deleteEvent(eventId);
      onNavigate('events');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Event</span>
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Edit Event</h1>
          <p className="text-xs text-slate-500 mt-0.5">ID: {event.id} • {event.collegeName}</p>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold transition"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Event</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-xs">
        
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Event Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Hackathon">Hackathon</option>
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Gaming">Gaming</option>
                <option value="Workshop">Workshop</option>
                <option value="Sports">Sports</option>
                <option value="Symposium">Symposium</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Venue</label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Fee (₹)</label>
              <input
                type="number"
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Max Participants</label>
              <input
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Prize Pool</label>
              <input
                type="text"
                value={prizePool}
                onChange={(e) => setPrizePool(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
