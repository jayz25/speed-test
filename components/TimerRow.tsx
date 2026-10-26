import { useState } from "react";

interface TimerRowProps {
  label: string;
  /** Fill of the track, 0..1. */
  progress: number;
  goal: string;
  /** True when progress advances on a steady clock (time mode): glide over a full second. */
  isContinuous?: boolean;
}

const TimerRow = ({ label, progress, goal, isContinuous = false }: TimerRowProps) => {
  const clamped = Math.min(1, Math.max(0, progress));
  // A restart moves the bar backwards: snap instead of animating the rewind
  const [previous, setPrevious] = useState(clamped);
  if (previous !== clamped) setPrevious(clamped);
  const isRewind = clamped < previous;
  const glide = isContinuous ? "duration-1000 ease-linear" : "duration-200 ease-out";
  return (
    <div className="flex items-center gap-4 font-mono">
      <span className="min-w-[72px] text-[28px] font-semibold text-ink">{label}</span>
      <div aria-hidden="true" className="h-2 flex-1 overflow-hidden rounded-sm bg-divider">
        <div
          className={`h-full origin-left rounded-sm bg-accent motion-reduce:transition-none ${isRewind ? "transition-none" : `transition-transform ${glide}`}`}
          style={{ transform: `scaleX(${clamped})` }}
        />
      </div>
      <span className="text-sm text-muted">{goal}</span>
    </div>
  );
};

export default TimerRow;
