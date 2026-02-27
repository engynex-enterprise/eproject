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

export interface ProjectSpaceSummary {
  id: number;
  name: string;
  key: string;
  color: string | null;
  iconName: string | null;
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
  spaceCount: number;
  members: ProjectMemberSummary[];
  spaces: ProjectSpaceSummary[];
  activeSprint: {
    id: number;
    name: string;
    startDate: string | null;
    endDate: string | null;
  } | null;
  issueStats: ProjectIssueStats;
  healthColor: string;
  color: string | null;
  leadId: number | null;
}

export interface CreateProjectData {
  name: string;
  key: string;
  description?: string;
  leadId?: number;
  iconUrl?: string;
  category?: string;
  color?: string;
}

export interface UserSearchResult {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface ProjectMemberDetail {
  id: number;
  projectId: number;
  userId: number;
  roleId: number;
  joinedAt: string;
  isActive: boolean;
  user: UserSearchResult;
  role: { id: number; name: string; scope: string };
}

export interface ProjectRole {
  id: number;
  name: string;
  description: string | null;
  scope: string;
  isSystem: boolean;
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

  searchUsers(orgId: number, email: string): Promise<ApiResponse<UserSearchResult[]>> {
    return apiClient.get<ApiResponse<UserSearchResult[]>>(
      `/users/search/${orgId}?email=${encodeURIComponent(email)}`,
    );
  },

  addProjectMember(
    projectId: number,
    data: { userId: number; roleId: number },
  ): Promise<ApiResponse<ProjectMemberDetail>> {
    return apiClient.post<ApiResponse<ProjectMemberDetail>>(
      `/projects/${projectId}/members`,
      data,
    );
  },

  getProjectMembers(projectId: number): Promise<ApiResponse<ProjectMemberDetail[]>> {
    return apiClient.get<ApiResponse<ProjectMemberDetail[]>>(
      `/projects/${projectId}/members`,
    );
  },

  getRoles(orgId: number): Promise<ApiResponse<ProjectRole[]>> {
    return apiClient.get<ApiResponse<ProjectRole[]>>(
      `/organizations/${orgId}/roles/all`,
    );
  },
};
