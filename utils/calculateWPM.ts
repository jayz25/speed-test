export const calculateWPM = (wordsMatched: number, time = 60): number => {
    const timeFactor = time/60;
    return Math.round(wordsMatched/timeFactor);
}