import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  QrCode, 
  Calendar, 
  MapPin, 
  Printer, 
  Download, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { Registration } from '../types';

interface AppleWalletPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, params?: any) => void;
}

export const AppleWalletPassModal: React.FC<AppleWalletPassModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const registrations = apiService.getRegistrations();
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (!isOpen) return null;

  const currentPass: Registration | undefined = registrations[selectedIdx] || registrations[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg text-slate-900">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Pass Container */}
        {currentPass ? (
          <div className="space-y-4">
            
            {/* Apple Wallet Card */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="rounded-[32px] overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-white/20 shadow-2xl relative"
            >
              
              {/* Holographic Specular Ribbon */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-300"></div>

              {/* Card Header */}
              <div className="p-6 pb-4 flex items-start justify-between border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 text-cyan-300 font-mono border border-white/10">
                      APPLE WALLET PASS
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>VERIFIED</span>
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white leading-tight mt-1">
                    {currentPass.eventTitle}
                  </h3>
                  <p className="text-xs text-slate-300">{currentPass.collegeName}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Pass Code</span>
                  <div className="text-sm font-bold font-mono text-cyan-300 tracking-wider">
                    {currentPass.ticketNumber}
                  </div>
                </div>
              </div>

              {/* Attendee Info Grid */}
              <div className="p-6 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Attendee</span>
                  <div className="font-bold text-white text-sm mt-0.5">{currentPass.participantName}</div>
                  <div className="text-[11px] text-slate-300 truncate">{currentPass.participantEmail}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Student ID / Roll No</span>
                  <div className="font-bold text-white text-sm mt-0.5 font-mono">{currentPass.rollNumber}</div>
                  <div className="text-[11px] text-slate-300 truncate">{currentPass.department}</div>
                </div>

                <div className="col-span-2 pt-2 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Institution</span>
                    <div className="font-semibold text-slate-200">{currentPass.participantCollege}</div>
                  </div>
                  {currentPass.teamName && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Team Name</span>
                      <div className="font-bold text-indigo-400">{currentPass.teamName}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Scannable Gate QR Code Area */}
              <div className="bg-white text-slate-900 p-6 flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner">
                  <QrCode className="w-32 h-32 text-slate-900" />
                </div>
                <div className="font-mono text-xs font-bold tracking-widest text-slate-700">
                  {currentPass.qrCodeId}
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  Scan at campus gate or turnstile for instant badge clearance
                </p>
              </div>

            </motion.div>

            {/* Carousel Selector if multiple passes */}
            {registrations.length > 1 && (
              <div className="flex items-center justify-center gap-2 pt-1">
                {registrations.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedIdx(i)}
                    className={`h-2 rounded-full transition-all ${
                      selectedIdx === i ? 'w-8 bg-cyan-400' : 'w-2 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-slate-900 font-bold text-xs shadow-lg hover:bg-slate-100 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Apple Pass</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl bg-white/10 text-white font-semibold text-xs border border-white/20 hover:bg-white/20 transition backdrop-blur-md"
              >
                Done
              </button>
            </div>

          </div>
        ) : (
          <div className="rounded-[32px] p-8 text-center bg-slate-900/90 text-white border border-white/20 space-y-4 backdrop-blur-xl">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-cyan-400">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold">No Active Passes Yet</h3>
            <p className="text-xs text-slate-300">
              You haven't registered for any events yet. Explore competitions to receive your verified Apple pass!
            </p>
            <button
              onClick={() => {
                onClose();
                onNavigate('events');
              }}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
            >
              Browse Events
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
