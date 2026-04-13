"use client";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../types/types";
import { loadWords, refreshWords } from "../redux/paragraph";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { calculateCPM } from "../utils/calculateCPM";
import { calculateWPM } from "../utils/calculateWPM";
import { calculateAccuracy } from "../utils/calculateAccuracy";
import useTimer from "../utils/hooks/useTimer";
import CapsLockAlert from "./CapsLockAlert";
import ResultCard from "./ResultCard";

// Per-letter state for React-driven styling (replaces DOM manipulation)
type LetterState = "idle" | "correct" | "incorrect" | "active";

interface WordState {
  letters: LetterState[];
  isWrong: boolean; // word submitted with error
}

function buildWordStates(words: string[]): WordState[] {
  return words.map((w) => ({
    letters: Array(w.length).fill("idle") as LetterState[],
    isWrong: false,
  }));
}

const LETTER_CLASSES: Record<LetterState, string> = {
  idle: "text-slate-600 opacity-70",
  correct: "text-slate-100",
  incorrect: "text-red-400",
  active: "text-slate-100",
};

const TypingTest = () => {
  const words = useSelector((state: RootState) => state.paragraph.wordsCollection);
  const dispatch = useDispatch<AppDispatch>();

  const [timeLimit, setTimeLimit] = useState(60);

  // Load words on first mount
  useEffect(() => {
    dispatch(loadWords({ count: 300 }));
  }, [dispatch]);

  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [activeLetterIndex, setActiveLetterIndex] = useState(0);
  const [wordStates, setWordStates] = useState<WordState[]>([]);
  const [wordsMatched, setWordsMatched] = useState(0);
  const [wordsIncorrect, setWordsIncorrect] = useState(0);
  const [charsMatched, setCharsMatched] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const [finalStats, setFinalStats] = useState({ wpm: 0, cpm: 0, accuracy: 0 });
  const cursorRef = useRef<HTMLDivElement>(null);
  const prevTopRef = useRef<number | null>(null);

  const textInput = useRef<HTMLInputElement>(null);
  const wordRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeLineOffsetRef = useRef<number>(0);

  const { seconds, start, reset } = useTimer(timeLimit);

  // Rebuild word states whenever the word list changes
  useEffect(() => {
    if (words.length > 0) {
      setWordStates(buildWordStates(words));
      wordRefs.current = new Array(words.length).fill(null);
      setActiveWordIndex(0);
      setActiveLetterIndex(0);
      setWordsMatched(0);
      setWordsIncorrect(0);
      setCharsMatched(0);
      setIsStarted(false);
      setIsFinished(false);
      activeLineOffsetRef.current = 0;
      textInput.current?.focus();
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
  }, [words]);

  // Computed stats
  const wpm = calculateWPM(charsMatched, seconds, timeLimit);
  const cpm = calculateCPM(charsMatched, seconds, timeLimit);
  const accuracy = calculateAccuracy(wordsIncorrect, wordsMatched);

  // Game over when timer reaches 0
  useEffect(() => {
    if (seconds === 0 && isStarted) {
      setIsFinished(true);
      setIsStarted(false);
      setFinalStats({ wpm, cpm, accuracy });
    }
  }, [seconds, isStarted, timeLimit, wpm, cpm, accuracy]);

  // Smooth Cursor tracking via direct DOM for zero-frame delay
  useLayoutEffect(() => {
    const el = document.getElementById("active-character");
    const cursor = cursorRef.current;
    if (el && cursor) {
      const top = el.offsetTop + 4;
      const left = el.offsetLeft;

      // Disable transition purely on line wraps to prevent diagonal flying
      if (prevTopRef.current !== null && Math.abs(prevTopRef.current - top) > 10) {
        cursor.style.transition = "none";
      } else {
        cursor.style.transition = "left 0.08s ease-out, top 0.08s ease-out";
      }

      cursor.style.top = `${top}px`;
      cursor.style.left = `${left}px`;
      
      prevTopRef.current = top;
    }
  }, [activeWordIndex, activeLetterIndex, words, isFocused, isFinished]);

  // Auto-scroll: when active word crosses to a new line, scroll down
  useEffect(() => {
    const activeEl = wordRefs.current[activeWordIndex];
    if (!activeEl) return;
    const top = activeEl.offsetTop; 
    if (activeLineOffsetRef.current === 0) {
      activeLineOffsetRef.current = top;
    } else if (top > activeLineOffsetRef.current) {
      scrollRef.current?.scrollBy({ top: 40, behavior: "smooth" });
      activeLineOffsetRef.current = top;
    }
  }, [activeWordIndex]);

  const resetTest = useCallback(() => {
    reset(timeLimit);
    dispatch(refreshWords());
  }, [reset, dispatch, timeLimit]);

  // Re-run timer reset if timeLimit UI button clicked
  const handleTimeChange = (newTime: number) => {
    setTimeLimit(newTime);
    reset(newTime);
    dispatch(refreshWords());
    textInput.current?.focus();
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    setIsCapsLockOn(e.getModifierState("CapsLock"));

    if (e.ctrlKey || e.altKey || e.metaKey || ["Tab", "CapsLock"].includes(e.key)) return;

    if (words.length === 0 || isFinished) return;

    if (!isStarted) {
      setIsStarted(true);
      start();
    }

    if (e.key === "Backspace") {
      if (activeLetterIndex === 0) return;
      const newIdx = activeLetterIndex - 1;
      setWordStates((prev) => {
        const next = prev.map((w) => ({ ...w, letters: [...w.letters] }));
        next[activeWordIndex].letters[newIdx] = "idle";
        return next;
      });
      setActiveLetterIndex(newIdx);
      return;
    }

    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      if (activeLetterIndex === 0) return; // prevent skipping words

      const typedWord = textInput.current?.value.trim() ?? "";
      const targetWord = words[activeWordIndex] ?? "";
      const isCorrect = typedWord === targetWord;

      if (isCorrect) {
        setWordsMatched((n) => n + 1);
        setCharsMatched((n) => n + typedWord.length);
      } else {
        setWordsIncorrect((n) => n + 1);
        // Mark remaining untyped letters of current word as incorrect
        setWordStates((prev) => {
          const next = prev.map((w) => ({ ...w, letters: [...w.letters] }));
          next[activeWordIndex].isWrong = true;
          return next;
        });
      }

      if (textInput.current) textInput.current.value = "";
      setActiveLetterIndex(0);
      setActiveWordIndex((i) => i + 1);
      return;
    }

    // Regular printable character (length===1 guards modifiers)
    if (e.key.length !== 1) return;

    const targetWord = words[activeWordIndex] ?? "";
    const letterState: LetterState = e.key === targetWord[activeLetterIndex] ? "correct" : "incorrect";

    setWordStates((prev) => {
      const next = prev.map((w) => ({ ...w, letters: [...w.letters] }));
      if (next[activeWordIndex] && activeLetterIndex < targetWord.length) {
        next[activeWordIndex].letters[activeLetterIndex] = letterState;
      }
      return next;
    });
    setActiveLetterIndex((i) => i + 1);
  }, [words, isStarted, isFinished, activeWordIndex, activeLetterIndex, start]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // just keep controlled value updated — logic is in handleKeyDown
    e.preventDefault();
  }, []);

  const handleSelect = useCallback((e: React.UIEvent<HTMLInputElement>) => {
    const el = e.target as HTMLInputElement;
    el.setSelectionRange(el.value.length, el.value.length);
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const relTarget = e.relatedTarget as HTMLElement | null;
    if (relTarget?.id === "reset-btn" || relTarget?.dataset.timerBtn) return; // don't blur when clicking reset
    setIsFocused(false);
  }, []);

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    textInput.current?.focus();
    setIsFocused(true);
  }, []);

  const handleContainerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  if (isFinished) {
    return (
      <ResultCard
        wpm={finalStats.wpm}
        cpm={finalStats.cpm}
        accuracy={finalStats.accuracy}
        onReset={resetTest}
      />
    );
  }

  // Timer selections UI
  const TimerOptions = () => (
    <div className="flex bg-white/5 rounded-lg p-1 text-sm font-medium border border-white/5">
      {[15, 30, 45, 60].map((t) => (
        <button
          key={t}
          data-timer-btn="true"
          onClick={() => handleTimeChange(t)}
          className={`px-3 py-1 rounded-md transition-colors duration-200 ${
            timeLimit === t ? "bg-[#FFD523] text-black" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
          }`}
        >
          {t}s
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full max-w-4xl gap-6 relative">
      <input
        ref={textInput}
        className="absolute w-0 h-0 opacity-0 pointer-events-none"
        id="typing-input"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        onKeyDown={handleKeyDown}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        onSelect={handleSelect}
        type="text"
        aria-label="Typing input"
      />

      <div className="flex items-center justify-between w-full h-8 px-1">
        <CapsLockAlert isVisible={isCapsLockOn} />
        {!isStarted && <div className="ml-auto flex items-center gap-4 text-slate-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg> <TimerOptions /></div>}
      </div>

      <div className="flex w-full justify-between items-end px-1 mb-2">
        <div className="flex gap-8">
          <Stat label="WPM" value={isStarted ? wpm : 0} />
          <Stat label="CPM" value={isStarted ? cpm : 0} />
          <Stat label="ACC" value={isStarted ? accuracy : 100} unit="%" />
        </div>
        <div className={`text-5xl font-mono tracking-tighter font-semibold transition-colors duration-300 opacity-90 ${seconds <= 5 ? "text-red-400" : "text-[#FFD523]"}`}>
          {seconds}
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full cursor-text overflow-hidden p-1"
        onClick={handleContainerClick}
        onMouseDown={handleContainerMouseDown}
        role="button"
        tabIndex={-1}
        aria-label="Typing area"
      >
        {!isFocused && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-transparent backdrop-blur-[2px]">
            <span className="text-white bg-slate-900/80 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
               </svg>
               Click to focus
            </span>
          </div>
        )}

        <div ref={scrollRef} className="relative overflow-hidden h-40 border-l-2 border-transparent">
          <div className="relative flex flex-wrap gap-x-[0.4em] gap-y-2 text-3xl font-medium tracking-wide leading-relaxed select-none">
            
            {isFocused && words.length > 0 && !isFinished && (
               <div 
                 ref={cursorRef}
                 className="absolute bg-[#FFD523] w-[2.5px] rounded-full z-10"
                 style={{ height: "1.35em" }}
               />
            )}

            {words.map((word, wi) => {
              const ws = wordStates[wi];
              const isActive = wi === activeWordIndex;
              return (
                <div
                  key={wi}
                  ref={(el) => { wordRefs.current[wi] = el; }}
                  className={`flex whitespace-pre ${ws?.isWrong ? "underline decoration-red-500/50 decoration-2 underline-offset-4" : ""}`}
                  aria-label={word}
                >
                  {word.split("").map((letter, li) => {
                    const state: LetterState = ws?.letters[li] ?? "idle";
                    const isActiveLetter = isActive && li === activeLetterIndex;
                    return (
                      <span 
                        key={li} 
                        id={isActiveLetter ? "active-character" : undefined}
                        className={`${LETTER_CLASSES[state]} transition-colors duration-200`}
                      >
                        {letter}
                      </span>
                    );
                  })}
                  <span 
                    id={isActive && activeLetterIndex >= word.length ? "active-character" : undefined}
                    className="w-[0.4em]"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <button
        id="reset-btn"
        onClick={resetTest}
        onMouseDown={(e) => e.preventDefault()}
        className="flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
        aria-label="Restart test"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Restart Test
      </button>
    </div>
  );
};

const Stat = ({ label, value, unit = "" }: { label: string; value: number; unit?: string }) => (
  <div className="flex flex-col items-start leading-none opacity-90">
    <span className="text-3xl font-semibold tabular-nums text-white/90">{value}{unit}</span>
    <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest mt-1.5">{label}</span>
  </div>
);

export default TypingTest;
