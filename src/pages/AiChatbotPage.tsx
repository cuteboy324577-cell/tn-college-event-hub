import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  RotateCcw, 
  Calendar, 
  Ticket, 
  Building2, 
  ArrowUpRight, 
  Check, 
  Copy, 
  Layers, 
  ShieldCheck, 
  Award, 
  ArrowLeft,
  Search,
  BookOpen,
  Code2,
  HelpCircle,
  Clock,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Zap,
  CheckCircle2,
  Square,
  Flame,
  Radio
} from 'lucide-react';
import { chatService, ChatMessage, ChatAction, AgenticAction } from '../services/chatService';
import { voiceService, VoiceRecognitionState } from '../services/voiceService';
import { User } from '../types';

interface AiChatbotPageProps {
  currentUser: User | null;
  onNavigate: (view: string, params?: any) => void;
  onSelectEvent: (id: string) => void;
  onOpenWalletPasses: () => void;
  onOpenJavaModal: () => void;
  onOpenApiTester?: () => void;
  onUserChange?: (user: User) => void;
}

const TOPIC_PACKS = [
  {
    title: '⚡ Agentic Website Control',
    icon: '⚡',
    description: 'Direct actions: book events, open passes, switch views',
    prompts: [
      'Book the hackathon at IIT college for me',
      'Open the monthly calendar for November 2026',
      'Show my Apple Wallet passes and tickets',
    ],
  },
  {
    title: 'Flagship Hackathons',
    icon: '🚀',
    description: '36-Hour national hacks, prize pools & team registrations',
    prompts: [
      'What are the full details and prize pool of HackNova 2026?',
      'Which hackathons allow teams of 2-4 members?',
      'How does the Global CleanTech Ideathon work at UC Berkeley?',
    ],
  },
  {
    title: 'Schedule & Calendar',
    icon: '📅',
    description: 'November & December 2026 day-by-day dates and timelines',
    prompts: [
      'Show the complete schedule for November 2026 events.',
      'What competitions are taking place during the 3rd week of November?',
      'How do I export my registered dates to Google Calendar (.ics)?',
    ],
  },
  {
    title: 'Digital Tickets & Passes',
    icon: '🎫',
    description: 'Apple Wallet passes, QR verification and attendee status',
    prompts: [
      'Show my active event passes and ticket numbers.',
      'How do I download my digital pass with a QR code?',
      'What happens after I submit student registration for an event?',
    ],
  },
  {
    title: 'Campus Venues & Colleges',
    icon: '🏫',
    description: 'IIT Madras, NIT Trichy, Anna University, Stanford, MIT',
    prompts: [
      'List all events hosted by Indian Institute of Technology Madras.',
      'Which international universities are participating on Event Hub?',
      'What are the contact details and coordinators for NIT Trichy events?',
    ],
  },
  {
    title: 'Spring Boot & Security',
    icon: '🔒',
    description: 'Role-Based Access Control, JWT, @PreAuthorize rules',
    prompts: [
      'Explain how Role-Based Access Control (RBAC) is implemented.',
      'What permissions do Admin, Organizer, and Participant have?',
      'Where can I inspect the Java Spring Boot companion source code?',
    ],
  },
];

