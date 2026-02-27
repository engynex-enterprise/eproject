import { apiClient } from '@/shared/lib/api-client';
import type { ApiResponse, Sprint } from '@/shared/types';

export interface CreateSprintData {
  name: string;
  goal?: string;
}

export interface StartSprintData {
  startDate: string;
  endDate: string;
  name?: string;
  goal?: string;
}

export interface CompleteSprintData {
  moveToBacklog?: boolean;
  moveToSprintId?: number;
}

export const sprintsService = {
  getSprints(projectKey: string): Promise<ApiResponse<Sprint[]>> {
    return apiClient.get<ApiResponse<Sprint[]>>(
      `/projects/key/${projectKey}/sprints`,
    );
  },

  createSprint(
    projectId: number,
    data: CreateSprintData,
  ): Promise<ApiResponse<Sprint>> {
    return apiClient.post<ApiResponse<Sprint>>(
      `/projects/${projectId}/sprints`,
      data,
    );
  },

  startSprint(
    sprintId: number,
    data: StartSprintData,
  ): Promise<ApiResponse<Sprint>> {
    return apiClient.post<ApiResponse<Sprint>>(
      `/sprints/${sprintId}/start`,
      data,
    );
  },

  completeSprint(
    sprintId: number,
    data: CompleteSprintData,
  ): Promise<ApiResponse<Sprint>> {
    return apiClient.post<ApiResponse<Sprint>>(
      `/sprints/${sprintId}/complete`,
      data,
    );
  },

  updateSprint(
    sprintId: number,
    data: Partial<CreateSprintData>,
  ): Promise<ApiResponse<Sprint>> {
    return apiClient.patch<ApiResponse<Sprint>>(
      `/sprints/${sprintId}`,
      data,
    );
  },

  deleteSprint(sprintId: number): Promise<void> {
    return apiClient.delete<void>(`/sprints/${sprintId}`);
  },
};
