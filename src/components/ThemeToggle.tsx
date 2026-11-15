import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
  showLabel?: boolean;
}

export function ThemeToggle({
  theme,
  onToggle,
  showLabel = false,
}: ThemeToggleProps) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={
        isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'
      }
      aria-pressed={isDark}
      className={`min-h-[44px] ${
        showLabel ? 'px-3.5 gap-2' : 'min-w-[44px] justify-center'
      } rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-indigo-200 border border-white/80 dark:border-slate-700/80 shadow-xs flex items-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-300 transition-transform duration-300" aria-hidden="true" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-700 transition-transform duration-300" aria-hidden="true" />
      )}
      {showLabel && (
        <span className="text-xs font-medium whitespace-nowrap">
          {isDark ? 'Modo Claro' : 'Modo Escuro'}
        </span>
      )}
    </button>
  );
}
