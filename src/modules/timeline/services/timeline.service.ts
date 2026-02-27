import { apiClient } from '@/shared/lib/api-client';
import type { ApiResponse, Issue } from '@/shared/types';

export interface TimelineIssue extends Issue {
  dependencies: number[]; // IDs of issues this depends on
}

export interface TimelineData {
  issues: TimelineIssue[];
  startDate: string;
  endDate: string;
}

export const timelineService = {
  getTimelineData(projectKey: string): Promise<ApiResponse<TimelineData>> {
    return apiClient.get<ApiResponse<TimelineData>>(
      `/projects/key/${projectKey}/timeline`,
    );
  },
};
