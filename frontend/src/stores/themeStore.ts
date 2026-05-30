import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeMode } from '../types';

interface ThemeStore {
  mode: ThemeMode;
  resolved: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  initialize: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: 'system',
      resolved: 'light',
      setMode: (mode) => {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const resolved = mode === 'system' ? systemTheme : mode;
        
        // Toggle Tailwind dark mode
        document.documentElement.classList.toggle('dark', resolved === 'dark');
        set({ mode, resolved });
      },
      initialize: () => {
        const mode = get().mode;
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const resolved = mode === 'system' ? systemTheme : mode;
        
        document.documentElement.classList.toggle('dark', resolved === 'dark');
        set({ resolved });
      }
    }),
    {
      name: 'pinple-theme',
    }
  )
);
