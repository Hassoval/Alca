import { AlcaLoader } from './AlcaLoader';

interface SkeletonShimmerProps {
  label?: string;
}

export function SkeletonShimmer({
  label = 'A conectar o teu espaço académico...',
}: SkeletonShimmerProps) {
  return (
    <div
      className="space-y-4 py-1"
      aria-busy="true"
      aria-label={label}
    >
      <div className="glass-surface rounded-3xl">
        <AlcaLoader label={label} compact />
      </div>

      {/* Stories shimmer */}
      <div className="glass-surface rounded-3xl p-4">
        <div className="h-4 w-24 rounded-md shimmer-block mb-3" />
        <div className="flex items-center gap-4 overflow-hidden">
          {[0, 1, 2, 3, 4].map((idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-14 h-14 rounded-full shimmer-block" />
              <div className="w-10 h-2.5 rounded shimmer-block" />
            </div>
          ))}
        </div>
      </div>

      {/* Feed card shimmers */}
      {[0, 1].map((card) => (
        <div key={card} className="glass-surface rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full shimmer-block" />
            <div className="space-y-2 flex-1">
              <div className="h-3.5 w-40 rounded shimmer-block" />
              <div className="h-2.5 w-24 rounded shimmer-block" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3.5 w-full rounded shimmer-block" />
            <div className="h-3.5 w-4/5 rounded shimmer-block" />
          </div>
          {card === 0 && <div className="h-40 w-full rounded-2xl shimmer-block" />}
        </div>
      ))}
    </div>
  );
}
