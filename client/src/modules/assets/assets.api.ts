import { httpClient } from '../../services/httpClient';
import type {
  AssetAssignment,
  AssetStatus,
  CreateAssetPayload,
  UpdateAssetPayload,
} from './types';

export const assetsApi = {
  getMyAssets: () => httpClient.get<AssetAssignment[]>('/assets/my'),

  list: (params?: { search?: string; status?: AssetStatus }) =>
    httpClient.get<AssetAssignment[]>('/assets', { params }),

  getOne: (id: string) => httpClient.get<AssetAssignment>(`/assets/${id}`),

  create: (payload: CreateAssetPayload) =>
    httpClient.post<AssetAssignment>('/assets', payload),

  update: (id: string, payload: UpdateAssetPayload) =>
    httpClient.patch<AssetAssignment>(`/assets/${id}`, payload),

  remove: (id: string) => httpClient.delete<{ success: boolean }>(`/assets/${id}`),
};
