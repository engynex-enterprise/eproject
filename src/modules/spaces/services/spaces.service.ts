import { apiClient } from '@/shared/lib/api-client';
import type { ApiResponse, Space, Status } from '@/shared/types';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CreateSpaceData {
  name: string;
  key?: string;
  description?: string | null;
  color?: string | null;
}

export interface UpdateSpaceData {
  name?: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  order?: number;
}

export interface SpaceSettings {
  id: number;
  spaceId: number;
  inheritFromProject: boolean;
  workingDays: number[];
  estimationType: 'story_points' | 'hours' | 'none';
  defaultSprintDuration: number;
}

export interface BoardColumnConfig {
  id: string;
  name: string;
  statusId: number;
  status: Status;
  order: number;
  wipLimit: number | null;
}

export interface SwimLaneConfig {
  enabled: boolean;
  field: 'assignee' | 'priority' | 'type' | 'none';
}

export interface SpaceBoardConfig {
  id: number;
  spaceId: number;
  columns: BoardColumnConfig[];
  swimlanes: SwimLaneConfig;
  cardColorField: 'priority' | 'type' | 'status' | 'none';
  cardDisplayFields: string[];
  quickFilters: string[];
}

// ─── Spaces CRUD ────────────────────────────────────────────────────────────

export async function getSpaces(projectId: number): Promise<Space[]> {
  const res = await apiClient.get<ApiResponse<Space[]>>(
    `/projects/${projectId}/spaces`,
  );
  return res.data;
}

export async function getSpace(spaceId: number): Promise<Space> {
  const res = await apiClient.get<ApiResponse<Space>>(`/spaces/${spaceId}`);
  return res.data;
}

export async function createSpace(
  projectId: number,
  data: CreateSpaceData,
): Promise<Space> {
  const res = await apiClient.post<ApiResponse<Space>>(
    `/projects/${projectId}/spaces`,
    data,
  );
  return res.data;
}

export async function updateSpace(
  spaceId: number,
  data: UpdateSpaceData,
): Promise<Space> {
  const res = await apiClient.patch<ApiResponse<Space>>(
    `/spaces/${spaceId}`,
    data,
  );
  return res.data;
}

export async function deleteSpace(spaceId: number): Promise<void> {
  await apiClient.delete(`/spaces/${spaceId}`);
}

// ─── Space Settings ─────────────────────────────────────────────────────────

export async function getSpaceSettings(
  spaceId: number,
): Promise<SpaceSettings> {
  const res = await apiClient.get<ApiResponse<SpaceSettings>>(
    `/spaces/${spaceId}/settings`,
  );
  return res.data;
}

export async function updateSpaceSettings(
  spaceId: number,
  data: Partial<SpaceSettings>,
): Promise<SpaceSettings> {
  const res = await apiClient.patch<ApiResponse<SpaceSettings>>(
    `/spaces/${spaceId}/settings`,
    data,
  );
  return res.data;
}

// ─── Board Config ───────────────────────────────────────────────────────────

export async function getSpaceBoardConfig(
  spaceId: number,
): Promise<SpaceBoardConfig> {
  const res = await apiClient.get<ApiResponse<SpaceBoardConfig>>(
    `/spaces/${spaceId}/board-config`,
  );
  return res.data;
}

export async function updateSpaceBoardConfig(
  spaceId: number,
  data: Partial<SpaceBoardConfig>,
): Promise<SpaceBoardConfig> {
  const res = await apiClient.patch<ApiResponse<SpaceBoardConfig>>(
    `/spaces/${spaceId}/board-config`,
    data,
  );
  return res.data;
}
