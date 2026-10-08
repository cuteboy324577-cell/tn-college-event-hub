import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Play, 
  Copy, 
  Check, 
  RotateCcw, 
  Database, 
  Layers, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { apiService } from '../services/apiService';

interface RestApiTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EndpointPreset {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  defaultBody?: string;
}

const ENDPOINT_PRESETS: EndpointPreset[] = [
  {
    name: 'Get All Events',
    method: 'GET',
    path: '/api/events',
    description: 'Fetch complete list of inter-college events and hackathons',
  },
  {
    name: 'Get Event by ID',
    method: 'GET',
    path: '/api/events/evt-101',
    description: 'Fetch details for Shaastra 2026 AI Hackathon',
  },
  {
    name: 'Create New Event',
    method: 'POST',
    path: '/api/events',
    description: 'Register a new collegiate symposium or competition',
    defaultBody: JSON.stringify({
      title: 'Genesis 2026: Web3 & Quantum Hack',
      description: 'Prototype decentralized architectures and hybrid cryptographic smart contracts.',
      category: 'Hackathon',
      collegeId: 'clg-1',
      collegeName: 'Indian Institute of Technology Madras',
      date: '2026-12-18',
      time: '10:00 AM',
      venue: 'IC&SR Auditorium, IIT Madras',
      registrationDeadline: '2026-12-10',
      fee: 0,
      maxParticipants: 100,
      teamSize: '2-4 Members',
      prizePool: '₹1,25,000',
      status: 'upcoming',
      tags: ['Web3', 'Quantum', 'Cryptography'],
      coordinatorName: 'Vikram Sethi',
      coordinatorContact: '+91 98401 99887',
      coordinatorEmail: 'genesis@iitm.ac.in',
      rules: ['All repositories must be initialized during opening hour.'],
      schedule: [{ time: '10:00 AM', activity: 'Keynote & Problem Release' }],
      bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    }, null, 2),
  },
  {
    name: 'Get All Colleges',
    method: 'GET',
    path: '/api/colleges',
    description: 'Fetch registered collegiate universities with event tallies',
  },
  {
    name: 'Get College by ID',
    method: 'GET',
    path: '/api/colleges/clg-1',
    description: 'Fetch institution profile for IIT Madras',
  },
  {
    name: 'Get Registrations',
    method: 'GET',
    path: '/api/registrations',
    description: 'Fetch student registration passes & ticket numbers',
  },
  {
    name: 'Book Event Ticket',
    method: 'POST',
    path: '/api/registrations',
    description: 'Create a student ticket pass and allocate a QR code',
    defaultBody: JSON.stringify({
      eventId: 'evt-101',
      eventTitle: 'Shaastra 2026: AI & Autonomous Robotics Hackathon',
      collegeName: 'Indian Institute of Technology Madras',
      participantName: 'Arun Vijay',
      participantEmail: 'arun.v@college.edu',
      participantPhone: '+91 98765 11223',
      participantCollege: 'PSG College of Technology',
      rollNumber: '2024CS091',
      department: 'Computer Science',
      yearOfStudy: '2nd Year',
      teamName: 'CyberKnights',
    }, null, 2),
  },
  {
    name: 'Get Platform Stats',
    method: 'GET',
    path: '/api/stats',
    description: 'Aggregated analytics: counts, total prize pool, active colleges',
  },
  {
    name: 'RBAC: View Source Code',
    method: 'GET',
    path: '/api/admin/code',
    description: 'Tests @PreAuthorize: Allowed for Admin & Organizer, 403 Forbidden for Participant',
  },
  {
    name: 'RBAC: Update Code File',
    method: 'PUT',
    path: '/api/admin/code',
    description: 'Tests @PreAuthorize: Allowed for Admin only, 403 Forbidden for Organizer & Participant',
    defaultBody: JSON.stringify({
      path: 'src/main/resources/application.properties',
      content: '# Updated securely by authenticated administrator\nserver.port=8080\napp.jwt.secret=9a4f2c8d3b7a1e6f5c8d0e2b4a6f8c1d3e5b7a9c\n'
    }, null, 2),
  },
  {
    name: 'RBAC: View Audit Logs',
    method: 'GET',
    path: '/api/admin/audit-logs',
    description: 'Query security access attempts and 403 Forbidden events',
  },
];

