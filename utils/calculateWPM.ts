export const calculateWPM = (charactersMatched: number, seconds: number, timeToType: number): number => {
  const elapsed = timeToType - seconds;
  if (elapsed <= 0) return 0; // Fixed: was returning Infinity at t=0
  const wordsTyped = charactersMatched / 5; // standard: 1 word = 5 chars
  const timeInMinutes = elapsed / 60;
  return Math.round(wordsTyped / timeInMinutes);
};