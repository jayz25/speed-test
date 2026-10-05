import {
  appendEntry, clearHistory, createHistoryEntry, describePb, formatConfig, getAverages, getPersonalBest, getPersonalBests, getRecent, isHistoryEntry,
  loadHistory, MAX_HISTORY_ENTRIES, saveHistory, type HistoryEntry,
} from "../history";
import { HISTORY_KEY } from "../storage";

const entry = (o: Partial<HistoryEntry> = {}): HistoryEntry => ({
  id: "x", date: "2026-01-01T00:00:00.000Z", mode: "time", limit: 30, difficulty: "mixed",
  wpm: 50, rawWpm: 55, accuracy: 95, ...o,
});

describe("history", () => {
  beforeEach(() => localStorage.clear());

  it("uses the documented key and round-trips entries", () => {
    expect(HISTORY_KEY).toBe("speedtype:v1:history");
    saveHistory([entry({ id: "a" }), entry({ id: "b" })]);
    expect(loadHistory().map((e) => e.id)).toEqual(["a", "b"]);
  });

  it("drops invalid entries and tolerates garbage", () => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify([entry(), { id: 1 }, null, entry({ id: "ok" })]));
    expect(loadHistory().map((e) => e.id)).toEqual(["x", "ok"]);
    localStorage.setItem(HISTORY_KEY, "{oops");
    expect(loadHistory()).toEqual([]);
    localStorage.setItem(HISTORY_KEY, '"str"');
    expect(loadHistory()).toEqual([]);
  });

  it("validates entry fields", () => {
    expect(isHistoryEntry(entry())).toBe(true);
    expect(isHistoryEntry({ ...entry(), mode: "zen" })).toBe(false);
    expect(isHistoryEntry({ ...entry(), difficulty: "extreme" })).toBe(false);
    expect(isHistoryEntry({ ...entry(), wpm: "50" })).toBe(false);
    expect(isHistoryEntry(undefined)).toBe(false);
  });

  it("keeps only the newest 100 entries without mutating the input", () => {
    const history = Array.from({ length: MAX_HISTORY_ENTRIES }, (_, i) => entry({ id: String(i) }));
    const next = appendEntry(history, entry({ id: "new" }));
    expect(next).toHaveLength(MAX_HISTORY_ENTRIES);
    expect(next[0].id).toBe("1");
    expect(next[next.length - 1].id).toBe("new");
    expect(history).toHaveLength(MAX_HISTORY_ENTRIES);
    expect(history[0].id).toBe("0");
  });

  it("clearHistory empties storage", () => {
    saveHistory([entry()]);
    clearHistory();
    expect(loadHistory()).toEqual([]);
  });
});

describe("getPersonalBest", () => {
  const history = [
    entry({ wpm: 40 }), entry({ wpm: 70 }),
    entry({ wpm: 99, limit: 60 }), entry({ wpm: 98, difficulty: "easy" }), entry({ wpm: 97, mode: "words" }),
  ];
  it("is the max wpm for the same mode+limit+difficulty", () => {
    expect(getPersonalBest(history, { mode: "time", limit: 30, difficulty: "mixed" })).toBe(70);
  });
  it("is null with no matching runs", () => {
    expect(getPersonalBest(history, { mode: "words", limit: 10, difficulty: "mixed" })).toBeNull();
    expect(getPersonalBest([], { mode: "time", limit: 30, difficulty: "mixed" })).toBeNull();
  });
});

describe("describePb", () => {
  it("flags a first run and a beaten record as new", () => {
    expect(describePb(30, null)).toEqual({ isNew: true, label: "New personal best!" });
    expect(describePb(71, 70).isNew).toBe(true);
  });
  it("shows the gap to the old record otherwise", () => {
    expect(describePb(67, 70)).toEqual({ isNew: false, label: "PB: 70 wpm (−3)" });
    expect(describePb(70, 70)).toEqual({ isNew: false, label: "PB: 70 wpm (+0)" });
  });
});

describe("createHistoryEntry", () => {
  it("builds a valid entry with an ISO date", () => {
    const e = createHistoryEntry({ mode: "words", limit: 25, difficulty: "hard" }, { wpm: 61, rawWpm: 66, accuracy: 96 }, new Date("2026-02-03T04:05:06.000Z"));
    expect(isHistoryEntry(e)).toBe(true);
    expect(e.date).toBe("2026-02-03T04:05:06.000Z");
    expect(e).toMatchObject({ mode: "words", limit: 25, difficulty: "hard", wpm: 61 });
  });
});

describe("stats helpers", () => {
  const h = [
    entry({ id: "1", wpm: 40, accuracy: 90 }),
    entry({ id: "2", wpm: 60, accuracy: 96 }),
    entry({ id: "3", wpm: 30, accuracy: 99, mode: "words", limit: 25 }),
    entry({ id: "4", wpm: 50, accuracy: 94, limit: 15 }),
  ];

  it("formatConfig", () => {
    expect(formatConfig({ mode: "time", limit: 30, difficulty: "mixed" })).toBe("30s mixed");
    expect(formatConfig({ mode: "words", limit: 25, difficulty: "hard" })).toBe("25 words hard");
  });

  it("getPersonalBests groups by config, keeps the best run, and sorts", () => {
    const rows = getPersonalBests(h);
    expect(rows.map((r) => `${r.mode}:${r.limit}`)).toEqual(["time:15", "time:30", "words:25"]);
    expect(rows[1]).toMatchObject({ wpm: 60, accuracy: 96, runs: 2 });
  });

  it("getAverages rounds and handles empty", () => {
    expect(getAverages(h)).toEqual({ wpm: 45, accuracy: 95 });
    expect(getAverages([])).toEqual({ wpm: 0, accuracy: 0 });
  });

  it("getRecent returns newest first, capped", () => {
    expect(getRecent(h, 2).map((e) => e.id)).toEqual(["4", "3"]);
    expect(getRecent(h, 20)).toHaveLength(4);
  });
});
