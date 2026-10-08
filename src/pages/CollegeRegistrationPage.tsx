import React, { useState } from 'react';
import { 
  Building2, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Sparkles 
} from 'lucide-react';
import { apiService } from '../services/apiService';

interface CollegeRegistrationPageProps {
  onBack: () => void;
  onNavigate: (view: string, params?: any) => void;
}

export const CollegeRegistrationPage: React.FC<CollegeRegistrationPageProps> = ({
  onBack,
  onNavigate,
}) => {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [code, setCode] = useState('');
  const [location, setLocation] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [establishedYear, setEstablishedYear] = useState('1985');
  const [website, setWebsite] = useState('https://www.university.ac.in');
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=150&auto=format&fit=crop&q=80');
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const created = apiService.registerCollege({
        name,
        shortName,
        code: code.toUpperCase(),
        location,
        state,
        establishedYear: parseInt(establishedYear, 10) || 2000,
        website,
        logoUrl,
        coverUrl,
        description,
        contactEmail,
        contactPhone,
      });

      setSuccess(true);
      setTimeout(() => {
        onNavigate('college-details', { collegeId: created.id });
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
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
        <span>Back to Colleges</span>
      </button>

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
          <Building2 className="w-4 h-4" />
          <span>Institutional Registration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Register Your College / University
        </h1>
        <p className="text-xs text-slate-600">
          List your institution on the College Event Hub to organize inter-collegiate symposiums, hackathons, and cultural fests.
        </p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 text-xs flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <div className="font-bold">College Registered Successfully!</div>
            <div>Redirecting to the new college portal...</div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        
        <div className="space-y-4 text-xs">
          
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Full Official Institution Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. National Institute of Technology, Tiruchirappalli"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Short Name / Display Acronym *</label>
              <input
                type="text"
                required
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="e.g. NIT Trichy, IITM"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Institute Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. NITT, CEG, IITM"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-indigo-500 uppercase font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">City / Campus Location *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Chennai, Mumbai"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">State *</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Tamil Nadu, Karnataka"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Established Year</label>
              <input
                type="number"
                value={establishedYear}
                onChange={(e) => setEstablishedYear(e.target.value)}
                placeholder="1964"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Official Website URL</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://www.college.edu"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Institutional Contact Email *</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="dean_events@college.edu"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Contact Phone Number</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 44 2257 8000"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">About the Institution / Campus Overview</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of colleges reputation, flagship festivals, and campus facilities..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Colleges receive instant verification in demo environment</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md shadow-indigo-600/30 flex items-center gap-2"
          >
            {submitting ? 'Registering...' : 'Complete College Registration'}
          </button>
        </div>

      </form>

    </div>
  );
};
