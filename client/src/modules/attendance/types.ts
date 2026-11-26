export type PunchSource = 'FACIAL_DEVICE' | 'SITE_VISIT_GPS' | 'WEB';
export type PunchDirection = 'IN' | 'OUT';
export type AttendanceStatus = 'PRESENT' | 'HALF_DAY' | 'ABSENT' | 'ON_LEAVE' | 'LOP';
export type ApprovalDecision = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AttendanceUserSummary {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: string;
  team?: { id: string; name: string } | null;
}

export interface AttendanceMasterRecord {
  id: string;
  userId: string;
  user: AttendanceUserSummary;
  attendanceDate: string;
  firstPunchIn?: string | null;
  lastPunchOut?: string | null;
  officeHours: number;
  siteVisitHours: number;
  totalWorkHours: number;
  status: AttendanceStatus;
  isLate: boolean;
  remarks?: string | null;
}

export interface AttendanceRawLog {
  id: string;
  userId: string;
  user: AttendanceUserSummary;
  source: PunchSource;
  direction: PunchDirection;
  rawTimestamp: string;
  latitude?: number | null;
  longitude?: number | null;
  projectId?: string | null;
  deviceIp?: string | null;
  faceConfidence?: number | null;
  status: string;
}

export interface SiteVisitRecord {
  id: string;
  userId: string;
  user: AttendanceUserSummary;
  projectId: string;
  projectName: string;
  leadId?: string | null;
  checkInTime: string;
  checkOutTime?: string | null;
  distanceMeters?: number | null;
  notes?: string | null;
  status: string;
}

export interface AttendanceRegularization {
  id: string;
  userId: string;
  user: AttendanceUserSummary;
  attendanceDate: string;
  requestedIn?: string | null;
  requestedOut?: string | null;
  reason: string;
  status: ApprovalDecision;
  reviewedBy?: { id: string; name: string; email: string } | null;
  remarks?: string | null;
  createdAt: string;
}
