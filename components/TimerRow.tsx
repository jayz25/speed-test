interface TimerRowProps {
  label: string;
  /** Fill of the track, 0..1. */
  progress: number;
  goal: string;
}

const TimerRow = ({ label, progress, goal }: TimerRowProps) => {
  const clamped = Math.min(1, Math.max(0, progress));
  return (
    <div className="flex items-center gap-4 font-mono">
      <span className="min-w-[72px] text-[28px] font-semibold text-ink">{label}</span>
      <div aria-hidden="true" className="h-2 flex-1 overflow-hidden rounded bg-divider">
        <div className="h-full rounded bg-accent" style={{ width: `${clamped * 100}%` }} />
      </div>
      <span className="text-sm text-muted">{goal}</span>
    </div>
  );
};

export default TimerRow;
