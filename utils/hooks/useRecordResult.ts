import { useEffect, useRef, useState } from "react";
import type { TestStats } from "../calculateStats";
import {
  appendEntry, createHistoryEntry, getPersonalBest, loadHistory, saveHistory, type TestConfigKey,
} from "../history";
import type { KeystrokeTiming } from "./useKeystrokeTiming";

interface RecordResultArgs {
  isFinished: boolean;
  /** False for a too-short or implausibly fast run (see `getInvalidReason`): shown, never saved. */
  isValid: boolean;
  /** A new value means a new test (same semantics as `usePostResultOnFinish`). */
  roundId: number;
  stats: TestStats;
  config: TestConfigKey;
  /** Keystroke timing to store with the entry; read once, when the run is saved. */
  getKeyTiming?: () => KeystrokeTiming;
}

/**
 * Appends the finished test (with keystroke timing, when given) to the stored history exactly
 * once per round, valid runs only.
 * Returns the personal best from *before* this run (`null` = first run), or
 * `undefined` while the test is not finished.
 */
export function useRecordResult({ isFinished, isValid, roundId, stats, config, getKeyTiming }: RecordResultArgs): { previousBest: number | null } | undefined {
  const recordedRound = useRef<number | null>(null);
  const [result, setResult] = useState<{ roundId: number; previousBest: number | null }>();
  const { mode, limit, difficulty } = config;

  useEffect(() => {
    if (!isFinished || recordedRound.current === roundId) return;
    recordedRound.current = roundId;
    const key = { mode, limit, difficulty };
    const history = loadHistory();
    setResult({ roundId, previousBest: getPersonalBest(history, key) });
    if (!isValid) return;
    const { keySpacing, keyDuration } = getKeyTiming?.() ?? { keySpacing: null, keyDuration: null };
    const entry = {
      ...createHistoryEntry(key, stats),
      ...(keySpacing && { keySpacing }),
      ...(keyDuration && { keyDuration }),
    };
    saveHistory(appendEntry(history, entry));
  }, [isFinished, isValid, roundId, stats, mode, limit, difficulty, getKeyTiming]);

  if (!isFinished || result?.roundId !== roundId) return undefined;
  return { previousBest: result.previousBest };
}
