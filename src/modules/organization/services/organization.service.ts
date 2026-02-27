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

export interface CreateMemberData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
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

export async function createMember(
  orgId: number,
  data: CreateMemberData,
): Promise<OrganizationMember> {
  const res = await apiClient.post<ApiResponse<OrganizationMember>>(
    `/organizations/${orgId}/members`,
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

// ─── Security Config (stub — backend endpoint pending) ──────────────────────

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireNumber: boolean;
  requireSymbol: boolean;
  expirationDays: number | null;
}

export interface SecurityConfig {
  passwordPolicy: PasswordPolicy;
  twoFactorAuth: { enabled: boolean; required: boolean };
  accountLockout: { enabled: boolean; maxAttempts: number; lockoutMinutes: number };
  ipWhitelist: { enabled: boolean; addresses: string[] };
  socialProviders: SsoConfig;
  sessionTimeout: number | null;
}

const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  passwordPolicy: { minLength: 8, requireUppercase: false, requireNumber: false, requireSymbol: false, expirationDays: null },
  twoFactorAuth: { enabled: false, required: false },
  accountLockout: { enabled: false, maxAttempts: 5, lockoutMinutes: 30 },
  ipWhitelist: { enabled: false, addresses: [] },
  socialProviders: { google: { enabled: false, clientId: '', clientSecret: '' }, github: { enabled: false, clientId: '', clientSecret: '' } },
  sessionTimeout: null,
};

export async function getSecurityConfig(_orgId: number): Promise<SecurityConfig> {
  console.warn('[security] getSecurityConfig: backend endpoint not yet implemented');
  return DEFAULT_SECURITY_CONFIG;
}

export async function updateSecurityConfig(
  _orgId: number,
  _data: Partial<SecurityConfig>,
): Promise<SecurityConfig> {
  console.warn('[security] updateSecurityConfig: backend endpoint not yet implemented');
  return DEFAULT_SECURITY_CONFIG;
}

// ─── Audit Log (stub — backend endpoint pending) ────────────────────────────

export interface AuditEntry {
  id: number;
  timestamp: string;
  userId: number;
  userName: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  ipAddress: string;
}

export interface AuditFilters {
  userId?: number;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogResult {
  entries: AuditEntry[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getAuditLog(
  _orgId: number,
  _filters?: AuditFilters,
): Promise<AuditLogResult> {
  console.warn('[audit] getAuditLog: backend endpoint not yet implemented');
  return { entries: [], total: 0, page: 1, totalPages: 0 };
}

// ─── API Keys (stub — backend endpoint pending) ─────────────────────────────

export interface ApiKey {
  id: number;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
}

export interface CreateApiKeyData {
  name: string;
  scopes: string[];
  expiresAt?: string | null;
}

export interface CreateApiKeyResult {
  key: ApiKey;
  plaintext: string;
}

export async function getApiKeys(_orgId: number): Promise<ApiKey[]> {
  console.warn('[advanced] getApiKeys: backend endpoint not yet implemented');
  return [];
}

export async function createApiKey(
  _orgId: number,
  _data: CreateApiKeyData,
): Promise<CreateApiKeyResult> {
  console.warn('[advanced] createApiKey: backend endpoint not yet implemented');
  const stub: ApiKey = { id: Date.now(), name: _data.name, prefix: 'ept_live_xxxx', scopes: _data.scopes, createdAt: new Date().toISOString(), lastUsedAt: null, expiresAt: _data.expiresAt ?? null };
  return { key: stub, plaintext: `ept_live_${'x'.repeat(32)}` };
}

export async function revokeApiKey(
  _orgId: number,
  _keyId: number,
): Promise<void> {
  console.warn('[advanced] revokeApiKey: backend endpoint not yet implemented');
}

// ─── Webhooks (stub — backend endpoint pending) ─────────────────────────────

export interface Webhook {
  id: number;
  url: string;
  events: string[];
  isActive: boolean;
  lastTriggeredAt: string | null;
  createdAt: string;
}

export interface CreateWebhookData {
  url: string;
  events: string[];
}

export async function getWebhooks(_orgId: number): Promise<Webhook[]> {
  console.warn('[advanced] getWebhooks: backend endpoint not yet implemented');
  return [];
}

export async function createWebhook(
  _orgId: number,
  _data: CreateWebhookData,
): Promise<Webhook> {
  console.warn('[advanced] createWebhook: backend endpoint not yet implemented');
  return { id: Date.now(), url: _data.url, events: _data.events, isActive: true, lastTriggeredAt: null, createdAt: new Date().toISOString() };
}

export async function deleteWebhook(
  _orgId: number,
  _webhookId: number,
): Promise<void> {
  console.warn('[advanced] deleteWebhook: backend endpoint not yet implemented');
}

// ─── Platform Info (stub — backend endpoint pending) ────────────────────────

export interface PlatformInfo {
  appVersion: string;
  apiVersion: string;
  environment: string;
  database: string;
  uptime: number;
  totalUsers: number;
  totalOrgs: number;
}

export async function getPlatformInfo(): Promise<PlatformInfo> {
  console.warn('[platform] getPlatformInfo: backend endpoint not yet implemented');
  return {
    appVersion: '1.0.0',
    apiVersion: '1.0.0',
    environment: process.env.NODE_ENV ?? 'development',
    database: 'PostgreSQL',
    uptime: 0,
    totalUsers: 0,
    totalOrgs: 0,
  };
}
