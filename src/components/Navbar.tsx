import React, { useState } from 'react';
import { 
  GraduationCap, 
  Search, 
  Calendar, 
  Building2, 
  PlusCircle, 
  Code2, 
  Terminal, 
  User as UserIcon, 
  Menu, 
  X, 
  Check, 
  ChevronDown, 
  Sparkles,
  Info,
  PhoneCall,
  Droplets,
  Ticket,
  Lock
} from 'lucide-react';
import { User, UserRole, getRolePermissions } from '../types';
import { apiService } from '../services/apiService';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenApiTester: () => void;
  onOpenJavaModal: () => void;
  currentUser: User;
  onUserChange: (user: User) => void;
  liquidMode: boolean;
  onToggleLiquidMode: () => void;
  onOpenWalletPasses: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenApiTester,
  onOpenJavaModal,
  currentUser,
  onUserChange,
  liquidMode,
  onToggleLiquidMode,
  onOpenWalletPasses,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const availableUsers = apiService.getAvailableUsers();
  const permissions = getRolePermissions(currentUser.role);

  const handleRoleSelect = (role: UserRole) => {
    const updated = apiService.switchUserRole(role);
    onUserChange(updated);
    setUserDropdownOpen(false);
  };

  const navLinks = [
    { id: 'events', label: 'Explore Events', icon: Calendar },
    { id: 'colleges', label: 'Colleges', icon: Building2 },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'about', label: 'About', icon: Info },
    { id: 'contact', label: 'Contact', icon: PhoneCall },
  ];

  return (
    <header className={`sticky top-0 z-40 transition-all ${
      liquidMode 
        ? 'liquid-glass border-b border-white/60' 
        : 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">CollegeEvent</span>
                <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700">Hub</span>
                {liquidMode && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                    Liquid UI
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">Inter-Collegiate Fest & Tech Portal</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-75" />
                  <span>{link.label}</span>
                </button>
              );
            })}

            {/* Dashboard link based on role */}
            <button
              onClick={() => {
                if (currentUser.role === 'super_admin' || currentUser.role === 'admin') onNavigate('admin-dashboard');
                else if (currentUser.role === 'college_admin' || currentUser.role === 'organizer') onNavigate('college-dashboard');
                else onNavigate('search');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                currentView.includes('dashboard')
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span>Dashboard</span>
            </button>
          </nav>

          {/* Right Action Utilities & User Menu */}
          <div className="hidden lg:flex items-center gap-2">
            
            {/* Apple Liquid Glass Mode Toggle */}
            <button
              onClick={onToggleLiquidMode}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
                liquidMode
                  ? 'bg-cyan-500/15 border-cyan-300 text-cyan-900 shadow-2xs'
                  : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
              title="Toggle Apple Liquid UI Mesh & Glassmorphism"
            >
              <Droplets className={`w-3.5 h-3.5 ${liquidMode ? 'text-cyan-600 fill-cyan-400' : 'text-slate-500'}`} />
              <span>Liquid UI</span>
              <span className={`w-1.5 h-1.5 rounded-full ${liquidMode ? 'bg-cyan-500 animate-pulse' : 'bg-slate-300'}`}></span>
            </button>

            {/* Apple Wallet Passes trigger */}
            <button
              onClick={onOpenWalletPasses}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/90 bg-white/70 hover:bg-white text-slate-700 text-xs font-semibold transition group shadow-2xs"
              title="View Apple Wallet Style Passes"
            >
              <Ticket className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span>Passes</span>
            </button>

            {/* Live REST API Tester trigger */}
            <button
              onClick={onOpenApiTester}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/90 bg-white/70 hover:bg-white text-slate-700 text-xs font-semibold transition shadow-2xs group"
              title="Test Live REST Endpoints"
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span>REST API</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>

            {/* RBAC-Protected Java Spring Boot Code Exporter trigger */}
            {permissions.canViewJavaCode ? (
              <button
                onClick={onOpenJavaModal}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition group shadow-2xs ${
                  permissions.canEditJavaCode 
                    ? 'border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-950' 
                    : 'border-amber-200 bg-amber-50/80 hover:bg-amber-100 text-amber-950'
                }`}
                title={permissions.canEditJavaCode ? 'Java Backend (ROLE_ADMIN: Full Access)' : 'Java Backend (ROLE_ORGANIZER: Read-Only)'}
              >
                <Code2 className={`w-3.5 h-3.5 ${permissions.canEditJavaCode ? 'text-emerald-600' : 'text-amber-600'}`} />
                <span>Java</span>
                <span className={`text-[9px] font-bold px-1 rounded uppercase ${
                  permissions.canEditJavaCode ? 'bg-emerald-200/60 text-emerald-800' : 'bg-amber-200/60 text-amber-800'
                }`}>
                  {permissions.canEditJavaCode ? 'Admin' : 'Read'}
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenJavaModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-100/70 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 text-slate-400 text-xs font-medium transition group"
                title="Java Backend Protected (403 Access Denied for Participants)"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500" />
                <span>Java</span>
                <span className="text-[9px] font-mono text-slate-400 group-hover:text-rose-600">403</span>
              </button>
            )}

            {/* Host Event Button */}
            <button
              onClick={() => onNavigate('add-event')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs hover:shadow-md hover:shadow-indigo-500/20"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Host</span>
            </button>

            {/* User Profile & Demo Switcher */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full border border-slate-200 bg-white/80 hover:bg-white transition"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs overflow-hidden border border-indigo-200">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </div>
                <div className="text-left text-xs hidden xl:block">
                  <div className="font-semibold text-slate-800 leading-tight truncate max-w-[90px]">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500 capitalize leading-tight">
                    {currentUser.role.replace('_', ' ')}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Role Profile</p>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <div className="mt-1">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        permissions.canEditJavaCode 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : permissions.canViewJavaCode 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        Role: {currentUser.role}
                      </span>
                    </div>
                  </div>

                  <div className="p-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                      Switch Role (RBAC Simulation)
                    </p>
                    {availableUsers.map((u) => {
                      const isSelected = u.role === currentUser.role;
                      return (
                        <button
                          key={u.id}
                          onClick={() => handleRoleSelect(u.role)}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-left transition ${
                            isSelected ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <div className="font-semibold capitalize">{u.role.replace('_', ' ')}</div>
                            <div className="text-[11px] text-slate-500">{u.name}</div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1 px-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('login');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl text-left"
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>Switch / Login as another account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onToggleLiquidMode}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${
                liquidMode ? 'bg-cyan-50 border-cyan-300 text-cyan-800' : 'border-slate-200 text-slate-600'
              }`}
            >
              <Droplets className="w-4 h-4 text-cyan-600" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white/80"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    onNavigate(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    currentView === link.id ? 'bg-indigo-600 text-white' : 'text-slate-700 bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                onNavigate('add-event');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Host New Event</span>
            </button>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  onOpenWalletPasses();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold"
              >
                <Ticket className="w-3.5 h-3.5 text-indigo-600" />
                <span>Passes</span>
              </button>

              <button
                onClick={() => {
                  onOpenApiTester();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold"
              >
                <Terminal className="w-3.5 h-3.5 text-indigo-600" />
                <span>REST API</span>
              </button>

              <button
                onClick={() => {
                  onOpenJavaModal();
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-center gap-1 py-2 rounded-xl border text-xs font-semibold ${
                  permissions.canViewJavaCode 
                    ? 'border-amber-200 bg-amber-50 text-amber-900' 
                    : 'border-slate-200 bg-slate-100 text-slate-400'
                }`}
              >
                {permissions.canViewJavaCode ? <Code2 className="w-3.5 h-3.5 text-amber-600" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
                <span>{permissions.canViewJavaCode ? 'Java' : 'Java (403)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
