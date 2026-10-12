import { MAX_PLAUSIBLE_WPM } from "../calculateStats";
import { getInvalidReason, INVALID_REASON_LABELS, MIN_TEST_MS, MIN_TEST_WORDS } from "../resultValidity";

const ok = { wpm: 80, rawWpm: 85, wordCount: 25, elapsedMs: 20_000 };

describe("getInvalidReason", () => {
  it("accepts a normal run, including a record-level human burst", () => {
    expect(getInvalidReason(ok)).toBeNull();
    expect(getInvalidReason({ ...ok, wpm: 319, rawWpm: 325 })).toBeNull();
    expect(getInvalidReason({ ...ok, wordCount: MIN_TEST_WORDS, elapsedMs: MIN_TEST_MS })).toBeNull();
  });

  it("rejects tests under 1 second or under 10 words as too short", () => {
    expect(getInvalidReason({ ...ok, elapsedMs: MIN_TEST_MS - 1 })).toBe("too-short");
    expect(getInvalidReason({ ...ok, wordCount: MIN_TEST_WORDS - 1 })).toBe("too-short");
  });

  it("rejects net or raw WPM over the plausibility cap as too fast", () => {
    expect(getInvalidReason({ ...ok, wpm: MAX_PLAUSIBLE_WPM + 1 })).toBe("too-fast");
    expect(getInvalidReason({ ...ok, rawWpm: MAX_PLAUSIBLE_WPM + 1 })).toBe("too-fast");
  });

  it("reports too short before too fast (an instant injected run is both)", () => {
    expect(getInvalidReason({ wpm: 6_000_000, rawWpm: 6_000_000, wordCount: 20, elapsedMs: 0 })).toBe("too-short");
  });

  it("has a label for every reason", () => {
    expect(INVALID_REASON_LABELS["too-short"]).toMatch(/too short/);
    expect(INVALID_REASON_LABELS["too-fast"]).toContain(String(MAX_PLAUSIBLE_WPM));
  });
});
