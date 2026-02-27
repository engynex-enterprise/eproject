'use client';

import { useCallback, useEffect } from 'react';

import { apiClient } from '@/shared/lib/api-client';
import { useAuthStore } from '@/shared/stores/auth.store';
import type {
  ApiResponse,
  AuthTokens,
  LoginRequest,
  Organization,
  RegisterRequest,
  User,
} from '@/shared/types';

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

        // Restore last selected org or pick first
        const storedOrgId = localStorage.getItem('current_org_id');
        if (storedOrgId && orgsRes.data.some((o) => o.id === Number(storedOrgId))) {
          setCurrentOrg(Number(storedOrgId));
        } else if (orgsRes.data.length > 0) {
          setCurrentOrg(orgsRes.data[0].id);
        }
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
      const res = await apiClient.get<ApiResponse<User>>('/auth/me');
      setUser(res.data);

      // Always re-fetch organizations on bootstrap so the store is populated
      try {
        const orgsRes = await apiClient.get<ApiResponse<Organization[]>>(
          '/organizations',
        );
        setOrganizations(orgsRes.data);

        // Restore last selected org from localStorage, or default to first
        const storedOrgId = localStorage.getItem('current_org_id');
        if (
          storedOrgId &&
          orgsRes.data.some((o) => o.id === Number(storedOrgId))
        ) {
          setCurrentOrg(Number(storedOrgId));
        } else if (orgsRes.data.length > 0) {
          setCurrentOrg(orgsRes.data[0].id);
        }
      } catch {
        // org fetch is non-critical
      }

      return res.data;
    } catch {
      storeLogout();
      return null;
    }
  }, [setUser, storeLogout, setOrganizations, setCurrentOrg]);

  // ── Listen for forced logout (401 after failed refresh) ────────────
  useEffect(() => {
    const handler = () => storeLogout();
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [storeLogout]);

  // ── Hydrate on mount: fire whenever the user object is not yet loaded ─
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken && !user) {
      useAuthStore.setState({ accessToken: storedToken, isAuthenticated: true });
      fetchCurrentUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
