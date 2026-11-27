export type LetterType = 'OFFER_LETTER' | 'EXPERIENCE_LETTER' | 'INTERNSHIP_LETTER';

export type LetterStatus = 'DRAFT' | 'ISSUED' | 'REVOKED';

export interface OfficialLetter {
  id: string;
  refNumber: string;
  letterType: LetterType;
  status: LetterStatus;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  designation: string;
  department: string;
  annualGrossCtc?: number;
  monthlyGross?: number;
  joiningDate?: string;
  relievingDate?: string;
  employeeCode?: string;
  recipientGender?: string;
  workLocation: string;
  probationMonths: number;
  validUntil?: string;
  ceoName: string;
  ceoTitle: string;
  headOfHrName: string;
  headOfHrTitle: string;
  customNotes?: string;
  candidateId?: string;
  employeeId?: string;
  isEmployeeCreated?: boolean;
  emailSentAt?: string;
  emailSentTo?: string;
  candidateResponse?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | string;
  respondedAt?: string;
  responseRemarks?: string;
  candidate?: {
    id: string;
    fullName: string;
    status: string;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateLetterPayload {
  letterType?: LetterType;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  designation: string;
  department: string;
  annualGrossCtc?: number;
  monthlyGross?: number;
  joiningDate?: string;
  relievingDate?: string;
  employeeCode?: string;
  recipientGender?: string;
  workLocation?: string;
  probationMonths?: number;
  validUntil?: string;
  ceoName?: string;
  ceoTitle?: string;
  headOfHrName?: string;
  headOfHrTitle?: string;
  customNotes?: string;
  candidateId?: string;
  employeeId?: string;
}

export interface LetterFilter {
  letterType?: LetterType;
  status?: LetterStatus;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface SendEmailPayload {
  recipientEmail?: string;
  ccEmails?: string[];
  customMessage?: string;
  subject?: string;
  pdfBase64?: string;
  pdfFileName?: string;
}

export interface SendEmailResponse {
  success: boolean;
  messageId: string;
  sentTo: string;
  subject: string;
  sentAt: string;
}
