import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  Calendar, 
  Building2, 
  Search, 
  Ticket, 
  PlusCircle, 
  Terminal, 
  Code2, 
  Droplets, 
  ChevronDown, 
  ChevronUp,
  Lock,
  CalendarDays,
  Sparkles
} from 'lucide-react';
import { User, getRolePermissions } from '../types';

interface AppleLiquidDockProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenApiTester: () => void;
  onOpenJavaModal: () => void;
  onOpenWalletPasses: () => void;
  onOpenAiChat?: () => void;
  liquidMode: boolean;
  onToggleLiquidMode: () => void;
  currentUser: User;
}

export const AppleLiquidDock: React.FC<AppleLiquidDockProps> = ({
  currentView,
  onNavigate,
  onOpenApiTester,
  onOpenJavaModal,
  onOpenWalletPasses,
  onOpenAiChat,
  liquidMode,
  onToggleLiquidMode,
  currentUser,
}) => {
  const [minimized, setMinimized] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const permissions = getRolePermissions(currentUser.role);

  const dockItems = [
    { id: 'home', label: 'Home', icon: Home, action: () => onNavigate('home') },
    { 
      id: 'ai-chat', 
      label: 'Campus AI Assistant', 
      icon: Sparkles, 
      action: onOpenAiChat ? onOpenAiChat : () => onNavigate('ai-chat'),
      badge: 'AI',
      highlight: true
    },
    { id: 'events', label: 'Events', icon: Calendar, action: () => onNavigate('events') },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays, action: () => onNavigate('calendar') },
    { id: 'colleges', label: 'Colleges', icon: Building2, action: () => onNavigate('colleges') },
    { id: 'search', label: 'Search', icon: Search, action: () => onNavigate('search') },
    { id: 'passes', label: 'My Passes', icon: Ticket, action: onOpenWalletPasses },
    { id: 'add-event', label: 'Host Event', icon: PlusCircle, action: () => onNavigate('add-event') },
    { id: 'api-tester', label: 'REST API', icon: Terminal, action: onOpenApiTester, badge: 'Live' },
    { 
      id: 'java-code', 
      label: 'Java Backend (Unlocked)', 
      icon: Code2, 
      action: onOpenJavaModal,
      badge: 'Code',
      locked: false
    },
    { 
      id: 'liquid-toggle', 
      label: liquidMode ? 'Liquid Mesh: On' : 'Liquid Mesh: Off', 
      icon: Droplets, 
      action: onToggleLiquidMode,
      highlight: liquidMode 
    },
  ];

  if (minimized) {
    return (
      <div className="fixed bottom-3 right-4 z-40">
        <button
          onClick={() => setMinimized(false)}
          className="liquid-dock px-3 py-1.5 rounded-full text-xs font-bold text-slate-800 flex items-center gap-1.5 shadow-lg hover:scale-105 transition"
        >
          <span className="text-indigo-600"></span>
          <span>Dock</span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 select-none max-w-[96vw]">
      <div className="relative">
        {/* Floating Liquid Glass Dock Capsule */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="liquid-dock px-2 sm:px-3 py-2 rounded-[26px] shadow-2xl flex items-center gap-1 sm:gap-2 border border-white/60"
        >
          {dockItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const isHovered = hoveredIdx === idx;

            return (
              <div 
                key={item.id} 
                className="relative flex flex-col items-center"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Tooltip on hover */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: -45, scale: 1 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute -top-1 pointer-events-none z-50 px-2.5 py-1 rounded-xl bg-slate-900/90 text-white text-[11px] font-semibold whitespace-nowrap shadow-xl backdrop-blur-md border border-white/10"
                  >
                    {item.label}
                  </motion.div>
                )}

                {/* Dock Icon Button */}
                <motion.button
                  whileHover={{ 
                    scale: 1.25, 
                    y: -5,
                    transition: { type: 'spring', stiffness: 500, damping: 22 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={item.action}
                  className={`relative p-2 sm:p-2.5 rounded-2xl flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : item.highlight
                      ? 'bg-cyan-500/20 text-cyan-700 border border-cyan-400/30'
                      : item.locked
                      ? 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                      : 'text-slate-700 hover:bg-white/80 hover:text-slate-950'
                  }`}
                  aria-label={item.label}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />

                  {/* Active dot underneath */}
                  {isActive && (
                    <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-indigo-600"></span>
                  )}

                  {/* Optional indicator badge */}
                  {item.badge && (
                    <span className={`absolute -top-1 -right-1 text-[8px] font-mono font-bold px-1 rounded-full ${
                      item.badge === '403' 
                        ? 'bg-rose-500 text-white' 
                        : item.badge === 'Admin' 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-emerald-500 animate-pulse'
                    }`}>
                      {item.badge !== 'Live' && item.badge}
                    </span>
                  )}
                </motion.button>
              </div>
            );
          })}

          {/* Minimize toggle */}
          <div className="h-6 w-px bg-slate-300/60 mx-0.5"></div>
          <button
            onClick={() => setMinimized(true)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 transition"
            title="Minimize Dock"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};
