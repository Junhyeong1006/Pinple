import { Sun, Moon, Laptop } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';

export function ThemeToggle() {
  const { mode, setMode } = useThemeStore();

  return (
    <div className="flex items-center gap-1 bg-zinc-200/50 dark:bg-zinc-800/50 backdrop-blur-md p-1 rounded-full border border-zinc-300/40 dark:border-zinc-700/40 transition-colors">
      <button
        onClick={() => setMode('light')}
        className={`p-1.5 rounded-full transition-all duration-200 ${
          mode === 'light'
            ? 'bg-white dark:bg-zinc-700 text-violet-500 shadow-sm scale-110'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
        }`}
        title="라이트 모드"
      >
        <Sun size={16} />
      </button>
      <button
        onClick={() => setMode('dark')}
        className={`p-1.5 rounded-full transition-all duration-200 ${
          mode === 'dark'
            ? 'bg-white dark:bg-zinc-700 text-violet-500 shadow-sm scale-110'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
        }`}
        title="다크 모드"
      >
        <Moon size={16} />
      </button>
      <button
        onClick={() => setMode('system')}
        className={`p-1.5 rounded-full transition-all duration-200 ${
          mode === 'system'
            ? 'bg-white dark:bg-zinc-700 text-violet-500 shadow-sm scale-110'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
        }`}
        title="시스템 테마"
      >
        <Laptop size={16} />
      </button>
    </div>
  );
}
