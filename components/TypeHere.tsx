import React, { useRef, useState } from 'react'
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import StatsPill from './StatsPill';
import Timer from './Timer';

const TypeHere = () => {
    const [numberOfCharTyped, setNumberOfCharTyped] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [timerKey, setTimerKey] = useState(0);
    const [typedData, setTypedData] = useState('');
    const [numberOfWordsTyped, setNumberOfWordsTyped] = useState(0);
    const [accuracy, setAccuracy] = useState(0);
    const [inputDisabled, setInputDisabled] = useState(false);
    const inputRef = useRef(null);
    const {paragraph: givenString} = useSelector<RootState>(state=>state.currentParagraph);




    const getData = (e: React.ChangeEvent) => {
        console.log(givenString)
        e.preventDefault();
        setTypedData((e.target as HTMLInputElement).value);
        var word = 0;
        var matchedWords = 0;
        var matchedChars = 0;
        var character = 0;
        var accuracyValue = 0;

        typedData.split('').forEach((char) => {
            if(char === givenString.split(' ')[word][character]) {
                matchedChars++;
                character++;
            }
            if(char === ' ') {
                if(typedData.split(' ').at(word) === givenString.split(' ')[word]){
                    matchedWords++;
                }
                word++;
                character = 0;
            }
        })

        setNumberOfCharTyped(matchedChars);
        setNumberOfWordsTyped(matchedWords);

        accuracyValue = parseFloat(((matchedWords/givenString.split(' ').slice(0,word).length)*100).toFixed(2));

        setAccuracy(
            Number.isNaN(accuracyValue)
            ? 0
            : accuracyValue
        );

        setIsPlaying(true);

    }

    const resetStats = () => {
        setAccuracy(0);
        setNumberOfWordsTyped(0);
        setNumberOfCharTyped(0);
        setTypedData('');
        setTimerKey(prevKey => prevKey + 1);
        setIsPlaying(false);
        setInputDisabled(false);
    }

    return (
        <>
        <div className='bg-[#FAEBD7]'>
            <div className='flex justify-between w-1/5 m-auto'>
                <StatsPill
                    stat={accuracy}
                    statName={'Accuracy'}
                />
                <StatsPill
                    stat={numberOfWordsTyped}
                    statName={'Words'}
                />
                <StatsPill
                    stat={numberOfCharTyped}
                    statName={'Characters'}
                />
            </div>
            <div className='input-container flex justify-center'>
                <input
                    className="bg-[#ffffff] p-3 rounded-2xl mt-[5px] text-center w-3/4 shadow-md focus:scale-[1.05] focus:outline-0 duration-150"
                    placeholder="Start typing once ready!"
                    onChange={getData}
                    disabled={inputDisabled}
                    ref={inputRef}
                    value={typedData}
                />
            </div>
            <div className='buttons flex flex-row justify-center mt-[1rem]'>
                <button
                    className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-[.5rem]'
                    onClick={resetStats}
                >Reset
                </button>
                <button
                    className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'
                    onClick={()=> {}}
                >Refresh
                </button>
            </div>

        <Timer
            setInputDisabled={setInputDisabled}
            setIsPlaying={setIsPlaying}
            timerKey={timerKey}
            isPlaying={isPlaying}
            words={numberOfWordsTyped}
            chars={numberOfCharTyped}
            accuracy={accuracy}
        />
        </div>
     </>
    )
}

export default TypeHere;