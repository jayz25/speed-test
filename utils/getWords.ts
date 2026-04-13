import { easyWords, mediumWords, hardWords } from "./wordBank";

export type WordMode = "easy" | "medium" | "hard" | "mixed";

function fisherYatesShuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getWords(count = 60, mode: WordMode = "mixed"): string[] {
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

  const shuffled = fisherYatesShuffle(pool);
  // If count > pool size, cycle through again
  const result: string[] = [];
  while (result.length < count) {
    result.push(...shuffled);
  }
  return result.slice(0, count);
}
