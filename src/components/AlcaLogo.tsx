interface AlcaLogoProps {
  tone?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

export function AlcaLogo({ tone = 'dark', size = 'md' }: AlcaLogoProps) {
  const iconDimensions =
    size === 'lg' ? 'w-11 h-11' : size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
  const textClass =
    size === 'lg'
      ? 'text-xl tracking-tight'
      : size === 'sm'
        ? 'text-sm tracking-tight'
        : 'text-base tracking-tight';

  const primaryStroke = tone === 'light' ? '#FFFFFF' : '#0F172A';
  const accentFill = tone === 'light' ? '#A5B4FC' : '#4F46E5';

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
          fill={primaryStroke}
        />
        <path
          d="M12.5 26.5C15.5 23.2 24.5 23.2 27.5 26.5"
          stroke={accentFill}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <circle cx="20" cy="11.5" r="2.2" fill={accentFill} />
      </svg>
      <span
        className={`font-display font-extrabold whitespace-nowrap ${textClass} ${
          tone === 'light' ? 'text-white' : 'text-slate-900'
        }`}
      >
        ALÇA
      </span>
    </div>
  );
}
