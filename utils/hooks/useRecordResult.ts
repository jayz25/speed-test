import { useEffect, useRef, useState } from "react";
import type { TestStats } from "../calculateStats";
import {
  appendEntry, createHistoryEntry, getPersonalBest, loadHistory, saveHistory, type TestConfigKey,
} from "../history";

interface RecordResultArgs {
  isFinished: boolean;
  /** A new value means a new test (same semantics as `usePostResultOnFinish`). */
  roundId: number;
  stats: TestStats;
  config: TestConfigKey;
}

/**
 * Appends the finished test to the stored history exactly once per round.
 * Returns the personal best from *before* this run (`null` = first run), or
 * `undefined` while the test is not finished.
 */
export function useRecordResult({ isFinished, roundId, stats, config }: RecordResultArgs): { previousBest: number | null } | undefined {
  const recordedRound = useRef<number | null>(null);
  const [result, setResult] = useState<{ roundId: number; previousBest: number | null }>();
  const { mode, limit, difficulty } = config;

  useEffect(() => {
    if (!isFinished || recordedRound.current === roundId) return;
    recordedRound.current = roundId;
    const key = { mode, limit, difficulty };
    const history = loadHistory();
    setResult({ roundId, previousBest: getPersonalBest(history, key) });
    saveHistory(appendEntry(history, createHistoryEntry(key, stats)));
  }, [isFinished, roundId, stats, mode, limit, difficulty]);

  if (!isFinished || result?.roundId !== roundId) return undefined;
  return { previousBest: result.previousBest };
}
