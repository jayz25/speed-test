export const calculateCPM = (charactersMatched: number, seconds: number, timeToType: number): number => {
  const elapsed = timeToType - seconds;
  if (elapsed <= 0) return 0;
  const timeInMinutes = elapsed / 60;
  return Math.round(charactersMatched / timeInMinutes);
};