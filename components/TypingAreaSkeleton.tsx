const SKELETON_LINES = 3;
const SKELETON_WIDTHS = ["w-full", "w-11/12", "w-4/5"] as const;

/**
 * Placeholder shown before words load. Uses the same font size, line height and row gap
 * as the real text so the layout doesn't shift when words arrive.
 */
const TypingAreaSkeleton = () => (
  <div
    data-testid="typing-skeleton"
    aria-hidden="true"
    className="flex flex-col gap-y-2 pb-2 font-mono text-2xl sm:text-3xl font-medium leading-relaxed"
  >
    {Array.from({ length: SKELETON_LINES }, (_, i) => (
      <div key={i} className="flex items-center h-[1.625em]">
        <div className={`motion-safe:animate-pulse bg-white/5 rounded h-[1em] ${SKELETON_WIDTHS[i % SKELETON_WIDTHS.length]}`} />
      </div>
    ))}
  </div>
);

export default TypingAreaSkeleton;
