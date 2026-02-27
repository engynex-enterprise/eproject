import { create } from 'zustand';

interface ThemeState {
  accentColor: string;
}

interface ThemeActions {
  setAccentColor: (color: string) => void;
}

export type ThemeStore = ThemeState & ThemeActions;

export const useThemeStore = create<ThemeStore>((set) => ({
  accentColor: 'blue',

  setAccentColor: (accentColor) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accent_color', accentColor);
    }
    set({ accentColor });
  },
}));
