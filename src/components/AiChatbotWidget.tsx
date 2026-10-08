import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  RotateCcw, 
  ChevronRight, 
  Calendar, 
  Ticket, 
  Building2, 
  ArrowUpRight, 
  Check, 
  Copy, 
  Layers, 
  Zap, 
  MessageSquare,
  ShieldCheck,
  Award,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Square,
  CheckCircle2,
  Activity,
  Flame,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { chatService, ChatMessage, ChatAction, AgenticAction } from '../services/chatService';
import { voiceService, VoiceRecognitionState } from '../services/voiceService';
import { apiService } from '../services/apiService';
import { 
  parseVoiceRegistrationIntent, 
  validateEventAvailability, 
  executeProgrammaticRegistration, 
  processVoiceRegistrationCommand, 
  VoiceRegistrationResult, 
  EventAvailabilityCheck,
  ExtractedEventIntent 
} from '../services/eventIntentService';
import { User, CollegeEvent } from '../types';

interface AiChatbotWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onNavigate: (view: string, params?: any) => void;
  onSelectEvent: (id: string) => void;
  onOpenWalletPasses: () => void;
  onOpenJavaModal: () => void;
  onOpenApiTester?: () => void;
  onUserChange?: (user: User) => void;
  currentUser: User | null;
  initialVoiceMode?: boolean;
}

const STARTER_PROMPTS = [
  { icon: '⚡', label: 'Book Hackathon at IIT', query: 'Book the hackathon at IIT college for me' },
  { icon: '🤖', label: 'Book RoboWars at NIT', query: 'Book RoboWars at NIT Trichy for me' },
  { icon: '💻', label: 'Register CodeSprint', query: 'Register me for Kurukshetra CodeSprint at Anna University' },
  { icon: '🎮', label: 'Book Vortex Esports', query: 'Book ticket for Vortex Esports at BITS Pilani' },
  { icon: '📅', label: 'Open Event Calendar', query: 'Open monthly calendar for November 2026' },
  { icon: '🎫', label: 'My Wallet Passes', query: 'Show my registered event tickets and passes' },
  { icon: '🚀', label: 'Upcoming Hackathons', query: 'What hackathons and coding competitions are coming up?' },
  { icon: '🏫', label: 'Events at IIT Madras', query: 'What events are hosted by IIT Madras?' },
  { icon: '🆓', label: 'Free Entry Events', query: 'Which events have free registration (₹0 fee)?' },
  { icon: '🔒', label: 'Unlock Java Code', query: 'Unlock Java Spring Boot backend code and RBAC' },
];

const WAVE_BARS = [
  { height: 28 }, { height: 48 }, { height: 72 }, { height: 38 },
  { height: 88 }, { height: 52 }, { height: 96 }, { height: 64 },
  { height: 82 }, { height: 100 }, { height: 76 }, { height: 92 },
  { height: 68 }, { height: 98 }, { height: 54 }, { height: 86 },
  { height: 100 }, { height: 72 }, { height: 92 }, { height: 58 },
  { height: 82 }, { height: 62 }, { height: 96 }, { height: 44 },
  { height: 78 }, { height: 56 }, { height: 38 }, { height: 22 },
];

