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

function fisherYatesShuffle<T>(array: T[], rng: Rng): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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

export function getWords(count = 60, mode: WordMode = "mixed", options: WordOptions = {}, rng: Rng = Math.random): string[] {
  let pool: string[];

  switch (mode) {
    case "easy":
      pool = easyWords;
      break;
    case "medium":
      pool = mediumWords;
      break;
    case "hard":
      pool = hardWords;
      break;
    case "mixed":
    default:
      pool = [...easyWords, ...mediumWords, ...hardWords];
  }

  const shuffled = fisherYatesShuffle(pool, rng);
  // If count > pool size, cycle through again
  const result: string[] = [];
  while (result.length < count) {
    result.push(...shuffled);
  }
  return applyWordOptions(result.slice(0, count), options, rng);
}
