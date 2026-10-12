import { renderHook } from "@testing-library/react";
import { useRecordResult } from "../useRecordResult";
import { loadHistory } from "../../history";
import type { TestStats } from "../../calculateStats";

const stats = (wpm: number): TestStats => ({
  wpm, rawWpm: wpm + 5, cpm: wpm * 5, accuracy: 95,
  correctChars: 0, incorrectChars: 0, extraChars: 0, missedChars: 0,
});
const config = { mode: "time", limit: 30, difficulty: "mixed" } as const;
const base = { isFinished: true, roundId: 1, stats: stats(50), config };

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

  it("saves a record-level human burst (319 WPM)", () => {
    renderHook(() => useRecordResult({ ...base, stats: stats(319) }));
    expect(loadHistory()).toHaveLength(1);
  });

  it("does not save an implausible result (e.g. text injected in one event)", () => {
    renderHook(() => useRecordResult({ ...base, stats: stats(5000) }));
    expect(loadHistory()).toHaveLength(0);
  });
});
