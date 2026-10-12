import type { EngineState } from "./typingEngine";

export interface TestStats {
  /** net: (chars of correct words + 1 space per correct word except the last) / 5 / minutes */
  wpm: number;
  /** all typed chars incl. spaces, incorrect and extra / 5 / minutes */
  rawWpm: number;
  /** net chars / minutes */
  cpm: number;
  /** correctKeystrokes / (correct + incorrect) * 100, rounded; 100 if no keystrokes */
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
}

const CHARS_PER_WORD = 5;
const MS_PER_MINUTE = 60_000;

const EMPTY_STATS: TestStats = {
  wpm: 0,
  rawWpm: 0,
  cpm: 0,
  accuracy: 100,
  correctChars: 0,
  incorrectChars: 0,
  extraChars: 0,
  missedChars: 0,
};

/** Faster than any human has sustained; above it a result is treated as injected text, not typing. */
export const MAX_PLAUSIBLE_WPM = 300;

export function isPlausibleWpm(wpm: number): boolean {
  return wpm <= MAX_PLAUSIBLE_WPM;
}

export function calculateAccuracy(state: EngineState): number {
  const total = state.correctKeystrokes + state.incorrectKeystrokes;
  if (total === 0) return 100;
  return Math.round((state.correctKeystrokes / total) * 100);
}

export function calculateStats(state: EngineState, elapsedMs: number): TestStats {
  let correctChars = 0;
  let incorrectChars = 0;
  let extraChars = 0;
  let missedChars = 0;
  let typedChars = 0;
  let netChars = 0;
  let correctWords = 0;

  state.typed.forEach((typed, i) => {
    const target = state.words[i] ?? "";
    const isSubmitted = i < state.activeWordIndex;
    typedChars += typed.length;
    for (let c = 0; c < typed.length; c++) {
      if (c >= target.length) extraChars += 1;
      else if (typed[c] === target[c]) correctChars += 1;
      else incorrectChars += 1;
    }
    if (!isSubmitted) return;
    missedChars += Math.max(0, target.length - typed.length);
    if (typed === target) {
      correctWords += 1;
      netChars += target.length;
    }
  });

  const accuracy = calculateAccuracy(state);
  const countedSpaces = Math.max(0, correctWords - 1);
  const submittedSpaces = state.activeWordIndex;
  const letters = { correctChars, incorrectChars, extraChars, missedChars };

  if (elapsedMs <= 0) return { ...EMPTY_STATS, accuracy, ...letters };

  const minutes = elapsedMs / MS_PER_MINUTE;
  return {
    wpm: Math.round((netChars + countedSpaces) / CHARS_PER_WORD / minutes),
    rawWpm: Math.round((typedChars + submittedSpaces) / CHARS_PER_WORD / minutes),
    cpm: Math.round((netChars + countedSpaces) / minutes),
    accuracy,
    ...letters,
  };
}
