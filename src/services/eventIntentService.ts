import { apiService } from './apiService';
import { CollegeEvent, Registration, User } from '../types';
import { AgenticAction, ChatAction, ChatMessage } from './chatService';

export type AvailabilityStatus =
  | 'AVAILABLE'
  | 'ALREADY_REGISTERED'
  | 'CAPACITY_FULL'
  | 'DEADLINE_PASSED'
  | 'EVENT_CANCELLED'
  | 'EVENT_NOT_FOUND';

export interface ExtractedEventIntent {
  rawCommand: string;
  isRegistrationIntent: boolean;
  extractedEventName?: string;
  matchedEvent?: CollegeEvent;
  matchedCategory?: string;
  matchedCollege?: string;
  confidence: number; // 0 to 100
  matchReason?: string;
}

export interface EventAvailabilityCheck {
  status: AvailabilityStatus;
  isAvailable: boolean;
  event?: CollegeEvent;
  remainingSeats?: number;
  totalSeats?: number;
  deadline?: string;
  isDeadlinePassed?: boolean;
  fee?: number;
  existingRegistration?: Registration;
  message: string;
}

export interface VoiceRegistrationResult {
  success: boolean;
  intentDetected: boolean;
  event?: CollegeEvent;
  extractedEventName?: string;
  availability: EventAvailabilityCheck;
  registration?: Registration;
  feedbackMessage: string;
  spokenMessage: string;
  agenticAction?: AgenticAction;
  suggestedActions: ChatAction[];
}

/**
 * Natural language aliases and keyword mapping for colleges and events
 */
const COLLEGE_ALIASES: Record<string, string[]> = {
  'clg-1': ['iit madras', 'iitm', 'iit chennai', 'iit', 'shaastra', 'saarang', 'cfi'],
  'clg-2': ['nit trichy', 'nitt', 'nit', 'trichy', 'pragyan', 'festember', 'spardha'],
  'clg-3': ['anna university', 'ceg', 'anna univ', 'guindy', 'kurukshetra'],
  'clg-4': ['bits pilani', 'bits', 'pilani', 'goa', 'vortex', 'waves', 'oasis'],
  'clg-5': ['psg tech', 'psg', 'psgct', 'coimbatore', 'kriya'],
  'clg-6': ['iit bombay', 'iitb', 'bombay', 'powai', 'techfest', 'mood indigo'],
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Hackathon: ['hackathon', 'hack', 'hacknova', 'coding sprint', 'ideathon', 'makeathon', '36 hour', '48 hour', 'devfest'],
  Technical: ['technical', 'tech', 'coding', 'codesprint', 'robowars', 'robotics', 'robot', 'ctf', 'cybersecurity', 'ai', 'iot', 'hardware'],
  Cultural: ['cultural', 'cult', 'music', 'band', 'battle of the bands', 'dance', 'choreo', 'singing', 'concert'],
  Gaming: ['gaming', 'esports', 'lan', 'valorant', 'bgmi', 'fifa', 'fc 26', 'tournament', 'game'],
  Workshop: ['workshop', 'masterclass', 'bootcamp', 'training', 'hands on', 'ev', 'battery', 'electric vehicle'],
  Sports: ['sports', 'tournament', 'cup', 'basketball', 'futsal', 'football', 'cricket', 'athletics'],
  Symposium: ['symposium', 'conference', 'paper presentation', 'aerospace', 'drone', 'space', 'cubesat', 'research'],
};

/**
 * 1. Parse Voice / Natural Language Command to Extract Event Names & Match Platform Catalog
 */
