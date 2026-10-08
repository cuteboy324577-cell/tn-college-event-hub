import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Ticket, 
  Calendar, 
  Terminal, 
  Code2, 
  Droplets, 
  Search, 
  X, 
  ChevronRight, 
  Zap,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { Registration, User, getRolePermissions } from '../types';

interface AppleDynamicIslandProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenApiTester: () => void;
  onOpenJavaModal: () => void;
  onOpenWalletPasses: () => void;
  onOpenAiChat?: () => void;
  liquidMode: boolean;
  onToggleLiquidMode: () => void;
  currentUser: User;
}

export const AppleDynamicIsland: React.FC<AppleDynamicIslandProps> = ({
  onNavigate,
  onOpenApiTester,
  onOpenJavaModal,
  onOpenWalletPasses,
  onOpenAiChat,
  liquidMode,
  onToggleLiquidMode,
  currentUser,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [recentPass, setRecentPass] = useState<Registration | null>(null);
  const permissions = getRolePermissions(currentUser.role);

  // Check recent registration and listen for live updates
  useEffect(() => {
    const refreshRecentPass = () => {
      const regs = apiService.getRegistrations();
      if (regs && regs.length > 0) {
        setRecentPass(regs[0]);
      }
    };

    refreshRecentPass();

    const handleUpdate = () => {
      refreshRecentPass();
    };

    window.addEventListener('registration-updated', handleUpdate);
    return () => window.removeEventListener('registration-updated', handleUpdate);
  }, []);

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center pointer-events-auto">
      <motion.div
        layout
        onClick={() => !isExpanded && setIsExpanded(true)}
        className={`relative liquid-pill text-white cursor-pointer select-none transition-shadow ${
          isExpanded ? 'p-4 rounded-[28px] shadow-2xl ring-1 ring-white/20 max-w-md w-[92vw] sm:w-[420px]' : 'px-3.5 py-1.5 rounded-full hover:scale-105 shadow-xl'
        }`}
        transition={{
          type: 'spring',
          stiffness: 450,
          damping: 32,
        }}
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            /* Collapsed Dynamic Pill */
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-2.5 text-xs"
            >
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="font-semibold tracking-tight text-white/90 text-[11px] hidden sm:inline">
                  College Event Hub
                </span>
              </div>

              <div className="h-3 w-px bg-white/20"></div>

              {recentPass ? (
                <div className="flex items-center gap-1.5 text-cyan-300 font-mono text-[11px]">
                  <Ticket className="w-3 h-3 text-cyan-400" />
                  <span className="font-bold">{recentPass.ticketNumber}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-indigo-300 text-[11px]">
                  <Zap className="w-3 h-3 text-amber-400 fill-current" />
                  <span>2026 Season Live</span>
                </div>
              )}

              <div className="flex items-center text-[10px] text-white/50 bg-white/10 px-1.5 py-0.5 rounded-full font-mono">
                ⌘ Island
              </div>
            </motion.div>
          ) : (
            /* Expanded Liquid Control Hub */
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-3.5"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center text-slate-950 font-bold text-xs shadow-xs">
                    
                  </div>
                  <span className="font-bold text-xs text-white tracking-wide">
                    Liquid Control Island
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                  className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Status / Active Pass card */}
              {recentPass ? (
                <div 
                  onClick={() => {
                    onOpenWalletPasses();
                    setIsExpanded(false);
                  }}
                  className="p-2.5 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-400/30">
                      <Ticket className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-white truncate max-w-[200px]">
                        {recentPass.eventTitle}
                      </div>
                      <div className="text-[10px] text-cyan-300 font-mono">
                        Pass: {recentPass.ticketNumber} • Confirmed
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/50" />
                </div>
              ) : (
                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/80 flex items-center justify-between">
                  <span>8 Flagship Fests Open for Registration</span>
                  <button
                    onClick={() => {
                      onNavigate('events');
                      setIsExpanded(false);
                    }}
                    className="text-[10px] font-bold text-cyan-300 hover:underline"
                  >
                    Explore
                  </button>
                </div>
              )}

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Liquid UI Mode Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLiquidMode();
                  }}
                  className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition ${
                    liquidMode 
                      ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-200' 
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <Droplets className={`w-4 h-4 ${liquidMode ? 'text-cyan-400' : 'text-white/60'}`} />
                  <div>
                    <div className="text-[11px] font-bold">Liquid UI Mesh</div>
                    <div className="text-[9px] opacity-75">{liquidMode ? 'Active (Fluid)' : 'Disabled'}</div>
                  </div>
                </button>

                {/* REST API Sandbox */}
                <button
                  onClick={() => {
                    onOpenApiTester();
                    setIsExpanded(false);
                  }}
                  className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center gap-2 transition"
                >
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-[11px] font-bold text-white">REST Console</div>
                    <div className="text-[9px] text-white/60">Test Endpoints</div>
                  </div>
                </button>

                {/* Java Source Code (RBAC Protected) */}
                <button
                  onClick={() => {
                    onOpenJavaModal();
                    setIsExpanded(false);
                  }}
                  className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition ${
                    permissions.canViewJavaCode 
                      ? 'bg-white/5 hover:bg-white/10 border-white/10' 
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                  }`}
                >
                  {permissions.canViewJavaCode ? (
                    <Code2 className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-rose-400" />
                  )}
                  <div>
                    <div className="text-[11px] font-bold text-white flex items-center gap-1">
                      <span>Java Backend</span>
                      {!permissions.canViewJavaCode && <span className="text-[9px] text-rose-400 font-mono">403</span>}
                    </div>
                    <div className="text-[9px] text-white/60">
                      {permissions.canEditJavaCode ? 'Admin Control' : permissions.canViewJavaCode ? 'Organizer View' : 'Locked'}
                    </div>
                  </div>
                </button>

                {/* Quick Search */}
                <button
                  onClick={() => {
                    onNavigate('search');
                    setIsExpanded(false);
                  }}
                  className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center gap-2 transition"
                >
                  <Search className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="text-[11px] font-bold text-white">Global Search</div>
                    <div className="text-[9px] text-white/60">Events & Institutes</div>
                  </div>
                </button>

                {/* Campus AI Assistant */}
                <button
                  onClick={() => {
                    if (onOpenAiChat) onOpenAiChat();
                    else onNavigate('ai-chat');
                    setIsExpanded(false);
                  }}
                  className="p-2.5 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-400/40 text-left flex items-center gap-2 transition col-span-2 shadow-lg"
                >
                  <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <span>Campus AI Assistant</span>
                      <span className="text-[9px] px-1 rounded bg-cyan-500/30 text-cyan-200 border border-cyan-400/30">Gemini 3.8</span>
                    </div>
                    <div className="text-[9px] text-cyan-200/70">Instant answers for all events, schedules & passes</div>
                  </div>
                </button>

                {/* Event Calendar */}
                <button
                  onClick={() => {
                    onNavigate('calendar');
                    setIsExpanded(false);
                  }}
                  className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center gap-2 transition col-span-2"
                >
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="text-[11px] font-bold text-white">Monthly Event Calendar</div>
                    <div className="text-[9px] text-white/60">Visualize registered dates, passes & deadlines</div>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
