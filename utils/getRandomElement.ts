export const getRandomElementFromArray = (array: Array<any>) => {
    return (array && array[Math.floor(Math.random() * array?.length)])
}