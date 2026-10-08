export type EventCategory = 
  | 'Technical' 
  | 'Cultural' 
  | 'Sports' 
  | 'Workshop' 
  | 'Hackathon' 
  | 'Symposium' 
  | 'Gaming';

export type TeamSizeType = 'Individual' | '2-4 Members' | '4-6 Members' | 'Team (Flexible)';

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface ScheduleItem {
  time: string;
  activity: string;
  speakerOrVenue?: string;
}

export interface CollegeEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  collegeId: string;
  collegeName: string;
  date: string;
  time: string;
  endDate?: string;
  venue: string;
  registrationDeadline: string;
  fee: number; // 0 for free
  maxParticipants: number;
  registrationCount: number;
  teamSize: TeamSizeType;
  prizePool: string;
  status: EventStatus;
  tags: string[];
  coordinatorName: string;
  coordinatorContact: string;
  coordinatorEmail: string;
  rules: string[];
  schedule: ScheduleItem[];
  bannerUrl: string;
  featured?: boolean;
}

export interface College {
  id: string;
  name: string;
  shortName: string;
  code: string;
  location: string;
  state: string;
  establishedYear: number;
  website: string;
  logoUrl: string;
  coverUrl: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  verified: boolean;
  eventCount: number;
  rating: number;
}

export interface TeamMember {
  name: string;
  email: string;
  rollNumber: string;
  college: string;
}

export interface Registration {
  id: string;
  eventId: string;
  eventTitle: string;
  collegeName: string;
  participantName: string;
  participantEmail: string;
  participantPhone: string;
  participantCollege: string;
  rollNumber: string;
  department: string;
  yearOfStudy: string;
  teamName?: string;
  teamMembers?: TeamMember[];
  registeredAt: string;
  status: 'confirmed' | 'pending' | 'attended' | 'cancelled';
  ticketNumber: string;
  qrCodeId: string;
}

// RBAC User Roles
export type UserRole = 'student' | 'college_admin' | 'super_admin' | 'admin' | 'organizer' | 'participant';

export interface RolePermissions {
  canViewJavaCode: boolean;
  canEditJavaCode: boolean;
  canDownloadJavaCode: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  collegeId?: string;
  collegeName?: string;
  avatarUrl?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  userRole: string;
  resource: string;
  action: 'VIEW' | 'EDIT' | 'DOWNLOAD' | 'ATTEMPT_UNAUTHORIZED';
  status: '200_ALLOWED' | '403_FORBIDDEN';
  details?: string;
}

export interface EventFilter {
  search?: string;
  category?: EventCategory | 'All';
  collegeId?: string;
  feeType?: 'all' | 'free' | 'paid';
  status?: EventStatus | 'all';
  sortBy?: 'date-asc' | 'date-desc' | 'popular' | 'prizes';
}

export function getRolePermissions(role: UserRole): RolePermissions {
  const normalized = role.toLowerCase();
  if (normalized === 'super_admin' || normalized === 'admin') {
    return {
      canViewJavaCode: true,
      canEditJavaCode: true,
      canDownloadJavaCode: true,
    };
  }
  if (normalized === 'college_admin' || normalized === 'organizer') {
    return {
      canViewJavaCode: true,
      canEditJavaCode: false,
      canDownloadJavaCode: true,
    };
  }
  // participant / student
  return {
    canViewJavaCode: false,
    canEditJavaCode: false,
    canDownloadJavaCode: false,
  };
}
