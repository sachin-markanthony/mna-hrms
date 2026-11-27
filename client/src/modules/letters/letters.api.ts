import { httpClient } from '../../services/httpClient';
import type {
  OfficialLetter,
  CreateLetterPayload,
  LetterFilter,
  SendEmailPayload,
  SendEmailResponse,
} from './types';

export const lettersApi = {
  getLetters: async (filter?: LetterFilter): Promise<OfficialLetter[]> => {
    return httpClient.get<OfficialLetter[]>('/letters', { params: filter });
  },

  getLetterById: async (id: string): Promise<OfficialLetter> => {
    return httpClient.get<OfficialLetter>(`/letters/${id}`);
  },

  createLetter: async (payload: CreateLetterPayload): Promise<OfficialLetter> => {
    return httpClient.post<OfficialLetter>('/letters', payload);
  },

  sendEmail: async (id: string, payload?: SendEmailPayload): Promise<SendEmailResponse> => {
    return httpClient.post<SendEmailResponse>(`/letters/${id}/send-email`, payload || {});
  },

  logAction: async (id: string, action: 'DOWNLOADED' | 'PRINTED' | 'EMAILED'): Promise<{ success: boolean }> => {
    return httpClient.post<{ success: boolean }>(`/letters/${id}/action`, { action });
  },

  revokeLetter: async (id: string): Promise<OfficialLetter> => {
    return httpClient.patch<OfficialLetter>(`/letters/${id}/revoke`);
  },

  recordResponse: async (
    id: string,
    response: 'ACCEPTED' | 'REJECTED',
    remarks?: string,
  ): Promise<OfficialLetter> => {
    return httpClient.patch<OfficialLetter>(`/letters/${id}/response`, { response, remarks });
  },
};
