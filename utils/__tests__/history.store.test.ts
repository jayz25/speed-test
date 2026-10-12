import { clearHistory, getHistorySnapshot, saveHistory, subscribeHistory, type HistoryEntry } from "../history";
import { HISTORY_KEY } from "../storage";

const entry = (id: string): HistoryEntry => ({
  id, date: "2026-01-01T10:00:00.000Z", mode: "time", limit: 30, difficulty: "mixed", wpm: 50, rawWpm: 55, accuracy: 95,
});

describe("history store", () => {
  beforeEach(() => localStorage.clear());

  it("returns the same snapshot while storage is unchanged", () => {
    saveHistory([entry("a")]);
    const first = getHistorySnapshot();
    expect(first.map((e) => e.id)).toEqual(["a"]);
    expect(getHistorySnapshot()).toBe(first);
  });

  it("returns a new snapshot after a save or clear", () => {
    saveHistory([entry("a")]);
    const first = getHistorySnapshot();
    saveHistory([entry("a"), entry("b")]);
    expect(getHistorySnapshot().map((e) => e.id)).toEqual(["a", "b"]);
    clearHistory();
    expect(getHistorySnapshot()).toEqual([]);
    expect(getHistorySnapshot()).not.toBe(first);
  });

  it("notifies subscribers on save, clear and cross-tab storage events", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeHistory(listener);
    saveHistory([entry("a")]);
    clearHistory();
    window.dispatchEvent(new StorageEvent("storage", { key: "unrelated" }));
    window.dispatchEvent(new StorageEvent("storage", { key: HISTORY_KEY }));
    expect(listener).toHaveBeenCalledTimes(3);
    unsubscribe();
    saveHistory([entry("b")]);
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it("falls back to an empty list when storage is unreadable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    expect(getHistorySnapshot()).toEqual([]);
    vi.restoreAllMocks();
  });
});

describe("history validation", () => {
  it("accepts optional keystroke timing and drops malformed timing", () => {
    const timed = { ...entry("timed"), keySpacing: { average: 110, sd: 12 }, keyDuration: { average: 80, sd: 9 } };
    const broken = { ...entry("broken"), keySpacing: { average: "fast" } };
    localStorage.setItem(HISTORY_KEY, JSON.stringify([entry("plain"), timed, broken]));
    expect(getHistorySnapshot().map((e) => e.id)).toEqual(["plain", "timed"]);
  });

  it("drops stored entries faster than humanly possible", () => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify([entry("ok"), { ...entry("junk"), wpm: 6180000 }]));
    expect(getHistorySnapshot().map((e) => e.id)).toEqual(["ok"]);
  });
});
