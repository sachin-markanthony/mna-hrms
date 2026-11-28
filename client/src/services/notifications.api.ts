import { httpClient } from './httpClient';

export interface PortalNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  items: PortalNotification[];
  unreadCount: number;
}

export const notificationsApi = {
  list: () => httpClient.get<NotificationsResponse>('/notifications'),
  markRead: (id: string) =>
    httpClient.patch<{ success: boolean }>(`/notifications/${id}/read`),
  markAllRead: () =>
    httpClient.patch<{ success: boolean }>('/notifications/read-all'),
};
