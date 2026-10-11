import { summarizeSamples, WpmSample } from "../utils/wpmSamples";

interface WpmChartProps {
  samples: readonly WpmSample[];
}

const WIDTH = 600;
const HEIGHT = 160;
const PAD_BOTTOM = 4;
const PAD_TOP = 8;
const MIN_SAMPLES = 2;
const MIN_AXIS_MAX = 40;

const LABEL = "text-xs font-semibold uppercase tracking-[0.08em] text-muted";
const MONO = "font-mono text-xs text-muted";

/** WPM per second as an accent line over a soft area fill. */
export default function WpmChart({ samples }: WpmChartProps) {
  if (samples.length < MIN_SAMPLES) return null;

  const max = Math.max(MIN_AXIS_MAX, ...samples.map((s) => s.wpm));
  const last = samples.length - 1;
  const line = samples
    .map((s, i) => `${(i * WIDTH) / last},${HEIGHT - PAD_BOTTOM - (s.wpm / max) * (HEIGHT - PAD_BOTTOM - PAD_TOP)}`)
    .join(" ");
  const area = `${line} ${WIDTH},${HEIGHT} 0,${HEIGHT}`;

  return (
    <figure className="m-0 flex flex-col gap-2">
      <figcaption className={LABEL}>Speed over the test</figcaption>
      <div className="flex items-stretch gap-3">
        <div aria-hidden="true" className={`${MONO} flex min-w-7 flex-col justify-between text-right`}>
          <span>{max}</span>
          <span>0</span>
        </div>
        <svg
          role="img"
          aria-label={summarizeSamples(samples)}
          width="100%"
          height={HEIGHT}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="block flex-1 rounded-xl bg-surface-muted"
        >
          <polygon points={area} className="fill-accent-soft" />
          <polyline
            points={line}
            fill="none"
            className="stroke-accent"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <div aria-hidden="true" className={`${MONO} flex justify-between pl-10`}>
        <span>0s</span>
        <span>{samples[last].second}s</span>
      </div>
    </figure>
  );
}
