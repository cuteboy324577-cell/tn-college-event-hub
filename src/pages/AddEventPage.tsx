import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Plus, 
  Trash2, 
  Sparkles, 
  Building2, 
  Trophy, 
  Users, 
  Tag, 
  Clock, 
  CheckCircle2, 
  Image as ImageIcon 
} from 'lucide-react';
import { EventCategory, TeamSizeType, ScheduleItem } from '../types';
import { apiService } from '../services/apiService';

interface AddEventPageProps {
  initialCollegeId?: string;
  onBack: () => void;
  onNavigate: (view: string, params?: any) => void;
}

const SAMPLE_BANNERS = [
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1558441719-8b489c63f771?w=1200&auto=format&fit=crop&q=80',
];

export const AddEventPage: React.FC<AddEventPageProps> = ({
  initialCollegeId,
  onBack,
  onNavigate,
}) => {
  const colleges = apiService.getColleges();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('Hackathon');
  const [collegeId, setCollegeId] = useState(initialCollegeId || colleges[0]?.id || 'clg-1');
  const [date, setDate] = useState('2026-11-20');
  const [time, setTime] = useState('09:30 AM');
  const [endDate, setEndDate] = useState('2026-11-21');
  const [venue, setVenue] = useState('Main Seminar Hall, Campus');
  const [registrationDeadline, setRegistrationDeadline] = useState('2026-11-15');
  const [fee, setFee] = useState(0);
  const [maxParticipants, setMaxParticipants] = useState(100);
  const [teamSize, setTeamSize] = useState<TeamSizeType>('2-4 Members');
  const [prizePool, setPrizePool] = useState('₹50,000 + Certificates');
  const [tagsInput, setTagsInput] = useState('AI, Innovation, Coding, Hackathon');
  const [bannerUrl, setBannerUrl] = useState(SAMPLE_BANNERS[0]);
  const [coordinatorName, setCoordinatorName] = useState('Aditya Kumar');
  const [coordinatorContact, setCoordinatorContact] = useState('+91 98401 23456');
  const [coordinatorEmail, setCoordinatorEmail] = useState('coordinator@college.edu');

  // Rules list
  const [rules, setRules] = useState<string[]>([
    'All participants must bring valid college identification cards.',
    'Original work and adherence to event conduct rules is strictly enforced.'
  ]);
  const [newRule, setNewRule] = useState('');

  // Schedule list
  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    { time: '09:30 AM', activity: 'Inauguration & Registration Desk Opens' },
    { time: '11:00 AM', activity: 'Rounds Begin & Problem Statements Unveiled' }
  ]);
  const [schedTime, setSchedTime] = useState('');
  const [schedActivity, setSchedActivity] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const handleAddRule = () => {
    if (newRule.trim()) {
      setRules([...rules, newRule.trim()]);
      setNewRule('');
    }
  };

  const handleRemoveRule = (idx: number) => {
    setRules(rules.filter((_, i) => i !== idx));
  };

  const handleAddSchedule = () => {
    if (schedTime.trim() && schedActivity.trim()) {
      setSchedule([...schedule, { time: schedTime.trim(), activity: schedActivity.trim() }]);
      setSchedTime('');
      setSchedActivity('');
    }
  };

  const handleRemoveSchedule = (idx: number) => {
    setSchedule(schedule.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const selectedCollege = colleges.find(c => c.id === collegeId);
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    try {
      const created = apiService.createEvent({
        title,
        description,
        category,
        collegeId,
        collegeName: selectedCollege ? selectedCollege.name : 'University Campus',
        date,
        time,
        endDate: endDate || undefined,
        venue,
        registrationDeadline,
        fee: Number(fee) || 0,
        maxParticipants: Number(maxParticipants) || 100,
        teamSize,
        prizePool,
        status: 'upcoming',
        tags,
        coordinatorName,
        coordinatorContact,
        coordinatorEmail,
        rules,
        schedule,
        bannerUrl,
        featured: true,
      });

      onNavigate('event-details', { eventId: created.id });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events</span>
      </button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <Calendar className="w-4 h-4" />
          <span>Organizer Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Host a New Collegiate Event
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Publish competitions, symposiums, or festivals to our inter-college network.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8 text-xs">
        
        {/* Core Info */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            Basic Event Information
          </h3>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Event Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Shaastra 2026: AI & Autonomous Robotics Hackathon"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-hidden focus:border-indigo-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 bg-white"
              >
                <option value="Hackathon">Hackathon</option>
                <option value="Technical">Technical (RoboWars, Coding)</option>
                <option value="Cultural">Cultural (Music, Dance, Drama)</option>
                <option value="Gaming">Gaming / Esports</option>
                <option value="Workshop">Workshop / Masterclass</option>
                <option value="Sports">Sports Tournament</option>
                <option value="Symposium">Research Symposium</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Host College / University *</label>
              <select
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 bg-white"
              >
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.shortName})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Description & Problem Statement *</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the challenge, themes, eligibility, and perks..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 leading-relaxed"
            />
          </div>
        </div>

        {/* Date, Time & Venue */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            Dates, Timing & Venue
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Event Start Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Event Time *</label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="09:00 AM"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">End Date (Optional)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Venue / Campus Auditorium *</label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. IC&SR Auditorium, IIT Madras Campus"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Registration Deadline *</label>
              <input
                type="date"
                required
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Fees, Prizes & Capacity */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            Capacity, Entry Fees & Prize Pool
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Entry Fee (₹, 0 = Free)</label>
              <input
                type="number"
                min="0"
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Max Capacity</label>
              <input
                type="number"
                min="10"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Team Size Format</label>
              <select
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Individual">Individual</option>
                <option value="2-4 Members">2-4 Members</option>
                <option value="4-6 Members">4-6 Members</option>
                <option value="Team (Flexible)">Team (Flexible)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Prize Pool</label>
              <input
                type="text"
                value={prizePool}
                onChange={(e) => setPrizePool(e.target.value)}
                placeholder="e.g. ₹1,00,000 + Trophies"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Tags (Comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Robotics, AI, Hackathon, CleanTech"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
            />
          </div>
        </div>

        {/* Banner Image Selection */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <label className="font-semibold text-slate-700 block">Banner Image URL or Select Preset</label>
          <input
            type="url"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 mb-2 font-mono text-[11px]"
          />
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {SAMPLE_BANNERS.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Preset ${i}`}
                onClick={() => setBannerUrl(img)}
                className={`h-16 w-full object-cover rounded-xl cursor-pointer border-2 transition ${
                  bannerUrl === img ? 'border-indigo-600 scale-102 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Rules Builder */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <label className="font-semibold text-slate-700 block">Event Rules & Guidelines</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              placeholder="e.g. Maximum duration 36 hours. Laptops must be brought by teams."
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200"
            />
            <button
              type="button"
              onClick={handleAddRule}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition"
            >
              Add Rule
            </button>
          </div>
          <ul className="space-y-1.5 mt-2">
            {rules.map((rule, idx) => (
              <li key={idx} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span>• {rule}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRule(idx)}
                  className="text-rose-500 hover:text-rose-700 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Schedule Builder */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <label className="font-semibold text-slate-700 block">Event Schedule Items</label>
          <div className="flex gap-2 flex-col sm:flex-row">
            <input
              type="text"
              value={schedTime}
              onChange={(e) => setSchedTime(e.target.value)}
              placeholder="Time: e.g. 10:00 AM"
              className="sm:w-36 px-3 py-2 rounded-xl border border-slate-200"
            />
            <input
              type="text"
              value={schedActivity}
              onChange={(e) => setSchedActivity(e.target.value)}
              placeholder="Activity: e.g. Keynote speech and orientation"
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200"
            />
            <button
              type="button"
              onClick={handleAddSchedule}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition"
            >
              Add Schedule
            </button>
          </div>
          <ul className="space-y-1.5 mt-2">
            {schedule.map((item, idx) => (
              <li key={idx} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span>
                  <strong className="text-indigo-600 font-mono mr-2">{item.time}</strong>
                  {item.activity}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveSchedule(idx)}
                  className="text-rose-500 hover:text-rose-700 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Coordinator Contacts */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            Student Organizer / Coordinator Contact
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Coordinator Name *</label>
              <input
                type="text"
                required
                value={coordinatorName}
                onChange={(e) => setCoordinatorName(e.target.value)}
                placeholder="Dr. Rajesh / Sneha V"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Coordinator Phone *</label>
              <input
                type="tel"
                required
                value={coordinatorContact}
                onChange={(e) => setCoordinatorContact(e.target.value)}
                placeholder="+91 98401 23456"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Coordinator Email *</label>
              <input
                type="email"
                required
                value={coordinatorEmail}
                onChange={(e) => setCoordinatorEmail(e.target.value)}
                placeholder="fest@college.edu"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-md shadow-indigo-600/30 flex items-center gap-2"
          >
            {submitting ? 'Creating Event...' : 'Publish Event Live'}
          </button>
        </div>

      </form>

    </div>
  );
};
