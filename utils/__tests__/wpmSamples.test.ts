import { createEngineState, engineReducer, type EngineAction } from "../typingEngine";
import { appendSample, EMPTY_SAMPLER, getAxisMax, makeSample, summarizeSamples, type WpmSample } from "../wpmSamples";

const type = (text: string): EngineAction[] => Array.from(text, (char) => ({ type: "typeChar", char }));
const state = (...a: EngineAction[]) => a.reduce(engineReducer, createEngineState(["hello", "world"]));
const sample = (o: Partial<WpmSample>): WpmSample => ({ second: 1, wpm: 0, rawWpm: 0, errors: 0, ...o });

describe("makeSample", () => {
  it("computes cumulative wpm at the given second", () => {
    const s = state(...type("hello"), { type: "submitWord" }, ...type("world"), { type: "submitWord" });
    // 10 chars + 1 counted space = 11 chars / 5 = 2.2 words in 1/6 min => 13 wpm
    const out = makeSample(s, 10, 0);
    expect(out.second).toBe(10);
    expect(out.wpm).toBe(13);
    expect(out.rawWpm).toBe(14);
  });
  it("counts errors since the previous sample", () => {
    const s = state(...type("hxllx"));
    expect(makeSample(s, 1, 0).errors).toBe(2);
    expect(makeSample(s, 2, 2).errors).toBe(0);
    expect(makeSample(s, 2, 5).errors).toBe(0);
  });
});

describe("getAxisMax", () => {
  it("rounds the highest raw wpm up to a multiple of 10", () => {
    expect(getAxisMax([sample({ rawWpm: 41 }), sample({ rawWpm: 63, wpm: 55 })])).toBe(70);
    expect(getAxisMax([sample({ rawWpm: 60 })])).toBe(60);
  });
  it("has a floor of 10", () => {
    expect(getAxisMax([])).toBe(10);
    expect(getAxisMax([sample({})])).toBe(10);
  });
});

describe("summarizeSamples", () => {
  it("handles no data", () => {
    expect(summarizeSamples([])).toMatch(/no speed data/i);
  });
  it("describes the run", () => {
    const text = summarizeSamples([sample({ second: 1, wpm: 30, errors: 1 }), sample({ second: 2, wpm: 50, rawWpm: 55 })]);
    expect(text).toContain("over 2 seconds");
    expect(text).toContain("ended at 50 WPM");
    expect(text).toContain("peaked at 50 WPM");
    expect(text).toContain("1 of 2 seconds");
  });
});

describe("appendSample", () => {
  it("appends a sample and remembers the incorrect count", () => {
    const s = state(...type("hx"));
    const next = appendSample(EMPTY_SAMPLER, s, 1);
    expect(next.samples).toHaveLength(1);
    expect(next.samples[0]).toMatchObject({ second: 1, errors: 1 });
    expect(next.incorrectAtLast).toBe(1);
  });
  it("returns the same object when a sample at or after that second exists", () => {
    const s = state(...type("he"));
    const once = appendSample(EMPTY_SAMPLER, s, 2);
    expect(appendSample(once, s, 2)).toBe(once);
    expect(appendSample(once, s, 1)).toBe(once);
  });
  it("counts only errors made since the previous sample", () => {
    const first = appendSample(EMPTY_SAMPLER, state(...type("hx")), 1);
    const second = appendSample(first, state(...type("hxxx")), 2);
    expect(second.samples[1].errors).toBe(2);
  });
});
