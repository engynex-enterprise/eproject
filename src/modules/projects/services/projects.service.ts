import { apiClient } from '@/shared/lib/api-client';
import type { ApiResponse, PaginatedResponse, Project } from '@/shared/types';

export interface ProjectMemberSummary {
  id: number;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface ProjectIssueStats {
  total: number;
  done: number;
  inProgress: number;
  todo: number;
}

export interface ProjectListItem {
  id: number;
  name: string;
  key: string;
  description: string | null;
  orgId: number;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  issueCount: number;
  sprintCount: number;
  members: ProjectMemberSummary[];
  activeSprint: {
    id: number;
    name: string;
    startDate: string | null;
    endDate: string | null;
  } | null;
  issueStats: ProjectIssueStats;
  healthColor: string;
  leadId: number | null;
}

export interface CreateProjectData {
  name: string;
  key: string;
  description?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  leadId?: number | null;
  defaultAssigneeId?: number | null;
  iconUrl?: string | null;
  isArchived?: boolean;
}

export const projectsService = {
  getProjects(orgId: number): Promise<ApiResponse<ProjectListItem[]>> {
    return apiClient.get<ApiResponse<ProjectListItem[]>>(
      `/organizations/${orgId}/projects`,
    );
  },

  getProject(projectId: number): Promise<ApiResponse<Project>> {
    return apiClient.get<ApiResponse<Project>>(`/projects/${projectId}`);
  },

  getProjectByKey(key: string): Promise<ApiResponse<Project>> {
    return apiClient.get<ApiResponse<Project>>(`/projects/key/${key}`);
  },

  createProject(
    orgId: number,
    data: CreateProjectData,
  ): Promise<ApiResponse<Project>> {
    return apiClient.post<ApiResponse<Project>>(
      `/organizations/${orgId}/projects`,
      data,
    );
  },

  updateProject(
    projectId: number,
    data: UpdateProjectData,
  ): Promise<ApiResponse<Project>> {
    return apiClient.patch<ApiResponse<Project>>(
      `/projects/${projectId}`,
      data,
    );
  },

  deleteProject(projectId: number): Promise<void> {
    return apiClient.delete<void>(`/projects/${projectId}`);
  },
};
