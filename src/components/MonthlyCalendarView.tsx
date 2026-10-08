import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Tag, 
  Ticket, 
  CheckCircle2, 
  Sparkles, 
  Download, 
  ExternalLink, 
  Filter, 
  Building2, 
  Trophy, 
  Users, 
  Info,
  CalendarDays,
  BookmarkCheck,
  AlertCircle
} from 'lucide-react';
import { CollegeEvent, Registration, User, EventCategory } from '../types';
import { apiService } from '../services/apiService';

interface MonthlyCalendarViewProps {
  onSelectEvent?: (eventId: string) => void;
  onRegisterEvent?: (eventId: string) => void;
  onOpenWalletPass?: () => void;
  currentUser?: User;
  filterOnlyRegisteredDefault?: boolean;
  className?: string;
}

export const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({
  onSelectEvent,
  onRegisterEvent,
  onOpenWalletPass,
  currentUser,
  filterOnlyRegisteredDefault = false,
  className = '',
}) => {
  // All events & registrations from store
  const allEvents = useMemo(() => apiService.getEvents(), []);
  const allRegistrations = useMemo(() => apiService.getRegistrations(), []);
  const colleges = useMemo(() => apiService.getColleges(), []);

  // Filter registrations for current user if applicable
  const userRegistrations = useMemo(() => {
    if (!currentUser) return allRegistrations;
    const userEmail = currentUser.email.toLowerCase();
    const matched = allRegistrations.filter(r => r.participantEmail.toLowerCase() === userEmail);
    // If student user has matches return them, otherwise if user is admin/organizer return all or matched
    return matched.length > 0 ? matched : allRegistrations;
  }, [allRegistrations, currentUser]);

  // Map of eventId -> Registration
  const registrationMap = useMemo(() => {
    const map = new Map<string, Registration>();
    userRegistrations.forEach(reg => {
      map.set(reg.eventId, reg);
    });
    return map;
  }, [userRegistrations]);

  // Determine initial month: check if existing events or registered events exist in 2026-11
  // If registered events exist, pick the month of the first registered event (or 2026-11)
  const initialDate = useMemo(() => {
    if (userRegistrations.length > 0) {
      const regEvent = allEvents.find(e => e.id === userRegistrations[0].eventId);
      if (regEvent && regEvent.date) {
        const [year, month] = regEvent.date.split('-').map(Number);
        return new Date(year, month - 1, 1);
      }
    }
    // Check first event
    if (allEvents.length > 0 && allEvents[0].date) {
      const [year, month] = allEvents[0].date.split('-').map(Number);
      return new Date(year, month - 1, 1);
    }
    return new Date(2026, 10, 1); // November 2026
  }, [allEvents, userRegistrations]);

  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    if (userRegistrations.length > 0) {
      const firstRegEvent = allEvents.find(e => e.id === userRegistrations[0].eventId);
      if (firstRegEvent) return firstRegEvent.date;
    }
    return allEvents[0]?.date || '2026-11-14';
  });

  // Filter controls
  const [showRegisteredOnly, setShowRegisteredOnly] = useState<boolean>(filterOnlyRegisteredDefault);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');

  // Month navigation helpers
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const jumpToNovember2026 = () => {
    setCurrentDate(new Date(2026, 10, 1));
    setSelectedDateStr('2026-11-14');
  };

  const jumpToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    const pad = (n: number) => n.toString().padStart(2, '0');
    setSelectedDateStr(`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`);
  };

  // Filtered events
  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      // Category filter
      if (selectedCategory !== 'All' && event.category !== selectedCategory) {
        return false;
      }
      // College filter
      if (selectedCollegeId !== 'All' && event.collegeId !== selectedCollegeId) {
        return false;
      }
      // Registered only filter
      if (showRegisteredOnly && !registrationMap.has(event.id)) {
        return false;
      }
      return true;
    });
  }, [allEvents, selectedCategory, selectedCollegeId, showRegisteredOnly, registrationMap]);

  // Calendar cells calculation
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 for Sunday
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells: Array<{
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      events: CollegeEvent[];
      hasRegisteredEvent: boolean;
    }> = [];

    const pad = (n: number) => n.toString().padStart(2, '0');
    const todayStr = new Date().toISOString().slice(0, 10);

    // Helper to test if event covers a given date string 'YYYY-MM-DD'
    const getEventsForDate = (dateStr: string) => {
      return filteredEvents.filter(evt => {
        if (evt.date === dateStr) return true;
        // Check if multi-day event spans across this date
        if (evt.endDate && evt.date <= dateStr && evt.endDate >= dateStr) {
          return true;
        }
        return false;
      });
    };

    // 1. Previous Month Overflow days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(currentYear, currentMonth - 1, dayNum);
      const dateStr = `${prevDate.getFullYear()}-${pad(prevDate.getMonth() + 1)}-${pad(dayNum)}`;
      const dayEvents = getEventsForDate(dateStr);
      cells.push({
        dayNumber: dayNum,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        events: dayEvents,
        hasRegisteredEvent: dayEvents.some(e => registrationMap.has(e.id)),
      });
    }

    // 2. Current Month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(d)}`;
      const dayEvents = getEventsForDate(dateStr);
      cells.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        events: dayEvents,
        hasRegisteredEvent: dayEvents.some(e => registrationMap.has(e.id)),
      });
    }

    // 3. Next Month Overflow days to complete the 35 or 42 grid slots
    const totalCells = cells.length > 35 ? 42 : 35;
    const remainingSlots = totalCells - cells.length;
    for (let d = 1; d <= remainingSlots; d++) {
      const nextDate = new Date(currentYear, currentMonth + 1, d);
      const dateStr = `${nextDate.getFullYear()}-${pad(nextDate.getMonth() + 1)}-${pad(d)}`;
      const dayEvents = getEventsForDate(dateStr);
      cells.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        events: dayEvents,
        hasRegisteredEvent: dayEvents.some(e => registrationMap.has(e.id)),
      });
    }

    return cells;
  }, [currentYear, currentMonth, filteredEvents, registrationMap]);

  // Events on the currently selected date
  const selectedDateEvents = useMemo(() => {
    return filteredEvents.filter(evt => {
      if (evt.date === selectedDateStr) return true;
      if (evt.endDate && evt.date <= selectedDateStr && evt.endDate >= selectedDateStr) return true;
      return false;
    });
  }, [filteredEvents, selectedDateStr]);

  // Statistics for header summary
  const monthStats = useMemo(() => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const monthPrefix = `${currentYear}-${pad(currentMonth + 1)}`;
    const monthEvents = allEvents.filter(e => e.date.startsWith(monthPrefix));
    const registeredInMonth = monthEvents.filter(e => registrationMap.has(e.id));
    
    return {
      totalInMonth: monthEvents.length,
      registeredCount: registeredInMonth.length,
      allRegisteredTotal: registrationMap.size,
      monthName: monthNames[currentMonth],
    };
  }, [allEvents, currentYear, currentMonth, registrationMap]);

  // Category styling helper
  const getCategoryTheme = (category: EventCategory) => {
    switch (category) {
      case 'Hackathon':
        return {
          pill: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200',
          dot: 'bg-purple-500',
          border: 'border-l-purple-500',
          gradient: 'from-purple-50 to-indigo-50',
        };
      case 'Technical':
        return {
          pill: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
          dot: 'bg-blue-500',
          border: 'border-l-blue-500',
          gradient: 'from-blue-50 to-cyan-50',
        };
      case 'Cultural':
        return {
          pill: 'bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200',
          dot: 'bg-pink-500',
          border: 'border-l-pink-500',
          gradient: 'from-pink-50 to-rose-50',
        };
      case 'Workshop':
        return {
          pill: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200',
          dot: 'bg-amber-500',
          border: 'border-l-amber-500',
          gradient: 'from-amber-50 to-yellow-50',
        };
      case 'Gaming':
        return {
          pill: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200',
          dot: 'bg-emerald-500',
          border: 'border-l-emerald-500',
          gradient: 'from-emerald-50 to-teal-50',
        };
      case 'Sports':
        return {
          pill: 'bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-200',
          dot: 'bg-teal-500',
          border: 'border-l-teal-500',
          gradient: 'from-teal-50 to-emerald-50',
        };
      case 'Symposium':
        return {
          pill: 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200',
          dot: 'bg-indigo-500',
          border: 'border-l-indigo-500',
          gradient: 'from-indigo-50 to-violet-50',
        };
      default:
        return {
          pill: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200',
          dot: 'bg-slate-500',
          border: 'border-l-slate-500',
          gradient: 'from-slate-50 to-slate-100',
        };
    }
  };

  // Export iCal (.ics) file for registered events or the selected day's events
  const handleExportIcs = (eventToExport?: CollegeEvent) => {
    const eventsToSync = eventToExport 
      ? [eventToExport] 
      : allEvents.filter(e => registrationMap.has(e.id));

    if (eventsToSync.length === 0) {
      alert('No registered events to export to calendar.');
      return;
    }

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//College Event Hub//Monthly Event Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ].join('\r\n') + '\r\n';

    eventsToSync.forEach(evt => {
      const reg = registrationMap.get(evt.id);
      const cleanDate = evt.date.replace(/-/g, '');
      const startDate = `${cleanDate}T090000Z`;
      const endDate = evt.endDate 
        ? `${evt.endDate.replace(/-/g, '')}T180000Z` 
        : `${cleanDate}T170000Z`;

      const description = `College: ${evt.collegeName}\\nCategory: ${evt.category}\\nVenue: ${evt.venue}\\nRegistration: ${reg ? `Confirmed (Ticket #${reg.ticketNumber})` : 'General Participant'}\\n\\n${evt.description}`;

      icsContent += [
        'BEGIN:VEVENT',
        `UID:${evt.id}-${Date.now()}@collegeeventhub.org`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        `SUMMARY:${evt.title}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${evt.venue}`,
        `STATUS:CONFIRMED`,
        'END:VEVENT',
      ].join('\r\n') + '\r\n';
    });

    icsContent += 'END:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = eventToExport 
      ? `${eventToExport.id}-calendar-invite.ics` 
      : 'college-registered-events.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Formatted date string reader (e.g., "Saturday, November 14, 2026")
  const formatReadableDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {
      // fallback
    }
    return dateStr;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Top Banner / Calendar Controls Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Month / Year Navigator */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {monthNames[currentMonth]} {currentYear}
                </h2>
                <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                  <button
                    onClick={prevMonth}
                    title="Previous Month"
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextMonth}
                    title="Next Month"
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Visualizing schedule and registered events for colleges & participants
              </p>
            </div>
          </div>

          {/* Quick Action Badges & Mode Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Quick semester jump buttons */}
            <button
              onClick={jumpToNovember2026}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Event Season (Nov '26)
            </button>

            <button
              onClick={jumpToToday}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              Today
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-medium">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  viewMode === 'month'
                    ? 'bg-white text-indigo-600 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Month Grid
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  viewMode === 'agenda'
                    ? 'bg-white text-indigo-600 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Agenda List
              </button>
            </div>

            {/* iCal Export */}
            <button
              onClick={() => handleExportIcs()}
              title="Export registered events to Apple Calendar / Google Calendar (.ics)"
              className="px-3 py-1.5 text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export .ics
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Toggle Registered Only button */}
            <button
              onClick={() => setShowRegisteredOnly(!showRegisteredOnly)}
              className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-all ${
                showRegisteredOnly
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
              }`}
            >
              <BookmarkCheck className={`w-3.5 h-3.5 ${showRegisteredOnly ? 'text-white' : 'text-emerald-600'}`} />
              <span>Registered Events Only</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                showRegisteredOnly ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {registrationMap.size}
              </span>
            </button>

            {/* Category Select */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-transparent text-slate-700 font-medium focus:outline-hidden"
              >
                <option value="All">All Categories</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Workshop">Workshop</option>
                <option value="Gaming">Gaming</option>
                <option value="Sports">Sports</option>
                <option value="Symposium">Symposium</option>
              </select>
            </div>

            {/* College Select */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCollegeId}
                onChange={e => setSelectedCollegeId(e.target.value)}
                className="bg-transparent text-slate-700 font-medium focus:outline-hidden max-w-[160px] truncate"
              >
                <option value="All">All Colleges</option>
                {colleges.map(c => (
                  <option key={c.id} value={c.id}>{c.shortName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
              <strong>{monthStats.totalInMonth}</strong> events this month
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <strong>{monthStats.registeredCount}</strong> registered this month
            </span>
          </div>
        </div>
      </div>

      {/* Main View: Grid vs Agenda */}
      {viewMode === 'month' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Monthly Grid */}
          <div className="lg:col-span-8 bg-white/90 backdrop-blur-xl rounded-2xl border border-white/60 p-4 sm:p-5 shadow-sm">
            
            {/* Day of week headers */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
              {weekDayNames.map((d, idx) => (
                <div 
                  key={d} 
                  className={`text-xs font-semibold py-1.5 rounded-lg ${
                    idx === 0 || idx === 6 ? 'text-rose-500/80 bg-rose-50/50' : 'text-slate-500 bg-slate-50'
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {calendarCells.map((cell, idx) => {
                const isSelected = cell.dateStr === selectedDateStr;
                const hasEvents = cell.events.length > 0;

                return (
                  <div
                    key={`${cell.dateStr}-${idx}`}
                    onClick={() => setSelectedDateStr(cell.dateStr)}
                    className={`min-h-[76px] sm:min-h-[96px] p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                      cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/60 opacity-60'
                    } ${
                      isSelected
                        ? 'ring-2 ring-indigo-600 border-indigo-400 bg-indigo-50/30 shadow-md'
                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/80'
                    } ${cell.isToday ? 'border-amber-400/80 bg-amber-50/20' : ''}`}
                  >
                    {/* Top bar of cell: Day number + Badges */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs sm:text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : cell.isToday
                            ? 'bg-amber-500 text-white'
                            : cell.isCurrentMonth
                            ? 'text-slate-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      {/* Registered Indicator Badge */}
                      {cell.hasRegisteredEvent && (
                        <span 
                          title="You have a registered event on this date!"
                          className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-1 py-0.2 rounded-md shadow-2xs"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          <span className="hidden sm:inline">Pass</span>
                        </span>
                      )}
                    </div>

                    {/* Events list within cell */}
                    <div className="mt-1 space-y-1 overflow-hidden">
                      {cell.events.slice(0, 2).map(evt => {
                        const isRegistered = registrationMap.has(evt.id);
                        const theme = getCategoryTheme(evt.category);

                        return (
                          <div
                            key={evt.id}
                            title={`${evt.title} (${evt.collegeName}) - ${evt.time}`}
                            className={`px-1.5 py-0.5 rounded text-[10px] truncate font-medium border flex items-center gap-1 transition-transform hover:scale-[1.02] ${
                              isRegistered
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                                : theme.pill
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isRegistered ? 'bg-emerald-500' : theme.dot}`} />
                            <span className="truncate">{evt.title}</span>
                          </div>
                        );
                      })}

                      {/* Over flow count if more than 2 events */}
                      {cell.events.length > 2 && (
                        <div className="text-[9px] text-slate-500 font-semibold pl-1">
                          +{cell.events.length - 2} more
                        </div>
                      )}
                    </div>

                    {/* Bottom dot indicator for mobile view */}
                    {hasEvents && (
                      <div className="flex sm:hidden justify-center items-center gap-0.5 pt-1">
                        {cell.events.slice(0, 3).map((e, dotIdx) => (
                          <span 
                            key={dotIdx}
                            className={`w-1 h-1 rounded-full ${
                              registrationMap.has(e.id) ? 'bg-emerald-500' : 'bg-indigo-400'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend underneath calendar */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="font-semibold text-emerald-800">Registered Event (With Pass)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <span>Hackathon</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span>Technical</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                  <span>Cultural</span>
                </span>
              </div>
              <div className="text-slate-400">
                Click any date cell to view schedule & registered passes
              </div>
            </div>
          </div>

          {/* Right Column: Selected Date Agenda & Details */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Selected Date Header Box */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/60 p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-indigo-600">
                    Day Agenda
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    {formatReadableDate(selectedDateStr)}
                  </h3>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg">
                  {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'Event' : 'Events'}
                </span>
              </div>

              {/* Events scheduled on this day */}
              {selectedDateEvents.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-600">No events scheduled on this day</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Try choosing another date like Nov 14, 18, 20, 22, 28 or Dec 5 to inspect events.
                  </p>
                  <button
                    onClick={jumpToNovember2026}
                    className="mt-3 px-3 py-1 text-xs font-semibold text-indigo-600 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors shadow-2xs"
                  >
                    Go to November 14
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[560px] overflow-y-auto pr-1">
                  {selectedDateEvents.map(evt => {
                    const registration = registrationMap.get(evt.id);
                    const isRegistered = !!registration;
                    const theme = getCategoryTheme(evt.category);

                    return (
                      <div
                        key={evt.id}
                        className={`rounded-xl border p-4 transition-all relative overflow-hidden bg-white hover:shadow-md ${
                          isRegistered
                            ? 'border-emerald-300 ring-1 ring-emerald-400/40'
                            : 'border-slate-200'
                        }`}
                      >
                        {/* Registered ribbon indicator */}
                        {isRegistered && (
                          <div className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-0.5 absolute top-0 right-0 rounded-bl-lg flex items-center gap-1 shadow-xs">
                            <CheckCircle2 className="w-3 h-3" />
                            REGISTERED
                          </div>
                        )}

                        {/* Category & Status */}
                        <div className="flex items-center gap-2 mb-2 pr-16">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${theme.pill}`}>
                            {evt.category}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {evt.fee === 0 ? 'Free Entry' : `₹${evt.fee}`}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 
                          onClick={() => onSelectEvent?.(evt.id)}
                          className="font-bold text-slate-900 text-sm leading-snug cursor-pointer hover:text-indigo-600 transition-colors"
                        >
                          {evt.title}
                        </h4>

                        {/* College */}
                        <p className="text-xs text-slate-600 mt-1 flex items-center gap-1 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{evt.collegeName}</span>
                        </p>

                        {/* Time & Venue */}
                        <div className="mt-2.5 pt-2.5 border-t border-slate-100 grid grid-cols-1 gap-1 text-xs text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{evt.time} {evt.endDate ? `(Until ${evt.endDate})` : ''}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{evt.venue}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="text-amber-700 font-medium">{evt.prizePool}</span>
                          </div>
                        </div>

                        {/* Registration Details (if user is registered) */}
                        {isRegistered && registration && (
                          <div className="mt-3 p-2.5 bg-emerald-50/80 rounded-lg border border-emerald-200 text-xs text-emerald-900 space-y-1">
                            <div className="flex items-center justify-between font-bold">
                              <span className="flex items-center gap-1">
                                <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                                Pass: {registration.ticketNumber}
                              </span>
                              <span className="uppercase text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.2 rounded">
                                {registration.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-emerald-800">
                              Participant: <strong>{registration.participantName}</strong> ({registration.department || 'Student'})
                            </div>
                            {registration.teamName && (
                              <div className="text-[11px] text-emerald-700">
                                Team: <strong>{registration.teamName}</strong>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="mt-3.5 flex items-center gap-2">
                          {isRegistered ? (
                            <>
                              <button
                                onClick={onOpenWalletPass}
                                className="flex-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                              >
                                <Ticket className="w-3.5 h-3.5" />
                                View Wallet Pass
                              </button>
                              <button
                                onClick={() => handleExportIcs(evt)}
                                title="Export to Calendar"
                                className="p-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => onRegisterEvent?.(evt.id)}
                                className="flex-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                              >
                                <Ticket className="w-3.5 h-3.5" />
                                Register Now
                              </button>
                              <button
                                onClick={() => onSelectEvent?.(evt.id)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                              >
                                Details
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Registered Pass Summary widget */}
            {userRegistrations.length > 0 && (
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      My Event Passes
                    </span>
                  </div>
                  <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                    {userRegistrations.length} Active
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  You have confirmed registrations for {userRegistrations.length} competitions with generated QR codes.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={onOpenWalletPass}
                    className="flex-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Open Apple Wallet Passes
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      ) : (
        /* Agenda View: Chronological list of events in the month */
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/60 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-lg">
              Chronological Agenda: {monthNames[currentMonth]} {currentYear}
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredEvents.length} events
            </span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No events matched the selected filters</p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedCollegeId('All');
                  setShowRegisteredOnly(false);
                }}
                className="mt-3 text-xs font-semibold text-indigo-600 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredEvents
                .slice()
                .sort((a, b) => a.date.localeCompare(b.date))
                .map(evt => {
                  const isRegistered = registrationMap.has(evt.id);
                  const reg = registrationMap.get(evt.id);
                  const theme = getCategoryTheme(evt.category);

                  return (
                    <div
                      key={evt.id}
                      className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 p-3 rounded-xl transition-colors"
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Date badge */}
                        <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center shrink-0">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            {monthNames[Number(evt.date.split('-')[1]) - 1]?.slice(0, 3)}
                          </span>
                          <span className="text-lg font-black text-slate-900 leading-none">
                            {Number(evt.date.split('-')[2])}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${theme.pill}`}>
                              {evt.category}
                            </span>
                            {isRegistered && (
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Registered (Ticket #{reg?.ticketNumber})
                              </span>
                            )}
                            <span className="text-xs text-slate-500 font-medium">
                              {evt.fee === 0 ? 'Free' : `₹${evt.fee}`}
                            </span>
                          </div>

                          <h4 
                            onClick={() => onSelectEvent?.(evt.id)}
                            className="font-bold text-slate-900 text-base hover:text-indigo-600 cursor-pointer transition-colors"
                          >
                            {evt.title}
                          </h4>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1 font-medium text-slate-700">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              {evt.collegeName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {evt.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {evt.venue}
                            </span>
                            <span className="flex items-center gap-1 text-amber-600 font-semibold">
                              <Trophy className="w-3.5 h-3.5 text-amber-500" />
                              {evt.prizePool}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        {isRegistered ? (
                          <>
                            <button
                              onClick={onOpenWalletPass}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                            >
                              <Ticket className="w-3.5 h-3.5" />
                              Wallet Pass
                            </button>
                            <button
                              onClick={() => handleExportIcs(evt)}
                              className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                              title="Export .ics"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => onRegisterEvent?.(evt.id)}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                            >
                              <Ticket className="w-3.5 h-3.5" />
                              Register
                            </button>
                            <button
                              onClick={() => onSelectEvent?.(evt.id)}
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors"
                            >
                              Details
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
