'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactNode,
} from 'react';

import { useThemeStore } from '@/shared/stores/theme.store';

// ─── Color palette ───────────────────────────────────────────────────────────

export interface AccentColorDefinition {
  base: string;
  foreground: string;
  light: string;
  dark: string;
}

export const ACCENT_COLORS: Record<string, AccentColorDefinition> = {
  blue: {
    base: '#0052CC',
    foreground: '#FFFFFF',
    light: '#4C9AFF',
    dark: '#003D99',
  },
  green: {
    base: '#36B37E',
    foreground: '#FFFFFF',
    light: '#79F2C0',
    dark: '#006644',
  },
  yellow: {
    base: '#FF991F',
    foreground: '#FFFFFF',
    light: '#FFC400',
    dark: '#FF8B00',
  },
  orange: {
    base: '#FF5630',
    foreground: '#FFFFFF',
    light: '#FF8F73',
    dark: '#DE350B',
  },
  purple: {
    base: '#6554C0',
    foreground: '#FFFFFF',
    light: '#998DD9',
    dark: '#403294',
  },
  red: {
    base: '#DE350B',
    foreground: '#FFFFFF',
    light: '#FF8F73',
    dark: '#BF2600',
  },
};

// ─── Context ─────────────────────────────────────────────────────────────────

interface AccentColorContextValue {
  accentColor: string;
  setAccentColor: (color: string) => void;
  colors: AccentColorDefinition;
  availableColors: string[];
}

const AccentColorContext = createContext<AccentColorContextValue | undefined>(
  undefined,
);

// ─── Provider ────────────────────────────────────────────────────────────────

interface AccentColorProviderProps {
  children: ReactNode;
}

export function AccentColorProvider({ children }: AccentColorProviderProps) {
  const { accentColor, setAccentColor: storeSetAccentColor } = useThemeStore();

  const colors = ACCENT_COLORS[accentColor] ?? ACCENT_COLORS.blue;

  // Apply CSS custom properties to :root
  const applyCustomProperties = useCallback(
    (colorDef: AccentColorDefinition) => {
      const root = document.documentElement;
      root.style.setProperty('--accent-color', colorDef.base);
      root.style.setProperty('--accent-color-foreground', colorDef.foreground);
      root.style.setProperty('--accent-color-light', colorDef.light);
      root.style.setProperty('--accent-color-dark', colorDef.dark);
    },
    [],
  );

  // Sync on mount and when accentColor changes
  useEffect(() => {
    applyCustomProperties(colors);
  }, [colors, applyCustomProperties]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('accent_color');
    if (stored && stored !== accentColor && ACCENT_COLORS[stored]) {
      storeSetAccentColor(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAccentColor = useCallback(
    (color: string) => {
      if (!ACCENT_COLORS[color]) return;
      storeSetAccentColor(color);
    },
    [storeSetAccentColor],
  );

  return (
    <AccentColorContext.Provider
      value={{
        accentColor,
        setAccentColor,
        colors,
        availableColors: Object.keys(ACCENT_COLORS),
      }}
    >
      {children}
    </AccentColorContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAccentColor(): AccentColorContextValue {
  const context = useContext(AccentColorContext);
  if (!context) {
    throw new Error(
      'useAccentColor must be used within an AccentColorProvider',
    );
  }
  return context;
}
