import { easyWords, mediumWords, hardWords } from "./wordBank";

export type WordMode = "easy" | "medium" | "hard" | "mixed";

export interface WordOptions {
  punctuation?: boolean;
  numbers?: boolean;
}

/** Random source returning a float in [0, 1); injectable so tests can be deterministic. */
export type Rng = () => number;

export const PUNCTUATION_RATE = 0.2;
export const QUOTE_RATE = 0.05;
export const NUMBER_RATE = 0.1;
export const PUNCTUATION_MARKS = [",", ".", ";", "!", "?"] as const;
const SENTENCE_END = new Set([".", "!", "?"]);
const MAX_NUMBER_DIGITS = 4;

type Tier = "easy" | "medium" | "hard";

/** Share of words drawn from each commonness tier, per difficulty. Weights sum to 1. */
export const DIFFICULTY_MIX: Record<WordMode, Record<Tier, number>> = {
  easy: { easy: 0.8, medium: 0.2, hard: 0 },
  medium: { easy: 0.35, medium: 0.5, hard: 0.15 },
  hard: { easy: 0.2, medium: 0.3, hard: 0.5 },
  mixed: { easy: 1 / 3, medium: 1 / 3, hard: 1 / 3 },
};

const TIER_WORDS: Record<Tier, readonly string[]> = {
  easy: easyWords,
  medium: mediumWords,
  hard: hardWords,
};
const TIERS: readonly Tier[] = ["easy", "medium", "hard"];

/** A random number of 1-4 digits (no leading zero except "0" itself). */
function randomNumber(rng: Rng): string {
  const digits = 1 + Math.floor(rng() * MAX_NUMBER_DIGITS);
  const min = digits === 1 ? 0 : 10 ** (digits - 1);
  const max = 10 ** digits;
  return String(min + Math.floor(rng() * (max - min)));
}

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

/**
 * Numbers: ~10% of words become a 1-4 digit number. Punctuation: ~20% get one of `, . ; ! ?`
 * appended, the word after `. ! ?` is capitalized, ~5% are wrapped in quotes.
 * Per word, rng calls happen in that order (numbers first, then punctuation).
 */
export function applyWordOptions(words: readonly string[], options: WordOptions, rng: Rng = Math.random): string[] {
  const { punctuation = false, numbers = false } = options;
  let capitalizeNext = false;
  return words.map((base) => {
    let word = base;
    if (numbers && rng() < NUMBER_RATE) word = randomNumber(rng);
    if (!punctuation) return word;

    if (capitalizeNext) word = capitalize(word);
    capitalizeNext = false;
    if (rng() < PUNCTUATION_RATE) {
      const mark = PUNCTUATION_MARKS[Math.floor(rng() * PUNCTUATION_MARKS.length)];
      word += mark;
      capitalizeNext = SENTENCE_END.has(mark);
    }
    if (rng() < QUOTE_RATE) word = `"${word}"`;
    return word;
  });
}

function pickTier(mix: Record<Tier, number>, rng: Rng): Tier {
  const roll = rng();
  let cumulative = 0;
  for (const tier of TIERS) {
    cumulative += mix[tier];
    if (roll < cumulative && mix[tier] > 0) return tier;
  }
  return TIERS.filter((tier) => mix[tier] > 0).pop() ?? "easy";
}

function pickWord(mix: Record<Tier, number>, rng: Rng): string {
  const pool = TIER_WORDS[pickTier(mix, rng)];
  return pool[Math.floor(rng() * pool.length)];
}

export function getWords(count = 60, mode: WordMode = "mixed", options: WordOptions = {}, rng: Rng = Math.random): string[] {
  const mix = DIFFICULTY_MIX[mode] ?? DIFFICULTY_MIX.mixed;
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    let word = pickWord(mix, rng);
    // Re-roll once to avoid an immediate repeat.
    if (word === result[i - 1]) word = pickWord(mix, rng);
    result.push(word);
  }
  return applyWordOptions(result, options, rng);
}