export function parseVoiceRegistrationIntent(
  rawCommand: string,
  events: CollegeEvent[],
  currentUser?: User | null
): ExtractedEventIntent {
  const q = rawCommand.toLowerCase().trim();

  // Determine if user has registration/booking intent
  const registrationTriggers = [
    'book',
    'register',
    'enroll',
    'sign up',
    'signup',
    'reserve',
    'get pass',
    'get ticket',
    'grab pass',
    'take ticket',
    'join',
    'participate in',
    'enter',
    'want to attend',
    'buy ticket',
    'confirm my slot',
    'reserve a seat',
    'reserve my spot',
    'book me for',
  ];

  // Disqualify purely informational inquiries
  const isInformationalQuery =
    q.startsWith('how to') ||
    q.startsWith('how do i') ||
    q.startsWith('where to') ||
    q.startsWith('what is the fee') ||
    q.startsWith('who is organizing') ||
    q.includes('tell me about') ||
    q.includes('what are the rules');

  const hasIntentTrigger = registrationTriggers.some(trigger => q.includes(trigger));
  const isRegistrationIntent = hasIntentTrigger && !isInformationalQuery;

  if (!isRegistrationIntent) {
    return {
      rawCommand,
      isRegistrationIntent: false,
      confidence: 0,
      matchReason: 'No event registration intent detected in command',
    };
  }

  // Attempt to isolate extracted candidate event phrase
  let extractedEventName: string | undefined;
  for (const trigger of registrationTriggers) {
    const idx = q.indexOf(trigger);
    if (idx !== -1) {
      let rest = q.slice(idx + trigger.length).trim();
      // Strip common connecting words
      rest = rest.replace(/^(for|in|to|the|a|an|my|me for|me in|ticket for|pass for|seat for)\s+/i, '').trim();
      rest = rest.replace(/\s+(please|now|for me|right now|programmatically|immediately)$/i, '').trim();
      if (rest.length > 2) {
        extractedEventName = rest;
        break;
      }
    }
  }

  if (!extractedEventName) {
    extractedEventName = rawCommand;
  }

  // Score candidate events
  let bestEvent: CollegeEvent | undefined;
  let highestScore = -1;
  let bestReason = '';
  let matchedCategory: string | undefined;
  let matchedCollege: string | undefined;

  for (const event of events) {
    let score = 0;
    const reasons: string[] = [];

    const titleLower = event.title.toLowerCase();
    const collegeLower = event.collegeName.toLowerCase();
    const categoryLower = event.category.toLowerCase();
    const venueLower = event.venue.toLowerCase();

    // 1. Direct exact title or partial title containment
    if (q.includes(titleLower) || (extractedEventName && extractedEventName.includes(titleLower))) {
      score += 100;
      reasons.push('exact title match');
    }

    // 2. Distinctive title keywords
    const distinctiveTitleWords = event.title
      .toLowerCase()
      .split(/[\s:,\-()]+/)
      .filter(w => w.length > 3 && !['2026', 'national', 'international', 'collegiate'].includes(w));

    let matchedWordCount = 0;
    for (const word of distinctiveTitleWords) {
      if (q.includes(word)) {
        matchedWordCount++;
        score += 25;
        reasons.push(`title word "${word}"`);
      }
    }

    // 3. College name & alias matches
    const collegeAliases = COLLEGE_ALIASES[event.collegeId] || [];
    const matchesCollege =
      q.includes(collegeLower) ||
      collegeAliases.some(alias => q.includes(alias));

    if (matchesCollege) {
      score += 30;
      matchedCollege = event.collegeName;
      reasons.push(`host campus "${event.collegeName}"`);
    }

    // 4. Category matching
    const catKeywords = CATEGORY_KEYWORDS[event.category] || [event.category.toLowerCase()];
    const matchesCategory =
      q.includes(categoryLower) ||
      catKeywords.some(k => q.includes(k));

    if (matchesCategory) {
      score += 25;
      matchedCategory = event.category;
      reasons.push(`category "${event.category}"`);
    }

    // 5. Category + College combo boost (e.g. "hackathon at IIT" or "robowars at NIT")
    if (matchesCollege && matchesCategory) {
      score += 35;
      reasons.push('college + category synergy');
    }

    // 6. Tags match
    for (const tag of event.tags) {
      if (q.includes(tag.toLowerCase())) {
        score += 15;
        reasons.push(`tag "${tag}"`);
      }
    }

    // 7. Venue match
    if (venueLower && q.includes(venueLower)) {
      score += 20;
      reasons.push(`venue "${event.venue}"`);
    }

    if (score > highestScore) {
      highestScore = score;
      bestEvent = event;
      bestReason = reasons.join(', ');
    }
  }

  // If no strong match found but it's a general request like "book hackathon",
  // default to the flagship Hackathon
  if (!bestEvent || highestScore < 20) {
    if (q.includes('hackathon') || q.includes('hack') || q.includes('iit')) {
      bestEvent = events.find(e => e.category === 'Hackathon') || events[0];
      highestScore = 35;
      bestReason = 'default flagship hackathon heuristic';
    } else if (events.length > 0) {
      // Pick first event if user says "book event"
      bestEvent = events[0];
      highestScore = 15;
      bestReason = 'primary event default';
    }
  }

  return {
    rawCommand,
    isRegistrationIntent: true,
    extractedEventName,
    matchedEvent: bestEvent,
    matchedCategory,
    matchedCollege,
    confidence: Math.min(100, highestScore),
    matchReason: bestReason || 'Identified via natural language parser',
  };
}

