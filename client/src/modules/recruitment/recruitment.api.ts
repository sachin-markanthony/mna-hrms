import { httpClient } from '../../services/httpClient';
import type {
  Candidate,
  RecruitmentStats,
  CreateCandidatePayload,
  EvaluateRoundPayload,
  CandidateStatus,
} from './types';

export const recruitmentApi = {
  // 1. Get real-time stats directly from Neon PostgreSQL
  getStats: async (visitDate?: string): Promise<RecruitmentStats> => {
    return httpClient.get<RecruitmentStats>('/recruitment/stats', {
      params: visitDate ? { visitDate } : undefined,
    });
  },

  // 2. Get list of candidates with filters directly from Neon PostgreSQL
  getCandidates: async (params?: {
    department?: string;
    status?: string;
    visitDate?: string;
    search?: string;
  }): Promise<Candidate[]> => {
    return httpClient.get<Candidate[]>('/recruitment/candidates', { params });
  },

  // 3. Register a walk-in candidate into Neon PostgreSQL
  createCandidate: async (payload: CreateCandidatePayload): Promise<Candidate> => {
    return httpClient.post<Candidate>('/recruitment/candidates', payload);
  },

  // 4. Evaluate HR or MR Round in Neon PostgreSQL
  evaluateRound: async (
    candidateId: string,
    payload: EvaluateRoundPayload
  ): Promise<{ candidate: Candidate }> => {
    return httpClient.post<{ candidate: Candidate }>(
      `/recruitment/candidates/${candidateId}/evaluate-round`,
      payload
    );
  },

  // 5. Update status directly in Neon PostgreSQL
  updateStatus: async (
    candidateId: string,
    status: CandidateStatus,
    rejectionReason?: string
  ): Promise<Candidate> => {
    return httpClient.patch<Candidate>(
      `/recruitment/candidates/${candidateId}/status`,
      { status, rejectionReason }
    );
  },
};
