export const calculateWPM = (charactersMatched: number, seconds: number): number => {
    const wordsTyped = (charactersMatched) / 5;
    const timeInMinutes = (61 - seconds) / 60;

    return Math.round(wordsTyped / timeInMinutes);
}