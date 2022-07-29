import { useEffect, useState } from 'react'
import Timer from './Timer';

const TypeHere = () => {
    const [key, setKey] = useState(0);
    const [typedData, setTypedData] = useState('');
    const [numberOfWordsTyped, setNumberOfWordsTyped] = useState(0);
    const [percentage, setPercentage] = useState(0);
    const [inputDisabled, setInputDisabled] = useState(false);
    const givenString = 'Generating random paragraphs can be an excellent way for writers to get their creative flow going at the beginning of the day. The writer has no idea what topic the random paragraph will be about when it appears. This forces the writer to use creativity to complete one of three common writing challenges. The writer can use the paragraph as the first one of a short story and build upon it. A second option is to use the random paragraph somewhere in a short story they create. The third option is to have the random paragraph be the ending paragraph in a short story. No matter which of these challenges is undertaken, the writer is forced to use creativity to incorporate the paragraph into their writing'.split(' ')

    function getData(e) {
        e.preventDefault();
        
        setTypedData(e.target.value);
        setNumberOfWordsTyped(typedData.split(' ').length);
        var i = 0;
        var matchedCount = 0
        typedData.split(' ').forEach((word)=> {
            if(word === givenString[i]){
                matchedCount++;
                i++;
            }
            else {
                i++;
            }

        });
        setPercentage(matchedCount/numberOfWordsTyped * 100);
    }

    function resetStats() {
        setPercentage(0);
        setNumberOfWordsTyped(0);
        setInputDisabled(false);
        setTypedData('');
        setKey(prevKey => prevKey + 1);
    }

    return (
        <div className='p-4'>
            <div className='w-[10px] h-[10px]'>
            <Timer inputDisabled= {inputDisabled} setInputDisabled = {setInputDisabled} key = {key} />

            </div>
            <div className='w-1/5 m-auto'>
                {`Accuracy: ${percentage} %`}
                {`Words typed: ${numberOfWordsTyped}`}
                
            </div>

            <input 
                className="w-full p-2 m-auto text-center border-b-2 focus:outline-none"
                placeholder="Type above text here"
                onChange={getData}
                disabled={inputDisabled}
                value={typedData}
            />
            <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                onClick={resetStats}    
            >Reset
            </button>
            <div className='w-1/2 m-auto' >

            </div>
        </div>
    )
}

export default TypeHere;