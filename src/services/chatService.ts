import { apiService } from './apiService';
import { CollegeEvent, Registration, User } from '../types';
import { processVoiceRegistrationCommand } from './eventIntentService';

export interface ChatAction {
  label: string;
  action: 'navigate' | 'view_event' | 'register_event' | 'filter_events' | 'open_modal' | 'switch_user';
  target?: string;
  payload?: any;
}

export interface AgenticAction {
  type: 'book_event' | 'navigate' | 'open_modal' | 'filter_events' | 'switch_user';
  status: 'pending' | 'executed' | 'cancelled';
  eventId?: string;
  eventTitle?: string;
  collegeName?: string;
  view?: string;
  modal?: 'wallet_pass' | 'java_code' | 'api_tester';
  role?: 'ROLE_ADMIN' | 'ROLE_ORGANIZER' | 'ROLE_PARTICIPANT';
  registration?: Registration;
  details?: string;
  badge?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  model?: string;
  suggestedActions?: ChatAction[];
  agenticAction?: AgenticAction;
  relatedEvents?: Array<{
    id: string;
    title: string;
    category: string;
    date: string;
    collegeName: string;
    fee: number;
    prizePool: string;
  }>;
}

export interface ExecutionContext {
  currentUser: User | null;
  onNavigate: (view: string, params?: any) => void;
  onSelectEvent: (id: string) => void;
  onOpenWalletPasses: () => void;
  onOpenJavaModal: () => void;
  onOpenApiTester?: () => void;
  onUserChange?: (user: User) => void;
}

const STORAGE_KEY_CHAT = 'ceh_ai_chat_history_v1';

