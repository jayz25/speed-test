export const calculateCPM = (charsMatched: number, time: number): number => {
    return Math.round(charsMatched/(time/60));
}