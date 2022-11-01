import { useDispatch, useSelector } from 'react-redux';
import refreshing from '../static/refreshing.png';
import { AppDispatch, RootState } from '../types/types';
import StatsPill from './StatsPill';
import speedometer from '../static/speedometer.png';
import sandClock from '../static/sandClock.png';
import checkMark from '../static/checkMark.png';
import React, { useEffect, useRef, useState } from 'react';
import { calculateCPM } from '../utils/calculateCPM';
import { calculateWPM } from '../utils/calculateWPM';
import useTimer from '../utils/hooks/useTimer';
import { calculateAccuracy } from '../utils/calculateAccuracy';
import noBackSpace from '../utils/noBackSpace';
import { refreshParagraph } from '../redux/paragraph';

const Paragraphs = () => {
    const paragraph = useSelector((state: RootState)=>state.paragraph.currentParagraph);
    const dispatch = useDispatch<AppDispatch>();
    const words = (paragraph?.paragraph)?.split(' ');
    const [activeWordIndex, setActiveWordIndex] = useState(0);
    const [activeLetterIndex, setActiveLetterIndex] = useState(0);
    const [activeWord, setActiveWord] = useState(paragraph?.paragraph[activeWordIndex]);
    const [charactersMatched, setCharactersMatched] = useState(0);
    const [incorrectLetterIndex, setIncorrectLetterIndex] = useState(null);
    const [wordsMatched, setWordsMatched] = useState(0);
    const [cpm, setCpm] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(0);
    const textInput = useRef(null);
    const paraRef = useRef(null);
    const [wordsIncorrect, setWordsIncorrect] = useState(0);
    const {
        seconds,
        start,
        reset,
        timeout,
    } = useTimer(60); 
    const [backSpaceTapped, setBackSpaceTapped] = useState(false);
    const bgColorOne = 'bg-[#C5C5C5]';
    const bgColorTwo = 'bg-[#1E293B]';
    const [isStarted, setIsStarted] = useState(false);
    const [inputDisabled, setInputDisabled] = useState(false);
    const [recentIncorrectIndex, setRecentIncorrectIndex] = useState(null);
    const [currentTypedWord, setCurrentTypedWord] = useState('');
    const callRefresh = () => {
        setIsStarted(false);
        reset();
        resetStats();
        setInputDisabled(false);
    }
    const [globalIndex, setGlobalIndex] = useState(0);
    const resetStats = () => {
        setWpm(0);
        setCpm(0);
        setAccuracy(0);
        textInput.current.value = '';
        setActiveWordIndex(0);
        setWordsMatched(0);
        setCharactersMatched(0);
        dispatch(refreshParagraph());
        removeStyling();
        setRecentIncorrectIndex(null);
        setGlobalIndex(0);
        //active word also needs to be set 
    }
    const removeStyling = () => {
        const container = document.querySelector<HTMLElement>('#given-paragraph');
        container.querySelectorAll<HTMLElement>('#word-element').forEach((element) => {
            element.classList.remove('bg-yellow-300', 'text-red-700', 'text-slate-700', 'underline');
        });
    }
    const inputCapture = (_e: React.ChangeEvent) => {
        _e.preventDefault();

        if(!isStarted) {
            setIsStarted(true);
            start();
        }
        setCurrentTypedWord(((_e.target as HTMLInputElement).value as string).trim());
        

    }
    const keyBoardHandler = (_e: React.KeyboardEvent) => {
        if(_e.key == " " || _e.code == 'Space') {
            setActiveLetterIndex(0); 
            
            if(currentTypedWord.length === activeWord.length && currentTypedWord === activeWord) {
                setWordsMatched(wordsMatched => wordsMatched + 1);
                setCharactersMatched(charactersMatched => charactersMatched + currentTypedWord.length);
            } else {
                setRecentIncorrectIndex(activeWordIndex);
                setWordsIncorrect(wordsIncorrect => wordsIncorrect + 1);
            }
            setCpm(calculateCPM(charactersMatched, timeout));
            setWpm(calculateWPM(wordsMatched, timeout));
            setAccuracy(calculateAccuracy(wordsIncorrect, wordsMatched));
            setActiveWordIndex(activeWordIndex => activeWordIndex + 1);
            setActiveWord(words[activeWordIndex]);
            textInput.current.value = '';
        }
        else if(activeWord[activeLetterIndex] == _e.key) {
            console.log('messing with ya head', activeWord, activeLetterIndex, activeWord[activeLetterIndex])
            setActiveLetterIndex(activeLetterIndex => activeLetterIndex + 1);
        } else {
            if(_e.key !== 'Shift') {
                setIncorrectLetterIndex(activeLetterIndex);
                setActiveLetterIndex(activeLetterIndex => activeLetterIndex + 1);
            }
        }
    }
    
    const setInputFocus = () => {
        textInput.current.focus();
    }
    const handleBlurContainer = () => {
        const target = document.querySelector('#given-paragraph');
        target.classList.replace(bgColorOne, bgColorTwo);
        document.querySelector('#click-me')?.classList.remove('hidden');

    }
    const handleClickMeFocus = () => {
        const target = document.querySelector('#given-paragraph');
        target.classList.replace(bgColorTwo, bgColorOne);
        document.querySelector('#click-me')?.classList.add('hidden');
        setInputFocus();

    }
    useEffect(() => {
        const textInputElement = textInput.current;
        textInputElement.addEventListener('blur', handleBlurContainer);
        setActiveWord(paragraph?.paragraph.split(' ')[activeWordIndex]);
        const container = document.querySelector<HTMLElement>('#given-paragraph');
        const activeWordElement = container.querySelectorAll<HTMLElement>('#word-element')[activeWordIndex];
        const activeLetterElement = activeWordElement?.querySelectorAll<HTMLElement>('#letter-element')[activeLetterIndex];
        activeLetterElement?.classList.add('underline');
        if(activeLetterIndex > 0) {
            const previousLetterElement = activeWordElement?.querySelectorAll<HTMLElement>('#letter-element')[activeLetterIndex - 1];
            previousLetterElement?.classList.replace('underline','text-white');
        }
        if(seconds <= 0) {
            setIsStarted(false);
            setInputDisabled(true);

        }
        if(backSpaceTapped) {
            activeLetterElement?.classList.remove('text-white');
            activeLetterElement?.classList.remove('underline');
            setBackSpaceTapped(false);
        }
        if(activeWordIndex > 0) {
            const clearStyleElement = container.querySelectorAll<HTMLElement>('#word-element')[activeWordIndex - 1];
            clearStyleElement?.classList.remove('bg-yellow-300'); 
            clearStyleElement?.classList.remove('text-slate-700');     
        }
        if(recentIncorrectIndex) {
            console.log('recent Incorrect index', recentIncorrectIndex);
            const redFlag = container.querySelectorAll<HTMLElement>('#word-element')[recentIncorrectIndex];
            // redFlag?.classList.add('text-red-700');
            // redFlag?.classList.add('underline');
            redFlag?.classList.add('line-through')
        }
        if(incorrectLetterIndex) {
            console.log('Hello you make me feel love')
            const redLetter = activeWordElement?.querySelectorAll<HTMLElement>('#letter-element')[incorrectLetterIndex];
            console.log('redletter', redLetter)
            redLetter?.classList.replace('text-white','text-red-700');
            setIncorrectLetterIndex(null);
        }
        return () => {
            textInputElement.removeEventListener('focusout', handleBlurContainer);
        }
    },[backSpaceTapped, paragraph, words, activeWord, seconds, recentIncorrectIndex, activeWordIndex, activeLetterIndex]) //ref
    
    return (
        <div className='w-3/5 pt-[5rem] p-3 text-xl text-cyan-900' >
           
            <input
                className='h-0 w-0'
                id='input-text'
                placeholder={activeWord}
                onChange={inputCapture}
                disabled={inputDisabled}
                ref={textInput}
                onKeyDown={keyBoardHandler}
                onFocus={handleClickMeFocus}
                />
            <div 
                ref={paraRef}
                id='given-paragraph' 
                onClick={handleClickMeFocus} 
                className="rounded-2xl p-4 bg-[#C5C5C5] font-bold text-slate-700"
            >
                <span 
                    id='click-me'
                    className='flex h-[100%] w-[100%] relative z-10 hidden font-bold text-slate-50'
                >
                        <strong className='justify-center align-center'>Out of Focus, click here!</strong>
                    
                </span>
                
                {
                    <div className='flex flex-wrap'>{
                        (paragraph?.paragraph)?.split((' ')).map((word, index) => {

                            return (
                            <div className='flex flex-row p-1' id='word-element' key={index}>
                                {word.split('').map((letter, letterIndex) => {
                                    return (
                                        <div id='letter-element' key={index+letterIndex}>{letter}</div>
                                        )
                                    })
                                }
                            </div>
                             
                            )
                        })
                    }
                    </div>

                }
            </div>
            <div className='flex justify-between mt-4'>
                <div className='flex flex-row'>
                    <StatsPill stat={wpm} statImg={speedometer.src} unit={'wpm'}/>
                    <StatsPill stat={accuracy} statImg={sandClock.src} unit={'%'}/>
                    <StatsPill stat={seconds} statImg={checkMark.src} unit={'sec'}/>
                </div>
                <div className='self-center'>
                        <img
                            role='button'
                            className=''
                            src={refreshing.src}
                            alt="refresh button"
                            onClick={callRefresh}
                        />
                </div>
            </div>
        </div>
    )
}

export default Paragraphs;