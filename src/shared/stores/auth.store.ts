import { create } from 'zustand';

import type { Organization, User } from '@/shared/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  currentOrgId: number | null;
  organizations: Organization[];
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setCurrentOrg: (orgId: number | null) => void;
  setOrganizations: (orgs: Organization[]) => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  // ── State ──────────────────────────────────────────────────────────
  user: null,
  accessToken: null,
  isAuthenticated: false,
  currentOrgId: null,
  organizations: [],

  // ── Actions ────────────────────────────────────────────────────────
  setUser: (user) =>
    set({
      user,
      isAuthenticated: user !== null,
    }),

  setTokens: (accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    }
    set({ accessToken, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('current_org_id');
    }
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      currentOrgId: null,
      organizations: [],
    });
  },

  setCurrentOrg: (orgId) => {
    if (typeof window !== 'undefined') {
      if (orgId !== null) {
        localStorage.setItem('current_org_id', String(orgId));
      } else {
        localStorage.removeItem('current_org_id');
      }
    }
    set({ currentOrgId: orgId });
  },

  setOrganizations: (organizations) => set({ organizations }),
}));
