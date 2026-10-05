import { calculateStats } from "./calculateStats";
import type { EngineState } from "./typingEngine";

export interface WpmSample {
  /** whole seconds since the test started */
  second: number;
  wpm: number;
  rawWpm: number;
  /** incorrect keystrokes during this second */
  errors: number;
}

const MS_PER_SECOND = 1000;
const WPM_AXIS_STEP = 10;

/** Cumulative WPM at `second`, plus errors made since `previousIncorrect`. */
export function makeSample(state: EngineState, second: number, previousIncorrect: number): WpmSample {
  const { wpm, rawWpm } = calculateStats(state, second * MS_PER_SECOND);
  return { second, wpm, rawWpm, errors: Math.max(0, state.incorrectKeystrokes - previousIncorrect) };
}

/** Y-axis maximum: highest raw WPM rounded up to a multiple of 10 (at least 10). */
export function getAxisMax(samples: readonly WpmSample[]): number {
  const peak = Math.max(0, ...samples.map((s) => Math.max(s.rawWpm, s.wpm)));
  return Math.max(WPM_AXIS_STEP, Math.ceil(peak / WPM_AXIS_STEP) * WPM_AXIS_STEP);
}

/** Plain-text description of the chart for screen readers. */
export function summarizeSamples(samples: readonly WpmSample[]): string {
  if (samples.length === 0) return "No speed data was recorded for this test.";
  const last = samples[samples.length - 1];
  const peak = Math.max(...samples.map((s) => s.wpm));
  const errorSeconds = samples.filter((s) => s.errors > 0).length;
  return `WPM over ${last.second} seconds: ended at ${last.wpm} WPM, peaked at ${peak} WPM, raw ${last.rawWpm} WPM at the end. Mistakes were made in ${errorSeconds} of ${samples.length} seconds.`;
}
