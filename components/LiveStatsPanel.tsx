import Sparkline from "./Sparkline";

export interface LiveStats {
  wpm: number;
  cpm: number;
  accuracy: number;
  errors: number;
  words: number;
}

interface LiveStatsPanelProps {
  stats: LiveStats | null;
  series: readonly number[];
}

const EMPTY = "—";
const LABEL = "text-xs font-semibold uppercase tracking-[0.08em]";

function Tile({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-surface-muted px-5 py-[18px]">
      <span className={`${LABEL} text-muted`}>{label}</span>
      <span className={`break-all text-[30px] font-bold tracking-[-0.02em] ${valueClass}`}>{value}</span>
    </div>
  );
}

/** Live typing stats: large WPM tile with sparkline plus accuracy, CPM, errors and words. */
export default function LiveStatsPanel({ stats, series }: LiveStatsPanelProps) {
  const show = (v: number | undefined, suffix = "") => (stats && v !== undefined ? `${v}${suffix}` : EMPTY);
  return (
    <aside aria-label="Live stats" className="grid w-full basis-full gap-3 sm:grid-cols-2 panels:flex panels:w-auto panels:basis-[240px] panels:grow panels:shrink panels:max-w-[280px] panels:flex-col">
      <div className="flex flex-col gap-1.5 rounded-card bg-tile p-6 text-on-tile">
        <span className={`${LABEL} text-on-dark-muted`}>Words / min</span>
        <span aria-live="off" className="break-all text-[88px] leading-none font-extrabold tracking-[-0.04em]">
          {show(stats?.wpm)}
        </span>
        <Sparkline values={series} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Tile label="Accuracy" value={show(stats?.accuracy, "%")} />
        <Tile label="CPM" value={show(stats?.cpm)} />
        <Tile label="Errors" value={show(stats?.errors)} valueClass="text-error" />
        <Tile label="Words" value={show(stats?.words)} />
      </div>
    </aside>
  );
}
