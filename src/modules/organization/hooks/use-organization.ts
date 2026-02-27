'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getOrganization,
  updateOrganization,
  getMembers,
  inviteMember,
  createMember,
  removeMember,
  updateMemberRole,
  getPendingInvitations,
  cancelInvitation,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getPermissions,
  getAppearance,
  updateAppearance,
  getSsoConfig,
  updateSsoConfig,
  getNotificationConfig,
  updateNotificationConfig,
  getStorageConfig,
  updateStorageConfig,
  getSecurityConfig,
  updateSecurityConfig,
  getAuditLog,
  getApiKeys,
  createApiKey,
  revokeApiKey,
  getWebhooks,
  createWebhook,
  deleteWebhook,
  getPlatformInfo,
  type UpdateOrganizationData,
  type InviteMemberData,
  type CreateMemberData,
  type CreateRoleData,
  type UpdateRoleData,
  type AppearanceConfig,
  type SsoConfig,
  type NotificationChannelConfig,
  type StorageConfig,
  type SecurityConfig,
  type AuditFilters,
  type CreateApiKeyData,
  type CreateWebhookData,
} from '@/modules/organization/services/organization.service';

// ─── Query Keys ─────────────────────────────────────────────────────────────

const orgKeys = {
  all: ['organization'] as const,
  detail: (orgId: number) => [...orgKeys.all, 'detail', orgId] as const,
  members: (orgId: number) => [...orgKeys.all, 'members', orgId] as const,
  invitations: (orgId: number) =>
    [...orgKeys.all, 'invitations', orgId] as const,
  roles: (orgId: number) => [...orgKeys.all, 'roles', orgId] as const,
  permissions: () => [...orgKeys.all, 'permissions'] as const,
  appearance: (orgId: number) =>
    [...orgKeys.all, 'appearance', orgId] as const,
  sso: (orgId: number) => [...orgKeys.all, 'sso', orgId] as const,
  notificationConfig: (orgId: number) =>
    [...orgKeys.all, 'notification-config', orgId] as const,
  storageConfig: (orgId: number) =>
    [...orgKeys.all, 'storage-config', orgId] as const,
  securityConfig: (orgId: number) =>
    [...orgKeys.all, 'security-config', orgId] as const,
  auditLog: (orgId: number, filters?: AuditFilters) =>
    [...orgKeys.all, 'audit-log', orgId, filters] as const,
  apiKeys: (orgId: number) => [...orgKeys.all, 'api-keys', orgId] as const,
  webhooks: (orgId: number) => [...orgKeys.all, 'webhooks', orgId] as const,
  platformInfo: () => [...orgKeys.all, 'platform-info'] as const,
};

// ─── Organization ───────────────────────────────────────────────────────────

export function useOrganization(orgId: number) {
  return useQuery({
    queryKey: orgKeys.detail(orgId),
    queryFn: () => getOrganization(orgId),
    enabled: !!orgId,
  });
}

export function useUpdateOrganization(orgId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateOrganizationData) =>
      updateOrganization(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.detail(orgId) });
    },
  });
}

// ─── Members ────────────────────────────────────────────────────────────────

export function useOrgMembers(orgId: number) {
  return useQuery({
    queryKey: orgKeys.members(orgId),
    queryFn: () => getMembers(orgId),
    enabled: !!orgId,
  });
}

export function useInviteMember(orgId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InviteMemberData) => inviteMember(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.members(orgId) });
      queryClient.invalidateQueries({ queryKey: orgKeys.invitations(orgId) });
    },
  });
}

export function useCreateMember(orgId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMemberData) => createMember(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.members(orgId) });
    },
  });
}

export function useRemoveMember(orgId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: number) => removeMember(orgId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.members(orgId) });
    },
  });
}

export function useUpdateMemberRole(orgId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, roleId }: { memberId: number; roleId: number }) =>
      updateMemberRole(orgId, memberId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.members(orgId) });
    },
  });
}

export function usePendingInvitations(orgId: number) {
  return useQuery({
    queryKey: orgKeys.invitations(orgId),
    queryFn: () => getPendingInvitations(orgId),
    enabled: !!orgId,
  });
}

export function useCancelInvitation(orgId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: number) =>
      cancelInvitation(orgId, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.invitations(orgId) });
    },
  });
}

// ─── Roles & Permissions ────────────────────────────────────────────────────

export function useOrgRoles(orgId: number) {
  return useQuery({
    queryKey: orgKeys.roles(orgId),
    queryFn: () => getRoles(orgId),
    enabled: !!orgId,
  });
}

