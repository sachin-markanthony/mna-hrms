export type LeaveType = 'CASUAL' | 'SICK' | 'EARNED' | 'LOP';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type ApprovalDecision = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveBalance {
  id: string;
  userId: string;
  leaveType: LeaveType;
  year: number;
  allocatedDays: number;
  usedDays: number;
  remainingDays: number;
}

export interface LeaveApproverInfo {
  id: string;
  name: string;
  email: string;
}

export interface LeaveApplicantInfo {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: string;
  teamId?: string | null;
  team?: { id: string; name: string } | null;
  employee?: {
    jobTitle?: string | null;
    department?: { id: string; name: string } | null;
  } | null;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  user: LeaveApplicantInfo;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  teamLeadStatus: ApprovalDecision;
  teamLeadApprovedBy?: LeaveApproverInfo | null;
  teamLeadApprovedAt?: string | null;
  teamLeadRemarks?: string | null;
  hrStatus: ApprovalDecision;
  hrApprovedBy?: LeaveApproverInfo | null;
  hrApprovedAt?: string | null;
  hrRemarks?: string | null;
  createdAt: string;
}

export interface ApplyLeavePayload {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}
