import React, { useState, useEffect } from 'react';
import { 
  X, 
  Code2, 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  FolderTree, 
  Terminal, 
  Coffee,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Save,
  Eye,
  AlertTriangle,
  History,
  UserCheck
} from 'lucide-react';
import { User, getRolePermissions, AuditLogEntry } from '../types';
import { apiService } from '../services/apiService';
import { JavaFile } from '../data/javaSourceCode';
import { downloadJavaSpringBootZip } from '../utils/zipGenerator';

interface JavaProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUserChange: (user: User) => void;
}

export const JavaProjectModal: React.FC<JavaProjectModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
}) => {
  const permissions = getRolePermissions(currentUser.role);
  const [files, setFiles] = useState<JavaFile[]>(() => apiService.getJavaFiles());
  const [selectedFile, setSelectedFile] = useState<JavaFile>(() => files[0]);
  const [editableContent, setEditableContent] = useState<string>(() => files[0]?.content || '');
  
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Update file list & active file on mount or role change
  useEffect(() => {
    if (isOpen) {
      const currentFiles = apiService.getJavaFiles();
      setFiles(currentFiles);
      if (currentFiles.length > 0) {
        setSelectedFile(currentFiles[0]);
        setEditableContent(currentFiles[0].content);
      }
      setAuditLogs(apiService.getAuditLogs());

      // If participant tries to open, log security event
      if (!permissions.canViewJavaCode) {
        apiService.logAccessAttempt(
          'ATTEMPT_UNAUTHORIZED',
          '/api/admin/code',
          currentUser,
          '403_FORBIDDEN',
          `Unauthorized attempt by role '${currentUser.role}'`
        );
      } else {
        apiService.logAccessAttempt(
          'VIEW',
          '/api/admin/code',
          currentUser,
          '200_ALLOWED',
          `Authorized access by '${currentUser.role}'`
        );
      }
    }
  }, [isOpen, currentUser]);

  // When selected file changes
  const handleSelectFile = (file: JavaFile) => {
    setSelectedFile(file);
    setEditableContent(file.content);
    setSaveSuccess(false);
  };

  if (!isOpen) return null;

  // 1. RBAC CHECK: 403 ACCESS DENIED SCREEN FOR PARTICIPANTS
  if (!permissions.canViewJavaCode) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-slate-900 border border-rose-500/30 rounded-3xl w-full max-w-lg text-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-center relative">
          
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* 403 Icon */}
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              HTTP 403 FORBIDDEN
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Access Denied: Protected Code Repository
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
              Your active account role is <strong className="text-white uppercase font-mono">Participant ({currentUser.name})</strong>.
              In accordance with backend security policies, access to the Java Spring Boot source code and microservice architecture is strictly restricted to certified Organizers and Administrators.
            </p>
          </div>

          {/* Role Policy Summary */}
          <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 text-left text-xs space-y-2">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>RBAC Security Clearance:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="font-semibold text-amber-300">ROLE_ORGANIZER</div>
                <div className="text-slate-400">Read-Only Source View</div>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="font-semibold text-emerald-300">ROLE_ADMIN</div>
                <div className="text-slate-400">Full Edit & Export Control</div>
              </div>
            </div>
          </div>

          {/* Quick-Switch Demo Role Action */}
          <div className="space-y-2 pt-2">
            <div className="text-[11px] text-slate-400 font-medium">Switch persona to test role-based clearance:</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  const updated = apiService.switchUserRole('college_admin');
                  onUserChange(updated);
                }}
                className="py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Switch to Organizer</span>
              </button>

              <button
                onClick={() => {
                  const updated = apiService.switchUserRole('super_admin');
                  onUserChange(updated);
                }}
                className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Switch to Admin</span>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-300 transition"
            >
              Close Window
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 2. AUTHORIZED ACCESS (ADMIN OR ORGANIZER)
  const isOrganizer = currentUser.role === 'college_admin' || currentUser.role === 'organizer';
  const isAdmin = currentUser.role === 'super_admin' || currentUser.role === 'admin';

  const handleCopy = () => {
    navigator.clipboard.writeText(editableContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveFile = () => {
    if (!permissions.canEditJavaCode) return;
    const res = apiService.updateJavaFile(selectedFile.path, editableContent, currentUser);
    if (res.success) {
      setSaveSuccess(true);
      setFiles(apiService.getJavaFiles());
      setTimeout(() => setSaveSuccess(false), 2500);
    } else {
      alert(res.error || 'Failed to update file');
    }
  };

  const handleDownloadZip = async () => {
    try {
      setDownloading(true);
      await downloadJavaSpringBootZip();
      setDownloadSuccess(true);
      apiService.logAccessAttempt(
        'DOWNLOAD',
        'college-event-hub-spring-boot.zip',
        currentUser,
        '200_ALLOWED',
        `Downloaded by ${currentUser.role}`
      );
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to download zip:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-6xl text-slate-200 shadow-2xl flex flex-col h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white tracking-tight">Java Spring Boot Architecture</h2>
                {isAdmin ? (
                  <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>ROLE_ADMIN: Full Access (Edit Enabled)</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>ROLE_ORGANIZER: Read-Only View</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Spring Boot 3.3.4 • Spring Security 6 RBAC • In-Memory H2 DB & JWT Auth
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Audit Logs button */}
            <button
              onClick={() => {
                setAuditLogs(apiService.getAuditLogs());
                setShowAuditLogs(!showAuditLogs);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                showAuditLogs 
                  ? 'bg-indigo-600 text-white border-indigo-500' 
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Audit Log</span>
            </button>

            {/* Download Full Zip */}
            <button
              onClick={handleDownloadZip}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition disabled:opacity-50"
            >
              {downloading ? (
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : downloadSuccess ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{downloadSuccess ? 'Downloaded!' : 'Download ZIP'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security Role Notice Banner */}
        <div className={`px-6 py-2 text-xs flex items-center justify-between border-b ${
          isAdmin ? 'bg-indigo-950/40 border-indigo-800/50 text-indigo-200' : 'bg-amber-950/40 border-amber-800/50 text-amber-200'
        }`}>
          <div className="flex items-center gap-2">
            {isAdmin ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
            <span>
              {isAdmin 
                ? 'Administrator Privilege Active: You have write access to edit code and compile updates in the in-memory repository.' 
                : 'Organizer View: Source files are read-only to preserve production integrity. Only Admins can modify code.'}
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Auth: {currentUser.email}
          </div>
        </div>

        {/* Audit Log Overlay (if toggled) */}
        {showAuditLogs && (
          <div className="bg-slate-950 border-b border-slate-800 p-4 max-h-48 overflow-y-auto space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-slate-400 text-[11px]">
              <span className="font-bold uppercase tracking-wider text-slate-300">Real-Time RBAC Security Audit Trail</span>
              <span>Showing last {auditLogs.length} events</span>
            </div>
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between gap-2 text-[11px] py-1 border-b border-slate-900">
                <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  log.status === '200_ALLOWED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {log.status}
                </span>
                <span className="font-semibold text-slate-300">{log.userRole}</span>
                <span className="text-cyan-400 truncate max-w-[200px]">{log.resource}</span>
                <span className="text-slate-400 truncate">{log.details || log.action}</span>
              </div>
            ))}
          </div>
        )}

        {/* Workspace Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* File Explorer Sidebar */}
          <div className="w-full md:w-72 bg-slate-950/60 border-r border-slate-800 flex flex-col shrink-0">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <FolderTree className="w-3.5 h-3.5 text-amber-400" />
                <span>Project Files ({files.length})</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {files.map((file) => {
                const isSelected = selectedFile.path === file.path;
                const isSecurityFile = file.path.includes('Security') || file.path.includes('Jwt') || file.path.includes('Role');
                return (
                  <button
                    key={file.path}
                    onClick={() => handleSelectFile(file)}
                    className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left text-xs transition ${
                      isSelected
                        ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <FileCode className={`w-4 h-4 shrink-0 mt-0.5 ${
                      isSecurityFile ? 'text-indigo-400' : isSelected ? 'text-amber-400' : 'text-slate-500'
                    }`} />
                    <div className="truncate">
                      <div className="truncate leading-tight text-slate-200 font-mono text-[11px] flex items-center gap-1.5">
                        <span>{file.filename}</span>
                        {isSecurityFile && (
                          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1 py-0.2 rounded font-mono">
                            RBAC
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">{file.path}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-950/90 text-[11px] text-slate-400">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Boot command:</span>
              </div>
              <code className="block bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-emerald-400 text-[10px]">
                mvn spring-boot:run
              </code>
            </div>
          </div>

          {/* Main Code Editor View */}
          <div className="flex-1 flex flex-col bg-slate-900/90 overflow-hidden">
            
            {/* File info and toolbar */}
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="font-mono text-xs font-semibold text-white">{selectedFile.path}</span>
                <p className="text-[11px] text-slate-400">{selectedFile.description}</p>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <button
                    onClick={handleSaveFile}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs"
                  >
                    {saveSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{saveSuccess ? 'Saved to DB!' : 'Save Changes'}</span>
                  </button>
                ) : (
                  <span className="text-[11px] font-mono text-amber-400/80 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Read-Only</span>
                  </span>
                )}

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Code Body Textarea */}
            <div className="flex-1 p-4 bg-slate-950/80 overflow-hidden flex flex-col">
              <textarea
                value={editableContent}
                readOnly={!isAdmin}
                onChange={(e) => setEditableContent(e.target.value)}
                spellCheck={false}
                className={`flex-1 w-full p-4 font-mono text-xs leading-relaxed resize-none rounded-xl bg-slate-950 border focus:outline-hidden ${
                  isAdmin 
                    ? 'border-indigo-500/50 text-slate-200 focus:border-indigo-400' 
                    : 'border-slate-800 text-slate-300 select-text cursor-default'
                }`}
              />
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
