import { create } from 'zustand';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SileoPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type SileoTheme = 'light' | 'dark' | 'system';

export interface SileoConfig {
  position: SileoPosition;
  theme: SileoTheme;
  /** Duration in ms. null = never auto-dismiss. */
  duration: number | null;
  /** Border radius (0-24). */
  roundness: number;
  offsetTop: number;
  offsetRight: number;
  offsetBottom: number;
  offsetLeft: number;
}

const STORAGE_KEY = 'sileo-config';

const DEFAULT_CONFIG: SileoConfig = {
  position: 'top-right',
  theme: 'system',
  duration: 4000,
  roundness: 12,
  offsetTop: 16,
  offsetRight: 16,
  offsetBottom: 16,
  offsetLeft: 16,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadFromStorage(): SileoConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

function saveToStorage(config: SileoConfig) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface SileoConfigState {
  config: SileoConfig;
  updateConfig: (patch: Partial<SileoConfig>) => void;
  resetConfig: () => void;
}

export const useSileoConfigStore = create<SileoConfigState>((set) => ({
  config: loadFromStorage(),

  updateConfig: (patch) =>
    set((state) => {
      const next = { ...state.config, ...patch };
      saveToStorage(next);
      return { config: next };
    }),

  resetConfig: () => {
    saveToStorage(DEFAULT_CONFIG);
    set({ config: DEFAULT_CONFIG });
  },
}));

export { DEFAULT_CONFIG };
