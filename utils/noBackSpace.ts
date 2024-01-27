
const noBackSpace = (index) => {
    if(index == 0) {
        document.addEventListener('keydown', () => handler);
    }else{
        document.removeEventListener('keydown', handler);
    }
}

const handler = (e: KeyboardEvent) => {
    if(e.keyCode === 8) {
        e.preventDefault();
    }
}

export default noBackSpace;
