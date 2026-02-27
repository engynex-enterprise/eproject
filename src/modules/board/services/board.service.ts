import { apiClient } from '@/shared/lib/api-client';
import type { ApiResponse, BoardColumn, Issue } from '@/shared/types';

export interface BoardData {
  columns: BoardColumnWithIssues[];
}

export interface BoardColumnWithIssues extends BoardColumn {
  issues: Issue[];
}

export interface BoardFilters {
  assigneeId?: number;
  issueTypeId?: number;
  search?: string;
  sprintId?: number;
}

export const boardService = {
  getBoardData(
    projectKey: string,
    filters?: BoardFilters,
  ): Promise<ApiResponse<BoardData>> {
    const params = new URLSearchParams();
    if (filters?.assigneeId) params.set('assigneeId', String(filters.assigneeId));
    if (filters?.issueTypeId) params.set('issueTypeId', String(filters.issueTypeId));
    if (filters?.search) params.set('search', filters.search);
    if (filters?.sprintId) params.set('sprintId', String(filters.sprintId));

    const qs = params.toString();
    return apiClient.get<ApiResponse<BoardData>>(
      `/projects/key/${projectKey}/board${qs ? `?${qs}` : ''}`,
    );
  },

  moveIssue(
    issueId: number,
    statusId: number,
    position: number,
  ): Promise<ApiResponse<Issue>> {
    return apiClient.patch<ApiResponse<Issue>>(
      `/issues/${issueId}/move`,
      { statusId, order: position },
    );
  },
};
