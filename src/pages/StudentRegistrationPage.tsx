import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Ticket, 
  CheckCircle2, 
  Users, 
  Plus, 
  Trash2, 
  Calendar, 
  MapPin, 
  QrCode, 
  Download, 
  Printer, 
  Sparkles,
  Building2,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CollegeEvent, Registration, TeamMember, User } from '../types';
import { apiService } from '../services/apiService';

interface StudentRegistrationPageProps {
  eventId: string;
  currentUser: User;
  onBack: () => void;
  onNavigate: (view: string, params?: any) => void;
}

export const StudentRegistrationPage: React.FC<StudentRegistrationPageProps> = ({
  eventId,
  currentUser,
  onBack,
  onNavigate,
}) => {
  const event = apiService.getEventById(eventId);

  const [fullName, setFullName] = useState(currentUser.name || 'Kabilan Free');
  const [email, setEmail] = useState(currentUser.email || 'kabilanfree@gmail.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [collegeName, setCollegeName] = useState('Anna University, Chennai');
  const [rollNumber, setRollNumber] = useState('2023CS1042');
  const [department, setDepartment] = useState('Computer Science and Engineering');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year');

  // Team fields
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // State after successful registration
  const [registeredTicket, setRegisteredTicket] = useState<Registration | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Event Not Found</h2>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Return to Events
        </button>
      </div>
    );
  }

  const isTeamEvent = event.teamSize !== 'Individual';

  const handleAddMember = () => {
    setTeamMembers([
      ...teamMembers,
      { name: '', email: '', rollNumber: '', college: collegeName },
    ]);
  };

  const handleRemoveMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...teamMembers];
    updated[index][field] = value;
    setTeamMembers(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const newReg = apiService.createRegistration({
        eventId: event.id,
        eventTitle: event.title,
        collegeName: event.collegeName,
        participantName: fullName,
        participantEmail: email,
        participantPhone: phone,
        participantCollege: collegeName,
        rollNumber,
        department,
        yearOfStudy,
        teamName: isTeamEvent ? teamName : undefined,
        teamMembers: isTeamEvent ? teamMembers : undefined,
      });

      // Confetti burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setRegisteredTicket(newReg);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // If already registered and showing ticket pass
  if (registeredTicket) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-in fade-in duration-300">
        
        {/* Success Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
          <h2 className="text-xl font-extrabold text-emerald-900">Registration Confirmed!</h2>
          <p className="text-xs text-emerald-700 max-w-md mx-auto">
            Your registration pass has been successfully issued. A confirmation copy has been logged to your account.
          </p>
        </div>

        {/* Printable Ticket Pass Card */}
        <div className="bg-white rounded-3xl border-2 border-indigo-200 shadow-xl overflow-hidden print:border print:shadow-none">
          
          {/* Ticket Header */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded bg-cyan-400 text-slate-950 font-mono">
                OFFICIAL ENTRY PASS
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold mt-2 text-white">{event.title}</h3>
              <p className="text-xs text-indigo-200 mt-1">{event.collegeName}</p>
            </div>
            <div className="text-left sm:text-right font-mono">
              <span className="text-[11px] text-indigo-300">Ticket Pass Number:</span>
              <div className="text-lg font-bold text-cyan-300 tracking-wider">{registeredTicket.ticketNumber}</div>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Details */}
            <div className="md:col-span-2 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Participant Name</span>
                  <div className="font-bold text-slate-900 text-sm">{registeredTicket.participantName}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Roll / Student ID</span>
                  <div className="font-bold text-slate-900 text-sm font-mono">{registeredTicket.rollNumber}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Institution</span>
                  <div className="font-semibold text-slate-800 truncate">{registeredTicket.participantCollege}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Department</span>
                  <div className="font-semibold text-slate-800">{registeredTicket.department} ({registeredTicket.yearOfStudy})</div>
                </div>
              </div>

              {registeredTicket.teamName && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Team Name</span>
                  <div className="font-bold text-indigo-600 text-sm">{registeredTicket.teamName}</div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-4 text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>{event.date} • {event.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span className="truncate max-w-[220px]">{event.venue}</span>
                </div>
              </div>
            </div>

            {/* QR Code Pass Preview */}
            <div className="border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 text-center space-y-2">
              <div className="w-36 h-36 bg-slate-900 rounded-2xl mx-auto flex flex-col items-center justify-center text-white p-3 shadow-inner">
                <QrCode className="w-24 h-24 text-white" />
                <span className="text-[9px] font-mono text-cyan-300 mt-1">{registeredTicket.qrCodeId}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Scan at gate for instant badge check-in</p>
            </div>

          </div>

          {/* Ticket Footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>ISSUED: {new Date(registeredTicket.registeredAt).toLocaleDateString()}</span>
            <span className="text-emerald-600 font-bold uppercase">STATUS: CONFIRMED</span>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Pass</span>
          </button>
          <button
            onClick={() => onNavigate('events')}
            className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            Explore More Events
          </button>
        </div>

      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Event Details</span>
      </button>

      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <Ticket className="w-4 h-4" />
          <span>Student Registration Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Register for {event.title}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Hosted by <span className="font-semibold text-slate-800">{event.collegeName}</span>
        </p>
      </div>

      {/* Registration Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Primary Attendee / Team Leader Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Kabilan Free"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Contact Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-700">College / University *</label>
                <input
                  type="text"
                  required
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="e.g. Anna University, IIT Madras"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Roll / Registration Number *</label>
                <input
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 2023CS1042"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Department *</label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-700">Year of Study *</label>
                <select
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-indigo-500 bg-white"
                >
                  <option value="1st Year">1st Year (Freshman)</option>
                  <option value="2nd Year">2nd Year (Sophomore)</option>
                  <option value="3rd Year">3rd Year (Junior)</option>
                  <option value="4th Year">4th Year (Senior)</option>
                  <option value="Postgraduate / PhD">Postgraduate / Research Scholar</option>
                </select>
              </div>

            </div>

            {/* Team details if applicable */}
            {isTeamEvent && (
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Team Information</h3>
                    <p className="text-xs text-slate-500">Event requirement: {event.teamSize}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Teammate</span>
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-semibold text-slate-700">Team Name *</label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. CyberKnights, Quantum Innovators"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                {teamMembers.map((member, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-700">Teammate #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <input
                        type="text"
                        required
                        placeholder="Teammate Full Name"
                        value={member.name}
                        onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 bg-white"
                      />
                      <input
                        type="email"
                        required
                        placeholder="Teammate Email"
                        value={member.email}
                        onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 bg-white"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Teammate Roll No"
                        value={member.rollNumber}
                        onChange={(e) => handleMemberChange(idx, 'rollNumber', e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Terms & Submit */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                <input type="checkbox" required defaultChecked className="rounded border-slate-300 text-indigo-600 mt-0.5" />
                <span>
                  I confirm that all provided details are authentic and match my institutional student credentials. I agree to abide by the event rules and code of conduct.
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm transition shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Ticket className="w-4 h-4" />
                )}
                <span>Confirm & Generate Ticket Pass</span>
              </button>
            </div>

          </form>
        </div>

        {/* Right Summary Column */}
        <div>
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5 sticky top-20">
            <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100">
              Registration Summary
            </h3>

            <div className="flex items-start gap-3">
              <img
                src={event.bannerUrl}
                alt={event.title}
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />
              <div>
                <h4 className="font-bold text-slate-900 text-xs leading-snug">{event.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1">{event.collegeName}</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">
                  {event.category}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="font-medium text-slate-800">{event.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span className="font-medium text-slate-800">{event.time}</span>
              </div>
              <div className="flex justify-between">
                <span>Venue:</span>
                <span className="font-medium text-slate-800 truncate max-w-[150px]">{event.venue}</span>
              </div>
              <div className="flex justify-between">
                <span>Team Format:</span>
                <span className="font-medium text-slate-800">{event.teamSize}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 font-bold text-sm text-slate-900">
                <span>Total Amount:</span>
                <span className={event.fee === 0 ? 'text-emerald-600' : 'text-slate-900'}>
                  {event.fee === 0 ? 'FREE' : `₹${event.fee}`}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-500 space-y-1">
              <div className="font-semibold text-slate-700">What happens next?</div>
              <p>1. Instant QR pass issued on screen</p>
              <p>2. Present pass along with College ID at event registration desk</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
