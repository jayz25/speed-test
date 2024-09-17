export const calculateCPM = (charsMatched: number, time = 60): number => {
    return Math.round(charsMatched/(time/60));
}