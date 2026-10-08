import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Comprehensive knowledge base for College Event Hub
const KNOWLEDGE_BASE_SUMMARY = `
COLLEGE EVENT HUB - PLATFORM KNOWLEDGE BASE:

1. FLAGSHIP EVENTS:
- "HackNova 2026": 36-Hour National Flagship Hackathon at Indian Institute of Technology Madras (IIT Madras), Chennai. Dates: Nov 14-16, 2026. Registration Fee: ₹499. Prize Pool: ₹2,50,000. Team Size: 2-4 Members. Category: Hackathon. Deadline: Nov 10, 2026. Venue: Research Park Hall & Central Lecture Theatre. Coordinator: Prof. Sundar Raman (events@iitm.ac.in).
- "RoboSprint Grand Prix": Autonomous robotics obstacle race & drone navigation at National Institute of Technology, Tiruchirappalli (NIT Trichy). Dates: Nov 20-21, 2026. Fee: ₹299. Prize Pool: ₹1,00,000. Team Size: 4-6 Members. Category: Technical. Deadline: Nov 16, 2026. Venue: Indoor Sports Arena, NITT.
- "Kurukshetra Coding Olympiad": Algorithmic programming clash & dynamic programming sprint at College of Engineering, Guindy (Anna University), Chennai. Dates: Nov 27-28, 2026. Fee: Free (₹0). Prize Pool: ₹75,000. Team Size: Individual. Category: Technical. Deadline: Nov 25, 2026. Venue: CEG Turing Computing Lab.
- "Waves Cultural Odyssey": National inter-college drama, battle of bands & choreo night at Birla Institute of Technology and Science, Pilani - Goa Campus. Dates: Dec 04-06, 2026. Fee: ₹350. Prize Pool: ₹1,80,000. Team Size: Flexible. Category: Cultural. Deadline: Nov 28, 2026.
- "AI & Quantum Computing Summit": Next-gen machine learning keynotes, quantum algorithms workshop & poster presentations at Stanford University, Stanford CA. Dates: Nov 08-09, 2026. Fee: Free (₹0). Prize Pool: ₹1,50,000 in research grants. Team Size: Individual / 2-4 Members. Category: Technical / Workshop. Deadline: Nov 05, 2026.
- "Global CleanTech Ideathon": Climate change tech, smart grids & zero-emission mobility sprint at UC Berkeley, Berkeley CA. Dates: Dec 12-14, 2026. Fee: ₹250. Prize Pool: $5,000 USD (₹4,15,000). Category: Hackathon. Deadline: Dec 05, 2026.
- "CyberShield CTF": Capture The Flag offensive/defensive cybersecurity war games at Massachusetts Institute of Technology (MIT), Cambridge MA. Dates: Nov 18, 2026. Fee: ₹199. Prize Pool: ₹1,50,000. Team Size: 2-4 Members. Category: Technical. Deadline: Nov 15, 2026.
- "FinTech Disruption Challenge": High-frequency trading models & blockchain DeFi prototypes at National University of Singapore (NUS). Dates: Nov 22-23, 2026. Fee: ₹400. Prize Pool: SGD 10,000. Category: Hackathon. Deadline: Nov 18, 2026.
- "BioX Medical Innovation Fest": Healthcare assistive tech & wearable biosensors showcase at IIT Madras. Dates: Dec 01-02, 2026. Fee: Free (₹0). Prize Pool: ₹1,20,000. Category: Technical.
- "AeroDesign UAV Championship": RC aircraft design, fixed-wing aerodynamics & drone obstacle course at NIT Trichy. Dates: Dec 08-09, 2026. Fee: ₹300. Prize Pool: ₹1,10,000. Category: Technical.
- "DesignVerse UX/UI Jam": Rapid prototyping, human-computer interaction & design sprint at BITS Pilani. Dates: Nov 15-16, 2026. Fee: Free (₹0). Prize Pool: ₹60,000. Category: Workshop.
- "CloudNative DevOps Summit": Kubernetes, microservices & multi-cloud architecture hackathon at CEG Anna University. Dates: Dec 18, 2026. Fee: ₹150. Prize Pool: ₹80,000. Category: Technical.

2. HOST INSTITUTIONS:
- IIT Madras (Chennai, Tamil Nadu) - Est. 1959, NIRF #1 Engineering Institute.
- NIT Trichy (Tiruchirappalli, Tamil Nadu) - Home to Pragyan and Festember.
- CEG Anna University (Chennai) - Est. 1794, oldest engineering college in Asia.
- BITS Pilani (Goa & Pilani) - Renowned for Waves & Quark.
- Stanford University (Stanford, CA) - Silicon Valley's powerhouse.
- UC Berkeley (Berkeley, CA) - Public research leader in engineering.
- MIT (Cambridge, MA) - Global pioneer in computing & technology.
- NUS (Singapore) - Top Asian university in computer science & fintech.

3. REGISTRATION & TICKETING:
- How to register: Click "Register Now" on any event card, enter participant & team details, submit for instant digital registration.
- Digital Holographic Pass: Instant unique Ticket Number (e.g. REG-2026-XXXX) and QR code.
- Apple Wallet integration: View holographic Apple Wallet style pass with security chip, date, venue, and team roster.
- Add to Calendar: Export .ics format for Google Calendar, Apple Calendar, and Outlook.

4. MONTHLY CALENDAR VIEW:
- Features an interactive month grid (November/December 2026) visualizing all college event dates.
- Highlights registered events with bright neon badges and ticket status.
- Day-agenda drawer showing hourly schedule, venue, coordinator contact, and direct registration links.
- Filter by category, registration status, or college.

5. SECURITY & ROLE-BASED ACCESS CONTROL (RBAC):
- ROLE_ADMIN: Full access to view, edit, and manage Spring Boot source code and audit logs.
- ROLE_ORGANIZER: Read-only access to view Java backend architecture.
- ROLE_PARTICIPANT: Access to event discovery, calendar, registration, and digital tickets.
- Security architecture includes JWT validation, Spring Security @PreAuthorize rules, and audit logging.

6. LIQUID UI DESIGN SYSTEM:
- Apple Liquid Dock at the bottom of the screen with magnification and blur.
- Dynamic Island floating at the top with live event status and notifications.
- Frosted glass cards, glow effects, and smooth animations.
`;

