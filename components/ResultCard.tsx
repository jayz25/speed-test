"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { addStatCall } from "../redux/stat";
import { AppDispatch } from "../types/types";
import RenderStat from "./RenderStat";

interface ResultCardProps {
  wpm: number;
  cpm: number;
  accuracy: number;
  onReset: () => void;
}

export default function ResultCard({ wpm, cpm, accuracy, onReset }: ResultCardProps) {
  const dispatch = useDispatch<AppDispatch>();

  // Fixed: was dispatching at render-time on every render; now runs once on mount
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      dispatch(addStatCall({ words: wpm, chars: cpm, accuracy, user: "" }));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl animate-fade-in">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-1">Test Complete</h2>
        <p className="text-slate-500 text-sm">Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs">Enter</kbd> to restart</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4 w-full">
        <StatBox label="WPM" value={wpm} color="text-[#FFD523]" subtitle="words/min" />
        <StatBox label="CPM" value={cpm} color="text-blue-400" subtitle="chars/min" />
        <StatBox label="Accuracy" value={accuracy} unit="%" color="text-green-400" subtitle="correct words" />
      </div>

      {/* Grade */}
      <div className="flex flex-col items-center gap-3 my-2">
        <span className="text-sm font-semibold uppercase tracking-widest text-[#FFD523]/70 bg-[#FFD523]/10 px-3 py-1 rounded-full">Typing Grade</span>
        <div className={`text-[120px] font-black ${gradeColor} leading-none drop-shadow-2xl`}>{grade}</div>
      </div>

      <button
        onClick={onReset}
        className="flex items-center gap-2 px-6 py-3 bg-[#FFD523] text-black font-semibold rounded-xl hover:bg-yellow-300 transition-colors duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Try Again
      </button>
    </div>
  );
}

function StatBox({ label, value, unit = "", color, subtitle }: { label: string; value: number; unit?: string; color: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-white/5 border border-white/10 p-6">
      <span className="text-xs uppercase tracking-widest text-slate-500 mb-1">{label}</span>
      <RenderStat targetValue={value} unit={unit} color={color} />
      <span className="text-xs text-slate-600 mt-1">{subtitle}</span>
    </div>
  );
}
