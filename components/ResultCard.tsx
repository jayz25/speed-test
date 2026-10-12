"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isPlausibleWpm, MAX_PLAUSIBLE_WPM, type TestStats } from "../utils/calculateStats";
import { getGrade } from "../utils/getGrade";
import { describePb, formatConfig, type TestConfigKey } from "../utils/history";
import { formatResultText } from "../utils/shareText";
import type { WpmSample } from "../utils/wpmSamples";
import { ArrowRightIcon, RotateCcwIcon } from "./icons";
import WpmChart from "./WpmChart";

const BUTTON_BASE =
  "flex min-h-[48px] items-center gap-2.5 rounded-xl px-5 text-[15px] font-semibold transition-colors duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent";
const LABEL = "text-xs font-semibold uppercase tracking-[0.08em] text-muted";
const TILE = "flex flex-col gap-1 rounded-[14px] bg-surface-muted px-[18px] py-4";

const COPY_FEEDBACK_MS = 1500;
type CopyStatus = "idle" | "copied" | "failed";

/** "30 seconds · mixed · punctuation · numbers" / "25 words · hard" / "quote · medium". */
export function formatSummary(config: TestConfigKey, options: { punctuation: boolean; numbers: boolean }): string {
  if (config.mode === "quote") return formatConfig(config);
  const length = config.mode === "time" ? `${config.limit} seconds` : `${config.limit} words`;
  return [length, config.difficulty, options.punctuation && "punctuation", options.numbers && "numbers"]
    .filter(Boolean)
    .join(" \u00b7 ");
}

interface ResultCardProps {
  stats: TestStats;
  /** Per-second samples for the chart; omit or pass fewer than 2 to hide it. */
  samples?: readonly WpmSample[];
  /** Best WPM for this config before this run (`null` = first run); omit while unknown. */
  personalBest?: { previousBest: number | null };
  /** Configured test length in seconds. */
  durationSeconds: number;
  /** Mode / limit / difficulty of this test (used in the copied text). */
  config: TestConfigKey;
  /** Attribution of the quote that was typed (quote mode only). */
  source?: string | null;
  /** Punctuation / numbers toggles that were on for this test (shown in the summary). */
  options: { punctuation: boolean; numbers: boolean };
  onReset: () => void;
  /** Restart with the same words. */
  onRepeat: () => void;
}

export default function ResultCard({ stats, samples = [], personalBest, durationSeconds, config, source, options, onReset, onRepeat }: ResultCardProps) {
  const { wpm, rawWpm, cpm, accuracy, correctChars, incorrectChars, extraChars, missedChars } = stats;
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current); }, []);

  const handleCopy = useCallback(async () => {
    let status: CopyStatus = "copied";
    try {
      await navigator.clipboard.writeText(formatResultText({ wpm, accuracy }, config));
    } catch {
      status = "failed"; // surfaced to the user below, not swallowed
    }
    setCopyStatus(status);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyStatus("idle"), COPY_FEEDBACK_MS);
  }, [wpm, accuracy, config]);

  // Fixed: event listener was never cleaned up; now properly removed on unmount
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape") onReset();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onReset]);

  const grade = getGrade(wpm, accuracy);
  const isPlausible = isPlausibleWpm(wpm);
  const pb = isPlausible && personalBest ? describePb(wpm, personalBest.previousBest) : null;

  return (
    <div className="flex flex-col gap-7 motion-safe:animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-wrap items-end gap-10">
          <div className="flex flex-col gap-1">
            <span className={LABEL}>Words / min</span>
            <span className="break-all text-[112px] font-extrabold leading-[0.9] tracking-tighter text-ink">{wpm}</span>
          </div>
          <div className="flex flex-col gap-1 pb-1.5">
            <span className={LABEL}>Accuracy</span>
            <span className="text-[48px] font-bold leading-none tracking-[-0.03em] text-ink">
              {accuracy}
              <span className="text-[24px]">%</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col items-start gap-1.5 pb-2 sm:items-end">
          {!isPlausible && (
            <p className="rounded-full bg-surface-muted px-3 py-1 text-sm font-semibold text-ink-2">
              Not saved: over {MAX_PLAUSIBLE_WPM} WPM
            </p>
          )}
          {pb && (
            <p className={`rounded-full px-3 py-1 text-sm font-semibold ${pb.isNew ? "bg-ink text-on-ink" : "bg-surface-muted text-ink-2"}`}>
              {pb.label}
            </p>
          )}
          <span className="text-sm text-muted">{formatSummary(config, options)}</span>
          {config.mode === "quote" && source && <span className="text-sm text-muted">{`\u2014 ${source}`}</span>}
          <span className="text-sm text-muted">
            Raw {rawWpm} WPM · {durationSeconds}s · Grade <span className="font-semibold text-ink">{grade}</span>
          </span>
        </div>
      </div>

      <WpmChart samples={samples} />

      <dl className="grid grid-cols-[repeat(auto-fit,minmax(min(140px,100%),1fr))] gap-3">
        <Tile label="CPM" value={cpm} />
        <Tile label="Correct" value={correctChars} />
        <Tile label="Wrong" value={incorrectChars} valueClass="text-error" />
        <Tile label="Extra" value={extraChars} />
        <Tile label="Missed" value={missedChars} />
      </dl>

      <div className="flex flex-wrap items-center gap-3 border-t border-divider pt-5">
        <button type="button" onClick={onReset} className={`${BUTTON_BASE} bg-ink text-on-ink hover:bg-ink-2`}>
          Next test
          <ArrowRightIcon />
        </button>
        <button type="button" onClick={onRepeat} className={`${BUTTON_BASE} border border-border bg-surface text-ink hover:bg-surface-muted`}>
          <RotateCcwIcon />
          {config.mode === "quote" ? "Repeat same quote" : "Repeat same words"}
        </button>
        <button type="button" onClick={handleCopy} className={`${BUTTON_BASE} border border-border bg-surface text-ink hover:bg-surface-muted`}>
          {copyStatus === "copied" ? "Copied!" : copyStatus === "failed" ? "Couldn't copy" : "Copy result"}
        </button>
        <span role="status" className="sr-only">
          {copyStatus === "copied" ? "Result copied to clipboard" : copyStatus === "failed" ? "Couldn't copy the result" : ""}
        </span>
      </div>
    </div>
  );
}

function Tile({ label, value, valueClass = "text-ink" }: { label: string; value: number; valueClass?: string }) {
  return (
    <div className={TILE}>
      <dt className={LABEL}>{label}</dt>
      <dd className={`break-all text-[26px] font-bold tabular-nums ${valueClass}`}>{value}</dd>
    </div>
  );
}