async function startServer() {
  const app = express();

  // Parse port from CLI argument or environment variable
  let port = 3000;
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    port = parseInt(process.argv[portArgIndex + 1], 10);
  } else if (process.env.PORT) {
    port = parseInt(process.env.PORT, 10);
  }

  app.use(express.json());

  // Initialize Gemini API client on server-side
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'College Event Hub Full-Stack API',
      aiConfigured: Boolean(apiKey),
      timestamp: new Date().toISOString(),
    });
  });

  // AI Chat endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history = [], context = {} } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message text is required' });
        return;
      }

      // Format dynamic context if provided by client
      let dynamicContextStr = '';
      if (context.currentUser) {
        dynamicContextStr += `\nCurrent User: Name: ${context.currentUser.name}, Role: ${context.currentUser.role}, College: ${context.currentUser.collegeName || 'N/A'}.`;
      }
      if (context.userRegistrations && Array.isArray(context.userRegistrations) && context.userRegistrations.length > 0) {
        dynamicContextStr += `\nUser's Active Registrations/Passes:`;
        context.userRegistrations.forEach((reg: any) => {
          dynamicContextStr += `\n- Event: ${reg.eventTitle}, Ticket #: ${reg.ticketNumber}, Team: ${reg.teamName || 'Solo'}, College: ${reg.collegeName}, Status: ${reg.status}.`;
        });
      }

      const systemPrompt = `You are the official College Event Hub Agentic AI Assistant — a smart, collegiate, and action-oriented guide with autonomous website control capabilities.
Your job is to answer all questions about college events, competitions, symposiums, hackathons, cultural festivals, hosting colleges, registration passes, monthly calendar schedules, and platform security.

You can also execute real ACTIONS on behalf of the user when requested, such as booking events, navigating pages, or opening modals:
- If the user commands or asks to book or register for an event (e.g. "book the hackathon at IIT", "register for HackNova", "book robosprint"), confirm with high enthusiasm and mention that their pass and ticket have been reserved.
- If the user asks to see the calendar, confirm and guide them to the Monthly Calendar View.
- If the user asks to see their tickets or passes, guide them to their Apple Wallet Holographic Passes.

You have complete knowledge of all platform data:
${KNOWLEDGE_BASE_SUMMARY}
${dynamicContextStr}

CRITICAL INSTRUCTIONS:
1. Provide structured, accurate, well-formatted answers with bold headings, emojis, bullet points, and clear dates/fees.
2. If the user asks about specific events (e.g. HackNova, RoboSprint, Kurukshetra), give exact dates, prizes, venue, fee, and team size.
3. If the user asks about their registered passes or tickets, reference the "User's Active Registrations" in context if available.
4. If the user asks how to do something (e.g. "How to register?", "Where is the calendar?"), give step-by-step guidance.
5. If the user issues a voice or text command like "book hackathon at IIT", confirm that the booking has been dispatched and explain that their digital ticket is ready.
6. Suggest next steps or related events where appropriate.
7. Keep a polite, motivating collegiate tone.`;

      // If Gemini API is configured, call gemini-3.8-flash model
      if (ai) {
        try {
          // Prepare contents with conversation history
          const contents: any[] = [];

          // Add history if present
          if (Array.isArray(history) && history.length > 0) {
            for (const item of history.slice(-6)) {
              if (item.sender === 'user') {
                contents.push({ role: 'user', parts: [{ text: item.text }] });
              } else if (item.sender === 'assistant') {
                contents.push({ role: 'model', parts: [{ text: item.text }] });
              }
            }
          }

          // Add current message
          contents.push({ role: 'user', parts: [{ text: message }] });

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: contents,
            config: {
              systemInstruction: systemPrompt,
            },
          });

          const replyText = response.text || "I'm here to help you explore and control all features on College Event Hub! Feel free to speak or ask about hackathons, college venues, or your registration passes.";

          // Extract suggested action buttons based on query and reply
          const suggestedActions = extractSuggestedActions(message, replyText);
          const agenticAction = extractAgenticAction(message);

          res.json({
            text: replyText,
            model: 'gemini-3.8-flash',
            suggestedActions,
            agenticAction,
            timestamp: new Date().toISOString(),
          });
          return;
        } catch (apiError: any) {
          console.warn('Gemini API call failed, falling back to local knowledge engine:', apiError?.message);
          // Fall through to local fallback reasoning engine
        }
      }

      // High-fidelity local fallback reasoning engine (used if no API key or API limit)
      const fallbackResponse = generateLocalKnowledgeResponse(message, context);
      res.json(fallbackResponse);
    } catch (err: any) {
      console.error('Error handling /api/chat:', err);
      res.status(500).json({
        error: 'Failed to process AI chat message',
        details: err?.message || 'Unknown error',
      });
    }
  });

  // Setup frontend serving
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // Mount Vite middlewares in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`College Event Hub Server running on http://0.0.0.0:${port}`);
  });
}

