export const getAccurateWords = (typedData, paragraph) => {
    let matchedWords = 0;
    let index = 0;
    typedData.split(' ').forEach((word) => {
            if(word === paragraph.split(' ')[index]){
                matchedWords++;
            }
            index++;
    });
    return matchedWords;
}