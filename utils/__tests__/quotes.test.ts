import {
  getQuoteLength, MEDIUM_MAX_WORDS, pickQuote, QUOTE_LENGTHS, QUOTES, quoteToWords, SHORT_MAX_WORDS, type Quote,
} from "../quotes";
import { MIN_TEST_WORDS } from "../resultValidity";

const quote = (wordCount: number): Quote => ({ text: Array(wordCount).fill("word").join(" "), source: "Test" });

describe("QUOTES data", () => {
  it("is plain ASCII, trimmed, single-spaced and newline-free", () => {
    for (const { text, source } of QUOTES) {
      expect(text, text).toMatch(/^[\x20-\x7E]+$/);
      expect(text, text).toBe(text.trim());
      expect(text, text).not.toMatch(/ {2}/);
      expect(source.trim().length, text).toBeGreaterThan(0);
    }
  });

  it("has at least MIN_TEST_WORDS words per quote, so every quote run can be saved", () => {
    for (const { text } of QUOTES) expect(text.split(" ").length, text).toBeGreaterThanOrEqual(MIN_TEST_WORDS);
  });

  it("has no duplicate texts", () => {
    expect(new Set(QUOTES.map((q) => q.text)).size).toBe(QUOTES.length);
  });

  it.each(QUOTE_LENGTHS)("has at least 10 %s quotes", (length) => {
    expect(QUOTES.filter((q) => getQuoteLength(q) === length).length).toBeGreaterThanOrEqual(10);
  });
});

describe("getQuoteLength", () => {
  it("classifies by word-count thresholds", () => {
    expect(getQuoteLength(quote(1))).toBe("short");
    expect(getQuoteLength(quote(SHORT_MAX_WORDS))).toBe("short");
    expect(getQuoteLength(quote(SHORT_MAX_WORDS + 1))).toBe("medium");
    expect(getQuoteLength(quote(MEDIUM_MAX_WORDS))).toBe("medium");
    expect(getQuoteLength(quote(MEDIUM_MAX_WORDS + 1))).toBe("long");
  });
});

describe("pickQuote", () => {
  it.each(QUOTE_LENGTHS)("returns a %s quote", (length) => {
    for (const roll of [0, 0.5, 0.999]) {
      expect(getQuoteLength(pickQuote(length, () => roll))).toBe(length);
    }
  });

  it("avoids the excluded text when the tier has alternatives", () => {
    const first = pickQuote("short", () => 0);
    for (const roll of [0, 0.01, 0.5, 0.999]) {
      expect(pickQuote("short", () => roll, first.text).text).not.toBe(first.text);
    }
  });

  it("ignores an exclusion that matches nothing in the tier", () => {
    expect(pickQuote("long", () => 0, "no such quote")).toEqual(pickQuote("long", () => 0));
  });
});

describe("quoteToWords", () => {
  it("splits on single spaces keeping case and punctuation", () => {
    expect(quoteToWords({ text: "Hello, World! It's me.", source: "x" })).toEqual(["Hello,", "World!", "It's", "me."]);
  });
});
