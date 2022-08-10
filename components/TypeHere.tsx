import { useEffect, useRef, useState } from 'react'
import StatsPill from './StatsPill';
import Timer from './Timer';

const TypeHere = () => {
    const [wpm, setWpm] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [timerKey, setTimerKey] = useState(0);
    const [typedData, setTypedData] = useState('');
    const [numberOfWordsTyped, setNumberOfWordsTyped] = useState(0);
    const [percentage, setPercentage] = useState(0);
    const [inputDisabled, setInputDisabled] = useState(true);
    const inputRef = useRef(null);
    const givenString = 'Generating random paragraphs can be an excellent way for writers to get their creative flow going at the beginning of the day. The writer has no idea what topic the random paragraph will be about when it appears. This forces the writer to use creativity to complete one of three common writing challenges. The writer can use the paragraph as the first one of a short story and build upon it. A second option is to use the random paragraph somewhere in a short story they create. The third option is to have the random paragraph be the ending paragraph in a short story. No matter which of these challenges is undertaken, the writer is forced to use creativity to incorporate the paragraph into their writing'.split(' ')

    const getData = (e) => {
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
        setPercentage(parseFloat((matchedCount/numberOfWordsTyped * 100).toFixed(2)));
    }

    const resetStats = () => {
        setPercentage(0);
        setNumberOfWordsTyped(0);
        setInputDisabled(true);
        setTypedData('');
        setTimerKey(prevKey => prevKey + 1);
        setIsPlaying(false);
        setWpm(0);
    }

    const fireStartEvent = async () => {
        setIsPlaying(true);
        await setInputDisabled(false);
        //Waiting here to let it disable then focus. Synchrounous does not work here.
        inputRef.current.focus();
    }

    return (
        <>
        <div className='bg-[#FAEBD7]'>
            <div className='flex justify-between w-1/5 m-auto'>
                <StatsPill stat={percentage} statName={'Accuracy'} />
                <StatsPill stat={numberOfWordsTyped} statName={'Words'} />
                <StatsPill stat={'wpm'} statName={'WPM'} />
            </div>
            <div className='input-container flex justify-center'>
                <input
                    className="bg-[#ffffff] p-3 rounded-2xl mt-[5px] text-center w-3/4 shadow-md"
                    placeholder="Type above text here"
                    onChange={getData}
                    disabled={inputDisabled}
                    ref={inputRef}
                    value={typedData}
                />
            </div>
            <div className='buttons flex flex-row justify-center mt-[1rem]'>
                <button className='mr-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={fireStartEvent}>
                    Start
                </button>
                {/* Remove start button and fire start event once user starts typing ???  */}
                <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={resetStats}>
                    Reset
                </button>
            </div>

        <Timer setWpm={setWpm} inputDisabled={inputDisabled} setIsPlaying={setIsPlaying} setInputDisabled={setInputDisabled} timerKey={timerKey} isPlaying={isPlaying} />
        </div>
     </>
    )
}

export default TypeHere;