export const scrollWithNextLine = () => {
    document.querySelector('#scrolling-div').scrollBy(0, 40);
}

export const scrollReset = () => {
    document.querySelector('#scrolling-div').scrollTop = 0;
}