/**
 * 2. Validate Event Availability
 * Checks capacity, registration deadline, existing user registrations, and event status
 */
export function validateEventAvailability(
  event: CollegeEvent,
  currentUser?: User | null
): EventAvailabilityCheck {
  // A. Check if event is cancelled or completed
  if (event.status === 'cancelled') {
    return {
      status: 'EVENT_CANCELLED',
      isAvailable: false,
      event,
      message: `Registration is unavailable because "${event.title}" has been cancelled by the organizers.`,
    };
  }

  if (event.status === 'completed') {
    return {
      status: 'EVENT_CANCELLED',
      isAvailable: false,
      event,
      message: `Registration is closed because "${event.title}" has already concluded.`,
    };
  }

  // B. Check registration deadline
  if (event.registrationDeadline) {
    const deadlineDate = new Date(event.registrationDeadline);
    const now = new Date();
    // Only check if deadline is a valid date and in the past
    if (!isNaN(deadlineDate.getTime()) && deadlineDate < now) {
      const formattedDeadline = deadlineDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      return {
        status: 'DEADLINE_PASSED',
        isAvailable: false,
        event,
        deadline: event.registrationDeadline,
        isDeadlinePassed: true,
        message: `Registration deadline for "${event.title}" expired on ${formattedDeadline}. Admissions are currently locked.`,
      };
    }
  }

  // C. Check user duplicate registration
  const userEmail = currentUser?.email || 'kabilanfree@gmail.com';
  const existingRegistrations = apiService.getRegistrations({
    eventId: event.id,
    studentEmail: userEmail,
  });

  if (existingRegistrations && existingRegistrations.length > 0) {
    const existing = existingRegistrations[0];
    return {
      status: 'ALREADY_REGISTERED',
      isAvailable: false,
      event,
      existingRegistration: existing,
      fee: event.fee,
      message: `You are already registered for "${event.title}" with Ticket #${existing.ticketNumber}. Your holographic pass is active in your Apple Wallet!`,
    };
  }

  // D. Check capacity / remaining seats
  const currentCount = event.registrationCount || 0;
  const maxCapacity = event.maxParticipants || 100;
  const remainingSeats = Math.max(0, maxCapacity - currentCount);

  if (remainingSeats <= 0) {
    return {
      status: 'CAPACITY_FULL',
      isAvailable: false,
      event,
      remainingSeats: 0,
      totalSeats: maxCapacity,
      message: `"${event.title}" has reached full capacity (${currentCount}/${maxCapacity} seats filled). Registration is currently waitlisted.`,
    };
  }

  // E. Valid & Available!
  return {
    status: 'AVAILABLE',
    isAvailable: true,
    event,
    remainingSeats,
    totalSeats: maxCapacity,
    deadline: event.registrationDeadline,
    fee: event.fee,
    message: `Spot available! ${remainingSeats} out of ${maxCapacity} seats open for "${event.title}".`,
  };
}

/**
 * 3. Programmatically Trigger Registration
 * Persists registration record, creates digital holographic ticket, and notifies app ecosystem
 */
