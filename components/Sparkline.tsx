import { sparklinePoints } from "../utils/sparklinePoints";

const WIDTH = 220;
const HEIGHT = 56;

/** Words-per-minute trend line, one point per second. */
export default function Sparkline({ values }: { values: readonly number[] }) {
  const points = sparklinePoints(values, WIDTH, HEIGHT);
  return (
    <svg
      role="img"
      aria-label="Words per minute, second by second"
      width="100%"
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      className="mt-3"
    >
      {points && (
        <polyline
          points={points}
          fill="none"
          className="stroke-accent"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}
