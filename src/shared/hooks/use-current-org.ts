'use client';

import { useMemo } from 'react';

import { useAuthStore } from '@/shared/stores/auth.store';
import type { Organization } from '@/shared/types';

interface UseCurrentOrgReturn {
  /** The currently-selected organization, or null if none is selected. */
  currentOrg: Organization | null;
  /** The ID of the currently-selected organization. */
  currentOrgId: number | null;
  /** All organizations the user belongs to. */
  organizations: Organization[];
  /** Switch to a different organization by ID. */
  setCurrentOrg: (orgId: number | null) => void;
  /** Whether the user belongs to at least one organization. */
  hasOrganizations: boolean;
}

export function useCurrentOrg(): UseCurrentOrgReturn {
  const { currentOrgId, organizations, setCurrentOrg } = useAuthStore();

  const currentOrg = useMemo(
    () => organizations.find((org) => org.id === currentOrgId) ?? null,
    [organizations, currentOrgId],
  );

  return {
    currentOrg,
    currentOrgId,
    organizations,
    setCurrentOrg,
    hasOrganizations: organizations.length > 0,
  };
}
