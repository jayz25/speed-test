const SKELETON_LINES = 3;
const SKELETON_WIDTHS = ["w-full", "w-11/12", "w-4/5"] as const;

/**
 * Placeholder shown before words load. Positioned inside the fixed-height words viewport (3 lines x 1.625em + row gaps),
 * using the same line height and row gap as the real text so the layout doesn't shift when words arrive.
 */
const TypingAreaSkeleton = () => (
  <div
    data-testid="typing-skeleton"
    aria-hidden="true"
    className="absolute inset-x-0 top-0 flex flex-col gap-y-2"
  >
    {Array.from({ length: SKELETON_LINES }, (_, i) => (
      <div key={i} className="flex items-center h-[1.625em]">
        <div className={`motion-safe:animate-pulse bg-divider rounded-sm h-[1em] ${SKELETON_WIDTHS[i % SKELETON_WIDTHS.length]}`} />
      </div>
    ))}
  </div>
);

export default TypingAreaSkeleton;