export function useCreateRole(orgId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoleData) => createRole(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.roles(orgId) });
    },
  });
}

export function useUpdateRole(orgId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, data }: { roleId: number; data: UpdateRoleData }) =>
      updateRole(roleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.roles(orgId) });
    },
  });
}

export function useDeleteRole(orgId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleId: number) => deleteRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.roles(orgId) });
    },
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: orgKeys.permissions(),
    queryFn: () => getPermissions(),
  });
}

// ─── Appearance ─────────────────────────────────────────────────────────────

export function useAppearance(orgId: number) {
  return useQuery({
    queryKey: orgKeys.appearance(orgId),
    queryFn: () => getAppearance(orgId),
    enabled: !!orgId,
  });
}

export function useUpdateAppearance(orgId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AppearanceConfig>) =>
      updateAppearance(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.appearance(orgId) });
    },
  });
}

// ─── SSO ────────────────────────────────────────────────────────────────────

export function useSsoConfig(orgId: number) {
  return useQuery({
    queryKey: orgKeys.sso(orgId),
    queryFn: () => getSsoConfig(orgId),
    enabled: !!orgId,
  });
}

export function useUpdateSsoConfig(orgId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SsoConfig>) => updateSsoConfig(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.sso(orgId) });
    },
  });
}

// ─── Notification Config ────────────────────────────────────────────────────

export function useNotificationConfig(orgId: number) {
  return useQuery({
    queryKey: orgKeys.notificationConfig(orgId),
    queryFn: () => getNotificationConfig(orgId),
    enabled: !!orgId,
  });
}

export function useUpdateNotificationConfig(orgId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<NotificationChannelConfig>) =>
      updateNotificationConfig(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orgKeys.notificationConfig(orgId),
      });
    },
  });
}

// ─── Storage Config ─────────────────────────────────────────────────────────

export function useStorageConfig(orgId: number) {
  return useQuery({
    queryKey: orgKeys.storageConfig(orgId),
    queryFn: () => getStorageConfig(orgId),
    enabled: !!orgId,
  });
}

export function useUpdateStorageConfig(orgId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<StorageConfig>) =>
      updateStorageConfig(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orgKeys.storageConfig(orgId),
      });
    },
  });
}

// ─── Security Config ─────────────────────────────────────────────────────────

export function useSecurityConfig(orgId: number) {
  return useQuery({
    queryKey: orgKeys.securityConfig(orgId),
    queryFn: () => getSecurityConfig(orgId),
    enabled: !!orgId,
  });
}

export function useUpdateSecurityConfig(orgId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SecurityConfig>) =>
      updateSecurityConfig(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orgKeys.securityConfig(orgId),
      });
    },
  });
}

// ─── Audit Log ───────────────────────────────────────────────────────────────

export function useAuditLog(orgId: number, filters?: AuditFilters) {
  return useQuery({
    queryKey: orgKeys.auditLog(orgId, filters),
    queryFn: () => getAuditLog(orgId, filters),
    enabled: !!orgId,
  });
}

// ─── API Keys ────────────────────────────────────────────────────────────────

export function useApiKeys(orgId: number) {
  return useQuery({
    queryKey: orgKeys.apiKeys(orgId),
    queryFn: () => getApiKeys(orgId),
    enabled: !!orgId,
  });
}

export function useCreateApiKey(orgId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateApiKeyData) => createApiKey(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.apiKeys(orgId) });
    },
  });
}

export function useRevokeApiKey(orgId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (keyId: number) => revokeApiKey(orgId, keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.apiKeys(orgId) });
    },
  });
}

// ─── Webhooks ────────────────────────────────────────────────────────────────

export function useWebhooks(orgId: number) {
  return useQuery({
    queryKey: orgKeys.webhooks(orgId),
    queryFn: () => getWebhooks(orgId),
    enabled: !!orgId,
  });
}

export function useCreateWebhook(orgId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWebhookData) => createWebhook(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.webhooks(orgId) });
    },
  });
}

export function useDeleteWebhook(orgId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (webhookId: number) => deleteWebhook(orgId, webhookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.webhooks(orgId) });
    },
  });
}

// ─── Platform Info ───────────────────────────────────────────────────────────

export function usePlatformInfo() {
  return useQuery({
    queryKey: orgKeys.platformInfo(),
    queryFn: () => getPlatformInfo(),
    staleTime: 1000 * 60 * 5, // 5 min
  });
}
