import { getAxisMax, summarizeSamples, WpmSample } from "../utils/wpmSamples";

interface WpmChartProps {
  samples: readonly WpmSample[];
}

const WIDTH = 640;
const HEIGHT = 160;
const PAD = { top: 12, right: 12, bottom: 22, left: 34 };
const GRIDLINES = 3;
const MIN_SAMPLES = 2;

const WPM_COLOR = "#FFD523";
const ERROR_COLOR = "#f87171"; // red-400
const RAW_COLOR = "#64748b"; // slate-500
const SURFACE = "#0f172a";

const plotWidth = WIDTH - PAD.left - PAD.right;
const plotHeight = HEIGHT - PAD.top - PAD.bottom;

/** WPM (solid yellow) and raw WPM (gray) per second; red dots mark seconds with mistakes. */
export default function WpmChart({ samples }: WpmChartProps) {
  if (samples.length < MIN_SAMPLES) return null;

  const max = getAxisMax(samples);
  const firstSecond = samples[0].second;
  const span = Math.max(1, samples[samples.length - 1].second - firstSecond);
  const x = (second: number) => PAD.left + ((second - firstSecond) / span) * plotWidth;
  const y = (value: number) => PAD.top + plotHeight - (value / max) * plotHeight;
  const line = (pick: (s: WpmSample) => number) => samples.map((s) => `${x(s.second)},${y(pick(s))}`).join(" ");
  const summary = summarizeSamples(samples);

  return (
    <figure className="w-full">
      <figcaption className="flex items-center gap-4 text-xs text-slate-400 mb-1">
        <span className="uppercase tracking-widest">WPM per second</span>
        <span className="flex items-center gap-1"><i className="inline-block h-0.5 w-4 bg-[#FFD523]" aria-hidden="true" /> WPM</span>
        <span className="flex items-center gap-1"><i className="inline-block h-0.5 w-4 bg-slate-500" aria-hidden="true" /> Raw</span>
        <span className="flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-full bg-red-400" aria-hidden="true" /> Mistakes</span>
      </figcaption>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={summary} className="w-full h-[160px]">
        <title>{summary}</title>
        {Array.from({ length: GRIDLINES }, (_, i) => {
          const value = (max / GRIDLINES) * (i + 1);
          return (
            <g key={value}>
              <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(value)} y2={y(value)} stroke="#ffffff" strokeOpacity={0.08} />
              <text x={PAD.left - 6} y={y(value) + 4} textAnchor="end" fontSize={11} fill="#94a3b8">{Math.round(value)}</text>
            </g>
          );
        })}
        <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(0)} y2={y(0)} stroke="#ffffff" strokeOpacity={0.2} />
        <text x={PAD.left} y={HEIGHT - 6} fontSize={11} fill="#94a3b8">{firstSecond}s</text>
        <text x={WIDTH - PAD.right} y={HEIGHT - 6} textAnchor="end" fontSize={11} fill="#94a3b8">{samples[samples.length - 1].second}s</text>
        <polyline points={line((s) => s.rawWpm)} fill="none" stroke={RAW_COLOR} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={line((s) => s.wpm)} fill="none" stroke={WPM_COLOR} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {samples.filter((s) => s.errors > 0).map((s) => (
          <circle key={s.second} cx={x(s.second)} cy={y(s.wpm)} r={4} fill={ERROR_COLOR} stroke={SURFACE} strokeWidth={2} />
        ))}
      </svg>
    </figure>
  );
}
