"use client";

import { useEffect } from "react";
import type { TestStats } from "../utils/calculateStats";
import type { WpmSample } from "../utils/wpmSamples";
import RenderStat from "./RenderStat";
import WpmChart from "./WpmChart";

const BUTTON_BASE =
  "flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD523]";

interface ResultCardProps {
  stats: TestStats;
  /** Per-second samples for the chart; omit or pass fewer than 2 to hide it. */
  samples?: readonly WpmSample[];
  /** Configured test length in seconds. */
  durationSeconds: number;
  onReset: () => void;
  /** Restart with the same words. */
  onRepeat: () => void;
}

export default function ResultCard({ stats, samples = [], durationSeconds, onReset, onRepeat }: ResultCardProps) {
  const { wpm, rawWpm, cpm, accuracy, correctChars, incorrectChars, extraChars, missedChars } = stats;
  // Fixed: event listener was never cleaned up; now properly removed on unmount
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape") onReset();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onReset]);

  const grade = accuracy >= 95 ? "S" : accuracy >= 85 ? "A" : accuracy >= 70 ? "B" : accuracy >= 50 ? "C" : "D";
  const gradeColor = grade === "S" ? "text-[#FFD523]" : grade === "A" ? "text-green-400" : grade === "B" ? "text-blue-400" : "text-slate-400";

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl motion-safe:animate-fade-in">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-1">Test Complete</h2>
        <p className="text-slate-500 text-sm">Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs">Enter</kbd> to restart</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Headline stats */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
          <StatBox label="WPM" value={wpm} color="text-[#FFD523]" subtitle="words/min" />
          <StatBox label="Accuracy" value={accuracy} unit="%" color="text-green-400" subtitle="correct keystrokes" />
        </div>

        {/* Details */}
        <dl className="grid grid-cols-2 gap-3 rounded-2xl bg-white/5 border border-white/10 p-6 content-center">
          <Detail label="Raw WPM" value={rawWpm} />
          <Detail label="CPM" value={cpm} />
          <Detail label="Correct" value={correctChars} />
          <Detail label="Incorrect" value={incorrectChars} />
          <Detail label="Extra" value={extraChars} />
          <Detail label="Missed" value={missedChars} />
          <Detail label="Duration" value={`${durationSeconds}s`} />
        </dl>
      </div>

      <WpmChart samples={samples} />

      {/* Grade */}
      <div className="flex flex-col items-center gap-3 my-2">
        <span className="text-sm font-semibold uppercase tracking-widest text-[#FFD523]/70 bg-[#FFD523]/10 px-3 py-1 rounded-full">Typing Grade</span>
        <div className={`text-[96px] md:text-[120px] font-black ${gradeColor} leading-none drop-shadow-2xl`}>{grade}</div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onReset}
          className={`${BUTTON_BASE} bg-[#FFD523] text-black hover:bg-yellow-300`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Next test
        </button>
        <button
          type="button"
          onClick={onRepeat}
          className={`${BUTTON_BASE} bg-white/10 text-slate-100 hover:bg-white/20`}
        >
          Repeat
        </button>
      </div>
    </div>
  );
}

function StatBox({ label, value, unit = "", color, subtitle }: { label: string; value: number; unit?: string; color: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-white/5 border border-white/10 p-6">
      <span className="text-xs uppercase tracking-widest text-slate-500 mb-1">{label}</span>
      <RenderStat targetValue={value} unit={unit} color={color} />
      <span className="text-xs text-slate-400 mt-1">{subtitle}</span>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs uppercase tracking-widest text-slate-400">{label}</dt>
      <dd className="text-xl font-semibold tabular-nums text-slate-100">{value}</dd>
    </div>
  );
}
