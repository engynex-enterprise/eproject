'use client';

import { useCallback, useEffect } from 'react';

import { apiClient } from '@/shared/lib/api-client';
import { useAuthStore } from '@/shared/stores/auth.store';
import type {
  ApiError,
  ApiResponse,
  AuthTokens,
  LoginRequest,
  Organization,
  RegisterRequest,
  User,
} from '@/shared/types';

/**
 * Resolves which team org to activate after fetching the org list.
 * - If localStorage has an id matching a non-personal org → restore it.
 * - Otherwise → first non-personal org, or null (personal mode).
 * Personal orgs are never set as currentOrgId; they are accessed via
 * effectiveOrgId in consuming components.
 */
function resolveOrgId(orgs: Organization[]): number | null {
  const storedId = localStorage.getItem('current_org_id');
  if (storedId) {
    const match = orgs.find(
      (o) => o.id === Number(storedId) && !o.isPersonal,
    );
    if (match) return match.id;
  }
  return orgs.find((o) => !o.isPersonal)?.id ?? null;
}

export function useAuth() {
  const {
    user,
    accessToken,
    isAuthenticated,
    currentOrgId,
    organizations,
    setUser,
    setTokens,
    logout: storeLogout,
    setCurrentOrg,
    setOrganizations,
  } = useAuthStore();

  // ── Login ──────────────────────────────────────────────────────────
  const login = useCallback(
    async (credentials: LoginRequest) => {
      const res = await apiClient.post<
        ApiResponse<{ user: User; tokens: AuthTokens }>
      >('/auth/login', credentials);

      setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
      setUser(res.data.user);

      // Fetch organizations after login
      try {
        const orgsRes = await apiClient.get<ApiResponse<Organization[]>>(
          '/organizations',
        );
        setOrganizations(orgsRes.data);

        setCurrentOrg(resolveOrgId(orgsRes.data));
      } catch {
        // Organizations fetch is non-critical at login time
      }

      return res.data;
    },
    [setTokens, setUser, setOrganizations, setCurrentOrg],
  );

  // ── Register ───────────────────────────────────────────────────────
  const register = useCallback(
    async (data: RegisterRequest) => {
      const res = await apiClient.post<
        ApiResponse<{ user: User; tokens: AuthTokens }>
      >('/auth/register', data);

      setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
      setUser(res.data.user);

      return res.data;
    },
    [setTokens, setUser],
  );

  // ── Logout ─────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Best-effort server logout
    }
    storeLogout();
  }, [storeLogout]);

  // ── Fetch current user + organizations (used on app bootstrap) ───────
  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await apiClient.get<ApiResponse<User>>('/users/me');
      setUser(res.data);

      // Always re-fetch organizations on bootstrap so the store is populated
      try {
        const orgsRes = await apiClient.get<ApiResponse<Organization[]>>(
          '/organizations',
        );
        setOrganizations(orgsRes.data);

        setCurrentOrg(resolveOrgId(orgsRes.data));
      } catch {
        // org fetch is non-critical
      }

      return res.data;
    } catch (error) {
      // Only clear the session for definitive auth failures (401).
      // Network errors, 500s, or other transient issues should NOT log the
      // user out — the api-client already handles the refresh → retry cycle
      // and emits 'auth:logout' when both tokens are truly expired.
      const status = (error as ApiError)?.statusCode;
      if (status === 401) {
        storeLogout();
      }
      return null;
    }
  }, [setUser, storeLogout, setOrganizations, setCurrentOrg]);

  // ── Listen for forced logout (401 after failed refresh) ────────────
  useEffect(() => {
    const handler = () => storeLogout();
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [storeLogout]);

  return {
    user,
    accessToken,
    isAuthenticated,
    currentOrgId,
    organizations,
    login,
    register,
    logout,
    fetchCurrentUser,
    setCurrentOrg,
    setOrganizations,
  };
}
