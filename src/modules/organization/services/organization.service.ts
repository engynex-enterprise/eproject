import { apiClient } from '@/shared/lib/api-client';
import type {
  ApiResponse,
  Organization,
  OrganizationMember,
  Role,
  Permission,
} from '@/shared/types';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface UpdateOrganizationData {
  name?: string;
  description?: string | null;
  website?: string | null;
  logoUrl?: string | null;
}

export interface InviteMemberData {
  email: string;
  roleId: number;
}

export interface CreateRoleData {
  name: string;
  description?: string | null;
  permissionIds: number[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string | null;
  permissionIds?: number[];
}

export interface AppearanceConfig {
  logoUrl: string | null;
  faviconUrl: string | null;
  accentColor: string;
  fontFamily: string;
  darkMode: boolean;
}

export interface SsoProviderConfig {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
}

export interface SsoConfig {
  google: SsoProviderConfig;
  github: SsoProviderConfig;
}

export interface NotificationChannelConfig {
  email: {
    enabled: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromName: string;
    fromAddress: string;
  };
  sms: {
    enabled: boolean;
    provider: string;
    apiKey: string;
  };
  whatsapp: {
    enabled: boolean;
    apiKey: string;
  };
  internal: {
    enabled: boolean;
  };
}

export interface StorageConfig {
  provider: string;
  bucketName: string;
  maxFileSizeMb: number;
  allowedFileTypes: string[];
  totalQuotaGb: number;
  usedStorageGb: number;
}

export interface PendingInvitation {
  id: number;
  email: string;
  roleId: number;
  role: Role;
  invitedAt: string;
  expiresAt: string;
}

// ─── Organization CRUD ──────────────────────────────────────────────────────

export async function getOrganization(orgId: number): Promise<Organization> {
  const res = await apiClient.get<ApiResponse<Organization>>(
    `/organizations/${orgId}`,
  );
  return res.data;
}

export async function updateOrganization(
  orgId: number,
  data: UpdateOrganizationData,
): Promise<Organization> {
  const res = await apiClient.patch<ApiResponse<Organization>>(
    `/organizations/${orgId}`,
    data,
  );
  return res.data;
}

// ─── Members ────────────────────────────────────────────────────────────────

export async function getMembers(
  orgId: number,
): Promise<OrganizationMember[]> {
  const res = await apiClient.get<ApiResponse<OrganizationMember[]>>(
    `/organizations/${orgId}/members`,
  );
  return res.data;
}

export async function inviteMember(
  orgId: number,
  data: InviteMemberData,
): Promise<PendingInvitation> {
  const res = await apiClient.post<ApiResponse<PendingInvitation>>(
    `/organizations/${orgId}/members/invite`,
    data,
  );
  return res.data;
}

export async function removeMember(
  orgId: number,
  memberId: number,
): Promise<void> {
  await apiClient.delete(`/organizations/${orgId}/members/${memberId}`);
}

export async function updateMemberRole(
  orgId: number,
  memberId: number,
  roleId: number,
): Promise<OrganizationMember> {
  const res = await apiClient.patch<ApiResponse<OrganizationMember>>(
    `/organizations/${orgId}/members/${memberId}`,
    { roleId },
  );
  return res.data;
}

export async function getPendingInvitations(
  orgId: number,
): Promise<PendingInvitation[]> {
  const res = await apiClient.get<ApiResponse<PendingInvitation[]>>(
    `/organizations/${orgId}/members/invitations`,
  );
  return res.data;
}

export async function cancelInvitation(
  orgId: number,
  invitationId: number,
): Promise<void> {
  await apiClient.delete(
    `/organizations/${orgId}/members/invitations/${invitationId}`,
  );
}

// ─── Roles & Permissions ────────────────────────────────────────────────────

export async function getRoles(orgId: number): Promise<Role[]> {
  const res = await apiClient.get<ApiResponse<Role[]>>(
    `/organizations/${orgId}/roles`,
  );
  return res.data;
}

export async function createRole(
  orgId: number,
  data: CreateRoleData,
): Promise<Role> {
  const res = await apiClient.post<ApiResponse<Role>>(
    `/organizations/${orgId}/roles`,
    data,
  );
  return res.data;
}

export async function updateRole(
  roleId: number,
  data: UpdateRoleData,
): Promise<Role> {
  const res = await apiClient.patch<ApiResponse<Role>>(
    `/roles/${roleId}`,
    data,
  );
  return res.data;
}

export async function deleteRole(roleId: number): Promise<void> {
  await apiClient.delete(`/roles/${roleId}`);
}

export async function getPermissions(): Promise<Permission[]> {
  const res = await apiClient.get<ApiResponse<Permission[]>>('/permissions');
  return res.data;
}

// ─── Appearance ─────────────────────────────────────────────────────────────

export async function getAppearance(
  orgId: number,
): Promise<AppearanceConfig> {
  const res = await apiClient.get<ApiResponse<AppearanceConfig>>(
    `/organizations/${orgId}/appearance`,
  );
  return res.data;
}

export async function updateAppearance(
  orgId: number,
  data: Partial<AppearanceConfig>,
): Promise<AppearanceConfig> {
  const res = await apiClient.patch<ApiResponse<AppearanceConfig>>(
    `/organizations/${orgId}/appearance`,
    data,
  );
  return res.data;
}

// ─── SSO ────────────────────────────────────────────────────────────────────

export async function getSsoConfig(orgId: number): Promise<SsoConfig> {
  const res = await apiClient.get<ApiResponse<SsoConfig>>(
    `/organizations/${orgId}/sso`,
  );
  return res.data;
}

export async function updateSsoConfig(
  orgId: number,
  data: Partial<SsoConfig>,
): Promise<SsoConfig> {
  const res = await apiClient.patch<ApiResponse<SsoConfig>>(
    `/organizations/${orgId}/sso`,
    data,
  );
  return res.data;
}

// ─── Notification Config ────────────────────────────────────────────────────

export async function getNotificationConfig(
  orgId: number,
): Promise<NotificationChannelConfig> {
  const res = await apiClient.get<ApiResponse<NotificationChannelConfig>>(
    `/organizations/${orgId}/notification-config`,
  );
  return res.data;
}

export async function updateNotificationConfig(
  orgId: number,
  data: Partial<NotificationChannelConfig>,
): Promise<NotificationChannelConfig> {
  const res = await apiClient.patch<ApiResponse<NotificationChannelConfig>>(
    `/organizations/${orgId}/notification-config`,
    data,
  );
  return res.data;
}

// ─── Storage Config ─────────────────────────────────────────────────────────

export async function getStorageConfig(
  orgId: number,
): Promise<StorageConfig> {
  const res = await apiClient.get<ApiResponse<StorageConfig>>(
    `/organizations/${orgId}/storage-config`,
  );
  return res.data;
}

export async function updateStorageConfig(
  orgId: number,
  data: Partial<StorageConfig>,
): Promise<StorageConfig> {
  const res = await apiClient.patch<ApiResponse<StorageConfig>>(
    `/organizations/${orgId}/storage-config`,
    data,
  );
  return res.data;
}