export const AiChatbotWidget: React.FC<AiChatbotWidgetProps> = ({
  isOpen,
  onToggle,
  onClose,
  onNavigate,
  onSelectEvent,
  onOpenWalletPasses,
  onOpenJavaModal,
  onOpenApiTester,
  onUserChange,
  currentUser,
  initialVoiceMode = false,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Voice state
  const [voiceState, setVoiceState] = useState<VoiceRecognitionState>(voiceService.getState());
  const [autoSpeak, setAutoSpeak] = useState<boolean>(voiceService.getAutoSpeak());
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [voiceModeActive, setVoiceModeActive] = useState<boolean>(initialVoiceMode);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Subscribe to voice recognition updates
  useEffect(() => {
    const unsubscribe = voiceService.subscribe((state) => {
      setVoiceState(state);
      if (state.transcript && !state.isListening) {
        setInputValue(state.transcript);
      }
    });
    return () => unsubscribe();
  }, []);

  // Initialize chat history or welcome message
  useEffect(() => {
    const history = chatService.getHistory();
    if (history.length > 0) {
      setMessages(history);
    } else {
      const welcomeMessage: ChatMessage = {
        id: 'welcome-msg',
        sender: 'assistant',
        text: `👋 **Welcome to the College Event Hub Agentic AI Assistant!**\n\nI can directly control the website and execute campus tasks for you:\n\n• ⚡ **Autonomous Booking:** Say *"Book the hackathon at IIT"* to instantly create and reserve your pass.\n• 📅 **Website Navigation:** Say *"Open calendar"* or *"Show hackathons"* to navigate anywhere.\n• 🎫 **Digital Passes:** Say *"Show my tickets"* to view holographic Apple Wallet passes.\n• 🎤 **Voice Enabled:** Tap the mic below to speak commands in real-time.\n• 🔒 **Security & Code:** Inspect Java Spring Boot backend and RBAC live.\n\nTry tapping a starter prompt or speak a command!`,
        timestamp: new Date().toISOString(),
        model: 'Gemini 3.8 Flash',
        suggestedActions: [
          { label: '⚡ Book HackNova at IIT', action: 'register_event', target: 'evt-1' },
          { label: '📅 Open Event Calendar', action: 'navigate', target: 'calendar' },
          { label: '🎫 My Wallet Passes', action: 'open_modal', target: 'wallet_pass' },
        ],
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Keyboard shortcut (Cmd+J / Ctrl+J) to open chatbot
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        onToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggle]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen, voiceState.interimTranscript]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !voiceState.isListening) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

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

    setVoiceModeActive(true);
    voiceService.startListening((finalTranscript) => {
      if (finalTranscript.trim()) {
        setInputValue(finalTranscript.trim());
        handleSendMessage(finalTranscript.trim());
      }
    });
  };

  /**
   * Parses natural language voice commands to extract event names, validates availability,
   * and triggers the registration process programmatically.
   *
   * @param voiceCommand The raw speech transcript or text command
   * @returns VoiceRegistrationResult containing extraction details, availability check,
   *          created Registration, spoken message, and feedback UI payload.
   */
  const processNaturalLanguageEventRegistration = (
    voiceCommand: string
  ): VoiceRegistrationResult | null => {
    const events = apiService.getEvents();
    
    // Step 1: Parse user's voice command to extract event names & intent
    const parsedIntent = parseVoiceRegistrationIntent(voiceCommand, events, currentUser);
    
    // If not a registration intent, return null to let normal conversational handler take over
    if (!parsedIntent.isRegistrationIntent || !parsedIntent.matchedEvent) {
      return null;
    }

    // Step 2 & 3: Validate availability and trigger the registration process programmatically
    const result = processVoiceRegistrationCommand(voiceCommand, {
      currentUser,
      events,
    });

    return result;
  };

  const handleSendMessage = async (customText?: string) => {
    const text = (customText || inputValue).trim();
    if (!text || isLoading) return;

    // Stop ongoing speech
    voiceService.stopSpeaking();
    setSpeakingMessageId(null);

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      // 1. First, process natural language intents for event registration
      const regResult = processNaturalLanguageEventRegistration(text);

      if (regResult && regResult.intentDetected) {
        // Execute any agentic action returned (e.g. registration, passes update)
        if (regResult.agenticAction) {
          chatService.executeAgenticAction(regResult.agenticAction, {
            currentUser,
            onNavigate,
            onSelectEvent,
            onOpenWalletPasses,
            onOpenJavaModal,
            onOpenApiTester,
            onUserChange,
          });
        }

        const assistantMsg: ChatMessage = {
          id: 'msg-' + Date.now(),
          sender: 'assistant',
          text: regResult.feedbackMessage,
          timestamp: new Date().toISOString(),
          model: 'Voice Intent Agent (Gemini 3.8)',
          suggestedActions: regResult.suggestedActions,
          agenticAction: regResult.agenticAction,
        };

        const updatedMessages = [...newHistory, assistantMsg];
        setMessages(updatedMessages);
        chatService.saveHistory(updatedMessages);

        // Immediate audio voice feedback
        if (autoSpeak || voiceModeActive) {
          setSpeakingMessageId(assistantMsg.id);
          voiceService.speak(regResult.spokenMessage, () => {
            setSpeakingMessageId(null);
          });
        }
        return;
      }

      // 2. Otherwise process through standard conversational chat engine
      const response = await chatService.sendMessage(text, newHistory, currentUser);
      
      // Execute any agentic action returned by AI
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

      // Speak answer aloud if auto-speak is enabled
      if (autoSpeak) {
        setSpeakingMessageId(response.id);
        voiceService.speak(response.text, () => {
          setSpeakingMessageId(null);
        });
      }
    } catch (err) {
      console.error('Chat send error:', err);
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        sender: 'assistant',
        text: "I encountered a brief issue connecting. You can still ask me about events, calendar schedules, and ticket passes!",
        timestamp: new Date().toISOString(),
        model: 'Local Fallback',
      };
      setMessages([...newHistory, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    chatService.clearHistory();
    voiceService.stopSpeaking();
    setSpeakingMessageId(null);
    const initialWelcome: ChatMessage = {
      id: 'welcome-reset',
      sender: 'assistant',
      text: "✨ Conversation cleared! Speak or type a command to control the website or explore campus events.",
      timestamp: new Date().toISOString(),
      model: 'Gemini 3.8 Flash',
      suggestedActions: [
        { label: '⚡ Book HackNova at IIT', action: 'register_event', target: 'evt-1' },
        { label: '📅 Event Calendar', action: 'navigate', target: 'calendar' },
        { label: '🎫 My Passes', action: 'open_modal', target: 'wallet_pass' },
      ],
    };
    setMessages([initialWelcome]);
  };

  const handleActionClick = (action: ChatAction) => {
    if (action.action === 'view_event' && action.target) {
      onSelectEvent(action.target);
    } else if (action.action === 'register_event' && action.target) {
      // Direct booking via agent
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
      // Add confirmation message
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

  // Render text with lightweight Markdown formatting
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      // Bold syntax **text**
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={idx} className={line.trim() === '' ? 'h-2' : 'leading-relaxed text-xs sm:text-sm'}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-semibold text-white drop-shadow-sm">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith('`') && part.endsWith('`')) {
              return (
                <code key={pIdx} className="px-1.5 py-0.5 mx-0.5 rounded bg-black/40 text-cyan-300 font-mono text-[11px] border border-cyan-500/20">
                  {part.slice(1, -1)}
                </code>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  // Real-time live intent parsing while user speaks into microphone
  const liveTranscriptText = (voiceState.interimTranscript || voiceState.transcript || '').trim();
  const liveDetectedIntent = liveTranscriptText
    ? parseVoiceRegistrationIntent(liveTranscriptText, apiService.getEvents(), currentUser)
    : null;

  return (
    <>
      {/* Floating Apple Liquid Glass AI Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-24 right-5 sm:bottom-8 sm:right-8 z-50 flex items-center gap-2 group">
          {/* Quick Voice Command pill */}
          <button
            onClick={() => {
              onToggle();
              setTimeout(() => handleStartVoice(), 200);
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-cyan-400 hover:text-cyan-300 text-xs font-medium border border-cyan-500/30 shadow-lg shadow-cyan-900/20 backdrop-blur-xl transition-all duration-200 hover:scale-105 active:scale-95"
            title="Voice Command (Speak to AI)"
          >
            <Mic className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Voice Command</span>
          </button>

          {/* Main Floating Orb Trigger */}
          <button
            onClick={onToggle}
            className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 text-white shadow-2xl shadow-indigo-500/40 border border-white/30 backdrop-blur-2xl transition-all duration-300 hover:scale-110 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-cyan-500/30"
            aria-label="Open AI Campus Assistant"
            title="Ask Campus AI (⌘J)"
          >
            {/* Luminous Pulsing Glow Rings */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 opacity-70 blur-md group-hover:opacity-100 group-hover:blur-lg transition duration-500 animate-pulse" />
            
            <div className="relative z-10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300 drop-shadow-md" />
            </div>

            {/* Glowing online micro-badge */}
            <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 shadow-sm animate-ping" />
            <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 shadow-sm" />
          </button>
        </div>
      )}

      {/* Main Glass AI Chat Drawer / Window */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col transition-all duration-300 ease-out shadow-2xl border border-white/20 backdrop-blur-3xl bg-slate-900/90 text-slate-100 ${
            isExpanded
              ? 'inset-3 sm:inset-6 rounded-3xl'
              : 'bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 w-auto sm:w-[440px] md:w-[480px] h-[640px] max-h-[88vh] rounded-3xl'
          } overflow-hidden shadow-cyan-950/40 ring-1 ring-white/10`}
        >
          {/* Top Liquid Glass Navigation Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/80 backdrop-blur-2xl select-none">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25 border border-white/20">
                <Bot className="w-5 h-5 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-white tracking-wide">Campus Agentic AI</h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    Voice & Control
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span>Gemini 3.8 Flash</span>
                  <span>•</span>
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Agent Ready
                  </span>
                </p>
              </div>
            </div>

            {/* Window & Voice Controls */}
            <div className="flex items-center gap-1 text-slate-400">
              {/* Auto Speak Toggle */}
              <button
                onClick={toggleAutoSpeak}
                className={`p-1.5 rounded-lg transition-colors ${
                  autoSpeak
                    ? 'text-cyan-400 hover:text-cyan-300 bg-cyan-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title={autoSpeak ? 'Voice output: ON (Click to mute)' : 'Voice output: MUTED (Click to unmute)'}
              >
                {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Clear chat */}
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
                title="Clear conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Expand / Minimize Window */}
              <button
                onClick={() => setIsExpanded(prev => !prev)}
                className="hidden sm:block p-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
                title={isExpanded ? 'Restore window size' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:text-red-400 hover:bg-red-500/10 transition-colors ml-0.5"
                title="Close AI Assistant (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Visual Voice Recognition Overlay Indicator with Active Waveform */}
          {voiceState.isListening && (
            <div className="absolute inset-x-0 top-[61px] bottom-0 z-40 bg-slate-950/95 backdrop-blur-3xl flex flex-col justify-between p-4 sm:p-5 overflow-hidden transition-all duration-300 animate-in fade-in select-none">
              {/* Ambient radiant background glow */}
              <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-fuchsia-500/15 blur-3xl pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

              {/* Top Status Header */}
              <div className="relative z-10 flex items-center justify-between w-full pb-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-medium shadow-lg shadow-red-500/10">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                  </span>
                  <span className="tracking-wide uppercase text-[10px] sm:text-[11px] font-bold text-white">Voice Recognition Active</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-1 rounded-full border border-cyan-500/20">
                    Live Mic • 44.1kHz
                  </span>
                  <button
                    onClick={() => voiceService.stopListening()}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Cancel voice recognition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Central Audio Waveform & Microphone Visualizer */}
              <div className="relative z-10 flex flex-col items-center justify-center my-auto py-2">
                {/* Concentric Pulsing Sound Wave Ripple Rings */}
                <div className="relative flex items-center justify-center w-24 h-24 mb-4">
                  <div className="absolute inset-0 rounded-full border border-red-500/30 animate-wave-ring" />
                  <div className="absolute -inset-3 rounded-full border border-cyan-500/30 animate-wave-ring" style={{ animationDelay: '0.6s' }} />
                  <div className="absolute -inset-6 rounded-full border border-indigo-500/20 animate-wave-ring" style={{ animationDelay: '1.2s' }} />
                  <div className="relative z-10 flex items-center justify-center w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-red-500 via-rose-500 to-indigo-600 shadow-2xl shadow-red-500/40 border border-white/30 text-white animate-wave-glow">
                    <Mic className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-md animate-pulse" />
                  </div>
                </div>

                {/* Active Audio Waveform Equalizer Animation */}
                <div className="w-full max-w-xs h-16 flex items-center justify-center gap-1 sm:gap-1.5 px-3 py-2 bg-slate-900/70 rounded-2xl border border-white/10 backdrop-blur-xl shadow-inner mb-3">
                  {WAVE_BARS.map((bar, idx) => (
                    <div
                      key={idx}
                      className="w-1 sm:w-1.5 rounded-full bg-gradient-to-t from-cyan-400 via-indigo-400 to-fuchsia-400 origin-bottom transition-all"
                      style={{
                        height: `${bar.height}%`,
                        animation: `wave-bounce ${0.7 + (idx % 6) * 0.12}s ease-in-out infinite alternate`,
                        animationDelay: `${(idx * 40) % 800}ms`,
                        boxShadow: '0 0 8px rgba(6, 182, 212, 0.4)',
                      }}
                    />
                  ))}
                </div>

                {/* Live Speech Recognition Feedback Card */}
                <div className="w-full max-w-sm px-4 py-3 rounded-2xl bg-white/5 border border-cyan-400/30 backdrop-blur-md shadow-lg text-center">
                  <p className="text-[10px] uppercase tracking-wider text-cyan-400 font-semibold mb-1 flex items-center justify-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span>{voiceState.interimTranscript || voiceState.transcript ? 'Live Speech Transcription' : 'Listening For Audio Command'}</span>
                  </p>
                  <p className="text-xs sm:text-sm text-white font-medium italic min-h-[28px] flex items-center justify-center px-1">
                    {voiceState.interimTranscript || voiceState.transcript ? (
                      <>
                        "{voiceState.interimTranscript || voiceState.transcript}"
                        <span className="inline-block w-1.5 h-4 ml-1 bg-cyan-400 animate-pulse align-middle" />
                      </>
                    ) : (
                      <span className="text-slate-400 not-italic text-xs">
                        Speak clearly... e.g. <strong className="text-cyan-300 font-medium">"Book the hackathon at IIT"</strong>
                      </span>
                    )}
                  </p>
                </div>

                {/* Live Natural Language Registration Intent Detection Indicator */}
                {liveDetectedIntent?.isRegistrationIntent && liveDetectedIntent.matchedEvent && (
                  <div className="w-full max-w-sm mt-2.5 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-cyan-500/15 to-indigo-500/20 border border-emerald-400/40 backdrop-blur-md shadow-lg text-left animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between gap-1 text-[10px] text-emerald-300 font-semibold uppercase tracking-wider mb-1">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
                        <span>Registration Intent Identified</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-mono">
                        Validated Available
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{liveDetectedIntent.matchedEvent.title}</span>
                    </div>
                    <div className="text-[11px] text-cyan-200 flex items-center justify-between mt-0.5">
                      <span className="truncate">{liveDetectedIntent.matchedEvent.collegeName}</span>
                      <span className="font-mono text-emerald-300 font-semibold shrink-0 ml-1">
                        {Math.max(0, liveDetectedIntent.matchedEvent.maxParticipants - liveDetectedIntent.matchedEvent.registrationCount)} seats open
                      </span>
                    </div>
                  </div>
                )}

                {/* Quick Voice Command Suggestion Chips */}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 max-w-sm">
                  <button
                    onClick={() => {
                      voiceService.stopListening();
                      handleSendMessage('Book the hackathon at IIT college for me');
                    }}
                    className="text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 hover:border-cyan-400/60 transition-all flex items-center gap-1 active:scale-95"
                  >
                    <Zap className="w-2.5 h-2.5 text-amber-400" /> Book Hackathon at IIT
                  </button>
                  <button
                    onClick={() => {
                      voiceService.stopListening();
                      handleSendMessage('Book RoboWars at NIT Trichy for me');
                    }}
                    className="text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full bg-rose-500/15 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 hover:border-rose-400/60 transition-all flex items-center gap-1 active:scale-95"
                  >
                    <Award className="w-2.5 h-2.5 text-rose-300" /> Book RoboWars at NIT
                  </button>
                  <button
                    onClick={() => {
                      voiceService.stopListening();
                      handleSendMessage('Register me for Kurukshetra CodeSprint at Anna University');
                    }}
                    className="text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 hover:border-emerald-400/60 transition-all flex items-center gap-1 active:scale-95"
                  >
                    <Award className="w-2.5 h-2.5 text-emerald-300" /> Register CodeSprint
                  </button>
                  <button
                    onClick={() => {
                      voiceService.stopListening();
                      handleSendMessage('Open monthly calendar for November 2026');
                    }}
                    className="text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full bg-purple-500/15 hover:bg-purple-500/30 text-purple-200 border border-purple-400/30 hover:border-purple-400/60 transition-all flex items-center gap-1 active:scale-95"
                  >
                    <Calendar className="w-2.5 h-2.5 text-purple-300" /> Open Calendar
                  </button>
                  <button
                    onClick={() => {
                      voiceService.stopListening();
                      handleSendMessage('Show my registered event tickets and passes');
                    }}
                    className="text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 hover:border-indigo-400/60 transition-all flex items-center gap-1 active:scale-95"
                  >
                    <Ticket className="w-2.5 h-2.5 text-indigo-300" /> My Wallet Passes
                  </button>
                </div>
              </div>

              {/* Bottom Control Actions */}
              <div className="relative z-10 w-full pt-3 border-t border-white/10 flex items-center justify-between gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => voiceService.stopListening()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-all active:scale-95"
                >
                  <MicOff className="w-3.5 h-3.5 text-red-400" />
                  <span>Stop Mic</span>
                </button>

                <button
                  type="button"
                  disabled={!voiceState.interimTranscript && !voiceState.transcript && !inputValue}
                  onClick={() => {
                    const spoken = (voiceState.interimTranscript || voiceState.transcript || inputValue).trim();
                    voiceService.stopListening();
                    if (spoken) {
                      handleSendMessage(spoken);
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/25 border border-white/20 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute Spoken Command</span>
                </button>
              </div>
            </div>
          )}

          {/* Starter Chips Bar */}
          <div className="py-2 px-3 border-b border-white/5 bg-slate-950/40 overflow-x-auto custom-scrollbar flex items-center gap-1.5 select-none shrink-0">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider shrink-0 flex items-center gap-1 pl-1 pr-1">
              <Zap className="w-2.5 h-2.5 text-amber-400" /> Fast Commands:
            </span>
            {STARTER_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt.query)}
                className="shrink-0 flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-200 border border-white/10 hover:border-cyan-400/40 transition-all duration-150 active:scale-95"
              >
                <span>{prompt.icon}</span>
                <span>{prompt.label}</span>
              </button>
            ))}
          </div>

          {/* Conversation Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/50">
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
                          <Sparkles className="w-3 h-3" /> Campus AI
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

                  {/* Message Bubble */}
                  <div
                    className={`relative group max-w-[88%] sm:max-w-[82%] px-4 py-3 rounded-2xl ${
                      isAssistant
                        ? 'bg-slate-800/80 text-slate-100 rounded-tl-sm border border-white/15 shadow-lg backdrop-blur-xl'
                        : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-tr-sm shadow-md shadow-indigo-600/20'
                    }`}
                  >
                    <div className="space-y-1">
                      {renderFormattedText(msg.text)}
                    </div>

                    {/* Agentic Action Execution Card if present */}
                    {isAssistant && msg.agenticAction && (
                      <div className="mt-3 pt-3 border-t border-cyan-500/20">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-950/60 via-slate-900/90 to-indigo-950/60 border border-cyan-400/40 shadow-inner">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-semibold tracking-wide">
                              <Zap className="w-3 h-3 text-cyan-400" />
                              {msg.agenticAction.badge || 'AGENTIC ACTION EXECUTED'}
                            </span>
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                              <CheckCircle2 className="w-3 h-3" /> Auto-Confirmed
                            </span>
                          </div>

                          {msg.agenticAction.type === 'book_event' && (
                            <div className="space-y-1.5 text-xs text-slate-200">
                              <div className="font-semibold text-white flex items-center gap-1.5 text-sm">
                                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                                <span>{msg.agenticAction.eventTitle || 'Flagship Event'}</span>
                              </div>
                              <div className="text-slate-400 text-[11px] flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-slate-400" />
                                <span>{msg.agenticAction.collegeName || 'IIT Madras'}</span>
                              </div>
                              {msg.agenticAction.registration && (
                                <div className="mt-2 p-2 rounded-lg bg-black/40 border border-white/10 font-mono text-[11px] flex items-center justify-between">
                                  <span className="text-slate-400">Pass Ticket:</span>
                                  <span className="text-cyan-300 font-bold">{msg.agenticAction.registration.ticketNumber}</span>
                                </div>
                              )}
                              <div className="pt-2 flex flex-wrap gap-2">
                                <button
                                  onClick={onOpenWalletPasses}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-[11px] shadow-sm transition-all"
                                >
                                  <Ticket className="w-3 h-3" /> View Apple Pass
                                </button>
                                <button
                                  onClick={() => onNavigate('calendar')}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-[11px] transition-all"
                                >
                                  <Calendar className="w-3 h-3 text-cyan-300" /> View on Calendar
                                </button>
                              </div>
                            </div>
                          )}

                          {msg.agenticAction.type === 'navigate' && (
                            <div className="text-xs text-slate-200 flex items-center justify-between">
                              <span>Target: <strong>{msg.agenticAction.view?.toUpperCase()}</strong> View</span>
                              <button
                                onClick={() => onNavigate(msg.agenticAction?.view || 'events')}
                                className="px-2 py-1 rounded bg-cyan-500 text-slate-900 font-bold text-[11px]"
                              >
                                Go Now
                              </button>
                            </div>
                          )}

                          {msg.agenticAction.type === 'open_modal' && (
                            <div className="text-xs text-slate-200 flex items-center justify-between">
                              <span>Opened component modal</span>
                              <button
                                onClick={() => {
                                  if (msg.agenticAction?.modal === 'wallet_pass') onOpenWalletPasses();
                                  else if (msg.agenticAction?.modal === 'java_code') onOpenJavaModal();
                                }}
                                className="px-2 py-1 rounded bg-indigo-500 text-white font-medium text-[11px]"
                              >
                                View Modal
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer Controls for Assistant */}
                    {isAssistant && (
                      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {msg.model || 'Gemini 3.8 Flash'}
                        </span>
                        <div className="flex items-center gap-2">
                          {/* Speak audio button */}
                          <button
                            onClick={() => speakMessage(msg.text, msg.id)}
                            className={`flex items-center gap-1 text-xs transition-colors ${
                              isSpeakingThis ? 'text-cyan-400 font-medium' : 'text-slate-400 hover:text-white'
                            }`}
                            title={isSpeakingThis ? 'Stop speaking' : 'Listen to this response'}
                          >
                            {isSpeakingThis ? (
                              <>
                                <Square className="w-3 h-3 text-red-400" />
                                <span className="text-cyan-400 text-[10px]">Speaking...</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3" />
                                <span className="text-[10px]">Speak</span>
                              </>
                            )}
                          </button>

                          {/* Copy button */}
                          <button
                            onClick={() => copyToClipboard(msg.text, msg.id)}
                            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 text-[10px]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span className="text-[10px]">Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Suggested Action Buttons if present */}
                  {isAssistant && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 pl-1">
                      {msg.suggestedActions.map((action, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleActionClick(action)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/15 via-indigo-500/15 to-purple-500/15 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-400/30 hover:border-cyan-400/60 text-cyan-200 hover:text-white text-xs font-medium shadow-sm transition-all duration-150 active:scale-95"
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

            {/* Live voice speech transcription preview */}
            {voiceState.isListening && voiceState.interimTranscript && (
              <div className="flex flex-col items-end gap-1">
                <span className="text-[11px] text-red-300 px-1 font-medium flex items-center gap-1">
                  <Mic className="w-3 h-3 animate-pulse text-red-400" /> Hearing you...
                </span>
                <div className="px-4 py-2.5 rounded-2xl rounded-tr-sm bg-indigo-900/60 border border-indigo-400/30 text-white text-xs sm:text-sm italic shadow-md">
                  "{voiceState.interimTranscript}"
                </div>
              </div>
            )}

            {/* Thinking / Streaming Indicator */}
            {isLoading && (
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-1.5 px-1 text-[11px] text-cyan-400 font-medium">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  <span>Agent executing request...</span>
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-slate-800/80 border border-white/10 backdrop-blur-xl flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs text-slate-400 ml-1">Analyzing campus records & executing actions</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form with Voice Mic Control */}
          <div className="p-3 border-t border-white/10 bg-slate-900/90 backdrop-blur-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-center gap-2"
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
                placeholder={voiceState.isListening ? "Listening... speak now" : "Speak or type: 'Book hackathon at IIT', 'Open calendar'..."}
                disabled={isLoading}
                className="flex-1 bg-slate-950/60 border border-white/15 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20 text-slate-100 placeholder-slate-400 rounded-2xl px-4 py-3 text-xs sm:text-sm resize-none outline-none transition-all duration-150 leading-relaxed custom-scrollbar max-h-24"
              />

              {/* Voice Microphone Button */}
              <button
                type="button"
                onClick={handleStartVoice}
                className={`flex items-center justify-center w-11 h-11 rounded-2xl border transition-all duration-200 shrink-0 ${
                  voiceState.isListening
                    ? 'bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/30 scale-105 animate-pulse'
                    : 'bg-white/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border-white/15 hover:border-cyan-400/40'
                }`}
                title={voiceState.isListening ? 'Stop recording voice' : 'Speak voice command (Web Speech API)'}
              >
                {voiceState.isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-medium shadow-lg shadow-indigo-500/25 border border-white/20 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all duration-150 shrink-0"
                title="Send message (Enter)"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-400 select-none">
              <span className="flex items-center gap-1.5">
                <Mic className="w-3 h-3 text-cyan-400" />
                <span>Voice Enabled & Agentic Control Active</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="hidden sm:inline">Try: <strong className="text-slate-300 font-normal">"Book hackathon"</strong></span>
                <span>•</span>
                <span><kbd className="px-1 py-0.2 rounded bg-white/10 text-slate-300 font-mono">Enter ↵</kbd></span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