export const AiChatbotPage: React.FC<AiChatbotPageProps> = ({
  currentUser,
  onNavigate,
  onSelectEvent,
  onOpenWalletPasses,
  onOpenJavaModal,
  onOpenApiTester,
  onUserChange,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Voice state
  const [voiceState, setVoiceState] = useState<VoiceRecognitionState>(voiceService.getState());
  const [autoSpeak, setAutoSpeak] = useState<boolean>(voiceService.getAutoSpeak());
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Subscribe to voice service
  useEffect(() => {
    const unsub = voiceService.subscribe((state) => {
      setVoiceState(state);
      if (state.transcript && !state.isListening) {
        setInputValue(state.transcript);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const history = chatService.getHistory();
    if (history.length > 0) {
      setMessages(history);
    } else {
      const initialWelcome: ChatMessage = {
        id: 'welcome-page',
        sender: 'assistant',
        text: `👋 **Welcome to the College Event Hub Agentic AI Assistant!**\n\nI can autonomously execute website tasks and answer any campus inquiry:\n\n• ⚡ **Autonomous Booking:** Say *"Book the hackathon at IIT"* to instantly create and reserve your ticket pass.\n• 📅 **Navigation:** Say *"Open calendar"* or *"Show all hackathons"* to navigate immediately.\n• 🎫 **Digital Tickets:** Say *"Show my passes"* to open your Holographic Apple Wallet passes.\n• 🎤 **Voice Enabled:** Tap the microphone below or use quick voice prompts.\n\nAsk me anything or tap one of the suggested prompts below!`,
        timestamp: new Date().toISOString(),
        model: 'Gemini 3.8 Flash',
        suggestedActions: [
          { label: '⚡ Book HackNova at IIT', action: 'register_event', target: 'evt-1' },
          { label: '📅 Open Event Calendar', action: 'navigate', target: 'calendar' },
          { label: '🎫 My Event Passes', action: 'open_modal', target: 'wallet_pass' },
        ],
      };
      setMessages([initialWelcome]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, voiceState.interimTranscript]);

  const toggleAutoSpeak = () => {
    const newVal = !autoSpeak;
    setAutoSpeak(newVal);
    voiceService.setAutoSpeak(newVal);
    if (!newVal) {
      voiceService.stopSpeaking();
      setSpeakingMessageId(null);
    }
  };

  const speakMessage = (text: string, msgId: string) => {
    if (speakingMessageId === msgId) {
      voiceService.stopSpeaking();
      setSpeakingMessageId(null);
      return;
    }
    setSpeakingMessageId(msgId);
    voiceService.speak(text, () => {
      setSpeakingMessageId(null);
    });
  };

  const handleStartVoice = () => {
    if (voiceState.isListening) {
      voiceService.stopListening();
      return;
    }

    voiceService.startListening((finalTranscript) => {
      if (finalTranscript.trim()) {
        setInputValue(finalTranscript.trim());
        handleSendMessage(finalTranscript.trim());
      }
    });
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    // Stop speaking
    voiceService.stopSpeaking();
    setSpeakingMessageId(null);

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(text, newHistory, currentUser);

      // Execute agentic action if returned
      if (response.agenticAction) {
        chatService.executeAgenticAction(response.agenticAction, {
          currentUser,
          onNavigate,
          onSelectEvent,
          onOpenWalletPasses,
          onOpenJavaModal,
          onOpenApiTester,
          onUserChange,
        });
      }

      const updatedMessages = [...newHistory, response];
      setMessages(updatedMessages);
      chatService.saveHistory(updatedMessages);

      if (autoSpeak) {
        setSpeakingMessageId(response.id);
        voiceService.speak(response.text, () => {
          setSpeakingMessageId(null);
        });
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    chatService.clearHistory();
    voiceService.stopSpeaking();
    setSpeakingMessageId(null);
    const initialWelcome: ChatMessage = {
      id: 'welcome-reset-page',
      sender: 'assistant',
      text: "✨ Conversation cleared! Speak or type a command to control the website or explore campus events.",
      timestamp: new Date().toISOString(),
      model: 'Gemini 3.8 Flash',
      suggestedActions: [
        { label: '⚡ Book HackNova at IIT', action: 'register_event', target: 'evt-1' },
        { label: '📅 Event Calendar', action: 'navigate', target: 'calendar' },
      ],
    };
    setMessages([initialWelcome]);
  };

  const handleActionClick = (action: ChatAction) => {
    if (action.action === 'view_event' && action.target) {
      onSelectEvent(action.target);
    } else if (action.action === 'register_event' && action.target) {
      const autoAction: AgenticAction = {
        type: 'book_event',
        status: 'pending',
        eventId: action.target,
      };
      chatService.executeAgenticAction(autoAction, {
        currentUser,
        onNavigate,
        onSelectEvent,
        onOpenWalletPasses,
        onOpenJavaModal,
        onOpenApiTester,
        onUserChange,
      });
      const confirmMsg: ChatMessage = {
        id: 'confirm-' + Date.now(),
        sender: 'assistant',
        text: `⚡ **Action Executed:** Booking confirmed for event! Ticket pass has been saved to your wallet.`,
        timestamp: new Date().toISOString(),
        agenticAction: autoAction,
      };
      setMessages(prev => [...prev, confirmMsg]);
    } else if (action.action === 'navigate' && action.target) {
      onNavigate(action.target, action.payload);
    } else if (action.action === 'open_modal') {
      if (action.target === 'wallet_pass') {
        onOpenWalletPasses();
      } else if (action.target === 'java_code') {
        onOpenJavaModal();
      } else if (action.target === 'api_tester' && onOpenApiTester) {
        onOpenApiTester();
      }
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);

      const parsedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={pIdx} className="px-1.5 py-0.5 mx-0.5 rounded bg-black/40 text-cyan-300 font-mono text-xs border border-cyan-500/20">
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });

      return (
        <p key={idx} className={line.trim() === '' ? 'h-2' : 'leading-relaxed text-sm'}>
          {parsedLine}
        </p>
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
      {/* Top Breadcrumb & Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Event Hub
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 border border-white/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Campus Agentic Voice & AI Hub
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-400/30 font-medium">
                  Autonomous Web Agent
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Voice control, real-time ticket booking, monthly calendar navigation, and live knowledge base
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Voice Auto-Speak Toggle */}
          <button
            onClick={toggleAutoSpeak}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition ${
              autoSpeak
                ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-600 dark:text-cyan-300'
                : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white'
            }`}
            title={autoSpeak ? 'Voice output: ON (Click to mute)' : 'Voice output: MUTED'}
          >
            {autoSpeak ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
            <span>{autoSpeak ? 'Voice Audio: ON' : 'Audio: Muted'}</span>
          </button>

          {/* Clear conversation */}
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-white/10 transition"
            title="Reset Chat History"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Voice Control Studio Hero Banner */}
      <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-cyan-950/80 via-slate-900/95 to-indigo-950/80 border border-cyan-500/30 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleStartVoice}
              className={`relative flex items-center justify-center w-14 h-14 rounded-2xl border transition-all duration-300 shadow-xl ${
                voiceState.isListening
                  ? 'bg-red-500 text-white border-red-400 shadow-red-500/50 scale-110 animate-pulse'
                  : 'bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white border-white/30 hover:scale-105 shadow-cyan-500/30'
              }`}
              title="Click to speak a voice command"
            >
              {voiceState.isListening ? (
                <MicOff className="w-7 h-7 animate-bounce" />
              ) : (
                <Mic className="w-7 h-7" />
              )}
              {voiceState.isListening && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-400 border-2 border-slate-900 animate-ping" />
              )}
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">Voice Agent Controller</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider ${
                  voiceState.isListening
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {voiceState.isListening ? 'Listening Live' : 'Ready to Listen'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {voiceState.isListening 
                  ? 'Speak naturally: "Book hackathon at IIT", "Open calendar", "Show my passes"...'
                  : 'Tap the mic or select a voice prompt to autonomously control the website'}
              </p>
            </div>
          </div>

          {/* Quick Voice Prompt Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleSendMessage('Book the hackathon at IIT college for me')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 text-xs font-medium transition active:scale-95 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>⚡ "Book hackathon at IIT"</span>
            </button>
            <button
              onClick={() => handleSendMessage('Open monthly calendar')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-xs font-medium transition active:scale-95 shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5 text-cyan-300" />
              <span>📅 "Open calendar"</span>
            </button>
            <button
              onClick={() => handleSendMessage('Show my tickets and wallet passes')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/30 text-purple-200 border border-purple-400/30 text-xs font-medium transition active:scale-95 shadow-sm"
            >
              <Ticket className="w-3.5 h-3.5 text-purple-300" />
              <span>🎫 "Show my passes"</span>
            </button>
          </div>
        </div>

        {/* Live Transcript Bubble */}
        {voiceState.isListening && voiceState.interimTranscript && (
          <div className="mt-3 p-3 rounded-2xl bg-black/40 border border-red-500/30 text-white text-xs italic flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-400 animate-spin" />
              <span>Hearing: <strong>"{voiceState.interimTranscript}"</strong></span>
            </div>
            <button
              onClick={() => voiceService.stopListening()}
              className="px-2.5 py-1 rounded-lg bg-red-500/30 hover:bg-red-500/50 text-white text-xs font-medium"
            >
              Finish & Send
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Sidebar Prompt Packs & Conversation Window */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Knowledge & Prompt Packs */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl backdrop-blur-2xl">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Topic Prompts & Actions
            </h2>
            <div className="space-y-3">
              {TOPIC_PACKS.map((pack, pIdx) => (
                <div key={pIdx} className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/20 transition">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{pack.icon}</span>
                    <h3 className="text-xs font-semibold text-white">{pack.title}</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">{pack.description}</p>
                  <div className="space-y-1">
                    {pack.prompts.map((prompt, qIdx) => (
                      <button
                        key={qIdx}
                        onClick={() => handleSendMessage(prompt)}
                        className="w-full text-left p-2 rounded-xl bg-slate-950/40 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-200 text-xs font-normal transition flex items-center justify-between group"
                      >
                        <span className="line-clamp-1">{prompt}</span>
                        <ArrowUpRight className="w-3 h-3 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition shrink-0 ml-1" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Main Column: Chat Stream & Message Input */}
        <div className="lg:col-span-8 flex flex-col h-[680px] rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden">
          {/* Header Bar */}
          <div className="px-5 py-3.5 border-b border-white/10 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-slate-300">Live Agent Session</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 font-mono">Autonomous Execution Ready</span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {messages.length} messages
            </div>
          </div>

          {/* Scrollable Messages Stream */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-950/20">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              const isSpeakingThis = speakingMessageId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'} gap-1.5`}
                >
                  <div className="flex items-center gap-2 px-1 text-[11px] text-slate-400">
                    {isAssistant ? (
                      <>
                        <span className="flex items-center gap-1 text-cyan-400 font-medium">
                          <Sparkles className="w-3 h-3" /> Campus Agentic AI
                        </span>
                        <span>•</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-slate-300 font-medium">You</span>
                        <span>•</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </>
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`relative max-w-[92%] sm:max-w-[85%] px-5 py-4 rounded-3xl ${
                      isAssistant
                        ? 'bg-slate-800/90 text-slate-100 rounded-tl-sm border border-white/15 shadow-xl backdrop-blur-xl'
                        : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-tr-sm shadow-md shadow-indigo-600/20'
                    }`}
                  >
                    <div className="space-y-1.5">
                      {renderFormattedText(msg.text)}
                    </div>

                    {/* Agentic Action Execution Card */}
                    {isAssistant && msg.agenticAction && (
                      <div className="mt-3.5 pt-3.5 border-t border-cyan-500/20">
                        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/80 via-slate-900/95 to-indigo-950/80 border border-cyan-400/40 shadow-inner">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-bold tracking-wide">
                              <Zap className="w-3.5 h-3.5 text-cyan-400" />
                              {msg.agenticAction.badge || 'AGENTIC ACTION EXECUTED'}
                            </span>
                            <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Confirmed
                            </span>
                          </div>

                          {msg.agenticAction.type === 'book_event' && (
                            <div className="space-y-2 text-xs text-slate-200">
                              <div className="font-semibold text-white flex items-center gap-2 text-sm">
                                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                                <span>{msg.agenticAction.eventTitle || 'Flagship Event'}</span>
                              </div>
                              <div className="text-slate-400 text-xs flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                <span>{msg.agenticAction.collegeName || 'IIT Madras'}</span>
                              </div>
                              {msg.agenticAction.registration && (
                                <div className="mt-2 p-2.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs flex items-center justify-between">
                                  <span className="text-slate-400">Pass Ticket:</span>
                                  <span className="text-cyan-300 font-bold">{msg.agenticAction.registration.ticketNumber}</span>
                                </div>
                              )}
                              <div className="pt-2 flex flex-wrap gap-2">
                                <button
                                  onClick={onOpenWalletPasses}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-sm transition"
                                >
                                  <Ticket className="w-3.5 h-3.5" /> View Apple Wallet Pass
                                </button>
                                <button
                                  onClick={() => onNavigate('calendar')}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition"
                                >
                                  <Calendar className="w-3.5 h-3.5 text-cyan-300" /> View on Calendar
                                </button>
                              </div>
                            </div>
                          )}

                          {msg.agenticAction.type === 'navigate' && (
                            <div className="text-xs text-slate-200 flex items-center justify-between">
                              <span>Navigating to: <strong>{msg.agenticAction.view?.toUpperCase()}</strong></span>
                              <button
                                onClick={() => onNavigate(msg.agenticAction?.view || 'events')}
                                className="px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs"
                              >
                                Take Me There
                              </button>
                            </div>
                          )}

                          {msg.agenticAction.type === 'open_modal' && (
                            <div className="text-xs text-slate-200 flex items-center justify-between">
                              <span>Action launched: Modal viewer</span>
                              <button
                                onClick={() => {
                                  if (msg.agenticAction?.modal === 'wallet_pass') onOpenWalletPasses();
                                  else if (msg.agenticAction?.modal === 'java_code') onOpenJavaModal();
                                }}
                                className="px-3 py-1 rounded-lg bg-indigo-500 text-white font-medium text-xs"
                              >
                                Open Modal
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer bar */}
                    {isAssistant && (
                      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                        <span className="text-[11px] font-mono text-slate-400">
                          {msg.model || 'Gemini 3.8 Flash'}
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => speakMessage(msg.text, msg.id)}
                            className={`flex items-center gap-1 text-xs transition ${
                              isSpeakingThis ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-white'
                            }`}
                            title={isSpeakingThis ? 'Stop speaking' : 'Speak answer aloud'}
                          >
                            {isSpeakingThis ? (
                              <>
                                <Square className="w-3.5 h-3.5 text-red-400" />
                                <span>Stop</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Speak</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => copyToClipboard(msg.text, msg.id)}
                            className="flex items-center gap-1 text-slate-400 hover:text-white transition"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions pills */}
                  {isAssistant && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 pl-1">
                      {msg.suggestedActions.map((action, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleActionClick(action)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/15 via-indigo-500/15 to-purple-500/15 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-400/30 hover:border-cyan-400/60 text-cyan-200 hover:text-white text-xs font-medium shadow-sm transition"
                        >
                          {action.action === 'register_event' && <Zap className="w-3 h-3 text-amber-400" />}
                          {action.action === 'view_event' && <Award className="w-3 h-3 text-amber-300" />}
                          {action.action === 'navigate' && <Calendar className="w-3 h-3 text-cyan-300" />}
                          {action.action === 'open_modal' && <Ticket className="w-3 h-3 text-purple-300" />}
                          <span>{action.label}</span>
                          <ArrowUpRight className="w-3 h-3 opacity-70" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-1.5 px-1 text-xs text-cyan-400 font-medium">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Agent executing request...</span>
                </div>
                <div className="px-5 py-3.5 rounded-2xl rounded-tl-sm bg-slate-800/90 border border-white/10 backdrop-blur-xl flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs text-slate-300 ml-1">Analyzing platform knowledge base & database records</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar with Voice Mic */}
          <div className="p-4 border-t border-white/10 bg-slate-900/95">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-3"
            >
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
                placeholder={voiceState.isListening ? "Listening to your voice..." : "Speak or type: 'Book hackathon at IIT', 'Open calendar'..."}
                disabled={isLoading}
                className="flex-1 bg-slate-950/70 border border-white/15 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20 text-slate-100 placeholder-slate-400 rounded-2xl px-4 py-3 text-sm resize-none outline-none transition custom-scrollbar"
              />

              {/* Voice button */}
              <button
                type="button"
                onClick={handleStartVoice}
                className={`flex items-center justify-center w-12 h-12 rounded-2xl border transition shrink-0 ${
                  voiceState.isListening
                    ? 'bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/30 scale-105 animate-pulse'
                    : 'bg-white/10 hover:bg-cyan-500/20 text-cyan-300 border-white/15 hover:border-cyan-400/40'
                }`}
                title={voiceState.isListening ? 'Stop recording voice' : 'Speak command with Voice Recognition'}
              >
                {voiceState.isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="flex items-center justify-center px-5 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-medium shadow-lg shadow-indigo-500/30 border border-white/20 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition shrink-0 gap-2 text-sm"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between mt-2.5 px-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-cyan-400" />
                <span>Web Speech API Voice Recognition & Synthesis Connected</span>
              </span>
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">Enter ↵</kbd> to send</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
