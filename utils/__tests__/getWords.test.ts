import { getWords } from "../getWords";
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
