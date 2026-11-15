import { motion } from 'motion/react';

interface AlcaLoaderProps {
  label?: string;
  compact?: boolean;
}

export function AlcaLoader({
  label = 'A conectar o teu espaço académico...',
  compact = false,
}: AlcaLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center ${
        compact ? 'py-6 gap-3' : 'py-12 gap-5'
      }`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Soft breathing glass halo */}
        <motion.div
          animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.45, 0.85, 0.45] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-400/30 via-sky-300/25 to-violet-400/30 blur-md"
          aria-hidden="true"
        />

        <div className="relative w-14 h-14 rounded-2xl glass-popover flex items-center justify-center">
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8"
            aria-hidden="true"
          >
            <path
              d="M20 5L7.5 33H13.5L20 17.5L26.5 33H32.5L20 5Z"
              fill="#0A0F44"
            />
            <motion.path
              d="M12.5 26.5C15.5 23.2 24.5 23.2 27.5 26.5"
              stroke="#4F46E5"
              strokeWidth="3.2"
              strokeLinecap="round"
              animate={{ pathLength: [0.35, 1, 0.35], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.circle
              cx="20"
              cy="11.5"
              r="2.4"
              fill="#4F46E5"
              animate={{ scale: [0.85, 1.2, 0.85] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </svg>
        </div>
      </div>

      <div className="text-center space-y-2 max-w-xs">
        <p className="text-xs font-display font-semibold text-indigo-950">
          {label}
        </p>
        <div className="w-40 h-1.5 rounded-full bg-indigo-100/80 overflow-hidden mx-auto">
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.35, repeat: Infinity, ease: [0.16, 1, 0.3, 1] }}
            className="w-1/2 h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400"
          />
        </div>
      </div>
    </div>
  );
}
