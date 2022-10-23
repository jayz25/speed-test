export const calculateWPM = (wordsMatched: number, time: number): number => {
    console.log('WPM')
    const timeFactor = time/60;
    console.log(wordsMatched)
    console.log('DOH',(wordsMatched/timeFactor))
    return Math.round(wordsMatched/timeFactor);
}