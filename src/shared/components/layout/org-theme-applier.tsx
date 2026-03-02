'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/shared/stores/auth.store';
import { useAppearance } from '@/modules/organization/hooks/use-organization';

const GOOGLE_FONTS_LINK_ID = 'org-google-font';

/**
 * Reads the active organization's appearance settings and applies them
 * as CSS variables and next-themes changes while the user is in org context.
 * When `currentOrgId` is null (personal account), personal settings are restored.
 */
export function OrgThemeApplier() {
  const { theme, setTheme } = useTheme();
  const currentOrgId = useAuthStore((s) => s.currentOrgId);
  const { data: appearance } = useAppearance(currentOrgId ?? 0);

  // Track the user's personal theme so we can restore it on switch
  const personalThemeRef = useRef<string>('system');
  const appliedOrgRef = useRef(false);

  // Capture personal theme before any org override
  useEffect(() => {
    if (!appliedOrgRef.current && theme) {
      personalThemeRef.current = theme;
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;

    if (!currentOrgId || !appearance) {
      if (appliedOrgRef.current) {
        // ── Restore personal settings ──────────────────────────────────
        setTheme(personalThemeRef.current);
        removeColorOverrides(root);
        removeFontOverride();
        appliedOrgRef.current = false;
      }
      return;
    }

    appliedOrgRef.current = true;

    // ── Apply org dark-mode ────────────────────────────────────────
    setTheme(appearance.darkMode ? 'dark' : 'light');

    // ── Apply org accent color ─────────────────────────────────────
    const color = appearance.accentColor ?? appearance.primaryColor;
    if (color && isValidHex(color)) {
      applyColorOverrides(root, color);
    } else {
      removeColorOverrides(root);
    }

    // ── Apply org font family ──────────────────────────────────────
    if (appearance.fontFamily) {
      applyFontOverride(appearance.fontFamily);
    } else {
      removeFontOverride();
    }
  }, [currentOrgId, appearance, setTheme]);

  return null;
}

// ─── Color helpers ────────────────────────────────────────────────────────────

function isValidHex(color: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(color);
}

function getLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** Choose white or near-black foreground for maximum contrast. */
function getForeground(hex: string): string {
  return getLuminance(hex) > 0.35 ? '#172B4D' : '#ffffff';
}

/**
 * Override ALL CSS variables that drive primary/accent/sidebar colors.
 * Setting hex directly on --primary works because Tailwind v4 @theme inline
 * maps --color-primary: var(--primary) at runtime, so bg-primary picks it up.
 */
function applyColorOverrides(root: HTMLElement, hex: string) {
  const fg = getForeground(hex);
  root.style.setProperty('--primary', hex);
  root.style.setProperty('--primary-foreground', fg);
  root.style.setProperty('--ring', hex);
  root.style.setProperty('--accent', hex);
  root.style.setProperty('--accent-foreground', fg);
  // Sidebar active/hover state uses --sidebar-accent (not --sidebar-primary)
  root.style.setProperty('--sidebar-accent', hex);
  root.style.setProperty('--sidebar-accent-foreground', fg);
  root.style.setProperty('--sidebar-primary', hex);
  root.style.setProperty('--sidebar-primary-foreground', fg);
  root.style.setProperty('--sidebar-ring', hex);
}

function removeColorOverrides(root: HTMLElement) {
  for (const prop of [
    '--primary',
    '--primary-foreground',
    '--ring',
    '--accent',
    '--accent-foreground',
    '--sidebar-accent',
    '--sidebar-accent-foreground',
    '--sidebar-primary',
    '--sidebar-primary-foreground',
    '--sidebar-ring',
  ]) {
    root.style.removeProperty(prop);
  }
}

// ─── Font helpers ─────────────────────────────────────────────────────────────

/** Maps display name → Google Fonts URL slug. */
const GOOGLE_FONTS: Record<string, string> = {
  Roboto: 'Roboto',
  'Open Sans': 'Open+Sans',
  Lato: 'Lato',
  Poppins: 'Poppins',
  Nunito: 'Nunito',
  Raleway: 'Raleway',
  Montserrat: 'Montserrat',
  'Source Sans 3': 'Source+Sans+3',
};

function applyFontOverride(fontFamily: string) {
  // Inject Google Fonts <link> if this is a web font (skip Inter — already loaded)
  const slug = GOOGLE_FONTS[fontFamily];
  if (slug) {
    const existing = document.getElementById(GOOGLE_FONTS_LINK_ID);
    if (!existing || existing.getAttribute('data-font') !== fontFamily) {
      existing?.remove();
      const link = document.createElement('link');
      link.id = GOOGLE_FONTS_LINK_ID;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${slug}:wght@400;500;600;700&display=swap`;
      link.setAttribute('data-font', fontFamily);
      document.head.appendChild(link);
    }
  }

  const value = `"${fontFamily}", system-ui, sans-serif`;
  // Override --font-sans: Tailwind v4 @theme inline maps --font-sans to the
  // font-sans utility, so overriding it on :root changes the entire app.
  document.documentElement.style.setProperty('--font-sans', value);
  // Also set font-family directly on body for immediate effect
  document.body.style.fontFamily = value;
}

function removeFontOverride() {
  document.getElementById(GOOGLE_FONTS_LINK_ID)?.remove();
  document.documentElement.style.removeProperty('--font-sans');
  document.body.style.removeProperty('font-family');
}
