import { apiClient } from '@/shared/lib/api-client';
import type {
  ApiResponse,
  PaginatedResponse,
  Notification,
  NotificationPreference,
} from '@/shared/types';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
}

// ─── Notifications ──────────────────────────────────────────────────────────

export async function getNotifications(
  params?: GetNotificationsParams,
): Promise<PaginatedResponse<Notification>> {
  const queryParams: Record<string, string> = {};
  if (params?.page) queryParams.page = String(params.page);
  if (params?.limit) queryParams.limit = String(params.limit);
  if (params?.isRead !== undefined) queryParams.isRead = String(params.isRead);
  if (params?.type) queryParams.type = params.type;

  return apiClient.get<PaginatedResponse<Notification>>(
    '/notifications',
    queryParams,
  );
}

export async function getUnreadCount(): Promise<number> {
  const res = await apiClient.get<ApiResponse<{ count: number }>>(
    '/notifications/unread-count',
  );
  return res.data.count;
}

export async function markAsRead(id: number): Promise<void> {
  await apiClient.patch(`/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await apiClient.post('/notifications/read-all');
}

// ─── Preferences ────────────────────────────────────────────────────────────

export async function getPreferences(): Promise<NotificationPreference> {
  const res = await apiClient.get<ApiResponse<NotificationPreference>>(
    '/notifications/preferences',
  );
  return res.data;
}

export async function updatePreferences(
  data: Partial<NotificationPreference>,
): Promise<NotificationPreference> {
  const res = await apiClient.patch<ApiResponse<NotificationPreference>>(
    '/notifications/preferences',
    data,
  );
  return res.data;
}
