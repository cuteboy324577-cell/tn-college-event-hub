import { College, CollegeEvent, EventFilter, Registration, User, UserRole, AuditLogEntry, getRolePermissions } from '../types';
import { INITIAL_COLLEGES, INITIAL_EVENTS, INITIAL_REGISTRATIONS, INITIAL_USERS } from '../data/initialData';
import { JAVA_SOURCE_FILES, JavaFile } from '../data/javaSourceCode';

const STORAGE_KEYS = {
  EVENTS: 'ceh_events_v1',
  COLLEGES: 'ceh_colleges_v1',
  REGISTRATIONS: 'ceh_registrations_v1',
  CURRENT_USER: 'ceh_current_user_v1',
  JAVA_FILES: 'ceh_java_files_v1',
  AUDIT_LOGS: 'ceh_audit_logs_v1',
};

// Safe storage access
function getStored<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

export const apiService = {
  // Initialize storage if needed
  init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      setStored(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.COLLEGES)) {
      setStored(STORAGE_KEYS.COLLEGES, INITIAL_COLLEGES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) {
      setStored(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      setStored(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]); // default to student
    }
    if (!localStorage.getItem(STORAGE_KEYS.JAVA_FILES)) {
      setStored(STORAGE_KEYS.JAVA_FILES, JAVA_SOURCE_FILES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      const initialLogs: AuditLogEntry[] = [
        {
          id: 'log-001',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          userId: 'usr-3',
          userEmail: 'admin@collegeeventhub.org',
          userRole: 'ROLE_ADMIN',
          resource: '/api/admin/code/SecurityConfig.java',
          action: 'VIEW',
          status: '200_ALLOWED',
          details: 'Admin verified Spring Security filter chains',
        },
      ];
      setStored(STORAGE_KEYS.AUDIT_LOGS, initialLogs);
    }
  },

  // Reset to initial demo data
  resetAllData(): void {
    setStored(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    setStored(STORAGE_KEYS.COLLEGES, INITIAL_COLLEGES);
    setStored(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    setStored(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
    setStored(STORAGE_KEYS.JAVA_FILES, JAVA_SOURCE_FILES);
  },

  // EVENTS CRUD
  getEvents(filter?: EventFilter): CollegeEvent[] {
    this.init();
    let events: CollegeEvent[] = getStored(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);

    if (!filter) return events;

    if (filter.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      events = events.filter(
        e =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.collegeName.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (filter.category && filter.category !== 'All') {
      events = events.filter(e => e.category === filter.category);
    }

    if (filter.collegeId) {
      events = events.filter(e => e.collegeId === filter.collegeId);
    }

    if (filter.feeType === 'free') {
      events = events.filter(e => e.fee === 0);
    } else if (filter.feeType === 'paid') {
      events = events.filter(e => e.fee > 0);
    }

    if (filter.status && filter.status !== 'all') {
      events = events.filter(e => e.status === filter.status);
    }

    if (filter.sortBy) {
      switch (filter.sortBy) {
        case 'date-asc':
          events = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          break;
        case 'date-desc':
          events = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          break;
        case 'popular':
          events = [...events].sort((a, b) => b.registrationCount - a.registrationCount);
          break;
        case 'prizes':
          events = [...events].sort((a, b) => {
            const getAmount = (p: string) => {
              const match = p.match(/\d+[\d,]*/);
              return match ? parseInt(match[0].replace(/,/g, ''), 10) : 0;
            };
            return getAmount(b.prizePool) - getAmount(a.prizePool);
          });
          break;
      }
    }

    return events;
  },

  getEventById(id: string): CollegeEvent | null {
    this.init();
    const events: CollegeEvent[] = getStored(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    return events.find(e => e.id === id) || null;
  },

  createEvent(eventData: Omit<CollegeEvent, 'id' | 'registrationCount'>): CollegeEvent {
    this.init();
    const events: CollegeEvent[] = getStored(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const newEvent: CollegeEvent = {
      ...eventData,
      id: `evt-${Date.now().toString().slice(-6)}`,
      registrationCount: 0,
    };
    events.unshift(newEvent);
    setStored(STORAGE_KEYS.EVENTS, events);

    // Update college event count
    const colleges: College[] = getStored(STORAGE_KEYS.COLLEGES, INITIAL_COLLEGES);
    const clgIndex = colleges.findIndex(c => c.id === eventData.collegeId);
    if (clgIndex !== -1) {
      colleges[clgIndex].eventCount += 1;
      setStored(STORAGE_KEYS.COLLEGES, colleges);
    }

    return newEvent;
  },

  updateEvent(id: string, updates: Partial<CollegeEvent>): CollegeEvent | null {
    this.init();
    const events: CollegeEvent[] = getStored(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const index = events.findIndex(e => e.id === id);
    if (index === -1) return null;

    events[index] = { ...events[index], ...updates };
    setStored(STORAGE_KEYS.EVENTS, events);
    return events[index];
  },

  deleteEvent(id: string): boolean {
    this.init();
    let events: CollegeEvent[] = getStored(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const target = events.find(e => e.id === id);
    if (!target) return false;

    events = events.filter(e => e.id !== id);
    setStored(STORAGE_KEYS.EVENTS, events);

    // Decrement college event count
    const colleges: College[] = getStored(STORAGE_KEYS.COLLEGES, INITIAL_COLLEGES);
    const clgIndex = colleges.findIndex(c => c.id === target.collegeId);
    if (clgIndex !== -1 && colleges[clgIndex].eventCount > 0) {
      colleges[clgIndex].eventCount -= 1;
      setStored(STORAGE_KEYS.COLLEGES, colleges);
    }

    return true;
  },

  // COLLEGES CRUD
  getColleges(): College[] {
    this.init();
    return getStored(STORAGE_KEYS.COLLEGES, INITIAL_COLLEGES);
  },

  getCollegeById(id: string): College | null {
    this.init();
    const colleges: College[] = getStored(STORAGE_KEYS.COLLEGES, INITIAL_COLLEGES);
    return colleges.find(c => c.id === id) || null;
  },

  registerCollege(collegeData: Omit<College, 'id' | 'verified' | 'eventCount' | 'rating'>): College {
    this.init();
    const colleges: College[] = getStored(STORAGE_KEYS.COLLEGES, INITIAL_COLLEGES);
    const newCollege: College = {
      ...collegeData,
      id: `clg-${Date.now().toString().slice(-5)}`,
      verified: true,
      eventCount: 0,
      rating: 4.8,
    };
    colleges.push(newCollege);
    setStored(STORAGE_KEYS.COLLEGES, colleges);
    return newCollege;
  },

  updateCollege(id: string, updates: Partial<College>): College | null {
    this.init();
    const colleges: College[] = getStored(STORAGE_KEYS.COLLEGES, INITIAL_COLLEGES);
    const index = colleges.findIndex(c => c.id === id);
    if (index === -1) return null;
    colleges[index] = { ...colleges[index], ...updates };
    setStored(STORAGE_KEYS.COLLEGES, colleges);
    return colleges[index];
  },

  // REGISTRATIONS CRUD
  getRegistrations(filter?: { eventId?: string; studentEmail?: string }): Registration[] {
    this.init();
    let regs: Registration[] = getStored(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    if (filter?.eventId) {
      regs = regs.filter(r => r.eventId === filter.eventId);
    }
    if (filter?.studentEmail) {
      const emailQuery = filter.studentEmail.toLowerCase();
      regs = regs.filter(r => r.participantEmail.toLowerCase() === emailQuery);
    }
    return regs;
  },

  createRegistration(
    regData: Omit<Registration, 'id' | 'registeredAt' | 'ticketNumber' | 'qrCodeId' | 'status'>
  ): Registration {
    this.init();
    const regs: Registration[] = getStored(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const newReg: Registration = {
      ...regData,
      id: `reg-${Date.now().toString().slice(-6)}`,
      registeredAt: new Date().toISOString(),
      status: 'confirmed',
      ticketNumber: `TKT-CEH-${randomNum}`,
      qrCodeId: `QR-${regData.eventId.toUpperCase()}-${randomNum}`,
    };
    regs.unshift(newReg);
    setStored(STORAGE_KEYS.REGISTRATIONS, regs);

    // Increment event registration count
    const events: CollegeEvent[] = getStored(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const evtIndex = events.findIndex(e => e.id === regData.eventId);
    if (evtIndex !== -1) {
      events[evtIndex].registrationCount += 1;
      setStored(STORAGE_KEYS.EVENTS, events);
    }

    return newReg;
  },

  cancelRegistration(id: string): boolean {
    this.init();
    let regs: Registration[] = getStored(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    const reg = regs.find(r => r.id === id);
    if (!reg) return false;

    reg.status = 'cancelled';
    setStored(STORAGE_KEYS.REGISTRATIONS, regs);

    // Decrement event registration count
    const events: CollegeEvent[] = getStored(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const evtIndex = events.findIndex(e => e.id === reg.eventId);
    if (evtIndex !== -1 && events[evtIndex].registrationCount > 0) {
      events[evtIndex].registrationCount -= 1;
      setStored(STORAGE_KEYS.EVENTS, events);
    }

    return true;
  },

  // USER & AUTH
  getCurrentUser(): User {
    this.init();
    return getStored(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  },

  setCurrentUser(user: User): void {
    setStored(STORAGE_KEYS.CURRENT_USER, user);
  },

  switchUserRole(role: UserRole): User {
    const matched = INITIAL_USERS.find(u => u.role === role) || INITIAL_USERS[0];
    this.setCurrentUser(matched);
    return matched;
  },

  getAvailableUsers(): User[] {
    return INITIAL_USERS;
  },

  // RBAC JAVA SOURCE CODE REPOSITORY
  getJavaFiles(): JavaFile[] {
    this.init();
    return getStored(STORAGE_KEYS.JAVA_FILES, JAVA_SOURCE_FILES);
  },

  updateJavaFile(path: string, newContent: string, user: User): { success: boolean; error?: string } {
    this.init();
    const permissions = getRolePermissions(user.role);

    if (!permissions.canEditJavaCode) {
      this.logAccessAttempt(
        'EDIT',
        path,
        user,
        '403_FORBIDDEN',
        `User with role '${user.role}' attempted unauthorized source modification`
      );
      return {
        success: false,
        error: '403 Forbidden: Insufficient Permissions. Only users with Admin role can modify Java Spring Boot code.',
      };
    }

    const files = this.getJavaFiles();
    const targetIdx = files.findIndex(f => f.path === path);
    if (targetIdx === -1) {
      return { success: false, error: 'File not found in project repository' };
    }

    files[targetIdx].content = newContent;
    setStored(STORAGE_KEYS.JAVA_FILES, files);

    this.logAccessAttempt('EDIT', path, user, '200_ALLOWED', 'File updated successfully by Admin');
    return { success: true };
  },

  // SECURITY AUDIT LOGS
  logAccessAttempt(
    action: 'VIEW' | 'EDIT' | 'DOWNLOAD' | 'ATTEMPT_UNAUTHORIZED',
    resource: string,
    user: User,
    status: '200_ALLOWED' | '403_FORBIDDEN',
    details?: string
  ): AuditLogEntry {
    this.init();
    const logs = getStored<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      resource,
      action,
      status,
      details,
    };
    logs.unshift(newEntry);
    setStored(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 50)); // keep last 50 logs
    return newEntry;
  },

  getAuditLogs(): AuditLogEntry[] {
    this.init();
    return getStored<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  },

  // STATS
  getPlatformStats() {
    this.init();
    const events = this.getEvents();
    const colleges = this.getColleges();
    const registrations = this.getRegistrations();

    const totalPrizeEstimate = events.reduce((acc, e) => {
      const match = e.prizePool.match(/\d+[\d,]*/);
      return acc + (match ? parseInt(match[0].replace(/,/g, ''), 10) : 0);
    }, 0);

    return {
      totalEvents: events.length,
      upcomingEvents: events.filter(e => e.status === 'upcoming').length,
      participatingColleges: colleges.length,
      totalRegistrations: registrations.length + events.reduce((acc, e) => acc + e.registrationCount, 0) - registrations.length,
      estimatedPrizePool: `₹${(totalPrizeEstimate / 100000).toFixed(1)} Lakhs+`,
    };
  },

  // SIMULATED HTTP REST API EXECUTOR (with Spring Security @PreAuthorize RBAC evaluation)
  async executeSimulatedApi(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: any
  ): Promise<{ status: number; statusText: string; timeMs: number; data: any; headers: Record<string, string> }> {
    const start = performance.now();
    await new Promise(resolve => setTimeout(resolve, 200));

    const cleanPath = path.split('?')[0];
    const currentUser = this.getCurrentUser();
    const permissions = getRolePermissions(currentUser.role);

    const headers = {
      'content-type': 'application/json',
      'x-powered-by': 'Spring Boot 3.3.4 with Spring Security 6 RBAC',
      'x-authenticated-user': currentUser.email,
      'x-user-role': currentUser.role,
      'x-timestamp': new Date().toISOString(),
    };

    try {
      // PROTECTED RBAC ENDPOINT: /api/admin/code/**
      if (cleanPath === '/api/admin/code' || cleanPath.startsWith('/api/admin/code')) {
        // Participant check
        if (!permissions.canViewJavaCode) {
          this.logAccessAttempt('ATTEMPT_UNAUTHORIZED', cleanPath, currentUser, '403_FORBIDDEN', 'Student role blocked by @PreAuthorize');
          return {
            status: 403,
            statusText: 'Forbidden',
            timeMs: Math.round(performance.now() - start),
            data: {
              status: 403,
              error: 'Forbidden',
              message: 'Access Denied: 403 Forbidden. Role ROLE_PARTICIPANT is not authorized to access Java Spring Boot Code.',
              requiredRoles: ['ROLE_ADMIN', 'ROLE_ORGANIZER'],
              currentRole: currentUser.role,
              timestamp: new Date().toISOString(),
            },
            headers,
          };
        }

        // Modification check
        if (['PUT', 'POST', 'DELETE'].includes(method) && !permissions.canEditJavaCode) {
          this.logAccessAttempt('ATTEMPT_UNAUTHORIZED', cleanPath, currentUser, '403_FORBIDDEN', 'Organizer role blocked from editing by @PreAuthorize');
          return {
            status: 403,
            statusText: 'Forbidden',
            timeMs: Math.round(performance.now() - start),
            data: {
              status: 403,
              error: 'Forbidden',
              message: 'Access Denied: 403 Forbidden. Role ROLE_ORGANIZER has read-only access. Modification requires ROLE_ADMIN.',
              requiredRoles: ['ROLE_ADMIN'],
              currentRole: currentUser.role,
            },
            headers,
          };
        }

        // Allowed
        if (method === 'GET') {
          const files = this.getJavaFiles();
          this.logAccessAttempt('VIEW', cleanPath, currentUser, '200_ALLOWED', 'Authorized code access');
          return {
            status: 200,
            statusText: 'OK',
            timeMs: Math.round(performance.now() - start),
            data: {
              message: 'Spring Boot source repository retrieved successfully',
              accessLevel: permissions.canEditJavaCode ? 'FULL_CONTROL' : 'READ_ONLY',
              filesCount: files.length,
              files: files.map(f => ({ path: f.path, filename: f.filename, description: f.description })),
            },
            headers,
          };
        }

        if (method === 'PUT' && body?.path && body?.content) {
          this.updateJavaFile(body.path, body.content, currentUser);
          return {
            status: 200,
            statusText: 'OK',
            timeMs: Math.round(performance.now() - start),
            data: { status: 'UPDATED', filename: body.path, updatedBy: currentUser.email },
            headers,
          };
        }
      }

      // /api/admin/audit-logs
      if (cleanPath === '/api/admin/audit-logs' && method === 'GET') {
        if (!['super_admin', 'admin'].includes(currentUser.role)) {
          return {
            status: 403,
            statusText: 'Forbidden',
            timeMs: Math.round(performance.now() - start),
            data: { error: 'Access Denied: Only ROLE_ADMIN can view security audit logs' },
            headers,
          };
        }
        return {
          status: 200,
          statusText: 'OK',
          timeMs: Math.round(performance.now() - start),
          data: this.getAuditLogs(),
          headers,
        };
      }

      // Existing standard endpoints
      if (cleanPath === '/api/events' && method === 'GET') {
        const events = this.getEvents();
        return {
          status: 200,
          statusText: 'OK',
          timeMs: Math.round(performance.now() - start),
          data: events,
          headers,
        };
      }

      if (cleanPath.startsWith('/api/events/') && method === 'GET') {
        const id = cleanPath.replace('/api/events/', '');
        const event = this.getEventById(id);
        if (!event) {
          return {
            status: 404,
            statusText: 'Not Found',
            timeMs: Math.round(performance.now() - start),
            data: { error: 'Event not found with ID: ' + id, timestamp: new Date().toISOString() },
            headers,
          };
        }
        return {
          status: 200,
          statusText: 'OK',
          timeMs: Math.round(performance.now() - start),
          data: event,
          headers,
        };
      }

      if (cleanPath === '/api/events' && method === 'POST') {
        if (!body || !body.title || !body.collegeId) {
          return {
            status: 400,
            statusText: 'Bad Request',
            timeMs: Math.round(performance.now() - start),
            data: { error: 'Validation failed: title and collegeId are required' },
            headers,
          };
        }
        const created = this.createEvent(body);
        return {
          status: 201,
          statusText: 'Created',
          timeMs: Math.round(performance.now() - start),
          data: created,
          headers,
        };
      }

      if (cleanPath === '/api/colleges' && method === 'GET') {
        const colleges = this.getColleges();
        return {
          status: 200,
          statusText: 'OK',
          timeMs: Math.round(performance.now() - start),
          data: colleges,
          headers,
        };
      }

      if (cleanPath.startsWith('/api/colleges/') && method === 'GET') {
        const id = cleanPath.replace('/api/colleges/', '');
        const college = this.getCollegeById(id);
        if (!college) {
          return {
            status: 404,
            statusText: 'Not Found',
            timeMs: Math.round(performance.now() - start),
            data: { error: 'College not found with ID: ' + id },
            headers,
          };
        }
        return {
          status: 200,
          statusText: 'OK',
          timeMs: Math.round(performance.now() - start),
          data: college,
          headers,
        };
      }

      if (cleanPath === '/api/registrations' && method === 'GET') {
        const regs = this.getRegistrations();
        return {
          status: 200,
          statusText: 'OK',
          timeMs: Math.round(performance.now() - start),
          data: regs,
          headers,
        };
      }

      if (cleanPath === '/api/registrations' && method === 'POST') {
        if (!body || !body.eventId || !body.participantName) {
          return {
            status: 400,
            statusText: 'Bad Request',
            timeMs: Math.round(performance.now() - start),
            data: { error: 'Validation failed: eventId and participantName are required' },
            headers,
          };
        }
        const created = this.createRegistration(body);
        return {
          status: 201,
          statusText: 'Created',
          timeMs: Math.round(performance.now() - start),
          data: created,
          headers,
        };
      }

      if (cleanPath === '/api/stats' && method === 'GET') {
        const stats = this.getPlatformStats();
        return {
          status: 200,
          statusText: 'OK',
          timeMs: Math.round(performance.now() - start),
          data: stats,
          headers,
        };
      }

      return {
        status: 404,
        statusText: 'Not Found',
        timeMs: Math.round(performance.now() - start),
        data: { error: `Endpoint '${method} ${path}' not found` },
        headers,
      };
    } catch (err: any) {
      return {
        status: 500,
        statusText: 'Internal Server Error',
        timeMs: Math.round(performance.now() - start),
        data: { error: err.message || 'Unknown server error' },
        headers,
      };
    }
  },
};
