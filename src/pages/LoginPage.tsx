import React, { useState } from 'react';
import { 
  GraduationCap, 
  User as UserIcon, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Sparkles,
  Lock,
  Mail
} from 'lucide-react';
import { User, UserRole } from '../types';
import { apiService } from '../services/apiService';

interface LoginPageProps {
  currentUser: User;
  onLoginSuccess: (user: User) => void;
  onNavigate: (view: string, params?: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  currentUser,
  onLoginSuccess,
  onNavigate,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role);
  const [customEmail, setCustomEmail] = useState(currentUser.email);
  const [customName, setCustomName] = useState(currentUser.name);

  const availableUsers = apiService.getAvailableUsers();

  const handleQuickLogin = (user: User) => {
    apiService.setCurrentUser(user);
    onLoginSuccess(user);
    if (user.role === 'super_admin') onNavigate('admin-dashboard');
    else if (user.role === 'college_admin') onNavigate('college-dashboard');
    else onNavigate('events');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: customName || 'Logged In User',
      email: customEmail,
      role: selectedRole,
      collegeName: selectedRole === 'college_admin' ? 'Indian Institute of Technology Madras' : 'University Student',
    };
    apiService.setCurrentUser(newUser);
    onLoginSuccess(newUser);
    onNavigate('home');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-8">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-600/30">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign In to College Event Hub
        </h1>
        <p className="text-xs text-slate-500">
          Select a demo persona or enter your institutional credentials
        </p>
      </div>

      {/* Quick Switch Persona Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>One-Click Demo Personas</span>
        </div>

        <div className="space-y-2.5">
          {availableUsers.map((user) => {
            const isCurrent = user.id === currentUser.id;
            const Icon = user.role === 'super_admin' ? ShieldCheck : user.role === 'college_admin' ? Building2 : UserIcon;
            return (
              <button
                key={user.id}
                onClick={() => handleQuickLogin(user)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition ${
                  isCurrent
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{user.name}</div>
                    <div className="text-[11px] text-slate-500">{user.email}</div>
                    <span className="text-[10px] font-semibold uppercase text-indigo-600 capitalize">
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isCurrent && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">Active</span>}
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Form */}
      <form onSubmit={handleCustomSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
        <div className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
          Or Sign in as Custom User
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-700">Role</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
          >
            <option value="student">Student Attendee</option>
            <option value="college_admin">College Organizer / Coordinator</option>
            <option value="super_admin">Super Administrator</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-700">Display Name</label>
          <input
            type="text"
            required
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200"
          />
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-700">Email Address</label>
          <input
            type="email"
            required
            value={customEmail}
            onChange={(e) => setCustomEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-xs"
        >
          Sign In
        </button>
      </form>

    </div>
  );
};
