export const calculateAccuracy = (wordsIncorrect: number, wordsMatched: number): number => {
  const total = wordsMatched + wordsIncorrect;
  if (total === 0) return 0; // Fixed: was returning NaN via double ternary
  return Math.round((wordsMatched / total) * 100);
};
