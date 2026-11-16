import { create } from 'zustand';
import { ThemeMode } from '../types/theme';

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeMode: 'system',
  setThemeMode: (themeMode: ThemeMode) => set({ themeMode }),
  toggleTheme: () => {
    const current = get().themeMode;
    const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
    set({ themeMode: next });
  },
}));
