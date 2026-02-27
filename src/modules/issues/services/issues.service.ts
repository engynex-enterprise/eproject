import { apiClient } from '@/shared/lib/api-client';
import type {
  ApiResponse,
  PaginatedResponse,
  Issue,
  Comment,
  Attachment,
} from '@/shared/types';

export interface IssueFilters {
  search?: string;
  issueTypeId?: number;
  statusId?: number;
  priorityId?: number;
  assigneeId?: number;
  sprintId?: number;
  versionId?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateIssueData {
  title: string;
  description?: string;
  issueTypeId: number;
  statusId?: number;
  priorityId?: number;
  assigneeId?: number;
  sprintId?: number;
  versionId?: number;
  spaceId?: number;
  parentId?: number;
  storyPoints?: number;
  startDate?: string;
  dueDate?: string;
}

export interface UpdateIssueData {
  title?: string;
  description?: string;
  issueTypeId?: number;
  statusId?: number;
  priorityId?: number;
  assigneeId?: number | null;
  sprintId?: number | null;
  versionId?: number | null;
  spaceId?: number | null;
  parentId?: number | null;
  storyPoints?: number | null;
  startDate?: string | null;
  dueDate?: string | null;
}

export const issuesService = {
  getIssues(
    projectKey: string,
    filters?: IssueFilters,
  ): Promise<PaginatedResponse<Issue>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          params.set(key, String(val));
        }
      });
    }
    const qs = params.toString();
    return apiClient.get<PaginatedResponse<Issue>>(
      `/projects/key/${projectKey}/issues${qs ? `?${qs}` : ''}`,
    );
  },

  getIssue(issueKey: string): Promise<ApiResponse<Issue>> {
    return apiClient.get<ApiResponse<Issue>>(`/issues/key/${issueKey}`);
  },

  createIssue(
    projectId: number,
    data: CreateIssueData,
  ): Promise<ApiResponse<Issue>> {
    return apiClient.post<ApiResponse<Issue>>(
      `/projects/${projectId}/issues`,
      data,
    );
  },

  updateIssue(
    issueId: number,
    data: UpdateIssueData,
  ): Promise<ApiResponse<Issue>> {
    return apiClient.patch<ApiResponse<Issue>>(`/issues/${issueId}`, data);
  },

  deleteIssue(issueId: number): Promise<void> {
    return apiClient.delete<void>(`/issues/${issueId}`);
  },

  transitionIssue(
    issueId: number,
    statusId: number,
  ): Promise<ApiResponse<Issue>> {
    return apiClient.post<ApiResponse<Issue>>(
      `/issues/${issueId}/transition`,
      { statusId },
    );
  },

  // Comments
  getComments(issueId: number): Promise<ApiResponse<Comment[]>> {
    return apiClient.get<ApiResponse<Comment[]>>(
      `/issues/${issueId}/comments`,
    );
  },

  addComment(
    issueId: number,
    content: string,
    parentId?: number,
  ): Promise<ApiResponse<Comment>> {
    return apiClient.post<ApiResponse<Comment>>(
      `/issues/${issueId}/comments`,
      { content, parentId },
    );
  },

  // Attachments
  getAttachments(issueId: number): Promise<ApiResponse<Attachment[]>> {
    return apiClient.get<ApiResponse<Attachment[]>>(
      `/issues/${issueId}/attachments`,
    );
  },

  // Child issues
  getChildIssues(issueId: number): Promise<ApiResponse<Issue[]>> {
    return apiClient.get<ApiResponse<Issue[]>>(`/issues/${issueId}/children`);
  },
};
