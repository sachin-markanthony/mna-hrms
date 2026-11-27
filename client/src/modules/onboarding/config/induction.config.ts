import type { EmployeeProfile } from '../types/learning.types';

/**
 * Single source of truth for induction behaviour.
 * The same values should be enforced by the NestJS API when this module is wired
 * to the backend. UI components must never hard-code the pass mark.
 */
export const INDUCTION_CONFIG = {
  /** Default pass mark for every chapter assessment. */
  passingPercentage: 80,
  /** The handbook has 18 employee learning chapters (1–18). */
  learningChapterCount: 18,
  /** Chapter 21 is the final assessment; 20 is a reference resource. */
  finalAssessmentChapter: 21,
  referenceChapter: 20,
  /** Trainer-only chapters are never rendered in the employee portal. */
  trainerOnlyChapters: [19, 22],
  storageKey: 'mav_induction_learning_v1',
  storeVersion: 1,
  supportEmail: 'induction@maventures.com',
  supportPhone: '+91 80 4000 1200',
} as const;

const FALLBACK_EMPLOYEE: EmployeeProfile = {
  id: 'emp-1042',
  employeeCode: 'MA-2026-089',
  fullName: 'Rahul Sharma',
  firstName: 'Rahul',
  department: 'Real Estate Advisory & Investments',
  designation: 'Senior Investment Advisor',
  email: 'rahul.sharma@maventures.com',
  joiningDate: '10 Feb 2026',
};

interface StoredAuthUser {
  id?: string;
  name?: string;
  email?: string;
  employeeId?: string;
  department?: string;
  designation?: string;
  avatar?: string;
}

function readStoredUser(): StoredAuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('mna_user');
    return raw ? (JSON.parse(raw) as StoredAuthUser) : null;
  } catch {
    return null;
  }
}

/** Resolves the signed-in employee, falling back to mock data for the demo phase. */
export function getEmployeeProfile(override?: Partial<EmployeeProfile>): EmployeeProfile {
  const stored = readStoredUser();
  const fullName = override?.fullName || stored?.name || FALLBACK_EMPLOYEE.fullName;

  return {
    ...FALLBACK_EMPLOYEE,
    ...(stored?.id ? { id: stored.id } : {}),
    ...(stored?.employeeId ? { employeeCode: stored.employeeId } : {}),
    ...(stored?.name ? { fullName: stored.name } : {}),
    ...(stored?.email ? { email: stored.email } : {}),
    ...(stored?.department ? { department: stored.department } : {}),
    ...(stored?.designation ? { designation: stored.designation } : {}),
    ...(stored?.avatar ? { avatarUrl: stored.avatar } : {}),
    ...override,
    firstName: fullName.split(' ')[0] || FALLBACK_EMPLOYEE.firstName,
  };
}

export function getEmployeeId(): string {
  return getEmployeeProfile().id;
}

/** Number of correct answers required for a given question count. */
export function getPassingMark(totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  return Math.ceil((totalQuestions * INDUCTION_CONFIG.passingPercentage) / 100);
}
