import { applyWordOptions, getWords } from "../getWords";
import { easyWords, hardWords, mediumWords } from "../wordBank";

describe("getWords", () => {
  it("returns exactly `count` words", () => {
    expect(getWords(25, "mixed")).toHaveLength(25);
  });
  it("defaults to 60 words", () => {
    expect(getWords()).toHaveLength(60);
  });
  it.each([
    ["easy", easyWords],
    ["medium", mediumWords],
    ["hard", hardWords],
  ] as const)("draws %s mode only from its own pool", (mode, pool) => {
    const words = getWords(40, mode);
    expect(words.every((w) => pool.includes(w))).toBe(true);
  });
  it("draws mixed mode from the combined pool", () => {
    const all = [...easyWords, ...mediumWords, ...hardWords];
    expect(getWords(100, "mixed").every((w) => all.includes(w))).toBe(true);
  });
  it("cycles through the pool when count exceeds pool size", () => {
    const count = easyWords.length * 2 + 3;
    const words = getWords(count, "easy");
    expect(words).toHaveLength(count);
    expect(words.every((w) => easyWords.includes(w))).toBe(true);
  });
  it("does not mutate the word bank", () => {
    const before = [...easyWords];
    getWords(30, "easy");
    expect(easyWords).toEqual(before);
  });
});

describe("applyWordOptions", () => {
  const seq = (...values: number[]) => {
    let i = 0;
    return () => values[i++ % values.length];
  };
  const BASE = ["alpha", "beta", "gamma"];

  it("returns the words unchanged without options", () => {
    expect(applyWordOptions(BASE, {}, seq(0))).toEqual(BASE);
  });

  it("does nothing when every roll misses", () => {
    expect(applyWordOptions(BASE, { punctuation: true, numbers: true }, seq(0.99))).toEqual(BASE);
  });

  it("replaces ~10% of words with 1-4 digit numbers", () => {
    // rng: number roll hit, digit count roll (0.99 -> 4 digits), value roll 0 -> 1000
    expect(applyWordOptions(["a"], { numbers: true }, seq(0, 0.99, 0))).toEqual(["1000"]);
    expect(applyWordOptions(["a"], { numbers: true }, seq(0, 0, 0.5))).toEqual(["5"]);
    const out = applyWordOptions(Array(2000).fill("w"), { numbers: true }, mulberry(1));
    const numeric = out.filter((w) => /^\d{1,4}$/.test(w));
    expect(numeric.length).toBeGreaterThan(120);
    expect(numeric.length).toBeLessThan(280);
    expect(out.every((w) => w === "w" || /^\d{1,4}$/.test(w))).toBe(true);
  });

  it("appends one of , . ; ! ? to ~20% of words and quotes ~5%", () => {
    // roll punct hit(0), mark index 0.5 -> ";" (index 2), quote miss
    expect(applyWordOptions(["a"], { punctuation: true }, seq(0, 0.5, 0.99))).toEqual(["a;"]);
    // quote hit wraps the punctuated word
    expect(applyWordOptions(["a"], { punctuation: true }, seq(0, 0, 0))).toEqual(['"a,"']);
    // quote only
    expect(applyWordOptions(["a"], { punctuation: true }, seq(0.99, 0))).toEqual(['"a"']);
  });

  it("capitalizes the word after . ! ?", () => {
    // word1: punct hit, mark "." (index 1 -> 0.25), no quote; word2: miss, miss
    const out = applyWordOptions(["one", "two", "three"], { punctuation: true }, seq(0, 0.25, 0.99, 0.99, 0.99, 0.99, 0.99));
    expect(out).toEqual(["one.", "Two", "three"]);
  });

  it("does not capitalize after , or ;", () => {
    const out = applyWordOptions(["one", "two"], { punctuation: true }, seq(0, 0, 0.99, 0.99, 0.99));
    expect(out).toEqual(["one,", "two"]);
  });
});

describe("getWords options", () => {
  it("is deterministic with an injected rng and keeps the count", () => {
    const a = getWords(30, "easy", { punctuation: true, numbers: true }, mulberry(7));
    const b = getWords(30, "easy", { punctuation: true, numbers: true }, mulberry(7));
    expect(a).toEqual(b);
    expect(a).toHaveLength(30);
  });
  it("leaves words plain when options are off", () => {
    const words = getWords(50, "easy", { punctuation: false, numbers: false });
    expect(words.every((w) => easyWords.includes(w))).toBe(true);
  });
});

/** Small seeded PRNG for deterministic tests. */
function mulberry(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