export function executeProgrammaticRegistration(
  event: CollegeEvent,
  currentUser?: User | null,
  options?: {
    customPhone?: string;
    teamName?: string;
  }
): Registration {
  const student = currentUser || {
    id: 'usr-1',
    name: 'Kabilan Free',
    email: 'kabilanfree@gmail.com',
    role: 'student' as const,
    collegeName: 'Anna University, Chennai',
  };

  const isTeam = event.teamSize !== 'Individual';
  const defaultTeamName = options?.teamName || `${student.name.split(' ')[0]}'s Innovators`;

  // Generate team roster if team event
  const teamMembers = isTeam
    ? [
        {
          name: student.name,
          email: student.email,
          rollNumber: '2023CS1042',
          college: student.collegeName || event.collegeName,
        },
        {
          name: 'Priya Sharma',
          email: 'priya.s@campus.edu',
          rollNumber: '2023CS1088',
          college: student.collegeName || event.collegeName,
        },
      ]
    : undefined;

  const newReg = apiService.createRegistration({
    eventId: event.id,
    eventTitle: event.title,
    collegeName: event.collegeName,
    participantName: student.name,
    participantEmail: student.email,
    participantPhone: options?.customPhone || '+91 98765 43210',
    participantCollege: student.collegeName || 'Anna University, Chennai',
    rollNumber: '2023CS1042',
    department: 'Computer Science & Engineering',
    yearOfStudy: '3rd Year',
    teamName: isTeam ? defaultTeamName : undefined,
    teamMembers,
  });

  // Global window event broadcast so Dynamic Island, Calendar, and Passes refresh live
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('registration-updated', { detail: newReg }));
  }

  return newReg;
}

/**
 * 4. Master Orchestration Function
 * Parses voice command, validates availability, and triggers registration programmatically.
 */
