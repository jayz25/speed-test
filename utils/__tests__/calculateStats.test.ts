import { calculateStats, isPlausibleWpm, MAX_PLAUSIBLE_WPM } from "../calculateStats";
import { createEngineState, engineReducer, type EngineAction } from "../typingEngine";

const WORDS = ["the", "cat", "sat"];
const type = (text: string): EngineAction[] =>
  Array.from(text, (char) => ({ type: "typeChar", char }));
const SUBMIT: EngineAction = { type: "submitWord" };
const play = (...actions: EngineAction[]) =>
  actions.reduce(engineReducer, createEngineState(WORDS));

describe("calculateStats", () => {
  it("returns zero speeds and 100% accuracy before any input", () => {
    const stats = calculateStats(createEngineState(WORDS), 0);
    expect(stats).toMatchObject({ wpm: 0, rawWpm: 0, cpm: 0, accuracy: 100 });
  });

  it("returns 0 speeds when elapsed time is not positive", () => {
    const s = play(...type("the"), SUBMIT);
    expect(calculateStats(s, 0).wpm).toBe(0);
    expect(calculateStats(s, -5).cpm).toBe(0);
  });

  it("does not report 0% accuracy after the first keystroke", () => {
    expect(calculateStats(play(...type("t")), 1000).accuracy).toBe(100);
  });

  it("computes accuracy from keystrokes", () => {
    expect(calculateStats(play(...type("thx")), 1000).accuracy).toBe(67);
  });

  it("counts net chars with spaces between correct words only", () => {
    // 2 correct words = 6 chars + 1 space = 7 chars in 1 minute
    const s = play(...type("the"), SUBMIT, ...type("cat"), SUBMIT);
    const stats = calculateStats(s, 60_000);
    expect(stats.cpm).toBe(7);
    expect(stats.wpm).toBe(1);
  });

  it("excludes incorrect words from net WPM but includes them in raw WPM", () => {
    const s = play(...type("the"), SUBMIT, ...type("cxt"), SUBMIT);
    const stats = calculateStats(s, 60_000);
    expect(stats.cpm).toBe(3);
    // raw: 6 typed + 2 spaces = 8 chars
    expect(stats.rawWpm).toBe(Math.round(8 / 5));
  });

  it("scales with elapsed time", () => {
    const s = play(...type("the"), SUBMIT, ...type("cat"), SUBMIT, ...type("sat"), SUBMIT);
    // 9 + 2 = 11 chars in 30s => 22 cpm
    expect(calculateStats(s, 30_000).cpm).toBe(22);
  });

  it("classifies correct, incorrect, extra and missed characters", () => {
    const s = play(...type("th"), SUBMIT, ...type("cxtzz"));
    const stats = calculateStats(s, 1000);
    expect(stats.missedChars).toBe(1); // "the" submitted as "th"
    expect(stats.correctChars).toBe(2 + 2); // th + c,t
    expect(stats.incorrectChars).toBe(1); // x
    expect(stats.extraChars).toBe(2); // zz
  });
});

describe("isPlausibleWpm", () => {
  it("accepts human speeds up to the limit and rejects anything faster", () => {
    expect(isPlausibleWpm(0)).toBe(true);
    // Fastest recorded human burst (319 WPM over 15s) must never be rejected
    expect(isPlausibleWpm(319)).toBe(true);
    expect(isPlausibleWpm(MAX_PLAUSIBLE_WPM)).toBe(true);
    expect(isPlausibleWpm(MAX_PLAUSIBLE_WPM + 1)).toBe(false);
  });
});