export const RestApiTesterModal: React.FC<RestApiTesterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [urlPath, setUrlPath] = useState<string>('/api/events');
  const [requestBody, setRequestBody] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<any | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: EndpointPreset) => {
    setSelectedMethod(preset.method);
    setUrlPath(preset.path);
    setRequestBody(preset.defaultBody || '');
    setResponse(null);
  };

  const handleSendRequest = async () => {
    setLoading(true);
    let parsedBody: any = null;
    if (['POST', 'PUT'].includes(selectedMethod) && requestBody.trim()) {
      try {
        parsedBody = JSON.parse(requestBody);
      } catch (e: any) {
        setResponse({
          status: 400,
          statusText: 'Client JSON Syntax Error',
          timeMs: 1,
          data: { error: 'Invalid JSON payload in request body: ' + e.message },
          headers: {},
        });
        setLoading(false);
        return;
      }
    }

    const res = await apiService.executeSimulatedApi(selectedMethod, urlPath, parsedBody);
    setResponse(res);
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCurlSnippet = () => {
    let curl = `curl -X ${selectedMethod} "https://college-event-hub.org${urlPath}" \\\n  -H "Content-Type: application/json"`;
    if (['POST', 'PUT'].includes(selectedMethod) && requestBody.trim()) {
      curl += ` \\\n  -d '${requestBody.replace(/\n/g, '')}'`;
    }
    return curl;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl text-slate-200 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Interactive REST API Console</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Execute live requests against College Event Hub endpoints with simulated Spring Boot responses
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Preset Buttons */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Quick Endpoint Presets:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ENDPOINT_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition ${
                    urlPath === preset.path && selectedMethod === preset.method
                      ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-xs'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-semibold truncate">{preset.name}</span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                      preset.method === 'GET' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {preset.method}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">{preset.path}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Request Bar */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Method Selector */}
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value as any)}
                aria-label="HTTP Method"
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold font-mono text-indigo-300 focus:outline-hidden focus:border-indigo-500 shrink-0"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>

              {/* URL Input */}
              <div className="flex-1 relative flex items-center">
                <span className="absolute left-3 text-slate-500 text-xs font-mono hidden sm:inline">
                  https://college-event-hub.org
                </span>
                <input
                  type="text"
                  value={urlPath}
                  onChange={(e) => setUrlPath(e.target.value)}
                  placeholder="/api/events"
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl py-2 pl-3 sm:pl-[208px] pr-3 text-xs font-mono text-emerald-400 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendRequest}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-indigo-600/30"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                <span>Send Request</span>
              </button>
            </div>
          </div>

          {/* Request Payload Editor (if POST or PUT) */}
          {['POST', 'PUT'].includes(selectedMethod) && (
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                <span>Request Body (JSON):</span>
                <span className="text-[11px] text-slate-500 font-mono">application/json</span>
              </div>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                rows={7}
                className="w-full bg-slate-950/90 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-hidden focus:border-indigo-500"
                placeholder='{ "title": "...", "category": "..." }'
              />
            </div>
          )}

          {/* Response Container */}
          {response && (
            <div className="border border-slate-800 rounded-xl bg-slate-950/80 overflow-hidden space-y-0">
              
              {/* Response Header Status */}
              <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-medium">Status:</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${
                    response.status >= 200 && response.status < 300
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {response.status} {response.statusText}
                  </span>
                  <span className="text-slate-400 font-medium">Time:</span>
                  <span className="text-cyan-400 font-semibold">{response.timeMs} ms</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(response.data, null, 2))}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied JSON' : 'Copy Response'}</span>
                  </button>
                </div>
              </div>

              {/* Response JSON Display */}
              <div className="p-4 overflow-x-auto max-h-72">
                <pre className="text-xs font-mono text-emerald-300 leading-relaxed whitespace-pre">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Curl Command Snippet */}
          <div className="bg-slate-950/50 rounded-xl border border-slate-800 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">cURL equivalent:</span>
              <button
                onClick={() => copyToClipboard(getCurlSnippet())}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono"
              >
                Copy curl
              </button>
            </div>
            <pre className="text-[11px] font-mono text-slate-400 overflow-x-auto whitespace-pre">
              {getCurlSnippet()}
            </pre>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Simulates all Spring Boot JPA REST transactions instantly with browser persistence</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