export function processVoiceRegistrationCommand(
  voiceCommand: string,
  options?: {
    currentUser?: User | null;
    events?: CollegeEvent[];
  }
): VoiceRegistrationResult {
  const events = options?.events || apiService.getEvents();
  const currentUser = options?.currentUser !== undefined ? options.currentUser : apiService.getCurrentUser();

  // Step 1: Parse natural language intent & extract event name
  const intent = parseVoiceRegistrationIntent(voiceCommand, events, currentUser);

  // If no registration intent detected
  if (!intent.isRegistrationIntent || !intent.matchedEvent) {
    return {
      success: false,
      intentDetected: false,
      availability: {
        status: 'EVENT_NOT_FOUND',
        isAvailable: false,
        message: 'No event registration intent could be matched with confidence.',
      },
      feedbackMessage: "I couldn't identify which event you'd like to book. You can say: \"Book the hackathon at IIT\" or \"Register for RoboWars at NIT Trichy\".",
      spokenMessage: "I couldn't identify the event you'd like to book. Please specify the event name or campus.",
      suggestedActions: [
        { label: '⚡ Book Shaastra Hackathon', action: 'register_event', target: 'evt-101' },
        { label: '🤖 Book RoboWars at NIT', action: 'register_event', target: 'evt-102' },
        { label: '💻 Book CodeSprint', action: 'register_event', target: 'evt-103' },
      ],
    };
  }

  const targetEvent = intent.matchedEvent;

  // Step 2: Validate availability
  const availability = validateEventAvailability(targetEvent, currentUser);

  // Case A: User already registered
  if (availability.status === 'ALREADY_REGISTERED' && availability.existingRegistration) {
    const reg = availability.existingRegistration;
    const feedbackMessage =
      `🎫 **You are already registered for this event!**\n\n` +
      `You already have an active pass for **${targetEvent.title}** at **${targetEvent.collegeName}**.\n\n` +
      `• **Ticket ID:** \`${reg.ticketNumber}\`\n` +
      `• **Participant:** ${reg.participantName} (${reg.participantEmail})\n` +
      `• **Status:** ${reg.status.toUpperCase()} ✅\n` +
      `• **QR Pass:** \`${reg.qrCodeId}\`\n\n` +
      `Your holographic pass is already stored in your Apple Wallet and plotted on your calendar!`;

    const spokenMessage = `You are already registered for ${targetEvent.title}. Your pass number is ${reg.ticketNumber}.`;

    const suggestedActions: ChatAction[] = [
      { label: '🎫 Open Apple Wallet Pass', action: 'open_modal', target: 'wallet_pass' },
      { label: '📅 View on Calendar', action: 'navigate', target: 'calendar' },
      { label: '🔍 Event Details', action: 'view_event', target: targetEvent.id },
    ];

    return {
      success: true, // Known state
      intentDetected: true,
      event: targetEvent,
      extractedEventName: intent.extractedEventName,
      availability,
      registration: reg,
      feedbackMessage,
      spokenMessage,
      suggestedActions,
      agenticAction: {
        type: 'book_event',
        status: 'executed',
        eventId: targetEvent.id,
        eventTitle: targetEvent.title,
        collegeName: targetEvent.collegeName,
        registration: reg,
        badge: 'PASS ALREADY ACTIVE',
        details: `Active registration found: Ticket #${reg.ticketNumber}`,
      },
    };
  }

  // Case B: Capacity full or deadline passed
  if (!availability.isAvailable) {
    const altEvents = events
      .filter(e => e.id !== targetEvent.id && (e.category === targetEvent.category || e.collegeId === targetEvent.collegeId))
      .slice(0, 2);

    const feedbackMessage =
      `⚠️ **Event Registration Unavailable**\n\n` +
      `${availability.message}\n\n` +
      `Here are recommended open alternatives:\n` +
      altEvents.map(e => `• **${e.title}** (${e.collegeName}) — ${e.maxParticipants - e.registrationCount} seats left`).join('\n');

    const spokenMessage = `Registration for ${targetEvent.title} is currently unavailable. ${availability.message}`;

    const suggestedActions: ChatAction[] = altEvents.map(e => ({
      label: `Book ${e.title.slice(0, 20)}...`,
      action: 'register_event',
      target: e.id,
    }));
    suggestedActions.push({ label: '📅 Browse Calendar', action: 'navigate', target: 'calendar' });

    return {
      success: false,
      intentDetected: true,
      event: targetEvent,
      extractedEventName: intent.extractedEventName,
      availability,
      feedbackMessage,
      spokenMessage,
      suggestedActions,
    };
  }

  // Step 3: Trigger registration process programmatically
  const newRegistration = executeProgrammaticRegistration(targetEvent, currentUser);

  const feeText = targetEvent.fee === 0 ? 'Free Entry (₹0)' : `₹${targetEvent.fee}`;
  const seatsRemainingAfter = Math.max(0, (availability.remainingSeats || 1) - 1);

  const feedbackMessage =
    `⚡ **Agentic Action Executed: Successfully Registered!**\n\n` +
    `I've parsed your voice intent and autonomously reserved your pass for **${targetEvent.title}** at **${targetEvent.collegeName}**!\n\n` +
    `• **Ticket ID:** \`${newRegistration.ticketNumber}\`\n` +
    `• **Participant:** ${newRegistration.participantName} (${newRegistration.participantEmail})\n` +
    `• **Category & Fee:** ${targetEvent.category} • ${feeText}\n` +
    `• **Venue:** ${targetEvent.venue}\n` +
    `• **Dates:** ${targetEvent.date} at ${targetEvent.time}\n` +
    `• **Team:** ${newRegistration.teamName || 'Solo Entry'}\n` +
    `• **Availability Left:** ${seatsRemainingAfter} seats remaining\n` +
    `• **Status:** ${newRegistration.status.toUpperCase()} ✅\n\n` +
    `Your holographic digital pass is now stored in your Apple Wallet and synchronized across your monthly event calendar!`;

  const spokenMessage =
    `Success! You have been programmatically registered for ${targetEvent.title} at ${targetEvent.collegeName}. Your ticket pass number is ${newRegistration.ticketNumber}.`;

  const agenticAction: AgenticAction = {
    type: 'book_event',
    status: 'executed',
    eventId: targetEvent.id,
    eventTitle: targetEvent.title,
    collegeName: targetEvent.collegeName,
    registration: newRegistration,
    badge: 'VOICE INTENT REGISTERED',
    details: `Autonomously reserved ${targetEvent.title} at ${targetEvent.collegeName}. Ticket #${newRegistration.ticketNumber}.`,
  };

  const suggestedActions: ChatAction[] = [
    { label: '🎫 View Apple Wallet Pass', action: 'open_modal', target: 'wallet_pass' },
    { label: '📅 View on Calendar', action: 'navigate', target: 'calendar' },
    { label: '🔍 Event Details', action: 'view_event', target: targetEvent.id },
  ];

  return {
    success: true,
    intentDetected: true,
    event: targetEvent,
    extractedEventName: intent.extractedEventName,
    availability,
    registration: newRegistration,
    feedbackMessage,
    spokenMessage,
    agenticAction,
    suggestedActions,
  };
}