// Helper to extract relevant contextual actions
function extractSuggestedActions(userQuery: string, replyText: string) {
  const queryLower = userQuery.toLowerCase();
  const replyLower = replyText.toLowerCase();
  const actions: Array<{ label: string; action: string; target?: string; payload?: any }> = [];

  if (queryLower.includes('hackathon') || replyLower.includes('hacknova')) {
    actions.push({ label: 'View HackNova 2026', action: 'view_event', target: 'evt-1' });
  }
  if (queryLower.includes('calendar') || queryLower.includes('schedule') || queryLower.includes('november') || queryLower.includes('date')) {
    actions.push({ label: 'Open Monthly Calendar', action: 'navigate', target: 'calendar' });
  }
  if (queryLower.includes('pass') || queryLower.includes('ticket') || queryLower.includes('registration') || queryLower.includes('wallet')) {
    actions.push({ label: 'View My Event Passes', action: 'open_modal', target: 'wallet_pass' });
  }
  if (queryLower.includes('college') || queryLower.includes('iit') || queryLower.includes('mit') || queryLower.includes('campus')) {
    actions.push({ label: 'Explore All Colleges', action: 'navigate', target: 'colleges' });
  }
  if (queryLower.includes('all') || queryLower.includes('browse') || queryLower.includes('event')) {
    actions.push({ label: 'Browse Events Directory', action: 'navigate', target: 'events' });
  }

  return actions.slice(0, 3);
}

