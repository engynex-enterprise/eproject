import { apiClient } from '@/shared/lib/api-client';
import type { ApiResponse, Organization } from '@/shared/types';

export interface CreateOrganizationData {
  name: string;
  description?: string;
}

export async function createOrganization(
  data: CreateOrganizationData,
): Promise<Organization> {
  const res = await apiClient.post<ApiResponse<Organization>>(
    '/organizations',
    data,
  );
  return res.data;
}
