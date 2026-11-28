import { httpClient } from '../../services/httpClient';
import type {
  Candidate,
  RecruitmentStats,
  CreateCandidatePayload,
  EvaluateRoundPayload,
  CandidateStatus,
  TeamLeaderSummary,
  HrCoordinatorSummary,
  VerifyCandidatePayload,
} from './types';

export const recruitmentApi = {
  // 1. Get real-time stats directly from Neon PostgreSQL
  getStats: async (params?: {
    visitDate?: string;
    teamLeaderId?: string;
    teamLeaderName?: string;
  }): Promise<RecruitmentStats> => {
    return httpClient.get<RecruitmentStats>('/recruitment/stats', {
      params,
    });
  },

  // 2. Get list of candidates with filters directly from Neon PostgreSQL
  getCandidates: async (params?: {
    department?: string;
    status?: string;
    visitDate?: string;
    search?: string;
    teamLeaderId?: string;
    teamLeaderName?: string;
  }): Promise<Candidate[]> => {
    return httpClient.get<Candidate[]>('/recruitment/candidates', { params });
  },

  // 3. Get team leaders for walk-in candidate assignment
  getTeamLeaders: async (): Promise<TeamLeaderSummary[]> => {
    return httpClient.get<TeamLeaderSummary[]>('/recruitment/team-leaders');
  },

  // 3b. Get HR Coordinators for HR Round interviewer dropdown
  getHrCoordinators: async (): Promise<HrCoordinatorSummary[]> => {
    return httpClient.get<HrCoordinatorSummary[]>('/recruitment/hr-coordinators');
  },

  // 3c. Public QR walk-in self-registration
  registerWalkIn: async (payload: CreateCandidatePayload): Promise<Candidate> => {
    return httpClient.post<Candidate>('/recruitment/walk-in', payload);
  },

  // 3d. HR verify walk-in candidate, assign Team Lead & confidential notes, and optionally forward to HR Round
  verifyCandidate: async (id: string, payload: VerifyCandidatePayload): Promise<Candidate> => {
    return httpClient.patch<Candidate>(`/recruitment/candidates/${id}/verify`, payload);
  },

  // 4. Register a walk-in candidate into Neon PostgreSQL
  createCandidate: async (payload: CreateCandidatePayload): Promise<Candidate> => {
    // Preserve TL assignment in tags for compatibility with any older remote server instances
    const tagsWithTl = [...(payload.tags || [])];
    if (payload.teamLeaderName && !tagsWithTl.some((t) => t.startsWith('TL:'))) {
      tagsWithTl.push(`TL:${payload.teamLeaderName}`);
    }

    try {
      return await httpClient.post<Candidate>('/recruitment/candidates', {
        ...payload,
        tags: tagsWithTl,
      });
    } catch (err: any) {
      // If connected to an older remote backend (e.g. devtunnels) that doesn't yet have teamLeaderName in its DTO
      const errMsg = err?.message || String(err);
      if (
        errMsg.includes('teamLeaderName should not exist') ||
        errMsg.includes('teamLeaderId should not exist')
      ) {
        const { teamLeaderName, teamLeaderId, ...legacyPayload } = payload;
        return await httpClient.post<Candidate>('/recruitment/candidates', {
          ...legacyPayload,
          tags: tagsWithTl,
        });
      }
      throw err;
    }
  },

  // 5. Evaluate HR or MR Round in Neon PostgreSQL
  evaluateRound: async (
    candidateId: string,
    payload: EvaluateRoundPayload
  ): Promise<{ candidate: Candidate }> => {
    return httpClient.post<{ candidate: Candidate }>(
      `/recruitment/candidates/${candidateId}/evaluate-round`,
      payload
    );
  },

  // 6. Update status directly in Neon PostgreSQL
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
