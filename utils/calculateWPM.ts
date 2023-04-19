export const calculateWPM = (wordsMatched: number, time: number): number => {
    const timeFactor = time/60;
    return Math.round(wordsMatched/timeFactor);
}