// Helper to detect and construct Agentic Actions from query
function extractAgenticAction(userQuery: string): any {
  const q = userQuery.toLowerCase().trim();

  // Booking action
  if ((q.includes('book') || q.includes('register') || q.includes('enroll')) &&
      !q.includes('how to') && !q.includes('where to')) {
    if (q.includes('hackathon') || q.includes('shaastra') || q.includes('hacknova') || q.includes('iit') || q.includes('colage') || q.includes('college')) {
      return {
        type: 'book_event',
        status: 'executed',
        eventId: 'evt-101',
        eventTitle: 'Shaastra 2026: AI & Autonomous Robotics Hackathon',
        collegeName: 'Indian Institute of Technology Madras',
        badge: 'AGENTIC BOOKING CONFIRMED',
      };
    } else if (q.includes('robot') || q.includes('robowars') || q.includes('pragyan') || q.includes('trichy') || q.includes('nit')) {
      return {
        type: 'book_event',
        status: 'executed',
        eventId: 'evt-102',
        eventTitle: 'Pragyan 2026: National RoboWars Extreme (60kg)',
        collegeName: 'National Institute of Technology, Tiruchirappalli',
        badge: 'AGENTIC BOOKING CONFIRMED',
      };
    } else if (q.includes('kurukshetra') || q.includes('codesprint') || q.includes('olympiad') || q.includes('anna')) {
      return {
        type: 'book_event',
        status: 'executed',
        eventId: 'evt-103',
        eventTitle: 'Kurukshetra 2026: Algorithmic CodeSprint & CTF',
        collegeName: 'College of Engineering, Guindy (Anna University)',
        badge: 'AGENTIC BOOKING CONFIRMED',
      };
    } else if (q.includes('saarang') || q.includes('decibels') || q.includes('band') || q.includes('cultural')) {
      return {
        type: 'book_event',
        status: 'executed',
        eventId: 'evt-104',
        eventTitle: 'Saarang 2026: Decibels - Battle of the Bands',
        collegeName: 'Indian Institute of Technology Madras',
        badge: 'AGENTIC BOOKING CONFIRMED',
      };
    } else if (q.includes('vortex') || q.includes('esports') || q.includes('gaming') || q.includes('bits')) {
      return {
        type: 'book_event',
        status: 'executed',
        eventId: 'evt-105',
        eventTitle: 'Vortex 2026: National Collegiate Esports Championship',
        collegeName: 'Birla Institute of Technology and Science, Pilani',
        badge: 'AGENTIC BOOKING CONFIRMED',
      };
    } else {
      return {
        type: 'book_event',
        status: 'executed',
        eventId: 'evt-101',
        eventTitle: 'Shaastra 2026: AI & Autonomous Robotics Hackathon',
        collegeName: 'Indian Institute of Technology Madras',
        badge: 'AGENTIC BOOKING CONFIRMED',
      };
    }
  }

  // Navigation action
  if (q.includes('open calendar') || q.includes('show calendar') || q.includes('monthly calendar')) {
    return {
      type: 'navigate',
      status: 'executed',
      view: 'calendar',
      badge: 'VOICE NAVIGATION',
    };
  }
  if (q.includes('open pass') || q.includes('show pass') || q.includes('my ticket') || q.includes('open ticket') || q.includes('apple wallet')) {
    return {
      type: 'open_modal',
      status: 'executed',
      modal: 'wallet_pass',
      badge: 'MODAL ACTIVATED',
    };
  }
  if (q.includes('unlock java') || q.includes('open java') || q.includes('spring boot')) {
    return {
      type: 'open_modal',
      status: 'executed',
      modal: 'java_code',
      badge: 'SECURITY CLEARANCE',
    };
  }
  if (q.includes('switch to admin') || q.includes('become admin')) {
    return {
      type: 'switch_user',
      status: 'executed',
      role: 'ROLE_ADMIN',
      badge: 'ROLE SWITCH',
    };
  }

  return undefined;
}

