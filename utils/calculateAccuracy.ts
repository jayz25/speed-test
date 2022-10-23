export const calculateAccuracy = (wordsIncorrect: number, wordsMatched: number): number => {
    return Math.round((wordsMatched/(wordsMatched + wordsIncorrect))*100) ? Math.round((wordsMatched/(wordsMatched + wordsIncorrect))*100) : 0;
}
