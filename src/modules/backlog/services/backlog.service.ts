import { apiClient } from '@/shared/lib/api-client';
import type { ApiResponse, Issue, Sprint } from '@/shared/types';

export interface BacklogIssueType {
  id: number;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  isSubtask: boolean;
  isDefault: boolean;
}

export interface BacklogData {
  projectId: number;
  issueTypes: BacklogIssueType[];
  sprints: SprintWithIssues[];
  backlogIssues: Issue[];
}

export interface SprintWithIssues extends Sprint {
  issues: Issue[];
  totalPoints: number;
}

export const backlogService = {
  getBacklog(projectKey: string): Promise<ApiResponse<BacklogData>> {
    return apiClient.get<ApiResponse<BacklogData>>(
      `/projects/key/${projectKey}/backlog`,
    );
  },

  moveToSprint(
    issueIds: number[],
    sprintId: number,
  ): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/issues/move-to-sprint', {
      issueIds,
      sprintId,
    });
  },

  removeFromSprint(issueIds: number[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/issues/remove-from-sprint', {
      issueIds,
    });
  },
};
