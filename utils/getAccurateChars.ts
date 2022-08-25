export const getAccurateChars = (typedData, givenString) => {
    var chars = 0;
    var index = 0;
    typedData.split('').forEach((char)=> {
        if(char === givenString.split('')[index]) {
            chars++;
        }
        index++;
    })
    return chars;
}