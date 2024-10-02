import { useDispatch, useSelector } from "react-redux";
import refreshing from "../static/refreshing.png";
import { AppDispatch, RootState, TypingStats } from "../types/types";
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
import { removeStyling } from "../utils/removeStyling";
import Link from "next/link";
import { scrollWithNextLine, scrollReset } from "../utils/scrollHelpers";

const TIME_TO_TYPE = 60;

const Paragraphs = () => {
  const paragraph = useSelector(
    (state: RootState) => state.paragraph.wordsCollection
  );

  const dispatch = useDispatch<AppDispatch>();
  const initialStats: TypingStats = {
    wordsMatched: 0,
    activeWordIndex: 0,
    activeLetterIndex: 0,
    charactersMatched: 0,
    incorrectLetterIndex: null,
    wpm: 0,
    cpm: 0,
    accuracy: 0,
    wordsIncorrect: 0,
    recentIncorrectIndex: null,
    activeWord: paragraph[0],
    currentTypedWord: "",
    activeLineOffset: 0,
    isStarted: false,
    inputDisabled: false
  };

  const [isEnlargedPill, setIsEnlargedPill] = useState<boolean>(false);
  const [typingStats, setTypingStats] = useState<TypingStats>({
    ...initialStats,
  });

  const updateTypingStats = (updates: Partial<TypingStats>) => {
    setTypingStats(prevStats => ({ ...prevStats, ...updates }));
  };

  const textInput = useRef<HTMLInputElement>(null);
  const paragraphContainerRef = useRef<HTMLParagraphElement>(null);
  const wordElementsRef = useRef<HTMLElement[]>([]);
  const clickMeFocusEl = useRef<HTMLDivElement>(null);
  
  const resetStats = () => {
    setIsEnlargedPill(false);
    dispatch(refreshParagraph());
    removeStyling();
    reset(); // useTimer
    updateTypingStats(initialStats);
    scrollReset();
    textInput.current.value = "";
    textInput.current?.focus();
  };

  const { seconds, start, reset } = useTimer(TIME_TO_TYPE);

  const inputCapture = (_e: React.ChangeEvent) => {
    _e.preventDefault();
    textInput.current?.focus();
    hideFocusMePopUp();
    if (!typingStats.isStarted) {
      updateTypingStats({
        isStarted: true,
      });
      start();
    }
    updateTypingStats({
      currentTypedWord: ((_e.target as HTMLInputElement).value as string).trim() 
    });
  };

  const keyBoardHandler = (_e: React.KeyboardEvent) => {
    const { activeLetterIndex, activeWord } = typingStats;
    if (_e.key === "Backspace") {
      // Don't allow correcting the previous word
      if (activeLetterIndex == 0) {
        return null;
      }
      removeStyling(true, activeLetterIndex - 1, typingStats.activeWordIndex);

      updateTypingStats({
        activeLetterIndex: activeLetterIndex - 1
      });
    } else if (_e.key === " " || _e.code === "Space") {
      const {
        currentTypedWord,
        wordsMatched,
        wordsIncorrect,
        activeWordIndex,
        charactersMatched
      } = typingStats;

      if (
        currentTypedWord.length === activeWord.length &&
        currentTypedWord === activeWord
      ) {
        updateTypingStats({
          wordsMatched: wordsMatched + 1,
          charactersMatched: charactersMatched + currentTypedWord.length,
        });
      } else {
        updateTypingStats({
          recentIncorrectIndex: activeWordIndex,
          wordsIncorrect: wordsIncorrect + 1,
        });
      }

      updateTypingStats({
        activeLetterIndex: 0,
        activeWordIndex: activeWordIndex + 1,
        activeWord: paragraph[activeWordIndex],
      });
      
      textInput.current.value = "";
    } else if (
      _e.key >= "a" &&
      _e.key <= "z" &&
      activeWord[activeLetterIndex] == _e.key
    ) {
      updateTypingStats({
        activeLetterIndex: activeLetterIndex + 1,
      });
    } else {
      if (!['Shift', 'Tab', 'Alt'].includes(_e.key)) {
        updateTypingStats({
          incorrectLetterIndex: activeLetterIndex,
          activeLetterIndex: activeLetterIndex + 1,
        });
      }
    }
  };

  useEffect(() => {
    if (paragraphContainerRef.current) {
      textInput.current?.focus();
      updateTypingStats({
        activeWord: paragraph[typingStats.activeWordIndex],
      });
      wordElementsRef.current = Array.from(paragraphContainerRef.current.querySelectorAll<HTMLElement>("#word-element"));
      wordElementsRef.current[0]?.querySelector('#cursor').classList.remove('hidden');
    }
  }, [paragraph]);

  useEffect(() => {
    if (seconds <= 0) {
      updateTypingStats({
        isStarted: false,
        inputDisabled: true
      });
      setIsEnlargedPill(true);
    }
  }, [seconds]);

  useEffect(() => {
    if (wordElementsRef.current.length === 0) {
      return;
    }
    const {
      charactersMatched,
      wordsMatched,
      wordsIncorrect,
      activeWordIndex,
      activeLineOffset,
      activeLetterIndex,
      recentIncorrectIndex,
      incorrectLetterIndex,
    } = typingStats;

    updateTypingStats({
      cpm: calculateCPM(charactersMatched),
      wpm: calculateWPM(charactersMatched, seconds),
      accuracy: calculateAccuracy(wordsIncorrect, wordsMatched),
      activeWord: paragraph[activeWordIndex],
    });
  
    const activeWordElement = wordElementsRef.current[activeWordIndex];
    const activeWordLetters = activeWordElement?.querySelectorAll<HTMLElement>("#letter-element");
    const activeLetterElement = activeWordLetters[activeLetterIndex];
    const nextElement = activeWordLetters[activeLetterIndex + 1];
    let previousLetterElement: HTMLElement;

    activeLetterElement?.querySelector('#letter').classList.remove('text-white'); // this is used for backspacing
    activeLetterElement?.querySelector('#cursor').classList.remove('hidden');
    nextElement?.querySelector('#cursor').classList.add('hidden'); // this is used for backspacing

    if (activeLineOffset === 0 && activeWordElement?.getBoundingClientRect().top) {
      updateTypingStats({
        activeLineOffset: activeWordElement?.getBoundingClientRect().top,
      });
    }
    
    if (activeLetterIndex > 0) {
      previousLetterElement = activeWordLetters[activeLetterIndex - 1];
    }

    previousLetterElement?.querySelector('#letter').classList.add('text-white');
    previousLetterElement?.querySelector('#cursor').classList.add('hidden');

    if (activeWordIndex > 0) {
      const clearStyleElement = wordElementsRef.current[activeWordIndex - 1];
      clearStyleElement?.classList.remove("bg-yellow-300", "text-slate-700");
      if (activeWordElement.getBoundingClientRect().top > activeLineOffset) {
        scrollWithNextLine();
        updateTypingStats({
          activeLineOffset: activeWordElement.getBoundingClientRect().top,
        });
      }
    }

    if (recentIncorrectIndex != null) {
      const redFlag = wordElementsRef.current[recentIncorrectIndex];
      redFlag?.classList.add("line-through");
      redFlag?.querySelectorAll<HTMLElement>("#letter-element").forEach((element: HTMLElement) => {
        element.querySelector(
          '#cursor'
        ).classList.add('hidden')
      });
    }

    if (incorrectLetterIndex != null) {
      const redLetter = activeWordLetters[incorrectLetterIndex];
      const letterEl = redLetter?.querySelector('#letter');
      letterEl?.classList.remove("text-white");
      letterEl?.classList.add("text-red-700");
      updateTypingStats({
        incorrectLetterIndex: null,
      });
    }
  }, [
    typingStats.activeWordIndex, typingStats.activeLetterIndex
  ]);

  const handleInputBlur = (_event: React.FocusEvent<HTMLDivElement>) => {
    const relatedTarget = _event.relatedTarget as HTMLElement | null;
    if (relatedTarget && relatedTarget?.id === "reset-stats-btn") {
      _event.preventDefault();
      return;
    }
    showFocusMePopUp();
  };

  const hideFocusMePopUp = () => {    
    clickMeFocusEl.current.classList.add("hidden");
  }

  const showFocusMePopUp = () => {
    clickMeFocusEl.current.classList.remove("hidden");
  }

  const onResetButtonMouseDown = (_event: React.MouseEvent<HTMLButtonElement>) => {
    _event.preventDefault();
  }

  const onFocusResetButton = (_event: React.FocusEvent<HTMLButtonElement>) => {
    showFocusMePopUp();
  }

  const onFocusTextInput = (_event: React.FocusEvent<HTMLInputElement>) => {
    hideFocusMePopUp();
  }

  const onParagraphClick = (_event: React.MouseEvent<HTMLDivElement>) => {
    _event.preventDefault();
    textInput.current?.focus();
  }

  const onParagraphMouseDown = (_event: React.MouseEvent<HTMLDivElement>) => {
    _event.preventDefault();
  }

  return (
    <>
      <div className="flex justify-center items-center flex-col w-full">
          <input
            className="h-0 w-0"
            id="input-text"
            placeholder={typingStats.activeWord}
            autoComplete="off"
            onChange={inputCapture}
            disabled={typingStats.inputDisabled}
            ref={textInput}
            onKeyDown={keyBoardHandler}
            onFocus={onFocusTextInput}
            onBlur={handleInputBlur}
          />
          <div
            ref={paragraphContainerRef}
            id="given-paragraph"
            onClick={onParagraphClick}
            onMouseDown={onParagraphMouseDown}
            className={`flex w-1/2 h-1/3 relative rounded-2xl p-4 bg-[#C5C5C5] font-bold text-slate-700 ${isEnlargedPill && "hidden"}`}
          >
            <div id="scrolling-div" className="overflow-hidden">
              <div
                id="click-me"
                ref={clickMeFocusEl}
                className="absolute justify-center rounded-2xl items-center h-full w-full flex hidden font-bold text-slate-50 bg-[#525252]/[.85] m-[-1rem]"
              >
                <span className="text-xl">Out of Focus! Click here or press any key to return</span>
              </div>

              {
                <div id="text-container" className="flex flex-wrap pb-[1rem] text-2xl font-medium">
                    {paragraph.map((word, index) => {
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
          <div className={`flex w-1/2 justify-between mt-4 ${isEnlargedPill ? "flex-col" : "flex-row"}`}>
            <div className="flex flex-row justify-center">
              <StatsPill stat={typingStats.wpm} statImg={speedometer.src} unit={"wpm"} enlargedPill={isEnlargedPill} />
              <StatsPill stat={typingStats.accuracy} statImg={checkMark.src} unit={"%"} enlargedPill={isEnlargedPill} />
              <StatsPill stat={seconds} statImg={sandClock.src} unit={"sec"} enlargedPill={isEnlargedPill} />
            </div>
            <Link href="/">
              <button
                className="self-center"
                onClick={resetStats}
                id="reset-stats-btn"
                onMouseDown={onResetButtonMouseDown}
                onFocus={onFocusResetButton}
                >
                <img
                  className="p-2 rounded-lg hover:bg-[#D8D8D8] focus:bg-[#D8D8D8]"
                  src={refreshing.src}
                  alt="refresh button"
                  />
              </button>
            </Link>
          </div>
      </div>
    </>
  )
};

export default Paragraphs;
