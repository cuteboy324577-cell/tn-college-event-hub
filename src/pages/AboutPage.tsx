import React from 'react';
import { 
  GraduationCap, 
  Terminal, 
  Code2, 
  ShieldCheck, 
  QrCode, 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenApiTester: () => void;
  onOpenJavaModal: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onNavigate,
  onOpenApiTester,
  onOpenJavaModal,
}) => {
  const faqs = [
    {
      q: 'How do students receive their event entry passes?',
      a: 'Immediately after registering on the portal, a unique ticket number (e.g. TKT-CEH-882190) and scannable QR pass are issued on screen with one-click print and digital download options.'
    },
    {
      q: 'Can colleges manage team sizes and registrations?',
      a: 'Yes. Organizers configure team sizing (Individual, 2-4 Members, 4-6 Members, or Flexible) and max attendee thresholds. Attendee rosters can be exported to CSV at any time.'
    },
    {
      q: 'How does the interactive REST API console work?',
      a: 'Click the "REST API" button in the navbar to open the live console. You can execute GET, POST, PUT, and DELETE queries against all endpoints with real latency simulation and copy cURL commands.'
    },
    {
      q: 'Can I export the Java Spring Boot source code?',
      a: 'Yes! Click "Java Backend" in the top bar to inspect all Spring Data JPA models, controllers, and pom.xml configuration, or download the full companion zip package.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
          <GraduationCap className="w-4 h-4" />
          <span>Inter-Collegiate Innovation Network</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          About College Event Hub
        </h1>
        <p className="max-w-2xl mx-auto text-slate-600 text-sm sm:text-base leading-relaxed">
          The unified digital platform engineered to bridge the gap between higher education event organizers and thousands of student participants nationwide.
        </p>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Centralized Discovery</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Eliminates fragmented WhatsApp groups and social posts with a standardized catalog of competitions, prizes, and timelines.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Frictionless Gate Passes</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Automated ticket pass generation and scannable QR credentials ensure quick campus gate entry and crowd management.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Code2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Developer Architecture</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Built as a modern full-stack ecosystem with integrated REST API sandbox tools and enterprise Spring Boot companion code.
          </p>
        </div>
      </div>

      {/* Architecture Showcase */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase text-indigo-400">Enterprise Engineering</span>
            <h2 className="text-2xl font-extrabold text-white mt-1">Full-Stack System Design</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onOpenApiTester}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Launch API Console</span>
            </button>
            <button
              onClick={onOpenJavaModal}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Java Spring Boot Code</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 space-y-2">
            <div className="font-bold text-white text-sm">Frontend Layer</div>
            <p>React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti, and LocalStorage synchronized state engine.</p>
          </div>
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 space-y-2">
            <div className="font-bold text-white text-sm">Companion Backend</div>
            <p>Spring Boot 3.3.4, Java 21, Spring Data JPA, Hibernate, In-memory H2 Database Console, and modular REST Controllers.</p>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="space-y-6">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight text-center">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
