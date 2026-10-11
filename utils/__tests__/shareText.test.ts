import { formatResultText } from "../shareText";

describe("formatResultText", () => {
  it("formats a time-mode result", () => {
    expect(formatResultText({ wpm: 72, accuracy: 96 }, { mode: "time", limit: 30, difficulty: "mixed" }))
      .toBe("SpeedType — 72 wpm · 96% acc · 30s mixed");
  });
  it("formats a words-mode result", () => {
    expect(formatResultText({ wpm: 50, accuracy: 100 }, { mode: "words", limit: 25, difficulty: "hard" }))
      .toBe("SpeedType — 50 wpm · 100% acc · 25 words hard");
  });
});
