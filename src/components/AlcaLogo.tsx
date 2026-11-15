interface AlcaLogoProps {
  tone?: 'light' | 'dark' | 'auto';
  size?: 'sm' | 'md' | 'lg';
}

export function AlcaLogo({ tone = 'auto', size = 'md' }: AlcaLogoProps) {
  const iconDimensions =
    size === 'lg' ? 'w-11 h-11' : size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
  const textClass =
    size === 'lg'
      ? 'text-xl tracking-tight'
      : size === 'sm'
        ? 'text-sm tracking-tight'
        : 'text-base tracking-tight';

  const primaryClass =
    tone === 'light'
      ? 'fill-white'
      : tone === 'dark'
        ? 'fill-slate-900 dark:fill-white'
        : 'fill-slate-900 dark:fill-white';

  const accentStrokeClass =
    tone === 'light'
      ? 'stroke-indigo-300'
      : 'stroke-indigo-600 dark:stroke-indigo-400';

  const accentFillClass =
    tone === 'light'
      ? 'fill-indigo-300'
      : 'fill-indigo-600 dark:fill-indigo-400';

  return (
    <div className="inline-flex items-center gap-2 select-none shrink-0">
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconDimensions}
        aria-hidden="true"
      >
        <path
          d="M20 5L7.5 33H13.5L20 17.5L26.5 33H32.5L20 5Z"
          className={`${primaryClass} transition-colors duration-300`}
        />
        <path
          d="M12.5 26.5C15.5 23.2 24.5 23.2 27.5 26.5"
          className={`${accentStrokeClass} transition-colors duration-300`}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <circle
          cx="20"
          cy="11.5"
          r="2.2"
          className={`${accentFillClass} transition-colors duration-300`}
        />
      </svg>
      <span
        className={`font-display font-extrabold whitespace-nowrap transition-colors duration-300 ${textClass} ${
          tone === 'light' ? 'text-white' : 'text-slate-900 dark:text-white'
        }`}
      >
        ALÇA
      </span>
    </div>
  );
}
