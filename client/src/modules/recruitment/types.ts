export type RecruitmentDepartment = 'DIGITAL' | 'SALES';

export type CandidateStatus =
  | 'REGISTERED'   // Came to office / Registered at reception
  | 'HR_ROUND'     // In HR Round
  | 'MR_ROUND'     // Cleared HR, In MR (Management) Round
  | 'SELECTED'     // Hired / Selected
  | 'REJECTED_HR'  // Rejected in HR Round
  | 'REJECTED_MR'; // Rejected in MR Round

export type InterviewRoundType = 'HR_ROUND' | 'MR_ROUND';

export type RoundEvaluationResult = 'PASSED' | 'REJECTED';

export interface RoundEvaluation {
  id: string;
  candidateId: string;
  round: InterviewRoundType;
  result: RoundEvaluationResult;
  interviewerName: string;
  rating: number; // 1-5
  feedback: string;
  rejectionReason?: string;
  evaluatedAt: string;
}

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  department: RecruitmentDepartment; // DIGITAL or SALES
  appliedRole: string;
  visitDate: string; // YYYY-MM-DD
  status: CandidateStatus;
  experienceYears: number;
  currentCompany?: string;
  expectedSalary?: string;
  resumeUrl?: string;
  tags?: string[];
  rejectionReason?: string;
  hrInterviewer?: string;
  hrRating?: number;
  hrFeedback?: string;
  hrEvaluatedAt?: string;
  mrInterviewer?: string;
  mrRating?: number;
  mrFeedback?: string;
  mrEvaluatedAt?: string;
  confidentialNotes?: string | null;
  hrVerifiedBy?: string | null;
  hrVerifiedAt?: string | null;
  hrCoordinatorId?: string | null;
  registrationSource?: string;
  teamLeaderId?: string;
  teamLeaderName?: string;
  evaluations?: RoundEvaluation[];
  createdAt: string;
}

export interface RecruitmentStats {
  totalWalkIns: number;
  departments: {
    digital: number;
    sales: number;
  };
  stages: {
    registered: number;
    inHrRound: number;
    inMrRound: number;
    selected: number;
  };
  rejections: {
    rejectedAtHr: number;
    rejectedAtMr: number;
    totalRejected: number;
  };
  selectionRate: number;
  dateFiltered: string;
}

export interface CreateCandidatePayload {
  fullName: string;
  email: string;
  phone: string;
  department: RecruitmentDepartment;
  appliedRole?: string;
  visitDate?: string;
  experienceYears?: number;
  currentCompany?: string;
  expectedSalary?: string;
  tags?: string[];
  teamLeaderId?: string;
  teamLeaderName?: string;
}

export interface TeamLeaderSummary {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  jobTitle?: string;
}

export interface HrCoordinatorSummary {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  jobTitle?: string;
}

export interface VerifyCandidatePayload {
  department?: RecruitmentDepartment;
  appliedRole?: string;
  expectedSalary?: string;
  teamLeaderId?: string;
  teamLeaderName?: string;
  confidentialNotes?: string;
  proceedToHr?: boolean;
}

export interface EvaluateRoundPayload {
  round: InterviewRoundType;
  result: RoundEvaluationResult;
  interviewerName: string;
  hrCoordinatorId?: string;
  rating: number;
  feedback: string;
  rejectionReason?: string;
}

export const STATUS_CONFIG: Record<
  CandidateStatus,
  { title: string; color: string; bg: string; border: string; desc: string }
> = {
  REGISTERED: {
    title: 'Walk-In Registered',
    color: 'text-slate-700 dark:text-slate-200',
    bg: 'bg-slate-100 dark:bg-slate-800',
    border: 'border-slate-300 dark:border-slate-700',
    desc: 'Arrived at office & registered',
  },
  HR_ROUND: {
    title: '1. HR Round',
    color: 'text-sky-700 dark:text-sky-300',
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    border: 'border-sky-300 dark:border-sky-800',
    desc: 'Initial HR screening & evaluation',
  },
  MR_ROUND: {
    title: '2. MR Round',
    color: 'text-indigo-700 dark:text-indigo-300',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    border: 'border-indigo-300 dark:border-indigo-800',
    desc: 'Management Round interview',
  },
  SELECTED: {
    title: 'Selected',
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-300 dark:border-emerald-800',
    desc: 'Cleared MR & Hired',
  },
  REJECTED_HR: {
    title: 'Rejected at HR',
    color: 'text-amber-800 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-300 dark:border-amber-800',
    desc: 'Disqualified during HR Round',
  },
  REJECTED_MR: {
    title: 'Rejected at MR',
    color: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-300 dark:border-rose-800',
    desc: 'Disqualified during Management Round',
  },
};
