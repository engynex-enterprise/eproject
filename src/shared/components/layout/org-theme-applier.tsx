'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/shared/stores/auth.store';
import { useAppearance } from '@/modules/organization/hooks/use-organization';

/**
 * Reads the active organization's appearance settings and applies them
 * as CSS variables and next-themes changes while the user is in org context.
 * When `currentOrgId` is null (personal account), personal settings are restored.
 */
export function OrgThemeApplier() {
  const { setTheme } = useTheme();
  const currentOrgId = useAuthStore((s) => s.currentOrgId);
  const { data: appearance } = useAppearance(currentOrgId ?? 0);

  // Track the user's personal theme so we can restore it on switch
  const personalThemeRef = useRef<string>('system');

  // Capture personal theme on first render (before any org override)
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored) personalThemeRef.current = stored;
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    if (!currentOrgId || !appearance) {
      // ── Restore personal settings ──────────────────────────────────
      setTheme(personalThemeRef.current);
      root.style.removeProperty('--org-accent');
      root.style.removeProperty('--org-font');
      root.style.removeProperty('--font-family-override');
      return;
    }

    // ── Apply org dark-mode ────────────────────────────────────────
    if (appearance.darkMode) {
      setTheme('dark');
    } else {
      // Only switch to light if we're currently overriding via org
      setTheme('light');
    }

    // ── Apply org accent color ─────────────────────────────────────
    const color = appearance.accentColor ?? appearance.primaryColor;
    if (color) {
      // Override the Tailwind CSS variables used for primary color
      root.style.setProperty('--org-accent', color);
      // Apply to the variables that shadcn/ui reads
      root.style.setProperty('--primary', hexToHsl(color));
    } else {
      root.style.removeProperty('--org-accent');
      root.style.removeProperty('--primary');
    }

    // ── Apply org font family ──────────────────────────────────────
    if (appearance.fontFamily) {
      root.style.setProperty('--font-family-override', appearance.fontFamily);
      root.style.setProperty('font-family', appearance.fontFamily);
      document.body.style.fontFamily = `${appearance.fontFamily}, system-ui, sans-serif`;
    } else {
      root.style.removeProperty('--font-family-override');
      document.body.style.removeProperty('font-family');
    }

    return () => {
      // Cleanup when component unmounts
      root.style.removeProperty('--org-accent');
      root.style.removeProperty('--primary');
      root.style.removeProperty('--font-family-override');
      document.body.style.removeProperty('font-family');
    };
  }, [currentOrgId, appearance, setTheme]);

  return null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convert a hex color to CSS HSL string (e.g. "221 83% 53%") for shadcn variables. */
function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '';
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
