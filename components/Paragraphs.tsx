import { useDispatch, useSelector } from "react-redux";
import refreshing from "../static/refreshing.png";
import { AppDispatch, RootState } from "../types/types";
import StatsPill from "./StatsPill";
import speedometer from "../static/speedometer.png";
import sandClock from "../static/sandClock.png";
import checkMark from "../static/checkMark.png";
import React, { useEffect, useRef, useState } from "react";
import { calculateCPM } from "../utils/calculateCPM";
import { calculateWPM } from "../utils/calculateWPM";
import useTimer from "../utils/hooks/useTimer";
import { calculateAccuracy } from "../utils/calculateAccuracy";
import { refreshParagraph } from "../redux/paragraph";
import { handleBlurContainer, handleClickMeFocus, setInputFocus } from "../utils/focusHandlers";
import { removeStyling } from "../utils/removeStyling";
import Link from "next/link";
import { scrollWithNextLine } from "../utils/scrollWithNextLine";

const Paragraphs = () => {
  const paragraph = useSelector(
    (state: RootState) => state.paragraph.currentParagraph
  );
  const dispatch = useDispatch<AppDispatch>();
  const words = paragraph?.paragraph?.split(" ");

  // Use this to reset stats 
  // const [indexState, setIndexState] = useState({
  //   wordsMatched: 0,
  //   activeWordIndex: 0,
  //   activeLetterIndex: 0,
  //   charactersMatched: 0,
  //   incorrectLetterIndex: null,
  //   cpm: 0,
  //   wpm: 0,
  //   accuracy: 0,
  //   wordsIncorrect: 0,
  //   recentIncorrectIndex: null,
  //   isStarted: false,
  //   inputDisabled: false,
  // });

  const [wordsMatched, setWordsMatched] = useState(0);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [activeLetterIndex, setActiveLetterIndex] = useState(0);
  const [charactersMatched, setCharactersMatched] = useState(0);
  const [incorrectLetterIndex, setIncorrectLetterIndex] = useState(null);
  const [cpm, setCpm] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [wordsIncorrect, setWordsIncorrect] = useState(0);
  const [recentIncorrectIndex, setRecentIncorrectIndex] = useState(null);
  const textInput = useRef<HTMLInputElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);
  const { seconds, start, reset, timeout } = useTimer(60);
  const [isStarted, setIsStarted] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [currentTypedWord, setCurrentTypedWord] = useState("");
  const [activeWord, setActiveWord] = useState(
    paragraph?.paragraph[activeWordIndex]
  );
  const [activeLineOffset, setActiveLineOffset] = useState(0);
  
  const resetStats = () => {
    setInputFocus(textInput);
    reset(); // useTimer
    // setIndexState(indexState => indexState);
    setWordsMatched(0);
    setActiveWordIndex(0);
    setActiveLetterIndex(0);
    setCharactersMatched(0);
    setIncorrectLetterIndex(null);
    setCpm(0);
    setWpm(0);
    setAccuracy(0);
    setWordsIncorrect(0);
    setRecentIncorrectIndex(null);
    setIsStarted(false);
    setInputDisabled(false);
    // setActiveLine(0);
    setActiveLineOffset(0);
    dispatch(refreshParagraph());
    removeStyling();
    textInput.current.value = "";
    //active word also needs to be set
  };
  
  const inputCapture = (_e: React.ChangeEvent) => {
    _e.preventDefault();

    if (!isStarted) {
      setIsStarted(true);
      start();
    }
    setCurrentTypedWord(
      ((_e.target as HTMLInputElement).value as string).trim()
    );
  };
  const keyBoardHandler = (_e: React.KeyboardEvent) => {
    if (_e.key === "Backspace") {
      // Don't allow correcting the previous word
      if (activeLetterIndex == 0) {
        return null;
      }
      removeStyling(true, activeLetterIndex - 1, activeWordIndex);
      setActiveLetterIndex((activeLetterIndex) => activeLetterIndex - 1);
    } else if (_e.key === " " || _e.code === "Space") {
      setActiveLetterIndex(0);

      if (
        currentTypedWord.length === activeWord.length &&
        currentTypedWord === activeWord
      ) {
        setWordsMatched((wordsMatched) => wordsMatched + 1);
        setCharactersMatched(
          (charactersMatched) => charactersMatched + currentTypedWord.length
        );
      } else {
        setRecentIncorrectIndex(activeWordIndex);
        setWordsIncorrect((wordsIncorrect) => wordsIncorrect + 1);
      }
      setActiveWordIndex((activeWordIndex) => activeWordIndex + 1);
      setActiveWord(words[activeWordIndex]);
      textInput.current.value = "";
    } else if (
      _e.key >= "a" &&
      _e.key <= "z" &&
      activeWord[activeLetterIndex] == _e.key
    ) {
      setActiveLetterIndex((activeLetterIndex) => activeLetterIndex + 1);
    } else {
      if (_e.key !== "Shift") {
        setIncorrectLetterIndex(activeLetterIndex);
        setActiveLetterIndex((activeLetterIndex) => activeLetterIndex + 1);
      }
    }
  };

  useEffect(() => {
    setCpm(calculateCPM(charactersMatched, timeout));
    setWpm(calculateWPM(wordsMatched, timeout));
    setAccuracy(calculateAccuracy(wordsIncorrect, wordsMatched));
    const textInputElement = textInput.current;
    textInputElement.addEventListener("blur", handleBlurContainer);
    // textInputElement.addEventListener("focus", () => handleClickMeFocus(textInput));
    setActiveWord(paragraph?.paragraph.split(" ")[activeWordIndex]);
    const container = document.querySelector<HTMLElement>("#given-paragraph");
    const activeWordElement =
      container.querySelectorAll<HTMLElement>("#word-element")[activeWordIndex];
    
      if (activeLineOffset === 0 && activeWordElement?.getBoundingClientRect().top) {
      setActiveLineOffset(activeWordElement?.getBoundingClientRect().top);
    }
    const activeLetterElement =
      activeWordElement?.querySelectorAll<HTMLElement>("#letter-element")[
        activeLetterIndex
      ];
    let previousLetterElement: HTMLElement;
    activeLetterElement?.querySelector('#letter').classList.remove('text-white'); // this is used for backspacing
    activeLetterElement?.querySelector('#cursor').classList.remove('hidden');

    if (activeLetterIndex > 0) {
      previousLetterElement =
        activeWordElement?.querySelectorAll<HTMLElement>("#letter-element")[
          activeLetterIndex - 1
        ];
    }

    const nextElement =
      activeWordElement?.querySelectorAll<HTMLElement>("#letter-element")[
        activeLetterIndex + 1
      ];
    nextElement?.querySelector('#cursor').classList.add('hidden'); // this is used for backspacing
    previousLetterElement?.querySelector('#letter').classList.add('text-white');
    previousLetterElement?.querySelector('#cursor').classList.add('hidden');
   
    if (seconds <= 0) {
      setIsStarted(false);
      setInputDisabled(true);
      document.querySelector("#click-me")?.classList.remove("hidden");
    }

    if (activeWordIndex > 0) {
      const clearStyleElement =
        container.querySelectorAll<HTMLElement>("#word-element")[
          activeWordIndex - 1
        ];
      clearStyleElement?.classList.remove("bg-yellow-300");
      clearStyleElement?.classList.remove("text-slate-700");
      if (activeWordElement.getBoundingClientRect().top > activeLineOffset) {
        scrollWithNextLine();
        setActiveLineOffset(activeWordElement.getBoundingClientRect().top);
      }
    }

    if (recentIncorrectIndex != null) {
      const redFlag =
        container.querySelectorAll<HTMLElement>("#word-element")[
          recentIncorrectIndex
        ];
      redFlag?.classList.add("line-through");
      redFlag?.querySelectorAll<HTMLElement>("#letter-element").forEach((element: HTMLElement) => {
        element.querySelector(
          '#cursor'
        ).classList.add('hidden')
      });
    }

    if (incorrectLetterIndex != null) {
      const redLetter =
        activeWordElement?.querySelectorAll<HTMLElement>("#letter-element")[
          incorrectLetterIndex
        ];
      redLetter?.querySelector('#letter').classList.remove("text-white");
      redLetter?.querySelector('#letter').classList.add("text-red-700");
      setIncorrectLetterIndex(null);
    }

    return () => {
      textInputElement.removeEventListener("blur", handleBlurContainer);
      // textInputElement.removeEventListener("focus", () => handleClickMeFocus(textInput));
    };
  }, [
    paragraph,
    words,
    activeWord,
    seconds,
    recentIncorrectIndex,
    activeWordIndex,
    activeLetterIndex,
    wordsMatched,
    charactersMatched,
    accuracy
  ]); //ref

  return (
    <div className="flex justify-center items-center flex-col">
      <input
        className="h-0 w-0"
        id="input-text"
        placeholder={activeWord}
        onChange={inputCapture}
        disabled={inputDisabled}
        ref={textInput}
        onKeyDown={keyBoardHandler}
        onFocus={() => handleClickMeFocus}
      />
      <div
        ref={paraRef}
        id="given-paragraph"
        onClick={() => handleClickMeFocus(textInput)}
        className="flex w-1/2 h-1/3 relative rounded-2xl p-4 bg-[#C5C5C5] font-bold text-slate-700"
      >
        <div id="scrolling-div" className="overflow-hidden">
          <div
            id="click-me"
            className="absolute justify-center rounded-2xl items-center h-full w-full flex hidden font-bold text-slate-50 bg-[#525252]/[.85] m-[-1rem]"
          >
            <span className="text-xl">Out of Focus! Click here or press any key to return</span>
          </div>

          {
            <div id="text-container" className="flex flex-wrap pb-[1rem] text-2xl font-medium">
                {paragraph?.paragraph?.split(" ").map((word, index) => {
                  return (
                    <div
                      className="flex flex-row p-1 relative"
                      id="word-element"
                      key={index}
                    >
                      {word.split("").map((letter, letterIndex) => {
                        return (
                            <div id="letter-element" className="px-[0.01rem] flex flex-row" key={index + letterIndex}>
                              <div id="cursor" className="hidden absolute h-[2rem] w-[1.5px] bg-red-400"></div><span id='letter' className="">{letter}</span>
                            </div>
                        );
                      })}
                    </div>
                  );
                })}
            </div>
          }
        </div>
      </div>
      <div className="flex w-1/2 justify-between mt-4">
        <div className="flex flex-row">
          <StatsPill stat={wpm} statImg={speedometer.src} unit={"wpm"} />
          <StatsPill stat={accuracy} statImg={checkMark.src} unit={"%"} />
          <StatsPill stat={seconds} statImg={sandClock.src} unit={"sec"} />
        </div>
        <Link href="/">
          <button
            className="self-center"
            onClick={resetStats}
            >
            <img
              tabIndex={0}
              className="p-2 rounded-lg hover:bg-[#D8D8D8] focus:bg-[#D8D8D8]"
              src={refreshing.src}
              alt="refresh button"
              />
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Paragraphs;
