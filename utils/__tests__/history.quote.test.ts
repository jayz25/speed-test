import {
  formatConfig, getPersonalBest, getPersonalBests, isHistoryEntry, loadHistory, quoteLimit, saveHistory, type HistoryEntry,
} from "../history";

const entry = (o: Partial<HistoryEntry> = {}): HistoryEntry => ({
  id: "x", date: "2026-01-01T00:00:00.000Z", mode: "time", limit: 30, difficulty: "mixed",
  wpm: 50, rawWpm: 55, accuracy: 95, ...o,
});
const quoteEntry = (o: Partial<HistoryEntry> = {}) => entry({ mode: "quote", limit: quoteLimit("medium"), ...o });

describe("quote runs in history", () => {
  beforeEach(() => localStorage.clear());

  it("maps each length tier to a distinct 1-3 limit", () => {
    expect([quoteLimit("short"), quoteLimit("medium"), quoteLimit("long")]).toEqual([1, 2, 3]);
  });

  it("formats quote configs readably", () => {
    expect(formatConfig({ mode: "quote", limit: 1, difficulty: "mixed" })).toBe("quote · short");
    expect(formatConfig({ mode: "quote", limit: 2, difficulty: "mixed" })).toBe("quote · medium");
    expect(formatConfig({ mode: "quote", limit: 3, difficulty: "mixed" })).toBe("quote · long");
    expect(formatConfig({ mode: "quote", limit: 9, difficulty: "mixed" })).toBe("quote · 9");
  });

  it("still formats time and words configs", () => {
    expect(formatConfig({ mode: "time", limit: 30, difficulty: "mixed" })).toBe("30s mixed");
    expect(formatConfig({ mode: "words", limit: 25, difficulty: "hard" })).toBe("25 words hard");
  });

  it("validates quote entries and still loads old entries alongside them", () => {
    expect(isHistoryEntry(quoteEntry())).toBe(true);
    saveHistory([entry({ id: "old" }), quoteEntry({ id: "q" })]);
    expect(loadHistory().map((e) => e.id)).toEqual(["old", "q"]);
  });

  it("keeps personal bests per length tier, after time and words rows", () => {
    const history = [
      quoteEntry({ wpm: 60 }), quoteEntry({ wpm: 80 }), quoteEntry({ limit: quoteLimit("short"), wpm: 90 }),
      entry({ mode: "words", limit: 10, wpm: 70 }), entry({ wpm: 50 }),
    ];
    expect(getPersonalBest(history, { mode: "quote", limit: 2, difficulty: "mixed" })).toBe(80);
    expect(getPersonalBest(history, { mode: "quote", limit: 3, difficulty: "mixed" })).toBeNull();
    expect(getPersonalBests(history).map((r) => [r.mode, r.limit, r.wpm])).toEqual([
      ["time", 30, 50], ["words", 10, 70], ["quote", 1, 90], ["quote", 2, 80],
    ]);
  });
});