export const chatService = {
  // Load conversation from storage
  getHistory(): ChatMessage[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY_CHAT);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading chat history:', e);
      return [];
    }
  },

  // Save history to storage
  saveHistory(messages: ChatMessage[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(messages.slice(-50)));
    } catch (e) {
      console.error('Error saving chat history:', e);
    }
  },

  // Clear chat history
  clearHistory(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY_CHAT);
    } catch (e) {
      console.error('Error clearing chat history:', e);
    }
  },

  // Execute Agentic Action on the platform
  executeAgenticAction(action: AgenticAction, ctx: ExecutionContext): boolean {
    try {
      switch (action.type) {
        case 'book_event': {
          if (!action.eventId) return false;
          const event = apiService.getEvents().find(e => e.id === action.eventId);
          if (!event) return false;

          const student = ctx.currentUser || {
            id: 'usr-guest',
            name: 'Alex Chen',
            email: 'alex.chen@iitm.ac.in',
            role: 'student' as const,
            collegeName: 'IIT Madras',
          };

          const newReg = apiService.createRegistration({
            eventId: event.id,
            eventTitle: event.title,
            collegeName: event.collegeName,
            participantName: student.name,
            participantEmail: student.email,
            participantPhone: '+91 98765 43210',
            participantCollege: student.collegeName || event.collegeName,
            rollNumber: '2024CS' + Math.floor(1000 + Math.random() * 9000),
            department: 'Computer Science & Engineering',
            yearOfStudy: '3rd Year',
            teamName: 'Team Mavericks',
            teamMembers: [
              { name: student.name, email: student.email, rollNumber: '2024CS101', college: event.collegeName },
              { name: 'Priya Sharma', email: 'priya.s@campus.edu', rollNumber: '2024CS102', college: event.collegeName },
            ],
          });

          action.status = 'executed';
          action.registration = newReg;

          // Dispatch update event so other views refresh live
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('registration-updated', { detail: newReg }));
          }
          return true;
        }

        case 'navigate': {
          if (!action.view) return false;
          ctx.onNavigate(action.view, { eventId: action.eventId });
          action.status = 'executed';
          return true;
        }

        case 'open_modal': {
          if (action.modal === 'wallet_pass') {
            ctx.onOpenWalletPasses();
            action.status = 'executed';
            return true;
          } else if (action.modal === 'java_code') {
            ctx.onOpenJavaModal();
            action.status = 'executed';
            return true;
          } else if (action.modal === 'api_tester' && ctx.onOpenApiTester) {
            ctx.onOpenApiTester();
            action.status = 'executed';
            return true;
          }
          return false;
        }

        case 'switch_user': {
          if (!action.role || !ctx.onUserChange) return false;
          const users = apiService.getAvailableUsers();
          const targetRole = action.role === 'ROLE_ADMIN' ? 'admin' : action.role === 'ROLE_ORGANIZER' ? 'organizer' : 'student';
          const target = users.find(u => u.role === targetRole) || users[0];
          apiService.setCurrentUser(target);
          ctx.onUserChange(target);
          action.status = 'executed';
          return true;
        }

        default:
          return false;
      }
    } catch (err) {
      console.error('Failed to execute agentic action:', err);
      return false;
    }
  },

  // Send message to backend Gemini API with contextual data & agentic parser
  async sendMessage(
    userMessage: string,
    history: ChatMessage[],
    currentUser?: User | null
  ): Promise<ChatMessage> {
    const events = apiService.getEvents();
    const colleges = apiService.getColleges();
    const userRegistrations = currentUser
      ? apiService.getRegistrations({ studentEmail: currentUser.email })
      : apiService.getRegistrations().slice(0, 3);

    // Prepare client context
    const context = {
      currentUser,
      userRegistrations,
      eventsSummary: events.map(e => ({
        id: e.id,
        title: e.title,
        date: e.date,
        college: e.collegeName,
        fee: e.fee,
        prize: e.prizePool,
        category: e.category,
      })),
      collegesSummary: colleges.map(c => ({
        id: c.id,
        name: c.name,
        shortName: c.shortName,
        location: c.location,
      })),
    };

    // Check for proactive agentic booking intent first
    const agenticAction = this.detectAgenticIntent(userMessage, events, currentUser);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history: history.slice(-6).map(h => ({
            sender: h.sender,
            text: h.text,
          })),
          context,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();

      const mergedAction = agenticAction || data.agenticAction;

      return {
        id: 'msg-' + Date.now(),
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toISOString(),
        model: data.model || 'Gemini 3.8 Flash',
        suggestedActions: data.suggestedActions || [],
        agenticAction: mergedAction,
        relatedEvents: data.relatedEvents || [],
      };
    } catch (error) {
      console.warn('Backend /api/chat error, generating smart client response:', error);
      // Client-side fallback engine to guarantee 100% availability
      return this.generateSmartClientFallback(userMessage, events, userRegistrations, currentUser, agenticAction);
    }
  },

  // Autonomous Agentic Intent Detector
  detectAgenticIntent(
    query: string,
    events: CollegeEvent[],
    currentUser?: User | null
  ): AgenticAction | undefined {
    const q = query.toLowerCase().trim();

    // 1. Booking / Registration intent using natural language extraction and availability validator
    const isBookingQuery =
      (q.includes('book') || q.includes('register') || q.includes('enroll') || q.includes('sign up') || q.includes('reserve') || q.includes('ticket')) &&
      !q.includes('how to register') &&
      !q.includes('where to register') &&
      !q.includes('can i register');

    if (isBookingQuery) {
      const result = processVoiceRegistrationCommand(query, { currentUser, events });
      if (result.intentDetected && result.agenticAction) {
        return result.agenticAction;
      }
    }

    // 2. Navigation intent: Calendar
    if (q.includes('open calendar') || q.includes('show calendar') || q.includes('go to calendar') || q.includes('monthly calendar')) {
      return {
        type: 'navigate',
        status: 'executed',
        view: 'calendar',
        badge: 'VOICE NAVIGATION',
        details: 'Navigating to the Interactive Monthly Calendar View.',
      };
    }

    // 3. Navigation intent: Events
    if (q.includes('open events') || q.includes('show events') || q.includes('browse events') || q.includes('all events')) {
      return {
        type: 'navigate',
        status: 'executed',
        view: 'events',
        badge: 'VOICE NAVIGATION',
        details: 'Opening Flagship Events Directory.',
      };
    }

    // 4. Modal intent: Wallet Pass / Tickets
    if (q.includes('open ticket') || q.includes('show ticket') || q.includes('open pass') || q.includes('my pass') || q.includes('apple wallet')) {
      return {
        type: 'open_modal',
        status: 'executed',
        modal: 'wallet_pass',
        badge: 'MODAL ACTIVATED',
        details: 'Launching Holographic Apple Wallet Pass Viewer.',
      };
    }

    // 5. Modal intent: Java Backend
    if (q.includes('unlock java') || q.includes('open java') || q.includes('java code') || q.includes('backend code') || q.includes('spring boot')) {
      return {
        type: 'open_modal',
        status: 'executed',
        modal: 'java_code',
        badge: 'SECURITY CLEARANCE',
        details: 'Opening Java Spring Boot Architecture & RBAC Explorer.',
      };
    }

    // 6. Modal intent: API Tester
    if (q.includes('api tester') || q.includes('test api') || q.includes('rest api')) {
      return {
        type: 'open_modal',
        status: 'executed',
        modal: 'api_tester',
        badge: 'DEV TOOLS',
        details: 'Opening Interactive REST API Testing Console.',
      };
    }

    // 7. Role switch intent
    if (q.includes('switch to admin') || q.includes('become admin') || q.includes('admin mode')) {
      return {
        type: 'switch_user',
        status: 'executed',
        role: 'ROLE_ADMIN',
        badge: 'ROLE SWITCH',
        details: 'Active role transitioned to ROLE_ADMIN with full backend clearance.',
      };
    } else if (q.includes('switch to organizer') || q.includes('become organizer')) {
      return {
        type: 'switch_user',
        status: 'executed',
        role: 'ROLE_ORGANIZER',
        badge: 'ROLE SWITCH',
        details: 'Active role transitioned to ROLE_ORGANIZER.',
      };
    }

    return undefined;
  },

  // Smart local client-side fallback
  generateSmartClientFallback(
    query: string,
    events: CollegeEvent[],
    userRegistrations: Registration[],
    currentUser?: User | null,
    agenticAction?: AgenticAction
  ): ChatMessage {
    const q = query.toLowerCase();
    let text = '';
    const suggestedActions: ChatAction[] = [];

    // If an agentic action was executed (e.g. booked hackathon)
    if (agenticAction && agenticAction.type === 'book_event' && agenticAction.registration) {
      const reg = agenticAction.registration;
      text = `⚡ **Agentic Action Executed: Successfully Booked Event!**\n\n` +
        `I've autonomously reserved your spot for **${agenticAction.eventTitle}** at **${agenticAction.collegeName}**.\n\n` +
        `• **Ticket ID:** \`${reg.ticketNumber}\`\n` +
        `• **Participant:** ${reg.participantName} (${reg.participantEmail})\n` +
        `• **Team:** ${reg.teamName || 'Solo Entry'}\n` +
        `• **Status:** ${reg.status.toUpperCase()} ✅\n` +
        `• **QR Pass ID:** \`${reg.qrCodeId}\`\n\n` +
        `Your holographic pass is now loaded in your Apple Wallet and plotted on your November Event Calendar!`;

      suggestedActions.push({ label: 'Open Apple Wallet Pass', action: 'open_modal', target: 'wallet_pass' });
      suggestedActions.push({ label: 'View on Calendar', action: 'navigate', target: 'calendar' });
      suggestedActions.push({ label: 'Event Details', action: 'view_event', target: agenticAction.eventId });
    } else if (agenticAction && agenticAction.type === 'navigate' && agenticAction.view === 'calendar') {
      text = `⚡ **Agentic Action Executed:** Navigating to the **Monthly Calendar View**.\n\nYou can inspect all November & December 2026 events, view your registered day badges, and export to Google Calendar!`;
      suggestedActions.push({ label: 'Open Calendar', action: 'navigate', target: 'calendar' });
      suggestedActions.push({ label: 'Explore Events', action: 'navigate', target: 'events' });
    } else if (agenticAction && agenticAction.type === 'open_modal' && agenticAction.modal === 'wallet_pass') {
      text = `⚡ **Agentic Action Executed:** Opening your **Holographic Apple Wallet Passes** with NFC chips and dynamic QR codes!`;
      suggestedActions.push({ label: 'View Wallet Passes', action: 'open_modal', target: 'wallet_pass' });
    } else if (q.includes('hackathon') || q.includes('hacknova') || q.includes('coding')) {
      text = `🚀 **Hackathons & Coding Competitions Available:**\n\n` +
        `• **HackNova 2026** (IIT Madras) — 36-Hr Flagship Hackathon\n` +
        `  📅 Nov 14–16, 2026 | 🏆 ₹2,50,000 Prize | 🎟️ ₹499 Fee\n\n` +
        `• **Kurukshetra Coding Olympiad** (Anna University) — Algorithmic sprint\n` +
        `  📅 Nov 27–28, 2026 | 🏆 ₹75,000 Prize | 🎟️ Free Entry (₹0)\n\n` +
        `• **Global CleanTech Ideathon** (UC Berkeley) — Sustainable tech hack\n` +
        `  📅 Dec 12–14, 2026 | 🏆 $5,000 USD Prize Pool\n\n` +
        `Want me to register you right now? Simply say: *"Book the hackathon at IIT"*!`;

      suggestedActions.push({ label: 'Book HackNova Now', action: 'register_event', target: 'evt-1' });
      suggestedActions.push({ label: 'View HackNova 2026', action: 'view_event', target: 'evt-1' });
      suggestedActions.push({ label: 'Browse All Events', action: 'navigate', target: 'events' });
    } else if (q.includes('pass') || q.includes('ticket') || q.includes('my registration') || q.includes('registered')) {
      const activeRegs = apiService.getRegistrations();
      if (activeRegs.length > 0) {
        text = `🎫 **You have ${activeRegs.length} Registered Event Pass(es):**\n\n`;
        activeRegs.slice(0, 3).forEach((reg, i) => {
          text += `${i + 1}. **${reg.eventTitle}**\n` +
            `   - **Pass #:** \`${reg.ticketNumber}\`\n` +
            `   - **Status:** ${reg.status.toUpperCase()} ✅\n` +
            `   - **Venue/College:** ${reg.collegeName}\n` +
            `   - **Team:** ${reg.teamName || 'Solo Entry'}\n\n`;
        });
        text += `Would you like to open your Holographic Apple Wallet passes or view them on the monthly calendar?`;
        suggestedActions.push({ label: 'Open Apple Wallet Pass', action: 'open_modal', target: 'wallet_pass' });
        suggestedActions.push({ label: 'View on Calendar', action: 'navigate', target: 'calendar' });
      } else {
        text = `🎫 You haven't registered for any events yet. Check out upcoming flagship events like **HackNova 2026** or **Kurukshetra Coding Olympiad** to grab your instant pass!`;
        suggestedActions.push({ label: 'Explore Events', action: 'navigate', target: 'events' });
      }
    } else if (q.includes('calendar') || q.includes('november') || q.includes('schedule') || q.includes('date')) {
      text = `📅 **Event Hub Calendar Highlights for November 2026:**\n\n` +
        `• **Nov 08-09:** AI & Quantum Computing Summit (Stanford)\n` +
        `• **Nov 14-16:** HackNova 2026 (IIT Madras)\n` +
        `• **Nov 15-16:** DesignVerse UX/UI Jam (BITS Pilani)\n` +
        `• **Nov 18:** CyberShield CTF (MIT Cambridge)\n` +
        `• **Nov 20-21:** RoboSprint Grand Prix (NIT Trichy)\n` +
        `• **Nov 22-23:** FinTech Disruption Challenge (NUS Singapore)\n` +
        `• **Nov 27-28:** Kurukshetra Coding Olympiad (Anna University)\n\n` +
        `Say *"Open calendar"* or click below to launch the Monthly Calendar View!`;
      suggestedActions.push({ label: 'Open Monthly Calendar', action: 'navigate', target: 'calendar' });
    } else if (q.includes('college') || q.includes('iit') || q.includes('anna') || q.includes('mit') || q.includes('stanford')) {
      text = `🏫 **Participating Host Campuses:**\n\n` +
        `• **IIT Madras (NIRF #1)**: Hosts HackNova 2026 & BioX Medical Fest\n` +
        `• **NIT Trichy**: Hosts RoboSprint Grand Prix & AeroDesign UAV\n` +
        `• **CEG Anna University**: Hosts Kurukshetra Coding & DevOps Summit\n` +
        `• **BITS Pilani**: Hosts Waves Cultural Odyssey & DesignVerse\n` +
        `• **Stanford University**: Hosts AI & Quantum Computing Summit\n` +
        `• **MIT (Cambridge)**: Hosts CyberShield CTF\n` +
        `• **UC Berkeley**: Hosts Global CleanTech Ideathon\n` +
        `• **NUS (Singapore)**: Hosts FinTech Disruption Challenge`;
      suggestedActions.push({ label: 'View Colleges Directory', action: 'navigate', target: 'colleges' });
    } else if (q.includes('free') || q.includes('fee') || q.includes('cost')) {
      text = `🆓 **Free Entry Events (Zero Registration Fee):**\n\n` +
        `1. **Kurukshetra Coding Olympiad** (Anna University) — ₹75,000 in prizes!\n` +
        `2. **AI & Quantum Computing Summit** (Stanford) — Grants & workshops\n` +
        `3. **DesignVerse UX/UI Jam** (BITS Pilani) — ₹60,000 in prizes\n` +
        `4. **BioX Medical Innovation Fest** (IIT Madras) — ₹1,20,000 in prizes`;
      suggestedActions.push({ label: 'Filter Free Events', action: 'navigate', target: 'events' });
    } else if (q.includes('rbac') || q.includes('security') || q.includes('role') || q.includes('java')) {
      text = `🔒 **Role-Based Access Control (RBAC):**\n\n` +
        `The platform is secured via Spring Security & JWT validation with 3 distinct access tiers:\n` +
        `• **Admin (ROLE_ADMIN):** Full permissions to inspect, modify, and download Spring Boot source code + view audit logs.\n` +
        `• **Organizer (ROLE_ORGANIZER):** Read-only view of backend source code and attendee rosters.\n` +
        `• **Participant (ROLE_PARTICIPANT):** Access to event browsing, registration, and pass generation.\n\n` +
        `You can ask me: *"Switch to admin"* or *"Unlock Java backend"* to test RBAC live!`;
      suggestedActions.push({ label: 'Inspect Java Code', action: 'open_modal', target: 'java_code' });
    } else {
      text = `👋 Hi! I'm your **Agentic Campus Voice & AI Assistant**.\n\n` +
        `You can speak or type commands to control the website directly:\n\n` +
        `• ⚡ **"Book the hackathon at IIT college"** — I'll autonomously register your ticket!\n` +
        `• 📅 **"Open calendar"** — Jump straight to the interactive month view\n` +
        `• 🎫 **"Show my tickets"** — Launch holographic Apple Wallet passes\n` +
        `• 💻 **"Unlock Java backend"** — Inspect Spring Boot architecture & RBAC\n` +
        `• 🎤 **Voice Enabled:** Tap the microphone or speak anytime!`;
      suggestedActions.push({ label: 'Book HackNova 2026', action: 'register_event', target: 'evt-1' });
      suggestedActions.push({ label: 'Open Monthly Calendar', action: 'navigate', target: 'calendar' });
      suggestedActions.push({ label: 'My Event Passes', action: 'open_modal', target: 'wallet_pass' });
    }

    return {
      id: 'msg-' + Date.now(),
      sender: 'assistant',
      text,
      timestamp: new Date().toISOString(),
      model: 'Campus Agentic AI Engine',
      suggestedActions,
      agenticAction,
    };
  },
};
