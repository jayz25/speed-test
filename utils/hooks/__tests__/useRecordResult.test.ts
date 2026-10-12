import { renderHook } from "@testing-library/react";
import { useRecordResult } from "../useRecordResult";
import { loadHistory } from "../../history";
import type { TestStats } from "../../calculateStats";

const stats = (wpm: number): TestStats => ({
  wpm, rawWpm: wpm + 5, cpm: wpm * 5, accuracy: 95,
  correctChars: 0, incorrectChars: 0, extraChars: 0, missedChars: 0,
});
const config = { mode: "time", limit: 30, difficulty: "mixed" } as const;
const base = { isFinished: true, isValid: true, roundId: 1, stats: stats(50), config };

describe("useRecordResult", () => {
  beforeEach(() => localStorage.clear());

  it("does nothing until finished", () => {
    const { result } = renderHook(() => useRecordResult({ ...base, isFinished: false }));
    expect(result.current).toBeUndefined();
    expect(loadHistory()).toHaveLength(0);
  });

  it("records once per round and reports no previous best on the first run", () => {
    const { result, rerender } = renderHook((p) => useRecordResult(p), { initialProps: base });
    rerender({ ...base });
    rerender({ ...base, stats: stats(60) });
    expect(loadHistory()).toHaveLength(1);
    expect(loadHistory()[0]).toMatchObject({ mode: "time", limit: 30, difficulty: "mixed", wpm: 50, rawWpm: 55, accuracy: 95 });
    expect(result.current).toEqual({ previousBest: null });
  });

  it("reports the previous best on later rounds (including a repeat with the same words)", () => {
    const { result, rerender } = renderHook((p) => useRecordResult(p), { initialProps: base });
    rerender({ ...base, isFinished: false });
    expect(result.current).toBeUndefined();
    rerender({ ...base, roundId: 2, stats: stats(40) });
    expect(result.current).toEqual({ previousBest: 50 });
    expect(loadHistory()).toHaveLength(2);
  });

  it("does not save an invalid result (too short or too fast) but still reports the previous best", () => {
    const { result } = renderHook(() => useRecordResult({ ...base, isValid: false }));
    expect(loadHistory()).toHaveLength(0);
    expect(result.current).toEqual({ previousBest: null });
  });

  it("stores keystroke timing with the entry when available", () => {
    const getKeyTiming = () => ({ keySpacing: { average: 110, sd: 12.5 }, keyDuration: null });
    renderHook(() => useRecordResult({ ...base, getKeyTiming }));
    expect(loadHistory()[0]).toMatchObject({ keySpacing: { average: 110, sd: 12.5 } });
    expect(loadHistory()[0]).not.toHaveProperty("keyDuration");
  });
});