// Local knowledge reasoning engine for instant guaranteed answers
function generateLocalKnowledgeResponse(query: string, context: any) {
  const q = query.toLowerCase();
  let text = '';
  const suggestedActions: any[] = [];
  const agenticAction = extractAgenticAction(query);

  if (agenticAction && agenticAction.type === 'book_event') {
    text = `⚡ **Agentic Action Executed: Booking Confirmed!**\n\n` +
      `I've autonomously reserved your participant spot for **${agenticAction.eventTitle}** at **${agenticAction.collegeName}**!\n\n` +
      `• **Status:** Confirmed ✅\n` +
      `• **Ticket Registration:** Generated and loaded in your active profile.\n` +
      `• **Pass Details:** Holographic pass is ready with QR verification code.\n\n` +
      `You can view your Apple Wallet holographic pass below or inspect it on the November event calendar!`;
    suggestedActions.push({ label: 'Open Apple Wallet Pass', action: 'open_modal', target: 'wallet_pass' });
    suggestedActions.push({ label: 'View on Calendar', action: 'navigate', target: 'calendar' });
    suggestedActions.push({ label: 'View Event Details', action: 'view_event', target: agenticAction.eventId });
  } else if (q.includes('hackathon') || q.includes('coding') || q.includes('hacknova')) {
    text = `🚀 **Upcoming Hackathons on College Event Hub:**\n\n` +
      `1. **HackNova 2026** (IIT Madras)\n` +
      `   - **Dates:** Nov 14 – 16, 2026\n` +
      `   - **Prize Pool:** ₹2,50,000\n` +
      `   - **Format:** 36-Hour National Hackathon (Teams of 2-4)\n` +
      `   - **Fee:** ₹499 | **Venue:** Research Park Hall, IIT Madras\n\n` +
      `2. **Global CleanTech Ideathon** (UC Berkeley)\n` +
      `   - **Dates:** Dec 12 – 14, 2026\n` +
      `   - **Prize Pool:** $5,000 USD (₹4,15,000)\n` +
      `   - **Focus:** Climate Tech & Sustainable hardware\n\n` +
      `3. **FinTech Disruption Challenge** (NUS Singapore)\n` +
      `   - **Dates:** Nov 22 – 23, 2026\n` +
      `   - **Prize Pool:** SGD 10,000\n\n` +
      `Would you like to register for HackNova or see all hackathons in the directory?`;
    suggestedActions.push({ label: 'View HackNova 2026', action: 'view_event', target: 'evt-1' });
    suggestedActions.push({ label: 'Browse All Events', action: 'navigate', target: 'events' });
  } else if (q.includes('ticket') || q.includes('pass') || q.includes('my event') || q.includes('registration')) {
    const regs = context.userRegistrations || [];
    if (regs.length > 0) {
      text = `🎫 **Your Active Registered Passes (${regs.length}):**\n\n`;
      regs.forEach((r: any, idx: number) => {
        text += `${idx + 1}. **${r.eventTitle}**\n` +
          `   - **Ticket ID:** \`${r.ticketNumber}\`\n` +
          `   - **Status:** Confirmed ✅\n` +
          `   - **Team:** ${r.teamName || 'Individual'}\n` +
          `   - **College:** ${r.collegeName}\n\n`;
      });
      text += `You can view and export your Holographic Apple Wallet passes anytime!`;
      suggestedActions.push({ label: 'View Digital Passes', action: 'open_modal', target: 'wallet_pass' });
      suggestedActions.push({ label: 'Open Calendar', action: 'navigate', target: 'calendar' });
    } else {
      text = `🎫 You currently have registrations for **HackNova 2026** and **RoboSprint Grand Prix** in your sample profile!\n\n` +
        `To inspect your digital ticket passes with QR codes, click the button below to launch the **Apple Wallet Pass Modal**.`;
      suggestedActions.push({ label: 'View Digital Passes', action: 'open_modal', target: 'wallet_pass' });
      suggestedActions.push({ label: 'Browse Events', action: 'navigate', target: 'events' });
    }
  } else if (q.includes('calendar') || q.includes('november') || q.includes('schedule') || q.includes('date')) {
    text = `📅 **Event Calendar Schedule Overview (November – December 2026):**\n\n` +
      `• **Nov 08-09:** AI & Quantum Computing Summit (Stanford University)\n` +
      `• **Nov 14-16:** HackNova 2026 (IIT Madras)\n` +
      `• **Nov 15-16:** DesignVerse UX/UI Jam (BITS Pilani)\n` +
      `• **Nov 18:** CyberShield CTF (MIT Cambridge)\n` +
      `• **Nov 20-21:** RoboSprint Grand Prix (NIT Trichy)\n` +
      `• **Nov 22-23:** FinTech Disruption Challenge (NUS Singapore)\n` +
      `• **Nov 27-28:** Kurukshetra Coding Olympiad (Anna University)\n` +
      `• **Dec 01-02:** BioX Medical Innovation Fest (IIT Madras)\n` +
      `• **Dec 04-06:** Waves Cultural Odyssey (BITS Pilani Goa)\n` +
      `• **Dec 08-09:** AeroDesign UAV Championship (NIT Trichy)\n` +
      `• **Dec 12-14:** Global CleanTech Ideathon (UC Berkeley)\n\n` +
      `Check out our new **Monthly Calendar View** for full day agendas and .ics exports!`;
    suggestedActions.push({ label: 'Open Monthly Calendar', action: 'navigate', target: 'calendar' });
    suggestedActions.push({ label: 'Explore Events', action: 'navigate', target: 'events' });
  } else if (q.includes('college') || q.includes('iit') || q.includes('nit') || q.includes('anna') || q.includes('stanford') || q.includes('mit')) {
    text = `🏫 **Partner Colleges & Campuses on Event Hub:**\n\n` +
      `1. **IIT Madras** (Chennai) – NIRF #1, hosting HackNova & BioX Fest.\n` +
      `2. **NIT Trichy** (Tiruchirappalli) – Home to Pragyan, hosting RoboSprint & AeroDesign.\n` +
      `3. **CEG Anna University** (Chennai) – Est. 1794, hosting Kurukshetra Coding Olympiad & CloudNative DevOps.\n` +
      `4. **BITS Pilani Goa** – Hosting Waves Cultural Odyssey & DesignVerse.\n` +
      `5. **Stanford University** – Hosting AI & Quantum Computing Summit.\n` +
      `6. **MIT Cambridge** – Hosting CyberShield CTF.\n` +
      `7. **UC Berkeley** – Hosting Global CleanTech Ideathon.\n` +
      `8. **NUS Singapore** – Hosting FinTech Disruption Challenge.\n\n` +
      `Click below to view full college profiles and verified details!`;
    suggestedActions.push({ label: 'Explore All Colleges', action: 'navigate', target: 'colleges' });
    suggestedActions.push({ label: 'Browse Events', action: 'navigate', target: 'events' });
  } else if (q.includes('free') || q.includes('fee') || q.includes('cost') || q.includes('prize')) {
    text = `💰 **Free Entry Events & Big Prize Pools:**\n\n` +
      `🌟 **Free Entry (₹0):**\n` +
      `• **Kurukshetra Coding Olympiad** (Anna University) – ₹75,000 Prize Pool\n` +
      `• **AI & Quantum Computing Summit** (Stanford) – Research Grants\n` +
      `• **DesignVerse UX/UI Jam** (BITS Pilani) – ₹60,000 Prize Pool\n` +
      `• **BioX Medical Innovation Fest** (IIT Madras) – ₹1,20,000 Prize Pool\n\n` +
      `🏆 **Biggest Cash Prize Pools:**\n` +
      `• **Global CleanTech Ideathon:** $5,000 USD (~₹4,15,000)\n` +
      `• **HackNova 2026:** ₹2,50,000\n` +
      `• **Waves Cultural Odyssey:** ₹1,80,000\n` +
      `• **CyberShield CTF:** ₹1,50,000`;
    suggestedActions.push({ label: 'Filter Free Events', action: 'navigate', target: 'events' });
    suggestedActions.push({ label: 'Open Calendar', action: 'navigate', target: 'calendar' });
  } else if (q.includes('rbac') || q.includes('spring') || q.includes('java') || q.includes('role') || q.includes('security')) {
    text = `🔒 **Role-Based Access Control (RBAC) Architecture:**\n\n` +
      `• **ROLE_ADMIN:** Full authorization to view, edit, download Java Spring Boot code, and audit logs.\n` +
      `• **ROLE_ORGANIZER:** Read-only viewing of backend controllers and event coordination endpoints.\n` +
      `• **ROLE_PARTICIPANT:** Event discovery, calendar, ticket passes, and registration; restricted from backend code.\n\n` +
      `The backend is secured with Spring Security \`@PreAuthorize\` expressions, JWT validation filters, and security audit log streams.`;
    suggestedActions.push({ label: 'Inspect Java Backend Code', action: 'open_modal', target: 'java_code' });
  } else {
    text = `👋 Hello! I am the **College Event Hub AI Assistant**.\n\n` +
      `I can help you gather any information about our platform:\n` +
      `• 🚀 **Discover Events:** Hackathons, technical competitions, cultural fests, workshops.\n` +
      `• 📅 **Schedule & Dates:** View our interactive November/December 2026 monthly calendar.\n` +
      `• 🎫 **Tickets & Passes:** Instant holographic pass check, QR codes, and Apple Wallet passes.\n` +
      `• 🏫 **Colleges:** Details on IIT Madras, NIT Trichy, Anna University, Stanford, MIT, and more.\n` +
      `• 🔒 **Security & Roles:** RBAC, Spring Security source code, and developer API tools.\n\n` +
      `What would you like to know today?`;
    suggestedActions.push({ label: 'Upcoming Hackathons', action: 'navigate', target: 'events' });
    suggestedActions.push({ label: 'Event Calendar', action: 'navigate', target: 'calendar' });
    suggestedActions.push({ label: 'My Digital Passes', action: 'open_modal', target: 'wallet_pass' });
  }

  return {
    text,
    model: 'local-knowledge-engine',
    suggestedActions,
    agenticAction,
    timestamp: new Date().toISOString(),
  };
}

startServer();
